/**
 * Suite de Pruebas Automatizadas — FASE 5.5
 * COMISIONES OPERATIVAS + RENDIMIENTO DE STAFF (Tests 1 - 20)
 *
 * 01 COMPLETED + cobro genera comisión.
 * 02 CONFIRMED no genera.
 * 03 CANCELLED no genera.
 * 04 NO_SHOW no genera.
 * 05 COMPLETED sin cobro no genera.
 * 06 100.000 × 40% = 40.000.
 * 07 split payment 50k + 50k = base 100k.
 * 08 EXPENSE no afecta.
 * 09 Cash de otra cita no afecta.
 * 10 refresh no duplica.
 * 11 sync repetido no duplica.
 * 12 filtro por staff funciona.
 * 13 filtro por período funciona.
 * 14 timezone correcta.
 * 15 Tenant A aislado de B.
 * 16 OWNER puede consultar.
 * 17 STAFF respeta restricciones actuales.
 * 18 comisión puede rastrearse al appointmentId.
 * 19 monto coincide con CashMovement.
 * 20 varias citas producen suma correcta.
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

async function runPhase55Suite() {
  console.log("======================================================================");
  console.log("   FASE 5.5: COMISIONES OPERATIVAS + RENDIMIENTO (TESTS 1 - 20)       ");
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
  const slugA = `estudio-f55-a-${timestamp}`;
  const slugB = `estudio-f55-b-${timestamp}`;

  // Tenant A
  const tenantA = await prisma.tenant.create({
    data: {
      name: `Estudio Comisiones A ${timestamp}`,
      slug: slugA,
      subdomain: slugA,
      plan: "PROFESIONAL",
      status: "ACTIVE",
      timezone: "America/Asuncion",
    },
  });

  const ownerA = await prisma.user.create({
    data: {
      email: `owner.f55.a.${timestamp}@agendate.py`,
      name: "Owner A",
      role: "OWNER",
      tenantId: tenantA.id,
    },
  });

  // Staff A1: 40% comision
  const staffA1 = await prisma.staff.create({
    data: {
      tenantId: tenantA.id,
      name: "Carlos Barbero",
      active: true,
      commissionPercentage: 40,
    },
  });

  // Staff A2: 50% comision
  const staffA2 = await prisma.staff.create({
    data: {
      tenantId: tenantA.id,
      name: "Lucía Colorista",
      active: true,
      commissionPercentage: 50,
    },
  });

  // User con rol STAFF vinculado a staffA1
  const userStaffA1 = await prisma.user.create({
    data: {
      email: `staff.f55.a1.${timestamp}@agendate.py`,
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
      email: `owner.f55.b.${timestamp}@agendate.py`,
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

  // Fecha base para citas hoy (para coincidir con America/Asuncion)
  const now = new Date();
  const startTime1 = new Date(now.getTime() - 1000 * 60 * 60 * 2); // hace 2 horas
  const endTime1 = new Date(startTime1.getTime() + 1000 * 60 * 60);

  // Cita 1: COMPLETED, staffA1 (40%), precio lista 150k, cobrado 100k
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

  // Movimiento de caja INCOME 100k para appCompleted1
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
  // TEST 01: COMPLETED + cobro genera comisión
  // -------------------------------------------------------------
  const res01 = await request("/api/commissions?period=all", {
    headers: { Cookie: sessionCookieOwnerA },
  });
  const ok01 =
    res01.status === 200 &&
    res01.json?.ok === true &&
    res01.json?.items?.some((i) => i.appointmentId === appCompleted1.id);
  report(
    "TEST 01: COMPLETED + cobro genera comisión",
    ok01,
    "Status 200 y la cita completada con cobro genera comisión",
    `Status: ${res01.status}, Items: ${res01.json?.items?.length}`,
    `Cita ${appCompleted1.id} registrada con comisión: Gs. ${res01.json?.items?.[0]?.commissionAmount}`
  );

  // -------------------------------------------------------------
  // TEST 02: CONFIRMED no genera comisión
  // -------------------------------------------------------------
  const startTime2 = new Date(now.getTime() + 1000 * 60 * 60 * 24); // mañana
  const endTime2 = new Date(startTime2.getTime() + 1000 * 60 * 60);
  const appConfirmed = await prisma.appointment.create({
    data: {
      tenantId: tenantA.id,
      staffId: staffA1.id,
      serviceId: serviceA.id,
      clientId: clientA.id,
      clientName: clientA.name,
      clientPhone: clientA.phone,
      startTime: startTime2,
      endTime: endTime2,
      status: "CONFIRMED",
    },
  });
  // Intentar asociar cash movement
  await prisma.cashMovement.create({
    data: {
      tenantId: tenantA.id,
      type: "INCOME",
      amount: 100000,
      category: "Anticipo",
      description: "Cobro anticipado",
      paymentMethod: "Transferencia",
      appointmentId: appConfirmed.id,
    },
  });

  const res02 = await request("/api/commissions?period=all", {
    headers: { Cookie: sessionCookieOwnerA },
  });
  const ok02 = !res02.json?.items?.some((i) => i.appointmentId === appConfirmed.id);
  report(
    "TEST 02: CONFIRMED no genera comisión",
    ok02,
    "Cita CONFIRMED excluida de comisiones a pesar de tener cobro",
    `Encontrada en comisiones: ${!ok02}`,
    "Regla de negocio: solo citas con status COMPLETED son comisionables"
  );

  // -------------------------------------------------------------
  // TEST 03: CANCELLED no genera comisión
  // -------------------------------------------------------------
  const startTime3 = new Date(now.getTime() + 1000 * 60 * 60 * 48);
  const endTime3 = new Date(startTime3.getTime() + 1000 * 60 * 60);
  const appCancelled = await prisma.appointment.create({
    data: {
      tenantId: tenantA.id,
      staffId: staffA1.id,
      serviceId: serviceA.id,
      clientId: clientA.id,
      clientName: clientA.name,
      clientPhone: clientA.phone,
      startTime: startTime3,
      endTime: endTime3,
      status: "CANCELLED",
    },
  });
  await prisma.cashMovement.create({
    data: {
      tenantId: tenantA.id,
      type: "INCOME",
      amount: 50000,
      category: "Seña",
      description: "Seña cita cancelada",
      paymentMethod: "Efectivo",
      appointmentId: appCancelled.id,
    },
  });

  const res03 = await request("/api/commissions?period=all", {
    headers: { Cookie: sessionCookieOwnerA },
  });
  const ok03 = !res03.json?.items?.some((i) => i.appointmentId === appCancelled.id);
  report(
    "TEST 03: CANCELLED no genera comisión",
    ok03,
    "Cita CANCELLED excluida de comisiones",
    `Encontrada en comisiones: ${!ok03}`,
    "Turnos cancelados no remuneran comisión al colaborador"
  );

  // -------------------------------------------------------------
  // TEST 04: NO_SHOW no genera comisión
  // -------------------------------------------------------------
  const startTime4 = new Date(now.getTime() - 1000 * 60 * 60 * 24);
  const endTime4 = new Date(startTime4.getTime() + 1000 * 60 * 60);
  const appNoShow = await prisma.appointment.create({
    data: {
      tenantId: tenantA.id,
      staffId: staffA1.id,
      serviceId: serviceA.id,
      clientId: clientA.id,
      clientName: clientA.name,
      clientPhone: clientA.phone,
      startTime: startTime4,
      endTime: endTime4,
      status: "NO_SHOW",
    },
  });

  const res04 = await request("/api/commissions?period=all", {
    headers: { Cookie: sessionCookieOwnerA },
  });
  const ok04 = !res04.json?.items?.some((i) => i.appointmentId === appNoShow.id);
  report(
    "TEST 04: NO_SHOW no genera comisión",
    ok04,
    "Cita NO_SHOW excluida de comisiones",
    `Encontrada en comisiones: ${!ok04}`,
    "Inasistencia no genera base comisionable"
  );

  // -------------------------------------------------------------
  // TEST 05: COMPLETED sin cobro no genera comisión
  // -------------------------------------------------------------
  const startTime5 = new Date(now.getTime() - 1000 * 60 * 60 * 4);
  const endTime5 = new Date(startTime5.getTime() + 1000 * 60 * 60);
  const appCompletedNoCash = await prisma.appointment.create({
    data: {
      tenantId: tenantA.id,
      staffId: staffA1.id,
      serviceId: serviceA.id,
      clientId: clientA.id,
      clientName: clientA.name,
      clientPhone: clientA.phone,
      startTime: startTime5,
      endTime: endTime5,
      status: "COMPLETED",
    },
  });

  const res05 = await request("/api/commissions?period=all", {
    headers: { Cookie: sessionCookieOwnerA },
  });
  const ok05 = !res05.json?.items?.some((i) => i.appointmentId === appCompletedNoCash.id);
  report(
    "TEST 05: COMPLETED sin cobro no genera comisión",
    ok05,
    "Cita COMPLETED sin CashMovement excluida de comisiones",
    `Encontrada en comisiones: ${!ok05}`,
    "La caja es la fuente estricta de verdad: sin dinero cobrado no hay comisión"
  );

  // -------------------------------------------------------------
  // TEST 06: 100.000 × 40% = 40.000
  // -------------------------------------------------------------
  const item01 = res01.json?.items?.find((i) => i.appointmentId === appCompleted1.id);
  const ok06 =
    item01 &&
    item01.chargedAmount === 100000 &&
    item01.commissionPercentage === 40 &&
    item01.commissionAmount === 40000;
  report(
    "TEST 06: 100.000 × 40% = 40.000",
    ok06,
    "Monto cobrado: 100.000 Gs, Comisión 40% -> 40.000 Gs",
    `Cobrado: ${item01?.chargedAmount}, Porcentaje: ${item01?.commissionPercentage}%, Comisión: ${item01?.commissionAmount}`,
    "Cálculo matemático exacto verificado"
  );

  // -------------------------------------------------------------
  // TEST 07: split payment 50k + 50k = base 100k
  // -------------------------------------------------------------
  const startTime7 = new Date(now.getTime() - 1000 * 60 * 60 * 6);
  const endTime7 = new Date(startTime7.getTime() + 1000 * 60 * 60);
  const appSplit = await prisma.appointment.create({
    data: {
      tenantId: tenantA.id,
      staffId: staffA1.id,
      serviceId: serviceA.id,
      clientId: clientA.id,
      clientName: clientA.name,
      clientPhone: clientA.phone,
      startTime: startTime7,
      endTime: endTime7,
      status: "COMPLETED",
    },
  });

  await prisma.cashMovement.create({
    data: {
      tenantId: tenantA.id,
      type: "INCOME",
      amount: 50000,
      category: "Servicio",
      description: "Pago split 1/2 Efectivo",
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
      description: "Pago split 2/2 POS Tarjeta",
      paymentMethod: "Tarjeta POS",
      appointmentId: appSplit.id,
    },
  });

  const res07 = await request("/api/commissions?period=all", {
    headers: { Cookie: sessionCookieOwnerA },
  });
  const itemSplit = res07.json?.items?.find((i) => i.appointmentId === appSplit.id);
  const ok07 =
    itemSplit &&
    itemSplit.chargedAmount === 100000 &&
    itemSplit.commissionAmount === 40000;
  report(
    "TEST 07: split payment 50k + 50k = base 100k",
    ok07,
    "Split payments consolidados en base de 100.000 Gs y comisión de 40.000 Gs",
    `Base calculada: ${itemSplit?.chargedAmount}, Comisión: ${itemSplit?.commissionAmount}`,
    `Métodos registrados: ${itemSplit?.paymentMethods}`
  );

  // -------------------------------------------------------------
  // TEST 08: EXPENSE no afecta comisión ni base
  // -------------------------------------------------------------
  await prisma.cashMovement.create({
    data: {
      tenantId: tenantA.id,
      type: "EXPENSE",
      amount: 20000,
      category: "Insumo",
      description: "Gasto de insumo asociado",
      paymentMethod: "Efectivo",
      appointmentId: appSplit.id,
    },
  });

  const res08 = await request("/api/commissions?period=all", {
    headers: { Cookie: sessionCookieOwnerA },
  });
  const itemSplitAfterExpense = res08.json?.items?.find((i) => i.appointmentId === appSplit.id);
  const ok08 =
    itemSplitAfterExpense &&
    itemSplitAfterExpense.chargedAmount === 100000 &&
    itemSplitAfterExpense.commissionAmount === 40000;
  report(
    "TEST 08: EXPENSE no afecta base comisionable",
    ok08,
    "Base permanece en 100.000 Gs y comisión en 40.000 Gs tras registrar EXPENSE",
    `Base: ${itemSplitAfterExpense?.chargedAmount}, Comisión: ${itemSplitAfterExpense?.commissionAmount}`,
    "Filtro estricto de type: INCOME operando correctamente"
  );

  // -------------------------------------------------------------
  // TEST 09: Cash de otra cita no afecta
  // -------------------------------------------------------------
  const startTime9 = new Date(now.getTime() - 1000 * 60 * 60 * 8);
  const endTime9 = new Date(startTime9.getTime() + 1000 * 60 * 60);
  const appOther = await prisma.appointment.create({
    data: {
      tenantId: tenantA.id,
      staffId: staffA2.id,
      serviceId: serviceA.id,
      clientId: clientA.id,
      clientName: clientA.name,
      clientPhone: clientA.phone,
      startTime: startTime9,
      endTime: endTime9,
      status: "COMPLETED",
    },
  });
  await prisma.cashMovement.create({
    data: {
      tenantId: tenantA.id,
      type: "INCOME",
      amount: 200000,
      category: "Servicio",
      description: "Cobro cita otra",
      paymentMethod: "Efectivo",
      appointmentId: appOther.id,
    },
  });

  const res09 = await request("/api/commissions?period=all", {
    headers: { Cookie: sessionCookieOwnerA },
  });
  const itemApp1AfterOther = res09.json?.items?.find((i) => i.appointmentId === appCompleted1.id);
  const ok09 = itemApp1AfterOther && itemApp1AfterOther.chargedAmount === 100000;
  report(
    "TEST 09: Cash de otra cita no afecta",
    ok09,
    "Cita 1 permanece con cobrado = 100.000 Gs sin afectación por cita de 200.000 Gs",
    `Cobrado Cita 1: ${itemApp1AfterOther?.chargedAmount}`,
    "Aislamiento por appointmentId garantizado"
  );

  // -------------------------------------------------------------
  // TEST 10: refresh no duplica
  // -------------------------------------------------------------
  const res10a = await request("/api/commissions?period=all", {
    headers: { Cookie: sessionCookieOwnerA },
  });
  const res10b = await request("/api/commissions?period=all", {
    headers: { Cookie: sessionCookieOwnerA },
  });
  const ok10 =
    res10a.json?.summary?.totalCommission === res10b.json?.summary?.totalCommission &&
    res10a.json?.items?.length === res10b.json?.items?.length;
  report(
    "TEST 10: refresh no duplica comisiones",
    ok10,
    "Misma cantidad de items y total de comisiones en llamadas consecutivas",
    `Total A: ${res10a.json?.summary?.totalCommission}, Total B: ${res10b.json?.summary?.totalCommission}`,
    "Cálculo derivado puro y determinista"
  );

  // -------------------------------------------------------------
  // TEST 11: sync repetido no duplica
  // -------------------------------------------------------------
  await request("/api/dashboard/sync", {
    headers: { Cookie: sessionCookieOwnerA },
  });
  const res11 = await request("/api/commissions?period=all", {
    headers: { Cookie: sessionCookieOwnerA },
  });
  const ok11 =
    res11.json?.summary?.totalCommission === res10a.json?.summary?.totalCommission &&
    res11.json?.items?.length === res10a.json?.items?.length;
  report(
    "TEST 11: sync repetido no duplica",
    ok11,
    "Comisiones idénticas antes y después de ejecutar GET /api/dashboard/sync",
    `Items antes: ${res10a.json?.items?.length}, Items después: ${res11.json?.items?.length}`,
    "Consistencia de datos garantizada tras sincronización"
  );

  // -------------------------------------------------------------
  // TEST 12: filtro por staff funciona
  // -------------------------------------------------------------
  const res12A1 = await request(`/api/commissions?period=all&staffId=${staffA1.id}`, {
    headers: { Cookie: sessionCookieOwnerA },
  });
  const res12A2 = await request(`/api/commissions?period=all&staffId=${staffA2.id}`, {
    headers: { Cookie: sessionCookieOwnerA },
  });
  const ok12 =
    res12A1.json?.items?.every((i) => i.staffId === staffA1.id) &&
    res12A2.json?.items?.every((i) => i.staffId === staffA2.id) &&
    res12A1.json?.items?.length > 0 &&
    res12A2.json?.items?.length > 0;
  report(
    "TEST 12: filtro por staff funciona",
    ok12,
    "Filtrado por staffId devuelve exclusivamente turnos del colaborador seleccionado",
    `Staff A1 items: ${res12A1.json?.items?.length}, Staff A2 items: ${res12A2.json?.items?.length}`,
    "Filtrado estricto por profesional verificado"
  );

  // -------------------------------------------------------------
  // TEST 13: filtro por período funciona
  // -------------------------------------------------------------
  const res13Today = await request("/api/commissions?period=today", {
    headers: { Cookie: sessionCookieOwnerA },
  });
  const res13CustomEmpty = await request("/api/commissions?period=custom&startDate=2020-01-01&endDate=2020-01-02", {
    headers: { Cookie: sessionCookieOwnerA },
  });
  const ok13 =
    res13Today.json?.items?.length > 0 &&
    res13CustomEmpty.json?.items?.length === 0;
  report(
    "TEST 13: filtro por período funciona",
    ok13,
    "Período 'today' encuentra citas de hoy y rango histórico vacío devuelve 0",
    `Items Today: ${res13Today.json?.items?.length}, Items 2020: ${res13CustomEmpty.json?.items?.length}`,
    "Filtros temporales activos y operando en base de datos"
  );

  // -------------------------------------------------------------
  // TEST 14: timezone correcta
  // -------------------------------------------------------------
  const ok14 = res13Today.json?.timezone === "America/Asuncion";
  report(
    "TEST 14: timezone correcta",
    ok14,
    "API reporta y procesa en timezone America/Asuncion",
    `Timezone obtenida: ${res13Today.json?.timezone}`,
    "Zona horaria estándar nacional respetada"
  );

  // -------------------------------------------------------------
  // TEST 15: Tenant A aislado de B
  // -------------------------------------------------------------
  // Crear cita completada en Tenant B
  const appB = await prisma.appointment.create({
    data: {
      tenantId: tenantB.id,
      staffId: staffB.id,
      serviceId: serviceA.id, // Mismo service pero tenantB check
      clientName: "Cliente B",
      clientPhone: "+595999888777",
      startTime: startTime1,
      endTime: endTime1,
      status: "COMPLETED",
    },
  });
  await prisma.cashMovement.create({
    data: {
      tenantId: tenantB.id,
      type: "INCOME",
      amount: 300000,
      category: "Servicio",
      description: "Cobro B",
      paymentMethod: "Efectivo",
      appointmentId: appB.id,
    },
  });

  const res15A = await request("/api/commissions?period=all", {
    headers: { Cookie: sessionCookieOwnerA },
  });
  const res15B = await request("/api/commissions?period=all", {
    headers: { Cookie: sessionCookieOwnerA },
  });
  const containsBInA = res15A.json?.items?.some((i) => i.appointmentId === appB.id);
  const ok15 = !containsBInA;
  report(
    "TEST 15: Tenant A aislado de B",
    ok15,
    "Comisiones de Tenant A jamás contienen citas o cobros de Tenant B",
    `Cita de Tenant B en reporte A: ${containsBInA}`,
    "Aislamiento multi-tenant infranqueable"
  );

  // -------------------------------------------------------------
  // TEST 16: OWNER puede consultar
  // -------------------------------------------------------------
  const ok16 = res15A.status === 200 && res15A.json?.ok === true;
  report(
    "TEST 16: OWNER puede consultar",
    ok16,
    "Status HTTP 200 para usuario autenticado con rol OWNER",
    `Status recibido: ${res15A.status}`,
    "Acceso concedido para rol de propietario"
  );

  // -------------------------------------------------------------
  // TEST 17: STAFF respeta restricciones actuales
  // -------------------------------------------------------------
  // STAFF intentando ver comisiones de staffA2 (otro colaborador) -> debe recibir 403
  const res17Forbidden = await request(`/api/commissions?staffId=${staffA2.id}`, {
    headers: { Cookie: sessionCookieStaffA1 },
  });
  // STAFF consultando sus propias comisiones (staffA1) -> debe recibir 200 con solo sus citas
  const res17Own = await request("/api/commissions", {
    headers: { Cookie: sessionCookieStaffA1 },
  });
  const ok17 =
    res17Forbidden.status === 403 &&
    res17Own.status === 200 &&
    res17Own.json?.items?.every((i) => i.staffId === staffA1.id);
  report(
    "TEST 17: STAFF respeta restricciones de seguridad",
    ok17,
    "HTTP 403 al consultar comisiones ajenas y HTTP 200 al consultar las propias",
    `Status ajeno: ${res17Forbidden.status}, Status propio: ${res17Own.status}`,
    `Error ajeno recibido: ${res17Forbidden.json?.error}`
  );

  // -------------------------------------------------------------
  // TEST 18: comisión puede rastrearse al appointmentId
  // -------------------------------------------------------------
  const item18 = res01.json?.items?.find((i) => i.appointmentId === appCompleted1.id);
  const ok18 =
    item18 &&
    item18.appointmentId === appCompleted1.id &&
    item18.serviceName === "Corte y Barba Deluxe" &&
    item18.clientName === "Roberto Gómez";
  report(
    "TEST 18: comisión puede rastrearse al appointmentId",
    ok18,
    "Cada ítem mapea exactamente a un appointmentId con servicio y cliente",
    `ID Cita: ${item18?.appointmentId}, Servicio: ${item18?.serviceName}, Cliente: ${item18?.clientName}`,
    "Auditabilidad completa turno por turno"
  );

  // -------------------------------------------------------------
  // TEST 19: monto coincide con CashMovement (no con Service.price)
  // -------------------------------------------------------------
  // serviceA.price es 150.000, pero en caja se cobró 100.000
  const item19 = res01.json?.items?.find((i) => i.appointmentId === appCompleted1.id);
  const ok19 =
    item19 &&
    item19.chargedAmount === 100000 &&
    item19.servicePrice === 150000 &&
    item19.commissionAmount === 40000;
  report(
    "TEST 19: monto coincide con CashMovement (no con Service.price)",
    ok19,
    "Cobrado es 100.000 Gs (CashMovement) y no 150.000 Gs (Service.price)",
    `Cobrado en caja: ${item19?.chargedAmount}, Precio lista: ${item19?.servicePrice}, Comisión: ${item19?.commissionAmount}`,
    "La caja es la única base comisionable real"
  );

  // -------------------------------------------------------------
  // TEST 20: varias citas producen suma correcta
  // -------------------------------------------------------------
  // appCompleted1: 100k @ 40% = 40k
  // appSplit: 100k @ 40% = 40k
  // appOther: 200k @ 50% = 100k
  // Total cobrado = 400.000 Gs. Total comisión = 180.000 Gs. Servicios = 3
  const res20 = await request("/api/commissions?period=all", {
    headers: { Cookie: sessionCookieOwnerA },
  });
  const summary20 = res20.json?.summary;
  const ok20 =
    summary20 &&
    summary20.totalCharged === 400000 &&
    summary20.commissionableBase === 400000 &&
    summary20.totalCommission === 180000 &&
    summary20.completedServicesCount === 3;
  report(
    "TEST 20: varias citas producen suma agregada correcta",
    ok20,
    "Total cobrado = 400.000 Gs, Comisión = 180.000 Gs, Turnos = 3",
    `Cobrado: ${summary20?.totalCharged}, Comisión: ${summary20?.totalCommission}, Conteo: ${summary20?.completedServicesCount}`,
    "Consolidación aritmética y agregación sin pérdidas"
  );

  console.log("======================================================================");
  console.log(`RESUMEN FASE 5.5: ${passed} / ${passed + failed} PRUEBAS APROBADAS`);
  console.log("======================================================================\n");

  if (failed > 0) {
    console.error(`💥 HUBO ${failed} PRUEBAS FALLIDAS EN FASE 5.5.`);
    process.exit(1);
  } else {
    console.log("🎉 TODAS LAS 20 PRUEBAS DE FASE 5.5 PASARON EXITOSAMENTE.\n");
  }
}

runPhase55Suite()
  .catch((err) => {
    console.error("Error fatal ejecutando suite 5.5:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
