"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence, useDragControls } from "framer-motion";
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
  Crown,
  ExternalLink,
  Compass,
} from "lucide-react";
import { useDashboardStore } from "@/store/useDashboardStore";
import { triggerHaptic } from "@/lib/haptics";
import { tenantHost } from "@/lib/tenant/public-url";

export default function MobileTabBar() {
  const pathname = usePathname();
  const router = useRouter();
  const business = useDashboardStore((s) => s.business);
  const openTour = useDashboardStore((s) => s.openTour);
  const brandColor = business.primaryColor || "var(--primary, #FF4F2B)";

  const [isMoreSheetOpen, setIsMoreSheetOpen] = useState(false);
  const dragControls = useDragControls();
  const sheetContentRef = React.useRef<HTMLDivElement>(null);
  const touchStartY = React.useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (sheetContentRef.current && sheetContentRef.current.scrollTop <= 0) {
      touchStartY.current = e.touches[0].clientY;
    } else {
      touchStartY.current = null;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartY.current === null) return;
    const currentY = e.touches[0].clientY;
    const deltaY = currentY - touchStartY.current;
    if (deltaY < 0) {
      touchStartY.current = null;
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartY.current === null) return;
    const currentY = e.changedTouches[0].clientY;
    const deltaY = currentY - touchStartY.current;
    if (deltaY > 80 && sheetContentRef.current && sheetContentRef.current.scrollTop <= 0) {
      triggerHaptic("light");
      setIsMoreSheetOpen(false);
    }
    touchStartY.current = null;
  };

  // Close sheet on route change
  useEffect(() => {
    setIsMoreSheetOpen(false);
  }, [pathname]);

  // Optimistic tab active state for 0ms instantaneous visual feedback
  const [optimisticPath, setOptimisticPath] = useState<string | null>(null);

  useEffect(() => {
    setOptimisticPath(null);
  }, [pathname]);

  const currentPath = optimisticPath || pathname;

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
      isActive: currentPath === "/dashboard",
    },
    {
      id: "agenda",
      label: "Agenda",
      href: "/dashboard/calendario",
      icon: Calendar,
      isActive:
        currentPath.startsWith("/dashboard/calendario") ||
        currentPath.startsWith("/dashboard/nueva-reserva"),
    },
    {
      id: "caja",
      label: "Caja",
      href: "/dashboard/caja",
      icon: Wallet,
      isActive: currentPath.startsWith("/dashboard/caja"),
    },
    {
      id: "clientes",
      label: "Clientes",
      href: "/dashboard/clientes",
      icon: Users,
      isActive: currentPath.startsWith("/dashboard/clientes"),
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
          label: "Transferencias Bancarias",
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
          label: "Asistente de WhatsApp",
          subtitle: "Respuestas con IA y avisos automáticos",
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
          icon: Crown,
        },
      ],
    },
  ];

  return (
    <>
      <nav
        aria-label="Navegación principal móvil"
        className="fixed bottom-[calc(0.75rem+env(safe-area-inset-bottom,0px))] inset-x-3.5 max-w-[430px] mx-auto z-40 lg:hidden rounded-[24px] bg-white/90 dark:bg-[rgba(27,25,30,0.85)] text-slate-800 dark:text-white border border-slate-200/80 dark:border-white/15 shadow-[0_12px_36px_rgba(0,0,0,0.08)] dark:shadow-[0_12px_45px_rgba(0,0,0,0.55)] backdrop-blur-2xl px-2 py-1.5 select-none"
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
                onPointerDown={() => router.prefetch(tab.href)}
                onClick={() => {
                  triggerHaptic("selection");
                  setOptimisticPath(tab.href);
                }}
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
                          : "text-slate-500 dark:text-white/60 group-hover:text-slate-700 dark:group-hover:text-white"
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
                      : "text-slate-500 dark:text-white/60 group-hover:text-slate-700 dark:group-hover:text-white"
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

      {/* ═══ BOTTOM SHEET GLASSY ("MÁS / PANEL DE CONTROL") ═══ */}
      <AnimatePresence>
        {isMoreSheetOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex items-end justify-center">
            {/* Backdrop Blur Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMoreSheetOpen(false)}
              className="fixed inset-0 bg-slate-950/70 backdrop-blur-md"
            />

            {/* Bottom Sheet de Cristal */}
            <motion.div
              key="more-sheet"
              initial={{ y: "100%", opacity: 0.8 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0.8 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              drag="y"
              dragControls={dragControls}
              dragListener={false}
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={0.2}
              onDragEnd={(_e, info) => {
                if (info.offset.y > 100 || info.velocity.y > 500) {
                  triggerHaptic("light");
                  setIsMoreSheetOpen(false);
                }
              }}
              className="relative z-10 w-full max-h-[90dvh] rounded-t-[32px] glass-modal text-slate-900 dark:text-white border-t border-x border-slate-200/80 dark:border-white/15 shadow-[0_-12px_45px_rgba(0,0,0,0.2)] flex flex-col overflow-hidden pb-4"
            >
              {/* Drag Handle */}
              <div 
                className="w-full flex justify-center pt-3 pb-2 shrink-0 cursor-grab active:cursor-grabbing touch-none"
                onPointerDown={(e) => dragControls.start(e)}
              >
                <div className="w-12 h-1.5 rounded-full bg-slate-300 dark:bg-white/20" />
              </div>

              {/* Window Header */}
              <div className="shrink-0 select-none pb-3 px-5 border-b border-slate-200/80 dark:border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl relative overflow-hidden border border-white/40 dark:border-white/20 shadow-xs"
                    style={{
                      background: `linear-gradient(145deg, ${brandColor}, color-mix(in srgb, ${brandColor} 75%, #000))`,
                    }}
                  >
                    <svg
                      viewBox="0 0 1200 1000"
                      className="h-4 w-4 relative z-10 drop-shadow-[0_1px_2px_rgba(0,0,0,0.35)]"
                      fill="#FFFFFF"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M305.11 882.3c-42.76 0-79.63-23.6-97.32-58.99-16.22-30.96-14.75-64.88-1.48-97.32l224.14-529.36c20.64-48.66 66.35-79.63 119.44-79.63h100.27c53.08 0 98.79 30.97 119.44 79.63l224.13 529.36c13.27 32.44 14.74 66.36-1.48 97.32-17.69 35.39-54.55 58.99-97.32 58.99-48.66 0-88.47-29.5-106.17-72.26l-64.88-160.72h-247.72l-64.88 160.72c-17.7 42.76-57.51 72.26-106.17 72.26z M 448.62 466.32 L 523.56 466.32 L 600.02 301.32 L 676.48 466.32 L 749.43 466.32 A 91.5 91.5 0 0 1 749.43 649.32 L 448.62 649.32 A 91.5 91.5 0 0 1 448.62 466.32 Z M 448.62 484.32 L 749.43 484.32 A 73.575 73.575 0 0 1 749.43 631.47 L 448.62 631.47 A 73.575 73.575 0 0 1 448.62 484.32 Z M753.27 616.14c-32.01 0-57.88-25.87-57.88-57.88 0-32 25.87-57.88 57.88-57.88 32.01 0 57.88 25.88 57.88 57.88 0 32.01-25.87 57.88-57.88 57.88z"
                      />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-extrabold text-sm text-slate-900 dark:text-white leading-tight truncate">
                      {business.name || "Agendatepy"}
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
                  aria-label="Cerrar ventana"
                >
                  <X className="h-4 w-4" />
                </motion.button>
              </div>

              {/* Sheet Scrollable Grouped Content */}
              <div
                ref={sheetContentRef}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                className="overflow-y-auto overscroll-contain px-4 py-4 space-y-5 pb-24"
              >
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
                            onPointerDown={() => router.prefetch(item.href)}
                            onClick={() => {
                              triggerHaptic("selection");
                              setOptimisticPath(item.href);
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
                          {tenantHost(business.slug || "barberia")}
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
