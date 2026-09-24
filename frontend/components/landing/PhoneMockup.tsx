"use client";

import { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import {
  CheckCheck,
  RotateCcw,
  Video,
  Phone,
  ChevronLeft,
  Plus,
  Camera,
  Mic,
  Play,
  Pause,
  BadgeCheck,
  Wifi,
  Sparkles,
  MapPin,
  Calendar,
  Lock,
} from "lucide-react";
import { useCategory } from "@/context/CategoryContext";

type Message = {
  id: string;
  incoming: boolean;
  type?: "text" | "audio" | "card";
  text?: string;
  time: string;
  options?: { label: string; action: () => void }[];
  audioDuration?: string;
  cardData?: {
    service: string;
    staff: string;
    datetime: string;
    location: string;
    price: string;
  };
};

export default function PhoneMockup() {
  const { category } = useCategory();
  const [step, setStep] = useState<number>(0);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);

  // 3D tilt tracking for mouse over phone
  const cardRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 20, stiffness: 180 };
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [7, -7]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-8, 8]), springConfig);

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const xPct = (e.clientX - rect.left) / width - 0.5;
    const yPct = (e.clientY - rect.top) / height - 0.5;
    mouseX.set(xPct);
    mouseY.set(yPct);
  }

  function handleMouseLeave() {
    mouseX.set(0);
    mouseY.set(0);
  }

  const initialMessages: Message[] = [
    {
      id: "m1",
      incoming: false,
      type: "text",
      text: `Hola, quiero consultar disponibilidad en *${category.businessName}*.`,
      time: "14:20",
    },
    {
      id: "m2",
      incoming: true,
      type: "text",
      text: `¡Hola! Bienvenido/a a *${category.businessName}* en Asunción.\n\nSoy el asistente virtual de AgendatePY. Seleccioná el servicio que deseás agendar:`,
      time: "14:20",
      options: [
        { label: `${category.services[0]?.name || "Corte Clásico"} · Gs. 80.000`, action: () => handleSelectService() },
        { label: `${category.services[1]?.name || "Servicio Completo"} · Gs. 120.000`, action: () => handleSelectService() },
      ],
    },
  ];

  const [chat, setChat] = useState<Message[]>(initialMessages);

  // Restart chat when category changes
  useEffect(() => {
    handleReset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category.id]);

  function handleSelectService() {
    setStep(1);
    const serviceName = category.services[0]?.name || "Corte Clásico";
    const userMsg: Message = {
      id: "u-service",
      incoming: false,
      type: "text",
      text: serviceName,
      time: "14:21",
    };

    setChat((prev) => [...prev, userMsg]);
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      const botMsg: Message = {
        id: "b-service",
        incoming: true,
        type: "text",
        text: `Excelente. Tenemos estos horarios disponibles para hoy con *Marcos Benítez*:\n\n• 15:30 hs\n• 16:30 hs\n• 18:00 hs\n\n¿Cuál te queda más cómodo?`,
        time: "14:21",
        options: [
          { label: "16:30 hs (Hoy)", action: () => handleSelectTime() },
          { label: "18:00 hs (Hoy)", action: () => handleSelectTime() },
        ],
      };
      setChat((prev) => [...prev, botMsg]);
    }, 900);
  }

  function handleSelectTime() {
    setStep(2);
    const userMsg: Message = {
      id: "u-time",
      incoming: false,
      type: "text",
      text: "16:30 hs",
      time: "14:22",
    };

    setChat((prev) => [...prev, userMsg]);
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      const confirmationCard: Message = {
        id: "b-card",
        incoming: true,
        type: "card",
        time: "14:22",
        cardData: {
          service: category.services[0]?.name || "Corte Clásico",
          staff: "Marcos Benítez",
          datetime: "Hoy a las 16:30 hs",
          location: `${category.businessName} · Asunción`,
          price: "Gs. 80.000",
        },
        options: [
          { label: "Escuchar audio de confirmación", action: () => handlePlayAudioNote() },
        ],
      };
      setChat((prev) => [...prev, confirmationCard]);
    }, 1000);
  }

  function handlePlayAudioNote() {
    setStep(3);
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      const audioMsg: Message = {
        id: "b-audio",
        incoming: true,
        type: "audio",
        time: "14:23",
        audioDuration: "0:12",
        options: [
          { label: "Ver recordatorio previo", action: () => handleShowReminder() },
        ],
      };
      setChat((prev) => [...prev, audioMsg]);
      setIsPlayingAudio(true);
      setTimeout(() => setIsPlayingAudio(false), 3500);
    }, 800);
  }

  function handleShowReminder() {
    setStep(4);
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      const reminderMsg: Message = {
        id: "r-reminder",
        incoming: true,
        type: "text",
        text: `*Recordatorio de Turno*\n\n¡Hola Martín! Tu turno para *${category.services[0]?.name || "Corte"}* en *${category.businessName}* es en 2 horas (16:30 hs).\n\nDirección: Avda. España 1420 c/ San Rafael\n\n¿Nos confirmás tu asistencia? Respondé *SI* o reprogramá desde tu enlace de autogestión.`,
        time: "14:30",
      };
      setChat((prev) => [...prev, reminderMsg]);
    }, 800);
  }

  function handleReset() {
    setStep(0);
    setIsTyping(false);
    setIsPlayingAudio(false);
    setChat([
      {
        id: "m1",
        incoming: false,
        type: "text",
        text: `Hola, quiero consultar disponibilidad en *${category.businessName}*.`,
        time: "14:20",
      },
      {
        id: "m2",
        incoming: true,
        type: "text",
        text: `¡Hola! Bienvenido/a a *${category.businessName}* en Asunción.\n\nSoy el asistente virtual de AgendatePY. Seleccioná el servicio que deseás agendar:`,
        time: "14:20",
        options: [
          { label: `${category.services[0]?.name || "Corte Clásico"} · Gs. 80.000`, action: () => handleSelectService() },
          { label: `${category.services[1]?.name || "Servicio Completo"} · Gs. 120.000`, action: () => handleSelectService() },
        ],
      },
    ]);
  }

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative mx-auto flex items-center justify-center p-4 [perspective:1400px]"
    >
      {/* Ambient Halo behind iPhone */}
      <div className="pointer-events-none absolute -inset-4 rounded-[60px] bg-gradient-to-tr from-brand/20 via-whatsapp/20 to-indigo-500/20 blur-3xl opacity-60" />

      {/* 3D Tiltable iPhone 16 Pro Container */}
      <motion.div
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
        className="relative w-[340px] sm:w-[360px] rounded-[50px] p-[9px] bg-gradient-to-b from-[#3a3b40] via-[#1e1f23] to-[#111215] shadow-[0_30px_70px_-15px_rgba(0,0,0,0.6),0_0_0_1px_rgba(255,255,255,0.18)]"
      >
        {/* Precision Engineered Side Buttons (Attached flush to Titanium bezel) */}
        {/* Left Side: Action Button */}
        <div className="absolute -left-[3px] top-[100px] h-7 w-[3.5px] rounded-l-[2px] bg-gradient-to-r from-[#2a2b30] to-[#45474e] shadow-[-1px_0_2px_rgba(0,0,0,0.4)]" />
        {/* Left Side: Volume Up */}
        <div className="absolute -left-[3px] top-[140px] h-12 w-[3.5px] rounded-l-[2px] bg-gradient-to-r from-[#2a2b30] to-[#45474e] shadow-[-1px_0_2px_rgba(0,0,0,0.4)]" />
        {/* Left Side: Volume Down */}
        <div className="absolute -left-[3px] top-[204px] h-12 w-[3.5px] rounded-l-[2px] bg-gradient-to-r from-[#2a2b30] to-[#45474e] shadow-[-1px_0_2px_rgba(0,0,0,0.4)]" />
        {/* Right Side: Power Button */}
        <div className="absolute -right-[3px] top-[135px] h-16 w-[3.5px] rounded-r-[2px] bg-gradient-to-l from-[#2a2b30] to-[#45474e] shadow-[1px_0_2px_rgba(0,0,0,0.4)]" />
        {/* Right Side: Camera Control Sensor (iPhone 16 Pro style) */}
        <div className="absolute -right-[2.5px] top-[280px] h-14 w-[3px] rounded-r-[2px] bg-gradient-to-l from-[#222327] to-[#3a3b40]" />

        {/* Outer Glass Bezel */}
        <div className="relative overflow-hidden rounded-[42px] bg-black p-[2.5px] shadow-inner">
          {/* Inner Display Canvas */}
          <div className="relative flex h-[660px] flex-col overflow-hidden rounded-[42px] bg-[#efeae2]">
            {/* WhatsApp Authentic Doodle Wallpaper Pattern Overlay */}
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.06] mix-blend-multiply"
              style={{
                backgroundImage: `radial-gradient(#000 1px, transparent 1px), radial-gradient(#000 1px, #efeae2 1px)`,
                backgroundSize: "20px 20px",
                backgroundPosition: "0 0, 10px 10px",
              }}
            />

            {/* ========================================================= */}
            {/* 1. iOS 18 STATUS BAR */}
            {/* ========================================================= */}
            <div className="relative z-30 flex h-11 items-center justify-between px-7 pt-2 text-[#000000] font-semibold text-[13px] tracking-tight select-none">
              <span>9:41</span>

              {/* Dynamic Island */}
              <div className="absolute left-1/2 top-2.5 -translate-x-1/2 flex h-6 w-24 items-center justify-between rounded-full bg-black px-2 shadow-sm">
                {/* Front camera lens reflection */}
                <div className="h-2.5 w-2.5 rounded-full bg-[#0a0d17] border border-blue-950/40 relative">
                  <div className="absolute inset-0.5 rounded-full bg-[#1b2342] opacity-80" />
                </div>
                {/* Sensor dot */}
                <div className="h-2 w-2 rounded-full bg-[#050508]" />
              </div>

              {/* Cellular, Wi-Fi, Battery */}
              <div className="flex items-center gap-1.5 text-black">
                {/* 4 bars cellular */}
                <div className="flex items-end gap-[1.5px] h-3">
                  <span className="w-[2.5px] h-1.5 bg-black rounded-xs" />
                  <span className="w-[2.5px] h-2 bg-black rounded-xs" />
                  <span className="w-[2.5px] h-2.5 bg-black rounded-xs" />
                  <span className="w-[2.5px] h-3 bg-black rounded-xs" />
                </div>
                <Wifi className="h-3.5 w-3.5 stroke-[2.4]" />
                {/* Battery Pill */}
                <div className="flex items-center">
                  <div className="h-3 w-5 rounded-[4px] border border-black p-[1px] flex items-center">
                    <div className="h-full w-full rounded-[2px] bg-black" />
                  </div>
                  <div className="h-1.5 w-[1.5px] rounded-r-xs bg-black ml-[0.5px]" />
                </div>
              </div>
            </div>

            {/* ========================================================= */}
            {/* 2. WHATSAPP BUSINESS HEADER */}
            {/* ========================================================= */}
            <div className="relative z-20 flex items-center justify-between bg-[#008069] px-3 py-2 text-white shadow-sm">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleReset}
                  className="flex items-center -ml-1 text-white/90 hover:text-white"
                  title="Reiniciar chat"
                >
                  <ChevronLeft className="h-5 w-5 stroke-[2.5]" />
                  <span className="text-[12px] font-semibold -ml-1">12</span>
                </button>

                {/* Contact Avatar with Meta Verified checkmark */}
                <div className="relative">
                  <div className="h-9 w-9 rounded-full bg-white/20 border border-white/40 flex items-center justify-center font-bold text-xs shadow-xs text-white">
                    {category.businessName.slice(0, 2).toUpperCase()}
                  </div>
                  <BadgeCheck className="absolute -bottom-0.5 -right-0.5 h-4 w-4 text-white fill-[#10b981]" />
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-1">
                    <p className="truncate text-xs font-bold text-white leading-tight">
                      {category.businessName}
                    </p>
                  </div>
                  <p className="text-[10px] text-white/80 leading-none mt-0.5">
                    {isTyping ? (
                      <span className="text-white font-medium italic animate-pulse">escribiendo...</span>
                    ) : (
                      "en línea · Cuenta Comercial"
                    )}
                  </p>
                </div>
              </div>

              {/* Call & Overflow Icons */}
              <div className="flex items-center gap-3 text-white/90 pr-1">
                <Video className="h-4 w-4" />
                <Phone className="h-3.5 w-3.5" />
                <button
                  type="button"
                  onClick={handleReset}
                  title="Reiniciar demo"
                  className="rounded-full p-1 hover:bg-white/10 transition"
                >
                  <RotateCcw className="h-3.5 w-3.5 text-white/80" />
                </button>
              </div>
            </div>

            {/* ========================================================= */}
            {/* 3. CHAT MESSAGE STREAM */}
            {/* ========================================================= */}
            <div className="relative z-10 flex-1 overflow-y-auto px-3 py-2 space-y-2.5">
              {/* Date Badge */}
              <div className="text-center my-1">
                <span className="rounded-lg bg-[#ffffff]/80 px-2.5 py-0.8 text-[10px] font-semibold text-[#54656f] shadow-[0_1px_0.5px_rgba(11,20,26,0.13)] uppercase tracking-wider">
                  HOY
                </span>
              </div>

              {/* End-to-end encryption notice */}
              <div className="mx-auto max-w-[260px] rounded-lg bg-[#ffeecd] px-2 py-1 text-center text-[9px] text-[#54656f] shadow-[0_1px_0.5px_rgba(11,20,26,0.13)] flex items-center justify-center gap-1">
                <Lock className="h-2.5 w-2.5 shrink-0 text-[#54656f]" />
                <span>Los mensajes y llamadas están cifrados de extremo a extremo.</span>
              </div>

              <AnimatePresence initial={false}>
                {chat.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.22 }}
                    className={`flex flex-col ${msg.incoming ? "items-start" : "items-end"}`}
                  >
                    {/* Standard Text Bubble */}
                    {msg.type === "text" && (
                      <div
                        className={`relative max-w-[86%] rounded-2xl px-3 py-2 text-xs leading-relaxed shadow-[0_1px_0.5px_rgba(11,20,26,0.15)] ${
                          msg.incoming
                            ? "rounded-tl-xs bg-white text-[#111b21]"
                            : "rounded-tr-xs bg-[#d9fdd3] text-[#111b21]"
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{msg.text}</p>
                        <div className="mt-1 flex items-center justify-end gap-1 text-[9px] text-[#667781]">
                          <span>{msg.time}</span>
                          {!msg.incoming && <CheckCheck className="h-3 w-3 text-[#53bdeb]" />}
                        </div>
                      </div>
                    )}

                    {/* Rich Confirmation Card (WhatsApp Interactive Format) */}
                    {msg.type === "card" && msg.cardData && (
                      <div className="relative max-w-[90%] overflow-hidden rounded-2xl bg-white text-[#111b21] shadow-[0_1px_0.5px_rgba(11,20,26,0.15)] rounded-tl-xs">
                        {/* Header bar of confirmation card */}
                        <div className="bg-[#008069] px-3.5 py-2 text-white flex items-center justify-between">
                          <span className="text-[11px] font-bold flex items-center gap-1">
                            <Sparkles className="h-3.5 w-3.5" /> TURNO CONFIRMADO
                          </span>
                          <span className="text-[10px] bg-white/20 px-1.5 py-0.2 rounded font-mono">
                            AG-9421
                          </span>
                        </div>

                        <div className="p-3 text-xs space-y-1.5">
                          <p className="font-bold text-sm text-[#111b21]">{msg.cardData.service}</p>
                          <div className="text-[11px] text-[#54656f] space-y-1">
                            <p className="flex items-center gap-1.5">
                              <Calendar className="h-3 w-3 text-[#008069]" />
                              <strong>{msg.cardData.datetime}</strong>
                            </p>
                            <p className="flex items-center gap-1.5">
                              <MapPin className="h-3 w-3 text-[#008069]" />
                              {msg.cardData.location}
                            </p>
                          </div>
                          <div className="border-t border-slate-100 pt-1.5 flex items-center justify-between text-[11px]">
                            <span className="text-[#54656f]">Profesional:</span>
                            <span className="font-semibold">{msg.cardData.staff}</span>
                          </div>
                        </div>

                        <div className="bg-slate-50 px-3 py-1 flex items-center justify-between border-t border-slate-100 text-[9px] text-[#667781]">
                          <span className="text-[#008069] font-bold">agendate.py/turno</span>
                          <span>{msg.time}</span>
                        </div>
                      </div>
                    )}

                    {/* Simulated Voice Message Note */}
                    {msg.type === "audio" && (
                      <div className="relative max-w-[85%] rounded-2xl bg-white p-3 shadow-[0_1px_0.5px_rgba(11,20,26,0.15)] rounded-tl-xs flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                          className="flex h-9 w-9 items-center justify-center rounded-full bg-[#008069] text-white shadow-xs"
                        >
                          {isPlayingAudio ? (
                            <Pause className="h-4 w-4" />
                          ) : (
                            <Play className="h-4 w-4 ml-0.5" />
                          )}
                        </button>

                        <div className="flex-1">
                          {/* Animated Voice Waveform bars */}
                          <div className="flex items-center gap-[2px] h-5">
                            {[4, 8, 14, 18, 12, 6, 16, 20, 10, 15, 8, 12, 18, 9, 6, 14].map((h, i) => (
                              <span
                                key={i}
                                className={`w-[2.5px] rounded-full transition-all duration-200 ${
                                  isPlayingAudio ? "bg-[#008069] animate-pulse" : "bg-[#8696a0]"
                                }`}
                                style={{ height: `${h}px` }}
                              />
                            ))}
                          </div>
                          <div className="mt-1 flex items-center justify-between text-[9px] text-[#667781]">
                            <span>{msg.audioDuration}</span>
                            <span>{msg.time}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* WhatsApp Interactive Action Buttons (Cloud API Native Style) */}
                    {msg.options && (
                      <div className="mt-1.5 flex flex-col gap-1 w-full max-w-[86%]">
                        {msg.options.map((opt) => (
                          <button
                            key={opt.label}
                            type="button"
                            onClick={opt.action}
                            className="w-full rounded-xl border border-[#008069]/30 bg-white py-2 px-3 text-[11px] font-bold text-[#008069] shadow-[0_1px_1px_rgba(0,0,0,0.06)] hover:bg-[#e7f8f5] active:scale-[0.98] transition flex items-center justify-center gap-1.5"
                          >
                            <span>{opt.label}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </motion.div>
                ))}

                {/* Animated Typing Bubble */}
                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-1 rounded-2xl rounded-tl-xs bg-white px-3.5 py-2.5 shadow-[0_1px_0.5px_rgba(11,20,26,0.15)] w-14"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-[#008069] animate-bounce" />
                    <span className="h-1.5 w-1.5 rounded-full bg-[#008069] animate-bounce [animation-delay:0.15s]" />
                    <span className="h-1.5 w-1.5 rounded-full bg-[#008069] animate-bounce [animation-delay:0.3s]" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ========================================================= */}
            {/* 4. WHATSAPP BOTTOM INPUT BAR */}
            {/* ========================================================= */}
            <div className="relative z-20 flex items-center gap-2 bg-[#f0f2f5] px-3 py-2 border-t border-slate-200/80">
              <button
                type="button"
                className="flex h-8 w-8 items-center justify-center text-[#54656f] hover:text-[#008069]"
              >
                <Plus className="h-5 w-5" />
              </button>

              <div className="flex flex-1 items-center justify-between rounded-full bg-white px-3.5 py-1.5 shadow-xs border border-black/5">
                <span className="text-[11px] text-[#8696a0]">
                  {step >= 3 ? "Simulación completada" : "Tocá una opción arriba..."}
                </span>
                <Camera className="h-4 w-4 text-[#54656f]" />
              </div>

              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#008069] text-white shadow-xs">
                <Mic className="h-4 w-4" />
              </div>
            </div>

            {/* ========================================================= */}
            {/* 5. iOS BOTTOM HOME INDICATOR */}
            {/* ========================================================= */}
            <div className="relative z-30 flex h-5 items-center justify-center bg-[#f0f2f5] pb-1">
              <div className="h-1 w-32 rounded-full bg-black/40" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Floating Badge below the phone */}
      <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-brand/20 bg-white/95 px-4 py-1.5 text-xs font-bold text-brand shadow-lg backdrop-blur-md">
          <Sparkles className="h-3.5 w-3.5 text-amber-500" /> Simulador Interactivo de WhatsApp en Vivo
        </span>
      </div>
    </div>
  );
}
