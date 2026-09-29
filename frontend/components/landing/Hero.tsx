"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
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

const NOTIFICATION_CARDS = [
  {
    id: "reserva",
    icon: CheckCircle2,
    iconBg: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
    title: "Tu reserva está lista",
    badge: "Confirmado",
    badgeColor: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
    desc: "Studio Corte & Barba · Hoy 17:00 hs",
    sub: "Agendado vía WhatsApp al instante",
  },
  {
    id: "sipap",
    icon: Landmark,
    iconBg: "bg-brand/15 text-brand dark:text-[#FF6B4A]",
    title: "Seña SIPAP recibida",
    badge: "Gs. 0 Comisión",
    badgeColor: "bg-brand/15 text-brand dark:text-[#FF6B4A]",
    desc: "Gs. 80.000 · Transferencia bancaria",
    sub: "Comprobante validado en automático",
  },
  {
    id: "recordatorio",
    icon: Bell,
    iconBg: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
    title: "Recordatorio 2h antes",
    badge: "Sin ausencias",
    badgeColor: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
    desc: "Sofía confirmó su asistencia",
    sub: "Aviso enviado automáticamente",
  },
  {
    id: "caja",
    icon: Coins,
    iconBg: "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400",
    title: "Comisión liquidada",
    badge: "Al día",
    badgeColor: "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400",
    desc: "Marcos Benítez · Gs. 450.000",
    sub: "Arqueo de caja y comisiones 100%",
  },
  {
    id: "padel",
    icon: Calendar,
    iconBg: "bg-sky-500/15 text-sky-600 dark:text-sky-400",
    title: "Cancha Techada 1",
    badge: "Reservado",
    badgeColor: "bg-sky-500/15 text-sky-600 dark:text-sky-400",
    desc: "Viernes 19:30 hs · Turno fijado",
    sub: "Seña retenida y confirmada",
  },
];

