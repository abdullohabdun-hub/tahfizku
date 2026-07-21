CREATE TYPE "public"."skor_kelancaran" AS ENUM('lancar', 'mengulang', 'terbata');--> statement-breakpoint
CREATE TYPE "public"."skor_tajwid" AS ENUM('sempurna', 'cukup', 'kurang');--> statement-breakpoint
CREATE TYPE "public"."status_ujian" AS ENUM('lulus', 'tidak_lulus');--> statement-breakpoint
CREATE TABLE "ujian" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"santri_id" uuid NOT NULL,
	"ustadz_id" uuid NOT NULL,
	"juz" integer NOT NULL,
	"kelancaran" "skor_kelancaran" NOT NULL,
	"tajwid" "skor_tajwid" NOT NULL,
	"skor" integer NOT NULL,
	"status" "status_ujian" NOT NULL,
	"catatan" text,
	"attempt" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "santri" ADD COLUMN "juz_ujian_pending" integer;--> statement-breakpoint
ALTER TABLE "ujian" ADD CONSTRAINT "ujian_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ujian" ADD CONSTRAINT "ujian_santri_id_santri_id_fk" FOREIGN KEY ("santri_id") REFERENCES "public"."santri"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ujian" ADD CONSTRAINT "ujian_ustadz_id_users_id_fk" FOREIGN KEY ("ustadz_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;