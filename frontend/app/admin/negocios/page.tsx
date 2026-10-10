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
import CustomSelect from "@/components/dashboard/ui/CustomSelect";

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
        <span className="px-2 py-0.5 rounded text-[11px] font-mono font-medium text-slate-600 bg-slate-100 border border-slate-200">
          FREE
        </span>
      );
    }
    if (p === "EMPRESA" || p === "BUSINESS") {
      return (
        <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold text-purple-700 bg-purple-50 border border-purple-200">
          EMPRESA
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold text-[#FF4F2B] bg-orange-50 border border-orange-200">
        {p}
      </span>
    );
  };

  const getActivityBadge = (status: string) => {
    switch (status) {
      case "Activo":
        return (
          <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1.5 w-fit bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/80">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Activo (&lt;14d)
          </span>
        );
      case "Sin actividad reciente":
        return (
          <span className="text-[11px] text-amber-700 font-semibold flex items-center gap-1.5 w-fit bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/80">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            Sin actividad (&lt;45d)
          </span>
        );
      default:
        return (
          <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5 w-fit bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
            <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
            Inactivo
          </span>
        );
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full min-w-0 text-slate-900">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Building2 className="h-6 w-6 text-[#FF4F2B] shrink-0" />
            <span>Directorio de Negocios</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Inventario completo de cuentas registradas en AgendatePY.
          </p>
        </div>

        <div className="text-xs font-mono text-slate-600 bg-orange-50 px-3 py-1.5 rounded-xl border border-orange-200/80 self-start sm:self-auto shrink-0 shadow-2xs">
          Total: <span className="text-[#FF4F2B] font-bold">{pagination.total}</span> negocios
        </div>
      </div>

      {/* Search & Multi-Filters Toolbar */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-3 sm:p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3 shadow-xs">
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 w-full lg:flex-1 min-w-0">
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por nombre, slug o subdominio..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#FF4F2B] focus:ring-1 focus:ring-[#FF4F2B]/20 transition"
            />
          </div>
          <button
            type="submit"
            className="bg-[#FF4F2B] hover:bg-[#E03F1E] text-white px-4 py-1.5 rounded-xl text-xs font-bold transition shrink-0 shadow-xs cursor-pointer active:scale-98"
          >
            Buscar
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          {/* Plan Filter */}
          <CustomSelect
            value={planFilter}
            onChange={(val) => {
              setPlanFilter(val);
              setPage(1);
            }}
            options={[
              { value: "ALL", label: "Todos los Planes" },
              { value: "FREE", label: "Cuentas FREE" },
              { value: "PAID", label: "Cuentas de Pago" },
              { value: "PROFESIONAL", label: "PROFESIONAL" },
              { value: "EMPRESA", label: "EMPRESA" },
            ]}
            buttonClassName="bg-slate-50 border-slate-200 text-slate-700 w-full sm:w-auto sm:min-w-[150px]"
          />

          {/* Status filter */}
          <CustomSelect
            value={statusFilter}
            onChange={(val) => {
              setStatusFilter(val);
              setPage(1);
            }}
            options={[
              { value: "ALL", label: "Estado: Todos" },
              { value: "ACTIVE", label: "ACTIVE" },
              { value: "PAUSED", label: "PAUSED" },
              { value: "SUSPENDED", label: "SUSPENDED" },
            ]}
            buttonClassName="bg-slate-50 border-slate-200 text-slate-700 w-full sm:w-auto sm:min-w-[130px]"
          />

          {/* Sort By */}
          <CustomSelect
            value={`${sortBy}-${sortOrder}`}
            onChange={(val) => {
              const [sb, so] = val.split("-");
              setSortBy(sb);
              setSortOrder(so);
              setPage(1);
            }}
            options={[
              { value: "createdAt-desc", label: "Más recientes primero" },
              { value: "createdAt-asc", label: "Más antiguos primero" },
              { value: "name-asc", label: "Nombre (A - Z)" },
              { value: "name-desc", label: "Nombre (Z - A)" },
              { value: "lastActivity-desc", label: "Mayor actividad reciente" },
            ]}
            buttonClassName="bg-slate-50 border-slate-200 text-slate-700 w-full sm:w-auto sm:min-w-[180px]"
          />
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2.5">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Tenants Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="py-3 px-4">Negocio</th>
                <th className="py-3 px-4">Plan</th>
                <th className="py-3 px-4">Contacto</th>
                <th className="py-3 px-4">Estado</th>
                <th className="py-3 px-4">Actividad</th>
                <th className="py-3 px-4 text-center">Servicios</th>
                <th className="py-3 px-4 text-center">Citas</th>
                <th className="py-3 px-4">Fecha Registro</th>
                <th className="py-3 px-4 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <div className="h-5 w-5 border-2 border-[#FF4F2B] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Cargando directorio de negocios...
                  </td>
                </tr>
              ) : tenants.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    No se encontraron negocios con los filtros aplicados.
                  </td>
                </tr>
              ) : (
                tenants.map((t) => (
                  <tr
                    key={t.id}
                    onClick={() => window.location.href = `/admin/negocios/${t.id}`}
                    className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                  >
                    <td className="py-3.5 px-4">
                      <Link
                        href={`/admin/negocios/${t.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="font-bold text-slate-900 group-hover:text-[#FF4F2B] transition-colors block"
                      >
                        {t.name}
                      </Link>
                      <div className="text-[11px] text-slate-400 font-mono">
                        /{t.slug} • {t.subdomain}.agendatepy.com
                      </div>
                    </td>
                    <td className="py-3.5 px-4">{getPlanBadge(t.plan)}</td>
                    <td className="py-3.5 px-4">
                      {t.ownerEmail ? (
                        <div className="text-slate-700 truncate max-w-[180px]" title={t.ownerEmail}>
                          {t.ownerEmail}
                          {t.ownerPhone && (
                            <div className="text-[11px] text-slate-400 font-mono">{t.ownerPhone}</div>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">Sin propietario</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-[11px] font-mono text-slate-600 font-medium">
                        {t.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">{getActivityBadge(t.activityStatus)}</td>
                    <td className="py-3.5 px-4 text-center font-mono text-slate-600">
                      {t.servicesCount}
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-900">
                      {t.appointmentsCount}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                      {new Date(t.createdAt).toLocaleDateString("es-PY")}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#FF4F2B] transition-colors inline-block" />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-3.5 border-t border-slate-100 bg-slate-50/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            Mostrando <span className="text-slate-900 font-semibold">{tenants.length}</span> de{" "}
            <span className="text-slate-900 font-semibold">{pagination.total}</span> negocios
          </div>
          <div className="flex items-center gap-1.5">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 disabled:opacity-40 hover:bg-slate-50 transition flex items-center gap-1 text-xs shadow-2xs cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              Anterior
            </button>
            <span className="font-mono px-2 text-[11px] text-slate-700 font-semibold">
              {page} / {pagination.totalPages}
            </span>
            <button
              disabled={page >= pagination.totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 disabled:opacity-40 hover:bg-slate-50 transition flex items-center gap-1 text-xs shadow-2xs cursor-pointer"
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
