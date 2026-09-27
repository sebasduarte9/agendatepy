"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Scissors,
  Smile,
  StretchHorizontal,
  Sparkles,
  Stethoscope,
  PawPrint,
  ShieldCheck,
  Zap,
  ArrowRight,
  MessageCircle,
  Star,
  CheckCircle2,
} from "lucide-react";
import { CATEGORIES, type CategoryId } from "@/lib/categories";
import { useCategory } from "@/context/CategoryContext";
import PhoneMockup from "./PhoneMockup";

const ICONS: Record<CategoryId, typeof Scissors> = {
  peluqueria: Scissors,
  odontologia: Smile,
  pilates: StretchHorizontal,
  spas: Sparkles,
  medicos: Stethoscope,
  veterinarias: PawPrint,
};

export default function Hero() {
  const { selectedCategory, setSelectedCategory, category } = useCategory();

  return (
    <section id="inicio" className="relative overflow-hidden pt-8 pb-16 lg:pt-14 lg:pb-24">
      {/* Background ambient lighting */}
      <div className="pointer-events-none absolute -top-40 right-0 h-[600px] w-[600px] rounded-full bg-gradient-to-br from-brand/20 via-orange-500/10 to-transparent blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 left-0 h-[500px] w-[500px] rounded-full bg-gradient-to-tr from-emerald-500/15 via-brand/10 to-transparent blur-3xl" />

      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-12">
        {/* Left Column: High-Converting Value Proposition */}
        <div className="lg:col-span-7 flex flex-col justify-center">
          {/* Geolocation & Validation Pill */}
          <div className="inline-flex items-center gap-2 rounded-full border border-brand/20 bg-white/90 dark:bg-slate-900/90 px-3.5 py-1.5 text-xs font-bold text-brand shadow-xs backdrop-blur-sm w-fit">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
            <span>Diseñado en Paraguay para negocios locales</span>
          </div>

          {/* Hard-Hitting Pain & Benefit Headline */}
          <h1 className="mt-5 text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.08]">
            Llená tu agenda en automático y reducí 80% las cancelaciones{" "}
            <span className="bg-gradient-to-r from-brand via-[#FF6B4A] to-amber-500 bg-clip-text text-transparent">
              por WhatsApp.
            </span>
          </h1>

          <p className="mt-5 max-w-2xl text-base sm:text-lg leading-relaxed text-slate-600 dark:text-slate-300">
            Tus clientes reservan 24/7 sin que pases horas respondiendo mensajes. Confirmaciones inmediatas, recordatorios inteligentes que sí leen y comisiones de tu equipo calculadas sin planillas.
          </p>

          {/* Interactive Category Selector */}
          <div className="mt-6">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
              Probá la experiencia para tu rubro:
            </p>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((item) => {
                const Icon = ICONS[item.id];
                const active = selectedCategory === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedCategory(item.id)}
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition active:scale-95 ${
                      active
                        ? "border-brand bg-brand text-white shadow-md shadow-brand/25 font-bold"
                        : "border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-brand/40 shadow-xs"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* High-Converting CTAs */}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            {/* Primary Action Button */}
            <motion.a
              href="/onboarding"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-brand to-[#FF6B4A] px-7 py-3.5 text-sm sm:text-base font-bold text-white shadow-xl shadow-brand/35 hover:brightness-110 transition active:scale-98"
              animate={{ scale: [1, 1.015, 1] }}
              transition={{ duration: 2.5, repeat: Infinity }}
            >
              <Zap className="h-4 w-4 fill-amber-300 text-amber-300" />
              <span>Prueba gratuitamente</span>
            </motion.a>

            {/* Direct WhatsApp Sales / Fast Track CTA */}
            <a
              href={`https://wa.me/595981123456?text=Hola%2C%20quiero%20probar%20AgendatePY%20gratuitamente%20para%20mi%20negocio%20(${category.label})`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-50 dark:bg-emerald-950/40 px-5 py-3.5 text-sm font-bold text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 shadow-xs transition"
            >
              <MessageCircle className="h-4 w-4 text-emerald-600 fill-emerald-600" />
              <span>Hablar por WhatsApp</span>
            </a>

            {/* Live Web Demo Link */}
            <Link
              href="/barberia/reservar"
              className="inline-flex items-center justify-center gap-1.5 px-4 py-3.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-brand transition"
            >
              <span>Ver agenda en vivo</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Risk Reversal Guarantee */}
          <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 font-medium">
            <span className="flex items-center gap-1">
              <ShieldCheck className="h-4 w-4 text-emerald-500" /> 14 días sin costo
            </span>
            <span>·</span>
            <span>Sin tarjeta de crédito</span>
            <span>·</span>
            <span>Activación en 3 minutos</span>
            <span>·</span>
            <span>Soporte local en Guaraníes</span>
          </div>

          {/* Social Proof & Metrics */}
          <div className="mt-8 pt-6 border-t border-slate-200/80 dark:border-white/10">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-amber-400" />
                ))}
              </div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                4.9 / 5 estrellas
              </span>
              <span className="text-xs text-slate-500">
                · Más de 40 salones y clínicas en Asunción, CDE y Encarnación
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">4.800+</p>
                <p className="text-xs text-slate-500 font-medium mt-0.5">Turnos mensuales</p>
              </div>
              <div>
                <p className="text-2xl font-black text-brand tracking-tight">85%</p>
                <p className="text-xs text-slate-500 font-medium mt-0.5">Menos inasistencias</p>
              </div>
              <div>
                <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">0%</p>
                <p className="text-xs text-slate-500 font-medium mt-0.5">Comisión x turno</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Phone Mockup with WhatsApp UI */}
        <div className="lg:col-span-5 flex justify-center mt-6 lg:mt-0">
          <PhoneMockup />
        </div>
      </div>
    </section>
  );
}
