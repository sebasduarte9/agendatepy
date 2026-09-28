import { formatInTimeZone } from "date-fns-tz";

export const PY_TZ = "America/Asuncion";

export function formatGs(value: number) {
  return `Gs. ${value.toLocaleString("es-PY")}`;
}

/** Convierte un ISO UTC a texto en la TZ del negocio. */
export function formatZoned(
  iso: string,
  timezone: string,
  pattern = "HH:mm",
) {
  return formatInTimeZone(iso, timezone, pattern);
}

export function formatZonedDate(iso: string, timezone: string) {
  return formatInTimeZone(iso, timezone, "d 'de' MMMM, yyyy");
}

export function civilDateFromIso(iso: string, timezone: string) {
  return formatInTimeZone(iso, timezone, "yyyy-MM-dd");
}

export function addDaysIso(date: string, days: number) {
  const next = new Date(`${date}T12:00:00`);
  next.setDate(next.getDate() + days);
  return next.toISOString().slice(0, 10);
}

export function phoneWa(phone: string) {
  return `https://wa.me/${phone.replace(/\D/g, "")}`;
}

/**
 * Normaliza números de teléfono paraguayos al formato estándar internacional E.164: +5959xxxxxxxx
 * Ejemplos:
 * - 0981123456 -> +595981123456
 * - 595981123456 -> +595981123456
 * - +595 981 123 456 -> +595981123456
 */
export function normalizeParaguayPhone(raw: string): string {
  if (!raw) return "";
  const cleaned = raw.replace(/\D/g, "");
  let core = cleaned;
  if (core.startsWith("595")) {
    core = core.slice(3);
  }
  if (core.startsWith("09")) {
    core = core.slice(1);
  }
  if (core.startsWith("9") && core.length === 9) {
    return `+595${core}`;
  }
  if (core.length >= 8 && core.length <= 11) {
    return `+595${core.startsWith("0") ? core.slice(1) : core}`;
  }
  if (raw.trim().startsWith("+")) {
    return `+${cleaned}`;
  }
  return core ? `+595${core}` : "";
}

/**
 * Formato visual legible para el usuario en la interfaz: +595 9xx xxx xxx
 */
export function formatParaguayPhone(raw: string): string {
  const norm = normalizeParaguayPhone(raw);
  if (norm.startsWith("+595") && norm.length === 13) {
    return `+595 ${norm.slice(4, 7)} ${norm.slice(7, 10)} ${norm.slice(10)}`;
  }
  return norm;
}

