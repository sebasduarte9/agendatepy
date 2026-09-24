"use client";

import { useMemo, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";
import {
  CalendarDays,
  Wallet,
  UserRound,
  Ban,
  TrendingUp,
  Percent,
  CheckCircle2,
  Clock,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import { useDashboardStore } from "@/store/useDashboardStore";
import StatCard from "@/components/dashboard/ui/StatCard";
import Card from "@/components/dashboard/ui/Card";
import { formatGs } from "@/lib/dashboard-dates";
import Link from "next/link";

const FILTERS = ["Hoy", "Esta Semana", "Este Mes", "Últimos 90 Días"] as const;

export default function EstadisticasPage() {
  const { appointments, services, business } = useDashboardStore();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("Esta Semana");

  const confirmed = appointments.filter((a) => a.status === "confirmed");
  const cancelled = appointments.filter((a) => a.status === "cancelled");
  const total = appointments.length || 1;
  const attendanceRate = Math.round((confirmed.length / total) * 100);

  const revenue = confirmed.reduce(
    (sum, item) => sum + (services.find((s) => s.id === item.serviceId)?.price ?? 0),
    0,
  );
  const uniqueClients = new Set(appointments.map((a) => a.clientEmail)).size;

  const areaData = useMemo(() => [
    { name: "Lun", ingresos: 480000, turnos: 6 },
    { name: "Mar", ingresos: 620000, turnos: 8 },
    { name: "Mié", ingresos: 390000, turnos: 5 },
    { name: "Jue", ingresos: 750000, turnos: 10 },
    { name: "Vie", ingresos: 1100000, turnos: 14 },
    { name: "Sáb", ingresos: 1450000, turnos: 18 },
    { name: "Dom", ingresos: 320000, turnos: 4 },
  ], []);

  const paymentData = [
    { name: "Transferencia SIPAP", value: 45, color: "#10b981" },
    { name: "POS Bancard (Tarjetas)", value: 30, color: "#6366f1" },
    { name: "Efectivo", value: 18, color: "#f59e0b" },
    { name: "Billeteras Móviles", value: 7, color: "#ec4899" },
  ];

  const hourlyDistribution = [
    { hour: "08:00", citas: 2 },
    { hour: "10:00", citas: 5 },
    { hour: "12:00", citas: 4 },
    { hour: "14:00", citas: 7 },
    { hour: "16:00", citas: 9 },
    { hour: "18:00", citas: 11 },
    { hour: "20:00", citas: 3 },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            Métricas & Analítica del Negocio
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 sm:text-sm">
            Evolución de facturación en Gs., tasa de asistencia, métodos de cobro y horarios pico.
          </p>
        </div>

        <div className="flex items-center gap-1 rounded-2xl border border-slate-200/80 dark:border-white/10 p-1 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-xs">
          {FILTERS.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setFilter(item)}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                filter === item
                  ? "bg-primary text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Facturación Confirmada"
          value={formatGs(revenue)}
          icon={Wallet}
          delta={18}
        />
        <StatCard
          label="Tasa de Asistencia (Show-up)"
          value={`${attendanceRate}%`}
          icon={CheckCircle2}
          delta={6}
        />
        <StatCard
          label="Clientes Únicos Atendidos"
          value={`${uniqueClients} personas`}
          icon={UserRound}
          delta={12}
        />
        <StatCard
          label="Turnos Cancelados"
          value={`${cancelled.length} cancelados`}
          icon={Ban}
          delta={cancelled.length > 0 ? -cancelled.length : 0}
        />
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Revenue Velocity Area Chart */}
        <Card>
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-3 mb-4">
            <div>
              <h2 className="font-bold text-slate-900 dark:text-white text-base">
                Evolución de Ingresos Semanales
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Cobros brutos acumulados día por día en Guaraníes.
              </p>
            </div>
            <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
              +24% vs semana previa
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={areaData}>
                <defs>
                  <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis hide />
                <Tooltip
                  formatter={(val: unknown) => [formatGs(Number(val) || 0), "Facturado"]}
                  contentStyle={{
                    backgroundColor: "rgba(15, 23, 42, 0.9)",
                    borderRadius: "16px",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "#fff",
                    fontSize: "12px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="ingresos"
                  stroke="#6366f1"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorIngresos)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Payment Methods Distribution */}
        <Card>
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-3 mb-4">
            <div>
              <h2 className="font-bold text-slate-900 dark:text-white text-base">
                Métodos de Pago Utilizados
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Preferencia de cobro de los clientes del salón.
              </p>
            </div>
            <span className="text-xs font-bold text-primary">SIPAP lidera (45%)</span>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="h-56 w-56 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={paymentData}
                    dataKey="value"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                  >
                    {paymentData.map((item) => (
                      <Cell key={item.name} fill={item.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: unknown) => [`${val}%`, "Participación"]}
                    contentStyle={{
                      backgroundColor: "rgba(15, 23, 42, 0.9)",
                      borderRadius: "16px",
                      border: "1px solid rgba(255,255,255,0.1)",
                      color: "#fff",
                      fontSize: "12px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="flex-1 space-y-2 text-xs w-full">
              {paymentData.map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: item.color }} />
                    <span className="text-slate-700 dark:text-slate-300 font-medium">
                      {item.name}
                    </span>
                  </div>
                  <strong className="text-slate-900 dark:text-white font-bold">
                    {item.value}%
                  </strong>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Peak Hours Distribution */}
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-3 mb-4">
            <div>
              <h2 className="font-bold text-slate-900 dark:text-white text-base">
                Densidad de Reservas por Franja Horaria
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Horas de mayor afluencia para optimizar la dotación del equipo.
              </p>
            </div>
            <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-bold text-primary">
              Pico principal: 18:00 a 19:30 hs
            </span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourlyDistribution}>
                <XAxis dataKey="hour" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis allowDecimals={false} stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip
                  formatter={(val: unknown) => [`${val} turnos`, "Volumen"]}
                  contentStyle={{
                    backgroundColor: "rgba(15, 23, 42, 0.9)",
                    borderRadius: "16px",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "#fff",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="citas" fill="#6366f1" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Advanced Retention & Customer Intelligence Section */}
      <Card className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 dark:text-white text-base">
                Retención de Clientes & Recompra
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Análisis de fidelidad y motivos frecuentes de cancelación.
              </p>
            </div>
          </div>

          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="h-3.5 w-3.5" /> Plan Pro Activo
          </span>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-slate-50/70 dark:bg-slate-800/40 p-4">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Tasa de Retención
            </span>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              78.4%
            </p>
            <p className="text-xs text-emerald-500 font-semibold mt-1">
              ↑ +4.2% respecto al mes anterior
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-slate-50/70 dark:bg-slate-800/40 p-4">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Ciclo Promedio de Retorno
            </span>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              18 días
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Frecuencia típica para corte & barba
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-slate-50/70 dark:bg-slate-800/40 p-4">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Valor de Vida (LTV)
            </span>
            <p className="text-2xl font-black text-primary mt-1">
              Gs. 480.000
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Gasto medio estimado por cliente recurrente
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
