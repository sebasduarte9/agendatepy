import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireTenantSession, isGuardError, UUID_REGEX } from "@/lib/api-guard";
import { generateCSV } from "@/lib/csv-helper";
import { getCommissionDateRange, type CommissionPeriod } from "@/lib/commission-dates";
import { formatInTimeZone } from "date-fns-tz";
import { AppointmentStatus, CashMovementType, PayoutStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

const TIMEZONE = "America/Asuncion";

export async function GET(request: NextRequest) {
  try {
    const auth = await requireTenantSession(request);
    if (isGuardError(auth)) return auth;

    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "month";
    const startDateParam = searchParams.get("startDate");
    const endDateParam = searchParams.get("endDate");
    let requestedStaffId = searchParams.get("staffId") || undefined;
    const format = searchParams.get("format") || "json"; // "csv" | "json"

    // Control de roles estricto
    if (auth.session.role === "STAFF") {
      const user = await prisma.user.findUnique({
        where: { id: auth.session.id },
        select: { staffId: true },
      });

      if (!user?.staffId) {
        return NextResponse.json(
          { ok: false, error: "FORBIDDEN", message: "No tienes un perfil de colaborador asignado." },
          { status: 403 }
        );
      }

      if (requestedStaffId && requestedStaffId !== user.staffId) {
        return NextResponse.json(
          { ok: false, error: "FORBIDDEN", message: "Los colaboradores solo pueden consultar sus propias comisiones." },
          { status: 403 }
        );
      }

      requestedStaffId = user.staffId;
    }

    if (requestedStaffId && !UUID_REGEX.test(requestedStaffId)) {
      return NextResponse.json(
        { ok: false, error: "VALIDATION_ERROR", message: "ID de colaborador inválido." },
        { status: 400 }
      );
    }

    const dateRange = getCommissionDateRange(
      period as CommissionPeriod,
      startDateParam || undefined,
      endDateParam || undefined
    );

    const whereAppointments: any = {
      tenantId: auth.tenantId,
      status: AppointmentStatus.COMPLETED,
    };

    if (requestedStaffId) {
      whereAppointments.staffId = requestedStaffId;
    }

    if (dateRange.start && dateRange.end) {
      whereAppointments.startTime = {
        gte: dateRange.start,
        lte: dateRange.end,
      };
    }

    const appointments = await prisma.appointment.findMany({
      where: whereAppointments,
      include: {
        staff: { select: { id: true, name: true, commissionPercentage: true } },
        service: { select: { id: true, name: true, price: true } },
        client: { select: { id: true, name: true, phone: true } },
      },
      orderBy: { startTime: "asc" },
    });

    const appointmentIds = appointments.map((a) => a.id);

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
            },
          })
        : [];

    const cashMap = new Map<string, { total: number; methods: string[] }>();
    for (const cm of cashMovements) {
      if (!cm.appointmentId) continue;
      const current = cashMap.get(cm.appointmentId) || { total: 0, methods: [] };
      current.total += cm.amount;
      if (!current.methods.includes(cm.paymentMethod)) {
        current.methods.push(cm.paymentMethod);
      }
      cashMap.set(cm.appointmentId, current);
    }

    const paidPayoutItems =
      appointmentIds.length > 0
        ? await prisma.commissionPayoutItem.findMany({
            where: {
              appointmentId: { in: appointmentIds },
              status: PayoutStatus.PAID,
              payout: {
                tenantId: auth.tenantId,
              },
            },
            select: {
              appointmentId: true,
              payoutId: true,
              payout: {
                select: {
                  id: true,
                  paidAt: true,
                },
              },
            },
          })
        : [];

    const paidMap = new Map<string, { payoutId: string; paidAt: Date | null }>();
    for (const item of paidPayoutItems) {
      paidMap.set(item.appointmentId, {
        payoutId: item.payoutId,
        paidAt: item.payout?.paidAt || null,
      });
    }

    const items = [];
    let grossCommission = 0;
    let paidCommission = 0;
    let pendingCommission = 0;
    let totalCharged = 0;

    for (const a of appointments) {
      const cash = cashMap.get(a.id);
      if (!cash || cash.total <= 0) continue; // Solo turnos con ingreso real

      const percentage = a.staff.commissionPercentage;
      const commissionAmount = Math.round((cash.total * percentage) / 100);
      const paidInfo = paidMap.get(a.id);
      const isPaid = !!paidInfo;

      totalCharged += cash.total;
      grossCommission += commissionAmount;
      if (isPaid) {
        paidCommission += commissionAmount;
      } else {
        pendingCommission += commissionAmount;
      }

      items.push({
        appointmentId: a.id,
        appointmentDatePY: formatInTimeZone(a.startTime, TIMEZONE, "dd/MM/yyyy"),
        appointmentTimePY: formatInTimeZone(a.startTime, TIMEZONE, "HH:mm"),
        staffName: a.staff.name,
        clientName: a.client?.name || a.clientName || "Cliente",
        serviceName: a.service?.name || "Servicio",
        chargedAmount: cash.total,
        commissionPercentage: percentage,
        commissionAmount: commissionAmount,
        status: isPaid ? "Liquidada / Pagada" : "Pendiente",
        payoutId: paidInfo?.payoutId || "",
        paidAtPY: paidInfo?.paidAt ? formatInTimeZone(paidInfo.paidAt, TIMEZONE, "dd/MM/yyyy HH:mm") : "",
      });
    }

    if (format === "csv") {
      const headers = [
        "Fecha Turno",
        "Hora",
        "Profesional",
        "Cliente",
        "Servicio",
        "Cobrado en Caja (Gs.)",
        "% Comisión",
        "Comisión (Gs.)",
        "Estado",
        "ID Cita",
        "ID Liquidación",
        "Fecha de Pago",
      ];

      const rows = items.map((i) => [
        i.appointmentDatePY,
        i.appointmentTimePY,
        i.staffName,
        i.clientName,
        i.serviceName,
        i.chargedAmount,
        i.commissionPercentage,
        i.commissionAmount,
        i.status,
        i.appointmentId,
        i.payoutId,
        i.paidAtPY,
      ]);

      const csvContent = generateCSV(headers, rows);
      const staffSuffix = requestedStaffId ? `-colaborador` : "";
      const filename = `agendatepy-comisiones${staffSuffix}-${formatInTimeZone(new Date(), TIMEZONE, "yyyy-MM-dd")}.csv`;

      return new NextResponse(csvContent, {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="${filename}"`,
        },
      });
    }

    return NextResponse.json({
      ok: true,
      timezone: TIMEZONE,
      period,
      summary: {
        totalCharged,
        grossCommission,
        paidCommission,
        pendingCommission,
        servicesCount: items.length,
      },
      count: items.length,
      items,
    });
  } catch (error) {
    console.error("Error en GET /api/reports/commissions:", error);
    return NextResponse.json(
      { ok: false, error: "DB_UNAVAILABLE", message: "Error al generar reporte de comisiones." },
      { status: 500 }
    );
  }
}
