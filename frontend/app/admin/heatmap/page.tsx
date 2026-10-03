"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Flame,
  MousePointer,
  Scroll,
  Move,
  Monitor,
  Smartphone,
  Tablet,
  Calendar,
  Layers,
  Info,
  AlertCircle,
  Eye,
  Activity,
  ExternalLink,
  ChevronDown,
  Building2,
  PieChart,
} from "lucide-react";
import CustomSelect from "@/components/dashboard/ui/CustomSelect";

interface HeatmapData {
  ok: boolean;
  period: string;
  tenantId: string;
  pagePath: string;
  deviceType: string;
  stats: {
    totalSessions: number;
    totalClicks: number;
    totalMoves: number;
    totalScrolls: number;
    avgScrollDepth: number;
    scrollDistribution: {
      "0-25": number;
      "25-50": number;
      "50-75": number;
      "75-100": number;
    };
    deviceBreakdown: {
      desktop: number;
      mobile: number;
      tablet: number;
    };
  };
  availablePages: Array<{ path: string; count: number }>;
  topElements: Array<{ tag: string; selector: string; text: string; count: number }>;
  clickPoints: Array<{
    x: number;
    y: number;
    normX: number;
    normY: number;
    viewportWidth?: number;
    viewportHeight?: number;
    elementSelector?: string;
    elementTag?: string;
    elementText?: string;
  }>;
  movePoints: Array<{
    x: number;
    y: number;
    normX: number;
    normY: number;
  }>;
}

