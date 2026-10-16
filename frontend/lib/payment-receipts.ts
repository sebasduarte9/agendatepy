import type { PaymentReceipt, PaymentReceiptStatus } from "@prisma/client";
import type { Receipt } from "@/lib/dashboard-types";

/** Columnas a leer para listar comprobantes (sin la imagen, que va por /api/receipts/[id]/image). */
export const receiptListSelect = {
  id: true,
  appointmentId: true,
  clientName: true,
  clientPhone: true,
  amount: true,
  status: true,
  note: true,
  bankOrigin: true,
  operationNumber: true,
  ocrVerified: true,
  ocrConfidence: true,
  channel: true,
  imageMime: true,
  reviewedBy: true,
  reviewedAt: true,
  createdAt: true,
} as const;

type ReceiptRow = Omit<PaymentReceipt, "imageData" | "tenantId">;

const STATUS_TO_CLIENT: Record<PaymentReceiptStatus, Receipt["status"]> = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
};

export function serializeReceipt(r: ReceiptRow): Receipt {
  return {
    id: r.id,
    appointmentId: r.appointmentId || "",
    clientName: r.clientName,
    clientPhone: r.clientPhone || undefined,
    amount: r.amount,
    submittedAt: r.createdAt.toISOString(),
    status: STATUS_TO_CLIENT[r.status],
    note: r.note,
    bankOrigin: r.bankOrigin || undefined,
    operationNumber: r.operationNumber || undefined,
    ocrVerified: r.ocrVerified,
    ocrConfidence: r.ocrConfidence ?? undefined,
    channel: (r.channel as Receipt["channel"]) || "whatsapp",
    receiptUrl: r.imageMime ? `/api/receipts/${r.id}/image` : undefined,
  };
}
