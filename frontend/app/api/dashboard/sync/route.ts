import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth/session";
import { AppointmentStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { ok: false, error: "No autorizado. Inicie sesión para sincronizar datos." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const requestedSlug = searchParams.get("tenant");

    let tenantIdToQuery = session.tenantId;

    // Solo un SUPERADMIN puede solicitar ver un tenant diferente al de su sesión
    if (session.role === "SUPERADMIN" && requestedSlug) {
      const targetTenant = await prisma.tenant.findFirst({
        where: {
          OR: [{ subdomain: requestedSlug }, { slug: requestedSlug }],
        },
        select: { id: true },
      });
      if (targetTenant) {
        tenantIdToQuery = targetTenant.id;
      }
    } else if (requestedSlug && session.tenantSlug && requestedSlug !== session.tenantSlug) {
      // Bloqueo estricto de intento cross-tenant
      return NextResponse.json(
        { ok: false, error: "Acceso denegado: no tienes permisos para acceder a los datos de este negocio." },
        { status: 403 }
      );
    }

    if (!tenantIdToQuery) {
      return NextResponse.json(
        { ok: false, error: "Usuario sin negocio asignado." },
        { status: 404 }
      );
    }

    const tenant = await prisma.tenant.findUnique({
      where: {
        id: tenantIdToQuery,
      },
      include: {
        services: true,
        staff: true,
        clients: true,
        products: true,
        scheduleBlocks: {
          orderBy: { startTime: "asc" },
        },
        cashMovements: {
          orderBy: { createdAt: "desc" },
          take: 100,
        },
        appointments: {
          include: {
            service: true,
            staff: true,
          },
          orderBy: { startTime: "asc" },
        },
      },
    });

    if (!tenant) {
      return NextResponse.json(
        { ok: false, error: "Negocio no encontrado." },
        { status: 404 }
      );
    }

    const tenantSettings = (tenant.settings as Record<string, any>) || {};

    // Convert Prisma appointments to dashboard-compatible Appointment type
    const formattedAppointments = tenant.appointments.map((a) => {
      let status: "pending" | "confirmed" | "completed" | "cancelled" = "confirmed";
      if (a.status === "PENDING_ACTION") status = "pending";
      else if (a.status === "CONFIRMED") status = "confirmed";
      else if (a.status === "COMPLETED") status = "completed";
      else if (a.status === "CANCELLED" || a.status === "EXPIRED") status = "cancelled";

      return {
        id: a.id,
        clientName: a.clientName,
        clientEmail: `${a.clientName.toLowerCase().replace(/\s+/g, ".")}@cliente.py`,
        clientPhone: a.clientPhone,
        serviceId: a.serviceId,
        staffId: a.staffId,
        start: a.startTime.toISOString(),
        end: a.endTime.toISOString(),
        status,
        paymentMethod: "efectivo" as const,
        notes: `Turno en local (${a.service.name} con ${a.staff.name})`,
      };
    });

    return NextResponse.json({
      ok: true,
      tenant: {
        id: tenant.id,
        name: tenant.name,
        slug: tenant.slug,
        timezone: tenant.timezone,
        phone: tenantSettings.phone || tenantSettings.whatsappPhone || "",
        whatsappNumber: tenantSettings.whatsappPhone || "",
        address: tenantSettings.address || "",
        openingCash: tenantSettings.openingCash ?? 300000,
        settings: tenantSettings,
      },
      appointments: formattedAppointments,
      services: tenant.services.map((s) => ({
        id: s.id,
        name: s.name,
        durationMin: s.durationMinutes,
        price: s.price,
        active: s.active,
      })),
      staff: tenant.staff.map((m) => ({
        id: m.id,
        name: m.name,
        commissionPercentage: m.commissionPercentage,
        active: m.active,
      })),
      clients: tenant.clients.map((c) => ({
        id: c.id,
        name: c.name,
        phone: c.phone,
        email: c.email || "",
        notes: c.notes || "",
        formula: c.formula || "",
        tags: c.tags && c.tags.length > 0 ? c.tags : ["Nuevo"],
        instagram: c.instagram || "",
        totalVisits: 0,
        totalSpent: c.totalSpent,
        lastVisit: c.lastVisit ? c.lastVisit.toISOString() : c.createdAt.toISOString(),
        loyaltyPoints: c.points,
        loyaltyRedeemed: 0,
      })),
      cashMovements: tenant.cashMovements.map((cm) => ({
        id: cm.id,
        type: cm.type === "INCOME" ? ("ingreso" as const) : ("egreso" as const),
        amount: cm.amount,
        method: (cm.paymentMethod.toLowerCase() || "efectivo") as any,
        concept: cm.description,
        date: cm.createdAt.toISOString(),
        category: cm.category,
      })),
      scheduleBlocks: tenant.scheduleBlocks.map((b) => ({
        id: b.id,
        staffId: b.staffId,
        startTime: b.startTime.toISOString(),
        endTime: b.endTime.toISOString(),
        reason: b.reason || "Bloqueo operativo",
      })),
      products: tenant.products.map((p) => ({
        id: p.id,
        name: p.name,
        description: "",
        price: p.price,
        cost: Math.round(p.price * 0.5),
        imageUrl: "",
        category: "General",
        stock: 10,
        active: p.isActive,
      })),
      cashMovementsCount: tenant.cashMovements.length,
    });
  } catch (error) {
    console.error("Error en /api/dashboard/sync GET:", error);
    return NextResponse.json(
      { ok: false, error: "Error sincronizando datos con PostgreSQL" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { ok: false, error: "No autorizado. Inicie sesión para realizar modificaciones." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { action, tenantSlug, data } = body;

    let tenantIdToMutate = session.tenantId;

    if (session.role === "SUPERADMIN" && tenantSlug) {
      const targetTenant = await prisma.tenant.findFirst({
        where: {
          OR: [{ subdomain: tenantSlug }, { slug: tenantSlug }],
        },
        select: { id: true },
      });
      if (targetTenant) {
        tenantIdToMutate = targetTenant.id;
      }
    } else if (tenantSlug && session.tenantSlug && tenantSlug !== session.tenantSlug) {
      return NextResponse.json(
        { ok: false, error: "Acceso denegado: no puedes modificar datos de otro negocio." },
        { status: 403 }
      );
    }

    if (!tenantIdToMutate) {
      return NextResponse.json(
        { ok: false, error: "Negocio no autorizado." },
        { status: 403 }
      );
    }

    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantIdToMutate },
    });

    if (!tenant) {
      return NextResponse.json(
        { ok: false, error: "Negocio no encontrado." },
        { status: 404 }
      );
    }

    if (action === "create_appointment") {
      let serviceId = data.serviceId;
      let staffId = data.staffId;

      const validService = await prisma.service.findFirst({
        where: { id: serviceId, tenantId: tenant.id },
      });
      if (!validService) {
        const fallbackService = await prisma.service.findFirst({
          where: { tenantId: tenant.id },
        });
        if (fallbackService) serviceId = fallbackService.id;
      }

      const validStaff = await prisma.staff.findFirst({
        where: { id: staffId, tenantId: tenant.id },
      });
      if (!validStaff) {
        const fallbackStaff = await prisma.staff.findFirst({
          where: { tenantId: tenant.id, active: true },
        });
        if (fallbackStaff) staffId = fallbackStaff.id;
      }

      const created = await prisma.appointment.create({
        data: {
          tenantId: tenant.id,
          staffId: staffId,
          serviceId: serviceId,
          clientName: data.clientName || "Cliente Dashboard",
          clientPhone: data.clientPhone || "+595981000000",
          startTime: new Date(data.start),
          endTime: new Date(data.end),
          status: data.status === "pending" ? AppointmentStatus.PENDING_ACTION : AppointmentStatus.CONFIRMED,
        },
      });

      return NextResponse.json({ ok: true, appointmentId: created.id });
    }

    if (action === "update_status") {
      const { appointmentId, status } = data;
      let prismaStatus: AppointmentStatus = AppointmentStatus.CONFIRMED;
      if (status === "cancelled") prismaStatus = AppointmentStatus.CANCELLED;
      else if (status === "completed") prismaStatus = AppointmentStatus.COMPLETED;
      else if (status === "pending") prismaStatus = AppointmentStatus.PENDING_ACTION;

      const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (UUID_REGEX.test(appointmentId)) {
        await prisma.appointment.updateMany({
          where: { id: appointmentId, tenantId: tenant.id },
          data: { status: prismaStatus },
        });
      }

      return NextResponse.json({ ok: true, status: prismaStatus });
    }

    if (action === "create_product") {
      const created = await prisma.product.create({
        data: {
          tenantId: tenant.id,
          name: data.name || "Producto sin nombre",
          price: Number(data.price) || 0,
          isActive: data.active !== false,
        },
      });
      return NextResponse.json({ ok: true, product: created });
    }

    if (action === "update_product") {
      const { id, patch } = data;
      const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (UUID_REGEX.test(id)) {
        await prisma.product.updateMany({
          where: { id, tenantId: tenant.id },
          data: {
            ...(patch.name ? { name: patch.name } : {}),
            ...(patch.price !== undefined ? { price: Number(patch.price) } : {}),
            ...(patch.active !== undefined ? { isActive: Boolean(patch.active) } : {}),
          },
        });
      }
      return NextResponse.json({ ok: true });
    }

    if (action === "delete_product") {
      const { id } = data;
      const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (UUID_REGEX.test(id)) {
        await prisma.product.deleteMany({
          where: { id, tenantId: tenant.id },
        });
      }
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ ok: false, error: "Acción no reconocida" }, { status: 400 });
  } catch (error) {
    console.error("Error en /api/dashboard/sync POST:", error);
    return NextResponse.json(
      { ok: false, error: "Error procesando sincronización en base de datos" },
      { status: 500 }
    );
  }
}
