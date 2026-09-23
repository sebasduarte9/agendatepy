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
