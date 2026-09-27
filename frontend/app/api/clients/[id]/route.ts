import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireTenantSession, isGuardError, UUID_REGEX } from "@/lib/api-guard";

export const dynamic = "force-dynamic";

type RouteProps = {
  params: Promise<{ id: string }>;
};

export async function PUT(request: NextRequest, { params }: RouteProps) {
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

    const body = await request.json();
    const { name, phone, email, notes, formula, tags, instagram } = body;

    const existing = await prisma.client.findFirst({
      where: { id, tenantId: auth.tenantId },
    });

    if (!existing) {
      return NextResponse.json(
        { ok: false, error: "NOT_FOUND", message: "Cliente no encontrado." },
        { status: 404 }
      );
    }

    const updateData: any = {};
    if (name !== undefined) {
      if (typeof name !== "string" || name.trim().length < 2) {
        return NextResponse.json(
          { ok: false, error: "VALIDATION_ERROR", message: "Nombre de cliente inválido." },
          { status: 400 }
        );
      }
      updateData.name = name.trim();
    }

    if (phone !== undefined) {
      const clean = String(phone).replace(/\D/g, "");
      if (clean.length < 8 || clean.length > 15) {
        return NextResponse.json(
          { ok: false, error: "VALIDATION_ERROR", message: "Teléfono inválido." },
          { status: 400 }
        );
      }
      updateData.phone = clean;
    }

    if (email !== undefined) updateData.email = email ? String(email).trim() : null;
    if (notes !== undefined) updateData.notes = notes ? String(notes).trim() : null;
    if (formula !== undefined) updateData.formula = formula ? String(formula).trim() : null;
    if (instagram !== undefined) updateData.instagram = instagram ? String(instagram).trim() : null;
    if (Array.isArray(tags)) updateData.tags = tags;

    const updated = await prisma.client.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ ok: true, client: updated });
  } catch (error) {
    console.error("Error en PUT /api/clients/[id]:", error);
    return NextResponse.json(
      { ok: false, error: "DB_UNAVAILABLE", message: "No se pudo actualizar el cliente." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteProps) {
  try {
    const auth = await requireTenantSession(request, ["OWNER", "SUPERADMIN"]);
    if (isGuardError(auth)) return auth;

    const { id } = await params;
    if (!UUID_REGEX.test(id)) {
      return NextResponse.json(
        { ok: false, error: "VALIDATION_ERROR", message: "ID de cliente inválido." },
        { status: 400 }
      );
    }

    const existing = await prisma.client.findFirst({
      where: { id, tenantId: auth.tenantId },
    });

    if (!existing) {
      return NextResponse.json(
        { ok: false, error: "NOT_FOUND", message: "Cliente no encontrado." },
        { status: 404 }
      );
    }

    // Al eliminar el cliente, las citas históricas NO se borran (onDelete: SetNull en schema)
    await prisma.client.delete({ where: { id } });

    return NextResponse.json({ ok: true, message: "Ficha de cliente eliminada." });
  } catch (error) {
    console.error("Error en DELETE /api/clients/[id]:", error);
    return NextResponse.json(
      { ok: false, error: "DB_UNAVAILABLE", message: "No se pudo eliminar el cliente." },
      { status: 500 }
    );
  }
}
