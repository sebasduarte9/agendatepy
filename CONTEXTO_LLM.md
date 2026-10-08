# CONTEXTO COMPLETO — AgendatePY para Continuar en Otro LLM

Fecha de generacion: 2026-09-27 (PY, UTC-3)
Proposito: Documento de contexto completo para continuar el desarrollo de AgendatePY en otro modelo de lenguaje.

---

## PROMPT INICIAL PARA EL NUEVO LLM

Pega este bloque como primer mensaje:

```
Eres un asistente de desarrollo senior para el proyecto AgendatePY.
Es un SaaS multi-tenant de agendamiento para negocios de servicios en Paraguay.
Stack: Next.js 15 + TypeScript + Prisma ORM + PostgreSQL + Zustand + Tailwind CSS.
El proyecto esta en estado de PRODUCCION PARCIAL con base de datos real.

REGLAS ABSOLUTAS (nunca romper):
1. Nunca crear datos ficticios o mocks para usuarios reales.
2. Toda mutacion: UI -> API -> PostgreSQL -> respuesta -> store -> UI.
3. No implementar: WhatsApp/Evolution API, Billing real, Bancard/Pagopar, Analytics avanzado.
4. No romper las 216 pruebas que ya pasan (Fases 2, 4, 5.1, 5.2, 5.3, 5.4, 5.4.1, 5.5, 5.6, 5.6.1 y Release).
5. TypeScript estricto: 0 errores con npx tsc --noEmit.
6. Cada cambio debe justificar: menos clicks, menos navegacion, menos confusion, o mayor coherencia.

Lee el archivo CONTEXTO_LLM.md en la raiz del proyecto para el contexto completo.
```

---

## 1. DESCRIPCION DEL PRODUCTO

AgendatePY es una plataforma SaaS multi-tenant para automatizar y profesionalizar negocios del sector servicios en Paraguay.

Casos de uso: Barberias, peluquerias, salones, spas, clinicas, veterinarias, canchas de padel.

Propuesta de valor:
- Eliminar no-shows con recordatorios por WhatsApp
- Portal publico de reservas 24/7 sin apps nativas
- Gestion financiera: Caja diaria, comisiones por profesional (PYG)
- Fidelizacion: Tarjeta digital de puntos
- Personalizacion total: Google Fonts, colores, modo oscuro

---

## 2. STACK TECNOLOGICO

| Capa | Tecnologia |
|------|------------|
| Framework | Next.js 15 (App Router + Server Actions) |
| Lenguaje | TypeScript estricto |
| Base de datos | PostgreSQL 16/17 |
| ORM | Prisma ORM |
| Estado UI | Zustand (useDashboardStore) |
| Estilos | Tailwind CSS |
| Auth | Passwordless OTP via Resend Email |
| Sesion | Cookie agendatepy_session (httpOnly, signed) |
| Deploy | Docker Compose + Nginx + Cloudflare |

---

## 3. ESTRUCTURA DEL PROYECTO

```
agendatepy-main/
  frontend/
    app/
      [tenant]/reservar/         # Portal publico de reservas
      api/
        appointments/[id]/       # Maquina de estados de citas
        auth/logout/             # Logout seguro
        cash/                    # Caja + cierre de caja
        clients/                 # CRUD clientes
        dashboard/sync/          # Sincronizacion del dashboard
        schedule-blocks/         # Bloqueos de horario
        services/                # CRUD servicios
        staff/                   # CRUD staff
        tenant/                  # Configuracion del tenant
      dashboard/
        page.tsx                 # Dashboard principal
        calendario/
        caja/
        clientes/
        servicios/
        equipo/
        estadisticas/
        configuracion/
        apariencia/
      login/
      onboarding/
    components/dashboard/
      CalendarBoard.tsx          # Calendario + modal citas + bloqueos
      Sidebar.tsx                # Navegacion lateral (3 niveles)
      Header.tsx                 # Header con logout real
      ClientFichaModal.tsx       # Ficha de cliente
      GuidedTour.tsx             # Tour guiado de apariencia
    lib/
      api-guard.ts               # requireTenantSession()
      dashboard-dates.ts         # Utilidades + normalizeParaguayPhone()
      scheduling/
        availability.ts          # Motor de disponibilidad publica
        actions.ts               # insertPendingAppointment transaccional
        errors.ts                # Codigos de error semanticos
      config/whatsapp.ts
    store/
      useDashboardStore.ts       # Zustand (UI cache, NO fuente de verdad)
    prisma/
      schema.prisma
      migrations/
    scripts/
      test-phase5-suite.js       # 14 tests core
      test-phase2-suite.js       # 11 tests HTTP
      execute-release-validation.js
      run-all-tests.js
  CHANGELOG_SYNC.md              # Bitacora completa de cambios
  DOCUMENTACION_SOFTWARE.md      # Especificacion tecnica
  docker-compose.yml
```

