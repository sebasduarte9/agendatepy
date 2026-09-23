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

export default async function ReservarPage({ params }: PageProps) {
  const { tenant: slug } = await params;
  const tenant = await prisma.tenant.findUnique({
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

  if (!tenant) notFound();

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
        primaryColor: theme.primaryColor,
        backgroundColor: theme.backgroundColor,
        fontFamily: theme.fontFamily,
        layoutStyle: theme.layoutStyle,
        themeMode: theme.themeMode,
      }}
      services={tenant.services}
    />
  );
}
