/** Forma conocida de tenants.settings. Las claves son opcionales: el JSON puede omitirlas. */
export type TenantSettings = {
  whatsappPhone?: string;
  slotStepMinutes?: number;
  maxAdvanceDays?: number;
  chatwootWebsiteToken?: string;
};

const CHATWOOT_TOKEN = /^[A-Za-z0-9_-]{8,128}$/;

/** Inbox de Chatwoot del local. Vive en tenants.settings.chatwootWebsiteToken. */
export function chatwootWebsiteTokenFromSettings(settings: unknown): string | null {
  if (!settings || typeof settings !== "object" || !("chatwootWebsiteToken" in settings)) {
    return null;
  }
  const value = (settings as TenantSettings).chatwootWebsiteToken;
  if (typeof value !== "string" || !CHATWOOT_TOKEN.test(value)) return null;
  return value;
}

/** Número de WhatsApp del local. Vive en tenants.settings.whatsappPhone (dígitos, con código de país). */
export function whatsappPhoneFromSettings(settings: unknown): string | null {
  if (!settings || typeof settings !== "object" || !("whatsappPhone" in settings)) {
    return null;
  }
  const value = (settings as { whatsappPhone: unknown }).whatsappPhone;
  if (typeof value !== "string") return null;
  const digits = value.replace(/\D/g, "");
  if (digits.length < 8 || digits.length > 15) return null;
  return digits;
}

export function maxAdvanceDaysFromSettings(settings: unknown): number {
  if (!settings || typeof settings !== "object" || !("maxAdvanceDays" in settings)) {
    return 30;
  }
  const value = (settings as { maxAdvanceDays: unknown }).maxAdvanceDays;
  if (typeof value !== "number" || !Number.isInteger(value) || value < 1 || value > 90) {
    return 30;
  }
  return value;
}
