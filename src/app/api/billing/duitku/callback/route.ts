import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { paymentOrders } from "@/db/schema";
import { createDuitkuCallbackSignature } from "@/lib/billing/duitku";
import { getBillingPlan } from "@/lib/billing/plans";
import { upsertUserEntitlement } from "@/lib/quota/entitlements";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getRequiredFormValue(formData: FormData, key: string) {
  const value = formData.get(key);

  if (typeof value !== "string" || !value) {
    throw new Error(`Missing callback parameter: ${key}`);
  }

  return value;
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const merchantCode = getRequiredFormValue(formData, "merchantCode");
    const amount = getRequiredFormValue(formData, "amount");
    const merchantOrderId = getRequiredFormValue(formData, "merchantOrderId");
    const resultCode = getRequiredFormValue(formData, "resultCode");
    const reference = getRequiredFormValue(formData, "reference");
    const signature = getRequiredFormValue(formData, "signature");

    const expectedSignature = createDuitkuCallbackSignature({
      merchantCode,
      amount,
      merchantOrderId,
    });

    if (signature !== expectedSignature) {
      console.error("DUITKU_CALLBACK_BAD_SIGNATURE", {
        merchantOrderId,
      });

      return NextResponse.json({ message: "Bad signature" }, { status: 400 });
    }

    const [order] = await db
      .select()
      .from(paymentOrders)
      .where(eq(paymentOrders.merchantOrderId, merchantOrderId))
      .limit(1);

    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    if (Number(amount) !== order.amount) {
      console.error("DUITKU_CALLBACK_AMOUNT_MISMATCH", {
        merchantOrderId,
        callbackAmount: amount,
        orderAmount: order.amount,
      });

      return NextResponse.json({ message: "Amount mismatch" }, { status: 400 });
    }

    if (order.status === "paid") {
      return NextResponse.json({ message: "OK" });
    }

    if (resultCode === "00") {
      const plan = getBillingPlan(order.planCode);

      if (!plan) {
        return NextResponse.json(
          { message: "Plan not found" },
          { status: 400 },
        );
      }

      await db
        .update(paymentOrders)
        .set({
          status: "paid",
          duitkuReference: reference,
          resultCode,
          paidAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(paymentOrders.id, order.id));

      await upsertUserEntitlement({
        userId: order.userId,
        planCode: plan.code,
        reviewQuotaLimit: plan.reviewQuotaLimit,
        activeDays: plan.activeDays,
      });

      return NextResponse.json({ message: "OK" });
    }

    await db
      .update(paymentOrders)
      .set({
        status: "failed",
        duitkuReference: reference,
        resultCode,
        updatedAt: new Date(),
      })
      .where(eq(paymentOrders.id, order.id));

    return NextResponse.json({ message: "OK" });
  } catch (error) {
    console.error("DUITKU_CALLBACK_ERROR", {
      message: error instanceof Error ? error.message : "Unknown error",
    });

    return NextResponse.json({ message: "Callback failed" }, { status: 500 });
  }
}
