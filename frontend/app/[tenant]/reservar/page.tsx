import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AlertCircle, Store, Calendar, Phone } from "lucide-react";
import { prisma } from "@/lib/db";
import { maxAdvanceDaysFromSettings } from "@/lib/scheduling/tenant-settings";
import { parseTheme } from "@/lib/theme";
import BookingWizard from "@/components/booking/BookingWizard";
import WebAnalyticsTracker from "@/components/analytics/WebAnalyticsTracker";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ tenant: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { tenant: slug } = await params;
  try {
    const tenant = await prisma.tenant.findUnique({
      where: { subdomain: slug },
      select: { name: true, themeSettings: true },
    });
    if (tenant) {
      const theme = parseTheme(tenant.themeSettings);
      return {
        title: `Reservar Turno · ${tenant.name}`,
        description:
          theme.bio ||
          theme.slogan ||
          `Agendá tu turno online en ${tenant.name} en 30 segundos.`,
        openGraph: {
          title: `Reservar en ${tenant.name}`,
          description:
            theme.bio ||
            theme.slogan ||
            `Turnos online 24/7 en ${tenant.name}`,
        },
      };
    }
  } catch (error) {
    console.warn(`[ReservarPage.metadata] Error leyendo tenant "${slug}":`, error);
  }
  return { title: `Reservar Cita · ${slug}` };
}

const DEMO_SERVICES = [
  {
    id: "a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d",
    name: "Corte Clásico / Fade",
    durationMinutes: 35,
    price: 80000,
  },
  {
    id: "b2c3d4e5-f6a7-4b6c-9d0e-1f2a3b4c5d6e",
    name: "Combo Corte + Barba VIP",
    durationMinutes: 60,
    price: 120000,
  },
  {
    id: "c3d4e5f6-a7b8-4c7d-0e1f-2a3b4c5d6e7f",
    name: "Perfilado de Barba & Toalla Caliente",
    durationMinutes: 30,
    price: 55000,
  },
];

