# AgendatePY — Especificación Técnica & Documentación Integral del Software

> **Sistema SaaS Multi-Tenant de Agendamiento Online, CRM con WhatsApp, Fidelización y Gestión Financiera para Negocios de Servicios en Paraguay.**

---

## 1. Visión General del Producto

**AgendatePY** es una plataforma SaaS (*Software as a Service*) de arquitectura multi-inquilino (*multi-tenant*) diseñada para automatizar y profesionalizar la operativa de negocios del sector servicios en Paraguay: barberías, peluquerías, salones de belleza, spas, centros de estética, clínicas, veterinarias y clubes deportivos (canchas de pádel).

### Objetivos Clave de la Plataforma
1. **Eliminar el ausentismo (*no-show*):** Recordatorios automáticos por WhatsApp y confirmaciones en tiempo real.
2. **Autonomía 24/7 para clientes:** Portal de reservas público disponible en subdominios personalizados (`[negocio].agendatepy.com`) sin necesidad de instalar aplicaciones nativas.
3. **Gestión integral de equipo y finanzas:** Control de arqueo de caja diario, cálculo automatizado de comisiones por profesional y registro de movimientos de ingresos/egresos en Guaraníes (PYG).
4. **Fidelización recurrente:** Tarjeta digital de puntos y sellos con soporte de integración para **Apple Wallet**.
5. **Adaptabilidad estética corporativa:** Personalización profunda de marca con fuentes de Google Fonts, colores a medida, diseño de portadas y modo oscuro (*Luxe Dark Mode*).

---

## 2. Arquitectura del Sistema

```mermaid
graph TD
    Client[Cliente / Navegador] -->|HTTPS| Cloudflare[Cloudflare CDN & WAF]
    Cloudflare -->|HTTP :80| Nginx[Nginx Reverse Proxy]
    
    subgraph VPS ["Servidor VPS (Ubuntu 24.04 / Docker Compose)"]
        Nginx -->|Proxy Pass :3000| NextApp[AgendatePY Next.js 15 App]
        NextApp -->|Prisma Client :5432| Postgres[(PostgreSQL 16 DB)]
        NextApp -->|Canvas API| ClientCompression[Compresión WebP en Cliente]
    end

    subgraph External ["Servicios & Integraciones Externas"]
        NextApp -->|OAuth 2.0| GoogleAuth[Google Cloud Console]
        NextApp -->|Transaccional OTP| Resend[Resend Email API]
        NextApp -->|Mensajería| Evolution[Evolution API / WhatsApp Gateway]
        NextApp -->|Passbook .pkpass| AppleWallet[Apple Wallet Passes]
        NextApp -->|Pasarela Cobros| UPay[uPay / Bancard Gateway]
    end
```

### Componentes de Infraestructura

| Componente | Tecnología | Rol / Función |
| :--- | :--- | :--- |
| **CDN & DNS** | Cloudflare | Gestión de DNS wildcard (`*.agendatepy.com`), mitigación DDoS, SSL/TLS Edge y caché de assets estáticos. |
| **Proxy Inverso** | Nginx Alpine (Docker) | Enrutamiento de tráfico al contenedor Next.js, compresión Gzip, preservación de cabeceras (`Host`, `X-Forwarded-*`, `CF-Connecting-IP`). |
| **Aplicación Web** | Next.js 15 (Node 20 Alpine) | Renderizado híbrido (SSR / RSC / Server Actions), API routes y enrutamiento dinámico multi-tenant. |
| **Base de Datos** | PostgreSQL 16 Alpine | Motor relacional con volumen persistente (`pgdata`), índices UUID y consultas transaccionales. |
| **ORM & Migraciones** | Prisma ORM | Modelado tipado, migraciones automáticas (`prisma migrate deploy`) y seeders idempotentes. |

---

## 3. Modelo de Dominio & Base de Datos (Prisma Schema)

La base de datos está totalmente normalizada y diseñada bajo el patrón de **aislamiento multi-inquilino a nivel de fila (*Tenant ID Row-Level Isolation*)**. Cada tabla de negocio contiene una referencia foránea indexada a `tenants.id`.

### Diagrama Entidad-Relación (Simplificado)

