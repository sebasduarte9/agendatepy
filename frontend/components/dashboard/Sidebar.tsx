"use client";

import { useState, useEffect, useRef } from "react";
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
  MessagesSquare,
  Bot,
  Pin,
  PinOff,
  ExternalLink,
  type LucideIcon,
} from "lucide-react";
import type { UserRole } from "@/lib/dashboard-types";
import { useDashboardStore } from "@/store/useDashboardStore";
import BrandLogo from "@/components/ui/BrandLogo";

type SidebarLink = {
  href: string;
  label: string;
  icon: LucideIcon;
  badge?: string;
  roles?: UserRole[];
};

const PRIMARY_LINKS: SidebarLink[] = [
  { href: "/dashboard", label: "Inicio", icon: LayoutDashboard },
  { href: "/dashboard/calendario", label: "Agenda & Turnos", icon: CalendarDays },
  { href: "/dashboard/clientes", label: "Clientes & Ficha", icon: Users, badge: "Fichas" },
  { href: "/dashboard/servicios", label: "Servicios & Precios", icon: Scissors, roles: ["admin"] },
  { href: "/dashboard/caja", label: "Caja & Arqueo", icon: Banknote, roles: ["admin", "cajero"] },
];

const OPERATIONS_LINKS: SidebarLink[] = [
  { href: "/dashboard/nueva-reserva", label: "Nueva Reserva", icon: CalendarPlus, roles: ["admin", "cajero"] },
  { href: "/dashboard/equipo", label: "Equipo & Roles", icon: Users, badge: "Permisos", roles: ["admin"] },
  { href: "/dashboard/productos", label: "Productos & Tienda", icon: ShoppingBag, badge: "Web", roles: ["admin", "cajero"] },
  { href: "/dashboard/comisiones", label: "Comisiones", icon: Coins, badge: "Pagos", roles: ["admin", "barbero", "estilista"] },
  { href: "/dashboard/transferencias", label: "Transferencias SIPAP", icon: Receipt, roles: ["admin", "cajero"] },
  { href: "/dashboard/crm", label: "CRM Omnicanal", icon: MessagesSquare, badge: "3 Canales", roles: ["admin", "cajero"] },
  { href: "/dashboard/fidelizacion", label: "Fidelización VIP", icon: Award, badge: "Puntos", roles: ["admin", "cajero"] },
  { href: "/dashboard/whatsapp", label: "Bot WhatsApp", icon: Bot, badge: "IA", roles: ["admin"] },
  { href: "/dashboard/estadisticas", label: "Estadísticas", icon: BarChart3, roles: ["admin"] },
];

const CONFIG_LINKS: SidebarLink[] = [
  { href: "/dashboard/configuracion", label: "Configuración", icon: Settings, roles: ["admin"] },
  { href: "/dashboard/apariencia", label: "Diseño & Marca", icon: Palette, roles: ["admin"] },
  { href: "/dashboard/extras", label: "Kit Marketing & QR", icon: QrCode, roles: ["admin"] },
  { href: "/dashboard/suscripcion", label: "Mi Suscripción", icon: Crown, roles: ["admin"] },
];

const COLLAPSED_WIDTH = 70;
const EXPANDED_WIDTH = 260;

