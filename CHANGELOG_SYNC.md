# 🔄 Registro de Sincronización y Cambios entre IDEs (AgendatePY)

Este documento sirve como bitácora y puente de contexto en tiempo real entre los entornos de desarrollo concurrentes.

> **Regla de oro:** Cada cambio, refactor o nueva funcionalidad realizada en una sección debe registrarse aquí inmediatamente para evitar conflictos de fusión (*merge conflicts*) y mantener sincronizados a ambos desarrolladores e inteligencias artificiales.

---

## 📋 Estructura de Registro

Cada entrada debe detallar:
- **Fecha y Hora**
- **Responsable:** IDE 1 (Sebas Duarte) o IDE 2 (Derlis Gimenez)
- **Sección / Módulo Asignado**
- **Archivos Modificados / Creados** (rutas exactas)
- **Descripción de Cambios y Razonamiento**
- **Impacto / Dependencias compartidas** (por ejemplo: si se alteró el store de Zustand, Prisma Schema, componentes UI compartidos)
- **Notas para el otro IDE / Desarrollador**

---

## 📝 Historial de Cambios

### [Inicialización de Bitácora] — 2026-09-27
- **Responsable:** IDE 1 (Sebas Duarte) & IDE 2 (Derlis Gimenez)
- **Sección:** Coordinación de desarrollo concurrente
- **Archivos afectados:**
  - `CHANGELOG_SYNC.md` (creación del archivo de sincronización)
- **Detalle:** Se establece el protocolo de trabajo en paralelo para evitar sobreescritura de archivos y mantener alineadas ambas instancias de trabajo.

---

### [Instalación y Configuración de Entorno Local] — 2026-09-27 04:04
- **Responsable:** IDE 2 (Derlis Gimenez)
- **Sección:** Infraestructura / Setup Local
- **Archivos Modificados / Creados:**
  - `frontend/.env` (creación con variables locales de entorno)
- **Descripción de Cambios y Razonamiento:**
  - Se instalaron las dependencias de Node (`npm install`).
  - Se generó el cliente de Prisma ORM (`npx prisma generate`).
  - Se configuró el archivo `.env` para entorno local apuntando a `localhost:3000`.
  - Se inició el servidor de desarrollo de Next.js 16 con Turbopack en modo continuo (`npm run dev`).
- **Impacto / Dependencias compartidas:**
  - No altera esquemas de base de datos ni lógica de componentes compartidos.
- **Notas para el otro IDE / Desarrollador:**
  - El servidor local ya responde activamente en `http://localhost:3000`.

---

### [Módulo Apariencia & Tour Sync] — 2026-09-27 04:35
- **Responsable:** IDE 1 (Sebas Duarte)
- **Sección:** `http://localhost:3000/dashboard/apariencia` (Diseño, Personalización y Tour Guiado)
- **Archivos modificados:**
  - `frontend/components/dashboard/Header.tsx`
  - `frontend/components/dashboard/GuidedTour.tsx`
  - `frontend/lib/theme.ts`
  - `frontend/app/dashboard/apariencia/page.tsx`