```mermaid
erDiagram
    TENANT ||--o{ USER : "posee"
    TENANT ||--o{ STAFF : "emplea"
    TENANT ||--o{ SERVICE : "ofrece"
    TENANT ||--o{ CLIENT : "registra"
    TENANT ||--o{ APPOINTMENT : "gestiona"
    TENANT ||--o{ CASH_MOVEMENT : "contabiliza"
    TENANT ||--o{ LOYALTY_REWARD : "define"
    STAFF ||--o{ STAFF_SCHEDULE : "cumple"
    STAFF ||--o{ STAFF_SERVICE : "realiza"
    STAFF ||--o{ COMMISSION : "acumula"
    SERVICE ||--o{ STAFF_SERVICE : "asignado_a"
    APPOINTMENT ||--o| COMMISSION : "genera"
```

### Resumen de Entidades Principales

1. **`Tenant`:** Entidad raíz del negocio.
   - Campos: `id` (UUID), `name`, `slug`, `subdomain`, `plan` (`BASICO`, `PROFESIONAL`, `EMPRESA`), `status` (`ACTIVE`, `PAUSED`), `settings` (JSON), `themeSettings` (JSON), `timezone` (`America/Asuncion`).
2. **`User`:** Usuarios administradores y miembros del staff.
   - Roles: `SUPERADMIN` (dueño de la plataforma SaaS), `OWNER` (dueño del negocio), `STAFF` (colaborador con acceso restringido).
3. **`OtpCode`:** Códigos numéricos de 6 dígitos para autenticación Passwordless vía correo electrónico con vencimiento en 10 minutos.
4. **`Staff` & `StaffSchedule`:**
   - Profesionales y estilistas del negocio.
   - Manejo de porcentaje de comisión individual (`commissionPercentage`).
   - Horarios de trabajo civil por día de la semana ISO (`dayOfWeek`: 1 = Lunes a 7 = Domingo) con `startTime` y `endTime`.
5. **`Service` & `StaffService`:**
   - Servicios ofrecidos con duración en minutos y precio en Guaraníes enteros (sin decimales).
   - Tabla intermedia de asignación de qué servicios puede prestar cada miembro del staff.
6. **`Client`:**
   - Directorio de clientes con teléfono normalizado, email, notas internas, puntos de fidelización y métrica de gasto total acumulado (`totalSpent`).
7. **`Appointment`:**
   - Cita agendada con rango temporal UTC (`startTime`, `endTime`).
   - Estados: `PENDING_ACTION`, `CONFIRMED`, `CANCELLED`, `COMPLETED`, `EXPIRED`, `NO_SHOW`.
8. **`Commission`:**
   - Registro de comisiones generadas por citas completadas con porcentaje y monto en PYG, con estados `PENDING` y `PAID`.
9. **`CashMovement`:**
   - Asientos de caja chica y arqueo: Tipo (`INCOME` / `EXPENSE`), monto en PYG, categoría, descripción y método de pago (`Efectivo`, `Tarjeta POS`, `SIPAP`, `Billetera`).
10. **`LoyaltyReward`:**
    - Catálogo de beneficios canjeables por puntos acumulados con descuento aplicable en Guaraníes.

---

## 4. Módulos y Funcionalidades del Software

### A. Portal Público de Agendamiento (`/[tenant]/reservar`)
- **Enrutamiento Inteligente por Subdominio:** Resolución mediante middleware que detecta si el visitante accede vía `barberia.agendatepy.com` o mediante ruta directa `agendatepy.com/[tenant]/reservar`.
- **Asistente de Reserva en 4 Pasos (Wizard):**
  1. *Selección de Servicio:* Búsqueda interactiva con desglose de duración y costo en Guaraníes.
  2. *Selección de Profesional:* Selección de un especialista específico o asignación inteligente a "Cualquier profesional disponible".
  3. *Selector de Día y Hora:* Motor de cálculo reactivo que cruza la jornada laboral del staff, citas existentes y solapamientos para ofrecer únicamente intervalos libres.
  4. *Datos del Cliente y Confirmación:* Captura de nombre y número de WhatsApp con máscara telefónica nacional de Paraguay (`+595`).
- **Reserva Inmediata:** Generación del ticket digital y pantalla de éxito (`/[tenant]/reservar/listo`) con opción de añadir a Google Calendar y Apple Calendar.

---

