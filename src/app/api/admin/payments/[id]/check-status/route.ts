import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { paymentOrders } from "@/db/schema";
import { getCurrentAdminUser } from "@/lib/admin";
import { syncPaymentOrderWithDuitku } from "@/lib/billing/payment-sync";
import { writeAdminAuditLog } from "@/lib/admin-audit";
import { captureError } from "@/lib/observability";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type CheckStatusRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(
  _request: Request,
  context: CheckStatusRouteContext,
) {
  try {
    const admin = await getCurrentAdminUser();

    if (!admin) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }

    const { id } = await context.params;

    const [order] = await db
      .select()
      .from(paymentOrders)
      .where(eq(paymentOrders.id, id))
      .limit(1);

    if (!order) {
      return NextResponse.json(
        { message: "Payment order tidak ditemukan." },
        { status: 404 },
      );
    }

    const result = await syncPaymentOrderWithDuitku(order.merchantOrderId);

    await writeAdminAuditLog({
      adminUserId: admin.id,
      adminEmail: admin.email || "unknown",
      action: "payment.check_duitku_status",
      entityType: "payment_order",
      entityId: order.id,
      metadata: {
        merchantOrderId: order.merchantOrderId,
        previousStatus: result.previousStatus,
        currentStatus: result.currentStatus,
        duitkuStatusCode: result.duitkuStatusCode,
        duitkuStatusMessage: result.duitkuStatusMessage,
      },
    });

    return NextResponse.json({
      message: "Status pembayaran berhasil diperbarui.",
      result,
    });
  } catch (error) {
    captureError("ADMIN_CHECK_PAYMENT_STATUS_ERROR", error);

    return NextResponse.json(
      { message: "Gagal mengecek status pembayaran." },
      { status: 500 },
    );
  }
}
