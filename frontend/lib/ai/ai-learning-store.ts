/**
 * Almacén y Motor de Aprendizaje Continuo para la IA de AgendatePY y Locales
 *
 * Registra cada turno de conversación tanto de la plataforma oficial AgendatePY
 * como de los locales y negocios que usan el bot de WhatsApp.
 *
 * Permite detectar:
 * 1. Puntos donde la IA se equivoca o requiere intervención humana.
 * 2. Patrones de repetición o bucles en las respuestas.
 * 3. Preguntas frecuentes de los clientes para alimentar prompts y fine-tuning.
 * 4. Extracción de datasets (Golden Samples y Anti-Patrones) para entrenamiento continuo.
 */

import { prisma } from "@/lib/db";

export interface AiInteractionRecord {
  id: string;
  timestamp: string; // ISO string
  createdAt: number; // Unix timestamp ms
  scope: "PLATFORM" | "TENANT"; // "PLATFORM" = AgendatePY Oficial, "TENANT" = Negocio / Local
  tenantId?: string;
  tenantName?: string;
  tenantSlug?: string;
  clientPhone: string;
  clientName?: string;
  userMessage: string;
  aiResponse: string;
  intent: "agenda" | "precios" | "soporte" | "sipap_ocr" | "humano" | "consulta" | "general" | "cancelacion" | "otro";
  channel: "whatsapp" | "web_simulator" | "chat_widget";
  hadAudio?: boolean;
  hadImage?: boolean;
  humanIntervened: boolean;
  repetitionDetected: boolean;
  outcome: "RESOLVED" | "NEEDS_HUMAN" | "REPETITION_LOOP" | "SIPAP_CONFIRMED" | "ERROR";
  actionPerformed?: string;
  adminFeedback?: {
    correctedResponse?: string;
    notes?: string;
    isGoldenSample?: boolean;
    isAntiPattern?: boolean;
    reviewedAt?: string;
    reviewedBy?: string;
  };
}

const STORAGE_KEY = "ai_learning_dataset";
const MAX_IN_MEMORY_RECORDS = 5000;

// Memoria volátil de acceso ultrarrápido
const recordsMap = new Map<string, AiInteractionRecord>();
let isLoaded = false;

async function loadFromDb() {
  if (isLoaded) return;
  try {
    const row = await prisma.platformSetting.findUnique({
      where: { key: STORAGE_KEY },
    });
    if (row?.value && Array.isArray(row.value)) {
      for (const rec of row.value as unknown as AiInteractionRecord[]) {
        if (rec?.id) {
          recordsMap.set(rec.id, rec);
        }
      }
    }
    isLoaded = true;
  } catch (err) {
    console.warn("[AiLearningStore] Error cargando registros iniciales de BD:", err);
  }
}

let syncTimeout: NodeJS.Timeout | null = null;
function scheduleDbSync() {
  if (syncTimeout) return;
  syncTimeout = setTimeout(async () => {
    syncTimeout = null;
    try {
      const recordsArray = Array.from(recordsMap.values())
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice(0, MAX_IN_MEMORY_RECORDS);

      await prisma.platformSetting.upsert({
        where: { key: STORAGE_KEY },
        create: { key: STORAGE_KEY, value: recordsArray as any },
        update: { value: recordsArray as any },
      });
    } catch (err) {
      console.warn("[AiLearningStore] Error sincronizando registros en BD:", err);
    }
  }, 3000); // Debounce de 3 segundos
}

/**
 * Heurística para detectar repeticiones o bucles en el mensaje del usuario
 */
