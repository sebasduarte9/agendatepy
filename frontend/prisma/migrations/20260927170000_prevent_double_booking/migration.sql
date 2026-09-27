-- Habilitar extensión btree_gist para soportar tipos escalares (UUID) en restricciones de exclusión
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- Crear restricción de exclusión para evitar solapamiento de turnos para el mismo staff
ALTER TABLE "appointments"
ADD CONSTRAINT "appointments_no_staff_overlap"
EXCLUDE USING gist (
  staff_id WITH =,
  tstzrange(start_time, end_time) WITH &&
)
WHERE (status NOT IN ('CANCELLED', 'EXPIRED', 'NO_SHOW'));