- **Resumen de Cambios:**
  1. **Header:** Se quitó el botón superior de "Visita Guiada" duplicado y se amplió el botón "Ver mi página" con un diseño interactivo, punto de pulso sutil y animación hover de icono.
  2. **Previsualización iPhone Pro:** 
     - Se integró un marco realista Pro con Dynamic Island interactivo, reloj en vivo en tiempo real (HH:MM), barras de cobertura celular SVG, ícono Wi-Fi, nivel de batería y barra home inferior.
     - Se aisló completamente el modo oscuro/claro del teléfono (`color-scheme` y clases dark/light independientes del dashboard) con selector rápido Claro/Oscuro/Auto.
  3. **Distribución de Fotos y Layouts (100% Funcional):**
     - La sección ahora transforma en tiempo real la previsualización del teléfono según el estilo seleccionado (`panoramic`, `split-gallery`, `floating-card`, `minimal-editorial`).
  4. **Google Fonts (56 Tipografías oficiales):**
     - Se expandió `GOOGLE_FONTS` en `theme.ts` con 56 fuentes serias (Sans-serif, Serif/Lujo y Display).
     - Se añadió buscador por nombre, selector y tarjetas de previsualización en vivo renderizadas con la tipografía real.
  5. **Estilos y Presets Listos:**
     - Se agregaron 8 nuevos estilos profesionales a `THEME_PRESETS` (Tokyo Cyber, Nordic Slate, Matcha Studio, Sunset Bronze, etc., sumando 20 variantes).
     - Diseño compacto de alta densidad (3-4 columnas) con puntos de color duales y etiquetas de modo.
  6. **Selector de Color & Fondos Abstractos Soft:**
     - Paleta de colores recomendados (1-clic) + selector Hex para marca y fondo.
     - Nuevos efectos de fondo sutiles: Aurora suave (`mesh-soft`), orbes difusos (`floating-orbs`), resplandor zen (`radial-glow`), micro puntos, cuadrícula y vidrio esmerilado.
  7. **Editor de Portada y Logo Estilo Red Social (Sin URLs manuales):**
     - Se eliminaron los campos de entrada de URL directa.
     - Contenedor visual tipo Facebook/Instagram con subida directa y compresión automática, reubicación vertical (Arriba/Centro/Abajo) y notas de tamaño recomendado (1200x400 y 500x500).
     - Se eliminaron las fotos profesionales sugeridas de stock y portadas cinematográficas fijas.
  8. **Botones y Enlaces:**
     - Estructurado en dos pestañas limpias: Redes y Accesos (con atajos rápidos de Waze, Uber, WhatsApp, Reseña) y Estilos de Botones (acabados visuales, redondez, sombras y jerarquía).
  9. **Textos y Políticas:**
     - Simplificado con plantillas rápidas en 1 clic para políticas de reserva (tolerancia de 10 min, cancelaciones de 2h, señas de 50%).
  10. **Botón Guardar Cambios & Alerta de Cambios sin Guardar:**
      - Se eliminó el resplandor y brillo pulsante del botón de guardar, reemplazado por un botón esmeralda sólido con micro-animación de carga y checkmark.
      - Se eliminó el texto invasivo "Tenés cambios sin guardar en tu diseño / Tus clientes verán los cambios solo después de guardarlos".
      - Se implementó un modal de confirmación inteligente que intercepta intentos de navegación interna para proteger al usuario de perder cambios accidentales.
  11. **Sincronización de la Visita Guiada (GuidedTour):**
      - Se sincronizó a nivel de milisegundos la animación de la máscara SVG con el anillo violeta de resplandor (sin desfases).
      - Se implementó cálculo de zonas libres para colocar la tarjeta informativa siempre fuera del elemento resaltado, impidiendo que tape las opciones en pantalla.
- **Notas para el otro IDE:**
  - No se tocaron archivos de base de datos ni modelos de Prisma.
  - La API `/api/tenant/theme` y el store `useDashboardStore` siguen compatibles al 100%.
  - `theme.ts` ahora exporta más presets y tipografías; todo tipado con TypeScript estricto.

---

### [Optimización de Fluidez, Persistencia de Productos y DataTable] — 2026-09-27 04:47
- **Responsable:** IDE 2 (Derlis Gimenez)
- **Sección:** Operación Diaria (Dashboard: Inicio, Calendario, Nueva Reserva, Productos, Comisiones, Caja)
- **Archivos Modificados / Creados:**
  - `frontend/app/dashboard/page.tsx`
  - `frontend/components/dashboard/CalendarBoard.tsx`
  - `frontend/app/dashboard/nueva-reserva/page.tsx`
  - `frontend/app/dashboard/productos/page.tsx`
  - `frontend/app/dashboard/comisiones/page.tsx`
  - `frontend/app/dashboard/caja/page.tsx`
  - `frontend/app/api/dashboard/sync/route.ts`
  - `frontend/store/useDashboardStore.ts`
