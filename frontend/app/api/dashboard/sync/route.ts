import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth/session";
import { AppointmentStatus } from "@prisma/client";
import { normalizeParaguayPhone } from "@/lib/dashboard-dates";

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
      let status: "pending" | "confirmed" | "completed" | "cancelled" | "no_show" | "expired" = "confirmed";
      if (a.status === "PENDING_ACTION") status = "pending";
      else if (a.status === "CONFIRMED") status = "confirmed";
      else if (a.status === "COMPLETED") status = "completed";
      else if (a.status === "CANCELLED") status = "cancelled";
      else if (a.status === "NO_SHOW") status = "no_show";
      else if (a.status === "EXPIRED") status = "expired";

      return {
        id: a.id,
        clientId: a.clientId || undefined,
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

    // Mapear cobros de caja de citas para cálculo de gasto real
    const cashByAppointment = new Map<string, number>();
    for (const cm of tenant.cashMovements) {
      if (cm.appointmentId && cm.type === "INCOME") {
        cashByAppointment.set(
          cm.appointmentId,
          (cashByAppointment.get(cm.appointmentId) || 0) + cm.amount
        );
      }
    }

    const clientsList = tenant.clients.map((c) => {
      const clientNormPhone = normalizeParaguayPhone(c.phone) || c.phone;
      const clientApts = tenant.appointments.filter(
        (a) =>
          a.clientId === c.id ||
          (a.clientPhone && (a.clientPhone === c.phone || normalizeParaguayPhone(a.clientPhone) === clientNormPhone))
      );
      const completedApts = clientApts.filter((a) => a.status === "COMPLETED");
      const totalVisits = completedApts.length;
      const lastVisit = completedApts.length > 0
        ? completedApts[0].startTime.toISOString()
        : null;
      let totalSpent = 0;
      for (const a of clientApts) {
        totalSpent += cashByAppointment.get(a.id) || 0;
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
        loyaltyPoints: c.points,
        loyaltyRedeemed: 0,
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
      clients: clientsList,
      cashMovements: tenant.cashMovements.map((cm) => ({
        id: cm.id,
        type: cm.type === "INCOME" ? ("ingreso" as const) : ("egreso" as const),
        amount: cm.amount,
        method: (cm.paymentMethod.toLowerCase() || "efectivo") as any,
        concept: cm.description,
        date: cm.createdAt.toISOString(),
        category: cm.category,
        appointmentId: cm.appointmentId,
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
      const appData = data || body.appointment || {};
      let serviceId = appData.serviceId;
      let staffId = appData.staffId;

      const newStart = new Date(appData.start || appData.startTime);
      const newEnd = new Date(appData.end || appData.endTime);

      if (Number.isNaN(newStart.getTime()) || Number.isNaN(newEnd.getTime()) || newEnd <= newStart) {
        return NextResponse.json(
          { ok: false, error: "VALIDATION_ERROR", message: "Rango de fecha y horario de cita inválido." },
          { status: 400 }
        );
      }

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

      // 1. Verificar bloqueos de horario (ScheduleBlocks)
      const blockOverlap = await prisma.scheduleBlock.findFirst({
        where: {
          tenantId: tenant.id,
          OR: [{ staffId }, { staffId: null }],
          startTime: { lt: newEnd },
          endTime: { gt: newStart },
        },
      });

      if (blockOverlap) {
        return NextResponse.json(
          {
            ok: false,
            error: "SLOT_BLOCKED",
            message: `El horario está bloqueado: ${blockOverlap.reason || "Horario no disponible"}.`,
          },
          { status: 409 }
        );
      }

      // 2. Verificar superposición con otras citas activas del mismo profesional
      const appointmentOverlap = await prisma.appointment.findFirst({
        where: {
          tenantId: tenant.id,
          staffId,
          status: { notIn: [AppointmentStatus.CANCELLED, AppointmentStatus.EXPIRED, AppointmentStatus.NO_SHOW] },
          startTime: { lt: newEnd },
          endTime: { gt: newStart },
        },
      });

      if (appointmentOverlap) {
        return NextResponse.json(
          {
            ok: false,
            error: "SLOT_OCCUPIED",
            message: "El profesional ya tiene una cita agendada en ese horario. Seleccioná otro horario.",
          },
          { status: 409 }
        );
      }

      const clientName = (appData.clientName || "Cliente Dashboard").trim();
      const rawPhone = (appData.clientPhone || "+595981000000").trim();
      const clientPhone = normalizeParaguayPhone(rawPhone) || rawPhone;
      const digitsOnly = clientPhone.replace(/\D/g, "");

      // 3. Persistir cliente nuevo en la base de datos si no existe (evitando duplicados por formato)
      let targetClientId: string | null = appData.clientId || null;
      if (!targetClientId && clientPhone && clientName) {
        let existingClient = await prisma.client.findFirst({
          where: {
            tenantId: tenant.id,
            OR: [
              { phone: clientPhone },
              { phone: rawPhone },
              { phone: digitsOnly },
              { phone: `+${digitsOnly}` },
              { phone: digitsOnly.startsWith("595") ? `0${digitsOnly.slice(3)}` : digitsOnly },
            ],
          },
        });
        if (!existingClient) {
          existingClient = await prisma.client.create({
            data: {
              tenantId: tenant.id,
              name: clientName,
              phone: clientPhone,
            },
          });
        }
        targetClientId = existingClient.id;
      }

      const created = await prisma.appointment.create({
        data: {
          tenantId: tenant.id,
          staffId: staffId,
          serviceId: serviceId,
          clientId: targetClientId,
          clientName: clientName,
          clientPhone: clientPhone,
          startTime: newStart,
          endTime: newEnd,
          status:
            String(appData.status).toLowerCase() === "pending" || String(appData.status).toLowerCase() === "pending_action"
              ? AppointmentStatus.PENDING_ACTION
              : String(appData.status).toLowerCase() === "completed"
              ? AppointmentStatus.COMPLETED
              : String(appData.status).toLowerCase() === "no_show"
              ? AppointmentStatus.NO_SHOW
              : String(appData.status).toLowerCase() === "cancelled"
              ? AppointmentStatus.CANCELLED
              : AppointmentStatus.CONFIRMED,
        },
      });

      return NextResponse.json({ ok: true, appointmentId: created.id, appointment: created });
    }

    if (action === "update_status") {
      const { appointmentId, status } = data;
      let prismaStatus: AppointmentStatus = AppointmentStatus.CONFIRMED;
      const upper = String(status).toUpperCase().replace(/[\s-]/g, "_");
      if (upper === "CANCELLED" || upper === "CANCELADO") prismaStatus = AppointmentStatus.CANCELLED;
      else if (upper === "COMPLETED" || upper === "COMPLETADO") prismaStatus = AppointmentStatus.COMPLETED;
      else if (upper === "PENDING" || upper === "PENDING_ACTION" || upper === "PENDIENTE") prismaStatus = AppointmentStatus.PENDING_ACTION;
      else if (upper === "NO_SHOW" || upper === "NOSHOW" || upper === "AUSENTE") prismaStatus = AppointmentStatus.NO_SHOW;
      else if (upper === "EXPIRED" || upper === "EXPIRADO") prismaStatus = AppointmentStatus.EXPIRED;

      const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (UUID_REGEX.test(appointmentId)) {
        const existingApp = await prisma.appointment.findFirst({
          where: { id: appointmentId, tenantId: tenant.id },
        });

        if (existingApp && existingApp.status === AppointmentStatus.COMPLETED && prismaStatus !== AppointmentStatus.COMPLETED) {
          return NextResponse.json(
            { ok: false, error: "INVALID_STATUS_TRANSITION", message: "Una cita completada no puede cambiar de estado." },
            { status: 400 }
          );
        }

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
