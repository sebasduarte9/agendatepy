"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  XCircle,
  CheckCircle2,
  MessageSquareX,
  MessageSquareCheck,
  CalendarX,
  CalendarCheck,
  FileSpreadsheet,
  Calculator,
  AlertCircle,
  Zap,
  ArrowRight,
  TrendingUp,
} from "lucide-react";

const BEFORE_ITEMS = [
  {
    icon: MessageSquareX,
    title: "Horas respondiendo WhatsApps",
    desc: "Pasás noches y domingos respondiendo mensajes manuales para coordinar citas.",
  },
  {
    icon: CalendarX,
    title: "20% de turnos vacíos por olvido",
    desc: "Clientes que no llegan porque se olvidaron de la cita y no avisaron a tiempo.",
  },
  {
    icon: FileSpreadsheet,
    title: "Planillas y cuadernos para comisiones",
    desc: "Sumar a mano los cortes y tratamientos de cada empleado al final de la semana.",
  },
  {
    icon: AlertCircle,
    title: "Descuadres al cerrar la caja",
    desc: "Mezcla de cobros en efectivo, transferencias bancarias y pos sin registro claro.",
  },
];

const AFTER_ITEMS = [
  {
    icon: MessageSquareCheck,
    title: "Asistente WhatsApp 24/7",
    desc: "Tu negocio recibe reservas automáticas mientras dormís o atendés a tus clientes.",
  },
  {
    icon: CalendarCheck,
    title: "80% menos ausencias comprobadas",
    desc: "Recordatorios automáticos 24h y 2h antes con botones de confirmación rápida.",
  },
  {
    icon: Calculator,
    title: "Comisiones calculadas en 1 clic",
    desc: "El sistema liquida los porcentajes de cada estilista o profesional sin errores.",
  },
  {
    icon: TrendingUp,
    title: "Caja y Arqueo Cuadrado",
    desc: "Control total de efectivo y transferencias bancarias con balance diario exacto.",
  },
];

