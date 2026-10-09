"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Check, Shield, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
const FREE_FEATURES = [
  "1 profesional / agenda personal",
  "Hasta 20 turnos por mes",
  "Tu propia página web de reservas con tu logo",
  "Link de reservas para Instagram y Google Maps",
  "0% de comisión por turno",
];

const BASIC_FEATURES = [
  "Hasta 100 turnos por mes",
  "Asistente IA que agenda por WhatsApp",
  "Confirmaciones automáticas por WhatsApp",
  "Tus clientes agendan el turno en Google Calendar",
];

const PRO_FEATURES = [
  "Hasta 10 profesionales en equipo",
  "Turnos ilimitados",
  "Recordatorios automáticos por WhatsApp",
  "Comisiones automáticas por profesional",
  "Caja y arqueo diario",
  "Ficha y CRM de clientes",
  "Soporte prioritario por WhatsApp",
];

const PLANS_DATA = [
  {
    id: "gratis",
    name: "Plan Gratuito",
    shortName: "Gratis",
    badge: "Para Empezar",
    description: "Ideal para arrancar sin costo y digitalizarte hoy.",
    priceMonthly: "Gs. 0",
    priceAnnual: "Gs. 0",
    period: "/para siempre",
    isFree: true,
    savings: undefined,
    billedDetail: undefined,
    cta: "Comenzar Gratis",
    href: "/onboarding",
    isExternal: false,
    includes: undefined,
    features: FREE_FEATURES,
    highlighted: false,
  },
  {
    id: "basico",
    name: "Plan Básico",
    shortName: "Básico",
    badge: undefined,
    description: "Para profesionales independientes en crecimiento.",
    priceMonthly: "Gs. 100.000",
    priceAnnual: "Gs. 80.000",
    period: "/mes",
    isFree: false,
    savings: "Ahorrás Gs. 240.000 al año",
    billedDetail: "Gs. 960.000 facturado anual",
    cta: "Elegir Básico",
    href: "/onboarding",
    isExternal: false,
    includes: "Todo lo del Gratis, y además:",
    features: BASIC_FEATURES,
    highlighted: false,
  },
  {
    id: "pro",
    name: "Plan Pro",
    shortName: "Plan Pro",
    badge: "Recomendado",
    description: "Para salones, barberías y spas con equipo.",
    priceMonthly: "Gs. 250.000",
    priceAnnual: "Gs. 200.000",
    period: "/mes",
    isFree: false,
    savings: "Ahorrás Gs. 600.000 al año",
    billedDetail: "Gs. 2.400.000 facturado anual",
    cta: "Probar Plan Pro",
    href: "/onboarding",
    isExternal: false,
    includes: "Todo lo del Básico, y además:",
    features: PRO_FEATURES,
    highlighted: true,
  },
];

