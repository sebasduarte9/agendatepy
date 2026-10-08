"use client";

import React, { useState, useEffect, type ReactNode } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  Clock,
  CreditCard,
  Building2,
  Smartphone,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react";
import { useCategory } from "@/context/CategoryContext";
import MiniCalendar from "./MiniCalendar";

const TIMES = ["09:00", "10:30", "14:00", "16:30"];

const PAYMENTS = [
  {
    id: "presencial",
    label: "Pago en el local (Efectivo / POS)",
    desc: "Abonás al momento de tu cita",
    icon: CreditCard,
  },
  {
    id: "transferencia",
    label: "Transferencia bancaria directa",
    desc: "Comprobante automático vía WhatsApp",
    icon: Building2,
  },
  {
    id: "billetera",
    label: "Billetera digital (Tigo / Personal / Zimple)",
    desc: "Cobro instantáneo por QR o alias",
    icon: Smartphone,
  },
] as const;

const ROTATING_SUBDOMAINS = [
  "consultorio",
  "odontologia",
  "barberia",
  "peluqueria",
  "estetica",
  "spa",
  "veterinaria",
  "crossfit",
  "padel",
];

export default function LiveBookingSimulator() {
  const { category, selectedCategory } = useCategory();

  // Subdominio rotativo
  const [subdomainIndex, setSubdomainIndex] = useState(0);

  useEffect(() => {
    const foundIdx = ROTATING_SUBDOMAINS.indexOf(selectedCategory);
    if (foundIdx !== -1) {
      setSubdomainIndex(foundIdx);
    }
  }, [selectedCategory]);

  useEffect(() => {
    const timer = setInterval(() => {
      setSubdomainIndex((prev) => (prev + 1) % ROTATING_SUBDOMAINS.length);
    }, 2800);
    return () => clearInterval(timer);
  }, []);

  const currentSubdomain = ROTATING_SUBDOMAINS[subdomainIndex] || "consultorio";

  return (
    <div
      id="simulador-reserva"
      className="relative w-full pt-10 sm:pt-14 pb-4 border-t border-slate-200/70 dark:border-white/10 scroll-mt-24"
    >
      {/* Encabezado descriptivo */}
      <div className="text-center max-w-2xl mx-auto mb-7 sm:mb-9 space-y-2.5">
        <h3 className="text-2xl xs:text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
          Tu propio agendamiento web
        </h3>
        <p className="text-xs sm:text-sm md:text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl mx-auto">
          Tus clientes pueden reservar de forma autónoma desde cualquier dispositivo en segundos.
        </p>
      </div>

      {/* Contenedor Centrado del Simulador */}
      <div className="max-w-xl mx-auto w-full px-2 sm:px-0">
        <BookingWidget key={category.id} />

        {/* Enlace de reserva directo corregido (sin cortes de texto y diseño de píldora premium) */}
        <div className="mt-8 flex flex-col items-center justify-center gap-2.5 text-center select-none">
          <span className="text-[11px] sm:text-xs font-bold tracking-wider uppercase text-slate-500 dark:text-slate-400">
            Con tu propio link directo:
          </span>
          <div className="inline-flex items-center gap-2 sm:gap-3 px-5 sm:px-6 py-2.5 sm:py-3 rounded-full bg-white/90 dark:bg-slate-900/90 border border-slate-200/90 dark:border-white/10 shadow-md shadow-slate-200/50 dark:shadow-black/20 backdrop-blur-md">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <div className="flex items-center text-base sm:text-xl md:text-2xl font-black tracking-tight leading-none">
              <AnimatePresence mode="wait">
                <motion.span
                  key={currentSubdomain}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.2 }}
                  className="text-[#FF4F2B]"
                >
                  {currentSubdomain}
                </motion.span>
              </AnimatePresence>
              <span className="text-slate-900 dark:text-white font-bold">.agendatepy.com</span>
            </div>
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
  const [date, setDate] = useState<Date | null>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d;
  });
  const [time, setTime] = useState<string>("10:30");
  const [payment, setPayment] = useState<string>("presencial");

  const service = category.services.find((item) => item.id === serviceId) || category.services[0];

  const formattedDate = date
    ? date.toLocaleDateString("es-PY", {
        weekday: "short",
        day: "numeric",
        month: "short",
      })
    : "Sin fecha";

  return (
    <div className="relative rounded-[28px] p-5 sm:p-7 border border-slate-200/90 dark:border-white/10 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.08)] dark:shadow-[0_20px_50px_-15px_rgba(0,0,0,0.4)] bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl overflow-hidden text-left">
      
      {/* Cabecera del Widget estilo SaaS */}
      <div className="mb-5 flex items-center justify-between pb-4 border-b border-slate-100 dark:border-white/5">
        <div>
          <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-tight">
            {category.businessName}
          </h4>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
            Agendamiento online en vivo
          </p>
        </div>

        {/* Indicador de progreso de pasos */}
        {step < 5 ? (
          <div className="flex flex-col items-end gap-1">
            <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300">
              Paso <strong className="text-[#FF4F2B]">{step}</strong> de 4
            </span>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4].map((item) => (
                <span
                  key={item}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    step >= item
                      ? "w-5 bg-[#FF4F2B]"
                      : "w-2.5 bg-slate-200 dark:bg-slate-700"
                  }`}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-200/80 dark:border-emerald-800/40">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Completado</span>
          </div>
        )}
      </div>

      {/* ================================================================ */}
      {/* PASO 1: SELECCIÓN DE SERVICIO                                   */}
      {/* ================================================================ */}
      {step === 1 && (
        <Step key="s1" title={`1. Elegí el servicio · ${category.label}`}>
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {category.services.map((item) => {
              const isSelected = serviceId === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setServiceId(item.id)}
                  className={`flex w-full items-center justify-between gap-3 rounded-2xl border p-3 text-left transition-all cursor-pointer ${
                    isSelected
                      ? "border-[#FF4F2B] bg-[#FF4F2B]/5 dark:bg-[#FF4F2B]/10 ring-1 ring-[#FF4F2B]/30 shadow-xs"
                      : "border-slate-200/80 dark:border-white/5 bg-slate-50/60 dark:bg-slate-800/40 hover:border-slate-300 dark:hover:border-white/20"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Indicador de radio circular */}
                    <div
                      className={`h-4.5 w-4.5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                        isSelected
                          ? "border-[#FF4F2B] bg-[#FF4F2B]"
                          : "border-slate-300 dark:border-slate-600 bg-transparent"
                      }`}
                    >
                      {isSelected && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                    </div>

                    <div className="min-w-0">
                      <strong className="text-xs sm:text-sm text-slate-900 dark:text-white block truncate leading-snug">
                        {item.name}
                      </strong>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                        <Clock className="h-3 w-3 text-slate-400" />
                        <span>{item.duration}</span>
                      </span>
                    </div>
                  </div>

                  <span className={`text-xs sm:text-sm font-bold tabular-nums shrink-0 ${
                    isSelected ? "text-[#FF4F2B]" : "text-slate-800 dark:text-slate-200"
                  }`}>
                    {item.price}
                  </span>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => setStep(2)}
            disabled={!serviceId}
            className="mt-5 w-full rounded-xl bg-gradient-to-r from-[#FF4F2B] to-[#FF6B4A] hover:brightness-105 active:scale-98 py-3 text-xs sm:text-sm font-bold text-white shadow-md shadow-[#FF4F2B]/20 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40"
          >
            <span>Continuar a Fecha</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </Step>
      )}

      {/* ================================================================ */}
      {/* PASO 2: SELECCIÓN DE FECHA                                      */}
      {/* ================================================================ */}
      {step === 2 && (
        <Step key="s2" title="2. Elegí la fecha de atención">
          <div className="p-3 sm:p-4 rounded-2xl border border-slate-200/80 dark:border-white/5 bg-slate-50/50 dark:bg-slate-800/30 flex justify-center">
            <MiniCalendar selected={date} onSelect={setDate} />
          </div>

          {/* Badge de confirmación de fecha */}
          <div className="mt-3 flex items-center justify-between px-1 text-xs">
            <span className="text-slate-500 dark:text-slate-400">Fecha seleccionada:</span>
            <span className="font-bold text-[#FF4F2B] capitalize">{formattedDate}</span>
          </div>

          <div className="mt-4 flex gap-2.5">
            <Back onClick={() => setStep(1)} />
            <Next onClick={() => setStep(3)} disabled={!date} label="Continuar a Horario" />
          </div>
        </Step>
      )}

      {/* ================================================================ */}
      {/* PASO 3: SELECCIÓN DE HORARIO                                    */}
      {/* ================================================================ */}
      {step === 3 && (
        <Step key="s3" title="3. Elegí el horario disponible">
          <div className="grid grid-cols-2 gap-2.5">
            {TIMES.map((slot) => {
              const isSelected = time === slot;
              return (
                <button
                  key={slot}
                  type="button"
                  onClick={() => setTime(slot)}
                  className={`rounded-2xl border p-3 text-left transition-all active:scale-98 cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? "border-[#FF4F2B] bg-[#FF4F2B] text-white shadow-md shadow-[#FF4F2B]/25"
                      : "border-slate-200/80 dark:border-white/5 bg-slate-50/60 dark:bg-slate-800/40 text-slate-800 dark:text-slate-200 hover:border-slate-300 dark:hover:border-white/20"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Clock className={`h-3.5 w-3.5 ${isSelected ? "text-white" : "text-slate-400"}`} />
                    <span className="text-xs sm:text-sm font-bold tabular-nums">
                      {slot} hs
                    </span>
                  </div>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    isSelected
                      ? "bg-white/20 text-white"
                      : "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300"
                  }`}>
                    {isSelected ? "Elegido" : "Libre"}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Badge de confirmación de horario */}
          <div className="mt-3 flex items-center justify-between px-1 text-xs">
            <span className="text-slate-500 dark:text-slate-400">Horario para tu cita:</span>
            <span className="font-bold text-[#FF4F2B]">{time} hs</span>
          </div>

          <div className="mt-4 flex gap-2.5">
            <Back onClick={() => setStep(2)} />
            <Next onClick={() => setStep(4)} disabled={!time} label="Continuar a Confirmación" />
          </div>
        </Step>
      )}

      {/* ================================================================ */}
      {/* PASO 4: RESUMEN Y PREFERENCIA DE PAGO                           */}
      {/* ================================================================ */}
      {step === 4 && (
        <Step key="s4" title="4. Confirmación y preferencia de pago">
          {/* Tarjeta resumen del turno */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-white/5 space-y-1.5 mb-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400">Servicio:</span>
              <strong className="text-slate-900 dark:text-white font-bold">{service.name}</strong>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400">Fecha y hora:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200 capitalize">
                {formattedDate} · {time} hs
              </span>
            </div>
            <div className="pt-1.5 border-t border-slate-200/60 dark:border-white/5 flex items-center justify-between">
              <span className="text-slate-700 dark:text-slate-300 font-bold">Total estimado:</span>
              <strong className="text-sm font-extrabold text-[#FF4F2B] tabular-nums">
                {service.price}
              </strong>
            </div>
          </div>

          <p className="text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-2">
            Forma de pago de tu preferencia:
          </p>

          <div className="space-y-2">
            {PAYMENTS.map((item) => {
              const isSelected = payment === item.id;
              const IconComp = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setPayment(item.id)}
                  className={`flex w-full items-center justify-between gap-3 rounded-2xl border p-2.5 sm:p-3 text-left transition-all cursor-pointer ${
                    isSelected
                      ? "border-[#FF4F2B] bg-[#FF4F2B]/5 dark:bg-[#FF4F2B]/10 ring-1 ring-[#FF4F2B]/30"
                      : "border-slate-200/80 dark:border-white/5 bg-slate-50/60 dark:bg-slate-800/40 hover:border-slate-300 dark:hover:border-white/20"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`h-8 w-8 rounded-xl flex items-center justify-center shrink-0 ${
                      isSelected ? "bg-[#FF4F2B] text-white" : "bg-slate-200/70 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                    }`}>
                      <IconComp className="h-4 w-4" />
                    </div>
                    <div>
                      <strong className="text-xs text-slate-900 dark:text-white block leading-snug">
                        {item.label}
                      </strong>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400">
                        {item.desc}
                      </span>
                    </div>
                  </div>

                  <div
                    className={`h-4 w-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      isSelected ? "border-[#FF4F2B] bg-[#FF4F2B]" : "border-slate-300 dark:border-slate-600"
                    }`}
                  >
                    {isSelected && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-4 flex gap-2.5">
            <Back onClick={() => setStep(3)} />
            <button
              type="button"
              onClick={() => setStep(5)}
              className="flex-1 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:brightness-105 active:scale-98 py-3 text-xs sm:text-sm font-bold text-white shadow-md shadow-emerald-600/20 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>Confirmar Turno Demo</span>
            </button>
          </div>
        </Step>
      )}

      {/* ================================================================ */}
      {/* PASO 5: TICKET DE TURNO CONFIRMADO                             */}
      {/* ================================================================ */}
      {step === 5 && (
        <motion.div
          key="ok"
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-2xl bg-gradient-to-b from-emerald-50/90 to-teal-50/40 dark:from-emerald-950/40 dark:to-slate-900 border border-emerald-500/30 p-5 sm:p-6 text-center space-y-3"
        >
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/30">
            <Check className="h-6 w-6 stroke-[3]" />
          </div>

          <div>
            <h4 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
              ¡Turno Confirmado con Éxito!
            </h4>
            <p className="text-xs text-emerald-800 dark:text-emerald-300 font-semibold mt-0.5">
              Tu reserva ya quedó registrada y sincronizada en tiempo real.
            </p>
          </div>

          {/* Ticket Comprobante */}
          <div className="p-3.5 rounded-xl bg-white/90 dark:bg-slate-900/90 border border-emerald-500/20 text-xs text-left space-y-1.5 shadow-2xs">
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 dark:border-white/5">
              <span className="font-bold text-slate-800 dark:text-slate-200">{category.businessName}</span>
              <span className="font-mono text-[10px] text-emerald-700 dark:text-emerald-300 font-bold bg-emerald-100 dark:bg-emerald-900/50 px-2 py-0.5 rounded-full">
                #AG-8492
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Servicio:</span>
              <span className="font-bold text-slate-900 dark:text-white">{service.name}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Fecha y Hora:</span>
              <span className="font-bold text-slate-900 dark:text-white capitalize">
                {formattedDate} · {time} hs
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Total:</span>
              <strong className="text-emerald-600 dark:text-emerald-400 font-black">{service.price}</strong>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2.5">
            <Link
              href="/onboarding"
              className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl bg-[#FF4F2B] hover:bg-[#F04420] py-2.5 px-5 text-xs font-bold text-white shadow-md shadow-[#FF4F2B]/20 transition"
            >
              <span>Activar en mi negocio gratis</span>
              <ArrowRight className="h-4 w-4 ml-1.5" />
            </Link>
            <button
              type="button"
              onClick={() => setStep(1)}
              className="w-full sm:w-auto text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-[#FF4F2B] dark:hover:text-white py-2 px-3 transition-colors cursor-pointer"
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
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      <h4 className="mb-3.5 text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
        {title}
      </h4>
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
      className="flex-1 rounded-xl bg-gradient-to-r from-[#FF4F2B] to-[#FF6B4A] hover:brightness-105 active:scale-98 py-2.5 text-xs font-bold text-white shadow-md shadow-[#FF4F2B]/20 transition flex items-center justify-center gap-1.5 disabled:opacity-40 cursor-pointer"
    >
      <span>{label}</span>
      <ArrowRight className="h-3.5 w-3.5" />
    </button>
  );
}

function Back({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 py-2.5 px-4 text-xs font-bold text-slate-700 dark:text-slate-200 transition flex items-center justify-center gap-1.5 cursor-pointer"
    >
      <ArrowLeft className="h-3.5 w-3.5" />
      <span>Atrás</span>
    </button>
  );
}
