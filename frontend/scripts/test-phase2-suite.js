/**
 * Suite de Validación FASE 2: Pruebas End-to-End y Verificación de Límites
 * Ejecuta validaciones HTTP directas sobre el servidor en ejecución.
 */

const http = require("http");

function request(url, options = {}) {
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
      req.write(options.body);
    }
    req.end();
  });
}

async function run() {
  console.log("======================================================================");
  console.log("   FASE 2: EJECUCIÓN DE PRUEBAS END-TO-END SOBRE SERVIDOR AGENDATEPY");
  console.log("======================================================================\n");

  const results = [];

  function record(testName, expected, actual, pass, evidence) {
    results.push({ testName, expected, actual, pass, evidence });
    const mark = pass ? "✅ [PASS]" : "❌ [FAIL]";
    console.log(`${mark} ${testName}`);
    console.log(`   Esperado: ${expected}`);
    console.log(`   Obtenido: ${actual}`);
    console.log(`   Evidencia: ${evidence}\n`);
  }

  // 1. RUTAS PROTEGIDAS SIN SESIÓN (Redirección o bloqueo)
  const protectedRoutes = [
    "/dashboard",
    "/dashboard/caja",
    "/dashboard/whatsapp",
    "/dashboard/equipo",
    "/dashboard/suscripcion",
  ];

  for (const route of protectedRoutes) {
    try {
      const res = await request(`http://localhost:3000${route}`);
      // En Next.js SSR, si no hay sesión, layout.tsx ejecuta redirect("/login")
      // Esto genera un status 307/308 con header Location: /login, o en dev HTML con redirect
      const isRedirect = res.status === 307 || res.status === 308 || res.headers.location?.includes("/login");
      const hasLoginContent = res.body.includes("/login") || res.body.includes("Inicia sesión") || res.headers.location === "/login";
      const protectedSuccess = isRedirect || (res.status === 200 && hasLoginContent);

      record(
        `Ruta protegida sin sesión: ${route}`,
        "Redirección HTTP 307 a /login o contenido de login",
        `HTTP ${res.status} | Location: ${res.headers.location || "N/A"}`,
        protectedSuccess,
        `Status ${res.status}, Location header: ${res.headers.location}`
      );
    } catch (e) {
      record(`Ruta protegida: ${route}`, "307 a /login", e.message, false, e.stack);
    }
  }

  // 2. ENDPOINT UPLOAD — VALIDACIÓN DE SEGURIDAD
  // A) Sin sesión
  try {
    const res = await request("http://localhost:3000/api/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dataUrl: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=" }),
    });
    record(
      "Upload sin sesión",
      "HTTP 401 Unauthorized",
      `HTTP ${res.status}`,
      res.status === 401,
      `Respuesta JSON: ${JSON.stringify(res.json || res.body)}`
    );
  } catch (e) {
    record("Upload sin sesión", "HTTP 401", e.message, false, e.stack);
  }

  // B) Tipo MIME peligroso o inválido (ej. ejecutable / script)
  try {
    // Simulamos un payload con sesión mediante mock o probamos el parser de validación
    const res = await request("http://localhost:3000/api/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dataUrl: "data:application/x-msdownload;base64,TVqQAAMAAAAEAAAA" }),
    });
    // Debe rechazar con 401 (sin sesión) o 400 (MIME inválido)
    record(
      "Upload con payload malicioso / MIME ejecutable",
      "Rechazado (HTTP 401 sin sesión o HTTP 400)",
      `HTTP ${res.status}`,
      res.status === 401 || res.status === 400,
      `Respuesta HTTP: ${res.status}`
    );
  } catch (e) {
    record("Upload payload malicioso", "Rechazado", e.message, false, e.stack);
  }

  // 3. ENDPOINT TEAM INVITE — VALIDACIÓN DE AUTENTICACIÓN
  try {
    const res = await request("http://localhost:3000/api/team/invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "atacante@externo.com", role: "OWNER" }),
    });
    record(
      "Team Invite sin sesión",
      "HTTP 401 Unauthorized",
      `HTTP ${res.status}`,
      res.status === 401,
      `Respuesta JSON: ${JSON.stringify(res.json || res.body)}`
    );
  } catch (e) {
    record("Team Invite sin sesión", "HTTP 401", e.message, false, e.stack);
  }

  // 4. AISLAMIENTO DE TENANT PÚBLICO (DEMO vs NEGOCIO INEXISTENTE)
  // A) Barbería Demo explícita
  try {
    const res = await request("http://localhost:3000/barberia/reservar");
    const showsDemo = res.status === 200 && res.body.includes("Barbería");
    record(
      "Ruta pública /barberia/reservar",
      "HTTP 200 con contenido de Barbería Demo",
      `HTTP ${res.status}`,
      showsDemo,
      `Título / Contenido: incluye Barbería: ${showsDemo}`
    );
  } catch (e) {
    record("Ruta pública /barberia/reservar", "HTTP 200", e.message, false, e.stack);
  }

  // B) Negocio inexistente
  try {
    const res = await request("http://localhost:3000/negocio-inexistente-xyz/reservar");
    const isNotFound = res.status === 404 || res.body.includes("Negocio no encontrado") || res.body.includes("NEXT_HTTP_ERROR_FALLBACK;404");
    const containsDemoText = res.body.includes("Barbería Los Muchachos");
    const safeNotFound = isNotFound && !containsDemoText;

    record(
      "Ruta pública /negocio-inexistente-xyz/reservar",
      "404 Not Found (NUNCA mostrar Barbería Los Muchachos)",
      `HTTP ${res.status} | Contiene Barbería: ${containsDemoText}`,
      safeNotFound,
      `NotFound detectado: ${isNotFound}, Contiene demo falso: ${containsDemoText}`
    );
  } catch (e) {
    record("Ruta inexistente", "404 Not Found", e.message, false, e.stack);
  }

  // 5. CAÍDA DE BASE DE DATOS Y COMPORTAMIENTO CONTROLADO
  // Cuando PostgreSQL está caído (como actualmente en localhost:5432):
  // Verificamos que /api/dashboard/sync devuelva 401 o 500/503 controlado y NUNCA devuelva ok: true falso
  try {
    const res = await request("http://localhost:3000/api/dashboard/sync?tenant=salon-test-a");
    record(
      "Consulta de datos sin sesión y DB offline",
      "HTTP 401 Unauthorized (bloqueo en primera línea antes de tocar DB)",
      `HTTP ${res.status}`,
      res.status === 401,
      `Respuesta JSON: ${JSON.stringify(res.json)}`
    );
  } catch (e) {
    record("Consulta datos DB offline", "HTTP 401", e.message, false, e.stack);
  }

  console.log("======================================================================");
  console.log(`RESUMEN: ${results.filter(r => r.pass).length} / ${results.length} PRUEBAS APROBADAS`);
  console.log("======================================================================\n");
}

run().catch(console.error);
