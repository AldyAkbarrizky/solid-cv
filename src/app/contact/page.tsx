import Link from "next/link";
import { Mail, ShieldCheck, Trash2 } from "lucide-react";

import { SiteHeader } from "@/components/layout/site-header";
import { Card, CardContent } from "@/components/ui/card";
import { supportEmail, companyName } from "@/lib/contact";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kontak - Solid CV",
  description:
    "Hubungi Solid CV untuk bantuan, privasi, penghapusan data, dan pertanyaan pembayaran.",
};

export default function ContactPage() {
  const mailto = `mailto:${supportEmail}`;

  return (
    <main className="min-h-screen bg-background text-foreground">
      <SiteHeader backHref="/" backLabel="Beranda" />

      <section className="mx-auto w-full max-w-4xl px-5 py-10 md:py-14">
        <p className="text-sm font-medium text-primary">Kontak</p>

        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 md:text-4xl">
          Hubungi Solid CV
        </h1>

        <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600">
          Gunakan kontak ini untuk pertanyaan seputar penggunaan aplikasi,
          pembayaran, privasi, penghapusan hasil review, atau permintaan
          penghapusan akun.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <Card className="bg-white shadow-sm">
            <CardContent className="p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-primary">
                <Mail className="h-5 w-5" />
              </div>

              <h2 className="mt-5 font-semibold text-slate-950">
                Email bantuan
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                Untuk pertanyaan umum, kendala akun, dan pembayaran.
              </p>

              <a
                href={mailto}
                className="mt-4 inline-flex text-sm font-medium text-primary hover:underline"
              >
                {supportEmail}
              </a>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm">
            <CardContent className="p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-primary">
                <ShieldCheck className="h-5 w-5" />
              </div>

              <h2 className="mt-5 font-semibold text-slate-950">
                Permintaan privasi
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                Untuk akses, koreksi, pembatasan, atau penghapusan data pribadi
                yang terkait dengan akun Anda.
              </p>

              <a
                href={mailto}
                className="mt-4 inline-flex text-sm font-medium text-primary hover:underline"
              >
                Kirim permintaan
              </a>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm">
            <CardContent className="p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-primary">
                <Trash2 className="h-5 w-5" />
              </div>

              <h2 className="mt-5 font-semibold text-slate-950">
                Penghapusan data
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                Untuk meminta penghapusan hasil review atau penghapusan akun
                beserta data yang dapat dihapus.
              </p>

              <Link
                href="/privacy#delete-policy"
                className="mt-4 inline-flex text-sm font-medium text-primary hover:underline"
              >
                Lihat kebijakan
              </Link>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-8 bg-white shadow-sm">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold text-slate-950">
              Informasi yang perlu disertakan
            </h2>

            <div className="mt-4 space-y-3 text-sm leading-7 text-slate-600">
              <p>
                Untuk permintaan terkait akun, sertakan email akun Google yang
                digunakan untuk login ke Solid CV.
              </p>
              <p>
                Untuk permintaan terkait hasil review, sertakan URL hasil review
                atau waktu pembuatan review jika tersedia.
              </p>
              <p>
                Untuk permintaan pembayaran, sertakan merchant order ID atau
                bukti transaksi dari Duitku jika tersedia.
              </p>
            </div>

            <div className="mt-6 rounded-lg border bg-slate-50 p-4 text-sm leading-6 text-slate-600">
              <p>
                Pengelola layanan:{" "}
                <span className="font-medium">{companyName}</span>
              </p>
              <p>
                Email:{" "}
                <a href={mailto} className="font-medium text-primary">
                  {supportEmail}
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
