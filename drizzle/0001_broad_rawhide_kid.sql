CREATE TABLE "registration_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"requested_role" text NOT NULL,
	"building_id" uuid,
	"building_name" text NOT NULL,
	"building_address" text NOT NULL,
	"city" text NOT NULL,
	"unit" text,
	"organization_name" text,
	"evidence_note" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"reviewed_by" uuid,
	"reviewed_at" timestamp with time zone,
	"rejection_reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "memberships" ADD COLUMN "role" text DEFAULT 'resident' NOT NULL;--> statement-breakpoint
ALTER TABLE "memberships" ADD COLUMN "status" text DEFAULT 'active' NOT NULL;--> statement-breakpoint
ALTER TABLE "registration_requests" ADD CONSTRAINT "registration_requests_building_id_buildings_id_fk" FOREIGN KEY ("building_id") REFERENCES "public"."buildings"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "registration_requests" ADD CONSTRAINT "registration_requests_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;