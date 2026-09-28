"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Zap, Check, Clock, MessageSquareCheck, WalletCards } from "lucide-react";
import { useCategory } from "@/context/CategoryContext";
import MiniCalendar from "./MiniCalendar";

const TIMES = ["09:00", "10:30", "14:00", "16:30"];
const PAYMENTS = [
  { id: "presencial", label: "Pago en el local (Efectivo / POS)" },
  { id: "transferencia", label: "Transferencia bancaria directa" },
  { id: "billetera", label: "Billetera digital (Tigo / Personal / Zimple)" },
] as const;

export default function HowItWorks() {
  const { category } = useCategory();

  return (
    <section
      id="como-funciona"
      className="relative overflow-hidden mx-auto max-w-6xl px-3 sm:px-6 py-12 sm:py-20 lg:py-24 scroll-mt-24"
    >
      {/* Luces y orbes ambientales de fondo */}
      <div className="pointer-events-none absolute -left-20 top-1/2 -translate-y-1/2 h-80 w-80 rounded-full bg-brand/10 blur-[100px] dark:bg-brand/15 max-w-full" />
      <div className="pointer-events-none absolute -right-20 top-1/4 h-80 w-80 rounded-full bg-orange-500/10 blur-[100px] dark:bg-orange-500/15 max-w-full" />

      <motion.div
        initial={{ opacity: 0, y: 25 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.6 }}
        className="max-w-2xl mb-6 sm:mb-8 space-y-2"
      >
        <span className="inline-flex items-center gap-1.5 rounded-full border border-brand/20 bg-brand/10 dark:bg-brand/20 px-3.5 py-1 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-brand">
          <Clock className="h-3.5 w-3.5" /> Flujo Ágil y Sin Fricción
        </span>
        <h2 className="text-2xl xs:text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
          De la reserva a la atención,{" "}
          <span className="bg-gradient-to-r from-brand via-[#FF6B4A] to-amber-500 bg-clip-text text-transparent">
            en segundos
          </span>
        </h2>
        <p className="text-xs sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
          Probá la experiencia en vivo tal como la vivirán tus clientes al agendar en tu negocio.
        </p>
      </motion.div>

      <div className="grid items-center gap-6 sm:gap-8 lg:grid-cols-12">
        {/* Left: Interactive Booking Simulator Widget (7 cols) */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-7 min-w-0"
        >
          <BookingWidget key={category.id} />
        </motion.div>

        {/* Right: 3 Reorganized Workflow Benefits (5 cols) */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.65, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-5 space-y-2.5 sm:space-y-3 min-w-0"
        >
          <WorkflowStep
            step="01"
            icon={<Zap className="h-4.5 w-4.5 text-brand" />}
            title="Reserva en 30 Segundos"
            leadIn="Sin descargar apps ni crear contraseñas."
            detail="Tu cliente elige el servicio, día y horario disponible directamente desde tu link."
          />
          <WorkflowStep
            step="02"
            icon={<MessageSquareCheck className="h-4.5 w-4.5 text-emerald-600" />}
            title="Aviso y Recordatorio WhatsApp"
            leadIn="Confirmación inmediata y recordatorio 24h."
            detail="Botones interactivos para confirmar o reprogramar que reducen ausencias hasta un 80%."
          />
          <WorkflowStep
            step="03"
            icon={<WalletCards className="h-4.5 w-4.5 text-brand" />}
            title="Caja y Comisiones Cuadradas"
            leadIn="Arqueo diario y comisiones automáticas."
            detail="Al finalizar el turno, el monto ingresa a caja y la liquidación del equipo queda lista."
          />
        </motion.div>
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
    <div className="rounded-3xl border border-slate-200/90 dark:border-white/10 bg-white/90 dark:bg-slate-900/90 p-3.5 xs:p-4 sm:p-6 shadow-xl shadow-slate-200/50 dark:shadow-none backdrop-blur-2xl transition-all max-w-full overflow-hidden">
      {/* Pasos / Indicador superior */}
      <div className="mb-4 flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <span className="text-[11px] sm:text-xs font-bold text-slate-600 dark:text-slate-300">
          Simulador de Reserva en Vivo
        </span>
        <div className="flex items-center gap-1.5 text-xs font-semibold">
          {[1, 2, 3, 4].map((item) => (
            <span
              key={item}
              className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold transition-all ${
                step >= item
                  ? "bg-brand text-white shadow-xs scale-105"
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
          <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
            {category.services.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setServiceId(item.id)}
                className={`flex w-full items-center justify-between gap-2 rounded-xl border px-3 py-2 xs:px-3.5 xs:py-2.5 text-left text-xs transition cursor-pointer ${
                  serviceId === item.id
                    ? "border-brand bg-brand/5 dark:bg-brand/10 shadow-xs"
                    : "border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-800/60 hover:border-brand/40"
                }`}
              >
                <span className="min-w-0 pr-1">
                  <strong className="text-slate-900 dark:text-white block truncate">{item.name}</strong>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">{item.duration}</span>
                </span>
                <span className="font-bold text-brand font-mono text-xs shrink-0">{item.price}</span>
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setStep(2)}
            disabled={!serviceId}
            className="mt-4 w-full rounded-xl bg-gradient-to-r from-brand to-[#FF6B4A] py-2.5 text-xs font-bold text-white shadow-md shadow-brand/25 hover:brightness-110 transition active:scale-98 disabled:opacity-40 cursor-pointer"
          >
            Continuar a Fecha
          </button>
        </Step>
      )}

      {step === 2 && (
        <Step key="s2" title="2. Elegí la fecha de atención">
          <div className="p-1.5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex justify-center">
            <MiniCalendar selected={date} onSelect={setDate} />
          </div>
          <div className="mt-4 flex gap-2">
            <Back onClick={() => setStep(1)} />
            <Next onClick={() => setStep(3)} disabled={!date} label="Continuar a Horario" />
          </div>
        </Step>
      )}

      {step === 3 && (
        <Step key="s3" title="3. Elegí el horario disponible">
          <div className="grid grid-cols-2 gap-2">
            {TIMES.map((slot) => (
              <button
                key={slot}
                type="button"
                onClick={() => setTime(slot)}
                className={`rounded-xl border px-3 py-2 text-xs font-semibold transition active:scale-98 cursor-pointer ${
                  time === slot
                    ? "border-brand bg-brand text-white shadow-sm font-bold"
                    : "border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-800/60 text-slate-800 dark:text-slate-200 hover:border-brand/40"
                }`}
              >
                {slot} hs
              </button>
            ))}
          </div>
          <div className="mt-4 flex gap-2">
            <Back onClick={() => setStep(2)} />
            <Next onClick={() => setStep(4)} disabled={!time} label="Continuar a Cobro" />
          </div>
        </Step>
      )}

      {step === 4 && (
        <Step key="s4" title="4. Preferencia de cobro en el local">
          <div className="grid gap-2">
            {PAYMENTS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setPayment(item.id)}
                className={`rounded-xl border px-3.5 py-2.5 text-left text-xs font-semibold transition cursor-pointer ${
                  payment === item.id
                    ? "border-brand bg-brand/5 dark:bg-brand/10 text-brand dark:text-white font-bold"
                    : "border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-800/60 text-slate-800 dark:text-slate-200 hover:border-brand/40"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
          <div className="mt-4 flex gap-2">
            <Back onClick={() => setStep(3)} />
            <Next onClick={() => setStep(5)} disabled={!payment} label="Confirmar Turno Demo" />
          </div>
        </Step>
      )}

      {step === 5 && (
        <motion.div
          key="ok"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-2xl bg-emerald-50/90 dark:bg-emerald-950/40 border border-emerald-500/20 p-5 text-center"
        >
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500 text-white shadow-md shadow-emerald-500/30">
            <Check className="h-5 w-5 stroke-[3]" />
          </div>
          <h3 className="mt-2.5 text-base font-bold text-slate-900 dark:text-white">¡Turno Confirmado!</h3>
          <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
            {service?.name} · {date?.toLocaleDateString("es-PY")} · {time} hs
            <br />
            en <strong className="text-slate-900 dark:text-white">{category.businessName}</strong>
          </p>
          <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-2">
            <Link
              href="/onboarding"
              className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl bg-brand py-2 px-4 text-xs font-bold text-white shadow-md shadow-brand/20 hover:brightness-110 transition"
            >
              Probalo en tu local gratis
            </Link>
            <button
              type="button"
              onClick={() => setStep(1)}
              className="w-full sm:w-auto text-xs font-semibold text-slate-500 hover:text-brand dark:hover:text-white py-1.5 px-3 transition-colors cursor-pointer"
            >
              Simular de nuevo
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}

function Step({ title, children }: { title: string; children: ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }}>
      <h3 className="mb-3 text-xs font-bold text-slate-900 dark:text-white">{title}</h3>
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
      className="flex-1 rounded-xl bg-gradient-to-r from-brand to-[#FF6B4A] py-2 text-xs font-bold text-white shadow-md shadow-brand/20 hover:brightness-110 transition active:scale-98 disabled:opacity-40 cursor-pointer"
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
      className="flex-1 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition cursor-pointer"
    >
      Atrás
    </button>
  );
}

function WorkflowStep({
  step,
  icon,
  title,
  leadIn,
  detail,
}: {
  step: string;
  icon: ReactNode;
  title: string;
  leadIn: string;
  detail: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200/90 dark:border-white/10 bg-white/85 dark:bg-slate-900/85 p-3.5 sm:p-4 shadow-xs backdrop-blur-xl hover:border-brand/40 transition">
      <div className="flex items-center gap-2.5 sm:gap-3">
        <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-[11px] sm:text-xs font-black text-brand dark:text-white border border-slate-200/60 dark:border-white/10">
          {step}
        </div>
        <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-xl bg-brand/10">
          {icon}
        </div>
        <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">{title}</h3>
      </div>
      <div className="mt-2 text-xs leading-relaxed pl-1">
        <p className="font-semibold text-slate-800 dark:text-slate-200">{leadIn}</p>
        <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">{detail}</p>
      </div>
    </div>
  );
}
