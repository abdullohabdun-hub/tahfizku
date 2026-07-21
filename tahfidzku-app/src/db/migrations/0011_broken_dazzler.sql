CREATE TABLE "rubrik_opsi" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"rubrik_id" uuid NOT NULL,
	"value" varchar(50) NOT NULL,
	"label" varchar(100) NOT NULL,
	"poin" integer,
	"urutan" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rubrik_penilaian" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"key" varchar(50) NOT NULL,
	"label" varchar(100) NOT NULL,
	"urutan" integer DEFAULT 0 NOT NULL,
	"aktif" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
ALTER TABLE "setoran" ALTER COLUMN "kualitas" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "setoran" ADD COLUMN "penilaian_kustom" jsonb;--> statement-breakpoint
ALTER TABLE "rubrik_opsi" ADD CONSTRAINT "rubrik_opsi_rubrik_id_rubrik_penilaian_id_fk" FOREIGN KEY ("rubrik_id") REFERENCES "public"."rubrik_penilaian"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rubrik_penilaian" ADD CONSTRAINT "rubrik_penilaian_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "uniq_rubrik_key_tenant" ON "rubrik_penilaian" USING btree ("tenant_id","key");