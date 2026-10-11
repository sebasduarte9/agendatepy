"use client";

import { useState, useTransition, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarCheck,
  Mail,
  ArrowRight,
  ShieldCheck,
  KeyRound,
  RotateCcw,
  UserCheck,
  Store,
  Crown,
} from "lucide-react";
import {
  requestOtpAction,
  verifyOtpAction,
  switchRoleDemoAction,
} from "@/lib/auth/actions";
import type { UserRole } from "@/lib/auth/types";
import BrandLogo from "@/components/ui/BrandLogo";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [email, setEmail] = useState("");
  const [optInMarketing, setOptInMarketing] = useState(true);
  const [step, setStep] = useState<"EMAIL" | "OTP">("EMAIL");
  const [otpCode, setOtpCode] = useState("");
  const [devDemoCode, setDevDemoCode] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Detectar errores en redirección de OAuth
  useEffect(() => {
    const oauthError = searchParams.get("error");
    if (oauthError === "oauth_cancelled") {
      setError("Inicio de sesión con Google cancelado.");
    } else if (oauthError === "oauth_failed") {
      setError("No se pudo autenticar con Google. Por favor, intenta de nuevo.");
    } else if (oauthError === "no_email") {
      setError("Tu cuenta de Google no tiene un correo verificado.");
    }
  }, [searchParams]);

  // Solicitar OTP
  const handleRequestOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setError("Por favor ingresa un correo electrónico válido.");
      return;
    }
    setError(null);
    setMessage(null);

    startTransition(async () => {
      const res = await requestOtpAction(email);
      if (res.ok) {
        setStep("OTP");
        setMessage(res.message || "Código enviado a tu casilla.");
        if (res.code && process.env.NODE_ENV !== "production") {
          setDevDemoCode(res.code);
          setOtpCode(res.code);
        }
      } else {
        setError(res.error || "No se pudo enviar el código.");
      }
    });
  };

  // Verificar OTP
  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode.trim().length !== 6) {
      setError("El código debe tener 6 dígitos.");
      return;
    }
    setError(null);

    startTransition(async () => {
      const res = await verifyOtpAction(email, otpCode, optInMarketing);
      if (res.ok && res.user) {
        const callback = searchParams.get("callbackUrl");
        if (callback && (res.user.role === "SUPERADMIN" || !callback.startsWith("/admin"))) {
          router.push(callback);
        } else if (res.user.role === "SUPERADMIN") {
          router.push("/admin");
        } else {
          router.push("/dashboard");
        }
      } else {
        setError(res.error || "Código incorrecto.");
      }
    });
  };

  // Selector rápido de Roles de Prueba (solo visible en desarrollo)
  const handleFastRoleLogin = (role: UserRole) => {
    setError(null);
    startTransition(async () => {
      const res = await switchRoleDemoAction(role);
      if (res.ok && res.user) {
        const callback = searchParams.get("callbackUrl");
        if (callback && (role === "SUPERADMIN" || !callback.startsWith("/admin"))) {
          router.push(callback);
        } else if (role === "SUPERADMIN") {
          router.push("/admin");
        } else {
          router.push("/dashboard");
        }
      } else {
        setError("Error al cambiar de rol.");
      }
    });
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-transparent px-4 py-12 selection:bg-primary selection:text-white overflow-hidden">
      {/* Luces de fondo Glassy 2.0 Ambient Glowing Orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden select-none -z-10">
        <div className="absolute -top-40 left-1/2 h-[550px] w-[650px] -translate-x-1/2 rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute -bottom-40 right-10 h-[450px] w-[450px] rounded-full bg-violet-600/15 blur-3xl" />
        <div className="absolute top-1/3 -left-20 h-[380px] w-[380px] rounded-full bg-emerald-500/10 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-[440px]"
      >
        {/* Cabecera / Logo */}
        <div className="mb-8 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-2xl glass-panel-subtle px-3.5 py-1.5 border border-white/10 shadow-xs transition hover:scale-[1.02]"
          >
            <BrandLogo variant="horizontal" iconClassName="h-6.5 w-6.5" />
          </Link>
          <h1 className="mt-5 text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            Bienvenido a tu panel
          </h1>
          <p className="mt-1.5 text-xs text-slate-500 dark:text-zinc-400">
            Gestiona citas, cobros y clientes con la plataforma líder en Paraguay
          </p>
        </div>

        {/* Tarjeta Glassmorphic */}
        <div className="rounded-[28px] glass-modal p-7 shadow-2xl backdrop-blur-3xl sm:p-9 border border-slate-200/80 dark:border-white/10">
          {/* Botón Google OAuth 2.0 Real */}
          {/* OAuth necesita navegación completa del navegador, no client-side. */}
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a
            href="/api/auth/google"
            className="flex w-full items-center justify-center gap-3 rounded-2xl border border-slate-200/90 dark:border-white/10 bg-white/90 dark:bg-white/[0.04] px-4 py-3.5 text-xs font-semibold text-slate-700 dark:text-zinc-200 shadow-xs transition hover:bg-slate-50 dark:hover:bg-white/10 active:scale-[0.99] backdrop-blur-md"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continuar con Google</span>
          </a>

          <div className="relative my-6 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200/80 dark:border-white/10" />
            </div>
            <span className="relative bg-white dark:bg-[#1a171d] px-3 py-0.5 rounded-full text-[11px] font-medium uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              o con código OTP
            </span>
          </div>

          <AnimatePresence mode="wait">
            {step === "EMAIL" ? (
              <motion.form
                key="email-form"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                onSubmit={handleRequestOtp}
                className="space-y-4"
              >
                <div>
                  <label htmlFor="login-email-input" className="block text-xs font-semibold text-slate-700 dark:text-zinc-300">
                    Correo electrónico
                  </label>
                  <div className="relative mt-1.5">
                    <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-zinc-400" />
                    <input
                      id="login-email-input"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="tu-negocio@gmail.com"
                      required
                      className="w-full rounded-2xl border border-slate-200/90 dark:border-white/10 bg-white/80 dark:bg-white/[0.04] py-3 pl-10 pr-4 text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition backdrop-blur-md"
                    />
                  </div>
                </div>

                {/* Consentimiento de ofertas / Marketing */}
                <div className="flex items-start gap-2.5 pt-1">
                  <input
                    type="checkbox"
                    id="optInMarketing"
                    checked={optInMarketing}
                    onChange={(e) => setOptInMarketing(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded-md border-slate-300 dark:border-white/20 text-primary focus:ring-primary bg-transparent"
                  />
                  <label htmlFor="optInMarketing" className="text-[11px] leading-tight text-slate-600 dark:text-zinc-400 cursor-pointer">
                    Deseo recibir ofertas exclusivas, actualizaciones del sistema y novedades de <span className="font-semibold text-slate-900 dark:text-white">AgendatePY</span>.
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isPending}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-xs font-bold text-white shadow-md shadow-primary/20 transition hover:brightness-110 active:scale-[0.99] disabled:opacity-60 cursor-pointer"
                >
                  {isPending ? "Enviando código..." : "Enviar código de acceso"}
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </motion.form>
            ) : (
              <motion.form
                key="otp-form"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                onSubmit={handleVerifyOtp}
                className="space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <label htmlFor="login-otp-code-input" className="block text-xs font-semibold text-slate-700 dark:text-zinc-300">
                      Código de 6 dígitos
                    </label>
                    <button
                      type="button"
                      onClick={() => setStep("EMAIL")}
                      className="text-[11px] text-primary hover:underline font-medium cursor-pointer"
                    >
                      Cambiar correo
                    </button>
                  </div>

                  <div className="relative mt-1.5">
                    <KeyRound className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-zinc-400" />
                    <input
                      id="login-otp-code-input"
                      type="text"
                      maxLength={6}
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                      placeholder="123456"
                      required
                      className="w-full rounded-2xl border border-slate-200/90 dark:border-white/10 bg-white/80 dark:bg-white/[0.04] py-3 pl-10 pr-4 text-center text-lg font-bold tracking-[0.35em] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition backdrop-blur-md"
                    />
                  </div>
                  <p className="mt-1.5 text-[11px] text-slate-500 dark:text-zinc-400">
                    Enviado a <span className="font-semibold text-slate-900 dark:text-white">{email}</span>
                  </p>
                </div>

                {devDemoCode && (
                  <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-2.5 text-center text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    Código de acceso rápido (dev): <span className="underline tracking-widest">{devDemoCode}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isPending}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-xs font-bold text-white shadow-md shadow-primary/20 transition hover:brightness-110 active:scale-[0.99] disabled:opacity-60 cursor-pointer"
                >
                  {isPending ? "Verificando..." : "Ingresar a mi negocio"}
                  <ShieldCheck className="h-4 w-4" />
                </button>

                <div className="text-center pt-1">
                  <button
                    type="button"
                    onClick={handleRequestOtp}
                    disabled={isPending}
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 dark:text-zinc-400 hover:text-primary transition cursor-pointer"
                  >
                    <RotateCcw className="h-3 w-3" />
                    Reenviar código
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Alertas */}
          {error && (
            <p className="mt-4 rounded-xl bg-red-500/10 border border-red-500/20 p-2.5 text-center text-xs font-medium text-red-600 dark:text-red-400">
              {error}
            </p>
          )}
          {message && !error && (
            <p className="mt-4 rounded-xl bg-primary/10 border border-primary/20 p-2.5 text-center text-xs font-medium text-primary">
              {message}
            </p>
          )}

          {/* Acceso rápido de pruebas solo en entorno de desarrollo */}
          {process.env.NODE_ENV !== "production" && (
            <div className="mt-8 border-t border-slate-200/80 dark:border-white/10 pt-5">
              <p className="text-center text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 mb-2.5">
                Acceso Rápido por Rol (Solo Dev)
              </p>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => handleFastRoleLogin("SUPERADMIN")}
                  className="flex flex-col items-center justify-center rounded-xl border border-slate-200/70 dark:border-white/10 bg-slate-50/60 dark:bg-white/[0.03] p-2 text-center transition hover:bg-white dark:hover:bg-white/[0.08] hover:border-purple-400 hover:shadow-xs cursor-pointer"
                >
                  <Crown className="h-3.5 w-3.5 text-purple-500 mb-0.5" />
                  <span className="text-[10px] font-bold text-slate-800 dark:text-zinc-200">Superadmin</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleFastRoleLogin("OWNER")}
                  className="flex flex-col items-center justify-center rounded-xl border border-slate-200/70 dark:border-white/10 bg-slate-50/60 dark:bg-white/[0.03] p-2 text-center transition hover:bg-white dark:hover:bg-white/[0.08] hover:border-primary/40 hover:shadow-xs cursor-pointer"
                >
                  <Store className="h-3.5 w-3.5 text-primary mb-0.5" />
                  <span className="text-[10px] font-bold text-slate-800 dark:text-zinc-200">Dueño Local</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleFastRoleLogin("STAFF")}
                  className="flex flex-col items-center justify-center rounded-xl border border-slate-200/70 dark:border-white/10 bg-slate-50/60 dark:bg-white/[0.03] p-2 text-center transition hover:bg-white dark:hover:bg-white/[0.08] hover:border-pink-400 hover:shadow-xs cursor-pointer"
                >
                  <UserCheck className="h-3.5 w-3.5 text-pink-500 mb-0.5" />
                  <span className="text-[10px] font-bold text-slate-800 dark:text-zinc-200">Colaborador</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer legal */}
        <p className="mt-6 text-center text-[11px] text-slate-500 dark:text-zinc-400">
          Al continuar aceptas nuestros{" "}
          <Link href="/terminos" className="underline hover:text-slate-800 dark:hover:text-white">
            Términos y Condiciones
          </Link>{" "}
          y{" "}
          <Link href="/privacidad" className="underline hover:text-slate-800 dark:hover:text-white">
            Política de Privacidad
          </Link>
          .
        </p>
      </motion.div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-transparent" />}>
      <LoginForm />
    </Suspense>
  );
}
