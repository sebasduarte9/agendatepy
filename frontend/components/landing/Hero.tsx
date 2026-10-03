"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  CalendarCheck,
  Landmark,
  Bell,
  Coins,
  Calendar,
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
  Clock,
  FileText,
  Share2,
  Smartphone,
  QrCode,
} from "lucide-react";
import { CATEGORIES, type CategoryId } from "@/lib/categories";
import { useCategory } from "@/context/CategoryContext";
import { getCommercialWhatsAppUrl } from "@/lib/config/whatsapp";
import PhoneMockup from "./PhoneMockup";
import PhoneOrbitNotifications from "./PhoneOrbitNotifications";
import Marquee from "@/components/ui/Marquee";
import CircularOrbitHero from "./CircularOrbitHero";
import LiquidGlass from "@/components/ui/LiquidGlass";
import { scrollToSection } from "@/lib/smoothScroll";
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

const ROW1_CARDS = [
  {
    id: "transferencia",
    icon: Landmark,
    iconBg: "bg-orange-50 text-brand dark:bg-orange-950/50 dark:text-[#FF6B4A]",
    title: "Seña Transferencia",
    badge: "Gs. 80.000",
    badgeColor: "bg-orange-100 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300",
    desc: "Transferencia verificada",
  },
  {
    id: "qr",
    icon: QrCode,
    iconBg: "bg-violet-50 text-violet-600 dark:bg-violet-950/50 dark:text-violet-400",
    title: "Cobro QR",
    badge: "0% Comisión",
    badgeColor: "bg-violet-100 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300",
    desc: "Bancard / Dinelco",
  },
  {
    id: "reserva",
    icon: CalendarCheck,
    iconBg: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400",
    title: "Reserva Confirmada",
    badge: "24/7",
    badgeColor: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300",
    desc: "Odontología · Hoy 16:30 hs",
  },
  {
    id: "caja",
    icon: Coins,
    iconBg: "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400",
    title: "Cierre de Caja",
    badge: "Cuadrado",
    badgeColor: "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300",
    desc: "Gs. 2.450.000 arqueado",
  },
  {
    id: "padel",
    icon: Trophy,
    iconBg: "bg-sky-50 text-sky-600 dark:bg-sky-950/50 dark:text-sky-400",
    title: "Pádel Cancha 1",
    badge: "Reservado",
    badgeColor: "bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300",
    desc: "Viernes 20:00 hs · Luces",
  },
  {
    id: "wallet",
    icon: Smartphone,
    iconBg: "bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400",
    title: "Tarjeta Digital",
    badge: "Apple Wallet",
    badgeColor: "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300",
    desc: "Puntos fidelización OK",
  },
  {
    id: "pilates",
    icon: StretchHorizontal,
    iconBg: "bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400",
    title: "Pase Reformer",
    badge: "8 Clases",
    badgeColor: "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300",
    desc: "Studio Pilates Aura",
  },
  {
    id: "vet",
    icon: PawPrint,
    iconBg: "bg-teal-50 text-teal-600 dark:bg-teal-950/50 dark:text-teal-400",
    title: "Vacunación Puppy",
    badge: "Completado",
    badgeColor: "bg-teal-100 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300",
    desc: "Veterinaria Pet Care",
  },
  {
    id: "gcal",
    icon: Calendar,
    iconBg: "bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400",
    title: "Google Calendar",
    badge: "Sync en vivo",
    badgeColor: "bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300",
    desc: "Actualización bilateral",
  },
  {
    id: "taller",
    icon: Wrench,
    iconBg: "bg-lime-50 text-lime-700 dark:bg-lime-950/50 dark:text-lime-400",
    title: "Alineación & Taller",
    badge: "En proceso",
    badgeColor: "bg-lime-100 text-lime-800 dark:bg-lime-950/60 dark:text-lime-300",
    desc: "Mecánica Express",
  },
];