---

## 4. MODELO DE DATOS (Prisma Schema simplificado)

Tenant: id(uuid), name, slug(unique), plan(BASICO/PROFESIONAL/EMPRESA), status(ACTIVE/PAUSED), settings(Json), themeSettings(Json), timezone("America/Asuncion"), scheduleBlocks[]

User: id(uuid), tenantId, email, role(SUPERADMIN/OWNER/STAFF)

Staff: id(uuid), tenantId, commissionPercentage(Float), schedules[], services[]

Service: id(uuid), tenantId, duration(minutos), price(Guaranies enteros), active(Boolean, default true)

Client: id(uuid), tenantId, phone(normalizado), formula(ficha tecnica), tags[], instagram, totalSpent(Int), loyaltyPoints(Int), appointments[]

Appointment: id(uuid), tenantId, staffId, clientId(nullable), startTime(Timestamptz), endTime(Timestamptz), status(PENDING_ACTION/CONFIRMED/CANCELLED/COMPLETED/EXPIRED/NO_SHOW)
  -- GiST exclusion constraint: evita double-booking fisico en PostgreSQL

CashMovement: id(uuid), tenantId, type(INCOME/EXPENSE), amount(PYG), paymentMethod(Efectivo/Tarjeta POS/Transferencia/Billetera), appointmentId(nullable, para idempotencia), commissionPayout(relation nullable)

CommissionPayout: id(uuid), tenantId, staffId, periodStart, periodEnd, grossCommission, amountPaid, paymentMethod, cashMovementId, status(PENDING/PAID/CANCELLED), notes, paidAt, paidBy, createdAt, items[]

CommissionPayoutItem: id(uuid), payoutId, appointmentId, status(PAID/CANCELLED), chargedAmount, commissionPercentage(Float snapshot), commissionAmount
  -- PostgreSQL Partial Unique Index: CREATE UNIQUE INDEX ON commission_payout_items(appointment_id) WHERE status = 'PAID'; (garantiza unicidad física anti doble pago)

CashRegisterClose: id(uuid), tenantId, date(Date), totalIncome, totalExpense, closedAt

ScheduleBlock: id(uuid), tenantId, staffId(nullable=bloqueo total), startTime, endTime, reason

### Restriccion anti double-booking PostgreSQL

```sql
CREATE EXTENSION IF NOT EXISTS btree_gist;
ALTER TABLE appointments
  ADD CONSTRAINT no_double_booking
  EXCLUDE USING gist (
    staff_id WITH =,
    tstzrange(start_time, end_time) WITH &&
  )
  WHERE (status NOT IN ('CANCELLED', 'EXPIRED', 'NO_SHOW'));
```

---

## 5. SEGURIDAD Y AUTENTICACION

Cookie de sesion: agendatepy_session (httpOnly, sameSite lax, firmada criptograficamente)
Contenido: { tenantId, userId, role, tenantSlug }

### Helper de seguridad central
```
// frontend/lib/api-guard.ts
const session = await requireTenantSession(request);
// HTTP 401 si no hay sesion
// HTTP 403 si el tenantId no coincide
// NUNCA confiar en body.tenantId o query.tenant (vulnerabilidad IDOR)
```

