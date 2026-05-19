import { and, count, eq, gte, lt, sql } from "drizzle-orm";

import { db } from "@/db";
import { reviewUsageEvents, userEntitlements } from "@/db/schema";
import { getRequestIdentityHash } from "@/lib/security/request-identity";

const GUEST_REVIEW_LIMIT = 1;
const FREE_USER_REVIEW_LIMIT = 3;

type ReviewQuotaStatus = {
  allowed: boolean;
  scope: "guest" | "user";
  planCode: string;
  limit: number;
  used: number;
  remaining: number;
  periodStart: Date;
  periodEnd: Date;
  identityHash?: string;
  userId?: string;
};

type ReserveReviewQuotaResult = ReviewQuotaStatus & {
  usageEventId?: string;
};

function getMonthPeriod(now = new Date()) {
  const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  return {
    periodStart,
    periodEnd,
  };
}

function getGuestPeriod(now = new Date()) {
  return {
    periodStart: new Date(now.getTime() - 24 * 60 * 60 * 1000),
    periodEnd: new Date(now.getTime() + 24 * 60 * 60 * 1000),
  };
}

async function getActiveUserEntitlement(userId: string) {
  const [entitlement] = await db
    .select()
    .from(userEntitlements)
    .where(
      and(
        eq(userEntitlements.userId, userId),
        eq(userEntitlements.status, "active"),
      ),
    )
    .limit(1);

  return entitlement ?? null;
}

async function countUserUsage({
  userId,
  periodStart,
  periodEnd,
}: {
  userId: string;
  periodStart: Date;
  periodEnd: Date;
}) {
  const [row] = await db
    .select({
      total: count(),
    })
    .from(reviewUsageEvents)
    .where(
      and(
        eq(reviewUsageEvents.userId, userId),
        gte(reviewUsageEvents.createdAt, periodStart),
        lt(reviewUsageEvents.createdAt, periodEnd),
      ),
    );

  return row?.total || 0;
}

async function countGuestUsage({
  identityHash,
  periodStart,
}: {
  identityHash: string;
  periodStart: Date;
}) {
  const [row] = await db
    .select({
      total: count(),
    })
    .from(reviewUsageEvents)
    .where(
      and(
        eq(reviewUsageEvents.identityHash, identityHash),
        eq(reviewUsageEvents.scope, "guest"),
        gte(reviewUsageEvents.createdAt, periodStart),
      ),
    );

  return row?.total || 0;
}

export async function getReviewQuotaStatus({
  input,
  userId,
}: {
  input: Request | Headers;
  userId?: string | null;
}): Promise<ReviewQuotaStatus> {
  const now = new Date();

  if (!userId) {
    const identityHash = getRequestIdentityHash(input);
    const { periodStart, periodEnd } = getGuestPeriod(now);
    const used = await countGuestUsage({
      identityHash,
      periodStart,
    });

    const remaining = Math.max(GUEST_REVIEW_LIMIT - used, 0);

    return {
      allowed: remaining > 0,
      scope: "guest",
      planCode: "guest",
      limit: GUEST_REVIEW_LIMIT,
      used,
      remaining,
      periodStart,
      periodEnd,
      identityHash,
    };
  }

  const entitlement = await getActiveUserEntitlement(userId);
  const defaultPeriod = getMonthPeriod(now);

  const planCode = entitlement?.planCode || "free";
  const limit = entitlement?.reviewQuotaLimit || FREE_USER_REVIEW_LIMIT;
  const periodStart =
    entitlement?.currentPeriodStart || defaultPeriod.periodStart;
  const periodEnd = entitlement?.currentPeriodEnd || defaultPeriod.periodEnd;

  const isPeriodValid = periodEnd.getTime() > now.getTime();

  const effectivePlanCode = isPeriodValid ? planCode : "free";
  const effectiveLimit = isPeriodValid ? limit : FREE_USER_REVIEW_LIMIT;
  const effectivePeriodStart = isPeriodValid
    ? periodStart
    : defaultPeriod.periodStart;
  const effectivePeriodEnd = isPeriodValid
    ? periodEnd
    : defaultPeriod.periodEnd;

  const used = await countUserUsage({
    userId,
    periodStart: effectivePeriodStart,
    periodEnd: effectivePeriodEnd,
  });

  const remaining = Math.max(effectiveLimit - used, 0);

  return {
    allowed: remaining > 0,
    scope: "user",
    planCode: effectivePlanCode,
    limit: effectiveLimit,
    used,
    remaining,
    periodStart: effectivePeriodStart,
    periodEnd: effectivePeriodEnd,
    userId,
  };
}

