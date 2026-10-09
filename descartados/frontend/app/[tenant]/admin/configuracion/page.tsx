import { requireHostTenant } from "@/lib/admin/tenant-access";
import { whatsappPhoneFromSettings } from "@/lib/scheduling/tenant-settings";

export default async function ConfiguracionAdminPage({
  params,
}: {
  params: Promise<{ tenant: string }>;
}) {
  const { tenant: slug } = await params;
  const tenant = await requireHostTenant(slug);
  const phone = whatsappPhoneFromSettings(tenant.settings);

  return (
    <main className="px-4 py-6 sm:px-8 sm:py-8">
      <h1 className="text-2xl font-bold text-slate-900">Configuración</h1>
      <dl className="mt-6 space-y-4 rounded-3xl border border-slate-200 bg-white px-4 py-4 text-sm">
        <Row label="Local" value={tenant.name} />
        <Row label="Subdominio" value={tenant.subdomain} />
        <Row label="Zona horaria" value={tenant.timezone} />
        <Row label="WhatsApp" value={phone ?? "Sin número en settings.whatsappPhone"} />
      </dl>
    </main>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</dt>
      <dd className="mt-1 font-semibold text-slate-900">{value}</dd>
    </div>
  );
}
