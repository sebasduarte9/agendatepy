"use server";

import { prisma } from "@/lib/db";
import { setSession, clearSession, getSession } from "./session";
import type { SessionUser, AuthResponse, UserRole } from "./types";

/**
 * Solicitar código OTP de 6 dígitos enviado al correo.
 */
export async function requestOtpAction(email: string): Promise<AuthResponse> {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail || !cleanEmail.includes("@")) {
    return { ok: false, error: "Ingresa un correo electrónico válido." };
  }

  // Generar código de 6 dígitos
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutos

  try {
    // Invalidad códigos anteriores no usados
    await prisma.otpCode.updateMany({
      where: { email: cleanEmail, used: false },
      data: { used: true },
    });

    // Guardar nuevo código
    await prisma.otpCode.create({
      data: {
        email: cleanEmail,
        code,
        expiresAt,
      },
    });

    // En desarrollo se retorna el código en la respuesta para prueba inmediata
    return {
      ok: true,
      message: `Código de seguridad enviado a ${cleanEmail}`,
      code,
    };
  } catch (error) {
    console.error("Error al generar OTP:", error);
    return { ok: false, error: "No se pudo generar el código. Intenta nuevamente." };
  }
}

/**
 * Verificar código OTP e iniciar sesión.
 */
export async function verifyOtpAction(
  email: string,
  code: string,
  optInMarketing = false
): Promise<AuthResponse> {
  const cleanEmail = email.trim().toLowerCase();
  const cleanCode = code.trim();

  try {
    const validOtp = await prisma.otpCode.findFirst({
      where: {
        email: cleanEmail,
        code: cleanCode,
        used: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!validOtp) {
      return { ok: false, error: "Código incorrecto o vencido. Solicita uno nuevo." };
    }

    // Marcar como usado
    await prisma.otpCode.update({
      where: { id: validOtp.id },
      data: { used: true },
    });

    // Buscar o crear usuario
    let user = await prisma.user.findUnique({
      where: { email: cleanEmail },
      include: { tenant: { select: { slug: true, subdomain: true } } },
    });

    if (!user) {
      // Si el email es el del admin general
      const isSuperAdmin = cleanEmail.includes("admin@agendate.py");
      user = await prisma.user.create({
        data: {
          email: cleanEmail,
          name: cleanEmail.split("@")[0].replace(/[._-]/g, " "),
          role: isSuperAdmin ? "SUPERADMIN" : "OWNER",
          optInMarketing,
        },
        include: { tenant: { select: { slug: true, subdomain: true } } },
      });
    } else if (optInMarketing && !user.optInMarketing) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { optInMarketing: true },
        include: { tenant: { select: { slug: true, subdomain: true } } },
      });
    }

    const sessionUser: SessionUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as UserRole,
      tenantId: user.tenantId,
      tenantSlug: user.tenant?.subdomain || user.tenant?.slug || (user.role === "SUPERADMIN" ? null : "barberia"),
      phone: user.phone,
      optInMarketing: user.optInMarketing,
    };

    await setSession(sessionUser);

    return {
      ok: true,
      message: "Sesión iniciada correctamente",
      user: sessionUser,
    };
  } catch (error) {
    console.error("Error al verificar OTP:", error);
    return { ok: false, error: "Ocurrió un error al verificar el código." };
  }
}

/**
 * Inicio de sesión con Google (simulación y flujo directo).
 */
export async function googleLoginAction(
  email = "demo.google@agendate.py",
  name = "Usuario Google",
  optInMarketing = true
): Promise<AuthResponse> {
  const cleanEmail = email.trim().toLowerCase();

  try {
    let user = await prisma.user.findUnique({
      where: { email: cleanEmail },
      include: { tenant: { select: { slug: true, subdomain: true } } },
    });

    const isSuperAdmin = cleanEmail.includes("admin@agendate.py");

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: cleanEmail,
          name,
          role: isSuperAdmin ? "SUPERADMIN" : "OWNER",
          optInMarketing,
        },
        include: { tenant: { select: { slug: true, subdomain: true } } },
      });
    }

    const sessionUser: SessionUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as UserRole,
      tenantId: user.tenantId,
      tenantSlug:
        user.tenant?.subdomain ||
        user.tenant?.slug ||
        (user.role === "SUPERADMIN" ? null : "barberia"),
      phone: user.phone,
      optInMarketing: user.optInMarketing,
    };

    await setSession(sessionUser);

    return {
      ok: true,
      message: "Sesión iniciada con Google",
      user: sessionUser,
    };
  } catch (error) {
    console.error("Error en login Google:", error);
    return { ok: false, error: "No se pudo iniciar sesión con Google." };
  }
}

/**
 * Cambiar de rol en caliente para demostraciones (Superadmin / Dueño / Staff).
 */
export async function switchRoleDemoAction(role: UserRole): Promise<AuthResponse> {
  let targetEmail = "marcos@barberia.py";
  let targetName = "Marcos Benítez";

  if (role === "SUPERADMIN") {
    targetEmail = "admin@agendate.py";
    targetName = "Administrador General";
  } else if (role === "STAFF") {
    targetEmail = "luis@barberia.py";
    targetName = "Luis Ayala (Colaborador)";
  }

  const user = await prisma.user.findUnique({
    where: { email: targetEmail },
    include: { tenant: { select: { slug: true, subdomain: true } } },
  });

  if (!user) {
    return { ok: false, error: "Usuario de prueba no encontrado." };
  }

  const sessionUser: SessionUser = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role as UserRole,
    tenantId: user.tenantId,
    tenantSlug: user.tenant?.subdomain || user.tenant?.slug || (role === "SUPERADMIN" ? null : "barberia"),
    phone: user.phone,
    optInMarketing: user.optInMarketing,
  };

  await setSession(sessionUser);
  return { ok: true, user: sessionUser };
}

/**
 * Obtener usuario en sesión actual.
 */
export async function getCurrentUserAction(): Promise<SessionUser | null> {
  return await getSession();
}

/**
 * Cerrar sesión.
 */
export async function logoutAction(): Promise<void> {
  await clearSession();
}
