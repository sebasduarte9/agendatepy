import { NextResponse, type NextRequest } from "next/server";
import { sendWhatsAppMessage } from "@/lib/evolution";
import { requireTenantSession, isGuardError } from "@/lib/api-guard";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * Enviar mensaje de prueba de plantilla de recordatorio a WhatsApp
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await requireTenantSession(request);
    if (isGuardError(auth)) return auth;

    const body = await request.json();
    const { phone, templateBody } = body;

    if (!phone || typeof phone !== "string") {
      return NextResponse.json({ ok: false, error: "Teléfono no especificado." }, { status: 400 });
    }

    if (!templateBody || typeof templateBody !== "string") {
      return NextResponse.json({ ok: false, error: "Contenido de la plantilla vacío." }, { status: 400 });
    }

    const tenant = await prisma.tenant.findUnique({
      where: { id: auth.tenantId },
      select: { name: true, slug: true, subdomain: true, settings: true },
    });

    const settings = (tenant?.settings as Record<string, any>) || {};
    const evolutionConfig = settings.evolutionConfig || {};
    const whatsappInstance = typeof evolutionConfig.instance === "string" ? evolutionConfig.instance : "";
    if (!whatsappInstance || evolutionConfig.connected !== true) {
      return NextResponse.json(
        { ok: false, error: "Vinculá WhatsApp y confirmá la conexión antes de enviar una prueba." },
        { status: 409 },
      );
    }

    const rawPhone = phone.trim();
    const cleanPhone = rawPhone.replace(/\D/g, "");
    const explicitlyInternational = rawPhone.startsWith("+") || rawPhone.startsWith("00");
    const normalizedPhone = cleanPhone.startsWith("00") ? cleanPhone.slice(2) : cleanPhone;
    if (normalizedPhone.length < 8 || normalizedPhone.length > 15) {
      return NextResponse.json({ ok: false, error: "Ingresá un número válido, con código de país." }, { status: 400 });
    }
    const formattedPhone = explicitlyInternational || normalizedPhone.startsWith("595")
      ? normalizedPhone
      : `595${normalizedPhone.replace(/^0/, "")}`;

    // Renderizar con datos de muestra
    const sampleLink = `https://${process.env.NEXT_PUBLIC_ROOT_DOMAIN || "agendatepy.com"}/${tenant?.subdomain || tenant?.slug || "mi-local"}`;
    const rendered = templateBody
      .replace(/{cliente}/g, "Martín Benítez (Prueba)")
      .replace(/{servicio}/g, "Corte Fade Clásico & Barba")
      .replace(/{profesional}/g, "Diego Franco")
      .replace(/{fecha}/g, "Viernes 25 de Octubre")
      .replace(/{hora}/g, "16:00")
      .replace(/{negocio}/g, tenant?.name || "Tu Negocio")
      .replace(/{direccion}/g, settings.address || "Avda. Santa Teresa 1420")
      .replace(/{link_autogestion}/g, sampleLink)
      .replace(/{link_negocio}/g, sampleLink);

    const testBanner = `🧪 *[MENSAJE DE PRUEBA DE RECORDATORIO]*\n` +
      `_Así le llegará este recordatorio automático a tus clientes:_\n\n` +
      rendered;

    await sendWhatsAppMessage(formattedPhone, testBanner, false, whatsappInstance);

    return NextResponse.json({
      ok: true,
      message: `Mensaje de prueba enviado con éxito a +${formattedPhone}`,
    });
  } catch (error: any) {
    console.error("[Test Reminder] Error enviando mensaje:", error);
    return NextResponse.json(
      { ok: false, error: error?.message || "No se pudo enviar el mensaje a WhatsApp." },
      { status: 500 }
    );
  }
}
