"use client";

import React, { useState, useEffect, type ReactNode } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
} from "lucide-react";
import { useCategory } from "@/context/CategoryContext";
import MiniCalendar from "./MiniCalendar";
import { LiquidGlassCard } from "@/components/ui/liquid-glass";

const TIMES = ["09:00", "10:30", "14:00", "16:30"];
const PAYMENTS = [
  { id: "presencial", label: "Pago en el local (Efectivo / POS)" },
  { id: "transferencia", label: "Transferencia bancaria directa" },
  { id: "billetera", label: "Billetera digital (Tigo / Personal / Zimple)" },
] as const;

const ROTATING_SUBDOMAINS = [
  "barberia",
  "peluqueria",
  "odontologia",
  "spa",
  "consultorio",
  "padel",
  "crossfit",
  "veterinaria",
  "estetica",
];

export default function LiveBookingSimulator() {
  const { category, selectedCategory } = useCategory();

  // Subdominio rotativo cada 2.5 segundos
  const [subdomainIndex, setSubdomainIndex] = useState(0);

  useEffect(() => {
    // Si cambia la categoría seleccionada, sincronizar de inmediato
    const foundIdx = ROTATING_SUBDOMAINS.indexOf(selectedCategory);
    if (foundIdx !== -1) {
      setSubdomainIndex(foundIdx);
    }
  }, [selectedCategory]);

  useEffect(() => {
    const timer = setInterval(() => {
      setSubdomainIndex((prev) => (prev + 1) % ROTATING_SUBDOMAINS.length);
    }, 2500);
    return () => clearInterval(timer);
  }, []);

  const currentSubdomain = ROTATING_SUBDOMAINS[subdomainIndex] || "barberia";

  return (
    <div
      id="simulador-reserva"
      className="relative w-full pt-10 sm:pt-14 pb-4 border-t border-slate-200/70 dark:border-white/10 scroll-mt-24"
    >
      {/* Encabezado limpio sin etiqueta y con el título exacto solicitado */}
      <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-8 space-y-2">
        <h3 className="text-2xl xs:text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
          Tu propio agendamiento web
        </h3>

        <p className="text-xs sm:text-sm md:text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl mx-auto">
          Tus clientes pueden reservar de forma autónoma desde cualquier dispositivo en segundos.
        </p>
      </div>

      {/* Contenedor Centrado del Mini Sistema de Pruebas de Reserva */}
      <div className="max-w-xl mx-auto w-full">
        <BookingWidget key={category.id} />

        {/* Enlace de reserva directo sin marco, tamaño grande y layout estático */}
        <div className="mt-7 flex flex-col items-center justify-center gap-1.5 text-center select-none">
          <span className="text-xs sm:text-sm font-semibold tracking-wider uppercase text-slate-500 dark:text-slate-400">
            Con tu propio link directo:
          </span>
          <div className="flex items-baseline justify-center text-xl xs:text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white font-mono">
            <span className="inline-block w-[130px] xs:w-[155px] sm:w-[200px] text-right text-[#FF4F2B] overflow-hidden whitespace-nowrap">
              <AnimatePresence mode="wait">
                <motion.span
                  key={currentSubdomain}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.18 }}
                  className="inline-block"
                >
                  {currentSubdomain}
                </motion.span>
              </AnimatePresence>
            </span>
            <span className="text-slate-800 dark:text-slate-100 whitespace-nowrap">.agendatepy.com</span>
          </div>
        </div>
      </div>
    </div>
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
    <LiquidGlassCard
      borderRadius="28px"
      blurIntensity="xl"
      glowIntensity="sm"
      shadowIntensity="md"
      className="p-3.5 xs:p-4 sm:p-6 border border-white/70 dark:border-white/10 shadow-xl max-w-full overflow-hidden bg-white/90 dark:bg-slate-900/90"
    >
      {/* Pasos / Indicador superior */}
      <div className="mb-4 flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <span className="text-[11px] sm:text-xs font-bold text-slate-700 dark:text-slate-200">
          Simulador de Reserva en Vivo · {category.businessName}
        </span>
        <div className="flex items-center gap-1.5 text-xs font-semibold">
          {[1, 2, 3, 4].map((item) => (
            <span
              key={item}
              className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold transition-all ${
                step >= item
                  ? "bg-[#FF4F2B] text-white shadow-xs scale-105"
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
                    ? "border-[#FF4F2B] bg-[#FF4F2B]/5 dark:bg-[#FF4F2B]/10 shadow-xs"
                    : "border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-800/60 hover:border-[#FF4F2B]/40"
                }`}
              >
                <span className="min-w-0 pr-1">
                  <strong className="text-slate-900 dark:text-white block truncate">{item.name}</strong>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">{item.duration}</span>
                </span>
                <span className="font-bold text-[#FF4F2B] font-mono text-xs shrink-0">{item.price}</span>
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setStep(2)}
            disabled={!serviceId}
            className="mt-4 w-full rounded-xl bg-gradient-to-r from-[#FF4F2B] to-[#FF6B4A] py-2.5 text-xs font-bold text-white shadow-md shadow-[#FF4F2B]/20 hover:brightness-110 transition active:scale-98 disabled:opacity-40 cursor-pointer"
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
                    ? "border-[#FF4F2B] bg-[#FF4F2B] text-white shadow-sm font-bold"
                    : "border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-800/60 text-slate-800 dark:text-slate-200 hover:border-[#FF4F2B]/40"
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
                    ? "border-[#FF4F2B] bg-[#FF4F2B]/5 dark:bg-[#FF4F2B]/10 text-[#FF4F2B] dark:text-white font-bold"
                    : "border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-800/60 text-slate-800 dark:text-slate-200 hover:border-[#FF4F2B]/40"
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
          <h4 className="mt-2.5 text-base font-bold text-slate-900 dark:text-white">¡Turno Confirmado!</h4>
          <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
            {service?.name} · {date?.toLocaleDateString("es-PY")} · {time} hs
            <br />
            en <strong className="text-slate-900 dark:text-white">{category.businessName}</strong>
          </p>
          <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-2">
            <Link
              href="/onboarding"
              className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl bg-[#FF4F2B] py-2 px-4 text-xs font-bold text-white shadow-md shadow-[#FF4F2B]/20 hover:brightness-110 transition"
            >
              Probalo en tu local gratis
            </Link>
            <button
              type="button"
              onClick={() => setStep(1)}
              className="w-full sm:w-auto text-xs font-semibold text-slate-500 hover:text-[#FF4F2B] dark:hover:text-white py-1.5 px-3 transition-colors cursor-pointer"
            >
              Simular de nuevo
            </button>
          </div>
        </motion.div>
      )}
    </LiquidGlassCard>
  );
}

function Step({ title, children }: { title: string; children: ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }}>
      <h4 className="mb-3 text-xs font-bold text-slate-900 dark:text-white">{title}</h4>
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
      className="flex-1 rounded-xl bg-gradient-to-r from-[#FF4F2B] to-[#FF6B4A] py-2 text-xs font-bold text-white shadow-md shadow-[#FF4F2B]/20 hover:brightness-110 transition active:scale-98 disabled:opacity-40 cursor-pointer"
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
