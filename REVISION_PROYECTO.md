# Revisión del proyecto AgendatePY

Fecha: 9 de octubre de 2026. No se borró nada: todo lo que no se usa se movió a `descartados/`.

## Resumen

| Chequeo | Antes | Después |
|---|---|---|
| Build de producción (`next build`) | — | Compila sin errores |
| Errores de TypeScript (`tsc`) | 0 | 0 |
| Errores de ESLint | 5 | 0 |
| Advertencias de ESLint | 599 | 594 (casi todas variables sin usar y `any`) |
| Archivos sin uso en el código | 33 | 0 (movidos a `descartados/`) |
| Rutas sin protección que encontré | 5 | 0 |

## 1. Seguridad (lo más importante)

### Corregido

1. **El panel viejo del negocio se podía abrir sin iniciar sesión.**
   - `negocio.agendatepy.com/admin` mostraba la agenda del día con nombres y teléfonos de clientes.
   - También permitía confirmar o cancelar turnos y cambiar el diseño, todo sin pedir login.
   - Ese panel quedó reemplazado por `/dashboard`.
   - Lo moví completo a `descartados/`.
   - En `proxy.ts`, `negocio.agendatepy.com/admin` ahora redirige a `agendatepy.com/dashboard`.
2. **Las sesiones se podían falsificar si faltaba `SESSION_SECRET`.**
   - El código usaba una clave escrita en el propio archivo, y `docker-compose.prod.yml` traía otra por defecto.
   - Cualquiera que viera el código podía fabricarse una sesión de superadmin.
   - Ahora `lib/auth/session.ts` se niega a firmar sesiones en producción si la variable no está.
   - El deploy con docker también falla con un mensaje claro si falta la variable.
   - En local sigue todo igual, porque tu `.env` ya la tiene.
3. **`/api/admin/whatsapp-ia` no tenía guarda.** Cualquiera podía ver las métricas del clúster de IA, probar las claves o recargarlas. Ahora es solo para superadmin.
4. **`/api/admin/whatsapp-ia/simulate` no tenía guarda.** Cualquiera podía hacer que la IA actuara sobre un negocio real. Ahora es solo para superadmin.
5. **`/api/ai/chat` (el simulador del bot) estaba abierto.**
   - Aceptaba cualquier negocio, así que cualquiera podía gastar la cuota de Gemini o hacer que el bot actuara sobre otro negocio.
   - Ahora exige sesión.
   - Un dueño solo puede simular sobre su propio negocio; el superadmin puede elegir cualquiera.

### Verificado y correcto

- **Rutas `[id]`:** todas las de clientes, turnos, caja, staff, servicios, bloqueos y pagos filtran por el negocio de la sesión. No se pueden tocar datos de otro negocio cambiando el ID.
- **`/api/admin/*`:** el resto de estas rutas usa `requireSuperAdminSession`. Lo que te dije antes, que estaban todas abiertas, era incorrecto: solo lo estaban las dos de WhatsApp IA.
- **Git:** `.env` y `public/uploads/` no se suben.

## 2. Bugs corregidos

1. **El "hoy" estaba en UTC y no en hora de Paraguay.**
   - Desde las 21:00 hora local, el sistema creía que ya era el día siguiente.
   - En el bot de WhatsApp (`lib/ai/whatsapp-agent.ts`), la IA recibía mal la fecha de hoy y podía agendar en el día equivocado.
   - En "Bloquear horario" (`app/dashboard/bloquear-horario/page.tsx`), la fecha por defecto quedaba en mañana.
   - Ahora las dos usan la zona horaria `America/Asuncion`.
2. **`lib/utils.ts` importaba `clsx` sin usarlo.**
   - Esa librería no está en `package.json`; solo estaba instalada porque la trae `recharts`.
   - Si `recharts` dejaba de traerla, el build se rompía.
   - Saqué el import.
3. **Errores de ESLint:**
   - **Login:** la regla marcaba como error el `<a>` del botón de Google, pero está bien a propósito, porque OAuth necesita una navegación completa del navegador. Silencié la regla ahí con el motivo.
   - **WhatsApp:** comillas sin escapar en el texto de ejemplo de la página.
   - **Comentarios `eslint-disable` sobrantes:** saqué 3 que ya no hacían nada.

## 3. Lo que moví a `descartados/`

La carpeta está en la raíz del repo, fuera de `frontend/`, así no entra en el build ni en el chequeo de tipos. Adentro se respetan las rutas originales, así que para recuperar algo basta con moverlo de vuelta al mismo lugar.

**Panel viejo por negocio** (reemplazado por `/dashboard`). Todo esto solo se usaba entre sí:
- `app/[tenant]/admin/`: agenda, servicios, equipo, apariencia y configuración
- `components/admin/`: AdminShell, AppearanceEditor, AppointmentActions, DailyAgenda
- `lib/admin/`: actions, theme-actions, agenda-status, tenant-access

