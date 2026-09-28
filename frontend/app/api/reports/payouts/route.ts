import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireTenantSession, isGuardError } from "@/lib/api-guard";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const auth = await requireTenantSession(request, ["OWNER", "SUPERADMIN"]);
    if (isGuardError(auth)) return auth;

    const { searchParams } = new URL(request.url);
    const staffId = searchParams.get("staffId");

    const where: any = {
      tenantId: auth.tenantId,
    };

    if (staffId) {
      where.staffId = staffId;
    }

    const payouts = await prisma.commissionPayout.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        staff: true,
        items: true,
      },
    });

    const totalPaid = payouts.reduce((acc, p) => acc + (p.amountPaid || 0), 0);

    return NextResponse.json({
      ok: true,
      data: {
        payouts,
        summary: {
          totalPaid,
          payoutCount: payouts.length,
        },
      },
    });
  } catch (error) {
    console.error("Error en GET /api/reports/payouts:", error);
    return NextResponse.json(
      { ok: false, error: "SERVER_ERROR", message: "Error al generar reporte de liquidaciones." },
      { status: 500 }
    );
  }
}