export default function ComparisonSection() {
  const [activeTab, setActiveTab] = useState<"after" | "before">("after");

  return (
    <section className="relative py-14 sm:py-20 lg:py-24 scroll-mt-24">
      <div className="relative mx-auto max-w-7xl px-3 sm:px-6">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto space-y-3"
        >
          <div className="inline-flex items-center gap-1.5 rounded-full border border-brand/20 bg-brand/10 dark:bg-brand/20 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-brand">
            <Zap className="h-3.5 w-3.5 text-brand" />
            <span>La Transformación en tu Negocio</span>
          </div>

          <h2 className="text-2xl xs:text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
            El cambio real:{" "}
            <span className="bg-gradient-to-r from-brand via-[#FF6B4A] to-amber-500 bg-clip-text text-transparent">
              Antes vs Con AgendatePY
            </span>
          </h2>

          <p className="text-xs sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto">
            Mirá la diferencia entre gestionar tu local a mano o poner tu agenda en piloto automático.
          </p>
        </motion.div>

        {/* Mobile Switcher Toggle (Before vs After) */}
        <div className="mt-6 flex justify-center lg:hidden">
          <div className="inline-flex rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 p-1 shadow-xs">
            <button
              type="button"
              onClick={() => setActiveTab("before")}
              className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition cursor-pointer ${
                activeTab === "before"
                  ? "bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30 shadow-2xs"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <XCircle className="h-3.5 w-3.5 text-rose-500" />
              <span>Sin AgendatePY</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("after")}
              className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition cursor-pointer ${
                activeTab === "after"
                  ? "bg-brand text-white shadow-xs font-bold"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <CheckCircle2 className="h-3.5 w-3.5 text-white" />
              <span>Con AgendatePY</span>
            </button>
          </div>
        </div>

        {/* Desktop Side-by-Side Comparison Matrix */}
        <div className="mt-8 sm:mt-12 grid gap-6 lg:grid-cols-2 items-stretch">
          {/* LEFT: Sin AgendatePY (El Caos Manual) */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6 }}
            className={`rounded-3xl border border-rose-200/90 dark:border-rose-950/60 bg-rose-50/40 dark:bg-rose-950/20 p-5 sm:p-7 backdrop-blur-xl transition-all duration-300 ${
              activeTab === "before" ? "block" : "hidden lg:block opacity-85 hover:opacity-100"
            }`}
          >
            <div className="flex items-center justify-between pb-4 border-b border-rose-200/80 dark:border-rose-900/40">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-100 dark:bg-rose-900/40 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400">
                  <XCircle className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-rose-900 dark:text-rose-200">Sin AgendatePY</h3>
                  <p className="text-[11px] text-rose-700/80 dark:text-rose-400/80 font-medium">Gestión manual y mensajes cruzados</p>
                </div>
              </div>
              <span className="rounded-full bg-rose-100 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-900/60 px-2.5 py-0.5 text-[10px] font-bold uppercase text-rose-700 dark:text-rose-300">
                Caos Manual
              </span>
            </div>

            <div className="mt-5 space-y-3.5">
              {BEFORE_ITEMS.map((item) => {
                const ItemIcon = item.icon;
                return (
                  <div
                    key={item.title}
                    className="flex items-start gap-3 rounded-2xl border border-rose-200/60 dark:border-rose-900/30 bg-white/80 dark:bg-slate-900/70 p-3.5 shadow-2xs transition hover:border-rose-300 dark:hover:border-rose-800"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-rose-100/80 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 mt-0.5">
                      <ItemIcon className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-rose-100">{item.title}</h4>
                      <p className="mt-0.5 text-[11px] sm:text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* RIGHT: Con AgendatePY (El Negocio Automatizado) */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6 }}
            className={`relative rounded-3xl border-2 border-emerald-500/40 dark:border-emerald-500/40 bg-gradient-to-b from-emerald-50/80 via-emerald-50/30 to-white dark:from-emerald-950/25 dark:via-slate-900 dark:to-slate-950 p-5 sm:p-7 backdrop-blur-xl shadow-xl shadow-emerald-500/10 dark:shadow-none transition-all duration-300 ${
              activeTab === "after" ? "block" : "hidden lg:block"
            }`}
          >
            {/* Glow badge overlay */}
            <div className="pointer-events-none absolute -top-3 right-6 rounded-full bg-gradient-to-r from-emerald-600 to-teal-500 px-3 py-0.5 text-[10px] font-black uppercase text-white shadow-sm">
              Recomendado
            </div>

            <div className="flex items-center justify-between pb-4 border-b border-emerald-500/20 dark:border-emerald-500/20">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">Con AgendatePY</h3>
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">Piloto automático 24/7</p>
                </div>
              </div>
              <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 text-[10px] font-bold uppercase text-emerald-700 dark:text-emerald-300">
                100% Eficiente
              </span>
            </div>

            <div className="mt-5 space-y-3.5">
              {AFTER_ITEMS.map((item) => {
                const ItemIcon = item.icon;
                return (
                  <div
                    key={item.title}
                    className="flex items-start gap-3 rounded-2xl border border-emerald-500/20 dark:border-emerald-500/20 bg-white/90 dark:bg-slate-800/90 p-3.5 shadow-2xs transition hover:border-emerald-500/40"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 mt-0.5">
                      <ItemIcon className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">{item.title}</h4>
                      <p className="mt-0.5 text-[11px] sm:text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 pt-4 border-t border-emerald-500/20 dark:border-emerald-500/20 flex flex-col sm:flex-row items-center justify-between gap-3">
              <p className="text-xs text-slate-600 dark:text-slate-300 font-medium text-center sm:text-left">
                Comenzá ahora sin tarjeta de crédito
              </p>
              <Link
                href="/onboarding"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-brand to-[#FF6B4A] px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-brand/25 hover:brightness-110 transition active:scale-95 cursor-pointer whitespace-nowrap"
              >
                <span>Probar ahora</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

