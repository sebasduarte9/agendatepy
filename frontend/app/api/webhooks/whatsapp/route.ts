import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { geminiPool } from "@/lib/ai/gemini-pool";
import { processCustomerMessageWithAI } from "@/lib/ai/whatsapp-agent";
import { sendWhatsAppMessage, sendWhatsAppPresence } from "@/lib/evolution";
import { conversationState } from "@/lib/ai/conversation-state";

/**
 * Helper para descargar Base64 de audios/imágenes desde Evolution API si no viene en el webhook
 */
async function getMediaBase64FromEvolution(messageData: any): Promise<string | null> {
  try {
    const baseUrl = process.env.EVOLUTION_API_URL || "http://localhost:8080";
    const apiKey = process.env.EVOLUTION_API_KEY || "agendatepy_whatsapp_secure_key_2026";
    const instance = process.env.EVOLUTION_INSTANCE || "agendatepy";

    const res = await fetch(`${baseUrl.replace(/\/$/, "")}/chat/getBase64FromMediaMessage/${encodeURIComponent(instance)}`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        apikey: apiKey,
      },
      body: JSON.stringify({ message: messageData, convertToMp4: false }),
      signal: AbortSignal.timeout(6000),
    });

    if (res.ok) {
      const json = await res.json();
      return json.base64 || null;
    }
  } catch (err: any) {
    console.warn("[Evolution Media] Error descargando base64:", err?.message);
  }
  return null;
}

