import type { CSSProperties } from "react";

export type GoogleFontDef = {
  id: string;
  name: string;
  category: "sans" | "serif" | "display" | "mono";
  query: string;
  cssFamily: string;
  description: string;
};

export const GOOGLE_FONTS: GoogleFontDef[] = [
  // Sans-Serif Modernas
  {
    id: "plus-jakarta-sans",
    name: "Plus Jakarta Sans",
    category: "sans",
    query: "family=Plus+Jakarta+Sans:wght@400;500;600;700;800",
    cssFamily: '"Plus Jakarta Sans", sans-serif',
    description: "Moderna, equilibrada y ultra nítida en pantallas.",
  },
  {
    id: "outfit",
    name: "Outfit",
    category: "sans",
    query: "family=Outfit:wght@400;500;600;700;800",
    cssFamily: '"Outfit", sans-serif',
    description: "Geométrica, moderna y de alta gama.",
  },
  {
    id: "inter",
    name: "Inter",
    category: "sans",
    query: "family=Inter:wght@400;500;600;700",
    cssFamily: '"Inter", sans-serif',
    description: "El estándar de legibilidad minimalista internacional.",
  },
  {
    id: "poppins",
    name: "Poppins",
    category: "sans",
    query: "family=Poppins:wght@400;500;600;700",
    cssFamily: '"Poppins", sans-serif',
    description: "Cálida, amigable y muy atractiva visualmente.",
  },
  {
    id: "montserrat",
    name: "Montserrat",
    category: "sans",
    query: "family=Montserrat:wght@400;500;600;700;800",
    cssFamily: '"Montserrat", sans-serif',
    description: "Firme, imponente y con gran personalidad de marca.",
  },
  {
    id: "dm-sans",
    name: "DM Sans",
    category: "sans",
    query: "family=DM+Sans:wght@400;500;700",
    cssFamily: '"DM Sans", sans-serif',
    description: "Sutil, ejecutiva y elegante.",
  },

  // Serif & Clásicas de Lujo
  {
    id: "playfair-display",
    name: "Playfair Display",
    category: "serif",
    query: "family=Playfair+Display:ital,wght@0,500;0,700;1,400",
    cssFamily: '"Playfair Display", Georgia, serif',
    description: "Lujo, barbería clásica, spas y salones premium.",
  },
  {
    id: "cormorant-garamond",
    name: "Cormorant Garamond",
    category: "serif",
    query: "family=Cormorant+Garamond:ital,wght@0,500;0,700;1,400",
    cssFamily: '"Cormorant Garamond", Garamond, serif',
    description: "Boutique, refinada y con aire editorial europeo.",
  },
  {
    id: "cinzel",
    name: "Cinzel",
    category: "serif",
    query: "family=Cinzel:wght@500;700;900",
    cssFamily: '"Cinzel", serif',
    description: "Inspirada en inscripciones romanas; solemne y distintiva.",
  },
  {
    id: "lora",
    name: "Lora",
    category: "serif",
    query: "family=Lora:ital,wght@0,500;0,600;1,400",
    cssFamily: '"Lora", serif',
    description: "Cálida con contraste contemporáneo en párrafos.",
  },

  // Display & Vanguardistas
  {
    id: "syne",
    name: "Syne",
    category: "display",
    query: "family=Syne:wght@600;700;800",
    cssFamily: '"Syne", sans-serif',
    description: "Artística, audaz y en tendencia en diseño contemporáneo.",
  },
  {
    id: "space-grotesk",
    name: "Space Grotesk",
    category: "display",
    query: "family=Space+Grotesk:wght@500;700",
    cssFamily: '"Space Grotesk", sans-serif',
    description: "Brutalista tecnológica, estilizada y moderna.",
  },
  {
    id: "bricolage-grotesque",
    name: "Bricolage Grotesque",
    category: "display",
    query: "family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,800",
    cssFamily: '"Bricolage Grotesque", sans-serif',
    description: "Audaz y excéntrica para marcas con actitud propia.",
  },
];

export type FontFamily = string;

export type LayoutStyle =
  | "panoramic"
  | "split-gallery"
  | "floating-card"
  | "minimal-editorial";

export type ThemeMode = "light" | "dark" | "system";

export type ThemePreset =
  | "default"
  | "barber-dark"
  | "rose-aesthetic"
  | "emerald-spa"
  | "modern-minimal"
  | "obsidian-gold"
  | "cyber-noir";

export type ButtonRadius = "full" | "lg" | "md" | "none";

export type ThemeSettings = {
  primaryColor: string;
  backgroundColor: string;
  fontFamily: FontFamily;
  themeMode: ThemeMode;
  layoutStyle: LayoutStyle;
  logoUrl: string;
  bannerUrl: string;
  galleryUrls: string[];
  bio: string;
  slogan: string;
  instagram: string;
  whatsapp: string;
  tiktok: string;
  facebook: string;
  googleMapsUrl: string;
  bookingNotice: string;
  themePreset: ThemePreset;
  buttonRadius: ButtonRadius;
  showStaffAvatars: boolean;
  showServiceDuration: boolean;
};

