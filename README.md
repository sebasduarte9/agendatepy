# AgendatePY - Sistema de Agendamiento & Gestión para Negocios

Plataforma SaaS integral de reservas online, gestión de citas, fidelización de clientes y automatización por WhatsApp Cloud API, diseñada especialmente para barberías, peluquerías, salones de belleza y spas en Paraguay.

---

## Características Principales

- **Motor de Reservas en Tiempo Real:** Algoritmo de detección y prevención de solapamientos con restricciones nativas a nivel de base de datos (`PostgreSQL Exclusion Constraints`).
- **Personalización de Marca & Apariencia:**
  - 13 familias tipográficas oficiales de Google Fonts cargadas dinámicamente.
  - 4 distribuciones de layout: Portada Panorámica, Mosaico & Galería Dividida, Tarjeta Flotante con Historias y Minimalista Editorial (Lookbook).
  - Selector de paletas y modo oscuro (*Luxe Dark Mode*) con persistencia en base de datos.
- **Simulador Interactivo de WhatsApp:** Mockup fotorrealista de iPhone 16 Pro con simulación de flujo de agendamiento, confirmaciones automáticas, notas de voz interactivas y botones nativos de respuesta rápida (*Quick Replies*).
- **Panel Administrativo (Dashboard):**
  - Calendario interactivo con vista diaria, semanal y mensual.
  - Gestión de caja con arqueo ciego, registro de ingresos/egresos y soporte para Efectivo, Tarjeta POS, SIPAP y Billeteras electrónicas.
  - Cálculo automático de comisiones por profesional y equipo de trabajo.
  - Club de fidelización con tarjetas de sellos digitales y recompensas personalizables.
  - Catálogo de servicios y tienda de productos para retiro en local.
- **Laboratorio Interactivo de Diseño (`/showcase`):** Espacio interactivo para explorar combinaciones cromáticas, tipografías, componentes y estados de interfaz en tiempo real.
- **Estética Corporativa:** Interfaz moderna y profesional con iconos vectoriales de Lucide React, sin emojis informales en componentes de producción.

---

## Stack Tecnológico

| Capa | Tecnologías |
| :--- | :--- |
| **Framework Web** | Next.js 16 (App Router con Turbopack), React 19 |
| **Estilos & UI** | Tailwind CSS, Vanilla CSS tokens, Framer Motion, Lucide React |
| **Base de Datos & ORM** | PostgreSQL 14+, Prisma ORM |
| **Integraciones CRM** | Chatwoot (Docker Compose multi-canal: WhatsApp, Instagram DM, Messenger) |
| **Lenguaje** | TypeScript con tipado estricto (0 errores) |

---

## Requisitos Previos

Antes de comenzar, asegúrate de tener instalado en tu sistema:

1. **Node.js**: Versión 18.18.0 o superior (recomendado Node 20 LTS).
2. **PostgreSQL**: Base de datos activa y en ejecución (puerto 5432).
3. **Git**: Para control de versiones.
4. **Docker & Docker Compose** *(Opcional)*: Solo requerido si deseas desplegar la suite de Chatwoot CRM localmente.

---

## Guía de Instalación Paso a Paso

### 1. Clonar el Repositorio

Abre tu terminal y clona el proyecto en tu máquina local:

```bash
git clone https://github.com/sebasduarte9/agendatepy.git
cd agendatepy
```

### 2. Instalar Dependencias del Frontend

Ingresa a la carpeta `frontend` e instala todos los paquetes necesarios:

```bash
cd frontend
npm install
```

### 3. Configurar Variables de Entorno

Copia el archivo de plantilla `.env.example` para crear tu `.env` local:

```bash
cp .env.example .env
```

Abre `frontend/.env` en tu editor de código y configura la URL de conexión a tu base de datos PostgreSQL local:

```env
# Ejemplo con usuario local sin contraseña:
DATABASE_URL="postgresql://tu_usuario:tu_contraseña@localhost:5432/agendatepy"
DIRECT_URL="postgresql://tu_usuario:tu_contraseña@localhost:5432/agendatepy"

# Dominio base para resolución multi-inquilino en local
NEXT_PUBLIC_ROOT_DOMAIN="localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

> **Nota:** Si tu base de datos `agendatepy` aún no existe en PostgreSQL, puedes crearla ejecutando en tu terminal:
> ```bash
> createdb agendatepy
> ```

### 4. Ejecutar Migraciones y Crear Inquilino Demo (Seed)

Aplica las migraciones de base de datos para crear todas las tablas, vistas y restricciones:

```bash
npx prisma migrate dev
```

Ejecuta el script de inicialización para cargar el negocio de demostración (*Barbería & Salón* con profesionales, horarios y servicios iniciales):

```bash
npx prisma db seed
```

### 5. Iniciar el Servidor de Desarrollo

Inicia Next.js en modo desarrollo:

```bash
npm run dev
```

El servidor estará disponible de inmediato en [http://localhost:3000](http://localhost:3000).

---

## Rutas y Accesos Principales

Una vez levantado el servidor local, puedes navegar por los siguientes módulos:

| Módulo | Ruta Local | Descripción |
| :--- | :--- | :--- |
| **Landing Page** | [http://localhost:3000](http://localhost:3000) | Página principal con propuesta de valor y simulador 3D de iPhone con WhatsApp. |
| **Página de Reservas** | [http://localhost:3000/barberia/reservar](http://localhost:3000/barberia/reservar) | Portal público donde el cliente final agenda turnos, selecciona pagos y productos. |
| **Panel de Control** | [http://localhost:3000/dashboard](http://localhost:3000/dashboard) | Panel central de administración de agenda, métricas del día y estado de citas. |
| **Editor de Apariencia** | [http://localhost:3000/dashboard/apariencia](http://localhost:3000/dashboard/apariencia) | Personalización de colores, tipografías de Google, fotos y layouts en vivo. |
| **Arqueo & Caja** | [http://localhost:3000/dashboard/caja](http://localhost:3000/dashboard/caja) | Control de ingresos en efectivo, POS, transferencias SIPAP y arqueo ciego. |
| **Fidelización VIP** | [http://localhost:3000/dashboard/fidelizacion](http://localhost:3000/dashboard/fidelizacion) | Club de sellos digitales para premiar a clientes recurrentes. |
| **Integración WhatsApp** | [http://localhost:3000/dashboard/whatsapp](http://localhost:3000/dashboard/whatsapp) | Plantillas automáticas de recordatorios, confirmaciones y webhook de chat. |
| **Laboratorio de Diseño** | [http://localhost:3000/showcase](http://localhost:3000/showcase) | Catálogo interactivo de diseño, paletas cromáticas y componentes UI. |

---

## Despliegue Opcional: Chatwoot CRM (Docker)

El proyecto incluye soporte opcional para Chatwoot CRM mediante Docker Compose si deseas gestionar conversaciones de WhatsApp, Instagram Direct y Facebook Messenger en una bandeja unificada:

```bash
# Desde la raíz del proyecto
docker compose up -d
```

Esto iniciará los servicios de Redis, PostgreSQL para Chatwoot y la plataforma de mensajería en `http://localhost:3001`.

---

## Flujo de Trabajo Colaborativo (Git)

Para mantener la estabilidad del proyecto en GitHub, sigue estas pautas de desarrollo:

1. **Mantener la rama principal actualizada:**
   ```bash
   git checkout main
   git pull origin main
   ```

2. **Crear una rama para tu funcionalidad o ajuste:**
   ```bash
   git checkout -b feature/nombre-de-la-tarea
   ```

3. **Verificar compilación antes de subir cambios:**
   ```bash
   cd frontend
   npx tsc --noEmit
   ```

4. **Confirmar y publicar cambios:**
   ```bash
   git add .
   git commit -m "feat: descripción clara y profesional del cambio"
   git push origin feature/nombre-de-la-tarea
   ```

5. **Crear Pull Request en GitHub:**
   Abre el Pull Request en [GitHub](https://github.com/sebasduarte9/agendatepy) para revisión y posterior integración a `main`.

---

## Licencia

Proyecto privado. Todos los derechos reservados.
