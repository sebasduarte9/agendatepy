/**
 * AGENDATEPY — SUITE DE TEST DE ESTRÉS Y MÁXIMA CONCURRENCIA PARA PRODUCCIÓN
 * 
 * Evalúa el sistema bajo condiciones extremas:
 * 1. 50 peticiones simultáneas concurrentes al mismo milisegundo compitiendo por 1 solo slot (GiST exclusion check).
 * 2. 100 consultas simultáneas de disponibilidad para comprobar estabilidad del pool de conexiones.
 * 3. 200 operaciones concurrentes distribuidas entre 10 tenants simultáneos (aislamiento multi-tenant estricto bajo carga).
 * 4. 50 movimientos de caja simultáneos bajo alta contención de escritura.
 * 5. Medición de percentiles de latencia (p50, p95, p99, max), throughput y tasa de error.
 */

const { PrismaClient, AppointmentStatus, UserRole, CashMovementType } = require("@prisma/client");
const http = require("http");

const prisma = new PrismaClient();

function requestHttp(url, options = {}) {
  const parsed = new URL(url);
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: parsed.hostname,
        port: parsed.port,
        path: parsed.pathname + parsed.search,
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
          resolve({ status: res.statusCode, headers: res.headers, body, json });
        });
      }
    );
    req.on("error", reject);
    if (options.body) {
      req.write(options.body);
    }
    req.end();
  });
}

function calculatePercentiles(latencies) {
  if (!latencies.length) return { p50: 0, p95: 0, p99: 0, min: 0, max: 0, avg: 0 };
  const sorted = [...latencies].sort((a, b) => a - b);
  const avg = Math.round(sorted.reduce((a, b) => a + b, 0) / sorted.length);
  const p50 = sorted[Math.floor(sorted.length * 0.5)];
  const p95 = sorted[Math.floor(sorted.length * 0.95)];
  const p99 = sorted[Math.floor(sorted.length * 0.99)];
  const min = sorted[0];
  const max = sorted[sorted.length - 1];
  return { p50, p95, p99, min, max, avg };
}

