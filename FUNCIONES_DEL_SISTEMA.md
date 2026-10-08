# AgendatePY — Catálogo Exhaustivo de Funcionalidades del Sistema

> **Documento Maestro de Especificación Funcional & Técnica**  
> Plataforma SaaS Multi-Tenant para Agendamiento Online, Automatización con WhatsApp Oficial, Fidelización de Clientes y Gestión Operativa/Financiera en Paraguay.

---

## Índice General

1. [Visión General & Propuesta de Valor](#1-visión-general--propuesta-de-valor)
2. [Arquitectura Tecnológica & Stack](#2-arquitectura-tecnológica--stack)
3. [Experiencia del Cliente Final (Portal Público)](#3-experiencia-del-cliente-final-portal-público)
   - 3.1 Portal de Reservas Online 24/7 (`/[tenant]/reservar`)
   - 3.2 Portal de Autogestión del Turno (`/[tenant]/turno/[id]`)
   - 3.3 Tarjeta Digital de Fidelización (`/[tenant]/tarjeta/[clientId]`)
4. [Módulos del Panel de Administración (Dashboard)](#4-módulos-del-panel-de-administración-dashboard)
   - 4.1 Panel de Control & Métricas Diarias (`/dashboard`)
   - 4.2 Agenda & Calendario de Turnos (`/dashboard/calendario`)
   - 4.3 Nueva Reserva Rápida en Mostrador (`/dashboard/nueva-reserva`)
   - 4.4 Bloqueo de Horarios & Feriados (`/dashboard/bloquear-horario`)
   - 4.5 Catálogo de Servicios & Precios (`/dashboard/servicios`)
   - 4.6 Catálogo de Productos, Control de Stock & Recorte con IA (`/dashboard/productos`)
   - 4.7 Directorio de Clientes & CRM Individual (`/dashboard/clientes`)
   - 4.8 Control de Caja Chica & Arqueo Diario (`/dashboard/caja`)
   - 4.9 Liquidación de Comisiones & Recibos Oficiales (`/dashboard/comisiones`)
   - 4.10 Validación de Comprobantes de Transferencia (`/dashboard/transferencias`)
   - 4.11 Club VIP & Programa de Lealtad (`/dashboard/fidelizacion`)
   - 4.12 CRM Omnicanal & Bandeja de Conversaciones (`/dashboard/crm`)
   - 4.13 Bot de WhatsApp Oficial & Canva de Flujo Visual (`/dashboard/whatsapp`)
   - 4.14 Personalización Visual & Apariencia de Marca (`/dashboard/apariencia`)
   - 4.15 Gestión de Equipo, Horarios & Permisos (`/dashboard/equipo`)
   - 4.16 Reportes Financieros & Estadísticas (`/dashboard/estadisticas`)
   - 4.17 Ajustes del Negocio & Datos de Transferencia (`/dashboard/configuracion`)
   - 4.18 Planes & Suscripción SaaS (`/dashboard/suscripcion`)
5. [Sistema de Visita Guiada Interactiva (Guided Tour)](#5-sistema-de-visita-guiada-interactiva-guided-tour)
6. [Módulo de Super Administración SaaS (`/admin`)](#6-módulo-de-super-administración-saas-admin)
7. [Landing Page de Alta Conversión (`/`)](#7-landing-page-de-alta-conversión-)
8. [Matriz de Endpoints de la API REST](#8-matriz-de-endpoints-de-la-api-rest)
9. [Seguridad, Datos & Cumplimiento Normativo](#9-seguridad-datos--cumplimiento-normativo)

---

## 1. Visión General & Propuesta de Valor

**AgendatePY** es una solución integral todo en uno desarrollada a la medida de los comercios de servicios en Paraguay (barberías, peluquerías, salones de manicura, centros de estética, spas, clínicas odontológicas/médicas, veterinarias y clubes deportivos de pádel).

### Pilares Fundamentales
1. **Reducción a Cero del Ausentismo (*No-Show*):** Recordatorios automáticos en WhatsApp 24 horas y 2 horas antes de cada cita con enlace de confirmación/reprogramación.
2. **Disponibilidad 24/7 sin Intermediarios:** Los clientes agendan desde cualquier navegador móvil o de escritorio sin registrarse ni descargar apps.
3. **Flujos Financieros Adaptados a Paraguay:** Gestión nativa en Guaraníes (PYG), validación de comprobantes de transferencia de bancos locales y liquidación de comisiones separadas por servicios y productos.
4. **Fidelización Móvil Moderna:** Sellos y puntos digitales acumulables sin descargas obligatorias, accesibles desde el navegador y agregables a la pantalla de inicio del smartphone.
5. **Autonomía Visual Total:** Cada negocio define sus colores corporativos, tipografías de Google Fonts y galerías de fotos, funcionando como su propia página web profesional.

---

## 2. Arquitectura Tecnológica & Stack

- **Framework Web:** Next.js 16 (Turbopack, App Router, React 19, Server Components y Server Actions).
- **Base de Datos:** PostgreSQL 16 con Prisma ORM (Row-Level Security multi-tenant por `tenantId`).
- **Autenticación:** NextAuth.js con soporte dual:
  - Google OAuth 2.0 con vinculación de perfil.
  - Autenticación Passwordless con códigos OTP transaccionales por email (vencimiento de 10 minutos).
- **Mensajería & WhatsApp:** Integración con Evolution API (sesión multi-dispositivo en la nube vía QR).
- **Tarjetas Digitales:** Tarjetas web responsivas PWA con código QR identificador de cliente.
- **Procesamiento de Imágenes con IA:** Recorte de fondos en servidor con `@imgly/background-removal-node` y compresión WebP en cliente.
- **Estilos & UI:** Tailwind CSS v4, Lucide Icons, animaciones Framer Motion y componentes customizados (sin componentes genéricos ni emojis en la UI).

---

## 3. Experiencia del Cliente Final (Portal Público)

### 3.1 Portal de Reservas Online 24/7 (`/[tenant]/reservar`)
- **Detección Automática de Negocio:** Resuelve el tenant mediante subdominio (`barberia.agendatepy.com`) o ruta dinámica (`/[tenant]`).
- **Selector de Categoría y Servicios:** Agrupación visual de servicios con nombre, descripción, duración en minutos y precio formateado en Guaraníes (ej: `Gs. 70.000`).
- **Selección de Profesional:**
  - Opción de elegir un profesional específico con su foto de perfil y especialidad.
  - Opción inteligente *"Cualquiera disponible"* para maximizar la ocupación de la agenda.
- **Grilla de Días y Horarios Disponibles:**
  - Cálculo en tiempo real de intervalos libres cruzando la duración del servicio seleccionado con los turnos ya confirmados y los bloqueos de horario.
  - Bloqueo instantáneo de colisiones para impedir turnos superpuestos.
- **Formulario de Identificación Rápida:**
  - Nombre completo y WhatsApp con prefijo paraguayo (+595) y formateo dinámico.
  - Campo opcional de notas o solicitudes especiales.
- **Modalidades de Pago:**
  - *Pago en el Local:* El cliente paga en efectivo o POS al asistir.
  - *Transferencia Bancaria:* Visualización de los datos de la cuenta (Banco, Titular, RUC, Alias) con cargador de archivo del comprobante digital.
- **Pantalla de Éxito (`/listo`):**
  - Resumen detallado con número de turno, profesional, fecha, hora y ubicación del local.
  - Botón *"Añadir a Google Calendar"*.
  - Enlace directo para abrir chat de WhatsApp con el negocio.

### 3.2 Portal de Autogestión del Turno (`/[tenant]/turno/[id]`)
- Permite al cliente consultar el estado de su reserva en cualquier momento sin llamar al local.
- **Reprogramación:** Posibilidad de cambiar fecha y hora según los horarios libres disponibles.
- **Cancelación Anticipada:** Botón para liberar el turno con anticipación configurable (ej. hasta 2 horas antes), liberando automáticamente el cupo en el calendario del negocio.

### 3.3 Tarjeta Digital de Fidelización (`/[tenant]/tarjeta/[clientId]`)
- **Tarjeta de Sellos Digital:** Visualización de sellos activos (ej. 8 sellos necesarios para un corte gratis).
- **Tarjeta de Puntos:** Saldo de puntos acumulados en base al monto gastado en el comercio.
- **Catálogo de Premios:** Lista de beneficios canjeables por puntos con estado desbloqueado/bloqueado.
- **Acceso Directo:** Acceso instantáneo desde el celular para guardar en la pantalla principal sin requerir descargas de apps.

---

## 4. Módulos del Panel de Administración (Dashboard)

### 4.1 Panel de Control & Métricas Diarias (`/dashboard`)
- **KPIs Operativos del Día:**
  - Recaudación acumulada del día en Guaraníes.
  - Cantidad de turnos confirmados vs completados de la jornada.
  - Tasa de ocupación de sillones/salas en porcentaje.
  - Cantidad de clientes registrados en el negocio.
- **Agenda Operativa en Vivo:** Vista cronológica de las citas del día con tarjeta de cliente, servicio, hora, profesional asignado y estado.
- **Acciones Rápidas en 1 Clic:**
  - Marcar asistencia / Completar turno.
  - Abrir chat de WhatsApp con el cliente con mensaje predefinido.
  - Cobrar en caja chica directamente desde el turno.
- **Atajos de Operación Rápida:** Botones de acceso a Bloquear Horarios, Nueva Cita y Validar Transferencias.
- **Checklist de Activación:** Barra de progreso para guiar al dueño a configurar logo, servicios, horarios y WhatsApp.

### 4.2 Agenda & Calendario de Turnos (`/dashboard/calendario`)
- **Vistas Múltiples:** Alternancia entre vista de Día, Semana y Mes.
- **Filtro por Colaborador:** Visualización simultánea de todo el equipo o agenda individual por profesional.
- **Código de Colores Distintivo:** Cada colaborador cuenta con un color asignado para identificar sus turnos de un vistazo.
- **Interacción Directa:** Clic en cualquier celda horaria libre para agendar turno en ese espacio exacto.
- **Modal de Detalle del Turno:** Consulta de datos del cliente, estado del pago, notas internas, botones para cambiar de estado (`CONFIRMADO`, `COMPLETADO`, `CANCELADO`, `NO_SHOW`).

### 4.3 Nueva Reserva Rápida en Mostrador (`/dashboard/nueva-reserva`)
- Formulario de alta velocidad para agendar turnos presenciales o telefónicos en menos de 15 segundos.
- **Búsqueda predictiva de clientes:** Autocompleta datos de clientes frecuentes al tipear nombre o número.
- **Alta express de nuevo cliente:** Creación inmediata sin salir del formulario.
- **Asignación de servicio y profesional:** Cálculo automático de la hora de finalización en base a la duración del servicio.
- **Selección de método de pago:** Efectivo, Tarjeta, Transferencia o Pendiente.

### 4.4 Bloqueo de Horarios & Feriados (`/dashboard/bloquear-horario`)
- Creación de bloqueos de tiempo para:
  - Almuerzos y descansos diarios del personal.
  - Feriados nacionales o días no laborables.
  - Permisos médicos o ausencias de colaboradores específicos.
- Los bloqueos descuentan disponibilidad en tiempo real del portal web y del bot de WhatsApp.

### 4.5 Catálogo de Servicios & Precios (`/dashboard/servicios`)
- **Organización por Categorías:** Clasificación de servicios (ej: Peluquería, Barba, Tratamientos, Spa).
- **Campos del Servicio:** Título, descripción detallada, duración en minutos e importe en Guaraníes.
- **Asignación de Profesionales:** Selección de qué miembros del equipo están calificados para prestar cada servicio.
- **Links Promocionales:** Botón para copiar el enlace directo que abre el portal de reservas preseleccionando ese servicio específico.

### 4.6 Catálogo de Productos, Control de Stock & Recorte con IA (`/dashboard/productos`)
- **Inventario de Salón:** Gestión de productos de reventa (pomadas, champús, cremas, aceites, bebidas).
- **Control Financiero:** Registro de Precio de Venta al Público (PVP) y Costo de Adquisición para cálculo de margen bruto.
- **Control de Existencias:** Cantidad en stock con alerta visual de stock crítico/agotado.
- **Remoción de Fondo con IA:** Herramienta integrada para subir fotos de productos tomadas con el celular y eliminar el fondo automáticamente en el servidor, generando imágenes transparentes profesionales.
- **Comisión por Venta de Producto:** Cada venta de producto realizada por un colaborador se computa en su liquidación de comisiones.

### 4.7 Directorio de Clientes & CRM Individual (`/dashboard/clientes`)
- **Ficha Integral del Cliente:**
  - Nombre, teléfono, correo electrónico y notas confidenciales del negocio.
  - Historial cronológico de todos los turnos realizados, cancelados e inasistencias.
  - Métrica de Valor de Vida del Cliente (*LTV*): Total gastado en Guaraníes desde su primer visita.
  - Saldo acumulado en el programa de fidelización (sellos o puntos).
- **Acciones Directas:**
  - Botón para chatear por WhatsApp con el cliente.
  - Botón para crear una cita inmediata asignada al cliente.
  - Edición y actualización de notas de preferencias (ej: "Prefiere café", "Alergia a tintes").

### 4.8 Control de Caja Chica & Arqueo Diario (`/dashboard/caja`)
- **Apertura de Caja:** Registro de monto inicial base al comenzar el turno de trabajo.
- **Registro de Movimientos:** Entradas (cobros de servicios y productos) y Salidas (gastos de insumos, adelantos a colaboradores, pagos varios).
- **Desglose Multimétodo:** Separación exacta de ingresos por:
  - Efectivo.
  - Tarjeta de Débito / Crédito (POS).
  - Transferencia Bancaria.
  - Billeteras Electrónicas / Códigos QR.
- **Cierre y Arqueo de Caja:** Comparación del dinero real contado en caja contra el monto calculado por el sistema, registrando sobrantes o faltantes.
- **Exportación:** Generación de balances del día listos para auditoría contable.

### 4.9 Liquidación de Comisiones & Recibos Oficiales (`/dashboard/comisiones`)
- **Cálculo Automatizado:**
  - Porcentaje de comisión por servicios realizados (ej: 50% para el estilista, 50% para el negocio).
  - Porcentaje de comisión por productos vendidos (ej: 10% por venta de cosméticos).
- **Gráfico Comparativo:** Visualización de la fuente de ingresos del profesional (% Servicios vs % Productos).
- **Gestión de Deducciones:** Descuento automático de vales, adelantos de sueldo o compras internas tomadas por el colaborador.
- **Liquidación Oficial:** Botón para pagar la comisión con fecha de corte y generación de **Recibo Oficial Imprimible** con número de folio, desglose de citas liquidadas y firma de conformidad, compartible por WhatsApp.

### 4.10 Validación de Comprobantes de Transferencia (`/dashboard/transferencias`)
- **Bandeja de Pagos Electrónicos:** Lista de turnos donde el cliente adjuntó comprobante de transferencia bancaria al agendar.
- **Visor de Comprobante:** Previsualización del archivo (imagen o PDF) con datos de banco emisor, fecha, importe y número de referencia.
- **Aprobación en 1 Clic:**
  - *Aprobar:* Pasa el turno a estado `CONFIRMADO` y notifica al cliente.
  - *Rechazar:* Notifica al cliente para regularizar su pago o transferir nuevamente.

### 4.11 Club VIP & Programa de Lealtad (`/dashboard/fidelizacion`)
- **Mecánica Configurable:**
  - *Opción A (Tarjeta de Sellos):* 1 sello automático por cada turno asistido.
  - *Opción B (Tarjeta de Puntos):* Puntos proporcionales al monto abonado en Guaraníes.
- **Catálogo de Premios:** Configuración de beneficios (ej: "50% OFF en tu 5ta visita", "Tratamiento capilar gratis").
- **Canje Automatizado:** El personal valida el premio en caja al cobrar el turno del cliente.
- **Distribución:** Código QR en mostrador y enlace directo para que los clientes consulten su tarjeta digital desde el celular.

### 4.12 CRM Omnicanal & Bandeja de Conversaciones (`/dashboard/crm`)
- Bandeja unificada de conversaciones de WhatsApp conectada a la línea oficial del comercio.
- **Filtros de Conversación:** Abiertas, pendientes, transferidas a asesor y resueltas.
- **Perfil Lateral del Cliente:** Muestra las últimas citas del contacto, servicios frecuentes y total gastado mientras se chatea con él.
- **Respuestas Rápidas:** Plantillas de texto predefinidas para responder preguntas frecuentes con 1 clic.

### 4.13 Bot de WhatsApp Oficial & Canva de Flujo Visual (`/dashboard/whatsapp`)
- **Conexión Multi-Dispositivo por QR:** Vinculación directa con WhatsApp (normal o Business) que corre en la nube 24/7 sin depender de la batería o Wi-Fi del celular.
- **Canva de Flujo Visual:**
  - Lienzo interactivo arrastrable con zoom, pan y conexiones curvas Bezier.
  - Nodos de acción independientes:
    - *Link de Reservas:* Envía el enlace directo al portal de reservas.
    - *Servicios & Precios:* Lista los servicios y tarifas en Guaraníes adaptados al local.
    - *Datos de Transferencia:* Envía cuenta bancaria, RUC y alias para pagos.
    - *Ubicación & Horarios:* Envía dirección y horarios de apertura.
    - *Asesor Humano:* Pausa el bot y deriva el chat al equipo comercial en el CRM.
  - Prevención de duplicados: Valida que cada opción tenga un número único (1 al 8).
  - Soporte de Formato WhatsApp: Reconocimiento de negritas (`*texto*`), cursivas (`_texto_`), tachado (`~texto~`) y código (` ```texto``` `).
- **SIMULADOR en iPhone 16 Pro:**
  - Mockup fotorrealista con inicio de chat en blanco.
  - Motor de reconocimiento de números de opción, saludos, preguntas cotidianas y palabras clave.
  - Tarjetas de previsualización de confirmación de turno.
- **Plantillas & Recordatorios Automáticos:**
  - Confirmación inmediata tras agendar en la web.
  - Recordatorio 24 horas antes con link de autogestión.
  - Recordatorio 2 horas antes de la cita.
  - Sincronización bidireccional en tiempo real con los nodos del Canva.
- **Centro de Contacto Directo:** Acceso a soporte técnico oficial vía WhatsApp (+595 981 700 800) y llamada telefónica.

### 4.14 Personalización Visual & Apariencia de Marca (`/dashboard/apariencia`)
- **20 Estilos Profesionales:** Temas prediseñados (Minimalista, Dark Luxe, Vibrant, Neo-Brutalism, Barber Clean, etc.).
- **Paleta de Colores Corporativa:** Ajuste fino de color primario, secundario, fondos, bordes y superficies en modo claro y oscuro.
- **Tipografía Google Fonts:** Selección de fuentes modernas (Inter, Outfit, Syne, Montserrat, Roboto, etc.).
- **Multimedia del Negocio:**
  - Subida de portada principal y foto de perfil / logo.
  - Galería de fotos reales de trabajos realizados y del establecimiento.
- **Textos y Redes:** Configuración del eslogan de bienvenida y enlaces a Instagram, TikTok, Facebook y Google Maps.
- **Previsualizador en Vivo:** Teléfono interactivo a la derecha que refleja cada cambio en tiempo real antes de guardar.

### 4.15 Gestión de Equipo, Horarios & Permisos (`/dashboard/equipo`)
- **Registro de Colaboradores:** Nombre, teléfono, foto, rol y porcentaje de comisión asignado.
- **Configuración de Horarios Laborales:**
  - Días de trabajo por semana (Lunes a Domingo).
  - Horario de entrada y salida con cortes de almuerzo o descanso.
- **Especialidades:** Selección de qué servicios puede prestar cada miembro del equipo.
- **Control de Accesos:** Creación de usuarios con roles de Dueño (`OWNER`) o Empleado (`STAFF`).

### 4.16 Reportes Financieros & Estadísticas (`/dashboard/estadisticas`)
- **Métricas Consolidadas:**
  - Facturación mensual, trimestral y anual en Guaraníes.
  - Ticket promedio por cliente y por visita.
  - Ranking de servicios más rentables y solicitados.
  - Ranking de colaboradores por volumen de recaudación.
  - Tasa de retención de clientes nuevos vs recurrentes.
  - Porcentaje de ausentismo (*no-show*) histórico.

### 4.17 Ajustes del Negocio & Datos de Transferencia (`/dashboard/configuracion`)
- **Datos Bancarios Oficiales para Transferencias:**
  - Entidad Bancaria (ej: Itaú, Continental, Ueno, Familiar, etc.).
  - Nombre del Titular de la Cuenta.
  - RUC o Cédula de Identidad del Titular.
  - Tipo y Número de Cuenta.
  - Alias Bancario para transferencias rápidas.
- **Políticas de Turnos:**
  - Intervalo de la agenda (15, 30, 45 o 60 minutos).
  - Tiempo mínimo de anticipación para agendar.
  - Tiempo límite para cancelar o reprogramar.

### 4.18 Planes & Suscripción SaaS (`/dashboard/suscripcion`)
- **Modelo Freemium:** Plan inicial gratuito de hasta 20 turnos mensuales para nuevos comercios.
- **Planes Superiores:** Planes Profesional e Ilimitado con turnos sin límite, CRM avanzado y soporte prioritario.
- **Gestión de Facturación:** Activación mediante pasarela de pago o transferencias bancarias locales.

---

## 5. Sistema de Visita Guiada Interactiva (Guided Tour)

El sistema integra un motor de tutoriales paso a paso disponible en todas las 18 pantallas del software:
- **Spotlight con Recorte SVG Dinámico:** Oscurece la pantalla iluminando exclusivamente el componente a explicar con un anillo brillante.
- **Posicionamiento Inteligente:** La tarjeta explicativa detecta colisiones de pantalla y se posiciona automáticamente arriba, abajo o a los lados para nunca tapar el elemento.
- **Navegación Fluida:**
  - Atajos de teclado: Flechas Derecha/Izquierda o Enter para avanzar y Escape para salir.
  - Auto-conmutación de pestañas: Si el paso pertenece a otra pestaña (ej. Canva vs Simulador vs Plantillas), la guía cambia la pestaña automáticamente.
- **Selector de Secciones:** Menú desplegable con buscador para aprender a usar cualquier módulo del sistema en cualquier momento.

---

## 6. Módulo de Super Administración SaaS (`/admin`)

Panel exclusivo para los fundadores y administradores globales de la plataforma:
- **Métricas de Adopción Global:** Cantidad total de negocios registrados, turnos procesados globalmente y facturación consolidada en Guaraníes.
- **Gestión de Tenants:** Directorio de todos los negocios con estado (`ACTIVO`, `PAUSADO`), plan contratado y métricas de uso.
- **Mapa Geográfico:** Distribución de negocios en el territorio paraguayo (Asunción, Gran Asunción, Ciudad del Este, Encarnación, etc.).
- **Auditoría del Sistema:** Registro de eventos críticos, creación de cuentas y errores técnicos.
- **Monitor de Salud & Webhooks:** Estado de conexión de servidores, bases de datos y pasarelas de WhatsApp.

---

## 7. Landing Page de Alta Conversión (`/`)

Página de inicio comercial orientada a la adquisición de nuevos negocios:
- **Hero Interactivo con Selector de Nichos:** Adaptación visual dinámica para Barberías, Salones de Belleza, Spas, Estética, Clínicas y Pádel.
- **Comparador Antes vs Con AgendatePY:** Tabla interactiva de impacto visual que compara la gestión manual por WhatsApp vs la automatización SaaS.
- **Bento Grid de 4 Módulos:**
  1. *Agenda Inteligente:* Prevención de solapamientos y portal 24/7.
  2. *WhatsApp Oficial:* Automatización de respuestas y recordatorios.
  3. *Control de Caja & Comisiones:* Arqueo diario y cálculo de ganancias.
  4. *Fidelización Digital:* Tarjetas de sellos y puntos desde el navegador del cliente.
- **Simulador Interactivo:** Demostración en vivo del portal de reservas dentro de un iPhone 16 Pro.
- **Tabla de Precios:** Selector mensual/anual con panel móvil flotante y pestañas táctiles.
- **Preguntas Frecuentes (FAQ):** Respuestas a dudas operativas, legales y técnicas.

---

## 8. Matriz de Endpoints de la API REST

| Endpoint | Métodos | Descripción Funcional |
| :--- | :--- | :--- |
| `/api/auth/[...nextauth]` | `GET`, `POST` | Autenticación OAuth Google y sesiones NextAuth. |
| `/api/auth/google` | `GET` | Endpoint de inicio de sesión con Google. |
| `/api/auth/me` | `GET` | Datos del usuario y tenant autenticado. |
| `/api/appointments` | `GET`, `POST` | Listar y crear citas del tenant. |
| `/api/appointments/[id]` | `GET`, `PUT`, `DELETE` | Consultar, actualizar estado o cancelar una cita. |
| `/api/clients` | `GET`, `POST` | Directorio de clientes del negocio. |
| `/api/clients/[id]` | `GET`, `PUT`, `DELETE` | Ficha, notas e historial del cliente. |
| `/api/services` | `GET`, `POST` | Catálogo de servicios y tarifas. |
| `/api/services/[id]` | `PUT`, `DELETE` | Modificar o eliminar un servicio. |
| `/api/services/categories` | `GET`, `POST` | Categorías de servicios. |
| `/api/staff` | `GET`, `POST` | Registro de profesionales y comisiones. |
| `/api/staff/[id]` | `PUT`, `DELETE` | Modificar datos y horarios del profesional. |
| `/api/schedule-blocks` | `GET`, `POST` | Bloqueos de horarios y feriados. |
| `/api/schedule-blocks/[id]` | `DELETE` | Eliminar bloqueo de horario. |
| `/api/cash` | `GET`, `POST` | Movimientos de caja (ingresos/egresos). |
| `/api/cash/close` | `POST` | Realizar arqueo y cierre de caja. |
| `/api/commissions` | `GET` | Reporte de comisiones acumuladas. |
| `/api/commission-payouts` | `GET`, `POST` | Liquidaciones de pago a colaboradores. |
| `/api/reports/cash` | `GET` | Reporte consolidado de flujo de caja. |
| `/api/reports/commissions` | `GET` | Reporte de comisiones por período. |
| `/api/tenant/settings` | `GET`, `PUT` | Ajustes generales y datos bancarios de transferencia. |
| `/api/tenant/theme` | `GET`, `PUT` | Configuración estética, colores y estilos. |
| `/api/upload` | `POST` | Carga de archivos multimedia (WebP, PNG, JPG). |
| `/api/upload/remove-bg` | `POST` | Recorte inteligente de fondo con IA. |
| `/api/webhooks/whatsapp` | `POST` | Webhook de mensajería entrante de WhatsApp. |
| `/api/analytics/collect` | `POST` | Registro de telemetría y conversión. |
| `/api/analytics/heatmap` | `GET` | Mapa de calor de horarios más demandados. |
| `/api/admin/*` | `GET`, `POST` | Endpoints de gobernanza de la plataforma SaaS. |

---

## 9. Seguridad, Datos & Cumplimiento Normativo

- **Aislamiento Multi-Tenant:** Todas las consultas SQL generadas por Prisma ORM están filtradas estrictamente por el `tenantId` de la sesión activa, impidiendo cualquier fuga de información entre comercios.
- **Protección de Datos Personales:** Almacenamiento seguro de números de teléfono y datos de clientes; los comprobantes de transferencia se guardan con identificadores criptográficos aleatorios.
- **Infraestructura Inmune a Caídas:** Redundancia de servidores mediante contenedores Docker con reinicio automático (`restart: unless-stopped`) y proxies Nginx configurados para caché y alta concurrencia.
