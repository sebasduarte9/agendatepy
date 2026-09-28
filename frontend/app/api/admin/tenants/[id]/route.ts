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
