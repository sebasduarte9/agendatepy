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
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full min-w-0 text-slate-900">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <MapPin className="h-6 w-6 text-[#FF4F2B] shrink-0" />
            <span>Distribución Geográfica</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Concentración de negocios, actividad operativa y volumen registrado por ciudad y departamento.
          </p>
        </div>
      </div>

      {/* Honest Geo Notice */}
      <div className="p-4 rounded-2xl bg-orange-50/60 border border-orange-200/80 flex items-center gap-3 text-xs text-slate-700 shadow-2xs">
        <Info className="w-4 h-4 text-[#FF4F2B] shrink-0" />
        <span>
          <strong className="text-slate-900">Nota de Datos:</strong> Las ubicaciones se agrupan estrictamente a partir de la configuración declarada por cada negocio (ciudad y departamento).
        </span>
      </div>

      {/* Cities Grid & Breakdown */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400">
          <div className="w-6 h-6 border-2 border-[#FF4F2B] border-t-transparent rounded-full animate-spin mb-2.5" />
          <p className="text-xs font-mono text-slate-500">Agrupando distribución territorial...</p>
        </div>
      ) : data?.cities?.length === 0 ? (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-12 text-center text-slate-400 shadow-xs">
          No hay negocios registrados para mostrar.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {data?.cities?.map((cityGroup: any) => (
            <div
              key={`${cityGroup.city}-${cityGroup.department}`}
              className="bg-white border border-slate-200/80 rounded-2xl p-5 space-y-4 flex flex-col justify-between shadow-xs hover:border-orange-200 transition"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-[#FF4F2B] shrink-0" />
                      {cityGroup.city}
                    </h2>
                    <p className="text-xs text-slate-500 font-normal mt-0.5">{cityGroup.department}</p>
                  </div>
                  <span className="font-mono text-xs font-semibold px-2.5 py-1 rounded-lg text-slate-700 bg-slate-100 border border-slate-200/80">
                    {cityGroup.tenantsCount} {cityGroup.tenantsCount === 1 ? "negocio" : "negocios"}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2.5 pt-4 border-t border-slate-100 mt-4 text-center">
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
                    <div className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Activos 14d</div>
                    <div className="text-sm font-bold text-slate-900 tracking-tight tabular-nums mt-0.5">{cityGroup.activeTenantsCount}</div>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
                    <div className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Citas</div>
                    <div className="text-sm font-bold text-slate-900 tracking-tight tabular-nums mt-0.5">{cityGroup.totalAppointments}</div>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
                    <div className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Volumen</div>
                    <div className="text-xs font-bold text-[#FF4F2B] tracking-tight tabular-nums mt-0.5 truncate">{formatGs(cityGroup.totalIncome)}</div>
                  </div>
                </div>

                {/* Businesses Mini List */}
                <div className="mt-4 pt-3.5 border-t border-slate-100 space-y-1.5">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Negocios en esta localidad:</div>
                  <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                    {cityGroup.tenants.map((t: any) => (
                      <div
                        key={t.id}
                        className="flex items-center justify-between text-xs py-1.5 px-2.5 rounded-lg hover:bg-orange-50/60 transition"
                      >
                        <Link
                          href={`/admin/negocios/${t.id}`}
                          className="font-semibold text-slate-800 hover:text-[#FF4F2B] truncate max-w-[170px]"
                        >
                          {t.name}
                        </Link>
                        <span className="text-[10px] font-mono text-slate-400">
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
