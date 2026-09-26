"use server";

import { prisma } from "@/lib/db";
import { getSession, setSession } from "@/lib/auth/session";
import type { SessionUser } from "@/lib/auth/types";

export interface OnboardingInput {
  businessName: string;
  category: string;
  slug: string;
  serviceName: string;
  duration: number;
  price: number;
  whatsapp: string;
}

export async function createTenantOnboardingAction(input: OnboardingInput) {
  try {
    const session = await getSession();

    let cleanSlug = input.slug
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "")
      .replace(/-+/g, "-")
      .trim();

    if (!cleanSlug || cleanSlug.length < 2) {
      cleanSlug = `negocio-${Date.now().toString().slice(-4)}`;
    }

    // Comprobar si el slug ya existe, si existe agregar sufijo
    const existing = await prisma.tenant.findUnique({
      where: { subdomain: cleanSlug },
    });
    if (existing) {
      cleanSlug = `${cleanSlug}-${Math.floor(100 + Math.random() * 900)}`;
    }

    // Crear tenant, servicio y staff en transacción
    const result = await prisma.$transaction(async (tx) => {
      const tenant = await tx.tenant.create({
        data: {
          name: input.businessName.trim(),
          slug: cleanSlug,
          subdomain: cleanSlug,
          plan: "PROFESIONAL",
          status: "ACTIVE",
          timezone: "America/Asuncion",
          settings: {
            category: input.category,
            whatsappPhone: input.whatsapp.replace(/\D/g, ""),
            slotStepMinutes: 30,
            maxAdvanceDays: 30,
          },
          themeSettings: {
            primaryColor: "#5b31e6",
            backgroundColor: "#f8fafc",
            fontFamily: "Plus Jakarta Sans",
            logoUrl: "",
            whatsapp: input.whatsapp,
          },
        },
      });

      // Si el usuario actual está logueado, vincularlo al tenant
      let ownerName = "Encargado General";
      if (session?.id) {
        await tx.user.update({
          where: { id: session.id },
          data: {
            tenantId: tenant.id,
            role: "OWNER",
          },
        });
        ownerName = session.name || ownerName;
      }

      // Crear primer miembro del equipo
      const staffMember = await tx.staff.create({
        data: {
          tenantId: tenant.id,
          name: ownerName,
          active: true,
          commissionPercentage: 100,
        },
      });

      // Crear servicio inicial
      const service = await tx.service.create({
        data: {
          tenantId: tenant.id,
          name: input.serviceName.trim() || "Servicio General",
          durationMinutes: Number(input.duration) || 45,
          price: Number(input.price) || 80000,
        },
      });

      // Vincular staff con el servicio
      await tx.staffService.create({
        data: {
          staffId: staffMember.id,
          serviceId: service.id,
        },
      });

      // Crear horarios estándar de lunes a sábado (días 1 al 6)
      const baseDate = new Date("2026-01-01T00:00:00Z");
      const startTime = new Date(baseDate);
      startTime.setUTCHours(8, 0, 0, 0);

      const endTime = new Date(baseDate);
      endTime.setUTCHours(20, 0, 0, 0);

      for (let day = 1; day <= 6; day++) {
        await tx.staffSchedule.create({
          data: {
            staffId: staffMember.id,
            dayOfWeek: day,
            startTime,
            endTime,
          },
        });
      }

      return tenant;
    });

    // Actualizar la sesión para que tenga el nuevo tenantSlug
    if (session) {
      const updatedSession: SessionUser = {
        ...session,
        tenantId: result.id,
        tenantSlug: result.subdomain,
      };
      await setSession(updatedSession);
    }

    return { ok: true, slug: result.subdomain };
  } catch (error) {
    console.error("Error al crear tenant en onboarding:", error);
    return { ok: false, error: "No se pudo registrar el negocio en la base de datos." };
  }
}
