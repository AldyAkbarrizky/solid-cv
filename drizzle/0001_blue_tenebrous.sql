CREATE TABLE "review_attempts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"identity_hash" varchar(64) NOT NULL,
	"route" varchar(120) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "review_attempts_identity_created_at_idx" ON "review_attempts" USING btree ("identity_hash","created_at");