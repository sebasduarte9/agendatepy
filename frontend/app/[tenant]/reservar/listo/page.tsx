import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatInTimeZone } from "date-fns-tz";
import { es } from "date-fns/locale";
import { prisma } from "@/lib/db";
import { whatsappPhoneFromSettings } from "@/lib/scheduling/tenant-settings";
import { HOLD_MINUTES } from "@/lib/scheduling/types";
import WhatsAppConfirm from "@/components/booking/WhatsAppConfirm";
import SmartCalendarSync from "@/components/booking/SmartCalendarSync";

export const dynamic = "force-dynamic";

const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type PageProps = {
  params: Promise<{ tenant: string }>;
  searchParams: Promise<{ hold?: string }>;
};

export const metadata: Metadata = {
  title: "Turno reservado",
};

function checkIsExpired(status: string, expiresAt: Date | null): boolean {
  return (
    status !== "PENDING_ACTION" ||
    (expiresAt !== null && expiresAt.getTime() <= Date.now())
  );
}

export default async function ReservaListaPage({ params, searchParams }: PageProps) {
  const { tenant: slug } = await params;
  const { hold } = await searchParams;
  if (!hold || !UUID.test(hold)) notFound();

  const appointment = await prisma.appointment.findFirst({
    where: { id: hold, tenant: { subdomain: slug } },
    select: {
      clientName: true,
      status: true,
      expiresAt: true,
      startTime: true,
      endTime: true,
      service: { select: { name: true, price: true, durationMinutes: true } },
      staff: { select: { name: true } },
      tenant: { select: { name: true, timezone: true, settings: true } },
    },
  });

  if (!appointment) notFound();

  const expired = checkIsExpired(appointment.status, appointment.expiresAt);

  const time = formatInTimeZone(appointment.startTime, appointment.tenant.timezone, "HH:mm");
  const when = formatInTimeZone(
    appointment.startTime,
    appointment.tenant.timezone,
    "EEEE d 'de' MMMM",
    { locale: es },
  );
  const text = `Hola, soy ${appointment.clientName}, acabo de agendar un turno para ${appointment.service.name} a las ${time}. Envío este mensaje para confirmar.`;
  const phone = whatsappPhoneFromSettings(appointment.tenant.settings);
  const href = `https://wa.me/${phone ?? ""}?text=${encodeURIComponent(text)}`;

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-between px-4 pt-10 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
      <div className="space-y-4">
        <ol className="flex gap-2">
          {[1, 2, 3, 4].map((item) => (
            <li key={item} className="h-1.5 flex-1 rounded-full bg-primary" />
          ))}
        </ol>
        <div>
          <p className="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
            {appointment.tenant.name}
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
            {expired ? "Este turno ya se liberó" : "¡Turno reservado con éxito!"}
          </h1>
          <p className="mt-2 text-xs leading-relaxed text-slate-600">
            {expired
              ? "Pasaron los 15 minutos sin confirmación. Volvé a elegir un horario."
              : `${appointment.clientName}, tu lugar para ${appointment.service.name} quedó apartado. Confirmalo por WhatsApp para asegurar tu cupo.`}
          </p>
        </div>

        {/* Resumen del Turno */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="font-bold text-slate-900">{appointment.service.name}</p>
          <p className="mt-1 text-xs capitalize text-slate-600">
            📅 {when} · ⏰ {time} hs
          </p>
          {appointment.staff?.name && (
            <p className="mt-1 text-xs text-slate-500">
              👤 Profesional: <strong className="text-slate-700">{appointment.staff.name}</strong>
            </p>
          )}
        </div>

        {/* Sincronización Inteligente de Calendario (Google Calendar en Android / Apple Reminders en iPhone) */}
        {!expired && (
          <SmartCalendarSync
            appointment={{
              serviceName: appointment.service.name,
              staffName: appointment.staff?.name || "Profesional asignado",
              clientName: appointment.clientName,
              startTime: appointment.startTime,
              endTime: appointment.endTime,
              price: appointment.service.price,
              durationMinutes: appointment.service.durationMinutes,
            }}
            business={{
              name: appointment.tenant.name,
              timezone: appointment.tenant.timezone,
            }}
          />
        )}
      </div>

      <div className="mt-6 pt-2">
        {expired ? (
          <Link
            href={`/${slug}/reservar`}
            className="flex h-13 items-center justify-center rounded-2xl bg-primary text-sm font-bold text-white shadow-md"
          >
            Elegir otro horario
          </Link>
        ) : (
          <WhatsAppConfirm href={phone ? href : null} />
        )}
      </div>
    </main>
  );
}