const ROW2_CARDS = [
  {
    id: "recordatorio",
    icon: Bell,
    iconBg: "bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400",
    title: "Recordatorio 2h",
    badge: "Sin ausencias",
    badgeColor: "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300",
    desc: "Sofía confirmó asistencia",
  },
  {
    id: "barba",
    icon: Scissors,
    iconBg: "bg-purple-50 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400",
    title: "Corte & Barba Spa",
    badge: "Marcos B.",
    badgeColor: "bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300",
    desc: "Studio Barber Asunción",
  },
  {
    id: "comision",
    icon: CheckCircle2,
    iconBg: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400",
    title: "Liquidación Staff",
    badge: "Al día",
    badgeColor: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300",
    desc: "50% Staff · Gs. 480.000",
  },
  {
    id: "spa",
    icon: Flower2,
    iconBg: "bg-pink-50 text-pink-600 dark:bg-pink-950/50 dark:text-pink-400",
    title: "Masaje Relax",
    badge: "Confirmado",
    badgeColor: "bg-pink-100 text-pink-700 dark:bg-pink-950/60 dark:text-pink-300",
    desc: "Serena Spa · 17:30 hs",
  },
  {
    id: "bloqueo",
    icon: Clock,
    iconBg: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
    title: "Bloqueo de Agenda",
    badge: "Protegido",
    badgeColor: "bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-200",
    desc: "Almuerzo equipo 13:00 hs",
  },
  {
    id: "factura",
    icon: FileText,
    iconBg: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400",
    title: "Factura con RUC",
    badge: "Resimple OK",
    badgeColor: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300",
    desc: "Comprobante electrónico",
  },
  {
    id: "gym",
    icon: Dumbbell,
    iconBg: "bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400",
    title: "Crossfit WOD",
    badge: "Cupo lleno",
    badgeColor: "bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300",
    desc: "Iron Box · 18:00 hs",
  },
  {
    id: "medico",
    icon: Stethoscope,
    iconBg: "bg-cyan-50 text-cyan-600 dark:bg-cyan-950/50 dark:text-cyan-400",
    title: "Consulta Médica",
    badge: "Box 2",
    badgeColor: "bg-cyan-100 text-cyan-700 dark:bg-cyan-950/60 dark:text-cyan-300",
    desc: "Dr. Benítez · Hoy",
  },
  {
    id: "bio",
    icon: Share2,
    iconBg: "bg-fuchsia-50 text-fuchsia-600 dark:bg-fuchsia-950/50 dark:text-fuchsia-400",
    title: "Link en Bio",
    badge: "Instagram",
    badgeColor: "bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-950/60 dark:text-fuchsia-300",
    desc: "34 reservas online hoy",
  },
  {
    id: "seguridad",
    icon: ShieldCheck,
    iconBg: "bg-teal-50 text-teal-600 dark:bg-teal-950/50 dark:text-teal-400",
    title: "Telemetría & Auditoría",
    badge: "Seguro",
    badgeColor: "bg-teal-100 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300",
    desc: "Multi-tenant encriptado",
  },
];

