import { NextRequest, NextResponse } from "next/server";
import { requireTenantSession, isGuardError } from "@/lib/api-guard";
import { prisma } from "@/lib/db";
import { processCustomerMessageWithAI } from "@/lib/ai/whatsapp-agent";

/**
 * Endpoint de Chat Inteligente para el Simulador de WhatsApp y Clientes
 */
export async function POST(req: NextRequest) {
  const auth = await requireTenantSession(req);
  if (isGuardError(auth)) return auth;

  try {
    const body = await req.json();
    const userMessage = (body.message || "").trim();
    const clientPhone = body.clientPhone || "+595 981 765 432";
    const clientName = body.clientName || "Cliente WhatsApp";

    if (!userMessage) {
      return NextResponse.json({ status: "error", message: "Mensaje vacío" }, { status: 400 });
    }

    let tenant = null;
    if (auth.session.role !== "SUPERADMIN") {
      tenant = await prisma.tenant.findUnique({
        where: { id: auth.tenantId },
        select: { id: true, name: true, slug: true },
      });
    } else if (body.tenantId) {
      tenant = await prisma.tenant.findUnique({
        where: { id: body.tenantId },
        select: { id: true, name: true, slug: true },
      });
    } else if (body.tenantSlug) {
      tenant = await prisma.tenant.findUnique({
        where: { slug: body.tenantSlug },
        select: { id: true, name: true, slug: true },
      });
    }

    if (!tenant && auth.session.role === "SUPERADMIN") {
      tenant = await prisma.tenant.findFirst({
        where: { status: "ACTIVE" },
        select: { id: true, name: true, slug: true },
      });
    }

    const tenantId = tenant?.id || "00000000-0000-0000-0000-000000000000";
    const tenantName = tenant?.name || "Barbería Los Muchachos";
    const tenantSlug = tenant?.slug || "barberia";

    const startTime = Date.now();
    const agentResult = await processCustomerMessageWithAI(userMessage, {
      tenantId,
      tenantName,
      tenantSlug,
      clientPhone,
      clientName,
      configOverrides: body.configOverrides,
    });
    const latencyMs = Date.now() - startTime;

    return NextResponse.json({
      status: "success",
      replyText: agentResult.replyText,
      intent: agentResult.intent,
      actionPerformed: agentResult.actionPerformed,
      latencyMs,
    });
  } catch (error: any) {
    console.error("[AI Chat API] Error:", error);
    return NextResponse.json(
      { status: "error", message: error?.message || "Error procesando con IA" },
      { status: 500 }
    );
  }
}
