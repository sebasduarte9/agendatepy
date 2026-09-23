import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatInTimeZone } from "date-fns-tz";
import { es } from "date-fns/locale";
import { prisma } from "@/lib/db";
import { whatsappPhoneFromSettings } from "@/lib/scheduling/tenant-settings";
import { HOLD_MINUTES } from "@/lib/scheduling/types";
import WhatsAppConfirm from "@/components/booking/WhatsAppConfirm";

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
      service: { select: { name: true } },
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
      <div>
        <ol className="flex gap-2">
          {[1, 2, 3, 4].map((item) => (
            <li key={item} className="h-1.5 flex-1 rounded-full bg-primary" />
          ))}
        </ol>
        <p className="mt-8 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
          {appointment.tenant.name}
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
          {expired ? "Este turno ya se liberó" : "Turno reservado"}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          {expired
            ? "Pasaron los 15 minutos sin confirmación. Volvé a elegir un horario."
            : `${appointment.clientName}, tu lugar para ${appointment.service.name} quedó apartado ${HOLD_MINUTES} minutos. Confirmalo por WhatsApp antes de que se libere.`}
        </p>
        <div className="mt-6 rounded-3xl border border-slate-200 bg-white px-4 py-4">
          <p className="font-semibold text-slate-900">{appointment.service.name}</p>
          <p className="mt-1 text-sm capitalize text-slate-600">
            {when} · {time}
          </p>
        </div>
      </div>

      {expired ? (
        <Link
          href={`/${slug}/reservar`}
          className="mt-8 flex h-14 items-center justify-center rounded-full bg-primary text-base font-semibold text-white"
        >
          Elegir otro horario
        </Link>
      ) : (
        <WhatsAppConfirm href={phone ? href : null} />
      )}
    </main>
  );
}
