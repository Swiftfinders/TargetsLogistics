-- CreateEnum
CREATE TYPE "LoadSize" AS ENUM ('SMALL', 'MEDIUM', 'LARGE');

-- AlterTable: add with a default so existing rows are backfilled
ALTER TABLE "shipment_request" ADD COLUMN "load_size" "LoadSize" NOT NULL DEFAULT 'SMALL';
