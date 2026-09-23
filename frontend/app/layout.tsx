import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
});

export const metadata: Metadata = {
  title: "AgendatePY — Sistema de Turnos Online y WhatsApp para Paraguay",
  description:
    "Asistente de turnos online y agenda digital con WhatsApp para peluquerías, barberías, spas y consultorios en Paraguay. Recordatorios automáticos, comisiones y cobro en Guaraníes.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${jakarta.variable} h-full scroll-smooth`} data-scroll-behavior="smooth">
      <body className="min-h-full flex flex-col font-sans antialiased">{children}</body>
    </html>
  );
}
