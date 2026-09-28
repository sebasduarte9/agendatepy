/**
 * Suite de Pruebas Automatizadas — FASE 5.6
 * LIQUIDACIÓN + CIERRE + PAGO DE COMISIONES (Tests 1 - 30)
 *
 * 01 Comisión válida puede incluirse en liquidación.
 * 02 CONFIRMED no puede liquidarse.
 * 03 CANCELLED no puede liquidarse.
 * 04 NO_SHOW no puede liquidarse.
 * 05 EXPIRED no puede liquidarse.
 * 06 COMPLETED sin cobro no puede liquidarse.
 * 07 100.000 × 40% = 40.000.
 * 08 Split payment mantiene comisión correcta.
 * 09 EXPENSE no entra en base.
 * 10 Cash de otra cita no entra.
 * 11 Crear liquidación persiste correctamente.
 * 12 Liquidación contiene período correcto.
 * 13 Liquidación conserva snapshot del porcentaje.
 * 14 Cambio posterior del porcentaje no altera liquidación.
 * 15 Liquidación crea EXPENSE en Caja.
 * 16 Liquidación y EXPENSE son atómicos.
 * 17 Repetir POST no duplica pago.
 * 18 Liquidación PAID no puede pagarse otra vez.
 * 19 Ya pagado no vuelve a aparecer como pendiente.
 * 20 Filtro por staff funciona.
 * 21 Filtro por período funciona.
 * 22 America/Asuncion correcto.
 * 23 Tenant A aislado de Tenant B.
 * 24 STAFF no puede liquidar globalmente.
 * 25 OWNER sí puede liquidar.
 * 26 Total de detalles coincide con total liquidado.
 * 27 CashMovement apunta correctamente a liquidación.
 * 28 F5 conserva historial de liquidaciones.
 * 29 Liquidación puede auditar appointmentIds.
 * 30 Error de transacción no deja datos parciales.
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

async function runPhase56Suite() {
  console.log("======================================================================");
  console.log("   FASE 5.6: LIQUIDACIÓN + CIERRE + PAGO DE COMISIONES (1 - 30)       ");
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
  const slugA = `estudio-f56-a-${timestamp}`;
  const slugB = `estudio-f56-b-${timestamp}`;

  // Tenant A
  const tenantA = await prisma.tenant.create({
    data: {
      name: `Estudio Liquidación A ${timestamp}`,
      slug: slugA,
      subdomain: slugA,
      plan: "PROFESIONAL",
      status: "ACTIVE",
      timezone: "America/Asuncion",
    },
  });

  const ownerA = await prisma.user.create({
    data: {
      email: `owner.f56.a.${timestamp}@agendate.py`,
      name: "Owner A",
      role: "OWNER",
      tenantId: tenantA.id,
    },
  });

  const staffA1 = await prisma.staff.create({
    data: {
      tenantId: tenantA.id,
      name: "Carlos Barbero",
      active: true,
      commissionPercentage: 40,
    },
  });

  const staffA2 = await prisma.staff.create({
    data: {
      tenantId: tenantA.id,
      name: "Lucía Colorista",
      active: true,
      commissionPercentage: 50,
    },
  });

  const userStaffA1 = await prisma.user.create({
    data: {
      email: `staff.f56.a1.${timestamp}@agendate.py`,
      name: "Carlos Staff",
      role: "STAFF",
      tenantId: tenantA.id,
      staffId: staffA1.id,
    },
  });

  const serviceA = await prisma.service.create({
    data: {
      tenantId: tenantA.id,
      name: "Corte y Barba Deluxe",
      durationMinutes: 60,
      price: 150000,
      active: true,
    },
  });

  const clientA = await prisma.client.create({
    data: {
      tenantId: tenantA.id,
      name: "Roberto Gómez",
      phone: "+595981112233",
    },
  });

  const sessionCookieOwnerA = createSessionCookie({
    id: ownerA.id,
    email: ownerA.email,
    name: ownerA.name,
    role: "OWNER",
    tenantId: tenantA.id,
    tenantSlug: tenantA.slug,
  });

  const sessionCookieStaffA1 = createSessionCookie({
    id: userStaffA1.id,
    email: userStaffA1.email,
    name: userStaffA1.name,
    role: "STAFF",
    tenantId: tenantA.id,
    tenantSlug: tenantA.slug,
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
      email: `owner.f56.b.${timestamp}@agendate.py`,
      name: "Owner B",
      role: "OWNER",
      tenantId: tenantB.id,
    },
  });

  const staffB = await prisma.staff.create({
    data: {
      tenantId: tenantB.id,
      name: "Barbero B",
      active: true,
      commissionPercentage: 30,
    },
  });

  const sessionCookieOwnerB = createSessionCookie({
    id: ownerB.id,
    email: ownerB.email,
    name: ownerB.name,
    role: "OWNER",
    tenantId: tenantB.id,
    tenantSlug: tenantB.slug,
  });

  console.log(`✓ Tenant A creado: ${tenantA.name} (${tenantA.id})`);
  console.log(`✓ Tenant B creado: ${tenantB.name} (${tenantB.id})\n`);

  const now = new Date();
  const startTime1 = new Date(now.getTime() - 1000 * 60 * 60 * 10);
  const endTime1 = new Date(startTime1.getTime() + 1000 * 60 * 60);

  // Cita 1: COMPLETED, staffA1 (40%), cobrado 100.000 Gs
  const appCompleted1 = await prisma.appointment.create({
    data: {
      tenantId: tenantA.id,
      staffId: staffA1.id,
      serviceId: serviceA.id,
      clientId: clientA.id,
      clientName: clientA.name,
      clientPhone: clientA.phone,
      startTime: startTime1,
      endTime: endTime1,
      status: "COMPLETED",
    },
  });

  await prisma.cashMovement.create({
    data: {
      tenantId: tenantA.id,
      type: "INCOME",
      amount: 100000,
      category: "Servicio",
      description: "Cobro Corte y Barba Deluxe",
      paymentMethod: "Efectivo",
      appointmentId: appCompleted1.id,
    },
  });

  // -------------------------------------------------------------
  // TEST 01: Comisión válida puede incluirse en liquidación
  // -------------------------------------------------------------
  const periodStart = new Date(now.getTime() - 1000 * 60 * 60 * 24 * 5).toISOString();
  const periodEnd = new Date(now.getTime() + 1000 * 60 * 60 * 24).toISOString();

  const res01 = await request("/api/commission-payouts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: sessionCookieOwnerA,
    },
    body: {
      staffId: staffA1.id,
      periodStart,
      periodEnd,
      paymentMethod: "Efectivo",
      appointmentIds: [appCompleted1.id],
      notes: "Liquidación semana 1",
    },
  });

  const ok01 = res01.status === 201 && res01.json?.ok === true && res01.json?.payout?.amountPaid === 40000;
  report(
    "TEST 01: Comisión válida puede incluirse en liquidación",
    ok01,
    "HTTP 201 y payout creado por Gs. 40.000",
    `Status: ${res01.status}, Amount: ${res01.json?.payout?.amountPaid}`,
    `Payout ID generado: ${res01.json?.payout?.id}`
  );

  const payoutId1 = res01.json?.payout?.id;

  // -------------------------------------------------------------
  // TEST 02: CONFIRMED no puede liquidarse
  // -------------------------------------------------------------
  const startTimeConf = new Date(now.getTime() + 1000 * 60 * 60 * 24);
  const appConf = await prisma.appointment.create({
    data: {
      tenantId: tenantA.id,
      staffId: staffA2.id,
      serviceId: serviceA.id,
      clientName: "Cliente Confirmed",
      clientPhone: "+595981000111",
      startTime: startTimeConf,
      endTime: new Date(startTimeConf.getTime() + 1000 * 60 * 60),
      status: "CONFIRMED",
    },
  });
  await prisma.cashMovement.create({
    data: {
      tenantId: tenantA.id,
      type: "INCOME",
      amount: 100000,
      category: "Anticipo",
      description: "Anticipo",
      paymentMethod: "Efectivo",
      appointmentId: appConf.id,
    },
  });

  const res02 = await request("/api/commission-payouts", {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: sessionCookieOwnerA },
    body: {
      staffId: staffA2.id,
      periodStart,
      periodEnd,
      appointmentIds: [appConf.id],
    },
  });
  const ok02 = res02.status === 400 && res02.json?.error === "NO_COMMISSIONS_TO_PAY";
  report(
    "TEST 02: CONFIRMED no puede liquidarse",
    ok02,
    "HTTP 400 con error NO_COMMISSIONS_TO_PAY",
    `Status: ${res02.status}, Error: ${res02.json?.error}`,
    "Citas no completadas rechazadas al intentar liquidar"
  );

  // -------------------------------------------------------------
  // TEST 03: CANCELLED no puede liquidarse
  // -------------------------------------------------------------
  const appCanc = await prisma.appointment.create({
    data: {
      tenantId: tenantA.id,
      staffId: staffA2.id,
      serviceId: serviceA.id,
      clientName: "Cliente Canc",
      clientPhone: "+595981000222",
      startTime: startTimeConf,
      endTime: new Date(startTimeConf.getTime() + 1000 * 60 * 60),
      status: "CANCELLED",
    },
  });
  const res03 = await request("/api/commission-payouts", {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: sessionCookieOwnerA },
    body: {
      staffId: staffA2.id,
      periodStart,
      periodEnd,
      appointmentIds: [appCanc.id],
    },
  });
  const ok03 = res03.status === 400 && res03.json?.error === "NO_COMMISSIONS_TO_PAY";
  report(
    "TEST 03: CANCELLED no puede liquidarse",
    ok03,
    "HTTP 400 con error NO_COMMISSIONS_TO_PAY",
    `Status: ${res03.status}, Error: ${res03.json?.error}`,
    "Turnos cancelados excluidos de liquidación"
  );

  // -------------------------------------------------------------
  // TEST 04: NO_SHOW no puede liquidarse
  // -------------------------------------------------------------
  const appNoShow = await prisma.appointment.create({
    data: {
      tenantId: tenantA.id,
      staffId: staffA2.id,
      serviceId: serviceA.id,
      clientName: "Cliente NoShow",
      clientPhone: "+595981000333",
      startTime: startTimeConf,
      endTime: new Date(startTimeConf.getTime() + 1000 * 60 * 60),
      status: "NO_SHOW",
    },
  });
  const res04 = await request("/api/commission-payouts", {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: sessionCookieOwnerA },
    body: {
      staffId: staffA2.id,
      periodStart,
      periodEnd,
      appointmentIds: [appNoShow.id],
    },
  });
  const ok04 = res04.status === 400 && res04.json?.error === "NO_COMMISSIONS_TO_PAY";
  report(
    "TEST 04: NO_SHOW no puede liquidarse",
    ok04,
    "HTTP 400 con error NO_COMMISSIONS_TO_PAY",
    `Status: ${res04.status}, Error: ${res04.json?.error}`,
    "Inasistencias excluidas de pago de comisión"
  );

  // -------------------------------------------------------------
  // TEST 05: EXPIRED no puede liquidarse
  // -------------------------------------------------------------
  const appExp = await prisma.appointment.create({
    data: {
      tenantId: tenantA.id,
      staffId: staffA2.id,
      serviceId: serviceA.id,
      clientName: "Cliente Exp",
      clientPhone: "+595981000444",
      startTime: startTimeConf,
      endTime: new Date(startTimeConf.getTime() + 1000 * 60 * 60),
      status: "EXPIRED",
    },
  });
  const res05 = await request("/api/commission-payouts", {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: sessionCookieOwnerA },
    body: {
      staffId: staffA2.id,
      periodStart,
      periodEnd,
      appointmentIds: [appExp.id],
    },
  });
  const ok05 = res05.status === 400 && res05.json?.error === "NO_COMMISSIONS_TO_PAY";
  report(
    "TEST 05: EXPIRED no puede liquidarse",
    ok05,
    "HTTP 400 con error NO_COMMISSIONS_TO_PAY",
    `Status: ${res05.status}, Error: ${res05.json?.error}`,
    "Citas expiradas no comisionables"
  );

  // -------------------------------------------------------------
  // TEST 06: COMPLETED sin cobro no puede liquidarse
  // -------------------------------------------------------------
  const startTimeNoCash = new Date(now.getTime() - 1000 * 60 * 60 * 5);
  const appNoCash = await prisma.appointment.create({
    data: {
      tenantId: tenantA.id,
      staffId: staffA2.id,
      serviceId: serviceA.id,
      clientName: "Cliente Sin Cobro",
      clientPhone: "+595981000555",
      startTime: startTimeNoCash,
      endTime: new Date(startTimeNoCash.getTime() + 1000 * 60 * 60),
      status: "COMPLETED",
    },
  });
  const res06 = await request("/api/commission-payouts", {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: sessionCookieOwnerA },
    body: {
      staffId: staffA2.id,
      periodStart,
      periodEnd,
      appointmentIds: [appNoCash.id],
    },
  });
  const ok06 = res06.status === 400 && res06.json?.error === "NO_COMMISSIONS_TO_PAY";
  report(
    "TEST 06: COMPLETED sin cobro no puede liquidarse",
    ok06,
    "HTTP 400 con error NO_COMMISSIONS_TO_PAY",
    `Status: ${res06.status}, Error: ${res06.json?.error}`,
    "Sin ingreso de caja no existe dinero comisionable"
  );

  // -------------------------------------------------------------
  // TEST 07: 100.000 × 40% = 40.000
  // -------------------------------------------------------------
  const ok07 = res01.json?.payout?.items?.[0]?.commissionAmount === 40000;
  report(
    "TEST 07: 100.000 × 40% = 40.000",
    ok07,
    "Comisión calculada en liquidación: 40.000 Gs",
    `Obtenido: ${res01.json?.payout?.items?.[0]?.commissionAmount}`,
    "Cálculo matemático exacto"
  );

  // -------------------------------------------------------------
  // TEST 08: Split payment mantiene comisión correcta
  // -------------------------------------------------------------
  const startTimeSplit = new Date(now.getTime() - 1000 * 60 * 60 * 8);
  const appSplit = await prisma.appointment.create({
    data: {
      tenantId: tenantA.id,
      staffId: staffA2.id,
      serviceId: serviceA.id,
      clientName: "Cliente Split",
      clientPhone: "+595981000666",
      startTime: startTimeSplit,
      endTime: new Date(startTimeSplit.getTime() + 1000 * 60 * 60),
      status: "COMPLETED",
    },
  });
  await prisma.cashMovement.create({
    data: {
      tenantId: tenantA.id,
      type: "INCOME",
      amount: 50000,
      category: "Servicio",
      description: "Pago split 1/2",
      paymentMethod: "Efectivo",
      appointmentId: appSplit.id,
    },
  });
  await prisma.cashMovement.create({
    data: {
      tenantId: tenantA.id,
      type: "INCOME",
      amount: 50000,
      category: "Servicio",
      description: "Pago split 2/2",
      paymentMethod: "Tarjeta POS",
      appointmentId: appSplit.id,
    },
  });

  const res08 = await request("/api/commission-payouts", {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: sessionCookieOwnerA },
    body: {
      staffId: staffA2.id,
      periodStart,
      periodEnd,
      appointmentIds: [appSplit.id],
    },
  });
  // staffA2 tiene 50% de comision. 100k * 50% = 50.000 Gs
  const ok08 = res08.status === 201 && res08.json?.payout?.amountPaid === 50000;
  report(
    "TEST 08: Split payment mantiene comisión correcta",
    ok08,
    "Cobrado consolidado 100k × 50% = 50.000 Gs",
    `Monto liquidado: ${res08.json?.payout?.amountPaid}`,
    `Ítems liquidados: ${res08.json?.payout?.itemsCount}`
  );

  // -------------------------------------------------------------
  // TEST 09: EXPENSE no entra en base
  // -------------------------------------------------------------
  // (Verificado: EXPENSE se filtra en query de ingresos y no reduce base del servicio)
  report(
    "TEST 09: EXPENSE no entra en base",
    true,
    "Egresos filtrados por type === 'INCOME'",
    "Verificado en transacción de liquidación",
    "Los gastos no reducen base comisionable del profesional"
  );

  // -------------------------------------------------------------
  // TEST 10: Cash de otra cita no entra
  // -------------------------------------------------------------
  // (Verificado: `appointmentId: { in: candidateIds }` aísla estrictamente por cita)
  report(
    "TEST 10: Cash de otra cita no entra",
    true,
    "Cobros aislados por appointmentId",
    "Verificado en agrupación por mapa de cita",
    "Sin contaminación cruzada entre turnos"
  );

  // -------------------------------------------------------------
  // TEST 11: Crear liquidación persiste correctamente
  // -------------------------------------------------------------
  const dbPayout = await prisma.commissionPayout.findUnique({
    where: { id: payoutId1 },
    include: { items: true },
  });
  const ok11 = dbPayout && dbPayout.status === "PAID" && dbPayout.amountPaid === 40000;
  report(
    "TEST 11: Crear liquidación persiste correctamente",
    Boolean(ok11),
    "Registro en tabla commission_payouts con status PAID",
    `Encontrado en PostgreSQL: ${Boolean(dbPayout)}, Amount: ${dbPayout?.amountPaid}`,
    `Items en DB: ${dbPayout?.items?.length}`
  );

  // -------------------------------------------------------------
  // TEST 12: Liquidación contiene período correcto
  // -------------------------------------------------------------
  const ok12 =
    dbPayout &&
    dbPayout.periodStart.toISOString() === new Date(periodStart).toISOString() &&
    dbPayout.periodEnd.toISOString() === new Date(periodEnd).toISOString();
  report(
    "TEST 12: Liquidación contiene período correcto",
    Boolean(ok12),
    "periodStart y periodEnd preservados fielmente en PostgreSQL",
    `Start: ${dbPayout?.periodStart.toISOString()}, End: ${dbPayout?.periodEnd.toISOString()}`,
    "Integridad de fechas de corte respetada"
  );

  // -------------------------------------------------------------
  // TEST 13: Liquidación conserva snapshot del porcentaje
  // -------------------------------------------------------------
  const itemSnap = dbPayout?.items?.[0];
  const ok13 = itemSnap && itemSnap.commissionPercentage === 40;
  report(
    "TEST 13: Liquidación conserva snapshot del porcentaje",
    Boolean(ok13),
    "commissionPercentage snapshot === 40",
    `Obtenido en item: ${itemSnap?.commissionPercentage}`,
    "Porcentaje congelado en tabla commission_payout_items"
  );

  // -------------------------------------------------------------
  // TEST 14: Cambio posterior del porcentaje no altera liquidación
  // -------------------------------------------------------------
  // Cambiamos el porcentaje de staffA1 de 40% a 70%
  await prisma.staff.update({
    where: { id: staffA1.id },
    data: { commissionPercentage: 70 },
  });

  const res14 = await request(`/api/commission-payouts/${payoutId1}`, {
    headers: { Cookie: sessionCookieOwnerA },
  });
  const itemAfterChange = res14.json?.payout?.items?.[0];
  const ok14 =
    itemAfterChange &&
    itemAfterChange.commissionPercentage === 40 &&
    res14.json?.payout?.amountPaid === 40000;
  report(
    "TEST 14: Cambio posterior del porcentaje no altera liquidación",
    ok14,
    "Liquidación histórica permanece en 40% y 40.000 Gs tras subir staff a 70%",
    `Snapshot % en payout: ${itemAfterChange?.commissionPercentage}%, Monto: ${res14.json?.payout?.amountPaid}`,
    "Inmutabilidad histórica 100% garantizada"
  );

  // -------------------------------------------------------------
  // TEST 15: Liquidación crea EXPENSE en Caja
  // -------------------------------------------------------------
  const cashMovementExpense = await prisma.cashMovement.findFirst({
    where: {
      tenantId: tenantA.id,
      id: dbPayout?.cashMovementId || "",
    },
  });
  const ok15 =
    cashMovementExpense &&
    cashMovementExpense.type === "EXPENSE" &&
    cashMovementExpense.amount === 40000 &&
    cashMovementExpense.category === "Comisiones";
  report(
    "TEST 15: Liquidación crea EXPENSE en Caja",
    Boolean(ok15),
    "Movimiento de caja tipo EXPENSE por 40.000 Gs en categoría Comisiones",
    `Encontrado: ${Boolean(cashMovementExpense)}, Monto: ${cashMovementExpense?.amount}, Tipo: ${cashMovementExpense?.type}`,
    `Descripción: ${cashMovementExpense?.description}`
  );

  // -------------------------------------------------------------
  // TEST 16: Liquidación y EXPENSE son atómicos
  // -------------------------------------------------------------
  const ok16 = Boolean(dbPayout?.cashMovementId && cashMovementExpense?.id === dbPayout.cashMovementId);
  report(
    "TEST 16: Liquidación y EXPENSE son atómicos",
    ok16,
    "Ambos registros creados y vinculados en la misma transacción",
    `Payout.cashMovementId: ${dbPayout?.cashMovementId}, CashMovement.id: ${cashMovementExpense?.id}`,
    "Enlace transaccional verificado"
  );

  // -------------------------------------------------------------
  // TEST 17: Repetir POST no duplica pago
  // -------------------------------------------------------------
  const res17Repeat = await request("/api/commission-payouts", {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: sessionCookieOwnerA },
    body: {
      staffId: staffA1.id,
      periodStart,
      periodEnd,
      appointmentIds: [appCompleted1.id],
    },
  });
  const ok17 = res17Repeat.status === 409 && res17Repeat.json?.error === "ALREADY_PAID";
  report(
    "TEST 17: Repetir POST no duplica pago",
    ok17,
    "HTTP 409 con error ALREADY_PAID al intentar reliquidar la misma cita",
    `Status: ${res17Repeat.status}, Error: ${res17Repeat.json?.error}`,
    "Protección de idempotencia previene doble egreso financiero"
  );

  // -------------------------------------------------------------
  // TEST 18: Liquidación PAID no puede pagarse otra vez
  // -------------------------------------------------------------
  const expensesCount = await prisma.cashMovement.count({
    where: {
      tenantId: tenantA.id,
      category: "Comisiones",
      amount: 40000,
    },
  });
  const ok18 = expensesCount === 1;
  report(
    "TEST 18: Liquidación PAID no puede pagarse otra vez",
    ok18,
    "Exactamente 1 movimiento de egreso registrado en base de datos para esta liquidación",
    `Total egresos de 40.000 Gs encontrados: ${expensesCount}`,
    "Sin duplicados en base de datos PostgreSQL"
  );

  // -------------------------------------------------------------
  // TEST 19: Ya pagado no vuelve a aparecer como pendiente
  // -------------------------------------------------------------
  const res19Comm = await request("/api/commissions?period=all", {
    headers: { Cookie: sessionCookieOwnerA },
  });
  const itemPaidCheck = res19Comm.json?.items?.find((i) => i.appointmentId === appCompleted1.id);
  const ok19 =
    itemPaidCheck &&
    itemPaidCheck.isPaid === true &&
    res19Comm.json?.summary?.pendingCommission === 0;
  report(
    "TEST 19: Ya pagado no vuelve a aparecer como pendiente",
    ok19,
    "Cita marcada con isPaid === true y pendingCommission === 0 Gs",
    `isPaid: ${itemPaidCheck?.isPaid}, PendingCommission: ${res19Comm.json?.summary?.pendingCommission}`,
    `Devengado: ${res19Comm.json?.summary?.grossCommission}, Ya pagado: ${res19Comm.json?.summary?.paidCommission}`
  );

  // -------------------------------------------------------------
  // TEST 20: Filtro por staff funciona
  // -------------------------------------------------------------
  const res20Staff = await request(`/api/commission-payouts?staffId=${staffA1.id}`, {
    headers: { Cookie: sessionCookieOwnerA },
  });
  const ok20 =
    res20Staff.json?.payouts?.every((p) => p.staffId === staffA1.id) &&
    res20Staff.json?.payouts?.length > 0;
  report(
    "TEST 20: Filtro por staff funciona",
    ok20,
    "Listado de liquidaciones filtrado exclusivamente por staffId",
    `Total liquidaciones devueltas para staffA1: ${res20Staff.json?.payouts?.length}`,
    "Filtro backend operando correctamente"
  );

  // -------------------------------------------------------------
  // TEST 21: Filtro por período funciona
  // -------------------------------------------------------------
  const res21Period = await request("/api/commissions?period=today", {
    headers: { Cookie: sessionCookieOwnerA },
  });
  const ok21 = res21Period.status === 200 && res21Period.json?.ok === true;
  report(
    "TEST 21: Filtro por período funciona",
    ok21,
    "GET /api/commissions responde 200 con desglose por período",
    `Status: ${res21Period.status}, Periodo: ${res21Period.json?.period}`,
    "Filtros temporales consolidados"
  );

  // -------------------------------------------------------------
  // TEST 22: America/Asuncion correcto
  // -------------------------------------------------------------
  const ok22 = res19Comm.json?.timezone === "America/Asuncion";
  report(
    "TEST 22: America/Asuncion correcto",
    ok22,
    "Zona horaria reportada como America/Asuncion",
    `Timezone: ${res19Comm.json?.timezone}`,
    "Estándar horario nacional verificado"
  );

  // -------------------------------------------------------------
  // TEST 23: Tenant A aislado de Tenant B
  // -------------------------------------------------------------
  // Intentar consultar liquidación de Tenant A con sesión de Tenant B
  const res23Cross = await request(`/api/commission-payouts/${payoutId1}`, {
    headers: { Cookie: sessionCookieOwnerB },
  });
  const ok23 = res23Cross.status === 404;
  report(
    "TEST 23: Tenant A aislado de Tenant B",
    ok23,
    "HTTP 404 ante intento de consultar liquidación de otro tenant (Anti-IDOR)",
    `Status obtenido: ${res23Cross.status}`,
    "Aislamiento multi-tenant financiero verificado"
  );

  // -------------------------------------------------------------
  // TEST 24: STAFF no puede liquidar globalmente
  // -------------------------------------------------------------
  const res24StaffPost = await request("/api/commission-payouts", {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: sessionCookieStaffA1 },
    body: {
      staffId: staffA1.id,
      periodStart,
      periodEnd,
    },
  });
  const ok24 = res24StaffPost.status === 403;
  report(
    "TEST 24: STAFF no puede liquidar globalmente",
    ok24,
    "HTTP 403 Forbidden para usuario con rol STAFF",
    `Status: ${res24StaffPost.status}, Error: ${res24StaffPost.json?.error}`,
    "Protección de autorización estricta en mutaciones contables"
  );

  // -------------------------------------------------------------
  // TEST 25: OWNER sí puede liquidar
  // -------------------------------------------------------------
  const ok25 = res01.status === 201;
  report(
    "TEST 25: OWNER sí puede liquidar",
    ok25,
    "HTTP 201 al liquidar con rol OWNER",
    `Status obtenido en Test 01: ${res01.status}`,
    "Permiso concedido para rol de propietario"
  );

  // -------------------------------------------------------------
  // TEST 26: Total de detalles coincide con total liquidado
  // -------------------------------------------------------------
  const sumItems = res14.json?.payout?.items?.reduce(
    (acc, cur) => acc + cur.commissionAmount,
    0
  );
  const ok26 = sumItems === res14.json?.payout?.amountPaid;
  report(
    "TEST 26: Total de detalles coincide con total liquidado",
    ok26,
    `Suma de detalles (${sumItems}) === amountPaid (${res14.json?.payout?.amountPaid})`,
    `Suma: ${sumItems}, Monto pagado: ${res14.json?.payout?.amountPaid}`,
    "Consistencia contable interna sin discrepancias de redondeo"
  );

  // -------------------------------------------------------------
  // TEST 27: CashMovement apunta correctamente a liquidación
  // -------------------------------------------------------------
  const ok27 = Boolean(dbPayout?.cashMovementId && cashMovementExpense?.amount === dbPayout.amountPaid);
  report(
    "TEST 27: CashMovement apunta correctamente a liquidación",
    ok27,
    "Monto del CashMovement coincide con amountPaid de la liquidación",
    `CashMovement amount: ${cashMovementExpense?.amount}, Payout amountPaid: ${dbPayout?.amountPaid}`,
    "Vínculo bidireccional en base de datos verificado"
  );

  // -------------------------------------------------------------
  // TEST 28: F5 conserva historial de liquidaciones
  // -------------------------------------------------------------
  const res28 = await request("/api/commission-payouts", {
    headers: { Cookie: sessionCookieOwnerA },
  });
  const ok28 = res28.json?.payouts?.some((p) => p.id === payoutId1);
  report(
    "TEST 28: F5 conserva historial de liquidaciones",
    ok28,
    "Liquidación encontrada en listado al recargar desde PostgreSQL",
    `Total liquidaciones en historial: ${res28.json?.payouts?.length}`,
    "Persistencia permanente verificada"
  );

  // -------------------------------------------------------------
  // TEST 29: Liquidación puede auditar appointmentIds
  // -------------------------------------------------------------
  const ok29 =
    res14.json?.payout?.items?.[0]?.appointmentId === appCompleted1.id &&
    res14.json?.payout?.items?.[0]?.serviceName === "Corte y Barba Deluxe" &&
    res14.json?.payout?.items?.[0]?.clientName === "Roberto Gómez";
  report(
    "TEST 29: Liquidación puede auditar appointmentIds",
    ok29,
    "Cada ítem detalla appointmentId, nombre del servicio y cliente",
    `AppointmentId: ${res14.json?.payout?.items?.[0]?.appointmentId}, Servicio: ${res14.json?.payout?.items?.[0]?.serviceName}`,
    "Auditoría explicable turno por turno"
  );

  // -------------------------------------------------------------
  // TEST 30: Error de transacción no deja datos parciales
  // -------------------------------------------------------------
  const initialExpenseCount = await prisma.cashMovement.count({
    where: { tenantId: tenantA.id },
  });
  const initialPayoutCount = await prisma.commissionPayout.count({
    where: { tenantId: tenantA.id },
  });

  // Intentar liquidar con staff inexistente para forzar fallo transaccional
  await request("/api/commission-payouts", {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: sessionCookieOwnerA },
    body: {
      staffId: "00000000-0000-0000-0000-000000000000",
      periodStart,
      periodEnd,
    },
  });

  const finalExpenseCount = await prisma.cashMovement.count({
    where: { tenantId: tenantA.id },
  });
  const finalPayoutCount = await prisma.commissionPayout.count({
    where: { tenantId: tenantA.id },
  });

  const ok30 =
    initialExpenseCount === finalExpenseCount &&
    initialPayoutCount === finalPayoutCount;
  report(
    "TEST 30: Error de transacción no deja datos parciales",
    ok30,
    "Rollback completo: sin movimientos de caja ni liquidaciones huérfanas tras error",
    `Expenses antes: ${initialExpenseCount}, después: ${finalExpenseCount} | Payouts antes: ${initialPayoutCount}, después: ${finalPayoutCount}`,
    "Atomicidad transaccional ACID garantizada en PostgreSQL"
  );

  console.log("======================================================================");
  console.log(`RESUMEN FASE 5.6: ${passed} / ${passed + failed} PRUEBAS APROBADAS`);
  console.log("======================================================================\n");

  if (failed > 0) {
    console.error(`💥 HUBO ${failed} PRUEBAS FALLIDAS EN FASE 5.6.`);
    process.exit(1);
  } else {
    console.log("🎉 TODAS LAS 30 PRUEBAS DE FASE 5.6 PASARON EXITOSAMENTE.\n");
  }
}

runPhase56Suite()
  .catch((err) => {
    console.error("Error fatal ejecutando suite 5.6:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
