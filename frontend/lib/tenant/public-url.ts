/**
 * Links públicos de cada negocio: https://{slug}.agendatepy.com
 * La raíz del subdominio abre la página de reservas (ver proxy.ts).
 */
export const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "agendatepy.com";

export function tenantHost(slug: string): string {
  return `${slug}.${ROOT_DOMAIN}`;
}

export function tenantPublicUrl(slug: string, path = ""): string {
  return `https://${tenantHost(slug)}${path}`;
}

/** Stable path-based tenant URL for routes served from the platform's root domain. */
export function tenantRouteUrl(slug: string, path = ""): string {
  return `https://${ROOT_DOMAIN}/${encodeURIComponent(slug)}${path}`;
}

/** URL pública estable para copiar y compartir, también durante el renderizado en servidor. */
export function tenantBookingUrl(slug: string): string {
  return tenantPublicUrl(slug);
}
