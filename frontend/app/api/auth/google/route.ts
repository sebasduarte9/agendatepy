import { NextResponse, type NextRequest } from "next/server";
import { getGoogleAuthUrl } from "@/lib/auth/google";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const host =
    request.headers.get("x-forwarded-host") ||
    request.headers.get("host") ||
    "localhost:3000";

  const isLocal = host.includes("localhost") || host.includes("127.0.0.1");
  // For any production domain like agendatepy.com, Google OAuth strictly requires HTTPS
  const proto = isLocal ? "http" : "https";

  const redirectUri = `${proto}://${host}/api/auth/callback/google`;

  const state = Math.random().toString(36).substring(2, 15);
  const authUrl = getGoogleAuthUrl(redirectUri, state);

  const response = NextResponse.redirect(authUrl);
  response.cookies.set("google_oauth_state", state, {
    path: "/",
    httpOnly: true,
    secure: proto === "https",
    sameSite: "lax",
    maxAge: 60 * 10, // 10 minutos
  });

  return response;
}
