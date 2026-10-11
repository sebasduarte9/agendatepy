"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ExternalLink,
  HelpCircle,
  Search,
  Settings,
  Calendar,
  CalendarPlus,
  Users,
  Banknote,
  Bot,
  Scissors,
  ShoppingBag,
  BarChart3,
  Palette,
  LayoutDashboard,
} from "lucide-react";
import { useDashboardStore } from "@/store/useDashboardStore";
import LiquidLogo from "@/components/ui/LiquidLogo";
import { tenantHost } from "@/lib/tenant/public-url";
import CommandPalette from "./CommandPalette";
import { UserMenu, type UserMenuItem, type ThemePreference } from "@/components/ui/user-menu";
import { ExpandingSearch, type ExpandingSearchItem } from "@/components/ui/expanding-search";

export default function Header() {
  const router = useRouter();
  const business = useDashboardStore((s) => s.business);
  const currentUserRole = useDashboardStore((s) => s.currentUserRole);
  const userName = useDashboardStore((s) => s.userName);
  const clients = useDashboardStore((s) => s.clients);
  const services = useDashboardStore((s) => s.services);

  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<ThemePreference>("dark");
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("agendate_theme_mode") as ThemePreference | null;
    if (saved === "light") {
      setCurrentTheme("light");
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light");
      document.documentElement.setAttribute("data-theme", "light");
    } else if (saved === "system") {
      setCurrentTheme("system");
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      document.documentElement.classList.toggle("dark", prefersDark);
      document.documentElement.classList.toggle("light", !prefersDark);
      document.documentElement.setAttribute("data-theme", prefersDark ? "dark" : "light");
    } else {
      setCurrentTheme("dark");
      document.documentElement.classList.remove("light");
      document.documentElement.classList.add("dark");
      document.documentElement.setAttribute("data-theme", "dark");
    }
  }, []);

  function handleThemeChange(newTheme: ThemePreference) {
    setCurrentTheme(newTheme);
    if (newTheme === "light") {
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light");
      document.documentElement.setAttribute("data-theme", "light");
      localStorage.setItem("agendate_theme_mode", "light");
    } else if (newTheme === "dark") {
      document.documentElement.classList.remove("light");
      document.documentElement.classList.add("dark");
      document.documentElement.setAttribute("data-theme", "dark");
      localStorage.setItem("agendate_theme_mode", "dark");
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      document.documentElement.classList.toggle("dark", prefersDark);
      document.documentElement.classList.toggle("light", !prefersDark);
      document.documentElement.setAttribute("data-theme", prefersDark ? "dark" : "light");
      localStorage.setItem("agendate_theme_mode", "system");
    }
  }

  async function handleLogout() {
    setIsLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {}
    window.location.href = "/login";
  }

  // Pre-configured searchable navigation and actions
  const searchItems = useMemo<ExpandingSearchItem[]>(() => {
    const baseItems: ExpandingSearchItem[] = [
      { id: "nav-inicio", title: "Inicio / Dashboard", meta: "Resumen general de tu negocio", group: "Navegación", icon: <LayoutDashboard size={16} strokeWidth={1.75} />, href: "/dashboard" },
      { id: "nav-agenda", title: "Agenda & Calendario", meta: "Turnos y citas programadas", group: "Operaciones", icon: <Calendar size={16} strokeWidth={1.75} />, href: "/dashboard/calendario" },
      { id: "nav-nueva-reserva", title: "Nueva Reserva Rápida", meta: "Agendar nuevo turno para un cliente", group: "Operaciones", icon: <CalendarPlus size={16} strokeWidth={1.75} />, href: "/dashboard/nueva-reserva" },
      { id: "nav-clientes", title: "Clientes & CRM", meta: "Directorio y fichas de clientes", group: "Relaciones", icon: <Users size={16} strokeWidth={1.75} />, href: "/dashboard/clientes" },
      { id: "nav-caja", title: "Caja & Movimientos", meta: "Cobros, ingresos y gastos diarios", group: "Finanzas", icon: <Banknote size={16} strokeWidth={1.75} />, href: "/dashboard/caja" },
      { id: "nav-whatsapp", title: "WhatsApp IA Asistente", meta: "Automatización y confirmación de citas", group: "Automatización", icon: <Bot size={16} strokeWidth={1.75} />, href: "/dashboard/whatsapp" },
      { id: "nav-servicios", title: "Servicios & Precios", meta: "Catálogo de servicios ofrecidos", group: "Catálogo", icon: <Scissors size={16} strokeWidth={1.75} />, href: "/dashboard/servicios" },
      { id: "nav-productos", title: "Productos & Stock", meta: "Inventario de productos físicos", group: "Catálogo", icon: <ShoppingBag size={16} strokeWidth={1.75} />, href: "/dashboard/productos" },
      { id: "nav-equipo", title: "Equipo & Especialistas", meta: "Gestión de profesionales y horarios", group: "Personas", icon: <Users size={16} strokeWidth={1.75} />, href: "/dashboard/equipo" },
      { id: "nav-estadisticas", title: "Métricas & Reportes", meta: "Ocupación, facturación y balance", group: "Finanzas", icon: <BarChart3 size={16} strokeWidth={1.75} />, href: "/dashboard/estadisticas" },
      { id: "nav-apariencia", title: "Personalizar Apariencia", meta: "Colores de marca y temas visuales", group: "Diseño", icon: <Palette size={16} strokeWidth={1.75} />, href: "/dashboard/apariencia" },
      { id: "nav-configuracion", title: "Configuración General", meta: "Horarios, datos del local y ajustes", group: "Ajustes", icon: <Settings size={16} strokeWidth={1.75} />, href: "/dashboard/configuracion" },
    ];

    const clientItems: ExpandingSearchItem[] = (clients || []).slice(0, 8).map((c: any) => ({
      id: `client-${c.id}`,
      title: c.name || "Cliente",
      meta: c.phone || "Ficha de cliente",
      group: "Clientes",
      icon: <Users size={16} strokeWidth={1.75} />,
      href: `/dashboard/clientes`,
    }));

    const serviceItems: ExpandingSearchItem[] = (services || []).slice(0, 8).map((s: any) => ({
      id: `svc-${s.id}`,
      title: s.name || "Servicio",
      meta: s.price ? `Gs. ${Number(s.price).toLocaleString("es-PY")}` : "Servicio",
      group: "Servicios",
      icon: <Scissors size={16} strokeWidth={1.75} />,
      href: `/dashboard/servicios`,
    }));

    return [...baseItems, ...clientItems, ...serviceItems];
  }, [clients, services]);

  const searchSuggestions = useMemo<ExpandingSearchItem[]>(() => {
    return [
      searchItems[1], // Agenda & Calendario
      searchItems[2], // Nueva Reserva Rápida
      searchItems[3], // Clientes & CRM
      searchItems[4], // Caja & Movimientos
    ].filter(Boolean);
  }, [searchItems]);

  const userMenuItems = useMemo<UserMenuItem[]>(() => [
    {
      label: "Ajustes & Cuenta",
      icon: <Settings size={16} strokeWidth={1.75} />,
      onSelect: () => router.push("/dashboard/configuracion"),
    },
    {
      label: "Ver Web Pública",
      icon: <ExternalLink size={16} strokeWidth={1.75} />,
      onSelect: () => window.open(`/${business.slug || "barberia"}/reservar`, "_blank"),
    },
    {
      label: "Ayuda WhatsApp",
      icon: <HelpCircle size={16} strokeWidth={1.75} />,
      onSelect: () => window.open("https://wa.me/595981700800?text=Hola%20Soporte%20AgendatePY", "_blank"),
    },
  ], [router, business.slug]);

  return (
    <header className="w-full flex h-[58px] sm:h-[62px] items-center justify-between px-4 sm:px-6 select-none relative z-50">
      <div className="flex items-center gap-2.5 min-w-0">
        {/* On mobile, show clean liquid brand lockup: [Liquid A Logo] + gendate.py */}
        <Link
          href="/dashboard"
          className="flex shrink-0 lg:hidden items-center gap-2 select-none group"
        >
          <LiquidLogo
            size={28}
            primaryColor={business.primaryColor}
            href=""
            className="shrink-0"
          />
          <span
            className={`shrink-0 max-w-[12rem] overflow-hidden whitespace-nowrap font-coolvetica text-xl tracking-normal text-slate-900 dark:text-white flex items-center leading-none transition-all duration-200 ${isSearchExpanded ? "max-sm:max-w-0 max-sm:opacity-0 max-sm:-mr-2" : "max-sm:opacity-100"}`}
            style={{ fontFamily: "var(--font-coolvetica), Coolvetica, sans-serif" }}
          >
            gendate<span style={{ color: business.primaryColor || "var(--primary, #FF4F2B)" }}>.py</span>
          </span>
        </Link>

        {/* On desktop, executive workspace eyebrow lockup from Glassy */}
        <div className="hidden lg:flex items-center gap-2.5">
          <span className="text-[10px] font-extrabold tracking-widest uppercase text-slate-500 dark:text-zinc-400 font-mono">
            {business.name || "AGENDATEPY"}
          </span>
          <span className="text-slate-300 dark:text-zinc-700">/</span>
          <span className="text-xs font-semibold text-slate-800 dark:text-zinc-200">
            Workspace
          </span>
        </div>
      </div>

      <div className={`flex items-center gap-2 sm:gap-3 ${isSearchExpanded ? "max-sm:ml-3 max-sm:min-w-0 max-sm:flex-1" : "shrink-0"}`}>
        {/* Public Booking Link (Desktop only) */}
        <Link
          data-tour="header-booking-link"
          href={`/${business.slug || "barberia"}/reservar`}
          target="_blank"
          className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-white/80 dark:border-white/10 bg-white/60 dark:bg-white/[0.06] hover:bg-white/90 dark:hover:bg-white/[0.12] px-2.5 sm:px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 backdrop-blur-md shadow-2xs transition shrink-0"
          title="Abrir tu portal público de reservas en una nueva pestaña"
        >
          <span className="h-1.5 w-1.5 rounded-full shrink-0 bg-emerald-500 animate-pulse" />
          <span>{tenantHost(business.slug || "barberia")}</span>
          <ExternalLink className="h-3 w-3 text-slate-400 shrink-0" />
        </Link>

        {/* Morphing Expanding Search (Desktop & Mobile) */}
        <div className={`inline-flex min-w-0 items-center ${isSearchExpanded ? "max-sm:flex max-sm:flex-1" : ""}`}>
          <ExpandingSearch
            label="Buscar en tu espacio..."
            placeholder="Buscar páginas, acciones, clientes…"
            expandedWidth={340}
            expandedWidthMobile={520}
            fitContainerOnMobile
            items={searchItems}
            suggestions={searchSuggestions}
            suggestionsLabel="Accesos Rápidos"
            onExpandedChange={setIsSearchExpanded}
            onSelect={(item) => {
              if (item.href) router.push(item.href);
            }}
          />
        </div>

        {/* Morphing User Menu Button & Dropdown */}
        <div className="shrink-0">
          <UserMenu
            user={{
              name: userName || "Marcos Benítez",
              email: business.email || "administrador@agendate.py",
              plan: currentUserRole === "admin" ? "ADMINISTRADOR" : "COLABORADOR",
              initials: (userName || "M").charAt(0).toUpperCase(),
              avatarSrc: (business.logoUrl || business.logo) || undefined,
            }}
            theme={currentTheme}
            onThemeChange={handleThemeChange}
            showTheme={true}
            items={userMenuItems}
            onSignOut={handleLogout}
            align="end"
          />
        </div>
      </div>

      <CommandPalette
        open={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
      />
    </header>
  );
}
