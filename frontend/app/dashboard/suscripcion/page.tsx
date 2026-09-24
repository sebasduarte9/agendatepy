"use client";

import { useState } from "react";
import {
  Check,
  Crown,
  Sparkles,
  Zap,
  Building2,
  ShieldCheck,
  CreditCard,
  Landmark,
  QrCode,
  Download,
  ExternalLink,
} from "lucide-react";
import { useDashboardStore } from "@/store/useDashboardStore";
import Card from "@/components/dashboard/ui/Card";
import Modal from "@/components/dashboard/ui/Modal";
import { formatGs } from "@/lib/dashboard-dates";
import type { PlanId } from "@/lib/dashboard-types";

const PLANS = [
  {
    id: "basico" as PlanId,
    name: "Plan Básico",
    price: 100000,
    period: "/mes",
    description: "Para profesionales independientes, barberos y manicuristas autónomos.",
    features: [
      "1 profesional / agenda personal",
      "Hasta 100 turnos por mes",
      "Página web de reservas con logo",
      "Confirmaciones automáticas por WhatsApp",
      "Sincronización con Google Calendar",
      "0% de comisión por turno cobrado",
    ],
  },
  {
    id: "pro" as PlanId,
    name: "Plan Pro",
    price: 250000,
    period: "/mes",
    popular: true,
    description: "Para salones de belleza, barberías y spas con equipo de trabajo.",
    features: [
      "Hasta 10 profesionales en equipo",
      "Turnos y reservas 100% ilimitadas",
      "Cálculo automático de comisiones por estilista",
      "Módulo de Caja y arqueo diario",
      "Ficha técnica y CRM VIP de clientes",
      "Recordatorios automáticos 24h y 2h antes",
      "Validación de comprobantes SIPAP bancarios",
      "Soporte prioritario por WhatsApp en Paraguay",
    ],
  },
  {
    id: "empresa" as PlanId,
    name: "Plan Empresa",
    price: 650000,
    period: "/mes",
    description: "Para franquicias, múltiples sucursales y clínicas de estética.",
    features: [
      "Profesionales ilimitados",
      "Múltiples sucursales y ubicaciones",
      "WhatsApp desde el número propio del local",
      "Integración API & Webhooks a medida",
      "Facturación legal con RUC e-Kuatia",
      "Capacitación presencial al equipo",
      "Gerente de cuenta dedicado",
    ],
  },
];

const INVOICES = [
  { id: "FAC-001-002-00481", date: "01/09/2026", concept: "Suscripción Plan Pro (Septiembre 2026)", amount: 250000, status: "Pagado" },
  { id: "FAC-001-002-00392", date: "01/08/2026", concept: "Suscripción Plan Pro (Agosto 2026)", amount: 250000, status: "Pagado" },
  { id: "FAC-001-002-00301", date: "01/07/2026", concept: "Suscripción Plan Básico (Julio 2026)", amount: 100000, status: "Pagado" },
];

