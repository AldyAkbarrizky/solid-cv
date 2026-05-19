import type { Metadata } from "next";
import { Geist_Mono, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const appUrl = process.env.APP_URL || "https://cv.solidtechno.com";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: "Solid CV - Analisis CV Berbasis AI",
  description:
    "Solid CV membantu pencari kerja menganalisis struktur, kejelasan, dan relevansi CV sebelum melamar kerja.",
  applicationName: "Solid CV",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Solid CV - Analisis CV Berbasis AI",
    description:
      "Review CV sesuai posisi tujuan, dengan privasi file dan rekomendasi perbaikan yang bisa ditindaklanjuti.",
    url: "/",
    siteName: "Solid CV",
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Solid CV - Analisis CV Berbasis AI",
    description:
      "Analisis struktur, kejelasan, relevansi role, dan rekomendasi perbaikan CV.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${plusJakartaSans.variable} ${geistMono.variable} dark h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
