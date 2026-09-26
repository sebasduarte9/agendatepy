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
  | "cyber-noir"
  | "bento-modern"
  | "soft-evolution"
  | "organic-biophilic"
  | "neubrutalism-urban"
  | "champagne-velvet";

export type ButtonRadius = "full" | "lg" | "md" | "none";
export type ButtonStyleVariant = "solid" | "outline" | "glass" | "neubrutalism" | "glow";
export type ButtonShadowType = "none" | "soft" | "medium" | "hard" | "glow";
export type ButtonTextSizeType = "sm" | "base" | "lg";
export type TitleSizeType = "sm" | "base" | "lg" | "xl";
export type BackgroundEffectType = "none" | "mesh" | "dots" | "grid";
export type ButtonBorderWidth = "0px" | "1px" | "2px" | "3px";
export type ButtonHeight = "compact" | "medium" | "tall";
export type ButtonAlignment = "center" | "spread" | "left";
export type ButtonTextTransform = "none" | "uppercase" | "capitalize";
export type ButtonFontWeight = "normal" | "medium" | "semibold" | "bold" | "black";
export type SectionOrder = "links-first" | "booking-first" | "links-only";
export type AvatarShape = "circle" | "rounded" | "square";
export type AvatarBorder = "none" | "subtle" | "thick" | "glow";

export type CustomLinkIcon =
  | "whatsapp"
  | "maps"
  | "car"
  | "star"
  | "file-text"
  | "gift"
  | "phone"
  | "globe"
  | "instagram";

export type CustomLinkItem = {
  id: string;
  title: string;
  url: string;
  icon: CustomLinkIcon;
  style?: "default" | "highlight" | "outline";
  enabled: boolean;
};

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
  buttonStyle: ButtonStyleVariant;
  buttonShadow: ButtonShadowType;
  buttonTextSize: ButtonTextSizeType;
  buttonFontFamily: string;
  titleSize: TitleSizeType;
  backgroundEffect: BackgroundEffectType;
  customLinks: CustomLinkItem[];
  showStaffAvatars: boolean;
  showServiceDuration: boolean;
  buttonCustomBg: string;
  buttonCustomText: string;
  buttonCustomBorder: string;
  buttonBorderWidth: ButtonBorderWidth;
  buttonHeight: ButtonHeight;
  buttonAlignment: ButtonAlignment;
  buttonTextTransform: ButtonTextTransform;
  buttonFontWeight: ButtonFontWeight;
  sectionOrder: SectionOrder;
  avatarShape: AvatarShape;
  avatarBorder: AvatarBorder;
};

export type ThemePresetItem = {
  name: string;
  description: string;
  category: "General" | "Barberías" | "Salones & Estética" | "Spas & Wellness" | "Modern Tech" | "Urbano & Trend" | "Lujo & VIP";
  primaryColor: string;
  backgroundColor: string;
  fontFamily: string;
  themeMode: ThemeMode;
  layoutStyle: LayoutStyle;
  themePreset: ThemePreset;
  buttonRadius: ButtonRadius;
  bannerUrl?: string;
  badge?: string;
};

