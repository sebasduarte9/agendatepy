"use client";

import { memo, useCallback, useDeferredValue, useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Check,
  Smartphone,
  ExternalLink,
  Save,
  Image as ImageIcon,
  Clock,
  Type,
  Sun,
  Moon,
  Loader2,
  Store,
  Calendar,
  ShoppingBag,
  ArrowRight,
  Car,
  FileText,
  Gift,
  Phone,
  Globe,
  Star,
  Sliders,
  Palette,
  Search,
  AlertCircle,
  Copy,
  History,
  Monitor,
} from "lucide-react";
import { compressClientImage } from "@/lib/media-compression";
import { useDashboardStore } from "@/store/useDashboardStore";
import Card from "@/components/dashboard/ui/Card";
import CustomSelect from "@/components/dashboard/ui/CustomSelect";
import Modal from "@/components/dashboard/ui/Modal";
import ColorPicker from "@/components/dashboard/ui/ColorPicker";
import ThemeHistoryModal from "@/components/dashboard/apariencia/ThemeHistoryModal";
import ImageCropModal from "@/components/dashboard/apariencia/ImageCropModal";
import ContrastCheck from "@/components/dashboard/apariencia/ContrastCheck";
import SeoSettings from "@/components/dashboard/apariencia/SeoSettings";
import DesktopPreview from "@/components/dashboard/apariencia/DesktopPreview";
import FotosTab from "@/components/dashboard/apariencia/FotosTab";
import BotonesTab from "@/components/dashboard/apariencia/BotonesTab";
import TextosTab from "@/components/dashboard/apariencia/TextosTab";
import { BackgroundPicker, LayoutPicker, PresetPicker } from "@/components/dashboard/apariencia/StylePickers";
import BackgroundEffect, { resolveBackgroundEffect } from "@/components/booking/BackgroundEffect";
import {
  GoogleMapsOfficialIcon,
  InstagramOfficialIcon,
  WhatsAppOfficialIcon,
} from "@/components/dashboard/apariencia/BrandIcons";
import {
  THEME_PRESETS,
  DEFAULT_THEME,
  GOOGLE_FONTS,
  googleFontHref,
  fontStack,
  getCustomButtonClasses,
  getCustomButtonStyles,
  type ThemePreset,
  type ThemeSettings,
} from "@/lib/theme";
import { formatGs } from "@/lib/dashboard-dates";
import { tenantHost } from "@/lib/tenant/public-url";

// Official Branded SVG Icons
function renderCustomLinkIcon(iconName: string, className = "h-4 w-4") {
  switch (iconName) {
    case "whatsapp":
      return <WhatsAppOfficialIcon className={className} />;
    case "maps":
      return <GoogleMapsOfficialIcon className={className} />;
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
      return <InstagramOfficialIcon className={className} />;
    case "globe":
    default:
      return <Globe className={className} />;
  }
}

// CodePen yyONbPX: appearance base-select Style Color Picker Component

