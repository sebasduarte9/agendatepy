export type AgendaTone = "confirmed" | "pending" | "expired" | "cancelled" | "other";

export function agendaTone(
  status: string,
  expiresAt: Date | null,
  now = Date.now(),
): AgendaTone {
  if (status === "PENDING_ACTION" && expiresAt && expiresAt.getTime() <= now) {
    return "expired";
  }
  if (status === "CONFIRMED") return "confirmed";
  if (status === "PENDING_ACTION") return "pending";
  if (status === "EXPIRED") return "expired";
  if (status === "CANCELLED") return "cancelled";
  return "other";
}

export function agendaLabel(tone: AgendaTone, status: string): string {
  if (tone === "confirmed") return "Confirmado";
  if (tone === "pending") return "Pendiente de WhatsApp";
  if (tone === "expired") return "Vencido";
  if (tone === "cancelled") return "Cancelado";
  if (status === "COMPLETED") return "Completado";
  if (status === "NO_SHOW") return "No vino";
  return status;
}
