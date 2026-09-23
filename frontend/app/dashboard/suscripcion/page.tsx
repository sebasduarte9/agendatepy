"use client";

import { Check, Crown } from "lucide-react";
import { useDashboardStore } from "@/store/useDashboardStore";
import Card from "@/components/dashboard/ui/Card";
import { formatGs } from "@/lib/dashboard-dates";

const PLANS = [
  {
    id: "basico" as const,
    name: "Plan Básico",
    price: 100000,
    period: "/mes",
    description: "Para profesionales independientes y barberos individuales.",
    features: [
      "1 profesional / agenda independiente",
      "Hasta 100 turnos por mes",
      "Página de reservas personalizada",
      "Confirmaciones por WhatsApp",
      "0% de comisión por turno",
      "Google Calendar sync",
    ],
  },
  {
    id: "pro" as const,
    name: "Plan Pro",
    price: 250000,
    period: "/mes",
    popular: true,
    description: "Para barberías, salones y spas con equipo de trabajo.",
    features: [
      "Hasta 10 profesionales en equipo",
      "Turnos y reservas ilimitadas",
      "Cálculo de comisiones por estilista",
      "Módulo de Caja y arqueo diario",
      "Ficha técnica y CRM de clientes",
      "Recordatorios automáticos 24h y 2h antes",
      "Aprobación de turnos y adjuntos",
      "Soporte prioritario por WhatsApp",
    ],
  },
  {
    id: "empresa" as const,
    name: "Plan Empresa",
    price: 650000,
    period: "/mes",
    description: "Para franquicias, múltiples sucursales y centros médicos.",
    features: [
      "Profesionales ilimitados",
      "Múltiples sucursales / ubicaciones",
      "WhatsApp desde el número propio del local",
      "Integración API & Webhooks a medida",
      "Capacitación presencial al equipo",
      "Facturación legal con RUC paraguayo",
    ],
  },
];

export default function SuscripcionPage() {
  const { business, updateBusiness, pushToast } = useDashboardStore();
  const currentPlan = business.plan || "pro";
  const pct = Math.min(
    100,
    Math.round((business.usedBookings / business.freeBookingLimit) * 100)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Mi Suscripción & Planes AgendatePY
        </h1>
        <p className="text-sm text-slate-500">
          Facturación en Guaraníes (PYG) sin cargos sorpresa. Pagá con QR Bancard, transferencia SIPAP o Tigo Money.
        </p>
      </div>

      {/* Current plan status */}
      <Card className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-gradient-to-r from-primary/5 via-white to-primary/10 border-primary/20">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
            <Crown className="h-3.5 w-3.5" /> Plan Activo
          </span>
          <h2 className="mt-2 text-xl font-bold text-slate-900 capitalize">
            {currentPlan === "pro" ? "Plan Pro (Recomendado)" : currentPlan === "empresa" ? "Plan Empresa" : "Plan Básico"}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Uso actual: <strong className="text-slate-900">{business.usedBookings}</strong> de{" "}
            {business.freeBookingLimit} turnos este mes.
          </p>
        </div>
        <div className="w-full sm:w-64">
          <div className="flex justify-between text-xs font-semibold mb-1">
            <span className="text-slate-500">Capacidad mensual</span>
            <span className="text-primary">{pct}%</span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </Card>

      {/* Plans Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {PLANS.map((plan) => {
          const isActive = currentPlan === plan.id;
          return (
            <Card
              key={plan.id}
              className={`flex flex-col justify-between relative transition duration-200 ${
                plan.popular
                  ? "border-primary ring-2 ring-primary/20 shadow-md"
                  : "border-slate-200"
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-white shadow-sm">
                  Más Elegido en Paraguay
                </span>
              )}

              <div>
                <h3 className="text-lg font-bold text-slate-900">{plan.name}</h3>
                <p className="mt-1 text-xs text-slate-500 min-h-[32px]">{plan.description}</p>

                <div className="my-5 flex items-baseline gap-1">
                  <span className="text-2xl font-black text-slate-900">
                    {formatGs(plan.price)}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">{plan.period}</span>
                </div>

                <ul className="space-y-2.5 text-xs text-slate-700">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <Check className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-6">
                <button
                  type="button"
                  onClick={() => {
                    updateBusiness({ plan: plan.id });
                    pushToast("success", `Has cambiado al ${plan.name}`);
                  }}
                  className={`w-full rounded-xl py-2.5 text-xs font-bold transition shadow-sm ${
                    isActive
                      ? "bg-slate-100 text-slate-700 border border-slate-300 cursor-default"
                      : plan.popular
                      ? "bg-primary text-white hover:opacity-95"
                      : "bg-slate-900 text-white hover:bg-slate-800"
                  }`}
                >
                  {isActive ? "Plan Actual" : "Elegir este Plan"}
                </button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Payment methods footer info */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 text-center text-xs text-slate-500 space-y-2">
        <p className="font-semibold text-slate-700">
          Medios de pago aceptados para tu suscripción en Paraguay:
        </p>
        <p>
          QR Bancard · Transferencias SIPAP (Itaú, Continental, Ueno, BNF, Sudameris) · Tigo Money · Personal Pay · Facturación legal con IVA incluido.
        </p>
      </div>
    </div>
  );
}
