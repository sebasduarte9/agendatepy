import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { whatsappPhoneFromSettings } from "@/lib/scheduling/tenant-settings";
import ClientAppointmentManager from "@/components/booking/ClientAppointmentManager";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ tenant: string; id: string }>;
};

const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { tenant } = await params;
  return { title: `Mi Turno · ${tenant}` };
}

export default async function TurnoClientePage({ params }: PageProps) {
  const { tenant: slug, id } = await params;
  if (!id || !UUID.test(id)) notFound();

  const appointment = await prisma.appointment.findFirst({
    where: { id, tenant: { subdomain: slug } },
    select: {
      id: true,
      clientName: true,
      clientPhone: true,
      startTime: true,
      endTime: true,
      status: true,
      service: {
        select: {
          name: true,
          durationMinutes: true,
          price: true,
        },
      },
      staff: {
        select: {
          name: true,
        },
      },
      tenant: {
        select: {
          name: true,
          subdomain: true,
          timezone: true,
          settings: true,
        },
      },
    },
  });

  if (!appointment) notFound();

  const whatsappPhone = whatsappPhoneFromSettings(appointment.tenant.settings);

  return (
    <ClientAppointmentManager
      appointment={{
        id: appointment.id,
        clientName: appointment.clientName,
        clientPhone: appointment.clientPhone,
        startTime: appointment.startTime.toISOString(),
        endTime: appointment.endTime.toISOString(),
        status: appointment.status,
        service: appointment.service,
        staff: appointment.staff,
        tenant: {
          name: appointment.tenant.name,
          subdomain: appointment.tenant.subdomain,
          timezone: appointment.tenant.timezone,
          whatsappPhone,
        },
      }}
    />
  );
}
