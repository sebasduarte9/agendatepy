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

const NOTIFICATION_CARDS = [
  {
    id: "reserva",
    icon: CheckCircle2,
    iconBg: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
    borderHover: "hover:border-emerald-500/40",
    title: "Tu reserva lista",
    badge: "Confirmado",
    badgeColor: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
    desc: "Studio Barber · Hoy 17:00 hs",
    sub: "Agendado vía WhatsApp sin demoras",
  },
  {
    id: "sipap",
    icon: Landmark,
    iconBg: "bg-brand/15 text-brand dark:text-[#FF6B4A]",
    borderHover: "hover:border-brand/40",
    title: "Seña SIPAP recibida",
    badge: "Gs. 0 Comisión",
    badgeColor: "bg-brand/15 text-brand dark:text-[#FF6B4A]",
    desc: "Gs. 80.000 · Transferencia directa",
    sub: "Comprobante validado al instante",
  },
  {
    id: "recordatorio",
    icon: Bell,
    iconBg: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
    borderHover: "hover:border-amber-500/40",
    title: "Recordatorio 2h antes",
    badge: "Sin ausencias",
    badgeColor: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
    desc: "Sofía confirmó asistencia",
    sub: "Aviso enviado automáticamente",
  },
  {
    id: "caja",
    icon: Coins,
    iconBg: "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400",
    borderHover: "hover:border-indigo-500/40",
    title: "Comisión liquidada",
    badge: "Al día",
    badgeColor: "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400",
    desc: "Marcos B. · Gs. 450.000",
    sub: "Cálculo automático de caja",
  },
  {
    id: "padel",
    icon: Calendar,
    iconBg: "bg-sky-500/15 text-sky-600 dark:text-sky-400",
    borderHover: "hover:border-sky-500/40",
    title: "Cancha Techada 1",
    badge: "Reservado",
    badgeColor: "bg-sky-500/15 text-sky-600 dark:text-sky-400",
    desc: "Viernes 19:30 hs · Turno fijado",
    sub: "Seña validada y retenida",
  },
];

