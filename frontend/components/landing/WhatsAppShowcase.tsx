"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle2, Clock, Bell, ArrowRight, MessageCircle, Calendar, CheckCheck, MapPin, User, Scissors, RefreshCw, Check } from "lucide-react";
import { useCategory } from "@/context/CategoryContext";
import { getCommercialWhatsAppUrl } from "@/lib/config/whatsapp";

export default function WhatsAppShowcase() {
  const { category } = useCategory();

  return (
    <section
      id="whatsapp"
      className="relative overflow-hidden bg-white dark:bg-slate-950 py-12 sm:py-20 lg:py-24 border-t border-slate-100 dark:border-slate-800/80 scroll-mt-24"
    >
      <div className="mx-auto grid max-w-6xl items-center gap-8 sm:gap-12 px-3 sm:px-6 lg:grid-cols-12">
        {/* Left Column: Value Prop & Bullets */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-6 min-w-0"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-50 dark:bg-emerald-950/40 px-3.5 py-1 text-[11px] sm:text-xs font-bold text-emerald-700 dark:text-emerald-400">
            <Bell className="h-3.5 w-3.5 text-emerald-600" />
            <span>Mensajería Automatizada por WhatsApp</span>
          </div>

          <h2 className="mt-3.5 text-2xl xs:text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
            Recordatorios automáticos que tus clientes <span className="text-emerald-600">sí leen</span> y responden
          </h2>

          <p className="mt-3 text-slate-600 dark:text-slate-300 leading-relaxed text-xs sm:text-base">
            Confirmaciones al instante y recordatorios personalizados para tu rubro:{" "}
            <strong className="text-slate-900 dark:text-white">{category.label}</strong> en {category.businessName}.
          </p>

          <ul className="mt-5 sm:mt-6 space-y-2.5">
            <Bullet icon={<CheckCircle2 className="h-4 w-4 sm:h-4.5 sm:w-4.5 text-emerald-600 shrink-0 mt-0.5" />}>
              <div className="space-y-0.5">
                <span className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm block">Confirmación Inmediata</span>
                <p className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Comprobante digital con detalles del servicio, horario y enlace directo para guardar en el calendario.
                </p>
              </div>
            </Bullet>
            <Bullet icon={<Clock className="h-4 w-4 sm:h-4.5 sm:w-4.5 text-brand shrink-0 mt-0.5" />}>
              <div className="space-y-0.5">
                <span className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm block">Recordatorio 24h Antes</span>
                <p className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Botones de respuesta rápida para confirmar asistencia o avisar con tiempo para reprogramar.
                </p>
              </div>
            </Bullet>
            <Bullet icon={<Bell className="h-4 w-4 sm:h-4.5 sm:w-4.5 text-brand shrink-0 mt-0.5" />}>
              <div className="space-y-0.5">
                <span className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm block">Aviso 2 Horas Previas</span>
                <p className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Hasta 80% menos ausencias comprobadas en salones y consultorios locales en Paraguay.
                </p>
              </div>
            </Bullet>
          </ul>

          <div className="mt-6 flex flex-wrap items-center gap-2.5 sm:gap-3">
            <Link
              href="/onboarding"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brand to-[#FF6B4A] px-4.5 sm:px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md shadow-brand/25 hover:brightness-110 transition active:scale-95"
            >
              <span>Probar gratis ahora</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <a
              href={getCommercialWhatsAppUrl("Hola, quiero ver cómo funcionan los recordatorios por WhatsApp")}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-emerald-700 dark:text-emerald-400 hover:underline px-2.5 sm:px-3 py-2"
            >
              <span>Ver demo por WhatsApp</span>
              <ArrowRight className="h-3 w-3" />
            </a>
          </div>
        </motion.div>

        {/* Right Column: Authentic WhatsApp Message Sequence Card */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.65, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-6 flex justify-center min-w-0"
        >
          <div className="w-full max-w-md rounded-3xl border border-slate-200/90 dark:border-white/10 bg-[#efeae2] dark:bg-slate-900 p-3 xs:p-3.5 sm:p-5 shadow-sm space-y-2 sm:space-y-2.5 overflow-hidden">
            {/* Header of WhatsApp Chat */}
            <div className="flex items-center justify-between pb-2.5 border-b border-black/5 dark:border-white/10">
              <div className="flex items-center gap-2 sm:gap-2.5">
                <div className="flex h-8.5 w-8.5 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-[#008069] text-white font-bold text-xs shadow-xs">
                  <MessageCircle className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                    {category.businessName}
                  </p>
                  <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Cuenta Verificada · En línea
                  </p>
                </div>
              </div>
              <span className="rounded-full bg-white/90 dark:bg-slate-800 px-2 py-0.5 text-[9px] sm:text-[10px] font-bold text-slate-600 dark:text-slate-300 shadow-2xs">
                Mensaje Automático
              </span>
            </div>

            {/* Bubble 1: Instant Confirmation (WhatsApp Native Format) */}
            <div className="rounded-2xl rounded-tl-xs bg-white dark:bg-slate-800 p-2.5 sm:p-3 text-xs text-slate-800 dark:text-slate-200 shadow-xs space-y-1">
              <div className="flex items-center gap-1 text-[#008069] dark:text-emerald-400 font-bold text-[11px]">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>¡Tu turno está confirmado!</span>
              </div>
              <div className="rounded-xl bg-slate-50 dark:bg-slate-900/60 p-2 text-[11px] font-medium space-y-1 border border-slate-100 dark:border-white/5">
                <p className="flex items-center gap-1.5"><Scissors className="h-3 w-3 text-brand shrink-0" /> <strong className="text-slate-900 dark:text-white">Servicio:</strong> {category.heroExample}</p>
                <p className="flex items-center gap-1.5"><User className="h-3 w-3 text-emerald-600 shrink-0" /> <strong className="text-slate-900 dark:text-white">Profesional:</strong> Colaborador 1</p>
                <p className="flex items-center gap-1.5"><Calendar className="h-3 w-3 text-brand shrink-0" /> <strong className="text-slate-900 dark:text-white">Fecha:</strong> Este viernes · 16:30 hs</p>
                <p className="flex items-center gap-1.5"><MapPin className="h-3 w-3 text-emerald-600 shrink-0" /> <strong className="text-slate-900 dark:text-white">Lugar:</strong> {category.businessName} (Asunción)</p>
              </div>
              <div className="pt-0.5 flex items-center justify-between text-[10px] text-slate-400">
                <span className="flex items-center gap-1 text-brand font-semibold">
                  <Calendar className="h-3 w-3" /> Añadido a tu calendario
                </span>
                <span className="flex items-center gap-0.5">
                  14:32 <CheckCheck className="h-3.5 w-3.5 text-[#53bdeb]" />
                </span>
              </div>
            </div>

            {/* Bubble 2: 24h Interactive Reminder */}
            <div className="rounded-2xl rounded-tl-xs bg-white dark:bg-slate-800 p-2.5 sm:p-3 text-xs text-slate-800 dark:text-slate-200 shadow-xs space-y-1.5">
              <p className="font-bold text-slate-900 dark:text-white text-[11px] flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                <span>Recordatorio de Turno</span>
              </p>
              <p className="leading-snug text-[11px]">
                Hola, te recordamos tu cita de <strong className="text-slate-900 dark:text-white">{category.heroExample}</strong> para mañana a las <strong className="text-slate-900 dark:text-white">16:30 hs</strong>.
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">Por favor confirmá tu asistencia:</p>
              <div className="flex gap-1.5 sm:gap-2 pt-0.5">
                <button
                  type="button"
                  className="flex-1 inline-flex items-center justify-center gap-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 py-1.5 px-1.5 sm:px-2 text-[10px] xs:text-[11px] font-bold text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700/60 shadow-2xs hover:bg-emerald-100 transition cursor-pointer"
                >
                  <Check className="h-3 w-3 text-emerald-600 shrink-0" />
                  <span>Sí, confirmo</span>
                </button>
                <button
                  type="button"
                  className="flex-1 inline-flex items-center justify-center gap-1 rounded-xl bg-slate-100 dark:bg-slate-700/80 py-1.5 px-1.5 sm:px-2 text-[10px] xs:text-[11px] font-semibold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600 hover:bg-slate-200 transition cursor-pointer"
                >
                  <RefreshCw className="h-3 w-3 text-slate-500 shrink-0" />
                  <span>Reprogramar</span>
                </button>
              </div>
              <div className="pt-0.5 text-right text-[10px] text-slate-400 flex items-center justify-end gap-0.5">
                Jueves 16:30 <CheckCheck className="h-3.5 w-3.5 text-[#53bdeb]" />
              </div>
            </div>

            {/* Bubble 3: 2h Alert */}
            <div className="rounded-2xl rounded-tl-xs bg-white dark:bg-slate-800 p-2.5 sm:p-3 text-xs text-slate-800 dark:text-slate-200 shadow-xs space-y-1">
              <p className="font-bold text-amber-600 dark:text-amber-400 text-[11px] flex items-center gap-1">
                <MapPin className="h-3 w-3" /> Tu turno es en 2 horas
              </p>
              <p className="leading-snug text-[11px]">
                Te esperamos en nuestro local. Contamos con estacionamiento exclusivo para clientes.
              </p>
              <div className="pt-0.5 text-right text-[10px] text-slate-400 flex items-center justify-end gap-0.5">
                Viernes 14:30 <CheckCheck className="h-3.5 w-3.5 text-[#53bdeb]" />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function Bullet({
  icon,
  children,
}: {
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <li className="flex items-start gap-2.5 rounded-2xl border border-slate-100 dark:border-white/10 bg-slate-50/80 dark:bg-slate-900/60 p-3 text-xs sm:text-sm text-slate-700 dark:text-slate-300 hover:border-brand/30 hover:-translate-y-0.5 hover:shadow-xs transition-all duration-200">
      {icon}
      <div>{children}</div>
    </li>
  );
}
