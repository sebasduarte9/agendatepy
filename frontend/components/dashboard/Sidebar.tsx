"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  CalendarPlus,
  CalendarDays,
  Users,
  Coins,
  Banknote,
  BarChart3,
  Scissors,
  Receipt,
  Settings,
  Crown,
  ShoppingBag,
  Award,
  Palette,
  MessagesSquare,
  Bot,
  ExternalLink,
  X,
  type LucideIcon,
} from "lucide-react";
import type { UserRole } from "@/lib/dashboard-types";
import { useDashboardStore } from "@/store/useDashboardStore";
import { triggerHaptic } from "@/lib/haptics";
import { tenantHost } from "@/lib/tenant/public-url";
import LiquidLogo from "@/components/ui/LiquidLogo";

type SidebarLink = {
  href: string;
  label: string;
  icon: LucideIcon;
  roles?: UserRole[];
};

function hexToRgb(hex: string): string {
  const clean = hex.replace("#", "");
  if (clean.length === 3) {
    const r = parseInt(clean[0] + clean[0], 16);
    const g = parseInt(clean[1] + clean[1], 16);
    const b = parseInt(clean[2] + clean[2], 16);
    return `${r}, ${g}, ${b}`;
  }
  if (clean.length === 6) {
    const r = parseInt(clean.slice(0, 2), 16);
    const g = parseInt(clean.slice(2, 4), 16);
    const b = parseInt(clean.slice(4, 6), 16);
    return `${r}, ${g}, ${b}`;
  }
  return "255, 79, 43";
}

const PRIMARY_LINKS: SidebarLink[] = [
  { href: "/dashboard", label: "Inicio", icon: LayoutDashboard },
  { href: "/dashboard/calendario", label: "Agenda", icon: CalendarDays },
  { href: "/dashboard/nueva-reserva", label: "Nueva Cita", icon: CalendarPlus, roles: ["admin", "cajero"] },
  { href: "/dashboard/clientes", label: "Clientes", icon: Users },
  { href: "/dashboard/servicios", label: "Servicios", icon: Scissors, roles: ["admin"] },
  { href: "/dashboard/caja", label: "Caja & Cobros", icon: Banknote, roles: ["admin", "cajero"] },
  { href: "/dashboard/whatsapp", label: "WhatsApp IA", icon: Bot, roles: ["admin"] },
  { href: "/dashboard/crm", label: "Mensajes CRM", icon: MessagesSquare, roles: ["admin", "cajero"] },
  { href: "/dashboard/equipo", label: "Equipo", icon: Users, roles: ["admin"] },
  { href: "/dashboard/estadisticas", label: "Métricas", icon: BarChart3, roles: ["admin"] },
  { href: "/dashboard/productos", label: "Productos", icon: ShoppingBag, roles: ["admin", "cajero"] },
  { href: "/dashboard/comisiones", label: "Comisiones", icon: Coins, roles: ["admin", "barbero", "estilista"] },
  { href: "/dashboard/transferencias", label: "Transferencias", icon: Receipt, roles: ["admin", "cajero"] },
  { href: "/dashboard/fidelizacion", label: "Fidelización", icon: Award, roles: ["admin", "cajero"] },
];

const BOTTOM_LINKS: SidebarLink[] = [
  { href: "/dashboard/apariencia", label: "Diseño Web", icon: Palette, roles: ["admin"] },
  { href: "/dashboard/suscripcion", label: "Suscripción", icon: Crown, roles: ["admin"] },
  { href: "/dashboard/configuracion", label: "Ajustes", icon: Settings, roles: ["admin"] },
];

interface SidebarProps {
  variant?: "rail" | "drawer";
}

