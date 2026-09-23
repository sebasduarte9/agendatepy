"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Palette,
  Check,
  Smartphone,
  Calendar,
  Clock,
  MessageCircle,
  TrendingUp,
  ShieldCheck,
  ChevronRight,
  ArrowRight,
  Layers,
  Type,
  Sun,
  Moon,
  Copy,
  Plus,
  Play,
  Pause,
  ExternalLink,
  Users,
  Award,
  Zap,
  Scissors,
  Crown,
  Leaf,
  Flower2,
  LayoutTemplate,
  Columns,
  BookOpen,
} from "lucide-react";
import { GOOGLE_FONTS, googleFontHref, fontStack } from "@/lib/theme";

type ShowcasePalette = {
  id: string;
  name: string;
  icon: any;
  primary: string;
  bgLight: string;
  bgDark: string;
  font: string;
};

const PALETTES: ShowcasePalette[] = [
  {
    id: "violet",
    name: "Electric Violet",
    icon: Zap,
    primary: "#5b31e6",
    bgLight: "#f4f2fb",
    bgDark: "#090d16",
    font: "plus-jakarta-sans",
  },
  {
    id: "amber",
    name: "Barber Dark Luxe",
    icon: Scissors,
    primary: "#d97706",
    bgLight: "#fffbeb",
    bgDark: "#090d16",
    font: "outfit",
  },
  {
    id: "gold",
    name: "Obsidian Gold VIP",
    icon: Crown,
    primary: "#eab308",
    bgLight: "#fefce8",
    bgDark: "#0a0a0c",
    font: "cinzel",
  },
  {
    id: "emerald",
    name: "Zen Emerald Spa",
    icon: Leaf,
    primary: "#059669",
    bgLight: "#ecfdf5",
    bgDark: "#022c22",
    font: "cormorant-garamond",
  },
  {
    id: "rose",
    name: "Rose Salon Aesthetic",
    icon: Flower2,
    primary: "#e11d48",
    bgLight: "#fff1f2",
    bgDark: "#1a080c",
    font: "playfair-display",
  },
  {
    id: "cyber",
    name: "Cyber Cyan",
    icon: Sparkles,
    primary: "#06b6d4",
    bgLight: "#ecfeff",
    bgDark: "#030712",
    font: "syne",
  },
];

