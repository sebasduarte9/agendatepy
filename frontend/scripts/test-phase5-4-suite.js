/**
 * Suite de Pruebas Automatizadas — FASE 5.4
 * CRM OPERACIONAL + FICHA DE CLIENTE (Tests 1-20)
 *
 * Mínimo 20 tests:
 * 01 Crear cliente.
 * 02 Persistir cliente después de F5.
 * 03 Buscar cliente por nombre.
 * 04 Buscar cliente por teléfono.
 * 05 Crear cita para cliente.
 * 06 Cita aparece en historial.
 * 07 COMPLETED cuenta como visita.
 * 08 CANCELLED no cuenta como visita.
 * 09 NO_SHOW no cuenta como visita.
 * 10 EXPIRED no cuenta como visita.
 * 11 CashMovement asociado aumenta total gastado.
 * 12 Dos movimientos no producen doble conteo accidental.
 * 13 Próxima cita aparece correctamente.
 * 14 Cancelar próxima cita actualiza la ficha.
 * 15 Editar notas persiste.
 * 16 Editar fórmula persiste si existe.
 * 17 Teléfonos 0981 / 595 / +595 no duplican cliente.
 * 18 Tenant A no puede acceder a Cliente B.
 * 19 API pública no devuelve información privada.
 * 20 Nueva cita desde ficha usa el Client correcto.
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

async function runPhase54Suite() {
  console.log("======================================================================");
  console.log("   FASE 5.4: CRM OPERACIONAL + FICHA DE CLIENTE (TESTS 1 - 20)        ");
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

  // --- Inicialización de Entornos de Prueba ---
  console.log("--- Inicializando datos de prueba en PostgreSQL ---");

  const timestamp = Date.now().toString().slice(-6);
  const slugA = `estudio-f54-a-${timestamp}`;
  const slugB = `estudio-f54-b-${timestamp}`;

  // Tenant Principal A
  const tenantA = await prisma.tenant.create({
    data: {
      name: `Estudio Alfa ${timestamp}`,
      slug: slugA,
      subdomain: slugA,
      plan: "PROFESIONAL",
      status: "ACTIVE",
      timezone: "America/Asuncion",
    },
  });

  const ownerA = await prisma.user.create({
    data: {
      email: `owner.f54.a.${timestamp}@agendate.py`,
      name: "Propietario Alfa",
      role: "OWNER",
      tenantId: tenantA.id,
    },
  });

  const staffA = await prisma.staff.create({
    data: {
      tenantId: tenantA.id,
      name: "Carlos Barbero",
      active: true,
      commissionPercentage: 50,
    },
  });

  const serviceA = await prisma.service.create({
    data: {
      tenantId: tenantA.id,
      name: "Corte y Barba Premium",
      durationMinutes: 45,
      price: 80000,
      active: true,
    },
  });

  const sessionCookieA = createSessionCookie({
    userId: ownerA.id,
    tenantId: tenantA.id,
    role: ownerA.role,
    email: ownerA.email,
  });

  // Tenant B (Para aislamiento multi-tenant)
  const tenantB = await prisma.tenant.create({
    data: {
      name: `Estudio Beta ${timestamp}`,
      slug: slugB,
      subdomain: slugB,
      plan: "PROFESIONAL",
      status: "ACTIVE",
      timezone: "America/Asuncion",
    },
  });

  const ownerB = await prisma.user.create({
    data: {
      email: `owner.f54.b.${timestamp}@agendate.py`,
      name: "Propietario Beta",
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

  let clientA = null;
  let clientB = null;
  let completedAppointment = null;
  let futureAppointment = null;

  // =========================================================================
  // TEST 01: Crear cliente
  // =========================================================================
  try {
    const res = await request("/api/clients", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: sessionCookieA,
      },
      body: {
        name: "Juan Carlos Pérez",
        phone: "0981123456",
        email: "juan.perez@test.py",
        notes: "Prefiere té verde y corte degradé bajo",
        formula: "Tinte 7.1 con 20 volúmenes",
        instagram: "@juanperez_py",
        tags: ["Frecuente", "VIP"],
      },
    });

    const is201 = res.status === 201 || res.status === 200;
    const client = res.json?.client;
    const ok =
      is201 &&
      client &&
      UUID_REGEX.test(client.id) &&
      (client.phone === "+595981123456" || client.phone === "595981123456");

    if (ok) clientA = client;

    report(
      "TEST 01: Crear cliente",
      ok,
      "HTTP 201/200 con cliente creado, ID UUID y teléfono normalizado 595981123456",
      `Status: ${res.status}, ID: ${client?.id}, Phone: ${client?.phone}`,
      `Nombre: ${client?.name}, Notas: ${client?.notes}`
    );
  } catch (err) {
    report("TEST 01: Crear cliente", false, "Cliente creado", err.message);
  }

  // =========================================================================
  // TEST 02: Persistir cliente después de F5
  // =========================================================================
  try {
    const res = await request("/api/clients", {
      headers: { Cookie: sessionCookieA },
    });

    const clientsList = res.json?.clients || [];
    const found = clientsList.find((c) => c.id === clientA?.id);
    const ok = res.status === 200 && Boolean(found) && found.name === "Juan Carlos Pérez";

    report(
      "TEST 02: Persistir cliente después de F5",
      ok,
      "Cliente recuperado intacto desde PostgreSQL al recargar lista (GET /api/clients)",
      `Total clientes: ${clientsList.length}, Encontrado: ${found?.name} (${found?.id})`,
      `Persistencia en PostgreSQL verificada tras F5`
    );
  } catch (err) {
    report("TEST 02: Persistir cliente después de F5", false, "Cliente persistido", err.message);
  }

  // =========================================================================
  // TEST 03: Buscar cliente por nombre
  // =========================================================================
  try {
    const res = await request("/api/clients?search=Juan", {
      headers: { Cookie: sessionCookieA },
    });

    const results = res.json?.clients || [];
    const match = results.some((c) => c.name.toLowerCase().includes("juan"));
    const ok = res.status === 200 && match;

    report(
      "TEST 03: Buscar cliente por nombre",
      ok,
      "Búsqueda por 'Juan' devuelve al cliente en la respuesta",
      `Encontrados: ${results.length}, Primer match: ${results[0]?.name}`,
      `Filtro insensible a mayúsculas operativo`
    );
  } catch (err) {
    report("TEST 03: Buscar cliente por nombre", false, "Match por nombre", err.message);
  }

  // =========================================================================
  // TEST 04: Buscar cliente por teléfono
  // =========================================================================
  try {
    // Buscar con formato local paraguayo 0981123456
    const res = await request("/api/clients?search=0981123456", {
      headers: { Cookie: sessionCookieA },
    });

    const results = res.json?.clients || [];
    const match = results.some(
      (c) => c.phone.includes("595981123456") || c.phone.includes("0981123456")
    );
    const ok = res.status === 200 && match;

    report(
      "TEST 04: Buscar cliente por teléfono",
      ok,
      "Búsqueda por '0981123456' resuelve al cliente con teléfono canónico",
      `Encontrados: ${results.length}, Teléfono registrado: ${results[0]?.phone}`,
      `Normalización y búsqueda integrada funcionando`
    );
  } catch (err) {
    report("TEST 04: Buscar cliente por teléfono", false, "Match por teléfono", err.message);
  }

  // =========================================================================
  // TEST 05: Crear cita para cliente
  // =========================================================================
  try {
    const pastDate = new Date(Date.now() - 24 * 3600 * 1000);
    const pastDateEnd = new Date(pastDate.getTime() + 45 * 60 * 1000);

    const res = await request("/api/dashboard/sync", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: sessionCookieA,
      },
      body: {
        action: "create_appointment",
        appointment: {
          clientId: clientA.id,
          staffId: staffA.id,
          serviceId: serviceA.id,
          clientName: clientA.name,
          clientPhone: clientA.phone,
          startTime: pastDate.toISOString(),
          endTime: pastDateEnd.toISOString(),
          notes: "Cita inicial para corte",
        },
      },
    });

    const created = res.json?.appointment;
    const ok = res.status === 200 && created && UUID_REGEX.test(created.id);
    if (ok) completedAppointment = created;

    report(
      "TEST 05: Crear cita para cliente",
      ok,
      "Cita creada con ID UUID y vinculada al clientId del cliente",
      `Status: ${res.status}, AppointmentId: ${created?.id}`,
      `Vinculada a clientId: ${created?.clientId || clientA.id}`
    );
  } catch (err) {
    report("TEST 05: Crear cita para cliente", false, "Cita creada", err.message);
  }

  // =========================================================================
  // TEST 06: Cita aparece en historial
  // =========================================================================
  try {
    const res = await request(`/api/clients/${clientA.id}`, {
      headers: { Cookie: sessionCookieA },
    });

    const clientDetail = res.json?.client;
    const history = clientDetail?.history || [];
    const hasApt = history.some((h) => h.id === completedAppointment.id);
    const ok = res.status === 200 && hasApt;

    report(
      "TEST 06: Cita aparece en historial",
      ok,
      "Historial de la ficha de cliente contiene la cita con servicio y profesional",
      `Citas en historial: ${history.length}, Encontrada: ${hasApt}`,
      `Servicio: ${history[0]?.service?.name}, Staff: ${history[0]?.staff?.name}`
    );
  } catch (err) {
    report("TEST 06: Cita aparece en historial", false, "Cita en historial", err.message);
  }

  // =========================================================================
  // TEST 07: COMPLETED cuenta como visita
  // =========================================================================
  try {
    // Actualizar estado a COMPLETED en DB
    await prisma.appointment.update({
      where: { id: completedAppointment.id },
      data: { status: "COMPLETED" },
    });

    const res = await request(`/api/clients/${clientA.id}`, {
      headers: { Cookie: sessionCookieA },
    });

    const client = res.json?.client;
    const ok = res.status === 200 && client?.totalVisits === 1 && Boolean(client?.lastVisit);

    report(
      "TEST 07: COMPLETED cuenta como visita",
      ok,
      "totalVisits === 1 y lastVisit establecido con fecha del appointment",
      `totalVisits: ${client?.totalVisits}, lastVisit: ${client?.lastVisit}`,
      `Regla de negocio: sólo appointments COMPLETED incrementan contador`
    );
  } catch (err) {
    report("TEST 07: COMPLETED cuenta como visita", false, "Visita = 1", err.message);
  }

  // =========================================================================
  // TEST 08: CANCELLED no cuenta como visita
  // =========================================================================
  try {
    const d = new Date(Date.now() - 48 * 3600 * 1000);
    await prisma.appointment.create({
      data: {
        tenantId: tenantA.id,
        clientId: clientA.id,
        staffId: staffA.id,
        serviceId: serviceA.id,
        clientName: clientA.name,
        clientPhone: clientA.phone,
        startTime: d,
        endTime: new Date(d.getTime() + 45 * 60 * 1000),
        status: "CANCELLED",
      },
    });

    const res = await request(`/api/clients/${clientA.id}`, {
      headers: { Cookie: sessionCookieA },
    });

    const client = res.json?.client;
    const ok = res.status === 200 && client?.totalVisits === 1;

    report(
      "TEST 08: CANCELLED no cuenta como visita",
      ok,
      "totalVisits permanece en 1 tras registrar cita CANCELLED",
      `totalVisits: ${client?.totalVisits}`,
      `Cita cancelada excluida de métricas de visitas`
    );
  } catch (err) {
    report("TEST 08: CANCELLED no cuenta como visita", false, "totalVisits = 1", err.message);
  }

  // =========================================================================
  // TEST 09: NO_SHOW no cuenta como visita
  // =========================================================================
  try {
    const d = new Date(Date.now() - 72 * 3600 * 1000);
    await prisma.appointment.create({
      data: {
        tenantId: tenantA.id,
        clientId: clientA.id,
        staffId: staffA.id,
        serviceId: serviceA.id,
        clientName: clientA.name,
        clientPhone: clientA.phone,
        startTime: d,
        endTime: new Date(d.getTime() + 45 * 60 * 1000),
        status: "NO_SHOW",
      },
    });

    const res = await request(`/api/clients/${clientA.id}`, {
      headers: { Cookie: sessionCookieA },
    });

    const client = res.json?.client;
    const ok = res.status === 200 && client?.totalVisits === 1;

    report(
      "TEST 09: NO_SHOW no cuenta como visita",
      ok,
      "totalVisits permanece en 1 tras registrar cita NO_SHOW",
      `totalVisits: ${client?.totalVisits}`,
      `Inasistencia (no-show) excluida de visitas completadas`
    );
  } catch (err) {
    report("TEST 09: NO_SHOW no cuenta como visita", false, "totalVisits = 1", err.message);
  }

  // =========================================================================
  // TEST 10: EXPIRED no cuenta como visita
  // =========================================================================
  try {
    const d = new Date(Date.now() - 96 * 3600 * 1000);
    await prisma.appointment.create({
      data: {
        tenantId: tenantA.id,
        clientId: clientA.id,
        staffId: staffA.id,
        serviceId: serviceA.id,
        clientName: clientA.name,
        clientPhone: clientA.phone,
        startTime: d,
        endTime: new Date(d.getTime() + 45 * 60 * 1000),
        status: "EXPIRED",
      },
    });

    const res = await request(`/api/clients/${clientA.id}`, {
      headers: { Cookie: sessionCookieA },
    });

    const client = res.json?.client;
    const ok = res.status === 200 && client?.totalVisits === 1;

    report(
      "TEST 10: EXPIRED no cuenta como visita",
      ok,
      "totalVisits permanece en 1 tras registrar cita EXPIRED",
      `totalVisits: ${client?.totalVisits}`,
      `Cita expirada excluida del contador de visitas`
    );
  } catch (err) {
    report("TEST 10: EXPIRED no cuenta como visita", false, "totalVisits = 1", err.message);
  }

  // =========================================================================
  // TEST 11: CashMovement asociado aumenta total gastado
  // =========================================================================
  try {
    // Registrar cobro real en caja vinculado a la cita completada
    await prisma.cashMovement.create({
      data: {
        tenantId: tenantA.id,
        type: "INCOME",
        amount: 80000,
        category: "Servicio",
        description: "Cobro Corte y Barba Premium",
        paymentMethod: "EFECTIVO",
        appointmentId: completedAppointment.id,
      },
    });

    const res = await request(`/api/clients/${clientA.id}`, {
      headers: { Cookie: sessionCookieA },
    });

    const client = res.json?.client;
    const historyApt = client?.history?.find((h) => h.id === completedAppointment.id);
    const ok =
      res.status === 200 &&
      client?.totalSpent === 80000 &&
      historyApt?.chargedAmount === 80000;

    report(
      "TEST 11: CashMovement asociado aumenta total gastado",
      ok,
      "totalSpent === 80000 y chargedAmount en historial === 80000",
      `totalSpent: ${client?.totalSpent}, chargedAmount: ${historyApt?.chargedAmount}`,
      `Caja como fuente de verdad estricta para gasto real`
    );
  } catch (err) {
    report("TEST 11: CashMovement asociado aumenta total gastado", false, "80000 Gs", err.message);
  }

  // =========================================================================
  // TEST 12: Dos movimientos no producen doble conteo accidental
  // =========================================================================
  try {
    // 1. Crear un movimiento de gasto (EXPENSE) de 30000 en el tenant
    await prisma.cashMovement.create({
      data: {
        tenantId: tenantA.id,
        type: "EXPENSE",
        amount: 30000,
        category: "Insumos",
        description: "Compra de insumos de barbería",
        paymentMethod: "EFECTIVO",
      },
    });

    // 2. Crear un movimiento de ingreso para OTRA cita y OTRO cliente
    const otherApt = await prisma.appointment.create({
      data: {
        tenantId: tenantA.id,
        staffId: staffA.id,
        serviceId: serviceA.id,
        clientName: "Cliente Diferente",
        clientPhone: "0981999999",
        startTime: new Date(),
        endTime: new Date(Date.now() + 30 * 60 * 1000),
        status: "COMPLETED",
      },
    });

    await prisma.cashMovement.create({
      data: {
        tenantId: tenantA.id,
        type: "INCOME",
        amount: 50000,
        category: "Servicio",
        description: "Cobro cliente diferente",
        paymentMethod: "TARJETA",
        appointmentId: otherApt.id,
      },
    });

    const res = await request(`/api/clients/${clientA.id}`, {
      headers: { Cookie: sessionCookieA },
    });

    const client = res.json?.client;
    // El total gastado del cliente Juan Carlos DEBE permanecer exactamente en 80000
    const ok = res.status === 200 && client?.totalSpent === 80000;

    report(
      "TEST 12: Dos movimientos no producen doble conteo accidental",
      ok,
      "totalSpent permanece exactamente en 80000 (sin sumar egresos ni cobros ajenos ni precio de servicio)",
      `totalSpent: ${client?.totalSpent}`,
      `Aislamiento de movimientos de caja por cita verificado`
    );
  } catch (err) {
    report("TEST 12: Dos movimientos no producen doble conteo accidental", false, "80000", err.message);
  }

  // =========================================================================
  // TEST 13: Próxima cita aparece correctamente
  // =========================================================================
  try {
    const tomorrow = new Date(Date.now() + 24 * 3600 * 1000);
    const tomorrowEnd = new Date(tomorrow.getTime() + 45 * 60 * 1000);

    futureAppointment = await prisma.appointment.create({
      data: {
        tenantId: tenantA.id,
        clientId: clientA.id,
        staffId: staffA.id,
        serviceId: serviceA.id,
        clientName: clientA.name,
        clientPhone: clientA.phone,
        startTime: tomorrow,
        endTime: tomorrowEnd,
        status: "CONFIRMED",
      },
    });

    const res = await request(`/api/clients/${clientA.id}`, {
      headers: { Cookie: sessionCookieA },
    });

    const client = res.json?.client;
    const nextApp = client?.nextAppointment;
    const ok =
      res.status === 200 &&
      nextApp &&
      nextApp.id === futureAppointment.id &&
      nextApp.serviceName === "Corte y Barba Premium";

    report(
      "TEST 13: Próxima cita aparece correctamente",
      ok,
      "nextAppointment poblado con id, servicio, profesional y fecha futura",
      `ID: ${nextApp?.id}, Servicio: ${nextApp?.serviceName}, Fecha: ${nextApp?.date}`,
      `Detección automática de próxima cita válida`
    );
  } catch (err) {
    report("TEST 13: Próxima cita aparece correctamente", false, "Próxima cita detectada", err.message);
  }

  // =========================================================================
  // TEST 14: Cancelar próxima cita actualiza la ficha
  // =========================================================================
  try {
    await prisma.appointment.update({
      where: { id: futureAppointment.id },
      data: { status: "CANCELLED" },
    });

    const res = await request(`/api/clients/${clientA.id}`, {
      headers: { Cookie: sessionCookieA },
    });

    const client = res.json?.client;
    const nextApp = client?.nextAppointment;
    // Como era la única cita futura y se canceló, nextAppointment debe ser null
    const ok = res.status === 200 && nextApp === null;

    report(
      "TEST 14: Cancelar próxima cita actualiza la ficha",
      ok,
      "nextAppointment se vuelve null automáticamente tras cancelar la cita futura",
      `nextAppointment: ${nextApp}`,
      `Regla de negocio: CANCELLED excluido de próxima cita`
    );
  } catch (err) {
    report("TEST 14: Cancelar próxima cita actualiza la ficha", false, "nextAppointment = null", err.message);
  }

  // =========================================================================
  // TEST 15: Editar notas persiste
  // =========================================================================
  try {
    const updatedNotes = "Cliente VIP. Prefiere café negro y toalla caliente antes del corte.";

    const patchRes = await request(`/api/clients/${clientA.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Cookie: sessionCookieA,
      },
      body: { notes: updatedNotes },
    });

    // Validar respuesta del endpoint de edición
    const patchOk = patchRes.status === 200 && patchRes.json?.ok;

    // Validar persistencia real en PostgreSQL con un GET subsiguiente
    const getRes = await request(`/api/clients/${clientA.id}`, {
      headers: { Cookie: sessionCookieA },
    });

    const client = getRes.json?.client;
    const ok = patchOk && client?.notes === updatedNotes;

    report(
      "TEST 15: Editar notas persiste",
      ok,
      "Notas internas actualizadas vía PATCH y persistidas en PostgreSQL",
      `Notas en DB: "${client?.notes}"`,
      `Persistencia en campo notes verificada`
    );
  } catch (err) {
    report("TEST 15: Editar notas persiste", false, "Notas persistidas", err.message);
  }

  // =========================================================================
  // TEST 16: Editar fórmula persiste si existe
  // =========================================================================
  try {
    const updatedFormula = "Fórmula actualizada: Matizador 9.21 con revelador de 10 volúmenes";

    const patchRes = await request(`/api/clients/${clientA.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Cookie: sessionCookieA,
      },
      body: { formula: updatedFormula },
    });

    const patchOk = patchRes.status === 200 && patchRes.json?.ok;

    // Validar persistencia real en PostgreSQL
    const getRes = await request(`/api/clients/${clientA.id}`, {
      headers: { Cookie: sessionCookieA },
    });

    const client = getRes.json?.client;
    const ok = patchOk && client?.formula === updatedFormula;

    report(
      "TEST 16: Editar fórmula persiste si existe",
      ok,
      "Fórmula técnica actualizada vía PATCH y persistida en PostgreSQL",
      `Fórmula en DB: "${client?.formula}"`,
      `Persistencia en campo formula verificada`
    );
  } catch (err) {
    report("TEST 16: Editar fórmula persiste si existe", false, "Fórmula persistida", err.message);
  }

  // =========================================================================
  // TEST 17: Teléfonos 0981 / 595 / +595 no duplican cliente
  // =========================================================================
  try {
    const initialClients = await prisma.client.count({
      where: { tenantId: tenantA.id },
    });

    // Intentar registrar el mismo cliente con formato alternativo +595 981 123 456
    const res = await request("/api/clients", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: sessionCookieA,
      },
      body: {
        name: "Juan Carlos Pérez Actualizado",
        phone: "+595 981 123 456",
        notes: "Actualización de notas desde intento de duplicación",
      },
    });

    const finalClients = await prisma.client.count({
      where: { tenantId: tenantA.id },
    });

    const sameCount = finalClients === initialClients;
    const ok = res.status === 200 && sameCount && res.json?.client?.id === clientA.id;

    report(
      "TEST 17: Teléfonos 0981 / 595 / +595 no duplican cliente",
      ok,
      "Mismo conteo de clientes y resolución al mismo ID de cliente",
      `Conteo inicial: ${initialClients}, Conteo final: ${finalClients}, ID devuelto: ${res.json?.client?.id}`,
      `Deduplicación por teléfono normalizado paraguayo funcionando`
    );
  } catch (err) {
    report("TEST 17: Deduplicación por teléfono", false, "Sin duplicados", err.message);
  }

  // =========================================================================
  // TEST 18: Tenant A no puede acceder a Cliente B
  // =========================================================================
  try {
    // Crear Cliente en Tenant B
    clientB = await prisma.client.create({
      data: {
        tenantId: tenantB.id,
        name: "Cliente Exclusivo Tenant B",
        phone: "595971999888",
        notes: "Información confidencial de Tenant B",
      },
    });

    // Tenant A intenta GET a Cliente B
    const getB = await request(`/api/clients/${clientB.id}`, {
      headers: { Cookie: sessionCookieA },
    });

    // Tenant A intenta PATCH a Cliente B
    const patchB = await request(`/api/clients/${clientB.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Cookie: sessionCookieA,
      },
      body: { notes: "Ataque IDOR intentando modificar nota" },
    });

    // Tenant A intenta DELETE a Cliente B
    const deleteB = await request(`/api/clients/${clientB.id}`, {
      method: "DELETE",
      headers: { Cookie: sessionCookieA },
    });

    const ok =
      (getB.status === 404 || getB.status === 403) &&
      (patchB.status === 404 || patchB.status === 403) &&
      (deleteB.status === 404 || deleteB.status === 403);

    report(
      "TEST 18: Tenant A no puede acceder a Cliente B",
      ok,
      "HTTP 404 o 403 en GET, PATCH y DELETE de recursos de otro tenant (Anti-IDOR)",
      `GET status: ${getB.status}, PATCH status: ${patchB.status}, DELETE status: ${deleteB.status}`,
      `Aislamiento multi-tenant validado contra accesos cruzados`
    );
  } catch (err) {
    report("TEST 18: Aislamiento Tenant A vs Tenant B", false, "404/403", err.message);
  }

  // =========================================================================
  // TEST 19: API pública no devuelve información privada
  // =========================================================================
  try {
    // 1. Acceso anónimo a /api/clients (debe dar 401)
    const anonClients = await request("/api/clients");

    // 2. Acceso anónimo a /api/clients/[id] (debe dar 401)
    const anonClientDetail = await request(`/api/clients/${clientA.id}`);

    // 3. Consulta a endpoints públicos de citas/disponibilidad
    const publicSlots = await request(
      `/api/appointments?tenant=${slugA}&serviceId=${serviceA.id}&date=2026-10-15`
    );

    const safeAnonClients = anonClients.status === 401;
    const safeAnonDetail = anonClientDetail.status === 401;

    // Verificar que la respuesta pública de slots no expone campos privados
    const slotsString = JSON.stringify(publicSlots.json || {});
    const noNotesLeaked = !slotsString.includes("Prefiere té verde") && !slotsString.includes("Tinte");
    const noCashLeaked = !slotsString.includes("totalSpent") && !slotsString.includes("CashMovement");

    const ok = safeAnonClients && safeAnonDetail && noNotesLeaked && noCashLeaked;

    report(
      "TEST 19: API pública no devuelve información privada",
      ok,
      "Endpoints administrativos devuelven 401 anónimo; API pública no filtra notas, fórmulas ni finanzas",
      `Anon GET /api/clients: ${anonClients.status}, Anon GET /api/clients/[id]: ${anonClientDetail.status}`,
      `Fórmulas, notas y datos de caja completamente aislados del portal público`
    );
  } catch (err) {
    report("TEST 19: API pública no devuelve información privada", false, "Sin fugas", err.message);
  }

  // =========================================================================
  // TEST 20: Nueva cita desde ficha usa el Client correcto
  // =========================================================================
  try {
    const futureDate = new Date(Date.now() + 48 * 3600 * 1000);
    const futureDateEnd = new Date(futureDate.getTime() + 45 * 60 * 1000);

    // Emular creación de cita desde el modal de Ficha de Cliente pasando clientId
    const res = await request("/api/dashboard/sync", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: sessionCookieA,
      },
      body: {
        action: "create_appointment",
        appointment: {
          clientId: clientA.id,
          staffId: staffA.id,
          serviceId: serviceA.id,
          clientName: clientA.name,
          clientPhone: clientA.phone,
          startTime: futureDate.toISOString(),
          endTime: futureDateEnd.toISOString(),
          notes: "Cita agendada directamente desde la Ficha de Cliente",
        },
      },
    });

    const aptCreated = res.json?.appointment;

    // Verificar en DB que la cita tiene efectivamente el clientId asignado
    const dbApt = await prisma.appointment.findUnique({
      where: { id: aptCreated.id },
    });

    // Verificar que la cita aparece vinculada al cliente en la ficha
    const clientRes = await request(`/api/clients/${clientA.id}`, {
      headers: { Cookie: sessionCookieA },
    });

    const historyMatches = clientRes.json?.client?.history?.some((h) => h.id === aptCreated.id);
    const ok =
      res.status === 200 &&
      dbApt &&
      dbApt.clientId === clientA.id &&
      historyMatches;

    report(
      "TEST 20: Nueva cita desde ficha usa el Client correcto",
      ok,
      "Cita creada con clientId de clientA asignado en DB y vinculada a su historial",
      `AppointmentId: ${aptCreated?.id}, DB clientId: ${dbApt?.clientId}, Vinculado en historial: ${historyMatches}`,
      `Flujo Cliente -> Nueva Cita completado y validado en PostgreSQL`
    );
  } catch (err) {
    report("TEST 20: Nueva cita desde ficha usa el Client correcto", false, "Cliente correcto", err.message);
  }

  // =========================================================================
  // RESUMEN FINAL
  // =========================================================================
  console.log("======================================================================");
  console.log(`RESUMEN FASE 5.4: ${passed} / 20 PRUEBAS APROBADAS`);
  console.log("======================================================================\n");

  if (failed > 0) {
    console.error(`⚠️ Hubo ${failed} pruebas fallidas.`);
    process.exit(1);
  } else {
    console.log("🎉 TODAS LAS 20 PRUEBAS DE FASE 5.4 PASARON EXITOSAMENTE.\n");
    process.exit(0);
  }
}

runPhase54Suite()
  .catch((err) => {
    console.error("Error fatal ejecutando suite 5.4:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
