import { NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@/db";
import { paymentOrders } from "@/db/schema";
import { createDuitkuInvoice } from "@/lib/billing/duitku";
import { getBillingPlan } from "@/lib/billing/plans";
import { getCurrentUser } from "@/lib/session";
import { eq } from "drizzle-orm";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const checkoutSchema = z.object({
  planCode: z.string().min(1),
});

function createMerchantOrderId(userId: string) {
  const timestamp = Date.now();
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();

  return `SCV-${userId}-${timestamp}-${random}`.slice(0, 50);
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { message: "Anda perlu login sebelum membeli paket." },
        { status: 401 },
      );
    }

    if (!user.email) {
      return NextResponse.json(
        { message: "Email user tidak ditemukan." },
        { status: 400 },
      );
    }

    const body = await request.json();
    const parsed = checkoutSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: "Plan tidak valid." },
        { status: 400 },
      );
    }

    const plan = getBillingPlan(parsed.data.planCode);

    if (!plan) {
      return NextResponse.json(
        { message: "Plan tidak ditemukan." },
        { status: 404 },
      );
    }

    const appUrl = process.env.APP_URL || "http://localhost:3000";
    const merchantOrderId = createMerchantOrderId(user.id);
    const expiredAt = new Date(Date.now() + 60 * 60 * 1000);

    const [order] = await db
      .insert(paymentOrders)
      .values({
        userId: user.id,
        planCode: plan.code,
        merchantOrderId,
        amount: plan.price,
        reviewQuotaLimit: plan.reviewQuotaLimit,
        status: "pending",
        expiredAt,
      })
      .returning();

    const invoice = await createDuitkuInvoice({
      merchantOrderId,
      paymentAmount: plan.price,
      productDetails: `Solid CV ${plan.name}`,
      email: user.email,
      customerName: user.name || user.email,
      callbackUrl: `${appUrl}/api/billing/duitku/callback`,
      returnUrl: `${appUrl}/billing/return?orderId=${order.id}`,
      expiryPeriod: 60,
      itemDetails: [
        {
          name: `Solid CV ${plan.name}`,
          price: plan.price,
          quantity: 1,
        },
      ],
    });

    await db
      .update(paymentOrders)
      .set({
        duitkuReference: invoice.reference,
        paymentUrl: invoice.paymentUrl,
        updatedAt: new Date(),
      })
      .where(eq(paymentOrders.id, order.id));

    return NextResponse.json({
      orderId: order.id,
      merchantOrderId,
      paymentUrl: invoice.paymentUrl,
    });
  } catch (error) {
    console.error("CHECKOUT_ERROR", {
      message: error instanceof Error ? error.message : "Unknown error",
    });

    return NextResponse.json(
      { message: "Gagal membuat transaksi pembayaran." },
      { status: 500 },
    );
  }
}