export default function SuscripcionPage() {
  const { business, updateBusiness, pushToast } = useDashboardStore();
  const currentPlan = business.plan || "pro";

  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [selectedPlanForUpgrade, setSelectedPlanForUpgrade] = useState<(typeof PLANS)[number] | null>(null);

  const pct = Math.min(
    100,
    Math.round((business.usedBookings / business.freeBookingLimit) * 100)
  );

  function handleSelectPlan(plan: (typeof PLANS)[number]) {
    if (plan.id === currentPlan) {
      pushToast("success", `Ya te encuentras en el ${plan.name}`);
      return;
    }
    setSelectedPlanForUpgrade(plan);
    setCheckoutModalOpen(true);
  }

  function handleConfirmUpgrade() {
    if (!selectedPlanForUpgrade) return;
    updateBusiness({
      plan: selectedPlanForUpgrade.id,
      freeBookingLimit: selectedPlanForUpgrade.id === "basico" ? 100 : 9999,
    });
    pushToast("success", `¡Felicitaciones! Has actualizado al ${selectedPlanForUpgrade.name}.`);
    setCheckoutModalOpen(false);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
          Suscripción & Facturación AgendatePY
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 sm:text-sm">
          Planes flexibles en Guaraníes (PYG) sin comisiones ocultas. Pagos vía SIPAP o QR Bancard.
        </p>
      </div>

      {/* Current plan status Card */}
      <Card className="flex flex-col sm:flex-row items-center justify-between gap-5 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-primary/20">
        <div className="space-y-1 text-center sm:text-left">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/20 px-3 py-1 text-xs font-bold text-primary">
            <Crown className="h-3.5 w-3.5" /> Plan Activo
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white capitalize">
            {currentPlan === "pro"
              ? "Plan Pro (Recomendado)"
              : currentPlan === "empresa"
                ? "Plan Empresa"
                : "Plan Básico"}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Uso actual: <strong className="text-slate-900 dark:text-white font-bold">{business.usedBookings}</strong> turnos registrados este ciclo mensual.
          </p>
        </div>

        <div className="w-full sm:w-64 space-y-1.5">
          <div className="flex justify-between text-xs font-bold">
            <span className="text-slate-500 dark:text-slate-400">Capacidad mensual</span>
            <span className="text-primary">{pct}%</span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary to-indigo-500 transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-400 text-right">
            {business.usedBookings} / {business.freeBookingLimit} turnos
          </p>
        </div>
      </Card>

      {/* Plans Pricing Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {PLANS.map((plan) => {
          const isActive = currentPlan === plan.id;

          return (
            <Card
              key={plan.id}
              className={`flex flex-col justify-between relative transition-all duration-300 hover:-translate-y-2 ${
                plan.popular
                  ? "border-primary ring-2 ring-primary/25 shadow-xl shadow-primary/10"
                  : "border-slate-200/80 dark:border-white/10"
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-primary to-indigo-600 px-4 py-1 text-[10px] font-black uppercase tracking-wider text-white shadow-md">
                  Más Elegido en Paraguay
                </span>
              )}

              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  {plan.name}
                </h3>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 min-h-[32px]">
                  {plan.description}
                </p>

                <div className="my-5 flex items-baseline gap-1.5">
                  <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                    {formatGs(plan.price)}
                  </span>
                  <span className="text-xs text-slate-400 font-semibold">{plan.period}</span>
                </div>

                <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5">
                      <Check className="h-4 w-4 shrink-0 text-emerald-500 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-6">
                <button
                  type="button"
                  onClick={() => handleSelectPlan(plan)}
                  className={`w-full rounded-2xl py-3 text-xs font-bold transition shadow-sm ${
                    isActive
                      ? "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-white/10 cursor-default"
                      : plan.popular
                        ? "bg-primary text-white shadow-lg shadow-primary/25 hover:opacity-95"
                        : "bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90"
                  }`}
                >
                  {isActive ? "Plan Actual Activo" : "Seleccionar este Plan"}
                </button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Invoices History Table Card */}
      <Card className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-3">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              Historial de Facturación & Comprobantes Legales
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Descargá tus facturas electrónicas con validez tributaria ante la DNIT / SET.
            </p>
          </div>
          <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5" /> e-Kuatia Activo
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200/80 dark:border-white/10 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                <th className="pb-3 pl-2">Nro. Factura</th>
                <th className="pb-3">Fecha</th>
                <th className="pb-3">Concepto</th>
                <th className="pb-3 text-right">Monto</th>
                <th className="pb-3 text-center">Estado</th>
                <th className="pb-3 pr-2 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {INVOICES.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50/70 dark:hover:bg-white/5 transition">
                  <td className="py-3 pl-2 font-mono font-bold text-slate-900 dark:text-white">
                    {inv.id}
                  </td>
                  <td className="py-3 text-slate-500 dark:text-slate-400">{inv.date}</td>
                  <td className="py-3 font-medium text-slate-800 dark:text-slate-200">
                    {inv.concept}
                  </td>
                  <td className="py-3 text-right font-black text-slate-900 dark:text-white">
                    {formatGs(inv.amount)}
                  </td>
                  <td className="py-3 text-center">
                    <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                      {inv.status}
                    </span>
                  </td>
                  <td className="py-3 pr-2 text-right">
                    <button
                      type="button"
                      onClick={() => pushToast("success", `Descargando ${inv.id}.pdf...`)}
                      className="inline-flex items-center gap-1 text-primary hover:underline font-semibold"
                    >
                      <Download className="h-3.5 w-3.5" />
                      <span>PDF</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Upgrade Checkout Modal */}
      <Modal
        open={checkoutModalOpen}
        onClose={() => setCheckoutModalOpen(false)}
        title={selectedPlanForUpgrade ? `Cambiar a ${selectedPlanForUpgrade.name}` : "Confirmar Plan"}
      >
        {selectedPlanForUpgrade && (
          <div className="space-y-4 text-xs">
            <div className="rounded-2xl bg-primary/5 border border-primary/20 p-4 space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-900 dark:text-white text-sm">
                  {selectedPlanForUpgrade.name}
                </span>
                <strong className="text-xl font-black text-primary">
                  {formatGs(selectedPlanForUpgrade.price)} / mes
                </strong>
              </div>
              <p className="text-slate-500 dark:text-slate-400">
                {selectedPlanForUpgrade.description}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 p-4 space-y-3">
              <p className="font-bold text-slate-900 dark:text-white">
                Métodos de Pago Habilitados en Paraguay:
              </p>
              <div className="space-y-2 text-slate-600 dark:text-slate-300">
                <div className="flex items-center gap-2">
                  <QrCode className="h-4 w-4 text-primary" />
                  <span>QR Bancard / Débito Inmediato</span>
                </div>
                <div className="flex items-center gap-2">
                  <Landmark className="h-4 w-4 text-emerald-500" />
                  <span>Transferencia SIPAP (Alias: <strong>agendate.py</strong>)</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setCheckoutModalOpen(false)}
                className="rounded-xl border border-slate-200/80 dark:border-white/10 px-4 py-2 font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmUpgrade}
                className="rounded-xl bg-primary px-6 py-2 font-bold text-white shadow-md hover:opacity-95 transition"
              >
                Confirmar y Activar Plan
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
