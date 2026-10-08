"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
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
  Activity,
  RotateCcw,
  QrCode,
  Users,
} from "lucide-react";

interface Scenario {
  id: string;
  category: string;
  clientName: string;
  clientMessage: string;
  service: string;
  aiThought: string;
  slot: string;
  staff: string;
  aiReply: string;
  price: string;
}

const SCENARIOS: Scenario[] = [
  {
    id: "peluqueria",
    category: "Peluquería & Barbería",
    clientName: "Lucas R.",
    clientMessage: "¡Buenas! ¿Tenés turno para corte y barba hoy cerca de las 16:30?",
    service: "Corte & Barba (45 min)",
    aiThought: "Consulta Google Calendar en 3ms · Slot 16:30 libre con Marcos",
    slot: "16:30 hs",
    staff: "Marcos B.",
    aiReply: "¡Hola Lucas! Sí, tenemos a las 16:30 hs con Marcos. Te reservo el lugar con seña bancaria / QR.",
    price: "Gs. 80.000",
  },
  {
    id: "dental",
    category: "Clínica Odontológica",
    clientName: "Sofía M.",
    clientMessage: "Hola, quisiera saber si tienen turno para limpieza con ultrasonido hoy",
    service: "Limpieza Dental Ultrasonido",
    aiThought: "Verifica agenda Dra. Benítez · Asigna 15:00 hs y genera seña QR",
    slot: "15:00 hs",
    staff: "Dra. Benítez",
    aiReply: "¡Hola Sofía! Tenemos disponible hoy a las 15:00 hs con la Dra. Benítez. ¿Confirmamos con seña de Gs. 50.000?",
    price: "Gs. 180.000",
  },
  {
    id: "estetica",
    category: "Centro de Estética & Spa",
    clientName: "Camila D.",
    clientMessage: "Hola chicas, ¿a qué hora tienen disponible limpieza facial profunda?",
    service: "Limpieza Facial Profunda",
    aiThought: "Detecta preferencia horaria · Bloquea cabina 2 y envía seña por Transferencia",
    slot: "17:30 hs",
    staff: "Lic. Paola",
    aiReply: "¡Hola Camila! Hoy tenemos libre a las 17:30 hs con Paola. Te paso el QR de seña para asegurar tu turno.",
    price: "Gs. 150.000",
  },
];

