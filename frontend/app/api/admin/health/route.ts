import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireSuperAdminSession, isGuardError } from "@/lib/api-guard";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const auth = await requireSuperAdminSession(request);
    if (isGuardError(auth)) return auth;

    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "30d"; // "7d", "30d", "90d", "all"

    const now = new Date();
    let startDate: Date | null = null;
    if (period === "7d") {
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (period === "30d") {
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    } else if (period === "90d") {
      startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    }

    const where: any = {};
    if (startDate) {
      where.createdAt = { gte: startDate };
    }

    // 1. Consultar todos los eventos de plataforma y errores registrados
    const [allEvents, totalEventsCount] = await Promise.all([
      prisma.platformEvent.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: 500,
        select: {
          id: true,
          event: true,
          tenantId: true,
          entityType: true,
          entityId: true,
          metadata: true,
          createdAt: true,
        },
      }),
      prisma.platformEvent.count({ where }),
    ]);

    // 2. Conteo de errores por tipo y código HTTP
    let error401Count = 0;
    let error403Count = 0;
    let error404Count = 0;
    let error409Count = 0;
    let error500Count = 0;
    let slotTakenCount = 0;
    let validationErrorCount = 0;
    let totalErrorsCount = 0;

    const endpointErrorMap: Record<string, { totalErrors: number; statusCodes: Record<number, number> }> = {};

    allEvents.forEach((ev) => {
      const meta = (ev.metadata as any) || {};
      const status = Number(meta.statusCode || meta.status || 0);
      const isError =
        ev.event === "UNAUTHORIZED_ACCESS" ||
        ev.event === "FORBIDDEN_ACCESS" ||
        ev.event === "SLOT_TAKEN" ||
        ev.event === "VALIDATION_ERROR" ||
        ev.event === "API_ERROR" ||
        ev.entityType === "SystemError" ||
        status >= 400;

      if (isError) {
        totalErrorsCount++;

        if (status === 401 || ev.event === "UNAUTHORIZED_ACCESS") error401Count++;
        else if (status === 403 || ev.event === "FORBIDDEN_ACCESS") error403Count++;
        else if (status === 404) error404Count++;
        else if (status === 409 || ev.event === "SLOT_TAKEN") {
          error409Count++;
          slotTakenCount++;
        } else if (status >= 500 || ev.event === "API_ERROR") error500Count++;

        if (ev.event === "VALIDATION_ERROR") validationErrorCount++;

        const ep = meta.endpoint || ev.entityId || "global";
        if (!endpointErrorMap[ep]) {
          endpointErrorMap[ep] = { totalErrors: 0, statusCodes: {} };
        }
        endpointErrorMap[ep].totalErrors++;
        if (status > 0) {
          endpointErrorMap[ep].statusCodes[status] = (endpointErrorMap[ep].statusCodes[status] || 0) + 1;
        }
      }
    });

    const totalMonitoredRequests = Math.max(totalEventsCount, totalErrorsCount);
    const errorRate = totalMonitoredRequests > 0
      ? Number(((totalErrorsCount / totalMonitoredRequests) * 100).toFixed(2))
      : 0;

    // Formatear desglose por endpoint
    const endpointBreakdown = Object.entries(endpointErrorMap).map(([endpoint, data]) => ({
      endpoint,
      totalErrors: data.totalErrors,
      statusCodes: data.statusCodes,
    }));

    return NextResponse.json({
      ok: true,
      period,
      errorRate,
      totalMonitoredRequests,
      errors: {
        total: totalErrorsCount,
        http401: error401Count,
        http403: error403Count,
        http404: error404Count,
        http409: error409Count,
        http500: error500Count,
        slotTaken: slotTakenCount,
        validationErrors: validationErrorCount,
      },
      summary: {
        totalMonitoredRequests,
        totalEventsRecorded: totalEventsCount,
        totalErrors: totalErrorsCount,
        errorRatePercentage: errorRate,
        systemStatus: error500Count > 5 ? "DEGRADED" : "HEALTHY",
      },
      statusCodes: {
        "401": error401Count,
        "403": error403Count,
        "404": error404Count,
        "409": error409Count,
        "500": error500Count,
      },
      errorTypes: {
        unauthorized: error401Count,
        forbidden: error403Count,
        slotTaken: slotTakenCount,
        validationError: validationErrorCount,
        serverError: error500Count,
      },
      endpointBreakdown,
      endpoints: endpointBreakdown,
      recentErrors: allEvents
        .filter((ev) => ev.entityType === "SystemError" || ev.event.includes("ERROR") || ev.event.includes("UNAUTHORIZED"))
        .slice(0, 20),
    });
  } catch (error) {
    console.error("Error en GET /api/admin/health:", error);
    return NextResponse.json(
      { ok: false, error: "SERVER_ERROR", message: "Error al calcular salud del sistema." },
      { status: 500 }
    );
  }
}
