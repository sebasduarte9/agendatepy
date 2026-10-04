"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  Calendar,
  Wallet,
  Users,
  Grid2X2,
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
  Compass,
} from "lucide-react";
import { useDashboardStore } from "@/store/useDashboardStore";

export default function MobileTabBar() {
  const pathname = usePathname();
  const business = useDashboardStore((s) => s.business);
  const openTour = useDashboardStore((s) => s.openTour);
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
      isActive:
        pathname.startsWith("/dashboard/calendario") ||
        pathname.startsWith("/dashboard/nueva-reserva"),
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
          color: "text-indigo-400 bg-indigo-500/15",
        },
        {
          label: "Productos & Inventario",
          subtitle: "Control de stock y ventas",
          href: "/dashboard/productos",
          icon: ShoppingBag,
          color: "text-amber-400 bg-amber-500/15",
        },
        {
          label: "Bloquear Horario / Pausas",
          subtitle: "Almuerzos, feriados y vacaciones",
          href: "/dashboard/bloquear-horario",
          icon: Clock,
          color: "text-rose-400 bg-rose-500/15",
        },
      ],
    },
    {
      title: "Finanzas & Personal",
      items: [
        {
          label: "Comisiones del Personal",
          subtitle: "Liquidaciones y recibos oficiales",
          href: "/dashboard/comisiones",
          icon: Coins,
          color: "text-emerald-400 bg-emerald-500/15",
        },
        {
          label: "Equipo & Especialistas",
          subtitle: "Colaboradores, roles y horarios",
          href: "/dashboard/equipo",
          icon: Users,
          color: "text-sky-400 bg-sky-500/15",
        },
        {
          label: "Transferencias SIPAP & OCR",
          subtitle: "Verificación de comprobantes bancarios",
          href: "/dashboard/transferencias",
          icon: CreditCard,
          color: "text-teal-400 bg-teal-500/15",
        },
        {
          label: "Métricas & Estadísticas",
          subtitle: "Analítica, ventas y ocupación",
          href: "/dashboard/estadisticas",
          icon: BarChart3,
          color: "text-violet-400 bg-violet-500/15",
        },
      ],
    },
    {
      title: "Marketing & Fidelización",
      items: [
        {
          label: "Bot de WhatsApp & Flujos",
          subtitle: "Automatización de respuestas y QR",
          href: "/dashboard/whatsapp",
          icon: MessageSquare,
          color: "text-emerald-400 bg-emerald-500/15",
        },
        {
          label: "CRM Omnicanal",
          subtitle: "Bandeja unificada de clientes",
          href: "/dashboard/crm",
          icon: MessageSquare,
          color: "text-blue-400 bg-blue-500/15",
        },
        {
          label: "Fidelización & Tarjetas VIP",
          subtitle: "Sellos digitales y premios",
          href: "/dashboard/fidelizacion",
          icon: Gift,
          color: "text-pink-400 bg-pink-500/15",
        },
        {
          label: "Kit de Marketing & Carteles QR",
          subtitle: "Material impreso y Meta Pixel",
          href: "/dashboard/extras",
          icon: QrCode,
          color: "text-orange-400 bg-orange-500/15",
        },
      ],
    },
    {
      title: "Personalización & Cuenta",
      items: [
        {
          label: "Estudio de Apariencia Web",
          subtitle: "Colores, fotos, tipografías y links",
          href: "/dashboard/apariencia",
          icon: Palette,
          color: "text-purple-400 bg-purple-500/15",
        },
        {
          label: "Configuración del Negocio",
          subtitle: "Horarios, datos fiscales y pagos",
          href: "/dashboard/configuracion",
          icon: Settings,
          color: "text-slate-400 bg-slate-500/15",
        },
        {
          label: "Planes & Suscripción",
          subtitle: "Facturación legal e-Kuatia SET",
          href: "/dashboard/suscripcion",
          icon: Sparkles,
          color: "text-amber-400 bg-amber-500/15",
        },
      ],
    },
  ];

  return (
    <>
      {/* ═══ APPLE FLOATING SQUIRCLE DOCK (ISLA FLOTANTE CUADRADA CON ESQUINAS REDONDEADAS) ═══ */}
      <nav
        aria-label="Navegación principal móvil"
        className="fixed bottom-3 inset-x-3.5 max-w-[430px] mx-auto z-40 lg:hidden rounded-[22px] bg-[#0c1017]/92 text-white border border-white/12 shadow-[0_12px_45px_rgba(0,0,0,0.55)] backdrop-blur-2xl px-2 py-1.5 select-none transition-all duration-300"
      >
        <div className="flex items-center justify-between h-13 relative">
          {primaryTabs.map((tab) => {
            const Icon = tab.icon;
            const active = tab.isActive && !isMoreSheetOpen;

            return (
              <Link
                key={tab.id}
                href={tab.href}
                className="relative flex flex-col items-center justify-center flex-1 h-full py-1 text-center transition-all duration-200 cursor-pointer group"
              >
                {/* Gliding Apple Pill Background with Framer Motion spring physics */}
                {active && (
                  <motion.div
                    layoutId="activeDockPill"
                    className="absolute inset-0 rounded-[16px] bg-white/12 border border-white/15 shadow-inner"
                    transition={{ type: "spring", stiffness: 450, damping: 32 }}
                  />
                )}

                <motion.div
                  whileTap={{ scale: 0.86 }}
                  className="relative z-10 flex flex-col items-center justify-center"
                >
                  <motion.div
                    animate={{ scale: active ? 1.15 : 1, y: active ? -1 : 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 25 }}
                    className="relative"
                  >
                    <Icon
                      className={`h-5 w-5 transition-colors duration-200 ${
                        active ? "text-white" : "text-white/60 group-hover:text-white"
                      }`}
                      style={active ? { color: brandColor } : {}}
                    />
                    {active && (
                      <motion.span
                        layoutId="activeDot"
                        className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full shadow-sm"
                        style={{
                          backgroundColor: brandColor,
                          boxShadow: `0 0 6px ${brandColor}`,
                        }}
                      />
                    )}
                  </motion.div>
                  <span
                    className={`text-[10px] tracking-tight mt-1 leading-none transition-colors duration-200 ${
                      active
                        ? "font-bold text-white"
                        : "font-medium text-white/50 group-hover:text-white/80"
                    }`}
                  >
                    {tab.label}
                  </span>
                </motion.div>
              </Link>
            );
          })}

          {/* Tab 5: "Más" Button with Apple Spring Physics */}
          <button
            type="button"
            onClick={() => setIsMoreSheetOpen(!isMoreSheetOpen)}
            className="relative flex flex-col items-center justify-center flex-1 h-full py-1 text-center transition-all duration-200 cursor-pointer group"
          >
            {isMoreSheetOpen && (
              <motion.div
                layoutId="activeDockPill"
                className="absolute inset-0 rounded-[16px] bg-white/12 border border-white/15 shadow-inner"
                transition={{ type: "spring", stiffness: 450, damping: 32 }}
              />
            )}

            <motion.div
              whileTap={{ scale: 0.86 }}
              className="relative z-10 flex flex-col items-center justify-center"
            >
              <motion.div
                animate={{
                  scale: isMoreSheetOpen ? 1.15 : 1,
                  rotate: isMoreSheetOpen ? 90 : 0,
                  y: isMoreSheetOpen ? -1 : 0,
                }}
                transition={{ type: "spring", stiffness: 500, damping: 25 }}
                className="relative"
              >
                <Grid2X2
                  className={`h-5 w-5 transition-colors duration-200 ${
                    isMoreSheetOpen ? "text-white" : "text-white/60 group-hover:text-white"
                  }`}
                  style={isMoreSheetOpen ? { color: brandColor } : {}}
                />
                {isMoreSheetOpen && (
                  <motion.span
                    layoutId="activeDot"
                    className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full shadow-sm"
                    style={{
                      backgroundColor: brandColor,
                      boxShadow: `0 0 6px ${brandColor}`,
                    }}
                  />
                )}
              </motion.div>
              <span
                className={`text-[10px] tracking-tight mt-1 leading-none transition-colors duration-200 ${
                  isMoreSheetOpen
                    ? "font-bold text-white"
                    : "font-medium text-white/50 group-hover:text-white/80"
                }`}
              >
                Más
              </span>
            </motion.div>
          </button>
        </div>
      </nav>

      {/* ═══ APPLE IOS BOTTOM ACTION SHEET ("MÁS") ═══ */}
      <AnimatePresence>
        {isMoreSheetOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end">
            {/* Backdrop Blur Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMoreSheetOpen(false)}
              className="fixed inset-0 bg-black/65 backdrop-blur-md"
            />

            {/* Sheet Container with Apple Spring Physics */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 350, damping: 30 }}
              className="relative z-10 w-full max-h-[88vh] rounded-t-[32px] bg-[#0c1017] text-white border-t border-slate-800 shadow-2xl flex flex-col overflow-hidden"
            >
              {/* iOS Top Drag Indicator Pill */}
              <div className="pt-3 pb-2 shrink-0 flex flex-col items-center">
                <span className="h-1.5 w-12 rounded-full bg-slate-700 mx-auto" />
              </div>

              {/* Sheet Header */}
              <div className="flex items-center justify-between px-5 pb-3 border-b border-slate-800/80 shrink-0">
                <div className="flex items-center gap-2.5">
                  <div
                    className="flex h-9 w-9 items-center justify-center rounded-2xl text-white font-black text-xs shadow-xs"
                    style={{ backgroundColor: brandColor }}
                  >
                    {(business.name || "A").slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-white leading-tight">
                      {business.name}
                    </h3>
                    <p className="text-[11px] text-slate-400">Panel de control & herramientas</p>
                  </div>
                </div>

                <motion.button
                  whileTap={{ scale: 0.9 }}
                  type="button"
                  onClick={() => setIsMoreSheetOpen(false)}
                  className="p-2 rounded-full bg-white/10 text-slate-300 hover:text-white transition cursor-pointer"
                  aria-label="Cerrar menú"
                >
                  <X className="h-4 w-4" />
                </motion.button>
              </div>

              {/* Sheet Scrollable Grouped Content */}
              <div className="overflow-y-auto px-4 py-4 space-y-5 pb-24">
                {/* Interactive Guided Tour Card inside Apple Sheet */}
                <button
                  type="button"
                  onClick={() => {
                    setIsMoreSheetOpen(false);
                    openTour();
                  }}
                  className="w-full flex items-center justify-between p-3.5 rounded-2xl border border-indigo-500/25 bg-gradient-to-r from-indigo-500/15 via-purple-500/10 to-indigo-500/5 hover:border-indigo-500/40 active:scale-[0.98] transition-all text-left group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-indigo-500 text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                      <Compass className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-white">Guía Interactiva & Tutorial</span>
                        <span className="px-1.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-indigo-500/25 text-indigo-300 border border-indigo-500/30">
                          Paso a paso
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Aprende a usar todas las funciones del sistema
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-indigo-400 group-hover:translate-x-0.5 transition-transform" />
                </button>

                {sheetSections.map((sec) => (
                  <div key={sec.title} className="space-y-1.5">
                    <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-2">
                      {sec.title}
                    </h4>

                    {/* Apple Grouped Inset Card */}
                    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 divide-y divide-slate-800/60 overflow-hidden shadow-xs">
                      {sec.items.map((item) => {
                        const Icon = item.icon;
                        const isItemActive = pathname === item.href;

                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setIsMoreSheetOpen(false)}
                            className={`flex items-center justify-between p-3.5 transition-colors active:bg-white/5 ${
                              isItemActive ? "bg-white/5" : ""
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className={`p-2.5 rounded-xl shrink-0 ${item.color}`}>
                                <Icon className="h-4 w-4" />
                              </div>
                              <div className="min-w-0">
                                <span
                                  className={`text-xs font-bold block truncate ${
                                    isItemActive ? "font-black" : "text-white"
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
                            <ChevronRight className="h-4 w-4 text-slate-500 shrink-0 ml-2" />
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
                    className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-800 bg-slate-900/80 shadow-xs active:scale-[0.98] transition-transform"
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className="h-2 w-2 rounded-full animate-pulse"
                        style={{ backgroundColor: brandColor }}
                      />
                      <div>
                        <span className="text-xs font-bold text-white block">
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
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        await fetch("/api/auth/logout", { method: "POST" });
                      } catch {}
                      window.location.href = "/login";
                    }}
                    className="w-full flex items-center justify-center gap-2 p-3.5 rounded-2xl text-xs font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 active:scale-[0.98] transition-all cursor-pointer"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Cerrar Sesión</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
