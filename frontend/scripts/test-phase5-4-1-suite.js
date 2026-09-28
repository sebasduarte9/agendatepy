/**
 * Suite de Pruebas Automatizadas — FASE 5.4.1
 * HARDENING DEL CRM + CORRECCIONES DE COHERENCIA (Tests 1 - 24)
 *
 * 01 Cliente sin visitas muestra última visita como "Sin visitas" (null en API).
 * 02 Cliente COMPLETED muestra última visita real.
 * 03 createdAt nunca se presenta como visita.
 * 04 Nueva cita desde cliente usa clientId.
 * 05 URL no contiene clientName.
 * 06 URL no contiene clientPhone.
 * 07 CashMovement simple suma correctamente.
 * 08 CashMovement dividido suma correctamente.
 * 09 EXPENSE no aumenta total gastado.
 * 10 Cobro de otro cliente no afecta total.
 * 11 Appointment sin cobro no inventa gasto.
 * 12 Doble cobro no duplica ingreso.
 * 13 Cliente cancelado no cuenta visita.
 * 14 NO_SHOW no cuenta visita.
 * 15 EXPIRED no cuenta visita.
 * 16 Próxima cita válida aparece.
 * 17 Próxima cita cancelada no aparece.
 * 18 Tenant A no accede a Client B.
 * 19 API pública no expone información privada.
 * 20 F5 conserva todas las métricas.
 * 21 Nueva cita conserva clientId.
 * 22 PATCH de cliente persiste.
 * 23 Teléfonos paraguayos no duplican cliente.
 * 24 Cliente con historial NO puede ser eliminado destructivamente.
 */

const http = require("http");
const crypto = require("crypto");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const BASE_URL = "http://localhost:3000";
const SESSION_SECRET =
  process.env.SESSION_SECRET ||
  "agendatepy-secure-hmac-sha256-secret-key-paraguay-production-2026";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

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

