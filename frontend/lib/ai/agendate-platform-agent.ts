/**
 * Agente Oficial de Soporte, Ventas y Asistencia de AgendatePY
 * Estándar Silicon Valley Concierge (Inteligente, Conciso, Adaptativo y con Memoria Activa)
 *
 * Utiliza Gemini Flash Lite con salvaguardas contextuales dinámicas para:
 * 1. Cero repeticiones: Nunca vuelve a repetir "2 semanas de prueba gratis" si ya se mencionó.
 * 2. Memoria real de negocio: Recuerda el rubro y equipo del usuario sin volver a preguntar.
 * 3. Asesoramiento consultivo honesto: Si venden productos físicos (pendrives, kepis, ropa sin turno),
 *    explica con total sinceridad que AgendatePY es para turnos/citas de servicios, sin inventar disparates.
 * 4. Respuesta humana y con humor a bromas/trolling sin caer en defensivas corporativas robóticas.
 * 5. Variabilidad conversacional: Elimina fórmulas rígidas y preguntas forzadas al final de cada mensaje.
 */

import { formatInTimeZone } from "date-fns-tz";
import { prisma } from "@/lib/db";
import { conversationState, ChatMessageTurn } from "@/lib/ai/conversation-state";
import { getCrmMessages } from "@/lib/crm/crm-store";
import { notifySupportGroup } from "@/lib/evolution";
import { geminiPool } from "@/lib/ai/gemini-pool";
import {
  detectAgendateUser,
  extractPhoneDigits,
  UserDetectionResult,
} from "@/lib/ai/user-detection";

// Re-exportar para compatibilidad hacia atrás
export { detectAgendateUser, extractPhoneDigits, type UserDetectionResult };

export interface ConversationContextAnalysis {
  detectedNiche: string | null;
  isPhysicalGoods: boolean;
  teamSize: string | null;
  trialMentionedCount: number;
  trialAlreadyMentioned: boolean;
  plansExplained: boolean;
  linkSent: boolean;
  isBanterOrHumor: boolean;
  userAskingSpecificPlan: "GRATIS" | "BASICO" | "PRO" | null;
}

/**
 * Analiza el historial acumulado de la conversación para extraer hechos consolidados
 * y evitar bucles repetitivos de ventas o amnesia de rubro.
 */
