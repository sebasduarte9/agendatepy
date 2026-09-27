import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireTenantSession, isGuardError } from "@/lib/api-guard";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const auth = await requireTenantSession(request);
    if (isGuardError(auth)) return auth;

    const services = await prisma.service.findMany({
      where: { tenantId: auth.tenantId },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ ok: true, services });
  } catch (error) {
    console.error("Error en GET /api/services:", error);
    return NextResponse.json(
      { ok: false, error: "DB_UNAVAILABLE", message: "Error al consultar servicios." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireTenantSession(request, ["OWNER", "SUPERADMIN"]);
    if (isGuardError(auth)) return auth;

    const body = await request.json();
    const { name, durationMinutes, price, active } = body;

    if (!name || typeof name !== "string" || name.trim().length < 2) {
      return NextResponse.json(
        { ok: false, error: "VALIDATION_ERROR", message: "Nombre de servicio inválido." },
        { status: 400 }
      );
    }

    const duration = Number(durationMinutes ?? body.durationMin ?? 45);
    if (!Number.isInteger(duration) || duration < 5 || duration > 480) {
      return NextResponse.json(
        { ok: false, error: "VALIDATION_ERROR", message: "La duración debe ser entre 5 y 480 minutos." },
        { status: 400 }
      );
    }

    const priceNum = Number(price);
    if (Number.isNaN(priceNum) || priceNum < 0) {
      return NextResponse.json(
        { ok: false, error: "VALIDATION_ERROR", message: "Precio inválido en Guaraníes." },
        { status: 400 }
      );
    }

    // Transacción para crear servicio y asociarlo al staff activo del tenant
    const newService = await prisma.$transaction(async (tx) => {
      const created = await tx.service.create({
        data: {
          tenantId: auth.tenantId,
          name: name.trim(),
          durationMinutes: duration,
          price: Math.round(priceNum),
          active: active !== false,
        },
      });

      // Asociar a todos los colaboradores del tenant para que sea inmediatamente reservable
      const staffMembers = await tx.staff.findMany({
        where: { tenantId: auth.tenantId, active: true },
        select: { id: true },
      });

      if (staffMembers.length > 0) {
        await tx.staffService.createMany({
          data: staffMembers.map((st) => ({
            staffId: st.id,
            serviceId: created.id,
          })),
          skipDuplicates: true,
        });
      }

      return created;
    });

    return NextResponse.json({ ok: true, service: newService }, { status: 201 });
  } catch (error) {
    console.error("Error en POST /api/services:", error);
    return NextResponse.json(
      { ok: false, error: "DB_UNAVAILABLE", message: "No se pudo crear el servicio." },
      { status: 500 }
    );
  }
}
