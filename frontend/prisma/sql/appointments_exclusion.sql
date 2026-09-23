-- Aplicar sobre la base ya migrada por Prisma (tablas snake_case).
-- Supabase: correr en el SQL editor o como migración manual posterior a `prisma migrate`.
--
-- El EXCLUDE cubre CONFIRMED y PENDING_ACTION. Un hold vencido sigue bloqueando
-- la fila hasta que un worker (o la transacción de reserva) pase el status a EXPIRED.
-- getAvailableSlots ya ignora PENDING_ACTION con expires_at <= now(); el constraint
-- no puede usar now() porque no es IMMUTABLE.

CREATE EXTENSION IF NOT EXISTS btree_gist;

ALTER TABLE "staff_schedules"
  ADD CONSTRAINT "staff_schedules_day_range"
  CHECK (
    "day_of_week" BETWEEN 1 AND 7
    AND "end_time" > "start_time"
  );

ALTER TABLE "services"
  ADD CONSTRAINT "services_duration_price"
  CHECK ("duration_minutes" > 0 AND "price" >= 0);

ALTER TABLE "products"
  ADD CONSTRAINT "products_price_non_negative"
  CHECK ("price" >= 0);

ALTER TABLE "appointments"
  ADD CONSTRAINT "appointments_time_order"
  CHECK ("end_time" > "start_time");

ALTER TABLE "appointments"
  ADD CONSTRAINT "appointments_pending_has_expiry"
  CHECK ("status" <> 'PENDING_ACTION' OR "expires_at" IS NOT NULL);

ALTER TABLE "appointments"
  ADD CONSTRAINT "appointments_no_staff_overlap"
  EXCLUDE USING gist (
    "tenant_id" WITH =,
    "staff_id" WITH =,
    tstzrange("start_time", "end_time", '[)') WITH &&
  )
  WHERE ("status" IN ('CONFIRMED', 'PENDING_ACTION'));
