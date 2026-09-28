-- AlterTable
ALTER TABLE "cash_movements" ADD COLUMN "appointment_id" UUID;

-- CreateIndex
CREATE INDEX "cash_movements_tenant_id_appointment_id_idx" ON "cash_movements"("tenant_id", "appointment_id");

-- CreateTable
CREATE TABLE "cash_register_closes" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "opened_at" TIMESTAMPTZ(3) NOT NULL,
    "closed_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "opening_cash" INTEGER NOT NULL,
    "expected_cash" INTEGER NOT NULL,
    "counted_cash" INTEGER NOT NULL,
    "difference" INTEGER NOT NULL,
    "notes" TEXT,
    "closed_by" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cash_register_closes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "cash_register_closes_tenant_id_closed_at_idx" ON "cash_register_closes"("tenant_id", "closed_at");

-- AddForeignKey
ALTER TABLE "cash_register_closes" ADD CONSTRAINT "cash_register_closes_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
