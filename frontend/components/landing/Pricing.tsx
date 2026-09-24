"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, X, Shield } from "lucide-react";
import { motion } from "framer-motion";

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
    <section id="precios" className="bg-slate-50/70 py-20 border-t border-slate-200/60">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto">
          <span className="rounded-full bg-brand/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-brand">
            Precios en Guaraníes (PYG)
          </span>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Planes transparentes, sin comisiones ocultas
          </h2>
          <p className="mt-3 text-slate-600 text-sm">
            Cobramos una suscripción fija en guaraníes. Todo lo que facturás en tu negocio es 100% tuyo.
          </p>
        </div>

        <div className="mt-6 flex items-center justify-center gap-3 text-sm font-semibold">
          <span className={!annual ? "text-brand" : "text-slate-500"}>Facturación Mensual</span>
          <button
            type="button"
            onClick={() => setAnnual((value) => !value)}
            className={`relative h-8 w-14 rounded-full transition ${annual ? "bg-brand" : "bg-slate-300"}`}
            aria-label="Cambiar facturación mensual o anual"
          >
            <span
              className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow-xs transition-all ${
                annual ? "left-7" : "left-1"
              }`}
            />
          </button>
          <span className={annual ? "text-brand font-semibold" : "text-slate-500"}>
            Pago Anual (2 meses bonificados)
          </span>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          <PriceCard
            name="Plan Básico"
            description="Ideal para trabajar solo o empezar a digitalizarte."
            price={annual ? "Gs. 80.000" : "Gs. 100.000"}
            period="/mes"
            cta="Probar 30 Días Gratis"
            href="/onboarding"
            features={BASIC_FEATURES}
          />
          <PriceCard
            name="Plan Pro"
            badge="Más Popular en Paraguay"
            description="Para equipos de salón, peluquería o estética."
            price={annual ? "Gs. 200.000" : "Gs. 250.000"}
            period="/mes"
            cta="Comenzar Prueba Gratis"
            href="/onboarding"
            features={PRO_FEATURES}
            highlighted
          />
          <PriceCard
            name="Plan Empresa"
            description="Para franquicias, sucursales y centros médicos."
            price={annual ? "Gs. 520.000" : "Gs. 650.000"}
            period="/mes"
            cta="Consultar por Empresa"
            href="https://wa.me/595981123456?text=Hola%20AgendatePY%2C%20quisiera%20asesoramiento%20sobre%20el%20Plan%20Empresa"
            isExternal={true}
            features={EMPRESA_FEATURES}
          />
        </div>

        <div className="mt-12 text-center text-xs text-slate-500">
          <p className="flex items-center justify-center gap-2 font-medium">
            <Shield className="h-4 w-4 text-emerald-600" />
            30 días de prueba sin ingresar tarjeta de crédito · Pagá después con QR Bancard, SIPAP o Tigo Money.
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
      className={`relative rounded-3xl p-7 sm:p-8 flex flex-col justify-between transition-all duration-300 [transform-style:preserve-3d] ${
        highlighted
          ? "border-2 border-brand bg-white/95 dark:bg-slate-900/95 shadow-[0_25px_50px_-12px_rgba(91,49,230,0.25)] ring-4 ring-brand/10 backdrop-blur-xl"
          : "border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-slate-900/80 shadow-[0_15px_30px_-10px_rgba(0,0,0,0.05)] backdrop-blur-xl hover:border-brand/40"
      }`}
    >
      {highlighted && (
        <div className="pointer-events-none absolute -inset-0.5 rounded-3xl bg-gradient-to-r from-brand via-indigo-500 to-whatsapp opacity-20 blur-xl" />
      )}

      <div className="relative z-10">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-black text-slate-900 dark:text-white">{name}</h3>
          {badge && (
            <span className="rounded-full bg-gradient-to-r from-brand to-indigo-600 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-white shadow-sm">
              {badge}
            </span>
          )}
        </div>
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 min-h-[32px] leading-relaxed">
          {description}
        </p>

        <div className="my-5 flex items-baseline gap-1 border-b border-slate-100 dark:border-slate-800 pb-5">
          <span className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
            {price}
          </span>
          <span className="text-xs font-semibold text-slate-400">{period}</span>
        </div>

        <ul className="space-y-3 text-xs">
          {features.map((item) => (
            <li key={item.label} className="flex items-start gap-2.5">
              <span
                className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] mt-0.5 ${
                  item.ok
                    ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold"
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
                ? "bg-gradient-to-r from-brand to-indigo-600 text-white shadow-brand/30 hover:brightness-110"
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
