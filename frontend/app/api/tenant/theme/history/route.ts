import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth/session";
import { parseTheme } from "@/lib/theme";

export const dynamic = "force-dynamic";

/** Previous saved designs of the signed-in business, newest first. */
export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ ok: false, error: "No autorizado." }, { status: 401 });
  }
  if (session.role !== "OWNER" && session.role !== "SUPERADMIN") {
    return NextResponse.json({ ok: false, error: "Permisos insuficientes." }, { status: 403 });
  }
  if (!session.tenantId) {
    return NextResponse.json({ ok: false, error: "Negocio no asociado a la sesión." }, { status: 403 });
  }

  const tenant = await prisma.tenant.findUnique({
    where: { id: session.tenantId },
    select: { settings: true },
  });
  const settings = (tenant?.settings as Record<string, unknown> | null) ?? {};
  const raw = Array.isArray(settings.themeHistory) ? settings.themeHistory : [];
  const history = raw
    .filter((e): e is { savedAt: string; theme: unknown } => Boolean(e && typeof e === "object" && "theme" in e))
    .map((e) => ({ savedAt: e.savedAt, theme: parseTheme(e.theme) }));

  return NextResponse.json({ ok: true, history });
}