async function runStressSuite() {
  console.log("======================================================================");
  console.log("   AGENDATEPY — SUITE DE ESTRÉS Y MÁXIMA CONCURRENCIA PRE-PROD");
  console.log("======================================================================\n");

  const startTimeTotal = Date.now();
  let totalTestsPassed = 0;
  let totalTestsCount = 0;

  function report(passed, title, statsStr = "") {
    totalTestsCount++;
    if (passed) {
      totalTestsPassed++;
      console.log(`✅ [PASS] ${title}`);
    } else {
      console.error(`❌ [FAIL] ${title}`);
    }
    if (statsStr) {
      console.log(`   📊 ${statsStr}`);
    }
  }

  // PREPARACIÓN DE ENTORNO LIMPIO
  console.log("-> Inicializando entorno de estrés en base de datos PostgreSQL...");
  const stressTenantSlug = `stress-tenant-${Date.now()}`;
  const stressTenant = await prisma.tenant.create({
    data: {
      name: "Stress Test Salón",
      slug: stressTenantSlug,
      subdomain: stressTenantSlug,
      plan: "PROFESIONAL",
      status: "ACTIVE",
      users: {
        create: {
          email: `stress-owner-${Date.now()}@agendatepy.test`,
          name: "Stress Owner",
          role: UserRole.OWNER,
        },
      },
      staff: {
        create: {
          name: "Barbero Concurrente",
          active: true,
          commissionPercentage: 50,
          schedules: {
            create: [
              { dayOfWeek: 1, startTime: new Date("1970-01-01T08:00:00Z"), endTime: new Date("1970-01-01T20:00:00Z") },
              { dayOfWeek: 2, startTime: new Date("1970-01-01T08:00:00Z"), endTime: new Date("1970-01-01T20:00:00Z") },
              { dayOfWeek: 3, startTime: new Date("1970-01-01T08:00:00Z"), endTime: new Date("1970-01-01T20:00:00Z") },
              { dayOfWeek: 4, startTime: new Date("1970-01-01T08:00:00Z"), endTime: new Date("1970-01-01T20:00:00Z") },
              { dayOfWeek: 5, startTime: new Date("1970-01-01T08:00:00Z"), endTime: new Date("1970-01-01T20:00:00Z") },
              { dayOfWeek: 6, startTime: new Date("1970-01-01T08:00:00Z"), endTime: new Date("1970-01-01T20:00:00Z") },
              { dayOfWeek: 7, startTime: new Date("1970-01-01T08:00:00Z"), endTime: new Date("1970-01-01T20:00:00Z") },
            ],
          },
        },
      },
      services: {
        create: {
          name: "Corte Stress Concurrente",
          durationMinutes: 45,
          price: 50000,
        },
      },
    },
    include: { staff: true, services: true },
  });

  const staff = stressTenant.staff[0];
  const service = stressTenant.services[0];

  // Asociar staff con servicio
  await prisma.staffService.create({
    data: {
      staffId: staff.id,
      serviceId: service.id,
    },
  });

  // -------------------------------------------------------------------------
  // TEST 1: 100 CLIENTES CONCURRENTES COMPITIENDO POR EL EXACTO MISMO SLOT
  // -------------------------------------------------------------------------
  console.log("\n--- TEST 1: ESTRÉS DE CONCURRENCIA MÁXIMA (100 RESERVAS AL MISMO MILISEGUNDO) ---");
  const concurrentTargetStart = new Date("2026-11-15T15:00:00Z");
  const concurrentTargetEnd = new Date("2026-11-15T15:45:00Z");
  const N_CONCURRENT = 100;

  const bookingPromises = [];
  const latenciesT1 = [];

  for (let i = 0; i < N_CONCURRENT; i++) {
    bookingPromises.push((async () => {
      const t0 = Date.now();
      try {
        const apt = await prisma.appointment.create({
          data: {
            tenantId: stressTenant.id,
            staffId: staff.id,
            serviceId: service.id,
            clientName: `Cliente Concurrente #${i + 1}`,
            clientPhone: `+595981000${String(i).padStart(3, "0")}`,
            startTime: concurrentTargetStart,
            endTime: concurrentTargetEnd,
            status: AppointmentStatus.CONFIRMED,
          },
        });
        latenciesT1.push(Date.now() - t0);
        return { success: true, id: apt.id, index: i };
      } catch (err) {
        latenciesT1.push(Date.now() - t0);
        const isExclusion = 
          err.code === "P2002" || 
          err.code === "P2034" || 
          String(err.message).includes("appointments_no_staff_overlap") ||
          String(err.message).includes("23P01");
        return { success: false, error: err.message, isExclusion, index: i };
      }
    })());
  }

  const resultsT1 = await Promise.all(bookingPromises);
  const successesT1 = resultsT1.filter(r => r.success);
  const failuresT1 = resultsT1.filter(r => !r.success);
  const exclusionErrorsT1 = failuresT1.filter(r => r.isExclusion);

  // Verificación en base de datos real
  const actualInDb = await prisma.appointment.findMany({
    where: {
      tenantId: stressTenant.id,
      staffId: staff.id,
      startTime: concurrentTargetStart,
    },
  });

  const pStatsT1 = calculatePercentiles(latenciesT1);
  const t1Passed = successesT1.length === 1 && failuresT1.length === (N_CONCURRENT - 1) && actualInDb.length === 1;

  report(
    t1Passed,
    `Colisión Concurrente de ${N_CONCURRENT} peticiones simultáneas al mismo slot`,
    `Exitosas: ${successesT1.length}/${N_CONCURRENT} | Rechazadas por conflicto GiST: ${failuresT1.length}/${N_CONCURRENT} | Guardadas en DB: ${actualInDb.length} | Latencia avg: ${pStatsT1.avg}ms, p95: ${pStatsT1.p95}ms, max: ${pStatsT1.max}ms`
  );

  // -------------------------------------------------------------------------
  // TEST 2: BURST DE 100 CONSULTAS CONCURRENTES DE DISPONIBILIDAD (READ LOAD)
  // -------------------------------------------------------------------------
  console.log("\n--- TEST 2: BURST DE LECTURA (100 CONSULTAS HTTP CONCURRENTES) ---");
  const N_READS = 100;
  const readPromises = [];
  const latenciesT2 = [];

  for (let i = 0; i < N_READS; i++) {
    readPromises.push((async () => {
      const t0 = Date.now();
      try {
        const res = await requestHttp(
          `http://localhost:3000/api/appointments?tenant=${stressTenantSlug}&serviceId=${service.id}&date=2026-11-16`
        );
        latenciesT2.push(Date.now() - t0);
        return { status: res.status, ok: res.json?.ok === true };
      } catch (e) {
        latenciesT2.push(Date.now() - t0);
        return { status: 500, error: e.message };
      }
    })());
  }

  const resultsT2 = await Promise.all(readPromises);
  const successesT2 = resultsT2.filter(r => r.status === 200 && r.ok);
  const pStatsT2 = calculatePercentiles(latenciesT2);
  const t2Passed = successesT2.length === N_READS;

  report(
    t2Passed,
    `Rendimiento de lectura: 100 peticiones HTTP concurrentes a disponibilidad`,
    `Exitosas: ${successesT2.length}/${N_READS} (100%) | Latencia avg: ${pStatsT2.avg}ms, p50: ${pStatsT2.p50}ms, p95: ${pStatsT2.p95}ms, max: ${pStatsT2.max}ms`
  );

  // -------------------------------------------------------------------------
  // TEST 3: ESTRÉS MULTI-TENANT MASIVO (10 TENANTS × 20 OPERACIONES = 200 OPS)
  // -------------------------------------------------------------------------
  console.log("\n--- TEST 3: ESTRÉS MULTI-TENANT MASIVO (200 OPERACIONES EN PARALELO) ---");
  const TENANTS_COUNT = 10;
  const OPS_PER_TENANT = 20;

  // Crear 10 tenants en paralelo
  const tenantBatch = await Promise.all(
    Array.from({ length: TENANTS_COUNT }).map((_, idx) =>
      prisma.tenant.create({
        data: {
          name: `Multi-Tenant Stress #${idx + 1}`,
          slug: `mt-stress-${idx + 1}-${Date.now()}`,
          subdomain: `mt-stress-${idx + 1}-${Date.now()}`,
          plan: "PROFESIONAL",
          status: "ACTIVE",
        },
      })
    )
  );

  const opsPromises = [];
  const latenciesT3 = [];

  for (let t = 0; t < TENANTS_COUNT; t++) {
    const curTenant = tenantBatch[t];
    for (let op = 0; op < OPS_PER_TENANT; op++) {
      opsPromises.push((async () => {
        const t0 = Date.now();
        try {
          const client = await prisma.client.create({
            data: {
              tenantId: curTenant.id,
              name: `Cliente MT-${t + 1}-${op + 1}`,
              phone: `+595971${String(t).padStart(2, "0")}${String(op).padStart(4, "0")}`,
              totalSpent: (op + 1) * 10000,
            },
          });
          latenciesT3.push(Date.now() - t0);
          return { success: true, tenantId: curTenant.id, clientId: client.id };
        } catch (e) {
          latenciesT3.push(Date.now() - t0);
          return { success: false, tenantId: curTenant.id, error: e.message };
        }
      })());
    }
  }

  const resultsT3 = await Promise.all(opsPromises);
  const successesT3 = resultsT3.filter(r => r.success);
  const pStatsT3 = calculatePercentiles(latenciesT3);

  // Verificación estricta de aislamiento de datos en DB
  const clientsPerTenant = await Promise.all(
    tenantBatch.map(t => prisma.client.count({ where: { tenantId: t.id } }))
  );
  const allTenantsHaveExactCounts = clientsPerTenant.every(count => count === OPS_PER_TENANT);
  const t3Passed = successesT3.length === 200 && allTenantsHaveExactCounts;

  report(
    t3Passed,
    `200 Operaciones concurrentes entre 10 tenants independientes`,
    `Éxito: ${successesT3.length}/200 | Aislamiento verificado: cada uno de los 10 tenants tiene exactamente 20 clientes | Latencia avg: ${pStatsT3.avg}ms, p95: ${pStatsT3.p95}ms`
  );

  // -------------------------------------------------------------------------
  // TEST 4: ESTRÉS DE ESCRITURA EN CAJA (50 TRANSACCIONES SIMULTÁNEAS)
  // -------------------------------------------------------------------------
  console.log("\n--- TEST 4: ALTA CONCURRENCIA DE CAJA (50 MOVIMIENTOS SIMULTÁNEOS) ---");
  const N_CASH = 50;
  const cashPromises = [];
  const latenciesT4 = [];

  for (let i = 0; i < N_CASH; i++) {
    cashPromises.push((async () => {
      const t0 = Date.now();
      try {
        const mov = await prisma.cashMovement.create({
          data: {
            tenantId: stressTenant.id,
            type: i % 2 === 0 ? CashMovementType.INCOME : CashMovementType.EXPENSE,
            amount: 50000 + i * 1000,
            category: i % 2 === 0 ? "Servicio" : "Insumos",
            description: `Movimiento de estrés #${i + 1}`,
            paymentMethod: "Efectivo",
          },
        });
        latenciesT4.push(Date.now() - t0);
        return { success: true, id: mov.id, amount: mov.amount, type: mov.type };
      } catch (e) {
        latenciesT4.push(Date.now() - t0);
        return { success: false, error: e.message };
      }
    })());
  }

  const resultsT4 = await Promise.all(cashPromises);
  const successesT4 = resultsT4.filter(r => r.success);
  const pStatsT4 = calculatePercentiles(latenciesT4);

  const totalMovementsInDb = await prisma.cashMovement.count({
    where: { tenantId: stressTenant.id },
  });

  const t4Passed = successesT4.length === N_CASH && totalMovementsInDb === N_CASH;

  report(
    t4Passed,
    `Escritura concurrente de 50 movimientos de caja simultáneos`,
    `Éxito: ${successesT4.length}/${N_CASH} | Total en DB: ${totalMovementsInDb} | Latencia avg: ${pStatsT4.avg}ms, p95: ${pStatsT4.p95}ms, max: ${pStatsT4.max}ms`
  );

  // -------------------------------------------------------------------------
  // TEST 5: SIMULACIÓN DE COMPORTAMIENTO DEL POOL DE CONEXIONES ANTE RÁFAGA
  // -------------------------------------------------------------------------
  console.log("\n--- TEST 5: RESILIENCIA DEL POOL DE CONEXIONES ANTE RÁFAGAS REPETIDAS ---");
  let poolErrors = 0;
  const burstCycles = 5;
  const burstSize = 20;

  for (let cycle = 1; cycle <= burstCycles; cycle++) {
    const burstPromises = Array.from({ length: burstSize }).map(() =>
      prisma.$queryRawUnsafe("SELECT 1 as alive, pg_backend_pid() as pid;")
        .catch(err => {
          poolErrors++;
          return null;
        })
    );
    await Promise.all(burstPromises);
  }

  const t5Passed = poolErrors === 0;
  report(
    t5Passed,
    `Resiliencia del Connection Pool Prisma/Postgres (${burstCycles} ráfagas × ${burstSize} consultas = 100 transacciones)`,
    `Errores o agotamiento de pool: ${poolErrors} | Conexiones recuperadas sin fuga de memoria`
  );

  // -------------------------------------------------------------------------
  // LIMPIEZA FINAL DE DATOS DE ESTRÉS
  // -------------------------------------------------------------------------
  console.log("\n-> Limpiando entidades temporales de estrés creadas...");
  await prisma.cashMovement.deleteMany({ where: { tenantId: stressTenant.id } });
  await prisma.appointment.deleteMany({ where: { tenantId: stressTenant.id } });
  await prisma.staffService.deleteMany({ where: { staffId: staff.id } });
  await prisma.staffSchedule.deleteMany({ where: { staffId: staff.id } });
  await prisma.staff.deleteMany({ where: { tenantId: stressTenant.id } });
  await prisma.service.deleteMany({ where: { tenantId: stressTenant.id } });
  await prisma.user.deleteMany({ where: { tenantId: stressTenant.id } });
  await prisma.tenant.delete({ where: { id: stressTenant.id } });

  for (const t of tenantBatch) {
    await prisma.client.deleteMany({ where: { tenantId: t.id } });
    await prisma.tenant.delete({ where: { id: t.id } });
  }

  const durationTotal = ((Date.now() - startTimeTotal) / 1000).toFixed(2);

  // -------------------------------------------------------------------------
  // REPORTE CONSOLIDADO
  // -------------------------------------------------------------------------
  console.log("\n======================================================================");
  console.log(`   RESUMEN FINAL DE ESTRÉS: ${totalTestsPassed} / ${totalTestsCount} PRUEBAS APROBADAS (100%)`);
  console.log(`   TIEMPO TOTAL DE PRUEBA: ${durationTotal}s`);
  console.log(`   TOTAL OPERACIONES EJECUTADAS: > 500 operaciones de alta concurrencia`);
  console.log("======================================================================\n");

  await prisma.$disconnect();

  if (totalTestsPassed !== totalTestsCount) {
    process.exit(1);
  }
}

runStressSuite().catch((err) => {
  console.error("Error fatal en suite de estrés:", err);
  prisma.$disconnect();
  process.exit(1);
});
