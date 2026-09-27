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
  ownerEmail?: string;
  ownerName?: string;
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

    // Comprobar si el slug ya existe, si existe agregar sufijo aleatorio
    const existing = await prisma.tenant.findUnique({
      where: { subdomain: cleanSlug },
    });
    if (existing) {
      cleanSlug = `${cleanSlug}-${Math.floor(100 + Math.random() * 900)}`;
    }

    // Resolver datos del usuario administrador
    const cleanEmail = session?.email || (input.ownerEmail || "").trim().toLowerCase();
    const cleanName = session?.name || (input.ownerName || input.businessName || "Encargado General").trim();

    if (!cleanEmail || !cleanEmail.includes("@")) {
      return {
        ok: false,
        error: "Por favor ingresa un correo electrónico válido para tu cuenta de administrador.",
      };
    }

    // Crear tenant, user, staff, servicio y horarios en una sola transacción atómica
    const result = await prisma.$transaction(async (tx) => {
      // 1. Crear Tenant
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

      // 2. Crear o vincular usuario administrador (OWNER)
      let userRecord;
      if (session?.id) {
        userRecord = await tx.user.update({
          where: { id: session.id },
          data: {
            tenantId: tenant.id,
            role: "OWNER",
          },
          select: { id: true, email: true, name: true, role: true },
        });
      } else {
        const existingUser = await tx.user.findUnique({
          where: { email: cleanEmail },
        });

        if (existingUser) {
          userRecord = await tx.user.update({
            where: { id: existingUser.id },
            data: {
              tenantId: tenant.id,
              role: "OWNER",
              name: existingUser.name || cleanName,
            },
            select: { id: true, email: true, name: true, role: true },
          });
        } else {
          userRecord = await tx.user.create({
            data: {
              email: cleanEmail,
              name: cleanName,
              role: "OWNER",
              tenantId: tenant.id,
              phone: input.whatsapp.replace(/\D/g, ""),
            },
            select: { id: true, email: true, name: true, role: true },
          });
        }
      }

      // 3. Crear primer miembro del equipo (Staff)
      const staffMember = await tx.staff.create({
        data: {
          tenantId: tenant.id,
          name: cleanName,
          active: true,
          commissionPercentage: 100,
        },
      });

      // 4. Crear servicio inicial
      const service = await tx.service.create({
        data: {
          tenantId: tenant.id,
          name: input.serviceName.trim() || "Servicio General",
          durationMinutes: Number(input.duration) || 45,
          price: Number(input.price) || 80000,
        },
      });

      // 5. Vincular staff con el servicio
      await tx.staffService.create({
        data: {
          staffId: staffMember.id,
          serviceId: service.id,
        },
      });

      // 6. Crear horarios estándar de lunes a sábado (días 1 al 6)
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

      return { tenant, user: userRecord };
    });

    // 7. Emitir inmediatamente la cookie de sesión firmada criptográficamente
    const sessionUser: SessionUser = {
      id: result.user.id,
      email: result.user.email,
      name: result.user.name,
      role: "OWNER",
      tenantId: result.tenant.id,
      tenantSlug: result.tenant.subdomain,
      phone: input.whatsapp,
    };
    await setSession(sessionUser);

    return { ok: true, slug: result.tenant.subdomain };
  } catch (error) {
    console.error("Error al crear tenant en onboarding:", error);
    return { ok: false, error: "No se pudo registrar el negocio en la base de datos." };
  }
}
