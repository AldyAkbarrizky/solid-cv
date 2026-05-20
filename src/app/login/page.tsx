import Link from "next/link";
import Image from "next/image";
import { ShieldCheck } from "lucide-react";

import { CredentialLoginForm } from "./credential-login-form";
import { GoogleLoginButton } from "./google-login-button";
import { Card, CardContent } from "@/components/ui/card";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";

export const metadata: Metadata = {
  title: "Masuk - Solid CV",
  description: "Masuk ke Solid CV untuk menyimpan riwayat review CV.",
};

export default async function LoginPage() {
  const user = await getCurrentUser();

  if (user) {
    redirect("/review");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-5 py-10">
      <Card className="w-full max-w-md overflow-hidden rounded-lg border-slate-200 bg-white shadow-xl shadow-black/20">
        <CardContent className="p-6">
          <Link href="/" className="flex items-center gap-3">
            <div className="h-9 w-9 overflow-hidden rounded-lg">
              <Image
                src="/LogoSquare.webp"
                alt="Solid CV"
                width={36}
                height={36}
                className="h-full w-full object-cover"
                priority
              />
            </div>
            <div>
              <p className="text-sm font-semibold tracking-tight text-slate-950">
                Solid CV
              </p>
              <p className="text-xs text-muted-foreground">
                Analisis CV untuk pencari kerja
              </p>
            </div>
          </Link>

          <div className="mt-8">
            <p className="text-sm font-medium text-primary">
              Masuk ke Solid CV
            </p>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-950">
              Simpan riwayat review dan kuota penggunaan.
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Masuk dengan Google atau akun email yang sudah disediakan untuk
              akses reviewer.
            </p>
          </div>

          <div className="mt-6">
            <CredentialLoginForm />
          </div>

          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <p className="text-xs text-muted-foreground">atau</p>
            <div className="h-px flex-1 bg-border" />
          </div>

          <div>
            <GoogleLoginButton />
          </div>

          <div className="mt-5 flex gap-3 rounded-lg border bg-slate-50 p-4">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
            <p className="text-xs leading-5 text-slate-600">
              Login digunakan untuk menghubungkan hasil review dengan akun Anda.
              File CV tetap diproses sementara dan tidak disimpan sebagai
              dokumen permanen.
            </p>
          </div>

          <p className="mt-5 text-xs leading-5 text-muted-foreground">
            Dengan masuk, Anda menyetujui{" "}
            <Link href="/terms" className="font-medium text-primary">
              Terms
            </Link>
            ,{" "}
            <Link href="/privacy" className="font-medium text-primary">
              Privacy Policy
            </Link>
            , dan dapat menghubungi kami melalui{" "}
            <Link href="/contact" className="font-medium text-primary">
              Contact
            </Link>
            .
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
