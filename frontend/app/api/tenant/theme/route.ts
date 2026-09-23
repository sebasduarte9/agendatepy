import { NextResponse, type NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { parseTheme, DEFAULT_THEME, type ThemeSettings } from "@/lib/theme";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("tenant") || "barberia";

    const tenant = await prisma.tenant.findFirst({
      where: {
        OR: [{ subdomain: slug }, { slug: slug }],
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
    const body = await request.json();
    const slug = body.tenantSlug || body.slug || "barberia";
    const rawTheme = body.theme || body;

    const parsedTheme = parseTheme(rawTheme);

    const tenant = await prisma.tenant.findFirst({
      where: {
        OR: [{ subdomain: slug }, { slug: slug }],
      },
      select: { id: true, subdomain: true },
    });

    if (!tenant) {
      return NextResponse.json(
        { ok: false, error: `Tenant "${slug}" no encontrado` },
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
    revalidatePath(`/${tenant.subdomain}/admin/apariencia`);
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
