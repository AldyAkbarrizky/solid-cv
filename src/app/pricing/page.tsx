import Link from "next/link";
import { headers } from "next/headers";
import {
  CheckCircle2,
  CreditCard,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Metadata } from "next";

import { CheckoutButton } from "./checkout-button";
import { SiteHeader } from "@/components/layout/site-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  pricingComparisonRows,
  publicPricingPlans,
} from "@/lib/billing/pricing-display";
import { getReviewQuotaStatus } from "@/lib/quota/review-quota";
import { getCurrentUser } from "@/lib/session";

export const metadata: Metadata = {
  title: "Paket Review CV - Solid CV",
  description:
    "Pilih paket review CV untuk menambah kuota analisis CV di Solid CV.",
  robots: {
    index: false,
    follow: false,
  },
};

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
  }).format(date);
}

function formatPlanName(planCode: string) {
  if (planCode === "guest") return "Guest";
  if (planCode === "free") return "Free";
  if (planCode === "paid_basic") return "Basic";
  if (planCode === "paid_pro") return "Pro";
  return planCode;
}

export default async function PricingPage() {
  const user = await getCurrentUser();
  const requestHeaders = await headers();
  const quotaStatus = await getReviewQuotaStatus({
    input: requestHeaders,
    userId: user?.id ?? null,
  });
  const usagePercent =
    quotaStatus.limit > 0
      ? Math.min(100, (quotaStatus.used / quotaStatus.limit) * 100)
      : 0;
  const hasActivePaidPlan = quotaStatus.planCode.startsWith("paid_");

  return (
    <main className="min-h-screen bg-background text-foreground">
      <SiteHeader backHref="/review" backLabel="Review CV" />

      <section className="mx-auto w-full max-w-6xl px-5 py-10 md:py-14">
        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
          <div className="max-w-3xl">
            <p className="text-sm font-medium text-primary">Paket Solid CV</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 md:text-5xl md:leading-tight">
              Pilih kuota review sesuai intensitas melamar.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
              Paket berbayar menambah kuota analisis CV tanpa mengubah cara
              kerja utama: file tetap diproses sementara, hasil review tersimpan
              di akun, dan pembayaran diproses melalui Duitku.
            </p>
          </div>

          <Card className="rounded-lg border-slate-200 bg-white shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Status akun
                  </p>
                  <p className="mt-1 text-2xl font-semibold text-slate-950">
                    {formatPlanName(quotaStatus.planCode)}
                  </p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-primary">
                  <CreditCard className="h-5 w-5" />
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <div className="rounded-lg border bg-slate-50 p-3">
                  <p className="text-xs text-muted-foreground">Tersisa</p>
                  <p className="mt-1 text-lg font-semibold text-slate-950">
                    {quotaStatus.remaining}
                  </p>
                </div>
                <div className="rounded-lg border bg-slate-50 p-3">
                  <p className="text-xs text-muted-foreground">Terpakai</p>
                  <p className="mt-1 text-lg font-semibold text-slate-950">
                    {quotaStatus.used}
                  </p>
                </div>
                <div className="rounded-lg border bg-slate-50 p-3">
                  <p className="text-xs text-muted-foreground">Kuota</p>
                  <p className="mt-1 text-lg font-semibold text-slate-950">
                    {quotaStatus.limit}
                  </p>
                </div>
              </div>

              <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${usagePercent}%` }}
                />
              </div>
              <p className="mt-3 text-xs leading-5 text-muted-foreground">
                Kuota diperbarui setelah {formatDate(quotaStatus.periodEnd)}.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {publicPricingPlans.map((plan) => (
            <Card
              key={plan.code}
              className={
                plan.highlighted
                  ? "micro-lift rounded-lg border-primary/55 bg-primary/10 shadow-lg shadow-primary/10"
                  : "micro-lift rounded-lg border-slate-200 bg-white shadow-sm"
              }
            >
              <CardContent className="flex h-full flex-col p-6">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-primary">
                      {plan.name}
                    </p>
                    <p className="mt-3 flex items-end gap-1">
                      <span className="text-4xl font-semibold tracking-tight text-slate-950">
                        {plan.price}
                      </span>
                      <span className="pb-1 text-sm text-muted-foreground">
                        {plan.period}
                      </span>
                    </p>
                  </div>
                  {plan.badge && (
                    <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                      {plan.badge}
                    </Badge>
                  )}
                </div>

                <p className="mt-4 text-sm leading-6 text-slate-600">
                  {plan.description}
                </p>

                <div className="mt-5 rounded-lg border bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-950">
                    {plan.quota}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    Kuota mengikuti periode paket yang aktif di akun.
                  </p>
                </div>

                <div className="mt-5 space-y-3">
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex gap-2.5">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                      <p className="text-sm leading-5 text-slate-600">
                        {feature}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-auto pt-6">
                  {plan.checkoutCode ? (
                    <CheckoutButton
                      planCode={plan.checkoutCode}
                      disabled={!user || hasActivePaidPlan}
                    />
                  ) : (
                    <Button asChild variant="outline" className="h-11 w-full">
                      <Link href="/review">Mulai gratis</Link>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {!user && (
          <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50/60 p-4 text-sm leading-6 text-amber-800">
            Login diperlukan sebelum membeli paket. Akun membantu menyimpan
            riwayat review dan menghubungkan kuota dengan penggunaan Anda.
          </div>
        )}

        {user && hasActivePaidPlan && (
          <div className="mt-5 rounded-lg border border-sky-200 bg-sky-50/60 p-4 text-sm leading-6 text-sky-900">
            Anda masih memiliki paket aktif. Pembelian paket baru belum tersedia
            pada versi ini.
          </div>
        )}

        <section className="mt-10 rounded-lg border bg-white p-5 md:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-primary">
                Perbandingan paket
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                Bedanya ada di kuota dan penyimpanan riwayat.
              </h2>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              File CV tidak disimpan permanen
            </div>
          </div>

          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-190 border-separate border-spacing-0 text-left text-sm">
              <thead>
                <tr className="text-muted-foreground">
                  <th className="border-b px-4 py-3 font-medium">Fitur</th>
                  <th className="border-b px-4 py-3 font-medium">Guest</th>
                  <th className="border-b px-4 py-3 font-medium">Free</th>
                  <th className="border-b px-4 py-3 font-medium">Basic</th>
                  <th className="border-b px-4 py-3 font-medium">Pro</th>
                </tr>
              </thead>
              <tbody>
                {pricingComparisonRows.map((row) => (
                  <tr key={row.feature}>
                    <td className="border-b px-4 py-4 font-medium text-slate-950">
                      {row.feature}
                    </td>
                    <td className="border-b px-4 py-4 text-slate-600">
                      {row.guest}
                    </td>
                    <td className="border-b px-4 py-4 text-slate-600">
                      {row.free}
                    </td>
                    <td className="border-b px-4 py-4 text-slate-600">
                      {row.basic}
                    </td>
                    <td className="border-b px-4 py-4 text-slate-600">
                      {row.pro}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {[
            {
              icon: LockKeyhole,
              title: "File tidak disimpan permanen",
              copy: "File CV hanya dipakai untuk ekstraksi teks dan analisis.",
            },
            {
              icon: Sparkles,
              title: "Hasil tetap rekomendasi",
              copy: "Review membantu memperbaiki CV, bukan menjamin diterima kerja.",
            },
            {
              icon: CreditCard,
              title: "Pembayaran via Duitku",
              copy: "Aktivasi paket berjalan setelah callback pembayaran tervalidasi.",
            },
          ].map((item) => {
            const Icon = item.icon;

            return (
              <Card key={item.title} className="rounded-lg bg-white shadow-sm">
                <CardContent className="p-5">
                  <Icon className="h-5 w-5 text-primary" />
                  <h3 className="mt-4 font-semibold text-slate-950">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {item.copy}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <p className="mt-6 text-xs leading-5 text-muted-foreground">
          Jika ada kendala pembayaran, hubungi kami melalui{" "}
          <Link href="/contact" className="font-medium text-primary">
            Contact
          </Link>
          . Dengan membeli paket, Anda menyetujui{" "}
          <Link href="/terms" className="font-medium text-primary">
            Terms
          </Link>
          .
        </p>
      </section>
    </main>
  );
}
