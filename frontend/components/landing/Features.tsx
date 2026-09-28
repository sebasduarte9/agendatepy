"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  MessageCircle,
  Award,
  Users,
  Layers,
  Coins,
  Star,
  CheckCircle2,
} from "lucide-react";

function GoogleCalendarLogo({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="4" width="18" height="17" rx="3" fill="#ffffff" />
      <path d="M19 4H5a2 2 0 0 0-2 2v3h18V6a2 2 0 0 0-2-2z" fill="#4285F4" />
      <rect x="6.5" y="2" width="2" height="4" rx="1" fill="#EA4335" />
      <rect x="15.5" y="2" width="2" height="4" rx="1" fill="#EA4335" />
      <path d="M19 21a2 2 0 0 0 2-2V9H3v10a2 2 0 0 0 2 2h14z" fill="#ffffff" stroke="#E2E8F0" strokeWidth="0.5" />
      <circle cx="17.5" cy="17.5" r="1.5" fill="#34A853" />
      <circle cx="6.5" cy="17.5" r="1.5" fill="#FBBC05" />
      <text x="12" y="16.5" textAnchor="middle" fontSize="7.5" fontWeight="900" fill="#1E293B" fontFamily="system-ui, sans-serif">
        31
      </text>
    </svg>
  );
}

function AppleLogo({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 170 170" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.04-7.58-7.71-11.65-14.02-6.53-10.12-11.66-21.68-15.39-34.69-3.73-13.01-5.6-25.07-5.6-36.19 0-14.48 3.54-26.65 10.62-36.5 7.08-9.86 16.03-14.88 26.85-15.08 4.9 0 10.28 1.25 16.14 3.76 5.86 2.5 9.77 3.82 11.73 3.94 1.74-.24 5.92-1.67 12.54-4.29 6.62-2.61 12.23-3.8 16.83-3.56 12.53.65 22.42 5.16 29.66 13.53-10.99 6.64-16.38 15.68-16.17 27.12.22 8.93 3.66 16.32 10.33 22.18 6.67 5.86 14.42 9.21 23.25 10.05-2.29 6.97-4.96 13.88-8.01 20.73zM119.22 33.15c0-7.18 2.61-14.04 7.83-20.59 5.22-6.55 11.69-10.74 19.41-12.56.98 7.4-1.39 14.34-7.12 20.82-5.73 6.48-12.42 10.23-20.08 11.26-.03-.27-.04-.6-.04-.93z" />
    </svg>
  );
}

