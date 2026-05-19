import {
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const cvReviews = pgTable("cv_reviews", {
  id: uuid("id").defaultRandom().primaryKey(),

  userId: text("user_id"),

  targetRole: varchar("target_role", { length: 120 }).notNull(),

  overallScore: integer("overall_score").notNull(),

  resultJson: jsonb("result_json").notNull(),

  aiProvider: varchar("ai_provider", { length: 50 }).notNull(),
  aiModel: varchar("ai_model", { length: 100 }).notNull(),

  inputTokens: integer("input_tokens"),
  outputTokens: integer("output_tokens"),

  expiresAt: timestamp("expires_at"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const reviewAttempts = pgTable(
  "review_attempts",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    identityHash: varchar("identity_hash", { length: 64 }).notNull(),
    route: varchar("route", { length: 120 }).notNull(),

    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("review_attempts_identity_created_at_idx").on(
      table.identityHash,
      table.createdAt,
    ),
  ],
);

export const userEntitlements = pgTable(
  "user_entitlements",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    userId: text("user_id").notNull(),

    planCode: varchar("plan_code", { length: 40 }).notNull().default("free"),
    status: varchar("status", { length: 30 }).notNull().default("active"),

    reviewQuotaLimit: integer("review_quota_limit").notNull().default(3),

    currentPeriodStart: timestamp("current_period_start").notNull(),
    currentPeriodEnd: timestamp("current_period_end").notNull(),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("user_entitlements_user_id_idx").on(table.userId),
    index("user_entitlements_user_status_idx").on(table.userId, table.status),
  ],
);

export const reviewUsageEvents = pgTable(
  "review_usage_events",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    userId: text("user_id"),
    identityHash: varchar("identity_hash", { length: 64 }),

    scope: varchar("scope", { length: 20 }).notNull(), // guest | user
    planCode: varchar("plan_code", { length: 40 }).notNull(),

    reviewId: uuid("review_id"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("review_usage_events_user_created_at_idx").on(
      table.userId,
      table.createdAt,
    ),
    index("review_usage_events_identity_created_at_idx").on(
      table.identityHash,
      table.createdAt,
    ),
  ],
);

export * from "./auth-schema";
