"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  Flame,
  Users,
  ShieldCheck,
  LogOut,
  ChevronRight,
  Calendar,
  MapPin,
  AlertTriangle,
  Cpu,
  Boxes,
  ExternalLink,
  Menu,
  X,
} from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<{ email?: string; role?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/me");
        if (!res.ok) {
          router.push("/login?callbackUrl=/admin");
          return;
        }
        const data = await res.json();
        const u = data.user || data;
        if (u.role !== "SUPERADMIN") {
          router.push("/dashboard");
          return;
        }
        setUser(u);
      } catch (err) {
        router.push("/login?callbackUrl=/admin");
      } finally {
        setLoading(false);
      }
    }
    checkAuth();
  }, [router]);

  const primaryNavItems = [
    {
      name: "Overview Global",
      href: "/admin",
      icon: LayoutDashboard,
      exact: true,
    },
    {
      name: "Directorio de Negocios",
      href: "/admin/negocios",
      icon: Building2,
      exact: false,
    },
    {
      name: "Web Heatmap",
      href: "/admin/heatmap",
      icon: Flame,
      exact: false,
    },
    {
      name: "Auditoría de Eventos",
      href: "/admin/auditoria",
      icon: ShieldCheck,
      exact: false,
    },
  ];

  const secondaryNavItems = [
    {
      name: "Salud del Sistema",
      href: "/admin/salud",
      icon: Cpu,
      exact: false,
    },
    {
      name: "Centro de Alertas",
      href: "/admin/alertas",
      icon: AlertTriangle,
      exact: false,
    },
    {
      name: "Matriz de Adopción",
      href: "/admin/adopcion",
      icon: Boxes,
      exact: false,
    },
    {
      name: "Cohortes & Retención",
      href: "/admin/cohortes",
      icon: Users,
      exact: false,
    },
    {
      name: "Geografía",
      href: "/admin/geografia",
      icon: MapPin,
      exact: false,
    },
  ];

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
    } catch (e) {
      router.push("/login");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-300">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-medium tracking-wide">Validando privilegios de Platform Admin...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row antialiased selection:bg-indigo-500 selection:text-white">
      {/* Mobile Sticky Header with 3-line hamburger menu button */}
      <header className="sticky top-0 z-30 flex h-14 md:hidden items-center justify-between border-b border-slate-800 bg-slate-950/90 backdrop-blur-xl px-4 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="p-2 -ml-1 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition cursor-pointer shrink-0"
            aria-label="Abrir menú de navegación"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center shadow-md shadow-indigo-500/20 shrink-0">
              <Calendar className="w-4 h-4 text-white" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-black text-sm text-white truncate">AgendatePY</span>
                <span className="text-[9px] uppercase font-bold px-1.5 py-0.2 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 shrink-0">
                  Admin
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/dashboard"
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700 shrink-0"
            title="Ir a vista tenant"
          >
            <ExternalLink className="w-3 h-3" />
            <span className="text-[11px]">Tenant</span>
          </Link>
          <button
            onClick={handleLogout}
            className="p-1.5 text-xs font-semibold rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors border border-red-500/20 shrink-0"
            title="Cerrar sesión"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Mobile Drawer Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm md:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar: Slide-over drawer on mobile (< md), static column on desktop (>= md) */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-slate-900/95 md:bg-slate-900/90 backdrop-blur-xl border-r border-slate-800 flex flex-col shrink-0 transition-transform duration-300 ease-in-out md:static md:translate-x-0 ${
          sidebarOpen ? "translate-x-0 shadow-2xl shadow-black" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 shrink-0">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-black tracking-tight text-white text-lg truncate">AgendatePY</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 shrink-0">
                  SaaS Admin
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">Panel de Plataforma</p>
            </div>
          </div>

          {/* Close button on mobile */}
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition md:hidden cursor-pointer"
            aria-label="Cerrar menú"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation links */}
        <nav className="p-3 space-y-4 flex-1 overflow-y-auto">
          {/* Primary SaaS Section */}
          <div className="space-y-1">
            <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Plataforma & Cuentas
            </div>
            {primaryNavItems.map((item) => {
              const isActive = item.exact
                ? pathname === item.href
                : pathname.startsWith(item.href);
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                  <span className="flex-1 truncate">{item.name}</span>
                  {isActive && <ChevronRight className="w-4 h-4 opacity-75" />}
                </Link>
              );
            })}
          </div>

          {/* Secondary Telemetry / Diagnostic Section */}
          <div className="space-y-1 pt-2 border-t border-slate-800/80">
            <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Diagnóstico & Telemetría
            </div>
            {secondaryNavItems.map((item) => {
              const isActive = item.exact
                ? pathname === item.href
                : pathname.startsWith(item.href);
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-indigo-600/40 text-indigo-200 border border-indigo-500/30"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? "text-indigo-300" : "text-slate-500"}`} />
                  <span className="flex-1 truncate">{item.name}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* User profile & actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/50">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-200 truncate">{user?.email}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span className="text-[11px] text-emerald-400 font-medium">SuperAdmin Verificado</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Link
              href="/dashboard"
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Tenant View
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center justify-center p-2 text-xs font-semibold rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors border border-red-500/20 cursor-pointer"
              title="Cerrar sesión"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 w-full max-w-full overflow-y-auto overflow-x-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
        {children}
      </main>
    </div>
  );
}
