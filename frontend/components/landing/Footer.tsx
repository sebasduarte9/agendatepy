import Link from "next/link";
import { CalendarCheck, ExternalLink } from "lucide-react";

const COLUMNS = [
  {
    title: "Producto",
    links: [
      { label: "Características", href: "#caracteristicas" },
      { label: "Cómo funciona", href: "#como-funciona" },
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
      { label: "Centros de Estética & Spas", href: "/showcase" },
      { label: "Consultorios & Salud", href: "/dashboard" },
      { label: "Odontología & Estética", href: "/dashboard" },
      { label: "Veterinarias & Pet Shops", href: "/dashboard" },
      { label: "Canchas & Pádel", href: "/dashboard" },
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
      { label: "Configuración del Negocio", href: "/dashboard/configuracion" },
      { label: "Suscripción & Facturación", href: "/dashboard/suscripcion" },
      { label: "Preguntas Frecuentes", href: "#faq" },
    ],
  },
];

export default function Footer() {
  return (
    <footer id="contacto" className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 md:grid-cols-5">
          <div>
            <Link href="/" className="flex items-center gap-2 font-bold text-slate-900">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand text-white shadow-xs">
                <CalendarCheck className="h-4 w-4" />
              </span>
              <span>AgendatePY</span>
              <span className="rounded-full bg-red-100 px-1.5 py-0.2 text-[10px] font-bold text-red-700">
                PY
              </span>
            </Link>
            <p className="mt-3 text-xs leading-relaxed text-slate-600">
              La plataforma de agendamiento online, asistente por WhatsApp y control de comisiones preferida por negocios y profesionales en Paraguay.
            </p>
          </div>
          {COLUMNS.map((column) => (
            <div key={column.title}>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-900">{column.title}</p>
              <ul className="mt-3 space-y-2">
                {column.links.map((link) => (
                  <li key={link.label}>
                    {link.isExternal ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-slate-600 hover:text-brand transition"
                      >
                        <span>{link.label}</span>
                        <ExternalLink className="h-2.5 w-2.5 opacity-60" />
                      </a>
                    ) : link.href.startsWith("#") ? (
                      <a
                        href={link.href}
                        className="text-xs text-slate-600 hover:text-brand transition"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="text-xs text-slate-600 hover:text-brand transition"
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
        <div className="mt-10 border-t border-slate-100 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
          <p>© 2026 AgendatePY. Hecho en Paraguay para el crecimiento de tu negocio.</p>
          <p>Facturación oficial en Guaraníes (PYG)</p>
        </div>
      </div>
    </footer>
  );
}