### B. Club de Fidelización Digital & Apple Wallet (`/[tenant]/tarjeta/[clientId]`)
- **Tarjeta de Sellos Digital:** Cada visita suma puntos calculados automáticamente en base al consumo o por turno asistido.
- **Pase Oficial para Apple Wallet:**
  - Endpoint `/api/wallet/apple/[clientId]` que genera el paquete firmado `.pkpass` para que los clientes almacenen su tarjeta en el iPhone.
  - Actualización en tiempo real del saldo de puntos y notificaciones de bienvenida.
- **Canje de Recompensas:** Los clientes pueden visualizar qué premios o descuentos tienen desbloqueados directamente desde su navegador móvil.

---

### C. Autenticación & Control de Sesiones
- **Google OAuth 2.0 Oficial:**
  - Botón "Continuar con Google" en `/login`.
  - Redirección y callback securizado en `/api/auth/callback/google`.
  - Creación automática de cuenta o vinculación de perfil existente.
- **Acceso Passwordless vía Código OTP (Resend):**
  - Envío de correos corporativos en HTML enriquecido con diseño oficial de AgendatePY.
  - Validación de código de 6 dígitos con límite de intentos y caducidad temporal.
- **Sesiones Criptográficas:**
  - Cookies HTTP-only firmadas con HMAC-SHA256 (`SESSION_SECRET`).
  - Sin dependencias de sesiones pesadas en memoria, alta escalabilidad.

---

### D. Panel Administrativo del Negocio (`/dashboard`)

#### 1. Calendario & Agenda Interactiva (`/dashboard/calendario`)
- Vistas adaptativas: Diaria, Semanal y Mensual.
- Filtro individual por profesional para visualizar cargas de trabajo.
- Drag & Drop y cambio rápido de estados (Confirmar, Marcar como Asistido, Cancelar, No Show).
- Creación rápida de citas manuales o bloqueos de horario por descanso o compromisos personales.

#### 2. CRM & Ficha 360° del Cliente (`/dashboard/crm` y `/dashboard/clientes`)
- **Bandeja Unificada Multicanal:** Conversaciones de WhatsApp, Instagram Direct y Messenger integradas.
- **Ficha Integral del Cliente (`ClientFichaModal`):**
  - Datos de contacto, notas confidenciales de atención y etiquetas de segmentación (ej. *Cliente VIP*, *Puntual*, *Tratamiento Especial*).
  - Histórico cronológico de servicios realizados y gasto monetario total en PYG.
  - **Galería Multimedia con Compresión Canvas:**
    - Almacenamiento de fotos de antes y después, fórmulas químicas de tinte y notas de voz.
    - Las fotos tomadas con cámaras de alta resolución (4MB a 12MB) se comprimen automáticamente en el navegador mediante HTML5 Canvas a formato WebP/JPEG optimizado (50KB a 120KB), logrando un **ahorro de almacenamiento de hasta 98%** sin pérdida de nitidez visible.

#### 3. Control de Caja & Arqueo Diario (`/dashboard/caja` y `/dashboard/transferencias`)
- Apertura y cierre de caja chica diario.
- Registro detallado de ingresos (servicios cobrados y venta de productos) y egresos (gastos operativos, compra de insumos).
- Múltiples medios de cobro adaptados al mercado paraguayo:
  - Efectivo.
  - Tarjetas de Débito y Crédito (POS).
  - Transferencias bancarias instantáneas (SIPAP / Bancos locales).
  - Billeteras móviles (Zimple, Tigo Money, Personal Pay).
- Registro y conciliación de transferencias bancarias para evitar fraudes con comprobantes falsos.

#### 4. Gestión de Equipo & Comisiones (`/dashboard/equipo` y `/dashboard/comisiones`)
- Alta de profesionales con foto de perfil, descripción y asignación de color en agenda.
- Configuración de porcentaje de comisión acordado (ej. 50%, 60%, 70%).
- Liquidación automática: Cálculo exacto de las comisiones devengadas por cada profesional en un rango de fechas según servicios efectivamente completados.
- Marcado de pagos realizados para mantener la transparencia laboral.

#### 5. Catálogo de Servicios & Productos (`/dashboard/servicios` y `/dashboard/productos`)
- Gestión de servicios: Nombre, categoría, descripción, duración estimada (en bloques de 15, 30, 45, 60 minutos) y precio en PYG.
- Control de stock y venta rápida en mostrador de productos para el hogar (ceras, aceites, shampoos, cremas).

