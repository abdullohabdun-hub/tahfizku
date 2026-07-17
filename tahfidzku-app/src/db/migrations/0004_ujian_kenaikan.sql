-- Migration: 0004_ujian_kenaikan.sql
-- Menambahkan fitur Ujian Kenaikan Juz

-- 1. Tambah kolom juz_ujian_pending di tabel santri
ALTER TABLE "santri" ADD COLUMN "juz_ujian_pending" integer;

-- 2. Buat enum baru untuk ujian
CREATE TYPE "status_ujian"    AS ENUM ('lulus', 'tidak_lulus');
CREATE TYPE "skor_kelancaran" AS ENUM ('lancar', 'mengulang', 'terbata');
CREATE TYPE "skor_tajwid"     AS ENUM ('sempurna', 'cukup', 'kurang');

-- 3. Buat tabel ujian
CREATE TABLE "ujian" (
  "id"          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenant_id"   uuid NOT NULL REFERENCES "tenants"("id")  ON DELETE CASCADE,
  "santri_id"   uuid NOT NULL REFERENCES "santri"("id")   ON DELETE CASCADE,
  "ustadz_id"   uuid NOT NULL REFERENCES "users"("id")    ON DELETE CASCADE,
  "juz"         integer NOT NULL,
  "kelancaran"  "skor_kelancaran" NOT NULL,
  "tajwid"      "skor_tajwid" NOT NULL,
  "skor"        integer NOT NULL,
  "status"      "status_ujian" NOT NULL,
  "catatan"     text,
  "attempt"     integer NOT NULL DEFAULT 1,
  "created_at"  timestamptz NOT NULL DEFAULT now()
);