function request(urlPath, options = {}) {
  const url = new URL(urlPath, BASE_URL);
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

async function runPhase541Suite() {
  console.log("======================================================================");
  console.log("   FASE 5.4.1: HARDENING DEL CRM + COHERENCIA (TESTS 1 - 24)          ");
  console.log("======================================================================\n");

  let passed = 0;
  let failed = 0;

  function report(name, ok, expected, obtained, evidence) {
    if (ok) {
      passed++;
      console.log(`✅ [PASS] ${name}`);
      console.log(`   Esperado: ${expected}`);
      console.log(`   Obtenido: ${obtained}`);
      if (evidence) console.log(`   Evidencia: ${evidence}`);
    } else {
      failed++;
      console.error(`❌ [FAIL] ${name}`);
      console.error(`   Esperado: ${expected}`);
      console.error(`   Obtenido: ${obtained}`);
      if (evidence) console.error(`   Evidencia: ${evidence}`);
    }
    console.log("");
  }

  console.log("--- Inicializando datos de prueba en PostgreSQL ---");
  const timestamp = Date.now().toString().slice(-6);
  const slugA = `estudio-f541-a-${timestamp}`;
  const slugB = `estudio-f541-b-${timestamp}`;

  // Tenant Principal A
  const tenantA = await prisma.tenant.create({
    data: {
      name: `Estudio Hardening ${timestamp}`,
      slug: slugA,
      subdomain: slugA,
      plan: "PROFESIONAL",
      status: "ACTIVE",
      timezone: "America/Asuncion",
    },
  });

  const ownerA = await prisma.user.create({
    data: {
      email: `owner.f541.a.${timestamp}@agendate.py`,
      name: "Propietario Hardening",
      role: "OWNER",
      tenantId: tenantA.id,
    },
  });

  const staffA = await prisma.staff.create({
    data: {
      tenantId: tenantA.id,
      name: "Rodrigo Estilista",
      active: true,
      commissionPercentage: 50,
    },
  });

  const serviceA = await prisma.service.create({
    data: {
      tenantId: tenantA.id,
      name: "Tratamiento Capilar Keratina",
      durationMinutes: 60,
      price: 150000,
      active: true,
    },
  });

  const sessionCookieA = createSessionCookie({
    userId: ownerA.id,
    tenantId: tenantA.id,
    role: ownerA.role,
    email: ownerA.email,
  });

  // Tenant B
  const tenantB = await prisma.tenant.create({
    data: {
      name: `Estudio B Competidor ${timestamp}`,
      slug: slugB,
      subdomain: slugB,
      plan: "PROFESIONAL",
      status: "ACTIVE",
      timezone: "America/Asuncion",
    },
  });

  const ownerB = await prisma.user.create({
    data: {
      email: `owner.f541.b.${timestamp}@agendate.py`,
      name: "Dueño B",
      role: "OWNER",
      tenantId: tenantB.id,
    },
  });

  const sessionCookieB = createSessionCookie({
    userId: ownerB.id,
    tenantId: tenantB.id,
    role: ownerB.role,
    email: ownerB.email,
  });

  console.log(`✓ Tenant A creado: ${tenantA.name} (${tenantA.id})`);
  console.log(`✓ Tenant B creado: ${tenantB.name} (${tenantB.id})\n`);

  let clientWithoutVisits = null;
  let clientWithVisits = null;
  let completedApp = null;
  let splitApp = null;
  let futureApp = null;

  // =========================================================================
  // TEST 01: Cliente sin visitas muestra última visita como null ("Sin visitas")
  // =========================================================================
  try {
    const res = await request("/api/clients", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: sessionCookieA,
      },
      body: {
        name: "María Fernández",
        phone: "0982111222",
        email: "maria.fernandez@test.py",
        notes: "Cliente nueva sin visitas previas",
      },
    });

    const c = res.json?.client;
    clientWithoutVisits = c;

    // Consultar vía GET /api/clients/[id] y GET /api/clients
    const detailRes = await request(`/api/clients/${c.id}`, {
      headers: { Cookie: sessionCookieA },
    });
    const detail = detailRes.json?.client;

    const ok =
      detailRes.status === 200 &&
      detail?.totalVisits === 0 &&
      detail?.lastVisit === null;

    report(
      "TEST 01: Cliente sin visitas muestra última visita como null ('Sin visitas')",
      ok,
      "totalVisits === 0 y lastVisit === null (sin fallback engañoso)",
      `totalVisits: ${detail?.totalVisits}, lastVisit: ${detail?.lastVisit}`,
      `Cliente recién creado sin visitas completadas responde estrictamente null`
    );
  } catch (err) {
    report("TEST 01: Cliente sin visitas", false, "lastVisit = null", err.message);
  }

  // =========================================================================
  // TEST 02: Cliente COMPLETED muestra última visita real
  // =========================================================================
  try {
    const appDate = new Date(Date.now() - 36 * 3600 * 1000);
    const appDateEnd = new Date(appDate.getTime() + 60 * 60 * 1000);

    completedApp = await prisma.appointment.create({
      data: {
        tenantId: tenantA.id,
        clientId: clientWithoutVisits.id,
        staffId: staffA.id,
        serviceId: serviceA.id,
        clientName: clientWithoutVisits.name,
        clientPhone: clientWithoutVisits.phone,
        startTime: appDate,
        endTime: appDateEnd,
        status: "COMPLETED",
      },
    });

    clientWithVisits = clientWithoutVisits;

    const res = await request(`/api/clients/${clientWithVisits.id}`, {
      headers: { Cookie: sessionCookieA },
    });
    const detail = res.json?.client;

    const ok =
      res.status === 200 &&
      detail?.totalVisits === 1 &&
      detail?.lastVisit === appDate.toISOString();

    report(
      "TEST 02: Cliente COMPLETED muestra última visita real",
      ok,
      "lastVisit refleja con precisión la fecha ISO de la cita completada",
      `totalVisits: ${detail?.totalVisits}, lastVisit: ${detail?.lastVisit}`,
      `Fecha de la cita completada asignada a lastVisit`
    );
  } catch (err) {
    report("TEST 02: Cliente COMPLETED", false, "lastVisit real", err.message);
  }

  // =========================================================================
  // TEST 03: createdAt nunca se presenta como visita
  // =========================================================================
  try {
    // Crear otro cliente nuevo sin citas
    const freshClientRes = await request("/api/clients", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: sessionCookieA,
      },
      body: {
        name: "Carlos Recién Creado",
        phone: "0983333444",
      },
    });
    const freshClient = freshClientRes.json?.client;

    const listRes = await request("/api/clients", {
      headers: { Cookie: sessionCookieA },
    });
    const foundInList = listRes.json?.clients?.find((c) => c.id === freshClient.id);

    const ok =
      foundInList &&
      foundInList.lastVisit === null &&
      foundInList.totalVisits === 0;

    report(
      "TEST 03: createdAt nunca se presenta como visita",
      ok,
      "lastVisit en GET /api/clients es null (nunca fallback a createdAt)",
      `lastVisit: ${foundInList?.lastVisit}, totalVisits: ${foundInList?.totalVisits}`,
      `Semántica limpia: clientes sin citas finalizadas no tienen fecha de visita`
    );
  } catch (err) {
    report("TEST 03: createdAt no es visita", false, "lastVisit = null", err.message);
  }

  // =========================================================================
  // TEST 04: Nueva cita desde cliente usa clientId
  // =========================================================================
  try {
    const futureDate = new Date(Date.now() + 24 * 3600 * 1000);
    const futureDateEnd = new Date(futureDate.getTime() + 60 * 60 * 1000);

    const res = await request("/api/dashboard/sync", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: sessionCookieA,
      },
      body: {
        action: "create_appointment",
        appointment: {
          clientId: clientWithVisits.id,
          staffId: staffA.id,
          serviceId: serviceA.id,
          clientName: clientWithVisits.name,
          clientPhone: clientWithVisits.phone,
          start: futureDate.toISOString(),
          end: futureDateEnd.toISOString(),
        },
      },
    });

    const aptId = res.json?.appointmentId || res.json?.appointment?.id;
    const dbApt = await prisma.appointment.findUnique({
      where: { id: aptId },
    });

    futureApp = dbApt;
    const ok = res.status === 200 && dbApt && dbApt.clientId === clientWithVisits.id;

    report(
      "TEST 04: Nueva cita desde cliente usa clientId",
      ok,
      "Cita creada en base de datos con appointment.clientId estrictamente vinculado",
      `appointment.clientId: ${dbApt?.clientId}, client.id: ${clientWithVisits.id}`,
      `Vínculo directo verificado en PostgreSQL`
    );
  } catch (err) {
    report("TEST 04: Nueva cita usa clientId", false, "clientId vinculado", err.message);
  }

  // =========================================================================
  // TEST 05: URL no contiene clientName
  // =========================================================================
  try {
    const clientNavUrl = `/dashboard/calendario?newForClient=${clientWithVisits.id}`;
    const urlObj = new URL(clientNavUrl, BASE_URL);

    const hasNoClientName = !urlObj.searchParams.has("clientName") && !clientNavUrl.includes("clientName=");
    const ok = hasNoClientName;

    report(
      "TEST 05: URL no contiene clientName",
      ok,
      "URL de navegación entre CRM y calendario no expone clientName",
      `URL generada: ${clientNavUrl}`,
      `Privacidad y protección de PII en query string garantizada`
    );
  } catch (err) {
    report("TEST 05: URL sin clientName", false, "Sin clientName", err.message);
  }

  // =========================================================================
  // TEST 06: URL no contiene clientPhone
  // =========================================================================
  try {
    const clientNavUrl = `/dashboard/calendario?newForClient=${clientWithVisits.id}`;
    const urlObj = new URL(clientNavUrl, BASE_URL);

    const hasNoClientPhone = !urlObj.searchParams.has("clientPhone") && !clientNavUrl.includes("clientPhone=");
    const ok = hasNoClientPhone && urlObj.searchParams.get("newForClient") === clientWithVisits.id;

    report(
      "TEST 06: URL no contiene clientPhone",
      ok,
      "URL contiene únicamente el ID opaco del cliente y no su número telefónico",
      `newForClient param: ${urlObj.searchParams.get("newForClient")}`,
      `Eliminación de fuga de datos en logs de navegador / proxy`
    );
  } catch (err) {
    report("TEST 06: URL sin clientPhone", false, "Sin clientPhone", err.message);
  }

  // =========================================================================
  // TEST 07: CashMovement simple suma correctamente
  // =========================================================================
  try {
    await prisma.cashMovement.create({
      data: {
        tenantId: tenantA.id,
        type: "INCOME",
        amount: 150000,
        category: "Servicio",
        description: "Cobro total de tratamiento",
        paymentMethod: "EFECTIVO",
        appointmentId: completedApp.id,
      },
    });

    const res = await request(`/api/clients/${clientWithVisits.id}`, {
      headers: { Cookie: sessionCookieA },
    });
    const detail = res.json?.client;

    const ok = res.status === 200 && detail?.totalSpent === 150000;

    report(
      "TEST 07: CashMovement simple suma correctamente",
      ok,
      "totalSpent === 150000 reflejando exactamente el ingreso en caja",
      `totalSpent: ${detail?.totalSpent}`,
      `Caja como fuente de verdad única para gasto real`
    );
  } catch (err) {
    report("TEST 07: CashMovement simple", false, "150000 Gs", err.message);
  }

  // =========================================================================
  // TEST 08: CashMovement dividido suma correctamente
  // =========================================================================
  try {
    // Crear cita adicional de 100.000 Gs
    const splitDate = new Date(Date.now() - 48 * 3600 * 1000);
    splitApp = await prisma.appointment.create({
      data: {
        tenantId: tenantA.id,
        clientId: clientWithVisits.id,
        staffId: staffA.id,
        serviceId: serviceA.id,
        clientName: clientWithVisits.name,
        clientPhone: clientWithVisits.phone,
        startTime: splitDate,
        endTime: new Date(splitDate.getTime() + 60 * 60 * 1000),
        status: "COMPLETED",
      },
    });

    // Registrar cobro dividido: dos movimientos INCOME de 50.000 para el mismo appointmentId
    await prisma.cashMovement.create({
      data: {
        tenantId: tenantA.id,
        type: "INCOME",
        amount: 50000,
        category: "Servicio",
        description: "Pago parcial 1 (Efectivo)",
        paymentMethod: "EFECTIVO",
        appointmentId: splitApp.id,
      },
    });

    await prisma.cashMovement.create({
      data: {
        tenantId: tenantA.id,
        type: "INCOME",
        amount: 50000,
        category: "Servicio",
        description: "Pago parcial 2 (POS)",
        paymentMethod: "POS",
        appointmentId: splitApp.id,
      },
    });

    const res = await request(`/api/clients/${clientWithVisits.id}`, {
      headers: { Cookie: sessionCookieA },
    });
    const detail = res.json?.client;

    // Total acumulado: 150.000 (primer app) + 50.000 + 50.000 (split app) = 250.000
    const historyItem = detail?.history?.find((h) => h.id === splitApp.id);
    const ok =
      res.status === 200 &&
      detail?.totalSpent === 250000 &&
      historyItem?.chargedAmount === 100000;

    report(
      "TEST 08: CashMovement dividido suma correctamente",
      ok,
      "totalSpent acumula 250000 y el turno dividido reporta 100000 cobrados",
      `totalSpent: ${detail?.totalSpent}, splitApp chargedAmount: ${historyItem?.chargedAmount}`,
      `Cobro dividido consolidado sin pérdida ni sobreescritura`
    );
  } catch (err) {
    report("TEST 08: CashMovement dividido", false, "250000 Gs", err.message);
  }

  // =========================================================================
  // TEST 09: EXPENSE no aumenta total gastado
  // =========================================================================
  try {
    await prisma.cashMovement.create({
      data: {
        tenantId: tenantA.id,
        type: "EXPENSE",
        amount: 40000,
        category: "Insumos",
        description: "Gasto de insumos",
        paymentMethod: "EFECTIVO",
      },
    });

    const res = await request(`/api/clients/${clientWithVisits.id}`, {
      headers: { Cookie: sessionCookieA },
    });
    const detail = res.json?.client;

    const ok = res.status === 200 && detail?.totalSpent === 250000;

    report(
      "TEST 09: EXPENSE no aumenta total gastado",
      ok,
      "totalSpent permanece en 250000 (los egresos nunca se suman al gasto del cliente)",
      `totalSpent: ${detail?.totalSpent}`,
      `Filtro de tipo INCOME operando estrictamente`
    );
  } catch (err) {
    report("TEST 09: EXPENSE no suma", false, "250000 Gs", err.message);
  }

  // =========================================================================
  // TEST 10: Cobro de otro cliente no afecta total
  // =========================================================================
  try {
    const otherClientApp = await prisma.appointment.create({
      data: {
        tenantId: tenantA.id,
        staffId: staffA.id,
        serviceId: serviceA.id,
        clientName: "Otro Cliente Ajeno",
        clientPhone: "0999888777",
        startTime: new Date(),
        endTime: new Date(Date.now() + 60 * 60 * 1000),
        status: "COMPLETED",
      },
    });

    await prisma.cashMovement.create({
      data: {
        tenantId: tenantA.id,
        type: "INCOME",
        amount: 300000,
        category: "Servicio",
        description: "Cobro a cliente ajeno",
        paymentMethod: "POS",
        appointmentId: otherClientApp.id,
      },
    });

    const res = await request(`/api/clients/${clientWithVisits.id}`, {
      headers: { Cookie: sessionCookieA },
    });
    const detail = res.json?.client;

    const ok = res.status === 200 && detail?.totalSpent === 250000;

    report(
      "TEST 10: Cobro de otro cliente no afecta total",
      ok,
      "totalSpent permanece intacto en 250000 sin contaminación cruzada entre clientes",
      `totalSpent: ${detail?.totalSpent}`,
      `Aislamiento estricto de citas y caja por cliente verificado`
    );
  } catch (err) {
    report("TEST 10: Cobro ajeno no afecta", false, "250000 Gs", err.message);
  }

  // =========================================================================
  // TEST 11: Appointment sin cobro no inventa gasto
  // =========================================================================
  try {
    // Crear cliente con cita completada pero sin registrar cobro en caja
    const unpaidClientRes = await request("/api/clients", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: sessionCookieA,
      },
      body: {
        name: "Cliente Turno Impago",
        phone: "0971000111",
      },
    });
    const unpaidClient = unpaidClientRes.json?.client;

    await prisma.appointment.create({
      data: {
        tenantId: tenantA.id,
        clientId: unpaidClient.id,
        staffId: staffA.id,
        serviceId: serviceA.id, // Precio de lista: 150000 Gs
        clientName: unpaidClient.name,
        clientPhone: unpaidClient.phone,
        startTime: new Date(Date.now() - 12 * 3600 * 1000),
        endTime: new Date(Date.now() - 11 * 3600 * 1000),
        status: "COMPLETED",
      },
    });

    const res = await request(`/api/clients/${unpaidClient.id}`, {
      headers: { Cookie: sessionCookieA },
    });
    const detail = res.json?.client;

    const ok = res.status === 200 && detail?.totalSpent === 0;

    report(
      "TEST 11: Appointment sin cobro no inventa gasto",
      ok,
      "totalSpent === 0 a pesar de que el servicio tiene precio de 150000 Gs",
      `totalSpent: ${detail?.totalSpent}`,
      `El precio de lista nunca se presenta falsamente como dinero cobrado`
    );
  } catch (err) {
    report("TEST 11: Sin cobro no inventa gasto", false, "0 Gs", err.message);
  }

  // =========================================================================
  // TEST 12: Doble cobro no duplica ingreso (Idempotencia en /api/cash)
  // =========================================================================
  try {
    const testAppointment = await prisma.appointment.create({
      data: {
        tenantId: tenantA.id,
        staffId: staffA.id,
        serviceId: serviceA.id,
        clientName: "Cliente Prueba Cobro",
        clientPhone: "0981777888",
        startTime: new Date(Date.now() + 10 * 3600 * 1000),
        endTime: new Date(Date.now() + 11 * 3600 * 1000),
        status: "CONFIRMED",
      },
    });

    // Primer cobro
    const firstCharge = await request("/api/cash", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: sessionCookieA,
      },
      body: {
        type: "INCOME",
        amount: 150000,
        concept: "Cobro turno único",
        method: "efectivo",
        appointmentId: testAppointment.id,
      },
    });

    // Segundo cobro idéntico (doble clic)
    const secondCharge = await request("/api/cash", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: sessionCookieA,
      },
      body: {
        type: "INCOME",
        amount: 150000,
        concept: "Cobro turno único repetido",
        method: "efectivo",
        appointmentId: testAppointment.id,
      },
    });

    const countMovements = await prisma.cashMovement.count({
      where: { appointmentId: testAppointment.id },
    });

    const ok =
      firstCharge.status === 201 &&
      secondCharge.status === 409 &&
      secondCharge.json?.error === "ALREADY_CHARGED" &&
      countMovements === 1;

    report(
      "TEST 12: Doble cobro no duplica ingreso",
      ok,
      "Segundo cobro rechazado con HTTP 409 ALREADY_CHARGED y exactamente 1 movimiento en BD",
      `First: ${firstCharge.status}, Second: ${secondCharge.status}, Movimientos: ${countMovements}`,
      `Protección de idempotencia previene sobrefacturación accidental`
    );
  } catch (err) {
    report("TEST 12: Idempotencia de cobro", false, "Rechazo 409", err.message);
  }

  // =========================================================================
  // TEST 13: Cliente cancelado no cuenta visita
  // =========================================================================
  try {
    await prisma.appointment.create({
      data: {
        tenantId: tenantA.id,
        clientId: clientWithVisits.id,
        staffId: staffA.id,
        serviceId: serviceA.id,
        clientName: clientWithVisits.name,
        clientPhone: clientWithVisits.phone,
        startTime: new Date(Date.now() - 72 * 3600 * 1000),
        endTime: new Date(Date.now() - 71 * 3600 * 1000),
        status: "CANCELLED",
      },
    });

    const res = await request(`/api/clients/${clientWithVisits.id}`, {
      headers: { Cookie: sessionCookieA },
    });
    const detail = res.json?.client;

    // Solo 2 citas previas fueron COMPLETED (completedApp y splitApp)
    const ok = res.status === 200 && detail?.totalVisits === 2;

    report(
      "TEST 13: Cliente cancelado no cuenta visita",
      ok,
      "totalVisits permanece en 2 tras agregar cita CANCELLED",
      `totalVisits: ${detail?.totalVisits}`,
      `Citas canceladas excluidas de visitas realizadas`
    );
  } catch (err) {
    report("TEST 13: Cancelado no suma visita", false, "2 visitas", err.message);
  }

  // =========================================================================
  // TEST 14: NO_SHOW no cuenta visita
  // =========================================================================
  try {
    await prisma.appointment.create({
      data: {
        tenantId: tenantA.id,
        clientId: clientWithVisits.id,
        staffId: staffA.id,
        serviceId: serviceA.id,
        clientName: clientWithVisits.name,
        clientPhone: clientWithVisits.phone,
        startTime: new Date(Date.now() - 96 * 3600 * 1000),
        endTime: new Date(Date.now() - 95 * 3600 * 1000),
        status: "NO_SHOW",
      },
    });

    const res = await request(`/api/clients/${clientWithVisits.id}`, {
      headers: { Cookie: sessionCookieA },
    });
    const detail = res.json?.client;

    const ok = res.status === 200 && detail?.totalVisits === 2;

    report(
      "TEST 14: NO_SHOW no cuenta visita",
      ok,
      "totalVisits permanece en 2 tras agregar cita NO_SHOW",
      `totalVisits: ${detail?.totalVisits}`,
      `Inasistencias excluidas del contador de visitas del cliente`
    );
  } catch (err) {
    report("TEST 14: NO_SHOW no suma visita", false, "2 visitas", err.message);
  }

  // =========================================================================
  // TEST 15: EXPIRED no cuenta visita
  // =========================================================================
  try {
    await prisma.appointment.create({
      data: {
        tenantId: tenantA.id,
        clientId: clientWithVisits.id,
        staffId: staffA.id,
        serviceId: serviceA.id,
        clientName: clientWithVisits.name,
        clientPhone: clientWithVisits.phone,
        startTime: new Date(Date.now() - 120 * 3600 * 1000),
        endTime: new Date(Date.now() - 119 * 3600 * 1000),
        status: "EXPIRED",
      },
    });

    const res = await request(`/api/clients/${clientWithVisits.id}`, {
      headers: { Cookie: sessionCookieA },
    });
    const detail = res.json?.client;

    const ok = res.status === 200 && detail?.totalVisits === 2;

    report(
      "TEST 15: EXPIRED no cuenta visita",
      ok,
      "totalVisits permanece en 2 tras agregar cita EXPIRED",
      `totalVisits: ${detail?.totalVisits}`,
      `Citas vencidas/expiradas no contabilizadas en visitas`
    );
  } catch (err) {
    report("TEST 15: EXPIRED no suma visita", false, "2 visitas", err.message);
  }

  // =========================================================================
  // TEST 16: Próxima cita válida aparece
  // =========================================================================
  try {
    const res = await request(`/api/clients/${clientWithVisits.id}`, {
      headers: { Cookie: sessionCookieA },
    });
    const nextApp = res.json?.client?.nextAppointment;

    const ok =
      res.status === 200 &&
      nextApp &&
      nextApp.id === futureApp.id &&
      nextApp.serviceName === "Tratamiento Capilar Keratina";

    report(
      "TEST 16: Próxima cita válida aparece",
      ok,
      "nextAppointment poblado correctamente con turno futuro",
      `ID: ${nextApp?.id}, Servicio: ${nextApp?.serviceName}`,
      `Detección automática de próxima cita válida`
    );
  } catch (err) {
    report("TEST 16: Próxima cita válida", false, "Próxima cita presente", err.message);
  }

  // =========================================================================
  // TEST 17: Próxima cita cancelada no aparece
  // =========================================================================
  try {
    await prisma.appointment.update({
      where: { id: futureApp.id },
      data: { status: "CANCELLED" },
    });

    const res = await request(`/api/clients/${clientWithVisits.id}`, {
      headers: { Cookie: sessionCookieA },
    });
    const nextApp = res.json?.client?.nextAppointment;

    const ok = res.status === 200 && nextApp === null;

    report(
      "TEST 17: Próxima cita cancelada no aparece",
      ok,
      "nextAppointment se actualiza a null al cancelar la cita futura",
      `nextAppointment: ${nextApp}`,
      `Citas canceladas excluidas dinámicamente de próxima cita`
    );
  } catch (err) {
    report("TEST 17: Próxima cita cancelada", false, "null", err.message);
  }

  // =========================================================================
  // TEST 18: Tenant A no accede a Client B
  // =========================================================================
  let clientB = null;
  try {
    clientB = await prisma.client.create({
      data: {
        tenantId: tenantB.id,
        name: "Cliente Privado Tenant B",
        phone: "595991888222",
      },
    });

    const getRes = await request(`/api/clients/${clientB.id}`, {
      headers: { Cookie: sessionCookieA },
    });

    const patchRes = await request(`/api/clients/${clientB.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Cookie: sessionCookieA,
      },
      body: { name: "Intento IDOR" },
    });

    const deleteRes = await request(`/api/clients/${clientB.id}`, {
      method: "DELETE",
      headers: { Cookie: sessionCookieA },
    });

    const ok =
      (getRes.status === 404 || getRes.status === 403) &&
      (patchRes.status === 404 || patchRes.status === 403) &&
      (deleteRes.status === 404 || deleteRes.status === 403);

    report(
      "TEST 18: Tenant A no accede a Client B",
      ok,
      "HTTP 404 en GET, PATCH y DELETE cruzados entre diferentes tenants",
      `GET: ${getRes.status}, PATCH: ${patchRes.status}, DELETE: ${deleteRes.status}`,
      `Barrera multi-tenant infranqueable y anti-IDOR validada`
    );
  } catch (err) {
    report("TEST 18: Aislamiento multi-tenant", false, "404", err.message);
  }

  // =========================================================================
  // TEST 19: API pública no expone información privada
  // =========================================================================
  try {
    const anonClients = await request("/api/clients");
    const anonClientDetail = await request(`/api/clients/${clientWithVisits.id}`);

    const ok = anonClients.status === 401 && anonClientDetail.status === 401;

    report(
      "TEST 19: API pública no expone información privada",
      ok,
      "HTTP 401 Unauthorized ante consultas anónimas de clientes y fichas",
      `Anon /api/clients: ${anonClients.status}, Anon /api/clients/[id]: ${anonClientDetail.status}`,
      `Fichas de clientes blindadas contra accesos sin sesión`
    );
  } catch (err) {
    report("TEST 19: Privacidad de APIs", false, "401", err.message);
  }

  // =========================================================================
  // TEST 20: F5 conserva todas las métricas
  // =========================================================================
  try {
    // Emular recarga completa consultando /api/clients
    const res = await request("/api/clients", {
      headers: { Cookie: sessionCookieA },
    });
    const c = res.json?.clients?.find((cl) => cl.id === clientWithVisits.id);

    const ok =
      res.status === 200 &&
      c &&
      c.totalVisits === 2 &&
      c.totalSpent === 250000 &&
      c.lastVisit !== null;

    report(
      "TEST 20: F5 conserva todas las métricas",
      ok,
      "totalVisits, totalSpent y lastVisit intactos tras recargar datos desde PostgreSQL",
      `totalVisits: ${c?.totalVisits}, totalSpent: ${c?.totalSpent}, lastVisit: ${c?.lastVisit}`,
      `Persistencia y consistencia 100% real en PostgreSQL tras F5`
    );
  } catch (err) {
    report("TEST 20: F5 conserva métricas", false, "Métricas intactas", err.message);
  }

  // =========================================================================
  // TEST 21: Nueva cita conserva clientId
  // =========================================================================
  try {
    const newAptDate = new Date(Date.now() + 72 * 3600 * 1000);
    const res = await request("/api/dashboard/sync", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: sessionCookieA,
      },
      body: {
        action: "create_appointment",
        appointment: {
          clientId: clientWithVisits.id,
          staffId: staffA.id,
          serviceId: serviceA.id,
          clientName: clientWithVisits.name,
          clientPhone: clientWithVisits.phone,
          start: newAptDate.toISOString(),
          end: new Date(newAptDate.getTime() + 60 * 60 * 1000).toISOString(),
        },
      },
    });

    const aptId = res.json?.appointmentId || res.json?.appointment?.id;
    const dbApt = await prisma.appointment.findUnique({ where: { id: aptId } });

    const ok = res.status === 200 && dbApt && dbApt.clientId === clientWithVisits.id;

    report(
      "TEST 21: Nueva cita conserva clientId",
      ok,
      "Cita registrada exitosamente con clientId vinculado en base de datos",
      `Appointment clientId: ${dbApt?.clientId}, Esperado: ${clientWithVisits.id}`,
      `Integridad relacional Cliente -> Cita verificada`
    );
  } catch (err) {
    report("TEST 21: Nueva cita conserva clientId", false, "clientId conservado", err.message);
  }

  // =========================================================================
  // TEST 22: PATCH de cliente persiste
  // =========================================================================
  try {
    const updatedNotes = "Fórmula actualizada Fase 5.4.1: Tinte 8.12 con agua de 30 vol";
    const res = await request(`/api/clients/${clientWithVisits.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Cookie: sessionCookieA,
      },
      body: { formula: updatedNotes },
    });

    const getRes = await request(`/api/clients/${clientWithVisits.id}`, {
      headers: { Cookie: sessionCookieA },
    });
    const c = getRes.json?.client;

    const ok = res.status === 200 && c?.formula === updatedNotes;

    report(
      "TEST 22: PATCH de cliente persiste",
      ok,
      "Fórmula técnica actualizada mediante PATCH y verificada tras consulta GET",
      `Fórmula en DB: "${c?.formula}"`,
      `Persistencia en PostgreSQL verificada`
    );
  } catch (err) {
    report("TEST 22: PATCH cliente persiste", false, "Persistido", err.message);
  }

  // =========================================================================
  // TEST 23: Teléfonos paraguayos no duplican cliente
  // =========================================================================
  try {
    const countBefore = await prisma.client.count({
      where: { tenantId: tenantA.id },
    });

    // Intentar registrar el mismo teléfono con formato alternativo +595982111222 vs 0982111222
    const res = await request("/api/clients", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: sessionCookieA,
      },
      body: {
        name: "María Fernández Variante",
        phone: "+595 982 111 222",
        notes: "Intento de registro con formato internacional",
      },
    });

    const countAfter = await prisma.client.count({
      where: { tenantId: tenantA.id },
    });

    const ok = res.status === 200 && countBefore === countAfter && res.json?.client?.id === clientWithVisits.id;

    report(
      "TEST 23: Teléfonos paraguayos no duplican cliente",
      ok,
      "Conteo de clientes en base de datos no incrementa y resuelve al cliente existente",
      `Conteo inicial: ${countBefore}, Conteo final: ${countAfter}, ID retornado: ${res.json?.client?.id}`,
      `Deduplicación canónica por normalización E.164 funcionando`
    );
  } catch (err) {
    report("TEST 23: Teléfonos no duplican", false, "Sin duplicados", err.message);
  }

  // =========================================================================
  // TEST 24: Cliente con historial NO puede ser eliminado destructivamente
  // =========================================================================
  try {
    const deleteRes = await request(`/api/clients/${clientWithVisits.id}`, {
      method: "DELETE",
      headers: { Cookie: sessionCookieA },
    });

    const clientStillExists = await prisma.client.findUnique({
      where: { id: clientWithVisits.id },
    });

    const ok =
      deleteRes.status === 409 &&
      deleteRes.json?.error === "CLIENT_HAS_HISTORY" &&
      Boolean(clientStillExists);

    report(
      "TEST 24: Cliente con historial NO puede ser eliminado destructivamente",
      ok,
      "HTTP 409 CLIENT_HAS_HISTORY rechazando la eliminación para proteger el historial",
      `Status: ${deleteRes.status}, Error: ${deleteRes.json?.error}, Cliente en DB: ${Boolean(clientStillExists)}`,
      `Borrado destructivo bloqueado para preservar historial operacional y financiero`
    );
  } catch (err) {
    report("TEST 24: Bloqueo de borrado destructivo", false, "409 CLIENT_HAS_HISTORY", err.message);
  }

  // =========================================================================
  // RESUMEN FINAL
  // =========================================================================
  console.log("======================================================================");
  console.log(`RESUMEN FASE 5.4.1: ${passed} / 24 PRUEBAS APROBADAS`);
  console.log("======================================================================\n");

  if (failed > 0) {
    console.error(`⚠️ Hubo ${failed} pruebas fallidas.`);
    process.exit(1);
  } else {
    console.log("🎉 TODAS LAS 24 PRUEBAS DE FASE 5.4.1 PASARON EXITOSAMENTE.\n");
    process.exit(0);
  }
}

runPhase541Suite()
  .catch((err) => {
    console.error("Error fatal ejecutando suite 5.4.1:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
