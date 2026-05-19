CREATE TABLE "payment_orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"plan_code" varchar(40) NOT NULL,
	"merchant_order_id" varchar(50) NOT NULL,
	"duitku_reference" varchar(120),
	"payment_url" text,
	"amount" integer NOT NULL,
	"review_quota_limit" integer NOT NULL,
	"status" varchar(30) DEFAULT 'pending' NOT NULL,
	"payment_code" varchar(50),
	"result_code" varchar(10),
	"paid_at" timestamp,
	"expired_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "payment_orders_merchant_order_id_unique" UNIQUE("merchant_order_id")
);
--> statement-breakpoint
CREATE INDEX "payment_orders_user_id_idx" ON "payment_orders" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "payment_orders_status_idx" ON "payment_orders" USING btree ("status");--> statement-breakpoint
CREATE INDEX "payment_orders_merchant_order_id_idx" ON "payment_orders" USING btree ("merchant_order_id");