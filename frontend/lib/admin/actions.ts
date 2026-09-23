"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireHostTenant } from "@/lib/admin/tenant-access";

const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export type AdminActionState = { ok: true } | { ok: false; message: string } | null;

export async function confirmAppointment(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const tenant = await tenantFromHost();
  const appointmentId = readId(formData);
  if (!appointmentId) return { ok: false, message: "Turno inválido." };

  const appointment = await prisma.appointment.findFirst({
    where: { id: appointmentId, tenantId: tenant.id },
    select: { id: true, status: true, expiresAt: true },
  });
  if (!appointment) return { ok: false, message: "Ese turno no es de este local." };
  if (appointment.status !== "PENDING_ACTION") {
    return { ok: false, message: "Solo se confirma un turno pendiente." };
  }
  if (appointment.expiresAt && appointment.expiresAt.getTime() <= Date.now()) {
    await prisma.appointment.update({
      where: { id: appointment.id },
      data: { status: "EXPIRED" },
    });
    revalidateAdmin(tenant.subdomain);
    return { ok: false, message: "El plazo de 15 minutos ya venció." };
  }

  await prisma.appointment.update({
    where: { id: appointment.id },
    data: { status: "CONFIRMED", expiresAt: null },
  });
  revalidateAdmin(tenant.subdomain);
  return { ok: true };
}

export async function cancelAppointment(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const tenant = await tenantFromHost();
  const appointmentId = readId(formData);
  if (!appointmentId) return { ok: false, message: "Turno inválido." };

  const appointment = await prisma.appointment.findFirst({
    where: { id: appointmentId, tenantId: tenant.id },
    select: { id: true, status: true, expiresAt: true },
  });
  if (!appointment) return { ok: false, message: "Ese turno no es de este local." };
  if (appointment.status === "CANCELLED") {
    return { ok: false, message: "El turno ya está cancelado." };
  }
  if (
    appointment.status === "EXPIRED" ||
    (appointment.status === "PENDING_ACTION" &&
      appointment.expiresAt &&
      appointment.expiresAt.getTime() <= Date.now())
  ) {
    return { ok: false, message: "Ese turno ya venció." };
  }

  await prisma.appointment.update({
    where: { id: appointment.id },
    data: { status: "CANCELLED", expiresAt: null },
  });
  revalidateAdmin(tenant.subdomain);
  return { ok: true };
}

async function tenantFromHost() {
  const slug = (await headers()).get("x-tenant-slug");
  if (!slug) notFound();
  return requireHostTenant(slug);
}

function readId(formData: FormData): string | null {
  const value = formData.get("appointmentId");
  return typeof value === "string" && UUID.test(value) ? value : null;
}

function revalidateAdmin(slug: string) {
  revalidatePath(`/${slug}/admin`);
  revalidatePath(`/${slug}/admin`, "layout");
}
