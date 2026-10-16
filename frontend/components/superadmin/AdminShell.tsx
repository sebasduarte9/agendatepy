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
  Bot,
  Zap,
  Smartphone,
  MessageSquare,
  GraduationCap,
} from "lucide-react";

export default function AdminShell({
  user,
  children,
}: {
  user: { email?: string };
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!sidebarOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSidebarOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [sidebarOpen]);

  const primaryNavItems = [
    {
      name: "Resumen",
      href: "/admin",
      icon: LayoutDashboard,
      exact: true,
    },
    {
      name: "CRM WhatsApp",
      href: "/admin/crm",
      icon: MessageSquare,
      exact: false,
    },
    {
      name: "Negocios",
      href: "/admin/negocios",
      icon: Building2,
      exact: false,
    },
    {
      name: "Mapa de Calor",
      href: "/admin/heatmap",
      icon: Flame,
      exact: false,
    },
    {
      name: "Bot IA WhatsApp",
      href: "/admin/whatsapp-ia",
      icon: Bot,
      exact: false,
    },
    {
      name: "Aprendizaje IA",
      href: "/admin/aprendizaje-ia",
      icon: GraduationCap,
      exact: false,
    },
    {
      name: "Verificación WhatsApp",
      href: "/admin/verificacion",
      icon: Smartphone,
      exact: false,
    },
    {
      name: "Auditoría",
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
      name: "Alertas",
      href: "/admin/alertas",
      icon: AlertTriangle,
      exact: false,
    },
    {
      name: "Adopción",
      href: "/admin/adopcion",
      icon: Boxes,
      exact: false,
    },
    {
      name: "Retención",
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

  return (
    <div data-admin-theme className="relative min-h-dvh overflow-x-hidden bg-[#090d16] text-slate-100 flex flex-col md:flex-row antialiased selection:bg-orange-400/25 selection:text-orange-100">
      <div className="glass-room" aria-hidden="true" />
      <div className="ambient-scene" aria-hidden="true">
        <div className="ambient-orb ambient-orb-1" />
        <div className="ambient-orb ambient-orb-2" />
        <div className="ambient-orb ambient-orb-3" />
      </div>
      {/* Mobile Sticky Header */}
      <header className="sticky top-0 z-30 flex h-14 md:hidden items-center justify-between border-b border-slate-200/80 bg-white/95 backdrop-blur-md px-4 shrink-0 shadow-xs">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="p-1.5 -ml-1 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition cursor-pointer shrink-0"
            aria-label="Abrir menú de navegación"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-orange-50 border border-orange-200/80 flex items-center justify-center text-[#FF4F2B] shrink-0 font-bold">
              A
            </div>
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="font-bold text-sm text-slate-900 truncate">
                agendate<span className="text-[#FF4F2B]">.py</span>
              </span>
              <span className="text-[10px] text-[#FF4F2B] font-bold px-1.5 py-0.5 rounded bg-orange-50 border border-orange-200/80 shrink-0">
                Admin
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/dashboard"
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 transition-colors border border-slate-200 shrink-0"
            title="Ir a vista tenant"
          >
            <ExternalLink className="w-3 h-3 text-slate-400" />
            <span className="text-[11px]">Tenant</span>
          </Link>
          <button
            onClick={handleLogout}
            className="p-1.5 text-xs rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors shrink-0"
            title="Cerrar sesión"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Mobile Drawer Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs md:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar - Idéntico al Panel de Clientes en PC pero para SuperAdmin */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200/80 flex flex-col shrink-0 transition-transform duration-200 ease-in-out md:static md:translate-x-0 ${
          sidebarOpen ? "translate-x-0 shadow-2xl shadow-slate-900/10" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div className="p-4 border-b border-slate-200/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#FF4F2B] to-[#FF6B4A] text-white flex items-center justify-center font-bold text-base shadow-sm shrink-0">
              A
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-bold tracking-tight text-slate-900 text-sm truncate">
                  agendate<span className="text-[#FF4F2B]">.py</span>
                </span>
                <span className="text-[10px] text-[#FF4F2B] font-bold px-1.5 py-0.5 rounded-full bg-orange-50 border border-orange-200/80 shrink-0">
                  Admin
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">Panel de Supervisión</p>
            </div>
          </div>

          {/* Close button on mobile */}
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition md:hidden cursor-pointer"
            aria-label="Cerrar menú"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation links */}
        <nav className="p-2.5 space-y-4 flex-1 overflow-y-auto">
          {/* Primary SaaS Section */}
          <div className="space-y-0.5">
            <div className="px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
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
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-orange-50 text-[#FF4F2B] border-l-4 border-[#FF4F2B] shadow-xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 border-l-4 border-transparent"
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-[#FF4F2B]" : "text-slate-400"}`} />
                  <span className="flex-1 truncate">{item.name}</span>
                </Link>
              );
            })}
          </div>

          {/* Secondary Diagnostic Section */}
          <div className="space-y-0.5 pt-3 border-t border-slate-100">
            <div className="px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
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
                  className={`flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-orange-50 text-[#FF4F2B] border-l-4 border-[#FF4F2B] shadow-xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 border-l-4 border-transparent"
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? "text-[#FF4F2B]" : "text-slate-400"}`} />
                  <span className="flex-1 truncate">{item.name}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* User profile card & actions */}
        <div className="p-3 border-t border-slate-200/80 bg-slate-50/80">
          <div className="flex items-center justify-between gap-2 mb-2 px-1">
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-800 truncate">{user.email}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-[11px] text-slate-500 font-medium">SuperAdmin</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <Link
              href="/dashboard"
              className="flex-1 flex items-center justify-center gap-1.5 px-2.5 py-1.5 text-xs font-bold rounded-lg bg-white hover:bg-slate-50 text-slate-700 transition-colors border border-slate-200 shadow-xs"
            >
              <ExternalLink className="w-3 h-3 text-slate-400" />
              Tenant View
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center justify-center p-1.5 text-xs rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer border border-transparent"
              title="Cerrar sesión"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 flex flex-col min-w-0 w-full max-w-full overflow-y-auto overflow-x-hidden bg-transparent text-slate-100">
        {children}
      </main>
    </div>
  );
}
