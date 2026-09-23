import type { LayoutStyle, ThemeMode } from "@/lib/theme";

export type AvailableSlot = {
  start: string;
  end: string;
  staffIds: string[];
};

export type PublicService = {
  id: string;
  name: string;
  durationMinutes: number;
  price: number;
};

export type PublicTenant = {
  slug: string;
  name: string;
  timezone: string;
  maxAdvanceDays: number;
  logoUrl: string;
  bannerUrl?: string;
  galleryUrls?: string[];
  bio?: string;
  slogan?: string;
  instagram?: string;
  whatsapp?: string;
  tiktok?: string;
  facebook?: string;
  googleMapsUrl?: string;
  bookingNotice?: string;
  themePreset?: string;
  buttonRadius?: string;
  primaryColor?: string;
  backgroundColor?: string;
  fontFamily?: string;
  layoutStyle?: LayoutStyle;
  themeMode?: ThemeMode;
};

export const HOLD_MINUTES = 15;
