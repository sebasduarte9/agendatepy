"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Boxes,
  Calendar,
  Users,
  Scissors,
  Coins,
  Receipt,
  Percent,
  DollarSign,
  Globe,
  FileSpreadsheet,
  Check,
  X,
  Search,
  Filter,
  ArrowRight,
  CalendarCheck,
} from "lucide-react";
import CustomSelect from "@/components/dashboard/ui/CustomSelect";

export default function AdoptionPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [featureFilter, setFeatureFilter] = useState("ALL");

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `/api/admin/adoption?search=${encodeURIComponent(search)}&feature=${featureFilter}`
      );
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
    fetchData();
  }, [search, featureFilter]);

  const featuresList = [
    { key: "calendar", name: "Calendario", icon: Calendar },
    { key: "clients", name: "Clientes CRM", icon: Users },
    { key: "services", name: "Servicios", icon: Scissors },
    { key: "staff", name: "Colaboradores", icon: Users },
    { key: "cash", name: "Caja / Cobros", icon: Coins },
    { key: "cashRegister", name: "Cierres Caja", icon: Receipt },
    { key: "commisiones", name: "Comisiones", icon: Percent },
    { key: "payouts", name: "Liquidaciones", icon: DollarSign },
    { key: "portal", name: "Portal Público", icon: Globe },
    { key: "reports", name: "Reportes/Export", icon: FileSpreadsheet },
  ];

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-white tracking-tight">Matriz de Adopción de Producto</h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30">
              Product Intelligence
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Auditoría de funcionalidades reales utilizadas por cada negocio en AgendatePY.
          </p>
        </div>
      </div>

      {/* Feature Adoption Rates Cards */}
      {data?.adoptionRates && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {[
            { label: "Calendario", rate: data.adoptionRates.calendar.percentage, count: data.adoptionRates.calendar.count, icon: Calendar },
            { label: "Clientes (CRM)", rate: data.adoptionRates.clients.percentage, count: data.adoptionRates.clients.count, icon: Users },
            { label: "Servicios", rate: data.adoptionRates.services.percentage, count: data.adoptionRates.services.count, icon: Scissors },
            { label: "Caja & Cobros", rate: data.adoptionRates.cash.percentage, count: data.adoptionRates.cash.count, icon: Coins },
            { label: "Cierres Caja", rate: data.adoptionRates.cashRegister.percentage, count: data.adoptionRates.cashRegister.count, icon: Receipt },
            { label: "Comisiones", rate: data.adoptionRates.commissions.percentage, count: data.adoptionRates.commissions.count, icon: Percent },
            { label: "Liquidaciones", rate: data.adoptionRates.payouts.percentage, count: data.adoptionRates.payouts.count, icon: DollarSign },
            { label: "Portal Público", rate: data.adoptionRates.portal.percentage, count: data.adoptionRates.portal.count, icon: Globe },
            { label: "Exportaciones", rate: data.adoptionRates.reports.percentage, count: data.adoptionRates.reports.count, icon: FileSpreadsheet },
            { label: "Ready to Book", rate: data.adoptionRates.readyForBooking.percentage, count: data.adoptionRates.readyForBooking.count, icon: CalendarCheck },
          ].map((item) => (
            <div
              key={item.label}
              className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-medium truncate">{item.label}</span>
                <item.icon className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              </div>
              <div className="mt-2">
                <div className="text-xl font-bold text-white">{item.rate}%</div>
                <div className="text-[11px] font-mono text-slate-500">{item.count} tenants</div>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2 overflow-hidden">
                <div
                  className="bg-indigo-500 h-1.5 rounded-full"
                  style={{ width: `${Math.min(100, Math.max(0, item.rate))}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Controls & Search */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Filtrar por negocio o slug..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <CustomSelect
            value={featureFilter}
            onChange={(val) => setFeatureFilter(val)}
            options={[
              { value: "ALL", label: "Todas las funcionalidades" },
              { value: "calendar", label: "Con Agenda / Citas" },
              { value: "cash", label: "Con Cobros en Caja" },
              { value: "cashRegister", label: "Con Cierres de Caja" },
              { value: "commissions", label: "Con Comisiones" },
              { value: "payouts", label: "Con Liquidaciones" },
              { value: "portal", label: "Con Portal Público" },
            ]}
            buttonClassName="bg-slate-950 border-slate-800 text-slate-200 min-w-[190px]"
          />
        </div>
      </div>

      {/* Feature Matrix Table */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Boxes className="w-4 h-4 text-indigo-400" />
            Matriz de Adopción por Negocio ({data?.matrix?.length || 0})
          </h2>
          <span className="text-xs text-slate-400">
            Valores calculados desde operaciones registradas en PostgreSQL
          </span>
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400">
            <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin mb-2" />
            <p className="text-xs font-mono">Cargando matriz...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/80 text-slate-400 uppercase tracking-wider font-mono text-[10px]">
                  <th className="p-3.5 pl-5">Negocio</th>
                  <th className="p-3.5 text-center">Ready</th>
                  <th className="p-3.5 text-center">Agenda</th>
                  <th className="p-3.5 text-center">CRM</th>
                  <th className="p-3.5 text-center">Servicios</th>
                  <th className="p-3.5 text-center">Caja</th>
                  <th className="p-3.5 text-center">Cierres</th>
                  <th className="p-3.5 text-center">Comisiones</th>
                  <th className="p-3.5 text-center">Liquidaciones</th>
                  <th className="p-3.5 text-center">Portal</th>
                  <th className="p-3.5 text-center">Módulos</th>
                  <th className="p-3.5 text-right pr-5">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {data?.matrix?.length === 0 ? (
                  <tr>
                    <td colSpan={12} className="p-8 text-center text-slate-500">
                      No se encontraron negocios con los filtros especificados.
                    </td>
                  </tr>
                ) : (
                  data?.matrix?.map((row: any) => (
                    <tr key={row.id} className="hover:bg-slate-800/40 transition">
                      <td className="p-3.5 pl-5">
                        <Link
                          href={`/admin/negocios/${row.id}`}
                          className="font-bold text-slate-200 hover:text-indigo-400 transition"
                        >
                          {row.name}
                        </Link>
                        <div className="text-[11px] font-mono text-slate-500">/{row.slug}</div>
                      </td>

                      {/* Ready for booking */}
                      <td className="p-3.5 text-center">
                        {row.isReady ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20">
                            LISTO
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] bg-slate-800 text-slate-400">
                            Pendiente
                          </span>
                        )}
                      </td>

                      {/* Feature Checkmarks */}
                      {[
                        row.features.calendar,
                        row.features.clients,
                        row.features.services,
                        row.features.cash,
                        row.features.cashRegister,
                        row.features.commissions,
                        row.features.payouts,
                        row.features.portal,
                      ].map((active, i) => (
                        <td key={i} className="p-3.5 text-center">
                          {active ? (
                            <div className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center mx-auto">
                              <Check className="w-3 h-3" />
                            </div>
                          ) : (
                            <div className="w-5 h-5 rounded-full bg-slate-800/60 text-slate-600 flex items-center justify-center mx-auto">
                              <X className="w-3 h-3" />
                            </div>
                          )}
                        </td>
                      ))}

                      {/* Adopted Modules Score */}
                      <td className="p-3.5 text-center">
                        <span className="font-mono text-xs font-bold text-indigo-400">
                          {row.adoptedFeaturesCount} / 8
                        </span>
                      </td>

                      {/* Action */}
                      <td className="p-3.5 text-right pr-5">
                        <Link
                          href={`/admin/negocios/${row.id}`}
                          className="inline-flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
                        >
                          Ver <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
