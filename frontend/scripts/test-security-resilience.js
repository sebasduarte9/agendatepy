/**
 * AGENDATEPY — SIMULADOR DE ATAQUES Y SUITE DE RESILIENCIA DE SEGURIDAD PRE-PROD
 * 
 * Simula vectores de ataque comunes para auditar la robustez del sistema:
 * 1. SQL Injection y manipulación de parámetros en endpoints públicos y privados.
 * 2. IDOR y Broken Access Control (intentos de acceso cross-tenant y robo de datos).
 * 3. Falsificación de sesión criptográfica HMAC y escalamiento de privilegios SUPERADMIN.
 * 4. Path Traversal en almacenamiento de archivos e intentos de SSRF en endpoints de medios.
 * 5. Carga de archivos maliciosos (extensiones .exe, .sh, .php, scripts SVG).
 * 6. Inyección de cabeceras HTTP (CRLF / Response Splitting).
 * 7. DoS por Payloads Masivos / Corruptos y ráfagas de JSON malformado.
 * 8. Comprobación de disponibilidad continua del servicio (Zero Downtime / Zero Crash).
 */

const http = require("http");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const BASE_URL = "http://localhost:3000";

function requestHttp(url, options = {}) {
  const parsed = new URL(url);
  const headers = { ...(options.headers || {}) };
  if (options.body && !headers["Content-Length"]) {
    headers["Content-Length"] = Buffer.byteLength(options.body);
  }

  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: parsed.hostname,
        port: parsed.port,
        path: parsed.pathname + parsed.search,
        method: options.method || "GET",
        headers,
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

async function runSecurityAudit() {
  console.log("======================================================================");
  console.log("   AGENDATEPY — AUDITORÍA DE SEGURIDAD DEFENSIVA Y RESILIENCIA");
  console.log("======================================================================\n");

  let totalTests = 0;
  let passedTests = 0;

  function report(pass, name, details = "") {
    totalTests++;
    if (pass) {
      passedTests++;
      console.log(`🛡️  [DEFENDED] ${name}`);
    } else {
      console.error(`🚨 [VULNERABILITY DETECTED] ${name}`);
    }
    if (details) {
      console.log(`   └─ Detalle: ${details}`);
    }
  }

  // -------------------------------------------------------------------------
  // VECTOR 1: INTENTOS DE SQL INJECTION Y QUERY TAMPERING
  // -------------------------------------------------------------------------
  console.log("\n--- VECTOR 1: INYECCIÓN SQL Y MANIPULACIÓN DE CONSULTAS ---");
  const sqliPayloads = [
    "' OR '1'='1",
    "'; DROP TABLE tenants; --",
    "admin' --",
    "1 UNION SELECT null, null, password, email FROM users--",
  ];

  for (const sqli of sqliPayloads) {
    try {
      const res = await requestHttp(`${BASE_URL}/api/appointments?tenant=${encodeURIComponent(sqli)}&serviceId=123&date=2026-11-20`);
      // Esperado: 400 (parámetro inválido) o 404 (no encontrado), NUNCA 500 con error de base de datos ni 200 con datos filtrados
      const defended = res.status === 400 || res.status === 404;
      report(
        defended,
        `Inyección SQL en parámetro tenant (${sqli.slice(0, 20)}...)`,
        `HTTP Status: ${res.status} (Rechazado limpiamente por validación)`
      );
    } catch (e) {
      report(false, `Error de red en test SQLi: ${e.message}`);
    }
  }

  // Verificar que la tabla tenants sigue 100% intacta en PostgreSQL
  const tenantCountAfterSqli = await prisma.tenant.count();
  report(
    tenantCountAfterSqli > 0,
    "Integridad de base de datos PostgreSQL tras ataques de Inyección SQL",
    `Tenants en base de datos intactos: ${tenantCountAfterSqli}`
  );

  // -------------------------------------------------------------------------
  // VECTOR 2: IDOR Y BROKEN ACCESS CONTROL (ENDPOINTS PRIVADOS SIN SESIÓN)
  // -------------------------------------------------------------------------
  console.log("\n--- VECTOR 2: BROKEN ACCESS CONTROL & ACCESO NO AUTORIZADO ---");
  const protectedEndpoints = [
    { method: "GET", path: "/api/dashboard/sync" },
    { method: "POST", path: "/api/dashboard/sync", body: JSON.stringify({ action: "test" }) },
    { method: "GET", path: "/api/cash" },
    { method: "POST", path: "/api/cash", body: JSON.stringify({ amount: 1000 }) },
    { method: "GET", path: "/api/clients" },
    { method: "GET", path: "/api/commission-payouts" },
    { method: "GET", path: "/api/tenant/settings" },
    { method: "POST", path: "/api/tenant/theme", body: JSON.stringify({ primaryColor: "#000" }) },
    { method: "POST", path: "/api/team/invite", body: JSON.stringify({ email: "attacker@hack.com" }) },
    { method: "DELETE", path: "/api/upload", body: JSON.stringify({ url: "/uploads/img.png" }) },
    { method: "POST", path: "/api/upload/remove-bg", body: JSON.stringify({ imageUrl: "https://example.com/test.png" }) },
  ];

  for (const ep of protectedEndpoints) {
    try {
      const res = await requestHttp(`${BASE_URL}${ep.path}`, {
        method: ep.method,
        headers: { "Content-Type": "application/json" },
        body: ep.body,
      });
      const defended = res.status === 401 || res.status === 403;
      report(
        defended,
        `Protección de ruta ${ep.method} ${ep.path}`,
        `HTTP Status recibido: ${res.status} (Acceso denegado sin credenciales)`
      );
    } catch (e) {
      report(false, `Fallo al verificar ruta protegida ${ep.path}: ${e.message}`);
    }
  }

  // -------------------------------------------------------------------------
  // VECTOR 3: ESCALAMIENTO DE PRIVILEGIOS & FALSIFICACIÓN DE COOKIE HMAC
  // -------------------------------------------------------------------------
  console.log("\n--- VECTOR 3: INTENTO DE FALSIFICACIÓN DE SESIÓN (FORGED HMAC) ---");
  const forgedPayload = Buffer.from(
    JSON.stringify({
      id: "forged-admin-uuid",
      email: "attacker@hacker.io",
      name: "Evil Admin",
      role: "SUPERADMIN",
      tenantId: null,
    })
  ).toString("base64url");

  // Firma falsa no generada con el SESSION_SECRET del servidor
  const fakeToken = `${forgedPayload}.invalid_fake_hmac_signature_attempt_2026`;

  try {
    const res = await requestHttp(`${BASE_URL}/api/admin/overview`, {
      method: "GET",
      headers: {
        Cookie: `agendate_session=${fakeToken}`,
      },
    });
    const defended = res.status === 401 || res.status === 403;
    report(
      defended,
      "Falsificación de cookie de sesión (Firma HMAC alterada hacia SUPERADMIN)",
      `HTTP Status: ${res.status} (Firma rechazada por verificación criptográfica timingSafeEqual)`
    );
  } catch (e) {
    report(false, `Error en prueba de HMAC: ${e.message}`);
  }

  // -------------------------------------------------------------------------
  // VECTOR 4: SUBIDA DE ARCHIVOS MALICIOSOS (EXE, SHELL, PHP, HTML)
  // -------------------------------------------------------------------------
  console.log("\n--- VECTOR 4: CARGA DE ARCHIVOS MALICIOSOS Y FORMATOS NO PERMITIDOS ---");
  const dangerousUploads = [
    { ext: "php", mime: "application/x-php", content: "<?php system($_GET['cmd']); ?>" },
    { ext: "exe", mime: "application/x-msdownload", content: "MZ\x90\x00\x03\x00\x00\x00" },
    { ext: "sh", mime: "application/x-sh", content: "#!/bin/bash\nrm -rf /" },
    { ext: "svg", mime: "image/svg+xml", content: "<svg onload=alert(1)>" },
  ];

  for (const malicious of dangerousUploads) {
    try {
      const fakeDataUrl = `data:${malicious.mime};base64,${Buffer.from(malicious.content).toString("base64")}`;
      const res = await requestHttp(`${BASE_URL}/api/upload`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dataUrl: fakeDataUrl }),
      });
      // Esperado: 401 (sin sesión) o 400 (extensión/formato rechazado)
      const defended = res.status === 401 || res.status === 400;
      report(
        defended,
        `Bloqueo de payload malicioso tipo .${malicious.ext} (${malicious.mime})`,
        `HTTP Status: ${res.status} (MIME no permitido o no autenticado)`
      );
    } catch (e) {
      report(false, `Error en prueba de upload malicioso: ${e.message}`);
    }
  }

  // -------------------------------------------------------------------------
  // VECTOR 5: PATH TRAVERSAL EN SISTEMA DE ARCHIVOS
  // -------------------------------------------------------------------------
  console.log("\n--- VECTOR 5: PATH TRAVERSAL / LFI ---");
  const traversalPaths = [
    "/uploads/../../../../windows/win.ini",
    "/uploads/../../.env",
    "/uploads/%2e%2e%2f%2e%2e%2f.env",
    "../../../../etc/passwd",
  ];

  for (const trapPath of traversalPaths) {
    try {
      const res = await requestHttp(`${BASE_URL}/api/upload/remove-bg`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: trapPath }),
      });
      // Esperado: 401 (sin auth) o 400 / 403 (ruta inválida), nunca 200
      const defended = res.status === 401 || res.status === 400 || res.status === 403;
      report(
        defended,
        `Protección Path Traversal: ${trapPath}`,
        `HTTP Status: ${res.status} (Acceso denegado fuera de public/uploads)`
      );
    } catch (e) {
      report(false, `Error en prueba de traversal: ${e.message}`);
    }
  }

  // -------------------------------------------------------------------------
  // VECTOR 6: SSRF (SERVER-SIDE REQUEST FORGERY)
  // -------------------------------------------------------------------------
  console.log("\n--- VECTOR 6: INTENTOS DE SSRF (SERVER-SIDE REQUEST FORGERY) ---");
  const ssrfTargets = [
    "http://169.254.169.254/latest/meta-data/",
    "http://127.0.0.1:5432",
    "http://localhost:3000/admin",
    "http://10.0.0.1/admin",
  ];

  for (const ssrfUrl of ssrfTargets) {
    try {
      const res = await requestHttp(`${BASE_URL}/api/upload/remove-bg`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: ssrfUrl }),
      });
      const defended = res.status === 401 || res.status === 403 || res.status === 400;
      report(
        defended,
        `Bloqueo SSRF a recurso interno: ${ssrfUrl}`,
        `HTTP Status: ${res.status} (Red privada o endpoint protegido denegado)`
      );
    } catch (e) {
      report(false, `Error en prueba de SSRF: ${e.message}`);
    }
  }

  // -------------------------------------------------------------------------
  // VECTOR 7: INYECCIÓN DE CABECERAS HTTP (CRLF / RESPONSE SPLITTING)
  // -------------------------------------------------------------------------
  console.log("\n--- VECTOR 7: HTTP HEADER INJECTION (CRLF) ---");
  try {
    const crlfPayload = "1001%0d%0aInjected-Header:%20pwned%0d%0a";
    const res = await requestHttp(`${BASE_URL}/api/clients/${crlfPayload}`);
    const hasInjectedHeader = Boolean(res.headers["injected-header"]);
    report(
      !hasInjectedHeader,
      "Prevención de HTTP Response Splitting / CRLF",
      `Injected-Header presente en respuesta: ${hasInjectedHeader ? "SÍ (PELIGRO)" : "NO (SEGURO)"}`
    );
  } catch (e) {
    report(false, `Error en prueba CRLF: ${e.message}`);
  }

  // -------------------------------------------------------------------------
  // VECTOR 8: RESISTENCIA A PAYLOADS MASIVOS Y JSON CORRUPTO (DoS RESILIENCE)
  // -------------------------------------------------------------------------
  console.log("\n--- VECTOR 8: RESILIENCIA A CORRUPCIÓN DE DATOS Y PAYLOADS MASIVOS ---");
  try {
    // Enviar JSON roto
    const badJsonRes = await requestHttp(`${BASE_URL}/api/dashboard/sync`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: '{"action": "update_status", broken... unclosed json',
    });
    report(
      badJsonRes.status === 400 || badJsonRes.status === 401 || badJsonRes.status === 500,
      "Manejo de JSON sintácticamente corrupto sin caída de proceso Node",
      `HTTP Status: ${badJsonRes.status}`
    );
  } catch (e) {
    report(false, `Fallo en prueba de JSON roto: ${e.message}`);
  }

  try {
    // Payload gigante que excede los 64KB en analítica
    const massivePayload = JSON.stringify({
      tenantSlug: "barberia",
      sessionId: "flood-test",
      pagePath: "/flood",
      events: Array.from({ length: 500 }).map((_, i) => ({
        eventType: "CLICK",
        x: 0.5,
        y: 0.5,
        elementText: "A".repeat(500),
      })),
    });

    const floodRes = await requestHttp(`${BASE_URL}/api/analytics/collect`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: massivePayload,
    });
    // Debe rechazar con 413 (Payload Too Large) o 400 (Batch Limit Exceeded)
    const defended = floodRes.status === 413 || floodRes.status === 400;
    report(
      defended,
      "Rechazo de Payload Flood masivo (>64KB / >100 eventos) en telemetría",
      `HTTP Status: ${floodRes.status} (${floodRes.json?.error || "Capped"})`
    );
  } catch (e) {
    report(false, `Fallo en prueba de payload masivo: ${e.message}`);
  }

  // -------------------------------------------------------------------------
  // VECTOR 9: COMPROBACIÓN FINAL DE DISPONIBILIDAD (EL SERVICIO NUNCA CAE)
  // -------------------------------------------------------------------------
  console.log("\n--- VECTOR 9: VERIFICACIÓN DE VITALIDAD DEL SERVICIO (ZERO DOWNTIME) ---");
  try {
    const healthCheck = await requestHttp(`${BASE_URL}/api/appointments?tenant=barberia&serviceId=demo&date=2026-11-20`);
    const serviceAlive = healthCheck.status === 200 || healthCheck.status === 400 || healthCheck.status === 404;
    report(
      serviceAlive,
      "El servicio continúa en línea y respondiendo activamente (Cero caídas tras batería de ataques)",
      `HTTP Status del servidor: ${healthCheck.status}`
    );
  } catch (e) {
    report(false, "EL SERVIDOR SE CAYÓ DURANTE LA BATERÍA DE ATAQUES", e.message);
  }

  // -------------------------------------------------------------------------
  // RESUMEN FINAL
  // -------------------------------------------------------------------------
  console.log("\n======================================================================");
  console.log(`   RESULTADO DE LA AUDITORÍA DEFENSIVA: ${passedTests} / ${totalTests} PRUEBAS DEFENDIDAS`);
  console.log("======================================================================\n");

  await prisma.$disconnect();

  if (passedTests !== totalTests) {
    process.exit(1);
  }
}

runSecurityAudit().catch((err) => {
  console.error("Error fatal en auditoría de seguridad:", err);
  prisma.$disconnect();
  process.exit(1);
});
