"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LogOut, Menu, Settings, Sun, Moon } from "lucide-react";
import { useDashboardStore } from "@/store/useDashboardStore";

export default function Header() {
  const business = useDashboardStore((s) => s.business);
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

  return (
    <header className="header sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-white/90 dark:bg-slate-900/90 px-4 backdrop-blur transition-colors">
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="rounded-lg p-2 text-slate-700 dark:text-slate-200 lg:hidden"
          aria-label="Abrir menú"
          onClick={() => setOpen(true)}
        >
          <Menu className="h-5 w-5" />
        </button>
        <div>
          <p className="profile-name text-sm font-bold text-slate-900 dark:text-slate-100">{business.name}</p>
          <p className="profile-plan text-xs capitalize text-slate-500 dark:text-slate-400">
            Plan {business.plan}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Link
          href={`/${business.slug || "barberia"}/reservar`}
          target="_blank"
          className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-xs hover:bg-slate-50 dark:hover:bg-slate-700 transition"
        >
          <span>Ver mi página</span>
          <span className="text-slate-400">↗</span>
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
        <span className="profile-pic flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-xs font-bold text-white shadow-xs">
          {business.name.slice(0, 2).toUpperCase()}
        </span>
      </div>
    </header>
  );
}
