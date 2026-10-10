import { NextRequest, NextResponse } from "next/server";
import { processAgendatePlatformMessage } from "@/lib/ai/agendate-platform-agent";
import { processCustomerMessageWithAI } from "@/lib/ai/whatsapp-agent";
import { prisma } from "@/lib/db";
import { conversationState } from "@/lib/ai/conversation-state";
import { recordAiInteraction } from "@/lib/ai/ai-learning-store";
import { MULTITURN_SUITE, MultiTurnPersona } from "@/lib/ai/multiturn-stress-suite";

export const dynamic = "force-dynamic";
export const maxDuration = 300; // 5 minutos de tiempo de ejecución para pruebas por lotes

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const offset = parseInt(searchParams.get("offset") || "0", 10);
  const limit = parseInt(searchParams.get("limit") || "10", 10);
  const personaId = searchParams.get("personaId");

  let personas: MultiTurnPersona[] = MULTITURN_SUITE;
  if (personaId) {
    personas = personas.filter((p) => p.id === personaId);
  } else {
    personas = personas.slice(offset, offset + limit);
  }

  console.log(
    `[MultiTurnStress] Ejecutando lote de ${personas.length} personas (${personas.length * 5} consultas API totales, offset: ${offset})...`
  );

  let sampleTenant = await prisma.tenant.findFirst({
    where: { status: "ACTIVE" },
    select: { id: true, name: true, slug: true },
  });

  if (!sampleTenant) {
    sampleTenant = {
      id: "00000000-0000-0000-0000-000000000000",
      name: "Barbería Elite Asunción",
      slug: "barberia-elite",
    };
  }

  const results: any[] = [];
  let totalTurns = 0;
  let totalTurnsPassed = 0;
  let totalAnomalies = 0;
  const anomalies: string[] = [];

  for (const persona of personas) {
    const tenantKey = persona.target === "TENANT" ? sampleTenant.id : "agendatepy-official";

    // Reiniciar conversación previa para garantizar aislamiento limpio
    conversationState.resumeBot(tenantKey, persona.phone);

    const turnsLog: any[] = [];
    let personaPassed = true;

    for (let step = 0; step < persona.turns.length; step++) {
      const userMsg = persona.turns[step];
      const startMs = Date.now();
      let replyText = "";
      let intent = "general";
      let errorOccurred = false;
      const issues: string[] = [];

      totalTurns++;

      try {
        if (persona.target === "TENANT") {
          const res = await processCustomerMessageWithAI(userMsg, {
            tenantId: sampleTenant.id,
            tenantName: sampleTenant.name,
            tenantSlug: sampleTenant.slug,
            clientPhone: persona.phone,
            clientName: persona.name,
          });
          replyText = res.replyText;
          intent = res.intent;
        } else {
          const res = await processAgendatePlatformMessage(
            userMsg,
            persona.phone,
            persona.name
          );
          replyText = res.replyText;
        }
      } catch (err: any) {
        replyText = `ERROR: ${err.message}`;
        errorOccurred = true;
        issues.push(`Excepción de API en turno ${step + 1}: ${err.message}`);
      }

      const latencyMs = Date.now() - startMs;
      const lowerReply = replyText.toLowerCase();

      // Chequeo 1: Filtro de anonimato estricto (cero Sebas / Derlis)
      if (lowerReply.includes("seba") || lowerReply.includes("sebas") || lowerReply.includes("derlis")) {
        issues.push(`Violación de anonimato en turno ${step + 1}: Mención de nombre personal prohibido`);
      }

      // Chequeo 2: Palabras prohibidas específicas de la persona si aplican
      if (persona.assertions?.forbiddenStrings) {
        for (const forbidden of persona.assertions.forbiddenStrings) {
          if (lowerReply.includes(forbidden.toLowerCase())) {
            issues.push(`Palabra prohibida en turno ${step + 1}: "${forbidden}"`);
          }
        }
      }

      const turnPassed = issues.length === 0 && !errorOccurred;
      if (turnPassed) {
        totalTurnsPassed++;
      } else {
        personaPassed = false;
        totalAnomalies++;
        anomalies.push(`[${persona.id} - Turno ${step + 1}] ${issues.join(" | ")}`);
      }

      // Registrar en almacén de aprendizaje continuo
      try {
        await recordAiInteraction({
          scope: persona.target === "TENANT" ? "TENANT" : "PLATFORM",
          tenantId: persona.target === "TENANT" ? sampleTenant.id : undefined,
          tenantName: persona.target === "TENANT" ? sampleTenant.name : undefined,
          clientPhone: persona.phone,
          clientName: persona.name,
          userMessage: userMsg,
          aiResponse: replyText,
          intent,
          channel: "web_simulator",
          actionPerformed: turnPassed ? "PASSED_MULTITURN_TEST" : "FAILED_ASSERTION",
        });
      } catch (e) {
        // Ignorar error de logging
      }

      turnsLog.push({
        turn: step + 1,
        user: userMsg,
        assistant: replyText,
        latencyMs,
        passed: turnPassed,
        issues,
      });

      // Breve pausa de 200ms entre turnos de la misma persona
      await new Promise((r) => setTimeout(r, 200));
    }

    results.push({
      personaId: persona.id,
      name: persona.name,
      phone: persona.phone,
      category: persona.category,
      target: persona.target,
      passed: personaPassed,
      turns: turnsLog,
    });
  }

  return NextResponse.json({
    status: "completed",
    timestamp: new Date().toISOString(),
    batch: {
      offset,
      limit,
      personasTested: personas.length,
      totalQueriesExecuted: totalTurns,
    },
    summary: {
      totalTurns,
      totalTurnsPassed,
      passRate: `${Math.round((totalTurnsPassed / (totalTurns || 1)) * 100)}%`,
      totalAnomalies,
    },
    anomalies,
    results,
  });
}
