import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  CreditCard,
  FileText,
  LockKeyhole,
  SearchCheck,
  ShieldCheck,
  Sparkles,
  Target,
} from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SiteHeader } from "@/components/layout/site-header";
import {
  pricingComparisonRows,
  publicPricingPlans,
} from "@/lib/billing/pricing-display";

const reviewAreas = [
  {
    title: "Struktur CV",
    description:
      "Mengecek urutan ringkasan, pengalaman, pendidikan, skill, dan bagian pendukung.",
    icon: FileText,
  },
  {
    title: "Relevansi Role",
    description:
      "Mencocokkan isi CV dengan posisi tujuan agar rekomendasi tidak terlalu umum.",
    icon: Target,
  },
  {
    title: "Kejelasan Isi",
    description:
      "Menilai apakah pengalaman, dampak kerja, dan pencapaian mudah dipahami recruiter.",
    icon: SearchCheck,
  },
];

const processSteps = [
  {
    number: "01",
    title: "Upload CV",
    description:
      "Unggah PDF atau DOCX. File diproses sementara untuk analisis.",
  },
  {
    number: "02",
    title: "Isi posisi tujuan",
    description:
      "Tambahkan role, senioritas, atau industri agar review lebih kontekstual.",
  },
  {
    number: "03",
    title: "Perbaiki prioritas utama",
    description:
      "Baca skor, catatan risiko, dan tindakan perbaikan yang paling penting.",
  },
];

const principles = [
  "File yang diunggah tidak disimpan setelah proses analisis selesai.",
  "Proses analisis dirancang untuk menghasilkan masukan dari data CV yang diunggah pengguna.",
  "Penerapan keamanan aplikasi mengacu praktik OWASP Top 10.",
];

const sampleFindings = [
  {
    label: "Ringkasan profil",
    status: "Perlu dibuat lebih spesifik",
  },
  {
    label: "Pengalaman kerja",
    status: "Dampak belum banyak memakai angka",
  },
  {
    label: "Skill utama",
    status: "Sudah relevan dengan role tujuan",
  },
];

const assessmentScores = [
  { label: "Struktur", value: "Baik", width: "78%" },
  { label: "Kejelasan", value: "Cukup", width: "62%" },
  { label: "Relevansi", value: "Baik", width: "74%" },
];

const previewScore = {
  value: 74,
  max: 100,
  status: "Baik",
};