export default function Features() {
  const [activeStamp, setActiveStamp] = useState(4);

  return (
    <section
      id="caracteristicas"
      className="relative overflow-hidden mx-auto max-w-7xl px-4 py-14 sm:py-20 lg:py-24 scroll-mt-24"
    >
      {/* Background glow halos */}
      <div className="pointer-events-none absolute left-1/2 top-10 -translate-x-1/2 h-96 w-96 rounded-full bg-brand/10 blur-3xl opacity-70" />

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
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl mx-auto">
          Diseñado para la realidad comercial en Paraguay: turnos por WhatsApp y comisiones automáticas de tu equipo.
        </p>
      </motion.div>

      {/* Grid of Core Modules with alternating entrance animations */}
      <div className="mt-8 sm:mt-10 grid gap-4 sm:gap-5 md:grid-cols-12">
        {/* Module 1: WhatsApp Bot (Col 7 on desktop, 12 on tablet) */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          className="md:col-span-12 lg:col-span-7 relative overflow-hidden rounded-3xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-slate-900 p-4 sm:p-6 shadow-xs flex flex-col justify-between"
        >
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
              <span className="block sm:hidden">Citas confirmadas al instante en tu agenda por WhatsApp sin instalar nada.</span>
              <span className="hidden sm:block">Sin formularios lentos ni descargas de apps. Las citas se confirman en tiempo real y quedan registradas al instante en tu agenda comercial.</span>
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
        </motion.div>

        {/* Module 2: Control de Caja y Arqueo (Col 5 on desktop, 12 on tablet) */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.65, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="md:col-span-12 lg:col-span-5 relative overflow-hidden rounded-3xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-slate-900 p-4 sm:p-6 shadow-xs flex flex-col justify-between"
        >
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
              Control de Caja y Arqueo
            </h3>
            <p className="mt-1.5 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              <span className="block sm:hidden">Cobros en efectivo y transferencias sin descuadres al cerrar turno.</span>
              <span className="hidden sm:block">Registro automático de cobros en efectivo y transferencias. Cierre de turno diario sin descuadres ni planillas manuales.</span>
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
        </motion.div>

        {/* Module 3: Google & Apple Calendar Sync (Col 4 on desktop, 6 on tablet) */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          className="md:col-span-6 lg:col-span-4 relative overflow-hidden rounded-3xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-xs flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <GoogleCalendarLogo className="h-5 w-5" />
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-900/10 dark:bg-white/10 text-slate-900 dark:text-white">
                <AppleLogo className="h-4 w-4" />
              </div>
            </div>
            <h3 className="mt-3 text-base sm:text-lg font-black text-slate-900 dark:text-white">
              Google & Apple Calendar
            </h3>
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              <span className="block sm:hidden">Turnos sincronizados con alarmas en Android y iPhone.</span>
              <span className="hidden sm:block">Detección de dispositivo: añade el turno con alarma 24h y 2h antes en Android y iPhone.</span>
            </p>
          </div>

          <div className="mt-3.5 flex flex-col gap-1.5 text-xs">
            <div className="flex items-center gap-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 p-2 font-semibold text-slate-700 dark:text-slate-300">
              <GoogleCalendarLogo className="h-4 w-4 shrink-0" />
              <span className="truncate">Google Calendar: Sincronización 24h</span>
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 p-2 font-semibold text-slate-700 dark:text-slate-300">
              <AppleLogo className="h-3.5 w-3.5 shrink-0 text-slate-900 dark:text-white" />
              <span className="truncate">Apple Calendar: Alarma en iOS</span>
            </div>
          </div>
        </motion.div>

        {/* Module 4: Tarjeta de Fidelización (Col 4 on desktop, 6 on tablet) */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.65, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="md:col-span-6 lg:col-span-4 relative overflow-hidden rounded-3xl border border-amber-200/80 dark:border-amber-900/40 bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-white dark:to-slate-900 p-4 sm:p-5 shadow-xs flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between">
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-600">
                <Award className="h-4 w-4" />
              </div>
              <span className="rounded-full bg-amber-500/20 px-2.5 py-0.5 text-[10px] font-black text-amber-800 dark:text-amber-300">
                4 / 5 Visitas
              </span>
            </div>
            <h3 className="mt-3 text-base sm:text-lg font-black text-slate-900 dark:text-white">
              Fidelización Digital
            </h3>
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              <span className="block sm:hidden">Sellos virtuales que premian a tus clientes frecuentes.</span>
              <span className="hidden sm:block">Tus clientes acumulan sellos virtuales. Al completar 5 turnos, desbloquean beneficios sin cupones.</span>
            </p>
          </div>

          <div className="mt-3.5 flex items-center justify-between gap-1.5 py-0.5">
            {[1, 2, 3, 4, 5].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setActiveStamp(s)}
                className={`flex h-8 flex-1 items-center justify-center rounded-xl text-xs font-black transition-all cursor-pointer ${
                  s <= activeStamp
                    ? "bg-amber-400 text-slate-950 shadow-xs scale-105"
                    : "border border-dashed border-amber-300 bg-white/60 dark:bg-slate-800 text-amber-300"
                }`}
                aria-label={`Sello ${s}`}
              >
                <Star
                  className={`h-3 w-3 ${
                    s <= activeStamp ? "fill-slate-950 text-slate-950" : "text-amber-300"
                  }`}
                />
              </button>
            ))}
          </div>
        </motion.div>

        {/* Module 5: Liquidación de Comisiones (Col 4 on desktop, 12 on tablet) */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.65, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="md:col-span-12 lg:col-span-4 relative overflow-hidden rounded-3xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-xs flex flex-col justify-between"
        >
          <div>
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-brand/10 text-brand dark:text-[#FF6B4A]">
              <Users className="h-4 w-4" />
            </div>
            <h3 className="mt-3 text-base sm:text-lg font-black text-slate-900 dark:text-white">
              Comisiones de Equipo
            </h3>
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              <span className="block sm:hidden">Cálculo de comisiones con 1 solo clic.</span>
              <span className="hidden sm:block">Liquidá comisiones de estilistas o colaboradores con un clic según turnos atendidos.</span>
            </p>
          </div>

          <div className="mt-3.5 space-y-1.5 text-xs">
            <div className="flex items-center justify-between rounded-xl bg-slate-50 dark:bg-slate-800/80 p-2 text-slate-700 dark:text-slate-200">
              <span className="font-semibold">Colaborador 1 (50%)</span>
              <strong className="text-emerald-600 font-mono">Gs. 2.450.000</strong>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-slate-50 dark:bg-slate-800/80 p-2 text-slate-700 dark:text-slate-200">
              <span className="font-semibold">Colaborador 2 (45%)</span>
              <strong className="text-emerald-600 font-mono">Gs. 1.820.000</strong>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