export const THEME_PRESETS: Record<
  ThemePreset,
  {
    name: string;
    description: string;
    primaryColor: string;
    backgroundColor: string;
    fontFamily: string;
    themeMode: ThemeMode;
    layoutStyle: LayoutStyle;
    themePreset: ThemePreset;
    buttonRadius: ButtonRadius;
    bannerUrl?: string;
  }
> = {
  default: {
    name: "Agendate Violet",
    description: "Equilibrado, moderno y vibrante en violeta eléctrico",
    primaryColor: "#5b31e6",
    backgroundColor: "#f4f2fb",
    fontFamily: "plus-jakarta-sans",
    themeMode: "light",
    layoutStyle: "panoramic",
    themePreset: "default",
    buttonRadius: "full",
  },
  "barber-dark": {
    name: "Barber Dark Luxe",
    description: "Negro obsidiana con acentos dorados y ámbar cálido",
    primaryColor: "#d97706",
    backgroundColor: "#090d16",
    fontFamily: "outfit",
    themeMode: "dark",
    layoutStyle: "split-gallery",
    themePreset: "barber-dark",
    buttonRadius: "lg",
    bannerUrl:
      "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=1200&auto=format&fit=crop&q=80",
  },
  "obsidian-gold": {
    name: "Obsidian Gold VIP",
    description: "Fondo grafito puro con dorados metálicos de alto impacto",
    primaryColor: "#eab308",
    backgroundColor: "#0a0a0c",
    fontFamily: "cinzel",
    themeMode: "dark",
    layoutStyle: "floating-card",
    themePreset: "obsidian-gold",
    buttonRadius: "md",
  },
  "rose-aesthetic": {
    name: "Salón Rose Aesthetic",
    description: "Rosa palo y perla para estética, uñas y peluquerías",
    primaryColor: "#e11d48",
    backgroundColor: "#fff1f2",
    fontFamily: "playfair-display",
    themeMode: "light",
    layoutStyle: "floating-card",
    themePreset: "rose-aesthetic",
    buttonRadius: "full",
    bannerUrl:
      "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1200&auto=format&fit=crop&q=80",
  },
  "emerald-spa": {
    name: "Spa Zen Emerald",
    description: "Tonos salvia y esmeralda relajantes para bienestar y masaje",
    primaryColor: "#059669",
    backgroundColor: "#ecfdf5",
    fontFamily: "cormorant-garamond",
    themeMode: "light",
    layoutStyle: "split-gallery",
    themePreset: "emerald-spa",
    buttonRadius: "full",
    bannerUrl:
      "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1200&auto=format&fit=crop&q=80",
  },
  "modern-minimal": {
    name: "Modern Minimalist",
    description: "Monocromático editorial sobrio con líneas limpias",
    primaryColor: "#0f172a",
    backgroundColor: "#f8fafc",
    fontFamily: "inter",
    themeMode: "light",
    layoutStyle: "minimal-editorial",
    themePreset: "modern-minimal",
    buttonRadius: "md",
  },
  "cyber-noir": {
    name: "Cyber Studio Noir",
    description: "Neón cian y violeta sobre fondo negro profundo",
    primaryColor: "#06b6d4",
    backgroundColor: "#030712",
    fontFamily: "syne",
    themeMode: "dark",
    layoutStyle: "panoramic",
    themePreset: "cyber-noir",
    buttonRadius: "full",
  },
};

export const DEFAULT_GALLERY_PHOTOS = [
  "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1517832606589-7629c3395909?w=600&auto=format&fit=crop&q=80",
];

export const DEFAULT_THEME: ThemeSettings = {
  primaryColor: "#5b31e6",
  backgroundColor: "#f4f2fb",
  fontFamily: "plus-jakarta-sans",
  themeMode: "light",
  layoutStyle: "panoramic",
  logoUrl: "",
  bannerUrl:
    "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=1200&auto=format&fit=crop&q=80",
  galleryUrls: DEFAULT_GALLERY_PHOTOS,
  bio: "Atención personalizada de primer nivel. Reservá tu cita en segundos.",
  slogan: "Tu estilo en las mejores manos",
  instagram: "",
  whatsapp: "",
  tiktok: "",
  facebook: "",
  googleMapsUrl: "",
  bookingNotice:
    "Tolerancia máxima de 10 minutos. Cancelaciones con al menos 2 horas de anticipación.",
  themePreset: "default",
  buttonRadius: "full",
  showStaffAvatars: true,
  showServiceDuration: true,
};

const HEX = /^#[0-9a-fA-F]{6}$/;

export function normalizeFont(fontRaw: unknown): string {
  if (typeof fontRaw !== "string") return DEFAULT_THEME.fontFamily;
  if (fontRaw === "sans") return "plus-jakarta-sans";
  if (fontRaw === "serif") return "playfair-display";
  if (fontRaw === "mono") return "space-grotesk";
  const found = GOOGLE_FONTS.find((f) => f.id === fontRaw);
  return found ? found.id : DEFAULT_THEME.fontFamily;
}

