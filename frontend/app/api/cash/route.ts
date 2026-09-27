import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireTenantSession, isGuardError } from "@/lib/api-guard";
import { CashMovementType } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const auth = await requireTenantSession(request);
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
      method: m.paymentMethod.toLowerCase() as "efectivo" | "pos" | "transferencia",
      concept: m.description,
      date: m.createdAt.toISOString(),
      category: m.category,
      createdBy: m.createdBy,
    }));

    return NextResponse.json({ ok: true, movements: formatted });
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
    const auth = await requireTenantSession(request, ["OWNER", "SUPERADMIN", "STAFF"]);
    if (isGuardError(auth)) return auth;

    const body = await request.json();
    const { type, amount, method, concept, category } = body;

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

    const isIncome = type === "ingreso" || type === CashMovementType.INCOME;
    const movementType = isIncome ? CashMovementType.INCOME : CashMovementType.EXPENSE;

    const rawMethod = method || body.paymentMethod || "efectivo";
    const validMethods = ["efectivo", "pos", "transferencia", "billetera"];
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
      },
    });

    return NextResponse.json(
      {
        ok: true,
        movement: {
          id: created.id,
          type: created.type === CashMovementType.INCOME ? "ingreso" : "egreso",
          amount: created.amount,
          method: created.paymentMethod as any,
          concept: created.description,
          date: created.createdAt.toISOString(),
          category: created.category,
        },
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
