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
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full min-w-0 text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-white tracking-tight flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-slate-400 shrink-0" />
            <span>Centro de Alertas</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Detección automática de inactividad, anomalías operacionales y desconfiguraciones.
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center gap-0.5 bg-slate-900 p-0.5 rounded-lg border border-slate-800 overflow-x-auto max-w-full shrink-0">
          {[
            { label: "Todas", val: "ALL" },
            { label: "Críticas", val: "CRITICAL" },
            { label: "Advertencias", val: "WARNING" },
            { label: "Informativas", val: "INFO" },
          ].map((btn) => (
            <button
              key={btn.val}
              onClick={() => setSeverityFilter(btn.val)}
              className={`px-2.5 py-1 rounded-md text-xs transition whitespace-nowrap shrink-0 ${
                severityFilter === btn.val
                  ? "bg-slate-800 text-white font-medium"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary KPI Cards */}
      {data?.summary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-4">
            <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
              <span>Total de Alertas</span>
              <AlertCircle className="w-4 h-4 text-slate-500" />
            </div>
            <div className="text-2xl font-semibold text-white tracking-tight tabular-nums mt-2">
              {data.summary.total}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Condiciones evaluadas</div>
          </div>

          <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-4">
            <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
              <span>Críticas</span>
              <ShieldAlert className="w-4 h-4 text-rose-400/80" />
            </div>
            <div className="text-2xl font-semibold text-rose-300 tracking-tight tabular-nums mt-2">
              {data.summary.critical}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Requieren atención</div>
          </div>

          <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-4">
            <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
              <span>Advertencias</span>
              <AlertTriangle className="w-4 h-4 text-amber-400/80" />
            </div>
            <div className="text-2xl font-semibold text-amber-300 tracking-tight tabular-nums mt-2">
              {data.summary.warning}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Inactividad o config</div>
          </div>

          <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-4">
            <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
              <span>Informativas</span>
              <Info className="w-4 h-4 text-slate-500" />
            </div>
            <div className="text-2xl font-semibold text-slate-300 tracking-tight tabular-nums mt-2">
              {data.summary.info}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Hitos cumplidos</div>
          </div>
        </div>
      )}

      {/* Alerts List */}
      <div className="space-y-2.5">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400 space-y-2">
            <div className="w-6 h-6 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-slate-500">Evaluando reglas de anomalía...</p>
          </div>
        ) : filteredAlerts.length === 0 ? (
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-12 text-center text-slate-400 space-y-2">
            <CheckCircle2 className="w-6 h-6 text-emerald-500/50 mx-auto" />
            <div className="text-sm font-semibold text-slate-200">No hay alertas en esta categoría</div>
            <p className="text-xs text-slate-500">Todos los negocios y procesos operan dentro de los parámetros esperados.</p>
          </div>
        ) : (
          filteredAlerts.map((alert: any) => (
            <div
              key={alert.id}
              className="p-4 sm:p-5 rounded-xl border border-slate-800/80 bg-slate-900/40 hover:bg-slate-900/60 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 shrink-0">
                    {alert.severity === "CRITICAL" ? (
                      <ShieldAlert className="w-4 h-4 text-rose-400" />
                    ) : alert.severity === "WARNING" ? (
                      <AlertTriangle className="w-4 h-4 text-amber-400" />
                    ) : (
                      <Info className="w-4 h-4 text-slate-400" />
                    )}
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                        alert.severity === "CRITICAL"
                          ? "bg-rose-500/10 text-rose-300 border-rose-500/20"
                          : alert.severity === "WARNING"
                          ? "bg-amber-500/10 text-amber-300 border-amber-500/20"
                          : "bg-slate-800 text-slate-400 border-slate-700/60"
                      }`}>
                        {alert.severity}
                      </span>
                      <span className="text-[11px] font-mono text-slate-500">{alert.category}</span>
                      <h2 className="text-sm font-semibold text-white">{alert.title}</h2>
                    </div>

                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      {alert.reason}
                    </p>

                    {alert.tenantName && (
                      <div className="flex items-center gap-1.5 mt-2 text-[11px] text-slate-500">
                        <Building2 className="w-3.5 h-3.5 text-slate-500" />
                        <span>Negocio:</span>
                        <span className="font-medium text-slate-300">{alert.tenantName}</span>
                        <span className="font-mono text-slate-500">({alert.tenantSlug})</span>
                      </div>
                    )}
                  </div>
                </div>

                {alert.actionHref && (
                  <div className="self-end sm:self-center shrink-0">
                    <Link
                      href={alert.actionHref}
                      className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-white transition px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800"
                    >
                      Inspeccionar <ArrowRight className="w-3 h-3" />
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
