/**
 * Agente de IA para WhatsApp (AgendatePY)
 *
 * Utiliza el cluster de Gemini 3.1/3.5 Flash de Google AI Studio con Function Calling
 * para consultar disponibilidad en tiempo real en la base de datos de Prisma y agendar turnos.
 */

import { prisma } from "@/lib/db";
import { getAvailableSlots } from "@/lib/scheduling/availability";
import { geminiPool } from "@/lib/ai/gemini-pool";
import { conversationState } from "@/lib/ai/conversation-state";
import { sendWhatsAppMessage } from "@/lib/evolution";

export interface AgentContext {
  tenantId: string;
  tenantName: string;
  tenantSlug: string;
  clientPhone: string;
  clientName?: string;
  configOverrides?: {
    allowEmojis?: boolean;
    askStaffPreference?: boolean;
    handoffOnUnknownTopic?: boolean;
    aiTone?: "amigable" | "formal" | "conciso";
    aiInstructions?: string;
    notifyPersonalPhoneOnBooking?: boolean;
    personalPhone?: string;
  };
}

// Herramientas declaradas para Gemini Function Calling
const AGENT_TOOLS = [
  {
    functionDeclarations: [
      {
        name: "consultar_servicios",
        description: "Obtiene la lista de servicios que ofrece el negocio, con sus precios en Guaraníes y duración en minutos.",
        parameters: {
          type: "OBJECT",
          properties: {},
        },
      },
      {
        name: "consultar_disponibilidad",
        description: "Verifica qué horarios libres hay disponibles para una fecha específica (formato YYYY-MM-DD).",
        parameters: {
          type: "OBJECT",
          properties: {
            fecha: {
              type: "STRING",
              description: "Fecha en formato YYYY-MM-DD (ej: 2026-10-07). Debe ser hoy o una fecha futura.",
            },
            nombre_servicio: {
              type: "STRING",
              description: "Nombre aproximado del servicio que el cliente desea (ej: 'Corte', 'Barba', 'Manicura').",
            },
            profesionalNombre: {
              type: "STRING",
              description: "Nombre opcional del profesional/especialista con quien el cliente desea atenderse.",
            },
          },
          required: ["fecha"],
        },
      },
      {
        name: "crear_reserva",
        description: "Confirma y agenda un turno para el cliente en el horario y fecha elegidos.",
        parameters: {
          type: "OBJECT",
          properties: {
            servicioId: {
              type: "STRING",
              description: "ID del servicio a agendar.",
            },
            horarioInicio: {
              type: "STRING",
              description: "Instante de inicio en formato ISO 8601 (ej: 2026-10-07T15:30:00Z) o civil acordado.",
            },
            nombreCliente: {
              type: "STRING",
              description: "Nombre de la persona que agenda.",
            },
            profesionalNombre: {
              type: "STRING",
              description: "Nombre o apodo del profesional/especialista elegido por el cliente, o 'cualquiera' si no tiene preferencia.",
            },
          },
          required: ["servicioId", "horarioInicio", "nombreCliente"],
        },
      },
      {
        name: "consultar_mis_turnos",
        description: "Revisa si el cliente tiene turnos próximos ya reservados con su número de teléfono.",
        parameters: {
          type: "OBJECT",
          properties: {},
        },
      },
      {
        name: "reprogramar_reserva",
        description: "Reprograma o cambia la fecha y hora de un turno próximo ya existente del cliente.",
        parameters: {
          type: "OBJECT",
          properties: {
            nuevoHorarioInicio: {
              type: "STRING",
              description: "Nuevo instante de inicio acordado en formato ISO 8601 o fecha YYYY-MM-DDTHH:mm:ss.",
            },
            appointmentId: {
              type: "STRING",
              description: "ID del turno a cambiar (opcional si se toma el último turno del cliente).",
            },
          },
          required: ["nuevoHorarioInicio"],
        },
      },
      {
        name: "cancelar_reserva",
        description: "Cancela un turno próximo del cliente y libera el horario en la agenda del negocio.",
        parameters: {
          type: "OBJECT",
          properties: {
            motivo: {
              type: "STRING",
              description: "Motivo opcional de la cancelación.",
            },
            appointmentId: {
              type: "STRING",
              description: "ID del turno a cancelar (opcional si se toma el último turno activo).",
            },
          },
        },
      },
      {
        name: "consultar_puntos",
        description: "Revisa cuántos puntos de fidelización tiene acumulados el cliente en este negocio y qué beneficios puede canjear.",
        parameters: {
          type: "OBJECT",
          properties: {},
        },
      },
      {
        name: "derivar_a_humano",
        description: "Se invoca cuando el cliente consulta sobre un tema, producto, servicio especial, duda técnica o información del local que la IA desconoce o no tiene en su catálogo, o cuando pide hablar con una persona o encargado del local.",
        parameters: {
          type: "OBJECT",
          properties: {
            motivo: {
              type: "STRING",
              description: "Pregunta o motivo exacto del cliente que requiere atención de un encargado del local.",
            },
          },
          required: ["motivo"],
        },
      },
    ],
  },
];

