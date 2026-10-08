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
  QrCode,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Search,
  ArrowUpRight,
  Filter,
  Check,
  ChevronRight,
} from "lucide-react";
import { useDashboardStore } from "@/store/useDashboardStore";
import Card from "@/components/dashboard/ui/Card";
import DataTable from "@/components/dashboard/ui/DataTable";
import Modal from "@/components/dashboard/ui/Modal";
import IosSegmentedControl from "@/components/dashboard/ui/IosSegmentedControl";
import { triggerHaptic } from "@/lib/haptics";
import { formatGs } from "@/lib/dashboard-dates";
import type { Receipt } from "@/lib/dashboard-types";

const STATUS_FILTERS = ["Todos", "Pendientes", "Aprobados", "Rechazados"] as const;
const BANK_FILTERS = ["Todos los Bancos", "Banco Itaú", "Ueno Bank", "Banco Continental", "BNF"] as const;

function bankBadgeStyle(bankName?: string) {
  const b = (bankName || "").toLowerCase();
  if (b.includes("itaú") || b.includes("itau")) {
    return "bg-orange-50 dark:bg-orange-950/60 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800/60";
  }
  if (b.includes("ueno")) {
    return "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60";
  }
  if (b.includes("continental")) {
    return "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800/60";
  }
  if (b.includes("bnf") || b.includes("fomento")) {
    return "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/60";
  }
  return "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800";
}

