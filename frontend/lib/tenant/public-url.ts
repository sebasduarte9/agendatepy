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

/** URL para copiar/compartir. En localhost no hay subdominios, se usa la ruta equivalente. */
export function tenantBookingUrl(slug: string): string {
  if (typeof window !== "undefined") {
    const { hostname, origin } = window.location;
    if (hostname === "localhost" || hostname === "127.0.0.1") {
      return `${origin}/${slug}/reservar`;
    }
  }
  return tenantPublicUrl(slug);
}
