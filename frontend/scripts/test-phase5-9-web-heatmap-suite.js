/**
 * Suite de Validación: WEB HEATMAP & ANALÍTICA DE COMPORTAMIENTO REAL
 * Valida los 17 tests requeridos para la Fase 5.9 (Fase N).
 */

const http = require("http");
const crypto = require("crypto");
const { PrismaClient, WebEventType } = require("@prisma/client");

const prisma = new PrismaClient();
const BASE_URL = "http://localhost:3000";
const SESSION_SECRET =
  process.env.SESSION_SECRET ||
  "agendatepy-secure-hmac-sha256-secret-key-paraguay-production-2026";

function signPayload(payload) {
  const signature = crypto
    .createHmac("sha256", SESSION_SECRET)
    .update(payload)
    .digest("base64url");
  return `${payload}.${signature}`;
}

function createSessionCookie(user) {
  const rawPayload = Buffer.from(JSON.stringify(user)).toString("base64url");
  return `agendate_session=${signPayload(rawPayload)}`;
}

function request(path, options = {}) {
  const url = new URL(path, BASE_URL);
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: url.hostname,
        port: url.port,
        path: url.pathname + url.search,
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
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body,
            json,
          });
        });
      }
    );
    req.on("error", reject);
    if (options.body) {
      req.write(
        typeof options.body === "string"
          ? options.body
          : JSON.stringify(options.body)
      );
    }
    req.end();
  });
}

