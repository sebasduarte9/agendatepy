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
        { ok: false, error: "VALIDATION_ERROR", message: "ID de servicio inválido." },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { name, durationMinutes, price, active } = body;

    const existing = await prisma.service.findFirst({
      where: { id, tenantId: auth.tenantId },
    });

    if (!existing) {
      return NextResponse.json(
        { ok: false, error: "NOT_FOUND", message: "Servicio no encontrado." },
        { status: 404 }
      );
    }

    const updateData: any = {};
    if (name !== undefined) {
      if (typeof name !== "string" || name.trim().length < 2) {
        return NextResponse.json(
          { ok: false, error: "VALIDATION_ERROR", message: "Nombre de servicio inválido." },
          { status: 400 }
        );
      }
      updateData.name = name.trim();
    }

    const rawDuration = durationMinutes !== undefined ? durationMinutes : body.durationMin;
    if (rawDuration !== undefined) {
      const dur = Number(rawDuration);
      if (!Number.isInteger(dur) || dur < 5 || dur > 480) {
        return NextResponse.json(
          { ok: false, error: "VALIDATION_ERROR", message: "Duración inválida." },
          { status: 400 }
        );
      }
      updateData.durationMinutes = dur;
    }

    if (price !== undefined) {
      const p = Number(price);
      if (Number.isNaN(p) || p < 0) {
        return NextResponse.json(
          { ok: false, error: "VALIDATION_ERROR", message: "Precio inválido." },
          { status: 400 }
        );
      }
      updateData.price = Math.round(p);
    }

    if (active !== undefined) {
      updateData.active = Boolean(active);
    }

    const updated = await prisma.service.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ ok: true, service: updated });
  } catch (error) {
    console.error("Error en PUT /api/services/[id]:", error);
    return NextResponse.json(
      { ok: false, error: "DB_UNAVAILABLE", message: "No se pudo actualizar el servicio." },
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
        { ok: false, error: "VALIDATION_ERROR", message: "ID de servicio inválido." },
        { status: 400 }
      );
    }

    const existing = await prisma.service.findFirst({
      where: { id, tenantId: auth.tenantId },
      include: { _count: { select: { appointments: true } } },
    });

    if (!existing) {
      return NextResponse.json(
        { ok: false, error: "NOT_FOUND", message: "Servicio no encontrado." },
        { status: 404 }
      );
    }

    // Si tiene citas registradas, desactivar (soft-delete) para preservar integridad de datos
    if (existing._count.appointments > 0) {
      await prisma.service.update({
        where: { id },
        data: { active: false },
      });
      return NextResponse.json({
        ok: true,
        message: "Servicio desactivado porque tiene citas históricas asociadas.",
        deactivated: true,
      });
    }

    // Si no tiene citas, eliminar físicamente
    await prisma.$transaction(async (tx) => {
      await tx.staffService.deleteMany({ where: { serviceId: id } });
      await tx.service.delete({ where: { id } });
    });

    return NextResponse.json({ ok: true, message: "Servicio eliminado correctamente." });
  } catch (error) {
    console.error("Error en DELETE /api/services/[id]:", error);
    return NextResponse.json(
      { ok: false, error: "DB_UNAVAILABLE", message: "No se pudo eliminar el servicio." },
      { status: 500 }
    );
  }
}
