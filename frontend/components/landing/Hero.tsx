"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Scissors,
  Smile,
  StretchHorizontal,
  Flower2,
  Stethoscope,
  PawPrint,
  Dumbbell,
  Wrench,
  Trophy,
  MessageCircle,
} from "lucide-react";
import { CATEGORIES, type CategoryId } from "@/lib/categories";
import { useCategory } from "@/context/CategoryContext";
import { getCommercialWhatsAppUrl } from "@/lib/config/whatsapp";
import CircularOrbitHero from "./CircularOrbitHero";
import AIAnimationOptions from "./AIAnimationOptions";
import HorizontalCardOrbit from "./HorizontalCardOrbit";
import Marquee from "@/components/ui/Marquee";
import LiquidGlass from "@/components/ui/LiquidGlass";
import LiveBookingSimulator from "./LiveBookingSimulator";
import { OFFICIAL_LOGO_PATH } from "@/components/ui/BrandLogo";

const ICONS: Record<CategoryId, typeof Scissors> = {
  peluqueria: Scissors,
  odontologia: Smile,
  pilates: StretchHorizontal,
  spas: Flower2,
  medicos: Stethoscope,
  veterinarias: PawPrint,
  gimnasios: Dumbbell,
  talleres: Wrench,
  padel: Trophy,
};

