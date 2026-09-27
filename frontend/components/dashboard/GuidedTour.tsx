"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
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
        taskTitle: "Consultar las citas y turnos de hoy",
        instruction:
          "Mirá la lista de próximos turnos en la tarjeta principal. Podés ver el nombre del cliente, servicio solicitado, hora exacta y profesional asignado.",
        tip: "Tocá cualquier turno para ver los detalles completos del cliente o marcarlo como atendido.",
        targetSelector: ".main-content",
      },
      {
        stepNumber: 2,
        taskTitle: "Compartir tu enlace de reservas oficial",
        instruction:
          "Arriba a la derecha tenés el botón 'Ver mi página'. Copiá ese enlace (agendate.py/tunegocio) y pegalo en la biografía de tu Instagram o en la respuesta automática de WhatsApp.",
        tip: "El 70% de las reservas se hacen fuera de horario comercial mientras dormís.",
        targetSelector: "header",
      },
      {
        stepNumber: 3,
        taskTitle: "Monitorear la facturación del mes y ocupación",
        instruction:
          "Las tarjetas de métricas te muestran en tiempo real cuánto facturó tu negocio en Guaraníes y la tasa de ocupación de tus sillones.",
        tip: "Hacé clic en cualquier métrica para ver el desglose en Caja o Comisiones.",
      },
      {
        stepNumber: 4,
        taskTitle: "Cambiar de rol o colaborador (Modo Dueño vs Empleado)",
        instruction:
          "En el selector superior podés simular cómo ve el sistema un barbero, un estilista o la recepcionista para verificar que sus permisos estén bien configurados.",
        targetSelector: "header select",
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
        taskTitle: "Cómo agendar un turno manual (mostrador o teléfono)",
        instruction:
          "Hacé clic en el botón '+ Nuevo Turno' o tocá directamente cualquier horario libre en la cuadrícula del calendario. Seleccioná el cliente, el servicio y el profesional.",
        tip: "Si es un cliente nuevo, escribí su nombre y número; el sistema lo registrará automáticamente sin pasos extra.",
      },
      {
        stepNumber: 2,
        taskTitle: "Filtrar por profesional del local",
        instruction:
          "Usá el selector de profesionales arriba para ver la agenda individual de cada barbero o estilista, o mirá la agenda combinada de todo el local.",
        tip: "Cada profesional tiene un color propio para identificar sus citas de un vistazo rápido.",
      },
      {
        stepNumber: 3,
        taskTitle: "Mover o reprogramar una cita",
        instruction:
          "Hacé clic sobre cualquier turno ya agendado para abrir sus detalles y cambiar la hora, el día o el profesional asignado en segundos.",
      },
      {
        stepNumber: 4,
        taskTitle: "Bloquear horarios libres o almuerzos",
        instruction:
          "Si un profesional sale a almorzar o tiene una urgencia, tocá el horario correspondiente y seleccioná 'Bloquear Horario'. Así ningún cliente podrá reservar en ese intervalo.",
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
        taskTitle: "Seleccionar o crear al cliente",
        instruction:
          "Escribí el nombre o número de teléfono. Si ya vino antes, sus datos aparecerán solos; si es nuevo, se creará su ficha al instante.",
      },
      {
        stepNumber: 2,
        taskTitle: "Elegir el servicio y profesional",
        instruction:
          "Marcá el servicio que solicita (ej: Corte + Barba). El sistema calcula automáticamente la duración en minutos y el precio en Guaraníes.",
      },
      {
        stepNumber: 3,
        taskTitle: "Elegir fecha y horario disponible",
        instruction:
          "El sistema solo te mostrará los horarios realmente libres del profesional seleccionado, evitando que se superpongan citas.",
      },
      {
        stepNumber: 4,
        taskTitle: "Confirmar y disparar WhatsApp",
        instruction:
          "Tocá 'Confirmar Reserva'. El turno se guardará en la agenda y el cliente recibirá su confirmación oficial con el enlace a su calendario.",
        tip: "Podés marcar si el cliente ya pagó una seña por SIPAP o pagará al finalizar.",
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
    badge: "Historial VIP",
    icon: Users,
    summary:
      "Guardá las fórmulas técnicas de tinte, preferencias y notas privadas de cada cliente para brindar una atención personalizada.",
    steps: [
      {
        stepNumber: 1,
        taskTitle: "Buscar rápidamente a un cliente",
        instruction:
          "Escribí en la barra superior el nombre, número de teléfono o fórmula técnica. El buscador filtra en tiempo real entre todos tus clientes.",
      },
      {
        stepNumber: 2,
        taskTitle: "Ver y editar la Ficha Técnica Privada",
        instruction:
          "Tocá el botón 'Ver Ficha Técnica' en cualquier cliente. Podés anotar tonos de colorimetría, volúmenes de oxidante, alergias o cómo prefiere su café.",
        tip: "La ficha técnica es privada y solo tu equipo puede verla; los clientes no tienen acceso a estas notas.",
      },
      {
        stepNumber: 3,
        taskTitle: "Galería de fotos de antes y después",
        instruction:
          "En la ficha podés subir fotos de los trabajos realizados a ese cliente para tener registro de su evolución de corte o color.",
      },
      {
        stepNumber: 4,
        taskTitle: "Compartir la Tarjeta Digital VIP",
        instruction:
          "Tocá el ícono de la estrella dorada para abrir su tarjeta digital interactiva con sus puntos de fidelización acumulados.",
      },
    ],
  },
  servicios: {
    id: "servicios",
    title: "Servicios, Precios & Profesionales",
    badge: "Menú & Tarifas",
    icon: Scissors,
    summary:
      "Definí tu menú de servicios con precios en Guaraníes, tiempos de atención y los porcentajes de comisión de tu equipo.",
    steps: [
      {
        stepNumber: 1,
        taskTitle: "Agregar un nuevo servicio al menú",
        instruction:
          "Hacé clic en '+ Nuevo Servicio'. Ingresá el nombre (ej: Balayage, Corte Degradé), elegí la categoría, duración en minutos y el precio en Gs.",
        tip: "Definir bien la duración evita que dos turnos se pisen en el calendario.",
      },
      {
        stepNumber: 2,
        taskTitle: "Compartir enlace directo a un servicio específico",
        instruction:
          "En cada tarjeta de servicio tenés el botón 'Compartir Link'. Al enviarlo por WhatsApp, el cliente entra directamente con ese servicio pre-seleccionado.",
      },
      {
        stepNumber: 3,
        taskTitle: "Configurar comisiones del personal",
        instruction:
          "Pasá a la pestaña 'Equipo & Profesionales'. Podés editar el porcentaje de comisión de cada persona (ej: 50% o 40%) y copiar su enlace de turnos individual.",
        tip: "Los colaboradores pueden compartir su propio enlace en sus historias de Instagram para llenar su agenda.",
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
        taskTitle: "Registrar un cobro o ingreso",
        instruction:
          "Tocá '+ Nuevo Movimiento'. Seleccioná si fue cobro de turno, propina o venta de producto, ingresá el monto en Gs. y elegí el método de pago.",
      },
      {
        stepNumber: 2,
        taskTitle: "Controlar el desglose por medio de pago",
        instruction:
          "Las tarjetas de balance arriba te separan exactamente cuánto tenés en Efectivo en mano, cuánto entró por SIPAP y cuánto por tarjeta.",
        tip: "Así el arqueo al final del día coincide al 100% con tu extracto bancario.",
      },
      {
        stepNumber: 3,
        taskTitle: "Realizar el arqueo y cierre del día",
        instruction:
          "Revisá el total recaudado del día contra el dinero físico en la gaveta y confirmá el cierre para dejar la caja lista para mañana.",
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
      "Elegí el estilo visual, colores de marca, fotos y enlaces de contacto para que tu página de reservas luzca profesional y única.",
    steps: [
      {
        stepNumber: 1,
        taskTitle: "Elegir un estilo listo en 1 clic",
        instruction:
          "En la pestaña 'Estilos Listos', seleccioná entre los 12 diseños profesionales (Barbería Clásica, Salón & Estética, Lujo VIP o Moderno). Al hacer clic, colores, fuentes y fondos se configuran solos.",
        tip: "Mirá el celular a la derecha para ver cómo queda en tiempo real antes de guardar.",
        targetSelector: '[data-tour="tour-presets"]',
      },
      {
        stepNumber: 2,
        taskTitle: "Ajustar colores y modo Claro/Oscuro",
        instruction:
          "Podés alternar entre modo Claro (ideal para salones luminosos y estéticas) u Oscuro (ideal para barberías premium), y afinar tu color primario exacto.",
        targetSelector: '[data-tour="tour-colors"]',
      },
      {
        stepNumber: 3,
        taskTitle: "Cargar logo y fotos de portada",
        instruction:
          "En la sección de fotos podés ingresar el logo de tu local, foto de portada y fotos reales de cortes o trabajos para tu galería.",
        tip: "Podés usar los botones de fotos de ejemplo para probar cómo queda de inmediato.",
        targetSelector: '[data-tour="tour-photos"]',
      },
      {
        stepNumber: 4,
        taskTitle: "Agregar botones directos (Uber, Waze, WhatsApp)",
        instruction:
          "En 'Botones & Enlaces' podés agregar accesos rápidos estilo Linktree para que tus clientes pidan un Uber directo al local, abran el mapa o te escriban.",
        targetSelector: '[data-tour="tour-buttons"]',
      },
      {
        stepNumber: 5,
        taskTitle: "CRÍTICO: Tocar 'Guardar Cambios'",
        instruction:
          "Cuando estés conforme con la previsualización del celular, tocá el botón verde 'Guardar Cambios' arriba a la derecha. Tus clientes verán la nueva imagen al instante.",
        tip: "Si no tocás 'Guardar Cambios', los cambios solo quedarán en borrador y no se verán en tu link público.",
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
        taskTitle: "Invitar a un colaborador con Google",
        instruction:
          "Tocá '+ Invitar Colaborador'. Escribí su correo de Gmail y seleccioná su rol. Al confirmar, recibirá una invitación directa en su bandeja de entrada.",
      },
      {
        stepNumber: 2,
        taskTitle: "Personalizar permisos por persona",
        instruction:
          "Podés activar o desactivar permisos individuales: ver finanzas de la empresa, cobrar en caja, ver fórmulas técnicas de clientes o modificar precios.",
        tip: "Los barberos o estilistas pueden tener acceso solo a su propia agenda sin ver los números totales de la caja del dueño.",
      },
      {
        stepNumber: 3,
        taskTitle: "Probar la vista de cada rol",
        instruction:
          "Arriba tenés el selector de previsualización para comprobar exactamente qué ve un Dueño vs qué ve un Colaborador en el sistema.",
      },
    ],
  },
  "bloquear-horario": {
    id: "bloquear-horario",
    title: "Bloqueo de Horarios & Feriados",
    badge: "Disponibilidad",
    icon: Ban,
    summary:
      "Cerrá horas de almuerzo, feriados, capacitaciones o descansos para que ningún cliente reserve en horarios no laborables.",
    steps: [
      {
        stepNumber: 1,
        taskTitle: "Elegir el tipo de bloqueo",
        instruction:
          "Seleccioná si vas a bloquear un profesional individual o todo el local completo (por ejemplo, feriado de Año Nuevo o limpieza general).",
      },
      {
        stepNumber: 2,
        taskTitle: "Definir fecha y rango de horas",
        instruction:
          "Marcá el día y el horario de inicio y fin (ej: 12:30 a 14:00 para almuerzo).",
      },
      {
        stepNumber: 3,
        taskTitle: "Indicar el motivo del bloqueo",
        instruction:
          "Escribí una referencia (ej: 'Descanso médico', 'Almuerzo'). El calendario marcará ese espacio con franjas grises no disponibles.",
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
    if (pathname.includes("/bloquear-horario")) return "bloquear-horario";
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

  // Update target rect with automatic tab switching
  const updateTargetRect = useCallback(() => {
    if (!currentStep?.targetSelector) {
      setTargetRect(null);
      return;
    }

    // Auto-switch tabs if needed on /dashboard/apariencia
    if (currentStep.targetSelector.includes("tour-photos")) {
      window.dispatchEvent(new CustomEvent("agendate-switch-tab", { detail: { tab: "fotos" } }));
    } else if (currentStep.targetSelector.includes("tour-buttons")) {
      window.dispatchEvent(new CustomEvent("agendate-switch-tab", { detail: { tab: "botones" } }));
    } else if (
      currentStep.targetSelector.includes("tour-presets") ||
      currentStep.targetSelector.includes("tour-colors")
    ) {
      window.dispatchEvent(new CustomEvent("agendate-switch-tab", { detail: { tab: "estilos" } }));
    } else if (currentStep.targetSelector.includes("tour-texts")) {
      window.dispatchEvent(new CustomEvent("agendate-switch-tab", { detail: { tab: "textos" } }));
    }

    const checkElement = (retries = 4) => {
      try {
        const el = document.querySelector(currentStep.targetSelector!) as HTMLElement | null;
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
          setTimeout(() => {
            const rect = el.getBoundingClientRect();
            setTargetRect(rect);
          }, 150);
        } else if (retries > 0) {
          setTimeout(() => checkElement(retries - 1), 150);
        } else {
          setTargetRect(null);
        }
      } catch {
        setTargetRect(null);
      }
    };

    setTimeout(() => checkElement(), 80);
  }, [currentStep]);

  // Recalculate spotlight whenever tour opens or step changes
  useEffect(() => {
    if (!isTourOpen) {
      setTargetRect(null);
      return;
    }

    updateTargetRect();

    const handleReposition = () => {
      if (!currentStep?.targetSelector) return;
      try {
        const el = document.querySelector(currentStep.targetSelector) as HTMLElement | null;
        if (el) {
          setTargetRect(el.getBoundingClientRect());
        }
      } catch {}
    };

    window.addEventListener("resize", handleReposition);
    window.addEventListener("scroll", handleReposition, { passive: true });
    return () => {
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
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        setTimeout(() => {
          setTargetRect(el.getBoundingClientRect());
        }, 150);
      }
    } catch {
      // ignore selector errors
    }
  }, []);

  // Keyboard navigation
  useEffect(() => {
    if (!isTourOpen) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        closeTour();
      } else if (e.key === "ArrowRight") {
        handleNext();
      } else if (e.key === "ArrowLeft") {
        handlePrev();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  const markSectionCompleted = (secId: string) => {
    if (!completedSections.includes(secId)) {
      const updated = [...completedSections, secId];
      setCompletedSections(updated);
      try {
        localStorage.setItem("agendate_completed_tours", JSON.stringify(updated));
      } catch {
        // ignore
      }
    }
  };

  const handleNext = () => {
    if (currentStepIndex < currentSection.steps.length - 1) {
      const nextIdx = currentStepIndex + 1;
      setCurrentStepIndex(nextIdx);
    } else {
      markSectionCompleted(currentSection.id);
      closeTour();
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

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

  // Smart Card positioning: Find a truly unobstructed zone outside targetRect
  const cardWidth = Math.min(windowDimensions.width - 32, 440);
  const cardHeightEstimate = 320;

  let cardLeft: number | undefined = undefined;
  let cardTop: number | undefined = undefined;

  if (targetRect) {
    const spaceRight = windowDimensions.width - targetRect.right;
    const spaceLeft = targetRect.left;
    const spaceBelow = windowDimensions.height - targetRect.bottom;
    const spaceAbove = targetRect.top;

    // 1. Try placing to the right of targetRect if there's enough room (e.g. next to settings on wide screens)
    if (spaceRight >= cardWidth + 24) {
      cardLeft = targetRect.right + 16;
      cardTop = Math.max(20, Math.min(windowDimensions.height - cardHeightEstimate - 20, targetRect.top));
    }
    // 2. Try placing to the left of targetRect
    else if (spaceLeft >= cardWidth + 24) {
      cardLeft = targetRect.left - cardWidth - 16;
      cardTop = Math.max(20, Math.min(windowDimensions.height - cardHeightEstimate - 20, targetRect.top));
    }
    // 3. Try placing below targetRect
    else if (spaceBelow >= cardHeightEstimate + 24) {
      cardLeft = Math.max(16, Math.min(windowDimensions.width - cardWidth - 16, targetRect.left));
      cardTop = targetRect.bottom + 16;
    }
    // 4. Try placing above targetRect
    else if (spaceAbove >= cardHeightEstimate + 24) {
      cardLeft = Math.max(16, Math.min(windowDimensions.width - cardWidth - 16, targetRect.left));
      cardTop = Math.max(16, targetRect.top - cardHeightEstimate - 16);
    }
    // 5. If targetRect is large and covers most of the viewport, dock in an unobtrusive corner:
    else {
      if (targetRect.left > windowDimensions.width / 2) {
        cardLeft = 24;
      } else {
        cardLeft = Math.max(16, windowDimensions.width - cardWidth - 24);
      }
      cardTop = Math.max(16, windowDimensions.height - cardHeightEstimate - 24);
    }

    if (cardLeft !== undefined && cardTop !== undefined) {
      cardLeft = Math.max(16, Math.min(windowDimensions.width - cardWidth - 16, cardLeft));
      cardTop = Math.max(16, Math.min(windowDimensions.height - cardHeightEstimate - 16, cardTop));
    }
  }

  return (
    <>
      {/* Floating launcher button in bottom right (Always accessible) */}
      {!isTourOpen && (
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
      )}

      {/* Interactive Guided Tour Spotlight & Walkthrough */}
      <AnimatePresence>
        {isTourOpen && (
          <div className="fixed inset-0 z-[100]">
            {/* SVG Mask: Dims the whole screen and cuts out the spotlight hole */}
            <svg className="fixed inset-0 h-full w-full pointer-events-none z-[102]">
              <defs>
                <mask id="tour-spotlight-mask">
                  <rect width="100%" height="100%" fill="white" />
                  {targetRect && (
                    <rect
                      x={Math.max(0, targetRect.left - 8)}
                      y={Math.max(0, targetRect.top - 8)}
                      width={targetRect.width + 16}
                      height={targetRect.height + 16}
                      rx="16"
                      fill="black"
                      style={{ transition: "all 250ms cubic-bezier(0.16, 1, 0.3, 1)" }}
                    />
                  )}
                </mask>
              </defs>
              <rect
                width="100%"
                height="100%"
                fill="rgba(3, 7, 18, 0.82)"
                mask="url(#tour-spotlight-mask)"
              />
            </svg>

            {/* Click backdrop to close (Underneath card, above page) */}
            <div
              className="fixed inset-0 z-[101] pointer-events-auto"
              onClick={() => closeTour()}
            />

            {/* Glowing animated ring over highlighted element (Synchronized with mask) */}
            {targetRect && (
              <div
                style={{
                  position: "fixed",
                  left: Math.max(0, targetRect.left - 8),
                  top: Math.max(0, targetRect.top - 8),
                  width: targetRect.width + 16,
                  height: targetRect.height + 16,
                  transition: "all 250ms cubic-bezier(0.16, 1, 0.3, 1)",
                }}
                className="pointer-events-none z-[103] rounded-2xl ring-4 ring-primary shadow-[0_0_35px_rgba(99,102,241,0.85)] animate-pulse"
              />
            )}

            {/* Directional Beacon Pointer pointing directly to element */}
            {targetRect && (
              <div
                style={{
                  position: "fixed",
                  left: Math.min(
                    Math.max(16, targetRect.left + 24),
                    windowDimensions.width - 160
                  ),
                  top: targetRect.top > 60 ? targetRect.top - 34 : targetRect.bottom + 8,
                  transition: "all 250ms cubic-bezier(0.16, 1, 0.3, 1)",
                }}
                className="pointer-events-none z-[104] flex items-center gap-1.5 rounded-full bg-gradient-to-r from-primary to-indigo-600 px-3.5 py-1 text-xs font-black text-white shadow-2xl animate-bounce"
              >
                <span>👉 Elemento enfocado</span>
              </div>
            )}

            {/* Floating Popover / Tooltip Card positioned in a free, non-overlapping zone (Always on top: z-[110]) */}
            <div
              style={
                targetRect && cardLeft !== undefined && cardTop !== undefined
                  ? {
                      position: "fixed",
                      left: cardLeft,
                      top: cardTop,
                      width: cardWidth,
                      zIndex: 110,
                      transition: "left 250ms cubic-bezier(0.16, 1, 0.3, 1), top 250ms cubic-bezier(0.16, 1, 0.3, 1)",
                    }
                  : undefined
              }
              className={
                targetRect && cardLeft !== undefined && cardTop !== undefined
                  ? "z-[110] pointer-events-auto"
                  : "fixed inset-0 z-[110] flex items-center justify-center p-4 pointer-events-auto"
              }
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-2xl flex flex-col max-h-[85vh] ring-1 ring-black/5 dark:ring-white/10"
              >
                {/* Header: Section Selector Dropdown + Close Button */}
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
                    <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-bold text-primary">
                      Paso {currentStepIndex + 1} de {currentSection.steps.length}
                    </span>
                    <button
                      type="button"
                      onClick={() => closeTour()}
                      className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 transition cursor-pointer"
                      title="Cerrar guía (Escape)"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Section Summary */}
                <p className="mt-2.5 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {currentSection.summary}
                </p>

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
                <div className="rounded-2xl border border-slate-200/80 dark:border-white/5 bg-slate-50/80 dark:bg-slate-800/50 p-4 space-y-2.5 overflow-y-auto">
                  <div className="flex items-start gap-3">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-primary text-white text-xs font-black shadow-xs">
                      {currentStep.stepNumber}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                        {currentStep.taskTitle}
                      </h4>
                      <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                        {currentStep.instruction}
                      </p>
                    </div>
                  </div>

                  {/* Practical Tip */}
                  {currentStep.tip && (
                    <div className="flex items-start gap-2 rounded-xl bg-amber-500/10 border border-amber-500/20 p-2.5 text-[11px] text-amber-900 dark:text-amber-300">
                      <Lightbulb className="h-4 w-4 shrink-0 text-amber-500 mt-0.5" />
                      <span>
                        <strong>Consejo práctico:</strong> {currentStep.tip}
                      </span>
                    </div>
                  )}

                  {/* Focus / Spotlight button if active on this page */}
                  {currentStep.targetSelector && (
                    <button
                      type="button"
                      onClick={() => scrollToTarget(currentStep.targetSelector)}
                      className="inline-flex items-center gap-1.5 text-[11px] font-bold text-primary hover:underline pt-0.5 cursor-pointer"
                    >
                      <Target className="h-3.5 w-3.5" />
                      <span>Volver a enfocar elemento en pantalla</span>
                    </button>
                  )}
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
                      onClick={() => closeTour()}
                      className="text-xs font-medium text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      Cerrar guía
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
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