export default function Hero() {
  const { selectedCategory, setSelectedCategory } = useCategory();

  return (
    <section
      id="inicio"
      className="relative pt-6 sm:pt-14 pb-14 sm:pb-20 lg:pt-16 lg:pb-28 scroll-mt-24 overflow-x-clip max-w-full flex flex-col justify-center min-h-[calc(100vh-80px)]"
    >
      {/* Silicon Valley Ambient Animated Waves & Mesh Gradients */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden select-none -z-10">
        {/* Wave Orb 1: Warm Brand Coral / Peach */}
        <div className="animate-wave-1 absolute -top-[10%] -left-[10%] w-[450px] sm:w-[750px] h-[450px] sm:h-[750px] rounded-full bg-gradient-to-tr from-[#FF4F2B]/25 via-[#FF6B4A]/20 to-amber-300/15 blur-3xl opacity-90" />
        
        {/* Wave Orb 2: Radiant Amber/Gold */}
        <div className="animate-wave-2 absolute top-[20%] -right-[12%] w-[420px] sm:w-[700px] h-[420px] sm:h-[700px] rounded-full bg-gradient-to-br from-amber-400/25 via-orange-400/20 to-rose-400/15 blur-3xl opacity-85" />
        
        {/* Wave Orb 3: Fresh Emerald / Mint */}
        <div className="animate-wave-3 absolute -bottom-[10%] left-[20%] w-[420px] sm:w-[720px] h-[420px] sm:h-[720px] rounded-full bg-gradient-to-t from-emerald-500/20 via-teal-400/15 to-[#FF4F2B]/10 blur-3xl opacity-80" />

        {/* Visible SVG Fluid Wave Ribbons */}
        <div className="absolute inset-x-0 bottom-0 pointer-events-none opacity-45 dark:opacity-20">
          <svg className="w-full h-32 sm:h-48 text-[#FF4F2B]/20" viewBox="0 0 1440 320" fill="none" preserveAspectRatio="none">
            <path fill="currentColor" d="M0,96L48,112C96,128,192,160,288,186.7C384,213,480,235,576,213.3C672,192,768,128,864,128C960,128,1056,192,1152,208C1248,224,1344,192,1392,176L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z" />
          </svg>
        </div>
        <div className="absolute inset-x-0 bottom-0 pointer-events-none opacity-35 dark:opacity-15">
          <svg className="w-full h-24 sm:h-36 text-amber-500/20" viewBox="0 0 1440 320" fill="none" preserveAspectRatio="none">
            <path fill="currentColor" d="M0,192L48,176C96,160,192,128,288,138.7C384,149,480,203,576,224C672,245,768,235,864,202.7C960,171,1056,117,1152,112C1248,107,1344,149,1392,170.7L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z" />
          </svg>
        </div>
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 w-full flex flex-col items-center justify-center text-center">
        {/* ============================================================== */}
        {/* DESKTOP FLOATING CARDS (Side Resources)                        */}
        {/* ============================================================== */}

        {/* Floating Card: Left Top */}
        <motion.div
          initial={{ opacity: 0, x: -30, y: 10 }}
          animate={{ opacity: 1, x: 0, y: [0, -10, 0] }}
          transition={{
            y: { duration: 4.5, repeat: Infinity, ease: "easeInOut" },
            opacity: { duration: 0.8 },
          }}
          className="pointer-events-none absolute -left-2 xl:-left-8 2xl:-left-12 top-4 xl:top-8 z-20 hidden lg:flex items-center gap-3 rounded-2xl border border-white/80 dark:border-white/10 bg-white/95 dark:bg-slate-900/95 px-3.5 py-2.5 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.12)] backdrop-blur-2xl text-left max-w-[240px] xl:max-w-[260px]"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-4.5 w-4.5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-900 dark:text-white text-xs">Tu reserva lista</span>
              <span className="rounded-full bg-emerald-500/15 px-1.5 py-0.2 text-[9px] font-black text-emerald-600">Confirmado</span>
            </div>
            <p className="text-[10.5px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">Studio Barber · 17:00 hs</p>
          </div>
        </motion.div>

        {/* Floating Card: Left Bottom */}
        <motion.div
          initial={{ opacity: 0, x: -30, y: 10 }}
          animate={{ opacity: 1, x: 0, y: [0, 10, 0] }}
          transition={{
            y: { duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.6 },
            opacity: { duration: 0.8, delay: 0.2 },
          }}
          className="pointer-events-none absolute -left-4 xl:-left-10 2xl:-left-16 bottom-14 xl:bottom-16 z-20 hidden lg:flex items-center gap-3 rounded-2xl border border-white/80 dark:border-white/10 bg-white/95 dark:bg-slate-900/95 px-3.5 py-2.5 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.12)] backdrop-blur-2xl text-left max-w-[240px] xl:max-w-[260px]"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400">
            <Coins className="h-4.5 w-4.5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-900 dark:text-white text-xs">Comisión liquidada</span>
              <span className="rounded-full bg-indigo-500/15 px-1.5 py-0.2 text-[9px] font-black text-indigo-600">Al día</span>
            </div>
            <p className="text-[10.5px] font-semibold text-emerald-600 mt-0.5">Marcos B. · Gs. 450.000</p>
          </div>
        </motion.div>

        {/* Floating Card: Right Top */}
        <motion.div
          initial={{ opacity: 0, x: 30, y: 10 }}
          animate={{ opacity: 1, x: 0, y: [0, -12, 0] }}
          transition={{
            y: { duration: 4.8, repeat: Infinity, ease: "easeInOut", delay: 0.3 },
            opacity: { duration: 0.8, delay: 0.1 },
          }}
          className="pointer-events-none absolute -right-2 xl:-right-8 2xl:-right-12 top-4 xl:top-8 z-20 hidden lg:flex items-center gap-3 rounded-2xl border border-white/80 dark:border-white/10 bg-white/95 dark:bg-slate-900/95 px-3.5 py-2.5 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.12)] backdrop-blur-2xl text-left max-w-[240px] xl:max-w-[260px]"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand/15 text-brand dark:text-[#FF6B4A]">
            <Landmark className="h-4.5 w-4.5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-900 dark:text-white text-xs">Seña SIPAP</span>
              <span className="rounded-full bg-emerald-500/15 px-1.5 py-0.2 text-[9px] font-black text-emerald-600">Verificado</span>
            </div>
            <p className="text-[10.5px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">Gs. 80.000 directa</p>
          </div>
        </motion.div>

        {/* Floating Card: Right Bottom */}
        <motion.div
          initial={{ opacity: 0, x: 30, y: 10 }}
          animate={{ opacity: 1, x: 0, y: [0, 10, 0] }}
          transition={{
            y: { duration: 5.2, repeat: Infinity, ease: "easeInOut", delay: 0.8 },
            opacity: { duration: 0.8, delay: 0.3 },
          }}
          className="pointer-events-none absolute -right-4 xl:-right-10 2xl:-right-16 bottom-14 xl:bottom-16 z-20 hidden lg:flex items-center gap-3 rounded-2xl border border-white/80 dark:border-white/10 bg-white/95 dark:bg-slate-900/95 px-3.5 py-2.5 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.12)] backdrop-blur-2xl text-left max-w-[240px] xl:max-w-[260px]"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
            <Bell className="h-4.5 w-4.5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-900 dark:text-white text-xs">Recordatorio 2h</span>
              <span className="rounded-full bg-amber-500/15 px-1.5 py-0.2 text-[9px] font-black text-amber-600">Automático</span>
            </div>
            <p className="text-[10.5px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">Sofía confirmó turno</p>
          </div>
        </motion.div>

        {/* ============================================================== */}
        {/* CENTER HERO COPY: Formatted 3-line Headline & Subtitle        */}
        {/* ============================================================== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-3xl lg:max-w-4xl mx-auto flex flex-col items-center justify-center px-2"
        >
          {/* Main 3-line Formatted Headline */}
          <h1 className="text-4xl xs:text-5xl sm:text-6xl md:text-[64px] lg:text-[72px] xl:text-[80px] font-black tracking-tight text-slate-900 dark:text-white leading-[1.08] sm:leading-[1.03] text-center">
            <span className="block">Gestioná tu agenda</span>
            <span className="block mt-1 sm:mt-1.5">y tu negocio</span>
            <span className="block mt-1 sm:mt-1.5 bg-gradient-to-r from-brand via-[#FF6B4A] to-amber-500 bg-clip-text text-transparent">
              con AgendatePY
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-4 sm:mt-6 max-w-2xl text-base xs:text-lg sm:text-xl lg:text-2xl font-semibold leading-snug sm:leading-relaxed text-slate-600 dark:text-slate-300 text-center">
            Mejor control para tu negocio y tus reservas 24/7
          </p>

          {/* High-Converting CTA Button */}
          <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto">
            <Link
              href="/onboarding"
              className="inline-flex items-center justify-center gap-2.5 px-8 sm:px-10 py-3.5 sm:py-4 text-base sm:text-lg font-black bg-gradient-to-r from-brand to-[#FF6B4A] text-white rounded-full shadow-xl shadow-brand/25 hover:brightness-110 transition-all active:scale-98 w-full sm:w-fit"
            >
              <span>Registrate gratis ahora</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>

          {/* Risk Reversal Guarantee */}
          <div className="mt-3.5 sm:mt-4 flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium text-center">
            <span className="inline-flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
              <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
              <span>14 días gratis</span>
            </span>
            <span>·</span>
            <span>Sin tarjeta</span>
            <span>·</span>
            <span>Activación en 3 min</span>
            <span className="hidden sm:inline">·</span>
            <span className="hidden sm:inline">Soporte en Guaraníes</span>
          </div>

          {/* Rubro Category Pills */}
          <div className="mt-7 sm:mt-8 w-full max-w-3xl pt-5 border-t border-slate-200/60 dark:border-white/5">
            <p className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 text-center">
              Solución a medida para tu rubro:
            </p>

            {/* Mobile Ticker */}
            <div className="sm:hidden relative overflow-hidden max-w-full ticker-mask py-1">
              <div className="ticker-track flex w-max gap-2 py-1 hover:[animation-play-state:paused] active:[animation-play-state:paused]">
                {[...CATEGORIES, ...CATEGORIES].map((item, idx) => {
                  const Icon = ICONS[item.id] || Scissors;
                  const active = selectedCategory === item.id;
                  return (
                    <button
                      key={`mob-${item.id}-${idx}`}
                      type="button"
                      onClick={() => setSelectedCategory(item.id)}
                      className={`group inline-flex shrink-0 items-center gap-2 rounded-2xl border px-3.5 py-2 text-xs font-semibold transition-all duration-200 active:scale-95 cursor-pointer whitespace-nowrap ${
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

            {/* Desktop Wrapped Pills */}
            <div className="hidden sm:flex flex-wrap items-center justify-center gap-2 py-1">
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
      </div>

      {/* ============================================================== */}
      {/* MOBILE / TABLET NOTIFICATION CARDS CAROUSEL                   */}
      {/* ============================================================== */}
      <div className="mt-8 sm:mt-10 lg:hidden relative w-full overflow-hidden ticker-mask py-2">
        <div className="ticker-track flex w-max gap-3 px-3 hover:[animation-play-state:paused] active:[animation-play-state:paused]">
          {[...NOTIFICATION_CARDS, ...NOTIFICATION_CARDS].map((card, idx) => {
            const Icon = card.icon;
            return (
              <div
                key={`car-${card.id}-${idx}`}
                className="flex shrink-0 items-center gap-3 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/90 dark:bg-slate-900/90 px-4 py-3 shadow-md shadow-slate-900/5 backdrop-blur-xl max-w-[280px]"
              >
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${card.iconBg}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="text-left min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {card.title}
                    </span>
                    <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-extrabold ${card.badgeColor}`}>
                      {card.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate mt-0.5">
                    {card.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

