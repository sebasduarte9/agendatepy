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
  ShieldCheck,
  ArrowRight,
  MessageCircle,
} from "lucide-react";
import { CATEGORIES, type CategoryId } from "@/lib/categories";
import { useCategory } from "@/context/CategoryContext";
import { getCommercialWhatsAppUrl } from "@/lib/config/whatsapp";
import PhoneMockup from "./PhoneMockup";

const ICONS: Record<CategoryId, typeof Scissors> = {
  peluqueria: Scissors,
  odontologia: Smile,
  pilates: StretchHorizontal,
  spas: Flower2,
  medicos: Stethoscope,
  veterinarias: PawPrint,
};

export default function Hero() {
  const { selectedCategory, setSelectedCategory, category } = useCategory();

  const whatsappMessage = "Hola AgendatePY, tengo un negocio de " + category.label.toLowerCase() + " y quiero activar mi agenda online";

  return (
    <section id="inicio" className="relative pt-3 sm:pt-8 pb-10 sm:pb-16 lg:pt-14 lg:pb-24 scroll-mt-20">
      <div className="relative mx-auto grid max-w-7xl items-center gap-6 sm:gap-12 px-3 sm:px-6 lg:grid-cols-12">
        {/* Left Column: High-Converting Value Proposition */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-7 flex flex-col justify-center min-w-0"
        >
          {/* Hard-Hitting Pain & Benefit Headline */}
          <h1 className="text-[22px] xs:text-2xl sm:text-4xl lg:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.12] sm:leading-[1.08] break-words">
            Llená tu agenda en automático y reducí 80% las cancelaciones{" "}
            <span className="bg-gradient-to-r from-brand via-[#FF6B4A] to-amber-500 bg-clip-text text-transparent">
              por WhatsApp.
            </span>
          </h1>

          <p className="mt-2.5 sm:mt-4 max-w-2xl text-xs xs:text-sm sm:text-base lg:text-lg leading-relaxed text-slate-600 dark:text-slate-300">
            <strong className="font-bold text-slate-900 dark:text-white block sm:inline">
              Tu agenda llena 24/7 sin pasar horas respondiendo mensajes.{" "}
            </strong>
            <span className="text-slate-600 dark:text-slate-300">
              Confirmaciones inmediatas y recordatorios automáticos por WhatsApp.
            </span>
          </p>

          {/* High-Converting Mobile-First CTAs */}
          <div className="mt-4 sm:mt-7 flex flex-col sm:flex-row sm:items-center gap-2.5 sm:gap-3">
            {/* Registration CTA Button */}
            <Link
              href="/onboarding"
              className="inline-flex items-center justify-center gap-2 px-6 sm:px-7 py-3 sm:py-3.5 text-sm sm:text-base font-bold bg-gradient-to-r from-brand to-[#FF6B4A] text-white rounded-full shadow-lg shadow-brand/25 hover:brightness-110 transition active:scale-98 w-full sm:w-fit"
            >
              <span>Registrate gratis ahora</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            {/* Direct WhatsApp Consultation CTA with dynamic category message */}
            <a
              href={getCommercialWhatsAppUrl(whatsappMessage)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3.5 text-xs sm:text-sm font-bold border border-emerald-500/30 dark:border-emerald-500/40 bg-emerald-500/10 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 rounded-full hover:bg-emerald-500/20 transition active:scale-98 w-full sm:w-fit"
            >
              <MessageCircle className="h-4 w-4 fill-emerald-500 text-emerald-500 shrink-0" />
              <span>Consultar por WhatsApp</span>
            </a>
          </div>

          {/* Risk Reversal Guarantee */}
          <div className="mt-3 flex flex-wrap items-center gap-2 sm:gap-3 text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium">
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

          {/* Interactive Category Selector with Mobile Live Cue */}
          <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-slate-200/60 dark:border-white/5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Probá la experiencia para tu rubro:
              </p>
              <a
                href="#simulador-whatsapp"
                className="sm:hidden text-[11px] font-bold text-brand hover:underline flex items-center gap-0.5"
              >
                <span>Ver bot en vivo</span>
                <ArrowRight className="h-3 w-3" />
              </a>
            </div>

            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {CATEGORIES.map((item) => {
                const Icon = ICONS[item.id];
                const active = selectedCategory === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedCategory(item.id)}
                    className={
                      "inline-flex items-center gap-1.5 rounded-full border px-2.5 sm:px-3.5 py-1 sm:py-1.5 text-[11px] sm:text-xs font-semibold transition-all duration-200 active:scale-95 cursor-pointer hover:-translate-y-0.5 " +
                      (active
                        ? "border-brand bg-brand text-white shadow-md shadow-brand/25 font-bold"
                        : "border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-brand/40 hover:shadow-xs shadow-2xs")
                    }
                  >
                    <Icon className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Mobile helper notice that reinforces live simulation */}
            <div className="sm:hidden mt-2 flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
              <span>Simulando bot para: <strong className="text-slate-800 dark:text-slate-200">{category.label}</strong></span>
            </div>
          </div>
        </motion.div>

        {/* Right Column: Interactive Phone Mockup with WhatsApp UI */}
        <motion.div
          id="simulador-whatsapp"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-5 flex justify-center mt-5 sm:mt-6 lg:mt-0 max-w-full scroll-mt-20"
        >
          <PhoneMockup />
        </motion.div>
      </div>
    </section>
  );
}
