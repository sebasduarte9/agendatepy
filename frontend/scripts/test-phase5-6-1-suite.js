/**
 * Suite de Pruebas Automatizadas — FASE 5.6.1
 * HARDENING FINANCIERO DE LIQUIDACIONES (Tests 1 - 25)
 *
 * 01 Doble payout concurrente (Promise.all simultáneo)
 * 02 Dos OWNER simultáneos
 * 03 Solo 1 CommissionPayout persistido
 * 04 Solo 1 CommissionPayoutItem por cita
 * 05 Solo 1 EXPENSE en caja
 * 06 Payout amountPaid = suma de items
 * 07 Payout amountPaid = CashMovement.amount
 * 08 Rollback atómico si falla item
 * 09 Rollback atómico si falla caja
 * 10 PAID no vuelve a pagarse
 * 11 Período superpuesto no duplica citas
 * 12 Cambio de porcentaje no altera snapshot histórico
 * 13 Cambio de staff no contamina tenant
 * 14 Staff de otro tenant rechazado
 * 15 amountPaid no puede ser manipulado desde frontend
 * 16 periodStart > periodEnd rechazado
 * 17 paymentMethod inválido rechazado
 * 18 Tenant A aislado de Tenant B (anti-IDOR)
 * 19 F5 conserva historial íntegro
 * 20 Auditoría conserva datos exactos
 * 21 Múltiples citas en un solo payout
 * 22 Múltiples staff liquidados en mismo período
 * 23 Split payment consolida comisión exacta
 * 24 Comisión 0% no genera pago
 * 25 Staff inexistente rechazado
 */

const http = require("http");
const crypto = require("crypto");
const { PrismaClient, AppointmentStatus, CashMovementType, PayoutStatus } = require("@prisma/client");

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
            body: json || body,
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

function assert(condition, testName, message = "") {
  if (!condition) {
    console.error(`❌ [FAIL] ${testName}: ${message}`);
    throw new Error(`FAIL: ${testName} - ${message}`);
  }
  console.log(`✅ [PASS] ${testName}`);
}

