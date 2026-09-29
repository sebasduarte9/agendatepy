"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  CalendarCheck,
  Landmark,
  Bell,
  Coins,
  Calendar,
  Sparkles,
  Scissors,
  Smile,
  StretchHorizontal,
  Flower2,
  Stethoscope,
  PawPrint,
  Dumbbell,
  Wrench,
  Trophy,
} from "lucide-react";
import { CATEGORIES, type CategoryId } from "@/lib/categories";
import { useCategory } from "@/context/CategoryContext";
import PhoneMockup from "./PhoneMockup";

const ICONS: Record<CategoryId, typeof Scissors> = {
  peluqueria: Scissors,
  odontologia: Smile,
  pilates: StretchHorizontal,
  spas: Flower2,
  medicos: Stethoscope,
  veterinarias: PawPrint,
  gimnasios: Dumbbell,
  talleres: Wrench,
  padel: Trophy,
};

const ROW1_CARDS = [
  {
    id: "pago",
    icon: CheckCircle2,
    iconBg: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400",
    title: "Pago recibido",
    badge: "Verificado",
    badgeColor: "bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300",
  },
  {
    id: "qr",
    icon: Sparkles,
    iconBg: "bg-violet-50 text-violet-600 dark:bg-violet-950/50 dark:text-violet-400",
    title: "Cobro QR",
    badge: "Instantáneo",
    badgeColor: "bg-violet-100 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300",
  },
  {
    id: "sipap",
    icon: Landmark,
    iconBg: "bg-orange-50 text-brand dark:bg-orange-950/50 dark:text-[#FF6B4A]",
    title: "Seña SIPAP",
    badge: "Gs. 80.000",
    badgeColor: "bg-orange-100 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300",
  },
];

const ROW2_CARDS = [
  {
    id: "reserva",
    icon: CalendarCheck,
    iconBg: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400",
    title: "Reserva confirmada",
    badge: "24/7",
    badgeColor: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300",
  },
  {
    id: "recordatorio",
    icon: Bell,
    iconBg: "bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400",
    title: "Recordatorio 2h",
    badge: "Sin ausencias",
    badgeColor: "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300",
  },
  {
    id: "padel",
    icon: Calendar,
    iconBg: "bg-sky-50 text-sky-600 dark:bg-sky-950/50 dark:text-sky-400",
    title: "Pádel Cancha 1",
    badge: "Reservado",
    badgeColor: "bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300",
  },
];

