import "server-only";

import { cookies } from "next/headers";
import type { SessionUser } from "./types";

const COOKIE_NAME = "agendate_session";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 días

export async function setSession(user: SessionUser): Promise<void> {
  const cookieStore = await cookies();
  const token = Buffer.from(JSON.stringify(user)).toString("base64url");
  cookieStore.set(COOKIE_NAME, token, {
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
    const json = Buffer.from(token, "base64url").toString("utf8");
    return JSON.parse(json) as SessionUser;
  } catch {
    return null;
  }
}

export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}