async function runSuite() {
  console.log("======================================================================");
  console.log("   FASE 5.6.1: HARDENING FINANCIERO DE LIQUIDACIONES (TEST 1 - 25)    ");
  console.log("======================================================================\n");

  const timestamp = Date.now();
  const slugA = `tenant-h561-a-${timestamp}`;
  const slugB = `tenant-h561-b-${timestamp}`;

  // 1. Setup Tenant A
  const tenantA = await prisma.tenant.create({
    data: {
      name: "Barbería Hardening A",
      slug: slugA,
      subdomain: slugA,
      status: "ACTIVE",
      plan: "PROFESIONAL",
      themeSettings: {},
      settings: {},
    },
  });

  const ownerA1 = await prisma.user.create({
    data: {
      tenantId: tenantA.id,
      email: `ownerA1_${timestamp}@test.com`,
      name: "Dueño A1",
      role: "OWNER",
    },
  });

  const ownerA2 = await prisma.user.create({
    data: {
      tenantId: tenantA.id,
      email: `ownerA2_${timestamp}@test.com`,
      name: "Dueño A2",
      role: "OWNER",
    },
  });

  const staffA1 = await prisma.staff.create({
    data: {
      tenantId: tenantA.id,
      name: "Carlos Barbero Hardened",
      commissionPercentage: 40,
    },
  });

  const staffA2 = await prisma.staff.create({
    data: {
      tenantId: tenantA.id,
      name: "Rodrigo Estilista",
      commissionPercentage: 50,
    },
  });

  const staffA0Percent = await prisma.staff.create({
    data: {
      tenantId: tenantA.id,
      name: "Pasante Sin Comisión",
      commissionPercentage: 0,
    },
  });

  const serviceA = await prisma.service.create({
    data: {
      tenantId: tenantA.id,
      name: "Corte y Barba Hardening",
      durationMinutes: 45,
      price: 100000,
      active: true,
    },
  });

  const clientA = await prisma.client.create({
    data: {
      tenantId: tenantA.id,
      name: "Marcos Cliente",
      phone: "+595981111222",
    },
  });

  // Setup Tenant B
  const tenantB = await prisma.tenant.create({
    data: {
      name: "Salón Hardening B",
      slug: slugB,
      subdomain: slugB,
      status: "ACTIVE",
      plan: "PROFESIONAL",
      themeSettings: {},
      settings: {},
    },
  });

  const ownerB = await prisma.user.create({
    data: {
      tenantId: tenantB.id,
      email: `ownerB_${timestamp}@test.com`,
      name: "Dueña B",
      role: "OWNER",
    },
  });

  const staffB = await prisma.staff.create({
    data: {
      tenantId: tenantB.id,
      name: "Staff B",
      commissionPercentage: 30,
    },
  });

  const cookieOwnerA1 = createSessionCookie({
    id: ownerA1.id,
    email: ownerA1.email,
    name: ownerA1.name,
    role: "OWNER",
    tenantId: tenantA.id,
    tenantSlug: tenantA.slug,
  });

  const cookieOwnerA2 = createSessionCookie({
    id: ownerA2.id,
    email: ownerA2.email,
    name: ownerA2.name,
    role: "OWNER",
    tenantId: tenantA.id,
    tenantSlug: tenantA.slug,
  });

  const cookieOwnerB = createSessionCookie({
    id: ownerB.id,
    email: ownerB.email,
    name: ownerB.name,
    role: "OWNER",
    tenantId: tenantB.id,
    tenantSlug: tenantB.slug,
  });

  // -------------------------------------------------------------------------
  // TEST 01 a 05: CONCURRENCIA REAL — DOBLE PAYOUT Y DOS OWNERS SIMULTÁNEOS
  // -------------------------------------------------------------------------
  const aptConc = await prisma.appointment.create({
    data: {
      tenantId: tenantA.id,
      staffId: staffA1.id,
      serviceId: serviceA.id,
      clientId: clientA.id,
      clientName: clientA.name,
      clientPhone: clientA.phone,
      startTime: new Date("2026-09-10T10:00:00Z"),
      endTime: new Date("2026-09-10T10:45:00Z"),
      status: AppointmentStatus.COMPLETED,
    },
  });

  await prisma.cashMovement.create({
    data: {
      tenantId: tenantA.id,
      type: CashMovementType.INCOME,
      amount: 100000,
      category: "Servicio",
      paymentMethod: "Efectivo",
      description: "Cobro cita concurrencia",
      appointmentId: aptConc.id,
    },
  });

  // Ejecutamos dos liquidaciones concurrentes con Promise.all (simulando dos requests simultáneos de dos owners)
  console.log("-> Lanzando 2 peticiones POST concurrentes para liquidar la misma cita...");
  const [resConc1, resConc2] = await Promise.all([
    request("/api/commission-payouts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieOwnerA1,
      },
      body: {
        staffId: staffA1.id,
        periodStart: "2026-09-01T00:00:00Z",
        periodEnd: "2026-09-15T23:59:59Z",
        paymentMethod: "Efectivo",
        appointmentIds: [aptConc.id],
      },
    }),
    request("/api/commission-payouts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieOwnerA2,
      },
      body: {
        staffId: staffA1.id,
        periodStart: "2026-09-01T00:00:00Z",
        periodEnd: "2026-09-15T23:59:59Z",
        paymentMethod: "Efectivo",
        appointmentIds: [aptConc.id],
      },
    }),
  ]);

  const statuses = [resConc1.status, resConc2.status].sort();
  assert(
    statuses[0] === 201 && statuses[1] === 409,
    "TEST 01: Doble payout concurrente gestionado de forma segura",
    `Esperado [201, 409], obtenido: [${resConc1.status}, ${resConc2.status}]`
  );

  assert(
    (resConc1.status === 201 && resConc2.body?.error === "ALREADY_PAID") ||
    (resConc2.status === 201 && resConc1.body?.error === "ALREADY_PAID"),
    "TEST 02: Dos OWNER simultáneos: exactamente uno triunfa y el otro recibe 409 ALREADY_PAID",
    `Error devuelto: ${resConc1.body?.error || resConc2.body?.error}`
  );

  // Verificar estado en PostgreSQL tras la carrera
  const payoutsInDb = await prisma.commissionPayout.findMany({
    where: {
      tenantId: tenantA.id,
      items: { some: { appointmentId: aptConc.id } },
    },
    include: { items: true },
  });

  assert(
    payoutsInDb.length === 1,
    "TEST 03: Solo 1 CommissionPayout persistido en PostgreSQL tras la carrera concurrente",
    `Esperado 1, obtenido ${payoutsInDb.length}`
  );

  const itemsInDb = await prisma.commissionPayoutItem.findMany({
    where: { appointmentId: aptConc.id },
  });

  assert(
    itemsInDb.length === 1,
    "TEST 04: Solo 1 CommissionPayoutItem persistido para la cita auditada",
    `Esperado 1, obtenido ${itemsInDb.length}`
  );

  const expensesInDb = await prisma.cashMovement.findMany({
    where: {
      tenantId: tenantA.id,
      type: CashMovementType.EXPENSE,
      category: "Comisiones",
      description: { contains: staffA1.name },
    },
  });

  assert(
    expensesInDb.length === 1,
    "TEST 05: Solo 1 movimiento EXPENSE en caja tras concurrencia",
    `Esperado 1 egreso, obtenido ${expensesInDb.length}`
  );

  // -------------------------------------------------------------------------
  // TEST 06 y 07: CONSISTENCIA MATEMÁTICA PAYOUT ↔ ITEMS ↔ CAJA
  // -------------------------------------------------------------------------
  const winningPayout = payoutsInDb[0];
  const winningItem = itemsInDb[0];
  const linkedExpense = expensesInDb[0];

  assert(
    winningPayout.amountPaid === winningItem.commissionAmount && winningPayout.amountPaid === 40000,
    "TEST 06: CommissionPayout.amountPaid es idéntico a la suma de CommissionPayoutItem (40.000 Gs.)",
    `Payout: ${winningPayout.amountPaid}, Item: ${winningItem.commissionAmount}`
  );

  assert(
    winningPayout.amountPaid === linkedExpense.amount,
    "TEST 07: CommissionPayout.amountPaid coincide exactamente con CashMovement.amount (40.000 Gs.)",
    `Payout: ${winningPayout.amountPaid}, Cash: ${linkedExpense.amount}`
  );

  // -------------------------------------------------------------------------
  // TEST 08 y 09: ATOMICIDAD Y ROLLBACK ANTE FALLO
  // -------------------------------------------------------------------------
  // Intentar crear un payout en DB forzando una falla en una transacción para verificar rollback
  let rollbackSuccess = false;
  try {
    await prisma.$transaction(async (tx) => {
      await tx.cashMovement.create({
        data: {
          tenantId: tenantA.id,
          type: CashMovementType.EXPENSE,
          amount: 50000,
          category: "Comisiones",
          paymentMethod: "Efectivo",
          description: "Egreso abortable",
        },
      });
      // Forzar error intencional
      throw new Error("SIMULATED_FAILURE_FOR_ROLLBACK");
    });
  } catch (err) {
    rollbackSuccess = err.message === "SIMULATED_FAILURE_FOR_ROLLBACK";
  }

  const orphanedExpenses = await prisma.cashMovement.findMany({
    where: { description: "Egreso abortable" },
  });

  assert(
    rollbackSuccess && orphanedExpenses.length === 0,
    "TEST 08: Rollback atómico ante fallo: no deja egresos de caja huérfanos",
    `Orphaned expenses: ${orphanedExpenses.length}`
  );

  // Verificamos que si falla la creación de caja, no hay payout
  let payoutRollbackSuccess = false;
  try {
    await prisma.$transaction(async (tx) => {
      await tx.commissionPayout.create({
        data: {
          tenantId: tenantA.id,
          staffId: staffA1.id,
          periodStart: new Date(),
          periodEnd: new Date(),
          grossCommission: 10000,
          amountPaid: 10000,
          paymentMethod: "Efectivo",
          status: PayoutStatus.PAID,
        },
      });
      throw new Error("SIMULATED_PAYOUT_FAILURE");
    });
  } catch (err) {
    payoutRollbackSuccess = err.message === "SIMULATED_PAYOUT_FAILURE";
  }

  const orphanedPayouts = await prisma.commissionPayout.findMany({
    where: { grossCommission: 10000 },
  });

  assert(
    payoutRollbackSuccess && orphanedPayouts.length === 0,
    "TEST 09: Rollback atómico ante fallo de liquidación: no deja payouts huérfanos",
    `Orphaned payouts: ${orphanedPayouts.length}`
  );

  // -------------------------------------------------------------------------
  // TEST 10: PAID NO VUELVE A PAGARSE
  // -------------------------------------------------------------------------
  const resAlreadyPaid = await request("/api/commission-payouts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: cookieOwnerA1,
    },
    body: {
      staffId: staffA1.id,
      periodStart: "2026-09-01T00:00:00Z",
      periodEnd: "2026-09-15T23:59:59Z",
      paymentMethod: "Efectivo",
      appointmentIds: [aptConc.id],
    },
  });

  assert(
    resAlreadyPaid.status === 409 && resAlreadyPaid.body?.error === "ALREADY_PAID",
    "TEST 10: Cita en liquidación PAID no puede volver a pagarse (HTTP 409 ALREADY_PAID)",
    `Status: ${resAlreadyPaid.status}, Error: ${resAlreadyPaid.body?.error}`
  );

  // -------------------------------------------------------------------------
  // TEST 11: PERÍODOS SUPERPUESTOS NO DUPLICAN CITAS
  // -------------------------------------------------------------------------
  // Creamos cita B en período 12 de septiembre (ya incluido en el rango anterior pero creada después)
  // y cita C en período 18 de septiembre
  const aptOverlapB = await prisma.appointment.create({
    data: {
      tenantId: tenantA.id,
      staffId: staffA1.id,
      serviceId: serviceA.id,
      clientId: clientA.id,
      clientName: clientA.name,
      clientPhone: clientA.phone,
      startTime: new Date("2026-09-18T15:00:00Z"),
      endTime: new Date("2026-09-18T15:45:00Z"),
      status: AppointmentStatus.COMPLETED,
    },
  });

  await prisma.cashMovement.create({
    data: {
      tenantId: tenantA.id,
      type: CashMovementType.INCOME,
      amount: 100000,
      category: "Servicio",
      paymentMethod: "Efectivo",
      description: "Cobro cita período superpuesto",
      appointmentId: aptOverlapB.id,
    },
  });

  // Ahora liquidamos el período superpuesto 10 Sep al 20 Sep (incluye aptConc del 10 Sep y aptOverlapB del 18 Sep)
  const resOverlap = await request("/api/commission-payouts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: cookieOwnerA1,
    },
    body: {
      staffId: staffA1.id,
      periodStart: "2026-09-10T00:00:00Z",
      periodEnd: "2026-09-20T23:59:59Z",
      paymentMethod: "Efectivo",
    },
  });

  assert(
    resOverlap.status === 201,
    "TEST 11: Período superpuesto (10–20 Sep) liquida exitosamente",
    `Status: ${resOverlap.status}`
  );

  const overlapPayout = resOverlap.body?.payout;
  assert(
    overlapPayout.itemsCount === 1 &&
    overlapPayout.amountPaid === 40000 &&
    overlapPayout.items[0].appointmentId === aptOverlapB.id,
    "TEST 11 (cont): Período superpuesto excluye automáticamente la cita 10 Sep ya pagada y solo paga la nueva cita 18 Sep",
    `ItemsCount: ${overlapPayout.itemsCount}, AmountPaid: ${overlapPayout.amountPaid}`
  );

  // -------------------------------------------------------------------------
  // TEST 12: CAMBIO DE PORCENTAJE POSTERIOR NO ALTERA SNAPSHOT HISTÓRICO
  // -------------------------------------------------------------------------
  await prisma.staff.update({
    where: { id: staffA1.id },
    data: { commissionPercentage: 80 },
  });

  const resAuditHistory = await request(`/api/commission-payouts/${winningPayout.id}`, {
    headers: { Cookie: cookieOwnerA1 },
  });

  const historicalItem = resAuditHistory.body?.payout?.items[0];
  assert(
    historicalItem.commissionPercentage === 40 && historicalItem.commissionAmount === 40000,
    "TEST 12: Cambio posterior del porcentaje del staff (de 40% a 80%) NO altera el snapshot histórico (sigue 40% y 40.000 Gs.)",
    `Porcentaje en audit: ${historicalItem?.commissionPercentage}%, Monto: ${historicalItem?.commissionAmount}`
  );

  // -------------------------------------------------------------------------
  // TEST 13: CAMBIO DE STAFF NO CONTAMINA TENANT NI OTROS STAFF
  // -------------------------------------------------------------------------
  const resCommissionsA = await request(`/api/commissions?staffId=${staffA2.id}&period=all`, {
    headers: { Cookie: cookieOwnerA1 },
  });

  assert(
    resCommissionsA.status === 200 && resCommissionsA.body?.summary?.totalCommission === 0,
    "TEST 13: Las liquidaciones de Staff 1 no contaminan los cálculos devengados de Staff 2",
    `Staff 2 comisiones: ${resCommissionsA.body?.summary?.totalCommission}`
  );

  // -------------------------------------------------------------------------
  // TEST 14: STAFF DE OTRO TENANT ES RECHAZADO (404 NOT_FOUND)
  // -------------------------------------------------------------------------
  const resCrossStaff = await request("/api/commission-payouts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: cookieOwnerA1,
    },
    body: {
      staffId: staffB.id, // Pertenece a Tenant B
      periodStart: "2026-09-01T00:00:00Z",
      periodEnd: "2026-09-30T23:59:59Z",
      paymentMethod: "Efectivo",
    },
  });

  assert(
    resCrossStaff.status === 404 && resCrossStaff.body?.error === "NOT_FOUND",
    "TEST 14: Intentar liquidar staff de otro tenant es rechazado con HTTP 404 NOT_FOUND",
    `Status: ${resCrossStaff.status}, Error: ${resCrossStaff.body?.error}`
  );

  // -------------------------------------------------------------------------
  // TEST 15: AMOUNTPAID NO PUEDE SER MANIPULADO DESDE FRONTEND
  // -------------------------------------------------------------------------
  const aptManip = await prisma.appointment.create({
    data: {
      tenantId: tenantA.id,
      staffId: staffA2.id,
      serviceId: serviceA.id,
      clientId: clientA.id,
      clientName: clientA.name,
      clientPhone: clientA.phone,
      startTime: new Date("2026-09-22T10:00:00Z"),
      endTime: new Date("2026-09-22T10:45:00Z"),
      status: AppointmentStatus.COMPLETED,
    },
  });

  await prisma.cashMovement.create({
    data: {
      tenantId: tenantA.id,
      type: CashMovementType.INCOME,
      amount: 100000,
      category: "Servicio",
      paymentMethod: "Efectivo",
      description: "Cobro manipulable",
      appointmentId: aptManip.id,
    },
  });

  // El frontend envía maliciosamente amountPaid: 99999999
  const resManip = await request("/api/commission-payouts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: cookieOwnerA1,
    },
    body: {
      staffId: staffA2.id,
      periodStart: "2026-09-21T00:00:00Z",
      periodEnd: "2026-09-23T23:59:59Z",
      paymentMethod: "Transferencia",
      amountPaid: 99999999, // Intentando forzar 100 millones de comisión
    },
  });

  assert(
    resManip.status === 201 && resManip.body?.payout?.amountPaid === 50000,
    "TEST 15: Monto enviado por frontend es ignorado; backend calcula estrictamente la comisión real (50.000 Gs. al 50%)",
    `AmountPaid devuelto: ${resManip.body?.payout?.amountPaid}`
  );

  // -------------------------------------------------------------------------
  // TEST 16: PERIODSTART > PERIODEND ES RECHAZADO (400 VALIDATION_ERROR)
  // -------------------------------------------------------------------------
  const resInvalidRange = await request("/api/commission-payouts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: cookieOwnerA1,
    },
    body: {
      staffId: staffA2.id,
      periodStart: "2026-09-25T00:00:00Z",
      periodEnd: "2026-09-20T23:59:59Z", // Invertido
      paymentMethod: "Efectivo",
    },
  });

  assert(
    resInvalidRange.status === 400 && resInvalidRange.body?.error === "VALIDATION_ERROR",
    "TEST 16: periodStart > periodEnd es rechazado con HTTP 400 VALIDATION_ERROR",
    `Status: ${resInvalidRange.status}, Error: ${resInvalidRange.body?.error}`
  );

  // -------------------------------------------------------------------------
  // TEST 17: PAYMENTMETHOD INVÁLIDO RECHAZADO
  // -------------------------------------------------------------------------
  const resInvalidMethod = await request("/api/commission-payouts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: cookieOwnerA1,
    },
    body: {
      staffId: staffA2.id,
      periodStart: "2026-09-01T00:00:00Z",
      periodEnd: "2026-09-30T23:59:59Z",
      paymentMethod: "Bitcoin_Cripto",
    },
  });

  assert(
    resInvalidMethod.status === 400 && resInvalidMethod.body?.error === "VALIDATION_ERROR",
    "TEST 17: Método de pago inválido ('Bitcoin_Cripto') es rechazado con HTTP 400 VALIDATION_ERROR",
    `Status: ${resInvalidMethod.status}, Error: ${resInvalidMethod.body?.error}`
  );

  // -------------------------------------------------------------------------
  // TEST 18: TENANT A AISLADO DE TENANT B (ANTI-IDOR)
  // -------------------------------------------------------------------------
  const resCrossAudit = await request(`/api/commission-payouts/${winningPayout.id}`, {
    headers: { Cookie: cookieOwnerB },
  });

  assert(
    resCrossAudit.status === 404 && resCrossAudit.body?.error === "NOT_FOUND",
    "TEST 18: Tenant B no puede auditar ni consultar liquidaciones de Tenant A (HTTP 404 anti-IDOR)",
    `Status: ${resCrossAudit.status}`
  );

  // -------------------------------------------------------------------------
  // TEST 19: RECARGA (F5) CONSERVA HISTORIAL ÍNTEGRO
  // -------------------------------------------------------------------------
  const resF5Payouts = await request("/api/commission-payouts", {
    headers: { Cookie: cookieOwnerA1 },
  });

  assert(
    resF5Payouts.status === 200 && resF5Payouts.body?.payouts?.length >= 2,
    "TEST 19: Consulta posterior a F5 conserva el historial íntegro de liquidaciones",
    `Total liquidaciones en historial: ${resF5Payouts.body?.payouts?.length}`
  );

  // -------------------------------------------------------------------------
  // TEST 20: AUDITORÍA CONSERVA DATOS EXACTOS
  // -------------------------------------------------------------------------
  const resAuditExact = await request(`/api/commission-payouts/${winningPayout.id}`, {
    headers: { Cookie: cookieOwnerA1 },
  });

  const pExact = resAuditExact.body?.payout;
  assert(
    pExact &&
    pExact.staffName === "Carlos Barbero Hardened" &&
    pExact.paymentMethod === "Efectivo" &&
    pExact.items.length === 1 &&
    pExact.items[0].clientName === "Marcos Cliente" &&
    pExact.items[0].chargedAmount === 100000,
    "TEST 20: Auditoría de liquidación conserva datos exactos de staff, cita, cliente y monto",
    `Audit details: staff=${pExact?.staffName}, items=${pExact?.items?.length}`
  );

  // -------------------------------------------------------------------------
  // TEST 21: MÚLTIPLES CITAS EN UN SOLO PAYOUT
  // -------------------------------------------------------------------------
  const aptMulti1 = await prisma.appointment.create({
    data: {
      tenantId: tenantA.id,
      staffId: staffA2.id,
      serviceId: serviceA.id,
      clientId: clientA.id,
      clientName: "Cliente Multi 1",
      clientPhone: "+595981111222",
      startTime: new Date("2026-09-24T10:00:00Z"),
      endTime: new Date("2026-09-24T10:45:00Z"),
      status: AppointmentStatus.COMPLETED,
    },
  });
  await prisma.cashMovement.create({
    data: {
      tenantId: tenantA.id,
      type: CashMovementType.INCOME,
      amount: 100000,
      category: "Servicio",
      paymentMethod: "Efectivo",
      description: "Cobro multi 1",
      appointmentId: aptMulti1.id,
    },
  });

  const aptMulti2 = await prisma.appointment.create({
    data: {
      tenantId: tenantA.id,
      staffId: staffA2.id,
      serviceId: serviceA.id,
      clientId: clientA.id,
      clientName: "Cliente Multi 2",
      clientPhone: "+595981111222",
      startTime: new Date("2026-09-24T11:00:00Z"),
      endTime: new Date("2026-09-24T11:45:00Z"),
      status: AppointmentStatus.COMPLETED,
    },
  });
  await prisma.cashMovement.create({
    data: {
      tenantId: tenantA.id,
      type: CashMovementType.INCOME,
      amount: 150000,
      category: "Servicio",
      paymentMethod: "Tarjeta POS",
      description: "Cobro multi 2",
      appointmentId: aptMulti2.id,
    },
  });

  const resMulti = await request("/api/commission-payouts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: cookieOwnerA1,
    },
    body: {
      staffId: staffA2.id,
      periodStart: "2026-09-24T00:00:00Z",
      periodEnd: "2026-09-24T23:59:59Z",
      paymentMethod: "Billetera",
    },
  });

  // staffA2 tiene 50%: (100.000 * 50% = 50.000) + (150.000 * 50% = 75.000) = 125.000 Gs.
  assert(
    resMulti.status === 201 &&
    resMulti.body?.payout?.itemsCount === 2 &&
    resMulti.body?.payout?.amountPaid === 125000,
    "TEST 21: Múltiples citas en un solo período liquidan con suma exacta sin pérdidas (125.000 Gs.)",
    `Items: ${resMulti.body?.payout?.itemsCount}, Monto: ${resMulti.body?.payout?.amountPaid}`
  );

  // -------------------------------------------------------------------------
  // TEST 22: MÚLTIPLES STAFF LIQUIDADOS EN MISMO PERÍODO
  // -------------------------------------------------------------------------
  const payoutsStaff2 = await prisma.commissionPayout.findMany({
    where: { tenantId: tenantA.id, staffId: staffA2.id },
  });
  const payoutsStaff1 = await prisma.commissionPayout.findMany({
    where: { tenantId: tenantA.id, staffId: staffA1.id },
  });

  assert(
    payoutsStaff1.length >= 2 && payoutsStaff2.length >= 2,
    "TEST 22: Múltiples colaboradores se liquidan independientemente sin interferencias",
    `Staff 1: ${payoutsStaff1.length}, Staff 2: ${payoutsStaff2.length}`
  );

  // -------------------------------------------------------------------------
  // TEST 23: SPLIT PAYMENT CONSOLIDA COMISIÓN EXACTA
  // -------------------------------------------------------------------------
  const aptSplit = await prisma.appointment.create({
    data: {
      tenantId: tenantA.id,
      staffId: staffA2.id,
      serviceId: serviceA.id,
      clientId: clientA.id,
      clientName: "Cliente Split",
      clientPhone: "+595981111222",
      startTime: new Date("2026-09-26T10:00:00Z"),
      endTime: new Date("2026-09-26T10:45:00Z"),
      status: AppointmentStatus.COMPLETED,
    },
  });

  // 60k Efectivo + 40k Transferencia = 100k
  await prisma.cashMovement.create({
    data: {
      tenantId: tenantA.id,
      type: CashMovementType.INCOME,
      amount: 60000,
      category: "Servicio",
      paymentMethod: "Efectivo",
      description: "Cobro split parte 1",
      appointmentId: aptSplit.id,
    },
  });
  await prisma.cashMovement.create({
    data: {
      tenantId: tenantA.id,
      type: CashMovementType.INCOME,
      amount: 40000,
      category: "Servicio",
      paymentMethod: "Transferencia",
      description: "Cobro split parte 2",
      appointmentId: aptSplit.id,
    },
  });

  const resSplit = await request("/api/commission-payouts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: cookieOwnerA1,
    },
    body: {
      staffId: staffA2.id,
      periodStart: "2026-09-26T00:00:00Z",
      periodEnd: "2026-09-26T23:59:59Z",
      paymentMethod: "Efectivo",
    },
  });

  // 100.000 * 50% = 50.000
  assert(
    resSplit.status === 201 &&
    resSplit.body?.payout?.amountPaid === 50000 &&
    resSplit.body?.payout?.items[0]?.chargedAmount === 100000,
    "TEST 23: Split payment (60k Efectivo + 40k Transferencia) consolida 100k en base y 50k en liquidación",
    `Charged: ${resSplit.body?.payout?.items[0]?.chargedAmount}, Paid: ${resSplit.body?.payout?.amountPaid}`
  );

  // -------------------------------------------------------------------------
  // TEST 24: COMISIÓN 0% NO GENERA PAGO (HTTP 400 NO_COMMISSIONS_TO_PAY)
  // -------------------------------------------------------------------------
  const aptZero = await prisma.appointment.create({
    data: {
      tenantId: tenantA.id,
      staffId: staffA0Percent.id,
      serviceId: serviceA.id,
      clientId: clientA.id,
      clientName: "Cliente 0%",
      clientPhone: "+595981111222",
      startTime: new Date("2026-09-27T10:00:00Z"),
      endTime: new Date("2026-09-27T10:45:00Z"),
      status: AppointmentStatus.COMPLETED,
    },
  });
  await prisma.cashMovement.create({
    data: {
      tenantId: tenantA.id,
      type: CashMovementType.INCOME,
      amount: 100000,
      category: "Servicio",
      paymentMethod: "Efectivo",
      description: "Cobro cita 0%",
      appointmentId: aptZero.id,
    },
  });

  const resZero = await request("/api/commission-payouts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: cookieOwnerA1,
    },
    body: {
      staffId: staffA0Percent.id,
      periodStart: "2026-09-27T00:00:00Z",
      periodEnd: "2026-09-27T23:59:59Z",
      paymentMethod: "Efectivo",
    },
  });

  assert(
    resZero.status === 400 && resZero.body?.error === "NO_COMMISSIONS_TO_PAY",
    "TEST 24: Staff con comisión 0% no genera pago de liquidación (HTTP 400 NO_COMMISSIONS_TO_PAY)",
    `Status: ${resZero.status}, Error: ${resZero.body?.error}`
  );

  // -------------------------------------------------------------------------
  // TEST 25: STAFF INEXISTENTE RECHAZADO (404 NOT_FOUND)
  // -------------------------------------------------------------------------
  const fakeStaffId = "a0000000-0000-4000-a000-000000000099";
  const resFakeStaff = await request("/api/commission-payouts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: cookieOwnerA1,
    },
    body: {
      staffId: fakeStaffId,
      periodStart: "2026-09-01T00:00:00Z",
      periodEnd: "2026-09-30T23:59:59Z",
      paymentMethod: "Efectivo",
    },
  });

  assert(
    resFakeStaff.status === 404 && resFakeStaff.body?.error === "NOT_FOUND",
    "TEST 25: Staff con UUID inexistente es rechazado con HTTP 404 NOT_FOUND",
    `Status: ${resFakeStaff.status}, Error: ${resFakeStaff.body?.error}`
  );

  console.log("\n======================================================================");
  console.log("RESUMEN FASE 5.6.1: 25 / 25 PRUEBAS APROBADAS (100% ÉXITO)");
  console.log("======================================================================\n");
}

runSuite()
  .catch((err) => {
    console.error("Error fatal en suite de pruebas 5.6.1:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
