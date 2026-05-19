import Link from "next/link";
import { notFound } from "next/navigation";
import { desc, sql } from "drizzle-orm";
import {
  CreditCard,
  FileText,
  ShieldCheck,
  Users,
  WalletCards,
} from "lucide-react";

import { SiteHeader } from "@/components/layout/site-header";
import { Badge } from "@/components/ui/badge";
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
import { CheckPaymentStatusButton } from "./check-payment-status-button";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin - Solid CV",
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

  return "border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-100";
}

export default async function AdminPage() {
  const admin = await getCurrentAdminUser();

  if (!admin) {
    notFound();
  }

  const [
    paymentSummary,
    reviewSummary,
    entitlementSummary,
    usageSummary,
    latestPayments,
    latestEntitlements,
    latestReviews,
    latestAuditLogs,
  ] = await Promise.all([
    db
      .select({
        total: sql<number>`count(*)::int`,
        paid: sql<number>`count(*) filter (where status = 'paid')::int`,
        pending: sql<number>`count(*) filter (where status = 'pending')::int`,
        failed: sql<number>`count(*) filter (where status = 'failed')::int`,
        paidAmount: sql<number>`coalesce(sum(amount) filter (where status = 'paid'), 0)::int`,
      })
      .from(paymentOrders),

    db
      .select({
        total: sql<number>`count(*)::int`,
        avgScore: sql<number>`coalesce(round(avg(overall_score)), 0)::int`,
      })
      .from(cvReviews),

    db
      .select({
        active: sql<number>`count(*) filter (where status = 'active')::int`,
        paidActive: sql<number>`count(*) filter (where status = 'active' and plan_code like 'paid_%')::int`,
        betaActive: sql<number>`count(*) filter (where status = 'active' and plan_code = 'beta')::int`,
      })
      .from(userEntitlements),

    db
      .select({
        totalUsage: sql<number>`count(*)::int`,
        guestUsage: sql<number>`count(*) filter (where scope = 'guest')::int`,
        userUsage: sql<number>`count(*) filter (where scope = 'user')::int`,
      })
      .from(reviewUsageEvents),

    db
      .select()
      .from(paymentOrders)
      .orderBy(desc(paymentOrders.createdAt))
      .limit(10),

    db
      .select()
      .from(userEntitlements)
      .orderBy(desc(userEntitlements.updatedAt))
      .limit(10),

    db.select().from(cvReviews).orderBy(desc(cvReviews.createdAt)).limit(10),

    db
      .select()
      .from(adminAuditLogs)
      .orderBy(desc(adminAuditLogs.createdAt))
      .limit(20),
  ]);

  const paymentStats = paymentSummary[0];
  const reviewStats = reviewSummary[0];
  const entitlementStats = entitlementSummary[0];
  const usageStats = usageSummary[0];

  return (
    <main className="min-h-screen bg-background text-foreground">
      <SiteHeader backHref="/review" backLabel="Review CV" />

      <section className="mx-auto w-full max-w-6xl px-5 py-10 md:py-14">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-medium text-primary">Admin</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 md:text-4xl">
              Solid CV Admin Lite
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Masuk sebagai admin: {admin.email}
            </p>
          </div>

          <Badge variant="outline" className="w-fit bg-white">
            Read-only mode
          </Badge>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-4">
          <Card className="bg-white shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm font-medium text-slate-600">
                  Paid Revenue
                </p>
                <WalletCards className="h-5 w-5 text-primary" />
              </div>
              <p className="mt-3 text-2xl font-semibold text-slate-950">
                {formatCurrency(paymentStats?.paidAmount || 0)}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Sandbox/production sesuai env aktif.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm font-medium text-slate-600">
                  Payment Orders
                </p>
                <CreditCard className="h-5 w-5 text-primary" />
              </div>
              <p className="mt-3 text-2xl font-semibold text-slate-950">
                {paymentStats?.total || 0}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Paid {paymentStats?.paid || 0} · Pending{" "}
                {paymentStats?.pending || 0} · Failed{" "}
                {paymentStats?.failed || 0}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm font-medium text-slate-600">Review CV</p>
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <p className="mt-3 text-2xl font-semibold text-slate-950">
                {reviewStats?.total || 0}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Avg score {reviewStats?.avgScore || 0}/100
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm font-medium text-slate-600">
                  Active Plans
                </p>
                <Users className="h-5 w-5 text-primary" />
              </div>
              <p className="mt-3 text-2xl font-semibold text-slate-950">
                {entitlementStats?.active || 0}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Paid {entitlementStats?.paidActive || 0} · Beta{" "}
                {entitlementStats?.betaActive || 0}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <Card className="bg-white shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-primary" />
                <p className="font-semibold text-slate-950">Usage Events</p>
              </div>
              <p className="mt-3 text-2xl font-semibold text-slate-950">
                {usageStats?.totalUsage || 0}
              </p>
              <p className="mt-1 text-sm text-slate-600">
                Guest {usageStats?.guestUsage || 0} · User{" "}
                {usageStats?.userUsage || 0}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 grid gap-6">
          <Card className="bg-white shadow-sm">
            <CardContent className="p-0">
              <div className="border-b p-5">
                <h2 className="text-xl font-semibold text-slate-950">
                  Payment Orders Terbaru
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  Untuk cek transaksi Duitku dan status aktivasi paket.
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-230 text-sm">
                  <thead className="border-b bg-slate-50 text-left text-xs uppercase tracking-[0.12em] text-slate-500">
                    <tr>
                      <th className="px-5 py-3">Order</th>
                      <th className="px-5 py-3">User</th>
                      <th className="px-5 py-3">Plan</th>
                      <th className="px-5 py-3">Amount</th>
                      <th className="px-5 py-3">Status</th>
                      <th className="px-5 py-3">Reference</th>
                      <th className="px-5 py-3">Created</th>
                      <th className="px-5 py-3">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {latestPayments.map((order) => (
                      <tr key={order.id}>
                        <td className="px-5 py-4">
                          <Link
                            href={`/admin/payments/${order.id}`}
                            className="font-medium text-primary hover:underline"
                          >
                            {order.merchantOrderId}
                          </Link>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {order.id}
                          </p>
                        </td>
                        <td className="px-5 py-4 text-slate-600">
                          <span className="break-all">{order.userId}</span>
                        </td>
                        <td className="px-5 py-4 text-slate-600">
                          {order.planCode}
                        </td>
                        <td className="px-5 py-4 font-medium text-slate-950">
                          {formatCurrency(order.amount)}
                        </td>
                        <td className="px-5 py-4">
                          <Badge
                            variant="outline"
                            className={getPaymentStatusBadge(order.status)}
                          >
                            {order.status}
                          </Badge>
                        </td>
                        <td className="px-5 py-4 text-slate-600">
                          <span className="break-all">
                            {order.duitkuReference || "-"}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-slate-600">
                          {formatDate(order.createdAt)}
                        </td>
                        <td className="px-5 py-4">
                          <CheckPaymentStatusButton paymentOrderId={order.id} />
                        </td>
                      </tr>
                    ))}

                    {latestPayments.length === 0 && (
                      <tr>
                        <td
                          colSpan={8}
                          className="px-5 py-8 text-center text-slate-500"
                        >
                          Belum ada payment order.
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
                  Entitlement Terbaru
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  Menampilkan paket aktif atau entitlement yang baru diupdate.
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-200 text-sm">
                  <thead className="border-b bg-slate-50 text-left text-xs uppercase tracking-[0.12em] text-slate-500">
                    <tr>
                      <th className="px-5 py-3">User</th>
                      <th className="px-5 py-3">Plan</th>
                      <th className="px-5 py-3">Status</th>
                      <th className="px-5 py-3">Quota</th>
                      <th className="px-5 py-3">Period</th>
                      <th className="px-5 py-3">Updated</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {latestEntitlements.map((entitlement) => (
                      <tr key={entitlement.id}>
                        <td className="px-5 py-4 text-slate-600">
                          <span className="break-all">
                            {entitlement.userId}
                          </span>
                        </td>
                        <td className="px-5 py-4 font-medium text-slate-950">
                          {entitlement.planCode}
                        </td>
                        <td className="px-5 py-4 text-slate-600">
                          {entitlement.status}
                        </td>
                        <td className="px-5 py-4 text-slate-600">
                          {entitlement.reviewQuotaLimit}
                        </td>
                        <td className="px-5 py-4 text-slate-600">
                          {formatDate(entitlement.currentPeriodStart)} -{" "}
                          {formatDate(entitlement.currentPeriodEnd)}
                        </td>
                        <td className="px-5 py-4 text-slate-600">
                          {formatDate(entitlement.updatedAt)}
                        </td>
                      </tr>
                    ))}

                    {latestEntitlements.length === 0 && (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-5 py-8 text-center text-slate-500"
                        >
                          Belum ada entitlement.
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
                  Review CV Terbaru
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  Tidak menampilkan isi CV mentah. Hanya metadata hasil review.
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-205 text-sm">
                  <thead className="border-b bg-slate-50 text-left text-xs uppercase tracking-[0.12em] text-slate-500">
                    <tr>
                      <th className="px-5 py-3">Review</th>
                      <th className="px-5 py-3">User</th>
                      <th className="px-5 py-3">Target Role</th>
                      <th className="px-5 py-3">Score</th>
                      <th className="px-5 py-3">AI</th>
                      <th className="px-5 py-3">Created</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {latestReviews.map((review) => (
                      <tr key={review.id}>
                        <td className="px-5 py-4">
                          <Link
                            href={`/review/${review.id}`}
                            className="font-medium text-primary hover:underline"
                          >
                            Buka hasil
                          </Link>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {review.id}
                          </p>
                        </td>
                        <td className="px-5 py-4 text-slate-600">
                          <span className="break-all">
                            {review.userId || "guest"}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-slate-600">
                          {review.targetRole}
                        </td>
                        <td className="px-5 py-4 font-medium text-slate-950">
                          {review.overallScore}/100
                        </td>
                        <td className="px-5 py-4 text-slate-600">
                          {review.aiProvider} · {review.aiModel}
                        </td>
                        <td className="px-5 py-4 text-slate-600">
                          {formatDate(review.createdAt)}
                        </td>
                      </tr>
                    ))}

                    {latestReviews.length === 0 && (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-5 py-8 text-center text-slate-500"
                        >
                          Belum ada review.
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
                  Admin Audit Log
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  Catatan aktivitas admin yang memengaruhi data billing,
                  payment, atau entitlement.
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-230 text-sm">
                  <thead className="border-b bg-slate-50 text-left text-xs uppercase tracking-[0.12em] text-slate-500">
                    <tr>
                      <th className="px-5 py-3">Time</th>
                      <th className="px-5 py-3">Admin</th>
                      <th className="px-5 py-3">Action</th>
                      <th className="px-5 py-3">Entity</th>
                      <th className="px-5 py-3">Metadata</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y">
                    {latestAuditLogs.map((log) => (
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

                        <td className="px-5 py-4 text-slate-600">
                          <p>{log.entityType}</p>
                          <p className="mt-1 break-all text-xs text-muted-foreground">
                            {log.entityId}
                          </p>
                        </td>

                        <td className="px-5 py-4">
                          <pre className="max-w-90 overflow-x-auto rounded-md bg-slate-50 p-3 text-xs leading-5 text-slate-700">
                            {JSON.stringify(log.metadata, null, 2)}
                          </pre>
                        </td>
                      </tr>
                    ))}

                    {latestAuditLogs.length === 0 && (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-5 py-8 text-center text-slate-500"
                        >
                          Belum ada aktivitas admin.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}
