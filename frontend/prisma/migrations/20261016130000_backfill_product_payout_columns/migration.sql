-- Columnas que existían en schema.prisma pero nunca tuvieron migración
-- (bases creadas con `migrate deploy` no las tenían). Idempotente: no hace
-- nada en bases que ya las recibieron con `db push`.

-- AlterTable
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "category" TEXT DEFAULT 'General',
ADD COLUMN IF NOT EXISTS "cost" INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS "description" TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS "image_url" TEXT,
ADD COLUMN IF NOT EXISTS "stock" INTEGER DEFAULT 10;

-- AlterTable
ALTER TABLE "commission_payout_items" ADD COLUMN IF NOT EXISTS "status" "payout_status" NOT NULL DEFAULT 'PAID';

-- CreateIndex
CREATE INDEX IF NOT EXISTS "commission_payout_items_appointment_id_status_idx" ON "commission_payout_items"("appointment_id", "status");
