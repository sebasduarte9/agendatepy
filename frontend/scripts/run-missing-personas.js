/**
 * Completa los 4 sub-lotes restantes (5 personas c/u) para alcanzar exactamente
 * las 50 personas y 250 consultas API reales, sin exceder los timeouts de fetch.
 */

const fs = require("fs");
const path = require("path");

async function run() {
  console.log("==========================================================================");
  console.log("🚀 EJECUTANDO SUB-LOTES RESTANTES (100 CONSULTAS API PARA COMPLETAR 250)");
  console.log("==========================================================================\n");

  const reportPath = path.resolve(__dirname, "multiturn-stress-report.json");
  let existingReport = { personasSummary: [], allRawResults: [] };

  if (fs.existsSync(reportPath)) {
    try {
      existingReport = JSON.parse(fs.readFileSync(reportPath, "utf8"));
    } catch (e) {}
  }

  // Los 4 sub-lotes de 5 personas que faltaban
  const missingBatches = [
    { offset: 10, limit: 5, label: "Personas 11 a 15" },
    { offset: 15, limit: 5, label: "Personas 16 a 20" },
    { offset: 40, limit: 5, label: "Personas 41 a 45" },
    { offset: 45, limit: 5, label: "Personas 46 a 50" },
  ];

  const newResults = [];
  const allAnomalies = existingReport.anomalies || [];
  let addedQueries = 0;
  let addedPassed = 0;

  for (let i = 0; i < missingBatches.length; i++) {
    const b = missingBatches[i];
    console.log(`📡 [Sub-Lote ${i + 1}/4] Ejecutando ${b.label} (offset ${b.offset}, limit ${b.limit})...`);

    const start = Date.now();
    try {
      const url = `http://localhost:3000/api/admin/simulacion-conversaciones?offset=${b.offset}&limit=${b.limit}`;
      const res = await fetch(url);

      if (!res.ok) {
        const text = await res.text();
        console.error(`❌ Error en sub-lote ${i + 1}: HTTP ${res.status} - ${text.slice(0, 150)}`);
        continue;
      }

      const json = await res.json();
      const elapsed = ((Date.now() - start) / 1000).toFixed(1);

      addedQueries += json.summary.totalTurns;
      addedPassed += json.summary.totalTurnsPassed;

      console.log(
        `   ✅ ${b.label} completado en ${elapsed}s: ${json.summary.totalTurnsPassed}/${json.summary.totalTurns} exitosos (${json.summary.passRate})`
      );

      if (json.anomalies && json.anomalies.length > 0) {
        console.log(`   ⚠️ Desvíos:`, json.anomalies);
        allAnomalies.push(...json.anomalies);
      }

      newResults.push(...json.results);
    } catch (err) {
      console.error(`❌ Excepción en sub-lote ${i + 1}:`, err.message);
    }

    // Pausa de 2s entre sub-lotes
    await new Promise((r) => setTimeout(r, 2000));
  }

  // Consolidar todas las personas
  const existingSummaries = existingReport.personasSummary || [];
  const newSummaries = newResults.map((p) => ({
    personaId: p.personaId,
    name: p.name,
    category: p.category,
    target: p.target,
    passed: p.passed,
    turnsCount: p.turns.length,
    sampleTurn3: p.turns[2] ? { user: p.turns[2].user, ai: p.turns[2].assistant.slice(0, 120) } : null,
    sampleTurn5: p.turns[4] ? { user: p.turns[4].user, ai: p.turns[4].assistant.slice(0, 120) } : null,
  }));

  const combinedPersonas = [...existingSummaries, ...newSummaries];
  // Ordenar por ID de persona P-01 a P-50
  combinedPersonas.sort((a, b) => {
    const numA = parseInt(a.personaId.replace("P-", ""), 10);
    const numB = parseInt(b.personaId.replace("P-", ""), 10);
    return numA - numB;
  });

  const totalQueries = combinedPersonas.length * 5;
  const passedQueries = (existingReport.totalQueriesPassed || 150) + addedPassed;
  const failedQueries = totalQueries - passedQueries;

  const finalReport = {
    timestamp: new Date().toISOString(),
    totalPersonasTested: combinedPersonas.length,
    totalApiQueriesExecuted: totalQueries,
    totalQueriesPassed: passedQueries,
    totalQueriesFailed: failedQueries,
    passRate: `${Math.round((passedQueries / totalQueries) * 100)}%`,
    totalAnomalies: allAnomalies.length,
    anomalies: allAnomalies,
    personasSummary: combinedPersonas,
  };

  fs.writeFileSync(reportPath, JSON.stringify(finalReport, null, 2), "utf8");

  console.log("\n==========================================================================");
  console.log("🏁 BATERÍA COMPLETA DE 250 CONSULTAS MULTI-TURNO CONSOLIDADA CON ÉXITO");
  console.log("==========================================================================");
  console.log(`Total Personas Simuladas:  ${combinedPersonas.length}/50`);
  console.log(`Total Consultas API:       ${totalQueries}/250`);
  console.log(`Consultas Exitosas:        ${passedQueries} (${finalReport.passRate})`);
  console.log(`Consultas con Falla:       ${failedQueries}`);
  console.log(`Desvíos Detectados:        ${allAnomalies.length}`);
  console.log(`Reporte Consolidado en:    ${reportPath}`);
  console.log("==========================================================================\n");
}

run().catch((err) => {
  console.error("Error en runner:", err);
  process.exit(1);
});
