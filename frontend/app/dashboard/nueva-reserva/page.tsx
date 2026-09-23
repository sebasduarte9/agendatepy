"use client";

import { useMemo, useState } from "react";
import { Search, Scissors, Sparkles } from "lucide-react";
import { formatInTimeZone } from "date-fns-tz";
import { useDashboardStore } from "@/store/useDashboardStore";
import Card from "@/components/dashboard/ui/Card";
import MiniCalendar from "@/components/landing/MiniCalendar";
import { formatGs } from "@/lib/dashboard-dates";
import type { PaymentMethod } from "@/lib/dashboard-types";

const TIMES = ["09:00", "10:30", "12:00", "14:00", "16:30", "18:00"];

export default function NuevaReservaPage() {
  const { services, staff, business, addAppointment, pushToast } =
    useDashboardStore();
  const activeStaff = staff.filter((s) => s.active);
  const skipStaff = activeStaff.length === 1;
  const [step, setStep] = useState(1);
  const [query, setQuery] = useState("");
  const [serviceId, setServiceId] = useState<string | null>(null);
  const [staffId, setStaffId] = useState(skipStaff ? activeStaff[0]?.id : null);
  const [date, setDate] = useState<Date | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [payment, setPayment] = useState<PaymentMethod>("efectivo");
  const [receiptName, setReceiptName] = useState("");
  const [client, setClient] = useState({ name: "", email: "", phone: "" });

  const filtered = services.filter((s) =>
    s.name.toLowerCase().includes(query.toLowerCase()),
  );
  const service = services.find((s) => s.id === serviceId);

  const civilDate = date
    ? formatInTimeZone(date.toISOString(), business.timezone, "yyyy-MM-dd")
    : "";

  const canConfirm = client.name && client.email && client.phone && payment;

  function confirm() {
    if (!serviceId || !staffId || !date || !time || !service) return;
    // TZ: armar ISO como hora local del negocio (America/Asuncion) + duración del servicio.
    const [hh, mm] = time.split(":");
    const local = `${civilDate}T${hh}:${mm}:00`;
    const start = new Date(local);
    const end = new Date(start.getTime() + service.durationMin * 60000);
    addAppointment({
      id: `ap-${Date.now()}`,
      clientName: client.name,
      clientEmail: client.email,
      clientPhone: client.phone,
      serviceId,
      staffId,
      start: start.toISOString(),
      end: end.toISOString(),
      paymentMethod: payment,
      status: payment === "sipap" ? "pending" : "confirmed",
      receiptUrl: receiptName || undefined,
    });
    pushToast("success", "Reserva creada");
    setStep(6);
  }

  const steps = skipStaff ? [1, 3, 4] : [1, 2, 3, 4];
  const visualStep = useMemo(() => {
    if (step === 1) return 1;
    if (step === 2) return 2;
    if (step === 3) return skipStaff ? 2 : 3;
    if (step === 4) return skipStaff ? 3 : 4;
    return skipStaff ? 3 : 4;
  }, [step, skipStaff]);

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <h1 className="text-2xl font-bold">Nueva reserva</h1>
      <div className="flex gap-2">
        {steps.map((item, index) => (
          <span
            key={item}
            className={`h-2 flex-1 rounded-full ${
              visualStep > index ? "bg-primary" : "bg-slate-200"
            }`}
          />
        ))}
      </div>

      {step === 1 && (
        <div>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar servicio"
              className="w-full rounded-2xl border border-border py-2 pl-9 pr-3 text-sm"
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {filtered.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setServiceId(item.id)}
                className={`service-card rounded-[20px] border p-4 text-left ${
                  serviceId === item.id ? "border-primary bg-primary/5" : "border-border bg-white"
                }`}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  {item.image === "scissors" ? (
                    <Scissors className="h-5 w-5" />
                  ) : (
                    <Sparkles className="h-5 w-5" />
                  )}
                </div>
                <p className="mt-2 font-bold">{item.name}</p>
                <p className="text-sm text-slate-500">
                  {item.durationMin} min · {formatGs(item.price)}
                </p>
              </button>
            ))}
          </div>
          <Nav
            onNext={() => setStep(skipStaff ? 3 : 2)}
            disabled={!serviceId}
          />
        </div>
      )}

      {step === 2 && (
        <div className="grid gap-3 sm:grid-cols-2">
          {activeStaff.map((person) => (
            <button
              key={person.id}
              type="button"
              onClick={() => setStaffId(person.id)}
              className={`rounded-[20px] border p-4 text-left ${
                staffId === person.id ? "border-primary bg-primary/5" : "border-border bg-white"
              }`}
            >
              <span
                className="inline-flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold text-white"
                style={{ background: person.color }}
              >
                {person.avatar}
              </span>
              <p className="mt-2 font-bold">{person.name}</p>
              <p className="text-sm text-slate-500">{person.role}</p>
            </button>
          ))}
          <Nav onBack={() => setStep(1)} onNext={() => setStep(3)} disabled={!staffId} />
        </div>
      )}

      {step === 3 && (
        <Card>
          <p className="mb-3 text-xs text-slate-400">
            TZ: slots en hora local ({business.timezone}).
          </p>
          <MiniCalendar selected={date} onSelect={setDate} />
          <div className="time-slots mt-4 grid grid-cols-3 gap-2">
            {TIMES.map((slot) => (
              <button
                key={slot}
                type="button"
                onClick={() => setTime(slot)}
                className={`rounded-xl border py-2 text-sm font-semibold ${
                  time === slot ? "border-primary bg-primary text-white" : "border-border"
                }`}
              >
                {slot}
              </button>
            ))}
          </div>
          <Nav
            onBack={() => setStep(skipStaff ? 1 : 2)}
            onNext={() => setStep(4)}
            disabled={!date || !time}
          />
        </Card>
      )}

      {step === 4 && (
        <Card className="space-y-3">
          <p className="text-sm text-slate-600">
            {service?.name} · {civilDate} · {time} · {formatGs(service?.price ?? 0)}
          </p>
          <input
            className="w-full rounded-xl border border-border px-3 py-2 text-sm"
            placeholder="Nombre"
            value={client.name}
            onChange={(e) => setClient({ ...client, name: e.target.value })}
          />
          <input
            className="w-full rounded-xl border border-border px-3 py-2 text-sm"
            placeholder="Email"
            value={client.email}
            onChange={(e) => setClient({ ...client, email: e.target.value })}
          />
          <input
            className="w-full rounded-xl border border-border px-3 py-2 text-sm"
            placeholder="Teléfono"
            value={client.phone}
            onChange={(e) => setClient({ ...client, phone: e.target.value })}
          />
          <div className="grid gap-2 sm:grid-cols-2">
            {(
              [
                { id: "efectivo", label: "Efectivo en local" },
                { id: "sipap", label: "Transferencia SIPAP" },
                { id: "pos_bancard", label: "POS Bancard (Tarjeta)" },
                { id: "billetera_py", label: "Billetera (Tigo/Personal)" },
              ] as const
            ).map(({ id, label }) => (
              <button
                key={id}
                type="button"
                onClick={() => setPayment(id)}
                className={`rounded-xl border py-2.5 px-3 text-xs font-semibold transition ${
                  payment === id ? "border-primary bg-primary/5 text-primary shadow-xs" : "border-border text-slate-700 hover:bg-slate-50"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          {payment === "sipap" && (
            <div className="rounded-2xl border border-dashed border-emerald-300 bg-emerald-50/50 p-4 text-xs space-y-2">
              <p className="font-bold text-emerald-900">Transferencia Bancaria SIPAP</p>
              <p className="text-emerald-700">
                Banco: <strong>Banco Itaú</strong> · Alias: <strong>agendate.py</strong>
              </p>
              <label className="block pt-1 text-slate-600 font-medium">
                Adjuntar comprobante de transferencia (opcional)
                <input
                  type="file"
                  className="mt-1.5 block w-full text-xs text-slate-500 file:mr-3 file:py-1 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-600 file:text-white hover:file:bg-emerald-700"
                  onChange={(e) => setReceiptName(e.target.files?.[0]?.name ?? "")}
                />
                {receiptName && <p className="mt-1 font-semibold text-emerald-800">{receiptName}</p>}
              </label>
            </div>
          )}
          <Nav onBack={() => setStep(3)} onNext={confirm} disabled={!canConfirm} label="Confirmar" />
        </Card>
      )}

      {step === 6 && (
        <Card className="text-center">
          <h2 className="text-xl font-bold">¡Turno confirmado!</h2>
          <p className="mt-2 text-sm text-slate-600">
            {client.name} · {service?.name} · {civilDate} {time}
          </p>
        </Card>
      )}
    </div>
  );
}

function Nav({
  onBack,
  onNext,
  disabled,
  label = "Siguiente",
}: {
  onBack?: () => void;
  onNext: () => void;
  disabled?: boolean;
  label?: string;
}) {
  return (
    <div className="mt-4 flex gap-2">
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="flex-1 rounded-full border border-border py-2.5 text-sm font-semibold"
        >
          Atrás
        </button>
      )}
      <button
        type="button"
        onClick={onNext}
        disabled={disabled}
        className="flex-1 rounded-full bg-primary py-2.5 text-sm font-semibold text-white disabled:opacity-40"
      >
        {label}
      </button>
    </div>
  );
}