export async function reserveReviewQuota({
  input,
  userId,
}: {
  input: Request | Headers;
  userId?: string | null;
}): Promise<ReserveReviewQuotaResult> {
  const now = new Date();
  const identityHash = getRequestIdentityHash(input);

  if (!userId) {
    const { periodStart, periodEnd } = getGuestPeriod(now);

    return db.transaction(async (tx) => {
      const lockKey = `quota:guest:${identityHash}`;

      await tx.execute(
        sql`select pg_advisory_xact_lock(hashtextextended(${lockKey}, 0))`,
      );

      const [usedRow] = await tx
        .select({
          total: count(),
        })
        .from(reviewUsageEvents)
        .where(
          and(
            eq(reviewUsageEvents.identityHash, identityHash),
            eq(reviewUsageEvents.scope, "guest"),
            gte(reviewUsageEvents.createdAt, periodStart),
          ),
        );

      const used = usedRow?.total || 0;

      const remaining = Math.max(GUEST_REVIEW_LIMIT - used, 0);

      if (remaining <= 0) {
        return {
          allowed: false,
          scope: "guest",
          planCode: "guest",
          limit: GUEST_REVIEW_LIMIT,
          used,
          remaining,
          periodStart,
          periodEnd,
          identityHash,
        };
      }

      const [usageEvent] = await tx
        .insert(reviewUsageEvents)
        .values({
          userId: null,
          identityHash,
          scope: "guest",
          planCode: "guest",
          reviewId: null,
        })
        .returning({
          id: reviewUsageEvents.id,
        });

      return {
        allowed: true,
        scope: "guest",
        planCode: "guest",
        limit: GUEST_REVIEW_LIMIT,
        used: used + 1,
        remaining: Math.max(GUEST_REVIEW_LIMIT - (used + 1), 0),
        periodStart,
        periodEnd,
        identityHash,
        usageEventId: usageEvent.id,
      };
    });
  }

  return db.transaction(async (tx) => {
    const lockKey = `quota:user:${userId}`;

    await tx.execute(
      sql`select pg_advisory_xact_lock(hashtextextended(${lockKey}, 0))`,
    );

    const [entitlement] = await tx
      .select()
      .from(userEntitlements)
      .where(
        and(
          eq(userEntitlements.userId, userId),
          eq(userEntitlements.status, "active"),
        ),
      )
      .limit(1);
    const defaultPeriod = getMonthPeriod(now);

    const planCode = entitlement?.planCode || "free";
    const limit = entitlement?.reviewQuotaLimit || FREE_USER_REVIEW_LIMIT;
    const periodStart = entitlement?.currentPeriodStart || defaultPeriod.periodStart;
    const periodEnd = entitlement?.currentPeriodEnd || defaultPeriod.periodEnd;

    const isPeriodValid = periodEnd.getTime() > now.getTime();
    const effectivePlanCode = isPeriodValid ? planCode : "free";
    const effectiveLimit = isPeriodValid ? limit : FREE_USER_REVIEW_LIMIT;
    const effectivePeriodStart = isPeriodValid
      ? periodStart
      : defaultPeriod.periodStart;
    const effectivePeriodEnd = isPeriodValid ? periodEnd : defaultPeriod.periodEnd;

    const [usedRow] = await tx
      .select({
        total: count(),
      })
      .from(reviewUsageEvents)
      .where(
        and(
          eq(reviewUsageEvents.userId, userId),
          gte(reviewUsageEvents.createdAt, effectivePeriodStart),
          lt(reviewUsageEvents.createdAt, effectivePeriodEnd),
        ),
      );

    const used = usedRow?.total || 0;

    const remaining = Math.max(effectiveLimit - used, 0);

    if (remaining <= 0) {
      return {
        allowed: false,
        scope: "user",
        planCode: effectivePlanCode,
        limit: effectiveLimit,
        used,
        remaining,
        periodStart: effectivePeriodStart,
        periodEnd: effectivePeriodEnd,
        userId,
      };
    }

    const [usageEvent] = await tx
      .insert(reviewUsageEvents)
      .values({
        userId,
        identityHash,
        scope: "user",
        planCode: effectivePlanCode,
        reviewId: null,
      })
      .returning({
        id: reviewUsageEvents.id,
      });

    return {
      allowed: true,
      scope: "user",
      planCode: effectivePlanCode,
      limit: effectiveLimit,
      used: used + 1,
      remaining: Math.max(effectiveLimit - (used + 1), 0),
      periodStart: effectivePeriodStart,
      periodEnd: effectivePeriodEnd,
      userId,
      usageEventId: usageEvent.id,
    };
  });
}

export async function finalizeReservedReviewUsage({
  usageEventId,
  reviewId,
}: {
  usageEventId: string;
  reviewId: string;
}) {
  await db
    .update(reviewUsageEvents)
    .set({
      reviewId,
    })
    .where(eq(reviewUsageEvents.id, usageEventId));
}

export async function releaseReservedReviewUsage(usageEventId: string) {
  await db.delete(reviewUsageEvents).where(eq(reviewUsageEvents.id, usageEventId));
}
