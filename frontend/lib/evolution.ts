import "server-only";

import { after } from "next/server";

/**
 * Evolution API v2 — envío de texto.
 *
 * Env:
 *   EVOLUTION_API_URL=https://evo.example.com
 *   EVOLUTION_API_KEY=
 *   EVOLUTION_INSTANCE=agendate
 *
 * Invocación al cambiar un turno
 * --------------------------------
 * No awaits esta función dentro del Server Action que confirma la reserva.
 * El INSERT y el EXCLUDE de Postgres tienen que commitear y responder.
 * El WhatsApp es un efecto lateral.
 *
 * En el request de Next, usar `dispatchWhatsAppAfterResponse`. Internamente
 * llama a `after()`: la respuesta HTTP sale ya, y el runtime espera el fetch
 * antes de congelar el isolate. Si Evolution falla, se loguea. No hay retry.
 *
 * Producción con reintentos: en la misma transacción del cambio de status,
 * insertar una fila outbox (appointment_id, phone, body, available_at).
 * Un worker (cola: Inngest, QStash o pg-boss) drena el outbox y llama
 * `sendWhatsAppMessage`. `after()` no sobrevive un crash entre el commit
 * y el fetch. La cola sí.
 *
 * No usar `void sendWhatsAppMessage(...)` pelado en serverless: el isolate
 * puede morir cuando termina la response y el mensaje no sale.
 */

const PHONE = /^\d{8,15}$/;
const TEXT_MAX = 4096;
const TIMEOUT_MS = 8_000;

export class EvolutionError extends Error {
  readonly status: number | null;

  constructor(message: string, status: number | null = null) {
    super(message);
    this.name = "EvolutionError";
    this.status = status;
  }
}

export async function sendWhatsAppPresence(
  phone: string,
  presence: "composing" | "recording" | "paused" = "composing",
  delayMs = 1500,
  instanceOverride?: string
): Promise<void> {
  try {
    const number = normalizePhone(phone);
    const baseUrl = requiredEnv("EVOLUTION_API_URL").replace(/\/$/, "");
    const apiKey = requiredEnv("EVOLUTION_API_KEY");
    const instance = instanceOverride || requiredEnv("EVOLUTION_INSTANCE");

    await fetch(`${baseUrl}/chat/sendPresence/${encodeURIComponent(instance)}`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        apikey: apiKey,
      },
      body: JSON.stringify({ number, presence, delay: delayMs }),
      signal: AbortSignal.timeout(5000),
      cache: "no-store",
    });
  } catch (err: any) {
    // Si falla presence no rompemos el envío del mensaje
    console.warn("[evolution] no se pudo emitir presence:", err?.message);
  }
}

export async function sendWhatsAppMessage(
  phone: string,
  message: string,
  simulateTyping = true,
  instanceOverride?: string
): Promise<void> {
  const number = normalizePhone(phone);
  const text = message.trim();
  if (!text || text.length > TEXT_MAX) {
    throw new EvolutionError("Mensaje vacío o mayor a 4096 caracteres");
  }

  // Simular "Escribiendo..." con cadencia humana balanceada (1.6s a 2.8s)
  if (simulateTyping) {
    const typingDuration = Math.min(Math.max(text.length * 25, 1600), 2800);
    void sendWhatsAppPresence(phone, "composing", typingDuration, instanceOverride);
    await new Promise((r) => setTimeout(r, typingDuration));
    void sendWhatsAppPresence(phone, "paused", 0, instanceOverride);
  }

  const baseUrl = requiredEnv("EVOLUTION_API_URL").replace(/\/$/, "");
  const apiKey = requiredEnv("EVOLUTION_API_KEY");
  const instance = instanceOverride || requiredEnv("EVOLUTION_INSTANCE");

  const response = await fetch(`${baseUrl}/message/sendText/${encodeURIComponent(instance)}`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      apikey: apiKey,
    },
    body: JSON.stringify({ number, text }),
    signal: AbortSignal.timeout(TIMEOUT_MS),
    cache: "no-store",
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new EvolutionError(
      `Evolution respondió ${response.status}${body ? `: ${body.slice(0, 300)}` : ""}`,
      response.status,
    );
  }
}

