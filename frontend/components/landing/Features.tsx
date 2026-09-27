"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  MessageCircle,
  CalendarCheck,
  Award,
  Users,
  Sparkles,
  Landmark,
  Star,
  CheckCircle2,
  Copy,
  Check,
} from "lucide-react";

export default function Features() {
  const [activeStamp, setActiveStamp] = useState(4);
  const [copiedSipap, setCopiedSipap] = useState(false);

  return (
    <section id="caracteristicas" className="relative mx-auto max-w-7xl px-4 py-16 sm:py-24 sm:px-6">
      {/* Background glow halos */}
      <div className="pointer-events-none absolute left-1/2 top-10 -translate-x-1/2 h-96 w-96 rounded-full bg-brand/10 blur-3xl opacity-70" />

      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-brand/20 bg-brand/5 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-brand">
          <Sparkles className="h-3.5 w-3.5 text-brand" /> Módulos de Gestión · Todo en uno
        </span>
        <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
          Todo lo que tu negocio necesita en{" "}
          <span className="bg-gradient-to-r from-brand via-indigo-600 to-emerald-600 bg-clip-text text-transparent">
            un solo lugar
          </span>
        </h2>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl mx-auto">
          Diseñado para la realidad comercial en Paraguay: turnos por WhatsApp, transferencias SIPAP, comisiones automáticas de tu equipo y recordatorios directos al calendario del cliente.
        </p>
      </div>

      {/* Grid of Core Modules */}
      <div className="mt-12 grid gap-5 sm:gap-6 md:grid-cols-12">
        {/* Module 1: WhatsApp Bot (Col 7) */}
        <div className="md:col-span-7 relative overflow-hidden rounded-3xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-slate-900 p-5 sm:p-8 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-400">
              <MessageCircle className="h-4 w-4" /> WhatsApp Oficial
            </span>
            <span className="rounded-full border border-emerald-500/20 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 text-[10px] font-bold uppercase text-emerald-700 dark:text-emerald-300">
              24/7 Automático
            </span>
          </div>

          <h3 className="mt-4 text-lg sm:text-2xl font-black text-slate-900 dark:text-white">
            Tus clientes reservan directamente por WhatsApp en segundos
          </h3>
          <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Sin formularios lentos ni aplicaciones externas. El bot responde con los horarios libres de tu equipo en tiempo real y guarda el turno en tu agenda al instante.
          </p>

          {/* Interactive Simulated WhatsApp snippet */}
          <div className="mt-5 rounded-2xl bg-[#efeae2] dark:bg-slate-950 p-3.5 sm:p-4 border border-black/5 dark:border-white/10 space-y-2.5 shadow-inner">
            <div className="rounded-2xl rounded-tl-xs bg-white dark:bg-slate-800 p-3 text-xs text-slate-900 dark:text-slate-100 shadow-xs space-y-1">
              <p className="font-bold text-[#008069]">Asistente de Reservas</p>
              <p>Hola, estos son los horarios disponibles para hoy:</p>
              <div className="flex flex-wrap gap-2 pt-1">
                <span className="rounded-lg bg-emerald-100 dark:bg-emerald-900/60 px-2.5 py-1 font-bold text-emerald-800 dark:text-emerald-300 text-[11px]">
                  16:30 hs
                </span>
                <span className="rounded-lg bg-emerald-100 dark:bg-emerald-900/60 px-2.5 py-1 font-bold text-emerald-800 dark:text-emerald-300 text-[11px]">
                  18:00 hs
                </span>
              </div>
            </div>

            <div className="flex justify-end">
              <div className="rounded-2xl rounded-tr-xs bg-[#d9fdd3] dark:bg-emerald-900/70 p-2.5 text-xs text-slate-900 dark:text-slate-100 shadow-xs">
                <span>Quiero a las 16:30 hs, muchas gracias.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Module 2: SIPAP & Finanzas (Col 5) */}
        <div className="md:col-span-5 relative overflow-hidden rounded-3xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-slate-900 p-5 sm:p-8 shadow-sm flex flex-col justify-between">
          <div>
            <span className="flex items-center gap-2 rounded-full bg-violet-500/10 px-3 py-1 text-xs font-bold text-violet-700 dark:text-violet-400 w-fit">
              <Landmark className="h-4 w-4" /> Cobros & Caja Local
            </span>

            <h3 className="mt-4 text-lg sm:text-2xl font-black text-slate-900 dark:text-white">
              Transferencias SIPAP & Bancard
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Cobrá señas anticipadas o registra pagos en el local con 0% de comisión de nuestra parte. Controlá la caja diaria con precisión.
            </p>
          </div>

          {/* Clean SIPAP Box */}
          <div className="mt-5 rounded-2xl border border-emerald-200 dark:border-emerald-800/80 bg-emerald-50/70 dark:bg-emerald-950/40 p-4 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-emerald-900 dark:text-emerald-300">
                Alias SIPAP del Negocio
              </span>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText("agendate.py");
                  setCopiedSipap(true);
                  setTimeout(() => setCopiedSipap(false), 2000);
                }}
                className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-emerald-700 transition"
              >
                {copiedSipap ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                <span>{copiedSipap ? "¡Copiado!" : "Copiar"}</span>
              </button>
            </div>
            <p className="font-mono font-bold text-emerald-800 dark:text-emerald-400 text-sm">
              agendate.py
            </p>
            <p className="text-[11px] text-emerald-700 dark:text-emerald-400/80">
              Banco Itaú · Titular verificado
            </p>
          </div>
        </div>

        {/* Module 3: Google & Apple Calendar Sync (Col 4) */}
        <div className="md:col-span-4 relative overflow-hidden rounded-3xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <CalendarCheck className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-base sm:text-lg font-black text-slate-900 dark:text-white">
              Google & Apple Calendar
            </h3>
            <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Detección inteligente de dispositivo: añade el turno con alarma 24h y 2h antes tanto en teléfonos Android como en iPhone.
            </p>
          </div>

          <div className="mt-5 flex flex-col gap-2 text-xs">
            <div className="flex items-center gap-2 rounded-xl bg-slate-50 dark:bg-slate-800 p-2.5 font-semibold text-slate-700 dark:text-slate-300">
              <span className="h-2 w-2 rounded-full bg-blue-500" />
              <span>Android: Google Calendar automático</span>
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-slate-50 dark:bg-slate-800 p-2.5 font-semibold text-slate-700 dark:text-slate-300">
              <span className="h-2 w-2 rounded-full bg-slate-900 dark:bg-white" />
              <span>iPhone: Alarma en Apple Watch & iOS</span>
            </div>
          </div>
        </div>

        {/* Module 4: Tarjeta de Fidelización (Col 4) */}
        <div className="md:col-span-4 relative overflow-hidden rounded-3xl border border-amber-200/80 dark:border-amber-900/40 bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-white dark:to-slate-900 p-5 sm:p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-600">
                <Award className="h-5 w-5" />
              </div>
              <span className="rounded-full bg-amber-500/20 px-2.5 py-0.5 text-[10px] font-black text-amber-800 dark:text-amber-300">
                4 / 5 Visitas
              </span>
            </div>
            <h3 className="mt-4 text-base sm:text-lg font-black text-slate-900 dark:text-white">
              Fidelización Digital
            </h3>
            <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Tus clientes acumulan sellos virtuales en cada visita. Al completar 5 turnos, desbloquean beneficios automáticos sin cupones de papel.
            </p>
          </div>

          <div className="mt-5 flex items-center justify-between gap-1.5 py-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setActiveStamp(s)}
                className={`flex h-8 sm:h-9 flex-1 items-center justify-center rounded-xl text-xs sm:text-sm font-black transition-all ${
                  s <= activeStamp
                    ? "bg-amber-400 text-slate-950 shadow-xs scale-105"
                    : "border border-dashed border-amber-300 bg-white/60 dark:bg-slate-800 text-amber-300"
                }`}
                aria-label={`Sello ${s}`}
              >
                <Star
                  className={`h-3.5 w-3.5 ${
                    s <= activeStamp ? "fill-slate-950 text-slate-950" : "text-amber-300"
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Module 5: Liquidación de Comisiones (Col 4) */}
        <div className="md:col-span-4 relative overflow-hidden rounded-3xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <Users className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-base sm:text-lg font-black text-slate-900 dark:text-white">
              Comisiones de Equipo
            </h3>
            <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Liquidá las comisiones de peluqueros, estilistas o profesionales con un clic según los turnos atendidos en el día o en el mes.
            </p>
          </div>

          <div className="mt-5 space-y-2 text-xs">
            <div className="flex items-center justify-between rounded-xl bg-slate-50 dark:bg-slate-800 p-2.5 text-slate-700 dark:text-slate-200">
              <span className="font-semibold">Marcos Benítez (50%)</span>
              <strong className="text-emerald-600 font-mono">Gs. 2.450.000</strong>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-slate-50 dark:bg-slate-800 p-2.5 text-slate-700 dark:text-slate-200">
              <span className="font-semibold">Lucas Alarcón (45%)</span>
              <strong className="text-emerald-600 font-mono">Gs. 1.820.000</strong>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
