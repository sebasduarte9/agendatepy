import { NextRequest, NextResponse } from "next/server";
import { requireTenantSession, isGuardError } from "@/lib/api-guard";
import { prisma } from "@/lib/db";
import { processCustomerMessageWithAI } from "@/lib/ai/whatsapp-agent";
import { recordAiInteraction } from "@/lib/ai/ai-learning-store";

/**
 * Endpoint de Chat Inteligente para el Simulador de WhatsApp y Clientes
 */
import { getSession } from "@/lib/auth/session";
import { processAgendatePlatformMessage } from "@/lib/ai/agendate-platform-agent";

/**
 * Endpoint de Chat Inteligente para el Simulador de WhatsApp, Clientes Web y Landing
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    const body = await req.json();
    const userMessage = (body.message || "").trim();
    const clientPhone = body.clientPhone || "+595 981 765 432";
    const clientName = body.clientName || "Cliente Web";

    if (!userMessage) {
      return NextResponse.json({ status: "error", message: "Mensaje vacío" }, { status: 400 });
    }

    // 1. Resolver negocio
    let tenant = null;

    if (session) {
      if (session.tenantId) {
        tenant = await prisma.tenant.findUnique({
          where: { id: session.tenantId },
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
    } else {
      // Petición pública desde la web o booking page
      if (body.tenantSlug) {
        tenant = await prisma.tenant.findUnique({
          where: { slug: body.tenantSlug },
          select: { id: true, name: true, slug: true },
        });
      } else if (body.tenantId) {
        tenant = await prisma.tenant.findUnique({
          where: { id: body.tenantId },
          select: { id: true, name: true, slug: true },
        });
      }
    }

    // Fallback: si no especificó tenant y está en la landing principal, usar el Agente de Plataforma
    if (!tenant && !body.tenantSlug && !body.tenantId) {
      const platformResult = await processAgendatePlatformMessage(
        userMessage,
        clientPhone,
        clientName
      );
      return NextResponse.json({
        status: "success",
        replyText: platformResult.replyText,
        intent: "plataforma",
        actionPerformed: platformResult.isRegisteredUser ? "USER_DETECTED" : null,
      });
    }

    if (!tenant) {
      tenant = await prisma.tenant.findFirst({
        where: { status: "ACTIVE" },
        select: { id: true, name: true, slug: true },
      });
    }

    const tenantId = tenant?.id || "bbdc08a3-1038-4c2d-8ddb-189451a0e54a";
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

    // Registrar interacción en el Almacén de Aprendizaje y Minería
    await recordAiInteraction({
      scope: "TENANT",
      tenantId,
      tenantName,
      tenantSlug,
      clientPhone,
      clientName,
      userMessage,
      aiResponse: agentResult.replyText,
      intent: agentResult.intent,
      channel: "web_simulator",
      actionPerformed: agentResult.actionPerformed,
    });

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
