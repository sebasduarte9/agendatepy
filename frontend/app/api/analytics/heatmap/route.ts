import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireTenantSession, isGuardError } from "@/lib/api-guard";
import { WebEventType } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const auth = await requireTenantSession(request);
    if (isGuardError(auth)) return auth;

    const tenantId = auth.tenantId;
    const { searchParams } = new URL(request.url);
    const pagePath = searchParams.get("pagePath") || "all";
    const period = searchParams.get("period") || "30d"; // 7d, 30d, 90d
    const deviceType = (searchParams.get("deviceType") || "all").toLowerCase(); // all, desktop, mobile, tablet

    const now = new Date();
    let periodDays = 30;
    if (period === "7d") periodDays = 7;
    else if (period === "90d") periodDays = 90;

    const startDate = new Date(now.getTime() - periodDays * 24 * 60 * 60 * 1000);

    // Filter conditions for Sessions and Events - STRICTLY ISOLATED TO auth.tenantId
    const sessionWhere: any = {
      tenantId,
      createdAt: { gte: startDate },
    };
    if (pagePath !== "all") sessionWhere.pagePath = pagePath;
    if (deviceType !== "all") sessionWhere.deviceType = deviceType;

    const eventWhere: any = {
      tenantId,
      createdAt: { gte: startDate },
    };
    if (pagePath !== "all") eventWhere.pagePath = pagePath;
    if (deviceType !== "all") {
      eventWhere.session = { deviceType };
    }

    // 1. Available pages list for tenant
    const distinctPages = await prisma.webAnalyticsSession.groupBy({
      by: ["pagePath"],
      where: { tenantId },
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 20,
    });

    const availablePages = distinctPages.map((p) => ({
      path: p.pagePath,
      count: p._count.id,
    }));

    // 2. Count total sessions
    const totalSessions = await prisma.webAnalyticsSession.count({
      where: sessionWhere,
    });

    // 3. Count events by type
    const eventCounts = await prisma.webAnalyticsEvent.groupBy({
      by: ["eventType"],
      where: eventWhere,
      _count: { id: true },
    });

    let totalClicks = 0;
    let totalMoves = 0;
    let totalScrolls = 0;

    eventCounts.forEach((ec) => {
      if (ec.eventType === WebEventType.CLICK) totalClicks = ec._count.id;
      else if (ec.eventType === WebEventType.MOUSE_MOVE) totalMoves = ec._count.id;
      else if (ec.eventType === WebEventType.SCROLL) totalScrolls = ec._count.id;
    });

    // 4. Device breakdown
    const deviceGroups = await prisma.webAnalyticsSession.groupBy({
      by: ["deviceType"],
      where: sessionWhere,
      _count: { id: true },
    });

    const deviceBreakdown = {
      desktop: 0,
      mobile: 0,
      tablet: 0,
    };
    deviceGroups.forEach((dg) => {
      const d = (dg.deviceType || "desktop").toLowerCase();
      if (d in deviceBreakdown) {
        deviceBreakdown[d as keyof typeof deviceBreakdown] = dg._count.id;
      }
    });

    // 5. Scroll depth analytics
    const scrollEvents = await prisma.webAnalyticsEvent.findMany({
      where: {
        ...eventWhere,
        eventType: WebEventType.SCROLL,
      },
      select: { scrollDepth: true },
      take: 2000,
    });

    let avgScrollDepth = 0;
    const scrollDistribution = {
      "0-25": 0,
      "25-50": 0,
      "50-75": 0,
      "75-100": 0,
    };

    if (scrollEvents.length > 0) {
      const sum = scrollEvents.reduce((acc, curr) => acc + (curr.scrollDepth || 0), 0);
      avgScrollDepth = Math.round(sum / scrollEvents.length);

      scrollEvents.forEach((se) => {
        const d = se.scrollDepth || 0;
        if (d <= 25) scrollDistribution["0-25"]++;
        else if (d <= 50) scrollDistribution["25-50"]++;
        else if (d <= 75) scrollDistribution["50-75"]++;
        else scrollDistribution["75-100"]++;
      });
    }

    // 6. Click points
    const clickEvents = await prisma.webAnalyticsEvent.findMany({
      where: {
        ...eventWhere,
        eventType: WebEventType.CLICK,
      },
      select: {
        id: true,
        x: true,
        y: true,
        scrollDepth: true,
        viewportWidth: true,
        viewportHeight: true,
        elementSelector: true,
        elementTag: true,
        elementText: true,
        metadata: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      take: 1000,
    });

    const clickPoints = clickEvents.map((c) => {
      const meta = (c.metadata as any) || {};
      const normX = meta.normX !== undefined ? meta.normX : c.viewportWidth ? c.x / c.viewportWidth : 0.5;
      const normY = meta.normY !== undefined ? meta.normY : c.viewportHeight ? c.y / c.viewportHeight : 0.5;
      return {
        x: c.x,
        y: c.y,
        normX,
        normY,
        viewportWidth: c.viewportWidth,
        viewportHeight: c.viewportHeight,
        elementSelector: c.elementSelector,
        elementTag: c.elementTag,
        elementText: c.elementText,
      };
    });

    // 7. Mouse move sampled points
    const moveEvents = await prisma.webAnalyticsEvent.findMany({
      where: {
        ...eventWhere,
        eventType: WebEventType.MOUSE_MOVE,
      },
      select: {
        x: true,
        y: true,
        viewportWidth: true,
        viewportHeight: true,
        metadata: true,
      },
      orderBy: { createdAt: "desc" },
      take: 300,
    });

    const movePoints = moveEvents.map((m) => {
      const meta = (m.metadata as any) || {};
      const normX = meta.normX !== undefined ? meta.normX : m.viewportWidth ? m.x / m.viewportWidth : 0.5;
      const normY = meta.normY !== undefined ? meta.normY : m.viewportHeight ? m.y / m.viewportHeight : 0.5;
      return {
        x: m.x,
        y: m.y,
        normX,
        normY,
      };
    });

    // 8. Top clicked elements
    const elementClickMap = new Map<string, { tag: string; selector: string; text: string; count: number }>();
    clickEvents.forEach((c) => {
      const key = `${c.elementTag || "el"}-${c.elementSelector || "unknown"}-${(c.elementText || "").slice(0, 30)}`;
      const existing = elementClickMap.get(key);
      if (existing) {
        existing.count++;
      } else {
        elementClickMap.set(key, {
          tag: c.elementTag || "element",
          selector: c.elementSelector || "",
          text: c.elementText || "",
          count: 1,
        });
      }
    });

    const topElements = Array.from(elementClickMap.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return NextResponse.json({
      ok: true,
      period,
      tenantId,
      pagePath,
      deviceType,
      stats: {
        totalSessions,
        totalClicks,
        totalMoves,
        totalScrolls,
        avgScrollDepth,
        scrollDistribution,
        deviceBreakdown,
      },
      availablePages,
      topElements,
      clickPoints,
      movePoints,
      generatedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("[GET /api/analytics/heatmap] Error:", error);
    return NextResponse.json(
      { ok: false, error: "SERVER_ERROR", message: "Error al generar mapa de calor del negocio." },
      { status: 500 }
    );
  }
}
