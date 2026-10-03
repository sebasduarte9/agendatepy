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
        <span className="px-2.5 py-1 rounded-lg text-xs font-bold font-mono bg-slate-800 text-slate-300 border border-slate-700">
          FREE
        </span>
      );
    }
    if (p === "EMPRESA" || p === "BUSINESS") {
      return (
        <span className="px-2.5 py-1 rounded-lg text-xs font-bold font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30">
          EMPRESA
        </span>
      );
    }
    // Default PRO / PROFESIONAL
    return (
      <span className="px-2.5 py-1 rounded-lg text-xs font-bold font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
        {p}
      </span>
    );
  };

  const saas = data?.saasOverview;

  return (
    <div className="p-3.5 sm:p-6 md:p-8 space-y-6 sm:space-y-8 max-w-7xl mx-auto w-full min-w-0 text-slate-100 overflow-hidden">
      {/* Header & Quick Search */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <Building2 className="h-5 w-5 sm:h-6 sm:w-6 text-indigo-500 shrink-0" />
              <span>Platform Admin • Centro de Cuentas</span>
            </h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 shrink-0">
              SaaS Admin
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Control central de negocios, distribución de planes de cuenta y actividad de la plataforma AgendatePY.
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
              placeholder="Buscar negocio por nombre/slug..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 w-full sm:w-64 transition"
            />
          </form>

          {/* Period selector */}
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 overflow-x-auto max-w-full [scrollbar-width:none] [&::-webkit-scrollbar]:hidden shrink-0">
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
                className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium transition whitespace-nowrap shrink-0 ${
                  period === p.val
                    ? "bg-indigo-600 text-white shadow-sm font-semibold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-950/40 border border-red-800/60 text-red-300 text-sm flex items-center gap-3">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center text-slate-400 space-y-3">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-mono tracking-wider uppercase text-slate-500">
            Cargando estado de cuentas desde PostgreSQL...
          </p>
        </div>
      ) : data ? (
        <>
          {/* Top SaaS Metrics Grid (The Core 2-Second Question) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Negocios Registrados */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 shadow-xl relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Negocios Totales
                </span>
                <div className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  <Building2 className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-black text-white">{saas?.totalTenants || 0}</span>
                <span className="text-xs text-emerald-400 font-semibold">
                  +{saas?.newTenantsInPeriod || 0} en período
                </span>
              </div>
              <div className="mt-2 text-xs text-slate-500 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                <span>Directorio oficial AgendatePY</span>
              </div>
            </div>

            {/* Negocios FREE */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 shadow-xl relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Cuentas FREE
                </span>
                <div className="p-2.5 rounded-2xl bg-slate-800 text-slate-300 border border-slate-700">
                  <Layers className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-200">{saas?.freeTenantsCount || 0}</span>
                <span className="text-xs text-slate-400 font-mono font-bold">
                  {saas?.percentages?.free || 0}% del total
                </span>
              </div>
              <div className="mt-2 text-xs text-slate-500">
                Planes gratuitos o básicos sin suscripción
              </div>
            </div>

            {/* Negocios de Pago (PRO / PROFESIONAL) */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 shadow-xl relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Cuentas de Pago
                </span>
                <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <CreditCard className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-black text-emerald-400">{saas?.paidTenantsCount || 0}</span>
                <span className="text-xs text-emerald-400 font-mono font-bold">
                  {saas?.percentages?.paid || 0}% del total
                </span>
              </div>
              <div className="mt-2 text-xs text-slate-500">
                Planes Profesional / Pro / Empresa
              </div>
            </div>

            {/* Estado Operativo (Activos vs Inactivos) */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 shadow-xl relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Estado Operativo
                </span>
                <div className="p-2.5 rounded-2xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
                  <Activity className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-black text-sky-400">{saas?.activeTenantsCount || 0}</span>
                <span className="text-xs text-slate-400 font-medium">
                  activos / {saas?.inactiveTenantsCount || 0} inactivos
                </span>
              </div>
              <div className="mt-2 text-xs text-slate-500">
                {saas?.pausedTenantsCount || 0} cuentas en pausa o suspendidas
              </div>
            </div>
          </div>

          {/* Plan Distribution Bar & Quick Summary Card */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-indigo-400" />
                  Distribución de Planes de Cuenta
                </h2>
                <p className="text-xs text-slate-400">
                  Composición de la base instalada de negocios por nivel de plan en PostgreSQL.
                </p>
              </div>
              <Link
                href="/admin/negocios"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition"
              >
                Abrir Directorio Completo <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Multi-segment Progress Bar */}
            <div className="w-full h-3 rounded-full bg-slate-950 overflow-hidden flex border border-slate-800">
              <div
                style={{ width: `${Math.max(0, saas?.percentages?.free || 0)}%` }}
                className="bg-slate-600 transition-all duration-500"
                title={`FREE: ${saas?.freeTenantsCount || 0}`}
              />
              <div
                style={{ width: `${Math.max(0, saas?.percentages?.paid || 0)}%` }}
                className="bg-indigo-500 transition-all duration-500"
                title={`PAID: ${saas?.paidTenantsCount || 0}`}
              />
              {saas?.percentages?.trial > 0 && (
                <div
                  style={{ width: `${saas.percentages.trial}%` }}
                  className="bg-amber-500 transition-all duration-500"
                  title={`TRIAL: ${saas?.trialTenantsCount || 0}`}
                />
              )}
            </div>

            {/* Plan Breakdown Chips */}
            <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
              {Object.entries(saas?.planBreakdown || {}).map(([planName, count]) => {
                const countNum = count as number;
                const total = saas?.totalTenants || 1;
                const pct = Math.round((countNum / total) * 100);
                return (
                  <div
                    key={planName}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/70 border border-slate-800/90"
                  >
                    {getPlanBadge(planName)}
                    <span className="font-bold text-white">{countNum}</span>
                    <span className="text-slate-500 text-[11px] font-mono">({pct}%)</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Directory Preview: Recent Tenants Table */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-indigo-400" />
                  Negocios Registrados Recientemente
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Últimos negocios incorporados a la plataforma con su respectivo tipo de cuenta.
                </p>
              </div>

              <Link
                href="/admin/negocios"
                className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-500 shadow-md shadow-indigo-600/30 transition flex items-center gap-1.5 self-start sm:self-auto shrink-0"
              >
                <span>Directorio Completo</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[650px]">
                <thead>
                  <tr className="border-b border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    <th className="py-3 px-3">Negocio</th>
                    <th className="py-3 px-3">Plan / Cuenta</th>
                    <th className="py-3 px-3">Estado</th>
                    <th className="py-3 px-3 text-center">Servicios</th>
                    <th className="py-3 px-3 text-center">Citas</th>
                    <th className="py-3 px-3">Fecha de Registro</th>
                    <th className="py-3 px-3 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-xs">
                  {saas?.recentTenants?.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-500">
                        No hay negocios registrados aún.
                      </td>
                    </tr>
                  ) : (
                    saas?.recentTenants?.map((t: any) => (
                      <tr key={t.id} className="hover:bg-slate-800/30 transition group">
                        <td className="py-3 px-3">
                          <Link
                            href={`/admin/negocios/${t.id}`}
                            className="font-semibold text-slate-100 group-hover:text-indigo-300 transition"
                          >
                            {t.name}
                          </Link>
                          <div className="text-[11px] text-slate-500 font-mono">/{t.slug}</div>
                        </td>
                        <td className="py-3 px-3">{getPlanBadge(t.plan)}</td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                            {t.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center font-mono text-slate-300">
                          {t.servicesCount}
                        </td>
                        <td className="py-3 px-3 text-center font-mono font-bold text-white">
                          {t.appointmentsCount}
                        </td>
                        <td className="py-3 px-3 text-slate-400 font-mono text-[11px]">
                          {new Date(t.createdAt).toLocaleDateString("es-PY")}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <Link
                            href={`/admin/negocios/${t.id}`}
                            className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-slate-800 text-indigo-300 hover:bg-indigo-600 hover:text-white transition text-xs font-semibold"
                          >
                            <span>Ver Detalle</span>
                            <ChevronRight className="w-3 h-3" />
                          </Link>
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
