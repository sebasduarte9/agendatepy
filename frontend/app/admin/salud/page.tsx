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
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full min-w-0 text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-white tracking-tight flex items-center gap-2">
            <Cpu className="h-5 w-5 text-slate-400 shrink-0" />
            <span>Salud del Sistema</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Monitoreo de tasa de error, códigos HTTP y disponibilidad de endpoints.
          </p>
        </div>

        {/* Period Selector */}
        <div className="flex items-center gap-2 overflow-x-auto max-w-full shrink-0">
          <div className="flex items-center gap-0.5 bg-slate-900 p-0.5 rounded-lg border border-slate-800">
            {[
              { label: "7d", val: "7d" },
              { label: "30d", val: "30d" },
              { label: "90d", val: "90d" },
              { label: "Todo", val: "all" },
            ].map((p) => (
              <button
                key={p.val}
                onClick={() => setPeriod(p.val)}
                className={`px-2.5 py-1 rounded-md text-xs transition whitespace-nowrap ${
                  period === p.val
                    ? "bg-slate-800 text-white font-medium"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <button
            onClick={fetchHealth}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 transition cursor-pointer shrink-0"
            title="Recargar telemetría"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Main Health Status Banner */}
      {data && (
        <div className="p-4 sm:p-5 rounded-xl border border-slate-800/80 bg-slate-900/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-9 h-9 rounded-lg bg-slate-800 border border-slate-700/70 flex items-center justify-center text-slate-300 shrink-0">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${
                  data.errorRate < 2 ? "bg-emerald-400" : data.errorRate < 5 ? "bg-amber-400" : "bg-rose-400"
                }`} />
                <span className="text-sm font-semibold text-white">
                  {data.errorRate < 2 ? "Sistema Saludable" : data.errorRate < 5 ? "Degradación Menor" : "Incidencias Detectadas"}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Tasa de error: {data.errorRate}% sobre {data.totalMonitoredRequests} eventos monitorizados.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6 self-start md:self-auto border-t md:border-t-0 md:border-l border-slate-800/80 pt-3 md:pt-0 md:pl-6">
            <div>
              <div className="text-[11px] text-slate-500 font-mono">Error Rate</div>
              <div className="text-xl font-semibold font-mono text-white tabular-nums">{data.errorRate}%</div>
            </div>
            <div>
              <div className="text-[11px] text-slate-500 font-mono">Total Errores</div>
              <div className="text-xl font-semibold font-mono text-slate-200 tabular-nums">{data.errors.total}</div>
            </div>
          </div>
        </div>
      )}

      {/* HTTP Status Breakdown Cards */}
      {data?.errors && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: "401 Unauthorized", count: data.errors.http401, desc: "Sesión / Auth" },
            { label: "403 Forbidden", count: data.errors.http403, desc: "RBAC denegado" },
            { label: "404 Not Found", count: data.errors.http404, desc: "Ruta o ID inexistente" },
            { label: "409 Conflict", count: data.errors.http409, desc: "Slot tomado / Concurrencia" },
            { label: "500 Server Error", count: data.errors.http500, desc: "Excepciones de servidor" },
            { label: "Validation Errors", count: data.errors.validationErrors, desc: "Payloads inválidos" },
          ].map((item) => (
            <div
              key={item.label}
              className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-3.5 flex flex-col justify-between"
            >
              <div className="text-xs text-slate-400 truncate font-medium">{item.label}</div>
              <div className="my-2">
                <div className="text-xl font-semibold font-mono text-white tabular-nums">{item.count}</div>
              </div>
              <div className="text-[10px] text-slate-500 truncate">{item.desc}</div>
            </div>
          ))}
        </div>
      )}

      {/* Endpoint Breakdown & Recent Errors Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Endpoints Error Breakdown */}
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-4 sm:p-5 space-y-3">
          <div>
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <Server className="w-4 h-4 text-slate-400" />
              Errores por Endpoint API
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Distribución de incidencias registradas por ruta de la API.
            </p>
          </div>

          <div className="divide-y divide-slate-800/60 pt-1">
            {!data?.endpointBreakdown || data.endpointBreakdown.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs">
                <CheckCircle2 className="w-5 h-5 text-emerald-500/50 mx-auto mb-1.5" />
                No se registraron errores en endpoints durante el período seleccionado.
              </div>
            ) : (
              data.endpointBreakdown.map((ep: any) => (
                <div key={ep.endpoint} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-mono text-xs text-slate-200">{ep.endpoint}</div>
                    <div className="text-[11px] text-slate-500">
                      Códigos: {JSON.stringify(ep.statusCodes)}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-xs text-slate-300 bg-slate-800 px-2 py-0.5 rounded border border-slate-700/60">
                      {ep.totalErrors} errores
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Error Feed */}
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-4 sm:p-5 space-y-3">
          <div>
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-slate-400" />
              Últimos Eventos de Error
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Registro cronológico de excepciones operacionales.
            </p>
          </div>

          <div className="divide-y divide-slate-800/60 pt-1 max-h-96 overflow-y-auto pr-1">
            {!data?.recentErrors || data.recentErrors.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs">
                <CheckCircle2 className="w-5 h-5 text-emerald-500/50 mx-auto mb-1.5" />
                Sin eventos de error recientes.
              </div>
            ) : (
              data.recentErrors.map((err: any) => (
                <div key={err.id} className="py-2.5 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono text-slate-300">{err.event}</span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {new Date(err.createdAt).toLocaleTimeString("es-PY")}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Endpoint: <span className="font-mono text-slate-300">{err.entityId || "N/A"}</span>
                  </div>
                  {err.metadata?.message && (
                    <div className="text-[11px] text-slate-400 font-mono bg-slate-950 p-1.5 rounded border border-slate-800/80">
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
