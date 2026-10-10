/**
 * Detección de Usuarios y Normalización Telefónica de AgendatePY
 *
 * Desacoplado para evitar dependencias circulares entre el agente y el almacén del CRM.
 */

import { prisma } from "@/lib/db";

export interface UserDetectionResult {
  isRegistered: boolean;
  role: "OWNER" | "STAFF" | "CLIENT" | "LEAD";
  userName?: string;
  userEmail?: string;
  businessName?: string;
  businessSlug?: string;
  businessPlan?: string;
  tenantId?: string;
  clientAppointmentsCount?: number;
}

/**
 * Normaliza número paraguayo o internacional para búsqueda flexible
 */
export function extractPhoneDigits(phone: string): { full: string; core: string } {
  const cleaned = phone.replace(/\D/g, "");
  // En Paraguay: 595981123456 -> core: 981123456 (últimos 8 o 9 dígitos)
  let core = cleaned;
  if (cleaned.startsWith("595")) {
    core = cleaned.slice(3);
  } else if (cleaned.startsWith("0")) {
    core = cleaned.slice(1);
  }
  return {
    full: cleaned,
    core: core.slice(-8), // Últimos 8 dígitos para match tolerante
  };
}

/**
 * Detecta si el número pertenece a un usuario registrado en la base de datos
 */
export async function detectAgendateUser(phone: string): Promise<UserDetectionResult> {
  const { full, core } = extractPhoneDigits(phone);

  try {
    // 1. Buscar en usuarios de la plataforma (Dueños o Staff)
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { phone: { contains: core } },
          { phone: { contains: full } },
        ],
      },
      include: {
        tenant: true,
      },
    });

    if (user) {
      return {
        isRegistered: true,
        role: user.role === "STAFF" ? "STAFF" : "OWNER",
        userName: user.name,
        userEmail: user.email,
        businessName: user.tenant?.name,
        businessSlug: user.tenant?.slug,
        businessPlan: user.tenant?.plan,
        tenantId: user.tenantId || undefined,
      };
    }

    // 2. Buscar si el número está en la configuración de algún Tenant (whatsappPhone del negocio)
    const tenants = await prisma.tenant.findMany({
      where: { status: "ACTIVE" },
      select: { id: true, name: true, slug: true, plan: true, settings: true },
    });

    for (const t of tenants) {
      const settings = (t.settings as any) || {};
      const tPhone = String(settings.whatsappPhone || "").replace(/\D/g, "");
      if (tPhone && (tPhone.includes(core) || core.includes(tPhone.slice(-8)))) {
        return {
          isRegistered: true,
          role: "OWNER",
          businessName: t.name,
          businessSlug: t.slug,
          businessPlan: t.plan,
          tenantId: t.id,
        };
      }
    }

    // 3. Buscar si es un cliente recurrente que agenda en la plataforma
    const client = await prisma.client.findFirst({
      where: {
        phone: { contains: core },
      },
      include: {
        tenant: true,
        appointments: {
          take: 3,
          orderBy: { startTime: "desc" },
        },
      },
    });

    if (client) {
      return {
        isRegistered: true,
        role: "CLIENT",
        userName: client.name,
        businessName: client.tenant.name,
        businessSlug: client.tenant.slug,
        tenantId: client.tenantId,
        clientAppointmentsCount: client.appointments.length,
      };
    }

    // 4. Buscar en citas recientes por clientPhone
    const recentAppointment = await prisma.appointment.findFirst({
      where: {
        clientPhone: { contains: core },
      },
      include: {
        tenant: true,
      },
      orderBy: { startTime: "desc" },
    });

    if (recentAppointment) {
      return {
        isRegistered: true,
        role: "CLIENT",
        userName: recentAppointment.clientName,
        businessName: recentAppointment.tenant.name,
        businessSlug: recentAppointment.tenant.slug,
        tenantId: recentAppointment.tenantId,
        clientAppointmentsCount: 1,
      };
    }

    // 5. No registrado (Lead / Nuevo usuario)
    return {
      isRegistered: false,
      role: "LEAD",
    };
  } catch (error) {
    console.error("[UserDetection] Error detectando usuario:", error);
    return {
      isRegistered: false,
      role: "LEAD",
    };
  }
}
