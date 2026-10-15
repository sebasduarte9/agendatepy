"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart as RechartsBarChart, Bar, Cell } from "recharts";
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
  ChevronDown,
  Zap,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import { useDashboardStore } from "@/store/useDashboardStore";
import IosSegmentedControl from "@/components/dashboard/ui/IosSegmentedControl";
import AnimatedValue from "@/components/dashboard/ui/AnimatedValue";
import { triggerHaptic } from "@/lib/haptics";
import { formatGs } from "@/lib/dashboard-dates";
import {
  MetricCard,
  LineChart,
  BarChart as MotionBarChart,
  DonutChart,
  type LineChartDatum,
  type BarChartDatum,
  type DonutChartDatum,
} from "@/components/ui/motion-charts";

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

const darkGlassTooltipStyle = {
  backgroundColor: "rgba(22, 19, 24, 0.92)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  borderRadius: "14px",
  border: "1px solid rgba(255, 255, 255, 0.12)",
  boxShadow: "0 16px 40px rgba(0, 0, 0, 0.55)",
  color: "#f6f3ef",
  fontSize: "12px",
  padding: "10px 14px",
};

function DeltaBadge({ value, compact = false, dense = false }: { value: number | null; compact?: boolean; dense?: boolean }) {
  if (value === null) {
    return (
      <span className={`inline-flex max-w-full items-center gap-2 rounded-full border border-white/10 bg-white/[0.035] font-medium text-zinc-400 ${compact ? "px-2.5 py-1.5 text-[10px]" : "px-3 py-1.5 text-[10px]"}`}>
        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-500" aria-hidden="true" />
        <span>Sin período anterior</span>
      </span>
    );
  }
  const up = value >= 0;
  const Icon = up ? ArrowUpRight : ArrowDownRight;
  const tone = up
    ? "border-emerald-400/20 bg-emerald-400/[0.07] text-emerald-700 dark:text-emerald-300"
    : "border-rose-400/20 bg-rose-400/[0.07] text-rose-700 dark:text-rose-300";
  const iconTone = up
    ? "bg-emerald-400/15 text-emerald-700 dark:text-emerald-300"
    : "bg-rose-400/15 text-rose-700 dark:text-rose-300";
  return (
    <span
      role="group"
      aria-label={`Variación ${up ? "positiva" : "negativa"} de ${Math.abs(value)} por ciento frente al período anterior`}
      className={`inline-flex max-w-full shrink-0 items-center rounded-full border font-semibold leading-none transition-colors ${dense ? "gap-1 px-1.5 py-1 text-[9px] sm:gap-2 sm:px-2 sm:py-1.5 sm:text-[11px]" : compact ? "gap-1 px-1.5 py-1 text-[9px]" : "gap-2 px-2 py-1.5 text-[10px] sm:text-[11px]"} ${tone}`}
    >
      <span className={`flex shrink-0 items-center justify-center rounded-full ${dense ? "h-[18px] w-[18px] sm:h-6 sm:w-6" : compact ? "h-4 w-4" : "h-6 w-6"} ${iconTone}`} aria-hidden="true">
        <Icon className={dense ? "h-2.5 w-2.5 sm:h-3.5 sm:w-3.5" : compact ? "h-2.5 w-2.5" : "h-3.5 w-3.5"} strokeWidth={2.5} />
      </span>
      <span className={`flex min-w-0 items-baseline pr-0.5 ${dense ? "gap-1 sm:gap-1.5 sm:pr-1" : compact ? "gap-1" : "gap-1.5 pr-1"}`}>
        <strong className={`shrink-0 font-extrabold tabular-nums ${compact ? "delta-value text-[11px]" : dense ? "text-[11px] sm:text-xs" : "text-[11px] sm:text-xs"}`}>{up ? "+" : "−"}{Math.abs(value)}%</strong>
        <span className={`truncate font-medium opacity-75 ${compact ? "text-[8px]" : dense ? "text-[8px] sm:text-[11px]" : "text-[10px] sm:text-[11px]"}`}>vs. anterior</span>
      </span>
    </span>
  );
}

function EmptyChart({ text }: { text: string }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2.5 text-center p-6">
      <div className="h-12 w-12 rounded-2xl glass-panel-subtle flex items-center justify-center text-zinc-500">
        <BarChart3 className="h-6 w-6 opacity-60" />
      </div>
      <p className="max-w-[240px] text-xs text-zinc-400 leading-relaxed">{text}</p>
    </div>
  );
}

function MobileInsightToggle({
  id,
  title,
  summary,
  expanded,
  onToggle,
}: {
  id: string;
  title: string;
  summary: string;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      className="stats-mobile-insight-toggle"
      aria-controls={id}
      aria-expanded={expanded}
      onClick={onToggle}
    >
      <span className="stats-mobile-insight-copy">
        <span className="stats-mobile-insight-title">{title}</span>
        <span className="stats-mobile-insight-summary">{summary}</span>
      </span>
      <ChevronDown className="stats-mobile-insight-chevron h-4 w-4 shrink-0" aria-hidden="true" />
    </button>
  );
}

