import "server-only";

import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";

/**
 * El admin solo existe en el host del tenant. proxy.ts escribe x-tenant-slug
 * en el rewrite del subdominio. Sin ese header, o si no coincide con el
 * segmento [tenant], la ruta no revela si el local existe.
 */
export async function requireHostTenant(slug: string) {
  const headerSlug = (await headers()).get("x-tenant-slug");
  if (!headerSlug || headerSlug !== slug) notFound();

  const tenant = await prisma.tenant.findUnique({
    where: { subdomain: slug },
    select: {
      id: true,
      name: true,
      slug: true,
      subdomain: true,
      timezone: true,
      settings: true,
      themeSettings: true,
    },
  });

  if (!tenant) notFound();
  return tenant;
}
