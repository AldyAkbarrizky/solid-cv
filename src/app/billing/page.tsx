import Link from "next/link";
import { and, eq } from "drizzle-orm";

import { SiteHeader } from "@/components/layout/site-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { db } from "@/db";
import { userEntitlements } from "@/db/schema";
import { getCurrentUser } from "@/lib/session";

export default async function BillingPage() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <main className="min-h-screen bg-background text-foreground">
        <SiteHeader />
        <section className="mx-auto flex min-h-[calc(100vh-72px)] max-w-md items-center px-5">
          <Card className="w-full bg-white">
            <CardContent className="p-6 text-center">
              <h1 className="text-xl font-semibold text-slate-950">
                Masuk diperlukan
              </h1>
              <p className="mt-2 text-sm text-slate-600">
                Masuk untuk melihat paket dan status kuota Anda.
              </p>
              <Button asChild className="mt-5">
                <Link href="/login">Masuk</Link>
              </Button>
            </CardContent>
          </Card>
        </section>
      </main>
    );
  }

  const [entitlement] = await db
    .select()
    .from(userEntitlements)
    .where(
      and(
        eq(userEntitlements.userId, user.id),
        eq(userEntitlements.status, "active"),
      ),
    )
    .limit(1);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <SiteHeader backHref="/review" backLabel="Review CV" />

      <section className="mx-auto w-full max-w-3xl px-5 py-10">
        <p className="text-sm font-medium text-primary">Billing</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
          Paket dan kuota akun
        </h1>

        <Card className="mt-6 bg-white shadow-sm">
          <CardContent className="p-6">
            {entitlement ? (
              <>
                <p className="text-sm text-muted-foreground">Paket aktif</p>
                <p className="mt-2 text-2xl font-semibold uppercase text-slate-950">
                  {entitlement.planCode}
                </p>

                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-lg border bg-slate-50 p-4">
                    <p className="text-sm text-muted-foreground">Kuota</p>
                    <p className="mt-1 text-xl font-semibold text-slate-950">
                      {entitlement.reviewQuotaLimit} review
                    </p>
                  </div>

                  <div className="rounded-lg border bg-slate-50 p-4">
                    <p className="text-sm text-muted-foreground">
                      Berlaku sampai
                    </p>
                    <p className="mt-1 text-xl font-semibold text-slate-950">
                      {new Intl.DateTimeFormat("id-ID", {
                        dateStyle: "medium",
                      }).format(entitlement.currentPeriodEnd)}
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <>
                <p className="text-sm text-slate-600">
                  Anda belum memiliki paket berbayar aktif. Akun menggunakan
                  kuota free.
                </p>
                <Button asChild className="mt-5">
                  <Link href="/pricing">Lihat paket</Link>
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
