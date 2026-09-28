import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireSuperAdminSession, isGuardError } from "@/lib/api-guard";
import { AppointmentStatus, CashMovementType, PayoutStatus } from "@prisma/client";
import { isBusinessReadyForBooking } from "@/lib/business-readiness";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const auth = await requireSuperAdminSession(request);
    if (isGuardError(auth)) return auth;

    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "30d"; // "7d", "30d", "90d", "365d", "all"

    const now = new Date();
    let filterDate: Date | null = null;

    if (period === "7d") {
      filterDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (period === "30d") {
      filterDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    } else if (period === "90d") {
      filterDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    } else if (period === "365d") {
      filterDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
    }

    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // 1. Total Tenants & Status breakdown
    const totalTenants = await prisma.tenant.count();
    const activeStatusTenants = await prisma.tenant.count({
      where: { status: "ACTIVE" },
    });
    const pausedStatusTenants = await prisma.tenant.count({
      where: { status: "PAUSED" },
    });
    const inactiveStatusTenants = await prisma.tenant.count({
      where: { status: { not: "ACTIVE" } },
    });

    const newTenants7d = await prisma.tenant.count({
      where: { createdAt: { gte: sevenDaysAgo } },
    });
    const newTenants30d = await prisma.tenant.count({
      where: { createdAt: { gte: thirtyDaysAgo } },
    });
    const newTenantsInPeriod = filterDate
      ? await prisma.tenant.count({ where: { createdAt: { gte: filterDate } } })
      : totalTenants;

    // 2. Real SaaS Plan Breakdown (FREE vs PAID vs TRIAL)
    const planCounts = await prisma.tenant.groupBy({
      by: ["plan"],
      _count: { id: true },
    });

    const planBreakdown: Record<string, number> = {};
    let freeTenantsCount = 0;
    let paidTenantsCount = 0;
    let trialTenantsCount = 0;

    planCounts.forEach((p) => {
      const planName = p.plan || "PROFESIONAL";
      planBreakdown[planName] = (planBreakdown[planName] || 0) + p._count.id;

      const upperPlan = planName.toUpperCase();
      if (upperPlan === "FREE" || upperPlan === "GRATUITO") {
        freeTenantsCount += p._count.id;
      } else if (upperPlan === "TRIAL") {
        trialTenantsCount += p._count.id;
      } else {
        // Any professional/pro/empresa/paid plan
        paidTenantsCount += p._count.id;
      }
    });

    const freePercentage = totalTenants > 0 ? Number(((freeTenantsCount / totalTenants) * 100).toFixed(1)) : 0;
    const paidPercentage = totalTenants > 0 ? Number(((paidTenantsCount / totalTenants) * 100).toFixed(1)) : 0;
    const trialPercentage = totalTenants > 0 ? Number(((trialTenantsCount / totalTenants) * 100).toFixed(1)) : 0;

    // 3. Operational Activity (Tenants with appointments or cash in last 14 days)
    const activeAppointmentTenantIds = await prisma.appointment.findMany({
      where: { createdAt: { gte: fourteenDaysAgo } },
      select: { tenantId: true },
      distinct: ["tenantId"],
    });
    const activeCashTenantIds = await prisma.cashMovement.findMany({
      where: { createdAt: { gte: fourteenDaysAgo } },
      select: { tenantId: true },
      distinct: ["tenantId"],
    });
    const uniqueActiveTenantIds = new Set([
      ...activeAppointmentTenantIds.map((a) => a.tenantId),
      ...activeCashTenantIds.map((c) => c.tenantId),
    ]);
    const activeOperatingTenantsCount = uniqueActiveTenantIds.size;

    // 4. Appointments KPIs
    const totalAppointments = await prisma.appointment.count();
    const appointments7d = await prisma.appointment.count({
      where: { createdAt: { gte: sevenDaysAgo } },
    });
    const appointments30d = await prisma.appointment.count({
      where: { createdAt: { gte: thirtyDaysAgo } },
    });
    const appointmentsInPeriod = filterDate
      ? await prisma.appointment.count({ where: { createdAt: { gte: filterDate } } })
      : totalAppointments;

    const completedAppointments = await prisma.appointment.count({
      where: { status: AppointmentStatus.COMPLETED },
    });
    const completedAppointmentsInPeriod = filterDate
      ? await prisma.appointment.count({
          where: {
            status: AppointmentStatus.COMPLETED,
            createdAt: { gte: filterDate },
          },
        })
      : completedAppointments;

    const cancelledAppointments = await prisma.appointment.count({
      where: { status: AppointmentStatus.CANCELLED },
    });
    const noShowAppointments = await prisma.appointment.count({
      where: { status: AppointmentStatus.NO_SHOW },
    });

    // 5. Financial Volumes Recorded (Aggregated from tenants' cash movements & payouts)
    const cashIncomeAgg = await prisma.cashMovement.aggregate({
      _sum: { amount: true },
      where: { type: CashMovementType.INCOME },
    });
    const totalCashIncomeRecorded = cashIncomeAgg._sum.amount || 0;

    const cashIncomePeriodAgg = filterDate
      ? await prisma.cashMovement.aggregate({
          _sum: { amount: true },
          where: {
            type: CashMovementType.INCOME,
            createdAt: { gte: filterDate },
          },
        })
      : cashIncomeAgg;
    const cashMovementsVolumeInPeriod = cashIncomePeriodAgg._sum.amount || 0;

    const commissionsPayoutAgg = await prisma.commissionPayout.aggregate({
      _sum: { amountPaid: true },
      where: { status: PayoutStatus.PAID },
    });
    const totalCommissionsPaid = commissionsPayoutAgg._sum.amountPaid || 0;

    const commissionsPeriodAgg = filterDate
      ? await prisma.commissionPayout.aggregate({
          _sum: { amountPaid: true },
          where: {
            status: PayoutStatus.PAID,
            paidAt: { gte: filterDate },
          },
        })
      : commissionsPayoutAgg;
    const commissionsPaidInPeriod = commissionsPeriodAgg._sum.amountPaid || 0;

    // 6. Total Clients
    const totalClients = await prisma.client.count();
    const clientsCreatedInPeriod = filterDate
      ? await prisma.client.count({ where: { createdAt: { gte: filterDate } } })
      : totalClients;

    // 7. Recent Tenants for SaaS Directory Overview
    const recentTenantsList = await prisma.tenant.findMany({
      take: 8,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        slug: true,
        subdomain: true,
        plan: true,
        status: true,
        createdAt: true,
        _count: {
          select: {
            staff: true,
            services: true,
            clients: true,
            appointments: true,
          },
        },
      },
    });

    const formattedRecentTenants = recentTenantsList.map((t) => ({
      id: t.id,
      name: t.name,
      slug: t.slug,
      subdomain: t.subdomain,
      plan: t.plan,
      isPaid: t.plan?.toUpperCase() !== "FREE" && t.plan?.toUpperCase() !== "TRIAL",
      status: t.status,
      createdAt: t.createdAt.toISOString(),
      staffCount: t._count.staff,
      servicesCount: t._count.services,
      clientsCount: t._count.clients,
      appointmentsCount: t._count.appointments,
    }));

    // 8. Comprehensive Tenant Query for Funnel, Readiness & Time to Value
    const allTenants = await prisma.tenant.findMany({
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
    });

    // Earliest booking per tenant
    const earliestBookings = await prisma.appointment.groupBy({
      by: ["tenantId"],
      _min: { createdAt: true },
    });
    const earliestBookingMap = new Map(earliestBookings.map((b) => [b.tenantId, b._min.createdAt]));

    // Earliest completed appointment per tenant
    const earliestCompleted = await prisma.appointment.groupBy({
      by: ["tenantId"],
      where: { status: AppointmentStatus.COMPLETED },
      _min: { createdAt: true },
    });
    const earliestCompletedMap = new Map(earliestCompleted.map((c) => [c.tenantId, c._min.createdAt]));

    // Earliest cash movement per tenant
    const earliestCashes = await prisma.cashMovement.groupBy({
      by: ["tenantId"],
      where: { type: CashMovementType.INCOME },
      _min: { createdAt: true },
    });
    const earliestCashMap = new Map(earliestCashes.map((c) => [c.tenantId, c._min.createdAt]));

    let configuredCount = 0;
    let readyForBookingCount = 0;
    let firstBookingCount = 0;
    let firstCompletedCount = 0;
    let firstCashCount = 0;
    let continuousActiveCount = 0;

    const timeToBookingHoursList: number[] = [];
    const timeToCompletedHoursList: number[] = [];
    const timeToCashHoursList: number[] = [];

    allTenants.forEach((t) => {
      const isConfigured = t._count.staff > 0 && t._count.services > 0;
      if (isConfigured) {
        configuredCount++;
      }

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

      if (isReady) {
        readyForBookingCount++;
      }

      const firstBookingDate = earliestBookingMap.get(t.id);
      if (firstBookingDate || t._count.appointments > 0) {
        firstBookingCount++;
        if (firstBookingDate) {
          const diffHours = Math.max(0, (firstBookingDate.getTime() - t.createdAt.getTime()) / (1000 * 60 * 60));
          timeToBookingHoursList.push(diffHours);
        }
      }

      const firstCompletedDate = earliestCompletedMap.get(t.id);
      if (firstCompletedDate) {
        firstCompletedCount++;
        const diffHours = Math.max(0, (firstCompletedDate.getTime() - t.createdAt.getTime()) / (1000 * 60 * 60));
        timeToCompletedHoursList.push(diffHours);
      }

      const firstCashDate = earliestCashMap.get(t.id);
      if (firstCashDate || t._count.cashMovements > 0) {
        firstCashCount++;
        if (firstCashDate) {
          const diffHours = Math.max(0, (firstCashDate.getTime() - t.createdAt.getTime()) / (1000 * 60 * 60));
          timeToCashHoursList.push(diffHours);
        }
      }

      if (t._count.appointments >= 3 && t._count.cashMovements >= 1) {
        continuousActiveCount++;
      }
    });

    const calcStats = (hoursList: number[]) => {
      if (hoursList.length === 0) {
        return { avgHours: 0, averageHours: 0, medianHours: 0, minHours: 0, maxHours: 0, count: 0, formattedAvg: "0 hrs" };
      }
      const sorted = [...hoursList].sort((a, b) => a - b);
      const sum = sorted.reduce((acc, val) => acc + val, 0);
      const avg = Number((sum / sorted.length).toFixed(1));
      const mid = Math.floor(sorted.length / 2);
      const median = Number((sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2).toFixed(1));
      const min = Number(sorted[0].toFixed(1));
      const max = Number(sorted[sorted.length - 1].toFixed(1));
      return {
        avgHours: avg,
        averageHours: avg,
        medianHours: median,
        minHours: min,
        maxHours: max,
        count: sorted.length,
        formattedAvg: `${avg} hrs`,
      };
    };

    const timeToValue = {
      timeToFirstBooking: calcStats(timeToBookingHoursList),
      timeToFirstCompleted: calcStats(timeToCompletedHoursList),
      timeToFirstCash: calcStats(timeToCashHoursList),
    };

    const adoptionRates = {
      calendar: {
        tenantsUsing: firstBookingCount,
        adoptionRate: totalTenants > 0 ? Math.round((firstBookingCount / totalTenants) * 100) : 0,
      },
      clients: {
        tenantsUsing: allTenants.filter((t) => t._count.clients > 0).length,
        adoptionRate: totalTenants > 0 ? Math.round((allTenants.filter((t) => t._count.clients > 0).length / totalTenants) * 100) : 0,
      },
      services: {
        tenantsUsing: allTenants.filter((t) => t._count.services > 0).length,
        adoptionRate: totalTenants > 0 ? Math.round((allTenants.filter((t) => t._count.services > 0).length / totalTenants) * 100) : 0,
      },
      cashModule: {
        tenantsUsing: allTenants.filter((t) => t._count.cashMovements > 0).length,
        adoptionRate: totalTenants > 0 ? Math.round((allTenants.filter((t) => t._count.cashMovements > 0).length / totalTenants) * 100) : 0,
      },
      cashClosures: {
        tenantsUsing: allTenants.filter((t) => t._count.cashRegisterCloses > 0).length,
        adoptionRate: totalTenants > 0 ? Math.round((allTenants.filter((t) => t._count.cashRegisterCloses > 0).length / totalTenants) * 100) : 0,
      },
      commissionPayouts: {
        tenantsUsing: allTenants.filter((t) => t._count.commissionPayouts > 0).length,
        adoptionRate: totalTenants > 0 ? Math.round((allTenants.filter((t) => t._count.commissionPayouts > 0).length / totalTenants) * 100) : 0,
      },
      publicBookingPortal: {
        tenantsUsing: readyForBookingCount,
        adoptionRate: totalTenants > 0 ? Math.round((readyForBookingCount / totalTenants) * 100) : 0,
      },
    };

    return NextResponse.json({
      ok: true,
      period,
      // Core SaaS Platform Overview metrics
      saasOverview: {
        totalTenants,
        freeTenantsCount,
        paidTenantsCount,
        trialTenantsCount,
        activeTenantsCount: activeStatusTenants,
        inactiveTenantsCount: inactiveStatusTenants,
        pausedTenantsCount: pausedStatusTenants,
        percentages: {
          free: freePercentage,
          paid: paidPercentage,
          trial: trialPercentage,
        },
        planBreakdown,
        newTenantsInPeriod,
        recentTenants: formattedRecentTenants,
      },
      // Backward compatible kpis
      kpis: {
        totalTenants,
        freeTenantsCount,
        paidTenantsCount,
        trialTenantsCount,
        activeTenants: activeStatusTenants,
        activeStatusTenants,
        pausedStatusTenants,
        inactiveStatusTenants,
        newTenants7d,
        newTenants30d,
        newTenantsInPeriod,
        activeTenantsLast7d: activeOperatingTenantsCount,
        activeOperatingTenantsCount,
        totalAppointments,
        appointments7d,
        appointments30d,
        appointmentsInPeriod,
        completedAppointments,
        completedAppointmentsInPeriod,
        cancelledAppointments,
        noShowAppointments,
        totalClientsCreated: totalClients,
        totalClients,
        clientsCreatedInPeriod,
        totalCashVolume: totalCashIncomeRecorded,
        totalCashIncomeRecorded,
        cashMovementsVolumeInPeriod,
        totalCommissionsPaid,
        commissionsPaidInPeriod,
      },
      activationFunnel: {
        stages: {
          registered: totalTenants,
          onboardingCompleted: totalTenants,
          configured: configuredCount,
          readyToBook: readyForBookingCount,
          firstBookingReceived: firstBookingCount,
          firstCompletedAppointment: firstCompletedCount,
          firstCashCollected: firstCashCount,
          continuousActivity: continuousActiveCount,
        },
        conversionRates: {
          registeredToConfigured: totalTenants > 0 ? Math.round((configuredCount / totalTenants) * 100) : 0,
          registeredToReady: totalTenants > 0 ? Math.round((readyForBookingCount / totalTenants) * 100) : 0,
          registeredToFirstBooking: totalTenants > 0 ? Math.round((firstBookingCount / totalTenants) * 100) : 0,
          registeredToFirstCash: totalTenants > 0 ? Math.round((firstCashCount / totalTenants) * 100) : 0,
          registeredToContinuous: totalTenants > 0 ? Math.round((continuousActiveCount / totalTenants) * 100) : 0,
        },
      },
      timeToValue,
      featureAdoption: adoptionRates,
    });
  } catch (error) {
    console.error("Error en GET /api/admin/overview:", error);
    return NextResponse.json(
      { ok: false, error: "SERVER_ERROR", message: "Error al generar overview administrativo." },
      { status: 500 }
    );
  }
}
