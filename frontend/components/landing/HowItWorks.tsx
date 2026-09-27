"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Shield, Zap, Settings2, Check, Sparkles } from "lucide-react";
import { useCategory } from "@/context/CategoryContext";
import MiniCalendar from "./MiniCalendar";

const TIMES = ["09:00", "10:30", "14:00", "16:30"];
const PAYMENTS = [
  { id: "sipap", label: "Transferencia SIPAP (Todos los Bancos)" },
  { id: "bancard", label: "QR Bancard & POS" },
  { id: "presencial", label: "Efectivo o POS en el local" },
] as const;

export default function HowItWorks() {
  const { category } = useCategory();

  return (
    <section id="como-funciona" className="relative overflow-hidden mx-auto max-w-6xl px-4 py-20 sm:py-28 sm:px-6">
      {/* Luces y orbes ambientales de fondo */}
      <div className="pointer-events-none absolute -left-20 top-1/2 -translate-y-1/2 h-80 w-80 rounded-full bg-brand/10 blur-[100px] dark:bg-brand/15" />
      <div className="pointer-events-none absolute -right-20 top-1/4 h-80 w-80 rounded-full bg-orange-500/10 blur-[100px] dark:bg-orange-500/15" />

      <div className="max-w-2xl mb-10 space-y-2">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-brand/20 bg-brand/10 dark:bg-brand/20 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-brand">
          <Sparkles className="h-3.5 w-3.5" /> Flujo Ágil y Sin Fricción
        </span>
        <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
          De la reserva al cobro,{" "}
          <span className="bg-gradient-to-r from-brand via-[#FF6B4A] to-amber-500 bg-clip-text text-transparent">
            en segundos
          </span>
        </h2>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
          Probá la experiencia en vivo tal como la vivirán tus clientes al agendar en tu negocio.
        </p>
      </div>

      <div className="grid items-start gap-10 lg:grid-cols-2">
        <BookingWidget key={category.id} />

        <div className="space-y-4">
          <Benefit
            icon={<Shield className="h-5 w-5" />}
            title="Adiós a las inasistencias"
            text="Señas y confirmaciones automáticas por WhatsApp para cuidar tu agenda y tu tiempo."
          />
          <Benefit
            icon={<Zap className="h-5 w-5" />}
            title="Cobro directo a tu cuenta bancaria"
            text="El dinero entra por transferencia SIPAP 24/7 o POS Bancard sin intermediarios ni demoras."
          />
          <Benefit
            icon={<Settings2 className="h-5 w-5" />}
            title="Libertad total de medios de pago"
            text="Transferencia SIPAP, QR Bancard, Billetera Tigo/Personal o efectivo al atender. Vos decidís."
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
    <div className="rounded-3xl border border-slate-200/90 dark:border-white/10 bg-white/80 dark:bg-slate-900/80 p-5 sm:p-7 shadow-xl shadow-slate-200/50 dark:shadow-none backdrop-blur-2xl transition-all">
      {/* Pasos / Indicador superior */}
      <div className="mb-6 flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
        <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
          Simulador de Reserva en Vivo
        </span>
        <div className="flex items-center gap-2 text-xs font-semibold">
          {[1, 2, 3, 4].map((item) => (
            <span
              key={item}
              className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-all ${
                step >= item
                  ? "bg-brand text-white shadow-sm shadow-brand/30 scale-105"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500"
              }`}
            >
              {item}
            </span>
          ))}
        </div>
      </div>

      {step === 1 && (
        <Step key="s1" title={`1. Elegí el servicio · ${category.label}`}>
          <div className="space-y-2">
            {category.services.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setServiceId(item.id)}
                className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left text-sm transition active:scale-99 ${
                  serviceId === item.id
                    ? "border-brand bg-brand/5 dark:bg-brand/10 shadow-xs"
                    : "border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-800/60 hover:border-brand/40"
                }`}
              >
                <span>
                  <strong className="text-slate-900 dark:text-white">{item.name}</strong>
                  <span className="ml-2 text-xs text-slate-500 dark:text-slate-400">{item.duration}</span>
                </span>
                <span className="font-bold text-brand font-mono">{item.price}</span>
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setStep(2)}
            disabled={!serviceId}
            className="mt-5 w-full rounded-2xl bg-gradient-to-r from-brand to-[#FF6B4A] py-3 text-sm font-bold text-white shadow-md shadow-brand/25 hover:brightness-110 transition active:scale-98 disabled:opacity-40"
          >
            Siguiente
          </button>
        </Step>
      )}

      {step === 2 && (
        <Step key="s2" title="2. Elegí la fecha">
          <div className="p-2 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex justify-center">
            <MiniCalendar selected={date} onSelect={setDate} />
          </div>
          <div className="mt-5 flex gap-2">
            <Back onClick={() => setStep(1)} />
            <Next onClick={() => setStep(3)} disabled={!date} />
          </div>
        </Step>
      )}

      {step === 3 && (
        <Step key="s3" title="3. Elegí el horario">
          <div className="grid grid-cols-2 gap-2.5">
            {TIMES.map((slot) => (
              <button
                key={slot}
                type="button"
                onClick={() => setTime(slot)}
                className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition active:scale-98 ${
                  time === slot
                    ? "border-brand bg-brand text-white shadow-md shadow-brand/30 font-bold"
                    : "border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-800/60 text-slate-800 dark:text-slate-200 hover:border-brand/40"
                }`}
              >
                {slot} hs
              </button>
            ))}
          </div>
          <div className="mt-5 flex gap-2">
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
                className={`rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition active:scale-99 ${
                  payment === item.id
                    ? "border-brand bg-brand/5 dark:bg-brand/10 text-brand dark:text-white font-bold"
                    : "border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-800/60 text-slate-800 dark:text-slate-200 hover:border-brand/40"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
          <div className="mt-5 flex gap-2">
            <Back onClick={() => setStep(3)} />
            <Next onClick={() => setStep(5)} disabled={!payment} label="Confirmar Turno" />
          </div>
        </Step>
      )}

      {step === 5 && (
        <motion.div
          key="ok"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-500/20 p-6 text-center"
        >
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500 text-white shadow-md shadow-emerald-500/30">
            <Check className="h-6 w-6 stroke-[3]" />
          </div>
          <h3 className="mt-3 text-xl font-bold text-slate-900 dark:text-white">¡Turno confirmado!</h3>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            {service?.name} · {date?.toLocaleDateString("es-PY")} · {time} hs
            <br />
            en <strong className="text-slate-900 dark:text-white">{category.businessName}</strong>
          </p>
          <div className="mt-5 flex flex-col sm:flex-row items-center justify-center gap-2">
            <Link
              href="/onboarding"
              className="w-full sm:w-auto inline-flex items-center justify-center rounded-full bg-brand py-2.5 px-5 text-xs font-bold text-white shadow-md shadow-brand/20 hover:brightness-110 transition"
            >
              Prueba gratuitamente en tu local
            </Link>
            <button
              type="button"
              onClick={() => setStep(1)}
              className="w-full sm:w-auto text-xs font-semibold text-slate-500 hover:text-brand dark:hover:text-white py-2 px-3 transition-colors"
            >
              Simular otro turno
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}

function Step({ title, children }: { title: string; children: ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }}>
      <h3 className="mb-4 text-sm font-bold text-slate-900 dark:text-white">{title}</h3>
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
      className="flex-1 rounded-2xl bg-gradient-to-r from-brand to-[#FF6B4A] py-3 text-sm font-bold text-white shadow-md shadow-brand/20 hover:brightness-110 transition active:scale-98 disabled:opacity-40"
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
      className="flex-1 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 py-3 text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
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
    <div className="rounded-3xl border border-slate-200/90 dark:border-white/10 bg-white/80 dark:bg-slate-900/80 p-5 sm:p-6 shadow-xs backdrop-blur-xl hover:border-brand/40 transition">
      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand/10 text-brand">
        {icon}
      </div>
      <h3 className="mt-3.5 font-bold text-slate-900 dark:text-white">{title}</h3>
      <p className="mt-1.5 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{text}</p>
    </div>
  );
}