### Logout real
```
// frontend/app/api/auth/logout/route.ts
// Elimina cookie + redirige a /login
// Header.tsx llama: fetch('/api/auth/logout', { method: 'POST' })
```

### Permisos de Caja
- GET /api/cash -> cualquier rol autenticado
- POST /api/cash -> solo OWNER o SUPERADMIN (HTTP 403 para STAFF)
- POST /api/cash/close -> solo OWNER o SUPERADMIN

---

## 6. API ROUTES PRINCIPALES

| Endpoint | Metodo | Descripcion |
|----------|--------|-------------|
| /api/dashboard/sync | GET | Carga inicial: appointments, clients, staff, services, blocks |
| /api/appointments/[id] | PATCH | Cambio de estado o reagendamiento |
| /api/cash | GET/POST | Movimientos de caja |
| /api/cash/close | GET/POST | Arqueo/cierre diario de caja |
| /api/clients | GET/POST | CRUD de clientes |
| /api/clients/[id] | PATCH/DELETE | Editar/eliminar cliente |
| /api/services | GET/POST | CRUD de servicios |
| /api/services/[id] | PATCH/DELETE | Editar/eliminar servicio |
| /api/staff | GET/POST | CRUD de staff |
| /api/staff/[id] | PATCH/DELETE | Editar/eliminar staff |
| /api/schedule-blocks | GET/POST | Bloqueos de horario |
| /api/schedule-blocks/[id] | DELETE | Eliminar bloqueo |
| /api/tenant/settings | GET/PATCH | Configuracion del negocio |
| /api/tenant/theme | GET/PATCH | Personalizacion visual |
| /api/auth/logout | POST | Logout con revocacion de cookie |
| /api/upload | POST | Subida de imagenes (auth, 5MB, whitelist MIME) |

### Maquina de estados de citas

```
PENDING_ACTION -> CONFIRMED
PENDING_ACTION -> CANCELLED
CONFIRMED      -> COMPLETED
CONFIRMED      -> CANCELLED
CONFIRMED      -> NO_SHOW
COMPLETED      -> (terminal, no cambia)
CANCELLED      -> CONFIRMED  (reactivacion permitida)
NO_SHOW        -> CONFIRMED  (reactivacion permitida)
EXPIRED        -> (terminal, no cambia)
```

---

## 7. ZUSTAND STORE

IMPORTANTE: Zustand es cache de UI, NO fuente de verdad. PostgreSQL es la unica fuente de verdad.

```
interface DashboardState {
  appointments: Appointment[]
  clients: Client[]
  staff: Staff[]
  services: Service[]
  cashMovements: CashMovement[]
  blocks: ScheduleBlock[]
  isInitialSyncDone: boolean
  selectedDate: Date
  addAppointment: (apt) => Promise<void>  // con rollback optimista
  updateAppointment: (id, data) => void
}
```

Patron rollback optimista: Si la API falla, se filtra el ID temporal del store (formato "temp-[timestamp]") y se muestra toast de error.

---

## 8. ESTADO DE PRUEBAS (161/161 — TODAS PASAN)

### Suite Fase 5.5 — 20/20 PASS (scripts/test-phase5-5-suite.js)
- OK COMPLETED + cobro genera comisión
- OK CONFIRMED no genera comisión
- OK CANCELLED no genera comisión
- OK NO_SHOW no genera comisión
- OK COMPLETED sin cobro no genera comisión
- OK 100.000 × 40% = 40.000 Gs exacto
- OK split payment 50k + 50k = base 100k
- OK EXPENSE no afecta base comisionable
- OK Cash de otra cita no afecta
- OK refresh no duplica comisiones
- OK sync repetido no duplica
- OK filtro por staff funciona
- OK filtro por período funciona
- OK timezone America/Asuncion correcta
- OK Tenant A aislado de B
- OK OWNER puede consultar comisiones
- OK STAFF respeta restricciones de seguridad (403 ajeno, 200 propio)
- OK comisión puede rastrearse al appointmentId
- OK monto coincide con CashMovement (no con Service.price)
- OK varias citas producen suma agregada correcta

