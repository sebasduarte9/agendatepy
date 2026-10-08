"use client";

import { useState, useEffect, useRef } from "react";
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
  QrCode,
  Settings,
  Crown,
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
import { triggerHaptic } from "@/lib/haptics";

type SidebarLink = {
  href: string;
  label: string;
  icon: LucideIcon;
  roles?: UserRole[];
};

const PRIMARY_LINKS: SidebarLink[] = [
  { href: "/dashboard", label: "Inicio", icon: LayoutDashboard },
  { href: "/dashboard/calendario", label: "Agenda", icon: CalendarDays },
  { href: "/dashboard/clientes", label: "Clientes", icon: Users },
  { href: "/dashboard/servicios", label: "Servicios", icon: Scissors, roles: ["admin"] },
  { href: "/dashboard/caja", label: "Caja & Cobros", icon: Banknote, roles: ["admin", "cajero"] },
];

const OPERATIONS_LINKS: SidebarLink[] = [
  { href: "/dashboard/nueva-reserva", label: "Nueva Cita", icon: CalendarPlus, roles: ["admin", "cajero"] },
  { href: "/dashboard/equipo", label: "Equipo", icon: Users, roles: ["admin"] },
  { href: "/dashboard/productos", label: "Productos", icon: ShoppingBag, roles: ["admin", "cajero"] },
  { href: "/dashboard/comisiones", label: "Comisiones", icon: Coins, roles: ["admin", "barbero", "estilista"] },
  { href: "/dashboard/transferencias", label: "Transferencias", icon: Receipt, roles: ["admin", "cajero"] },
  { href: "/dashboard/crm", label: "Mensajes & CRM", icon: MessagesSquare, roles: ["admin", "cajero"] },
  { href: "/dashboard/fidelizacion", label: "Fidelización", icon: Award, roles: ["admin", "cajero"] },
  { href: "/dashboard/whatsapp", label: "Asistente WhatsApp", icon: Bot, roles: ["admin"] },
  { href: "/dashboard/estadisticas", label: "Métricas y Análisis", icon: BarChart3, roles: ["admin"] },
];

const CONFIG_LINKS: SidebarLink[] = [
  { href: "/dashboard/configuracion", label: "Configuración", icon: Settings, roles: ["admin"] },
  { href: "/dashboard/apariencia", label: "Diseño Web", icon: Palette, roles: ["admin"] },
  { href: "/dashboard/extras", label: "Material & QR", icon: QrCode, roles: ["admin"] },
  { href: "/dashboard/suscripcion", label: "Suscripción", icon: Crown, roles: ["admin"] },
];

const COLLAPSED_WIDTH = 68;
const EXPANDED_WIDTH = 250;

