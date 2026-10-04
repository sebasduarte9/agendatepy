"use client";

import { useState } from "react";
import {
  Check,
  Crown,
  Zap,
  Building2,
  ShieldCheck,
  CreditCard,
  Landmark,
  QrCode,
  Download,
  ExternalLink,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Receipt,
  CheckCircle2,
  PhoneCall,
  Calendar,
} from "lucide-react";
import { useDashboardStore } from "@/store/useDashboardStore";
import Card from "@/components/dashboard/ui/Card";
import Modal from "@/components/dashboard/ui/Modal";
import { formatGs } from "@/lib/dashboard-dates";
import type { PlanId } from "@/lib/dashboard-types";

const PLANS = [
  {
    id: "gratis" as PlanId,
    name: "Plan Inicial Gratuito",
    price: 0,
    period: "/mes para siempre",
    description: "Ideal para dar los primeros pasos y digitalizar tu agenda con 0 costo de inicio.",
    features: [
      "1 profesional / agenda personal",
      "Hasta 20 turnos por mes",
      "Página web de reservas con logo",
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
      "Integraciones y automatizaciones a medida",
      "Facturación legal con RUC e-Kuatia",
      "Capacitación presencial al equipo",
      "Gerente de cuenta dedicado",
    ],
  },
];

const invoices: Array<{ id: string; date: string; concept: string; amount: number; status: string }> = [];

