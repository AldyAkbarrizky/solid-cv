import { eq } from "drizzle-orm";

import { db } from "@/db";
import { paymentOrders } from "@/db/schema";
import { checkDuitkuTransactionStatus } from "@/lib/billing/duitku";
import { getBillingPlan } from "@/lib/billing/plans";
import { upsertUserEntitlement } from "@/lib/quota/entitlements";

type SyncPaymentResult = {
  orderId: string;
  merchantOrderId: string;
  previousStatus: string;
  currentStatus: string;
  duitkuStatusCode?: string;
  duitkuStatusMessage?: string;
};

export async function syncPaymentOrderWithDuitku(
  merchantOrderId: string,
): Promise<SyncPaymentResult> {
  const [order] = await db
    .select()
    .from(paymentOrders)
    .where(eq(paymentOrders.merchantOrderId, merchantOrderId))
    .limit(1);

  if (!order) {
    throw new Error("Payment order tidak ditemukan.");
  }

  const transactionStatus = await checkDuitkuTransactionStatus(merchantOrderId);

  const statusCode = transactionStatus.statusCode;
  const statusMessage = transactionStatus.statusMessage;
  const reference = transactionStatus.reference || order.duitkuReference;

  if (statusCode === "00") {
    const plan = getBillingPlan(order.planCode);

    if (!plan) {
      throw new Error("Plan tidak ditemukan.");
    }

    if (order.status !== "paid") {
      await db
        .update(paymentOrders)
        .set({
          status: "paid",
          duitkuReference: reference,
          resultCode: statusCode,
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
    } else {
      await db
        .update(paymentOrders)
        .set({
          duitkuReference: reference,
          resultCode: statusCode,
          updatedAt: new Date(),
        })
        .where(eq(paymentOrders.id, order.id));
    }

    return {
      orderId: order.id,
      merchantOrderId,
      previousStatus: order.status,
      currentStatus: "paid",
      duitkuStatusCode: statusCode,
      duitkuStatusMessage: statusMessage,
    };
  }

  if (statusCode === "01" || statusCode === "02") {
    const nextStatus = statusCode === "01" ? "failed" : "cancelled";

    if (order.status !== "paid") {
      await db
        .update(paymentOrders)
        .set({
          status: nextStatus,
          duitkuReference: reference,
          resultCode: statusCode,
          updatedAt: new Date(),
        })
        .where(eq(paymentOrders.id, order.id));
    }

    return {
      orderId: order.id,
      merchantOrderId,
      previousStatus: order.status,
      currentStatus: order.status === "paid" ? "paid" : nextStatus,
      duitkuStatusCode: statusCode,
      duitkuStatusMessage: statusMessage,
    };
  }

  await db
    .update(paymentOrders)
    .set({
      duitkuReference: reference,
      resultCode: statusCode,
      updatedAt: new Date(),
    })
    .where(eq(paymentOrders.id, order.id));

  return {
    orderId: order.id,
    merchantOrderId,
    previousStatus: order.status,
    currentStatus: order.status,
    duitkuStatusCode: statusCode,
    duitkuStatusMessage: statusMessage,
  };
}
