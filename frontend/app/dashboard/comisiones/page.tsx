"use client";

import { useMemo, useState } from "react";
import {
  Coins,
  TrendingUp,
  Percent,
  ArrowUpRight,
  FileCheck,
} from "lucide-react";
import { formatInTimeZone } from "date-fns-tz";
import { useDashboardStore } from "@/store/useDashboardStore";
import Card from "@/components/dashboard/ui/Card";
import StatCard from "@/components/dashboard/ui/StatCard";
import Modal from "@/components/dashboard/ui/Modal";
import { formatGs } from "@/lib/dashboard-dates";
import type { StaffMember } from "@/lib/dashboard-types";

const PERIODS = ["Hoy", "Esta Semana", "Este Mes", "Todo el Historial"] as const;

export default function ComisionesPage() {
  const { staff, appointments, services, business, updateStaffCommission, pushToast } =
    useDashboardStore();
  const [period, setPeriod] = useState<(typeof PERIODS)[number]>("Esta Semana");
  const [selectedStaffForSettlement, setSelectedStaffForSettlement] = useState<StaffMember | null>(null);

  // Compute commissions by staff
  const staffStats = useMemo(() => {
    return staff.map((member) => {
      // Find appointments completed/confirmed for this staff
      const memberAppointments = appointments.filter(
        (a) => a.staffId === member.id && a.status !== "cancelled"
      );

      const totalBilled = memberAppointments.reduce((sum, a) => {
        const s = services.find((sv) => sv.id === a.serviceId);
        return sum + (s?.price ?? 0);
      }, 0);

      const commissionRate = member.commissionPercentage || 50;
      const commissionToPay = Math.round((totalBilled * commissionRate) / 100);
      const salonProfit = totalBilled - commissionToPay;

      return {
        member,
        totalBilled,
        commissionRate,
        commissionToPay,
        salonProfit,
        appointmentCount: memberAppointments.length,
        appointments: memberAppointments,
      };
    });
  }, [staff, appointments, services]);

  const totalBilledAll = staffStats.reduce((acc, s) => acc + s.totalBilled, 0);
  const totalCommissionsAll = staffStats.reduce((acc, s) => acc + s.commissionToPay, 0);
  const totalSalonProfitAll = totalBilledAll - totalCommissionsAll;

  function handleRateChange(staffId: string, newRate: number) {
    if (newRate < 0 || newRate > 100) return;
    updateStaffCommission(staffId, newRate);
    pushToast("success", `Comisión actualizada al ${newRate}%`);
  }

  function handleSettleCommissions(member: StaffMember, amount: number) {
    setSelectedStaffForSettlement(null);
    pushToast("success", `Liquidación de ${formatGs(amount)} registrada para ${member.name}.`);
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Comisiones & Liquidación de Equipo
          </h1>
          <p className="text-sm text-slate-500">
            Control de producción por estilista, porcentajes variables y cálculo para pago de comisiones.
          </p>
        </div>
        <div className="flex items-center gap-1.5 rounded-2xl border border-slate-200 bg-white p-1 shadow-sm">
          {PERIODS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPeriod(p)}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                period === p
                  ? "bg-primary text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Overview KPI Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          label="Total Facturado (Equipo)"
          value={formatGs(totalBilledAll)}
          icon={TrendingUp}
          delta={14}
        />
        <StatCard
          label="Comisiones a Pagar"
          value={formatGs(totalCommissionsAll)}
          icon={Coins}
        />
        <StatCard
          label="Ganancia Neta del Salón"
          value={formatGs(totalSalonProfitAll)}
          icon={ArrowUpRight}
          delta={10}
        />
      </div>

      {/* Staff Cards with Commission Sliders */}
      <div className="grid gap-5 lg:grid-cols-3">
        {staffStats.map(
          ({ member, totalBilled, commissionRate, commissionToPay, salonProfit, appointmentCount }) => (
            <Card key={member.id} className="flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span
                      className="flex h-12 w-12 items-center justify-center rounded-2xl text-sm font-bold text-white shadow-sm"
                      style={{ background: member.color }}
                    >
                      {member.avatar}
                    </span>
                    <div>
                      <h3 className="font-bold text-slate-900">{member.name}</h3>
                      <p className="text-xs text-slate-500">{member.role}</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                    {appointmentCount} turnos
                  </span>
                </div>

                {/* Production Breakdown */}
                <div className="mt-4 rounded-2xl bg-slate-50 p-3.5 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Facturación Total:</span>
                    <strong className="text-slate-900 font-semibold">{formatGs(totalBilled)}</strong>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="flex items-center gap-1">
                      <Percent className="h-3 w-3 text-primary" /> % Comisión Acordado:
                    </span>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={commissionRate}
                        onChange={(e) => handleRateChange(member.id, Number(e.target.value))}
                        className="w-14 rounded-lg border border-slate-300 bg-white px-2 py-0.5 text-right font-bold text-primary focus:outline-none"
                      />
                      <span className="font-bold text-slate-700">%</span>
                    </div>
                  </div>
                  <div className="border-t border-slate-200/80 pt-2 flex items-center justify-between font-bold text-sm">
                    <span className="text-indigo-900">A Liquidar:</span>
                    <span className="text-indigo-600">{formatGs(commissionToPay)}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>Retención local:</span>
                    <span>{formatGs(salonProfit)}</span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={() => setSelectedStaffForSettlement(member)}
                disabled={commissionToPay === 0}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:opacity-40"
              >
                <FileCheck className="h-3.5 w-3.5 text-emerald-400" />
                Registrar Pago de Comisión
              </button>
            </Card>
          )
        )}
      </div>

      {/* Detailed Services Table */}
      <Card>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Desglose de Servicios & Comisiones ({period})
            </h2>
            <p className="text-xs text-slate-500">
              Registro turno por turno con el cálculo de comisión aplicado a cada profesional.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                <th className="pb-3 pl-2">Fecha & Hora</th>
                <th className="pb-3">Cliente</th>
                <th className="pb-3">Profesional</th>
                <th className="pb-3">Servicio</th>
                <th className="pb-3 text-right">Precio Turno</th>
                <th className="pb-3 text-right">% Com.</th>
                <th className="pb-3 pr-2 text-right">Comisión a Pagar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {appointments
                .filter((a) => a.status !== "cancelled")
                .map((a) => {
                  const service = services.find((s) => s.id === a.serviceId);
                  const staffMember = staff.find((st) => st.id === a.staffId);
                  const price = service?.price ?? 0;
                  const rate = staffMember?.commissionPercentage ?? 50;
                  const commission = Math.round((price * rate) / 100);

                  return (
                    <tr key={a.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3 pl-2 font-mono text-slate-600">
                        {formatInTimeZone(a.start, business.timezone, "dd/MM/yyyy HH:mm")}
                      </td>
                      <td className="py-3 font-medium text-slate-900">{a.clientName}</td>
                      <td className="py-3">
                        <span className="inline-flex items-center gap-1.5 font-medium text-slate-700">
                          <span
                            className="h-2 w-2 rounded-full"
                            style={{ background: staffMember?.color ?? "#4f46e5" }}
                          />
                          {staffMember?.name ?? "General"}
                        </span>
                      </td>
                      <td className="py-3 text-slate-600">{service?.name}</td>
                      <td className="py-3 text-right font-medium text-slate-900">
                        {formatGs(price)}
                      </td>
                      <td className="py-3 text-right text-slate-500 font-mono">{rate}%</td>
                      <td className="py-3 pr-2 text-right font-bold text-indigo-600">
                        {formatGs(commission)}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Settlement Confirmation Modal */}
      <Modal
        open={Boolean(selectedStaffForSettlement)}
        title="Confirmar Liquidación de Comisión"
        onClose={() => setSelectedStaffForSettlement(null)}
      >
        {selectedStaffForSettlement && (
          <div className="space-y-4 text-sm">
            <p className="text-slate-600">
              ¿Deseas registrar el pago de comisiones correspondiente a{" "}
              <strong className="text-slate-900">{selectedStaffForSettlement.name}</strong>?
            </p>

            <div className="rounded-2xl bg-indigo-50/70 border border-indigo-100 p-4 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-indigo-900 font-semibold">Profesional:</span>
                <span className="text-slate-900 font-bold">{selectedStaffForSettlement.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-indigo-900 font-semibold">% de Comisión:</span>
                <span className="text-slate-900 font-bold">
                  {selectedStaffForSettlement.commissionPercentage}%
                </span>
              </div>
              <div className="flex justify-between border-t border-indigo-200/60 pt-2 text-sm font-bold">
                <span className="text-indigo-950">Monto a Liquidar:</span>
                <span className="text-primary font-extrabold">
                  {formatGs(
                    staffStats.find((s) => s.member.id === selectedStaffForSettlement.id)
                      ?.commissionToPay ?? 0
                  )}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-500">
              Este movimiento se registrará en el historial de comisiones para el cierre contable.
            </p>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedStaffForSettlement(null)}
                className="flex-1 rounded-xl border border-slate-200 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  const stat = staffStats.find(
                    (s) => s.member.id === selectedStaffForSettlement.id
                  );
                  handleSettleCommissions(
                    selectedStaffForSettlement,
                    stat?.commissionToPay ?? 0
                  );
                }}
                className="flex-1 rounded-xl bg-primary py-2.5 text-xs font-semibold text-white shadow-sm hover:opacity-95"
              >
                Confirmar Liquidación
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
