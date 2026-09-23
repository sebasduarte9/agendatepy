"use server";

import { headers } from "next/headers";
import { formatInTimeZone } from "date-fns-tz";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { getAvailableSlots } from "@/lib/scheduling/availability";
import { SchedulingError } from "@/lib/scheduling/errors";
import { HOLD_MINUTES, type AvailableSlot } from "@/lib/scheduling/types";

const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const SLUG = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/;

export type BookAppointmentInput = {
  tenantSlug: string;
  serviceId: string;
  start: string;
  clientName: string;
  clientPhone: string;
};

export type BookAppointmentResult =
  | { ok: true; appointmentId: string }
  | { ok: false; message: string };

export async function getAvailableSlotsAction(
  tenantSlug: string,
  serviceId: string,
  date: string,
): Promise<AvailableSlot[]> {
  if (typeof serviceId !== "string" || typeof date !== "string") {
    throw new SchedulingError("INVALID_INPUT", "Payload inválido", 400);
  }
  if (!UUID.test(serviceId)) {
    throw new SchedulingError("INVALID_INPUT", "serviceId no es un UUID", 400);
  }

  const tenant = await resolveTenant(tenantSlug);
  const slots = await getAvailableSlots({
    tenantId: tenant.id,
    serviceId,
    date,
  });
  const now = Date.now();
  return slots.filter((slot) => new Date(slot.start).getTime() > now);
}

export async function cancelAppointmentAction(
  appointmentId: string,
  tenantSlug: string,
): Promise<{ ok: boolean; message: string }> {
  if (!UUID.test(appointmentId)) {
    return { ok: false, message: "ID de turno inválido." };
  }
  try {
    const tenant = await resolveTenant(tenantSlug);
    const appointment = await prisma.appointment.findFirst({
      where: { id: appointmentId, tenantId: tenant.id },
    });
    if (!appointment) {
      return { ok: false, message: "Turno no encontrado." };
    }
    await prisma.appointment.update({
      where: { id: appointmentId },
      data: { status: "CANCELLED" },
    });
    return { ok: true, message: "Tu turno ha sido cancelado con éxito." };
  } catch {
    return { ok: false, message: "No se pudo cancelar el turno. Contactá al local." };
  }
}

export async function createPendingAppointment(
  input: BookAppointmentInput,
): Promise<BookAppointmentResult> {
  try {
    return await insertPendingAppointment(input);
  } catch (error) {
    if (error instanceof SchedulingError) {
      return { ok: false, message: error.message };
    }
    throw error;
  }
}

async function insertPendingAppointment(
  input: BookAppointmentInput,
): Promise<BookAppointmentResult> {
  if (!input || typeof input.start !== "string") {
    return { ok: false, message: "Datos incompletos." };
  }
  if (!UUID.test(input.serviceId)) {
    return { ok: false, message: "Servicio inválido." };
  }

  const clientName = input.clientName.trim();
  const clientPhone = input.clientPhone.trim();
  if (clientName.length < 2 || clientName.length > 80) {
    return { ok: false, message: "Ingresá tu nombre." };
  }
  const phoneDigits = clientPhone.replace(/\D/g, "");
  if (phoneDigits.length < 8 || phoneDigits.length > 15) {
    return { ok: false, message: "Ingresá un teléfono válido, con código de país." };
  }

  const startMs = Date.parse(input.start);
  if (Number.isNaN(startMs) || startMs <= Date.now()) {
    return { ok: false, message: "Ese horario ya no está disponible." };
  }

  const tenant = await resolveTenant(input.tenantSlug);
  const service = await prisma.service.findFirst({
    where: { id: input.serviceId, tenantId: tenant.id },
    select: { id: true, durationMinutes: true },
  });
  if (!service) {
    return { ok: false, message: "Ese servicio no existe." };
  }

  const start = new Date(startMs);
  const end = new Date(startMs + service.durationMinutes * 60_000);
  const civilDate = formatInTimeZone(start, tenant.timezone, "yyyy-MM-dd");
  const slots = await getAvailableSlots({
    tenantId: tenant.id,
    serviceId: service.id,
    date: civilDate,
  });
  const match = slots.find((slot) => new Date(slot.start).getTime() === startMs);
  if (!match || new Date(match.end).getTime() !== end.getTime()) {
    return { ok: false, message: "Ese horario se acaba de ocupar. Elegí otro." };
  }

  const expiresAt = new Date(Date.now() + HOLD_MINUTES * 60_000);

  for (const staffId of match.staffIds) {
    try {
      const created = await prisma.$transaction(async (tx) => {
        await tx.appointment.updateMany({
          where: {
            tenantId: tenant.id,
            staffId,
            status: "PENDING_ACTION",
            expiresAt: { lte: new Date() },
            startTime: { lt: end },
            endTime: { gt: start },
          },
          data: { status: "EXPIRED" },
        });
        return tx.appointment.create({
          data: {
            tenantId: tenant.id,
            staffId,
            serviceId: service.id,
            clientName,
            clientPhone,
            startTime: start,
            endTime: end,
            status: "PENDING_ACTION",
            expiresAt,
          },
          select: { id: true },
        });
      });
      return { ok: true, appointmentId: created.id };
    } catch (error) {
      if (isStaffOverlap(error)) continue;
      throw error;
    }
  }

  return { ok: false, message: "Ese horario se acaba de ocupar. Elegí otro." };
}

async function resolveTenant(tenantSlug: string) {
  if (typeof tenantSlug !== "string" || !SLUG.test(tenantSlug)) {
    throw new SchedulingError("INVALID_INPUT", "Tenant inválido", 400);
  }

  const headerStore = await headers();
  const headerSlug = headerStore.get("x-tenant-slug");
  if (headerSlug && headerSlug !== tenantSlug) {
    throw new SchedulingError(
      "INVALID_INPUT",
      "El tenant no coincide con el subdominio",
      400,
    );
  }

  const tenant = await prisma.tenant.findUnique({
    where: { subdomain: tenantSlug },
    select: { id: true, timezone: true },
  });
  if (!tenant) {
    throw new SchedulingError("TENANT_NOT_FOUND", "Local inexistente", 404);
  }
  return tenant;
}

function isStaffOverlap(error: unknown): boolean {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return error.code === "P2002" || error.code === "P2034";
  }
  const message = error instanceof Error ? error.message : "";
  return message.includes("23P01") || message.includes("appointments_no_staff_overlap");
}