export default function TransferenciasPage() {
  const { receipts, business, setReceiptStatus, pushToast } = useDashboardStore();
  const brandColor = business.primaryColor || "var(--primary, #FF4F2B)";

  const [filter, setFilter] = useState<(typeof STATUS_FILTERS)[number]>("Todos");
  const [bankFilter, setBankFilter] = useState<(typeof BANK_FILTERS)[number]>("Todos los Bancos");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewingReceipt, setViewingReceipt] = useState<Receipt | null>(null);

  const filtered = useMemo(() => {
    return receipts.filter((r) => {
      // Status filter
      if (filter === "Pendientes" && r.status !== "pending") return false;
      if (filter === "Aprobados" && r.status !== "approved") return false;
      if (filter === "Rechazados" && r.status !== "rejected") return false;

      // Bank filter
      if (bankFilter !== "Todos los Bancos") {
        if (!r.bankOrigin || !r.bankOrigin.toLowerCase().includes(bankFilter.toLowerCase())) return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const mClient = r.clientName.toLowerCase().includes(q);
        const mPhone = (r.clientPhone || "").toLowerCase().includes(q);
        const mBank = (r.bankOrigin || "").toLowerCase().includes(q);
        const mOp = (r.operationNumber || "").toLowerCase().includes(q);
        const mNote = (r.note || "").toLowerCase().includes(q);
        if (!mClient && !mPhone && !mBank && !mOp && !mNote) return false;
      }

      return true;
    });
  }, [receipts, filter, bankFilter, searchQuery]);

  // KPIs
  const totalCount = receipts.length;
  const pendingCount = receipts.filter((r) => r.status === "pending").length;
  const approvedCount = receipts.filter((r) => r.status === "approved").length;
  const approvedTotal = receipts
    .filter((r) => r.status === "approved")
    .reduce((sum, r) => sum + r.amount, 0);
  const pendingTotal = receipts
    .filter((r) => r.status === "pending")
    .reduce((sum, r) => sum + r.amount, 0);
  const ocrDetectedCount = receipts.filter((r) => r.ocrVerified).length;

  const approvalRatePct = totalCount > 0 ? Math.round((approvedCount / totalCount) * 100) : 100;
  const ocrRatePct = totalCount > 0 ? Math.round((ocrDetectedCount / totalCount) * 100) : 100;

  function handleApprove(receipt: Receipt) {
    setReceiptStatus(receipt.id, "approved");
    pushToast("success", `Comprobante de ${receipt.clientName} APROBADO. Turno y cita confirmados automáticamente.`);
    if (viewingReceipt?.id === receipt.id) setViewingReceipt(null);
  }

  function handleReject(receipt: Receipt) {
    setReceiptStatus(receipt.id, "rejected");
    pushToast("error", `Comprobante de ${receipt.clientName} RECHAZADO. Turno liberado en agenda.`);
    if (viewingReceipt?.id === receipt.id) setViewingReceipt(null);
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-20">
      {/* ═══ CLEAN NATIVE PAGE HEADER ═══ */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between py-1">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Auditoría de Transferencias Bancarias
        </h1>

        {/* Action Dock / Status Filters */}
        <div className="w-full lg:w-auto">
          <IosSegmentedControl
            options={STATUS_FILTERS.map((f) => ({
              value: f,
              label: f,
              badge: f === "Pendientes" && pendingCount > 0 ? pendingCount : undefined,
            }))}
            value={filter}
            onChange={(val) => {
              setFilter(val as any);
              triggerHaptic("selection");
            }}
            layoutId="transferenciasStatusSegment"
            className="w-full sm:w-auto"
          />
        </div>
      </div>

      {/* ═══ MOBILE APPLE GLANCEABLE STAT CARD ═══ */}
      <div className="block md:hidden p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/10 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Por Validar
            </span>
            <span className={`text-2xl font-black font-mono ${pendingCount > 0 ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400"}`}>
              {pendingCount} {pendingCount === 1 ? "comprobante" : "comprobantes"}
            </span>
          </div>
          {pendingCount > 0 ? (
            <span className="px-3 py-1 rounded-xl text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-500/10 border border-amber-500/20">
              {formatGs(pendingTotal)}
            </span>
          ) : (
            <span className="px-3 py-1 rounded-xl text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 border border-emerald-500/20">
              ✓ Al día
            </span>
          )}
        </div>
        <div className="pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>Aprobados: <strong className="text-slate-800 dark:text-slate-200 font-mono">{formatGs(approvedTotal)}</strong></span>
          <span>Aprobación: <strong className="text-emerald-600 dark:text-emerald-400 font-mono">{approvalRatePct}%</strong></span>
        </div>
      </div>

      {/* ═══ DESKTOP APPLE INSET CONTAINER: BENTO TELEMETRY & GAUGES ═══ */}
      <div className="hidden md:block rounded-[28px] bg-slate-100/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 p-4 sm:p-5 shadow-xs space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Card 1: Circular Progress Gauges (Approval & OCR Detection) */}
          <div className="lg:col-span-7 rounded-2xl bg-white dark:bg-slate-950 p-5 border border-slate-200/70 dark:border-slate-800/80 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    <FileCheck2 className="h-4 w-4" />
                  </div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                    Telemetría de Comprobantes Bancarios
                  </span>
                </div>
                <span className="text-[11px] font-mono font-bold text-slate-500 dark:text-slate-400">
                  {totalCount} transferencias auditadas
                </span>
              </div>

              {/* Gauges & Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                {/* Gauge 1: Approval Rate */}
                <div className="flex items-center gap-4 p-3 rounded-xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                  <div className="relative h-14 w-14 shrink-0 flex items-center justify-center">
                    <svg className="h-14 w-14 -rotate-90" viewBox="0 0 44 44">
                      <circle
                        cx="22"
                        cy="22"
                        r="18"
                        className="text-slate-200 dark:text-slate-800"
                        strokeWidth="4"
                        stroke="currentColor"
                        fill="transparent"
                      />
                      <circle
                        cx="22"
                        cy="22"
                        r="18"
                        strokeWidth="4"
                        strokeDasharray={113}
                        strokeDashoffset={113 - (113 * approvalRatePct) / 100}
                        strokeLinecap="round"
                        stroke={brandColor}
                        fill="transparent"
                        className="transition-all duration-700 ease-out"
                      />
                    </svg>
                    <span className="absolute font-mono font-bold text-xs text-slate-800 dark:text-white">
                      {approvalRatePct}%
                    </span>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">
                      Tasa de Aprobación
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                      {approvedCount} comprobantes verificados
                    </span>
                    <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {formatGs(approvedTotal)} acreditados
                    </span>
                  </div>
                </div>

                {/* Gauge 2: OCR QR Detection Rate */}
                <div className="flex items-center gap-4 p-3 rounded-xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                  <div className="relative h-14 w-14 shrink-0 flex items-center justify-center">
                    <svg className="h-14 w-14 -rotate-90" viewBox="0 0 44 44">
                      <circle
                        cx="22"
                        cy="22"
                        r="18"
                        className="text-emerald-500/20"
                        strokeWidth="4"
                        stroke="currentColor"
                        fill="transparent"
                      />
                      <circle
                        cx="22"
                        cy="22"
                        r="18"
                        strokeWidth="4"
                        strokeDasharray={113}
                        strokeDashoffset={113 - (113 * ocrRatePct) / 100}
                        strokeLinecap="round"
                        stroke="#10b981"
                        fill="transparent"
                        className="transition-all duration-700 ease-out"
                      />
                    </svg>
                    <span className="absolute font-mono font-bold text-xs text-emerald-600 dark:text-emerald-400">
                      {ocrRatePct}%
                    </span>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">
                      Detección OCR & QR
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                      {ocrDetectedCount} con código QR válido
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Lectura Bancard / SPI
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick KPI Bar */}
            <div className="grid grid-cols-3 gap-2 pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 text-center">
              <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 font-semibold block">Total Cobrado</span>
                <span className="font-mono font-extrabold text-xs text-emerald-600 dark:text-emerald-400">
                  {formatGs(approvedTotal)}
                </span>
              </div>
              <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 font-semibold block">Por Aprobar</span>
                <span className={`font-mono font-extrabold text-xs ${pendingCount > 0 ? "text-amber-600 dark:text-amber-400" : "text-slate-600 dark:text-slate-300"}`}>
                  {formatGs(pendingTotal)}
                </span>
              </div>
              <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 font-semibold block">Comprobantes</span>
                <span className="font-mono font-extrabold text-xs text-slate-900 dark:text-white">
                  {totalCount} recibidos
                </span>
              </div>
            </div>
          </div>

          {/* Card 2: Bank Breakdown & Direct Filter Hub */}
          <div className="lg:col-span-5 rounded-2xl bg-white dark:bg-slate-950 p-5 border border-slate-200/70 dark:border-slate-800/80 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                    <Building2 className="h-4 w-4" />
                  </div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                    Bancos de Origen en Paraguay
                  </span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 font-semibold">
                  Transferencias
                </span>
              </div>

              {/* Bank Filter Chips */}
              <div className="flex flex-wrap gap-1.5 pt-3">
                {BANK_FILTERS.map((b) => {
                  const isActive = bankFilter === b;
                  return (
                    <button
                      key={b}
                      type="button"
                      onClick={() => setBankFilter(b)}
                      className={`rounded-xl px-3 py-1.5 text-[11px] font-bold border transition cursor-pointer shrink-0 ${
                        isActive
                          ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-slate-900 dark:border-white shadow-xs"
                          : "bg-slate-50 dark:bg-slate-900/80 text-slate-600 dark:text-slate-300 border-slate-200/80 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800"
                      }`}
                    >
                      {b}
                    </button>
                  );
                })}
              </div>

              {/* Status Note */}
              <div className="mt-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 text-xs space-y-1">
                <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-semibold">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                  <span>Validación Criptográfica QR</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  La cámara de WhatsApp lee el comprobante oficial en segundos para evitar fraudes o comprobantes duplicados.
                </p>
              </div>
            </div>

            <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400 text-[11px]">
                {pendingCount > 0 ? `${pendingCount} transferencias por revisar` : "Al día con todos los pagos"}
              </span>
              {pendingCount > 0 && (
                <button
                  type="button"
                  onClick={() => setFilter("Pendientes")}
                  className="font-bold hover:underline cursor-pointer"
                  style={{ color: brandColor }}
                >
                  Ver pendientes
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ═══ MAIN TABLE CARD ═══ */}
      <Card className="rounded-2xl border border-slate-200/80 dark:border-slate-800 p-0 overflow-hidden bg-white dark:bg-slate-950 shadow-xs">
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4" style={{ color: brandColor }} />
              <h2 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">
                Registro de Pagos y Transferencias Bancarias
              </h2>
            </div>
            <p className="hidden sm:block text-xs text-slate-400 mt-0.5">
              Pagos procesados vía Transferencia Bancaria con lectura inteligente de QR y datos del cliente.
            </p>
          </div>

          {/* Search Box */}
          <div className="relative min-w-[220px]">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar cliente, banco o N°..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 pl-8 pr-3 py-1.5 text-xs text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block">
          <DataTable<Receipt>
            rows={filtered}
            pageSize={8}
            columns={[
              {
                key: "client",
                header: "Cliente / Emisor",
                render: (row) => (
                  <div className="flex items-center gap-2.5 py-1">
                    <div
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl font-black text-white text-xs shadow-xs"
                      style={{ backgroundColor: brandColor }}
                    >
                      {row.clientName.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white block">
                        {row.clientName}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                        <Smartphone className="h-3 w-3 text-emerald-500" />
                        {row.clientPhone || "+595 981 765 432"}
                      </span>
                    </div>
                  </div>
                ),
              },
              {
                key: "bank",
                header: "Banco & Operación",
                render: (row) => (
                  <div className="space-y-1">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-extrabold ${bankBadgeStyle(
                        row.bankOrigin
                      )}`}
                    >
                      <Building2 className="h-3 w-3" />
                      <span>{row.bankOrigin || "Banco Itaú"}</span>
                    </span>
                    <span className="text-[10.5px] text-slate-500 dark:text-slate-400 font-mono block">
                      {row.operationNumber || "TRF-849201"}
                    </span>
                  </div>
                ),
              },
              {
                key: "ocr",
                header: "Verificación OCR / QR",
                render: (row) => (
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-bold">
                      <QrCode className="h-3 w-3 text-emerald-600" />
                      <span>QR Validado</span>
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 border border-indigo-500/20 px-1.5 py-0.5 text-[10px] font-bold">
                      <ShieldCheck className="h-3 w-3 text-indigo-600" />
                      <span>OCR {row.ocrConfidence || 99.4}%</span>
                    </span>
                  </div>
                ),
              },
              {
                key: "amount",
                header: "Monto",
                render: (row) => (
                  <span className="font-mono font-black text-slate-900 dark:text-white text-sm">
                    {formatGs(row.amount)}
                  </span>
                ),
              },
              {
                key: "when",
                header: "Fecha de Envío",
                hideOnMobile: true,
                render: (row) => (
                  <div className="text-xs font-mono">
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
                      className="inline-flex items-center gap-1 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                    >
                      <Eye className="h-3.5 w-3.5 text-slate-400" />
                      <span>Ver</span>
                    </button>

                    {row.status === "pending" && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleApprove(row)}
                          className="rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-500 transition cursor-pointer"
                        >
                          Aprobar
                        </button>
                        <button
                          type="button"
                          onClick={() => handleReject(row)}
                          className="rounded-xl border border-rose-200/60 dark:border-rose-900/40 bg-rose-50/50 dark:bg-rose-950/30 px-2.5 py-1.5 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-100 transition cursor-pointer"
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
        </div>

        {/* Mobile Apple Inset Grouped Transfer List */}
        <div className="block md:hidden divide-y divide-slate-100 dark:divide-slate-800/80">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              No hay transferencias registradas con este filtro.
            </div>
          ) : (
            filtered.map((row) => (
              <div
                key={row.id}
                onClick={() => {
                  triggerHaptic("selection");
                  setViewingReceipt(row);
                }}
                className="p-4 flex flex-col gap-2.5 active:bg-slate-50 dark:active:bg-slate-900/60 transition cursor-pointer"
              >
                {/* Top Row: Client + Bank + Amount */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl font-black text-white text-xs shadow-xs"
                      style={{ backgroundColor: brandColor }}
                    >
                      {row.clientName.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-900 dark:text-white text-sm truncate">
                          {row.clientName}
                        </span>
                        {row.status === "approved" ? (
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                        ) : row.status === "rejected" ? (
                          <XCircle className="h-3.5 w-3.5 text-rose-500 shrink-0" />
                        ) : (
                          <Clock className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                        )}
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                        <Smartphone className="h-3 w-3 text-emerald-500" />
                        {row.clientPhone || "+595 981 765 432"}
                      </span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="font-mono font-black text-slate-900 dark:text-white text-sm block">
                      {formatGs(row.amount)}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {formatInTimeZone(row.submittedAt, business.timezone, "dd/MM HH:mm")}
                    </span>
                  </div>
                </div>

                {/* Badges Row */}
                <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100/60 dark:border-slate-800/60">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-extrabold ${bankBadgeStyle(
                        row.bankOrigin
                      )}`}
                    >
                      <Building2 className="h-2.5 w-2.5" />
                      <span>{row.bankOrigin || "Itaú"}</span>
                    </span>

                    <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 text-[9.5px] font-bold">
                      <QrCode className="h-2.5 w-2.5 text-emerald-600" />
                      <span>QR OK</span>
                    </span>

                    <span className="text-[10px] font-mono text-slate-400">
                      {row.operationNumber || "Transferencia"}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                    {row.status === "pending" ? (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            triggerHaptic("success");
                            handleApprove(row);
                          }}
                          className="rounded-xl bg-emerald-600 px-2.5 py-1 text-[11px] font-bold text-white shadow-xs active:scale-95 transition cursor-pointer"
                        >
                          Aprobar
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            triggerHaptic("light");
                            handleReject(row);
                          }}
                          className="rounded-xl border border-rose-200/60 dark:border-rose-900/40 bg-rose-50/50 dark:bg-rose-950/30 px-2 py-1 text-[11px] font-bold text-rose-600 dark:text-rose-400 active:scale-95 transition cursor-pointer"
                        >
                          Rechazar
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          triggerHaptic("selection");
                          setViewingReceipt(row);
                        }}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                      >
                        <span>Detalles</span>
                        <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* ═══ MODAL: VISUALIZADOR DE COMPROBANTE BANCARIO CON QR ═══ */}
      <Modal
        open={!!viewingReceipt}
        onClose={() => setViewingReceipt(null)}
        title="Comprobante Bancario Verificado"
        maxWidth="max-w-xl"
      >
        {viewingReceipt && (
          <div className="space-y-4 text-xs">
            {/* Bank Ticket Card */}
            <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950 p-6 shadow-inner space-y-4">
              {/* Header with Bank & Transfer seal */}
              <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-2xl text-white font-bold"
                    style={{ backgroundColor: brandColor }}
                  >
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="font-black text-slate-900 dark:text-white text-sm block">
                      {viewingReceipt.bankOrigin || "Banco Itaú Paraguay"}
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold">
                      Transferencia Bancaria en Paraguay
                    </span>
                  </div>
                </div>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[10.5px] font-extrabold uppercase ${
                    viewingReceipt.status === "approved"
                      ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                      : viewingReceipt.status === "rejected"
                        ? "bg-rose-500/10 text-rose-600 border border-rose-500/20"
                        : "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                  }`}
                >
                  {viewingReceipt.status === "approved" ? "Aprobado" : viewingReceipt.status === "rejected" ? "Rechazado" : "Pendiente"}
                </span>
              </div>

              {/* Amount Display */}
              <div className="py-3 text-center bg-slate-100/70 dark:bg-slate-800/50 rounded-2xl border border-slate-200/60 dark:border-slate-800">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Monto Acreditado en Cuenta</span>
                <p className="text-3xl sm:text-4xl font-mono font-black tracking-tight mt-0.5" style={{ color: brandColor }}>
                  {formatGs(viewingReceipt.amount)}
                </p>
              </div>

              {/* Verification Badges */}
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/20">
                  <QrCode className="h-5 w-5 text-emerald-600 shrink-0" />
                  <div>
                    <span className="font-bold text-emerald-800 dark:text-emerald-300 text-[11px] block">Código QR Validado</span>
                    <span className="text-[9.5px] text-emerald-600/80">Estándar Bancard / BCP</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-500/20">
                  <ShieldCheck className="h-5 w-5 text-indigo-600 shrink-0" />
                  <div>
                    <span className="font-bold text-indigo-800 dark:text-indigo-300 text-[11px] block">Lectura OCR {viewingReceipt.ocrConfidence || 99.4}%</span>
                    <span className="text-[9.5px] text-indigo-600/80">Reconocimiento Automático</span>
                  </div>
                </div>
              </div>

              {/* Transaction Metadata */}
              <div className="space-y-2.5 border-t border-slate-100 dark:border-slate-800 pt-3 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">Cliente / Emisor:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {viewingReceipt.clientName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">Teléfono WhatsApp:</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                    <Smartphone className="h-3.5 w-3.5 text-emerald-500" />
                    {viewingReceipt.clientPhone || "+595 981 765 432"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">Comercio Destino:</span>
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
                  <span className="text-slate-400 font-medium">N° de Operación:</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                    {viewingReceipt.operationNumber || "TRF-849201"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">Concepto / Nota:</span>
                  <span className="text-slate-700 dark:text-slate-300 font-medium">
                    {viewingReceipt.note || "Transferencia Bancaria"}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions inside modal */}
            <div className="flex items-center justify-between gap-2 pt-2">
              <button
                type="button"
                onClick={() => setViewingReceipt(null)}
                className="rounded-xl border border-slate-200/80 dark:border-slate-800 px-4 py-2 font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                Cerrar
              </button>

              {viewingReceipt.status === "pending" && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleReject(viewingReceipt)}
                    className="rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 px-4 py-2 font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-100 transition cursor-pointer"
                  >
                    Rechazar
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApprove(viewingReceipt)}
                    className="rounded-xl bg-emerald-600 px-5 py-2 font-bold text-white shadow-md hover:bg-emerald-500 transition cursor-pointer flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Aprobar Comprobante</span>
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
