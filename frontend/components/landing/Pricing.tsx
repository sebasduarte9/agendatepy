"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, X, Shield, CheckCircle2, Zap, ChevronDown } from "lucide-react";
import { motion } from "framer-motion";
import { getCommercialWhatsAppUrl } from "@/lib/config/whatsapp";

const FREE_FEATURES = [
  { ok: true, label: "1 profesional / agenda personal" },
  { ok: true, label: "Hasta 20 turnos por mes gratis" },
  { ok: true, label: "Página web propia con tu logo" },
  { ok: true, label: "Confirmaciones por WhatsApp" },
  { ok: true, label: "0% de comisión por turno cobrado" },
  { ok: false, label: "Cálculo de comisiones de empleados" },
  { ok: false, label: "Módulo de caja y arqueo diario" },
];

const BASIC_FEATURES = [
  { ok: true, label: "1 profesional / agenda personal" },
  { ok: true, label: "Hasta 100 turnos por mes" },
  { ok: true, label: "Página web propia con logo" },
  { ok: true, label: "Confirmaciones por WhatsApp" },
  { ok: true, label: "Recordatorios automáticos" },
  { ok: true, label: "Sincronización Google Calendar" },
  { ok: false, label: "Módulo de caja y comisiones" },
];

const PRO_FEATURES = [
  { ok: true, label: "Hasta 10 profesionales en equipo" },
  { ok: true, label: "Turnos y citas 100% ilimitadas" },
  { ok: true, label: "Recordatorios automáticos WhatsApp" },
  { ok: true, label: "WhatsApp Masivo & Campañas" },
  { ok: true, label: "Cálculo automático de comisiones" },
  { ok: true, label: "Módulo de Caja y arqueo diario" },
  { ok: true, label: "Ficha CRM y Google Calendar" },
];

const EMPRESA_FEATURES = [
  { ok: true, label: "Profesionales ilimitados" },
  { ok: true, label: "Múltiples sucursales / locales" },
  { ok: true, label: "WhatsApp desde el número propio" },
  { ok: true, label: "Reportes avanzados y exportación" },
  { ok: true, label: "Capacitación a tu equipo incluida" },
  { ok: true, label: "Factura legal con IVA y RUC" },
  { ok: true, label: "Soporte VIP telefónico y WhatsApp" },
];

