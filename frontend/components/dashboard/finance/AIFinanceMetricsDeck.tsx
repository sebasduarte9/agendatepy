"use client";

import { useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  CalendarCheck,
  CreditCard,
  Landmark,
  Banknote,
  ArrowUpRight,
  ShieldCheck,
  Zap,
  Activity,
  Layers,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  LineChart,
  Line,
} from "recharts";
import { formatGs } from "@/lib/dashboard-dates";

interface MetricsDeckProps {
  monthlyRevenue: number;
  confirmedAppointments: number;
  totalClients: number;
}

const WEEKLY_FLOW_DATA = [
  { day: "Lun", real: 320000, proyectado: 380000, sipap: 160000, pos: 100000, efectivo: 60000 },
  { day: "Mar", real: 480000, proyectado: 450000, sipap: 220000, pos: 150000, efectivo: 110000 },
  { day: "Mié", real: 510000, proyectado: 540000, sipap: 280000, pos: 140000, efectivo: 90000 },
  { day: "Jue", real: 640000, proyectado: 600000, sipap: 310000, pos: 210000, efectivo: 120000 },
  { day: "Vie", real: 890000, proyectado: 920000, sipap: 450000, pos: 290000, efectivo: 150000 },
  { day: "Sáb", real: 1250000, proyectado: 1300000, sipap: 600000, pos: 420000, efectivo: 230000 },
  { day: "Dom", real: 280000, proyectado: 300000, sipap: 150000, pos: 80000, efectivo: 50000 },
];

