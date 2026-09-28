import { NextRequest, NextResponse } from "next/server";

/**
 * Webhook Receptor de Mensajería WhatsApp (Evolution API / Gateway)
 *
 * Recibe eventos de mensajes entrantes de clientes, estado de conexión (QR / Open)
 * y entrega de notificaciones en segundo plano.
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

    // Mensaje entrante de un cliente
    if (event === "MESSAGES_UPSERT" || event === "messages.upsert") {
      const data = body.data || body;
      const key = data.key || {};
      const fromMe = key.fromMe ?? false;
      const remoteJid = key.remoteJid || "";

      // Ignorar mensajes enviados por nosotros mismos para evitar bucles
      if (fromMe) {
        return NextResponse.json({ status: "ignored", reason: "from_me" });
      }

      const messageContent =
        data.message?.conversation ||
        data.message?.extendedTextMessage?.text ||
        "";

      console.log(`[WhatsApp Webhook] Mensaje recibido de ${remoteJid}: "${messageContent}"`);

      return NextResponse.json({
        status: "success",
        event,
        from: remoteJid,
        receivedAt: new Date().toISOString(),
      });
    }

    return NextResponse.json({ status: "success", event, processed: true });
  } catch (error) {
    console.error("[WhatsApp Webhook] Error procesando webhook:", error);
    return NextResponse.json({ status: "error", message: "Internal server error" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    service: "AgendatePY WhatsApp Webhook Gateway",
    status: "active",
    timestamp: new Date().toISOString(),
  });
}
