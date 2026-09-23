import type { ReactNode } from "react";
import ChatwootWidget from "@/components/public/ChatwootWidget";
import { prisma } from "@/lib/db";
import { chatwootWebsiteTokenFromSettings } from "@/lib/scheduling/tenant-settings";
import { parseTheme, themeStyle, googleFontHref } from "@/lib/theme";

export default async function ReservarLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ tenant: string }>;
}) {
  const { tenant: slug } = await params;
  const tenant = await prisma.tenant.findUnique({
    where: { subdomain: slug },
    select: { themeSettings: true, settings: true },
  });
  const theme = parseTheme(tenant?.themeSettings);
  const chatwootToken = chatwootWebsiteTokenFromSettings(tenant?.settings);
  const fontLink = googleFontHref(theme.fontFamily);

  const isDark =
    theme.themeMode === "dark" ||
    theme.themePreset === "barber-dark" ||
    theme.themePreset === "obsidian-gold" ||
    theme.themePreset === "cyber-noir";

  return (
    <div
      className={`min-h-dvh transition-colors duration-300 ${isDark ? "dark bg-slate-950 text-slate-100" : "bg-[#f8fafc] text-slate-900"}`}
      style={themeStyle(theme)}
    >
      {/* Carga dinámica del Google Font seleccionado por el negocio */}
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link rel="stylesheet" href={fontLink} />
      {children}
      {chatwootToken ? <ChatwootWidget token={chatwootToken} /> : null}
    </div>
  );
}
