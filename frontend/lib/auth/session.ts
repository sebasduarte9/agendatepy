import "server-only";

import crypto from "node:crypto";
import { cookies } from "next/headers";
import type { SessionUser } from "./types";

const COOKIE_NAME = "agendate_session";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 días

const SESSION_SECRET =
  process.env.SESSION_SECRET ||
  "agendatepy-secure-hmac-sha256-secret-key-paraguay-production-2026";

function signPayload(payload: string): string {
  const signature = crypto
    .createHmac("sha256", SESSION_SECRET)
    .update(payload)
    .digest("base64url");
  return `${payload}.${signature}`;
}

function verifyAndExtract(token: string): string | null {
  const parts = token.split(".");
  if (parts.length !== 2) {
    // Si es un token antiguo en base64 plano, permitir transición limpia
    return null;
  }

  const [payload, signature] = parts;
  const expectedSig = crypto
    .createHmac("sha256", SESSION_SECRET)
    .update(payload)
    .digest("base64url");

  const sigBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSig);

  if (
    sigBuffer.length === expectedBuffer.length &&
    crypto.timingSafeEqual(sigBuffer, expectedBuffer)
  ) {
    return payload;
  }

  return null;
}

export async function setSession(user: SessionUser): Promise<void> {
  const cookieStore = await cookies();
  const rawPayload = Buffer.from(JSON.stringify(user)).toString("base64url");
  const signedToken = signPayload(rawPayload);

  cookieStore.set(COOKIE_NAME, signedToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function getSession(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;

    const payload = verifyAndExtract(token);
    if (!payload) return null;

    const json = Buffer.from(payload, "base64url").toString("utf8");
    return JSON.parse(json) as SessionUser;
  } catch {
    return null;
  }
}

export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}
