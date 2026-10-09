import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireTenantSession, isGuardError } from "@/lib/api-guard";
import { formatInTimeZone, fromZonedTime } from "date-fns-tz";
import { CashMovementType, AppointmentStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

const RANGE_DAYS = { hoy: 1, semana: 7, mes: 30, "90": 90 } as const;
type Range = keyof typeof RANGE_DAYS;

const DAY_NAMES: Record<string, string> = {
  Mon: "Lun",
  Tue: "Mar",
  Wed: "Mié",
  Thu: "Jue",
  Fri: "Vie",
  Sat: "Sáb",
  Sun: "Dom",
};

const DAY_MS = 24 * 60 * 60 * 1000;

function isAttended(status: AppointmentStatus) {
  return status === AppointmentStatus.CONFIRMED || status === AppointmentStatus.COMPLETED;
}

export async function GET(request: NextRequest) {
  try {
    const auth = await requireTenantSession(request, ["OWNER", "SUPERADMIN"]);
    if (isGuardError(auth)) return auth;

    const rawRange = request.nextUrl.searchParams.get("range") || "semana";
    const range: Range = rawRange in RANGE_DAYS ? (rawRange as Range) : "semana";

    const tenant = await prisma.tenant.findUnique({
      where: { id: auth.tenantId },
      select: { timezone: true },
    });
    const tz = tenant?.timezone || "America/Asuncion";

    const now = new Date();
    const todayStart = fromZonedTime(`${formatInTimeZone(now, tz, "yyyy-MM-dd")}T00:00:00`, tz);
    const periodStart = new Date(todayStart.getTime() - (RANGE_DAYS[range] - 1) * DAY_MS);
    const periodEnd = new Date(todayStart.getTime() + DAY_MS);
    const periodLength = periodEnd.getTime() - periodStart.getTime();
    const prevStart = new Date(periodStart.getTime() - periodLength);

    const allAppointments = await prisma.appointment.findMany({
      where: { tenantId: auth.tenantId },
      select: {
        clientId: true,
        clientPhone: true,
        startTime: true,
        status: true,
        service: { select: { price: true } },
      },
      orderBy: { startTime: "asc" },
    });

    const inRange = (d: Date, from: Date, to: Date) => d >= from && d < to;
    const appointments = allAppointments.filter((a) => inRange(a.startTime, periodStart, periodEnd));
    const prevAppointments = allAppointments.filter((a) => inRange(a.startTime, prevStart, periodStart));

    const attended = appointments.filter((a) => isAttended(a.status));
    const prevAttended = prevAppointments.filter((a) => isAttended(a.status));
    const cancelled = appointments.filter((a) => a.status === AppointmentStatus.CANCELLED).length;
    const noShows = appointments.filter((a) => a.status === AppointmentStatus.NO_SHOW).length;

    const revenueOf = (list: typeof appointments) => list.reduce((sum, a) => sum + (a.service?.price || 0), 0);
    const revenue = revenueOf(attended);
    const prevRevenue = revenueOf(prevAttended);
    const delta = (cur: number, prev: number) => (prev > 0 ? Math.round(((cur - prev) / prev) * 100) : null);

    const attendanceRate = appointments.length > 0 ? Math.round((attended.length / appointments.length) * 100) : null;
    const avgTicket = attended.length > 0 ? Math.round(revenue / attended.length) : 0;

    const clientKey = (a: { clientId: string | null; clientPhone: string }) => a.clientId || a.clientPhone;
    const periodClients = new Set(appointments.map(clientKey));

    // Retención: clientes del período que ya habían venido antes.
    const firstVisit = new Map<string, Date>();
    for (const a of allAppointments) {
      if (!isAttended(a.status)) continue;
      const k = clientKey(a);
      if (!firstVisit.has(k)) firstVisit.set(k, a.startTime);
    }
    const returning = [...periodClients].filter((k) => {
      const first = firstVisit.get(k);
      return first !== undefined && first < periodStart;
    }).length;
    const retentionRate = periodClients.size > 0 ? Math.round((returning / periodClients.size) * 100) : null;

    // Ciclo de retorno: días promedio entre visitas consecutivas del mismo cliente.
    const visitsByClient = new Map<string, number[]>();
    for (const a of allAppointments) {
      if (!isAttended(a.status)) continue;
      const k = clientKey(a);
      const list = visitsByClient.get(k) ?? [];
      list.push(a.startTime.getTime());
      visitsByClient.set(k, list);
    }
    let gapSum = 0;
    let gapCount = 0;
    for (const visits of visitsByClient.values()) {
      for (let i = 1; i < visits.length; i++) {
        gapSum += visits[i] - visits[i - 1];
        gapCount++;
      }
    }
    const returnCycleDays = gapCount > 0 ? Math.round(gapSum / gapCount / DAY_MS) : null;

    const lifetimeRevenue = revenueOf(allAppointments.filter((a) => isAttended(a.status)));
    const lifetimeValue = visitsByClient.size > 0 ? Math.round(lifetimeRevenue / visitsByClient.size) : 0;

    const cashMovements = await prisma.cashMovement.findMany({
      where: { tenantId: auth.tenantId, createdAt: { gte: periodStart, lt: periodEnd } },
      select: { type: true, amount: true, paymentMethod: true },
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
    const paymentMethodsData = Object.entries(methodCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    let areaData: { name: string; ingresos: number; turnos: number }[];
    if (range === "hoy") {
      const byHour = new Map<string, { ingresos: number; turnos: number }>();
      for (const a of attended) {
        const h = formatInTimeZone(a.startTime, tz, "HH:00");
        const cur = byHour.get(h) ?? { ingresos: 0, turnos: 0 };
        cur.turnos += 1;
        cur.ingresos += a.service?.price || 0;
        byHour.set(h, cur);
      }
      areaData = [...byHour.entries()]
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([name, d]) => ({ name, ...d }));
    } else {
      const days: Record<string, { ingresos: number; turnos: number }> = {};
      for (const name of Object.values(DAY_NAMES)) days[name] = { ingresos: 0, turnos: 0 };
      for (const a of attended) {
        const name = DAY_NAMES[formatInTimeZone(a.startTime, tz, "EEE")] || "Lun";
        days[name].turnos += 1;
        days[name].ingresos += a.service?.price || 0;
      }
      areaData = Object.entries(days).map(([name, d]) => ({ name, ...d }));
    }

    const hourCounts: Record<string, number> = {};
    for (const a of appointments) {
      const h = formatInTimeZone(a.startTime, tz, "HH:00");
      hourCounts[h] = (hourCounts[h] || 0) + 1;
    }
    const hourlyDistribution = Object.entries(hourCounts)
      .map(([hour, citas]) => ({ hour, citas }))
      .sort((a, b) => a.hour.localeCompare(b.hour));

    return NextResponse.json({
      ok: true,
      stats: {
        range,
        totalRevenue: revenue,
        revenueDelta: delta(revenue, prevRevenue),
        totalAppointments: appointments.length,
        appointmentsDelta: delta(appointments.length, prevAppointments.length),
        confirmedAppointments: attended.length,
        cancelledAppointments: cancelled,
        noShowAppointments: noShows,
        attendanceRate,
        avgTicket,
        totalIncome,
        totalExpense,
        cashBalance: totalIncome - totalExpense,
        totalClients: periodClients.size,
        retentionRate,
        returnCycleDays,
        lifetimeValue,
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
