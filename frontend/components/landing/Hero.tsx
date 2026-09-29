"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Scissors,
  Smile,
  StretchHorizontal,
  Flower2,
  Stethoscope,
  PawPrint,
  Dumbbell,
  Wrench,
  Trophy,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  Landmark,
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

export default function Hero() {
  const { selectedCategory, setSelectedCategory } = useCategory();

  return (
    <section id="inicio" className="relative pt-3 sm:pt-10 pb-12 sm:pb-16 lg:pt-12 lg:pb-24 scroll-mt-24 overflow-x-clip max-w-full">
      {/* Silicon Valley Ambient Animated Waves & Mesh Gradients */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden select-none -z-10">
        {/* Wave Orb 1: Warm Brand Coral / Peach */}
        <div className="animate-wave-1 absolute -top-[12%] -left-[10%] w-[420px] sm:w-[720px] h-[420px] sm:h-[720px] rounded-full bg-gradient-to-tr from-[#FF4F2B]/25 via-[#FF6B4A]/20 to-amber-300/15 blur-3xl opacity-90" />
        
        {/* Wave Orb 2: Radiant Amber/Gold */}
        <div className="animate-wave-2 absolute top-[20%] -right-[12%] w-[380px] sm:w-[660px] h-[380px] sm:h-[660px] rounded-full bg-gradient-to-br from-amber-400/25 via-orange-400/20 to-rose-400/15 blur-3xl opacity-85" />
        
        {/* Wave Orb 3: Fresh Emerald / Mint */}
        <div className="animate-wave-3 absolute -bottom-[12%] left-[15%] w-[400px] sm:w-[680px] h-[400px] sm:h-[680px] rounded-full bg-gradient-to-t from-emerald-500/20 via-teal-400/15 to-[#FF4F2B]/10 blur-3xl opacity-80" />

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

      <div className="relative mx-auto grid max-w-7xl items-center gap-8 sm:gap-12 px-3 sm:px-6 lg:grid-cols-12">
        {/* Left Column: High-Converting Value Proposition */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-7 flex flex-col justify-center min-w-0"
        >
          {/* Scaled-up Headline */}
          <h1 className="text-3xl xs:text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.08] sm:leading-[1.04] break-words">
            Gestioná tu agenda y negocio con{" "}
            <span className="bg-gradient-to-r from-brand via-[#FF6B4A] to-amber-500 bg-clip-text text-transparent">
              AgendatePY
            </span>
          </h1>

          {/* Scaled-up Subtitle */}
          <p className="mt-3 sm:mt-5 max-w-2xl text-lg sm:text-xl lg:text-2xl font-semibold leading-snug text-slate-700 dark:text-slate-200">
            Mejor control para tu negocio y tus reservas 24/7
          </p>

          {/* High-Converting CTAs */}
          <div className="mt-5 sm:mt-7 flex flex-col sm:flex-row sm:items-center gap-3">
            {/* Registration CTA Button */}
            <Link
              href="/onboarding"
              className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 sm:py-4 text-base sm:text-lg font-bold bg-gradient-to-r from-brand to-[#FF6B4A] text-white rounded-full shadow-lg shadow-brand/25 hover:brightness-110 transition active:scale-98 w-full sm:w-fit"
            >
              <span>Registrate gratis ahora</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>

          {/* Risk Reversal Guarantee */}
          <div className="mt-3.5 flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
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

          {/* Interactive Category Selector with Infinite Ticker Motion on Mobile */}
          <div className="mt-5 sm:mt-6 pt-4 border-t border-slate-200/60 dark:border-white/5">
            <div className="mb-2">
              <p className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Seleccioná tu rubro para ver el ejemplo:
              </p>
            </div>

            {/* Mobile: Infinite sliding track with ticker motion */}
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
                      <span
                        className={`flex h-6 w-6 items-center justify-center rounded-lg transition-colors ${
                          active
                            ? "bg-white/20 text-white"
                            : "bg-brand/10 text-brand dark:text-[#FF6B4A] group-hover:bg-brand/15"
                        }`}
                      >
                        <Icon className="h-3.5 w-3.5" />
                      </span>
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Desktop: Clean wrapped pill grid */}
            <div className="hidden sm:flex flex-wrap gap-2 py-1">
              {CATEGORIES.map((item) => {
                const Icon = ICONS[item.id] || Scissors;
                const active = selectedCategory === item.id;
                return (
                  <button
                    key={`desk-${item.id}`}
                    type="button"
                    onClick={() => setSelectedCategory(item.id)}
                    className={`group inline-flex shrink-0 items-center gap-2 rounded-full border px-3.5 py-2 text-xs font-semibold transition-all duration-200 active:scale-95 cursor-pointer whitespace-nowrap ${
                      active
                        ? "border-brand bg-gradient-to-r from-brand to-[#FF6B4A] text-white shadow-md shadow-brand/25 font-bold scale-[1.02]"
                        : "border-slate-200/90 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-brand/40 hover:bg-slate-50 dark:hover:bg-slate-800/80 shadow-xs"
                    }`}
                  >
                    <span
                      className={`flex h-6 w-6 items-center justify-center rounded-lg transition-colors ${
                        active
                          ? "bg-white/20 text-white"
                          : "bg-brand/10 text-brand dark:text-[#FF6B4A] group-hover:bg-brand/15"
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </span>
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Artistic Real-Life Booking Cards (Matching PC Mockup Widgets) */}
          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="group flex items-center gap-3 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/85 dark:bg-slate-900/80 p-3 sm:p-3.5 backdrop-blur-xl shadow-md shadow-slate-900/5 hover:border-emerald-500/40 hover:shadow-lg transition-all"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div className="text-left min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                    Tu reserva está lista
                  </span>
                  <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[9px] font-extrabold text-emerald-600 dark:text-emerald-400">
                    Confirmado
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate mt-0.5">
                  Agendado vía WhatsApp sin demoras
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="group flex items-center gap-3 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/85 dark:bg-slate-900/80 p-3 sm:p-3.5 backdrop-blur-xl shadow-md shadow-slate-900/5 hover:border-brand/40 hover:shadow-lg transition-all"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand/15 text-brand dark:text-[#FF6B4A]">
                <Landmark className="h-5 w-5" />
              </div>
              <div className="text-left min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                    Seña SIPAP recibida
                  </span>
                  <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[9px] font-extrabold text-emerald-600 dark:text-emerald-400">
                    Verificado
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate mt-0.5">
                  Gs. 0 comisión · Ingreso directo
                </p>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Right Column: Chat Mockup with Scroll-Triggered Reveal */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-5 flex justify-center mt-6 lg:mt-0 max-w-full"
        >
          <PhoneMockup />
        </motion.div>
      </div>
    </section>
  );
}
