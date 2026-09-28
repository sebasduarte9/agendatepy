"use client";

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
  Download,
  Calendar,
  Building2,
  ShoppingBag,
  History,
  X,
  Filter,
} from "lucide-react";
import { formatInTimeZone } from "date-fns-tz";
import { es } from "date-fns/locale";
import { useDashboardStore } from "@/store/useDashboardStore";
import Card from "@/components/dashboard/ui/Card";
import StatCard from "@/components/dashboard/ui/StatCard";
import Modal from "@/components/dashboard/ui/Modal";
import DataTable from "@/components/dashboard/ui/DataTable";
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

  // Stats computed strictly for the active selected day / range
  const stats = useMemo(() => {
    const isToday = selectedDate === todayStr;
    const isAll = selectedDate === "all";
    const opening = isToday ? (business.openingCash || 300000) : 0;

    let efectivoIngresos = 0;
    let posIngresos = 0;
    let transferenciaIngresos = 0;
    let egresos = 0;

    dateFilteredMovements.forEach((m) => {
      if (m.type === "ingreso") {
        if (m.method === "efectivo") efectivoIngresos += m.amount;
        if (m.method === "pos") posIngresos += m.amount;
        if (m.method === "transferencia") transferenciaIngresos += m.amount;
      } else {
        egresos += m.amount;
      }
    });

    const totalIngresos = efectivoIngresos + posIngresos + transferenciaIngresos;
    const efectivoEnCajaEsperado = opening + efectivoIngresos - egresos;
    const balanceNeto = totalIngresos - egresos;

    return {
      opening,
      efectivoIngresos,
      posIngresos,
      transferenciaIngresos,
      egresos,
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
    if (!form.concept.trim()) {
      pushToast("error", "Ingresá un concepto para el movimiento.");
      return;
    }

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
      concept: form.concept.trim(),
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

  // Quick amount increment buttons for easy entry
  function handleAddAmount(increment: number) {
    const current = Number(form.amount.replace(/\D/g, "")) || 0;
    const next = current + increment;
    setForm({ ...form, amount: next.toLocaleString("es-PY") });
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

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div
        data-tour="caja-header"
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white inline-flex items-center gap-2">
            <span>Caja Diaria & Arqueo</span>
            <Wallet className="h-5 w-5 text-primary" />
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 sm:text-sm">
            Control de cobros por turno, arqueo de gaveta y registro de gastos diarios.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            data-tour="caja-close-btn"
            onClick={() => setArqueoOpen(true)}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900 px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 shadow-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <CheckSquare className="h-4 w-4 text-primary" />
            <span>Cierre de Caja</span>
          </button>
          <button
            type="button"
            data-tour="caja-new-btn"
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-primary/25 hover:opacity-95 transition cursor-pointer"
          >
            <PlusCircle className="h-4 w-4" />
            <span>+ Registrar Movimiento</span>
          </button>
        </div>
      </div>

      {/* Date Navigation & Day-by-Day Historical Filter */}
      <div
        data-tour="caja-date-filter"
        className="rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900 p-3.5 shadow-xs"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Day selection buttons */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setSelectedDate(todayStr)}
              className={`rounded-2xl px-3.5 py-1.5 text-xs font-bold transition cursor-pointer ${
                selectedDate === todayStr
                  ? "bg-primary text-white shadow-xs"
                  : "border border-slate-200/80 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
            >
              Hoy
            </button>
            <button
              type="button"
              onClick={() => setSelectedDate(yesterdayStr)}
              className={`rounded-2xl px-3.5 py-1.5 text-xs font-bold transition cursor-pointer ${
                selectedDate === yesterdayStr
                  ? "bg-primary text-white shadow-xs"
                  : "border border-slate-200/80 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
            >
              Ayer
            </button>

            {/* Custom Date Picker input styled */}
            <div className="relative inline-flex items-center">
              <input
                type="date"
                value={selectedDate === "all" ? "" : selectedDate}
                onChange={(e) => {
                  if (e.target.value) setSelectedDate(e.target.value);
                }}
                className={`rounded-2xl border px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                  selectedDate !== todayStr && selectedDate !== yesterdayStr && selectedDate !== "all"
                    ? "border-primary bg-primary/10 text-primary shadow-xs"
                    : "border-slate-200/80 dark:border-white/10 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                } focus:outline-none`}
                title="Seleccionar fecha específica"
              />
            </div>

            <button
              type="button"
              onClick={() => setSelectedDate("all")}
              className={`rounded-2xl px-3.5 py-1.5 text-xs font-bold transition cursor-pointer ${
                selectedDate === "all"
                  ? "bg-primary text-white shadow-xs"
                  : "border border-slate-200/80 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
            >
              <History className="h-3.5 w-3.5 inline mr-1" />
              Todo el Historial
            </button>
          </div>

          {/* Current view indicator & movement count */}
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200/70 dark:border-indigo-800/40 px-3 py-1 text-xs font-bold text-indigo-700 dark:text-indigo-300">
              <Calendar className="h-3.5 w-3.5" />
              <span className="capitalize">{formattedDayTitle}</span>
            </span>
            <span className="rounded-xl bg-slate-100 dark:bg-slate-800 px-2.5 py-1 text-xs font-bold text-slate-600 dark:text-slate-300">
              {dateFilteredMovements.length} mov.
            </span>
          </div>
        </div>
      </div>

      {/* Daily Cash Closure Status Banner */}
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
        <div className="flex items-center justify-between rounded-2xl bg-amber-500/10 border border-amber-500/20 p-3 shadow-xs">
          <div className="flex items-center gap-2.5">
            <Info className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <p className="text-xs text-amber-900 dark:text-amber-200">
              <strong>Caja de hoy en curso.</strong> Fondo inicial cargado: <strong>{formatGs(stats.opening)}</strong>. Al terminar tu turno, realizá el <strong>Cierre de Caja</strong> para verificar el dinero en la gaveta.
            </p>
          </div>
        </div>
      ) : null}

      {/* KPI Cards */}
      <div
        data-tour="caja-kpis"
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
      >
        <StatCard
          label={selectedDate === "all" ? "Total Ingresos Histórico" : "Total Ingresos del Día"}
          value={formatGs(stats.totalIngresos)}
          icon={TrendingUp}
        />
        <StatCard
          label="Efectivo en Gaveta Esperado"
          value={formatGs(stats.efectivoEnCajaEsperado)}
          icon={Banknote}
        />
        <StatCard
          label="Egresos / Gastos"
          value={formatGs(stats.egresos)}
          icon={ArrowUpRight}
        />
        <StatCard
          label="Balance Neto"
          value={formatGs(stats.balanceNeto)}
          icon={Wallet}
        />
      </div>

      {/* Breakdown by Method Cards */}
      <div
        data-tour="caja-methods"
        className="grid gap-4 md:grid-cols-3"
      >
        <Card className="border-l-4 border-l-emerald-500">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Efectivo Físico en Gaveta
          </p>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-xl font-black text-slate-900 dark:text-white">
              {formatGs(stats.efectivoEnCajaEsperado)}
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Fondo inicial ({formatGs(stats.opening)}) + Cobros en mano ({formatGs(stats.efectivoIngresos)}) - Egresos ({formatGs(stats.egresos)})
          </p>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Tarjetas POS Bancard
          </p>
          <div className="mt-2">
            <span className="text-xl font-black text-slate-900 dark:text-white">
              {formatGs(stats.posIngresos)}
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Acredita en cuenta bancaria comercial Bancard/uPay
          </p>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Transferencias SIPAP
          </p>
          <div className="mt-2">
            <span className="text-xl font-black text-slate-900 dark:text-white">
              {formatGs(stats.transferenciaIngresos)}
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Pagos directos vía comprobante bancario validado
          </p>
        </Card>
      </div>

      {/* Movements Table */}
      <Card data-tour="caja-table">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-black text-slate-900 dark:text-white">
              Movimientos Registrados
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Registro cronológico de entradas y salidas de dinero.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <a
              href="/api/reports/cash?type=movements&format=csv"
              download
              className="inline-flex items-center gap-1.5 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 shadow-xs transition hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              <Download className="h-3.5 w-3.5 text-slate-500" />
              Exportar CSV
            </a>
            <div className="flex gap-1.5 overflow-x-auto">
              {[
                { id: "todos", label: "Todos" },
                { id: "efectivo", label: "Efectivo" },
                { id: "pos", label: "POS Bancard" },
                { id: "transferencia", label: "SIPAP" },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setFilterMethod(m.id)}
                  className={`rounded-2xl px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                    filterMethod === m.id
                      ? "bg-primary text-white shadow-xs"
                      : "border border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {filteredMovements.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 dark:border-white/10 p-10 text-center bg-slate-50/50 dark:bg-slate-900/50">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-2.5">
              <Banknote className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              No hay movimientos de caja registrados para esta fecha
            </h3>
            <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
              Registrá ingresos por servicios, cobros de turnos o gastos menores para mantener el arqueo al día.
            </p>
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
          <DataTable
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
                      ? "SIPAP Bancario"
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
                    }`}
                  >
                    {item.type === "ingreso" ? "+" : "-"}
                    {formatGs(item.amount)}
                  </span>
                ),
              },
            ]}
            pageSize={8}
          />
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
          <a
            href="/api/reports/cash?type=closures&format=csv"
            download
            className="inline-flex items-center gap-1.5 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 shadow-xs transition hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            <Download className="h-3.5 w-3.5 text-slate-500" />
            Exportar Cierres CSV
          </a>
        </div>

        {closures.length === 0 ? (
          <p className="py-6 text-center text-xs text-slate-400 italic">
            No hay arqueos de caja registrados todavía.
          </p>
        ) : (
          <div className="overflow-x-auto">
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
        )}
      </Card>

      {/* Modal 1: Custom Web Modal for New Cash Movement */}
      <Modal
        open={modalOpen}
        title="Registrar Movimiento de Caja"
        onClose={() => setModalOpen(false)}
      >
        <div className="space-y-4 text-xs">
          {/* Movement Type Selection */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setForm({ ...form, type: "ingreso" })}
              className={`rounded-2xl py-2.5 text-xs font-bold transition cursor-pointer ${
                form.type === "ingreso"
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                  : "border border-slate-200/80 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              + Cobro / Ingreso
            </button>
            <button
              type="button"
              onClick={() => setForm({ ...form, type: "egreso" })}
              className={`rounded-2xl py-2.5 text-xs font-bold transition cursor-pointer ${
                form.type === "egreso"
                  ? "bg-rose-600 text-white shadow-md shadow-rose-600/20"
                  : "border border-slate-200/80 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              - Gasto / Egreso
            </button>
          </div>

          {/* Quick Counter Products Picker (Custom UI, No basic select) */}
          {form.type === "ingreso" && products.length > 0 && (
            <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-slate-50/70 dark:bg-slate-800/40 p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 inline-flex items-center gap-1.5">
                  <ShoppingBag className="h-3.5 w-3.5 text-primary" />
                  <span>Venta rápida de mostrador (opcional)</span>
                </span>
                {selectedProductId && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedProductId("");
                      setForm({ ...form, concept: "", amount: "" });
                    }}
                    className="text-[11px] text-slate-400 hover:text-rose-500 font-semibold cursor-pointer"
                  >
                    Limpiar selección
                  </button>
                )}
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                {products.map((p) => {
                  const isSel = selectedProductId === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        setSelectedProductId(p.id);
                        setForm({
                          ...form,
                          amount: p.price.toLocaleString("es-PY"),
                          concept: `Venta de Producto: ${p.name}`,
                        });
                      }}
                      className={`shrink-0 flex items-center gap-2 rounded-2xl border px-3 py-2 text-left transition cursor-pointer ${
                        isSel
                          ? "border-primary bg-primary/10 text-primary ring-1 ring-primary shadow-xs"
                          : "border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <div>
                        <p className="text-xs font-bold leading-tight">{p.name}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[11px] font-black text-primary">
                            {formatGs(p.price)}
                          </span>
                          <span className="text-[10px] text-slate-400 bg-slate-100 dark:bg-slate-800 px-1 rounded">
                            Stock: {p.stock} u.
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Amount Input with Currency Badge and Quick Increment Buttons */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Monto en Guaraníes (Gs) *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 font-black text-xs text-slate-400">
                Gs.
              </span>
              <input
                type="text"
                placeholder="Ej. 120.000"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                className="w-full rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900 py-2.5 pl-11 pr-3 text-base font-black text-slate-900 dark:text-white focus:border-primary focus:outline-none"
              />
            </div>
            {/* Quick Add Chips */}
            <div className="flex items-center gap-1.5 mt-2 overflow-x-auto">
              {[20000, 50000, 100000, 200000].map((inc) => (
                <button
                  key={inc}
                  type="button"
                  onClick={() => handleAddAmount(inc)}
                  className="rounded-xl border border-slate-200/80 dark:border-white/10 bg-slate-50 dark:bg-slate-800/60 px-2 py-1 text-[11px] font-bold text-slate-600 dark:text-slate-300 hover:border-primary hover:text-primary transition cursor-pointer shrink-0"
                >
                  +{formatGs(inc)}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Payment Method Segmented Cards (No basic select) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Medio de Pago *
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                {
                  id: "efectivo",
                  label: "Efectivo",
                  sub: "En Gaveta",
                  icon: Banknote,
                  color: "border-emerald-500 bg-emerald-50/70 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
                },
                {
                  id: "pos",
                  label: "POS Bancard",
                  sub: "Tarjeta / Débito",
                  icon: CreditCard,
                  color: "border-blue-500 bg-blue-50/70 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300",
                },
                {
                  id: "transferencia",
                  label: "SIPAP",
                  sub: "Transferencia",
                  icon: Building2,
                  color: "border-purple-500 bg-purple-50/70 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300",
                },
              ].map((opt) => {
                const Icon = opt.icon;
                const isSelected = form.method === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setForm({ ...form, method: opt.id as any })}
                    className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition cursor-pointer ${
                      isSelected
                        ? `${opt.color} ring-2 ring-primary/40 font-bold shadow-xs`
                        : "border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    <Icon className="h-5 w-5 mb-1" />
                    <span className="text-xs font-bold">{opt.label}</span>
                    <span className="text-[10px] text-slate-400">{opt.sub}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Concept Input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Concepto / Motivo *
            </label>
            <input
              type="text"
              placeholder="Ej. Corte degradado + barba / Compra de café y hielo"
              value={form.concept}
              onChange={(e) => setForm({ ...form, concept: e.target.value })}
              className="w-full rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900 py-2.5 px-3 text-xs text-slate-900 dark:text-white focus:border-primary focus:outline-none"
            />
          </div>

          {/* Voucher / Comprobante */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              N° Comprobante / Voucher (opcional)
            </label>
            <input
              type="text"
              placeholder="Ej. FAC-001-002-1234 o POS #4812"
              value={form.voucherNumber}
              onChange={(e) => setForm({ ...form, voucherNumber: e.target.value })}
              className="w-full rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900 py-2.5 px-3 text-xs text-slate-900 dark:text-white focus:border-primary focus:outline-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-white/10">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="rounded-xl border border-slate-200/80 dark:border-white/10 px-4 py-2 font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSaveMovement}
              className="rounded-xl bg-primary hover:opacity-95 px-5 py-2 font-bold text-white shadow-md shadow-primary/25 transition cursor-pointer"
            >
              Guardar Movimiento
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal 2: Custom Web Modal for Arqueo / Cierre de Caja */}
      <Modal
        open={arqueoOpen}
        title="Arqueo & Cierre de Caja del Día"
        onClose={() => setArqueoOpen(false)}
      >
        <div className="space-y-4 text-xs">
          {activeClosure && (
            <div className="rounded-2xl bg-amber-500/10 border border-amber-500/20 p-3 text-xs text-amber-800 dark:text-amber-300 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600" />
              <span>
                Ya se registró un arqueo en esta fecha a las {formatInTimeZone(new Date(activeClosure.closedAt), tz, "HH:mm")} hs. Este nuevo cierre se guardará como suplementario.
              </span>
            </div>
          )}

          <p className="text-slate-500 dark:text-slate-400">
            Comprobá el dinero físico en el cajón de efectivo con el saldo registrado por el sistema.
          </p>

          <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/50 p-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Fondo Inicial Apertura:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{formatGs(stats.opening)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Cobros Efectivo Hoy:</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">+{formatGs(stats.efectivoIngresos)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Egresos / Gastos Menores:</span>
              <span className="font-semibold text-rose-600 dark:text-rose-400">-{formatGs(stats.egresos)}</span>
            </div>
            <div className="border-t border-slate-200/80 dark:border-white/10 pt-2 flex justify-between text-sm font-black">
              <span className="text-slate-900 dark:text-white">Efectivo Físico Esperado:</span>
              <span className="text-primary">{formatGs(stats.efectivoEnCajaEsperado)}</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Efectivo Contado en Caja (Gs) *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 font-black text-xs text-slate-400">
                Gs.
              </span>
              <input
                type="text"
                placeholder="Ingresá cuánto dinero hay físicamente en el cajón..."
                value={physicalCash}
                onChange={(e) => setPhysicalCash(e.target.value)}
                className="w-full rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900 py-2.5 pl-11 pr-3 text-base font-black text-slate-900 dark:text-white focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          {physicalCash && (
            <div
              className={`rounded-2xl p-3 text-xs font-bold flex items-center gap-2 ${
                diferenciaArqueo === 0
                  ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                  : diferenciaArqueo > 0
                  ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-800 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800"
                  : "bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800"
              }`}
            >
              {diferenciaArqueo === 0 ? (
                <>
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                  <span>¡Caja exacta! El efectivo contado coincide al 100%.</span>
                </>
              ) : diferenciaArqueo > 0 ? (
                <>
                  <Info className="h-4 w-4 shrink-0 text-indigo-600" />
                  <span>{`Sobrante de caja: +${formatGs(diferenciaArqueo)}`}</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600" />
                  <span>{`Faltante de caja: -${formatGs(Math.abs(diferenciaArqueo))}`}</span>
                </>
              )}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Observaciones / Justificación de Arqueo (opcional)
            </label>
            <input
              type="text"
              placeholder="Ej. Arqueo turno mañana / Justificación de faltante o sobrante"
              value={arqueoNotes}
              onChange={(e) => setArqueoNotes(e.target.value)}
              className="w-full rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900 py-2.5 px-3 text-xs text-slate-900 dark:text-white focus:border-primary focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-white/10">
            <button
              type="button"
              onClick={() => setArqueoOpen(false)}
              className="rounded-xl border border-slate-200/80 dark:border-white/10 px-4 py-2 font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              disabled={isClosingCash}
              onClick={handleFinalizeClose}
              className="rounded-xl bg-slate-900 dark:bg-white dark:text-slate-900 text-white px-5 py-2 font-bold shadow-md hover:opacity-90 disabled:opacity-50 transition cursor-pointer"
            >
              {isClosingCash ? "Guardando cierre..." : "Finalizar Cierre"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
