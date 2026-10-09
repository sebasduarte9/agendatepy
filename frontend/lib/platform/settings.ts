import "server-only";

import { prisma } from "@/lib/db";

export type WhatsAppVerificationConfig = {
  enabled: boolean;
  /** Número que envía los códigos, con código de país (ej: 595981123456). */
  senderPhone: string;
  /** Instancia de Evolution conectada a ese número. Vacío = EVOLUTION_INSTANCE. */
  instance: string;
};

const WHATSAPP_VERIFICATION_KEY = "whatsapp_verification";

const DEFAULT_CONFIG: WhatsAppVerificationConfig = {
  enabled: false,
  senderPhone: "",
  instance: "",
};

export async function getWhatsAppVerificationConfig(): Promise<WhatsAppVerificationConfig> {
  try {
    const row = await prisma.platformSetting.findUnique({ where: { key: WHATSAPP_VERIFICATION_KEY } });
    const raw = (row?.value ?? {}) as Partial<WhatsAppVerificationConfig>;
    return {
      enabled: raw.enabled === true,
      senderPhone: typeof raw.senderPhone === "string" ? raw.senderPhone : "",
      instance: typeof raw.instance === "string" ? raw.instance : "",
    };
  } catch {
    return DEFAULT_CONFIG;
  }
}

export async function saveWhatsAppVerificationConfig(config: WhatsAppVerificationConfig) {
  await prisma.platformSetting.upsert({
    where: { key: WHATSAPP_VERIFICATION_KEY },
    create: { key: WHATSAPP_VERIFICATION_KEY, value: config },
    update: { value: config },
  });
}

/** La verificación se exige solo si está activa y tiene un número cargado. */
export function isVerificationActive(config: WhatsAppVerificationConfig) {
  return config.enabled && /^\d{8,15}$/.test(config.senderPhone);
}
