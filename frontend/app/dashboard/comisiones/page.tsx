"use client";

import React, { useState, useEffect } from "react";
import {
  DollarSign,
  Users,
  Calendar,
  Filter,
  CheckCircle2,
  Clock,
  Coins,
  ChevronRight,
  Eye,
  Plus,
} from "lucide-react";

export default function ComisionesPage() {
  const [comisionesData, setComisionesData] = useState<any>(null);
  const [payouts, setPayouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [staffList, setStaffList] = useState<any[]>([]);
  const [selectedStaff, setSelectedStaff] = useState<string>("ALL");
  const [period, setPeriod] = useState<string>("30d");

  const fetchData = async () => {
    try {
      setLoading(true);
      const [commRes, payRes, staffRes] = await Promise.all([
        fetch(`/api/commissions?period=${period}${selectedStaff !== "ALL" ? `&staffId=${selectedStaff}` : ""}`),
        fetch(`/api/commission-payouts${selectedStaff !== "ALL" ? `?staffId=${selectedStaff}` : ""}`),
        fetch("/api/staff"),
      ]);

      if (commRes.ok) {
        const commJson = await commRes.json();
        setComisionesData(commJson);
      }
      if (payRes.ok) {
        const payJson = await payRes.json();
        setPayouts(payJson.payouts || payJson.data || []);
      }
      if (staffRes.ok) {
        const staffJson = await staffRes.json();
        setStaffList(staffJson.data || staffJson.staff || []);
      }
    } catch (e) {
      // silent
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [period, selectedStaff]);

  const formatGs = (val: number) => {
    return new Intl.NumberFormat("es-PY", {
      style: "currency",
      currency: "PYG",
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <DollarSign className="h-6 w-6 text-indigo-600" />
            Comisiones y Liquidaciones
          </h2>
          <p className="text-sm text-slate-500">
            Control de comisiones devengadas por citas completadas y pagos a profesionales.
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          <select
            value={selectedStaff}
            onChange={(e) => setSelectedStaff(e.target.value)}
            className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-600 focus:outline-none"
          >
            <option value="ALL">Todos los profesionales</option>
            {staffList.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.commissionPercentage}%)
              </option>
            ))}
          </select>

          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-600 focus:outline-none"
          >
            <option value="today">Hoy</option>
            <option value="7d">Últimos 7 días</option>
            <option value="30d">Últimos 30 días</option>
            <option value="all">Todo</option>
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1 flex items-center justify-between">
            <span>Comisión Devengada</span>
            <Coins className="h-4 w-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">
            {formatGs(comisionesData?.summary?.totalCommission || 0)}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            En base a {formatGs(comisionesData?.summary?.totalBilled || 0)} cobrados
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1 flex items-center justify-between">
            <span>Comisiones Pendientes</span>
            <Clock className="h-4 w-4 text-amber-500" />
          </div>
          <div className="text-2xl font-extrabold text-amber-600">
            {formatGs(comisionesData?.summary?.totalPendingCommission || 0)}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Por liquidar a profesionales
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1 flex items-center justify-between">
            <span>Comisiones Pagadas</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-600">
            {formatGs(comisionesData?.summary?.totalPaidCommission || 0)}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Total liquidaciones emitidas
          </div>
        </div>
      </div>

      {/* Payouts Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-800">Historial de Liquidaciones</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 font-bold uppercase tracking-wider text-slate-400 text-[10px]">
                <th className="py-3 px-4">Fecha Pago</th>
                <th className="py-3 px-4">Profesional</th>
                <th className="py-3 px-4">Período</th>
                <th className="py-3 px-4">Método</th>
                <th className="py-3 px-4">Estado</th>
                <th className="py-3 px-4 text-right">Monto Pagado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Cargando liquidaciones...
                  </td>
                </tr>
              ) : payouts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No hay liquidaciones registradas en este período.
                  </td>
                </tr>
              ) : (
                payouts.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3 px-4 text-slate-500 font-mono">
                      {new Date(p.paidAt || p.createdAt).toLocaleDateString("es-PY")}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-800">
                      {p.staff?.name || "Staff"}
                    </td>
                    <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                      {new Date(p.periodStart).toLocaleDateString("es-PY")} - {new Date(p.periodEnd).toLocaleDateString("es-PY")}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {p.paymentMethod}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {p.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-bold font-mono text-emerald-600">
                      {formatGs(p.amountPaid || p.grossCommission)}
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