function detectRepetitionPattern(
  clientPhone: string,
  newMessage: string,
  allPhoneRecords: AiInteractionRecord[]
): boolean {
  const recent = allPhoneRecords.slice(0, 4);
  if (recent.length === 0) return false;

  const cleanNew = newMessage.toLowerCase().trim();

  // 1. Mensajes idénticos o casi idénticos en menos de 5 minutos
  for (const prev of recent) {
    const cleanPrev = prev.userMessage.toLowerCase().trim();
    if (cleanPrev === cleanNew && cleanNew.length > 5) {
      return true;
    }
  }

  // 2. Palabras clave de frustración o re-pregunta
  const frustrationKeywords = [
    "otra vez",
    "ya te dije",
    "te pregunté",
    "no entendés",
    "no entiendo",
    "no me respondiste",
    "pasame con alguien",
    "humano por favor",
    "sos un bot",
    "responde bien",
  ];
  if (frustrationKeywords.some((kw) => cleanNew.includes(kw))) {
    return true;
  }

  return false;
}

/**
 * Registra una interacción de IA para análisis y re-entrenamiento
 */
export async function recordAiInteraction(params: {
  scope: "PLATFORM" | "TENANT";
  tenantId?: string;
  tenantName?: string;
  tenantSlug?: string;
  clientPhone: string;
  clientName?: string;
  userMessage: string;
  aiResponse: string;
  intent?: string;
  channel?: "whatsapp" | "web_simulator" | "chat_widget";
  hadAudio?: boolean;
  hadImage?: boolean;
  humanIntervened?: boolean;
  actionPerformed?: string;
}): Promise<AiInteractionRecord> {
  await loadFromDb();

  const now = Date.now();
  const id = `ailog_${now}_${Math.random().toString(36).substring(2, 8)}`;

  // Buscar historial previo de este teléfono para análisis de patrones
  const phoneRecords = Array.from(recordsMap.values())
    .filter((r) => r.clientPhone === params.clientPhone)
    .sort((a, b) => b.createdAt - a.createdAt);

  const isRepetition = detectRepetitionPattern(params.clientPhone, params.userMessage, phoneRecords);

  // Normalizar intent
  let normalizedIntent: AiInteractionRecord["intent"] = "general";
  const rawIntent = (params.intent || "").toLowerCase();
  if (rawIntent.includes("agenda") || rawIntent.includes("reserva") || rawIntent.includes("turno")) {
    normalizedIntent = "agenda";
  } else if (rawIntent.includes("precio") || rawIntent.includes("costo") || rawIntent.includes("plan")) {
    normalizedIntent = "precios";
  } else if (rawIntent.includes("sipap") || rawIntent.includes("comprobante") || rawIntent.includes("transferencia")) {
    normalizedIntent = "sipap_ocr";
  } else if (rawIntent.includes("humano") || rawIntent.includes("asesor") || rawIntent.includes("soporte")) {
    normalizedIntent = "humano";
  } else if (rawIntent.includes("cancel")) {
    normalizedIntent = "cancelacion";
  } else if (rawIntent.includes("consulta")) {
    normalizedIntent = "consulta";
  }

  // Determinar resultado operacional
  let outcome: AiInteractionRecord["outcome"] = "RESOLVED";
  if (params.humanIntervened || normalizedIntent === "humano") {
    outcome = "NEEDS_HUMAN";
  } else if (isRepetition) {
    outcome = "REPETITION_LOOP";
  } else if (normalizedIntent === "sipap_ocr" && params.actionPerformed?.includes("CONFIRMED")) {
    outcome = "SIPAP_CONFIRMED";
  }

  const record: AiInteractionRecord = {
    id,
    timestamp: new Date(now).toISOString(),
    createdAt: now,
    scope: params.scope,
    tenantId: params.tenantId,
    tenantName: params.tenantName,
    tenantSlug: params.tenantSlug,
    clientPhone: params.clientPhone,
    clientName: params.clientName,
    userMessage: params.userMessage.trim(),
    aiResponse: params.aiResponse.trim(),
    intent: normalizedIntent,
    channel: params.channel || "whatsapp",
    hadAudio: Boolean(params.hadAudio),
    hadImage: Boolean(params.hadImage),
    humanIntervened: Boolean(params.humanIntervened),
    repetitionDetected: isRepetition,
    outcome,
    actionPerformed: params.actionPerformed,
  };

  recordsMap.set(id, record);
  scheduleDbSync();

  // Registrar también en platform_events para auditoría inmutable
  try {
    await prisma.platformEvent.create({
      data: {
        tenantId: params.tenantId || null,
        event: outcome === "NEEDS_HUMAN" ? "AI_HUMAN_TAKEOVER" : "AI_INTERACTION",
        entityType: "WHATSAPP_CHAT",
        entityId: params.clientPhone,
        metadata: {
          scope: params.scope,
          tenantName: params.tenantName,
          intent: normalizedIntent,
          outcome,
          hadAudio: params.hadAudio,
          hadImage: params.hadImage,
          repetitionDetected: isRepetition,
        },
      },
    });
  } catch (err) {
    // Silencioso para no demorar la respuesta de WhatsApp
  }

  return record;
}

