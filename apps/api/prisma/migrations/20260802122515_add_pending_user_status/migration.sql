-- AlterEnum
ALTER TYPE "UserStatus" ADD VALUE 'PENDING';

-- CreateIndex
CREATE INDEX "shipment_request_created_at_idx" ON "shipment_request"("created_at");
