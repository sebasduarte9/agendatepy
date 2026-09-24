"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarCheck,
  Mail,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  KeyRound,
  RotateCcw,
  UserCheck,
  Store,
  Crown,
} from "lucide-react";
import {
  requestOtpAction,
  verifyOtpAction,
  googleLoginAction,
  switchRoleDemoAction,
} from "@/lib/auth/actions";
import type { UserRole } from "@/lib/auth/types";

export default function LoginPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [email, setEmail] = useState("");
  const [optInMarketing, setOptInMarketing] = useState(true);
  const [step, setStep] = useState<"EMAIL" | "OTP">("EMAIL");
  const [otpCode, setOtpCode] = useState("");
  const [devDemoCode, setDevDemoCode] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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
        if (res.code) {
          setDevDemoCode(res.code);
          setOtpCode(res.code); // Prellenar para comodidad del test
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
        if (res.user.role === "SUPERADMIN") {
          router.push("/superadmin");
        } else {
          router.push("/dashboard");
        }
      } else {
        setError(res.error || "Código incorrecto.");
      }
    });
  };

  // Login con Google
  const handleGoogleLogin = () => {
    setError(null);
    startTransition(async () => {
      const res = await googleLoginAction("demo.google@agendate.py", "Usuario Google", optInMarketing);
      if (res.ok) {
        router.push("/dashboard");
      } else {
        setError(res.error || "Error al iniciar con Google");
      }
    });
  };

  // Selector rápido de Roles de Prueba
  const handleFastRoleLogin = (role: UserRole) => {
    setError(null);
    startTransition(async () => {
      const res = await switchRoleDemoAction(role);
      if (res.ok && res.user) {
        if (role === "SUPERADMIN") {
          router.push("/superadmin");
        } else {
          router.push("/dashboard");
        }
      } else {
        setError("Error al cambiar de rol.");
      }
    });
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[#fbfbfd] px-4 py-12 selection:bg-brand selection:text-white">
      {/* Luces de fondo Apple-style */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-[500px] w-[600px] -translate-x-1/2 rounded-full bg-gradient-to-b from-indigo-100/60 via-purple-50/40 to-transparent blur-3xl" />
        <div className="absolute -bottom-40 right-10 h-[400px] w-[400px] rounded-full bg-emerald-50/50 blur-3xl" />
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
            className="inline-flex items-center gap-2 rounded-2xl bg-white px-3.5 py-1.5 shadow-[0_2px_10px_rgb(0,0,0,0.04)] border border-slate-200/80 transition hover:scale-[1.02]"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-brand text-white shadow-xs">
              <CalendarCheck className="h-4 w-4" />
            </span>
            <span className="text-sm font-black tracking-tight text-slate-900">
              Agendate<span className="text-brand">PY</span>
            </span>
          </Link>
          <h1 className="mt-5 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Bienvenido a tu panel
          </h1>
          <p className="mt-1.5 text-xs text-slate-500">
            Gestiona citas, cobros y clientes con la plataforma líder en Paraguay
          </p>
        </div>

        {/* Tarjeta Glassmorphic */}
        <div className="rounded-[28px] border border-slate-200/80 bg-white/90 p-7 shadow-[0_12px_40px_rgb(0,0,0,0.06)] backdrop-blur-xl sm:p-9">
          {/* Botón Google Apple-style */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isPending}
            className="flex w-full items-center justify-center gap-3 rounded-2xl border border-slate-200/90 bg-white px-4 py-3.5 text-xs font-semibold text-slate-700 shadow-xs transition hover:bg-slate-50 active:scale-[0.99] disabled:opacity-60"
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
            Continuar con Google
          </button>

          <div className="relative my-6 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200/80" />
            </div>
            <span className="relative bg-white px-3 text-[11px] font-medium uppercase tracking-wider text-slate-600">
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
                  <label htmlFor="login-email-input" className="block text-xs font-semibold text-slate-700">
                    Correo electrónico
                  </label>
                  <div className="relative mt-1.5">
                    <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-600" />
                    <input
                      id="login-email-input"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="tu-negocio@gmail.com"
                      required
                      className="w-full rounded-2xl border border-slate-200/90 bg-white py-3 pl-10 pr-4 text-xs font-medium text-slate-900 placeholder:text-slate-600 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 transition"
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
                    className="mt-0.5 h-4 w-4 rounded-md border-slate-300 text-brand focus:ring-brand"
                  />
                  <label htmlFor="optInMarketing" className="text-[11px] leading-tight text-slate-700 cursor-pointer">
                    Deseo recibir ofertas exclusivas, actualizaciones del sistema y novedades de <span className="font-semibold text-slate-700">AgendatePY</span>.
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isPending}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-brand py-3.5 text-xs font-bold text-white shadow-md shadow-brand/20 transition hover:bg-brand-dark active:scale-[0.99] disabled:opacity-60"
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
                    <label htmlFor="login-otp-code-input" className="block text-xs font-semibold text-slate-700">
                      Código de 6 dígitos
                    </label>
                    <button
                      type="button"
                      onClick={() => setStep("EMAIL")}
                      className="text-[11px] text-brand hover:underline font-medium"
                    >
                      Cambiar correo
                    </button>
                  </div>

                  <div className="relative mt-1.5">
                    <KeyRound className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-600" />
                    <input
                      id="login-otp-code-input"
                      type="text"
                      maxLength={6}
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                      placeholder="123456"
                      required
                      className="w-full rounded-2xl border border-slate-200/90 bg-white py-3 pl-10 pr-4 text-center text-lg font-bold tracking-[0.35em] text-slate-900 placeholder:text-slate-600 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 transition"
                    />
                  </div>
                  <p className="mt-1.5 text-[11px] text-slate-600">
                    Enviado a <span className="font-semibold text-slate-700">{email}</span>
                  </p>
                </div>

                {devDemoCode && (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 p-2.5 text-center text-xs font-semibold text-emerald-800">
                    Código de acceso rápido: <span className="underline tracking-widest">{devDemoCode}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isPending}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-brand py-3.5 text-xs font-bold text-white shadow-md shadow-brand/20 transition hover:bg-brand-dark active:scale-[0.99] disabled:opacity-60"
                >
                  {isPending ? "Verificando..." : "Ingresar a mi negocio"}
                  <ShieldCheck className="h-4 w-4" />
                </button>

                <div className="text-center pt-1">
                  <button
                    type="button"
                    onClick={handleRequestOtp}
                    disabled={isPending}
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 hover:text-brand transition"
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
            <p className="mt-4 rounded-xl bg-red-50 p-2.5 text-center text-xs font-medium text-red-700">
              {error}
            </p>
          )}
          {message && !error && (
            <p className="mt-4 rounded-xl bg-indigo-50 p-2.5 text-center text-xs font-medium text-brand">
              {message}
            </p>
          )}

          {/* Selector de Roles Rápidos para Pruebas / Switcher */}
          <div className="mt-8 border-t border-slate-100 pt-5">
            <p className="text-center text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-2.5">
              Acceso Rápido por Rol (Demostración)
            </p>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => handleFastRoleLogin("SUPERADMIN")}
                className="flex flex-col items-center justify-center rounded-xl border border-slate-200/70 bg-slate-50/60 p-2 text-center transition hover:bg-white hover:border-purple-300 hover:shadow-xs"
              >
                <Crown className="h-3.5 w-3.5 text-purple-600 mb-0.5" />
                <span className="text-[10px] font-bold text-slate-800">Superadmin</span>
              </button>
              <button
                type="button"
                onClick={() => handleFastRoleLogin("OWNER")}
                className="flex flex-col items-center justify-center rounded-xl border border-slate-200/70 bg-slate-50/60 p-2 text-center transition hover:bg-white hover:border-brand/40 hover:shadow-xs"
              >
                <Store className="h-3.5 w-3.5 text-brand mb-0.5" />
                <span className="text-[10px] font-bold text-slate-800">Dueño Local</span>
              </button>
              <button
                type="button"
                onClick={() => handleFastRoleLogin("STAFF")}
                className="flex flex-col items-center justify-center rounded-xl border border-slate-200/70 bg-slate-50/60 p-2 text-center transition hover:bg-white hover:border-pink-300 hover:shadow-xs"
              >
                <UserCheck className="h-3.5 w-3.5 text-pink-600 mb-0.5" />
                <span className="text-[10px] font-bold text-slate-800">Colaborador</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer legal */}
        <p className="mt-6 text-center text-[11px] text-slate-600">
          Al continuar aceptas nuestros{" "}
          <Link href="/terminos" className="text-slate-600 underline hover:text-slate-800">
            Términos y Condiciones
          </Link>{" "}
          y{" "}
          <Link href="/privacidad" className="text-slate-600 underline hover:text-slate-800">
            Política de Privacidad
          </Link>
          .
        </p>
      </motion.div>
    </div>
  );
}
