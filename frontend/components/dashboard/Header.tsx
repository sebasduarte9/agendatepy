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
  const [userMenuOpen, setUserMenuOpen] = useState(false);

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
      <div className="flex items-center gap-2.5 min-w-0">
        {/* On mobile, show clean subtle brand name since sidebar is hidden */}
        <Link
          href="/dashboard"
          className="flex lg:hidden items-center gap-2 select-none group"
        >
          <div
            className="h-7 w-7 rounded-lg flex items-center justify-center text-white text-xs font-black shadow-xs"
            style={{ backgroundColor: "var(--primary, #FF4F2B)" }}
          >
            A
          </div>
          <span className="font-black text-sm tracking-tight text-slate-900 dark:text-white">
            agendate<span style={{ color: "var(--primary, #FF4F2B)" }}>.py</span>
          </span>
        </Link>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2">
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
          {isDark ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-slate-600 dark:text-slate-300" />}
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

        {/* User Profile Avatar with Native Popover Menu */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="h-8 w-8 sm:h-9 sm:w-9 rounded-full flex items-center justify-center text-xs font-black text-white shadow-xs shrink-0 select-none cursor-pointer hover:opacity-90 active:scale-95 transition ml-0.5"
            style={{ backgroundColor: "var(--primary, #FF4F2B)" }}
            title={`${userName || "Usuario"} (${currentUserRole})`}
            aria-label="Menú de usuario"
          >
            {(userName || "U").slice(0, 2).toUpperCase()}
          </button>

          {/* Sleek Popover Menu */}
          {userMenuOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setUserMenuOpen(false)}
              />
              <div className="absolute right-0 top-full mt-2 w-64 rounded-2xl bg-white/95 dark:bg-slate-900/95 border border-slate-200/80 dark:border-white/10 shadow-2xl backdrop-blur-xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center gap-2.5 p-2.5 border-b border-slate-100 dark:border-white/5">
                  <div
                    className="h-9 w-9 rounded-full flex items-center justify-center text-xs font-black text-white shrink-0 shadow-xs"
                    style={{ backgroundColor: "var(--primary, #FF4F2B)" }}
                  >
                    {(userName || "U").slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {userName || "Usuario"}
                    </p>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                      {currentUserRole === "admin" ? "Administrador" : "Colaborador"}
                    </p>
                  </div>
                </div>

                <div className="py-1 space-y-0.5">
                  <Link
                    href="/dashboard/configuracion"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 transition"
                  >
                    <Settings className="h-4 w-4 text-slate-400" />
                    <span>Ajustes & Cuenta</span>
                  </Link>

                  <Link
                    href={`/${business.slug || "barberia"}/reservar`}
                    target="_blank"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 transition"
                  >
                    <ExternalLink className="h-4 w-4 text-slate-400" />
                    <span>Ver Web Pública</span>
                  </Link>

                  <button
                    type="button"
                    onClick={() => {
                      toggleDarkMode();
                      setUserMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 transition cursor-pointer text-left"
                  >
                    <div className="flex items-center gap-2.5">
                      {isDark ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-slate-400" />}
                      <span>{isDark ? "Modo Claro" : "Modo Oscuro"}</span>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">
                      {isDark ? "Oscuro" : "Claro"}
                    </span>
                  </button>

                  <a
                    href="https://wa.me/595981700800?text=Hola%20Soporte%20AgendatePY"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 transition"
                  >
                    <HelpCircle className="h-4 w-4 text-slate-400" />
                    <span>Ayuda WhatsApp</span>
                  </a>
                </div>

                <div className="pt-1 border-t border-slate-100 dark:border-white/5">
                  <button
                    type="button"
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition cursor-pointer text-left"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Cerrar Sesión</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
