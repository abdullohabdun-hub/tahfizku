CREATE TYPE "public"."billing_action" AS ENUM('aktifkan', 'suspend', 'perpanjang_trial', 'ubah_catatan');--> statement-breakpoint
CREATE TYPE "public"."tenant_status" AS ENUM('trial', 'aktif', 'suspend');--> statement-breakpoint
CREATE TABLE "billing_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"action" "billing_action" NOT NULL,
	"status_before" "tenant_status",
	"status_after" "tenant_status",
	"catatan" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "tenants" ADD COLUMN "status" "tenant_status" DEFAULT 'trial' NOT NULL;--> statement-breakpoint
ALTER TABLE "tenants" ADD COLUMN "trial_ends_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "tenants" ADD COLUMN "email" varchar(255);--> statement-breakpoint
ALTER TABLE "tenants" ADD COLUMN "no_wa" varchar(50);--> statement-breakpoint
ALTER TABLE "tenants" ADD COLUMN "catatan" text;--> statement-breakpoint
ALTER TABLE "tenants" ADD COLUMN "last_active_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "billing_logs" ADD CONSTRAINT "billing_logs_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
UPDATE "tenants" SET "status" = 'aktif' WHERE "slug" != '_system';