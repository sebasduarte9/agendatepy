/**
 * Configuración centralizada de WhatsApp para AgendatePY.
 * Permite separar:
 * - A) WhatsApp comercial/soporte de la plataforma AgendatePY.
 * - B) WhatsApp de cada negocio (dinámico desde tenant.settings.whatsappPhone).
 * - C) WhatsApp de demostración.
 */

export const AGENDATEPY_COMMERCIAL_PHONE =
  process.env.NEXT_PUBLIC_WHATSAPP_SALES ||
  process.env.NEXT_PUBLIC_WHATSAPP_SUPPORT ||
  "595974244669";

export const AGENDATEPY_DEMO_PHONE = "595981700800";

export function getCommercialWhatsAppUrl(message?: string): string {
  const cleanPhone = AGENDATEPY_COMMERCIAL_PHONE.replace(/\D/g, "");
  if (!message) return `https://wa.me/${cleanPhone}`;
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}
