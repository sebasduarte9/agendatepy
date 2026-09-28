import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireTenantSession, isGuardError, UUID_REGEX } from "@/lib/api-guard";
import { AppointmentStatus, CashMovementType, PayoutStatus } from "@prisma/client";
import {
  COMMISSION_TZ,
  getCommissionDateRange,
  type CommissionPeriod,
} from "@/lib/commission-dates";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const auth = await requireTenantSession(request);
    if (isGuardError(auth)) return auth;

    const { searchParams } = new URL(request.url);
    let requestedStaffId = searchParams.get("staffId") || undefined;
    const rawPeriod = searchParams.get("period") || "all";
    const startDateParam = searchParams.get("startDate") || searchParams.get("from");
    const endDateParam = searchParams.get("endDate") || searchParams.get("to");

    // Seguridad de Roles: STAFF solo puede ver sus propias comisiones
    if (auth.session.role === "STAFF") {
      const user = await prisma.user.findUnique({
        where: { id: auth.session.id },
        select: { staffId: true },
      });

      if (!user?.staffId) {
        return NextResponse.json(
          {
            ok: false,
            error: "FORBIDDEN",
            message: "No tienes un perfil de colaborador asignado.",
          },
          { status: 403 }
        );
      }

      if (requestedStaffId && requestedStaffId !== user.staffId) {
        return NextResponse.json(
          {
            ok: false,
            error: "FORBIDDEN",
            message: "Los colaboradores solo pueden consultar sus propias comisiones.",
          },
          { status: 403 }
        );
      }

      // Forzar al ID del propio staff
      requestedStaffId = user.staffId;
    }

    if (requestedStaffId && !UUID_REGEX.test(requestedStaffId)) {
      return NextResponse.json(
        { ok: false, error: "VALIDATION_ERROR", message: "ID de colaborador inválido." },
        { status: 400 }
      );
    }

    // Normalización de período
    let period: CommissionPeriod = "all";
    const lowerPeriod = rawPeriod.toLowerCase();
    if (lowerPeriod === "today" || lowerPeriod === "hoy") period = "today";
    else if (lowerPeriod === "week" || lowerPeriod === "esta semana" || lowerPeriod === "esta_semana") period = "week";
    else if (lowerPeriod === "month" || lowerPeriod === "este mes" || lowerPeriod === "este_mes") period = "month";
    else if (lowerPeriod === "custom" || lowerPeriod === "personalizado") period = "custom";
    else if (lowerPeriod === "all" || lowerPeriod === "todos" || lowerPeriod === "todo") period = "all";

    const { start: startTimeGte, end: startTimeLte } = getCommissionDateRange(
      period,
      startDateParam,
      endDateParam
    );

    // Consulta única de appointments COMPLETED del tenant
    const appointmentWhere: any = {
      tenantId: auth.tenantId,
      status: AppointmentStatus.COMPLETED,
    };

    if (requestedStaffId) {
      appointmentWhere.staffId = requestedStaffId;
    }

    if (startTimeGte || startTimeLte) {
      appointmentWhere.startTime = {};
      if (startTimeGte) appointmentWhere.startTime.gte = startTimeGte;
      if (startTimeLte) appointmentWhere.startTime.lte = startTimeLte;
    }

    const appointments = await prisma.appointment.findMany({
      where: appointmentWhere,
      include: {
        staff: {
          select: {
            id: true,
            name: true,
            commissionPercentage: true,
            active: true,
          },
        },
        service: {
          select: {
            id: true,
            name: true,
            price: true,
          },
        },
        client: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
      },
      orderBy: { startTime: "desc" },
    });

    const appointmentIds = appointments.map((a) => a.id);

    // Consulta agrupada de CashMovements (solo ingresos vinculados a estas citas)
    const cashMovements =
      appointmentIds.length > 0
        ? await prisma.cashMovement.findMany({
            where: {
              tenantId: auth.tenantId,
              type: CashMovementType.INCOME,
              appointmentId: { in: appointmentIds },
            },
            select: {
              id: true,
              appointmentId: true,
              amount: true,
              paymentMethod: true,
              createdAt: true,
            },
          })
        : [];

    // Consulta de liquidaciones ya pagadas vinculadas a estas citas
    const paidPayoutItems =
      appointmentIds.length > 0
        ? await prisma.commissionPayoutItem.findMany({
            where: {
              appointmentId: { in: appointmentIds },
              payout: {
                tenantId: auth.tenantId,
                status: PayoutStatus.PAID,
              },
            },
            select: {
              appointmentId: true,
              payoutId: true,
              payout: {
                select: {
                  id: true,
                  paidAt: true,
                  paymentMethod: true,
                },
              },
            },
          })
        : [];

    const paidMap = new Map<
      string,
      { payoutId: string; paidAt: string; paymentMethod: string }
    >();

    for (const p of paidPayoutItems) {
      paidMap.set(p.appointmentId, {
        payoutId: p.payoutId,
        paidAt: p.payout.paidAt ? p.payout.paidAt.toISOString() : "",
        paymentMethod: p.payout.paymentMethod,
      });
    }

    // Agrupación determinista de cobros por cita (acumula split payments)
    const cashByAppointment = new Map<
      string,
      { totalAmount: number; methods: Set<string> }
    >();

    for (const cm of cashMovements) {
      if (!cm.appointmentId) continue;
      const existing = cashByAppointment.get(cm.appointmentId) || {
        totalAmount: 0,
        methods: new Set<string>(),
      };
      existing.totalAmount += cm.amount;
      if (cm.paymentMethod) existing.methods.add(cm.paymentMethod);
      cashByAppointment.set(cm.appointmentId, existing);
    }

    // Construcción de ítems de comisión y métricas
    const items: Array<{
      appointmentId: string;
      date: string;
      staffId: string;
      staffName: string;
      clientId: string | null;
      clientName: string;
      serviceId: string;
      serviceName: string;
      servicePrice: number;
      chargedAmount: number;
      commissionPercentage: number;
      commissionAmount: number;
      paymentMethods: string;
      isPaid: boolean;
      payoutId: string | null;
      paidAt: string | null;
    }> = [];

    const staffMap = new Map<
      string,
      {
        staffId: string;
        staffName: string;
        commissionPercentage: number;
        servicesCount: number;
        totalCharged: number;
        totalCommission: number;
        paidCommission: number;
        pendingCommission: number;
      }
    >();

    for (const apt of appointments) {
      const cashEntry = cashByAppointment.get(apt.id);
      const chargedAmount = cashEntry?.totalAmount || 0;

      // Regla de Negocio: Citas sin cobro no generan comisión
      if (chargedAmount <= 0) continue;

      const commissionPercentage = apt.staff?.commissionPercentage ?? 0;
      const commissionAmount = Math.round((chargedAmount * commissionPercentage) / 100);

      const paidInfo = paidMap.get(apt.id);
      const isPaid = Boolean(paidInfo);

      items.push({
        appointmentId: apt.id,
        date: apt.startTime.toISOString(),
        staffId: apt.staffId,
        staffName: apt.staff?.name || "Sin asignar",
        clientId: apt.clientId,
        clientName: apt.client?.name || apt.clientName || "Cliente",
        serviceId: apt.serviceId,
        serviceName: apt.service?.name || "Servicio",
        servicePrice: apt.service?.price ?? 0,
        chargedAmount,
        commissionPercentage,
        commissionAmount,
        paymentMethods: Array.from(cashEntry?.methods || ["Efectivo"]).join(", "),
        isPaid,
        payoutId: paidInfo?.payoutId || null,
        paidAt: paidInfo?.paidAt || null,
      });

      // Acumulador por staff
      const staffSummary = staffMap.get(apt.staffId) || {
        staffId: apt.staffId,
        staffName: apt.staff?.name || "Sin asignar",
        commissionPercentage,
        servicesCount: 0,
        totalCharged: 0,
        totalCommission: 0,
        paidCommission: 0,
        pendingCommission: 0,
      };

      staffSummary.servicesCount += 1;
      staffSummary.totalCharged += chargedAmount;
      staffSummary.totalCommission += commissionAmount;
      if (isPaid) {
        staffSummary.paidCommission += commissionAmount;
      } else {
        staffSummary.pendingCommission += commissionAmount;
      }
      staffMap.set(apt.staffId, staffSummary);
    }

    const totalCharged = items.reduce((sum, item) => sum + item.chargedAmount, 0);
    const grossCommission = items.reduce((sum, item) => sum + item.commissionAmount, 0);
    const paidCommission = items.filter((i) => i.isPaid).reduce((sum, i) => sum + i.commissionAmount, 0);
    const pendingCommission = grossCommission - paidCommission;
    const pendingServicesCount = items.filter((i) => !i.isPaid).length;

    return NextResponse.json({
      ok: true,
      summary: {
        totalCharged,
        commissionableBase: totalCharged,
        totalCommission: grossCommission,
        grossCommission,
        paidCommission,
        pendingCommission,
        completedServicesCount: items.length,
        pendingServicesCount,
      },
      items,
      byStaff: Array.from(staffMap.values()),
      period,
      timezone: COMMISSION_TZ,
    });
  } catch (error) {
    console.error("Error en GET /api/commissions:", error);
    return NextResponse.json(
      { ok: false, error: "DB_UNAVAILABLE", message: "Error al calcular comisiones." },
      { status: 500 }
    );
  }
}
