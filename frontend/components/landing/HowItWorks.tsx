"use client";

import { useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { Shield, Zap, Settings2, Check } from "lucide-react";
import { useCategory } from "@/context/CategoryContext";
import MiniCalendar from "./MiniCalendar";

const TIMES = ["09:00", "10:30", "14:00", "16:30"];
const PAYMENTS = [
  { id: "sipap", label: "Transferencia SIPAP" },
  { id: "bancard", label: "POS Bancard" },
  { id: "presencial", label: "Efectivo en local" },
] as const;

export default function HowItWorks() {
  const { category } = useCategory();

  return (
    <section id="como-funciona" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
        De la reserva al cobro, en segundos
      </h2>
      <div className="mt-10 grid items-start gap-10 lg:grid-cols-2">
        <BookingWidget key={category.id} />
        <div className="space-y-4">
          <Benefit
            icon={<Shield className="h-5 w-5" />}
            title="Adiós a las inasistencias"
            text="Señas y confirmaciones automáticas por WhatsApp para cuidar tu agenda."
          />
          <Benefit
            icon={<Zap className="h-5 w-5" />}
            title="Cobro directo a tu cuenta bancaria"
            text="El dinero entra por transferencia SIPAP 24/7 o POS Bancard sin intermediarios."
          />
          <Benefit
            icon={<Settings2 className="h-5 w-5" />}
            title="Libertad de medios de pago"
            text="Transferencia SIPAP, Bancard, Billetera Tigo/Personal o efectivo. Vos decidís."
          />
        </div>
      </div>
    </section>
  );
}

function BookingWidget() {
  const { category } = useCategory();
  const [step, setStep] = useState(1);
  const [serviceId, setServiceId] = useState(category.services[0]?.id);
  const [date, setDate] = useState<Date | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [payment, setPayment] = useState<string | null>(null);

  const service = category.services.find((item) => item.id === serviceId);

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/70">
      <div className="mb-5 flex items-center gap-3 text-xs font-semibold">
        {[1, 2, 3, 4].map((item) => (
          <span
            key={item}
            className={`flex h-7 w-7 items-center justify-center rounded-full ${
              step >= item ? "bg-brand text-white" : "bg-slate-100 text-slate-400"
            }`}
          >
            {item}
          </span>
        ))}
      </div>

      {step === 1 && (
          <Step key="s1" title={`1. Elegí el servicio · ${category.label}`}>
            <div className="space-y-2">
              {category.services.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setServiceId(item.id)}
                  className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left text-sm ${
                    serviceId === item.id
                      ? "border-brand bg-brand/5"
                      : "border-slate-200 hover:border-brand/40"
                  }`}
                >
                  <span>
                    <strong>{item.name}</strong>
                    <span className="ml-2 text-slate-500">{item.duration}</span>
                  </span>
                  <span className="font-semibold text-brand">{item.price}</span>
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setStep(2)}
              disabled={!serviceId}
              className="mt-4 w-full rounded-full bg-brand py-2.5 text-sm font-semibold text-white disabled:opacity-40"
            >
              Siguiente
            </button>
          </Step>
        )}

        {step === 2 && (
          <Step key="s2" title="2. Elegí la fecha">
            <MiniCalendar selected={date} onSelect={setDate} />
            <div className="mt-4 flex gap-2">
              <Back onClick={() => setStep(1)} />
              <Next onClick={() => setStep(3)} disabled={!date} />
            </div>
          </Step>
        )}

        {step === 3 && (
          <Step key="s3" title="3. Elegí el horario">
            <div className="grid grid-cols-2 gap-2">
              {TIMES.map((slot) => (
                <button
                  key={slot}
                  type="button"
                  onClick={() => setTime(slot)}
                  className={`rounded-xl border px-3 py-3 text-sm font-semibold ${
                    time === slot
                      ? "border-brand bg-brand text-white"
                      : "border-slate-200 hover:border-brand/40"
                  }`}
                >
                  {slot}
                </button>
              ))}
            </div>
            <div className="mt-4 flex gap-2">
              <Back onClick={() => setStep(2)} />
              <Next onClick={() => setStep(4)} disabled={!time} />
            </div>
          </Step>
        )}

        {step === 4 && (
          <Step key="s4" title="4. Método de pago">
            <div className="grid gap-2">
              {PAYMENTS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setPayment(item.id)}
                  className={`rounded-xl border px-4 py-3 text-left text-sm font-semibold ${
                    payment === item.id
                      ? "border-brand bg-brand/5"
                      : "border-slate-200"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <div className="mt-4 flex gap-2">
              <Back onClick={() => setStep(3)} />
              <Next onClick={() => setStep(5)} disabled={!payment} label="Confirmar" />
            </div>
          </Step>
        )}

        {step === 5 && (
          <motion.div
            key="ok"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-2xl bg-emerald-50 p-6 text-center"
          >
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500 text-white">
              <Check />
            </div>
            <h3 className="mt-3 text-xl font-bold text-slate-900">¡Turno confirmado!</h3>
            <p className="mt-2 text-sm text-slate-600">
              {service?.name} · {date?.toLocaleDateString("es-PY")} · {time}
              <br />
              en {category.businessName}
            </p>
            <button
              type="button"
              onClick={() => setStep(1)}
              className="mt-4 text-sm font-semibold text-brand"
            >
              Reservar otro turno
            </button>
          </motion.div>
        )}
    </div>
  );
}

function Step({ title, children }: { title: string; children: ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }}>
      <h3 className="mb-4 text-sm font-bold text-slate-900">{title}</h3>
      {children}
    </motion.div>
  );
}

function Next({
  onClick,
  disabled,
  label = "Siguiente",
}: {
  onClick: () => void;
  disabled?: boolean;
  label?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="mt-4 flex-1 rounded-full bg-brand py-2.5 text-sm font-semibold text-white disabled:opacity-40"
    >
      {label}
    </button>
  );
}

function Back({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mt-4 flex-1 rounded-full border border-slate-300 py-2.5 text-sm font-semibold"
    >
      Atrás
    </button>
  );
}

function Benefit({
  icon,
  title,
  text,
}: {
  icon: ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10 text-brand">
        {icon}
      </div>
      <h3 className="mt-3 font-bold text-slate-900">{title}</h3>
      <p className="mt-1 text-sm text-slate-600">{text}</p>
    </div>
  );
}
