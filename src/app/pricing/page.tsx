import { SiteHeader } from "@/components/layout/site-header";
import { billingPlans } from "@/lib/billing/plans";
import { getCurrentUser } from "@/lib/session";
import { Card, CardContent } from "@/components/ui/card";
import { CheckoutButton } from "./checkout-button";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Paket Berbayar - Solid CV",
  description:
    "Pilih paket review CV berbayar untuk menambah kuota penggunaan.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function PricingPage() {
  const user = await getCurrentUser();
  const plans = Object.values(billingPlans);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <SiteHeader backHref="/review" backLabel="Review CV" />

      <section className="mx-auto w-full max-w-5xl px-5 py-10 md:py-14">
        <div className="max-w-2xl">
          <p className="text-sm font-medium text-primary">Paket berbayar</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 md:text-4xl">
            Tambah kuota review CV sesuai kebutuhan.
          </h1>
          <p className="mt-4 text-base leading-7 text-slate-600">
            Pembayaran diproses melalui Duitku Sandbox untuk tahap verifikasi
            integrasi. Paket aktif setelah callback pembayaran berhasil diterima
            dan tervalidasi.
          </p>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {plans.map((plan) => (
            <Card key={plan.code} className="bg-white shadow-sm">
              <CardContent className="p-6">
                <p className="text-sm font-semibold text-primary">
                  Solid CV {plan.name}
                </p>
                <div className="mt-4 flex items-end gap-1">
                  <span className="text-4xl font-semibold tracking-tight text-slate-950">
                    Rp{new Intl.NumberFormat("id-ID").format(plan.price)}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {plan.description}
                </p>
                <div className="mt-6 rounded-lg border bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-950">
                    {plan.reviewQuotaLimit} review CV
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    Berlaku {plan.activeDays} hari setelah pembayaran berhasil.
                  </p>
                </div>
                <div className="mt-6">
                  <CheckoutButton planCode={plan.code} disabled={!user} />
                </div>
                <p className="mt-3 text-xs leading-5 text-muted-foreground">
                  Dengan membeli paket, Anda menyetujui{" "}
                  <Link href="/terms" className="font-medium text-primary">
                    Terms
                  </Link>{" "}
                  dan memahami bahwa aktivasi paket dilakukan setelah callback
                  pembayaran tervalidasi.
                </p>
                Jika ada kendala pembayaran, hubungi kami melalui{" "}
                <Link href="/contact" className="font-medium text-primary">
                  Contact
                </Link>
                .
                {!user && (
                  <p className="mt-3 text-xs leading-5 text-amber-700">
                    Login diperlukan sebelum membeli paket.
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}
