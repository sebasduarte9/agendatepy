import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { exchangeCodeForTokens, getGoogleUserInfo } from "@/lib/auth/google";
import { setSession } from "@/lib/auth/session";
import type { SessionUser, UserRole } from "@/lib/auth/types";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  const host =
    request.headers.get("x-forwarded-host") ||
    request.headers.get("host") ||
    "localhost:3000";

  const isLocal = host.includes("localhost") || host.includes("127.0.0.1");
  const proto = isLocal ? "http" : "https";

  const baseUrl = `${proto}://${host}`;
  const redirectUri = `${baseUrl}/api/auth/callback/google`;

  if (error || !code) {
    console.error("Google OAuth error from query:", error);
    return NextResponse.redirect(`${baseUrl}/login?error=oauth_cancelled`);
  }

  try {
    // 1. Canjear código por tokens de acceso en Google
    const tokens = await exchangeCodeForTokens(code, redirectUri);

    // 2. Obtener perfil oficial del usuario desde Google
    const googleUser = await getGoogleUserInfo(tokens.access_token);

    if (!googleUser.email) {
      return NextResponse.redirect(`${baseUrl}/login?error=no_email`);
    }

    const cleanEmail = googleUser.email.toLowerCase().trim();

    // 3. Buscar o registrar al usuario en la base de datos
    let user = await prisma.user.findUnique({
      where: { email: cleanEmail },
      include: { tenant: { select: { slug: true, subdomain: true } } },
    });

    const isSuperAdmin =
      cleanEmail === "admin@agendate.py" ||
      cleanEmail === "sebasduarte9@gmail.com";

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: cleanEmail,
          name: googleUser.name || cleanEmail.split("@")[0],
          avatarUrl: googleUser.picture,
          role: isSuperAdmin ? "SUPERADMIN" : "OWNER",
          optInMarketing: true,
        },
        include: { tenant: { select: { slug: true, subdomain: true } } },
      });
    } else if (googleUser.picture && user.avatarUrl !== googleUser.picture) {
      // Actualizar foto de perfil si cambió en Google
      user = await prisma.user.update({
        where: { id: user.id },
        data: { avatarUrl: googleUser.picture },
        include: { tenant: { select: { slug: true, subdomain: true } } },
      });
    }

    // 4. Construir objeto de sesión seguro
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

    // 5. Emitir cookie de sesión firmada criptográficamente
    await setSession(sessionUser);

    // 6. Redirigir según el rol y si ya tiene negocio creado
    if (sessionUser.role === "SUPERADMIN") {
      return NextResponse.redirect(`${baseUrl}/superadmin`);
    }

    // Si es un dueño nuevo sin negocio vinculado, enviarlo al onboarding
    if (!user.tenantId && sessionUser.role === "OWNER") {
      return NextResponse.redirect(`${baseUrl}/onboarding`);
    }

    return NextResponse.redirect(`${baseUrl}/dashboard`);
  } catch (err) {
    console.error("Error en callback de Google OAuth:", err);
    return NextResponse.redirect(`${baseUrl}/login?error=oauth_failed`);
  }
}
