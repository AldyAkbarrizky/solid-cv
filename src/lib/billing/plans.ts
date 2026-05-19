export type PlanCode = "paid_basic" | "paid_pro";

export type BillingPlan = {
  code: PlanCode;
  name: string;
  description: string;
  price: number;
  reviewQuotaLimit: number;
  activeDays: number;
};

export const billingPlans: Record<PlanCode, BillingPlan> = {
  paid_basic: {
    code: "paid_basic",
    name: "Basic",
    description:
      "Untuk pencari kerja yang ingin memperbaiki beberapa versi CV.",
    price: 29000,
    reviewQuotaLimit: 60,
    activeDays: 30,
  },
  paid_pro: {
    code: "paid_pro",
    name: "Pro",
    description:
      "Untuk pengguna yang lebih sering menyesuaikan CV ke banyak posisi.",
    price: 79000,
    reviewQuotaLimit: 180,
    activeDays: 30,
  },
};

export function getBillingPlan(planCode: string) {
  return billingPlans[planCode as PlanCode] ?? null;
}
