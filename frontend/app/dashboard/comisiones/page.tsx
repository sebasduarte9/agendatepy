"use client";

import { useEffect, useState, useTransition } from "react";
import {
  Coins,
  TrendingUp,
  Percent,
  CheckCircle2,
  Calendar,
  User,
  Filter,
  ArrowRight,
  Info,
  DollarSign,
  AlertCircle,
  FileCheck,
  History,
  Eye,
  CreditCard,
  Banknote,
  Receipt,
  X,
  Download,
  Printer,
} from "lucide-react";
import { formatInTimeZone } from "date-fns-tz";
import { useDashboardStore } from "@/store/useDashboardStore";
import Card from "@/components/dashboard/ui/Card";
import StatCard from "@/components/dashboard/ui/StatCard";
import Modal from "@/components/dashboard/ui/Modal";
import PayoutReceiptModal from "@/components/dashboard/PayoutReceiptModal";
import { formatGs } from "@/lib/dashboard-dates";
import { COMMISSION_TZ } from "@/lib/commission-dates";

const PERIOD_OPTIONS = [
  { id: "today", label: "Hoy" },
  { id: "week", label: "Esta semana" },
  { id: "month", label: "Este mes" },
  { id: "all", label: "Todo el historial" },
  { id: "custom", label: "Personalizado" },
] as const;

const PAYMENT_METHODS = ["Efectivo", "Tarjeta POS", "Transferencia", "Billetera"] as const;

interface CommissionItem {
  appointmentId: string;
  date: string;
  staffId: string;
  staffName: string;
  clientId: string | null;
  clientName: string;
  serviceId: string;
  serviceName: string;
  servicePrice: number;
  chargedAmount: number;
  commissionPercentage: number;
  commissionAmount: number;
  paymentMethods: string;
  isPaid: boolean;
  payoutId: string | null;
  paidAt: string | null;
}

interface CommissionStaffSummary {
  staffId: string;
  staffName: string;
  commissionPercentage: number;
  servicesCount: number;
  totalCharged: number;
  totalCommission: number;
  paidCommission: number;
  pendingCommission: number;
}

interface CommissionResponse {
  ok: boolean;
  summary: {
    totalCharged: number;
    commissionableBase: number;
    totalCommission: number;
    grossCommission: number;
    paidCommission: number;
    pendingCommission: number;
    completedServicesCount: number;
    pendingServicesCount: number;
  };
  items: CommissionItem[];
  byStaff: CommissionStaffSummary[];
  period: string;
  timezone: string;
}

interface PayoutSummary {
  id: string;
  staffId: string;
  staffName: string;
  periodStart: string;
  periodEnd: string;
  grossCommission: number;
  amountPaid: number;
  paymentMethod: string;
  cashMovementId: string | null;
  status: string;
  paidAt: string | null;
  paidBy: string | null;
  notes: string | null;
  itemsCount: number;
}

