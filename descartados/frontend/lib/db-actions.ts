"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { CashMovementType, CommissionStatus } from "@prisma/client";

/**
 * Obtener clientes reales desde PostgreSQL
 */
export async function getClientsFromDb(tenantSlug = "barberia") {
  try {
    const tenant = await prisma.tenant.findUnique({
      where: { subdomain: tenantSlug },
      select: { id: true },
    });
    if (!tenant) return [];

    return await prisma.client.findMany({
      where: { tenantId: tenant.id },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("Error fetching clients:", error);
    return [];
  }
}

/**
 * Registrar cliente en PostgreSQL
 */
export async function createClientInDb({
  name,
  phone,
  email,
  notes,
  tenantSlug = "barberia",
}: {
  name: string;
  phone: string;
  email?: string;
  notes?: string;
  tenantSlug?: string;
}) {
  try {
    const tenant = await prisma.tenant.findUnique({
      where: { subdomain: tenantSlug },
      select: { id: true },
    });
    if (!tenant) throw new Error("Local no encontrado");

    const client = await prisma.client.create({
      data: {
        tenantId: tenant.id,
        name,
        phone,
        email: email || null,
        notes: notes || null,
      },
    });

    revalidatePath("/dashboard/clientes");
    return { ok: true, client };
  } catch (error) {
    console.error("Error creating client:", error);
    return { ok: false, error: "No se pudo registrar el cliente" };
  }
}

/**
 * Obtener movimientos de caja desde PostgreSQL
 */
export async function getCashMovementsFromDb(tenantSlug = "barberia") {
  try {
    const tenant = await prisma.tenant.findUnique({
      where: { subdomain: tenantSlug },
      select: { id: true },
    });
    if (!tenant) return [];

    return await prisma.cashMovement.findMany({
      where: { tenantId: tenant.id },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("Error fetching cash movements:", error);
    return [];
  }
}

/**
 * Registrar movimiento de caja en PostgreSQL
 */
export async function createCashMovementInDb({
  type,
  amount,
  category,
  description,
  paymentMethod = "Efectivo",
  createdBy = "Administrador",
  tenantSlug = "barberia",
}: {
  type: "INCOME" | "EXPENSE";
  amount: number;
  category: string;
  description: string;
  paymentMethod?: string;
  createdBy?: string;
  tenantSlug?: string;
}) {
  try {
    const tenant = await prisma.tenant.findUnique({
      where: { subdomain: tenantSlug },
      select: { id: true },
    });
    if (!tenant) throw new Error("Local no encontrado");

    const movement = await prisma.cashMovement.create({
      data: {
        tenantId: tenant.id,
        type: type === "INCOME" ? CashMovementType.INCOME : CashMovementType.EXPENSE,
        amount,
        category,
        description,
        paymentMethod,
        createdBy,
      },
    });

    revalidatePath("/dashboard/caja");
    return { ok: true, movement };
  } catch (error) {
    console.error("Error creating cash movement:", error);
    return { ok: false, error: "No se pudo guardar el movimiento de caja" };
  }
}

/**
 * Obtener comisiones desde PostgreSQL
 */
export async function getCommissionsFromDb(tenantSlug = "barberia") {
  try {
    const tenant = await prisma.tenant.findUnique({
      where: { subdomain: tenantSlug },
      select: { id: true },
    });
    if (!tenant) return [];

    return await prisma.commission.findMany({
      where: { tenantId: tenant.id },
      include: {
        staff: { select: { id: true, name: true } },
        appointment: { select: { id: true, clientName: true, startTime: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("Error fetching commissions:", error);
    return [];
  }
}

/**
 * Obtener recompensas de fidelización desde PostgreSQL
 */
export async function getLoyaltyRewardsFromDb(tenantSlug = "barberia") {
  try {
    const tenant = await prisma.tenant.findUnique({
      where: { subdomain: tenantSlug },
      select: { id: true },
    });
    if (!tenant) return [];

    return await prisma.loyaltyReward.findMany({
      where: { tenantId: tenant.id },
      orderBy: { pointsRequired: "asc" },
    });
  } catch (error) {
    console.error("Error fetching loyalty rewards:", error);
    return [];
  }
}
