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
import CustomSelect from "@/components/dashboard/ui/CustomSelect";

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
    <div className="p-3.5 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full min-w-0 text-slate-100 overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-400 shrink-0" />
            <span>Auditoría de Plataforma & Eventos</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Registro inmutable de hitos del sistema, cambios administrativos y actividades operativas.
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <CustomSelect
            value={eventTypeFilter}
            onChange={(val) => {
              setEventTypeFilter(val);
              setPage(1);
            }}
            options={[
              { value: "", label: "Todos los eventos" },
              { value: "TENANT_CREATED", label: "TENANT_CREATED" },
              { value: "ONBOARDING_COMPLETED", label: "ONBOARDING_COMPLETED" },
              { value: "FIRST_BOOKING", label: "FIRST_BOOKING" },
              { value: "APPOINTMENT_CREATED", label: "APPOINTMENT_CREATED" },
              { value: "APPOINTMENT_COMPLETED", label: "APPOINTMENT_COMPLETED" },
              { value: "CASH_MOVEMENT_CREATED", label: "CASH_MOVEMENT_CREATED" },
              { value: "PAYOUT_PAID", label: "PAYOUT_PAID" },
              { value: "EXPORT_CREATED", label: "EXPORT_CREATED" },
            ]}
            buttonClassName="bg-slate-900 border-slate-800 text-slate-300 w-full sm:w-auto sm:min-w-[190px]"
          />
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-950/40 border border-red-800/60 text-red-300 text-sm flex items-center gap-3">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Events Table */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
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
