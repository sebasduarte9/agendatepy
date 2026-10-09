"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from "recharts";
import {
  CalendarDays,
  Wallet,
  Users,
  CheckCircle2,
  Clock,
  XCircle,
  Banknote,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  QrCode,
  RefreshCw,
  Repeat,
  HeartHandshake,
  BarChart3,
  type LucideIcon,
} from "lucide-react";
import { useDashboardStore } from "@/store/useDashboardStore";
import IosSegmentedControl from "@/components/dashboard/ui/IosSegmentedControl";
import AnimatedValue from "@/components/dashboard/ui/AnimatedValue";
import { triggerHaptic } from "@/lib/haptics";
import { formatGs } from "@/lib/dashboard-dates";

type Range = "hoy" | "semana" | "mes" | "90";

const RANGE_LABELS: Record<Range, string> = {
  hoy: "Hoy",
  semana: "Últimos 7 días",
  mes: "Últimos 30 días",
  "90": "Últimos 90 días",
};

type Stats = {
  totalRevenue: number;
  revenueDelta: number | null;
  totalAppointments: number;
  appointmentsDelta: number | null;
  confirmedAppointments: number;
  cancelledAppointments: number;
  noShowAppointments: number;
  attendanceRate: number | null;
  avgTicket: number;
  totalClients: number;
  retentionRate: number | null;
  returnCycleDays: number | null;
  lifetimeValue: number;
  areaData: { name: string; ingresos: number; turnos: number }[];
  paymentMethodsData: { name: string; value: number }[];
  hourlyDistribution: { hour: string; citas: number }[];
};

const PAYMENT_COLORS = ["#10b981", "#6366f1", "#f59e0b", "#ec4899", "#0ea5e9"];

function paymentIcon(name: string): LucideIcon {
  const lower = name.toLowerCase();
  if (lower.includes("efectivo")) return Banknote;
  if (lower.includes("pos") || lower.includes("tarjeta") || lower.includes("bancard")) return CreditCard;
  if (lower.includes("sipap") || lower.includes("transfer")) return ArrowUpRight;
  if (lower.includes("qr")) return QrCode;
  return Wallet;
}

const tooltipStyle = {
  backgroundColor: "rgba(255,255,255,0.97)",
  borderRadius: "14px",
  border: "1px solid rgba(15,23,42,0.08)",
  boxShadow: "0 10px 30px -10px rgba(15,23,42,0.25)",
  color: "#0f172a",
  fontSize: "12px",
};

