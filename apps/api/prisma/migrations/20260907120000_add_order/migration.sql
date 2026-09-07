-- CreateEnum
CREATE TYPE "PackageType" AS ENUM ('ENVELOPE', 'BOX', 'PALLET', 'OTHER');

-- CreateEnum
CREATE TYPE "VehicleType" AS ENUM ('CAR', 'MINI_VAN', 'CARGO_VAN', 'OTHER');

-- CreateEnum
CREATE TYPE "ServiceLevel" AS ENUM ('SAME_DAY', 'NEXT_DAY', 'FOUR_HOURS', 'HOT_RUSH', 'CRITICAL');

-- CreateTable
CREATE TABLE "order" (
    "id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "account_id" TEXT,
    "created_by_user_id" TEXT,
    "pickup_contact_name" TEXT,
    "pickup_company" TEXT,
    "pickup_phone" TEXT,
    "pickup_address" TEXT NOT NULL,
    "delivery_contact_name" TEXT,
    "delivery_company" TEXT,
    "delivery_phone" TEXT,
    "delivery_address" TEXT NOT NULL,
    "package_type" "PackageType",
    "pieces" INTEGER,
    "weight_kg" DOUBLE PRECISION,
    "dimensions" TEXT,
    "contents" TEXT,
    "vehicle_type" "VehicleType",
    "service_level" "ServiceLevel" NOT NULL,
    "pickup_date" TEXT,
    "pickup_time" TEXT,
    "special_instructions" TEXT,
    "estimated_price_cents" INTEGER NOT NULL,
    "status" "RequestStatus" NOT NULL DEFAULT 'NEW',
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "order_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "order_reference_key" ON "order"("reference");

-- CreateIndex
CREATE INDEX "order_account_id_created_at_idx" ON "order"("account_id", "created_at");

-- CreateIndex
CREATE INDEX "order_status_idx" ON "order"("status");

-- CreateIndex
CREATE INDEX "order_created_at_idx" ON "order"("created_at");

-- AddForeignKey
ALTER TABLE "order" ADD CONSTRAINT "order_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order" ADD CONSTRAINT "order_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
