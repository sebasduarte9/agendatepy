-- AlterTable
ALTER TABLE "commission_payout_items" ADD COLUMN "status" "payout_status" NOT NULL DEFAULT 'PAID';

-- CreateIndex
CREATE INDEX "commission_payout_items_appointment_id_status_idx" ON "commission_payout_items"("appointment_id", "status");

-- CreatePartialUniqueIndex
-- Impide de forma absoluta a nivel de motor PostgreSQL que una cita sea liquidada en más de un payout con estado PAID
CREATE UNIQUE INDEX "commission_payout_items_appointment_paid_unique" 
ON "commission_payout_items"("appointment_id") 
WHERE "status" = 'PAID';
