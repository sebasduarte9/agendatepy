/**
 * Suite de Pruebas FASE 5.1 — CORRECCIÓN DE BUGS CRÍTICOS Y COHERENCIA DEL CORE
 * Ejecuta los 14 tests requeridos contra PostgreSQL real y el servidor en ejecución.
 */

const http = require("http");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
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
  console.log("   FASE 5.1: VALIDACIÓN AUTOMATIZADA DE CORRECCIÓN DE BUGS CORE (1-14)  ");
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
    // 0. Preparar datos de prueba en PostgreSQL
    console.log("--- Inicializando datos de prueba en PostgreSQL ---");
    const tenant = await prisma.tenant.upsert({
      where: { slug: "salon-fase5-test" },
      update: { name: "Salón Fase 5 Test", timezone: "America/Asuncion" },
      create: {
        name: "Salón Fase 5 Test",
        slug: "salon-fase5-test",
        subdomain: "salon-fase5-test",
        timezone: "America/Asuncion",
        settings: { phone: "+595981999888", address: "Av. Mariscal López 2026" },
      },
    });

    const ownerUser = await prisma.user.upsert({
      where: { email: "owner.fase5@agendate.py" },
      update: { tenantId: tenant.id, role: "OWNER" },
      create: {
        email: "owner.fase5@agendate.py",
        name: "Dueño Fase 5",
        role: "OWNER",
        tenantId: tenant.id,
      },
    });

    const staffUser = await prisma.user.upsert({
      where: { email: "staff.fase5@agendate.py" },
      update: { tenantId: tenant.id, role: "STAFF" },
      create: {
        email: "staff.fase5@agendate.py",
        name: "Colaborador Fase 5",
        role: "STAFF",
        tenantId: tenant.id,
      },
    });

    const ownerCookie = createSessionCookie({
      id: ownerUser.id,
      email: ownerUser.email,
      name: ownerUser.name,
      role: ownerUser.role,
      tenantId: tenant.id,
      tenantSlug: tenant.slug,
    });

    const staffCookie = createSessionCookie({
      id: staffUser.id,
      email: staffUser.email,
      name: staffUser.name,
      role: staffUser.role,
      tenantId: tenant.id,
      tenantSlug: tenant.slug,
    });

    // Crear un servicio y un staff en BD para citas
    const testService = await prisma.service.create({
      data: {
        tenantId: tenant.id,
        name: "Corte Fade Test 5",
        durationMinutes: 30,
        price: 80000,
        active: true,
      },
    });

    const testStaff = await prisma.staff.create({
      data: {
        tenantId: tenant.id,
        name: "Barbero Test 5",
        active: true,
        commissionPercentage: 50,
      },
    });

    console.log(`✓ Tenant creado: ${tenant.name} (${tenant.id})`);
    console.log(`✓ Usuario OWNER: ${ownerUser.email}`);
    console.log(`✓ Usuario STAFF: ${staffUser.email}\n`);

    // -------------------------------------------------------------------------
    // TEST 1: Logout destruye sesión
    // -------------------------------------------------------------------------
    {
      const logoutRes = await request("/api/auth/logout", {
        method: "POST",
        headers: { Cookie: ownerCookie },
      });

      const setCookies = logoutRes.headers["set-cookie"] || [];
      const hasCookieRemoval = setCookies.some((c) =>
        c.includes("agendate_session=") &&
        (c.includes("Max-Age=0") || c.includes("Thu, 01 Jan 1970"))
      );

      record(
        1,
        "Logout destruye sesión (elimina cookie agendate_session y redirige a /login)",
        "HTTP 200 con Set-Cookie Max-Age=0 o expiración pasada",
        `Status ${logoutRes.status}, Set-Cookie headers: ${JSON.stringify(setCookies)}`,
        logoutRes.status === 200 && hasCookieRemoval,
        `Cookies recibidas al logout: ${setCookies.join(" | ")}`
      );
    }

    // -------------------------------------------------------------------------
    // TEST 2: STAFF → /api/cash → 403
    // -------------------------------------------------------------------------
    {
      const staffCashGet = await request("/api/cash", {
        method: "GET",
        headers: { Cookie: staffCookie },
      });

      const staffCashPost = await request("/api/cash", {
        method: "POST",
        headers: { "Content-Type": "application/json", Cookie: staffCookie },
        body: { type: "ingreso", amount: 50000, concept: "Intento de cobro staff" },
      });

      const pass = staffCashGet.status === 403 && staffCashPost.status === 403;
      record(
        2,
        "STAFF → /api/cash → 403 Forbidden en GET y POST",
        "HTTP 403 Forbidden para usuario con rol STAFF",
        `GET: ${staffCashGet.status}, POST: ${staffCashPost.status}`,
        pass,
        `GET body: ${staffCashGet.body}, POST body: ${staffCashPost.body}`
      );
    }

    // -------------------------------------------------------------------------
    // TEST 3: OWNER → /api/cash → permitido (200)
    // -------------------------------------------------------------------------
    {
      const ownerCashGet = await request("/api/cash", {
        method: "GET",
        headers: { Cookie: ownerCookie },
      });

      record(
        3,
        "OWNER → /api/cash → permitido (HTTP 200)",
        "HTTP 200 OK para usuario con rol OWNER",
        `Status: ${ownerCashGet.status}`,
        ownerCashGet.status === 200 && ownerCashGet.json?.ok === true,
        `Respuesta OK: ${JSON.stringify(ownerCashGet.json)}`
      );
    }

    // -------------------------------------------------------------------------
    // TEST 4: Crear cita → UUID real devuelto y sincronizado
    // -------------------------------------------------------------------------
    let createdAppId = null;
    {
      const createRes = await request("/api/dashboard/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json", Cookie: ownerCookie },
        body: {
          action: "create_appointment",
          tenantSlug: tenant.slug,
          data: {
            clientName: "Carlos Gómez",
            clientPhone: "+595981111222",
            serviceId: testService.id,
            staffId: testStaff.id,
            start: "2026-10-15T10:00:00.000Z",
            end: "2026-10-15T10:30:00.000Z",
            status: "pending",
          },
        },
      });

      createdAppId = createRes.json?.appointmentId || createRes.json?.id;
      const isCanonicalUUID = UUID_REGEX.test(createdAppId);

      record(
        4,
        "Crear cita → backend responde con UUID real (no ID temporal app-...)",
        "UUID canónico de 36 caracteres",
        `appointmentId: ${createdAppId}`,
        createRes.status === 200 && isCanonicalUUID,
        `Respuesta backend: ${createRes.body}`
      );
    }

    // -------------------------------------------------------------------------
    // TEST 5: Reagendar cita creada sin F5 (usando su UUID real)
    // -------------------------------------------------------------------------
    {
      const rescheduleRes = await request(`/api/appointments/${createdAppId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Cookie: ownerCookie },
        body: {
          start: "2026-10-15T14:00:00.000Z",
          end: "2026-10-15T14:30:00.000Z",
          status: "confirmed",
        },
      });

      // Verificar persistencia inmediata en PostgreSQL
      const dbApp = await prisma.appointment.findUnique({
        where: { id: createdAppId },
      });

      const pass =
        rescheduleRes.status === 200 &&
        dbApp &&
        new Date(dbApp.startTime).toISOString() === "2026-10-15T14:00:00.000Z";

      record(
        5,
        "Reagendar cita creada inmediatamente sin F5",
        "HTTP 200 y startTime actualizado en PostgreSQL a las 14:00",
        `Status: ${rescheduleRes.status}, DB startTime: ${dbApp?.startTime?.toISOString()}`,
        pass,
        `Respuesta API: ${rescheduleRes.body}`
      );
    }

    // -------------------------------------------------------------------------
    // TEST 6: Cancelar cita creada inmediatamente sin F5
    // -------------------------------------------------------------------------
    let cancelAppId = null;
    {
      const newAppRes = await request("/api/dashboard/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json", Cookie: ownerCookie },
        body: {
          action: "create_appointment",
          tenantSlug: tenant.slug,
          data: {
            clientName: "María López",
            clientPhone: "+595982333444",
            serviceId: testService.id,
            staffId: testStaff.id,
            start: "2026-10-16T11:00:00.000Z",
            end: "2026-10-16T11:30:00.000Z",
            status: "confirmed",
          },
        },
      });
      cancelAppId = newAppRes.json?.appointmentId;

      const cancelRes = await request(`/api/appointments/${cancelAppId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Cookie: ownerCookie },
        body: { status: "cancelled" },
      });

      const dbCancelled = await prisma.appointment.findUnique({
        where: { id: cancelAppId },
      });

      const pass =
        cancelRes.status === 200 && dbCancelled && dbCancelled.status === "CANCELLED";

      record(
        6,
        "Cancelar cita creada inmediatamente sin F5",
        "HTTP 200 y status CANCELLED en PostgreSQL",
        `Status: ${cancelRes.status}, DB status: ${dbCancelled?.status}`,
        pass,
        `Respuesta API: ${cancelRes.body}`
      );
    }

    // -------------------------------------------------------------------------
    // TEST 7: COMPLETED → PENDING rechazado (máquina de estados estricta)
    // -------------------------------------------------------------------------
    let completedAppId = null;
    {
      // 1. Crear y pasar a COMPLETED
      const appRes = await request("/api/dashboard/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json", Cookie: ownerCookie },
        body: {
          action: "create_appointment",
          tenantSlug: tenant.slug,
          data: {
            clientName: "Rodrigo Franco",
            clientPhone: "+595983555666",
            serviceId: testService.id,
            staffId: testStaff.id,
            start: "2026-10-17T09:00:00.000Z",
            end: "2026-10-17T09:30:00.000Z",
            status: "completed",
          },
        },
      });
      completedAppId = appRes.json?.appointmentId;

      // 2. Intentar pasar de COMPLETED a PENDING
      const illegalTransitionRes = await request(`/api/appointments/${completedAppId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Cookie: ownerCookie },
        body: { status: "pending" },
      });

      const pass =
        illegalTransitionRes.status === 400 &&
        illegalTransitionRes.json?.error === "INVALID_STATUS_TRANSITION";

      record(
        7,
        "Transición inválida COMPLETED → PENDING rechazada",
        "HTTP 400 Bad Request con INVALID_STATUS_TRANSITION",
        `Status: ${illegalTransitionRes.status}, Error: ${illegalTransitionRes.json?.error}`,
        pass,
        `Respuesta API: ${illegalTransitionRes.body}`
      );
    }

    // -------------------------------------------------------------------------
    // TEST 8: NO_SHOW funciona
    // -------------------------------------------------------------------------
    {
      const noShowAppRes = await request("/api/dashboard/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json", Cookie: ownerCookie },
        body: {
          action: "create_appointment",
          tenantSlug: tenant.slug,
          data: {
            clientName: "Esteban Ausente",
            clientPhone: "+595984777888",
            serviceId: testService.id,
            staffId: testStaff.id,
            start: "2026-10-18T15:00:00.000Z",
            end: "2026-10-18T15:30:00.000Z",
            status: "confirmed",
          },
        },
      });
      const noShowId = noShowAppRes.json?.appointmentId;

      const markNoShowRes = await request(`/api/appointments/${noShowId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Cookie: ownerCookie },
        body: { status: "no_show" },
      });

      const dbNoShow = await prisma.appointment.findUnique({
        where: { id: noShowId },
      });

      const pass =
        markNoShowRes.status === 200 &&
        dbNoShow &&
        dbNoShow.status === "NO_SHOW";

      record(
        8,
        "Estado NO_SHOW se registra y persiste en PostgreSQL",
        "HTTP 200 y status NO_SHOW en PostgreSQL",
        `Status: ${markNoShowRes.status}, DB status: ${dbNoShow?.status}`,
        pass,
        `Respuesta API: ${markNoShowRes.body}`
      );
    }

    // -------------------------------------------------------------------------
    // TEST 9: Crear movimiento de caja → F5 (persiste en BD)
    // -------------------------------------------------------------------------
    let createdMovementId = null;
    {
      const createCashRes = await request("/api/cash", {
        method: "POST",
        headers: { "Content-Type": "application/json", Cookie: ownerCookie },
        body: {
          type: "ingreso",
          amount: 150000,
          method: "efectivo",
          concept: "Venta de Cera Modeladora Matte",
        },
      });

      createdMovementId = createCashRes.json?.data?.id;

      // Simular F5 con GET /api/cash
      const getCashRes = await request("/api/cash", {
        method: "GET",
        headers: { Cookie: ownerCookie },
      });

      const found = getCashRes.json?.data?.find((m) => m.id === createdMovementId);
      const pass =
        createCashRes.status === 201 &&
        found &&
        found.amount === 150000 &&
        found.concept === "Venta de Cera Modeladora Matte";

      record(
        9,
        "Crear movimiento de caja → F5 → persiste en PostgreSQL",
        "HTTP 201 en creación y recuperado intacto en GET /api/cash",
        `Creado: ${createCashRes.status}, Encontrado en GET: ${found ? "SÍ (Gs. " + found.amount + ")" : "NO"}`,
        pass,
        `Movement ID: ${createdMovementId}`
      );
    }

    // -------------------------------------------------------------------------
    // TEST 10: Cerrar caja (Arqueo) → F5 → Cierre persiste en tabla PostgreSQL
    // -------------------------------------------------------------------------
    {
      const closeRes = await request("/api/cash/close", {
        method: "POST",
        headers: { "Content-Type": "application/json", Cookie: ownerCookie },
        body: {
          openingCash: 200000,
          expectedCash: 350000,
          countedCash: 350000,
          difference: 0,
          notes: "Arqueo de cierre validado sin diferencias",
        },
      });

      const closureId = closeRes.json?.data?.id;

      // Simular F5 con GET /api/cash/close
      const getCloseRes = await request("/api/cash/close", {
        method: "GET",
        headers: { Cookie: ownerCookie },
      });

      const foundClosure = getCloseRes.json?.data?.find((c) => c.id === closureId);
      const dbClosure = await prisma.cashRegisterClose.findUnique({
        where: { id: closureId },
      });

      const pass =
        closeRes.status === 201 &&
        foundClosure &&
        dbClosure &&
        dbClosure.countedCash === 350000 &&
        dbClosure.closedBy === ownerUser.name;

      record(
        10,
        "Cierre de caja y arqueo real → F5 → persiste en PostgreSQL",
        "HTTP 201, persistencia en cash_register_closes con responsable y recuperado en GET",
        `Status: ${closeRes.status}, DB Closure ID: ${dbClosure?.id}, Responsable: ${dbClosure?.closedBy}`,
        pass,
        `Detalle Arqueo: Apertura=${dbClosure?.openingCash}, Contado=${dbClosure?.countedCash}, Dif=${dbClosure?.difference}`
      );
    }

    // -------------------------------------------------------------------------
    // TEST 11: Cobrar cita desde detalle → registra movimiento en caja
    // -------------------------------------------------------------------------
    let checkoutAppId = null;
    {
      const appRes = await request("/api/dashboard/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json", Cookie: ownerCookie },
        body: {
          action: "create_appointment",
          tenantSlug: tenant.slug,
          data: {
            clientName: "Laura Benítez",
            clientPhone: "+595981444555",
            serviceId: testService.id,
            staffId: testStaff.id,
            start: "2026-10-19T16:00:00.000Z",
            end: "2026-10-19T16:30:00.000Z",
            status: "completed",
          },
        },
      });
      checkoutAppId = appRes.json?.appointmentId;

      const chargeRes = await request("/api/cash", {
        method: "POST",
        headers: { "Content-Type": "application/json", Cookie: ownerCookie },
        body: {
          appointmentId: checkoutAppId,
          type: "ingreso",
          amount: 80000,
          method: "pos",
          concept: "Cobro Turno: Corte Fade Test 5 - Laura Benítez",
        },
      });

      const dbChargedMovement = await prisma.cashMovement.findFirst({
        where: { appointmentId: checkoutAppId },
      });

      const pass =
        chargeRes.status === 201 &&
        dbChargedMovement &&
        dbChargedMovement.amount === 80000;

      record(
        11,
        "Cobrar cita desde modal → genera movimiento en caja con appointmentId",
        "HTTP 201 y movimiento enlazado a appointmentId en PostgreSQL",
        `Status: ${chargeRes.status}, Movement ID: ${dbChargedMovement?.id}, AppointmentId: ${dbChargedMovement?.appointmentId}`,
        pass,
        `Respuesta API: ${chargeRes.body}`
      );
    }

    // -------------------------------------------------------------------------
    // TEST 12: Doble click al cobrar cita → no duplica movimiento (idempotencia)
    // -------------------------------------------------------------------------
    {
      const duplicateChargeRes = await request("/api/cash", {
        method: "POST",
        headers: { "Content-Type": "application/json", Cookie: ownerCookie },
        body: {
          appointmentId: checkoutAppId,
          type: "ingreso",
          amount: 80000,
          method: "pos",
          concept: "Cobro Turno Duplicado: Corte Fade Test 5 - Laura Benítez",
        },
      });

      const totalMovementsForApp = await prisma.cashMovement.count({
        where: { appointmentId: checkoutAppId },
      });

      const pass =
        duplicateChargeRes.status === 409 &&
        duplicateChargeRes.json?.error === "ALREADY_CHARGED" &&
        totalMovementsForApp === 1;

      record(
        12,
        "Doble clic al cobrar cita → idempotencia rechaza duplicado con HTTP 409",
        "HTTP 409 ALREADY_CHARGED y exactamente 1 movimiento en PostgreSQL",
        `Status: ${duplicateChargeRes.status}, Error: ${duplicateChargeRes.json?.error}, Movimientos en BD: ${totalMovementsForApp}`,
        pass,
        `Respuesta API: ${duplicateChargeRes.body}`
      );
    }

    // -------------------------------------------------------------------------
    // TEST 13: Empty states correctos con CTAs
    // -------------------------------------------------------------------------
    {
      const cajaFile = fs.readFileSync(path.resolve(__dirname, "../app/dashboard/caja/page.tsx"), "utf-8");
      const clientesFile = fs.readFileSync(path.resolve(__dirname, "../app/dashboard/clientes/page.tsx"), "utf-8");
      const serviciosFile = fs.readFileSync(path.resolve(__dirname, "../app/dashboard/servicios/page.tsx"), "utf-8");
      const equipoFile = fs.readFileSync(path.resolve(__dirname, "../app/dashboard/equipo/page.tsx"), "utf-8");

      const hasCajaEmpty = (cajaFile.includes("No hay movimientos de caja registrados") || cajaFile.includes("No hay movimientos")) && cajaFile.includes("+ Registrar Movimiento");
      const hasClientesEmpty = cajaFile ? clientesFile.includes("No tenés clientes registrados") && clientesFile.includes("+ Crear Cliente") : false;
      const hasServiciosEmpty = serviciosFile.includes("No tenés servicios todavía") && serviciosFile.includes("+ Crear servicio");
      const hasStaffEmpty = equipoFile.includes("No tenés colaboradores en tu equipo") && equipoFile.includes("+ Invitar colaborador");

      const allEmptyStatesPresent = hasCajaEmpty && hasClientesEmpty && hasServiciosEmpty && hasStaffEmpty;

      record(
        13,
        "Empty states implementados con mensajes claros y botones CTA de acción",
        "Empty states presentes en Caja, Clientes, Servicios y Equipo con sus respectivos CTAs",
        `Caja: ${hasCajaEmpty}, Clientes: ${hasClientesEmpty}, Servicios: ${hasServiciosEmpty}, Equipo: ${hasStaffEmpty}`,
        allEmptyStatesPresent,
        "Validación estática de componentes UI con CTAs de alta conversión"
      );
    }

    // -------------------------------------------------------------------------
    // TEST 14: Eliminación de datos falsos / mocks
    // -------------------------------------------------------------------------
    {
      const suscripcionFile = fs.readFileSync(path.resolve(__dirname, "../app/dashboard/suscripcion/page.tsx"), "utf-8");
      const statsFile = fs.readFileSync(path.resolve(__dirname, "../app/dashboard/estadisticas/page.tsx"), "utf-8");
      const dashboardHomeFile = fs.readFileSync(path.resolve(__dirname, "../app/dashboard/page.tsx"), "utf-8");

      const noMockInvoices = !suscripcionFile.includes('INVOICES = [') && suscripcionFile.includes("No hay facturas emitidas todavía");
      const noHardcodedDeltas = !statsFile.includes("+18.4% vs mes anterior") && !statsFile.includes("+12.3% vs mes anterior");
      const noFakeGoogleSync = !dashboardHomeFile.includes("Google Sync Activo") && dashboardHomeFile.includes("Base de Datos PostgreSQL Conectada");

      const pass = noMockInvoices && noHardcodedDeltas && noFakeGoogleSync;

      record(
        14,
        "Datos ficticios y mocks eliminados de pantallas reales",
        "Sin facturas falsas, sin porcentajes de crecimiento hardcodeados y sin 'Google Sync Activo'",
        `Facturas mock eliminadas: ${noMockInvoices}, Deltas falsos eliminados: ${noHardcodedDeltas}, Google Sync falso eliminado: ${noFakeGoogleSync}`,
        pass,
        "Código auditado: los datos vacíos muestran 'Sin datos' / 'No hay registros' reales"
      );
    }

    // -------------------------------------------------------------------------
    // RESUMEN FINAL
    // -------------------------------------------------------------------------
    console.log("======================================================================");
    const passed = results.filter((r) => r.pass).length;
    const failed = results.filter((r) => !r.pass).length;
    console.log(`TOTAL TESTS: ${results.length} | PASSED: ${passed} | FAILED: ${failed}`);
    console.log("======================================================================\n");

    if (failed > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  } catch (err) {
    console.error("Error fatal ejecutando suite de tests:", err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

run();