function DeltaPill({ value }: { value: number | null }) {
  if (value === null) return <span className="text-[11px] text-slate-400">Sin período anterior</span>;
  const up = value >= 0;
  const Icon = up ? ArrowUpRight : ArrowDownRight;
  return (
    <span
      className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[11px] font-bold ${
        up ? "bg-emerald-500/10 text-emerald-600" : "bg-rose-500/10 text-rose-600"
      }`}
    >
      <Icon className="h-3 w-3" />
      {up ? "+" : ""}
      {value}% vs período anterior
    </span>
  );
}

function EmptyChart({ text }: { text: string }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
      <BarChart3 className="h-8 w-8 text-slate-300" />
      <p className="max-w-[220px] text-xs text-slate-400">{text}</p>
    </div>
  );
}

export default function EstadisticasPage() {
  const { business } = useDashboardStore();
  const brandColor = business.primaryColor || "#FF4F2B";

  const [range, setRange] = useState<Range>("semana");
  const [chartMetric, setChartMetric] = useState<"ingresos" | "turnos">("ingresos");
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStats = useCallback((r: Range) => {
    setLoading(true);
    setError(null);
    fetch(`/api/dashboard/stats?range=${r}`)
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(
            res.status === 403
              ? "Las estadísticas están disponibles solo para el dueño del negocio."
              : "No pudimos calcular las estadísticas en este momento."
          );
        }
        const data = await res.json();
        if (!data.ok || !data.stats) throw new Error(data.message || "Error al calcular estadísticas.");
        setStats(data.stats);
      })
      .catch((err: Error) => setError(err.message || "Error de conexión."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadStats(range);
  }, [range, loadStats]);

  const areaData = stats?.areaData ?? [];
  const hasTrend = areaData.some((d) => d.turnos > 0);
  const hourly = stats?.hourlyDistribution ?? [];

  const peakDay = useMemo(() => {
    if (!hasTrend) return null;
    return [...areaData].sort((a, b) => (chartMetric === "ingresos" ? b.ingresos - a.ingresos : b.turnos - a.turnos))[0]?.name;
  }, [areaData, chartMetric, hasTrend]);

  const peakHour = useMemo(() => {
    if (hourly.length === 0) return null;
    return [...hourly].sort((a, b) => b.citas - a.citas)[0]?.hour;
  }, [hourly]);

  const payments = useMemo(() => {
    const list = stats?.paymentMethodsData ?? [];
    const total = list.reduce((acc, cur) => acc + cur.value, 0) || 1;
    return list.map((item, idx) => ({
      ...item,
      percentage: Math.round((item.value / total) * 100),
      color: PAYMENT_COLORS[idx % PAYMENT_COLORS.length],
      icon: paymentIcon(item.name),
    }));
  }, [stats]);

  const pods = stats
    ? [
        { label: "Turnos", value: String(stats.totalAppointments), icon: CalendarDays, color: "#6366f1" },
        { label: "Atendidos", value: String(stats.confirmedAppointments), icon: CheckCircle2, color: "#10b981" },
        { label: "Cancelados", value: String(stats.cancelledAppointments + stats.noShowAppointments), icon: XCircle, color: "#f43f5e" },
        { label: "Clientes", value: String(stats.totalClients), icon: Users, color: "#a855f7" },
      ]
    : [];

  return (
    <div className="mx-auto max-w-5xl space-y-4 sm:space-y-6 pb-24 px-1 sm:px-0">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between py-1">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">Estadísticas</h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">{RANGE_LABELS[range]}</p>
        </div>

        <div className="flex items-center gap-2">
          <IosSegmentedControl
            value={range}
            onChange={(val) => {
              triggerHaptic("selection");
              setRange(val as Range);
            }}
            layoutId="statsPeriodFilter"
            size="sm"
            options={[
              { value: "hoy", label: "Hoy" },
              { value: "semana", label: "7 días" },
              { value: "mes", label: "30 días" },
              { value: "90", label: "90 días" },
            ]}
          />
          <button
            type="button"
            onClick={() => {
              triggerHaptic("medium");
              loadStats(range);
            }}
            disabled={loading}
            aria-label="Actualizar estadísticas"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#121215] text-slate-600 dark:text-zinc-300 shadow-xs hover:bg-slate-50 active:scale-95 transition disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-primary" : ""}`} />
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3.5 flex items-center justify-between gap-3">
          <p className="text-xs font-bold text-rose-900">{error}</p>
          <button
            type="button"
            onClick={() => loadStats(range)}
            className="shrink-0 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold px-3 py-1.5 text-xs transition cursor-pointer"
          >
            Reintentar
          </button>
        </div>
      )}

      {loading && !stats ? (
        <div className="space-y-4 animate-pulse" aria-busy="true">
          <div className="h-44 rounded-3xl bg-slate-200/60 dark:bg-white/5" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24 rounded-2xl bg-slate-200/60 dark:bg-white/5" />
            ))}
          </div>
          <div className="h-72 rounded-3xl bg-slate-200/60 dark:bg-white/5" />
        </div>
      ) : stats ? (
        <div className={`space-y-4 sm:space-y-6 transition-opacity duration-300 ${loading ? "opacity-60" : "opacity-100"}`}>
          {/* Revenue hero */}
          <div className="kpi-rise rounded-3xl bg-white dark:bg-[#121215] border border-slate-200/80 dark:border-white/10 p-5 sm:p-6 shadow-xs">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">Facturación</span>
                <div className="mt-1 text-3xl sm:text-4xl font-black font-mono tracking-tight text-slate-900 dark:text-white">
                  <AnimatedValue value={formatGs(stats.totalRevenue)} />
                </div>
                <div className="mt-2">
                  <DeltaPill value={stats.revenueDelta} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:w-72">
                <div className="rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/5 p-3">
                  <span className="block text-[10px] font-semibold uppercase text-slate-400">Ticket promedio</span>
                  <span className="text-base font-black font-mono text-slate-900 dark:text-white">
                    <AnimatedValue value={formatGs(stats.avgTicket)} />
                  </span>
                </div>
                <div className="rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/5 p-3">
                  <span className="block text-[10px] font-semibold uppercase text-slate-400">Asistencia</span>
                  <span className="text-base font-black font-mono text-slate-900 dark:text-white">
                    {stats.attendanceRate === null ? "—" : <AnimatedValue value={`${stats.attendanceRate}%`} />}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Pods */}
          <div className="kpi-stagger grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3">
            {pods.map((p) => {
              const Icon = p.icon;
              return (
                <div
                  key={p.label}
                  className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#121215] p-4 shadow-xs transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-slate-500">{p.label}</span>
                    <span
                      className="flex h-7 w-7 items-center justify-center rounded-lg"
                      style={{ backgroundColor: `${p.color}1a`, color: p.color }}
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </span>
                  </div>
                  <span className="mt-2 block text-2xl font-black font-mono text-slate-900 dark:text-white">
                    <AnimatedValue value={p.value} />
                  </span>
                </div>
              );
            })}
          </div>

          {/* Trend */}
          <div className="kpi-rise rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#121215] p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-bold text-slate-900 dark:text-white text-base">
                  {range === "hoy" ? "Durante el día" : "Por día de la semana"}
                </h2>
                {peakDay && (
                  <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-bold text-primary">
                    Mejor: {peakDay}
                  </span>
                )}
                <DeltaPill value={stats.appointmentsDelta} />
              </div>
              <IosSegmentedControl
                value={chartMetric}
                onChange={(val) => {
                  triggerHaptic("selection");
                  setChartMetric(val as "ingresos" | "turnos");
                }}
                layoutId="chartMetricToggle"
                size="sm"
                options={[
                  { value: "ingresos", label: "Facturación" },
                  { value: "turnos", label: "Turnos" },
                ]}
              />
            </div>

            <div className="h-64 w-full">
              {!hasTrend ? (
                <EmptyChart text="Todavía no hay turnos atendidos en este período. Probá con un rango más largo." />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  {chartMetric === "ingresos" ? (
                    <AreaChart data={areaData} margin={{ top: 10, right: 10, left: -16, bottom: 0 }}>
                      <defs>
                        <linearGradient id="statsGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={brandColor} stopOpacity={0.35} />
                          <stop offset="95%" stopColor={brandColor} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                      <YAxis
                        stroke="#94a3b8"
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                      />
                      <Tooltip formatter={(val: unknown) => [formatGs(Number(val) || 0), "Facturación"]} contentStyle={tooltipStyle} />
                      <Area
                        type="monotone"
                        dataKey="ingresos"
                        stroke={brandColor}
                        strokeWidth={3}
                        fill="url(#statsGradient)"
                        animationDuration={900}
                      />
                    </AreaChart>
                  ) : (
                    <BarChart data={areaData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                      <YAxis allowDecimals={false} stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                      <Tooltip formatter={(val: unknown) => [`${val} turnos`, "Turnos"]} contentStyle={tooltipStyle} cursor={{ fill: "rgba(148,163,184,0.12)" }} />
                      <Bar dataKey="turnos" radius={[8, 8, 0, 0]} animationDuration={700}>
                        {areaData.map((d) => (
                          <Cell key={d.name} fill={d.name === peakDay ? brandColor : `${brandColor}66`} />
                        ))}
                      </Bar>
                    </BarChart>
                  )}
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {/* Payments */}
            <div className="kpi-rise rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#121215] p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/10 pb-3">
                <h2 className="font-bold text-slate-900 dark:text-white text-sm">Cómo te pagan</h2>
                <span className="text-[11px] font-semibold text-slate-400">Según la caja</span>
              </div>
              {payments.length === 0 ? (
                <div className="h-40">
                  <EmptyChart text="Cuando registres cobros en la caja vas a ver acá el reparto por método de pago." />
                </div>
              ) : (
                <>
                  <div className="flex h-3 w-full overflow-hidden rounded-full bg-slate-100">
                    {payments.map((p) => (
                      <div
                        key={p.name}
                        className="h-full transition-all duration-700"
                        style={{ width: `${p.percentage}%`, backgroundColor: p.color }}
                        title={`${p.name}: ${p.percentage}%`}
                      />
                    ))}
                  </div>
                  <div className="divide-y divide-slate-100 dark:divide-white/5">
                    {payments.map((p) => {
                      const Icon = p.icon;
                      return (
                        <div key={p.name} className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0">
                          <div className="flex items-center gap-2.5">
                            <span
                              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl"
                              style={{ backgroundColor: `${p.color}18`, color: p.color }}
                            >
                              <Icon className="h-4 w-4" />
                            </span>
                            <span className="text-xs font-bold text-slate-900 dark:text-white">{p.name}</span>
                          </div>
                          <div className="text-right">
                            <div className="text-xs font-mono font-bold text-slate-900 dark:text-white">
                              <AnimatedValue value={formatGs(p.value)} />
                            </div>
                            <div className="text-[10px] font-mono text-slate-400">{p.percentage}%</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

            {/* Hours */}
            <div className="kpi-rise rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#121215] p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/10 pb-3">
                <h2 className="font-bold text-slate-900 dark:text-white text-sm">Horas más pedidas</h2>
                {peakHour && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-bold text-primary">
                    <Clock className="h-3 w-3" /> {peakHour} hs
                  </span>
                )}
              </div>
              <div className="h-48 w-full">
                {hourly.length === 0 ? (
                  <EmptyChart text="Sin turnos en este período." />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={hourly} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                      <XAxis dataKey="hour" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                      <YAxis allowDecimals={false} stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                      <Tooltip formatter={(val: unknown) => [`${val} turnos`, "Turnos"]} contentStyle={tooltipStyle} cursor={{ fill: "rgba(148,163,184,0.12)" }} />
                      <Bar dataKey="citas" radius={[6, 6, 0, 0]} animationDuration={700}>
                        {hourly.map((h) => (
                          <Cell key={h.hour} fill={h.hour === peakHour ? brandColor : `${brandColor}66`} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
              {peakHour && (
                <p className="rounded-2xl bg-slate-50 dark:bg-white/[0.03] p-3 text-xs text-slate-600 dark:text-zinc-400">
                  Tu horario más fuerte es a las <strong className="text-slate-900 dark:text-white">{peakHour} hs</strong>. Asegurate de tener equipo disponible a esa hora.
                </p>
              )}
            </div>
          </div>

          {/* Loyalty */}
          <div className="kpi-stagger grid gap-3 sm:grid-cols-3">
            {[
              {
                label: "Clientes que vuelven",
                value: stats.retentionRate === null ? null : `${stats.retentionRate}%`,
                hint: "De los clientes de este período, cuántos ya habían venido antes",
                icon: Repeat,
              },
              {
                label: "Vuelven cada",
                value: stats.returnCycleDays === null ? null : `${stats.returnCycleDays} días`,
                hint: "Promedio entre una visita y la siguiente",
                icon: Clock,
              },
              {
                label: "Gasto por cliente",
                value: stats.lifetimeValue > 0 ? formatGs(stats.lifetimeValue) : null,
                hint: "Lo que dejó cada cliente en total desde que empezaste",
                icon: HeartHandshake,
              },
            ].map((m) => {
              const Icon = m.icon;
              return (
                <div key={m.label} className="rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#121215] p-5 shadow-xs">
                  <div className="flex items-center gap-2 text-slate-500">
                    <Icon className="h-4 w-4 text-primary" />
                    <span className="text-[11px] font-bold uppercase tracking-wider">{m.label}</span>
                  </div>
                  <p className="mt-2 text-2xl font-black font-mono text-slate-900 dark:text-white">
                    {m.value ? <AnimatedValue value={m.value} /> : <span className="text-slate-300">—</span>}
                  </p>
                  <p className="mt-1 text-[11px] text-slate-400">{m.value ? m.hint : "Todavía no hay suficientes visitas"}</p>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
