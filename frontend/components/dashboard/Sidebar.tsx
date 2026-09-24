"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarPlus,
  CalendarDays,
  Users,
  Coins,
  Banknote,
  MessageSquare,
  BarChart3,
  Scissors,
  Ban,
  Receipt,
  QrCode,
  Settings,
  Crown,
  CalendarCheck,
  ShoppingBag,
  Award,
  Palette,
  Sparkles,
} from "lucide-react";
import { useDashboardStore } from "@/store/useDashboardStore";

const PRIMARY_LINKS = [
  { href: "/dashboard", label: "Inicio", icon: LayoutDashboard },
  { href: "/dashboard/nueva-reserva", label: "Nueva Reserva", icon: CalendarPlus },
  { href: "/dashboard/calendario", label: "Calendario", icon: CalendarDays },
  { href: "/dashboard/clientes", label: "Clientes & Ficha", icon: Users, badge: "CRM" },
  { href: "/dashboard/productos", label: "Productos & Tienda", icon: ShoppingBag, badge: "Web" },
  { href: "/dashboard/comisiones", label: "Comisiones", icon: Coins, badge: "Equipo" },
  { href: "/dashboard/caja", label: "Caja & Arqueo", icon: Banknote },
  { href: "/dashboard/fidelizacion", label: "Fidelización VIP", icon: Award, badge: "Puntos" },
  { href: "/dashboard/whatsapp", label: "WhatsApp Hub", icon: MessageSquare, badge: "Auto" },
  { href: "/dashboard/estadisticas", label: "Estadísticas", icon: BarChart3 },
];

const SECONDARY_LINKS = [
  { href: "/dashboard/apariencia", label: "Diseño & Marca", icon: Palette },
  { href: "/dashboard/servicios", label: "Servicios & Equipo", icon: Scissors },
  { href: "/dashboard/bloquear-horario", label: "Bloquear Horario", icon: Ban },
  { href: "/dashboard/transferencias", label: "Transferencias SIPAP", icon: Receipt },
  { href: "/dashboard/extras", label: "Kit Marketing & QR", icon: QrCode },
  { href: "/dashboard/configuracion", label: "Configuración", icon: Settings },
  { href: "/dashboard/suscripcion", label: "Mi Suscripción", icon: Crown },
];

export default function Sidebar() {
  const pathname = usePathname();
  const open = useDashboardStore((s) => s.sidebarOpen);
  const setOpen = useDashboardStore((s) => s.setSidebarOpen);
  const business = useDashboardStore((s) => s.business);

  return (
    <>
      {open && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
          aria-label="Cerrar menú"
          onClick={() => setOpen(false)}
        />
      )}
      <aside
        className={`sidebar fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col border-r border-border bg-white dark:bg-slate-900 transition-colors duration-300 lg:static lg:translate-x-0 ${
          open ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        }`}
      >
        {/* Brand header */}
        <div className="flex h-16 items-center justify-between border-b border-border/60 px-5">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-md shadow-primary/25">
              <CalendarCheck className="h-5 w-5" />
            </span>
            <div>
              <div className="flex items-center gap-1.5 font-bold tracking-tight text-slate-900 dark:text-slate-100">
                <span>AgendatePY</span>
                <span className="rounded-full bg-red-100 dark:bg-red-950/60 px-1.5 py-0.5 text-[10px] font-semibold text-red-700 dark:text-red-400">
                  PY
                </span>
              </div>
              <p className="truncate text-[11px] font-medium text-slate-400 max-w-[170px]">
                {business.name}
              </p>
            </div>
          </Link>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-4">
          <div>
            <p className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Operación Diaria
            </p>
            <div className="space-y-1">
              {PRIMARY_LINKS.map(({ href, label, icon: Icon, badge }) => {
                const active =
                  href === "/dashboard"
                    ? pathname === "/dashboard"
                    : pathname.startsWith(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setOpen(false)}
                    className={`flex items-center justify-between rounded-xl px-3 py-2 text-sm font-medium transition ${
                      active
                        ? "bg-primary/10 text-primary font-semibold"
                        : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`h-4 w-4 ${active ? "text-primary" : "text-slate-400"}`} />
                      <span>{label}</span>
                    </div>
                    {badge && (
                      <span className="rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                        {badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>

          <div>
            <p className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Gestión & Negocio
            </p>
            <div className="space-y-1">
              {SECONDARY_LINKS.map(({ href, label, icon: Icon }) => {
                const active = pathname.startsWith(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition ${
                      active
                        ? "bg-primary/10 text-primary font-semibold"
                        : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    <Icon className={`h-4 w-4 ${active ? "text-primary" : "text-slate-400"}`} />
                    <span>{label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </nav>

        {/* Footer info in sidebar */}
        <div className="border-t border-border/60 p-3">
          <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 p-3 text-xs">
            <p className="font-semibold text-slate-900 dark:text-slate-200">Enlace de tu local:</p>
            <Link
              href={`/${business.slug || "barberia"}/reservar`}
              target="_blank"
              className="mt-1 block truncate font-mono text-[11px] text-primary hover:underline"
            >
              agendate.py/{business.slug || "barberia"}
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
}
