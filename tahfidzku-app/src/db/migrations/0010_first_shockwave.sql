CREATE TYPE "public"."status_absensi" AS ENUM('hadir', 'izin', 'sakit', 'alpa', 'terlambat');--> statement-breakpoint
CREATE TABLE "absensi" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"sesi_kelas_id" uuid NOT NULL,
	"santri_id" uuid NOT NULL,
	"status" "status_absensi" NOT NULL,
	"catatan" text,
	"created_by" uuid NOT NULL,
	"updated_by" uuid,
	"previous_data" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "sesi_kelas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"kelas_id" uuid NOT NULL,
	"tanggal" date NOT NULL,
	"created_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "absensi" ADD CONSTRAINT "absensi_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "absensi" ADD CONSTRAINT "absensi_sesi_kelas_id_sesi_kelas_id_fk" FOREIGN KEY ("sesi_kelas_id") REFERENCES "public"."sesi_kelas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "absensi" ADD CONSTRAINT "absensi_santri_id_santri_id_fk" FOREIGN KEY ("santri_id") REFERENCES "public"."santri"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "absensi" ADD CONSTRAINT "absensi_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "absensi" ADD CONSTRAINT "absensi_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sesi_kelas" ADD CONSTRAINT "sesi_kelas_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sesi_kelas" ADD CONSTRAINT "sesi_kelas_kelas_id_kelas_id_fk" FOREIGN KEY ("kelas_id") REFERENCES "public"."kelas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sesi_kelas" ADD CONSTRAINT "sesi_kelas_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "uniq_absensi_santri_sesi" ON "absensi" USING btree ("santri_id","sesi_kelas_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uniq_sesi_kelas_tanggal" ON "sesi_kelas" USING btree ("kelas_id","tanggal");