### Suite Fase 5.4.1 — 24/24 PASS (scripts/test-phase5-4-1-suite.js)
- OK Cliente sin visitas muestra última visita como "Sin visitas" (lastVisit === null)
- OK Cliente COMPLETED muestra última visita real
- OK createdAt nunca se presenta como visita
- OK Nueva cita desde cliente usa clientId
- OK URL no contiene clientName
- OK URL no contiene clientPhone
- OK CashMovement simple suma correctamente al total gastado
- OK CashMovement dividido (split 50k + 50k) suma correctamente (100k)
- OK EXPENSE no incrementa el total gastado
- OK Cobro de otro cliente no afecta el total gastado
- OK Appointment sin cobro no inventa gasto
- OK Doble cobro no duplica ingreso (HTTP 409 ALREADY_CHARGED)
- OK Cita cancelada no cuenta como visita
- OK Cita NO_SHOW no cuenta como visita
- OK Cita EXPIRED no cuenta como visita
- OK Próxima cita válida aparece en ficha
- OK Próxima cita cancelada no aparece en ficha
- OK Tenant A no accede a Client B (404/403 anti-IDOR)
- OK API pública anónima no expone información privada
- OK F5 conserva todas las métricas operativas
- OK Nueva cita conserva clientId en PostgreSQL
- OK Edición (PATCH) de cliente persiste
- OK Teléfonos paraguayos normalizados no duplican cliente
- OK Cliente con historial NO puede ser eliminado destructivamente (HTTP 409)

### Suite Fase 5.4 — 20/20 PASS (scripts/test-phase5-4-suite.js)
- OK CRM operacional, Ficha de Cliente y métricas reales
- OK Prevención de doble conteo de cobros y retención histórica
- OK Búsqueda insensible y filtros de cliente en PostgreSQL

### Suite Fase 5.3 — 20/20 PASS (scripts/test-phase5-3-suite.js)
- OK Tenant valido abre portal publico (HTTP 200)
- OK Tenant inexistente devuelve 404
- OK Tenant sin servicios muestra empty state
- OK Servicio activo aparece en portal
- OK Servicio inactivo no aparece en portal
- OK Disponibilidad viene de DB (/api/appointments?tenantId=...&serviceId=...)
- OK Horario ocupado por cita no aparece en slots
- OK ScheduleBlock bloquea franja de horario
- OK Cliente nuevo desde reserva se persiste en DB
- OK Cliente existente se reutiliza por telefono normalizado (+595981123456)
- OK Appointment publico se crea con UUID real
- OK Reserva aparece en dashboard despues de sync
- OK Concurrencia: segundo intento sobre mismo slot es rechazado (HTTP 409)
- OK Cancelacion de cita libera el slot
- OK Pantalla de confirmacion contiene datos correctos
- OK Archivo .ics generado con fecha y hora correctas
- OK Timezone America/Asuncion correcto
- OK Tenant A no puede reservar ni consultar datos de Tenant B
- OK Portal no expone informacion privada del dashboard
- OK Primera reserva queda persistida tras recarga

### Suite Fase 5.2 — 18/18 PASS (scripts/test-phase5-2-suite.js)
- OK Crear cita desde calendario
- OK Bloquear horario desde calendario
- OK Cobro desde cita con idempotencia
- OK NO_SHOW y reactivacion
- OK Empty states y skeletons
- OK Normalizacion telefonica PY

### Suite Fase 5.1 — 14/14 PASS (scripts/test-phase5-suite.js)
- OK Logout real + F5 no accede a /dashboard
- OK Permisos de Caja (STAFF 403, OWNER 201)
- OK Maquina de estados, Arqueo persistente, UUID real

### Suite Fase 4 — 12/12 PASS (scripts/test-phase4-suite.js)
- OK CRUD real persistente en PostgreSQL
- OK Reagendamiento y bloqueos

### Suite Release Validation — 9/9 PASS
- OK Restriccion GiST activa en PostgreSQL
- OK Double-booking concurrente rechazado

### Suite HTTP — 11/11 PASS | Suite Contratos — 13/13 PASS
Total acumulado: 161/161 (100% de exito)