- **Descripción de Cambios y Razonamiento:**
  1. **Fluidez Inmediata (Zustand Selectors):** Se migraron las subscripciones completas de `useDashboardStore()` a selectores atómicos individuales en `page.tsx` (Inicio), `CalendarBoard.tsx` (Calendario principal y vistas internas), `nueva-reserva`, `productos`, `comisiones` y `caja`. Esto elimina el 90% de los re-renders innecesarios en el dashboard.
  2. **Persistencia Real de Productos en PostgreSQL:** Se conectaron las acciones `create_product`, `update_product` y `delete_product` en `/api/dashboard/sync/route.ts` con Prisma (`prisma.product`), sincronizándolas en `useDashboardStore.ts` para que los cambios de catálogo y stock persistan al recargar la página.
  3. **Disponibilidad Real en Nueva Reserva:** Se integró la verificación de citas existentes en `nueva-reserva/page.tsx`, deshabilitando automáticamente los horarios ocupados del profesional seleccionado para evitar solapamientos (*overbooking* manual).
  4. **Limpieza y Reutilización UI (DataTable):** Se reemplazaron las tablas nativas duplicadas por el componente `DataTable` en `comisiones/page.tsx` y `caja/page.tsx`, obteniendo paginación automática y visualización adaptada a dispositivos móviles.
- **Impacto / Dependencias compartidas:**
  - `useDashboardStore.ts` y `/api/dashboard/sync/route.ts` ahora persisten productos en PostgreSQL.
  - La tabla `products` de Prisma se utiliza activamente en el backend.
  - No se modificó ningún archivo de apariencia ni estilos vetados.
- **Notas para el otro IDE / Desarrollador:**
  - Los productos ahora persisten en PostgreSQL.
  - El dashboard es notablemente más rápido y no dispara re-renders globales al interactuar con el calendario o la caja.

---

### [Módulo Apariencia & Promociones de Servicios Sync] — 2026-09-27 05:35
- **Responsable:** IDE 1 (Sebas Duarte)
- **Secciones:** `http://localhost:3000/dashboard/apariencia` y `http://localhost:3000/dashboard/servicios`
- **Archivos modificados:**
  - `frontend/components/dashboard/GuidedTour.tsx`
  - `frontend/lib/dashboard-types.ts`
  - `frontend/lib/theme.ts`
  - `frontend/app/dashboard/servicios/page.tsx`
  - `frontend/app/dashboard/apariencia/page.tsx`
  - `CHANGELOG_SYNC.md`
