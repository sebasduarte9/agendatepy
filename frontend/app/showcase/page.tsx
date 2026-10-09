"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  PanelsTopLeft,
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
  Loader2,
  Info,
  CheckCircle2,
} from "lucide-react";
import {
  GOOGLE_FONTS,
  googleFontHref,
  fontStack,
  THEME_PRESETS,
  type ThemePreset,
  type LayoutStyle,
  type ButtonRadius,
} from "@/lib/theme";

type ShowcasePalette = {
  id: string;
  presetKey: ThemePreset;
  name: string;
  category: "Barberías" | "Salones & Estética" | "Spas & Wellness" | "Modern Tech" | "Urbano & Trend" | "Lujo & VIP" | "General";
  icon: any;
  primary: string;
  bgLight: string;
  bgDark: string;
  font: string;
  description: string;
  bestFor: string;
  contrastTarget: string;
  badge?: string;
  layout: LayoutStyle;
  buttonRadius: ButtonRadius;
};

const SHOWCASE_PALETTES: ShowcasePalette[] = [
  {
    id: "barber-dark",
    presetKey: "barber-dark",
    name: "Barber Dark Luxe",
    category: "Barberías",
    icon: Scissors,
    primary: "#d97706",
    bgLight: "#fffbeb",
    bgDark: "#090d16",
    font: "outfit",
    description: "Negro obsidiana con acentos dorados y ámbar cálido para barberías de élite",
    bestFor: "Barberías de autor, salones masculinos VIP y grooming premium",
    contrastTarget: "WCAG AAA (7.2:1)",
    badge: "Más Elegido",
    layout: "split-gallery",
    buttonRadius: "lg",
  },
  {
    id: "bento-modern",
    presetKey: "bento-modern",
    name: "Bento Box Moderno",
    category: "Modern Tech",
    icon: LayoutTemplate,
    primary: "#4f46e5",
    bgLight: "#f8fafc",
    bgDark: "#0f172a",
    font: "space-grotesk",
    description: "Estilo Apple & Stripe con tarjetas modulares, acento índigo y alto contraste",
    bestFor: "Centros integrales de estética, clínicas y salones de vanguardia",
    contrastTarget: "WCAG AAA (8.1:1)",
    badge: "UI Pro Max",
    layout: "split-gallery",
    buttonRadius: "lg",
  },
  {
    id: "soft-evolution",
    presetKey: "soft-evolution",
    name: "Soft UI Evolution",
    category: "Salones & Estética",
    icon: Flower2,
    primary: "#8b5cf6",
    bgLight: "#faf5ff",
    bgDark: "#180d2b",
    font: "playfair-display",
    description: "Blanco perla, acento lavanda y sombras difusas para salones de belleza y estética",
    bestFor: "Salones de belleza, estilistas, coloristas, lash & nail bars",
    contrastTarget: "WCAG AA (5.4:1)",
    badge: "Tendencia",
    layout: "floating-card",
    buttonRadius: "full",
  },
  {
    id: "organic-biophilic",
    presetKey: "organic-biophilic",
    name: "Organic Biophilic & Sage",
    category: "Spas & Wellness",
    icon: Leaf,
    primary: "#059669",
    bgLight: "#f7f5f0",
    bgDark: "#042017",
    font: "cormorant-garamond",
    description: "Verde salvia botánico, arena suave y serenidad zen para spas y bienestar",
    bestFor: "Spas, centros de masaje, bienestar holístico y dermatología estética",
    contrastTarget: "WCAG AAA (7.6:1)",
    badge: "Eco Zen",
    layout: "split-gallery",
    buttonRadius: "full",
  },
  {
    id: "neubrutalism-urban",
    presetKey: "neubrutalism-urban",
    name: "Neubrutalism Urbano",
    category: "Urbano & Trend",
    icon: Zap,
    primary: "#facc15",
    bgLight: "#fef9c3",
    bgDark: "#18181b",
    font: "syne",
    description: "Bordes negros de 2px, sombras sólidas y amarillo de alto impacto para estudios urbanos",
    bestFor: "Barberías streetwear, estudios de tatuaje y salones con actitud propia",
    contrastTarget: "WCAG AAA (9.2:1)",
    badge: "Vanguardia",
    layout: "panoramic",
    buttonRadius: "md",
  },
  {
    id: "champagne-velvet",
    presetKey: "champagne-velvet",
    name: "Champagne & Velvet VIP",
    category: "Lujo & VIP",
    icon: Crown,
    primary: "#f59e0b",
    bgLight: "#fffbeb",
    bgDark: "#0a0b10",
    font: "cinzel",
    description: "Fondo ónix nocturno con acentos oro rosado metálico para experiencias de lujo",
    bestFor: "Peluquerías de alta gama, barberías VIP y suites privadas",
    contrastTarget: "WCAG AAA (8.4:1)",
    badge: "Exclusivo",
    layout: "floating-card",
    buttonRadius: "lg",
  },
  {
    id: "default",
    presetKey: "default",
    name: "Agendate Violet",
    category: "General",
    icon: Palette,
    primary: "#5b31e6",
    bgLight: "#f4f2fb",
    bgDark: "#090d16",
    font: "plus-jakarta-sans",
    description: "Equilibrado, moderno y vibrante en violeta eléctrico institucional",
    bestFor: "Cualquier rubro de citas y reservas online",
    contrastTarget: "WCAG AAA (7.5:1)",
    badge: "Oficial",
    layout: "panoramic",
    buttonRadius: "full",
  },
];

