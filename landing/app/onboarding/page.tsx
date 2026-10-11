"use client";

import Link from "next/link";
import { ArrowLeft, Sparkles, MessageCircle, CheckCircle2 } from "lucide-react";
import BrandLogo from "@/components/ui/BrandLogo";
import { getCommercialWhatsAppUrl } from "@/lib/config/whatsapp";

export default function StandaloneOnboardingPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 bg-[#131115] text-[#f3f0ed] relative overflow-hidden py-12">
      {/* Glow ambiental */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-[#FF4F2B]/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-lg p-8 sm:p-10 rounded-[32px] border border-white/10 bg-[#1f1c21]/80 backdrop-blur-2xl shadow-2xl text-center">
        <div className="flex justify-center mb-6">
          <BrandLogo variant="horizontal" iconClassName="h-9 w-9" textClassName="text-2xl" />
        </div>

        <div className="mx-auto w-14 h-14 rounded-2xl bg-[#FF4F2B]/15 border border-[#FF4F2B]/30 flex items-center justify-center text-[#FF4F2B] mb-5">
          <Sparkles className="w-7 h-7" />
        </div>

        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white mb-2">
          Comenzar 14 Días Gratis
        </h1>
        <p className="text-sm text-slate-400 mb-6 leading-relaxed">
          Estás explorando la <strong>copia aislada de la Landing Page</strong>. Esta copia contiene todos los componentes visuales e interactivos de la landing (Three.js, animaciones, simuladores de WhatsApp y reservas).
        </p>

        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-left space-y-2 mb-8">
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>0% de comisiones por reserva</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Recordatorios automáticos por WhatsApp</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Cobro en Guaraníes vía Transferencia / QR / Efectivo</span>
          </div>
        </div>

        <div className="space-y-3">
          <a
            href={getCommercialWhatsAppUrl("¡Hola! Quiero activar mi prueba gratis de 14 días en AgendatePY")}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#FF4F2B] to-[#FF6B4A] hover:brightness-110 text-white font-bold text-sm shadow-xl shadow-[#FF4F2B]/25 transition"
          >
            <MessageCircle className="w-5 h-5 text-white" />
            Solicitar Activación Directa por WhatsApp
          </a>

          <Link
            href="/"
            className="flex items-center justify-center gap-2 w-full py-3 px-5 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 text-slate-300 font-semibold text-xs transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a Explorar la Landing
          </Link>
        </div>
      </div>
    </main>
  );
}
