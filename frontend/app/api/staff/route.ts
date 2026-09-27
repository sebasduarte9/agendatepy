import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireTenantSession, isGuardError } from "@/lib/api-guard";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const auth = await requireTenantSession(request);
    if (isGuardError(auth)) return auth;

    const staffList = await prisma.staff.findMany({
      where: { tenantId: auth.tenantId },
      include: {
        services: { select: { serviceId: true } },
        schedules: { select: { dayOfWeek: true, startTime: true, endTime: true } },
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ ok: true, staff: staffList });
  } catch (error) {
    console.error("Error en GET /api/staff:", error);
    return NextResponse.json(
      { ok: false, error: "DB_UNAVAILABLE", message: "Error al consultar colaboradores." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireTenantSession(request, ["OWNER", "SUPERADMIN"]);
    if (isGuardError(auth)) return auth;

    const body = await request.json();
    const { name, commissionPercentage, active, serviceIds } = body;

    if (!name || typeof name !== "string" || name.trim().length < 2) {
      return NextResponse.json(
        { ok: false, error: "VALIDATION_ERROR", message: "Nombre de colaborador inválido." },
        { status: 400 }
      );
    }

    const commission = Number(commissionPercentage ?? 50);
    if (!Number.isInteger(commission) || commission < 0 || commission > 100) {
      return NextResponse.json(
        { ok: false, error: "VALIDATION_ERROR", message: "Porcentaje de comisión debe ser entre 0 y 100." },
        { status: 400 }
      );
    }

    const newStaff = await prisma.$transaction(async (tx) => {
      // 1. Crear el colaborador
      const created = await tx.staff.create({
        data: {
          tenantId: auth.tenantId,
          name: name.trim(),
          commissionPercentage: commission,
          active: active !== false,
        },
      });

      // 2. Crear jornadas predeterminadas Lun-Sáb 08:00 - 20:00 (hora civil sin zona)
      const defaultStartTime = new Date("1970-01-01T08:00:00Z");
      const defaultEndTime = new Date("1970-01-01T20:00:00Z");

      const schedulesData = [1, 2, 3, 4, 5, 6].map((dayOfWeek) => ({
        staffId: created.id,
        dayOfWeek,
        startTime: defaultStartTime,
        endTime: defaultEndTime,
      }));

      await tx.staffSchedule.createMany({
        data: schedulesData,
        skipDuplicates: true,
      });

      // 3. Asociar servicios especificados o todos los servicios activos del tenant
      let targetServiceIds: string[] = [];
      if (Array.isArray(serviceIds) && serviceIds.length > 0) {
        targetServiceIds = serviceIds;
      } else {
        const tenantServices = await tx.service.findMany({
          where: { tenantId: auth.tenantId, active: true },
          select: { id: true },
        });
        targetServiceIds = tenantServices.map((s) => s.id);
      }

      if (targetServiceIds.length > 0) {
        await tx.staffService.createMany({
          data: targetServiceIds.map((serviceId) => ({
            staffId: created.id,
            serviceId,
          })),
          skipDuplicates: true,
        });
      }

      return created;
    });

    return NextResponse.json({ ok: true, staff: newStaff }, { status: 201 });
  } catch (error) {
    console.error("Error en POST /api/staff:", error);
    return NextResponse.json(
      { ok: false, error: "DB_UNAVAILABLE", message: "No se pudo crear el colaborador." },
      { status: 500 }
    );
  }
}
