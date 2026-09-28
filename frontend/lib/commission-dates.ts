import { fromZonedTime, formatInTimeZone } from "date-fns-tz";

export const COMMISSION_TZ = "America/Asuncion";

export type CommissionPeriod = "today" | "week" | "month" | "all" | "custom";

/**
 * Calcula el rango de fechas UTC correspondiente a un período civil en America/Asuncion.
 */
export function getCommissionDateRange(
  period: CommissionPeriod,
  customStart?: string | null,
  customEnd?: string | null,
  referenceDate = new Date()
): { start: Date | null; end: Date | null } {
  if (period === "all") {
    return { start: null, end: null };
  }

  if (period === "custom" && customStart) {
    const endStr = customEnd || customStart;
    const start = fromZonedTime(`${customStart} 00:00:00`, COMMISSION_TZ);
    const end = fromZonedTime(`${endStr} 23:59:59.999`, COMMISSION_TZ);
    return { start, end };
  }

  const todayStr = formatInTimeZone(referenceDate, COMMISSION_TZ, "yyyy-MM-dd");

  if (period === "today") {
    const start = fromZonedTime(`${todayStr} 00:00:00`, COMMISSION_TZ);
    const end = fromZonedTime(`${todayStr} 23:59:59.999`, COMMISSION_TZ);
    return { start, end };
  }

  if (period === "week") {
    const ref = fromZonedTime(`${todayStr} 12:00:00`, COMMISSION_TZ);
    const dayOfWeek = ref.getDay(); // 0 es Domingo, 1 es Lunes
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(ref);
    monday.setDate(ref.getDate() + diffToMonday);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    const monStr = formatInTimeZone(monday, COMMISSION_TZ, "yyyy-MM-dd");
    const sunStr = formatInTimeZone(sunday, COMMISSION_TZ, "yyyy-MM-dd");

    const start = fromZonedTime(`${monStr} 00:00:00`, COMMISSION_TZ);
    const end = fromZonedTime(`${sunStr} 23:59:59.999`, COMMISSION_TZ);
    return { start, end };
  }

  if (period === "month") {
    const yearMonth = formatInTimeZone(referenceDate, COMMISSION_TZ, "yyyy-MM");
    const startStr = `${yearMonth}-01`;
    const [y, m] = yearMonth.split("-").map(Number);
    const lastDay = new Date(y, m, 0).getDate();
    const endStr = `${yearMonth}-${String(lastDay).padStart(2, "0")}`;

    const start = fromZonedTime(`${startStr} 00:00:00`, COMMISSION_TZ);
    const end = fromZonedTime(`${endStr} 23:59:59.999`, COMMISSION_TZ);
    return { start, end };
  }

  return { start: null, end: null };
}
