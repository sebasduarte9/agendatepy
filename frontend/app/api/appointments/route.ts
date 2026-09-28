import { NextResponse, type NextRequest } from "next/server";
import { getAvailableSlots } from "@/lib/scheduling/availability";
import { createPendingAppointment } from "@/lib/scheduling/actions";
import { SchedulingError } from "@/lib/scheduling/errors";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantSlug = searchParams.get("tenant") || searchParams.get("tenantSlug");
    const serviceId = searchParams.get("serviceId");
    const date = searchParams.get("date");

    if (!tenantSlug || !serviceId || !date) {
      return NextResponse.json(
        { ok: false, error: "VALIDATION_ERROR", message: "tenantSlug, serviceId y date son requeridos." },
        { status: 400 }
      );
    }

    const { prisma } = await import("@/lib/db");
    const tenant = await prisma.tenant.findUnique({
      where: { subdomain: tenantSlug },
      select: { id: true, timezone: true, status: true },
    });

    if (!tenant) {
      return NextResponse.json(
        { ok: false, error: "TENANT_NOT_FOUND", message: "Negocio no encontrado." },
        { status: 404 }
      );
    }

    if (tenant.status && tenant.status !== "ACTIVE") {
      return NextResponse.json(
        { ok: false, error: "TENANT_INACTIVE", message: "El negocio se encuentra temporalmente en pausa." },
        { status: 403 }
      );
    }

    const slots = await getAvailableSlots({
      tenantId: tenant.id,
      serviceId,
      date,
    });

    const now = Date.now();
    const futureSlots = slots.filter((slot) => new Date(slot.start).getTime() > now);

    return NextResponse.json({ ok: true, slots: futureSlots });
  } catch (error: any) {
    if (error instanceof SchedulingError) {
      return NextResponse.json(
        { ok: false, error: error.code, message: error.message },
        { status: error.status }
      );
    }
    console.error("Error en GET /api/appointments:", error);
    return NextResponse.json(
      { ok: false, error: "SERVER_ERROR", message: "Error al consultar disponibilidad." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tenantSlug, serviceId, start, clientName, clientPhone } = body;

    if (!tenantSlug || !serviceId || !start || !clientName || !clientPhone) {
      return NextResponse.json(
        { ok: false, error: "VALIDATION_ERROR", message: "Datos incompletos para registrar la cita." },
        { status: 400 }
      );
    }

    const result = await createPendingAppointment({
      tenantSlug,
      serviceId,
      start,
      clientName,
      clientPhone,
    });

    if (!result.ok) {
      const isSlotTaken = result.message.includes("ocupar") || result.message.includes("disponible");
      return NextResponse.json(
        { ok: false, error: isSlotTaken ? "SLOT_TAKEN" : "BOOKING_FAILED", message: result.message },
        { status: isSlotTaken ? 409 : 400 }
      );
    }

    return NextResponse.json(
      { ok: true, appointmentId: result.appointmentId },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error en POST /api/appointments:", error);
    return NextResponse.json(
      { ok: false, error: "SERVER_ERROR", message: "Error procesando reserva." },
      { status: 500 }
    );
  }
}
