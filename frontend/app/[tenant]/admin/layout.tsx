import type { ReactNode } from "react";
import { requireHostTenant } from "@/lib/admin/tenant-access";
import AdminShell from "@/components/admin/AdminShell";
import { parseTheme } from "@/lib/theme";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ tenant: string }>;
}) {
  const { tenant: slug } = await params;
  const tenant = await requireHostTenant(slug);
  const theme = parseTheme(tenant.themeSettings);

  return (
    <AdminShell name={tenant.name} slug={tenant.subdomain} primaryColor={theme.primaryColor}>
      {children}
    </AdminShell>
  );
}
