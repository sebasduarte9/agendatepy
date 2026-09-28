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
} from "lucide-react";
import { formatInTimeZone } from "date-fns-tz";
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

  const filteredMovements = useMemo(() => {
    return cashMovements.filter((m) => {
      if (filterMethod === "todos") return true;
      return m.method === filterMethod;
    });
  }, [cashMovements, filterMethod]);

  const stats = useMemo(() => {
    const opening = business.openingCash || 300000;
    let efectivoIngresos = 0;
    let posIngresos = 0;
    let transferenciaIngresos = 0;
    let egresos = 0;

    cashMovements.forEach((m) => {
      if (m.type === "ingreso") {
        if (m.method === "efectivo") efectivoIngresos += m.amount;
        if (m.method === "pos") posIngresos += m.amount;
        if (m.method === "transferencia") transferenciaIngresos += m.amount;
      } else {
        egresos += m.amount;
      }
    });

    const totalIngresos = efectivoIngresos + posIngresos + transferenciaIngresos;
    // Expected cash in hand = opening cash + efectivo ingresos - egresos
    const efectivoEnCajaEsperado = opening + efectivoIngresos - egresos;

    return {
      opening,
      efectivoIngresos,
      posIngresos,
      transferenciaIngresos,
      egresos,
      totalIngresos,
      efectivoEnCajaEsperado,
    };
  }, [cashMovements, business.openingCash]);

  const todayStr = formatInTimeZone(new Date(), business.timezone || "America/Asuncion", "yyyy-MM-dd");
  const todaysClosure = useMemo(() => {
    return closures.find((c) => {
      const cDate = formatInTimeZone(new Date(c.closedAt), business.timezone || "America/Asuncion", "yyyy-MM-dd");
      return cDate === todayStr;
    });
  }, [closures, business.timezone, todayStr]);

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

    addCashMovement({
      type: form.type,
      amount: amt,
      method: form.method,
      concept: form.concept.trim(),
      date: new Date().toISOString(),
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

  const countedVal = Number(physicalCash.replace(/\D/g, "")) || 0;
  const diferenciaArqueo = countedVal - stats.efectivoEnCajaEsperado;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Caja Diaria & Arqueo (POS / SIPAP / Efectivo)
          </h1>
          <p className="text-sm text-slate-500">
            Control de cobros por turno, arqueo de efectivo y registro de gastos menores.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setArqueoOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <CheckSquare className="h-4 w-4 text-primary" />
            Cierre de Caja
          </button>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:opacity-95"
          >
            <PlusCircle className="h-4 w-4" />
            Nuevo Movimiento
          </button>
        </div>
      </div>

      {/* Daily Cash Closure Status Banner */}
      {todaysClosure && (
        <div className="flex items-center justify-between rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-3.5 shadow-xs">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <div>
              <p className="text-xs font-bold text-emerald-950 dark:text-emerald-200">
                Arqueo de hoy realizado con éxito ({formatInTimeZone(new Date(todaysClosure.closedAt), business.timezone || "America/Asuncion", "HH:mm")} hs)
              </p>
              <p className="text-[11px] text-emerald-800/80 dark:text-emerald-300">
                Efectivo contado: {formatGs(todaysClosure.countedCash)} · Diferencia registrada: {formatGs(todaysClosure.difference)}. Si hubo turnos posteriores de última hora, podés generar un arqueo complementario.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Explanation Banner */}
      <div className="flex items-center gap-2.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-white/10 p-3 text-xs text-slate-600 dark:text-slate-400">
        <Info className="h-4 w-4 text-primary shrink-0" />
        <span>
          <strong>Saldo esperado en caja</strong> = Fondo inicial ({formatGs(stats.opening)}) + Ingresos en efectivo (+{formatGs(stats.efectivoIngresos)}) - Egresos (-{formatGs(stats.egresos)}). Los cobros por POS y SIPAP van directo a cuenta bancaria.
        </span>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Ingresos Hoy"
          value={formatGs(stats.totalIngresos)}
          icon={TrendingUp}
        />
        <StatCard
          label="Efectivo Esperado en Caja"
          value={formatGs(stats.efectivoEnCajaEsperado)}
          icon={Banknote}
        />
        <StatCard
          label="Cobros POS / Bancard"
          value={formatGs(stats.posIngresos)}
          icon={CreditCard}
        />
        <StatCard
          label="Transferencias SIPAP"
          value={formatGs(stats.transferenciaIngresos)}
          icon={Wallet}
        />
      </div>

      {/* Breakdown by Method Cards */}
      {/* Breakdown by Method Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-l-4 border-l-emerald-500">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Efectivo Físico
          </p>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-xl font-black text-slate-900 dark:text-white">
              {formatGs(stats.efectivoEnCajaEsperado)}
            </span>
            <span className="text-xs text-slate-400">
              Apertura: {formatGs(stats.opening)}
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Ingresos: +{formatGs(stats.efectivoIngresos)} · Egresos: -{formatGs(stats.egresos)}
          </p>
        </Card>

        <Card className="border-l-4 border-l-indigo-500">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            POS / Tarjeta Bancard
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

        <Card className="border-l-4 border-l-amber-500">
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
      <Card>
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-black text-slate-900 dark:text-white">Movimientos del Día</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Registro cronológico de entradas y salidas de dinero.
            </p>
          </div>
          <div className="flex gap-1.5 overflow-x-auto">
            {["todos", "efectivo", "pos", "transferencia"].map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setFilterMethod(m)}
                className={`rounded-xl px-3 py-1.5 text-xs font-bold capitalize transition-all duration-200 ${
                  filterMethod === m
                    ? "bg-primary text-white shadow-xs"
                    : "border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                }`}
              >
                {m === "todos" ? "Todos los Medios" : m}
              </button>
            ))}
          </div>
        </div>

        {filteredMovements.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 dark:border-white/10 p-10 text-center bg-slate-50/50 dark:bg-slate-900/50">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-2.5">
              <Banknote className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              No hay movimientos de caja registrados hoy
            </h3>
            <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
              Registrá ingresos por servicios, cobros de turnos o gastos menores para comenzar el arqueo del día.
            </p>
            <div className="mt-3.5">
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:opacity-95 transition"
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
                header: "Hora",
                render: (item) => (
                  <span className="font-mono text-slate-500">
                    {formatInTimeZone(item.date, business.timezone, "HH:mm")}
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
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-rose-50 text-rose-700"
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
                render: (item) => <span className="font-medium text-slate-900">{item.concept}</span>,
              },
              {
                key: "method",
                header: "Medio de Pago",
                render: (item) => (
                  <span className="capitalize text-slate-600 font-medium">
                    {item.method === "pos" ? "POS Bancard" : item.method}
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
                    className={`font-bold ${
                      item.type === "ingreso" ? "text-emerald-600" : "text-rose-600"
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
        <div className="flex items-center justify-between">
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
                      {formatInTimeZone(c.closedAt, business.timezone || "America/Asuncion", "dd/MM/yyyy HH:mm")}
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

      {/* Modal: New Movement */}
      <Modal
        open={modalOpen}
        title="Registrar Movimiento de Caja"
        onClose={() => setModalOpen(false)}
      >
        <div className="space-y-4 text-sm">
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setForm({ ...form, type: "ingreso" })}
              className={`rounded-xl py-2.5 text-xs font-bold transition ${
                form.type === "ingreso"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              + Ingreso (Cobro)
            </button>
            <button
              type="button"
              onClick={() => setForm({ ...form, type: "egreso" })}
              className={`rounded-xl py-2.5 text-xs font-bold transition ${
                form.type === "egreso"
                  ? "bg-rose-600 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              - Egreso (Gasto)
            </button>
          </div>

          {form.type === "ingreso" && products.length > 0 && (
            <div className="rounded-xl border border-border bg-slate-50 p-3 space-y-1">
              <label className="block text-xs font-semibold text-slate-700">
                Venta de producto de mostrador (opcional)
              </label>
              <select
                value={selectedProductId}
                onChange={(e) => {
                  const pId = e.target.value;
                  setSelectedProductId(pId);
                  const prod = products.find((p) => p.id === pId);
                  if (prod) {
                    setForm({
                      ...form,
                      amount: prod.price.toString(),
                      concept: `Venta de Producto: ${prod.name}`,
                    });
                  }
                }}
                className="w-full rounded-lg border border-border bg-white px-2.5 py-2 text-xs text-slate-900 focus:border-primary focus:outline-none"
              >
                <option value="">-- Ingreso libre / No es producto --</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({formatGs(p.price)}) · Stock: {p.stock} u.
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700">Monto en Guaraníes (Gs) *</label>
            <input
              type="text"
              placeholder="Ej. 120.000"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              className="mt-1 w-full rounded-xl border border-border px-3 py-2 text-base font-bold text-slate-900 focus:border-primary focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">Medio de Pago</label>
            <select
              value={form.method}
              onChange={(e) =>
                setForm({
                  ...form,
                  method: e.target.value as "efectivo" | "pos" | "transferencia",
                })
              }
              className="mt-1 w-full rounded-xl border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
            >
              <option value="efectivo">Efectivo en Caja</option>
              <option value="pos">POS / Tarjeta Bancard</option>
              <option value="transferencia">Transferencia SIPAP</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">Concepto / Motivo *</label>
            <input
              type="text"
              placeholder="Ej. Venta de cera capilar / Pago de hielo y café"
              value={form.concept}
              onChange={(e) => setForm({ ...form, concept: e.target.value })}
              className="mt-1 w-full rounded-xl border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">N° Comprobante / Voucher (opcional)</label>
            <input
              type="text"
              placeholder="Ej. FAC-001-002-1234 o POS #4812"
              value={form.voucherNumber}
              onChange={(e) => setForm({ ...form, voucherNumber: e.target.value })}
              className="mt-1 w-full rounded-xl border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="flex-1 rounded-xl border border-slate-200 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSaveMovement}
              className="flex-1 rounded-xl bg-primary py-2.5 text-xs font-semibold text-white shadow-sm hover:opacity-95"
            >
              Guardar Movimiento
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal: Arqueo / Cierre de Caja */}
      <Modal
        open={arqueoOpen}
        title="Arqueo & Cierre de Caja del Día"
        onClose={() => setArqueoOpen(false)}
      >
        <div className="space-y-4 text-sm">
          {todaysClosure && (
            <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-2.5 text-xs text-amber-800 dark:text-amber-300 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600" />
              <span>
                Ya se registró un arqueo hoy a las {formatInTimeZone(new Date(todaysClosure.closedAt), business.timezone || "America/Asuncion", "HH:mm")} hs. Este nuevo cierre se guardará como suplementario.
              </span>
            </div>
          )}
          <p className="text-xs text-slate-500">
            Comprobá el dinero físico en el cajón de efectivo con el saldo registrado por el sistema.
          </p>

          <div className="rounded-2xl bg-slate-50 p-4 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Fondo Inicial Apertura:</span>
              <span className="font-semibold text-slate-800">{formatGs(stats.opening)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Cobros Efectivo Hoy:</span>
              <span className="font-semibold text-emerald-600">+{formatGs(stats.efectivoIngresos)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Egresos / Gastos Menores:</span>
              <span className="font-semibold text-rose-600">-{formatGs(stats.egresos)}</span>
            </div>
            <div className="border-t border-slate-200/80 pt-2 flex justify-between text-sm font-bold">
              <span className="text-slate-900">Efectivo Físico Esperado:</span>
              <span className="text-primary">{formatGs(stats.efectivoEnCajaEsperado)}</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">
              Efectivo Contado en Caja (Gs):
            </label>
            <input
              type="text"
              placeholder="Ingresá cuánto dinero hay físicamente en el cajón..."
              value={physicalCash}
              onChange={(e) => setPhysicalCash(e.target.value)}
              className="mt-1 w-full rounded-xl border border-border px-3 py-2 text-base font-bold text-slate-900 focus:border-primary focus:outline-none"
            />
          </div>

          {physicalCash && (
            <div
              className={`rounded-xl p-3 text-xs font-semibold flex items-center gap-2 ${
                diferenciaArqueo === 0
                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                  : diferenciaArqueo > 0
                  ? "bg-indigo-50 text-indigo-800 border border-indigo-200"
                  : "bg-rose-50 text-rose-800 border border-rose-200"
              }`}
            >
              {diferenciaArqueo === 0 ? (
                <>
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                  <span>¡Caja perfecta! El efectivo coincide exactamente.</span>
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
            <label className="block text-xs font-semibold text-slate-700">
              Observaciones / Justificación de Arqueo (opcional):
            </label>
            <input
              type="text"
              placeholder="Ej. Arqueo turno mañana / Justificación de faltante o sobrante"
              value={arqueoNotes}
              onChange={(e) => setArqueoNotes(e.target.value)}
              className="mt-1 w-full rounded-xl border border-border px-3 py-2 text-xs text-slate-900 focus:border-primary focus:outline-none"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={() => setArqueoOpen(false)}
              className="flex-1 rounded-xl border border-slate-200 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cerrar
            </button>
            <button
              type="button"
              disabled={isClosingCash}
              onClick={handleFinalizeClose}
              className="flex-1 rounded-xl bg-slate-900 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-slate-800 disabled:opacity-50"
            >
              {isClosingCash ? "Guardando cierre..." : "Finalizar Cierre"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