export default function Pricing() {
  const [annual, setAnnual] = useState(false);

  return (
    <section
      id="precios"
      className="relative pt-6 pb-12 sm:pt-10 sm:pb-16 lg:pt-10 lg:pb-20 scroll-mt-20"
    >
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-4xl xl:max-w-5xl mx-auto space-y-2 sm:space-y-2.5"
        >
          <span className="inline-flex items-center gap-1.5 rounded-full border border-brand/20 bg-brand/10 dark:bg-brand/20 px-3.5 py-1 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-brand">
            <CheckCircle2 className="h-3.5 w-3.5" /> Precios Transparentes en Guaraníes (PYG)
          </span>

          <h2 className="text-2xl xs:text-3xl sm:text-4xl md:text-[38px] lg:text-[40px] xl:text-[44px] 2xl:text-5xl font-black tracking-tight text-slate-900 dark:text-white lg:whitespace-nowrap">
            Planes a tu medida,{" "}
            <span className="bg-gradient-to-r from-brand via-[#FF6B4A] to-amber-500 bg-clip-text text-transparent">
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
            className={`transition-colors cursor-pointer ${!annual ? "text-brand dark:text-white font-bold" : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"}`}
          >
            Facturación Mensual
          </button>

          <button
            type="button"
            onClick={() => setAnnual((value) => !value)}
            className={`relative h-7 sm:h-8 w-13 sm:w-15 rounded-full p-1 transition-all duration-300 shadow-inner cursor-pointer ${
              annual ? "bg-gradient-to-r from-brand to-[#FF6B4A]" : "bg-slate-300 dark:bg-slate-700"
            }`}
            aria-label="Cambiar facturación mensual o anual"
          >
            <motion.div
              layout
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              className={`h-5 w-5 sm:h-6 sm:w-6 rounded-full bg-white shadow-md ${annual ? "ml-auto" : "mr-auto"}`}
            />
          </button>

          <button
            type="button"
            onClick={() => setAnnual(true)}
            className={`flex items-center gap-1.5 transition-colors cursor-pointer ${
              annual ? "text-brand dark:text-[#FF6B4A] font-bold" : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            <span>Pago Anual</span>
            <span className="rounded-full bg-brand/10 dark:bg-brand/20 border border-brand/30 px-2 py-0.5 text-[9px] sm:text-[10px] font-black text-brand dark:text-[#FF6B4A] shadow-2xs">
              2 Meses Gratis
            </span>
          </button>
        </div>

        {/* Grilla de Planes: Freemium + 3 Planes de Pago */}
        <div className="mt-6 sm:mt-8 grid gap-4 lg:gap-3 xl:gap-4.5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 items-stretch">
          {/* 1. Plan Inicial Gratuito */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col h-full min-w-0"
          >
            <PriceCard
              name="Plan Gratuito"
              badge="Para Empezar"
              description="Ideal para arrancar sin costo y digitalizarte hoy."
              price="Gs. 0"
              period="/para siempre"
              annual={annual}
              isFree={true}
              cta="Comenzar Gratis"
              href="/onboarding"
              features={FREE_FEATURES}
            />
          </motion.div>

          {/* 2. Plan Básico */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.65, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col h-full min-w-0"
          >
            <PriceCard
              name="Plan Básico"
              description="Para profesionales independientes en crecimiento."
              price={annual ? "Gs. 80.000" : "Gs. 100.000"}
              period="/mes"
              annual={annual}
              savings="Ahorrás Gs. 240.000 al año"
              billedDetail="Gs. 960.000 facturado anual"
              cta="Elegir Básico"
              href="/onboarding"
              features={BASIC_FEATURES}
            />
          </motion.div>

          {/* 3. Plan Pro */}
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.65, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col h-full min-w-0"
          >
            <PriceCard
              name="Plan Pro"
              badge="Más Popular en PY"
              description="Para salones, barberías y spas con equipo."
              price={annual ? "Gs. 200.000" : "Gs. 250.000"}
              period="/mes"
              annual={annual}
              savings="Ahorrás Gs. 600.000 al año"
              billedDetail="Gs. 2.400.000 facturado anual"
              cta="Probar Plan Pro"
              href="/onboarding"
              features={PRO_FEATURES}
              highlighted
            />
          </motion.div>

          {/* 4. Plan Empresa */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.65, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col h-full min-w-0"
          >
            <PriceCard
              name="Plan Empresa"
              description="Para franquicias, sucursales y clínicas."
              price={annual ? "Gs. 520.000" : "Gs. 650.000"}
              period="/mes"
              annual={annual}
              savings="Ahorrás Gs. 1.560.000 al año"
              billedDetail="Gs. 6.240.000 facturado anual"
              cta="Consultar por Empresa"
              href={getCommercialWhatsAppUrl("Hola AgendatePY, quisiera asesoramiento sobre el Plan Empresa")}
              isExternal={true}
              features={EMPRESA_FEATURES}
            />
          </motion.div>
        </div>

        {/* Garantía y Formas de Pago */}
        <div className="mt-7 sm:mt-10 text-center text-xs text-slate-500 dark:text-slate-400">
          <p className="flex items-center justify-center gap-2 font-medium">
            <Shield className="h-4 w-4 text-brand dark:text-[#FF6B4A] shrink-0" />
            Plan Inicial Gratuito para siempre (20 turnos/mes) · Sin tarjeta de crédito ni contratos · Pagá planes superiores con QR Bancard o SIPAP.
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
  features: { ok: boolean; label: string }[];
  badge?: string;
  highlighted?: boolean;
}) {
  const [showAllMobile, setShowAllMobile] = useState(false);

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
            <span className="text-2xl sm:text-3xl lg:text-[23px] xl:text-[28px] font-black tracking-tight text-slate-900 dark:text-white font-mono shrink-0">
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
                <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-tight">
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

        {/* Lista de características (7 ítems homogéneos por tarjeta) */}
        <ul className="space-y-2 sm:space-y-2.5 text-xs">
          {features.map((item, idx) => (
            <li
              key={item.label}
              className={`items-start gap-2.5 ${
                idx >= 4 && !showAllMobile ? "hidden sm:flex" : "flex"
              }`}
            >
              <span
                className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] mt-0.5 ${
                  item.ok
                    ? "bg-brand/15 text-brand dark:text-[#FF6B4A] font-bold"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                }`}
              >
                {item.ok ? <Check className="h-3 w-3 stroke-[3]" /> : <X className="h-3 w-3" />}
              </span>
              <span
                className={
                  item.ok
                    ? "font-medium text-slate-700 dark:text-slate-200 leading-snug"
                    : "text-slate-400 line-through leading-snug"
                }
              >
                {item.label}
              </span>
            </li>
          ))}
        </ul>

        {features.length > 4 && (
          <button
            type="button"
            onClick={() => setShowAllMobile(!showAllMobile)}
            className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-brand/25 bg-brand/5 dark:bg-brand/10 px-3 py-1 text-[11px] font-bold text-brand hover:bg-brand/10 transition sm:hidden cursor-pointer active:scale-95"
            aria-expanded={showAllMobile}
          >
            <span>{showAllMobile ? "Ver menos características" : `Ver más características (+${features.length - 4})`}</span>
            <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${showAllMobile ? "rotate-180" : ""}`} />
          </button>
        )}
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
