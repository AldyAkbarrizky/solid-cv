import { billingPlans, type PlanCode } from "@/lib/billing/plans";

const currencyFormatter = new Intl.NumberFormat("id-ID");

function formatPrice(price: number) {
  return `Rp${currencyFormatter.format(price)}`;
}

export type PublicPricingPlan = {
  code: "free" | PlanCode;
  checkoutCode?: PlanCode;
  name: string;
  price: string;
  period: string;
  quota: string;
  description: string;
  badge?: string;
  highlighted?: boolean;
  features: string[];
};

export const publicPricingPlans: PublicPricingPlan[] = [
  {
    code: "free",
    name: "Free",
    price: "Rp0",
    period: "/bulan",
    quota: "15 review CV",
    description:
      "Untuk pengguna yang ingin iterasi rutin tanpa biaya bulanan.",
    features: [
      "15 review CV per bulan",
      "Hasil review tersimpan di riwayat akun",
      "Cocok untuk iterasi mingguan",
    ],
  },
  {
    code: billingPlans.paid_basic.code,
    checkoutCode: billingPlans.paid_basic.code,
    name: billingPlans.paid_basic.name,
    price: formatPrice(billingPlans.paid_basic.price),
    period: `/${billingPlans.paid_basic.activeDays} hari`,
    quota: `${billingPlans.paid_basic.reviewQuotaLimit} review CV`,
    description: billingPlans.paid_basic.description,
    badge: "Populer",
    highlighted: true,
    features: [
      `${billingPlans.paid_basic.reviewQuotaLimit} review CV`,
      "Cocok untuk beberapa versi CV",
      "Berlaku 30 hari setelah pembayaran",
    ],
  },
  {
    code: billingPlans.paid_pro.code,
    checkoutCode: billingPlans.paid_pro.code,
    name: billingPlans.paid_pro.name,
    price: formatPrice(billingPlans.paid_pro.price),
    period: `/${billingPlans.paid_pro.activeDays} hari`,
    quota: `${billingPlans.paid_pro.reviewQuotaLimit} review CV`,
    description: billingPlans.paid_pro.description,
    badge: "Kuota besar",
    features: [
      `${billingPlans.paid_pro.reviewQuotaLimit} review CV`,
      "Untuk banyak role dan variasi CV",
      "Berlaku 30 hari setelah pembayaran",
    ],
  },
];

export const pricingComparisonRows = [
  {
    feature: "Kuota review",
    guest: "1 review / 24 jam",
    free: "15 review / bulan",
    basic: `${billingPlans.paid_basic.reviewQuotaLimit} review / 30 hari`,
    pro: `${billingPlans.paid_pro.reviewQuotaLimit} review / 30 hari`,
  },
  {
    feature: "Perlu login",
    guest: "Tidak",
    free: "Ya",
    basic: "Ya",
    pro: "Ya",
  },
  {
    feature: "Riwayat hasil",
    guest: "Lewat URL hasil",
    free: "Tersimpan di akun",
    basic: "Tersimpan di akun",
    pro: "Tersimpan di akun",
  },
  {
    feature: "Analisis sesuai posisi",
    guest: "Tersedia",
    free: "Tersedia",
    basic: "Tersedia",
    pro: "Tersedia",
  },
  {
    feature: "Cocok untuk",
    guest: "Coba sekali",
    free: "Iterasi rutin",
    basic: "Beberapa versi CV",
    pro: "Banyak role dan iterasi",
  },
];