export function parseTheme(value: unknown): ThemeSettings {
  if (!value || typeof value !== "object") return DEFAULT_THEME;
  const raw = value as Partial<ThemeSettings>;

  const primaryColor = HEX.test(raw.primaryColor ?? "")
    ? raw.primaryColor!
    : DEFAULT_THEME.primaryColor;

  const backgroundColor = HEX.test(raw.backgroundColor ?? "")
    ? raw.backgroundColor!
    : DEFAULT_THEME.backgroundColor;

  const fontFamily = normalizeFont(raw.fontFamily);

  const themeMode: ThemeMode =
    raw.themeMode === "dark" || raw.themeMode === "light" || raw.themeMode === "system"
      ? raw.themeMode
      : raw.themePreset === "barber-dark" ||
        raw.themePreset === "obsidian-gold" ||
        raw.themePreset === "cyber-noir"
      ? "dark"
      : "light";

  const layoutStyle: LayoutStyle =
    raw.layoutStyle === "panoramic" ||
    raw.layoutStyle === "split-gallery" ||
    raw.layoutStyle === "floating-card" ||
    raw.layoutStyle === "minimal-editorial"
      ? raw.layoutStyle
      : DEFAULT_THEME.layoutStyle;

  const galleryUrls =
    Array.isArray(raw.galleryUrls) && raw.galleryUrls.length > 0
      ? raw.galleryUrls.filter((u): u is string => typeof u === "string" && u.trim().length > 0)
      : DEFAULT_GALLERY_PHOTOS;

  return {
    primaryColor,
    backgroundColor,
    fontFamily,
    themeMode,
    layoutStyle,
    logoUrl: typeof raw.logoUrl === "string" ? raw.logoUrl : "",
    bannerUrl: typeof raw.bannerUrl === "string" ? raw.bannerUrl : DEFAULT_THEME.bannerUrl,
    galleryUrls,
    bio: typeof raw.bio === "string" ? raw.bio : DEFAULT_THEME.bio,
    slogan: typeof raw.slogan === "string" ? raw.slogan : DEFAULT_THEME.slogan,
    instagram: typeof raw.instagram === "string" ? raw.instagram : "",
    whatsapp: typeof raw.whatsapp === "string" ? raw.whatsapp : "",
    tiktok: typeof raw.tiktok === "string" ? raw.tiktok : "",
    facebook: typeof raw.facebook === "string" ? raw.facebook : "",
    googleMapsUrl: typeof raw.googleMapsUrl === "string" ? raw.googleMapsUrl : "",
    bookingNotice:
      typeof raw.bookingNotice === "string" ? raw.bookingNotice : DEFAULT_THEME.bookingNotice,
    themePreset: isPreset(raw.themePreset) ? raw.themePreset : DEFAULT_THEME.themePreset,
    buttonRadius: isRadius(raw.buttonRadius) ? raw.buttonRadius : DEFAULT_THEME.buttonRadius,
    showStaffAvatars:
      typeof raw.showStaffAvatars === "boolean"
        ? raw.showStaffAvatars
        : DEFAULT_THEME.showStaffAvatars,
    showServiceDuration:
      typeof raw.showServiceDuration === "boolean"
        ? raw.showServiceDuration
        : DEFAULT_THEME.showServiceDuration,
  };
}

export function fontStack(fontId: string): string {
  const found = GOOGLE_FONTS.find((f) => f.id === fontId);
  return found ? found.cssFamily : '"Plus Jakarta Sans", sans-serif';
}

export function googleFontHref(fontId: string): string {
  const found = GOOGLE_FONTS.find((f) => f.id === fontId);
  const query = found ? found.query : GOOGLE_FONTS[0].query;
  return `https://fonts.googleapis.com/css2?${query}&display=swap`;
}

export function themeStyle(theme: ThemeSettings): CSSProperties {
  const isDark =
    theme.themeMode === "dark" ||
    theme.themePreset === "barber-dark" ||
    theme.themePreset === "obsidian-gold" ||
    theme.themePreset === "cyber-noir";

  return {
    ["--primary" as string]: theme.primaryColor,
    backgroundColor: theme.backgroundColor,
    fontFamily: fontStack(theme.fontFamily),
    color: isDark ? "#f8fafc" : "#0f172a",
    colorScheme: isDark ? "dark" : "light",
  };
}

function isPreset(value: unknown): value is ThemePreset {
  return (
    value === "default" ||
    value === "barber-dark" ||
    value === "rose-aesthetic" ||
    value === "emerald-spa" ||
    value === "modern-minimal" ||
    value === "obsidian-gold" ||
    value === "cyber-noir"
  );
}

function isRadius(value: unknown): value is ButtonRadius {
  return value === "full" || value === "lg" || value === "md" || value === "none";
}
