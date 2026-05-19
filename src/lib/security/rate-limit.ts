import { and, count, eq, gte, sql } from "drizzle-orm";

import { db } from "@/db";
import { reviewAttempts } from "@/db/schema";
import { getRequestIdentityHash } from "@/lib/security/request-identity";

type CheckReviewRateLimitParams = {
  route: string;
};

type CheckReviewRateLimitResult = {
  allowed: boolean;
  retryAfterSeconds?: number;
};

export async function checkReviewRateLimit(
  request: Request,
  { route }: CheckReviewRateLimitParams,
): Promise<CheckReviewRateLimitResult> {
  const maxRequests = Number(process.env.REVIEW_RATE_LIMIT_MAX || 5);
  const windowSeconds = Number(
    process.env.REVIEW_RATE_LIMIT_WINDOW_SECONDS || 3600,
  );

  const identityHash = getRequestIdentityHash(request);

  const windowStart = new Date(Date.now() - windowSeconds * 1000);

  return db.transaction(async (tx) => {
    const lockKey = `rate-limit:${route}:${identityHash}`;

    await tx.execute(
      sql`select pg_advisory_xact_lock(hashtextextended(${lockKey}, 0))`,
    );

    const [row] = await tx
      .select({
        total: count(),
      })
      .from(reviewAttempts)
      .where(
        and(
          eq(reviewAttempts.identityHash, identityHash),
          eq(reviewAttempts.route, route),
          gte(reviewAttempts.createdAt, windowStart),
        ),
      );

    if ((row?.total || 0) >= maxRequests) {
      return {
        allowed: false,
        retryAfterSeconds: windowSeconds,
      };
    }

    await tx.insert(reviewAttempts).values({
      identityHash,
      route,
    });

    return {
      allowed: true,
    };
  });
}
