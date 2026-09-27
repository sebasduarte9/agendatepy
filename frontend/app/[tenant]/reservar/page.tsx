import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { maxAdvanceDaysFromSettings } from "@/lib/scheduling/tenant-settings";
import { parseTheme } from "@/lib/theme";
import BookingWizard from "@/components/booking/BookingWizard";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ tenant: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { tenant } = await params;
  return { title: `Reservar Cita · ${tenant}` };
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
  {
    id: "d4e5f6a7-b8c9-4d8e-1f2a-3b4c5d6e7f8a",
    name: "Colorimetría / Platinado Express",
    durationMinutes: 90,
    price: 250000,
  },
  {
    id: "e5f6a7b8-c9d0-4e9f-2a3b-4c5d6e7f8a9b",
    name: "Tratamiento Capilar / Detox Anticaída",
    durationMinutes: 45,
    price: 110000,
  },
];

export default async function ReservarPage({ params }: PageProps) {
  const { tenant: slug } = await params;
  let tenant: any = null;

  try {
    tenant = await prisma.tenant.findUnique({
      where: { subdomain: slug },
      select: {
        name: true,
        subdomain: true,
        timezone: true,
        settings: true,
        themeSettings: true,
        services: {
          orderBy: { name: "asc" },
          select: { id: true, name: true, durationMinutes: true, price: true },
        },
      },
    });
  } catch (error) {
    console.warn(`[ReservarPage] Base de datos no disponible para "${slug}", usando demo fallback.`);
  }

  // Fallback demo tenant si no está en la base de datos o si PostgreSQL está fuera de línea
  if (!tenant) {
    tenant = {
      name: slug === "barberia" ? "Barbería Los Muchachos" : slug.charAt(0).toUpperCase() + slug.slice(1),
      subdomain: slug,
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
    };
  }

  const theme = parseTheme(tenant.themeSettings);

  return (
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
      services={tenant.services}
    />
  );
}
