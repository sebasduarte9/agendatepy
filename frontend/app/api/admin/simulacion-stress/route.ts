import { NextRequest, NextResponse } from "next/server";
import { processAgendatePlatformMessage } from "@/lib/ai/agendate-platform-agent";
import { processCustomerMessageWithAI } from "@/lib/ai/whatsapp-agent";
import { prisma } from "@/lib/db";
import { conversationState } from "@/lib/ai/conversation-state";
import { recordAiInteraction } from "@/lib/ai/ai-learning-store";
import { STRESS_TEST_SUITE, StressTestCase } from "@/lib/ai/stress-test-cases";

export const dynamic = "force-dynamic";
export const maxDuration = 300; // 5 minutos de tiempo de ejecución para pruebas masivas

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const offset = parseInt(searchParams.get("offset") || "0", 10);
  const limit = parseInt(searchParams.get("limit") || "25", 10);
  const categoryFilter = searchParams.get("category");
  const runAll = searchParams.get("all") === "true";

  let selectedCases: StressTestCase[] = STRESS_TEST_SUITE;

  if (categoryFilter) {
    selectedCases = selectedCases.filter((c) => c.category === categoryFilter);
  }

  if (!runAll) {
    selectedCases = selectedCases.slice(offset, offset + limit);
  }

  console.log(
    `[StressTest] Ejecutando lote de ${selectedCases.length} consultas (offset: ${offset}, total suite: ${STRESS_TEST_SUITE.length})...`
  );

  // Buscar un tenant activo para las pruebas de local
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
  let totalAssertionsChecked = 0;
  let totalViolations = 0;
  const anomaliesDetected: string[] = [];

  for (let i = 0; i < selectedCases.length; i++) {
    const tc = selectedCases[i];
    const startTime = Date.now();
    let replyText = "";
    let intent = "general";
    let errorOccurred = false;
    const failures: string[] = [];

    // Limpiar estado previo para asegurar aislamiento
    conversationState.resumeBot(
      tc.isTenantBooking ? sampleTenant.id : "agendatepy-official",
      tc.senderPhone
    );

    try {
      if (tc.isTenantBooking) {
        const tenantRes = await processCustomerMessageWithAI(tc.message, {
          tenantId: sampleTenant.id,
          tenantName: sampleTenant.name,
          tenantSlug: sampleTenant.slug,
          clientPhone: tc.senderPhone,
          clientName: tc.senderName,
        });
        replyText = tenantRes.replyText;
        intent = tenantRes.intent;
      } else {
        const platformRes = await processAgendatePlatformMessage(
          tc.message,
          tc.senderPhone,
          tc.senderName
        );
        replyText = platformRes.replyText;
      }
    } catch (err: any) {
      replyText = `ERROR: ${err.message}`;
      errorOccurred = true;
      failures.push(`Excepción de ejecución: ${err.message}`);
    }

    const latencyMs = Date.now() - startTime;
    const lowerReply = replyText.toLowerCase();

    // Chequeo 1: Cadenas prohibidas (ej. nombres propios personales, contraseñas, secretos)
    if (tc.assertions.forbiddenStrings) {
      for (const forbidden of tc.assertions.forbiddenStrings) {
        totalAssertionsChecked++;
        if (lowerReply.includes(forbidden.toLowerCase())) {
          totalViolations++;
          failures.push(`Violación de seguridad: Contiene palabra prohibida "${forbidden}"`);
        }
      }
    }

    // Chequeo 2: Palabras requeridas
    if (tc.assertions.mustIncludeAny && tc.assertions.mustIncludeAny.length > 0) {
      totalAssertionsChecked++;
      const hasAny = tc.assertions.mustIncludeAny.some((kw) => lowerReply.includes(kw.toLowerCase()));
      if (!hasAny) {
        totalViolations++;
        failures.push(
          `Falta de pertinencia: Respuesta debió incluir alguno de [${tc.assertions.mustIncludeAny.join(", ")}]`
        );
      }
    }

    // Chequeo 3: Detección de Handoff
    if (tc.assertions.checkHandoff) {
      totalAssertionsChecked++;
      const hasHandoffOffer =
        lowerReply.includes("asesor") ||
        lowerReply.includes("soporte") ||
        lowerReply.includes("encargado") ||
        lowerReply.includes("dueño") ||
        lowerReply.includes("persona");
      if (!hasHandoffOffer) {
        totalViolations++;
        failures.push("Fallo de derivación: No ofreció contactar a un asesor o soporte.");
      }
    }

    const passed = failures.length === 0 && !errorOccurred;
    if (!passed) {
      anomaliesDetected.push(`[${tc.id}] ${failures.join(" | ")}`);
    }

    // Registrar en el almacén de aprendizaje continuo de IA
    try {
      await recordAiInteraction({
        scope: tc.isTenantBooking ? "TENANT" : "PLATFORM",
        tenantId: tc.isTenantBooking ? sampleTenant.id : undefined,
        tenantName: tc.isTenantBooking ? sampleTenant.name : undefined,
        clientPhone: tc.senderPhone,
        clientName: tc.senderName,
        userMessage: tc.message,
        aiResponse: replyText,
        intent,
        channel: "web_simulator",
        actionPerformed: passed ? "PASSED_STRESS_TEST" : "FAILED_ASSERTION",
      });
    } catch (e) {
      // Ignorar error de logging
    }

    results.push({
      index: offset + i + 1,
      id: tc.id,
      category: tc.category,
      name: tc.name,
      senderPhone: tc.senderPhone,
      prompt: tc.message,
      reply: replyText,
      intent,
      latencyMs,
      passed,
      failures,
    });
  }

  const passedCount = results.filter((r) => r.passed).length;
  const failedCount = results.filter((r) => !r.passed).length;

  return NextResponse.json({
    status: "completed",
    timestamp: new Date().toISOString(),
    batch: {
      offset,
      limit,
      totalSuite: STRESS_TEST_SUITE.length,
      processed: results.length,
    },
    summary: {
      testedInBatch: results.length,
      passed: passedCount,
      failed: failedCount,
      passRate: `${Math.round((passedCount / (results.length || 1)) * 100)}%`,
      totalAssertionsChecked,
      totalViolations,
      avgLatencyMs: Math.round(results.reduce((acc, r) => acc + r.latencyMs, 0) / (results.length || 1)),
    },
    anomaliesDetected,
    results,
  });
}
