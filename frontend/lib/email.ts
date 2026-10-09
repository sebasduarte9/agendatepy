import "server-only";

export const RESEND_API_KEY = process.env.RESEND_API_KEY || "";

export const EMAIL_FROM =
  process.env.EMAIL_FROM || "AgendatePY <seguridad@agendatepy.com>";

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailOptions): Promise<{ ok: boolean; id?: string; error?: string }> {
  if (!RESEND_API_KEY) {
    console.warn("No se configuró RESEND_API_KEY. Correo no enviado.");
    return { ok: false, error: "Servicio de correo no configurado" };
  }

  try {
    let fromAddress = EMAIL_FROM;

    let res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromAddress,
        to: [to],
        subject,
        html,
      }),
      cache: "no-store",
    });

    // Si el dominio aún no fue verificado en Resend, intentar con el remitente de pruebas oficial
    if (!res.ok && res.status === 403) {
      console.warn("Dominio propio aún no verificado en Resend. Reintentando con onboarding@resend.dev...");
      fromAddress = "AgendatePY <onboarding@resend.dev>";
      res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: fromAddress,
          to: [to],
          subject,
          html,
        }),
        cache: "no-store",
      });
    }

    if (!res.ok) {
      const errText = await res.text();
      console.error("Error en Resend API:", res.status, errText);
      return { ok: false, error: `Resend error: ${res.status}` };
    }

    const data = await res.json();
    return { ok: true, id: data.id };
  } catch (error) {
    console.error("Excepción al enviar correo con Resend:", error);
    return { ok: false, error: "Error de conexión con Resend" };
  }
}

/**
 * Enviar código OTP con diseño corporativo de AgendatePY
 */
export async function sendOtpEmail(email: string, code: string) {
  const subject = `${code} es tu código de acceso a AgendatePY`;

  const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Código de Seguridad</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f5f8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f4f5f8; padding: 40px 15px;">
    <tr>
      <td align="center">
        <table width="100%" max-width="500" style="max-width: 500px; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05); border: 1px solid #e2e8f0;" border="0" cellspacing="0" cellpadding="0">
          
          <!-- Encabezado con Logo -->
          <tr>
            <td style="padding: 32px 32px 20px 32px; text-align: center; border-bottom: 1px solid #f1f5f9;">
              <div style="display: inline-block; background-color: #FF4F2B; color: #ffffff; font-weight: 900; font-size: 16px; padding: 8px 16px; border-radius: 12px; letter-spacing: -0.5px;">
                agendate<span style="color: #ffffff;">py</span>
              </div>
              <h2 style="margin: 20px 0 6px 0; font-size: 22px; font-weight: 800; color: #0f172a; letter-spacing: -0.5px;">
                Código de Inicio de Sesión
              </h2>
              <p style="margin: 0; font-size: 13px; color: #64748b;">
                Usa este código para acceder de forma segura a tu panel de control
              </p>
            </td>
          </tr>

          <!-- Código OTP Destacado -->
          <tr>
            <td style="padding: 32px; text-align: center; background-color: #fafafa;">
              <p style="margin: 0 0 12px 0; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #64748b;">
                Tu código de verificación
              </p>
              <div style="display: inline-block; background-color: #ffffff; border: 2px dashed #FF4F2B; border-radius: 16px; padding: 14px 28px; font-size: 32px; font-weight: 900; letter-spacing: 8px; color: #FF4F2B; font-family: monospace;">
                ${code}
              </div>
              <p style="margin: 16px 0 0 0; font-size: 12px; color: #94a3b8;">
                Válido durante los próximos <strong>10 minutos</strong>.
              </p>
            </td>
          </tr>

          <!-- Advertencia de Seguridad -->
          <tr>
            <td style="padding: 24px 32px; background-color: #ffffff; font-size: 12px; color: #64748b; line-height: 1.6; border-top: 1px solid #f1f5f9;">
              <p style="margin: 0 0 8px 0;">
                 Si no solicitaste este código, puedes ignorar este correo con tranquilidad. Nadie puede acceder a tu cuenta sin él.
              </p>
              <p style="margin: 0; color: #94a3b8; font-size: 11px;">
                AgendatePY · Sistema de Agendamiento & Gestión para Negocios en Paraguay.<br>
                <a href="https://agendatepy.com" style="color: #FF4F2B; text-decoration: none;">agendatepy.com</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  return await sendEmail({ to: email, subject, html });
}
