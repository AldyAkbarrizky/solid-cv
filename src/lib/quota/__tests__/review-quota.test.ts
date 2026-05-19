/* eslint-disable @typescript-eslint/no-explicit-any */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { db } from "@/db";
import {
  getReviewQuotaStatus,
  reserveReviewQuota,
} from "@/lib/quota/review-quota";

// ─────────────────────────────────────────────────────────────────────────────
// Module mocks  (vi.mock calls are hoisted before imports by Vitest)
// ─────────────────────────────────────────────────────────────────────────────

vi.mock("@/db", () => {
  const mockDb = {
    select: vi.fn(),
    transaction: vi.fn(),
    insert: vi.fn(),
    delete: vi.fn(),
    update: vi.fn(),
  };
  return { db: mockDb };
});

vi.mock("@/lib/security/request-identity", () => ({
  getRequestIdentityHash: vi.fn().mockReturnValue("test-hash-abc123"),
}));

// ─────────────────────────────────────────────────────────────────────────────
// Typed reference to the mocked db
// ─────────────────────────────────────────────────────────────────────────────

const mockDb = vi.mocked(db);

// ─────────────────────────────────────────────────────────────────────────────
// Shared fixtures
// ─────────────────────────────────────────────────────────────────────────────

const fakeInput = new Headers({ "x-forwarded-for": "1.2.3.4" });

/**
 * Creates a chainable mock that satisfies both the `.limit(n)` path and the
 * "no-limit" path (where the chain is awaited directly via its `.then`).
 *
 *   await db.select().from(t).where(c)          → resolved value
 *   await db.select().from(t).where(c).limit(1) → resolved value
 */
function makeSelectMock(resolved: unknown) {
  const p = Promise.resolve(resolved);
  const chain: any = {
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnValue(p),
    // Make the chain itself thenable so it resolves when no .limit() is called
    then: p.then.bind(p),
    catch: p.catch.bind(p),
    finally: p.finally.bind(p),
  };
  return chain;
}

/**
 * Creates a mock for Drizzle insert chains:
 *   tx.insert(table).values({...}).returning({...}) → resolved value
 */
function makeInsertMock(returning: unknown) {
  const p = Promise.resolve(returning);
  return {
    values: vi.fn().mockReturnThis(),
    returning: vi.fn().mockReturnValue(p),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Active entitlement fixture (currentPeriodEnd far in the future)
// ─────────────────────────────────────────────────────────────────────────────

const fakeEntitlement = {
  id: "ent-1",
  userId: "user-1",
  planCode: "paid_basic",
  status: "active",
  reviewQuotaLimit: 60,
  currentPeriodStart: new Date("2025-01-01"),
  currentPeriodEnd: new Date("2099-12-31"), // far future → always valid
  createdAt: new Date(),
  updatedAt: new Date(),
};

// ─────────────────────────────────────────────────────────────────────────────
// Test suite
// ─────────────────────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks();
});

// ══════════════════════════════════════════════════════════════════════════════
describe("getReviewQuotaStatus", () => {
  // ── Guest ─────────────────────────────────────────────────────────────────

  it("1. guest – kuota masih ada (used=0, remaining=1)", async () => {
    mockDb.select.mockReturnValueOnce(makeSelectMock([{ total: 0 }]));

    const result = await getReviewQuotaStatus({
      input: fakeInput,
      userId: null,
    });

    expect(result).toMatchObject({
      allowed: true,
      limit: 1,
      used: 0,
      remaining: 1,
      scope: "guest",
      planCode: "guest",
    });
  });

  it("2. guest – kuota habis (used=1, remaining=0)", async () => {
    mockDb.select.mockReturnValueOnce(makeSelectMock([{ total: 1 }]));

    const result = await getReviewQuotaStatus({
      input: fakeInput,
      userId: null,
    });

    expect(result).toMatchObject({ allowed: false, remaining: 0 });
  });

  // ── Free user (no entitlement) ────────────────────────────────────────────

  it("3. free user – kuota masih ada (used=10, remaining=5)", async () => {
    mockDb.select
      .mockReturnValueOnce(makeSelectMock([])) // getActiveUserEntitlement → []
      .mockReturnValueOnce(makeSelectMock([{ total: 10 }])); // countUserUsage

    const result = await getReviewQuotaStatus({
      input: fakeInput,
      userId: "user-1",
    });

    expect(result).toMatchObject({
      allowed: true,
      limit: 15,
      used: 10,
      remaining: 5,
      planCode: "free",
    });
  });

  it("4. free user – kuota habis (used=15, remaining=0)", async () => {
    mockDb.select
      .mockReturnValueOnce(makeSelectMock([]))
      .mockReturnValueOnce(makeSelectMock([{ total: 15 }]));

    const result = await getReviewQuotaStatus({
      input: fakeInput,
      userId: "user-1",
    });

    expect(result).toMatchObject({ allowed: false, remaining: 0 });
  });

  // ── Paid basic (active entitlement) ───────────────────────────────────────

  it("5. paid_basic aktif – kuota masih ada (used=5, remaining=55)", async () => {
    mockDb.select
      .mockReturnValueOnce(makeSelectMock([fakeEntitlement]))
      .mockReturnValueOnce(makeSelectMock([{ total: 5 }]));

    const result = await getReviewQuotaStatus({
      input: fakeInput,
      userId: "user-1",
    });

    expect(result).toMatchObject({
      allowed: true,
      limit: 60,
      used: 5,
      remaining: 55,
      planCode: "paid_basic",
    });
  });

  it("6. entitlement expired – fallback ke free (limit=15)", async () => {
    const expiredEntitlement = {
      ...fakeEntitlement,
      currentPeriodEnd: new Date("2020-01-01"), // past → triggers fallback
    };

    mockDb.select
      .mockReturnValueOnce(makeSelectMock([expiredEntitlement]))
      .mockReturnValueOnce(makeSelectMock([{ total: 3 }]));

    const result = await getReviewQuotaStatus({
      input: fakeInput,
      userId: "user-1",
    });

    expect(result).toMatchObject({
      allowed: true,
      limit: 15,
      planCode: "free",
    });
  });
});

