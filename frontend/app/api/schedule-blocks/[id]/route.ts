import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireTenantSession, isGuardError, UUID_REGEX } from "@/lib/api-guard";

export const dynamic = "force-dynamic";

type RouteProps = {
  params: Promise<{ id: string }>;
};

export async function DELETE(request: NextRequest, { params }: RouteProps) {
  try {
    const auth = await requireTenantSession(request, ["OWNER", "SUPERADMIN", "STAFF"]);
    if (isGuardError(auth)) return auth;

    const { id } = await params;
    if (!UUID_REGEX.test(id)) {
      return NextResponse.json(
        { ok: false, error: "VALIDATION_ERROR", message: "ID de bloqueo inválido." },
        { status: 400 }
      );
    }

    const existing = await prisma.scheduleBlock.findFirst({
      where: { id, tenantId: auth.tenantId },
    });

    if (!existing) {
      return NextResponse.json(
        { ok: false, error: "NOT_FOUND", message: "Bloqueo no encontrado." },
        { status: 404 }
      );
    }

    await prisma.scheduleBlock.delete({ where: { id } });

    return NextResponse.json({ ok: true, message: "Bloqueo eliminado correctamente." });
  } catch (error) {
    console.error("Error en DELETE /api/schedule-blocks/[id]:", error);
    return NextResponse.json(
      { ok: false, error: "DB_UNAVAILABLE", message: "No se pudo eliminar el bloqueo." },
      { status: 500 }
    );
  }
}
