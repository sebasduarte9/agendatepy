import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireTenantSession, isGuardError } from "@/lib/api-guard";
import { AppointmentStatus, CashMovementType } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const auth = await requireTenantSession(request, ["OWNER", "SUPERADMIN"]);
    if (isGuardError(auth)) return auth;

    const { searchParams } = new URL(request.url);
    const staffId = searchParams.get("staffId");

    const where: any = {
      tenantId: auth.tenantId,
      status: AppointmentStatus.COMPLETED,
    };

    if (staffId) {
      where.staffId = staffId;
    }

    const appointments = await prisma.appointment.findMany({
      where,
      include: {
        service: true,
        staff: true,
      },
    });

    return NextResponse.json({
      ok: true,
      data: {
        appointments,
        total: appointments.length,
      },
    });
  } catch (error) {
    console.error("Error en GET /api/reports/commissions:", error);
    return NextResponse.json(
      { ok: false, error: "SERVER_ERROR", message: "Error al generar reporte de comisiones." },
      { status: 500 }
    );
  }
}
