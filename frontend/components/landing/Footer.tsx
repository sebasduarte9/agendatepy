import { CalendarCheck } from "lucide-react";

const COLUMNS = [
  {
    title: "Producto",
    links: ["Características", "Cómo funciona", "Precios", "Comisiones", "WhatsApp Bot", "Caja Diaria"],
  },
  {
    title: "Rubros en Paraguay",
    links: [
      "Peluquerías & Barberías",
      "Centros de Estética & Spas",
      "Consultorios Médicos",
      "Odontología",
      "Veterinarias",
      "Canchas & Turnos Deportivos",
    ],
  },
  {
    title: "Ciudades",
    links: ["Asunción", "Ciudad del Este", "Encarnación", "Luque", "San Lorenzo", "Lambaré"],
  },
  {
    title: "Soporte & Legal",
    links: ["Contacto por WhatsApp", "Facturación con RUC", "Términos y Condiciones", "Privacidad de Datos"],
  },
];

export default function Footer() {
  return (
    <footer id="contacto" className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 md:grid-cols-5">
          <div>
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand text-white shadow-xs">
                <CalendarCheck className="h-4 w-4" />
              </span>
              <span>AgendatePY</span>
              <span className="rounded-full bg-red-100 px-1.5 py-0.2 text-[10px] font-bold text-red-700">
                PY
              </span>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-slate-600">
              La plataforma de agendamiento online, asistente por WhatsApp y control de comisiones preferida por negocios y profesionales en Paraguay.
            </p>
          </div>
          {COLUMNS.map((column) => (
            <div key={column.title}>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-900">{column.title}</p>
              <ul className="mt-3 space-y-2">
                {column.links.map((link) => (
                  <li key={link}>
                    <a href="#inicio" className="text-xs text-slate-600 hover:text-brand transition">
                      {link}
                    </a>
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
