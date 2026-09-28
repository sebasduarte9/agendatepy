"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  Calendar,
  Layers,
  AlertCircle,
  TrendingUp,
  CheckCircle2,
  Clock,
} from "lucide-react";

export default function AdminCohortsPage() {
  const [cohorts, setCohorts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCohorts() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch("/api/admin/cohortes");
        if (!res.ok) {
          throw new Error("No se pudieron obtener las cohortes de plataforma.");
        }
        const json = await res.json();
        setCohorts(json.cohorts || []);
      } catch (err: any) {
        setError(err.message || "Error al conectar con la API de cohortes.");
      } finally {
        setLoading(false);
      }
    }
    fetchCohorts();
  }, []);

  const renderRetentionCell = (milestone: any) => {
    if (!milestone || !milestone.available || milestone.rate === null) {
      return (
        <span className="text-[10px] text-slate-500 bg-slate-950/60 px-2 py-0.5 rounded border border-slate-800">
          Aún no disponible
        </span>
      );
    }
    return (
      <div className="font-mono text-xs">
        <span className="font-bold text-indigo-300">{milestone.rate}%</span>
        <span className="text-[10px] text-slate-500 ml-1">
          ({milestone.retainedCount}/{milestone.eligibleCount})
        </span>
      </div>
    );
  };

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Users className="h-6 w-6 text-indigo-400" />
            Cohortes & Retención Operativa (D7 - D90)
          </h1>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
            Fase 5.9
          </span>
        </div>
        <p className="text-sm text-slate-400 mt-1">
          Seguimiento de activación y retención real según mes de registro. Milestones no alcanzados indican honestamente su estado.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-950/40 border border-red-800/60 text-red-300 text-sm flex items-center gap-3">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Cohorts Table */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/70 text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                <th className="py-3.5 px-4">Cohorte</th>
                <th className="py-3.5 px-3 text-center">Registrados</th>
                <th className="py-3.5 px-3 text-center">Configurados</th>
                <th className="py-3.5 px-3 text-center">Ready</th>
                <th className="py-3.5 px-3 text-center">1ª Reserva</th>
                <th className="py-3.5 px-3 text-center">1er Cobro</th>
                <th className="py-3.5 px-3 text-center">D7</th>
                <th className="py-3.5 px-3 text-center">D14</th>
                <th className="py-3.5 px-3 text-center">D30</th>
                <th className="py-3.5 px-3 text-center">D60</th>
                <th className="py-3.5 px-3 text-center">D90</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={11} className="py-16 text-center text-slate-500 font-sans">
                    <div className="h-6 w-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Analizando cohortes históricas...
                  </td>
                </tr>
              ) : cohorts.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-slate-500 font-sans">
                    No hay datos de cohortes registrados.
                  </td>
                </tr>
              ) : (
                cohorts.map((c) => (
                  <tr key={c.month} className="hover:bg-slate-800/30 transition">
                    <td className="py-3.5 px-4 font-bold text-slate-200 font-mono">
                      {c.month}
                    </td>
                    <td className="py-3.5 px-3 text-center text-white font-bold font-mono">
                      {c.registeredCount}
                    </td>
                    <td className="py-3.5 px-3 text-center text-slate-300 font-mono">
                      {c.configuredCount}
                    </td>
                    <td className="py-3.5 px-3 text-center text-emerald-400 font-mono font-semibold">
                      {c.readyForBookingCount || 0}
                    </td>
                    <td className="py-3.5 px-3 text-center text-indigo-400 font-mono font-semibold">
                      {c.firstBookingCount}
                    </td>
                    <td className="py-3.5 px-3 text-center text-sky-400 font-mono font-semibold">
                      {c.firstCashCount}
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      {renderRetentionCell(c.d7)}
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      {renderRetentionCell(c.d14)}
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      {renderRetentionCell(c.d30)}
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      {renderRetentionCell(c.d60)}
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      {renderRetentionCell(c.d90)}
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
