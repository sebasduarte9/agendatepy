import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { sendWhatsAppMessage } from "@/lib/evolution";
import { formatInTimeZone } from "date-fns-tz";
import { es } from "date-fns/locale";

export const dynamic = "force-dynamic";

interface ConfiguredTemplate {
  id: string;
  name: string;
  trigger: string;
  body: string;
  enabled: boolean;
  timingMinutesBefore?: number;
}

/**
 * CRON JOB DE RECORDATORIOS AUTOMÁTICOS POR WHATSAPP
 *
 * Endpoint configurable llamado periódicamente (ej. cada 15 o 30 minutos).
 * Inspecciona todos los negocios activos, lee sus plantillas y tiempos de antelación
 * configurados por el dueño (ej. 24h, 2h, 1h, o minutos personalizados),
 * detecta citas confirmadas en esa ventana y dispara el recordatorio con Evolution API.
 */
export async function GET(request: NextRequest) {
  return handleCronReminders(request);
}

export async function POST(request: NextRequest) {
  return handleCronReminders(request);
}

async function handleCronReminders(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (process.env.NODE_ENV === "production" && !cronSecret) {
    return NextResponse.json({ ok: false, error: "CRON_SECRET no está configurado." }, { status: 503 });
  }
  if (process.env.NODE_ENV === "production" && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const summary = {
    executedAt: now.toISOString(),
    processedTenants: 0,
    totalRemindersSent: 0,
    skippedAlreadySent: 0,
    errors: [] as string[],
  };

  try {
    // 1. Obtener todos los tenants activos
    const tenants = await prisma.tenant.findMany({
      where: { status: "ACTIVE" },
      select: {
        id: true,
        name: true,
        slug: true,
        subdomain: true,
        timezone: true,
        settings: true,
      },
    });

    summary.processedTenants = tenants.length;

    // 2. Procesar cada negocio
    for (const tenant of tenants) {
      const settings = (tenant.settings as Record<string, any>) || {};
      const evolutionConfig = settings.evolutionConfig || {};
      const whatsappInstance = typeof evolutionConfig.instance === "string" ? evolutionConfig.instance : "";
      const rawTemplates = settings.whatsappTemplates as ConfiguredTemplate[] | undefined;

      // Plantillas activas del negocio (o fallbacks estándar si no personalizó aún)
      const templates: ConfiguredTemplate[] = Array.isArray(rawTemplates) && rawTemplates.length > 0
        ? rawTemplates
        : [
            {
              id: "wt-recordatorio-24h",
              name: "Recordatorio 24 Horas Antes",
              trigger: "recordatorio_24h",
              timingMinutesBefore: 1440,
              body: "¡Hola {cliente}! Te recordamos tu turno de mañana *{fecha} a las {hora} hs* para *{servicio}* en *{negocio}*.\n\n¿Nos confirmás tu asistencia? Si necesitás reprogramar o cancelar, podés hacerlo con un clic aquí:\n{link_autogestion}",
              enabled: true,
            },
            {
              id: "wt-recordatorio-2h",
              name: "Recordatorio 2 Horas Antes",
              trigger: "recordatorio_2h",
              timingMinutesBefore: 120,
              body: "¡Hola {cliente}! Te recordamos que tu turno es en 2 horas ({hora} hs). Te estamos esperando en {negocio} ({direccion}). ¡Nos vemos pronto!",
              enabled: true,
            },
          ];

      // Filtrar únicamente plantillas de recordatorio habilitadas que tengan tiempo configurado
      const activeReminderTemplates = templates.filter(
        (t) =>
          t.enabled &&
          t.trigger !== "confirmacion" &&
          t.trigger !== "cancelacion" &&
          (t.timingMinutesBefore !== undefined ||
            t.trigger === "recordatorio_24h" ||
            t.trigger === "recordatorio_2h")
      );

      for (const tpl of activeReminderTemplates) {
        // Resolver tiempo de antelación en minutos
        const timingMinutes =
          tpl.timingMinutesBefore ??
          (tpl.trigger === "recordatorio_24h" ? 1440 : tpl.trigger === "recordatorio_2h" ? 120 : 0);

        if (timingMinutes < 0 || !whatsappInstance || evolutionConfig.connected !== true) continue;

        // Ventana de tolerancia: citas cuyo inicio cae dentro de [timing - 35 min, timing + 35 min]
        const targetDate = new Date(now.getTime() + timingMinutes * 60 * 1000);
        const windowStart = new Date(targetDate.getTime() - 35 * 60 * 1000);
        const windowEnd = new Date(targetDate.getTime() + 35 * 60 * 1000);

        // Buscar citas confirmadas en este local
        const matchingAppointments = await prisma.appointment.findMany({
          where: {
            tenantId: tenant.id,
            status: "CONFIRMED",
            startTime: {
              gte: windowStart,
              lte: windowEnd,
            },
          },
          include: {
            service: { select: { name: true, price: true } },
            staff: { select: { name: true } },
          },
        });

        for (const app of matchingAppointments) {
          const eventKey = `REMINDER_SENT_${tpl.id}_${app.id}`;

          // Evitar envíos duplicados comprobando en PlatformEvent
          const existingEvent = await prisma.platformEvent.findFirst({
            where: {
              tenantId: tenant.id,
              entityType: "Appointment",
              entityId: app.id,
              event: eventKey,
            },
          });

          if (existingEvent) {
            summary.skippedAlreadySent++;
            continue;
          }

          // Formatear fecha y hora en el huso horario oficial del negocio
          const tz = tenant.timezone || "America/Asuncion";
          const formattedTime = formatInTimeZone(app.startTime, tz, "HH:mm");
          const formattedDate = formatInTimeZone(app.startTime, tz, "EEEE d 'de' MMMM", { locale: es });
          const clientLink = `https://${process.env.NEXT_PUBLIC_ROOT_DOMAIN || "agendatepy.com"}/${tenant.subdomain || tenant.slug}/reservar/listo?hold=${app.id}`;
          const businessLink = `https://${process.env.NEXT_PUBLIC_ROOT_DOMAIN || "agendatepy.com"}/${tenant.subdomain || tenant.slug}`;

          // Reemplazo dinámico de etiquetas en la plantilla
          const renderedBody = tpl.body
            .replace(/{cliente}/g, app.clientName)
            .replace(/{servicio}/g, app.service?.name || "Servicio")
            .replace(/{profesional}/g, app.staff?.name || "Profesional asignado")
            .replace(/{fecha}/g, formattedDate)
            .replace(/{hora}/g, formattedTime)
            .replace(/{negocio}/g, tenant.name)
            .replace(/{direccion}/g, settings.address || "Nuestro local")
            .replace(/{link_autogestion}/g, clientLink)
            .replace(/{link_negocio}/g, businessLink);

          const cleanPhone = (app.clientPhone || "").replace(/\D/g, "");
          if (cleanPhone.length >= 8) {
            try {
              await sendWhatsAppMessage(cleanPhone, renderedBody, false, whatsappInstance);

              // Registrar evento atómico de envío exitoso
              await prisma.platformEvent.create({
                data: {
                  tenantId: tenant.id,
                  entityType: "Appointment",
                  entityId: app.id,
                  event: eventKey,
                  metadata: {
                    templateId: tpl.id,
                    templateName: tpl.name,
                    clientPhone: cleanPhone,
                    timingMinutesBefore: timingMinutes,
                    sentAt: new Date().toISOString(),
                  },
                },
              });

              summary.totalRemindersSent++;
            } catch (err: any) {
              summary.errors.push(`Error enviando a ${cleanPhone} (cita ${app.id}): ${err?.message || err}`);
            }
          }
        }
      }
    }

    return NextResponse.json({
      ok: true,
      message: `Cron completado. ${summary.totalRemindersSent} recordatorios enviados.`,
      summary,
    });
  } catch (error: any) {
    console.error("[Cron Reminders] Error en la ejecución:", error);
    return NextResponse.json(
      { ok: false, error: error?.message || "Error al procesar recordatorios automáticos." },
      { status: 500 }
    );
  }
}
