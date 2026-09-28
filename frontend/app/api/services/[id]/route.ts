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
    const { name, durationMinutes, price, active, category, staffIds, hasPromo, promoPrice, promoBadge, promoDisplayType } = body;

    const existing = await prisma.service.findFirst({
      where: { id, tenantId: auth.tenantId },
      include: {
        staff: {
          select: { staffId: true },
        },
      },
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

    // Actualizar servicio y colaboradores asignados en PostgreSQL
    const updated = await prisma.$transaction(async (tx) => {
      const svc = await tx.service.update({
        where: { id },
        data: updateData,
      });

      if (Array.isArray(staffIds)) {
        await tx.staffService.deleteMany({ where: { serviceId: id } });
        if (staffIds.length > 0) {
          await tx.staffService.createMany({
            data: staffIds.map((stId: string) => ({
              staffId: stId,
              serviceId: id,
            })),
            skipDuplicates: true,
          });
        }
      }

      // Persistir category y promociones en tenant.settings.serviceExtras
      const tenant = await tx.tenant.findUnique({
        where: { id: auth.tenantId },
        select: { settings: true },
      });
      const tenantSettings = (tenant?.settings as Record<string, any>) || {};
      const serviceExtras = (tenantSettings.serviceExtras as Record<string, any>) || {};
      const prevExtra = serviceExtras[id] || {};

      const nextExtra = {
        ...prevExtra,
        ...(category !== undefined ? { category: String(category).trim() } : {}),
        ...(Array.isArray(staffIds) ? { staffIds } : {}),
        ...(hasPromo !== undefined ? { hasPromo: Boolean(hasPromo) } : {}),
        ...(promoPrice !== undefined ? { promoPrice: Number(promoPrice) } : {}),
        ...(promoBadge !== undefined ? { promoBadge: String(promoBadge).trim() } : {}),
        ...(promoDisplayType !== undefined ? { promoDisplayType } : {}),
      };

      serviceExtras[id] = nextExtra;

      await tx.tenant.update({
        where: { id: auth.tenantId },
        data: {
          settings: {
            ...tenantSettings,
            serviceExtras,
          },
        },
      });

      return {
        ...svc,
        durationMin: svc.durationMinutes,
        category: nextExtra.category || "Peluquería",
        staffIds: Array.isArray(staffIds) ? staffIds : prevExtra.staffIds || existing.staff.map((st) => st.staffId),
        hasPromo: Boolean(nextExtra.hasPromo),
        promoPrice: nextExtra.promoPrice,
        promoBadge: nextExtra.promoBadge,
        promoDisplayType: nextExtra.promoDisplayType,
      };
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

      const tenant = await tx.tenant.findUnique({
        where: { id: auth.tenantId },
        select: { settings: true },
      });
      const tenantSettings = (tenant?.settings as Record<string, any>) || {};
      if (tenantSettings.serviceExtras && tenantSettings.serviceExtras[id]) {
        delete tenantSettings.serviceExtras[id];
        await tx.tenant.update({
          where: { id: auth.tenantId },
          data: { settings: tenantSettings },
        });
      }
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
