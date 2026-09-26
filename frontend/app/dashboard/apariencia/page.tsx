"use client";

import { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import {
  Check,
  Smartphone,
  ExternalLink,
  Sparkles,
  MessageCircle,
  MapPin,
  Save,
  Image as ImageIcon,
  Clock,
  Info,
  Layers,
  Type,
  Sun,
  Moon,
  Trash2,
  Plus,
  Loader2,
  Store,
  Calendar,
  ShoppingBag,
  LayoutTemplate,
  Columns,
  BookOpen,
  ArrowRight,
  Car,
  FileText,
  Gift,
  Phone,
  Globe,
  Star,
  Sliders,
  Palette,
  MousePointerClick,
  Link as LinkIcon,
} from "lucide-react";

function InstagramIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function renderCustomLinkIcon(iconName: string, className = "h-4 w-4") {
  switch (iconName) {
    case "whatsapp":
      return <MessageCircle className={className} />;
    case "maps":
      return <MapPin className={className} />;
    case "car":
      return <Car className={className} />;
    case "star":
      return <Star className={className} />;
    case "file-text":
      return <FileText className={className} />;
    case "gift":
      return <Gift className={className} />;
    case "phone":
      return <Phone className={className} />;
    case "instagram":
      return <InstagramIcon className={className} />;
    case "globe":
    default:
      return <Globe className={className} />;
  }
}

import { useDashboardStore } from "@/store/useDashboardStore";
import Card from "@/components/dashboard/ui/Card";
import {
  THEME_PRESETS,
  DEFAULT_THEME,
  GOOGLE_FONTS,
  googleFontHref,
  fontStack,
  getButtonClasses,
  getCustomButtonClasses,
  getCustomButtonStyles,
  type ThemePreset,
  type ButtonRadius,
  type ButtonStyleVariant,
  type ButtonShadowType,
  type ButtonTextSizeType,
  type TitleSizeType,
  type BackgroundEffectType,
  type ButtonBorderWidth,
  type ButtonHeight,
  type ButtonAlignment,
  type ButtonTextTransform,
  type ButtonFontWeight,
  type SectionOrder,
  type AvatarShape,
  type AvatarBorder,
  type CustomLinkItem,
  type CustomLinkIcon,
  type LayoutStyle,
  type ThemeMode,
  type ThemeSettings,
} from "@/lib/theme";
import { formatGs } from "@/lib/dashboard-dates";

export default function AparienciaPage() {
  const { business, services, updateBusiness, pushToast } = useDashboardStore();

  const [theme, setTheme] = useState<ThemeSettings>(DEFAULT_THEME);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [newPhotoUrl, setNewPhotoUrl] = useState("");
  const [fontCategory, setFontCategory] = useState<"all" | "sans" | "serif" | "display">("all");
  const [presetFilter, setPresetFilter] = useState<string>("Todos");

  // Load existing theme from PostgreSQL database on mount
  useEffect(() => {
    async function loadTheme() {
      try {
        const slug = business.slug || "barberia";
        const res = await fetch(`/api/tenant/theme?tenant=${slug}`);
        if (res.ok) {
          const data = await res.json();
          if (data.theme) {
            setTheme(data.theme);
          }
        }
      } catch (err) {
        console.error("No se pudo cargar el tema desde la base de datos:", err);
      } finally {
        setLoadingInitial(false);
      }
    }
    loadTheme();
  }, [business.slug]);

  function applyPreset(presetKey: ThemePreset) {
    const p = THEME_PRESETS[presetKey];
    setTheme((current) => ({
      ...current,
      themePreset: presetKey,
      primaryColor: p.primaryColor,
      backgroundColor: p.backgroundColor,
      fontFamily: p.fontFamily,
      themeMode: p.themeMode,
      layoutStyle: p.layoutStyle,
      buttonRadius: p.buttonRadius,
      bannerUrl: p.bannerUrl || current.bannerUrl,
    }));
    pushToast("success", `Tema "${p.name}" aplicado`);
  }

  async function handleSave(e?: React.FormEvent) {
    if (e) e.preventDefault();
    setIsSaving(true);

    try {
      const slug = business.slug || "barberia";
      const res = await fetch("/api/tenant/theme", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantSlug: slug,
          theme,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Error al guardar");
      }

      // Update in-memory Zustand store for dashboard consistency
      updateBusiness({
        primaryColor: theme.primaryColor,
      });

      setSavedSuccess(true);
      pushToast("success", "¡Diseño y apariencia guardados en PostgreSQL exitosamente!");
      setTimeout(() => setSavedSuccess(false), 3500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error de red al guardar";
      pushToast("error", msg);
    } finally {
      setIsSaving(false);
    }
  }

  function handleAddPhoto() {
    if (!newPhotoUrl.trim()) return;
    try {
      new URL(newPhotoUrl);
      setTheme((prev) => ({
        ...prev,
        galleryUrls: [...(prev.galleryUrls || []), newPhotoUrl.trim()],
      }));
      setNewPhotoUrl("");
      pushToast("success", "Foto agregada a la galería");
    } catch {
      pushToast("error", "Ingresá una URL válida (https://...)");
    }
  }

  function handleRemovePhoto(index: number) {
    setTheme((prev) => ({
      ...prev,
      galleryUrls: prev.galleryUrls.filter((_, i) => i !== index),
    }));
  }

  function handleAddCustomLink(preset?: { title: string; url: string; icon: CustomLinkIcon }) {
    const newLink: CustomLinkItem = {
      id: `link-${Date.now()}`,
      title: preset?.title || "Nuevo Botón de Acción",
      url: preset?.url || "https://",
      icon: preset?.icon || "globe",
      style: "default",
      enabled: true,
    };
    setTheme((prev) => ({
      ...prev,
      customLinks: [...(prev.customLinks || []), newLink],
    }));
    pushToast("success", `Botón "${newLink.title}" agregado`);
  }

  function handleUpdateCustomLink(id: string, updates: Partial<CustomLinkItem>) {
    setTheme((prev) => ({
      ...prev,
      customLinks: (prev.customLinks || []).map((l) =>
        l.id === id ? { ...l, ...updates } : l
      ),
    }));
  }

  function handleRemoveCustomLink(id: string) {
    setTheme((prev) => ({
      ...prev,
      customLinks: (prev.customLinks || []).filter((l) => l.id !== id),
    }));
    pushToast("success", "Botón eliminado");
  }

  const isDark =
    theme.themeMode === "dark" ||
    theme.themePreset === "barber-dark" ||
    theme.themePreset === "obsidian-gold" ||
    theme.themePreset === "cyber-noir" ||
    theme.themePreset === "champagne-velvet";

  const publicBookingUrl = `/${business.slug || "barberia"}/reservar`;

  const filteredFonts = GOOGLE_FONTS.filter((f) =>
    fontCategory === "all" ? true : f.category === fontCategory
  );

  return (
    <div className="space-y-6">
      {/* Dynamic Google Font link for the live preview */}
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link rel="stylesheet" href={googleFontHref(theme.fontFamily)} />

      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Diseño & Personalización de la Página de Reservas
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Personalizá tipografías de Google, distribuciones de fotos, modo oscuro y colores guardados directamente en la base de datos.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={publicBookingUrl}
            target="_blank"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-xs hover:bg-slate-50 dark:hover:bg-slate-700 transition"
          >
            <ExternalLink className="h-4 w-4 text-slate-400" />
            Ver Página Pública
          </Link>
          <button
            type="button"
            disabled={isSaving}
            onClick={() => handleSave()}
            className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-5 py-2 text-xs font-bold text-white shadow-sm hover:opacity-95 disabled:opacity-50 transition"
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : savedSuccess ? (
              <Check className="h-4 w-4 text-emerald-300" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {isSaving ? "Guardando..." : savedSuccess ? "¡Guardado!" : "Guardar Cambios"}
          </button>
        </div>
      </div>

      {loadingInitial && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 text-xs text-slate-500 flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          Sincronizando diseño actual desde PostgreSQL...
        </div>
      )}

      {/* Main Split Grid: Controls (Left) vs Real-Time Live Phone Preview (Right) */}
      <div className="grid items-start gap-6 lg:grid-cols-12">
        {/* Controls Column */}
        <div className="space-y-6 lg:col-span-7">
          {/* 1. Presets de 1 Clic (UI/UX Pro Max Intelligence) */}
          <Card className="space-y-4 border border-slate-200 dark:border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-white/5 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-amber-500" />
                  <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    Estilos & Paletas Curadas (UI/UX Pro Max)
                  </h2>
                  <span className="rounded-full bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20 px-2 py-0.5 text-[9px] font-black uppercase">
                    12 Presets
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Estilos visuales diseñados para maximizar la conversión y elegancia de tu web de reservas.
                </p>
              </div>

              <Link
                href="/showcase"
                className="inline-flex items-center gap-1.5 rounded-xl border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary hover:bg-primary/20 transition self-start sm:self-auto"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Abrir Laboratorio</span>
              </Link>
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                "Todos",
                "Barberías",
                "Salones & Estética",
                "Spas & Wellness",
                "Modern Tech",
                "Urbano & Trend",
                "Lujo & VIP",
              ].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setPresetFilter(cat)}
                  className={`rounded-xl px-2.5 py-1 text-[11px] font-bold transition ${
                    presetFilter === cat
                      ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Preset Cards Grid */}
            <div className="grid gap-3 sm:grid-cols-2">
              {(Object.keys(THEME_PRESETS) as ThemePreset[])
                .filter((key) => {
                  if (presetFilter === "Todos") return true;
                  return THEME_PRESETS[key].category === presetFilter;
                })
                .map((key) => {
                  const p = THEME_PRESETS[key];
                  const active = theme.themePreset === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => applyPreset(key)}
                      className={`group relative flex flex-col justify-between rounded-2xl border p-4 text-left transition-all duration-200 ${
                        active
                          ? "border-primary bg-primary/5 ring-2 ring-primary/30 shadow-md -translate-y-0.5"
                          : "border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 hover:shadow-xs"
                      }`}
                    >
                      <div className="space-y-1.5 w-full">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                              {p.category}
                            </span>
                            {p.badge && (
                              <span className="rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 px-1.5 py-0.2 text-[8.5px] font-bold">
                                {p.badge}
                              </span>
                            )}
                          </div>

                          {/* Dual Color Swatch */}
                          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-full">
                            <span
                              className="h-3 w-3 rounded-full border border-black/10 shadow-xs"
                              style={{ backgroundColor: p.primaryColor }}
                              title={`Primario: ${p.primaryColor}`}
                            />
                            <span
                              className="h-3 w-3 rounded-full border border-black/10"
                              style={{ backgroundColor: p.backgroundColor }}
                              title={`Fondo: ${p.backgroundColor}`}
                            />
                          </div>
                        </div>

                        <span className="block text-xs font-black text-slate-900 dark:text-slate-100">
                          {p.name}
                        </span>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug line-clamp-2">
                          {p.description}
                        </p>
                      </div>

                      {/* Bottom Footer Info */}
                      <div className="mt-3 flex items-center justify-between border-t border-slate-100 dark:border-white/5 pt-2 text-[10px] text-slate-400 w-full">
                        <span className="font-semibold text-slate-600 dark:text-slate-300 capitalize">
                          {p.fontFamily.replace(/-/g, " ")}
                        </span>
                        <span className="uppercase text-[9px] font-bold tracking-wider">
                          {p.themeMode === "dark" ? "Oscuro" : "Claro"}
                        </span>
                      </div>
                    </button>
                  );
                })}
            </div>

            {/* Showcase Quick Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-gradient-to-r from-violet-500/10 via-primary/5 to-transparent border border-primary/20 text-xs mt-2">
              <div className="flex items-center gap-2.5">
                <Sparkles className="h-4 w-4 text-primary shrink-0" />
                <div>
                  <span className="font-bold text-slate-900 dark:text-white">¿Querés probar estos estilos en componentes reales?</span>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Interactuá en vivo con el simulador de reservas en el Laboratorio de Diseño.</p>
                </div>
              </div>
              <Link
                href="/showcase"
                className="inline-flex items-center gap-1 rounded-xl bg-primary px-3 py-1.5 font-bold text-white shadow-xs hover:opacity-95 transition shrink-0 self-start sm:self-auto"
              >
                <span>Ver en Showcase</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </Card>

          {/* 2. Distribución de Fotos & Layout de la Página */}
          <Card className="space-y-4 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Layers className="h-5 w-5 text-primary" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Distribución de Fotos y Layout de la Página
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Cambiá la forma en que se presentan las fotos de tu local y tus servicios.
            </p>

            <div className="grid gap-3 sm:grid-cols-2">
              {[
                {
                  id: "panoramic",
                  name: "Portada Panorámica",
                  desc: "Gran banner cinematográfico arriba, tarjeta de servicios centrada y limpia.",
                  icon: LayoutTemplate,
                },
                {
                  id: "split-gallery",
                  name: "Galería & Mosaico Dividido",
                  desc: "Mosaico de fotos reales a la izquierda y el agendador de turnos a la derecha.",
                  icon: Columns,
                },
                {
                  id: "floating-card",
                  name: "Tarjeta Flotante & Stories",
                  desc: "Tarjeta de cristal con halo ambiental difuso y fotos en burbujas estilo stories.",
                  icon: Sparkles,
                },
                {
                  id: "minimal-editorial",
                  name: "Minimalista Editorial",
                  desc: "Diseño lookbook sobrio, tipografía elegante y líneas sutiles.",
                  icon: BookOpen,
                },
              ].map((l) => {
                const active = theme.layoutStyle === l.id;
                const LayoutIcon = l.icon;
                return (
                  <button
                    key={l.id}
                    type="button"
                    onClick={() => setTheme({ ...theme, layoutStyle: l.id as LayoutStyle })}
                    className={`flex flex-col items-start rounded-2xl border p-3.5 text-left transition ${
                      active
                        ? "border-primary bg-primary/5 ring-2 ring-primary/20 shadow-xs"
                        : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <LayoutIcon className={`h-4 w-4 ${active ? "text-primary" : "text-slate-400"}`} />
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100">{l.name}</span>
                    </div>
                    <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">{l.desc}</p>
                  </button>
                );
              })}
            </div>
          </Card>

          {/* 3. Tipografías de Google Fonts */}
          <Card className="space-y-4 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Type className="h-5 w-5 text-indigo-500" />
                <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Tipografía Oficial (Google Fonts)
                </h2>
              </div>

              {/* Category Pills */}
              <div className="flex items-center gap-1 text-[11px]">
                {(["all", "sans", "serif", "display"] as const).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setFontCategory(cat)}
                    className={`rounded-lg px-2.5 py-1 font-semibold capitalize transition ${
                      fontCategory === cat
                        ? "bg-primary text-white"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                    }`}
                  >
                    {cat === "all" ? "Todas" : cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-2 sm:grid-cols-2 max-h-60 overflow-y-auto pr-1">
              {filteredFonts.map((f) => {
                const active = theme.fontFamily === f.id;
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setTheme({ ...theme, fontFamily: f.id })}
                    className={`flex flex-col items-start rounded-2xl border p-3 text-left transition ${
                      active
                        ? "border-primary bg-primary/5 ring-2 ring-primary/20 shadow-xs"
                        : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex w-full items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100">{f.name}</span>
                      <span className="text-[10px] uppercase font-semibold text-slate-400">{f.category}</span>
                    </div>
                    <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                      {f.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </Card>

          {/* 4. Modo de Color & Paleta */}
          <Card className="space-y-4 border border-slate-200 dark:border-slate-800">
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Modo Oscuro, Color Primario y Bordes
            </h2>

            {/* Dark / Light Toggle */}
            <div className="flex items-center justify-between rounded-2xl border border-slate-200 dark:border-slate-800 p-3 bg-slate-50 dark:bg-slate-800/50">
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  Modo de Color para Reservas
                </span>
                <p className="text-[11px] text-slate-500">
                  {theme.themeMode === "dark" ? "Fondo oscuro obsidiana" : "Fondo claro pulcro"}
                </p>
              </div>

              <div className="flex items-center gap-1 rounded-xl bg-white dark:bg-slate-900 p-1 border border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() =>
                    setTheme({
                      ...theme,
                      themeMode: "light",
                      backgroundColor: "#f4f2fb",
                    })
                  }
                  className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                    theme.themeMode === "light"
                      ? "bg-primary text-white shadow-xs"
                      : "text-slate-600 dark:text-slate-400"
                  }`}
                >
                  <Sun className="h-3.5 w-3.5" /> Claro
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setTheme({
                      ...theme,
                      themeMode: "dark",
                      backgroundColor: "#090d16",
                    })
                  }
                  className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                    theme.themeMode === "dark"
                      ? "bg-primary text-white shadow-xs"
                      : "text-slate-600 dark:text-slate-400"
                  }`}
                >
                  <Moon className="h-3.5 w-3.5" /> Oscuro
                </button>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Color Primario / Marca
                </label>
                <div className="mt-1 flex items-center gap-2">
                  <input
                    type="color"
                    value={theme.primaryColor}
                    onChange={(e) => setTheme({ ...theme, primaryColor: e.target.value })}
                    className="h-9 w-12 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer p-0.5"
                  />
                  <input
                    type="text"
                    value={theme.primaryColor}
                    onChange={(e) => setTheme({ ...theme, primaryColor: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Color de Fondo
                </label>
                <div className="mt-1 flex items-center gap-2">
                  <input
                    type="color"
                    value={theme.backgroundColor}
                    onChange={(e) => setTheme({ ...theme, backgroundColor: e.target.value })}
                    className="h-9 w-12 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer p-0.5"
                  />
                  <input
                    type="text"
                    value={theme.backgroundColor}
                    onChange={(e) => setTheme({ ...theme, backgroundColor: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-mono"
                  />
                </div>
              </div>

            </div>
          </Card>

          {/* 5. Estilo y Personalización de Botones (Button Styler - Linktree Pro) */}
          <Card className="space-y-4 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-3">
              <div className="flex items-center gap-2">
                <MousePointerClick className="h-5 w-5 text-primary" />
                <div>
                  <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    Estilo y Personalización 100% a Medida (Botones & Estructura)
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Ajustá colores exactos, grosores de borde, padding, alineación, mayúsculas, forma del avatar y orden de bloques.
                  </p>
                </div>
              </div>
              <span className="rounded-full bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 text-[9px] font-black uppercase">
                100% Custom
              </span>
            </div>

            {/* Jerarquía de Contenido & Modo Link-in-Bio */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Jerarquía de Contenido y Modo de la Web
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {[
                  {
                    id: "booking-first",
                    name: "Turnos Primero",
                    desc: "Servicios y agenda arriba, enlaces al pie.",
                  },
                  {
                    id: "links-first",
                    name: "Bio Links Primero",
                    desc: "Enlaces y redes arriba estilo Linktree, turnos abajo.",
                  },
                  {
                    id: "links-only",
                    name: "Bio Link Puro (nxt-lnk)",
                    desc: "Solo enlaces y redes, botón compacto de turnos.",
                  },
                ].map((item) => {
                  const active = theme.sectionOrder === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setTheme({ ...theme, sectionOrder: item.id as SectionOrder })}
                      className={`flex flex-col items-start rounded-xl border p-2.5 text-left transition ${
                        active
                          ? "border-primary bg-primary/10 ring-2 ring-primary/20 text-primary"
                          : "border-slate-200 dark:border-slate-700 hover:border-slate-300 text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      <span className="text-xs font-bold">{item.name}</span>
                      <span className="text-[10px] opacity-70 mt-0.5">{item.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Avatar & Foto de Perfil */}
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Forma del Avatar / Logo
                </label>
                <select
                  value={theme.avatarShape}
                  onChange={(e) => setTheme({ ...theme, avatarShape: e.target.value as AvatarShape })}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs"
                >
                  <option value="circle">Circular (Clásico Bio-Link)</option>
                  <option value="rounded">Squircle Moderno (Bordes Suaves)</option>
                  <option value="square">Cuadrado Minimal</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Borde y Resplandor de Avatar
                </label>
                <select
                  value={theme.avatarBorder}
                  onChange={(e) => setTheme({ ...theme, avatarBorder: e.target.value as AvatarBorder })}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs"
                >
                  <option value="none">Sin borde</option>
                  <option value="subtle">Borde Sutil (2px blanco)</option>
                  <option value="thick">Borde Marcado (4px)</option>
                  <option value="glow">Aura Luminosa (Glow)</option>
                </select>
              </div>
            </div>

            {/* Variante de Estilo de Botón */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Acabado Visual del Botón
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { id: "solid", name: "Sólido", desc: "Relleno a color pleno" },
                  { id: "outline", name: "Delineado", desc: "Fondo transparente y borde vivo" },
                  { id: "glass", name: "Glassmorphism", desc: "Cristal traslúcido con blur" },
                  { id: "neubrutalism", name: "Neubrutalism", desc: "Borde 2px y sombra dura" },
                  { id: "glow", name: "Glow Neón", desc: "Resplandor difuso de luz" },
                ].map((s) => {
                  const active = theme.buttonStyle === s.id;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setTheme({ ...theme, buttonStyle: s.id as ButtonStyleVariant })}
                      className={`flex flex-col items-start rounded-xl border p-2.5 text-left transition ${
                        active
                          ? "border-primary bg-primary/10 ring-2 ring-primary/20 text-primary"
                          : "border-slate-200 dark:border-slate-700 hover:border-slate-300 text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      <span className="text-xs font-bold">{s.name}</span>
                      <span className="text-[10px] opacity-70 mt-0.5">{s.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Colores Personalizados de Botones */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-700/80 p-3.5 space-y-3 bg-slate-50/60 dark:bg-slate-900/40">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  Colores 100% Personalizados de Botones
                </span>
                {(theme.buttonCustomBg || theme.buttonCustomText || theme.buttonCustomBorder) && (
                  <button
                    type="button"
                    onClick={() =>
                      setTheme({
                        ...theme,
                        buttonCustomBg: "",
                        buttonCustomText: "",
                        buttonCustomBorder: "",
                      })
                    }
                    className="text-[10px] text-primary hover:underline font-bold"
                  >
                    Restablecer a automático
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Fondo de Botón
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="color"
                      value={theme.buttonCustomBg || theme.primaryColor}
                      onChange={(e) => setTheme({ ...theme, buttonCustomBg: e.target.value })}
                      className="h-8 w-10 rounded border border-slate-200 dark:border-slate-700 cursor-pointer p-0.5"
                    />
                    <input
                      type="text"
                      placeholder={theme.primaryColor}
                      value={theme.buttonCustomBg}
                      onChange={(e) => setTheme({ ...theme, buttonCustomBg: e.target.value })}
                      className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-1 text-xs font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Texto de Botón
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="color"
                      value={theme.buttonCustomText || "#ffffff"}
                      onChange={(e) => setTheme({ ...theme, buttonCustomText: e.target.value })}
                      className="h-8 w-10 rounded border border-slate-200 dark:border-slate-700 cursor-pointer p-0.5"
                    />
                    <input
                      type="text"
                      placeholder="#ffffff"
                      value={theme.buttonCustomText}
                      onChange={(e) => setTheme({ ...theme, buttonCustomText: e.target.value })}
                      className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-1 text-xs font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Borde de Botón
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="color"
                      value={theme.buttonCustomBorder || theme.primaryColor}
                      onChange={(e) => setTheme({ ...theme, buttonCustomBorder: e.target.value })}
                      className="h-8 w-10 rounded border border-slate-200 dark:border-slate-700 cursor-pointer p-0.5"
                    />
                    <input
                      type="text"
                      placeholder={theme.primaryColor}
                      value={theme.buttonCustomBorder}
                      onChange={(e) => setTheme({ ...theme, buttonCustomBorder: e.target.value })}
                      className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-1 text-xs font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Grosor de Borde, Altura, Alineación y Transformación */}
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Grosor de Borde
                </label>
                <div className="grid grid-cols-4 gap-1">
                  {(["0px", "1px", "2px", "3px"] as ButtonBorderWidth[]).map((bw) => (
                    <button
                      key={bw}
                      type="button"
                      onClick={() => setTheme({ ...theme, buttonBorderWidth: bw })}
                      className={`rounded-lg border py-1 px-1.5 text-xs font-mono font-semibold transition ${
                        theme.buttonBorderWidth === bw
                          ? "border-primary bg-primary text-white shadow-xs"
                          : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      {bw}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Altura / Espaciado (Padding)
                </label>
                <div className="grid grid-cols-3 gap-1">
                  {[
                    { id: "compact", label: "Compacto" },
                    { id: "medium", label: "Medio" },
                    { id: "tall", label: "Alto" },
                  ].map((h) => (
                    <button
                      key={h.id}
                      type="button"
                      onClick={() => setTheme({ ...theme, buttonHeight: h.id as ButtonHeight })}
                      className={`rounded-lg border py-1 px-1.5 text-[11px] font-semibold transition ${
                        theme.buttonHeight === h.id
                          ? "border-primary bg-primary text-white shadow-xs"
                          : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      {h.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Alineación de Texto & Iconos
                </label>
                <div className="grid grid-cols-3 gap-1">
                  {[
                    { id: "center", label: "Centrado" },
                    { id: "spread", label: "Extremos" },
                    { id: "left", label: "Izquierda" },
                  ].map((a) => (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => setTheme({ ...theme, buttonAlignment: a.id as ButtonAlignment })}
                      className={`rounded-lg border py-1 px-1.5 text-[11px] font-semibold transition ${
                        theme.buttonAlignment === a.id
                          ? "border-primary bg-primary text-white shadow-xs"
                          : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      {a.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Formato de Texto (Mayúsculas)
                </label>
                <div className="grid grid-cols-3 gap-1">
                  {[
                    { id: "none", label: "Normal" },
                    { id: "uppercase", label: "MAYÚS" },
                    { id: "capitalize", label: "Capital" },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setTheme({ ...theme, buttonTextTransform: t.id as ButtonTextTransform })}
                      className={`rounded-lg border py-1 px-1.5 text-[11px] font-semibold transition ${
                        theme.buttonTextTransform === t.id
                          ? "border-primary bg-primary text-white shadow-xs"
                          : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Sombra y Redondez */}
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Sombra / Efecto 3D
                </label>
                <select
                  value={theme.buttonShadow}
                  onChange={(e) => setTheme({ ...theme, buttonShadow: e.target.value as ButtonShadowType })}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs"
                >
                  <option value="none">Sin sombra (Plano minimal)</option>
                  <option value="soft">Sombra Suave (Elegante)</option>
                  <option value="medium">Sombra Media (Elevación 3D)</option>
                  <option value="hard">Sombra Dura Retro (Estilo Urbano 3px)</option>
                  <option value="glow">Resplandor Difuso (Glow Neón)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Redondez de Esquinas (Border Radius)
                </label>
                <select
                  value={theme.buttonRadius}
                  onChange={(e) => setTheme({ ...theme, buttonRadius: e.target.value as ButtonRadius })}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs"
                >
                  <option value="full">Píldora Completa (Pill / Ovalado)</option>
                  <option value="lg">Redondeado Moderno (16px)</option>
                  <option value="md">Suave Equilibrado (10px)</option>
                  <option value="none">Recto Cuadrado (0px)</option>
                </select>
              </div>
            </div>

            {/* Tamaño de Texto, Grosor de Fuente & Tipografía Específica */}
            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Tamaño de Texto
                </label>
                <div className="grid grid-cols-3 gap-1">
                  {[
                    { id: "sm", label: "12px" },
                    { id: "base", label: "14px" },
                    { id: "lg", label: "16px" },
                  ].map((sz) => (
                    <button
                      key={sz.id}
                      type="button"
                      onClick={() => setTheme({ ...theme, buttonTextSize: sz.id as ButtonTextSizeType })}
                      className={`rounded-lg border py-1 px-1 text-[11px] font-semibold transition ${
                        theme.buttonTextSize === sz.id
                          ? "border-primary bg-primary text-white shadow-xs"
                          : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900"
                      }`}
                    >
                      {sz.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Grosor de Fuente
                </label>
                <select
                  value={theme.buttonFontWeight}
                  onChange={(e) => setTheme({ ...theme, buttonFontWeight: e.target.value as ButtonFontWeight })}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs"
                >
                  <option value="normal">Normal (400)</option>
                  <option value="medium">Medio (500)</option>
                  <option value="semibold">Semi-Negrita (600)</option>
                  <option value="bold">Negrita (700)</option>
                  <option value="black">Ultra-Negrita (900)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Tipografía para Botones
                </label>
                <select
                  value={theme.buttonFontFamily || "inherit"}
                  onChange={(e) => setTheme({ ...theme, buttonFontFamily: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs"
                >
                  <option value="inherit">Heredar tipografía</option>
                  {GOOGLE_FONTS.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Botón Preview Interactivo en Vivo */}
            <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 p-4">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                Previsualización en tiempo real del botón:
              </span>
              <div className="flex items-center justify-center p-2">
                <button
                  type="button"
                  className={`w-full max-w-sm flex items-center transition cursor-pointer ${getCustomButtonClasses(theme)}`}
                  style={getCustomButtonStyles(theme)}
                >
                  <span>Agendar Turno Oficial</span>
                  <ExternalLink className="h-4 w-4 shrink-0 opacity-80" />
                </button>
              </div>
            </div>
          </Card>

          {/* 6. Botones & Enlaces de Biografía (Estilo Linktree / Bento) */}
          <Card className="space-y-4 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-3">
              <div className="flex items-center gap-2">
                <LinkIcon className="h-5 w-5 text-emerald-500" />
                <div>
                  <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    Botones & Enlaces de Biografía (Estilo Linktree / Bento)
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Agregá botones de acción directa para que tus clientes pidan Uber, abran Waze o chateen por WhatsApp.
                  </p>
                </div>
              </div>
              <span className="rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-2 py-0.5 text-[9px] font-black uppercase">
                {(theme.customLinks || []).length} Enlaces
              </span>
            </div>

            {/* Quick 1-Click Action Adders */}
            <div>
              <span className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Agregar botón rápido en 1 clic:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { title: "Cómo llegar (Google Maps / Waze)", icon: "maps" as CustomLinkIcon, url: "https://maps.google.com" },
                  { title: "Pedir Uber directo al local", icon: "car" as CustomLinkIcon, url: "https://m.uber.com" },
                  { title: "WhatsApp Directo con Recepción", icon: "whatsapp" as CustomLinkIcon, url: "https://wa.me/595981000000" },
                  { title: "Dejar Reseña en Google (5 Estrellas)", icon: "star" as CustomLinkIcon, url: "https://g.page/review" },
                  { title: "Ver Lista de Precios / Menú (PDF)", icon: "file-text" as CustomLinkIcon, url: "https://tusitio.com/carta.pdf" },
                  { title: "Comprar Gift Card / Voucher", icon: "gift" as CustomLinkIcon, url: "https://agendate.io" },
                ].map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleAddCustomLink(preset)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-1.5 text-[11px] font-medium text-slate-700 dark:text-slate-300 hover:border-primary hover:text-primary transition shadow-2xs"
                  >
                    <span className="text-primary">{renderCustomLinkIcon(preset.icon, "h-3.5 w-3.5")}</span>
                    <span>{preset.title}</span>
                    <Plus className="h-3 w-3 opacity-50" />
                  </button>
                ))}
              </div>
            </div>

            {/* List of Configured Custom Links */}
            <div className="space-y-3 pt-2">
              {(theme.customLinks || []).length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 p-6 text-center text-xs text-slate-400">
                  No tenés botones personalizados agregados. Hacé clic en los atajos de arriba para agregar uno.
                </div>
              ) : (
                (theme.customLinks || []).map((link) => (
                  <div
                    key={link.id}
                    className={`rounded-2xl border p-3.5 transition space-y-3 ${
                      link.enabled
                        ? "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs"
                        : "border-slate-100 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-950 opacity-60"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-1">
                        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          {renderCustomLinkIcon(link.icon, "h-4 w-4")}
                        </span>
                        <input
                          type="text"
                          value={link.title}
                          onChange={(e) => handleUpdateCustomLink(link.id, { title: e.target.value })}
                          className="flex-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent px-2.5 py-1 text-xs font-bold"
                          placeholder="Texto del botón"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Enabled Toggle */}
                        <button
                          type="button"
                          onClick={() => handleUpdateCustomLink(link.id, { enabled: !link.enabled })}
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold transition ${
                            link.enabled
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                              : "bg-slate-200 dark:bg-slate-800 text-slate-500"
                          }`}
                        >
                          {link.enabled ? "Visible" : "Oculto"}
                        </button>

                        {/* Delete */}
                        <button
                          type="button"
                          onClick={() => handleRemoveCustomLink(link.id)}
                          className="p-1 text-slate-400 hover:text-rose-500 transition"
                          title="Eliminar botón"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div className="grid gap-2 sm:grid-cols-12 text-xs">
                      {/* URL input */}
                      <div className="sm:col-span-6">
                        <label className="block text-[10px] uppercase font-bold text-slate-400 mb-0.5">Enlace de destino (URL)</label>
                        <input
                          type="url"
                          value={link.url}
                          onChange={(e) => handleUpdateCustomLink(link.id, { url: e.target.value })}
                          className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent px-2.5 py-1 text-xs font-mono"
                          placeholder="https://..."
                        />
                      </div>

                      {/* Icon selector */}
                      <div className="sm:col-span-3">
                        <label className="block text-[10px] uppercase font-bold text-slate-400 mb-0.5">Icono</label>
                        <select
                          value={link.icon}
                          onChange={(e) => handleUpdateCustomLink(link.id, { icon: e.target.value as CustomLinkIcon })}
                          className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-1 text-xs"
                        >
                          <option value="maps">Mapa / Waze</option>
                          <option value="car">Auto / Uber</option>
                          <option value="whatsapp">WhatsApp</option>
                          <option value="star">Estrella / Reseña</option>
                          <option value="file-text">Archivo / PDF</option>
                          <option value="gift">Regalo / Voucher</option>
                          <option value="phone">Teléfono</option>
                          <option value="globe">Web</option>
                          <option value="instagram">Instagram</option>
                        </select>
                      </div>

                      {/* Style Highlight selector */}
                      <div className="sm:col-span-3">
                        <label className="block text-[10px] uppercase font-bold text-slate-400 mb-0.5">Estilo</label>
                        <select
                          value={link.style || "default"}
                          onChange={(e) => handleUpdateCustomLink(link.id, { style: e.target.value as any })}
                          className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-1 text-xs"
                        >
                          <option value="default">Estándar</option>
                          <option value="highlight">Destacado (Pulsante)</option>
                          <option value="outline">Delineado (Outline)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))
              )}

              <button
                type="button"
                onClick={() => handleAddCustomLink()}
                className="w-full rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 py-3 text-center text-xs font-bold text-slate-600 dark:text-slate-400 hover:border-primary hover:text-primary transition flex items-center justify-center gap-1.5"
              >
                <Plus className="h-4 w-4" /> Agregar otro botón personalizado
              </button>
            </div>
          </Card>

          {/* 7. Efectos de Fondo y Jerarquía de Textos */}
          <Card className="space-y-4 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-500" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Efectos Ambientales de Fondo y Jerarquía de Textos
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Personalizá el tamaño de los títulos y agregá texturas de iluminación sutil para que tu web no se vea plana.
            </p>

            <div className="grid gap-3 sm:grid-cols-2">
              {/* Background Effect */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Efecto Ambiental de Fondo
                </label>
                <select
                  value={theme.backgroundEffect || "none"}
                  onChange={(e) => setTheme({ ...theme, backgroundEffect: e.target.value as BackgroundEffectType })}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs"
                >
                  <option value="none">Color Plano / Limpio</option>
                  <option value="mesh">Malla de Luz Difusa (Mesh Glow)</option>
                  <option value="dots">Textura de Puntos Suaves (Polka Dots)</option>
                  <option value="grid">Cuadrícula Arquitectónica (Grid)</option>
                </select>
              </div>

              {/* Title Size */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Tamaño del Nombre de Tu Negocio
                </label>
                <select
                  value={theme.titleSize || "lg"}
                  onChange={(e) => setTheme({ ...theme, titleSize: e.target.value as TitleSizeType })}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs"
                >
                  <option value="sm">Compacto (18px)</option>
                  <option value="base">Equilibrado (20px)</option>
                  <option value="lg">Grande y Destacado (24px)</option>
                  <option value="xl">Imponente Editorial (32px)</option>
                </select>
              </div>
            </div>
          </Card>

          {/* 5. Galería de Fotos de Trabajos del Local */}
          <Card className="space-y-4 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-emerald-500" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Galería de Fotos de Trabajos y Local
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Fotos que verán tus clientes al entrar a reservar (cortes, manicura, peinados, instalaciones).
            </p>

            {/* Add photo bar */}
            <div className="flex gap-2">
              <input
                type="url"
                value={newPhotoUrl}
                onChange={(e) => setNewPhotoUrl(e.target.value)}
                placeholder="https://images.unsplash.com/... o enlace de foto"
                className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2 text-xs outline-none focus:border-primary"
              />
              <button
                type="button"
                onClick={handleAddPhoto}
                className="inline-flex items-center gap-1 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 px-3.5 py-2 text-xs font-bold"
              >
                <Plus className="h-3.5 w-3.5" /> Agregar
              </button>
            </div>

            {/* Photos Grid */}
            <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4">
              {(theme.galleryUrls || []).map((url, idx) => (
                <div key={idx} className="group relative h-20 overflow-hidden rounded-xl bg-slate-800 border border-slate-200 dark:border-slate-700">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt={`Foto ${idx}`} className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemovePhoto(idx)}
                    className="absolute top-1 right-1 rounded-full bg-rose-600/90 p-1 text-white opacity-0 group-hover:opacity-100 transition"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          </Card>

          {/* 6. Portada, Logo, Bio & Redes */}
          <Card className="space-y-4 border border-slate-200 dark:border-slate-800">
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Cabecera, Portada, Bio & Redes
            </h2>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  URL Foto de Portada / Banner (Panorámico)
                </label>
                <input
                  type="url"
                  value={theme.bannerUrl}
                  onChange={(e) => setTheme({ ...theme, bannerUrl: e.target.value })}
                  placeholder="https://..."
                  className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2 text-xs outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  URL del Logo del Local
                </label>
                <input
                  type="url"
                  value={theme.logoUrl}
                  onChange={(e) => setTheme({ ...theme, logoUrl: e.target.value })}
                  placeholder="https://..."
                  className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2 text-xs outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Slogan</label>
                  <input
                    type="text"
                    value={theme.slogan}
                    onChange={(e) => setTheme({ ...theme, slogan: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Aviso Previo / Políticas
                  </label>
                  <input
                    type="text"
                    value={theme.bookingNotice}
                    onChange={(e) => setTheme({ ...theme, bookingNotice: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Bio / Descripción</label>
                <textarea
                  rows={2}
                  value={theme.bio}
                  onChange={(e) => setTheme({ ...theme, bio: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs outline-none focus:border-primary resize-none"
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Instagram</label>
                  <input
                    type="text"
                    value={theme.instagram}
                    onChange={(e) => setTheme({ ...theme, instagram: e.target.value })}
                    placeholder="@tunegocio"
                    className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">WhatsApp</label>
                  <input
                    type="text"
                    value={theme.whatsapp}
                    onChange={(e) => setTheme({ ...theme, whatsapp: e.target.value })}
                    placeholder="0981 123 456"
                    className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs outline-none focus:border-primary"
                  />
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Live Phone Preview Column */}
        <div className="lg:col-span-5 lg:sticky lg:top-6">
          <div className="flex items-center justify-between pb-2">
            <div className="flex items-center gap-2">
              <Smartphone className="h-4 w-4 text-slate-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Previsualización en Vivo
              </span>
            </div>
            <span className="text-[11px] font-semibold text-primary">
              Tipografía: {GOOGLE_FONTS.find((f) => f.id === theme.fontFamily)?.name || "Sans"}
            </span>
          </div>

          {/* Smartphone Frame */}
          <div className="relative mx-auto max-w-[340px] rounded-[42px] border-[10px] border-slate-900 bg-white shadow-2xl overflow-hidden min-h-[640px] flex flex-col">
            {/* Speaker notch */}
            <div className="absolute top-0 inset-x-0 h-4 bg-slate-900 flex justify-center items-center z-30">
              <div className="h-1.5 w-16 bg-slate-700 rounded-full" />
            </div>

            {/* Simulated Public Booking Page */}
            <div
              className="relative flex-1 flex flex-col transition-all duration-300 overflow-hidden"
              style={{
                backgroundColor: theme.backgroundColor,
                fontFamily: fontStack(theme.fontFamily),
                color: isDark ? "#f8fafc" : "#0f172a",
                ["--primary" as string]: theme.primaryColor,
              }}
            >
              {/* Background Effect Simulation in Phone */}
              {theme.backgroundEffect === "mesh" && (
                <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-30 z-0">
                  <div
                    className="absolute -top-10 -left-10 h-36 w-36 rounded-full blur-2xl"
                    style={{ backgroundColor: theme.primaryColor }}
                  />
                  <div
                    className="absolute top-1/2 -right-10 h-36 w-36 rounded-full blur-2xl"
                    style={{ backgroundColor: theme.primaryColor }}
                  />
                </div>
              )}
              {theme.backgroundEffect === "dots" && (
                <div
                  className="pointer-events-none absolute inset-0 opacity-[0.08] z-0"
                  style={{
                    backgroundImage: "radial-gradient(currentColor 1.5px, transparent 1.5px)",
                    backgroundSize: "14px 14px",
                  }}
                />
              )}
              {theme.backgroundEffect === "grid" && (
                <div
                  className="pointer-events-none absolute inset-0 opacity-[0.06] z-0"
                  style={{
                    backgroundImage:
                      "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
                    backgroundSize: "20px 20px",
                  }}
                />
              )}

              {/* Banner */}
              <div className="relative h-28 w-full bg-slate-800 overflow-hidden z-10">
                {theme.bannerUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={theme.bannerUrl}
                    alt="Banner"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div
                    className="h-full w-full"
                    style={{
                      background: `linear-gradient(135deg, ${theme.primaryColor}, #0f172a)`,
                    }}
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              </div>

              {/* Business Profile Header */}
              <div className="relative px-4 pb-3 -mt-9 z-10">
                <div className="flex items-end justify-between">
                  {(() => {
                    const avatarShapeClass =
                      theme.avatarShape === "circle"
                        ? "rounded-full"
                        : theme.avatarShape === "square"
                        ? "rounded-sm"
                        : "rounded-2xl";
                    const avatarBorderClass =
                      theme.avatarBorder === "none"
                        ? "border-0 shadow-sm"
                        : theme.avatarBorder === "thick"
                        ? "border-4 border-white shadow-xl"
                        : theme.avatarBorder === "glow"
                        ? "border-2 border-white ring-4 ring-primary/40 shadow-xl"
                        : "border-2 border-white shadow-md";

                    return (
                      <div className={`h-16 w-16 bg-white overflow-hidden flex items-center justify-center font-bold text-slate-800 text-lg transition-all ${avatarShapeClass} ${avatarBorderClass}`}>
                        {theme.logoUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={theme.logoUrl}
                            alt="Logo"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <Store className="h-7 w-7 text-primary" />
                        )}
                      </div>
                    );
                  })()}

                  {/* Social Buttons */}
                  <div className="flex items-center gap-1">
                    {theme.instagram && (
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/90 shadow-xs text-slate-700">
                        <InstagramIcon className="h-3.5 w-3.5" />
                      </span>
                    )}
                    {theme.whatsapp && (
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 text-white shadow-xs">
                        <MessageCircle className="h-3.5 w-3.5" />
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-2">
                  <h3
                    className={`leading-tight tracking-tight ${
                      theme.titleSize === "sm"
                        ? "text-xs font-bold"
                        : theme.titleSize === "base"
                        ? "text-sm font-extrabold"
                        : theme.titleSize === "xl"
                        ? "text-lg font-black"
                        : "text-base font-bold"
                    }`}
                  >
                    {business.name}
                  </h3>
                  <p className="text-[11px] opacity-75 mt-0.5">{theme.slogan}</p>
                  <p className="text-[10px] opacity-60 mt-1 line-clamp-2">{theme.bio}</p>
                </div>

                {/* Photos mini-strip in preview */}
                {(theme.galleryUrls || []).length > 0 && (
                  <div className="mt-2.5 flex gap-1 overflow-x-auto pb-1">
                    {(theme.galleryUrls || []).slice(0, 4).map((url, i) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img key={i} src={url} alt="thumb" className="h-9 w-9 rounded-lg object-cover shrink-0" />
                    ))}
                  </div>
                )}
              </div>

              {/* Dynamic Content Section: Respects sectionOrder */}
              <div className="px-4 pb-4 space-y-3 flex-1 relative z-10">
                {/* 1. If links-first or links-only: render custom links block at top */}
                {(theme.sectionOrder === "links-first" || theme.sectionOrder === "links-only") && (
                  <div className="space-y-1.5">
                    {(theme.customLinks || [])
                      .filter((l) => l.enabled)
                      .map((link) => {
                        const isHighlight = link.style === "highlight";
                        const isOutline = link.style === "outline";

                        return (
                          <div
                            key={link.id}
                            className={`w-full flex items-center transition duration-150 cursor-pointer ${getCustomButtonClasses(
                              theme
                            )} ${isHighlight ? "ring-2 ring-primary ring-offset-1 animate-pulse" : ""}`}
                            style={getCustomButtonStyles(theme, isOutline, isHighlight)}
                          >
                            <div className="flex items-center gap-1.5 truncate">
                              <span className="shrink-0">{renderCustomLinkIcon(link.icon, "h-3.5 w-3.5")}</span>
                              <span className="truncate text-[11px]">{link.title}</span>
                            </div>
                            {theme.buttonAlignment === "spread" && (
                              <ExternalLink className="h-3 w-3 shrink-0 opacity-60 ml-2" />
                            )}
                          </div>
                        );
                      })}
                  </div>
                )}

                {/* 2. Services / Booking block (hidden in links-only mode, or displayed as compact launcher) */}
                {theme.sectionOrder !== "links-only" ? (
                  <div className="space-y-2 pt-1">
                    {/* Tabs Simulator */}
                    <div className="flex rounded-xl bg-black/5 dark:bg-white/10 p-1 text-[11px] font-bold">
                      <span
                        className="flex-1 rounded-lg py-1.5 text-center text-white shadow-xs flex items-center justify-center gap-1.5"
                        style={{ backgroundColor: theme.primaryColor }}
                      >
                        <Calendar className="h-3.5 w-3.5" />
                        Turnos
                      </span>
                      <span className="flex-1 rounded-lg py-1.5 text-center opacity-60 flex items-center justify-center gap-1.5">
                        <ShoppingBag className="h-3.5 w-3.5" />
                        Tienda
                      </span>
                    </div>

                    <p className="text-[10px] font-bold uppercase tracking-wider opacity-60 pt-1">
                      Servicios disponibles
                    </p>

                    {services.slice(0, 3).map((s) => (
                      <div
                        key={s.id}
                        className={`rounded-2xl border p-2.5 transition flex items-center justify-between ${
                          isDark ? "bg-slate-800/80 border-slate-700" : "bg-white border-slate-200 shadow-xs"
                        }`}
                      >
                        <div>
                          <p className="text-xs font-bold leading-tight">{s.name}</p>
                          <span className="text-[10px] opacity-60 mt-0.5 inline-flex items-center gap-1">
                            <Clock className="h-2.5 w-2.5" /> {s.durationMin} min
                          </span>
                        </div>
                        <span
                          className="text-xs font-black"
                          style={{ color: theme.primaryColor }}
                        >
                          {formatGs(s.price)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-primary/40 bg-primary/5 p-3 text-center space-y-1">
                    <span className="text-[11px] font-bold text-primary block">
                      Modo Bio Link Puro Activo
                    </span>
                    <p className="text-[10px] opacity-70">
                      Tus enlaces sociales y accesos directos se muestran como foco principal.
                    </p>
                  </div>
                )}

                {/* 3. If booking-first: render custom links block below services */}
                {theme.sectionOrder === "booking-first" && (
                  <div className="space-y-1.5 pt-2">
                    <p className="text-[10px] font-bold uppercase tracking-wider opacity-60">
                      Enlaces & Redes
                    </p>
                    {(theme.customLinks || [])
                      .filter((l) => l.enabled)
                      .map((link) => {
                        const isHighlight = link.style === "highlight";
                        const isOutline = link.style === "outline";

                        return (
                          <div
                            key={link.id}
                            className={`w-full flex items-center transition duration-150 cursor-pointer ${getCustomButtonClasses(
                              theme
                            )} ${isHighlight ? "ring-2 ring-primary ring-offset-1 animate-pulse" : ""}`}
                            style={getCustomButtonStyles(theme, isOutline, isHighlight)}
                          >
                            <div className="flex items-center gap-1.5 truncate">
                              <span className="shrink-0">{renderCustomLinkIcon(link.icon, "h-3.5 w-3.5")}</span>
                              <span className="truncate text-[11px]">{link.title}</span>
                            </div>
                            {theme.buttonAlignment === "spread" && (
                              <ExternalLink className="h-3 w-3 shrink-0 opacity-60 ml-2" />
                            )}
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>

              {/* Bottom Sticky Action Bar in Phone */}
              <div className="p-3 border-t border-black/5 dark:border-white/5 bg-white/10 backdrop-blur-xs relative z-10">
                <div
                  className={`w-full flex items-center transition cursor-pointer ${getCustomButtonClasses(
                    theme
                  )}`}
                  style={getCustomButtonStyles(theme)}
                >
                  <span>Continuar con la reserva</span>
                  <ExternalLink className="h-3.5 w-3.5 shrink-0 opacity-80 ml-2" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