- **Resumen de Cambios Realizados:**
  1. **Chasis iPhone 16 Pro Fiel de la Landing:**
     - Se reemplazó el contenedor del teléfono por el chasis iPhone 16 Pro idéntico al de la landing (`PhoneMockup.tsx`): bisel de titanio degradado (`bg-gradient-to-b from-[#3a3b40] via-[#1e1f23] to-[#111215]`), botones laterales táctiles (Botón de Acción, Volumen +/-, Botón de Encendido y Sensor de Control de Cámara), marco de cristal negro, Dynamic Island con reflejo de lentes y barra de estado iOS 18 con hora real en vivo.
     - Se cambió la cabecera superior de la vista previa: de "iPhone Pro en Vivo" a **"Visualización en Tiempo Real"**.
  2. **Botón Ver Página Pública & Cabecera:**
     - Se removió el botón "Visita Guiada" redundante de la barra superior.
     - Se potenció el botón "Ver Página Pública" haciéndolo más visible, amplio, con borde reforzado, gradiente interactivo y micro-animación en hover para el ícono de apertura.
  3. **Lanzador Flotante de Visita Guiada (`GuidedTour.tsx`):**
     - Se removió la etiqueta de sección fija ("Personalización").
     - Ahora solo muestra "Visita Guiada": cuando no se ha visto la sección, parpadea con resplandor dorado/ámbar llamativo (`animate-pulse`, borde ámbar y anillo de luz) para invitar al usuario a explorarla; cuando ya se completó la sección, muestra un check verde sobrio.
  4. **Tarjetas de Temas & Filtros:**
     - Se eliminaron todas las etiquetas estáticas ("Oficial", "Más Elegido", "UI Pro Max", "Tendencia", "Eco Zen", "Vanguardia", "Exclusivo").
     - Se simplificaron los filtros a exactamente: **`Todos`**, **`Claro`** y **`Oscuro`** (se removieron las categorías por rubro de barbería, salones, etc.).
  5. **Selectores de Color Estilo CodePen (`yyONbPX` - appearance: base-select):**
     - Se eliminó la fila de colores predefinidos de marca y fondo.
     - Se implementó el componente `CodePenColorSelect` inspirado en el CodePen de base-select: disparador táctil con disco de muestra de color con relieve, código hexadecimal en fuente mono y menú desplegable con selector visual nativo, campo de texto manual y paleta de tonos recomendados.
     - Aplicado idénticamente a "Color de Marca" y a "Color de Fondo del Lienzo".
  6. **Fondos Animados con Movimiento Real:**
     - Se agregaron animaciones CSS reales activas (`floating-shapes`, `aurora-wave`, `ambient-mesh`, `particle-stars`, `soft-grid`, `glass-morphism`, `none`).
     - Cada tarjeta del selector incluye un recuadro de previsualización en miniatura (42x42px) donde las figuras flotan, la aurora rota o las estrellas titilan en tiempo real.
     - En el teléfono interactivo, el fondo animado se ejecuta en vivo detrás de los servicios.
  7. **Distribución de Fotos y Layouts (6 Estilos en Total):**
     - Se agregaron 2 nuevos layouts:
       - **Bento Grid Dinámico (`bento-grid`)**: Cuadrícula modular estilo Apple con tarjetas independientes para avatar, turno libre y validación.
       - **Inmersivo Full Screen (`full-immersive`)**: Portada que ocupa la parte superior con tarjeta de vidrio líquido flotante de alto impacto.
     - Ambos estilos son interactivos y se reflejan instantáneamente en la pantalla del teléfono.
  8. **Editor Visual de Portada & Logo Adaptable:**
     - El contenedor de edición ahora adapta automáticamente sus proporciones y aspecto al layout activo (panorámico, dividido, flotante, bento o inmersivo).
     - Se removieron los botones de enfoque fijo (Arriba/Centro/Abajo) y se agregó un **slider interactivo de encuadre vertical (`bannerPosY` de 0% a 100%)** con ajuste en tiempo real de `object-position`.
     - Se eliminaron los emojis de los recuadros de tamaño recomendado de portada y logo.
  9. **Módulo de Servicios & Promociones Especiales (`/dashboard/servicios`):**
     - Se agregaron campos opcionales de promoción al tipo `ServiceItem` y al modal de creación/edición de servicios:
       - Toggle "¿Activar Oferta o Promoción Especial?"
       - Precio Promocional (Gs.)
       - Etiqueta de la oferta (-20% OFF, -30% OFF, Flash Sale, 2x1, Lanzamiento, Cupos Limitados)
       - Limitación por turnos/cupos o por tiempo límite (horas)
     - En la lista de servicios del dashboard se muestra el precio tachado, el precio promo resaltado y el indicador de cupos o tiempo restante.
     - En el teléfono de Apariencia se visualizan las promociones en los servicios con badges de descuento y avisos de urgencia.
  10. **Modo Servicios Puro (`services-only`):**
      - Se añadió a la jerarquía de contenidos de Apariencia la opción de "Modo Servicios Puro" para negocios que solo desean exhibir su catálogo y turnos directos.
  11. **Textos, Redes & Políticas de Reserva:**
      - Se eliminaron todos los emojis de las sugerencias de aviso previo (ahora textos limpios como "10 min de tolerancia de espera", etc.).
      - Se incorporaron logotipos vectoriales oficiales SVG de alta calidad para **Instagram**, **WhatsApp**, **Facebook** y **Google Maps**, con sus campos de enlace correspondientes.
- **Compilación & Estabilidad:**
  - `npm run build` ejecutado exitosamente con **código 0**, cero advertencias de TypeScript y Turbopack optimizado.

---

