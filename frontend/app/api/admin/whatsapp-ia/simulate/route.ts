import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { processCustomerMessageWithAI } from "@/lib/ai/whatsapp-agent";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const userMessage = body.message || "Hola, ¿qué servicios tienen?";

    // Buscar el tenant principal o primer tenant para simular contexto real
    const tenant = await prisma.tenant.findFirst({
      where: { status: "ACTIVE" },
      select: { id: true, name: true, slug: true },
    });

    const tenantId = tenant?.id || "00000000-0000-0000-0000-000000000000";
    const tenantName = tenant?.name || "Barbería & Salón Demostración";
    const tenantSlug = tenant?.slug || "barberia";

    const startTime = Date.now();
    const result = await processCustomerMessageWithAI(userMessage, {
      tenantId,
      tenantName,
      tenantSlug,
      clientPhone: "+595 981 765 432",
      clientName: "Cliente Test Superadmin",
    });
    const latencyMs = Date.now() - startTime;

    return NextResponse.json({
      status: "success",
      replyText: result.replyText,
      intent: result.intent,
      actionPerformed: result.actionPerformed || null,
      latencyMs,
      keyUsed: "Cluster Activo",
    });
  } catch (error: any) {
    console.error("[Simulate AI] Error:", error);
    return NextResponse.json(
      { status: "error", message: error?.message || "Error procesando simulación con IA" },
      { status: 500 }
    );
  }
}
