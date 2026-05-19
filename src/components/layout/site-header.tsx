import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  ChevronDown,
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

function getUserInitial(user: { name?: string | null; email?: string | null }) {
  return getUserDisplayName(user).trim().charAt(0).toUpperCase() || "U";
}

function getGoogleProfileImage(image?: string | null) {
  if (!image) return null;

  try {
    const url = new URL(image);

    if (
      url.protocol === "https:" &&
      url.hostname === "lh3.googleusercontent.com"
    ) {
      return image;
    }
  } catch {
    return null;
  }

  return null;
}

function UserAvatar({
  user,
  className,
  imageClassName,
}: {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  className: string;
  imageClassName: string;
}) {
  const image = getGoogleProfileImage(user.image);

  if (image) {
    return (
      <Image
        src={image}
        alt={getUserDisplayName(user)}
        width={32}
        height={32}
        className={imageClassName}
      />
    );
  }

  return (
    <span className={className} aria-hidden="true">
      {getUserInitial(user)}
    </span>
  );
}

const accountLinkClass =
  "flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground transition hover:bg-muted/70 hover:text-foreground";

export async function SiteHeader({
  variant = "app",
  backHref,
  backLabel = "Kembali",
}: SiteHeaderProps) {
  const user = await getCurrentUser();
  const isLoggedIn = Boolean(user);
  const isAdmin = await isCurrentUserAdmin();
  const showReviewCta = !backHref || backHref !== "/review";

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 border-b bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-5">
          <Link
            href="/"
            className="group flex min-w-0 items-center gap-2.5"
            aria-label="SolidCV"
          >
            <Image
              src="/LogoSquare.webp"
              alt=""
              width={28}
              height={28}
              className="h-7 w-7 shrink-0 rounded-md object-cover ring-1 ring-white/10 transition duration-200 group-hover:ring-primary/45"
              priority
            />

            <span className="flex min-w-0 items-baseline gap-2">
              <span className="truncate text-[15px] font-semibold tracking-tight text-foreground">
                SolidCV
              </span>
              <span className="hidden rounded-full border border-primary/25 bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-primary sm:inline">
                Review
              </span>
            </span>
          </Link>

          {variant === "home" && (
            <nav
              aria-label="Navigasi utama"
              className="hidden items-center gap-6 text-sm text-muted-foreground xl:flex"
            >
              <Link href="#cara-kerja" className="transition hover:text-primary">
                Cara kerja
              </Link>
              <Link
                href="#area-review"
                className="transition hover:text-primary"
              >
                Area review
              </Link>
              <Link href="#pricing" className="transition hover:text-primary">
                Paket
              </Link>
              <Link href="#privasi" className="transition hover:text-primary">
                Privasi
              </Link>
            </nav>
          )}

          <div className="flex shrink-0 items-center gap-2">
            {backHref && (
              <Button
                asChild
                variant="outline"
                size="sm"
                className="hidden bg-white lg:inline-flex"
              >
                <Link href={backHref}>
                  <ArrowLeft className="mr-1.5 h-4 w-4" />
                  {backLabel}
                </Link>
              </Button>
            )}

            {isLoggedIn ? (
              <>
                {showReviewCta && (
                  <Button asChild size="sm" className="hidden sm:inline-flex">
                    <Link href="/review">
                      <Sparkles className="mr-1.5 h-4 w-4" />
                      Review CV
                    </Link>
                  </Button>
                )}
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="hidden bg-white md:inline-flex"
                >
                  <Link href="/pricing">
                    <CreditCard className="mr-1.5 h-4 w-4" />
                    Upgrade
                  </Link>
                </Button>

                <details className="group relative">
                  <summary className="flex h-9 cursor-pointer list-none items-center gap-2 rounded-full border border-border bg-card/80 py-1 pr-2 pl-1 text-sm font-medium text-foreground shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/45 hover:bg-muted/80 hover:shadow-md active:translate-y-px [&::-webkit-details-marker]:hidden">
                    <UserAvatar
                      user={user!}
                      className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary ring-1 ring-primary/25"
                      imageClassName="h-7 w-7 rounded-full object-cover ring-1 ring-white/15"
                    />
                    <span className="sr-only">Buka menu akun</span>
                    <ChevronDown className="h-3.5 w-3.5 text-muted-foreground transition-transform duration-200 group-open:rotate-180" />
                  </summary>

                  <div className="absolute right-0 mt-2 w-64 rounded-lg border bg-popover p-1.5 shadow-xl shadow-black/30">
                    <div className="flex gap-3 border-b px-3 py-3">
                      <UserAvatar
                        user={user!}
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm font-semibold text-primary ring-1 ring-primary/25"
                        imageClassName="h-9 w-9 shrink-0 rounded-full object-cover ring-1 ring-white/15"
                      />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-foreground">
                          {getUserDisplayName(user!)}
                        </p>
                        {user?.email && (
                          <p className="mt-0.5 truncate text-xs text-muted-foreground">
                            {user.email}
                          </p>
                        )}
                      </div>
                    </div>

                    {isAdmin && (
                      <Link href="/admin" className={accountLinkClass}>
                        <ShieldCheck className="h-4 w-4 text-emerald-400" />
                        Admin
                      </Link>
                    )}
                    <Link href="/history" className={accountLinkClass}>
                      <History className="h-4 w-4 text-amber-300" />
                      Riwayat
                    </Link>
                    <Link href="/pricing" className={accountLinkClass}>
                      <CreditCard className="h-4 w-4 text-sky-300" />
                      Paket & kuota
                    </Link>

                    <div className="mt-1 border-t pt-1">
                      <LogoutButton
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start bg-transparent text-rose-300 hover:bg-rose-950/50 hover:text-rose-200"
                      />
                    </div>
                  </div>
                </details>
              </>
            ) : (
              <>
                <Button asChild variant="outline" size="sm" className="bg-white">
                  <Link href="/login">
                    <LogIn className="mr-1.5 h-4 w-4" />
                    Masuk
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="hidden bg-white sm:inline-flex"
                >
                  <Link href="/pricing">
                    <CreditCard className="mr-1.5 h-4 w-4" />
                    Paket
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
      <div className="h-16" aria-hidden="true" />
    </>
  );
}
