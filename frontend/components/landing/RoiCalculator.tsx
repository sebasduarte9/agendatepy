"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Calculator,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
} from "lucide-react";

export default function RoiCalculator() {
  const [turnosPorDia, setTurnosPorDia] = useState<number>(15);
  const [precioPromedio, setPrecioPromedio] = useState<number>(85000);
  const [diasPorMes, setDiasPorMes] = useState<number>(24);

  // Cálculos de inasistencias y recupero
  const {
    turnosMensuales,
    turnosPerdidos,
    perdidaTotal,
    turnosRecuperados,
    dineroRecuperado,
    diasParaPagarPlan,
  } = useMemo(() => {
    const totalTurnos = turnosPorDia * diasPorMes;
    // Tasa habitual de inasistencias en salones/consultorios sin sistema automatizado: 20%
    const ausencias = Math.round(totalTurnos * 0.2);
    const perdida = ausencias * precioPromedio;
    // AgendatePY reduce las inasistencias en un 80% comprobado vía WhatsApp
    const recuperados = Math.round(ausencias * 0.8);
    const recuperadoDinero = recuperados * precioPromedio;

    // Plan Pro estándar: Gs. 250.000 / mes
    const costoPlanPro = 250000;
    const gananciaDiariaRecuperada = recuperadoDinero / diasPorMes;
    const dias = Math.max(1, Math.ceil(costoPlanPro / (gananciaDiariaRecuperada || 1)));

    return {
      turnosMensuales: totalTurnos,
      turnosPerdidos: ausencias,
      perdidaTotal: perdida,
      turnosRecuperados: recuperados,
      dineroRecuperado: recuperadoDinero,
      diasParaPagarPlan: dias,
    };
  }, [turnosPorDia, precioPromedio, diasPorMes]);

  const formatGs = (val: number) => {
    return "Gs. " + val.toLocaleString("es-PY");
  };

  return (
    <section id="calculadora" className="relative overflow-hidden py-20 sm:py-28">
      {/* Luces y orbes ambientales decorativos */}
      <div className="pointer-events-none absolute left-1/4 top-1/2 -translate-y-1/2 -translate-x-1/2 h-96 w-96 rounded-full bg-brand/10 blur-[120px] dark:bg-brand/20" />
      <div className="pointer-events-none absolute right-10 top-1/3 h-80 w-80 rounded-full bg-emerald-500/10 blur-[100px] dark:bg-emerald-500/15" />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        {/* Cabecera de la sección */}
        <div className="mx-auto max-w-3xl text-center space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-brand/20 bg-brand/5 dark:bg-brand/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-brand backdrop-blur-md">
            <Calculator className="h-3.5 w-3.5" />
            <span>Calculadora Interactiva de Recupero</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
            ¿Cuánto dinero estás perdiendo por{" "}
            <span className="bg-gradient-to-r from-red-500 via-amber-500 to-brand bg-clip-text text-transparent">
              turnos vacíos?
            </span>
          </h2>

          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto">
            En salones, clínicas y centros de estética de Paraguay, el 20% de las citas se pierden por olvido o falta de aviso. Mirá en tiempo real cuánto recuperás con recordatorios de WhatsApp.
          </p>
        </div>

        {/* Contenedor Principal: Calculadora */}
        <div className="mt-12 grid gap-8 lg:grid-cols-12 items-center">
          {/* Columna Izquierda: Sliders interactivos (Col 7) */}
          <div className="lg:col-span-7 rounded-3xl border border-slate-200/90 dark:border-white/10 bg-white/80 dark:bg-slate-900/80 p-6 sm:p-9 shadow-xl shadow-slate-200/50 dark:shadow-none backdrop-blur-2xl space-y-7">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                  ¿Cuántos turnos o clientes atendés por día?
                </label>
                <span className="rounded-full bg-brand/10 dark:bg-brand/20 px-3 py-1 text-sm font-black text-brand">
                  {turnosPorDia} turnos/día
                </span>
              </div>
              <input
                type="range"
                min={3}
                max={50}
                step={1}
                value={turnosPorDia}
                onChange={(e) => setTurnosPorDia(Number(e.target.value))}
                className="w-full h-2.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-brand transition-all"
              />
              <div className="flex justify-between text-[11px] text-slate-400 mt-1 font-medium">
                <span>3 turnos</span>
                <span>25 turnos</span>
                <span>50+ turnos</span>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                  Precio promedio por servicio o consulta
                </label>
                <span className="rounded-full bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 text-sm font-black text-emerald-600 dark:text-emerald-400 font-mono">
                  {formatGs(precioPromedio)}
                </span>
              </div>
              <input
                type="range"
                min={25000}
                max={350000}
                step={5000}
                value={precioPromedio}
                onChange={(e) => setPrecioPromedio(Number(e.target.value))}
                className="w-full h-2.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500 transition-all"
              />
              <div className="flex justify-between text-[11px] text-slate-400 mt-1 font-medium">
                <span>Gs. 25.000</span>
                <span>Gs. 180.000</span>
                <span>Gs. 350.000+</span>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                  Días de atención al mes
                </label>
                <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1 text-sm font-black text-slate-700 dark:text-slate-300">
                  {diasPorMes} días / mes
                </span>
              </div>
              <input
                type="range"
                min={16}
                max={30}
                step={1}
                value={diasPorMes}
                onChange={(e) => setDiasPorMes(Number(e.target.value))}
                className="w-full h-2.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500 transition-all"
              />
              <div className="flex justify-between text-[11px] text-slate-400 mt-1 font-medium">
                <span>16 días (medio tiempo)</span>
                <span>24 días (estándar L a S)</span>
                <span>30 días (todos los días)</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center gap-1.5 font-medium">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                Turnos totales estimados: <strong>{turnosMensuales} citas/mes</strong>
              </span>
              <span className="text-[11px] text-slate-400">
                Tasa estimada de ausentismo: 20%
              </span>
            </div>
          </div>

          {/* Columna Derecha: Tarjeta de Impacto Financiero y ROI (Col 5) */}
          <div className="lg:col-span-5 relative rounded-3xl p-6 sm:p-8 bg-gradient-to-b from-slate-900 via-slate-900 to-indigo-950 text-white shadow-2xl shadow-brand/20 border border-brand/30 flex flex-col justify-between overflow-hidden">
            {/* Resplandor interno */}
            <div className="pointer-events-none absolute -top-24 -right-24 h-56 w-56 rounded-full bg-emerald-500/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 -left-24 h-56 w-56 rounded-full bg-brand/30 blur-3xl" />

            <div className="relative z-10 space-y-6">
              {/* Tarjeta de Pérdida Actual */}
              <div className="rounded-2xl border border-red-500/30 bg-red-950/40 p-4 backdrop-blur-md">
                <div className="flex items-center gap-2 text-xs font-bold text-red-400 uppercase tracking-wider">
                  <AlertTriangle className="h-4 w-4" />
                  <span>Dinero que hoy se pierde en turnos vacíos</span>
                </div>
                <p className="mt-2 text-2xl sm:text-3xl font-black text-red-200 tracking-tight font-mono">
                  {formatGs(perdidaTotal)}
                  <span className="text-xs font-normal text-red-400 ml-1.5 font-sans">/ mes</span>
                </p>
                <p className="text-[11px] text-red-300/80 mt-1">
                  Equivale a aprox. <strong>{turnosPerdidos} turnos cancelados o no asistidos</strong> sin aviso.
                </p>
              </div>

              {/* Tarjeta de Recupero con AgendatePY */}
              <div className="rounded-2xl border border-emerald-500/40 bg-emerald-950/50 p-4.5 backdrop-blur-md shadow-lg shadow-emerald-950/50">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 uppercase tracking-wider">
                    <TrendingUp className="h-4 w-4 text-emerald-400" />
                    <span>Recuperás con AgendatePY</span>
                  </span>
                  <span className="rounded-full bg-emerald-500/20 border border-emerald-500/40 px-2 py-0.5 text-[10px] font-black text-emerald-300">
                    +80% Éxito
                  </span>
                </div>
                <p className="mt-2 text-3xl sm:text-4xl font-black text-emerald-300 tracking-tight font-mono">
                  {formatGs(dineroRecuperado)}
                  <span className="text-xs font-normal text-emerald-400/90 ml-1.5 font-sans">/ mes</span>
                </p>
                <p className="text-xs text-emerald-200/90 mt-1 flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  <span>
                    Salvas aprox. <strong>{turnosRecuperados} citas</strong> con confirmaciones automáticas.
                  </span>
                </p>
              </div>

              {/* Medidor de Payback */}
              <div className="rounded-xl bg-white/5 border border-white/10 p-3.5 text-xs text-slate-300 space-y-1">
                <div className="flex items-center justify-between font-semibold">
                  <span className="text-amber-300 flex items-center gap-1">
                    <Zap className="h-3.5 w-3.5 fill-amber-300" /> Retorno Inmediato:
                  </span>
                  <strong className="text-white">
                    El Plan Pro se paga solo en {diasParaPagarPlan} {diasParaPagarPlan === 1 ? "día" : "días"}
                  </strong>
                </div>
                <p className="text-[11px] text-slate-400 leading-tight">
                  Invertís Gs. 250.000/mes y recuperás {formatGs(dineroRecuperado)}. El software se autofinancia desde la primera semana.
                </p>
              </div>
            </div>

            {/* CTA Final de la calculadora */}
            <div className="relative z-10 mt-7 pt-4 border-t border-white/10">
              <Link
                href="/onboarding"
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 via-brand to-indigo-600 py-3.5 text-center text-sm font-extrabold text-white shadow-lg shadow-brand/40 hover:brightness-110 transition active:scale-98"
              >
                <Sparkles className="h-4 w-4 text-amber-300" />
                <span>Empezar a recuperar turnos hoy</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <p className="text-center text-[10px] text-slate-400 mt-2">
                14 días de prueba gratuita · Activación en 3 minutos sin tarjeta
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
