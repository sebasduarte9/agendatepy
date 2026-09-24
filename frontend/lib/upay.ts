export type UpayPaymentMethod = "CARD" | "QR_ZIMPLE" | "SIPAP" | "CASH";

export interface UpayPaymentRequest {
  tenantId: string;
  amount: number;
  description: string;
  clientName: string;
  clientPhone: string;
  paymentMethod: UpayPaymentMethod;
}

export interface UpayPaymentResult {
  ok: boolean;
  transactionId: string;
  authorizationCode: string;
  amount: number;
  currency: "PYG";
  status: "APPROVED" | "PENDING_CONFIRMATION" | "REJECTED";
  paymentMethod: UpayPaymentMethod;
  timestamp: string;
  receiptUrl?: string;
  error?: string;
}

/**
 * Procesar cobro con uPay (Simulación completa para Paraguay)
 */
export async function processUpayPayment(
  req: UpayPaymentRequest
): Promise<UpayPaymentResult> {
  // Simular latencia de red de procesador de tarjetas / Bancard / uPay
  await new Promise((res) => setTimeout(res, 800));

  const randomNum = Math.floor(100000 + Math.random() * 900000);
  const txId = `UPAY-PY-${Date.now().toString().slice(-6)}-${randomNum}`;
  const authCode = `AUTH-${Math.floor(10000 + Math.random() * 90000)}`;

  return {
    ok: true,
    transactionId: txId,
    authorizationCode: authCode,
    amount: req.amount,
    currency: "PYG",
    status: "APPROVED",
    paymentMethod: req.paymentMethod,
    timestamp: new Date().toISOString(),
    receiptUrl: `/comprobante/${txId}`,
  };
}