export default function WebHeatmapAdminPage() {
  const [mode, setMode] = useState<"click" | "scroll" | "move">("click");
  const [period, setPeriod] = useState<string>("30d");
  const [deviceType, setDeviceType] = useState<string>("all");
  const [tenantId, setTenantId] = useState<string>("ALL");
  const [pagePath, setPagePath] = useState<string>("all");
  const [tenants, setTenants] = useState<Array<{ id: string; name: string }>>([]);
  const [data, setData] = useState<HeatmapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPoint, setSelectedPoint] = useState<any>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Load tenants list
  useEffect(() => {
    async function loadTenantsList() {
      try {
        const res = await fetch("/api/admin/tenants?limit=100");
        if (res.ok) {
          const json = await res.json();
          setTenants(json.data || []);
        }
      } catch (e) {
        // silent
      }
    }
    loadTenantsList();
  }, []);

  // Fetch Web Heatmap data
  const fetchHeatmap = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams({
        period,
        tenantId,
        pagePath,
        deviceType,
      });

      const res = await fetch(`/api/admin/heatmap?${params.toString()}`);
      if (!res.ok) {
        throw new Error("No se pudo cargar la analítica del mapa de calor web.");
      }
      const json = await res.json();
      setData(json);

      // Auto select first page if pagePath is all and pages exist
      if (pagePath === "all" && json.availablePages && json.availablePages.length > 0) {
        // Keep pagePath as all or let user switch
      }
    } catch (err: any) {
      setError(err.message || "Error al cargar datos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHeatmap();
  }, [period, tenantId, pagePath, deviceType]);

  // Render Canvas for Click / Move Heatmap
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !data) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    if (mode === "click") {
      // Draw Clicks as radial heat gradients
      const points = data.clickPoints || [];
      points.forEach((pt) => {
        const px = pt.normX * width;
        const py = Math.min(Math.max(pt.normY * height, 20), height - 20);

        const radius = deviceType === "mobile" ? 28 : 22;
        const radGrad = ctx.createRadialGradient(px, py, 2, px, py, radius);
        radGrad.addColorStop(0, "rgba(239, 68, 68, 0.85)"); // bright red
        radGrad.addColorStop(0.35, "rgba(245, 158, 11, 0.65)"); // amber
        radGrad.addColorStop(0.7, "rgba(59, 130, 246, 0.4)"); // blue
        radGrad.addColorStop(1, "rgba(59, 130, 246, 0)");

        ctx.fillStyle = radGrad;
        ctx.beginPath();
        ctx.arc(px, py, radius, 0, Math.PI * 2);
        ctx.fill();

        // Small white center dot
        ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
        ctx.beginPath();
        ctx.arc(px, py, 2.5, 0, Math.PI * 2);
        ctx.fill();
      });
    } else if (mode === "move") {
      // Draw Mouse Movements as glowing cyan/emerald path points
      const points = data.movePoints || [];
      points.forEach((pt) => {
        const px = pt.normX * width;
        const py = Math.min(Math.max(pt.normY * height, 15), height - 15);

        const radius = 14;
        const radGrad = ctx.createRadialGradient(px, py, 1, px, py, radius);
        radGrad.addColorStop(0, "rgba(6, 182, 212, 0.6)");
        radGrad.addColorStop(0.5, "rgba(16, 185, 129, 0.3)");
        radGrad.addColorStop(1, "rgba(16, 185, 129, 0)");

        ctx.fillStyle = radGrad;
        ctx.beginPath();
        ctx.arc(px, py, radius, 0, Math.PI * 2);
        ctx.fill();
      });
    }
  }, [data, mode, deviceType]);

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full min-w-0 text-slate-100">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-white tracking-tight flex items-center gap-2">
            <Flame className="h-5 w-5 text-slate-400 shrink-0" />
            <span>Web Heatmap</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Visualización analítica de clics, profundidad de scroll y movimiento de usuarios.
          </p>
        </div>

        {/* Global Filters */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Tenant Selector */}
          <CustomSelect
            value={tenantId}
            onChange={(val) => setTenantId(val)}
            options={[
              { value: "ALL", label: "Todos los Negocios" },
              ...tenants.map((t) => ({ value: t.id, label: t.name })),
            ]}
            buttonClassName="bg-slate-900 border-slate-800 text-slate-300 min-w-[170px]"
          />

          {/* Page Selector */}
          <CustomSelect
            value={pagePath}
            onChange={(val) => setPagePath(val)}
            options={[
              { value: "all", label: "Todas las Páginas" },
              ...(data?.availablePages?.map((p) => ({
                value: p.path,
                label: p.path,
                badge: `${p.count} ses`,
              })) || []),
            ]}
            buttonClassName="bg-slate-900 border-slate-800 text-slate-300 font-mono min-w-[170px]"
          />

          {/* Device Filter */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-xs">
            <button
              onClick={() => setDeviceType("all")}
              className={`px-2.5 py-1 rounded-md transition ${
                deviceType === "all" ? "bg-slate-800 text-white font-medium" : "text-slate-400 hover:text-white"
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setDeviceType("desktop")}
              className={`px-2 py-1 rounded-md flex items-center gap-1 transition ${
                deviceType === "desktop" ? "bg-slate-800 text-white font-medium" : "text-slate-400 hover:text-white"
              }`}
              title="Desktop"
            >
              <Monitor className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setDeviceType("mobile")}
              className={`px-2 py-1 rounded-md flex items-center gap-1 transition ${
                deviceType === "mobile" ? "bg-slate-800 text-white font-medium" : "text-slate-400 hover:text-white"
              }`}
              title="Mobile"
            >
              <Smartphone className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Period Selector */}
          <CustomSelect
            value={period}
            onChange={(val) => setPeriod(val)}
            options={[
              { value: "7d", label: "Últimos 7 días" },
              { value: "30d", label: "Últimos 30 días" },
              { value: "90d", label: "Últimos 90 días" },
            ]}
            buttonClassName="bg-slate-900 border-slate-800 text-slate-300 min-w-[140px]"
          />
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Sesiones Analizadas</span>
            <Activity className="w-4 h-4 text-slate-500" />
          </div>
          <div className="text-2xl font-semibold text-white tracking-tight tabular-nums mt-1">
            {data?.stats?.totalSessions?.toLocaleString("es-PY") || 0}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Visitantes rastreados</div>
        </div>

        <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Clics Totales</span>
            <MousePointer className="w-4 h-4 text-slate-500" />
          </div>
          <div className="text-2xl font-semibold text-white tracking-tight tabular-nums mt-1">
            {data?.stats?.totalClicks?.toLocaleString("es-PY") || 0}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            {data?.stats?.totalSessions
              ? ((data.stats.totalClicks / data.stats.totalSessions) || 0).toFixed(1)
              : 0}{" "}
            clics/sesión
          </div>
        </div>

        <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Profundidad Scroll</span>
            <Scroll className="w-4 h-4 text-slate-500" />
          </div>
          <div className="text-2xl font-semibold text-white tracking-tight tabular-nums mt-1">
            {data?.stats?.avgScrollDepth || 0}%
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Promedio de lectura</div>
        </div>

        <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Dispositivos</span>
            <Monitor className="w-4 h-4 text-slate-500" />
          </div>
          <div className="text-sm font-semibold text-white mt-2 flex items-center gap-3">
            <span className="flex items-center gap-1 text-xs text-slate-300">
              <Monitor className="w-3.5 h-3.5 text-slate-400" />
              {data?.stats?.deviceBreakdown?.desktop || 0}
            </span>
            <span className="flex items-center gap-1 text-xs text-slate-300">
              <Smartphone className="w-3.5 h-3.5 text-slate-400" />
              {data?.stats?.deviceBreakdown?.mobile || 0}
            </span>
            <span className="flex items-center gap-1 text-xs text-slate-300">
              <Tablet className="w-3.5 h-3.5 text-slate-400" />
              {data?.stats?.deviceBreakdown?.tablet || 0}
            </span>
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Desktop / Mobile / Tablet</div>
        </div>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 gap-2 overflow-x-auto">
        <div className="flex items-center gap-0.5 bg-slate-900 p-0.5 rounded-lg border border-slate-800 shrink-0">
          <button
            onClick={() => setMode("click")}
            className={`px-3 py-1.5 rounded-md text-xs transition flex items-center gap-1.5 ${
              mode === "click"
                ? "bg-slate-800 text-white font-medium"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <MousePointer className="w-3.5 h-3.5" />
            <span>Clics</span>
          </button>

          <button
            onClick={() => setMode("scroll")}
            className={`px-3 py-1.5 rounded-md text-xs transition flex items-center gap-1.5 ${
              mode === "scroll"
                ? "bg-slate-800 text-white font-medium"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Scroll className="w-3.5 h-3.5" />
            <span>Scroll</span>
          </button>

          <button
            onClick={() => setMode("move")}
            className={`px-3 py-1.5 rounded-md text-xs transition flex items-center gap-1.5 ${
              mode === "move"
                ? "bg-slate-800 text-white font-medium"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Move className="w-3.5 h-3.5" />
            <span>Movimiento</span>
          </button>
        </div>

        {/* Legend */}
        <div className="hidden lg:flex items-center gap-2 text-[11px] text-slate-400 font-mono bg-slate-900/60 px-3 py-1 rounded-lg border border-slate-800">
          <span>Intensidad:</span>
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" /> Frío
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block ml-1.5" /> Medio
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block ml-1.5" /> Caliente
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-950/20 border border-rose-900/40 text-rose-300 text-xs flex items-center gap-2.5">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Heatmap Visual Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Visual Page Representation with Overlay Layer */}
        <div className="lg:col-span-2 bg-slate-900/40 border border-slate-800/80 rounded-xl p-4 md:p-6 relative overflow-hidden flex flex-col items-center">
          {/* Browser Top Bar Mock */}
          <div className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl px-4 py-2.5 mb-4 flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-500/70" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500/70" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/70" />
              </div>
              <span className="ml-3 font-mono text-[11px] text-slate-400 truncate max-w-[280px]">
                {pagePath === "all" ? "agendatepy.com/[tenant]/reservar" : `agendatepy.com${pagePath}`}
              </span>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-mono bg-slate-800/80 px-2 py-0.5 rounded-md text-slate-300">
              {deviceType.toUpperCase()} MODE
            </div>
          </div>

          {/* Interactive Mock Frame with Canvas Overlay */}
          <div
            className={`relative rounded-2xl border border-slate-800/90 bg-slate-900 overflow-hidden shadow-inner transition-all duration-300 ${
              deviceType === "mobile"
                ? "w-full max-w-[360px] min-h-[500px] sm:min-h-[640px]"
                : "w-full min-h-[500px] sm:min-h-[600px] max-w-[760px]"
            }`}
          >
            {/* Background Page Representation (Booking Page Mock Layout) */}
            <div className="p-6 space-y-6 select-none opacity-85 pointer-events-none">
              {/* Business Header Mock */}
              <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-300 font-black text-lg">
                  AP
                </div>
                <div>
                  <div className="h-4 w-32 bg-slate-700 rounded mb-1.5 animate-pulse" />
                  <div className="h-3 w-48 bg-slate-800 rounded" />
                </div>
              </div>

              {/* Service Selection Cards Mock */}
              <div className="space-y-3">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  1. Seleccionar Servicio
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl border border-indigo-500/30 bg-indigo-950/20">
                    <div className="h-3.5 w-24 bg-indigo-400/50 rounded mb-1" />
                    <div className="h-3 w-16 bg-slate-700 rounded" />
                  </div>
                  <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/50">
                    <div className="h-3.5 w-28 bg-slate-700 rounded mb-1" />
                    <div className="h-3 w-16 bg-slate-800 rounded" />
                  </div>
                </div>
              </div>

              {/* Staff / Professional Mock */}
              <div className="space-y-3">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  2. Profesional
                </div>
                <div className="flex gap-2">
                  <div className="flex items-center gap-2 p-2 rounded-xl border border-slate-800 bg-slate-900/40">
                    <div className="w-7 h-7 rounded-full bg-slate-700" />
                    <div className="h-3 w-16 bg-slate-700 rounded" />
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-xl border border-slate-800 bg-slate-900/40">
                    <div className="w-7 h-7 rounded-full bg-slate-700" />
                    <div className="h-3 w-16 bg-slate-700 rounded" />
                  </div>
                </div>
              </div>

              {/* Calendar & Time Slots Mock */}
              <div className="space-y-3">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  3. Fecha y Hora
                </div>
                <div className="grid grid-cols-4 gap-2">
                  <div className="h-8 rounded-lg bg-indigo-600/40 border border-indigo-500/40 flex items-center justify-center text-[10px] text-indigo-200 font-mono">
                    09:00
                  </div>
                  <div className="h-8 rounded-lg bg-slate-800/60 flex items-center justify-center text-[10px] text-slate-400 font-mono">
                    10:00
                  </div>
                  <div className="h-8 rounded-lg bg-slate-800/60 flex items-center justify-center text-[10px] text-slate-400 font-mono">
                    11:00
                  </div>
                  <div className="h-8 rounded-lg bg-slate-800/60 flex items-center justify-center text-[10px] text-slate-400 font-mono">
                    14:00
                  </div>
                </div>
              </div>

              {/* Confirmation Button Mock */}
              <div className="pt-4 border-t border-slate-800">
                <div className="w-full h-11 rounded-xl bg-indigo-600 border border-indigo-500 flex items-center justify-center text-xs font-bold text-white shadow-lg shadow-indigo-600/30">
                  Confirmar Reserva
                </div>
              </div>
            </div>

            {/* OVERLAY LAYER 1: Scroll Depth Mode */}
            {mode === "scroll" && (
              <div className="absolute inset-0 pointer-events-none flex flex-col justify-between">
                {/* 100% Scroll top band */}
                <div className="h-1/4 bg-rose-500/30 border-b border-rose-500/50 flex items-center justify-between px-4 text-xs font-bold text-rose-200">
                  <span>100% Visitantes alcanzaron esta sección</span>
                  <span className="font-mono bg-rose-950/80 px-2 py-0.5 rounded border border-rose-500/40">
                    0 - 25% Scroll
                  </span>
                </div>
                {/* 75% Scroll band */}
                <div className="h-1/4 bg-amber-500/25 border-b border-amber-500/40 flex items-center justify-between px-4 text-xs font-bold text-amber-200">
                  <span>
                    {data?.stats?.scrollDistribution
                      ? Math.round(
                          ((data.stats.scrollDistribution["25-50"] +
                            data.stats.scrollDistribution["50-75"] +
                            data.stats.scrollDistribution["75-100"]) /
                            (data.stats.totalScrolls || 1)) *
                            100
                        )
                      : 85}
                    % continuaron bajando
                  </span>
                  <span className="font-mono bg-amber-950/80 px-2 py-0.5 rounded border border-amber-500/40">
                    25 - 50%
                  </span>
                </div>
                {/* 50% Scroll band */}
                <div className="h-1/4 bg-emerald-500/20 border-b border-emerald-500/40 flex items-center justify-between px-4 text-xs font-bold text-emerald-200">
                  <span>
                    {data?.stats?.scrollDistribution
                      ? Math.round(
                          ((data.stats.scrollDistribution["50-75"] +
                            data.stats.scrollDistribution["75-100"]) /
                            (data.stats.totalScrolls || 1)) *
                            100
                        )
                      : 60}
                    % llegaron al selector de horario
                  </span>
                  <span className="font-mono bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/40">
                    50 - 75%
                  </span>
                </div>
                {/* 25% Scroll bottom band */}
                <div className="h-1/4 bg-blue-500/20 flex items-center justify-between px-4 text-xs font-bold text-blue-200">
                  <span>
                    {data?.stats?.scrollDistribution
                      ? Math.round(
                          (data.stats.scrollDistribution["75-100"] /
                            (data.stats.totalScrolls || 1)) *
                            100
                        )
                      : 35}
                    % llegaron al botón de confirmación
                  </span>
                  <span className="font-mono bg-blue-950/80 px-2 py-0.5 rounded border border-blue-500/40">
                    75 - 100%
                  </span>
                </div>
              </div>
            )}

            {/* OVERLAY LAYER 2: Canvas for Click / Move */}
            {(mode === "click" || mode === "move") && (
              <canvas
                ref={canvasRef}
                width={760}
                height={600}
                className="absolute inset-0 w-full h-full pointer-events-none z-10"
              />
            )}
          </div>

          {/* Canvas Subtitle Status */}
          <div className="mt-4 flex items-center gap-4 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              Rastreo activo de eventos normalizados
            </span>
            <span>•</span>
            <span>{data?.clickPoints?.length || 0} clics renderizados en la vista actual</span>
          </div>
        </div>

        {/* Right Sidebar: Top Clicked Elements & Scroll Distribution */}
        <div className="space-y-4">
          {/* Top Clicked Elements */}
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
              <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                <MousePointer className="w-4 h-4 text-slate-400" />
                Elementos Más Clickeados
              </h2>
              <span className="text-[11px] font-mono text-slate-500">Top 10</span>
            </div>

            {loading ? (
              <div className="py-8 text-center text-xs text-slate-500">Cargando elementos...</div>
            ) : data?.topElements && data.topElements.length > 0 ? (
              <div className="space-y-2">
                {data.topElements.map((el, idx) => {
                  const pct = data.stats.totalClicks
                    ? Math.round((el.count / data.stats.totalClicks) * 100)
                    : 0;
                  return (
                    <div
                      key={idx}
                      className="p-2 rounded-lg bg-slate-900/80 border border-slate-800/60 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px] border border-slate-700/60">
                            &lt;{el.tag}&gt;
                          </span>
                          <span className="font-medium text-slate-200 truncate">
                            {el.text || el.selector || "Elemento sin texto"}
                          </span>
                        </div>
                        {el.selector && (
                          <div className="text-[10px] font-mono text-slate-500 truncate mt-0.5">
                            {el.selector}
                          </div>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        <div className="font-semibold text-white tabular-nums">{el.count} clics</div>
                        <div className="text-[10px] font-mono text-slate-400">{pct}%</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-slate-500">
                No hay suficientes clics registrados en este período.
              </div>
            )}
          </div>

          {/* Scroll Distribution Card */}
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
              <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                <Scroll className="w-4 h-4 text-slate-400" />
                Retención por Nivel de Scroll
              </h2>
            </div>

            <div className="space-y-3 text-xs">
              {[
                { range: "0% - 25% (Header / Inicio)", key: "0-25", color: "bg-rose-500" },
                { range: "25% - 50% (Servicios)", key: "25-50", color: "bg-amber-500" },
                { range: "50% - 75% (Calendario)", key: "50-75", color: "bg-emerald-500" },
                { range: "75% - 100% (Confirmación)", key: "75-100", color: "bg-blue-500" },
              ].map((item) => {
                const count = (data?.stats?.scrollDistribution as any)?.[item.key] || 0;
                const total = data?.stats?.totalScrolls || 1;
                const pct = Math.round((count / total) * 100);
                return (
                  <div key={item.key} className="space-y-1">
                    <div className="flex justify-between text-slate-400">
                      <span>{item.range}</span>
                      <span className="font-mono text-white font-bold">{pct}% ({count})</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
                      <div
                        className={`h-full ${item.color} rounded-full transition-all duration-500`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
