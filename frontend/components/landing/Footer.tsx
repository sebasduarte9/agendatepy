import Link from "next/link";
import { ExternalLink } from "lucide-react";
import BrandLogo from "@/components/ui/BrandLogo";

const COLUMNS = [
  {
    title: "Producto",
    links: [
      { label: "Características", href: "#caracteristicas" },
      { label: "Cómo funciona", href: "#como-funciona" },
      { label: "Calculadora de Ahorro", href: "#calculadora" },
      { label: "Precios", href: "#precios" },
      { label: "Galería de Diseños", href: "/showcase" },
      { label: "Web de Reservas", href: "/barberia/reservar" },
      { label: "Panel de Control", href: "/dashboard" },
    ],
  },
  {
    title: "Módulos",
    links: [
      { label: "Caja y Arqueo", href: "/dashboard/caja" },
      { label: "Comisiones de Equipo", href: "/dashboard/comisiones" },
      { label: "Club de Fidelización", href: "/dashboard/fidelizacion" },
      { label: "WhatsApp Cloud API", href: "/dashboard/whatsapp" },
      { label: "Personalizador de Marca", href: "/dashboard/apariencia" },
      { label: "Catálogo de Servicios", href: "/dashboard/servicios" },
    ],
  },
  {
    title: "Rubros en Paraguay",
    links: [
      { label: "Peluquerías & Barberías", href: "/barberia/reservar" },
      { label: "Centros de Estética & Spas", href: "/barberia/reservar" },
      { label: "Consultorios & Salud", href: "/barberia/reservar" },
      { label: "Odontología & Estética", href: "/barberia/reservar" },
      { label: "Veterinarias & Pet Shops", href: "/barberia/reservar" },
      { label: "Canchas & Pádel", href: "/barberia/reservar" },
    ],
  },
  {
    title: "Soporte & Legal",
    links: [
      {
        label: "Contacto por WhatsApp",
        href: "https://wa.me/595981123456?text=Hola%2C%20quisiera%20consultar%20sobre%20AgendatePY",
        isExternal: true,
      },
      { label: "Términos y Condiciones", href: "/terminos" },
      { label: "Política de Privacidad", href: "/privacidad" },
      { label: "Preguntas Frecuentes", href: "#faq" },
    ],
  },
];

export default function Footer() {
  return (
    <footer id="contacto" className="border-t border-slate-200 dark:border-white/10 bg-white dark:bg-slate-950 transition-colors">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 md:grid-cols-5">
          <div>
            <Link href="/" className="inline-block">
              <BrandLogo variant="horizontal" iconClassName="h-8 w-8" />
            </Link>
            <p className="mt-3 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
              La plataforma de agendamiento online, asistente por WhatsApp y control de comisiones preferida por negocios y profesionales en Paraguay.
            </p>
          </div>
          {COLUMNS.map((column) => (
            <div key={column.title}>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">{column.title}</p>
              <ul className="mt-3 space-y-2">
                {column.links.map((link) => (
                  <li key={link.label}>
                    {link.isExternal ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-slate-600 dark:text-slate-400 hover:text-brand transition"
                      >
                        <span>{link.label}</span>
                        <ExternalLink className="h-2.5 w-2.5 opacity-60" />
                      </a>
                    ) : link.href.startsWith("#") ? (
                      <a
                        href={link.href}
                        className="text-xs text-slate-600 dark:text-slate-400 hover:text-brand transition"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="text-xs text-slate-600 dark:text-slate-400 hover:text-brand transition"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between border-t border-slate-100 dark:border-slate-800/80 pt-6 text-xs text-slate-400 dark:text-slate-500 sm:flex-row gap-2">
          <p>© 2026 AgendatePY. Hecho en Asunción, Paraguay.</p>
          <div className="flex items-center gap-4">
            <span>Soporte local SIPAP</span>
            <span>·</span>
            <span>Precios en Guaraníes</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
