# Agendatepy — Catálogo Maestro de Elementos, Componentes y Sistema de Diseño (Design System)

> **Documento de Especificación Visual, Tokens y Elementos de UI para Generación de Diseños con IA**  
> *Plataforma SaaS Multi-Tenant para Barberías, Salones de Belleza, Spas, Clínicas de Estética y Bienestar con Automatización de WhatsApp IA.*

---

## 1. Visión General del Producto y Lenguaje de Diseño

### 1.1 Identidad y Estética
* **Estilo Visual:** **Glassmorphism 2.0 (Dual-Mode: Dark Obsidian Glass & Light Frosty Glass)**.
* **Inspiración y Referencias:** *Linear*, *Apple VisionOS / iOS 18*, *Stripe Corporate*, *interfas glassy*.
* **Características Clave:**
  * Superficies translúcidas con desenfoque de fondo profundo (`backdrop-filter: blur(28px)`).
  * Bordes sutiles con reflexión especular (`1px solid rgba(255, 255, 255, 0.12)` con sombra interior `inset 1px 1px 1px rgba(255, 255, 255, 0.16)`).
  * Fondo atmosférico animado en código con gradientes radiales continuos y orbes flotantes (cero fotos estáticas).
  * Menú lateral flotante estático con expansión fluida en hover (de `66px` cápsula de iconos a `242px` con etiquetas) respetando estrictamente su altura cerrada.
  * Micro-interacciones hápticas, tarjetas con perspectiva 3D Tilt y orbes morphing giratorios de IA.

---

## 2. Tokens de Diseño y Variables CSS

### 2.1 Paleta de Color y Tokens Semánticos
| Token | Variable CSS | Modo Oscuro (Dark Obsidian) | Modo Claro (Frosty White) | Propósito / Uso |
| :--- | :--- | :--- | :--- | :--- |
| **Primary** | `var(--primary)` | `#FF4F2B` (Naranja Neón) | `#FF4F2B` | Botones principales, acentos activos, focos |
| **Primary RGB**| `var(--primary-rgb)`| `255, 79, 43` | `255, 79, 43` | Resplandores y glows con canal alfa |
| **Background** | `var(--background)` | `#131114` a `#0d0c0f` | `#f8fafc` a `#edf2f7` | Lienzo base del viewport |
| **Glass Surface**| `.glass-panel` | `linear-gradient(135deg, rgba(28,27,31,0.68), rgba(14,13,17,0.72))` | `linear-gradient(135deg, rgba(255,255,255,0.85), rgba(255,255,255,0.62))` | Tarjetas, paneles de métricas, modales |
| **Glass Rail** | `.glass-rail-fixed` | `rgba(27, 26, 24, 0.65)` | `rgba(255, 255, 255, 0.84)` | Menú lateral flotante |
| **Border Line**| `var(--line)` | `rgba(255, 255, 255, 0.11)` | `rgba(0, 0, 0, 0.08)` | Bordes de paneles, divisores, inputs |
| **Text Primary**| `var(--text)` | `#f6f3ef` / `#ffffff` | `#0f172a` | Títulos, valores clave, textos principales |
| **Text Muted** | `var(--muted)` | `#aaa39e` / `#a1a1aa` | `#64748b` | Subtítulos, timestamps, leyendas secundarias |
| **Emerald** | `var(--green)` | `#10b981` (`rgba(16, 185, 129, 0.18)`) | `#059669` | Estado Confirmado, ingresos, caja abierta |
| **Purple** | `var(--purple)` | `#a855f7` (`rgba(168, 85, 247, 0.18)`) | `#7c3aed` | Asistente de IA WhatsApp, fidelización, VIP |
| **Amber** | `var(--amber)` | `#f59e0b` (`rgba(245, 158, 11, 0.18)`) | `#d97706` | Pendiente de pago, citas por confirmar |
| **Red** | `var(--red)` | `#ef4444` (`rgba(239, 68, 68, 0.18)`) | `#dc2626` | Cita cancelada, egresos de caja, no-show |

### 2.2 Tipografía y Jerarquía Visual
* **Headings (Títulos H1 - H3):** `Manrope`, `Plus Jakarta Sans` o `Coolvetica` (700-800 weight, `letter-spacing: -0.03em`).
* **Cuerpo & Párrafos:** `DM Sans` / `Plus Jakarta Sans` (400-500 weight, 12px a 14px).
* **Eyebrows & Micro-etiquetas:** `font-mono` uppercase (8px a 9px, `letter-spacing: 0.22em`, color `#c0b4a8` o `#94a3b8`).
* **Valores Financieros / Guaraníes (PYG):** `font-semibold` o `font-medium` (ej: `Gs. 120.000` con `letter-spacing: -0.02em`).

