"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  AlertCircle,
  Info,
  ShieldAlert,
  ArrowRight,
  Filter,
  CheckCircle2,
  Building2,
  Clock,
  ExternalLink,
} from "lucide-react";

export default function AlertsCenterPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [severityFilter, setSeverityFilter] = useState("ALL");

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/alerts");
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const filteredAlerts = data?.alerts?.filter((a: any) => {
    if (severityFilter === "ALL") return true;
    return a.severity === severityFilter;
  }) || [];

  return (
    <div className="p-3.5 sm:p-6 md:p-8 space-y-6 sm:space-y-8 max-w-7xl mx-auto w-full min-w-0 text-slate-100 overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6 text-amber-400 shrink-0" />
              <span>Centro de Alertas & Anomalías</span>
            </h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 shrink-0">
              Alert Intelligence
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Reglas automáticas de detección de inactividad, anomalías operativas y desconfiguraciones.
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 overflow-x-auto max-w-full shrink-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {[
            { label: "Todas", val: "ALL" },
            { label: "Críticas", val: "CRITICAL" },
            { label: "Advertencias", val: "WARNING" },
            { label: "Informativas", val: "INFO" },
          ].map((btn) => (
            <button
              key={btn.val}
              onClick={() => setSeverityFilter(btn.val)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition whitespace-nowrap shrink-0 ${
                severityFilter === btn.val
                  ? "bg-indigo-600 text-white shadow-sm font-semibold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary KPI Cards */}
      {data?.summary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
              <span>Total de Alertas</span>
              <AlertCircle className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-3xl font-extrabold text-white mt-2">{data.summary.total}</div>
            <div className="text-[11px] text-slate-500 mt-1">Condiciones evaluadas</div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center justify-between text-xs text-rose-400 font-medium">
              <span>Críticas</span>
              <ShieldAlert className="w-4 h-4 text-rose-400" />
            </div>
            <div className="text-3xl font-extrabold text-rose-400 mt-2">{data.summary.critical}</div>
            <div className="text-[11px] text-slate-500 mt-1">Requieren atención inmediata</div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center justify-between text-xs text-amber-400 font-medium">
              <span>Advertencias</span>
              <AlertTriangle className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-3xl font-extrabold text-amber-400 mt-2">{data.summary.warning}</div>
            <div className="text-[11px] text-slate-500 mt-1">Inactividad o configuración</div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center justify-between text-xs text-sky-400 font-medium">
              <span>Informativas</span>
              <Info className="w-4 h-4 text-sky-400" />
            </div>
            <div className="text-3xl font-extrabold text-sky-400 mt-2">{data.summary.info}</div>
            <div className="text-[11px] text-slate-500 mt-1">Hitos recientes cumplidos</div>
          </div>
        </div>
      )}

      {/* Alerts List */}
      <div className="space-y-3">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400">
            <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin mb-2" />
            <p className="text-xs font-mono">Evaluando reglas de anomalía...</p>
          </div>
        ) : filteredAlerts.length === 0 ? (
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-12 text-center text-slate-400 space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
            <div className="text-sm font-bold text-slate-200">No hay alertas en esta categoría</div>
            <p className="text-xs text-slate-500">Todos los negocios y procesos operan dentro de los parámetros esperados.</p>
          </div>
        ) : (
          filteredAlerts.map((alert: any) => (
            <div
              key={alert.id}
              className={`p-5 rounded-2xl border transition-all ${
                alert.severity === "CRITICAL"
                  ? "bg-rose-950/20 border-rose-800/40 hover:border-rose-700/60"
                  : alert.severity === "WARNING"
                  ? "bg-amber-950/20 border-amber-800/40 hover:border-amber-700/60"
                  : "bg-slate-900/80 border-slate-800 hover:border-slate-700"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className={`p-2 rounded-xl mt-0.5 shrink-0 ${
                    alert.severity === "CRITICAL"
                      ? "bg-rose-500/20 text-rose-400"
                      : alert.severity === "WARNING"
                      ? "bg-amber-500/20 text-amber-400"
                      : "bg-sky-500/20 text-sky-400"
                  }`}>
                    {alert.severity === "CRITICAL" ? (
                      <ShieldAlert className="w-5 h-5" />
                    ) : alert.severity === "WARNING" ? (
                      <AlertTriangle className="w-5 h-5" />
                    ) : (
                      <Info className="w-5 h-5" />
                    )}
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        alert.severity === "CRITICAL"
                          ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                          : alert.severity === "WARNING"
                          ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                          : "bg-sky-500/20 text-sky-300 border border-sky-500/30"
                      }`}>
                        {alert.severity}
                      </span>
                      <span className="text-xs font-mono text-slate-500">[{alert.category}]</span>
                      <h2 className="text-sm font-bold text-white">{alert.title}</h2>
                    </div>

                    <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                      {alert.reason}
                    </p>

                    {alert.tenantName && (
                      <div className="flex items-center gap-2 mt-2 text-[11px] text-slate-400">
                        <Building2 className="w-3.5 h-3.5 text-slate-500" />
                        <span>Negocio afectado:</span>
                        <span className="font-semibold text-slate-200">{alert.tenantName}</span>
                        <span className="font-mono text-slate-500">({alert.tenantSlug})</span>
                      </div>
                    )}
                  </div>
                </div>

                {alert.actionHref && (
                  <div className="self-end sm:self-center shrink-0">
                    <Link
                      href={alert.actionHref}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition border border-slate-700"
                    >
                      Inspeccionar <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
