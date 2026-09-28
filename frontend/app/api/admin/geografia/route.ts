import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireSuperAdminSession, isGuardError } from "@/lib/api-guard";
import { CashMovementType } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const auth = await requireSuperAdminSession(request);
    if (isGuardError(auth)) return auth;

    const tenants = await prisma.tenant.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        status: true,
        settings: true,
        createdAt: true,
        _count: {
          select: {
            appointments: true,
            clients: true,
            cashMovements: true,
          },
        },
        appointments: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { createdAt: true },
        },
        cashMovements: {
          where: { type: CashMovementType.INCOME },
          select: { amount: true },
        },
      },
      orderBy: { name: "asc" },
    });

    const now = new Date();
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    const cityMap: Record<
      string,
      {
        city: string;
        department: string;
        tenantsCount: number;
        activeTenantsCount: number;
        totalAppointments: number;
        totalIncome: number;
        tenants: Array<{
          id: string;
          name: string;
          slug: string;
          status: string;
          isActive: boolean;
          appointmentsCount: number;
          income: number;
        }>;
      }
    > = {};

    tenants.forEach((t) => {
      const settings = (t.settings as any) || {};
      const rawCity = typeof settings.city === "string" ? settings.city.trim() : "";
      const rawDept = typeof settings.department === "string" ? settings.department.trim() : "";

      const city = rawCity || "Sin ciudad especificada";
      const department = rawDept || "Sin departamento";
      const key = `${city}__${department}`;

      if (!cityMap[key]) {
        cityMap[key] = {
          city,
          department,
          tenantsCount: 0,
          activeTenantsCount: 0,
          totalAppointments: 0,
          totalIncome: 0,
          tenants: [],
        };
      }

      const lastAppDate = t.appointments[0]?.createdAt || null;
      const isActive = lastAppDate ? new Date(lastAppDate) >= fourteenDaysAgo : false;
      const incomeSum = t.cashMovements.reduce((sum, c) => sum + c.amount, 0);

      cityMap[key].tenantsCount += 1;
      if (isActive) cityMap[key].activeTenantsCount += 1;
      cityMap[key].totalAppointments += t._count.appointments;
      cityMap[key].totalIncome += incomeSum;

      cityMap[key].tenants.push({
        id: t.id,
        name: t.name,
        slug: t.slug,
        status: t.status,
        isActive,
        appointmentsCount: t._count.appointments,
        income: incomeSum,
      });
    });

    const citiesList = Object.values(cityMap).sort((a, b) => b.tenantsCount - a.tenantsCount);

    return NextResponse.json({
      ok: true,
      hasCoordinates: false, // Fase T: No se inventan coordenadas lat/long
      totalCities: citiesList.length,
      cities: citiesList,
      generatedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("[GET /api/admin/geografia] Error:", error);
    return NextResponse.json(
      { ok: false, error: "SERVER_ERROR", message: "Error al obtener distribución geográfica." },
      { status: 500 }
    );
  }
}