**Componentes y librerías que nadie importa:**
- `components/auth/GoogleAuthModal.tsx`
- `components/dashboard/PublicBookingLink.tsx`
- `components/dashboard/ui/IosPhoneInput.tsx`
- `components/ui/ColorPicker.tsx`, `animated-beam.tsx`, `scroll-text.tsx`
- `lib/db-actions.ts`
- `lib/sendwo.ts` (integración vieja con Sendwo, reemplazada por Evolution)
- `lib/upay.ts` (simulación de cobros con uPay)
- `lib/telemetry.ts`

**Imágenes y fuentes sin uso:**
- `public/logo.png`, `public/favicon.png`, `public/AgendatePYlogo.png`, `public/AgendatePYlogo.svg`. El favicon real es `app/favicon.ico`.
- Las 5 variantes de Coolvetica que no se cargan. Solo se usa `coolvetica-rg.otf`; la licencia y el `read-this.html` quedaron en su lugar.
- El logo del negocio de prueba que creé al probar el registro.

**Lo que dejé a propósito:**
- `scripts/`: generar la imagen OG, test de estrés y test de seguridad. Son herramientas manuales; lo decidiste vos.
- `public/uploads/`: son archivos que subieron los negocios y se referencian desde la base de datos.
- `/superadmin`: redirige a `/admin` y sirve para links viejos.
- `/showcase`: está linkeado desde el footer.

## 4. Otros cambios menores

- `.gitignore`: agregué `frontend/.impeccable/live/`, que es estado local de una herramienta.

## 5. Recomendaciones

**Urgentes (seguridad):**
1. Confirmá que el servidor de producción tenga un `SESSION_SECRET` propio y largo. Si alguna vez corrió con el valor por defecto, cambialo: eso cierra todas las sesiones y no se pueden seguir falsificando. Para generar uno: `openssl rand -base64 48`.
2. Cambiá la clave de Evolution.
   - `docker-compose.evolution.yml` y `app/api/webhooks/whatsapp/route.ts` traen por defecto `agendatepy_whatsapp_secure_key_2026`, que está en el código.
   - Definí `EVOLUTION_API_KEY` en el servidor y no dejes el puerto de Evolution abierto a internet.
3. El webhook de WhatsApp (`/api/webhooks/whatsapp`) acepta mensajes de cualquiera. Lo dejaste para más adelante; la solución simple es un token secreto en la URL del webhook.

**Importantes:**
4. **Dependencias que no se usan.** Se pueden sacar de `package.json` para que el build y la imagen de Docker pesen menos:
   - `@imgly/background-removal`
   - `@react-three/drei`, `@react-three/fiber`
   - `gsap`
   - `liquid-glass-react`
   - `sonner`
   - `usertour.js`

   Ojo: la versión `-node` de `@imgly` sí se usa, en el recorte de fondo de productos.
5. **Panel `/admin` de la plataforma.** La página verifica el rol en el navegador; los datos sí están protegidos en el servidor. Pasar ese chequeo a un layout de servidor evitaría que se vea un instante la estructura vacía.
6. **Negocio demo "barberia".** El footer y `/showcase` linkean a `/barberia/reservar`. Ese negocio existe porque lo crea el seed; asegurate de que exista también en producción.

**Limpieza cuando tengas tiempo:**
7. Las 594 advertencias de ESLint son casi todas variables sin usar (300) y `any` (224). No rompen nada, pero ensucian. Se pueden limpiar de a una carpeta.
8. 6 lugares navegan con `window.location.href` en vez del router de Next, lo que recarga la página completa:
   - `components/dashboard/Header.tsx` y `MobileTabBar.tsx`
   - `app/admin/page.tsx` y `app/admin/negocios/page.tsx`
   - `app/dashboard/configuracion/page.tsx`

   En el logout está bien hacerlo así; en el resto se puede usar `router.push`.
9. **Los `.md` de la raíz.** `CONTEXTO_LLM.md`, `CHANGELOG_SYNC.md` y `DOCUMENTACION_SOFTWARE.md` todavía mencionan archivos que ahora están en `descartados/` (por ejemplo, `PublicBookingLink` y `upay`). Conviene actualizarlos para que no confundan.
10. Antes del próximo deploy, aplicá en producción la migración nueva `20261009060000_whatsapp_verification` con `prisma migrate deploy`. Sin ella, la verificación por WhatsApp queda apagada y el registro funciona sin pedir código.

## Cómo lo verifiqué

- **Compilación:** `next build` completo, `tsc --noEmit` y `eslint .` en todo el proyecto.
- **Archivos sin uso:** `knip`, que analiza el grafo de imports, más una búsqueda por texto para descartar referencias dinámicas.
- **Rutas y guardas:** pedí cada página principal al servidor (`/`, `/login`, `/onboarding`, `/privacidad`, `/terminos`, `/showcase`, `/barberia/reservar`, `/dashboard`, `/admin`) y todas responden. Las rutas que protegí devuelven 401 sin sesión, y `barberia.agendatepy.com/admin` redirige al dashboard.
- **Visual:** revisé la landing en mobile sin imágenes rotas ni desborde horizontal. El único aviso de hidratación lo causa el navegador de prueba de Cursor, no tu código.
