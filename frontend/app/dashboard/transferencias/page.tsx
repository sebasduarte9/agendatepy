"use client";

import { useMemo, useState } from "react";
import { formatInTimeZone } from "date-fns-tz";
import {
  Building2,
  CheckCircle2,
  ChevronRight,
  Clock,
  Eye,
  FileCheck2,
  Hash,
  ImageOff,
  QrCode,
  ScanText,
  Search,
  ShieldCheck,
  Smartphone,
  X,
  XCircle,
} from "lucide-react";
import { useDashboardStore } from "@/store/useDashboardStore";
import Modal from "@/components/dashboard/ui/Modal";
import { triggerHaptic } from "@/lib/haptics";
import { formatGs } from "@/lib/dashboard-dates";
import type { Receipt } from "@/lib/dashboard-types";

const STATUS_FILTERS = [
  { value: "all", label: "Todos" },
  { value: "pending", label: "Pendientes" },
  { value: "approved", label: "Aprobados" },
  { value: "rejected", label: "Rechazados" },
] as const;

type StatusFilter = (typeof STATUS_FILTERS)[number]["value"];

const PAGE_SIZE = 10;

const STATUS_META: Record<
  Receipt["status"],
  { label: string; icon: typeof Clock; badgeClass: string; iconClass: string }
> = {
  pending: {
    label: "Pendiente",
    icon: Clock,
    badgeClass: "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300",
    iconClass: "text-amber-500",
  },
  approved: {
    label: "Aprobado",
    icon: CheckCircle2,
    badgeClass: "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
    iconClass: "text-emerald-500",
  },
  rejected: {
    label: "Rechazado",
    icon: XCircle,
    badgeClass: "border-rose-500/20 bg-rose-500/10 text-rose-700 dark:text-rose-300",
    iconClass: "text-rose-500",
  },
};

function bankDotClass(bankName?: string) {
  const b = (bankName || "").toLowerCase();
  if (b.includes("itaú") || b.includes("itau")) return "bg-orange-500";
  if (b.includes("ueno")) return "bg-emerald-500";
  if (b.includes("continental")) return "bg-blue-500";
  if (b.includes("bnf") || b.includes("fomento")) return "bg-amber-500";
  if (b.includes("sudameris")) return "bg-rose-500";
  return "bg-slate-400";
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  return (parts[0][0] + (parts[1]?.[0] ?? "")).toUpperCase();
}