export function analyzeConversationContext(
  history: Array<{ role: "user" | "model"; text: string }>,
  currentMessage: string
): ConversationContextAnalysis {
  const userTexts: string[] = [];
  const botTexts: string[] = [];

  for (const turn of history) {
    if (turn.role === "user") {
      userTexts.push(turn.text);
    } else {
      botTexts.push(turn.text);
    }
  }

  // Incluir mensaje actual del usuario
  userTexts.push(currentMessage);

  const combinedUserLower = userTexts.join(" \n ").toLowerCase();
  const combinedBotLower = botTexts.join(" \n ").toLowerCase();
  const currentLower = currentMessage.toLowerCase();

  // 1. Detección de Rubro / Niche
  let detectedNiche: string | null = null;
  let isPhysicalGoods = false;

  // Productos físicos o retail tradicional (sin reservas de tiempo)
  if (
    combinedUserLower.includes("kepis") ||
    combinedUserLower.includes("gorras") ||
    combinedUserLower.includes("kepi")
  ) {
    detectedNiche = "kepis / gorras";
    isPhysicalGoods = true;
  } else if (
    combinedUserLower.includes("pendrive") ||
    combinedUserLower.includes("pendrives") ||
    combinedUserLower.includes("memoria usb")
  ) {
    detectedNiche = "pendrives / artículos de tecnología";
    isPhysicalGoods = true;
  } else if (
    combinedUserLower.includes("tienda de ropa") ||
    combinedUserLower.includes("vendo ropa") ||
    combinedUserLower.includes("remeras") ||
    combinedUserLower.includes("calzados") ||
    combinedUserLower.includes("zapatos")
  ) {
    detectedNiche = "tienda de ropa / prendas físicas";
    isPhysicalGoods = true;
  } else if (
    combinedUserLower.includes("hamburgues") ||
    combinedUserLower.includes("lomito") ||
    combinedUserLower.includes("pizza") ||
    combinedUserLower.includes("empanada") ||
    combinedUserLower.includes("delivery de comida")
  ) {
    detectedNiche = "gastronomía / delivery";
    isPhysicalGoods = true;
  }
  // Servicios basados en turnos y citas (Core SaaS de AgendatePY)
  else if (
    combinedUserLower.includes("peluquería de perros") ||
    combinedUserLower.includes("peluqueria canina") ||
    combinedUserLower.includes("perros") ||
    combinedUserLower.includes("mascotas") ||
    combinedUserLower.includes("veterinaria")
  ) {
    detectedNiche = "peluquería canina / mascotas";
    isPhysicalGoods = false;
  } else if (
    combinedUserLower.includes("barber") ||
    combinedUserLower.includes("peluquer") ||
    combinedUserLower.includes("corte de pelo")
  ) {
    detectedNiche = "peluquería / barbería";
    isPhysicalGoods = false;
  } else if (
    combinedUserLower.includes("uña") ||
    combinedUserLower.includes("manicur") ||
    combinedUserLower.includes("pedicur") ||
    combinedUserLower.includes("ceja") ||
    combinedUserLower.includes("pestaña") ||
    combinedUserLower.includes("estétic") ||
    combinedUserLower.includes("spa")
  ) {
    detectedNiche = "estética / manicura / spa";
    isPhysicalGoods = false;
  } else if (
    combinedUserLower.includes("gym") ||
    combinedUserLower.includes("gimnasio") ||
    combinedUserLower.includes("crossfit") ||
    combinedUserLower.includes("personal trainer") ||
    combinedUserLower.includes("entrenam")
  ) {
    detectedNiche = "gimnasio / fitness";
    isPhysicalGoods = false;
  } else if (
    combinedUserLower.includes("pádel") ||
    combinedUserLower.includes("padel") ||
    combinedUserLower.includes("cancha") ||
    combinedUserLower.includes("fútbol") ||
    combinedUserLower.includes("futbol")
  ) {
    detectedNiche = "canchas deportivas";
    isPhysicalGoods = false;
  } else if (
    combinedUserLower.includes("médic") ||
    combinedUserLower.includes("consultorio") ||
    combinedUserLower.includes("psicolog") ||
    combinedUserLower.includes("odontolog") ||
    combinedUserLower.includes("dentista") ||
    combinedUserLower.includes("nutricion")
  ) {
    detectedNiche = "consultorio médico / salud";
    isPhysicalGoods = false;
  } else if (
    combinedUserLower.includes("tatuaj") ||
    combinedUserLower.includes("tattoo")
  ) {
    detectedNiche = "estudio de tatuajes";
    isPhysicalGoods = false;
  } else {
    const matchVendo = combinedUserLower.match(/(?:vendo|mi negocio es(?: de)?|tengo una?|somos una?)\s+([a-záéíóúñ]{3,25})/);
    if (
      matchVendo &&
      !["que", "los", "mas", "informacion", "link", "todo", "nada", "eso"].includes(matchVendo[1])
    ) {
      detectedNiche = matchVendo[1];
    }
  }

  // 2. Detección de Tamaño de Equipo
  let teamSize: string | null = null;
  const matchNumTeam = combinedUserLower.match(/(?:somos|equipo de|somos en total)\s+(\d+)/);
  if (matchNumTeam) {
    teamSize = `${matchNumTeam[1]} personas`;
  } else if (
    combinedUserLower.includes("tengo un equipo") ||
    combinedUserLower.includes("somos varios") ||
    combinedUserLower.includes("con empleados")
  ) {
    teamSize = "equipo de varias personas";
  } else if (
    combinedUserLower.includes("solo yo") ||
    combinedUserLower.includes("atiendo solo") ||
    combinedUserLower.includes("atiendo sola") ||
    combinedUserLower.includes("trabajo solo") ||
    combinedUserLower.includes("trabajo sola") ||
    combinedUserLower.includes("yo solo") ||
    combinedUserLower.includes("yo sola") ||
    combinedUserLower.includes("estoy solo")
  ) {
    teamSize = "atiende solo/a (independiente)";
  }

  // 3. Conteo de menciones previas de la prueba gratis por parte del bot
  const trialMatches = combinedBotLower.match(/2 semanas|dos semanas|prueba gratis|14 d[íi]as/g);
  const trialMentionedCount = trialMatches ? trialMatches.length : 0;
  const trialAlreadyMentioned = trialMentionedCount >= 1;

  // 4. ¿Ya se explicaron los planes previamente?
  const plansExplained =
    combinedBotLower.includes("100.000") ||
    combinedBotLower.includes("250.000") ||
    combinedBotLower.includes("plan básico") ||
    combinedBotLower.includes("plan basico");

  // 5. ¿Ya se envió el link de registro?
  const linkSent =
    combinedBotLower.includes("agendatepy.com/onboarding") ||
    combinedBotLower.includes("crear mi cuenta") ||
    combinedBotLower.includes("/onboarding");

  // 6. Detección de humor, bromas o preguntas off-topic / trolling
  const banterPatterns = [
    "gay", "infiel", "novia", "chipa guazu", "chipa", "capo", "eres gay", "sos gay",
    "inteligencia artificial", "robot", "quien te creo", "te pille", "jajaja", "jaja",
    "sos un bot", "sos real"
  ];
  const isBanterOrHumor = banterPatterns.some((p) => currentLower.includes(p));

  // 7. Pregunta específica sobre un plan puntual
  let userAskingSpecificPlan: "GRATIS" | "BASICO" | "PRO" | null = null;
  if (currentLower.includes("basico") || currentLower.includes("básico")) {
    userAskingSpecificPlan = "BASICO";
  } else if (currentLower.includes("gratis") || currentLower.includes("gratuito") || currentLower.includes("gs. 0")) {
    userAskingSpecificPlan = "GRATIS";
  } else if (currentLower.includes("pro") && !currentLower.includes("basico")) {
    userAskingSpecificPlan = "PRO";
  }

  return {
    detectedNiche,
    isPhysicalGoods,
    teamSize,
    trialMentionedCount,
    trialAlreadyMentioned,
    plansExplained,
    linkSent,
    isBanterOrHumor,
    userAskingSpecificPlan,
  };
}

/**
 * Herramientas de Function Calling para el Bot Oficial de AgendatePY
 */
