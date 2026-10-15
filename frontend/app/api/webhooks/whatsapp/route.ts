import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { geminiPool } from "@/lib/ai/gemini-pool";
import { processCustomerMessageWithAI } from "@/lib/ai/whatsapp-agent";
import { processAgendatePlatformMessage } from "@/lib/ai/agendate-platform-agent";
import { sendWhatsAppMessage } from "@/lib/evolution";
import { conversationState } from "@/lib/ai/conversation-state";
import { recordCrmMessage } from "@/lib/crm/crm-store";
import { recordAiInteraction, markInteractionHumanIntervened } from "@/lib/ai/ai-learning-store";

/**
 * Helper para descargar Base64 de audios/imágenes desde Evolution API si no viene en el webhook
 */
async function getMediaBase64FromEvolution(data: any, instanceOverride?: string): Promise<string | null> {
  try {
    const baseUrl = process.env.EVOLUTION_API_URL || "http://localhost:8081";
    const apiKey = process.env.EVOLUTION_API_KEY || "agendatepy_whatsapp_secure_key_2026";
    const instance = instanceOverride || process.env.EVOLUTION_INSTANCE || "agendatepy";

    // Formato requerido por Evolution API v2
    const payload = {
      message: {
        key: data.key,
        message: data.message || data,
      },
      convertToMp4: false,
    };

    const res = await fetch(`${baseUrl.replace(/\/$/, "")}/chat/getBase64FromMediaMessage/${encodeURIComponent(instance)}`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        apikey: apiKey,
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(8000),
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
 * - OCR Multimodal de Comprobantes de Transferencias Bancarias (Itaú, Ueno, Continental, BNF).
 * - Memoria conversacional multi-turno.
 */
// Caché en memoria para deduplicación estricta de mensajes de WhatsApp (evita doble respuesta por retries de Evolution)
const processedMessageIds = new Map<string, number>();

function isDuplicateMessage(messageId?: string): boolean {
  if (!messageId) return false;
  const now = Date.now();

  // Limpiar mensajes procesados hace más de 5 minutos
  for (const [id, time] of processedMessageIds.entries()) {
    if (now - time > 5 * 60 * 1000) {
      processedMessageIds.delete(id);
    }
  }

  if (processedMessageIds.has(messageId)) {
    return true;
  }

  processedMessageIds.set(messageId, now);
  return false;
}

function isWithinTenantBusinessHours(
  settings: Record<string, any>,
  timezone: string,
  now = new Date(),
) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  const weekday = values.weekday;
  if (weekday === "Sun" && !settings.sundayOpen) return false;

  const openingTime = String(settings.openingTime || "08:00");
  const closingTime = String(
    weekday === "Sat" || weekday === "Sun"
      ? settings.weekendClosing || settings.closingTime || "20:00"
      : settings.closingTime || "20:00",
  );
  const toMinutes = (time: string) => {
    const [hours, minutes] = time.split(":").map(Number);
    return Number.isFinite(hours) && Number.isFinite(minutes) ? hours * 60 + minutes : null;
  };
  const opensAt = toMinutes(openingTime);
  const closesAt = toMinutes(closingTime);
  const currentTime = Number(values.hour) * 60 + Number(values.minute);
  if (opensAt === null || closesAt === null) return true;

  return closesAt > opensAt
    ? currentTime >= opensAt && currentTime < closesAt
    : currentTime >= opensAt || currentTime < closesAt;
}

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
      const messageId = key.id || "";

      // Deduplicación estricta: evitar procesar dos veces el mismo mensaje si Evolution reintenta
      if (messageId && isDuplicateMessage(messageId)) {
        console.log(`[WhatsApp Webhook] Mensaje duplicado bloqueado exitosamente (id: ${messageId})`);
        return NextResponse.json({ status: "ignored", reason: "duplicate_message", messageId });
      }

      // Ignorar grupos de WhatsApp
      if (remoteJid.includes("@g.us")) {
        return NextResponse.json({ status: "ignored", reason: "group_message" });
      }

      // Normalizar número telefónico
      const rawDigits = (remoteJid.split("@")[0] || "").split(":")[0].replace(/\D/g, "");
      const senderPhone = rawDigits.startsWith("595")
        ? `+${rawDigits.slice(0, 3)} ${rawDigits.slice(3, 6)} ${rawDigits.slice(6, 9)} ${rawDigits.slice(9)}`
        : `+${rawDigits}`;

      // 1. Identificar si es para la Plataforma AgendatePY o un Negocio específico
      const incomingInstance = body.instance || data.instance || "";
      const platformInstance = process.env.EVOLUTION_INSTANCE || "agendatepy";
      const isPlatformBot = !incomingInstance || incomingInstance === platformInstance;

      let tenant: any = null;
      if (!isPlatformBot) {
        tenant = await prisma.tenant.findFirst({
          where: {
            status: "ACTIVE",
            settings: {
              path: ["evolutionConfig", "instance"],
              equals: incomingInstance,
            },
          },
          select: { id: true, name: true, slug: true, timezone: true, settings: true },
        });
      }

      const tenantSettings = (tenant?.settings as Record<string, any>) || {};
      const tenantEvolutionConfig = tenantSettings.evolutionConfig || {};
      const tenantWhatsAppInstance =
        (typeof tenantEvolutionConfig.instance === "string" && tenantEvolutionConfig.instance) ||
        (tenant ? incomingInstance || undefined : undefined);

      // Si no es un tenant particular, usar el identificador de la plataforma
      const sessionTenantKey = tenant ? tenant.id : "agendatepy-official";

      // 2. DETECCIÓN DE INTERVENCIÓN HUMANA (El administrador o soporte respondió desde el celular)
      if (fromMe) {
        conversationState.recordHumanIntervention(sessionTenantKey, senderPhone);
        await markInteractionHumanIntervened(senderPhone);
        const messageObj = data.message || {};
        const opText = (
          messageObj.conversation ||
          messageObj.extendedTextMessage?.text ||
          ""
        ).trim();
        if (opText) {
          await recordCrmMessage({
            phone: senderPhone,
            sender: "agent",
            text: opText,
          });
        }
        console.log(`[WhatsApp Webhook] Mensaje del operador registrado en CRM y Learning Hub para ${senderPhone}. Bot silenciado 30 min.`);
        return NextResponse.json({
          status: "human_intervention_recorded",
          senderPhone,
          pausedForMinutes: 30,
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

      let mediaType: "audio" | "image" | undefined = undefined;
      let mediaUrl: string | undefined = undefined;

      // 3. SI ES NOTA DE VOZ: Descargar base64, transcribir y habilitar audio player en CRM
      if (isAudio) {
        mediaType = "audio";
        console.log(`[WhatsApp Webhook] Nota de voz recibida de ${senderPhone}. Procesando...`);
        let base64Audio = (data.base64 && typeof data.base64 === "string" && data.base64.length > 50) ? data.base64 : null;
        if (!base64Audio) {
          base64Audio = await getMediaBase64FromEvolution(data, incomingInstance);
        }

        if (base64Audio) {
          const cleanBase64 = base64Audio.replace(/^data:audio\/[a-zA-Z0-9.\-_+]+;base64,/, "");
          const mime = (messageObj.audioMessage?.mimetype || "audio/ogg").split(";")[0].trim();
          mediaUrl = `data:${mime};base64,${cleanBase64}`;

          const audioResult = await geminiPool.analyzeAudioVoiceNote(
            cleanBase64,
            mime,
            senderPhone
          );

          if (audioResult.transcription) {
            console.log(`[WhatsApp Webhook] Audio transcripto por IA: "${audioResult.transcription}"`);
            textContent = audioResult.transcription;
          }
        }

        if (!textContent) {
          textContent = "Nota de voz recibida";
        }
      }

      // 4. SI ES IMAGEN O DOCUMENTO: Descargar preview para CRM
      let base64ImageForOcr: string | null = null;
      if (isImage || isDocument) {
        mediaType = "image";
        let base64Image = messageObj.imageMessage?.jpegThumbnail || data.base64;
        if (!base64Image) {
          base64Image = await getMediaBase64FromEvolution(data, incomingInstance);
        }
        if (base64Image) {
          const cleanBase64 = base64Image.replace(/^data:image\/[a-zA-Z0-9.\-_+]+;base64,/, "");
          mediaUrl = `data:image/jpeg;base64,${cleanBase64}`;
          base64ImageForOcr = cleanBase64;
        }
      }

      // 5. REGISTRAR SIEMPRE EN EL CRM (Permite escuchar audios y ver fotos aun en soporte humano)
      const displayPrompt = isAudio
        ? `🎤 ${textContent}`
        : (isImage ? `📷 Imagen ${textContent ? `- ${textContent}` : ""}`.trim() : textContent);

      if (displayPrompt || mediaUrl) {
        await recordCrmMessage({
          phone: senderPhone,
          name: data.pushName,
          sender: "client",
          text: displayPrompt || (isAudio ? "🎤 Nota de voz" : "📷 Imagen"),
          mediaType,
          mediaUrl,
        });
      }

      // 6. VERIFICAR SI EL BOT ESTÁ EN SILENCIO (POR INTERVENCIÓN HUMANA)
      const pauseCheck = conversationState.isBotPaused(sessionTenantKey, senderPhone);
      if (pauseCheck.paused) {
        console.log(`[WhatsApp Webhook] Mensaje guardado en CRM pero bot silenciado para ${senderPhone} (${pauseCheck.minutesRemaining} min restantes por intervención humana).`);
        return NextResponse.json({
          status: "saved_to_crm_bot_paused",
          senderPhone,
          minutesRemaining: pauseCheck.minutesRemaining,
        });
      }

      if (tenant && tenantEvolutionConfig.autoBotEnabled === false) {
        return NextResponse.json({
          status: "saved_to_crm_assistant_paused",
          senderPhone,
        });
      }

      if (
        tenant &&
        tenantEvolutionConfig.serviceScheduleMode === "business_hours" &&
        !isWithinTenantBusinessHours(tenantSettings, tenant.timezone || "America/Asuncion")
      ) {
        return NextResponse.json({
          status: "saved_to_crm_outside_business_hours",
          senderPhone,
        });
      }

      let replyText = "";

      let detectedIntent: any = "general";
      let actionPerformed: string | undefined = undefined;

      if (!isPlatformBot && tenant && base64ImageForOcr) {
        detectedIntent = "sipap_ocr";
        try {
          const receiptData = await geminiPool.analyzeSipapReceipt(base64ImageForOcr, "image/jpeg", senderPhone);
          if (receiptData.isSipap && receiptData.amount > 0) {
            actionPerformed = "SIPAP_RECEIPT_VALIDATED";
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
              actionPerformed = "SIPAP_APPOINTMENT_CONFIRMED";
            }

            replyText = `¡Muchas gracias! Recibimos y validamos tu comprobante de transferencia:\n\n` +
              ` *Banco:* ${receiptData.bank}\n` +
              ` *Monto:* ₲ ${receiptData.amount.toLocaleString("es-PY")}\n` +
              ` *N° Operación:* ${receiptData.operationNumber}\n\n` +
              ` Tu turno ha quedado *CONFIRMADO*. ¡Te esperamos en ${tenant.name}!`;
          } else {
            replyText = `Recibimos tu imagen. Nuestro equipo revisará el comprobante a la brevedad para confirmar tu turno. ¡Muchas gracias!`;
          }
        } catch (err: any) {
          console.error("[WhatsApp Webhook] Error en OCR de transferencia bancaria:", err);
          replyText = `Recibimos tu comprobante. Lo verificaremos enseguida para confirmar tu turno.`;
        }
      } else if (isPlatformBot) {
        console.log(`[WhatsApp Webhook] Mensaje procesado por Agente Oficial de AgendatePY (Gemini 3.1 Flash Lite)...`);
        const platformResult = await processAgendatePlatformMessage(
          textContent,
          senderPhone,
          data.pushName
        );
        replyText = platformResult.replyText;
        detectedIntent = "soporte";
      } else if (tenant && textContent) {
        const lowerText = textContent.toLowerCase();
        const isBookingConfirmationIntent =
          lowerText.includes("acabo de agendar") ||
          lowerText.includes("para confirmar") ||
          (lowerText.includes("confirmo") && lowerText.includes("turno"));

        let pendingConfirmed = false;
        if (isBookingConfirmationIntent) {
          const pendingApp = await prisma.appointment.findFirst({
            where: {
              tenantId: tenant.id,
              clientPhone: { contains: rawDigits.slice(-8) },
              status: "PENDING_ACTION",
            },
            include: { service: true, staff: true },
            orderBy: { createdAt: "desc" },
          });

          if (pendingApp) {
            await prisma.appointment.update({
              where: { id: pendingApp.id },
              data: { status: "CONFIRMED" },
            });
            pendingConfirmed = true;
            actionPerformed = "APPOINTMENT_CONFIRMED_VIA_WHATSAPP";
            detectedIntent = "agenda";

            const tz = tenant.timezone || "America/Asuncion";
            const time = new Date(pendingApp.startTime).toLocaleTimeString("es-PY", {
              hour: "2-digit",
              minute: "2-digit",
              timeZone: tz,
            });
            const date = new Date(pendingApp.startTime).toLocaleDateString("es-PY", {
              weekday: "long",
              day: "numeric",
              month: "long",
              timeZone: tz,
            });

            replyText = `¡Turno confirmado con éxito, ${pendingApp.clientName}! 🎉\n\n` +
              ` Te esperamos el *${date} a las ${time} hs* en *${tenant.name}* para tu *${pendingApp.service?.name || "Servicio"}*.\n` +
              (pendingApp.staff?.name ? ` Te atenderá: *${pendingApp.staff.name}*.\n\n` : `\n`) +
              `¡Muchas gracias por elegirnos!`;

            // Alerta inmediata al dueño por WhatsApp
            const settings = (tenant.settings as any) || {};
            const notifyPhone = settings.evolutionConfig?.personalPhone;
            if (settings.evolutionConfig?.notifyPersonalPhoneOnBooking === true && notifyPhone) {
              const alertMsg = `🔔 *¡Nuevo Turno Confirmado!*\n\n` +
                `• *Cliente:* ${pendingApp.clientName} (${senderPhone})\n` +
                `• *Servicio:* ${pendingApp.service?.name}\n` +
                `• *Fecha/Hora:* ${date} a las ${time} hs\n` +
                `• *Profesional:* ${pendingApp.staff?.name || "Asignado"}\n\n` +
                `Confirmado automáticamente por WhatsApp.`;
              sendWhatsAppMessage(notifyPhone.replace(/\D/g, ""), alertMsg, false, tenantWhatsAppInstance).catch(() => {});
            }
          }
        }

        if (!pendingConfirmed) {
          const agentResult = await processCustomerMessageWithAI(textContent, {
            tenantId: tenant.id,
            tenantName: tenant.name,
            tenantSlug: tenant.slug,
            clientPhone: senderPhone,
            clientName: data.pushName || "Cliente WhatsApp",
          });
          replyText = agentResult.replyText;
          detectedIntent = agentResult.intent;
          actionPerformed = agentResult.actionPerformed;
        }
      }

      // Registrar respuesta del bot de inmediato en el CRM
      if (replyText) {
        await recordCrmMessage({
          phone: senderPhone,
          name: isPlatformBot ? "AgendatePY Bot" : `${tenant?.name || "Local"} Bot`,
          sender: "bot",
          text: replyText,
          isAi: true,
        });

        // Registrar en el Almacén de Aprendizaje y Minería de Patrones de la IA
        await recordAiInteraction({
          scope: isPlatformBot ? "PLATFORM" : "TENANT",
          tenantId: tenant?.id,
          tenantName: tenant?.name,
          tenantSlug: tenant?.slug,
          clientPhone: senderPhone,
          clientName: data.pushName,
          userMessage: textContent || (isAudio ? "Nota de voz recibida" : "Imagen enviada"),
          aiResponse: replyText,
          intent: detectedIntent,
          channel: "whatsapp",
          hadAudio: isAudio,
          hadImage: Boolean(isImage || isDocument || base64ImageForOcr),
          actionPerformed,
        });
      }

      // 7. RESPONDER AL CLIENTE CON "ESCRIBIENDO..." Y ENVÍO POR EVOLUTION API
      if (replyText && rawDigits) {
        try {
          await sendWhatsAppMessage(rawDigits, replyText, true, tenantWhatsAppInstance);
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
      transferMultimodalOcr: true,
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
