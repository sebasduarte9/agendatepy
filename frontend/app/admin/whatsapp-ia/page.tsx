"use client";

import React, { useState, useEffect } from "react";
import {
  Bot,
  Zap,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldCheck,
  Send,
  Sparkles,
  Layers,
  ArrowRight,
  TrendingUp,
  Cpu,
  Smartphone,
  Check,
  RotateCcw,
} from "lucide-react";
import type { KeyStats, ChatAuditLog } from "@/lib/ai/gemini-pool";

export default function WhatsAppIaAdminPage() {
  const [loading, setLoading] = useState(true);
  const [testingPing, setTestingPing] = useState(false);
  const [data, setData] = useState<{
    summary: {
      totalKeys: number;
      activeKeys: number;
      totalRpm: number;
      maxRpm: number;
      totalToday: number;
      maxRpd: number;
      primaryModel: string;
    };
    keys: KeyStats[];
    auditLogs: ChatAuditLog[];
  } | null>(null);

  // Estado del simulador de prueba
  const [testMessage, setTestMessage] = useState("Hola, ¿tienen lugar mañana para corte con Diego?");
  const [testResult, setTestResult] = useState<any>(null);
  const [testingAi, setTestingAi] = useState(false);

  const fetchTelemetry = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/whatsapp-ia");
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (e) {
      console.error("Error al cargar telemetría:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTelemetry();
    // Auto-refresh cada 15 segundos
    const interval = setInterval(fetchTelemetry, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleTestAllKeys = async () => {
    try {
      setTestingPing(true);
      const res = await fetch("/api/admin/whatsapp-ia", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "ping" }),
      });
      if (res.ok) {
        const json = await res.json();
        setData((prev) => (prev ? { ...prev, keys: json.keys, summary: json.summary } : null));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setTestingPing(false);
    }
  };

  const handleRunAiSim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testMessage.trim() || testingAi) return;

    try {
      setTestingAi(true);
      setTestResult(null);
      const res = await fetch("/api/admin/whatsapp-ia/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: testMessage }),
      });
      if (res.ok) {
        const json = await res.json();
        setTestResult(json);
        fetchTelemetry(); // Actualizar contadores
      }
    } catch (e) {
      console.error(e);
    } finally {
      setTestingAi(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full min-w-0 text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                Clúster IA WhatsApp — Multi-Key
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  4 Cuentas Activas
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-400">
                Monitoreo en vivo de límites por minuto (RPM), consumo diario (RPD) y balanceo inteligente de Google AI Studio.
              </p>
            </div>
          </div>
        </div>

        {/* Acciones de Cabecera */}
        <div className="flex items-center gap-2">
          <button
            onClick={fetchTelemetry}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 font-medium transition cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Actualizar
          </button>
          <button
            onClick={handleTestAllKeys}
            disabled={testingPing}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-xs font-semibold text-white shadow-lg shadow-violet-600/20 transition cursor-pointer disabled:opacity-50"
          >
            <Zap className={`h-3.5 w-3.5 ${testingPing ? "animate-spin" : ""}`} />
            {testingPing ? "Testeando Claves..." : "Testear Claves en Vivo"}
          </button>
        </div>
      </div>

      {/* Tarjetas de Resumen General */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800/80 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Capacidad Pico (RPM)</span>
            <Zap className="h-3.5 w-3.5 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-white">
            {data?.summary?.totalRpm ?? 0}{" "}
            <span className="text-xs font-normal text-slate-400">/ {data?.summary?.maxRpm ?? 60} RPM</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-2">
            <div
              className="bg-amber-400 h-full rounded-full transition-all"
              style={{
                width: `${Math.min(100, (((data?.summary?.totalRpm ?? 0) / (data?.summary?.maxRpm || 60)) * 100))}%`,
              }}
            />
          </div>
          <p className="text-[11px] text-slate-400 mt-1">15 peticiones/min por cuenta</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800/80 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Peticiones Hoy (RPD)</span>
            <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white">
            {data?.summary?.totalToday ?? 0}{" "}
            <span className="text-xs font-normal text-slate-400">/ {data?.summary?.maxRpd ?? 6000}</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-2">
            <div
              className="bg-emerald-400 h-full rounded-full transition-all"
              style={{
                width: `${Math.min(100, (((data?.summary?.totalToday ?? 0) / (data?.summary?.maxRpd || 6000)) * 100))}%`,
              }}
            />
          </div>
          <p className="text-[11px] text-slate-400 mt-1">1.500 turnos gratis por cuenta</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800/80 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Salud del Clúster</span>
            <ShieldCheck className="h-3.5 w-3.5 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-white">
            {data?.summary?.activeKeys ?? 4}{" "}
            <span className="text-xs font-normal text-slate-400">/ {data?.summary?.totalKeys ?? 4} Online</span>
          </div>
          <div className="flex items-center gap-1.5 mt-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-emerald-400 font-medium">Failover automático activo</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Fallback transparente</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800/80 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Costo Total de Servidor</span>
            <Sparkles className="h-3.5 w-3.5 text-violet-400" />
          </div>
          <div className="text-2xl font-bold text-white">
            ₲ 0 <span className="text-xs font-normal text-slate-400">($0.00 USD)</span>
          </div>
          <div className="flex items-center gap-1.5 mt-2">
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-violet-500/20 text-violet-300">
              {data?.summary?.primaryModel || "gemini-3.1-flash-lite"}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">100% Gratuito en Google AI Studio</p>
        </div>
      </div>

      {/* Grid de las 4 Cuentas Individuales */}
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
          <Layers className="h-4 w-4 text-slate-400" />
          Estado Individual de las 4 Cuentas
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {(data?.keys || []).map((k) => {
            const rpmPercent = Math.min(100, (k.requestsThisMinute / k.limitRpm) * 100);
            const rpdPercent = Math.min(100, (k.requestsToday / k.limitRpd) * 100);

            return (
              <div
                key={k.id}
                className="p-4 rounded-xl bg-slate-900 border border-slate-800/90 flex flex-col justify-between space-y-4 hover:border-slate-700 transition"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-sm font-semibold text-white">{k.label}</div>
                      <div className="font-mono text-[11px] text-slate-400 mt-0.5">{k.maskedKey}</div>
                    </div>
                    {k.status === "active" ? (
                      <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                        Activa
                      </span>
                    ) : k.status === "cooldown" ? (
                      <span className="flex items-center gap-1 text-[11px] font-medium text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
                        <Clock className="h-3 w-3" />
                        Cooldown
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[11px] font-medium text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-full">
                        <AlertTriangle className="h-3 w-3" />
                        Error
                      </span>
                    )}
                  </div>

                  {/* Barras de Consumo */}
                  <div className="space-y-3 mt-4">
                    <div>
                      <div className="flex justify-between text-xs text-slate-300 mb-1">
                        <span>Límite Minuto</span>
                        <span className="font-semibold text-white">
                          {k.requestsThisMinute} / {k.limitRpm} RPM
                        </span>
                      </div>
                      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            rpmPercent > 80 ? "bg-rose-500" : rpmPercent > 50 ? "bg-amber-400" : "bg-blue-500"
                          }`}
                          style={{ width: `${Math.max(4, rpmPercent)}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs text-slate-300 mb-1">
                        <span>Consumo Diario</span>
                        <span className="font-semibold text-white">
                          {k.requestsToday} / {k.limitRpd}
                        </span>
                      </div>
                      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-emerald-500 h-full rounded-full transition-all"
                          style={{ width: `${Math.max(2, rpdPercent)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3 text-slate-400" />
                    <span>Ping: {k.lastPingMs ? `${k.lastPingMs}ms` : "—"}</span>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Éxitos: <span className="text-emerald-400 font-semibold">{k.successCount}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Simulador Interactivo de IA en Tiempo Real */}
      <div className="p-5 rounded-xl bg-slate-900 border border-slate-800/90 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-emerald-400" />
            <div>
              <h2 className="text-base font-semibold text-white">Simulador de Consulta de Cliente (WhatsApp)</h2>
              <p className="text-xs text-slate-400">
                Prueba cómo procesa el Clúster una consulta en lenguaje natural, qué clave responde y las herramientas de DB que ejecuta.
              </p>
            </div>
          </div>
          <span className="text-xs text-slate-400 hidden sm:inline">Prueba en vivo con Postgres</span>
        </div>

        <form onSubmit={handleRunAiSim} className="flex gap-2">
          <input
            type="text"
            value={testMessage}
            onChange={(e) => setTestMessage(e.target.value)}
            placeholder="Escribe como un cliente... Ej: ¿A qué hora tienen turno para corte fade?"
            className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
          />
          <button
            type="submit"
            disabled={testingAi}
            className="px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
          >
            {testingAi ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            <span>Consultar IA</span>
          </button>
        </form>

        {testResult && (
          <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-3 animate-in fade-in">
            <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-slate-800">
              <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                <Check className="h-3.5 w-3.5" />
                Respuesta generada en {testResult.latencyMs}ms
              </span>
              <span className="font-mono text-slate-400">Atendido por: {testResult.keyUsed}</span>
            </div>
            <div className="text-sm text-slate-200 whitespace-pre-line leading-relaxed">
              {testResult.replyText}
            </div>
            {testResult.actionPerformed && (
              <div className="text-xs text-violet-400 bg-violet-500/10 border border-violet-500/20 px-2.5 py-1.5 rounded inline-flex items-center gap-1.5">
                <Zap className="h-3 w-3" />
                Función ejecutada en Base de Datos: <span className="font-mono font-bold">{testResult.actionPerformed}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Registro de Auditoría en Vivo (Stream de Consultas de Clientes) */}
      <div className="p-5 rounded-xl bg-slate-900 border border-slate-800/90 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cpu className="h-5 w-5 text-violet-400" />
            <div>
              <h2 className="text-base font-semibold text-white">Auditoría en Vivo de Consultas de Clientes</h2>
              <p className="text-xs text-slate-400">
                Últimos mensajes entrantes de WhatsApp atendidos por el Clúster de Google AI Studio.
              </p>
            </div>
          </div>
          <span className="text-xs font-mono text-slate-400">
            {(data?.auditLogs || []).length} registros en memoria
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Hora</th>
                <th className="py-2.5 px-3">Cliente</th>
                <th className="py-2.5 px-3">Intención</th>
                <th className="py-2.5 px-3">Clave Usada</th>
                <th className="py-2.5 px-3">Latencia</th>
                <th className="py-2.5 px-3">Mensaje / Respuesta</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {(data?.auditLogs || []).length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-slate-500">
                    No hay consultas registradas aún. Haz una prueba con el simulador arriba.
                  </td>
                </tr>
              ) : (
                data?.auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-2.5 px-3 font-mono text-slate-400">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                    </td>
                    <td className="py-2.5 px-3 font-medium text-white">{log.clientPhone}</td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                          log.intent === "agenda"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : log.intent === "sipap_ocr"
                            ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                            : log.intent === "humano"
                            ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                            : "bg-slate-800 text-slate-300"
                        }`}
                      >
                        {log.intent === "sipap_ocr" ? "transferencia" : log.intent}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-violet-300">{log.keyUsed}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-400">{log.latencyMs}ms</td>
                    <td className="py-2.5 px-3 max-w-xs truncate text-slate-300" title={log.responseSummary}>
                      {log.responseSummary}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