### 2.3 Radios de Borde (Border Radius Scale)
* **App Shell & Menú Rail:** `30px` (cápsula redondeada extrema).
* **Paneles & Tarjetas Métricas:** `20px` a `22px`.
* **Botones & Pastillas de Navegación:** `14px` a `15px`.
* **Badges & Pastillas de Estado:** `20px` (pill completo).
* **Inputs & Selects:** `12px`.
* **Insignia / Brand Mark de Logo:** `12px` (cuadrado redondeado).

---

## 3. Catálogo de Componentes Atómicos y Moleculares

### 3.1 Navegación y Estructura Base
1. **Glass Rail Fijo (`.glass-rail-fixed`):**
   * *Estado Cerrado:* `width: 66px`, `height: calc(100vh - 36px)`, centrado de iconos de 42x42px, tooltips flotantes `[data-label]` en hover.
   * *Estado Abierto (Hover):* `width: 242px`, expansión horizontal instantánea manteniendo **exactamente** `height: calc(100vh - 36px)` sin salto vertical.
   * *Insignia Superior:* Caja de 38x38px con borde reflectante y resplandor del color primario, acompañada del texto del comercio y la etiqueta `PERSONAL SPACE`.
   * *Enlaces Principales:* 14 accesos directos con icono Lucide y etiqueta tipográfica.
   * *Botón Activo (`.glass-nav-active`):* Fondo primario con resplandor neón `box-shadow: 0 4px 20px rgba(var(--primary-rgb), 0.38)` y micro-punto indicador blanco en el extremo derecho.
   * *Pie de Rail:* Enlace al Portal Público de Reservas (verde esmeralda con pulso), Ajustes de Negocio y Notificaciones.
2. **App Shell Envolvente (`.glass-app-shell`):**
   * Contenedor de vidrio ahumado con `border-radius: 30px`, resplandor elíptico de fondo y scroll interno independiente.
3. **Encabezado Ejecutivo (`Header`):**
   * Título de página con icono indicador `▰`.
   * Selector segmentado de espacios (Finanzas, Turnos, IA, Equipo).
   * Barra de búsqueda rápida `⌘ + K`.
   * Switch de Modo Claro / Modo Oscuro.
   * Perfil del usuario con avatar y rol (Admin, Cajero, Barbero/Estilista).
4. **Mobile Tab Bar & Drawer:**
   * Barra inferior con pastillas táctiles e indicador flotante para pantallas móviles (`< 1024px`).
   * Drawer lateral deslizable con overlay oscurecido.

### 3.2 Botones y Controles de Acción
* **Primary Button:** Fondo `var(--primary)`, texto blanco, sombra neón `0 4px 22px rgba(var(--primary-rgb), 0.28)`.
* **Secondary Glass Button:** Fondo `rgba(255, 255, 255, 0.05)`, borde `1px solid var(--line)`, hover `rgba(255, 255, 255, 0.12)`.
* **White Accent Button:** Fondo `#f6f3ef`, texto oscuro `#151217`, ideal para CTAs de alto contraste dentro de tarjetas oscuras.
* **Icon-Only Button:** Botón circular o cápsula de 36x36px o 42x42px con icono centrado.
* **Text Button:** Enlace sin borde con hover reactivo y micro-flecha animada (`Ver todos →`).
* **Segmented Control (iOS Glass):** Fondo cápsula oscuro con pill activo flotante que desliza suavemente entre opciones.
* **Toggle Switch:** Interruptor deslizante con estado inactivo translúcido y activo en verde esmeralda.

### 3.3 Pastillas y Badges de Estado
* **Badge Éxito / Confirmado:** Verde esmeralda con fondo `rgba(16, 185, 129, 0.15)` y borde `1px solid rgba(16, 185, 129, 0.25)`.
* **Badge Alerta / Pendiente:** Ámbar cálido con fondo `rgba(245, 158, 11, 0.15)` y borde `1px solid rgba(245, 158, 11, 0.25)`.
* **Badge Especial / WhatsApp IA:** Violeta eléctrico con fondo `rgba(168, 85, 247, 0.15)` y borde `1px solid rgba(168, 85, 247, 0.25)`.
* **Badge Cancelado / No-Show:** Rojo coral con fondo `rgba(239, 68, 68, 0.15)` y borde `1px solid rgba(239, 68, 68, 0.25)`.
* **Badge VIP / Gold:** Fondo dorado translúcido con icono de corona `Crown` para clientes frecuentes.
* **Micro-Dot Live Indicator:** Punto de 5px con pulso animado para estados en vivo (Turno en atención, WhatsApp conectado).