export default function Sidebar() {
  const pathname = usePathname();
  const open = useDashboardStore((s) => s.sidebarOpen);
  const setOpen = useDashboardStore((s) => s.setSidebarOpen);
  const business = useDashboardStore((s) => s.business);
  const currentUserRole = useDashboardStore((s) => s.currentUserRole);

  const [isHovered, setIsHovered] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const hoverEnterTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hoverLeaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("agendate_sidebar_pinned");
    if (saved === "true") setIsPinned(true);
  }, []);

  useEffect(() => {
    return () => {
      if (hoverEnterTimeoutRef.current) clearTimeout(hoverEnterTimeoutRef.current);
      if (hoverLeaveTimeoutRef.current) clearTimeout(hoverLeaveTimeoutRef.current);
    };
  }, []);

  function handleMouseEnter() {
    // Cancel any pending close
    if (hoverLeaveTimeoutRef.current) {
      clearTimeout(hoverLeaveTimeoutRef.current);
      hoverLeaveTimeoutRef.current = null;
    }
    // Delay expansion (260ms) so accidental mouse brush doesn't trigger it
    if (!isHovered && !hoverEnterTimeoutRef.current) {
      hoverEnterTimeoutRef.current = setTimeout(() => {
        setIsHovered(true);
        hoverEnterTimeoutRef.current = null;
      }, 260);
    }
  }

  function handleMouseLeave() {
    // If user leaves before hover timer fired, cancel opening
    if (hoverEnterTimeoutRef.current) {
      clearTimeout(hoverEnterTimeoutRef.current);
      hoverEnterTimeoutRef.current = null;
    }
    // Smooth delay before collapsing
    if (hoverLeaveTimeoutRef.current) clearTimeout(hoverLeaveTimeoutRef.current);
    hoverLeaveTimeoutRef.current = setTimeout(() => {
      setIsHovered(false);
      hoverLeaveTimeoutRef.current = null;
    }, 150);
  }

  function togglePinned() {
    setIsPinned((prev) => {
      const next = !prev;
      localStorage.setItem("agendate_sidebar_pinned", String(next));
      return next;
    });
  }

  // Expanded if pinned, hovered, or opened via mobile drawer
  const expanded = isPinned || isHovered || open;

  const visiblePrimary = PRIMARY_LINKS.filter(
    (item) => !item.roles || item.roles.includes(currentUserRole)
  );
  const visibleOperations = OPERATIONS_LINKS.filter(
    (item) => !item.roles || item.roles.includes(currentUserRole)
  );
  const visibleConfig = CONFIG_LINKS.filter(
    (item) => !item.roles || item.roles.includes(currentUserRole)
  );

  const roleLabel =
    currentUserRole === "admin"
      ? "Admin"
      : currentUserRole === "cajero"
      ? "Caja"
      : currentUserRole === "barbero"
      ? "Barbero"
      : "Estilista";

  const currentWidth = open ? 280 : expanded ? EXPANDED_WIDTH : COLLAPSED_WIDTH;

  return (
    <>
      {/* Mobile Backdrop */}
      {open && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm lg:hidden"
          aria-label="Cerrar menú"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Desktop spacer to preserve layout flow when unpinned/hovering */}
      <div
        className="hidden lg:block shrink-0 transition-[width] duration-300 ease-in-out pointer-events-none"
        style={{ width: expanded ? EXPANDED_WIDTH : COLLAPSED_WIDTH }}
      />

      {/* Main Sidebar Element */}
      <aside
        data-tour="sidebar-nav"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{ width: currentWidth }}
        className={`sidebar fixed inset-y-0 left-0 z-50 flex flex-col border-r border-slate-200/80 dark:border-white/10 bg-white/95 dark:bg-slate-950/95 backdrop-blur-2xl transition-[width,box-shadow] duration-300 ease-in-out overflow-hidden ${
          open
            ? "translate-x-0 shadow-2xl"
            : "-translate-x-full lg:translate-x-0"
        } ${
          expanded
            ? "shadow-2xl shadow-slate-900/15 dark:shadow-black/60"
            : ""
        }`}
      >
        {/* Brand header */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-slate-100 dark:border-white/10 px-3.5 overflow-hidden">
          <Link href="/dashboard" className="flex items-center gap-3 overflow-hidden min-w-0 flex-1">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/10 shadow-xs">
              <BrandLogo variant="icon" iconClassName="h-7 w-7" />
            </div>
            <div
              className="overflow-hidden whitespace-nowrap transition-all duration-300 ease-out min-w-0"
              style={{
                opacity: expanded ? 1 : 0,
                maxWidth: expanded ? 140 : 0,
                transform: expanded ? "translateX(0)" : "translateX(-6px)",
              }}
            >
              <div className="flex items-center gap-1.5 font-extrabold tracking-tight text-slate-900 dark:text-white">
                <span className="truncate">agendate<span className="text-[#FF4F2B]">py</span></span>
                <span className="rounded-full bg-orange-100 dark:bg-orange-950/60 border border-orange-500/20 px-1.5 py-0.5 text-[9px] font-extrabold text-[#FF4F2B] shrink-0">
                  PRO
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="inline-flex items-center rounded-md bg-primary/10 px-1.5 py-0.5 text-[9.5px] font-bold text-primary">
                  {roleLabel}
                </span>
                <span className="text-[10px] text-slate-400">·</span>
                <p className="truncate text-[10.5px] font-medium text-slate-400 max-w-[75px]">
                  {business.name}
                </p>
              </div>
            </div>
          </Link>

          {/* Pin toggle button on desktop - only rendered when expanded */}
          {expanded && (
            <button
              type="button"
              onClick={togglePinned}
              title={isPinned ? "Desfijar menú (expandir solo con hover)" : "Fijar menú siempre abierto"}
              className="hidden lg:flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200 animate-in fade-in"
            >
              {isPinned ? (
                <PinOff className="h-3.5 w-3.5 text-primary" />
              ) : (
                <Pin className="h-3.5 w-3.5" />
              )}
            </button>
          )}
        </div>

        {/* Navigation links */}
        <nav className="flex-1 space-y-3 overflow-y-auto px-2.5 py-3 scrollbar-none">
          {/* Section 1: Operación Diaria */}
          <div>
            <div className="h-6 flex items-center px-1.5 my-1 overflow-hidden">
              {expanded ? (
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 whitespace-nowrap truncate animate-in fade-in duration-200">
                  Operación Diaria
                </span>
              ) : (
                <div className="w-full h-px bg-slate-200/80 dark:bg-white/10" />
              )}
            </div>

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
                    title={!expanded ? label : undefined}
                    className={`group relative flex h-10 w-full items-center rounded-xl px-1.5 transition-colors duration-150 ${
                      active
                        ? "bg-primary/10 text-primary font-bold shadow-2xs"
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    {active && (
                      <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-primary" />
                    )}

                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
                      <Icon
                        className={`h-4 w-4 transition-transform duration-150 group-hover:scale-110 ${
                          active
                            ? "text-primary"
                            : "text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200"
                        }`}
                      />
                    </div>

                    <div
                      className="flex items-center justify-between min-w-0 flex-1 overflow-hidden transition-all duration-250 ease-out"
                      style={{
                        opacity: expanded ? 1 : 0,
                        maxWidth: expanded ? 180 : 0,
                        marginLeft: expanded ? 6 : 0,
                        transform: expanded ? "translateX(0)" : "translateX(-6px)",
                      }}
                    >
                      <span className="truncate text-xs font-semibold">
                        {label}
                      </span>
                      {badge && (
                        <span className="shrink-0 rounded-md bg-primary/10 dark:bg-primary/20 px-1.5 py-0.5 text-[9px] font-bold text-primary ml-1.5">
                          {badge}
                        </span>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Section 2: Gestión & Módulos */}
          {visibleOperations.length > 0 && (
            <div>
              <div className="h-6 flex items-center px-1.5 my-1 overflow-hidden">
                {expanded ? (
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 whitespace-nowrap truncate animate-in fade-in duration-200">
                    Gestión & Operaciones
                  </span>
                ) : (
                  <div className="w-full h-px bg-slate-200/80 dark:bg-white/10" />
                )}
              </div>

              <div className="space-y-1">
                {visibleOperations.map(({ href, label, icon: Icon, badge }) => {
                  const active = pathname.startsWith(href);
                  return (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setOpen(false)}
                      title={!expanded ? label : undefined}
                      className={`group relative flex h-10 w-full items-center rounded-xl px-1.5 transition-colors duration-150 ${
                        active
                          ? "bg-primary/10 text-primary font-bold shadow-2xs"
                          : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-white"
                      }`}
                    >
                      {active && (
                        <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-primary" />
                      )}

                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
                        <Icon
                          className={`h-4 w-4 transition-transform duration-150 group-hover:scale-110 ${
                            active
                              ? "text-primary"
                              : "text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200"
                          }`}
                        />
                      </div>

                      <div
                        className="flex items-center justify-between min-w-0 flex-1 overflow-hidden transition-all duration-250 ease-out"
                        style={{
                          opacity: expanded ? 1 : 0,
                          maxWidth: expanded ? 180 : 0,
                          marginLeft: expanded ? 6 : 0,
                          transform: expanded ? "translateX(0)" : "translateX(-6px)",
                        }}
                      >
                        <span className="truncate text-xs font-semibold">
                          {label}
                        </span>
                        {badge && (
                          <span className="shrink-0 rounded-md bg-primary/10 dark:bg-primary/20 px-1.5 py-0.5 text-[9px] font-bold text-primary ml-1.5">
                            {badge}
                          </span>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Section 3: Configuración */}
          {visibleConfig.length > 0 && (
            <div>
              <div className="h-6 flex items-center px-1.5 my-1 overflow-hidden">
                {expanded ? (
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 whitespace-nowrap truncate animate-in fade-in duration-200">
                    Configuración
                  </span>
                ) : (
                  <div className="w-full h-px bg-slate-200/80 dark:bg-white/10" />
                )}
              </div>

              <div className="space-y-1">
                {visibleConfig.map(({ href, label, icon: Icon, badge }) => {
                  const active = pathname.startsWith(href);
                  return (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setOpen(false)}
                      title={!expanded ? label : undefined}
                      className={`group relative flex h-10 w-full items-center rounded-xl px-1.5 transition-colors duration-150 ${
                        active
                          ? "bg-primary/10 text-primary font-bold shadow-2xs"
                          : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-white"
                      }`}
                    >
                      {active && (
                        <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-primary" />
                      )}

                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
                        <Icon
                          className={`h-4 w-4 transition-transform duration-150 group-hover:scale-110 ${
                            active
                              ? "text-primary"
                              : "text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200"
                          }`}
                        />
                      </div>

                      <div
                        className="flex items-center justify-between min-w-0 flex-1 overflow-hidden transition-all duration-250 ease-out"
                        style={{
                          opacity: expanded ? 1 : 0,
                          maxWidth: expanded ? 180 : 0,
                          marginLeft: expanded ? 6 : 0,
                          transform: expanded ? "translateX(0)" : "translateX(-6px)",
                        }}
                      >
                        <span className="truncate text-xs font-semibold">
                          {label}
                        </span>
                        {badge && (
                          <span className="shrink-0 rounded-md bg-primary/10 dark:bg-primary/20 px-1.5 py-0.5 text-[9px] font-bold text-primary ml-1.5">
                            {badge}
                          </span>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </nav>

        {/* Footer info in sidebar */}
        <div className="shrink-0 border-t border-slate-100 dark:border-white/10 p-2.5 overflow-hidden">
          {expanded ? (
            <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-slate-50/80 dark:bg-slate-900/60 p-3 text-xs backdrop-blur-md animate-in fade-in duration-200">
              <p className="font-bold text-slate-900 dark:text-slate-200">Tu web de reservas:</p>
              <Link
                href={`/${business.slug || "barberia"}/reservar`}
                target="_blank"
                className="mt-1 flex items-center justify-between font-mono text-[11px] font-semibold text-primary hover:underline"
              >
                <span className="truncate">agendate.py/{business.slug || "barberia"}</span>
                <ExternalLink className="h-3 w-3 shrink-0 ml-1" />
              </Link>
            </div>
          ) : (
            <Link
              href={`/${business.slug || "barberia"}/reservar`}
              target="_blank"
              title={`Ver web: agendate.py/${business.slug || "barberia"}`}
              className="flex h-10 w-full items-center justify-center rounded-xl text-slate-400 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-900 transition"
            >
              <ExternalLink className="h-4 w-4" />
            </Link>
          )}
        </div>
      </aside>
    </>
  );
}