export default function AIResponse3DAnimation() {
  const [scenarioIdx, setScenarioIdx] = useState(0);
  const [activeStep, setActiveStep] = useState<1 | 2 | 3>(1);
  const scenario = SCENARIOS[scenarioIdx];

  // Ciclo automático continuo de la simulación
  useEffect(() => {
    const t1 = setTimeout(() => setActiveStep(2), 2200);
    const t2 = setTimeout(() => setActiveStep(3), 4400);
    const t3 = setTimeout(() => {
      setActiveStep(1);
      setScenarioIdx((prev) => (prev + 1) % SCENARIOS.length);
    }, 7600);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [scenarioIdx]);

  return (
    <div className="w-full max-w-6xl mx-auto py-8 px-2 sm:px-4 select-none">
      {/* Selector de rubros para probar la IA */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 mr-2 flex items-center gap-1.5 uppercase tracking-wider">
          <Activity className="h-3.5 w-3.5 text-[#FF4F2B]" />
          Ver flujo autónomo en:
        </span>
        {SCENARIOS.map((item, idx) => (
          <button
            key={item.id}
            type="button"
            onClick={() => {
              setScenarioIdx(idx);
              setActiveStep(1);
            }}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer ${
              scenarioIdx === idx
                ? "bg-[#FF4F2B] text-white shadow-md shadow-[#FF4F2B]/30 scale-105"
                : "bg-white/80 dark:bg-slate-900/80 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-white/10 hover:border-[#FF4F2B]/40"
            }`}
          >
            {item.category}
          </button>
        ))}
      </div>

      {/* ============================================================== */}
      {/* CONTENEDOR 3D SIN HOVER (Estado 3D permanente con capas en Z)  */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-center justify-center">
        
        {/* ============================================================ */}
        {/* TARJETA 1: MENSAJE ENTRANTE WHATSAPP (Verde Esmeralda 3D)   */}
        {/* ============================================================ */}
        <div
          className="relative w-full max-w-[340px] mx-auto h-[380px]"
          style={{ perspective: "1000px" }}
        >
          {/* Tarjeta 3D Tilted de forma permanente (sin hover) */}
          <div
            className={`relative w-full h-full rounded-[42px] p-2 transition-all duration-500 ${
              activeStep === 1
                ? "ring-4 ring-emerald-400/40 shadow-2xl shadow-emerald-500/30"
                : "shadow-xl shadow-emerald-950/20 opacity-90"
            }`}
            style={{
              background: "linear-gradient(135deg, rgb(0, 255, 214) 0%, rgb(8, 226, 96) 100%)",
              transformStyle: "preserve-3d",
              transform: "rotate3d(1, 0.5, 0, 16deg) rotateY(8deg)",
              boxShadow: "rgba(5, 71, 17, 0.25) 30px 45px 35px -25px, rgba(5, 71, 17, 0.15) 0px 20px 25px -5px",
            }}
          >
            {/* Círculos concéntricos 3D que sobresalen en el eje Z */}
            <div
              className="absolute right-0 top-0 pointer-events-none"
              style={{ transformStyle: "preserve-3d" }}
            >
              <span
                className="absolute block rounded-full backdrop-blur-md shadow-lg"
                style={{
                  width: "150px",
                  height: "150px",
                  top: "6px",
                  right: "6px",
                  background: "rgba(0, 249, 203, 0.25)",
                  transform: "translate3d(0, 0, 20px)",
                }}
              />
              <span
                className="absolute block rounded-full backdrop-blur-md"
                style={{
                  width: "120px",
                  height: "120px",
                  top: "10px",
                  right: "10px",
                  background: "rgba(0, 249, 203, 0.3)",
                  transform: "translate3d(0, 0, 42px)",
                }}
              />
              <span
                className="absolute block rounded-full backdrop-blur-md"
                style={{
                  width: "90px",
                  height: "90px",
                  top: "16px",
                  right: "16px",
                  background: "rgba(0, 249, 203, 0.35)",
                  transform: "translate3d(0, 0, 65px)",
                }}
              />
              <span
                className="absolute block rounded-full backdrop-blur-sm"
                style={{
                  width: "65px",
                  height: "65px",
                  top: "22px",
                  right: "22px",
                  background: "rgba(0, 249, 203, 0.45)",
                  transform: "translate3d(0, 0, 90px)",
                }}
              />
              <span
                className="absolute rounded-full flex items-center justify-center shadow-xl"
                style={{
                  width: "44px",
                  height: "44px",
                  top: "28px",
                  right: "28px",
                  background: "rgb(255, 255, 255)",
                  transform: "translate3d(0, 0, 115px)",
                  boxShadow: "rgba(5, 71, 17, 0.4) 0px 8px 15px -4px",
                }}
              >
                <MessageSquare className="h-5 w-5 text-[#00894d] fill-[#00894d]" />
              </span>
            </div>

            {/* Placa de Vidrio 3D Frosted flotando en Z=25px */}
            <div
              className="absolute inset-2 rounded-[46px] pointer-events-none"
              style={{
                borderTopRightRadius: "90px",
                background: "linear-gradient(0deg, rgba(255, 255, 255, 0.45) 0%, rgba(255, 255, 255, 0.88) 100%)",
                transform: "translate3d(0px, 0px, 25px)",
                borderLeft: "1.5px solid rgba(255, 255, 255, 0.9)",
                borderBottom: "1.5px solid rgba(255, 255, 255, 0.9)",
                transformStyle: "preserve-3d",
              }}
            />

            {/* Contenido en relieve 3D flotando a Z=32px */}
            <div
              className="relative h-full flex flex-col justify-between p-5 pt-7 text-left"
              style={{ transform: "translate3d(0, 0, 32px)", transformStyle: "preserve-3d" }}
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-black uppercase tracking-wider text-[#00894d] bg-white/70 px-2 py-0.5 rounded-full border border-white/60">
                    Paso 1 · Inbound
                  </span>
                  <span className="text-[10px] font-mono font-bold text-emerald-900/70 mr-14">
                    14:28 hs
                  </span>
                </div>
                <h3 className="text-xl font-black text-[#00894d] leading-tight mt-1">
                  WhatsApp Cliente
                </h3>

                {/* Burbuja del cliente */}
                <div className="mt-4 p-3.5 rounded-2xl bg-white/95 text-slate-800 shadow-md border border-white/80">
                  <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 mb-1">
                    <span>{scenario.clientName}</span>
                    <span className="text-emerald-600">Audio / Texto</span>
                  </div>
                  <p className="text-xs sm:text-[13px] font-semibold text-slate-900 leading-snug">
                    "{scenario.clientMessage}"
                  </p>
                  <div className="mt-2 flex items-center justify-end gap-1 text-[10px] text-slate-400">
                    <span>Entregado</span>
                    <CheckCheck className="h-3 w-3 text-[#00894d]" />
                  </div>
                </div>
              </div>

              {/* Botón / Badge inferior flotando a Z=46px */}
              <div
                className="flex items-center justify-between pt-2 border-t border-emerald-900/10"
                style={{ transform: "translate3d(0, 0, 16px)" }}
              >
                <span className="text-[11px] font-bold text-emerald-950/80 flex items-center gap-1">
                  <Zap className="h-3.5 w-3.5 text-emerald-700" /> Sin intermediarios
                </span>
                <span className="px-2.5 py-1 rounded-full bg-[#00894d] text-white text-[10px] font-black shadow-sm">
                  Detectado
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* TARJETA 2: NÚCLEO IA AUTÓNOMO (Violeta / Púrpura 3D)          */}
        {/* ============================================================ */}
        <div
          className="relative w-full max-w-[340px] mx-auto h-[380px]"
          style={{ perspective: "1000px" }}
        >
          {/* Tarjeta 3D Tilted de forma permanente (sin hover) */}
          <div
            className={`relative w-full h-full rounded-[42px] p-2 transition-all duration-500 ${
              activeStep === 2
                ? "ring-4 ring-purple-400/50 shadow-2xl shadow-purple-500/40"
                : "shadow-xl shadow-purple-950/20 opacity-90"
            }`}
            style={{
              background: "linear-gradient(135deg, rgb(106, 90, 205) 0%, rgb(147, 112, 219) 100%)",
              transformStyle: "preserve-3d",
              transform: "rotate3d(1, 0, 0, 18deg) translateZ(20px)",
              boxShadow: "rgba(30, 30, 60, 0.3) 30px 45px 35px -25px, rgba(30, 30, 60, 0.15) 0px 20px 25px -5px",
            }}
          >
            {/* Círculos concéntricos 3D en esquina superior izquierda */}
            <div
              className="absolute left-0 top-0 pointer-events-none"
              style={{ transformStyle: "preserve-3d" }}
            >
              <span
                className="absolute block rounded-full backdrop-blur-md shadow-lg"
                style={{
                  width: "150px",
                  height: "150px",
                  top: "6px",
                  left: "6px",
                  background: "rgba(147, 112, 219, 0.3)",
                  transform: "translate3d(0, 0, 20px)",
                }}
              />
              <span
                className="absolute block rounded-full backdrop-blur-md"
                style={{
                  width: "120px",
                  height: "120px",
                  top: "10px",
                  left: "10px",
                  background: "rgba(147, 112, 219, 0.35)",
                  transform: "translate3d(0, 0, 42px)",
                }}
              />
              <span
                className="absolute block rounded-full backdrop-blur-md"
                style={{
                  width: "90px",
                  height: "90px",
                  top: "16px",
                  left: "16px",
                  background: "rgba(147, 112, 219, 0.4)",
                  transform: "translate3d(0, 0, 65px)",
                }}
              />
              <span
                className="absolute block rounded-full backdrop-blur-sm"
                style={{
                  width: "65px",
                  height: "65px",
                  top: "22px",
                  left: "22px",
                  background: "rgba(147, 112, 219, 0.5)",
                  transform: "translate3d(0, 0, 90px)",
                }}
              />
              <span
                className="absolute rounded-full flex items-center justify-center shadow-xl"
                style={{
                  width: "44px",
                  height: "44px",
                  top: "28px",
                  left: "28px",
                  background: "rgb(255, 255, 255)",
                  transform: "translate3d(0, 0, 115px)",
                  boxShadow: "rgba(30, 30, 60, 0.4) 0px 8px 15px -4px",
                }}
              >
                <Bot className="h-5 w-5 text-[#3c2f80]" />
              </span>
            </div>

            {/* Placa de Vidrio 3D Frosted en Z=25px */}
            <div
              className="absolute inset-2 rounded-[46px] pointer-events-none"
              style={{
                borderTopLeftRadius: "90px",
                background: "linear-gradient(0deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.85) 100%)",
                transform: "translate3d(0px, 0px, 25px)",
                borderRight: "1.5px solid rgba(255, 255, 255, 0.8)",
                borderBottom: "1.5px solid rgba(255, 255, 255, 0.8)",
                transformStyle: "preserve-3d",
              }}
            />

            {/* Contenido en relieve 3D flotando a Z=32px */}
            <div
              className="relative h-full flex flex-col justify-between p-5 pt-7 text-left"
              style={{ transform: "translate3d(0, 0, 32px)", transformStyle: "preserve-3d" }}
            >
              <div>
                <div className="flex items-center justify-between mb-1 pl-14">
                  <span className="text-[11px] font-black uppercase tracking-wider text-[#3c2f80] bg-white/70 px-2 py-0.5 rounded-full border border-white/60">
                    Paso 2 · Motor IA
                  </span>
                  <span className="text-[10px] font-bold text-purple-900/70">
                    1.2s
                  </span>
                </div>
                <h3 className="text-xl font-black text-[#3c2f80] leading-tight mt-1 pl-14">
                  IA AgendatePY
                </h3>

                {/* Pasos de decisión autónoma */}
                <div className="mt-4 space-y-2">
                  <div className="p-2.5 rounded-xl bg-white/95 text-slate-800 shadow-xs border border-white/80 text-xs">
                    <div className="flex items-center justify-between font-bold text-[#3c2f80] mb-0.5">
                      <span>1. NLP & Servicio</span>
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                    </div>
                    <p className="text-[11px] text-slate-600 truncate">{scenario.service}</p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white/95 text-slate-800 shadow-xs border border-white/80 text-xs">
                    <div className="flex items-center justify-between font-bold text-[#3c2f80] mb-0.5">
                      <span>2. Google Calendar</span>
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                    </div>
                    <p className="text-[11px] text-slate-600">Slot disponible: {scenario.slot}</p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white/95 text-slate-800 shadow-xs border border-white/80 text-xs">
                    <div className="flex items-center justify-between font-bold text-[#3c2f80] mb-0.5">
                      <span>3. Seña Bancaria</span>
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                    </div>
                    <p className="text-[11px] text-slate-600">Genera QR Bancard / Transferencia</p>
                  </div>
                </div>
              </div>

              {/* Botón inferior flotando a Z=46px */}
              <div
                className="flex items-center justify-between pt-2 border-t border-purple-900/10"
                style={{ transform: "translate3d(0, 0, 16px)" }}
              >
                <span className="text-[11px] font-bold text-purple-950/80 flex items-center gap-1">
                  <Bot className="h-3.5 w-3.5 text-[#3c2f80]" /> 100% Automático
                </span>
                <span className="px-2.5 py-1 rounded-full bg-[#3c2f80] text-white text-[10px] font-black shadow-sm">
                  Procesado
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* TARJETA 3: RESPUESTA & AGENDA EN VIVO (Naranja AgendatePY 3D)*/}
        {/* ============================================================ */}
        <div
          className="relative w-full max-w-[340px] mx-auto h-[380px]"
          style={{ perspective: "1000px" }}
        >
          {/* Tarjeta 3D Tilted de forma permanente (sin hover) */}
          <div
            className={`relative w-full h-full rounded-[42px] p-2 transition-all duration-500 ${
              activeStep === 3
                ? "ring-4 ring-orange-400/50 shadow-2xl shadow-orange-500/35"
                : "shadow-xl shadow-orange-950/20 opacity-90"
            }`}
            style={{
              background: "linear-gradient(135deg, rgb(255, 115, 64) 0%, rgb(255, 79, 43) 100%)",
              transformStyle: "preserve-3d",
              transform: "rotate3d(1, -0.5, 0, 16deg) rotateY(-8deg)",
              boxShadow: "rgba(100, 30, 15, 0.25) 30px 45px 35px -25px, rgba(100, 30, 15, 0.15) 0px 20px 25px -5px",
            }}
          >
            {/* Círculos concéntricos 3D en esquina superior derecha */}
            <div
              className="absolute right-0 top-0 pointer-events-none"
              style={{ transformStyle: "preserve-3d" }}
            >
              <span
                className="absolute block rounded-full backdrop-blur-md shadow-lg"
                style={{
                  width: "150px",
                  height: "150px",
                  top: "6px",
                  right: "6px",
                  background: "rgba(255, 180, 140, 0.28)",
                  transform: "translate3d(0, 0, 20px)",
                }}
              />
              <span
                className="absolute block rounded-full backdrop-blur-md"
                style={{
                  width: "120px",
                  height: "120px",
                  top: "10px",
                  right: "10px",
                  background: "rgba(255, 180, 140, 0.35)",
                  transform: "translate3d(0, 0, 42px)",
                }}
              />
              <span
                className="absolute block rounded-full backdrop-blur-md"
                style={{
                  width: "90px",
                  height: "90px",
                  top: "16px",
                  right: "16px",
                  background: "rgba(255, 180, 140, 0.42)",
                  transform: "translate3d(0, 0, 65px)",
                }}
              />
              <span
                className="absolute block rounded-full backdrop-blur-sm"
                style={{
                  width: "65px",
                  height: "65px",
                  top: "22px",
                  right: "22px",
                  background: "rgba(255, 180, 140, 0.5)",
                  transform: "translate3d(0, 0, 90px)",
                }}
              />
              <span
                className="absolute rounded-full flex items-center justify-center shadow-xl"
                style={{
                  width: "44px",
                  height: "44px",
                  top: "28px",
                  right: "28px",
                  background: "rgb(255, 255, 255)",
                  transform: "translate3d(0, 0, 115px)",
                  boxShadow: "rgba(100, 30, 15, 0.4) 0px 8px 15px -4px",
                }}
              >
                <Calendar className="h-5 w-5 text-[#c23315] fill-[#c23315]" />
              </span>
            </div>

            {/* Placa de Vidrio 3D Frosted en Z=25px */}
            <div
              className="absolute inset-2 rounded-[46px] pointer-events-none"
              style={{
                borderTopRightRadius: "90px",
                background: "linear-gradient(0deg, rgba(255, 255, 255, 0.45) 0%, rgba(255, 255, 255, 0.88) 100%)",
                transform: "translate3d(0px, 0px, 25px)",
                borderLeft: "1.5px solid rgba(255, 255, 255, 0.9)",
                borderBottom: "1.5px solid rgba(255, 255, 255, 0.9)",
                transformStyle: "preserve-3d",
              }}
            />

            {/* Contenido en relieve 3D flotando a Z=32px */}
            <div
              className="relative h-full flex flex-col justify-between p-5 pt-7 text-left"
              style={{ transform: "translate3d(0, 0, 32px)", transformStyle: "preserve-3d" }}
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-black uppercase tracking-wider text-[#c23315] bg-white/70 px-2 py-0.5 rounded-full border border-white/60">
                    Paso 3 · Confirmado
                  </span>
                  <span className="text-[10px] font-mono font-bold text-orange-950/70 mr-14">
                    Sincronizado
                  </span>
                </div>
                <h3 className="text-xl font-black text-[#c23315] leading-tight mt-1">
                  Agenda en Vivo
                </h3>

                {/* Respuesta enviada y slot bloqueado */}
                <div className="mt-4 p-3.5 rounded-2xl bg-white/95 text-slate-800 shadow-md border border-white/80">
                  <div className="flex items-center justify-between text-[10px] font-bold text-[#c23315] mb-1">
                    <span>Turno Bloqueado:</span>
                    <span className="bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-black">
                      Confirmado
                    </span>
                  </div>
                  <p className="text-xs sm:text-[13px] font-black text-slate-900 leading-tight">
                    {scenario.slot} · {scenario.staff}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                    Cliente: {scenario.clientName} ({scenario.price})
                  </p>
                  <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-emerald-600 font-bold">
                    <span>Google Calendar Sync OK</span>
                    <CheckCheck className="h-3 w-3 text-emerald-600" />
                  </div>
                </div>
              </div>

              {/* Botón inferior flotando a Z=46px */}
              <div
                className="flex items-center justify-between pt-2 border-t border-orange-950/10"
                style={{ transform: "translate3d(0, 0, 16px)" }}
              >
                <span className="text-[11px] font-bold text-orange-950/80 flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-[#c23315]" /> Seña Verificada
                </span>
                <span className="px-2.5 py-1 rounded-full bg-[#c23315] text-white text-[10px] font-black shadow-sm">
                  0 Ausencias
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Barra de progreso sutil del ciclo */}
      <div className="mt-12 flex items-center justify-center gap-3 text-xs font-semibold text-slate-500">
        <span className="flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full ${activeStep === 1 ? "bg-emerald-500 animate-ping" : "bg-slate-300"}`} />
          1. Cliente consulta
        </span>
        <ArrowRight className="h-3 w-3 text-slate-300" />
        <span className="flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full ${activeStep === 2 ? "bg-purple-500 animate-ping" : "bg-slate-300"}`} />
          2. IA analiza y responde en 1.2s
        </span>
        <ArrowRight className="h-3 w-3 text-slate-300" />
        <span className="flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full ${activeStep === 3 ? "bg-[#FF4F2B] animate-ping" : "bg-slate-300"}`} />
          3. Turno agendado en vivo
        </span>
      </div>
    </div>
  );
}
