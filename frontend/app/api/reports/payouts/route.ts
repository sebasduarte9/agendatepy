import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireTenantSession, isGuardError, UUID_REGEX } from "@/lib/api-guard";
import { generateCSV } from "@/lib/csv-helper";
import { formatInTimeZone } from "date-fns-tz";

export const dynamic = "force-dynamic";

const TIMEZONE = "America/Asuncion";

export async function GET(request: NextRequest) {
  try {
    const auth = await requireTenantSession(request);
    if (isGuardError(auth)) return auth;

    const { searchParams } = new URL(request.url);
    const payoutId = searchParams.get("payoutId");
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
          { ok: false, error: "FORBIDDEN", message: "Los colaboradores solo pueden consultar sus propias liquidaciones." },
          { status: 403 }
        );
      }

      requestedStaffId = user.staffId;
    }

    if (payoutId) {
      if (!UUID_REGEX.test(payoutId)) {
        return NextResponse.json(
          { ok: false, error: "VALIDATION_ERROR", message: "ID de liquidación inválido." },
          { status: 400 }
        );
      }

      const payout = await prisma.commissionPayout.findFirst({
        where: { id: payoutId, tenantId: auth.tenantId },
        include: {
          staff: { select: { id: true, name: true } },
          items: { orderBy: { appointmentDate: "asc" } },
        },
      });

      if (!payout) {
        return NextResponse.json(
          { ok: false, error: "NOT_FOUND", message: "Liquidación no encontrada." },
          { status: 404 }
        );
      }

      // Validación de pertenencia para STAFF
      if (auth.session.role === "STAFF" && payout.staffId !== requestedStaffId) {
        return NextResponse.json(
          { ok: false, error: "FORBIDDEN", message: "No tienes permiso para ver esta liquidación." },
          { status: 403 }
        );
      }

      const formattedItems = payout.items.map((i) => ({
        id: i.id,
        appointmentId: i.appointmentId,
        datePY: formatInTimeZone(i.appointmentDate, TIMEZONE, "dd/MM/yyyy HH:mm"),
        staffName: payout.staff.name,
        clientName: i.clientName,
        serviceName: i.serviceName,
        chargedAmount: i.chargedAmount,
        commissionPercentage: i.commissionPercentage,
        commissionAmount: i.commissionAmount,
      }));

      if (format === "csv") {
        const headers = [
          "Fecha y Hora Turno",
          "Profesional",
          "Cliente",
          "Servicio",
          "Cobrado en Caja (Gs.)",
          "% Comisión (Snapshot)",
          "Comisión Pagada (Gs.)",
          "ID Cita",
        ];

        const rows = formattedItems.map((i) => [
          i.datePY,
          i.staffName,
          i.clientName,
          i.serviceName,
          i.chargedAmount,
          i.commissionPercentage,
          i.commissionAmount,
          i.appointmentId,
        ]);

        const csvContent = generateCSV(headers, rows);
        const filename = `agendatepy-recibo-${payout.staff.name.toLowerCase().replace(/\s+/g, "-")}-${payout.id.slice(0, 8)}.csv`;

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
        payoutId: payout.id,
        payout: {
          id: payout.id,
          staffId: payout.staffId,
          staffName: payout.staff.name,
          amountPaid: payout.amountPaid,
          grossCommission: payout.grossCommission,
          periodStart: payout.periodStart,
          periodEnd: payout.periodEnd,
          paymentMethod: payout.paymentMethod,
          paidAt: payout.paidAt,
          status: payout.status,
          notes: payout.notes,
        },
        staffName: payout.staff.name,
        amountPaid: payout.amountPaid,
        itemsCount: formattedItems.length,
        items: formattedItems,
      });
    }

    // Listado de liquidaciones
    const where: any = {
      tenantId: auth.tenantId,
    };

    if (requestedStaffId) {
      where.staffId = requestedStaffId;
    }

    const payouts = await prisma.commissionPayout.findMany({
      where,
      include: {
        staff: { select: { id: true, name: true } },
        _count: { select: { items: true } },
      },
      orderBy: { paidAt: "desc" },
    });

    const formattedPayouts = payouts.map((p) => ({
      id: p.id,
      paidAtPY: p.paidAt ? formatInTimeZone(p.paidAt, TIMEZONE, "dd/MM/yyyy HH:mm") : "",
      staffName: p.staff.name,
      periodStartPY: formatInTimeZone(p.periodStart, TIMEZONE, "dd/MM/yyyy"),
      periodEndPY: formatInTimeZone(p.periodEnd, TIMEZONE, "dd/MM/yyyy"),
      itemsCount: p._count.items,
      amountPaid: p.amountPaid,
      paymentMethod: p.paymentMethod,
      status: p.status,
      paidBy: p.paidBy || "",
      cashMovementId: p.cashMovementId || "",
      notes: p.notes || "",
    }));

    if (format === "csv") {
      const headers = [
        "Fecha de Pago",
        "Profesional",
        "Período Desde",
        "Período Hasta",
        "Citas Incluidas",
        "Monto Pagado (Gs.)",
        "Método de Pago",
        "Estado",
        "Liquidado Por",
        "ID Egreso Caja",
        "Observaciones",
        "ID Liquidación",
      ];

      const rows = formattedPayouts.map((p) => [
        p.paidAtPY,
        p.staffName,
        p.periodStartPY,
        p.periodEndPY,
        p.itemsCount,
        p.amountPaid,
        p.paymentMethod,
        p.status,
        p.paidBy,
        p.cashMovementId,
        p.notes,
        p.id,
      ]);

      const csvContent = generateCSV(headers, rows);
      const filename = `agendatepy-liquidaciones-${formatInTimeZone(new Date(), TIMEZONE, "yyyy-MM-dd")}.csv`;

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
      count: formattedPayouts.length,
      payouts: formattedPayouts,
    });
  } catch (error) {
    console.error("Error en GET /api/reports/payouts:", error);
    return NextResponse.json(
      { ok: false, error: "DB_UNAVAILABLE", message: "Error al generar reporte de liquidaciones." },
      { status: 500 }
    );
  }
}
