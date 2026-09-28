"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LogOut, Menu, Settings, Sun, Moon, ExternalLink } from "lucide-react";
import { useDashboardStore } from "@/store/useDashboardStore";

export default function Header() {
  const business = useDashboardStore((s) => s.business);
  const currentUserRole = useDashboardStore((s) => s.currentUserRole);
  const setOpen = useDashboardStore((s) => s.setSidebarOpen);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("agendate_theme_mode");
    if (saved === "dark" || (!saved && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
      setIsDark(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  function toggleDarkMode() {
    if (isDark) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("agendate_theme_mode", "light");
      setIsDark(false);
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("agendate_theme_mode", "dark");
      setIsDark(true);
    }
  }

  const staff = useDashboardStore((s) => s.staff);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function handleLogout() {
    setIsLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {}
    window.location.href = "/login";
  }

  return (
    <header className="header sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200/80 dark:border-white/10 bg-white/85 dark:bg-slate-950/85 px-3 sm:px-4 backdrop-blur-2xl transition-all duration-300">
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <button
          type="button"
          className="rounded-xl p-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden shrink-0"
          aria-label="Abrir menú"
          onClick={() => setOpen(true)}
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="min-w-0">
          <p className="profile-name text-xs sm:text-sm font-black text-slate-900 dark:text-white truncate max-w-[140px] sm:max-w-[200px]">
            {business.name}
          </p>
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <p className="profile-plan text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-slate-400 truncate">
              {currentUserRole === "admin" ? "Administrador" : "Colaborador"}
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2">

        <Link
          data-tour="header-booking-link"
          href={`/${business.slug || "barberia"}/reservar`}
          target="_blank"
          className="group relative inline-flex items-center gap-1.5 sm:gap-2 rounded-full border border-primary/40 bg-gradient-to-r from-primary/10 via-primary/5 to-indigo-500/10 hover:from-primary/20 hover:to-indigo-500/20 px-2.5 sm:px-4 py-1.5 sm:py-2 text-[11px] sm:text-xs font-extrabold text-primary shadow-xs hover:shadow-md hover:shadow-primary/15 hover:scale-[1.03] active:scale-[0.98] transition-all duration-200 shrink-0"
          title="Abrir tu portal público de reservas en una nueva pestaña"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
          </span>
          <span className="hidden xs:inline sm:inline">Ver mi página</span>
          <span className="inline xs:hidden sm:hidden">Página</span>
          <ExternalLink className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-primary transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </Link>

        {/* Dark Mode Toggle */}
        <button
          type="button"
          onClick={toggleDarkMode}
          className="rounded-full p-1.5 sm:p-2 text-slate-500 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          aria-label={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
          title={isDark ? "Modo Claro" : "Modo Oscuro"}
        >
          {isDark ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4" />}
        </button>

        <Link
          href="/dashboard/configuracion"
          className="hidden sm:inline-flex rounded-full p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          aria-label="Configuración rápida"
          title="Ajustes del local"
        >
          <Settings className="h-4 w-4" />
        </Link>

        {/* Real Logout Button */}
        <button
          type="button"
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="rounded-full p-1.5 sm:p-2 text-slate-500 dark:text-slate-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600 transition disabled:opacity-50 cursor-pointer"
          aria-label="Cerrar sesión"
          title="Cerrar sesión"
        >
          <LogOut className="h-4 w-4" />
        </button>

        <span className="profile-pic hidden sm:flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-primary to-indigo-600 text-xs font-black text-white shadow-md shadow-primary/25 shrink-0">
          {business.name.slice(0, 2).toUpperCase()}
        </span>
      </div>
    </header>
  );
}
