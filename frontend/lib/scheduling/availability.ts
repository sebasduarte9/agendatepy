import "server-only";

import { getISODay } from "date-fns";
import { fromZonedTime } from "date-fns-tz";
import type { PrismaClient } from "@prisma/client";
import { prisma } from "@/lib/db";
import { SchedulingError } from "@/lib/scheduling/errors";
import { availableStarts } from "@/lib/scheduling/slots";
import type { AvailableSlot } from "@/lib/scheduling/types";

export type { AvailableSlot };

const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export type GetAvailableSlotsInput = {
  tenantId: string;
  serviceId: string;
  /** Fecha civil YYYY-MM-DD en la timezone del tenant. No es un instante UTC. */
  date: string;
};

export async function getAvailableSlots(
  input: GetAvailableSlotsInput,
  db: PrismaClient = prisma,
): Promise<AvailableSlot[]> {
  const tenantId = parseUuid(input.tenantId, "tenantId");
  const serviceId = parseUuid(input.serviceId, "serviceId");
  const date = parseCivilDate(input.date);

  const tenant = await db.tenant.findUnique({
    where: { id: tenantId },
    select: { timezone: true, settings: true },
  });
  if (!tenant) {
    throw new SchedulingError("TENANT_NOT_FOUND", "Tenant inexistente", 404);
  }
  assertTimeZone(tenant.timezone);

  const service = await db.service.findFirst({
    where: { id: serviceId, tenantId },
    select: { durationMinutes: true },
  });
  if (!service) {
    throw new SchedulingError("SERVICE_NOT_FOUND", "Servicio inexistente", 404);
  }

  const isoDay = getISODay(new Date(`${date}T12:00:00Z`));
  const dayStart = fromZonedTime(`${date}T00:00:00`, tenant.timezone);
  const dayEnd = fromZonedTime(`${addCivilDays(date, 1)}T00:00:00`, tenant.timezone);

  const staff = await db.staff.findMany({
    where: {
      tenantId,
      active: true,
      services: { some: { serviceId } },
    },
    select: {
      id: true,
      schedules: {
        where: { dayOfWeek: isoDay },
        select: { startTime: true, endTime: true },
      },
    },
  });

  if (staff.length === 0) {
    return [];
  }

  const staffIds = staff.map((member) => member.id);
  const appointments = await db.appointment.findMany({
    where: {
      tenantId,
      staffId: { in: staffIds },
      startTime: { lt: dayEnd },
      endTime: { gt: dayStart },
      OR: [
        { status: "CONFIRMED" },
        { status: "PENDING_ACTION", expiresAt: { gt: new Date() } },
      ],
    },
    select: { staffId: true, startTime: true, endTime: true },
  });

  const busyByStaff = new Map<string, { startMs: number; endMs: number }[]>();
  for (const appointment of appointments) {
    const list = busyByStaff.get(appointment.staffId) ?? [];
    list.push({
      startMs: appointment.startTime.getTime(),
      endMs: appointment.endTime.getTime(),
    });
    busyByStaff.set(appointment.staffId, list);
  }

  const durationMs = service.durationMinutes * 60_000;
  const stepMs = slotStepMs(tenant.settings, service.durationMinutes);
  const byStart = new Map<string, AvailableSlot>();

  for (const member of staff) {
    const work = member.schedules.flatMap((schedule) => {
      const startHm = timeOfDay(schedule.startTime);
      const endHm = timeOfDay(schedule.endTime);
      const start = fromZonedTime(`${date}T${startHm}:00`, tenant.timezone);
      const end = fromZonedTime(`${date}T${endHm}:00`, tenant.timezone);
      if (end <= start) return [];
      return [{ startMs: start.getTime(), endMs: end.getTime() }];
    });

    const starts = availableStarts({
      work,
      busy: busyByStaff.get(member.id) ?? [],
      durationMs,
      stepMs,
    });

    for (const slot of starts) {
      const key = new Date(slot.startMs).toISOString();
      const existing = byStart.get(key);
      if (existing) {
        existing.staffIds.push(member.id);
        existing.staffIds.sort();
        continue;
      }
      byStart.set(key, {
        start: key,
        end: new Date(slot.endMs).toISOString(),
        staffIds: [member.id],
      });
    }
  }

  return [...byStart.values()].sort((a, b) => a.start.localeCompare(b.start));
}

function parseUuid(value: string, field: string): string {
  if (!UUID.test(value)) {
    throw new SchedulingError("INVALID_INPUT", `${field} no es un UUID`, 400);
  }
  return value;
}

export function parseCivilDate(value: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new SchedulingError("INVALID_INPUT", "date debe ser YYYY-MM-DD", 400);
  }
  const [year, month, day] = value.split("-").map(Number);
  const utc = new Date(Date.UTC(year, month - 1, day));
  if (
    utc.getUTCFullYear() !== year ||
    utc.getUTCMonth() !== month - 1 ||
    utc.getUTCDate() !== day
  ) {
    throw new SchedulingError("INVALID_INPUT", "date no existe en el calendario", 400);
  }
  return value;
}

function addCivilDays(civilDate: string, days: number): string {
  const [year, month, day] = civilDate.split("-").map(Number);
  const utc = new Date(Date.UTC(year, month - 1, day + days));
  const y = utc.getUTCFullYear();
  const m = String(utc.getUTCMonth() + 1).padStart(2, "0");
  const d = String(utc.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function assertTimeZone(timeZone: string): void {
  try {
    Intl.DateTimeFormat("en-US", { timeZone }).format(0);
  } catch {
    throw new SchedulingError("INVALID_INPUT", `timezone inválida: ${timeZone}`, 500);
  }
}

/** @db.Time llega como Date anclado a 1970-01-01 UTC. La hora civil está en UTC. */
function timeOfDay(value: Date): string {
  const hours = String(value.getUTCHours()).padStart(2, "0");
  const minutes = String(value.getUTCMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

function slotStepMs(settings: unknown, durationMinutes: number): number {
  const fallback = Math.min(15, durationMinutes);
  const configured =
    settings &&
    typeof settings === "object" &&
    "slotStepMinutes" in settings &&
    typeof (settings as { slotStepMinutes: unknown }).slotStepMinutes === "number"
      ? (settings as { slotStepMinutes: number }).slotStepMinutes
      : fallback;

  if (!Number.isInteger(configured) || configured < 1 || configured > durationMinutes) {
    return fallback * 60_000;
  }
  return configured * 60_000;
}
