import type {
  LayoutStyle,
  ThemeMode,
  ButtonRadius,
  ButtonStyleVariant,
  ButtonShadowType,
  ButtonTextSizeType,
  TitleSizeType,
  BackgroundEffectType,
  ButtonBorderWidth,
  ButtonHeight,
  ButtonAlignment,
  ButtonTextTransform,
  ButtonFontWeight,
  SectionOrder,
  AvatarShape,
  AvatarBorder,
  CustomLinkItem,
} from "@/lib/theme";

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
  category?: string;
  hasPromo?: boolean;
  promoPrice?: number;
  promoBadge?: string;
  promoDisplayType?: "percentage" | "amount";
  promoType?: "time" | "quantity" | "both";
  promoLimitQuantity?: number;
  promoLimitHours?: number;
  requirePrepayment?: boolean;
  prepaymentType?: "deposit" | "full";
  prepaymentAmount?: number;
  prepaymentMethod?: "sipap" | "transferencia" | "qr" | "cualquiera";
  prepaymentInstructions?: string;
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
  buttonRadius?: ButtonRadius;
  buttonStyle?: ButtonStyleVariant;
  buttonShadow?: ButtonShadowType;
  buttonTextSize?: ButtonTextSizeType;
  buttonFontFamily?: string;
  titleSize?: TitleSizeType;
  backgroundEffect?: BackgroundEffectType;
  customLinks?: CustomLinkItem[];
  primaryColor?: string;
  backgroundColor?: string;
  fontFamily?: string;
  layoutStyle?: LayoutStyle;
  themeMode?: ThemeMode;
  buttonCustomBg?: string;
  buttonCustomText?: string;
  buttonCustomBorder?: string;
  buttonBorderWidth?: ButtonBorderWidth;
  buttonHeight?: ButtonHeight;
  buttonAlignment?: ButtonAlignment;
  buttonTextTransform?: ButtonTextTransform;
  buttonFontWeight?: ButtonFontWeight;
  sectionOrder?: SectionOrder;
  avatarShape?: AvatarShape;
  avatarBorder?: AvatarBorder;
};

export const HOLD_MINUTES = 15;
