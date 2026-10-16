import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireTenantSession, isGuardError, UUID_REGEX } from "@/lib/api-guard";
import { receiptListSelect, serializeReceipt } from "@/lib/payment-receipts";

export const dynamic = "force-dynamic";

type RouteProps = {
  params: Promise<{ id: string }>;
};

class ReceiptConflictError extends Error {}

/**
 * Aprobar o rechazar un comprobante. En la misma transacción actualiza el turno:
 * aprobado → CONFIRMED (si esperaba pago); rechazado → CANCELLED (libera el horario).
 */
export async function PATCH(request: NextRequest, { params }: RouteProps) {
  try {
    const auth = await requireTenantSession(request, ["OWNER", "SUPERADMIN", "STAFF"]);
    if (isGuardError(auth)) return auth;

    const { id } = await params;
    if (!UUID_REGEX.test(id)) {
      return NextResponse.json(
        { ok: false, error: "VALIDATION_ERROR", message: "ID de comprobante inválido." },
        { status: 400 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const status = body.status === "approved" ? "APPROVED" : body.status === "rejected" ? "REJECTED" : null;
    if (!status) {
      return NextResponse.json(
        { ok: false, error: "VALIDATION_ERROR", message: "Estado inválido." },
        { status: 400 }
      );
    }
    const note = typeof body.note === "string" ? body.note.trim().slice(0, 500) : undefined;

    const result = await prisma.$transaction(async (tx) => {
      // Solo se revisan comprobantes pendientes: evita dobles aprobaciones desde dos pestañas
      const { count } = await tx.paymentReceipt.updateMany({
        where: { id, tenantId: auth.tenantId, status: "PENDING" },
        data: {
          status,
          reviewedBy: auth.session.name || null,
          reviewedAt: new Date(),
          ...(note !== undefined ? { note } : {}),
        },
      });
      if (count === 0) throw new ReceiptConflictError();

      const receipt = await tx.paymentReceipt.findUniqueOrThrow({
        where: { id },
        select: receiptListSelect,
      });

      let appointmentStatus: string | null = null;
      if (receipt.appointmentId) {
        const updated = await tx.appointment.updateMany({
          where:
            status === "APPROVED"
              ? { id: receipt.appointmentId, tenantId: auth.tenantId, status: "PENDING_ACTION" }
              : { id: receipt.appointmentId, tenantId: auth.tenantId, status: { in: ["PENDING_ACTION", "CONFIRMED"] } },
          data: { status: status === "APPROVED" ? "CONFIRMED" : "CANCELLED" },
        });
        if (updated.count > 0) appointmentStatus = status === "APPROVED" ? "confirmed" : "cancelled";
      }

      return { receipt, appointmentStatus };
    });

    return NextResponse.json({
      ok: true,
      receipt: serializeReceipt(result.receipt),
      appointmentStatus: result.appointmentStatus,
    });
  } catch (error) {
    if (error instanceof ReceiptConflictError) {
      return NextResponse.json(
        { ok: false, error: "ALREADY_REVIEWED", message: "Este comprobante ya fue revisado o no existe." },
        { status: 409 }
      );
    }
    console.error("Error en PATCH /api/receipts/[id]:", error);
    return NextResponse.json(
      { ok: false, error: "DB_UNAVAILABLE", message: "No se pudo actualizar el comprobante." },
      { status: 500 }
    );
  }
}
