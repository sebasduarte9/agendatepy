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
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-white tracking-tight">Distribución Geográfica</h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-400 border border-sky-500/30">
              Geo Intelligence
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Concentración de negocios, actividad operativa y volumen registrado por ciudad y departamento.
          </p>
        </div>
      </div>

      {/* Honest Geo Notice */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center gap-3 text-xs text-slate-400">
        <Info className="w-5 h-5 text-sky-400 shrink-0" />
        <span>
          <strong>Nota de Fidelidad de Datos:</strong> Las ubicaciones se agrupan estrictamente a partir de la configuración declarada por cada negocio (ciudad y departamento). No se calculan coordenadas GPS ficticias.
        </span>
      </div>

      {/* Cities Grid & Breakdown */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400">
          <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin mb-2" />
          <p className="text-xs font-mono">Agrupando distribución territorial...</p>
        </div>
      ) : data?.cities?.length === 0 ? (
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
          No hay negocios registrados para mostrar.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data?.cities?.map((cityGroup: any) => (
            <div
              key={`${cityGroup.city}-${cityGroup.department}`}
              className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-sky-400 shrink-0" />
                      {cityGroup.city}
                    </h2>
                    <p className="text-xs text-slate-400 font-medium">{cityGroup.department}</p>
                  </div>
                  <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
                    {cityGroup.tenantsCount} {cityGroup.tenantsCount === 1 ? "negocio" : "negocios"}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-4 border-t border-slate-800/80 mt-4 text-center">
                  <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/60">
                    <div className="text-[10px] text-slate-500">Activos 14d</div>
                    <div className="text-sm font-bold text-emerald-400 mt-0.5">{cityGroup.activeTenantsCount}</div>
                  </div>
                  <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/60">
                    <div className="text-[10px] text-slate-500">Citas</div>
                    <div className="text-sm font-bold text-purple-400 mt-0.5">{cityGroup.totalAppointments}</div>
                  </div>
                  <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/60">
                    <div className="text-[10px] text-slate-500">Volumen</div>
                    <div className="text-xs font-bold text-white mt-0.5 truncate">{formatGs(cityGroup.totalIncome)}</div>
                  </div>
                </div>

                {/* Businesses Mini List */}
                <div className="mt-4 pt-3 border-t border-slate-800/60 space-y-1.5">
                  <div className="text-[11px] font-semibold text-slate-400">Negocios en esta localidad:</div>
                  <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                    {cityGroup.tenants.map((t: any) => (
                      <div
                        key={t.id}
                        className="flex items-center justify-between text-xs py-1 px-2 rounded-lg hover:bg-slate-800/50 transition"
                      >
                        <Link
                          href={`/admin/negocios/${t.id}`}
                          className="font-medium text-slate-300 hover:text-indigo-400 truncate max-w-[160px]"
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
