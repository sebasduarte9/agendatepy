"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireHostTenant } from "@/lib/admin/tenant-access";
import { parseTheme, type ThemeSettings } from "@/lib/theme";
import type { AdminActionState } from "@/lib/admin/actions";

export async function updateThemeSettings(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const slug = (await headers()).get("x-tenant-slug");
  if (!slug) notFound();
  const tenant = await requireHostTenant(slug);

  const raw: Record<string, unknown> = {};
  formData.forEach((value, key) => {
    raw[key] = value;
  });

  const theme = parseTheme(raw);

  await prisma.tenant.update({
    where: { id: tenant.id },
    data: { themeSettings: theme as unknown as object },
  });

  revalidatePath(`/${tenant.subdomain}/admin/apariencia`);
  revalidatePath(`/${tenant.subdomain}/reservar`);
  revalidatePath(`/${tenant.subdomain}/reservar`, "layout");
  return { ok: true };
}
