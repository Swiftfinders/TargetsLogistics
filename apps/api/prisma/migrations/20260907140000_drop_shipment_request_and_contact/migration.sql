-- Drop the legacy shipment-request and contact-submission tables, replaced by
-- the unified order model. DropForeignKey first, then tables, then the enums
-- that only those tables used (RequestStatus is kept — the order table uses it).

-- DropForeignKey
ALTER TABLE "shipment_request" DROP CONSTRAINT IF EXISTS "shipment_request_account_id_fkey";
ALTER TABLE "shipment_request" DROP CONSTRAINT IF EXISTS "shipment_request_created_by_user_id_fkey";

-- DropTable
DROP TABLE IF EXISTS "shipment_request";

-- DropTable
DROP TABLE IF EXISTS "contact_submission";

-- DropEnum
DROP TYPE IF EXISTS "ServiceTier";

-- DropEnum
DROP TYPE IF EXISTS "LoadSize";
