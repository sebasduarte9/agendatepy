import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireSuperAdminSession, isGuardError } from "@/lib/api-guard";
import { AppointmentStatus, CashMovementType } from "@prisma/client";

export const dynamic = "force-dynamic";

export interface SystemAlert {
  id: string;
  severity: "INFO" | "WARNING" | "CRITICAL";
  title: string;
  reason: string;
  category: "ACTIVITY" | "CONFIG" | "ERROR" | "MILESTONE";
  tenantId?: string | null;
  tenantName?: string | null;
  tenantSlug?: string | null;
  date: string;
  actionHref?: string;
}

export async function GET(request: NextRequest) {
  try {
    const auth = await requireSuperAdminSession(request);
    if (isGuardError(auth)) return auth;

    const now = new Date();
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const alerts: SystemAlert[] = [];

    // 1. Consultar todos los tenants con sus conteos y citas recientes
    const tenants = await prisma.tenant.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        status: true,
        createdAt: true,
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
          select: { createdAt: true },
        },
        cashMovements: {
          where: { type: CashMovementType.INCOME },
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { createdAt: true },
        },
      },
    });

    let inactiveTenantsCount = 0;
    let unconfiguredTenantsCount = 0;
    let configuredNoBookingCount = 0;

    tenants.forEach((t) => {
      const lastAppDate = t.appointments[0]?.createdAt || null;
      const lastCashDate = t.cashMovements[0]?.createdAt || null;
      let lastActivity = t.createdAt;

      if (lastAppDate && lastCashDate) {
        lastActivity = lastAppDate > lastCashDate ? lastAppDate : lastCashDate;
      } else if (lastAppDate) {
        lastActivity = lastAppDate;
      } else if (lastCashDate) {
        lastActivity = lastCashDate;
      }

      const isConfigured = t._count.staff > 0 && t._count.services > 0;
      const hasBooking = t._count.appointments > 0;

      // Alerta: Negocio registrado pero nunca configurado
      if (!isConfigured) {
        unconfiguredTenantsCount++;
        alerts.push({
          id: `unconfig-${t.id}`,
          severity: "WARNING",
          title: `Negocio sin configuración: ${t.name}`,
          reason: "El negocio fue registrado pero aún no cuenta con colaboradores ni servicios cargados.",
          category: "CONFIG",
          tenantId: t.id,
          tenantName: t.name,
          tenantSlug: t.slug,
          date: t.createdAt.toISOString(),
          actionHref: `/admin/negocios/${t.id}`,
        });
      }
      // Alerta: Configurado pero nunca recibió reservas
      else if (isConfigured && !hasBooking) {
        configuredNoBookingCount++;
        alerts.push({
          id: `nobooking-${t.id}`,
          severity: "WARNING",
          title: `Sin primera reserva: ${t.name}`,
          reason: "El negocio completó la configuración de staff y servicios pero aún no registró ninguna cita.",
          category: "ACTIVITY",
          tenantId: t.id,
          tenantName: t.name,
          tenantSlug: t.slug,
          date: t.createdAt.toISOString(),
          actionHref: `/admin/negocios/${t.id}`,
        });
      }
      // Alerta: Sin actividad operacional > 14 días
      else if (lastActivity < fourteenDaysAgo) {
        inactiveTenantsCount++;
        alerts.push({
          id: `inactive-${t.id}`,
          severity: "WARNING",
          title: `Inactividad operativa (+14 días): ${t.name}`,
          reason: `Última actividad registrada el ${lastActivity.toLocaleDateString("es-PY")}. Sin citas ni movimientos recientes.`,
          category: "ACTIVITY",
          tenantId: t.id,
          tenantName: t.name,
          tenantSlug: t.slug,
          date: lastActivity.toISOString(),
          actionHref: `/admin/negocios/${t.id}`,
        });
      }
    });

    // 2. Comprobar errores críticos en PlatformEvent (errores 500 o colisiones)
    const recentErrors = await prisma.platformEvent.findMany({
      where: {
        createdAt: { gte: thirtyDaysAgo },
        OR: [
          { event: "API_ERROR" },
          { event: "SLOT_TAKEN" },
          { entityType: "SystemError" },
        ],
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    const error500List = recentErrors.filter(
      (e) => (e.metadata as any)?.statusCode >= 500 || e.event === "API_ERROR"
    );

    if (error500List.length > 5) {
      alerts.unshift({
        id: "alert-critical-500",
        severity: "CRITICAL",
        title: "Aumento de Errores Internos 500",
        reason: `Se detectaron ${error500List.length} errores HTTP 500 en los últimos 30 días. Revisar registros de telemetría.`,
        category: "ERROR",
        date: new Date().toISOString(),
        actionHref: "/admin/salud",
      });
    }

    const slotTakenList = recentErrors.filter((e) => e.event === "SLOT_TAKEN");
    if (slotTakenList.length > 10) {
      alerts.push({
        id: "alert-warn-slottaken",
        severity: "WARNING",
        title: "Alta Frecuencia de Colisiones de Horario (SLOT_TAKEN)",
        reason: `Se produjeron ${slotTakenList.length} intentos de reserva concurrentes sobre slots ocupados.`,
        category: "ERROR",
        date: new Date().toISOString(),
        actionHref: "/admin/salud",
      });
    }

    // 3. Hitos Positivos (INFO)
    const newTenantsCount = tenants.filter((t) => t.createdAt >= thirtyDaysAgo).length;
    if (newTenantsCount > 0) {
      alerts.push({
        id: "alert-info-new-tenants",
        severity: "INFO",
        title: `${newTenantsCount} Nuevos Negocios Registrados`,
        reason: "Comercios incorporados a la plataforma en los últimos 30 días.",
        category: "MILESTONE",
        date: new Date().toISOString(),
        actionHref: "/admin/negocios",
      });
    }

    const counts = {
      total: alerts.length,
      critical: alerts.filter((a) => a.severity === "CRITICAL").length,
      warning: alerts.filter((a) => a.severity === "WARNING").length,
      info: alerts.filter((a) => a.severity === "INFO").length,
    };

    return NextResponse.json({
      ok: true,
      counts,
      alerts,
      summary: {
        inactiveTenantsCount,
        unconfiguredTenantsCount,
        configuredNoBookingCount,
      },
    });
  } catch (error) {
    console.error("Error en GET /api/admin/alerts:", error);
    return NextResponse.json(
      { ok: false, error: "SERVER_ERROR", message: "Error al consultar centro de alertas." },
      { status: 500 }
    );
  }
}
