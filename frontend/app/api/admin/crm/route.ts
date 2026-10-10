import { NextRequest, NextResponse } from "next/server";
import { requireSuperAdminSession, isGuardError } from "@/lib/api-guard";
import { getAllCrmConversations, recordCrmMessage, markCrmAsRead, clearAllCrmData, deleteCrmConversation, type StoredConversation } from "@/lib/crm/crm-store";
import { conversationState } from "@/lib/ai/conversation-state";
import { sendWhatsAppMessage } from "@/lib/evolution";

export type CrmContact = StoredConversation;

/**
 * Endpoint del CRM de WhatsApp de AgendatePY
 * Carga únicamente conversaciones REALES registradas.
 */
export async function GET(req: NextRequest) {
  const auth = await requireSuperAdminSession(req);
  if (isGuardError(auth)) return auth;

  try {
    const conversations = await getAllCrmConversations();

    const summary = {
      total: conversations.length,
      owners: conversations.filter((c) => c.role === "OWNER").length,
      leads: conversations.filter((c) => c.role === "LEAD").length,
      clients: conversations.filter((c) => c.role === "CLIENT").length,
      pausedHumans: conversations.filter((c) => (c as any).aiPaused).length,
    };

    return NextResponse.json({
      status: "success",
      summary,
      contacts: conversations,
    });
  } catch (err: any) {
    console.error("[CRM API] Error:", err);
    return NextResponse.json(
      { status: "error", message: err?.message || "Error al cargar CRM" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireSuperAdminSession(req);
  if (isGuardError(auth)) return auth;

  try {
    const body = await req.json();
    const { action, phone, message, pauseAiMinutes } = body;

    // Acción para vaciar todo el historial
    if (action === "clear_all") {
      await clearAllCrmData();
      return NextResponse.json({ status: "success", cleared: true, message: "Historial de CRM vaciado por completo." });
    }

    if (!phone) {
      return NextResponse.json({ status: "error", message: "Teléfono requerido" }, { status: 400 });
    }

    // Acción para borrar un chat particular
    if (action === "delete_conversation") {
      await deleteCrmConversation(phone);
      return NextResponse.json({ status: "success", deleted: true });
    }

    // 1. Marcar como leído
    if (action === "mark_read") {
      await markCrmAsRead(phone);
      return NextResponse.json({ status: "success", read: true });
    }

    // 2. Alternar pausa del Asistente IA
    if (action === "toggle_ai") {
      const isPaused = body.paused === true;
      if (isPaused) {
        const duration = (pauseAiMinutes || 60) * 60 * 1000;
        conversationState.recordHumanIntervention("agendatepy-official", phone, duration);
      } else {
        conversationState.resumeBot("agendatepy-official", phone);
      }

      return NextResponse.json({
        status: "success",
        phone,
        aiPaused: isPaused,
        message: isPaused ? "IA silenciada para esta conversación." : "IA reactivada.",
      });
    }

    // 3. Enviar mensaje de WhatsApp manual desde el CRM
    if (action === "send_message") {
      if (!message || !message.trim()) {
        return NextResponse.json({ status: "error", message: "Mensaje vacío" }, { status: 400 });
      }

      const cleanPhone = phone.replace(/\D/g, "");
      let sentViaEvolution = false;

      try {
        await sendWhatsAppMessage(cleanPhone, message.trim(), true);
        sentViaEvolution = true;
      } catch (evoErr: any) {
        console.warn("[CRM] Advertencia enviando por Evolution:", evoErr?.message);
      }

      // Pausar el bot para que no pise la conversación del agente humano
      conversationState.recordHumanIntervention("agendatepy-official", phone, 60 * 60 * 1000);

      // Registrar mensaje real en el almacén del CRM
      const updatedConv = await recordCrmMessage({
        phone,
        name: "Asesor Humano",
        sender: "agent",
        text: message.trim(),
        isAi: false,
      });

      return NextResponse.json({
        status: "success",
        sentViaEvolution,
        phone,
        conversation: updatedConv,
      });
    }

    return NextResponse.json({ status: "error", message: "Acción no reconocida" }, { status: 400 });
  } catch (err: any) {
    console.error("[CRM Send API] Error:", err);
    return NextResponse.json(
      { status: "error", message: err?.message || "Error procesando acción del CRM" },
      { status: 500 }
    );
  }
}