#### 6. Personalizador de Marca & Experiencia Visual (`/dashboard/apariencia`)
El módulo de apariencia fue rediseñado bajo una arquitectura de 4 pestañas progresivas para erradicar la sobrecarga cognitiva y la fatiga de scroll continuo:
- **Pestaña 1: Estilos & Colores:**
  - 12 Presets prediseñados de 1 clic clasificados por rubro (Barberías, Salones & Estética, Spas & Wellness, Modern Tech, Urbano & Trend, Lujo VIP).
  - Selector de modo Claro y Oscuro de alta gama (*Luxe Dark Mode*).
  - Paleta cromática personalizada: Selector de color primario de marca y color de fondo.
  - **13 Tipografías Oficiales de Google Fonts:** Plus Jakarta Sans, Inter, Outfit, Montserrat, Playfair Display, Poppins, Roboto, etc.
  - **4 Distribuciones de Layout:**
    1. *Portada Panorámica:* Gran banner cinematográfico y agendador limpio.
    2. *Mosaico & Galería Dividida:* Mosaico de fotos reales a la izquierda y agendador a la derecha.
    3. *Tarjeta Flotante con Historias:* Efecto de halo ambiental difuso y fotos en burbujas estilo stories.
    4. *Minimalista Editorial:* Lookbook sobrio, tipografía cuidada y líneas sutiles.
- **Pestaña 2: Fotos & Portada (Subida Directa & Compresión Invisible):**
  - **Carga de archivos nativa:** Dropzone y selectores de archivos directos desde el celular o la computadora para fotos de la galería, foto de portada (banner panorámico) y logo oficial (foto de perfil).
  - **Compresión transparente en el cliente (`lib/media-compression.ts`):** Utiliza HTML5 Canvas para reescalar bicúbicamente y convertir imágenes pesadas (4MB–12MB) a formato WebP ultraliviano (~80KB) antes de ser enviadas a `/api/upload`. El cliente nunca percibe tecnicismos ni demoras en subida.
  - Galería de fotos con eliminación instantánea y sugerencias profesionales en 1 clic.
- **Pestaña 3: Botones & Enlaces de Biografía (Estilo Linktree / Bento):**
  - Accesos directos integrados: Pedir Uber directo al local, Cómo llegar (Google Maps / Waze), WhatsApp de Recepción, Dejar Reseña en Google (5 estrellas) y Ver Menú o Carta (PDF).
  - **8 Acabados visuales de botones interactivos:** Sólido, Delineado, Cristal, Sombra Retro 3D, Glow Neón, Degradado, Borde Doble y Flotante Suave, presentados con botones de muestra en tiempo real sin jerga técnica.
  - Configuración de grosor de borde, altura/padding, alineación, mayúsculas y jerarquía de visualización.
- **Pestaña 4: Textos Comerciales & Políticas:**
  - Slogan comercial, aviso importante/políticas de reserva, bio o descripción del local y redes sociales oficiales (Instagram, TikTok, WhatsApp, Facebook).
  - Efectos ambientales de fondo (Limpio, Iluminación difusa mesh, Puntos finos y Cuadrícula).
- **Protección contra pérdida de cambios:**
  - Botón de guardado prominente en la barra superior con degradado esmeralda y animación pulsante.
  - Barra flotante inferior reactiva que alerta sobre cambios sin guardar con botón directo *"Guardar Ahora"*.
  - Evento `beforeunload` para evitar cerrar la pestaña accidentalmente sin guardar.

#### 7. Automatización por WhatsApp (`/dashboard/whatsapp`)
- Conexión mediante Evolution API v2 o WhatsApp Cloud API oficial.
- Plantillas automáticas con variables dinámicas (`{{nombre}}`, `{{fecha}}`, `{{profesional}}`, `{{servicio}}`, `{{link_cancelar}}`):
  1. Confirmación inmediata tras agendar.
  2. Recordatorio preventivo 24 horas y 2 horas antes de la cita.
  3. Mensaje post-visita agradeciendo la asistencia y solicitando una calificación o reseña.
- Simulador interactivo en pantalla con mockup de iPhone 16 Pro para probar flujos antes de activarlos.

---

