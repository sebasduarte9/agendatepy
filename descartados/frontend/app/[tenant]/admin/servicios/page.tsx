import { requireHostTenant } from "@/lib/admin/tenant-access";
import { prisma } from "@/lib/db";

export default async function ServiciosAdminPage({
  params,
}: {
  params: Promise<{ tenant: string }>;
}) {
  const { tenant: slug } = await params;
  const tenant = await requireHostTenant(slug);
  const services = await prisma.service.findMany({
    where: { tenantId: tenant.id },
    orderBy: { name: "asc" },
    select: { id: true, name: true, durationMinutes: true, price: true },
  });

  return (
    <main className="px-4 py-6 sm:px-8 sm:py-8">
      <h1 className="text-2xl font-bold text-slate-900">Servicios</h1>
      {services.length === 0 ? (
        <p className="mt-6 text-sm text-slate-500">Todavía no hay servicios cargados.</p>
      ) : (
        <ul className="mt-6 space-y-3">
          {services.map((service) => (
            <li key={service.id} className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
              <p className="font-semibold text-slate-900">{service.name}</p>
              <p className="mt-1 text-sm text-slate-500">
                {service.durationMinutes} min · Gs. {service.price.toLocaleString("es-PY")}
              </p>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