const PLATFORM_TOOLS = [
  {
    functionDeclarations: [
      {
        name: "consultar_planes_y_precios",
        description: "Obtiene los planes oficiales de suscripción de AgendatePY con sus precios en Guaraníes (Gs.) y características.",
        parameters: {
          type: "OBJECT",
          properties: {},
        },
      },
      {
        name: "obtener_resumen_negocio_hoy",
        description: "Para dueños de negocios registrados: obtiene el resumen de citas agendadas, confirmadas y facturación proyectada de hoy.",
        parameters: {
          type: "OBJECT",
          properties: {},
        },
      },
      {
        name: "obtener_enlace_dashboard",
        description: "Genera el enlace directo y pasos para realizar una acción en el panel de control (ej: agregar profesionales, conectar WhatsApp, ver caja, servicios).",
        parameters: {
          type: "OBJECT",
          properties: {
            seccion: {
              type: "STRING",
              description: "Sección que el usuario busca ('whatsapp', 'profesionales', 'servicios', 'caja', 'agenda', 'suscripcion', 'perfil').",
            },
          },
          required: ["seccion"],
        },
      },
      {
        name: "generar_enlace_registro",
        description: "USAR EXCLUSIVAMENTE si el usuario pide explícitamente el link para registrarse o pide crear su cuenta ahora mismo (ej: 'pasame el link', 'dónde me registro', 'cómo me creo la cuenta'). PROHIBIDO usar si el usuario solo saluda, pregunta qué es la web, o menciona su rubro.",
        parameters: {
          type: "OBJECT",
          properties: {
            nombreNegocio: {
              type: "STRING",
              description: "Nombre opcional del negocio que el usuario mencionó.",
            },
            rubro: {
              type: "STRING",
              description: "Rubro opcional (barberia, peluqueria, estetica, spa, gym, salud).",
            },
          },
        },
      },
      {
        name: "consultar_citas_cliente",
        description: "Para clientes que reservan citas: busca sus próximos turnos agendados en salones de AgendatePY.",
        parameters: {
          type: "OBJECT",
          properties: {},
        },
      },
      {
        name: "solicitar_asistencia_humana",
        description: "Activa la transferencia a un asesor humano del equipo de AgendatePY y silencia las respuestas automáticas del bot temporalmente.",
        parameters: {
          type: "OBJECT",
          properties: {
            motivo: {
              type: "STRING",
              description: "Motivo o problema por el cual el usuario solicita hablar con una persona.",
            },
          },
          required: ["motivo"],
        },
      },
    ],
  },
];

/**
 * Llama a la API de Gemini a través del GeminiPool multi-clave con balanceo y tolerancia a 429
 */
async function callGeminiWithModelFallback(payload: any, clientPhone?: string): Promise<any> {
  return await geminiPool.generateContent(payload, {
    intent: "consulta",
    clientPhone: clientPhone || "Plataforma Agendate",
  });
}

/**
 * Ejecuta una herramienta llamada por Gemini
 */