// Background effects with real animated visual previews
async function fetchSavedTheme(slug: string): Promise<ThemeSettings> {
  const res = await fetch(`/api/tenant/theme?slug=${encodeURIComponent(slug)}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  return { ...DEFAULT_THEME, ...(data.theme || {}) };
}

export default function AparienciaPage() {
  const { business, services, products, pushToast } = useDashboardStore();
  // Dashboard accent (set in Configuración). The theme color below belongs only to the public link.
  const systemColor = business.primaryColor || "#FF4F2B";
  const isTourOpen = useDashboardStore((s) => s.isTourOpen);

  const router = useRouter();
  const [theme, setTheme] = useState<ThemeSettings>(DEFAULT_THEME);
  // Snapshot of the last theme persisted on the server; "dirty" is derived by comparing against it
  const [savedSnapshot, setSavedSnapshot] = useState("");
  const [loadState, setLoadState] = useState<"loading" | "ready" | "error">("loading");
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  // Internal link the user tried to open while having unsaved changes
  const [pendingHref, setPendingHref] = useState<string | null>(null);
  const [copiedPublicUrl, setCopiedPublicUrl] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<"phone" | "desktop">("phone");
  // Below lg the preview opens as a full-screen layer instead of living at the bottom of the page
  const [isMobilePreviewOpen, setIsMobilePreviewOpen] = useState(false);
  useEffect(() => {
    if (!isMobilePreviewOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setIsMobilePreviewOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [isMobilePreviewOpen]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  // Image waiting to be framed before upload
  const [cropRequest, setCropRequest] = useState<{ file: File; kind: "logo" | "banner" | "share" } | null>(null);
  const [isUploadingShare, setIsUploadingShare] = useState(false);

  const hasUnsavedChanges = loadState === "ready" && JSON.stringify(theme) !== savedSnapshot;

  // Tabs: 1. Estilos, 2. Portada & Fotos, 3. Botones, 4. Textos
  const [activeTab, setActiveTab] = useState<"estilos" | "fotos" | "botones" | "textos">("estilos");
  const [buttonSubTab, setButtonSubTab] = useState<"links" | "styles">("links");

  function handleTabClick(newTab: "estilos" | "fotos" | "botones" | "textos") {
    if (activeTab === newTab) return;
    setActiveTab(newTab);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("agendate-user-selected-tab", { detail: { tab: newTab } }));
    }
  }

  // Listen to tab switch event from GuidedTour
  useEffect(() => {
    function handleTourTabSwitch(e: Event) {
      const customEvt = e as CustomEvent<{
        tab: "estilos" | "fotos" | "botones" | "textos";
        subTab?: "links" | "styles";
      }>;
      if (customEvt.detail?.tab) {
        setActiveTab(customEvt.detail.tab);
        if (customEvt.detail.tab === "botones" && customEvt.detail.subTab) {
          setButtonSubTab(customEvt.detail.subTab);
        }
      }
    }
    window.addEventListener("agendate-switch-tab", handleTourTabSwitch);
    return () => window.removeEventListener("agendate-switch-tab", handleTourTabSwitch);
  }, []);

  // Browser beforeunload protection if user tries to close tab
  useEffect(() => {
    function handleBeforeUnload(e: BeforeUnloadEvent) {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = "";
      }
    }
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Typography state
  const [fontSearch, setFontSearch] = useState("");
  const [fontCategory, setFontCategory] = useState<string>("all");

  // Phone test mode: auto | light | dark
  const [phoneThemeMode, setPhoneThemeMode] = useState<"auto" | "light" | "dark">("auto");

  // Live clock on phone status bar
  const [liveTime, setLiveTime] = useState("09:41");
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setLiveTime(now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false }));
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  // Upload loaders
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);

  // Load saved theme. Until it arrives (or if it fails) saving is blocked,
  // so the defaults can never overwrite the real design by accident.
  const [loadAttempt, setLoadAttempt] = useState(0);
  useEffect(() => {
    let cancelled = false;
    fetchSavedTheme(business.slug || "barberia")
      .then((loaded) => {
        if (cancelled) return;
        setTheme(loaded);
        setSavedSnapshot(JSON.stringify(loaded));
        setLoadState("ready");
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("No se pudo cargar el tema desde la base de datos:", err);
        setLoadState("error");
      });
    return () => {
      cancelled = true;
    };
  }, [business.slug, loadAttempt]);

  const applyPreset = useCallback((presetKey: ThemePreset) => {
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
      buttonStyle: p.buttonStyle ?? current.buttonStyle,
      buttonShadow: p.buttonShadow ?? current.buttonShadow,
      backgroundEffect: p.backgroundEffect ?? current.backgroundEffect,
      // Custom button colors would fight the new palette
      buttonCustomBg: "",
      buttonCustomText: "",
      buttonCustomBorder: "",
      // The preset photo is only a fallback: never replace the business's own cover
      bannerUrl: current.bannerUrl || p.bannerUrl || "",
    }));
  }, []);

  const handleBackgroundChange = useCallback(
    (effect: ThemeSettings["backgroundEffect"]) => setTheme((prev) => ({ ...prev, backgroundEffect: effect })),
    []
  );
  const handleLayoutChange = useCallback(
    (layout: ThemeSettings["layoutStyle"]) => setTheme((prev) => ({ ...prev, layoutStyle: layout })),
    []
  );

  async function handleSave(e?: React.FormEvent): Promise<boolean> {
    if (e) e.preventDefault();
    if (loadState !== "ready" || isSaving) return false;
    if (!hasUnsavedChanges) return true;

    // Remember exactly what was sent: edits made while the request is in flight stay pending
    const sentSnapshot = JSON.stringify(theme);
    setIsSaving(true);

    try {
      const slug = business.slug || "barberia";
      const res = await fetch("/api/tenant/theme", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tenantSlug: slug, theme }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        throw new Error(data.message || data.error || "No se pudo guardar el diseño.");
      }

      // The link color only styles the public page; the dashboard keeps its own color (Configuración)
      setSavedSnapshot(sentSnapshot);

      setSavedSuccess(true);
      pushToast("success", "Diseño guardado. Tu página pública ya muestra los cambios.");
      setTimeout(() => setSavedSuccess(false), 2500);
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error de red al guardar";
      pushToast("error", msg);
      return false;
    } finally {
      setIsSaving(false);
    }
  }

  function handleDiscard() {
    if (!savedSnapshot) return;
    setTheme(JSON.parse(savedSnapshot) as ThemeSettings);
    pushToast("success", "Cambios descartados.");
  }

  // Keep the latest save handler reachable from global listeners
  const saveRef = useRef(handleSave);
  useEffect(() => {
    saveRef.current = handleSave;
  });

  // Cmd/Ctrl + S saves
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        saveRef.current();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // In-app navigation guard: intercept internal links while there are unsaved changes
  useEffect(() => {
    if (!hasUnsavedChanges) return;
    function handleClick(e: MouseEvent) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const anchor = (e.target as HTMLElement | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!anchor || anchor.target === "_blank" || anchor.hasAttribute("download")) return;
      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin || url.pathname === window.location.pathname) return;
      e.preventDefault();
      e.stopPropagation();
      setPendingHref(url.pathname + url.search + url.hash);
    }
    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, [hasUnsavedChanges]);

  async function handleSaveAndLeave() {
    const ok = await handleSave();
    if (ok && pendingHref) {
      const href = pendingHref;
      setPendingHref(null);
      router.push(href);
    }
  }

  function handleDiscardAndLeave() {
    const href = pendingHref;
    handleDiscard();
    setPendingHref(null);
    if (href) router.push(href);
  }

  async function handleCopyPublicUrl() {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}${publicBookingUrl}`);
      setCopiedPublicUrl(true);
      setTimeout(() => setCopiedPublicUrl(false), 2000);
    } catch {
      pushToast("error", "No se pudo copiar el enlace.");
    }
  }
  // Upload gallery photos
  async function handleFileUpload(files: FileList | File[] | null) {
    if (!files || files.length === 0) return;
    setIsUploadingPhoto(true);
    try {
      const newUrls: string[] = [];
      let failed = 0;
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
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
        } else {
          failed++;
        }
      }
      if (newUrls.length > 0) {
        setTheme((prev) => ({
          ...prev,
          galleryUrls: [...(prev.galleryUrls || []), ...newUrls],
        }));
        pushToast("success", `${newUrls.length} foto(s) agregada(s) con éxito`);
      }
      if (failed > 0) {
        pushToast("error", `${failed} foto(s) no se pudieron subir.`);
      }
    } catch (err) {
      console.error("Error al subir fotos:", err);
      pushToast("error", "No se pudo subir la foto");
    } finally {
      setIsUploadingPhoto(false);
    }
  }

  // Upload banner
  async function handleBannerUpload(file: File | null) {
    if (!file) return;
    setIsUploadingBanner(true);
    try {
      const compressed = await compressClientImage(file, 1600, 600, 0.85);
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dataUrl: compressed.dataUrl, filename: file.name }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.url) {
          setTheme((prev) => ({ ...prev, bannerUrl: data.url }));
          pushToast("success", "Portada actualizada con éxito");
        }
      } else {
        pushToast("error", "No se pudo subir la portada. Probá con otra imagen.");
      }
    } catch (err) {
      console.error("Error al subir portada:", err);
      pushToast("error", "No se pudo subir la portada");
    } finally {
      setIsUploadingBanner(false);
    }
  }

  // Upload logo
  async function handleLogoUpload(file: File | null) {
    if (!file) return;
    setIsUploadingLogo(true);
    try {
      const compressed = await compressClientImage(file, 600, 600, 0.85);
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dataUrl: compressed.dataUrl, filename: file.name }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.url) {
          setTheme((prev) => ({ ...prev, logoUrl: data.url }));
          pushToast("success", "Logo actualizado con éxito");
        }
      } else {
        pushToast("error", "No se pudo subir el logo. Probá con otra imagen.");
      }
    } catch (err) {
      console.error("Error al subir logo:", err);
      pushToast("error", "No se pudo subir el logo");
    } finally {
      setIsUploadingLogo(false);
    }
  }

  // Upload share image (link preview when the booking page is shared)
  async function handleShareImageUpload(file: File | null) {
    if (!file) return;
    setIsUploadingShare(true);
    try {
      const compressed = await compressClientImage(file, 1200, 630, 0.85);
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dataUrl: compressed.dataUrl, filename: file.name }),
      });
      const data = res.ok ? await res.json() : null;
      if (data?.url) {
        setTheme((prev) => ({ ...prev, shareImageUrl: data.url }));
      } else {
        pushToast("error", "No se pudo subir la imagen. Probá con otra.");
      }
    } catch (err) {
      console.error("Error al subir imagen para compartir:", err);
      pushToast("error", "No se pudo subir la imagen");
    } finally {
      setIsUploadingShare(false);
    }
  }

  function handleCropConfirm(cropped: File) {
    const request = cropRequest;
    setCropRequest(null);
    if (!request) return;
    if (request.kind === "logo") handleLogoUpload(cropped);
    else if (request.kind === "banner") handleBannerUpload(cropped);
    else handleShareImageUpload(cropped);
  }

  function handleRestoreVersion(restored: ThemeSettings) {
    setTheme({ ...DEFAULT_THEME, ...restored });
    pushToast("success", "Versión cargada. Revisala y tocá Guardar para publicarla.");
  }

  const isDarkFromTheme =
    theme.themeMode === "dark" ||
    theme.themePreset === "barber-dark" ||
    theme.themePreset === "obsidian-gold" ||
    theme.themePreset === "cyber-noir" ||
    theme.themePreset === "champagne-velvet" ||
    theme.themePreset === "tokyo-cyber" ||
    theme.themePreset === "sunset-bronze" ||
    theme.themePreset === "deep-forest" ||
    theme.themePreset === "ruby-luxury";


  // The preview renders a deferred copy of the theme: keystrokes paint first, the preview catches up right after
  const previewTheme = useDeferredValue(theme);
  const deferredPreviewIsDark =
    phoneThemeMode === "dark"
      ? true
      : phoneThemeMode === "light"
        ? false
        : previewTheme.themeMode === "dark" || isDarkFromTheme;

  const publicBookingUrl = `/${business.slug || "barberia"}/reservar`;

  const fontLabel = GOOGLE_FONTS.find((f) => f.id === theme.fontFamily)?.name ?? theme.fontFamily;

  type AppearanceTab = "estilos" | "fotos" | "botones" | "textos";
  const brandChecklist: { label: string; hint: string; done: boolean; tab: AppearanceTab }[] = [
    { label: "Logo", hint: "Subí el logo de tu negocio", done: Boolean(theme.logoUrl || business.logo), tab: "fotos" },
    { label: "Foto de portada", hint: "Una imagen de tu local o trabajo", done: Boolean(theme.bannerUrl), tab: "fotos" },
    {
      label: "Galería de trabajos",
      hint: "Al menos 3 fotos de resultados",
      done: (theme.galleryUrls || []).length >= 3,
      tab: "fotos",
    },
    { label: "Eslogan y descripción", hint: "Contá qué te hace distinto", done: Boolean(theme.slogan && theme.bio), tab: "textos" },
    { label: "WhatsApp e Instagram", hint: "Para que te contacten", done: Boolean(theme.whatsapp && theme.instagram), tab: "textos" },
    { label: "Estilo elegido", hint: "Elegí una paleta que te represente", done: theme.themePreset !== "default", tab: "estilos" },
  ];

  const filteredFonts = GOOGLE_FONTS.filter((f) => {
    const matchesCat = fontCategory === "all" ? true : f.category === fontCategory;
    const matchesSearch = fontSearch.trim()
      ? f.name.toLowerCase().includes(fontSearch.toLowerCase()) ||
        f.description.toLowerCase().includes(fontSearch.toLowerCase())
      : true;
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Dynamic Google Font link for active theme */}
      <link rel="stylesheet" href={googleFontHref(theme.fontFamily)} />

      {/* ═══ PAGE HEADER ═══ */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">Tu página de reservas</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            Diseño y apariencia
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-500 dark:text-zinc-400">
            Elegí estilos, fotos, botones y textos. La vista previa se actualiza mientras editás.
          </p>
        </div>
        <div className="grid w-full grid-cols-[auto_1fr_1fr] gap-2 sm:flex sm:w-auto">
          <button
            type="button"
            onClick={() => setIsHistoryOpen(true)}
            aria-label="Versiones anteriores"
            title="Versiones anteriores"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-white/10 glass-panel-subtle px-3.5 text-xs font-semibold text-slate-700 transition hover:bg-white/10 dark:text-zinc-200"
          >
            <History className="h-4 w-4 text-slate-400" />
            <span className="hidden sm:inline">Versiones</span>
          </button>
          <Link
            href={publicBookingUrl}
            target="_blank"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-white/10 glass-panel-subtle px-3.5 text-xs font-semibold text-slate-700 transition hover:bg-white/10 dark:text-zinc-200"
          >
            <ExternalLink className="h-4 w-4 text-slate-400" />
            Ver página
          </Link>
          <button
            type="button"
            data-tour="tour-save"
            disabled={isSaving || loadState !== "ready" || (!hasUnsavedChanges && !savedSuccess)}
            onClick={() => handleSave()}
            title="Guardar (Ctrl/⌘ + S)"
            className="inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-2xl px-4 text-xs font-semibold text-white shadow-sm transition hover:brightness-110 active:scale-[0.98] disabled:cursor-default disabled:opacity-50 disabled:hover:brightness-100 sm:text-sm"
            style={{ backgroundColor: systemColor }}
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : savedSuccess || (!hasUnsavedChanges && loadState === "ready") ? (
              <Check className="h-4 w-4" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {isSaving
              ? "Guardando…"
              : loadState === "loading"
                ? "Cargando…"
                : hasUnsavedChanges
                  ? "Guardar cambios"
                  : "Todo guardado"}
          </button>
        </div>
      </header>

      {loadState === "error" && (
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-rose-500/20 bg-rose-500/[0.06] px-3.5 py-3">
          <span className="flex min-w-0 items-start gap-2.5 text-xs">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" />
            <span>
              <span className="block font-semibold text-rose-700 dark:text-rose-300">No pudimos cargar tu diseño</span>
              <span className="mt-0.5 block text-[11px] text-slate-500 dark:text-zinc-400">
                El guardado está bloqueado para no sobrescribir tu diseño actual. Revisá tu conexión y reintentá.
              </span>
            </span>
          </span>
          <button
            type="button"
            onClick={() => {
              setLoadState("loading");
              setLoadAttempt((n) => n + 1);
            }}
            className="inline-flex min-h-10 shrink-0 items-center rounded-xl border border-rose-500/20 px-3 text-xs font-semibold text-rose-700 transition hover:bg-rose-500/10 dark:text-rose-300"
          >
            Reintentar
          </button>
        </div>
      )}

      {/* ═══ BRAND SUMMARY ═══ */}
      <section className="rounded-3xl glass-panel p-3.5 sm:p-5">
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-5 lg:gap-6">
          {/* Brand checklist */}
          <div className="lg:col-span-3">
            <div className="flex items-end justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold text-slate-900 dark:text-white sm:text-base">Tu marca</h2>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-zinc-400">
                  Completá estos puntos para que tu página se vea profesional.
                </p>
              </div>
              <span className="shrink-0 text-xs font-semibold tabular-nums text-slate-700 dark:text-zinc-200">
                {brandChecklist.filter((i) => i.done).length} de {brandChecklist.length}
              </span>
            </div>
            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-white/[0.06]">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${(brandChecklist.filter((i) => i.done).length / brandChecklist.length) * 100}%`,
                  backgroundColor: systemColor,
                }}
              />
            </div>
            <ul className="mt-3 grid grid-cols-1 gap-1.5 sm:grid-cols-2">
              {brandChecklist.map((item) => (
                <li key={item.label}>
                  <button
                    type="button"
                    onClick={() => handleTabClick(item.tab)}
                    className="flex min-h-11 w-full items-center gap-2.5 rounded-xl px-2.5 text-left transition hover:bg-white/[0.04]"
                  >
                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                        item.done ? "bg-emerald-500 text-white" : "border border-slate-300 dark:border-white/20"
                      }`}
                    >
                      {item.done && <Check className="h-3 w-3" strokeWidth={3} />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span
                        className={`block truncate text-xs font-medium ${
                          item.done ? "text-slate-500 dark:text-zinc-400" : "text-slate-900 dark:text-white"
                        }`}
                      >
                        {item.label}
                      </span>
                      {!item.done && (
                        <span className="block truncate text-[11px] text-slate-500 dark:text-zinc-500">{item.hint}</span>
                      )}
                    </span>
                    {!item.done && <ArrowRight className="h-3.5 w-3.5 shrink-0 text-slate-400" />}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Active style + public link */}
          <div className="flex flex-col gap-3 lg:col-span-2">
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-3.5">
              <p className="text-[11px] font-medium text-slate-500 dark:text-zinc-400">Estilo actual</p>
              <div className="mt-2 flex items-center gap-3">
                <span
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 text-sm font-semibold"
                  style={{ backgroundColor: theme.backgroundColor, color: theme.primaryColor }}
                >
                  Aa
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-slate-900 dark:text-white">
                    {THEME_PRESETS[theme.themePreset]?.name ?? "Personalizado"}
                  </span>
                  <span className="mt-0.5 flex items-center gap-1.5 truncate text-[11px] text-slate-500 dark:text-zinc-400">
                    <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: theme.primaryColor }} />
                    <span className="uppercase tabular-nums">{theme.primaryColor}</span>
                    <span>·</span>
                    <span className="truncate">{fontLabel}</span>
                  </span>
                </span>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-3.5">
              <p className="text-[11px] font-medium text-slate-500 dark:text-zinc-400">Enlace para tus clientes</p>
              <div className="mt-2 flex items-center gap-2">
                <code className="min-w-0 flex-1 truncate text-xs font-medium text-slate-900 dark:text-white">
                  {tenantHost(business.slug || "barberia")}
                </code>
                <button
                  type="button"
                  onClick={handleCopyPublicUrl}
                  aria-label="Copiar enlace de reservas"
                  title="Copiar enlace"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 text-slate-500 transition hover:bg-white/[0.06] hover:text-slate-800 dark:text-zinc-400 dark:hover:text-white"
                >
                  {copiedPublicUrl ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                </button>
                <Link
                  href={publicBookingUrl}
                  target="_blank"
                  aria-label="Abrir página de reservas"
                  title="Abrir página"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 text-slate-500 transition hover:bg-white/[0.06] hover:text-slate-800 dark:text-zinc-400 dark:hover:text-white"
                >
                  <ExternalLink className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs Navigation */}
      <div className="sticky top-0 z-20 -mx-1 flex items-center gap-2 overflow-x-auto px-1 py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:static">
        {[
          { id: "estilos", label: "Estilos", icon: Palette },
          { id: "fotos", label: "Logo y fotos", icon: ImageIcon },
          { id: "botones", label: "Botones y links", icon: Sliders },
          { id: "textos", label: "Textos y redes", icon: Type },
        ].map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              data-tour={`tab-${tab.id}`}
              aria-pressed={active}
              onClick={() => handleTabClick(tab.id as "estilos" | "fotos" | "botones" | "textos")}
              style={active ? { backgroundColor: systemColor } : undefined}
              className={`inline-flex min-h-10 shrink-0 items-center gap-2 rounded-xl px-3.5 text-xs font-semibold transition ${
                active
                  ? "text-white shadow-sm"
                  : "border border-white/10 bg-white/[0.025] text-slate-600 backdrop-blur-md hover:bg-white/[0.06] dark:text-zinc-300"
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
        <button
          type="button"
          onClick={() => setIsMobilePreviewOpen(true)}
          className="ml-auto inline-flex min-h-10 shrink-0 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.025] px-3.5 text-xs font-semibold text-slate-600 backdrop-blur-md transition hover:bg-white/[0.06] dark:text-zinc-300 lg:hidden"
        >
          <Smartphone className="h-4 w-4" />
          Vista previa
        </button>
      </div>

      {/* Main Grid: Controls Left + Phone Preview Right */}
      <div className="grid gap-6 lg:grid-cols-12 items-start">
        {/* Controls Column */}
        <div className="min-w-0 lg:col-span-7 space-y-6">
          {/* TAB 1: ESTILOS & PALETAS */}
          {activeTab === "estilos" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Presets Listos Compactos (Clean cards without badges, filters: Todos, Claro, Oscuro) */}
              <section data-tour="tour-presets" className="space-y-4 rounded-3xl glass-panel p-4 sm:p-5">
                <div>
                  <h2 className="text-sm font-semibold text-slate-900 dark:text-white sm:text-base">Estilos listos</h2>
                  <p className="mt-0.5 text-xs text-slate-500 dark:text-zinc-400">
                    Cada estilo cambia colores, tipografía, distribución, botones y fondo. Tu portada y textos no se tocan.
                  </p>
                </div>
                <PresetPicker active={theme.themePreset} onApply={applyPreset} />
              </section>

              {/* CodePen-Style Color Pickers */}
              <div data-tour="tour-colors">
                <Card className="space-y-4 border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-2.5">
                    <div className="flex items-center gap-2">
                      <Palette className="h-4 w-4 text-primary" />
                      <h2 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100">
                        Color Primario, Modo y Fondos Suaves
                      </h2>
                    </div>

                    {/* Dark / Light Toggle */}
                    <div className="flex items-center gap-1 rounded-xl bg-slate-100 dark:bg-slate-800 p-0.5 border border-slate-200 dark:border-slate-700">
                      <button
                        type="button"
                        onClick={() => {
                          setTheme({
                            ...theme,
                            themeMode: "light",
                            backgroundColor: "#f4f2fb",
                          });
                        }}
                        className={`flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-semibold transition cursor-pointer ${
                          theme.themeMode === "light"
                            ? "bg-white text-slate-900 shadow-2xs"
                            : "text-slate-500 dark:text-slate-400"
                        }`}
                      >
                        <Sun className="h-3 w-3 text-amber-500" /> Claro
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setTheme({
                            ...theme,
                            themeMode: "dark",
                            backgroundColor: "#090d16",
                          });
                        }}
                        className={`flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-semibold transition cursor-pointer ${
                          theme.themeMode === "dark"
                            ? "bg-slate-900 text-white shadow-2xs"
                            : "text-slate-500 dark:text-slate-400"
                        }`}
                      >
                        <Moon className="h-3 w-3 text-indigo-400" /> Oscuro
                      </button>
                    </div>
                  </div>

                  <ColorPicker
                    label="Color de marca"
                    hint="Botones, precios y acentos"
                    value={theme.primaryColor}
                    onChange={(hex) => setTheme((prev) => ({ ...prev, primaryColor: hex }))}
                  />

                  <div className="pt-2 border-t border-slate-100 dark:border-white/5">
                    <ColorPicker
                      label="Color de fondo"
                      hint="Fondo de tu página de reservas"
                      value={theme.backgroundColor}
                      onChange={(hex) => setTheme((prev) => ({ ...prev, backgroundColor: hex }))}
                    />
                    <div className="mt-3">
                      <ContrastCheck
                        primaryColor={theme.primaryColor}
                        backgroundColor={theme.backgroundColor}
                        buttonBg={theme.buttonCustomBg}
                        buttonText={theme.buttonCustomText}
                        onFixButtonText={(hex) => setTheme({ ...theme, buttonCustomText: hex })}
                      />
                    </div>
                  </div>

                  {/* Animated background */}
                  <div className="space-y-2 border-t border-slate-100 pt-3 dark:border-white/5">
                    <div>
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">Fondo animado</p>
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                        Se ve detrás de tu página. Si el cliente pidió reducir el movimiento, queda quieto.
                      </p>
                    </div>
                    <BackgroundPicker
                      value={resolveBackgroundEffect(theme.backgroundEffect)}
                      color={previewTheme.primaryColor}
                      backgroundColor={previewTheme.backgroundColor}
                      isDark={isDarkFromTheme}
                      onChange={handleBackgroundChange}
                    />
                  </div>
                </Card>
              </div>

              <section className="space-y-4 rounded-3xl glass-panel p-4 sm:p-5">
                <div>
                  <h2 className="text-sm font-semibold text-slate-900 dark:text-white sm:text-base">Distribución de la página</h2>
                  <p className="mt-0.5 text-xs text-slate-500 dark:text-zinc-400">
                    Cómo se ordenan tu portada, fotos y servicios. Probalo en la vista previa de escritorio.
                  </p>
                </div>
                <LayoutPicker value={theme.layoutStyle} color={previewTheme.primaryColor} onChange={handleLayoutChange}
                />
              </section>

              {/* 56 Tipografías Oficiales de Google Fonts con Selector y Previsualización */}
              <Card className="space-y-4 border border-slate-200 dark:border-slate-800">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-white/5 pb-2.5">
                  <div className="flex items-center gap-2">
                    <Type className="h-4 w-4 text-indigo-500" />
                    <div>
                      <h2 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100">
                        Tipografía Oficial de Marca (56 Google Fonts)
                      </h2>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Seleccioná la fuente que mejor exprese la personalidad de tu negocio.
                      </p>
                    </div>
                  </div>

                  {/* Category Filter */}
                  <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700 text-[11px] font-semibold">
                    {[
                      { id: "all", label: "Todas" },
                      { id: "sans", label: "Sans" },
                      { id: "serif", label: "Serif" },
                      { id: "display", label: "Display" },
                    ].map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setFontCategory(cat.id)}
                        className={`px-2 py-0.5 rounded transition ${
                          fontCategory === cat.id
                            ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs"
                            : "text-slate-500 hover:text-slate-900 dark:text-slate-400"
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Search Bar + Quick Dropdown */}
                <div className="grid gap-2 sm:grid-cols-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Buscar fuente (ej: Outfit, Bodoni, Cinzel)..."
                      value={fontSearch}
                      onChange={(e) => setFontSearch(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs outline-none focus:border-primary"
                    />
                  </div>

                  <CustomSelect
                    value={theme.fontFamily}
                    onChange={(val) => {
                      setTheme({ ...theme, fontFamily: val });
                    }}
                    options={filteredFonts.map((f) => ({
                      value: f.id,
                      label: f.name,
                      badge: f.category,
                    }))}
                    className="w-full"
                    buttonClassName="w-full py-2 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 font-semibold"
                  />
                </div>

                {/* Typography Live Cards Grid with Real Font Previews */}
                <div className="grid gap-2 sm:grid-cols-2 max-h-[300px] overflow-y-auto pr-1">
                  {filteredFonts.map((f) => {
                    const active = theme.fontFamily === f.id;
                    return (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => {
                          setTheme({ ...theme, fontFamily: f.id });
                        }}
                        className={`flex flex-col items-start rounded-xl border p-2.5 text-left transition cursor-pointer ${
                          active
                            ? "border-primary bg-primary/10 ring-2 ring-primary/30"
                            : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300"
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">{f.name}</span>
                          <span className="text-[11px] uppercase font-semibold text-slate-400">{f.category}</span>
                        </div>
                        <div
                          className="mt-1 text-sm text-slate-800 dark:text-slate-200 truncate w-full"
                          style={{ fontFamily: fontStack(f.id) }}
                        >
                          AgendatePY • Estilo & Turnos
                        </div>
                        <span className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{f.description}</span>
                      </button>
                    );
                  })}
                </div>
              </Card>
            </div>
          )}

          {/* TAB 2: PORTADA & FOTOS */}
          {activeTab === "fotos" && (
            <FotosTab
              theme={theme}
              businessName={business.name}
              isUploadingBanner={isUploadingBanner}
              isUploadingLogo={isUploadingLogo}
              isUploadingPhoto={isUploadingPhoto}
              onChange={(patch) => setTheme((prev) => ({ ...prev, ...patch }))}
              onPickBanner={(file) => setCropRequest({ file, kind: "banner" })}
              onPickLogo={(file) => setCropRequest({ file, kind: "logo" })}
              onUploadGallery={(files) => handleFileUpload(files)}
            />
          )}

          {activeTab === "botones" && (
            <BotonesTab
              theme={theme}
              subTab={buttonSubTab}
              onSubTabChange={setButtonSubTab}
              onChange={(patch) => setTheme((prev) => ({ ...prev, ...patch }))}
            />
          )}

          {activeTab === "textos" && (
            <div className="space-y-5">
              <TextosTab theme={theme} onChange={(patch) => setTheme((prev) => ({ ...prev, ...patch }))} />
              <SeoSettings
                theme={theme}
                businessName={business.name}
                host={tenantHost(business.slug || "barberia")}
                isUploading={isUploadingShare}
                onChange={(patch) => setTheme((prev) => ({ ...prev, ...patch }))}
                onPickShareImage={(file) => setCropRequest({ file, kind: "share" })}
              />
            </div>
          )}
        </div>

        {/* Live preview: memoized and fed a deferred theme so typing never waits on it */}
        <PhonePreviewPanel
          theme={previewTheme}
          previewIsDark={deferredPreviewIsDark}
          business={business}
          services={services}
          products={products}
          liveTime={liveTime}
          phoneThemeMode={phoneThemeMode}
          setPhoneThemeMode={setPhoneThemeMode}
          previewDevice={previewDevice}
          setPreviewDevice={setPreviewDevice}
          isMobilePreviewOpen={isMobilePreviewOpen}
          setIsMobilePreviewOpen={setIsMobilePreviewOpen}
        />
      </div>

      <ThemeHistoryModal open={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} onRestore={handleRestoreVersion} />

      <ImageCropModal
        file={cropRequest?.file ?? null}
        aspect={cropRequest?.kind === "logo" ? 1 : cropRequest?.kind === "share" ? 1200 / 630 : 16 / 6}
        outputWidth={cropRequest?.kind === "logo" ? 600 : cropRequest?.kind === "share" ? 1200 : 1600}
        shape={cropRequest?.kind === "logo" ? "circle" : "rect"}
        title={
          cropRequest?.kind === "logo"
            ? "Encuadrá tu logo"
            : cropRequest?.kind === "share"
              ? "Encuadrá la imagen para compartir"
              : "Encuadrá tu portada"
        }
        onCancel={() => setCropRequest(null)}
        onConfirm={handleCropConfirm}
      />

      {/* Modal: unsaved changes when leaving the page through an internal link */}
      <Modal
        open={pendingHref !== null}
        onClose={() => setPendingHref(null)}
        title="Tenés cambios sin guardar"
        maxWidth="max-w-md"
        footer={
          <div className="grid grid-cols-2 gap-2 sm:flex sm:justify-end">
            <button
              type="button"
              onClick={handleDiscardAndLeave}
              className="min-h-11 rounded-xl border border-rose-500/20 px-4 text-xs font-semibold text-rose-600 transition hover:bg-rose-500/10 dark:text-rose-300 sm:min-h-10"
            >
              Descartar y salir
            </button>
            <button
              type="button"
              onClick={handleSaveAndLeave}
              disabled={isSaving}
              className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl px-4 text-xs font-semibold text-white shadow-sm transition hover:brightness-110 disabled:opacity-60 sm:min-h-10"
              style={{ backgroundColor: systemColor }}
            >
              {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
              Guardar y salir
            </button>
          </div>
        }
      >
        <p className="text-sm text-slate-600 dark:text-zinc-300">
          Si salís ahora, los cambios de diseño que no guardaste se pierden y tu página pública sigue como estaba.
        </p>
        <button
          type="button"
          onClick={() => setPendingHref(null)}
          className="mt-3 text-xs font-semibold text-slate-500 underline-offset-2 hover:underline dark:text-zinc-400"
        >
          Seguir editando
        </button>
      </Modal>

      {/* Floating save bar while there are unsaved changes (hidden during the guided tour) */}
      {hasUnsavedChanges && pendingHref === null && !isTourOpen && (
        <div
          role="status"
          className="fixed inset-x-3 bottom-[calc(env(safe-area-inset-bottom)+5.75rem)] z-40 flex items-center gap-3 rounded-2xl border border-amber-500/30 bg-slate-950/95 px-3.5 py-2.5 text-white shadow-2xl backdrop-blur-md animate-in slide-in-from-bottom duration-300 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 lg:bottom-6"
        >
          <span className="h-2 w-2 shrink-0 animate-pulse rounded-full bg-amber-400" />
          <span className="min-w-0 flex-1 truncate text-xs font-semibold text-slate-200 sm:flex-none">
            <span className="sm:hidden">Sin guardar</span>
            <span className="hidden sm:inline">Cambios sin guardar</span>
          </span>
          <button
            type="button"
            onClick={handleDiscard}
            className="min-h-9 shrink-0 rounded-xl px-2.5 text-xs font-semibold text-slate-400 transition hover:text-white"
          >
            Descartar
          </button>
          <button
            type="button"
            onClick={() => handleSave()}
            disabled={isSaving}
            className="inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-xl px-3.5 text-xs font-semibold text-white shadow-sm transition hover:brightness-110 disabled:opacity-60"
            style={{ backgroundColor: systemColor }}
          >
            {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            Guardar
          </button>
        </div>
      )}
    </div>
  );
}

