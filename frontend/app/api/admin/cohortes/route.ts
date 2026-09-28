import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireSuperAdminSession, isGuardError } from "@/lib/api-guard";
import { formatInTimeZone } from "date-fns-tz";
import { isBusinessReadyForBooking } from "@/lib/business-readiness";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const auth = await requireSuperAdminSession(request);
    if (isGuardError(auth)) return auth;

    const now = new Date();

    // 1. Obtener todos los tenants con sus entidades
    const tenants = await prisma.tenant.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        subdomain: true,
        status: true,
        createdAt: true,
        staff: {
          select: {
            id: true,
            name: true,
            active: true,
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
            commissionPayouts: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    // 2. Obtener primera cita y primer cobro por tenant
    const firstBookings = await prisma.appointment.groupBy({
      by: ["tenantId"],
      _min: {
        createdAt: true,
      },
    });
    const firstBookingMap = new Map(
      firstBookings.map((b) => [b.tenantId, b._min.createdAt])
    );

    const firstCashes = await prisma.cashMovement.groupBy({
      by: ["tenantId"],
      _min: {
        createdAt: true,
      },
    });
    const firstCashMap = new Map(
      firstCashes.map((c) => [c.tenantId, c._min.createdAt])
    );

    // 3. Obtener todas las fechas de actividad por tenant para cálculo preciso de D7..D90
    const [allAppointmentDates, allCashDates, allPayoutDates] = await Promise.all([
      prisma.appointment.findMany({
        select: { tenantId: true, createdAt: true },
      }),
      prisma.cashMovement.findMany({
        select: { tenantId: true, createdAt: true },
      }),
      prisma.commissionPayout.findMany({
        select: { tenantId: true, createdAt: true },
      }),
    ]);

    const tenantActivityMap = new Map<string, number[]>();
    const addActivity = (tenantId: string | null, date: Date) => {
      if (!tenantId) return;
      if (!tenantActivityMap.has(tenantId)) {
        tenantActivityMap.set(tenantId, []);
      }
      tenantActivityMap.get(tenantId)!.push(date.getTime());
    };

    allAppointmentDates.forEach((a) => addActivity(a.tenantId, a.createdAt));
    allCashDates.forEach((c) => addActivity(c.tenantId, c.createdAt));
    allPayoutDates.forEach((p) => addActivity(p.tenantId, p.createdAt));

    // 4. Agrupar por mes de creación (Cohorte: YYYY-MM)
    interface CohortGroup {
      month: string;
      registeredCount: number;
      configuredCount: number;
      readyForBookingCount: number;
      firstBookingCount: number;
      firstCashCount: number;
      activeCount: number;
      // Milestones D7, D14, D30, D60, D90
      d7: { available: boolean; eligibleCount: number; retainedCount: number; rate: number | null; label: string };
      d14: { available: boolean; eligibleCount: number; retainedCount: number; rate: number | null; label: string };
      d30: { available: boolean; eligibleCount: number; retainedCount: number; rate: number | null; label: string };
      d60: { available: boolean; eligibleCount: number; retainedCount: number; rate: number | null; label: string };
      d90: { available: boolean; eligibleCount: number; retainedCount: number; rate: number | null; label: string };
      tenants: Array<{
        id: string;
        name: string;
        slug: string;
        createdAt: string;
        isConfigured: boolean;
        isReadyForBooking: boolean;
        hasFirstBooking: boolean;
        hasFirstCash: boolean;
      }>;
    }

    const cohortGroups: Record<string, CohortGroup> = {};

    const MS_PER_DAY = 24 * 60 * 60 * 1000;

    for (const t of tenants) {
      const cohortKey = formatInTimeZone(
        t.createdAt,
        "America/Asuncion",
        "yyyy-MM"
      );

      if (!cohortGroups[cohortKey]) {
        cohortGroups[cohortKey] = {
          month: cohortKey,
          registeredCount: 0,
          configuredCount: 0,
          readyForBookingCount: 0,
          firstBookingCount: 0,
          activeCount: 0,
          firstCashCount: 0,
          d7: { available: false, eligibleCount: 0, retainedCount: 0, rate: null, label: "Aún no disponible" },
          d14: { available: false, eligibleCount: 0, retainedCount: 0, rate: null, label: "Aún no disponible" },
          d30: { available: false, eligibleCount: 0, retainedCount: 0, rate: null, label: "Aún no disponible" },
          d60: { available: false, eligibleCount: 0, retainedCount: 0, rate: null, label: "Aún no disponible" },
          d90: { available: false, eligibleCount: 0, retainedCount: 0, rate: null, label: "Aún no disponible" },
          tenants: [],
        };
      }

      const isConfigured = t._count.staff > 0 && t._count.services > 0;
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

      const hasFirstBooking =
        firstBookingMap.get(t.id) !== undefined || t._count.appointments > 0;
      const hasFirstCash =
        firstCashMap.get(t.id) !== undefined || t._count.cashMovements > 0;
      const isActive = t._count.appointments > 0 || t._count.cashMovements > 0;

      const group = cohortGroups[cohortKey];
      group.registeredCount += 1;
      if (isConfigured) group.configuredCount += 1;
      if (isReady) group.readyForBookingCount += 1;
      if (hasFirstBooking) group.firstBookingCount += 1;
      if (hasFirstCash) group.firstCashCount += 1;
      if (isActive) group.activeCount += 1;

      // Calcular retención D7, D14, D30, D60, D90 para este tenant
      const tenantCreatedAt = t.createdAt.getTime();
      const tenantActivities = tenantActivityMap.get(t.id) || [];

      const checkMilestone = (days: number, key: "d7" | "d14" | "d30" | "d60" | "d90") => {
        const milestoneTime = tenantCreatedAt + days * MS_PER_DAY;
        if (now.getTime() >= milestoneTime) {
          group[key].eligibleCount += 1;
          // ¿Tuvo actividad después de alcanzar el día N o a partir del día N?
          const hasActivityAfterN = tenantActivities.some((actTime) => actTime >= milestoneTime);
          if (hasActivityAfterN) {
            group[key].retainedCount += 1;
          }
        }
      };

      checkMilestone(7, "d7");
      checkMilestone(14, "d14");
      checkMilestone(30, "d30");
      checkMilestone(60, "d60");
      checkMilestone(90, "d90");

      group.tenants.push({
        id: t.id,
        name: t.name,
        slug: t.slug,
        createdAt: t.createdAt.toISOString(),
        isConfigured,
        isReadyForBooking: isReady,
        hasFirstBooking,
        hasFirstCash,
      });
    }

    // Calcular tasas finales y labels
    const daysKeys: Array<"d7" | "d14" | "d30" | "d60" | "d90"> = ["d7", "d14", "d30", "d60", "d90"];
    for (const group of Object.values(cohortGroups)) {
      for (const k of daysKeys) {
        if (group[k].eligibleCount > 0) {
          group[k].available = true;
          group[k].rate = Number(((group[k].retainedCount / group[k].eligibleCount) * 100).toFixed(1));
          group[k].label = `${group[k].rate}% (${group[k].retainedCount}/${group[k].eligibleCount})`;
        } else {
          group[k].available = false;
          group[k].rate = null;
          group[k].label = "Aún no disponible";
        }
      }
    }

    const cohortList = Object.values(cohortGroups).sort((a, b) =>
      b.month.localeCompare(a.month)
    );

    return NextResponse.json({
      ok: true,
      cohorts: cohortList,
      totalCohorts: cohortList.length,
      generatedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("[GET /api/admin/cohortes] Error:", error);
    return NextResponse.json(
      { ok: false, error: "SERVER_ERROR", message: "Error al calcular cohortes de plataforma." },
      { status: 500 }
    );
  }
}
