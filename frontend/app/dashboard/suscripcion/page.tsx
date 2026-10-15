"use client";

import { useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  BadgePercent,
  Building2,
  Check,
  Crown,
  HelpCircle,
  Lock,
  MessageCircle,
  Receipt,
  Sparkles,
  Wallet,
} from "lucide-react";
import { useDashboardStore } from "@/store/useDashboardStore";
import { formatGs } from "@/lib/dashboard-dates";
import { getCommercialWhatsAppUrl } from "@/lib/config/whatsapp";
import { tenantHost } from "@/lib/tenant/public-url";
import { PLANS, planById, type PlanInfo } from "@/lib/plans";

type Billing = "mensual" | "anual";

const QUICK_QUESTIONS = [
  { label: "Dudas con un pago", text: "Tengo una consulta sobre un pago de mi suscripción." },
  { label: "Quiero factura", text: "Necesito la factura de mi suscripción." },
  { label: "Ayuda con la configuración", text: "Necesito ayuda para configurar mi cuenta." },
  { label: "Cancelar mi plan", text: "Quiero consultar cómo cancelar mi plan." },
];

export default function SuscripcionPage() {
  const business = useDashboardStore((s) => s.business);
  const [billing, setBilling] = useState<Billing>("mensual");

  const currentId = business.plan || "pro";
  const current = planById(currentId);
  const currentIndex = current ? PLANS.indexOf(current) : PLANS.length;
  const isCustomPlan = !current; // Empresa / plans arranged by sales

  const limit = current?.bookingLimit ?? null;
  const used = business.usedBookings || 0;
  const pct = limit ? Math.min(100, Math.round((used / limit) * 100)) : 0;
  const remaining = limit ? Math.max(0, limit - used) : null;
  const nearLimit = limit !== null && pct >= 80;
  const nextPlan = currentIndex < PLANS.length - 1 ? PLANS[currentIndex + 1] : null;

  const host = tenantHost(business.slug || "mi-local");

  function contactUrl(message: string) {
    const planName = current?.name ?? "Plan Empresa";
    return getCommercialWhatsAppUrl(
      `Hola equipo de AgendatePY 👋\n\n${message}\n\n• Negocio: ${business.name}\n• Enlace: ${host}\n• Plan actual: ${planName}`
    );
  }

  function planUrl(plan: PlanInfo) {
    const isUpgrade = PLANS.indexOf(plan) > currentIndex;
    if (plan.priceMonthly === 0) return contactUrl(`Quiero pasar al *${plan.name}*.`);
    const price =
      billing === "anual"
        ? `${formatGs(plan.priceAnnualMonthly * 12)} al año`
        : `${formatGs(plan.priceMonthly)} por mes`;
    return contactUrl(
      `${isUpgrade ? "Quiero mejorar" : "Quiero cambiar"} al *${plan.name}* con pago ${billing} (${price}). ¿Cómo sigo?`
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-5 pb-28 sm:space-y-6 sm:pb-12">
      {/* ═══ HEADER ═══ */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">Tu cuenta</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-3xl">Suscripción</h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-500 dark:text-zinc-400">
            Tu plan, el uso del mes y cómo mejorarlo. Los cambios de plan se hacen por WhatsApp con nuestro equipo.
          </p>
        </div>
        <a
          href={contactUrl("Tengo una consulta sobre mi suscripción.")}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-500"
        >
          <MessageCircle className="h-4 w-4" />
          Hablar con un asesor
        </a>
      </header>

      {/* ═══ CURRENT PLAN + USAGE ═══ */}
      <section className="grid gap-3 lg:grid-cols-5">
        <div className="rounded-3xl glass-panel p-4 sm:p-5 lg:col-span-3">
          <div className="flex items-start gap-3.5">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary text-white shadow-sm">
              {isCustomPlan ? <Building2 className="h-5 w-5" /> : <Crown className="h-5 w-5" />}
            </span>
            <div className="min-w-0 flex-1">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Plan activo
              </span>
              <h2 className="mt-1.5 text-xl font-semibold tracking-tight text-slate-900 dark:text-white">
                {current?.name ?? "Plan Empresa"}
              </h2>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-zinc-400">
                {current?.description ?? "Plan a medida acordado con nuestro equipo comercial."}
              </p>
            </div>
          </div>

          <dl className="mt-4 grid grid-cols-2 gap-2 border-t border-slate-200/70 pt-4 dark:border-white/10 sm:grid-cols-3">
            <div>
              <dt className="text-[11px] font-medium text-slate-500 dark:text-zinc-400">Precio</dt>
              <dd className="mt-0.5 text-base font-semibold tabular-nums text-slate-900 dark:text-white">
                {current ? (current.priceMonthly === 0 ? "Gratis" : `${formatGs(current.priceMonthly)}/mes`) : "A medida"}
              </dd>
            </div>
            <div>
              <dt className="text-[11px] font-medium text-slate-500 dark:text-zinc-400">Profesionales</dt>
              <dd className="mt-0.5 text-base font-semibold tabular-nums text-slate-900 dark:text-white">
                {current?.staffLimit ? `Hasta ${current.staffLimit}` : "Sin límite"}
              </dd>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <dt className="text-[11px] font-medium text-slate-500 dark:text-zinc-400">Comisión por turno</dt>
              <dd className="mt-0.5 inline-flex items-center gap-1 text-base font-semibold text-slate-900 dark:text-white">
                <BadgePercent className="h-4 w-4 text-amber-500" />
                0%
              </dd>
            </div>
          </dl>
        </div>

        <div className="flex flex-col justify-between rounded-3xl glass-panel p-4 sm:p-5 lg:col-span-2">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-zinc-400">Turnos de este mes</p>
            <p className="mt-1 text-3xl font-semibold tabular-nums tracking-tight text-slate-900 dark:text-white">
              {used}
              {limit !== null && <span className="text-base font-medium text-slate-400"> / {limit}</span>}
            </p>
          </div>
          {limit !== null ? (
            <div className="mt-3">
              <div
                className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-white/[0.06]"
                role="progressbar"
                aria-valuenow={pct}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Uso de turnos del mes"
              >
                <div
                  className={`h-full rounded-full transition-all duration-700 ${pct >= 100 ? "bg-rose-500" : nearLimit ? "bg-amber-500" : "bg-primary"}`}
                  style={{ width: `${Math.max(pct, 2)}%` }}
                />
              </div>
              <p className={`mt-1.5 text-xs font-medium ${pct >= 100 ? "text-rose-600 dark:text-rose-400" : nearLimit ? "text-amber-600 dark:text-amber-400" : "text-slate-500 dark:text-zinc-400"}`}>
                {remaining === 0 ? "Llegaste al límite del mes" : `Te quedan ${remaining} turnos · ${pct}% usado`}
              </p>
            </div>
          ) : (
            <p className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
              <Check className="h-3.5 w-3.5" />
              Turnos ilimitados
            </p>
          )}
          <p className="mt-2 text-[11px] text-slate-400 dark:text-zinc-500">Se reinicia el 1° de cada mes.</p>
        </div>
      </section>

      {nearLimit && nextPlan && (
        <div className="flex flex-col gap-3 rounded-2xl border border-amber-500/25 bg-amber-500/[0.07] px-3.5 py-3 sm:flex-row sm:items-center sm:justify-between">
          <span className="flex items-start gap-2.5 text-xs">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
            <span>
              <span className="block font-semibold text-amber-800 dark:text-amber-200">
                {remaining === 0 ? "Llegaste al límite de turnos del mes" : "Estás cerca del límite de turnos"}
              </span>
              <span className="mt-0.5 block text-[11px] text-slate-600 dark:text-zinc-400">
                Con el {nextPlan.name} tenés {nextPlan.bookingLimit ? `hasta ${nextPlan.bookingLimit} turnos` : "turnos ilimitados"} por mes.
              </span>
            </span>
          </span>
          <a
            href={planUrl(nextPlan)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-10 shrink-0 items-center justify-center gap-1.5 rounded-xl bg-amber-500 px-3.5 text-xs font-semibold text-white transition hover:bg-amber-400"
          >
            Mejorar al {nextPlan.name}
            <ArrowRight className="h-3.5 w-3.5" />
          </a>
        </div>
      )}

      {/* ═══ PLANS ═══ */}
      <section className="space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">Planes</h2>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-zinc-400">Sin contratos: cambiás o cancelás cuando quieras.</p>
          </div>
          <div role="radiogroup" aria-label="Forma de pago" className="inline-flex self-start rounded-2xl border border-white/10 bg-white/[0.03] p-1 sm:self-auto">
            {(["mensual", "anual"] as const).map((b) => (
              <button
                key={b}
                type="button"
                role="radio"
                aria-checked={billing === b}
                onClick={() => setBilling(b)}
                className={`inline-flex min-h-9 items-center gap-1.5 rounded-xl px-3.5 text-xs font-semibold transition ${
                  billing === b ? "bg-white text-slate-900 shadow-sm dark:bg-white/15 dark:text-white" : "text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-white"
                }`}
              >
                {b === "mensual" ? "Mensual" : "Anual"}
                {b === "anual" && (
                  <span className="rounded-full bg-emerald-500/15 px-1.5 py-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                    2 meses gratis
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          {PLANS.map((plan, index) => {
            const isCurrent = plan.id === currentId;
            const isUpgrade = index > currentIndex;
            const recommended = plan.badge === "Recomendado";
            const monthly = billing === "anual" ? plan.priceAnnualMonthly : plan.priceMonthly;
            return (
              <article
                key={plan.id}
                className={`relative flex min-w-0 flex-col rounded-3xl glass-panel p-4 sm:p-5 ${
                  isCurrent ? "ring-2 ring-primary/50" : recommended ? "ring-1 ring-primary/25" : ""
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-base font-semibold text-slate-900 dark:text-white">{plan.name}</h3>
                  {isCurrent ? (
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">Tu plan</span>
                  ) : plan.badge ? (
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${recommended ? "bg-primary text-white" : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"}`}>
                      {plan.badge}
                    </span>
                  ) : null}
                </div>
                <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400 md:min-h-8">{plan.description}</p>

                <div className="mt-4">
                  <p className="flex items-baseline gap-1">
                    <span className="text-2xl font-semibold tabular-nums tracking-tight text-slate-900 dark:text-white">
                      {monthly === 0 ? "Gratis" : formatGs(monthly)}
                    </span>
                    {monthly > 0 && <span className="text-xs text-slate-400">/mes</span>}
                  </p>
                  <p className="mt-0.5 min-h-4 text-[11px] text-slate-500 dark:text-zinc-400">
                    {plan.priceMonthly === 0
                      ? "Para siempre, sin tarjeta"
                      : billing === "anual"
                        ? `${formatGs(plan.priceAnnualMonthly * 12)} al año · ahorrás ${formatGs((plan.priceMonthly - plan.priceAnnualMonthly) * 12)}`
                        : "Facturado mes a mes"}
                  </p>
                </div>

                <div className="mt-4 flex-1 border-t border-slate-200/70 pt-4 dark:border-white/10">
                  {plan.includes && <p className="mb-2 text-[11px] font-semibold text-slate-700 dark:text-zinc-300">{plan.includes}</p>}
                  <ul className="space-y-2">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-xs text-slate-600 dark:text-zinc-300">
                        <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-5">
                  {isCurrent ? (
                    <span className="flex min-h-11 w-full items-center justify-center gap-1.5 rounded-2xl border border-white/10 bg-white/[0.03] text-xs font-semibold text-slate-500 dark:text-zinc-400">
                      <Check className="h-4 w-4" />
                      Tu plan actual
                    </span>
                  ) : (
                    <a
                      href={planUrl(plan)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl text-xs font-semibold transition ${
                        isUpgrade
                          ? "bg-primary text-white shadow-sm hover:brightness-110"
                          : "border border-white/10 text-slate-700 hover:bg-white/[0.06] dark:text-zinc-200"
                      }`}
                    >
                      <MessageCircle className="h-4 w-4" />
                      {isUpgrade ? `Mejorar al ${plan.name}` : "Consultar cambio"}
                    </a>
                  )}
                </div>
              </article>
            );
          })}
        </div>

        <a
          href={contactUrl("Tengo varias sucursales o más de 10 profesionales y quiero un plan a medida.")}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.02] px-3.5 py-3 transition hover:bg-white/[0.05]"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/[0.05] text-slate-500 dark:text-zinc-300">
            <Building2 className="h-4 w-4" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-semibold text-slate-900 dark:text-white">¿Más de 10 profesionales o varias sucursales?</span>
            <span className="block text-[11px] text-slate-500 dark:text-zinc-400">Armamos un plan a medida para tu negocio.</span>
          </span>
          <ArrowRight className="h-4 w-4 shrink-0 text-slate-400 transition group-hover:translate-x-0.5" />
        </a>
      </section>

      {/* ═══ HOW IT WORKS + SUPPORT ═══ */}
      <section className="grid gap-3 lg:grid-cols-2">
        <div className="rounded-3xl glass-panel p-4 sm:p-5">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white sm:text-base">Cómo cambiar de plan</h2>
          <ol className="mt-3 space-y-3">
            {[
              { Icon: MessageCircle, title: "Escribinos por WhatsApp", text: "Tocá el plan que querés y te llega el mensaje listo con los datos de tu negocio." },
              { Icon: Wallet, title: "Pagás como prefieras", text: "Transferencia bancaria, QR o tarjetas paraguayas." },
              { Icon: Sparkles, title: "Activamos tu plan", text: "Apenas confirmamos el pago, sin perder nada de lo que ya cargaste." },
            ].map((step, i) => (
              <li key={step.title} className="flex items-start gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-xs font-semibold text-primary">{i + 1}</span>
                <span className="min-w-0">
                  <span className="block text-xs font-semibold text-slate-900 dark:text-white">{step.title}</span>
                  <span className="block text-[11px] text-slate-500 dark:text-zinc-400">{step.text}</span>
                </span>
              </li>
            ))}
          </ol>
          <div className="mt-4 grid grid-cols-2 gap-2 border-t border-slate-200/70 pt-4 dark:border-white/10">
            <p className="flex items-center gap-2 text-[11px] text-slate-600 dark:text-zinc-300">
              <Lock className="h-3.5 w-3.5 shrink-0 text-slate-400" />
              Sin permanencia
            </p>
            <p className="flex items-center gap-2 text-[11px] text-slate-600 dark:text-zinc-300">
              <Receipt className="h-3.5 w-3.5 shrink-0 text-slate-400" />
              Factura legal
            </p>
          </div>
        </div>

        <div className="rounded-3xl glass-panel p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <HelpCircle className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white sm:text-base">¿Tenés alguna consulta?</h2>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-zinc-400">Te respondemos por WhatsApp, desde Paraguay.</p>
            </div>
          </div>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {QUICK_QUESTIONS.map((q) => (
              <a
                key={q.label}
                href={contactUrl(q.text)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-h-11 items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/[0.02] px-3 text-xs font-medium text-slate-700 transition hover:bg-white/[0.06] dark:text-zinc-200"
              >
                {q.label}
                <ArrowRight className="h-3.5 w-3.5 shrink-0 text-slate-400" />
              </a>
            ))}
          </div>
          <a
            href={contactUrl("Tengo una consulta.")}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 text-xs font-semibold text-white transition hover:bg-emerald-500"
          >
            <MessageCircle className="h-4 w-4" />
            Escribir otra consulta
          </a>
        </div>
      </section>
    </div>
  );
}
