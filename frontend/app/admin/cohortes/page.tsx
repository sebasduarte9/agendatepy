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
        <span className="text-[11px] text-slate-300 font-mono">
          —
        </span>
      );
    }
    return (
      <div className="font-mono text-xs">
        <span className="font-bold text-slate-900">{milestone.rate}%</span>
        <span className="text-[10px] text-slate-400 ml-1">
          ({milestone.retainedCount}/{milestone.eligibleCount})
        </span>
      </div>
    );
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full min-w-0 text-slate-900">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
          <Users className="h-6 w-6 text-[#FF4F2B] shrink-0" />
          <span>Cohortes & Retención Operativa (D7 - D90)</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Seguimiento de activación y retención real según mes de registro.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-3">
          <AlertCircle className="h-5 w-5 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Cohorts Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs min-w-[780px]">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="py-3.5 px-5">Cohorte</th>
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
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={11} className="py-16 text-center text-slate-400 font-sans">
                    <div className="h-6 w-6 border-2 border-[#FF4F2B] border-t-transparent rounded-full animate-spin mx-auto mb-2.5" />
                    Analizando cohortes históricas...
                  </td>
                </tr>
              ) : cohorts.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-16 text-center text-slate-400 font-sans">
                    No hay datos de cohortes registrados.
                  </td>
                </tr>
              ) : (
                cohorts.map((c) => (
                  <tr key={c.month} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-5 font-semibold text-slate-900 font-mono">
                      {c.month}
                    </td>
                    <td className="py-3.5 px-3 text-center text-[#FF4F2B] font-bold font-mono tabular-nums">
                      {c.registeredCount}
                    </td>
                    <td className="py-3.5 px-3 text-center text-slate-700 font-mono tabular-nums">
                      {c.configuredCount}
                    </td>
                    <td className="py-3.5 px-3 text-center text-slate-700 font-mono tabular-nums">
                      {c.readyForBookingCount || 0}
                    </td>
                    <td className="py-3.5 px-3 text-center text-slate-700 font-mono tabular-nums">
                      {c.firstBookingCount}
                    </td>
                    <td className="py-3.5 px-3 text-center text-slate-700 font-mono tabular-nums">
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