/**
 * Encolar el envío para después de la response. Llamar solo dentro de un
 * request (Server Action, Route Handler). El catch evita que un fallo de
 * WhatsApp rechace una reserva ya persistida.
 */
export function dispatchWhatsAppAfterResponse(phone: string, message: string): void {
  after(async () => {
    try {
      await sendWhatsAppMessage(phone, message);
    } catch (error) {
      const detail = error instanceof Error ? error.message : "error desconocido";
      console.error("[evolution] entrega fallida", { detail });
    }
  });
}

function normalizePhone(phone: string): string {
  if (phone.includes("@g.us")) {
    return phone;
  }
  const digits = phone.replace(/\D/g, "");
  if (!PHONE.test(digits)) {
    throw new EvolutionError("Teléfono inválido: se esperan 8 a 15 dígitos con código de país");
  }
  return digits;
}

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new EvolutionError(`Falta ${name}`);
  }
  return value;
}

/**
 * Busca dinámicamente el JID del grupo "Soporte Agendatepy" en Evolution API
 */
export async function findSupportGroupJid(instanceOverride?: string): Promise<string | null> {
  try {
    const baseUrl = requiredEnv("EVOLUTION_API_URL").replace(/\/$/, "");
    const apiKey = requiredEnv("EVOLUTION_API_KEY");
    const instance = instanceOverride || requiredEnv("EVOLUTION_INSTANCE");

    const res = await fetch(`${baseUrl}/group/fetchAllGroups/${encodeURIComponent(instance)}?getParticipants=false`, {
      method: "GET",
      headers: { apikey: apiKey },
      signal: AbortSignal.timeout(5000),
      cache: "no-store",
    });

    if (res.ok) {
      const groups = await res.json();
      if (Array.isArray(groups)) {
        const matched = groups.find((g: any) =>
          String(g.subject || "").toLowerCase().includes("soporte agendatepy") ||
          String(g.subject || "").toLowerCase().includes("soporte")
        );
        if (matched?.id) return matched.id;
      }
    }
  } catch (err: any) {
    console.warn("[evolution] Error buscando grupo de soporte:", err?.message);
  }
  // ID por defecto del grupo creado
  return "120363431983902070@g.us";
}

/**
 * Envía una alerta automática al grupo de WhatsApp "Soporte Agendatepy"
 * con el link directo para que el equipo de soporte atienda en el CRM.
 */
export async function notifySupportGroup(params: {
  clientName?: string;
  clientPhone: string;
  reason: string;
  lastMessage?: string;
}): Promise<boolean> {
  try {
    const groupJid = await findSupportGroupJid();
    if (!groupJid) {
      console.warn("[evolution] No se encontró el grupo de soporte.");
      return false;
    }

    const cleanDigits = params.clientPhone.replace(/\D/g, "");
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://agendatepy.com";
    const crmUrl = `${baseUrl}/admin/crm?phone=${cleanDigits}`;

    const text =
      `🚨 *SOLICITUD DE ASISTENCIA HUMANA*\n\n` +
      `👤 *Contacto:* ${params.clientName || "Usuario WhatsApp"}\n` +
      `📱 *Número:* ${params.clientPhone}\n` +
      `❓ *Motivo:* ${params.reason}\n` +
      (params.lastMessage ? `💬 *Último mensaje:* "${params.lastMessage}"\n\n` : `\n`) +
      `👉 *Atender en el CRM:* \n${crmUrl}`;

    await sendWhatsAppMessage(groupJid, text, false);
    console.log(`[evolution] Alerta de soporte enviada al grupo ${groupJid}`);
    return true;
  } catch (err: any) {
    console.error("[evolution] Error enviando alerta al grupo de soporte:", err);
    return false;
  }
}
