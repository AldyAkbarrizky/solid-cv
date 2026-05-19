import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  History,
  LogIn,
  Sparkles,
  ShieldCheck,
  CreditCard,
} from "lucide-react";

import { getCurrentUser } from "@/lib/session";
import { Button } from "@/components/ui/button";
import { LogoutButton } from "@/components/auth/logout-button";
import { isCurrentUserAdmin } from "@/lib/admin";

type SiteHeaderProps = {
  variant?: "home" | "app";
  backHref?: string;
  backLabel?: string;
};

function getUserDisplayName(user: {
  name?: string | null;
  email?: string | null;
}) {
  if (user.name) return user.name;
  if (user.email) return user.email;
  return "User";
}

export async function SiteHeader({
  variant = "app",
  backHref,
  backLabel = "Kembali",
}: SiteHeaderProps) {
  const user = await getCurrentUser();
  const isLoggedIn = Boolean(user);
  const isAdmin = await isCurrentUserAdmin();

  return (
    <header className="border-b bg-background/95">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-5 py-4">
        <Link href="/" className="flex min-w-0 items-center gap-3">
          <div className="h-9 w-9 shrink-0 overflow-hidden rounded-lg">
            <Image
              src="/LogoSquare.webp"
              alt="Solid CV"
              width={36}
              height={36}
              className="h-full w-full object-cover"
              priority
            />
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-semibold tracking-tight text-slate-950">
              Solid CV
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {isLoggedIn
                ? `Masuk sebagai ${getUserDisplayName(user!)}`
                : "Analisis CV untuk pencari kerja"}
            </p>
          </div>
        </Link>

        {variant === "home" && (
          <nav
            aria-label="Navigasi utama"
            className="hidden items-center gap-7 text-sm text-muted-foreground lg:flex"
          >
            <Link href="#cara-kerja" className="transition hover:text-primary">
              Cara kerja
            </Link>
            <Link href="#area-review" className="transition hover:text-primary">
              Area review
            </Link>
            <Link href="#privasi" className="transition hover:text-primary">
              Privasi
            </Link>
            <Link href="/contact" className="transition hover:text-primary">
              Kontak
            </Link>
          </nav>
        )}

        <div className="flex shrink-0 items-center gap-2">
          {backHref && (
            <Button
              asChild
              variant="outline"
              size="sm"
              className="hidden bg-white sm:inline-flex"
            >
              <Link href={backHref}>
                <ArrowLeft className="mr-1.5 h-4 w-4" />
                {backLabel}
              </Link>
            </Button>
          )}

          {isLoggedIn ? (
            <>
              {isAdmin && (
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="hidden bg-white md:inline-flex"
                >
                  <Link href="/admin">
                    <ShieldCheck className="mr-1.5 h-4 w-4" />
                    Admin
                  </Link>
                </Button>
              )}
              <Button
                asChild
                variant="outline"
                size="sm"
                className="hidden bg-white md:inline-flex"
              >
                <Link href="/history">
                  <History className="mr-1.5 h-4 w-4" />
                  Riwayat
                </Link>
              </Button>

              <Button asChild size="sm" className="hidden md:inline-flex">
                <Link href="/review">
                  <Sparkles className="mr-1.5 h-4 w-4" />
                  Review CV
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                size="sm"
                className="hidden bg-white md:inline-flex"
              >
                <Link href="/pricing">
                  <CreditCard className="mr-1.5 h-4 w-4" />
                  Paket
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                size="sm"
                className="hidden bg-white md:inline-flex"
              >
                <Link href="/billing">Billing</Link>
              </Button>

              <LogoutButton />
            </>
          ) : (
            <>
              <Button asChild variant="outline" size="sm" className="bg-white">
                <Link href="/login">
                  <LogIn className="mr-1.5 h-4 w-4" />
                  Masuk
                </Link>
              </Button>

              <Button asChild size="sm" className="hidden md:inline-flex">
                <Link href="/review">Mulai Review</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