export default function Hero() {
  const { selectedCategory, setSelectedCategory } = useCategory();

  return (
    <section
      id="inicio"
      className="relative pt-3 sm:pt-8 pb-10 sm:pb-16 lg:pt-10 lg:pb-20 scroll-mt-24 overflow-x-clip max-w-full"
    >
      {/* Fondo con puntos difuminados en movimiento suave */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden select-none -z-10">
        <div className="animate-wave-1 absolute -top-[12%] -left-[8%] w-[420px] sm:w-[680px] h-[420px] sm:h-[680px] rounded-full bg-gradient-to-tr from-[#FF4F2B]/20 via-[#FF6B4A]/15 to-transparent blur-3xl opacity-85" />
        <div className="animate-wave-2 absolute top-[20%] -right-[10%] w-[380px] sm:w-[640px] h-[380px] sm:h-[640px] rounded-full bg-gradient-to-br from-amber-400/20 via-orange-400/12 to-transparent blur-3xl opacity-80" />
        <div className="animate-wave-3 absolute bottom-[10%] left-[20%] w-[380px] sm:w-[620px] h-[380px] sm:h-[620px] rounded-full bg-gradient-to-t from-emerald-500/15 via-teal-400/10 to-transparent blur-3xl opacity-75" />
      </div>

      <div className="relative mx-auto max-w-7xl px-3 sm:px-6">
        {/* ============================================================== */}
        {/* TABLET & DESKTOP LAYOUT (md: and up): Mockup 3D interactivo    */}
        {/* ============================================================== */}
        <div className="hidden md:grid items-center gap-6 lg:gap-12 md:grid-cols-12 min-h-[calc(100vh-130px)]">
          {/* Columna Izquierda Desktop/Tablet */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
            className="md:col-span-7 flex flex-col justify-center text-left min-w-0"
          >
            {/* Badge pill Desktop */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand/10 dark:bg-brand/20 border border-brand/20 text-brand dark:text-[#FF6B4A] text-xs lg:text-sm font-bold tracking-wide mb-4 w-fit">
              <Sparkles className="h-4 w-4" />
              <span>Plataforma #1 en Paraguay para Reservas y Cobros</span>
            </div>

            {/* Headline Desktop */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.14]">
              <span className="font-extrabold text-slate-900 dark:text-white">Gestioná tu agenda</span>{" "}
              <span className="font-medium text-slate-700 dark:text-slate-300">y negocio con</span>{" "}
              <span className="block mt-1.5 font-black bg-gradient-to-r from-brand via-[#FF6B4A] to-amber-500 bg-clip-text text-transparent">
                AgendatePY
              </span>
            </h1>

            {/* Subtítulo Desktop */}
            <p className="mt-5 max-w-xl text-lg md:text-xl lg:text-2xl font-bold leading-relaxed text-slate-800 dark:text-slate-100">
              Mejor control para tu negocio y tus reservas <span className="text-brand font-extrabold">24/7</span>
            </p>
            <p className="mt-2.5 max-w-xl text-base lg:text-lg font-normal leading-relaxed text-slate-600 dark:text-slate-300">
              Agendamiento automático por WhatsApp sin intermediarios, cobro de señas por SIPAP y recordatorios que eliminan las ausencias.
            </p>

            {/* CTA Desktop */}
            <div className="mt-7 flex items-center gap-3">
              <Link
                href="/onboarding"
                className="inline-flex items-center justify-center gap-2.5 px-8 lg:px-9 py-4 text-base lg:text-lg font-black bg-gradient-to-r from-brand to-[#FF6B4A] text-white rounded-full shadow-lg shadow-brand/25 hover:brightness-110 transition-all active:scale-98 w-fit"
              >
                <span>Registrate gratis ahora</span>
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>

            {/* Garantías de confianza Desktop */}
            <div className="mt-4 flex items-center gap-3 text-xs lg:text-sm text-slate-500 dark:text-slate-400 font-medium">
              <span className="inline-flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>14 días gratis</span>
              </span>
              <span>·</span>
              <span>Sin tarjeta</span>
              <span>·</span>
              <span>Activación en 3 min</span>
              <span>·</span>
              <span>Soporte en Guaraníes</span>
            </div>

            {/* Selector de Rubros Desktop */}
            <div className="mt-7 pt-4 border-t border-slate-200/60 dark:border-white/5 w-full">
              <p className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2.5">
                Solución a medida para tu rubro:
              </p>
              <div className="flex flex-wrap items-center gap-2 py-1">
                {CATEGORIES.map((item) => {
                  const Icon = ICONS[item.id] || Scissors;
                  const active = selectedCategory === item.id;
                  return (
                    <button
                      key={`desk-${item.id}`}
                      type="button"
                      onClick={() => setSelectedCategory(item.id)}
                      className={`group inline-flex shrink-0 items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-all duration-200 active:scale-95 cursor-pointer whitespace-nowrap ${
                        active
                          ? "border-brand bg-gradient-to-r from-brand to-[#FF6B4A] text-white shadow-md shadow-brand/25 font-bold scale-[1.02]"
                          : "border-slate-200/90 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-brand/40 hover:bg-slate-50 dark:hover:bg-slate-800/80 shadow-xs"
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>

          {/* Columna Derecha Tablet/Desktop: Mockup 3D Interactivo */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
            className="md:col-span-5 flex justify-center max-w-full"
          >
            <div className="scale-[0.84] lg:scale-100 origin-center">
              <PhoneMockup />
            </div>
          </motion.div>
        </div>

        {/* ============================================================== */}
        {/* MOBILE LAYOUT (< md): Exclusivo para teléfonos                 */}
        {/* ============================================================== */}
        <div className="md:hidden flex flex-col justify-start gap-5 xs:gap-6 min-h-[calc(100svh-76px)] text-left w-full pt-1 pb-4">
          {/* Bloque Superior: Pill + Titular con 3 renglones destacados y separados + Cards ticker en paralelo */}
          <div className="pt-1">
            {/* Pill badge superior */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand/10 dark:bg-brand/20 border border-brand/20 text-brand dark:text-[#FF6B4A] text-xs font-bold tracking-wide uppercase mb-3 backdrop-blur-xs">
              <Sparkles className="h-3.5 w-3.5 text-brand" />
              <span>Gestión 24/7 en Paraguay</span>
            </div>

            <div className="relative w-full pt-0.5 pb-2 overflow-x-clip">
              {/* Layer de Cards HORIZONTALES animadas a la derecha con difuminación suave hacia las letras */}
              <div className="absolute right-0 -top-1 bottom-0 w-[50%] xs:w-[46%] pointer-events-none select-none overflow-hidden fade-to-letters-mask flex flex-col justify-center gap-2.5 -mr-2">
                {/* Fila 1 Horizontal: Pago recibido (Verificado), Cobro QR, Seña SIPAP */}
                <div className="flex w-max gap-2 animate-ticker-left">
                  {[...ROW1_CARDS, ...ROW1_CARDS, ...ROW1_CARDS].map((card, idx) => {
                    const Icon = card.icon;
                    return (
                      <div
                        key={`mob-h1-${card.id}-${idx}`}
                        className="flex shrink-0 items-center gap-2 rounded-2xl border border-slate-200/90 dark:border-white/10 bg-white/95 dark:bg-slate-900/95 px-3 py-2 shadow-sm backdrop-blur-md"
                      >
                        <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-xl ${card.iconBg}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 text-left">
                          <p className="text-xs font-bold text-slate-900 dark:text-white truncate leading-tight">
                            {card.title}
                          </p>
                          <span className={`inline-block rounded-full px-2 py-0.5 text-[9px] font-extrabold mt-0.5 ${card.badgeColor}`}>
                            {card.badge}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Fila 2 Horizontal: Reserva confirmada (24/7), Recordatorio 2h, Pádel Cancha 1 */}
                <div className="flex w-max gap-2 animate-ticker-right">
                  {[...ROW2_CARDS, ...ROW2_CARDS, ...ROW2_CARDS].map((card, idx) => {
                    const Icon = card.icon;
                    return (
                      <div
                        key={`mob-h2-${card.id}-${idx}`}
                        className="flex shrink-0 items-center gap-2 rounded-2xl border border-slate-200/90 dark:border-white/10 bg-white/95 dark:bg-slate-900/95 px-3 py-2 shadow-sm backdrop-blur-md"
                      >
                        <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-xl ${card.iconBg}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 text-left">
                          <p className="text-xs font-bold text-slate-900 dark:text-white truncate leading-tight">
                            {card.title}
                          </p>
                          <span className={`inline-block rounded-full px-2 py-0.5 text-[9px] font-extrabold mt-0.5 ${card.badgeColor}`}>
                            {card.badge}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Titular en primer plano con letras variadas, más grandes y con mayor separación vertical */}
              <div className="relative z-10 max-w-[82%] pointer-events-auto">
                <h1 className="text-left">
                  <span className="block text-[28px] xs:text-[34px] sm:text-[38px] font-black text-slate-900 dark:text-white leading-[1.2] tracking-tight">
                    Gestioná tu agenda
                  </span>
                  <span className="block text-[24px] xs:text-[29px] sm:text-[32px] font-semibold text-slate-700 dark:text-slate-300 tracking-normal mt-2 leading-[1.2]">
                    y tu negocio con
                  </span>
                  <span className="block text-[34px] xs:text-[42px] sm:text-[48px] font-black tracking-tight bg-gradient-to-r from-brand via-[#FF6B4A] to-amber-500 bg-clip-text text-transparent drop-shadow-xs mt-2.5 leading-[1.15]">
                    AgendatePY
                  </span>
                </h1>
              </div>
            </div>
          </div>

          {/* Bloque Central: Ocupa el espacio vertical de manera legible, estructurada y sin huecos vacíos */}
          <div className="flex flex-col gap-4">
            {/* Tarjeta de propuesta de valor con tipografía más grande y espaciada */}
            <div className="rounded-2xl border border-white/80 dark:border-white/10 bg-white/70 dark:bg-slate-900/60 p-4 xs:p-5 shadow-sm backdrop-blur-md">
              <h2 className="text-base xs:text-lg sm:text-xl font-bold text-slate-900 dark:text-white leading-snug tracking-tight">
                Mejor control para tu negocio y tus reservas <span className="text-brand dark:text-[#FF6B4A] font-extrabold">24/7</span>
              </h2>
              <p className="mt-2 text-sm xs:text-[15px] font-medium leading-relaxed text-slate-600 dark:text-slate-300">
                Agendamiento 100% automático por <strong className="text-emerald-600 dark:text-emerald-400 font-semibold">WhatsApp</strong>, cobro de señas por <strong className="text-orange-600 dark:text-orange-400 font-semibold">SIPAP</strong> y cero ausencias.
              </p>

              {/* Beneficios directos para enriquecer la lectura y ocupar el espacio vertical */}
              <div className="mt-3.5 pt-3 border-t border-slate-200/60 dark:border-white/5 flex flex-col gap-2.5">
                <div className="flex items-center gap-2.5 text-xs xs:text-sm text-slate-700 dark:text-slate-300">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 font-bold text-[11px]">✓</span>
                  <span><strong>Confirmación inmediata</strong> en el WhatsApp del cliente</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs xs:text-sm text-slate-700 dark:text-slate-300">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 font-bold text-[11px]">✓</span>
                  <span><strong>Señas SIPAP / QR</strong> verificadas antes de agendar</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs xs:text-sm text-slate-700 dark:text-slate-300">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-sky-100 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 font-bold text-[11px]">✓</span>
                  <span><strong>Recordatorios 24/7</strong> para asegurar asistencia</span>
                </div>
              </div>
            </div>

            {/* CTA Principal destacado */}
            <div className="flex flex-col gap-2.5">
              <Link
                href="/onboarding"
                className="inline-flex items-center justify-center gap-2.5 px-6 py-4 text-base xs:text-lg font-black bg-gradient-to-r from-brand to-[#FF6B4A] text-white rounded-full shadow-lg shadow-brand/25 hover:brightness-110 transition-all active:scale-98 w-full"
              >
                <span>Registrate gratis ahora</span>
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>

            {/* Garantías y sellos de confianza distribuidos en 3 columnas */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-xl border border-slate-200/60 dark:border-white/5 bg-white/60 dark:bg-slate-900/60 py-2.5 px-2 backdrop-blur-xs shadow-xs">
                <span className="flex items-center justify-center gap-1 text-[11px] xs:text-xs font-bold text-slate-800 dark:text-slate-200">
                  <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
                  14 días gratis
                </span>
              </div>
              <div className="rounded-xl border border-slate-200/60 dark:border-white/5 bg-white/60 dark:bg-slate-900/60 py-2.5 px-2 backdrop-blur-xs shadow-xs">
                <span className="text-[11px] xs:text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Sin tarjeta
                </span>
              </div>
              <div className="rounded-xl border border-slate-200/60 dark:border-white/5 bg-white/60 dark:bg-slate-900/60 py-2.5 px-2 backdrop-blur-xs shadow-xs">
                <span className="text-[11px] xs:text-xs font-semibold text-slate-700 dark:text-slate-300">
                  En 3 minutos
                </span>
              </div>
            </div>
          </div>

          {/* Selector de Rubros Mobile: Empujado hacia el fondo */}
          <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-white/5 w-full">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5 text-left">
              Solución a medida para tu rubro:
            </p>
            <div className="relative overflow-hidden max-w-full ticker-mask py-0.5">
              <div className="ticker-track flex w-max gap-2 py-0.5 hover:[animation-play-state:paused] active:[animation-play-state:paused]">
                {[...CATEGORIES, ...CATEGORIES].map((item, idx) => {
                  const Icon = ICONS[item.id] || Scissors;
                  const active = selectedCategory === item.id;
                  return (
                    <button
                      key={`mob-cat-${item.id}-${idx}`}
                      type="button"
                      onClick={() => setSelectedCategory(item.id)}
                      className={`group inline-flex shrink-0 items-center gap-2 rounded-2xl border px-3 py-1.5 text-xs font-semibold transition-all duration-200 active:scale-95 cursor-pointer whitespace-nowrap ${
                        active
                          ? "border-brand bg-gradient-to-r from-brand to-[#FF6B4A] text-white shadow-md shadow-brand/25 font-bold scale-[1.02]"
                          : "border-slate-200/90 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-brand/40 hover:bg-slate-50 dark:hover:bg-slate-800/80 shadow-xs"
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* En mobile: La simulación interactiva de WhatsApp SOLO al scrollear hacia abajo, fuera del primer pantallazo */}
        <div className="md:hidden relative mt-28 pt-16 border-t border-slate-200/60 dark:border-white/5 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-400 mb-2.5 backdrop-blur-md">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Simulación Interactiva</span>
          </div>
          <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
            Mirá cómo reservan en segundos
          </h3>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-6">
            100% integrado a WhatsApp.
          </p>
          <div className="w-full flex justify-center max-w-full">
            <PhoneMockup />
          </div>
        </div>
      </div>
    </section>
  );
}


