import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
});

const coolvetica = localFont({
  src: "../public/fonts/coolvetica/coolvetica-rg.otf",
  variable: "--font-coolvetica",
  display: "swap",
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

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "AgendatePY — Sistema de Turnos Online y WhatsApp para Paraguay",
    "alternateName": ["AgendatePY", "Agendate PY", "App Turnos Paraguay"],
    "applicationCategory": "BusinessApplication",
    "applicationSubCategory": "Scheduling Software",
    "operatingSystem": "Web, iOS, Android",
    "url": "https://agendatepy.com",
    "description":
      "Sistema de turnos online y agenda digital con WhatsApp para peluquerías, barberías, spas y consultorios en Paraguay. Recordatorios automáticos y cobro en Guaraníes.",
    "offers": {
      "@type": "Offer",
      "price": "100000",
      "priceCurrency": "PYG",
      "availability": "https://schema.org/InStock",
    },
    "inLanguage": "es-PY",
    "availableOnDevice": ["Desktop", "Mobile", "Tablet"],
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "¿Qué es AgendatePY y para qué tipo de negocios sirve en Paraguay?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "AgendatePY es la plataforma de agendamiento online y asistente por WhatsApp creada para negocios en Paraguay: peluquerías, barberías, salones de belleza, spas, consultorios médicos, odontología, canchas deportivas y profesionales independientes.",
        },
      },
      {
        "@type": "Question",
        "name": "¿AgendatePY cobra alguna comisión por mis reservas o ventas?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "No. En AgendatePY cobramos 0% de comisión sobre tus servicios, turnos o cobros. Pagás una suscripción mensual fija en Guaraníes y el 100% de lo que factura tu negocio va íntegro a tu cuenta bancaria.",
        },
      },
      {
        "@type": "Question",
        "name": "¿Mis clientes necesitan descargar alguna app para reservar?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "No. Tus clientes acceden a tu enlace web personalizado o reservan conversando por WhatsApp. Sin descargar nada ni crear contraseñas.",
        },
      },
      {
        "@type": "Question",
        "name": "¿Qué medios de pago puedo ofrecer a mis clientes en Paraguay?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Podés recibir transferencias bancarias SIPAP con confirmación por comprobante, cobros con QR Bancard o billeteras (Tigo Money, Personal Pay), o simplemente cobro presencial en efectivo o POS al momento de atenderlos.",
        },
      },
    ],
  },
];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${jakarta.variable} ${coolvetica.variable} h-full scroll-smooth`} data-scroll-behavior="smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col font-sans antialiased">{children}</body>
    </html>
  );
}
