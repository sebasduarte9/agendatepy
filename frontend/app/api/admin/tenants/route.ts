import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireSuperAdminSession, isGuardError } from "@/lib/api-guard";
import { CashMovementType } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const auth = await requireSuperAdminSession(request);
    if (isGuardError(auth)) return auth;

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.trim() || "";
    const rawStatus = searchParams.get("status") || "ALL";
    const statusFilter = rawStatus.toUpperCase() === "ALL" ? "" : rawStatus;
    const rawPlan = searchParams.get("plan") || "ALL";
    const planFilter = rawPlan.toUpperCase() === "ALL" ? "" : rawPlan;
    const rawActivity = searchParams.get("activity") || "ALL";
    const activityFilter = rawActivity.toUpperCase() === "ALL" ? "" : rawActivity.toUpperCase();
    const sortBy = searchParams.get("sortBy") || "createdAt"; // "createdAt", "name", "lastActivity"
    const sortOrder = (searchParams.get("sortOrder") || "desc").toLowerCase() === "asc" ? "asc" : "desc";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { slug: { contains: search, mode: "insensitive" } },
        { subdomain: { contains: search, mode: "insensitive" } },
      ];
    }
    if (statusFilter) {
      where.status = statusFilter;
    }

    // Handle Plan Filter (FREE, PAID, or exact match)
    if (planFilter) {
      if (planFilter.toUpperCase() === "FREE") {
        where.plan = { in: ["FREE", "GRATUITO", "free", "gratuito"] };
      } else if (planFilter.toUpperCase() === "PAID") {
        where.plan = { notIn: ["FREE", "GRATUITO", "free", "gratuito", "TRIAL", "trial"] };
      } else {
        where.plan = { equals: planFilter, mode: "insensitive" };
      }
    }

    const tenants = await prisma.tenant.findMany({
      where,
      orderBy: sortBy === "name" ? { name: sortOrder } : { createdAt: sortOrder },
      include: {
        users: {
          where: { role: "OWNER" },
          select: { email: true, name: true, phone: true },
          take: 1,
        },
        _count: {
          select: {
            staff: true,
            services: true,
            clients: true,
            appointments: true,
            cashMovements: true,
          },
        },
        appointments: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { createdAt: true, startTime: true },
        },
        cashMovements: {
          where: { type: CashMovementType.INCOME },
          select: { amount: true },
        },
      },
    });

    const now = new Date();
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    const fortyFiveDaysAgo = new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000);

    let formattedTenants = tenants.map((t) => {
      const lastAppointmentDate = t.appointments[0]?.createdAt || t.appointments[0]?.startTime || null;
      const lastActivity = lastAppointmentDate ? new Date(lastAppointmentDate) : new Date(t.createdAt);

      let activityStatus: "Activo" | "Sin actividad reciente" | "Inactivo" = "Inactivo";
      if (lastActivity >= fourteenDaysAgo && t._count.appointments > 0) {
        activityStatus = "Activo";
      } else if (lastActivity >= fortyFiveDaysAgo && t._count.appointments > 0) {
        activityStatus = "Sin actividad reciente";
      } else {
        activityStatus = "Inactivo";
      }

      const totalCashIncome = t.cashMovements.reduce((acc, m) => acc + m.amount, 0);
      const upperPlan = (t.plan || "PROFESIONAL").toUpperCase();
      const isPaid = upperPlan !== "FREE" && upperPlan !== "GRATUITO" && upperPlan !== "TRIAL";
      const owner = t.users[0] || null;

      return {
        id: t.id,
        name: t.name,
        slug: t.slug,
        subdomain: t.subdomain,
        plan: t.plan || "PROFESIONAL",
        isPaid,
        status: t.status,
        timezone: t.timezone,
        ownerEmail: owner?.email || null,
        ownerName: owner?.name || null,
        ownerPhone: owner?.phone || null,
        createdAt: t.createdAt.toISOString(),
        staffCount: t._count.staff,
        servicesCount: t._count.services,
        clientsCount: t._count.clients,
        appointmentsCount: t._count.appointments,
        totalCashIncome,
        lastActivityAt: lastAppointmentDate ? new Date(lastAppointmentDate).toISOString() : null,
        activityStatus,
      };
    });

    // Apply activityFilter if present
    if (activityFilter) {
      if (activityFilter === "ACTIVE") {
        formattedTenants = formattedTenants.filter((t) => t.activityStatus === "Activo");
      } else if (activityFilter === "LOW_ACTIVITY") {
        formattedTenants = formattedTenants.filter((t) => t.activityStatus === "Sin actividad reciente");
      } else if (activityFilter === "INACTIVE") {
        formattedTenants = formattedTenants.filter((t) => t.activityStatus === "Inactivo");
      }
    }

    // Sort by lastActivity if requested
    if (sortBy === "lastActivity") {
      formattedTenants.sort((a, b) => {
        const timeA = a.lastActivityAt ? new Date(a.lastActivityAt).getTime() : 0;
        const timeB = b.lastActivityAt ? new Date(b.lastActivityAt).getTime() : 0;
        return sortOrder === "asc" ? timeA - timeB : timeB - timeA;
      });
    }

    const total = formattedTenants.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const paginatedTenants = formattedTenants.slice((page - 1) * limit, page * limit);

    return NextResponse.json({
      ok: true,
      data: paginatedTenants,
      tenants: paginatedTenants,
      count: paginatedTenants.length,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error) {
    console.error("Error en GET /api/admin/tenants:", error);
    return NextResponse.json(
      { ok: false, error: "SERVER_ERROR", message: "Error al listar negocios." },
      { status: 500 }
    );
  }
}