export default function Sidebar({ variant = "rail" }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [optimisticPath, setOptimisticPath] = useState<string | null>(null);

  useEffect(() => {
    setOptimisticPath(null);
  }, [pathname]);

  const currentPath = optimisticPath || pathname;
  const open = useDashboardStore((s) => s.sidebarOpen);
  const setOpen = useDashboardStore((s) => s.setSidebarOpen);
  const business = useDashboardStore((s) => s.business);
  const currentUserRole = useDashboardStore((s) => s.currentUserRole);

  const [isHovered, setIsHovered] = useState(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  function handleMouseEnter() {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => {
      setIsHovered(true);
    }, 40);
  }

  function handleMouseLeave() {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => {
      setIsHovered(false);
    }, 100);
  }

  const visibleLinks = PRIMARY_LINKS.filter(
    (item) => !item.roles || item.roles.includes(currentUserRole)
  );

  const visibleBottom = BOTTOM_LINKS.filter(
    (item) => !item.roles || item.roles.includes(currentUserRole)
  );

  // =========================================================================
  // 1. DESKTOP FLOATING FIXED GLASS RAIL
  // Anclado en viewport estático con scroll independiente y altura estrictamente bloqueada
  // =========================================================================
  if (variant === "rail") {
    return (
      <>
        {/* Soft atmospheric focus scrim when rail expands (resolves background text bleed and lighting clash) */}
        <div
          className={`fixed inset-0 bg-slate-950/20 dark:bg-black/55 backdrop-blur-[2px] transition-opacity duration-200 pointer-events-none z-40 ${
            isHovered ? "opacity-100" : "opacity-0"
          }`}
          aria-hidden="true"
        />

        <aside
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className={`glass-rail-fixed select-none ${isHovered ? "is-hovered" : ""}`}
          style={{
            height: "calc(100vh - 36px)",
            maxHeight: "calc(100vh - 36px)",
            minHeight: "calc(100vh - 36px)",
          }}
          aria-label="Navegación principal"
        >
          {/* Cabecera del Rail: Marca estilo Liquid Glass sin cuadro contenedor */}
          <div className="w-full h-[52px] min-h-[52px] max-h-[52px] flex items-center gap-3 pb-2.5 mb-1.5 border-b border-black/5 dark:border-white/10 shrink-0">
            <div className="h-[38px] w-[38px] shrink-0 flex items-center justify-center">
              <LiquidLogo
                size={36}
                primaryColor={business.primaryColor}
                title={business.name || "Agendatepy"}
                href="/dashboard"
              />
            </div>

            <div
              className={`min-w-0 flex-1 transition-all duration-200 overflow-hidden ${
                isHovered ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-3 pointer-events-none"
              }`}
            >
              <p className="text-xs font-bold text-slate-900 dark:text-white truncate leading-tight">
                {business.name || "Agendatepy"}
              </p>
              <span className="text-[8px] font-mono uppercase tracking-[0.22em] text-slate-400 dark:text-zinc-400 block mt-0.5">
                STUDIO
              </span>
            </div>
          </div>

          {/* Lista de enlaces: Altura optimizada h-[37px] para que los 14 enlaces entren perfectamente */}
          <nav className="flex-1 min-h-0 w-full overflow-y-auto overflow-x-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden py-1 space-y-0.5">
            {visibleLinks.map(({ href, label, icon: Icon }) => {
              const active =
                href === "/dashboard"
                  ? currentPath === "/dashboard"
                  : currentPath.startsWith(href);

              return (
                <Link
                  key={href}
                  href={href}
                  prefetch={true}
                  data-label={!isHovered ? label : undefined}
                  onClick={() => {
                    triggerHaptic("selection");
                    setOptimisticPath(href);
                  }}
                  className={`group flex items-center gap-2.5 w-full h-[37px] min-h-[37px] max-h-[37px] px-1 rounded-[14px] transition-all duration-150 ${
                    active
                      ? "glass-nav-active font-bold"
                      : "text-slate-700 dark:text-zinc-300 font-semibold hover:text-slate-950 dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.09]"
                  }`}
                  title={label}
                >
                  <div className="h-[34px] w-[34px] shrink-0 flex items-center justify-center">
                    <Icon
                      className={`h-[18px] w-[18px] transition-transform duration-150 group-hover:scale-110 ${
                        active ? "text-white" : ""
                      }`}
                    />
                  </div>

                  <span
                    className={`text-xs whitespace-nowrap truncate transition-all duration-200 ${
                      isHovered
                        ? "opacity-100 translate-x-0 max-w-[155px]"
                        : "opacity-0 -translate-x-2 pointer-events-none max-w-0"
                    }`}
                  >
                    {label}
                  </span>

                  {active && isHovered && (
                    <span className="ml-auto mr-1 h-1.5 w-1.5 rounded-full bg-white shadow-[0_0_8px_white] shrink-0" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Sección inferior fija con altura garantizada */}
          <div className="w-full pt-2 mt-1.5 border-t border-black/5 dark:border-white/10 shrink-0 space-y-0.5 overflow-hidden">
            {/* Link público de reservas */}
            <Link
              href={`/${business.slug || "barberia"}/reservar`}
              target="_blank"
              data-label={!isHovered ? "Portal Web" : undefined}
              className="group flex items-center gap-2.5 w-full h-[36px] min-h-[36px] max-h-[36px] px-1 rounded-[14px] text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 transition"
              title="Abrir portal público de reservas"
            >
              <div className="h-[34px] w-[34px] shrink-0 flex items-center justify-center">
                <ExternalLink className="h-[17px] w-[17px] group-hover:scale-110 transition-transform" />
              </div>
              <span
                className={`text-xs font-bold whitespace-nowrap truncate text-emerald-600 dark:text-emerald-400 transition-all duration-200 ${
                  isHovered
                    ? "opacity-100 translate-x-0 max-w-[155px]"
                    : "opacity-0 -translate-x-2 pointer-events-none max-w-0"
                }`}
              >
                Portal Público
              </span>
              {isHovered && (
                <span className="ml-auto mr-1 h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#34d399] animate-pulse shrink-0" />
              )}
            </Link>

            {visibleBottom.map(({ href, label, icon: Icon }) => {
              const active = currentPath.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  prefetch={true}
                  data-label={!isHovered ? label : undefined}
                  onClick={() => {
                    triggerHaptic("selection");
                    setOptimisticPath(href);
                  }}
                  className={`group flex items-center gap-2.5 w-full h-[36px] min-h-[36px] max-h-[36px] px-1 rounded-[14px] transition-all duration-150 ${
                    active
                      ? "glass-nav-active font-bold"
                      : "text-slate-700 dark:text-zinc-300 font-semibold hover:text-slate-950 dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.09]"
                  }`}
                  title={label}
                >
                  <div className="h-[34px] w-[34px] shrink-0 flex items-center justify-center">
                    <Icon
                      className={`h-[17px] w-[17px] transition-transform duration-150 group-hover:scale-110 ${
                        active ? "text-white" : ""
                      }`}
                    />
                  </div>
                  <span
                    className={`text-xs whitespace-nowrap truncate transition-all duration-200 ${
                      isHovered
                        ? "opacity-100 translate-x-0 max-w-[155px]"
                        : "opacity-0 -translate-x-2 pointer-events-none max-w-0"
                    }`}
                  >
                    {label}
                  </span>
                </Link>
              );
            })}
          </div>
        </aside>
      </>
    );
  }

  // =========================================================================
  // 2. MOBILE DRAWER (< lg)
  // =========================================================================
  if (!open) return null;

  return (
    <>
      <button
        type="button"
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden cursor-pointer"
        aria-label="Cerrar menú"
        onClick={() => setOpen(false)}
      />

      <aside className="fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] glass-sidebar p-4 flex flex-col lg:hidden animate-in slide-in-from-left duration-250">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/10">
          <div className="flex items-center gap-2.5">
            <LiquidLogo
              size={32}
              primaryColor={business.primaryColor}
              title={business.name || "Agendatepy"}
              href="/dashboard"
            />
            <span className="font-bold text-sm text-slate-900 dark:text-white truncate">
              {business.name || "Agendatepy"}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-3 space-y-1">
          {visibleLinks.map(({ href, label, icon: Icon }) => {
            const active =
              href === "/dashboard"
                ? currentPath === "/dashboard"
                : currentPath.startsWith(href);

            return (
              <Link
                key={href}
                href={href}
                onClick={() => {
                  triggerHaptic("selection");
                  setOptimisticPath(href);
                  setOpen(false);
                }}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                  active
                    ? "glass-nav-active font-bold text-white"
                    : "text-slate-600 dark:text-slate-400 hover:bg-white/40 dark:hover:bg-white/5"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </Link>
            );
          })}

          <div className="pt-2 border-t border-slate-200 dark:border-white/10 mt-2">
            {visibleBottom.map(({ href, label, icon: Icon }) => {
              const active = currentPath.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => {
                    triggerHaptic("selection");
                    setOptimisticPath(href);
                    setOpen(false);
                  }}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                    active
                      ? "glass-nav-active font-bold text-white"
                      : "text-slate-600 dark:text-slate-400 hover:bg-white/40 dark:hover:bg-white/5"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      </aside>
    </>
  );
}