export default function ComisionesPage() {
  const storeStaff = useDashboardStore((s) => s.staff);
  const currentUserRole = useDashboardStore((s) => s.currentUserRole);
  const pushToast = useDashboardStore((s) => s.pushToast);

  const [activeTab, setActiveTab] = useState<"calculo" | "historial">("calculo");
  const [period, setPeriod] = useState<string>("month");
  const [selectedStaffId, setSelectedStaffId] = useState<string>("");
  const [customStart, setCustomStart] = useState<string>("");
  const [customEnd, setCustomEnd] = useState<string>("");

  const [data, setData] = useState<CommissionResponse | null>(null);
  const [payouts, setPayouts] = useState<PayoutSummary[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [payoutsLoading, setPayoutsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Modal de Liquidación
  const [liquidateModalOpen, setLiquidateModalOpen] = useState(false);
  const [selectedStaffToLiquidate, setSelectedStaffToLiquidate] = useState<CommissionStaffSummary | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string>("Efectivo");
  const [payoutNotes, setPayoutNotes] = useState<string>("");
  const [isSubmittingPayout, setIsSubmittingPayout] = useState(false);

  // Modal de Auditoría de Liquidación Histórica
  const [auditModalOpen, setAuditModalOpen] = useState(false);
  const [selectedPayoutAudit, setSelectedPayoutAudit] = useState<any | null>(null);
  const [auditLoading, setAuditLoading] = useState(false);

  // Modal de Recibo Imprimible
  const [selectedReceiptPayoutId, setSelectedReceiptPayoutId] = useState<string | null>(null);

  const fetchCommissions = () => {
    setLoading(true);
    setError(null);

    const params = new URLSearchParams();
    params.set("period", period);
    if (selectedStaffId) params.set("staffId", selectedStaffId);
    if (period === "custom") {
      if (customStart) params.set("startDate", customStart);
      if (customEnd) params.set("endDate", customEnd);
    }

    fetch(`/api/commissions?${params.toString()}`)
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok || !json.ok) {
          throw new Error(json.message || "Error al obtener comisiones.");
        }
        return json as CommissionResponse;
      })
      .then((json) => {
        setData(json);
      })
      .catch((err) => {
        console.error("Error al cargar comisiones:", err);
        setError(err.message || "Error de conexión.");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const fetchPayouts = () => {
    setPayoutsLoading(true);
    const params = new URLSearchParams();
    if (selectedStaffId) params.set("staffId", selectedStaffId);

    fetch(`/api/commission-payouts?${params.toString()}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.ok && Array.isArray(json.payouts)) {
          setPayouts(json.payouts);
        }
      })
      .catch((err) => console.error("Error al cargar historial de liquidaciones:", err))
      .finally(() => setPayoutsLoading(false));
  };

  useEffect(() => {
    fetchCommissions();
    fetchPayouts();
  }, [period, selectedStaffId, customStart, customEnd]);

  const summary = data?.summary || {
    totalCharged: 0,
    commissionableBase: 0,
    totalCommission: 0,
    grossCommission: 0,
    paidCommission: 0,
    pendingCommission: 0,
    completedServicesCount: 0,
    pendingServicesCount: 0,
  };

  const handleOpenLiquidate = (staffSummary?: CommissionStaffSummary) => {
    if (staffSummary) {
      setSelectedStaffToLiquidate(staffSummary);
    } else if (selectedStaffId) {
      const found = data?.byStaff?.find((s) => s.staffId === selectedStaffId);
      setSelectedStaffToLiquidate(found || null);
    } else if (data?.byStaff && data.byStaff.length === 1) {
      setSelectedStaffToLiquidate(data.byStaff[0]);
    } else {
      setSelectedStaffToLiquidate(null);
    }
    setPaymentMethod("Efectivo");
    setPayoutNotes("");
    setLiquidateModalOpen(true);
  };

  const handleConfirmPayout = async () => {
    if (!selectedStaffToLiquidate) {
      pushToast("error", "Seleccioná un colaborador para liquidar.");
      return;
    }

    if (selectedStaffToLiquidate.pendingCommission <= 0) {
      pushToast("error", "El colaborador no tiene comisiones pendientes.");
      return;
    }

    setIsSubmittingPayout(true);
    try {
      // Filtrar citas pendientes de este colaborador en el set actual
      const pendingItems = data?.items?.filter(
        (i) => i.staffId === selectedStaffToLiquidate.staffId && !i.isPaid
      );

      if (!pendingItems || pendingItems.length === 0) {
        throw new Error("No hay turnos pendientes para liquidar.");
      }

      // Fechas de período del lote
      const dates = pendingItems.map((i) => new Date(i.date).getTime());
      const minDate = new Date(Math.min(...dates)).toISOString();
      const maxDate = new Date(Math.max(...dates)).toISOString();

      const res = await fetch("/api/commission-payouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          staffId: selectedStaffToLiquidate.staffId,
          periodStart: minDate,
          periodEnd: maxDate,
          paymentMethod,
          appointmentIds: pendingItems.map((i) => i.appointmentId),
          notes: payoutNotes,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(json.message || "Error al registrar la liquidación.");
      }

      pushToast(
        "success",
        `Liquidación de ${formatGs(json.payout.amountPaid)} registrada para ${selectedStaffToLiquidate.staffName}. Egreso asentado en Caja.`
      );

      setLiquidateModalOpen(false);
      fetchCommissions();
      fetchPayouts();
    } catch (err: any) {
      console.error("Error al liquidar comisiones:", err);
      pushToast("error", err.message || "No se pudo procesar la liquidación.");
    } finally {
      setIsSubmittingPayout(false);
    }
  };

  const handleOpenAudit = (payoutId: string) => {
    setAuditLoading(true);
    setAuditModalOpen(true);
    fetch(`/api/commission-payouts/${payoutId}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.ok && json.payout) {
          setSelectedPayoutAudit(json.payout);
        } else {
          pushToast("error", "No se pudo cargar el detalle de la liquidación.");
          setAuditModalOpen(false);
        }
      })
      .catch((err) => {
        console.error("Error al auditar liquidación:", err);
        pushToast("error", "Error de conexión al auditar.");
        setAuditModalOpen(false);
      })
      .finally(() => setAuditLoading(false));
  };

  return (
    <div className="space-y-6">
      {/* Encabezado y Navegación de Pestañas */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Comisiones & Liquidación de Equipo
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Cálculo determinista, cierre de períodos y liquidación directa con egreso automático en caja.
          </p>
        </div>

        {/* Pestañas Operativas */}
        <div className="flex items-center gap-1 rounded-2xl border border-slate-200 bg-white p-1 shadow-sm dark:border-white/10 dark:bg-slate-900">
          <button
            type="button"
            onClick={() => setActiveTab("calculo")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
              activeTab === "calculo"
                ? "bg-slate-900 text-white shadow-sm dark:bg-white dark:text-slate-900"
                : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            }`}
          >
            <Coins className="h-4 w-4" />
            Cálculo & Devengado
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("historial")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
              activeTab === "historial"
                ? "bg-slate-900 text-white shadow-sm dark:bg-white dark:text-slate-900"
                : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            }`}
          >
            <History className="h-4 w-4" />
            Historial de Liquidaciones ({payouts.length})
          </button>
        </div>
      </div>

      {activeTab === "calculo" ? (
        <>
          {/* Barra de Filtros Activos */}
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-slate-900">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Período:
              </span>
              <div className="flex flex-wrap items-center gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
                {PERIOD_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setPeriod(opt.id)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                      period === opt.id
                        ? "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white"
                        : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              {/* Rango Personalizado */}
              {period === "custom" && (
                <div className="flex items-center gap-2 mt-2 sm:mt-0">
                  <input
                    type="date"
                    value={customStart}
                    onChange={(e) => setCustomStart(e.target.value)}
                    className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                  <span className="text-xs text-slate-400">a</span>
                  <input
                    type="date"
                    value={customEnd}
                    onChange={(e) => setCustomEnd(e.target.value)}
                    className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              )}
            </div>

            {/* Filtro por Colaborador */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Colaborador:
                </span>
                <select
                  value={selectedStaffId}
                  onChange={(e) => setSelectedStaffId(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 focus:outline-none dark:border-white/10 dark:bg-slate-800 dark:text-slate-200"
                >
                  <option value="">Todos los colaboradores</option>
                  {storeStaff.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.name} ({member.commissionPercentage || 50}%)
                    </option>
                  ))}
                </select>
              </div>

              {/* Botón Exportar CSV */}
              <a
                href={`/api/reports/commissions?period=${period}${selectedStaffId ? `&staffId=${selectedStaffId}` : ""}${period === "custom" && customStart ? `&startDate=${customStart}` : ""}${period === "custom" && customEnd ? `&endDate=${customEnd}` : ""}&format=csv`}
                download
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-white/10 dark:bg-slate-800 dark:text-slate-200"
              >
                <Download className="h-4 w-4 text-slate-500" />
                Exportar CSV
              </a>

              {/* Botón Liquidar si hay colaborador seleccionado con saldo pendiente */}
              {summary.pendingCommission > 0 && selectedStaffId && (
                <button
                  type="button"
                  onClick={() => handleOpenLiquidate()}
                  className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-slate-800 dark:bg-white dark:text-slate-900"
                >
                  <FileCheck className="h-4 w-4 text-emerald-400" />
                  Liquidar Pendiente ({formatGs(summary.pendingCommission)})
                </button>
              )}
            </div>
          </div>

          {/* Manejo de Error */}
          {error && (
            <div className="flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-medium text-rose-800 dark:border-rose-900/30 dark:bg-rose-950/20 dark:text-rose-400">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Tarjetas de Resumen KPI */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Total Devengado"
              value={formatGs(summary.grossCommission || summary.totalCommission)}
              icon={TrendingUp}
            />
            <StatCard
              label="Ya Liquidado / Pagado"
              value={formatGs(summary.paidCommission || 0)}
              icon={CheckCircle2}
            />
            <StatCard
              label="Pendiente de Liquidar"
              value={formatGs(summary.pendingCommission || 0)}
              icon={Coins}
            />
            <StatCard
              label="Servicios Realizados"
              value={`${summary.completedServicesCount} turnos (${summary.pendingServicesCount} pendientes)`}
              icon={DollarSign}
            />
          </div>

          {/* Rendimiento por Colaborador & Acciones de Liquidación */}
          {data && data.byStaff && data.byStaff.length > 0 && !selectedStaffId && (
            <Card>
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    Rendimiento & Liquidaciones por Colaborador
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Control de producción y saldo pendiente de pago para cada profesional.
                  </p>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {data.byStaff.map((s) => (
                  <div
                    key={s.staffId}
                    className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 transition hover:border-slate-300 dark:border-white/10 dark:bg-slate-800/40"
                  >
                    <div>
                      <div className="flex items-center justify-between pb-3 border-b border-slate-200/60 dark:border-slate-700/60">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-xs font-bold text-white dark:bg-white dark:text-slate-900">
                            {s.staffName.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                              {s.staffName}
                            </h3>
                            <span className="text-[11px] font-medium text-slate-500">
                              {s.commissionPercentage}% de comisión
                            </span>
                          </div>
                        </div>
                        <span className="rounded-full bg-slate-200/70 px-2 py-0.5 text-[11px] font-bold text-slate-700 dark:bg-slate-700 dark:text-slate-300">
                          {s.servicesCount} turnos
                        </span>
                      </div>
                      <div className="mt-3 space-y-1.5 text-xs">
                        <div className="flex justify-between text-slate-600 dark:text-slate-400">
                          <span>Facturado en caja:</span>
                          <strong className="font-semibold text-slate-900 dark:text-white">
                            {formatGs(s.totalCharged)}
                          </strong>
                        </div>
                        <div className="flex justify-between text-slate-600 dark:text-slate-400">
                          <span>Comisión devengada:</span>
                          <span>{formatGs(s.totalCommission)}</span>
                        </div>
                        <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-medium">
                          <span>Ya liquidado:</span>
                          <span>{formatGs(s.paidCommission)}</span>
                        </div>
                        <div className="flex justify-between text-indigo-700 dark:text-indigo-400 font-bold border-t border-slate-200/70 pt-1.5 dark:border-slate-700/70">
                          <span>Pendiente de pago:</span>
                          <span className="text-sm">{formatGs(s.pendingCommission)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-2">
                      <button
                        type="button"
                        onClick={() => handleOpenLiquidate(s)}
                        disabled={s.pendingCommission <= 0}
                        className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:opacity-40 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
                      >
                        <FileCheck className="h-3.5 w-3.5 text-emerald-400 dark:text-emerald-600" />
                        {s.pendingCommission > 0 ? "Liquidar Comisiones" : "Comisiones al día"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Tabla de Detalle Cita por Cita */}
          <Card>
            <div className="mb-4 flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-3">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Detalle de Servicios & Liquidación
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Cada comisión calculada turno por turno a partir de cobros reales registrados en caja.
                </p>
              </div>
            </div>

            {loading ? (
              <div className="py-12 text-center text-xs text-slate-400">
                Cargando comisiones operativas...
              </div>
            ) : !data || data.items.length === 0 ? (
              <div className="py-12 text-center">
                <Coins className="mx-auto h-8 w-8 text-slate-300 dark:text-slate-600" />
                <h3 className="mt-2 text-sm font-bold text-slate-700 dark:text-slate-300">
                  Sin comisiones en este período
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  No se registran turnos completados con cobro en caja para los filtros seleccionados.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400">
                    <tr>
                      <th className="py-3 px-3">Fecha & Hora</th>
                      <th className="py-3 px-3">Profesional</th>
                      <th className="py-3 px-3">Cliente</th>
                      <th className="py-3 px-3">Servicio</th>
                      <th className="py-3 px-3 text-right">Cobrado en Caja</th>
                      <th className="py-3 px-3 text-center">%</th>
                      <th className="py-3 px-3 text-right">Comisión</th>
                      <th className="py-3 px-3 text-center">Estado</th>
                      <th className="py-3 px-3 text-center">Auditoría</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {data.items.map((item) => (
                      <tr
                        key={item.appointmentId}
                        className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition"
                      >
                        <td className="py-3 px-3 font-mono text-slate-600 dark:text-slate-300 whitespace-nowrap">
                          {formatInTimeZone(
                            item.date,
                            COMMISSION_TZ,
                            "dd/MM/yyyy HH:mm"
                          )}
                        </td>
                        <td className="py-3 px-3 font-medium text-slate-900 dark:text-white whitespace-nowrap">
                          {item.staffName}
                        </td>
                        <td className="py-3 px-3 text-slate-700 dark:text-slate-200 whitespace-nowrap">
                          {item.clientName}
                        </td>
                        <td className="py-3 px-3 text-slate-600 dark:text-slate-300">
                          <div>{item.serviceName}</div>
                          {item.servicePrice !== item.chargedAmount && (
                            <span className="text-[10px] text-slate-400">
                              (Precio lista: {formatGs(item.servicePrice)})
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-right font-semibold text-slate-900 dark:text-white whitespace-nowrap">
                          <div>{formatGs(item.chargedAmount)}</div>
                          <span className="text-[10px] font-normal text-slate-500">
                            {item.paymentMethods}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center font-bold text-slate-600 dark:text-slate-300">
                          {item.commissionPercentage}%
                        </td>
                        <td className="py-3 px-3 text-right font-bold text-indigo-600 dark:text-indigo-400 whitespace-nowrap">
                          {formatGs(item.commissionAmount)}
                        </td>
                        <td className="py-3 px-3 text-center whitespace-nowrap">
                          {item.isPaid ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                              <CheckCircle2 className="h-3 w-3" />
                              Liquidada
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:bg-amber-950/40 dark:text-amber-400">
                              Pendiente
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-center whitespace-nowrap">
                          <span
                            className="inline-block rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-mono text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                            title={`${formatGs(item.chargedAmount)} × ${item.commissionPercentage}% = ${formatGs(item.commissionAmount)}`}
                          >
                            {formatGs(item.chargedAmount)} × {item.commissionPercentage}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </>
      ) : (
        /* Pestaña: HISTORIAL DE LIQUIDACIONES */
        <Card>
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 dark:border-white/5 pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Historial de Liquidaciones Registradas
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Registro inmutable de pagos de comisiones efectuados con egreso asentado en caja.
              </p>
            </div>
            {payouts.length > 0 && (
              <a
                href={`/api/reports/payouts?${selectedStaffId ? `staffId=${selectedStaffId}&` : ""}format=csv`}
                download
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-white/10 dark:bg-slate-800 dark:text-slate-200"
              >
                <Download className="h-3.5 w-3.5 text-slate-500" />
                Exportar Historial CSV
              </a>
            )}
          </div>

          {payoutsLoading ? (
            <div className="py-12 text-center text-xs text-slate-400">
              Cargando historial de liquidaciones...
            </div>
          ) : payouts.length === 0 ? (
            <div className="py-12 text-center">
              <History className="mx-auto h-8 w-8 text-slate-300 dark:text-slate-600" />
              <h3 className="mt-2 text-sm font-bold text-slate-700 dark:text-slate-300">
                No hay liquidaciones registradas
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                Las liquidaciones confirmadas aparecerán aquí con su detalle de auditoría inmutable.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400">
                  <tr>
                    <th className="py-3 px-3">Fecha de Pago</th>
                    <th className="py-3 px-3">Profesional</th>
                    <th className="py-3 px-3">Período Liquidado</th>
                    <th className="py-3 px-3 text-center">Servicios</th>
                    <th className="py-3 px-3 text-right">Monto Liquidado</th>
                    <th className="py-3 px-3 text-center">Método de Pago</th>
                    <th className="py-3 px-3 text-center">Estado</th>
                    <th className="py-3 px-3 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {payouts.map((p) => (
                    <tr
                      key={p.id}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition"
                    >
                      <td className="py-3 px-3 font-mono text-slate-600 dark:text-slate-300 whitespace-nowrap">
                        {p.paidAt
                          ? formatInTimeZone(p.paidAt, COMMISSION_TZ, "dd/MM/yyyy HH:mm")
                          : "Pendiente"}
                      </td>
                      <td className="py-3 px-3 font-semibold text-slate-900 dark:text-white whitespace-nowrap">
                        {p.staffName}
                      </td>
                      <td className="py-3 px-3 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                        {formatInTimeZone(p.periodStart, COMMISSION_TZ, "dd/MM")} al{" "}
                        {formatInTimeZone(p.periodEnd, COMMISSION_TZ, "dd/MM/yyyy")}
                      </td>
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <span className="rounded-md bg-slate-100 px-2 py-0.5 font-bold dark:bg-slate-800">
                          {p.itemsCount} turnos
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-indigo-600 dark:text-indigo-400 whitespace-nowrap text-sm">
                        {formatGs(p.amountPaid)}
                      </td>
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                          {p.paymentMethod}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                          <CheckCircle2 className="h-3 w-3" />
                          {p.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenAudit(p.id)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-white/10 dark:bg-slate-800 dark:text-slate-200"
                          >
                            <Eye className="h-3.5 w-3.5 text-slate-500" />
                            Auditoría
                          </button>
                          <button
                            type="button"
                            onClick={() => setSelectedReceiptPayoutId(p.id)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50/50 px-2.5 py-1 text-xs font-semibold text-indigo-700 shadow-sm transition hover:bg-indigo-100 dark:border-indigo-900/40 dark:bg-indigo-950/30 dark:text-indigo-300"
                          >
                            <Printer className="h-3.5 w-3.5 text-indigo-500" />
                            Recibo
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* Modal: Confirmación de Liquidación */}
      <Modal
        open={liquidateModalOpen}
        onClose={() => !isSubmittingPayout && setLiquidateModalOpen(false)}
        title="Confirmar Liquidación de Comisiones"
      >
        {selectedStaffToLiquidate && (
          <div className="space-y-4 text-xs">
            <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/50 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Profesional:</span>
                <strong className="text-slate-900 font-bold dark:text-white">
                  {selectedStaffToLiquidate.staffName}
                </strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Porcentaje acordado:</span>
                <span className="font-semibold">{selectedStaffToLiquidate.commissionPercentage}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Total comisiones devengadas:</span>
                <span>{formatGs(selectedStaffToLiquidate.totalCommission)}</span>
              </div>
              <div className="flex justify-between text-emerald-600 font-medium">
                <span>Ya pagado anteriormente:</span>
                <span>{formatGs(selectedStaffToLiquidate.paidCommission)}</span>
              </div>
              <div className="border-t border-slate-200 pt-2 flex justify-between text-base font-bold text-indigo-600 dark:text-indigo-400">
                <span>Monto a Liquidar:</span>
                <span>{formatGs(selectedStaffToLiquidate.pendingCommission)}</span>
              </div>
            </div>

            {/* Selector de Método de Pago */}
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                Método de Pago para Caja:
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white p-2.5 font-semibold text-slate-800 shadow-sm focus:outline-none dark:border-white/10 dark:bg-slate-800 dark:text-slate-200"
              >
                {PAYMENT_METHODS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            {/* Notas opcionales */}
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                Notas / Referencia (Opcional):
              </label>
              <input
                type="text"
                placeholder="Ej. Recibo N° 458 / Pago quincenal"
                value={payoutNotes}
                onChange={(e) => setPayoutNotes(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-800 shadow-sm focus:outline-none dark:border-white/10 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div className="rounded-xl bg-amber-50 p-3 text-[11px] text-amber-800 dark:bg-amber-950/30 dark:text-amber-300 flex items-start gap-2">
              <Info className="h-4 w-4 shrink-0 mt-0.5" />
              <span>
                Al confirmar, se creará un egreso financiero automático en Caja (EXPENSE) por{" "}
                <strong>{formatGs(selectedStaffToLiquidate.pendingCommission)}</strong> y los turnos
                quedarán marcados como liquidados con snapshot inmutable.
              </span>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-white/5">
              <button
                type="button"
                onClick={() => setLiquidateModalOpen(false)}
                disabled={isSubmittingPayout}
                className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmPayout}
                disabled={isSubmittingPayout}
                className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-slate-800 disabled:opacity-50 dark:bg-white dark:text-slate-900"
              >
                {isSubmittingPayout ? "Procesando..." : "Confirmar Pago & Generar Egreso"}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal: Auditoría de Liquidación Histórica */}
      <Modal
        open={auditModalOpen}
        onClose={() => setAuditModalOpen(false)}
        title="Auditoría Inmutable de Liquidación"
      >
        {auditLoading ? (
          <div className="py-12 text-center text-xs text-slate-400">
            Cargando auditoría de la liquidación...
          </div>
        ) : selectedPayoutAudit ? (
          <div className="space-y-4 text-xs">
            {/* Cabecera de la Liquidación */}
            <div className="grid grid-cols-2 gap-3 rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/50">
              <div>
                <span className="text-slate-400">Profesional:</span>
                <p className="font-bold text-slate-900 dark:text-white">
                  {selectedPayoutAudit.staffName}
                </p>
              </div>
              <div>
                <span className="text-slate-400">Monto Liquidado:</span>
                <p className="font-bold text-indigo-600 dark:text-indigo-400 text-sm">
                  {formatGs(selectedPayoutAudit.amountPaid)}
                </p>
              </div>
              <div>
                <span className="text-slate-400">Fecha de Pago:</span>
                <p className="font-mono text-slate-700 dark:text-slate-300">
                  {formatInTimeZone(
                    selectedPayoutAudit.paidAt,
                    COMMISSION_TZ,
                    "dd/MM/yyyy HH:mm"
                  )}
                </p>
              </div>
              <div>
                <span className="text-slate-400">Método de Pago:</span>
                <p className="font-semibold text-slate-700 dark:text-slate-300">
                  {selectedPayoutAudit.paymentMethod}
                </p>
              </div>
              {selectedPayoutAudit.paidBy && (
                <div>
                  <span className="text-slate-400">Liquidado por:</span>
                  <p className="font-medium text-slate-700 dark:text-slate-300">
                    {selectedPayoutAudit.paidBy}
                  </p>
                </div>
              )}
              {selectedPayoutAudit.notes && (
                <div>
                  <span className="text-slate-400">Notas:</span>
                  <p className="italic text-slate-700 dark:text-slate-300">
                    {selectedPayoutAudit.notes}
                  </p>
                </div>
              )}
            </div>

            {/* Desglose de los Turnos Auditados */}
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white mb-2">
                Turnos Incluidos en esta Liquidación ({selectedPayoutAudit.items?.length || 0})
              </h4>
              <div className="max-h-60 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-800">
                <table className="w-full text-left text-[11px]">
                  <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-bold sticky top-0">
                    <tr>
                      <th className="p-2">Fecha</th>
                      <th className="p-2">Servicio</th>
                      <th className="p-2">Cliente</th>
                      <th className="p-2 text-right">Cobrado</th>
                      <th className="p-2 text-center">%</th>
                      <th className="p-2 text-right">Comisión</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {selectedPayoutAudit.items?.map((item: any) => (
                      <tr key={item.id}>
                        <td className="p-2 font-mono whitespace-nowrap">
                          {formatInTimeZone(
                            item.appointmentDate,
                            COMMISSION_TZ,
                            "dd/MM HH:mm"
                          )}
                        </td>
                        <td className="p-2 font-medium">{item.serviceName}</td>
                        <td className="p-2 text-slate-600 dark:text-slate-400">
                          {item.clientName}
                        </td>
                        <td className="p-2 text-right font-semibold">
                          {formatGs(item.chargedAmount)}
                        </td>
                        <td className="p-2 text-center">{item.commissionPercentage}%</td>
                        <td className="p-2 text-right font-bold text-indigo-600 dark:text-indigo-400">
                          {formatGs(item.commissionAmount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 pt-3 dark:border-white/5 font-bold">
              <span>Suma total verificada:</span>
              <span className="text-sm text-indigo-600 dark:text-indigo-400">
                {formatGs(
                  selectedPayoutAudit.items?.reduce(
                    (acc: number, cur: any) => acc + cur.commissionAmount,
                    0
                  ) || 0
                )}
              </span>
            </div>
          </div>
        ) : null}
      </Modal>

      {/* Modal: Recibo Imprimible de Liquidación */}
      <PayoutReceiptModal
        payoutId={selectedReceiptPayoutId}
        onClose={() => setSelectedReceiptPayoutId(null)}
      />
    </div>
  );
}
