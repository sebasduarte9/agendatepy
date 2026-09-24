"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Crown,
  Building2,
  Users,
  CalendarCheck,
  TrendingUp,
  Search,
  ExternalLink,
  ShieldCheck,
  MessageSquare,
  AlertCircle,
  MoreVertical,
  CheckCircle2,
  PauseCircle,
  PlayCircle,
  Sparkles,
  ArrowUpRight,
  LogOut,
  Settings,
  CreditCard,
  RefreshCw,
} from "lucide-react";
import { logoutAction } from "@/lib/auth/actions";
import { useRouter } from "next/navigation";

interface TenantData {
  id: string;
  name: string;
  subdomain: string;
  plan: "BASICO" | "PROFESIONAL" | "EMPRESA";
  status: "ACTIVE" | "PAUSED" | "TRIAL";
  monthlyPrice: number;
  staffCount: number;
  appointmentsCount: number;
  createdAt: string;
}

const INITIAL_TENANTS: TenantData[] = [
  {
    id: "t-1",
    name: "Barbería Los Muchachos",
    subdomain: "barberia",
    plan: "PROFESIONAL",
    status: "ACTIVE",
    monthlyPrice: 320000,
    staffCount: 3,
    appointmentsCount: 142,
    createdAt: "12/09/2026",
  },
  {
    id: "t-2",
    name: "Estudio Glamour & Spa",
    subdomain: "glamour",
    plan: "EMPRESA",
    status: "ACTIVE",
    monthlyPrice: 650000,
    staffCount: 8,
    appointmentsCount: 389,
    createdAt: "04/09/2026",
  },
  {
    id: "t-3",
    name: "Consultorio Dental San Lucas",
    subdomain: "sanlucas",
    plan: "PROFESIONAL",
    status: "ACTIVE",
    monthlyPrice: 320000,
    staffCount: 4,
    appointmentsCount: 96,
    createdAt: "18/09/2026",
  },
  {
    id: "t-4",
    name: "Pádel Club Mburucuyá",
    subdomain: "padel-mburucuya",
    plan: "EMPRESA",
    status: "ACTIVE",
    monthlyPrice: 650000,
    staffCount: 5,
    appointmentsCount: 512,
    createdAt: "01/09/2026",
  },
  {
    id: "t-5",
    name: "Peluquería Canina Pet Lovers",
    subdomain: "petlovers",
    plan: "BASICO",
    status: "TRIAL",
    monthlyPrice: 180000,
    staffCount: 2,
    appointmentsCount: 28,
    createdAt: "22/09/2026",
  },
];

