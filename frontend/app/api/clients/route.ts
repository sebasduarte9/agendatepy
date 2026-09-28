import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireTenantSession, isGuardError } from "@/lib/api-guard";
import { normalizeParaguayPhone } from "@/lib/dashboard-dates";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const auth = await requireTenantSession(request);
    if (isGuardError(auth)) return auth;

    // 1. Consultar todos los clientes del tenant
    const clients = await prisma.client.findMany({
      where: { tenantId: auth.tenantId },
      orderBy: { createdAt: "desc" },
    });

    // 2. Consultar citas del tenant para derivar métricas sin N+1
    const appointments = await prisma.appointment.findMany({
      where: { tenantId: auth.tenantId },
      select: {
        id: true,
        clientId: true,
        clientPhone: true,
        startTime: true,
        status: true,
        service: { select: { id: true, name: true, durationMinutes: true, price: true } },
        staff: { select: { id: true, name: true } },
      },
      orderBy: { startTime: "desc" },
    });

    // 3. Consultar cobros reales de caja asociados a citas (solo ingresos)
    const cashMovements = await prisma.cashMovement.findMany({
      where: {
        tenantId: auth.tenantId,
        type: "INCOME",
        appointmentId: { not: null },
      },
      select: {
        amount: true,
        appointmentId: true,
      },
    });

    // Mapear ingresos cobrados por appointmentId
    const cashByAppointment = new Map<string, number>();
    for (const cm of cashMovements) {
      if (cm.appointmentId) {
        cashByAppointment.set(
          cm.appointmentId,
          (cashByAppointment.get(cm.appointmentId) || 0) + cm.amount
        );
      }
    }

    const now = Date.now();

    const formatted = clients.map((c) => {
      const clientNormPhone = normalizeParaguayPhone(c.phone) || c.phone;

      // Citas pertenecientes a este cliente (por clientId o teléfono normalizado)
      const clientApts = appointments.filter(
        (a) =>
          a.clientId === c.id ||
          (a.clientPhone && (a.clientPhone === c.phone || normalizeParaguayPhone(a.clientPhone) === clientNormPhone))
      );

      // Regla de Visitas: SOLO cuenta appointments COMPLETED
      const completedApts = clientApts.filter((a) => a.status === "COMPLETED");
      const totalVisits = completedApts.length;

      // Última visita: ÚNICAMENTE existe si hay al menos un appointment COMPLETED
      const latestCompleted = completedApts.length > 0 ? completedApts[0] : null;
      const lastVisit = latestCompleted
        ? latestCompleted.startTime.toISOString()
        : null;

      // Próxima cita: primer appointment futuro que no sea CANCELLED, NO_SHOW, EXPIRED
      const futureApts = clientApts
        .filter(
          (a) =>
            new Date(a.startTime).getTime() > now &&
            a.status !== "CANCELLED" &&
            a.status !== "NO_SHOW" &&
            a.status !== "EXPIRED"
        )
        .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
      const nextApt = futureApts[0] || null;

      // Total gastado: suma de cobros reales en caja vía appointmentId
      let totalSpent = 0;
      for (const apt of clientApts) {
        const charged = cashByAppointment.get(apt.id);
        if (charged) {
          totalSpent += charged;
        }
      }

      return {
        id: c.id,
        name: c.name,
        phone: c.phone,
        email: c.email || "",
        notes: c.notes || "",
        formula: c.formula || "",
        tags: c.tags && c.tags.length > 0 ? c.tags : ["Nuevo"],
        instagram: c.instagram || "",
        totalVisits,
        totalSpent,
        lastVisit,
        nextAppointment: nextApt
          ? {
              id: nextApt.id,
              date: nextApt.startTime.toISOString(),
              serviceName: nextApt.service?.name || "Servicio",
              staffName: nextApt.staff?.name || "Profesional",
            }
          : null,
        loyaltyPoints: c.points,
        loyaltyRedeemed: 0,
      };
    });

    const searchParam = request.nextUrl.searchParams.get("search") || request.nextUrl.searchParams.get("q");
    let result = formatted;
    if (searchParam) {
      const q = searchParam.trim().toLowerCase();
      const normQ = normalizeParaguayPhone(q) || q.replace(/\D/g, "");
      result = formatted.filter((c) => {
        const matchesName = c.name.toLowerCase().includes(q);
        const matchesPhone = c.phone.includes(q) || (Boolean(normQ) && c.phone.includes(normQ));
        return matchesName || Boolean(matchesPhone);
      });
    }

    return NextResponse.json({ ok: true, clients: result });
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

    const cleanDigits = phone.replace(/\D/g, "");
    if (cleanDigits.length < 8 || cleanDigits.length > 15) {
      return NextResponse.json(
        { ok: false, error: "VALIDATION_ERROR", message: "Teléfono inválido (debe contener 8 a 15 dígitos)." },
        { status: 400 }
      );
    }

    const normPhone = normalizeParaguayPhone(phone) || phone.trim();

    // Verificar si ya existe un cliente con este teléfono en el tenant (soportando variantes)
    const existing = await prisma.client.findFirst({
      where: {
        tenantId: auth.tenantId,
        OR: [
          { phone: normPhone },
          { phone: cleanDigits },
          { phone: `+${cleanDigits}` },
          { phone: cleanDigits.startsWith("595") ? `0${cleanDigits.slice(3)}` : cleanDigits },
          { phone: cleanDigits.startsWith("09") ? `595${cleanDigits.slice(1)}` : cleanDigits },
        ],
      },
    });

    if (existing) {
      // Actualizar datos del cliente existente sin duplicar
      const updated = await prisma.client.update({
        where: { id: existing.id },
        data: {
          name: name.trim(),
          phone: normPhone,
          email: email?.trim() || existing.email,
          notes: notes?.trim() ?? existing.notes,
          formula: formula?.trim() ?? existing.formula,
          tags: Array.isArray(tags) ? tags : existing.tags,
          instagram: instagram?.trim() ?? existing.instagram,
        },
      });
      return NextResponse.json({ ok: true, client: updated, updatedExisting: true });
    }

    // Crear nuevo cliente con teléfono normalizado canónico
    const newClient = await prisma.client.create({
      data: {
        tenantId: auth.tenantId,
        name: name.trim(),
        phone: normPhone,
        email: email?.trim() || null,
        notes: notes?.trim() || null,
        formula: formula?.trim() || null,
        tags: Array.isArray(tags) ? tags : ["Nuevo"],
        instagram: instagram?.trim() || null,
        lastVisit: new Date(),
      },
    });

    await prisma.platformEvent.create({
      data: {
        event: "CLIENT_CREATED",
        tenantId: auth.tenantId,
        entityType: "Client",
        entityId: newClient.id,
        metadata: {
          hasEmail: !!newClient.email,
          hasNotes: !!newClient.notes,
        },
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
