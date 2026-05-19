import Link from "next/link";
import type { ReactNode } from "react";

import { SiteHeader } from "@/components/layout/site-header";
import { Card, CardContent } from "@/components/ui/card";

type LegalPageLayoutProps = {
  eyebrow: string;
  title: string;
  description: string;
  lastUpdated: string;
  summaryItems: string[];
  sections: {
    id: string;
    title: string;
    content: ReactNode;
  }[];
  relatedLink: {
    href: string;
    label: string;
  };
};

export function LegalPageLayout({
  eyebrow,
  title,
  description,
  lastUpdated,
  summaryItems,
  sections,
  relatedLink,
}: LegalPageLayoutProps) {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <SiteHeader backHref="/" backLabel="Beranda" />

      <section className="mx-auto w-full max-w-6xl px-5 py-10 md:py-14">
        <div className="max-w-3xl">
          <p className="text-sm font-medium text-primary">{eyebrow}</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 md:text-5xl md:leading-tight">
            {title}
          </h1>
          <p className="mt-4 text-base leading-7 text-slate-600">
            {description}
          </p>
          <p className="mt-4 text-sm text-muted-foreground">
            Terakhir diperbarui: {lastUpdated}
          </p>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[280px_1fr] lg:items-start">
          <aside className="space-y-4 lg:sticky lg:top-24 lg:max-h-[calc(100dvh-7rem)] lg:overflow-y-auto lg:pr-1">
            <Card className="rounded-lg border-slate-200 bg-white shadow-sm">
              <CardContent className="p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                  Ringkasan
                </p>
                <div className="mt-4 space-y-3">
                  {summaryItems.map((item) => (
                    <div key={item} className="flex gap-2.5">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                      <p className="text-sm leading-6 text-slate-600">
                        {item}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-lg border-slate-200 bg-white shadow-sm">
              <CardContent className="p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                  Daftar isi
                </p>
                <nav className="mt-3 space-y-1" aria-label="Daftar isi legal">
                  {sections.map((section, index) => (
                    <Link
                      key={section.id}
                      href={`#${section.id}`}
                      className="flex rounded-md px-2 py-1.5 text-sm leading-5 text-muted-foreground transition hover:bg-muted/70 hover:text-foreground"
                    >
                      <span className="mr-2 font-mono text-xs text-primary">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      {section.title}
                    </Link>
                  ))}
                </nav>
              </CardContent>
            </Card>
          </aside>

          <div className="space-y-4">
            {sections.map((section, index) => (
              <Card
                key={section.id}
                id={section.id}
                className="scroll-mt-24 rounded-lg border-slate-200 bg-white shadow-sm"
              >
                <CardContent className="p-5 md:p-6">
                  <div className="mb-4 flex items-start gap-3">
                    <span className="mt-1 font-mono text-sm font-semibold text-primary">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <h2 className="text-xl font-semibold tracking-tight text-slate-950">
                      {section.title}
                    </h2>
                  </div>
                  <div className="space-y-4 text-sm leading-7 text-slate-600 [&_a]:font-medium [&_a]:text-primary [&_li]:pl-1 [&_ul]:ml-5 [&_ul]:list-disc [&_strong]:font-semibold [&_strong]:text-slate-950">
                    {section.content}
                  </div>
                </CardContent>
              </Card>
            ))}

            <Card className="rounded-lg border-slate-200 bg-white shadow-sm">
              <CardContent className="flex flex-col gap-3 p-5 text-sm leading-6 text-slate-600 md:flex-row md:items-center md:justify-between">
                <p>Dokumen terkait juga tersedia untuk dibaca.</p>
                <Link href={relatedLink.href} className="font-medium text-primary">
                  {relatedLink.label}
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </main>
  );
}
