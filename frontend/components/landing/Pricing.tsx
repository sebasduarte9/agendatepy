"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, X, Shield, Sparkles, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const BASIC_FEATURES = [
  { ok: true, label: "1 profesional / agenda" },
  { ok: true, label: "Hasta 100 turnos por mes" },
  { ok: true, label: "Página de reservas propia con tu logo" },
  { ok: true, label: "Bot de reservas por WhatsApp" },
  { ok: true, label: "Recordatorios automáticos" },
  { ok: false, label: "Cálculo de comisiones de empleados" },
  { ok: false, label: "Módulo de caja y arqueo diario" },
  { ok: false, label: "Aprobación manual de turnos" },
];

const PRO_FEATURES = [
  { ok: true, label: "Hasta 10 profesionales en equipo" },
  { ok: true, label: "Turnos y citas ilimitadas" },
  { ok: true, label: "Cálculo automático de comisiones" },
  { ok: true, label: "Módulo de Caja y arqueo diario" },
  { ok: true, label: "Ficha técnica y CRM de clientes" },
  { ok: true, label: "Recordatorios WhatsApp 24h y 2h antes" },
  { ok: true, label: "Sincronización con Google Calendar" },
  { ok: true, label: "0% de comisión sobre tus ventas" },
];

const EMPRESA_FEATURES = [
  { ok: true, label: "Profesionales ilimitados" },
  { ok: true, label: "Múltiples sucursales / locales" },
  { ok: true, label: "WhatsApp desde el número propio del local" },
  { ok: true, label: "Reportes avanzados y exportación a Excel" },
  { ok: true, label: "Capacitación a tu equipo incluida" },
  { ok: true, label: "Soporte VIP telefónico y WhatsApp" },
  { ok: true, label: "Factura legal con IVA y RUC" },
  { ok: true, label: "Integraciones personalizadas" },
];

