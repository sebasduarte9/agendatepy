import "server-only";

import crypto from "node:crypto";
import { prisma } from "@/lib/db";
import { sendWhatsAppMessage } from "@/lib/evolution";
import {
  getWhatsAppVerificationConfig,
  isVerificationActive,
} from "@/lib/platform/settings";

const CODE_TTL_MS = 10 * 60 * 1000;
const RESEND_COOLDOWN_MS = 45 * 1000;
const MAX_SENDS_PER_HOUR = 4;
const MAX_ATTEMPTS = 5;
/** Ventana en la que un número verificado sirve para crear el negocio. */
const VERIFIED_VALID_MS = 60 * 60 * 1000;
const VERIFIED_MARKER = "VERIFIED";

const SECRET = process.env.OTP_SECRET || process.env.SESSION_SECRET || "agendatepy-dev-only-otp-secret";

export type RequestCodeResult =
  | { ok: true; resendInSeconds: number; devCode?: string }
  | { ok: false; error: string; retryInSeconds?: number };

export type VerifyCodeResult = { ok: true } | { ok: false; error: string };

/** Normaliza a dígitos con código de país 595. Devuelve null si no es un celular paraguayo. */
export function normalizeParaguayMobile(input: string): string | null {
  let digits = input.replace(/\D/g, "");
  if (digits.startsWith("595")) digits = digits.slice(3);
  if (digits.startsWith("0")) digits = digits.slice(1);
  return /^9\d{8}$/.test(digits) ? `595${digits}` : null;
}

function identifierFor(phone: string) {
  return `wa:${phone}`;
}

function hashCode(phone: string, code: string) {
  return crypto.createHmac("sha256", SECRET).update(`${phone}:${code}`).digest("hex");
}

function safeEqual(a: string, b: string) {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && crypto.timingSafeEqual(ab, bb);
}

export async function isPhoneVerificationRequired() {
  return isVerificationActive(await getWhatsAppVerificationConfig());
}

export async function requestPhoneCode(rawPhone: string): Promise<RequestCodeResult> {
  const phone = normalizeParaguayMobile(rawPhone);
  if (!phone) return { ok: false, error: "Revisá el número. Debe tener 9 dígitos, por ejemplo 981 123 456." };

  const config = await getWhatsAppVerificationConfig();
  if (!isVerificationActive(config)) {
    return { ok: false, error: "La verificación por WhatsApp no está disponible en este momento." };
  }

  const identifier = identifierFor(phone);
  const now = Date.now();

  const recent = await prisma.otpCode.findMany({
    where: {
      email: identifier,
      code: { not: VERIFIED_MARKER },
      createdAt: { gte: new Date(now - 60 * 60 * 1000) },
    },
    orderBy: { createdAt: "desc" },
    select: { createdAt: true },
  });

  const last = recent[0];
  if (last && now - last.createdAt.getTime() < RESEND_COOLDOWN_MS) {
    const wait = Math.ceil((RESEND_COOLDOWN_MS - (now - last.createdAt.getTime())) / 1000);
    return { ok: false, error: `Esperá ${wait} segundos para pedir otro código.`, retryInSeconds: wait };
  }
  if (recent.length >= MAX_SENDS_PER_HOUR) {
    return { ok: false, error: "Pediste muchos códigos seguidos. Probá de nuevo en una hora." };
  }

  const code = crypto.randomInt(0, 1_000_000).toString().padStart(6, "0");

  await prisma.$transaction([
    prisma.otpCode.updateMany({
      where: { email: identifier, used: false },
      data: { used: true },
    }),
    prisma.otpCode.create({
      data: {
        email: identifier,
        code: hashCode(phone, code),
        expiresAt: new Date(now + CODE_TTL_MS),
      },
    }),
  ]);

  const message =
    `Tu código de AgendatePY es: *${code}*\n\n` +
    "Vence en 10 minutos. No lo compartas con nadie.";

  try {
    await sendWhatsAppMessage(phone, message, false, config.instance || undefined);
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[phone-otp] envío fallido en desarrollo, se devuelve el código", error);
      return { ok: true, resendInSeconds: RESEND_COOLDOWN_MS / 1000, devCode: code };
    }
    console.error("[phone-otp] no se pudo enviar el código", error);
    return { ok: false, error: "No pudimos enviarte el código. Revisá el número o probá en un minuto." };
  }

  return {
    ok: true,
    resendInSeconds: RESEND_COOLDOWN_MS / 1000,
    devCode: process.env.NODE_ENV !== "production" ? code : undefined,
  };
}

export async function verifyPhoneCode(rawPhone: string, rawCode: string): Promise<VerifyCodeResult> {
  const phone = normalizeParaguayMobile(rawPhone);
  const code = rawCode.replace(/\D/g, "");
  if (!phone) return { ok: false, error: "Revisá el número de WhatsApp." };
  if (code.length !== 6) return { ok: false, error: "El código tiene 6 números." };

  const identifier = identifierFor(phone);
  const pending = await prisma.otpCode.findFirst({
    where: { email: identifier, used: false },
    orderBy: { createdAt: "desc" },
  });

  if (!pending || pending.expiresAt.getTime() < Date.now()) {
    return { ok: false, error: "El código venció. Pedí uno nuevo." };
  }
  if (pending.attempts >= MAX_ATTEMPTS) {
    return { ok: false, error: "Demasiados intentos. Pedí un código nuevo." };
  }

  if (!safeEqual(pending.code, hashCode(phone, code))) {
    const attempts = pending.attempts + 1;
    await prisma.otpCode.update({
      where: { id: pending.id },
      data: { attempts, used: attempts >= MAX_ATTEMPTS },
    });
    const left = MAX_ATTEMPTS - attempts;
    return {
      ok: false,
      error: left > 0 ? `Código incorrecto. Te quedan ${left} intentos.` : "Demasiados intentos. Pedí un código nuevo.",
    };
  }

  await prisma.otpCode.update({
    where: { id: pending.id },
    data: { used: true, code: VERIFIED_MARKER },
  });
  return { ok: true };
}

/** true si el número se verificó con código en la última hora. */
export async function isPhoneRecentlyVerified(rawPhone: string) {
  const phone = normalizeParaguayMobile(rawPhone);
  if (!phone) return false;
  const verified = await prisma.otpCode.findFirst({
    where: {
      email: identifierFor(phone),
      code: VERIFIED_MARKER,
      createdAt: { gte: new Date(Date.now() - VERIFIED_VALID_MS) },
    },
    select: { id: true },
  });
  return Boolean(verified);
}
