"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Building2,
  Users,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Search,
  Shield,
  Layers,
  Activity,
  CalendarCheck,
  Coins,
  ChevronRight,
  ExternalLink,
} from "lucide-react";

export default function SaaSAdminOverviewPage() {
  const [period, setPeriod] = useState<string>("30d");
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchOverview = async (selectedPeriod: string) => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/admin/overview?period=${selectedPeriod}`);
      if (!res.ok) {
        throw new Error("No se pudo cargar el resumen de la plataforma.");
      }
      const json = await res.json();
      setData(json);
    } catch (err: any) {
      setError(err.message || "Error al conectar con la API de administración.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview(period);
  }, [period]);

  const formatGs = (val: number) => {
    return new Intl.NumberFormat("es-PY", {
      style: "currency",
      currency: "PYG",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const getPlanBadge = (plan: string) => {
    const p = (plan || "PROFESIONAL").toUpperCase();
    if (p === "FREE" || p === "GRATUITO") {
      return (
        <span className="px-2 py-0.5 rounded text-[11px] font-mono font-medium text-slate-600 bg-slate-100 border border-slate-200">
          FREE
        </span>
      );
    }
    if (p === "EMPRESA" || p === "BUSINESS") {
      return (
        <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold text-purple-700 bg-purple-50 border border-purple-200">
          EMPRESA
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold text-[#FF4F2B] bg-orange-50 border border-orange-200">
        {p}
      </span>
    );
  };

  const saas = data?.saasOverview;

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full min-w-0 text-slate-900">
      {/* Header & Quick Search */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Building2 className="h-6 w-6 text-[#FF4F2B] shrink-0" />
            <span>Centro de Cuentas</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Supervisión central de negocios, distribución de planes y actividad operacional.
          </p>
        </div>

        {/* Global Search & Filters */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full lg:w-auto">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (searchTerm.trim()) {
                window.location.href = `/admin/negocios?search=${encodeURIComponent(searchTerm.trim())}`;
              }
            }}
            className="relative w-full sm:w-auto flex-1 sm:flex-initial"
          >
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar negocio por nombre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white border border-slate-200/80 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#FF4F2B] focus:ring-1 focus:ring-[#FF4F2B]/20 w-full sm:w-64 transition shadow-2xs"
            />
          </form>

          {/* Period selector */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/80 shrink-0">
            {[
              { label: "7d", val: "7d" },
              { label: "30d", val: "30d" },
              { label: "90d", val: "90d" },
              { label: "1 año", val: "365d" },
              { label: "Todo", val: "all" },
            ].map((p) => (
              <button
                key={p.val}
                onClick={() => setPeriod(p.val)}
                className={`px-2.5 py-1 rounded-lg text-xs transition whitespace-nowrap cursor-pointer ${
                  period === p.val
                    ? "bg-white text-slate-900 font-bold shadow-2xs border border-slate-200/60"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2.5">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400 space-y-2">
          <div className="w-6 h-6 border-2 border-[#FF4F2B] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-500">Cargando estado de la plataforma...</p>
        </div>
      ) : data ? (
        <>
          {/* Top SaaS Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* Total Negocios Registrados */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all duration-200 flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
                <span>Negocios Totales</span>
                <div className="h-8 w-8 rounded-lg bg-orange-50 flex items-center justify-center text-[#FF4F2B]">
                  <Building2 className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-slate-900 tracking-tight tabular-nums">
                  {saas?.totalTenants || 0}
                </span>
                {saas?.newTenantsInPeriod > 0 && (
                  <span className="text-xs text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full font-bold border border-emerald-200/60">
                    +{saas?.newTenantsInPeriod} en período
                  </span>
                )}
              </div>
              <div className="mt-2 text-[11px] text-slate-400">
                Directorio registrado
              </div>
            </div>

            {/* Negocios FREE */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all duration-200 flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
                <span>Cuentas FREE</span>
                <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
                  <Layers className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-slate-900 tracking-tight tabular-nums">
                  {saas?.freeTenantsCount || 0}
                </span>
                <span className="text-xs text-slate-500 font-mono font-semibold">
                  {saas?.percentages?.free || 0}%
                </span>
              </div>
              <div className="mt-2 text-[11px] text-slate-400">
                Planes gratuitos o básicos
              </div>
            </div>

            {/* Negocios de Pago */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all duration-200 flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
                <span>Cuentas de Pago</span>
                <div className="h-8 w-8 rounded-lg bg-orange-50 flex items-center justify-center text-[#FF4F2B]">
                  <CreditCard className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-slate-900 tracking-tight tabular-nums">
                  {saas?.paidTenantsCount || 0}
                </span>
                <span className="text-xs text-[#FF4F2B] font-mono font-bold">
                  {saas?.percentages?.paid || 0}%
                </span>
              </div>
              <div className="mt-2 text-[11px] text-slate-400">
                Profesional o Empresa
              </div>
            </div>

            {/* Estado Operativo */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all duration-200 flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
                <span>Estado Operativo</span>
                <div className="h-8 w-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                  <Activity className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-slate-900 tracking-tight tabular-nums">
                  {saas?.activeTenantsCount || 0}
                </span>
                <span className="text-xs text-slate-500">
                  activos / {saas?.inactiveTenantsCount || 0} inactivos
                </span>
              </div>
              <div className="mt-2 text-[11px] text-slate-400">
                {saas?.pausedTenantsCount || 0} en pausa
              </div>
            </div>
          </div>

          {/* Plan Distribution Bar & Quick Summary Card */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  Distribución de Planes
                </h2>
                <p className="text-xs text-slate-500">
                  Composición de cuentas registradas por nivel de suscripción.
                </p>
              </div>
              <Link
                href="/admin/negocios"
                className="inline-flex items-center gap-1 text-xs text-[#FF4F2B] hover:underline font-semibold transition"
              >
                Directorio completo <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {/* Subtle Progress Bar */}
            <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden flex border border-slate-200/80">
              <div
                style={{ width: `${Math.max(0, saas?.percentages?.free || 0)}%` }}
                className="bg-slate-300 transition-all duration-300"
                title={`FREE: ${saas?.freeTenantsCount || 0}`}
              />
              <div
                style={{ width: `${Math.max(0, saas?.percentages?.paid || 0)}%` }}
                className="bg-[#FF4F2B] transition-all duration-300"
                title={`PAID: ${saas?.paidTenantsCount || 0}`}
              />
              {saas?.percentages?.trial > 0 && (
                <div
                  style={{ width: `${saas.percentages.trial}%` }}
                  className="bg-amber-400 transition-all duration-300"
                  title={`TRIAL: ${saas?.trialTenantsCount || 0}`}
                />
              )}
            </div>

            {/* Plan Breakdown Chips */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
              {Object.entries(saas?.planBreakdown || {}).map(([planName, count]) => {
                const countNum = count as number;
                const total = saas?.totalTenants || 1;
                const pct = Math.round((countNum / total) * 100);
                return (
                  <div
                    key={planName}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-50 border border-slate-200/80 text-xs shadow-2xs"
                  >
                    {getPlanBadge(planName)}
                    <span className="font-bold text-slate-900">{countNum}</span>
                    <span className="text-slate-400 text-[11px] font-mono">({pct}%)</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Directory Preview: Recent Tenants Table */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  Negocios Registrados Recientemente
                </h2>
                <p className="text-xs text-slate-500">
                  Últimas incorporaciones al sistema y su estado actual.
                </p>
              </div>

              <Link
                href="/admin/negocios"
                className="text-xs text-[#FF4F2B] hover:underline font-semibold transition flex items-center gap-1 shrink-0"
              >
                <span>Ver todos</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    <th className="py-2.5 px-3">Negocio</th>
                    <th className="py-2.5 px-3">Plan</th>
                    <th className="py-2.5 px-3">Estado</th>
                    <th className="py-2.5 px-3 text-center">Servicios</th>
                    <th className="py-2.5 px-3 text-center">Citas</th>
                    <th className="py-2.5 px-3">Fecha</th>
                    <th className="py-2.5 px-3 text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {saas?.recentTenants?.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-6 text-center text-slate-400">
                        No hay negocios registrados aún.
                      </td>
                    </tr>
                  ) : (
                    saas?.recentTenants?.map((t: any) => (
                      <tr
                        key={t.id}
                        onClick={() => window.location.href = `/admin/negocios/${t.id}`}
                        className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                      >
                        <td className="py-3 px-3">
                          <Link
                            href={`/admin/negocios/${t.id}`}
                            onClick={(e) => e.stopPropagation()}
                            className="font-bold text-slate-900 group-hover:text-[#FF4F2B] transition-colors"
                          >
                            {t.name}
                          </Link>
                          <div className="text-[11px] text-slate-400 font-mono">/{t.slug}</div>
                        </td>
                        <td className="py-3 px-3">{getPlanBadge(t.plan)}</td>
                        <td className="py-3 px-3">
                          <span className="text-[11px] font-mono text-slate-600 font-medium">
                            {t.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center font-mono text-slate-600">
                          {t.servicesCount}
                        </td>
                        <td className="py-3 px-3 text-center font-mono font-bold text-slate-900">
                          {t.appointmentsCount}
                        </td>
                        <td className="py-3 px-3 text-slate-400 font-mono text-[11px]">
                          {new Date(t.createdAt).toLocaleDateString("es-PY")}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#FF4F2B] transition-colors inline-block" />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
