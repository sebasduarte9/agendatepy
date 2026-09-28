import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireTenantSession, isGuardError, UUID_REGEX } from "@/lib/api-guard";

export const dynamic = "force-dynamic";

type RouteProps = {
  params: Promise<{ id: string }>;
};

export async function GET(request: NextRequest, { params }: RouteProps) {
  try {
    const auth = await requireTenantSession(request);
    if (isGuardError(auth)) return auth;

    const { id } = await params;
    if (!UUID_REGEX.test(id)) {
      return NextResponse.json(
        { ok: false, error: "VALIDATION_ERROR", message: "ID de liquidación inválido." },
        { status: 400 }
      );
    }

    const payout = await prisma.commissionPayout.findFirst({
      where: {
        id,
        tenantId: auth.tenantId,
      },
      include: {
        staff: {
          select: { id: true, name: true, commissionPercentage: true },
        },
        cashMovement: {
          select: { id: true, amount: true, paymentMethod: true, createdAt: true },
        },
        items: {
          orderBy: { appointmentDate: "asc" },
        },
      },
    });

    if (!payout) {
      return NextResponse.json(
        { ok: false, error: "NOT_FOUND", message: "Liquidación no encontrada." },
        { status: 404 }
      );
    }

    // Seguridad de roles: STAFF solo puede ver sus propias liquidaciones
    if (auth.session.role === "STAFF") {
      const user = await prisma.user.findUnique({
        where: { id: auth.session.id },
        select: { staffId: true },
      });

      if (!user?.staffId || payout.staffId !== user.staffId) {
        return NextResponse.json(
          { ok: false, error: "FORBIDDEN", message: "No tienes permiso para ver esta liquidación." },
          { status: 403 }
        );
      }
    }

    return NextResponse.json({
      ok: true,
      payout: {
        id: payout.id,
        staffId: payout.staffId,
        staffName: payout.staff.name,
        periodStart: payout.periodStart.toISOString(),
        periodEnd: payout.periodEnd.toISOString(),
        grossCommission: payout.grossCommission,
        amountPaid: payout.amountPaid,
        paymentMethod: payout.paymentMethod,
        cashMovementId: payout.cashMovementId,
        status: payout.status,
        paidAt: payout.paidAt?.toISOString() || null,
        paidBy: payout.paidBy,
        notes: payout.notes,
        createdAt: payout.createdAt.toISOString(),
        items: payout.items.map((i) => ({
          id: i.id,
          appointmentId: i.appointmentId,
          serviceName: i.serviceName,
          clientName: i.clientName,
          appointmentDate: i.appointmentDate.toISOString(),
          chargedAmount: i.chargedAmount,
          commissionPercentage: i.commissionPercentage,
          commissionAmount: i.commissionAmount,
        })),
      },
    });
  } catch (error) {
    console.error("Error en GET /api/commission-payouts/[id]:", error);
    return NextResponse.json(
      { ok: false, error: "DB_UNAVAILABLE", message: "Error al consultar detalle de liquidación." },
      { status: 500 }
    );
  }
}