export const THEME_PRESETS: Record<ThemePreset, ThemePresetItem> = {
  default: {
    name: "Agendate Violet",
    description: "Equilibrado, moderno y vibrante en violeta eléctrico",
    category: "General",
    primaryColor: "#5b31e6",
    backgroundColor: "#f4f2fb",
    fontFamily: "plus-jakarta-sans",
    themeMode: "light",
    layoutStyle: "panoramic",
    themePreset: "default",
    buttonRadius: "full",
    badge: "Oficial",
  },
  "barber-dark": {
    name: "Barber Dark Luxe",
    description: "Negro obsidiana con acentos dorados y ámbar cálido",
    category: "Barberías",
    primaryColor: "#d97706",
    backgroundColor: "#090d16",
    fontFamily: "outfit",
    themeMode: "dark",
    layoutStyle: "split-gallery",
    themePreset: "barber-dark",
    buttonRadius: "lg",
    bannerUrl:
      "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=1200&auto=format&fit=crop&q=80",
    badge: "Más Elegido",
  },
  "bento-modern": {
    name: "Bento Box Moderno",
    description: "Estilo Apple & Stripe con tarjetas modulares, acento índigo y alto contraste",
    category: "Modern Tech",
    primaryColor: "#4f46e5",
    backgroundColor: "#f8fafc",
    fontFamily: "space-grotesk",
    themeMode: "light",
    layoutStyle: "split-gallery",
    themePreset: "bento-modern",
    buttonRadius: "lg",
    bannerUrl:
      "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=1200&auto=format&fit=crop&q=80",
    badge: "UI Pro Max",
  },
  "soft-evolution": {
    name: "Soft UI Evolution",
    description: "Blanco perla, acento lavanda y sombras difusas para salones de belleza y estética",
    category: "Salones & Estética",
    primaryColor: "#8b5cf6",
    backgroundColor: "#faf5ff",
    fontFamily: "playfair-display",
    themeMode: "light",
    layoutStyle: "floating-card",
    themePreset: "soft-evolution",
    buttonRadius: "full",
    bannerUrl:
      "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1200&auto=format&fit=crop&q=80",
    badge: "Tendencia",
  },
  "organic-biophilic": {
    name: "Organic Biophilic & Sage",
    description: "Verde salvia botánico, arena suave y serenidad zen para spas y bienestar",
    category: "Spas & Wellness",
    primaryColor: "#059669",
    backgroundColor: "#f7f5f0",
    fontFamily: "cormorant-garamond",
    themeMode: "light",
    layoutStyle: "split-gallery",
    themePreset: "organic-biophilic",
    buttonRadius: "full",
    bannerUrl:
      "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1200&auto=format&fit=crop&q=80",
    badge: "Eco Zen",
  },
  "neubrutalism-urban": {
    name: "Neubrutalism Urbano",
    description: "Bordes negros de 2px, sombras sólidas y amarillo de alto impacto para estudios urbanos",
    category: "Urbano & Trend",
    primaryColor: "#facc15",
    backgroundColor: "#fef9c3",
    fontFamily: "syne",
    themeMode: "light",
    layoutStyle: "panoramic",
    themePreset: "neubrutalism-urban",
    buttonRadius: "md",
    bannerUrl:
      "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=1200&auto=format&fit=crop&q=80",
    badge: "Vanguardia",
  },
  "champagne-velvet": {
    name: "Champagne & Velvet VIP",
    description: "Fondo ónix nocturno con acentos oro rosado metálico para experiencias de lujo",
    category: "Lujo & VIP",
    primaryColor: "#f59e0b",
    backgroundColor: "#0a0b10",
    fontFamily: "cinzel",
    themeMode: "dark",
    layoutStyle: "floating-card",
    themePreset: "champagne-velvet",
    buttonRadius: "lg",
    bannerUrl:
      "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=1200&auto=format&fit=crop&q=80",
    badge: "Exclusivo",
  },
  "obsidian-gold": {
    name: "Obsidian Gold VIP",
    description: "Fondo grafito puro con dorados metálicos de alto impacto",
    category: "Lujo & VIP",
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
    category: "Salones & Estética",
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
    category: "Spas & Wellness",
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
    category: "Modern Tech",
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
    category: "Urbano & Trend",
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

export const DEFAULT_CUSTOM_LINKS: CustomLinkItem[] = [
  {
    id: "link-waze",
    title: "Cómo llegar (Google Maps / Waze)",
    url: "https://maps.google.com",
    icon: "maps",
    enabled: true,
  },
  {
    id: "link-uber",
    title: "Pedir Uber directo al local",
    url: "https://m.uber.com",
    icon: "car",
    enabled: true,
  },
  {
    id: "link-reviews",
    title: "Dejar una reseña en Google (5 estrellas)",
    url: "https://g.page/review",
    icon: "star",
    enabled: false,
  },
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
  buttonStyle: "solid",
  buttonShadow: "soft",
  buttonTextSize: "base",
  buttonFontFamily: "inherit",
  titleSize: "lg",
  backgroundEffect: "none",
  customLinks: DEFAULT_CUSTOM_LINKS,
  showStaffAvatars: true,
  showServiceDuration: true,
  buttonCustomBg: "",
  buttonCustomText: "",
  buttonCustomBorder: "",
  buttonBorderWidth: "0px",
  buttonHeight: "medium",
  buttonAlignment: "spread",
  buttonTextTransform: "none",
  buttonFontWeight: "bold",
  sectionOrder: "booking-first",
  avatarShape: "circle",
  avatarBorder: "subtle",
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
        raw.themePreset === "cyber-noir" ||
        raw.themePreset === "champagne-velvet"
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

  const buttonStyle: ButtonStyleVariant =
    raw.buttonStyle === "solid" ||
    raw.buttonStyle === "outline" ||
    raw.buttonStyle === "glass" ||
    raw.buttonStyle === "neubrutalism" ||
    raw.buttonStyle === "glow"
      ? raw.buttonStyle
      : raw.themePreset === "neubrutalism-urban"
      ? "neubrutalism"
      : DEFAULT_THEME.buttonStyle;

  const buttonShadow: ButtonShadowType =
    raw.buttonShadow === "none" ||
    raw.buttonShadow === "soft" ||
    raw.buttonShadow === "medium" ||
    raw.buttonShadow === "hard" ||
    raw.buttonShadow === "glow"
      ? raw.buttonShadow
      : raw.themePreset === "neubrutalism-urban"
      ? "hard"
      : DEFAULT_THEME.buttonShadow;

  const buttonTextSize: ButtonTextSizeType =
    raw.buttonTextSize === "sm" || raw.buttonTextSize === "base" || raw.buttonTextSize === "lg"
      ? raw.buttonTextSize
      : DEFAULT_THEME.buttonTextSize;

  const buttonFontFamily =
    typeof raw.buttonFontFamily === "string" ? raw.buttonFontFamily : "inherit";

  const titleSize: TitleSizeType =
    raw.titleSize === "sm" || raw.titleSize === "base" || raw.titleSize === "lg" || raw.titleSize === "xl"
      ? raw.titleSize
      : DEFAULT_THEME.titleSize;

  const backgroundEffect: BackgroundEffectType =
    raw.backgroundEffect === "none" ||
    raw.backgroundEffect === "mesh" ||
    raw.backgroundEffect === "dots" ||
    raw.backgroundEffect === "grid"
      ? raw.backgroundEffect
      : DEFAULT_THEME.backgroundEffect;

  const customLinks: CustomLinkItem[] = Array.isArray(raw.customLinks)
    ? raw.customLinks.map((item: any, idx: number) => ({
        id: typeof item?.id === "string" ? item.id : `link-${idx}`,
        title: typeof item?.title === "string" ? item.title : "Enlace",
        url: typeof item?.url === "string" ? item.url : "#",
        icon: isCustomLinkIcon(item?.icon) ? item.icon : "globe",
        style: item?.style === "highlight" || item?.style === "outline" ? item.style : "default",
        enabled: typeof item?.enabled === "boolean" ? item.enabled : true,
      }))
    : DEFAULT_CUSTOM_LINKS;

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
    buttonStyle,
    buttonShadow,
    buttonTextSize,
    buttonFontFamily,
    titleSize,
    backgroundEffect,
    customLinks,
    showStaffAvatars:
      typeof raw.showStaffAvatars === "boolean"
        ? raw.showStaffAvatars
        : DEFAULT_THEME.showStaffAvatars,
    showServiceDuration:
      typeof raw.showServiceDuration === "boolean"
        ? raw.showServiceDuration
        : DEFAULT_THEME.showServiceDuration,
    buttonCustomBg: typeof raw.buttonCustomBg === "string" ? raw.buttonCustomBg : "",
    buttonCustomText: typeof raw.buttonCustomText === "string" ? raw.buttonCustomText : "",
    buttonCustomBorder: typeof raw.buttonCustomBorder === "string" ? raw.buttonCustomBorder : "",
    buttonBorderWidth:
      raw.buttonBorderWidth === "0px" ||
      raw.buttonBorderWidth === "1px" ||
      raw.buttonBorderWidth === "2px" ||
      raw.buttonBorderWidth === "3px"
        ? raw.buttonBorderWidth
        : DEFAULT_THEME.buttonBorderWidth,
    buttonHeight:
      raw.buttonHeight === "compact" || raw.buttonHeight === "medium" || raw.buttonHeight === "tall"
        ? raw.buttonHeight
        : DEFAULT_THEME.buttonHeight,
    buttonAlignment:
      raw.buttonAlignment === "center" || raw.buttonAlignment === "spread" || raw.buttonAlignment === "left"
        ? raw.buttonAlignment
        : DEFAULT_THEME.buttonAlignment,
    buttonTextTransform:
      raw.buttonTextTransform === "none" ||
      raw.buttonTextTransform === "uppercase" ||
      raw.buttonTextTransform === "capitalize"
        ? raw.buttonTextTransform
        : DEFAULT_THEME.buttonTextTransform,
    buttonFontWeight:
      raw.buttonFontWeight === "normal" ||
      raw.buttonFontWeight === "medium" ||
      raw.buttonFontWeight === "semibold" ||
      raw.buttonFontWeight === "bold" ||
      raw.buttonFontWeight === "black"
        ? raw.buttonFontWeight
        : DEFAULT_THEME.buttonFontWeight,
    sectionOrder:
      raw.sectionOrder === "links-first" ||
      raw.sectionOrder === "booking-first" ||
      raw.sectionOrder === "links-only"
        ? raw.sectionOrder
        : DEFAULT_THEME.sectionOrder,
    avatarShape:
      raw.avatarShape === "circle" || raw.avatarShape === "rounded" || raw.avatarShape === "square"
        ? raw.avatarShape
        : DEFAULT_THEME.avatarShape,
    avatarBorder:
      raw.avatarBorder === "none" ||
      raw.avatarBorder === "subtle" ||
      raw.avatarBorder === "thick" ||
      raw.avatarBorder === "glow"
        ? raw.avatarBorder
        : DEFAULT_THEME.avatarBorder,
  };
}

export function isCustomLinkIcon(val: unknown): val is CustomLinkIcon {
  return (
    val === "whatsapp" ||
    val === "maps" ||
    val === "car" ||
    val === "star" ||
    val === "file-text" ||
    val === "gift" ||
    val === "phone" ||
    val === "globe" ||
    val === "instagram"
  );
}

export function getButtonClasses(
  radius: ButtonRadius = "full",
  style: ButtonStyleVariant = "solid",
  shadow: ButtonShadowType = "soft",
  textSize: ButtonTextSizeType = "base"
): string {
  const rClass =
    radius === "none"
      ? "rounded-none"
      : radius === "md"
      ? "rounded-xl"
      : radius === "lg"
      ? "rounded-2xl"
      : "rounded-full";

  const sizeClass =
    textSize === "sm"
      ? "text-xs py-2 px-3.5"
      : textSize === "lg"
      ? "text-sm sm:text-base py-3 sm:py-3.5 px-6 font-bold"
      : "text-xs sm:text-sm py-2.5 px-5 font-semibold";

  const shadowClass =
    shadow === "none"
      ? "shadow-none"
      : shadow === "soft"
      ? "shadow-sm"
      : shadow === "medium"
      ? "shadow-md"
      : shadow === "hard"
      ? "shadow-[3px_3px_0px_0px_#0f172a] dark:shadow-[3px_3px_0px_0px_#f8fafc]"
      : "shadow-lg shadow-primary/35";

  let variantClass = "";
  switch (style) {
    case "outline":
      variantClass =
        "border-2 border-primary bg-transparent text-primary hover:bg-primary hover:text-white transition-all";
      break;
    case "glass":
      variantClass =
        "backdrop-blur-md bg-white/20 dark:bg-white/10 border border-white/40 text-current hover:bg-white/30 dark:hover:bg-white/20 transition-all";
      break;
    case "neubrutalism":
      variantClass =
        "border-2 border-slate-900 dark:border-white bg-primary text-white font-black uppercase tracking-wider active:translate-x-0.5 active:translate-y-0.5 transition-transform";
      break;
    case "glow":
      variantClass =
        "bg-primary text-white ring-2 ring-primary/40 hover:ring-primary/80 transition-all";
      break;
    case "solid":
    default:
      variantClass = "bg-primary text-white hover:opacity-95 transition-opacity";
      break;
  }

  return `${rClass} ${sizeClass} ${shadowClass} ${variantClass}`;
}

export function getCustomButtonClasses(theme: ThemeSettings): string {
  const rClass =
    theme.buttonRadius === "none"
      ? "rounded-none"
      : theme.buttonRadius === "md"
      ? "rounded-xl"
      : theme.buttonRadius === "lg"
      ? "rounded-2xl"
      : "rounded-full";

  const heightClass =
    theme.buttonHeight === "compact"
      ? "py-2 px-3.5"
      : theme.buttonHeight === "tall"
      ? "py-4 px-6"
      : "py-3 px-5";

  const alignClass =
    theme.buttonAlignment === "center"
      ? "justify-center text-center"
      : theme.buttonAlignment === "left"
      ? "justify-start text-left"
      : "justify-between text-left";

  const transformClass =
    theme.buttonTextTransform === "uppercase"
      ? "uppercase tracking-wider"
      : theme.buttonTextTransform === "capitalize"
      ? "capitalize"
      : "normal-case";

  const weightClass =
    theme.buttonFontWeight === "normal"
      ? "font-normal"
      : theme.buttonFontWeight === "medium"
      ? "font-medium"
      : theme.buttonFontWeight === "semibold"
      ? "font-semibold"
      : theme.buttonFontWeight === "black"
      ? "font-black"
      : "font-bold";

  const shadowClass =
    theme.buttonShadow === "none"
      ? "shadow-none"
      : theme.buttonShadow === "soft"
      ? "shadow-sm"
      : theme.buttonShadow === "medium"
      ? "shadow-md"
      : theme.buttonShadow === "hard"
      ? "shadow-[3px_3px_0px_0px_#0f172a] dark:shadow-[3px_3px_0px_0px_#f8fafc]"
      : "shadow-lg shadow-primary/35";

  return `${rClass} ${heightClass} ${alignClass} ${transformClass} ${weightClass} ${shadowClass}`;
}

export function getCustomButtonStyles(
  theme: ThemeSettings,
  isOutline = false,
  isHighlight = false
): CSSProperties {
  const customBg = theme.buttonCustomBg;
  const customText = theme.buttonCustomText;
  const customBorder = theme.buttonCustomBorder;
  const borderWidth = theme.buttonBorderWidth;

  const bg = isOutline || theme.buttonStyle === "outline"
    ? "transparent"
    : customBg || theme.primaryColor;

  const text = isOutline || theme.buttonStyle === "outline"
    ? customText || theme.primaryColor
    : customText || "#ffffff";

  const borderCol = customBorder || theme.primaryColor;
  const bWidth = borderWidth !== "0px" ? borderWidth : (isOutline || theme.buttonStyle === "outline" || theme.buttonStyle === "neubrutalism" ? "2px" : "0px");

  return {
    backgroundColor: bg,
    color: text,
    borderColor: borderCol,
    borderWidth: bWidth,
    borderStyle: bWidth !== "0px" ? "solid" : "none",
    fontFamily:
      theme.buttonFontFamily && theme.buttonFontFamily !== "inherit"
        ? fontStack(theme.buttonFontFamily)
        : fontStack(theme.fontFamily),
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
    theme.themePreset === "cyber-noir" ||
    theme.themePreset === "champagne-velvet";

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
    value === "cyber-noir" ||
    value === "bento-modern" ||
    value === "soft-evolution" ||
    value === "organic-biophilic" ||
    value === "neubrutalism-urban" ||
    value === "champagne-velvet"
  );
}

function isRadius(value: unknown): value is ButtonRadius {
  return value === "full" || value === "lg" || value === "md" || value === "none";
}