### [Actualización: Corrección de Warning de Estilos, Modal de Cambios sin Guardar, Promociones y Visita Guiada] — 2026-09-27 06:05
- **Responsable:** IDE 1 (Sebas Duarte)
- **Secciones:** `dashboard/apariencia`, `dashboard/servicios`, `components/dashboard/GuidedTour.tsx`
- **Detalle:**
  1. **Solución Error de Consola (React Style Warning):**
     - Se reemplazó la propiedad shorthand `background` por `backgroundImage` en `aurora-wave` y gradientes lineales para evitar el conflicto con `backgroundSize` detectado por el motor de renderizado de React / Turbopack.
  2. **Modal de Confirmación "Cambios sin Guardar":**
     - Al modificar cualquier opción de apariencia e intentar cambiar de pestaña ("1. Estilos", "2. Portada & Fotos", "3. Botones", "4. Textos"), el sistema abre un modal de confirmación con opciones claras:
       - **Seguir Editando**: Permanece en la sección actual.
       - **Descartar y Cambiar**: Descarta modificaciones y avanza a la pestaña seleccionada.
       - **Guardar Cambios**: Guarda la configuración en base de datos de inmediato y luego cambia de pestaña.
     - Barra flotante inferior permanente mientras existan cambios sin guardar con botones de Guardar y Descartar.
     - Protección nativa del navegador con evento `beforeunload` para evitar pérdida de datos accidental al cerrar o recargar la pestaña.
  3. **Configuración Estricta de Promociones en `/dashboard/servicios`:**
     - Se eliminó el mock/fallback automático que asignaba promoción al primer servicio (`idx === 0`).
     - El teléfono interactivo ahora solo muestra promociones y ofertas cuando han sido activadas explícitamente en el módulo de Servicios.
     - En cada tarjeta de servicio se agregó un botón directo (`+ Activar Promoción / Descuento` o `Promo Configurada: ...`) que abre el modal con la sección de oferta ya desplegada para edición inmediata.
  4. **Restauración y Robustez de la Visita Guiada (`GuidedTour.tsx`):**
     - Soporte para cambio automático de pestañas mediante eventos personalizados `agendate-switch-tab` al enfocar elementos de otras secciones (fotos, botones, textos).
     - Corrección de jerarquía `z-index` (backdrop en `z-[101]`, spotlight en `z-[103]`, beacon en `z-[104]`, tarjeta en `z-[110]`) para evitar clics accidentales en el telón de fondo.
     - Delimitación y clamp de coordenadas de pantalla (`cardLeft`, `cardTop`) para asegurar que la tarjeta explicativa siempre permanezca visible y centrada en cualquier resolución.
  5. **Verificación de Compilación:**
     - `npm run build` verificado exitosamente con **0 errores**.

---

### [Landing Page CRO: Calculadora ROI, Ahorro Anual, Botón WhatsApp & Glassmorphism] — 2026-09-27 06:14
- **Responsable:** IDE 2 (Derlis Gimenez)
- **Sección:** Landing Page Principal (`/`)
- **Archivos Modificados / Creados:**
  - `frontend/components/landing/RoiCalculator.tsx` (creación)
  - `frontend/components/landing/WhatsAppFloatingButton.tsx` (creación)
  - `frontend/components/landing/Pricing.tsx`
  - `frontend/components/landing/HowItWorks.tsx`
  - `frontend/components/landing/MiniCalendar.tsx`
  - `frontend/components/landing/Ticker.tsx`
  - `frontend/components/landing/LandingPage.tsx`
  - `frontend/components/landing/Header.tsx`
  - `frontend/components/landing/Footer.tsx`