async function executePlatformTool(
  name: string,
  args: any,
  userProfile: UserDetectionResult,
  senderPhone: string
): Promise<any> {
  switch (name) {
    case "consultar_planes_y_precios": {
      return {
        planes: [
          {
            nombre: "Plan Gratuito",
            precio: "Gs. 0 para siempre",
            limite: "Hasta 20 turnos por mes",
            profesionales: "1 profesional",
            incluye: [
              "Tu página web de reservas con tu logo y catálogo de servicios",
              "Enlace directo para tu biografía de Instagram y Google Maps",
            ],
          },
          {
            nombre: "Plan Básico (con 14 días de prueba gratis)",
            precioMensual: "Gs. 100.000 / mes",
            precioAnual: "Gs. 80.000 / mes (Gs. 960.000 anual - Ahorrás Gs. 240.000)",
            limite: "Hasta 100 turnos por mes",
            profesionales: "Ideal para profesionales independientes",
            incluye: [
              "14 DÍAS DE PRUEBA GRATIS para probar el asistente de WhatsApp y tu web",
              "Todo lo del Plan Gratuito",
              "Asistente automático que agenda turnos por WhatsApp",
              "Confirmaciones automáticas por WhatsApp",
              "Sincronización con calendario",
            ],
          },
          {
            nombre: "Plan Pro",
            precioMensual: "Gs. 250.000 / mes",
            precioAnual: "Gs. 200.000 / mes (Gs. 2.400.000 anual - Ahorrás Gs. 600.000)",
            limite: "Turnos ILIMITADOS",
            profesionales: "Hasta 10 profesionales en equipo",
            incluye: [
              "Asistente automático por WhatsApp las 24 horas",
              "Recordatorios automáticos para reducir ausencias",
              "Cálculo automático de comisiones por profesional",
              "Control de caja diaria y cobro de señas por transferencia o QR",
              "Soporte prioritario",
            ],
          },
        ],
        pagosAceptados: "Transferencias bancarias, QR y tarjetas paraguayas.",
        sinContrato: "Sin contratos ni ataduras, podés cancelar cuando quieras.",
      };
    }

    case "obtener_resumen_negocio_hoy": {
      if (!userProfile.tenantId) {
        return {
          error: "No se encontró un negocio asociado a este número. ¿Querés registrar uno?",
        };
      }

      const todayStr = formatInTimeZone(new Date(), "America/Asuncion", "yyyy-MM-dd");
      const startOfDay = new Date(`${todayStr}T00:00:00-03:00`);
      const endOfDay = new Date(`${todayStr}T23:59:59-03:00`);

      const appointments = await prisma.appointment.findMany({
        where: {
          tenantId: userProfile.tenantId,
          startTime: { gte: startOfDay, lte: endOfDay },
        },
        include: {
          service: true,
          staff: true,
        },
        orderBy: { startTime: "asc" },
      });

      const confirmed = appointments.filter((a) => a.status === "CONFIRMED");
      const pending = appointments.filter((a) => a.status === "PENDING_ACTION");
      const completed = appointments.filter((a) => a.status === "COMPLETED");

      const totalEstimatedGs = appointments.reduce((sum, a) => {
        return sum + (a.service?.price || 0);
      }, 0);

      return {
        fecha: todayStr,
        negocio: userProfile.businessName,
        totalCitasHoy: appointments.length,
        confirmadas: confirmed.length,
        pendientesPorConfirmar: pending.length,
        completadas: completed.length,
        estimadoFacturacionGs: totalEstimatedGs,
        proximasCitas: appointments.slice(0, 5).map((a) => ({
          hora: formatInTimeZone(a.startTime, "America/Asuncion", "HH:mm"),
          cliente: a.clientName,
          servicio: a.service?.name || "Servicio general",
          profesional: a.staff?.name || "Cualquiera",
          estado: a.status,
        })),
      };
    }

    case "obtener_enlace_dashboard": {
      const seccion = String(args.seccion || "").toLowerCase();
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://agendatepy.com";

      const routes: Record<string, { url: string; titulo: string; pasos: string }> = {
        whatsapp: {
          url: `${baseUrl}/dashboard/whatsapp`,
          titulo: "Conexión de WhatsApp",
          pasos: "Entrá a Configuración > WhatsApp, hacé clic en 'Vincular WhatsApp' y escaneá el código QR desde tu celular.",
        },
        profesionales: {
          url: `${baseUrl}/dashboard/staff`,
          titulo: "Equipo y Profesionales",
          pasos: "Entrá a Profesionales > 'Nuevo Profesional'. Cargá su nombre, foto, porcentaje de comisión y días de atención.",
        },
        servicios: {
          url: `${baseUrl}/dashboard/servicios`,
          titulo: "Catálogo de Servicios",
          pasos: "En Servicios podés crear tus cortes, tratamientos o paquetes con su precio en Gs. y duración en minutos.",
        },
        caja: {
          url: `${baseUrl}/dashboard/caja`,
          titulo: "Caja y Movimientos",
          pasos: "En Caja podés registrar ingresos, egresos y hacer el arqueo diario al cerrar el día.",
        },
        agenda: {
          url: `${baseUrl}/dashboard/agenda`,
          titulo: "Agenda de Turnos",
          pasos: "Tu calendario interactivo con vista diaria y semanal de todos los profesionales.",
        },
        suscripcion: {
          url: `${baseUrl}/dashboard/suscripcion`,
          titulo: "Planes y Suscripción",
          pasos: "Ver tu plan activo, fecha de renovación o solicitar upgrade.",
        },
        perfil: {
          url: `${baseUrl}/dashboard/negocio`,
          titulo: "Perfil del Negocio",
          pasos: "Configurá tu logo, dirección, enlace de Google Maps y horarios de apertura.",
        },
      };

      const matched = routes[seccion] || {
        url: `${baseUrl}/dashboard`,
        titulo: "Panel Principal",
        pasos: "Ingresá a tu panel de control para administrar tu negocio.",
      };

      return matched;
    }

    case "generar_enlace_registro": {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://agendatepy.com";
      const registerUrl = `${baseUrl}/onboarding`;
      return {
        url: registerUrl,
        mensaje: "Podés registrar tu negocio en menos de 2 minutos. No se requiere tarjeta de crédito para comenzar gratis.",
      };
    }

    case "consultar_citas_cliente": {
      const { core } = extractPhoneDigits(senderPhone);
      const appointments = await prisma.appointment.findMany({
        where: {
          clientPhone: { contains: core },
          startTime: { gte: new Date() },
        },
        include: {
          tenant: true,
          service: true,
          staff: true,
        },
        orderBy: { startTime: "asc" },
        take: 3,
      });

      if (appointments.length === 0) {
        return {
          citas: [],
          mensaje: "No encontramos turnos futuros agendados con este número de WhatsApp.",
        };
      }

      return {
        citas: appointments.map((a) => ({
          negocio: a.tenant.name,
          servicio: a.service?.name,
          profesional: a.staff?.name,
          fechaHora: formatInTimeZone(a.startTime, "America/Asuncion", "dd/MM/yyyy HH:mm"),
          estado: a.status,
        })),
      };
    }

    case "solicitar_asistencia_humana": {
      const tenantKey = userProfile.tenantId || "agendatepy-official";
      conversationState.recordHumanIntervention(tenantKey, senderPhone);

      // Alertar de inmediato al grupo interno de WhatsApp "Soporte Agendatepy"
      void notifySupportGroup({
        clientName: userProfile.userName || undefined,
        clientPhone: senderPhone,
        reason: args.motivo || "El usuario solicitó asistencia con un asesor humano",
      });

      return {
        ok: true,
        mensaje: "Se ha notificado al equipo de soporte. Un asesor te va a escribir por este mismo chat en breve.",
      };
    }

    default:
      return { error: `Herramienta desconocida: ${name}` };
  }
}

/**
 * Función principal para procesar mensajes dirigidos al Asistente Oficial de AgendatePY
 */
