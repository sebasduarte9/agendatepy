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
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full min-w-0 text-slate-900">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <AlertTriangle className="h-6 w-6 text-[#FF4F2B] shrink-0" />
            <span>Centro de Alertas</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Detección automática de inactividad, anomalías operacionales y desconfiguraciones.
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/80 overflow-x-auto max-w-full shrink-0">
          {[
            { label: "Todas", val: "ALL" },
            { label: "Críticas", val: "CRITICAL" },
            { label: "Advertencias", val: "WARNING" },
            { label: "Informativas", val: "INFO" },
          ].map((btn) => (
            <button
              key={btn.val}
              onClick={() => setSeverityFilter(btn.val)}
              className={`px-3 py-1.5 rounded-lg text-xs transition whitespace-nowrap shrink-0 ${
                severityFilter === btn.val
                  ? "bg-white text-slate-900 font-bold shadow-xs border border-slate-200/60"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary KPI Cards */}
      {data?.summary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
              <span>Total de Alertas</span>
              <AlertCircle className="w-4 h-4 text-[#FF4F2B]" />
            </div>
            <div className="text-2xl font-bold text-[#FF4F2B] tracking-tight tabular-nums mt-2">
              {data.summary.total}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Condiciones evaluadas</div>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
              <span>Críticas</span>
              <ShieldAlert className="w-4 h-4 text-rose-500" />
            </div>
            <div className="text-2xl font-bold text-rose-600 tracking-tight tabular-nums mt-2">
              {data.summary.critical}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Requieren atención inmediata</div>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
              <span>Advertencias</span>
              <AlertTriangle className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl font-bold text-amber-600 tracking-tight tabular-nums mt-2">
              {data.summary.warning}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Inactividad o config</div>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
              <span>Informativas</span>
              <Info className="w-4 h-4 text-blue-500" />
            </div>
            <div className="text-2xl font-bold text-slate-800 tracking-tight tabular-nums mt-2">
              {data.summary.info}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Hitos cumplidos</div>
          </div>
        </div>
      )}

      {/* Alerts List */}
      <div className="space-y-3">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400 space-y-2">
            <div className="w-6 h-6 border-2 border-[#FF4F2B] border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-slate-500">Evaluando reglas de anomalía...</p>
          </div>
        ) : filteredAlerts.length === 0 ? (
          <div className="bg-white border border-slate-200/80 rounded-2xl p-12 text-center text-slate-500 space-y-2 shadow-xs">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto opacity-80" />
            <div className="text-sm font-bold text-slate-900">No hay alertas en esta categoría</div>
            <p className="text-xs text-slate-500">Todos los negocios y procesos operan dentro de los parámetros esperados.</p>
          </div>
        ) : (
          filteredAlerts.map((alert: any) => (
            <div
              key={alert.id}
              className="p-5 rounded-2xl border border-slate-200/80 bg-white hover:border-orange-200 hover:shadow-xs transition"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="mt-0.5 shrink-0">
                    {alert.severity === "CRITICAL" ? (
                      <div className="w-8 h-8 rounded-xl bg-rose-50 border border-rose-200/80 flex items-center justify-center text-rose-600">
                        <ShieldAlert className="w-4 h-4" />
                      </div>
                    ) : alert.severity === "WARNING" ? (
                      <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200/80 flex items-center justify-center text-amber-600">
                        <AlertTriangle className="w-4 h-4" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200/80 flex items-center justify-center text-blue-600">
                        <Info className="w-4 h-4" />
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-lg border ${
                        alert.severity === "CRITICAL"
                          ? "bg-rose-50 text-rose-700 border-rose-200"
                          : alert.severity === "WARNING"
                          ? "bg-amber-50 text-amber-700 border-amber-200"
                          : "bg-slate-100 text-slate-700 border-slate-200"
                      }`}>
                        {alert.severity}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400">{alert.category}</span>
                      <h2 className="text-sm font-bold text-slate-900">{alert.title}</h2>
                    </div>

                    <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                      {alert.reason}
                    </p>

                    {alert.tenantName && (
                      <div className="flex items-center gap-2 mt-2.5 text-xs text-slate-500">
                        <Building2 className="w-3.5 h-3.5 text-[#FF4F2B]" />
                        <span>Negocio:</span>
                        <span className="font-semibold text-slate-800">{alert.tenantName}</span>
                        <span className="font-mono text-slate-400">({alert.tenantSlug})</span>
                      </div>
                    )}
                  </div>
                </div>

                {alert.actionHref && (
                  <div className="self-end sm:self-center shrink-0">
                    <Link
                      href={alert.actionHref}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-[#FF4F2B] hover:border-orange-200 transition px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-orange-50 border border-slate-200 shadow-2xs"
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
