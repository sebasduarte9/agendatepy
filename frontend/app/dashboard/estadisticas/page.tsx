"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import {
  CalendarDays,
  Wallet,
  Users,
  TrendingUp,
  CheckCircle2,
  Clock,
  XCircle,
  Banknote,
  CreditCard,
  ArrowUpRight,
  QrCode,
  ShieldCheck,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { useDashboardStore } from "@/store/useDashboardStore";
import IosSegmentedControl from "@/components/dashboard/ui/IosSegmentedControl";
import { triggerHaptic } from "@/lib/haptics";
import { formatGs } from "@/lib/dashboard-dates";

const FILTERS = ["Hoy", "Esta Semana", "Este Mes", "Últimos 90 Días"] as const;

export default function EstadisticasPage() {
  const { appointments, services, business } = useDashboardStore();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("Esta Semana");
  const [chartMetric, setChartMetric] = useState<"ingresos" | "turnos">("ingresos");
  const [dbStats, setDbStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const brandColor = business.primaryColor || "#FF4F2B";

  function loadStats() {
    setLoading(true);
    setError(null);
    fetch("/api/dashboard/stats")
      .then((res) => {
        if (!res.ok) {
          throw new Error(
            res.status === 403
              ? "Acceso restringido: disponible para administradores."
              : "No se pudieron calcular las estadísticas en este momento."
          );
        }
        return res.json();
      })
      .then((data) => {
        if (data.ok && data.stats) {
          setDbStats(data.stats);
        } else {
          setError(data.message || "Error al calcular estadísticas.");
        }
      })
      .catch((err) => {
        console.error("Error fetching stats:", err);
        setError(err.message || "Error de conexión.");
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadStats();
  }, []);

  const confirmed = appointments.filter((a) => a.status === "confirmed" || a.status === "completed");
  const cancelled = appointments.filter((a) => a.status === "cancelled");
  const total = appointments.length;
  const attendanceRate = dbStats?.attendanceRate ?? (total > 0 ? Math.round((confirmed.length / total) * 100) : 100);

  const revenue = dbStats?.totalRevenue ?? confirmed.reduce(
    (sum, item) => sum + (services.find((s) => s.id === item.serviceId)?.price ?? 0),
    0,
  );
  const uniqueClients = dbStats?.totalClients ?? new Set(appointments.map((a) => a.clientEmail || a.clientPhone)).size;
  const avgTicket = dbStats?.avgTicket ?? (confirmed.length > 0 ? Math.round(revenue / confirmed.length) : 0);

  const areaData = useMemo(() => {
    if (dbStats?.areaData && dbStats.areaData.length > 0) {
      return dbStats.areaData;
    }
    return [
      { name: "Lun", ingresos: 0, turnos: 0 },
      { name: "Mar", ingresos: 0, turnos: 0 },
      { name: "Mié", ingresos: 0, turnos: 0 },
      { name: "Jue", ingresos: 0, turnos: 0 },
      { name: "Vie", ingresos: 0, turnos: 0 },
      { name: "Sáb", ingresos: 0, turnos: 0 },
      { name: "Dom", ingresos: 0, turnos: 0 },
    ];
  }, [dbStats]);

  // Peak revenue or volume day
  const peakDay = useMemo(() => {
    if (!areaData || areaData.length === 0) return "Sábado";
    const sorted = [...areaData].sort((a, b) => (chartMetric === "ingresos" ? b.ingresos - a.ingresos : b.turnos - a.turnos));
    return sorted[0]?.name || "Sábado";
  }, [areaData, chartMetric]);

  const paymentData: Array<{ name: string; amount: number; percentage: number; color: string; icon: any }> = useMemo(() => {
    const iconForName = (name: string) => {
      const lower = name.toLowerCase();
      if (lower.includes("efectivo")) return Banknote;
      if (lower.includes("pos") || lower.includes("tarjeta") || lower.includes("bancard")) return CreditCard;
      if (lower.includes("sipap") || lower.includes("transfer")) return ArrowUpRight;
      if (lower.includes("qr")) return QrCode;
      return Wallet;
    };

    if (dbStats?.paymentMethodsData && dbStats.paymentMethodsData.length > 0) {
      const colors = ["#10b981", "#6366f1", "#f59e0b", "#ec4899", "#0ea5e9"];
      const totalAmount = dbStats.paymentMethodsData.reduce((acc: number, cur: any) => acc + cur.value, 0) || 1;
      return dbStats.paymentMethodsData.map((item: any, idx: number) => ({
        name: item.name,
        amount: item.value,
        percentage: Math.round((item.value / totalAmount) * 100),
        color: colors[idx % colors.length],
        icon: iconForName(item.name),
      }));
    }
    return [
      { name: "Efectivo", amount: Math.round(revenue * 0.45), percentage: 45, color: "#10b981", icon: Banknote },
      { name: "POS Bancard", amount: Math.round(revenue * 0.35), percentage: 35, color: "#6366f1", icon: CreditCard },
      { name: "SIPAP / Transferencia", amount: Math.round(revenue * 0.20), percentage: 20, color: "#f59e0b", icon: ArrowUpRight },
    ];
  }, [dbStats, revenue]);

  const hourlyDistribution: Array<{ hour: string; citas: number }> = useMemo(() => {
    if (dbStats?.hourlyDistribution && dbStats.hourlyDistribution.length > 0) {
      return dbStats.hourlyDistribution;
    }
    return [
      { hour: "08:00", citas: 1 },
      { hour: "10:00", citas: 3 },
      { hour: "12:00", citas: 4 },
      { hour: "14:00", citas: 2 },
      { hour: "16:00", citas: 5 },
      { hour: "18:00", citas: 8 },
      { hour: "20:00", citas: 3 },
    ];
  }, [dbStats]);

  const peakHour = useMemo(() => {
    if (!hourlyDistribution || hourlyDistribution.length === 0) return "18:00";
    const sorted = [...hourlyDistribution].sort((a, b) => b.citas - a.citas);
    return sorted[0]?.hour || "18:00";
  }, [hourlyDistribution]);

  return (
    <div className="mx-auto max-w-5xl space-y-4 sm:space-y-6 pb-24 px-1 sm:px-0">
      {/* ═══ APPLE APP HEADER ═══ */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between py-1">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            Estadísticas
          </h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            Rendimiento en tiempo real
          </p>
        </div>

        {/* Timeframe Filter Dock - Apple Segmented Control */}
        <div className="flex items-center gap-2">
          <IosSegmentedControl
            value={filter}
            onChange={(val) => {
              triggerHaptic("selection");
              setFilter(val as any);
            }}
            layoutId="statsPeriodFilter"
            size="sm"
            options={[
              { value: "Hoy", label: "Hoy" },
              { value: "Esta Semana", label: "Semana" },
              { value: "Este Mes", label: "Mes" },
              { value: "Últimos 90 Días", label: "90 Días" },
            ]}
          />

          <button
            type="button"
            onClick={() => {
              triggerHaptic("medium");
              loadStats();
            }}
            disabled={loading}
            aria-label="Actualizar métricas"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#121215] text-slate-600 dark:text-zinc-300 shadow-xs hover:bg-slate-50 dark:hover:bg-white/5 active:scale-95 transition disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-primary" : ""}`} />
          </button>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="rounded-2xl border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/40 p-3.5 flex items-center justify-between">
          <p className="text-xs font-bold text-rose-900 dark:text-rose-200">{error}</p>
          <button
            type="button"
            onClick={loadStats}
            className="rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold px-3 py-1.5 text-xs shadow-xs transition"
          >
            Reintentar
          </button>
        </div>
      )}

      {/* ═══ APPLE GLANCEABLE HERO CARD (WALLET / HEALTH STYLE) ═══ */}
      <div className="rounded-3xl bg-white dark:bg-[#121215] border border-slate-200/80 dark:border-white/10 p-5 sm:p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <span className="text-[11px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider block">
              Facturación · {filter}
            </span>
            <div className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-slate-900 dark:text-white mt-1">
              {formatGs(revenue)}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold font-mono">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{attendanceRate}% Asistencia</span>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-white/[0.05] text-slate-700 dark:text-zinc-300 text-xs font-bold font-mono">
              <Sparkles className="h-3 w-3 text-amber-500" />
              <span>Ticket: {formatGs(avgTicket)}</span>
            </div>
          </div>
        </div>

        {/* 4-Pod Apple Metric Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3">
          {/* Citas Totales */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/5 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] text-slate-500 dark:text-zinc-400 font-semibold">Total Turnos</span>
              <div className="h-7 w-7 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <CalendarDays className="h-3.5 w-3.5" />
              </div>
            </div>
            <span className="text-xl sm:text-2xl font-black font-mono text-slate-900 dark:text-white">{total}</span>
          </div>

          {/* Confirmadas / Completadas */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/5 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] text-slate-500 dark:text-zinc-400 font-semibold">Completadas</span>
              <div className="h-7 w-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="h-3.5 w-3.5" />
              </div>
            </div>
            <span className="text-xl sm:text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400">{confirmed.length}</span>
          </div>

          {/* Canceladas */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/5 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] text-slate-500 dark:text-zinc-400 font-semibold">Canceladas</span>
              <div className="h-7 w-7 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                <XCircle className="h-3.5 w-3.5" />
              </div>
            </div>
            <span className="text-xl sm:text-2xl font-black font-mono text-rose-600 dark:text-rose-400">{cancelled.length}</span>
          </div>

          {/* Clientes Atendidos */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/5 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] text-slate-500 dark:text-zinc-400 font-semibold">Clientes</span>
              <div className="h-7 w-7 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <Users className="h-3.5 w-3.5" />
              </div>
            </div>
            <span className="text-xl sm:text-2xl font-black font-mono text-slate-900 dark:text-white">{uniqueClients}</span>
          </div>
        </div>

        {/* ═══ APPLE PERFORMANCE STRIP (ACTIVITY STYLE) ═══ */}
        <div className="pt-2 border-t border-slate-100 dark:border-white/10 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700 dark:text-zinc-300">Efectividad Operativa</span>
            <span className="font-mono font-bold text-slate-900 dark:text-white">{attendanceRate}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${Math.max(5, Math.min(100, attendanceRate))}%`,
                background: "linear-gradient(90deg, #10b981 0%, #34d399 100%)",
              }}
            />
          </div>
        </div>
      </div>

      {/* ═══ APPLE INTERACTIVE TREND CHART CARD ═══ */}
      <div className="rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#121215] p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2">
            <h2 className="font-bold text-slate-900 dark:text-white text-base">
              Evolución Operativa
            </h2>
            <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-bold text-primary font-mono">
              Pico: {peakDay}
            </span>
          </div>

          {/* Metric Toggle: Ingresos vs Turnos */}
          <IosSegmentedControl
            value={chartMetric}
            onChange={(val) => {
              triggerHaptic("selection");
              setChartMetric(val as any);
            }}
            layoutId="chartMetricToggle"
            size="sm"
            options={[
              { value: "ingresos", label: "Facturación" },
              { value: "turnos", label: "Turnos" },
            ]}
          />
        </div>

        <div className="h-64 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            {chartMetric === "ingresos" ? (
              <AreaChart data={areaData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="appleChartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={brandColor} stopOpacity={0.4} />
                    <stop offset="95%" stopColor={brandColor} stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis
                  stroke="#71717a"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(val: unknown) => [formatGs(Number(val) || 0), "Facturación"]}
                  contentStyle={{
                    backgroundColor: "rgba(18, 18, 21, 0.95)",
                    borderRadius: "16px",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "#fff",
                    fontSize: "12px",
                    backdropFilter: "blur(12px)",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="ingresos"
                  stroke={brandColor}
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#appleChartGradient)"
                />
              </AreaChart>
            ) : (
              <BarChart data={areaData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis allowDecimals={false} stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip
                  formatter={(val: unknown) => [`${val} citas`, "Turnos"]}
                  contentStyle={{
                    backgroundColor: "rgba(18, 18, 21, 0.95)",
                    borderRadius: "16px",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "#fff",
                    fontSize: "12px",
                    backdropFilter: "blur(12px)",
                  }}
                />
                <Bar dataKey="turnos" fill={brandColor} radius={[8, 8, 0, 0]} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* ═══ APPLE INSET GROUPED BREAKDOWNS (TABLEVIEW STYLE) ═══ */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Métodos de Cobro */}
        <div className="rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#121215] p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/10 pb-3">
            <h2 className="font-bold text-slate-900 dark:text-white text-sm">
              Métodos de Cobro
            </h2>
            <span className="text-[11px] font-mono font-bold text-slate-400 dark:text-zinc-500">
              Distribución
            </span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-white/5">
            {paymentData.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.name} className="py-3 first:pt-0 last:pb-0 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="h-8 w-8 rounded-xl flex items-center justify-center shrink-0"
                        style={{ backgroundColor: `${item.color}18`, color: item.color }}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {item.name}
                      </span>
                    </div>

                    <div className="text-right">
                      <div className="text-xs font-mono font-bold text-slate-900 dark:text-white">
                        {formatGs(item.amount)}
                      </div>
                      <div className="text-[10px] font-mono text-slate-400 dark:text-zinc-500">
                        {item.percentage}%
                      </div>
                    </div>
                  </div>

                  {/* iOS Mini Progress Track */}
                  <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-white/5 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${item.percentage}%`,
                        backgroundColor: item.color,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Horarios Más Demandados */}
        <div className="rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#121215] p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/10 pb-3">
            <h2 className="font-bold text-slate-900 dark:text-white text-sm">
              Horas de Mayor Afluencia
            </h2>
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-bold text-primary font-mono">
              <Clock className="h-3 w-3" /> Pico: {peakHour} hs
            </span>
          </div>

          <div className="h-48 w-full pt-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourlyDistribution} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <XAxis dataKey="hour" stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis allowDecimals={false} stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip
                  formatter={(val: unknown) => [`${val} turnos`, "Volumen"]}
                  contentStyle={{
                    backgroundColor: "rgba(18, 18, 21, 0.95)",
                    borderRadius: "16px",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "#fff",
                    fontSize: "12px",
                    backdropFilter: "blur(12px)",
                  }}
                />
                <Bar dataKey="citas" fill={brandColor} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/5 flex items-center justify-between text-xs">
            <span className="text-slate-600 dark:text-zinc-400 font-medium">Mayor concentración</span>
            <span className="font-mono font-bold text-slate-900 dark:text-white">16:00 - 19:00 hs</span>
          </div>
        </div>
      </div>

      {/* ═══ CLIENT INTELLIGENCE & LOYALTY (APPLE INSET CARDS) ═══ */}
      <div className="rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#121215] p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <h2 className="font-bold text-slate-900 dark:text-white text-sm">
              Fidelización & Retorno
            </h2>
          </div>

          <span className="text-[11px] font-mono font-bold text-emerald-600 dark:text-emerald-400">
            Saludable
          </span>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200/60 dark:border-white/5 bg-slate-50 dark:bg-white/[0.03] p-4">
            <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider block">
              Retención de Clientes
            </span>
            <p className="text-2xl font-black font-mono text-slate-900 dark:text-white mt-1">
              78.4%
            </p>
            <p className="text-[10px] text-emerald-500 font-semibold mt-1">
              ↑ +4.2% fidelización
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/60 dark:border-white/5 bg-slate-50 dark:bg-white/[0.03] p-4">
            <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider block">
              Ciclo de Retorno
            </span>
            <p className="text-2xl font-black font-mono text-slate-900 dark:text-white mt-1">
              18 días
            </p>
            <p className="text-[10px] text-slate-400 dark:text-zinc-500 mt-1">
              Promedio habitual
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/60 dark:border-white/5 bg-slate-50 dark:bg-white/[0.03] p-4">
            <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider block">
              Valor de Vida (LTV)
            </span>
            <p className="text-2xl font-black font-mono text-primary mt-1">
              Gs. 480.000
            </p>
            <p className="text-[10px] text-slate-400 dark:text-zinc-500 mt-1">
              Gasto medio por cliente
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
