"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  LogOut,
  Settings,
  ExternalLink,
  HelpCircle,
  BookOpen,
  Compass,
  Search,
  CalendarDays,
  Wallet,
  Users,
  Scissors,
} from "lucide-react";
import { useDashboardStore } from "@/store/useDashboardStore";
import BrandLogo from "@/components/ui/BrandLogo";
import LiquidLogo from "@/components/ui/LiquidLogo";
import { tenantHost } from "@/lib/tenant/public-url";
import CommandPalette from "./CommandPalette";
import UserMenu, { type ThemePreference } from "@/components/ui/user-menu/user-menu";
import ExpandingSearch, { type ExpandingSearchItem } from "@/components/ui/expanding-search/expanding-search";

export default function Header() {
  const router = useRouter();
  const business = useDashboardStore((s) => s.business);
  const currentUserRole = useDashboardStore((s) => s.currentUserRole);
  const userName = useDashboardStore((s) => s.userName);
  const openTour = useDashboardStore((s) => s.openTour);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [themeMode, setThemeMode] = useState<ThemePreference>("dark");
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("agendate_theme_mode") as ThemePreference | null;
    if (saved === "light") {
      setThemeMode("light");
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light");
      document.documentElement.setAttribute("data-theme", "light");
    } else if (saved === "dark") {
      setThemeMode("dark");
      document.documentElement.classList.remove("light");
      document.documentElement.classList.add("dark");
      document.documentElement.setAttribute("data-theme", "dark");
    } else {
      setThemeMode("system");
    }
  }, []);

  const handleThemeChange = (nextTheme: ThemePreference) => {
    setThemeMode(nextTheme);
    if (nextTheme === "light") {
      localStorage.setItem("agendate_theme_mode", "light");
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light");
      document.documentElement.setAttribute("data-theme", "light");
    } else if (nextTheme === "dark") {
      localStorage.setItem("agendate_theme_mode", "dark");
      document.documentElement.classList.remove("light");
      document.documentElement.classList.add("dark");
      document.documentElement.setAttribute("data-theme", "dark");
    } else {
      localStorage.removeItem("agendate_theme_mode");
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      if (prefersDark) {
        document.documentElement.classList.add("dark");
        document.documentElement.classList.remove("light");
        document.documentElement.setAttribute("data-theme", "dark");
      } else {
        document.documentElement.classList.add("light");
        document.documentElement.classList.remove("dark");
        document.documentElement.setAttribute("data-theme", "light");
      }
    }
  };

  async function handleLogout() {
    setIsLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {}
    window.location.href = "/login";
  }

  // Quick navigation items for mobile ExpandingSearch
  const searchItems: ExpandingSearchItem[] = useMemo(
    () => [
      {
        id: "nav-agenda",
        title: "Agenda Operativa",
        meta: "Turnos y agenda en vivo",
        group: "Accesos Rápidos",
        icon: <CalendarDays size={14} />,
        keywords: ["turnos", "hoy", "agenda", "citas"],
      },
      {
        id: "nav-calendario",
        title: "Calendario",
        meta: "Vista semanal y mensual",
        group: "Accesos Rápidos",
        icon: <CalendarDays size={14} />,
        keywords: ["calendario", "mes", "semana"],
      },
      {
        id: "nav-caja",
        title: "Caja & Finanzas",
        meta: "Ingresos, cobros y balance",
        group: "Finanzas",
        icon: <Wallet size={14} />,
        keywords: ["caja", "plata", "cobros", "arqueo"],
      },
      {
        id: "nav-clientes",
        title: "Clientes & CRM",
        meta: "Directorio de clientes y WhatsApp",
        group: "Clientes",
        icon: <Users size={14} />,
        keywords: ["clientes", "crm", "telefonos"],
      },
      {
        id: "nav-servicios",
        title: "Servicios & Precios",
        meta: "Catálogo de servicios",
        group: "Configuración",
        icon: <Scissors size={14} />,
        keywords: ["servicios", "precios", "cortes"],
      },
      {
        id: "nav-equipo",
        title: "Equipo & Staff",
        meta: "Profesionales y comisiones",
        group: "Equipo",
        icon: <Users size={14} />,
        keywords: ["staff", "equipo", "profesionales"],
      },
      {
        id: "nav-configuracion",
        title: "Configuración",
        meta: "Horarios, logo y colores",
        group: "Ajustes",
        icon: <Settings size={14} />,
        keywords: ["ajustes", "horarios", "perfil"],
      },
    ],
    []
  );

  const searchSuggestions: ExpandingSearchItem[] = useMemo(
    () => [
      {
        id: "nav-agenda",
        title: "Agenda de Hoy",
        meta: "Ver citas de hoy",
        group: "Sugeridos",
        icon: <CalendarDays size={14} />,
      },
      {
        id: "nav-caja",
        title: "Caja en Vivo",
        meta: "Cobros del día",
        group: "Sugeridos",
        icon: <Wallet size={14} />,
      },
      {
        id: "nav-clientes",
        title: "Directorio de Clientes",
        meta: "Buscar clientes",
        group: "Sugeridos",
        icon: <Users size={14} />,
      },
    ],
    []
  );

  const handleSearchSelect = (item: ExpandingSearchItem) => {
    switch (item.id) {
      case "nav-agenda":
        router.push("/dashboard");
        break;
      case "nav-calendario":
        router.push("/dashboard/calendario");
        break;
      case "nav-caja":
        router.push("/dashboard/caja");
        break;
      case "nav-clientes":
        router.push("/dashboard/clientes");
        break;
      case "nav-servicios":
        router.push("/dashboard/servicios");
        break;
      case "nav-equipo":
        router.push("/dashboard/equipo");
        break;
      case "nav-configuracion":
        router.push("/dashboard/configuracion");
        break;
      default:
        router.push("/dashboard");
        break;
    }
  };

  return (
    <header className="w-full flex h-[58px] sm:h-[62px] items-center justify-between px-4 sm:px-6 select-none">
      <div className="flex items-center gap-2.5 min-w-0">
        {/* On mobile, show clean liquid brand lockup: [Liquid A Logo] + gendate.py */}
        <Link
          href="/dashboard"
          className="flex lg:hidden items-center gap-2 select-none group"
        >
          <LiquidLogo
            size={28}
            primaryColor={business.primaryColor}
            href=""
          />
          <span
            className="font-coolvetica text-xl tracking-normal text-slate-900 dark:text-white flex items-center leading-none"
            style={{ fontFamily: "var(--font-coolvetica), Coolvetica, sans-serif" }}
          >
            gendate<span style={{ color: business.primaryColor || "var(--primary, #FF4F2B)" }}>.py</span>
          </span>
        </Link>

        {/* On desktop, executive workspace eyebrow lockup */}
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

      <div className="flex items-center gap-1.5 sm:gap-2">
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

        {/* Guided Tour Trigger (Desktop only) */}
        <button
          type="button"
          onClick={() => openTour()}
          className="hidden sm:inline-flex rounded-full p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 transition cursor-pointer"
          aria-label="Guía interactiva"
          title="Guía interactiva del sistema"
        >
          <Compass className="h-4 w-4" />
        </button>

        {/* Documentation / Manual Icon (Desktop only) */}
        <Link
          href="/dashboard/extras"
          className="hidden sm:inline-flex rounded-full p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          aria-label="Material y ayuda"
          title="Material & Documentación"
        >
          <BookOpen className="h-4 w-4" />
        </Link>

        {/* Support Help Icon (Desktop only) */}
        <a
          href="https://wa.me/595981700800?text=Hola%20Soporte%20AgendatePY"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:inline-flex rounded-full p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          aria-label="Soporte técnico"
          title="Ayuda y Soporte"
        >
          <HelpCircle className="h-4 w-4" />
        </a>

        {/* Desktop Universal Search Button (⌘K) */}
        <button
          type="button"
          onClick={() => setCommandPaletteOpen(true)}
          className="hidden sm:inline-flex items-center gap-2 rounded-xl border border-white/60 dark:border-white/10 bg-white/50 dark:bg-white/[0.05] hover:bg-white/80 dark:hover:bg-white/[0.1] px-2.5 sm:px-3 py-1.5 text-xs text-slate-500 dark:text-zinc-400 backdrop-blur-md transition cursor-pointer"
          title="Búsqueda universal (⌘K)"
        >
          <Search className="h-3.5 w-3.5 text-slate-400 dark:text-zinc-400" />
          <span className="hidden md:inline">Buscar en tu espacio…</span>
          <span className="md:hidden">Buscar…</span>
          <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-200/60 dark:bg-white/10 text-slate-600 dark:text-zinc-300 ml-1">
            ⌘K
          </kbd>
        </button>

        {/* Mobile Expanding Search */}
        <div className="inline-flex sm:hidden">
          <ExpandingSearch
            label="Buscar…"
            items={searchItems}
            suggestions={searchSuggestions}
            suggestionsLabel="Sugeridos"
            onSelect={handleSearchSelect}
            expandedWidth={220}
            anchor="end"
          />
        </div>

        {/* User Menu (Bottom sheet on mobile < 640px, spring popover on desktop) */}
        <UserMenu
          user={{
            name: userName || "Usuario",
            email: business.email || `${business.slug || "admin"}@agendate.py`,
            plan: currentUserRole === "admin" ? "Admin" : "Staff",
            avatarSrc: business.logoUrl || business.logo || undefined,
          }}
          status="available"
          theme={themeMode}
          onThemeChange={handleThemeChange}
          items={[
            {
              label: "Configuración",
              icon: <Settings size={15} strokeWidth={1.75} />,
              keys: ["⌘", "S"],
              onSelect: () => router.push("/dashboard/configuracion"),
            },
            {
              label: "Portal Público",
              icon: <ExternalLink size={15} strokeWidth={1.75} />,
              onSelect: () => window.open(`/${business.slug || "barberia"}/reservar`, "_blank"),
            },
            {
              label: "Guía Interactiva",
              icon: <Compass size={15} strokeWidth={1.75} />,
              onSelect: () => openTour(),
            },
            {
              label: "Ayuda WhatsApp",
              icon: <HelpCircle size={15} strokeWidth={1.75} />,
              onSelect: () => window.open("https://wa.me/595981700800?text=Hola%20Soporte%20AgendatePY", "_blank"),
            },
          ]}
          onSignOut={handleLogout}
        />
      </div>

      <CommandPalette
        open={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
      />
    </header>
  );
}