export default function Pricing() {
  const [annual, setAnnual] = useState(false);

  return (
    <section id="precios" className="relative overflow-hidden bg-slate-50/80 dark:bg-slate-950 py-20 sm:py-28 border-t border-slate-200/80 dark:border-white/10 transition-colors">
      {/* Luces y resplandores ambientales de fondo */}
      <div className="pointer-events-none absolute -top-40 right-1/4 h-[500px] w-[500px] rounded-full bg-brand/10 blur-[130px] dark:bg-brand/20" />
      <div className="pointer-events-none absolute bottom-0 left-10 h-96 w-96 rounded-full bg-orange-500/10 blur-[120px] dark:bg-orange-500/15" />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-brand/20 bg-brand/10 dark:bg-brand/20 px-4 py-1 text-xs font-bold uppercase tracking-wider text-brand">
            <Sparkles className="h-3.5 w-3.5" /> Precios Transparentes en Guaraníes (PYG)
          </span>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
            Planes a tu medida,{" "}
            <span className="bg-gradient-to-r from-brand via-[#FF6B4A] to-amber-500 bg-clip-text text-transparent">
              sin comisiones ocultas
            </span>
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
            Cobramos una suscripción fija en guaraníes. Todo lo que facturás en tu negocio es 100% tuyo.
          </p>
        </div>

        {/* Toggle Switch Facturación Mensual vs Anual */}
        <div className="mt-8 flex items-center justify-center gap-3.5 text-sm font-semibold">
          <button
            type="button"
            onClick={() => setAnnual(false)}
            className={`transition-colors ${!annual ? "text-brand dark:text-white font-bold" : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"}`}
          >
            Facturación Mensual
          </button>

          <button
            type="button"
            onClick={() => setAnnual((value) => !value)}
            className={`relative h-8 w-15 rounded-full p-1 transition-all duration-300 shadow-inner ${
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
            className={`flex items-center gap-1.5 transition-colors ${
              annual ? "text-brand dark:text-[#FF6B4A] font-bold" : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            <span>Pago Anual</span>
            <span className="rounded-full bg-brand/10 dark:bg-brand/20 border border-brand/30 px-2 py-0.5 text-[10px] font-black text-brand dark:text-[#FF6B4A] shadow-2xs">
              2 Meses Gratis
            </span>
          </button>
        </div>

        {/* Grilla de Planes */}
        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          <PriceCard
            name="Plan Básico"
            description="Ideal para trabajar solo o empezar a digitalizarte."
            price={annual ? "Gs. 80.000" : "Gs. 100.000"}
            period="/mes"
            annual={annual}
            savings="Ahorrás Gs. 240.000 al año (2 meses gratis)"
            billedDetail="Gs. 960.000 facturado anual"
            cta="Prueba gratuitamente"
            href="/onboarding"
            features={BASIC_FEATURES}
          />
          <PriceCard
            name="Plan Pro"
            badge="Más Popular en Paraguay"
            description="Para equipos de salón, peluquería o estética."
            price={annual ? "Gs. 200.000" : "Gs. 250.000"}
            period="/mes"
            annual={annual}
            savings="Ahorrás Gs. 600.000 al año (2 meses gratis)"
            billedDetail="Gs. 2.400.000 facturado anual"
            cta="Prueba gratuitamente"
            href="/onboarding"
            features={PRO_FEATURES}
            highlighted
          />
          <PriceCard
            name="Plan Empresa"
            description="Para franquicias, sucursales y centros médicos."
            price={annual ? "Gs. 520.000" : "Gs. 650.000"}
            period="/mes"
            annual={annual}
            savings="Ahorrás Gs. 1.560.000 al año (2 meses gratis)"
            billedDetail="Gs. 6.240.000 facturado anual"
            cta="Consultar por Empresa"
            href="https://wa.me/595981123456?text=Hola%20AgendatePY%2C%20quisiera%20asesoramiento%20sobre%20el%20Plan%20Empresa"
            isExternal={true}
            features={EMPRESA_FEATURES}
          />
        </div>

        {/* Garantía y Formas de Pago */}
        <div className="mt-12 text-center text-xs text-slate-500 dark:text-slate-400">
          <p className="flex items-center justify-center gap-2 font-medium">
            <Shield className="h-4 w-4 text-brand dark:text-[#FF6B4A]" />
            14 días de prueba sin ingresar tarjeta de crédito · Pagá después con QR Bancard, SIPAP o Tigo Money.
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
  savings?: string;
  billedDetail?: string;
  cta: string;
  href?: string;
  isExternal?: boolean;
  features: { ok: boolean; label: string }[];
  badge?: string;
  highlighted?: boolean;
}) {
  return (
    <motion.article
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 280, damping: 20 }}
      className={`relative rounded-3xl p-7 sm:p-8 flex flex-col justify-between transition-all duration-300 backdrop-blur-xl ${
        highlighted
          ? "border-2 border-brand bg-white/95 dark:bg-slate-900/95 shadow-[0_25px_50px_-12px_rgba(255,79,43,0.3)] ring-4 ring-brand/10 dark:ring-brand/20"
          : "border border-slate-200/90 dark:border-white/10 bg-white/80 dark:bg-slate-900/80 shadow-[0_15px_30px_-10px_rgba(0,0,0,0.05)] hover:border-brand/40"
      }`}
    >
      {highlighted && (
        <div className="pointer-events-none absolute -inset-0.5 rounded-3xl bg-gradient-to-r from-brand via-orange-500 to-amber-500 opacity-20 blur-xl" />
      )}

      <div className="relative z-10">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-black text-slate-900 dark:text-white">{name}</h3>
          {badge && (
            <span className="rounded-full bg-gradient-to-r from-brand to-[#FF6B4A] px-3 py-1 text-[10px] font-black uppercase tracking-wider text-white shadow-sm">
              {badge}
            </span>
          )}
        </div>
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 min-h-[32px] leading-relaxed">
          {description}
        </p>

        {/* Precio y desglose de ahorro */}
        <div className="my-5 border-b border-slate-100 dark:border-slate-800 pb-5">
          <div className="flex items-baseline gap-1">
            <span className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white font-mono">
              {price}
            </span>
            <span className="text-xs font-semibold text-slate-400">{period}</span>
          </div>

          <AnimatePresence>
            {annual && savings && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-2.5 space-y-1"
              >
                <div className="inline-flex items-center gap-1.5 rounded-lg bg-brand/10 border border-brand/25 px-2.5 py-1 text-[11px] font-bold text-brand dark:text-[#FF6B4A]">
                  <Zap className="h-3 w-3 fill-brand text-brand" />
                  <span>{savings}</span>
                </div>
                {billedDetail && (
                  <p className="text-[11px] text-slate-400 font-medium">
                    {billedDetail}
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Lista de características */}
        <ul className="space-y-3 text-xs">
          {features.map((item) => (
            <li key={item.label} className="flex items-start gap-2.5">
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
                    ? "font-medium text-slate-700 dark:text-slate-200"
                    : "text-slate-400 line-through"
                }
              >
                {item.label}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="relative z-10 pt-8">
        {isExternal ? (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center rounded-2xl border border-slate-200 dark:border-slate-700 py-3.5 text-xs font-bold text-slate-800 dark:text-white shadow-xs hover:border-brand hover:text-brand transition"
          >
            {cta}
          </a>
        ) : (
          <Link
            href={href}
            className={`flex w-full items-center justify-center rounded-2xl py-3.5 text-xs font-bold transition shadow-md active:scale-95 ${
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
