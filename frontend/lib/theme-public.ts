import type { ThemeSettings } from "@/lib/theme";
import type { PublicTenant } from "@/lib/scheduling/types";

/**
 * Builds the props the public booking page receives from a theme. Shared by the
 * real page and the dashboard's desktop preview so both always render the same.
 */
export function themeToPublicTenant(
  theme: ThemeSettings,
  base: { slug: string; name: string; timezone: string; maxAdvanceDays: number }
): PublicTenant {
  return {
    ...base,
    logoUrl: theme.logoUrl,
    bannerUrl: theme.bannerUrl,
    bannerPosY: theme.bannerPosY,
    galleryUrls: theme.galleryUrls,
    bio: theme.bio,
    slogan: theme.slogan,
    instagram: theme.instagram,
    whatsapp: theme.whatsapp,
    tiktok: theme.tiktok,
    facebook: theme.facebook,
    googleMapsUrl: theme.googleMapsUrl,
    bookingNotice: theme.bookingNotice,
    themePreset: theme.themePreset,
    buttonRadius: theme.buttonRadius,
    buttonStyle: theme.buttonStyle,
    buttonShadow: theme.buttonShadow,
    buttonTextSize: theme.buttonTextSize,
    buttonFontFamily: theme.buttonFontFamily,
    titleSize: theme.titleSize,
    backgroundEffect: theme.backgroundEffect,
    customLinks: theme.customLinks,
    primaryColor: theme.primaryColor,
    backgroundColor: theme.backgroundColor,
    fontFamily: theme.fontFamily,
    layoutStyle: theme.layoutStyle,
    themeMode: theme.themeMode,
    buttonCustomBg: theme.buttonCustomBg,
    buttonCustomText: theme.buttonCustomText,
    buttonCustomBorder: theme.buttonCustomBorder,
    buttonBorderWidth: theme.buttonBorderWidth,
    buttonHeight: theme.buttonHeight,
    buttonAlignment: theme.buttonAlignment,
    buttonTextTransform: theme.buttonTextTransform,
    buttonFontWeight: theme.buttonFontWeight,
    sectionOrder: theme.sectionOrder,
    avatarShape: theme.avatarShape,
    avatarBorder: theme.avatarBorder,
  };
}
