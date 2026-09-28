"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  X,
  ArrowRight,
  ArrowLeft,
  Calendar,
  Wallet,
  MessageSquare,
  Palette,
  ExternalLink,
  CheckCircle2,
  Users,
  Scissors,
  ShoppingBag,
  ShieldCheck,
  ChevronDown,
  Lightbulb,
  Check,
  CalendarPlus,
  MessagesSquare,
  Coins,
  Award,
  Ban,
  Receipt,
  QrCode,
  Settings,
  Crown,
  Search,
  RotateCcw,
  Target,
  BookmarkCheck,
  LogOut,
} from "lucide-react";
import { useDashboardStore } from "@/store/useDashboardStore";

export interface SectionStep {
  stepNumber: number;
  taskTitle: string;
  instruction: string;
  tip?: string;
  targetSelector?: string;
  actionLabel?: string;
  actionPath?: string;
}

export interface SectionTourData {
  id: string;
  title: string;
  badge: string;
  icon: any;
  summary: string;
  steps: SectionStep[];
}

export const ALL_SECTION_TOURS: Record<string, SectionTourData> = {
  inicio: {
    id: "inicio",
    title: "Panel Principal & Resumen del Día",
    badge: "Visión General",
    icon: Sparkles,
    summary:
      "Tu centro de comando. Acá ves cuántos turnos tenés hoy, tus ingresos acumulados en Guaraníes y los accesos rápidos a todas las herramientas.",
    steps: [
      {
        stepNumber: 1,
        taskTitle: "¡Hola! Este es tu Panel Principal",
        instruction:
          "¡Te damos la bienvenida a Agendatepy! Desde este panel central vas a controlar todas las operaciones de tu negocio: citas del día, cobros en caja, métricas en tiempo real y atención al cliente.",
        tip: "Avanzá con el botón Siguiente o presioná Enter en tu teclado.",
        targetSelector: '[data-tour="welcome-banner"]',
      },
      {
        stepNumber: 2,
        taskTitle: "Menú Lateral Inteligente",
        instruction:
          "Acercá tu mouse a la barra lateral izquierda por un momento: se expandirá automáticamente para darte acceso a tu Agenda, Servicios, Caja, Clientes, Reportes y Ajustes.",
        tip: "Podés fijarlo con el botón de chincheta si preferís tenerlo siempre expandido.",
        targetSelector: '[data-tour="sidebar-nav"]',
      },
      {
        stepNumber: 3,
        taskTitle: "Tu Portal Oficial de Reservas",
        instruction:
          "Hacé clic en 'Ver mi página' para abrir tu web de turnos pública. Tus clientes podrán ver tus servicios, precios en Guaraníes y horarios disponibles 24/7.",
        tip: "Pegá ese enlace en la biografía de tu Instagram o en la respuesta rápida de WhatsApp.",
        targetSelector: '[data-tour="header-booking-link"]',
      },
      {
        stepNumber: 4,
        taskTitle: "Métricas Operativas del Día",
        instruction:
          "Supervisá en tiempo real tu recaudación acumulada en Guaraníes, turnos confirmados de la jornada, tasa de ocupación de sillones y clientes registrados.",
        tip: "Todos los números se calculan al instante con datos reales de tu negocio.",
        targetSelector: '[data-tour="kpi-cards"]',
      },
      {
        stepNumber: 5,
        taskTitle: "Agenda Operativa & Cobro en Caja",
        instruction:
          "En esta lista tenés los turnos del día en orden cronológico. Podés confirmar asistencia, contactar al cliente por WhatsApp y registrar el cobro en caja con 1 solo clic.",
        tip: "Al cobrar una cita, el ingreso se añade automáticamente a tu arqueo de caja del día.",
        targetSelector: '[data-tour="agenda-operativa"]',
      },
      {
        stepNumber: 6,
        taskTitle: "Atención CRM & Operaciones Rápidas",
        instruction:
          "Atendé consultas de tus clientes y ejecutá operaciones frecuentes como bloquear horarios de almuerzo o validar comprobantes bancarios SIPAP.",
        tip: "¡Listo! Ya conocés tu panel principal. Estás listo para comenzar.",
        targetSelector: '[data-tour="quick-actions-crm"]',
      },
    ],
  },
  calendario: {
    id: "calendario",
    title: "Agenda & Calendario de Turnos",
    badge: "Agenda",
    icon: Calendar,
    summary:
      "Gestioná el tiempo de tu equipo, visualizá la semana completa y evitá solapamientos de horarios entre profesionales.",
    steps: [
      {
        stepNumber: 1,
        taskTitle: "Control de Fechas & Vistas",
        instruction:
          "Cambiá entre vista de Día, Semana o Mes, navegá rápidamente entre fechas pasadas o futuras y volvé a 'Hoy' con un solo toque.",
        tip: "Podés alternar a vista semanal para ver la ocupación completa de tu equipo.",
        targetSelector: '[data-tour="calendar-header"]',
      },
      {
        stepNumber: 2,
        taskTitle: "Filtro por Colaborador",
        instruction:
          "Tocá en 'Todo el equipo' para ver todos los turnos juntos o seleccioná a un profesional específico para ver únicamente su agenda individual.",
        tip: "Cada colaborador tiene un color distintivo para identificar sus citas al instante en la cuadrícula.",
        targetSelector: '[data-tour="calendar-staff-filter"]',
      },
      {
        stepNumber: 3,
        taskTitle: "Agendar Turno Rápido",
        instruction:
          "Hacé clic en '+ Crear Cita' o tocá directamente cualquier horario libre en la cuadrícula. Se abrirá el formulario customizado ultra rápido para registrar al cliente sin recargas.",
        tip: "Podés buscar un cliente frecuente o tipear uno nuevo con su WhatsApp paraguayo en 5 segundos.",
        targetSelector: '[data-tour="calendar-create-btn"]',
      },
      {
        stepNumber: 4,
        taskTitle: "Bloqueos Operativos & Descansos",
        instruction:
          "Si alguien sale a almorzar, tiene un trámite o el salón cierra por feriado, usá '+ Bloquear Horario' para pausar reservas en ese intervalo.",
        tip: "Los clientes no podrán agendar turnos online durante los horarios bloqueados.",
        targetSelector: '[data-tour="calendar-block-btn"]',
      },
      {
        stepNumber: 5,
        taskTitle: "Cuadrícula Interactiva de Turnos",
        instruction:
          "Hacé clic en cualquier turno agendado para ver su detalle, cobrarlo en caja, contactar al cliente por WhatsApp o reprogramar el horario fácilmente.",
        tip: "Podés mover citas o reprogramarlas con un solo clic sin perder los datos del cliente.",
        targetSelector: '[data-tour="calendar-grid"]',
      },
    ],
  },
  "nueva-reserva": {
    id: "nueva-reserva",
    title: "Nueva Reserva Rápida",
    badge: "Cita Manual",
    icon: CalendarPlus,
    summary:
      "Formulario ultra veloz para agendar clientes presenciales que llegan al mostrador o te llaman por teléfono en menos de 30 segundos.",
    steps: [
      {
        stepNumber: 1,
        taskTitle: "Panel de Nueva Reserva",
        instruction:
          "Agendá citas presenciales o telefónicas en menos de 30 segundos con sincronización inmediata a la base de datos SQL.",
        tip: "También podés bloquear horarios de descanso o almuerzo con la pestaña 'Bloquear Horario'.",
        targetSelector: '[data-tour="nueva-reserva-header"]',
      },
      {
        stepNumber: 2,
        taskTitle: "Cliente & WhatsApp Internacional",
        instruction:
          "Ingresá el nombre y teléfono del cliente. Podés buscarlo entre tus clientes habituales o registrar uno nuevo eligiendo el país y validando su número en vivo.",
        tip: "El selector incluye Paraguay y más de 20 países con banderas y códigos de área.",
        targetSelector: '[data-tour="nueva-reserva-client"]',
      },
      {
        stepNumber: 3,
        taskTitle: "Servicio & Especialista",
        instruction:
          "Seleccioná el corte, tratamiento o paquete y a qué profesional de tu equipo asignarle el turno.",
        tip: "La duración y la tarifa en Guaraníes se calculan automáticamente.",
        targetSelector: '[data-tour="nueva-reserva-service"]',
      },
      {
        stepNumber: 4,
        taskTitle: "Fecha & Horario",
        instruction:
          "Elegí el día y la hora de inicio. Podés ajustar los minutos con los botones rápidos ±15m o seleccionar la hora exacta.",
        tip: "La hora de finalización se calcula de forma automática según la duración del servicio.",
        targetSelector: '[data-tour="nueva-reserva-datetime"]',
      },
      {
        stepNumber: 5,
        taskTitle: "Método de Pago",
        instruction:
          "Definí cómo abonará el cliente: Efectivo en caja, Transferencia SIPAP, POS Bancard o Billetera Móvil.",
        targetSelector: '[data-tour="nueva-reserva-payment"]',
      },
      {
        stepNumber: 6,
        taskTitle: "Confirmar & Disparar WhatsApp",
        instruction:
          "Hacé clic en 'Confirmar Turno'. La cita se guarda en la base de datos SQL y te dará el botón listo para avisarle al cliente por WhatsApp con el mensaje ya redactado.",
        tip: "Podés añadir notas adicionales para el profesional antes de guardar.",
        targetSelector: '[data-tour="nueva-reserva-confirm"]',
      },
    ],
  },
  crm: {
    id: "crm",
    title: "CRM Omnicanal de Mensajes",
    badge: "Bandeja Unificada",
    icon: MessagesSquare,
    summary:
      "Centralizá todas las consultas que te llegan por WhatsApp, Instagram Direct y chat web en una sola bandeja sin perder ningún cliente.",
    steps: [
      {
        stepNumber: 1,
        taskTitle: "Explorar la lista de conversaciones",
        instruction:
          "En la columna izquierda tenés todos los chats ordenados por los más recientes. Cada chat muestra el canal (WhatsApp, Instagram o Web) y si está pendiente.",
      },
      {
        stepNumber: 2,
        taskTitle: "Responder en tiempo real con 1 clic",
        instruction:
          "Escribí tu mensaje o usá respuestas predeterminadas. El mensaje se envía directo al canal de origen del cliente sin salir de tu panel.",
        tip: "Tenés atajos para enviar la lista de precios o el enlace de reservas directamente.",
      },
      {
        stepNumber: 3,
        taskTitle: "Guardar notas privadas del cliente",
        instruction:
          "En el panel derecho de la conversación podés anotar detalles internos (ej: 'Prefiere pagar en efectivo', 'Viene con su hijo') que solo tu equipo puede ver.",
      },
      {
        stepNumber: 4,
        taskTitle: "Archivar o resolver conversaciones",
        instruction:
          "Cuando el turno quede agendado o la consulta esté resuelta, tocá 'Marcar como Resuelto' para mantener tu bandeja limpia.",
      },
    ],
  },
  clientes: {
    id: "clientes",
    title: "Clientes & Ficha Técnica",
    badge: "Directorio & CRM",
    icon: Users,
    summary:
      "Gestioná tu cartera de clientes, fórmulas técnicas privadas de tinte o corte, historial de visitas y tarjetas de fidelización.",
    steps: [
      {
        stepNumber: 1,
        taskTitle: "Directorio Central de Clientes",
        instruction:
          "En esta sección tenés el registro centralizado de tus clientes: datos de contacto, historial de visitas y acceso directo a sus fichas técnicas.",
        tip: "Usá el botón 'Nuevo Cliente' para cargar a alguien de forma manual con su número de WhatsApp.",
        targetSelector: '[data-tour="clientes-header"]',
      },
      {
        stepNumber: 2,
        taskTitle: "Métricas de tu Cartera",
        instruction:
          "Monitoreá el total de clientes registrados, cuántos pertenecen a la categoría VIP o Frecuente y el gasto promedio por cliente.",
        tip: "Los números se actualizan automáticamente con cada turno completado y cobrado en caja.",
        targetSelector: '[data-tour="clientes-kpis"]',
      },
      {
        stepNumber: 3,
        taskTitle: "Buscador Inteligente & Filtros",
        instruction:
          "Encontrá a cualquier persona al instante escribiendo su nombre, los últimos dígitos de su celular o notas de su ficha técnica.",
        tip: "Podés filtrar rápidamente por etiquetas como VIP, Frecuente o Nuevo.",
        targetSelector: '[data-tour="clientes-search"]',
      },
      {
        stepNumber: 4,
        taskTitle: "Ficha Técnica, Historial & Fotos",
        instruction:
          "Hacé clic en 'Ver Ficha' en cualquier cliente para consultar sus fórmulas de colorimetría, notas de atención, fotos de antes y después y su historial completo de citas.",
        tip: "Toda la información técnica es privada y visible únicamente para vos y tu equipo.",
        targetSelector: '[data-tour="clientes-card"]',
      },
      {
        stepNumber: 5,
        taskTitle: "Agendar Turno sin salir de la página",
        instruction:
          "Tocá 'Agendar' en cualquier tarjeta para abrir el agendador rápido con los datos del cliente ya pre-cargados, manteniéndote en esta misma pantalla.",
        tip: "Al confirmar, el turno se registra en la agenda en tiempo real sin recargar la página.",
        targetSelector: '[data-tour="clientes-agendar-btn"]',
      },
    ],
  },
  servicios: {
    id: "servicios",
    title: "Catálogo de Servicios",
    badge: "Menú & Tarifas",
    icon: Scissors,
    summary:
      "Definí tu menú de atención con precios en Guaraníes, duraciones por turno y enlaces directos de reserva para tus clientes.",
    steps: [
      {
        stepNumber: 1,
        taskTitle: "Catálogo Central de Servicios",
        instruction:
          "Aquí administrás los servicios que tu negocio ofrece. Cada servicio define su duración en minutos y su precio en Guaraníes.",
        tip: "La duración es clave para que el calendario calcule automáticamente los bloques libres sin solapamientos.",
        targetSelector: '[data-tour="servicios-header"]',
      },
      {
        stepNumber: 2,
        taskTitle: "Métricas del Menú",
        instruction:
          "Consultá cuántos servicios tenés activos, la duración promedio de atención y el ticket promedio por turno.",
        tip: "Estos valores te ayudan a dimensionar la rentabilidad y capacidad diaria de tu local.",
        targetSelector: '[data-tour="servicios-kpis"]',
      },
      {
        stepNumber: 3,
        taskTitle: "Categorías y Buscador Rápido",
        instruction:
          "Filtrá entre categorías como Peluquería, Barbería o Tratamientos, o buscá rápidamente cualquier servicio por su nombre.",
        tip: "Tus clientes también verán estas categorías organizadas en su pantalla de reserva online.",
        targetSelector: '[data-tour="servicios-filters"]',
      },
      {
        stepNumber: 4,
        taskTitle: "Tarjetas de Servicio & Visibilidad",
        instruction:
          "Cada tarjeta muestra el tiempo de turno, el precio en Guaraníes y un botón para activar o pausar su visibilidad en tu web de reservas.",
        tip: "Podés pausar un servicio temporalmente sin eliminarlo para que no aparezca en tu portal.",
        targetSelector: '[data-tour="servicios-card"]',
      },
      {
        stepNumber: 5,
        taskTitle: "Promociones Flash & Descuentos",
        instruction:
          "Hacé clic en 'Activar promo flash' en cualquier tarjeta para abrir el calculador automático de descuentos por porcentaje o monto, con vista previa en vivo.",
        tip: "Podés elegir si querés mostrar el porcentaje (-20% OFF) o el monto ahorrado en Guaraníes a tus clientes.",
        targetSelector: '[data-tour="servicios-promo-btn"]',
      },
      {
        stepNumber: 6,
        taskTitle: "Compartir Enlace Directo",
        instruction:
          "Tocá 'Copiar Link' en cualquier servicio para enviárselo a un cliente por WhatsApp o ponerlo en tus historias. Entrarán directo con ese servicio seleccionado.",
        tip: "Ideal para promociones de Instagram o campañas específicas.",
        targetSelector: '[data-tour="servicios-share-btn"]',
      },
      {
        stepNumber: 7,
        taskTitle: "Agregar un Nuevo Servicio",
        instruction:
          "Hacé clic en 'Nuevo Servicio' para cargar un corte, tratamiento o paquete con su duración, tarifa y especialistas asignados.",
        tip: "Podés editar cualquier servicio en el momento que desees con el ícono del lápiz.",
        targetSelector: '[data-tour="servicios-new-btn"]',
      },
    ],
  },
  productos: {
    id: "productos",
    title: "Tienda & Control de Stock",
    badge: "Inventario",
    icon: ShoppingBag,
    summary:
      "Controlá tus productos de reventa (ceras, aceites, champús), calculá tus márgenes de ganancia y recibí pedidos por WhatsApp.",
    steps: [
      {
        stepNumber: 1,
        taskTitle: "Cargar un producto con costo y precio",
        instruction:
          "Tocá '+ Nuevo Producto'. Ingresá el nombre, categoría, costo de compra (lo que te cuesta del proveedor) y precio de venta al público.",
        tip: "El sistema calcula automáticamente el porcentaje de ganancia neta en verde (ej: Margen: 55%).",
      },
      {
        stepNumber: 2,
        taskTitle: "Ajuste rápido de unidades de stock",
        instruction:
          "En cada tarjeta tenés los botones táctiles '-1', '+1' y '+5'. Cuando llega un pedido del distribuidor o vendés un producto al mostrador, sumá o restá con un toque.",
      },
      {
        stepNumber: 3,
        taskTitle: "Copiar el enlace de tu Tienda Web",
        instruction:
          "Tocá 'Copiar Enlace Tienda' arriba. Tus clientes pueden mirar tu catálogo de productos y pedir directamente a tu WhatsApp.",
      },
    ],
  },
  caja: {
    id: "caja",
    title: "Caja Diaria & Finanzas",
    badge: "Finanzas",
    icon: Wallet,
    summary:
      "Llevá el control de cobros en Efectivo, transferencias SIPAP y tarjetas Bancard, con cierre diario de caja transparente.",
    steps: [
      {
        stepNumber: 1,
        taskTitle: "Panel Central de Caja & Finanzas",
        instruction:
          "Aquí controlás todos los movimientos de dinero de tu negocio: cobros de turnos, venta de productos de mostrador y gastos menores.",
        tip: "Mantené tu caja actualizada en tiempo real para evitar descuadres al final del turno.",
        targetSelector: '[data-tour="caja-header"]',
      },
      {
        stepNumber: 2,
        taskTitle: "Registro Completo por Días & Calendario",
        instruction:
          "Navegá fácilmente entre Hoy, Ayer, cualquier fecha específica del calendario o visualizá el historial completo de movimientos.",
        tip: "Al cambiar de día, los balances y cobros se recalculan al instante para la fecha elegida.",
        targetSelector: '[data-tour="caja-date-filter"]',
      },
      {
        stepNumber: 3,
        taskTitle: "Métricas & Saldo Esperado en Caja",
        instruction:
          "Consultá el total de ingresos, los egresos y el efectivo físico exacto que debe haber en tu cajón (Fondo inicial + Efectivo cobrado - Egresos).",
        tip: "Los cobros por POS y transferencias bancarias SIPAP van directo a tu cuenta comercial.",
        targetSelector: '[data-tour="caja-kpis"]',
      },
      {
        stepNumber: 4,
        taskTitle: "Desglose por Medios de Pago",
        instruction:
          "Separá con precisión cuánto dinero ingresó en Efectivo Físico, cuánto vía tarjeta POS Bancard y cuánto por transferencias bancarias SIPAP.",
        tip: "Facilita la conciliación con tu extracto bancario en cuestión de segundos.",
        targetSelector: '[data-tour="caja-methods"]',
      },
      {
        stepNumber: 5,
        taskTitle: "Registrar Nuevo Cobro o Egreso",
        instruction:
          "Tocá '+ Registrar Movimiento' para asentar un cobro de servicio, venta de producto de mostrador o gasto menor (hielo, café, insumos).",
        tip: "Podés seleccionar productos cargados en tienda para descontar stock automáticamente.",
        targetSelector: '[data-tour="caja-new-btn"]',
      },
      {
        stepNumber: 6,
        taskTitle: "Arqueo & Cierre de Caja del Día",
        instruction:
          "Al terminar la jornada laboral, tocá 'Cierre de Caja'. Contá los billetes en tu gaveta física y el sistema detectará al instante si tu caja está exacta, con sobrante o con faltante.",
        tip: "Podés añadir observaciones y los cierres quedan guardados en la base de datos.",
        targetSelector: '[data-tour="caja-close-btn"]',
      },
      {
        stepNumber: 7,
        taskTitle: "Auditoría Cronológica de Movimientos",
        instruction:
          "Revisá cada movimiento registrado en orden de hora, con su método de pago, comprobante o voucher y exportá a CSV si necesitás contabilidad.",
        tip: "Podés filtrar la tabla rápidamente por Efectivo, POS o Transferencia.",
        targetSelector: '[data-tour="caja-table"]',
      },
    ],
  },
  comisiones: {
    id: "comisiones",
    title: "Comisiones & Pagos al Equipo",
    badge: "Liquidación",
    icon: Coins,
    summary:
      "Cálculo automático de comisiones por cada servicio realizado para pagar a barberos y estilistas sin discusiones ni errores.",
    steps: [
      {
        stepNumber: 1,
        taskTitle: "Filtrar por profesional y periodo",
        instruction:
          "Elegí a quién querés liquidar (ej: Marcos Benítez) y el rango de fechas (esta semana, quincena o mes).",
      },
      {
        stepNumber: 2,
        taskTitle: "Auditar los servicios cobrados",
        instruction:
          "Verás la lista detallada de turnos atendidos por esa persona, el precio cobrado y el porcentaje pactado.",
      },
      {
        stepNumber: 3,
        taskTitle: "Marcar comisión como pagada",
        instruction:
          "Al transferir o entregar el efectivo al colaborador, tocá 'Registrar Pago de Comisión' para asentar la fecha y comprobante.",
      },
    ],
  },
  fidelizacion: {
    id: "fidelizacion",
    title: "Club VIP & Programa de Puntos",
    badge: "Lealtad",
    icon: Award,
    summary:
      "Hacé que tus clientes vuelvan siempre acumulando puntos por cada corte o tratamiento con tarjetas Apple & Google Wallet.",
    steps: [
      {
        stepNumber: 1,
        taskTitle: "Configurar la regla de puntos",
        instruction:
          "Definí cuántos puntos gana el cliente por cada turno asistido (ej: 1 punto por visita) o por cada 10.000 Gs gastados.",
      },
      {
        stepNumber: 2,
        taskTitle: "Establecer premios y beneficios",
        instruction:
          "Creá los premios que pueden canjear (ej: '5to corte con 50% OFF' o '10 puntos = Tratamiento capilar gratis').",
      },
      {
        stepNumber: 3,
        taskTitle: "Enviar la tarjeta digital al cliente",
        instruction:
          "Copiá el enlace de su tarjeta y pasáselo por WhatsApp para que la instale en su iPhone o Android en 1 toque.",
      },
    ],
  },
  whatsapp: {
    id: "whatsapp",
    title: "WhatsApp Hub & Recordatorios",
    badge: "Mensajería",
    icon: MessageSquare,
    summary:
      "Automatizá confirmaciones inmediatas y recordatorios 24h y 2h antes para eliminar las inasistencias en tu negocio.",
    steps: [
      {
        stepNumber: 1,
        taskTitle: "Personalizar las plantillas de mensajes",
        instruction:
          "Elegí qué mensaje querés editar (Confirmación Inmediata, Recordatorio 24h o 2h antes). Podés modificar el texto para adaptarlo al tono de tu negocio.",
        tip: "Usá los botones de variables dinámicas (+Nombre Cliente, +Hora Turno) para que cada mensaje salga personalizado sin escribir nada a mano.",
      },
      {
        stepNumber: 2,
        taskTitle: "Simular cómo lo recibe el cliente",
        instruction:
          "En la columna derecha tenés una maqueta de WhatsApp en vivo. Cada cambio que hacés en el texto se refleja al instante tal cual llegará al celular del cliente.",
      },
      {
        stepNumber: 3,
        taskTitle: "Copiar el mensaje de bienvenida para WhatsApp Business",
        instruction:
          "Al pie de la página tenés el recuadro con el mensaje de respuesta automática listo para copiar y pegar en tu WhatsApp Business oficial.",
      },
    ],
  },
  apariencia: {
    id: "apariencia",
    title: "Diseño & Apariencia de tu Página",
    badge: "Personalización",
    icon: Palette,
    summary:
      "Configurá el estilo visual, colores de marca, fotos reales, tipografías y enlaces directos para que tu portal de reservas luzca impecable.",
    steps: [
      {
        stepNumber: 1,
        taskTitle: "Estilos Profesionales",
        instruction:
          "Elegí uno de los 20 estilos preconfigurados para aplicar colores, fuentes y diseño en 1 clic.",
        tip: "Mirá el celular a la derecha para ver cómo cambia en tiempo real.",
        targetSelector: '[data-tour="tour-presets"]',
      },
      {
        stepNumber: 2,
        taskTitle: "Colores y Tipografía",
        instruction:
          "Ajustá tu color de marca exacto, fondo animado y tipografía de Google Fonts.",
        tip: "Podés alternar entre modo Claro u Oscuro según la identidad de tu local.",
        targetSelector: '[data-tour="tour-colors"]',
      },
      {
        stepNumber: 3,
        taskTitle: "Portada & Fotos",
        instruction:
          "Tocá esta pestaña o en Siguiente para ir a configurar la portada y logo de tu local.",
        tip: "Tamaño sugerido: Portada 1200 × 400 px y Logo 500 × 500 px.",
        targetSelector: '[data-tour="tab-fotos"]',
      },
      {
        stepNumber: 4,
        taskTitle: "Foto de Portada y Logo",
        instruction:
          "Cargá la portada de tu negocio, regulá el encuadre vertical y subí tu logo oficial.",
        tip: "Tamaño sugerido: Portada 1200 × 400 px (3:1) y Logo 500 × 500 px (1:1 fondo transparente).",
        targetSelector: '[data-tour="tour-cover-logo"]',
      },
      {
        stepNumber: 5,
        taskTitle: "Galería de Trabajos",
        instruction:
          "Subí fotos reales de tus cortes y trabajos para inspirar confianza y generar más reservas.",
        tip: "Las fotos reales de trabajos aumentan hasta un 40% las reservas de clientes nuevos.",
        targetSelector: '[data-tour="tour-gallery"]',
      },
      {
        stepNumber: 6,
        taskTitle: "Botones & Links",
        instruction:
          "Tocá esta pestaña o en Siguiente para ir a configurar tus botones y enlaces.",
        tip: "Podés conectar WhatsApp, Waze, Uber y redes sociales con 1 clic.",
        targetSelector: '[data-tour="tab-botones"]',
      },
      {
        stepNumber: 7,
        taskTitle: "Botones Personalizados Extras",
        instruction:
          "Configurá botones personalizados extras y enlaces directos para tus clientes.",
        tip: "En 'Estilo & Jerarquía' podés ordenar si mostrar primero los servicios o los enlaces.",
        targetSelector: '[data-tour="tour-buttons"]',
      },
      {
        stepNumber: 8,
        taskTitle: "Textos & Políticas",
        instruction:
          "Tocá esta pestaña o en Siguiente para ir a redactar tus textos y políticas.",
        tip: "Podés definir reglas claras de cancelación y anticipación de citas.",
        targetSelector: '[data-tour="tab-textos"]',
      },
      {
        stepNumber: 9,
        taskTitle: "Textos y Políticas Extras",
        instruction:
          "Configurá textos personalizados extras, slogan, redes y políticas de tu negocio.",
        tip: "Podés usar las políticas sugeridas para insertar reglas frecuentes con 1 clic.",
        targetSelector: '[data-tour="tour-texts"]',
      },
      {
        stepNumber: 10,
        taskTitle: "Guardar Cambios",
        instruction:
          "Tocá el botón verde arriba a la derecha para que los cambios se publiquen en tu enlace público.",
        tip: "Los cambios se aplican de inmediato en tu enlace público para todos los clientes.",
        targetSelector: '[data-tour="tour-save"]',
      },
    ],
  },
  equipo: {
    id: "equipo",
    title: "Equipo, Roles & Permisos",
    badge: "Colaboradores",
    icon: ShieldCheck,
    summary:
      "Invitá a tus colaboradores por correo para que ingresen con su cuenta de Google y configurá a qué información tienen acceso.",
    steps: [
      {
        stepNumber: 1,
        taskTitle: "Directorio de Colaboradores & Especialistas",
        instruction:
          "Administrá tu staff: barberos, estilistas, manicuristas y cajeros con sus porcentajes de comisión y horarios habituales.",
        tip: "Cada miembro del equipo tiene un color identificador para la agenda visual.",
        targetSelector: '[data-tour="equipo-header"]',
      },
      {
        stepNumber: 2,
        taskTitle: "Invitar a un Colaborador con Google",
        instruction:
          "Tocá '+ Invitar Colaborador'. Escribí su correo de Gmail y seleccioná su rol. Al confirmar, recibirá una invitación para ingresar directamente.",
        tip: "Podés definir de entrada el porcentaje de comisión pactado por turno.",
        targetSelector: '[data-tour="equipo-new-btn"]',
      },
      {
        stepNumber: 3,
        taskTitle: "Roles & Niveles de Acceso",
        instruction:
          "Diferenciá entre Dueño/Admin, Cajero/Recepción y Profesionales. Podés restringir que los colaboradores solo vean su propia agenda sin acceder a la facturación total.",
        tip: "Mantené las finanzas y comisiones del local protegidas.",
        targetSelector: '[data-tour="equipo-roles"]',
      },
      {
        stepNumber: 4,
        taskTitle: "Fichas de Personal & Permisos Detallados",
        instruction:
          "En cada tarjeta podés editar horarios, pausar temporalmente a un colaborador o ajustar permisos avanzados en cualquier momento.",
        tip: "Los cambios se guardan directamente en la base de datos SQL.",
        targetSelector: '[data-tour="equipo-list"]',
      },
    ],
  },
  transferencias: {
    id: "transferencias",
    title: "Transferencias Bancarias SIPAP",
    badge: "Pagos Online",
    icon: Receipt,
    summary:
      "Verificá comprobantes bancarios que envían tus clientes al señar o pagar sus turnos por transferencia SIPAP en Paraguay.",
    steps: [
      {
        stepNumber: 1,
        taskTitle: "Configurar tus datos de cuenta bancaria",
        instruction:
          "Cargá tu banco (Itaú, Continental, Ueno, etc.), número de cuenta, Cédula o RUC y titular para que el cliente reciba tus datos al reservar.",
      },
      {
        stepNumber: 2,
        taskTitle: "Revisar comprobantes pendientes de validación",
        instruction:
          "Cuando un cliente sube su comprobante bancario, aparece acá con el número de transacción y monto transferido.",
      },
      {
        stepNumber: 3,
        taskTitle: "Aprobar y confirmar el turno",
        instruction:
          "Al verificar en tu app bancaria que el dinero ingresó, tocá 'Aprobar'. La reserva pasa a confirmada y se envía el comprobante por WhatsApp.",
      },
    ],
  },
  extras: {
    id: "extras",
    title: "Kit de Marketing & Código QR",
    badge: "Difusión",
    icon: QrCode,
    summary:
      "Descargá carteles para imprimir, código QR para tu mostrador y materiales listos para colocar en vidrieras y redes sociales.",
    steps: [
      {
        stepNumber: 1,
        taskTitle: "Descargar tu Código QR en alta definición",
        instruction:
          "Hacé clic en 'Descargar QR'. Viene optimizado en alta resolución para colocar en la recepción, espejos o tarjetas personales.",
      },
      {
        stepNumber: 2,
        taskTitle: "Imprimir el cartel de mostrador",
        instruction:
          "El sistema te genera una hoja lista en formato A4 con las instrucciones 'Escaneá y Agendá tu Turno' con los colores de tu marca.",
      },
      {
        stepNumber: 3,
        taskTitle: "Copiar enlace corto para biografía de Instagram",
        instruction:
          "Usá el botón 'Copiar enlace' para pegarlo directo en el campo 'Sitio Web' de tu perfil de Instagram o en el link de TikTok.",
      },
    ],
  },
  configuracion: {
    id: "configuracion",
    title: "Configuración General del Negocio",
    badge: "Ajustes",
    icon: Settings,
    summary:
      "Establecé los horarios semanales de atención, número de contacto oficial y reglas de anticipación de reservas.",
    steps: [
      {
        stepNumber: 1,
        taskTitle: "Definir días y horarios de apertura",
        instruction:
          "Marcá qué días abrís (Lunes a Sábado) y los turnos de mañana y tarde. Los días desmarcados figurarán como cerrados en la web.",
      },
      {
        stepNumber: 2,
        taskTitle: "Configurar límite de anticipación",
        instruction:
          "Elegí con cuántos días de anticipación pueden reservar tus clientes (ej: máximo 15 días o 30 días) para tener previsibilidad.",
      },
      {
        stepNumber: 3,
        taskTitle: "Número oficial para notificaciones",
        instruction:
          "Ingresá el número de celular del negocio donde querés recibir las alertas de nuevas reservas y cancelaciones.",
      },
    ],
  },
  suscripcion: {
    id: "suscripcion",
    title: "Mi Suscripción & Plan Agendate",
    badge: "Planes & Soporte",
    icon: Crown,
    summary:
      "Consultá el estado de tu cuenta, consumo mensual de turnos y contactá a soporte técnico prioritario.",
    steps: [
      {
        stepNumber: 1,
        taskTitle: "Revisar el cupo de reservas del mes",
        instruction:
          "La barra de progreso te muestra cuántas reservas recibiste y cuánto cupo te queda en tu periodo de facturación actual.",
      },
      {
        stepNumber: 2,
        taskTitle: "Mejorar tu plan para turnos ilimitados",
        instruction:
          "Si estás creciendo y necesitás más colaboradores o reservas sin límite, podés pasar al plan PRO o VIP en cualquier momento.",
      },
      {
        stepNumber: 3,
        taskTitle: "Contactar a soporte prioritario vía WhatsApp",
        instruction:
          "Tocá el botón 'Chatear con Soporte' para recibir ayuda directa de nuestro equipo en Asunción por cualquier consulta.",
      },
    ],
  },
};

