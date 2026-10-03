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
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-900 hover:bg-slate-200/80 dark:hover:bg-slate-800 px-2.5 sm:px-3.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 transition shrink-0"
          title="Abrir tu portal público de reservas en una nueva pestaña"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
          <span className="hidden sm:inline">Ver mi página</span>
          <span className="sm:hidden">Página</span>
          <ExternalLink className="h-3 w-3 text-slate-400 shrink-0" />
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
