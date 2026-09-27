import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireTenantSession, isGuardError, UUID_REGEX } from "@/lib/api-guard";

export const dynamic = "force-dynamic";

type RouteProps = {
  params: Promise<{ id: string }>;
};

export async function PUT(request: NextRequest, { params }: RouteProps) {
  try {
    const auth = await requireTenantSession(request, ["OWNER", "SUPERADMIN"]);
    if (isGuardError(auth)) return auth;

    const { id } = await params;
    if (!UUID_REGEX.test(id)) {
      return NextResponse.json(
        { ok: false, error: "VALIDATION_ERROR", message: "ID de colaborador inválido." },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { name, commissionPercentage, active } = body;

    const existing = await prisma.staff.findFirst({
      where: { id, tenantId: auth.tenantId },
    });

    if (!existing) {
      return NextResponse.json(
        { ok: false, error: "NOT_FOUND", message: "Colaborador no encontrado." },
        { status: 404 }
      );
    }

    const updateData: any = {};
    if (name !== undefined) {
      if (typeof name !== "string" || name.trim().length < 2) {
        return NextResponse.json(
          { ok: false, error: "VALIDATION_ERROR", message: "Nombre de colaborador inválido." },
          { status: 400 }
        );
      }
      updateData.name = name.trim();
    }

    if (commissionPercentage !== undefined) {
      const comm = Number(commissionPercentage);
      if (!Number.isInteger(comm) || comm < 0 || comm > 100) {
        return NextResponse.json(
          { ok: false, error: "VALIDATION_ERROR", message: "Porcentaje de comisión inválido." },
          { status: 400 }
        );
      }
      updateData.commissionPercentage = comm;
    }

    if (active !== undefined) {
      updateData.active = Boolean(active);
    }

    const updated = await prisma.staff.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ ok: true, staff: updated });
  } catch (error) {
    console.error("Error en PUT /api/staff/[id]:", error);
    return NextResponse.json(
      { ok: false, error: "DB_UNAVAILABLE", message: "No se pudo actualizar el colaborador." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteProps) {
  try {
    const auth = await requireTenantSession(request, ["OWNER", "SUPERADMIN"]);
    if (isGuardError(auth)) return auth;

    const { id } = await params;
    if (!UUID_REGEX.test(id)) {
      return NextResponse.json(
        { ok: false, error: "VALIDATION_ERROR", message: "ID de colaborador inválido." },
        { status: 400 }
      );
    }

    const existing = await prisma.staff.findFirst({
      where: { id, tenantId: auth.tenantId },
      include: { _count: { select: { appointments: true } } },
    });

    if (!existing) {
      return NextResponse.json(
        { ok: false, error: "NOT_FOUND", message: "Colaborador no encontrado." },
        { status: 404 }
      );
    }

    // Si tiene citas históricas, desactivar (soft-delete) para no romper el histórico
    if (existing._count.appointments > 0) {
      await prisma.staff.update({
        where: { id },
        data: { active: false },
      });
      return NextResponse.json({
        ok: true,
        message: "Colaborador desactivado para preservar el historial de citas.",
        deactivated: true,
      });
    }

    // Si no tiene citas, eliminar físicamente junto a sus relaciones
    await prisma.$transaction(async (tx) => {
      await tx.staffSchedule.deleteMany({ where: { staffId: id } });
      await tx.staffService.deleteMany({ where: { staffId: id } });
      await tx.scheduleBlock.deleteMany({ where: { staffId: id } });
      await tx.staff.delete({ where: { id } });
    });

    return NextResponse.json({ ok: true, message: "Colaborador eliminado correctamente." });
  } catch (error) {
    console.error("Error en DELETE /api/staff/[id]:", error);
    return NextResponse.json(
      { ok: false, error: "DB_UNAVAILABLE", message: "No se pudo eliminar el colaborador." },
      { status: 500 }
    );
  }
}
