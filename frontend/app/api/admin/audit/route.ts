import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireSuperAdminSession, isGuardError } from "@/lib/api-guard";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const auth = await requireSuperAdminSession(request);
    if (isGuardError(auth)) return auth;

    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get("tenantId");
    const event = searchParams.get("event");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "25", 10)));
    const skip = (page - 1) * limit;

    const where: any = {};
    if (tenantId && tenantId !== "ALL") {
      where.tenantId = tenantId;
    }
    if (event) {
      where.event = event;
    }

    const [total, events] = await Promise.all([
      prisma.platformEvent.count({ where }),
      prisma.platformEvent.findMany({
        where,
        include: {
          tenant: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),
    ]);

    return NextResponse.json({
      ok: true,
      data: events.map((ev) => ({
        id: ev.id,
        event: ev.event,
        tenantId: ev.tenantId,
        tenantName: ev.tenant?.name || "Global / Sin Tenant",
        tenantSlug: ev.tenant?.slug || null,
        entityType: ev.entityType,
        entityId: ev.entityId,
        metadata: ev.metadata,
        createdAt: ev.createdAt.toISOString(),
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (error: any) {
    console.error("[GET /api/admin/audit] Error:", error);
    return NextResponse.json(
      { ok: false, error: "SERVER_ERROR", message: "Error al obtener eventos de auditoría." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireSuperAdminSession(request);
    if (isGuardError(auth)) return auth;

    const body = await request.json();
    const { event, tenantId, entityType, entityId, metadata } = body;

    if (!event || typeof event !== "string") {
      return NextResponse.json(
        { ok: false, error: "VALIDATION_ERROR", message: "El campo 'event' es requerido y debe ser string." },
        { status: 400 }
      );
    }

    // Asegurar que metadata no contenga claves sensibles
    let safeMetadata = metadata;
    if (safeMetadata && typeof safeMetadata === "object") {
      const sanitized = { ...safeMetadata };
      delete (sanitized as any).password;
      delete (sanitized as any).token;
      delete (sanitized as any).secret;
      delete (sanitized as any).cookie;
      safeMetadata = sanitized;
    }

    const createdEvent = await prisma.platformEvent.create({
      data: {
        event,
        tenantId: tenantId || null,
        entityType: entityType || null,
        entityId: entityId || null,
        metadata: safeMetadata || undefined,
      },
    });

    return NextResponse.json({
      ok: true,
      event: createdEvent,
    });
  } catch (error: any) {
    console.error("[POST /api/admin/audit] Error:", error);
    return NextResponse.json(
      { ok: false, error: "SERVER_ERROR", message: "Error al registrar evento de auditoría." },
      { status: 500 }
    );
  }
}