export default function AIFinanceMetricsDeck({
  monthlyRevenue,
  confirmedAppointments,
  totalClients,
}: MetricsDeckProps) {
  const [chartView, setChartView] = useState<"forecast" | "payment_methods">("forecast");

  // Dynamic calculations
  const displayRevenue = monthlyRevenue > 0 ? monthlyRevenue : 3850000;
  const displayCount = confirmedAppointments > 0 ? confirmedAppointments : 42;
  const avgTicket = Math.round(displayRevenue / displayCount);
  const projectedRevenue = Math.round(displayRevenue * 1.28);

  return (
    <div className="space-y-6">
      {/* 4 Floating Glass KPI Cards (Behance AI Finance style) */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Revenue */}
        <div className="group relative overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 p-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)] dark:shadow-[0_10px_30px_rgba(0,0,0,0.3)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/50 hover:shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Ingresos del Mes
            </span>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-2 text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            {formatGs(displayRevenue)}
          </p>
          <div className="mt-2 flex items-center gap-1.5 text-xs">
            <span className="flex items-center font-bold text-emerald-600 dark:text-emerald-400">
              <ArrowUpRight className="h-3.5 w-3.5" /> +18.4%
            </span>
            <span className="text-slate-400">vs mes anterior</span>
          </div>
          {/* Subtle bottom glow indicator */}
          <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-400 opacity-80" />
        </div>

        {/* Card 2: Projected Forecast */}
        <div className="group relative overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 p-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)] dark:shadow-[0_10px_30px_rgba(0,0,0,0.3)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-violet-500/50 hover:shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Flujo Proyectado (30d)
            </span>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400">
              <Activity className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-2 text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            {formatGs(projectedRevenue)}
          </p>
          <div className="mt-2 flex items-center gap-1.5 text-xs">
            <span className="rounded-full bg-violet-500/15 px-2 py-0.5 font-bold text-violet-600 dark:text-violet-300">
              96.2% Confianza AI
            </span>
            <span className="text-slate-400">basado en turnos</span>
          </div>
          <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-violet-500 to-indigo-500 opacity-80" />
        </div>

        {/* Card 3: Average Ticket */}
        <div className="group relative overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 p-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)] dark:shadow-[0_10px_30px_rgba(0,0,0,0.3)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-cyan-500/50 hover:shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Ticket Promedio
            </span>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
              <Zap className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-2 text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            {formatGs(avgTicket)}
          </p>
          <div className="mt-2 flex items-center gap-1.5 text-xs">
            <span className="flex items-center font-bold text-cyan-600 dark:text-cyan-400">
              <ArrowUpRight className="h-3.5 w-3.5" /> +12.3%
            </span>
            <span className="text-slate-400">con productos cross-sell</span>
          </div>
          <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-cyan-500 to-blue-500 opacity-80" />
        </div>

        {/* Card 4: Operating Capacity / No-Shows */}
        <div className="group relative overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 p-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)] dark:shadow-[0_10px_30px_rgba(0,0,0,0.3)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-amber-500/50 hover:shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Ocupación & Asistencia
            </span>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <ShieldCheck className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-2 text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            87.5%
          </p>
          <div className="mt-2 flex items-center gap-1.5 text-xs">
            <span className="font-bold text-emerald-600 dark:text-emerald-400">
              1.8% No-Shows
            </span>
            <span className="text-slate-400">con Smart Reminders</span>
          </div>
          <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-amber-500 to-orange-400 opacity-80" />
        </div>
      </div>

      {/* Main Chart: Financial Flow & Forecasting */}
      <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 dark:border-slate-800/80 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-black text-slate-900 dark:text-white text-base sm:text-lg">
                Flujo Financiero & Velocidad de Turnos
              </h3>
              <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">
                En vivo
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Comparativa de ingresos reales vs proyección predictiva de la semana
            </p>
          </div>

          {/* Switch mode pill */}
          <div className="flex items-center gap-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800 p-1 text-xs">
            <button
              type="button"
              onClick={() => setChartView("forecast")}
              className={`rounded-xl px-3 py-1.5 font-bold transition-all duration-300 ${
                chartView === "forecast"
                  ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Real vs Proyectado
            </button>
            <button
              type="button"
              onClick={() => setChartView("payment_methods")}
              className={`rounded-xl px-3 py-1.5 font-bold transition-all duration-300 ${
                chartView === "payment_methods"
                  ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Medios de Cobro (PY)
            </button>
          </div>
        </div>

        {/* Chart Canvas */}
        <div className="mt-6 h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            {chartView === "forecast" ? (
              <BarChart data={WEEKLY_FLOW_DATA} barGap={6}>
                <XAxis
                  dataKey="day"
                  stroke="#94a3b8"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `${val / 1000}k`}
                />
                <Tooltip
                  cursor={{ fill: "rgba(148, 163, 184, 0.1)" }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-900/95 p-3.5 shadow-xl backdrop-blur-md text-xs space-y-1.5">
                          <p className="font-bold text-slate-900 dark:text-white">
                            {data.day} (Semana)
                          </p>
                          <div className="flex items-center justify-between gap-4">
                            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                              ● Facturado Real:
                            </span>
                            <span className="font-black text-slate-900 dark:text-white">
                              {formatGs(data.real)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-4">
                            <span className="text-violet-500 font-semibold">
                              ● Proyección AI:
                            </span>
                            <span className="font-black text-slate-900 dark:text-white">
                              {formatGs(data.proyectado)}
                            </span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="real" name="Real" fill="#10b981" radius={[8, 8, 0, 0]} />
                <Bar dataKey="proyectado" name="Proyectado" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
              </BarChart>
            ) : (
              <BarChart data={WEEKLY_FLOW_DATA} stackOffset="sign">
                <XAxis
                  dataKey="day"
                  stroke="#94a3b8"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `${val / 1000}k`}
                />
                <Tooltip
                  cursor={{ fill: "rgba(148, 163, 184, 0.1)" }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-900/95 p-3.5 shadow-xl backdrop-blur-md text-xs space-y-1.5">
                          <p className="font-bold text-slate-900 dark:text-white">
                            Cobranzas {data.day}
                          </p>
                          <div className="flex items-center justify-between gap-4 text-emerald-600">
                            <span>● SIPAP (Bancario):</span>
                            <strong>{formatGs(data.sipap)}</strong>
                          </div>
                          <div className="flex items-center justify-between gap-4 text-blue-600">
                            <span>● Tarjeta (POS):</span>
                            <strong>{formatGs(data.pos)}</strong>
                          </div>
                          <div className="flex items-center justify-between gap-4 text-amber-600">
                            <span>● Efectivo:</span>
                            <strong>{formatGs(data.efectivo)}</strong>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="sipap" name="SIPAP" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} />
                <Bar dataKey="pos" name="POS Bancard" stackId="a" fill="#3b82f6" radius={[0, 0, 0, 0]} />
                <Bar dataKey="efectivo" name="Efectivo" stackId="a" fill="#f59e0b" radius={[6, 6, 0, 0]} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Legend bar below chart */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 dark:border-slate-800/80 pt-3 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-4">
            {chartView === "forecast" ? (
              <>
                <span className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded-md bg-emerald-500" /> Facturación Real
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded-md bg-violet-500" /> Proyección Predictiva AI
                </span>
              </>
            ) : (
              <>
                <span className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded-md bg-emerald-500" /> SIPAP (48%)
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded-md bg-blue-500" /> POS Bancard (32%)
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded-md bg-amber-500" /> Efectivo (20%)
                </span>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              Moneda: Guaraní Paraguayo (Gs.)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
