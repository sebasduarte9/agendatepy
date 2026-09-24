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
import type { UserRole } from "@/lib/dashboard-types";
import { useDashboardStore } from "@/store/useDashboardStore";

type SidebarLink = {
  href: string;
  label: string;
  icon: any;
  badge?: string;
  roles?: UserRole[];
};

const PRIMARY_LINKS: SidebarLink[] = [
  { href: "/dashboard", label: "Inicio", icon: LayoutDashboard },
  { href: "/dashboard/nueva-reserva", label: "Nueva Reserva", icon: CalendarPlus, roles: ["admin", "cajero"] },
  { href: "/dashboard/calendario", label: "Calendario", icon: CalendarDays },
  { href: "/dashboard/clientes", label: "Clientes & Ficha", icon: Users, badge: "CRM" },
  { href: "/dashboard/productos", label: "Productos & Tienda", icon: ShoppingBag, badge: "Web", roles: ["admin", "cajero"] },
  { href: "/dashboard/comisiones", label: "Comisiones", icon: Coins, badge: "Pagos", roles: ["admin", "barbero", "estilista"] },
  { href: "/dashboard/caja", label: "Caja & Arqueo", icon: Banknote, roles: ["admin", "cajero"] },
  { href: "/dashboard/fidelizacion", label: "Fidelización VIP", icon: Award, badge: "Puntos", roles: ["admin", "cajero"] },
  { href: "/dashboard/whatsapp", label: "WhatsApp Hub", icon: MessageSquare, badge: "Auto", roles: ["admin"] },
  { href: "/dashboard/estadisticas", label: "Estadísticas", icon: BarChart3, roles: ["admin"] },
];

const SECONDARY_LINKS: SidebarLink[] = [
  { href: "/dashboard/equipo", label: "Equipo & Roles", icon: Users, badge: "Permisos", roles: ["admin"] },
  { href: "/dashboard/apariencia", label: "Diseño & Marca", icon: Palette, roles: ["admin"] },
  { href: "/dashboard/servicios", label: "Servicios", icon: Scissors, roles: ["admin"] },
  { href: "/dashboard/bloquear-horario", label: "Bloquear Horario", icon: Ban, roles: ["admin", "barbero", "estilista"] },
  { href: "/dashboard/transferencias", label: "Transferencias SIPAP", icon: Receipt, roles: ["admin", "cajero"] },
  { href: "/dashboard/extras", label: "Kit Marketing & QR", icon: QrCode, roles: ["admin"] },
  { href: "/dashboard/configuracion", label: "Configuración", icon: Settings, roles: ["admin"] },
  { href: "/dashboard/suscripcion", label: "Mi Suscripción", icon: Crown, roles: ["admin"] },
];

export default function Sidebar() {
  const pathname = usePathname();
  const open = useDashboardStore((s) => s.sidebarOpen);
  const setOpen = useDashboardStore((s) => s.setSidebarOpen);
  const business = useDashboardStore((s) => s.business);
  const currentUserRole = useDashboardStore((s) => s.currentUserRole);

  const visiblePrimary = PRIMARY_LINKS.filter(
    (item) => !item.roles || item.roles.includes(currentUserRole)
  );
  const visibleSecondary = SECONDARY_LINKS.filter(
    (item) => !item.roles || item.roles.includes(currentUserRole)
  );

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
        className={`sidebar fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col border-r border-slate-200/80 dark:border-white/10 bg-white/85 dark:bg-slate-950/85 backdrop-blur-2xl transition-all duration-300 lg:static lg:translate-x-0 ${
          open ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        }`}
      >
        {/* Brand header */}
        <div className="flex h-16 items-center justify-between border-b border-slate-100 dark:border-white/10 px-5">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-primary to-indigo-600 text-white shadow-md shadow-primary/25">
              <CalendarCheck className="h-5 w-5" />
            </span>
            <div>
              <div className="flex items-center gap-1.5 font-black tracking-tight text-slate-900 dark:text-white">
                <span>AgendatePY</span>
                <span className="rounded-full bg-red-100 dark:bg-red-950/60 px-1.5 py-0.5 text-[10px] font-extrabold text-red-700 dark:text-red-400">
                  PY
                </span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[10px] font-bold text-primary">
                  {currentUserRole === "admin"
                    ? "👑 Dueño"
                    : currentUserRole === "cajero"
                    ? "💳 Cajera"
                    : currentUserRole === "barbero"
                    ? "✂️ Barbero"
                    : "💅 Estilista"}
                </span>
                <span className="text-[10px] text-slate-400">·</span>
                <p className="truncate text-[10.5px] font-medium text-slate-400 max-w-[110px]">
                  {business.name}
                </p>
              </div>
            </div>
          </Link>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-4">
          <div>
            <p className="px-3 pb-2 text-[10.5px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Operación Diaria
            </p>
            <div className="space-y-1">
              {visiblePrimary.map(({ href, label, icon: Icon, badge }) => {
                const active =
                  href === "/dashboard"
                    ? pathname === "/dashboard"
                    : pathname.startsWith(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setOpen(false)}
                    className={`flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition-all duration-200 ${
                      active
                        ? "bg-gradient-to-r from-primary/15 via-primary/5 to-transparent border-l-2 border-primary text-primary font-bold shadow-2xs"
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-100/70 dark:hover:bg-slate-900/60 hover:text-slate-900 dark:hover:text-white hover:translate-x-0.5"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`h-4 w-4 ${active ? "text-primary" : "text-slate-400"}`} />
                      <span>{label}</span>
                    </div>
                    {badge && (
                      <span className="rounded-md bg-primary/10 dark:bg-primary/20 px-1.5 py-0.5 text-[9px] font-bold text-primary">
                        {badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>

          {visibleSecondary.length > 0 && (
            <div>
              <p className="px-3 pb-2 text-[10.5px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Gestión & Negocio
              </p>
              <div className="space-y-1">
                {visibleSecondary.map(({ href, label, icon: Icon, badge }) => {
                  const active = pathname.startsWith(href);
                  return (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setOpen(false)}
                      className={`flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition-all duration-200 ${
                        active
                          ? "bg-gradient-to-r from-primary/15 via-primary/5 to-transparent border-l-2 border-primary text-primary font-bold shadow-2xs"
                          : "text-slate-600 dark:text-slate-400 hover:bg-slate-100/70 dark:hover:bg-slate-900/60 hover:text-slate-900 dark:hover:text-white hover:translate-x-0.5"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`h-4 w-4 ${active ? "text-primary" : "text-slate-400"}`} />
                        <span>{label}</span>
                      </div>
                      {badge && (
                        <span className="rounded-md bg-primary/10 dark:bg-primary/20 px-1.5 py-0.5 text-[9px] font-bold text-primary">
                          {badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </nav>

        {/* Footer info in sidebar */}
        <div className="border-t border-slate-100 dark:border-white/10 p-3">
          <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-slate-50/80 dark:bg-slate-900/60 p-3 text-xs backdrop-blur-md">
            <p className="font-bold text-slate-900 dark:text-slate-200">Tu web de reservas:</p>
            <Link
              href={`/${business.slug || "barberia"}/reservar`}
              target="_blank"
              className="mt-1 block truncate font-mono text-[11px] font-semibold text-primary hover:underline"
            >
              agendate.py/{business.slug || "barberia"} ↗
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
}
