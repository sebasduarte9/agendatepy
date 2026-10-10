/**
 * Almacén Persistente de Conversaciones para el CRM de WhatsApp
 *
 * Guarda y recupera mensajes reales entrantes y salientes.
 * Sin datos ficticios ni ejemplos inventados.
 */

import { prisma } from "@/lib/db";
import { detectAgendateUser, extractPhoneDigits } from "@/lib/ai/user-detection";
import { conversationState } from "@/lib/ai/conversation-state";
import { formatInTimeZone } from "date-fns-tz";

export interface StoredMessage {
  id: string;
  sender: "client" | "agent" | "bot";
  text: string;
  time: string;
  timestamp: number;
  isAi?: boolean;
  mediaType?: "audio" | "image" | "document";
  mediaUrl?: string; // Data URL en base64 para reproducción de audio o preview de imagen
}

export interface StoredConversation {
  id: string;
  phone: string;
  name: string;
  role: "OWNER" | "LEAD" | "CLIENT" | "STAFF";
  businessName?: string;
  businessSlug?: string;
  businessPlan?: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  aiPaused?: boolean;
  minutesPausedRemaining?: number;
  tags: string[];
  notes?: string;
  messages: StoredMessage[];
  updatedAt: number;
}

const CRM_KEY = "crm_conversations_data";

// Memoria rápida en isolate
const memoryStore = new Map<string, StoredConversation>();
let isLoaded = false;

async function loadFromDb() {
  if (isLoaded) return;
  try {
    const row = await prisma.platformSetting.findUnique({
      where: { key: CRM_KEY },
    });
    if (row && row.value && typeof row.value === "object") {
      const data = (row.value as unknown) as Record<string, StoredConversation>;
      for (const [phone, conv] of Object.entries(data)) {
        memoryStore.set(phone, conv);
      }
    }
    isLoaded = true;
  } catch (err) {
    console.warn("[CRM Store] Error cargando de BD:", err);
  }
}

async function syncToDb() {
  try {
    const dataObj: Record<string, StoredConversation> = {};
    for (const [phone, conv] of memoryStore.entries()) {
      dataObj[phone] = conv;
    }
    await prisma.platformSetting.upsert({
      where: { key: CRM_KEY },
      create: { key: CRM_KEY, value: dataObj as any },
      update: { value: dataObj as any },
    });
  } catch (err) {
    console.warn("[CRM Store] Error persistiendo en BD:", err);
  }
}

/**
 * Registra un mensaje real en el CRM
 */
export async function recordCrmMessage(params: {
  phone: string;
  name?: string;
  sender: "client" | "agent" | "bot";
  text: string;
  isAi?: boolean;
  mediaType?: "audio" | "image" | "document";
  mediaUrl?: string;
}): Promise<StoredConversation> {
  await loadFromDb();

  const { full, core } = extractPhoneDigits(params.phone);
  const cleanPhone = full.startsWith("595") ? full : `595${core}`;
  const formattedPhone = `+${cleanPhone}`;

  let conv = memoryStore.get(cleanPhone);

  const now = Date.now();
  const timeFormatted = formatInTimeZone(new Date(now), "America/Asuncion", "HH:mm");

  if (!conv) {
    // Detectar perfil real del usuario
    const userProfile = await detectAgendateUser(params.phone);

    conv = {
      id: `conv-${cleanPhone}`,
      phone: formattedPhone,
      name: params.name || userProfile.userName || `WhatsApp (${core.slice(-4)})`,
      role: userProfile.role,
      businessName: userProfile.businessName,
      businessSlug: userProfile.businessSlug,
      businessPlan: userProfile.businessPlan,
      lastMessage: params.text,
      lastMessageTime: timeFormatted,
      unreadCount: params.sender === "client" ? 1 : 0,
      tags: [
        userProfile.role === "OWNER"
          ? "Dueño Registrado"
          : userProfile.role === "CLIENT"
          ? "Cliente Final"
          : "Lead Comercial",
      ],
      messages: [],
      updatedAt: now,
    };
  } else {
    conv.lastMessage = params.text;
    conv.lastMessageTime = timeFormatted;
    conv.updatedAt = now;
    if (params.sender === "client") {
      conv.unreadCount += 1;
    }
    if (params.name && (!conv.name || conv.name.startsWith("WhatsApp"))) {
      conv.name = params.name;
    }
  }

  // Agregar mensaje
  conv.messages.push({
    id: `m-${now}-${Math.random().toString(36).substring(2, 7)}`,
    sender: params.sender,
    text: params.text,
    time: timeFormatted,
    timestamp: now,
    isAi: params.isAi,
    mediaType: params.mediaType,
    mediaUrl: params.mediaUrl,
  });

  // Mantener últimos 50 mensajes por chat
  if (conv.messages.length > 50) {
    conv.messages = conv.messages.slice(-50);
  }

  memoryStore.set(cleanPhone, conv);
  void syncToDb();

  return conv;
}

/**
 * Obtiene la conversación activa de un teléfono específico
 */
export async function getCrmConversation(phone: string): Promise<StoredConversation | null> {
  await loadFromDb();
  const { full, core } = extractPhoneDigits(phone);
  const cleanPhone = full.startsWith("595") ? full : `595${core}`;
  return memoryStore.get(cleanPhone) || memoryStore.get(full) || null;
}

/**
 * Obtiene los mensajes reales previos de un número telefónico
 */
export async function getCrmMessages(phone: string): Promise<StoredMessage[]> {
  const conv = await getCrmConversation(phone);
  return conv?.messages || [];
}

/**
 * Obtiene todas las conversaciones reales ordenadas por actividad reciente
 */
export async function getAllCrmConversations(): Promise<StoredConversation[]> {
  await loadFromDb();

  const list: StoredConversation[] = [];

  for (const conv of memoryStore.values()) {
    const pauseInfo = conversationState.isBotPaused("agendatepy-official", conv.phone);
    list.push({
      ...conv,
      aiPaused: pauseInfo.paused,
      minutesPausedRemaining: pauseInfo.minutesRemaining,
    } as any);
  }

  // Ordenar de más reciente a más antiguo
  return list.sort((a, b) => b.updatedAt - a.updatedAt);
}

/**
 * Marca mensajes de una conversación como leídos
 */
export async function markCrmAsRead(phone: string): Promise<void> {
  await loadFromDb();
  const { full } = extractPhoneDigits(phone);
  const conv = memoryStore.get(full);
  if (conv) {
    conv.unreadCount = 0;
    void syncToDb();
  }
}

/**
 * Borra todo el historial de conversaciones del CRM
 */
export async function clearAllCrmData(): Promise<void> {
  memoryStore.clear();
  isLoaded = true;
  conversationState.clearAll();
  try {
    await prisma.platformSetting.deleteMany({
      where: { key: { in: [CRM_KEY, "crm_conversations_v1"] } },
    });
  } catch (err) {
    console.warn("[CRM Store] Error limpiando BD:", err);
  }
}

/**
 * Borra una conversación específica
 */
export async function deleteCrmConversation(phone: string): Promise<void> {
  await loadFromDb();
  const { full, core } = extractPhoneDigits(phone);
  const cleanPhone = full.startsWith("595") ? full : `595${core}`;
  memoryStore.delete(cleanPhone);
  memoryStore.delete(full);
  conversationState.clearPhone("agendatepy-official", phone);
  await syncToDb();
}
