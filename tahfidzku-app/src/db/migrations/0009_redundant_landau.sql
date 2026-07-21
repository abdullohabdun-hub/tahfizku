CREATE TYPE "public"."hari" AS ENUM('senin', 'selasa', 'rabu', 'kamis', 'jumat', 'sabtu', 'minggu');--> statement-breakpoint
ALTER TABLE "kelas" ADD COLUMN "hari_pertemuan" "hari"[] DEFAULT '{}'::hari[] NOT NULL;--> statement-breakpoint
ALTER TABLE "kelas" ADD COLUMN "jam_mulai" time;--> statement-breakpoint
ALTER TABLE "kelas" ADD COLUMN "jam_selesai" time;