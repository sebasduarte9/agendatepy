import { NextResponse, type NextRequest } from "next/server";
import { getSession } from "@/lib/auth/session";
import type { SessionUser } from "@/lib/auth/types";

export const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export type GuardedSession = {
  session: SessionUser;
  tenantId: string;
};

export async function requireTenantSession(
  _request?: NextRequest,
  allowedRoles?: ("OWNER" | "SUPERADMIN" | "STAFF")[]
): Promise<GuardedSession | NextResponse> {
  const session = await getSession();

  if (!session) {
    return NextResponse.json(
      { ok: false, error: "UNAUTHORIZED", message: "Sesión requerida." },
      { status: 401 }
    );
  }

  if (!session.tenantId) {
    return NextResponse.json(
      { ok: false, error: "FORBIDDEN", message: "Usuario sin negocio asignado." },
      { status: 403 }
    );
  }

  if (allowedRoles && !allowedRoles.includes(session.role as any)) {
    return NextResponse.json(
      { ok: false, error: "FORBIDDEN", message: "Permisos insuficientes." },
      { status: 403 }
    );
  }

  return { session, tenantId: session.tenantId };
}

export function isGuardError(result: GuardedSession | NextResponse): result is NextResponse {
  return result instanceof NextResponse;
}
