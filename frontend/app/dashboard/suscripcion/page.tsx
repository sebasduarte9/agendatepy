"use client";

import { useState } from "react";
import {
  Check,
  Crown,
  Zap,
  ShieldCheck,
  CreditCard,
  BadgePercent,
  ArrowRight,
  TrendingUp,
  PhoneCall,
  Calendar,
  Lock,
} from "lucide-react";
import { useDashboardStore } from "@/store/useDashboardStore";
import Modal from "@/components/dashboard/ui/Modal";
import { formatGs } from "@/lib/dashboard-dates";
import { triggerHaptic } from "@/lib/haptics";
import type { PlanId } from "@/lib/dashboard-types";

const PLANS = [
  {
    id: "gratis" as PlanId,
    name: "Plan Inicial Gratuito",
    price: 0,
    period: "/mes",
    description: "Ideal para dar los primeros pasos y comenzar a agendar citas sin costo.",
    features: [
      "1 profesional / agenda personal",
      "Hasta 20 turnos por mes",
      "Página web de reservas con tu logo",
      "Confirmaciones por WhatsApp",
      "0% de comisión por turno cobrado",
      "Sin tarjeta de crédito requerida",
    ],
  },
  {
    id: "basico" as PlanId,
    name: "Plan Básico",
    price: 100000,
    period: "/mes",
    description: "Para profesionales independientes, barberos y terapeutas autónomos.",
    features: [
      "1 profesional / agenda personal",
      "Hasta 100 turnos por mes",
      "Página web de reservas con tu logo",
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
    description: "Para salones de belleza, barberías, spas y estudios con equipo de trabajo.",
    features: [
      "Hasta 10 profesionales en equipo",
      "Turnos y reservas 100% ilimitadas",
      "Cálculo automático de comisiones por profesional",
      "Módulo de Caja y arqueo diario",
      "Ficha técnica y CRM de clientes",
      "Recordatorios automáticos por WhatsApp",
      "Soporte prioritario por WhatsApp en Paraguay",
    ],
  },
  {
    id: "empresa" as PlanId,
    name: "Plan Empresa",
    price: 650000,
    period: "/mes",
    description: "Para franquicias, múltiples sucursales y clínicas de gran escala.",
    features: [
      "Profesionales ilimitados",
      "Múltiples sucursales y sedes",
      "WhatsApp desde el número propio del local",
      "Integraciones y flujos a medida",
      "Capacitación personalizada al equipo",
      "Gerente de cuenta dedicado",
    ],
  },
];

export default function SuscripcionPage() {
  const { business, updateBusiness, pushToast } = useDashboardStore();
  const brandColor = business.primaryColor || "#FF4F2B";
  const currentPlan = business.plan || "pro";

  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [selectedPlanForUpgrade, setSelectedPlanForUpgrade] = useState<(typeof PLANS)[number] | null>(null);

  const bookingLimit = business.freeBookingLimit || (currentPlan === "gratis" ? 20 : currentPlan === "basico" ? 100 : 9999);
  const isUnlimited = bookingLimit >= 9999;
  const pct = isUnlimited
    ? 100
    : Math.min(100, Math.round((business.usedBookings / bookingLimit) * 100));

  function handleSelectPlan(plan: (typeof PLANS)[number]) {
    triggerHaptic("selection");
    if (plan.id === currentPlan) {
      pushToast("success", `Ya te encontrás en el ${plan.name}`);
      return;
    }
    setSelectedPlanForUpgrade(plan);
    setCheckoutModalOpen(true);
  }

  function handleConfirmUpgrade() {
    if (!selectedPlanForUpgrade) return;
    triggerHaptic("success");
    updateBusiness({
      plan: selectedPlanForUpgrade.id,
      freeBookingLimit:
        selectedPlanForUpgrade.id === "gratis"
          ? 20
          : selectedPlanForUpgrade.id === "basico"
            ? 100
            : 9999,
    });
    pushToast("success", `¡Listo! Has cambiado al ${selectedPlanForUpgrade.name}.`);
    setCheckoutModalOpen(false);
  }

  const currentPlanObj = PLANS.find((p) => p.id === currentPlan) || PLANS[2];

  return (
    <div className="mx-auto max-w-5xl space-y-4 sm:space-y-6 pb-24 px-1 sm:px-0">
      {/* ═══ APPLE APP HEADER ═══ */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between py-1">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            Suscripción
          </h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            Planes y gestión de tu cuenta
          </p>
        </div>

        {/* Current Plan Badge Pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-white dark:bg-[#121215] border border-slate-200/80 dark:border-white/10 shadow-xs self-start sm:self-auto">
          <div
            className="flex h-6 w-6 items-center justify-center rounded-lg text-white"
            style={{ backgroundColor: brandColor }}
          >
            <Crown className="h-3.5 w-3.5" />
          </div>
          <span className="text-xs font-bold text-slate-900 dark:text-white">
            {currentPlanObj.name}
          </span>
          <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
        </div>
      </div>

      {/* ═══ ACTIVE SUBSCRIPTION GLANCE CARD (APPLE PASS STYLE) ═══ */}
      <div className="rounded-3xl bg-white dark:bg-[#121215] border border-slate-200/80 dark:border-white/10 p-5 sm:p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-xs"
              style={{ backgroundColor: brandColor }}
            >
              <Crown className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
                  {currentPlanObj.name}
                </h2>
                <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                  Activo
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400 font-mono mt-0.5">
                {currentPlanObj.price === 0 ? "Gratis para siempre" : `${formatGs(currentPlanObj.price)} / mes`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-white/[0.05] text-slate-700 dark:text-zinc-300 text-xs font-bold font-mono">
              <BadgePercent className="h-3.5 w-3.5 text-amber-500" />
              <span>0% Comisiones por Turno</span>
            </span>
          </div>
        </div>

        {/* Usage Progress Track */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/5 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700 dark:text-zinc-300">
              Cupo de Turnos del Mes
            </span>
            <span className="font-mono font-bold text-slate-900 dark:text-white">
              {isUnlimited
                ? `${business.usedBookings} turnos (Ilimitado)`
                : `${business.usedBookings} de ${bookingLimit} usados`}
            </span>
          </div>

          <div className="h-2 w-full rounded-full bg-slate-200/70 dark:bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: isUnlimited ? "100%" : `${Math.max(4, Math.min(100, pct))}%`,
                backgroundColor: isUnlimited ? "#10b981" : pct > 80 ? "#f43f5e" : brandColor,
              }}
            />
          </div>

          {!isUnlimited && (
            <div className="flex justify-between items-center text-[11px] text-slate-500 dark:text-zinc-400 pt-0.5">
              <span>{bookingLimit - business.usedBookings > 0 ? `${bookingLimit - business.usedBookings} turnos disponibles` : "Cupo alcanzado"}</span>
              <span>{pct}% utilizado</span>
            </div>
          )}
        </div>

        {/* 3-Mini Specs Grid */}
        <div className="grid grid-cols-3 gap-2.5 sm:gap-3 text-center text-xs">
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/5">
            <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-semibold block uppercase">Comisión</span>
            <span className="font-mono font-black text-sm text-emerald-600 dark:text-emerald-400">0%</span>
          </div>
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/5">
            <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-semibold block uppercase">Cancelación</span>
            <span className="font-mono font-black text-sm text-slate-900 dark:text-white">Libre</span>
          </div>
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/5">
            <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-semibold block uppercase">Moneda</span>
            <span className="font-mono font-black text-sm text-slate-900 dark:text-white">PYG (Gs.)</span>
          </div>
        </div>
      </div>

      {/* ═══ PLANS SELECTION (APPLE INSET CARDS) ═══ */}
      <div className="space-y-3">
        <h2 className="text-base font-bold tracking-tight text-slate-900 dark:text-white px-1">
          Planes Disponibles
        </h2>

        <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
          {PLANS.map((plan) => {
            const isActive = currentPlan === plan.id;

            return (
              <div
                key={plan.id}
                className={`relative flex flex-col justify-between rounded-3xl p-5 transition-all bg-white dark:bg-[#121215] border shadow-xs ${
                  isActive
                    ? "border-primary/40 ring-2 ring-primary/20 dark:border-primary/50"
                    : plan.popular
                      ? "border-slate-300 dark:border-white/20"
                      : "border-slate-200/80 dark:border-white/10"
                }`}
              >
                {plan.popular && (
                  <span
                    className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-0.5 text-[10px] font-black uppercase tracking-wider text-white shadow-xs"
                    style={{ backgroundColor: brandColor }}
                  >
                    Más Elegido
                  </span>
                )}

                <div className="space-y-4">
                  <div>
                    <h3 className="text-base font-black text-slate-900 dark:text-white">
                      {plan.name}
                    </h3>
                    <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400 min-h-[32px] line-clamp-2">
                      {plan.description}
                    </p>
                  </div>

                  <div className="flex items-baseline gap-1 py-1">
                    <span className="text-2xl font-mono font-black text-slate-900 dark:text-white tracking-tight">
                      {formatGs(plan.price)}
                    </span>
                    <span className="text-xs text-slate-400 dark:text-zinc-500 font-semibold">
                      {plan.period}
                    </span>
                  </div>

                  {/* Feature Checklist */}
                  <ul className="space-y-2 text-xs text-slate-600 dark:text-zinc-300 pt-3 border-t border-slate-100 dark:border-white/10">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2">
                        <Check className="h-3.5 w-3.5 shrink-0 text-emerald-500 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-5 mt-4">
                  <button
                    type="button"
                    onClick={() => handleSelectPlan(plan)}
                    disabled={isActive}
                    className={`w-full rounded-2xl py-2.5 text-xs font-bold transition active:scale-95 cursor-pointer ${
                      isActive
                        ? "bg-slate-100 dark:bg-white/[0.04] text-slate-400 dark:text-zinc-500 border border-slate-200/60 dark:border-white/5 cursor-default"
                        : plan.popular
                          ? "text-white shadow-xs hover:brightness-110"
                          : "bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90"
                    }`}
                    style={!isActive && plan.popular ? { backgroundColor: brandColor } : {}}
                  >
                    {isActive ? "Tu Plan Actual" : "Seleccionar"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ═══ APPLE GUARANTEES & SUPPORT (INSET GROUPED) ═══ */}
      <div className="rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#121215] p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <h2 className="font-bold text-slate-900 dark:text-white text-sm">
              Garantías de tu Suscripción
            </h2>
          </div>

          <span className="text-[11px] font-mono font-bold text-emerald-600 dark:text-emerald-400">
            Sin Riesgo
          </span>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200/60 dark:border-white/5 bg-slate-50 dark:bg-white/[0.03] p-4 space-y-1">
            <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-xs">
              <BadgePercent className="h-3.5 w-3.5 text-amber-500" />
              <span>0% Comisiones</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400">
              El 100% de lo que cobrás a tus clientes va directo a tu cuenta o caja.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/60 dark:border-white/5 bg-slate-50 dark:bg-white/[0.03] p-4 space-y-1">
            <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-xs">
              <Lock className="h-3.5 w-3.5 text-indigo-500" />
              <span>Sin Permanencia</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400">
              Cambiá de plan o cancelá cuando quieras con un solo clic, sin ataduras.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/60 dark:border-white/5 bg-slate-50 dark:bg-white/[0.03] p-4 space-y-1">
            <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-xs">
              <PhoneCall className="h-3.5 w-3.5 text-emerald-500" />
              <span>Soporte por WhatsApp</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400">
              Atención directa y rápida en Paraguay para ayudarte con cualquier consulta.
            </p>
          </div>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs border-t border-slate-100 dark:border-white/10">
          <span className="text-slate-500 dark:text-zinc-400">
            ¿Tenés dudas sobre qué plan se adapta mejor a tu negocio?
          </span>
          <a
            href="https://wa.me/595981000000?text=Hola,%20tengo%20dudas%20sobre%20los%20planes%20de%20AgendatePY"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 font-bold hover:underline cursor-pointer"
            style={{ color: brandColor }}
          >
            <span>Chatear con soporte</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>

      {/* ═══ APPLE CHECKOUT MODAL ═══ */}
      <Modal
        open={checkoutModalOpen}
        onClose={() => setCheckoutModalOpen(false)}
        title={selectedPlanForUpgrade ? `Activar ${selectedPlanForUpgrade.name}` : "Confirmar Plan"}
      >
        {selectedPlanForUpgrade && (
          <div className="space-y-4 text-xs">
            <div className="rounded-2xl border border-primary/20 bg-primary/5 dark:bg-primary/10 p-4 space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-900 dark:text-white text-sm">
                  {selectedPlanForUpgrade.name}
                </span>
                <strong className="text-xl font-mono font-black" style={{ color: brandColor }}>
                  {formatGs(selectedPlanForUpgrade.price)} / mes
                </strong>
              </div>
              <p className="text-slate-500 dark:text-zinc-400">
                {selectedPlanForUpgrade.description}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-slate-50 dark:bg-white/[0.03] p-4 space-y-2.5">
              <span className="font-bold text-slate-900 dark:text-white block">
                Método de Pago Seguro:
              </span>
              <div className="flex items-center gap-2.5 p-2 rounded-xl bg-white dark:bg-[#121215] border border-slate-200/60 dark:border-white/5">
                <CreditCard className="h-4 w-4" style={{ color: brandColor }} />
                <span className="text-slate-700 dark:text-zinc-300 font-medium">
                  Tarjeta de Crédito o Débito
                </span>
              </div>
              <p className="text-[10px] text-slate-400 dark:text-zinc-500">
                Cobro recurrente mensual automático. Podés cancelar en cualquier momento desde tu panel.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setCheckoutModalOpen(false)}
                className="rounded-xl border border-slate-200/80 dark:border-white/10 px-4 py-2 font-semibold text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-white/5 transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmUpgrade}
                className="rounded-xl px-5 py-2 font-bold text-white shadow-xs transition hover:brightness-110 active:scale-95 cursor-pointer"
                style={{ backgroundColor: brandColor }}
              >
                Confirmar y Activar
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
