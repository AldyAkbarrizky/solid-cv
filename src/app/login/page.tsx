import Link from "next/link";
import Image from "next/image";

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
      <Card className="w-full max-w-md rounded-lg border-slate-200 bg-white shadow-sm">
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
            <h1 className="text-2xl font-semibold tracking-tight text-slate-950">
              Masuk ke akun Anda
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Gunakan akun Google untuk menyimpan riwayat review dan mengelola
              kuota penggunaan.
            </p>
          </div>
          <div className="mt-6">
            <GoogleLoginButton />
          </div>
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
        </CardContent>
      </Card>
    </main>
  );
}
