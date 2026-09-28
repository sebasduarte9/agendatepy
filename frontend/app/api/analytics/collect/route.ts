import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { WebEventType } from "@prisma/client";

export const dynamic = "force-dynamic";

// Sanitización estricta para evitar PII
const SENSITIVE_INPUT_TAGS = new Set(["INPUT", "TEXTAREA", "SELECT", "OPTION"]);
const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
const PHONE_REGEX = /\+?[0-9]{6,15}/g;

function sanitizeElementText(text?: string | null, tag?: string | null): string | null {
  if (!text || typeof text !== "string") return null;
  if (tag && SENSITIVE_INPUT_TAGS.has(tag.toUpperCase())) return null;

  let sanitized = text.replace(EMAIL_REGEX, "[EMAIL]").replace(PHONE_REGEX, "[PHONE]").trim();
  if (sanitized.length > 60) {
    sanitized = sanitized.slice(0, 60);
  }
  return sanitized;
}

function detectDeviceType(userAgent?: string | null, width?: number): string {
  const ua = (userAgent || "").toLowerCase();
  if (width && width < 768) return "mobile";
  if (width && width < 1024) return "tablet";
  if (ua.includes("mobile") || ua.includes("android") || ua.includes("iphone")) return "mobile";
  if (ua.includes("ipad") || ua.includes("tablet")) return "tablet";
  return "desktop";
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    if (!rawBody || rawBody.length > 65536) {
      // Protección de tamaño: máx 64KB
      return NextResponse.json(
        { ok: false, error: "PAYLOAD_TOO_LARGE", message: "Payload excede límite." },
        { status: 413 }
      );
    }

    let payload: any;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json(
        { ok: false, error: "INVALID_JSON", message: "Formato JSON inválido." },
        { status: 400 }
      );
    }

    const {
      tenantSlug,
      tenantId: rawTenantId,
      sessionId,
      pagePath,
      viewportWidth = 1280,
      viewportHeight = 800,
      events = [],
    } = payload;

    if (!sessionId || typeof sessionId !== "string") {
      return NextResponse.json(
        { ok: false, error: "VALIDATION_ERROR", message: "sessionId es requerido." },
        { status: 400 }
      );
    }

    if (!pagePath || typeof pagePath !== "string") {
      return NextResponse.json(
        { ok: false, error: "VALIDATION_ERROR", message: "pagePath es requerido." },
        { status: 400 }
      );
    }

    if (!Array.isArray(events)) {
      return NextResponse.json(
        { ok: false, error: "VALIDATION_ERROR", message: "events debe ser un arreglo." },
        { status: 400 }
      );
    }

    // Límite de batch por request
    if (events.length > 100) {
      return NextResponse.json(
        { ok: false, error: "BATCH_LIMIT_EXCEEDED", message: "Máximo 100 eventos por batch." },
        { status: 400 }
      );
    }

    // Limpiar pagePath eliminando query strings y hash potencialmente sensibles
    const cleanPagePath = pagePath.split("?")[0].split("#")[0].slice(0, 200);

    // Resolver Tenant seguro por slug o id
    let tenant = null;
    if (tenantSlug && typeof tenantSlug === "string") {
      tenant = await prisma.tenant.findFirst({
        where: {
          OR: [
            { subdomain: tenantSlug.toLowerCase().trim() },
            { slug: tenantSlug.toLowerCase().trim() },
          ],
        },
        select: { id: true },
      });
    } else if (rawTenantId && typeof rawTenantId === "string") {
      tenant = await prisma.tenant.findUnique({
        where: { id: rawTenantId },
        select: { id: true },
      });
    }

    if (!tenant) {
      return NextResponse.json(
        { ok: false, error: "TENANT_NOT_FOUND", message: "Negocio no identificado." },
        { status: 404 }
      );
    }

    const userAgent = request.headers.get("user-agent") || null;
    const deviceType = detectDeviceType(userAgent, Number(viewportWidth) || 1280);

    // 1. Upsert de la sesión de analítica
    const sessionRecord = await prisma.webAnalyticsSession.upsert({
      where: {
        tenantId_sessionId_pagePath: {
          tenantId: tenant.id,
          sessionId: sessionId.slice(0, 100),
          pagePath: cleanPagePath,
        },
      },
      update: {
        viewportWidth: Math.round(Number(viewportWidth) || 1280),
        viewportHeight: Math.round(Number(viewportHeight) || 800),
        deviceType,
        userAgent: userAgent ? userAgent.slice(0, 255) : null,
      },
      create: {
        tenantId: tenant.id,
        sessionId: sessionId.slice(0, 100),
        pagePath: cleanPagePath,
        viewportWidth: Math.round(Number(viewportWidth) || 1280),
        viewportHeight: Math.round(Number(viewportHeight) || 800),
        deviceType,
        userAgent: userAgent ? userAgent.slice(0, 255) : null,
      },
      select: { id: true },
    });

    // 2. Preparar e insertar eventos en batch
    const validEventsData: Array<{
      tenantId: string;
      sessionId: string;
      sessionRecordId: string;
      eventType: WebEventType;
      pagePath: string;
      x: number;
      y: number;
      scrollDepth: number;
      viewportWidth: number;
      viewportHeight: number;
      elementSelector: string | null;
      elementTag: string | null;
      elementText: string | null;
      metadata: any;
    }> = [];

    for (const ev of events) {
      const typeStr = (ev.eventType || "").toUpperCase();
      if (!Object.values(WebEventType).includes(typeStr as WebEventType)) {
        continue;
      }

      const x = typeof ev.x === "number" ? Math.max(0, Math.min(1, ev.x)) : 0;
      const y = typeof ev.y === "number" ? Math.max(0, Math.min(10, ev.y)) : 0; // hasta 10 páginas de scroll vertical
      const scrollDepth = typeof ev.scrollDepth === "number" ? Math.max(0, Math.min(100, ev.scrollDepth)) : 0;
      const tag = typeof ev.elementTag === "string" ? ev.elementTag.slice(0, 20).toUpperCase() : null;
      const selector = typeof ev.elementSelector === "string" ? ev.elementSelector.slice(0, 150) : null;
      const text = sanitizeElementText(ev.elementText, tag);

      validEventsData.push({
        tenantId: tenant.id,
        sessionId: sessionId.slice(0, 100),
        sessionRecordId: sessionRecord.id,
        eventType: typeStr as WebEventType,
        pagePath: cleanPagePath,
        x,
        y,
        scrollDepth,
        viewportWidth: Math.round(Number(viewportWidth) || 1280),
        viewportHeight: Math.round(Number(viewportHeight) || 800),
        elementSelector: selector,
        elementTag: tag,
        elementText: text,
        metadata: ev.metadata && typeof ev.metadata === "object" ? ev.metadata : {},
      });
    }

    if (validEventsData.length > 0) {
      await prisma.webAnalyticsEvent.createMany({
        data: validEventsData,
      });
    }

    return NextResponse.json({
      ok: true,
      received: events.length,
      saved: validEventsData.length,
    });
  } catch (error: any) {
    console.error("[POST /api/analytics/collect] Error:", error);
    return NextResponse.json(
      { ok: false, error: "SERVER_ERROR", message: "Error al registrar eventos de analítica web." },
      { status: 500 }
    );
  }
}
