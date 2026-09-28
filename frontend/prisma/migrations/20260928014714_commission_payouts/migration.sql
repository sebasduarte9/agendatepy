-- CreateEnum
CREATE TYPE "payout_status" AS ENUM ('PENDING', 'PAID', 'CANCELLED');

-- CreateTable
CREATE TABLE "commission_payouts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "staff_id" UUID NOT NULL,
    "period_start" TIMESTAMPTZ(3) NOT NULL,
    "period_end" TIMESTAMPTZ(3) NOT NULL,
    "gross_commission" INTEGER NOT NULL,
    "amount_paid" INTEGER NOT NULL,
    "payment_method" TEXT NOT NULL DEFAULT 'Efectivo',
    "cash_movement_id" UUID,
    "status" "payout_status" NOT NULL DEFAULT 'PAID',
    "paid_at" TIMESTAMPTZ(3),
    "paid_by" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "commission_payouts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "commission_payout_items" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "payout_id" UUID NOT NULL,
    "appointment_id" UUID NOT NULL,
    "service_name" TEXT NOT NULL,
    "client_name" TEXT NOT NULL,
    "appointment_date" TIMESTAMPTZ(3) NOT NULL,
    "charged_amount" INTEGER NOT NULL,
    "commission_percentage" INTEGER NOT NULL,
    "commission_amount" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "commission_payout_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "commission_payouts_tenant_id_staff_id_idx" ON "commission_payouts"("tenant_id", "staff_id");

-- CreateIndex
CREATE INDEX "commission_payouts_tenant_id_status_idx" ON "commission_payouts"("tenant_id", "status");

-- CreateIndex
CREATE INDEX "commission_payouts_tenant_id_period_start_period_end_idx" ON "commission_payouts"("tenant_id", "period_start", "period_end");

-- CreateIndex
CREATE INDEX "commission_payout_items_appointment_id_idx" ON "commission_payout_items"("appointment_id");

-- CreateIndex
CREATE UNIQUE INDEX "commission_payout_items_payout_id_appointment_id_key" ON "commission_payout_items"("payout_id", "appointment_id");

-- AddForeignKey
ALTER TABLE "commission_payouts" ADD CONSTRAINT "commission_payouts_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commission_payouts" ADD CONSTRAINT "commission_payouts_staff_id_fkey" FOREIGN KEY ("staff_id") REFERENCES "staff"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commission_payouts" ADD CONSTRAINT "commission_payouts_cash_movement_id_fkey" FOREIGN KEY ("cash_movement_id") REFERENCES "cash_movements"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commission_payout_items" ADD CONSTRAINT "commission_payout_items_payout_id_fkey" FOREIGN KEY ("payout_id") REFERENCES "commission_payouts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
