/**
 * Suite de pruebas HTTP sobre el servidor Next.js en ejecución (localhost:3000).
 * Valida los 8 casos de prueba de la FASE CRÍTICA.
 */

const http = require("http");

async function fetchHttp(url, options = {}) {
  const parsed = new URL(url);
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: parsed.hostname,
        port: parsed.port,
        path: parsed.pathname + parsed.search,
        method: options.method || "GET",
        headers: options.headers || {},
      },
      (res) => {
        let body = "";
        res.on("data", (chunk) => (body += chunk));
        res.on("end", () => {
          let json = null;
          try {
            json = JSON.parse(body);
          } catch {}
          resolve({ status: res.statusCode, headers: res.headers, body, json });
        });
      }
    );
    req.on("error", reject);
    if (options.body) {
      req.write(options.body);
    }
    req.end();
  });
}

async function run() {
  console.log("==================================================");
  console.log("EJECUTANDO TESTS HTTP SOBRE SERVIDOR AGENDATEPY");
  console.log("Servidor: http://localhost:3000");
  console.log("==================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition, testName, detail) {
    if (condition) {
      console.log(`✅ [PASSED] ${testName}`);
      passed++;
    } else {
      console.error(`❌ [FAILED] ${testName}`);
      if (detail) console.error(`   Detalle: ${detail}`);
      failed++;
    }
  }

  // 1. TEST 7: Upload sin autenticación
  try {
    const res = await fetchHttp("http://localhost:3000/api/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dataUrl: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=" }),
    });
    assert(
      res.status === 401,
      "TEST 7: Upload sin autenticación rechazado con 401",
      `Recibido HTTP ${res.status} - ${res.body}`
    );
  } catch (e) {
    assert(false, "TEST 7: Error en fetch", e.message);
  }

  // 2. TEST 8: Invite sin autenticación
  try {
    const res = await fetchHttp("http://localhost:3000/api/team/invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "hacker@test.com", role: "OWNER" }),
    });
    assert(
      res.status === 401,
      "TEST 8: Invite sin autenticación rechazado con 401",
      `Recibido HTTP ${res.status} - ${res.body}`
    );
  } catch (e) {
    assert(false, "TEST 8: Error en fetch", e.message);
  }

  // 3. TEST 2: Consulta de datos /api/dashboard/sync sin sesión
  try {
    const res = await fetchHttp("http://localhost:3000/api/dashboard/sync?tenant=barberia", {
      method: "GET",
    });
    assert(
      res.status === 401,
      "TEST 2: GET /api/dashboard/sync sin sesión rechazado con 401",
      `Recibido HTTP ${res.status} - ${res.body}`
    );
  } catch (e) {
    assert(false, "TEST 2: Error en fetch", e.message);
  }

  // 4. TEST 3: Modificación de datos /api/dashboard/sync sin sesión
  try {
    const res = await fetchHttp("http://localhost:3000/api/dashboard/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "update_status",
        tenantSlug: "barberia",
        data: { appointmentId: "123", status: "cancelled" },
      }),
    });
    assert(
      res.status === 401,
      "TEST 3: POST /api/dashboard/sync sin sesión rechazado con 401",
      `Recibido HTTP ${res.status} - ${res.body}`
    );
  } catch (e) {
    assert(false, "TEST 3: Error en fetch", e.message);
  }

  // 5. TEST 3B: Modificación de tema /api/tenant/theme sin sesión
  try {
    const res = await fetchHttp("http://localhost:3000/api/tenant/theme", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        slug: "barberia",
        theme: { primaryColor: "#ff0000" },
      }),
    });
    assert(
      res.status === 401,
      "TEST 3B: POST /api/tenant/theme sin sesión rechazado con 401",
      `Recibido HTTP ${res.status} - ${res.body}`
    );
  } catch (e) {
    assert(false, "TEST 3B: Error en fetch", e.message);
  }

  // 6. TEST 6 & 7B: Ruta inexistente en reserva pública NO muestra demo falso
  try {
    const res = await fetchHttp("http://localhost:3000/negocio-inexistente-12345/reservar", {
      method: "GET",
    });
    // Debe devolver 404 (notFound) y no 200 con la barbería demo
    assert(
      res.status === 404,
      "TEST 6: Negocio inexistente en reserva pública devuelve 404 Not Found (no barbería demo)",
      `Recibido HTTP ${res.status}`
    );
  } catch (e) {
    assert(false, "TEST 6: Error en fetch", e.message);
  }

  // 7. TEST 6B: Ruta explícita demo barberia funciona
  try {
    const res = await fetchHttp("http://localhost:3000/barberia/reservar", {
      method: "GET",
    });
    assert(
      res.status === 200,
      "TEST 6B: Ruta demo explícita /barberia/reservar responde 200 OK",
      `Recibido HTTP ${res.status}`
    );
  } catch (e) {
    assert(false, "TEST 6B: Error en fetch", e.message);
  }

  // 8. TEST 1B: Página de onboarding carga con los nuevos campos de cuenta administrador
  try {
    const res = await fetchHttp("http://localhost:3000/onboarding", {
      method: "GET",
    });
    assert(
      res.status === 200 && res.body.includes("owner-email-input"),
      "TEST 1B: Onboarding incluye campos obligatorios de cuenta administrador",
      `Recibido HTTP ${res.status}`
    );
  } catch (e) {
    assert(false, "TEST 1B: Error en fetch", e.message);
  }

  console.log("\n==================================================");
  console.log(`RESULTADO FINAL: ${passed} PRUEBAS APROBADAS | ${failed} PRUEBAS FALLIDAS`);
  console.log("==================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

run().catch((e) => {
  console.error("Error fatal:", e);
  process.exit(1);
});
