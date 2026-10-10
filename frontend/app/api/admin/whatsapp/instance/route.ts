import { NextRequest, NextResponse } from "next/server";
import { requireSuperAdminSession, isGuardError } from "@/lib/api-guard";

const EVO_URL = (process.env.EVOLUTION_API_URL || "http://localhost:8081").replace(/\/$/, "");
const EVO_KEY = process.env.EVOLUTION_API_KEY || "agendatepy_whatsapp_secure_key_2026";
const INSTANCE = process.env.EVOLUTION_INSTANCE || "agendatepy";

/**
 * Obtener estado de conexión y código QR de la instancia de WhatsApp de AgendatePY
 */
export async function GET(req: NextRequest) {
  const auth = await requireSuperAdminSession(req);
  if (isGuardError(auth)) return auth;

  try {
    // 1. Verificar si la instancia existe
    const instancesRes = await fetch(`${EVO_URL}/instance/fetchInstances`, {
      headers: { apikey: EVO_KEY },
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });

    if (!instancesRes.ok) {
      return NextResponse.json({
        status: "offline",
        message: "No se pudo conectar con la pasarela Evolution API",
        instance: INSTANCE,
        connected: false,
      });
    }

    const instances = await instancesRes.json();
    const current = Array.isArray(instances)
      ? instances.find((i: any) => i.name === INSTANCE)
      : null;

    if (!current) {
      return NextResponse.json({
        status: "not_created",
        instance: INSTANCE,
        connected: false,
        state: "disconnected",
      });
    }

    const isConnected = current.connectionStatus === "open";
    let qrcode: string | null = null;

    // Si no está conectado, obtener QR code
    if (!isConnected) {
      try {
        const connectRes = await fetch(`${EVO_URL}/instance/connect/${encodeURIComponent(INSTANCE)}`, {
          headers: { apikey: EVO_KEY },
          cache: "no-store",
          signal: AbortSignal.timeout(5000),
        });
        if (connectRes.ok) {
          const connectData = await connectRes.json();
          qrcode = connectData.base64 || connectData.code || null;
        }
      } catch (qrErr) {
        console.warn("[Admin WhatsApp] Error obteniendo QR:", qrErr);
      }
    }

    return NextResponse.json({
      status: "success",
      instance: INSTANCE,
      connected: isConnected,
      state: current.connectionStatus || (isConnected ? "open" : "close"),
      ownerJid: current.ownerJid || null,
      profileName: current.profileName || null,
      profilePicUrl: current.profilePicUrl || null,
      qrcode,
      stats: current._count || { Message: 0, Contact: 0, Chat: 0 },
    });
  } catch (err: any) {
    return NextResponse.json({
      status: "error",
      message: err?.message || "Error al conectar con Evolution API",
      instance: INSTANCE,
      connected: false,
    });
  }
}

/**
 * Crear instancia, forzar conexión o desconectar WhatsApp
 */
export async function POST(req: NextRequest) {
  const auth = await requireSuperAdminSession(req);
  if (isGuardError(auth)) return auth;

  try {
    const body = await req.json().catch(() => ({}));
    const action = body.action || "connect"; // "create", "connect", "disconnect", "restart"

    if (action === "create" || action === "connect") {
      // 1. Intentar crear la instancia si no existe
      const createRes = await fetch(`${EVO_URL}/instance/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: EVO_KEY,
        },
        body: JSON.stringify({
          instanceName: INSTANCE,
          qrcode: true,
          integration: "WHATSAPP-BAILEYS",
          webhook: `${process.env.NEXT_PUBLIC_APP_URL || "http://host.docker.internal:3000"}/api/webhooks/whatsapp`,
          webhookByEvents: false,
          events: [
            "CONNECTION_UPDATE",
            "MESSAGES_UPSERT",
            "QRCODE_UPDATED",
          ],
        }),
      });

      // Si ya existía o se creó bien, pedir QR
      const connectRes = await fetch(`${EVO_URL}/instance/connect/${encodeURIComponent(INSTANCE)}`, {
        headers: { apikey: EVO_KEY },
        cache: "no-store",
      });

      const connectData = connectRes.ok ? await connectRes.json() : null;

      return NextResponse.json({
        status: "success",
        action,
        qrcode: connectData?.base64 || connectData?.code || null,
        pairingCode: connectData?.pairingCode || null,
      });
    }

    if (action === "disconnect" || action === "logout") {
      const logoutRes = await fetch(`${EVO_URL}/instance/logout/${encodeURIComponent(INSTANCE)}`, {
        method: "DELETE",
        headers: { apikey: EVO_KEY },
      });

      return NextResponse.json({
        status: "success",
        action: "disconnected",
        result: logoutRes.ok,
      });
    }

    return NextResponse.json({ status: "error", message: `Acción no válida: ${action}` }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json(
      { status: "error", message: err?.message || "Error procesando acción de WhatsApp" },
      { status: 500 }
    );
  }
}
