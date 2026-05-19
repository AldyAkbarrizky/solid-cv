import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import { userEntitlements } from "@/db/schema";

type UpsertUserEntitlementParams = {
  userId: string;
  planCode: string;
  reviewQuotaLimit: number;
  activeDays: number;
};

export async function upsertUserEntitlement({
  userId,
  planCode,
  reviewQuotaLimit,
  activeDays,
}: UpsertUserEntitlementParams) {
  const now = new Date();
  const periodEnd = new Date(now.getTime() + activeDays * 24 * 60 * 60 * 1000);

  const [existing] = await db
    .select()
    .from(userEntitlements)
    .where(
      and(
        eq(userEntitlements.userId, userId),
        eq(userEntitlements.status, "active"),
      ),
    )
    .limit(1);

  if (existing) {
    const [updated] = await db
      .update(userEntitlements)
      .set({
        planCode,
        reviewQuotaLimit,
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
        updatedAt: now,
      })
      .where(eq(userEntitlements.id, existing.id))
      .returning();

    return updated;
  }

  const [created] = await db
    .insert(userEntitlements)
    .values({
      userId,
      planCode,
      status: "active",
      reviewQuotaLimit,
      currentPeriodStart: now,
      currentPeriodEnd: periodEnd,
      createdAt: now,
      updatedAt: now,
    })
    .returning();

  return created;
}
