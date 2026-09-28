import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireTenantSession, isGuardError } from "@/lib/api-guard";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const auth = await requireTenantSession(request, ["OWNER", "SUPERADMIN"]);
    if (isGuardError(auth)) return auth;

    const closures = await prisma.cashRegisterClose.findMany({
      where: { tenantId: auth.tenantId },
      orderBy: { closedAt: "desc" },
      take: 20,
    });

    const formattedClosures = closures.map((c) => ({
      id: c.id,
      openedAt: c.openedAt.toISOString(),
      closedAt: c.closedAt.toISOString(),
      openingCash: c.openingCash,
      expectedCash: c.expectedCash,
      countedCash: c.countedCash,
      difference: c.difference,
      notes: c.notes,
      closedBy: c.closedBy,
      createdAt: c.createdAt.toISOString(),
    }));

    return NextResponse.json({
      ok: true,
      closures: formattedClosures,
      data: formattedClosures,
    });
  } catch (error) {
    console.error("Error en GET /api/cash/close:", error);
    return NextResponse.json(
      { ok: false, error: "DB_UNAVAILABLE", message: "Error al consultar historial de arqueos." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireTenantSession(request, ["OWNER", "SUPERADMIN"]);
    if (isGuardError(auth)) return auth;

    const body = await request.json();
    const { openingCash, expectedCash, countedCash, notes, openedAt } = body;

    const parsedCounted = Number(countedCash);
    const parsedExpected = Number(expectedCash);
    const parsedOpening = Number(openingCash || 0);

    if (Number.isNaN(parsedCounted) || parsedCounted < 0) {
      return NextResponse.json(
        { ok: false, error: "VALIDATION_ERROR", message: "El efectivo contado debe ser un número válido." },
        { status: 400 }
      );
    }

    if (Number.isNaN(parsedExpected)) {
      return NextResponse.json(
        { ok: false, error: "VALIDATION_ERROR", message: "El efectivo esperado es inválido." },
        { status: 400 }
      );
    }

    const difference = parsedCounted - parsedExpected;
    const now = new Date();
    const parsedOpenedAt = openedAt ? new Date(openedAt) : new Date(now.getFullYear(), now.getMonth(), now.getDate(), 8, 0, 0);

    const created = await prisma.cashRegisterClose.create({
      data: {
        tenantId: auth.tenantId,
        openedAt: parsedOpenedAt,
        closedAt: now,
        openingCash: Math.round(parsedOpening),
        expectedCash: Math.round(parsedExpected),
        countedCash: Math.round(parsedCounted),
        difference: Math.round(difference),
        notes: notes ? String(notes).trim() : null,
        closedBy: auth.session.name || "Administrador",
      },
    });

    await prisma.platformEvent.create({
      data: {
        event: "CASH_REGISTER_CLOSED",
        tenantId: auth.tenantId,
        entityType: "CashRegisterClose",
        entityId: created.id,
        metadata: {
          openingCash: created.openingCash,
          countedCash: created.countedCash,
          difference: created.difference,
        },
      },
    });

    const closureData = {
      id: created.id,
      openedAt: created.openedAt.toISOString(),
      closedAt: created.closedAt.toISOString(),
      openingCash: created.openingCash,
      expectedCash: created.expectedCash,
      countedCash: created.countedCash,
      difference: created.difference,
      notes: created.notes,
      closedBy: created.closedBy,
    };

    return NextResponse.json(
      {
        ok: true,
        message: "Cierre de caja registrado exitosamente.",
        closure: closureData,
        data: closureData,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error en POST /api/cash/close:", error);
    return NextResponse.json(
      { ok: false, error: "DB_UNAVAILABLE", message: "No se pudo registrar el cierre de caja." },
      { status: 500 }
    );
  }
}
