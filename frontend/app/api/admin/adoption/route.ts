import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireSuperAdminSession, isGuardError } from "@/lib/api-guard";
import { isBusinessReadyForBooking } from "@/lib/business-readiness";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const auth = await requireSuperAdminSession(request);
    if (isGuardError(auth)) return auth;

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.trim().toLowerCase() || "";
    const featureFilter = searchParams.get("feature") || "ALL";

    // 1. Obtener todos los tenants con conteos de entidades
    const tenants = await prisma.tenant.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        subdomain: true,
        plan: true,
        status: true,
        createdAt: true,
        staff: {
          select: {
            id: true,
            name: true,
            active: true,
            commissionPercentage: true,
            schedules: { select: { dayOfWeek: true } },
          },
        },
        services: {
          select: {
            id: true,
            name: true,
            active: true,
            durationMinutes: true,
            price: true,
          },
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
      orderBy: { createdAt: "desc" },
    });

    // 2. Obtener eventos de reservas públicas y exportaciones de plataforma
    const [publicBookingEvents, exportEvents] = await Promise.all([
      prisma.platformEvent.findMany({
        where: { event: "PUBLIC_BOOKING_CREATED" },
        select: { tenantId: true },
        distinct: ["tenantId"],
      }),
      prisma.platformEvent.findMany({
        where: { event: { in: ["EXPORT_CREATED", "COMMISSION_EXPORTED"] } },
        select: { tenantId: true },
        distinct: ["tenantId"],
      }),
    ]);

    const publicBookingTenantIds = new Set(
      publicBookingEvents.map((e) => e.tenantId).filter(Boolean)
    );
    const exportTenantIds = new Set(
      exportEvents.map((e) => e.tenantId).filter(Boolean)
    );

    const totalTenants = tenants.length;

    let calendarCount = 0;
    let clientsCount = 0;
    let servicesCount = 0;
    let staffCount = 0;
    let cashCount = 0;
    let cashRegisterCount = 0;
    let commissionsCount = 0;
    let payoutsCount = 0;
    let publicPortalCount = 0;
    let reportsCount = 0;
    let readyForBookingCount = 0;

    const matrix = tenants.map((t) => {
      const hasCalendar = t._count.appointments > 0;
      const hasClients = t._count.clients > 0;
      const hasServices = t._count.services > 0;
      const hasStaff = t._count.staff > 0;
      const hasCash = t._count.cashMovements > 0;
      const hasCashRegister = t._count.cashRegisterCloses > 0;
      const hasCommissions =
        t._count.commissionPayouts > 0 ||
        t.staff.some((s) => s.commissionPercentage > 0);
      const hasPayouts = t._count.commissionPayouts > 0;
      const hasPublicPortal =
        publicBookingTenantIds.has(t.id) ||
        (t.status === "ACTIVE" && hasServices && hasStaff);
      const hasReports = exportTenantIds.has(t.id);

      const isReady = isBusinessReadyForBooking({
        id: t.id,
        name: t.name,
        slug: t.slug,
        subdomain: t.subdomain,
        status: t.status,
        services: t.services,
        staff: t.staff,
        appointmentsCount: t._count.appointments,
      });

      if (hasCalendar) calendarCount++;
      if (hasClients) clientsCount++;
      if (hasServices) servicesCount++;
      if (hasStaff) staffCount++;
      if (hasCash) cashCount++;
      if (hasCashRegister) cashRegisterCount++;
      if (hasCommissions) commissionsCount++;
      if (hasPayouts) payoutsCount++;
      if (hasPublicPortal) publicPortalCount++;
      if (hasReports) reportsCount++;
      if (isReady) readyForBookingCount++;

      // Adoption score: número de módulos adoptados (0-9)
      const adoptedFeaturesCount = [
        hasCalendar,
        hasClients,
        hasServices,
        hasStaff,
        hasCash,
        hasCashRegister,
        hasCommissions,
        hasPayouts,
        hasPublicPortal,
      ].filter(Boolean).length;

      return {
        id: t.id,
        name: t.name,
        slug: t.slug,
        plan: t.plan,
        status: t.status,
        createdAt: t.createdAt.toISOString(),
        isReady,
        features: {
          calendar: hasCalendar,
          clients: hasClients,
          services: hasServices,
          staff: hasStaff,
          cash: hasCash,
          cashRegister: hasCashRegister,
          commissions: hasCommissions,
          payouts: hasPayouts,
          portal: hasPublicPortal,
          reports: hasReports,
        },
        counts: {
          appointments: t._count.appointments,
          clients: t._count.clients,
          services: t._count.services,
          staff: t._count.staff,
          cashMovements: t._count.cashMovements,
          cashRegisterCloses: t._count.cashRegisterCloses,
          payouts: t._count.commissionPayouts,
        },
        adoptedFeaturesCount,
      };
    });

    // Filtros
    let filteredMatrix = matrix;
    if (search) {
      filteredMatrix = filteredMatrix.filter(
        (m) =>
          m.name.toLowerCase().includes(search) ||
          m.slug.toLowerCase().includes(search)
      );
    }
    if (featureFilter !== "ALL") {
      const feat = featureFilter.toLowerCase();
      filteredMatrix = filteredMatrix.filter((m) => {
        if (feat in m.features) {
          return (m.features as any)[feat] === true;
        }
        return true;
      });
    }

    const calcPct = (count: number) =>
      totalTenants > 0 ? Number(((count / totalTenants) * 100).toFixed(1)) : 0;

    const adoptionRates = {
      calendar: { count: calendarCount, percentage: calcPct(calendarCount) },
      clients: { count: clientsCount, percentage: calcPct(clientsCount) },
      services: { count: servicesCount, percentage: calcPct(servicesCount) },
      staff: { count: staffCount, percentage: calcPct(staffCount) },
      cash: { count: cashCount, percentage: calcPct(cashCount) },
      cashRegister: {
        count: cashRegisterCount,
        percentage: calcPct(cashRegisterCount),
      },
      commissions: {
        count: commissionsCount,
        percentage: calcPct(commissionsCount),
      },
      payouts: { count: payoutsCount, percentage: calcPct(payoutsCount) },
      portal: {
        count: publicPortalCount,
        percentage: calcPct(publicPortalCount),
      },
      reports: { count: reportsCount, percentage: calcPct(reportsCount) },
      readyForBooking: {
        count: readyForBookingCount,
        percentage: calcPct(readyForBookingCount),
      },
    };

    return NextResponse.json({
      ok: true,
      totalTenants,
      adoptionRates,
      matrix: filteredMatrix,
      generatedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("[GET /api/admin/adoption] Error:", error);
    return NextResponse.json(
      { ok: false, error: "SERVER_ERROR", message: "Error al obtener matriz de adopción." },
      { status: 500 }
    );
  }
}
