import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireTenantSession, isGuardError, UUID_REGEX } from "@/lib/api-guard";
import { AppointmentStatus, CashMovementType, PayoutStatus, Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

const ALLOWED_PAYMENT_METHODS = ["Efectivo", "Tarjeta POS", "Transferencia", "Billetera"];

export async function GET(request: NextRequest) {
  try {
    const auth = await requireTenantSession(request);
    if (isGuardError(auth)) return auth;

    const { searchParams } = new URL(request.url);
    let requestedStaffId = searchParams.get("staffId") || undefined;

    // Control de roles: STAFF solo puede consultar sus propias liquidaciones
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

    if (requestedStaffId && !UUID_REGEX.test(requestedStaffId)) {
      return NextResponse.json(
        { ok: false, error: "VALIDATION_ERROR", message: "ID de colaborador inválido." },
        { status: 400 }
      );
    }

    const where: any = {
      tenantId: auth.tenantId,
    };

    if (requestedStaffId) {
      where.staffId = requestedStaffId;
    }

    const payouts = await prisma.commissionPayout.findMany({
      where,
      include: {
        staff: {
          select: { id: true, name: true, commissionPercentage: true },
        },
        cashMovement: {
          select: { id: true, amount: true, paymentMethod: true, createdAt: true },
        },
        _count: {
          select: { items: true },
        },
      },
      orderBy: { paidAt: "desc" },
    });

    return NextResponse.json({
      ok: true,
      payouts: payouts.map((p) => ({
        id: p.id,
        staffId: p.staffId,
        staffName: p.staff.name,
        periodStart: p.periodStart.toISOString(),
        periodEnd: p.periodEnd.toISOString(),
        grossCommission: p.grossCommission,
        amountPaid: p.amountPaid,
        paymentMethod: p.paymentMethod,
        cashMovementId: p.cashMovementId,
        status: p.status,
        paidAt: p.paidAt?.toISOString() || null,
        paidBy: p.paidBy,
        notes: p.notes,
        itemsCount: p._count.items,
        createdAt: p.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error("Error en GET /api/commission-payouts:", error);
    return NextResponse.json(
      { ok: false, error: "DB_UNAVAILABLE", message: "Error al consultar liquidaciones." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireTenantSession(request, ["OWNER", "SUPERADMIN"]);
    if (isGuardError(auth)) return auth;

    const body = await request.json();
    const { staffId, periodStart, periodEnd, paymentMethod, appointmentIds, notes } = body;

    if (!staffId || !UUID_REGEX.test(staffId)) {
      return NextResponse.json(
        { ok: false, error: "VALIDATION_ERROR", message: "ID de colaborador inválido." },
        { status: 400 }
      );
    }

    if (!periodStart || !periodEnd) {
      return NextResponse.json(
        { ok: false, error: "VALIDATION_ERROR", message: "Período de inicio y fin requerido." },
        { status: 400 }
      );
    }

    const startDate = new Date(periodStart);
    const endDate = new Date(periodEnd);

    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime()) || startDate > endDate) {
      return NextResponse.json(
        { ok: false, error: "VALIDATION_ERROR", message: "Rango de fechas de liquidación inválido." },
        { status: 400 }
      );
    }

    const method = (paymentMethod || "Efectivo").trim();
    if (!ALLOWED_PAYMENT_METHODS.includes(method)) {
      return NextResponse.json(
        { ok: false, error: "VALIDATION_ERROR", message: "Método de pago no válido." },
        { status: 400 }
      );
    }

    // Ejecución 100% atómica con transacción PostgreSQL
    const result = await prisma.$transaction(async (tx) => {
      // 1. Validar que el staff pertenezca al tenant
      const staff = await tx.staff.findFirst({
        where: { id: staffId, tenantId: auth.tenantId },
      });

      if (!staff) {
        throw new Error("STAFF_NOT_FOUND");
      }

      // 2. Consultar citas completadas para liquidar
      const aptWhere: any = {
        tenantId: auth.tenantId,
        staffId: staff.id,
        status: AppointmentStatus.COMPLETED,
        startTime: {
          gte: startDate,
          lte: endDate,
        },
      };

      if (Array.isArray(appointmentIds) && appointmentIds.length > 0) {
        aptWhere.id = { in: appointmentIds };
      }

      const appointments = await tx.appointment.findMany({
        where: aptWhere,
        include: {
          service: true,
          client: true,
        },
        orderBy: { startTime: "asc" },
      });

      if (appointments.length === 0) {
        throw new Error("NO_COMMISSIONS_TO_PAY");
      }

      const candidateIds = appointments.map((a) => a.id);

      // 3. Bloqueo de fila exclusivo a nivel de PostgreSQL para serializar concurrencia real
      if (candidateIds.length > 0) {
        await tx.$queryRaw`SELECT id FROM appointments WHERE id::text IN (${Prisma.join(candidateIds)}) FOR UPDATE`;
      }

      // 4. Protección contra doble pago / idempotencia
      const alreadyPaidItems = await tx.commissionPayoutItem.findMany({
        where: {
          appointmentId: { in: candidateIds },
          status: PayoutStatus.PAID,
        },
        select: { appointmentId: true },
      });

      const alreadyPaidSet = new Set(alreadyPaidItems.map((item) => item.appointmentId));

      // Si se enviaron IDs específicos y alguno ya fue pagado -> 409 Conflict
      if (Array.isArray(appointmentIds) && appointmentIds.length > 0) {
        const hasExplicitPaid = appointmentIds.some((id) => alreadyPaidSet.has(id));
        if (hasExplicitPaid) {
          throw new Error("ALREADY_PAID");
        }
      }

      // Períodos superpuestos: excluir citas ya liquidadas en pagos previos
      const unpaidAppointments = appointments.filter((a) => !alreadyPaidSet.has(a.id));
      if (unpaidAppointments.length === 0) {
        throw new Error("NO_COMMISSIONS_TO_PAY");
      }

      const unpaidCandidateIds = unpaidAppointments.map((a) => a.id);

      // 5. Consultar movimientos de cobro real (INCOME) vinculados a estas citas no liquidadas
      const cashMovements = await tx.cashMovement.findMany({
        where: {
          tenantId: auth.tenantId,
          type: CashMovementType.INCOME,
          appointmentId: { in: unpaidCandidateIds },
        },
      });

      const cashMap = new Map<string, number>();
      for (const cm of cashMovements) {
        if (!cm.appointmentId) continue;
        cashMap.set(cm.appointmentId, (cashMap.get(cm.appointmentId) || 0) + cm.amount);
      }

      // 6. Filtrar citas válidas (deben tener cobro > 0 y porcentaje > 0) y preparar snapshots
      const validItems: Array<{
        appointmentId: string;
        serviceName: string;
        clientName: string;
        appointmentDate: Date;
        chargedAmount: number;
        commissionPercentage: number;
        commissionAmount: number;
      }> = [];

      let totalCommission = 0;

      for (const a of unpaidAppointments) {
        const charged = cashMap.get(a.id) || 0;
        if (charged <= 0) continue; // Cita sin cobro no genera comisión

        const percentage = staff.commissionPercentage;
        if (percentage <= 0) continue; // Comisión 0% no genera comisión

        const commissionAmount = Math.round((charged * percentage) / 100);
        if (commissionAmount <= 0) continue;

        totalCommission += commissionAmount;

        validItems.push({
          appointmentId: a.id,
          serviceName: a.service?.name || "Servicio",
          clientName: a.client?.name || a.clientName || "Cliente",
          appointmentDate: a.startTime,
          chargedAmount: charged,
          commissionPercentage: percentage,
          commissionAmount: commissionAmount,
        });
      }

      if (validItems.length === 0 || totalCommission <= 0) {
        throw new Error("NO_COMMISSIONS_TO_PAY");
      }

      // 7. Crear egreso en Caja (EXPENSE)
      const cashMovement = await tx.cashMovement.create({
        data: {
          tenantId: auth.tenantId,
          type: CashMovementType.EXPENSE,
          amount: totalCommission,
          category: "Comisiones",
          description: `Pago de comisiones — ${staff.name}`,
          paymentMethod: method,
          createdBy: auth.session.name || auth.session.email,
        },
      });

      // 8. Crear registro de Liquidación y sus ítems de snapshot inmutables con status PAID
      const payout = await tx.commissionPayout.create({
        data: {
          tenantId: auth.tenantId,
          staffId: staff.id,
          periodStart: startDate,
          periodEnd: endDate,
          grossCommission: totalCommission,
          amountPaid: totalCommission,
          paymentMethod: method,
          cashMovementId: cashMovement.id,
          status: PayoutStatus.PAID,
          paidAt: new Date(),
          paidBy: auth.session.name || auth.session.email,
          notes: notes?.trim() || null,
          items: {
            create: validItems.map((item) => ({
              appointmentId: item.appointmentId,
              status: PayoutStatus.PAID,
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
          staff: {
            select: { id: true, name: true },
          },
          cashMovement: {
            select: { id: true, amount: true, paymentMethod: true },
          },
        },
      });

      return payout;
    });

    return NextResponse.json(
      {
        ok: true,
        payout: {
          id: result.id,
          staffId: result.staffId,
          staffName: result.staff.name,
          periodStart: result.periodStart.toISOString(),
          periodEnd: result.periodEnd.toISOString(),
          amountPaid: result.amountPaid,
          grossCommission: result.grossCommission,
          paymentMethod: result.paymentMethod,
          cashMovementId: result.cashMovementId,
          status: result.status,
          paidAt: result.paidAt?.toISOString(),
          paidBy: result.paidBy,
          itemsCount: result.items.length,
          items: result.items,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    if (
      error?.message === "ALREADY_PAID" ||
      error?.code === "P2002" ||
      error?.message?.includes("commission_payout_items_appointment_paid_unique")
    ) {
      return NextResponse.json(
        {
          ok: false,
          error: "ALREADY_PAID",
          message: "Uno o más turnos incluidos ya han sido liquidados y pagados previamente.",
        },
        { status: 409 }
      );
    }

    if (error?.message === "NO_COMMISSIONS_TO_PAY") {
      return NextResponse.json(
        {
          ok: false,
          error: "NO_COMMISSIONS_TO_PAY",
          message: "No se encontraron comisiones pendientes para liquidar en el período seleccionado.",
        },
        { status: 400 }
      );
    }

    if (error?.message === "STAFF_NOT_FOUND") {
      return NextResponse.json(
        { ok: false, error: "NOT_FOUND", message: "Colaborador no encontrado." },
        { status: 404 }
      );
    }

    console.error("Error en POST /api/commission-payouts:", error);
    return NextResponse.json(
      { ok: false, error: "DB_UNAVAILABLE", message: "Error al procesar la liquidación de comisiones." },
      { status: 500 }
    );
  }
}