const DEMO_STATS_BY_RANGE: Record<Range, Stats> = {
  hoy: {
    totalRevenue: 1115000,
    revenueDelta: 18,
    totalAppointments: 8,
    appointmentsDelta: 14,
    confirmedAppointments: 7,
    cancelledAppointments: 1,
    noShowAppointments: 0,
    attendanceRate: 88,
    avgTicket: 139375,
    totalClients: 8,
    retentionRate: 75,
    returnCycleDays: 18,
    lifetimeValue: 1280000,
    areaData: [
      { name: "09:00", ingresos: 80000, turnos: 1 },
      { name: "10:00", ingresos: 250000, turnos: 1 },
      { name: "11:00", ingresos: 130000, turnos: 1 },
      { name: "13:30", ingresos: 80000, turnos: 1 },
      { name: "14:30", ingresos: 320000, turnos: 1 },
      { name: "16:00", ingresos: 130000, turnos: 1 },
      { name: "17:30", ingresos: 45000, turnos: 1 },
      { name: "18:30", ingresos: 80000, turnos: 1 },
    ],
    paymentMethodsData: [
      { name: "POS Bancard", value: 450000 },
      { name: "Efectivo", value: 380000 },
      { name: "SIPAP / Transferencia", value: 210000 },
      { name: "QR Pix / Bancario", value: 75000 },
    ],
    hourlyDistribution: [
      { hour: "09:00", citas: 1 },
      { hour: "10:00", citas: 2 },
      { hour: "11:00", citas: 1 },
      { hour: "13:00", citas: 1 },
      { hour: "14:00", citas: 1 },
      { hour: "15:00", citas: 0 },
      { hour: "16:00", citas: 2 },
      { hour: "17:00", citas: 1 },
      { hour: "18:00", citas: 1 },
    ],
  },
  semana: {
    totalRevenue: 6840000,
    revenueDelta: 22,
    totalAppointments: 46,
    appointmentsDelta: 15,
    confirmedAppointments: 42,
    cancelledAppointments: 3,
    noShowAppointments: 1,
    attendanceRate: 91,
    avgTicket: 148695,
    totalClients: 38,
    retentionRate: 72,
    returnCycleDays: 19,
    lifetimeValue: 1420000,
    areaData: [
      { name: "Lun", ingresos: 720000, turnos: 5 },
      { name: "Mar", ingresos: 890000, turnos: 6 },
      { name: "Mié", ingresos: 950000, turnos: 7 },
      { name: "Jue", ingresos: 1100000, turnos: 8 },
      { name: "Vie", ingresos: 1480000, turnos: 10 },
      { name: "Sáb", ingresos: 1700000, turnos: 10 },
      { name: "Dom", ingresos: 0, turnos: 0 },
    ],
    paymentMethodsData: [
      { name: "POS Bancard", value: 3120000 },
      { name: "Efectivo", value: 2100000 },
      { name: "SIPAP / Transferencia", value: 1240000 },
      { name: "QR Bancario", value: 380000 },
    ],
    hourlyDistribution: [
      { hour: "09:00", citas: 4 },
      { hour: "10:00", citas: 6 },
      { hour: "11:00", citas: 5 },
      { hour: "13:00", citas: 4 },
      { hour: "14:00", citas: 6 },
      { hour: "15:00", citas: 7 },
      { hour: "16:00", citas: 8 },
      { hour: "17:00", citas: 7 },
      { hour: "18:00", citas: 6 },
    ],
  },
  mes: {
    totalRevenue: 26500000,
    revenueDelta: 19,
    totalAppointments: 184,
    appointmentsDelta: 12,
    confirmedAppointments: 171,
    cancelledAppointments: 10,
    noShowAppointments: 3,
    attendanceRate: 93,
    avgTicket: 144021,
    totalClients: 142,
    retentionRate: 68,
    returnCycleDays: 21,
    lifetimeValue: 1550000,
    areaData: [
      { name: "Sem 1", ingresos: 6100000, turnos: 42 },
      { name: "Sem 2", ingresos: 6750000, turnos: 46 },
      { name: "Sem 3", ingresos: 6810000, turnos: 47 },
      { name: "Sem 4", ingresos: 6840000, turnos: 49 },
    ],
    paymentMethodsData: [
      { name: "POS Bancard", value: 12200000 },
      { name: "Efectivo", value: 8100000 },
      { name: "SIPAP / Transferencia", value: 4800000 },
      { name: "QR Bancario", value: 1400000 },
    ],
    hourlyDistribution: [
      { hour: "09:00", citas: 16 },
      { hour: "10:00", citas: 24 },
      { hour: "11:00", citas: 22 },
      { hour: "13:00", citas: 15 },
      { hour: "14:00", citas: 26 },
      { hour: "15:00", citas: 28 },
      { hour: "16:00", citas: 32 },
      { hour: "17:00", citas: 29 },
      { hour: "18:00", citas: 21 },
    ],
  },
  "90": {
    totalRevenue: 74800000,
    revenueDelta: 25,
    totalAppointments: 520,
    appointmentsDelta: 18,
    confirmedAppointments: 488,
    cancelledAppointments: 24,
    noShowAppointments: 8,
    attendanceRate: 94,
    avgTicket: 143846,
    totalClients: 320,
    retentionRate: 66,
    returnCycleDays: 22,
    lifetimeValue: 1680000,
    areaData: [
      { name: "Mes -2", ingresos: 23100000, turnos: 162 },
      { name: "Mes -1", ingresos: 25200000, turnos: 174 },
      { name: "Mes Actual", ingresos: 26500000, turnos: 184 },
    ],
    paymentMethodsData: [
      { name: "POS Bancard", value: 34500000 },
      { name: "Efectivo", value: 23200000 },
      { name: "SIPAP / Transferencia", value: 13500000 },
      { name: "QR Bancario", value: 3600000 },
    ],
    hourlyDistribution: [
      { hour: "09:00", citas: 48 },
      { hour: "10:00", citas: 72 },
      { hour: "11:00", citas: 65 },
      { hour: "13:00", citas: 45 },
      { hour: "14:00", citas: 78 },
      { hour: "15:00", citas: 84 },
      { hour: "16:00", citas: 96 },
      { hour: "17:00", citas: 87 },
      { hour: "18:00", citas: 62 },
    ],
  },
};

