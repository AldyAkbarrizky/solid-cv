import { and, count, eq, gte } from "drizzle-orm";

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

  const [row] = await db
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

  await db.insert(reviewAttempts).values({
    identityHash,
    route,
  });

  return {
    allowed: true,
  };
}
