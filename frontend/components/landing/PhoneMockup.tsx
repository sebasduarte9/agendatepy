"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
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
  CheckCircle2,
  MapPin,
  Calendar,
  Lock,
  Bell,
  Landmark,
  MessageSquare,
  ArrowRight,
  X,
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

function renderWhatsAppText(text?: string) {
  if (!text) return null;
  const parts = text.split(/(\*[^*]+\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
      return (
        <strong key={index} className="font-bold text-[#111b21]">
          {part.slice(1, -1)}
        </strong>
      );
    }
    return <span key={index}>{part}</span>;
  });
}

function playiOSChime() {
  if (typeof window === "undefined") return;
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    if (ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }
    const now = ctx.currentTime;
    // Note 1: E6 (1318.5 Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(1318.5, now);
    gain1.gain.setValueAtTime(0.12, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.35);

    // Note 2: B6 (1975.5 Hz)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(1975.5, now + 0.12);
    gain2.gain.setValueAtTime(0.15, now + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.12);
    osc2.stop(now + 0.55);
  } catch {
    // Ignore audio autoplay restrictions gracefully
  }
}

export default function PhoneMockup() {
  const { category } = useCategory();
  const [step, setStep] = useState<number>(0);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [showNotification, setShowNotification] = useState<boolean>(false);

  // Chat auto-scroll refs
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTo({
        top: chatScrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  };

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

  // Auto-scroll chat whenever messages change or typing status updates
  useEffect(() => {
    scrollToBottom();
    const timer = setTimeout(scrollToBottom, 120);
    return () => clearTimeout(timer);
  }, [chat, isTyping]);

  // Restart chat when category changes
  useEffect(() => {
    handleReset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category.id]);

  function handleSelectService(selectedIdx = 0) {
    setStep(1);
    const service = category.services[selectedIdx] || category.services[0];
    const userMsg: Message = {
      id: "u-service",
      incoming: false,
      type: "text",
      text: `${service.name} (${service.price})`,
      time: "14:21",
    };

    setChat((prev) => [...prev, userMsg]);
    setIsTyping(true);

    const slot1 = category.timeSlots?.[0] || "16:30 hs";
    const slot2 = category.timeSlots?.[1] || "18:00 hs";
    const staff = category.staffName || "Atención al Cliente";

    setTimeout(() => {
      setIsTyping(false);
      const botMsg: Message = {
        id: "b-service",
        incoming: true,
        type: "text",
        text: `Excelente elección. Disponibilidad hoy con *${staff}*:\n\n• ${slot1}\n• ${slot2}\n\n¿Cuál horario te queda mejor?`,
        time: "14:21",
        options: [
          { label: slot1, action: () => handleSelectTime(service, slot1, staff) },
          { label: slot2, action: () => handleSelectTime(service, slot2, staff) },
        ],
      };
      setChat((prev) => [...prev, botMsg]);
    }, 800);
  }

  function handleSelectTime(
    service: { name: string; price: string },
    timeSlot: string,
    staff: string
  ) {
    setStep(2);
    const userMsg: Message = {
      id: "u-time",
      incoming: false,
      type: "text",
      text: timeSlot,
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
          service: service.name,
          staff: staff,
          datetime: `Hoy · ${timeSlot}`,
          location: `${category.businessName} · Asunción`,
          price: service.price,
        },
        options: [
          { label: "Escuchar audio de confirmación", action: () => handlePlayAudioNote(service) },
        ],
      };
      setChat((prev) => [...prev, confirmationCard]);

      setTimeout(() => {
        setShowNotification(true);
        playiOSChime();
      }, 700);
    }, 700);
  }

  function handlePlayAudioNote(service?: { name: string; price: string }) {
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
          { label: "Ver recordatorio previo", action: () => handleShowReminder(service) },
        ],
      };
      setChat((prev) => [...prev, audioMsg]);
      setIsPlayingAudio(true);
      setTimeout(() => setIsPlayingAudio(false), 3500);
    }, 800);
  }

  function handleShowReminder(service?: { name: string; price: string }) {
    setStep(4);
    setIsTyping(true);
    const serviceName = service?.name || category.services[0]?.name || "Turno";

    setTimeout(() => {
      setIsTyping(false);
      const reminderMsg: Message = {
        id: "r-reminder",
        incoming: true,
        type: "text",
        text: `*Recordatorio de Turno*\n\n¡Hola Martín! Tu reserva para *${serviceName}* en *${category.businessName}* es en 2 horas.\n\nDirección: Avda. España 1420 c/ San Rafael\n\n¿Confirmás tu asistencia? Respondé *SI* o reprogramá desde tu enlace de autogestión.`,
        time: "14:30",
      };
      setChat((prev) => [...prev, reminderMsg]);
      setTimeout(() => {
        setShowNotification(true);
        playiOSChime();
      }, 500);
    }, 700);
  }

  function handleReset() {
    setShowNotification(false);
    setStep(0);
    setIsTyping(false);
    setIsPlayingAudio(false);
    setChat([
      {
        id: "m1",
        incoming: false,
        type: "text",
        text: `Hola, quiero consultar en *${category.businessName}*.`,
        time: "14:20",
      },
      {
        id: "m2",
        incoming: true,
        type: "text",
        text: category.botIntro || `¡Hola! Bienvenido/a a *${category.businessName}* en Asunción. Seleccioná una opción:`,
        time: "14:20",
        options: category.services.slice(0, 2).map((srv, idx) => ({
          label: `${srv.name} · ${srv.price}`,
          action: () => handleSelectService(idx),
        })),
      },
    ]);
  }

  return (
    <div className="relative mx-auto flex w-full items-center justify-center p-0 max-w-full">
      {/* Phone Container on Desktop / Clean WhatsApp Chat Card on Mobile */}
      <div className="relative w-full max-w-[340px] xs:max-w-[360px] rounded-3xl sm:rounded-[50px] p-0 sm:p-[9px] bg-transparent sm:bg-gradient-to-b sm:from-[#3a3b40] sm:via-[#1e1f23] sm:to-[#111215] sm:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.15)]">
        {/* Precision Engineered Side Buttons (Attached flush to Titanium bezel - Desktop Only) */}
        {/* Left Side: Action Button */}
        <div className="hidden sm:block absolute -left-[3px] top-[100px] h-7 w-[3.5px] rounded-l-[2px] bg-gradient-to-r from-[#2a2b30] to-[#45474e] shadow-[-1px_0_2px_rgba(0,0,0,0.4)]" />
        {/* Left Side: Volume Up */}
        <div className="hidden sm:block absolute -left-[3px] top-[140px] h-12 w-[3.5px] rounded-l-[2px] bg-gradient-to-r from-[#2a2b30] to-[#45474e] shadow-[-1px_0_2px_rgba(0,0,0,0.4)]" />
        {/* Left Side: Volume Down */}
        <div className="hidden sm:block absolute -left-[3px] top-[204px] h-12 w-[3.5px] rounded-l-[2px] bg-gradient-to-r from-[#2a2b30] to-[#45474e] shadow-[-1px_0_2px_rgba(0,0,0,0.4)]" />
        {/* Right Side: Power Button */}
        <div className="hidden sm:block absolute -right-[3px] top-[135px] h-16 w-[3.5px] rounded-r-[2px] bg-gradient-to-l from-[#2a2b30] to-[#45474e] shadow-[1px_0_2px_rgba(0,0,0,0.4)]" />
        {/* Right Side: Camera Control Sensor (iPhone 16 Pro style) */}
        <div className="hidden sm:block absolute -right-[2.5px] top-[280px] h-14 w-[3px] rounded-r-[2px] bg-gradient-to-l from-[#222327] to-[#3a3b40]" />

        {/* Outer Glass Bezel (Desktop frame only) */}
        <div className="relative overflow-hidden rounded-3xl sm:rounded-[42px] bg-transparent sm:bg-black p-0 sm:p-[2.5px] sm:shadow-inner">
          {/* Inner Display Canvas */}
          <div className="relative flex h-[480px] xs:h-[520px] sm:h-[640px] lg:h-[660px] flex-col overflow-hidden rounded-3xl sm:rounded-[42px] bg-[#efeae2] border border-slate-200/90 dark:border-white/10 sm:border-none shadow-xl shadow-slate-900/10 dark:shadow-black/50 sm:shadow-none">
            {/* ========================================================= */}
            {/* iOS iMessage Push Notification Banner */}
            {/* ========================================================= */}
            <AnimatePresence>
              {showNotification && (
                <motion.div
                  initial={{ opacity: 0, y: -90, scale: 0.92 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -80, scale: 0.94 }}
                  transition={{ type: "spring", stiffness: 450, damping: 28 }}
                  className="absolute top-2.5 left-2.5 right-2.5 z-50 rounded-[24px] border border-black/10 dark:border-white/20 bg-white/95 dark:bg-[#1c1c1e]/95 p-3.5 shadow-[0_16px_36px_-6px_rgba(0,0,0,0.35)] backdrop-blur-2xl text-slate-900 dark:text-white"
                >
                  {/* App header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex h-5 w-5 items-center justify-center rounded-[6px] bg-gradient-to-b from-[#34c759] to-[#28a745] text-white shadow-xs">
                        <MessageSquare className="h-3 w-3 fill-white text-white" />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        MENSAJES
                      </span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500">· ahora</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowNotification(false)}
                      className="rounded-full p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition cursor-pointer"
                      title="Cerrar notificación"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* Sender and message */}
                  <div className="mt-2 text-left">
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-black text-slate-900 dark:text-white">AgendatePY</p>
                      <span className="h-1.5 w-1.5 rounded-full bg-brand" />
                    </div>
                    <p className="mt-0.5 text-xs font-semibold text-slate-700 dark:text-slate-200 leading-snug">
                      ¿Y vos? ¿Qué esperás para usarlo en tu negocio?
                    </p>
                  </div>

                  {/* Call to action */}
                  <Link
                    href="/onboarding"
                    className="mt-2.5 flex items-center justify-between rounded-xl bg-gradient-to-r from-brand to-[#FF6B4A] px-3.5 py-2 text-[11px] font-black text-white shadow-sm hover:brightness-110 active:scale-98 transition group"
                  >
                    <span>Empezar gratis en 3 minutos</span>
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>

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
            {/* 1. iOS 18 STATUS BAR (Desktop Only) */}
            {/* ========================================================= */}
            <div className="relative z-30 hidden sm:flex h-11 items-center justify-between px-7 pt-2 text-[#000000] font-semibold text-[13px] tracking-tight select-none">
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
            <div
              ref={chatScrollRef}
              className="relative z-10 flex-1 overflow-y-auto px-3 py-2 space-y-2.5 scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
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
                        <p className="whitespace-pre-wrap">{renderWhatsAppText(msg.text)}</p>
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
                            <CheckCircle2 className="h-3.5 w-3.5" /> TURNO CONFIRMADO
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
              <div ref={messagesEndRef} className="h-1 w-full shrink-0" />
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
            {/* 5. iOS BOTTOM HOME INDICATOR (Desktop Only) */}
            {/* ========================================================= */}
            <div className="relative z-30 hidden sm:flex h-5 items-center justify-center bg-[#f0f2f5] pb-1">
              <div className="h-1 w-32 rounded-full bg-black/40" />
            </div>
          </div>
        </div>
      </div>

      {/* Floating Widget 1: Top-Left Reminder Alert (Desktop Only) */}
      <motion.div
        initial={{ opacity: 0, x: -20, y: 10 }}
        animate={{ opacity: 1, x: 0, y: [0, -8, 0] }}
        transition={{
          y: { duration: 4, repeat: Infinity, ease: "easeInOut" },
          opacity: { duration: 0.8 },
        }}
        className="pointer-events-none absolute -left-2 sm:-left-4 lg:-left-6 xl:-left-10 top-32 sm:top-40 z-40 hidden sm:flex items-center gap-3 rounded-2xl border border-white/80 dark:border-white/10 bg-white/95 dark:bg-slate-900/95 px-3.5 py-2.5 sm:px-4 sm:py-3 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.15)] backdrop-blur-2xl whitespace-nowrap"
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
          <Bell className="h-5 w-5 animate-pulse" />
        </div>
        <div className="text-left text-xs pr-1">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-slate-900 dark:text-white">Recordatorio 2h Antes</span>
            <span className="rounded-full bg-emerald-500/15 px-1.5 py-0.2 text-[9px] font-black text-emerald-600">Confirmado</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">Sofía confirmó su turno</p>
        </div>
      </motion.div>

      {/* Floating Widget 2: Bottom-Right Instant Transfer (Desktop Only) */}
      <motion.div
        initial={{ opacity: 0, x: 20, y: 10 }}
        animate={{ opacity: 1, x: 0, y: [0, 8, 0] }}
        transition={{
          y: { duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.6 },
          opacity: { duration: 0.8, delay: 0.2 },
        }}
        className="pointer-events-none absolute -right-2 sm:-right-4 lg:-right-6 xl:-right-10 bottom-24 sm:bottom-28 z-40 hidden sm:flex items-center gap-3 rounded-2xl border border-white/80 dark:border-white/10 bg-white/95 dark:bg-slate-900/95 px-3.5 py-2.5 sm:px-4 sm:py-3 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.15)] backdrop-blur-2xl whitespace-nowrap"
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand/15 text-brand dark:text-[#FF6B4A]">
          <Landmark className="h-5 w-5" />
        </div>
        <div className="text-left text-xs pr-1">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-slate-900 dark:text-white">Transferencia recibida</span>
            <span className="rounded-full bg-emerald-500/15 px-1.5 py-0.2 text-[9px] font-black text-emerald-600">Verificado</span>
          </div>
          <p className="text-[11px] font-bold text-emerald-600">Gs. 120.000 ingresado</p>
        </div>
      </motion.div>
    </div>
  );
}
