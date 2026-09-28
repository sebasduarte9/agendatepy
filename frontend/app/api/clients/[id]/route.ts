import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireTenantSession, isGuardError, UUID_REGEX } from "@/lib/api-guard";
import { normalizeParaguayPhone } from "@/lib/dashboard-dates";

export const dynamic = "force-dynamic";

type RouteProps = {
  params: Promise<{ id: string }>;
};

export async function GET(request: NextRequest, { params }: RouteProps) {
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

    const client = await prisma.client.findFirst({
      where: { id, tenantId: auth.tenantId },
    });

    if (!client) {
      return NextResponse.json(
        { ok: false, error: "NOT_FOUND", message: "Cliente no encontrado." },
        { status: 404 }
      );
    }

    const clientNormPhone = normalizeParaguayPhone(client.phone) || client.phone;

    // Buscar citas del cliente por ID o teléfono
    const appointments = await prisma.appointment.findMany({
      where: {
        tenantId: auth.tenantId,
        OR: [
          { clientId: client.id },
          { clientPhone: client.phone },
          { clientPhone: clientNormPhone },
        ],
      },
      include: {
        service: { select: { id: true, name: true, durationMinutes: true, price: true } },
        staff: { select: { id: true, name: true } },
      },
      orderBy: { startTime: "desc" },
    });

    // Consultar cobros de caja de estas citas
    const aptIds = appointments.map((a) => a.id);
    const cashMovements = await prisma.cashMovement.findMany({
      where: {
        tenantId: auth.tenantId,
        type: "INCOME",
        appointmentId: { in: aptIds },
      },
      select: {
        amount: true,
        appointmentId: true,
        paymentMethod: true,
        createdAt: true,
      },
    });

    const cashByAppointment = new Map<string, { amount: number; method: string }>();
    let totalSpent = 0;
    for (const cm of cashMovements) {
      if (cm.appointmentId) {
        cashByAppointment.set(cm.appointmentId, {
          amount: cm.amount,
          method: cm.paymentMethod,
        });
        totalSpent += cm.amount;
      }
    }

    const now = Date.now();
    const completedApts = appointments.filter((a) => a.status === "COMPLETED");
    const totalVisits = completedApts.length;
    const lastVisit = completedApts.length > 0 ? completedApts[0].startTime.toISOString() : null;

    const futureApts = appointments
      .filter(
        (a) =>
          new Date(a.startTime).getTime() > now &&
          a.status !== "CANCELLED" &&
          a.status !== "NO_SHOW" &&
          a.status !== "EXPIRED"
      )
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
    const nextApt = futureApts[0] || null;

    const history = appointments.map((a) => {
      const paymentInfo = cashByAppointment.get(a.id);
      return {
        id: a.id,
        start: a.startTime.toISOString(),
        end: a.endTime.toISOString(),
        status: a.status.toLowerCase(),
        service: a.service
          ? {
              id: a.service.id,
              name: a.service.name,
              price: a.service.price,
              durationMinutes: a.service.durationMinutes,
            }
          : null,
        staff: a.staff
          ? {
              id: a.staff.id,
              name: a.staff.name,
            }
          : null,
        chargedAmount: paymentInfo?.amount ?? null,
        paymentMethod: paymentInfo?.method ?? null,
      };
    });

    return NextResponse.json({
      ok: true,
      client: {
        id: client.id,
        name: client.name,
        phone: client.phone,
        email: client.email || "",
        notes: client.notes || "",
        formula: client.formula || "",
        tags: client.tags || ["Nuevo"],
        instagram: client.instagram || "",
        totalVisits,
        totalSpent,
        lastVisit: lastVisit || client.createdAt.toISOString(),
        nextAppointment: nextApt
          ? {
              id: nextApt.id,
              date: nextApt.startTime.toISOString(),
              serviceName: nextApt.service?.name || "Servicio",
              staffName: nextApt.staff?.name || "Profesional",
            }
          : null,
        loyaltyPoints: client.points,
        loyaltyRedeemed: 0,
        history,
      },
    });
  } catch (error) {
    console.error("Error en GET /api/clients/[id]:", error);
    return NextResponse.json(
      { ok: false, error: "DB_UNAVAILABLE", message: "Error al consultar cliente." },
      { status: 500 }
    );
  }
}

async function handleUpdate(request: NextRequest, { params }: RouteProps) {
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
      const raw = String(phone).trim();
      const clean = raw.replace(/\D/g, "");
      if (clean.length < 8 || clean.length > 15) {
        return NextResponse.json(
          { ok: false, error: "VALIDATION_ERROR", message: "Teléfono inválido (debe contener 8 a 15 dígitos)." },
          { status: 400 }
        );
      }
      updateData.phone = normalizeParaguayPhone(raw) || clean;
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
    console.error("Error en PUT/PATCH /api/clients/[id]:", error);
    return NextResponse.json(
      { ok: false, error: "DB_UNAVAILABLE", message: "No se pudo actualizar el cliente." },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, props: RouteProps) {
  return handleUpdate(request, props);
}

export async function PATCH(request: NextRequest, props: RouteProps) {
  return handleUpdate(request, props);
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
