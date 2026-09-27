import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireTenantSession, isGuardError } from "@/lib/api-guard";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const auth = await requireTenantSession(request);
    if (isGuardError(auth)) return auth;

    const clients = await prisma.client.findMany({
      where: { tenantId: auth.tenantId },
      include: {
        _count: {
          select: {
            appointments: {
              where: { status: { in: ["CONFIRMED", "COMPLETED"] } },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const formatted = clients.map((c) => ({
      id: c.id,
      name: c.name,
      phone: c.phone,
      email: c.email || "",
      notes: c.notes || "",
      formula: c.formula || "",
      tags: c.tags || ["Nuevo"],
      instagram: c.instagram || "",
      totalVisits: c._count.appointments,
      totalSpent: c.totalSpent,
      lastVisit: c.lastVisit ? c.lastVisit.toISOString() : c.createdAt.toISOString(),
      loyaltyPoints: c.points,
      loyaltyRedeemed: 0,
    }));

    return NextResponse.json({ ok: true, clients: formatted });
  } catch (error) {
    console.error("Error en GET /api/clients:", error);
    return NextResponse.json(
      { ok: false, error: "DB_UNAVAILABLE", message: "Error al consultar clientes." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireTenantSession(request, ["OWNER", "SUPERADMIN", "STAFF"]);
    if (isGuardError(auth)) return auth;

    const body = await request.json();
    const { name, phone, email, notes, formula, tags, instagram } = body;

    if (!name || typeof name !== "string" || name.trim().length < 2) {
      return NextResponse.json(
        { ok: false, error: "VALIDATION_ERROR", message: "Nombre de cliente inválido." },
        { status: 400 }
      );
    }

    if (!phone || typeof phone !== "string") {
      return NextResponse.json(
        { ok: false, error: "VALIDATION_ERROR", message: "Teléfono requerido." },
        { status: 400 }
      );
    }

    const cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone.length < 8 || cleanPhone.length > 15) {
      return NextResponse.json(
        { ok: false, error: "VALIDATION_ERROR", message: "Teléfono inválido (debe contener 8 a 15 dígitos)." },
        { status: 400 }
      );
    }

    // Verificar si ya existe un cliente con este teléfono en el tenant
    const existing = await prisma.client.findFirst({
      where: { tenantId: auth.tenantId, phone: cleanPhone },
    });

    if (existing) {
      // Actualizar datos del cliente existente sin duplicar
      const updated = await prisma.client.update({
        where: { id: existing.id },
        data: {
          name: name.trim(),
          email: email?.trim() || existing.email,
          notes: notes?.trim() ?? existing.notes,
          formula: formula?.trim() ?? existing.formula,
          tags: Array.isArray(tags) ? tags : existing.tags,
          instagram: instagram?.trim() ?? existing.instagram,
        },
      });
      return NextResponse.json({ ok: true, client: updated, updatedExisting: true });
    }

    // Crear nuevo cliente
    const newClient = await prisma.client.create({
      data: {
        tenantId: auth.tenantId,
        name: name.trim(),
        phone: cleanPhone,
        email: email?.trim() || null,
        notes: notes?.trim() || null,
        formula: formula?.trim() || null,
        tags: Array.isArray(tags) ? tags : ["Nuevo"],
        instagram: instagram?.trim() || null,
        lastVisit: new Date(),
      },
    });

    return NextResponse.json({ ok: true, client: newClient }, { status: 201 });
  } catch (error) {
    console.error("Error en POST /api/clients:", error);
    return NextResponse.json(
      { ok: false, error: "DB_UNAVAILABLE", message: "No se pudo crear el cliente." },
      { status: 500 }
    );
  }
}
