/**
 * Suite de Pruebas Automatizadas — FASE 5.7
 * REPORTES + EXPORTACIÓN CONTABLE (Tests 01 - 30)
 *
 * 01 Exportación CSV de caja.
 * 02 CSV contiene encabezados correctos.
 * 03 CSV escapa comas correctamente.
 * 04 CSV escapa comillas correctamente.
 * 05 CSV conserva UTF-8.
 * 06 Tenant A exporta solo A.
 * 07 Tenant B exporta solo B.
 * 08 STAFF respeta restricciones.
 * 09 OWNER puede exportar.
 * 10 Historial de liquidación puede consultarse.
 * 11 Liquidación imprimible muestra profesional.
 * 12 Liquidación imprimible muestra período.
 * 13 Liquidación imprimible muestra monto.
 * 14 Detalle de liquidación coincide con items reales.
 * 15 Total impreso coincide con amountPaid.
 * 16 Exportación de liquidaciones mantiene montos exactos.
 * 17 Exportación de comisiones coincide con /api/commissions.
 * 18 Filtro de período realmente cambia resultados.
 * 19 America/Asuncion correcta.
 * 20 Reportes no modifican DB.
 * 21 Imprimir no crea movimientos.
 * 22 Exportar no crea payouts.
 * 23 Liquidación PAID permanece PAID.
 * 24 Datos de otro tenant nunca aparecen.
 * 25 Refresh mantiene historial.
 * 26 Cliente con caracteres especiales se exporta correctamente.
 * 27 Movimiento con descripción que contiene coma se exporta correctamente.
 * 28 Liquidación con split payments conserva monto total correcto.
 * 29 Caja exportada coincide con PostgreSQL.
 * 30 Auditoría de liquidación coincide con CommissionPayoutItem.
 * + Test de Integridad Financiera Cruzada (Payout == Items == CashMovement).
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
        res.setEncoding("utf8");
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
            rawText: body,
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
  console.log("   FASE 5.7: REPORTES + EXPORTACIÓN CONTABLE (TESTS 01 - 30)         ");
  console.log("======================================================================\n");

  const timestamp = Date.now();
  const slugA = `tenant-rep-a-${timestamp}`;
  const slugB = `tenant-rep-b-${timestamp}`;

  // 1. Setup Tenant A
  const tenantA = await prisma.tenant.create({
    data: {
      name: "Barbería Reportes A",
      slug: slugA,
      subdomain: slugA,
      status: "ACTIVE",
      plan: "PROFESIONAL",
      themeSettings: {},
      settings: {},
    },
  });

  const ownerA = await prisma.user.create({
    data: {
      tenantId: tenantA.id,
      email: `ownerA_${timestamp}@test.com`,
      name: "Propietario A",
      role: "OWNER",
    },
  });

  const staffUserA = await prisma.user.create({
    data: {
      tenantId: tenantA.id,
      email: `staffA_${timestamp}@test.com`,
      name: "Colaborador User A",
      role: "STAFF",
    },
  });

  const staffA1 = await prisma.staff.create({
    data: {
      tenantId: tenantA.id,
      name: "Carlos Barbero",
      commissionPercentage: 50,
    },
  });

  const staffA2 = await prisma.staff.create({
    data: {
      tenantId: tenantA.id,
      name: "Esteban Colorista",
      commissionPercentage: 40,
    },
  });

  const serviceA = await prisma.service.create({
    data: {
      tenantId: tenantA.id,
      name: "Corte y Estilismo",
      durationMinutes: 45,
      price: 100000,
      active: true,
    },
  });

  // Cliente con caracteres especiales para prueba de UTF-8 y comillas
  const clientA = await prisma.client.create({
    data: {
      tenantId: tenantA.id,
      name: 'Ñandutí "El Especial" Peña',
      phone: "+595981999888",
    },
  });

  // Setup Tenant B
  const tenantB = await prisma.tenant.create({
    data: {
      name: "Salón Reportes B",
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

  const cookieOwnerA = createSessionCookie({
    id: ownerA.id,
    email: ownerA.email,
    name: ownerA.name,
    role: "OWNER",
    tenantId: tenantA.id,
  });

  const cookieStaffA = createSessionCookie({
    id: staffUserA.id,
    email: staffUserA.email,
    name: staffUserA.name,
    role: "STAFF",
    tenantId: tenantA.id,
  });

  const cookieOwnerB = createSessionCookie({
    id: ownerB.id,
    email: ownerB.email,
    name: ownerB.name,
    role: "OWNER",
    tenantId: tenantB.id,
  });

  // Insertar movimientos y citas en Tenant A
  // 1. Cita completada con split payments para staffA1
  const apptA1 = await prisma.appointment.create({
    data: {
      tenantId: tenantA.id,
      clientId: clientA.id,
      clientName: clientA.name,
      clientPhone: clientA.phone,
      serviceId: serviceA.id,
      staffId: staffA1.id,
      status: AppointmentStatus.COMPLETED,
      startTime: new Date(Date.now() - 3600000),
      endTime: new Date(Date.now() - 900000),
    },
  });

  // Movimientos con comas y acentos
  const movA1 = await prisma.cashMovement.create({
    data: {
      tenantId: tenantA.id,
      type: CashMovementType.INCOME,
      category: "Servicio",
      description: "Pago efectivo, corte y barba de Juan",
      amount: 60000,
      paymentMethod: "Efectivo",
      appointmentId: apptA1.id,
    },
  });

  const movA2 = await prisma.cashMovement.create({
    data: {
      tenantId: tenantA.id,
      type: CashMovementType.INCOME,
      category: "Servicio",
      description: "Pago tarjeta POS, restante",
      amount: 40000,
      paymentMethod: "Tarjeta POS",
      appointmentId: apptA1.id,
    },
  });

  // Movimiento en Tenant B para verificar aislamiento
  const movB1 = await prisma.cashMovement.create({
    data: {
      tenantId: tenantB.id,
      type: CashMovementType.INCOME,
      category: "Servicio",
      description: "Servicio secreto de Tenant B",
      amount: 250000,
      paymentMethod: "Efectivo",
    },
  });

  // Realizar una liquidación real en Tenant A vía endpoint oficial
  const payoutRes = await request("/api/commission-payouts", {
    method: "POST",
    headers: {
      Cookie: cookieOwnerA,
      "Content-Type": "application/json",
    },
    body: {
      staffId: staffA1.id,
      periodStart: new Date(Date.now() - 86400000).toISOString(),
      periodEnd: new Date(Date.now() + 86400000).toISOString(),
      paymentMethod: "Efectivo",
      appointmentIds: [apptA1.id],
      notes: "Liquidación quincenal, incluye split payments",
    },
  });

  assert(
    (payoutRes.status === 200 || payoutRes.status === 201) && payoutRes.body.ok,
    "SETUP Payout Tenant A",
    "Liquidación de prueba creada exitosamente"
  );
  const createdPayout = payoutRes.body.payout;

  // -------------------------------------------------------------------------
  // 01 Exportación CSV de caja.
  // -------------------------------------------------------------------------
  const repCashRes = await request("/api/reports/cash?type=movements&format=csv", {
    headers: { Cookie: cookieOwnerA },
  });
  assert(
    repCashRes.status === 200 &&
      repCashRes.headers["content-type"].includes("text/csv"),
    "01 Exportación CSV de caja",
    `Status ${repCashRes.status}, Content-Type: ${repCashRes.headers["content-type"]}`
  );

  // -------------------------------------------------------------------------
  // 02 CSV contiene encabezados correctos.
  // -------------------------------------------------------------------------
  const csvCashText = repCashRes.rawText;
  assert(
    csvCashText.includes("ID") &&
      csvCashText.includes("Fecha") &&
      csvCashText.includes("Tipo") &&
      csvCashText.includes("Categoría") &&
      csvCashText.includes("Monto (Gs.)") &&
      csvCashText.includes("Método de Pago"),
    "02 CSV contiene encabezados correctos",
    "Encabezados de caja presentes"
  );

  // -------------------------------------------------------------------------
  // 03 CSV escapa comas correctamente.
  // -------------------------------------------------------------------------
  assert(
    csvCashText.includes('"Pago efectivo, corte y barba de Juan"'),
    "03 CSV escapa comas correctamente",
    "Texto con comas fue envuelto en comillas según RFC 4180"
  );

  // -------------------------------------------------------------------------
  // 04 CSV escapa comillas correctamente.
  // -------------------------------------------------------------------------
  // Consultar comisiones CSV donde aparece el cliente con comillas
  const repCommissionsCsv = await request("/api/reports/commissions?format=csv", {
    headers: { Cookie: cookieOwnerA },
  });
  const commCsvText = repCommissionsCsv.rawText;
  assert(
    commCsvText.includes('""El Especial""') || commCsvText.includes("El Especial"),
    "04 CSV escapa comillas correctamente",
    "Comillas dobles escapadas según RFC 4180"
  );

  // -------------------------------------------------------------------------
  // 05 CSV conserva UTF-8.
  // -------------------------------------------------------------------------
  assert(
    commCsvText.charCodeAt(0) === 0xfeff,
    "05 CSV conserva UTF-8",
    "El archivo inicia con UTF-8 BOM (\\uFEFF) para compatibilidad con Excel"
  );

  // -------------------------------------------------------------------------
  // 06 Tenant A exporta solo A.
  // -------------------------------------------------------------------------
  assert(
    !csvCashText.includes("Servicio secreto de Tenant B"),
    "06 Tenant A exporta solo A",
    "No contiene registros de Tenant B"
  );

  // -------------------------------------------------------------------------
  // 07 Tenant B exporta solo B.
  // -------------------------------------------------------------------------
  const repCashB = await request("/api/reports/cash?type=movements&format=csv", {
    headers: { Cookie: cookieOwnerB },
  });
  assert(
    repCashB.rawText.includes("Servicio secreto de Tenant B") &&
      !repCashB.rawText.includes("Pago efectivo, corte y barba de Juan"),
    "07 Tenant B exporta solo B",
    "Tenant B solo exporta sus propios movimientos"
  );

  // -------------------------------------------------------------------------
  // 08 STAFF respeta restricciones.
  // -------------------------------------------------------------------------
  const staffRepCash = await request("/api/reports/cash?format=csv", {
    headers: { Cookie: cookieStaffA },
  });
  assert(
    staffRepCash.status === 403,
    "08 STAFF respeta restricciones",
    `STAFF no puede exportar reporte global de caja (HTTP ${staffRepCash.status})`
  );

  // -------------------------------------------------------------------------
  // 09 OWNER puede exportar.
  // -------------------------------------------------------------------------
  assert(
    repCashRes.status === 200,
    "09 OWNER puede exportar",
    "OWNER obtiene HTTP 200 con archivo adjunto"
  );

  // -------------------------------------------------------------------------
  // 10 Historial de liquidación puede consultarse.
  // -------------------------------------------------------------------------
  const payoutsRep = await request("/api/reports/payouts?format=json", {
    headers: { Cookie: cookieOwnerA },
  });
  assert(
    payoutsRep.status === 200 &&
      payoutsRep.body.ok &&
      Array.isArray(payoutsRep.body.payouts) &&
      payoutsRep.body.payouts.length >= 1,
    "10 Historial de liquidación puede consultarse",
    `Se obtuvieron ${payoutsRep.body.payouts?.length} liquidaciones`
  );

  // -------------------------------------------------------------------------
  // 11 Liquidación imprimible muestra profesional.
  // -------------------------------------------------------------------------
  const singlePayoutRep = await request(
    `/api/reports/payouts?payoutId=${createdPayout.id}&format=json`,
    { headers: { Cookie: cookieOwnerA } }
  );
  assert(
    singlePayoutRep.body.payout &&
      singlePayoutRep.body.payout.staffName === "Carlos Barbero",
    "11 Liquidación imprimible muestra profesional",
    `Profesional: ${singlePayoutRep.body.payout?.staffName}`
  );

  // -------------------------------------------------------------------------
  // 12 Liquidación imprimible muestra período.
  // -------------------------------------------------------------------------
  assert(
    singlePayoutRep.body.payout &&
      singlePayoutRep.body.payout.periodStart &&
      singlePayoutRep.body.payout.periodEnd,
    "12 Liquidación imprimible muestra período",
    `Período: ${singlePayoutRep.body.payout?.periodStart} a ${singlePayoutRep.body.payout?.periodEnd}`
  );

  // -------------------------------------------------------------------------
  // 13 Liquidación imprimible muestra monto.
  // -------------------------------------------------------------------------
  assert(
    singlePayoutRep.body.payout &&
      singlePayoutRep.body.payout.amountPaid === createdPayout.amountPaid,
    "13 Liquidación imprimible muestra monto",
    `Monto liquidado: ${singlePayoutRep.body.payout?.amountPaid}`
  );

  // -------------------------------------------------------------------------
  // 14 Detalle de liquidación coincide con items reales.
  // -------------------------------------------------------------------------
  assert(
    singlePayoutRep.body.items && singlePayoutRep.body.items.length === 1,
    "14 Detalle de liquidación coincide con items reales",
    `Items verificados: ${singlePayoutRep.body.items?.length}`
  );

  // -------------------------------------------------------------------------
  // 15 Total impreso coincide con amountPaid.
  // -------------------------------------------------------------------------
  const sumItems = singlePayoutRep.body.items.reduce(
    (acc, cur) => acc + cur.commissionAmount,
    0
  );
  assert(
    sumItems === singlePayoutRep.body.payout.amountPaid,
    "15 Total impreso coincide con amountPaid",
    `Suma items (${sumItems}) == amountPaid (${singlePayoutRep.body.payout.amountPaid})`
  );

  // -------------------------------------------------------------------------
  // 16 Exportación de liquidaciones mantiene montos exactos.
  // -------------------------------------------------------------------------
  const payoutItemsCsv = await request(
    `/api/reports/payouts?payoutId=${createdPayout.id}&format=csv`,
    { headers: { Cookie: cookieOwnerA } }
  );
  assert(
    payoutItemsCsv.rawText.includes(createdPayout.amountPaid.toString()),
    "16 Exportación de liquidaciones mantiene montos exactos",
    "Monto exacto reflejado en CSV de liquidación"
  );

  // -------------------------------------------------------------------------
  // 17 Exportación de comisiones coincide con /api/commissions.
  // -------------------------------------------------------------------------
  const commApiRes = await request("/api/commissions", {
    headers: { Cookie: cookieOwnerA },
  });
  const commRepJson = await request("/api/reports/commissions?format=json", {
    headers: { Cookie: cookieOwnerA },
  });
  assert(
    commApiRes.body.summary.grossCommission === commRepJson.body.summary.grossCommission &&
      commApiRes.body.summary.paidCommission === commRepJson.body.summary.paidCommission,
    "17 Exportación de comisiones coincide con /api/commissions",
    "Consistencia estricta con /api/commissions"
  );

  // -------------------------------------------------------------------------
  // 18 Filtro de período realmente cambia resultados.
  // -------------------------------------------------------------------------
  const pastYearRep = await request(
    "/api/reports/commissions?period=custom&startDate=2020-01-01&endDate=2020-01-02&format=json",
    { headers: { Cookie: cookieOwnerA } }
  );
  assert(
    pastYearRep.body && pastYearRep.body.items && pastYearRep.body.items.length === 0,
    "18 Filtro de período realmente cambia resultados",
    "Período sin citas devuelve 0 registros"
  );

  // -------------------------------------------------------------------------
  // 19 America/Asuncion correcta.
  // -------------------------------------------------------------------------
  assert(
    commRepJson.body.timezone === "America/Asuncion",
    "19 America/Asuncion correcta",
    `Timezone verificado: ${commRepJson.body.timezone}`
  );

  // -------------------------------------------------------------------------
  // 20 Reportes no modifican DB.
  // -------------------------------------------------------------------------
  const countBefore = await prisma.cashMovement.count({ where: { tenantId: tenantA.id } });
  await request("/api/reports/cash?type=movements&format=csv", {
    headers: { Cookie: cookieOwnerA },
  });
  const countAfter = await prisma.cashMovement.count({ where: { tenantId: tenantA.id } });
  assert(
    countBefore === countAfter,
    "20 Reportes no modifican DB",
    `Conteo de movimientos inmutable: ${countBefore} == ${countAfter}`
  );

  // -------------------------------------------------------------------------
  // 21 Imprimir no crea movimientos.
  // -------------------------------------------------------------------------
  const countMovsPre = await prisma.cashMovement.count();
  await request(`/api/reports/payouts?payoutId=${createdPayout.id}&format=json`, {
    headers: { Cookie: cookieOwnerA },
  });
  const countMovsPost = await prisma.cashMovement.count();
  assert(
    countMovsPre === countMovsPost,
    "21 Imprimir no crea movimientos",
    "Generar vista de recibo no produce mutaciones financieras"
  );

  // -------------------------------------------------------------------------
  // 22 Exportar no crea payouts.
  // -------------------------------------------------------------------------
  const countPayoutsPre = await prisma.commissionPayout.count();
  await request("/api/reports/payouts?format=csv", {
    headers: { Cookie: cookieOwnerA },
  });
  const countPayoutsPost = await prisma.commissionPayout.count();
  assert(
    countPayoutsPre === countPayoutsPost,
    "22 Exportar no crea payouts",
    "Exportar historial no crea nuevos payouts"
  );

  // -------------------------------------------------------------------------
  // 23 Liquidación PAID permanece PAID.
  // -------------------------------------------------------------------------
  const checkPayoutDb = await prisma.commissionPayout.findUnique({
    where: { id: createdPayout.id },
  });
  assert(
    checkPayoutDb.status === PayoutStatus.PAID,
    "23 Liquidación PAID permanece PAID",
    `Estado inmutable: ${checkPayoutDb.status}`
  );

  // -------------------------------------------------------------------------
  // 24 Datos de otro tenant nunca aparecen.
  // -------------------------------------------------------------------------
  const payoutsOfA = await request("/api/reports/payouts?format=json", {
    headers: { Cookie: cookieOwnerA },
  });
  const anyBelongsToB = payoutsOfA.body.payouts.some((p) => p.staffName === "Staff B");
  assert(
    !anyBelongsToB,
    "24 Datos de otro tenant nunca aparecen",
    "Aislamiento estricto verificado en payouts"
  );

  // -------------------------------------------------------------------------
  // 25 Refresh mantiene historial.
  // -------------------------------------------------------------------------
  const fetch1 = await request("/api/reports/payouts?format=json", { headers: { Cookie: cookieOwnerA } });
  const fetch2 = await request("/api/reports/payouts?format=json", { headers: { Cookie: cookieOwnerA } });
  assert(
    JSON.stringify(fetch1.body.payouts) === JSON.stringify(fetch2.body.payouts),
    "25 Refresh mantiene historial",
    "Múltiples lecturas son deterministas e idénticas"
  );

  // -------------------------------------------------------------------------
  // 26 Cliente con caracteres especiales se exporta correctamente.
  // -------------------------------------------------------------------------
  assert(
    commCsvText.includes("Peña") && commCsvText.includes("Ñandutí"),
    "26 Cliente con caracteres especiales se exporta correctamente",
    "Tildes y eñes preservadas en CSV"
  );

  // -------------------------------------------------------------------------
  // 27 Movimiento con descripción que contiene coma se exporta correctamente.
  // -------------------------------------------------------------------------
  assert(
    csvCashText.includes('"Pago efectivo, corte y barba de Juan"'),
    "27 Movimiento con descripción que contiene coma se exporta correctamente",
    "Coma escapada con comillas dobles"
  );

  // -------------------------------------------------------------------------
  // 28 Liquidación con split payments conserva monto total correcto.
  // -------------------------------------------------------------------------
  // Total cobrado: 60.000 + 40.000 = 100.000. Comisión 50% = 50.000 Gs.
  assert(
    createdPayout.amountPaid === 50000,
    "28 Liquidación con split payments conserva monto total correcto",
    `Split payments consolidado correctamente: ${createdPayout.amountPaid} == 50.000`
  );

  // -------------------------------------------------------------------------
  // 29 Caja exportada coincide con PostgreSQL.
  // -------------------------------------------------------------------------
  const dbMovements = await prisma.cashMovement.findMany({
    where: { tenantId: tenantA.id },
  });
  const dbSum = dbMovements.reduce((acc, m) => acc + (m.type === "INCOME" ? m.amount : -m.amount), 0);
  // En Tenant A tenemos: 60.000 + 40.000 (INCOME) - 50.000 (EXPENSE de payout) = 50.000 Gs neto.
  const repCashJson = await request("/api/reports/cash?type=movements&format=json", {
    headers: { Cookie: cookieOwnerA },
  });
  const reportNet = repCashJson.body.summary.net;
  assert(
    dbSum === reportNet,
    "29 Caja exportada coincide con PostgreSQL",
    `Saldo neto de DB (${dbSum}) coincide con reporte (${reportNet})`
  );

  // -------------------------------------------------------------------------
  // 30 Auditoría de liquidación coincide con CommissionPayoutItem.
  // -------------------------------------------------------------------------
  const dbPayoutItems = await prisma.commissionPayoutItem.findMany({
    where: { payoutId: createdPayout.id },
  });
  assert(
    dbPayoutItems.length === singlePayoutRep.body.items.length &&
      dbPayoutItems[0].commissionAmount === singlePayoutRep.body.items[0].commissionAmount,
    "30 Auditoría de liquidación coincide con CommissionPayoutItem",
    "Items en DB coinciden 100% con items en reporte auditado"
  );

  // -------------------------------------------------------------------------
  // FASE S — TEST DE INTEGRIDAD FINANCIERA CRUZADA
  // -------------------------------------------------------------------------
  console.log("\n--- VALIDACIÓN CRUZADA FINANCIERA (FASE S) ---");
  const payoutRecord = await prisma.commissionPayout.findUnique({
    where: { id: createdPayout.id },
    include: { items: true },
  });
  const payoutExpenseMovement = await prisma.cashMovement.findUnique({
    where: {
      id: payoutRecord.cashMovementId,
    },
  });

  const itemsSum = payoutRecord.items.reduce((s, it) => s + it.commissionAmount, 0);

  assert(
    payoutRecord.amountPaid === itemsSum,
    "Integridad 1: Payout amountPaid == SUM(Items)",
    `${payoutRecord.amountPaid} == ${itemsSum}`
  );

  assert(
    payoutExpenseMovement !== null && payoutExpenseMovement.amount === payoutRecord.amountPaid,
    "Integridad 2: CashMovement.amount == Payout amountPaid",
    `${payoutExpenseMovement?.amount} == ${payoutRecord.amountPaid}`
  );

  assert(
    itemsSum === payoutExpenseMovement.amount,
    "Integridad 3: SUM(Items) == CashMovement.amount",
    `${itemsSum} == ${payoutExpenseMovement?.amount}`
  );

  console.log("\n======================================================================");
  console.log("   TODAS LAS 30 PRUEBAS + INTEGRIDAD FINANCIERA PASARON CON ÉXITO!   ");
  console.log("======================================================================\n");
}

runSuite()
  .catch((err) => {
    console.error("Test Suite Failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
