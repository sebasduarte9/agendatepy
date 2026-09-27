import { NextResponse, type NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth/session";
import { parseTheme, DEFAULT_THEME } from "@/lib/theme";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("tenant") || "barberia";

    const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 60);

    const tenant = await prisma.tenant.findFirst({
      where: {
        OR: [{ subdomain: cleanSlug }, { slug: cleanSlug }],
      },
      select: {
        id: true,
        name: true,
        subdomain: true,
        themeSettings: true,
      },
    });

    if (!tenant) {
      return NextResponse.json(
        { ok: false, error: "Tenant not found", theme: DEFAULT_THEME },
        { status: 404 }
      );
    }

    const theme = parseTheme(tenant.themeSettings);
    return NextResponse.json({ ok: true, tenant: tenant.subdomain, theme });
  } catch (error) {
    console.error("Error fetching tenant theme:", error);
    return NextResponse.json(
      { ok: false, error: "Internal error", theme: DEFAULT_THEME },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { ok: false, error: "No autorizado. Inicie sesión para modificar la apariencia." },
        { status: 401 }
      );
    }

    if (session.role !== "OWNER" && session.role !== "SUPERADMIN") {
      return NextResponse.json(
        { ok: false, error: "Permisos insuficientes. Solo administradores pueden cambiar la apariencia." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const rawTheme = body.theme || body;
    const parsedTheme = parseTheme(rawTheme);

    let targetTenantId = session.tenantId;

    // Si es SUPERADMIN y especifica otro tenant
    if (session.role === "SUPERADMIN" && (body.tenantSlug || body.slug)) {
      const explicitSlug = body.tenantSlug || body.slug;
      const explicitTenant = await prisma.tenant.findFirst({
        where: { OR: [{ subdomain: explicitSlug }, { slug: explicitSlug }] },
        select: { id: true },
      });
      if (explicitTenant) {
        targetTenantId = explicitTenant.id;
      }
    }

    if (!targetTenantId) {
      return NextResponse.json(
        { ok: false, error: "Negocio no asociado a la sesión." },
        { status: 403 }
      );
    }

    const tenant = await prisma.tenant.findUnique({
      where: { id: targetTenantId },
      select: { id: true, subdomain: true },
    });

    if (!tenant) {
      return NextResponse.json(
        { ok: false, error: "Negocio no encontrado." },
        { status: 404 }
      );
    }

    const updated = await prisma.tenant.update({
      where: { id: tenant.id },
      data: {
        themeSettings: parsedTheme as unknown as object,
      },
      select: { subdomain: true, themeSettings: true },
    });

    // Revalidar rutas para reflejo instantáneo en caché
    revalidatePath(`/${tenant.subdomain}/reservar`);
    revalidatePath(`/${tenant.subdomain}/reservar`, "layout");
    revalidatePath(`/dashboard/apariencia`);

    return NextResponse.json({
      ok: true,
      message: "Apariencia y diseño guardados correctamente en la base de datos",
      theme: parseTheme(updated.themeSettings),
    });
  } catch (error) {
    console.error("Error saving tenant theme:", error);
    return NextResponse.json(
      { ok: false, error: "Error al guardar el tema en la base de datos" },
      { status: 500 }
    );
  }
}