type PhonePreviewPanelProps = {
  theme: ThemeSettings;
  previewIsDark: boolean;
  business: ReturnType<typeof useDashboardStore.getState>["business"];
  services: ReturnType<typeof useDashboardStore.getState>["services"];
  products: ReturnType<typeof useDashboardStore.getState>["products"];
  liveTime: string;
  phoneThemeMode: "auto" | "light" | "dark";
  setPhoneThemeMode: (mode: "auto" | "light" | "dark") => void;
  previewDevice: "phone" | "desktop";
  setPreviewDevice: (device: "phone" | "desktop") => void;
  isMobilePreviewOpen: boolean;
  setIsMobilePreviewOpen: (open: boolean) => void;
};

/** The live phone / desktop preview. Memoized so editing a field only re-renders the editor. */
const PhonePreviewPanel = memo(function PhonePreviewPanel({
  theme,
  previewIsDark,
  business,
  services,
  products,
  liveTime,
  phoneThemeMode,
  setPhoneThemeMode,
  previewDevice,
  setPreviewDevice,
  isMobilePreviewOpen,
  setIsMobilePreviewOpen,
}: PhonePreviewPanelProps) {
  return (
    <>
        {/* Live Phone Preview Column */}
        <div
          id="apariencia-phone-preview"
          className={`min-w-0 space-y-2 lg:col-span-5 lg:sticky lg:top-[100px] lg:self-start ${
            isMobilePreviewOpen
              ? "max-lg:fixed max-lg:inset-0 max-lg:z-[70] max-lg:overflow-y-auto max-lg:bg-slate-950/95 max-lg:px-4 max-lg:pb-8 max-lg:pt-20 max-lg:backdrop-blur-md"
              : "max-lg:hidden"
          }`}
        >
          {isMobilePreviewOpen && (
            <div className="fixed inset-x-0 top-0 z-10 flex items-center justify-between gap-3 border-b border-white/10 bg-slate-950/90 px-4 py-3 backdrop-blur-md lg:hidden">
              <span className="text-sm font-semibold text-white">Vista previa</span>
              <button
                type="button"
                onClick={() => setIsMobilePreviewOpen(false)}
                className="inline-flex min-h-10 items-center gap-1.5 rounded-xl px-3.5 text-xs font-semibold text-white shadow-sm"
                style={{ backgroundColor: business.primaryColor || "#FF4F2B" }}
              >
                Volver a editar
              </button>
            </div>
          )}
          {/* Top Bar above phone */}
          <div className="flex items-center justify-between px-1">
            <div role="group" aria-label="Dispositivo de la vista previa" className="flex items-center gap-1 rounded-xl border border-white/10 bg-white/[0.03] p-1">
              {([
                { value: "phone", label: "Celular", icon: Smartphone },
                { value: "desktop", label: "Escritorio", icon: Monitor },
              ] as const).map((opt) => {
                const OptIcon = opt.icon;
                const active = previewDevice === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setPreviewDevice(opt.value)}
                    className={`inline-flex min-h-8 items-center gap-1.5 rounded-lg px-2.5 text-[11px] font-semibold transition ${
                      active ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-white"
                    }`}
                  >
                    <OptIcon className="h-3.5 w-3.5" />
                    {opt.label}
                  </button>
                );
              })}
            </div>

            {/* Quick Phone Light/Dark Tester */}
            <div className={`items-center gap-1 ${previewDevice === "phone" ? "flex" : "hidden"} bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700 text-[10px] font-bold`}>
              <button
                type="button"
                onClick={() => setPhoneThemeMode("light")}
                className={`px-1.5 py-0.5 rounded transition cursor-pointer ${
                  phoneThemeMode === "light"
                    ? "bg-white text-slate-900 shadow-2xs"
                    : "text-slate-500 hover:text-slate-900"
                }`}
                title="Probar en modo claro"
              >
                Claro
              </button>
              <button
                type="button"
                onClick={() => setPhoneThemeMode("dark")}
                className={`px-1.5 py-0.5 rounded transition cursor-pointer ${
                  phoneThemeMode === "dark"
                    ? "bg-slate-900 text-white shadow-2xs"
                    : "text-slate-500 hover:text-slate-900"
                }`}
                title="Probar en modo oscuro"
              >
                Oscuro
              </button>
              <button
                type="button"
                onClick={() => setPhoneThemeMode("auto")}
                className={`px-1.5 py-0.5 rounded transition cursor-pointer ${
                  phoneThemeMode === "auto"
                    ? "bg-white dark:bg-slate-900 text-primary shadow-2xs"
                    : "text-slate-500 hover:text-slate-900"
                }`}
                title="Usar modo configurado en el tema"
              >
                Auto
              </button>
            </div>
          </div>

          {previewDevice === "desktop" ? (
            <DesktopPreview
              theme={theme}
              business={{
                slug: business.slug || "barberia",
                name: business.name,
                timezone: business.timezone || "America/Asuncion",
              }}
              services={services}
              products={products}
            />
          ) : (
            // Authentic iPhone 16 Pro chassis copied from the landing
          <div className="relative mx-auto w-full max-w-[308px] min-[390px]:max-w-[340px] sm:max-w-[360px] rounded-[44px] min-[390px]:rounded-[50px] p-[7px] min-[390px]:p-[9px] bg-gradient-to-b from-[#3a3b40] via-[#1e1f23] to-[#111215] shadow-[0_30px_70px_-15px_rgba(0,0,0,0.6),0_0_0_1px_rgba(255,255,255,0.18)]">
            {/* Precision Engineered Side Buttons */}
            <div className="absolute -left-[3px] top-[100px] h-7 w-[3.5px] rounded-l-[2px] bg-gradient-to-r from-[#2a2b30] to-[#45474e] shadow-[-1px_0_2px_rgba(0,0,0,0.4)]" />
            <div className="absolute -left-[3px] top-[140px] h-12 w-[3.5px] rounded-l-[2px] bg-gradient-to-r from-[#2a2b30] to-[#45474e] shadow-[-1px_0_2px_rgba(0,0,0,0.4)]" />
            <div className="absolute -left-[3px] top-[204px] h-12 w-[3.5px] rounded-l-[2px] bg-gradient-to-r from-[#2a2b30] to-[#45474e] shadow-[-1px_0_2px_rgba(0,0,0,0.4)]" />
            <div className="absolute -right-[3px] top-[135px] h-16 w-[3.5px] rounded-r-[2px] bg-gradient-to-l from-[#2a2b30] to-[#45474e] shadow-[1px_0_2px_rgba(0,0,0,0.4)]" />
            <div className="absolute -right-[2.5px] top-[280px] h-14 w-[3px] rounded-r-[2px] bg-gradient-to-l from-[#222327] to-[#3a3b40]" />

            {/* Outer Glass Bezel */}
            <div className="relative overflow-hidden rounded-[38px] min-[390px]:rounded-[42px] bg-black p-[2.5px] shadow-inner">
              {/* Inner Display Canvas */}
              <div
                className={`relative flex h-[580px] min-[390px]:h-[660px] lg:h-[min(660px,calc(100dvh-12rem))] flex-col overflow-hidden rounded-[36px] min-[390px]:rounded-[40px] transition-all duration-300 ${
                  previewIsDark ? "dark [color-scheme:dark]" : "light [color-scheme:light]"
                }`}
                style={{
                  backgroundColor: previewIsDark
                    ? theme.backgroundColor && theme.backgroundColor !== "#f4f2fb"
                      ? theme.backgroundColor
                      : "#090d16"
                    : theme.backgroundColor || "#ffffff",
                  fontFamily: fontStack(theme.fontFamily),
                  color: previewIsDark ? "#f8fafc" : "#0f172a",
                  ["--primary" as string]: theme.primaryColor,
                }}
              >
                {/* iOS 18 Status Bar with Dynamic Island */}
                <div className="relative z-30 flex h-11 shrink-0 items-center justify-between px-6 pt-2 text-current font-semibold text-[12px] tracking-tight select-none">
                  <span className="font-mono">{liveTime}</span>

                  <div className="absolute left-1/2 top-2.5 -translate-x-1/2 flex h-6 w-24 items-center justify-between rounded-full bg-black px-2 shadow-sm border border-white/10">
                    <div className="h-2.5 w-2.5 rounded-full bg-[#0a0d17] border border-blue-950/40 relative">
                      <div className="absolute inset-0.5 rounded-full bg-[#1b2342] opacity-80" />
                    </div>
                    <div className="h-2 w-2 rounded-full bg-[#050508]" />
                  </div>

                  <div className="flex items-center gap-1.5 opacity-90">
                    <div className="flex items-end gap-[1.5px] h-2.5">
                      <span className="w-[2px] h-1 bg-current rounded-xs" />
                      <span className="w-[2px] h-1.5 bg-current rounded-xs" />
                      <span className="w-[2px] h-2 bg-current rounded-xs" />
                      <span className="w-[2px] h-2.5 bg-current rounded-xs" />
                    </div>
                    <svg className="h-3 w-3 fill-current" viewBox="0 0 24 24">
                      <path d="M12 18a2 2 0 1 1 0 4 2 2 0 0 1 0-4zm0-6c3.08 0 5.89 1.15 8.04 3.06l-1.42 1.42A9.97 9.97 0 0 0 12 14c-2.48 0-4.75.9-6.62 2.48L3.96 15.06A11.96 11.96 0 0 1 12 12zm0-6c4.76 0 9.1 1.77 12.43 4.7l-1.42 1.42A15.96 15.96 0 0 0 12 8c-3.9 0-7.48 1.4-10.26 3.73L.32 10.3A17.96 17.96 0 0 1 12 6z" />
                    </svg>
                    <div className="flex items-center">
                      <div className="h-2.5 w-5 rounded-[4px] border border-current p-[1px] flex items-center">
                        <div className="h-full w-full rounded-[2px] bg-current" />
                      </div>
                      <div className="h-1 w-[1.5px] rounded-r-xs bg-current ml-[0.5px]" />
                    </div>
                  </div>
                </div>

                {/* Animated background: same component the public page uses */}
                <div className="pointer-events-none absolute inset-0 isolate z-0">
                  <BackgroundEffect
                    effect={theme.backgroundEffect}
                    color={theme.primaryColor}
                    isDark={previewIsDark}
                    positioning="absolute"
                  />
                </div>

                {/* Simulated Public Booking Page Body */}
                <div className="relative flex-1 flex flex-col overflow-y-auto z-10">
                  {/* 1. LAYOUT: PANORAMIC */}
                  {theme.layoutStyle === "panoramic" && (
                    <>
                      <div className="relative h-28 w-full bg-slate-800 overflow-hidden shrink-0">
                        {theme.bannerUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={theme.bannerUrl}
                            alt="Banner"
                            className="h-full w-full object-cover"
                            style={{ objectPosition: `center ${theme.bannerPosY ?? 50}%` }}
                          />
                        ) : (
                          <div
                            className="h-full w-full"
                            style={{
                              backgroundImage: `linear-gradient(135deg, ${theme.primaryColor}, #0f172a)`,
                            }}
                          />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      </div>

                      <div className="relative px-4 pb-2 -mt-8">
                        <div className="flex items-end justify-between">
                          <div
                            className={`h-16 w-16 bg-white dark:bg-slate-900 overflow-hidden flex items-center justify-center font-bold text-slate-800 text-lg border-2 border-white dark:border-slate-800 shadow-md ${
                              theme.avatarShape === "circle"
                                ? "rounded-full"
                                : theme.avatarShape === "square"
                                ? "rounded-sm"
                                : "rounded-2xl"
                            }`}
                          >
                            {theme.logoUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={theme.logoUrl} alt="Logo" className="h-full w-full object-cover" />
                            ) : (
                              <Store className="h-7 w-7 text-primary" />
                            )}
                          </div>

                          <div className="flex items-center gap-1.5">
                            {theme.instagram && (
                              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/90 dark:bg-slate-800 shadow-xs">
                                <InstagramOfficialIcon className="h-3.5 w-3.5" />
                              </span>
                            )}
                            {theme.whatsapp && (
                              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 text-white shadow-xs">
                                <WhatsAppOfficialIcon className="h-3.5 w-3.5" />
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="mt-2">
                          <h3 className="text-sm font-black leading-tight tracking-tight">{business.name}</h3>
                          <p className="text-[11px] opacity-75 mt-0.5">{theme.slogan}</p>
                          <p className="text-[10px] opacity-60 mt-0.5 line-clamp-2">{theme.bio}</p>
                        </div>

                        {(theme.galleryUrls || []).length > 0 && (
                          <div className="mt-2 flex gap-1.5 overflow-x-auto pb-1">
                            {(theme.galleryUrls || []).slice(0, 4).map((url, i) => (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img key={i} src={url} alt="thumb" className="h-10 w-10 rounded-lg object-cover shrink-0 shadow-2xs" />
                            ))}
                          </div>
                        )}
                      </div>
                    </>
                  )}

                  {/* 2. LAYOUT: SPLIT-GALLERY */}
                  {theme.layoutStyle === "split-gallery" && (
                    <div className="relative p-3 space-y-2">
                      <div className="grid grid-cols-3 gap-1 h-24 rounded-2xl overflow-hidden shadow-xs">
                        {(theme.galleryUrls || []).length > 0 ? (
                          (theme.galleryUrls || []).slice(0, 3).map((url, i) => (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img key={i} src={url} alt="mosaico" className="h-full w-full object-cover" />
                          ))
                        ) : (
                          <>
                            <div className="h-full bg-slate-800 flex items-center justify-center text-[10px] text-slate-400">1</div>
                            <div className="h-full bg-slate-700 flex items-center justify-center text-[10px] text-slate-400">2</div>
                            <div className="h-full bg-slate-800 flex items-center justify-center text-[10px] text-slate-400">3</div>
                          </>
                        )}
                      </div>

                      <div className="flex items-center gap-2.5 pt-1">
                        <div
                          className={`h-12 w-12 bg-white dark:bg-slate-900 overflow-hidden flex items-center justify-center font-bold border-2 border-primary/30 shadow-xs shrink-0 ${
                            theme.avatarShape === "circle" ? "rounded-full" : "rounded-xl"
                          }`}
                        >
                          {theme.logoUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={theme.logoUrl} alt="Logo" className="h-full w-full object-cover" />
                          ) : (
                            <Store className="h-6 w-6 text-primary" />
                          )}
                        </div>
                        <div>
                          <h3 className="text-xs font-black tracking-tight leading-tight">{business.name}</h3>
                          <p className="text-[10px] opacity-70 line-clamp-1">{theme.slogan}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 3. LAYOUT: FLOATING-CARD & STORIES */}
                  {theme.layoutStyle === "floating-card" && (
                    <div className="relative">
                      <div className="relative h-20 w-full overflow-hidden bg-slate-900">
                        {theme.bannerUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={theme.bannerUrl}
                            alt="Banner"
                            className="h-full w-full object-cover opacity-60"
                            style={{ objectPosition: `center ${theme.bannerPosY ?? 50}%` }}
                          />
                        ) : (
                          <div className="h-full w-full bg-gradient-to-r from-primary to-indigo-900 opacity-60" />
                        )}
                      </div>

                      <div className="relative mx-3 -mt-10 rounded-2xl border border-white/20 dark:border-white/10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-3 shadow-lg text-center">
                        <div className="mx-auto -mt-8 flex h-14 w-14 items-center justify-center rounded-full bg-white dark:bg-slate-800 border-2 border-primary shadow-md overflow-hidden">
                          {theme.logoUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={theme.logoUrl} alt="Logo" className="h-full w-full object-cover" />
                          ) : (
                            <Store className="h-6 w-6 text-primary" />
                          )}
                        </div>
                        <h3 className="text-xs font-black mt-1">{business.name}</h3>
                        <p className="text-[10px] opacity-75">{theme.slogan}</p>

                        {(theme.galleryUrls || []).length > 0 && (
                          <div className="flex items-center justify-center gap-1.5 mt-2">
                            {(theme.galleryUrls || []).slice(0, 4).map((url, i) => (
                              <div key={i} className="h-8 w-8 rounded-full p-0.5 ring-2 ring-primary">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={url} alt="story" className="h-full w-full rounded-full object-cover" />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* 4. LAYOUT: MINIMAL-EDITORIAL */}
                  {theme.layoutStyle === "minimal-editorial" && (
                    <div className="relative p-4 border-b border-black/5 dark:border-white/5 space-y-2">
                      <div className="h-1.5 w-12 rounded-full" style={{ backgroundColor: theme.primaryColor }} />
                      <h3 className="text-base font-serif font-bold tracking-wide">{business.name}</h3>
                      <p className="text-[10px] uppercase font-bold tracking-widest opacity-60">
                        {theme.slogan || "Servicios Selectos"}
                      </p>
                      <p className="text-[10px] opacity-70 italic">{theme.bio}</p>
                    </div>
                  )}

                  {/* 5. LAYOUT: BENTO-GRID */}
                  {theme.layoutStyle === "bento-grid" && (
                    <div className="p-3 space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        {/* Bento Hero Card */}
                        <div className="col-span-2 rounded-2xl border border-black/5 dark:border-white/10 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md p-3 flex items-center gap-3">
                          <div
                            className={`h-12 w-12 overflow-hidden flex items-center justify-center bg-primary/10 border border-primary/20 shrink-0 ${
                              theme.avatarShape === "circle" ? "rounded-full" : "rounded-xl"
                            }`}
                          >
                            {theme.logoUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={theme.logoUrl} alt="Logo" className="h-full w-full object-cover" />
                            ) : (
                              <Store className="h-6 w-6 text-primary" />
                            )}
                          </div>
                          <div>
                            <span className="text-xs font-black block leading-tight">{business.name}</span>
                            <span className="text-[10px] opacity-70 block">{theme.slogan}</span>
                          </div>
                        </div>

                        {/* Bento Tile: Next Free Appointment */}
                        <div
                          className="rounded-2xl p-2.5 flex flex-col justify-between text-white shadow-xs"
                          style={{ backgroundColor: theme.primaryColor }}
                        >
                          <span className="text-[9px] font-bold uppercase tracking-wider opacity-90">
                            Próximo Turno
                          </span>
                          <span className="text-xs font-black mt-1">Hoy 15:30 hs</span>
                        </div>

                        {/* Bento Tile: Verified Business */}
                        <div className="rounded-2xl border border-black/5 dark:border-white/10 bg-white/70 dark:bg-slate-900/70 p-2.5 flex flex-col justify-between">
                          <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                            Reservas Online
                          </span>
                          <span className="text-[10px] font-bold mt-1">Confirmación Inmediata</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 6. LAYOUT: FULL-IMMERSIVE */}
                  {theme.layoutStyle === "full-immersive" && (
                    <div className="relative h-48 w-full overflow-hidden shrink-0">
                      {theme.bannerUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={theme.bannerUrl}
                          alt="Banner Immersive"
                          className="h-full w-full object-cover"
                          style={{ objectPosition: `center ${theme.bannerPosY ?? 50}%` }}
                        />
                      ) : (
                        <div
                          className="h-full w-full"
                          style={{ backgroundImage: `linear-gradient(135deg, ${theme.primaryColor}, #050508)` }}
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

                      <div className="absolute bottom-3 left-3 right-3 rounded-2xl border border-white/20 bg-black/60 backdrop-blur-md p-3 text-white">
                        <div className="flex items-center gap-2.5">
                          <div className="h-10 w-10 rounded-full border border-white/30 overflow-hidden bg-white/10 shrink-0 flex items-center justify-center">
                            {theme.logoUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={theme.logoUrl} alt="Logo" className="h-full w-full object-cover" />
                            ) : (
                              <Store className="h-5 w-5 text-white" />
                            )}
                          </div>
                          <div>
                            <span className="text-xs font-black block leading-tight">{business.name}</span>
                            <span className="text-[10px] text-white/80 block">{theme.slogan}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Dynamic Content Section: Respects sectionOrder */}
                  <div className="px-4 pb-4 space-y-3 flex-1 relative pt-2">
                    {/* If links-first or links-only: render links at top */}
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

                    {/* Services block with PROMO support */}
                    {theme.sectionOrder !== "links-only" && (
                      <div className="space-y-2 pt-1">
                        {theme.sectionOrder !== "services-only" && (
                          <div className="flex rounded-xl bg-black/5 dark:bg-white/10 p-1 text-[11px] font-bold">
                            <span
                              className="flex-1 rounded-lg py-1.5 text-center text-white shadow-2xs flex items-center justify-center gap-1.5"
                              style={{ backgroundColor: theme.primaryColor }}
                            >
                              <Calendar className="h-3 w-3" />
                              Turnos
                            </span>
                            <span className="flex-1 rounded-lg py-1.5 text-center opacity-60 flex items-center justify-center gap-1.5">
                              <ShoppingBag className="h-3 w-3" />
                              Tienda
                            </span>
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-1">
                          <p className="text-[10px] font-bold uppercase tracking-wider opacity-60">
                            {theme.sectionOrder === "services-only" ? "Catálogo Exclusivo de Servicios" : "Servicios disponibles"}
                          </p>
                          <span className="text-[9px] font-bold text-primary">Reserva Inmediata</span>
                        </div>

                        {services.slice(0, 3).map((s) => {
                          const hasPromo = Boolean(s.hasPromo);
                          const promoPrice = s.promoPrice || Math.round(s.price * 0.8);
                          const promoBadge = s.promoBadge || "-20% OFF";
                          const promoLimitQuantity = s.promoLimitQuantity || 5;

                          return (
                            <div
                              key={s.id}
                              className={`rounded-2xl border p-2.5 transition flex flex-col gap-1.5 ${
                                previewIsDark
                                  ? "bg-slate-900/90 border-slate-800 text-white"
                                  : "bg-white border-slate-200/90 shadow-2xs text-slate-900"
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1">
                                  <div className="flex items-center gap-1.5">
                                    <p className="text-xs font-bold leading-tight">{s.name}</p>
                                    {hasPromo && (
                                      <span className="rounded-full bg-rose-500/15 text-rose-500 border border-rose-500/30 px-1.5 py-0.2 text-[8px] font-black uppercase">
                                        {promoBadge}
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-[10px] opacity-60 mt-0.5 inline-flex items-center gap-1">
                                    <Clock className="h-2.5 w-2.5" /> {s.durationMin} min
                                  </span>
                                </div>

                                <div className="text-right">
                                  {hasPromo ? (
                                    <div className="flex flex-col items-end">
                                      <span className="text-[10px] opacity-40 line-through font-semibold">
                                        {formatGs(s.price)}
                                      </span>
                                      <span className="text-xs font-black text-rose-500">
                                        {formatGs(promoPrice)}
                                      </span>
                                    </div>
                                  ) : (
                                    <span
                                      className="text-xs font-black"
                                      style={{ color: theme.primaryColor }}
                                    >
                                      {formatGs(s.price)}
                                    </span>
                                  )}
                                </div>
                              </div>

                              {hasPromo && (
                                <div className="flex items-center justify-between text-[9px] font-semibold text-amber-700 dark:text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded-lg px-2 py-0.5">
                                  <span> Quedan {promoLimitQuantity} cupos con descuento</span>
                                  <span className="font-bold underline cursor-pointer">Agendar</span>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* If booking-first: render custom links block below services */}
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

                    {/* Booking Notice in Phone */}
                    {theme.bookingNotice && (
                      <div className="mt-2 rounded-xl border border-amber-500/30 bg-amber-500/10 p-2 text-[10px] text-amber-800 dark:text-amber-200">
                        <span className="font-bold block text-[9px] uppercase tracking-wider text-amber-600 dark:text-amber-400">
                          Aviso Importante
                        </span>
                        <p className="mt-0.5 leading-snug">{theme.bookingNotice}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Home Indicator Bar */}
                <div className="relative shrink-0 py-1.5 z-30 pointer-events-none">
                  <div className="h-1 w-28 bg-current opacity-30 rounded-full mx-auto" />
                </div>
              </div>
            </div>
          </div>
          )}
        </div>
    </>
  );
});
