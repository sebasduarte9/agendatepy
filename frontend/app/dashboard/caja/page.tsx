"use client";

import { useMemo, useState } from "react";
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
import { formatGs } from "@/lib/dashboard-dates";

export default function CajaPage() {
  const { cashMovements, business, products, updateProductStock, addCashMovement, pushToast } =
    useDashboardStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [arqueoOpen, setArqueoOpen] = useState(false);
  const [filterMethod, setFilterMethod] = useState<string>("todos");
  const [selectedProductId, setSelectedProductId] = useState<string>("");

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

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Ingresos Hoy"
          value={formatGs(stats.totalIngresos)}
          icon={TrendingUp}
          delta={12}
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

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                <th className="pb-3 pl-2">Hora</th>
                <th className="pb-3">Tipo</th>
                <th className="pb-3">Concepto</th>
                <th className="pb-3">Medio de Pago</th>
                <th className="pb-3">Comprobante / Ref</th>
                <th className="pb-3 pr-2 text-right">Monto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredMovements.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/70 transition">
                  <td className="py-3 pl-2 font-mono text-slate-500">
                    {formatInTimeZone(item.date, business.timezone, "HH:mm")}
                  </td>
                  <td className="py-3">
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
                  </td>
                  <td className="py-3 font-medium text-slate-900">{item.concept}</td>
                  <td className="py-3 capitalize text-slate-600 font-medium">
                    {item.method === "pos" ? "POS Bancard" : item.method}
                  </td>
                  <td className="py-3 text-slate-400 font-mono text-[11px]">
                    {item.voucherNumber || "—"}
                  </td>
                  <td
                    className={`py-3 pr-2 text-right font-bold ${
                      item.type === "ingreso" ? "text-emerald-600" : "text-rose-600"
                    }`}
                  >
                    {item.type === "ingreso" ? "+" : "-"}
                    {formatGs(item.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
              onClick={() => {
                setArqueoOpen(false);
                pushToast("success", "Arqueo de caja finalizado y registrado.");
              }}
              className="flex-1 rounded-xl bg-slate-900 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-slate-800"
            >
              Finalizar Cierre
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
