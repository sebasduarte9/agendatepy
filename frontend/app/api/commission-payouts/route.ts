import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireTenantSession, isGuardError, UUID_REGEX } from "@/lib/api-guard";
import { AppointmentStatus, CashMovementType, PayoutStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const auth = await requireTenantSession(request);
    if (isGuardError(auth)) return auth;

    const { searchParams } = new URL(request.url);
    const staffId = searchParams.get("staffId");
    const status = searchParams.get("status");

    const where: any = {
      tenantId: auth.tenantId,
    };

    if (auth.session.role === "STAFF") {
      const user = await prisma.user.findUnique({
        where: { id: auth.session.id },
        select: { staffId: true },
      });
      if (!user?.staffId) {
        return NextResponse.json({ ok: true, payouts: [], data: [] });
      }
      where.staffId = user.staffId;
    } else if (staffId && UUID_REGEX.test(staffId)) {
      where.staffId = staffId;
    }

    if (status) {
      where.status = status;
    }

    const payouts = await prisma.commissionPayout.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        staff: {
          select: { id: true, name: true, commissionPercentage: true },
        },
        items: true,
      },
    });

    return NextResponse.json({
      ok: true,
      payouts,
      data: payouts,
    });
  } catch (error) {
    console.error("Error en GET /api/commission-payouts:", error);
    return NextResponse.json(
      { ok: false, error: "SERVER_ERROR", message: "Error al listar liquidaciones." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireTenantSession(request, ["OWNER", "SUPERADMIN"]);
    if (isGuardError(auth)) return auth;

    const body = await request.json();
    const { staffId, periodStart, periodEnd, paymentMethod = "Efectivo", appointmentIds, notes } = body;

    if (!staffId || !UUID_REGEX.test(staffId)) {
      return NextResponse.json(
        { ok: false, error: "VALIDATION_ERROR", message: "ID de profesional inválido." },
        { status: 400 }
      );
    }

    const staff = await prisma.staff.findFirst({
      where: { id: staffId, tenantId: auth.tenantId },
    });

    if (!staff) {
      return NextResponse.json(
        { ok: false, error: "NOT_FOUND", message: "Profesional no encontrado en este negocio." },
        { status: 404 }
      );
    }

    // Buscar citas completadas con cobros reales en caja
    const appWhere: any = {
      tenantId: auth.tenantId,
      staffId,
      status: AppointmentStatus.COMPLETED,
    };

    if (Array.isArray(appointmentIds) && appointmentIds.length > 0) {
      appWhere.id = { in: appointmentIds };
    }

    if (periodStart && periodEnd) {
      appWhere.startTime = {
        gte: new Date(periodStart),
        lte: new Date(periodEnd),
      };
    }

    const appointments = await prisma.appointment.findMany({
      where: appWhere,
      include: {
        service: { select: { name: true, price: true } },
        client: { select: { name: true } },
      },
    });

    if (appointments.length === 0) {
      return NextResponse.json(
        { ok: false, error: "NO_COMMISSIONS_TO_PAY", message: "No existen citas completadas para liquidar." },
        { status: 400 }
      );
    }

    const appIds = appointments.map((a) => a.id);

    // Verificar si alguna cita ya fue liquidada previamente
    const alreadyPaidItems = await prisma.commissionPayoutItem.findMany({
      where: {
        appointmentId: { in: appIds },
        payout: {
          tenantId: auth.tenantId,
          status: PayoutStatus.PAID,
        },
      },
      select: { appointmentId: true },
    });

    const alreadyPaidSet = new Set(alreadyPaidItems.map((i) => i.appointmentId));
    const eligibleApps = appointments.filter((a) => !alreadyPaidSet.has(a.id));

    if (eligibleApps.length === 0) {
      if (alreadyPaidItems.length > 0) {
        return NextResponse.json(
          { ok: false, error: "ALREADY_PAID", message: "Todas las citas seleccionadas ya fueron liquidadas anteriormente." },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { ok: false, error: "NO_COMMISSIONS_TO_PAY", message: "No existen comisiones pendientes para liquidar." },
        { status: 400 }
      );
    }

    // Obtener movimientos de caja tipo INCOME asociados a estas citas
    const cashMovements = await prisma.cashMovement.findMany({
      where: {
        tenantId: auth.tenantId,
        appointmentId: { in: eligibleApps.map((a) => a.id) },
        type: CashMovementType.INCOME,
      },
      select: { appointmentId: true, amount: true },
    });

    const cashMap = new Map<string, number>();
    cashMovements.forEach((cm) => {
      if (cm.appointmentId) {
        const current = cashMap.get(cm.appointmentId) || 0;
        cashMap.set(cm.appointmentId, current + cm.amount);
      }
    });

    // Validar que haya al menos una cita con cobro real
    const appsWithCash = eligibleApps.filter((a) => (cashMap.get(a.id) || 0) > 0);

    if (appsWithCash.length === 0) {
      return NextResponse.json(
        { ok: false, error: "NO_COMMISSIONS_TO_PAY", message: "Ninguna de las citas tiene cobros registrados en caja." },
        { status: 400 }
      );
    }

    // Calcular montos de cada ítem
    const payoutItemsData: Array<{
      appointmentId: string;
      serviceName: string;
      clientName: string;
      appointmentDate: Date;
      chargedAmount: number;
      commissionPercentage: number;
      commissionAmount: number;
    }> = [];

    let totalGrossCommission = 0;

    appsWithCash.forEach((app) => {
      const charged = cashMap.get(app.id) || 0;
      const pct = staff.commissionPercentage || 50;
      const commAmount = Math.round((charged * pct) / 100);

      totalGrossCommission += commAmount;

      payoutItemsData.push({
        appointmentId: app.id,
        serviceName: app.service.name,
        clientName: app.client?.name || app.clientName || "Cliente",
        appointmentDate: app.startTime,
        chargedAmount: charged,
        commissionPercentage: pct,
        commissionAmount: commAmount,
      });
    });

    if (totalGrossCommission <= 0) {
      return NextResponse.json(
        { ok: false, error: "NO_COMMISSIONS_TO_PAY", message: "El monto total a liquidar es 0." },
        { status: 400 }
      );
    }

    // Crear la liquidación de forma atómica en transacción
    const startRange = periodStart ? new Date(periodStart) : appsWithCash[0].startTime;
    const endRange = periodEnd ? new Date(periodEnd) : appsWithCash[appsWithCash.length - 1].startTime;

    const result = await prisma.$transaction(async (tx) => {
      // 1. Crear movimiento de egreso en caja
      const cashExpense = await tx.cashMovement.create({
        data: {
          tenantId: auth.tenantId,
          type: CashMovementType.EXPENSE,
          amount: totalGrossCommission,
          category: "Comisiones",
          description: `Liquidación de comisiones a ${staff.name}`,
          paymentMethod,
          createdBy: auth.session.email,
        },
      });

      // 2. Crear CommissionPayout
      const payout = await tx.commissionPayout.create({
        data: {
          tenantId: auth.tenantId,
          staffId: staff.id,
          periodStart: startRange,
          periodEnd: endRange,
          grossCommission: totalGrossCommission,
          amountPaid: totalGrossCommission,
          paymentMethod,
          cashMovementId: cashExpense.id,
          status: PayoutStatus.PAID,
          paidAt: new Date(),
          paidBy: auth.session.email,
          notes: notes || null,
          items: {
            create: payoutItemsData.map((item) => ({
              appointmentId: item.appointmentId,
              serviceName: item.serviceName,
              clientName: item.clientName,
              appointmentDate: item.appointmentDate,
              chargedAmount: item.chargedAmount,
              commissionPercentage: item.commissionPercentage,
              commissionAmount: item.commissionAmount,
            })),
          },
        },
        include: {
          items: true,
          staff: { select: { id: true, name: true, commissionPercentage: true } },
          cashMovement: true,
        },
      });

      await tx.platformEvent.create({
        data: {
          event: "COMMISSION_PAYOUT_CREATED",
          tenantId: auth.tenantId,
          entityType: "CommissionPayout",
          entityId: payout.id,
          metadata: {
            staffId: staff.id,
            amountPaid: payout.amountPaid,
            itemsCount: payoutItemsData.length,
          },
        },
      });

      return payout;
    });

    return NextResponse.json(
      {
        ok: true,
        payout: result,
        data: result,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error en POST /api/commission-payouts:", error);
    return NextResponse.json(
      { ok: false, error: "SERVER_ERROR", message: "Error al procesar liquidación." },
      { status: 500 }
    );
  }
}
