import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireTenantSession, isGuardError } from "@/lib/api-guard";
import { generateCSV } from "@/lib/csv-helper";
import { getCommissionDateRange, type CommissionPeriod } from "@/lib/commission-dates";
import { formatInTimeZone } from "date-fns-tz";
import { CashMovementType } from "@prisma/client";

export const dynamic = "force-dynamic";

const TIMEZONE = "America/Asuncion";

export async function GET(request: NextRequest) {
  try {
    const auth = await requireTenantSession(request, ["OWNER", "SUPERADMIN"]);
    if (isGuardError(auth)) return auth;

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "movements"; // "movements" | "closures"
    const period = searchParams.get("period") || "month";
    const startDateParam = searchParams.get("startDate");
    const endDateParam = searchParams.get("endDate");
    const format = searchParams.get("format") || "json"; // "csv" | "json"

    const dateRange = getCommissionDateRange(
      period as CommissionPeriod,
      startDateParam || undefined,
      endDateParam || undefined
    );

    if (type === "closures") {
      const where: any = {
        tenantId: auth.tenantId,
      };

      if (dateRange.start && dateRange.end) {
        where.closedAt = {
          gte: dateRange.start,
          lte: dateRange.end,
        };
      }

      const closures = await prisma.cashRegisterClose.findMany({
        where,
        orderBy: { closedAt: "desc" },
      });

      const formattedClosures = closures.map((c) => ({
        id: c.id,
        closedAtIso: c.closedAt.toISOString(),
        closedDatePY: formatInTimeZone(c.closedAt, TIMEZONE, "dd/MM/yyyy"),
        closedTimePY: formatInTimeZone(c.closedAt, TIMEZONE, "HH:mm"),
        openedDatePY: formatInTimeZone(c.openedAt, TIMEZONE, "dd/MM/yyyy HH:mm"),
        openingCash: c.openingCash,
        expectedCash: c.expectedCash,
        countedCash: c.countedCash,
        difference: c.difference,
        closedBy: c.closedBy,
        notes: c.notes || "",
      }));

      if (format === "csv") {
        const headers = [
          "Fecha Cierre",
          "Hora Cierre",
          "Fecha Apertura",
          "Saldo Inicial (Gs.)",
          "Saldo Esperado (Gs.)",
          "Efectivo Contado (Gs.)",
          "Diferencia (Gs.)",
          "Responsable",
          "Observaciones / Arqueo",
        ];

        const rows = formattedClosures.map((c) => [
          c.closedDatePY,
          c.closedTimePY,
          c.openedDatePY,
          c.openingCash,
          c.expectedCash,
          c.countedCash,
          c.difference,
          c.closedBy,
          c.notes,
        ]);

        const csvContent = generateCSV(headers, rows);
        const filename = `agendatepy-cierres-caja-${formatInTimeZone(new Date(), TIMEZONE, "yyyy-MM-dd")}.csv`;

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
        type: "closures",
        count: formattedClosures.length,
        data: formattedClosures,
      });
    }

    // Default: Movimientos de caja
    const where: any = {
      tenantId: auth.tenantId,
    };

    if (dateRange.start && dateRange.end) {
      where.createdAt = {
        gte: dateRange.start,
        lte: dateRange.end,
      };
    }

    const movements = await prisma.cashMovement.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    const formattedMovements = movements.map((m) => ({
      id: m.id,
      dateIso: m.createdAt.toISOString(),
      datePY: formatInTimeZone(m.createdAt, TIMEZONE, "dd/MM/yyyy"),
      timePY: formatInTimeZone(m.createdAt, TIMEZONE, "HH:mm"),
      type: m.type === CashMovementType.INCOME ? "Ingreso" : "Egreso",
      category: m.category,
      description: m.description,
      paymentMethod: m.paymentMethod,
      amount: m.amount,
      appointmentId: m.appointmentId || "",
      createdBy: m.createdBy || "",
    }));

    if (format === "csv") {
      const headers = [
        "Fecha",
        "Hora",
        "Tipo",
        "Categoría",
        "Descripción",
        "Método de Pago",
        "Monto (Gs.)",
        "Cita ID",
        "Registrado Por",
      ];

      const rows = formattedMovements.map((m) => [
        m.datePY,
        m.timePY,
        m.type,
        m.category,
        m.description,
        m.paymentMethod,
        m.amount,
        m.appointmentId,
        m.createdBy,
      ]);

      const csvContent = generateCSV(headers, rows);
      const filename = `agendatepy-caja-movimientos-${formatInTimeZone(new Date(), TIMEZONE, "yyyy-MM-dd")}.csv`;

      return new NextResponse(csvContent, {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="${filename}"`,
        },
      });
    }

    const totalIncome = movements
      .filter((m) => m.type === CashMovementType.INCOME)
      .reduce((s, m) => s + m.amount, 0);
    const totalExpense = movements
      .filter((m) => m.type === CashMovementType.EXPENSE)
      .reduce((s, m) => s + m.amount, 0);
    const net = totalIncome - totalExpense;

    return NextResponse.json({
      ok: true,
      type: "movements",
      count: formattedMovements.length,
      summary: {
        totalIncome,
        totalExpense,
        net,
      },
      data: formattedMovements,
    });
  } catch (error) {
    console.error("Error en GET /api/reports/cash:", error);
    return NextResponse.json(
      { ok: false, error: "DB_UNAVAILABLE", message: "Error al generar reporte de caja." },
      { status: 500 }
    );
  }
}
