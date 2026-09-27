import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { AppointmentStatus, CashMovementType } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("tenant") || "barberia";

    const tenant = await prisma.tenant.findFirst({
      where: {
        OR: [{ subdomain: slug }, { slug: slug }],
      },
      include: {
        services: true,
        staff: true,
        clients: true,
        products: true,
        cashMovements: {
          orderBy: { createdAt: "desc" },
          take: 50,
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
        { ok: false, error: `Tenant "${slug}" no encontrado` },
        { status: 404 }
      );
    }

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
        name: tenant.name,
        slug: tenant.slug,
        timezone: tenant.timezone,
      },
      appointments: formattedAppointments,
      services: tenant.services.map((s) => ({
        id: s.id,
        name: s.name,
        durationMin: s.durationMinutes,
        price: s.price,
      })),
      staff: tenant.staff.map((m) => ({
        id: m.id,
        name: m.name,
        commissionPercentage: m.commissionPercentage,
        active: m.active,
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
    const body = await request.json();
    const { action, tenantSlug = "barberia", data } = body;

    const tenant = await prisma.tenant.findFirst({
      where: {
        OR: [{ subdomain: tenantSlug }, { slug: tenantSlug }],
      },
    });

    if (!tenant) {
      return NextResponse.json(
        { ok: false, error: `Tenant "${tenantSlug}" no encontrado` },
        { status: 404 }
      );
    }

    if (action === "create_appointment") {
      // Find or pick valid service and staff IDs in PostgreSQL
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

      // Update if it's a valid UUID matching an existing record
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