### 3.4 Tarjetas y Contenedores de Información
* **Glass Tilt Card 3D (`.glass-tilt-card`):** Tarjeta con perspectiva 3D interactiva que reacciona a la posición del cursor con brillo especular.
* **Summary Strip:** Banda horizontal dividida en celdas para resúmenes rápidos (Ingresos del Día, Ocupación, Citas Restantes, Ticket Promedio).
* **Metric Card:** Tarjeta con icono distintivo, etiqueta pequeña, cifra prominente (`$` o `Gs.`) y comparativa porcentual (+14.8%).
* **Appointment Timeline Card:** Tarjeta de turno con hora de inicio/fin, avatar del cliente, profesional asignado, badges de servicio y botón de acción rápida (Cobrar / Reprogramar / WhatsApp).
* **WhatsApp Chat Bubble:** Tarjeta de simulación de conversación con mensaje del cliente, respuesta automática del bot de IA con opciones interactivas y timestamp.

### 3.5 Controles de Formulario e Inputs
* **Translucent Field (`.field`):** Etiqueta superior en texto muteado de 9px e input sin borde inferior que se integra en el vidrio con focus ring de color primario.
* **Phone Input (+595):** Input especializado con bandera paraguaya, prefijo internacional y formateo dinámico de número para WhatsApp.
* **Custom Glass Select:** Menú desplegable con opciones estilizadas y flecha minimalista.
* **Range Slider Glass:** Deslizador de rango con pista translúcida y manija del color de la marca con valor numérico en tiempo real.
* **Date & Slot Picker:** Grilla interactiva de días y slots horarios disponibles que deshabilita automáticamente colisiones.

### 3.6 Widgets Especiales
* **Orbe Morphing Conic 3D (`.glass-morph-orb`):** Orbe con doble anillo de gradiente cónico giratorio (`conic-gradient`), animación de morphing orgánico y núcleo central con indicador de tasa de ocupación o actividad de IA.
* **Checklist de Activación Interactivo:** Barra de progreso circular con 5 pasos completables (WhatsApp conectado, Servicios creados, Equipo invitado, etc.).
* **Buscador Universal `⌘K`:** Modal de búsqueda rápida en tiempo real para clientes, citas y configuraciones.

---

## 4. Inventario de Pantallas y Módulos del Sistema