---

## 9. HISTORIAL DE CAMBIOS POR FASE

### FASE 1 — Diseno Visual y Landing Page
- Landing page completa: hero, simulador WhatsApp, calculadora ROI, precios, FAQ
- BrandLogo.tsx con isotipo oficial #FF4F2B
- PhoneMockup.tsx: simulador interactivo WhatsApp paso a paso
- RoiCalculator.tsx: sliders de perdida vs recupero
- WhatsAppFloatingButton.tsx: widget unificado de asesoria
- smoothScroll.ts: motor de navegacion inteligente por anclas
- Animaciones de entrada direccionales con framer-motion

### FASE 2 — Seguridad y Estabilizacion Multi-Tenant
- session.tenantId como unica fuente autorizada (anti-IDOR)
- Onboarding atomico: prisma.$transaction para 6 entidades
- Erradicacion de fake success en toda la app
- Anti double-booking: btree_gist + GiST EXCLUDE constraint
- Codigos de error semanticos: DB_UNAVAILABLE, SLOT_TAKEN, TENANT_NOT_FOUND, VALIDATION_ERROR
- Demo aislada: /barberia/reservar; slugs inexistentes -> notFound() HTTP 404
- lib/api-guard.ts: requireTenantSession() centralizado

### FASE 3 — UX y UI del Dashboard
- GuidedTour.tsx: visita guiada de 6 pasos con spotlight SVG sincronizado
- apariencia/page.tsx: 20 presets de tema, 56 Google Fonts, 8 fondos animados, editor portada/logo
- iPhone 3D con Dynamic Island, reloj en vivo, sombra ambiental
- Modal de confirmacion al salir con cambios sin guardar

### FASE 4 — Persistencia 100% Real del Core
Migracion Prisma: 20260927213542_core_persistence
- Tenant: relacion con ScheduleBlock
- Service: campo active Boolean
- Client: campos formula, tags, instagram; relacion con Appointment
- Appointment: clientId, indice compuesto [tenantId, clientId]
- ScheduleBlock: nuevo modelo persistente

Endpoints creados: /api/services, /api/staff, /api/clients, /api/cash, /api/appointments/[id], /api/schedule-blocks, /api/tenant/settings, /api/dashboard/stats

Motor de disponibilidad: integra ScheduleBlock en slots publicos; insertPendingAppointment transaccional

### FASE 5.1 — Bugs Criticos y Coherencia del Core
Archivos creados:
- app/api/auth/logout/route.ts (Logout seguro)
- app/api/cash/close/route.ts (Arqueo de caja persistente)
- prisma/migrations/20260927230000_cash_register_close/
- scripts/test-phase5-suite.js (14 tests)

Archivos modificados:
- app/api/cash/route.ts (OWNER/SUPERADMIN solo; idempotencia 409)
- app/api/appointments/[id]/route.ts (Maquina de estados estricta, NO_SHOW)
- app/api/dashboard/sync/route.ts (UUID real canonico)
- prisma/schema.prisma (CashRegisterClose, appointmentId en CashMovement)
- store/useDashboardStore.ts (UUID real, isInitialSyncDone)
- components/dashboard/Header.tsx (Logout real, responsive <400px)
- components/dashboard/CalendarBoard.tsx (Cobro idempotente, boton Bloquear Horario)
- app/dashboard/page.tsx (Skeletons, eliminado Google Sync mock)
- app/dashboard/caja/page.tsx (Empty state, historial arqueos)
- app/dashboard/clientes/page.tsx (Empty state CTA)
- app/dashboard/servicios/page.tsx (Empty states con CTAs)
- app/dashboard/equipo/page.tsx (Empty state CTA)
- app/dashboard/estadisticas/page.tsx (Skeletons, deltas falsos eliminados)
- app/dashboard/suscripcion/page.tsx (Facturas mock eliminadas)

### FASE 5.2 — Optimizacion Operativa (EN CURSO)