// ══════════════════════════════════════════════════════════════════════════════
describe("reserveReviewQuota", () => {
  // Helper: build a fresh tx mock with pre-configured select/insert queues
  function makeTxMock() {
    return {
      execute: vi.fn().mockResolvedValue(undefined), // advisory lock
      select: vi.fn(),
      insert: vi.fn(),
    };
  }

  // ── Guest ─────────────────────────────────────────────────────────────────

  it("7. guest – berhasil reserve (used=0 < limit=1)", async () => {
    const txMock = makeTxMock();
    txMock.select.mockReturnValueOnce(makeSelectMock([{ total: 0 }]));
    txMock.insert.mockReturnValueOnce(makeInsertMock([{ id: "event-uuid-1" }]));
    mockDb.transaction.mockImplementation((fn: any) => fn(txMock));

    const result = await reserveReviewQuota({ input: fakeInput, userId: null });

    expect(result).toMatchObject({
      allowed: true,
      usageEventId: "event-uuid-1",
      used: 1,
      remaining: 0,
    });
  });

  it("8. guest – kuota sudah penuh (used=1 = limit=1)", async () => {
    const txMock = makeTxMock();
    txMock.select.mockReturnValueOnce(makeSelectMock([{ total: 1 }]));
    mockDb.transaction.mockImplementation((fn: any) => fn(txMock));

    const result = await reserveReviewQuota({ input: fakeInput, userId: null });

    expect(result).toMatchObject({ allowed: false, remaining: 0 });
    expect(result.usageEventId).toBeUndefined();
    expect(txMock.insert).not.toHaveBeenCalled();
  });

  // ── Free user ─────────────────────────────────────────────────────────────

  it("9. free user – berhasil reserve (no entitlement, used=0)", async () => {
    const txMock = makeTxMock();
    txMock.select
      .mockReturnValueOnce(makeSelectMock([])) // entitlement query → none
      .mockReturnValueOnce(makeSelectMock([{ total: 0 }])); // usage count
    txMock.insert.mockReturnValueOnce(makeInsertMock([{ id: "event-uuid-2" }]));
    mockDb.transaction.mockImplementation((fn: any) => fn(txMock));

    const result = await reserveReviewQuota({
      input: fakeInput,
      userId: "user-1",
    });

    expect(result).toMatchObject({
      allowed: true,
      usageEventId: "event-uuid-2",
      limit: 15,
    });
  });

  // ── Concurrent protection ─────────────────────────────────────────────────

  it("10. db.transaction sempre dipanggil (advisory lock / concurrent protection)", async () => {
    const txMock = makeTxMock();
    txMock.select.mockReturnValueOnce(makeSelectMock([{ total: 0 }]));
    txMock.insert.mockReturnValueOnce(makeInsertMock([{ id: "event-uuid-3" }]));
    mockDb.transaction.mockImplementation((fn: any) => fn(txMock));

    await reserveReviewQuota({ input: fakeInput, userId: null });

    expect(mockDb.transaction).toHaveBeenCalledOnce();
  });
});
