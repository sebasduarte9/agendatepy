import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireSuperAdminSession, isGuardError, UUID_REGEX } from "@/lib/api-guard";
import { AppointmentStatus, CashMovementType } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireSuperAdminSession(request);
    if (isGuardError(auth)) return auth;

    const { id } = await params;
    if (!id || !UUID_REGEX.test(id)) {
      return NextResponse.json(
        { ok: false, error: "VALIDATION_ERROR", message: "ID de negocio inválido." },
        { status: 400 }
      );
    }

    const tenant = await prisma.tenant.findUnique({
      where: { id },
      include: {
        users: {
          where: { role: "OWNER" },
          select: { email: true, name: true, phone: true },
          take: 1,
        },
        staff: {
          select: { id: true, name: true, active: true, commissionPercentage: true },
        },
        services: {
          select: { id: true, name: true, price: true, durationMinutes: true, active: true },
        },
        products: {
          select: { id: true, name: true, imageUrl: true, price: true, category: true, createdAt: true },
          orderBy: { createdAt: "desc" },
        },
        clients: {
          select: { id: true, name: true, phone: true, notes: true, formula: true, createdAt: true },
          take: 60,
          orderBy: { createdAt: "desc" },
        },
        _count: {
          select: {
            staff: true,
            services: true,
            clients: true,
            appointments: true,
            cashMovements: true,
            cashRegisterCloses: true,
            commissionPayouts: true,
          },
        },
      },
    });

    if (!tenant) {
      return NextResponse.json(
        { ok: false, error: "NOT_FOUND", message: "Negocio no encontrado." },
        { status: 404 }
      );
    }

    // Appointment status breakdown
    const appointmentsByStatus = await prisma.appointment.groupBy({
      by: ["status"],
      where: { tenantId: id },
      _count: { id: true },
    });

    const statusCounts: Record<string, number> = {
      COMPLETED: 0,
      CONFIRMED: 0,
      CANCELLED: 0,
      NO_SHOW: 0,
      PENDING_ACTION: 0,
      PENDING: 0,
      EXPIRED: 0,
    };
    appointmentsByStatus.forEach((g) => {
      statusCounts[g.status] = g._count.id;
    });

    // Cash metrics
    const cashIncomeAgg = await prisma.cashMovement.aggregate({
      _sum: { amount: true },
      where: { tenantId: id, type: CashMovementType.INCOME },
    });
    const cashExpenseAgg = await prisma.cashMovement.aggregate({
      _sum: { amount: true },
      where: { tenantId: id, type: CashMovementType.EXPENSE },
    });

    // Milestones (first booking, first completed, first cash)
    const firstBooking = await prisma.appointment.findFirst({
      where: { tenantId: id },
      orderBy: { createdAt: "asc" },
      select: { createdAt: true },
    });
    const firstCompleted = await prisma.appointment.findFirst({
      where: { tenantId: id, status: AppointmentStatus.COMPLETED },
      orderBy: { createdAt: "asc" },
      select: { createdAt: true },
    });
    const firstCash = await prisma.cashMovement.findFirst({
      where: { tenantId: id, type: CashMovementType.INCOME },
      orderBy: { createdAt: "asc" },
      select: { createdAt: true, amount: true },
    });

    // Last activity
    const lastApp = await prisma.appointment.findFirst({
      where: { tenantId: id },
      orderBy: { createdAt: "desc" },
      select: { createdAt: true },
    });
    const lastCash = await prisma.cashMovement.findFirst({
      where: { tenantId: id },
      orderBy: { createdAt: "desc" },
      select: { createdAt: true },
    });

    let lastActivityDate: Date | null = null;
    if (lastApp && lastCash) {
      lastActivityDate = lastApp.createdAt > lastCash.createdAt ? lastApp.createdAt : lastCash.createdAt;
    } else if (lastApp) {
      lastActivityDate = lastApp.createdAt;
    } else if (lastCash) {
      lastActivityDate = lastCash.createdAt;
    }

    const now = new Date();
    let activityStatus = "Inactivo";
    if (lastActivityDate) {
      const diffDays = (now.getTime() - lastActivityDate.getTime()) / (1000 * 60 * 60 * 24);
      if (diffDays <= 14) {
        activityStatus = "Activo";
      } else if (diffDays <= 45) {
        activityStatus = "Sin actividad reciente";
      }
    }

    // Recent activity (aggregated, without customer PII)
    const recentAppointments = await prisma.appointment.findMany({
      where: { tenantId: id },
      orderBy: { startTime: "desc" },
      take: 10,
      select: {
        id: true,
        startTime: true,
        status: true,
        service: { select: { name: true, price: true } },
        staff: { select: { name: true } },
      },
    });

    const isConfigured = tenant._count.staff > 0 && tenant._count.services > 0;
    const isReadyToBook = isConfigured && tenant.status === "ACTIVE";
    const owner = tenant.users[0] || null;

    const payloadData = {
      tenant: {
        id: tenant.id,
        name: tenant.name,
        slug: tenant.slug,
        subdomain: tenant.subdomain,
        plan: tenant.plan || "PROFESIONAL",
        status: tenant.status,
        timezone: tenant.timezone,
        ownerEmail: owner?.email || (tenant.settings as any)?.email || null,
        ownerName: owner?.name || null,
        ownerPhone: owner?.phone || (tenant.settings as any)?.whatsappPhone || null,
        city: (tenant.settings as any)?.city || null,
        createdAt: tenant.createdAt.toISOString(),
        updatedAt: tenant.updatedAt.toISOString(),
      },
      operationalActivity: {
        status: activityStatus,
        lastActivityAt: lastActivityDate?.toISOString() || null,
      },
      milestones: {
        isConfigured,
        isReadyToBook,
        hasFirstBooking: !!firstBooking || tenant._count.appointments > 0,
        hasFirstCompleted: !!firstCompleted,
        hasFirstCash: !!firstCash || tenant._count.cashMovements > 0,
        registeredAt: tenant.createdAt.toISOString(),
        firstBookingAt: firstBooking?.createdAt.toISOString() || null,
        firstCompletedAt: firstCompleted?.createdAt.toISOString() || null,
        firstCashAt: firstCash?.createdAt.toISOString() || null,
      },
      counts: {
        staff: tenant._count.staff,
        services: tenant._count.services,
        clients: tenant._count.clients,
        appointments: tenant._count.appointments,
        cashMovements: tenant._count.cashMovements,
        cashRegisterCloses: tenant._count.cashRegisterCloses,
        commissionPayouts: tenant._count.commissionPayouts,
      },
      aggregatedFinances: {
        totalCashVolume: cashIncomeAgg._sum.amount || 0,
        totalExpenses: cashExpenseAgg._sum.amount || 0,
        totalCommissionsPaid: 0,
      },
      appointmentsByStatus: statusCounts,
      recentOperationalActivity: recentAppointments.map((a) => ({
        id: a.id,
        date: a.startTime.toISOString(),
        status: a.status,
        serviceName: a.service?.name || "Servicio",
        price: a.service?.price || 0,
        staffName: a.staff?.name || "Staff",
      })),
      mediaGallery: (() => {
        const list: Array<{
          id: string;
          type: "product" | "client" | "branding";
          title: string;
          url: string;
          subtitle: string;
          createdAt: string;
        }> = [];

        // 1. Products
        (tenant.products || []).forEach((p) => {
          if (p.imageUrl && p.imageUrl.trim()) {
            list.push({
              id: `prod-${p.id}`,
              type: "product",
              title: p.name,
              url: p.imageUrl,
              subtitle: `Producto de Tienda · Gs. ${p.price.toLocaleString("es-PY")}`,
              createdAt: p.createdAt.toISOString(),
            });
          }
        });

        // 2. Branding (logo, cover, gallery from themeSettings)
        const theme = (tenant.themeSettings as any) || {};
        if (theme.logoUrl && typeof theme.logoUrl === "string" && theme.logoUrl.trim()) {
          list.push({
            id: "brand-logo",
            type: "branding",
            title: "Logo Oficial",
            url: theme.logoUrl,
            subtitle: "Avatar / Logo del Salón",
            createdAt: tenant.createdAt.toISOString(),
          });
        }
        if (theme.coverUrl && typeof theme.coverUrl === "string" && theme.coverUrl.trim()) {
          list.push({
            id: "brand-cover",
            type: "branding",
            title: "Foto de Portada",
            url: theme.coverUrl,
            subtitle: "Banner Principal del Portal",
            createdAt: tenant.createdAt.toISOString(),
          });
        }
        if (Array.isArray(theme.gallery)) {
          theme.gallery.forEach((g: any, idx: number) => {
            const url = typeof g === "string" ? g : g?.url;
            if (url && typeof url === "string" && url.trim()) {
              list.push({
                id: `brand-gallery-${idx}`,
                type: "branding",
                title: g?.title || `Foto de Galería #${idx + 1}`,
                url,
                subtitle: "Galería Pública del Salón",
                createdAt: g?.createdAt || tenant.createdAt.toISOString(),
              });
            }
          });
        }

        // 3. Client Gallery (fichas técnicas)
        (tenant.clients || []).forEach((c) => {
          if (c.notes) {
            try {
              const parsed = JSON.parse(c.notes);
              if (Array.isArray(parsed?.gallery)) {
                parsed.gallery.forEach((m: any, idx: number) => {
                  const url = typeof m === "string" ? m : m?.url;
                  if (url) {
                    list.push({
                      id: `client-${c.id}-${idx}`,
                      type: "client",
                      title: `Ficha: ${c.name}`,
                      url,
                      subtitle: m?.caption || `Tel: ${c.phone}`,
                      createdAt: m?.createdAt || c.createdAt.toISOString(),
                    });
                  }
                });
              }
            } catch {}
          }
        });

        return list;
      })(),
    };

    return NextResponse.json({
      ok: true,
      data: payloadData,
      tenant: {
        ...payloadData.tenant,
        metrics: payloadData.counts,
        milestones: payloadData.milestones,
        recentActivity: payloadData.recentOperationalActivity,
      },
    });
  } catch (error) {
    console.error("Error en GET /api/admin/tenants/[id]:", error);
    return NextResponse.json(
      { ok: false, error: "SERVER_ERROR", message: "Error al obtener detalle del negocio." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireSuperAdminSession(request);
    if (isGuardError(auth)) return auth;

    const { id } = await params;
    const body = await request.json();
    const { mediaId, type } = body;

    if (type === "product" && mediaId.startsWith("prod-")) {
      const prodId = mediaId.replace("prod-", "");
      await prisma.product.update({
        where: { id: prodId, tenantId: id },
        data: { imageUrl: null },
      });
    } else if (type === "branding") {
      const tenant = await prisma.tenant.findUnique({ where: { id } });
      if (tenant) {
        const theme = (tenant.themeSettings as any) || {};
        if (mediaId === "brand-logo") theme.logoUrl = "";
        if (mediaId === "brand-cover") theme.coverUrl = "";
        if (mediaId.startsWith("brand-gallery-")) {
          const idx = parseInt(mediaId.replace("brand-gallery-", ""), 10);
          if (Array.isArray(theme.gallery)) {
            theme.gallery.splice(idx, 1);
          }
        }
        await prisma.tenant.update({
          where: { id },
          data: { themeSettings: theme },
        });
      }
    }

    return NextResponse.json({ ok: true, message: "Archivo multimedia moderado con éxito." });
  } catch (error) {
    console.error("Error eliminando multimedia:", error);
    return NextResponse.json({ ok: false, error: "SERVER_ERROR" }, { status: 500 });
  }
}