Archivos modificados:
- frontend/lib/dashboard-dates.ts: normalizeParaguayPhone()
- frontend/app/api/dashboard/sync/route.ts: validacion solapamientos + persistencia automatica de clientes
- frontend/store/useDashboardStore.ts: rollback optimista mejorado
- frontend/components/dashboard/CalendarBoard.tsx: modal unico cita/bloqueo, chips de motivos, validaciones, bloques visuales
- frontend/app/dashboard/servicios/page.tsx: Single Source of Truth para servicios
- frontend/components/dashboard/Sidebar.tsx: jerarquia Principal -> Operaciones -> Configuracion
- frontend/app/dashboard/caja/page.tsx: alertas cierre diario, explicacion saldo esperado
- frontend/app/dashboard/clientes/page.tsx: normalizacion telefono, indicador proximo turno

---

## 10. ESTADO ACTUAL — FASE 5.2 (COMPLETADA 100%)

Suite de Regresion Ejecutada y Aprobada (18/18 puntos - test-phase5-2-suite.js):

1. Crear Cita desde Calendario
   - [x] Clic en slot vacio -> modal abre en modo Nueva Cita
   - [x] Seleccionar cliente, servicio, staff -> guardar
   - [x] Cita aparece en calendario sin F5
   - [x] UUID real (no temp-xxx) en el store y PostgreSQL

2. Bloquear Horario desde Calendario
   - [x] Boton + Bloquear Horario en modal y barra de herramientas
   - [x] Seleccionar motivo (chip predefinido o texto libre)
   - [x] Bloqueo aparece diferenciado visualmente en calendario
   - [x] Impide reservas en franjas bloqueadas con HTTP 409 SLOT_BLOCKED

3. Cobrar desde Modal de Cita
   - [x] Cita CONFIRMED -> boton Cobrar Turno
   - [x] Seleccionar metodo de pago -> confirmar
   - [x] CashMovement creado con appointmentId en PostgreSQL
   - [x] Segundo cobro rechazado por idempotencia (HTTP 409 ALREADY_CHARGED)
   - [x] Estado de cita cambia atómicamente a COMPLETED

4. Cambio de Estado NO_SHOW
   - [x] Cita CONFIRMED -> No se presento -> estado NO_SHOW en PostgreSQL
   - [x] Reactivar a CONFIRMED -> validado y funcional

5. Empty States
   - [x] Dashboard sin citas -> empty state visible
   - [x] Clientes sin registros -> CTA alta conversion
   - [x] Caja sin movimientos -> empty state con explicacion
   - [x] Servicios sin datos -> empty state con CTA (+ Crear servicio)

6. Logout
   - [x] Logout seguro -> elimina cookies agendate_session y agendatepy_session
   - [x] Redireccion a /login inmediata

7. Navegacion Sidebar y Header
   - [x] 3 grupos jerarquicos: Principal, Operaciones, Configuracion
   - [x] Selector de profesional en Header desacoplado de permisos de usuario
   - [x] STAFF restringido de Caja (HTTP 403), OWNER con acceso total

8. Skeleton Loaders y Resiliencia
   - [x] /dashboard -> skeletons visibles antes del sync
   - [x] Errores semanticos sin exito falso

9. Normalizacion de Telefonos Paraguayos
   - [x] 0981123456 -> +595981123456 (E.164 canónico)
   - [x] Prevencion de duplicados en base de datos PostgreSQL

10. TypeScript + Build
    - [x] npx tsc --noEmit -> 0 errores
    - [x] npm run build -> compilacion limpia Turbopack

---

## 10. ESTADO ACTUAL — FASE 5.3 (COMPLETADA 100%)

Suite de Regresion Ejecutada y Aprobada (20/20 puntos - test-phase5-3-suite.js):

1. **Activacion de Negocio y Logica Central:**
   - [x] Funcion `getBusinessReadiness()` e `isBusinessReadyForBooking()` en `lib/business-readiness.ts`.
   - [x] Validacion multi-criterio: datos basicos, servicios activos con duracion y precio, profesional activo, horarios y estado del tenant.
   - [x] Checklist interactivo en `/dashboard` con barra de progreso reactiva (0-100%) y minimizable.
   - [x] "Aha Moment" banner cuando llega la primera reserva real en PostgreSQL.

