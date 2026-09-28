import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { parseTheme } from "@/lib/theme";
import TarjetaClienteView, { TarjetaDataProps } from "@/components/public/TarjetaClienteView";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ tenant: string; clientId: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { tenant: slug, clientId } = await params;
  try {
    const tenant = await prisma.tenant.findFirst({
      where: { OR: [{ slug }, { subdomain: slug }] },
      select: { name: true },
    });
    const title = tenant?.name
      ? `Tarjeta VIP · ${tenant.name}`
      : `Tarjeta VIP · Socio #${clientId}`;
    return {
      title,
      description: "Tu tarjeta digital de fidelización y beneficios exclusivos.",
    };
  } catch {
    return { title: "Tarjeta Digital VIP" };
  }
}

export default async function TarjetaDigitalClientePage({ params }: PageProps) {
  const { tenant: slug, clientId } = await params;

  let tenantData: any = null;
  let clientData: any = null;

  try {
    tenantData = await prisma.tenant.findFirst({
      where: { OR: [{ slug }, { subdomain: slug }] },
      select: {
        id: true,
        name: true,
        slug: true,
        subdomain: true,
        settings: true,
        themeSettings: true,
      },
    });

    if (tenantData) {
      // Find client in DB if clientId looks like a UUID or valid identifier
      clientData = await prisma.client.findFirst({
        where: { id: clientId, tenantId: tenantData.id },
        select: {
          id: true,
          name: true,
          phone: true,
          points: true,
        },
      });
    }
  } catch (error) {
    console.warn(`[TarjetaPage] DB fetch error for tenant "${slug}":`, error);
  }

  // Graceful fallback if tenant was not found in DB
  const rawTheme = tenantData?.themeSettings || {};
  const parsedTheme = parseTheme(rawTheme);
  const businessName = tenantData?.name || (slug === "barberia" ? "Barbería Los Muchachos" : "AgendatePY Studio");
  const businessPhone =
    (tenantData?.settings as any)?.whatsappPhone ||
    parsedTheme.whatsapp ||
    "+595 981 700 800";

  // Loyalty settings extracted from tenant settings or defaults
  const tenantSettings = (tenantData?.settings as any) || {};
  const loyaltyConfig = tenantSettings.loyalty || {};

  const loyalty: TarjetaDataProps["loyalty"] = {
    enabled: loyaltyConfig.enabled ?? true,
    mode: loyaltyConfig.mode === "points" ? "points" : "stamps",
    rewardThreshold: Number(loyaltyConfig.rewardThreshold) || 5,
    rewardDescription:
      loyaltyConfig.rewardDescription || "50% OFF en tu próximo corte o servicio",
    pointsPerVisit: Number(loyaltyConfig.pointsPerVisit) || 1,
  };

  const client: TarjetaDataProps["client"] = {
    id: clientData?.id || clientId,
    name: clientData?.name || "Cliente VIP",
    phone: clientData?.phone || "+595 981 000 000",
    points: clientData?.points ?? 4,
    totalVisits: clientData?.points ?? 4,
  };

  const tenantProps: TarjetaDataProps["tenant"] = {
    name: businessName,
    slug: tenantData?.slug || tenantData?.subdomain || slug,
    phone: businessPhone,
    logoUrl: parsedTheme.logoUrl || undefined,
    primaryColor: parsedTheme.primaryColor || "#e11d48",
    backgroundColor: parsedTheme.backgroundColor || "#090d16",
    fontFamily: parsedTheme.fontFamily,
  };

  return (
    <TarjetaClienteView
      tenant={tenantProps}
      client={client}
      loyalty={loyalty}
    />
  );
}
