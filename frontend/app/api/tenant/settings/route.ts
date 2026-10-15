import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireTenantSession, isGuardError } from "@/lib/api-guard";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const auth = await requireTenantSession(request);
    if (isGuardError(auth)) return auth;

    const tenant = await prisma.tenant.findUnique({
      where: { id: auth.tenantId },
      select: {
        id: true,
        name: true,
        slug: true,
        subdomain: true,
        timezone: true,
        plan: true,
        settings: true,
        themeSettings: true,
      },
    });

    if (!tenant) {
      return NextResponse.json(
        { ok: false, error: "NOT_FOUND", message: "Negocio no encontrado." },
        { status: 404 }
      );
    }

    const settings = (tenant.settings as Record<string, any>) || {};

    return NextResponse.json({
      ok: true,
      business: {
        id: tenant.id,
        name: tenant.name,
        slug: tenant.slug,
        subdomain: tenant.subdomain,
        timezone: tenant.timezone,
        plan: tenant.plan.toLowerCase(),
        phone: settings.phone || settings.whatsappPhone || "",
        whatsappNumber: settings.whatsappPhone || "",
        address: settings.address || "",
        openingTime: settings.openingTime || "08:00",
        closingTime: settings.closingTime || "20:00",
        weekendClosing: settings.weekendClosing || "21:00",
        sundayOpen: Boolean(settings.sundayOpen),
        openingCash: settings.openingCash ?? 300000,
        primaryColor: settings.dashboardColor || "#ff4f2b",
        logoUrl: ((tenant.themeSettings as Record<string, unknown> | null)?.logoUrl as string) || "",
        acceptedPaymentMethods: settings.acceptedPaymentMethods || [
          "efectivo",
          "pos",
          "transferencia",
          "billetera",
          "qr",
        ],
        settings,
      },
    });
  } catch (error) {
    console.error("Error en GET /api/tenant/settings:", error);
    return NextResponse.json(
      { ok: false, error: "DB_UNAVAILABLE", message: "Error al consultar configuración." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const auth = await requireTenantSession(request, ["OWNER", "SUPERADMIN", "STAFF"]);
    if (isGuardError(auth)) return auth;

    const currentTenant = await prisma.tenant.findUnique({
      where: { id: auth.tenantId },
      select: { id: true, name: true, settings: true },
    });

    if (!currentTenant) {
      return NextResponse.json(
        { ok: false, error: "NOT_FOUND", message: "Negocio no encontrado." },
        { status: 404 }
      );
    }

    const body = await request.json();
    const {
      name,
      phone,
      whatsappNumber,
      address,
      openingTime,
      closingTime,
      weekendClosing,
      sundayOpen,
      openingCash,
      acceptedPaymentMethods,
      settings: customSettings,
    } = body;

    // Business identity and policies are owner-only; staff may still update operational settings (loyalty, templates, cash)
    const OWNER_ONLY_FIELDS = ["name", "phone", "whatsappNumber", "address", "timezone", "primaryColor", "openingTime", "closingTime", "weekendClosing", "sundayOpen", "acceptedPaymentMethods"];
    if (auth.session.role === "STAFF" && OWNER_ONLY_FIELDS.some((key) => body[key] !== undefined)) {
      return NextResponse.json(
        { ok: false, error: "FORBIDDEN", message: "Solo el dueño puede cambiar los datos del negocio." },
        { status: 403 }
      );
    }

    const HHMM = /^([01]\d|2[0-3]):[0-5]\d$/;
    for (const key of ["openingTime", "closingTime", "weekendClosing"] as const) {
      if (body[key] !== undefined && !HHMM.test(String(body[key]))) {
        return NextResponse.json(
          { ok: false, error: "VALIDATION_ERROR", message: "Los horarios deben tener el formato HH:MM." },
          { status: 400 }
        );
      }
    }

    const updateData: any = {};
    if (name && typeof name === "string" && name.trim().length >= 2) {
      updateData.name = name.trim();
    }

    if (typeof body.timezone === "string" && body.timezone.trim()) {
      try {
        new Intl.DateTimeFormat("es-PY", { timeZone: body.timezone.trim() });
        updateData.timezone = body.timezone.trim();
      } catch {
        return NextResponse.json(
          { ok: false, error: "VALIDATION_ERROR", message: "Zona horaria inválida." },
          { status: 400 }
        );
      }
    }

    const existingSettings = (currentTenant.settings as Record<string, any>) || {};
    const mergedSettings: Record<string, any> = {
      ...existingSettings,
      ...(customSettings || {}),
    };
    if (customSettings?.evolutionConfig && typeof customSettings.evolutionConfig === "object") {
      mergedSettings.evolutionConfig = {
        ...(existingSettings.evolutionConfig || {}),
        ...customSettings.evolutionConfig,
      };
    }

    if (phone !== undefined) mergedSettings.phone = String(phone).trim();
    if (whatsappNumber !== undefined) mergedSettings.whatsappPhone = String(whatsappNumber).replace(/\D/g, "");
    if (address !== undefined) mergedSettings.address = String(address).trim();
    if (openingTime !== undefined) mergedSettings.openingTime = String(openingTime).trim();
    if (closingTime !== undefined) mergedSettings.closingTime = String(closingTime).trim();
    if (weekendClosing !== undefined) mergedSettings.weekendClosing = String(weekendClosing).trim();
    if (sundayOpen !== undefined) mergedSettings.sundayOpen = Boolean(sundayOpen);
    if (openingCash !== undefined) mergedSettings.openingCash = Number(openingCash);
    // Dashboard accent color (the public page color lives in themeSettings)
    if (typeof body.primaryColor === "string" && /^#[0-9a-f]{6}$/i.test(body.primaryColor)) {
      mergedSettings.dashboardColor = body.primaryColor.toLowerCase();
    }
    if (acceptedPaymentMethods !== undefined && Array.isArray(acceptedPaymentMethods)) {
      mergedSettings.acceptedPaymentMethods = acceptedPaymentMethods;
    }
    if (body.loyalty !== undefined) {
      mergedSettings.loyalty = body.loyalty;
    } else if (customSettings?.loyalty !== undefined) {
      mergedSettings.loyalty = customSettings.loyalty;
    }
    if (body.whatsappTemplates !== undefined) {
      mergedSettings.whatsappTemplates = body.whatsappTemplates;
    } else if (customSettings?.whatsappTemplates !== undefined) {
      mergedSettings.whatsappTemplates = customSettings.whatsappTemplates;
    }

    updateData.settings = mergedSettings;

    const updated = await prisma.tenant.update({
      where: { id: auth.tenantId },
      data: updateData,
    });

    return NextResponse.json({
      ok: true,
      message: "Configuración actualizada correctamente.",
      tenant: {
        id: updated.id,
        name: updated.name,
        settings: updated.settings,
      },
    });
  } catch (error) {
    console.error("Error en PATCH /api/tenant/settings:", error);
    return NextResponse.json(
      { ok: false, error: "DB_UNAVAILABLE", message: "Error al guardar configuración." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const auth = await requireTenantSession(request, ["OWNER", "SUPERADMIN"]);
    if (isGuardError(auth)) return auth;

    // Ejecución transaccional para limpiar appointments (onDelete: Restrict) y tenant
    await prisma.$transaction([
      prisma.appointment.deleteMany({ where: { tenantId: auth.tenantId } }),
      prisma.tenant.delete({ where: { id: auth.tenantId } }),
    ]);

    const response = NextResponse.json({
      ok: true,
      message: "Tu negocio y cuenta han sido eliminados de forma definitiva.",
    });

    // Revocar cookie de sesión
    response.cookies.set("agendatepy_session", "", {
      path: "/",
      maxAge: 0,
      httpOnly: true,
      sameSite: "lax",
    });

    return response;
  } catch (error) {
    console.error("Error en DELETE /api/tenant/settings:", error);
    return NextResponse.json(
      { ok: false, error: "DELETE_FAILED", message: "No se pudo eliminar el negocio." },
      { status: 500 }
    );
  }
}
