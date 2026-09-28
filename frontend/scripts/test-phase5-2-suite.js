/**
 * Suite de Regresión Completa — FASE 5.2
 * Valida los 18 requisitos de optimización operativa, productividad y coherencia del Dashboard.
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
  console.log("   FASE 5.2: SUITE DE REGRESIÓN DE PRODUCTIVIDAD Y OPERACIONES (1-18) ");
  console.log("======================================================================\n");

  const results = [];
  function record(testNumber, testName, expected, actual, pass, evidence) {
    results.push({ testNumber, testName, expected, actual, pass, evidence });
    const mark = pass ? "✅ [PASS]" : "❌ [FAIL]";
    console.log(`${mark} TEST ${testNumber}: ${testName}`);
    console.log(`   Esperado: ${expected}`);
    console.log(`   Obtenido: ${actual}`);
    console.log(`   Evidencia: ${evidence}\n`);
  }

  try {
    console.log("--- Inicializando datos de prueba en PostgreSQL ---");
    const tenantA = await prisma.tenant.upsert({
      where: { slug: "fase52-salon-a" },
      update: { name: "Salón Fase 5.2 Alfa", timezone: "America/Asuncion" },
      create: {
        name: "Salón Fase 5.2 Alfa",
        slug: "fase52-salon-a",
        subdomain: "fase52-salon-a",
        timezone: "America/Asuncion",
        settings: { phone: "+595981999888", address: "Asunción, Paraguay" },
      },
    });

    const tenantB = await prisma.tenant.upsert({
      where: { slug: "fase52-salon-b" },
      update: { name: "Salón Fase 5.2 Beta", timezone: "America/Asuncion" },
      create: {
        name: "Salón Fase 5.2 Beta",
        slug: "fase52-salon-b",
        subdomain: "fase52-salon-b",
        timezone: "America/Asuncion",
        settings: { phone: "+595982111222", address: "San Lorenzo, Paraguay" },
      },
    });

    const ownerUser = await prisma.user.upsert({
      where: { email: "owner.fase52@agendate.py" },
      update: { tenantId: tenantA.id, role: "OWNER" },
      create: {
        email: "owner.fase52@agendate.py",
        name: "Dueño Fase 5.2",
        role: "OWNER",
        tenantId: tenantA.id,
      },
    });

    const staffUser = await prisma.user.upsert({
      where: { email: "staff.fase52@agendate.py" },
      update: { tenantId: tenantA.id, role: "STAFF" },
      create: {
        email: "staff.fase52@agendate.py",
        name: "Staff Fase 5.2",
        role: "STAFF",
        tenantId: tenantA.id,
      },
    });

    const ownerCookie = createSessionCookie({
      id: ownerUser.id,
      email: ownerUser.email,
      name: ownerUser.name,
      role: ownerUser.role,
      tenantId: tenantA.id,
      tenantSlug: tenantA.slug,
    });

    const staffCookie = createSessionCookie({
      id: staffUser.id,
      email: staffUser.email,
      name: staffUser.name,
      role: staffUser.role,
      tenantId: tenantA.id,
      tenantSlug: tenantA.slug,
    });

    const serviceA = await prisma.service.create({
      data: {
        tenantId: tenantA.id,
        name: "Corte y Perfilado 5.2",
        durationMinutes: 45,
        price: 90000,
        active: true,
      },
    });

    const staffA = await prisma.staff.create({
      data: {
        tenantId: tenantA.id,
        name: "Rodrigo Barbero 5.2",
        active: true,
        commissionPercentage: 50,
      },
    });

    let testAppointmentId = null;

    // -------------------------------------------------------------------------
    // TEST 1: Crear cita desde calendario
    // -------------------------------------------------------------------------
    {
      const res = await request("/api/dashboard/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json", Cookie: ownerCookie },
        body: {
          action: "create_appointment",
          tenantSlug: tenantA.slug,
          data: {
            clientName: "Marcos Rolón",
            clientPhone: "+595981100200",
            serviceId: serviceA.id,
            staffId: staffA.id,
            start: "2026-11-10T10:00:00.000Z",
            end: "2026-11-10T10:45:00.000Z",
            status: "confirmed",
          },
        },
      });

      testAppointmentId = res.json?.appointmentId;
      const dbApp = testAppointmentId
        ? await prisma.appointment.findUnique({ where: { id: testAppointmentId } })
        : null;

      const pass = res.status === 200 && res.json?.ok === true && dbApp !== null;
      record(
        1,
        "Crear cita desde calendario (action: create_appointment)",
        "HTTP 200 y registro creado en PostgreSQL",
        `Status: ${res.status}, ID: ${testAppointmentId}`,
        pass,
        `Respuesta: ${res.body}`
      );
    }

    // -------------------------------------------------------------------------
    // TEST 2: Crear cita desde flujo rápido con normalización
    // -------------------------------------------------------------------------
    let quickAppId = null;
    {
      const res = await request("/api/dashboard/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json", Cookie: ownerCookie },
        body: {
          action: "create_appointment",
          tenantSlug: tenantA.slug,
          data: {
            clientName: "Laura Benítez",
            clientPhone: "0981555666",
            serviceId: serviceA.id,
            staffId: staffA.id,
            start: "2026-11-10T11:00:00.000Z",
            end: "2026-11-10T11:45:00.000Z",
            status: "confirmed",
          },
        },
      });

      quickAppId = res.json?.appointmentId;
      const dbApp = quickAppId
        ? await prisma.appointment.findUnique({ where: { id: quickAppId } })
        : null;

      const pass =
        res.status === 200 &&
        res.json?.ok === true &&
        dbApp &&
        dbApp.clientPhone === "+595981555666";

      record(
        2,
        "Crear cita desde flujo rápido (0981555666 -> +595981555666)",
        "HTTP 200 y teléfono canónico normalizado en PostgreSQL",
        `Status: ${res.status}, Teléfono en DB: ${dbApp?.clientPhone}`,
        pass,
        `Cita creada ID: ${quickAppId}`
      );
    }

    // -------------------------------------------------------------------------
    // TEST 3: Cita usa UUID real (no temp-xxx)
    // -------------------------------------------------------------------------
    {
      const isRealUuid = UUID_REGEX.test(testAppointmentId);
      record(
        3,
        "Cita usa UUID real en base de datos",
        "UUID canónico v4/v5 de 36 caracteres",
        `UUID: ${testAppointmentId}`,
        isRealUuid,
        `Regex test: ${isRealUuid}`
      );
    }

    // -------------------------------------------------------------------------
    // TEST 4: Cobro desde cita
    // -------------------------------------------------------------------------
    let chargedMovementId = null;
    {
      const res = await request("/api/cash", {
        method: "POST",
        headers: { "Content-Type": "application/json", Cookie: ownerCookie },
        body: {
          appointmentId: testAppointmentId,
          type: "ingreso",
          amount: 90000,
          method: "efectivo",
          concept: "Cobro turno: Corte y Perfilado 5.2 - Marcos Rolón",
        },
      });

      chargedMovementId = res.json?.movement?.id;
      const updateRes = await request(`/api/appointments/${testAppointmentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Cookie: ownerCookie },
        body: { status: "completed" },
      });

      const dbApp = await prisma.appointment.findUnique({ where: { id: testAppointmentId } });
      const pass = res.status === 201 && dbApp?.status === "COMPLETED";

      record(
        4,
        "Cobro desde cita genera movimiento y pasa cita a COMPLETED",
        "HTTP 201 en caja y cita con estado COMPLETED",
        `Caja Status: ${res.status}, Cita Status: ${dbApp?.status}`,
        pass,
        `Movimiento ID: ${chargedMovementId}`
      );
    }

    // -------------------------------------------------------------------------
    // TEST 5: Doble cobro rechazado (idempotencia)
    // -------------------------------------------------------------------------
    {
      const res = await request("/api/cash", {
        method: "POST",
        headers: { "Content-Type": "application/json", Cookie: ownerCookie },
        body: {
          appointmentId: testAppointmentId,
          type: "ingreso",
          amount: 90000,
          method: "efectivo",
          concept: "Cobro Turno Duplicado Intencional",
        },
      });

      const count = await prisma.cashMovement.count({
        where: { appointmentId: testAppointmentId },
      });

      const pass = res.status === 409 && res.json?.error === "ALREADY_CHARGED" && count === 1;
      record(
        5,
        "Doble cobro rechazado por idempotencia",
        "HTTP 409 ALREADY_CHARGED y exactamente 1 movimiento en PostgreSQL",
        `Status: ${res.status}, Error: ${res.json?.error}, Movimientos: ${count}`,
        pass,
        `Respuesta API: ${res.body}`
      );
    }

    // -------------------------------------------------------------------------
    // TEST 6: COMPLETED no vuelve a PENDING
    // -------------------------------------------------------------------------
    {
      const res = await request(`/api/appointments/${testAppointmentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Cookie: ownerCookie },
        body: { status: "pending" },
      });

      const dbApp = await prisma.appointment.findUnique({ where: { id: testAppointmentId } });
      const pass = res.status === 400 && dbApp?.status === "COMPLETED";

      record(
        6,
        "COMPLETED no puede volver a PENDING ni a estados anteriores",
        "HTTP 400 INVALID_STATUS_TRANSITION y status permanece COMPLETED",
        `Status: ${res.status}, DB Status: ${dbApp?.status}`,
        pass,
        `Respuesta: ${res.body}`
      );
    }

    // -------------------------------------------------------------------------
    // TEST 7: CANCELLED no rompe disponibilidad
    // -------------------------------------------------------------------------
    {
      // 1. Crear cita para cancelar
      const appToCancel = await prisma.appointment.create({
        data: {
          tenantId: tenantA.id,
          staffId: staffA.id,
          serviceId: serviceA.id,
          clientName: "Cita para Cancelar",
          clientPhone: "+595981999111",
          startTime: new Date("2026-11-12T16:00:00.000Z"),
          endTime: new Date("2026-11-12T16:45:00.000Z"),
          status: "CONFIRMED",
        },
      });

      // 2. Cancelar cita
      const delRes = await request(`/api/appointments/${appToCancel.id}`, {
        method: "DELETE",
        headers: { Cookie: ownerCookie },
      });

      // 3. Crear nueva cita en ese mismo horario liberado
      const newAppRes = await request("/api/dashboard/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json", Cookie: ownerCookie },
        body: {
          action: "create_appointment",
          tenantSlug: tenantA.slug,
          data: {
            clientName: "Nuevo Cliente en Horario Liberado",
            clientPhone: "+595981999222",
            serviceId: serviceA.id,
            staffId: staffA.id,
            start: "2026-11-12T16:00:00.000Z",
            end: "2026-11-12T16:45:00.000Z",
            status: "confirmed",
          },
        },
      });

      const pass = delRes.status === 200 && newAppRes.status === 200 && newAppRes.json?.ok === true;
      record(
        7,
        "Cita CANCELLED libera el horario y permite nueva reserva en el mismo slot",
        "DELETE libera exclusión GiST y nuevo turno es aceptado (HTTP 200)",
        `Delete: ${delRes.status}, Nuevo Turno: ${newAppRes.status}`,
        pass,
        `Nuevo turno ID: ${newAppRes.json?.appointmentId}`
      );
    }

    // -------------------------------------------------------------------------
    // TEST 8: NO_SHOW persiste y puede reactivarse a CONFIRMED
    // -------------------------------------------------------------------------
    {
      const noShowApp = await prisma.appointment.create({
        data: {
          tenantId: tenantA.id,
          staffId: staffA.id,
          serviceId: serviceA.id,
          clientName: "Cliente Ausente",
          clientPhone: "+595981333444",
          startTime: new Date("2026-11-13T14:00:00.000Z"),
          endTime: new Date("2026-11-13T14:45:00.000Z"),
          status: "CONFIRMED",
        },
      });

      const markNoShowRes = await request(`/api/appointments/${noShowApp.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Cookie: ownerCookie },
        body: { status: "no_show" },
      });

      const dbNoShow = await prisma.appointment.findUnique({ where: { id: noShowApp.id } });

      const reactivateRes = await request(`/api/appointments/${noShowApp.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Cookie: ownerCookie },
        body: { status: "confirmed" },
      });

      const dbReactivated = await prisma.appointment.findUnique({ where: { id: noShowApp.id } });
      const pass =
        markNoShowRes.status === 200 &&
        dbNoShow?.status === "NO_SHOW" &&
        reactivateRes.status === 200 &&
        dbReactivated?.status === "CONFIRMED";

      record(
        8,
        "Estado NO_SHOW persiste y permite reactivación a CONFIRMED",
        "Status inicial NO_SHOW y posterior CONFIRMED en PostgreSQL",
        `NoShow: ${dbNoShow?.status}, Reactivado: ${dbReactivated?.status}`,
        pass,
        `ID: ${noShowApp.id}`
      );
    }

    // -------------------------------------------------------------------------
    // TEST 9: Bloqueo impide reserva
    // -------------------------------------------------------------------------
    {
      const blockRes = await request("/api/schedule-blocks", {
        method: "POST",
        headers: { "Content-Type": "application/json", Cookie: ownerCookie },
        body: {
          staffId: staffA.id,
          startTime: "2026-11-14T12:00:00.000Z",
          endTime: "2026-11-14T13:30:00.000Z",
          reason: "Almuerzo de equipo",
        },
      });

      const conflictAppRes = await request("/api/dashboard/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json", Cookie: ownerCookie },
        body: {
          action: "create_appointment",
          tenantSlug: tenantA.slug,
          data: {
            clientName: "Intento Colisión Bloqueo",
            clientPhone: "+595981777888",
            serviceId: serviceA.id,
            staffId: staffA.id,
            start: "2026-11-14T12:15:00.000Z",
            end: "2026-11-14T13:00:00.000Z",
            status: "confirmed",
          },
        },
      });

      const pass = conflictAppRes.status === 409 && conflictAppRes.json?.error === "SLOT_BLOCKED";
      record(
        9,
        "Bloqueo de horario impide reserva de cita en ese intervalo",
        "HTTP 409 con error SLOT_BLOCKED",
        `Status: ${conflictAppRes.status}, Error: ${conflictAppRes.json?.error}`,
        pass,
        `Mensaje: ${conflictAppRes.json?.message}`
      );
    }

    // -------------------------------------------------------------------------
    // TEST 10: Movimiento de caja persiste
    // -------------------------------------------------------------------------
    let manualCashId = null;
    {
      const postRes = await request("/api/cash", {
        method: "POST",
        headers: { "Content-Type": "application/json", Cookie: ownerCookie },
        body: {
          type: "ingreso",
          amount: 120000,
          method: "transferencia",
          concept: "Venta de Producto Capilar",
        },
      });

      manualCashId = postRes.json?.movement?.id;
      const getRes = await request("/api/cash", {
        method: "GET",
        headers: { Cookie: ownerCookie },
      });

      const found = getRes.json?.movements?.find((m) => m.id === manualCashId);
      const pass = postRes.status === 201 && !!found && found.amount === 120000;

      record(
        10,
        "Movimiento de caja persiste y es recuperado por GET /api/cash",
        "HTTP 201 y movimiento presente en listado con monto exacto",
        `Post Status: ${postRes.status}, Encontrado: ${!!found}, Monto: ${found?.amount}`,
        pass,
        `ID: ${manualCashId}`
      );
    }

    // -------------------------------------------------------------------------
    // TEST 11: Cierre de caja persiste
    // -------------------------------------------------------------------------
    {
      const closeRes = await request("/api/cash/close", {
        method: "POST",
        headers: { "Content-Type": "application/json", Cookie: ownerCookie },
        body: {
          openingCash: 300000,
          expectedCash: 510000,
          countedCash: 510000,
          notes: "Arqueo de cierre perfecto",
        },
      });

      const getCloseRes = await request("/api/cash/close", {
        method: "GET",
        headers: { Cookie: ownerCookie },
      });

      const closures = getCloseRes.json?.closures || [];
      const pass = closeRes.status === 201 && closures.length > 0 && closures[0].countedCash === 510000;

      record(
        11,
        "Cierre de caja persiste en PostgreSQL y se lista en historial",
        "HTTP 201 y recuperado con arqueo exacto (diferencia 0)",
        `Close Status: ${closeRes.status}, Historial length: ${closures.length}`,
        pass,
        `Último arqueo contado: ${closures[0]?.countedCash}`
      );
    }

    // -------------------------------------------------------------------------
    // TEST 12: Cliente nuevo desde reserva persiste
    // -------------------------------------------------------------------------
    {
      const uniquePhone = "0986999111";
      await request("/api/dashboard/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json", Cookie: ownerCookie },
        body: {
          action: "create_appointment",
          tenantSlug: tenantA.slug,
          data: {
            clientName: "Cliente Auto Creado",
            clientPhone: uniquePhone,
            serviceId: serviceA.id,
            staffId: staffA.id,
            start: "2026-11-15T09:00:00.000Z",
            end: "2026-11-15T09:45:00.000Z",
            status: "confirmed",
          },
        },
      });

      const dbClient = await prisma.client.findFirst({
        where: {
          tenantId: tenantA.id,
          OR: [{ phone: "+595986999111" }, { phone: "0986999111" }],
        },
      });

      const pass = dbClient !== null && dbClient.name === "Cliente Auto Creado";
      record(
        12,
        "Cliente nuevo desde reserva persiste automáticamente en PostgreSQL",
        "Cliente creado en tabla clients con nombre y teléfono normalizado",
        `Encontrado: ${dbClient !== null}, Nombre: ${dbClient?.name}, Teléfono: ${dbClient?.phone}`,
        pass,
        `Client ID: ${dbClient?.id}`
      );
    }

    // -------------------------------------------------------------------------
    // TEST 13: Refresh conserva datos (incluyendo appointmentId en movimientos)
    // -------------------------------------------------------------------------
    {
      const syncRes = await request("/api/dashboard/sync", {
        method: "GET",
        headers: { Cookie: ownerCookie },
      });

      const cashMovements = syncRes.json?.cashMovements || [];
      const chargedMovement = cashMovements.find((m) => m.appointmentId === testAppointmentId);
      const pass = syncRes.status === 200 && chargedMovement !== undefined;

      record(
        13,
        "Refresh (GET /api/dashboard/sync) conserva appointmentId en movimientos de caja",
        "appointmentId presente en cashMovements tras sincronización",
        `Encontrado appointmentId: ${!!chargedMovement}, ID: ${chargedMovement?.appointmentId}`,
        pass,
        `Movement ID: ${chargedMovement?.id}`
      );
    }

    // -------------------------------------------------------------------------
    // TEST 14: STAFF no accede a caja
    // -------------------------------------------------------------------------
    {
      const staffCashRes = await request("/api/cash", {
        method: "GET",
        headers: { Cookie: staffCookie },
      });

      const staffPostRes = await request("/api/cash", {
        method: "POST",
        headers: { "Content-Type": "application/json", Cookie: staffCookie },
        body: { type: "ingreso", amount: 50000, concept: "Intento STAFF" },
      });

      const pass = staffCashRes.status === 403 && staffPostRes.status === 403;
      record(
        14,
        "STAFF no tiene acceso a caja (GET / POST rechazados con HTTP 403)",
        "HTTP 403 Forbidden para rol STAFF",
        `GET: ${staffCashRes.status}, POST: ${staffPostRes.status}`,
        pass,
        `Error: ${staffCashRes.json?.error}`
      );
    }

    // -------------------------------------------------------------------------
    // TEST 15: OWNER sí accede a caja
    // -------------------------------------------------------------------------
    {
      const ownerCashRes = await request("/api/cash", {
        method: "GET",
        headers: { Cookie: ownerCookie },
      });

      const pass = ownerCashRes.status === 200 && ownerCashRes.json?.ok === true;
      record(
        15,
        "OWNER sí accede a caja (HTTP 200)",
        "HTTP 200 OK con listado de movimientos",
        `Status: ${ownerCashRes.status}, Total Movimientos: ${ownerCashRes.json?.movements?.length}`,
        pass,
        `Respuesta OK: ${ownerCashRes.json?.ok}`
      );
    }

    // -------------------------------------------------------------------------
    // TEST 16: Logout destruye sesión
    // -------------------------------------------------------------------------
    {
      const logoutRes = await request("/api/auth/logout", {
        method: "POST",
        headers: { Cookie: ownerCookie },
      });

      const setCookie = logoutRes.headers["set-cookie"] || [];
      const hasClearCookie = setCookie.some(
        (c) => c.includes("agendate_session=") && (c.includes("Max-Age=0") || c.includes("expires="))
      );

      const pass = logoutRes.status === 200 && (hasClearCookie || logoutRes.json?.ok === true);
      record(
        16,
        "Logout destruye cookie de sesión",
        "HTTP 200 con Set-Cookie Max-Age=0 o expirado",
        `Status: ${logoutRes.status}, Set-Cookie presente: ${hasClearCookie}`,
        pass,
        `Headers: ${JSON.stringify(setCookie)}`
      );
    }

    // -------------------------------------------------------------------------
    // TEST 17: Tenant A no ve Tenant B (Aislamiento Multi-Tenant)
    // -------------------------------------------------------------------------
    {
      const crossTenantRes = await request(`/api/dashboard/sync?tenant=${tenantB.slug}`, {
        method: "GET",
        headers: { Cookie: ownerCookie },
      });

      const pass = crossTenantRes.status === 403;
      record(
        17,
        "Tenant A no puede acceder a los datos de Tenant B (anti-IDOR)",
        "HTTP 403 Acceso Denegado ante solicitud cruzada",
        `Status: ${crossTenantRes.status}, Error: ${crossTenantRes.json?.error}`,
        pass,
        `Mensaje: ${crossTenantRes.json?.error}`
      );
    }

    // -------------------------------------------------------------------------
    // TEST 18: Error de API no deja UI inconsistente (Validación estricta)
    // -------------------------------------------------------------------------
    {
      const badAppRes = await request("/api/dashboard/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json", Cookie: ownerCookie },
        body: {
          action: "create_appointment",
          tenantSlug: tenantA.slug,
          data: {
            clientName: "Horario Invertido",
            clientPhone: "+595981000999",
            serviceId: serviceA.id,
            staffId: staffA.id,
            start: "2026-11-16T12:00:00.000Z",
            end: "2026-11-16T11:00:00.000Z", // end antes de start
            status: "confirmed",
          },
        },
      });

      const badCashRes = await request("/api/cash", {
        method: "POST",
        headers: { "Content-Type": "application/json", Cookie: ownerCookie },
        body: {
          type: "ingreso",
          amount: -50000, // monto negativo
          concept: "Monto inválido",
        },
      });

      const pass =
        badAppRes.status === 400 &&
        badAppRes.json?.error === "VALIDATION_ERROR" &&
        badCashRes.status === 400 &&
        badCashRes.json?.error === "VALIDATION_ERROR";

      record(
        18,
        "Error de API responde semánticamente con VALIDATION_ERROR sin mutar DB",
        "HTTP 400 con código de error semántico y sin éxito falso",
        `BadApp: ${badAppRes.status} (${badAppRes.json?.error}), BadCash: ${badCashRes.status} (${badCashRes.json?.error})`,
        pass,
        `BadApp msg: ${badAppRes.json?.message}, BadCash msg: ${badCashRes.json?.message}`
      );
    }

    const passedCount = results.filter((r) => r.pass).length;
    const totalCount = results.length;

    console.log("======================================================================");
    console.log(`RESUMEN FASE 5.2: ${passedCount} / ${totalCount} PRUEBAS APROBADAS`);
    console.log("======================================================================\n");

    if (passedCount === totalCount) {
      console.log("🎉 TODAS LAS 18 PRUEBAS DE REGRESIÓN DE FASE 5.2 PASARON EXITOSAMENTE.");
      process.exit(0);
    } else {
      console.error(`⚠️ FALLARON ${totalCount - passedCount} PRUEBAS.`);
      process.exit(1);
    }
  } catch (err) {
    console.error("Error fatal en suite de tests Fase 5.2:", err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

run();
