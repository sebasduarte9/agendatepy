import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireTenantSession, isGuardError } from "@/lib/api-guard";

export const dynamic = "force-dynamic";

type TenantSettings = Record<string, any>;
type EvolutionInstance = {
  name?: string;
  instanceName?: string;
  connectionStatus?: string;
  ownerJid?: string | null;
  profileName?: string | null;
};

function evolutionConfig(settings: TenantSettings) {
  return (settings.evolutionConfig || {}) as Record<string, any>;
}

function getApiConfig() {
  const baseUrl = process.env.EVOLUTION_API_URL?.replace(/\/$/, "");
  const apiKey = process.env.EVOLUTION_API_KEY;
  if (!baseUrl || !apiKey) {
    throw new Error("La conexión de WhatsApp no está configurada en el servidor.");
  }
  return { baseUrl, apiKey };
}

async function findInstance(instanceName: string): Promise<EvolutionInstance | null> {
  const { baseUrl, apiKey } = getApiConfig();
  const response = await fetch(`${baseUrl}/instance/fetchInstances`, {
    headers: { apikey: apiKey },
    cache: "no-store",
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) {
    throw new Error("No se pudo consultar el estado de WhatsApp.");
  }

  const result = await response.json();
  const instances = Array.isArray(result) ? result : result?.instances;
  return Array.isArray(instances)
    ? instances.find((instance: EvolutionInstance) =>
        instance.name === instanceName || instance.instanceName === instanceName,
      ) || null
    : null;
}

async function getTenantConnection(tenantId: string) {
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    select: { id: true, slug: true, settings: true },
  });
  if (!tenant) throw new Error("No se encontró el negocio.");

  const settings = (tenant.settings as TenantSettings) || {};
  const currentConfig = evolutionConfig(settings);
  const instance =
    currentConfig.instance || `agpy_${tenant.id.replace(/-/g, "").slice(0, 20)}`;

  if (currentConfig.instance !== instance) {
    await prisma.tenant.update({
      where: { id: tenant.id },
      data: {
        settings: {
          ...settings,
          evolutionConfig: { ...currentConfig, instance },
        },
      },
    });
  }

  return {
    tenant,
    settings,
    config: { ...currentConfig, instance } as Record<string, any> & { instance: string },
  };
}

async function persistConnection(
  tenantId: string,
  settings: TenantSettings,
  config: Record<string, any>,
  connected: boolean,
  phoneNumber = "",
) {
  await prisma.tenant.update({
    where: { id: tenantId },
    data: {
      settings: {
        ...settings,
        evolutionConfig: {
          ...config,
          connected,
          phoneNumber: connected ? phoneNumber || config.phoneNumber || "" : "",
        },
      },
    },
  });
}

function phoneFromOwnerJid(ownerJid?: string | null) {
  const digits = ownerJid?.split("@")[0].replace(/\D/g, "") || "";
  return digits ? `+${digits}` : "";
}

function connectionResponse(instance: EvolutionInstance | null, fallbackPhone = "") {
  const connected = instance?.connectionStatus === "open";
  return {
    connected,
    state: instance?.connectionStatus || "not_created",
    phoneNumber: connected ? phoneFromOwnerJid(instance?.ownerJid) || fallbackPhone : "",
    profileName: connected ? instance?.profileName || null : null,
  };
}

export async function GET(request: NextRequest) {
  const auth = await requireTenantSession(request, ["OWNER", "SUPERADMIN"]);
  if (isGuardError(auth)) return auth;

  try {
    const { tenant, settings, config } = await getTenantConnection(auth.tenantId);
    const instance = await findInstance(config.instance);
    const status = connectionResponse(instance, config.phoneNumber);
    if (config.connected !== status.connected || config.phoneNumber !== status.phoneNumber) {
      await persistConnection(tenant.id, settings, config, status.connected, status.phoneNumber);
    }
    return NextResponse.json({ ok: true, instance: config.instance, ...status });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo verificar WhatsApp.";
    const status = message.includes("no está configurada") ? 503 : 502;
    return NextResponse.json({ ok: false, connected: false, error: message }, { status });
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireTenantSession(request, ["OWNER", "SUPERADMIN"]);
  if (isGuardError(auth)) return auth;

  try {
    const body = await request.json().catch(() => ({}));
    const action = body.action === "disconnect" ? "disconnect" : "connect";
    const { tenant, settings, config } = await getTenantConnection(auth.tenantId);
    const { baseUrl, apiKey } = getApiConfig();
    let instance = await findInstance(config.instance);

    if (action === "disconnect") {
      if (instance) {
        const logoutResponse = await fetch(
          `${baseUrl}/instance/logout/${encodeURIComponent(config.instance)}`,
          {
            method: "DELETE",
            headers: { apikey: apiKey },
            cache: "no-store",
            signal: AbortSignal.timeout(8000),
          },
        );
        if (!logoutResponse.ok) throw new Error("Evolution no pudo desconectar WhatsApp.");
      }
      await persistConnection(tenant.id, settings, config, false);
      return NextResponse.json({ ok: true, connected: false, state: "close" });
    }

    if (!instance) {
      const appUrl = (process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin).replace(/\/$/, "");
      const createResponse = await fetch(`${baseUrl}/instance/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json", apikey: apiKey },
        body: JSON.stringify({
          instanceName: config.instance,
          qrcode: true,
          integration: "WHATSAPP-BAILEYS",
          webhook: `${appUrl}/api/webhooks/whatsapp`,
          webhookByEvents: false,
          events: ["CONNECTION_UPDATE", "MESSAGES_UPSERT", "QRCODE_UPDATED"],
        }),
        cache: "no-store",
        signal: AbortSignal.timeout(10000),
      });

      if (!createResponse.ok) {
        instance = await findInstance(config.instance);
        if (!instance) throw new Error("No se pudo crear la conexión de WhatsApp para este negocio.");
      }
    }

    const connectResponse = await fetch(
      `${baseUrl}/instance/connect/${encodeURIComponent(config.instance)}`,
      {
        headers: { apikey: apiKey },
        cache: "no-store",
        signal: AbortSignal.timeout(8000),
      },
    );
    if (!connectResponse.ok) throw new Error("No se pudo generar el QR de WhatsApp.");

    const connectData = await connectResponse.json();
    instance = await findInstance(config.instance);
    const status = connectionResponse(instance, config.phoneNumber);
    await persistConnection(tenant.id, settings, config, status.connected, status.phoneNumber);

    return NextResponse.json({
      ok: true,
      instance: config.instance,
      ...status,
      qrImage: connectData?.base64 || null,
      qrPayload: connectData?.code || null,
      pairingCode: connectData?.pairingCode || null,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo conectar WhatsApp.";
    const status = message.includes("no está configurada") ? 503 : 502;
    return NextResponse.json({ ok: false, connected: false, error: message }, { status });
  }
}
