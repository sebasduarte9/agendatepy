import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireTenantSession, isGuardError } from "@/lib/api-guard";

export const dynamic = "force-dynamic";

const DEFAULT_CATEGORIES = [
  "Peluquería",
  "Barbería",
  "Color",
  "Tratamiento",
  "Estética",
  "Manicura & Pedicura",
];

export async function GET(request: NextRequest) {
  try {
    const auth = await requireTenantSession(request);
    if (isGuardError(auth)) return auth;

    const tenant = await prisma.tenant.findUnique({
      where: { id: auth.tenantId },
      select: { settings: true },
    });

    const settings = (tenant?.settings as Record<string, any>) || {};
    const savedCategories: string[] = Array.isArray(settings.serviceCategories)
      ? settings.serviceCategories
      : [];

    // Merge default categories with custom saved categories
    const categorySet = new Set<string>(DEFAULT_CATEGORIES);
    savedCategories.forEach((c) => {
      if (typeof c === "string" && c.trim()) categorySet.add(c.trim());
    });

    return NextResponse.json({
      ok: true,
      categories: Array.from(categorySet),
    });
  } catch (error) {
    console.error("Error en GET /api/services/categories:", error);
    return NextResponse.json(
      { ok: false, error: "DB_UNAVAILABLE", message: "Error al consultar categorías." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireTenantSession(request, ["OWNER", "SUPERADMIN"]);
    if (isGuardError(auth)) return auth;

    const body = await request.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";

    if (!name || name.length < 2 || name.length > 50) {
      return NextResponse.json(
        { ok: false, error: "VALIDATION_ERROR", message: "Nombre de categoría inválido (2 a 50 caracteres)." },
        { status: 400 }
      );
    }

    const tenant = await prisma.tenant.findUnique({
      where: { id: auth.tenantId },
      select: { settings: true },
    });

    const currentSettings = (tenant?.settings as Record<string, any>) || {};
    const currentCategories: string[] = Array.isArray(currentSettings.serviceCategories)
      ? currentCategoriesFilter(currentSettings.serviceCategories)
      : [...DEFAULT_CATEGORIES];

    // Check if category already exists (case-insensitive)
    const exists = currentCategories.some((c) => c.toLowerCase() === name.toLowerCase());
    const updatedCategories = exists ? currentCategories : [...currentCategories, name];

    if (!exists) {
      await prisma.tenant.update({
        where: { id: auth.tenantId },
        data: {
          settings: {
            ...currentSettings,
            serviceCategories: updatedCategories,
          },
        },
      });
    }

    return NextResponse.json({
      ok: true,
      category: name,
      categories: updatedCategories,
      message: exists ? "La categoría ya existía." : "Categoría guardada correctamente en base de datos.",
    });
  } catch (error) {
    console.error("Error en POST /api/services/categories:", error);
    return NextResponse.json(
      { ok: false, error: "DB_UNAVAILABLE", message: "Error al guardar categoría en base de datos." },
      { status: 500 }
    );
  }
}

function currentCategoriesFilter(list: unknown[]): string[] {
  return list.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
}
