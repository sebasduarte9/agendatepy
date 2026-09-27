"use client";

import { useState, useEffect, useRef, useMemo } from "react";
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
  Camera,
  Search,
  ChevronDown,
  Tag,
  Grid,
  Maximize2,
  AlertCircle,
} from "lucide-react";
import { compressClientImage } from "@/lib/media-compression";
import { useDashboardStore } from "@/store/useDashboardStore";
import Card from "@/components/dashboard/ui/Card";
import {
  THEME_PRESETS,
  DEFAULT_THEME,
  GOOGLE_FONTS,
  googleFontHref,
  fontStack,
  getCustomButtonClasses,
  getCustomButtonStyles,
  type ThemePreset,
  type ButtonRadius,
  type ButtonStyleVariant,
  type ButtonShadowType,
  type BackgroundEffectType,
  type ButtonAlignment,
  type SectionOrder,
  type AvatarShape,
  type CustomLinkItem,
  type CustomLinkIcon,
  type LayoutStyle,
  type ThemeSettings,
} from "@/lib/theme";
import { formatGs } from "@/lib/dashboard-dates";

// Official Branded SVG Icons
function InstagramOfficialIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <defs>
        <radialGradient id="ig-grad-apariencia" r="150%" cx="30%" cy="107%">
          <stop stopColor="#fdf497" offset="0%" />
          <stop stopColor="#fdf497" offset="5%" />
          <stop stopColor="#fd5949" offset="45%" />
          <stop stopColor="#d6249f" offset="60%" />
          <stop stopColor="#285AEB" offset="90%" />
        </radialGradient>
      </defs>
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" fill="url(#ig-grad-apariencia)" />
      <path
        d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"
        stroke="#ffffff"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="17.5" cy="6.5" r="1" fill="#ffffff" />
    </svg>
  );
}

function WhatsAppOfficialIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path
        fill="#25D366"
        d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"
      />
    </svg>
  );
}

function FacebookOfficialIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="11" fill="#1877F2" />
      <path
        d="M13.5 12h2.5l.5-3h-3V7.5c0-.8.3-1.5 1.5-1.5h1.5V3.2c-.3 0-1.2-.2-2.3-.2-2.3 0-3.7 1.4-3.7 4v2H8v3h2.5v8.5c.5.1 1 .2 1.5.2s1-.1 1.5-.2V12z"
        fill="#ffffff"
      />
    </svg>
  );
}

function GoogleMapsOfficialIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path
        d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
        fill="#EA4335"
      />
      <circle cx="12" cy="9" r="3" fill="#ffffff" />
      <circle cx="12" cy="9" r="1.5" fill="#4285F4" />
    </svg>
  );
}

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
function CodePenColorSelect({
  label,
  value,
  onChange,
  hint,
}: {
  label: string;
  value: string;
  onChange: (hex: string) => void;
  hint?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const colorInputRef = useRef<HTMLInputElement>(null);

  const quickTones = useMemo(() => {
    return [
      "#5b31e6", "#4f46e5", "#0ea5e9", "#06b6d4",
      "#10b981", "#84cc16", "#eab308", "#f97316",
      "#ef4444", "#ec4899", "#d946ef", "#0f172a",
      "#ffffff", "#f8fafc", "#f1f5f9", "#090d16"
    ];
  }, []);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
          {label}
        </label>
        {hint && <span className="text-[10px] text-slate-400 font-medium">{hint}</span>}
      </div>

      <div className="relative">
        <div
          onClick={() => colorInputRef.current?.click()}
          className="group flex items-center justify-between w-full rounded-2xl border border-slate-200/90 dark:border-white/10 bg-white/95 dark:bg-slate-900/95 px-3.5 py-2.5 shadow-xs hover:border-primary/50 transition-all duration-200 cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="relative">
              <span
                className="block h-7 w-7 rounded-full border-2 border-white dark:border-slate-800 shadow-[0_2px_8px_rgba(0,0,0,0.18)] transition-transform group-hover:scale-110"
                style={{ backgroundColor: value }}
              />
              <span className="absolute inset-0 rounded-full ring-1 ring-black/10 dark:ring-white/10" />
            </div>

            <div className="flex flex-col text-left">
              <span className="font-mono text-xs font-black tracking-wider uppercase text-slate-900 dark:text-white">
                {value}
              </span>
              <span className="text-[10px] font-medium text-slate-400">
                Clic para abrir selector visual
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(!isOpen);
              }}
              className="flex items-center gap-1 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 px-2.5 py-1 text-[11px] font-bold text-slate-700 dark:text-slate-300 transition"
            >
              <span>Paleta</span>
              <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
            </button>
          </div>
        </div>

        <input
          ref={colorInputRef}
          type="color"
          value={value.startsWith("#") && value.length === 7 ? value : "#5b31e6"}
          onChange={(e) => onChange(e.target.value)}
          className="sr-only"
        />

        {isOpen && (
          <div className="absolute left-0 right-0 top-full mt-2 z-30 rounded-2xl border border-slate-200 dark:border-white/10 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl p-3 shadow-xl space-y-3 animate-in fade-in zoom-in-95 duration-150">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                Ingresar código Hex manual
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                  placeholder="#000000"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 font-mono text-xs text-slate-900 dark:text-white uppercase font-bold focus:border-primary focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => colorInputRef.current?.click()}
                  className="shrink-0 rounded-xl bg-primary px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:brightness-105 cursor-pointer"
                >
                  Gotero
                </button>
              </div>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                Tonos Rápidos Recomendados
              </span>
              <div className="grid grid-cols-8 gap-1.5">
                {quickTones.map((hex) => (
                  <button
                    key={hex}
                    type="button"
                    onClick={() => {
                      onChange(hex);
                      setIsOpen(false);
                    }}
                    className={`h-6 w-full rounded-lg border border-black/10 dark:border-white/10 shadow-2xs hover:scale-110 transition cursor-pointer relative ${
                      value.toLowerCase() === hex.toLowerCase() ? "ring-2 ring-primary ring-offset-1" : ""
                    }`}
                    style={{ backgroundColor: hex }}
                    title={hex}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Background effects with real animated visual previews
const BACKGROUND_EFFECTS_LIST: {
  id: BackgroundEffectType;
  name: string;
  desc: string;
}[] = [
  {
    id: "none",
    name: "Sólido Limpio",
    desc: "Color plano minimalista sin movimiento",
  },
  {
    id: "floating-shapes",
    name: "Formas Flotantes",
    desc: "Figuras geométricas suaves que flotan y rotan en 3D",
  },
  {
    id: "aurora-wave",
    name: "Ondas de Aurora",
    desc: "Gradientes fluidos con rotación cromática suave",
  },
  {
    id: "ambient-mesh",
    name: "Malla Radiante",
    desc: "Luces ambientales difusas con respiración pulsante",
  },
  {
    id: "particle-stars",
    name: "Constelación & Estrellas",
    desc: "Destellos de luz y partículas que titilan suavemente",
  },
  {
    id: "soft-grid",
    name: "Matriz Tecnológica",
    desc: "Líneas de cuadrícula sutil con haz luminoso vertical",
  },
  {
    id: "glass-morphism",
    name: "Vidrio Cristal",
    desc: "Paneles traslúcidos multicapa con destello líquido",
  },
];

export default function AparienciaPage() {
  const { business, services, updateBusiness, pushToast } = useDashboardStore();

  const [theme, setTheme] = useState<ThemeSettings>(DEFAULT_THEME);
  const [, setLoadingInitial] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);
  const [pendingTab, setPendingTab] = useState<"estilos" | "fotos" | "botones" | "textos" | null>(null);

  // Tabs: 1. Estilos, 2. Portada & Fotos, 3. Botones, 4. Textos
  const [activeTab, setActiveTab] = useState<"estilos" | "fotos" | "botones" | "textos">("estilos");
  const [buttonSubTab, setButtonSubTab] = useState<"links" | "styles">("links");

  function handleTabClick(newTab: "estilos" | "fotos" | "botones" | "textos") {
    if (activeTab === newTab) return;
    if (hasUnsavedChanges) {
      setPendingTab(newTab);
      setShowUnsavedModal(true);
    } else {
      setActiveTab(newTab);
    }
  }

  // Listen to tab switch event from GuidedTour
  useEffect(() => {
    function handleTourTabSwitch(e: Event) {
      const customEvt = e as CustomEvent<{ tab: "estilos" | "fotos" | "botones" | "textos" }>;
      if (customEvt.detail?.tab) {
        setActiveTab(customEvt.detail.tab);
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

  // Filter ONLY: "Todos" | "Claro" | "Oscuro"
  const [presetFilter, setPresetFilter] = useState<"Todos" | "Claro" | "Oscuro">("Todos");

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

  // Load saved theme
  useEffect(() => {
    async function loadTheme() {
      try {
        setLoadingInitial(true);
        const slug = business.slug || "barberia";
        const res = await fetch(`/api/tenant/theme?slug=${slug}`);
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
    pushToast("success", `Tema "${p.name}" seleccionado.`);
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

      updateBusiness({
        primaryColor: theme.primaryColor,
      });

      setSavedSuccess(true);
      setHasUnsavedChanges(false);
      pushToast("success", "¡Diseño y apariencia de tu página guardados con éxito!");
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error de red al guardar";
      pushToast("error", msg);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleSaveAndSwitchTab() {
    await handleSave();
    if (pendingTab) {
      setActiveTab(pendingTab);
      setPendingTab(null);
    }
    setShowUnsavedModal(false);
  }

  function handleDiscardAndSwitchTab() {
    setHasUnsavedChanges(false);
    if (pendingTab) {
      setActiveTab(pendingTab);
      setPendingTab(null);
    }
    setShowUnsavedModal(false);
  }

  // Upload gallery photos
  async function handleFileUpload(files: FileList | null) {
    if (!files || files.length === 0) return;
    setIsUploadingPhoto(true);
    try {
      const newUrls: string[] = [];
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
          setHasUnsavedChanges(true);
          pushToast("success", "Portada actualizada con éxito");
        }
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

  const previewIsDark =
    phoneThemeMode === "dark" ? true : phoneThemeMode === "light" ? false : isDarkFromTheme;

  const publicBookingUrl = `/${business.slug || "barberia"}/reservar`;

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
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link rel="stylesheet" href={googleFontHref(theme.fontFamily)} />

      {/* Global CSS Animation Keyframes for Real Background Effects */}
      <style jsx global>{`
        @keyframes floatShapes1 {
          0%, 100% { transform: translateY(0px) rotate(0deg) scale(1); }
          50% { transform: translateY(-14px) rotate(180deg) scale(1.08); }
        }
        @keyframes floatShapes2 {
          0%, 100% { transform: translateY(0px) rotate(0deg) scale(1); }
          50% { transform: translateY(16px) rotate(-180deg) scale(0.92); }
        }
        @keyframes auroraWaveAnim {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes particleTwinkleAnim {
          0%, 100% { opacity: 0.2; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.3); }
        }
        @keyframes gridBeamAnim {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(200%); }
        }
      `}</style>

      {/* Header (No top Visita Guiada button, enhanced Ver Página Pública button) */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200/80 dark:border-white/10 pb-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100">
            Diseño & Personalización de la Página de Reservas
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Personalizá tipografías de Google, portada, colores y enlaces de tu portal público.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Enhanced Ver Página Pública Button with animation */}
          <Link
            href={publicBookingUrl}
            target="_blank"
            className="group relative inline-flex items-center gap-2.5 rounded-2xl border-2 border-primary/40 bg-gradient-to-r from-primary/15 via-primary/5 to-transparent hover:border-primary px-5 py-2.5 text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white shadow-xs hover:shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
          >
            <span>Ver Página Pública</span>
            <ExternalLink className="h-4 w-4 text-primary transition-transform duration-200 group-hover:translate-x-1 group-hover:-translate-y-0.5" />
          </Link>

          {/* Clean Save Button */}
          <button
            type="button"
            data-tour="tour-save"
            disabled={isSaving}
            onClick={() => handleSave()}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white px-5 py-2.5 text-xs sm:text-sm font-bold shadow-sm transition-all duration-150 cursor-pointer disabled:opacity-60"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Guardando...</span>
              </>
            ) : savedSuccess ? (
              <>
                <Check className="h-4 w-4 stroke-[3] text-emerald-100 animate-bounce" />
                <span>¡Guardado!</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span>Guardar Cambios</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-1 overflow-x-auto pb-px">
        {[
          { id: "estilos", label: "1. Estilos & Paletas", icon: Palette },
          { id: "fotos", label: "2. Portada & Fotos", icon: ImageIcon },
          { id: "botones", label: "3. Botones & Links", icon: Sliders },
          { id: "textos", label: "4. Textos & Políticas", icon: Type },
        ].map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleTabClick(tab.id as any)}
              className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                active
                  ? "border-primary text-primary"
                  : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Grid: Controls Left + Phone Preview Right */}
      <div className="grid gap-6 lg:grid-cols-12 items-start">
        {/* Controls Column */}
        <div className="lg:col-span-7 space-y-6">
          {/* TAB 1: ESTILOS & PALETAS */}
          {activeTab === "estilos" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Presets Listos Compactos (Clean cards without badges, filters: Todos, Claro, Oscuro) */}
              <div data-tour="tour-presets">
                <Card className="space-y-3.5 border border-slate-200 dark:border-slate-800">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-white/5 pb-2.5">
                    <div>
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-amber-500" />
                        <h2 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
                          Estilos y Paletas Profesionales
                        </h2>
                        <span className="rounded-full bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20 px-2 py-0.5 text-[9px] font-black uppercase">
                          {Object.keys(THEME_PRESETS).length} Estilos
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Elegí un diseño compacto listo para aplicar colores, fuentes y fondos de inmediato.
                      </p>
                    </div>
                  </div>

                  {/* Filter Pills ONLY: Todos, Claro, Oscuro */}
                  <div className="flex items-center gap-1.5">
                    {(["Todos", "Claro", "Oscuro"] as const).map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setPresetFilter(cat)}
                        className={`rounded-xl px-3 py-1 text-xs font-bold transition cursor-pointer ${
                          presetFilter === cat
                            ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-2xs"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                  {/* Clean High-Density Grid (No badges) */}
                  <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3 max-h-[340px] overflow-y-auto pr-1">
                    {(Object.keys(THEME_PRESETS) as ThemePreset[])
                      .filter((key) => {
                        if (presetFilter === "Todos") return true;
                        if (presetFilter === "Claro") return THEME_PRESETS[key].themeMode === "light";
                        if (presetFilter === "Oscuro") return THEME_PRESETS[key].themeMode === "dark";
                        return true;
                      })
                      .map((key) => {
                        const p = THEME_PRESETS[key];
                        const active = theme.themePreset === key;
                        return (
                          <button
                            key={key}
                            type="button"
                            onClick={() => applyPreset(key)}
                            className={`group relative flex flex-col justify-between rounded-xl border p-2.5 text-left transition-all duration-150 cursor-pointer ${
                              active
                                ? "border-primary bg-primary/10 ring-2 ring-primary/30 shadow-xs"
                                : "border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300"
                            }`}
                          >
                            <div className="space-y-1 w-full">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-full">
                                  <span
                                    className="h-3 w-3 rounded-full border border-black/10 shadow-2xs"
                                    style={{ backgroundColor: p.primaryColor }}
                                    title={`Primario: ${p.primaryColor}`}
                                  />
                                  <span
                                    className="h-3 w-3 rounded-full border border-black/10"
                                    style={{ backgroundColor: p.backgroundColor }}
                                    title={`Fondo: ${p.backgroundColor}`}
                                  />
                                </div>
                                <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider">
                                  {p.themeMode === "dark" ? "Oscuro" : "Claro"}
                                </span>
                              </div>

                              <span className="block text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                                {p.name}
                              </span>
                              <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1 leading-tight">
                                {p.description}
                              </p>
                            </div>

                            <div className="mt-2 flex items-center justify-between border-t border-slate-100 dark:border-white/5 pt-1.5 text-[9px] text-slate-400 w-full">
                              <span className="font-semibold text-slate-600 dark:text-slate-300 capitalize truncate">
                                {p.fontFamily.replace(/-/g, " ")}
                              </span>
                              <span className="capitalize">{p.layoutStyle.replace(/-/g, " ")}</span>
                            </div>
                          </button>
                        );
                      })}
                  </div>
                </Card>
              </div>

              {/* CodePen-Style Color Pickers */}
              <div data-tour="tour-colors">
                <Card className="space-y-4 border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-2.5">
                    <div className="flex items-center gap-2">
                      <Palette className="h-4 w-4 text-primary" />
                      <h2 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
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
                          setHasUnsavedChanges(true);
                        }}
                        className={`flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-bold transition cursor-pointer ${
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
                          setHasUnsavedChanges(true);
                        }}
                        className={`flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-bold transition cursor-pointer ${
                          theme.themeMode === "dark"
                            ? "bg-slate-900 text-white shadow-2xs"
                            : "text-slate-500 dark:text-slate-400"
                        }`}
                      >
                        <Moon className="h-3 w-3 text-indigo-400" /> Oscuro
                      </button>
                    </div>
                  </div>

                  {/* Brand Color Selector (CodePen style) */}
                  <CodePenColorSelect
                    label="Color de Marca (Botones y Acentos)"
                    hint="Afecta botones principales, precios y badges"
                    value={theme.primaryColor}
                    onChange={(hex) => {
                      setTheme({ ...theme, primaryColor: hex });
                      setHasUnsavedChanges(true);
                    }}
                  />

                  {/* Background Color Selector (CodePen style) */}
                  <div className="pt-2 border-t border-slate-100 dark:border-white/5">
                    <CodePenColorSelect
                      label="Color de Fondo del Lienzo"
                      hint="Fondo de la pantalla en tu página de reservas"
                      value={theme.backgroundColor}
                      onChange={(hex) => {
                        setTheme({ ...theme, backgroundColor: hex });
                        setHasUnsavedChanges(true);
                      }}
                    />
                  </div>

                  {/* Soft Abstract Backgrounds & Ambient Lighting with REAL MINI ANIMATIONS */}
                  <div className="space-y-2 border-t border-slate-100 dark:border-white/5 pt-3">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                        Fondos Animados & Efectos Abstractos
                      </label>
                      <span className="text-[10px] text-slate-400 font-medium">Previsualización viva</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {BACKGROUND_EFFECTS_LIST.map((ef) => {
                        const active = (theme.backgroundEffect || "none") === ef.id;
                        return (
                          <button
                            key={ef.id}
                            type="button"
                            onClick={() => {
                              setTheme({ ...theme, backgroundEffect: ef.id });
                              setHasUnsavedChanges(true);
                            }}
                            className={`flex items-start gap-2.5 rounded-2xl border p-2.5 text-left transition cursor-pointer ${
                              active
                                ? "border-primary bg-primary/10 ring-2 ring-primary/20 text-primary font-bold shadow-xs"
                                : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 text-slate-700 dark:text-slate-300"
                            }`}
                          >
                            {/* Real Mini Animated Preview Box */}
                            <div className="h-10 w-10 shrink-0 rounded-xl overflow-hidden border border-black/10 dark:border-white/10 bg-slate-950 relative flex items-center justify-center">
                              {ef.id === "none" && (
                                <div className="h-full w-full bg-slate-900 flex items-center justify-center">
                                  <span className="h-2 w-2 rounded-full bg-slate-600" />
                                </div>
                              )}

                              {ef.id === "floating-shapes" && (
                                <div className="relative h-full w-full overflow-hidden">
                                  <span
                                    className="absolute h-3 w-3 rounded-full bg-primary/70"
                                    style={{
                                      top: "3px",
                                      left: "4px",
                                      animation: "floatShapes1 3s ease-in-out infinite",
                                    }}
                                  />
                                  <span
                                    className="absolute h-3 w-3 bg-emerald-400/70 rounded-xs"
                                    style={{
                                      bottom: "4px",
                                      right: "4px",
                                      animation: "floatShapes2 3.5s ease-in-out infinite",
                                    }}
                                  />
                                </div>
                              )}

                              {ef.id === "aurora-wave" && (
                                <div
                                  className="h-full w-full"
                                  style={{
                                    backgroundImage: `linear-gradient(135deg, ${theme.primaryColor}, #8b5cf6, #06b6d4, ${theme.primaryColor})`,
                                    backgroundSize: "200% 200%",
                                    animation: "auroraWaveAnim 4s ease infinite",
                                  }}
                                />
                              )}

                              {ef.id === "ambient-mesh" && (
                                <div className="relative h-full w-full">
                                  <div
                                    className="absolute -top-1 -left-1 h-6 w-6 rounded-full blur-xs opacity-75 animate-pulse"
                                    style={{ backgroundColor: theme.primaryColor }}
                                  />
                                  <div
                                    className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full blur-xs bg-indigo-500 opacity-60 animate-pulse"
                                    style={{ animationDelay: "1s" }}
                                  />
                                </div>
                              )}

                              {ef.id === "particle-stars" && (
                                <div className="relative h-full w-full bg-slate-950">
                                  <span
                                    className="absolute top-2 left-2 h-1.5 w-1.5 rounded-full bg-amber-300"
                                    style={{ animation: "particleTwinkleAnim 1.8s infinite" }}
                                  />
                                  <span
                                    className="absolute bottom-2 right-2 h-1.5 w-1.5 rounded-full bg-sky-300"
                                    style={{ animation: "particleTwinkleAnim 2.2s infinite 0.5s" }}
                                  />
                                  <span
                                    className="absolute top-4 right-3 h-1 w-1 rounded-full bg-white"
                                    style={{ animation: "particleTwinkleAnim 1.5s infinite 1s" }}
                                  />
                                </div>
                              )}

                              {ef.id === "soft-grid" && (
                                <div
                                  className="relative h-full w-full overflow-hidden"
                                  style={{
                                    backgroundImage:
                                      "linear-gradient(to right, rgba(255,255,255,0.2) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.2) 1px, transparent 1px)",
                                    backgroundSize: "6px 6px",
                                  }}
                                >
                                  <div
                                    className="absolute inset-x-0 h-2 bg-gradient-to-b from-primary/60 to-transparent"
                                    style={{ animation: "gridBeamAnim 2.5s ease-in-out infinite" }}
                                  />
                                </div>
                              )}

                              {ef.id === "glass-morphism" && (
                                <div className="h-full w-full bg-gradient-to-br from-white/20 via-transparent to-black/40 backdrop-blur-md flex items-center justify-center p-1">
                                  <div className="h-4 w-6 rounded-xs border border-white/40 bg-white/10 shadow-xs" />
                                </div>
                              )}
                            </div>

                            <div className="flex-1">
                              <span className="block text-xs font-bold leading-tight">{ef.name}</span>
                              <span className="text-[10px] text-slate-400 line-clamp-1 leading-snug mt-0.5">
                                {ef.desc}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </Card>
              </div>

              {/* 6 Layouts & Foto Distribution (With 2 new layouts: bento-grid and full-immersive) */}
              <Card className="space-y-4 border border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2 border-b border-slate-100 dark:border-white/5 pb-2.5">
                  <Layers className="h-4 w-4 text-primary" />
                  <div>
                    <h2 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
                      Distribución de Fotos y Layout de la Página
                    </h2>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Cambiá cómo se presentan tus fotos y la cabecera. Mirá el teléfono a la derecha para ver cómo cambia en tiempo real.
                    </p>
                  </div>
                </div>

                <div className="grid gap-2.5 sm:grid-cols-2 md:grid-cols-3">
                  {[
                    {
                      id: "panoramic",
                      name: "Portada Panorámica",
                      desc: "Gran banner cinematográfico arriba, logo circular en esquina y galería en carrusel.",
                      icon: LayoutTemplate,
                    },
                    {
                      id: "split-gallery",
                      name: "Mosaico Dividido",
                      desc: "Mosaico de fotos reales en cuadrícula superior con logo integrado.",
                      icon: Columns,
                    },
                    {
                      id: "floating-card",
                      name: "Tarjeta Flotante & Stories",
                      desc: "Tarjeta de cristal suspendida con avatar centrado y burbujas estilo stories.",
                      icon: Sparkles,
                    },
                    {
                      id: "minimal-editorial",
                      name: "Minimalista Editorial",
                      desc: "Lookbook sobrio con línea de portada delgada y tipografía destacada.",
                      icon: BookOpen,
                    },
                    {
                      id: "bento-grid",
                      name: "Bento Grid Dinámico",
                      desc: "Estilo Apple con tarjetas modulares para turnos, fotos y horarios.",
                      icon: Grid,
                    },
                    {
                      id: "full-immersive",
                      name: "Inmersivo Full Screen",
                      desc: "Fotografía a pantalla completa con tarjeta de vidrio líquido flotante.",
                      icon: Maximize2,
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
                          pushToast("success", `Distribución "${l.name}" aplicada`);
                        }}
                        className={`flex flex-col items-start rounded-2xl border p-3 text-left transition cursor-pointer ${
                          active
                            ? "border-primary bg-primary/10 ring-2 ring-primary/20 shadow-2xs"
                            : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <LayoutIcon className={`h-4 w-4 ${active ? "text-primary" : "text-slate-400"}`} />
                          <span className="text-xs font-bold text-slate-900 dark:text-slate-100">{l.name}</span>
                        </div>
                        <p className="mt-1 text-[10px] text-slate-500 dark:text-slate-400 leading-snug">{l.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </Card>

              {/* 56 Tipografías Oficiales de Google Fonts con Selector y Previsualización */}
              <Card className="space-y-4 border border-slate-200 dark:border-slate-800">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-white/5 pb-2.5">
                  <div className="flex items-center gap-2">
                    <Type className="h-4 w-4 text-indigo-500" />
                    <div>
                      <h2 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
                        Tipografía Oficial de Marca (56 Google Fonts)
                      </h2>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Seleccioná la fuente que mejor exprese la personalidad de tu negocio.
                      </p>
                    </div>
                  </div>

                  {/* Category Filter */}
                  <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700 text-[10px] font-bold">
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

                  <select
                    value={theme.fontFamily}
                    onChange={(e) => {
                      setTheme({ ...theme, fontFamily: e.target.value });
                      setHasUnsavedChanges(true);
                    }}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-bold outline-none focus:border-primary"
                  >
                    {filteredFonts.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name} ({f.category})
                      </option>
                    ))}
                  </select>
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
                          setHasUnsavedChanges(true);
                        }}
                        className={`flex flex-col items-start rounded-xl border p-2.5 text-left transition cursor-pointer ${
                          active
                            ? "border-primary bg-primary/10 ring-2 ring-primary/30"
                            : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300"
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="text-xs font-bold text-slate-900 dark:text-slate-100">{f.name}</span>
                          <span className="text-[9px] uppercase font-bold text-slate-400">{f.category}</span>
                        </div>
                        <div
                          className="mt-1 text-sm text-slate-800 dark:text-slate-200 truncate w-full"
                          style={{ fontFamily: fontStack(f.id) }}
                        >
                          AgendatePY • Estilo & Turnos
                        </div>
                        <span className="text-[9px] text-slate-400 line-clamp-1 mt-0.5">{f.description}</span>
                      </button>
                    );
                  })}
                </div>
              </Card>
            </div>
          )}

          {/* TAB 2: PORTADA & FOTOS */}
          {activeTab === "fotos" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <Card className="space-y-4 border border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-2.5">
                  <div>
                    <h2 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
                      Editor Visual de Portada & Logo
                    </h2>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Adaptado automáticamente a tu layout ({theme.layoutStyle.replace(/-/g, " ")}).
                    </p>
                  </div>
                </div>

                {/* Adaptive Visual Banner Card matching the selected LayoutStyle */}
                <div className="relative rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-900 overflow-hidden shadow-sm">
                  {/* Cover Photo with dynamic aspect-ratio */}
                  <div
                    className={`relative w-full overflow-hidden bg-slate-950 transition-all ${
                      theme.layoutStyle === "panoramic"
                        ? "h-44 sm:h-52"
                        : theme.layoutStyle === "split-gallery"
                        ? "h-40 sm:h-44"
                        : theme.layoutStyle === "floating-card"
                        ? "h-36 sm:h-40"
                        : theme.layoutStyle === "bento-grid"
                        ? "h-40 sm:h-48"
                        : theme.layoutStyle === "full-immersive"
                        ? "h-52 sm:h-60"
                        : "h-32 sm:h-36"
                    }`}
                  >
                    {theme.bannerUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={theme.bannerUrl}
                        alt="Portada de tu negocio"
                        className="h-full w-full object-cover transition-all duration-150"
                        style={{
                          objectPosition: `center ${theme.bannerPosY ?? 50}%`,
                        }}
                      />
                    ) : (
                      <div
                        className="h-full w-full flex items-center justify-center text-slate-500 text-xs font-semibold"
                        style={{
                          backgroundImage: `linear-gradient(135deg, ${theme.primaryColor}, #0f172a)`,
                        }}
                      >
                        <span className="bg-black/30 backdrop-blur-xs px-3 py-1.5 rounded-xl text-white text-[11px]">
                          Sin foto de portada (Usa gradiente de tu color primario)
                        </span>
                      </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none" />

                    {/* Change Cover Upload Button */}
                    <div className="absolute top-3 right-3 flex items-center gap-2">
                      <label className="flex items-center gap-1.5 rounded-xl bg-black/60 hover:bg-black/80 backdrop-blur-md text-white px-3 py-1.5 text-xs font-bold transition cursor-pointer shadow-md border border-white/20">
                        <input
                          type="file"
                          accept="image/*"
                          disabled={isUploadingBanner}
                          onChange={(e) => handleBannerUpload(e.target.files?.[0] || null)}
                          className="sr-only"
                        />
                        {isUploadingBanner ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Camera className="h-3.5 w-3.5" />
                        )}
                        <span>{isUploadingBanner ? "Subiendo..." : "Cambiar Portada"}</span>
                      </label>

                      {theme.bannerUrl && (
                        <button
                          type="button"
                          onClick={() => {
                            setTheme({ ...theme, bannerUrl: "" });
                            setHasUnsavedChanges(true);
                          }}
                          className="rounded-xl bg-rose-600/80 hover:bg-rose-600 p-1.5 text-white transition cursor-pointer shadow-md"
                          title="Eliminar portada"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Profile / Avatar Badge Overlapping */}
                  <div className="relative px-5 pb-4 -mt-12 sm:-mt-14 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
                    <div className="flex items-end gap-3">
                      <div className="relative group">
                        {(() => {
                          const shapeClass =
                            theme.avatarShape === "circle"
                              ? "rounded-full"
                              : theme.avatarShape === "square"
                              ? "rounded-sm"
                              : "rounded-2xl";
                          return (
                            <div
                              className={`h-20 w-20 sm:h-24 sm:w-24 bg-white dark:bg-slate-900 overflow-hidden flex items-center justify-center font-bold text-slate-800 text-lg border-4 border-white dark:border-slate-800 shadow-xl ${shapeClass}`}
                            >
                              {theme.logoUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={theme.logoUrl} alt="Logo" className="h-full w-full object-cover" />
                              ) : (
                                <Store className="h-10 w-10 text-primary" />
                              )}
                            </div>
                          );
                        })()}

                        {/* Upload Logo on Avatar Icon */}
                        <label className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-white shadow-lg border-2 border-white dark:border-slate-800 cursor-pointer hover:scale-110 transition">
                          <input
                            type="file"
                            accept="image/*"
                            disabled={isUploadingLogo}
                            onChange={(e) => handleLogoUpload(e.target.files?.[0] || null)}
                            className="sr-only"
                          />
                          {isUploadingLogo ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Camera className="h-3.5 w-3.5" />
                          )}
                        </label>
                      </div>

                      <div className="mb-1">
                        <span className="text-sm sm:text-base font-extrabold text-white block drop-shadow-sm">
                          {business.name}
                        </span>
                        <span className="text-[11px] text-slate-300 drop-shadow-xs">
                          {theme.slogan || "Tu portal de reservas"}
                        </span>
                      </div>
                    </div>

                    {/* Logo shape selector */}
                    <div className="flex items-center gap-1 text-[10px] bg-slate-800/80 backdrop-blur-md border border-white/10 p-1 rounded-xl text-white">
                      <span className="opacity-70 font-semibold px-1">Forma del logo:</span>
                      {[
                        { id: "circle", label: "Circular" },
                        { id: "rounded", label: "Suave" },
                        { id: "square", label: "Cuadrado" },
                      ].map((sh) => (
                        <button
                          key={sh.id}
                          type="button"
                          onClick={() => {
                            setTheme({ ...theme, avatarShape: sh.id as AvatarShape });
                            setHasUnsavedChanges(true);
                          }}
                          className={`px-2 py-0.5 rounded-lg font-bold transition cursor-pointer ${
                            (theme.avatarShape || "circle") === sh.id ? "bg-primary text-white" : "opacity-75 hover:opacity-100"
                          }`}
                        >
                          {sh.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Vertical Position Slider (Replaces non-working buttons) */}
                {theme.bannerUrl && (
                  <div className="p-3.5 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200/80 dark:border-white/10 space-y-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        Ajuste vertical de encuadre de la foto de portada
                      </span>
                      <span className="font-mono text-primary font-black">
                        {theme.bannerPosY ?? 50}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={theme.bannerPosY ?? 50}
                      onChange={(e) => {
                        setTheme({ ...theme, bannerPosY: Number(e.target.value) });
                        setHasUnsavedChanges(true);
                      }}
                      className="w-full accent-primary cursor-pointer h-2 bg-slate-200 dark:bg-slate-700 rounded-lg"
                    />
                    <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
                      <button
                        type="button"
                        onClick={() => {
                          setTheme({ ...theme, bannerPosY: 15 });
                          setHasUnsavedChanges(true);
                        }}
                        className="hover:text-primary transition cursor-pointer"
                      >
                        Enfoque Arriba (15%)
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setTheme({ ...theme, bannerPosY: 50 });
                          setHasUnsavedChanges(true);
                        }}
                        className="hover:text-primary transition font-bold cursor-pointer"
                      >
                        Centro (50%)
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setTheme({ ...theme, bannerPosY: 85 });
                          setHasUnsavedChanges(true);
                        }}
                        className="hover:text-primary transition cursor-pointer"
                      >
                        Enfoque Abajo (85%)
                      </button>
                    </div>
                  </div>
                )}

                {/* Dimension Guides (Clean and simple without emojis) */}
                <div className="grid gap-2 sm:grid-cols-2 text-[11px]">
                  <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 p-3 bg-slate-50 dark:bg-slate-900/40">
                    <span className="font-bold text-slate-800 dark:text-slate-200 block">
                      Tamaño recomendado para Portada:
                    </span>
                    <span className="text-slate-500 dark:text-slate-400">1200 × 400 píxeles (Relación 3:1) en JPG o PNG.</span>
                  </div>
                  <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 p-3 bg-slate-50 dark:bg-slate-900/40">
                    <span className="font-bold text-slate-800 dark:text-slate-200 block">
                      Tamaño recomendado para Logo:
                    </span>
                    <span className="text-slate-500 dark:text-slate-400">500 × 500 píxeles (Cuadrado 1:1) en PNG con fondo transparente.</span>
                  </div>
                </div>
              </Card>

              {/* Galería de Fotos de Trabajos del Local */}
              <div data-tour="tour-photos">
                <Card className="space-y-4 border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-2.5">
                    <div className="flex items-center gap-2">
                      <ImageIcon className="h-4 w-4 text-emerald-500" />
                      <div>
                        <h2 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
                          Galería de Fotos de Trabajos y Local
                        </h2>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          Subí fotos de tus mejores trabajos, salón o equipo para convencer a tus clientes.
                        </p>
                      </div>
                    </div>
                    <span className="rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-2 py-0.5 text-[9px] font-black uppercase">
                      {(theme.galleryUrls || []).length} Fotos
                    </span>
                  </div>

                  <label className="relative flex flex-col items-center justify-center p-5 border-2 border-dashed border-primary/40 rounded-2xl bg-primary/5 hover:bg-primary/10 transition cursor-pointer group text-center">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      disabled={isUploadingPhoto}
                      onChange={(e) => handleFileUpload(e.target.files)}
                      className="sr-only"
                    />
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white dark:bg-slate-900 text-primary shadow-sm group-hover:scale-105 transition-transform">
                      {isUploadingPhoto ? (
                        <Loader2 className="h-5 w-5 animate-spin text-primary" />
                      ) : (
                        <Upload className="h-5 w-5 text-primary" />
                      )}
                    </div>
                    <span className="mt-2 text-xs font-bold text-slate-900 dark:text-white">
                      {isUploadingPhoto ? "Subiendo y optimizando fotos..." : "Subir Fotos del Local o Trabajos"}
                    </span>
                    <span className="mt-0.5 text-[10px] text-slate-500 dark:text-slate-400">
                      Hacé clic o arrastrá fotos directamente desde tu celular o computadora.
                    </span>
                  </label>

                  {/* Photos Grid with delete buttons */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {(theme.galleryUrls || []).map((url, index) => (
                      <div
                        key={index}
                        className="group relative aspect-square rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={url} alt={`Foto ${index + 1}`} className="h-full w-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemovePhoto(index)}
                          className="absolute top-1.5 right-1.5 rounded-lg bg-rose-600/90 text-white p-1 opacity-0 group-hover:opacity-100 transition shadow-md cursor-pointer"
                          title="Eliminar foto"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </div>
          )}

          {/* TAB 3: BOTONES & LINKS */}
          {activeTab === "botones" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 w-fit">
                <button
                  type="button"
                  onClick={() => setButtonSubTab("links")}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                    buttonSubTab === "links"
                      ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs"
                      : "text-slate-500 hover:text-slate-900 dark:text-slate-400"
                  }`}
                >
                  <LinkIcon className="h-3.5 w-3.5 text-primary" />
                  <span>Redes & Accesos Directos ({ (theme.customLinks || []).length })</span>
                </button>
                <button
                  type="button"
                  onClick={() => setButtonSubTab("styles")}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                    buttonSubTab === "styles"
                      ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs"
                      : "text-slate-500 hover:text-slate-900 dark:text-slate-400"
                  }`}
                >
                  <MousePointerClick className="h-3.5 w-3.5 text-primary" />
                  <span>Estilo & Jerarquía de Botones</span>
                </button>
              </div>

              {buttonSubTab === "links" ? (
                <div data-tour="tour-buttons">
                  <Card className="space-y-4 border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-2.5">
                      <div>
                        <h2 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
                          Enlaces de Biografía & Accesos Directos
                        </h2>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          Botones para que tus clientes lleguen por Waze, pidan Uber, dejen reseñas o chateen.
                        </p>
                      </div>
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
                          { title: "Comprar Gift Card / Voucher", icon: "gift" as CustomLinkIcon, url: "https://agendatepy.com" },
                        ].map((preset, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleAddCustomLink(preset)}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-1 text-[11px] font-medium text-slate-700 dark:text-slate-300 hover:border-primary hover:text-primary transition shadow-2xs cursor-pointer"
                          >
                            <span className="text-primary">{renderCustomLinkIcon(preset.icon, "h-3.5 w-3.5")}</span>
                            <span>{preset.title}</span>
                            <Plus className="h-3 w-3 opacity-50" />
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* List of Custom Links */}
                    <div className="space-y-2.5 pt-1">
                      {(theme.customLinks || []).length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 p-6 text-center text-xs text-slate-400">
                          No tenés botones personalizados. Tocá uno de los atajos de arriba para agregar el primero.
                        </div>
                      ) : (
                        (theme.customLinks || []).map((link) => (
                          <div
                            key={link.id}
                            className={`rounded-xl border p-3 transition space-y-2.5 ${
                              link.enabled
                                ? "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs"
                                : "border-slate-100 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-950 opacity-60"
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2 flex-1">
                                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                                  {renderCustomLinkIcon(link.icon, "h-3.5 w-3.5")}
                                </span>
                                <input
                                  type="text"
                                  value={link.title}
                                  onChange={(e) => handleUpdateCustomLink(link.id, { title: e.target.value })}
                                  className="flex-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent px-2.5 py-1 text-xs font-bold"
                                  placeholder="Texto del botón"
                                />
                              </div>

                              <div className="flex items-center gap-1.5">
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
                                <button
                                  type="button"
                                  onClick={() => handleRemoveCustomLink(link.id)}
                                  className="p-1 text-slate-400 hover:text-rose-500 transition cursor-pointer"
                                  title="Eliminar botón"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>

                            <div className="grid gap-2 sm:grid-cols-12 text-xs">
                              <div className="sm:col-span-8">
                                <input
                                  type="url"
                                  value={link.url}
                                  onChange={(e) => handleUpdateCustomLink(link.id, { url: e.target.value })}
                                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent px-2.5 py-1 text-xs font-mono"
                                  placeholder="https://destino..."
                                />
                              </div>

                              <div className="sm:col-span-4">
                                <select
                                  value={link.style}
                                  onChange={(e) => handleUpdateCustomLink(link.id, { style: e.target.value as any })}
                                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent px-2 py-1 text-xs"
                                >
                                  <option value="default">Estilo Normal</option>
                                  <option value="highlight">Destacado (Pulsante)</option>
                                  <option value="outline">Delineado Sutil</option>
                                </select>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </Card>
                </div>
              ) : (
                /* Sub-Tab B: Estilo & Jerarquía con Modo Servicios Puro */
                <Card className="space-y-4 border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-2.5">
                    <div>
                      <h2 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
                        Acabado Visual, Bordes y Jerarquía de Botones
                      </h2>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Elegí la textura, redondez y orden de presentación de tus botones.
                      </p>
                    </div>
                  </div>

                  {/* Jerarquía de Contenido (Including services-only) */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Jerarquía del Contenido en la Página
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                      {[
                        { id: "booking-first", name: "Turnos Primero", desc: "Servicios arriba, enlaces al pie" },
                        { id: "links-first", name: "Redes & Links Primero", desc: "Tus enlaces arriba, turnos abajo" },
                        { id: "links-only", name: "Modo Bio-Link Puro", desc: "Enfoque exclusivo en redes" },
                        { id: "services-only", name: "Modo Servicios Puro", desc: "Catálogo exclusivo de servicios" },
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
                                ? "border-primary bg-primary/10 ring-2 ring-primary/20 text-primary font-bold shadow-2xs"
                                : "border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                            }`}
                          >
                            <span className="text-xs font-bold">{item.name}</span>
                            <span className="text-[10px] opacity-70 mt-0.5">{item.desc}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Button Styles Grid */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Estilo de Acabado del Botón
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        { id: "solid", name: "Sólido Clásico" },
                        { id: "outline", name: "Delineado" },
                        { id: "glass", name: "Vidrio Glass" },
                        { id: "glow", name: "Resplandor Glow" },
                        { id: "gradient", name: "Gradiente" },
                        { id: "soft-elevated", name: "Soft Elevado" },
                        { id: "neubrutalism", name: "Brutalista 3D" },
                        { id: "double-border", name: "Doble Borde" },
                      ].map((st) => {
                        const active = theme.buttonStyle === st.id;
                        return (
                          <button
                            key={st.id}
                            type="button"
                            onClick={() => {
                              setTheme({ ...theme, buttonStyle: st.id as ButtonStyleVariant });
                              setHasUnsavedChanges(true);
                            }}
                            className={`rounded-xl border p-2 text-center text-xs font-bold transition cursor-pointer ${
                              active
                                ? "border-primary bg-primary text-white shadow-2xs"
                                : "border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                            }`}
                          >
                            {st.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Button Corner Shape */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Redondez de Esquinas
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { id: "full", label: "Píldora Completa" },
                        { id: "lg", label: "Redondeado" },
                        { id: "md", label: "Suave" },
                        { id: "none", label: "Recto" },
                      ].map((r) => (
                        <button
                          key={r.id}
                          type="button"
                          onClick={() => {
                            setTheme({ ...theme, buttonRadius: r.id as ButtonRadius });
                            setHasUnsavedChanges(true);
                          }}
                          className={`rounded-xl border py-1.5 text-xs font-bold transition cursor-pointer ${
                            theme.buttonRadius === r.id
                              ? "border-primary bg-primary text-white"
                              : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                          }`}
                        >
                          {r.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Sombra y Alineación */}
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Sombra y Efecto 3D
                      </label>
                      <select
                        value={theme.buttonShadow}
                        onChange={(e) => {
                          setTheme({ ...theme, buttonShadow: e.target.value as ButtonShadowType });
                          setHasUnsavedChanges(true);
                        }}
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-semibold"
                      >
                        <option value="none">Sin sombra (Plano)</option>
                        <option value="soft">Sombra Suave</option>
                        <option value="medium">Sombra Media</option>
                        <option value="hard">Sólida Retro 3D</option>
                        <option value="glow">Aura Luminosa</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Alineación del Texto
                      </label>
                      <select
                        value={theme.buttonAlignment}
                        onChange={(e) => {
                          setTheme({ ...theme, buttonAlignment: e.target.value as ButtonAlignment });
                          setHasUnsavedChanges(true);
                        }}
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-semibold"
                      >
                        <option value="center">Centrado</option>
                        <option value="spread">Extremos (Icono y Texto separados)</option>
                        <option value="left">Alineado a la Izquierda</option>
                      </select>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          )}

          {/* TAB 4: TEXTOS & POLÍTICAS */}
          {activeTab === "textos" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <Card className="space-y-4 border border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-2.5">
                  <h2 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
                    Identidad, Bio y Canales Oficiales
                  </h2>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      Slogan o Frase Destacada
                    </label>
                    <input
                      type="text"
                      value={theme.slogan}
                      onChange={(e) => {
                        setTheme({ ...theme, slogan: e.target.value });
                        setHasUnsavedChanges(true);
                      }}
                      placeholder="Ej: Experiencia de autor & barbería premium en Asunción"
                      className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                        Descripción o Bio del Local
                      </label>
                      <span className="text-[10px] text-slate-400">
                        {(theme.bio || "").length} / 220 caracteres
                      </span>
                    </div>
                    <textarea
                      rows={2}
                      maxLength={220}
                      value={theme.bio}
                      onChange={(e) => {
                        setTheme({ ...theme, bio: e.target.value });
                        setHasUnsavedChanges(true);
                      }}
                      placeholder="Contale a tus clientes tus especialidades, años de trayectoria o ubicación..."
                      className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs outline-none focus:border-primary resize-none"
                    />
                  </div>

                  {/* Official Social Media and Channels with Real SVG Icons */}
                  <div className="pt-2 border-t border-slate-100 dark:border-white/5 space-y-3">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                      Redes Sociales & Canales de Contacto
                    </span>

                    <div className="grid gap-3 sm:grid-cols-2">
                      {/* Instagram */}
                      <div>
                        <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          <InstagramOfficialIcon className="h-4 w-4" />
                          <span>Instagram Oficial</span>
                        </label>
                        <input
                          type="text"
                          value={theme.instagram}
                          onChange={(e) => {
                            setTheme({ ...theme, instagram: e.target.value });
                            setHasUnsavedChanges(true);
                          }}
                          placeholder="@tunegocio"
                          className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs outline-none focus:border-primary"
                        />
                      </div>

                      {/* WhatsApp */}
                      <div>
                        <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          <WhatsAppOfficialIcon className="h-4 w-4" />
                          <span>WhatsApp de Atención</span>
                        </label>
                        <input
                          type="text"
                          value={theme.whatsapp}
                          onChange={(e) => {
                            setTheme({ ...theme, whatsapp: e.target.value });
                            setHasUnsavedChanges(true);
                          }}
                          placeholder="0981 123 456"
                          className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs outline-none focus:border-primary"
                        />
                      </div>

                      {/* Facebook */}
                      <div>
                        <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          <FacebookOfficialIcon className="h-4 w-4" />
                          <span>Facebook</span>
                        </label>
                        <input
                          type="text"
                          value={theme.facebook || ""}
                          onChange={(e) => {
                            setTheme({ ...theme, facebook: e.target.value });
                            setHasUnsavedChanges(true);
                          }}
                          placeholder="facebook.com/tunegocio"
                          className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs outline-none focus:border-primary"
                        />
                      </div>

                      {/* Google Maps */}
                      <div>
                        <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          <GoogleMapsOfficialIcon className="h-4 w-4" />
                          <span>Ubicación en Google Maps</span>
                        </label>
                        <input
                          type="text"
                          value={theme.googleMapsUrl || ""}
                          onChange={(e) => {
                            setTheme({ ...theme, googleMapsUrl: e.target.value });
                            setHasUnsavedChanges(true);
                          }}
                          placeholder="https://maps.google.com/..."
                          className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs outline-none focus:border-primary"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Políticas y Condiciones de Reserva (NO emojis in quick templates) */}
              <Card className="space-y-4 border border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-2.5">
                  <div>
                    <h2 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
                      Aviso Previo & Políticas de Reserva
                    </h2>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Aparece antes de que el cliente confirme su turno (tolerancia, señas, puntualidad).
                    </p>
                  </div>
                </div>

                {/* 1-Click Policy Templates without emojis */}
                <div>
                  <span className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Insertar política sugerida en 1 clic:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      "10 min de tolerancia de espera.",
                      "Cancelaciones con al menos 2h de anticipación.",
                      "Seña del 50% requerida para turnos de más de 1h.",
                      "Asistir con puntualidad y sin acompañantes.",
                    ].map((tpl, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          setTheme((prev) => ({
                            ...prev,
                            bookingNotice: prev.bookingNotice ? `${prev.bookingNotice} ${tpl}` : tpl,
                          }));
                          setHasUnsavedChanges(true);
                        }}
                        className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-1 text-[10px] font-semibold text-slate-700 dark:text-slate-300 hover:border-primary hover:text-primary transition shadow-2xs cursor-pointer"
                      >
                        + {tpl}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <textarea
                    rows={2}
                    value={theme.bookingNotice}
                    onChange={(e) => {
                      setTheme({ ...theme, bookingNotice: e.target.value });
                      setHasUnsavedChanges(true);
                    }}
                    placeholder="Ej: Tenés 10 minutos de tolerancia antes de liberar el turno..."
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs outline-none focus:border-primary resize-none"
                  />
                </div>
              </Card>
            </div>
          )}
        </div>

        {/* Live Phone Preview Column */}
        <div className="lg:col-span-5 lg:sticky lg:top-6 space-y-2">
          {/* Top Bar above phone */}
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <Smartphone className="h-4 w-4 text-slate-400" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Visualización en Tiempo Real
              </span>
            </div>

            {/* Quick Phone Light/Dark Tester */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700 text-[10px] font-bold">
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

          {/* Authentic iPhone 16 Pro Chassis copied from Landing */}
          <div className="relative mx-auto w-full max-w-[340px] sm:max-w-[360px] rounded-[50px] p-[9px] bg-gradient-to-b from-[#3a3b40] via-[#1e1f23] to-[#111215] shadow-[0_30px_70px_-15px_rgba(0,0,0,0.6),0_0_0_1px_rgba(255,255,255,0.18)]">
            {/* Precision Engineered Side Buttons */}
            <div className="absolute -left-[3px] top-[100px] h-7 w-[3.5px] rounded-l-[2px] bg-gradient-to-r from-[#2a2b30] to-[#45474e] shadow-[-1px_0_2px_rgba(0,0,0,0.4)]" />
            <div className="absolute -left-[3px] top-[140px] h-12 w-[3.5px] rounded-l-[2px] bg-gradient-to-r from-[#2a2b30] to-[#45474e] shadow-[-1px_0_2px_rgba(0,0,0,0.4)]" />
            <div className="absolute -left-[3px] top-[204px] h-12 w-[3.5px] rounded-l-[2px] bg-gradient-to-r from-[#2a2b30] to-[#45474e] shadow-[-1px_0_2px_rgba(0,0,0,0.4)]" />
            <div className="absolute -right-[3px] top-[135px] h-16 w-[3.5px] rounded-r-[2px] bg-gradient-to-l from-[#2a2b30] to-[#45474e] shadow-[1px_0_2px_rgba(0,0,0,0.4)]" />
            <div className="absolute -right-[2.5px] top-[280px] h-14 w-[3px] rounded-r-[2px] bg-gradient-to-l from-[#222327] to-[#3a3b40]" />

            {/* Outer Glass Bezel */}
            <div className="relative overflow-hidden rounded-[42px] bg-black p-[2.5px] shadow-inner">
              {/* Inner Display Canvas */}
              <div
                className={`relative flex h-[660px] flex-col overflow-hidden rounded-[40px] transition-all duration-300 ${
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

                {/* Real Animated Background Effects inside phone */}
                {theme.backgroundEffect === "floating-shapes" && (
                  <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-30 z-0">
                    <span
                      className="absolute h-24 w-24 rounded-full blur-xl"
                      style={{
                        backgroundColor: theme.primaryColor,
                        top: "15%",
                        left: "10%",
                        animation: "floatShapes1 6s ease-in-out infinite",
                      }}
                    />
                    <span
                      className="absolute h-28 w-28 rounded-2xl blur-xl bg-indigo-500"
                      style={{
                        bottom: "20%",
                        right: "10%",
                        animation: "floatShapes2 7s ease-in-out infinite",
                      }}
                    />
                  </div>
                )}

                {theme.backgroundEffect === "aurora-wave" && (
                  <div
                    className="pointer-events-none absolute inset-0 opacity-25 z-0"
                    style={{
                      backgroundImage: `linear-gradient(135deg, ${theme.primaryColor}, #8b5cf6, #06b6d4, ${theme.primaryColor})`,
                      backgroundSize: "250% 250%",
                      animation: "auroraWaveAnim 8s ease infinite",
                    }}
                  />
                )}

                {theme.backgroundEffect === "ambient-mesh" && (
                  <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-30 z-0">
                    <div
                      className="absolute -top-10 -left-10 h-44 w-44 rounded-full blur-3xl animate-pulse"
                      style={{ backgroundColor: theme.primaryColor }}
                    />
                    <div
                      className="absolute top-1/2 -right-10 h-48 w-48 rounded-full blur-3xl opacity-60 bg-indigo-500 animate-pulse"
                      style={{ animationDelay: "1.5s" }}
                    />
                  </div>
                )}

                {theme.backgroundEffect === "particle-stars" && (
                  <div className="pointer-events-none absolute inset-0 opacity-40 z-0">
                    <span
                      className="absolute top-20 left-12 h-2 w-2 rounded-full bg-amber-300"
                      style={{ animation: "particleTwinkleAnim 2s infinite" }}
                    />
                    <span
                      className="absolute top-44 right-16 h-1.5 w-1.5 rounded-full bg-sky-300"
                      style={{ animation: "particleTwinkleAnim 2.5s infinite 0.7s" }}
                    />
                    <span
                      className="absolute bottom-36 left-20 h-2 w-2 rounded-full bg-white"
                      style={{ animation: "particleTwinkleAnim 1.8s infinite 1.2s" }}
                    />
                    <span
                      className="absolute bottom-60 right-8 h-1 w-1 rounded-full bg-purple-300"
                      style={{ animation: "particleTwinkleAnim 3s infinite 0.3s" }}
                    />
                  </div>
                )}

                {theme.backgroundEffect === "soft-grid" && (
                  <div
                    className="pointer-events-none absolute inset-0 opacity-[0.07] z-0"
                    style={{
                      backgroundImage:
                        "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
                      backgroundSize: "20px 20px",
                    }}
                  />
                )}

                {theme.backgroundEffect === "glass-morphism" && (
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-black/10 backdrop-blur-[1px] z-0" />
                )}

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
                                  <span>🔥 Quedan {promoLimitQuantity} cupos con descuento</span>
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
        </div>
      </div>

      {/* Modal: Cambios sin guardar al cambiar de sección */}
      {showUnsavedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
                <AlertCircle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Tenés cambios sin guardar
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Modificaste configuraciones de diseño en esta sección.
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              ¿Querés guardar los cambios realizados antes de cambiar de sección? Si continuás sin guardar, las modificaciones no se aplicarán.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setShowUnsavedModal(false);
                  setPendingTab(null);
                }}
                className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                Seguir Editando
              </button>
              <button
                type="button"
                onClick={handleDiscardAndSwitchTab}
                className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
              >
                Descartar y Cambiar
              </button>
              <button
                type="button"
                onClick={handleSaveAndSwitchTab}
                disabled={isSaving}
                className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-primary text-white hover:bg-primary/90 shadow-md shadow-primary/20 transition cursor-pointer"
              >
                {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                <span>Guardar Cambios</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Save Alert Bar when hasUnsavedChanges is true */}
      {hasUnsavedChanges && !showUnsavedModal && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 rounded-full border border-amber-500/40 bg-slate-900/95 text-white px-5 py-2.5 shadow-2xl backdrop-blur-md animate-in slide-in-from-bottom duration-300">
          <span className="flex h-2.5 w-2.5 rounded-full bg-amber-400 animate-pulse shrink-0" />
          <span className="text-xs font-bold text-slate-200 whitespace-nowrap">
            Tenés cambios sin guardar en tu diseño
          </span>
          <div className="flex items-center gap-2 pl-2 border-l border-white/20 shrink-0">
            <button
              type="button"
              onClick={() => setHasUnsavedChanges(false)}
              className="text-xs font-bold text-slate-400 hover:text-white px-2 py-1 transition cursor-pointer"
            >
              Descartar
            </button>
            <button
              type="button"
              onClick={() => handleSave()}
              disabled={isSaving}
              className="flex items-center gap-1.5 rounded-full bg-primary hover:bg-primary/90 px-4 py-1.5 text-xs font-black text-white shadow-sm transition cursor-pointer"
            >
              {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
              <span>Guardar</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