export async function processCustomerMessageWithAI(
  userMessage: string,
  context: AgentContext
): Promise<{
  replyText: string;
  intent: "agenda" | "consulta" | "sipap_ocr" | "humano" | "general";
  actionPerformed?: string;
}> {
  // 1. Obtener datos del negocio
  const tenant = await prisma.tenant.findUnique({
    where: { id: context.tenantId },
    select: {
      id: true,
      name: true,
      slug: true,
      timezone: true,
      settings: true,
      services: {
        where: { active: true },
        select: { id: true, name: true, durationMinutes: true, price: true },
      },
      staff: {
        where: { active: true },
        select: { id: true, name: true },
      },
      products: {
        where: { isActive: true },
        select: { id: true, name: true, price: true, description: true },
      },
    },
  });

  if (!tenant) {
    return {
      replyText: "Disculpá, estamos experimentando un inconveniente técnico momentáneo. En breve te contactaremos.",
      intent: "general",
    };
  }

  const todayStr = new Date().toISOString().slice(0, 10);
  const currentTimeStr = new Date().toLocaleTimeString("es-PY", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: tenant.timezone || "America/Asuncion",
  });

  const servicesListText = tenant.services
    .map((s) => `• ${s.name} (ID: ${s.id}) - ₲ ${s.price.toLocaleString("es-PY")} (${s.durationMinutes} min)`)
    .join("\n");

  const productsListText = tenant.products?.length
    ? tenant.products
        .map((p) => `• ${p.name} - ₲ ${p.price.toLocaleString("es-PY")}${p.description ? ` (${p.description})` : ""}`)
        .join("\n")
    : "No hay catálogo de productos de venta cargado actualmente.";

  const evoConfig = {
    ...((tenant.settings as any)?.evolutionConfig || {}),
    ...(context.configOverrides || {}),
  };
  const customInstructions = evoConfig.aiInstructions || "";
  const tone = evoConfig.aiTone || "amigable";
  const allowEmojis = Boolean(evoConfig.allowEmojis); // Por defecto: false (cero emojis)
  const askStaffPreference = evoConfig.askStaffPreference !== false; // Por defecto: true si hay más de 1
  const notifyPersonalPhoneOnBooking = evoConfig.notifyPersonalPhoneOnBooking !== false;
  const handoffOnUnknownTopic = evoConfig.handoffOnUnknownTopic !== false; // Por defecto: true
  const personalAlertPhone = evoConfig.personalPhone || evoConfig.humanHandoffPhone || (tenant.settings as any)?.whatsappPhone || "";

  const toneGuide =
    tone === "formal"
      ? "Utiliza un trato respetuoso y formal (de 'usted'), educado y sobrio."
      : tone === "conciso"
      ? "Sé ultra breve y directo al grano, sin rodeos, respondiendo en 1 o 2 líneas concisas."
      : "Sé cercano, cálido, amigable (de 'vos') y propio de Paraguay.";

  const emojiRule = allowEmojis
    ? "FORMATO DE EMOJIS: Puedes incluir emojis sutiles y amigables (1 o 2 por mensaje) para brindar una atención cercana."
    : "REGLA OBLIGATORIA DE EMOJIS: NO USES NINGÚN EMOJI NI CARITAS bajo ninguna circunstancia (nada de 😉, 💈, ✂️, 🕒, 👍, ni ningún icono). Los mensajes deben ser totalmente sobrios, limpios y redactados con palabras y formato en negrita (*negrita*) solamente.";

  const staffMembers = tenant.staff || [];
  let staffPreferenceRule = "";
  if (staffMembers.length > 1 && askStaffPreference) {
    const staffNames = staffMembers.map((s) => s.name).join(", ");
    staffPreferenceRule = `
PREFERENCIA DE PROFESIONAL / EQUIPO:
El local cuenta con los siguientes miembros en su equipo: ${staffNames}.
Cuando un cliente consulte por disponibilidad o quiera agendar un servicio, y todavía NO haya indicado con quién desea atenderse:
1. Pregúntale con amabilidad y naturalidad si tiene preferencia por algún profesional en particular (adaptando el término al rubro del negocio, por ejemplo: peluquero/barbero si es barbería o peluquería, manicurista/estilista si es salón o estética, masajista/terapeuta si es spa o salud, técnico si es mecánica/taller, o profesional/especialista en general) o si prefiere con cualquiera que esté disponible.
2. Si el cliente elige a uno de ellos, agenda con ese profesional pasando su nombre en 'profesionalNombre' en 'crear_reserva'.
3. Si el cliente dice "con cualquiera", "el primero que tenga libre" o no tiene preferencia, no insistas y agenda con el primer profesional disponible.`;
  }

  const unknownTopicRule = handoffOnUnknownTopic
    ? `
REGLA ESTRICTA DE CONOCIMIENTO, PRODUCTOS Y DERIVACIÓN A ASESOR DEL LOCAL (HONESTIDAD Y CERO ALUCINACIÓN):
Si el cliente consulta sobre:
- Algún producto, marca o artículo que no esté en la lista oficial de productos del local.
- Algún servicio, tratamiento especial, duda técnica, contraindicación, o consulta médica/estética de la que no tengas certeza absoluta en esta instrucción.
- Convenios particulares, promociones especiales, horarios excepcionales o dudas del local que desconozcas.
- O solicita expresamente hablar con una persona/asesor:
1. NUNCA inventes respuestas ni supongas cosas de las que no tengas certeza.
2. Dile con amabilidad, honestidad y educación que no dispones de esa información exacta en este momento, pero que le avisás a un encargado o asistente del local para que se comunique con él/ella y le responda directamente.
3. Invoca OBLIGATORIAMENTE la herramienta 'derivar_a_humano' pasando en 'motivo' la consulta exacta del cliente (ej: "El cliente consulta si tienen minoxidil o productos anticaída").
4. Al ejecutarse la herramienta, el sistema le enviará una notificación automática por WhatsApp al encargado del local con la duda del cliente para que le responda.`
    : `
Si el cliente solicita hablar con una persona humana o tiene dudas complejas sobre transferencias o reclamos, utiliza 'derivar_a_humano'.`;

  const systemInstruction = `Sos el asistente virtual oficial de "${tenant.name}" en WhatsApp (Paraguay).
Tu objetivo es atender a los clientes con calidez, rapidez y profesionalismo, respondiendo dudas sobre precios, ubicación y ayudándoles a agendar turnos.

INFORMACIÓN DEL NEGOCIO:
- Fecha de hoy: ${todayStr} (Hora actual: ${currentTimeStr}).
- Moneda: Guaraníes paraguayos (₲).
- Tono de comunicación: ${toneGuide}
${customInstructions ? `- REGLAS PARTICULARES DEL LOCAL:\n${customInstructions}\n` : ""}
- Servicios disponibles:
${servicesListText}
- Productos disponibles en el local:
${productsListText}
${staffPreferenceRule}

REGLAS DE ATENCIÓN:
1. Sé conciso y claro (es WhatsApp, no mandes parrafadas gigantes). Usa formato amigable con negritas (*negrita*).
2. ${emojiRule}
3. Usa SIEMPRE formato de hora paraguayo estándar con 'hs' (ej: "10:00 hs", "15:30 hs", "18:00 hs"). Nunca uses "a. m." ni "p. m.".
4. Si el cliente pregunta por turnos u horarios, utiliza la herramienta 'consultar_disponibilidad' con la fecha correspondiente.
5. Si el cliente elige un horario y confirma, invoca 'crear_reserva'.
6. Si el cliente desea cambiar o reprogramar la fecha/hora de su turno existente, utiliza 'reprogramar_reserva'.
7. Si el cliente desea cancelar su turno, utiliza 'cancelar_reserva'.
8. Si el cliente consulta por puntos acumulados o programa de fidelización, utiliza 'consultar_puntos'.
9. Al confirmar o reprogramar una reserva, incluye el enlace de su turno digital (para ver detalles y agregar a Google Calendar o ver cómo llegar en Google Maps/Waze). NO menciones Apple Wallet bajo ningún concepto.
10. ${unknownTopicRule}
11. Mantén un trato educado, cálido y propio de Paraguay.`;

  const history = conversationState.getHistoryForGemini(context.tenantId, context.clientPhone);

  // Construir payload inicial para Gemini con memoria conversacional
  const initialPayload = {
    contents: [
      ...history,
      {
        role: "user",
        parts: [{ text: userMessage }],
      },
    ],
    systemInstruction: {
      parts: [{ text: systemInstruction }],
    },
    tools: AGENT_TOOLS,
  };

  try {
    const aiResponse = await geminiPool.generateContent(initialPayload, {
      intent: "consulta",
      clientPhone: context.clientPhone,
    });

    const candidate = aiResponse.candidates?.[0];
    const functionCallPart = candidate?.content?.parts?.find((p: any) => p.functionCall);

    // Si Gemini no llamó a ninguna función, retornar directamente su respuesta de texto
    if (!functionCallPart || !functionCallPart.functionCall) {
      const textReply = candidate?.content?.parts?.[0]?.text || "¡Hola! ¿En qué puedo ayudarte hoy?";
      conversationState.addTurn(context.tenantId, context.clientPhone, "user", userMessage);
      conversationState.addTurn(context.tenantId, context.clientPhone, "model", textReply);
      return {
        replyText: textReply,
        intent: "general",
      };
    }

    // 2. Ejecutar la función solicitada por la IA
    const fnName = functionCallPart.functionCall.name;
    const fnArgs = functionCallPart.functionCall.args || {};
    let toolResultData: any = {};
    let detectedIntent: "agenda" | "consulta" | "sipap_ocr" | "humano" | "general" = "consulta";

    console.log(`[WhatsApp Agent] Invocando tool: ${fnName}`, fnArgs);

    if (fnName === "consultar_servicios") {
      toolResultData = {
        servicios: tenant.services.map((s) => ({
          id: s.id,
          nombre: s.name,
          precioGs: s.price,
          duracionMinutos: s.durationMinutes,
        })),
      };
      detectedIntent = "consulta";
    } else if (fnName === "consultar_disponibilidad") {
      const targetDate = fnArgs.fecha || todayStr;
      let matchedService = tenant.services[0];
      if (fnArgs.nombre_servicio) {
        const query = fnArgs.nombre_servicio.toLowerCase();
        const found = tenant.services.find((s) => s.name.toLowerCase().includes(query));
        if (found) matchedService = found;
      }

      if (matchedService) {
        try {
          const slots = await getAvailableSlots({
            tenantId: tenant.id,
            serviceId: matchedService.id,
            date: targetDate,
          });

          // Filtrar horarios futuros
          const nowTs = Date.now();
          const upcomingSlots = slots.filter((s) => new Date(s.start).getTime() > nowTs).slice(0, 8);

          toolResultData = {
            fecha: targetDate,
            servicio: matchedService.name,
            servicioId: matchedService.id,
            horariosDisponibles: upcomingSlots.map((s) => {
              const d = new Date(s.start);
              return {
                startIso: s.start,
                hora: d.toLocaleTimeString("es-PY", {
                  hour: "2-digit",
                  minute: "2-digit",
                  timeZone: tenant.timezone,
                }),
              };
            }),
          };
        } catch (err: any) {
          toolResultData = { error: "No se pudieron calcular los turnos", details: err?.message };
        }
      } else {
        toolResultData = { error: "Servicio no encontrado" };
      }
      detectedIntent = "agenda";
    } else if (fnName === "crear_reserva") {
      try {
        const service = tenant.services.find((s) => s.id === fnArgs.servicioId) || tenant.services[0];
        const staffMembers = tenant.staff || [];

        let chosenStaff = null;
        if (fnArgs.profesionalNombre && fnArgs.profesionalNombre.toLowerCase() !== "cualquiera") {
          const query = fnArgs.profesionalNombre.toLowerCase();
          chosenStaff = staffMembers.find((s) => s.name.toLowerCase().includes(query));
        }
        if (!chosenStaff) {
          chosenStaff = staffMembers[0] || (await prisma.staff.findFirst({
            where: { tenantId: tenant.id, active: true },
          }));
        }

        if (!chosenStaff) {
          throw new Error("No hay profesionales disponibles en este momento");
        }

        const startDate = new Date(fnArgs.horarioInicio);
        const endDate = new Date(startDate.getTime() + (service?.durationMinutes || 45) * 60_000);

        const newAppointment = await prisma.appointment.create({
          data: {
            tenantId: tenant.id,
            serviceId: service.id,
            staffId: chosenStaff.id,
            clientName: fnArgs.nombreCliente || context.clientName || "Cliente WhatsApp",
            clientPhone: context.clientPhone,
            startTime: startDate,
            endTime: endDate,
            status: "CONFIRMED",
          },
        });

        const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://agendatepy.com";
        const linkTurno = `${appUrl}/${tenant.slug}/turno/${newAppointment.id}`;
        const address = (tenant.settings as any)?.address || `${tenant.name}, Paraguay`;

        const gStart = startDate.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
        const gEnd = endDate.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
        const linkGoogleCalendar = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(tenant.name + " · " + service.name)}&dates=${gStart}/${gEnd}&details=${encodeURIComponent("Turno en " + tenant.name)}&location=${encodeURIComponent(address)}`;
        const linkComoLlegar = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;

        // 1. Notificar al número personal del dueño si está configurado
        if (notifyPersonalPhoneOnBooking && personalAlertPhone) {
          const cleanOwnerDigits = personalAlertPhone.replace(/\D/g, "");
          if (cleanOwnerDigits.length >= 8) {
            const clientNameDisp = fnArgs.nombreCliente || context.clientName || "Cliente WhatsApp";
            const ownerMsg = allowEmojis
              ? `🔔 *Nuevo turno agendado en ${tenant.name}*\n👤 Cliente: ${clientNameDisp} (${context.clientPhone})\n✂️ Servicio: ${service.name}\n🕒 Horario: ${startDate.toLocaleString("es-PY", { timeZone: tenant.timezone })}\n💈 Profesional: ${chosenStaff.name}`
              : `*Nuevo turno agendado en ${tenant.name}*\nCliente: ${clientNameDisp} (${context.clientPhone})\nServicio: ${service.name}\nHorario: ${startDate.toLocaleString("es-PY", { timeZone: tenant.timezone })}\nProfesional: ${chosenStaff.name}`;

            sendWhatsAppMessage(cleanOwnerDigits, ownerMsg, false).catch((err) => {
              console.warn("[Notif Dueño] Error enviando alerta al celular personal:", err?.message);
            });
          }
        }

        // 2. Notificar al profesional asignado si tiene teléfono asociado
        prisma.staff.findUnique({
          where: { id: chosenStaff.id },
          include: { user: true },
        }).then((s) => {
          const staffPhone = s?.user?.phone?.replace(/\D/g, "");
          if (staffPhone && staffPhone.length >= 8 && staffPhone !== personalAlertPhone.replace(/\D/g, "")) {
            const staffMsg = allowEmojis
              ? `💈 *Nuevo turno asignado en ${tenant.name}*\n👤 Cliente: ${fnArgs.nombreCliente || context.clientName}\n✂️ Servicio: ${service.name}\n🕒 Horario: ${startDate.toLocaleString("es-PY", { timeZone: tenant.timezone })}`
              : `*Nuevo turno asignado en ${tenant.name}*\nCliente: ${fnArgs.nombreCliente || context.clientName}\nServicio: ${service.name}\nHorario: ${startDate.toLocaleString("es-PY", { timeZone: tenant.timezone })}`;

            sendWhatsAppMessage(staffPhone, staffMsg, false).catch(() => {});
          }
        }).catch(() => {});

        toolResultData = {
          reservaConfirmada: true,
          appointmentId: newAppointment.id,
          servicio: service.name,
          fechaHora: startDate.toLocaleString("es-PY", { timeZone: tenant.timezone }),
          profesional: chosenStaff.name,
          linkTurno,
          linkGoogleCalendar,
          linkComoLlegar,
        };
        detectedIntent = "agenda";
      } catch (err: any) {
        toolResultData = { reservaConfirmada: false, error: err?.message };
      }
    } else if (fnName === "reprogramar_reserva") {
      try {
        const clientDigits = context.clientPhone.replace(/\D/g, "").slice(-8);
        const activeAppt = await prisma.appointment.findFirst({
          where: {
            tenantId: tenant.id,
            clientPhone: { contains: clientDigits },
            startTime: { gte: new Date() },
            status: { in: ["CONFIRMED", "PENDING_ACTION"] },
          },
          include: { service: true, staff: { include: { user: true } } },
          orderBy: { startTime: "asc" },
        });

        if (!activeAppt) {
          toolResultData = {
            reprogramado: false,
            error: "No encontramos ningún turno próximo activo para cambiar.",
          };
        } else {
          const newStart = new Date(fnArgs.nuevoHorarioInicio);
          const newEnd = new Date(newStart.getTime() + (activeAppt.service?.durationMinutes || 45) * 60_000);

          await prisma.appointment.update({
            where: { id: activeAppt.id },
            data: { startTime: newStart, endTime: newEnd, status: "CONFIRMED" },
          });

          const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://agendatepy.com";
          const linkTurno = `${appUrl}/${tenant.slug}/turno/${activeAppt.id}`;
          const address = (tenant.settings as any)?.address || `${tenant.name}, Paraguay`;
          const gStart = newStart.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
          const gEnd = newEnd.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
          const linkGoogleCalendar = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(tenant.name + " · " + activeAppt.service.name)}&dates=${gStart}/${gEnd}&details=${encodeURIComponent("Turno reprogramado")}&location=${encodeURIComponent(address)}`;
          const linkComoLlegar = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;

          // Notificar al barbero por WhatsApp
          const staffPhone = activeAppt.staff?.user?.phone?.replace(/\D/g, "");
          if (staffPhone && staffPhone.length >= 8) {
            sendWhatsAppMessage(
              staffPhone,
              `📅 *Turno Reprogramado en ${tenant.name}*\n👤 Cliente: ${activeAppt.clientName}\n✂️ Servicio: ${activeAppt.service.name}\n🕒 Nuevo Horario: ${newStart.toLocaleString("es-PY", { timeZone: tenant.timezone })}`,
              false
            ).catch(() => {});
          }

          toolResultData = {
            reprogramado: true,
            servicio: activeAppt.service.name,
            nuevoHorario: newStart.toLocaleString("es-PY", { timeZone: tenant.timezone }),
            profesional: activeAppt.staff.name,
            linkTurno,
            linkGoogleCalendar,
            linkComoLlegar,
          };
          detectedIntent = "agenda";
        }
      } catch (err: any) {
        toolResultData = { reprogramado: false, error: err?.message };
      }
    } else if (fnName === "cancelar_reserva") {
      try {
        const clientDigits = context.clientPhone.replace(/\D/g, "").slice(-8);
        const activeAppt = await prisma.appointment.findFirst({
          where: {
            tenantId: tenant.id,
            clientPhone: { contains: clientDigits },
            startTime: { gte: new Date() },
            status: { in: ["CONFIRMED", "PENDING_ACTION"] },
          },
          include: { service: true, staff: { include: { user: true } } },
          orderBy: { startTime: "asc" },
        });

        if (!activeAppt) {
          toolResultData = {
            cancelado: false,
            error: "No tenés ningún turno próximo activo para cancelar.",
          };
        } else {
          await prisma.appointment.update({
            where: { id: activeAppt.id },
            data: { status: "CANCELLED" },
          });

          // Notificar al barbero que se liberó el horario
          const staffPhone = activeAppt.staff?.user?.phone?.replace(/\D/g, "");
          if (staffPhone && staffPhone.length >= 8) {
            sendWhatsAppMessage(
              staffPhone,
              `❌ *Turno Cancelado en ${tenant.name}*\nEl cliente ${activeAppt.clientName} canceló su turno para ${activeAppt.service.name} (${activeAppt.startTime.toLocaleString("es-PY", { timeZone: tenant.timezone })}). El horario quedó libre.`,
              false
            ).catch(() => {});
          }

          toolResultData = {
            cancelado: true,
            servicio: activeAppt.service.name,
            horarioLiberado: activeAppt.startTime.toLocaleString("es-PY", { timeZone: tenant.timezone }),
          };
          detectedIntent = "agenda";
        }
      } catch (err: any) {
        toolResultData = { cancelado: false, error: err?.message };
      }
    } else if (fnName === "consultar_puntos") {
      try {
        const clientDigits = context.clientPhone.replace(/\D/g, "").slice(-8);
        const clientRecord = await prisma.client.findFirst({
          where: {
            tenantId: tenant.id,
            phone: { contains: clientDigits },
          },
        });

        const rewards = await prisma.loyaltyReward.findMany({
          where: { tenantId: tenant.id, active: true },
          orderBy: { pointsRequired: "asc" },
        });

        const pts = clientRecord?.points || 0;
        toolResultData = {
          cliente: clientRecord?.name || context.clientName,
          puntosAcumulados: pts,
          recompensas: rewards.map((r) => ({
            beneficio: r.name,
            puntosNecesarios: r.pointsRequired,
            descuentoGs: r.discountGuaranies,
            puedeCanjear: pts >= r.pointsRequired,
          })),
        };
        detectedIntent = "consulta";
      } catch (err: any) {
        toolResultData = { error: err?.message };
      }
    } else if (fnName === "consultar_mis_turnos") {
      const turnos = await prisma.appointment.findMany({
        where: {
          tenantId: tenant.id,
          clientPhone: { contains: context.clientPhone.replace(/\D/g, "").slice(-8) },
          startTime: { gte: new Date() },
          status: { in: ["CONFIRMED", "PENDING_ACTION"] },
        },
        include: { service: true, staff: true },
        take: 3,
      });

      toolResultData = {
        turnos: turnos.map((t) => ({
          id: t.id,
          servicio: t.service.name,
          profesional: t.staff.name,
          fecha: t.startTime.toLocaleString("es-PY", { timeZone: tenant.timezone }),
          estado: t.status,
        })),
      };
      detectedIntent = "consulta";
    } else if (fnName === "derivar_a_humano") {
      const motivoConsulta = fnArgs.motivo || userMessage;
      let avisoEnviado = false;

      // Notificar al celular personal del encargado/dueño por WhatsApp
      if (personalAlertPhone) {
        const cleanOwnerDigits = personalAlertPhone.replace(/\D/g, "");
        if (cleanOwnerDigits.length >= 8) {
          const clientNameDisp = context.clientName || "Cliente WhatsApp";
          const alertMsg = allowEmojis
            ? `⚠️ *Consulta de Cliente para Asesor Humano en ${tenant.name}*\n👤 Cliente: ${clientNameDisp} (${context.clientPhone})\n❓ Consulta: "${motivoConsulta}"\n📲 Por favor comunícate con el cliente para responderle a la brevedad.`
            : `*Consulta de Cliente para Asesor Humano en ${tenant.name}*\nCliente: ${clientNameDisp} (${context.clientPhone})\nConsulta: "${motivoConsulta}"\nPor favor comunícate con el cliente para responderle a la brevedad.`;

          sendWhatsAppMessage(cleanOwnerDigits, alertMsg, false).catch((err) => {
            console.warn("[Notif Asesor] Error enviando alerta al celular del local:", err?.message);
          });
          avisoEnviado = true;
        }
      }

      toolResultData = {
        derivado: true,
        notificadoAlLocal: avisoEnviado,
        mensaje: "He registrado la consulta y ya le avisé a un encargado del local para que se comunique con el cliente a la brevedad.",
      };
      detectedIntent = "humano";
    }

    // 3. Enviar el resultado de la función de vuelta a Gemini para redactar la respuesta final
    const followupPayload = {
      contents: [
        ...history,
        {
          role: "user",
          parts: [{ text: userMessage }],
        },
        {
          role: "model",
          parts: [functionCallPart],
        },
        {
          role: "user",
          parts: [
            {
              functionResponse: {
                name: fnName,
                response: { content: toolResultData },
              },
            },
          ],
        },
      ],
      systemInstruction: {
        parts: [{ text: systemInstruction }],
      },
    };

    const finalResponse = await geminiPool.generateContent(followupPayload, {
      intent: detectedIntent,
      clientPhone: context.clientPhone,
    });

    const replyText =
      finalResponse.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Listo, ya procesé tu solicitud. ¿Te gustaría algo más?";

    conversationState.addTurn(context.tenantId, context.clientPhone, "user", userMessage);
    conversationState.addTurn(context.tenantId, context.clientPhone, "model", replyText);

    return {
      replyText,
      intent: detectedIntent,
      actionPerformed: fnName,
    };
  } catch (error: any) {
    console.error("[WhatsApp Agent] Error procesando con Gemini:", error);
    return {
      replyText:
        "Disculpá, tuve una pequeña interrupción momentánea. ¿Podrías reiterarme qué servicio o fecha te gustaría agendar?",
      intent: "general",
    };
  }
}
