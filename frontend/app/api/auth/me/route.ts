import { NextResponse, type NextRequest } from "next/server";
import { getSession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const user = await getSession();
    if (!user) {
      return NextResponse.json(
        { ok: false, error: "UNAUTHORIZED", message: "No hay sesión activa." },
        { status: 401 }
      );
    }

    return NextResponse.json({
      ok: true,
      user,
    });
  } catch (error) {
    console.error("Error en GET /api/auth/me:", error);
    return NextResponse.json(
      { ok: false, error: "SERVER_ERROR", message: "Error al obtener usuario en sesión." },
      { status: 500 }
    );
  }
}