### E. Sistema de Visita Guiada Interactiva (Spotlight Onboarding Tour)
El sistema incluye un motor de onboarding y tutoriales paso a paso basado en el patrón **Spotlight Cutout** (inspirado en `usertour.js`):
- **Atenuación de pantalla:** Una máscara SVG oscurece todo el viewport al 78% (`rgba(3, 7, 18, 0.78)`) y recorta dinámicamente un foco luminoso transparente sobre el elemento que el usuario debe utilizar.
- **Baliza directriz ("👉 Apretá acá"):** Muestra un puntero animado y un anillo luminoso pulsante exactamente en la ubicación del control objetivo.
- **Tarjeta emergente contextual:** Popover anclado dinámicamente al elemento objetivo con selector rápido entre las 18 secciones del panel, barra de progreso por pasos y atajos de teclado (Escape, Flechas).
- **Conmutación automática de pestañas:** Si el paso guiado apunta a un elemento que reside en una pestaña inactiva (ej. fotos o botones), el sistema conmuta la pestaña de forma transparente para que el usuario nunca quede desorientado.

---

### F. Módulo Superadmin (`/superadmin`)
- Panel de control global para los propietarios del SaaS.
- Monitoreo de todos los negocios registrados, planes suscritos y volumen de citas procesadas.
- Activación, suspensión y ajuste de parámetros de facturación.

---

## 5. Especificaciones Técnicas y Entorno de Producción

### Stack Tecnológico

| Área | Herramientas Utilizadas |
| :--- | :--- |
| **Framework Fullstack** | Next.js 15 (App Router, Server Actions, Turbopack) |
| **Librería de UI** | React 19, TypeScript (Modo Estricto) |
| **Estilos & Iconografía** | Vanilla CSS Tokens, Tailwind CSS, Lucide React Icons |
| **Manejo de Estado Cliente** | Zustand (`useDashboardStore.ts`) |
| **Fechas & Zona Horaria** | `date-fns`, `date-fns-tz` (Base canónica: `America/Asuncion`) |
| **Base de Datos** | PostgreSQL 16 (Alpine Linux) |
| **Capa de Datos** | Prisma ORM 5.x |
| **Contenedores** | Docker Engine & Docker Compose v2 |
| **Servidor Web / Proxy** | Nginx Alpine |
| **Correos Transaccionales** | Resend API |
| **Autenticación Externa** | Google OAuth 2.0 (Google Identity Services) |

### Estructura de Directorios del Repositorio

```text
agendatepy/
├── deploy.sh                     # Script de despliegue automático en el VPS
├── docker-compose.prod.yml       # Orquestación de producción (Postgres + App + Nginx)
├── docker-compose.yml            # Orquestación de desarrollo / servicios auxiliares
├── nginx/
│   └── nginx.conf                # Configuración de Nginx con soporte multi-tenant
└── frontend/
    ├── Dockerfile                # Imagen optimizada Node.js 20 Alpine para Next.js
    ├── prisma/
    │   ├── schema.prisma         # Esquema de datos PostgreSQL
    │   ├── seed.ts               # Semilla con datos demo de barbería paraguaya
    │   └── migrations/           # Historial de migraciones SQL
    ├── app/
    │   ├── [tenant]/             # Rutas públicas del negocio (reservar, tarjeta, turno)
    │   ├── api/                  # Endpoints REST (auth Google, webhooks, Apple Wallet)
    │   ├── dashboard/            # Panel administrativo privado (agenda, CRM, caja, staff)
    │   ├── login/                # Pantalla de login unificada (Google + OTP Email)
    │   ├── onboarding/           # Flujo de bienvenida y configuración de nuevo local
    │   ├── superadmin/           # Panel SaaS central de AgendatePY
    │   └── showcase/             # Laboratorio interactivo de componentes y estilos
    ├── components/
    │   ├── booking/              # Componentes del asistente de reservas
    │   ├── dashboard/            # Tableros de calendario, CRM, fichas de clientes y caja
    │   └── ui/                   # Componentes atómicos de diseño y modales
    ├── lib/
    │   ├── auth/                 # Lógica de Google OAuth, OTP y cookies de sesión HMAC
    │   ├── tenant/               # Resolución de inquilinos y dominios
    │   ├── email.ts              # Cliente y plantillas de correo Resend
    │   ├── evolution.ts          # Integración con Evolution API para WhatsApp
    │   ├── media-compression.ts  # Motor de compresión de fotos con Canvas
    │   ├── theme.ts              # Definiciones de temas, fuentes y paletas cromáticas
    │   └── upay.ts               # Pasarela de pagos para Paraguay
    └── store/
        └── useDashboardStore.ts  # Estado global reactivo del panel de administración
```

