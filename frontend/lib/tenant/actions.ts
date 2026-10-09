"use server";

import { prisma } from "@/lib/db";
import { getSession, setSession } from "@/lib/auth/session";
import type { SessionUser } from "@/lib/auth/types";

export interface OnboardingInput {
  businessName: string;
  category: string;
  categoryLabel?: string;
  slug: string;
  serviceName: string;
  duration: number;
  price: number;
  whatsapp: string;
  phoneType?: "business" | "personal";
  personalPhone?: string;
  ruc?: string;
  logoUrl?: string;
  ownerEmail?: string;
  ownerName?: string;
  theme?: OnboardingTheme;
}

export interface OnboardingTheme {
  primaryColor?: string;
  backgroundColor?: string;
  fontFamily?: string;
  themeMode?: "light" | "dark";
  layoutStyle?: "panoramic" | "split-gallery" | "floating-card";
  buttonRadius?: "full" | "lg" | "md";
}

const RESERVED_SLUGS = new Set([
  "admin",
  "api",
  "dashboard",
  "login",
  "onboarding",
  "superadmin",
  "showcase",
  "terminos",
  "privacidad",
  "www",
]);

const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;

function sanitizeOnboardingTheme(theme: OnboardingTheme | undefined) {
  if (!theme) return {};
  const out: Record<string, string> = {};
  if (theme.primaryColor && HEX_COLOR.test(theme.primaryColor)) out.primaryColor = theme.primaryColor;
  if (theme.backgroundColor && HEX_COLOR.test(theme.backgroundColor)) out.backgroundColor = theme.backgroundColor;
  if (theme.fontFamily && /^[a-z0-9-]{2,40}$/.test(theme.fontFamily)) out.fontFamily = theme.fontFamily;
  if (theme.themeMode === "light" || theme.themeMode === "dark") out.themeMode = theme.themeMode;
  if (
    theme.layoutStyle === "panoramic" ||
    theme.layoutStyle === "split-gallery" ||
    theme.layoutStyle === "floating-card"
  ) {
    out.layoutStyle = theme.layoutStyle;
  }
  if (theme.buttonRadius === "full" || theme.buttonRadius === "lg" || theme.buttonRadius === "md") {
    out.buttonRadius = theme.buttonRadius;
  }
  return out;
}

export async function checkSlugAvailabilityAction(slug: string) {
  const clean = slug
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
  if (clean.length < 3) return { available: false, reason: "short" as const };
  if (RESERVED_SLUGS.has(clean)) return { available: false, reason: "taken" as const };
  try {
    const existing = await prisma.tenant.findUnique({
      where: { subdomain: clean },
      select: { id: true },
    });
    return { available: !existing, reason: existing ? ("taken" as const) : undefined };
  } catch {
    return { available: true };
  }
}

export async function createTenantOnboardingAction(input: OnboardingInput) {
  try {
    const session = await getSession();

    let cleanSlug = input.slug
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "")
      .replace(/-+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 63);

    if (!cleanSlug || cleanSlug.length < 2) {
      cleanSlug = `negocio-${Date.now().toString().slice(-4)}`;
    }

    // Comprobar si el slug ya existe, si existe agregar sufijo aleatorio
    const existing = await prisma.tenant.findUnique({
      where: { subdomain: cleanSlug },
    });
    if (existing || RESERVED_SLUGS.has(cleanSlug)) {
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

    // Procesar y persistir logo si viene como dataUrl
    let finalLogoUrl = (input.logoUrl || "").trim();
    if (finalLogoUrl.startsWith("data:image/")) {
      try {
        const { writeFile, mkdir } = await import("fs/promises");
        const pathModule = await import("path");
        const uploadDir = pathModule.join(process.cwd(), "public", "uploads");
        await mkdir(uploadDir, { recursive: true });

        const matches = finalLogoUrl.match(/^data:image\/([A-Za-z-+]+);base64,(.+)$/);
        if (matches && matches.length === 3) {
          const rawExt = "." + matches[1].toLowerCase().replace("jpeg", "jpg");
          const ext = [".jpg", ".png", ".webp"].includes(rawExt) ? rawExt : ".png";
          const buffer = Buffer.from(matches[2], "base64");
          const filename = "logo-" + cleanSlug + "-" + Date.now() + ext;
          await writeFile(pathModule.join(uploadDir, filename), buffer);
          finalLogoUrl = "/uploads/" + filename;
        }
      } catch (err) {
        console.warn("Error al persistir logo de onboarding en disco:", err);
      }
    }

    const cleanWhatsapp = input.whatsapp.replace(/\D/g, "");

    const { isPhoneVerificationRequired, isPhoneRecentlyVerified } = await import(
      "@/lib/verification/phone-otp"
    );
    const verificationRequired = await isPhoneVerificationRequired();
    const phoneVerified = verificationRequired ? await isPhoneRecentlyVerified(cleanWhatsapp) : false;
    if (verificationRequired && !phoneVerified) {
      return {
        ok: false,
        error: "Verificá tu WhatsApp con el código que te enviamos para continuar.",
      };
    }

    const categoryLabel =
      input.category === "otro" ? (input.categoryLabel || "").trim().slice(0, 60) : "";
    const cleanPersonalPhone = (
      input.personalPhone || (input.phoneType === "personal" ? input.whatsapp : "")
    ).replace(/\D/g, "");

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
            ...(categoryLabel ? { categoryLabel } : {}),
            whatsappPhone: cleanWhatsapp,
            whatsappVerified: phoneVerified,
            ...(phoneVerified ? { whatsappVerifiedAt: new Date().toISOString() } : {}),
            ruc: (input.ruc || "").trim(),
            slotStepMinutes: 30,
            maxAdvanceDays: 30,
            evolutionConfig: {
              connected: false,
              phoneNumber: cleanWhatsapp,
              phoneType: input.phoneType || "business",
              personalPhone: cleanPersonalPhone,
              humanHandoffPhone: cleanPersonalPhone || cleanWhatsapp,
              autoBotEnabled: true,
              aiTone: "amigable",
              allowEmojis: false,
              askStaffPreference: true,
              notifyPersonalPhoneOnBooking: true,
              minNoticeMinutes: 60,
              serviceScheduleMode: "always",
            },
          },
          themeSettings: {
            primaryColor: "#5b31e6",
            backgroundColor: "#f8fafc",
            fontFamily: "plus-jakarta-sans",
            ...sanitizeOnboardingTheme(input.theme),
            bannerUrl: "",
            logoUrl: finalLogoUrl,
            whatsapp: cleanWhatsapp,
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
      endTime.setUTCHours(18, 0, 0, 0);

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

      // 7. Registrar eventos de plataforma de forma atómica
      await tx.platformEvent.create({
        data: {
          event: "TENANT_CREATED",
          tenantId: tenant.id,
          entityType: "Tenant",
          entityId: tenant.id,
          metadata: {
            slug: tenant.slug,
            category: input.category,
          },
        },
      });

      await tx.platformEvent.create({
        data: {
          event: "ONBOARDING_COMPLETED",
          tenantId: tenant.id,
          entityType: "Tenant",
          entityId: tenant.id,
          metadata: {
            serviceId: service.id,
            staffId: staffMember.id,
          },
        },
      });

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
