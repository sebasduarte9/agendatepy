import { prisma } from "@/lib/db";

export type SystemEventType =
  | "TENANT_CREATED"
  | "ONBOARDING_COMPLETED"
  | "SERVICE_CREATED"
  | "STAFF_CREATED"
  | "CLIENT_CREATED"
  | "APPOINTMENT_CREATED"
  | "APPOINTMENT_COMPLETED"
  | "PUBLIC_BOOKING_CREATED"
  | "CASH_MOVEMENT_CREATED"
  | "CASH_REGISTER_CLOSED"
  | "COMMISSION_PAYOUT_CREATED"
  | "EXPORT_CREATED"
  | "UNAUTHORIZED_ACCESS"
  | "FORBIDDEN_ACCESS"
  | "SLOT_TAKEN"
  | "VALIDATION_ERROR"
  | "API_ERROR";

export interface RecordEventParams {
  event: SystemEventType | string;
  tenantId?: string | null;
  entityType?: string | null;
  entityId?: string | null;
  metadata?: Record<string, any> | null;
}

export interface RecordErrorParams {
  event: "UNAUTHORIZED_ACCESS" | "FORBIDDEN_ACCESS" | "SLOT_TAKEN" | "VALIDATION_ERROR" | "API_ERROR";
  tenantId?: string | null;
  endpoint: string;
  statusCode: number;
  message: string;
  metadata?: Record<string, any> | null;
}

/**
 * Sanitiza recursivamente objetos de metadata para evitar almacenar
 * credenciales, tokens, cookies o PII innecesaria.
 */
export function sanitizeMetadata(metadata: any): any {
  if (!metadata || typeof metadata !== "object") {
    return metadata;
  }

  if (Array.isArray(metadata)) {
    return metadata.map(sanitizeMetadata);
  }

  const sanitized: Record<string, any> = {};
  const blockedKeys = new Set([
    "password",
    "token",
    "secret",
    "cookie",
    "authorization",
    "bearer",
    "jwt",
    "session",
    "apikey",
    "privatekey",
  ]);

  for (const [key, value] of Object.entries(metadata)) {
    const lowerKey = key.toLowerCase();
    let isBlocked = false;
    for (const b of blockedKeys) {
      if (lowerKey.includes(b)) {
        isBlocked = true;
        break;
      }
    }

    if (isBlocked) {
      continue;
    }

    if (value && typeof value === "object") {
      sanitized[key] = sanitizeMetadata(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

/**
 * Registra un evento de plataforma de forma segura y atómica si se le pasa
 * un cliente transaccional `tx`, o utilizando el cliente global `prisma`.
 */
export async function recordPlatformEvent(
  clientOrTx: any,
  params: RecordEventParams
) {
  try {
    const dbClient = clientOrTx || prisma;
    const safeMeta = params.metadata ? sanitizeMetadata(params.metadata) : undefined;

    return await dbClient.platformEvent.create({
      data: {
        event: params.event,
        tenantId: params.tenantId || null,
        entityType: params.entityType || null,
        entityId: params.entityId || null,
        metadata: safeMeta || undefined,
      },
    });
  } catch (error) {
    // Si la llamada no es parte de una transacción crítica requerida, registramos log
    console.error(`[telemetry] Error registrando evento "${params.event}":`, error);
    return null;
  }
}

/**
 * Registra eventos de telemetría de errores para el System Health Monitor
 */
export async function recordSystemError(params: RecordErrorParams) {
  try {
    const safeMeta = sanitizeMetadata({
      endpoint: params.endpoint,
      statusCode: params.statusCode,
      message: params.message,
      ...(params.metadata || {}),
    });

    return await prisma.platformEvent.create({
      data: {
        event: params.event,
        tenantId: params.tenantId || null,
        entityType: "SystemError",
        entityId: params.endpoint,
        metadata: safeMeta,
      },
    });
  } catch (error) {
    console.error(`[telemetry] Error registrando error de sistema "${params.event}":`, error);
    return null;
  }
}
