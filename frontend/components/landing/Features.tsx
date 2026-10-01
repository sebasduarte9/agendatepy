"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle,
  Award,
  Users,
  Layers,
  Coins,
  Star,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Gift,
  RotateCcw,
} from "lucide-react";

const MODULE_TABS = [
  { id: "whatsapp", label: "WhatsApp 24/7", icon: MessageCircle },
  { id: "caja", label: "Arqueo de Caja", icon: Coins },
  { id: "fidelizacion", label: "Fidelización", icon: Award },
  { id: "comisiones", label: "Comisiones", icon: Users },
] as const;

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 90 : -90,
    opacity: 0,
    scale: 0.96,
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
    scale: 1,
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? 90 : -90,
    opacity: 0,
    scale: 0.96,
  }),
};

export default function Features() {
  const [activeStamp, setActiveStamp] = useState(4);
  const [[page, direction], setPage] = useState([0, 0]);

  // Infinite cyclic index so tab transitions always flow continuously
  const mobileIndex = ((page % MODULE_TABS.length) + MODULE_TABS.length) % MODULE_TABS.length;

  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const isFirstMount = useRef(true);

  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }
    const activeTabEl = tabRefs.current[mobileIndex];
    if (activeTabEl && activeTabEl.parentElement) {
      const parent = activeTabEl.parentElement;
      const left = activeTabEl.offsetLeft - parent.offsetLeft - (parent.clientWidth - activeTabEl.clientWidth) / 2;
      parent.scrollTo({ left, behavior: "smooth" });
    }
  }, [mobileIndex]);

  const handlePrev = () => {
    setPage([page - 1, -1]);
  };

  const handleNext = () => {
    setPage([page + 1, 1]);
  };

  const handleSelectTab = (targetIdx: number) => {
    if (targetIdx === mobileIndex) return;
    const diff = targetIdx - mobileIndex;
    setPage([page + diff, diff > 0 ? 1 : -1]);
  };

  return (
    <section
      id="caracteristicas"
      className="relative mx-auto max-w-7xl px-3 sm:px-6 py-14 sm:py-20 lg:py-24 scroll-mt-24 overflow-x-clip"
    >
      {/* Silicon Valley Ambient Wave Glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden select-none -z-10">
        <div className="animate-wave-2 absolute top-[20%] -left-[15%] w-[450px] h-[450px] rounded-full bg-gradient-to-tr from-brand/10 to-transparent blur-3xl opacity-60" />
        <div className="animate-wave-1 absolute -bottom-[10%] -right-[15%] w-[420px] h-[420px] rounded-full bg-gradient-to-bl from-amber-400/10 to-transparent blur-3xl opacity-50" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 25 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-3xl mx-auto space-y-2.5"
      >
        <span className="inline-flex items-center gap-1.5 rounded-full border border-brand/20 bg-brand/5 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-brand">
          <Layers className="h-3.5 w-3.5 text-brand" /> Módulos de Gestión · Todo en uno
        </span>
        <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
          Todo lo que tu negocio necesita en{" "}
          <span className="bg-gradient-to-r from-brand via-[#FF6B4A] to-amber-500 bg-clip-text text-transparent uppercase">
            UN SOLO LUGAR
          </span>
        </h2>
        <p className="text-xs sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl mx-auto">
          Diseñado para la realidad comercial en Paraguay: turnos por WhatsApp y comisiones automáticas de tu equipo.
        </p>
      </motion.div>

      {/* ============================================================== */}
      {/* MÓVIL: Panel Interactivo Flotante con Pestañas y Flechas (< >) */}
      {/* ============================================================== */}
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="md:hidden mt-6"
      >
        {/* Pestañas Táctiles Rápidas con Auto-scroll al centro */}
        <div className="flex justify-center px-1">
          <div className="inline-flex items-center gap-1 rounded-2xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-slate-900 p-1.5 shadow-sm max-w-full overflow-x-auto scrollbar-none scroll-smooth">
            {MODULE_TABS.map((tab, idx) => {
              const isActive = mobileIndex === idx;
              const TabIcon = tab.icon;
              return (
                <button
                  key={tab.id}
                  ref={(el) => {
                    tabRefs.current[idx] = el;
                  }}
                  type="button"
                  onClick={() => handleSelectTab(idx)}
                  className={`flex items-center gap-1.5 rounded-xl px-2.5 xs:px-3 py-1.5 text-xs font-bold transition-all cursor-pointer whitespace-nowrap active:scale-95 ${
                    isActive
                      ? "bg-gradient-to-r from-brand to-[#FF6B4A] text-white shadow-xs font-black"
                      : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <TabIcon className="h-3.5 w-3.5 shrink-0" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tarjeta Flotante con Botones Laterales (< >) e Infinite Slide */}
        <div className="relative mt-4 px-3 sm:px-6 max-w-md mx-auto">
          {/* Botón Lateral Izquierdo */}
          <button
            type="button"
            onClick={handlePrev}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-20 h-9 w-9 rounded-full bg-white/95 dark:bg-slate-800/95 shadow-lg border border-slate-200/90 dark:border-white/10 text-slate-700 dark:text-slate-200 flex items-center justify-center hover:bg-brand hover:text-white hover:border-brand transition-all cursor-pointer active:scale-90"
            aria-label="Ver módulo anterior"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          {/* Botón Lateral Derecho */}
          <button
            type="button"
            onClick={handleNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-20 h-9 w-9 rounded-full bg-white/95 dark:bg-slate-800/95 shadow-lg border border-slate-200/90 dark:border-white/10 text-slate-700 dark:text-slate-200 flex items-center justify-center hover:bg-brand hover:text-white hover:border-brand transition-all cursor-pointer active:scale-90"
            aria-label="Ver módulo siguiente"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          {/* Contenedor con overflow hidden para animaciones continuas */}
          <div className="overflow-hidden min-h-[350px]">
            <AnimatePresence initial={false} custom={direction} mode="popLayout">
              <motion.div
                key={page}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: "spring", stiffness: 320, damping: 30 },
                  opacity: { duration: 0.22 },
                  scale: { duration: 0.22 },
                }}
                className="rounded-3xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-slate-900 p-4.5 xs:p-5 shadow-sm min-h-[350px] flex flex-col justify-between"
              >
                {mobileIndex === 0 && <WhatsAppCardContent />}
                {mobileIndex === 1 && <CashRegisterCardContent />}
                {mobileIndex === 2 && (
                  <LoyaltyCardContent
                    activeStamp={activeStamp}
                    setActiveStamp={setActiveStamp}
                  />
                )}
                {mobileIndex === 3 && <CommissionsCardContent />}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Indicador de Posición en Puntos (Dots) */}
          <div className="mt-3.5 flex items-center justify-center gap-1.5">
            {MODULE_TABS.map((tab, idx) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleSelectTab(idx)}
                className={`transition-all duration-300 rounded-full cursor-pointer ${
                  mobileIndex === idx
                    ? "h-2 w-6 bg-brand shadow-xs"
                    : "h-2 w-2 bg-slate-300 dark:bg-slate-700 hover:bg-slate-400"
                }`}
                aria-label={`Ir al módulo ${tab.label}`}
              />
            ))}
          </div>
        </div>
      </motion.div>

      {/* ============================================================== */}
      {/* DESKTOP: Cuadrícula Completa Bento Grid (md y superiores)       */}
      {/* ============================================================== */}
      <div className="hidden md:grid mt-8 sm:mt-10 gap-4 sm:gap-5 md:grid-cols-12">
        {/* Module 1: WhatsApp Bot (Col 7) */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          className="md:col-span-12 lg:col-span-7 relative overflow-hidden rounded-3xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-slate-900 p-4 sm:p-6 shadow-xs flex flex-col justify-between hover:-translate-y-1 hover:shadow-md transition-all duration-300"
        >
          <WhatsAppCardContent />
        </motion.div>

        {/* Module 2: Control de Caja y Arqueo (Col 5) */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.65, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="md:col-span-12 lg:col-span-5 relative overflow-hidden rounded-3xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-slate-900 p-4 sm:p-6 shadow-xs flex flex-col justify-between hover:-translate-y-1 hover:shadow-md transition-all duration-300"
        >
          <CashRegisterCardContent />
        </motion.div>

        {/* Module 3: Tarjeta de Fidelización (Col 6) */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.98 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.65, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="md:col-span-12 lg:col-span-6 relative overflow-hidden rounded-3xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-slate-900 p-4 sm:p-6 shadow-xs flex flex-col justify-between hover:-translate-y-1 hover:shadow-md transition-all duration-300"
        >
          <LoyaltyCardContent
            activeStamp={activeStamp}
            setActiveStamp={setActiveStamp}
          />
        </motion.div>

        {/* Module 4: Liquidación de Comisiones (Col 6) */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.65, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="md:col-span-12 lg:col-span-6 relative overflow-hidden rounded-3xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-slate-900 p-4 sm:p-6 shadow-xs flex flex-col justify-between hover:-translate-y-1 hover:shadow-md transition-all duration-300"
        >
          <CommissionsCardContent />
        </motion.div>
      </div>

      {/* Feature Bar - Extras y Beneficios Clave */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.6 }}
        className="mt-8 sm:mt-10 pt-6 border-t border-slate-200/80 dark:border-white/10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2.5 text-xs text-slate-600 dark:text-slate-400"
      >
        <div className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>Multi-profesional & roles</span>
        </div>
        <div className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>Reportes y exportación Excel</span>
        </div>
        <div className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>Ficha técnica y CRM de clientes</span>
        </div>
        <div className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>Sin descargas para el cliente</span>
        </div>
        <div className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>Atención y soporte local</span>
        </div>
      </motion.div>
    </section>
  );
}

{/* ============================================================== */}
{/* CONTENIDOS MODULARES REUTILIZABLES                             */}
{/* ============================================================== */}

function WhatsAppCardContent() {
  return (
    <>
      <div>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-400">
            <MessageCircle className="h-4 w-4" /> WhatsApp para Negocios
          </span>
          <span className="rounded-full border border-emerald-500/20 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 text-[10px] font-bold uppercase text-emerald-700 dark:text-emerald-300">
            24/7 Automático
          </span>
        </div>

        <h3 className="mt-3 text-lg sm:text-2xl font-black text-slate-900 dark:text-white">
          Tus clientes reservan directamente por WhatsApp en segundos
        </h3>
        <p className="mt-1.5 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          <strong className="font-bold text-slate-900 dark:text-white block sm:inline">Sin formularios lentos ni descargas de apps. </strong>
          <span className="hidden sm:inline">Las citas se confirman en tiempo real y quedan registradas al instante en tu agenda comercial.</span>
        </p>
      </div>

      {/* Simulated WhatsApp snippet */}
      <div className="mt-4 rounded-2xl bg-[#efeae2] dark:bg-slate-950 p-3 sm:p-3.5 border border-black/5 dark:border-white/10 space-y-2 shadow-inner">
        <div className="rounded-2xl rounded-tl-xs bg-white dark:bg-slate-800 p-2.5 text-xs text-slate-900 dark:text-slate-100 shadow-xs space-y-1">
          <p className="font-bold text-[#008069] text-[11px]">Asistente de Reservas</p>
          <p>Hola, estos son los horarios disponibles para hoy:</p>
          <div className="flex flex-wrap gap-2 pt-0.5">
            <span className="rounded-lg bg-emerald-100 dark:bg-emerald-900/60 px-2.5 py-0.5 font-bold text-emerald-800 dark:text-emerald-300 text-[11px]">
              16:30 hs
            </span>
            <span className="rounded-lg bg-emerald-100 dark:bg-emerald-900/60 px-2.5 py-0.5 font-bold text-emerald-800 dark:text-emerald-300 text-[11px]">
              18:00 hs
            </span>
          </div>
        </div>

        <div className="flex justify-end">
          <div className="rounded-2xl rounded-tr-xs bg-[#d9fdd3] dark:bg-emerald-900/70 p-2 text-xs text-slate-900 dark:text-slate-100 shadow-xs">
            <span>Quiero a las 16:30 hs, muchas gracias.</span>
          </div>
        </div>
      </div>
    </>
  );
}

function CashRegisterCardContent() {
  return (
    <>
      <div>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 rounded-full bg-brand/10 px-3 py-1 text-xs font-bold text-brand dark:text-[#FF6B4A] w-fit">
            <Coins className="h-3.5 w-3.5" /> Finanzas del Negocio
          </span>
          <span className="rounded-full border border-emerald-500/20 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
            Arqueo en Vivo
          </span>
        </div>

        <h3 className="mt-3 text-lg sm:text-2xl font-black text-slate-900 dark:text-white">
          Control de Caja y Arqueo Diario
        </h3>
        <p className="mt-1.5 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          <strong className="font-bold text-slate-900 dark:text-white block sm:inline">Cierre diario sin descuadres. </strong>
          <span className="hidden sm:inline">Registro automático de cobros en efectivo y transferencias bancarias sin planillas manuales.</span>
        </p>
      </div>

      {/* Clean Cash Register Box */}
      <div className="mt-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/50 p-3.5 text-xs space-y-2">
        <div className="flex items-center justify-between text-[11px] pb-1.5 border-b border-slate-200/60 dark:border-slate-700/60">
          <span className="font-semibold text-slate-500 dark:text-slate-400">Arqueo Turno Activo</span>
          <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" /> Balance Cuadrado
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-200/70 dark:border-white/5">
            <span className="text-[10px] text-slate-400 block font-medium">Efectivo en Caja</span>
            <span className="font-mono font-bold text-slate-800 dark:text-slate-100 text-xs">Gs. 780.000</span>
          </div>
          <div className="bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-200/70 dark:border-white/5">
            <span className="text-[10px] text-slate-400 block font-medium">Transferencias</span>
            <span className="font-mono font-bold text-slate-800 dark:text-slate-100 text-xs">Gs. 1.450.000</span>
          </div>
        </div>
        <div className="flex items-center justify-between pt-1 font-bold text-[11px]">
          <span className="text-slate-700 dark:text-slate-300">Total Ingresado:</span>
          <span className="text-brand font-mono font-black text-sm">Gs. 2.230.000</span>
        </div>
      </div>
    </>
  );
}

function LoyaltyCardContent({
  activeStamp,
  setActiveStamp,
}: {
  activeStamp: number;
  setActiveStamp: (stamp: number) => void;
}) {
  return (
    <>
      <div>
        <div className="flex items-center justify-between">
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-white/10">
            <Award className="h-4 w-4" />
          </div>
          <span className="rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200/70 dark:border-white/10 px-2.5 py-0.5 text-[10px] font-semibold text-slate-600 dark:text-slate-400">
            {activeStamp} / 5 Visitas
          </span>
        </div>
        <h3 className="mt-3 text-lg sm:text-2xl font-black text-slate-900 dark:text-white">
          Fidelización Digital & Tarjeta de Sellos
        </h3>
        <p className="mt-1.5 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          <strong className="font-bold text-slate-900 dark:text-white block sm:inline">Sellos virtuales que premian visitas. </strong>
          <span className="hidden sm:inline">Tus clientes acumulan sellos y desbloquean beneficios en cada reserva sin cupones en papel.</span>
        </p>
      </div>

      {/* Interactive Stamp Buttons */}
      <div className="mt-4 space-y-2">
        <div className="flex items-center justify-between gap-2 py-1">
          {[1, 2, 3, 4, 5].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setActiveStamp(s)}
              className={`flex h-9 flex-1 items-center justify-center rounded-xl text-xs font-semibold transition-all cursor-pointer active:scale-90 ${
                s <= activeStamp
                  ? "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-700/60 shadow-2xs"
                  : "border border-dashed border-slate-200 dark:border-slate-800 bg-transparent text-slate-300 dark:text-slate-600"
              }`}
              aria-label={`Sello ${s}`}
            >
              <Star
                className={`h-4 w-4 transition-transform ${
                  s <= activeStamp
                    ? "fill-amber-400 text-amber-500 scale-110"
                    : "text-slate-300 dark:text-slate-600"
                }`}
              />
            </button>
          ))}
        </div>

        {/* Gamification Reward Notification */}
        {activeStamp === 5 ? (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="rounded-2xl bg-gradient-to-r from-amber-500/15 via-brand/10 to-emerald-500/15 border border-amber-400/40 dark:border-amber-400/20 p-2.5 text-center space-y-1 shadow-xs"
          >
            <div className="flex items-center justify-center gap-1.5 text-amber-800 dark:text-amber-300 font-black text-xs">
              <Sparkles className="h-3.5 w-3.5 text-amber-500 animate-pulse" />
              <span>¡Premio Desbloqueado!</span>
              <Gift className="h-3.5 w-3.5 text-brand" />
            </div>
            <p className="text-[11px] font-semibold text-slate-800 dark:text-slate-200">
              20% OFF en próximo turno por 5 visitas
            </p>
            <div className="flex items-center justify-center gap-2 pt-0.5">
              <span className="font-mono text-[9px] bg-white dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold">
                CÓDIGO: CLIENTE-VIP
              </span>
              <button
                type="button"
                onClick={() => setActiveStamp(1)}
                className="inline-flex items-center gap-0.5 text-[10px] text-slate-500 hover:text-brand transition cursor-pointer"
              >
                <RotateCcw className="h-2.5 w-2.5" /> Reiniciar
              </button>
            </div>
          </motion.div>
        ) : (
          <p className="text-center text-[10px] text-slate-400 dark:text-slate-500 font-medium">
            Tocá el 5° sello para ver la recompensa que recibe tu cliente
          </p>
        )}
      </div>
    </>
  );
}

function CommissionsCardContent() {
  return (
    <>
      <div>
        <div className="flex items-center justify-between">
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-brand/10 text-brand dark:text-[#FF6B4A]">
            <Users className="h-4 w-4" />
          </div>
          <span className="rounded-full bg-brand/10 px-2.5 py-0.5 text-[10px] font-bold text-brand dark:text-[#FF6B4A]">
            Cálculo Automático
          </span>
        </div>
        <h3 className="mt-3 text-lg sm:text-2xl font-black text-slate-900 dark:text-white">
          Comisiones de Equipo en 1 Clic
        </h3>
        <p className="mt-1.5 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          <strong className="font-bold text-slate-900 dark:text-white block sm:inline">Liquidación sin planillas. </strong>
          <span className="hidden sm:inline">Cálculo automático de comisiones de estilistas o colaboradores por turno atendido.</span>
        </p>
      </div>

      <div className="mt-4 space-y-2 text-xs">
        <div className="flex items-center justify-between rounded-xl bg-slate-50 dark:bg-slate-800/80 p-2.5 text-slate-700 dark:text-slate-200 border border-slate-200/60 dark:border-white/5">
          <span className="font-semibold">Colaborador 1 (50% comisión)</span>
          <strong className="text-emerald-600 dark:text-emerald-400 font-mono text-xs sm:text-sm">Gs. 2.450.000</strong>
        </div>
        <div className="flex items-center justify-between rounded-xl bg-slate-50 dark:bg-slate-800/80 p-2.5 text-slate-700 dark:text-slate-200 border border-slate-200/60 dark:border-white/5">
          <span className="font-semibold">Colaborador 2 (45% comisión)</span>
          <strong className="text-emerald-600 dark:text-emerald-400 font-mono text-xs sm:text-sm">Gs. 1.820.000</strong>
        </div>
      </div>
    </>
  );
}


