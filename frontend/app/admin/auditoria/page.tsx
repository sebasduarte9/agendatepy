"use client";

import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  Search,
  Filter,
  AlertCircle,
  Clock,
  Layers,
  FileText,
  Activity,
} from "lucide-react";

export default function AdminAuditPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [eventTypeFilter, setEventTypeFilter] = useState<string>("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });

  const fetchAuditEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "25",
        ...(eventTypeFilter ? { event: eventTypeFilter } : {}),
      });

      const res = await fetch(`/api/admin/audit?${params.toString()}`);
      if (!res.ok) {
        throw new Error("No se pudieron cargar los eventos de auditoría.");
      }
      const json = await res.json();
      setEvents(json.data || []);
      setPagination(json.pagination || { total: 0, totalPages: 1 });
    } catch (err: any) {
      setError(err.message || "Error al conectar con la API de auditoría.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditEvents();
  }, [page, eventTypeFilter]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-emerald-400" />
            Auditoría de Plataforma & Eventos
          </h2>
          <p className="text-sm text-slate-400">
            Registro inmutable de hitos del sistema, cambios administrativos y actividades operativas.
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          <select
            value={eventTypeFilter}
            onChange={(e) => {
              setEventTypeFilter(e.target.value);
              setPage(1);
            }}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="">Todos los eventos</option>
            <option value="TENANT_CREATED">TENANT_CREATED</option>
            <option value="ONBOARDING_COMPLETED">ONBOARDING_COMPLETED</option>
            <option value="FIRST_BOOKING">FIRST_BOOKING</option>
            <option value="APPOINTMENT_CREATED">APPOINTMENT_CREATED</option>
            <option value="APPOINTMENT_COMPLETED">APPOINTMENT_COMPLETED</option>
            <option value="CASH_MOVEMENT_CREATED">CASH_MOVEMENT_CREATED</option>
            <option value="PAYOUT_PAID">PAYOUT_PAID</option>
            <option value="EXPORT_CREATED">EXPORT_CREATED</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-950/40 border border-red-800/60 text-red-300 text-sm flex items-center gap-3">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Events Table */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/50 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="py-3.5 px-4">Fecha (UTC/Local)</th>
                <th className="py-3.5 px-4">Evento</th>
                <th className="py-3.5 px-4">Tenant</th>
                <th className="py-3.5 px-4">Entidad</th>
                <th className="py-3.5 px-4">Metadata</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs font-mono">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500 font-sans">
                    <div className="h-6 w-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Cargando registros de auditoría...
                  </td>
                </tr>
              ) : events.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500 font-sans">
                    No se encontraron eventos registrados.
                  </td>
                </tr>
              ) : (
                events.map((ev) => (
                  <tr key={ev.id} className="hover:bg-slate-800/30 transition">
                    <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                      {new Date(ev.createdAt).toLocaleString("es-PY")}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                        {ev.event}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-200 font-sans font-medium">
                      {ev.tenantName}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">
                      {ev.entityType ? `${ev.entityType} (${ev.entityId?.slice(0, 8)}...)` : "—"}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 max-w-xs truncate">
                      {ev.metadata ? JSON.stringify(ev.metadata) : "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40 flex items-center justify-between text-xs text-slate-400 font-sans">
          <div>
            Total: <span className="text-white font-bold">{pagination.total}</span> eventos
          </div>
          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1 rounded bg-slate-800 text-slate-300 disabled:opacity-40 hover:bg-slate-700 transition"
            >
              Anterior
            </button>
            <span className="font-mono">
              Página {page} de {pagination.totalPages}
            </span>
            <button
              disabled={page >= pagination.totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1 rounded bg-slate-800 text-slate-300 disabled:opacity-40 hover:bg-slate-700 transition"
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
