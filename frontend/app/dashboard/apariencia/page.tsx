"use client";

import { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import {
  Check,
  CheckCircle2,
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
  Upload,
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
import { compressClientImage } from "@/lib/media-compression";

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

const PRESET_SAMPLE_PHOTOS = [
  { label: "Corte Fade Clásico", url: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=600&q=80" },
  { label: "Perfilado & Barba", url: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=600&q=80" },
  { label: "Balayage & Rubio", url: "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=600&q=80" },
  { label: "Tratamiento Capilar", url: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80" },
  { label: "Spa & Masajes", url: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=600&q=80" },
  { label: "Manicura & Uñas", url: "https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&w=600&q=80" },
];

const PRESET_BANNERS = [
  { label: "Barbería Premium", url: "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=1200&q=80" },
  { label: "Salón Luminoso", url: "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1200&q=80" },
  { label: "Spa & Bienestar", url: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80" },
  { label: "Estética Moderna", url: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1200&q=80" },
];

export default function AparienciaPage() {
  const { business, services, updateBusiness, pushToast, openTour } = useDashboardStore();

  const [theme, setTheme] = useState<ThemeSettings>(DEFAULT_THEME);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [activeTab, setActiveTab] = useState<"estilos" | "fotos" | "botones" | "textos">("estilos");
  const [newPhotoUrl, setNewPhotoUrl] = useState("");
  const [fontCategory, setFontCategory] = useState<"all" | "sans" | "serif" | "display">("all");
  const [presetFilter, setPresetFilter] = useState<string>("Todos");

  // Direct upload states (compression is seamless and invisible)
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);

  // Tab switch listener from Guided Tour
  useEffect(() => {
    function handleTabSwitch(e: any) {
      if (e?.detail?.tab) {
        setActiveTab(e.detail.tab);
      }
    }
    window.addEventListener("agendate-switch-tab", handleTabSwitch);
    return () => window.removeEventListener("agendate-switch-tab", handleTabSwitch);
  }, []);

  // Prevent silent loss of changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = "Tenés cambios sin guardar. ¿Seguro que querés salir?";
        return e.returnValue;
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

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
    setHasUnsavedChanges(true);
    pushToast("success", `Tema "${p.name}" seleccionado. Tocá "Guardar Cambios" para publicarlo.`);
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
      setHasUnsavedChanges(false);
      pushToast("success", "¡Diseño y apariencia de tu página guardados con éxito!");
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
      setHasUnsavedChanges(true);
      pushToast("success", "Foto agregada a la galería");
    } catch {
      pushToast("error", "Ingresá una URL válida (https://...)");
    }
  }

  function handleAddPresetPhoto(url: string) {
    setTheme((prev) => ({
      ...prev,
      galleryUrls: [...(prev.galleryUrls || []), url],
    }));
    setHasUnsavedChanges(true);
    pushToast("success", "Foto de ejemplo agregada");
  }

  function handleSelectPresetBanner(url: string) {
    setTheme((prev) => ({
      ...prev,
      bannerUrl: url,
    }));
    setHasUnsavedChanges(true);
    pushToast("success", "Foto de portada actualizada");
  }

  // Direct image upload for Gallery Photos with invisible compression
  async function handleFileUpload(files: FileList | null) {
    if (!files || files.length === 0) return;
    setIsUploadingPhoto(true);
    try {
      const newUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        // Compresses silently in the background
        const compressed = await compressClientImage(file, 1400, 1400, 0.82);
        const res = await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ dataUrl: compressed.dataUrl, filename: file.name }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.url) {
            newUrls.push(data.url);
          }
        }
      }
      if (newUrls.length > 0) {
        setTheme((prev) => ({
          ...prev,
          galleryUrls: [...(prev.galleryUrls || []), ...newUrls],
        }));
        setHasUnsavedChanges(true);
        pushToast("success", `${newUrls.length} foto(s) agregada(s) con éxito`);
      }
    } catch (err) {
      console.error("Error al subir fotos:", err);
      pushToast("error", "No se pudo subir la foto");
    } finally {
      setIsUploadingPhoto(false);
    }
  }

  // Direct image upload for Banner
  async function handleBannerUpload(file: File | null) {
    if (!file) return;
    setIsUploadingBanner(true);
    try {
      const compressed = await compressClientImage(file, 1920, 1080, 0.85);
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dataUrl: compressed.dataUrl, filename: file.name }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.url) {
          setTheme((prev) => ({ ...prev, bannerUrl: data.url }));
          setHasUnsavedChanges(true);
          pushToast("success", "Foto de portada actualizada con éxito");
        }
      }
    } catch (err) {
      console.error("Error al subir portada:", err);
      pushToast("error", "No se pudo subir la portada");
    } finally {
      setIsUploadingBanner(false);
    }
  }

  // Direct image upload for Logo
  async function handleLogoUpload(file: File | null) {
    if (!file) return;
    setIsUploadingLogo(true);
    try {
      const compressed = await compressClientImage(file, 600, 600, 0.88);
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dataUrl: compressed.dataUrl, filename: file.name }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.url) {
          setTheme((prev) => ({ ...prev, logoUrl: data.url }));
          setHasUnsavedChanges(true);
          pushToast("success", "Logo actualizado con éxito");
        }
      }
    } catch (err) {
      console.error("Error al subir logo:", err);
      pushToast("error", "No se pudo subir el logo");
    } finally {
      setIsUploadingLogo(false);
    }
  }

  function handleRemovePhoto(index: number) {
    setTheme((prev) => ({
      ...prev,
      galleryUrls: prev.galleryUrls.filter((_, i) => i !== index),
    }));
    setHasUnsavedChanges(true);
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
    setHasUnsavedChanges(true);
    pushToast("success", `Botón "${newLink.title}" agregado`);
  }

  function handleUpdateCustomLink(id: string, updates: Partial<CustomLinkItem>) {
    setTheme((prev) => ({
      ...prev,
      customLinks: (prev.customLinks || []).map((l) =>
        l.id === id ? { ...l, ...updates } : l
      ),
    }));
    setHasUnsavedChanges(true);
  }

  function handleRemoveCustomLink(id: string) {
    setTheme((prev) => ({
      ...prev,
      customLinks: (prev.customLinks || []).filter((l) => l.id !== id),
    }));
    setHasUnsavedChanges(true);
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

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => openTour("apariencia")}
            className="inline-flex items-center gap-1.5 rounded-xl border border-primary/30 bg-primary/10 hover:bg-primary/20 text-primary px-3.5 py-2 text-xs font-bold transition shadow-xs group cursor-pointer"
            title="Aprender a personalizar tu página paso a paso"
          >
            <Sparkles className="h-4 w-4 text-primary group-hover:rotate-12 transition-transform" />
            <span>Visita Guiada</span>
          </button>
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
            data-tour="tour-save"
            disabled={isSaving}
            onClick={() => handleSave()}
            className={`inline-flex items-center gap-2 rounded-2xl px-6 py-2.5 sm:px-7 sm:py-3 text-xs sm:text-sm font-extrabold text-white transition-all duration-200 cursor-pointer shadow-lg disabled:opacity-50 ${
              hasUnsavedChanges
                ? "bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-500 ring-4 ring-emerald-500/30 shadow-emerald-500/40 scale-105 animate-pulse"
                : "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20"
            }`}
          >
            {isSaving ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : savedSuccess ? (
              <Check className="h-5 w-5 text-emerald-100 stroke-[3]" />
            ) : (
              <Save className="h-5 w-5" />
            )}
            <span>
              {isSaving ? "Guardando..." : savedSuccess ? "¡Guardado con Éxito!" : "Guardar Cambios"}
            </span>
          </button>
        </div>
      </div>

      {/* Category Tabs: Solves 3,500px scroll overload */}
      <div className="flex items-center gap-2 border-b border-slate-200/80 dark:border-white/10 pb-3 overflow-x-auto">
        {[
          { id: "estilos", label: "1. Estilos & Colores", icon: Palette },
          { id: "fotos", label: "2. Fotos & Portada", icon: ImageIcon },
          { id: "botones", label: "3. Botones & Links Bio", icon: LinkIcon },
          { id: "textos", label: "4. Textos & Políticas", icon: Sliders },
        ].map((tab) => {
          const TabIcon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                active
                  ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm"
                  : "bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <TabIcon className={`h-3.5 w-3.5 ${active ? "text-primary dark:text-primary" : "opacity-60"}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {loadingInitial && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 text-xs text-slate-500 flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          Cargando el diseño actual de tu negocio...
        </div>
      )}

      {/* Main Split Grid: Controls (Left) vs Real-Time Live Phone Preview (Right) */}
      <div className="grid items-start gap-6 lg:grid-cols-12">
        {/* Controls Column */}
        <div className="space-y-6 lg:col-span-7">
          {/* TAB 1: ESTILOS & COLORES */}
          {activeTab === "estilos" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* 1. Presets de 1 Clic */}
              <div data-tour="tour-presets">
                <Card className="space-y-4 border border-slate-200 dark:border-slate-800">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-white/5 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-amber-500" />
                        <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                          Estilos y Paletas Profesionales
                        </h2>
                        <span className="rounded-full bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20 px-2 py-0.5 text-[9px] font-black uppercase">
                          12 Estilos Listos
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Elegí un estilo listo para aplicar colores, fuentes y fondos de inmediato a tu web.
                      </p>
                    </div>
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
                        className={`rounded-xl px-2.5 py-1 text-[11px] font-bold transition cursor-pointer ${
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
                            className={`group relative flex flex-col justify-between rounded-2xl border p-4 text-left transition-all duration-200 cursor-pointer ${
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
                </Card>
              </div>

              {/* 2. Modo de Color, Primario y Fondo */}
              <div data-tour="tour-colors">
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
                        onClick={() => {
                          setTheme({
                            ...theme,
                            themeMode: "light",
                            backgroundColor: "#f4f2fb",
                          });
                          setHasUnsavedChanges(true);
                        }}
                        className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold transition cursor-pointer ${
                          theme.themeMode === "light"
                            ? "bg-primary text-white shadow-xs"
                            : "text-slate-600 dark:text-slate-400"
                        }`}
                      >
                        <Sun className="h-3.5 w-3.5" /> Claro
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setTheme({
                            ...theme,
                            themeMode: "dark",
                            backgroundColor: "#090d16",
                          });
                          setHasUnsavedChanges(true);
                        }}
                        className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold transition cursor-pointer ${
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
                          onChange={(e) => {
                            setTheme({ ...theme, primaryColor: e.target.value });
                            setHasUnsavedChanges(true);
                          }}
                          className="h-9 w-12 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer p-0.5"
                        />
                        <input
                          type="text"
                          value={theme.primaryColor}
                          onChange={(e) => {
                            setTheme({ ...theme, primaryColor: e.target.value });
                            setHasUnsavedChanges(true);
                          }}
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
                          onChange={(e) => {
                            setTheme({ ...theme, backgroundColor: e.target.value });
                            setHasUnsavedChanges(true);
                          }}
                          className="h-9 w-12 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer p-0.5"
                        />
                        <input
                          type="text"
                          value={theme.backgroundColor}
                          onChange={(e) => {
                            setTheme({ ...theme, backgroundColor: e.target.value });
                            setHasUnsavedChanges(true);
                          }}
                          className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-mono"
                        />
                      </div>
                    </div>
                  </div>
                </Card>
              </div>

              {/* 3. Distribución de Fotos & Layout de la Página */}
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
                        onClick={() => {
                          setTheme({ ...theme, layoutStyle: l.id as LayoutStyle });
                          setHasUnsavedChanges(true);
                        }}
                        className={`flex flex-col items-start rounded-2xl border p-3.5 text-left transition cursor-pointer ${
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

              {/* 4. Tipografías de Google Fonts */}
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
                        className={`rounded-lg px-2.5 py-1 font-semibold capitalize transition cursor-pointer ${
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
                        onClick={() => {
                          setTheme({ ...theme, fontFamily: f.id });
                          setHasUnsavedChanges(true);
                        }}
                        className={`flex flex-col items-start rounded-2xl border p-3 text-left transition cursor-pointer ${
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
                {/* Wizard navigation from Tab 1 to Tab 2 */}
                <div className="flex items-center justify-between border-t border-slate-100 dark:border-white/5 pt-4">
                  <span className="text-xs font-medium text-slate-400">Paso 1 de 4: Estilos y Colores</span>
                  <button
                    type="button"
                    onClick={() => setActiveTab("fotos")}
                    className="inline-flex items-center gap-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-5 py-2.5 text-xs font-bold hover:bg-slate-800 dark:hover:bg-slate-100 transition shadow-xs cursor-pointer"
                  >
                    <span>Continuar a Fotos & Portada</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </Card>
            </div>
          )}

          {/* TAB 2: FOTOS & PORTADA */}
          {activeTab === "fotos" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Galería de Fotos de Trabajos del Local */}
              <div data-tour="tour-photos">
                <Card className="space-y-4 border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-3">
                    <div className="flex items-center gap-2">
                      <ImageIcon className="h-5 w-5 text-emerald-500" />
                      <div>
                        <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                          Galería de Fotos de Trabajos y Local
                        </h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Fotos que verán tus clientes al entrar a reservar (cortes, coloración, salón, etc.).
                        </p>
                      </div>
                    </div>
                    <span className="rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-2 py-0.5 text-[9px] font-black uppercase">
                      {(theme.galleryUrls || []).length} Fotos
                    </span>
                  </div>

                  {/* Direct File Upload Dropzone (Invisible background compression) */}
                  <label className="relative flex flex-col items-center justify-center p-6 border-2 border-dashed border-primary/40 rounded-2xl bg-primary/5 hover:bg-primary/10 transition cursor-pointer group text-center">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      disabled={isUploadingPhoto}
                      onChange={(e) => handleFileUpload(e.target.files)}
                      className="sr-only"
                    />
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white dark:bg-slate-900 text-primary shadow-md group-hover:scale-110 transition-transform">
                      {isUploadingPhoto ? (
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      ) : (
                        <Upload className="h-6 w-6 text-primary" />
                      )}
                    </div>
                    <span className="mt-3 text-xs font-bold text-slate-900 dark:text-white">
                      {isUploadingPhoto ? "Subiendo fotos a tu galería..." : "Subir Fotos del Local o Trabajos"}
                    </span>
                    <span className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 max-w-sm">
                      Hacé clic acá o arrastrá fotos desde tu celular o computadora para agregarlas directamente a tu página.
                    </span>
                  </label>

                  {/* 1-Click Sample Photos */}
                  <div className="rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/40 p-3 space-y-2">
                    <span className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">
                      O elegí fotos profesionales sugeridas en 1 clic:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {PRESET_SAMPLE_PHOTOS.map((sample, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleAddPresetPhoto(sample.url)}
                          className="inline-flex items-center gap-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-1 text-[11px] font-medium text-slate-700 dark:text-slate-300 hover:border-primary hover:text-primary transition shadow-2xs cursor-pointer"
                        >
                          <Plus className="h-3 w-3 text-primary" />
                          <span>{sample.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Optional URL Adder */}
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={newPhotoUrl}
                      onChange={(e) => setNewPhotoUrl(e.target.value)}
                      placeholder="O pegar enlace directo de imagen (https://...)"
                      className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2 text-xs outline-none focus:border-primary"
                    />
                    <button
                      type="button"
                      onClick={handleAddPhoto}
                      className="inline-flex items-center gap-1 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 px-3.5 py-2 text-xs font-bold cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5" /> Agregar
                    </button>
                  </div>

                  {/* Photos Grid */}
                  <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4 pt-1">
                    {(theme.galleryUrls || []).map((url, idx) => (
                      <div key={idx} className="group relative h-24 overflow-hidden rounded-xl bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={url} alt={`Foto ${idx}`} className="h-full w-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemovePhoto(idx)}
                          className="absolute top-1 right-1 rounded-full bg-rose-600/90 p-1 text-white opacity-0 group-hover:opacity-100 transition cursor-pointer"
                          title="Eliminar foto"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

              {/* Portada & Logo */}
              <Card className="space-y-4 border border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-3">
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      Foto de Portada (Banner) y Logo Oficial
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Subí tu logo y banner principal para que tu web de reservas impacte a tus clientes.
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  {/* Banner Upload Box */}
                  <div className="space-y-2.5 rounded-2xl border border-slate-200 dark:border-slate-700/80 p-3.5 bg-slate-50/50 dark:bg-slate-900/40">
                    <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                      Foto de Portada (Banner Panorámico)
                    </label>

                    {theme.bannerUrl && (
                      <div className="relative h-24 w-full overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={theme.bannerUrl} alt="Portada" className="h-full w-full object-cover" />
                      </div>
                    )}

                    <label className="flex items-center justify-center gap-2 rounded-xl bg-primary text-white px-3 py-2 text-xs font-bold hover:brightness-110 transition cursor-pointer shadow-xs">
                      <input
                        type="file"
                        accept="image/*"
                        disabled={isUploadingBanner}
                        onChange={(e) => handleBannerUpload(e.target.files?.[0] || null)}
                        className="sr-only"
                      />
                      {isUploadingBanner ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Upload className="h-4 w-4" />
                      )}
                      <span>{isUploadingBanner ? "Subiendo portada..." : "Subir Portada desde tu equipo"}</span>
                    </label>

                    <input
                      type="url"
                      value={theme.bannerUrl}
                      onChange={(e) => {
                        setTheme({ ...theme, bannerUrl: e.target.value });
                        setHasUnsavedChanges(true);
                      }}
                      placeholder="O pegar URL de portada..."
                      className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-1.5 text-[11px] outline-none"
                    />
                  </div>

                  {/* Logo Upload Box */}
                  <div className="space-y-2.5 rounded-2xl border border-slate-200 dark:border-slate-700/80 p-3.5 bg-slate-50/50 dark:bg-slate-900/40">
                    <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                      Logo Oficial o Foto de Perfil
                    </label>

                    <div className="flex items-center gap-3">
                      {theme.logoUrl ? (
                        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-full border-2 border-primary">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={theme.logoUrl} alt="Logo" className="h-full w-full object-cover" />
                        </div>
                      ) : (
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-800 text-xs font-bold text-slate-500">
                          Sin Logo
                        </div>
                      )}

                      <div className="flex-1 space-y-2">
                        <label className="flex items-center justify-center gap-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-3 py-2 text-xs font-bold hover:opacity-90 transition cursor-pointer shadow-xs">
                          <input
                            type="file"
                            accept="image/*"
                            disabled={isUploadingLogo}
                            onChange={(e) => handleLogoUpload(e.target.files?.[0] || null)}
                            className="sr-only"
                          />
                          {isUploadingLogo ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Upload className="h-4 w-4" />
                          )}
                          <span>{isUploadingLogo ? "Subiendo..." : "Subir Logo"}</span>
                        </label>
                      </div>
                    </div>

                    <input
                      type="url"
                      value={theme.logoUrl}
                      onChange={(e) => {
                        setTheme({ ...theme, logoUrl: e.target.value });
                        setHasUnsavedChanges(true);
                      }}
                      placeholder="O pegar URL de logo..."
                      className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-1.5 text-[11px] outline-none"
                    />
                  </div>
                </div>

                {/* Preset Banners */}
                <div className="rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/40 p-3 space-y-2">
                  <span className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    O elegí una portada prediseñada cinematográfica:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {PRESET_BANNERS.map((b, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectPresetBanner(b.url)}
                        className="inline-flex items-center gap-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-1 text-[11px] font-medium text-slate-700 dark:text-slate-300 hover:border-primary hover:text-primary transition shadow-2xs cursor-pointer"
                      >
                        <Sparkles className="h-3 w-3 text-amber-500" />
                        <span>{b.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Wizard navigation from Tab 2 to Tab 3 */}
                <div className="flex items-center justify-between border-t border-slate-100 dark:border-white/5 pt-4">
                  <button
                    type="button"
                    onClick={() => setActiveTab("estilos")}
                    className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                  >
                    Volver a Estilos
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("botones")}
                    className="inline-flex items-center gap-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-5 py-2.5 text-xs font-bold hover:bg-slate-800 dark:hover:bg-slate-100 transition shadow-xs cursor-pointer"
                  >
                    <span>Continuar a Botones & Links Bio</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </Card>
            </div>
          )}

          {/* TAB 3: BOTONES & LINK-IN-BIO */}
          {activeTab === "botones" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Botones & Enlaces de Biografía (Estilo Linktree / Bento) */}
              <div data-tour="tour-buttons">
                <Card className="space-y-4 border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-3">
                    <div className="flex items-center gap-2">
                      <LinkIcon className="h-5 w-5 text-emerald-500" />
                      <div>
                        <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                          Botones & Enlaces de Biografía (Estilo Linktree)
                        </h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Accesos directos para que tus clientes pidan Uber, abran Waze o chateen por WhatsApp.
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
                          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-1.5 text-[11px] font-medium text-slate-700 dark:text-slate-300 hover:border-primary hover:text-primary transition shadow-2xs cursor-pointer"
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
                                className={`rounded-full px-2 py-0.5 text-[10px] font-bold transition cursor-pointer ${
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
                                className="p-1 text-slate-400 hover:text-rose-500 transition cursor-pointer"
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
                      className="w-full rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 py-3 text-center text-xs font-bold text-slate-600 dark:text-slate-400 hover:border-primary hover:text-primary transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="h-4 w-4" /> Agregar otro botón personalizado
                    </button>
                  </div>
                </Card>
              </div>

              {/* Estilo y Personalización 100% a Medida (Button Styler) */}
              <Card className="space-y-4 border border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-3">
                  <div className="flex items-center gap-2">
                    <MousePointerClick className="h-5 w-5 text-primary" />
                    <div>
                      <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                        Estilo y Personalización a Medida (Botones & Estructura)
                      </h2>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Ajustá colores, bordes, alineación, mayúsculas y orden de bloques.
                      </p>
                    </div>
                  </div>
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
                        name: "Enlaces y Redes Primero",
                        desc: "Tus redes y accesos directos arriba, los turnos abajo.",
                      },
                      {
                        id: "links-only",
                        name: "Solo Enlaces y Redes",
                        desc: "Modo tarjeta digital con botón compacto de turnos.",
                      },
                    ].map((item) => {
                      const active = theme.sectionOrder === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            setTheme({ ...theme, sectionOrder: item.id as SectionOrder });
                            setHasUnsavedChanges(true);
                          }}
                          className={`flex flex-col items-start rounded-xl border p-2.5 text-left transition cursor-pointer ${
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
                      Forma del Logo o Foto de Perfil
                    </label>
                    <select
                      value={theme.avatarShape}
                      onChange={(e) => {
                        setTheme({ ...theme, avatarShape: e.target.value as AvatarShape });
                        setHasUnsavedChanges(true);
                      }}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs"
                    >
                      <option value="circle">Circular (Clásico)</option>
                      <option value="rounded">Cuadrado con Bordes Suaves</option>
                      <option value="square">Cuadrado Recto</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Borde y Resplandor del Logo
                    </label>
                    <select
                      value={theme.avatarBorder}
                      onChange={(e) => {
                        setTheme({ ...theme, avatarBorder: e.target.value as AvatarBorder });
                        setHasUnsavedChanges(true);
                      }}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs"
                    >
                      <option value="none">Sin borde</option>
                      <option value="subtle">Borde Fino Blanco</option>
                      <option value="thick">Borde Grueso Marcado</option>
                      <option value="glow">Aura Luminosa (Resplandor)</option>
                    </select>
                  </div>
                </div>

                {/* Acabado Visual de los Botones (Visuales, Sin Jerga, 8 Opciones Interactivas) */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Acabado Visual de los Botones
                    </label>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      8 Estilos Listos
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {[
                      {
                        id: "solid",
                        name: "Sólido",
                        previewStyle: {
                          backgroundColor: theme.primaryColor,
                          color: "#ffffff",
                        },
                        previewClass: "shadow-xs",
                      },
                      {
                        id: "outline",
                        name: "Delineado",
                        previewStyle: {
                          backgroundColor: "transparent",
                          color: theme.primaryColor,
                          borderColor: theme.primaryColor,
                          borderWidth: "2px",
                          borderStyle: "solid",
                        },
                        previewClass: "",
                      },
                      {
                        id: "glass",
                        name: "Cristal",
                        previewStyle: {
                          backgroundColor: isDark ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.7)",
                          backdropFilter: "blur(8px)",
                          borderColor: isDark ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.9)",
                          borderWidth: "1px",
                          borderStyle: "solid",
                          color: isDark ? "#ffffff" : "#0f172a",
                        },
                        previewClass: "shadow-xs",
                      },
                      {
                        id: "neubrutalism",
                        name: "Sombra Retro 3D",
                        previewStyle: {
                          backgroundColor: theme.primaryColor,
                          color: "#ffffff",
                          boxShadow: "3px 3px 0px 0px #0f172a",
                          borderColor: "#0f172a",
                          borderWidth: "2px",
                          borderStyle: "solid",
                        },
                        previewClass: "font-black",
                      },
                      {
                        id: "glow",
                        name: "Glow Neón",
                        previewStyle: {
                          backgroundColor: theme.primaryColor,
                          color: "#ffffff",
                          boxShadow: `0 0 16px ${theme.primaryColor}88`,
                        },
                        previewClass: "ring-2 ring-primary/40",
                      },
                      {
                        id: "gradient",
                        name: "Degradado",
                        previewStyle: {
                          backgroundImage: `linear-gradient(135deg, ${theme.primaryColor}, #6366f1)`,
                          color: "#ffffff",
                        },
                        previewClass: "shadow-md shadow-primary/20",
                      },
                      {
                        id: "double-border",
                        name: "Borde Doble",
                        previewStyle: {
                          backgroundColor: theme.primaryColor,
                          color: "#ffffff",
                          outline: `2px solid ${theme.primaryColor}`,
                          outlineOffset: "2px",
                        },
                        previewClass: "",
                      },
                      {
                        id: "soft-elevated",
                        name: "Flotante Suave",
                        previewStyle: {
                          backgroundColor: theme.primaryColor,
                          color: "#ffffff",
                          boxShadow: "0 10px 20px -3px rgba(0, 0, 0, 0.2)",
                        },
                        previewClass: "",
                      },
                    ].map((s) => {
                      const active = theme.buttonStyle === s.id;
                      return (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => {
                            setTheme({ ...theme, buttonStyle: s.id as ButtonStyleVariant });
                            setHasUnsavedChanges(true);
                          }}
                          className={`group relative flex flex-col items-center justify-between gap-2.5 rounded-2xl border p-3 text-center transition cursor-pointer ${
                            active
                              ? "border-primary bg-primary/10 ring-2 ring-primary/30 shadow-md scale-102"
                              : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-primary/50 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                          }`}
                        >
                          <div className="w-full flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                              {s.name}
                            </span>
                            {active && <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />}
                          </div>

                          {/* Interactive preview miniature button */}
                          <div
                            style={s.previewStyle}
                            className={`w-full py-2 px-2 rounded-xl text-[11px] font-bold transition-transform group-hover:scale-105 active:scale-95 flex items-center justify-center truncate ${s.previewClass}`}
                          >
                            <span>Reservar</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Colores Personalizados de Botones */}
                <div className="rounded-2xl border border-slate-200 dark:border-slate-700/80 p-3.5 space-y-3 bg-slate-50/60 dark:bg-slate-900/40">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      Colores Personalizados de Botones
                    </span>
                    {(theme.buttonCustomBg || theme.buttonCustomText || theme.buttonCustomBorder) && (
                      <button
                        type="button"
                        onClick={() => {
                          setTheme({
                            ...theme,
                            buttonCustomBg: "",
                            buttonCustomText: "",
                            buttonCustomBorder: "",
                          });
                          setHasUnsavedChanges(true);
                        }}
                        className="text-[10px] text-primary hover:underline font-bold cursor-pointer"
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
                          onChange={(e) => {
                            setTheme({ ...theme, buttonCustomBg: e.target.value });
                            setHasUnsavedChanges(true);
                          }}
                          className="h-8 w-10 rounded border border-slate-200 dark:border-slate-700 cursor-pointer p-0.5"
                        />
                        <input
                          type="text"
                          placeholder={theme.primaryColor}
                          value={theme.buttonCustomBg}
                          onChange={(e) => {
                            setTheme({ ...theme, buttonCustomBg: e.target.value });
                            setHasUnsavedChanges(true);
                          }}
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
                          onChange={(e) => {
                            setTheme({ ...theme, buttonCustomText: e.target.value });
                            setHasUnsavedChanges(true);
                          }}
                          className="h-8 w-10 rounded border border-slate-200 dark:border-slate-700 cursor-pointer p-0.5"
                        />
                        <input
                          type="text"
                          placeholder="#ffffff"
                          value={theme.buttonCustomText}
                          onChange={(e) => {
                            setTheme({ ...theme, buttonCustomText: e.target.value });
                            setHasUnsavedChanges(true);
                          }}
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
                          onChange={(e) => {
                            setTheme({ ...theme, buttonCustomBorder: e.target.value });
                            setHasUnsavedChanges(true);
                          }}
                          className="h-8 w-10 rounded border border-slate-200 dark:border-slate-700 cursor-pointer p-0.5"
                        />
                        <input
                          type="text"
                          placeholder={theme.primaryColor}
                          value={theme.buttonCustomBorder}
                          onChange={(e) => {
                            setTheme({ ...theme, buttonCustomBorder: e.target.value });
                            setHasUnsavedChanges(true);
                          }}
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
                          onClick={() => {
                            setTheme({ ...theme, buttonBorderWidth: bw });
                            setHasUnsavedChanges(true);
                          }}
                          className={`rounded-lg border py-1 px-1.5 text-xs font-mono font-semibold transition cursor-pointer ${
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
                          onClick={() => {
                            setTheme({ ...theme, buttonHeight: h.id as ButtonHeight });
                            setHasUnsavedChanges(true);
                          }}
                          className={`rounded-lg border py-1 px-1.5 text-[11px] font-semibold transition cursor-pointer ${
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
                          onClick={() => {
                            setTheme({ ...theme, buttonAlignment: a.id as ButtonAlignment });
                            setHasUnsavedChanges(true);
                          }}
                          className={`rounded-lg border py-1 px-1.5 text-[11px] font-semibold transition cursor-pointer ${
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
                      Formato de Texto
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
                          onClick={() => {
                            setTheme({ ...theme, buttonTextTransform: t.id as ButtonTextTransform });
                            setHasUnsavedChanges(true);
                          }}
                          className={`rounded-lg border py-1 px-1.5 text-[11px] font-semibold transition cursor-pointer ${
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
                      onChange={(e) => {
                        setTheme({ ...theme, buttonShadow: e.target.value as ButtonShadowType });
                        setHasUnsavedChanges(true);
                      }}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs"
                    >
                      <option value="none">Sin sombra (Plano minimal)</option>
                      <option value="soft">Sombra Suave (Elegante)</option>
                      <option value="medium">Sombra Media (Elevación 3D)</option>
                      <option value="hard">Sombra Dura Retro (Estilo Urbano)</option>
                      <option value="glow">Resplandor Difuso (Glow Neón)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Forma y Bordes de los Botones
                    </label>
                    <select
                      value={theme.buttonRadius}
                      onChange={(e) => {
                        setTheme({ ...theme, buttonRadius: e.target.value as ButtonRadius });
                        setHasUnsavedChanges(true);
                      }}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs"
                    >
                      <option value="full">Ovalado / Píldora suave</option>
                      <option value="lg">Esquinas redondeadas modernas</option>
                      <option value="md">Redondez sutil clásica</option>
                      <option value="none">Bordes rectos minimalistas</option>
                    </select>
                  </div>
                </div>

                {/* Tamaño de Texto, Grosor & Tipografía */}
                <div className="grid gap-3 sm:grid-cols-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Tamaño de Texto
                    </label>
                    <div className="grid grid-cols-3 gap-1">
                      {[
                        { id: "sm", label: "Chico" },
                        { id: "base", label: "Medio" },
                        { id: "lg", label: "Grande" },
                      ].map((sz) => (
                        <button
                          key={sz.id}
                          type="button"
                          onClick={() => {
                            setTheme({ ...theme, buttonTextSize: sz.id as ButtonTextSizeType });
                            setHasUnsavedChanges(true);
                          }}
                          className={`rounded-lg border py-1 px-1 text-[11px] font-semibold transition cursor-pointer ${
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
                      Grosor de la Letra
                    </label>
                    <select
                      value={theme.buttonFontWeight}
                      onChange={(e) => {
                        setTheme({ ...theme, buttonFontWeight: e.target.value as ButtonFontWeight });
                        setHasUnsavedChanges(true);
                      }}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs"
                    >
                      <option value="normal">Fina</option>
                      <option value="medium">Normal</option>
                      <option value="semibold">Semi-Negrita</option>
                      <option value="bold">Negrita</option>
                      <option value="black">Muy Gruesa</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Letra de los Botones
                    </label>
                    <select
                      value={theme.buttonFontFamily || "inherit"}
                      onChange={(e) => {
                        setTheme({ ...theme, buttonFontFamily: e.target.value });
                        setHasUnsavedChanges(true);
                      }}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs"
                    >
                      <option value="inherit">Misma letra de la página</option>
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
                {/* Wizard navigation from Tab 3 to Tab 4 */}
                <div className="flex items-center justify-between border-t border-slate-100 dark:border-white/5 pt-4">
                  <button
                    type="button"
                    onClick={() => setActiveTab("fotos")}
                    className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                  >
                    Volver a Fotos
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("textos")}
                    className="inline-flex items-center gap-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-5 py-2.5 text-xs font-bold hover:bg-slate-800 dark:hover:bg-slate-100 transition shadow-xs cursor-pointer"
                  >
                    <span>Continuar a Textos & Políticas</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </Card>
            </div>
          )}

          {/* TAB 4: TEXTOS & POLÍTICAS */}
          {activeTab === "textos" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Cabecera, Portada, Bio & Redes */}
              <Card className="space-y-4 border border-slate-200 dark:border-slate-800">
                <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Textos Comerciales, Bio & Redes
                </h2>

                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Slogan</label>
                      <input
                        type="text"
                        value={theme.slogan}
                        onChange={(e) => {
                          setTheme({ ...theme, slogan: e.target.value });
                          setHasUnsavedChanges(true);
                        }}
                        placeholder="Ej: La mejor barbería de Asunción"
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
                        onChange={(e) => {
                          setTheme({ ...theme, bookingNotice: e.target.value });
                          setHasUnsavedChanges(true);
                        }}
                        placeholder="Ej: Tolerar 10 min de tolerancia"
                        className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs outline-none focus:border-primary"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Bio / Descripción del Local</label>
                    <textarea
                      rows={2}
                      value={theme.bio}
                      onChange={(e) => {
                        setTheme({ ...theme, bio: e.target.value });
                        setHasUnsavedChanges(true);
                      }}
                      placeholder="Contale a tus clientes sobre tu experiencia y especialidades..."
                      className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs outline-none focus:border-primary resize-none"
                    />
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Instagram</label>
                      <input
                        type="text"
                        value={theme.instagram}
                        onChange={(e) => {
                          setTheme({ ...theme, instagram: e.target.value });
                          setHasUnsavedChanges(true);
                        }}
                        placeholder="@tunegocio"
                        className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs outline-none focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">WhatsApp de Atención</label>
                      <input
                        type="text"
                        value={theme.whatsapp}
                        onChange={(e) => {
                          setTheme({ ...theme, whatsapp: e.target.value });
                          setHasUnsavedChanges(true);
                        }}
                        placeholder="0981 123 456"
                        className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs outline-none focus:border-primary"
                      />
                    </div>
                  </div>
                </div>
              </Card>

              {/* Efectos Ambientales de Fondo y Jerarquía de Textos */}
              <Card className="space-y-4 border border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-amber-500" />
                  <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    Efectos Ambientales de Fondo y Jerarquía
                  </h2>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Personalizá el tamaño de los títulos y texturas de iluminación para tu web.
                </p>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Efecto Ambiental de Fondo
                    </label>
                    <select
                      value={theme.backgroundEffect || "none"}
                      onChange={(e) => {
                        setTheme({ ...theme, backgroundEffect: e.target.value as BackgroundEffectType });
                        setHasUnsavedChanges(true);
                      }}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs"
                    >
                      <option value="none">Color Plano / Limpio</option>
                      <option value="mesh">Iluminación Difusa Suave</option>
                      <option value="dots">Puntos Finos Sutiles</option>
                      <option value="grid">Líneas Cuadriculadas</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Tamaño del Nombre de Tu Negocio
                    </label>
                    <select
                      value={theme.titleSize || "lg"}
                      onChange={(e) => {
                        setTheme({ ...theme, titleSize: e.target.value as TitleSizeType });
                        setHasUnsavedChanges(true);
                      }}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs"
                    >
                      <option value="sm">Compacto</option>
                      <option value="base">Equilibrado</option>
                      <option value="lg">Grande y Destacado</option>
                      <option value="xl">Imponente y Elegante</option>
                    </select>
                  </div>
                </div>

                {/* Wizard navigation in Tab 4 */}
                <div className="flex items-center justify-between border-t border-slate-100 dark:border-white/5 pt-4">
                  <button
                    type="button"
                    onClick={() => setActiveTab("botones")}
                    className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                  >
                    Volver a Botones
                  </button>
                  <button
                    type="button"
                    disabled={isSaving}
                    onClick={() => handleSave()}
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 px-6 py-2.5 text-xs font-black text-white shadow-lg shadow-emerald-600/30 transition cursor-pointer"
                  >
                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    <span>{isSaving ? "Guardando..." : "Guardar y Publicar mi Página"}</span>
                  </button>
                </div>
              </Card>
            </div>
          )}
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

      {/* Sticky Bottom Save Bar (Ensures user NEVER forgets to save their edits) */}
      {hasUnsavedChanges && (
        <div className="fixed bottom-6 inset-x-0 z-40 max-w-xl mx-auto px-4 animate-in slide-in-from-bottom duration-300">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3.5 rounded-3xl border-2 border-emerald-500/40 bg-slate-950/95 text-white p-4 sm:px-6 shadow-2xl backdrop-blur-xl ring-2 ring-emerald-500/20">
            <div className="flex items-center gap-3">
              <span className="relative flex h-3.5 w-3.5 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500"></span>
              </span>
              <div>
                <span className="text-xs sm:text-sm font-black text-white block leading-tight">
                  Tenés cambios sin guardar en tu diseño
                </span>
                <span className="text-[11px] text-slate-300">
                  Tus clientes verán los cambios solo después de guardarlos.
                </span>
              </div>
            </div>
            <button
              type="button"
              data-tour="tour-save-sticky"
              disabled={isSaving}
              onClick={() => handleSave()}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 px-6 py-3 text-xs sm:text-sm font-black text-white shadow-xl shadow-emerald-500/30 transition cursor-pointer"
            >
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              <span>{isSaving ? "Guardando..." : "Guardar Ahora"}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