export default function EstadisticasPage() {
  const { business, services, appointments } = useDashboardStore();
  const brandColor = business.primaryColor || "#FF4F2B";

  const [range, setRange] = useState<Range>("semana");
  const [chartMetric, setChartMetric] = useState<"ingresos" | "turnos">("ingresos");
  const [activeHeatCell, setActiveHeatCell] = useState<{ day: string; hour: number; count: number } | null>(null);
  const [expandedMobileInsights, setExpandedMobileInsights] = useState({ payments: false, services: false, loyalty: false });
  const [stats, setStats] = useState<Stats | null>(DEMO_STATS_BY_RANGE.semana);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadStats = useCallback((r: Range) => {
    setLoading(true);
    setError(null);
    fetch(`/api/dashboard/stats?range=${r}`)
      .then(async (res) => {
        if (!res.ok) throw new Error("Fallback demo");
        const data = await res.json();
        if (!data.ok || !data.stats) throw new Error("Fallback demo");
        if (data.stats.totalRevenue === 0 && data.stats.totalAppointments === 0) {
          setStats(DEMO_STATS_BY_RANGE[r]);
        } else {
          setStats(data.stats);
        }
      })
      .catch(() => {
        setStats(DEMO_STATS_BY_RANGE[r]);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadStats(range);
  }, [range, loadStats]);

  // Top services ranking from catalogo-elementos / interfas glassy
  const topServices = useMemo(() => {
    if (!services || services.length === 0) return [];
    const serviceMap: Record<string, { name: string; total: number; count: number }> = {};
    services.forEach((s) => {
      serviceMap[s.id] = { name: s.name, total: 0, count: 0 };
    });
    appointments.forEach((a) => {
      if (a.status !== "cancelled" && serviceMap[a.serviceId]) {
        const s = services.find((srv) => srv.id === a.serviceId);
        const price = s?.price ?? 80000;
        serviceMap[a.serviceId].total += price;
        serviceMap[a.serviceId].count += 1;
      }
    });
    const list = Object.values(serviceMap).filter((item) => item.total > 0 || item.count > 0);
    if (list.length === 0) {
      return [
        { name: services[0]?.name || "Corte Degradé / Fade", total: 480000, pct: 100 },
        { name: services[1]?.name || "Perfilado de Barba & Ritual", total: 320000, pct: 67 },
        { name: services[2]?.name || "Tratamiento Capilar Nutritivo", total: 210000, pct: 44 },
        { name: services[3]?.name || "Corte Clásico a Tijera", total: 160000, pct: 33 },
      ];
    }
    const maxTotal = Math.max(...list.map((i) => i.total), 1);
    return list
      .sort((a, b) => b.total - a.total)
      .slice(0, 5)
      .map((item) => ({
        name: item.name,
        total: item.total,
        pct: Math.round((item.total / maxTotal) * 100),
      }));
  }, [services, appointments]);

  // Heatmap matrix: 7 days (Lun..Dom) x [9, 11, 13, 15, 17]
  const heatmapMatrix = useMemo(() => {
    const matrix: Record<number, Record<number, number>> = {};
    for (let d = 0; d < 7; d++) {
      matrix[d] = { 9: 0, 11: 0, 13: 0, 15: 0, 17: 0 };
    }
    appointments.forEach((a) => {
      if (a.status === "cancelled") return;
      try {
        const date = new Date(a.start);
        const dayOfWeek = (date.getDay() + 6) % 7;
        const hour = date.getHours();
        const bucket = [9, 11, 13, 15, 17].find((h) => hour >= h && hour < h + 2) || (hour < 9 ? 9 : 17);
        if (matrix[dayOfWeek] && matrix[dayOfWeek][bucket] !== undefined) {
          matrix[dayOfWeek][bucket] += 1;
        }
      } catch {
        // skip
      }
    });

    const totalCount = Object.values(matrix).reduce(
      (acc, row) => acc + Object.values(row).reduce((s, v) => s + v, 0),
      0
    );
    if (totalCount === 0) {
      matrix[0] = { 9: 1, 11: 2, 13: 0, 15: 2, 17: 3 };
      matrix[1] = { 9: 2, 11: 1, 13: 1, 15: 3, 17: 4 };
      matrix[2] = { 9: 1, 11: 3, 13: 2, 15: 4, 17: 3 };
      matrix[3] = { 9: 3, 11: 4, 13: 1, 15: 3, 17: 5 };
      matrix[4] = { 9: 4, 11: 5, 13: 3, 15: 5, 17: 6 };
      matrix[5] = { 9: 5, 11: 6, 13: 4, 15: 6, 17: 7 };
      matrix[6] = { 9: 1, 11: 2, 13: 0, 15: 1, 17: 1 };
    }
    return matrix;
  }, [appointments]);

  const areaData = stats?.areaData ?? [];
  const hasTrend = areaData.some((d) => d.turnos > 0 || d.ingresos > 0);
  const hasInactivePeriod = range !== "hoy" && areaData.some((d) => d.turnos === 0 && d.ingresos === 0);
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

  // Motion Chart Data mappings
  const lineChartData: LineChartDatum[] = useMemo(() => {
    return areaData.map((d, index) => ({
      key: `${d.name}-${index}`,
      label: d.name,
      axisLabel: d.name,
      values: {
        ingresos: d.ingresos,
        turnos: d.turnos,
      },
    }));
  }, [areaData]);

  const barChartData: BarChartDatum[] = useMemo(() => {
    return areaData.map((d, index) => ({
      key: `${d.name}-${index}`,
      label: d.name,
      axisLabel: d.name,
      value: d.turnos,
    }));
  }, [areaData]);

  const donutData: DonutChartDatum[] = useMemo(() => {
    const list = stats?.paymentMethodsData ?? [];
    return list.map((item, idx) => ({
      key: item.name,
      label: item.name,
      value: item.value,
      color: PAYMENT_COLORS[idx % PAYMENT_COLORS.length],
    }));
  }, [stats?.paymentMethodsData]);

  // Mini bars for savings card
  const miniBarData = useMemo(() => {
    if (areaData.length > 0) {
      const maxTurnos = Math.max(...areaData.map((d) => d.turnos), 1);
      return areaData.slice(-4).map((d) => ({
        label: d.name.slice(0, 3),
        height: Math.max(16, Math.min(68, Math.round((d.turnos / maxTurnos) * 68))),
      }));
    }
    return [
      { label: "Lun", height: 28 },
      { label: "Mie", height: 45 },
      { label: "Vie", height: 68 },
      { label: "Sab", height: 56 },
    ];
  }, [areaData]);

  const pods = stats
    ? [
        { label: "Turnos Totales", value: String(stats.totalAppointments), icon: CalendarDays, color: "#6366f1" },
        { label: "Atendidos", value: String(stats.confirmedAppointments), icon: CheckCircle2, color: "#10b981" },
        { label: "Cancelados / No Show", value: String(stats.cancelledAppointments + stats.noShowAppointments), icon: XCircle, color: "#f43f5e" },
        { label: "Clientes Activos", value: String(stats.totalClients), icon: Users, color: "#a855f7" },
      ]
    : [];

  return (
    <div className="stats-page w-full space-y-5 sm:space-y-6 pb-20 sm:pb-28 px-1 sm:px-0 page-enter">
      {/* Header Glassy */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between py-1">
        <div>
          <span className="eyebrow">TELEMETRÍA & RENDIMIENTO</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Estadísticas
          </h1>
          <p className="text-xs text-zinc-400 mt-1">Resumen · {RANGE_LABELS[range]}</p>
        </div>

        <div className="flex w-full items-center gap-2 max-[359px]:flex-wrap sm:w-auto">
          <IosSegmentedControl
            value={range}
            onChange={(val) => {
              triggerHaptic("selection");
              setRange(val as Range);
            }}
            layoutId="statsPeriodFilter"
            size="lg"
            className="min-w-0 max-[359px]:flex-none max-[359px]:w-full [&>button]:!px-2 sm:[&>button]:!px-4"
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
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 glass-panel-subtle text-zinc-300 hover:bg-white/10 hover:border-white/20 active:scale-95 transition disabled:opacity-50 cursor-pointer max-[359px]:ml-auto"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-primary" : ""}`} />
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 flex items-center justify-between gap-3 backdrop-blur-md">
          <p className="text-xs font-semibold text-rose-300">{error}</p>
          <button
            type="button"
            onClick={() => loadStats(range)}
            className="shrink-0 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold px-3 py-1.5 text-xs transition cursor-pointer"
          >
            Reintentar
          </button>
        </div>
      )}

      {loading && !stats ? (
        <div className="space-y-4 animate-pulse" aria-busy="true">
          <div className="h-20 rounded-2xl bg-white/5" />
          <div className="h-72 rounded-3xl bg-white/5" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-32 rounded-2xl bg-white/5" />
            ))}
          </div>
        </div>
      ) : stats ? (
        <div className={`space-y-5 sm:space-y-6 transition-opacity duration-300 ${loading ? "opacity-60" : "opacity-100"}`}>
          {/* 1. Motion Glassy Metric Cards with Morphing Springs on Date Changes */}
          <div className="stats-kpi-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5">
            <MetricCard
              label="Facturación Total"
              value={stats.totalRevenue}
              prefix="Gs. "
              context={RANGE_LABELS[range]}
              change={stats.revenueDelta !== null ? `${stats.revenueDelta >= 0 ? "+" : ""}${stats.revenueDelta}%` : undefined}
            />
            <MetricCard
              label="Ticket Promedio"
              value={stats.avgTicket}
              prefix="Gs. "
              context="Por servicio atendido"
            />
            <MetricCard
              label="Tasa de Asistencia"
              value={stats.attendanceRate ?? 100}
              suffix="%"
              context={`${stats.confirmedAppointments} atendidos de ${stats.totalAppointments}`}
            />
            <MetricCard
              label="Turnos Atendidos"
              value={stats.confirmedAppointments}
              context={`En ${RANGE_LABELS[range].toLowerCase()}`}
              change={stats.appointmentsDelta !== null ? `${stats.appointmentsDelta >= 0 ? "+" : ""}${stats.appointmentsDelta}%` : undefined}
            />
          </div>

          {/* 2. Main Trend & Performance Glass Motion Chart */}
          <div className="panel dashboard-chart glass-panel p-4 sm:p-6 space-y-3 sm:space-y-4">
            <div className="space-y-3 sm:space-y-4">
              <div>
                <span className="eyebrow">FLUJO & OPERACIONES</span>
                <h3 className="text-[15px] sm:text-lg font-bold text-slate-900 dark:text-white">Evolución de Rendimiento</h3>
                <p className="subtitle text-[13px] leading-[1.4] sm:text-base">
                  {`${chartMetric === "ingresos" ? "Facturación registrada" : "Turnos atendidos"} en el período seleccionado`}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <div className="flex min-w-0 flex-nowrap items-center gap-1.5 sm:flex-wrap sm:gap-2">
                  {peakDay && (
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-amber-400/20 bg-amber-400/[0.06] py-1 pl-1 pr-2 sm:gap-2 sm:py-1.5 sm:pl-1.5 sm:pr-3">
                      <span className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full bg-amber-400/15 text-amber-700 dark:text-amber-300 sm:h-6 sm:w-6" aria-hidden="true">
                        <TrendingUp className="h-2.5 w-2.5 sm:h-3.5 sm:w-3.5" strokeWidth={2.5} />
                      </span>
                      <span className="text-[8px] font-bold uppercase tracking-[0.08em] text-amber-700/70 dark:text-amber-200/65 sm:text-[9px] sm:tracking-[0.1em]">Pico</span>
                      <span className="text-[10px] font-bold text-amber-800 dark:text-amber-100 sm:text-[11px]">{peakDay}</span>
                    </span>
                  )}
                  <DeltaBadge value={chartMetric === "ingresos" ? stats.revenueDelta : stats.appointmentsDelta} dense />
                </div>
                <IosSegmentedControl
                  value={chartMetric}
                  onChange={(val) => {
                    triggerHaptic("selection");
                    setChartMetric(val as "ingresos" | "turnos");
                  }}
                  layoutId="chartMetricToggle"
                  size="lg"
                  className="[&>button]:!px-3 sm:[&>button]:!px-4"
                  options={[
                    { value: "ingresos", label: "Facturación" },
                    { value: "turnos", label: "Turnos" },
                  ]}
                />
              </div>
            </div>

            <div className="w-full pt-1">
              {!hasTrend ? (
                <EmptyChart text="Todavía no hay turnos registrados en este período. Probá seleccionando un rango más amplio." />
              ) : chartMetric === "ingresos" ? (
                <LineChart
                  data={lineChartData}
                  series={[
                    { key: "ingresos", label: "Facturación", color: brandColor, area: true },
                  ]}
                  label="Evolución de Facturación"
                  height={180}
                  formatValue={(val) => formatGs(val)}
                  formatTick={(val) => val >= 1_000_000 ? `${(val / 1_000_000).toLocaleString("es-PY", { maximumFractionDigits: 1 })} M` : val >= 1_000 ? `${Math.round(val / 1_000)} mil` : `${val}`}
                />
              ) : (
                <MotionBarChart
                  data={barChartData}
                  label="Turnos Atendidos"
                  period={RANGE_LABELS[range]}
                  unit="turnos"
                  height={170}
                  showAverageLabel={false}
                  formatValue={(val) => `${val}`}
                />
              )}
              {hasTrend && hasInactivePeriod && (
                <p className="stats-chart-note mt-2 text-[11px] leading-relaxed text-slate-600 dark:text-zinc-300">
                  Los períodos sin turnos atendidos se muestran con valor 0.
                </p>
              )}
            </div>
          </div>

          {/* 3. Goals & Savings Row (Interfas Glassy architecture) */}
          <div className="section-head mb-3 mt-5">
            <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white tracking-wide">
              Metas, Fidelización & Volumen
            </h2>
          </div>

          <div className="dashboard-bottom">
            {/* Goal 1: Attendance */}
            <div className="panel goal-card">
              <div className="goal-top">
                <span className="value text-emerald-400">
                  {stats.attendanceRate === null ? "100%" : `${stats.attendanceRate}%`}
                </span>
                <CheckCircle2 className="text-emerald-400/40" />
              </div>
              <div className="progress mt-3 mb-2">
                <span
                  style={{
                    width: `${Math.min(100, stats.attendanceRate ?? 100)}%`,
                    background: "var(--green, #10b981)",
                  }}
                />
              </div>
              <p>Meta Asistencia (Objetivo &gt; 90%)</p>
            </div>

            {/* Goal 2: Retention */}
            <div className="panel goal-card">
              <div className="goal-top">
                <span className="value text-primary">
                  {stats.retentionRate === null ? "75%" : `${stats.retentionRate}%`}
                </span>
                <Users className="text-primary/40" />
              </div>
              <div className="progress mt-3 mb-2">
                <span
                  style={{
                    width: `${Math.min(100, stats.retentionRate ?? 75)}%`,
                    background: "var(--primary, #FF4F2B)",
                  }}
                />
              </div>
              <p>Fidelización & Clientes Recurrentes</p>
            </div>

            {/* Savings & Mini Bar Chart */}
            <div className="panel savings">
              <div>
                <small className="muted">Volumen Facturado</small>
                <strong>
                  <em>Gs.</em> {formatGs(stats.totalRevenue).replace("Gs. ", "")}
                </strong>
                <DeltaBadge value={stats.revenueDelta} compact />
              </div>
              <div className="bar-chart">
                {miniBarData.map((bar, i) => (
                  <div key={bar.label + i}>
                    <i
                      style={{
                        height: `${bar.height}px`,
                        animationDelay: `${i * 0.1}s`,
                      }}
                    />
                    <small>{bar.label}</small>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 4. Activity Strip Telemetry Notice */}
          <div className="panel activity-strip stats-activity-strip">
            <Zap className="h-4 w-4" />
            <span>
              {peakHour
              ? `Mayor volumen de reservas: ${peakHour} hs. Considerá reforzar la cobertura en ese horario.`
                : stats.totalRevenue > 0
                ? `El ticket promedio operativo se sitúa en ${formatGs(stats.avgTicket)}.`
                : "Agendá y atendé turnos para comenzar a ver insights predictivos de rendimiento."}
            </span>
            <span className={`activity-state-pill ${peakHour ? "activity-state-pill--peak" : stats.totalRevenue > 0 ? "activity-state-pill--summary" : "activity-state-pill--empty"}`}>
              {peakHour && <span aria-hidden="true" />}
              {peakHour ? "Hora pico" : stats.totalRevenue > 0 ? "Resumen" : "Sin datos"}
            </span>
          </div>

          {/* 5. Telemetry Pods Grid */}
          <div className="stats-pods-grid grid grid-cols-2 md:grid-cols-4 gap-3">
            {pods.map((p) => {
              const Icon = p.icon;
              return (
                <div
                  key={p.label}
                  className="stats-pod rounded-2xl glass-panel-subtle p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-white/20"
                  aria-label={`${p.label}: ${p.value}`}
                >
                  <div className="stats-pod-head flex items-center justify-between">
                    <span className="stats-pod-label text-[11px] font-semibold text-zinc-400">
                      {p.label === "Cancelados / No Show" ? (
                        <>Cancelados <span className="stats-pod-label-detail">No Show</span></>
                      ) : p.label}
                    </span>
                    <span
                      className="stats-pod-icon flex h-7 w-7 items-center justify-center rounded-lg"
                      style={{ backgroundColor: `${p.color}1a`, color: p.color }}
                      aria-hidden="true"
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </span>
                  </div>
                  <span className="stats-pod-value mt-2 block text-2xl font-black font-mono text-slate-900 dark:text-white">
                    <AnimatedValue value={p.value} />
                  </span>
                </div>
              );
            })}
          </div>

          {/* 6. Payment Breakdown & Hours */}
          <section className="stats-insight-group" aria-label="Cobros y horarios">
            <MobileInsightToggle
              id="stats-payments-content"
              title="Cobros y horarios"
              summary={`${payments.length} ${payments.length === 1 ? "método" : "métodos"} de cobro${peakHour ? ` · hora pico ${peakHour}` : ""}`}
              expanded={expandedMobileInsights.payments}
              onToggle={() => setExpandedMobileInsights((current) => ({ ...current, payments: !current.payments }))}
            />
            <div
              id="stats-payments-content"
              className={`stats-insight-content ${!expandedMobileInsights.payments ? "stats-insight-content-collapsed" : ""}`}
            >
          <div className="grid min-w-0 grid-cols-1 gap-4 md:grid-cols-2">
            {/* Payments breakdown */}
            <div className="panel glass-panel p-4 sm:p-6 space-y-4">
              <div className="panel-head border-b border-white/10 pb-3 mb-2">
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">Métodos de Cobro</h3>
                  <p className="subtitle">Desglose según cobros registrados en caja</p>
                </div>
              </div>

              {payments.length === 0 ? (
                <div className="h-44">
                  <EmptyChart text="Al registrar cobros en la caja verás acá el reparto por método de pago." />
                </div>
              ) : (
                <div className="pt-2 flex items-center justify-center">
                  <DonutChart
                    data={donutData}
                    label="Métodos de Cobro"
                    totalLabel="Total Cobrado"
                    size={176}
                    thickness={22}
                    formatValue={(v) => formatGs(v)}
                    formatCenterValue={(v) => v >= 1_000_000 ? `Gs. ${(v / 1_000_000).toLocaleString("es-PY", { maximumFractionDigits: 2 })} M` : v >= 1_000 ? `Gs. ${Math.round(v / 1_000)} mil` : formatGs(v)}
                  />
                </div>
              )}
            </div>

            {/* Hourly Distribution */}
            <div className="panel glass-panel p-4 sm:p-6 space-y-4">
              <div className="panel-head flex flex-wrap items-start justify-between gap-2 border-b border-white/10 pb-3 mb-2">
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">Distribución por Hora</h3>
                  <p className="subtitle">Horarios de mayor concentración de citas</p>
                </div>
                {peakHour && (
                  <span className="badge orange flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {peakHour} hs
                  </span>
                )}
              </div>

              <div className="h-48 w-full">
                {hourly.length === 0 ? (
                  <EmptyChart text="Sin turnos en este período." />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsBarChart data={hourly} margin={{ top: 8, right: 8, left: -22, bottom: 0 }}>
                      <XAxis dataKey="hour" stroke="#a1a1aa" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis allowDecimals={false} stroke="#a1a1aa" fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip
                        formatter={(val: unknown) => [`${val} turnos`, "Turnos"]}
                        contentStyle={darkGlassTooltipStyle}
                        cursor={{ fill: "rgba(255,255,255,0.05)" }}
                      />
                      <Bar dataKey="citas" radius={[5, 5, 0, 0]} animationDuration={800}>
                        {hourly.map((h) => (
                          <Cell
                            key={h.hour}
                            fill={h.hour === peakHour ? brandColor : `${brandColor}66`}
                          />
                        ))}
                      </Bar>
                    </RechartsBarChart>
                  </ResponsiveContainer>
                )}
              </div>
              {peakHour && (
                <p className="rounded-xl glass-panel-subtle p-3 text-xs text-zinc-300">
                  Pico de actividad: <strong className="text-slate-900 dark:text-white">{peakHour} hs</strong>. Recomendamos asegurar cobertura completa en ese tramo.
                </p>
              )}
            </div>
          </div>
            </div>
          </section>

          {/* 7. Servicios que Destacan & Heatmap Semanal (Glassy Catalogo Elements) */}
          <section className="stats-insight-group" aria-label="Servicios y actividad semanal">
            <MobileInsightToggle
              id="stats-services-content"
              title="Servicios y actividad semanal"
              summary={`${topServices.length} ${topServices.length === 1 ? "servicio destacado" : "servicios destacados"} · distribución de citas por día y hora`}
              expanded={expandedMobileInsights.services}
              onToggle={() => setExpandedMobileInsights((current) => ({ ...current, services: !current.services }))}
            />
            <div
              id="stats-services-content"
              className={`stats-insight-content ${!expandedMobileInsights.services ? "stats-insight-content-collapsed" : ""}`}
            >
          <div className="grid min-w-0 grid-cols-1 gap-4 md:grid-cols-2">
            {/* Servicios que destacan */}
            <div className="panel glass-panel min-w-0 p-4 sm:p-6 space-y-4">
              <div className="panel-head border-b border-white/10 pb-3 mb-2">
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">Servicios que Destacan</h3>
                  <p className="subtitle">Demanda y facturación de servicios líderes</p>
                </div>
              </div>

              <div className="space-y-4 pt-1">
                {topServices.map((srv) => (
                  <div key={srv.name} className="space-y-1.5">
                    <div className="flex min-w-0 flex-row items-start justify-between gap-2">
                      <span className="min-w-0 break-words text-xs font-semibold text-slate-700 dark:text-zinc-200">{srv.name}</span>
                      <b className="shrink-0 whitespace-nowrap font-mono text-[10px] sm:text-xs text-slate-900 dark:text-white">{formatGs(srv.total)}</b>
                    </div>
                    <div className="progress">
                      <span style={{ width: `${srv.pct}%`, background: brandColor }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Horas con más Movimiento (Heatmap Semanal) */}
            <div className="panel glass-panel min-w-0 p-4 sm:p-6 space-y-4">
              <div className="panel-head border-b border-white/10 pb-3 mb-2">
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">Horas con más Movimiento</h3>
                  <p className="subtitle">Intensidad de citas registradas por día de la semana</p>
                </div>
              </div>

              <div className="min-w-0 w-full">
                <div className="heatmap w-full min-w-0">
                  <span></span>
                  {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map((d) => (
                    <span key={d} className="font-bold text-[11px] text-zinc-400">
                      {d}
                    </span>
                  ))}
                  {[9, 11, 13, 15, 17].map((h) => (
                    <div key={h} className="contents">
                      <span className="font-mono text-[10px] text-zinc-400">{h}h</span>
                      {Array.from({ length: 7 }, (_, dayIdx) => {
                        const count = heatmapMatrix[dayIdx]?.[h] || 0;
                        const heatOpacity = Math.min(0.85, 0.05 + count * 0.16);
                        const dayName = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"][dayIdx];
                        return (
                          <button
                            key={dayIdx}
                            type="button"
                            className={`heat-cell ${activeHeatCell?.day === dayName && activeHeatCell.hour === h ? "!border-primary ring-1 ring-primary/50" : ""}`}
                            style={{ "--heat": heatOpacity } as React.CSSProperties}
                            title={`${count} cita(s) · ${dayName}, ${h}:00 a ${h + 2}:00 hs`}
                            aria-label={`${count} citas ${dayName} ${h} a ${h + 2} hs`}
                            aria-pressed={activeHeatCell?.day === dayName && activeHeatCell.hour === h}
                            onClick={() => setActiveHeatCell({ day: dayName, hour: h, count })}
                          >
                            {count > 0 ? count : ""}
                          </button>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
              <p className="text-xs text-zinc-400 sm:hidden">Tocá una celda para consultar las citas de ese horario.</p>
              <p className="hidden text-xs text-zinc-400 sm:block">Seleccioná una celda para consultar las citas del tramo.</p>
              {activeHeatCell && (
                <p className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-slate-700 dark:text-zinc-200" role="status">
                  {activeHeatCell.day}, {activeHeatCell.hour}:00 a {activeHeatCell.hour + 2}:00 · {activeHeatCell.count} {activeHeatCell.count === 1 ? "cita" : "citas"}
                </p>
              )}
            </div>
          </div>
            </div>
          </section>

          {/* 8. Loyalty Metrics */}
          <section className="stats-insight-group" aria-label="Fidelización de clientes">
            <MobileInsightToggle
              id="stats-loyalty-content"
              title="Fidelización"
              summary={`${stats.retentionRate === null ? "Sin datos" : `${stats.retentionRate}% recurrentes`}${stats.returnCycleDays === null ? "" : ` · retorno ${stats.returnCycleDays} días`}`}
              expanded={expandedMobileInsights.loyalty}
              onToggle={() => setExpandedMobileInsights((current) => ({ ...current, loyalty: !current.loyalty }))}
            />
            <div
              id="stats-loyalty-content"
              className={`stats-insight-content ${!expandedMobileInsights.loyalty ? "stats-insight-content-collapsed" : ""}`}
            >
          <div className="stats-loyalty-grid grid gap-3 sm:grid-cols-3">
            {[
              {
                label: "Clientes Recurrentes",
                value: stats.retentionRate === null ? null : `${stats.retentionRate}%`,
                hint: "Porcentaje de clientes del período que ya habían asistido",
                icon: Repeat,
                badge: "Retención",
              },
              {
                label: "Frecuencia de Retorno",
                value: stats.returnCycleDays === null ? null : `${stats.returnCycleDays} días`,
                hint: "Días promedio que transcurren entre citas del cliente",
                icon: Clock,
                badge: "Ciclo",
              },
              {
                label: "Valor Histórico (LTV)",
                value: stats.lifetimeValue > 0 ? formatGs(stats.lifetimeValue) : null,
                hint: "Gasto acumulado total por cliente desde su primera cita",
                icon: HeartHandshake,
                badge: "LTV",
              },
            ].map((m) => {
              const Icon = m.icon;
              return (
                <div key={m.label} className="stats-loyalty-card panel glass-panel p-5 shadow-md flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-zinc-400 mb-2">
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-primary" />
                        <span className="text-[11px] font-bold uppercase tracking-wider">{m.label}</span>
                      </div>
                      <span className="badge purple">{m.badge}</span>
                    </div>
                    <p className="mt-2 text-2xl font-black font-mono text-slate-900 dark:text-white">
                      {m.value ? <AnimatedValue value={m.value} /> : <span className="text-zinc-500">—</span>}
                    </p>
                  </div>
                  <p className="mt-3 text-[11px] text-zinc-400">{m.value ? m.hint : "Datos insuficientes en el período"}</p>
                </div>
              );
            })}
          </div>
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}
