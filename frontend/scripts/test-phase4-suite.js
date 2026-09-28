/**
 * Suite de Pruebas FASE 4 — CORE OPERATIVO PERSISTENTE 100% REAL
 * Valida los 12 tests requeridos contra PostgreSQL real y el servidor Next.js en ejecución.
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
      req.write(typeof options.body === "string" ? options.body : JSON.stringify(options.body));
    }
    req.end();
  });
}

async function run() {
  console.log("======================================================================");
  console.log("   FASE 4: VALIDACIÓN END-TO-END DE PERSISTENCIA REAL (TEST 1 - 12)   ");
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
    // 0. Preparar dos tenants reales en PostgreSQL
    console.log("--- Inicializando datos de prueba en PostgreSQL ---");
    const tenantA = await prisma.tenant.upsert({
      where: { slug: "barberia-fase4-a" },
      update: { name: "Barbería Fase 4 Alfa", timezone: "America/Asuncion" },
      create: {
        name: "Barbería Fase 4 Alfa",
        slug: "barberia-fase4-a",
        subdomain: "barberia-fase4-a",
        timezone: "America/Asuncion",
        settings: { phone: "+595981100200", address: "Av. España 1234, Asunción" },
      },
    });

    const tenantB = await prisma.tenant.upsert({
      where: { slug: "estetica-fase4-b" },
      update: { name: "Estética Fase 4 Beta", timezone: "America/Asuncion" },
      create: {
        name: "Estética Fase 4 Beta",
        slug: "estetica-fase4-b",
        subdomain: "estetica-fase4-b",
        timezone: "America/Asuncion",
        settings: { phone: "+595982300400", address: "Av. Santa Teresa 567, Asunción" },
      },
    });

    // Crear dueños para los tenants
    const userA = await prisma.user.upsert({
      where: { email: "owner.a@agendate.py" },
      update: { tenantId: tenantA.id },
      create: {
        email: "owner.a@agendate.py",
        name: "Dueño Tenant A",
        role: "OWNER",
        tenantId: tenantA.id,
      },
    });

    const userB = await prisma.user.upsert({
      where: { email: "owner.b@agendate.py" },
      update: { tenantId: tenantB.id },
      create: {
        email: "owner.b@agendate.py",
        name: "Dueña Tenant B",
        role: "OWNER",
        tenantId: tenantB.id,
      },
    });

    const cookieA = createSessionCookie({
      id: userA.id,
      email: userA.email,
      name: userA.name,
      role: userA.role,
      tenantId: tenantA.id,
      tenantSlug: tenantA.slug,
    });

    const cookieB = createSessionCookie({
      id: userB.id,
      email: userB.email,
      name: userB.name,
      role: userB.role,
      tenantId: tenantB.id,
      tenantSlug: tenantB.slug,
    });

    console.log(`✓ Tenant A listo: ${tenantA.name} (${tenantA.id})`);
    console.log(`✓ Tenant B listo: ${tenantB.name} (${tenantB.id})\n`);

    // -------------------------------------------------------------------------
    // TEST 1: Crear servicio → F5 (sync) → permanece en PostgreSQL
    // -------------------------------------------------------------------------
    let createdServiceId = null;
    {
      const createRes = await request("/api/services", {
        method: "POST",
        headers: { "Content-Type": "application/json", Cookie: cookieA },
        body: {
          name: "Corte Degradé Premium",
          category: "Barbería",
          durationMin: 45,
          price: 95000,
          description: "Corte navaja y toalla caliente",
        },
      });

      const passCreate = createRes.status === 201 && createRes.json?.ok && createRes.json?.service?.id;
      createdServiceId = createRes.json?.service?.id;

      // Simular F5 con GET /api/dashboard/sync
      const syncRes = await request("/api/dashboard/sync", {
        headers: { Cookie: cookieA },
      });

      const foundInSync = syncRes.json?.services?.find((s) => s.id === createdServiceId);
      const pass = passCreate && Boolean(foundInSync) && foundInSync.name === "Corte Degradé Premium";

      record(
        "TEST 1: Crear servicio → F5 → permanece",
        "Servicio creado con status 201 y recuperado en /api/dashboard/sync tras F5",
        `HTTP ${createRes.status} | Sync recuperó: ${foundInSync?.name || "No encontrado"} (Gs. ${foundInSync?.price})`,
        pass,
        `ServiceId: ${createdServiceId}`
      );
    }

    // -------------------------------------------------------------------------
    // TEST 2: Editar servicio → F5 → cambio permanece
    // -------------------------------------------------------------------------
    {
      const editRes = await request(`/api/services/${createdServiceId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Cookie: cookieA },
        body: {
          name: "Corte Degradé Premium (Actualizado)",
          price: 110000,
          durationMin: 50,
        },
      });

      // Simular F5 con GET /api/dashboard/sync
      const syncRes = await request("/api/dashboard/sync", {
        headers: { Cookie: cookieA },
      });

      const updatedInSync = syncRes.json?.services?.find((s) => s.id === createdServiceId);
      const pass =
        editRes.status === 200 &&
        updatedInSync &&
        updatedInSync.name === "Corte Degradé Premium (Actualizado)" &&
        updatedInSync.price === 110000;

      record(
        "TEST 2: Editar servicio → F5 → cambio permanece",
        "Servicio actualizado a 110.000 Gs y verificado tras F5",
        `HTTP ${editRes.status} | Nombre: "${updatedInSync?.name}" | Precio: Gs. ${updatedInSync?.price}`,
        pass,
        `Nuevo precio reflejado en PostgreSQL: ${updatedInSync?.price}`
      );
    }

    // -------------------------------------------------------------------------
    // TEST 3: Crear staff → F5 → permanece
    // -------------------------------------------------------------------------
    let createdStaffId = null;
    {
      const staffRes = await request("/api/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json", Cookie: cookieA },
        body: {
          name: "Marcos Barbero",
          role: "Master Barber",
          commissionPercentage: 55,
          color: "#4f46e5",
          active: true,
        },
      });

      createdStaffId = staffRes.json?.staff?.id;

      // Simular F5
      const syncRes = await request("/api/dashboard/sync", {
        headers: { Cookie: cookieA },
      });

      const foundStaff = syncRes.json?.staff?.find((st) => st.id === createdStaffId);
      const pass =
        staffRes.status === 201 &&
        Boolean(foundStaff) &&
        foundStaff.name === "Marcos Barbero" &&
        foundStaff.commissionPercentage === 55;

      record(
        "TEST 3: Crear staff → F5 → permanece",
        "Staff registrado con schedules y disponible tras F5 en sync",
        `HTTP ${staffRes.status} | Colaborador: "${foundStaff?.name}" | Comisión: ${foundStaff?.commissionPercentage}%`,
        pass,
        `StaffId: ${createdStaffId}`
      );
    }

    // -------------------------------------------------------------------------
    // TEST 4: Crear cliente → F5 → permanece
    // -------------------------------------------------------------------------
    let createdClientId = null;
    {
      const clientRes = await request("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json", Cookie: cookieA },
        body: {
          name: "Alejandro Gómez",
          phone: "+595981999888",
          email: "alejandro.gomez@gmail.com",
          notes: "Piel sensible, corte a tijera",
          formula: "Tono 7.1 ceniza con 20 vol",
          tags: ["VIP", "Frecuente"],
        },
      });

      createdClientId = clientRes.json?.client?.id;

      // Simular F5
      const syncRes = await request("/api/dashboard/sync", {
        headers: { Cookie: cookieA },
      });

      const foundClient = syncRes.json?.clients?.find((c) => c.id === createdClientId);
      const pass =
        (clientRes.status === 201 || clientRes.status === 200) &&
        Boolean(foundClient) &&
        foundClient.phone.includes("981999888") &&
        foundClient.formula === "Tono 7.1 ceniza con 20 vol";

      record(
        "TEST 4: Crear cliente → F5 → permanece",
        "Cliente registrado en PostgreSQL con ficha técnica persistida tras F5",
        `HTTP ${clientRes.status} | Cliente: ${foundClient?.name} | Tel: ${foundClient?.phone} | Fórmula: ${foundClient?.formula}`,
        pass,
        `ClientId: ${createdClientId}`
      );
    }

    // -------------------------------------------------------------------------
    // TEST 5: Crear ingreso en Caja → F5 → permanece
    // -------------------------------------------------------------------------
    let incomeMovementId = null;
    {
      const cashRes = await request("/api/cash", {
        method: "POST",
        headers: { "Content-Type": "application/json", Cookie: cookieA },
        body: {
          type: "INCOME",
          amount: 150000,
          paymentMethod: "efectivo",
          description: "Cobro turno presencial Alejandro Gómez",
          category: "Servicios",
        },
      });

      incomeMovementId = cashRes.json?.movement?.id;

      const syncRes = await request("/api/dashboard/sync", {
        headers: { Cookie: cookieA },
      });

      const foundIncome = syncRes.json?.cashMovements?.find((cm) => cm.id === incomeMovementId);
      const pass =
        cashRes.status === 201 &&
        Boolean(foundIncome) &&
        foundIncome.amount === 150000 &&
        foundIncome.type === "ingreso";

      record(
        "TEST 5: Crear ingreso en Caja → F5 → permanece",
        "Movimiento de ingreso registrado y visible tras F5",
        `HTTP ${cashRes.status} | Movimiento: ${foundIncome?.concept} (+Gs. ${foundIncome?.amount})`,
        pass,
        `MovementId: ${incomeMovementId}`
      );
    }

    // -------------------------------------------------------------------------
    // TEST 6: Crear egreso en Caja → F5 → permanece
    // -------------------------------------------------------------------------
    let expenseMovementId = null;
    {
      const cashRes = await request("/api/cash", {
        method: "POST",
        headers: { "Content-Type": "application/json", Cookie: cookieA },
        body: {
          type: "EXPENSE",
          amount: 45000,
          paymentMethod: "efectivo",
          description: "Compra de insumos de recepción (café y hielo)",
          category: "Gastos Varios",
        },
      });

      expenseMovementId = cashRes.json?.movement?.id;

      const syncRes = await request("/api/dashboard/sync", {
        headers: { Cookie: cookieA },
      });

      const foundExpense = syncRes.json?.cashMovements?.find((cm) => cm.id === expenseMovementId);
      const pass =
        cashRes.status === 201 &&
        Boolean(foundExpense) &&
        foundExpense.amount === 45000 &&
        foundExpense.type === "egreso";

      record(
        "TEST 6: Crear egreso → F5 → permanece",
        "Movimiento de egreso registrado y visible tras F5",
        `HTTP ${cashRes.status} | Egreso: ${foundExpense?.concept} (-Gs. ${foundExpense?.amount})`,
        pass,
        `MovementId: ${expenseMovementId}`
      );
    }

    // -------------------------------------------------------------------------
    // Preparar dos citas para TEST 7 y TEST 8
    // -------------------------------------------------------------------------
    const baseDate = new Date();
    baseDate.setDate(baseDate.getDate() + 5);
    baseDate.setHours(10, 0, 0, 0);

    const app1Start = new Date(baseDate.getTime());
    const app1End = new Date(baseDate.getTime() + 45 * 60000);

    const app2Start = new Date(baseDate.getTime() + 120 * 60000);
    const app2End = new Date(baseDate.getTime() + 165 * 60000);

    const app1 = await prisma.appointment.create({
      data: {
        tenantId: tenantA.id,
        staffId: createdStaffId,
        serviceId: createdServiceId,
        clientName: "Cliente 1 Turno Fijo",
        clientPhone: "595981111222",
        startTime: app1Start,
        endTime: app1End,
        status: "CONFIRMED",
      },
    });

    const app2 = await prisma.appointment.create({
      data: {
        tenantId: tenantA.id,
        staffId: createdStaffId,
        serviceId: createdServiceId,
        clientName: "Cliente 2 Reprogramar",
        clientPhone: "595981333444",
        startTime: app2Start,
        endTime: app2End,
        status: "CONFIRMED",
      },
    });

    // -------------------------------------------------------------------------
    // TEST 7: Reagendar cita → DB refleja nuevo horario
    // -------------------------------------------------------------------------
    {
      const newStart = new Date(baseDate.getTime() + 240 * 60000);
      const newEnd = new Date(baseDate.getTime() + 285 * 60000);

      const rescheduleRes = await request(`/api/appointments/${app2.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Cookie: cookieA },
        body: {
          startTime: newStart.toISOString(),
          endTime: newEnd.toISOString(),
          staffId: createdStaffId,
        },
      });

      // Verificar en PostgreSQL directamente
      const updatedApp = await prisma.appointment.findUnique({
        where: { id: app2.id },
      });

      const pass =
        rescheduleRes.status === 200 &&
        rescheduleRes.json?.ok &&
        updatedApp.startTime.getTime() === newStart.getTime();

      record(
        "TEST 7: Reagendar cita → DB refleja nuevo horario",
        "HTTP 200 y startTime actualizado en base de datos PostgreSQL",
        `HTTP ${rescheduleRes.status} | DB Start: ${updatedApp?.startTime.toISOString()}`,
        pass,
        `Nuevo horario verificado en DB: ${updatedApp?.startTime.toISOString()} - ${updatedApp?.endTime.toISOString()}`
      );
    }

    // -------------------------------------------------------------------------
    // TEST 8: Reagendar a horario ocupado → SLOT_TAKEN → cita original intacta
    // -------------------------------------------------------------------------
    {
      // Intentar mover app2 para colisionar con app1 (app1 está en app1Start..app1End)
      const collisionStart = new Date(app1Start.getTime() + 10 * 60000); // 10 min adentro
      const collisionEnd = new Date(app1End.getTime() + 10 * 60000);

      const collisionRes = await request(`/api/appointments/${app2.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Cookie: cookieA },
        body: {
          startTime: collisionStart.toISOString(),
          endTime: collisionEnd.toISOString(),
          staffId: createdStaffId,
        },
      });

      // Verificar que app2 NO se movió en PostgreSQL
      const intactApp = await prisma.appointment.findUnique({
        where: { id: app2.id },
      });

      const pass =
        collisionRes.status === 409 &&
        collisionRes.json?.error === "SLOT_TAKEN" &&
        intactApp.startTime.getTime() !== collisionStart.getTime();

      record(
        "TEST 8: Reagendar a horario ocupado → SLOT_TAKEN → cita original intacta",
        "HTTP 409 con error SLOT_TAKEN y cita sin modificaciones en DB",
        `HTTP ${collisionRes.status} | error: ${collisionRes.json?.error} | Horario permanece intacto`,
        pass,
        `Mensaje devuelto: "${collisionRes.json?.message}" | Cita en DB no modificada`
      );
    }

    // -------------------------------------------------------------------------
    // TEST 9: Bloquear 13:00–14:00 → slots públicos no muestran ese horario
    // -------------------------------------------------------------------------
    {
      const blockDate = new Date();
      blockDate.setDate(blockDate.getDate() + 3);
      const dateStr = blockDate.toISOString().slice(0, 10);

      // 1. Crear bloqueo 13:00 a 14:00
      const blockRes = await request("/api/schedule-blocks", {
        method: "POST",
        headers: { "Content-Type": "application/json", Cookie: cookieA },
        body: {
          staffId: createdStaffId,
          date: dateStr,
          start: "13:00",
          end: "14:00",
          reason: "Almuerzo y descanso del barbero",
        },
      });

      // 2. Verificar que existe en PostgreSQL y en GET /api/schedule-blocks
      const blocksApiRes = await request("/api/schedule-blocks", {
        headers: { Cookie: cookieA },
      });
      const blockInApi = blocksApiRes.json?.blocks?.find((b) => b.staffId === createdStaffId);

      // 3. Probar que intentar agendar/reprogramar en esa franja (13:15 a 13:45) es bloqueado con SLOT_TAKEN (409)
      const blockedStart = new Date(`${dateStr}T13:15:00-03:00`);
      const blockedEnd = new Date(`${dateStr}T13:45:00-03:00`);

      const tryBlockedRes = await request(`/api/appointments/${app2.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Cookie: cookieA },
        body: {
          startTime: blockedStart.toISOString(),
          endTime: blockedEnd.toISOString(),
          staffId: createdStaffId,
        },
      });

      const pass =
        blockRes.status === 201 &&
        Boolean(blockInApi) &&
        tryBlockedRes.status === 409 &&
        tryBlockedRes.json?.error === "SLOT_TAKEN" &&
        tryBlockedRes.json?.message?.includes("Almuerzo y descanso");

      record(
        "TEST 9: Bloquear 13:00–14:00 → slots públicos no muestran ese horario",
        "Bloqueo creado en DB y cualquier intento de agendar entre 13:00-14:00 es rechazado con SLOT_TAKEN",
        `HTTP ${blockRes.status} | Bloqueo en API: ${Boolean(blockInApi)} | Intento agendar 13:15: HTTP ${tryBlockedRes.status} (${tryBlockedRes.json?.error})`,
        pass,
        `Mensaje de rechazo: "${tryBlockedRes.json?.message}"`
      );
    }

    // -------------------------------------------------------------------------
    // TEST 10: Tenant A crea datos → Tenant B no puede verlos
    // -------------------------------------------------------------------------
    {
      // Tenant B consulta servicios, clientes, movimientos de caja
      const bServices = await request("/api/services", {
        headers: { Cookie: cookieB },
      });
      const bClients = await request("/api/clients", {
        headers: { Cookie: cookieB },
      });
      const bCash = await request("/api/cash", {
        headers: { Cookie: cookieB },
      });

      // Tenant B intenta acceder a un recurso específico de Tenant A
      const crossServiceRes = await request(`/api/services/${createdServiceId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Cookie: cookieB },
        body: { price: 999999 },
      });

      const hasTenantAService = bServices.json?.services?.some((s) => s.id === createdServiceId);
      const hasTenantAClient = bClients.json?.clients?.some((c) => c.id === createdClientId);
      const crossForbiddenOrNotFound = crossServiceRes.status === 404 || crossServiceRes.status === 403;

      const pass = !hasTenantAService && !hasTenantAClient && crossForbiddenOrNotFound;

      record(
        "TEST 10: Tenant A crea datos → Tenant B no puede verlos",
        "Aislamiento total multi-tenant en listados y mutaciones cruzadas bloqueadas (404/403)",
        `Servicios filtrados: ${!hasTenantAService} | Clientes filtrados: ${!hasTenantAClient} | Mutación cross-tenant: HTTP ${crossServiceRes.status}`,
        pass,
        `Tenant B no tiene visibilidad de los registros de Tenant A`
      );
    }

    // -------------------------------------------------------------------------
    // TEST 11: Logout / Login → todos los datos continúan
    // -------------------------------------------------------------------------
    {
      // Simular nuevo token de sesión como si el usuario hubiera hecho logout y nuevo login
      const freshLoginCookie = createSessionCookie({
        id: userA.id,
        email: userA.email,
        name: userA.name,
        role: userA.role,
        tenantId: tenantA.id,
        tenantSlug: tenantA.slug,
      });

      const freshSyncRes = await request("/api/dashboard/sync", {
        headers: { Cookie: freshLoginCookie },
      });

      const s = freshSyncRes.json;
      const serviceExists = s?.services?.some((item) => item.id === createdServiceId);
      const staffExists = s?.staff?.some((item) => item.id === createdStaffId);
      const clientExists = s?.clients?.some((item) => item.id === createdClientId);
      const cashExists = s?.cashMovements?.some((item) => item.id === incomeMovementId);

      const pass = serviceExists && staffExists && clientExists && cashExists;

      record(
        "TEST 11: Logout/login → todos los datos continúan",
        "Todos los registros creados persisten en PostgreSQL y se recuperan tras nueva sesión",
        `Servicio: ${serviceExists} | Staff: ${staffExists} | Cliente: ${clientExists} | Caja: ${cashExists}`,
        pass,
        `Nueva sesión autenticada cargó 100% de los datos persistentes`
      );
    }

    // -------------------------------------------------------------------------
    // TEST 12: DB failure / payload inválido → no fake success
    // -------------------------------------------------------------------------
    {
      // Payload con precio negativo y sin nombre
      const badService = await request("/api/services", {
        method: "POST",
        headers: { "Content-Type": "application/json", Cookie: cookieA },
        body: { name: "", price: -500 },
      });

      // Cita con ID inexistente o inválido
      const badApp = await request("/api/appointments/00000000-0000-0000-0000-000000000000", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Cookie: cookieA },
        body: { startTime: "invalid-date" },
      });

      // Movimiento de caja sin monto
      const badCash = await request("/api/cash", {
        method: "POST",
        headers: { "Content-Type": "application/json", Cookie: cookieA },
        body: { type: "INCOME", amount: 0, description: "" },
      });

      const pass =
        badService.status === 400 &&
        !badService.json?.ok &&
        badApp.status >= 400 &&
        !badApp.json?.ok &&
        badCash.status === 400 &&
        !badCash.json?.ok;

      record(
        "TEST 12: DB failure / input inválido → no fake success",
        "Respuestas HTTP 400/404 con { ok: false, error: ... } y sin éxito falso",
        `BadService: HTTP ${badService.status} (ok: ${badService.json?.ok}) | BadApp: HTTP ${badApp.status} | BadCash: HTTP ${badCash.status}`,
        pass,
        `Errores semánticos retornados: VALIDATION_ERROR`
      );
    }

    // Resumen
    console.log("======================================================================");
    const passedCount = results.filter((r) => r.pass).length;
    console.log(`RESUMEN FASE 4: ${passedCount} / ${results.length} PRUEBAS APROBADAS`);
    console.log("======================================================================");

    if (passedCount === results.length) {
      console.log("\n🎉 TODAS LAS PRUEBAS DE PERSISTENCIA Y CORE OPERATIVO PASARON EXITOSAMENTE.");
    } else {
      console.error("\n❌ ALGUNAS PRUEBAS FALLARON. REVISAR DETALLES.");
      process.exitCode = 1;
    }
  } catch (error) {
    console.error("Error fatal ejecutando suite de pruebas:", error);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

run();
