import Link from "next/link";
import { eq } from "drizzle-orm";

import { SiteHeader } from "@/components/layout/site-header";
import { db } from "@/db";
import { paymentOrders } from "@/db/schema";
import { getCurrentUser } from "@/lib/session";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Metadata } from "next";

type BillingReturnPageProps = {
  searchParams: Promise<{
    orderId?: string;
  }>;
};

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default async function BillingReturnPage({
  searchParams,
}: BillingReturnPageProps) {
  const user = await getCurrentUser();
  const params = await searchParams;

  let order = null;

  if (user && params.orderId) {
    const [foundOrder] = await db
      .select()
      .from(paymentOrders)
      .where(eq(paymentOrders.id, params.orderId))
      .limit(1);

    if (foundOrder?.userId === user.id) {
      order = foundOrder;
    }
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <SiteHeader backHref="/pricing" backLabel="Paket" />

      <section className="mx-auto flex min-h-[calc(100vh-72px)] w-full max-w-xl items-center px-5 py-10">
        <Card className="w-full bg-white shadow-sm">
          <CardContent className="p-6">
            <p className="text-sm font-medium text-primary">
              Status pembayaran
            </p>

            <h1 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
              Pembayaran sedang diverifikasi.
            </h1>

            <p className="mt-3 text-sm leading-6 text-slate-600">
              Jika pembayaran berhasil, kuota akan aktif setelah callback Duitku
              diterima dan tervalidasi oleh sistem.
            </p>

            {order && (
              <div className="mt-5 rounded-lg border bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-950">Order ID</p>
                <p className="mt-1 break-all text-sm text-slate-600">
                  {order.merchantOrderId}
                </p>
                <p className="mt-3 text-sm font-semibold text-slate-950">
                  Status internal
                </p>
                <p className="mt-1 text-sm uppercase text-slate-600">
                  {order.status}
                </p>
              </div>
            )}

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button asChild>
                <Link href="/review">Kembali ke Review CV</Link>
              </Button>

              <Button asChild variant="outline" className="bg-white">
                <Link href="/history">Lihat Riwayat</Link>
              </Button>
            </div>

            <p className="mt-5 text-xs leading-5 text-muted-foreground">
              Halaman ini tidak digunakan sebagai bukti pembayaran. Aktivasi
              paket hanya dilakukan melalui callback pembayaran yang valid.
            </p>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
