import { NextResponse, type NextRequest } from "next/server";
import crypto from "node:crypto";
import { getGoogleAuthUrl, getAuthBaseUrl } from "@/lib/auth/google";

export const dynamic = "force-dynamic";

export const authOptions = {
  trustHost: true,
};

export async function GET(request: NextRequest) {
  const baseUrl = getAuthBaseUrl(request);
  const redirectUri = `${baseUrl}/api/auth/callback/google`;

  const state = crypto.randomBytes(24).toString("base64url");
  const authUrl = getGoogleAuthUrl(redirectUri, state);

  const response = NextResponse.redirect(authUrl);
  response.cookies.set("google_oauth_state", state, {
    path: "/",
    httpOnly: true,
    secure: baseUrl.startsWith("https://"),
    sameSite: "lax",
    maxAge: 60 * 10, // 10 minutos
  });

  return response;
}
