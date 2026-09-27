import { NextResponse, type NextRequest } from "next/server";
import { sendEmail } from "@/lib/email";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { ok: false, error: "No autorizado. Inicie sesión para enviar invitaciones." },
        { status: 401 }
      );
    }

    if (session.role !== "OWNER" && session.role !== "SUPERADMIN") {
      return NextResponse.json(
        { ok: false, error: "Permisos insuficientes. Solo administradores pueden invitar colaboradores." },
        { status: 403 }
      );
    }

    if (!session.tenantId) {
      return NextResponse.json(
        { ok: false, error: "No tienes un negocio vinculado a tu cuenta." },
        { status: 400 }
      );
    }

    const tenant = await prisma.tenant.findUnique({
      where: { id: session.tenantId },
      select: { id: true, name: true, subdomain: true },
    });

    if (!tenant) {
      return NextResponse.json(
        { ok: false, error: "Negocio no encontrado." },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { email, name, role } = body;

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { ok: false, error: "El correo electrónico es inválido" },
        { status: 400 }
      );
    }

    const host =
      request.headers.get("x-forwarded-host") ||
      request.headers.get("host") ||
      "localhost:3000";

    const isLocal = host.includes("localhost") || host.includes("127.0.0.1");
    const proto = isLocal ? "http" : "https";
    const appUrl = `${proto}://${host}`;

    // La URL de login se asocia exclusivamente al slug real del tenant verificado
    const loginUrl = `${appUrl}/login?email=${encodeURIComponent(
      email
    )}&invite=team&tenant=${encodeURIComponent(tenant.subdomain)}`;

    const roleName = role || "Colaborador";
    const localName = tenant.name;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; }
          .card { max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 20px; border: 1px solid #e2e8f0; padding: 36px 32px; box-shadow: 0 10px 30px -10px rgba(0,0,0,0.06); }
          .logo { font-size: 20px; font-weight: 900; color: #0f172a; margin-bottom: 20px; letter-spacing: -0.5px; }
          .logo span { color: #4f46e5; }
          .badge { display: inline-block; background: #e0e7ff; color: #4338ca; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 9999px; text-transform: uppercase; margin-bottom: 16px; }
          h1 { font-size: 22px; font-weight: 800; color: #0f172a; margin: 0 0 12px; line-height: 1.25; }
          p { font-size: 14px; line-height: 1.6; color: #475569; margin: 0 0 20px; }
          .btn-google { display: inline-block; background: #4f46e5; color: #ffffff !important; text-decoration: none; font-size: 14px; font-weight: 700; padding: 14px 28px; border-radius: 9999px; box-shadow: 0 4px 14px rgba(79, 70, 229, 0.35); text-align: center; }
          .footer { font-size: 11px; color: #94a3b8; text-align: center; margin-top: 28px; line-height: 1.5; }
          .highlight { background: #f1f5f9; padding: 12px 16px; border-radius: 12px; font-size: 13px; color: #334155; margin-bottom: 24px; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="logo">agendate<span>py.</span></div>
          <div class="badge">Invitación al Equipo</div>
          <h1>¡Hola, ${name || "compañero/a"}!</h1>
          <p>Has sido invitado/a a formar parte del equipo de <strong>${localName}</strong> en la plataforma AgendatePY.</p>
          
          <div class="highlight">
            <strong>Tu rol asignado:</strong> ${roleName}<br>
            <strong>Correo autorizado:</strong> ${email}
          </div>

          <p>Para ingresar a ver tu agenda, citas y turnos asignados, iniciá sesión directamente:</p>

          <div style="text-align: center; margin: 28px 0;">
            <a href="${loginUrl}" class="btn-google">Acceder a mi Cuenta</a>
          </div>

          <p style="font-size: 12px; color: #64748b;">
            Si el botón no funciona, copiá y pegá este enlace en tu navegador:<br>
            <a href="${loginUrl}" style="color: #4f46e5; word-break: break-all;">${loginUrl}</a>
          </p>

          <div class="footer">
            AgendatePY — Sistema de Turnos Online y Gestión Comercial en Paraguay.<br>
            Este correo es exclusivo para el destinatario invitado.
          </div>
        </div>
      </body>
      </html>
    `;

    const result = await sendEmail({
      to: email,
      subject: `¡Te invitaron al equipo de ${localName} en AgendatePY!`,
      html: htmlContent,
    });

    return NextResponse.json({
      ok: true,
      message: `Invitación enviada por correo a ${email}`,
      emailResult: result,
      loginUrl,
    });
  } catch (error) {
    console.error("Error en /api/team/invite:", error);
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Error al procesar invitación",
      },
      { status: 500 }
    );
  }
}
