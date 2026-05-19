CREATE TABLE "cv_reviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"target_role" varchar(120) NOT NULL,
	"overall_score" integer NOT NULL,
	"result_json" jsonb NOT NULL,
	"ai_provider" varchar(50) NOT NULL,
	"ai_model" varchar(100) NOT NULL,
	"input_tokens" integer,
	"output_tokens" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
