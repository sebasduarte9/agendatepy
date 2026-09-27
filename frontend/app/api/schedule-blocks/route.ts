import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireTenantSession, isGuardError, UUID_REGEX } from "@/lib/api-guard";
import { fromZonedTime } from "date-fns-tz";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const auth = await requireTenantSession(request);
    if (isGuardError(auth)) return auth;

    const blocks = await prisma.scheduleBlock.findMany({
      where: { tenantId: auth.tenantId },
      include: { staff: { select: { id: true, name: true } } },
      orderBy: { startTime: "asc" },
    });

    const formatted = blocks.map((b) => ({
      id: b.id,
      staffId: b.staffId,
      staffName: b.staff?.name || "Todo el equipo",
      startTime: b.startTime.toISOString(),
      endTime: b.endTime.toISOString(),
      reason: b.reason || "Descanso / Excepción",
      createdAt: b.createdAt.toISOString(),
    }));

    return NextResponse.json({ ok: true, blocks: formatted });
  } catch (error) {
    console.error("Error en GET /api/schedule-blocks:", error);
    return NextResponse.json(
      { ok: false, error: "DB_UNAVAILABLE", message: "Error al consultar bloqueos." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireTenantSession(request, ["OWNER", "SUPERADMIN", "STAFF"]);
    if (isGuardError(auth)) return auth;

    const tenant = await prisma.tenant.findUnique({
      where: { id: auth.tenantId },
      select: { timezone: true },
    });
    const tz = tenant?.timezone || "America/Asuncion";

    const body = await request.json();
    const { staffId, date, start, end, reason, startTime, endTime } = body;

    let parsedStart: Date;
    let parsedEnd: Date;

    if (startTime && endTime) {
      parsedStart = new Date(startTime);
      parsedEnd = new Date(endTime);
    } else if (date && start && end) {
      parsedStart = fromZonedTime(`${date}T${start}:00`, tz);
      parsedEnd = fromZonedTime(`${date}T${end}:00`, tz);
    } else {
      return NextResponse.json(
        { ok: false, error: "VALIDATION_ERROR", message: "Datos de fecha y hora incompletos." },
        { status: 400 }
      );
    }

    if (Number.isNaN(parsedStart.getTime()) || Number.isNaN(parsedEnd.getTime()) || parsedEnd <= parsedStart) {
      return NextResponse.json(
        { ok: false, error: "VALIDATION_ERROR", message: "El fin del bloqueo debe ser posterior al inicio." },
        { status: 400 }
      );
    }

    let targetStaffId: string | null = null;
    if (staffId && staffId !== "all") {
      if (!UUID_REGEX.test(staffId)) {
        return NextResponse.json(
          { ok: false, error: "VALIDATION_ERROR", message: "ID de colaborador inválido." },
          { status: 400 }
        );
      }
      const staffMember = await prisma.staff.findFirst({
        where: { id: staffId, tenantId: auth.tenantId },
      });
      if (!staffMember) {
        return NextResponse.json(
          { ok: false, error: "NOT_FOUND", message: "Colaborador no encontrado." },
          { status: 404 }
        );
      }
      targetStaffId = staffMember.id;
    }

    const created = await prisma.scheduleBlock.create({
      data: {
        tenantId: auth.tenantId,
        staffId: targetStaffId,
        startTime: parsedStart,
        endTime: parsedEnd,
        reason: reason?.trim() || "Bloqueo operativo",
      },
      include: { staff: { select: { id: true, name: true } } },
    });

    return NextResponse.json(
      {
        ok: true,
        block: {
          id: created.id,
          staffId: created.staffId,
          staffName: created.staff?.name || "Todo el equipo",
          startTime: created.startTime.toISOString(),
          endTime: created.endTime.toISOString(),
          reason: created.reason,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error en POST /api/schedule-blocks:", error);
    return NextResponse.json(
      { ok: false, error: "DB_UNAVAILABLE", message: "No se pudo registrar el bloqueo." },
      { status: 500 }
    );
  }
}
