import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireTenantSession, isGuardError, UUID_REGEX } from "@/lib/api-guard";

export const dynamic = "force-dynamic";

type RouteProps = {
  params: Promise<{ id: string }>;
};

export async function DELETE(request: NextRequest, { params }: RouteProps) {
  try {
    const auth = await requireTenantSession(request, ["OWNER", "SUPERADMIN"]);
    if (isGuardError(auth)) return auth;

    const { id } = await params;
    if (!UUID_REGEX.test(id)) {
      return NextResponse.json(
        { ok: false, error: "VALIDATION_ERROR", message: "ID de movimiento inválido." },
        { status: 400 }
      );
    }

    const existing = await prisma.cashMovement.findFirst({
      where: { id, tenantId: auth.tenantId },
    });

    if (!existing) {
      return NextResponse.json(
        { ok: false, error: "NOT_FOUND", message: "Movimiento de caja no encontrado." },
        { status: 404 }
      );
    }

    await prisma.cashMovement.delete({ where: { id } });

    return NextResponse.json({ ok: true, message: "Movimiento de caja eliminado." });
  } catch (error) {
    console.error("Error en DELETE /api/cash/[id]:", error);
    return NextResponse.json(
      { ok: false, error: "DB_UNAVAILABLE", message: "No se pudo eliminar el movimiento de caja." },
      { status: 500 }
    );
  }
}