export default function Hero() {
  const { selectedCategory, setSelectedCategory, category } = useCategory();

  const whatsappMessage = `Hola AgendatePY, tengo un negocio de ${category?.label?.toLowerCase() || "servicios"} y quiero activar mi agenda online`;

  return (
    <section
      id="inicio"
      className="relative pt-8 xs:pt-10 sm:pt-14 lg:pt-16 pb-10 sm:pb-16 lg:pb-20 scroll-mt-24 overflow-x-clip max-w-full"
    >
      <div className="relative mx-auto max-w-7xl px-3 sm:px-6">
        {/* ============================================================== */}
        {/* TABLET & DESKTOP LAYOUT (md: and up): Mockup 3D interactivo    */}
        {/* ============================================================== */}
        <div className="hidden md:grid items-center gap-6 lg:gap-12 md:grid-cols-12 min-h-[620px] lg:min-h-[680px]">
          {/* Columna Izquierda Desktop/Tablet */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
            className="md:col-span-7 flex flex-col justify-center text-left min-w-0"
          >
            {/* Badge pill Desktop con Liquid Glass */}
            <div className="mb-4 w-fit">
              <LiquidGlass
                displacementScale={32}
                blurAmount={0.08}
                saturation={140}
                aberrationIntensity={1.8}
                elasticity={0.25}
                cornerRadius={999}
                padding="8px 20px"
                overLight={true}
                className="bg-white/40 dark:bg-slate-900/40 border border-white/60 dark:border-white/20 shadow-md shadow-[#FF4F2B]/10 hover:shadow-lg transition-all"
              >
                <div className="inline-flex items-center gap-2 text-xs lg:text-sm font-bold tracking-wide text-slate-900 dark:text-white whitespace-nowrap">
                  <Sparkles className="h-4 w-4 text-[#FF4F2B]" />
                  <span>Gestión y reservas online automatizadas</span>
                </div>
              </LiquidGlass>
            </div>

            {/* Headline Desktop */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.14]">
              <span className="font-extrabold text-slate-900 dark:text-white">Gestioná tu agenda</span>{" "}
              <span className="font-medium text-slate-700 dark:text-slate-300">y negocio con</span>{" "}
              <span className="block mt-1.5 font-black bg-gradient-to-r from-brand via-[#FF6B4A] to-amber-500 bg-clip-text text-transparent">
                AgendatePY
              </span>
            </h1>

            {/* Subtítulo Desktop */}
            <p className="mt-6 lg:mt-7 max-w-xl text-lg md:text-xl lg:text-2xl font-bold leading-relaxed text-slate-800 dark:text-slate-100">
              Mejor control para tu negocio y tus reservas <span className="text-brand font-extrabold">24/7</span>
            </p>
            <p className="mt-2.5 max-w-xl text-base lg:text-lg font-normal leading-relaxed text-slate-600 dark:text-slate-300">
              Agendamiento automático por WhatsApp sin intermediarios, cobro de señas por transferencia bancaria y recordatorios que eliminan las ausencias.
            </p>

            {/* CTA Desktop */}
            <div className="mt-11 lg:mt-14 flex flex-wrap items-center gap-4">
              <Link href="/onboarding" className="inline-block group active:scale-98 transition-transform">
                <LiquidGlass
                  cornerRadius={999}
                  padding="14px 34px"
                  overLight={false}
                  showGlare={false}
                  useDisplacement={false}
                  className="bg-[#FF4F2B] hover:bg-[#F04420] text-white shadow-lg shadow-[#FF4F2B]/25 transition-all border border-white/20"
                >
                  <div className="inline-flex items-center justify-center gap-2.5 text-base lg:text-lg font-bold text-white whitespace-nowrap">
                    <span>Registrate gratis ahora</span>
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </LiquidGlass>
              </Link>

              <a
                href={getCommercialWhatsAppUrl(whatsappMessage)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-base font-bold bg-[#25D366] hover:bg-[#20ba59] text-white rounded-full shadow-md shadow-[#25D366]/20 transition-all active:scale-98 w-fit"
              >
                <MessageCircle className="h-4.5 w-4.5 fill-white stroke-none shrink-0" />
                <span>Consultar por WhatsApp</span>
              </a>
            </div>

            {/* Garantías de confianza Desktop en cápsula de cristal mate */}
            <div className="mt-4.5 w-fit">
              <LiquidGlass
                cornerRadius={999}
                padding="6px 18px"
                overLight={true}
                showGlare={false}
                useDisplacement={false}
                className="bg-white/50 dark:bg-slate-900/50 border border-slate-200/80 dark:border-white/15 shadow-2xs"
              >
                <div className="flex items-center gap-3 text-xs lg:text-sm text-slate-700 dark:text-slate-300 font-medium">
                  <span className="inline-flex items-center gap-1 font-bold text-slate-900 dark:text-white">
                    <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
                    <span>Sin tarjeta</span>
                  </span>
                  <span className="text-slate-400">·</span>
                  <span>Activación en 3 min</span>
                </div>
              </LiquidGlass>
            </div>

            {/* Selector de Rubros Desktop con Chips de Liquid Glass */}
            <div className="mt-7 pt-4 border-t border-slate-200/60 dark:border-white/5 w-full">
              <p className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2.5">
                Solución a medida para tu rubro:
              </p>
              <div className="flex flex-wrap items-center gap-2 py-1">
                {CATEGORIES.map((item) => {
                  const Icon = ICONS[item.id] || Scissors;
                  const active = selectedCategory === item.id;
                  return (
                    <button
                      key={`desk-${item.id}`}
                      type="button"
                      onClick={() => setSelectedCategory(item.id)}
                      className="group cursor-pointer active:scale-95 transition-transform"
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
                            : "bg-white/60 dark:bg-slate-900/60 border border-slate-200/80 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:border-[#FF4F2B]/40 hover:bg-white/80 dark:hover:bg-slate-800/80"
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
              </div>
            </div>
          </motion.div>

          {/* Columna Derecha Tablet/Desktop: Mockup 3D Interactivo */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
            className="md:col-span-5 flex justify-center max-w-full"
          >
            <div className="relative flex items-center justify-center scale-[0.84] lg:scale-100 origin-center">
              {/* Notificaciones satelitales girando concéntricamente detrás del teléfono */}
              <PhoneOrbitNotifications />
              {/* Teléfono interactivo en primer plano */}
              <div className="relative z-20">
                <PhoneMockup />
              </div>
            </div>
          </motion.div>
        </div>

        {/* ============================================================== */}
        {/* MOBILE LAYOUT (< md): Exclusivo para teléfonos                 */}
        {/* ============================================================== */}
        <div className="md:hidden flex flex-col justify-start text-left w-full pt-3 xs:pt-5 pb-2">
          {/* Bloque superior: Titular a la izquierda con Orbitador de tarjetas a la derecha */}
          <div className="relative w-full overflow-x-clip min-h-[300px] xs:min-h-[330px] flex items-center mb-5">
            {/* Titular monumental de alto impacto visual (El protagonista) */}
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
                    {/* Órbita de notificaciones anclada con precisión en la A del logo */}
                    <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none -z-0">
                      <CircularOrbitHero />
                    </span>
                  </span><span className="tracking-tight text-[#FF4F2B]">gendatePY</span>
                </span>
              </h1>
            </div>
          </div>

          {/* Subtítulo limpio y centrado */}
          <div className="relative z-20 mb-3.5 mt-5 xs:mt-7 text-center w-full">
            <p className="text-center text-base xs:text-lg font-bold text-slate-900 dark:text-slate-100 leading-snug mx-auto max-w-sm">
              Mejor control para tu negocio y tus reservas{" "}
              <span className="text-[#FF4F2B] font-black">24/7</span>
            </p>
          </div>

          {/* CTA Principal con Liquid Glass refinado (bajados con margen superior) */}
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
                <div className="inline-flex items-center justify-center gap-2.5 text-base xs:text-lg font-bold text-white">
                  <span>Registrate gratis ahora</span>
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </div>
              </LiquidGlass>
            </Link>

            {/* Botón WhatsApp */}
            <a
              href={getCommercialWhatsAppUrl(whatsappMessage)}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2.5 px-6 py-3.5 text-base font-bold bg-[#25D366] hover:bg-[#20ba59] text-white rounded-full shadow-md shadow-[#25D366]/20 transition-all active:scale-98"
            >
              <MessageCircle className="h-5 w-5 fill-white stroke-none shrink-0" />
              <span>Consultar por WhatsApp</span>
            </a>

            {/* Micro-copy centrado en cápsula de cristal mate sutil */}
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

          {/* Selector de Rubros / Solución a Medida: Espaciado óptimo para que sea visible en Safari sin que lo tape el buscador inferior */}
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

        {/* En mobile: La simulación interactiva de WhatsApp SOLO al scrollear hacia abajo, fuera del primer pantallazo */}
        <div id="simulador-whatsapp" className="md:hidden relative mt-20 xs:mt-24 sm:mt-28 pt-8 xs:pt-10 border-t border-slate-200/60 dark:border-white/5 flex flex-col items-center scroll-mt-20 overflow-x-clip">
          <div className="w-full flex justify-center max-w-full">
            <div className="relative flex items-center justify-center">
              <PhoneOrbitNotifications isMobile />
              <div className="relative z-20">
                <PhoneMockup />
              </div>
            </div>
          </div>
        </div>

        {/* Simulador de reserva en vivo colocado directamente debajo del simulador de WhatsApp con su separación */}
        <div className="mt-14 sm:mt-20">
          <LiveBookingSimulator />
        </div>
      </div>
    </section>
  );
}


