"use client";

import { useState } from "react";
import {
  Sparkles,
  TrendingUp,
  Brain,
  Zap,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Users,
  AlertTriangle,
  Lightbulb,
  X,
} from "lucide-react";
import { formatGs } from "@/lib/dashboard-dates";

interface AICopilotProps {
  businessName: string;
  monthlyRevenue: number;
  confirmedAppointments: number;
}

export default function AIFinanceCopilot({
  businessName,
  monthlyRevenue,
  confirmedAppointments,
}: AICopilotProps) {
  const [activeTab, setActiveTab] = useState<"insights" | "forecast" | "automation">("insights");
  const [appliedAction, setAppliedAction] = useState<string | null>(null);

  const handleApplyAction = (actionId: string) => {
    setAppliedAction(actionId);
    setTimeout(() => setAppliedAction(null), 3500);
  };

  return (
    <div className="relative overflow-hidden rounded-3xl border border-violet-200/80 dark:border-violet-500/20 bg-gradient-to-br from-violet-50/70 via-white to-indigo-50/60 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950/70 p-6 text-slate-900 dark:text-white shadow-xl backdrop-blur-xl transition-all duration-300">
      {/* Decorative ambient background glows (Antigravity spatial depth) */}
      <div className="pointer-events-none absolute -right-16 -top-16 h-72 w-72 rounded-full bg-violet-600/15 dark:bg-violet-600/20 blur-3xl animate-pulse" />
      <div className="pointer-events-none absolute -left-12 -bottom-12 h-64 w-64 rounded-full bg-cyan-500/10 dark:bg-cyan-500/15 blur-3xl" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/[0.04] via-transparent to-transparent" />

      {/* Header bar */}
      <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200/80 dark:border-white/10 pb-5">
        <div className="flex items-center gap-3">
          <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-500 p-0.5 shadow-lg shadow-violet-500/30">
            <div className="flex h-full w-full items-center justify-center rounded-[14px] bg-white dark:bg-slate-950/80">
              <Brain className="h-5 w-5 text-violet-600 dark:text-violet-300 animate-pulse" />
            </div>
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500" />
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-black tracking-tight text-slate-900 dark:text-white sm:text-lg">
                Agendate AI · Copiloto Financiero & Operativo
              </h2>
              <span className="rounded-full border border-violet-400/40 bg-violet-500/15 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-violet-700 dark:text-violet-300">
                v2.5 SaaS
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Modelos predictivos en tiempo real para optimizar ingresos y ocupación en Paraguay
            </p>
          </div>
        </div>

        {/* Navigation tabs */}
        <div className="flex items-center gap-1.5 rounded-2xl bg-white/80 dark:bg-black/40 p-1 border border-slate-200/80 dark:border-white/10 text-xs shadow-xs">
          <button
            type="button"
            onClick={() => setActiveTab("insights")}
            className={`rounded-xl px-3 py-1.5 font-bold transition-all duration-300 ${
              activeTab === "insights"
                ? "bg-violet-600 text-white shadow-md shadow-violet-600/30"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Sugerencias AI
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("forecast")}
            className={`rounded-xl px-3 py-1.5 font-bold transition-all duration-300 ${
              activeTab === "forecast"
                ? "bg-violet-600 text-white shadow-md shadow-violet-600/30"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Previsión de Caja
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("automation")}
            className={`rounded-xl px-3 py-1.5 font-bold transition-all duration-300 ${
              activeTab === "automation"
                ? "bg-violet-600 text-white shadow-md shadow-violet-600/30"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Automatizaciones
          </button>
        </div>
      </div>

      {/* Main Tab Content */}
      <div className="relative z-10 mt-5">
        {activeTab === "insights" && (
          <div className="grid gap-4 lg:grid-cols-3">
            {/* Card 1: Revenue Gap Filler */}
            <div className="group rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-white/[0.03] p-4.5 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-violet-400/40 hover:bg-white dark:hover:bg-white/[0.06] hover:shadow-xl">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs font-bold text-violet-700 dark:text-violet-300">
                  <Zap className="h-4 w-4 text-violet-600 dark:text-violet-400" /> Auto-Fill de Huecos
                </span>
                <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                  +Gs. 340.000 pot.
                </span>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                Se detectaron <strong>3 horarios libres</strong> este viernes entre las 14:00 y las 16:30. Sugerimos lanzar una notificación por WhatsApp a tus clientes habituales de la tarde.
              </p>
              <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-white/10 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">Tasa de respuesta estimada: 74%</span>
                <button
                  type="button"
                  onClick={() => handleApplyAction("gap-filler")}
                  className="inline-flex items-center gap-1 rounded-xl bg-violet-600 hover:bg-violet-700 px-3 py-1.5 text-[11px] font-bold text-white transition-all shadow-xs"
                >
                  {appliedAction === "gap-filler" ? (
                    <>
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-300" />
                      <span>¡Disparado!</span>
                    </>
                  ) : (
                    <>
                      <span>Activar Turnos Flash</span>
                      <ArrowRight className="h-3 w-3" />
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Card 2: Upselling & Cross-selling */}
            <div className="group rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-white/[0.03] p-4.5 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-cyan-400/40 hover:bg-white dark:hover:bg-white/[0.06] hover:shadow-xl">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs font-bold text-cyan-700 dark:text-cyan-300">
                  <TrendingUp className="h-4 w-4 text-cyan-600 dark:text-cyan-400" /> Ticket Promedio
                </span>
                <span className="rounded-full bg-cyan-500/15 px-2 py-0.5 text-[10px] font-bold text-cyan-700 dark:text-cyan-300">
                  +18% Upsell
                </span>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                El 62% de clientes que agendan <strong>Corte Premium</strong> suelen adquirir pomada o cera si se les ofrece al confirmar por WhatsApp. Podés sumar Gs. 45.000 por ticket.
              </p>
              <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-white/10 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">Recomendador activo</span>
                <button
                  type="button"
                  onClick={() => handleApplyAction("upsell")}
                  className="inline-flex items-center gap-1 rounded-xl bg-cyan-600 hover:bg-cyan-700 px-3 py-1.5 text-[11px] font-bold text-white transition-all shadow-xs"
                >
                  {appliedAction === "upsell" ? (
                    <>
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-300" />
                      <span>Configurado</span>
                    </>
                  ) : (
                    <>
                      <span>Ofrecer en Checkout</span>
                      <ArrowRight className="h-3 w-3" />
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Card 3: Anti-No-Show Shield */}
            <div className="group rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-white/[0.03] p-4.5 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-emerald-400/40 hover:bg-white dark:hover:bg-white/[0.06] hover:shadow-xl">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                  <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" /> Escudo Anti-No-Show
                </span>
                <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                  98.2% Asistencia
                </span>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                Los recordatorios automáticos de 24h y 2h antes (con Google Calendar y Apple Reminders) evitaron <strong>14 cancelaciones sorpresa</strong> en los últimos 30 días.
              </p>
              <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-white/10 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">Ahorro est.: Gs. 1.120.000</span>
                <button
                  type="button"
                  onClick={() => handleApplyAction("shield")}
                  className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 text-[11px] font-bold text-white transition-all shadow-xs"
                >
                  {appliedAction === "shield" ? (
                    <>
                      <CheckCircle2 className="h-3.5 w-3.5 text-white" />
                      <span>Optimizado</span>
                    </>
                  ) : (
                    <>
                      <span>Auditar Alertas</span>
                      <ArrowRight className="h-3 w-3" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "forecast" && (
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-md">
              <span className="text-xs font-medium text-slate-400">Proyección Fin de Mes</span>
              <p className="mt-1 text-2xl font-black text-emerald-400">
                {formatGs(monthlyRevenue * 1.35 + 4200000)}
              </p>
              <p className="mt-1 text-[11px] text-slate-400">
                Basado en historial de repetición y reservas recurrentes (+14.2% intermensual)
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-md">
              <span className="text-xs font-medium text-slate-400">Ocupación Máxima Estimada</span>
              <p className="mt-1 text-2xl font-black text-violet-300">89.4%</p>
              <p className="mt-1 text-[11px] text-slate-400">
                Capacidad óptima sin saturar a los profesionales ni generar demoras en sala
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-md">
              <span className="text-xs font-medium text-slate-400">Flujo SIPAP Directo</span>
              <p className="mt-1 text-2xl font-black text-cyan-300">42% del total</p>
              <p className="mt-1 text-[11px] text-slate-400">
                Los clientes prefieren transferencia bancaria previa o en caja por QR SIPAP
              </p>
            </div>
          </div>
        )}

        {activeTab === "automation" && (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-md">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h4 className="text-sm font-bold text-white">
                  Reglas de Inteligencia Financiera Activas
                </h4>
                <p className="text-xs text-slate-400">
                  El sistema ajusta automáticamente recordatorios, ofertas de rescate y cálculo de comisiones
                </p>
              </div>
              <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-400">
                3 Agentes Autónomos Corriendo
              </span>
            </div>
            <div className="mt-3 grid gap-2 sm:grid-cols-3 text-xs">
              <div className="rounded-xl border border-white/5 bg-black/30 p-2.5">
                <p className="font-bold text-slate-200">1. Alerta de Inactividad 21d</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Envía invitación WhatsApp al cliente regular</p>
              </div>
              <div className="rounded-xl border border-white/5 bg-black/30 p-2.5">
                <p className="font-bold text-slate-200">2. Recordatorio Smart Calendar</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Genera link Android o iOS con alarmas</p>
              </div>
              <div className="rounded-xl border border-white/5 bg-black/30 p-2.5">
                <p className="font-bold text-slate-200">3. Auditoría de Caja SIPAP</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Concilia turnos pagados con comprobantes</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* AI Prompt action pills */}
      <div className="relative z-10 mt-5 flex flex-wrap items-center gap-2 border-t border-white/10 pt-4">
        <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
          <Sparkles className="h-3.5 w-3.5 text-violet-400" /> Consultar al Copiloto:
        </span>
        {[
          "¿Cómo aumentar la facturación del fin de semana?",
          "¿Quién es el profesional con mayor ticket promedio?",
          "Ver previsión de no-shows para mañana",
        ].map((promptText, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleApplyAction(`prompt-${idx}`)}
            className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] text-slate-300 hover:border-violet-400/50 hover:bg-violet-600/20 hover:text-white transition-all duration-300"
          >
            {promptText}
          </button>
        ))}
      </div>
    </div>
  );
}
