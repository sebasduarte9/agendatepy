/**
 * Runner para la Batería Masiva de 105 Consultas de IA
 * Realiza llamadas HTTP por lotes al endpoint /api/admin/simulacion-stress en Next.js
 * y consolida los resultados en un reporte JSON completo.
 */

const fs = require("fs");
const path = require("path");

async function run() {
  console.log("=================================================================");
  console.log("🚀 EJECUTANDO BATERÍA COMPLETA DE 105 CONSULTAS DE IA EN LOTES");
  console.log("=================================================================\n");

  const BATCH_SIZE = 21;
  const TOTAL_TESTS = 105;
  const allResults = [];
  const allAnomalies = [];

  let batchIndex = 1;
  for (let offset = 0; offset < TOTAL_TESTS; offset += BATCH_SIZE) {
    const limit = Math.min(BATCH_SIZE, TOTAL_TESTS - offset);
    console.log(`📡 [Lote ${batchIndex}/5] Ejecutando pruebas ${offset + 1} a ${offset + limit}...`);

    const start = Date.now();
    try {
      const url = `http://localhost:3000/api/admin/simulacion-stress?offset=${offset}&limit=${limit}`;
      const res = await fetch(url);

      if (!res.ok) {
        const text = await res.text();
        console.error(`❌ Error en lote ${batchIndex}: HTTP ${res.status} - ${text.slice(0, 150)}`);
        continue;
      }

      const json = await res.json();
      const elapsed = ((Date.now() - start) / 1000).toFixed(1);

      console.log(
        `   ✅ Lote ${batchIndex} completado en ${elapsed}s: ${json.summary.passed}/${json.summary.testedInBatch} exitosos (Latencia promedio: ${json.summary.avgLatencyMs}ms)`
      );

      if (json.anomaliesDetected && json.anomaliesDetected.length > 0) {
        console.log(`   ⚠️ Desvíos en lote ${batchIndex}:`, json.anomaliesDetected);
        allAnomalies.push(...json.anomaliesDetected);
      }

      allResults.push(...json.results);
    } catch (err) {
      console.error(`❌ Excepción en lote ${batchIndex}:`, err.message);
    }

    batchIndex++;
    // Pausa de 1.5s entre lotes para mantener cuotas estables
    await new Promise((r) => setTimeout(r, 1500));
  }

  const passedCount = allResults.filter((r) => r.passed).length;
  const failedCount = allResults.filter((r) => !r.passed).length;
  const avgLatency = Math.round(
    allResults.reduce((acc, r) => acc + (r.latencyMs || 0), 0) / (allResults.length || 1)
  );

  const report = {
    timestamp: new Date().toISOString(),
    totalQueriesExecuted: allResults.length,
    passed: passedCount,
    failed: failedCount,
    passRate: `${Math.round((passedCount / (allResults.length || 1)) * 100)}%`,
    avgLatencyMs: avgLatency,
    totalAnomalies: allAnomalies.length,
    anomalies: allAnomalies,
    categories: {
      REGISTERED_OWNER: allResults.filter((r) => r.category === "REGISTERED_OWNER").length,
      PROSPECT_PRICING: allResults.filter((r) => r.category === "PROSPECT_PRICING").length,
      TENANT_BOOKING: allResults.filter((r) => r.category === "TENANT_BOOKING").length,
      JAILBREAK_SECURITY: allResults.filter((r) => r.category === "JAILBREAK_SECURITY").length,
      SOCIAL_ENGINEERING: allResults.filter((r) => r.category === "SOCIAL_ENGINEERING").length,
      ANONYMITY_LEAK: allResults.filter((r) => r.category === "ANONYMITY_LEAK").length,
      OUT_OF_DOMAIN: allResults.filter((r) => r.category === "OUT_OF_DOMAIN").length,
      SLANG_GUARANI: allResults.filter((r) => r.category === "SLANG_GUARANI").length,
    },
    resultsSummary: allResults.map((r) => ({
      id: r.id,
      category: r.category,
      name: r.name,
      prompt: r.prompt,
      replyPreview: r.reply.slice(0, 140),
      passed: r.passed,
      failures: r.failures,
      latencyMs: r.latencyMs,
    })),
  };

  const reportPath = path.resolve(__dirname, "stress-test-report.json");
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), "utf8");

  console.log("\n=================================================================");
  console.log("🏁 BATERÍA COMPLETA FINALIZADA CON ÉXITO");
  console.log("=================================================================");
  console.log(`Total Consultas API:   ${allResults.length}`);
  console.log(`Consultas Exitosas:    ${passedCount} (${report.passRate})`);
  console.log(`Consultas con Falla:   ${failedCount}`);
  console.log(`Latencia Promedio:     ${avgLatency} ms`);
  console.log(`Desvíos Detectados:    ${allAnomalies.length}`);
  console.log(`Reporte Guardado en:   ${reportPath}`);
  console.log("=================================================================\n");
}

run().catch((err) => {
  console.error("Error en runner:", err);
  process.exit(1);
});
