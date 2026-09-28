"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Building2,
  Search,
  Filter,
  Eye,
  Calendar,
  Users,
  Scissors,
  DollarSign,
  Activity,
  AlertCircle,
  Clock,
  ArrowUpDown,
  CreditCard,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";

export default function AdminTenantsDirectoryPage() {
  const [tenants, setTenants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [planFilter, setPlanFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [activityFilter, setActivityFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });

  const fetchTenants = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
        search,
        plan: planFilter,
        status: statusFilter,
        activity: activityFilter,
        sortBy,
        sortOrder,
      });

      const res = await fetch(`/api/admin/tenants?${params.toString()}`);
      if (!res.ok) {
        throw new Error("No se pudo obtener el directorio de negocios");
      }
      const data = await res.json();
      setTenants(data.data || []);
      setPagination(data.pagination || { total: 0, totalPages: 1 });
    } catch (err: any) {
      setError(err.message || "Error al cargar negocios");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenants();
  }, [page, planFilter, statusFilter, activityFilter, sortBy, sortOrder]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchTenants();
  };

  const getPlanBadge = (plan: string) => {
    const p = (plan || "PROFESIONAL").toUpperCase();
    if (p === "FREE" || p === "GRATUITO") {
      return (
        <span className="px-2.5 py-1 rounded-lg text-xs font-bold font-mono bg-slate-800 text-slate-300 border border-slate-700">
          FREE
        </span>
      );
    }
    if (p === "EMPRESA" || p === "BUSINESS") {
      return (
        <span className="px-2.5 py-1 rounded-lg text-xs font-bold font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30">
          EMPRESA
        </span>
      );
    }
    return (
      <span className="px-2.5 py-1 rounded-lg text-xs font-bold font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
        {p}
      </span>
    );
  };

  const getActivityBadge = (status: string) => {
    switch (status) {
      case "Activo":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1 w-fit">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Activo (&lt;14d)
          </span>
        );
      case "Sin actividad reciente":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1 w-fit">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
            Sin actividad (&lt;45d)
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-500/10 text-slate-400 border border-slate-500/20 flex items-center gap-1 w-fit">
            <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
            Inactivo
          </span>
        );
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full text-slate-100">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Building2 className="h-6 w-6 text-indigo-400" />
            Directorio Central de Negocios
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Inventario completo de cuentas registradas en AgendatePY con desglose de planes y estado operacional.
          </p>
        </div>

        <div className="text-xs font-mono text-slate-400 bg-slate-900 px-3.5 py-2 rounded-xl border border-slate-800">
          Total listados: <span className="text-white font-bold">{pagination.total}</span> negocios
        </div>
      </div>

      {/* Search & Multi-Filters Toolbar */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 flex-1 min-w-[260px]">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder="Buscar por nombre, slug o subdominio..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-xs font-semibold transition shrink-0"
          >
            Buscar
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-2">
          {/* Plan Filter */}
          <select
            value={planFilter}
            onChange={(e) => {
              setPlanFilter(e.target.value);
              setPage(1);
            }}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-500 font-medium"
          >
            <option value="ALL">💳 Todos los Planes</option>
            <option value="FREE">🔘 Cuentas FREE</option>
            <option value="PAID">💎 Cuentas de Pago</option>
            <option value="PROFESIONAL">PROFESIONAL</option>
            <option value="EMPRESA">EMPRESA</option>
          </select>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="ALL">Estado: Todos</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="PAUSED">PAUSED</option>
            <option value="SUSPENDED">SUSPENDED</option>
          </select>

          {/* Sort By */}
          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [sb, so] = e.target.value.split("-");
              setSortBy(sb);
              setSortOrder(so);
              setPage(1);
            }}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="createdAt-desc">📅 Más recientes primero</option>
            <option value="createdAt-asc">📅 Más antiguos primero</option>
            <option value="name-asc">🔤 Nombre (A - Z)</option>
            <option value="name-desc">🔤 Nombre (Z - A)</option>
            <option value="lastActivity-desc">⚡ Mayor actividad reciente</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-950/40 border border-red-800/60 text-red-300 text-sm flex items-center gap-3">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Tenants Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="py-4 px-4">Negocio</th>
                <th className="py-4 px-4">Plan / Cuenta</th>
                <th className="py-4 px-4">Contacto / Owner</th>
                <th className="py-4 px-4">Estado Cuenta</th>
                <th className="py-4 px-4">Actividad Operativa</th>
                <th className="py-4 px-4 text-center">Servicios</th>
                <th className="py-4 px-4 text-center">Citas</th>
                <th className="py-4 px-4">Fecha Registro</th>
                <th className="py-4 px-4 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-16 text-center text-slate-500">
                    <div className="h-6 w-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Cargando directorio de negocios...
                  </td>
                </tr>
              ) : tenants.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-16 text-center text-slate-500">
                    No se encontraron negocios con los filtros aplicados.
                  </td>
                </tr>
              ) : (
                tenants.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-800/40 transition group">
                    <td className="py-4 px-4">
                      <Link
                        href={`/admin/negocios/${t.id}`}
                        className="font-semibold text-slate-100 group-hover:text-indigo-300 transition block"
                      >
                        {t.name}
                      </Link>
                      <div className="text-[11px] text-slate-500 font-mono">
                        /{t.slug} • {t.subdomain}.agendatepy.com
                      </div>
                    </td>
                    <td className="py-4 px-4">{getPlanBadge(t.plan)}</td>
                    <td className="py-4 px-4">
                      {t.ownerEmail ? (
                        <div className="text-slate-300 truncate max-w-[180px]" title={t.ownerEmail}>
                          {t.ownerEmail}
                          {t.ownerPhone && (
                            <div className="text-[11px] text-slate-500 font-mono">{t.ownerPhone}</div>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-500 italic text-[11px]">Sin propietario</span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                        {t.status}
                      </span>
                    </td>
                    <td className="py-4 px-4">{getActivityBadge(t.activityStatus)}</td>
                    <td className="py-4 px-4 text-center font-mono text-slate-300">
                      {t.servicesCount}
                    </td>
                    <td className="py-4 px-4 text-center font-mono font-bold text-white">
                      {t.appointmentsCount}
                    </td>
                    <td className="py-4 px-4 text-slate-400 font-mono text-[11px]">
                      {new Date(t.createdAt).toLocaleDateString("es-PY")}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <Link
                        href={`/admin/negocios/${t.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 text-indigo-300 hover:bg-indigo-600 hover:text-white transition text-xs font-semibold"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>Detalle</span>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <div>
            Mostrando <span className="text-white font-bold">{tenants.length}</span> de{" "}
            <span className="text-white font-bold">{pagination.total}</span> negocios registrados
          </div>
          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 disabled:opacity-40 hover:bg-slate-700 transition flex items-center gap-1 font-medium"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              Anterior
            </button>
            <span className="font-mono px-2">
              Página {page} de {pagination.totalPages}
            </span>
            <button
              disabled={page >= pagination.totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 disabled:opacity-40 hover:bg-slate-700 transition flex items-center gap-1 font-medium"
            >
              Siguiente
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
