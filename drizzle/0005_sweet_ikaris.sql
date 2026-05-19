CREATE TABLE "review_usage_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text,
	"identity_hash" varchar(64),
	"scope" varchar(20) NOT NULL,
	"plan_code" varchar(40) NOT NULL,
	"review_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_entitlements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"plan_code" varchar(40) DEFAULT 'free' NOT NULL,
	"status" varchar(30) DEFAULT 'active' NOT NULL,
	"review_quota_limit" integer DEFAULT 3 NOT NULL,
	"current_period_start" timestamp NOT NULL,
	"current_period_end" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "review_usage_events_user_created_at_idx" ON "review_usage_events" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "review_usage_events_identity_created_at_idx" ON "review_usage_events" USING btree ("identity_hash","created_at");--> statement-breakpoint
CREATE INDEX "user_entitlements_user_id_idx" ON "user_entitlements" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_entitlements_user_status_idx" ON "user_entitlements" USING btree ("user_id","status");