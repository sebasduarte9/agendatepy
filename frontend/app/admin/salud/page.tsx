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
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full min-w-0 text-slate-900">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Cpu className="h-6 w-6 text-[#FF4F2B] shrink-0" />
            <span>Salud del Sistema</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Monitoreo de tasa de error, códigos HTTP y disponibilidad de endpoints en tiempo real.
          </p>
        </div>

        {/* Period Selector */}
        <div className="flex items-center gap-2 overflow-x-auto max-w-full shrink-0">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/80">
            {[
              { label: "7d", val: "7d" },
              { label: "30d", val: "30d" },
              { label: "90d", val: "90d" },
              { label: "Todo", val: "all" },
            ].map((p) => (
              <button
                key={p.val}
                onClick={() => setPeriod(p.val)}
                className={`px-3 py-1.5 rounded-lg text-xs transition whitespace-nowrap ${
                  period === p.val
                    ? "bg-white text-slate-900 font-bold shadow-xs border border-slate-200/60"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <button
            onClick={fetchHealth}
            className="p-2 rounded-xl bg-white border border-slate-200/80 text-slate-600 hover:text-slate-900 hover:border-slate-300 transition shadow-xs cursor-pointer shrink-0"
            title="Recargar telemetría"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-[#FF4F2B]" : ""}`} />
          </button>
        </div>
      </div>

      {/* Main Health Status Banner */}
      {data && (
        <div className="p-5 sm:p-6 rounded-2xl border border-slate-200/80 bg-white shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-orange-50 border border-orange-200/80 flex items-center justify-center text-[#FF4F2B] shrink-0">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${
                  data.errorRate < 2 ? "bg-emerald-500 shadow-xs shadow-emerald-500/40" : data.errorRate < 5 ? "bg-amber-500" : "bg-rose-500"
                }`} />
                <span className="text-base font-bold text-slate-900">
                  {data.errorRate < 2 ? "Sistema Saludable" : data.errorRate < 5 ? "Degradación Menor" : "Incidencias Detectadas"}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Tasa de error global: <span className="font-semibold text-slate-800">{data.errorRate}%</span> sobre {data.totalMonitoredRequests} eventos monitorizados.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-8 self-start md:self-auto border-t md:border-t-0 md:border-l border-slate-100 pt-3 md:pt-0 md:pl-8">
            <div>
              <div className="text-[11px] uppercase tracking-wider font-bold text-slate-400">Error Rate</div>
              <div className="text-2xl font-bold font-mono text-[#FF4F2B] tabular-nums mt-0.5">{data.errorRate}%</div>
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-wider font-bold text-slate-400">Total Errores</div>
              <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums mt-0.5">{data.errors.total}</div>
            </div>
          </div>
        </div>
      )}

      {/* HTTP Status Breakdown Cards */}
      {data?.errors && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
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
              className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs flex flex-col justify-between hover:border-orange-200 transition"
            >
              <div className="text-xs font-semibold text-slate-600 truncate">{item.label}</div>
              <div className="my-2.5">
                <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">{item.count}</div>
              </div>
              <div className="text-[11px] text-slate-400 truncate">{item.desc}</div>
            </div>
          ))}
        </div>
      )}

      {/* Endpoint Breakdown & Recent Errors Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Endpoints Error Breakdown */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Server className="w-4 h-4 text-[#FF4F2B]" />
              Errores por Endpoint API
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Distribución de incidencias registradas por ruta de la API.
            </p>
          </div>

          <div className="divide-y divide-slate-100 pt-1">
            {!data?.endpointBreakdown || data.endpointBreakdown.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-2 opacity-80" />
                No se registraron errores en endpoints durante el período seleccionado.
              </div>
            ) : (
              data.endpointBreakdown.map((ep: any) => (
                <div key={ep.endpoint} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-mono text-xs font-semibold text-slate-900">{ep.endpoint}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Códigos: {JSON.stringify(ep.statusCodes)}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-xs font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200/80">
                      {ep.totalErrors} errores
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Error Feed */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#FF4F2B]" />
              Últimos Eventos de Error
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Registro cronológico de excepciones operacionales.
            </p>
          </div>

          <div className="divide-y divide-slate-100 pt-1 max-h-96 overflow-y-auto pr-1">
            {!data?.recentErrors || data.recentErrors.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-2 opacity-80" />
                Sin eventos de error recientes.
              </div>
            ) : (
              data.recentErrors.map((err: any) => (
                <div key={err.id} className="py-3 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono font-semibold text-slate-800">{err.event}</span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(err.createdAt).toLocaleTimeString("es-PY")}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Endpoint: <span className="font-mono text-slate-700 font-medium">{err.entityId || "N/A"}</span>
                  </div>
                  {err.metadata?.message && (
                    <div className="text-[11px] text-slate-700 font-mono bg-slate-50 p-2 rounded-xl border border-slate-200/80">
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