export default function GuidedTour() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const isTourOpen = useDashboardStore((s) => s.isTourOpen);
  const storeTourSectionKey = useDashboardStore((s) => s.tourSectionKey);
  const openTour = useDashboardStore((s) => s.openTour);
  const closeTour = useDashboardStore((s) => s.closeTour);

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [selectedSectionKey, setSelectedSectionKey] = useState<string>("inicio");
  const [showSectionPicker, setShowSectionPicker] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [searchFilter, setSearchFilter] = useState("");
  const [completedSections, setCompletedSections] = useState<string[]>([]);

  // Detect current dashboard section from URL
  const detectedSectionKey = useMemo(() => {
    if (!pathname) return "inicio";
    if (pathname.includes("/nueva-reserva")) return "nueva-reserva";
    if (pathname.includes("/calendario")) return "calendario";
    if (pathname.includes("/crm")) return "crm";
    if (pathname.includes("/clientes")) return "clientes";
    if (pathname.includes("/servicios")) return "servicios";
    if (pathname.includes("/productos")) return "productos";
    if (pathname.includes("/whatsapp")) return "whatsapp";
    if (pathname.includes("/comisiones")) return "comisiones";
    if (pathname.includes("/caja")) return "caja";
    if (pathname.includes("/fidelizacion")) return "fidelizacion";
    if (pathname.includes("/apariencia")) return "apariencia";
    if (pathname.includes("/equipo")) return "equipo";
    if (pathname.includes("/transferencias")) return "transferencias";
    if (pathname.includes("/extras")) return "extras";
    if (pathname.includes("/configuracion")) return "configuracion";
    if (pathname.includes("/suscripcion")) return "suscripcion";
    return "inicio";
  }, [pathname]);

  // Load completed sections from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("agendate_completed_tours");
      if (saved) {
        setCompletedSections(JSON.parse(saved));
      }
    } catch {
      // ignore
    }
  }, []);

  // Sync selected section when pathname or storeTourSectionKey changes
  useEffect(() => {
    if (storeTourSectionKey && ALL_SECTION_TOURS[storeTourSectionKey]) {
      setSelectedSectionKey(storeTourSectionKey);
    } else {
      setSelectedSectionKey(detectedSectionKey);
    }
    setCurrentStepIndex(0);
  }, [detectedSectionKey, storeTourSectionKey]);

  // Check URL triggers (?tour=start or ?tour=apariencia)
  useEffect(() => {
    const tourParam = searchParams.get("tour");
    if (tourParam) {
      if (ALL_SECTION_TOURS[tourParam]) {
        openTour(tourParam);
      } else {
        openTour(detectedSectionKey);
      }
      setCurrentStepIndex(0);
    }
  }, [searchParams, openTour, detectedSectionKey]);

  // Global custom event listener
  useEffect(() => {
    function handleOpenTourEvent(e: any) {
      const sec = e?.detail?.section || detectedSectionKey;
      openTour(sec);
      setCurrentStepIndex(0);
    }
    window.addEventListener("open-guided-tour", handleOpenTourEvent);
    return () => window.removeEventListener("open-guided-tour", handleOpenTourEvent);
  }, [detectedSectionKey, openTour]);

  // Auto-start welcome tour on first entry to the dashboard
  useEffect(() => {
    if (typeof window === "undefined") return;
    const hasSeenWelcome = localStorage.getItem("agendate_has_seen_welcome_tour");
    const isDashboardHome = pathname === "/dashboard" || pathname === "/dashboard/";
    if (!hasSeenWelcome && isDashboardHome) {
      const timer = setTimeout(() => {
        setSelectedSectionKey("inicio");
        setCurrentStepIndex(0);
        openTour("inicio");
        localStorage.setItem("agendate_has_seen_welcome_tour", "true");
      }, 750);
      return () => clearTimeout(timer);
    }
  }, [pathname, openTour]);

  const currentSection =
    ALL_SECTION_TOURS[selectedSectionKey] || ALL_SECTION_TOURS.inicio;
  const currentStep =
    currentSection.steps[currentStepIndex] || currentSection.steps[0];
  const IconComponent = currentSection.icon;

  // Window dimensions for dynamic positioning
  const [windowDimensions, setWindowDimensions] = useState({ width: 1200, height: 800 });
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setWindowDimensions({ width: window.innerWidth, height: window.innerHeight });
      const handleResize = () => {
        setWindowDimensions({ width: window.innerWidth, height: window.innerHeight });
      };
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, []);

  const isTransitioningRef = useRef(false);

  // Helper to determine the tab required for any step
  const getTabForStep = useCallback((step?: SectionStep): "estilos" | "fotos" | "botones" | "textos" | null => {
    if (!step?.targetSelector) return null;
    const sel = step.targetSelector;
    if (sel.includes("tab-fotos") || sel.includes("tour-presets") || sel.includes("tour-colors")) return "estilos";
    if (sel.includes("tab-botones") || sel.includes("tour-cover-logo") || sel.includes("tour-gallery")) return "fotos";
    if (sel.includes("tab-textos") || sel.includes("tour-buttons")) return "botones";
    if (sel.includes("tour-texts")) return "textos";
    return null;
  }, []);

  // Update target rect with automatic tab switching and dimension verification
  const updateTargetRect = useCallback(() => {
    if (!currentStep?.targetSelector) {
      setTargetRect(null);
      return;
    }

    // Auto-switch tabs if required for this step
    const neededTab = getTabForStep(currentStep);
    if (neededTab && typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("agendate-switch-tab", {
          detail: {
            tab: neededTab,
            subTab: currentStep.targetSelector.includes("tour-buttons") ? "links" : undefined,
          },
        })
      );
    }

    let retriesLeft = 20;
    const checkElement = () => {
      try {
        const el = document.querySelector(currentStep.targetSelector!) as HTMLElement | null;
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.width > 0 && rect.height > 0) {
            const isFixedNav =
              currentStep.targetSelector?.includes("sidebar") ||
              currentStep.targetSelector?.includes("header") ||
              currentStep.targetSelector === "aside";

            if (isFixedNav) {
              window.scrollTo({ top: 0, behavior: "smooth" });
            } else {
              const elDocTop = window.scrollY + rect.top;
              const targetScrollY = Math.max(
                0,
                Math.round(elDocTop + rect.height / 2 - window.innerHeight / 2)
              );
              window.scrollTo({ top: targetScrollY, behavior: "smooth" });
            }
            const syncRect = () => {
              const fresh = el.getBoundingClientRect();
              if (fresh.width > 0 && fresh.height > 0) {
                setTargetRect(fresh);
              }
            };
            syncRect();
            setTimeout(syncRect, 60);
            setTimeout(syncRect, 150);
            setTimeout(syncRect, 300);
            setTimeout(syncRect, 500);
            setTimeout(syncRect, 750);
            return;
          }
        }
        if (retriesLeft > 0) {
          retriesLeft--;
          setTimeout(checkElement, 50);
        } else {
          setTargetRect(null);
        }
      } catch {
        setTargetRect(null);
      }
    };

    setTimeout(checkElement, 30);
  }, [currentStep, getTabForStep]);

  // Recalculate spotlight whenever tour opens or step changes (60fps requestAnimationFrame tracking on scroll)
  useEffect(() => {
    if (!isTourOpen) {
      setTargetRect(null);
      return;
    }

    updateTargetRect();

    let animationFrameId: number | null = null;
    const handleReposition = () => {
      if (animationFrameId !== null) return;
      animationFrameId = requestAnimationFrame(() => {
        animationFrameId = null;
        if (!currentStep?.targetSelector) return;
        try {
          const el = document.querySelector(currentStep.targetSelector) as HTMLElement | null;
          if (el) {
            const r = el.getBoundingClientRect();
            if (r.width > 0 && r.height > 0) {
              setTargetRect(r);
            }
          }
        } catch {}
      });
    };

    window.addEventListener("resize", handleReposition);
    window.addEventListener("scroll", handleReposition, { passive: true });
    return () => {
      if (animationFrameId !== null) cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleReposition);
      window.removeEventListener("scroll", handleReposition);
    };
  }, [isTourOpen, currentStepIndex, currentStep, updateTargetRect]);

  // Smooth scroll and spotlight element on the page if targetSelector exists
  const scrollToTarget = useCallback((selector?: string) => {
    if (!selector) return;
    try {
      const el = document.querySelector(selector) as HTMLElement | null;
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "nearest" });
        setTimeout(() => {
          const rect = el.getBoundingClientRect();
          if (rect.width > 0 && rect.height > 0) {
            setTargetRect(rect);
          }
        }, 150);
      }
    } catch {
      // ignore selector errors
    }
  }, []);

  const markSectionCompleted = useCallback((secId: string) => {
    if (!completedSections.includes(secId)) {
      const updated = [...completedSections, secId];
      setCompletedSections(updated);
      try {
        localStorage.setItem("agendate_completed_tours", JSON.stringify(updated));
      } catch {
        // ignore
      }
    }
  }, [completedSections]);

  // Reset tab to first tab ('estilos') on finish or close so user starts customizing fresh
  const handleClose = useCallback(() => {
    setShowExitConfirm(false);
    if (selectedSectionKey === "apariencia" && typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("agendate-switch-tab", { detail: { tab: "estilos" } }));
    }
    closeTour();
  }, [selectedSectionKey, closeTour]);

  // Debounced navigation to prevent rapid-click / enter spam glitches
  const handleNext = useCallback(() => {
    if (isTransitioningRef.current) return;
    isTransitioningRef.current = true;
    setTimeout(() => {
      isTransitioningRef.current = false;
    }, 220);

    if (currentStepIndex < currentSection.steps.length - 1) {
      const nextIdx = currentStepIndex + 1;
      const nextStep = currentSection.steps[nextIdx];
      const targetTab = getTabForStep(nextStep);
      if (targetTab && typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("agendate-switch-tab", { detail: { tab: targetTab } }));
      }
      setCurrentStepIndex(nextIdx);
    } else {
      markSectionCompleted(currentSection.id);
      handleClose();
    }
  }, [currentStepIndex, currentSection, getTabForStep, handleClose, markSectionCompleted]);

  const handlePrev = useCallback(() => {
    if (isTransitioningRef.current) return;
    isTransitioningRef.current = true;
    setTimeout(() => {
      isTransitioningRef.current = false;
    }, 220);

    if (currentStepIndex > 0) {
      const prevIdx = currentStepIndex - 1;
      const prevStep = currentSection.steps[prevIdx];
      const targetTab = getTabForStep(prevStep);
      if (targetTab && typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("agendate-switch-tab", { detail: { tab: targetTab } }));
      }
      setCurrentStepIndex(prevIdx);
    }
  }, [currentStepIndex, currentSection, getTabForStep]);

  // Keyboard navigation: Enter and ArrowRight advance, ArrowLeft goes back, Escape opens exit confirm
  useEffect(() => {
    if (!isTourOpen) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Space"].includes(e.code)) {
        const target = e.target as HTMLElement | null;
        if (target?.tagName !== "INPUT" && target?.tagName !== "TEXTAREA") {
          e.preventDefault();
        }
      }
      if (e.key === "Escape") {
        setShowExitConfirm((prev) => !prev);
      } else if (e.key === "ArrowRight" || e.key === "Enter") {
        if (!showExitConfirm) {
          e.preventDefault();
          handleNext();
        }
      } else if (e.key === "ArrowLeft") {
        if (!showExitConfirm) {
          e.preventDefault();
          handlePrev();
        }
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isTourOpen, showExitConfirm, handleNext, handlePrev]);

  // Lock manual user scrolling while tour is active
  useEffect(() => {
    if (!isTourOpen) return;

    const preventWheel = (e: WheelEvent) => {
      const target = e.target as HTMLElement | null;
      if (target?.closest(".guided-tour-scrollable")) return;
      e.preventDefault();
    };

    const preventTouch = (e: TouchEvent) => {
      const target = e.target as HTMLElement | null;
      if (target?.closest(".guided-tour-scrollable")) return;
      e.preventDefault();
    };

    window.addEventListener("wheel", preventWheel, { passive: false });
    window.addEventListener("touchmove", preventTouch, { passive: false });

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("wheel", preventWheel);
      window.removeEventListener("touchmove", preventTouch);
      document.body.style.overflow = prevOverflow;
    };
  }, [isTourOpen]);

  // Elevate active targeted tab button ONLY when the current step explicitly targets it
  useEffect(() => {
    if (!isTourOpen || !currentStep?.targetSelector) return;
    if (!currentStep.targetSelector.startsWith('[data-tour="tab-')) return;

    try {
      const el = document.querySelector(currentStep.targetSelector) as HTMLElement | null;
      if (el) {
        const prevZIndex = el.style.zIndex;
        const prevPosition = el.style.position;
        const prevPointerEvents = el.style.pointerEvents;
        const prevBg = el.style.backgroundColor;
        const prevRadius = el.style.borderRadius;
        const prevShadow = el.style.boxShadow;

        if (!el.style.position || el.style.position === "static") {
          el.style.position = "relative";
        }
        el.style.zIndex = "99995";
        el.style.pointerEvents = "auto";
        const isDark = document.documentElement.classList.contains("dark");
        el.style.backgroundColor = isDark ? "#0f172a" : "#ffffff";
        el.style.borderRadius = "12px";
        el.style.boxShadow = "0 4px 20px rgba(0,0,0,0.18)";

        const handleTabClick = () => {
          let tabToSwitch: "fotos" | "botones" | "textos" | null = null;
          if (currentStep.targetSelector?.includes("tab-fotos")) tabToSwitch = "fotos";
          else if (currentStep.targetSelector?.includes("tab-botones")) tabToSwitch = "botones";
          else if (currentStep.targetSelector?.includes("tab-textos")) tabToSwitch = "textos";

          if (tabToSwitch && typeof window !== "undefined") {
            window.dispatchEvent(new CustomEvent("agendate-switch-tab", { detail: { tab: tabToSwitch } }));
          }

          setTimeout(() => {
            handleNext();
          }, 100);
        };
        el.addEventListener("click", handleTabClick);

        return () => {
          el.style.zIndex = prevZIndex;
          el.style.position = prevPosition;
          el.style.pointerEvents = prevPointerEvents;
          el.style.backgroundColor = prevBg;
          el.style.borderRadius = prevRadius;
          el.style.boxShadow = prevShadow;
          el.removeEventListener("click", handleTabClick);
        };
      }
    } catch {}
  }, [isTourOpen, currentStepIndex, currentStep, handleNext]);

  const handleSelectSection = (key: string) => {
    setSelectedSectionKey(key);
    setCurrentStepIndex(0);
    setShowSectionPicker(false);
  };

  const filteredSections = useMemo(() => {
    const list = Object.values(ALL_SECTION_TOURS);
    if (!searchFilter.trim()) return list;
    const q = searchFilter.toLowerCase();
    return list.filter(
      (s) => s.title.toLowerCase().includes(q) || s.badge.toLowerCase().includes(q)
    );
  }, [searchFilter]);

  // Smart Card positioning: Keep the card directly adjacent ("pegado") to the illuminated target
  const cardWidth = Math.min(windowDimensions.width - 32, 370);
  const cardHeightEstimate = 185;

  let cardStyle: React.CSSProperties = {};

  if (!targetRect) {
    cardStyle = {
      position: "fixed",
      left: Math.max(16, (windowDimensions.width - cardWidth) / 2),
      bottom: 24,
      width: cardWidth,
      zIndex: 99999,
    };
  } else {
    const W = windowDimensions.width;
    const H = windowDimensions.height;
    const isMobile = W < 768;

    if (isMobile) {
      cardStyle = {
        position: "fixed",
        left: 16,
        right: 16,
        bottom: 16,
        width: "auto",
        maxWidth: "calc(100vw - 32px)",
        zIndex: 99999,
      };
    } else {
      const gap = 16;

      // 4 adjacent candidate directions relative to targetRect:
      const candRight = {
        l: targetRect.right + gap,
        t: Math.max(84, Math.min(H - cardHeightEstimate - 20, targetRect.top)),
        fits: targetRect.right + gap + cardWidth <= W - 20,
      };

      const candBelow = {
        l: Math.max(20, Math.min(W - cardWidth - 20, targetRect.left)),
        t: targetRect.bottom + gap,
        fits: targetRect.bottom + gap + cardHeightEstimate <= H - 20,
      };

      const candLeft = {
        l: targetRect.left - cardWidth - gap,
        t: Math.max(84, Math.min(H - cardHeightEstimate - 20, targetRect.top)),
        fits: targetRect.left - cardWidth - gap >= 20,
      };

      const candAbove = {
        l: Math.max(20, Math.min(W - cardWidth - 20, targetRect.left)),
        t: targetRect.top - cardHeightEstimate - gap,
        fits: targetRect.top - cardHeightEstimate - gap >= 84,
      };

      let chosen: { l: number; t: number };

      // 1. If target is on the far right (like Save button in top-right):
      if (targetRect.left > W * 0.6) {
        if (candBelow.fits) {
          chosen = {
            l: Math.max(20, Math.min(W - cardWidth - 20, targetRect.right - cardWidth)),
            t: candBelow.t,
          };
        } else if (candLeft.fits) {
          chosen = { l: candLeft.l, t: candLeft.t };
        } else {
          chosen = { l: candBelow.l, t: candBelow.t };
        }
      }
      // 2. Main content and tab bar on the left: prioritize right-adjacent placement (candRight)
      else if (candRight.fits) {
        chosen = { l: candRight.l, t: candRight.t };
      }
      // 3. Otherwise try below with comfortable margin
      else if (candBelow.fits) {
        chosen = { l: candBelow.l, t: candBelow.t };
      }
      // 4. Try left
      else if (candLeft.fits) {
        chosen = { l: candLeft.l, t: candLeft.t };
      }
      // 5. Try above
      else if (candAbove.fits) {
        chosen = { l: candAbove.l, t: candAbove.t };
      }
      // 6. Safe fallback: right of target or clamped safely
      else {
        chosen = {
          l: Math.max(20, Math.min(W - cardWidth - 20, targetRect.right + gap)),
          t: Math.max(84, Math.min(H - cardHeightEstimate - 20, targetRect.top)),
        };
      }

      cardStyle = {
        position: "fixed",
        left: chosen.l,
        top: chosen.t,
        width: cardWidth,
        maxWidth: "calc(100vw - 32px)",
        maxHeight: "calc(100vh - 32px)",
        zIndex: 99999,
        transition: "left 300ms cubic-bezier(0.25, 1, 0.5, 1), top 300ms cubic-bezier(0.25, 1, 0.5, 1)",
      };
    }
  }

  return (
    <>
      {/* Floating launcher button in bottom right:
          When tour is NOT active: "Visita Guiada" button.
          When tour IS active: "Salir de Visita Guiada" button with confirmation. */}
      {!isTourOpen ? (
        <button
          type="button"
          onClick={() => {
            setSelectedSectionKey(detectedSectionKey);
            setCurrentStepIndex(0);
            openTour(detectedSectionKey);
          }}
          className={`fixed bottom-5 right-5 z-40 flex items-center gap-2.5 rounded-full px-4 py-2.5 text-xs font-bold backdrop-blur-md transition-all hover:scale-105 active:scale-95 group cursor-pointer ${
            completedSections.includes(detectedSectionKey)
              ? "border border-slate-200/90 dark:border-white/10 bg-white/95 dark:bg-slate-900/95 text-slate-800 dark:text-white shadow-md hover:border-primary"
              : "border-2 border-amber-400/80 bg-gradient-to-r from-amber-500/20 via-yellow-400/15 to-amber-500/25 text-amber-950 dark:text-amber-100 shadow-[0_0_30px_rgba(245,158,11,0.5)] ring-2 ring-amber-400/30 animate-pulse"
          }`}
          title="Abrir guía paso a paso y tutoriales de esta sección"
        >
          <div
            className={`flex h-5 w-5 items-center justify-center rounded-full transition ${
              completedSections.includes(detectedSectionKey)
                ? "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white"
                : "bg-amber-500 text-white shadow-xs"
            }`}
          >
            <Sparkles className="h-3 w-3" />
          </div>
          <span>Visita Guiada</span>
          {completedSections.includes(detectedSectionKey) ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
          ) : (
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
          )}
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setShowExitConfirm(true)}
          className="fixed bottom-5 right-5 z-[99999] flex items-center gap-2 rounded-full px-4 py-2.5 text-xs font-bold backdrop-blur-md transition-all hover:scale-105 active:scale-95 cursor-pointer border border-rose-500/50 bg-rose-600 hover:bg-rose-700 text-white shadow-xl shadow-rose-950/40"
          title="Salir de la visita guiada"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span>Salir de Visita Guiada</span>
        </button>
      )}

      {/* Interactive Guided Tour Spotlight & Walkthrough */}
      <AnimatePresence>
        {isTourOpen && (
          <div className="fixed inset-0 z-[99990]">
            {/* SVG Mask: Dims the screen and cuts out ONLY the specific target zone without lagging transitions on scroll */}
            <svg className="fixed inset-0 h-full w-full pointer-events-none z-[99991]">
              <defs>
                <mask id="tour-spotlight-mask">
                  <rect width="100%" height="100%" fill="white" />
                  {targetRect && (
                    <rect
                      x={Math.max(0, targetRect.left - 8)}
                      y={Math.max(0, targetRect.top - 6)}
                      width={targetRect.width + 16}
                      height={targetRect.height + 12}
                      rx="16"
                      fill="black"
                    />
                  )}
                </mask>
              </defs>
              <rect
                width="100%"
                height="100%"
                fill="rgba(3, 7, 18, 0.78)"
                mask="url(#tour-spotlight-mask)"
              />
            </svg>

            {/* Dark blocking backdrop: Blocks all background clicking; does NOT close the tour on click */}
            <div
              className="fixed inset-0 z-[99992] pointer-events-auto cursor-default"
              onClick={(e) => {
                e.stopPropagation();
              }}
            />

            {/* Clean, sharp spotlight ring over highlighted element (Zero blurry glow, crisp border) */}
            {targetRect && (
              <div
                style={{
                  position: "fixed",
                  left: Math.max(0, targetRect.left - 8),
                  top: Math.max(0, targetRect.top - 6),
                  width: targetRect.width + 16,
                  height: targetRect.height + 12,
                }}
                className="pointer-events-none z-[99993] rounded-2xl ring-2 ring-white/90 dark:ring-primary/80"
              />
            )}

            {/* Floating Popover / Tooltip Card positioned in a free, non-overlapping zone (Always on top: z-[99999]) */}
            <div
              style={cardStyle}
              className="z-[99999] pointer-events-auto"
            >
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
                className="relative w-full overflow-visible rounded-3xl border border-slate-200/90 dark:border-white/10 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl p-4 sm:p-5 shadow-2xl flex flex-col ring-1 ring-black/5 dark:ring-white/10"
              >
                {showExitConfirm ? (
                  <div className="py-2 px-1 text-center space-y-3">
                    <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-500/15 text-rose-500 ring-1 ring-rose-500/20">
                      <LogOut className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        ¿Seguro que querés salir de la visita guiada?
                      </h4>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        Podés retomarla en cualquier momento desde el botón inferior derecho.
                      </p>
                    </div>
                    <div className="pt-2 flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => setShowExitConfirm(false)}
                        className="flex-1 rounded-xl border border-slate-200 dark:border-white/10 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                      >
                        Continuar guía
                      </button>
                      <button
                        type="button"
                        onClick={() => handleClose()}
                        className="flex-1 rounded-xl bg-rose-600 hover:bg-rose-500 text-white px-3.5 py-2 text-xs font-bold shadow-md shadow-rose-900/20 transition cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <LogOut className="h-3.5 w-3.5" />
                        <span>Sí, salir</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Header: Section Selector Dropdown + Simplified Step Counter (1/8) + Close Button */}
                    <div className="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-white/5 pb-3">
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setShowSectionPicker(!showSectionPicker)}
                          className="flex items-center gap-2 rounded-xl bg-slate-100 dark:bg-slate-800 px-3 py-1.5 text-xs font-bold text-slate-800 dark:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer"
                        >
                          <IconComponent className="h-4 w-4 text-primary shrink-0" />
                          <span className="truncate max-w-[190px] sm:max-w-xs">{currentSection.title}</span>
                          <ChevronDown
                            className={`h-3.5 w-3.5 text-slate-400 transition-transform ${
                              showSectionPicker ? "rotate-180" : ""
                            }`}
                          />
                        </button>

                        {/* Dropdown to switch sections across ALL 18 pages */}
                        {showSectionPicker && (
                          <div className="absolute left-0 top-full mt-2 w-80 max-h-96 overflow-y-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 shadow-2xl z-30 space-y-1">
                            <div className="relative mb-2">
                              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                              <input
                                type="text"
                                placeholder="Buscar sección..."
                                value={searchFilter}
                                onChange={(e) => setSearchFilter(e.target.value)}
                                className="w-full pl-8 pr-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs outline-none focus:border-primary"
                              />
                            </div>

                            <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                              Elegí qué sección querés aprender:
                            </div>

                            {filteredSections.map((sec) => {
                              const SecIcon = sec.icon;
                              const isSelected = sec.id === selectedSectionKey;
                              const isDone = completedSections.includes(sec.id);
                              return (
                                <button
                                  key={sec.id}
                                  type="button"
                                  onClick={() => handleSelectSection(sec.id)}
                                  className={`w-full flex items-center justify-between rounded-xl px-2.5 py-1.5 text-left text-xs font-semibold transition cursor-pointer ${
                                    isSelected
                                      ? "bg-primary text-white"
                                      : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                                  }`}
                                >
                                  <div className="flex items-center gap-2 truncate">
                                    <SecIcon className="h-3.5 w-3.5 shrink-0" />
                                    <span className="truncate">{sec.title}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    {isDone && !isSelected && (
                                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                                    )}
                                    {isSelected && <Check className="h-3.5 w-3.5 text-white" />}
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-primary/10 dark:bg-primary/20 px-2.5 py-0.5 text-xs font-black text-primary">
                          {currentStepIndex + 1}/{currentSection.steps.length}
                        </span>
                      </div>
                    </div>

                    {/* Step Progress Indicators */}
                    <div className="flex items-center gap-1.5 my-3">
                      {currentSection.steps.map((s, idx) => (
                        <button
                          key={s.stepNumber}
                          type="button"
                          onClick={() => setCurrentStepIndex(idx)}
                          className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                            idx === currentStepIndex
                              ? "w-8 bg-primary"
                              : idx < currentStepIndex
                              ? "w-3 bg-primary/50"
                              : "w-2 bg-slate-200 dark:bg-slate-800"
                          }`}
                          title={`Paso ${idx + 1}: ${s.taskTitle}`}
                        />
                      ))}
                    </div>

                    {/* Task Content Card */}
                    <div className="rounded-2xl border border-slate-200/80 dark:border-white/5 bg-slate-50/80 dark:bg-slate-800/50 p-3.5 space-y-2 overflow-visible">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                          {currentStep.taskTitle}
                        </h4>

                        {/* Practical Tip Icon with Pure Hover Tooltip (Zero space wasted, strictly on hover) */}
                        {currentStep.tip && (
                          <div className="relative group/tip shrink-0">
                            <button
                              type="button"
                              className="flex items-center justify-center h-6 w-6 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 hover:bg-amber-500/25 border border-amber-500/30 transition-all cursor-pointer shadow-2xs"
                              aria-label="Ver consejo práctico"
                            >
                              <Lightbulb className="h-3.5 w-3.5 text-amber-500" />
                            </button>

                            {/* Floating Tooltip: ONLY visible on hover */}
                            <div className="pointer-events-none absolute right-0 bottom-full mb-2 w-72 sm:w-80 rounded-2xl bg-slate-950 text-white p-3 text-xs shadow-2xl opacity-0 scale-95 group-hover/tip:opacity-100 group-hover/tip:scale-100 transition-all duration-150 ease-out z-[100000] border border-amber-400/50">
                              <div className="flex items-start gap-2.5">
                                <Lightbulb className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                                <div>
                                  <span className="font-bold text-amber-300 text-[11px] block mb-0.5">
                                    Consejo práctico:
                                  </span>
                                  <p className="text-slate-200 leading-relaxed text-[11.5px] font-medium">
                                    {currentStep.tip}
                                  </p>
                                </div>
                              </div>
                              {/* Triangle arrow pointing down */}
                              <div className="absolute top-full right-2.5 -mt-1 border-4 border-transparent border-t-slate-950" />
                            </div>
                          </div>
                        )}
                      </div>

                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                        {currentStep.instruction}
                      </p>
                    </div>

                    {/* Footer navigation */}
                    <div className="mt-4 flex items-center justify-between pt-1">
                      {currentStepIndex > 0 ? (
                        <button
                          type="button"
                          onClick={handlePrev}
                          className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                        >
                          <ArrowLeft className="h-3.5 w-3.5" />
                          <span>Anterior</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setShowExitConfirm(true)}
                          className="text-xs font-semibold text-rose-500 hover:text-rose-600 hover:underline cursor-pointer flex items-center gap-1"
                        >
                          <LogOut className="h-3 w-3" />
                          <span>Salir de la guía</span>
                        </button>
                      )}

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleNext}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-primary/25 hover:brightness-110 active:scale-95 transition cursor-pointer"
                        >
                          <span>
                            {currentStepIndex === currentSection.steps.length - 1
                              ? "¡Entendido, tarea completada!"
                              : "Siguiente tarea"}
                          </span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