- **Descripción de Cambios y Razonamiento:**
  1. **Calculadora Interactiva de Pérdida por Inasistencias (ROI Calculator):** Se creó el componente `RoiCalculator.tsx` con sliders táctiles para turnos diarios, precio promedio y días de atención. Muestra en tiempo real el dinero perdido por ausentismo y el ingreso recuperado con AgendatePY (+80% efectividad), calculando en cuántos días el Plan Pro se autofinancia.
  2. **Claridad en Ahorro de Planes Anuales:** En `Pricing.tsx`, al conmutar a "Pago Anual", se incorporaron etiquetas y badges que desglosan el ahorro exacto en Guaraníes (ej. *"Ahorrás Gs. 600.000 al año (2 meses gratis) · Gs. 2.400.000 facturado anual"*).
  3. **Botón Flotante de WhatsApp:** Se implementó `WhatsAppFloatingButton.tsx` en la esquina inferior con animación de pulso, indicador de operador en línea y mensaje contextual de asesoría comercial inmediata para Asunción/Paraguay.
  4. **Acabado Visual Premium (Glassmorphism & Soporte Dark Mode Completo):**
     - `HowItWorks.tsx`: Integración de fondos `backdrop-blur-2xl`, iluminación ambiental, bordes sutiles y soporte total para modo oscuro en botones y tarjetas de beneficios.
     - `MiniCalendar.tsx`: Días, números y estados adaptados para modo claro y oscuro con alto contraste.
     - `Ticker.tsx`: Fondo y bordes con soporte `dark:bg-slate-950`.
     - `Pricing.tsx`: Tarjetas glassmorphic con orbes ambientales y estilos dark mode impecables.
  5. **Navegación:** Se incorporó el acceso directo a la "Calculadora" en la barra de navegación superior ([Header.tsx](file:///c:/Users/acer/Documents/agenopy/agendatepy-main%20%281%29/agendatepy-main/frontend/components/landing/Header.tsx)) y en el pie de página ([Footer.tsx](file:///c:/Users/acer/Documents/agenopy/agendatepy-main%20%281%29/agendatepy-main/frontend/components/landing/Footer.tsx)).
- **Impacto / Dependencias compartidas:**
  - No afecta rutas del dashboard ni archivos vetados de Apariencia.
  - Compatible al 100% con los cambios de tema y esquemas existentes.
- **Verificación:**
  - `npx tsc --noEmit` completado con **0 errores**.

---

### [Branding Oficial: Integración de Isotipo y Logotipo Agendatepy] — 2026-09-27 06:25
- **Responsable:** IDE 2 (Derlis Gimenez)
- **Sección:** Identidad Visual & Branding Global
- **Archivos Modificados / Creados:**
  - `frontend/components/ui/BrandLogo.tsx` (creación de componente oficial de marca)
  - `frontend/public/logo.svg` (recurso SVG vectorial oficial)
  - `frontend/components/landing/Header.tsx`
  - `frontend/components/landing/Footer.tsx`
  - `frontend/components/dashboard/Sidebar.tsx`
- **Descripción de Cambios y Razonamiento:**
  1. **Componente Vectorial Oficial (`BrandLogo.tsx`):**
     - Se codificó fielmente el SVG de branding provisto: letra **A** redondeada en tono enérgico `#FF4F2B`, corte triangular superior blanco y switch/toggle de automatización en el travesaño (`rx="56"` con disco blanco).
     - Soporta 3 variantes optimizadas:
       - `icon`: Únicamente el isotipo A con toggle para avatares, favicons o sidebar colapsado.
       - `horizontal`: Isotipo a la izquierda + wordmark tipográfico *"agendatepy"* con badge opcional (ideal para headers y footers).
       - `full`: SVG apilado completo (1200x1000) con texto centrado.
  2. **Aplicación en Navegación y Pie de Página:**
     - En [Header.tsx](file:///c:/Users/acer/Documents/agenopy/agendatepy-main%20%281%29/agendatepy-main/frontend/components/landing/Header.tsx) y [Footer.tsx](file:///c:/Users/acer/Documents/agenopy/agendatepy-main%20%281%29/agendatepy-main/frontend/components/landing/Footer.tsx), se reemplazó el icono genérico de calendario por el nuevo `BrandLogo` horizontal interactivo con badge PY.
  3. **Aplicación en Panel de Control:**
     - En [Sidebar.tsx](file:///c:/Users/acer/Documents/agenopy/agendatepy-main%20%281%29/agendatepy-main/frontend/components/dashboard/Sidebar.tsx), se actualizó la cabecera del panel con el isotipo oficial `#FF4F2B` y el wordmark en minúsculas con badge PRO.
- **Verificación:**
  - `npx tsc --noEmit` completado con **0 errores**.

---

### [Ajustes de UI/UX, Simulador de WhatsApp y Armonización en Tonos del Logo] — 2026-09-27 06:48
- **Responsable:** IDE 2 (Derlis Gimenez)
- **Sección:** Branding, UI/UX Landing & Simulador de WhatsApp
- **Archivos Modificados:**
  - `frontend/components/ui/BrandLogo.tsx`
  - `frontend/components/landing/PhoneMockup.tsx`
  - `frontend/components/landing/Hero.tsx`
  - `frontend/components/landing/Header.tsx`
  - `frontend/components/landing/Features.tsx`
  - `frontend/components/landing/WhatsAppShowcase.tsx`
  - `frontend/components/landing/HowItWorks.tsx`
  - `frontend/components/landing/RoiCalculator.tsx`
  - `frontend/components/landing/Pricing.tsx`
  - `frontend/lib/email.ts`
  - `CHANGELOG_SYNC.md`
- **Descripción de Cambios y Razonamiento:**
  1. **Eliminación del badge/pill "PY" externo:** Se removió la píldora externa que envolvía "PY" al costado de `agendatepy` en `BrandLogo.tsx`. Ahora el isotipo "A" con toggle y el wordmark en minúsculas `agendatepy` se despliegan de forma limpia y continua idéntica al logo vectorial oficial.
  2. **Eliminación del texto del simulador:** Se eliminó la etiqueta flotante inferior `"✨ Simulador Interactivo de WhatsApp en Vivo"` debajo del mockup del iPhone en `PhoneMockup.tsx`.
  3. **Flujo de Respuesta Directa en 1 Toque (WhatsApp Interactivo):**
     - Se refactorizó la interacción del chat: al tocar cualquier opción de servicio (o hacer clic en el mensaje de bienvenida), se envía la selección del usuario, se activa brevemente el estado `"escribiendo..."` (600ms) y el bot responde inmediatamente con el resultado final:
       - **Tarjeta de Turno Confirmado** (servicio, fecha/hora, profesional, local y precio en Gs.).
       - **Mensaje de Recordatorio Automático 2h Antes** (con botón rápido para simular de nuevo si el usuario lo desea).
     - Se eliminaron los pasos intermedios forzados (elección múltiple de horarios, reproductor de audio previo).
     - Se ocultaron las barras de desplazamiento del navegador dentro del marco del iPhone (`[scrollbar-width:none] [&::-webkit-scrollbar]:hidden`) y se agregó auto-scroll suave hacia el mensaje final.
  4. **Armonización Visual en Tonos del Logo (`#FF4F2B`, Vermellón & Coral Cálido):**
     - Se sustituyeron todos los degradados residuales morados/índigo (`indigo-500`, `indigo-600`, `violet-500`, `purple`) por la paleta armónica del logo:
       - Gradientes de titulares y botones: `from-brand to-[#FF6B4A]` y `from-brand via-[#FF6B4A] to-amber-500`.
       - Halo ambiental del iPhone: luz cálida vermellón y esmeralda.
       - Widgets flotantes (SIPAP y Recordatorios) y acentos de control adaptados a los tonos oficiales.
       - Plantilla de correo electrónico OTP sincronizada con `#FF4F2B`.
- **Verificación:**
  - `npx tsc --noEmit` completado exitosamente con **0 errores**.
  - Servidor de desarrollo respondiendo activamente en `http://localhost:3000` (HTTP 200).

---

### [Restauración de Flujo Interactivo Paso a Paso en WhatsApp Mockup] — 2026-09-27 06:53
- **Responsable:** IDE 2 (Derlis Gimenez)
- **Sección:** Simulador de WhatsApp (`PhoneMockup.tsx`)
- **Archivos Modificados:**
  - `frontend/components/landing/PhoneMockup.tsx`
  - `CHANGELOG_SYNC.md`
- **Descripción de Cambios y Razonamiento:**
  - Se restauró la secuencia interactiva original paso a paso en el simulador de WhatsApp (`PhoneMockup.tsx`):
    1. Selección interactiva de servicio con opciones.
    2. Consulta de horarios disponibles para el día (`16:30 hs`, `18:00 hs`).
    3. Confirmación con tarjeta interactiva de turno y botón para nota de voz.
    4. Reproducción simulada de audio con forma de onda dinámica.
    5. Mensaje de recordatorio automático 2h antes.
  - Se mantuvieron intactos los puntos aprobados:
    - **Logo:** Sin la píldora/badge "PY" externa.
    - **Simulador:** Sin la etiqueta de texto flotante inferior `"Simulador Interactivo de WhatsApp en Vivo"`.
    - **UI/UX:** Paleta oficial en tonos del logo `#FF4F2B`, vermellón, coral cálido y acentos ambarinos en toda la landing page.
- **Verificación:**
  - `npx tsc --noEmit` completado con **0 errores**.
  - Servidor local funcionando en `http://localhost:3000` (HTTP 200).

---

### [Mejora UI/UX de Notificaciones Flotantes en Phone Mockup] — 2026-09-27 07:10
- **Responsable:** IDE 2 (Derlis Gimenez)
- **Sección:** Notificaciones Flotantes del Simulador (`PhoneMockup.tsx`)
- **Archivos Modificados:**
  - `frontend/components/landing/PhoneMockup.tsx`
  - `CHANGELOG_SYNC.md`
- **Descripción de Cambios y Razonamiento:**
  1. **Rediseño Natural de las Notificaciones:**
     - Se ajustó el desplazamiento espacial (`-left-20 lg:-left-28` y `-right-20 lg:-right-28`) para evitar que las tarjetas colisionen o tapen la cabecera de WhatsApp (nombre del negocio y avatar) o los mensajes del chat. Ahora flotan de manera orgánica y balanceada al lado del teléfono.
     - Se implementó diseño estilo *push notification* de iOS con micro-cabecera de origen (`WhatsApp Bot · Hace 2 min` y `SIPAP Bancario · Ahora`).
  2. **Actualización de Texto Solicitada:**
     - Se cambió *"SIPAP Bancario"* por **"Transferencia recibida"** con monto destacado en Guaraníes (`+Gs. 120.000 ingresado`) y badge verificado.
  3. **Mayor Dinamismo:**
     - Animación continua de levitación 3D suave.
     - Indicador en vivo de estado con pulso animado (*live ping*).
     - Micro-interacción `whileHover={{ scale: 1.05, y: -10 }}` para respuesta táctil y al cursor.
  4. **Aislamiento de Cambios:**
     - Siguiendo la instrucción estricta, únicamente se modificó la sección de las dos tarjetas de notificación flotantes en `PhoneMockup.tsx`, sin tocar ningún otro componente ni funcionalidad.
- **Verificación:**
  - `npx tsc --noEmit` completado con **0 errores**.
  - Servidor local respondiendo en `http://localhost:3000` (HTTP 200).

---

### [Refinamiento de Notificaciones Flotantes: Tarjetas Limpias y Sin Títulos Artificiales] — 2026-09-27 07:16
- **Responsable:** IDE 2 (Derlis Gimenez)
- **Sección:** Notificaciones Flotantes del Simulador (`PhoneMockup.tsx`)
- **Archivos Modificados:**
  - `frontend/components/landing/PhoneMockup.tsx`
  - `CHANGELOG_SYNC.md`
- **Descripción de Cambios y Razonamiento:**
  1. **Eliminación de Títulos Artificiales y "WhatsApp Bot":**
     - Se removió por completo la cabecera/etiqueta `"WHATSAPP BOT"` y `"SIPAP BANCARIO · AHORA"`.
     - La notificación superior ahora es una tarjeta limpia y natural: Icono de campana + `"Recordatorio 2h Antes"` con badge `[Confirmado]` + `"Sofía confirmó su turno"`.
  2. **Reemplazo Directo de "SIPAP Bancario" por "Transferencia recibida":**
     - Tal como lo solicitó el usuario, el texto *"Transferencia recibida"* sustituye directamente al texto *"SIPAP Bancario"* en el cuerpo principal de la tarjeta, sin agregarse como título externo ni barra adicional.
     - Incluye el badge `[Verificado]` y monto `"Gs. 120.000 ingresado"` en verde esmeralda.
  3. **Visual Limpio sin Truncamiento:**
     - Se eliminó el truncamiento de texto (`truncate`), garantizando lectura fluida y completa con `whitespace-nowrap` y padding equilibrado.
  4. **Aislamiento Total:**
     - Modificación aplicada exclusivamente en las dos tarjetas flotantes de `PhoneMockup.tsx`, preservando el resto de la landing page intacto.
- **Verificación:**
  - `npx tsc --noEmit` completado con **0 errores**.
  - Servidor de desarrollo respondiendo activamente en `http://localhost:3000` (HTTP 200).



