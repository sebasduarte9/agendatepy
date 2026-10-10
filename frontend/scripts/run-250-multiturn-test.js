/**
 * Runner para Simulación Masiva Multi-Turno: 50 Personas × 5 Turnos (250 Consultas API)
 * Ejecuta 5 lotes de 10 personas a través de la ruta /api/admin/simulacion-conversaciones
 * y genera un reporte consolidado con el análisis de mareo y memoria conversacional.
 */

const fs = require("fs");
const path = require("path");

async function run() {
  console.log("==========================================================================");
  console.log("🚀 EJECUTANDO SIMULACIÓN MULTI-TURNO: 50 PERSONAS × 5 TURNOS (250 CONSULTAS)");
  console.log("==========================================================================\n");

  const BATCH_PERSONAS = 10;
  const TOTAL_PERSONAS = 50;
  const allResults = [];
  const allAnomalies = [];
  let totalApiQueries = 0;
  let totalQueriesPassed = 0;

  let batchIndex = 1;
  for (let offset = 0; offset < TOTAL_PERSONAS; offset += BATCH_PERSONAS) {
    const limit = Math.min(BATCH_PERSONAS, TOTAL_PERSONAS - offset);
    console.log(
      `📡 [Lote ${batchIndex}/5] Ejecutando personas ${offset + 1} a ${offset + limit} (50 consultas API en este lote)...`
    );

    const start = Date.now();
    try {
      const url = `http://localhost:3000/api/admin/simulacion-conversaciones?offset=${offset}&limit=${limit}`;
      const res = await fetch(url);

      if (!res.ok) {
        const text = await res.text();
        console.error(`❌ Error en lote ${batchIndex}: HTTP ${res.status} - ${text.slice(0, 150)}`);
        continue;
      }

      const json = await res.json();
      const elapsed = ((Date.now() - start) / 1000).toFixed(1);

      totalApiQueries += json.summary.totalTurns;
      totalQueriesPassed += json.summary.totalTurnsPassed;

      console.log(
        `   ✅ Lote ${batchIndex} completado en ${elapsed}s: ${json.summary.totalTurnsPassed}/${json.summary.totalTurns} turnos exitosos (${json.summary.passRate})`
      );

      if (json.anomalies && json.anomalies.length > 0) {
        console.log(`   ⚠️ Desvíos en lote ${batchIndex}:`, json.anomalies);
        allAnomalies.push(...json.anomalies);
      }

      allResults.push(...json.results);
    } catch (err) {
      console.error(`❌ Excepción en lote ${batchIndex}:`, err.message);
    }

    batchIndex++;
    // Pausa de 2s entre lotes para mantener cuotas sanas
    await new Promise((r) => setTimeout(r, 2000));
  }

  const report = {
    timestamp: new Date().toISOString(),
    totalPersonasTested: allResults.length,
    totalApiQueriesExecuted: totalApiQueries,
    totalQueriesPassed: totalQueriesPassed,
    totalQueriesFailed: totalApiQueries - totalQueriesPassed,
    passRate: `${Math.round((totalQueriesPassed / (totalApiQueries || 1)) * 100)}%`,
    totalAnomalies: allAnomalies.length,
    anomalies: allAnomalies,
    personasSummary: allResults.map((p) => ({
      personaId: p.personaId,
      name: p.name,
      category: p.category,
      target: p.target,
      passed: p.passed,
      turnsCount: p.turns.length,
      sampleTurn3: p.turns[2] ? { user: p.turns[2].user, ai: p.turns[2].assistant.slice(0, 120) } : null,
      sampleTurn5: p.turns[4] ? { user: p.turns[4].user, ai: p.turns[4].assistant.slice(0, 120) } : null,
    })),
  };

  const reportPath = path.resolve(__dirname, "multiturn-stress-report.json");
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), "utf8");

  console.log("\n==========================================================================");
  console.log("🏁 SIMULACIÓN DE 250 CONSULTAS MULTI-TURNO COMPLETADA CON ÉXITO");
  console.log("==========================================================================");
  console.log(`Total Personas Simuladas:  ${allResults.length}`);
  console.log(`Total Consultas API:       ${totalApiQueries}`);
  console.log(`Consultas Exitosas:        ${totalQueriesPassed} (${report.passRate})`);
  console.log(`Consultas con Falla:       ${totalApiQueries - totalQueriesPassed}`);
  console.log(`Desvíos Detectados:        ${allAnomalies.length}`);
  console.log(`Reporte Guardado en:       ${reportPath}`);
  console.log("==========================================================================\n");
}

run().catch((err) => {
  console.error("Error fatal en runner multi-turno:", err);
  process.exit(1);
});