function StatusBadge({ status }: { status: Receipt["status"] }) {
  const meta = STATUS_META[status];
  const Icon = meta.icon;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${meta.badgeClass}`}
    >
      <Icon className="h-3 w-3" />
      {meta.label}
    </span>
  );
}

/** Only shows the automatic checks that actually ran on the receipt. */
function VerificationBadges({ receipt }: { receipt: Receipt }) {
  if (!receipt.qrCodeDetected && !receipt.ocrVerified) {
    return <span className="text-[11px] text-slate-400 dark:text-zinc-500">Revisión manual</span>;
  }
  return (
    <div className="flex items-center gap-1.5 whitespace-nowrap">
      {receipt.qrCodeDetected && (
        <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/10 px-1.5 py-0.5 text-[11px] font-medium text-emerald-700 dark:text-emerald-300">
          <QrCode className="h-3 w-3" />
          QR
        </span>
      )}
      {receipt.ocrVerified && (
        <span className="inline-flex items-center gap-1 rounded-lg bg-indigo-500/10 px-1.5 py-0.5 text-[11px] font-medium tabular-nums text-indigo-700 dark:text-indigo-300">
          <ScanText className="h-3 w-3" />
          {typeof receipt.ocrConfidence === "number" ? `OCR ${receipt.ocrConfidence}%` : "OCR"}
        </span>
      )}
    </div>
  );
}

export default function TransferenciasPage() {
  const { receipts, business, setReceiptStatus, pushToast } = useDashboardStore();
  const brandColor = business.primaryColor || "var(--primary, #FF4F2B)";

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [bankFilter, setBankFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewingReceipt, setViewingReceipt] = useState<Receipt | null>(null);
  const [receiptToReject, setReceiptToReject] = useState<Receipt | null>(null);
  const [brokenImages, setBrokenImages] = useState<Record<string, boolean>>({});

  // Pagination resets on its own whenever the filter combination changes
  const filterKey = `${statusFilter}|${bankFilter}|${searchQuery.trim()}`;
  const [paging, setPaging] = useState({ key: filterKey, count: PAGE_SIZE });
  const visibleCount = paging.key === filterKey ? paging.count : PAGE_SIZE;

  const statusCounts = useMemo(
    () => ({
      all: receipts.length,
      pending: receipts.filter((r) => r.status === "pending").length,
      approved: receipts.filter((r) => r.status === "approved").length,
      rejected: receipts.filter((r) => r.status === "rejected").length,
    }),
    [receipts]
  );

  // Banks that actually appear in the receipts, most used first
  const bankOptions = useMemo(() => {
    const counts = new Map<string, number>();
    receipts.forEach((r) => {
      const bank = r.bankOrigin?.trim();
      if (bank) counts.set(bank, (counts.get(bank) ?? 0) + 1);
    });
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
  }, [receipts]);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return receipts
      .filter((r) => {
        if (statusFilter !== "all" && r.status !== statusFilter) return false;
        if (bankFilter !== "all" && r.bankOrigin?.trim() !== bankFilter) return false;
        if (q) {
          const haystack = [r.clientName, r.clientPhone, r.bankOrigin, r.operationNumber, r.note]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();
          if (!haystack.includes(q)) return false;
        }
        return true;
      })
      .sort((a, b) => {
        // Pending receipts first, then newest
        if (a.status === "pending" && b.status !== "pending") return -1;
        if (b.status === "pending" && a.status !== "pending") return 1;
        return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
      });
  }, [receipts, statusFilter, bankFilter, searchQuery]);

  const visibleReceipts = filtered.slice(0, visibleCount);
  const hasActiveFilters = statusFilter !== "all" || bankFilter !== "all" || searchQuery.trim() !== "";

  // KPIs
  const pendingTotal = receipts.filter((r) => r.status === "pending").reduce((sum, r) => sum + r.amount, 0);
  const approvedTotal = receipts.filter((r) => r.status === "approved").reduce((sum, r) => sum + r.amount, 0);
  const rejectedTotal = receipts.filter((r) => r.status === "rejected").reduce((sum, r) => sum + r.amount, 0);
  const reviewedCount = statusCounts.approved + statusCounts.rejected;
  const approvalRatePct = reviewedCount > 0 ? Math.round((statusCounts.approved / reviewedCount) * 100) : null;
  const autoVerifiedCount = receipts.filter((r) => r.qrCodeDetected || r.ocrVerified).length;

  const formatDate = (value: string, pattern: string) => formatInTimeZone(value, business.timezone, pattern);

  function handleApprove(receipt: Receipt) {
    triggerHaptic("success");
    setReceiptStatus(receipt.id, "approved");
    pushToast("success", `Comprobante de ${receipt.clientName} aprobado. El turno quedó confirmado.`);
    if (viewingReceipt?.id === receipt.id) setViewingReceipt(null);
  }

  function handleConfirmReject() {
    if (!receiptToReject) return;
    triggerHaptic("light");
    setReceiptStatus(receiptToReject.id, "rejected");
    pushToast("error", `Comprobante de ${receiptToReject.clientName} rechazado. El turno se liberó en la agenda.`);
    if (viewingReceipt?.id === receiptToReject.id) setViewingReceipt(null);
    setReceiptToReject(null);
  }

  function clearFilters() {
    setStatusFilter("all");
    setBankFilter("all");
    setSearchQuery("");
  }

  return (
    <div className="w-full max-w-full space-y-5 pb-24 sm:space-y-6 sm:pb-10">
      {/* ═══ PAGE HEADER ═══ */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">Pagos por transferencia</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            Transferencias
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-500 dark:text-zinc-400">
            Revisá los comprobantes que envían tus clientes y confirmá sus turnos.
          </p>
        </div>
      </header>

      {/* ═══ SUMMARY ═══ */}
      <section className="rounded-3xl glass-panel p-3 sm:p-5">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white sm:text-base">Resumen de comprobantes</h2>
            <p className="mt-0.5 hidden text-xs text-slate-500 dark:text-zinc-400 sm:block">
              Montos según el estado de cada transferencia.
            </p>
          </div>
          <span className="hidden text-xs text-slate-500 dark:text-zinc-400 sm:inline">
            {statusCounts.all} {statusCounts.all === 1 ? "comprobante recibido" : "comprobantes recibidos"}
          </span>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-white/10 pt-3 sm:mt-4 sm:grid-cols-4 sm:gap-y-0 sm:pt-4">
          {[
            {
              label: "Por revisar",
              value: formatGs(pendingTotal),
              detail: `${statusCounts.pending} ${statusCounts.pending === 1 ? "comprobante" : "comprobantes"}`,
              tone: statusCounts.pending > 0 ? "text-amber-600 dark:text-amber-400" : undefined,
            },
            {
              label: "Aprobado",
              value: formatGs(approvedTotal),
              detail: `${statusCounts.approved} ${statusCounts.approved === 1 ? "comprobante" : "comprobantes"}`,
              tone: "text-emerald-600 dark:text-emerald-400",
            },
            {
              label: "Rechazado",
              value: formatGs(rejectedTotal),
              detail: `${statusCounts.rejected} ${statusCounts.rejected === 1 ? "comprobante" : "comprobantes"}`,
            },
            {
              label: "Tasa de aprobación",
              value: approvalRatePct === null ? "—" : `${approvalRatePct}%`,
              detail: `${autoVerifiedCount} con verificación automática`,
            },
          ].map((metric) => (
            <div key={metric.label} className="min-w-0">
              <p className="text-[11px] font-medium text-slate-500 dark:text-zinc-400">{metric.label}</p>
              <p
                className={`mt-1 truncate text-base font-semibold tabular-nums sm:text-xl ${
                  metric.tone ?? "text-slate-900 dark:text-white"
                }`}
              >
                {metric.value}
              </p>
              <p className="mt-0.5 truncate text-[11px] text-slate-500 dark:text-zinc-500">{metric.detail}</p>
            </div>
          ))}
        </div>

        <div
          className={`mt-3 flex items-center justify-between gap-2 rounded-2xl border px-2.5 py-2.5 sm:mt-4 sm:px-3.5 sm:py-3 ${
            statusCounts.pending > 0
              ? "border-amber-500/20 bg-amber-500/[0.06]"
              : "border-emerald-500/15 bg-emerald-500/[0.04]"
          }`}
        >
          <div className="flex min-w-0 items-start gap-2.5">
            <span
              className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${
                statusCounts.pending > 0
                  ? "bg-amber-500/10 text-amber-500 dark:text-amber-400"
                  : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              }`}
            >
              {statusCounts.pending > 0 ? <Clock className="h-4 w-4" /> : <FileCheck2 className="h-4 w-4" />}
            </span>
            <span className="min-w-0">
              <span
                className={`block text-xs font-semibold ${
                  statusCounts.pending > 0 ? "text-amber-700 dark:text-amber-300" : "text-emerald-700 dark:text-emerald-300"
                }`}
              >
                {statusCounts.pending > 0
                  ? `${statusCounts.pending} ${statusCounts.pending === 1 ? "comprobante espera" : "comprobantes esperan"} tu revisión`
                  : "Todos los comprobantes están revisados"}
              </span>
              <span className="mt-0.5 block text-[11px] text-slate-500 dark:text-zinc-400">
                {statusCounts.pending > 0
                  ? "Al aprobar se confirma el turno; al rechazar se libera el horario."
                  : "Los nuevos comprobantes de WhatsApp van a aparecer acá."}
              </span>
            </span>
          </div>
          {statusCounts.pending > 0 && statusFilter !== "pending" && (
            <button
              type="button"
              onClick={() => setStatusFilter("pending")}
              className="inline-flex min-h-9 shrink-0 items-center justify-center rounded-xl border border-amber-500/20 px-2.5 text-[11px] font-semibold text-amber-700 transition hover:bg-amber-500/10 dark:text-amber-300 sm:min-h-10 sm:px-3 sm:text-xs"
            >
              Ver pendientes
            </button>
          )}
        </div>
      </section>

      {/* ═══ RECEIPTS LIST ═══ */}
      <section className="overflow-hidden rounded-3xl glass-panel">
        <div className="space-y-3 border-b border-white/10 p-3.5 sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">Comprobantes</h2>
              <span className="rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary">
                {filtered.length} de {receipts.length}
              </span>
            </div>
            <div className="relative w-full sm:max-w-xs">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                aria-label="Buscar comprobantes"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cliente, banco u operación"
                className="min-h-11 w-full rounded-2xl border border-white/10 bg-black/10 pl-10 pr-10 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-primary/50 focus:ring-2 focus:ring-primary/15 dark:text-white sm:text-sm"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  aria-label="Borrar búsqueda"
                  className="absolute right-1 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-xl text-slate-400 transition hover:bg-white/10 hover:text-slate-700 dark:hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Status + bank filters */}
          <div className="-mx-1 flex items-center gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {STATUS_FILTERS.map((option) => {
              const isActive = statusFilter === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => {
                    triggerHaptic("selection");
                    setStatusFilter(option.value);
                  }}
                  style={isActive ? { backgroundColor: brandColor } : undefined}
                  className={`inline-flex min-h-10 shrink-0 items-center gap-2 rounded-xl px-3.5 text-xs font-semibold transition ${
                    isActive
                      ? "text-white shadow-sm"
                      : "border border-white/10 bg-white/[0.025] text-slate-600 hover:bg-white/[0.06] dark:text-zinc-300"
                  }`}
                >
                  {option.label}
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[11px] tabular-nums ${
                      isActive ? "bg-black/10" : "bg-white/[0.06] text-slate-400"
                    }`}
                  >
                    {statusCounts[option.value]}
                  </span>
                </button>
              );
            })}

            {bankOptions.length > 1 && (
              <>
                <span aria-hidden="true" className="mx-1 h-6 w-px shrink-0 bg-white/10" />
                {bankOptions.map(([bank, count]) => {
                  const isActive = bankFilter === bank;
                  return (
                    <button
                      key={bank}
                      type="button"
                      aria-pressed={isActive}
                      onClick={() => {
                        triggerHaptic("selection");
                        setBankFilter(isActive ? "all" : bank);
                      }}
                      className={`inline-flex min-h-10 shrink-0 items-center gap-2 rounded-xl border px-3 text-xs font-semibold transition ${
                        isActive
                          ? "border-primary/40 bg-primary/10 text-primary"
                          : "border-white/10 bg-white/[0.025] text-slate-600 hover:bg-white/[0.06] dark:text-zinc-300"
                      }`}
                    >
                      <span className={`h-2 w-2 rounded-full ${bankDotClass(bank)}`} />
                      {bank}
                      <span className="text-[11px] tabular-nums text-slate-400">{count}</span>
                      {isActive && <X className="h-3 w-3" />}
                    </button>
                  );
                })}
              </>
            )}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-5 py-12 text-center sm:py-16">
            <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <FileCheck2 className="h-6 w-6" />
            </span>
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              {receipts.length === 0 ? "Todavía no hay comprobantes" : "No encontramos comprobantes"}
            </h3>
            <p className="mt-1 max-w-sm text-sm text-slate-500 dark:text-zinc-400">
              {receipts.length === 0
                ? "Cuando un cliente envíe su comprobante por WhatsApp, lo vas a ver acá para aprobarlo."
                : "Probá con otra búsqueda o limpiá los filtros aplicados."}
            </p>
            {hasActiveFilters && receipts.length > 0 && (
              <button
                type="button"
                onClick={clearFilters}
                className="mt-4 inline-flex min-h-11 items-center justify-center rounded-2xl border border-white/10 px-4 text-sm font-medium text-slate-700 transition hover:bg-white/10 dark:text-zinc-200"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-[11px] text-slate-500 dark:text-zinc-400">
                    <th className="px-5 py-3 font-medium">Cliente</th>
                    <th className="whitespace-nowrap px-4 py-3 font-medium">Banco y operación</th>
                    <th className="px-4 py-3 font-medium">Verificación</th>
                    <th className="px-4 py-3 text-right font-medium">Monto</th>
                    <th className="hidden px-4 py-3 font-medium xl:table-cell">Recibido</th>
                    <th className="px-4 py-3 font-medium">Estado</th>
                    <th className="px-5 py-3 text-right font-medium">
                      <span className="sr-only">Acciones</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/[0.06]">
                  {visibleReceipts.map((row) => (
                    <tr
                      key={row.id}
                      className={`transition hover:bg-slate-50/60 dark:hover:bg-white/[0.02] ${
                        row.status === "pending" ? "bg-amber-500/[0.025]" : ""
                      }`}
                    >
                      <td className="px-5 py-3">
                        <div className="flex min-w-0 items-center gap-2.5">
                          <span
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[11px] font-semibold text-white"
                            style={{ backgroundColor: brandColor }}
                          >
                            {initials(row.clientName)}
                          </span>
                          <span className="min-w-0">
                            <span className="block truncate font-semibold text-slate-900 dark:text-white">
                              {row.clientName}
                            </span>
                            {row.clientPhone && (
                              <span className="block whitespace-nowrap text-[11px] tabular-nums text-slate-500 dark:text-zinc-400">
                                {row.clientPhone}
                              </span>
                            )}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-1.5 whitespace-nowrap font-medium text-slate-800 dark:text-zinc-200">
                          <span className={`h-2 w-2 shrink-0 rounded-full ${bankDotClass(row.bankOrigin)}`} />
                          {row.bankOrigin || "Banco no indicado"}
                        </span>
                        {row.operationNumber && (
                          <span className="mt-0.5 block text-[11px] tabular-nums text-slate-500 dark:text-zinc-400">
                            {row.operationNumber}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <VerificationBadges receipt={row} />
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right text-sm font-semibold tabular-nums text-slate-900 dark:text-white">
                        {formatGs(row.amount)}
                        <span className="block text-[11px] font-normal text-slate-500 dark:text-zinc-400 xl:hidden">
                          {formatDate(row.submittedAt, "dd/MM HH:mm")}
                        </span>
                      </td>
                      <td className="hidden whitespace-nowrap px-4 py-3 tabular-nums text-slate-500 dark:text-zinc-400 xl:table-cell">
                        <span className="block font-medium text-slate-700 dark:text-zinc-200">
                          {formatDate(row.submittedAt, "dd/MM/yyyy")}
                        </span>
                        <span className="text-[11px]">{formatDate(row.submittedAt, "HH:mm 'hs'")}</span>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={row.status} />
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setViewingReceipt(row)}
                            aria-label={`Ver comprobante de ${row.clientName}`}
                            className="inline-flex min-h-9 items-center gap-1.5 rounded-xl border border-white/10 px-3 text-xs font-semibold text-slate-600 transition hover:bg-white/[0.06] dark:text-zinc-300"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            Ver
                          </button>
                          {row.status === "pending" && (
                            <>
                              <button
                                type="button"
                                onClick={() => setReceiptToReject(row)}
                                className="inline-flex min-h-9 items-center rounded-xl border border-rose-500/20 px-3 text-xs font-semibold text-rose-600 transition hover:bg-rose-500/10 dark:text-rose-300"
                              >
                                Rechazar
                              </button>
                              <button
                                type="button"
                                onClick={() => handleApprove(row)}
                                className="inline-flex min-h-9 items-center rounded-xl bg-emerald-600 px-3 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-500"
                              >
                                Aprobar
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile list */}
            <div className="divide-y divide-slate-100 dark:divide-white/[0.06] md:hidden">
              {visibleReceipts.map((row) => (
                <div key={row.id} className={row.status === "pending" ? "bg-amber-500/[0.025]" : undefined}>
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic("selection");
                      setViewingReceipt(row);
                    }}
                    className="flex w-full items-start justify-between gap-3 px-3.5 py-3 text-left transition active:bg-white/[0.04]"
                  >
                    <span className="flex min-w-0 items-start gap-3">
                      <span
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-[11px] font-semibold text-white"
                        style={{ backgroundColor: brandColor }}
                      >
                        {initials(row.clientName)}
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold text-slate-900 dark:text-white">
                          {row.clientName}
                        </span>
                        <span className="mt-0.5 flex items-center gap-1.5 truncate text-[11px] text-slate-500 dark:text-zinc-400">
                          <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${bankDotClass(row.bankOrigin)}`} />
                          <span className="truncate">
                            {row.bankOrigin || "Banco no indicado"} · {formatDate(row.submittedAt, "dd/MM HH:mm")}
                          </span>
                        </span>
                        <span className="mt-1.5 block">
                          <VerificationBadges receipt={row} />
                        </span>
                      </span>
                    </span>
                    <span className="flex shrink-0 flex-col items-end gap-1.5">
                      <span className="text-sm font-semibold tabular-nums text-slate-900 dark:text-white">
                        {formatGs(row.amount)}
                      </span>
                      <StatusBadge status={row.status} />
                    </span>
                  </button>
                  {row.status === "pending" && (
                    <div className="grid grid-cols-2 gap-2 px-3.5 pb-3">
                      <button
                        type="button"
                        onClick={() => setReceiptToReject(row)}
                        className="inline-flex min-h-10 items-center justify-center rounded-xl border border-rose-500/20 text-xs font-semibold text-rose-600 transition active:scale-[0.98] dark:text-rose-300"
                      >
                        Rechazar
                      </button>
                      <button
                        type="button"
                        onClick={() => handleApprove(row)}
                        className="inline-flex min-h-10 items-center justify-center rounded-xl bg-emerald-600 text-xs font-semibold text-white shadow-sm transition active:scale-[0.98]"
                      >
                        Aprobar
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {filtered.length > visibleCount && (
              <div className="border-t border-white/10 p-3 text-center">
                <button
                  type="button"
                  onClick={() => setPaging({ key: filterKey, count: visibleCount + PAGE_SIZE })}
                  className="inline-flex min-h-10 items-center gap-1.5 rounded-xl border border-white/10 px-4 text-xs font-semibold text-slate-600 transition hover:bg-white/[0.06] dark:text-zinc-300"
                >
                  Ver más ({filtered.length - visibleCount} restantes)
                  <ChevronRight className="h-3.5 w-3.5 rotate-90" />
                </button>
              </div>
            )}
          </>
        )}
      </section>

      {/* ═══ RECEIPT DETAIL MODAL ═══ */}
      <Modal
        open={!!viewingReceipt}
        onClose={() => setViewingReceipt(null)}
        title="Comprobante de transferencia"
        maxWidth="max-w-lg"
        footer={
          viewingReceipt?.status === "pending" ? (
            <div className="grid grid-cols-2 gap-2 sm:flex sm:justify-end">
              <button
                type="button"
                onClick={() => viewingReceipt && setReceiptToReject(viewingReceipt)}
                className="min-h-11 rounded-xl border border-rose-500/20 px-4 text-xs font-semibold text-rose-600 transition hover:bg-rose-500/10 dark:text-rose-300 sm:min-h-10"
              >
                Rechazar
              </button>
              <button
                type="button"
                onClick={() => viewingReceipt && handleApprove(viewingReceipt)}
                className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-5 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-500 sm:min-h-10"
              >
                <CheckCircle2 className="h-4 w-4" />
                Aprobar y confirmar turno
              </button>
            </div>
          ) : undefined
        }
      >
        {viewingReceipt && (
          <div className="space-y-4 text-xs">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[11px] font-medium text-slate-500 dark:text-zinc-400">Monto transferido</p>
                <p className="mt-0.5 text-3xl font-semibold tracking-tight tabular-nums text-slate-900 dark:text-white">
                  {formatGs(viewingReceipt.amount)}
                </p>
              </div>
              <StatusBadge status={viewingReceipt.status} />
            </div>

            {viewingReceipt.receiptUrl && !brokenImages[viewingReceipt.id] ? (
              <a
                href={viewingReceipt.receiptUrl}
                target="_blank"
                rel="noreferrer"
                className="group block overflow-hidden rounded-2xl border border-slate-200/80 bg-slate-100 dark:border-white/10 dark:bg-black/20"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={viewingReceipt.receiptUrl}
                  alt={`Comprobante de ${viewingReceipt.clientName}`}
                  onError={() => setBrokenImages((prev) => ({ ...prev, [viewingReceipt.id]: true }))}
                  className="max-h-72 w-full object-contain transition group-hover:opacity-90"
                />
              </a>
            ) : (
              <div className="flex items-center gap-2.5 rounded-2xl border border-dashed border-slate-200 px-3.5 py-3 text-[11px] text-slate-500 dark:border-white/10 dark:text-zinc-400">
                <ImageOff className="h-4 w-4 shrink-0" />
                No hay imagen del comprobante disponible.
              </div>
            )}

            <div className="grid grid-cols-2 gap-2">
              <div
                className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 ${
                  viewingReceipt.qrCodeDetected
                    ? "border-emerald-500/20 bg-emerald-500/[0.06]"
                    : "border-slate-200/80 dark:border-white/10"
                }`}
              >
                <QrCode
                  className={`h-4 w-4 shrink-0 ${viewingReceipt.qrCodeDetected ? "text-emerald-500" : "text-slate-400"}`}
                />
                <span className="min-w-0">
                  <span className="block font-semibold text-slate-800 dark:text-zinc-200">Código QR</span>
                  <span className="block text-[11px] text-slate-500 dark:text-zinc-400">
                    {viewingReceipt.qrCodeDetected ? "Detectado" : "No detectado"}
                  </span>
                </span>
              </div>
              <div
                className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 ${
                  viewingReceipt.ocrVerified
                    ? "border-indigo-500/20 bg-indigo-500/[0.06]"
                    : "border-slate-200/80 dark:border-white/10"
                }`}
              >
                <ScanText
                  className={`h-4 w-4 shrink-0 ${viewingReceipt.ocrVerified ? "text-indigo-500" : "text-slate-400"}`}
                />
                <span className="min-w-0">
                  <span className="block font-semibold text-slate-800 dark:text-zinc-200">Lectura automática</span>
                  <span className="block text-[11px] tabular-nums text-slate-500 dark:text-zinc-400">
                    {viewingReceipt.ocrVerified
                      ? typeof viewingReceipt.ocrConfidence === "number"
                        ? `${viewingReceipt.ocrConfidence}% de confianza`
                        : "Datos leídos"
                      : "Sin lectura"}
                  </span>
                </span>
              </div>
            </div>

            <dl className="divide-y divide-slate-100 rounded-2xl border border-slate-200/80 px-3.5 dark:divide-white/[0.06] dark:border-white/10">
              {[
                { icon: Smartphone, label: "Cliente", value: viewingReceipt.clientName, sub: viewingReceipt.clientPhone },
                { icon: Building2, label: "Banco de origen", value: viewingReceipt.bankOrigin || "No indicado" },
                { icon: Hash, label: "N° de operación", value: viewingReceipt.operationNumber || "No indicado" },
                {
                  icon: Clock,
                  label: "Recibido",
                  value: formatDate(viewingReceipt.submittedAt, "dd/MM/yyyy HH:mm 'hs'"),
                },
                { icon: ShieldCheck, label: "Destino", value: business.name },
              ].map((item) => {
                const ItemIcon = item.icon;
                return (
                  <div key={item.label} className="flex items-start justify-between gap-3 py-2.5">
                    <dt className="flex items-center gap-2 text-slate-500 dark:text-zinc-400">
                      <ItemIcon className="h-3.5 w-3.5 shrink-0" />
                      {item.label}
                    </dt>
                    <dd className="min-w-0 text-right">
                      <span className="block truncate font-semibold text-slate-800 dark:text-zinc-200">{item.value}</span>
                      {item.sub && (
                        <span className="block text-[11px] tabular-nums text-slate-500 dark:text-zinc-400">{item.sub}</span>
                      )}
                    </dd>
                  </div>
                );
              })}
            </dl>

            {viewingReceipt.note && (
              <div className="rounded-2xl border border-slate-200/80 bg-slate-50 px-3.5 py-2.5 dark:border-white/10 dark:bg-white/[0.03]">
                <p className="text-[11px] font-medium text-slate-500 dark:text-zinc-400">Nota del cliente</p>
                <p className="mt-0.5 text-slate-800 dark:text-zinc-200">{viewingReceipt.note}</p>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* ═══ REJECT CONFIRMATION ═══ */}
      <Modal
        open={!!receiptToReject}
        onClose={() => setReceiptToReject(null)}
        title="¿Rechazar comprobante?"
        maxWidth="max-w-sm"
        footer={
          <div className="grid grid-cols-2 gap-2 sm:flex sm:justify-end">
            <button
              type="button"
              onClick={() => setReceiptToReject(null)}
              className="min-h-11 rounded-xl border border-slate-200/80 px-4 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5 sm:min-h-10"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleConfirmReject}
              className="min-h-11 rounded-xl bg-rose-600 px-5 text-xs font-semibold text-white shadow-sm transition hover:bg-rose-500 sm:min-h-10"
            >
              Rechazar
            </button>
          </div>
        }
      >
        {receiptToReject && (
          <p className="text-sm text-slate-600 dark:text-zinc-300">
            El comprobante de <strong className="text-slate-900 dark:text-white">{receiptToReject.clientName}</strong> por{" "}
            <strong className="tabular-nums text-slate-900 dark:text-white">{formatGs(receiptToReject.amount)}</strong> se va a
            marcar como rechazado y su turno se cancela, liberando el horario en la agenda.
          </p>
        )}
      </Modal>
    </div>
  );
}
