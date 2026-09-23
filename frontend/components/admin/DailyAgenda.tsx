import type { ReactNode } from "react";
import { formatInTimeZone, fromZonedTime } from "date-fns-tz";
import { es } from "date-fns/locale";
import { BadgeCheck, CalendarClock, Clock3 } from "lucide-react";
import { prisma } from "@/lib/db";
import { requireHostTenant } from "@/lib/admin/tenant-access";
import { agendaLabel, agendaTone, type AgendaTone } from "@/lib/admin/agenda-status";
import AppointmentActions from "./AppointmentActions";

export default async function DailyAgenda({ slug }: { slug: string }) {
  const tenant = await requireHostTenant(slug);
  const now = new Date();
  const civil = formatInTimeZone(now, tenant.timezone, "yyyy-MM-dd");
  const dayStart = fromZonedTime(`${civil}T00:00:00`, tenant.timezone);
  const dayEnd = fromZonedTime(`${addCivilDays(civil, 1)}T00:00:00`, tenant.timezone);

  const appointments = await prisma.appointment.findMany({
    where: {
      tenantId: tenant.id,
      startTime: { lt: dayEnd },
      endTime: { gt: dayStart },
    },
    orderBy: { startTime: "asc" },
    select: {
      id: true,
      clientName: true,
      clientPhone: true,
      startTime: true,
      endTime: true,
      status: true,
      expiresAt: true,
      service: { select: { name: true } },
      staff: { select: { name: true } },
    },
  });

  const tones = appointments.map((item) => agendaTone(item.status, item.expiresAt, now.getTime()));
  const confirmed = tones.filter((tone) => tone === "confirmed").length;
  const pending = tones.filter((tone) => tone === "pending").length;
  const cancelled = tones.filter((tone) => tone === "cancelled").length;

  return (
    <section>
      <p className="text-sm text-slate-500">
        {formatInTimeZone(now, tenant.timezone, "EEEE d 'de' MMMM", { locale: es })}
      </p>

      <dl className="mt-5 grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Confirmados"
          value={confirmed}
          icon={<BadgeCheck className="h-5 w-5" />}
          className="border-emerald-100 bg-gradient-to-br from-white to-emerald-50 shadow-emerald-100"
          iconClass="bg-emerald-500 text-white"
        />
        <StatCard
          label="Pendientes"
          value={pending}
          icon={<Clock3 className="h-5 w-5" />}
          className="border-amber-100 bg-gradient-to-br from-white to-amber-50 shadow-amber-100"
          iconClass="bg-amber-500 text-white"
        />
        <StatCard
          label="Cancelados"
          value={cancelled}
          icon={<CalendarClock className="h-5 w-5" />}
          className="border-rose-100 bg-gradient-to-br from-white to-rose-50 shadow-rose-100"
          iconClass="bg-rose-500 text-white"
        />
      </dl>

      {appointments.length === 0 ? (
        <p className="mt-8 rounded-3xl border border-dashed border-slate-300 bg-white px-4 py-14 text-center text-sm text-slate-500 shadow-sm">
          No hay turnos para hoy.
        </p>
      ) : (
        <ol className="mt-8 space-y-3">
          {appointments.map((item, index) => {
            const tone = tones[index];
            const phone = item.clientPhone.replace(/\D/g, "");
            return (
              <li
                key={item.id}
                className="rounded-3xl border border-slate-200/80 bg-white p-4 shadow-sm shadow-slate-200/80"
              >
                <div className="flex items-start gap-4">
                  <div
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-sm font-bold text-white shadow-sm"
                    style={{ backgroundColor: avatarColor(item.clientName) }}
                    aria-hidden="true"
                  >
                    {initials(item.clientName)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-900">{item.clientName}</p>
                        <p className="mt-0.5 text-sm text-slate-500">
                          {formatInTimeZone(item.startTime, tenant.timezone, "HH:mm")}
                          {" – "}
                          {formatInTimeZone(item.endTime, tenant.timezone, "HH:mm")}
                          {" · "}
                          {item.service.name}
                        </p>
                        <p className="text-sm text-slate-500">{item.staff.name}</p>
                        {phone && (
                          <a
                            href={`https://wa.me/${phone}`}
                            className="mt-1 inline-block text-sm font-medium text-whatsapp"
                          >
                            {item.clientPhone}
                          </a>
                        )}
                      </div>
                      <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${badgeClass(tone)}`}>
                        {agendaLabel(tone, item.status)}
                      </span>
                    </div>
                    <AppointmentActions
                      appointmentId={item.id}
                      canConfirm={tone === "pending"}
                      canCancel={tone === "pending" || tone === "confirmed"}
                    />
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}

function StatCard({
  label,
  value,
  icon,
  className,
  iconClass,
}: {
  label: string;
  value: number;
  icon: ReactNode;
  className: string;
  iconClass: string;
}) {
  return (
    <div className={`rounded-3xl border p-5 shadow-sm ${className}`}>
      <div className={`flex h-10 w-10 items-center justify-center rounded-2xl shadow-sm ${iconClass}`}>
        {icon}
      </div>
      <dd className="mt-4 text-3xl font-bold tracking-tight text-slate-900">{value}</dd>
      <dt className="mt-1 text-sm font-medium text-slate-500">{label}</dt>
    </div>
  );
}

export function AgendaSkeleton() {
  return (
    <div className="mt-5 space-y-4" aria-hidden="true">
      <div className="grid gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }, (_, index) => (
          <div key={index} className="h-32 animate-pulse rounded-3xl bg-white" />
        ))}
      </div>
      {Array.from({ length: 3 }, (_, index) => (
        <div key={index} className="h-28 animate-pulse rounded-3xl bg-white" />
      ))}
    </div>
  );
}

function badgeClass(tone: AgendaTone): string {
  if (tone === "confirmed") return "bg-emerald-100 text-emerald-800";
  if (tone === "pending") return "bg-amber-100 text-amber-800";
  if (tone === "cancelled") return "bg-rose-100 text-rose-800";
  if (tone === "expired") return "bg-slate-100 text-slate-500";
  return "bg-slate-100 text-slate-600";
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("") || "?";
}

function avatarColor(name: string): string {
  const palette = ["#5b31e6", "#0f766e", "#b45309", "#be123c", "#1d4ed8", "#334155"];
  const index = [...name].reduce((sum, char) => sum + char.charCodeAt(0), 0) % palette.length;
  return palette[index];
}

function addCivilDays(civil: string, days: number): string {
  const [year, month, day] = civil.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + days));
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
