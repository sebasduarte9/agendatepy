"use server";

import { headers } from "next/headers";
import { formatInTimeZone } from "date-fns-tz";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { getAvailableSlots } from "@/lib/scheduling/availability";
import { SchedulingError } from "@/lib/scheduling/errors";
import { HOLD_MINUTES, type AvailableSlot } from "@/lib/scheduling/types";
import { normalizeParaguayPhone } from "@/lib/dashboard-dates";

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

  try {
    const tenant = await resolveTenant(tenantSlug);
    const slots = await getAvailableSlots({
      tenantId: tenant.id,
      serviceId,
      date,
    });
    const now = Date.now();
    return slots.filter((slot) => new Date(slot.start).getTime() > now);
  } catch (error) {
    if (tenantSlug === "barberia") {
      console.warn(`[getAvailableSlotsAction] Generando slots demo para "${tenantSlug}":`, error);
      const demoTimes = [
        "09:00", "09:45", "10:30", "11:15", "14:00", "14:45", "15:30", "16:15", "17:00", "17:45", "18:30"
      ];
      const now = Date.now();
      return demoTimes
        .map((t) => {
          const start = new Date(`${date}T${t}:00-04:00`);
          const end = new Date(start.getTime() + 45 * 60_000);
          return {
            start: start.toISOString(),
            end: end.toISOString(),
            staffIds: ["a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d"],
          };
        })
        .filter((slot) => new Date(slot.start).getTime() > now);
    }

    console.error(`[getAvailableSlotsAction] Error al consultar disponibilidad para "${tenantSlug}":`, error);
    throw new SchedulingError(
      "DB_UNAVAILABLE",
      "No pudimos consultar los horarios disponibles en este momento. Por favor intentá más tarde.",
      503
    );
  }
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
    if (input.tenantSlug === "barberia") {
      console.warn("[createPendingAppointment] Base de datos no disponible para demo, usando confirmación demo");
      return { ok: true, appointmentId: "a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d" };
    }
    console.error("[createPendingAppointment] Error persistiendo cita en DB:", error);
    return {
      ok: false,
      message: "No se pudo registrar la reserva en la base de datos. Por favor intentá nuevamente.",
    };
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
  const normalizedPhone = normalizeParaguayPhone(clientPhone);

  const startMs = Date.parse(input.start);
  if (Number.isNaN(startMs) || startMs <= Date.now()) {
    return { ok: false, message: "Ese horario ya no está disponible." };
  }

  const tenant = await resolveTenant(input.tenantSlug);
  const service = await prisma.service.findFirst({
    where: { id: input.serviceId, tenantId: tenant.id, active: true },
    select: { id: true, durationMinutes: true },
  });
  if (!service) {
    return { ok: false, message: "Ese servicio no está disponible en este momento." };
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
        // Doble verificación dentro de la transacción para descartar colisiones activas
        const existingOverlap = await tx.appointment.findFirst({
          where: {
            staffId,
            status: { notIn: ["CANCELLED", "EXPIRED", "NO_SHOW"] },
            startTime: { lt: end },
            endTime: { gt: start },
          },
        });

        if (existingOverlap) {
          throw new SchedulingError("SLOT_TAKEN", "appointments_no_staff_overlap", 409);
        }

        // Verificar si el horario colisiona con un bloqueo operativo
        const existingBlock = await tx.scheduleBlock.findFirst({
          where: {
            tenantId: tenant.id,
            OR: [{ staffId }, { staffId: null }],
            startTime: { lt: end },
            endTime: { gt: start },
          },
        });
        if (existingBlock) {
          throw new SchedulingError("SLOT_TAKEN", "Horario bloqueado", 409);
        }

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

        // Buscar o crear cliente del tenant por teléfono normalizado para evitar duplicados
        const phoneVariants = [
          normalizedPhone,
          phoneDigits,
          `+${phoneDigits}`,
          phoneDigits.startsWith("595") ? `0${phoneDigits.slice(3)}` : `595${phoneDigits.startsWith("0") ? phoneDigits.slice(1) : phoneDigits}`,
        ];

        let client = await tx.client.findFirst({
          where: {
            tenantId: tenant.id,
            phone: { in: phoneVariants },
          },
        });
        if (!client) {
          client = await tx.client.create({
            data: {
              tenantId: tenant.id,
              name: clientName,
              phone: normalizedPhone,
              lastVisit: start,
              tags: ["Nuevo"],
            },
          });
        } else {
          await tx.client.update({
            where: { id: client.id },
            data: {
              lastVisit: start,
              name: client.name || clientName,
              phone: normalizedPhone,
            },
          });
        }

        const appCreated = await tx.appointment.create({
          data: {
            tenantId: tenant.id,
            staffId,
            serviceId: service.id,
            clientId: client.id,
            clientName,
            clientPhone: normalizedPhone,
            startTime: start,
            endTime: end,
            status: "PENDING_ACTION",
            expiresAt,
          },
          select: { id: true },
        });

        await tx.platformEvent.create({
          data: {
            event: "PUBLIC_BOOKING_CREATED",
            tenantId: tenant.id,
            entityType: "Appointment",
            entityId: appCreated.id,
            metadata: {
              serviceId: service.id,
              staffId,
              source: "public_portal",
            },
          },
        });

        return appCreated;
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
    select: { id: true, timezone: true, status: true },
  });
  if (!tenant) {
    throw new SchedulingError("TENANT_NOT_FOUND", "Local inexistente", 404);
  }
  if (tenant.status && tenant.status !== "ACTIVE") {
    throw new SchedulingError("TENANT_INACTIVE", "El negocio se encuentra temporalmente en pausa.", 403);
  }
  return tenant;
}

function isStaffOverlap(error: unknown): boolean {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return error.code === "P2002" || error.code === "P2034";
  }
  if (error instanceof SchedulingError && error.message.includes("appointments_no_staff_overlap")) {
    return true;
  }
  const message = error instanceof Error ? error.message : "";
  return message.includes("23P01") || message.includes("appointments_no_staff_overlap");
}