export default function Hero() {
  const { selectedCategory, setSelectedCategory, category } = useCategory();

  const whatsappMessage = `Hola AgendatePY, tengo un negocio de ${
    category?.label?.toLowerCase() || "servicios"
  } y quiero activar mi agenda online`;

  return (
    <section
      id="inicio"
      className="relative pt-4 xs:pt-6 sm:pt-10 pb-16 sm:pb-24 scroll-mt-24 overflow-x-clip max-w-full"
    >
      <div className="relative mx-auto max-w-7xl px-3 sm:px-6">
        {/* ============================================================== */}
        {/* MOBILE LAYOUT (< md): Versión nativa con CircularOrbitHero     */}
        {/* (Cero lag, animación pura en GPU CSS a 120 FPS nativos)         */}
        {/* ============================================================== */}
        <div className="md:hidden flex flex-col justify-start text-left w-full pt-3 xs:pt-5 pb-2">
          {/* Bloque superior: Titular a la izquierda con Orbitador en la A */}
          <div className="relative w-full overflow-x-clip min-h-[300px] xs:min-h-[330px] flex items-center mb-5">
            <div className="relative z-10 max-w-[62%] xs:max-w-[58%] pointer-events-auto pr-1">
              <h1 className="text-left font-sans">
                <span className="block text-[42px] xs:text-[48px] font-black text-slate-950 dark:text-white leading-[1.05] tracking-tight">
                  Gestioná tu
                </span>
                <span className="block text-[42px] xs:text-[48px] font-black text-slate-950 dark:text-white leading-[1.05] tracking-tight">
                  agenda
                </span>
                <span className="block text-[22px] xs:text-[26px] font-medium text-slate-700 dark:text-slate-300 leading-snug tracking-normal mt-1">
                  y tu negocio con
                </span>
                <span className="relative inline-flex items-center flex-nowrap text-[40px] xs:text-[46px] font-black tracking-tight text-[#FF4F2B] leading-[1.04] mt-1.5">
                  <span className="relative inline-flex items-center justify-center shrink-0 mr-0.5 xs:mr-1">
                    <svg
                      viewBox="160 90 880 810"
                      className="h-[40px] w-[40px] xs:h-[46px] xs:w-[46px] shrink-0"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      role="img"
                      aria-label="AgendatePY Logo"
                    >
                      <path
                        fill="#FF4F2B"
                        fillRule="evenodd"
                        d={OFFICIAL_LOGO_PATH}
                      />
                    </svg>
                    {/* Órbita de notificaciones en PURE CSS (GPU 120 FPS sin JS lag) */}
                    <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none -z-0">
                      <CircularOrbitHero />
                    </span>
                  </span>
                  <span className="tracking-tight text-[#FF4F2B]">gendatePY</span>
                </span>
              </h1>
            </div>
          </div>

          {/* Subtítulo móvil */}
          <div className="relative z-20 mb-3.5 mt-5 xs:mt-7 text-center w-full">
            <p className="text-center text-base xs:text-lg font-bold text-slate-900 dark:text-slate-100 leading-snug mx-auto max-w-sm">
              Mejor control para tu negocio y tus reservas{" "}
              <span className="text-[#FF4F2B] font-black">24/7</span>
            </p>
          </div>

          {/* CTAs Móvil */}
          <div className="mt-4.5 xs:mt-6 flex flex-col gap-3">
            <Link
              href="/onboarding"
              className="w-full block group active:scale-98 transition-transform"
            >
              <LiquidGlass
                cornerRadius={999}
                padding="14px 24px"
                overLight={false}
                showGlare={false}
                useDisplacement={false}
                interactive={false}
                className="w-full bg-[#FF4F2B] hover:bg-[#F04420] text-white shadow-lg shadow-[#FF4F2B]/20 border border-white/20 transition-all"
              >
                <div className="inline-flex items-center justify-center gap-2.5 text-base xs:text-lg font-bold text-white whitespace-nowrap">
                  <span>Registrate gratis ahora</span>
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </div>
              </LiquidGlass>
            </Link>

            <a
              href={getCommercialWhatsAppUrl(whatsappMessage)}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2.5 px-6 py-3.5 text-base font-bold bg-[#25D366] hover:bg-[#20ba59] text-white rounded-full shadow-md shadow-[#25D366]/20 transition-all active:scale-98 whitespace-nowrap"
            >
              <MessageCircle className="h-5 w-5 fill-white stroke-none shrink-0" />
              <span>Consultar por WhatsApp</span>
            </a>

            <div className="flex items-center justify-center mt-1">
              <LiquidGlass
                cornerRadius={999}
                padding="5px 16px"
                overLight={true}
                showGlare={false}
                useDisplacement={false}
                interactive={false}
                className="bg-white/50 dark:bg-slate-900/50 border border-slate-200/80 dark:border-white/10 shadow-2xs"
              >
                <div className="flex items-center gap-4 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <span className="inline-flex items-center gap-1 font-bold text-slate-900 dark:text-white">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                    <span>Sin tarjeta</span>
                  </span>
                  <span className="text-slate-400">·</span>
                  <span>Activación en 3 min</span>
                </div>
              </LiquidGlass>
            </div>
          </div>

          {/* Selector de Rubros Móvil */}
          <div
            className="mt-14 xs:mt-16 sm:mt-18 pt-7 pb-6 border-t border-slate-200/80 dark:border-white/10 w-full"
            style={{ paddingBottom: "max(1.5rem, env(safe-area-inset-bottom))" }}
          >
            <p className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 text-center mb-3.5">
              SOLUCIÓN A MEDIDA PARA TU NEGOCIO:
            </p>
            <div className="relative overflow-hidden max-w-full ticker-mask py-2">
              <Marquee duration="32s" gap="0.625rem" repeat={3} pauseOnHover>
                {CATEGORIES.map((item, idx) => {
                  const Icon = ICONS[item.id] || Scissors;
                  const active = selectedCategory === item.id;
                  return (
                    <button
                      key={`mob-cat-${item.id}-${idx}`}
                      type="button"
                      onClick={() => setSelectedCategory(item.id)}
                      className="group cursor-pointer active:scale-95 transition-transform pointer-events-auto z-10 touch-manipulation select-none"
                    >
                      <LiquidGlass
                        cornerRadius={999}
                        padding="6px 14px"
                        overLight={!active}
                        showGlare={false}
                        useDisplacement={false}
                        interactive={false}
                        className={`transition-all duration-200 ${
                          active
                            ? "bg-[#FF4F2B] text-white border border-white/20 shadow-sm shadow-[#FF4F2B]/20"
                            : "bg-white/60 dark:bg-slate-900/60 border border-slate-200/80 dark:border-white/10 text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        <div className="inline-flex items-center gap-2 text-xs font-semibold whitespace-nowrap">
                          <Icon className="h-3.5 w-3.5" />
                          <span>{item.label}</span>
                        </div>
                      </LiquidGlass>
                    </button>
                  );
                })}
              </Marquee>
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* DESKTOP / TABLET LAYOUT (md: and up): Hero centrado con arco   */}
        {/* ============================================================== */}
        <div className="hidden md:flex relative min-h-[78vh] flex-col items-center justify-center px-4 sm:px-6 max-w-7xl mx-auto w-full">
        
        {/* ============================================================ */}
        {/* PRIMER PLANO: TITULAR MONUMENTAL Y LLAMADOS A LA ACCIÓN     */}
        {/* ============================================================ */}
        <div className="relative z-20 flex flex-col items-center text-center max-w-4xl mx-auto py-8 pointer-events-auto">
          {/* Órbita en arco parabólico continuo que sigue el trazo rojo */}
          <HorizontalCardOrbit />

          {/* Titular Monumental Centrado */}
          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="text-4xl xs:text-5xl sm:text-6xl md:text-7xl lg:text-[76px] font-black tracking-tight text-slate-950 dark:text-white leading-[1.06] mt-28 sm:mt-32 md:mt-36 lg:mt-40"
          >
            <span>Gestioná tu agenda y</span>{" "}
            <span className="block mt-1 sm:mt-2">
              negocio con{" "}
              <span className="relative inline-flex items-center flex-nowrap text-[#FF4F2B] drop-shadow-xs">
                <span className="relative inline-flex items-center justify-center shrink-0 mr-1">
                  <svg
                    viewBox="160 90 880 810"
                    className="h-[36px] w-[36px] xs:h-[46px] xs:w-[46px] sm:h-[58px] sm:w-[58px] lg:h-[68px] lg:w-[68px] shrink-0"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    role="img"
                    aria-label="AgendatePY Logo"
                  >
                    <path
                      fill="#FF4F2B"
                      fillRule="evenodd"
                      d={OFFICIAL_LOGO_PATH}
                    />
                  </svg>
                </span>
                <span>gendatePY</span>
              </span>
            </span>
          </motion.h1>

          {/* Subtítulo centrado limpio y persuasivo */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="mt-6 sm:mt-8 max-w-2xl mx-auto"
          >
            <p className="text-xl xs:text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 leading-snug">
              Mejor control para tu negocio y tus reservas{" "}
              <span className="text-[#FF4F2B] font-black">24/7</span>
            </p>
          </motion.div>

          {/* Botones de Acción (CTAs) centrados */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-4 w-full max-w-2xl mx-auto"
          >
            <Link
              href="/onboarding"
              className="w-full sm:w-auto block group active:scale-98 transition-transform shrink-0"
            >
              <LiquidGlass
                cornerRadius={999}
                padding="15px 36px"
                overLight={false}
                showGlare={false}
                useDisplacement={false}
                className="bg-[#FF4F2B] hover:bg-[#F04420] text-white shadow-xl shadow-[#FF4F2B]/25 transition-all border border-white/20 w-full flex items-center justify-center"
              >
                <div className="inline-flex items-center justify-center gap-2.5 text-base sm:text-lg font-bold text-white whitespace-nowrap">
                  <span>Registrate gratis ahora</span>
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </div>
              </LiquidGlass>
            </Link>

            <a
              href={getCommercialWhatsAppUrl(whatsappMessage)}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-[15px] text-base sm:text-lg font-bold bg-[#25D366] hover:bg-[#20ba59] text-white rounded-full shadow-xl shadow-[#25D366]/25 border border-white/20 transition-all active:scale-98 whitespace-nowrap shrink-0 group"
            >
              <MessageCircle className="h-5 w-5 fill-white stroke-none shrink-0 group-hover:scale-110 transition-transform" />
              <span className="whitespace-nowrap font-bold">Consultar por WhatsApp</span>
            </a>
          </motion.div>

          {/* Micro-copy de confianza */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.35 }}
            className="mt-4 flex items-center justify-center"
          >
            <LiquidGlass
              cornerRadius={999}
              padding="6px 18px"
              overLight={true}
              showGlare={false}
              useDisplacement={false}
              interactive={false}
              className="bg-white/70 dark:bg-slate-900/70 border border-slate-200/80 dark:border-white/10 shadow-2xs backdrop-blur-sm"
            >
              <div className="flex items-center gap-3.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                <span className="inline-flex items-center gap-1 font-bold text-slate-900 dark:text-white">
                  <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>Sin tarjeta</span>
                </span>
                <span className="text-slate-400">·</span>
                <span>Activación en 3 min</span>
              </div>
            </LiquidGlass>
          </motion.div>

          {/* Selector de Rubros / Solución a Medida Centrado */}
          <div className="mt-12 sm:mt-16 w-full max-w-4xl pt-6 border-t border-slate-200/70 dark:border-white/10">
            <p className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 text-center mb-4">
              SOLUCIÓN A MEDIDA PARA TU NEGOCIO:
            </p>
            <div className="relative overflow-hidden max-w-full ticker-mask py-1">
              <Marquee duration="34s" gap="0.75rem" repeat={3} pauseOnHover>
                {CATEGORIES.map((item, idx) => {
                  const Icon = ICONS[item.id] || Scissors;
                  const active = selectedCategory === item.id;
                  return (
                    <button
                      key={`hero-cat-${item.id}-${idx}`}
                      type="button"
                      onClick={() => setSelectedCategory(item.id)}
                      className="group cursor-pointer active:scale-95 transition-transform pointer-events-auto z-10 touch-manipulation select-none"
                    >
                      <LiquidGlass
                        cornerRadius={999}
                        padding="7px 16px"
                        overLight={!active}
                        showGlare={false}
                        useDisplacement={false}
                        interactive={false}
                        className={`transition-all duration-200 ${
                          active
                            ? "bg-[#FF4F2B] text-white border border-white/20 shadow-md shadow-[#FF4F2B]/25"
                            : "bg-white/70 dark:bg-slate-900/70 border border-slate-200/80 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:border-[#FF4F2B]/40 hover:bg-white dark:hover:bg-slate-800"
                        }`}
                      >
                        <div className="inline-flex items-center gap-2 text-xs font-semibold whitespace-nowrap">
                          <Icon className="h-3.5 w-3.5" />
                          <span>{item.label}</span>
                        </div>
                      </LiquidGlass>
                    </button>
                  );
                })}
              </Marquee>
            </div>
          </div>
        </div>
      </div>
    </div>

      {/* ============================================================== */}
      {/* SEGUNDA SECCIÓN: DEMO INTERACTIVA DE WHATSAPP Y AGENDA EN VIVO */}
      {/* (Ubicada fuera de la primera pantalla como solicitaste)        */}
      {/* ============================================================== */}
      <div
        id="simulador-whatsapp"
        className="relative mt-20 sm:mt-28 pt-12 sm:pt-16 border-t border-slate-200/70 dark:border-white/10 flex flex-col items-center scroll-mt-20 overflow-x-clip px-4"
      >
        {/* Encabezado explicativo del módulo de WhatsApp y Agenda */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-[#008069] dark:text-emerald-300 text-xs font-bold mb-1">
            <span className="w-2 h-2 rounded-full bg-[#008069] animate-pulse" />
            <span>DEMO INTERACTIVA EN TIEMPO REAL</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-slate-950 dark:text-white leading-[1.12]">
            De una conversación en WhatsApp a tu{" "}
            <span className="bg-gradient-to-r from-[#FF5B37] via-[#FF441F] to-amber-500 bg-clip-text text-transparent">
              agenda confirmada
            </span>
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Tus clientes conversan naturalmente con la IA y tu calendario se actualiza al milisegundo con 0 minutos invertidos por vos.
          </p>
        </div>

        {/* Las 3 opciones interactivas para elegir cuál te gusta más */}
        <div className="w-full flex justify-center max-w-full">
          <AIAnimationOptions />
        </div>

        {/* Simulador de reserva en vivo colocado directamente debajo */}
        <div className="mt-16 sm:mt-24 w-full">
          <LiveBookingSimulator />
        </div>
      </div>
    </section>
  );
}