/**
 * Notifica que un humano intervino en una conversación existente
 */
export async function markInteractionHumanIntervened(clientPhone: string) {
  await loadFromDb();

  const phoneRecords = Array.from(recordsMap.values())
    .filter((r) => r.clientPhone === clientPhone)
    .sort((a, b) => b.createdAt - a.createdAt);

  if (phoneRecords.length > 0) {
    const latest = phoneRecords[0];
    latest.humanIntervened = true;
    latest.outcome = "NEEDS_HUMAN";
    recordsMap.set(latest.id, latest);
    scheduleDbSync();
  }
}

/**
 * Añade corrección o feedback de un administrador a un registro
 */
export async function updateAiInteractionFeedback(
  id: string,
  feedback: {
    correctedResponse?: string;
    notes?: string;
    isGoldenSample?: boolean;
    isAntiPattern?: boolean;
    reviewedBy?: string;
  }
): Promise<AiInteractionRecord | null> {
  await loadFromDb();

  const record = recordsMap.get(id);
  if (!record) return null;

  record.adminFeedback = {
    ...record.adminFeedback,
    ...feedback,
    reviewedAt: new Date().toISOString(),
  };

  recordsMap.set(id, record);
  scheduleDbSync();
  return record;
}

/**
 * Retorna estadísticas consolidadas de aprendizaje de IA
 */
export async function getAiLearningStats() {
  await loadFromDb();

  const all = Array.from(recordsMap.values());
  const total = all.length;

  const platformCount = all.filter((r) => r.scope === "PLATFORM").length;
  const tenantCount = all.filter((r) => r.scope === "TENANT").length;
  const humanInterventions = all.filter((r) => r.humanIntervened || r.outcome === "NEEDS_HUMAN").length;
  const repetitionLoops = all.filter((r) => r.repetitionDetected || r.outcome === "REPETITION_LOOP").length;
  const audioCount = all.filter((r) => r.hadAudio).length;
  const imageCount = all.filter((r) => r.hadImage).length;
  const goldenSamples = all.filter((r) => r.adminFeedback?.isGoldenSample).length;
  const reviewedCount = all.filter((r) => r.adminFeedback?.reviewedAt).length;

  const autonomyRate = total > 0 ? Math.round(((total - humanInterventions) / total) * 100) : 100;

  // Conteo por Intent
  const intentBreakdown: Record<string, number> = {};
  for (const r of all) {
    intentBreakdown[r.intent] = (intentBreakdown[r.intent] || 0) + 1;
  }

  // Top Negocios con más interacciones
  const tenantBreakdown: Record<string, { count: number; name: string; humanInterventions: number }> = {};
  for (const r of all.filter((x) => x.scope === "TENANT" && x.tenantName)) {
    const key = r.tenantId || r.tenantName!;
    if (!tenantBreakdown[key]) {
      tenantBreakdown[key] = { count: 0, name: r.tenantName!, humanInterventions: 0 };
    }
    tenantBreakdown[key].count++;
    if (r.humanIntervened) tenantBreakdown[key].humanInterventions++;
  }

  const topTenants = Object.values(tenantBreakdown)
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  return {
    total,
    platformCount,
    tenantCount,
    autonomyRate,
    humanInterventions,
    repetitionLoops,
    audioCount,
    imageCount,
    goldenSamples,
    reviewedCount,
    intentBreakdown,
    topTenants,
  };
}