export default async function ReservarPage({ params }: PageProps) {
  const { tenant: slug } = await params;
  let tenant: any = null;

  try {
    tenant = await prisma.tenant.findUnique({
      where: { subdomain: slug },
      select: {
        id: true,
        name: true,
        slug: true,
        subdomain: true,
        status: true,
        timezone: true,
        settings: true,
        themeSettings: true,
        services: {
          where: { active: true },
          orderBy: { name: "asc" },
          select: { id: true, name: true, durationMinutes: true, price: true, active: true },
        },
        staff: {
          where: { active: true },
          select: { id: true, name: true },
        },
        products: {
          where: { isActive: true },
          orderBy: { name: "asc" },
          select: {
            id: true,
            name: true,
            price: true,
            cost: true,
            stock: true,
            category: true,
            description: true,
            imageUrl: true,
            isActive: true,
          },
        },
      },
    });
  } catch (error) {
    console.warn(`[ReservarPage] Base de datos no disponible para "${slug}", usando demo fallback si aplica.`);
  }

  // Fallback demo SOLO para la ruta explícita "barberia"
  if (!tenant) {
    if (slug === "barberia") {
      tenant = {
        name: "Barbería Los Muchachos (Demo)",
        subdomain: "barberia",
        status: "ACTIVE",
        timezone: "America/Asuncion",
        settings: {
          whatsappPhone: "595981700800",
          slotStepMinutes: 30,
          maxAdvanceDays: 30,
        },
        themeSettings: {
          primaryColor: "#FF4F2B",
          backgroundColor: "#090d16",
          fontFamily: "outfit",
          themePreset: "barber-dark",
          themeMode: "dark",
          bio: "Cortes clásicos, degradados modernos, perfilado de barba con toalla caliente y atención de primera en Asunción.",
          slogan: "Estilo y distinción para el hombre moderno",
          instagram: "barberia_losmuchachos",
          whatsapp: "595981700800",
          logoUrl: "",
        },
        services: DEMO_SERVICES,
        staff: [{ id: "demo-staff-1", name: "Marcos Barbero" }],
      };
    } else {
      notFound();
    }
  }

  // ESTADO B: Negocio Pausado o Desactivado
  if (tenant.status === "PAUSED" || tenant.status === "SUSPENDED") {
    return (
      <div className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center p-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-amber-500/10 text-amber-500 mb-4">
          <Store className="h-8 w-8" />
        </div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">
          {tenant.name}
        </h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          Este local no está recibiendo reservas en línea temporalmente.
        </p>
        <div className="mt-6">
          <Link
            href="/"
            className="inline-flex items-center rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-2.5 text-xs font-semibold hover:opacity-90 transition"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  // ESTADO C: Negocio sin servicios activos publicados
  if (!tenant.services || tenant.services.length === 0) {
    return (
      <div className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center p-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-primary/10 text-primary mb-4">
          <Calendar className="h-8 w-8" />
        </div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">
          {tenant.name}
        </h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          Actualmente el negocio está actualizando su catálogo de servicios. Volvé a consultar en unos minutos.
        </p>
        <div className="mt-6 flex flex-col gap-2 w-full">
          <Link
            href="/"
            className="rounded-xl border border-slate-200 dark:border-slate-800 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition"
          >
            Ir a AgendatePY
          </Link>
        </div>
      </div>
    );
  }

  // ESTADO D: Negocio sin colaboradores activos
  if (!tenant.staff || tenant.staff.length === 0) {
    return (
      <div className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center p-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-blue-500/10 text-blue-500 mb-4">
          <AlertCircle className="h-8 w-8" />
        </div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">
          {tenant.name}
        </h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          No hay profesionales disponibles en este momento. Podés contactar directamente al comercio para coordinar tu atención.
        </p>
      </div>
    );
  }

  const theme = parseTheme(tenant.themeSettings);

  const tenantSettings = (tenant.settings as Record<string, any>) || {};
  const serviceExtras = (tenantSettings.serviceExtras as Record<string, any>) || {};

  const enrichedServices = (tenant.services || []).map((s: any) => {
    const extra = serviceExtras[s.id] || {};
    return {
      ...s,
      category: extra.category || s.category,
      hasPromo: Boolean(extra.hasPromo),
      promoPrice: extra.promoPrice !== undefined ? Number(extra.promoPrice) : undefined,
      promoBadge: extra.promoBadge || undefined,
      promoDisplayType: extra.promoDisplayType || undefined,
      promoType: extra.promoType || undefined,
      promoLimitHours: extra.promoLimitHours !== undefined ? Number(extra.promoLimitHours) : undefined,
      promoLimitQuantity: extra.promoLimitQuantity !== undefined ? Number(extra.promoLimitQuantity) : undefined,
      requirePrepayment: Boolean(extra.requirePrepayment),
      prepaymentType: extra.prepaymentType || undefined,
      prepaymentAmount: extra.prepaymentAmount !== undefined ? Number(extra.prepaymentAmount) : undefined,
      prepaymentMethod: extra.prepaymentMethod || undefined,
      prepaymentInstructions: extra.prepaymentInstructions || undefined,
    };
  });

  return (
    <>
    <BookingWizard
      tenant={{
        slug: tenant.subdomain,
        name: tenant.name,
        timezone: tenant.timezone,
        maxAdvanceDays: maxAdvanceDaysFromSettings(tenant.settings),
        logoUrl: theme.logoUrl,
        bannerUrl: theme.bannerUrl,
        galleryUrls: theme.galleryUrls,
        bio: theme.bio,
        slogan: theme.slogan,
        instagram: theme.instagram,
        whatsapp: theme.whatsapp,
        tiktok: theme.tiktok,
        facebook: theme.facebook,
        googleMapsUrl: theme.googleMapsUrl,
        bookingNotice: theme.bookingNotice,
        themePreset: theme.themePreset,
        buttonRadius: theme.buttonRadius,
        buttonStyle: theme.buttonStyle,
        buttonShadow: theme.buttonShadow,
        buttonTextSize: theme.buttonTextSize,
        buttonFontFamily: theme.buttonFontFamily,
        titleSize: theme.titleSize,
        backgroundEffect: theme.backgroundEffect,
        customLinks: theme.customLinks,
        primaryColor: theme.primaryColor,
        backgroundColor: theme.backgroundColor,
        fontFamily: theme.fontFamily,
        layoutStyle: theme.layoutStyle,
        themeMode: theme.themeMode,
        buttonCustomBg: theme.buttonCustomBg,
        buttonCustomText: theme.buttonCustomText,
        buttonCustomBorder: theme.buttonCustomBorder,
        buttonBorderWidth: theme.buttonBorderWidth,
        buttonHeight: theme.buttonHeight,
        buttonAlignment: theme.buttonAlignment,
        buttonTextTransform: theme.buttonTextTransform,
        buttonFontWeight: theme.buttonFontWeight,
        sectionOrder: theme.sectionOrder,
        avatarShape: theme.avatarShape,
        avatarBorder: theme.avatarBorder,
      }}
      services={enrichedServices}
      products={tenant.products}
    />
    <WebAnalyticsTracker tenantSlug={tenant.subdomain || tenant.slug} pagePath={`/${tenant.subdomain || tenant.slug}/reservar`} />
    </>
  );
}