export default function Sidebar() {
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
    if (hoverLeaveTimeoutRef.current) {
      clearTimeout(hoverLeaveTimeoutRef.current);
      hoverLeaveTimeoutRef.current = null;
    }
    if (!isHovered && !hoverEnterTimeoutRef.current) {
      hoverEnterTimeoutRef.current = setTimeout(() => {
        setIsHovered(true);
        hoverEnterTimeoutRef.current = null;
      }, 240);
    }
  }

  function handleMouseLeave() {
    if (hoverEnterTimeoutRef.current) {
      clearTimeout(hoverEnterTimeoutRef.current);
      hoverEnterTimeoutRef.current = null;
    }
    if (hoverLeaveTimeoutRef.current) clearTimeout(hoverLeaveTimeoutRef.current);
    hoverLeaveTimeoutRef.current = setTimeout(() => {
      setIsHovered(false);
      hoverLeaveTimeoutRef.current = null;
    }, 140);
  }

  function togglePinned() {
    setIsPinned((prev) => {
      const next = !prev;
      localStorage.setItem("agendate_sidebar_pinned", String(next));
      return next;
    });
  }

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

  const renderLink = ({ href, label, icon: Icon }: SidebarLink) => {
    const active =
      href === "/dashboard"
        ? currentPath === "/dashboard"
        : currentPath.startsWith(href);

    return (
      <Link
        key={href}
        href={href}
        prefetch={true}
        onPointerDown={() => router.prefetch(href)}
        onClick={() => {
          triggerHaptic("selection");
          setOptimisticPath(href);
          setOpen(false);
        }}
        title={!expanded ? label : undefined}
        className={`group relative flex h-9 w-full items-center rounded-xl px-2.5 transition-all duration-150 ${
          active
            ? "bg-slate-100 dark:bg-white/[0.08] text-slate-950 dark:text-white font-bold shadow-2xs"
            : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/[0.04] hover:text-slate-900 dark:hover:text-slate-200"
        }`}
      >
        <div className="flex h-7 w-7 shrink-0 items-center justify-center">
          <Icon
            className="h-4 w-4 transition-colors duration-150"
            style={active ? { color: "var(--primary, #FF4F2B)" } : undefined}
          />
        </div>

        <div
          className="flex items-center justify-between min-w-0 flex-1 overflow-hidden transition-all duration-200 ease-out"
          style={{
            opacity: expanded ? 1 : 0,
            maxWidth: expanded ? 180 : 0,
            marginLeft: expanded ? 6 : 0,
            transform: expanded ? "translateX(0)" : "translateX(-4px)",
          }}
        >
          <span className="truncate text-xs font-medium">
            {label}
          </span>
          {active && (
            <span
              className="h-1.5 w-1.5 rounded-full shrink-0 ml-1"
              style={{ backgroundColor: "var(--primary, #FF4F2B)" }}
            />
          )}
        </div>
      </Link>
    );
  };

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
        className={`sidebar fixed inset-y-0 left-0 z-50 flex flex-col border-r border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-950 backdrop-blur-2xl transition-[width,box-shadow] duration-300 ease-in-out overflow-hidden ${
          open
            ? "translate-x-0 shadow-2xl"
            : "-translate-x-full lg:translate-x-0"
        } ${
          expanded
            ? "shadow-xl shadow-slate-900/10 dark:shadow-black/50"
            : ""
        }`}
      >
        {/* Workspace selector matching console reference */}
        <div className="flex flex-col justify-center border-b border-slate-100 dark:border-white/5 p-3 overflow-hidden">
          {expanded ? (
            <div className="space-y-1.5 animate-in fade-in duration-200">
              <div className="flex items-center justify-between px-1">
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                  Workspace
                </span>
                <span className="rounded px-1.5 py-0.2 text-[9px] font-mono text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800">
                  {roleLabel}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-slate-200/80 dark:border-white/10 bg-slate-50/60 dark:bg-slate-900/60 p-2 hover:bg-slate-100/70 dark:hover:bg-slate-800/60 transition group cursor-pointer">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-white font-black text-[11px] shadow-xs"
                    style={{ backgroundColor: "var(--primary, #FF4F2B)" }}
                  >
                    {business.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="truncate text-xs font-bold text-slate-900 dark:text-white">
                    {business.name}
                  </span>
                </div>
                <div className="flex items-center gap-1 shrink-0 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200">
                  <ExternalLink className="h-3 w-3" />
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center py-1">
              <div
                className="flex h-8 w-8 items-center justify-center rounded-xl text-white font-black text-xs shadow-xs"
                style={{ backgroundColor: "var(--primary, #FF4F2B)" }}
                title={business.name}
              >
                {business.name.charAt(0).toUpperCase()}
              </div>
            </div>
          )}
        </div>

        {/* Navigation links */}
        <nav className="flex-1 space-y-4 overflow-y-auto px-2.5 py-3.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {/* Section 1: Operaciones */}
          <div>
            <div className="h-5 flex items-center px-2 mb-1 overflow-hidden">
              {expanded ? (
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 whitespace-nowrap truncate">
                  Operaciones
                </span>
              ) : (
                <div className="w-full h-px bg-slate-200/60 dark:bg-white/5" />
              )}
            </div>

            <div className="space-y-0.5">
              {visiblePrimary.map(renderLink)}
            </div>
          </div>

          {/* Section 2: Gestión */}
          {visibleOperations.length > 0 && (
            <div>
              <div className="h-5 flex items-center px-2 mb-1 overflow-hidden">
                {expanded ? (
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 whitespace-nowrap truncate">
                    Gestión
                  </span>
                ) : (
                  <div className="w-full h-px bg-slate-200/60 dark:bg-white/5" />
                )}
              </div>

              <div className="space-y-0.5">
                {visibleOperations.map(renderLink)}
              </div>
            </div>
          )}

          {/* Section 3: Ajustes */}
          {visibleConfig.length > 0 && (
            <div>
              <div className="h-5 flex items-center px-2 mb-1 overflow-hidden">
                {expanded ? (
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 whitespace-nowrap truncate">
                    Ajustes
                  </span>
                ) : (
                  <div className="w-full h-px bg-slate-200/60 dark:bg-white/5" />
                )}
              </div>

              <div className="space-y-0.5">
                {visibleConfig.map(renderLink)}
              </div>
            </div>
          )}
        </nav>

        {/* Footer info in sidebar */}
        <div className="shrink-0 border-t border-slate-100 dark:border-white/5 p-2.5 overflow-hidden">
          {expanded ? (
            <div className="rounded-xl border border-slate-200/80 dark:border-white/5 bg-slate-50/60 dark:bg-slate-900/40 p-2.5 text-xs animate-in fade-in duration-200">
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Página de reservas:</p>
              <Link
                href={`/${business.slug || "barberia"}/reservar`}
                target="_blank"
                className="mt-0.5 flex items-center justify-between text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white group"
              >
                <span className="truncate">agendate.py/{business.slug || "barberia"}</span>
                <ExternalLink className="h-3 w-3 shrink-0 ml-1 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200" />
              </Link>
            </div>
          ) : (
            <Link
              href={`/${business.slug || "barberia"}/reservar`}
              target="_blank"
              title={`Ver web: agendate.py/${business.slug || "barberia"}`}
              className="flex h-9 w-full items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900 transition"
            >
              <ExternalLink className="h-4 w-4" />
            </Link>
          )}
        </div>
      </aside>
    </>
  );
}
