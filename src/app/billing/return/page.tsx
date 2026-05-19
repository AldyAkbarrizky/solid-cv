import Link from "next/link";
import { CheckCircle2, Clock, XCircle, HelpCircle } from "lucide-react";
import { eq } from "drizzle-orm";
import { Metadata } from "next";

import { StatusPoller } from "./status-poller";
import { SiteHeader } from "@/components/layout/site-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { db } from "@/db";
import { paymentOrders } from "@/db/schema";
import { getCurrentUser } from "@/lib/session";

type BillingReturnPageProps = {
  searchParams: Promise<{ orderId?: string }>;
};

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

// ── Status config ────────────────────────────────────────────────────────────

type StatusConfig = {
  icon: React.ReactNode;
  iconWrapperClass: string;
  title: string;
  description: string;
  note?: string;
};

function getStatusConfig(status: string): StatusConfig {
  switch (status) {
    case "paid":
      return {
        icon: <CheckCircle2 className="h-8 w-8 text-emerald-600" />,
        iconWrapperClass:
          "flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50",
        title: "Pembayaran berhasil!",
        description:
          "Kuota review kamu sudah aktif. Kamu bisa langsung mulai review CV.",
        note: "Kalau kuota belum tampil, coba refresh halaman pricing dalam beberapa detik.",
      };

    case "pending":
      return {
        icon: <Clock className="h-8 w-8 text-amber-500" />,
        iconWrapperClass:
          "flex h-14 w-14 items-center justify-center rounded-full bg-amber-50",
        title: "Menunggu konfirmasi pembayaran",
        description:
          "Sistem menunggu konfirmasi dari Duitku. Kuota akan aktif otomatis setelah callback diterima. Biasanya hanya butuh beberapa detik.",
        note: "Jangan tutup tab ini dulu. Halaman akan otomatis diperbarui.",
      };

    case "failed":
    case "cancelled":
      return {
        icon: <XCircle className="h-8 w-8 text-rose-500" />,
        iconWrapperClass:
          "flex h-14 w-14 items-center justify-center rounded-full bg-rose-50",
        title: "Pembayaran tidak berhasil",
        description:
          status === "cancelled"
            ? "Transaksi ini dibatalkan. Kamu bisa mencoba kembali dari halaman paket."
            : "Terjadi kesalahan saat memproses pembayaran. Kamu bisa mencoba kembali dari halaman paket.",
        note: "Tidak ada biaya yang dikenakan untuk transaksi yang gagal.",
      };

    default:
      return {
        icon: <HelpCircle className="h-8 w-8 text-slate-400" />,
        iconWrapperClass:
          "flex h-14 w-14 items-center justify-center rounded-full bg-slate-100",
        title: "Status pembayaran tidak ditemukan",
        description:
          "ID order tidak ditemukan atau kamu belum login. Jika kamu baru saja melakukan pembayaran, pastikan kamu login dengan akun yang sama.",
      };
  }
}

// ── Page ─────────────────────────────────────────────────────────────────────

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

  const status = order?.status ?? "unknown";
  const config = getStatusConfig(status);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <SiteHeader backHref="/pricing" backLabel="Paket" />

      <section className="mx-auto flex min-h-[calc(100vh-72px)] w-full max-w-xl items-center px-5 py-10">
        <Card className="w-full bg-white shadow-sm">
          <CardContent className="p-6">
            {/* Icon */}
            <div className={config.iconWrapperClass}>{config.icon}</div>

            {/* Title & description */}
            <h1 className="mt-4 text-xl font-semibold tracking-tight text-slate-950">
              {config.title}
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {config.description}
            </p>
            {config.note && (
              <p className="mt-2 text-sm leading-6 text-slate-500 italic">
                {config.note}
              </p>
            )}

            {/* Order detail (shown when order found) */}
            {order && (
              <div className="mt-5 rounded-lg border bg-slate-50 p-4 text-sm">
                <div className="grid grid-cols-2 gap-y-2">
                  <span className="font-medium text-slate-700">Order ID</span>
                  <span className="break-all text-slate-500">
                    {order.merchantOrderId}
                  </span>
                  <span className="font-medium text-slate-700">Status</span>
                  <span className="uppercase text-slate-500">
                    {order.status}
                  </span>
                  {order.paidAt && (
                    <>
                      <span className="font-medium text-slate-700">
                        Dibayar
                      </span>
                      <span className="text-slate-500">
                        {new Intl.DateTimeFormat("id-ID", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        }).format(order.paidAt)}
                      </span>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Auto-refresh for pending */}
            <StatusPoller initialStatus={status} />

            {/* CTA buttons */}
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              {status === "paid" ? (
                <>
                  <Button asChild>
                    <Link href="/review">Review CV Sekarang</Link>
                  </Button>
                  <Button asChild variant="outline" className="bg-white">
                    <Link href="/pricing">Lihat Status Paket</Link>
                  </Button>
                </>
              ) : status === "pending" ? (
                <>
                  <Button asChild>
                    <Link href="/review">Review CV</Link>
                  </Button>
                  <Button asChild variant="outline" className="bg-white">
                    <Link href="/history">Riwayat</Link>
                  </Button>
                </>
              ) : (
                <>
                  <Button asChild>
                    <Link href="/pricing">Lihat Paket</Link>
                  </Button>
                  <Button asChild variant="outline" className="bg-white">
                    <Link href="/review">Review CV</Link>
                  </Button>
                </>
              )}
            </div>

            {/* Legal note */}
            <p className="mt-5 text-xs leading-5 text-muted-foreground">
              Halaman ini bukan bukti pembayaran. Aktivasi paket hanya dilakukan
              melalui callback pembayaran yang valid dari Duitku.
            </p>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
