"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, MessageCircle, Sparkles } from "lucide-react";
import { getCommercialWhatsAppUrl } from "@/lib/config/whatsapp";

const TRUST_POINTS = [
  "14 días gratis sin tarjeta",
  "Activación en 3 minutos",
  "0% de comisiones por reserva",
  "Soporte local en Paraguay",
];

export default function BottomCta() {
  const whatsappUrl = getCommercialWhatsAppUrl(
    "Hola, quiero probar AgendatePY para mi negocio en Paraguay"
  );

  return (
    <section className="relative py-12 sm:py-20">
      <div className="mx-auto max-w-7xl px-3 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          className="relative overflow-hidden rounded-3xl border border-slate-200/90 dark:border-white/10 bg-gradient-to-b from-brand/5 via-white to-slate-50/90 dark:from-slate-900/90 dark:via-slate-900/60 dark:to-slate-950 p-6 xs:p-8 sm:p-12 lg:p-16 text-center shadow-[0_20px_50px_-20px_rgba(255,87,34,0.12)] backdrop-blur-xl"
        >
          {/* Ambient Lighting Orbs */}
          <div
            className="pointer-events-none absolute -top-32 -left-32 h-80 w-80 rounded-full bg-brand/10 blur-3xl"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute -bottom-32 -right-32 h-80 w-80 rounded-full bg-emerald-500/10 blur-3xl"
            aria-hidden="true"
          />

          <div className="relative z-10 mx-auto max-w-2xl">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-1.5 rounded-full border border-brand/20 bg-brand/10 dark:bg-brand/20 px-3.5 py-1 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-brand">
              <Sparkles className="h-3.5 w-3.5 text-brand" />
              <span>Empezá a recibir turnos hoy</span>
            </div>

            {/* Headline */}
            <h2 className="mt-4 text-2xl xs:text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
              Gestioná tu agenda y negocio con{" "}
              <span className="bg-gradient-to-r from-brand via-[#FF6B4A] to-amber-500 bg-clip-text text-transparent">
                AgendatePY
              </span>
            </h2>

            {/* Subtitle */}
            <p className="mt-3 sm:mt-4 text-sm sm:text-lg font-medium text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl mx-auto">
              Mejor control para tu negocio y tus reservas 24/7
            </p>

            {/* Action Buttons */}
            <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
              <Link
                href="/onboarding"
                className="group w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-brand to-[#FF6B4A] px-6 sm:px-8 py-3.5 sm:py-4 text-sm sm:text-base font-black text-white shadow-xl shadow-brand/25 transition-all duration-300 hover:shadow-2xl hover:shadow-brand/40 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
              >
                <span>Crear mi agenda gratis</span>
                <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 transition-transform duration-200 group-hover:translate-x-1" />
              </Link>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/80 px-5 sm:px-6 py-3.5 sm:py-4 text-sm sm:text-base font-bold text-slate-800 dark:text-white shadow-xs backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 cursor-pointer"
              >
                <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5 text-[#25D366] fill-[#25D366]/20" />
                <span>Hablar con un asesor</span>
              </a>
            </div>

            {/* Trust points row */}
            <div className="mt-8 pt-6 sm:pt-8 border-t border-slate-200/80 dark:border-white/10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2.5 text-[11px] sm:text-xs text-slate-600 dark:text-slate-400 font-medium">
              {TRUST_POINTS.map((point) => (
                <div key={point} className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>{point}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
