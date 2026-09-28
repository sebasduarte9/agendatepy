import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireTenantSession, isGuardError } from "@/lib/api-guard";
import { CashMovementType } from "@prisma/client";

export const dynamic = "force-dynamic";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function GET(request: NextRequest) {
  try {
    const auth = await requireTenantSession(request, ["OWNER", "SUPERADMIN"]);
    if (isGuardError(auth)) return auth;

    const movements = await prisma.cashMovement.findMany({
      where: { tenantId: auth.tenantId },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    const formatted = movements.map((m) => ({
      id: m.id,
      type: m.type === CashMovementType.INCOME ? ("ingreso" as const) : ("egreso" as const),
      amount: m.amount,
      method: m.paymentMethod.toLowerCase() as "efectivo" | "pos" | "transferencia" | "billetera",
      concept: m.description,
      date: m.createdAt.toISOString(),
      category: m.category,
      createdBy: m.createdBy,
      appointmentId: m.appointmentId,
    }));

    return NextResponse.json({ ok: true, movements: formatted, data: formatted });
  } catch (error) {
    console.error("Error en GET /api/cash:", error);
    return NextResponse.json(
      { ok: false, error: "DB_UNAVAILABLE", message: "Error al consultar movimientos de caja." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireTenantSession(request, ["OWNER", "SUPERADMIN"]);
    if (isGuardError(auth)) return auth;

    const body = await request.json();
    const { type, amount, method, concept, category, appointmentId } = body;

    const parsedAmount = Number(amount);
    if (Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      return NextResponse.json(
        { ok: false, error: "VALIDATION_ERROR", message: "El monto debe ser mayor a 0 Gs." },
        { status: 400 }
      );
    }

    const conceptText = concept || body.description;
    if (!conceptText || typeof conceptText !== "string" || conceptText.trim().length < 2) {
      return NextResponse.json(
        { ok: false, error: "VALIDATION_ERROR", message: "Concepto requerido." },
        { status: 400 }
      );
    }

    let validAppointmentId: string | null = null;
    if (appointmentId) {
      if (!UUID_REGEX.test(appointmentId)) {
        return NextResponse.json(
          { ok: false, error: "VALIDATION_ERROR", message: "ID de cita inválido." },
          { status: 400 }
        );
      }
      validAppointmentId = appointmentId;

      // Idempotency: verify this appointment hasn't been charged already
      const existing = await prisma.cashMovement.findFirst({
        where: {
          tenantId: auth.tenantId,
          appointmentId: validAppointmentId,
        },
      });

      if (existing) {
        return NextResponse.json(
          {
            ok: false,
            error: "ALREADY_CHARGED",
            message: "Esta cita ya fue registrada en caja anteriormente.",
            existingMovementId: existing.id,
          },
          { status: 409 }
        );
      }
    }

    const isIncome = type === "ingreso" || type === CashMovementType.INCOME;
    const movementType = isIncome ? CashMovementType.INCOME : CashMovementType.EXPENSE;

    const rawMethod = method || body.paymentMethod || "efectivo";
    const validMethods = ["efectivo", "pos", "transferencia", "billetera", "sipap"];
    const paymentMethod = validMethods.includes(String(rawMethod).toLowerCase())
      ? String(rawMethod).toLowerCase()
      : "efectivo";

    const created = await prisma.cashMovement.create({
      data: {
        tenantId: auth.tenantId,
        type: movementType,
        amount: Math.round(parsedAmount),
        category: category?.trim() || (isIncome ? "Venta" : "Gasto Operativo"),
        description: conceptText.trim(),
        paymentMethod,
        createdBy: auth.session.name || "Cajero",
        appointmentId: validAppointmentId,
      },
    });

    await prisma.platformEvent.create({
      data: {
        event: "CASH_MOVEMENT_CREATED",
        tenantId: auth.tenantId,
        entityType: "CashMovement",
        entityId: created.id,
        metadata: {
          type: created.type,
          amount: created.amount,
          category: created.category,
          hasAppointment: !!created.appointmentId,
        },
      },
    });

    const movementData = {
      id: created.id,
      type: created.type === CashMovementType.INCOME ? "ingreso" : "egreso",
      amount: created.amount,
      method: created.paymentMethod as any,
      concept: created.description,
      date: created.createdAt.toISOString(),
      category: created.category,
      appointmentId: created.appointmentId,
    };

    return NextResponse.json(
      {
        ok: true,
        movement: movementData,
        data: movementData,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error en POST /api/cash:", error);
    return NextResponse.json(
      { ok: false, error: "DB_UNAVAILABLE", message: "No se pudo registrar el movimiento de caja." },
      { status: 500 }
    );
  }
}