/**
 * Consulta registros con filtros avanzados
 */
export async function getAiInteractions(filters?: {
  scope?: "ALL" | "PLATFORM" | "TENANT";
  tenantId?: string;
  outcome?: string;
  hasAudio?: boolean;
  hasImage?: boolean;
  hasRepetition?: boolean;
  hasFeedback?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}) {
  await loadFromDb();

  let list = Array.from(recordsMap.values()).sort((a, b) => b.createdAt - a.createdAt);

  if (filters?.scope && filters.scope !== "ALL") {
    list = list.filter((r) => r.scope === filters.scope);
  }

  if (filters?.tenantId && filters.tenantId !== "ALL") {
    list = list.filter((r) => r.tenantId === filters.tenantId);
  }

  if (filters?.outcome && filters.outcome !== "ALL") {
    list = list.filter((r) => r.outcome === filters.outcome);
  }

  if (filters?.hasAudio) {
    list = list.filter((r) => r.hadAudio);
  }

  if (filters?.hasImage) {
    list = list.filter((r) => r.hadImage);
  }

  if (filters?.hasRepetition) {
    list = list.filter((r) => r.repetitionDetected);
  }

  if (filters?.hasFeedback) {
    list = list.filter((r) => Boolean(r.adminFeedback?.reviewedAt));
  }

  if (filters?.search) {
    const q = filters.search.toLowerCase();
    list = list.filter(
      (r) =>
        r.userMessage.toLowerCase().includes(q) ||
        r.aiResponse.toLowerCase().includes(q) ||
        r.clientPhone.includes(q) ||
        (r.clientName && r.clientName.toLowerCase().includes(q)) ||
        (r.tenantName && r.tenantName.toLowerCase().includes(q))
    );
  }

  const page = Math.max(1, filters?.page || 1);
  const limit = Math.max(1, Math.min(100, filters?.limit || 25));
  const total = list.length;
  const totalPages = Math.ceil(total / limit) || 1;
  const data = list.slice((page - 1) * limit, page * limit);

  return {
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages,
    },
  };
}

/**
 * Exporta el dataset de interacciones en formato JSONL para Fine-Tuning en Gemini
 */
export async function exportFineTuningDataset(scope?: "ALL" | "PLATFORM" | "TENANT") {
  await loadFromDb();

  let list = Array.from(recordsMap.values());
  if (scope && scope !== "ALL") {
    list = list.filter((r) => r.scope === scope);
  }

  // Filtrar o priorizar ejemplos corregidos y resueltos exitosamente
  const validForTraining = list.filter(
    (r) =>
      r.adminFeedback?.isGoldenSample ||
      (r.outcome === "RESOLVED" && !r.repetitionDetected && !r.humanIntervened) ||
      Boolean(r.adminFeedback?.correctedResponse)
  );

  const jsonlLines = validForTraining.map((rec) => {
    const systemPrompt =
      rec.scope === "PLATFORM"
        ? "Sos el Asistente Oficial de Soporte y Ventas de AgendatePY. Respondé en tono amigable paraguayo, breve y claro."
        : `Sos el Asistente Oficial de WhatsApp de ${rec.tenantName || "este local"}. Ayudás a clientes a agendar turnos y responder dudas.`;

    const assistantText = rec.adminFeedback?.correctedResponse || rec.aiResponse;

    return JSON.stringify({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: rec.userMessage },
        { role: "assistant", content: assistantText },
      ],
      metadata: {
        scope: rec.scope,
        tenant: rec.tenantName,
        intent: rec.intent,
        isGoldenSample: Boolean(rec.adminFeedback?.isGoldenSample),
      },
    });
  });

  return jsonlLines.join("\n");
}
