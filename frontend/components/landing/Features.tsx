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

export default function Features() {
  const [activeStamp, setActiveStamp] = useState(4);

  return (
    <section
      id="caracteristicas"
      className="relative mx-auto max-w-7xl px-4 py-14 sm:py-20 lg:py-24 scroll-mt-24"
    >
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

      {/* Grid of 4 Rebalanced Core Modules */}
      <div className="mt-8 sm:mt-10 grid gap-4 sm:gap-5 md:grid-cols-12">
        {/* Module 1: WhatsApp Bot (Col 7 on desktop, 12 on tablet) */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          className="md:col-span-12 lg:col-span-7 relative overflow-hidden rounded-3xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-slate-900 p-4 sm:p-6 shadow-xs flex flex-col justify-between hover:-translate-y-1 hover:shadow-md transition-all duration-300"
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
              <strong className="font-bold text-slate-900 dark:text-white block sm:inline">Sin formularios lentos ni descargas de apps. </strong>
              <span>Las citas se confirman en tiempo real y quedan registradas al instante en tu agenda comercial.</span>
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
          className="md:col-span-12 lg:col-span-5 relative overflow-hidden rounded-3xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-slate-900 p-4 sm:p-6 shadow-xs flex flex-col justify-between hover:-translate-y-1 hover:shadow-md transition-all duration-300"
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
              Control de Caja y Arqueo Diario
            </h3>
            <p className="mt-1.5 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              <strong className="font-bold text-slate-900 dark:text-white block sm:inline">Cierre diario sin descuadres. </strong>
              <span>Registro automático de cobros en efectivo y transferencias SIPAP sin planillas manuales.</span>
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

        {/* Module 3: Tarjeta de Fidelización (Col 6 on desktop, 12 on tablet) */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.98 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.65, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="md:col-span-12 lg:col-span-6 relative overflow-hidden rounded-3xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-slate-900 p-4 sm:p-6 shadow-xs flex flex-col justify-between hover:-translate-y-1 hover:shadow-md transition-all duration-300"
        >
          <div>
            <div className="flex items-center justify-between">
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-white/10">
                <Award className="h-4 w-4" />
              </div>
              <span className="rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200/70 dark:border-white/10 px-2.5 py-0.5 text-[10px] font-semibold text-slate-600 dark:text-slate-400">
                4 / 5 Visitas
              </span>
            </div>
            <h3 className="mt-3 text-lg sm:text-2xl font-black text-slate-900 dark:text-white">
              Fidelización Digital & Tarjeta de Sellos
            </h3>
            <p className="mt-1.5 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              <strong className="font-bold text-slate-900 dark:text-white block sm:inline">Sellos virtuales que premian visitas. </strong>
              <span>Tus clientes acumulan sellos y desbloquean beneficios en cada reserva sin cupones en papel.</span>
            </p>
          </div>

          <div className="mt-4 flex items-center justify-between gap-2 py-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setActiveStamp(s)}
                className={`flex h-9 flex-1 items-center justify-center rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  s <= activeStamp
                    ? "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-2xs"
                    : "border border-dashed border-slate-200 dark:border-slate-800 bg-transparent text-slate-300 dark:text-slate-600"
                }`}
                aria-label={`Sello ${s}`}
              >
                <Star
                  className={`h-3.5 w-3.5 ${
                    s <= activeStamp
                      ? "fill-slate-700 dark:fill-slate-300 text-slate-700 dark:text-slate-300"
                      : "text-slate-300 dark:text-slate-600"
                  }`}
                />
              </button>
            ))}
          </div>
        </motion.div>

        {/* Module 4: Liquidación de Comisiones (Col 6 on desktop, 12 on tablet) */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.65, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="md:col-span-12 lg:col-span-6 relative overflow-hidden rounded-3xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-slate-900 p-4 sm:p-6 shadow-xs flex flex-col justify-between hover:-translate-y-1 hover:shadow-md transition-all duration-300"
        >
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
              <span>Cálculo automático de comisiones de estilistas o colaboradores por turno atendido.</span>
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
          <span>Soporte prioritario en Guaraníes</span>
        </div>
      </motion.div>
    </section>
  );
}