export default function ShowcasePage() {
  const [selectedPalette, setSelectedPalette] = useState<ShowcasePalette>(PALETTES[0]);
  const [isDark, setIsDark] = useState<boolean>(false);
  const [selectedLayout, setSelectedLayout] = useState<string>("split-gallery");
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [copiedColor, setCopiedColor] = useState<string | null>(null);

  const currentBg = isDark ? selectedPalette.bgDark : selectedPalette.bgLight;

  function copyColor(hex: string) {
    navigator.clipboard.writeText(hex);
    setCopiedColor(hex);
    setTimeout(() => setCopiedColor(null), 2000);
  }

  return (
    <div
      className={`min-h-screen transition-colors duration-500 ${isDark ? "text-slate-100" : "text-slate-900"}`}
      style={{
        backgroundColor: currentBg,
        fontFamily: fontStack(selectedPalette.font),
        ["--primary" as string]: selectedPalette.primary,
      }}
    >
      {/* Inject Google Font dynamically */}
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link rel="stylesheet" href={googleFontHref(selectedPalette.font)} />

      {/* Top Navbar */}
      <header className={`sticky top-0 z-40 border-b backdrop-blur-xl transition-colors ${
        isDark ? "bg-slate-950/80 border-slate-800" : "bg-white/80 border-slate-200"
      }`}>
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg">
            <span
              className="flex h-9 w-9 items-center justify-center rounded-xl text-white shadow-md"
              style={{ backgroundColor: selectedPalette.primary }}
            >
              <Sparkles className="h-4 w-4" />
            </span>
            <span>AgendatePY <span className="opacity-60 text-xs font-mono uppercase tracking-wider">Design Lab</span></span>
          </Link>

          {/* Quick theme actions */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsDark(!isDark)}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold border transition ${
                isDark
                  ? "bg-slate-900 border-slate-700 text-amber-400 hover:bg-slate-800"
                  : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
              }`}
            >
              {isDark ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
              <span>{isDark ? "Modo Claro" : "Modo Oscuro"}</span>
            </button>

            <Link
              href="/dashboard/apariencia"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-bold text-white shadow-sm transition hover:opacity-95"
              style={{ backgroundColor: selectedPalette.primary }}
            >
              <Palette className="h-3.5 w-3.5" />
              <span>Aplicar a mi Local</span>
            </Link>

            <Link
              href="/barberia/reservar"
              target="_blank"
              className={`hidden sm:inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold border transition ${
                isDark ? "border-slate-700 text-slate-300 hover:bg-slate-800" : "border-slate-300 text-slate-700 hover:bg-slate-100"
              }`}
            >
              <span>Ver Cita Real</span>
              <ExternalLink className="h-3 w-3 opacity-60" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Showcase Title */}
      <section className="mx-auto max-w-7xl px-4 pt-12 pb-8 sm:px-6">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1 text-xs font-bold text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Laboratorio de Estilos, Componentes & Experiencia de Usuario</span>
          </div>
          <h1 className="text-4xl font-black tracking-tight sm:text-5xl">
            Catálogo Interactivo de Diseño para tu Negocio
          </h1>
          <p className="text-sm opacity-75 max-w-2xl mx-auto leading-relaxed">
            Experimentá en vivo con diferentes paletas de color, tipografías de Google, widgets de reserva,
            componentes de WhatsApp y métricas diseñadas para peluquerías, barberías y spas en Paraguay.
          </p>
        </div>

        {/* Live Palette Selector Pills */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-2.5">
          {PALETTES.map((pal) => {
            const active = selectedPalette.id === pal.id;
            const PalIcon = pal.icon;
            return (
              <button
                key={pal.id}
                type="button"
                onClick={() => setSelectedPalette(pal)}
                className={`flex items-center gap-2 rounded-2xl border px-3.5 py-2 text-xs font-bold transition shadow-xs ${
                  active
                    ? "border-primary bg-primary text-white shadow-md scale-105"
                    : isDark
                    ? "border-slate-800 bg-slate-900/80 text-slate-300 hover:border-slate-700"
                    : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                }`}
              >
                <PalIcon className="h-3.5 w-3.5" />
                <span>{pal.name}</span>
                <span
                  className="h-3.5 w-3.5 rounded-full border border-white/20"
                  style={{ backgroundColor: pal.primary }}
                />
              </button>
            );
          })}
        </div>
      </section>

      {/* Main Grid: Component Showcase Sections */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 space-y-16">
        {/* ========================================================================= */}
        {/* SECTION 1: BOOKING WIDGET DESIGNS */}
        {/* ========================================================================= */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 border-b border-black/10 dark:border-white/10 pb-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-primary">Componente 01</span>
              <h2 className="text-2xl font-bold tracking-tight">Estilos de la Página de Reserva</h2>
              <p className="text-xs opacity-75">Probá las diferentes distribuciones de fotos y tarjetas de agendamiento.</p>
            </div>

            {/* Layout switch buttons */}
            <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-black/5 dark:bg-white/10">
              {[
                { id: "split-gallery", label: "Galería Dividida", icon: Columns },
                { id: "floating-card", label: "Tarjeta Flotante", icon: Sparkles },
                { id: "panoramic", label: "Panorámico", icon: LayoutTemplate },
                { id: "minimal-editorial", label: "Minimalista", icon: BookOpen },
              ].map((l) => {
                const LayoutIcon = l.icon;
                return (
                  <button
                    key={l.id}
                    type="button"
                    onClick={() => setSelectedLayout(l.id)}
                    className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                      selectedLayout === l.id
                        ? "bg-primary text-white shadow-xs"
                        : "opacity-75 hover:opacity-100"
                    }`}
                  >
                    <LayoutIcon className="h-3.5 w-3.5" />
                    <span>{l.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Interactive Card Preview */}
          <div className="grid gap-6 lg:grid-cols-12 items-start">
            {/* Visual Preview Left */}
            <div className={`lg:col-span-8 rounded-3xl border p-6 transition-all duration-300 shadow-xl ${
              isDark ? "bg-slate-900/90 border-slate-800" : "bg-white border-slate-200"
            }`}>
              {selectedLayout === "split-gallery" && (
                <div className="grid gap-6 sm:grid-cols-2 items-center">
                  <div className="space-y-3">
                    <div className="relative h-44 overflow-hidden rounded-2xl bg-slate-800 shadow-inner">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src="https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=800&auto=format&fit=crop&q=80"
                        alt="Barber"
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                      <div className="absolute bottom-3 left-3 text-white">
                        <p className="font-bold text-sm">Barbería Los Muchachos</p>
                        <p className="text-[11px] opacity-80">Asunción · Abierto hoy hasta las 20:00</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      {[
                        "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=400&auto=format&fit=crop&q=80",
                        "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=400&auto=format&fit=crop&q=80",
                        "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=400&auto=format&fit=crop&q=80",
                      ].map((img, i) => (
                        <div key={i} className="h-16 overflow-hidden rounded-xl border border-black/10 dark:border-white/10">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={img} alt="Corte" className="h-full w-full object-cover" />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <p className="text-xs font-bold uppercase tracking-wider text-primary">Servicios Populares</p>
                    <div className="space-y-2">
                      {[
                        { name: "Corte Degradé Clásico", time: "30 min", price: "Gs. 80.000" },
                        { name: "Barba a Navaja Tradicional", time: "25 min", price: "Gs. 50.000" },
                        { name: "Combo Pelo & Barba VIP", time: "55 min", price: "Gs. 120.000" },
                      ].map((item, idx) => (
                        <div
                          key={idx}
                          className={`rounded-2xl border p-3 flex items-center justify-between transition hover:scale-[1.01] ${
                            idx === 0
                              ? "border-primary bg-primary/10 ring-1 ring-primary"
                              : isDark
                              ? "border-slate-800 bg-slate-800/60"
                              : "border-slate-200 bg-slate-50/70"
                          }`}
                        >
                          <div>
                            <p className="text-xs font-bold">{item.name}</p>
                            <span className="text-[10px] opacity-70 flex items-center gap-1">
                              <Clock className="h-2.5 w-2.5" /> {item.time}
                            </span>
                          </div>
                          <span className="text-xs font-black text-primary">{item.price}</span>
                        </div>
                      ))}
                    </div>

                    <button
                      type="button"
                      className="w-full rounded-2xl py-3 text-xs font-bold text-white shadow-md transition hover:opacity-95"
                      style={{ backgroundColor: selectedPalette.primary }}
                    >
                      Continuar a Fecha y Horario →
                    </button>
                  </div>
                </div>
              )}

              {selectedLayout === "floating-card" && (
                <div className="relative py-6 px-4 text-center max-w-md mx-auto">
                  <div
                    className="pointer-events-none absolute inset-0 rounded-full opacity-20 blur-3xl"
                    style={{ backgroundColor: selectedPalette.primary }}
                  />
                  <div className="relative z-10 space-y-4">
                    <div className="mx-auto h-16 w-16 rounded-2xl bg-white shadow-lg flex items-center justify-center border-2 border-white">
                      {(() => {
                        const PalIcon = selectedPalette.icon;
                        return <PalIcon className="h-8 w-8" style={{ color: selectedPalette.primary }} />;
                      })()}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">{selectedPalette.name}</h3>
                      <p className="text-xs opacity-75 mt-0.5">Atención premium personalizada</p>
                    </div>

                    {/* Stories highlights */}
                    <div className="flex items-center justify-center gap-3 py-1">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="flex flex-col items-center gap-1">
                          <div className="h-12 w-12 rounded-full p-0.5 ring-2 ring-primary">
                            <div className="h-full w-full rounded-full bg-slate-700" />
                          </div>
                          <span className="text-[9px] opacity-60">Trabajo #{i}</span>
                        </div>
                      ))}
                    </div>

                    <div className="rounded-2xl border border-black/10 dark:border-white/10 p-4 text-left space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold">Corte Clásico + Lavado</span>
                        <span className="font-black text-primary">Gs. 90.000</span>
                      </div>
                      <p className="text-[11px] opacity-70">Incluye asesoría visagista y styling final.</p>
                    </div>

                    <button
                      type="button"
                      className="w-full rounded-full py-3 text-xs font-bold text-white shadow-md"
                      style={{ backgroundColor: selectedPalette.primary }}
                    >
                      Elegir Horario Disponible
                    </button>
                  </div>
                </div>
              )}

              {selectedLayout === "panoramic" && (
                <div className="space-y-4">
                  <div className="relative h-32 w-full overflow-hidden rounded-2xl bg-slate-900">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=1000&auto=format&fit=crop&q=80"
                      alt="Banner"
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                    <div className="absolute bottom-3 left-4 text-white">
                      <h4 className="font-bold text-base">{selectedPalette.name}</h4>
                      <p className="text-xs opacity-80">El estilo más elegido por profesionales</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-2xl border p-3 border-black/10 dark:border-white/10">
                      <span className="text-[10px] font-bold text-primary uppercase">Paso 1</span>
                      <p className="text-xs font-bold mt-0.5">Seleccionar Servicio</p>
                    </div>
                    <div className="rounded-2xl border p-3 border-black/10 dark:border-white/10">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Paso 2</span>
                      <p className="text-xs font-bold mt-0.5">Elegir Día y Hora</p>
                    </div>
                  </div>
                </div>
              )}

              {selectedLayout === "minimal-editorial" && (
                <div className="space-y-4 max-w-md mx-auto text-center py-4">
                  <div className="border-b border-black/10 dark:border-white/10 pb-3">
                    <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-primary">LOOKBOOK</span>
                    <h3 className="text-2xl font-serif font-black tracking-tight">{selectedPalette.name}</h3>
                  </div>
                  <div className="space-y-2 text-left">
                    <div className="flex items-center justify-between border-b border-dashed border-black/10 dark:border-white/10 pb-2 text-xs">
                      <span>Degradé Signature & Styling</span>
                      <span className="font-mono font-bold">Gs. 110.000</span>
                    </div>
                    <div className="flex items-center justify-between border-b border-dashed border-black/10 dark:border-white/10 pb-2 text-xs">
                      <span>Ritual de Barba con Toalla Caliente</span>
                      <span className="font-mono font-bold">Gs. 75.000</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="w-full rounded-none border border-current py-2.5 text-xs font-mono uppercase tracking-wider font-bold transition hover:bg-black/5 dark:hover:bg-white/10"
                  >
                    Agendar Cita Privada
                  </button>
                </div>
              )}
            </div>

            {/* Layout Info Card Right */}
            <div className={`lg:col-span-4 rounded-3xl border p-5 space-y-4 ${
              isDark ? "bg-slate-900/60 border-slate-800" : "bg-white border-slate-200"
            }`}>
              <div className="flex items-center gap-2">
                <Layers className="h-5 w-5 text-primary" />
                <h3 className="font-bold text-sm">Detalles del Layout</h3>
              </div>

              <div className="space-y-2 text-xs opacity-80 leading-relaxed">
                <p>
                  <strong>Distribución activa:</strong> {selectedLayout}
                </p>
                <p>
                  <strong>Tipografía:</strong> {GOOGLE_FONTS.find((f) => f.id === selectedPalette.font)?.name}
                </p>
                <p>
                  <strong>Color de marca:</strong> {selectedPalette.primary}
                </p>
              </div>

              <div className="pt-2 border-t border-black/5 dark:border-white/5 space-y-2">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Copiar Código HEX</p>
                <button
                  type="button"
                  onClick={() => copyColor(selectedPalette.primary)}
                  className="flex w-full items-center justify-between rounded-xl border border-black/10 dark:border-white/10 p-2.5 font-mono text-xs hover:border-primary transition"
                >
                  <span>{selectedPalette.primary}</span>
                  {copiedColor === selectedPalette.primary ? (
                    <span className="text-emerald-500 font-bold flex items-center gap-1">
                      <Check className="h-3.5 w-3.5" /> Copiado
                    </span>
                  ) : (
                    <Copy className="h-3.5 w-3.5 opacity-60" />
                  )}
                </button>
              </div>

              <Link
                href="/dashboard/apariencia"
                className="block w-full text-center rounded-2xl py-2.5 text-xs font-bold text-white shadow-sm transition hover:opacity-95"
                style={{ backgroundColor: selectedPalette.primary }}
              >
                Configurar este diseño en mi local
              </Link>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 2: WHATSAPP BOT COMPONENT HIGHLIGHT */}
        {/* ========================================================================= */}
        <section className="space-y-6">
          <div className="border-b border-black/10 dark:border-white/10 pb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-whatsapp">Componente 02</span>
            <h2 className="text-2xl font-bold tracking-tight">Componentes Nativos de WhatsApp Cloud API</h2>
            <p className="text-xs opacity-75">Burbujas idénticas con doble tilde azul, notas de voz interactivas y botones de acción rápida.</p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {/* Bubble 1: Confirmación Inmediata */}
            <div className={`rounded-3xl border p-5 space-y-3 ${
              isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#008069]">Burbuja de Confirmación</span>
                <span className="text-[10px] opacity-60">Entrante</span>
              </div>
              <div className="rounded-2xl rounded-tl-xs bg-[#ffffff] dark:bg-slate-800 border p-3 text-xs leading-relaxed shadow-sm">
                <p className="text-[#111b21] dark:text-slate-100">
                  ¡Hola Juan! Tu turno para <strong>Corte Degradé</strong> quedó confirmado para hoy a las <strong>16:30 hs</strong> con Marcos Benítez.
                </p>
                <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400 border-t pt-1.5">
                  <span className="text-[#008069] font-bold">agendate.py/turno</span>
                  <span>14:22 hs</span>
                </div>
              </div>
              <p className="text-[11px] opacity-75">Enviado automáticamente 1 segundo después de reservar en la web.</p>
            </div>

            {/* Bubble 2: Nota de Voz Simulada */}
            <div className={`rounded-3xl border p-5 space-y-3 ${
              isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#008069]">Nota de Voz (Audio)</span>
                <span className="text-[10px] opacity-60">Interactiva</span>
              </div>
              <div className="rounded-2xl rounded-tl-xs bg-[#ffffff] dark:bg-slate-800 border p-3 text-xs shadow-sm flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-[#008069] text-white shadow-xs"
                >
                  {isPlayingAudio ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
                </button>
                <div className="flex-1">
                  <div className="flex items-center gap-[2.5px] h-4">
                    {[6, 12, 16, 8, 14, 18, 10, 6, 14, 16, 8, 12].map((h, i) => (
                      <span
                        key={i}
                        className={`w-[2px] rounded-full transition-all duration-150 ${
                          isPlayingAudio ? "bg-[#008069] animate-pulse" : "bg-slate-400"
                        }`}
                        style={{ height: `${h}px` }}
                      />
                    ))}
                  </div>
                  <div className="mt-1 flex items-center justify-between text-[9px] text-slate-400">
                    <span>0:14</span>
                    <span>14:23 hs</span>
                  </div>
                </div>
              </div>
              <p className="text-[11px] opacity-75">Tus clientes pueden recibir audios personalizados para confirmar su asistencia.</p>
            </div>

            {/* Bubble 3: Botones de Respuesta Rápida */}
            <div className={`rounded-3xl border p-5 space-y-3 ${
              isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#008069]">Botones de 1 Clic</span>
                <span className="text-[10px] opacity-60">Quick Replies</span>
              </div>
              <div className="space-y-1.5">
                <div className="rounded-2xl rounded-tl-xs bg-white dark:bg-slate-800 border p-2.5 text-xs text-[#111b21] dark:text-slate-100">
                  ¿Confirmás tu asistencia para hoy?
                </div>
                <button
                  type="button"
                  className="w-full rounded-xl border border-[#008069]/40 bg-[#e7f8f5] dark:bg-emerald-950/40 p-2 text-xs font-bold text-[#008069] dark:text-emerald-300 transition hover:scale-[1.02] flex items-center justify-center gap-1.5"
                >
                  <Check className="h-3.5 w-3.5" />
                  <span>Sí, confirmo asistencia</span>
                </button>
                <button
                  type="button"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 text-xs font-semibold text-slate-600 dark:text-slate-300 transition hover:bg-slate-50 flex items-center justify-center gap-1.5"
                >
                  <Calendar className="h-3.5 w-3.5" />
                  <span>Reprogramar para otro día</span>
                </button>
              </div>
              <p className="text-[11px] opacity-75">Reduce hasta un 85% las inasistencias sin intervención humana.</p>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 3: ANALYTICS & DASHBOARD KPI WIDGETS */}
        {/* ========================================================================= */}
        <section className="space-y-6">
          <div className="border-b border-black/10 dark:border-white/10 pb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-primary">Componente 03</span>
            <h2 className="text-2xl font-bold tracking-tight">Tarjetas de Métricas & Rendimiento del Panel</h2>
            <p className="text-xs opacity-75">Indicadores financieros, arqueo de caja y comisiones de equipo.</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Facturación del Mes", val: "Gs. 18.450.000", delta: "+24%", icon: TrendingUp },
              { label: "Citas Completadas", val: "148 turnos", delta: "+12%", icon: Calendar },
              { label: "Clientes Frecuentes", val: "84 fidelizados", delta: "+18%", icon: Users },
              { label: "Tasa de Asistencia", val: "94.2%", delta: "+8%", icon: ShieldCheck },
            ].map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div
                  key={i}
                  className={`rounded-3xl border p-5 transition hover:shadow-lg ${
                    isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs opacity-60 font-semibold">{stat.label}</span>
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Icon className="h-4 w-4" />
                    </span>
                  </div>
                  <p className="mt-2 text-xl font-bold">{stat.val}</p>
                  <p className="mt-1 text-xs font-bold text-emerald-500">{stat.delta} vs mes anterior</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Bottom CTA to Action */}
        <section className="rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-8 sm:p-12 text-white text-center space-y-5 shadow-2xl">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-1 text-xs font-bold text-emerald-400">
            <Zap className="h-3.5 w-3.5" /> Todo listo para usar
          </span>
          <h2 className="text-3xl font-black sm:text-4xl">¿Querés que tu negocio se vea así de bien?</h2>
          <p className="text-sm opacity-80 max-w-xl mx-auto">
            Configurá tu logo, portada, servicios y empezá a recibir reservas automáticas hoy mismo.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              href="/dashboard/apariencia"
              className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-xs font-bold text-white shadow-lg transition hover:scale-105"
              style={{ backgroundColor: selectedPalette.primary }}
            >
              <span>Ir a Personalizar mi Local</span>
              <Palette className="h-4 w-4" />
            </Link>
            <Link
              href="/barberia/reservar"
              target="_blank"
              className="inline-flex items-center gap-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 px-6 py-3 text-xs font-bold text-white transition"
            >
              <span>Probar Reserva como Cliente</span>
              <Smartphone className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
