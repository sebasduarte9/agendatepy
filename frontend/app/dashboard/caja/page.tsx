"use client";

import AnimatedValue from "@/components/dashboard/ui/AnimatedValue";

import { useEffect, useMemo, useState } from "react";
import {
  Banknote,
  PlusCircle,
  CreditCard,
  ArrowDownLeft,
  ArrowUpRight,
  TrendingUp,
  Wallet,
  CheckSquare,
  CheckCircle2,
  Info,
  AlertTriangle,
  FileSpreadsheet,
  Building2,
} from "lucide-react";
import { formatInTimeZone } from "date-fns-tz";
import { es } from "date-fns/locale";
import { useDashboardStore } from "@/store/useDashboardStore";
import Card from "@/components/dashboard/ui/Card";
import Modal from "@/components/dashboard/ui/Modal";
import DataTable from "@/components/dashboard/ui/DataTable";
import IosSegmentedControl from "@/components/dashboard/ui/IosSegmentedControl";
import { triggerHaptic } from "@/lib/haptics";
import { formatGs } from "@/lib/dashboard-dates";

export default function CajaPage() {
  const cashMovements = useDashboardStore((s) => s.cashMovements);
  const business = useDashboardStore((s) => s.business);
  const products = useDashboardStore((s) => s.products);
  const updateProductStock = useDashboardStore((s) => s.updateProductStock);
  const addCashMovement = useDashboardStore((s) => s.addCashMovement);
  const pushToast = useDashboardStore((s) => s.pushToast);

  const tz = business.timezone || "America/Asuncion";

  // Today & Yesterday dates formatted in business timezone
  const todayStr = useMemo(() => formatInTimeZone(new Date(), tz, "yyyy-MM-dd"), [tz]);
  const yesterdayStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return formatInTimeZone(d, tz, "yyyy-MM-dd");
  }, [tz]);

  // Day filter state: "yyyy-MM-dd" or "all"
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);

  const [modalOpen, setModalOpen] = useState(false);
  const [arqueoOpen, setArqueoOpen] = useState(false);
  const [filterMethod, setFilterMethod] = useState<string>("todos");
  const [isExportingMovements, setIsExportingMovements] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string>("");

  // Closures state
  const [closures, setClosures] = useState<any[]>([]);
  const [isClosingCash, setIsClosingCash] = useState(false);
  const [arqueoNotes, setArqueoNotes] = useState("");

  // Form for new movement
  const [form, setForm] = useState({
    type: "ingreso" as "ingreso" | "egreso",
    amount: "",
    method: "efectivo" as "efectivo" | "pos" | "transferencia",
    concept: "",
    voucherNumber: "",
  });

  // Physical cash counted for arqueo
  const [physicalCash, setPhysicalCash] = useState<string>("");

  // Fetch closures history
  const loadClosures = () => {
    fetch("/api/cash/close")
      .then((res) => res.json())
      .then((data) => {
        if (data.ok && Array.isArray(data.closures)) {
          setClosures(data.closures);
        }
      })
      .catch((e) => console.error("Error fetching cash register closures:", e));
  };

  useEffect(() => {
    loadClosures();
  }, []);

  // Filter movements by selected day
  const dateFilteredMovements = useMemo(() => {
    if (selectedDate === "all") return cashMovements;
    return cashMovements.filter((m) => {
      const mDate = formatInTimeZone(new Date(m.date), tz, "yyyy-MM-dd");
      return mDate === selectedDate;
    });
  }, [cashMovements, selectedDate, tz]);

  // Filter movements by payment method
  const filteredMovements = useMemo(() => {
    return dateFilteredMovements.filter((m) => {
      if (filterMethod === "todos") return true;
      return m.method === filterMethod;
    });
  }, [dateFilteredMovements, filterMethod]);

  const filteredMovementTotals = useMemo(() => {
    return filteredMovements.reduce(
      (totals, movement) => {
        if (movement.type === "ingreso") totals.income += movement.amount;
        else totals.expenses += movement.amount;
        return totals;
      },
      { income: 0, expenses: 0 },
    );
  }, [filteredMovements]);

  // Stats computed strictly for the active selected day / range
  const stats = useMemo(() => {
    const isToday = selectedDate === todayStr;
    const isAll = selectedDate === "all";
    const isOpeningMovement = (movement: (typeof dateFilteredMovements)[number]) =>
      movement.type === "ingreso" &&
      movement.method === "efectivo" &&
      /^(apertura|fondo inicial)/i.test(movement.concept.trim());
    const openingMovement = dateFilteredMovements.find(isOpeningMovement);
    const opening = isAll
      ? 0
      : openingMovement?.amount ?? (isToday ? (business.openingCash ?? 300000) : 0);

    let efectivoIngresos = 0;
    let posIngresos = 0;
    let transferenciaIngresos = 0;
    let egresos = 0;
    let efectivoEgresos = 0;

    dateFilteredMovements.forEach((m) => {
      if (isOpeningMovement(m)) return;
      if (m.type === "ingreso") {
        if (m.method === "efectivo") efectivoIngresos += m.amount;
        if (m.method === "pos") posIngresos += m.amount;
        if (m.method === "transferencia") transferenciaIngresos += m.amount;
      } else {
        egresos += m.amount;
        if (m.method === "efectivo") efectivoEgresos += m.amount;
      }
    });

    const totalIngresos = efectivoIngresos + posIngresos + transferenciaIngresos;
    const efectivoEnCajaEsperado = opening + efectivoIngresos - efectivoEgresos;
    const balanceNeto = totalIngresos - egresos;

    return {
      opening,
      efectivoIngresos,
      posIngresos,
      transferenciaIngresos,
      egresos,
      efectivoEgresos,
      totalIngresos,
      efectivoEnCajaEsperado,
      balanceNeto,
      isToday,
      isAll,
    };
  }, [dateFilteredMovements, selectedDate, todayStr, business.openingCash]);

  // Closure record for the active day (if any)
  const activeClosure = useMemo(() => {
    if (selectedDate === "all") return null;
    return closures.find((c) => {
      const cDate = formatInTimeZone(new Date(c.closedAt), tz, "yyyy-MM-dd");
      return cDate === selectedDate;
    });
  }, [closures, tz, selectedDate]);

  const countedVal = Number(physicalCash.replace(/\D/g, "")) || 0;
  const diferenciaArqueo = countedVal - stats.efectivoEnCajaEsperado;

  async function handleExportMovements() {
    if (filteredMovements.length === 0 || isExportingMovements) return;

    setIsExportingMovements(true);
    try {
      const XLSX = await import("xlsx");
      const movementRows = filteredMovements.map((movement) => ({
        "Fecha / hora": formatInTimeZone(movement.date, tz, "dd/MM/yyyy HH:mm"),
        Tipo: movement.type === "ingreso" ? "Ingreso" : "Egreso",
        Concepto: movement.concept,
        "Medio de pago":
          movement.method === "pos"
            ? "POS Bancard"
            : movement.method === "transferencia"
              ? "Transferencia"
              : "Efectivo",
        "Comprobante / referencia": movement.voucherNumber || "",
        "Monto (Gs.)": movement.type === "ingreso" ? movement.amount : -movement.amount,
      }));

      const movementsSheet = XLSX.utils.json_to_sheet(movementRows);
      movementsSheet["!cols"] = [
        { wch: 20 },
        { wch: 14 },
        { wch: 48 },
        { wch: 22 },
        { wch: 28 },
        { wch: 18 },
      ];
      movementsSheet["!autofilter"] = { ref: `A1:F${movementRows.length + 1}` };

      const summarySheet = XLSX.utils.aoa_to_sheet([
        ["Resumen de caja", formattedDayTitle],
        ["Movimientos", filteredMovements.length],
        ["Entradas registradas (Gs.)", filteredMovementTotals.income],
        ["Egresos registrados (Gs.)", filteredMovementTotals.expenses],
        ["Flujo neto de movimientos (Gs.)", filteredMovementTotals.income - filteredMovementTotals.expenses],
      ]);
      summarySheet["!cols"] = [{ wch: 24 }, { wch: 34 }];

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, summarySheet, "Resumen");
      XLSX.utils.book_append_sheet(workbook, movementsSheet, "Movimientos");
      XLSX.writeFileXLSX(
        workbook,
        `caja-movimientos-${selectedDate === "all" ? "historial" : selectedDate}.xlsx`,
      );
      pushToast("success", "Reporte de caja descargado en Excel.");
    } catch (error) {
      console.error("Error exporting cash movements:", error);
      pushToast("error", "No se pudo exportar el reporte de caja.");
    } finally {
      setIsExportingMovements(false);
    }
  }

  async function handleFinalizeClose() {
    setIsClosingCash(true);
    try {
      const res = await fetch("/api/cash/close", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          openingCash: stats.opening,
          expectedCash: stats.efectivoEnCajaEsperado,
          countedCash: countedVal,
          difference: diferenciaArqueo,
          notes: arqueoNotes,
        }),
      });
      const data = await res.json();
      if (data.ok && data.closure) {
        setClosures([data.closure, ...closures]);
        pushToast("success", "Cierre de caja guardado en PostgreSQL correctamente.");
        setArqueoOpen(false);
        setPhysicalCash("");
        setArqueoNotes("");
      } else {
        pushToast("error", data.message || "Error al registrar cierre de caja.");
      }
    } catch (e) {
      console.error("Error closing cash:", e);
      pushToast("error", "Error de conexión al cerrar caja.");
    } finally {
      setIsClosingCash(false);
    }
  }

  function handleSaveMovement() {
    const amt = Number(form.amount.replace(/\D/g, ""));
    if (!amt || amt <= 0) {
      pushToast("error", "Ingresá un monto válido en Guaraníes.");
      return;
    }
    const concept =
      form.concept.trim() ||
      (form.type === "egreso"
        ? "Gasto"
        : `Cobro ${form.method === "efectivo" ? "en efectivo" : form.method === "pos" ? "con POS" : "por transferencia"}`);

    if (selectedProductId) {
      updateProductStock(selectedProductId, -1);
    }

    // Assign appropriate date: if viewing a specific day, use that date
    let movementDate = new Date().toISOString();
    if (selectedDate !== "all" && selectedDate !== todayStr) {
      movementDate = new Date(`${selectedDate}T12:00:00`).toISOString();
    }

    addCashMovement({
      type: form.type,
      amount: amt,
      method: form.method,
      concept,
      date: movementDate,
      voucherNumber: form.voucherNumber.trim() || undefined,
    });

    pushToast("success", `${form.type === "ingreso" ? "Ingreso" : "Egreso"} registrado.`);
    setForm({
      type: "ingreso",
      amount: "",
      method: "efectivo",
      concept: "",
      voucherNumber: "",
    });
    setSelectedProductId("");
    setModalOpen(false);
  }

  // Format label for current date view
  const formattedDayTitle = useMemo(() => {
    if (selectedDate === "all") return "Todo el Historial de Movimientos";
    if (selectedDate === todayStr) {
      return `Hoy · ${formatInTimeZone(new Date(), tz, "EEEE d 'de' MMMM", { locale: es })}`;
    }
    if (selectedDate === yesterdayStr) {
      const yDate = new Date();
      yDate.setDate(yDate.getDate() - 1);
      return `Ayer · ${formatInTimeZone(yDate, tz, "EEEE d 'de' MMMM", { locale: es })}`;
    }
    return formatInTimeZone(new Date(`${selectedDate}T12:00:00`), tz, "EEEE d 'de' MMMM, yyyy", { locale: es });
  }, [selectedDate, todayStr, yesterdayStr, tz]);

  const incomeChannels = [
    { label: "Efectivo", value: stats.efectivoIngresos, color: "bg-emerald-500", dot: "bg-emerald-500" },
    { label: "POS", value: stats.posIngresos, color: "bg-blue-500", dot: "bg-blue-500" },
    { label: "Transferencias", value: stats.transferenciaIngresos, color: "bg-violet-500", dot: "bg-violet-500" },
  ];
  const flowScale = Math.max(stats.totalIngresos, stats.egresos, 1);

  return (
    <div className="space-y-6 pb-[calc(112px+env(safe-area-inset-bottom,0px))] sm:pb-8 w-full max-w-full overflow-hidden">
      {/* ═══ CLEAN NATIVE PAGE HEADER ═══ */}
      <div
        data-tour="caja-header"
        className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between py-1"
      >
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Caja Diaria & Arqueo
        </h1>

        {/* Quick Action Dock */}
        <div className="hidden md:flex flex-wrap items-center gap-2">
          <button
            type="button"
            data-tour="caja-new-btn"
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold text-white shadow-xs transition hover:brightness-110 active:scale-95 cursor-pointer"
            style={{
              backgroundColor: business.primaryColor || "#FF4F2B",
            }}
          >
            <PlusCircle className="h-3.5 w-3.5" />
            <span>Nuevo Movimiento</span>
          </button>

          <button
            type="button"
            data-tour="caja-close-btn"
            onClick={() => setArqueoOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 px-3.5 py-2 text-xs font-semibold shadow-xs transition cursor-pointer"
          >
            <CheckSquare className="h-3.5 w-3.5 text-emerald-500" />
            <span>Cierre de Caja</span>
          </button>

        </div>
      </div>

      {/* ═══ MOBILE APPLE POS WALLET HERO CARD ═══ */}
      <div data-tour="caja-kpis" className="kpi-rise block md:hidden p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/10 shadow-xs space-y-3.5">
        {/* Date Selector Pills on Mobile */}
        <div data-tour="caja-date-filter" className="flex items-center justify-between gap-1 bg-slate-100 dark:bg-slate-800/60 p-1 rounded-2xl">
          <button
            type="button"
            onClick={() => {
              triggerHaptic("selection");
              setSelectedDate(todayStr);
            }}
            className={`flex-1 py-1.5 rounded-xl text-xs font-bold text-center transition cursor-pointer ${
              selectedDate === todayStr
                ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Hoy
          </button>
          <button
            type="button"
            onClick={() => {
              triggerHaptic("selection");
              setSelectedDate(yesterdayStr);
            }}
            className={`flex-1 py-1.5 rounded-xl text-xs font-bold text-center transition cursor-pointer ${
              selectedDate === yesterdayStr
                ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Ayer
          </button>
          <button
            type="button"
            onClick={() => {
              triggerHaptic("selection");
              setSelectedDate("all");
            }}
            className={`flex-1 py-1.5 rounded-xl text-xs font-bold text-center transition cursor-pointer ${
              selectedDate === "all"
                ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Historial
          </button>
        </div>

        {/* Hero Cash Balance - Glassy 2.0 Style */}
        <div className="rounded-2xl p-4 glass-panel text-slate-900 dark:text-white relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400">
            <span className="flex items-center gap-1.5 font-semibold">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Efectivo en Gaveta
            </span>
            <span className="font-mono text-[11px] text-slate-500 dark:text-zinc-400 capitalize">{formattedDayTitle}</span>
          </div>

          <div className="mt-2 flex items-baseline justify-between">
            <div className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-slate-900 dark:text-white">
              <AnimatedValue value={formatGs(stats.efectivoEnCajaEsperado)} />
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              {stats.totalIngresos > 0 ? Math.round((stats.efectivoIngresos / stats.totalIngresos) * 100) : 0}% efect.
            </span>
          </div>

          {/* Breakdown Mini Strip */}
          <div data-tour="caja-methods" className="mt-3 pt-3 border-t border-slate-100 dark:border-white/5 grid grid-cols-3 gap-2 text-center text-[10px]">
            <div>
              <span className="text-slate-400 dark:text-zinc-500 block font-medium">Efectivo</span>
              <span className="font-bold font-mono text-slate-900 dark:text-white">{formatGs(stats.efectivoIngresos)}</span>
            </div>
            <div>
              <span className="text-slate-400 dark:text-zinc-500 block font-medium">POS Bancard</span>
              <span className="font-bold font-mono text-slate-900 dark:text-white">{formatGs(stats.posIngresos)}</span>
            </div>
            <div>
              <span className="text-slate-400 dark:text-zinc-500 block font-medium">Transferencia</span>
              <span className="font-bold font-mono text-slate-900 dark:text-white">{formatGs(stats.transferenciaIngresos)}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons for Mobile */}
        <div className="grid grid-cols-2 gap-2 pt-0.5">
          <button
            type="button"
            onClick={() => {
              triggerHaptic("medium");
              setModalOpen(true);
            }}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-2xl text-xs font-bold text-white shadow-xs active:scale-95 transition cursor-pointer"
            style={{ backgroundColor: business.primaryColor || "var(--primary, #FF4F2B)" }}
          >
            <PlusCircle className="h-4 w-4" />
            <span>+ Movimiento</span>
          </button>

          <button
            type="button"
            onClick={() => {
              triggerHaptic("medium");
              setArqueoOpen(true);
            }}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-2xl border border-slate-200/90 dark:border-white/10 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold shadow-xs active:scale-95 transition cursor-pointer"
          >
            <CheckSquare className="h-4 w-4 text-emerald-500" />
            <span>Cierre / Arqueo</span>
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. OPERATIONAL INSET CONTAINER (GAUGES & TELEMETRY)        */}
      {/* ========================================================= */}
      <div data-tour="caja-kpis" className="kpi-rise hidden md:block rounded-[28px] bg-slate-100/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 p-4 sm:p-5 shadow-xs space-y-4">
        {/* Inset Subheader with Date Filter Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
          <div>
            <div className="font-semibold text-sm text-slate-900 dark:text-white">
              Resumen de Caja · {formattedDayTitle}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">
              {dateFilteredMovements.length} movimientos registrados en este período
            </div>
          </div>

          {/* Date Filter Segmented Controls */}
          <div data-tour="caja-date-filter" className="flex flex-wrap items-center gap-1.5 bg-white dark:bg-slate-950 p-1 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
            <button
              type="button"
              onClick={() => setSelectedDate(todayStr)}
              className={`rounded-xl px-3 py-1 text-xs font-bold transition cursor-pointer ${
                selectedDate === todayStr
                  ? "text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
              style={selectedDate === todayStr ? { backgroundColor: "var(--primary, #FF4F2B)" } : undefined}
            >
              Hoy
            </button>
            <button
              type="button"
              onClick={() => setSelectedDate(yesterdayStr)}
              className={`rounded-xl px-3 py-1 text-xs font-bold transition cursor-pointer ${
                selectedDate === yesterdayStr
                  ? "text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
              style={selectedDate === yesterdayStr ? { backgroundColor: "var(--primary, #FF4F2B)" } : undefined}
            >
              Ayer
            </button>
            <div className="relative inline-flex items-center">
              <input
                type="date"
                value={selectedDate === "all" ? "" : selectedDate}
                onChange={(e) => {
                  if (e.target.value) setSelectedDate(e.target.value);
                }}
                className={`rounded-xl border px-2.5 py-0.5 text-xs font-medium transition cursor-pointer ${
                  selectedDate !== todayStr && selectedDate !== yesterdayStr && selectedDate !== "all"
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                } focus:outline-none`}
                title="Seleccionar fecha"
              />
            </div>
            <button
              type="button"
              onClick={() => setSelectedDate("all")}
              className={`rounded-xl px-3 py-1 text-xs font-bold transition cursor-pointer ${
                selectedDate === "all"
                  ? "text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
              style={selectedDate === "all" ? { backgroundColor: "var(--primary, #FF4F2B)" } : undefined}
            >
              Historial
            </button>
          </div>
        </div>

        {/* Status Alert if needed */}
        {activeClosure ? (
          <div className="flex items-center justify-between rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-3.5 shadow-xs">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <div>
                <p className="text-xs font-bold text-emerald-950 dark:text-emerald-200">
                  Arqueo registrado ({formatInTimeZone(new Date(activeClosure.closedAt), tz, "HH:mm")} hs por {activeClosure.closedBy})
                </p>
                <p className="text-[11px] text-emerald-800/80 dark:text-emerald-300">
                  Efectivo contado: {formatGs(activeClosure.countedCash)} · Diferencia: {formatGs(activeClosure.difference)} · {activeClosure.notes ? `Nota: "${activeClosure.notes}"` : "Sin observaciones"}.
                </p>
              </div>
            </div>
          </div>
        ) : selectedDate === todayStr ? (
          <div className="flex items-center justify-between rounded-2xl bg-amber-500/10 border border-amber-500/25 px-3.5 py-2.5 backdrop-blur-md shadow-xs">
            <div className="flex items-center gap-2">
              <Info className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <p className="text-xs font-semibold text-amber-900 dark:text-amber-200">
                Fondo inicial: <strong className="font-mono">{formatGs(stats.opening)}</strong>
              </p>
            </div>
          </div>
        ) : null}

        <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
          <div className="rounded-2xl glass-panel-subtle p-4">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400"><Wallet className="h-4 w-4" /></span>
              Efectivo esperado
            </div>
            <div className="mt-3 text-lg font-bold tabular-nums text-slate-900 dark:text-white"><AnimatedValue value={formatGs(stats.efectivoEnCajaEsperado)} /></div>
            <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">En la gaveta al cierre</div>
          </div>
          <div className="rounded-2xl glass-panel-subtle p-4">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"><ArrowDownLeft className="h-4 w-4" /></span>
              Ingresos
            </div>
            <div className="mt-3 text-lg font-bold tabular-nums text-emerald-700 dark:text-emerald-300"><AnimatedValue value={formatGs(stats.totalIngresos)} /></div>
            <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">Todos los medios de cobro</div>
          </div>
          <div className="rounded-2xl glass-panel-subtle p-4">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400"><ArrowUpRight className="h-4 w-4" /></span>
              Egresos
            </div>
            <div className="mt-3 text-lg font-bold tabular-nums text-rose-700 dark:text-rose-300">-{formatGs(stats.egresos)}</div>
            <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">Gastos registrados</div>
          </div>
          <div className="rounded-2xl glass-panel-subtle p-4">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary"><TrendingUp className="h-4 w-4" /></span>
              Balance neto
            </div>
            <div className={`mt-3 text-lg font-bold tabular-nums ${stats.balanceNeto < 0 ? "text-rose-700 dark:text-rose-300" : "text-slate-900 dark:text-white"}`}><AnimatedValue value={formatGs(stats.balanceNeto)} /></div>
            <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">Ingresos menos egresos</div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <section data-tour="caja-methods" className="rounded-2xl glass-panel-subtle p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Distribución de ingresos</h3>
                <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">Participación por medio de cobro</p>
              </div>
              <span className="text-sm font-bold tabular-nums text-slate-900 dark:text-white">{formatGs(stats.totalIngresos)}</span>
            </div>

            <div
              className="mt-5 flex h-3 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800"
              role="img"
              aria-label={`Ingresos: efectivo ${formatGs(stats.efectivoIngresos)}, POS ${formatGs(stats.posIngresos)}, transferencias ${formatGs(stats.transferenciaIngresos)}`}
            >
              {incomeChannels.map((channel) => (
                <div
                  key={channel.label}
                  className={`${channel.color} transition-[width] duration-500`}
                  style={{ width: `${stats.totalIngresos > 0 ? (channel.value / stats.totalIngresos) * 100 : 0}%` }}
                />
              ))}
            </div>

            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {incomeChannels.map((channel) => (
                <div key={channel.label} className="min-w-0 rounded-xl border border-slate-200/70 bg-white/40 p-3 dark:border-white/5 dark:bg-slate-950/20">
                  <div className="flex items-center justify-between gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-2"><span className={`h-2 w-2 rounded-full ${channel.dot}`} />{channel.label}</span>
                    <span>{stats.totalIngresos > 0 ? Math.round((channel.value / stats.totalIngresos) * 100) : 0}%</span>
                  </div>
                  <div className="mt-2 truncate text-sm font-semibold tabular-nums text-slate-900 dark:text-white">{formatGs(channel.value)}</div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl glass-panel-subtle p-5">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Ingresos y egresos</h3>
              <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">Comparación de movimientos del período</p>
            </div>
            <div className="mt-5 space-y-5">
              <div>
                <div className="mb-2 flex items-center justify-between gap-3 text-xs">
                  <span className="font-medium text-slate-700 dark:text-slate-200">Ingresos</span>
                  <span className="font-semibold tabular-nums text-emerald-700 dark:text-emerald-300">{formatGs(stats.totalIngresos)}</span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                  <div className="h-full rounded-full bg-emerald-500 transition-[width] duration-500" style={{ width: `${(stats.totalIngresos / flowScale) * 100}%` }} />
                </div>
              </div>
              <div>
                <div className="mb-2 flex items-center justify-between gap-3 text-xs">
                  <span className="font-medium text-slate-700 dark:text-slate-200">Egresos</span>
                  <span className="font-semibold tabular-nums text-rose-700 dark:text-rose-300">{formatGs(stats.egresos)}</span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                  <div className="h-full rounded-full bg-rose-500 transition-[width] duration-500" style={{ width: `${(stats.egresos / flowScale) * 100}%` }} />
                </div>
              </div>
            </div>
            <div className="mt-5 flex items-center justify-between gap-3 rounded-xl border border-slate-200/70 bg-white/40 px-3.5 py-3 text-xs dark:border-white/5 dark:bg-slate-950/20">
              <span className="text-slate-500 dark:text-slate-400">Resultado del período</span>
              <span className={`font-bold tabular-nums ${stats.balanceNeto < 0 ? "text-rose-700 dark:text-rose-300" : "text-slate-900 dark:text-white"}`}>{formatGs(stats.balanceNeto)}</span>
            </div>
          </section>
        </div>
      </div>

      {/* Movements Table */}
      <Card data-tour="caja-table">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-black text-slate-900 dark:text-white">
              Movimientos
            </h2>
            <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
              {formattedDayTitle} · {filteredMovements.length} {filteredMovements.length === 1 ? "registro" : "registros"}
            </p>
            <div className="mt-2 flex flex-wrap gap-2 text-[10px] font-semibold">
              <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-emerald-700 dark:text-emerald-300">Entradas {formatGs(filteredMovementTotals.income)}</span>
              <span className="rounded-full bg-rose-500/10 px-2.5 py-1 text-rose-700 dark:text-rose-300">Egresos {formatGs(filteredMovementTotals.expenses)}</span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleExportMovements}
              disabled={filteredMovements.length === 0 || isExportingMovements}
              className="inline-flex items-center gap-1.5 rounded-2xl border border-emerald-600/20 bg-emerald-500/10 px-3 py-2 text-xs font-bold text-emerald-700 shadow-xs transition hover:bg-emerald-500/15 disabled:cursor-not-allowed disabled:opacity-50 dark:border-emerald-400/20 dark:text-emerald-300"
            >
              <FileSpreadsheet className="h-3.5 w-3.5" />
              {isExportingMovements ? "Preparando..." : "Exportar Excel"}
            </button>
            <div className="w-full sm:w-auto">
              <IosSegmentedControl
                value={filterMethod}
                onChange={(val) => setFilterMethod(val)}
                layoutId="cajaMethodFilter"
                size="sm"
                options={[
                  { value: "todos", label: "Todos" },
                  { value: "efectivo", label: "Efectivo" },
                  { value: "pos", label: "POS" },
                  { value: "transferencia", label: "Transferencia" },
                ]}
              />
            </div>
          </div>
        </div>

        {filteredMovements.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 dark:border-white/10 p-10 text-center bg-slate-50/50 dark:bg-slate-900/50">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-2.5">
              <Banknote className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Sin movimientos registrados
            </h3>
            <div className="mt-4">
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-2xl bg-primary px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:opacity-95 transition cursor-pointer"
              >
                <PlusCircle className="h-4 w-4" />
                <span>+ Registrar Movimiento</span>
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block">
              <DataTable
                key={`${selectedDate}-${filterMethod}`}
                rows={filteredMovements}
                columns={[
                  {
                    key: "time",
                    header: "Fecha / Hora",
                    render: (item) => (
                      <span className="font-mono text-slate-500 text-xs">
                        {formatInTimeZone(item.date, tz, "dd/MM · HH:mm")}
                      </span>
                    ),
                  },
                  {
                    key: "type",
                    header: "Tipo",
                    render: (item) => (
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          item.type === "ingreso"
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                            : "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300"
                        }`}
                      >
                        {item.type === "ingreso" ? (
                          <ArrowDownLeft className="h-3 w-3" />
                        ) : (
                          <ArrowUpRight className="h-3 w-3" />
                        )}
                        {item.type === "ingreso" ? "Ingreso" : "Egreso"}
                      </span>
                    ),
                  },
                  {
                    key: "concept",
                    header: "Concepto",
                    render: (item) => (
                      <span className="font-medium text-slate-900 dark:text-white">
                        {item.concept}
                      </span>
                    ),
                  },
                  {
                    key: "method",
                    header: "Medio de Pago",
                    render: (item) => (
                      <span className="capitalize text-slate-600 dark:text-slate-300 font-medium text-xs">
                        {item.method === "pos"
                          ? "POS Bancard"
                          : item.method === "transferencia"
                          ? "Transferencia"
                          : "Efectivo"}
                      </span>
                    ),
                  },
                  {
                    key: "voucher",
                    header: "Comprobante / Ref",
                    render: (item) => (
                      <span className="text-slate-400 font-mono text-[11px]">
                        {item.voucherNumber || "—"}
                      </span>
                    ),
                  },
                  {
                    key: "amount",
                    header: "Monto",
                    render: (item) => (
                      <span
                        className={`font-black ${
                          item.type === "ingreso"
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-rose-600 dark:text-rose-400"
                        } tabular-nums whitespace-nowrap`}
                      >
                        {item.type === "ingreso" ? "+" : "-"}
                        {formatGs(item.amount)}
                      </span>
                    ),
                  },
                ]}
                pageSize={8}
              />
            </div>

            {/* Mobile View: Apple Inset Grouped Cash Flow List */}
            <div className="md:hidden divide-y divide-slate-100 dark:divide-white/5">
              {filteredMovements.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 flex items-center justify-between gap-3 active:bg-slate-50 dark:active:bg-slate-800/40 transition"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`p-2.5 rounded-2xl shrink-0 ${
                        item.type === "ingreso"
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                          : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                      }`}
                    >
                      {item.type === "ingreso" ? (
                        <ArrowDownLeft className="h-4 w-4" />
                      ) : (
                        <ArrowUpRight className="h-4 w-4" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs text-slate-900 dark:text-white truncate">
                          {item.concept}
                        </span>
                        <span className="rounded px-1.5 py-0.2 text-[9px] font-bold uppercase tracking-tight bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                          {item.method === "pos" ? "POS" : item.method === "transferencia" ? "Transferencia" : "Efectivo"}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-mono">
                        {formatInTimeZone(item.date, tz, "dd/MM · HH:mm")} hs {item.voucherNumber && `· ${item.voucherNumber}`}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span
                      className={`text-xs font-black font-mono block ${
                        item.type === "ingreso"
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-rose-600 dark:text-rose-400"
                      }`}
                    >
                      {item.type === "ingreso" ? "+" : "-"}
                      {formatGs(item.amount)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </Card>

      {/* Historial de Arqueos / Cierres de Caja */}
      <Card className="p-5 border border-slate-200/90 dark:border-white/10 bg-white dark:bg-slate-900 shadow-xs space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Historial de Arqueos & Cierres de Caja
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Registro histórico inmutable de cierres diarios persistidos en PostgreSQL.
            </p>
          </div>
        </div>

        {closures.length === 0 ? (
          <p className="py-6 text-center text-xs text-slate-400 italic">
            No hay arqueos de caja registrados todavía.
          </p>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200/80 dark:border-white/10 text-slate-400 uppercase text-[10px] font-bold">
                    <th className="py-2.5">Fecha y Hora</th>
                    <th className="py-2.5">Responsable</th>
                    <th className="py-2.5 text-right">Efectivo Esperado</th>
                    <th className="py-2.5 text-right">Efectivo Contado</th>
                    <th className="py-2.5 text-right">Diferencia</th>
                    <th className="py-2.5">Observaciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                  {closures.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/70 dark:hover:bg-white/5 transition">
                      <td className="py-2.5 font-mono text-slate-700 dark:text-slate-300">
                        {formatInTimeZone(c.closedAt, tz, "dd/MM/yyyy HH:mm")}
                      </td>
                      <td className="py-2.5 font-medium text-slate-900 dark:text-white">{c.closedBy}</td>
                      <td className="py-2.5 text-right font-bold text-slate-700 dark:text-slate-300">
                        {formatGs(c.expectedCash)}
                      </td>
                      <td className="py-2.5 text-right font-bold text-slate-900 dark:text-white">
                        {formatGs(c.countedCash)}
                      </td>
                      <td className="py-2.5 text-right">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            c.difference === 0
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                              : c.difference > 0
                              ? "bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300"
                              : "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                          }`}
                        >
                          {c.difference === 0 ? "Exacto" : c.difference > 0 ? `+${formatGs(c.difference)}` : formatGs(c.difference)}
                        </span>
                      </td>
                      <td className="py-2.5 text-slate-500 italic">{c.notes || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile View: Apple Inset Grouped Arqueo List */}
            <div className="md:hidden divide-y divide-slate-100 dark:divide-white/5">
              {closures.map((c) => (
                <div key={c.id} className="py-3 px-1 space-y-1.5 active:bg-slate-50 dark:active:bg-slate-800/40 transition">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900 dark:text-white">
                      {c.closedBy}
                    </span>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        c.difference === 0
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                          : c.difference > 0
                          ? "bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300"
                          : "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                      }`}
                    >
                      {c.difference === 0 ? "Exacto" : c.difference > 0 ? `+${formatGs(c.difference)}` : formatGs(c.difference)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                    <span>{formatInTimeZone(c.closedAt, tz, "dd/MM · HH:mm")} hs</span>
                    <span className="font-bold text-slate-700 dark:text-slate-300">Contado: {formatGs(c.countedCash)}</span>
                  </div>
                  {c.notes && <p className="text-[11px] text-slate-400 italic">{c.notes}</p>}
                </div>
              ))}
            </div>
          </>
        )}
      </Card>

      {/* Modal 1: Custom Web Modal for New Cash Movement */}
      <Modal
        open={modalOpen}
        title="Nuevo movimiento"
        onClose={() => setModalOpen(false)}
        className="min-h-[78dvh] sm:min-h-0"
      >
        <div className="space-y-5 text-sm">
          <div className="rounded-2xl bg-slate-100/80 dark:bg-white/[0.06] p-1 grid grid-cols-2 gap-1">
            <button
              type="button"
              aria-pressed={form.type === "ingreso"}
              onClick={() => setForm({ ...form, type: "ingreso" })}
              className={`rounded-xl py-2.5 text-sm font-semibold transition cursor-pointer ${
                form.type === "ingreso"
                  ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm"
                  : "text-slate-500 dark:text-slate-400"
              }`}
            >
              Cobro
            </button>
            <button
              type="button"
              aria-pressed={form.type === "egreso"}
              onClick={() => {
                setSelectedProductId("");
                setForm({
                  ...form,
                  type: "egreso",
                  concept: form.concept.startsWith("Venta de Producto:") ? "" : form.concept,
                });
              }}
              className={`rounded-xl py-2.5 text-sm font-semibold transition cursor-pointer ${
                form.type === "egreso"
                  ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm"
                  : "text-slate-500 dark:text-slate-400"
              }`}
            >
              Gasto
            </button>
          </div>

          {form.type === "ingreso" && products.length > 0 && (
            <details className="group rounded-2xl border border-slate-200/80 dark:border-white/10 bg-slate-50/70 dark:bg-white/[0.03] p-3">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-medium text-slate-700 dark:text-slate-200">
                <span>Venta de producto <span className="font-normal text-slate-400">· opcional</span></span>
                <span className="text-xs text-slate-400 group-open:hidden">Agregar</span>
                <span className="hidden text-xs text-slate-400 group-open:inline">Cerrar</span>
              </summary>
              <div className="mt-3 space-y-2">
                <select
                  value={selectedProductId}
                  onChange={(event) => {
                    const product = products.find((item) => item.id === event.target.value);
                    setSelectedProductId(product?.id ?? "");
                    if (product) {
                      setForm({
                        ...form,
                        amount: product.price.toLocaleString("es-PY"),
                        concept: `Venta de Producto: ${product.name}`,
                      });
                    } else if (form.concept.startsWith("Venta de Producto:")) {
                      setForm({ ...form, amount: "", concept: "" });
                    }
                  }}
                  className="w-full rounded-xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900 px-3 py-3 text-sm text-slate-900 dark:text-white focus:border-primary focus:outline-none"
                >
                  <option value="">Elegir producto</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name} · {formatGs(product.price)} · stock {product.stock}
                    </option>
                  ))}
                </select>
              </div>
            </details>
          )}

          <div>
            <label htmlFor="cash-movement-amount" className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">
              Monto
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">
                Gs.
              </span>
              <input
                id="cash-movement-amount"
                type="text"
                placeholder="0"
                value={form.amount}
                onChange={(event) => {
                  const digits = event.target.value.replace(/\D/g, "");
                  setForm({ ...form, amount: digits ? Number(digits).toLocaleString("es-PY") : "" });
                }}
                inputMode="numeric"
                aria-required="true"
                className="w-full rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900 py-4 pl-14 pr-4 text-2xl font-semibold tracking-tight text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-600 focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">
              Medio de pago
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                {
                  id: "efectivo",
                  label: "Efectivo",
                  icon: Banknote,
                  color: "border-emerald-500/50 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
                },
                {
                  id: "pos",
                  label: "POS",
                  icon: CreditCard,
                  color: "border-blue-500/50 bg-blue-500/10 text-blue-700 dark:text-blue-300",
                },
                {
                  id: "transferencia",
                  label: "Transferir",
                  icon: Building2,
                  color: "border-violet-500/50 bg-violet-500/10 text-violet-700 dark:text-violet-300",
                },
              ].map((opt) => {
                const Icon = opt.icon;
                const isSelected = form.method === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => setForm({ ...form, method: opt.id as any })}
                    className={`flex min-h-14 items-center justify-center gap-2 rounded-xl border px-2 py-3 text-center transition cursor-pointer ${
                      isSelected
                        ? `${opt.color} font-semibold shadow-xs`
                        : "border-slate-200/80 dark:border-white/10 bg-white dark:bg-white/[0.03] text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="text-xs">{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label htmlFor="cash-movement-concept" className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">
              Nota <span className="font-normal text-slate-400">· opcional</span>
            </label>
            <input
              id="cash-movement-concept"
              type="text"
              placeholder={form.type === "ingreso" ? "Ej. Cobro de servicio" : "Ej. Compra de insumos"}
              value={form.concept}
              onChange={(e) => setForm({ ...form, concept: e.target.value })}
              className="w-full rounded-xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900 py-3 px-3 text-sm text-slate-900 dark:text-white focus:border-primary focus:outline-none"
            />
          </div>

          <details className="group rounded-xl border border-slate-200/80 dark:border-white/10 px-3.5 py-3">
            <summary className="cursor-pointer list-none text-sm font-medium text-slate-600 dark:text-slate-300">
              Agregar comprobante <span className="font-normal text-slate-400">· opcional</span>
            </summary>
            <input
              type="text"
              placeholder="N.º de factura o voucher"
              value={form.voucherNumber}
              onChange={(e) => setForm({ ...form, voucherNumber: e.target.value })}
              className="mt-3 w-full rounded-xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900 py-3 px-3 text-sm text-slate-900 dark:text-white focus:border-primary focus:outline-none"
            />
          </details>

          <div className="grid grid-cols-[0.8fr_1.2fr] gap-2 border-t border-slate-200/70 dark:border-white/10 pt-4">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="rounded-xl border border-slate-200/80 dark:border-white/10 px-4 py-3 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSaveMovement}
              disabled={!form.amount}
              className="rounded-xl bg-primary hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-45 px-5 py-3 text-sm font-semibold text-white shadow-sm transition cursor-pointer"
            >
              Registrar {form.type === "ingreso" ? "cobro" : "gasto"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal 2: Custom Web Modal for Arqueo / Cierre de Caja */}
      <Modal
        open={arqueoOpen}
        title="Arqueo & Cierre de Caja del Día"
        onClose={() => setArqueoOpen(false)}
        maxWidth="max-w-xl"
      >
        <div className="space-y-3 text-sm">
          {activeClosure && (
            <div className="flex items-start gap-2.5 rounded-xl border border-amber-500/20 bg-amber-500/10 px-3 py-2.5 text-xs leading-5 text-amber-800 dark:text-amber-300">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
              <span>
                Ya hay un arqueo registrado a las {formatInTimeZone(new Date(activeClosure.closedAt), tz, "HH:mm")} hs. Este se guardará como cierre suplementario.
              </span>
            </div>
          )}

          <p className="text-sm leading-5 text-slate-500 dark:text-slate-400">
            Contá el dinero disponible y compará el total con el esperado.
          </p>

          <section
            aria-label="Resumen del efectivo esperado"
            className="rounded-2xl border border-slate-200/70 bg-slate-50 p-3.5 dark:border-white/10 dark:bg-white/[0.035]"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Efectivo esperado</p>
                <p className="mt-1 text-2xl font-bold tracking-tight tabular-nums text-primary">
                  {formatGs(stats.efectivoEnCajaEsperado)}
                </p>
              </div>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Banknote className="h-5 w-5" aria-hidden="true" />
              </div>
            </div>

            <div className="mt-3 grid grid-cols-3 divide-x divide-slate-200 border-t border-slate-200 pt-3 dark:divide-white/10 dark:border-white/10">
              <div className="min-w-0 pr-2">
                <p className="text-[11px] leading-4 text-slate-500 dark:text-slate-400">Fondo inicial</p>
                <p className="mt-1 truncate text-xs font-semibold tabular-nums text-slate-800 dark:text-slate-200">
                  {formatGs(stats.opening)}
                </p>
              </div>
              <div className="min-w-0 px-2">
                <p className="text-[11px] leading-4 text-slate-500 dark:text-slate-400">Cobros en efectivo</p>
                <p className="mt-1 truncate text-xs font-semibold tabular-nums text-emerald-700 dark:text-emerald-400">
                  +{formatGs(stats.efectivoIngresos)}
                </p>
              </div>
              <div className="min-w-0 pl-2">
                <p className="text-[11px] leading-4 text-slate-500 dark:text-slate-400">Egresos en efectivo</p>
                <p className="mt-1 truncate text-xs font-semibold tabular-nums text-rose-700 dark:text-rose-400">
                  -{formatGs(stats.efectivoEgresos)}
                </p>
              </div>
            </div>
          </section>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-3">
              <label htmlFor="physical-cash-count" className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                Efectivo contado <span className="text-primary">*</span>
              </label>
              <span className="text-xs text-slate-500 dark:text-slate-400">Guaraníes</span>
            </div>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-sm font-semibold text-slate-500 dark:text-slate-400">
                Gs.
              </span>
              <input
                id="physical-cash-count"
                type="text"
                inputMode="numeric"
                autoComplete="off"
                aria-describedby="physical-cash-hint"
                placeholder="0"
                value={physicalCash}
                onChange={(e) => setPhysicalCash(e.target.value)}
                className="h-14 w-full rounded-xl border border-slate-200 bg-white pl-14 pr-4 text-xl font-semibold tabular-nums text-slate-900 shadow-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15 dark:border-white/10 dark:bg-white/[0.06] dark:text-white"
              />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span id="physical-cash-hint" className="text-xs text-slate-500 dark:text-slate-400">
                Ingresá el total contado en el cajón.
              </span>
              <button
                type="button"
                onClick={() => {
                  triggerHaptic("selection");
                  setPhysicalCash(stats.efectivoEnCajaEsperado.toLocaleString("es-PY"));
                }}
                className="inline-flex min-h-9 items-center rounded-lg border border-primary/20 bg-primary/8 px-2.5 text-xs font-semibold text-primary transition hover:bg-primary/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              >
                Usar saldo esperado
              </button>
            </div>
          </div>

          {physicalCash && (
            <div
              role="status"
              aria-live="polite"
              className={`flex items-center justify-between gap-3 rounded-xl border px-3.5 py-3 ${
                diferenciaArqueo === 0
                  ? "border-emerald-500/25 bg-emerald-500/10"
                  : diferenciaArqueo > 0
                    ? "border-amber-500/25 bg-amber-500/10"
                    : "border-rose-500/25 bg-rose-500/10"
              }`}
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  {diferenciaArqueo === 0 ? (
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                  ) : diferenciaArqueo > 0 ? (
                    <Info className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden="true" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" aria-hidden="true" />
                  )}
                  <p className={`text-sm font-semibold ${
                    diferenciaArqueo === 0
                      ? "text-emerald-800 dark:text-emerald-300"
                      : diferenciaArqueo > 0
                        ? "text-amber-800 dark:text-amber-300"
                        : "text-rose-800 dark:text-rose-300"
                  }`}>
                    {diferenciaArqueo === 0 ? "Caja exacta" : diferenciaArqueo > 0 ? "Sobrante de caja" : "Faltante de caja"}
                  </p>
                </div>
                <p className="mt-1 truncate text-xs text-slate-600 dark:text-slate-400">
                  Contado {formatGs(countedVal)} <span aria-hidden="true">·</span> esperado {formatGs(stats.efectivoEnCajaEsperado)}
                </p>
              </div>
              <span className={`shrink-0 text-sm font-bold tabular-nums ${
                diferenciaArqueo === 0
                  ? "text-emerald-800 dark:text-emerald-300"
                  : diferenciaArqueo > 0
                    ? "text-amber-800 dark:text-amber-300"
                    : "text-rose-800 dark:text-rose-300"
              }`}>
                {diferenciaArqueo === 0
                  ? "Sin diferencia"
                  : diferenciaArqueo > 0
                    ? `+${formatGs(diferenciaArqueo)}`
                    : `-${formatGs(Math.abs(diferenciaArqueo))}`}
              </span>
            </div>
          )}

          <div>
            <label htmlFor="cash-closure-notes" className="mb-1.5 block text-sm font-semibold text-slate-800 dark:text-slate-200">
              Observaciones <span className="font-normal text-slate-500 dark:text-slate-400">· opcional</span>
            </label>
            <input
              id="cash-closure-notes"
              type="text"
              placeholder="Agregá un detalle si hace falta"
              value={arqueoNotes}
              onChange={(e) => setArqueoNotes(e.target.value)}
              className="h-12 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15 dark:border-white/10 dark:bg-white/[0.06] dark:text-white"
            />
          </div>

          <div className="sticky bottom-0 z-10 -mx-5 mt-1 grid grid-cols-[minmax(0,0.8fr)_minmax(0,1.4fr)] gap-2 border-t border-slate-200/80 bg-white/95 px-5 pb-3 pt-3 shadow-[0_-10px_24px_rgba(0,0,0,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-[#18151b]/95 sm:-mx-6 sm:px-6">
            <button
              type="button"
              onClick={() => setArqueoOpen(false)}
              className="min-h-12 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/10"
            >
              Cancelar
            </button>
            <button
              type="button"
              disabled={isClosingCash || !physicalCash.trim()}
              aria-busy={isClosingCash}
              onClick={handleFinalizeClose}
              className="min-h-12 rounded-xl bg-primary px-4 text-sm font-bold text-white shadow-[0_6px_18px_rgba(var(--primary-rgb),0.2)] transition hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-600 disabled:shadow-none dark:focus-visible:ring-offset-[#18151b] dark:disabled:bg-white/10 dark:disabled:text-slate-300"
            >
              {isClosingCash ? "Guardando…" : "Finalizar cierre"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
