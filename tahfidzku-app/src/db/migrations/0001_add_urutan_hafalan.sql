-- Add urutan_hafalan column without NOT NULL initially
ALTER TABLE "santri" ADD COLUMN "urutan_hafalan" integer[] DEFAULT '{1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30}';

-- Backfill data for existing rows
UPDATE "santri" SET "urutan_hafalan" = '{1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30}' WHERE "urutan_hafalan" IS NULL;

-- Set NOT NULL
ALTER TABLE "santri" ALTER COLUMN "urutan_hafalan" SET NOT NULL;
