-- CreateEnum
CREATE TYPE "payment_receipt_status" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "products" ADD COLUMN     "is_on_sale" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "sale_expires_at" TIMESTAMPTZ(3),
ADD COLUMN     "sale_max_units" INTEGER,
ADD COLUMN     "sale_price" INTEGER,
ADD COLUMN     "sale_started_at" TIMESTAMPTZ(3),
ADD COLUMN     "sale_type" TEXT;

-- CreateTable
CREATE TABLE "payment_receipts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "appointment_id" UUID,
    "client_name" TEXT NOT NULL,
    "client_phone" TEXT,
    "amount" INTEGER NOT NULL DEFAULT 0,
    "status" "payment_receipt_status" NOT NULL DEFAULT 'PENDING',
    "note" TEXT NOT NULL DEFAULT '',
    "bank_origin" TEXT,
    "operation_number" TEXT,
    "ocr_verified" BOOLEAN NOT NULL DEFAULT false,
    "ocr_confidence" DOUBLE PRECISION,
    "channel" TEXT NOT NULL DEFAULT 'whatsapp',
    "image_data" BYTEA,
    "image_mime" TEXT,
    "reviewed_by" TEXT,
    "reviewed_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payment_receipts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "payment_receipts_tenant_id_status_created_at_idx" ON "payment_receipts"("tenant_id", "status", "created_at");

-- CreateIndex
CREATE INDEX "payment_receipts_appointment_id_idx" ON "payment_receipts"("appointment_id");

-- AddForeignKey
ALTER TABLE "payment_receipts" ADD CONSTRAINT "payment_receipts_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_receipts" ADD CONSTRAINT "payment_receipts_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "appointments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

