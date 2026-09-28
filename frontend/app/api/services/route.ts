import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireTenantSession, isGuardError } from "@/lib/api-guard";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const auth = await requireTenantSession(request);
    if (isGuardError(auth)) return auth;

    const tenant = await prisma.tenant.findUnique({
      where: { id: auth.tenantId },
      select: { settings: true },
    });
    const tenantSettings = (tenant?.settings as Record<string, any>) || {};
    const serviceExtras = (tenantSettings.serviceExtras as Record<string, any>) || {};

    const services = await prisma.service.findMany({
      where: { tenantId: auth.tenantId },
      include: {
        staff: {
          select: { staffId: true },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    const enriched = services.map((s) => {
      const extra = serviceExtras[s.id] || {};
      const staffIds = extra.staffIds || s.staff.map((st) => st.staffId);
      return {
        id: s.id,
        name: s.name,
        durationMin: s.durationMinutes,
        durationMinutes: s.durationMinutes,
        price: s.price,
        active: s.active,
        category: extra.category || "Peluquería",
        staffIds,
        hasPromo: Boolean(extra.hasPromo),
        promoPrice: extra.promoPrice !== undefined ? extra.promoPrice : undefined,
        promoBadge: extra.promoBadge || undefined,
        promoDisplayType: extra.promoDisplayType || undefined,
        promoType: extra.promoType || undefined,
        promoLimitQuantity: extra.promoLimitQuantity !== undefined ? extra.promoLimitQuantity : undefined,
        promoLimitHours: extra.promoLimitHours !== undefined ? extra.promoLimitHours : undefined,
        promoDeadline: extra.promoDeadline || undefined,
        requirePrepayment: Boolean(extra.requirePrepayment),
        prepaymentType: extra.prepaymentType || undefined,
        prepaymentAmount: extra.prepaymentAmount !== undefined ? extra.prepaymentAmount : undefined,
        prepaymentMethod: extra.prepaymentMethod || undefined,
        prepaymentInstructions: extra.prepaymentInstructions || undefined,
      };
    });

    return NextResponse.json({ ok: true, services: enriched });
  } catch (error) {
    console.error("Error en GET /api/services:", error);
    return NextResponse.json(
      { ok: false, error: "DB_UNAVAILABLE", message: "Error al consultar servicios." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireTenantSession(request, ["OWNER", "SUPERADMIN"]);
    if (isGuardError(auth)) return auth;

    const body = await request.json();
    const {
      name,
      durationMinutes,
      price,
      active,
      category,
      staffIds,
      hasPromo,
      promoPrice,
      promoBadge,
      promoDisplayType,
      promoType,
      promoLimitQuantity,
      promoLimitHours,
      promoDeadline,
      requirePrepayment,
      prepaymentType,
      prepaymentAmount,
      prepaymentMethod,
      prepaymentInstructions,
    } = body;

    if (!name || typeof name !== "string" || name.trim().length < 2) {
      return NextResponse.json(
        { ok: false, error: "VALIDATION_ERROR", message: "Nombre de servicio inválido." },
        { status: 400 }
      );
    }

    const duration = Number(durationMinutes ?? body.durationMin ?? 45);
    if (!Number.isInteger(duration) || duration < 5 || duration > 480) {
      return NextResponse.json(
        { ok: false, error: "VALIDATION_ERROR", message: "La duración debe ser entre 5 y 480 minutos." },
        { status: 400 }
      );
    }

    const priceNum = Number(price);
    if (Number.isNaN(priceNum) || priceNum < 0) {
      return NextResponse.json(
        { ok: false, error: "VALIDATION_ERROR", message: "Precio inválido en Guaraníes." },
        { status: 400 }
      );
    }

    // Transacción para crear servicio y asociarlo al staff activo del tenant
    const newService = await prisma.$transaction(async (tx) => {
      const created = await tx.service.create({
        data: {
          tenantId: auth.tenantId,
          name: name.trim(),
          durationMinutes: duration,
          price: Math.round(priceNum),
          active: active !== false,
        },
      });

      // Asociar a colaboradores seleccionados o todos los activos
      let targetStaffIds: string[] = [];
      if (Array.isArray(staffIds) && staffIds.length > 0) {
        targetStaffIds = staffIds;
      } else {
        const staffMembers = await tx.staff.findMany({
          where: { tenantId: auth.tenantId, active: true },
          select: { id: true },
        });
        targetStaffIds = staffMembers.map((st) => st.id);
      }

      if (targetStaffIds.length > 0) {
        await tx.staffService.createMany({
          data: targetStaffIds.map((stId) => ({
            staffId: stId,
            serviceId: created.id,
          })),
          skipDuplicates: true,
        });
      }

      // Persistir metadata de categoría y promociones en tenant.settings.serviceExtras
      const tenant = await tx.tenant.findUnique({
        where: { id: auth.tenantId },
        select: { settings: true },
      });
      const tenantSettings = (tenant?.settings as Record<string, any>) || {};
      const serviceExtras = (tenantSettings.serviceExtras as Record<string, any>) || {};

      serviceExtras[created.id] = {
        category: category || "Peluquería",
        staffIds: targetStaffIds,
        hasPromo: Boolean(hasPromo),
        promoPrice: promoPrice !== undefined ? Number(promoPrice) : undefined,
        promoBadge: promoBadge || undefined,
        promoDisplayType: promoDisplayType || undefined,
        promoType: promoType || undefined,
        promoLimitQuantity: promoLimitQuantity !== undefined ? Number(promoLimitQuantity) : undefined,
        promoLimitHours: promoLimitHours !== undefined ? Number(promoLimitHours) : undefined,
        promoDeadline: promoDeadline || undefined,
        requirePrepayment: Boolean(requirePrepayment),
        prepaymentType: prepaymentType || undefined,
        prepaymentAmount: prepaymentAmount !== undefined ? Number(prepaymentAmount) : undefined,
        prepaymentMethod: prepaymentMethod || undefined,
        prepaymentInstructions: prepaymentInstructions || undefined,
      };

      await tx.tenant.update({
        where: { id: auth.tenantId },
        data: {
          settings: {
            ...tenantSettings,
            serviceExtras,
          },
        },
      });

      await tx.platformEvent.create({
        data: {
          event: "SERVICE_CREATED",
          tenantId: auth.tenantId,
          entityType: "Service",
          entityId: created.id,
          metadata: {
            name: created.name,
            price: created.price,
            durationMinutes: created.durationMinutes,
          },
        },
      });

      return {
        ...created,
        durationMin: created.durationMinutes,
        category: category || "Peluquería",
        staffIds: targetStaffIds,
        hasPromo: Boolean(hasPromo),
        promoPrice: promoPrice !== undefined ? Number(promoPrice) : undefined,
        promoBadge: promoBadge || undefined,
        promoDisplayType: promoDisplayType || undefined,
        promoType: promoType || undefined,
        promoLimitQuantity: promoLimitQuantity !== undefined ? Number(promoLimitQuantity) : undefined,
        promoLimitHours: promoLimitHours !== undefined ? Number(promoLimitHours) : undefined,
        promoDeadline: promoDeadline || undefined,
        requirePrepayment: Boolean(requirePrepayment),
        prepaymentType: prepaymentType || undefined,
        prepaymentAmount: prepaymentAmount !== undefined ? Number(prepaymentAmount) : undefined,
        prepaymentMethod: prepaymentMethod || undefined,
        prepaymentInstructions: prepaymentInstructions || undefined,
      };
    });

    return NextResponse.json({ ok: true, service: newService }, { status: 201 });
  } catch (error) {
    console.error("Error en POST /api/services:", error);
    return NextResponse.json(
      { ok: false, error: "DB_UNAVAILABLE", message: "No se pudo crear el servicio." },
      { status: 500 }
    );
  }
}