/**
 * Webhook Receptor de Mensajería WhatsApp (Evolution API / Gateway)
 *
 * Características avanzadas:
 * - Detección de Notas de Voz / Audios (.ogg/.opus) y transcripción multimodal con Gemini Flash.
 * - Pausa Inteligente por Intervención Humana: Si el dueño escribe desde su celular, el bot se calla 30 min.
 * - Simulación de "Escribiendo..." y protección anti-baneo de Baileys.
 * - OCR Multimodal de Comprobantes Bancarios SIPAP (Itaú, Ueno, Continental, BNF).
 * - Memoria conversacional multi-turno.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const event = body.event || body.type;

    // Validación básica de payload
    if (!event) {
      return NextResponse.json({ status: "ignored", reason: "missing_event" }, { status: 200 });
    }

    // Manejo de conexión de instancia (QR escaneado / Conectado)
    if (event === "CONNECTION_UPDATE" || event === "connection.update") {
      const state = body.data?.state || body.state;
      console.log(`[WhatsApp Webhook] Estado de conexión actualizado: ${state}`);
      return NextResponse.json({ status: "success", event, state });
    }

    // Mensaje entrante / saliente de WhatsApp
    if (event === "MESSAGES_UPSERT" || event === "messages.upsert") {
      const data = body.data || body;
      const key = data.key || {};
      const fromMe = key.fromMe ?? false;
      const remoteJid = key.remoteJid || "";

      // Ignorar grupos de WhatsApp
      if (remoteJid.includes("@g.us")) {
        return NextResponse.json({ status: "ignored", reason: "group_message" });
      }

      // Normalizar número telefónico
      const rawDigits = (remoteJid.split("@")[0] || "").split(":")[0].replace(/\D/g, "");
      const senderPhone = rawDigits.startsWith("595")
        ? `+${rawDigits.slice(0, 3)} ${rawDigits.slice(3, 6)} ${rawDigits.slice(6, 9)} ${rawDigits.slice(9)}`
        : `+${rawDigits}`;

      // 1. Identificar el Tenant (Negocio) correspondiente
      const tenant = await prisma.tenant.findFirst({
        where: { status: "ACTIVE" },
        select: { id: true, name: true, slug: true, timezone: true, settings: true },
      });

      if (!tenant) {
        return NextResponse.json({ status: "error", message: "No active tenant found" }, { status: 404 });
      }

      const evoConfig = (tenant.settings as any)?.evolutionConfig || {};
      const isBotEnabled = evoConfig.autoBotEnabled !== false;

      if (!isBotEnabled) {
        console.log(`[WhatsApp Webhook] Bot desactivado por el dueño en ajustes de ${tenant.name}. Ignorando.`);
        return NextResponse.json({ status: "bot_disabled_by_tenant", senderPhone });
      }

      // 2. DETECCIÓN DE INTERVENCIÓN HUMANA (El dueño o recepcionista respondió desde su celular)
      if (fromMe) {
        conversationState.recordHumanIntervention(tenant.id, senderPhone);
        console.log(`[WhatsApp Webhook] Mensaje del dueño detectado para ${senderPhone}. Bot silenciado 30 min.`);
        return NextResponse.json({
          status: "human_intervention_recorded",
          senderPhone,
          pausedForMinutes: 30,
        });
      }

      // 3. VERIFICAR SI EL BOT ESTÁ EN SILENCIO PARA ESTE CLIENTE
      const pauseCheck = conversationState.isBotPaused(tenant.id, senderPhone);
      if (pauseCheck.paused) {
        console.log(`[WhatsApp Webhook] Bot en silencio para ${senderPhone} (${pauseCheck.minutesRemaining} min restantes por intervención humana).`);
        return NextResponse.json({
          status: "bot_paused_by_human",
          minutesRemaining: pauseCheck.minutesRemaining,
        });
      }

      const messageObj = data.message || {};
      const isImage = Boolean(messageObj.imageMessage);
      const isDocument = Boolean(messageObj.documentMessage);
      const isAudio = Boolean(messageObj.audioMessage);

      let textContent = (
        messageObj.conversation ||
        messageObj.extendedTextMessage?.text ||
        messageObj.imageMessage?.caption ||
        messageObj.documentMessage?.caption ||
        ""
      ).trim();

      console.log(`[WhatsApp Webhook] Mensaje de ${senderPhone}: "${textContent}" (audio: ${isAudio}, imagen: ${isImage})`);

      let replyText = "";

      // 4. SI ES UNA NOTA DE VOZ / AUDIO: Transcribir con Gemini Flash Multimodal
      if (isAudio) {
        console.log(`[WhatsApp Webhook] Nota de voz recibida de ${senderPhone}. Procesando audio con Gemini Flash...`);
        let base64Audio = messageObj.audioMessage?.directPath || data.base64;

        if (!base64Audio) {
          base64Audio = await getMediaBase64FromEvolution(data);
        }

        if (base64Audio) {
          const audioResult = await geminiPool.analyzeAudioVoiceNote(
            base64Audio,
            "audio/ogg",
            senderPhone
          );

          if (audioResult.transcription) {
            console.log(`[WhatsApp Webhook] Audio transcripto por IA: "${audioResult.transcription}"`);
            textContent = audioResult.transcription;
          }
        } else {
          replyText = "¡Hola! Recibí tu nota de voz pero no pude reproducirla. ¿Podrías escribirme qué horario o servicio te gustaría agendar?";
        }
      }

      // 5. SI ES UNA IMAGEN: Análisis de Comprobante SIPAP con Visión Multimodal
      if (isImage || isDocument) {
        let base64Image = messageObj.imageMessage?.jpegThumbnail || data.base64;

        if (!base64Image) {
          base64Image = await getMediaBase64FromEvolution(data);
        }

        if (base64Image) {
          try {
            console.log(`[WhatsApp Webhook] Analizando comprobante SIPAP multimodal con Gemini...`);
            const receiptData = await geminiPool.analyzeSipapReceipt(
              base64Image,
              "image/jpeg",
              senderPhone
            );

            if (receiptData.isSipap && receiptData.amount > 0) {
              const pendingAppointment = await prisma.appointment.findFirst({
                where: {
                  tenantId: tenant.id,
                  clientPhone: { contains: rawDigits.slice(-8) },
                  status: "PENDING_ACTION",
                },
                orderBy: { createdAt: "desc" },
              });

              if (pendingAppointment) {
                await prisma.appointment.update({
                  where: { id: pendingAppointment.id },
                  data: { status: "CONFIRMED" },
                });
              }

              replyText = `¡Muchas gracias! 🙌 Recibimos y validamos tu comprobante de transferencia:\n\n` +
                `🏦 *Banco:* ${receiptData.bank}\n` +
                `💰 *Monto:* ₲ ${receiptData.amount.toLocaleString("es-PY")}\n` +
                `🔖 *N° Operación:* ${receiptData.operationNumber}\n\n` +
                `✅ Tu turno ha quedado *CONFIRMADO*. ¡Te esperamos en ${tenant.name}!`;
            } else {
              replyText = `Recibimos tu imagen. Nuestro equipo revisará el comprobante a la brevedad para confirmar tu turno. ¡Muchas gracias!`;
            }
          } catch (err: any) {
            console.error("[WhatsApp Webhook] Error en OCR SIPAP:", err);
            replyText = `Recibimos tu comprobante. Lo verificaremos enseguida para confirmar tu turno.`;
          }
        }
      }
      // 6. SI ES TEXTO (O AUDIO TRANSCRIPTO): Ejecutar Agente con Memoria y Function Calling en Prisma
      else if (textContent) {
        const agentResult = await processCustomerMessageWithAI(textContent, {
          tenantId: tenant.id,
          tenantName: tenant.name,
          tenantSlug: tenant.slug,
          clientPhone: senderPhone,
          clientName: data.pushName || "Cliente WhatsApp",
        });

        replyText = agentResult.replyText;
      }

      // 7. RESPONDER AL CLIENTE CON "ESCRIBIENDO..." Y ENVÍO POR EVOLUTION API
      if (replyText && rawDigits) {
        try {
          await sendWhatsAppMessage(rawDigits, replyText, true);
          console.log(`[WhatsApp Webhook] Respuesta enviada exitosamente a ${rawDigits}`);
        } catch (evoError: any) {
          console.warn(`[WhatsApp Webhook] No se pudo enviar por Evolution API:`, evoError?.message);
        }
      }

      return NextResponse.json({
        status: "success",
        processed: true,
        senderPhone,
        replyText,
        timestamp: new Date().toISOString(),
      });
    }

    return NextResponse.json({ status: "success", event, ignored: true });
  } catch (error: any) {
    console.error("[WhatsApp Webhook] Error procesando webhook:", error);
    return NextResponse.json({ status: "error", message: error?.message || "Internal server error" }, { status: 500 });
  }
}

export async function GET() {
  const summary = geminiPool.getGlobalSummary();
  return NextResponse.json({
    service: "AgendatePY WhatsApp AI Webhook Gateway",
    features: {
      audioVoiceNotesSupport: true,
      humanInterventionPause: true,
      sipapMultimodalOcr: true,
      multiTurnMemory: true,
      typingPresenceSimulation: true,
    },
    cluster: {
      status: "active",
      keysCount: summary.totalKeys,
      activeKeys: summary.activeKeys,
      maxRpmCapacity: summary.maxRpm,
      dailyQuota: summary.maxRpd,
    },
    timestamp: new Date().toISOString(),
  });
}