---

## 6. Variables de Entorno del Sistema

Para el correcto funcionamiento tanto en desarrollo local como en el servidor VPS, se utiliza la siguiente matriz de variables de entorno:

| Variable | Tipo | Descripción | Ejemplo / Valor |
| :--- | :--- | :--- | :--- |
| `DATABASE_URL` | Secreto | Cadena de conexión principal a PostgreSQL con pool de conexiones. | `postgresql://agendate:pass@postgres:5432/agendatepy?schema=public` |
| `DIRECT_URL` | Secreto | Conexión directa a PostgreSQL para migraciones de Prisma. | `postgresql://agendate:pass@postgres:5432/agendatepy?schema=public` |
| `AGENDATE_ROOT_DOMAIN` | Público | Dominio base para resolución de inquilinos. | `agendatepy.com` |
| `NEXT_PUBLIC_ROOT_DOMAIN` | Público | Dominio expuesto al frontend. | `agendatepy.com` |
| `NEXT_PUBLIC_APP_URL` | Público | URL pública canónica de la plataforma. | `https://agendatepy.com` |
| `GOOGLE_CLIENT_ID` | Secreto | ID de cliente OAuth 2.0 generado en Google Cloud Console. | `387599...apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | Secreto | Clave secreta OAuth 2.0 de Google Cloud Console. | `GOCSPX-...` |
| `RESEND_API_KEY` | Secreto | Clave API de Resend para el envío de correos OTP. | `re_...` |
| `EMAIL_FROM` | Config | Remitente verificado para los correos salientes. | `AgendatePY <seguridad@agendatepy.com>` |
| `SESSION_SECRET` | Secreto | Llave criptográfica para firmar cookies de sesión con HMAC. | `cadena_aleatoria_super_segura_2026` |
| `DB_PASSWORD` | Secreto | Contraseña del usuario de la base de datos PostgreSQL en Docker. | `agendatepy2026secure` |

---

## 7. Procedimiento de Despliegue en Servidor VPS

El despliegue en el servidor VPS (`149.104.76.16`) está totalmente automatizado mediante el script `deploy.sh`.

### Flujo de Ejecución del Script `deploy.sh`:
1. **Verificación de Entorno:** Comprueba si existe el archivo de variables `.env`. Si no existe, lo genera con la estructura base.
2. **Instalación de Docker:** Detecta si Docker y Docker Compose están presentes; en caso contrario, descarga e instala la versión oficial automáticamente.
3. **Seguridad & Firewall:** Configura `ufw` para habilitar el tráfico en los puertos `22` (SSH), `80` (HTTP) y `443` (HTTPS).
4. **Construcción y Lanzamiento:** Ejecuta `docker compose -f docker-compose.prod.yml up -d --build` para compilar la imagen de Next.js y levantar los 3 contenedores.
5. **Migraciones de Base de Datos:** Ejecuta `npx prisma migrate deploy` en el contenedor `app` para aplicar la estructura de datos en PostgreSQL.
6. **Poblado Inicial (Seed):** Ejecuta `npx prisma db seed` para dejar activo el negocio demo inicial (*Barbería Demo*).

---

## 8. Seguridad y Buenas Prácticas

- **Sin exposición de credenciales:** Ningún token de API, contraseña ni secreto está hardcodeado en archivos de código fuente rastreados por Git. Todos son inyectados mediante variables de entorno en tiempo de ejecución.
- **Cookies HttpOnly & Secure:** Las cookies de autenticación no son accesibles mediante JavaScript en el navegador, mitigando ataques de tipo Cross-Site Scripting (XSS).
- **Protección contra solapamientos de turnos:** Algoritmo que valida a nivel de base de datos la disponibilidad de los bloques horarios para impedir doble reserva involuntaria.
- **Optimización de Almacenamiento:** Compresión en el cliente que reduce el impacto de subidas de imágenes pesadas en el servidor y acelera la carga para usuarios con redes móviles.
- **Cabeceras de Proxy Seguras:** Nginx reenvía la IP real del cliente validada por Cloudflare (`CF-Connecting-IP`) para auditorías de seguridad y registro de movimientos de caja.

---

*Documento técnico generado para el equipo de desarrollo y administración de AgendatePY.*
