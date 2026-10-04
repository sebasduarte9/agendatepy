"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
import { triggerHaptic } from "@/lib/haptics";

export default function MobileTabBar() {
  const pathname = usePathname();
  const router = useRouter();
  const business = useDashboardStore((s) => s.business);
  const openTour = useDashboardStore((s) => s.openTour);
  const brandColor = business.primaryColor || "var(--primary, #FF4F2B)";

  const [isMoreSheetOpen, setIsMoreSheetOpen] = useState(false);

  // Close sheet on route change
  useEffect(() => {
    setIsMoreSheetOpen(false);
  }, [pathname]);

  // Prefetch core routes for 0ms instantaneous section switching
  useEffect(() => {
    router.prefetch("/dashboard");
    router.prefetch("/dashboard/calendario");
    router.prefetch("/dashboard/caja");
    router.prefetch("/dashboard/clientes");
    router.prefetch("/dashboard/servicios");
    router.prefetch("/dashboard/productos");
    router.prefetch("/dashboard/bloquear-horario");
  }, [router]);

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
        },
        {
          label: "Productos & Inventario",
          subtitle: "Control de stock y ventas",
          href: "/dashboard/productos",
          icon: ShoppingBag,
        },
        {
          label: "Bloquear Horario / Pausas",
          subtitle: "Almuerzos, feriados y vacaciones",
          href: "/dashboard/bloquear-horario",
          icon: Clock,
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
        },
        {
          label: "Equipo & Especialistas",
          subtitle: "Colaboradores, roles y horarios",
          href: "/dashboard/equipo",
          icon: Users,
        },
        {
          label: "Transferencias SIPAP & OCR",
          subtitle: "Verificación de comprobantes bancarios",
          href: "/dashboard/transferencias",
          icon: CreditCard,
        },
        {
          label: "Métricas y Análisis",
          subtitle: "Analítica, ventas y ocupación",
          href: "/dashboard/estadisticas",
          icon: BarChart3,
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
        },
        {
          label: "CRM Omnicanal",
          subtitle: "Bandeja unificada de clientes",
          href: "/dashboard/crm",
          icon: MessageSquare,
        },
        {
          label: "Fidelización & Tarjetas VIP",
          subtitle: "Sellos digitales y premios",
          href: "/dashboard/fidelizacion",
          icon: Gift,
        },
        {
          label: "Kit de Marketing & Carteles QR",
          subtitle: "Material impreso y Meta Pixel",
          href: "/dashboard/extras",
          icon: QrCode,
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
        },
        {
          label: "Configuración del Negocio",
          subtitle: "Horarios, datos fiscales y pagos",
          href: "/dashboard/configuracion",
          icon: Settings,
        },
        {
          label: "Planes & Suscripción",
          subtitle: "Gestión de tu cuenta y planes",
          href: "/dashboard/suscripcion",
          icon: Sparkles,
        },
      ],
    },
  ];

  return (
    <>
      {/* ═══ APPLE FLOATING SQUIRCLE DOCK (ISLA FLOTANTE CUADRADA CON ESQUINAS REDONDEADAS) ═══ */}
      <nav
        aria-label="Navegación principal móvil"
        className="fixed bottom-[calc(0.75rem+env(safe-area-inset-bottom,0px))] inset-x-3.5 max-w-[430px] mx-auto z-40 lg:hidden rounded-[22px] bg-white/85 dark:bg-[#09090b]/92 text-slate-800 dark:text-white border border-slate-200/80 dark:border-white/12 shadow-[0_10px_35px_rgba(0,0,0,0.08)] dark:shadow-[0_12px_45px_rgba(0,0,0,0.55)] backdrop-blur-2xl px-2 py-1.5 select-none"
      >
        <div className="flex items-center justify-between h-13 relative">
          {primaryTabs.map((tab) => {
            const Icon = tab.icon;
            const active = tab.isActive && !isMoreSheetOpen;

            return (
              <Link
                key={tab.id}
                href={tab.href}
                prefetch={true}
                onClick={() => triggerHaptic("selection")}
                className="relative flex flex-col items-center justify-center flex-1 h-full py-1 text-center cursor-pointer group"
              >
                {/* Gliding Apple Pill Background with Framer Motion spring physics */}
                {active && (
                  <motion.div
                    layoutId="activeDockPill"
                    className="absolute inset-0 rounded-[16px] bg-slate-100/90 dark:bg-white/10 border border-slate-200/70 dark:border-white/15 shadow-xs"
                    transition={{ type: "spring", stiffness: 500, damping: 36, mass: 0.6 }}
                  />
                )}

                <motion.div
                  whileTap={{ scale: 0.94 }}
                  className="relative z-10 flex flex-col items-center justify-center"
                >
                  <motion.div
                    animate={{ scale: active ? 1.08 : 1, y: active ? -1 : 0 }}
                    transition={{ type: "spring", stiffness: 600, damping: 30 }}
                    className="relative"
                  >
                    <Icon
                      className={`h-5 w-5 transition-colors duration-150 ${
                        active
                          ? ""
                          : "text-slate-400 dark:text-white/60 group-hover:text-slate-700 dark:group-hover:text-white"
                      }`}
                      style={active ? { color: brandColor } : {}}
                    />
                  </motion.div>
                  <span
                    className={`text-[10px] tracking-tight mt-1 leading-none transition-colors duration-150 ${
                      active
                        ? "font-bold text-slate-900 dark:text-white"
                        : "font-medium text-slate-500 dark:text-white/50 group-hover:text-slate-700 dark:group-hover:text-white/80"
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
            onClick={() => {
              triggerHaptic("selection");
              setIsMoreSheetOpen(!isMoreSheetOpen);
            }}
            className="relative flex flex-col items-center justify-center flex-1 h-full py-1 text-center cursor-pointer group"
          >
            {isMoreSheetOpen && (
              <motion.div
                layoutId="activeDockPill"
                className="absolute inset-0 rounded-[16px] bg-slate-100/90 dark:bg-white/10 border border-slate-200/70 dark:border-white/15 shadow-xs"
                transition={{ type: "spring", stiffness: 500, damping: 36, mass: 0.6 }}
              />
            )}

            <motion.div
              whileTap={{ scale: 0.94 }}
              className="relative z-10 flex flex-col items-center justify-center"
            >
              <motion.div
                animate={{
                  scale: isMoreSheetOpen ? 1.08 : 1,
                  rotate: isMoreSheetOpen ? 90 : 0,
                  y: isMoreSheetOpen ? -1 : 0,
                }}
                transition={{ type: "spring", stiffness: 600, damping: 30 }}
                className="relative"
              >
                <Grid2X2
                  className={`h-5 w-5 transition-colors duration-150 ${
                    isMoreSheetOpen
                      ? ""
                      : "text-slate-400 dark:text-white/60 group-hover:text-slate-700 dark:group-hover:text-white"
                  }`}
                  style={isMoreSheetOpen ? { color: brandColor } : {}}
                />
              </motion.div>
              <span
                className={`text-[10px] tracking-tight mt-1 leading-none transition-colors duration-150 ${
                  isMoreSheetOpen
                    ? "font-bold text-slate-900 dark:text-white"
                    : "font-medium text-slate-500 dark:text-white/50 group-hover:text-slate-700 dark:group-hover:text-white/80"
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
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-md"
            />

            {/* Sheet Container with Apple Spring Physics */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 350, damping: 30 }}
              className="relative z-10 w-full max-h-[88vh] rounded-t-[32px] bg-[#f8fafc] dark:bg-[#121215] text-slate-900 dark:text-white border-t border-slate-200/80 dark:border-white/10 shadow-2xl flex flex-col overflow-hidden pb-[calc(1.5rem+env(safe-area-inset-bottom,16px))]"
            >
              {/* iOS Top Drag Indicator Pill */}
              <div className="pt-3 pb-2 shrink-0 flex flex-col items-center cursor-grab active:cursor-grabbing">
                <span className="h-1.5 w-12 rounded-full bg-slate-300 dark:bg-slate-700 mx-auto" />
              </div>

              {/* Sheet Header */}
              <div className="flex items-center justify-between px-5 pb-3 border-b border-slate-200/80 dark:border-white/10 shrink-0">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl text-white font-black text-xs shadow-xs"
                    style={{ backgroundColor: brandColor }}
                  >
                    {(business.name || "A").slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-extrabold text-sm text-slate-900 dark:text-white leading-tight truncate">
                      {business.name}
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      Panel de control & herramientas
                    </p>
                  </div>
                </div>

                <motion.button
                  whileTap={{ scale: 0.9 }}
                  type="button"
                  onClick={() => setIsMoreSheetOpen(false)}
                  className="p-2 rounded-full bg-slate-200/60 dark:bg-white/10 text-slate-500 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition cursor-pointer shrink-0"
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
                  className="w-full flex items-center justify-between p-3.5 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900/70 hover:border-slate-300 dark:hover:border-white/20 active:scale-[0.98] transition-all text-left group shadow-xs cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="p-2.5 rounded-xl text-white shadow-xs group-hover:scale-105 transition-transform"
                      style={{ backgroundColor: brandColor }}
                    >
                      <Compass className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          Guía Interactiva & Tutorial
                        </span>
                        <span
                          className="px-1.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider border"
                          style={{
                            color: brandColor,
                            backgroundColor: `${brandColor}15`,
                            borderColor: `${brandColor}30`,
                          }}
                        >
                          Paso a paso
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Aprende a usar todas las funciones del sistema
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-400 dark:text-slate-500 group-hover:translate-x-0.5 transition-transform" />
                </button>

                {sheetSections.map((sec) => (
                  <div key={sec.title} className="space-y-1.5">
                    <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-2">
                      {sec.title}
                    </h4>

                    {/* Apple Grouped Inset Card */}
                    <div className="rounded-2xl border border-slate-200/80 dark:border-white/5 bg-white dark:bg-slate-900/60 divide-y divide-slate-100 dark:divide-white/5 overflow-hidden shadow-xs">
                      {sec.items.map((item) => {
                        const Icon = item.icon;
                        const isItemActive = pathname === item.href;

                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            prefetch={true}
                            onClick={() => {
                              triggerHaptic("selection");
                              setIsMoreSheetOpen(false);
                            }}
                            className={`flex items-center justify-between p-3.5 transition-colors active:bg-slate-50 dark:active:bg-white/5 ${
                              isItemActive
                                ? "bg-slate-50/80 dark:bg-white/5 font-semibold"
                                : ""
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div
                                className={`p-2.5 rounded-xl shrink-0 transition-colors ${
                                  isItemActive
                                    ? ""
                                    : "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300"
                                }`}
                                style={
                                  isItemActive
                                    ? {
                                        backgroundColor: `${brandColor}18`,
                                        color: brandColor,
                                      }
                                    : {}
                                }
                              >
                                <Icon className="h-4 w-4" />
                              </div>
                              <div className="min-w-0">
                                <span
                                  className={`text-xs block truncate ${
                                    isItemActive
                                      ? "font-black"
                                      : "font-bold text-slate-800 dark:text-slate-200"
                                  }`}
                                  style={isItemActive ? { color: brandColor } : {}}
                                >
                                  {item.label}
                                </span>
                                <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate">
                                  {item.subtitle}
                                </span>
                              </div>
                            </div>
                            <ChevronRight className="h-4 w-4 text-slate-300 dark:text-slate-600 shrink-0 ml-2" />
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ))}

                {/* External Portal Link Button */}
                <div className="pt-1">
                  <Link
                    href={`/${business.slug || "barberia"}/reservar`}
                    target="_blank"
                    className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-200/80 dark:border-white/5 bg-white dark:bg-slate-900/60 shadow-xs active:scale-[0.98] transition-transform"
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
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        await fetch("/api/auth/logout", { method: "POST" });
                      } catch {}
                      window.location.href = "/login";
                    }}
                    className="w-full flex items-center justify-center gap-2 p-3.5 rounded-2xl text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 border border-rose-200/70 dark:border-rose-500/20 active:scale-[0.98] transition-all cursor-pointer"
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
