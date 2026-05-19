import { AlertTriangle, Clock3, ShieldCheck } from "lucide-react";
import Link from "next/link";

import { ReviewForm } from "./review-form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Metadata } from "next";
import { SiteHeader } from "@/components/layout/site-header";
import { getCurrentUser } from "@/lib/session";
import { headers } from "next/headers";
import { getReviewQuotaStatus } from "@/lib/quota/review-quota";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Review CV - Solid CV",
  description:
    "Upload CV dan pilih posisi tujuan untuk mendapatkan analisis struktur, kejelasan, dan relevansi CV.",
};

type ReviewPageProps = {
  searchParams: Promise<{
    deleted?: string;
  }>;
};

export default async function ReviewPage({ searchParams }: ReviewPageProps) {
  const params = await searchParams;
  const isDeleted = params.deleted === "1";
  const user = await getCurrentUser();
  const requestHeaders = await headers();

  const quotaStatus = await getReviewQuotaStatus({
    input: requestHeaders,
    userId: user?.id ?? null,
  });
  const quotaLowThreshold = Math.max(1, Math.ceil(quotaStatus.limit * 0.2));
  const isQuotaDepleted = quotaStatus.remaining === 0;
  const isQuotaLow =
    !isQuotaDepleted &&
    quotaStatus.remaining < quotaStatus.limit &&
    quotaStatus.remaining <= quotaLowThreshold;

  return (
    <main className="min-h-screen bg-background text-foreground">
      <SiteHeader backHref="/" backLabel="Beranda" />

      <section className="mx-auto grid w-full max-w-5xl gap-8 px-5 py-10 md:grid-cols-[0.82fr_1.18fr] md:py-14">
        <aside className="space-y-4 md:pt-2">
          <p className="text-sm font-medium text-primary">Mulai review CV</p>

          <h1 className="mt-3 text-3xl font-semibold leading-tight tracking-tight text-slate-950 md:text-4xl">
            Upload CV dan isi posisi yang ingin dilamar.
          </h1>

          <div className="rounded-lg border border-slate-200/80 bg-white/80 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
              Info penting
            </p>
            <div className="mt-3 space-y-3">
              <Alert className="border-sky-200 bg-sky-50/60">
                <ShieldCheck className="h-4 w-4 text-sky-800" />
                <AlertDescription className="text-sm leading-6 text-sky-900">
                  File CV tidak disimpan sebagai dokumen permanen. Setelah teks
                  diekstrak, file asli tidak digunakan lagi.
                </AlertDescription>
              </Alert>

              <Alert className="border-amber-200 bg-amber-50/60">
                <AlertTriangle className="h-4 w-4 text-amber-700" />
                <AlertDescription className="text-sm leading-6 text-amber-800">
                  Hasil analisis AI dapat sedikit berbeda pada percobaan ulang,
                  meskipun CV dan posisi tujuan sama.
                </AlertDescription>
              </Alert>

              <Alert className="border-rose-200 bg-rose-50/60">
                <Clock3 className="h-4 w-4 text-rose-700" />
                <AlertDescription className="text-sm leading-6 text-rose-800">
                  Upload dibatasi untuk mencegah penyalahgunaan sistem.
                </AlertDescription>
              </Alert>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white/80 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
              Status & kuota
            </p>

            <div className="mt-3 grid gap-3">
              <div
                className={`rounded-md border p-3 ${
                  user
                    ? "border-emerald-200 bg-emerald-50/70"
                    : "border-indigo-200 bg-indigo-50/70"
                }`}
              >
                <p className="text-sm font-semibold text-slate-950">
                  {user
                    ? "Review akan tersimpan di riwayat akun Anda."
                    : "Anda sedang menggunakan mode guest."}
                </p>
                <p className="mt-1 text-sm leading-6 text-slate-700">
                  {user
                    ? "Setelah analisis selesai, hasil review bisa dibuka kembali dari halaman Riwayat."
                    : "Hasil review tetap bisa dibuka dari URL setelah proses selesai, tetapi belum terhubung ke akun."}
                </p>
              </div>

              <div className="rounded-md border border-slate-200 bg-slate-50/70 p-3">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-950">
                      {quotaStatus.remaining} review tersisa
                    </p>
                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      Terpakai {quotaStatus.used} dari {quotaStatus.limit}{" "}
                      kuota.
                    </p>
                  </div>

                  <div className="rounded-md bg-slate-100 px-2.5 py-2 text-right">
                    <p className="text-xs text-slate-500">Plan</p>
                    <p className="text-sm font-semibold uppercase text-slate-900">
                      {quotaStatus.planCode}
                    </p>
                  </div>
                </div>

                <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{
                      width: `${Math.min(
                        100,
                        (quotaStatus.used / quotaStatus.limit) * 100,
                      )}%`,
                    }}
                  />
                </div>

                <p className="mt-2 text-xs leading-5 text-slate-500">
                  Kuota diperbarui{" "}
                  {new Intl.DateTimeFormat("id-ID", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  }).format(quotaStatus.periodEnd)}
                  .
                </p>

                {(isQuotaLow || isQuotaDepleted) && (
                  <Alert
                    className={
                      isQuotaDepleted
                        ? "mt-3 border-rose-200 bg-rose-50/60"
                        : "mt-3 border-amber-200 bg-amber-50/60"
                    }
                  >
                    <AlertTriangle
                      className={
                        isQuotaDepleted
                          ? "h-4 w-4 text-rose-700"
                          : "h-4 w-4 text-amber-700"
                      }
                    />
                    <AlertDescription
                      className={
                        isQuotaDepleted
                          ? "text-sm leading-6 text-rose-800"
                          : "text-sm leading-6 text-amber-800"
                      }
                    >
                      {isQuotaDepleted
                        ? "Kuota review sudah habis untuk periode ini."
                        : "Kuota review hampir habis. Pertimbangkan upgrade jika masih perlu iterasi CV."}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </div>

            <div className="mt-3 flex gap-2">
              <Button asChild size="sm">
                <Link href="/pricing">
                  {user ? "Upgrade paket" : "Lihat paket"}
                </Link>
              </Button>
              {!user && (
                <Button asChild variant="outline" size="sm" className="bg-white">
                  <Link href="/login">Masuk</Link>
                </Button>
              )}
            </div>

            {!user && (
              <p className="mt-3 text-xs leading-5 text-indigo-700">
                Masuk dengan akun Google untuk mendapatkan 15 review per bulan
                dan menyimpan riwayat hasil analisis.
              </p>
            )}
          </div>

        </aside>

        <div className="space-y-4">
          {isDeleted && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
              Hasil review sebelumnya berhasil dihapus.
            </div>
          )}

          <ReviewForm />
        </div>
      </section>
    </main>
  );
}
