"use client";

import { useState } from "react";
import {
  Check,
  Crown,
  ShieldCheck,
  CreditCard,
  BadgePercent,
  ArrowRight,
  PhoneCall,
  Lock,
} from "lucide-react";
import { useDashboardStore } from "@/store/useDashboardStore";
import Modal from "@/components/dashboard/ui/Modal";
import { formatGs } from "@/lib/dashboard-dates";
import { triggerHaptic } from "@/lib/haptics";
import AnimatedValue from "@/components/dashboard/ui/AnimatedValue";
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
      "Link de reservas para Instagram y Google Maps",
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
      "Asistente IA que agenda por WhatsApp",
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

      {/* ═══ ACTIVE SUBSCRIPTION PASS ═══ */}
      <div className="kpi-rise grid gap-3.5 lg:grid-cols-5">
        <div className="rounded-3xl bg-white dark:bg-[#121215] border border-slate-200/80 dark:border-white/10 p-5 sm:p-6 shadow-xs lg:col-span-3">

          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Plan activo
              </span>
              <h2 className="mt-3 text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">{currentPlanObj.name}</h2>
              <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400 max-w-sm">{currentPlanObj.description}</p>
            </div>
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-white shadow-xs" style={{ backgroundColor: brandColor }}>
              <Crown className="h-6 w-6" />
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100 dark:border-white/10 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Pagás por mes</p>
              <p className="text-2xl font-black font-mono tracking-tight text-slate-900 dark:text-white">
                {currentPlanObj.price === 0 ? "Gratis" : <AnimatedValue value={formatGs(currentPlanObj.price)} />}
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 dark:bg-white/[0.05] px-3 py-1 text-[11px] font-bold text-slate-700 dark:text-zinc-300">
              <BadgePercent className="h-3.5 w-3.5 text-amber-500" />
              0% comisión por turno
            </span>
          </div>
        </div>

        {/* Usage ring */}
        <div className="rounded-3xl bg-white dark:bg-[#121215] border border-slate-200/80 dark:border-white/10 p-5 sm:p-6 shadow-xs lg:col-span-2 flex items-center gap-5">
          <div className="relative h-28 w-28 shrink-0">
            <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
              <circle cx="50" cy="50" r="42" fill="none" strokeWidth="10" className="stroke-slate-100 dark:stroke-white/10" />
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                strokeWidth="10"
                strokeLinecap="round"
                stroke={isUnlimited ? "#10b981" : pct > 80 ? "#f43f5e" : brandColor}
                strokeDasharray={2 * Math.PI * 42}
                strokeDashoffset={2 * Math.PI * 42 * (1 - (isUnlimited ? 1 : pct / 100))}
                className="transition-[stroke-dashoffset] duration-1000 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-black font-mono text-slate-900 dark:text-white">
                {isUnlimited ? "∞" : <AnimatedValue value={`${pct}%`} />}
              </span>
              <span className="text-[10px] font-semibold text-slate-400">usado</span>
            </div>
          </div>
          <div className="min-w-0 space-y-1.5">
            <p className="text-xs font-semibold text-slate-500 dark:text-zinc-400">Turnos de este mes</p>
            <p className="text-2xl font-black font-mono text-slate-900 dark:text-white">
              <AnimatedValue value={String(business.usedBookings)} />
              {!isUnlimited && <span className="text-sm text-slate-400"> / {bookingLimit}</span>}
            </p>
            <p className={`text-xs font-semibold ${!isUnlimited && pct > 80 ? "text-rose-600" : "text-emerald-600 dark:text-emerald-400"}`}>
              {isUnlimited
                ? "Turnos ilimitados"
                : bookingLimit - business.usedBookings > 0
                  ? `Te quedan ${bookingLimit - business.usedBookings} turnos`
                  : "Llegaste al cupo del mes"}
            </p>
            {!isUnlimited && pct > 80 && (
              <button
                type="button"
                onClick={() => handleSelectPlan(PLANS[2])}
                className="inline-flex items-center gap-1 text-xs font-bold hover:underline cursor-pointer"
                style={{ color: brandColor }}
              >
                Pasar a ilimitado <ArrowRight className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ═══ PLANS SELECTION (APPLE INSET CARDS) ═══ */}
      <div className="space-y-3">
        <h2 className="text-base font-bold tracking-tight text-slate-900 dark:text-white px-1">
          Planes Disponibles
        </h2>

        <div className="kpi-stagger -mx-1 flex snap-x snap-mandatory gap-3.5 overflow-x-auto px-1 pt-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-4 [scrollbar-width:none]">
          {PLANS.map((plan) => {
            const isActive = currentPlan === plan.id;
            const isUpgrade = plan.price > currentPlanObj.price;

            return (
              <div
                key={plan.id}
                className={`relative flex w-[78vw] max-w-[300px] shrink-0 snap-center flex-col justify-between rounded-3xl p-5 transition-all duration-300 bg-white dark:bg-[#121215] border shadow-xs hover:-translate-y-1 hover:shadow-lg sm:w-auto sm:max-w-none ${
                  isActive
                    ? "border-primary/40 ring-2 ring-primary/20 dark:border-primary/50"
                    : plan.popular
                      ? "border-slate-300 dark:border-white/20 lg:scale-[1.02]"
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
                    {isActive ? "Tu plan actual" : isUpgrade ? "Mejorar a este plan" : "Cambiar a este plan"}
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

            {(() => {
              const gained = selectedPlanForUpgrade.features.filter((f) => !currentPlanObj.features.includes(f));
              const lost = currentPlanObj.features.filter((f) => !selectedPlanForUpgrade.features.includes(f));
              const isUpgrade = selectedPlanForUpgrade.price > currentPlanObj.price;
              const list = isUpgrade ? gained : lost;
              if (list.length === 0) return null;
              return (
                <div className="space-y-2">
                  <span className="font-bold text-slate-900 dark:text-white block">
                    {isUpgrade ? "Lo que ganás" : "Lo que dejarías de tener"}
                  </span>
                  <ul className="space-y-1.5">
                    {list.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-slate-600 dark:text-zinc-300">
                        <Check className={`h-3.5 w-3.5 shrink-0 mt-0.5 ${isUpgrade ? "text-emerald-500" : "text-rose-400"}`} />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })()}

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
