import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireTenantSession, isGuardError } from "@/lib/api-guard";
import { formatInTimeZone } from "date-fns-tz";
import { CashMovementType, AppointmentStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const auth = await requireTenantSession(request, ["OWNER", "SUPERADMIN"]);
    if (isGuardError(auth)) return auth;

    const tenant = await prisma.tenant.findUnique({
      where: { id: auth.tenantId },
      select: { timezone: true },
    });
    const tz = tenant?.timezone || "America/Asuncion";

    // 1. Citas del tenant
    const appointments = await prisma.appointment.findMany({
      where: { tenantId: auth.tenantId },
      include: { service: { select: { price: true } } },
      orderBy: { startTime: "asc" },
    });

    const confirmedApps = appointments.filter(
      (a) => a.status === AppointmentStatus.CONFIRMED || a.status === AppointmentStatus.COMPLETED
    );
    const totalApps = appointments.length;
    const attendanceRate = totalApps > 0 ? Math.round((confirmedApps.length / totalApps) * 100) : 100;

    // Facturación confirmada en base a servicios
    const confirmedRevenue = confirmedApps.reduce((sum, a) => sum + (a.service?.price || 0), 0);
    const avgTicket = confirmedApps.length > 0 ? Math.round(confirmedRevenue / confirmedApps.length) : 0;

    // 2. Movimientos de caja
    const cashMovements = await prisma.cashMovement.findMany({
      where: { tenantId: auth.tenantId },
      orderBy: { createdAt: "asc" },
    });

    let totalIncome = 0;
    let totalExpense = 0;
    const methodCounts: Record<string, number> = {};

    for (const cm of cashMovements) {
      if (cm.type === CashMovementType.INCOME) {
        totalIncome += cm.amount;
        const m = cm.paymentMethod || "Efectivo";
        methodCounts[m] = (methodCounts[m] || 0) + cm.amount;
      } else {
        totalExpense += cm.amount;
      }
    }

    const cashBalance = totalIncome - totalExpense;

    // Métodos de pago reales (agrupación porcentual)
    const paymentMethodsData = Object.entries(methodCounts).map(([name, value]) => ({
      name,
      value,
    }));

    // 3. Distribución real por día de la semana (últimos 7 días o citas activas)
    const daysMap: Record<string, { ingresos: number; turnos: number }> = {
      Lun: { ingresos: 0, turnos: 0 },
      Mar: { ingresos: 0, turnos: 0 },
      Mié: { ingresos: 0, turnos: 0 },
      Jue: { ingresos: 0, turnos: 0 },
      Vie: { ingresos: 0, turnos: 0 },
      Sáb: { ingresos: 0, turnos: 0 },
      Dom: { ingresos: 0, turnos: 0 },
    };

    const dayNameMap: Record<string, string> = {
      Mon: "Lun",
      Tue: "Mar",
      Wed: "Mié",
      Thu: "Jue",
      Fri: "Vie",
      Sat: "Sáb",
      Sun: "Dom",
    };

    for (const app of confirmedApps) {
      const engDay = formatInTimeZone(app.startTime, tz, "EEE");
      const shortDay = dayNameMap[engDay] || "Lun";
      if (daysMap[shortDay]) {
        daysMap[shortDay].turnos += 1;
        daysMap[shortDay].ingresos += app.service?.price || 0;
      }
    }

    const areaData = Object.entries(daysMap).map(([name, data]) => ({
      name,
      ingresos: data.ingresos,
      turnos: data.turnos,
    }));

    // 4. Distribución horaria real
    const hourCounts: Record<string, number> = {};
    for (const app of appointments) {
      const hourStr = formatInTimeZone(app.startTime, tz, "HH:00");
      hourCounts[hourStr] = (hourCounts[hourStr] || 0) + 1;
    }

    const hourlyDistribution = Object.entries(hourCounts)
      .map(([hour, citas]) => ({ hour, citas }))
      .sort((a, b) => a.hour.localeCompare(b.hour));

    // 5. Total clientes únicos
    const totalClientsCount = await prisma.client.count({
      where: { tenantId: auth.tenantId },
    });

    return NextResponse.json({
      ok: true,
      stats: {
        totalRevenue: confirmedRevenue,
        totalAppointments: totalApps,
        confirmedAppointments: confirmedApps.length,
        attendanceRate,
        avgTicket,
        totalIncome,
        totalExpense,
        cashBalance,
        totalClients: totalClientsCount,
        areaData,
        paymentMethodsData,
        hourlyDistribution,
      },
    });
  } catch (error) {
    console.error("Error en GET /api/dashboard/stats:", error);
    return NextResponse.json(
      { ok: false, error: "DB_UNAVAILABLE", message: "Error al calcular estadísticas." },
      { status: 500 }
    );
  }
}
