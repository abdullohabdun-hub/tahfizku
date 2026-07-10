CREATE TYPE "public"."jenis_setoran" AS ENUM('ziyadah', 'sabqi', 'manzil');--> statement-breakpoint
CREATE TYPE "public"."kualitas_bacaan" AS ENUM('lancar', 'mengulang', 'terbata');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('admin', 'ustadz', 'santri', 'wali');--> statement-breakpoint
CREATE TYPE "public"."tipe_santri" AS ENUM('reguler', 'dewasa');--> statement-breakpoint
CREATE TABLE "kelas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"nama" varchar(255) NOT NULL,
	"ustadz_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "santri" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"nama" varchar(255) NOT NULL,
	"tipe" "tipe_santri" DEFAULT 'dewasa' NOT NULL,
	"kelas_id" uuid,
	"target_juz" integer DEFAULT 30 NOT NULL,
	"juz_progress" integer[] DEFAULT '{}',
	"batas_hafalan_juz" integer,
	"batas_hafalan_surah" varchar(100),
	"batas_hafalan_ayat" integer,
	"urutan_hafalan" integer[] DEFAULT '{1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30}' NOT NULL,
	"posisi_terakhir" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "setoran" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"santri_id" uuid NOT NULL,
	"ustadz_id" uuid NOT NULL,
	"jenis" "jenis_setoran" NOT NULL,
	"juz" integer,
	"juz_mulai" integer,
	"juz_selesai" integer,
	"lintas_juz" boolean DEFAULT false,
	"halaman_awal" real,
	"halaman_akhir" real,
	"surah" varchar(100),
	"ayat_awal" integer,
	"ayat_akhir" integer,
	"surah_meta" jsonb,
	"kualitas" "kualitas_bacaan" NOT NULL,
	"catatan" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tenants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nama_lembaga" varchar(255) NOT NULL,
	"slug" varchar(100) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "tenants_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"nama" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" varchar(255) NOT NULL,
	"role" "user_role" NOT NULL,
	"santri_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "kelas" ADD CONSTRAINT "kelas_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kelas" ADD CONSTRAINT "kelas_ustadz_id_users_id_fk" FOREIGN KEY ("ustadz_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "santri" ADD CONSTRAINT "santri_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "santri" ADD CONSTRAINT "santri_kelas_id_kelas_id_fk" FOREIGN KEY ("kelas_id") REFERENCES "public"."kelas"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "setoran" ADD CONSTRAINT "setoran_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "setoran" ADD CONSTRAINT "setoran_santri_id_santri_id_fk" FOREIGN KEY ("santri_id") REFERENCES "public"."santri"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "setoran" ADD CONSTRAINT "setoran_ustadz_id_users_id_fk" FOREIGN KEY ("ustadz_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;