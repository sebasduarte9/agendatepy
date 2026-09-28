import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireTenantSession, isGuardError, UUID_REGEX } from "@/lib/api-guard";
import { AppointmentStatus, Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

type RouteProps = {
  params: Promise<{ id: string }>;
};

export async function PUT(request: NextRequest, { params }: RouteProps) {
  try {
    const auth = await requireTenantSession(request, ["OWNER", "SUPERADMIN", "STAFF"]);
    if (isGuardError(auth)) return auth;

    const { id } = await params;
    if (!UUID_REGEX.test(id)) {
      return NextResponse.json(
        { ok: false, error: "VALIDATION_ERROR", message: "ID de cita inválido." },
        { status: 400 }
      );
    }

    const existing = await prisma.appointment.findFirst({
      where: { id, tenantId: auth.tenantId },
    });

    if (!existing) {
      return NextResponse.json(
        { ok: false, error: "NOT_FOUND", message: "Cita no encontrada." },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { startTime, endTime, staffId, status } = body;
    const incomingStart = startTime || body.start;
    const incomingEnd = endTime || body.end;

    const targetStaffId = staffId || existing.staffId;
    if (!UUID_REGEX.test(targetStaffId)) {
      return NextResponse.json(
        { ok: false, error: "VALIDATION_ERROR", message: "ID de profesional inválido." },
        { status: 400 }
      );
    }

    // Verificar que el profesional pertenezca al tenant y esté activo
    const validStaff = await prisma.staff.findFirst({
      where: { id: targetStaffId, tenantId: auth.tenantId, active: true },
    });
    if (!validStaff) {
      return NextResponse.json(
        { ok: false, error: "VALIDATION_ERROR", message: "El profesional no pertenece a este local o está inactivo." },
        { status: 400 }
      );
    }

    const newStart = incomingStart ? new Date(incomingStart) : existing.startTime;
    const newEnd = incomingEnd ? new Date(incomingEnd) : existing.endTime;

    if (Number.isNaN(newStart.getTime()) || Number.isNaN(newEnd.getTime()) || newEnd <= newStart) {
      return NextResponse.json(
        { ok: false, error: "VALIDATION_ERROR", message: "Rango de horario inválido (el fin debe ser posterior al inicio)." },
        { status: 400 }
      );
    }

    let targetStatus = existing.status;
    if (status) {
      const upper = String(status).toUpperCase().replace(/[\s-]/g, "_");
      if (upper === "CONFIRMED" || upper === "CONFIRMADO") targetStatus = AppointmentStatus.CONFIRMED;
      else if (upper === "CANCELLED" || upper === "CANCELADO") targetStatus = AppointmentStatus.CANCELLED;
      else if (upper === "COMPLETED" || upper === "COMPLETADO") targetStatus = AppointmentStatus.COMPLETED;
      else if (upper === "PENDING" || upper === "PENDING_ACTION" || upper === "PENDIENTE") targetStatus = AppointmentStatus.PENDING_ACTION;
      else if (upper === "NO_SHOW" || upper === "NOSHOW" || upper === "AUSENTE" || upper === "NO_ASISTIO") targetStatus = AppointmentStatus.NO_SHOW;
      else if (upper === "EXPIRED" || upper === "EXPIRADO") targetStatus = AppointmentStatus.EXPIRED;
      else {
        return NextResponse.json(
          { ok: false, error: "VALIDATION_ERROR", message: "Estado de cita inválido." },
          { status: 400 }
        );
      }
    }

    // Valid transitions enforcement: prevent invalid moves (e.g., COMPLETED -> PENDING)
    if (existing.status !== targetStatus) {
      if (existing.status === AppointmentStatus.COMPLETED) {
        return NextResponse.json(
          {
            ok: false,
            error: "INVALID_STATUS_TRANSITION",
            message: "Una cita completada no puede cambiar a otro estado.",
          },
          { status: 400 }
        );
      }
      if (existing.status === AppointmentStatus.NO_SHOW && targetStatus === AppointmentStatus.COMPLETED) {
        return NextResponse.json(
          {
            ok: false,
            error: "INVALID_STATUS_TRANSITION",
            message: "Una cita marcada como ausente (no show) no puede completarse directamente.",
          },
          { status: 400 }
        );
      }
    }

    // Si la cita va a estar activa, verificar disponibilidad contra colisiones y bloqueos
    if (targetStatus !== AppointmentStatus.CANCELLED && targetStatus !== AppointmentStatus.EXPIRED) {
      // 1. Verificar bloqueos de horario (ScheduleBlocks)
      const blockOverlap = await prisma.scheduleBlock.findFirst({
        where: {
          tenantId: auth.tenantId,
          OR: [{ staffId: targetStaffId }, { staffId: null }],
          startTime: { lt: newEnd },
          endTime: { gt: newStart },
        },
      });

      if (blockOverlap) {
        return NextResponse.json(
          {
            ok: false,
            error: "SLOT_TAKEN",
            message: `Ese horario está bloqueado: ${blockOverlap.reason || "Horario de descanso / excepción"}.`,
          },
          { status: 409 }
        );
      }

      // 2. Verificar superposición con otras citas activas del mismo staff
      const appointmentOverlap = await prisma.appointment.findFirst({
        where: {
          id: { not: id }, // Excluir la cita actual
          tenantId: auth.tenantId,
          staffId: targetStaffId,
          status: { notIn: [AppointmentStatus.CANCELLED, AppointmentStatus.EXPIRED, AppointmentStatus.NO_SHOW] },
          startTime: { lt: newEnd },
          endTime: { gt: newStart },
        },
      });

      if (appointmentOverlap) {
        return NextResponse.json(
          {
            ok: false,
            error: "SLOT_TAKEN",
            message: "Ese horario ya está ocupado para ese profesional. Elegí otro.",
          },
          { status: 409 }
        );
      }
    }

    try {
      const updated = await prisma.appointment.update({
        where: { id },
        data: {
          staffId: targetStaffId,
          startTime: newStart,
          endTime: newEnd,
          status: targetStatus,
        },
      });

      if (existing.status !== AppointmentStatus.COMPLETED && targetStatus === AppointmentStatus.COMPLETED) {
        if (existing.clientId) {
          await prisma.client.update({
            where: { id: existing.clientId },
            data: {
              points: { increment: 1 },
              lastVisit: new Date(),
            },
          });
        } else if (existing.clientPhone) {
          await prisma.client.updateMany({
            where: {
              tenantId: auth.tenantId,
              phone: existing.clientPhone,
            },
            data: {
              points: { increment: 1 },
              lastVisit: new Date(),
            },
          });
        }
      }

      return NextResponse.json({
        ok: true,
        appointment: {
          id: updated.id,
          clientName: updated.clientName,
          clientPhone: updated.clientPhone,
          serviceId: updated.serviceId,
          staffId: updated.staffId,
          start: updated.startTime.toISOString(),
          end: updated.endTime.toISOString(),
          status: updated.status.toLowerCase(),
        },
      });
    } catch (dbError) {
      // Si el constraint de Postgres exclusion fallara
      if (
        (dbError instanceof Prisma.PrismaClientKnownRequestError && dbError.code === "P2002") ||
        (dbError instanceof Error && dbError.message.includes("23P01")) ||
        (dbError instanceof Error && dbError.message.includes("appointments_no_staff_overlap"))
      ) {
        return NextResponse.json(
          {
            ok: false,
            error: "SLOT_TAKEN",
            message: "Ese horario ya está ocupado en la base de datos.",
          },
          { status: 409 }
        );
      }
      throw dbError;
    }
  } catch (error) {
    console.error("Error en PUT /api/appointments/[id]:", error);
    return NextResponse.json(
      { ok: false, error: "DB_UNAVAILABLE", message: "Error al actualizar la cita." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteProps) {
  try {
    const auth = await requireTenantSession(request, ["OWNER", "SUPERADMIN", "STAFF"]);
    if (isGuardError(auth)) return auth;

    const { id } = await params;
    if (!UUID_REGEX.test(id)) {
      return NextResponse.json(
        { ok: false, error: "VALIDATION_ERROR", message: "ID de cita inválido." },
        { status: 400 }
      );
    }

    const existing = await prisma.appointment.findFirst({
      where: { id, tenantId: auth.tenantId },
    });

    if (!existing) {
      return NextResponse.json(
        { ok: false, error: "NOT_FOUND", message: "Cita no encontrada." },
        { status: 404 }
      );
    }

    // Cancelar en PostgreSQL para liberar el slot de exclusión
    await prisma.appointment.update({
      where: { id },
      data: { status: AppointmentStatus.CANCELLED },
    });

    return NextResponse.json({
      ok: true,
      message: "Cita cancelada con éxito. Horario liberado.",
      status: "cancelled",
    });
  } catch (error) {
    console.error("Error en DELETE /api/appointments/[id]:", error);
    return NextResponse.json(
      { ok: false, error: "DB_UNAVAILABLE", message: "Error al cancelar la cita." },
      { status: 500 }
    );
  }
}
