/**
 * Resolución de subdominio. Puro: lo usa proxy.ts y puede testearse sin request.
 *
 * Env: AGENDATE_ROOT_DOMAIN=agendate.py
 *   barberia.agendate.py        → "barberia"
 *   barberia.localhost          → "barberia"  (dev)
 *   agendate.py / www / app     → null        (marketing y backoffice en el apex)
 */

const RESERVED_SUBDOMAINS = new Set([
  "www",
  "app",
  "api",
  "admin",
  "static",
  "cdn",
]);

const SLUG = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/;

export function hostnameFromHeaders(
  hostHeader: string | null,
  forwardedHost: string | null,
): string {
  const raw = (forwardedHost ?? hostHeader ?? "").split(",")[0]?.trim() ?? "";
  return raw.replace(/:\d+$/, "").toLowerCase();
}

export function tenantSlugFromHostname(
  hostname: string,
  rootDomain = process.env.AGENDATE_ROOT_DOMAIN ?? "agendate.py",
): string | null {
  if (!hostname || hostname === "localhost" || hostname === "127.0.0.1") {
    return null;
  }

  const root = rootDomain.toLowerCase();
  let label: string | null = null;

  if (hostname === root || hostname === `www.${root}`) {
    return null;
  }

  if (hostname.endsWith(`.${root}`)) {
    label = hostname.slice(0, -(root.length + 1));
  } else if (hostname.endsWith(".localhost")) {
    label = hostname.slice(0, -".localhost".length);
  }

  if (!label || label.includes(".")) {
    return null;
  }

  if (RESERVED_SUBDOMAINS.has(label) || !SLUG.test(label)) {
    return null;
  }

  return label;
}
