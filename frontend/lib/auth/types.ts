export type UserRole = "SUPERADMIN" | "OWNER" | "STAFF";

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  tenantId?: string | null;
  tenantSlug?: string | null;
  phone?: string | null;
  optInMarketing?: boolean;
}

export interface AuthResponse {
  ok: boolean;
  message?: string;
  error?: string;
  user?: SessionUser;
  code?: string; // Para desarrollo / demostración OTP
}