export default function Hero() {
  const { selectedCategory, setSelectedCategory } = useCategory();

  return (
    <section
      id="inicio"
      className="relative pt-4 sm:pt-10 pb-12 sm:pb-20 lg:pt-12 lg:pb-24 scroll-mt-24 overflow-x-clip max-w-full"
    >
      {/* Fondo con puntos difuminados en movimiento suave (Sin olas estáticas) */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden select-none -z-10">
        {/* Punto Difuminado 1: Warm Brand Coral */}
        <div className="animate-wave-1 absolute -top-[12%] -left-[8%] w-[420px] sm:w-[680px] h-[420px] sm:h-[680px] rounded-full bg-gradient-to-tr from-[#FF4F2B]/20 via-[#FF6B4A]/15 to-transparent blur-3xl opacity-85" />
        
        {/* Punto Difuminado 2: Radiant Amber/Gold */}
        <div className="animate-wave-2 absolute top-[20%] -right-[10%] w-[380px] sm:w-[640px] h-[380px] sm:h-[640px] rounded-full bg-gradient-to-br from-amber-400/20 via-orange-400/12 to-transparent blur-3xl opacity-80" />
        
        {/* Punto Difuminado 3: Fresh Emerald / Mint */}
        <div className="animate-wave-3 absolute bottom-[10%] left-[20%] w-[380px] sm:w-[620px] h-[380px] sm:h-[620px] rounded-full bg-gradient-to-t from-emerald-500/15 via-teal-400/10 to-transparent blur-3xl opacity-75" />
      </div>

      {/* Pantalla Inicial: Texto pegado a la izquierda + Cards de Notificaciones más pequeñas a la derecha */}
      <div className="relative mx-auto max-w-7xl px-3 sm:px-6 grid items-center gap-6 lg:gap-12 lg:grid-cols-12 lg:min-h-[calc(100vh-140px)]">
        {/* Columna Izquierda: Formato 3 líneas alineado a la izquierda */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-7 flex flex-col justify-center text-left min-w-0 w-full"
        >
          {/* Headline en 3 líneas con degradado en AgendatePY */}
          <h1 className="text-3xl xs:text-4xl sm:text-5xl lg:text-6xl xl:text-[68px] font-black tracking-tight text-slate-900 dark:text-white leading-[1.08] sm:leading-[1.03] text-left">
            <span className="block">Gestioná tu agenda</span>
            <span className="block mt-1 sm:mt-1.5">y tu negocio</span>
            <span className="block mt-1 sm:mt-1.5 bg-gradient-to-r from-brand via-[#FF6B4A] to-amber-500 bg-clip-text text-transparent">
              con AgendatePY
            </span>
          </h1>

          {/* Subtítulo */}
          <p className="mt-3 sm:mt-4 max-w-xl text-base sm:text-lg lg:text-xl font-semibold leading-relaxed text-slate-600 dark:text-slate-300 text-left">
            Mejor control para tu negocio y tus reservas 24/7
          </p>

          {/* CTA Principal */}
          <div className="mt-5 sm:mt-6 flex flex-col sm:flex-row items-start gap-3">
            <Link
              href="/onboarding"
              className="inline-flex items-center justify-center gap-2.5 px-7 sm:px-8 py-3.5 text-base sm:text-lg font-black bg-gradient-to-r from-brand to-[#FF6B4A] text-white rounded-full shadow-lg shadow-brand/25 hover:brightness-110 transition-all active:scale-98 w-full sm:w-fit"
            >
              <span>Registrate gratis ahora</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>

          {/* Garantías de confianza */}
          <div className="mt-3.5 flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium text-left">
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

          {/* Selector de Rubros */}
          <div className="mt-6 pt-4 border-t border-slate-200/60 dark:border-white/5 w-full">
            <p className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2.5 text-left">
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

            {/* Desktop Wrapped Pills */}
            <div className="hidden sm:flex flex-wrap items-center gap-2 py-1">
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

        {/* Columna Derecha: Cards de notificaciones más pequeñas y estilizadas */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.65, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-5 flex flex-col gap-2.5 sm:gap-3 justify-center w-full max-w-md mx-auto lg:max-w-none"
        >
          {NOTIFICATION_CARDS.map((card, idx) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.1 + idx * 0.08 }}
                className={`group flex items-center gap-3 rounded-2xl border border-slate-200/85 dark:border-white/10 bg-white/90 dark:bg-slate-900/90 p-2.5 sm:p-3 shadow-xs hover:shadow-md ${card.borderHover} transition-all duration-200 backdrop-blur-xl hover:translate-x-1`}
              >
                <div className={`flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl ${card.iconBg} shadow-inner`}>
                  <Icon className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-center justify-between gap-1.5">
                    <span className="text-xs sm:text-[13px] font-bold text-slate-900 dark:text-white truncate">
                      {card.title}
                    </span>
                    <span className={`shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-extrabold ${card.badgeColor}`}>
                      {card.badge}
                    </span>
                  </div>
                  <p className="text-[10.5px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate mt-0.5">
                    {card.desc}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* Sección con Scroll Reveal: La Card / Simulación interactiva de WhatsApp SOLO se muestra al scrollear */}
      <div className="relative mt-12 sm:mt-20 pt-10 sm:pt-14 border-t border-slate-200/60 dark:border-white/5">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center justify-center text-center px-3 sm:px-6"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3.5 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-400 mb-3 backdrop-blur-md">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Simulación Interactiva de WhatsApp</span>
          </div>

          <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Mirá cómo reservan y pagan tus clientes en segundos
          </h3>

          <p className="mt-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-lg mb-8">
            Sin formularios lentos ni aplicaciones que descargar. 100% integrado a WhatsApp.
          </p>

          <div className="w-full flex justify-center max-w-full">
            <PhoneMockup />
          </div>
        </motion.div>
      </div>
    </section>
  );
}