export default function SuperadminPage() {
  const router = useRouter();
  const [tenants, setTenants] = useState<TenantData[]>(INITIAL_TENANTS);
  const [search, setSearch] = useState("");
  const [filterPlan, setFilterPlan] = useState<string>("ALL");

  const totalMRR = tenants.reduce((acc, t) => acc + (t.status === "ACTIVE" ? t.monthlyPrice : 0), 0);
  const totalAppointments = tenants.reduce((acc, t) => acc + t.appointmentsCount, 0);

  const filteredTenants = tenants.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.subdomain.toLowerCase().includes(search.toLowerCase());
    const matchesPlan = filterPlan === "ALL" || t.plan === filterPlan;
    return matchesSearch && matchesPlan;
  });

  const toggleStatus = (id: string) => {
    setTenants((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, status: t.status === "ACTIVE" ? "PAUSED" : "ACTIVE" }
          : t
      )
    );
  };

  const handleLogout = async () => {
    await logoutAction();
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-[#f8f9fc] text-slate-900 selection:bg-purple-600 selection:text-white">
      {/* Top Bar Superadmin */}
      <header className="sticky top-0 z-30 border-b border-slate-200/90 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3.5">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-tr from-purple-700 to-indigo-600 text-white shadow-md shadow-purple-600/20">
              <Crown className="h-5 w-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black tracking-tight text-slate-900">
                  Agendate<span className="text-purple-600">PY</span>
                </span>
                <span className="rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-purple-700">
                  Superadmin
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium">
                Panel Central de Control del SaaS
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 rounded-2xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition"
            >
              <span>Ver Panel de Negocio</span>
              <ArrowUpRight className="h-3.5 w-3.5 text-slate-400" />
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 rounded-2xl border border-red-200/80 bg-red-50/50 px-3.5 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100 transition"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        {/* Banner de Estado del Sistema */}
        <div className="mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 rounded-3xl border border-purple-200/80 bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 p-6 text-white shadow-xl">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-purple-200">
                Sistemas Operativos 100%
              </span>
            </div>
            <h1 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">
              Panel Maestro de AgendatePY
            </h1>
            <p className="mt-1 text-xs text-purple-200/80 max-w-xl">
              Monitoreo en tiempo real de todos los negocios suscriptos, volumen de turnos en Paraguay y consumo de la API de Sendwo WhatsApp.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <div className="rounded-2xl bg-white/10 px-4 py-2.5 backdrop-blur-md border border-white/10 text-center">
              <p className="text-[10px] font-semibold text-purple-200 uppercase">Sendwo API</p>
              <p className="text-xs font-bold text-emerald-300">Conectado (100% Deliv.)</p>
            </div>
            <div className="rounded-2xl bg-white/10 px-4 py-2.5 backdrop-blur-md border border-white/10 text-center">
              <p className="text-[10px] font-semibold text-purple-200 uppercase">PostgreSQL</p>
              <p className="text-xs font-bold text-emerald-300">Activo (14 Tablas)</p>
            </div>
            <div className="rounded-2xl bg-white/10 px-4 py-2.5 backdrop-blur-md border border-white/10 text-center">
              <p className="text-[10px] font-semibold text-purple-200 uppercase">uPay Gateway</p>
              <p className="text-xs font-bold text-indigo-200">Sandbox Ready</p>
            </div>
          </div>
        </div>

        {/* Métricas Globales */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Negocios Totales
              </span>
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                <Building2 className="h-4 w-4" />
              </span>
            </div>
            <p className="mt-3 text-2xl font-black text-slate-900 tracking-tight">
              {tenants.length} Locales
            </p>
            <p className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
              <TrendingUp className="h-3 w-3" /> +2 esta semana
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Ingresos MRR
              </span>
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <CreditCard className="h-4 w-4" />
              </span>
            </div>
            <p className="mt-3 text-2xl font-black text-slate-900 tracking-tight">
              Gs. {new Intl.NumberFormat("es-PY").format(totalMRR)}
            </p>
            <p className="mt-1 text-[11px] text-slate-500 font-medium">
              Facturación recurrente mensual
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Citas Procesadas
              </span>
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <CalendarCheck className="h-4 w-4" />
              </span>
            </div>
            <p className="mt-3 text-2xl font-black text-slate-900 tracking-tight">
              {new Intl.NumberFormat("es-PY").format(totalAppointments)}
            </p>
            <p className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
              <TrendingUp className="h-3 w-3" /> 98.4% de efectividad
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Mensajes Sendwo
              </span>
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-whatsapp/10 text-whatsapp">
                <MessageSquare className="h-4 w-4" />
              </span>
            </div>
            <p className="mt-3 text-2xl font-black text-slate-900 tracking-tight">
              2.418
            </p>
            <p className="mt-1 text-[11px] text-slate-500 font-medium">
              Avisos y confirmaciones WhatsApp
            </p>
          </div>
        </div>

        {/* Directorio de Tenants / Negocios */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-lg font-bold tracking-tight text-slate-900">
                Directorio de Negocios (Tenants)
              </h2>
              <p className="text-xs text-slate-500">
                Control de licencias, planes y acceso directo a cada local
              </p>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              {/* Buscador */}
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar por nombre o slug..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 py-2 pl-9 pr-3 text-xs font-medium text-slate-900 focus:border-purple-500 focus:bg-white focus:outline-none transition"
                />
              </div>

              {/* Filtro Plan */}
              <select
                value={filterPlan}
                onChange={(e) => setFilterPlan(e.target.value)}
                className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 focus:border-purple-500 focus:outline-none"
              >
                <option value="ALL">Todos los planes</option>
                <option value="BASICO">Básico</option>
                <option value="PROFESIONAL">Profesional</option>
                <option value="EMPRESA">Empresa</option>
              </select>
            </div>
          </div>

          {/* Tabla */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200/80 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                  <th className="pb-3 pl-2">Negocio</th>
                  <th className="pb-3">Subdominio</th>
                  <th className="pb-3">Plan Activo</th>
                  <th className="pb-3">Estado</th>
                  <th className="pb-3">Staff / Citas</th>
                  <th className="pb-3">Fecha Alta</th>
                  <th className="pb-3 text-right pr-2">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredTenants.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-4 pl-2 font-bold text-slate-900">
                      <div className="flex items-center gap-2">
                        <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-purple-50 text-purple-700 font-bold text-xs">
                          {item.name.slice(0, 2).toUpperCase()}
                        </span>
                        <span>{item.name}</span>
                      </div>
                    </td>
                    <td className="py-4 font-mono text-purple-700">
                      {item.subdomain}.agendate.py
                    </td>
                    <td className="py-4">
                      <span
                        className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                          item.plan === "EMPRESA"
                            ? "bg-purple-100 text-purple-800"
                            : item.plan === "PROFESIONAL"
                            ? "bg-indigo-100 text-indigo-800"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {item.plan} (Gs. {new Intl.NumberFormat("es-PY").format(item.monthlyPrice)})
                      </span>
                    </td>
                    <td className="py-4">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          item.status === "ACTIVE"
                            ? "bg-emerald-100 text-emerald-800"
                            : item.status === "TRIAL"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-slate-200 text-slate-600"
                        }`}
                      >
                        {item.status === "ACTIVE" && <CheckCircle2 className="h-3 w-3" />}
                        {item.status === "TRIAL" && <Sparkles className="h-3 w-3" />}
                        {item.status === "PAUSED" && <PauseCircle className="h-3 w-3" />}
                        {item.status === "ACTIVE" ? "Activo" : item.status === "TRIAL" ? "Prueba 14d" : "Pausado"}
                      </span>
                    </td>
                    <td className="py-4 text-slate-600">
                      {item.staffCount} profesionales · {item.appointmentsCount} citas
                    </td>
                    <td className="py-4 text-slate-400">{item.createdAt}</td>
                    <td className="py-4 text-right pr-2">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => toggleStatus(item.id)}
                          title={item.status === "ACTIVE" ? "Pausar cuenta" : "Activar cuenta"}
                          className="rounded-xl border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-100 transition"
                        >
                          {item.status === "ACTIVE" ? (
                            <PauseCircle className="h-3.5 w-3.5" />
                          ) : (
                            <PlayCircle className="h-3.5 w-3.5 text-emerald-600" />
                          )}
                        </button>
                        <a
                          href={`/${item.subdomain}/reservar`}
                          target="_blank"
                          rel="noreferrer"
                          title="Abrir página pública del local"
                          className="inline-flex items-center gap-1 rounded-xl bg-purple-50 px-2.5 py-1.5 text-[11px] font-bold text-purple-700 hover:bg-purple-100 transition"
                        >
                          <span>Página</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
