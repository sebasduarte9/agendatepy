"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import {
  Calendar,
  CheckCircle2,
  Phone,
  Video,
  MoreVertical,
  CheckCheck,
  Smile,
  Paperclip,
  Mic,
  ArrowLeft,
  RotateCcw,
  CalendarCheck,
  Zap,
  TrendingUp,
} from "lucide-react";

export default function WhatsAppToAgendaLive() {
  const containerRef = useRef<HTMLDivElement>(null);

  // La animación solo inicia cuando el usuario baja con scroll a la sección
  const isInView = useInView(containerRef, { once: true, amount: 0.25 });

  // Pasos de la conversación en tiempo real (ritmo natural y balanceado):
  // 0: Espera inicial (350ms)
  // 1: Cliente envía: "Hola, quiero agendar un turno" (600ms)
  // 2: Bot escribiendo... (900ms)
  // 3: Bot envía opciones (950ms)
  // 4: Cliente responde confirmando (600ms)
  // 5: Bot escribiendo confirmación... (850ms)
  // 6: Bot confirma y la agenda en vivo se bloquea en tiempo real (Permanente)
  const [step, setStep] = useState<number>(0);

  useEffect(() => {
    if (!isInView) return;

    let timer: NodeJS.Timeout;

    if (step === 0) {
      timer = setTimeout(() => setStep(1), 350);
    } else if (step === 1) {
      timer = setTimeout(() => setStep(2), 600);
    } else if (step === 2) {
      timer = setTimeout(() => setStep(3), 900);
    } else if (step === 3) {
      timer = setTimeout(() => setStep(4), 950);
    } else if (step === 4) {
      timer = setTimeout(() => setStep(5), 600);
    } else if (step === 5) {
      timer = setTimeout(() => setStep(6), 850);
    }
    // Paso 6: Estado final definitivo, sin reinicio ni bucles

    return () => clearTimeout(timer);
  }, [step, isInView]);

  const chatBodyRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = chatBodyRef.current;
    if (!el || step === 0) return;
    const id = requestAnimationFrame(() => el.scrollTo({ top: el.scrollHeight, behavior: "smooth" }));
    return () => cancelAnimationFrame(id);
  }, [step]);

  const isClient1Visible = step >= 1;
  const isBotTyping1 = step === 2;
  const isBot1Visible = step >= 3;
  const isClient2Visible = step >= 4;
  const isBotTyping2 = step === 5;
  const isBot2Visible = step >= 6;
  const isBooked = step >= 6;

  const [flipped, setFlipped] = useState(false);
  useEffect(() => {
    if (!isBooked) return;
    const t = setTimeout(() => setFlipped(true), 1400);
    return () => clearTimeout(t);
  }, [isBooked]);

  useEffect(() => {
    if (!flipped) return;
    const t = setTimeout(() => setFlipped(false), 3000);
    return () => clearTimeout(t);
  }, [flipped]);

  const faceBase =
    "col-start-1 row-start-1 md:col-start-auto md:row-start-auto max-md:[backface-visibility:hidden] transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none";

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-5xl mx-auto py-2 select-none"
    >
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 lg:gap-7 items-stretch max-md:[perspective:1600px]">
        
        {/* ============================================================== */}
        {/* COLUMNA IZQUIERDA: CHAT AUTÉNTICO DE WHATSAPP                 */}
        {/* ============================================================== */}
        <div
          className={`${faceBase} md:col-span-6 lg:col-span-7 ${
            flipped ? "max-md:[transform:rotateY(180deg)] max-md:pointer-events-none" : ""
          }`}
        >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          className="flex flex-col h-[440px] md:h-[520px] rounded-[28px] overflow-hidden shadow-[0_20px_50px_-15px_rgba(0,0,0,0.12)] dark:shadow-[0_20px_50px_-15px_rgba(0,0,0,0.5)] border border-slate-300/80 dark:border-white/10 bg-[#EFEAE2] dark:bg-[#0b141a]"
        >
          
          {/* Cabecera oficial de WhatsApp */}
          <div className="bg-[#008069] dark:bg-[#1f2c34] text-white px-4 py-3 flex items-center justify-between shadow-sm shrink-0">
            <div className="flex items-center gap-3">
              <span aria-hidden="true" className="text-white/90">
                <ArrowLeft className="h-5 w-5" />
              </span>
              <div className="relative">
                <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center font-bold text-sm tracking-wider text-white border border-white/30">
                  AP
                </div>
                <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-400 border-2 border-[#008069] dark:border-[#1f2c34]" />
              </div>
              <div>
                <h3 className="font-bold text-sm leading-tight text-white flex items-center gap-1.5">
                  AgendatePY Asistente
                  <span className="text-[10px] bg-white/20 px-1.5 py-0.2 rounded-full font-normal">
                    IA
                  </span>
                </h3>
                <p className="text-[11px] text-emerald-100 dark:text-slate-300 font-medium">
                  {isBotTyping1 || isBotTyping2 ? (
                    <span className="italic font-bold animate-pulse text-white">
                      escribiendo...
                    </span>
                  ) : (
                    "en línea"
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-white/90">
              <Video className="h-4 w-4 hidden sm:block opacity-80" />
              <Phone className="h-4 w-4 hidden sm:block opacity-80" />
              <MoreVertical className="h-4 w-4 opacity-80" />
            </div>
          </div>

          {/* Cuerpo del Chat fluido y anclado de arriba hacia abajo */}
          <div
            ref={chatBodyRef}
            className="flex-1 p-4 sm:p-5 space-y-3 flex flex-col justify-start overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            
            {/* Aviso de cifrado */}
            <div className="hidden sm:block mx-auto mb-1 text-center shrink-0">
              <span className="text-[10px] text-slate-600 dark:text-slate-400 bg-white/85 dark:bg-slate-800/80 px-3 py-1 rounded-lg shadow-2xs font-medium">
                 Los mensajes están cifrados de extremo a extremo
              </span>
            </div>

            {/* MENSAJE 1: CLIENTE */}
            {isClient1Visible && (
              <motion.div
                key="msg-client-1"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="flex justify-end w-full shrink-0"
              >
                <div className="relative max-w-[85%] sm:max-w-[78%] bg-[#d9fdd3] dark:bg-[#005c4b] text-[#111b21] dark:text-[#e9edef] px-3.5 py-2 rounded-2xl rounded-tr-xs shadow-2xs text-sm">
                  <p className="leading-snug">
                    Hola, quiero agendar un turno
                  </p>
                  <div className="flex items-center justify-end gap-1 mt-0.5 text-[10px] text-slate-500 dark:text-emerald-200">
                    <span className="tabular-nums">16:20</span>
                    <CheckCheck className="h-3.5 w-3.5 text-[#53bdeb]" />
                  </div>
                </div>
              </motion.div>
            )}

            {/* INDICADOR: BOT ESCRIBIENDO MENSAJE 1 */}
            {isBotTyping1 && (
              <motion.div
                key="typing-bot-1"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.15 }}
                className="flex justify-start w-full shrink-0"
              >
                <div className="bg-white dark:bg-[#202c33] px-3.5 py-2.5 rounded-2xl rounded-tl-xs shadow-xs border border-slate-200/40 dark:border-white/5 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#008069] dark:bg-emerald-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 rounded-full bg-[#008069] dark:bg-emerald-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 rounded-full bg-[#008069] dark:bg-emerald-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </motion.div>
            )}

            {/* MENSAJE 2: BOT RESPONDE CON HORARIOS */}
            {isBot1Visible && (
              <motion.div
                key="msg-bot-1"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="flex justify-start w-full shrink-0"
              >
                <div className="relative max-w-[88%] sm:max-w-[80%] bg-white dark:bg-[#202c33] text-[#111b21] dark:text-[#e9edef] px-3.5 py-2.5 rounded-2xl rounded-tl-xs shadow-xs text-sm">
                  <p className="leading-snug">
                    ¡Hola!  Con gusto. ¿Para qué servicio y horario te gustaría? Tenemos libre hoy a las{" "}
                    <strong className="text-[#008069] dark:text-emerald-400 font-bold">16:30 hs</strong> con Marcos para corte y barba.
                  </p>
                  <div className="flex items-center justify-end mt-1 text-[10px] text-slate-400">
                    <span className="tabular-nums">16:20</span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* MENSAJE 3: CLIENTE PIDE EL HORARIO */}
            {isClient2Visible && (
              <motion.div
                key="msg-client-2"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="flex justify-end w-full shrink-0"
              >
                <div className="relative max-w-[85%] sm:max-w-[78%] bg-[#d9fdd3] dark:bg-[#005c4b] text-[#111b21] dark:text-[#e9edef] px-3.5 py-2 rounded-2xl rounded-tr-xs shadow-2xs text-sm">
                  <p className="leading-snug">
                    Genial, a las 16:30 hs con Marcos por favor
                  </p>
                  <div className="flex items-center justify-end gap-1 mt-0.5 text-[10px] text-slate-500 dark:text-emerald-200">
                    <span className="tabular-nums">16:21</span>
                    <CheckCheck className="h-3.5 w-3.5 text-[#53bdeb]" />
                  </div>
                </div>
              </motion.div>
            )}

            {/* INDICADOR: BOT ESCRIBIENDO CONFIRMACIÓN */}
            {isBotTyping2 && (
              <motion.div
                key="typing-bot-2"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.15 }}
                className="flex justify-start w-full shrink-0"
              >
                <div className="bg-white dark:bg-[#202c33] px-3.5 py-2.5 rounded-2xl rounded-tl-xs shadow-xs border border-slate-200/40 dark:border-white/5 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#008069] dark:bg-emerald-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 rounded-full bg-[#008069] dark:bg-emerald-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 rounded-full bg-[#008069] dark:bg-emerald-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </motion.div>
            )}

            {/* MENSAJE 4: BOT CONFIRMA RESERVA OFICIAL */}
            {isBot2Visible && (
              <motion.div
                key="msg-bot-2"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="flex justify-start w-full shrink-0"
              >
                <div className="relative max-w-[88%] sm:max-w-[80%] bg-white dark:bg-[#202c33] text-[#111b21] dark:text-[#e9edef] px-3.5 py-2.5 rounded-2xl rounded-tl-xs shadow-xs text-sm">
                  <p className="leading-snug">
                    ¡Listo!  Tu turno quedó confirmado para hoy{" "}
                    <strong className="text-[#008069] dark:text-emerald-400 font-bold">16:30 hs con Marcos</strong>.
                    ¡Te esperamos! 
                  </p>
                  <div className="flex items-center justify-end mt-1 text-[10px] text-slate-400">
                    <span className="tabular-nums">16:21</span>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Barra inferior de entrada de WhatsApp */}
          <div className="bg-[#f0f2f5] dark:bg-[#202c33] px-3 py-2.5 flex items-center gap-2 border-t border-slate-300/60 dark:border-white/5 shrink-0">
            <Smile className="h-5 w-5 text-slate-500 shrink-0" />
            <Paperclip className="h-5 w-5 text-slate-500 shrink-0" />
            <div className="flex-1 bg-white dark:bg-[#2a3942] rounded-full px-4 py-2 text-xs text-slate-400">
              Escribe un mensaje...
            </div>
            <div className="h-8 w-8 rounded-full bg-[#008069] text-white flex items-center justify-center shrink-0">
              <Mic className="h-4 w-4" />
            </div>
          </div>
        </motion.div>
        </div>

        {/* ============================================================== */}
        {/* COLUMNA DERECHA: AGENDA WEB EN VIVO (DISEÑO SAAS SIN CARDS ANIDADAS) */}
        {/* ============================================================== */}
        <div
          className={`${faceBase} md:col-span-6 lg:col-span-5 ${
            flipped ? "" : "max-md:[transform:rotateY(-180deg)] max-md:pointer-events-none"
          }`}
        >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          className="flex flex-col justify-between h-[440px] md:h-[520px] rounded-[28px] bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-white/10 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.12)] dark:shadow-[0_20px_50px_-20px_rgba(0,0,0,0.5)] overflow-hidden text-left"
        >
          
          {/* Cabecera del Panel de Agenda */}
          <div className="px-5 py-4 border-b border-slate-100 dark:border-white/5 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FF4F2B]/10 text-[#FF4F2B] shrink-0">
                <Calendar className="h-4 w-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                    Tu Agenda Web
                  </h4>
                  <span className="text-[10px] font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                    Hoy
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                  Profesional: <strong className="text-slate-700 dark:text-slate-200">Marcos Benítez</strong>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-200/80 dark:border-emerald-800/40 shrink-0">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>En vivo</span>
            </div>
          </div>

          {/* Timeline de la Agenda (Diseño limpio de cronograma, sin cajas anidadas) */}
          <div className="flex-1 p-5 space-y-2.5 overflow-y-auto">
            
            {/* Turno 1: 15:00 hs (Ocupado previo) */}
            <div className="flex items-center gap-3 text-xs">
              <span className="w-12 font-mono font-semibold text-slate-400 dark:text-slate-500 text-right tabular-nums text-[11px] shrink-0">
                15:00
              </span>
              <div className="flex-1 min-w-0 py-2 px-3 rounded-xl bg-slate-100/70 dark:bg-slate-800/40 border-l-4 border-slate-300 dark:border-slate-600 flex items-center justify-between">
                <div className="truncate">
                  <p className="font-semibold text-slate-800 dark:text-slate-200 leading-tight">
                    Martín González
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Corte de cabello · 15:00 - 15:45
                  </p>
                </div>
                <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 bg-white/80 dark:bg-slate-800/80 px-2 py-0.5 rounded-md shrink-0">
                  Ocupado
                </span>
              </div>
            </div>

            {/* Turno 2: 16:30 hs (TURNO DINÁMICO RESERVADO EN VIVO) */}
            <div className="flex items-center gap-3 text-xs">
              <span className="w-12 font-mono font-bold text-[#FF4F2B] text-right tabular-nums text-[11px] shrink-0">
                16:30
              </span>
              <div className="flex-1 min-w-0">
                <AnimatePresence mode="wait">
                  {!isBooked ? (
                    /* Estado A: Horario Libre esperando solicitud */
                    <motion.div
                      key="slot-free"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      className="py-2 px-3 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/20 flex items-center justify-between"
                    >
                      <div>
                        <p className="font-semibold text-slate-700 dark:text-slate-300 leading-tight">
                          Turno disponible
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {isBotTyping2
                            ? "IA bloqueando horario..."
                            : "Esperando solicitud del cliente..."}
                        </p>
                      </div>
                      <span className="text-[10px] font-semibold text-slate-500 bg-slate-200/60 dark:bg-slate-800 px-2 py-0.5 rounded-md shrink-0">
                        Libre
                      </span>
                    </motion.div>
                  ) : (
                    /* Estado B: Turno Reservado y Confirmado por IA */
                    <motion.div
                      key="slot-confirmed"
                      initial={{ opacity: 0, scale: 0.98, y: 2 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                      className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-50/90 via-emerald-50/40 to-white dark:from-emerald-950/40 dark:via-emerald-950/20 dark:to-slate-900 border-l-4 border-emerald-500 border-y border-r border-emerald-200/80 dark:border-emerald-800/40 shadow-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between gap-1.5">
                        <div className="flex items-center gap-1.5 font-bold text-slate-950 dark:text-white min-w-0">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                          <span className="truncate">Lucas Romero</span>
                          <span className="hidden sm:inline text-[10px] font-mono text-emerald-700 dark:text-emerald-300 bg-emerald-100/80 dark:bg-emerald-900/50 px-1.5 py-0.5 rounded font-semibold tabular-nums shrink-0">
                            16:30 - 17:15
                          </span>
                        </div>
                        <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5 rounded-full shrink-0">
                          ✓ Confirmado
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-600 dark:text-slate-300 font-medium truncate">
                          Corte Degradé + Barba
                        </span>
                        <span className="font-mono font-bold text-emerald-700 dark:text-emerald-300 tabular-nums shrink-0">
                          Gs. 80.000
                        </span>
                      </div>

                      <div className="pt-1 border-t border-emerald-200/50 dark:border-emerald-800/30 flex items-center gap-1 text-[10px] text-emerald-700 dark:text-emerald-300 font-semibold">
                        <Zap className="h-3 w-3 text-emerald-600 shrink-0" />
                        <span>Bloqueado automáticamente vía WhatsApp IA</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Turno 3: 17:30 hs (Ocupado posterior) */}
            <div className="flex items-center gap-3 text-xs">
              <span className="w-12 font-mono font-semibold text-slate-400 dark:text-slate-500 text-right tabular-nums text-[11px] shrink-0">
                17:30
              </span>
              <div className="flex-1 min-w-0 py-2 px-3 rounded-xl bg-slate-100/70 dark:bg-slate-800/40 border-l-4 border-slate-300 dark:border-slate-600 flex items-center justify-between">
                <div className="truncate">
                  <p className="font-semibold text-slate-800 dark:text-slate-200 leading-tight">
                    Camilo Benítez
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Corte Clásico · 17:30 - 18:15
                  </p>
                </div>
                <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 bg-white/80 dark:bg-slate-800/80 px-2 py-0.5 rounded-md shrink-0">
                  Ocupado
                </span>
              </div>
            </div>

            {/* Turno 4: 18:30 hs (Disponible siguiente) */}
            <div className="flex items-center gap-3 text-xs">
              <span className="w-12 font-mono font-medium text-slate-400 dark:text-slate-500 text-right tabular-nums text-[11px] shrink-0">
                18:30
              </span>
              <div className="flex-1 min-w-0 py-2 px-3 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-transparent flex items-center justify-between text-slate-400 dark:text-slate-500">
                <span className="text-[11px]">Turno disponible</span>
                <span className="text-[10px] font-medium">Libre</span>
              </div>
            </div>

            {/* Métrica de Ocupación con barra de progreso fluida */}
            <div className="pt-2">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                  <TrendingUp className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                  <span className="sm:hidden">Hoy:</span>
                  <span className="hidden sm:inline">Ocupación de hoy:</span>
                  <strong className="text-slate-900 dark:text-white tabular-nums">
                    {isBooked ? "3 de 4 turnos (75%)" : "2 de 4 turnos (50%)"}
                  </strong>
                </div>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-xs tabular-nums">
                  {isBooked ? "Gs. 210.000" : "Gs. 130.000"}
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                <motion.div
                  className="bg-emerald-500 h-full rounded-full"
                  initial={{ width: "50%" }}
                  animate={{ width: isBooked ? "75%" : "50%" }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                />
              </div>
            </div>
          </div>

          {/* Pie informativo de la Agenda */}
          <div className="hidden md:flex px-5 py-3.5 bg-slate-50/80 dark:bg-slate-950/40 border-t border-slate-100 dark:border-white/5 items-center gap-3 shrink-0">
            <div className="h-8 w-8 rounded-lg bg-[#FF4F2B]/10 dark:bg-[#FF4F2B]/20 flex items-center justify-center text-[#FF4F2B] shrink-0">
              <CalendarCheck className="h-4 w-4" />
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">
              <strong className="text-slate-900 dark:text-white">Tu agenda web sincronizada al instante:</strong> el cliente reserva por WhatsApp y tu horario queda bloqueado con <span className="font-bold text-[#FF4F2B]">0 minutos de tu tiempo</span>.
            </p>
          </div>
        </motion.div>
        </div>

      </div>

      <div className="mt-4 flex h-11 items-center justify-center md:hidden">
        {!isBooked ? (
          <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-slate-500 dark:text-slate-400">
            <span className="h-1.5 w-1.5 rounded-full bg-[#25D366] animate-pulse" />
            La IA está agendando el turno…
          </span>
        ) : (
          <button
            type="button"
            onClick={() => setFlipped((v) => !v)}
            className={`inline-flex min-h-11 items-center gap-1.5 rounded-full border px-4 text-[13px] font-bold active:scale-95 transition cursor-pointer ${
              flipped
                ? "border-slate-200 bg-white text-slate-700 dark:border-white/10 dark:bg-slate-900 dark:text-slate-200"
                : "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800/50 dark:bg-emerald-950/60 dark:text-emerald-300"
            }`}
          >
            {flipped ? (
              <>
                <RotateCcw className="h-4 w-4" />
                Ver la conversación
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" />
                Ver el turno en tu agenda
              </>
            )}
          </button>
        )}
      </div>
    </motion.div>
  );
}
