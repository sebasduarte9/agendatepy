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
      <div className="relative mx-auto grid max-w-7xl items-center gap-8 sm:gap-12 px-3 sm:px-6 lg:grid-cols-12">
        {/* Left Column: High-Converting Value Proposition */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-7 flex flex-col justify-center min-w-0 min-h-[calc(100svh-100px)] sm:min-h-0 pb-4 sm:pb-0"
        >
          {/* Headline */}
          <h1 className="text-[28px] xs:text-3xl sm:text-4xl lg:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.12] sm:leading-[1.08] break-words">
            Gestioná tu agenda y negocio con{" "}
            <span className="bg-gradient-to-r from-brand via-[#FF6B4A] to-amber-500 bg-clip-text text-transparent">
              AgendatePY
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-2.5 sm:mt-4 max-w-2xl text-base sm:text-lg font-medium leading-relaxed text-slate-600 dark:text-slate-300">
            Mejor control para tu negocio y tus reservas 24/7
          </p>

          {/* High-Converting CTAs */}
          <div className="mt-5 sm:mt-7 flex flex-col sm:flex-row sm:items-center gap-3">
            {/* Registration CTA Button */}
            <Link
              href="/onboarding"
              className="inline-flex items-center justify-center gap-2 px-6 sm:px-7 py-3 sm:py-3.5 text-sm sm:text-base font-bold bg-gradient-to-r from-brand to-[#FF6B4A] text-white rounded-full shadow-lg shadow-brand/25 hover:brightness-110 transition active:scale-98 w-full sm:w-fit"
            >
              <span>Registrate gratis ahora</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Risk Reversal Guarantee */}
          <div className="mt-3.5 flex flex-wrap items-center gap-2 sm:gap-3 text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium">
            <span className="inline-flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
              <ShieldCheck className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-500 shrink-0" />
              <span className="inline sm:hidden">14 días gratis</span>
              <span className="hidden sm:inline">14 días sin costo</span>
            </span>
            <span>·</span>
            <span>Sin tarjeta</span>
            <span>·</span>
            <span className="inline sm:hidden">En 3 min</span>
            <span className="hidden sm:inline">Activación en 3 min</span>
            <span className="hidden sm:inline">·</span>
            <span className="hidden sm:inline">Soporte en Guaraníes</span>
          </div>

          {/* Interactive Category Selector */}
          <div className="mt-6 pt-5 border-t border-slate-200/60 dark:border-white/5">
            <div className="mb-2.5">
              <p className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
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
                      className={`group inline-flex shrink-0 items-center gap-2 rounded-2xl border px-3 py-1.5 text-xs font-semibold transition-all duration-200 active:scale-95 cursor-pointer whitespace-nowrap ${
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
        </motion.div>

        {/* Right Column: Chat Mockup with Scroll-Triggered Reveal on Mobile */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-20px" }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-5 flex justify-center mt-10 lg:mt-0 max-w-full"
        >
          <PhoneMockup />
        </motion.div>
      </div>
    </section>
  );
}
