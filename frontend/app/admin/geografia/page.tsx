"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  MapPin,
  Building2,
  CalendarCheck,
  Coins,
  ArrowRight,
  Globe,
  Info,
} from "lucide-react";

export default function GeographyPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  const fetchGeo = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/geografia");
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
    fetchGeo();
  }, []);

  const formatGs = (val: number) => {
    return new Intl.NumberFormat("es-PY", {
      style: "currency",
      currency: "PYG",
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full min-w-0 text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-white tracking-tight flex items-center gap-2">
            <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-slate-400 shrink-0" />
            <span>Distribución Geográfica</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Concentración de negocios, actividad operativa y volumen registrado por ciudad y departamento.
          </p>
        </div>
      </div>

      {/* Honest Geo Notice */}
      <div className="p-3.5 rounded-xl bg-slate-900/40 border border-slate-800/80 flex items-center gap-3 text-xs text-slate-400">
        <Info className="w-4 h-4 text-slate-500 shrink-0" />
        <span>
          <strong className="text-slate-300">Nota de Datos:</strong> Las ubicaciones se agrupan estrictamente a partir de la configuración declarada por cada negocio (ciudad y departamento).
        </span>
      </div>

      {/* Cities Grid & Breakdown */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400">
          <div className="w-6 h-6 border-2 border-slate-600 border-t-slate-200 rounded-full animate-spin mb-2" />
          <p className="text-xs font-mono text-slate-500">Agrupando distribución territorial...</p>
        </div>
      ) : data?.cities?.length === 0 ? (
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-12 text-center text-slate-400">
          No hay negocios registrados para mostrar.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data?.cities?.map((cityGroup: any) => (
            <div
              key={`${cityGroup.city}-${cityGroup.department}`}
              className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-5 space-y-4 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h2 className="text-base font-semibold text-white flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-slate-500 shrink-0" />
                      {cityGroup.city}
                    </h2>
                    <p className="text-xs text-slate-400 font-normal">{cityGroup.department}</p>
                  </div>
                  <span className="font-mono text-xs px-2 py-0.5 rounded text-slate-400 bg-slate-800 border border-slate-700/60">
                    {cityGroup.tenantsCount} {cityGroup.tenantsCount === 1 ? "negocio" : "negocios"}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-3.5 border-t border-slate-800/80 mt-3.5 text-center">
                  <div className="bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/70">
                    <div className="text-[10px] text-slate-500">Activos 14d</div>
                    <div className="text-sm font-semibold text-white tracking-tight tabular-nums mt-0.5">{cityGroup.activeTenantsCount}</div>
                  </div>
                  <div className="bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/70">
                    <div className="text-[10px] text-slate-500">Citas</div>
                    <div className="text-sm font-semibold text-white tracking-tight tabular-nums mt-0.5">{cityGroup.totalAppointments}</div>
                  </div>
                  <div className="bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/70">
                    <div className="text-[10px] text-slate-500">Volumen</div>
                    <div className="text-xs font-semibold text-white tracking-tight tabular-nums mt-0.5 truncate">{formatGs(cityGroup.totalIncome)}</div>
                  </div>
                </div>

                {/* Businesses Mini List */}
                <div className="mt-3.5 pt-3 border-t border-slate-800/60 space-y-1.5">
                  <div className="text-[11px] font-medium text-slate-400">Negocios en esta localidad:</div>
                  <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                    {cityGroup.tenants.map((t: any) => (
                      <div
                        key={t.id}
                        className="flex items-center justify-between text-xs py-1 px-2 rounded hover:bg-slate-800/40 transition"
                      >
                        <Link
                          href={`/admin/negocios/${t.id}`}
                          className="font-medium text-slate-300 hover:text-white truncate max-w-[160px]"
                        >
                          {t.name}
                        </Link>
                        <span className="text-[10px] font-mono text-slate-500">
                          {t.appointmentsCount} citas
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
