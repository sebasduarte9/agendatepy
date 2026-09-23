import { NextResponse, type NextRequest } from "next/server";
import { hostnameFromHeaders, tenantSlugFromHostname } from "@/lib/tenant/host";

/**
 * Next.js 16 retiró la convención `middleware.ts`. Este archivo es el reemplazo
 * (`proxy`, runtime Node). Corre antes del render.
 *
 * barberia.agendate.py/reservar  →  rewrite interno  /barberia/reservar
 * que resuelve `app/[tenant]/reservar/page.tsx` con params.tenant = "barberia".
 * El browser sigue viendo el host del tenant. El slug viaja además en
 * `x-tenant-slug` para que el Server Action no confíe en un tenantId del body.
 */
export function proxy(request: NextRequest) {
  const hostname = hostnameFromHeaders(
    request.headers.get("host"),
    request.headers.get("x-forwarded-host"),
  );
  const slug = tenantSlugFromHostname(hostname);

  if (!slug) {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;
  if (pathname === `/${slug}` || pathname.startsWith(`/${slug}/`)) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = pathname === "/" ? `/${slug}` : `/${slug}${pathname}`;

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-tenant-slug", slug);

  return NextResponse.rewrite(url, { request: { headers: requestHeaders } });
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ],
};