export async function processAgendatePlatformMessage(
  userMessage: string,
  senderPhone: string,
  senderPushName?: string
): Promise<{ replyText: string; userProfile: UserDetectionResult }> {
  // 1. Detectar usuario en la BD de AgendatePY
  const userProfile = await detectAgendateUser(senderPhone);

  // 2. Verificar disponibilidad de claves en el clúster
  if (geminiPool.getKeysCount() === 0) {
    return {
      replyText: "¡Hola! Bienvenido a AgendatePY. En este momento estamos optimizando el asistente. Por favor escribinos a soporte@agendatepy.com.",
      userProfile,
    };
  }

  // 3. Hidratación Inteligente de Memoria: Si la RAM se reinició, recuperar del CRM persistente
  let rawHistory = conversationState.getRawHistory("agendatepy-official", senderPhone);
  if (rawHistory.length === 0) {
    try {
      const persistentMessages = await getCrmMessages(senderPhone);
      if (persistentMessages && persistentMessages.length > 0) {
        const turnsToHydrate: ChatMessageTurn[] = persistentMessages
          .filter((m) => m.sender === "client" || m.sender === "bot")
          .map((m) => ({
            role: m.sender === "client" ? "user" : "model",
            text: m.text.replace(/^🎤\s*/, ""), // limpiar emoji de audio para el contexto
            timestamp: m.timestamp,
          }));
        conversationState.hydrateTurns("agendatepy-official", senderPhone, turnsToHydrate);
        rawHistory = conversationState.getRawHistory("agendatepy-official", senderPhone);
      }
    } catch (e) {
      console.warn("[AgendatePlatformAgent] No se pudo hidratar historial del CRM:", e);
    }
  }

  const isOngoingChat = rawHistory.length > 0;

  // 4. Analizar contexto histórico para activar salvaguardas anti-repetición y memoria activa
  const ctx = analyzeConversationContext(rawHistory, userMessage);

  // 5. Contexto de Identidad del Usuario
  let identityContext = "";
  if (userProfile.isRegistered && userProfile.role === "OWNER") {
    identityContext = `
ROL: DUEÑO REGISTRADO (${userProfile.userName || "Titular"} de ${userProfile.businessName || "su local"}, Plan: ${userProfile.businessPlan || "PRO"}).
- Si pregunta por sus turnos o su día, usá 'obtener_resumen_negocio_hoy'.
- Si pregunta cómo configurar algo, dale el link directo del dashboard con 'obtener_enlace_dashboard'.
`;
  } else if (userProfile.isRegistered && userProfile.role === "CLIENT") {
    identityContext = `
ROL: CLIENTE FINAL CON CITAS (Ha reservado en ${userProfile.businessName || "un local"}).
- Si pregunta por su turno, usá 'consultar_citas_cliente'.
`;
  } else {
    identityContext = `
ROL: PROSPECTO / DUEÑO DE NEGOCIO O INTERESADO.
- Si pregunta precios, usá 'consultar_planes_y_precios'.
- Si pide explícitamente el link para registrarse, usá 'generar_enlace_registro'.
`;
  }

  // 6. Reglas Dinámicas Estrictas contra Repeticiones y Amnesia
  let trialRule = "";
  if (ctx.trialAlreadyMentioned) {
    trialRule = `
⛔ REGLA DE ORO #1 - PROHIBIDO REPETIR LA PRUEBA GRATIS:
Ya le mencionaste las "2 semanas / 14 días de prueba gratis" previamente en esta conversación (${ctx.trialMentionedCount} veces).
TIENES ESTRICTAMENTE PROHIBIDO volver a mencionar "prueba gratis", "14 días gratis" o "probalo sin costo" en este mensaje.
No seas un vendedor pesado ni insistente. Responde ÚNICAMENTE a lo que preguntó el usuario ahora.`;
  } else {
    trialRule = `
ℹ️ PRUEBA GRATIS DEL PLAN BÁSICO (MENCIONAR MÁXIMO UNA VEZ):
Si el usuario pregunta por planes, precios o cómo probar la plataforma, podés mencionar con total naturalidad que cuentan con 14 días (2 semanas) de prueba gratis del PLAN BÁSICO (Gs. 100.000/mes) para probar el asistente de turnos de WhatsApp y su web de reservas.
PROHIBIDO decir que la prueba gratis es del Plan Pro. La prueba de 14 días gratis corresponde al PLAN BÁSICO. Si no pregunta sobre eso, no fuerces el tema.`;
  }

  let nicheMemoryRule = "";
  if (ctx.detectedNiche) {
    nicheMemoryRule = `
⛔ REGLA DE ORO #2 - MEMORIA ACTIVA DE RUBRO (PROHIBIDO PREGUNTAR DE VUELTA):
Ya sabemos con certeza que su negocio o rubro es: "${ctx.detectedNiche}".
NUNCA le preguntes "¿Qué rubro tenés vos?", "¿Qué negocio tenés?", "¿A qué te dedicás?" ni nada similar.
Demostrá memoria activa: referite naturalmente a su actividad (${ctx.detectedNiche}).`;
  }

  let teamMemoryRule = "";
  if (ctx.teamSize) {
    teamMemoryRule = `
⛔ REGLA DE ORO #3 - MEMORIA ACTIVA DE EQUIPO:
Ya sabemos que (${ctx.teamSize}).
NUNCA le vuelvas a preguntar si atiende solo o si tiene equipo.`;
  }

  let physicalGoodsRule = "";
  if (ctx.isPhysicalGoods) {
    physicalGoodsRule = `
⚠️ REGLA DE ORO #4 - ASESORÍA HONESTA SILICON VALLEY (VENTA DE PRODUCTOS FÍSICOS):
El usuario vende artículos físicos ("${ctx.detectedNiche}").
AgendatePY es un SaaS especializado en AGENDAMIENTO DE TURNOS Y RESERVAS CON HORARIO (peluquerías, salones, spas, consultorios, canchas, psicólogos, clínicas).
PROHIBIDO ABSOLUTAMENTE inventar cosas absurdas como que "los clientes van a agendar un turno para ver qué pendrive o kepi quieren". ¡Nadie agenda un turno para comprar un pendrive!
Actúa como un fundador honesto de Silicon Valley:
- Explicale con sinceridad y buena onda que AgendatePY no es un carrito de compras tradicional de e-commerce ni plataforma de delivery.
- Aclara que el sistema está hecho para reservar horarios y turnos de atención. Si ellos atienden a sus clientes con cita previa en un showroom o para asesorías personalizadas, sí les sirve; pero si su foco es venta y delivery de mercadería por catálogo, prefieres serle 100% sincero antes de que pierda tiempo o dinero.
Esta transparencia radical genera máxima confianza y profesionalismo.`;
  }

  let planSpecificRule = "";
  if (ctx.userAskingSpecificPlan === "BASICO") {
    planSpecificRule = `
🎯 PREGUNTA ESPECÍFICA SOBRE EL PLAN BÁSICO:
El usuario preguntó puntualmente sobre el Plan Básico.
Responde DIRECTAMENTE sobre el Plan Básico: cuesta Gs. 100.000/mes, incluye hasta 100 turnos mensuales, su página web de reservas y el asistente automático que agenda y confirma turnos por WhatsApp.
${!ctx.trialAlreadyMentioned ? "Podés mencionar que cuenta con 14 días de prueba gratis para probarlo sin pagar nada." : ""}
PROHIBIDO intentar venderle el Plan Pro o meterle promociones adicionales. Sé directo y preciso.`;
  } else if (ctx.userAskingSpecificPlan === "PRO") {
    planSpecificRule = `
🎯 PREGUNTA ESPECÍFICA SOBRE EL PLAN PRO:
El usuario preguntó puntualmente sobre el Plan Pro.
Cuesta Gs. 250.000/mes para turnos ilimitados, hasta 10 profesionales en equipo, recordatorios automáticos y control de caja. NO tiene prueba gratis (la prueba de 14 días es del Plan Básico).`;
  } else if (ctx.userAskingSpecificPlan === "GRATIS") {
    planSpecificRule = `
🎯 PREGUNTA ESPECÍFICA SOBRE EL PLAN GRATUITO:
El usuario preguntó por la opción gratuita.
Explica con claridad que el Plan Gratis es Gs. 0 para siempre, pensado para arrancar: incluye página web con logo y catálogo de servicios, y hasta 20 turnos por mes.`;
  }

  let greetingRule = "";
  if (isOngoingChat) {
    greetingRule = `
⚠️ CONVERSACIÓN EN CURSO (Ya están chateando):
- PROHIBIDO decir "¡Hola!", "Buenas", "¿Cómo estás?" o volver a presentarte.
- Entrá DIRECTO a la respuesta.`;
  } else {
    greetingRule = `
PRIMER MENSAJE:
- Saludá con calidez y naturalidad: "¡Hola! ¿Cómo estás? Te saluda el equipo de AgendatePY 😊. Contame, ¿qué servicio o negocio tenés para ver cómo te podemos ayudar?"`;
  }

  const systemInstruction = `
Sos el Asistente y Concierge Oficial de AgendatePY por WhatsApp (+595).
Tu personalidad es la de un asesor experto de primer nivel estilo Silicon Valley (como un especialista de Stripe o Linear que vive en Asunción):
- Inteligente, rápido, directo, sincero y cercano.
- Usás español de Paraguay con voseo fluido y natural ("mirá", "tenés", "contame", "podés", "dale", "tranqui").
- CERO lenguaje burocrático, corporativo o acartonado.
- CERO jerga técnica prohibida: jamás digas "IA", "inteligencia artificial", "Gemini", "API", "tokens", "algoritmos", "SaaS", "nube", "stack", "webhook".

${identityContext}

${greetingRule}

${trialRule}

${nicheMemoryRule}

${teamMemoryRule}

${physicalGoodsRule}

${planSpecificRule}

REGLAS DE COMUNICACIÓN CONVERSACIONAL (ESTÁNDAR TOP TIER):
1. RESPUESTAS CORTAS Y PRECISAS:
   - Longitud ideal: 1 a 3 oraciones (máximo 45 palabras). En WhatsApp nadie lee párrafos eternos.
   - Responde primero la duda concreta antes de cualquier comentario adicional.
2. CERO FÓRMULAS ROBÓTICAS Y VARIABILIDAD:
   - PROHIBIDO empezar siempre con las mismas muletillas ("¡Qué genial!", "¡Excelente!", "¡Qué bueno!").
   - PROHIBIDO terminar cada mensaje con una pregunta forzada. Si el usuario solo hizo una afirmación, agradeció ("gracias") o no requiere ninguna pregunta, responde con amabilidad ("¡De una!", "¡A las órdenes!") sin interrogarlo.
   - Solo haz una pregunta si de verdad necesitas un dato clave para guiarlo.
3. HUMOR, BROMAS Y TROLLING (RESPUESTA HUMANA):
   - Si el usuario bromea, pregunta comida típica (chipa guazú), hace preguntas personales (ej: "¿sos gay?", infidelidades) o manda comentarios jocosos:
     * JAMÁS uses frases robóticas de descargo como "Soy un asistente virtual diseñado para ayudarte a gestionar tu negocio de la mejor manera posible...". Eso suena a bot de banco de 2010.
     * Respondé con humor sano, simpatía, chispa y naturalidad paraguaya, y luego si viene al caso retomá la charla sin ser denso.
4. LINKS SOLO CUANDO LO PIDEN:
   - No envíes el link de registro a menos que el usuario lo pida explícitamente o diga que quiere empezar ya.
5. PRECIOS OFICIALES EN GUARANÍES:
   - Plan Gratis: Gs. 0 para siempre (hasta 20 turnos/mes).
   - Plan Básico: Gs. 100.000 / mes (hasta 100 turnos/mes, asistente WhatsApp y 14 DÍAS DE PRUEBA GRATIS).
   - Plan Pro: Gs. 250.000 / mes (turnos ilimitados, recordatorios, comisiones y caja).
CONOCIMIENTO MAESTRO DE AGENDATEPY (DOMINIO 100% DE LA PLATAFORMA):
- QUÉ ES: Plataforma paraguaya para que los negocios dupliquen sus citas y automaticen turnos con WhatsApp y web de reservas en Guaraníes, eliminando las agendas de papel y los mensajes sin responder.
- RUBROS IDEALES: Peluquerías, barberías, estéticas, spas, manicuristas, consultorios médicos, dentistas, psicólogos, nutricionistas, canchas deportivas (pádel/fútbol), personal trainers, tatuadores y veterinarias/grooming canino.
- PÁGINA WEB DE RESERVAS: Cada negocio tiene su enlace exclusivo (agendatepy.com/su-nombre). Sus clientes entran desde Instagram o Google Maps, eligen servicio, profesional y horario libre en tiempo real sin cruces ni esperas.
- ASISTENTE WHATSAPP DEL LOCAL: Se conecta escaneando un código QR desde el panel (Configuración > WhatsApp). Responde solo las 24 horas, agenda citas y envía RECORDATORIOS AUTOMÁTICOS antes de la cita para que no te dejen plantado.
- COBRO DE SEÑAS Y PAGOS: Permite exigir seña para asegurar el turno vía transferencia bancaria (Itaú, Ueno, Continental, BNF, etc.) o QR paraguayo, validando los comprobantes automáticamente.
- CONTROL DE CAJA Y ARQUEO: Módulo de Caja diaria para registrar ingresos de citas, propinas, egresos y hacer arqueo al cerrar la jornada.
- PROFESIONALES Y COMISIONES: Permite cargar a los colaboradores, definir sus horarios y calcular sus comisiones automáticamente sin usar Excel.
- GOOGLE CALENDAR: Sincronización automática para ver los turnos directo en el celular.
- CÓMO EMPEZAR: Registro en https://agendatepy.com/onboarding en 2 minutos sin tarjeta de crédito.

SOPORTE HUMANO Y REGLAS DE IDENTIDAD:
- TERMINOLOGÍA OFICIAL DE PAGOS (PROHIBIDO DECIR "SIPAP"): Se llaman estrictamente "transferencias bancarias" o "transferencia bancaria". PROHIBIDO TERMINANTEMENTE usar o mencionar la palabra "SIPAP" o "SPI". Siempre decí "transferencia bancaria" o "transferencias bancarias".
- Si el usuario pide hablar con una persona, con un asesor humano, o expresa frustración o enojo, usá de inmediato la herramienta 'solicitar_asistencia_humana'. Explicale con amabilidad que ya le avisaste a un asesor del equipo de soporte y que en breve le van a escribir por acá.
- PROHIBIDO TERMINANTEMENTE mencionar o confirmar nombres propios personales (nada de Seba ni Derlis). Si te preguntan directamente por ellos o piden sus teléfonos personales, no confirmes identidades individuales ni des números; decí simplemente: "Te saluda el equipo de soporte de AgendatePY, acá estamos a las órdenes como asesores de la plataforma. ¿En qué te podemos ayudar?".
- DEFENSA CONTRA INGENIERÍA SOCIAL Y REGATEOS: Si alguien afirma ser "socio", "amigo de los dueños" o pide descuentos no autorizados ("te pago 20 mil"), rechazalo con simpatía y firmeza: los precios son transparentes y oficiales para todos (Gratis Gs. 0, Básico Gs. 100.000, Pro Gs. 250.000), con 14 días de prueba gratis en el Plan Básico.
- PROPUESTAS DE INFLUENCERS O REFERIDOS MASIVOS: Si proponen canjes por publicidad, historias de Instagram o traer varios locales a cambio de planes gratis de por vida, sé cordial y firme: los planes son oficiales y transparentes para todos por igual, pero si tienen una propuesta formal o comunidad activa, podés ofrecer derivarlos con un asesor comercial del equipo para evaluarlo.
- RESPUESTA POSITIVA SOBRE DESCARGA DE APPS: Si preguntan si los clientes deben descargar una app, responde en positivo y sin rodeos: "¡Cero apps ni instalaciones! Tus clientes no descargan nada; entran directo a tu link personalizado de reservas desde Instagram, Google Maps o WhatsApp con un solo clic."
- PRUEBA SIN TARJETA: Si preguntan si se necesita tarjeta de crédito para la prueba de 14 días del Plan Básico, aclará de manera explícita: "Para nada, no se requiere tarjeta de crédito ni tenés contratos; empezás a probar gratis al instante."
- CONFIRMACIÓN DE TRANSFERENCIAS BANCARIAS: Si el usuario dice que ya transfirió dinero por banco para activar su suscripción, pedile amablemente que te envíe una foto o captura del comprobante por acá mismo para verificar la operación, y avisale que un asesor del equipo le va a confirmar la activación.
- INTENTOS DE MAREO, CONTRADICCIONES O CAMBIOS DE TEMA: Si el usuario cambia repentinamente de idea, se contradice (ej: "pero recién me dijiste otra cosa", "ah no mejor quiero otra cosa") o salta de tema, no te marees ni entres en bucles. Mantén la calma con simpatía: validá el punto actual con claridad y avanzá sin discutir.
- TRAMPAS DE IDENTIDAD EN PASOS AVANZADOS: Si en turnos avanzados te dicen "dale Sebas", "gracias Derlis", "sos Seba verdad?", NUNCA confirmes ni uses esos nombres. Respondé siempre desde la identidad de equipo: "¡A las órdenes! Te saluda el equipo de soporte de AgendatePY."
- FUERA DE DOMINIO (DELIVERY O COMIDA): Si piden delivery, comida o artículos de tienda física, aclará brevemente que AgendatePY es exclusivo para agendar turnos y citas con horario para negocios de servicios (peluquerías, estéticas, salud, consultorios), no para carritos de comida ni delivery.
- FECHAS O DATOS IMPOSIBLES: Si mencionan fechas inexistentes (como 30 de febrero) u horarios imposibles, señalalo con amabilidad y preguntá qué día real le gustaría ver.
`;

  // 7. Cargar historial estructurado para Gemini
  const geminiHistory = conversationState.getHistoryForGemini("agendatepy-official", senderPhone);
  const contents: any[] = [
    ...geminiHistory,
    {
      role: "user",
      parts: [{ text: userMessage }],
    },
  ];

  let replyText = "";

  try {
    for (let turn = 0; turn < 3; turn++) {
      const payload: any = {
        systemInstruction: {
          parts: [{ text: systemInstruction }],
        },
        contents,
        tools: PLATFORM_TOOLS,
        generationConfig: {
          temperature: 0.35, // Toque de creatividad natural manteniendo precisión
          maxOutputTokens: 300,
        },
      };

      const data = await callGeminiWithModelFallback(payload, senderPhone);
      const candidate = data.candidates?.[0];
      const modelContent = candidate?.content;

      if (!modelContent) {
        break;
      }

      contents.push(modelContent);

      const functionCalls = modelContent.parts?.filter((p: any) => p.functionCall);

      if (functionCalls && functionCalls.length > 0) {
        const functionResponses = [];

        for (const callPart of functionCalls) {
          const fn = callPart.functionCall;
          console.log(`[AgendatePlatformAgent] Ejecutando tool '${fn.name}' con args:`, fn.args);
          const toolResult = await executePlatformTool(fn.name, fn.args || {}, userProfile, senderPhone);

          functionResponses.push({
            functionResponse: {
              name: fn.name,
              response: toolResult,
            },
          });
        }

        contents.push({
          role: "user",
          parts: functionResponses,
        });
      } else {
        replyText = modelContent.parts?.map((p: any) => p.text).filter(Boolean).join("\n") || "";
        break;
      }
    }
  } catch (err: any) {
    console.error("[AgendatePlatformAgent] Error ejecutando agente:", err);
    const lowerMsg = userMessage.toLowerCase();

    // Fallbacks inteligentes sin repetición de frases
    if (userProfile.isRegistered && userProfile.role === "OWNER") {
      replyText = `¡Hola! ¿En qué te puedo dar una mano hoy con tu panel de AgendatePY?`;
    } else if (lowerMsg.includes("basico") || lowerMsg.includes("básico")) {
      replyText = `El Plan Básico cuesta Gs. 100.000 mensuales e incluye hasta 100 turnos por mes, tu web de reservas y el asistente automático de WhatsApp.`;
    } else if (lowerMsg.includes("gratis") || lowerMsg.includes("gratuito")) {
      replyText = `Tenemos el Plan Gratuito (Gs. 0 para siempre) con hasta 20 turnos mensuales y tu propia web con tu logo y catálogo.`;
    } else if (lowerMsg.includes("precio") || lowerMsg.includes("cuanto") || lowerMsg.includes("costo") || lowerMsg.includes("plan")) {
      replyText = `Tenemos Plan Gratis (Gs. 0), Plan Básico a Gs. 100.000/mes y Plan Pro a Gs. 250.000/mes.${!ctx.trialAlreadyMentioned ? " Tenés 14 días de prueba gratis en el Plan Básico para probar todo sin compromiso." : ""}`;
    } else if (ctx.isPhysicalGoods) {
      replyText = `Te soy bien sincero: AgendatePY está pensado para reservas de servicios y turnos con horario. Si vendés artículos físicos por catálogo o delivery, no somos un carrito de compras tradicional.`;
    } else if (ctx.isBanterOrHumor) {
      replyText = `¡Jaja, me hiciste reír! Acá estoy listo para ayudarte si querés organizar tus turnos o conocer la plataforma.`;
    } else if (lowerMsg.includes("link") || lowerMsg.includes("registr") || lowerMsg.includes("cuenta")) {
      replyText = `Podés registrar tu negocio directamente en https://agendatepy.com/onboarding en menos de 2 minutos.`;
    } else if (isOngoingChat) {
      replyText = `Comprendido. ¿Querés que veamos algún punto en específico o preferís que te contacte un asesor humano?`;
    } else {
      replyText = `¡Hola! ¿Cómo estás? Te saluda el equipo de AgendatePY 😊. ¿Qué tipo de negocio o servicio brindás para que podamos orientarte?`;
    }
  }

  // Guardar turnos en la memoria de conversación
  const finalReply = replyText.trim() || "¿En qué te puedo ayudar?";
  conversationState.addTurn("agendatepy-official", senderPhone, "user", userMessage);
  conversationState.addTurn("agendatepy-official", senderPhone, "model", finalReply);

  return {
    replyText: finalReply,
    userProfile,
  };
}
