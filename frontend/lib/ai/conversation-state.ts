/**
 * Gestor de Estado de Conversación, Memoria Multi-Turno y Pausa Humana
 *
 * Funciones clave:
 * 1. Memoria Multi-Turno: Recuerda los últimos 6 mensajes por (tenantId, clientPhone)
 *    para que el cliente pueda decir "reservame el primero" o "a esa hora" y la IA entienda el contexto.
 * 2. Pausa Inteligente por Intervención Humana (Human Takeover):
 *    Si el dueño del negocio responde manualmente desde su WhatsApp o el CRM (fromMe: true),
 *    el bot se silencia automáticamente por 30 minutos para ese cliente para no solaparse.
 */

export interface ChatMessageTurn {
  role: "user" | "model";
  text: string;
  timestamp: number;
}

interface ClientConversationState {
  messages: ChatMessageTurn[];
  humanPausedUntil: number | null; // timestamp en ms hasta cuando el bot está en silencio
  lastActivity: number;
}

class ConversationStateManager {
  private states: Map<string, ClientConversationState> = new Map();
  private readonly DEFAULT_PAUSE_MS = 30 * 60 * 1000; // 30 minutos de pausa
  private readonly MAX_TURNS = 8; // Máximo número de mensajes en memoria

  private getKey(tenantId: string, clientPhone: string): string {
    const cleanPhone = clientPhone.replace(/\D/g, "").slice(-8); // últimos 8 dígitos
    return `${tenantId}:${cleanPhone}`;
  }

  private getOrCreate(tenantId: string, clientPhone: string): ClientConversationState {
    const key = this.getKey(tenantId, clientPhone);
    let state = this.states.get(key);
    if (!state) {
      state = {
        messages: [],
        humanPausedUntil: null,
        lastActivity: Date.now(),
      };
      this.states.set(key, state);
    }
    return state;
  }

  /**
   * Registra que un humano (el dueño o recepcionista) escribió al cliente
   */
  public recordHumanIntervention(tenantId: string, clientPhone: string, durationMs?: number): void {
    const state = this.getOrCreate(tenantId, clientPhone);
    const pauseTime = durationMs ?? this.DEFAULT_PAUSE_MS;
    state.humanPausedUntil = Date.now() + pauseTime;
    state.lastActivity = Date.now();
    console.log(`[ConversationState] Bot pausado para ${clientPhone} hasta ${new Date(state.humanPausedUntil).toLocaleTimeString()}`);
  }

  /**
   * Verifica si el bot está silenciado debido a intervención humana
   */
  public isBotPaused(tenantId: string, clientPhone: string): { paused: boolean; minutesRemaining: number } {
    const state = this.getOrCreate(tenantId, clientPhone);
    if (!state.humanPausedUntil) {
      return { paused: false, minutesRemaining: 0 };
    }

    const now = Date.now();
    if (now < state.humanPausedUntil) {
      const minutesRemaining = Math.ceil((state.humanPausedUntil - now) / 60000);
      return { paused: true, minutesRemaining };
    }

    // Ya venció el tiempo de pausa
    state.humanPausedUntil = null;
    return { paused: false, minutesRemaining: 0 };
  }

  /**
   * Reactiva manualmente el bot para un cliente
   */
  public resumeBot(tenantId: string, clientPhone: string): void {
    const state = this.getOrCreate(tenantId, clientPhone);
    state.humanPausedUntil = null;
    state.lastActivity = Date.now();
  }

  /**
   * Agrega un mensaje al historial de la conversación
   */
  public addTurn(tenantId: string, clientPhone: string, role: "user" | "model", text: string): void {
    const state = this.getOrCreate(tenantId, clientPhone);
    state.messages.push({
      role,
      text: text.trim(),
      timestamp: Date.now(),
    });

    // Mantener sólo los últimos N mensajes para optimizar tokens
    if (state.messages.length > this.MAX_TURNS) {
      state.messages = state.messages.slice(-this.MAX_TURNS);
    }
    state.lastActivity = Date.now();
  }

  /**
   * Obtiene el historial formateado para los contents de Gemini
   */
  public getHistoryForGemini(tenantId: string, clientPhone: string): Array<{ role: "user" | "model"; parts: Array<{ text: string }> }> {
    const state = this.getOrCreate(tenantId, clientPhone);
    return state.messages.map((m) => ({
      role: m.role,
      parts: [{ text: m.text }],
    }));
  }

  /**
   * Limpia estados inactivos de más de 24 horas para liberar RAM
   */
  public cleanupStale(): void {
    const now = Date.now();
    const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
    for (const [key, state] of this.states.entries()) {
      if (now - state.lastActivity > TWENTY_FOUR_HOURS) {
        this.states.delete(key);
      }
    }
  }
}

export const conversationState = new ConversationStateManager();
