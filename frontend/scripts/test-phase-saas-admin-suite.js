/**
 * Suite de Validación: SAAS PLATFORM ADMIN & CUENTAS (FREE vs PAID)
 * Valida los 12 tests requeridos para la simplificación administrativa de AgendatePY.
 */

const http = require("http");
const crypto = require("crypto");
const { PrismaClient } = require("@prisma/client");

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
  console.log("   SAAS PLATFORM ADMIN — SUITE DE PRUEBAS AUTOMATIZADAS (01 - 12)     ");
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
    // 0. Setup test tenants with FREE and PAID plans
    let freeTenant = await prisma.tenant.findFirst({ where: { slug: "saas-free-tenant" } });
    if (!freeTenant) {
      freeTenant = await prisma.tenant.create({
        data: {
          name: "Barbería Free Test",
          slug: "saas-free-tenant",
          subdomain: "saas-free-tenant",
          plan: "FREE",
          status: "ACTIVE",
        },
      });
    }

    let proTenant = await prisma.tenant.findFirst({ where: { slug: "saas-pro-tenant" } });
    if (!proTenant) {
      proTenant = await prisma.tenant.create({
        data: {
          name: "Salón Pro Test",
          slug: "saas-pro-tenant",
          subdomain: "saas-pro-tenant",
          plan: "PROFESIONAL",
          status: "ACTIVE",
        },
      });
    }

    const superAdminCookie = createSessionCookie({
      id: "superadmin-saas-uuid",
      email: "superadmin.saas@agendate.py",
      role: "SUPERADMIN",
      tenantId: null,
    });

    const ownerCookie = createSessionCookie({
      id: "owner-saas-uuid",
      email: "owner.saas@agendate.py",
      role: "OWNER",
      tenantId: freeTenant.id,
    });

    // --- TEST 01: Total de negocios en overview coincide con PostgreSQL ---
    const dbTotalTenants = await prisma.tenant.count();
    const res01 = await request("/api/admin/overview", {
      headers: { Cookie: superAdminCookie },
    });

    const totalFromApi = res01.json?.saasOverview?.totalTenants ?? res01.json?.kpis?.totalTenants;

    record(
      "TEST 01: Total de negocios en Overview coincide con PostgreSQL",
      `totalTenants === ${dbTotalTenants}`,
      `totalTenants === ${totalFromApi}`,
      res01.status === 200 && totalFromApi === dbTotalTenants,
      `API total: ${totalFromApi}, DB count: ${dbTotalTenants}`
    );

    // --- TEST 02: Conteo de negocios FREE ---
    const dbFreeCount = await prisma.tenant.count({
      where: {
        OR: [{ plan: "FREE" }, { plan: "GRATUITO" }],
      },
    });
    const freeFromApi = res01.json?.saasOverview?.freeTenantsCount;

    record(
      "TEST 02: Conteo de negocios con cuenta FREE",
      `freeTenantsCount === ${dbFreeCount}`,
      `freeTenantsCount === ${freeFromApi}`,
      res01.status === 200 && freeFromApi === dbFreeCount,
      `FREE count: ${freeFromApi} (${res01.json?.saasOverview?.percentages?.free}%)`
    );

    // --- TEST 03: Conteo de negocios con cuenta de pago (PAID / PROFESIONAL) ---
    const dbPaidCount = await prisma.tenant.count({
      where: {
        AND: [
          { plan: { not: "FREE" } },
          { plan: { not: "GRATUITO" } },
          { plan: { not: "TRIAL" } },
        ],
      },
    });
    const paidFromApi = res01.json?.saasOverview?.paidTenantsCount;

    record(
      "TEST 03: Conteo de negocios con cuenta de pago (PAID / PRO)",
      `paidTenantsCount === ${dbPaidCount}`,
      `paidTenantsCount === ${paidFromApi}`,
      res01.status === 200 && paidFromApi === dbPaidCount,
      `PAID count: ${paidFromApi} (${res01.json?.saasOverview?.percentages?.paid}%)`
    );

    // --- TEST 04: Filtro por plan en Directorio (/api/admin/tenants?plan=FREE & plan=PAID) ---
    const res04_free = await request("/api/admin/tenants?plan=FREE", {
      headers: { Cookie: superAdminCookie },
    });
    const res04_paid = await request("/api/admin/tenants?plan=PAID", {
      headers: { Cookie: superAdminCookie },
    });

    const allAreFree = res04_free.json?.data?.every((t) => t.plan.toUpperCase() === "FREE" || t.plan.toUpperCase() === "GRATUITO");
    const allArePaid = res04_paid.json?.data?.every((t) => t.isPaid === true);

    record(
      "TEST 04: Filtro por tipo de cuenta (plan=FREE y plan=PAID)",
      "FREE retorna solo gratis, PAID retorna solo de pago",
      `allAreFree: ${allAreFree}, allArePaid: ${allArePaid}`,
      res04_free.status === 200 && res04_paid.status === 200 && allAreFree && allArePaid,
      `FREE retornados: ${res04_free.json?.data?.length}, PAID retornados: ${res04_paid.json?.data?.length}`
    );

    // --- TEST 05: Búsqueda de negocios por nombre ---
    const res05 = await request(`/api/admin/tenants?search=${encodeURIComponent("Barbería Free Test")}`, {
      headers: { Cookie: superAdminCookie },
    });

    const foundByName = res05.json?.data?.some((t) => t.id === freeTenant.id);

    record(
      "TEST 05: Búsqueda por nombre en el directorio de negocios",
      `Encuentra tenant por nombre "Barbería Free Test"`,
      `foundByName: ${foundByName}`,
      res05.status === 200 && foundByName,
      `Coincidencias encontradas: ${res05.json?.data?.length}`
    );

    // --- TEST 06: Búsqueda de negocios por slug ---
    const res06 = await request(`/api/admin/tenants?search=saas-pro-tenant`, {
      headers: { Cookie: superAdminCookie },
    });

    const foundBySlug = res06.json?.data?.some((t) => t.id === proTenant.id);

    record(
      "TEST 06: Búsqueda por slug en el directorio de negocios",
      `Encuentra tenant por slug "saas-pro-tenant"`,
      `foundBySlug: ${foundBySlug}`,
      res06.status === 200 && foundBySlug,
      `Tenant: ${res06.json?.data?.[0]?.name} (${res06.json?.data?.[0]?.slug})`
    );

    // --- TEST 07: Filtro por estado de cuenta (ACTIVE) ---
    const res07 = await request("/api/admin/tenants?status=ACTIVE", {
      headers: { Cookie: superAdminCookie },
    });

    const allActive = res07.json?.data?.every((t) => t.status === "ACTIVE");

    record(
      "TEST 07: Filtro por estado de cuenta (status=ACTIVE)",
      "Todos los registros retornados tienen status ACTIVE",
      `allActive: ${allActive}`,
      res07.status === 200 && allActive,
      `Total activos: ${res07.json?.pagination?.total}`
    );

    // --- TEST 08: Paginación en directorio ---
    const res08_p1 = await request("/api/admin/tenants?page=1&limit=2", {
      headers: { Cookie: superAdminCookie },
    });

    record(
      "TEST 08: Paginación estructurada (page & limit)",
      "limit=2 retorna exactamente hasta 2 registros con pagination object",
      `count: ${res08_p1.json?.data?.length}, totalPages: ${res08_p1.json?.pagination?.totalPages}`,
      res08_p1.status === 200 && res08_p1.json?.data?.length <= 2 && res08_p1.json?.pagination?.totalPages >= 1,
      `Page: ${res08_p1.json?.pagination?.page}, Total: ${res08_p1.json?.pagination?.total}`
    );

    // --- TEST 09: Detalle del negocio (GET /api/admin/tenants/[id]) ---
    const res09 = await request(`/api/admin/tenants/${freeTenant.id}`, {
      headers: { Cookie: superAdminCookie },
    });

    const detailData = res09.json?.data;
    const hasPlanAndCounts =
      detailData?.tenant?.plan === "FREE" &&
      typeof detailData?.counts?.services === "number" &&
      typeof detailData?.counts?.appointments === "number";

    record(
      "TEST 09: Detalle del negocio retorna plan, estado y métricas reales",
      "Plan FREE y objeto counts numéricos presentes",
      `hasPlanAndCounts: ${hasPlanAndCounts}, plan: ${detailData?.tenant?.plan}`,
      res09.status === 200 && hasPlanAndCounts,
      `Tenant: ${detailData?.tenant?.name}, Plan: ${detailData?.tenant?.plan}`
    );

    // --- TEST 10: Autorización SUPERADMIN protegida (401 anon, 403 owner) ---
    const res10_anon = await request("/api/admin/overview");
    const res10_owner = await request("/api/admin/overview", {
      headers: { Cookie: ownerCookie },
    });

    record(
      "TEST 10: Autorización SUPERADMIN estricta en endpoints administrativos",
      "Anon 401 Unauthorized, Owner 403 Forbidden",
      `Anon: ${res10_anon.status}, Owner: ${res10_owner.status}`,
      res10_anon.status === 401 && res10_owner.status === 403,
      `Anon error: ${res10_anon.json?.error}, Owner error: ${res10_owner.json?.error}`
    );

    // --- TEST 11: Aislamiento de datos y privacidad ---
    const res11 = await request("/api/admin/overview", {
      headers: { Cookie: superAdminCookie },
    });
    const overviewStr = JSON.stringify(res11.json);
    const noRawClientPII = !overviewStr.includes("0981999999") && !overviewStr.includes("passwordHash");

    record(
      "TEST 11: Aislamiento de datos y privacidad (sin PII de clientes)",
      "Sin teléfonos ni contraseñas expuestas en overview",
      `noRawClientPII: ${noRawClientPII}`,
      noRawClientPII,
      `Respuestas administrativas agregadas y sanitizadas`
    );

    // --- TEST 12: No inventar modelos de pago ni MRR cuando no existen ---
    const kpis = res01.json?.kpis;
    const noFakeMRR = !("mrr" in (res01.json?.saasOverview || {})) && !("stripeSubscriptionId" in (res01.json?.saasOverview || {}));
    const hasClearVolume = "totalCashVolume" in kpis && "cashMovementsVolumeInPeriod" in kpis;

    record(
      "TEST 12: Veracidad: No inventa suscripciones ni simula MRR inexistente",
      "Sin campos MRR simulados, volúmenes de caja claramente identificados",
      `noFakeMRR: ${noFakeMRR}, hasClearVolume: ${hasClearVolume}`,
      noFakeMRR && hasClearVolume,
      `Planes derivados exclusivamente del campo real 'plan' en PostgreSQL`
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