export default function Pricing() {
  const [annual, setAnnual] = useState(false);
  const [mobilePlanIndex, setMobilePlanIndex] = useState(0); // 0: gratis, 1: basico, 2: pro, 3: empresa

  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const isFirstMount = useRef(true);

  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }
    const activeTabEl = tabRefs.current[mobilePlanIndex];
    if (activeTabEl && activeTabEl.parentElement) {
      const parent = activeTabEl.parentElement;
      const left = activeTabEl.offsetLeft - parent.offsetLeft - (parent.clientWidth - activeTabEl.clientWidth) / 2;
      parent.scrollTo({ left, behavior: "smooth" });
    }
  }, [mobilePlanIndex]);

  const activeMobilePlan = PLANS_DATA[mobilePlanIndex];

  const handlePrevPlan = () => {
    setMobilePlanIndex((prev) => (prev > 0 ? prev - 1 : PLANS_DATA.length - 1));
  };

  const handleNextPlan = () => {
    setMobilePlanIndex((prev) => (prev < PLANS_DATA.length - 1 ? prev + 1 : 0));
  };

  return (
    <section
      id="precios"
      className="relative pt-6 pb-12 sm:pt-10 sm:pb-16 lg:pt-10 lg:pb-20 scroll-mt-20"
    >
      <div className="relative mx-auto max-w-7xl px-3 sm:px-6">
        {/* Encabezado Principal */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-4xl xl:max-w-5xl mx-auto space-y-2 sm:space-y-2.5"
        >

          <h2 className="text-2xl xs:text-3xl sm:text-4xl md:text-[38px] lg:text-[40px] xl:text-[44px] 2xl:text-5xl font-black tracking-tight text-slate-900 dark:text-white lg:whitespace-nowrap">
            Planes a tu medida,{" "}
            <span className="text-[#FF4F2B]">
              sin comisiones ocultas
            </span>
          </h2>

          <p className="text-xs sm:text-sm md:text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto [text-wrap:balance]">
            Arrancá con nuestro <strong>Plan Inicial Gratuito (20 turnos/mes)</strong> o escalá a turnos ilimitados. Todo lo que facturás en tu negocio es 100% tuyo.
          </p>
        </motion.div>

        {/* Toggle Switch Facturación Mensual vs Anual */}
        <div className="mt-5 sm:mt-7 flex flex-wrap items-center justify-center gap-2.5 sm:gap-3.5 text-xs sm:text-sm font-semibold">
          <button
            type="button"
            onClick={() => setAnnual(false)}
            className={`min-h-10 px-1 transition-colors cursor-pointer ${!annual ? "text-brand dark:text-white font-bold" : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"}`}
          >
            <span className="sm:hidden">Mensual</span>
            <span className="hidden sm:inline">Facturación Mensual</span>
          </button>

          <button
            type="button"
            onClick={() => setAnnual((value) => !value)}
            className={`relative h-8 w-15 rounded-full p-1 transition-all duration-300 shadow-inner cursor-pointer ${
              annual ? "bg-gradient-to-r from-brand to-[#FF6B4A]" : "bg-slate-300 dark:bg-slate-700"
            }`}
            aria-label="Cambiar facturación mensual o anual"
          >
            <motion.div
              layout
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              className={`h-6 w-6 rounded-full bg-white shadow-md ${annual ? "ml-auto" : "mr-auto"}`}
            />
          </button>

          <button
            type="button"
            onClick={() => setAnnual(true)}
            className={`flex min-h-10 items-center gap-1.5 px-1 transition-colors cursor-pointer ${
              annual ? "text-brand dark:text-[#FF6B4A] font-bold" : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            <span>Pago Anual</span>
            <span className="rounded-full bg-brand/10 dark:bg-brand/20 border border-brand/30 px-2 py-0.5 text-[9px] sm:text-[10px] font-black text-brand dark:text-[#FF6B4A] shadow-2xs">
              2 Meses Gratis
            </span>
          </button>
        </div>

        {/* ============================================================== */}
        {/* MÓVIL: Panel Interactivo Flotante con Pestañas y Flechas (< >) */}
        {/* ============================================================== */}
        <div className="lg:hidden mt-5">
          {/* Pestañas Interactivas con Auto-scroll al centro */}
          <div className="flex justify-center px-1">
            <div className="inline-flex items-center gap-1 rounded-2xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-slate-900 p-1.5 shadow-sm max-w-full overflow-x-auto scrollbar-none scroll-smooth">
              {PLANS_DATA.map((plan, idx) => {
                const isActive = mobilePlanIndex === idx;
                return (
                  <button
                    key={plan.id}
                    ref={(el) => {
                      tabRefs.current[idx] = el;
                    }}
                    type="button"
                    onClick={() => setMobilePlanIndex(idx)}
                    className={`flex min-h-10 items-center gap-1.5 rounded-xl px-4 py-2 text-[13px] font-bold transition-all cursor-pointer whitespace-nowrap active:scale-95 ${
                      isActive
                        ? plan.highlighted
                          ? "bg-gradient-to-r from-brand to-[#FF6B4A] text-white shadow-xs font-black"
                          : "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs font-black"
                        : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    <span>{plan.shortName}</span>
                    {plan.highlighted && (
                      <span className={`h-1.5 w-1.5 rounded-full ${isActive ? "bg-amber-300" : "bg-brand"}`} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tarjeta Flotante con Botones Laterales en los Bordes */}
          <div className="relative mt-4 px-1 max-w-md mx-auto">
            {/* Tarjeta del plan activo: se desliza con el dedo para cambiar de plan */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeMobilePlan.id}
                initial={{ opacity: 0, scale: 0.97, x: 15 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.97, x: -15 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.25}
                onDragEnd={(_, info) => {
                  if (info.offset.x < -60) handleNextPlan();
                  else if (info.offset.x > 60) handlePrevPlan();
                }}
                className="touch-pan-y"
              >
                <PriceCard
                  name={activeMobilePlan.name}
                  badge={activeMobilePlan.badge}
                  description={activeMobilePlan.description}
                  price={annual ? activeMobilePlan.priceAnnual : activeMobilePlan.priceMonthly}
                  period={activeMobilePlan.period}
                  annual={annual}
                  isFree={activeMobilePlan.isFree}
                  savings={activeMobilePlan.savings}
                  billedDetail={activeMobilePlan.billedDetail}
                  cta={activeMobilePlan.cta}
                  href={activeMobilePlan.href}
                  isExternal={activeMobilePlan.isExternal}
                  includes={activeMobilePlan.includes}
                  features={activeMobilePlan.features}
                  highlighted={activeMobilePlan.highlighted}
                />
              </motion.div>
            </AnimatePresence>

            {/* Indicador de posición: el área táctil es más grande que el punto */}
            <div className="mt-2 flex items-center justify-center">
              {PLANS_DATA.map((plan, idx) => (
                <button
                  key={plan.id}
                  type="button"
                  onClick={() => setMobilePlanIndex(idx)}
                  className="flex h-8 items-center px-1.5 cursor-pointer"
                  aria-label={`Ir al ${plan.name}`}
                >
                  <span
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      mobilePlanIndex === idx
                        ? "w-6 bg-brand dark:bg-[#FF6B4A]"
                        : "w-1.5 bg-slate-300 dark:bg-slate-700"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* DESKTOP (PC/Laptops): Grilla de 3 Columnas Lado a Lado */}
        {/* ============================================================== */}
        <div className="hidden lg:grid lg:grid-cols-3 max-w-5xl mx-auto lg:gap-5 xl:gap-6 items-stretch mt-6 sm:mt-8">
          {PLANS_DATA.map((plan) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col h-full min-w-0"
            >
              <PriceCard
                name={plan.name}
                badge={plan.badge}
                description={plan.description}
                price={annual ? plan.priceAnnual : plan.priceMonthly}
                period={plan.period}
                annual={annual}
                isFree={plan.isFree}
                savings={plan.savings}
                billedDetail={plan.billedDetail}
                cta={plan.cta}
                href={plan.href}
                isExternal={plan.isExternal}
                includes={plan.includes}
                features={plan.features}
                highlighted={plan.highlighted}
              />
            </motion.div>
          ))}
        </div>

        {/* Garantía y Formas de Pago */}
        <div className="mt-7 sm:mt-10 text-center text-xs text-slate-500 dark:text-slate-400">
          <p className="flex items-center justify-center gap-2 font-medium">
            <Shield className="h-4 w-4 text-brand dark:text-[#FF6B4A] shrink-0" />
            Plan Inicial Gratuito para siempre (20 turnos/mes) · Sin tarjeta de crédito ni contratos · Pagá planes superiores con QR Bancard o transferencia bancaria.
          </p>
        </div>
      </div>
    </section>
  );
}

function PriceCard({
  name,
  description,
  price,
  period,
  annual = false,
  isFree = false,
  savings,
  billedDetail,
  cta,
  href = "/dashboard",
  isExternal = false,
  includes,
  features,
  badge,
  highlighted = false,
}: {
  name: string;
  description: string;
  price: string;
  period: string;
  annual?: boolean;
  isFree?: boolean;
  savings?: string;
  billedDetail?: string;
  cta: string;
  href?: string;
  isExternal?: boolean;
  includes?: string;
  features: string[];
  badge?: string;
  highlighted?: boolean;
}) {
  return (
    <motion.article
      whileHover={{ y: -6, scale: 1.015 }}
      transition={{ type: "spring", stiffness: 280, damping: 20 }}
      className={`relative rounded-3xl p-4 sm:p-5 lg:p-4.5 xl:p-5.5 flex flex-col justify-between transition-all duration-300 backdrop-blur-xl ${
        highlighted
          ? "border-2 border-brand bg-white/95 dark:bg-slate-900/95 shadow-[0_20px_45px_-12px_rgba(255,79,43,0.25)] ring-4 ring-brand/10 dark:ring-brand/20 hover:shadow-[0_25px_50px_-12px_rgba(255,79,43,0.3)]"
          : "border border-slate-200/90 dark:border-white/10 bg-white/80 dark:bg-slate-900/80 shadow-[0_12px_25px_-10px_rgba(0,0,0,0.04)] hover:border-brand/40 hover:shadow-lg"
      }`}
    >
      {highlighted && (
        <div className="pointer-events-none absolute -inset-0.5 rounded-3xl bg-gradient-to-r from-brand via-orange-500 to-amber-500 opacity-20 blur-xl" />
      )}

      <div className="relative z-10">
        <div className="flex items-center justify-between min-h-[26px]">
          <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">{name}</h3>
          {badge && (
            <span className="rounded-full bg-gradient-to-r from-brand to-[#FF6B4A] px-2.5 py-0.5 text-[9.5px] font-black uppercase tracking-wider text-white shadow-xs">
              {badge}
            </span>
          )}
        </div>

        <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400 min-h-[30px] leading-relaxed">
          {description}
        </p>

        {/* Precio y desglose de ahorro con altura reservada homogénea */}
        <div className="my-3 sm:my-4 border-b border-slate-100 dark:border-slate-800 pb-3 sm:pb-4">
          <div className="flex items-baseline gap-1 whitespace-nowrap">
            <span className="text-2xl sm:text-3xl lg:text-[23px] xl:text-[28px] font-black tracking-tight tabular-nums text-slate-900 dark:text-white shrink-0">
              {price}
            </span>
            <span className="text-xs font-semibold text-slate-400 shrink-0">{period}</span>
          </div>

          {/* Zona de altura fija homogénea */}
          <div className="mt-2 min-h-[38px] flex flex-col justify-center">
            {isFree ? (
              <div className="space-y-0.5">
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold leading-tight">
                  100% Gratis · Sin ingresar tarjeta
                </p>
                <p className="hidden sm:block text-[10px] text-slate-400 dark:text-slate-500 leading-tight">
                  Activación inmediata sin contrato
                </p>
              </div>
            ) : annual && savings ? (
              <motion.div
                key="annual-savings"
                initial={{ opacity: 0, y: -3 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="space-y-0.5"
              >
                <div className="inline-flex items-center gap-1.5 rounded-md bg-brand/10 border border-brand/20 px-2 py-0.5 text-[10.5px] font-bold text-brand dark:text-[#FF6B4A]">
                  <Zap className="h-3 w-3 fill-brand text-brand shrink-0" />
                  <span className="truncate">{savings}</span>
                </div>
                {billedDetail && (
                  <p className="text-[10px] text-slate-400 font-medium leading-none">
                    {billedDetail}
                  </p>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="monthly-info"
                initial={{ opacity: 0, y: 3 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="space-y-0.5"
              >
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-tight">
                  Facturación mensual · Sin permanencia
                </p>
                <p className="text-[10px] text-slate-400/80 dark:text-slate-500/80 leading-tight">
                  Cancelá cuando quieras
                </p>
              </motion.div>
            )}
          </div>
        </div>

        {includes && (
          <p className="mb-2.5 text-xs font-bold text-slate-900 dark:text-white">{includes}</p>
        )}
        <ul className="space-y-2.5 text-[13px] sm:text-xs">
          {features.map((label) => (
            <li key={label} className="flex items-start gap-2.5">
              <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full mt-0.5 bg-brand/15 text-brand dark:text-[#FF6B4A]">
                <Check className="h-3 w-3 stroke-[3]" />
              </span>
              <span className="font-medium text-slate-700 dark:text-slate-200 leading-snug">{label}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="relative z-10 pt-4 sm:pt-5">
        {isExternal ? (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 py-2.5 sm:py-3 text-xs sm:text-[13px] font-bold text-slate-800 dark:text-white shadow-xs hover:border-brand hover:text-brand transition"
          >
            {cta}
          </a>
        ) : (
          <Link
            href={href}
            className={`flex w-full items-center justify-center rounded-xl py-2.5 sm:py-3 text-xs sm:text-[13px] font-bold transition shadow-md active:scale-95 ${
              highlighted
                ? "bg-gradient-to-r from-brand to-[#FF6B4A] text-white shadow-brand/30 hover:brightness-110"
                : "border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:border-brand hover:text-brand"
            }`}
          >
            {cta}
          </Link>
        )}
      </div>
    </motion.article>
  );
}
