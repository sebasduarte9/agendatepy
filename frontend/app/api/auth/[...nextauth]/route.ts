import { NextResponse, type NextRequest } from "next/server";
import { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } from "@/lib/auth/google";

/**
 * NextAuth Configuration Options
 * trustHost: true garantiza que NextAuth confíe en el encabezado Host y el proxy HTTPS en producción.
 */
export const authOptions = {
  trustHost: true,
  providers: [
    {
      id: "google",
      name: "Google",
      clientId: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
    },
  ],
};

export async function GET(request: NextRequest) {
  return NextResponse.redirect(new URL("/api/auth/google", request.url));
}

export async function POST(request: NextRequest) {
  return NextResponse.redirect(new URL("/api/auth/google", request.url));
}
