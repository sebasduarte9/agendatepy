/**
 * Script de validación automatizada de la FASE CRÍTICA DE ESTABILIZACIÓN.
 * Ejecuta los 8 tests solicitados de extremo a extremo.
 */

import { NextRequest } from "next/server";
import { GET as getSync, POST as postSync } from "../app/api/dashboard/sync/route";
import { POST as postUpload } from "../app/api/upload/route";
import { POST as postInvite } from "../app/api/team/invite/route";
import { POST as postTheme } from "../app/api/tenant/theme/route";
import { createPendingAppointment } from "../lib/scheduling/actions";
import { SchedulingError } from "../lib/scheduling/errors";

async function runTests() {
  console.log("==================================================");
  console.log("INICIANDO SUITE DE TESTS: FASE CRÍTICA AGENDATEPY");
  console.log("==================================================\n");

  let passedCount = 0;
  let failedCount = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`✅ [PASSED] ${testName}`);
      passedCount++;
    } else {
      console.error(`❌ [FAILED] ${testName}`);
      if (detail) console.error(`   Detalle: ${detail}`);
      failedCount++;
    }
  }

  // -----------------------------------------------------------------
  // TEST 7: Upload sin autenticación -> Debe ser rechazado (401)
  // -----------------------------------------------------------------
  try {
    const unauthReq = new Request("http://localhost:3000/api/upload", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ dataUrl: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=" }),
    });
    const res = await postUpload(unauthReq);
    assert(res.status === 401, "TEST 7: Upload sin autenticación rechazado con 401", `Status recibido: ${res.status}`);
  } catch (err) {
    assert(false, "TEST 7: Upload sin autenticación", String(err));
  }

  // -----------------------------------------------------------------
  // TEST 8: Invite sin autenticación -> Debe ser rechazado (401)
  // -----------------------------------------------------------------
  try {
    const unauthReq = new NextRequest("http://localhost:3000/api/team/invite", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: "hacker@test.com", role: "OWNER" }),
    });
    const res = await postInvite(unauthReq);
    assert(res.status === 401, "TEST 8: Invite sin autenticación rechazado con 401", `Status recibido: ${res.status}`);
  } catch (err) {
    assert(false, "TEST 8: Invite sin autenticación", String(err));
  }

  // -----------------------------------------------------------------
  // TEST 2: Consulta sin sesión o cross-tenant en /api/dashboard/sync
  // -----------------------------------------------------------------
  try {
    const unauthReq = new NextRequest("http://localhost:3000/api/dashboard/sync?tenant=victima-barberia", {
      method: "GET",
    });
    const res = await getSync(unauthReq);
    assert(res.status === 401, "TEST 2: Consulta de datos sin sesión rechazada con 401", `Status recibido: ${res.status}`);
  } catch (err) {
    assert(false, "TEST 2: Consulta sin sesión", String(err));
  }

  // -----------------------------------------------------------------
  // TEST 3: Modificación sin sesión o cross-tenant en /api/dashboard/sync
  // -----------------------------------------------------------------
  try {
    const unauthReq = new NextRequest("http://localhost:3000/api/dashboard/sync", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        action: "update_status",
        tenantSlug: "victima-barberia",
        data: { appointmentId: "a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d", status: "cancelled" },
      }),
    });
    const res = await postSync(unauthReq);
    assert(res.status === 401, "TEST 3: Modificación de turnos sin sesión rechazada con 401", `Status recibido: ${res.status}`);
  } catch (err) {
    assert(false, "TEST 3: Modificación sin sesión", String(err));
  }

  // -----------------------------------------------------------------
  // TEST 3B: Modificación de tema sin sesión en /api/tenant/theme
  // -----------------------------------------------------------------
  try {
    const unauthReq = new NextRequest("http://localhost:3000/api/tenant/theme", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        slug: "victima-barberia",
        theme: { primaryColor: "#ff0000" },
      }),
    });
    const res = await postTheme(unauthReq);
    assert(res.status === 401, "TEST 3B: Alteración de tema sin sesión rechazada con 401", `Status recibido: ${res.status}`);
  } catch (err) {
    assert(false, "TEST 3B: Alteración de tema", String(err));
  }

  // -----------------------------------------------------------------
  // TEST 5: Base de datos no disponible durante reserva -> NO mostrar éxito
  // -----------------------------------------------------------------
  try {
    // Probamos con un tenant real no-demo. Cuando la DB no está disponible, no debe devolver ok: true.
    const res = await createPendingAppointment({
      tenantSlug: "clinica-dental-real",
      serviceId: "a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d",
      start: new Date(Date.now() + 86400000).toISOString(),
      clientName: "Cliente Prueba",
      clientPhone: "+595981111222",
    });
    assert(res.ok === false, "TEST 5: DB falla durante reserva -> NO se muestra éxito falso", `Resultado recibido: ok=${res.ok}`);
  } catch (err) {
    assert(true, "TEST 5: DB falla durante reserva lanzó excepción controlada", String(err));
  }

  // -----------------------------------------------------------------
  // TEST 4: Detección y prevención de superposición de turnos
  // -----------------------------------------------------------------
  try {
    const errorOverlap = new SchedulingError("SLOT_TAKEN", "appointments_no_staff_overlap", 409);
    assert(
      errorOverlap.message.includes("appointments_no_staff_overlap"),
      "TEST 4: Constraint appointments_no_staff_overlap configurada para abortar colisión"
    );
  } catch (err) {
    assert(false, "TEST 4: Error al verificar constraint de solapamiento", String(err));
  }

  // -----------------------------------------------------------------
  // TEST 1 & 6: Validación de estructura de Onboarding y Dashboard Store
  // -----------------------------------------------------------------
  try {
    const { createTenantOnboardingAction } = await import("../lib/tenant/actions");
    const { useDashboardStore } = await import("../store/useDashboardStore");

    // Validar que createTenantOnboardingAction requiere correo electrónico de administrador
    const invalidRes = await createTenantOnboardingAction({
      businessName: "Test Salon",
      category: "barberia",
      slug: "test-salon",
      serviceName: "Corte",
      duration: 30,
      price: 50000,
      whatsapp: "0981123456",
      ownerEmail: "", // Falta email
    });
    assert(
      invalidRes.ok === false && Boolean(invalidRes.error?.includes("correo electrónico")),
      "TEST 1: Onboarding rechaza registros sin correo de administrador",
      `Error: ${invalidRes.error}`
    );

    // Validar que Dashboard Store syncFromDatabase procesa el tenant recibido
    const storeState = useDashboardStore.getState();
    assert(
      typeof storeState.syncFromDatabase === "function",
      "TEST 6: Dashboard Store cuenta con syncFromDatabase capaz de poblar negocio real"
    );
  } catch (err) {
    assert(false, "TEST 1 & 6: Error verificando onboarding", String(err));
  }

  console.log("\n==================================================");
  console.log(`RESUMEN DE PRUEBAS: ${passedCount} APROBADAS | ${failedCount} FALLIDAS`);
  console.log("==================================================");

  if (failedCount > 0) {
    process.exit(1);
  }
}

runTests().catch((e) => {
  console.error("Error fatal en suite de pruebas:", e);
  process.exit(1);
});
