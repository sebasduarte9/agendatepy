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
            features={BASIC_FEATURES}
          />
          <PriceCard
            name="Plan Pro"
            badge="Más Popular en Paraguay"
            description="Para equipos de salón, peluquería o estética."
            price={annual ? "Gs. 200.000" : "Gs. 250.000"}
            period="/mes"
            cta="Comenzar Prueba Gratis"
            features={PRO_FEATURES}
            highlighted
          />
          <PriceCard
            name="Plan Empresa"
            description="Para franquicias, sucursales y centros médicos."
            price={annual ? "Gs. 520.000" : "Gs. 650.000"}
            period="/mes"
            cta="Consultar por Empresa"
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
  features,
  badge,
  highlighted = false,
}: {
  name: string;
  description: string;
  price: string;
  period: string;
  cta: string;
  features: { ok: boolean; label: string }[];
  badge?: string;
  highlighted?: boolean;
}) {
  return (
    <motion.article
      whileHover={{ y: -6 }}
      className={`relative rounded-3xl border p-7 flex flex-col justify-between transition ${
        highlighted
          ? "border-brand bg-white shadow-xl shadow-brand/15 ring-2 ring-brand/20"
          : "border-slate-200 bg-white shadow-sm"
      }`}
    >
      <div>
        {badge && (
          <span className="inline-block mb-3 rounded-full bg-brand px-3 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-white shadow-xs">
            {badge}
          </span>
        )}
        <h3 className="text-xl font-bold text-slate-900">{name}</h3>
        <p className="mt-1 text-xs text-slate-500 min-h-[32px]">{description}</p>

        <div className="my-5 flex items-baseline gap-1">
          <span className="text-3xl font-black text-slate-900">{price}</span>
          <span className="text-xs font-semibold text-slate-400">{period}</span>
        </div>

        <ul className="space-y-2.5 text-xs text-slate-700 border-t border-slate-100 pt-5">
          {features.map((item) => (
            <li key={item.label} className="flex items-start gap-2">
              {item.ok ? (
                <Check className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
              ) : (
                <X className="h-4 w-4 shrink-0 text-slate-300 mt-0.5" />
              )}
              <span className={item.ok ? "text-slate-800" : "text-slate-400"}>
                {item.label}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="pt-8">
        <Link
          href="/dashboard"
          className={`block w-full rounded-2xl py-3 text-center text-xs font-bold transition shadow-sm ${
            highlighted
              ? "bg-brand text-white shadow-brand/30 hover:bg-brand-dark"
              : "border border-slate-300 bg-white text-slate-800 hover:border-brand hover:text-brand"
          }`}
        >
          {cta}
        </Link>
      </div>
    </motion.article>
  );
}
