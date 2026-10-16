import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireTenantSession, isGuardError } from "@/lib/api-guard";
import { receiptListSelect, serializeReceipt } from "@/lib/payment-receipts";

export const dynamic = "force-dynamic";

// Comprobantes de transferencia del negocio (más recientes primero)
export async function GET(request: NextRequest) {
  try {
    const auth = await requireTenantSession(request, ["OWNER", "SUPERADMIN", "STAFF"]);
    if (isGuardError(auth)) return auth;

    const receipts = await prisma.paymentReceipt.findMany({
      where: { tenantId: auth.tenantId },
      select: receiptListSelect,
      orderBy: { createdAt: "desc" },
      take: 200,
    });

    return NextResponse.json({ ok: true, receipts: receipts.map(serializeReceipt) });
  } catch (error) {
    console.error("Error en GET /api/receipts:", error);
    return NextResponse.json(
      { ok: false, error: "DB_UNAVAILABLE", message: "No pudimos consultar los comprobantes." },
      { status: 500 }
    );
  }
}
