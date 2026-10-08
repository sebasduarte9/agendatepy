"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  Zap,
  CheckCheck,
  Bot,
  Sparkles,
  TrendingUp,
  RotateCcw,
  User,
  Plus,
} from "lucide-react";

export default function AIAnimationOptions() {
  return (
    <div className="w-full max-w-5xl mx-auto space-y-20 py-4 select-none">
      
      {/* ============================================================== */}
      {/* OPCIÓN 1: EL MENSAJE QUE VIAJA AL CALENDARIO (Split Pipeline)  */}
      {/* ============================================================== */}
      <div className="rounded-3xl p-6 sm:p-8 bg-white/95 dark:bg-slate-900/90 border-2 border-emerald-500/30 shadow-xl shadow-emerald-500/5">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-white/10">
          <div className="flex items-center gap-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 text-white font-black text-xs">
              1
            </span>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                Opción 1: El mensaje que viaja a tu calendario
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                A la izquierda entra el chat, una estela de luz viaja en tiempo real y aterriza en tu agenda bloqueando el horario.
              </p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 text-xs font-bold border border-emerald-200 dark:border-emerald-800/40">
            Recomendada · Claridad total
          </span>
        </div>

        <OptionOneAnimation />
      </div>

      {/* ============================================================== */}
      {/* OPCIÓN 2: TRANSFORMACIÓN MÁGICA (Morphing Card)               */}
      {/* ============================================================== */}
      <div className="rounded-3xl p-6 sm:p-8 bg-white/95 dark:bg-slate-900/90 border-2 border-purple-500/30 shadow-xl shadow-purple-500/5">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-white/10">
          <div className="flex items-center gap-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-purple-500 text-white font-black text-xs">
              2
            </span>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                Opción 2: Transformación mágica (Mensaje a Tarjeta Oficial)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                El mensaje entra al centro, la IA lo pliega y lo transforma directamente en una tarjeta de turno confirmada que encaja en tu panel.
              </p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-400 text-xs font-bold border border-purple-200 dark:border-purple-800/40">
            Efecto Morphing 3D
          </span>
        </div>

        <OptionTwoAnimation />
      </div>

      {/* ============================================================== */}
      {/* OPCIÓN 3: AGENDA LLENÁNDOSE SOLA EN VIVO (Speed-Fill Calendar) */}
      {/* ============================================================== */}
      <div className="rounded-3xl p-6 sm:p-8 bg-white/95 dark:bg-slate-900/90 border-2 border-[#FF4F2B]/30 shadow-xl shadow-[#FF4F2B]/5">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-white/10">
          <div className="flex items-center gap-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#FF4F2B] text-white font-black text-xs">
              3
            </span>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                Opción 3: Tu agenda llenándose sola en vivo
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Tu calendario de hoy en pantalla completa: llegan mensajes consecutivos y los huecos vacíos se llenan automáticamente mientras sube tu recaudación.
              </p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full bg-orange-50 dark:bg-orange-950/60 text-[#FF4F2B] text-xs font-bold border border-orange-200 dark:border-orange-800/40">
            Impacto de Negocio
          </span>
        </div>

        <OptionThreeAnimation />
      </div>

    </div>
  );
}

// ============================================================================
// COMPONENTE OPCIÓN 1: MENSAJE VIAJERO AL CALENDARIO
// ============================================================================
function OptionOneAnimation() {
  const [step, setStep] = useState<0 | 1 | 2>(0);

  useEffect(() => {
    const t1 = setTimeout(() => setStep(1), 1800); // Rayo viaja
    const t2 = setTimeout(() => setStep(2), 3400); // Aterriza en agenda y responde
    const t3 = setTimeout(() => setStep(0), 6500); // Reinicio en bucle

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [step]);

  return (
    <div className="relative grid grid-cols-1 md:grid-cols-11 gap-4 items-center">
      {/* Lado Izquierdo: WhatsApp flotante */}
      <div className="md:col-span-5 rounded-2xl p-4 bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-white/10 shadow-sm text-left">
        <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-200/60 dark:border-white/5">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-full bg-[#25D366] text-white flex items-center justify-center">
              <MessageSquare className="h-3.5 w-3.5" />
            </div>
            <span className="text-xs font-bold text-slate-900 dark:text-white">WhatsApp Cliente</span>
          </div>
          <span className="text-[10px] text-slate-400">16:15 hs</span>
        </div>

        {/* Mensaje del cliente */}
        <div className="p-3 rounded-2xl rounded-tl-xs bg-white dark:bg-slate-900 shadow-sm border border-slate-200/60 dark:border-white/5 text-xs text-slate-800 dark:text-slate-200">
          <p className="font-semibold leading-relaxed">
            "¡Hola! ¿Tenés turno para corte y barba hoy a las 16:30?"
          </p>
          <div className="mt-1 flex items-center justify-end gap-1 text-[9px] text-slate-400">
            <span>Enviado</span>
            <CheckCheck className="h-3 w-3 text-emerald-500" />
          </div>
        </div>

        {/* Respuesta automática de la IA */}
        <AnimatePresence>
          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-3 p-3 rounded-2xl rounded-tr-xs bg-[#d9fdd3] dark:bg-emerald-950/60 text-slate-900 dark:text-emerald-100 text-xs border border-emerald-300/60 dark:border-emerald-800/40 shadow-sm"
            >
              <div className="flex items-center gap-1 text-[9px] font-bold text-emerald-700 dark:text-emerald-300 mb-0.5">
                <Bot className="h-3 w-3" /> Asistente IA respondió solo:
              </div>
              <p className="font-medium">
                "¡Listo Lucas! Te reservé a las 16:30 hs con Carlos. Seña validada vía QR. Te esperamos."
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Centro: Estela de luz viajera con flecha inteligente */}
      <div className="md:col-span-1 flex flex-col items-center justify-center py-2">
        <motion.div
          animate={{
            scale: step === 1 ? [1, 1.25, 1] : 1,
            opacity: step === 1 ? 1 : 0.4,
          }}
          transition={{ duration: 0.8, repeat: step === 1 ? Infinity : 0 }}
          className="relative flex items-center justify-center h-10 w-10 rounded-full bg-[#FF4F2B]/10 text-[#FF4F2B]"
        >
          <ArrowRight className="h-5 w-5" />
          {step === 1 && (
            <motion.span
              layoutId="light-beam"
              className="absolute -inset-1 rounded-full bg-[#FF4F2B]/20 animate-ping pointer-events-none"
            />
          )}
        </motion.div>
        <span className="text-[9px] font-bold text-[#FF4F2B] uppercase tracking-wider mt-1">
          {step === 1 ? "Viajando..." : "1.2s"}
        </span>
      </div>

      {/* Lado Derecho: Calendario oficial de AgendatePY */}
      <div className="md:col-span-5 rounded-2xl p-4 bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-white/10 shadow-sm text-left">
        <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-200/60 dark:border-white/5">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-full bg-[#FF4F2B] text-white flex items-center justify-center">
              <Calendar className="h-3.5 w-3.5" />
            </div>
            <span className="text-xs font-bold text-slate-900 dark:text-white">Panel AgendatePY (Hoy)</span>
          </div>
          <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> En Vivo
          </span>
        </div>

        {/* Bloques de horario */}
        <div className="space-y-2 text-xs">
          <div className="p-2 rounded-xl bg-slate-200/60 dark:bg-slate-700/50 text-slate-500 flex items-center justify-between text-[11px]">
            <span>15:00 hs · Martín G. (Ocupado)</span>
            <span className="font-mono">Gs. 70.000</span>
          </div>

          {/* El horario de las 16:30 que se llena solo */}
          <motion.div
            animate={{
              borderColor: step >= 2 ? "#10b981" : "rgba(203, 213, 225, 0.8)",
              backgroundColor: step >= 2 ? "rgba(16, 185, 129, 0.12)" : "rgba(255, 255, 255, 0.8)",
              scale: step === 2 ? [1, 1.02, 1] : 1,
            }}
            transition={{ duration: 0.4 }}
            className="p-2.5 rounded-xl border border-dashed flex items-center justify-between font-bold"
          >
            {step >= 2 ? (
              <>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-emerald-950 dark:text-emerald-100 font-bold">
                    16:30 hs · Lucas R. (Corte & Barba)
                  </span>
                </div>
                <span className="text-emerald-600 dark:text-emerald-400 text-[10px] bg-white dark:bg-slate-900 px-2 py-0.5 rounded-full border border-emerald-300 font-mono">
                  Confirmado Gs. 80.000 ✓
                </span>
              </>
            ) : (
              <span className="text-slate-400 font-normal italic">
                16:30 hs · Disponible (Esperando cliente...)
              </span>
            )}
          </motion.div>

          <div className="p-2 rounded-xl bg-slate-200/60 dark:bg-slate-700/50 text-slate-500 flex items-center justify-between text-[11px]">
            <span>17:30 hs · Disponible</span>
            <span className="font-mono text-slate-400">—</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// COMPONENTE OPCIÓN 2: TRANSFORMACIÓN MÁGICA
// ============================================================================
function OptionTwoAnimation() {
  const [isTransformed, setIsTransformed] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setIsTransformed((prev) => !prev);
    }, 3200);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative flex flex-col items-center justify-center min-h-[260px] py-6">
      <AnimatePresence mode="wait">
        {!isTransformed ? (
          /* Estado A: Mensaje plano de WhatsApp */
          <motion.div
            key="whatsapp-bubble"
            initial={{ opacity: 0, scale: 0.85, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, rotateX: 90 }}
            transition={{ duration: 0.45 }}
            className="w-full max-w-md p-5 rounded-3xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/10 shadow-lg text-left"
          >
            <div className="flex items-center gap-2 mb-2 text-xs font-bold text-emerald-600">
              <MessageSquare className="h-4 w-4" /> Mensaje entrante de WhatsApp:
            </div>
            <p className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white leading-relaxed">
              "Hola, quisiera saber si tienen turno para limpieza dental hoy a las 15:00 hs con la Dra. Benítez"
            </p>
            <div className="mt-3 flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-200/60 dark:border-white/5">
              <span>Cliente: Sofía Martínez</span>
              <span className="text-[#FF4F2B] font-bold flex items-center gap-1">
                <Zap className="h-3 w-3" /> Transformando en turno...
              </span>
            </div>
          </motion.div>
        ) : (
          /* Estado B: Tarjeta oficial de turno agendado */
          <motion.div
            key="confirmed-card"
            initial={{ opacity: 0, scale: 0.85, rotateX: -90 }}
            animate={{ opacity: 1, scale: 1, rotateX: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: -10 }}
            transition={{ duration: 0.45 }}
            className="w-full max-w-md p-5 rounded-3xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-xl shadow-emerald-500/20 text-left"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[11px] font-bold backdrop-blur-sm">
                AgendatePY · Confirmado
              </span>
              <span className="flex items-center gap-1 text-xs font-bold">
                <CheckCircle2 className="h-4 w-4" /> En Agenda
              </span>
            </div>
            <h4 className="text-lg font-black leading-tight">
              Limpieza Dental · 15:00 hs
            </h4>
            <p className="text-xs text-white/90 mt-1">
              Dra. Benítez · Paciente: Sofía Martínez (Seña Gs. 50.000 OK)
            </p>
            <div className="mt-4 pt-3 border-t border-white/20 flex items-center justify-between text-[11px] font-medium text-white/90">
              <span>Google Calendar sincronizado</span>
              <span className="font-bold underline">0 min invertidos por vos</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-5 text-xs font-semibold text-slate-400 flex items-center gap-1.5">
        <RotateCcw className="h-3 w-3" /> Se transforma automáticamente cada 3 segundos
      </div>
    </div>
  );
}

// ============================================================================
// COMPONENTE OPCIÓN 3: AGENDA LLENÁNDOSE SOLA EN VIVO
// ============================================================================
function OptionThreeAnimation() {
  const [bookedCount, setBookedCount] = useState(1);

  useEffect(() => {
    const timer = setInterval(() => {
      setBookedCount((prev) => (prev >= 4 ? 1 : prev + 1));
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  const SLOTS = [
    { time: "09:00 hs", client: "Carla R.", service: "Perfilado de Cejas", amount: "Gs. 50.000" },
    { time: "11:30 hs", client: "Marcos B.", service: "Corte Clásico", amount: "Gs. 60.000" },
    { time: "15:00 hs", client: "Sofía M.", service: "Limpieza Facial", amount: "Gs. 120.000" },
    { time: "17:30 hs", client: "Lucas P.", service: "Barba & Lavado", amount: "Gs. 70.000" },
  ];

  const totalCash = SLOTS.slice(0, bookedCount).reduce((acc, curr) => {
    const num = parseInt(curr.amount.replace(/\D/g, ""), 10);
    return acc + num;
  }, 0);

  return (
    <div className="w-full max-w-3xl mx-auto space-y-4">
      {/* Barra superior de facturación en vivo */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/10">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
          </span>
          <span className="text-xs font-bold text-slate-900 dark:text-white">
            WhatsApp Bot activo recibiendo reservas
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs font-black text-emerald-600 dark:text-emerald-400">
          <TrendingUp className="h-4 w-4" />
          <span>Caja del Día: Gs. {totalCash.toLocaleString("es-PY")}</span>
        </div>
      </div>

      {/* Grid de turnos que se van llenando */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
        {SLOTS.map((slot, index) => {
          const isFilled = index < bookedCount;
          return (
            <motion.div
              key={slot.time}
              initial={false}
              animate={{
                scale: isFilled ? [1, 1.02, 1] : 1,
                borderColor: isFilled ? "rgba(16, 185, 129, 0.6)" : "rgba(226, 232, 240, 0.8)",
                backgroundColor: isFilled ? "rgba(16, 185, 129, 0.08)" : "transparent",
              }}
              className="p-3.5 rounded-2xl border border-slate-200 dark:border-white/10 transition-colors"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                  {slot.time}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isFilled
                      ? "bg-emerald-500 text-white"
                      : "bg-slate-100 dark:bg-white/10 text-slate-400"
                  }`}
                >
                  {isFilled ? "Agendado por IA ✓" : "Hueco Libre"}
                </span>
              </div>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                {isFilled ? `${slot.client} — ${slot.service}` : "Esperando mensaje..."}
              </p>
              <p className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 mt-1">
                {isFilled ? slot.amount : "—"}
              </p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
