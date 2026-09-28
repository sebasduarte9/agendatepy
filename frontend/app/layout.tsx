import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#090d16" },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL("https://agendatepy.com"),
  title: {
    default: "AgendatePY — Sistema de Turnos Online y WhatsApp para Paraguay",
    template: "%s | AgendatePY",
  },
  description:
    "Asistente de turnos online y agenda digital con WhatsApp para peluquerías, barberías, spas y consultorios en Paraguay. Recordatorios automáticos, confirmación en 1 toque y cobro en Guaraníes.",
  keywords: [
    "turnos online paraguay",
    "agenda whatsapp paraguay",
    "software barberia paraguay",
    "agenda peluqueria asuncion",
    "recordatorios whatsapp paraguay",
    "sistema turnos guarani",
    "agendatepy",
  ],
  authors: [{ name: "AgendatePY" }],
  creator: "AgendatePY",
  openGraph: {
    type: "website",
    locale: "es_PY",
    url: "https://agendatepy.com",
    title: "AgendatePY — Duplica tus citas con WhatsApp y Turnos Online",
    description:
      "Eliminá los turnos vacíos con recordatorios automáticos por WhatsApp y cobro en Guaraníes. Probá 14 días gratis sin tarjeta.",
    siteName: "AgendatePY",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "AgendatePY - Sistema de Turnos Online y WhatsApp para Paraguay",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AgendatePY — Turnos Online y WhatsApp para Paraguay",
    description:
      "Asistente digital y agenda con WhatsApp para negocios en Paraguay. Recordatorios automáticos y cobro en Guaraníes.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/logo.svg",
    shortcut: "/logo.svg",
    apple: "/logo.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${jakarta.variable} h-full scroll-smooth`} data-scroll-behavior="smooth">
      <body className="min-h-full flex flex-col font-sans antialiased">{children}</body>
    </html>
  );
}