export default function ShowcasePage() {
  const [selectedPalette, setSelectedPalette] = useState<ShowcasePalette>(SHOWCASE_PALETTES[0]);
  const [isDark, setIsDark] = useState<boolean>(true);
  const [selectedLayout, setSelectedLayout] = useState<string>("split-gallery");
  const [categoryFilter, setCategoryFilter] = useState<string>("Todos");
  const [copiedColor, setCopiedColor] = useState<string | null>(null);
  const [applyingToTenant, setApplyingToTenant] = useState(false);
  const [appliedSuccess, setAppliedSuccess] = useState(false);

  // Audio simulator state
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const currentBg = isDark ? selectedPalette.bgDark : selectedPalette.bgLight;

  function copyColor(hex: string) {
    navigator.clipboard.writeText(hex);
    setCopiedColor(hex);
    setTimeout(() => setCopiedColor(null), 2000);
  }

  async function handleApplyToMyTenant() {
    setApplyingToTenant(true);
    try {
      const res = await fetch("/api/tenant/theme", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantSlug: "barberia",
          theme: {
            primaryColor: selectedPalette.primary,
            backgroundColor: isDark ? selectedPalette.bgDark : selectedPalette.bgLight,
            fontFamily: selectedPalette.font,
            themeMode: isDark ? "dark" : "light",
            layoutStyle: selectedLayout,
            buttonRadius: selectedPalette.buttonRadius,
            themePreset: selectedPalette.presetKey,
          },
        }),
      });
      if (res.ok) {
        setAppliedSuccess(true);
        setTimeout(() => setAppliedSuccess(false), 3500);
      }
    } catch (err) {
      console.error("Error al aplicar tema a PostgreSQL:", err);
    } finally {
      setApplyingToTenant(false);
    }
  }

  const filteredPalettes = SHOWCASE_PALETTES.filter((p) => {
    if (categoryFilter === "Todos") return true;
    return p.category === categoryFilter;
  });

  return (
    <div
      className={`min-h-screen transition-colors duration-500 ${isDark ? "text-slate-100" : "text-slate-900"}`}
      style={{
        backgroundColor: currentBg,
        fontFamily: fontStack(selectedPalette.font),
        ["--primary" as string]: selectedPalette.primary,
      }}
    >
      {/* Dynamic Google Font link for active theme */}
      <link rel="stylesheet" href={googleFontHref(selectedPalette.font)} />

      {/* Top Navbar */}
      <header
        className={`sticky top-0 z-40 border-b backdrop-blur-xl transition-colors ${
          isDark ? "bg-slate-950/85 border-slate-800" : "bg-white/85 border-slate-200"
        }`}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg">
            <span
              className="flex h-9 w-9 items-center justify-center rounded-xl text-white shadow-md transition-colors"
              style={{ backgroundColor: selectedPalette.primary }}
            >
              <Calendar className="h-4 w-4" />
            </span>
            <span>
              AgendatePY{" "}
              <span className="opacity-60 text-xs font-mono uppercase tracking-wider font-semibold">
                UI/UX Pro Max Lab
              </span>
            </span>
          </Link>

          {/* Quick theme actions */}
          <div className="flex items-center gap-2.5">
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

            {/* Direct Apply to PostgreSQL */}
            <button
              type="button"
              onClick={handleApplyToMyTenant}
              disabled={applyingToTenant}
              className="inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-bold text-white shadow-md transition hover:opacity-95 disabled:opacity-50"
              style={{ backgroundColor: selectedPalette.primary }}
              title="Guardar este diseño en la base de datos de tu local"
            >
              {applyingToTenant ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : appliedSuccess ? (
                <Check className="h-3.5 w-3.5" />
              ) : (
                <Palette className="h-3.5 w-3.5" />
              )}
              <span>{appliedSuccess ? "¡Guardado en tu Web!" : "Aplicar a mi Enlace"}</span>
            </button>

            <Link
              href="/dashboard/apariencia"
              className={`hidden md:inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold border transition ${
                isDark ? "border-slate-700 text-slate-300 hover:bg-slate-800" : "border-slate-300 text-slate-700 hover:bg-slate-100"
              }`}
            >
              <span>Editor de Enlace</span>
            </Link>

            <Link
              href="/barberia/reservar"
              target="_blank"
              className={`hidden sm:inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold border transition ${
                isDark ? "border-slate-700 text-slate-300 hover:bg-slate-800" : "border-slate-300 text-slate-700 hover:bg-slate-100"
              }`}
            >
              <span>Ver Web en Vivo</span>
              <ExternalLink className="h-3 w-3 opacity-60" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Showcase Title */}
      <section className="mx-auto max-w-7xl px-4 pt-12 pb-6 sm:px-6">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1 text-xs font-bold text-primary">
            <Palette className="h-3.5 w-3.5" />
            <span>Laboratorio de Diseño & UX Intelligence · Paraguay</span>
          </div>
          <h1 className="text-4xl font-black tracking-tight sm:text-5xl">
            Propuestas de Diseño de Alta Conversión
          </h1>
          <p className="text-sm opacity-75 max-w-2xl mx-auto leading-relaxed">
            Explorá los estilos visuales generados con la inteligencia de <strong>ui-ux-pro-max</strong>. 
            Probá tipografías de Google, contrastes WCAG AAA y distribuciones de agendamiento en tiempo real.
          </p>
        </div>

        {/* Category Filter Pills */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-1.5">
          {["Todos", "Barberías", "Salones & Estética", "Spas & Wellness", "Modern Tech", "Urbano & Trend", "Lujo & VIP"].map(
            (cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoryFilter(cat)}
                className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                  categoryFilter === cat
                    ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm"
                    : isDark
                    ? "bg-slate-900/60 text-slate-400 hover:text-white"
                    : "bg-white text-slate-600 hover:text-slate-900 border border-slate-200"
                }`}
              >
                {cat}
              </button>
            )
          )}
        </div>

        {/* Live Palette Selector Pills */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2.5">
          {filteredPalettes.map((pal) => {
            const active = selectedPalette.id === pal.id;
            const PalIcon = pal.icon;
            return (
              <button
                key={pal.id}
                type="button"
                onClick={() => {
                  setSelectedPalette(pal);
                  setSelectedLayout(pal.layout);
                  if (pal.id === "barber-dark" || pal.id === "champagne-velvet") setIsDark(true);
                  if (pal.id === "bento-modern" || pal.id === "soft-evolution" || pal.id === "organic-biophilic") setIsDark(false);
                }}
                className={`flex items-center gap-2.5 rounded-2xl border px-4 py-2.5 text-xs font-bold transition shadow-xs ${
                  active
                    ? "border-primary bg-primary text-white shadow-lg scale-105"
                    : isDark
                    ? "border-slate-800 bg-slate-900/80 text-slate-300 hover:border-slate-700"
                    : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                }`}
              >
                <PalIcon className="h-4 w-4" />
                <div className="text-left">
                  <span>{pal.name}</span>
                  {pal.badge && (
                    <span
                      className={`ml-1.5 rounded-full px-1.5 py-0.2 text-[9px] font-bold ${
                        active
                          ? "bg-white/20 text-white"
                          : "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                      }`}
                    >
                      {pal.badge}
                    </span>
                  )}
                </div>
                <span
                  className="h-3.5 w-3.5 rounded-full border border-white/20 shrink-0"
                  style={{ backgroundColor: pal.primary }}
                />
              </button>
            );
          })}
        </div>

        {/* Active Style Intelligence Spec Deck (From UI UX Pro Max) */}
        <div
          className={`mt-8 max-w-4xl mx-auto rounded-3xl border p-5 shadow-lg backdrop-blur-xl transition ${
            isDark ? "bg-slate-900/90 border-slate-800" : "bg-white/95 border-slate-200"
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-black/10 dark:border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <span
                className="flex h-10 w-10 items-center justify-center rounded-2xl text-white shadow-md"
                style={{ backgroundColor: selectedPalette.primary }}
              >
                <selectedPalette.icon className="h-5 w-5" />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-black text-lg">{selectedPalette.name}</h3>
                  <span className="rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-bold">
                    {selectedPalette.contrastTarget}
                  </span>
                </div>
                <p className="text-xs opacity-75">{selectedPalette.description}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleApplyToMyTenant}
              disabled={applyingToTenant}
              className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:opacity-95 self-start sm:self-auto shrink-0"
              style={{ backgroundColor: selectedPalette.primary }}
            >
              {appliedSuccess ? <Check className="h-3.5 w-3.5" /> : <Palette className="h-3.5 w-3.5" />}
              <span>{appliedSuccess ? "¡Aplicado a tu Local!" : "Aplicar este Estilo"}</span>
            </button>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-4 text-xs">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold opacity-60">Ideal Para</span>
              <p className="font-semibold">{selectedPalette.bestFor}</p>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold opacity-60">Tipografía Display</span>
              <p className="font-mono font-bold capitalize">{selectedPalette.font.replace(/-/g, " ")}</p>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold opacity-60">Color Acento (HEX)</span>
              <div className="flex items-center gap-2">
                <code className="font-mono font-bold">{selectedPalette.primary}</code>
                <button
                  type="button"
                  onClick={() => copyColor(selectedPalette.primary)}
                  className="rounded p-1 opacity-70 hover:opacity-100"
                  title="Copiar color"
                >
                  {copiedColor === selectedPalette.primary ? (
                    <Check className="h-3 w-3 text-emerald-500" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold opacity-60">Bordes & Radio</span>
              <p className="font-semibold capitalize">
                {selectedPalette.buttonRadius === "full"
                  ? "Pill Suave (9999px)"
                  : selectedPalette.buttonRadius === "lg"
                  ? "Redondeado Moderno (16px)"
                  : "Cuadrado Minimalista (8px)"}
              </p>
            </div>
          </div>
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
              <h2 className="text-2xl font-bold tracking-tight">Simulador Interactivo de la Página de Reservas</h2>
              <p className="text-xs opacity-75">Visualizá cómo interactúa el cliente con tus fotos, servicios y calendario.</p>
            </div>

            {/* Layout switch buttons */}
            <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-black/5 dark:bg-white/10">
              {[
                { id: "split-gallery", label: "Galería Dividida", icon: Columns },
                { id: "floating-card", label: "Tarjeta Flotante", icon: PanelsTopLeft },
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
            <div
              className={`lg:col-span-8 rounded-3xl border p-6 transition-all duration-300 shadow-xl ${
                isDark ? "bg-slate-900/90 border-slate-800" : "bg-white border-slate-200"
              }`}
            >
              {selectedLayout === "split-gallery" && (
                <div className="grid gap-6 sm:grid-cols-2 items-center">
                  <div className="space-y-3">
                    <div className="relative h-44 overflow-hidden rounded-2xl bg-slate-800 shadow-inner">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src="https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=800&auto=format&fit=crop&q=80"
                        alt="Local"
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                      <div className="absolute bottom-3 left-3 text-white">
                        <p className="font-bold text-sm">Barbería & Salón Los Muchachos</p>
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
                    <p className="text-xs font-bold uppercase tracking-wider text-primary">Servicios Disponibles</p>
                    <div className="space-y-2">
                      {[
                        { name: "Corte Degradé Clásico", time: "35 min", price: "Gs. 80.000" },
                        { name: "Ritual de Barba con Toalla", time: "30 min", price: "Gs. 50.000" },
                        { name: "Combo Pelo & Barba VIP", time: "60 min", price: "Gs. 120.000" },
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
                      <p className="text-xs opacity-75 mt-0.5">Atención premium y personalizada</p>
                    </div>

                    {/* Stories highlights */}
                    <div className="flex items-center justify-center gap-3 py-1">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="flex flex-col items-center gap-1">
                          <div className="h-12 w-12 rounded-full p-0.5 ring-2 ring-primary">
                            <div className="h-full w-full rounded-full bg-slate-700" />
                          </div>
                          <span className="text-[9px] opacity-60">Look #{i}</span>
                        </div>
                      ))}
                    </div>

                    <div className="rounded-2xl border border-black/10 dark:border-white/10 p-4 text-left space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold">Mechas Balayage & Styling</span>
                        <span className="font-black text-primary">Gs. 320.000</span>
                      </div>
                      <p className="text-[11px] opacity-70">Incluye nutrición profunda y peinado profesional.</p>
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

            {/* Live Interactive Date & Slot Selector Right */}
            <div
              className={`lg:col-span-4 rounded-3xl border p-5 space-y-4 shadow-md ${
                isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
              }`}
            >
              <div className="flex items-center justify-between border-b border-black/10 dark:border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span className="font-bold text-xs">Horarios Disponibles</span>
                </div>
                <span className="rounded-full bg-emerald-500/10 text-emerald-600 px-2 py-0.5 text-[9px] font-black uppercase">
                  En Vivo
                </span>
              </div>

              <div className="grid grid-cols-3 gap-1.5 text-xs">
                {["10:00", "10:30", "11:00", "14:30", "15:00", "16:30"].map((time, idx) => (
                  <button
                    key={time}
                    type="button"
                    className={`rounded-xl py-2 font-bold text-center border transition ${
                      idx === 0
                        ? "bg-primary text-white border-primary shadow-xs"
                        : "border-black/10 dark:border-white/10 hover:border-primary/50"
                    }`}
                  >
                    {time}
                  </button>
                ))}
              </div>

              <div className="rounded-2xl border border-black/10 dark:border-white/10 p-3 space-y-2 text-xs">
                <span className="text-[10px] font-bold uppercase opacity-60">Profesional Asignado</span>
                <div className="flex items-center gap-2.5">
                  <div
                    className="flex h-8 w-8 items-center justify-center rounded-xl text-white font-bold text-xs"
                    style={{ backgroundColor: selectedPalette.primary }}
                  >
                    MB
                  </div>
                  <div>
                    <p className="font-bold">Marcos Benítez</p>
                    <p className="text-[10px] opacity-60">Master Barber & Colorista</p>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleApplyToMyTenant}
                  disabled={applyingToTenant}
                  className="w-full rounded-2xl py-3 text-xs font-bold text-white shadow-md transition hover:opacity-95"
                  style={{ backgroundColor: selectedPalette.primary }}
                >
                  {appliedSuccess ? "¡Estilo Guardado en tu Web!" : "Aplicar este Estilo a mi Local"}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 2: WHATSAPP BOT & NOTIFICATIONS MOCKUP */}
        {/* ========================================================================= */}
        <section className="space-y-6">
          <div className="border-b border-black/10 dark:border-white/10 pb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-500">Componente 02</span>
            <h2 className="text-2xl font-bold tracking-tight">Experiencia de WhatsApp Automatizada para Paraguay</h2>
            <p className="text-xs opacity-75">Simulación de confirmación instantánea, recordatorio 2h antes y cancelación.</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 items-center">
            {/* WhatsApp Chat Balloon Mockup */}
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-[#0b141a] p-5 text-white shadow-2xl max-w-md mx-auto w-full font-sans">
              <div className="flex items-center gap-3 border-b border-white/10 pb-3">
                <div className="h-10 w-10 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold">
                  AP
                </div>
                <div>
                  <p className="font-bold text-sm">AgendatePY Bot</p>
                  <p className="text-[10px] text-emerald-400">En línea · Cuenta oficial de empresa</p>
                </div>
              </div>

              <div className="py-4 space-y-3">
                {/* Incoming bubble */}
                <div className="rounded-2xl rounded-tl-none bg-[#202c33] p-3 text-xs space-y-1.5 shadow-sm max-w-[85%]">
                  <p className="font-bold text-emerald-400">¡Hola Lucas Benítez!</p>
                  <p className="leading-relaxed">
                    Tu turno para <strong>Corte Clásico / Fade</strong> quedó apartado para el <strong>Sábado a las 10:00 hs</strong> con Marcos Benítez.
                  </p>
                  <p className="text-[10px] text-slate-400 pt-1">Local: Barbería Los Muchachos (Asunción)</p>
                  <div className="text-right text-[9px] text-slate-400">10:02</div>
                </div>

                {/* Voice note pill */}
                <div className="rounded-2xl rounded-tl-none bg-[#202c33] p-2.5 text-xs flex items-center gap-3 max-w-[85%]">
                  <button
                    type="button"
                    onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-white shrink-0"
                  >
                    {isPlayingAudio ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
                  </button>
                  <div className="flex-1 space-y-1">
                    <div className="h-1 bg-emerald-500/40 rounded-full overflow-hidden">
                      <div className={`h-full bg-emerald-400 ${isPlayingAudio ? "w-2/3 animate-pulse" : "w-1/4"}`} />
                    </div>
                    <span className="text-[9px] text-slate-400">Nota de voz: Indicaciones de llegada (0:18)</span>
                  </div>
                </div>

                {/* Quick actions buttons */}
                <div className="space-y-1.5 pt-1">
                  <button
                    type="button"
                    className="w-full rounded-xl bg-[#202c33] py-2 text-xs font-bold text-emerald-400 border border-white/5 hover:bg-[#2a3942] transition"
                  >
                    Confirmar Asistencia
                  </button>
                  <button
                    type="button"
                    className="w-full rounded-xl bg-[#202c33] py-2 text-xs font-semibold text-slate-300 border border-white/5 hover:bg-[#2a3942] transition"
                  >
                    Reprogramar Turno
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 text-emerald-600 px-3 py-1 text-xs font-bold">
                <CheckCircle2 className="h-4 w-4" />
                <span>Zero Fricción en WhatsApp</span>
              </div>
              <h3 className="text-2xl font-bold tracking-tight">El cliente no necesita descargar ninguna App</h3>
              <p className="text-xs leading-relaxed opacity-75">
                En Paraguay, WhatsApp es el canal preferido. Cada turno agendado envía automáticamente recordatorios 
                con el link de cancelación autogestionable, reduciendo el ausentismo sin sobrecargar a tu equipo.
              </p>
              <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                <div className="rounded-2xl border border-black/10 dark:border-white/10 p-3 space-y-1">
                  <span className="font-bold block text-emerald-500">-85% Ausentismo</span>
                  <span className="text-[11px] opacity-70">Con recordatorios 2 horas antes</span>
                </div>
                <div className="rounded-2xl border border-black/10 dark:border-white/10 p-3 space-y-1">
                  <span className="font-bold block text-primary">Sincronización Total</span>
                  <span className="text-[11px] opacity-70">Google Calendar & Google Maps</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 3: KPI WIDGETS & PERFORMANCE */}
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
                    <span
                      className="flex h-9 w-9 items-center justify-center rounded-xl text-white shadow-xs"
                      style={{ backgroundColor: selectedPalette.primary }}
                    >
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

        {/* Bottom CTA Card */}
        <section className="rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-8 sm:p-12 text-white text-center space-y-5 shadow-2xl">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-1 text-xs font-bold text-emerald-400">
            <Zap className="h-3.5 w-3.5" /> Todo listo para producción
          </span>
          <h2 className="text-3xl font-black sm:text-4xl">¿Querés que tu negocio se vea así de bien?</h2>
          <p className="text-sm opacity-80 max-w-xl mx-auto">
            Configurá tu logo, portada, servicios y empezá a recibir reservas automáticas hoy mismo.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleApplyToMyTenant}
              disabled={applyingToTenant}
              className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-xs font-bold text-white shadow-lg transition hover:scale-105"
              style={{ backgroundColor: selectedPalette.primary }}
            >
              <span>{appliedSuccess ? "¡Estilo Guardado!" : "Aplicar este Estilo a mi Local"}</span>
              <Palette className="h-4 w-4" />
            </button>
            <Link
              href="/dashboard/apariencia"
              className="inline-flex items-center gap-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 px-6 py-3 text-xs font-bold text-white transition"
            >
              <span>Editor de Enlace Completo</span>
              <Smartphone className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
