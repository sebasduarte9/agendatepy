import "server-only";

export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
export const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || "";

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

/**
 * Retorna la URL base para el flujo de autenticación, priorizando NEXTAUTH_URL (https://agendatepy.com).
 * En producción fuerza HTTPS para evitar redirect_uri_mismatch en Google OAuth.
 */
export function getAuthBaseUrl(request?: Request): string {
  // 1. Prioridad absoluta: NEXTAUTH_URL o NEXT_PUBLIC_APP_URL de variables de entorno
  const envUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL;
  if (envUrl && envUrl.trim().length > 0) {
    return envUrl.trim().replace(/\/+$/, "");
  }

  if (!request) return "https://agendatepy.com";

  // 2. Si no hay variable definida, derivar desde encabezados
  const host =
    request.headers.get("x-forwarded-host") ||
    request.headers.get("host") ||
    "agendatepy.com";

  const isLocal = host.includes("localhost") || host.includes("127.0.0.1");
  const proto = isLocal ? "http" : "https";

  return `${proto}://${host}`;
}

export interface GoogleUserInfo {
  sub: string;
  email: string;
  email_verified: boolean;
  name: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
}

export function getGoogleAuthUrl(redirectUri: string, state?: string): string {
  const rootUrl = "https://accounts.google.com/o/oauth2/v2/auth";
  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    access_type: "online",
    prompt: "select_account",
    ...(state ? { state } : {}),
  });

  return `${rootUrl}?${params.toString()}`;
}

export async function exchangeCodeForTokens(code: string, redirectUri: string) {
  const tokenUrl = "https://oauth2.googleapis.com/token";

  const response = await fetch(tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error("Error exchanging code for Google tokens:", response.status, errorBody);
    throw new Error(`Google token exchange failed: ${response.status}`);
  }

  const data = await response.json();
  return data as { access_token: string; id_token: string; expires_in: number };
}

export async function getGoogleUserInfo(accessToken: string): Promise<GoogleUserInfo> {
  const userInfoUrl = "https://www.googleapis.com/oauth2/v3/userinfo";

  const response = await fetch(userInfoUrl, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch Google user info: ${response.status}`);
  }

  return (await response.json()) as GoogleUserInfo;
}
