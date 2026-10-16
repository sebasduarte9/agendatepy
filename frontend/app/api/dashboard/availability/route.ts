import { NextResponse, type NextRequest } from "next/server";
import { requireTenantSession, isGuardError } from "@/lib/api-guard";
import { getAvailableSlots } from "@/lib/scheduling/availability";
import { SchedulingError } from "@/lib/scheduling/errors";

/** Free slots for the dashboard's manual booking (uses the session's business, never demo data). */
export async function GET(request: NextRequest) {
  const auth = await requireTenantSession(request);
  if (isGuardError(auth)) return auth;

  const serviceId = request.nextUrl.searchParams.get("serviceId") ?? "";
  const date = request.nextUrl.searchParams.get("date") ?? "";

  try {
    const slots = await getAvailableSlots({ tenantId: auth.tenantId, serviceId, date });
    const now = Date.now();
    return NextResponse.json({
      ok: true,
      slots: slots.filter((s) => new Date(s.start).getTime() > now),
    });
  } catch (error) {
    if (error instanceof SchedulingError) {
      return NextResponse.json({ ok: false, message: error.message }, { status: error.status ?? 400 });
    }
    console.error("[dashboard/availability]", error);
    return NextResponse.json({ ok: false, message: "No pudimos consultar los horarios." }, { status: 500 });
  }
}
