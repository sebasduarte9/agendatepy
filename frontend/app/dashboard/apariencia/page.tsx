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

import { useDashboardStore } from "@/store/useDashboardStore";
import Card from "@/components/dashboard/ui/Card";
import {
  THEME_PRESETS,
  DEFAULT_THEME,
  GOOGLE_FONTS,
  googleFontHref,
  fontStack,
  type ThemePreset,
  type ButtonRadius,
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

  const isDark =
    theme.themeMode === "dark" ||
    theme.themePreset === "barber-dark" ||
    theme.themePreset === "obsidian-gold" ||
    theme.themePreset === "cyber-noir";

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
          {/* 1. Presets de 1 Clic */}
          <Card className="space-y-4 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-500" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Temas & Estilos Profesionales (1 Clic)
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Elegí un preset diseñado para tu rubro o ajustá cada variable manualmente.
            </p>

            <div className="grid gap-2.5 sm:grid-cols-2">
              {(Object.keys(THEME_PRESETS) as ThemePreset[]).map((key) => {
                const p = THEME_PRESETS[key];
                const active = theme.themePreset === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => applyPreset(key)}
                    className={`flex flex-col items-start rounded-2xl border p-3.5 text-left transition ${
                      active
                        ? "border-primary bg-primary/5 ring-2 ring-primary/20 shadow-xs"
                        : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex w-full items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100">{p.name}</span>
                      <div className="flex items-center gap-1">
                        <span
                          className="h-3 w-3 rounded-full border border-black/10"
                          style={{ backgroundColor: p.primaryColor }}
                        />
                        <span
                          className="h-3 w-3 rounded-full border border-black/10"
                          style={{ backgroundColor: p.backgroundColor }}
                        />
                      </div>
                    </div>
                    <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">{p.description}</p>
                  </button>
                );
              })}
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

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Bordes de Botones
                </label>
                <select
                  value={theme.buttonRadius}
                  onChange={(e) => setTheme({ ...theme, buttonRadius: e.target.value as ButtonRadius })}
                  className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs"
                >
                  <option value="full">Completamente Redondeado (Pill)</option>
                  <option value="lg">Redondeado Suave</option>
                  <option value="md">Borde Moderno</option>
                  <option value="none">Recto / Minimalista</option>
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
              className="flex-1 flex flex-col transition-all duration-300"
              style={{
                backgroundColor: theme.backgroundColor,
                fontFamily: fontStack(theme.fontFamily),
                color: isDark ? "#f8fafc" : "#0f172a",
                ["--primary" as string]: theme.primaryColor,
              }}
            >
              {/* Banner */}
              <div className="relative h-28 w-full bg-slate-800 overflow-hidden">
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
              <div className="relative px-4 pb-3 -mt-9">
                <div className="flex items-end justify-between">
                  <div className="h-16 w-16 rounded-2xl bg-white border-2 border-white shadow-md overflow-hidden flex items-center justify-center font-bold text-slate-800 text-lg">
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
                  <h3 className="font-bold text-base leading-tight">{business.name}</h3>
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

                {/* Tabs Simulator */}
                <div className="mt-3 flex rounded-xl bg-black/5 dark:bg-white/10 p-1 text-[11px] font-bold">
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
              </div>

              {/* Services List Preview */}
              <div className="px-4 pb-4 space-y-2 flex-1">
                <p className="text-[10px] font-bold uppercase tracking-wider opacity-60">
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

              {/* Bottom Sticky Action Bar in Phone */}
              <div className="p-3 border-t border-black/5 dark:border-white/5 bg-white/10 backdrop-blur-xs">
                <div
                  className={`w-full py-2.5 text-center text-xs font-bold text-white shadow-sm ${
                    theme.buttonRadius === "full"
                      ? "rounded-full"
                      : theme.buttonRadius === "lg"
                      ? "rounded-xl"
                      : theme.buttonRadius === "md"
                      ? "rounded-lg"
                      : "rounded-none"
                  }`}
                  style={{ backgroundColor: theme.primaryColor }}
                >
                  Continuar con la reserva
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
