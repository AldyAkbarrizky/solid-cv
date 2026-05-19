import Link from "next/link";
import type { Metadata } from "next";

import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Hasil Review - Solid CV",
  description: "Halaman hasil review CV.",
};

export default function ReviewResultPlaceholderPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl items-center justify-center px-5 py-10">
      <section className="w-full rounded-lg border bg-white p-6 text-center shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-950">Hasil Review</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Halaman ini masih placeholder. Silakan kembali ke halaman review untuk
          memproses CV.
        </p>
        <div className="mt-6">
          <Button asChild>
            <Link href="/review">Kembali ke Review CV</Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
