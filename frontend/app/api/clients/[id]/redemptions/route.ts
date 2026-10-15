import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireTenantSession, isGuardError, UUID_REGEX } from "@/lib/api-guard";

export const dynamic = "force-dynamic";

type RouteProps = {
  params: Promise<{ id: string }>;
};

class InsufficientPointsError extends Error {}

function invalidId() {
  return NextResponse.json(
    { ok: false, error: "VALIDATION_ERROR", message: "ID de cliente inválido." },
    { status: 400 }
  );
}

function notFound() {
  return NextResponse.json(
    { ok: false, error: "NOT_FOUND", message: "Cliente no encontrado." },
    { status: 404 }
  );
}

// Historial de canjes del cliente (más recientes primero)
export async function GET(request: NextRequest, { params }: RouteProps) {
  try {
    const auth = await requireTenantSession(request, ["OWNER", "SUPERADMIN", "STAFF"]);
    if (isGuardError(auth)) return auth;

    const { id } = await params;
    if (!UUID_REGEX.test(id)) return invalidId();

    const client = await prisma.client.findFirst({
      where: { id, tenantId: auth.tenantId },
      select: { id: true },
    });
    if (!client) return notFound();

    const redemptions = await prisma.loyaltyRedemption.findMany({
      where: { tenantId: auth.tenantId, clientId: id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      ok: true,
      redemptions: redemptions.map((r) => ({
        id: r.id,
        rewardDescription: r.rewardDescription,
        pointsUsed: r.pointsUsed,
        createdBy: r.createdBy,
        createdAt: r.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error("Error en GET /api/clients/[id]/redemptions:", error);
    return NextResponse.json(
      { ok: false, error: "DB_UNAVAILABLE", message: "Error al consultar canjes." },
      { status: 500 }
    );
  }
}

// Registra un canje: descuenta puntos y guarda el historial en una sola transacción
export async function POST(request: NextRequest, { params }: RouteProps) {
  try {
    const auth = await requireTenantSession(request, ["OWNER", "SUPERADMIN", "STAFF"]);
    if (isGuardError(auth)) return auth;

    const { id } = await params;
    if (!UUID_REGEX.test(id)) return invalidId();

    const body = await request.json().catch(() => ({}));
    const rewardDescription =
      typeof body.rewardDescription === "string" ? body.rewardDescription.trim() : "";
    const pointsUsed = Math.round(Number(body.pointsUsed));

    if (rewardDescription.length < 1 || rewardDescription.length > 200) {
      return NextResponse.json(
        { ok: false, error: "VALIDATION_ERROR", message: "Descripción del premio inválida." },
        { status: 400 }
      );
    }
    if (!Number.isFinite(pointsUsed) || pointsUsed < 1) {
      return NextResponse.json(
        { ok: false, error: "VALIDATION_ERROR", message: "Cantidad de puntos inválida." },
        { status: 400 }
      );
    }

    const client = await prisma.client.findFirst({
      where: { id, tenantId: auth.tenantId },
      select: { id: true },
    });
    if (!client) return notFound();

    const result = await prisma.$transaction(async (tx) => {
      // Descuento condicional: evita saldo negativo ante canjes simultáneos
      const { count } = await tx.client.updateMany({
        where: { id, tenantId: auth.tenantId, points: { gte: pointsUsed } },
        data: { points: { decrement: pointsUsed } },
      });
      if (count === 0) throw new InsufficientPointsError();

      const redemption = await tx.loyaltyRedemption.create({
        data: {
          tenantId: auth.tenantId,
          clientId: id,
          rewardDescription,
          pointsUsed,
          createdBy: auth.session.name || null,
        },
      });

      const updated = await tx.client.findUniqueOrThrow({
        where: { id },
        select: { points: true, _count: { select: { loyaltyRedemptions: true } } },
      });

      return { redemption, updated };
    });

    return NextResponse.json({
      ok: true,
      redemption: {
        id: result.redemption.id,
        rewardDescription: result.redemption.rewardDescription,
        pointsUsed: result.redemption.pointsUsed,
        createdBy: result.redemption.createdBy,
        createdAt: result.redemption.createdAt.toISOString(),
      },
      loyaltyPoints: result.updated.points,
      loyaltyRedeemed: result.updated._count.loyaltyRedemptions,
    });
  } catch (error) {
    if (error instanceof InsufficientPointsError) {
      return NextResponse.json(
        { ok: false, error: "INSUFFICIENT_POINTS", message: "El cliente no tiene puntos suficientes para este premio." },
        { status: 409 }
      );
    }
    console.error("Error en POST /api/clients/[id]/redemptions:", error);
    return NextResponse.json(
      { ok: false, error: "DB_UNAVAILABLE", message: "No se pudo registrar el canje." },
      { status: 500 }
    );
  }
}
