"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Calendar,
  Wallet,
  Users,
  MoreHorizontal,
  Scissors,
  ShoppingBag,
  Coins,
  BarChart3,
  MessageSquare,
  Gift,
  QrCode,
  Palette,
  Settings,
  CreditCard,
  X,
  ChevronRight,
  LogOut,
  Clock,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { useDashboardStore } from "@/store/useDashboardStore";

export default function MobileTabBar() {
  const pathname = usePathname();
  const business = useDashboardStore((s) => s.business);
  const brandColor = business.primaryColor || "var(--primary, #0ea5e9)";

  const [isMoreSheetOpen, setIsMoreSheetOpen] = useState(false);

  // Close sheet on route change
  useEffect(() => {
    setIsMoreSheetOpen(false);
  }, [pathname]);

  // Lock body scroll when sheet is open
  useEffect(() => {
    if (isMoreSheetOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMoreSheetOpen]);

  const primaryTabs = [
    {
      id: "inicio",
      label: "Inicio",
      href: "/dashboard",
      icon: Home,
      isActive: pathname === "/dashboard",
    },
    {
      id: "agenda",
      label: "Agenda",
      href: "/dashboard/calendario",
      icon: Calendar,
      isActive: pathname.startsWith("/dashboard/calendario") || pathname.startsWith("/dashboard/nueva-reserva"),
    },
    {
      id: "caja",
      label: "Caja",
      href: "/dashboard/caja",
      icon: Wallet,
      isActive: pathname.startsWith("/dashboard/caja"),
    },
    {
      id: "clientes",
      label: "Clientes",
      href: "/dashboard/clientes",
      icon: Users,
      isActive: pathname.startsWith("/dashboard/clientes"),
    },
  ];

  const sheetSections = [
    {
      title: "Operaciones & Turnos",
      items: [
        {
          label: "Servicios & Catálogo",
          subtitle: "Precios, categorías y promos",
          href: "/dashboard/servicios",
          icon: Scissors,
          color: "text-indigo-500 bg-indigo-500/10",
        },
        {
          label: "Productos & Inventario",
          subtitle: "Control de stock y ventas",
          href: "/dashboard/productos",
          icon: ShoppingBag,
          color: "text-amber-500 bg-amber-500/10",
        },
        {
          label: "Bloquear Horario / Pausas",
          subtitle: "Almuerzos, feriados y vacaciones",
          href: "/dashboard/bloquear-horario",
          icon: Clock,
          color: "text-rose-500 bg-rose-500/10",
        },
      ],
    },
    {
      title: "Equipo & Finanzas",
      items: [
        {
          label: "Comisiones del Personal",
          subtitle: "Liquidaciones y recibos oficiales",
          href: "/dashboard/comisiones",
          icon: Coins,
          color: "text-emerald-500 bg-emerald-500/10",
        },
        {
          label: "Equipo & Especialistas",
          subtitle: "Colaboradores, roles y horarios",
          href: "/dashboard/equipo",
          icon: Users,
          color: "text-sky-500 bg-sky-500/10",
        },
        {
          label: "Transferencias SIPAP & OCR",
          subtitle: "Verificación de comprobantes bancarios",
          href: "/dashboard/transferencias",
          icon: CreditCard,
          color: "text-teal-500 bg-teal-500/10",
        },
        {
          label: "Métricas & Estadísticas",
          subtitle: "Analítica, ventas y ocupación",
          href: "/dashboard/estadisticas",
          icon: BarChart3,
          color: "text-violet-500 bg-violet-500/10",
        },
      ],
    },
    {
      title: "Canales & Marketing",
      items: [
        {
          label: "Bot WhatsApp & Flujo",
          subtitle: "Automatización de respuestas y QR",
          href: "/dashboard/whatsapp",
          icon: MessageSquare,
          color: "text-emerald-600 bg-emerald-600/10",
        },
        {
          label: "CRM Omnicanal",
          subtitle: "Bandeja unificada de clientes",
          href: "/dashboard/crm",
          icon: MessageSquare,
          color: "text-blue-500 bg-blue-500/10",
        },
        {
          label: "Fidelización & Tarjetas VIP",
          subtitle: "Sellos digitales y premios",
          href: "/dashboard/fidelizacion",
          icon: Gift,
          color: "text-pink-500 bg-pink-500/10",
        },
        {
          label: "Kit de Marketing & Carteles QR",
          subtitle: "Material impreso y Meta Pixel",
          href: "/dashboard/extras",
          icon: QrCode,
          color: "text-orange-500 bg-orange-500/10",
        },
      ],
    },
    {
      title: "Negocio & Personalización",
      items: [
        {
          label: "Apariencia del Portal Público",
          subtitle: "Colores, fotos, tipografías y links",
          href: "/dashboard/apariencia",
          icon: Palette,
          color: "text-purple-500 bg-purple-500/10",
        },
        {
          label: "Configuración del Negocio",
          subtitle: "Horarios, datos fiscales y pagos",
          href: "/dashboard/configuracion",
          icon: Settings,
          color: "text-slate-500 bg-slate-500/10",
        },
        {
          label: "Planes & Suscripción",
          subtitle: "Facturación legal e-Kuatia SET",
          href: "/dashboard/suscripcion",
          icon: Sparkles,
          color: "text-amber-600 bg-amber-600/10",
        },
      ],
    },
  ];

  return (
    <>
      {/* ═══ FIXED APPLE BOTTOM TAB BAR ═══ */}
      <nav
        aria-label="Navegación principal móvil"
        className="fixed bottom-0 inset-x-0 z-40 lg:hidden backdrop-blur-2xl bg-white/85 dark:bg-[#0c1017]/90 border-t border-slate-200/80 dark:border-white/10 shadow-[0_-8px_24px_rgba(0,0,0,0.06)] pb-[env(safe-area-inset-bottom,10px)] select-none transition-all duration-300"
      >
        <div className="flex items-center justify-around h-14 px-1 max-w-lg mx-auto">
          {primaryTabs.map((tab) => {
            const Icon = tab.icon;
            const active = tab.isActive && !isMoreSheetOpen;

            return (
              <Link
                key={tab.id}
                href={tab.href}
                className={`relative flex flex-col items-center justify-center flex-1 h-full py-1 text-center transition-all duration-200 active:scale-90 cursor-pointer ${
                  active
                    ? "font-black"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
                style={active ? { color: brandColor } : {}}
              >
                {active && (
                  <span
                    className="absolute -top-[1px] h-1 w-6 rounded-full transition-all duration-300"
                    style={{ backgroundColor: brandColor }}
                  />
                )}
                <div className="relative">
                  <Icon className={`h-5 w-5 transition-transform duration-200 ${active ? "scale-110" : ""}`} />
                </div>
                <span className="text-[10px] tracking-tight mt-0.5 font-medium leading-none">
                  {tab.label}
                </span>
              </Link>
            );
          })}

          {/* Tab 5: "Más" Button (triggers iOS Bottom Sheet) */}
          <button
            type="button"
            onClick={() => setIsMoreSheetOpen(!isMoreSheetOpen)}
            className={`relative flex flex-col items-center justify-center flex-1 h-full py-1 text-center transition-all duration-200 active:scale-90 cursor-pointer ${
              isMoreSheetOpen
                ? "font-black"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
            style={isMoreSheetOpen ? { color: brandColor } : {}}
          >
            {isMoreSheetOpen && (
              <span
                className="absolute -top-[1px] h-1 w-6 rounded-full transition-all duration-300"
                style={{ backgroundColor: brandColor }}
              />
            )}
            <div className="relative">
              <MoreHorizontal className={`h-5 w-5 transition-transform duration-200 ${isMoreSheetOpen ? "scale-110" : ""}`} />
            </div>
            <span className="text-[10px] tracking-tight mt-0.5 font-medium leading-none">
              Más
            </span>
          </button>
        </div>
      </nav>

      {/* ═══ APPLE IOS BOTTOM ACTION SHEET ("MÁS") ═══ */}
      {isMoreSheetOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end">
          {/* Backdrop Blur Overlay */}
          <div
            onClick={() => setIsMoreSheetOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 animate-in fade-in"
          />

          {/* Sheet Container */}
          <div className="relative z-10 w-full max-h-[85vh] rounded-t-[32px] bg-white dark:bg-[#0c1017] border-t border-slate-200/90 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300">
            {/* iOS Top Drag Indicator Pill */}
            <div className="pt-3 pb-2 shrink-0 flex flex-col items-center">
              <span className="h-1.5 w-12 rounded-full bg-slate-300 dark:bg-slate-700 mx-auto" />
            </div>

            {/* Sheet Header */}
            <div className="flex items-center justify-between px-5 pb-3 border-b border-slate-100 dark:border-slate-800/80 shrink-0">
              <div className="flex items-center gap-2.5">
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-xl text-white font-bold text-xs shadow-xs"
                  style={{ backgroundColor: brandColor }}
                >
                  {(business.name || "A").slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-white leading-tight">
                    {business.name}
                  </h3>
                  <p className="text-[11px] text-slate-400">Todas las secciones y herramientas</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsMoreSheetOpen(false)}
                className="p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white transition cursor-pointer"
                aria-label="Cerrar menú"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Sheet Scrollable Inset Grouped Content */}
            <div className="overflow-y-auto px-4 py-3 space-y-5 pb-[env(safe-area-inset-bottom,32px)]">
              {sheetSections.map((sec) => (
                <div key={sec.title} className="space-y-1.5">
                  <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-2">
                    {sec.title}
                  </h4>

                  {/* Grouped Inset Card */}
                  <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-slate-50/80 dark:bg-slate-900/60 divide-y divide-slate-100 dark:divide-slate-800/60 overflow-hidden shadow-xs">
                    {sec.items.map((item) => {
                      const Icon = item.icon;
                      const isItemActive = pathname === item.href;

                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setIsMoreSheetOpen(false)}
                          className={`flex items-center justify-between p-3 transition-colors active:bg-slate-100 dark:active:bg-slate-800/80 ${
                            isItemActive ? "bg-primary/5 dark:bg-primary/10" : ""
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className={`p-2 rounded-xl shrink-0 ${item.color}`}>
                              <Icon className="h-4 w-4" />
                            </div>
                            <div className="min-w-0">
                              <span
                                className={`text-xs font-bold block truncate ${
                                  isItemActive
                                    ? "text-primary font-black"
                                    : "text-slate-900 dark:text-white"
                                }`}
                                style={isItemActive ? { color: brandColor } : {}}
                              >
                                {item.label}
                              </span>
                              <span className="text-[10px] text-slate-400 block truncate">
                                {item.subtitle}
                              </span>
                            </div>
                          </div>
                          <ChevronRight className="h-4 w-4 text-slate-400 shrink-0 ml-2" />
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* External Portal Link Button */}
              <div className="pt-2">
                <Link
                  href={`/${business.slug || "barberia"}/reservar`}
                  target="_blank"
                  className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs active:scale-[0.98] transition-transform"
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className="h-2 w-2 rounded-full animate-pulse"
                      style={{ backgroundColor: brandColor }}
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white block">
                        Ver Portal Público de Reservas
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        agendate.py/{business.slug || "barberia"}
                      </span>
                    </div>
                  </div>
                  <ExternalLink className="h-4 w-4 text-slate-400" />
                </Link>
              </div>

              {/* Logout Option */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await fetch("/api/auth/logout", { method: "POST" });
                    } catch {}
                    window.location.href = "/login";
                  }}
                  className="w-full flex items-center justify-center gap-2 p-3 rounded-2xl text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-900/40 active:scale-[0.98] transition-all cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Cerrar Sesión</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
