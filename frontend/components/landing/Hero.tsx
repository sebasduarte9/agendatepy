"use client";

import { motion } from "framer-motion";
import {
  Scissors,
  Smile,
  StretchHorizontal,
  Sparkles,
  Stethoscope,
  PawPrint,
  ShieldCheck,
  Zap,
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
    <section id="inicio" className="relative overflow-hidden pt-8 pb-16 lg:pt-12 lg:pb-24">
      {/* Background ambient lighting */}
      <div className="pointer-events-none absolute -top-40 right-0 h-[600px] w-[600px] rounded-full bg-gradient-to-br from-brand/15 via-indigo-500/10 to-transparent blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 left-0 h-[500px] w-[500px] rounded-full bg-gradient-to-tr from-whatsapp/15 via-brand/10 to-transparent blur-3xl" />

      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-12">
        {/* Left Column: Value Prop */}
        <div className="lg:col-span-7">
          <div className="inline-flex items-center gap-2 rounded-full border border-brand/20 bg-white/90 px-3.5 py-1.5 text-xs font-bold text-brand shadow-xs backdrop-blur-sm">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
            <span>Plataforma de Turnos Online & WhatsApp en Paraguay</span>
          </div>

          <h1 className="mt-5 text-4xl font-black tracking-tight text-slate-900 sm:text-5xl lg:text-6xl leading-[1.08]">
            El sistema de reservas y gestión{" "}
            <span className="bg-gradient-to-r from-brand via-indigo-600 to-whatsapp bg-clip-text text-transparent">
              que hace crecer tu negocio
            </span>
          </h1>

          <h2 className="mt-5 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
            Permití que tus clientes elijan servicio, profesional y horario desde tu página web
            o directamente por WhatsApp con confirmaciones inmediatas, recordatorios anti-inasistencias,
            comisiones para tu equipo y cobro en Guaraníes.
          </h2>

          {/* Interactive Category Selector */}
          <div className="mt-7">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Probá cómo se ve para tu rubro:
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
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-xs font-semibold transition active:scale-95 ${
                      active
                        ? "border-brand bg-brand text-white shadow-md shadow-brand/25"
                        : "border-slate-200 bg-white text-slate-700 hover:border-brand/40 shadow-xs"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* CTAs */}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <motion.a
              href="/onboarding"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-brand px-7 py-3.5 text-sm font-bold text-white shadow-xl shadow-brand/30 hover:opacity-95 transition"
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 2.2, repeat: Infinity }}
            >
              <Zap className="h-4 w-4 fill-amber-300 text-amber-300" />
              Probar 30 Días Gratis
            </motion.a>
            <a
              href="#como-funciona"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-300 bg-white px-6 py-3.5 text-sm font-bold text-slate-800 hover:border-brand hover:text-brand shadow-xs transition"
            >
              Ver cómo funciona
            </a>
          </div>

          <div className="mt-4 flex items-center gap-4 text-xs text-slate-500 font-medium">
            <span className="flex items-center gap-1">
              <ShieldCheck className="h-4 w-4 text-emerald-500" /> Sin tarjeta de crédito
            </span>
            <span>·</span>
            <span>Setup en 3 minutos</span>
            <span>·</span>
            <span>Soporte local en Paraguay</span>
          </div>

          {/* Social Proof Stats */}
          <div className="mt-10 grid grid-cols-3 gap-3 border-t border-slate-200/80 pt-6">
            <div>
              <p className="text-2xl font-black text-slate-900 tracking-tight">4.800+</p>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Citas agendadas por mes</p>
            </div>
            <div>
              <p className="text-2xl font-black text-brand tracking-tight">85%</p>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Menos inasistencias (No-shows)</p>
            </div>
            <div>
              <p className="text-2xl font-black text-whatsapp tracking-tight">100%</p>
              <p className="text-xs text-slate-500 font-medium mt-0.5">WhatsApp Cloud API Oficial</p>
            </div>
          </div>
        </div>

        {/* Right Column: Hyper-Realistic 3D iPhone with Authentic WhatsApp UI */}
        <div className="lg:col-span-5 flex justify-center">
          <PhoneMockup />
        </div>
      </div>
    </section>
  );
}