2. **Portal Publico de Reservas (`/[tenant]/reservar`):**
   - [x] Solo servicios activos (`active: true`) se muestran; servicios inactivos quedan ocultos.
   - [x] Validacion de estados: tenant no encontrado (404), pausado/suspendido, sin servicios, sin horarios.
   - [x] Eliminacion de mocks o datos de prueba para tenants reales (Martín Benítez restringido solo al demo `/barberia`).
   - [x] SEO dinamico con `generateMetadata` (OpenGraph, description, robots index) y noindex en dashboard.

3. **Disponibilidad Real y Concurrencia:**
   - [x] Endpoint `GET /api/appointments?tenantId=...&serviceId=...` calcula slots reales en DB.
   - [x] Excluye citas existentes y bloqueos (`ScheduleBlock`).
   - [x] Concurrencia probada: segundo intento en paralelo recibe HTTP 409 `SLOT_TAKEN` / `CONCURRENT_BOOKING_PREVENTED`.
   - [x] Cancelacion de citas libera el horario de forma inmediata.

4. **Creacion y Deduplicacion de Clientes:**
   - [x] Normalizacion estricta a formato Paraguay E.164 (+595981123456).
   - [x] Clientes recurrentes con diferentes formatos de telefono (0981..., 595981..., +595981...) se unifican bajo el mismo ID de cliente en PostgreSQL.

5. **Enlace Publico y Generador de QR Local:**
   - [x] Componente reutilizable `PublicBookingLink.tsx` con variantes banner, compact e inline.
   - [x] Copiado al portapapeles con feedback instantaneo ("Enlace copiado").
   - [x] Boton "Ver como cliente" hacia `/[slug]/reservar` en nueva pestana.
   - [x] Generacion de codigos QR 100% local con biblioteca `qrcode` (sin llamadas a `api.qrserver.com` ni servicios de terceros).

6. **Confirmacion y Calendario (.ics):**
   - [x] Pantalla de confirmacion con detalles exactos de cita.
   - [x] Descarga de archivo `.ics` estandar compatible con Apple Calendar, Google Calendar y Outlook en timezone `America/Asuncion`.

7. **Validacion y Regresion Total:**
   - [x] 97/97 tests automatizados pasando (100%).
   - [x] `npx tsc --noEmit` limpio (0 errores).
   - [x] `npm run build` compila al 100% en produccion.

---

## 10.1 ROADMAP — PROPUESTA FASE 5.4 (OPERACIONES Y HERRAMIENTAS DE ATENCION)

Objetivos sugeridos para la siguiente fase:

1. **CRM Operacional y Ficha Tecnica de Cliente:**
   - Visualizacion de historial de servicios y gastos acumulados en `ClientFichaModal`.
   - Enlace directo de contacto nativo (URL scheme `https://wa.me/595981...`) sin depender de Evolution API.
   - Notas internas de formula / preferencias tecnicas persistentes en PostgreSQL.

2. **Liquidacion de Comisiones de Colaboradores:**
   - Calculo de comisiones basado en citas completadas y cobradas en Caja (`CashMovement`).
   - Reporte descargable o vista de liquidacion por periodo segun el porcentaje configurado por colaborador.

3. **Modo Conectividad y Resiliencia Offline:**
   - Deteccion de estado de red (`navigator.onLine`) con banner discreto.
   - Cola de reintento automatico para evitar perdida de datos si la conexion parpadea.

4. **Automatizacion de Enlaces Directos de Atencion:**
   - Generacion de enlaces rapidos de confirmacion manual via WhatsApp (plantilla pre-rellenada con fecha y hora).

## 11. RESTRICCIONES ABSOLUTAS DE SCOPE

FUERA de scope en todas las fases actuales:
- NO: WhatsApp / Evolution API (recordatorios automaticos)
- NO: Billing real (Bancard / Pagopar)
- NO: Analytics avanzado / reportes complejos
- NO: Facturacion electronica
- NO: Rediseno completo de la aplicacion
- NO: Nuevas funcionalidades grandes no especificadas

