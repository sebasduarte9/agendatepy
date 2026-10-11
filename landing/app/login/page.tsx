"use client";

import Link from "next/link";
import { ArrowLeft, Lock, MessageCircle } from "lucide-react";
import BrandLogo from "@/components/ui/BrandLogo";
import { getCommercialWhatsAppUrl } from "@/lib/config/whatsapp";

export default function StandaloneLoginPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 bg-[#131115] text-[#f3f0ed] relative overflow-hidden">
      {/* Glow ambiental de fondo */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#FF4F2B]/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md p-8 sm:p-10 rounded-[28px] border border-white/10 bg-[#1f1c21]/80 backdrop-blur-2xl shadow-2xl text-center">
        <div className="flex justify-center mb-6">
          <BrandLogo variant="horizontal" iconClassName="h-9 w-9" textClassName="text-2xl" />
        </div>

        <div className="mx-auto w-12 h-12 rounded-2xl bg-[#FF4F2B]/15 border border-[#FF4F2B]/30 flex items-center justify-center text-[#FF4F2B] mb-4">
          <Lock className="w-6 h-6" />
        </div>

        <h1 className="text-2xl font-black tracking-tight text-white mb-2">
          Acceso al Panel
        </h1>
        <p className="text-sm text-slate-400 mb-8 leading-relaxed">
          Estás visualizando la <strong>copia aislada de la Landing Page</strong>. El inicio de sesión con base de datos y autenticación completa está activo en la app principal.
        </p>

        <div className="space-y-3">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-[#FF4F2B] to-[#FF6B4A] hover:brightness-110 text-white font-bold text-sm shadow-lg shadow-[#FF4F2B]/25 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a la Landing Page
          </Link>

          <a
            href={getCommercialWhatsAppUrl("Hola, quiero probar el acceso de AgendatePY")}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-3.5 px-5 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 text-slate-200 font-semibold text-sm transition"
          >
            <MessageCircle className="w-4 h-4 text-emerald-400" />
            Contactar por WhatsApp
          </a>
        </div>
      </div>
    </main>
  );
}
