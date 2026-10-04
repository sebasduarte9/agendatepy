"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LogOut, Menu, Settings, Sun, Moon, ExternalLink, HelpCircle, BookOpen, Compass } from "lucide-react";
import { useDashboardStore } from "@/store/useDashboardStore";

export default function Header() {
  const business = useDashboardStore((s) => s.business);
  const currentUserRole = useDashboardStore((s) => s.currentUserRole);
  const setOpen = useDashboardStore((s) => s.setSidebarOpen);
  const userName = useDashboardStore((s) => s.userName);
  const openTour = useDashboardStore((s) => s.openTour);
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

  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function handleLogout() {
    setIsLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {}
    window.location.href = "/login";
  }

  return (
    <header className="header sticky top-0 z-30 flex h-14 sm:h-16 items-center justify-between border-b border-slate-200/80 dark:border-white/10 bg-white/95 dark:bg-slate-950/95 px-3.5 sm:px-6 backdrop-blur-2xl transition-all duration-300">
      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
        {/* Business Avatar on Mobile (replaces web hamburger menu) */}
        <div
          className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl text-white font-black text-xs shadow-xs select-none"
          style={{ backgroundColor: "var(--primary, #FF4F2B)" }}
        >
          {(business.name || "A").slice(0, 2).toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="profile-name text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate max-w-[140px] sm:max-w-[200px]">
            {business.name}
          </p>
          <div className="flex items-center gap-1.5">
            <span
              className="h-1.5 w-1.5 rounded-full shrink-0"
              style={{ backgroundColor: "var(--primary, #10b981)" }}
            />
            <p className="profile-plan text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-slate-400 truncate">
              {currentUserRole === "admin" ? "Administrador" : "Colaborador"}
            </p>
          </div>
        </div>
      </div>


      <div className="flex items-center gap-1 sm:gap-2">
        <Link
          data-tour="header-booking-link"
          href={`/${business.slug || "barberia"}/reservar`}
          target="_blank"
          className="inline-flex items-center gap-1.5 rounded-full border border-slate-200/80 dark:border-white/10 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 px-2.5 sm:px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 transition shrink-0"
          title="Abrir tu portal público de reservas en una nueva pestaña"
        >
          <span
            className="h-1.5 w-1.5 rounded-full shrink-0 animate-pulse"
            style={{ backgroundColor: "var(--primary, #10b981)" }}
          />
          <span className="hidden sm:inline">agendate.py/{business.slug || "barberia"}</span>
          <span className="sm:hidden text-[11px] font-semibold">Web</span>
          <ExternalLink className="h-3 w-3 text-slate-400 shrink-0" />
        </Link>

        {/* Guided Tour Direct Trigger */}
        <button
          type="button"
          onClick={() => openTour()}
          className="rounded-full p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 transition cursor-pointer"
          aria-label="Guía interactiva"
          title="Guía interactiva del sistema"
        >
          <Compass className="h-4 w-4" />
        </button>

        {/* Documentation / Manual Icon (desktop only, accessible on mobile via 'Más') */}
        <Link
          href="/dashboard/extras"
          className="hidden sm:inline-flex rounded-full p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          aria-label="Material y ayuda"
          title="Material & Documentación"
        >
          <BookOpen className="h-4 w-4" />
        </Link>

        {/* Support Help Icon (desktop only, accessible on mobile via WhatsApp) */}
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

        {/* Dark Mode Toggle */}
        <button
          type="button"
          onClick={toggleDarkMode}
          className="rounded-full p-2 text-slate-500 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 transition cursor-pointer"
          aria-label={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
          title={isDark ? "Modo Claro" : "Modo Oscuro"}
        >
          {isDark ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4" />}
        </button>

        {/* Settings Button */}
        <Link
          href="/dashboard/configuracion"
          className="hidden sm:inline-flex rounded-full p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          aria-label="Configuración"
          title="Ajustes del local"
        >
          <Settings className="h-4 w-4" />
        </Link>

        {/* Logout Button (Desktop only; on mobile it's in the 'Más' sheet) */}
        <button
          type="button"
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="hidden sm:inline-flex rounded-full p-2 text-slate-500 dark:text-slate-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600 transition disabled:opacity-50 cursor-pointer"
          aria-label="Cerrar sesión"
          title="Cerrar sesión"
        >
          <LogOut className="h-4 w-4" />
        </button>

        {/* Clean Avatar Circle with User Custom Primary Color */}
        <div
          className="h-8 w-8 rounded-full flex items-center justify-center text-[11px] font-black text-white shadow-xs ml-1 shrink-0 select-none"
          style={{ backgroundColor: "var(--primary, #4f46e5)" }}
          title={`${userName || "Usuario"} (${currentUserRole})`}
        >
          {(userName || business.name || "U").slice(0, 2).toUpperCase()}
        </div>
      </div>
    </header>
  );
}
