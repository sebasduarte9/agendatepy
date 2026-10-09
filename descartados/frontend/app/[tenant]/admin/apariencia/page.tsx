import AppearanceEditor from "@/components/admin/AppearanceEditor";
import { requireHostTenant } from "@/lib/admin/tenant-access";
import { parseTheme } from "@/lib/theme";

export default async function AparienciaPage({
  params,
}: {
  params: Promise<{ tenant: string }>;
}) {
  const { tenant: slug } = await params;
  const tenant = await requireHostTenant(slug);

  return (
    <main className="px-4 py-6 sm:px-8 sm:py-8">
      <h1 className="text-2xl font-bold tracking-tight text-slate-900">Apariencia</h1>
      <p className="mt-1 max-w-xl text-sm text-slate-500">
        Personalizá la página donde tus clientes reservan.
      </p>
      <div className="mt-6">
        <AppearanceEditor initial={parseTheme(tenant.themeSettings)} />
      </div>
    </main>
  );
}
