"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LogOut, Menu, Settings, Sun, Moon } from "lucide-react";
import { useDashboardStore } from "@/store/useDashboardStore";

export default function Header() {
  const business = useDashboardStore((s) => s.business);
  const setOpen = useDashboardStore((s) => s.setSidebarOpen);
  const currentUserRole = useDashboardStore((s) => s.currentUserRole);
  const currentStaffId = useDashboardStore((s) => s.currentStaffId);
  const setCurrentUserRole = useDashboardStore((s) => s.setCurrentUserRole);
  const pushToast = useDashboardStore((s) => s.pushToast);
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

  return (
    <header className="header sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200/80 dark:border-white/10 bg-white/85 dark:bg-slate-950/85 px-4 backdrop-blur-2xl transition-all duration-300">
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="rounded-xl p-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
          aria-label="Abrir menú"
          onClick={() => setOpen(true)}
        >
          <Menu className="h-5 w-5" />
        </button>
        <div>
          <p className="profile-name text-sm font-black text-slate-900 dark:text-white">{business.name}</p>
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <p className="profile-plan text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Plan {business.plan}
            </p>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {/* Role Switcher Pill */}
        <div className="relative">
          <select
            value={`${currentUserRole}:${currentStaffId || ""}`}
            onChange={(e) => {
              const [role, staffId] = e.target.value.split(":");
              setCurrentUserRole(role as any, staffId || undefined);
              const label =
                role === "admin"
                  ? "👑 Dueño / Administrador"
                  : role === "cajero"
                  ? "💳 Cajero / Facturación"
                  : role === "barbero"
                  ? "✂️ Barbero (Marcos)"
                  : "💅 Estilista (Sofía)";
              pushToast("success", `Vista cambiada a rol: ${label}`);
            }}
            aria-label="Cambiar rol activo"
            className="rounded-full border border-slate-200/80 dark:border-white/10 bg-slate-100/90 dark:bg-slate-900/90 py-1.5 pl-3 pr-7 text-xs font-bold text-slate-800 dark:text-slate-200 shadow-2xs hover:border-primary/50 transition cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary appearance-none"
          >
            <option value="admin:">👑 Admin (Dueño)</option>
            <option value="cajero:st-leticia">💳 Cajera (Leticia)</option>
            <option value="barbero:st-marcos">✂️ Barbero (Marcos)</option>
            <option value="estilista:st-sofia">💅 Estilista (Sofía)</option>
          </select>
          <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-400">
            ▼
          </div>
        </div>

        <Link
          href={`/${business.slug || "barberia"}/reservar`}
          target="_blank"
          className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-white/5 px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 shadow-2xs hover:border-primary hover:text-primary transition"
        >
          <span>Ver mi página</span>
          <span className="text-primary font-bold">↗</span>
        </Link>

        {/* Dark Mode Toggle */}
        <button
          type="button"
          onClick={toggleDarkMode}
          className="rounded-full p-2 text-slate-500 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          aria-label={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
          title={isDark ? "Modo Claro" : "Modo Oscuro"}
        >
          {isDark ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4" />}
        </button>

        <Link
          href="/dashboard/configuracion"
          className="rounded-full p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          aria-label="Configuración rápida"
        >
          <Settings className="h-4 w-4" />
        </Link>
        <Link
          href="/"
          className="rounded-full p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          aria-label="Salir"
        >
          <LogOut className="h-4 w-4" />
        </Link>
        <span className="profile-pic flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-primary to-indigo-600 text-xs font-black text-white shadow-md shadow-primary/25">
          {business.name.slice(0, 2).toUpperCase()}
        </span>
      </div>
    </header>
  );
}