async function run() {
  console.log("======================================================================");
  console.log("   FASE 5.9: WEB HEATMAP — SUITE DE PRUEBAS AUTOMATIZADAS (01 - 17)   ");
  console.log("======================================================================\n");

  const results = [];
  function record(testName, expected, actual, pass, evidence) {
    results.push({ testName, expected, actual, pass, evidence });
    const mark = pass ? "✅ [PASS]" : "❌ [FAIL]";
    console.log(`${mark} ${testName}`);
    console.log(`   Esperado: ${expected}`);
    console.log(`   Obtenido: ${actual}`);
    if (evidence) console.log(`   Evidencia: ${evidence}`);
    console.log("");
  }

  try {
    let tenantA = await prisma.tenant.findFirst({ where: { slug: "negocio-a-heatmap" } });
    if (!tenantA) {
      tenantA = await prisma.tenant.create({
        data: {
          name: "Negocio A Heatmap Test",
          slug: "negocio-a-heatmap",
          subdomain: "negocio-a-heatmap",
          status: "ACTIVE",
        },
      });
    }

    let tenantB = await prisma.tenant.findFirst({ where: { slug: "negocio-b-heatmap" } });
    if (!tenantB) {
      tenantB = await prisma.tenant.create({
        data: {
          name: "Negocio B Heatmap Test",
          slug: "negocio-b-heatmap",
          subdomain: "negocio-b-heatmap",
          status: "ACTIVE",
        },
      });
    }

    const superAdminCookie = createSessionCookie({
      id: "superadmin-heatmap-uuid",
      email: "superadmin.heatmap@agendate.py",
      role: "SUPERADMIN",
      tenantId: null,
    });

    const ownerACookie = createSessionCookie({
      id: "owner-heatmap-a-uuid",
      email: "owner.heatmap@agendate.py",
      role: "OWNER",
      tenantId: tenantA.id,
    });

    const testSessionIdA = `ses_test_a_${Date.now()}`;
    const testSessionIdB = `ses_test_b_${Date.now()}`;

    // --- TEST 01: Creación de sesión mediante /api/analytics/collect ---
    const res01 = await request("/api/analytics/collect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: {
        tenantSlug: tenantA.slug,
        sessionId: testSessionIdA,
        pagePath: `/${tenantA.slug}/reservar`,
        deviceType: "desktop",
        viewportWidth: 1440,
        viewportHeight: 900,
        events: [],
      },
    });

    const dbSessionA = await prisma.webAnalyticsSession.findFirst({
      where: { sessionId: testSessionIdA },
    });

    record(
      "TEST 01: Creación de sesión (WebAnalyticsSession)",
      "Status 200 y registro de sesión en base de datos",
      `Status: ${res01.status}, DB session: ${dbSessionA?.sessionId}`,
      res01.status === 200 && dbSessionA !== null && dbSessionA.tenantId === tenantA.id,
      `Session ID: ${dbSessionA?.sessionId}, Tenant: ${dbSessionA?.tenantId}`
    );

    // --- TEST 02: Ingestión de CLICK ---
    const res02 = await request("/api/analytics/collect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: {
        tenantSlug: tenantA.slug,
        sessionId: testSessionIdA,
        pagePath: `/${tenantA.slug}/reservar`,
        deviceType: "desktop",
        viewportWidth: 1440,
        viewportHeight: 900,
        events: [
          {
            eventType: "CLICK",
            x: 720,
            y: 450,
            viewportWidth: 1440,
            viewportHeight: 900,
            elementSelector: "button#confirm-btn",
            elementTag: "button",
            elementText: "Confirmar Reserva",
            metadata: { normX: 0.5, normY: 0.5 },
          },
        ],
      },
    });

    const clickEvents = await prisma.webAnalyticsEvent.findMany({
      where: { sessionId: testSessionIdA, eventType: WebEventType.CLICK },
    });

    record(
      "TEST 02: Ingestión de evento CLICK",
      "Status 200 y evento persistido con coordenadas",
      `Status: ${res02.status}, Total clicks persistidos: ${clickEvents.length}`,
      res02.status === 200 && clickEvents.length >= 1,
      `Click tag: ${clickEvents[0]?.elementTag}, selector: ${clickEvents[0]?.elementSelector}`
    );

    // --- TEST 03: Ingestión de SCROLL ---
    const res03 = await request("/api/analytics/collect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: {
        tenantSlug: tenantA.slug,
        sessionId: testSessionIdA,
        pagePath: `/${tenantA.slug}/reservar`,
        events: [
          {
            eventType: "SCROLL",
            scrollDepth: 75,
            viewportWidth: 1440,
            viewportHeight: 900,
          },
        ],
      },
    });

    const scrollEvents = await prisma.webAnalyticsEvent.findMany({
      where: { sessionId: testSessionIdA, eventType: WebEventType.SCROLL },
    });

    record(
      "TEST 03: Ingestión de evento SCROLL",
      "Status 200 y scrollDepth persistido",
      `Status: ${res03.status}, scrollDepth: ${scrollEvents[0]?.scrollDepth}%`,
      res03.status === 200 && scrollEvents.length >= 1 && scrollEvents[0]?.scrollDepth === 75,
      `Scroll depth registrado: ${scrollEvents[0]?.scrollDepth}%`
    );

    // --- TEST 04: Ingestión de MOUSE_MOVE (con throttling/batching) ---
    const res04 = await request("/api/analytics/collect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: {
        tenantSlug: tenantA.slug,
        sessionId: testSessionIdA,
        pagePath: `/${tenantA.slug}/reservar`,
        events: [
          {
            eventType: "MOUSE_MOVE",
            x: 500,
            y: 300,
            metadata: { normX: 0.35, normY: 0.33 },
          },
          {
            eventType: "MOUSE_MOVE",
            x: 520,
            y: 310,
            metadata: { normX: 0.36, normY: 0.34 },
          },
        ],
      },
    });

    const moveEvents = await prisma.webAnalyticsEvent.findMany({
      where: { sessionId: testSessionIdA, eventType: WebEventType.MOUSE_MOVE },
    });

    record(
      "TEST 04: Ingestión de eventos MOUSE_MOVE en batch",
      "Status 200 y múltiples eventos de movimiento persistidos",
      `Status: ${res04.status}, count: ${moveEvents.length}`,
      res04.status === 200 && moveEvents.length >= 2,
      `Movimientos registrados: ${moveEvents.length}`
    );

    // --- TEST 05: Validación de payload válido ---
    const res05 = await request("/api/analytics/collect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: {
        tenantId: tenantA.id,
        sessionId: testSessionIdA,
        pagePath: `/${tenantA.slug}/reservar`,
        deviceType: "mobile",
        viewportWidth: 375,
        viewportHeight: 667,
        events: [
          {
            eventType: "CLICK",
            x: 180,
            y: 300,
            elementTag: "a",
            elementText: "Servicios",
          },
        ],
      },
    });

    record(
      "TEST 05: Validación de payload con tenantId y deviceType",
      "Status 200 con ok: true",
      `Status: ${res05.status}, ok: ${res05.json?.ok}`,
      res05.status === 200 && res05.json?.ok === true,
      `Processed: ${res05.json?.processed}`
    );

    // --- TEST 06: Rechazo de payload inválido (sin sessionId ni tenant) ---
    const res06 = await request("/api/analytics/collect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: {
        events: [{ eventType: "CLICK" }],
      },
    });

    record(
      "TEST 06: Rechazo de payload inválido sin sessionId o tenant",
      "Status 400 Bad Request",
      `Status: ${res06.status}, error: ${res06.json?.error}`,
      res06.status === 400,
      `Mensaje: ${res06.json?.message}`
    );

    // --- TEST 07: Aislamiento tenant en ingestión (Tenant B vs Tenant A) ---
    const res07 = await request("/api/analytics/collect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: {
        tenantSlug: tenantB.slug,
        sessionId: testSessionIdB,
        pagePath: `/${tenantB.slug}/reservar`,
        deviceType: "mobile",
        viewportWidth: 390,
        viewportHeight: 844,
        events: [
          {
            eventType: "CLICK",
            x: 200,
            y: 400,
            elementTag: "button",
            elementText: "Reservar B",
          },
        ],
      },
    });

    const eventB = await prisma.webAnalyticsEvent.findFirst({
      where: { sessionId: testSessionIdB },
    });

    record(
      "TEST 07: Aislamiento tenant en ingestión",
      `Evento de Tenant B asignado a ${tenantB.id}`,
      `tenantId asignado: ${eventB?.tenantId}`,
      res07.status === 200 && eventB?.tenantId === tenantB.id && eventB?.tenantId !== tenantA.id,
      `Tenant A: ${tenantA.id} vs Tenant B: ${eventB?.tenantId}`
    );

    // --- TEST 08: Agregación de clicks en GET /api/admin/heatmap ---
    const res08 = await request(`/api/admin/heatmap?tenantId=${tenantA.id}`, {
      headers: { Cookie: superAdminCookie },
    });

    record(
      "TEST 08: Agregación de clicks y puntos en GET /api/admin/heatmap",
      "Status 200 con totalClicks >= 2 y clickPoints array",
      `Status: ${res08.status}, totalClicks: ${res08.json?.stats?.totalClicks}, points: ${res08.json?.clickPoints?.length}`,
      res08.status === 200 && res08.json?.stats?.totalClicks >= 2 && Array.isArray(res08.json?.clickPoints),
      `Total Clicks: ${res08.json?.stats?.totalClicks}`
    );

    // --- TEST 09: Agregación de scroll (avgScrollDepth y distribución) ---
    record(
      "TEST 09: Agregación de scroll (avgScrollDepth y percentiles)",
      "avgScrollDepth >= 0 y distribución por rangos",
      `avgScrollDepth: ${res08.json?.stats?.avgScrollDepth}%, dist: ${JSON.stringify(res08.json?.stats?.scrollDistribution)}`,
      res08.json?.stats?.avgScrollDepth > 0 && typeof res08.json?.stats?.scrollDistribution === "object",
      `Avg Depth: ${res08.json?.stats?.avgScrollDepth}%`
    );

    // --- TEST 10: Filtros por período (7d, 30d, 90d) ---
    const res10_7d = await request(`/api/admin/heatmap?period=7d&tenantId=${tenantA.id}`, {
      headers: { Cookie: superAdminCookie },
    });
    const res10_90d = await request(`/api/admin/heatmap?period=90d&tenantId=${tenantA.id}`, {
      headers: { Cookie: superAdminCookie },
    });

    record(
      "TEST 10: Filtros por período (7d vs 90d)",
      "Status 200 en ambos períodos",
      `7d status: ${res10_7d.status}, 90d status: ${res10_90d.status}`,
      res10_7d.status === 200 && res10_90d.status === 200,
      `7d sessions: ${res10_7d.json?.stats?.totalSessions}, 90d sessions: ${res10_90d.json?.stats?.totalSessions}`
    );

    // --- TEST 11: Filtros por dispositivo (desktop vs mobile) ---
    const res11_desk = await request(`/api/admin/heatmap?deviceType=desktop&tenantId=${tenantA.id}`, {
      headers: { Cookie: superAdminCookie },
    });
    const res11_mob = await request(`/api/admin/heatmap?deviceType=mobile&tenantId=${tenantA.id}`, {
      headers: { Cookie: superAdminCookie },
    });

    record(
      "TEST 11: Filtros por dispositivo (Desktop vs Mobile)",
      "Filtro aplicado correctamente a sesiones y eventos",
      `Desktop sessions: ${res11_desk.json?.stats?.totalSessions}, Mobile sessions: ${res11_mob.json?.stats?.totalSessions}`,
      res11_desk.status === 200 && res11_mob.status === 200,
      `Desktop: ${res11_desk.json?.stats?.totalSessions}, Mobile: ${res11_mob.json?.stats?.totalSessions}`
    );

    // --- TEST 12: Filtro por pagePath ---
    const testPagePath = `/${tenantA.slug}/reservar`;
    const res12 = await request(`/api/admin/heatmap?pagePath=${encodeURIComponent(testPagePath)}&tenantId=${tenantA.id}`, {
      headers: { Cookie: superAdminCookie },
    });

    record(
      "TEST 12: Filtro por pagePath específico",
      `Retorna datos exclusivos de la página ${testPagePath}`,
      `Status: ${res12.status}, pagePath: ${res12.json?.pagePath}`,
      res12.status === 200 && res12.json?.pagePath === testPagePath,
      `Available pages count: ${res12.json?.availablePages?.length}`
    );

    // --- TEST 13: Protección contra PII (no guarda passwords, inputs ni datos sensibles) ---
    const piiSessionId = `pii_test_${Date.now()}`;
    await request("/api/analytics/collect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: {
        tenantSlug: tenantA.slug,
        sessionId: piiSessionId,
        pagePath: `/${tenantA.slug}/reservar?token=secret123&email=user@test.com`,
        events: [
          {
            eventType: "CLICK",
            x: 100,
            y: 100,
            elementTag: "input",
            elementSelector: "input[name='password']",
            elementText: "Password123! and user@secret.com phone 0981123456",
          },
        ],
      },
    });

    const piiSession = await prisma.webAnalyticsSession.findFirst({
      where: { sessionId: piiSessionId },
    });
    const piiEvent = await prisma.webAnalyticsEvent.findFirst({
      where: { sessionId: piiSessionId },
    });

    const cleanPath = !piiSession?.pagePath?.includes("secret123");
    const cleanText = piiEvent?.elementText === null || !piiEvent?.elementText?.includes("user@secret.com");

    record(
      "TEST 13: Protección contra PII (query strings limpias y bloqueo de inputs)",
      "Query params sensibles descartados y texto de inputs sanitizado",
      `Clean path: ${cleanPath}, Clean text: ${cleanText}`,
      cleanPath && cleanText,
      `Saved path: ${piiSession?.pagePath}, Saved text: ${piiEvent?.elementText || "NULL"}`
    );

    // --- TEST 14: Límite de batch y tamaño de payload ---
    const hugeEvents = Array.from({ length: 150 }, (_, i) => ({
      eventType: "CLICK",
      x: i,
      y: i,
    }));

    const res14 = await request("/api/analytics/collect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: {
        tenantSlug: tenantA.slug,
        sessionId: testSessionIdA,
        pagePath: `/${tenantA.slug}/reservar`,
        events: hugeEvents,
      },
    });

    record(
      "TEST 14: Límite de batch (máximo 100 eventos por request)",
      "Status 400 Payload Too Large / Batch Limit Exceeded",
      `Status: ${res14.status}, error: ${res14.json?.error}`,
      res14.status === 400,
      `Mensaje: ${res14.json?.message}`
    );

    // --- TEST 15: Autorización de lectura (SuperAdmin vs Anónimo) ---
    const res15_anon = await request("/api/admin/heatmap");
    const res15_admin = await request("/api/admin/heatmap", {
      headers: { Cookie: superAdminCookie },
    });

    record(
      "TEST 15: Autorización de lectura en /api/admin/heatmap",
      "Anónimo 401 Unauthorized, SuperAdmin 200 OK",
      `Anónimo: ${res15_anon.status}, Admin: ${res15_admin.status}`,
      res15_anon.status === 401 && res15_admin.status === 200,
      `Anon error: ${res15_anon.json?.error}`
    );

    // --- TEST 16: SuperAdmin global (tenantId=ALL) ---
    const res16 = await request("/api/admin/heatmap?tenantId=ALL", {
      headers: { Cookie: superAdminCookie },
    });

    record(
      "TEST 16: SuperAdmin consulta global (tenantId=ALL)",
      "Status 200 con total de sesiones de todos los tenants",
      `Status: ${res16.status}, totalSessions: ${res16.json?.stats?.totalSessions}`,
      res16.status === 200 && res16.json?.tenantId === "ALL",
      `Global Sessions: ${res16.json?.stats?.totalSessions}`
    );

    // --- TEST 17: Tenant no puede leer datos de otro tenant (/api/analytics/heatmap) ---
    const res17_ownerA = await request("/api/analytics/heatmap", {
      headers: { Cookie: ownerACookie },
    });

    const ownerAData = res17_ownerA.json;
    const isStrictlyTenantA = ownerAData?.tenantId === tenantA.id;

    record(
      "TEST 17: Tenant aislado en /api/analytics/heatmap",
      `Owner A sólo recibe datos de su propio tenant (${tenantA.id})`,
      `Status: ${res17_ownerA.status}, tenantId: ${ownerAData?.tenantId}`,
      res17_ownerA.status === 200 && isStrictlyTenantA,
      `Autenticado: owner.heatmap@agendate.py, Scope: ${ownerAData?.tenantId}`
    );

    console.log("======================================================================");
    const passedCount = results.filter((r) => r.pass).length;
    console.log(`RESUMEN: ${passedCount} / ${results.length} TESTS PASARON EXITOSAMENTE`);
    console.log("======================================================================");

    if (passedCount < results.length) {
      process.exit(1);
    }
  } catch (err) {
    console.error("FATAL ERROR in test suite:", err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

run();