---

## 12. ENTORNO LOCAL

Requisitos: Node.js 20+, PostgreSQL 17 en localhost:5432, DB: agendatepy_test

Variables de entorno (frontend/.env):
```
DATABASE_URL="postgresql://postgres:password@localhost:5432/agendatepy_test"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
SESSION_SECRET="[string seguro de 32+ chars]"
RESEND_API_KEY="[key de Resend]"
```

Comandos:
```
cd frontend
npm install
npx prisma generate
npx prisma migrate deploy
npm run dev
npx tsc --noEmit
npm run build
node scripts/test-phase5-suite.js
node scripts/test-phase5-2-suite.js
node scripts/test-phase5-3-suite.js
node scripts/run-all-tests.js
```

---

## 13. REGLAS DE DESARROLLO

Regla 1 — Flujo de datos:
  UI -> API (Next.js Route Handler) -> Prisma -> PostgreSQL -> respuesta JSON -> Zustand store -> re-render UI
  Nunca saltear pasos. Nunca guardar en Zustand sin confirmar con PostgreSQL primero.

Regla 2 — Seguridad de tenant:
  CORRECTO: const session = await requireTenantSession(request); where: { tenantId: session.tenantId }
  INCORRECTO: const { tenantId } = await request.json(); // VULNERABILIDAD IDOR

Regla 3 — Sin datos ficticios:
  CORRECTO: retornar [] -> el frontend muestra empty state
  INCORRECTO: services.length > 0 ? services : DEMO_SERVICES // PROHIBIDO

Regla 4 — Maquina de estados:
  Solo las transiciones listadas son validas. Rechazar con HTTP 400.

Regla 5 — Idempotencia de cobros:
  Si CashMovement con appointmentId ya existe -> HTTP 409 sin crear duplicado.

Regla 6 — TypeScript:
  Siempre correr npx tsc --noEmit antes de dar cambios por completados. 0 errores es requisito.

---

## 14. ARCHIVOS CLAVE A REVISAR PRIMERO

1. frontend/store/useDashboardStore.ts - Estado global y acciones
2. frontend/app/api/dashboard/sync/route.ts - Carga inicial del dashboard
3. frontend/components/dashboard/CalendarBoard.tsx - Calendario principal
4. frontend/prisma/schema.prisma - Modelo de datos
5. frontend/lib/api-guard.ts - Seguridad de endpoints
6. CHANGELOG_SYNC.md - Bitacora completa de todos los cambios

---

## 15. IDENTIDAD VISUAL

- Color primario: #FF4F2B (naranja vermellon, variable --brand)
- Color secundario: esmeralda #10B981
- Acentos: ambar / coral calido
- Tipografia: Inter (Google Fonts)
- Modo oscuro: soportado en toda la aplicacion
- Diseno: glassmorphism, backdrop-blur, gradientes suaves
- Logo: isotipo A con toggle de automatizacion en #FF4F2B

---

## 16. MODULOS DEL DASHBOARD

| Ruta | Estado |
|------|--------|
| /dashboard | Funcional |
| /dashboard/calendario | Funcional |
| /dashboard/clientes | Funcional (Ficha Operacional CRM 5.4) |
| /dashboard/servicios | Funcional |
| /dashboard/equipo | Funcional |
| /dashboard/caja | Funcional (Exportación CSV movimientos y cierres Fase 5.7) |
| /dashboard/estadisticas | Funcional |
| /dashboard/configuracion | Funcional |
| /dashboard/apariencia | Funcional |
| /dashboard/comisiones | Funcional (Fases 5.5, 5.6 & 5.7: Devengado, Liquidación, Pago, Auditoría, Recibo Imprimible y Exportación CSV) |
| /dashboard/suscripcion | Sin billing real |
| /dashboard/whatsapp | Sin Evolution API |
| /dashboard/fidelizacion | Sin implementar |

---

Generado: 2026-09-28. Para estado mas reciente, ver CHANGELOG_SYNC.md
