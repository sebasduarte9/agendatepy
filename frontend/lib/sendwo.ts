import "server-only";

/**
 * Adaptador oficial para Sendwo WhatsApp Bot API (https://bot.sendwo.com).
 * Envía mensajes transaccionales de confirmación y recordatorio de turnos.
 */

export interface SendwoConfig {
  apiUrl?: string;
  apiKey?: string;
  botId?: string;
  webhookUrl?: string;
}

export interface SendMessageOptions {
  phone: string;
  message: string;
  config?: SendwoConfig;
}

export interface SendwoResponse {
  ok: boolean;
  status: number;
  data?: any;
  error?: string;
}

const DEFAULT_API_URL = process.env.SENDWO_API_URL || "https://bot.sendwo.com/api/v1";
const DEFAULT_API_KEY = process.env.SENDWO_API_KEY || "demo-sendwo-key-paraguay-2026";

/**
 * Envío de mensaje de texto vía Sendwo Bot API
 */
export async function sendWhatsAppViaSendwo({
  phone,
  message,
  config,
}: SendMessageOptions): Promise<SendwoResponse> {
  const cleanPhone = phone.replace(/\D/g, "");
  const apiUrl = (config?.apiUrl || DEFAULT_API_URL).replace(/\/$/, "");
  const apiKey = config?.apiKey || DEFAULT_API_KEY;

  try {
    const payload = {
      receiver: cleanPhone,
      message: {
        text: message,
      },
    };

    const res = await fetch(`${apiUrl}/whatsapp/message/send`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "X-Sendwo-Source": "AgendatePY-SaaS",
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      console.warn(`[Sendwo API] Código ${res.status}:`, errText);
      return {
        ok: false,
        status: res.status,
        error: `Error Sendwo (${res.status}): ${errText || "No se pudo entregar"}`,
      };
    }

    const data = await res.json().catch(() => ({}));
    return { ok: true, status: res.status, data };
  } catch (error) {
    console.error("[Sendwo API Exception]:", error);
    return {
      ok: false,
      status: 500,
      error: error instanceof Error ? error.message : "Error de conexión con Sendwo",
    };
  }
}

/**
 * Plantilla de confirmación automática de turno
 */
export function formatAppointmentConfirmationMessage({
  businessName,
  clientName,
  serviceName,
  staffName,
  dateFormatted,
  timeFormatted,
  price,
  bookingUrl,
}: {
  businessName: string;
  clientName: string;
  serviceName: string;
  staffName: string;
  dateFormatted: string;
  timeFormatted: string;
  price: number;
  bookingUrl?: string;
}): string {
  const priceFormatted = new Intl.NumberFormat("es-PY").format(price);
  return (
    `👋 *¡Hola ${clientName}! Tu turno está confirmado.*\n\n` +
    `📍 *${businessName}*\n` +
    `✂️ *Servicio:* ${serviceName}\n` +
    `💈 *Profesional:* ${staffName}\n` +
    `🗓 *Fecha:* ${dateFormatted}\n` +
    `⏰ *Hora:* ${timeFormatted} hs\n` +
    `💰 *Total:* Gs. ${priceFormatted}\n\n` +
    (bookingUrl ? `📱 Para consultar o reprogramar tu cita: ${bookingUrl}\n\n` : "") +
    `¡Te esperamos con gusto!`
  );
}