export default function Home() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-background text-foreground">
      <SiteHeader variant="home" />

      <section className="reveal mx-auto grid w-full max-w-6xl min-w-0 gap-10 px-5 py-12 md:grid-cols-[1.02fr_0.98fr] md:items-center md:py-18">
        <div className="reveal min-w-0 reveal-delay-1">
          <p className="text-sm font-medium text-primary">
            Review CV sesuai posisi yang Anda tuju
          </p>

          <h1 className="mt-4 max-w-3xl text-balance text-3xl font-semibold leading-tight tracking-tight text-slate-950 sm:text-4xl md:text-5xl md:leading-[1.05]">
            Tingkatkan kualitas CV sebelum melamar kerja.
          </h1>

          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 md:text-lg">
            Solid CV membantu Anda menilai struktur, kejelasan pengalaman, dan
            relevansi isi CV terhadap posisi yang dituju, lalu memberi langkah
            perbaikan yang bisa langsung diterapkan.
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Button
              asChild
              size="lg"
              className="h-11 w-full justify-center px-5 sm:w-auto"
            >
              <Link href="/review">
                Mulai Review CV
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              size="lg"
              className="h-11 w-full justify-center border-slate-300 bg-white px-5 sm:w-auto"
            >
              <Link href="#cara-kerja">Lihat cara kerja</Link>
            </Button>
          </div>

          <div className="mt-8 grid max-w-2xl grid-cols-1 border-y sm:grid-cols-3">
            {["PDF / DOCX", "Sesuai posisi tujuan", "Skor & rekomendasi"].map(
              (item) => (
                <div key={item} className="border-b py-4 sm:border-b-0 sm:pr-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                    Fitur
                  </p>
                  <p className="mt-1 text-sm font-medium text-slate-900">
                    {item}
                  </p>
                </div>
              ),
            )}
          </div>

          <Alert className="mt-6 max-w-2xl border-slate-200 bg-white">
            <ShieldCheck className="h-4 w-4 text-primary" />
            <AlertDescription className="text-sm leading-6 text-slate-600">
              File CV diproses hanya untuk analisis dan tidak disimpan setelah
              proses selesai.
            </AlertDescription>
          </Alert>
        </div>

        <Card className="reveal reveal-delay-2 min-w-0 rounded-lg border-slate-200 bg-white py-0 shadow-sm">
          <CardContent className="p-0">
            <div className="border-b p-5">
              <div className="flex items-start justify-between gap-5">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
                    Contoh format tampilan
                  </p>
                  <h2 className="mt-2 text-xl font-semibold tracking-tight text-slate-950">
                    Preview setelah CV dianalisis
                  </h2>
                </div>
                <div className="min-w-42.5 rounded-lg border bg-slate-50 px-3.5 py-3 text-left">
                  <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
                    Skor CV
                  </p>
                  <p className="mt-1 flex items-end gap-1.5">
                    <span className="text-3xl leading-none font-semibold tabular-nums text-slate-950">
                      {previewScore.value}
                    </span>
                    <span className="pb-0.5 text-sm font-medium text-muted-foreground">
                      /{previewScore.max}
                    </span>
                  </p>
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <span className="text-xs text-muted-foreground">
                      Kualitas
                    </span>
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                      {previewScore.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-6 p-5">
              <Badge className="badge-warning py-4">
                Data di bawah hanya ilustrasi format tampilan, bukan hasil
                review dari CV pengguna.
              </Badge>
              <div className="grid gap-3">
                {assessmentScores.map((score, index) => (
                  <div key={score.label}>
                    <div className="mb-1.5 flex items-center justify-between text-sm">
                      <span className="font-medium text-slate-800">
                        {score.label}
                      </span>
                      <span className="text-muted-foreground">
                        {score.value}
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-sm bg-slate-100">
                      <div
                        className="score-fill h-full rounded-sm bg-primary"
                        style={{
                          width: score.width,
                          animationDelay: `${120 + index * 90}ms`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="rounded-lg border bg-slate-50 p-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <p className="text-sm font-semibold text-slate-950">
                    Prioritas perbaikan
                  </p>
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Tambahkan 2-3 pencapaian terukur pada pengalaman terakhir agar
                  kontribusi terlihat lebih jelas.
                </p>
              </div>

              <div>
                <p className="mb-3 text-sm font-semibold text-slate-950">
                  Temuan utama
                </p>
                <div className="divide-y rounded-lg border bg-white">
                  {sampleFindings.map((finding) => (
                    <div
                      key={finding.label}
                      className="grid gap-1 p-3 text-sm sm:grid-cols-[0.8fr_1fr] sm:gap-4"
                    >
                      <p className="font-medium text-slate-800">
                        {finding.label}
                      </p>
                      <p className="text-slate-600">{finding.status}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <section
        id="cara-kerja"
        className="reveal reveal-delay-1 border-y bg-white/70"
      >
        <div className="mx-auto w-full max-w-6xl px-5 py-10 md:py-12">
          <div className="grid gap-8 md:grid-cols-[0.75fr_1.25fr]">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-primary">
                Cara kerja
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
                Proses singkat, hasilnya langsung bisa dipakai.
              </h2>
            </div>

            <div className="grid gap-0 rounded-lg border bg-background">
              {processSteps.map((step) => (
                <div
                  key={step.number}
                  className="grid gap-4 border-b p-5 last:border-b-0 sm:grid-cols-[72px_1fr]"
                >
                  <p className="font-mono text-sm font-semibold text-primary">
                    {step.number}
                  </p>
                  <div>
                    <h3 className="font-semibold text-slate-950">
                      {step.title}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section
        id="area-review"
        className="reveal reveal-delay-1 mx-auto w-full max-w-6xl px-5 py-10 md:py-12"
      >
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-primary">
            Area review
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
            Fokus pada bagian CV yang paling berpengaruh.
          </h2>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {reviewAreas.map((area) => {
            const Icon = area.icon;

            return (
              <Card
                key={area.title}
                className="micro-lift rounded-lg border-slate-200 bg-white shadow-sm"
              >
                <CardContent className="p-5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-secondary text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 font-semibold text-slate-950">
                    {area.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {area.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <section
        id="privasi"
        className="reveal reveal-delay-1 mx-auto grid w-full max-w-6xl gap-4 px-5 py-8 md:grid-cols-2 md:py-10"
      >
        <Card className="micro-lift rounded-lg border-slate-200 bg-white shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-secondary text-primary">
                <LockKeyhole className="h-4 w-4" />
              </div>
              <h2 className="text-xl font-semibold tracking-tight text-slate-950">
                Pendekatan data minimal
              </h2>
            </div>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              CV diproses secara sementara selama sesi analisis dan tidak
              disimpan sebagai dokumen permanen.
            </p>
          </CardContent>
        </Card>

        <Card
          id="batasan"
          className="micro-lift rounded-lg border-slate-200 bg-white shadow-sm"
        >
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-secondary text-primary">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <h2 className="text-xl font-semibold tracking-tight text-slate-950">
                Keamanan aplikasi
              </h2>
            </div>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              Pengembangan fitur keamanan akan mengacu pada praktik OWASP Top
              10, termasuk validasi upload, pembatasan ukuran file, dan
              perlindungan API.
            </p>
          </CardContent>
        </Card>
      </section>

      <section
        id="pricing"
        className="reveal reveal-delay-1 mx-auto w-full max-w-6xl px-5 py-10 md:py-12"
      >
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-primary">
              Paket
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
              Mulai gratis, tambah kuota saat butuh iterasi lebih banyak.
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              Semua paket memakai format review yang sama. Perbedaannya ada
              pada kuota, periode penggunaan, dan apakah hasil tersimpan di
              akun.
            </p>
          </div>

          <Button asChild variant="outline" className="w-full bg-white md:w-auto">
            <Link href="/pricing">
              Lihat detail paket
              <ArrowRight className="ml-1.5 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {publicPricingPlans.map((plan) => (
            <Card
              key={plan.code}
              className={
                plan.highlighted
                  ? "micro-lift rounded-lg border-primary/55 bg-primary/10 shadow-lg shadow-primary/10"
                  : "micro-lift rounded-lg border-slate-200 bg-white shadow-sm"
              }
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-primary">
                      {plan.name}
                    </p>
                    <p className="mt-3 flex items-end gap-1">
                      <span className="text-3xl font-semibold tracking-tight text-slate-950">
                        {plan.price}
                      </span>
                      <span className="pb-1 text-xs text-muted-foreground">
                        {plan.period}
                      </span>
                    </p>
                  </div>

                  <div className="flex h-9 w-9 items-center justify-center rounded-md bg-secondary text-primary">
                    <CreditCard className="h-4 w-4" />
                  </div>
                </div>

                <p className="mt-4 text-sm leading-6 text-slate-600">
                  {plan.description}
                </p>
                <div className="mt-4 rounded-lg border bg-slate-50 p-3">
                  <p className="text-sm font-semibold text-slate-950">
                    {plan.quota}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-6 overflow-x-auto rounded-lg border bg-white">
          <table className="w-full min-w-[760px] border-separate border-spacing-0 text-left text-sm">
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

      <section className="reveal reveal-delay-2 mx-auto w-full max-w-6xl px-5 py-8 md:py-10">
        <div className="grid gap-6 rounded-lg border bg-white p-6 md:grid-cols-[0.9fr_1.1fr] md:items-center md:p-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-primary">
              Prinsip produk
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
              Dibangun untuk analisis yang aman dan relevan.
            </h2>
          </div>

          <div className="space-y-4">
            {principles.map((principle) => (
              <div key={principle} className="flex gap-3">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <p className="text-sm leading-6 text-slate-600">{principle}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-5 py-8 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
          <p>
            © 2026 Solid CV. Dibuat untuk membantu pencari kerja memperbaiki CV.
          </p>

          <div className="flex flex-wrap gap-4">
            <Link href="/privacy" className="hover:text-primary">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-primary">
              Terms
            </Link>
            <Link href="/contact" className="hover:text-primary">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
