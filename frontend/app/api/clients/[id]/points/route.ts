import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireTenantSession, isGuardError, UUID_REGEX } from "@/lib/api-guard";

export const dynamic = "force-dynamic";

type RouteProps = {
  params: Promise<{ id: string }>;
};

const MAX_DELTA = 1000;

// Suma sellos/puntos de forma atómica (increment), para que clics rápidos no se pisen
export async function POST(request: NextRequest, { params }: RouteProps) {
  try {
    const auth = await requireTenantSession(request, ["OWNER", "SUPERADMIN", "STAFF"]);
    if (isGuardError(auth)) return auth;

    const { id } = await params;
    if (!UUID_REGEX.test(id)) {
      return NextResponse.json(
        { ok: false, error: "VALIDATION_ERROR", message: "ID de cliente inválido." },
        { status: 400 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const delta = Math.round(Number(body.delta));
    if (!Number.isFinite(delta) || delta < 1 || delta > MAX_DELTA) {
      return NextResponse.json(
        { ok: false, error: "VALIDATION_ERROR", message: "Cantidad de puntos inválida." },
        { status: 400 }
      );
    }

    const { count } = await prisma.client.updateMany({
      where: { id, tenantId: auth.tenantId },
      data: { points: { increment: delta } },
    });
    if (count === 0) {
      return NextResponse.json(
        { ok: false, error: "NOT_FOUND", message: "Cliente no encontrado." },
        { status: 404 }
      );
    }

    const updated = await prisma.client.findUniqueOrThrow({
      where: { id },
      select: { points: true },
    });

    return NextResponse.json({ ok: true, loyaltyPoints: updated.points });
  } catch (error) {
    console.error("Error en POST /api/clients/[id]/points:", error);
    return NextResponse.json(
      { ok: false, error: "DB_UNAVAILABLE", message: "No se pudieron sumar los puntos." },
      { status: 500 }
    );
  }
}