export default function SuscripcionPage() {
  const { business, updateBusiness, pushToast } = useDashboardStore();
  const brandColor = business.primaryColor || "var(--primary, #0ea5e9)";
  const currentPlan = business.plan || "pro";

  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [selectedPlanForUpgrade, setSelectedPlanForUpgrade] = useState<(typeof PLANS)[number] | null>(null);

  const pct = Math.min(
    100,
    Math.round((business.usedBookings / (business.freeBookingLimit || 20)) * 100)
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
      freeBookingLimit:
        selectedPlanForUpgrade.id === "gratis"
          ? 20
          : selectedPlanForUpgrade.id === "basico"
            ? 100
            : 9999,
    });
    pushToast("success", `¡Felicitaciones! Has actualizado al ${selectedPlanForUpgrade.name}.`);
    setCheckoutModalOpen(false);
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-20">
      {/* ═══ DARK CONSOLE HERO HEADER ═══ */}
      <div className="relative overflow-hidden rounded-2xl bg-[#0c1017] dark:bg-[#0c1017] text-white p-6 sm:p-8 border border-slate-800 shadow-xl">
        <div
          className="absolute -right-12 -top-12 h-64 w-64 rounded-full blur-3xl opacity-25 pointer-events-none transition-all duration-700"
          style={{ backgroundColor: brandColor }}
        />

        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-white/90 border border-white/15 backdrop-blur-md">
              <span
                className="h-2 w-2 rounded-full animate-pulse"
                style={{ backgroundColor: brandColor }}
              />
              <span>Planes SaaS & Facturación Legal e-Kuatia</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Suscripción & Planes de Crecimiento
            </h1>
            <p className="text-sm text-slate-300 max-w-xl">
              Planes en Guaraníes (PYG) con 0% de comisiones por reservas cobradas. Facturación electrónica DNIT y pagos directos por SIPAP o QR Bancard.
            </p>
          </div>

          {/* Current Plan Badge Dock */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 rounded-2xl bg-slate-900/80 border border-slate-700/80 backdrop-blur-md">
            <div className="flex items-center gap-2.5">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl text-white font-bold"
                style={{ backgroundColor: brandColor }}
              >
                <Crown className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                  Tu Plan Activo
                </span>
                <span className="text-sm font-extrabold text-white capitalize">
                  {currentPlan === "gratis"
                    ? "Plan Gratuito"
                    : currentPlan === "pro"
                      ? "Plan Pro VIP"
                      : currentPlan === "empresa"
                        ? "Plan Empresa"
                        : "Plan Básico"}
                </span>
              </div>
            </div>

            <div className="sm:border-l sm:border-slate-700/80 sm:pl-3">
              <span className="text-[10px] text-slate-400 block font-semibold">Cupo Mensual</span>
              <span className="font-mono text-xs font-black text-emerald-400">
                {business.usedBookings} / {business.freeBookingLimit} turnos
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Upgrade banner if near limit */}
      {business.usedBookings >= (business.freeBookingLimit * 0.7) && (
        <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-transparent p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold">
              <Zap className="h-5 w-5 fill-amber-500 text-amber-500" />
            </span>
            <div>
              <p className="text-xs font-black text-slate-900 dark:text-white">
                ¡Tu negocio está creciendo con fuerza!
              </p>
              <p className="text-[11px] text-slate-600 dark:text-slate-300">
                Has utilizado {business.usedBookings} de tus {business.freeBookingLimit} turnos de este mes ({pct}% de tu cupo). Pasate a un plan superior para que ningún cliente quede fuera.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              const target = PLANS.find((p) => p.id === (currentPlan === "gratis" ? "basico" : "pro"));
              if (target) handleSelectPlan(target);
            }}
            className="shrink-0 rounded-xl px-4 py-2 text-xs font-bold text-white shadow-md hover:brightness-105 transition cursor-pointer"
            style={{ backgroundColor: brandColor }}
          >
            Ver Planes de Expansión
          </button>
        </div>
      )}

      {/* ═══ APPLE INSET CONTAINER: BENTO TELEMETRY & GAUGES ═══ */}
      <div className="rounded-[28px] bg-slate-100/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 p-4 sm:p-5 shadow-xs space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Card 1: Circular Progress Gauges (Booking Capacity & Zero Commissions) */}
          <div className="lg:col-span-7 rounded-2xl bg-white dark:bg-slate-950 p-5 border border-slate-200/70 dark:border-slate-800/80 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    <TrendingUp className="h-4 w-4" />
                  </div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                    Consumo & Beneficios del Plan
                  </span>
                </div>
                <span className="text-[11px] font-mono font-bold text-slate-500 dark:text-slate-400">
                  Ciclo Mensual Activo
                </span>
              </div>

              {/* Gauges & Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                {/* Gauge 1: Capacity Usage */}
                <div className="flex items-center gap-4 p-3 rounded-xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                  <div className="relative h-14 w-14 shrink-0 flex items-center justify-center">
                    <svg className="h-14 w-14 -rotate-90" viewBox="0 0 44 44">
                      <circle
                        cx="22"
                        cy="22"
                        r="18"
                        className="text-slate-200 dark:text-slate-800"
                        strokeWidth="4"
                        stroke="currentColor"
                        fill="transparent"
                      />
                      <circle
                        cx="22"
                        cy="22"
                        r="18"
                        strokeWidth="4"
                        strokeDasharray={113}
                        strokeDashoffset={113 - (113 * pct) / 100}
                        strokeLinecap="round"
                        stroke={brandColor}
                        fill="transparent"
                        className="transition-all duration-700 ease-out"
                      />
                    </svg>
                    <span className="absolute font-mono font-bold text-xs text-slate-800 dark:text-white">
                      {pct}%
                    </span>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">
                      Cupo Consumido
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-mono">
                      {business.usedBookings} de {business.freeBookingLimit} turnos
                    </span>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                      {business.freeBookingLimit - business.usedBookings > 0
                        ? `${business.freeBookingLimit - business.usedBookings} disponibles`
                        : "Límite alcanzado"}
                    </span>
                  </div>
                </div>

                {/* Gauge 2: Zero Commissions */}
                <div className="flex items-center gap-4 p-3 rounded-xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                  <div className="relative h-14 w-14 shrink-0 flex items-center justify-center">
                    <svg className="h-14 w-14 -rotate-90" viewBox="0 0 44 44">
                      <circle
                        cx="22"
                        cy="22"
                        r="18"
                        className="text-emerald-500/20"
                        strokeWidth="4"
                        stroke="currentColor"
                        fill="transparent"
                      />
                      <circle
                        cx="22"
                        cy="22"
                        r="18"
                        strokeWidth="4"
                        strokeDasharray={113}
                        strokeDashoffset={0}
                        strokeLinecap="round"
                        stroke="#10b981"
                        fill="transparent"
                      />
                    </svg>
                    <span className="absolute font-mono font-bold text-xs text-emerald-600 dark:text-emerald-400">
                      0%
                    </span>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">
                      Comisión por Reserva
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                      100% de lo que cobrás es tuyo
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Sin retenciones ocultas
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick KPI Bar */}
            <div className="grid grid-cols-3 gap-2 pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 text-center">
              <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 font-semibold block">Factura Legal</span>
                <span className="font-mono font-extrabold text-xs text-slate-900 dark:text-white">
                  e-Kuatia SET
                </span>
              </div>
              <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 font-semibold block">Medio de Pago</span>
                <span className="font-mono font-extrabold text-xs text-slate-900 dark:text-white">
                  SIPAP / Bancard
                </span>
              </div>
              <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 font-semibold block">Moneda Oficial</span>
                <span className="font-mono font-extrabold text-xs text-emerald-600 dark:text-emerald-400">
                  Guaraníes (PYG)
                </span>
              </div>
            </div>
          </div>

          {/* Card 2: Local Paraguay Support & Guarantee */}
          <div className="lg:col-span-5 rounded-2xl bg-white dark:bg-slate-950 p-5 border border-slate-200/70 dark:border-slate-800/80 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                    Garantías de Servicio
                  </span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 font-semibold">
                  Local
                </span>
              </div>

              <div className="space-y-2.5 pt-3">
                <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                  <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600">
                    <PhoneCall className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">
                      Soporte Humano por WhatsApp
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Equipo técnico en Asunción listo para asistirte
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                  <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-600">
                    <Building2 className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">
                      Facturación con RUC Tributario
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Descargá tu factura legal directamente en cada renovación
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400 text-[11px]">¿Tenés dudas sobre qué plan elegir?</span>
              <a
                href="https://wa.me/595981000000?text=Hola,%20tengo%20dudas%20sobre%20los%20planes%20de%20AgendatePY"
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold hover:underline cursor-pointer flex items-center gap-1"
                style={{ color: brandColor }}
              >
                <span>Chatear con soporte</span>
                <ArrowRight className="h-3 w-3" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ PLANS PRICING GRID ═══ */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {PLANS.map((plan) => {
          const isActive = currentPlan === plan.id;

          return (
            <Card
              key={plan.id}
              className={`flex flex-col justify-between relative transition-all duration-300 hover:-translate-y-1.5 rounded-2xl bg-white dark:bg-slate-950 p-6 ${
                plan.popular
                  ? "border-2 shadow-xl"
                  : "border border-slate-200/80 dark:border-slate-800"
              }`}
              style={plan.popular ? { borderColor: brandColor } : {}}
            >
              {plan.popular && (
                <span
                  className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full px-4 py-1 text-[10px] font-black uppercase tracking-wider text-white shadow-md"
                  style={{ backgroundColor: brandColor }}
                >
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
                  <span className="text-3xl font-mono font-black text-slate-900 dark:text-white tracking-tight">
                    {formatGs(plan.price)}
                  </span>
                  <span className="text-xs text-slate-400 font-semibold">{plan.period}</span>
                </div>

                <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300 pt-2 border-t border-slate-100 dark:border-slate-800">
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
                  className={`w-full rounded-xl py-2.5 text-xs font-bold transition shadow-sm cursor-pointer ${
                    isActive
                      ? "bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700 cursor-default"
                      : plan.popular
                        ? "text-white shadow-lg hover:brightness-110"
                        : "bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90"
                  }`}
                  style={!isActive && plan.popular ? { backgroundColor: brandColor } : {}}
                >
                  {isActive ? "Plan Actual Activo" : "Seleccionar este Plan"}
                </button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* ═══ INVOICES HISTORY TABLE CARD ═══ */}
      <Card className="space-y-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 bg-white dark:bg-slate-950 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <Receipt className="h-4 w-4" style={{ color: brandColor }} />
              <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">
                Historial de Facturación & Comprobantes Legales
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Descargá tus facturas electrónicas con validez tributaria ante la DNIT / SET.
            </p>
          </div>
          <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 border border-emerald-500/20">
            <ShieldCheck className="h-3.5 w-3.5" /> e-Kuatia Activo
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                <th className="pb-3 pl-2">Nro. Factura</th>
                <th className="pb-3">Fecha</th>
                <th className="pb-3">Concepto</th>
                <th className="pb-3 text-right">Monto</th>
                <th className="pb-3 text-center">Estado</th>
                <th className="pb-3 pr-2 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 italic text-xs">
                    No hay facturas emitidas todavía. Las facturas electrónicas aparecerán aquí cuando actives tu plan.
                  </td>
                </tr>
              ) : (
                invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-900/40 transition">
                    <td className="py-3 pl-2 font-mono font-bold text-slate-900 dark:text-white">
                      {inv.id}
                    </td>
                    <td className="py-3 text-slate-500 dark:text-slate-400">{inv.date}</td>
                    <td className="py-3 font-medium text-slate-800 dark:text-slate-200">
                      {inv.concept}
                    </td>
                    <td className="py-3 text-right font-black font-mono text-slate-900 dark:text-white">
                      {formatGs(inv.amount)}
                    </td>
                    <td className="py-3 text-center">
                      <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-3 pr-2 text-right">
                      <button
                        type="button"
                        onClick={() => pushToast("success", `Descargando ${inv.id}.pdf...`)}
                        className="inline-flex items-center gap-1 font-semibold hover:underline cursor-pointer"
                        style={{ color: brandColor }}
                      >
                        <Download className="h-3.5 w-3.5" />
                        <span>PDF</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ═══ UPGRADE CHECKOUT MODAL ═══ */}
      <Modal
        open={checkoutModalOpen}
        onClose={() => setCheckoutModalOpen(false)}
        title={selectedPlanForUpgrade ? `Cambiar a ${selectedPlanForUpgrade.name}` : "Confirmar Plan"}
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
              <p className="text-slate-500 dark:text-slate-400">
                {selectedPlanForUpgrade.description}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 space-y-3">
              <p className="font-bold text-slate-900 dark:text-white">
                Métodos de Pago Habilitados en Paraguay:
              </p>
              <div className="space-y-2 text-slate-600 dark:text-slate-300">
                <div className="flex items-center gap-2">
                  <QrCode className="h-4 w-4" style={{ color: brandColor }} />
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
                className="rounded-xl border border-slate-200/80 dark:border-slate-800 px-4 py-2 font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmUpgrade}
                className="rounded-xl px-6 py-2 font-bold text-white shadow-md transition hover:brightness-110 cursor-pointer"
                style={{ backgroundColor: brandColor }}
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
