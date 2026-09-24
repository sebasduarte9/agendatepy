"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  MessageCircle,
  CreditCard,
  CalendarCheck,
  Award,
  Users,
  Sparkles,
  Zap,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  CalendarPlus,
  Landmark,
  Bell,
  Star,
  Scissors,
} from "lucide-react";
import { formatGs } from "@/lib/dashboard-dates";

export default function Features() {
  const [activeStamp, setActiveStamp] = useState(4);
  const [copiedSipap, setCopiedSipap] = useState(false);

  return (
    <section id="caracteristicas" className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6">
      {/* Background glow halos */}
      <div className="pointer-events-none absolute left-1/2 top-10 -translate-x-1/2 h-96 w-96 rounded-full bg-brand/10 blur-3xl opacity-70" />

      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-brand/20 bg-brand/5 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-brand">
          <Sparkles className="h-3.5 w-3.5 text-amber-500" /> Bento Grid 3D · Plataforma Integral
        </span>
        <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white sm:text-5xl">
          Todo lo que tu negocio necesita en{" "}
          <span className="bg-gradient-to-r from-brand via-indigo-600 to-whatsapp bg-clip-text text-transparent">
            un solo lugar
          </span>
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 sm:text-base leading-relaxed">
          Diseñado específicamente para las necesidades comerciales de Paraguay: reservas por WhatsApp,
          transferencias SIPAP, comisiones de equipo y recordatorios de calendario.
        </p>
      </div>

      {/* 3D Bento Grid (Revolut / Family style) */}
      <div className="mt-14 grid gap-6 md:grid-cols-12 [perspective:1400px]">
        {/* Bento 1: WhatsApp Bot (Col 7) */}
        <motion.div
          whileHover={{ y: -6, rotateX: 2, rotateY: -2 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="md:col-span-7 relative overflow-hidden rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white/90 dark:bg-slate-900/90 p-6 sm:p-8 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.06)] dark:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] backdrop-blur-xl [transform-style:preserve-3d]"
        >
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
              <MessageCircle className="h-4 w-4" /> WhatsApp Cloud API Oficial
            </span>
            <span className="rounded-full border border-emerald-500/20 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 text-[10px] font-black uppercase text-emerald-700 dark:text-emerald-300">
              Piloto Automático
            </span>
          </div>

          <h3 className="mt-5 text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            Tus clientes reservan directamente por WhatsApp en segundos
          </h3>
          <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-xl">
            Sin formularios engorrosos ni apps extrañas. El bot ofrece horarios libres en tiempo real,
            guarda los turnos en tu agenda y envía recordatorios oficiales para eliminar las ausencias.
          </p>

          {/* Interactive Simulated WhatsApp snippet */}
          <div className="mt-6 rounded-2xl bg-[#efeae2] dark:bg-slate-950 p-4 border border-black/5 dark:border-white/10 space-y-2.5 max-w-md shadow-inner">
            <div className="rounded-2xl rounded-tl-xs bg-white dark:bg-slate-800 p-3 text-xs text-slate-900 dark:text-slate-100 shadow-xs space-y-1">
              <p className="font-bold text-[#008069]">Agendate Assistant 🤖</p>
              <p>¡Hola! Tenemos estos horarios hoy con Marcos Benítez:</p>
              <div className="flex gap-2 pt-1">
                <span className="rounded-lg bg-emerald-100 dark:bg-emerald-900/60 px-2 py-1 font-bold text-emerald-800 dark:text-emerald-300 text-[11px]">
                  16:30 hs
                </span>
                <span className="rounded-lg bg-emerald-100 dark:bg-emerald-900/60 px-2 py-1 font-bold text-emerald-800 dark:text-emerald-300 text-[11px]">
                  18:00 hs
                </span>
              </div>
            </div>

            <div className="flex justify-end">
              <div className="rounded-2xl rounded-tr-xs bg-[#d9fdd3] dark:bg-emerald-900/70 p-2.5 text-xs text-slate-900 dark:text-slate-100 shadow-xs">
                <span>Quiero las 16:30 hs, gracias! 🙌</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Bento 2: SIPAP & Finanzas (Col 5) */}
        <motion.div
          whileHover={{ y: -6, rotateX: 2, rotateY: 2 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="md:col-span-5 relative overflow-hidden rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white/90 dark:bg-slate-900/90 p-6 sm:p-8 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.06)] dark:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] backdrop-blur-xl [transform-style:preserve-3d] flex flex-col justify-between"
        >
          <div>
            <span className="flex items-center gap-2 rounded-full bg-violet-500/10 px-3 py-1 text-xs font-bold text-violet-600 dark:text-violet-400 w-fit">
              <Landmark className="h-4 w-4" /> Pagos & Caja en Paraguay
            </span>

            <h3 className="mt-5 text-xl font-black text-slate-900 dark:text-white">
              Transferencias SIPAP & Bancard POS
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Cobrá señas anticipadas o registra cobros con 0% de comisión nuestra. Conciliá caja diaria
              al instante.
            </p>
          </div>

          {/* Interactive SIPAP Box */}
          <div className="mt-6 rounded-2xl border border-emerald-200 dark:border-emerald-800/80 bg-emerald-50/70 dark:bg-emerald-950/40 p-4 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-emerald-900 dark:text-emerald-300">
                Alias SIPAP Oficial
              </span>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText("agendate.py");
                  setCopiedSipap(true);
                  setTimeout(() => setCopiedSipap(false), 2000);
                }}
                className="rounded-lg bg-emerald-600 px-2 py-1 text-[11px] font-bold text-white hover:bg-emerald-700 transition"
              >
                {copiedSipap ? "¡Copiado!" : "Copiar"}
              </button>
            </div>
            <p className="font-mono font-bold text-emerald-800 dark:text-emerald-400 text-sm">
              agendate.py
            </p>
            <p className="text-[11px] text-emerald-700 dark:text-emerald-400/80">
              Banco Itaú · Titular verificado
            </p>
          </div>
        </motion.div>

        {/* Bento 3: Smart Calendar Sync (Col 4) */}
        <motion.div
          whileHover={{ y: -6, rotateX: 2, rotateY: -2 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="md:col-span-4 relative overflow-hidden rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white/90 dark:bg-slate-900/90 p-6 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.06)] dark:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] backdrop-blur-xl [transform-style:preserve-3d] flex flex-col justify-between"
        >
          <div>
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <CalendarCheck className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-lg font-black text-slate-900 dark:text-white">
              Google Calendar & Apple Reminders
            </h3>
            <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Detección inteligente de dispositivo: añade recordatorios a Google Calendar en Android y
              a Calendario / Recordatorios en iPhone con alarmas 24h y 2h antes.
            </p>
          </div>

          <div className="mt-6 flex flex-col gap-2 text-xs">
            <div className="flex items-center gap-2 rounded-xl bg-slate-50 dark:bg-slate-800 p-2.5 font-semibold text-slate-700 dark:text-slate-300">
              <span className="h-2 w-2 rounded-full bg-blue-500" />
              <span>Android: Google Calendar directo</span>
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-slate-50 dark:bg-slate-800 p-2.5 font-semibold text-slate-700 dark:text-slate-300">
              <span className="h-2 w-2 rounded-full bg-slate-900 dark:bg-white" />
              <span>iPhone: Alarma en Apple Watch & iOS</span>
            </div>
          </div>
        </motion.div>

        {/* Bento 4: Club VIP Fidelización (Col 4) */}
        <motion.div
          whileHover={{ y: -6, rotateX: 2, rotateY: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="md:col-span-4 relative overflow-hidden rounded-3xl border border-amber-200/80 dark:border-amber-900/40 bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-white dark:to-slate-900 p-6 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.06)] dark:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] backdrop-blur-xl [transform-style:preserve-3d] flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-600">
                <Award className="h-5 w-5" />
              </div>
              <span className="rounded-full bg-amber-500/20 px-2.5 py-0.5 text-[10px] font-black text-amber-800 dark:text-amber-300">
                4 / 5 Visitas
              </span>
            </div>
            <h3 className="mt-4 text-lg font-black text-slate-900 dark:text-white">
              Club VIP · Tarjeta de Sellos
            </h3>
            <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Tus clientes acumulan sellos virtuales en cada visita. Al llegar a 5 turnos, desbloquean
              beneficios automáticos sin tarjetas de papel.
            </p>
          </div>

          <div className="mt-6 flex items-center justify-between gap-1.5 py-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setActiveStamp(s)}
                className={`flex h-9 flex-1 items-center justify-center rounded-xl text-sm font-black transition-all ${
                  s <= activeStamp
                    ? "bg-amber-400 text-slate-950 shadow-xs scale-105"
                    : "border-2 border-dashed border-amber-300 bg-white/60 dark:bg-slate-800 text-amber-300"
                }`}
              >
                <Star
                  className={`h-4 w-4 ${
                    s <= activeStamp ? "fill-slate-950 text-slate-950" : "text-amber-300"
                  }`}
                />
              </button>
            ))}
          </div>
        </motion.div>

        {/* Bento 5: Equipo & Comisiones (Col 4) */}
        <motion.div
          whileHover={{ y: -6, rotateX: 2, rotateY: 2 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="md:col-span-4 relative overflow-hidden rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white/90 dark:bg-slate-900/90 p-6 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.06)] dark:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] backdrop-blur-xl [transform-style:preserve-3d] flex flex-col justify-between"
        >
          <div>
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <Users className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-lg font-black text-slate-900 dark:text-white">
              Equipo & Comisiones Claras
            </h3>
            <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Liquidá comisiones de peluqueros, terapeutas o profesionales con un clic según los turnos
              atendidos y productos vendidos en el mes.
            </p>
          </div>

          <div className="mt-6 space-y-2 text-xs">
            <div className="flex items-center justify-between rounded-xl bg-slate-50 dark:bg-slate-800 p-2 text-slate-700 dark:text-slate-200">
              <span className="font-semibold">Marcos Benítez (50%)</span>
              <strong className="text-emerald-600">Gs. 2.450.000</strong>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-slate-50 dark:bg-slate-800 p-2 text-slate-700 dark:text-slate-200">
              <span className="font-semibold">Lucas Alarcón (45%)</span>
              <strong className="text-emerald-600">Gs. 1.820.000</strong>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
