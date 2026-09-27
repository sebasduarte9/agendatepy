"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { CheckCircle2, Clock, Bell, Sparkles, ArrowRight, MessageCircle, Calendar, CheckCheck } from "lucide-react";
import { useCategory } from "@/context/CategoryContext";

export default function WhatsAppShowcase() {
  const { category } = useCategory();

  return (
    <section id="whatsapp" className="relative bg-white dark:bg-slate-950 py-16 sm:py-24 border-t border-slate-100 dark:border-slate-800/80">
      <div className="mx-auto grid max-w-6xl items-center gap-10 sm:gap-12 px-4 sm:px-6 lg:grid-cols-12">
        {/* Left Column: Value Prop & Bullets */}
        <div className="lg:col-span-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-50 dark:bg-emerald-950/40 px-3.5 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-400">
            <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
            <span>WhatsApp Cloud API Oficial</span>
          </div>

          <h2 className="mt-4 text-2xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
            Recordatorios automáticos que tus clientes <span className="text-emerald-600">sí leen</span> y responden
          </h2>

          <p className="mt-4 text-slate-600 dark:text-slate-300 leading-relaxed text-sm sm:text-base">
            Confirmaciones al instante y recordatorios configurados para tu rubro:{" "}
            <strong className="text-slate-900 dark:text-white">{category.label}</strong> en {category.businessName}.
          </p>

          <ul className="mt-6 sm:mt-8 space-y-3">
            <Bullet icon={<CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />}>
              <strong className="text-slate-900 dark:text-white block">Confirmación inmediata:</strong>
              Comprobante digital con enlace para agendar directamente en Google Calendar o Apple Wallet.
            </Bullet>
            <Bullet icon={<Clock className="h-5 w-5 text-brand shrink-0 mt-0.5" />}>
              <strong className="text-slate-900 dark:text-white block">Recordatorio 24 horas antes:</strong>
              Botones de respuesta rápida para confirmar asistencia o avisar con tiempo para reprogramar.
            </Bullet>
            <Bullet icon={<Bell className="h-5 w-5 text-indigo-500 shrink-0 mt-0.5" />}>
              <strong className="text-slate-900 dark:text-white block">Aviso 2 horas previas:</strong>
              Hasta 80% menos ausencias comprobadas en salones y consultorios locales en Paraguay.
            </Bullet>
          </ul>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/onboarding"
              className="inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 text-xs sm:text-sm font-bold text-white shadow-md shadow-brand/25 hover:brightness-110 transition active:scale-95"
            >
              <span>Prueba gratuitamente</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <a
              href="https://wa.me/595981123456?text=Hola%2C%20quiero%20ver%20c%C3%B3mo%20funcionan%20los%20recordatorios%20por%20WhatsApp"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-emerald-700 dark:text-emerald-400 hover:underline px-3 py-2"
            >
              <span>Probar bot por WhatsApp</span>
              <ArrowRight className="h-3 w-3" />
            </a>
          </div>
        </div>

        {/* Right Column: Clean WhatsApp Automated Sequence Card */}
        <div className="lg:col-span-6 flex justify-center">
          <div className="w-full max-w-md rounded-3xl border border-slate-200/90 dark:border-white/10 bg-[#efeae2] dark:bg-slate-900 p-4 sm:p-5 shadow-sm space-y-3">
            {/* Header of message view */}
            <div className="flex items-center justify-between pb-3 border-b border-black/5 dark:border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#008069] text-white">
                  <MessageCircle className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">
                    {category.businessName} (Oficial)
                  </p>
                  <p className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Cuenta de Empresa Verificada
                  </p>
                </div>
              </div>
              <span className="rounded-full bg-white/80 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-mono text-slate-500">
                Automático
              </span>
            </div>

            {/* Bubble 1: Instant Confirmation */}
            <div className="rounded-2xl rounded-tl-xs bg-white dark:bg-slate-800 p-3.5 text-xs text-slate-800 dark:text-slate-200 shadow-xs space-y-1.5">
              <p className="font-bold text-[#008069] text-[11px]">Confirmación de Turno</p>
              <p className="leading-relaxed">
                ¡Hola! Tu turno para <strong>{category.heroExample}</strong> fue reservado con éxito para este viernes a las 16:30 hs.
              </p>
              <div className="pt-1 flex items-center justify-between text-[10px] text-slate-400">
                <span className="flex items-center gap-1 text-brand font-semibold">
                  <Calendar className="h-3 w-3" /> Añadido a tu calendario
                </span>
                <span className="flex items-center gap-0.5">
                  14:32 <CheckCheck className="h-3.5 w-3.5 text-blue-500" />
                </span>
              </div>
            </div>

            {/* Bubble 2: 24h Reminder */}
            <div className="rounded-2xl rounded-tl-xs bg-white dark:bg-slate-800 p-3.5 text-xs text-slate-800 dark:text-slate-200 shadow-xs space-y-1.5">
              <p className="font-bold text-indigo-600 dark:text-indigo-400 text-[11px]">Aviso 24 Horas Antes</p>
              <p className="leading-relaxed">
                Recordatorio: Mañana te esperamos para tu cita de <strong>{category.heroExample}</strong> en {category.businessName}.
              </p>
              <div className="pt-2 flex gap-2">
                <span className="flex-1 text-center rounded-xl bg-emerald-50 dark:bg-emerald-950/60 py-1.5 text-[11px] font-bold text-emerald-800 dark:text-emerald-300 border border-emerald-200/60">
                  Confirmar asistencia
                </span>
                <span className="flex-1 text-center rounded-xl bg-slate-100 dark:bg-slate-700 py-1.5 text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                  Reprogramar
                </span>
              </div>
              <div className="pt-1 text-right text-[10px] text-slate-400 flex items-center justify-end gap-0.5">
                Jueves 16:30 <CheckCheck className="h-3.5 w-3.5 text-blue-500" />
              </div>
            </div>

            {/* Bubble 3: 2h Alert */}
            <div className="rounded-2xl rounded-tl-xs bg-white dark:bg-slate-800 p-3.5 text-xs text-slate-800 dark:text-slate-200 shadow-xs space-y-1">
              <p className="font-bold text-amber-600 dark:text-amber-400 text-[11px]">Aviso 2 Horas Previas</p>
              <p className="leading-relaxed">
                ¡Tu turno es en 2 horas! Te esperamos en nuestro local con estacionamiento disponible.
              </p>
              <div className="pt-1 text-right text-[10px] text-slate-400 flex items-center justify-end gap-0.5">
                Viernes 14:30 <CheckCheck className="h-3.5 w-3.5 text-blue-500" />
              </div>
            </div>
          </div>
        </div>
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
    <li className="flex items-start gap-3 rounded-2xl border border-slate-100 dark:border-white/10 bg-slate-50/80 dark:bg-slate-900/60 p-3.5 sm:p-4 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
      {icon}
      <div>{children}</div>
    </li>
  );
}
