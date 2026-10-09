"use server";

import { getSession } from "@/lib/auth/session";
import {
  getWhatsAppVerificationConfig,
  saveWhatsAppVerificationConfig,
  type WhatsAppVerificationConfig,
} from "@/lib/platform/settings";
import { sendWhatsAppMessage } from "@/lib/evolution";
import { normalizeParaguayMobile, requestPhoneCode, verifyPhoneCode } from "./phone-otp";

export async function requestWhatsAppCodeAction(phone: string) {
  return requestPhoneCode(phone);
}

export async function verifyWhatsAppCodeAction(phone: string, code: string) {
  return verifyPhoneCode(phone, code);
}

async function requireSuperadmin() {
  const session = await getSession();
  return session?.role === "SUPERADMIN";
}

export async function getWhatsAppVerificationSettingsAction(): Promise<
  { ok: true; config: WhatsAppVerificationConfig } | { ok: false; error: string }
> {
  if (!(await requireSuperadmin())) return { ok: false, error: "No autorizado." };
  return { ok: true, config: await getWhatsAppVerificationConfig() };
}

export async function saveWhatsAppVerificationSettingsAction(input: WhatsAppVerificationConfig) {
  if (!(await requireSuperadmin())) return { ok: false as const, error: "No autorizado." };

  let senderPhone = input.senderPhone.replace(/\D/g, "");
  if (senderPhone.startsWith("0")) senderPhone = `595${senderPhone.slice(1)}`;
  if (senderPhone && !senderPhone.startsWith("595")) senderPhone = `595${senderPhone}`;
  if (senderPhone && !/^5959\d{8}$/.test(senderPhone)) {
    return { ok: false as const, error: "El número debe ser un celular paraguayo, por ejemplo 0981 123 456." };
  }
  if (input.enabled && !senderPhone) {
    return { ok: false as const, error: "Cargá el número antes de activar la verificación." };
  }

  const instance = input.instance.trim().slice(0, 80);
  if (instance && !/^[\w.-]+$/.test(instance)) {
    return { ok: false as const, error: "El nombre de la instancia solo admite letras, números, guiones y puntos." };
  }

  const config: WhatsAppVerificationConfig = { enabled: input.enabled, senderPhone, instance };
  await saveWhatsAppVerificationConfig(config);
  return { ok: true as const, config };
}

export async function sendWhatsAppVerificationTestAction(rawPhone: string) {
  if (!(await requireSuperadmin())) return { ok: false as const, error: "No autorizado." };
  const phone = normalizeParaguayMobile(rawPhone);
  if (!phone) return { ok: false as const, error: "Escribí un celular paraguayo válido." };

  const config = await getWhatsAppVerificationConfig();
  try {
    await sendWhatsAppMessage(
      phone,
      "Prueba de AgendatePY: así les van a llegar los códigos de verificación a los negocios nuevos.",
      false,
      config.instance || undefined
    );
    return { ok: true as const };
  } catch (error) {
    console.error("[verification] prueba fallida", error);
    return {
      ok: false as const,
      error: "No se pudo enviar. Revisá que la instancia esté conectada y que las variables de Evolution estén cargadas.",
    };
  }
}
