import Link from "next/link";
import { notFound } from "next/navigation";
import { and, desc, eq } from "drizzle-orm";
import {
  ArrowLeft,
  CalendarClock,
  CreditCard,
  ExternalLink,
  FileText,
  Hash,
  User,
  WalletCards,
} from "lucide-react";

import { CheckPaymentStatusButton } from "../../check-payment-status-button";
import { SiteHeader } from "@/components/layout/site-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { db } from "@/db";
import {
  cvReviews,
  paymentOrders,
  reviewUsageEvents,
  userEntitlements,
  adminAuditLogs,
} from "@/db/schema";
import { getCurrentAdminUser } from "@/lib/admin";
import { Metadata } from "next";

type AdminPaymentDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export const metadata: Metadata = {
  title: "Payment Detail - Solid CV Admin",
  robots: {
    index: false,
    follow: false,
  },
};

function formatDate(value: Date | null) {
  if (!value) return "-";

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

function getPaymentStatusBadge(status: string) {
  if (status === "paid") {
    return "border-emerald-200 bg-emerald-100 text-emerald-700 hover:bg-emerald-100";
  }

  if (status === "pending") {
    return "border-amber-200 bg-amber-100 text-amber-700 hover:bg-amber-100";
  }

  if (status === "failed") {
    return "border-rose-200 bg-rose-100 text-rose-700 hover:bg-rose-100";
  }

  if (status === "cancelled") {
    return "border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-100";
  }

  return "border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-100";
}

function DetailItem({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string | number | null | undefined;
  mono?: boolean;
}) {
  return (
    <div className="rounded-lg border bg-slate-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
        {label}
      </p>
      <p
        className={`mt-2 break-all text-sm text-slate-800 ${
          mono ? "font-mono" : "font-medium"
        }`}
      >
        {value || "-"}
      </p>
    </div>
  );
}

export default async function AdminPaymentDetailPage({
  params,
}: AdminPaymentDetailPageProps) {
  const admin = await getCurrentAdminUser();

  if (!admin) {
    notFound();
  }

  const { id } = await params;

  const [order] = await db
    .select()
    .from(paymentOrders)
    .where(eq(paymentOrders.id, id))
    .limit(1);

  if (!order) {
    notFound();
  }

  const [activeEntitlement] = await db
    .select()
    .from(userEntitlements)
    .where(
      and(
        eq(userEntitlements.userId, order.userId),
        eq(userEntitlements.status, "active"),
      ),
    )
    .limit(1);

  const latestUserReviews = await db
    .select()
    .from(cvReviews)
    .where(eq(cvReviews.userId, order.userId))
    .orderBy(desc(cvReviews.createdAt))
    .limit(5);

  const latestUsageEvents = await db
    .select()
    .from(reviewUsageEvents)
    .where(eq(reviewUsageEvents.userId, order.userId))
    .orderBy(desc(reviewUsageEvents.createdAt))
    .limit(10);

  const paymentAuditLogs = await db
    .select()
    .from(adminAuditLogs)
    .where(
      and(
        eq(adminAuditLogs.entityType, "payment_order"),
        eq(adminAuditLogs.entityId, order.id),
      ),
    )
    .orderBy(desc(adminAuditLogs.createdAt))
    .limit(20);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <SiteHeader backHref="/admin" backLabel="Admin" />

      <section className="mx-auto w-full max-w-6xl px-5 py-10 md:py-14">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-sm font-medium text-primary">
              Admin / Payment Detail
            </p>

            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 md:text-4xl">
              Detail Payment Order
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
              Halaman ini digunakan untuk membaca detail transaksi dan melakukan
              sinkronisasi status dengan Duitku. Tidak ada perubahan status
              manual di halaman ini.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline" className="bg-white">
              <Link href="/admin">
                <ArrowLeft className="mr-1.5 h-4 w-4" />
                Kembali
              </Link>
            </Button>

            <CheckPaymentStatusButton paymentOrderId={order.id} />
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-4">
          <Card className="bg-white shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm font-medium text-slate-600">Status</p>
                <CreditCard className="h-5 w-5 text-primary" />
              </div>
              <Badge
                variant="outline"
                className={`mt-4 ${getPaymentStatusBadge(order.status)}`}
              >
                {order.status}
              </Badge>
              <p className="mt-3 text-xs text-muted-foreground">
                Result code: {order.resultCode || "-"}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm font-medium text-slate-600">Amount</p>
                <WalletCards className="h-5 w-5 text-primary" />
              </div>
              <p className="mt-3 text-2xl font-semibold text-slate-950">
                {formatCurrency(order.amount)}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Plan {order.planCode}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm font-medium text-slate-600">Quota</p>
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <p className="mt-3 text-2xl font-semibold text-slate-950">
                {order.reviewQuotaLimit}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Review quota from order
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm font-medium text-slate-600">Paid At</p>
                <CalendarClock className="h-5 w-5 text-primary" />
              </div>
              <p className="mt-3 text-sm font-semibold leading-6 text-slate-950">
                {formatDate(order.paidAt)}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Created {formatDate(order.createdAt)}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <Card className="bg-white shadow-sm">
            <CardContent className="p-0">
              <div className="border-b p-5">
                <div className="flex items-center gap-2">
                  <Hash className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-semibold text-slate-950">
                    Order Information
                  </h2>
                </div>
                <p className="mt-1 text-sm text-slate-600">
                  Identitas transaksi internal dan reference dari Duitku.
                </p>
              </div>

              <div className="grid gap-4 p-5 md:grid-cols-2">
                <DetailItem label="Order ID" value={order.id} mono />
                <DetailItem
                  label="Merchant Order ID"
                  value={order.merchantOrderId}
                  mono
                />
                <DetailItem
                  label="Duitku Reference"
                  value={order.duitkuReference}
                  mono
                />
                <DetailItem label="Payment Code" value={order.paymentCode} />
                <DetailItem label="Plan Code" value={order.planCode} />
                <DetailItem
                  label="Review Quota Limit"
                  value={order.reviewQuotaLimit}
                />
                <DetailItem
                  label="Expired At"
                  value={formatDate(order.expiredAt)}
                />
                <DetailItem
                  label="Updated At"
                  value={formatDate(order.updatedAt)}
                />
              </div>

              {order.paymentUrl && (
                <div className="border-t p-5">
                  <Button asChild variant="outline" className="bg-white">
                    <a href={order.paymentUrl} target="_blank" rel="noreferrer">
                      <ExternalLink className="mr-1.5 h-4 w-4" />
                      Buka Payment URL
                    </a>
                  </Button>

                  <p className="mt-3 break-all text-xs leading-5 text-muted-foreground">
                    {order.paymentUrl}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm">
            <CardContent className="p-0">
              <div className="border-b p-5">
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-semibold text-slate-950">
                    User & Entitlement
                  </h2>
                </div>
                <p className="mt-1 text-sm text-slate-600">
                  Informasi user terkait order ini.
                </p>
              </div>

              <div className="space-y-4 p-5">
                <DetailItem label="User ID" value={order.userId} mono />

                {activeEntitlement ? (
                  <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-emerald-700">
                      Active Entitlement
                    </p>
                    <p className="mt-2 text-lg font-semibold uppercase text-slate-950">
                      {activeEntitlement.planCode}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-700">
                      Quota {activeEntitlement.reviewQuotaLimit} review ·
                      berlaku sampai{" "}
                      {formatDate(activeEntitlement.currentPeriodEnd)}
                    </p>
                  </div>
                ) : (
                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                    <p className="text-sm leading-6 text-amber-800">
                      User belum memiliki entitlement aktif.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <Card className="bg-white shadow-sm">
            <CardContent className="p-0">
              <div className="border-b p-5">
                <h2 className="text-xl font-semibold text-slate-950">
                  Review Terbaru User
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  Metadata review saja, bukan raw CV text.
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-155 text-sm">
                  <thead className="border-b bg-slate-50 text-left text-xs uppercase tracking-[0.12em] text-slate-500">
                    <tr>
                      <th className="px-5 py-3">Review</th>
                      <th className="px-5 py-3">Target Role</th>
                      <th className="px-5 py-3">Score</th>
                      <th className="px-5 py-3">Created</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {latestUserReviews.map((review) => (
                      <tr key={review.id}>
                        <td className="px-5 py-4">
                          <Link
                            href={`/review/${review.id}`}
                            className="font-medium text-primary hover:underline"
                          >
                            Buka
                          </Link>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {review.id}
                          </p>
                        </td>
                        <td className="px-5 py-4 text-slate-600">
                          {review.targetRole}
                        </td>
                        <td className="px-5 py-4 font-medium text-slate-950">
                          {review.overallScore}/100
                        </td>
                        <td className="px-5 py-4 text-slate-600">
                          {formatDate(review.createdAt)}
                        </td>
                      </tr>
                    ))}

                    {latestUserReviews.length === 0 && (
                      <tr>
                        <td
                          colSpan={4}
                          className="px-5 py-8 text-center text-slate-500"
                        >
                          User belum memiliki review.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm">
            <CardContent className="p-0">
              <div className="border-b p-5">
                <h2 className="text-xl font-semibold text-slate-950">
                  Usage Events Terbaru
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  Catatan pemakaian quota review.
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-140 text-sm">
                  <thead className="border-b bg-slate-50 text-left text-xs uppercase tracking-[0.12em] text-slate-500">
                    <tr>
                      <th className="px-5 py-3">Scope</th>
                      <th className="px-5 py-3">Plan</th>
                      <th className="px-5 py-3">Review ID</th>
                      <th className="px-5 py-3">Created</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {latestUsageEvents.map((event) => (
                      <tr key={event.id}>
                        <td className="px-5 py-4 text-slate-600">
                          {event.scope}
                        </td>
                        <td className="px-5 py-4 text-slate-600">
                          {event.planCode}
                        </td>
                        <td className="px-5 py-4 text-slate-600">
                          <span className="break-all">
                            {event.reviewId || "-"}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-slate-600">
                          {formatDate(event.createdAt)}
                        </td>
                      </tr>
                    ))}

                    {latestUsageEvents.length === 0 && (
                      <tr>
                        <td
                          colSpan={4}
                          className="px-5 py-8 text-center text-slate-500"
                        >
                          Belum ada usage event untuk user ini.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6 bg-white shadow-sm">
          <CardContent className="p-0">
            <div className="border-b p-5">
              <h2 className="text-xl font-semibold text-slate-950">
                Audit Log Payment Ini
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Catatan aktivitas admin terkait payment order ini.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-215 text-sm">
                <thead className="border-b bg-slate-50 text-left text-xs uppercase tracking-[0.12em] text-slate-500">
                  <tr>
                    <th className="px-5 py-3">Time</th>
                    <th className="px-5 py-3">Admin</th>
                    <th className="px-5 py-3">Action</th>
                    <th className="px-5 py-3">Metadata</th>
                  </tr>
                </thead>

                <tbody className="divide-y">
                  {paymentAuditLogs.map((log) => (
                    <tr key={log.id}>
                      <td className="px-5 py-4 text-slate-600">
                        {formatDate(log.createdAt)}
                      </td>

                      <td className="px-5 py-4">
                        <p className="font-medium text-slate-950">
                          {log.adminEmail}
                        </p>
                        <p className="mt-1 break-all text-xs text-muted-foreground">
                          {log.adminUserId}
                        </p>
                      </td>

                      <td className="px-5 py-4 font-medium text-slate-950">
                        {log.action}
                      </td>

                      <td className="px-5 py-4">
                        <pre className="max-w-105 overflow-x-auto rounded-md bg-slate-50 p-3 text-xs leading-5 text-slate-700">
                          {JSON.stringify(log.metadata, null, 2)}
                        </pre>
                      </td>
                    </tr>
                  ))}

                  {paymentAuditLogs.length === 0 && (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-5 py-8 text-center text-slate-500"
                      >
                        Belum ada audit log untuk payment ini.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