| Módulo / Pantalla | Ruta | Elementos Principales de UI | Acciones del Usuario |
| :--- | :--- | :--- | :--- |
| **Dashboard Principal** | `/dashboard` | Barra de KPIs (Ingresos, Turnos, Nuevos Clientes, Ocupación), Orbe de Ocupación, Widget de WhatsApp IA en Vivo, Gráfico de Tendencia Semanal, Lista de Citas de Hoy. | Cobro rápido de cita, contactar por WhatsApp, crear reserva inmediata, ver detalles de ingresos. |
| **Agenda & Calendario** | `/dashboard/calendario` | Timeline interactivo por columnas (Profesionales vs Horas), Selector de vista (Día, Semana, Lista), Filtro de colaboradores, Tarjetas de turnos por color de estado. | Arrastrar y soltar citas, hacer clic en slot vacío para agendar, bloquear horas de almuerzo/descanso. |
| **Nueva Cita Mostrador** | `/dashboard/nueva-reserva` | Selector de cliente con autocompletado, selector visual de servicios con duración y precio, selección de barbero/estilista, selector de horario libre. | Confirmar cita en el mostrador, enviar confirmación instantánea por WhatsApp, agendar cobro por adelantado. |
| **Caja & Cobros** | `/dashboard/caja` | Estado de Caja Chica (Abierta/Cerrada), Monto inicial, Entradas por efectivo vs POS vs Transferencia, Registro de egresos rápidos, Tabla de movimientos con comprobantes. | Abrir caja, cerrar caja con arqueo ciego, registrar retiro de dinero, ver detalle de tickets. |
| **Directorio Clientes & CRM**| `/dashboard/clientes` | Buscador predictivo, Filtro por etiquetas (VIP, Frecuente, En Riesgo), Ficha de Cliente modal con notas, fórmulas químicas o historial de cortes, botón de WhatsApp directo. | Crear cliente, ver historial de asistencia, añadir notas privadas, enviar mensaje de reactivación. |
| **Catálogo de Servicios**| `/dashboard/servicios` | Tarjetas de servicios agrupadas por categoría (Corte, Barba, Colorimetría, Spa), Duración en minutos, Precio en Gs., Colaboradores que realizan el servicio. | Crear servicio, cambiar orden visual, modificar precios, activar/desactivar visibilidad en la web. |
| **Control de Productos** | `/dashboard/productos` | Grid de productos con imagen recortada por IA, Control de stock disponible vs mínimo, Precio de costo y venta, Porcentaje de comisión para el equipo. | Cargar producto, recortar fondo con IA en 1 clic, ajustar inventario, registrar venta por mostrador. |
| **WhatsApp IA & Bot** | `/dashboard/whatsapp` | Código QR para conexión Evolution API, Estado de sesión en vivo, Simulador de chat interactivo, Interruptor de auto-respuesta, Plantillas de recordatorio (24h y 2h). | Escanear QR, probar respuestas del bot en vivo, configurar tono de voz (formal/coloquial), editar mensajes. |
| **Comisiones & Equipo** | `/dashboard/comisiones` | Tarjeta por colaborador con porcentaje de comisión por servicio y producto, Total a pagar en el periodo, Desglose de citas atendidas, Botón de liquidación. | Generar recibo de liquidación en PDF, ajustar comisiones individuales, marcar como pagado. |
| **Métricas & Finanzas** | `/dashboard/estadisticas` | Gráficos de ingresos mensuales, Servicios más rentables, Tasa de ausentismo (*no-show*), Ticket promedio, Horarios con mayor demanda (*Heatmap*). | Filtrar por rango de fechas (7D, 30D, Año), exportar reporte a Excel/CSV. |
| **Fidelización & Puntos** | `/dashboard/fidelizacion` | Tarjeta de sellos interactiva (ej: 8 sellos = 1 corte gratis), Catálogo de recompensas canjeables, Saldo de puntos por cliente. | Asignar puntos automáticos por compra, canjear premios, generar enlace para agregar a Apple Wallet / Android. |
| **Apariencia & Diseño Web**| `/dashboard/apariencia` | Selector de paleta de colores de marca, tipografías de Google Fonts, subida de banner y logo, vista previa en vivo en móvil y desktop. | Cambiar tema del portal público, personalizar colores corporativos, previsualizar en tiempo real. |
| **Portal Público Reservas**| `/[tenant]/reservar` | Selector de categoría, tarjetas de servicios con fotos, selección de profesional o *"Cualquiera disponible"*, grilla de fechas y horarios, checkout con WhatsApp. | El cliente selecciona fecha/hora, introduce su nombre y WhatsApp, adjunta comprobante de transferencia o elige pago local. |

---

## 5. Master Prompts para Generar Nuevos Diseños con IA

### Prompt Base para Diseñar una Pantalla del Sistema:
```text
Act as a Principal Product Designer specializing in ultra-premium Glassmorphic web apps (VisionOS / Linear / Apple Design Award aesthetics).
Design a high-fidelity desktop and mobile UI screen for "Agendatepy", a modern multi-tenant SaaS for beauty salons, barbershops, and spas.

Visual Identity Guidelines:
- Aesthetic: Dual-Mode Glassmorphism 2.0 (Obsidian Dark Glass background #131114 with vibrant orange neon accent #FF4F2B and soft purple/emerald micro-accents).
- Glass Panels: Translucent panels with background blur 28px, subtle 1px border with specular top glare (inset white highlight), soft shadows (0 20px 50px rgba(0,0,0,0.5)).
- Atmospheric Background: Flowing organic code-driven color mesh with drifting ambient orbs (no stock photos).
- Sidebar: Fixed floating capsule rail (66px collapsed with 42px icon buttons, expands to 242px on hover while preserving exact closed height).
- Typography: Manrope / Plus Jakarta Sans for headings, DM Sans for body, monospace micro-labels with uppercase letter-spacing 0.22em.
- Currency: Formatted in Paraguayan Guaraníes (e.g. Gs. 120.000).

Screen to design: [INSERTAR PANTALLA AQUÍ, EJ: "Dashboard Principal con KPIs, Timeline de Citas y Widget de WhatsApp IA"].
Include every interactive state, button variant, badge pill, and data visualization following this specification.
```

---

*Documento generado para Agendatepy. Todos los derechos reservados.*
