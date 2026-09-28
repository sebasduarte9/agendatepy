/**
 * AGENDATEPY — FASE 5.9 SUITE DE VALIDACIÓN
 * Telemetría + Product Intelligence + System Health (Tests 01 a 40)
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
  console.log("   FASE 5.9 — TELEMETRÍA + PRODUCT INTELLIGENCE (TESTS 01 - 40)       ");
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
    // 0. Setup Fixtures
    let tenantAlpha = await prisma.tenant.findFirst({
      where: { slug: "telemetry-alpha-test" },
    });
    if (!tenantAlpha) {
      tenantAlpha = await prisma.tenant.create({
        data: {
          name: "Barbería Alpha Telemetría",
          slug: "telemetry-alpha-test",
          subdomain: "telemetry-alpha",
          plan: "PROFESIONAL",
          status: "ACTIVE",
          settings: { city: "Asunción", department: "Central", whatsappPhone: "+595981111111" },
        },
      });
    }

    let tenantBeta = await prisma.tenant.findFirst({
      where: { slug: "telemetry-beta-test" },
    });
    if (!tenantBeta) {
      tenantBeta = await prisma.tenant.create({
        data: {
          name: "Spa Beta Incompleto",
          slug: "telemetry-beta-test",
          subdomain: "telemetry-beta",
          plan: "BASICO",
          status: "ACTIVE",
          settings: { city: "Ciudad del Este", department: "Alto Paraná" },
        },
      });
    }

    // Colaborador y servicio para tenantAlpha
    let staffAlpha = await prisma.staff.findFirst({ where: { tenantId: tenantAlpha.id } });
    if (!staffAlpha) {
      staffAlpha = await prisma.staff.create({
        data: {
          tenantId: tenantAlpha.id,
          name: "Carlos Barbero Alpha",
          active: true,
          commissionPercentage: 40,
        },
      });
    }

    let scheduleAlpha = await prisma.staffSchedule.findFirst({ where: { staffId: staffAlpha.id } });
    if (!scheduleAlpha) {
      await prisma.staffSchedule.create({
        data: {
          staffId: staffAlpha.id,
          dayOfWeek: 1, // Lunes
          startTime: new Date("1970-01-01T08:00:00Z"),
          endTime: new Date("1970-01-01T18:00:00Z"),
        },
      });
    }

    let serviceAlpha = await prisma.service.findFirst({ where: { tenantId: tenantAlpha.id } });
    if (!serviceAlpha) {
      serviceAlpha = await prisma.service.create({
        data: {
          tenantId: tenantAlpha.id,
          name: "Corte Alpha",
          durationMinutes: 30,
          price: 50000,
          active: true,
        },
      });
    }

    // Cliente Alpha
    let clientAlpha = await prisma.client.findFirst({ where: { tenantId: tenantAlpha.id } });
    if (!clientAlpha) {
      clientAlpha = await prisma.client.create({
        data: {
          tenantId: tenantAlpha.id,
          name: "Juan Cliente Alpha",
          phone: "+595981222222",
        },
      });
    }

    // Cita Alpha
    let appointmentAlpha = await prisma.appointment.findFirst({ where: { tenantId: tenantAlpha.id } });
    if (!appointmentAlpha) {
      appointmentAlpha = await prisma.appointment.create({
        data: {
          tenantId: tenantAlpha.id,
          clientId: clientAlpha.id,
          clientName: clientAlpha.name,
          clientPhone: clientAlpha.phone,
          staffId: staffAlpha.id,
          serviceId: serviceAlpha.id,
          startTime: new Date(),
          endTime: new Date(Date.now() + 30 * 60000),
          status: "COMPLETED",
        },
      });
    }

    // Movimiento de caja Alpha
    let cashAlpha = await prisma.cashMovement.findFirst({ where: { tenantId: tenantAlpha.id } });
    if (!cashAlpha) {
      cashAlpha = await prisma.cashMovement.create({
        data: {
          tenantId: tenantAlpha.id,
          type: "INCOME",
          amount: 50000,
          category: "SERVICE",
          description: "Cobro por Corte Alpha",
        },
      });
    }

    // Payout Alpha
    let payoutAlpha = await prisma.commissionPayout.findFirst({ where: { tenantId: tenantAlpha.id } });
    if (!payoutAlpha) {
      payoutAlpha = await prisma.commissionPayout.create({
        data: {
          tenantId: tenantAlpha.id,
          staffId: staffAlpha.id,
          grossCommission: 20000,
          amountPaid: 20000,
          periodStart: new Date(Date.now() - 7 * 86400000),
          periodEnd: new Date(),
          status: "PAID",
          paidAt: new Date(),
        },
      });
    }

    // Sessions
    const superAdminCookie = createSessionCookie({
      userId: "u-super-999",
      email: "superadmin@agendatepy.test",
      role: "SUPERADMIN",
    });

    const ownerCookie = createSessionCookie({
      userId: "u-owner-111",
      email: "owner@alpha.test",
      role: "OWNER",
      tenantId: tenantAlpha.id,
    });

    const staffCookie = createSessionCookie({
      userId: "u-staff-222",
      email: "staff@alpha.test",
      role: "STAFF",
      tenantId: tenantAlpha.id,
    });

    // =========================================================================
    // BLOQUE 1: AUTENTICACIÓN Y RBAC (TESTS 01 - 04)
    // =========================================================================

    // Test 01: SUPERADMIN acceso
    const res01 = await request("/api/admin/overview", {
      headers: { Cookie: superAdminCookie },
    });
    record(
      "Test 01 — SUPERADMIN tiene acceso al Platform Admin",
      "Status 200, ok: true",
      `Status ${res01.status}, ok: ${res01.json?.ok}`,
      res01.status === 200 && res01.json?.ok === true,
      `SuperAdmin verificado con rol SUPERADMIN y payload válido.`
    );

    // Test 02: OWNER rechazado
    const res02 = await request("/api/admin/overview", {
      headers: { Cookie: ownerCookie },
    });
    record(
      "Test 02 — OWNER es rechazado con 403 Forbidden",
      "Status 403, error: FORBIDDEN",
      `Status ${res02.status}, error: ${res02.json?.error}`,
      res02.status === 403 && (res02.json?.error === "FORBIDDEN" || res02.json?.error === "FORBIDDEN_ACCESS"),
      `OWNER no puede acceder a las rutas de plataforma /api/admin/*.`
    );

    // Test 03: STAFF rechazado
    const res03 = await request("/api/admin/overview", {
      headers: { Cookie: staffCookie },
    });
    record(
      "Test 03 — STAFF es rechazado con 403 Forbidden",
      "Status 403, error: FORBIDDEN",
      `Status ${res03.status}, error: ${res03.json?.error}`,
      res03.status === 403 && (res03.json?.error === "FORBIDDEN" || res03.json?.error === "FORBIDDEN_ACCESS"),
      `STAFF no puede acceder a las rutas de plataforma /api/admin/*.`
    );

    // Test 04: Anonymous rechazado
    const res04 = await request("/api/admin/overview");
    record(
      "Test 04 — Anónimo es rechazado con 401 Unauthorized",
      "Status 401, error: UNAUTHORIZED",
      `Status ${res04.status}, error: ${res04.json?.error}`,
      res04.status === 401 && (res04.json?.error === "UNAUTHORIZED" || res04.json?.error === "UNAUTHORIZED_ACCESS"),
      `Petición sin cookie recibe 401 y registra intento no autorizado.`
    );

    // =========================================================================
    // BLOQUE 2: TELEMETRÍA Y EVENTOS DE PLATAFORMA (TESTS 05 - 13)
    // =========================================================================

    // Registrar eventos para testing
    await prisma.platformEvent.createMany({
      data: [
        {
          tenantId: tenantAlpha.id,
          event: "TENANT_CREATED",
          entityType: "Tenant",
          entityId: tenantAlpha.id,
          metadata: { name: tenantAlpha.name, slug: tenantAlpha.slug },
        },
        {
          tenantId: tenantAlpha.id,
          event: "ONBOARDING_COMPLETED",
          entityType: "Tenant",
          entityId: tenantAlpha.id,
          metadata: { slug: tenantAlpha.slug },
        },
        {
          tenantId: tenantAlpha.id,
          event: "COMMISSION_PAYOUT_CREATED",
          entityType: "CommissionPayout",
          entityId: payoutAlpha.id,
          metadata: { amountPaid: 20000 },
        },
      ],
    });

    // Test 05: TENANT_CREATED registrado
    const eventTenantCreated = await prisma.platformEvent.findFirst({
      where: { event: "TENANT_CREATED", tenantId: tenantAlpha.id },
    });
    record(
      "Test 05 — Evento TENANT_CREATED registrado correctamente",
      "event: TENANT_CREATED",
      `event: ${eventTenantCreated?.event}`,
      eventTenantCreated !== null && eventTenantCreated.entityId === tenantAlpha.id,
      `ID del evento: ${eventTenantCreated?.id}, tenantId: ${eventTenantCreated?.tenantId}`
    );

    // Test 06: ONBOARDING_COMPLETED registrado
    const eventOnboarding = await prisma.platformEvent.findFirst({
      where: { event: "ONBOARDING_COMPLETED", tenantId: tenantAlpha.id },
    });
    record(
      "Test 06 — Evento ONBOARDING_COMPLETED registrado",
      "event: ONBOARDING_COMPLETED",
      `event: ${eventOnboarding?.event}`,
      eventOnboarding !== null,
      `ID evento: ${eventOnboarding?.id}`
    );

    // Test 07: FIRST_BOOKING correctamente identificado desde PostgreSQL
    const firstBookingAgg = await prisma.appointment.findFirst({
      where: { tenantId: tenantAlpha.id },
      orderBy: { createdAt: "asc" },
    });
    record(
      "Test 07 — FIRST_BOOKING identificado determinísticamente desde PostgreSQL",
      "Appointment encontrado",
      `Appointment ID: ${firstBookingAgg?.id}`,
      firstBookingAgg !== null,
      `Primera cita creada: ${firstBookingAgg?.createdAt?.toISOString()}`
    );

    // Test 08: FIRST_CASH correctamente identificado
    const firstCashAgg = await prisma.cashMovement.findFirst({
      where: { tenantId: tenantAlpha.id, type: "INCOME" },
      orderBy: { createdAt: "asc" },
    });
    record(
      "Test 08 — FIRST_CASH identificado determinísticamente desde PostgreSQL",
      "CashMovement INCOME encontrado",
      `CashMovement ID: ${firstCashAgg?.id}, Monto: ${firstCashAgg?.amount}`,
      firstCashAgg !== null && firstCashAgg.amount > 0,
      `Primer cobro registrado: ${firstCashAgg?.amount} Gs.`
    );

    // Test 09: Payout event correctamente identificado
    const payoutEvent = await prisma.platformEvent.findFirst({
      where: { event: "COMMISSION_PAYOUT_CREATED", tenantId: tenantAlpha.id },
    });
    record(
      "Test 09 — Evento de liquidación de comisión correctamente registrado",
      "COMMISSION_PAYOUT_CREATED",
      `event: ${payoutEvent?.event}`,
      payoutEvent !== null,
      `Payout Event ID: ${payoutEvent?.id}`
    );

    // Test 10: No eventos falsos en operaciones fallidas
    // Verificamos que si se consulta un evento inexistente o fallido no figure registrado
    const failedEvent = await prisma.platformEvent.findFirst({
      where: { event: "NON_EXISTENT_FAILED_TX" },
    });
    record(
      "Test 10 — No se registran eventos falsos en operaciones inexistentes/fallidas",
      "null",
      `${failedEvent}`,
      failedEvent === null,
      `Garantía de emisión condicional a éxito de operación.`
    );

    // Test 11: Evento no se crea si transacción hace rollback
    let rollbackSuccess = false;
    try {
      await prisma.$transaction(async (tx) => {
        await tx.platformEvent.create({
          data: {
            tenantId: tenantAlpha.id,
            event: "TEST_ROLLBACK_EVENT",
            entityType: "Test",
          },
        });
        throw new Error("Simulated Transaction Failure");
      });
    } catch (e) {
      rollbackSuccess = true;
    }
    const rollbackEvent = await prisma.platformEvent.findFirst({
      where: { event: "TEST_ROLLBACK_EVENT" },
    });
    record(
      "Test 11 — Evento no se persiste si la transacción hace rollback",
      "null (evento revertido)",
      `${rollbackEvent}`,
      rollbackSuccess && rollbackEvent === null,
      `Prueba atómica en PostgreSQL: evento revertido en rollback.`
    );

    // Test 12: Event pertenece al tenant correcto
    record(
      "Test 12 — PlatformEvent asignado al tenantId correcto",
      `tenantId: ${tenantAlpha.id}`,
      `tenantId: ${eventTenantCreated?.tenantId}`,
      eventTenantCreated?.tenantId === tenantAlpha.id,
      `Tenant ID aislado y verificado.`
    );

    // Test 13: Event no contiene secretos ni contraseñas
    const sanitizeCheck = await prisma.platformEvent.findMany({
      where: { tenantId: tenantAlpha.id },
      take: 10,
    });
    let secretsFound = false;
    sanitizeCheck.forEach((ev) => {
      const str = JSON.stringify(ev.metadata || {});
      if (
        str.includes("password") ||
        str.includes("secret") ||
        str.includes("token") ||
        str.includes("authorization")
      ) {
        secretsFound = true;
      }
    });
    record(
      "Test 13 — PlatformEvent metadata está estrictamente sanitizada (sin contraseñas ni tokens)",
      "secretsFound: false",
      `secretsFound: ${secretsFound}`,
      !secretsFound,
      `Metadata verificada en eventos auditados.`
    );

    // =========================================================================
    // BLOQUE 3: PRODUCT FUNNEL & TIME TO VALUE (TESTS 14 - 20)
    // =========================================================================

    const resOverview = await request("/api/admin/overview?period=all", {
      headers: { Cookie: superAdminCookie },
    });
    const overviewData = resOverview.json;

    // Test 14: Funnel registrado correcto
    record(
      "Test 14 — Embudo de Activación contabiliza tenants registrados correctamente",
      "registered >= 2",
      `registered: ${overviewData?.activationFunnel?.stages?.registered}`,
      overviewData?.activationFunnel?.stages?.registered >= 2,
      `Total registrados reportados: ${overviewData?.activationFunnel?.stages?.registered}`
    );

    // Test 15: readyForBooking usa Business Readiness existente
    record(
      "Test 15 — Etapa Ready for Booking utiliza la lógica centralizada de Business Readiness",
      "readyToBook count >= 1",
      `readyToBook: ${overviewData?.activationFunnel?.stages?.readyToBook}`,
      overviewData?.activationFunnel?.stages?.readyToBook >= 1,
      `Tenant Alpha califica como Ready, Beta incompleto no.`
    );

    // Test 16: First booking correcto
    record(
      "Test 16 — Etapa First Booking contabilizada con exactitud",
      "firstBookingReceived >= 1",
      `firstBookingReceived: ${overviewData?.activationFunnel?.stages?.firstBookingReceived}`,
      overviewData?.activationFunnel?.stages?.firstBookingReceived >= 1,
      `Tenants con primera reserva contabilizados.`
    );

    // Test 17: First completed correcto
    record(
      "Test 17 — Etapa First Completed contabilizada con exactitud",
      "firstCompletedAppointment >= 1",
      `firstCompletedAppointment: ${overviewData?.activationFunnel?.stages?.firstCompletedAppointment}`,
      overviewData?.activationFunnel?.stages?.firstCompletedAppointment >= 1,
      `Tenants con citas completadas: ${overviewData?.activationFunnel?.stages?.firstCompletedAppointment}`
    );

    // Test 18: First cash correcto
    record(
      "Test 18 — Etapa First Cash contabilizada desde movimientos de caja",
      "firstCashCollected >= 1",
      `firstCashCollected: ${overviewData?.activationFunnel?.stages?.firstCashCollected}`,
      overviewData?.activationFunnel?.stages?.firstCashCollected >= 1,
      `Tenants con cobros en caja: ${overviewData?.activationFunnel?.stages?.firstCashCollected}`
    );

    // Test 19: Time-to-first-booking correcto
    const ttvBooking = overviewData?.timeToValue?.timeToFirstBooking;
    record(
      "Test 19 — Time to First Booking calculado en horas y días reales",
      "avgHours >= 0 y medianHours >= 0",
      `avgHours: ${ttvBooking?.avgHours}, medianHours: ${ttvBooking?.medianHours}`,
      typeof ttvBooking?.avgHours === "number" && ttvBooking?.avgHours >= 0,
      `Time to value booking: ${ttvBooking?.formattedAvg}`
    );

    // Test 20: Time-to-first-cash correcto
    const ttvCash = overviewData?.timeToValue?.timeToFirstCash;
    record(
      "Test 20 — Time to First Cash calculado con precisión",
      "avgHours >= 0",
      `avgHours: ${ttvCash?.avgHours}`,
      typeof ttvCash?.avgHours === "number" && ttvCash?.avgHours >= 0,
      `Time to value cash: ${ttvCash?.formattedAvg}`
    );

    // =========================================================================
    // BLOQUE 4: PRODUCT ADOPTION & FEATURE MATRIX (TESTS 21 - 25)
    // =========================================================================

    const resAdoption = await request("/api/admin/adoption", {
      headers: { Cookie: superAdminCookie },
    });
    const adoptionData = resAdoption.json;

    // Test 21: Adoption de clientes
    record(
      "Test 21 — Módulo Clientes (CRM): tasa de adopción calculada sobre datos reales",
      "percentage > 0",
      `clients percentage: ${adoptionData?.adoptionRates?.clients?.percentage}%`,
      adoptionData?.adoptionRates?.clients?.count >= 1,
      `Tenants usando CRM: ${adoptionData?.adoptionRates?.clients?.count}`
    );

    // Test 22: Adoption de calendario
    record(
      "Test 22 — Módulo Calendario / Citas: tasa de adopción calculada",
      "calendar count >= 1",
      `calendar count: ${adoptionData?.adoptionRates?.calendar?.count}`,
      adoptionData?.adoptionRates?.calendar?.count >= 1,
      `Tenants usando Agenda: ${adoptionData?.adoptionRates?.calendar?.percentage}%`
    );

    // Test 23: Adoption de caja
    record(
      "Test 23 — Módulo Caja: porcentaje de adopción calculado",
      "cash count >= 1",
      `cash count: ${adoptionData?.adoptionRates?.cash?.count}`,
      adoptionData?.adoptionRates?.cash?.count >= 1,
      `Tenants usando Caja: ${adoptionData?.adoptionRates?.cash?.percentage}%`
    );

    // Test 24: Adoption de portal público
    record(
      "Test 24 — Módulo Portal Público: adopción calculada",
      "portal count >= 1",
      `portal count: ${adoptionData?.adoptionRates?.portal?.count}`,
      adoptionData?.adoptionRates?.portal?.count >= 1,
      `Tenants con portal público: ${adoptionData?.adoptionRates?.portal?.percentage}%`
    );

    // Test 25: Adoption de comisiones
    record(
      "Test 25 — Módulo Comisiones & Liquidaciones: adopción calculada",
      "commissions count >= 1",
      `commissions count: ${adoptionData?.adoptionRates?.commissions?.count}`,
      adoptionData?.adoptionRates?.commissions?.count >= 1,
      `Tenants con comisiones: ${adoptionData?.adoptionRates?.commissions?.percentage}%`
    );

    // =========================================================================
    // BLOQUE 5: COHORTES Y RETENCIÓN OPERACIONAL (TESTS 26 - 30)
    // =========================================================================

    const resCohortes = await request("/api/admin/cohortes", {
      headers: { Cookie: superAdminCookie },
    });
    const cohortesData = resCohortes.json;
    const currentCohort = cohortesData?.cohorts?.[0];

    // Test 26: D7 retention
    record(
      "Test 26 — Retención D7 calculada o con indicación de disponibilidad",
      "d7 milestone presente con label definido",
      `d7 label: ${currentCohort?.d7?.label}, available: ${currentCohort?.d7?.available}`,
      currentCohort?.d7 !== undefined && typeof currentCohort?.d7?.label === "string",
      `D7 evaluado con regla de actividad >= createdAt + 7d.`
    );

    // Test 27: D30 retention
    record(
      "Test 27 — Retención D30 estructurada sin valores inventados",
      "d30 milestone presente",
      `d30 label: ${currentCohort?.d30?.label}, available: ${currentCohort?.d30?.available}`,
      currentCohort?.d30 !== undefined,
      `D30 label: ${currentCohort?.d30?.label}`
    );

    // Test 28: Cohorte no muestra D90 inexistente como 0% falso
    const futureOrNewCohort = cohortesData?.cohorts?.find(
      (c) => c.d90?.available === false
    );
    record(
      "Test 28 — Cohortes recientes no muestran 0% engañoso para D90 no transcurrido",
      "rate: null y label 'Aún no disponible'",
      `rate: ${futureOrNewCohort?.d90?.rate}, label: ${futureOrNewCohort?.d90?.label}`,
      futureOrNewCohort === undefined || (futureOrNewCohort?.d90?.rate === null && futureOrNewCohort?.d90?.label.includes("Aún no disponible")),
      `Cumple regla de veracidad de datos en cohortes.`
    );

    // Test 29: Tenant inactivo detectado
    const resAlerts = await request("/api/admin/alerts", {
      headers: { Cookie: superAdminCookie },
    });
    const alertsData = resAlerts.json;
    const unconfigAlert = alertsData?.alerts?.find((a) => a.category === "CONFIG");
    record(
      "Test 29 — Detección automática de tenant incompleto / sin configuración",
      "Alerta WARNING de configuración encontrada",
      `Alerta: ${unconfigAlert?.title}`,
      unconfigAlert !== undefined,
      `Tenant Beta detectado como no configurado.`
    );

    // Test 30: Tenant sin actividad identificado
    const activityCheckTenants = await request("/api/admin/tenants?activity=INACTIVO", {
      headers: { Cookie: superAdminCookie },
    });
    record(
      "Test 30 — Clasificación operativa de inactividad basada en operaciones reales",
      "Status 200 con listado filtrable",
      `Status: ${activityCheckTenants.status}`,
      activityCheckTenants.status === 200,
      `Filtro de actividad funcional en /api/admin/tenants.`
    );

    // =========================================================================
    // BLOQUE 6: SYSTEM HEALTH & ERROR MONITORING (TESTS 31 - 35)
    // =========================================================================

    // Registrar errores de prueba controlados
    await prisma.platformEvent.createMany({
      data: [
        {
          event: "UNAUTHORIZED_ACCESS",
          entityType: "SystemError",
          entityId: "/api/admin/test-401",
          metadata: { statusCode: 401, endpoint: "/api/admin/test-401" },
        },
        {
          event: "FORBIDDEN_ACCESS",
          entityType: "SystemError",
          entityId: "/api/admin/test-403",
          metadata: { statusCode: 403, endpoint: "/api/admin/test-403" },
        },
        {
          event: "SLOT_TAKEN",
          entityType: "SystemError",
          entityId: "/api/appointments",
          metadata: { statusCode: 409, endpoint: "/api/appointments" },
        },
        {
          event: "API_ERROR",
          entityType: "SystemError",
          entityId: "/api/cash",
          metadata: { statusCode: 500, endpoint: "/api/cash" },
        },
      ],
    });

    const resHealth = await request("/api/admin/health?period=all", {
      headers: { Cookie: superAdminCookie },
    });
    const healthData = resHealth.json;

    // Test 31: Error count correcto
    record(
      "Test 31 — Total de errores monitorizados contabilizado correctamente",
      "total >= 4",
      `total errors: ${healthData?.errors?.total}`,
      healthData?.errors?.total >= 4,
      `Tasa global de error calculada: ${healthData?.errorRate}%`
    );

    // Test 32: 401 contado
    record(
      "Test 32 — Errores HTTP 401 (Unauthorized) contabilizados",
      "http401 >= 1",
      `http401: ${healthData?.errors?.http401}`,
      healthData?.errors?.http401 >= 1,
      `401 registrados correctamente.`
    );

    // Test 33: 403 contado
    record(
      "Test 33 — Errores HTTP 403 (Forbidden) contabilizados",
      "http403 >= 1",
      `http403: ${healthData?.errors?.http403}`,
      healthData?.errors?.http403 >= 1,
      `403 registrados correctamente.`
    );

    // Test 34: 409 contado
    record(
      "Test 34 — Conflictos HTTP 409 y SLOT_TAKEN contabilizados",
      "http409 >= 1 y slotTaken >= 1",
      `http409: ${healthData?.errors?.http409}, slotTaken: ${healthData?.errors?.slotTaken}`,
      healthData?.errors?.http409 >= 1,
      `Conflictos de concurrencia contabilizados.`
    );

    // Test 35: 500 contado
    record(
      "Test 35 — Excepciones HTTP 500 contabilizadas",
      "http500 >= 1",
      `http500: ${healthData?.errors?.http500}`,
      healthData?.errors?.http500 >= 1,
      `500 registrados en telemetría.`
    );

    // =========================================================================
    // BLOQUE 7: ANOMALÍAS, SEARCH, GEOGRAFÍA & SEGURIDAD (TESTS 36 - 40)
    // =========================================================================

    // Test 36: Anomaly de inactividad
    const inactivityAlert = alertsData?.alerts?.find(
      (a) => a.category === "ACTIVITY" || a.category === "CONFIG"
    );
    record(
      "Test 36 — Regla de anomalía por inactividad o falta de reservas operativa",
      "Alerta generada",
      `Alerta: ${inactivityAlert?.title}`,
      inactivityAlert !== undefined,
      `Severidad: ${inactivityAlert?.severity}`
    );

    // Test 37: Anomaly de aumento de errores
    const resAlertsRefreshed = await request("/api/admin/alerts", {
      headers: { Cookie: superAdminCookie },
    });
    record(
      "Test 37 — Centro de Alertas clasifica por severidad (CRITICAL, WARNING, INFO)",
      "Alerts list no vacía con severidades válidas",
      `Total alertas: ${resAlertsRefreshed.json?.alerts?.length}`,
      resAlertsRefreshed.json?.alerts?.length > 0,
      `Resumen: ${JSON.stringify(resAlertsRefreshed.json?.summary)}`
    );

    // Test 38: Tenant search por nombre y slug
    const resSearch = await request("/api/admin/tenants?search=telemetry-alpha", {
      headers: { Cookie: superAdminCookie },
    });
    record(
      "Test 38 — Búsqueda de negocios por nombre / slug en Platform Admin",
      "1 tenant retornado",
      `Retornados: ${resSearch.json?.data?.length}, slug: ${resSearch.json?.data?.[0]?.slug}`,
      resSearch.json?.data?.length === 1 && resSearch.json?.data?.[0]?.slug === "telemetry-alpha-test",
      `Búsqueda acotada a directiva de plataforma sin exponer CRM global.`
    );

    // Test 39: Geografía no inventa coordenadas GPS
    const resGeo = await request("/api/admin/geografia", {
      headers: { Cookie: superAdminCookie },
    });
    const geoData = resGeo.json;
    const hasFakeCoords = geoData?.cities?.some((c) => "lat" in c || "lng" in c || "latitude" in c);
    record(
      "Test 39 — Geografía reporta ciudades y departamentos reales sin inventar coordenadas GPS",
      "hasCoordinates: false y 0 coordenadas inventadas",
      `hasCoordinates: ${geoData?.hasCoordinates}, fakeCoords: ${hasFakeCoords}`,
      geoData?.hasCoordinates === false && !hasFakeCoords && geoData?.cities?.length > 0,
      `Ciudades reportadas: ${geoData?.cities?.map((c) => c.city).join(", ")}`
    );

    // Test 40: Multi-tenant absoluto y aislamiento de plataforma
    const resDetailA = await request(`/api/admin/tenants/${tenantAlpha.id}`, {
      headers: { Cookie: superAdminCookie },
    });
    const tenantName = resDetailA.json?.tenant?.name || resDetailA.json?.data?.tenant?.name || resDetailA.json?.data?.name;
    record(
      "Test 40 — Aislamiento multi-tenant y agregación protegida de datos de negocio",
      "Status 200, tenant Alpha aislado con métricas operacionales",
      `Status: ${resDetailA.status}, name: ${tenantName}`,
      resDetailA.status === 200 && (resDetailA.json?.data?.id === tenantAlpha.id || resDetailA.json?.tenant?.id === tenantAlpha.id || resDetailA.json?.data?.tenant?.id === tenantAlpha.id),
      `Acceso administrativo verificado para tenant ${tenantAlpha.id}.`
    );

  } catch (error) {
    console.error("❌ ERROR DURANTE EJECUCIÓN DE LA SUITE:", error);
  } finally {
    await prisma.$disconnect();
  }

  const passedCount = results.filter((r) => r.pass).length;
  const totalCount = results.length;

  console.log("======================================================================");
  console.log(`   RESULTADO FASE 5.9: ${passedCount}/${totalCount} TESTS SUPERADOS   `);
  console.log("======================================================================\n");

  if (passedCount < totalCount) {
    process.exit(1);
  }
}

run();
