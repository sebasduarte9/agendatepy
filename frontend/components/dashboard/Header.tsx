"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LogOut, Menu, Settings, ExternalLink, HelpCircle, BookOpen, Compass, Search } from "lucide-react";
import { useDashboardStore } from "@/store/useDashboardStore";
import BrandLogo from "@/components/ui/BrandLogo";
import LiquidLogo from "@/components/ui/LiquidLogo";
import { tenantHost } from "@/lib/tenant/public-url";
import CommandPalette from "./CommandPalette";

export default function Header() {
  const business = useDashboardStore((s) => s.business);
  const currentUserRole = useDashboardStore((s) => s.currentUserRole);
  const setOpen = useDashboardStore((s) => s.setSidebarOpen);
  const userName = useDashboardStore((s) => s.userName);
  const openTour = useDashboardStore((s) => s.openTour);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("agendate_theme_mode");
    if (saved === "light") {
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light");
      document.documentElement.setAttribute("data-theme", "light");
    } else {
      document.documentElement.classList.remove("light");
      document.documentElement.classList.add("dark");
      document.documentElement.setAttribute("data-theme", "dark");
    }
  }, []);

  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function handleLogout() {
    setIsLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {}
    window.location.href = "/login";
  }

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

      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Public Booking Link (Desktop only; on mobile it's in the profile popover & 'Más' sheet) */}
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

        {/* Guided Tour Direct Trigger (Desktop only) */}
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

        {/* Settings Button (Desktop only) */}
        <Link
          href="/dashboard/configuracion"
          className="hidden sm:inline-flex rounded-full p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          aria-label="Configuración"
          title="Ajustes del local"
        >
          <Settings className="h-4 w-4" />
        </Link>

        {/* Logout Button (Desktop only) */}
        <button
          type="button"
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="hidden sm:inline-flex rounded-full p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-rose-600 dark:hover:text-rose-400 transition disabled:opacity-50 cursor-pointer"
          aria-label="Cerrar sesión"
          title="Cerrar sesión"
        >
          <LogOut className="h-4 w-4" />
        </button>

        {/* Glassy 2.0 Universal Search Button (⌘K) */}
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

        {/* Mobile search icon button */}
        <button
          type="button"
          onClick={() => setCommandPaletteOpen(true)}
          className="inline-flex sm:hidden p-2 rounded-full text-slate-500 dark:text-zinc-400 hover:bg-white/50 dark:hover:bg-white/10 transition cursor-pointer"
          aria-label="Buscar"
          title="Búsqueda rápida"
        >
          <Search className="h-4 w-4" />
        </button>

        {/* Glassy 2.0 Appearance Quick Launcher (Interfas Glassy color-launch) */}
        <Link
          href="/dashboard/configuracion"
          className="hidden sm:inline-flex items-center gap-1.5 sm:gap-2 rounded-full border border-white/10 bg-white/[0.04] hover:bg-white/10 px-2.5 sm:px-3 py-1.5 text-xs text-zinc-300 transition shrink-0"
          title="Personalizar Apariencia & Colores"
        >
          <span
            className="h-2 w-2 rounded-full shrink-0 shadow-[0_0_8px_var(--primary)]"
            style={{ backgroundColor: business.primaryColor || "var(--primary, #FF4F2B)" }}
          />
          <span className="hidden sm:inline text-[11px] font-medium text-zinc-300">Apariencia</span>
        </Link>

        {/* User Profile Avatar with Native Popover Menu */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="h-8 w-8 sm:h-9 sm:w-9 rounded-full sm:rounded-xl flex items-center justify-center relative overflow-hidden border border-white/60 dark:border-white/30 backdrop-blur-xl shadow-xs shrink-0 select-none cursor-pointer hover:opacity-90 hover:scale-105 active:scale-95 transition ml-0.5"
            style={{
              background: `linear-gradient(135deg, var(--primary, #FF4F2B), color-mix(in srgb, var(--primary, #FF4F2B) 80%, #fff))`,
              boxShadow: `0 4px 12px rgba(var(--primary-rgb, 255, 79, 43), 0.35), inset 0 1px 1.5px rgba(255, 255, 255, 0.7)`
            }}
            title={`${userName || "Usuario"} (${currentUserRole})`}
            aria-label="Menú de usuario"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-white/35 via-white/10 to-transparent pointer-events-none rounded-full sm:rounded-xl" />
            {(business.logoUrl || business.logo) ? (
              <img
                src={business.logoUrl || business.logo}
                alt={userName || "Usuario"}
                className="w-full h-full object-cover rounded-full sm:rounded-xl relative z-10"
              />
            ) : (
              <span className="text-white font-extrabold text-xs relative z-10">
                {(userName || "A").charAt(0).toUpperCase()}
              </span>
            )}
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
                    className="h-9 w-9 rounded-full sm:rounded-xl flex items-center justify-center relative overflow-hidden border border-white/60 dark:border-white/30 backdrop-blur-xl shadow-xs shrink-0"
                    style={{
                      background: `linear-gradient(135deg, var(--primary, #FF4F2B), color-mix(in srgb, var(--primary, #FF4F2B) 80%, #fff))`,
                      boxShadow: `0 4px 12px rgba(var(--primary-rgb, 255, 79, 43), 0.35), inset 0 1px 1.5px rgba(255, 255, 255, 0.7)`
                    }}
                  >
                    {(business.logoUrl || business.logo) ? (
                      <img
                        src={business.logoUrl || business.logo}
                        alt={userName || "Usuario"}
                        className="w-full h-full object-cover rounded-full sm:rounded-xl relative z-10"
                      />
                    ) : (
                      <span className="text-white font-extrabold text-xs relative z-10">
                        {(userName || "A").charAt(0).toUpperCase()}
                      </span>
                    )}
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

      <CommandPalette
        open={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
      />
    </header>
  );
}
