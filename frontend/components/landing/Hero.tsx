"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  ShieldCheck,
  ArrowRight,
  Gem,
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
  Activity,
} from "lucide-react";
import { CATEGORIES, TICKER_ITEMS, type CategoryId, type TickerItem } from "@/lib/categories";
import { useCategory } from "@/context/CategoryContext";
import { getCommercialWhatsAppUrl } from "@/lib/config/whatsapp";
import WhatsAppToAgendaLive from "./WhatsAppToAgendaLive";
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

const TICKER_ICON_MAP: Record<TickerItem["iconKey"], typeof Scissors> = {
  scissors: Scissors,
  smile: Smile,
  gem: Gem,
  activity: Activity,
  stethoscope: Stethoscope,
  dumbbell: Dumbbell,
  paw: PawPrint,
  wrench: Wrench,
};

export default function Hero() {
  const { selectedCategory, setSelectedCategory, category } = useCategory();

  const whatsappMessage = `Hola AgendatePY, tengo un negocio de ${
    category?.label?.toLowerCase() || "servicios"
  } y quiero activar mi agenda online`;

  return (
    <section
      id="inicio"
      className="relative pt-1 sm:pt-4 pb-0 sm:pb-24 scroll-mt-24 overflow-x-clip max-w-full min-h-[calc(100dvh-4.25rem)] md:min-h-0 flex flex-col justify-between"
    >
      <div className="relative mx-auto max-w-7xl px-3 sm:px-6 w-full flex-1 flex flex-col justify-between">
        
        {/* ============================================================== */}
        {/* MOBILE LAYOUT (< md): Con el arco superior exacto de la captura*/}
        {/* ============================================================== */}
        <div className="md:hidden flex flex-col items-center text-center w-full my-auto py-3 xs:py-5 flex-1 justify-center overflow-visible">
          
          {/* Bloque superior: Órbita coronando el titular con respiro natural */}
          <div className="w-full flex flex-col items-center">
            {/* Órbita en arco parabólico continuo */}
            <div className="relative w-full flex justify-center h-12 xs:h-14 mb-3.5 xs:mb-4.5 overflow-visible">
              <HorizontalCardOrbit />
            </div>

            {/* Titular móvil centrado y proporcionado con respiración entre líneas */}
            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="text-center font-sans tracking-tight"
            >
              <span className="block text-[34px] xs:text-[40px] font-black text-slate-950 dark:text-white leading-[1.08] tracking-tight">
                Gestioná tu agenda
              </span>
              <span className="block text-[22px] xs:text-[26px] font-bold text-slate-800 dark:text-slate-200 leading-snug mt-1.5 xs:mt-2">
                y tu negocio con
              </span>
              <span className="inline-flex items-center justify-center gap-0.5 xs:gap-1 text-[42px] xs:text-[48px] font-black text-[#FF4F2B] tracking-tight mt-1.5 xs:mt-2">
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
                <span>gendatepy</span>
              </span>
            </motion.h1>

            {/* Subtítulo móvil */}
            <p className="mt-3.5 xs:mt-4 text-center text-xs xs:text-sm font-semibold text-slate-600 dark:text-slate-300 max-w-[320px] xs:max-w-[340px] mx-auto leading-relaxed">
              Mejor control para tu negocio y tus reservas{" "}
              <span className="text-[#FF4F2B] font-black">24/7</span>
            </p>
          </div>

          {/* CTAs Móvil conectados armónicamente sin huecos gigantes */}
          <div className="mt-6 xs:mt-7 flex flex-col gap-3 w-full max-w-[340px] xs:max-w-sm mx-auto px-2">
            <Link
              href="/onboarding"
              className="w-full block group active:scale-98 transition-transform"
            >
              <LiquidGlass
                cornerRadius={999}
                padding="13px 24px"
                overLight={false}
                showGlare={false}
                useDisplacement={false}
                interactive={false}
                className="w-full bg-[#FF4F2B] hover:bg-[#F04420] text-white shadow-lg shadow-[#FF4F2B]/20 border border-white/20 transition-all"
              >
                <div className="inline-flex items-center justify-center gap-2.5 text-base font-bold text-white whitespace-nowrap">
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

            <div className="flex items-center justify-center mt-1.5 xs:mt-2">
              <LiquidGlass
                cornerRadius={999}
                padding="5px 16px"
                overLight={true}
                showGlare={false}
                useDisplacement={false}
                interactive={false}
                className="bg-white/60 dark:bg-slate-900/60 border border-slate-200/80 dark:border-white/10 shadow-2xs"
              >
                <div className="flex items-center gap-3 text-xs font-semibold text-slate-700 dark:text-slate-300">
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
        </div>

        {/* ============================================================== */}
        {/* DESKTOP / TABLET LAYOUT (md: and up): Hero centrado con arco   */}
        {/* (100% INTACTO: Preserva el diseño de PC aprobado por el usuario)*/}
        {/* ============================================================== */}
        <div className="hidden md:flex relative min-h-[78vh] flex-col items-center justify-center px-4 sm:px-6 max-w-7xl mx-auto w-full">
          <div className="relative z-20 flex flex-col items-center text-center max-w-4xl mx-auto py-8 pointer-events-auto">
            {/* Órbita en arco parabólico continuo que sigue el trazo rojo */}
            <HorizontalCardOrbit />

            {/* Titular Monumental Centrado */}
            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="text-4xl xs:text-5xl sm:text-6xl md:text-7xl lg:text-[76px] font-black tracking-tight text-slate-950 dark:text-white leading-[1.06] mt-22 sm:mt-24 md:mt-26 lg:mt-28"
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
                  <span>gendatepy</span>
                </span>
              </span>
            </motion.h1>

            {/* Subtítulo centrado limpio y persuasivo */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="mt-4 sm:mt-5 w-full max-w-4xl mx-auto px-4"
            >
              <p className="text-lg sm:text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100 leading-snug text-center whitespace-nowrap">
                Mejor control para tu negocio y tus reservas{" "}
                <span className="text-[#FF4F2B] font-black">24/7</span>
              </p>
            </motion.div>

            {/* Botones de Acción (CTAs) centrados */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="mt-6 sm:mt-7 flex flex-row items-center justify-center gap-3.5 sm:gap-4 w-full max-w-2xl mx-auto"
            >
              <Link
                href="/onboarding"
                className="w-auto block group active:scale-98 transition-transform shrink-0"
              >
                <LiquidGlass
                  cornerRadius={999}
                  padding="15px 36px"
                  overLight={false}
                  showGlare={false}
                  useDisplacement={false}
                  className="bg-[#FF4F2B] hover:bg-[#F04420] text-white shadow-xl shadow-[#FF4F2B]/25 transition-all border border-white/20 flex items-center justify-center"
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
                className="w-auto inline-flex items-center justify-center gap-2.5 px-8 py-[15px] text-base sm:text-lg font-bold bg-[#25D366] hover:bg-[#20ba59] text-white rounded-full shadow-xl shadow-[#25D366]/25 border border-white/20 transition-all active:scale-98 whitespace-nowrap shrink-0 group"
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
              className="mt-3 flex items-center justify-center"
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
          </div>
        </div>
    </div>

      {/* ============================================================== */}
      {/* FRANJA FULL-WIDTH DE RUBROS CON DISEÑO TICKER ELEGANTE         */}
      {/* ============================================================== */}
      <div className="relative z-20 w-full mt-auto pt-2 sm:pt-12 mb-1 sm:mb-8">
        <div className="text-center mb-1.5 sm:mb-3">
          <p className="text-[10px] xs:text-[11px] sm:text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
            SOLUCIÓN A MEDIDA PARA TU NEGOCIO:
          </p>
        </div>
        <div className="w-full border-y border-slate-200/70 dark:border-white/10 bg-white/40 dark:bg-slate-950/40 backdrop-blur-md py-2.5 xs:py-3 sm:py-4 transition-colors overflow-hidden overflow-x-clip max-w-full">
          <div className="ticker-mask overflow-hidden max-w-full">
            <Marquee duration="30s" gap="2.5rem" repeat={3} pauseOnHover>
              {TICKER_ITEMS.map((item, idx) => {
                const IconComponent = TICKER_ICON_MAP[item.iconKey] || Scissors;
                return (
                  <div
                    key={`hero-ticker-${item.label}-${idx}`}
                    className="inline-flex items-center gap-2 select-none whitespace-nowrap text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200"
                  >
                    <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#FF4F2B]/10 text-[#FF4F2B] dark:text-[#FF6B4A] shrink-0">
                      <IconComponent className="h-3.5 w-3.5" />
                    </span>
                    <span>{item.label}</span>
                    <span className="text-slate-300 dark:text-slate-700 ml-4 sm:ml-6 select-none">·</span>
                  </div>
                );
              })}
            </Marquee>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* SEGUNDA SECCIÓN: DEMO INTERACTIVA DE WHATSAPP Y AGENDA EN VIVO */}
      {/* ============================================================== */}
      <div
        id="simulador-whatsapp"
        className="hidden md:flex relative pt-6 sm:pt-10 flex-col items-center scroll-mt-20 overflow-x-clip px-4"
      >
        {/* Encabezado explicativo del módulo de WhatsApp y Agenda */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center max-w-3xl mx-auto mb-10 sm:mb-12 space-y-3"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-slate-950 dark:text-white leading-[1.12]">
            De una conversación en WhatsApp a tu{" "}
            <span className="bg-gradient-to-r from-[#FF5B37] via-[#FF441F] to-amber-500 bg-clip-text text-transparent">
              agenda web
            </span>
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Tus clientes chatean con la IA y ella se encarga de hacer el registro por ti.
          </p>
        </motion.div>

        {/* Demo en vivo: WhatsApp a la izquierda y Agenda sincronizándose a la derecha */}
        <div className="w-full flex justify-center max-w-full">
          <WhatsAppToAgendaLive />
        </div>

        {/* Simulador de reserva en vivo colocado directamente debajo */}
        <div className="mt-16 sm:mt-24 w-full">
          <LiveBookingSimulator />
        </div>
      </div>
    </section>
  );
}
