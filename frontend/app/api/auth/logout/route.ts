import { NextResponse } from "next/server";
import { clearSession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export async function POST() {
  await clearSession();
  const response = NextResponse.json({ ok: true, message: "Sesión cerrada correctamente." });
  response.cookies.set("agendate_session", "", {
    path: "/",
    expires: new Date(0),
    httpOnly: true,
  });
  response.cookies.set("agendatepy_session", "", {
    path: "/",
    expires: new Date(0),
    httpOnly: true,
  });
  return response;
}

export async function GET(request: Request) {
  await clearSession();
  const url = new URL("/login", request.url);
  const response = NextResponse.redirect(url, { status: 303 });
  response.cookies.set("agendate_session", "", {
    path: "/",
    expires: new Date(0),
    httpOnly: true,
  });
  response.cookies.set("agendatepy_session", "", {
    path: "/",
    expires: new Date(0),
    httpOnly: true,
  });
  return response;
}
