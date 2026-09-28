import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireTenantSession, isGuardError } from "@/lib/api-guard";
import { CashMovementType } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const auth = await requireTenantSession(request, ["OWNER", "SUPERADMIN"]);
    if (isGuardError(auth)) return auth;

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const where: any = {
      tenantId: auth.tenantId,
    };

    if (startDate && endDate) {
      where.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    const movements = await prisma.cashMovement.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    const totalIncome = movements
      .filter((m) => m.type === CashMovementType.INCOME)
      .reduce((acc, m) => acc + m.amount, 0);

    const totalExpense = movements
      .filter((m) => m.type === CashMovementType.EXPENSE)
      .reduce((acc, m) => acc + m.amount, 0);

    return NextResponse.json({
      ok: true,
      data: {
        movements,
        summary: {
          totalIncome,
          totalExpense,
          netBalance: totalIncome - totalExpense,
          totalMovements: movements.length,
        },
      },
    });
  } catch (error) {
    console.error("Error en GET /api/reports/cash:", error);
    return NextResponse.json(
      { ok: false, error: "SERVER_ERROR", message: "Error al generar reporte de caja." },
      { status: 500 }
    );
  }
}
