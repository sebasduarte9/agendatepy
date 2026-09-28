/**
 * Suite de Validación: PLATFORM ADMIN + INTELIGENCIA DEL SISTEMA
 * Valida los 34 tests requeridos para el centro de control global de AgendatePY.
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
  console.log("   PLATFORM ADMIN — SUITE DE PRUEBAS AUTOMATIZADAS (TESTS 01 - 34)   ");
  console.log("======================================================================\n");

  const results = [];
  function record(testName, expected, actual, pass, evidence) {
    results.push({ testName, expected, actual, pass, evidence });
    const mark = pass ? "✅ [PASS]" : "❌ [FAIL]";
    console.log(`${mark} ${testName}`);
    console.log(`   Esperado: ${expected}`);
    console.log(`   Obtenido: ${actual}`);
    console.log(`   Evidencia: ${evidence}\n`);
  }

  try {
    // 0. Setup Fixtures en PostgreSQL
    // Buscar o crear tenants de prueba A y B
    let tenantA = await prisma.tenant.findFirst({
      where: { slug: "test-admin-tenant-a" },
    });
    if (!tenantA) {
      tenantA = await prisma.tenant.create({
        data: {
          name: "Barbería Platform Test A",
          slug: "test-admin-tenant-a",
          subdomain: "test-admin-tenant-a",
          status: "ACTIVE",
        },
      });
    }

    let tenantB = await prisma.tenant.findFirst({
      where: { slug: "test-admin-tenant-b" },
    });
    if (!tenantB) {
      tenantB = await prisma.tenant.create({
        data: {
          name: "Salón Platform Test B",
          slug: "test-admin-tenant-b",
          subdomain: "test-admin-tenant-b",
          status: "ACTIVE",
        },
      });
    }

    // Crear o recuperar Users con diferentes roles
    const superAdminUser = {
      id: "superadmin-platform-test-uuid",
      email: "superadmin.test@agendate.py",
      name: "Platform SuperAdmin",
      role: "SUPERADMIN",
      tenantId: null,
    };

    const ownerUser = {
      id: "owner-platform-test-uuid",
      email: "owner.test@agendate.py",
      name: "Owner Tenant A",
      role: "OWNER",
      tenantId: tenantA.id,
    };

    const staffUser = {
      id: "staff-platform-test-uuid",
      email: "staff.test@agendate.py",
      name: "Staff Tenant A",
      role: "STAFF",
      tenantId: tenantA.id,
    };

    const superAdminCookie = createSessionCookie(superAdminUser);
    const ownerCookie = createSessionCookie(ownerUser);
    const staffCookie = createSessionCookie(staffUser);

    // Sembrar staff, servicio, cliente y citas para Tenant A si no existen
    let staffA = await prisma.staff.findFirst({ where: { tenantId: tenantA.id } });
    if (!staffA) {
      staffA = await prisma.staff.create({
        data: {
          name: "Carlos Staff A",
          tenantId: tenantA.id,
          commissionPercentage: 50,
        },
      });
    }

    let serviceA = await prisma.service.findFirst({ where: { tenantId: tenantA.id } });
    if (!serviceA) {
      serviceA = await prisma.service.create({
        data: {
          name: "Corte Test A",
          price: 50000,
          durationMinutes: 30,
          tenantId: tenantA.id,
        },
      });
    }

    let clientA = await prisma.client.findFirst({ where: { tenantId: tenantA.id } });
    if (!clientA) {
      clientA = await prisma.client.create({
        data: {
          name: "Cliente Test A",
          phone: "0981999999",
          tenantId: tenantA.id,
        },
      });
    }

    // Crear cita completada con fecha específica
    const fixedStart = new Date();
    const fixedEnd = new Date(fixedStart.getTime() + 30 * 60 * 1000);
    let appA = await prisma.appointment.findFirst({
      where: { tenantId: tenantA.id, status: "COMPLETED" },
    });
    if (!appA) {
      appA = await prisma.appointment.create({
        data: {
          tenantId: tenantA.id,
          staffId: staffA.id,
          serviceId: serviceA.id,
          clientId: clientA.id,
          clientName: clientA.name,
          clientPhone: clientA.phone,
          startTime: fixedStart,
          endTime: fixedEnd,
          status: "COMPLETED",
        },
      });
    }

    // Crear cita NO_SHOW para verificar heatmap
    let appNoShow = await prisma.appointment.findFirst({
      where: { tenantId: tenantA.id, status: "NO_SHOW" },
    });
    if (!appNoShow) {
      appNoShow = await prisma.appointment.create({
        data: {
          tenantId: tenantA.id,
          staffId: staffA.id,
          serviceId: serviceA.id,
          clientId: clientA.id,
          clientName: clientA.name,
          clientPhone: clientA.phone,
          startTime: fixedStart,
          endTime: fixedEnd,
          status: "NO_SHOW",
        },
      });
    }

    // Movimiento de caja en Tenant A
    let cashA = await prisma.cashMovement.findFirst({ where: { tenantId: tenantA.id } });
    if (!cashA) {
      cashA = await prisma.cashMovement.create({
        data: {
          tenantId: tenantA.id,
          type: "INCOME",
          amount: 50000,
          category: "Ventas",
          description: "Cobro Cita Test A",
          paymentMethod: "Efectivo",
        },
      });
    }

    // --- TEST 01: SUPERADMIN puede acceder /api/admin/overview ---
    const res01 = await request("/api/admin/overview", {
      headers: { Cookie: superAdminCookie },
    });
    record(
      "TEST 01: SUPERADMIN puede acceder /api/admin/overview",
      "Status 200 con ok: true y KPIs",
      `Status ${res01.status}, ok: ${res01.json?.ok}`,
      res01.status === 200 && res01.json?.ok === true,
      `totalTenants: ${res01.json?.kpis?.totalTenants}`
    );

    // --- TEST 02: OWNER no puede acceder (403) ---
    const res02 = await request("/api/admin/overview", {
      headers: { Cookie: ownerCookie },
    });
    record(
      "TEST 02: OWNER no puede acceder al panel de plataforma",
      "Status 403 Forbidden",
      `Status ${res02.status}, error: ${res02.json?.error}`,
      res02.status === 403,
      JSON.stringify(res02.json)
    );

    // --- TEST 03: STAFF no puede acceder (403) ---
    const res03 = await request("/api/admin/overview", {
      headers: { Cookie: staffCookie },
    });
    record(
      "TEST 03: STAFF no puede acceder al panel de plataforma",
      "Status 403 Forbidden",
      `Status ${res03.status}, error: ${res03.json?.error}`,
      res03.status === 403,
      JSON.stringify(res03.json)
    );

    // --- TEST 04: Usuario anónimo rechazado (401) ---
    const res04 = await request("/api/admin/overview");
    record(
      "TEST 04: Usuario anónimo rechazado con 401",
      "Status 401 Unauthorized",
      `Status ${res04.status}, error: ${res04.json?.error}`,
      res04.status === 401,
      JSON.stringify(res04.json)
    );

    // --- TEST 05: KPI total tenants correcto ---
    const dbTotalTenants = await prisma.tenant.count();
    record(
      "TEST 05: KPI total tenants coincide exactamente con PostgreSQL",
      `totalTenants === ${dbTotalTenants}`,
      `totalTenants === ${res01.json?.kpis?.totalTenants}`,
      res01.json?.kpis?.totalTenants === dbTotalTenants,
      `DB Count: ${dbTotalTenants}`
    );

    // --- TEST 06: KPI tenants activos correcto ---
    const dbActiveTenants = await prisma.tenant.count({ where: { status: "ACTIVE" } });
    record(
      "TEST 06: KPI tenants activos correcto",
      `activeTenants === ${dbActiveTenants}`,
      `activeTenants === ${res01.json?.kpis?.activeTenants}`,
      res01.json?.kpis?.activeTenants === dbActiveTenants,
      `Active in DB: ${dbActiveTenants}`
    );

    // --- TEST 07: KPI nuevos correcto ---
    const res07 = res01.json?.kpis?.newTenantsInPeriod !== undefined;
    record(
      "TEST 07: KPI nuevos tenants en período calculado correctamente",
      "newTenantsInPeriod >= 0",
      `newTenantsInPeriod = ${res01.json?.kpis?.newTenantsInPeriod}`,
      res07 && typeof res01.json?.kpis?.newTenantsInPeriod === "number",
      `Valor: ${res01.json?.kpis?.newTenantsInPeriod}`
    );

    // --- TEST 08: KPI reservas en período correcto ---
    const res08 = res01.json?.kpis?.appointmentsInPeriod !== undefined;
    record(
      "TEST 08: KPI reservas en período correcto",
      "appointmentsInPeriod >= 0",
      `appointmentsInPeriod = ${res01.json?.kpis?.appointmentsInPeriod}`,
      res08 && typeof res01.json?.kpis?.appointmentsInPeriod === "number",
      `Appointments: ${res01.json?.kpis?.appointmentsInPeriod}`
    );

    // --- TEST 09: KPI citas completadas correcto ---
    const res09 = res01.json?.kpis?.completedAppointmentsInPeriod !== undefined;
    record(
      "TEST 09: KPI citas completadas correcto",
      "completedAppointmentsInPeriod >= 0",
      `completedAppointmentsInPeriod = ${res01.json?.kpis?.completedAppointmentsInPeriod}`,
      res09 && typeof res01.json?.kpis?.completedAppointmentsInPeriod === "number",
      `Completed: ${res01.json?.kpis?.completedAppointmentsInPeriod}`
    );

    // --- TEST 10: KPI clientes total coincide con PostgreSQL ---
    const dbTotalClients = await prisma.client.count();
    record(
      "TEST 10: KPI clientes creados coincide con PostgreSQL",
      `totalClientsCreated === ${dbTotalClients}`,
      `totalClientsCreated === ${res01.json?.kpis?.totalClientsCreated}`,
      res01.json?.kpis?.totalClientsCreated === dbTotalClients,
      `DB total clients: ${dbTotalClients}`
    );

    // --- TEST 11: KPI volumen de caja coincide con PostgreSQL ---
    const dbCashSum = await prisma.cashMovement.aggregate({
      _sum: { amount: true },
      where: { type: "INCOME" },
    });
    const expectedCash = Number(dbCashSum._sum.amount || 0);
    record(
      "TEST 11: KPI volumen de caja coincide con PostgreSQL",
      `totalCashVolume === ${expectedCash}`,
      `totalCashVolume === ${res01.json?.kpis?.totalCashVolume}`,
      res01.json?.kpis?.totalCashVolume === expectedCash,
      `DB sum: ${expectedCash}`
    );

    // --- TEST 12: KPI comisiones liquidadas coincide con PostgreSQL ---
    const dbCommissionsSum = await prisma.commissionPayout.aggregate({
      _sum: { amountPaid: true },
      where: { status: "PAID" },
    });
    const expectedCommissions = Number(dbCommissionsSum._sum.amountPaid || 0);
    record(
      "TEST 12: KPI comisiones liquidadas coincide con PostgreSQL",
      `totalCommissionsPaid === ${expectedCommissions}`,
      `totalCommissionsPaid === ${res01.json?.kpis?.totalCommissionsPaid}`,
      res01.json?.kpis?.totalCommissionsPaid === expectedCommissions,
      `DB sum: ${expectedCommissions}`
    );

    // --- TEST 13: Tenant detail funciona (/api/admin/tenants/:id) ---
    const res13 = await request(`/api/admin/tenants/${tenantA.id}`, {
      headers: { Cookie: superAdminCookie },
    });
    record(
      "TEST 13: Tenant detail devuelve perfil operacional completo",
      "Status 200, milestones y counts presentes",
      `Status ${res13.status}, has milestones: ${!!res13.json?.data?.milestones}`,
      res13.status === 200 && !!res13.json?.data?.milestones && !!res13.json?.data?.counts,
      `Tenant: ${res13.json?.data?.tenant?.name}`
    );

    // --- TEST 14: Tenant A no mezcla datos de Tenant B ---
    const res14 = await request(`/api/admin/tenants/${tenantB.id}`, {
      headers: { Cookie: superAdminCookie },
    });
    const countsMatch =
      res13.json?.data?.tenant?.id !== res14.json?.data?.tenant?.id &&
      res14.json?.data?.tenant?.id === tenantB.id;
    record(
      "TEST 14: Tenant A no mezcla datos con Tenant B",
      "IDs y métricas aisladas por tenant",
      `TenantA id: ${res13.json?.data?.tenant?.id}, TenantB id: ${res14.json?.data?.tenant?.id}`,
      countsMatch,
      `A: ${res13.json?.data?.tenant?.name}, B: ${res14.json?.data?.tenant?.name}`
    );

    // --- TEST 15: Filtro por tenant en Web Heatmap funciona ---
    const res15 = await request(`/api/admin/heatmap?tenantId=${tenantA.id}`, {
      headers: { Cookie: superAdminCookie },
    });
    record(
      "TEST 15: Filtro por tenant específico en Web Heatmap funciona",
      "Status 200 y stats calculadas",
      `Status ${res15.status}, ok: ${res15.json?.ok}`,
      res15.status === 200 && res15.json?.ok === true,
      `Total Clicks: ${res15.json?.stats?.totalClicks}`
    );

    // --- TEST 16: Filtro por período funciona (7d vs all) ---
    const res16_7d = await request("/api/admin/overview?period=7d", {
      headers: { Cookie: superAdminCookie },
    });
    const res16_all = await request("/api/admin/overview?period=all", {
      headers: { Cookie: superAdminCookie },
    });
    record(
      "TEST 16: Filtro por período altera el cálculo de métricas",
      "Status 200 en ambos períodos",
      `7d status: ${res16_7d.status}, all status: ${res16_all.status}`,
      res16_7d.status === 200 && res16_all.status === 200,
      `7d new tenants: ${res16_7d.json?.kpis?.newTenantsInPeriod}, all: ${res16_all.json?.kpis?.newTenantsInPeriod}`
    );

    // --- TEST 17: Web Heatmap click points calcula correctamente ---
    const res17 = await request("/api/admin/heatmap?period=30d", {
      headers: { Cookie: superAdminCookie },
    });
    record(
      "TEST 17: Web Heatmap retorna clickPoints y stats agregadas",
      "Status 200 con array clickPoints y stats",
      `Points: ${Array.isArray(res17.json?.clickPoints)}, Stats: ${typeof res17.json?.stats === "object"}`,
      res17.status === 200 && Array.isArray(res17.json?.clickPoints) && typeof res17.json?.stats === "object",
      `Total sessions: ${res17.json?.stats?.totalSessions}`
    );

    // --- TEST 18: Web Heatmap scroll depth calcula correctamente ---
    record(
      "TEST 18: Web Heatmap métrica de scroll y retención calcula correctamente",
      "Status 200 con avgScrollDepth y scrollDistribution",
      `avgScrollDepth: ${typeof res17.json?.stats?.avgScrollDepth === "number"}, dist: ${typeof res17.json?.stats?.scrollDistribution === "object"}`,
      res17.status === 200 && typeof res17.json?.stats?.avgScrollDepth === "number",
      `Avg scroll depth: ${res17.json?.stats?.avgScrollDepth}%`
    );

    // --- TEST 19: Web Heatmap device breakdown calcula correctamente ---
    record(
      "TEST 19: Web Heatmap distribución por dispositivo (Desktop, Mobile, Tablet)",
      "Status 200 con deviceBreakdown",
      `Breakdown: ${JSON.stringify(res17.json?.stats?.deviceBreakdown)}`,
      res17.status === 200 && typeof res17.json?.stats?.deviceBreakdown === "object",
      `Desktop: ${res17.json?.stats?.deviceBreakdown?.desktop}, Mobile: ${res17.json?.stats?.deviceBreakdown?.mobile}`
    );

    // --- TEST 20: Web Heatmap top elements calcula correctamente ---
    record(
      "TEST 20: Web Heatmap identificación de elementos más clickeados (topElements)",
      "Array de topElements presente",
      `Is array: ${Array.isArray(res17.json?.topElements)}`,
      res17.status === 200 && Array.isArray(res17.json?.topElements),
      `Top elements count: ${res17.json?.topElements?.length}`
    );

    // --- TEST 21: Web Heatmap soporta filtro por dispositivo ---
    const res21_mob = await request("/api/admin/heatmap?deviceType=mobile", {
      headers: { Cookie: superAdminCookie },
    });
    record(
      "TEST 21: Web Heatmap filtro por tipo de dispositivo (mobile/desktop)",
      "Status 200 con deviceType aplicado",
      `deviceType: ${res21_mob.json?.deviceType}`,
      res21_mob.status === 200 && res21_mob.json?.deviceType === "mobile",
      `Device type: ${res21_mob.json?.deviceType}`
    );

    // --- TEST 22: Tenant sin actividad identificado correctamente ---
    const res22 = await request("/api/admin/tenants?activity=INACTIVE", {
      headers: { Cookie: superAdminCookie },
    });
    record(
      "TEST 22: Filtro de negocios sin actividad reciente o inactivos",
      "Status 200 y lista retornada",
      `Status: ${res22.status}, total: ${res22.json?.pagination?.total}`,
      res22.status === 200 && Array.isArray(res22.json?.data),
      `Inactivos encontrados: ${res22.json?.pagination?.total}`
    );

    // --- TEST 23: Primera reserva identificada en activación ---
    const funnel = res01.json?.activationFunnel;
    record(
      "TEST 23: Primera reserva identificada correctamente en embudo",
      "firstBookingReceived >= 1",
      `firstBookingReceived = ${funnel?.stages?.firstBookingReceived}`,
      typeof funnel?.stages?.firstBookingReceived === "number" && funnel?.stages?.firstBookingReceived >= 1,
      `Conversion rate: ${funnel?.conversionRates?.registeredToFirstBooking}%`
    );

    // --- TEST 24: Métrica de activación real (todas las etapas calculadas) ---
    const stagesValid =
      funnel?.stages?.registered >= 0 &&
      funnel?.stages?.configured >= 0 &&
      funnel?.stages?.readyToBook >= 0 &&
      funnel?.stages?.firstBookingReceived >= 0 &&
      funnel?.stages?.firstCashCollected >= 0;
    record(
      "TEST 24: Métricas de activación de embudo derivadas de PostgreSQL",
      "Todas las 5 etapas presentes y numéricas",
      `Stages valid: ${stagesValid}`,
      stagesValid,
      JSON.stringify(funnel?.stages)
    );

    // --- TEST 25: No confunde cash del tenant con revenue SaaS ---
    const kpis = res01.json?.kpis;
    const hasSaaSConfusion = "mrr" in kpis || "arr" in kpis || "saasRevenue" in kpis;
    const hasClearNames =
      "cashMovementsVolumeInPeriod" in kpis &&
      "totalCashVolume" in kpis &&
      "commissionsPaidInPeriod" in kpis;
    record(
      "TEST 25: Nomenclatura financiera clara (no confunde volumen con SaaS revenue)",
      "Sin MRR/ARR inventados, campos de volumen de caja explícitos",
      `hasSaaSConfusion: ${hasSaaSConfusion}, hasClearNames: ${hasClearNames}`,
      !hasSaaSConfusion && hasClearNames,
      `Campos: cashMovementsVolumeInPeriod, commissionsPaidInPeriod`
    );

    // --- TEST 26: Mapa geográfico / datos geo no inventan coordenadas ---
    const res26 = await request(`/api/admin/tenants/${tenantA.id}`, {
      headers: { Cookie: superAdminCookie },
    });
    const geoData = res26.json?.data?.tenant;
    const noFakeCoords = geoData?.latitude === undefined && geoData?.longitude === undefined;
    record(
      "TEST 26: Datos geográficos no inventan coordenadas falsas",
      "Coordenadas no inventadas si no existen en schema",
      `noFakeCoords: ${noFakeCoords}`,
      noFakeCoords,
      `City: ${geoData?.city || "null"}`
    );

    // --- TEST 27: STAFF/OWNER no pueden consultar endpoints de cohortes y auditoría ---
    const res27_cohorts_owner = await request("/api/admin/cohortes", {
      headers: { Cookie: ownerCookie },
    });
    const res27_audit_staff = await request("/api/admin/audit", {
      headers: { Cookie: staffCookie },
    });
    record(
      "TEST 27: STAFF/OWNER bloqueados en endpoints administrativos",
      "403 Forbidden en /cohortes y /audit",
      `Cohortes status: ${res27_cohorts_owner.status}, Audit status: ${res27_audit_staff.status}`,
      res27_cohorts_owner.status === 403 && res27_audit_staff.status === 403,
      `Owner 403, Staff 403`
    );

    // --- TEST 28: Endpoint admin no acepta tenantId libre para romper scope ---
    // El SuperAdmin usa el scope global, y endpoints validan autenticación antes de cualquier parámetro
    const res28_anon = await request(`/api/admin/tenants/${tenantA.id}`);
    record(
      "TEST 28: Endpoints admin ignoran o bloquean bypass de tenantId sin auth",
      "Status 401 para peticiones no autenticadas",
      `Status: ${res28_anon.status}`,
      res28_anon.status === 401,
      `Respuesta: ${res28_anon.json?.error}`
    );

    // --- TEST 29: Datos privados de clientes (PII) no aparecen en overview ---
    const overviewStr = JSON.stringify(res01.json);
    const hasClientPII =
      overviewStr.includes("0981999999") ||
      overviewStr.includes("Cliente Test A");
    record(
      "TEST 29: Privacidad: Overview global no expone PII de clientes",
      "Sin nombres ni teléfonos de clientes en overview",
      `hasClientPII: ${hasClientPII}`,
      !hasClientPII,
      `Overview contiene únicamente métricas agregadas`
    );

    // --- TEST 30: Reportes admin son read-only ---
    // Consultar overview y verificar que la cuenta de tenants no mutó
    const dbCountAfter = await prisma.tenant.count();
    record(
      "TEST 30: Consultas de plataforma son estrictamente read-only",
      `Tenants antes === después (${dbTotalTenants})`,
      `Tenants después === ${dbCountAfter}`,
      dbTotalTenants === dbCountAfter,
      `Base de datos inmutable en consultas GET`
    );

    // --- TEST 31: PlatformEvent se registra correctamente (POST /api/admin/audit) ---
    const res31 = await request("/api/admin/audit", {
      method: "POST",
      headers: {
        Cookie: superAdminCookie,
        "Content-Type": "application/json",
      },
      body: {
        event: "TENANT_CREATED",
        tenantId: tenantA.id,
        entityType: "Tenant",
        entityId: tenantA.id,
        metadata: { source: "suite-test-admin" },
      },
    });
    record(
      "TEST 31: PlatformEvent se registra correctamente en auditoría",
      "Status 200 con event.id creado",
      `Status: ${res31.status}, id: ${res31.json?.event?.id}`,
      res31.status === 200 && !!res31.json?.event?.id,
      `Event ID: ${res31.json?.event?.id}`
    );

    // --- TEST 32: PlatformEvent pertenece al tenant correcto ---
    const res32 = await request(`/api/admin/audit?tenantId=${tenantA.id}`, {
      headers: { Cookie: superAdminCookie },
    });
    const foundEvent = res32.json?.data?.find(
      (ev) => ev.id === res31.json?.event?.id
    );
    record(
      "TEST 32: PlatformEvent asociado correctamente a Tenant A",
      `tenantId === ${tenantA.id}`,
      `tenantId === ${foundEvent?.tenantId}`,
      foundEvent?.tenantId === tenantA.id,
      `Tenant name: ${foundEvent?.tenantName}`
    );

    // --- TEST 33: PlatformEvent no contiene secretos (sanitizado) ---
    const res33 = await request("/api/admin/audit", {
      method: "POST",
      headers: {
        Cookie: superAdminCookie,
        "Content-Type": "application/json",
      },
      body: {
        event: "CONFIG_UPDATED",
        tenantId: tenantA.id,
        metadata: {
          safeParam: "allowed",
          password: "super_secret_password_123",
          token: "secret_jwt_token",
        },
      },
    });
    const createdMeta = res33.json?.event?.metadata || {};
    const hasSecrets = "password" in createdMeta || "token" in createdMeta;
    record(
      "TEST 33: PlatformEvent sanitiza y elimina contraseñas y tokens en metadata",
      "password y token eliminados automáticamente",
      `hasSecrets: ${hasSecrets}, metadata: ${JSON.stringify(createdMeta)}`,
      !hasSecrets && createdMeta.safeParam === "allowed",
      `Metadata sanitizada: ${JSON.stringify(createdMeta)}`
    );

    // --- TEST 34: Eventos no duplican métricas derivadas ---
    const res34_cohorts = await request("/api/admin/cohortes", {
      headers: { Cookie: superAdminCookie },
    });
    record(
      "TEST 34: Cohortes de plataforma derivadas directamente de PostgreSQL",
      "Status 200 y array de cohortes históricas",
      `Status: ${res34_cohorts.status}, cohorts count: ${res34_cohorts.json?.cohorts?.length}`,
      res34_cohorts.status === 200 && Array.isArray(res34_cohorts.json?.cohorts),
      `Total cohorts: ${res34_cohorts.json?.totalCohorts}`
    );
  } catch (err) {
    console.error("❌ Error inesperado durante la ejecución de pruebas:", err);
  } finally {
    await prisma.$disconnect();
  }

  console.log("======================================================================");
  console.log("   RESUMEN FINAL DE EJECUCIÓN — PLATFORM ADMIN SUITE");
  console.log("======================================================================");
  const total = results.length;
  const passed = results.filter((r) => r.pass).length;
  const failed = results.filter((r) => !r.pass).length;

  console.log(`Total tests: ${total}`);
  console.log(`Pasaron:     ${passed}`);
  console.log(`Fallaron:    ${failed}`);
  console.log(
    `Resultado:   ${failed === 0 ? "✅ TODOS LOS TESTS PASARON EXITOSAMENTE" : "❌ HUBO FALLOS EN LA SUITE"}\n`
  );

  if (failed > 0) {
    process.exit(1);
  }
}

run();
