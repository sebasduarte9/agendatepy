"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Cpu,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ShieldAlert,
  Server,
  Activity,
  ArrowRight,
  Clock,
  RefreshCw,
} from "lucide-react";

export default function SystemHealthPage() {
  const [period, setPeriod] = useState("30d");
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  const fetchHealth = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/health?period=${period}`);
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
    fetchHealth();
  }, [period]);

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-white tracking-tight">Salud del Sistema & Telemetría</h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              System Health
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Monitoreo de tasa de error, códigos HTTP, conflictos de agendamiento y disponibilidad de endpoints.
          </p>
        </div>

        {/* Period Selector */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
            {[
              { label: "7d", val: "7d" },
              { label: "30d", val: "30d" },
              { label: "90d", val: "90d" },
              { label: "Todo", val: "all" },
            ].map((p) => (
              <button
                key={p.val}
                onClick={() => setPeriod(p.val)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  period === p.val
                    ? "bg-indigo-600 text-white shadow-sm font-semibold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <button
            onClick={fetchHealth}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition"
            title="Recargar telemetría"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Main Health Status Banner */}
      {data && (
        <div className={`p-6 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-4 ${
          data.errorRate < 2
            ? "bg-emerald-950/20 border-emerald-800/40 text-emerald-300"
            : data.errorRate < 5
            ? "bg-amber-950/20 border-amber-800/40 text-amber-300"
            : "bg-red-950/20 border-red-800/40 text-red-300"
        }`}>
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-2xl ${
              data.errorRate < 2 ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"
            }`}>
              <Cpu className="w-8 h-8" />
            </div>
            <div>
              <div className="text-xs font-mono uppercase tracking-wider font-bold opacity-80">
                Estado Operativo de Plataforma
              </div>
              <div className="text-2xl font-black text-white mt-0.5">
                {data.errorRate < 2 ? "SISTEMA SALUDABLE" : data.errorRate < 5 ? "DEGRADACIÓN MENOR" : "INCIDENCIAS DETECTADAS"}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Tasa global de error calculada en {data.errorRate}% sobre {data.totalMonitoredRequests} eventos/requests monitorizados.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6 self-start md:self-auto border-t md:border-t-0 md:border-l border-slate-800 pt-4 md:pt-0 md:pl-6">
            <div>
              <div className="text-[11px] text-slate-400 font-mono">Error Rate</div>
              <div className="text-2xl font-bold font-mono text-white">{data.errorRate}%</div>
            </div>
            <div>
              <div className="text-[11px] text-slate-400 font-mono">Total Errores</div>
              <div className="text-2xl font-bold font-mono text-rose-400">{data.errors.total}</div>
            </div>
          </div>
        </div>
      )}

      {/* HTTP Status Breakdown Cards */}
      {data?.errors && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: "401 Unauthorized", count: data.errors.http401, desc: "Sesión / Auth", color: "text-amber-400" },
            { label: "403 Forbidden", count: data.errors.http403, desc: "RBAC denegado", color: "text-orange-400" },
            { label: "404 Not Found", count: data.errors.http404, desc: "Ruta o ID inexistente", color: "text-slate-300" },
            { label: "409 Conflict", count: data.errors.http409, desc: "Slot tomado / Concurrencia", color: "text-purple-400" },
            { label: "500 Server Error", count: data.errors.http500, desc: "Excepciones de servidor", color: "text-red-400" },
            { label: "Validation Errors", count: data.errors.validationErrors, desc: "Payloads inválidos", color: "text-sky-400" },
          ].map((item) => (
            <div
              key={item.label}
              className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col justify-between"
            >
              <div className="text-xs font-semibold text-slate-400 truncate">{item.label}</div>
              <div className="my-2">
                <div className={`text-2xl font-bold font-mono ${item.color}`}>{item.count}</div>
              </div>
              <div className="text-[10px] text-slate-500 truncate">{item.desc}</div>
            </div>
          ))}
        </div>
      )}

      {/* Endpoint Breakdown & Recent Errors Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Endpoints Error Breakdown */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Server className="w-4 h-4 text-indigo-400" />
            Errores por Endpoint API
          </h2>
          <p className="text-xs text-slate-400">
            Distribución de incidencias registradas por ruta de la API.
          </p>

          <div className="divide-y divide-slate-800/80 pt-2">
            {!data?.endpointBreakdown || data.endpointBreakdown.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs">
                <CheckCircle2 className="w-6 h-6 text-emerald-500/40 mx-auto mb-2" />
                No se registraron errores en endpoints durante el período seleccionado.
              </div>
            ) : (
              data.endpointBreakdown.map((ep: any) => (
                <div key={ep.endpoint} className="py-3 flex items-center justify-between">
                  <div>
                    <div className="font-mono text-xs font-semibold text-slate-200">{ep.endpoint}</div>
                    <div className="text-[11px] text-slate-500">
                      Códigos: {JSON.stringify(ep.statusCodes)}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-xs font-bold text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-lg border border-rose-500/20">
                      {ep.totalErrors} errores
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Error Feed */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-rose-400" />
            Últimos Eventos de Error
          </h2>
          <p className="text-xs text-slate-400">
            Registro cronológico de excepciones y fallas operacionales sanitizadas.
          </p>

          <div className="divide-y divide-slate-800/80 pt-2 max-h-96 overflow-y-auto pr-1">
            {!data?.recentErrors || data.recentErrors.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs">
                <CheckCircle2 className="w-6 h-6 text-emerald-500/40 mx-auto mb-2" />
                Sin eventos de error recientes.
              </div>
            ) : (
              data.recentErrors.map((err: any) => (
                <div key={err.id} className="py-3 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono font-bold text-rose-400">{err.event}</span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {new Date(err.createdAt).toLocaleTimeString("es-PY")}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Endpoint / Entidad: <span className="font-mono text-slate-300">{err.entityId || "N/A"}</span>
                  </div>
                  {err.metadata?.message && (
                    <div className="text-[11px] text-slate-500 font-mono bg-slate-950 p-1.5 rounded border border-slate-800/80">
                      {err.metadata.message}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
