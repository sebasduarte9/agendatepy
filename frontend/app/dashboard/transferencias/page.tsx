"use client";

import { useMemo, useState } from "react";
import { formatInTimeZone } from "date-fns-tz";
import {
  FileCheck2,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  AlertCircle,
  Building2,
  User,
  Hash,
  Download,
  ExternalLink,
} from "lucide-react";
import { useDashboardStore } from "@/store/useDashboardStore";
import Card from "@/components/dashboard/ui/Card";
import StatCard from "@/components/dashboard/ui/StatCard";
import DataTable from "@/components/dashboard/ui/DataTable";
import Modal from "@/components/dashboard/ui/Modal";
import { formatGs } from "@/lib/dashboard-dates";
import type { Receipt } from "@/lib/dashboard-types";

const STATUS_FILTERS = ["Todos", "Pendientes", "Aprobados", "Rechazados"] as const;

export default function TransferenciasPage() {
  const { receipts, business, setReceiptStatus, pushToast } = useDashboardStore();
  const [filter, setFilter] = useState<(typeof STATUS_FILTERS)[number]>("Todos");
  const [viewingReceipt, setViewingReceipt] = useState<Receipt | null>(null);

  const filtered = useMemo(() => {
    if (filter === "Pendientes") return receipts.filter((r) => r.status === "pending");
    if (filter === "Aprobados") return receipts.filter((r) => r.status === "approved");
    if (filter === "Rechazados") return receipts.filter((r) => r.status === "rejected");
    return receipts;
  }, [receipts, filter]);

  // KPIs
  const pendingCount = receipts.filter((r) => r.status === "pending").length;
  const approvedTotal = receipts
    .filter((r) => r.status === "approved")
    .reduce((sum, r) => sum + r.amount, 0);
  const rejectedCount = receipts.filter((r) => r.status === "rejected").length;

  function handleApprove(receipt: Receipt) {
    setReceiptStatus(receipt.id, "approved");
    pushToast("success", `Comprobante de ${receipt.clientName} APROBADO. Turno confirmado automáticamente.`);
    if (viewingReceipt?.id === receipt.id) setViewingReceipt(null);
  }

  function handleReject(receipt: Receipt) {
    setReceiptStatus(receipt.id, "rejected");
    pushToast("error", `Comprobante de ${receipt.clientName} RECHAZADO. Turno liberado.`);
    if (viewingReceipt?.id === receipt.id) setViewingReceipt(null);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            Auditoría de Transferencias SIPAP
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 sm:text-sm">
            Verificá y validá comprobantes bancarios subidos por clientes antes de confirmar su turno.
          </p>
        </div>

        <div className="flex items-center gap-1 rounded-2xl border border-slate-200/80 dark:border-white/10 p-1 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-xs">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                filter === f
                  ? "bg-primary text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Pendientes de Aprobación"
          value={`${pendingCount} comprobantes`}
          icon={Clock}
          delta={pendingCount > 0 ? pendingCount : undefined}
        />
        <StatCard
          label="Monto Aprobado y Cobrado"
          value={formatGs(approvedTotal)}
          icon={CheckCircle2}
        />
        <StatCard
          label="Comprobantes Desestimados"
          value={`${rejectedCount} rechazados`}
          icon={XCircle}
        />
      </div>

      {/* Main Table Card */}
      <Card>
        <div className="mb-4 flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-3">
          <div>
            <h2 className="font-bold text-slate-900 dark:text-white text-base">
              Registro de Pagos Bancarios
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Transferencias acreditadas a través del Sistema de Pagos del Paraguay (SIPAP).
            </p>
          </div>
          <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary">
            {filtered.length} transferencias
          </span>
        </div>

        <DataTable<Receipt>
          rows={filtered}
          pageSize={6}
          columns={[
            {
              key: "client",
              header: "Cliente / Titular",
              render: (row) => (
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 font-black text-primary text-xs">
                    {row.clientName.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white block">
                      {row.clientName}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      ID Cita: {row.appointmentId}
                    </span>
                  </div>
                </div>
              ),
            },
            {
              key: "amount",
              header: "Monto",
              render: (row) => (
                <span className="font-black text-slate-900 dark:text-white text-sm">
                  {formatGs(row.amount)}
                </span>
              ),
            },
            {
              key: "when",
              header: "Fecha de Envío",
              hideOnMobile: true,
              render: (row) => (
                <div className="text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-300 block">
                    {formatInTimeZone(row.submittedAt, business.timezone, "dd/MM/yyyy")}
                  </span>
                  <span className="text-slate-400 text-[11px]">
                    {formatInTimeZone(row.submittedAt, business.timezone, "HH:mm 'hs'")}
                  </span>
                </div>
              ),
            },
            {
              key: "note",
              header: "Detalle / Referencia",
              hideOnMobile: true,
              render: (row) => (
                <span className="text-xs text-slate-600 dark:text-slate-300 truncate max-w-xs block">
                  {row.note || "Transferencia SIPAP Bancaria"}
                </span>
              ),
            },
            {
              key: "status",
              header: "Estado",
              render: (row) => (
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                    row.status === "approved"
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                      : row.status === "rejected"
                        ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                        : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                  }`}
                >
                  {row.status === "approved" ? (
                    <>
                      <CheckCircle2 className="h-3 w-3" /> Aprobado
                    </>
                  ) : row.status === "rejected" ? (
                    <>
                      <XCircle className="h-3 w-3" /> Rechazado
                    </>
                  ) : (
                    <>
                      <Clock className="h-3 w-3" /> Pendiente
                    </>
                  )}
                </span>
              ),
            },
            {
              key: "actions",
              header: "Acciones",
              render: (row) => (
                <div className="flex items-center gap-1.5 justify-end">
                  <button
                    type="button"
                    onClick={() => setViewingReceipt(row)}
                    className="inline-flex items-center gap-1 rounded-xl border border-slate-200/80 dark:border-white/10 bg-white/60 dark:bg-slate-800/60 px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  >
                    <Eye className="h-3.5 w-3.5 text-slate-400" />
                    <span>Ver</span>
                  </button>

                  {row.status === "pending" && (
                    <>
                      <button
                        type="button"
                        onClick={() => handleApprove(row)}
                        className="rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-500 transition"
                      >
                        Aprobar
                      </button>
                      <button
                        type="button"
                        onClick={() => handleReject(row)}
                        className="rounded-xl border border-rose-200/60 dark:border-rose-900/40 bg-rose-50/50 dark:bg-rose-950/30 px-2.5 py-1.5 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-100 transition"
                      >
                        Rechazar
                      </button>
                    </>
                  )}
                </div>
              ),
            },
          ]}
        />
      </Card>

      {/* Modal: Visualizador de Comprobante Bancario */}
      <Modal
        open={!!viewingReceipt}
        onClose={() => setViewingReceipt(null)}
        title="Comprobante Bancario SIPAP"
      >
        {viewingReceipt && (
          <div className="space-y-4 text-xs">
            {/* Bank simulated ticket */}
            <div className="rounded-3xl border border-slate-200/80 dark:border-white/10 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950 p-5 shadow-inner">
              <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-primary" />
                  <span className="font-black text-slate-900 dark:text-white text-sm">
                    SIPAP · Banco Central del Paraguay
                  </span>
                </div>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                    viewingReceipt.status === "approved"
                      ? "bg-emerald-500/10 text-emerald-600"
                      : viewingReceipt.status === "rejected"
                        ? "bg-rose-500/10 text-rose-600"
                        : "bg-amber-500/10 text-amber-600"
                  }`}
                >
                  {viewingReceipt.status}
                </span>
              </div>

              <div className="my-4 text-center">
                <span className="text-xs text-slate-400">Monto Acreditado</span>
                <p className="text-3xl font-black text-primary tracking-tight mt-0.5">
                  {formatGs(viewingReceipt.amount)}
                </p>
              </div>

              <div className="space-y-2 border-t border-slate-100 dark:border-white/5 pt-3">
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">Cliente / Emisor:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {viewingReceipt.clientName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">Destinatario:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {business.name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">Fecha y Hora:</span>
                  <span className="font-mono text-slate-700 dark:text-slate-300">
                    {formatInTimeZone(viewingReceipt.submittedAt, business.timezone, "dd/MM/yyyy HH:mm 'hs'")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">Referencia / Nota:</span>
                  <span className="font-mono text-slate-700 dark:text-slate-300">
                    {viewingReceipt.note || "SIPAP-ONLINE-REF"}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions inside modal */}
            <div className="flex items-center justify-between gap-2 pt-2">
              <button
                type="button"
                onClick={() => setViewingReceipt(null)}
                className="rounded-xl border border-slate-200/80 dark:border-white/10 px-4 py-2 font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                Cerrar
              </button>

              {viewingReceipt.status === "pending" && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleReject(viewingReceipt)}
                    className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 font-bold text-rose-600 hover:bg-rose-100 transition"
                  >
                    Rechazar
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApprove(viewingReceipt)}
                    className="rounded-xl bg-emerald-600 px-5 py-2 font-bold text-white shadow-md hover:bg-emerald-500 transition"
                  >
                    Aprobar Comprobante
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
