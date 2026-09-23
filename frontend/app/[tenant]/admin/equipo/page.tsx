import { requireHostTenant } from "@/lib/admin/tenant-access";
import { prisma } from "@/lib/db";

const DAYS = ["", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

export default async function EquipoAdminPage({
  params,
}: {
  params: Promise<{ tenant: string }>;
}) {
  const { tenant: slug } = await params;
  const tenant = await requireHostTenant(slug);
  const staff = await prisma.staff.findMany({
    where: { tenantId: tenant.id },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      active: true,
      schedules: {
        orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
        select: { dayOfWeek: true, startTime: true, endTime: true },
      },
    },
  });

  return (
    <main className="px-4 py-6 sm:px-8 sm:py-8">
      <h1 className="text-2xl font-bold text-slate-900">Equipo</h1>
      {staff.length === 0 ? (
        <p className="mt-6 text-sm text-slate-500">Todavía no hay profesionales.</p>
      ) : (
        <ul className="mt-6 space-y-3">
          {staff.map((person) => (
            <li key={person.id} className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
              <div className="flex items-center justify-between gap-3">
                <p className="font-semibold text-slate-900">{person.name}</p>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                    person.active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {person.active ? "Activo" : "Inactivo"}
                </span>
              </div>
              {person.schedules.length === 0 ? (
                <p className="mt-2 text-sm text-slate-500">Sin jornada cargada.</p>
              ) : (
                <ul className="mt-2 space-y-1 text-sm text-slate-600">
                  {person.schedules.map((schedule) => (
                    <li key={`${person.id}-${schedule.dayOfWeek}-${schedule.startTime.toISOString()}`}>
                      {DAYS[schedule.dayOfWeek]} {timeLabel(schedule.startTime)}–{timeLabel(schedule.endTime)}
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

function timeLabel(value: Date): string {
  const hours = String(value.getUTCHours()).padStart(2, "0");
  const minutes = String(value.getUTCMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}
