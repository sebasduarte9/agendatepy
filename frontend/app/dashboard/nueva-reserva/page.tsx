"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Search,
  Scissors,
  Sparkles,
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  CheckCircle2,
  CalendarPlus,
  Bell,
  MessageCircle,
  ExternalLink,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Landmark,
  CreditCard,
  Banknote,
  Smartphone,
} from "lucide-react";
import { formatInTimeZone } from "date-fns-tz";
import { useDashboardStore } from "@/store/useDashboardStore";
import Card from "@/components/dashboard/ui/Card";
import MiniCalendar from "@/components/landing/MiniCalendar";
import { formatGs, phoneWa } from "@/lib/dashboard-dates";
import type { PaymentMethod } from "@/lib/dashboard-types";

const TIMES = ["08:30", "09:30", "10:30", "11:30", "14:00", "15:00", "16:30", "17:30", "18:30"];

export default function NuevaReservaPage() {
  const { services, staff, business, addAppointment, pushToast } = useDashboardStore();
  const activeStaff = staff.filter((s) => s.active);
  const skipStaff = activeStaff.length === 1;

  const [step, setStep] = useState(1);
  const [query, setQuery] = useState("");
  const [serviceId, setServiceId] = useState<string | null>(null);
  const [staffId, setStaffId] = useState(skipStaff ? activeStaff[0]?.id : null);
  const [date, setDate] = useState<Date | null>(new Date());
  const [time, setTime] = useState<string | null>("10:30");
  const [payment, setPayment] = useState<PaymentMethod>("efectivo");
  const [receiptName, setReceiptName] = useState("");
  const [consentWa, setConsentWa] = useState(true);
  const [client, setClient] = useState({ name: "", email: "", phone: "", notes: "" });

  const filtered = services.filter((s) =>
    s.name.toLowerCase().includes(query.toLowerCase()) ||
    (s.category && s.category.toLowerCase().includes(query.toLowerCase()))
  );
  const service = services.find((s) => s.id === serviceId);
  const selectedStaff = staff.find((s) => s.id === staffId);

  const civilDate = date
    ? formatInTimeZone(date.toISOString(), business.timezone, "yyyy-MM-dd")
    : "";

  const canConfirm = client.name.trim() && client.phone.trim() && payment && consentWa;

  function confirm() {
    if (!serviceId || !staffId || !date || !time || !service) return;

    const [hh, mm] = time.split(":");
    const local = `${civilDate}T${hh}:${mm}:00`;
    const start = new Date(local);
    const end = new Date(start.getTime() + service.durationMin * 60000);

    addAppointment({
      id: `ap-${Date.now()}`,
      clientName: client.name.trim(),
      clientEmail: client.email.trim() || `${client.name.toLowerCase().replace(/\s+/g, ".")}@cliente.py`,
      clientPhone: client.phone.trim(),
      serviceId,
      staffId,
      start: start.toISOString(),
      end: end.toISOString(),
      paymentMethod: payment,
      status: payment === "sipap" ? "pending" : "confirmed",
      notes: client.notes.trim() || "Reserva manual desde Dashboard",
      receiptUrl: receiptName || undefined,
    });

    pushToast("success", `¡Turno para ${client.name} reservado con éxito!`);
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

  // Google Calendar URL generator
  const googleCalendarUrl = useMemo(() => {
    if (!date || !time || !service) return "#";
    const [hh, mm] = time.split(":");
    const startStr = `${civilDate.replace(/-/g, "")}T${hh}${mm}00`;
    const endMinutes = Number(hh) * 60 + Number(mm) + service.durationMin;
    const endH = String(Math.floor(endMinutes / 60)).padStart(2, "0");
    const endM = String(endMinutes % 60).padStart(2, "0");
    const endStr = `${civilDate.replace(/-/g, "")}T${endH}${endM}00`;
    const title = encodeURIComponent(`${service.name} - ${business.name}`);
    const details = encodeURIComponent(
      `Turno confirmado con ${selectedStaff?.name || "nuestro equipo"}.\nDirección: ${business.address}\nWhatsApp: ${business.phone}`
    );
    const location = encodeURIComponent(business.address || "Asunción, Paraguay");
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startStr}/${endStr}&details=${details}&location=${location}`;
  }, [date, time, service, civilDate, selectedStaff, business]);

  // WhatsApp reminder message URL
  const waUrl = useMemo(() => {
    if (!client.phone || !service) return "#";
    const phoneClean = client.phone.replace(/[^0-9]/g, "");
    const msg = encodeURIComponent(
      `¡Hola ${client.name}! Tu turno para *${service.name}* con *${selectedStaff?.name || "nuestro equipo"}* en *${business.name}* está agendado para el *${civilDate} a las ${time} hs*.\n\n📍 Ubicación: ${business.address}\n¡Te esperamos!`
    );
    return `https://wa.me/${phoneClean}?text=${msg}`;
  }, [client, service, selectedStaff, business, civilDate, time]);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
          Agendar Nuevo Turno
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 sm:text-sm">
          Registrá una cita presencial o telefónica con sincronización inmediata a la agenda y recordatorios WhatsApp.
        </p>
      </div>

      {/* Stepper Progress Bar */}
      {step < 6 && (
        <div className="space-y-2">
          <div className="flex gap-2">
            {steps.map((item, index) => (
              <span
                key={item}
                className={`h-2 flex-1 rounded-full transition-all duration-300 ${
                  visualStep > index
                    ? "bg-primary shadow-[0_0_12px_rgba(99,102,241,0.5)]"
                    : "bg-slate-200 dark:bg-slate-800"
                }`}
              />
            ))}
          </div>
          <div className="flex justify-between text-[11px] font-semibold text-slate-400">
            <span>Paso {visualStep} de {steps.length}</span>
            <span>
              {step === 1 && "Selección de Servicio"}
              {step === 2 && "Elección de Profesional"}
              {step === 3 && "Fecha & Horario"}
              {step === 4 && "Datos del Cliente & Pago"}
            </span>
          </div>
        </div>
      )}

      {/* STEP 1: SELECT SERVICE */}
      {step === 1 && (
        <div className="space-y-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar servicio por nombre o categoría..."
              className="w-full rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-slate-900/80 py-2.5 pl-10 pr-4 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-primary focus:outline-none backdrop-blur-xl"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {filtered.map((item) => {
              const isSelected = serviceId === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setServiceId(item.id)}
                  className={`flex items-start gap-3.5 rounded-3xl border p-4 text-left transition-all duration-200 hover:-translate-y-0.5 ${
                    isSelected
                      ? "border-primary bg-primary/5 dark:bg-primary/10 shadow-[0_4px_20px_rgba(99,102,241,0.15)] ring-2 ring-primary/20"
                      : "border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-slate-900/80 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                  }`}
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    {item.image === "scissors" ? (
                      <Scissors className="h-5 w-5" />
                    ) : (
                      <Sparkles className="h-5 w-5" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-slate-900 dark:text-white text-sm">
                        {item.name}
                      </p>
                      {item.category && (
                        <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[9px] font-bold text-slate-500">
                          {item.category}
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                      {item.description || "Servicio profesional."}
                    </p>
                    <div className="mt-2 flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-400 flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {item.durationMin} min
                      </span>
                      <span className="text-primary font-bold">
                        {formatGs(item.price)}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              disabled={!serviceId}
              onClick={() => setStep(skipStaff ? 3 : 2)}
              className="inline-flex items-center gap-2 rounded-2xl bg-primary px-6 py-2.5 text-xs font-bold text-white shadow-md hover:opacity-95 disabled:opacity-40 transition"
            >
              <span>Continuar</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: SELECT STAFF */}
      {step === 2 && (
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            {activeStaff.map((person) => {
              const isSelected = staffId === person.id;
              return (
                <button
                  key={person.id}
                  type="button"
                  onClick={() => setStaffId(person.id)}
                  className={`flex items-start gap-3.5 rounded-3xl border p-4 text-left transition-all duration-200 hover:-translate-y-0.5 ${
                    isSelected
                      ? "border-primary bg-primary/5 dark:bg-primary/10 shadow-[0_4px_20px_rgba(99,102,241,0.15)] ring-2 ring-primary/20"
                      : "border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-slate-900/80 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                  }`}
                >
                  <span
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-xs font-black text-white shadow-sm"
                    style={{ background: person.color }}
                  >
                    {person.avatar}
                  </span>
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                      {person.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {person.role}
                    </p>
                    <p className="mt-1 text-[11px] font-medium text-slate-400">
                      Horario: {person.hours}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="inline-flex items-center gap-1.5 rounded-2xl border border-slate-200/80 dark:border-white/10 px-5 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Atrás</span>
            </button>
            <button
              type="button"
              disabled={!staffId}
              onClick={() => setStep(3)}
              className="inline-flex items-center gap-2 rounded-2xl bg-primary px-6 py-2.5 text-xs font-bold text-white shadow-md hover:opacity-95 disabled:opacity-40 transition"
            >
              <span>Continuar a Fecha & Hora</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: DATE & TIME */}
      {step === 3 && (
        <Card className="space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-3">
            <div>
              <h2 className="font-bold text-slate-900 dark:text-white text-sm">
                Elegí la Fecha y Franja Horaria
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Horario local de Paraguay ({business.timezone}).
              </p>
            </div>
            <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary">
              {civilDate} {time && `· ${time} hs`}
            </span>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-2">
                Fecha del Turno:
              </label>
              <MiniCalendar selected={date} onSelect={setDate} />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-2">
                Horarios Disponibles:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {TIMES.map((slot) => {
                  const isSelected = time === slot;
                  return (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setTime(slot)}
                      className={`rounded-2xl border py-2.5 text-xs font-bold transition duration-150 ${
                        isSelected
                          ? "border-primary bg-primary text-white shadow-md shadow-primary/25"
                          : "border-slate-200/80 dark:border-white/10 bg-slate-50/70 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 hover:border-primary"
                      }`}
                    >
                      {slot} hs
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-slate-100 dark:border-white/5 pt-3">
            <button
              type="button"
              onClick={() => setStep(skipStaff ? 1 : 2)}
              className="inline-flex items-center gap-1.5 rounded-2xl border border-slate-200/80 dark:border-white/10 px-5 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Atrás</span>
            </button>
            <button
              type="button"
              disabled={!date || !time}
              onClick={() => setStep(4)}
              className="inline-flex items-center gap-2 rounded-2xl bg-primary px-6 py-2.5 text-xs font-bold text-white shadow-md hover:opacity-95 disabled:opacity-40 transition"
            >
              <span>Continuar a Datos del Cliente</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </Card>
      )}

      {/* STEP 4: CLIENT INFO & PAYMENT */}
      {step === 4 && (
        <Card className="space-y-4">
          <div className="rounded-2xl bg-primary/5 border border-primary/15 p-3.5 flex items-center justify-between">
            <div>
              <p className="font-bold text-slate-900 dark:text-white text-xs">
                {service?.name} · {selectedStaff?.name}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {civilDate} a las {time} hs ({service?.durationMin} min)
              </p>
            </div>
            <span className="text-base font-black text-primary">
              {formatGs(service?.price ?? 0)}
            </span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">
                Nombre del Cliente *
              </label>
              <div className="relative">
                <User className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="Ej: Marcelo Rojas"
                  value={client.name}
                  onChange={(e) => setClient({ ...client, name: e.target.value })}
                  className="w-full rounded-xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900 pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white focus:border-primary focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">
                WhatsApp del Cliente *
              </label>
              <div className="relative">
                <Phone className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                <input
                  type="tel"
                  required
                  placeholder="+595 981 123 456"
                  value={client.phone}
                  onChange={(e) => setClient({ ...client, phone: e.target.value })}
                  className="w-full rounded-xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900 pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white focus:border-primary focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">
              Email (opcional para recibo y calendar sync)
            </label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                placeholder="cliente@ejemplo.com"
                value={client.email}
                onChange={(e) => setClient({ ...client, email: e.target.value })}
                className="w-full rounded-xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900 pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-2">
              Método de Pago
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: "efectivo" as const, label: "Efectivo", icon: Banknote },
                { id: "sipap" as const, label: "SIPAP", icon: Landmark },
                { id: "pos_bancard" as const, label: "POS Tarjeta", icon: CreditCard },
                { id: "billetera_py" as const, label: "Billetera", icon: Smartphone },
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setPayment(id)}
                  className={`flex items-center justify-center gap-2 rounded-2xl border py-2.5 px-3 text-xs font-bold transition ${
                    payment === id
                      ? "border-primary bg-primary text-white shadow-sm"
                      : "border-slate-200/80 dark:border-white/10 bg-slate-50/70 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 hover:border-primary"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* SIPAP Details if selected */}
          {payment === "sipap" && (
            <div className="rounded-2xl border border-dashed border-emerald-500/40 bg-emerald-500/5 p-4 text-xs space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-emerald-800 dark:text-emerald-300">
                <Landmark className="h-4 w-4" />
                <span>Datos SIPAP para Pago:</span>
              </div>
              <p className="text-slate-600 dark:text-slate-300">
                Banco: <strong>Banco Itaú Paraguay</strong> · Titular: <strong>{business.name}</strong> · Alias SIPAP: <strong>agendate.py</strong>
              </p>
              <label className="block pt-1 text-slate-600 dark:text-slate-300">
                <span>Comprobante adjunto (opcional):</span>
                <input
                  type="file"
                  className="mt-1 block w-full text-xs text-slate-500 file:mr-3 file:py-1 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-600 file:text-white"
                  onChange={(e) => setReceiptName(e.target.files?.[0]?.name ?? "")}
                />
              </label>
            </div>
          )}

          {/* Consent Checkbox */}
          <label className="flex items-start gap-2.5 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-slate-50/70 dark:bg-slate-800/40 p-3 text-xs cursor-pointer">
            <input
              type="checkbox"
              checked={consentWa}
              onChange={(e) => setConsentWa(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded text-primary focus:ring-primary"
            />
            <span className="text-slate-600 dark:text-slate-300">
              Autoriza recibir confirmación y recordatorios automáticos por WhatsApp 24h y 2h antes de la cita.
            </span>
          </label>

          <div className="flex items-center justify-between border-t border-slate-100 dark:border-white/5 pt-3">
            <button
              type="button"
              onClick={() => setStep(3)}
              className="inline-flex items-center gap-1.5 rounded-2xl border border-slate-200/80 dark:border-white/10 px-5 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Atrás</span>
            </button>
            <button
              type="button"
              disabled={!canConfirm}
              onClick={confirm}
              className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-7 py-2.5 text-xs font-bold text-white shadow-md hover:bg-emerald-500 disabled:opacity-40 transition"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>Confirmar Turno</span>
            </button>
          </div>
        </Card>
      )}

      {/* STEP 6: CONFIRMATION SUCCESS */}
      {step === 6 && (
        <Card className="text-center py-8 space-y-6">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500 shadow-md">
            <CheckCircle2 className="h-10 w-10 animate-pulse" />
          </div>

          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">
              ¡Turno Agendado con Éxito!
            </h2>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 sm:text-sm">
              La reserva quedó asentada en el calendario operativo del local.
            </p>
          </div>

          {/* Details Pill */}
          <div className="mx-auto max-w-md rounded-3xl border border-slate-200/80 dark:border-white/10 bg-slate-50/70 dark:bg-slate-800/40 p-5 text-left text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-400">Cliente:</span>
              <strong className="text-slate-900 dark:text-white">{client.name}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Servicio:</span>
              <strong className="text-slate-900 dark:text-white">{service?.name}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Profesional:</span>
              <strong className="text-slate-900 dark:text-white">{selectedStaff?.name}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Fecha y Hora:</span>
              <strong className="text-primary">{civilDate} a las {time} hs</strong>
            </div>
            <div className="flex justify-between border-t border-slate-200/60 dark:border-white/10 pt-2">
              <span className="text-slate-400">Monto:</span>
              <strong className="text-base font-black text-slate-900 dark:text-white">
                {formatGs(service?.price ?? 0)}
              </strong>
            </div>
          </div>

          {/* Calendar & WhatsApp Action Links */}
          <div className="mx-auto max-w-md space-y-2.5">
            <a
              href={googleCalendarUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-white/10 py-2.5 px-4 text-xs font-bold text-slate-800 dark:text-white shadow-xs hover:bg-slate-50 dark:hover:bg-slate-700 transition"
            >
              <CalendarPlus className="h-4 w-4 text-emerald-500" />
              <span>Agregar a Google Calendar (Android / Web)</span>
              <ExternalLink className="h-3 w-3 opacity-60" />
            </a>

            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 py-2.5 px-4 text-xs font-bold text-white shadow-md hover:bg-emerald-500 transition"
            >
              <MessageCircle className="h-4 w-4" />
              <span>Enviar Confirmación por WhatsApp al Cliente</span>
            </a>
          </div>

          <div className="pt-2 flex justify-center gap-3">
            <button
              type="button"
              onClick={() => {
                setStep(1);
                setClient({ name: "", email: "", phone: "", notes: "" });
              }}
              className="rounded-2xl border border-slate-200/80 dark:border-white/10 px-5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              Nueva Reserva
            </button>
            <Link
              href="/dashboard/calendario"
              className="rounded-2xl bg-primary px-6 py-2 text-xs font-bold text-white shadow-md hover:opacity-95 transition"
            >
              Ver en el Calendario
            </Link>
          </div>
        </Card>
      )}
    </div>
  );
}
