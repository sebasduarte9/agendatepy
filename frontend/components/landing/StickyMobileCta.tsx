"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, MessageCircle, ArrowRight } from "lucide-react";
import { getCommercialWhatsAppUrl } from "@/lib/config/whatsapp";

export default function StickyMobileCta() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Mostrar la barra una vez que el usuario scrollea más allá del Hero
      if (window.scrollY > 380) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="sm:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200/90 dark:border-white/10 bg-white/95 dark:bg-slate-950/95 px-4 py-2.5 shadow-[0_-10px_25px_-5px_rgba(0,0,0,0.15)] backdrop-blur-2xl"
          style={{ paddingBottom: "max(0.65rem, env(safe-area-inset-bottom))" }}
        >
          <div className="flex items-center justify-between gap-2.5">
            {/* Mensaje de valor y garantía */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="flex h-2 w-2 rounded-full bg-brand animate-ping" />
                <p className="truncate text-xs font-black text-slate-900 dark:text-white leading-tight">
                  Agendate<span className="text-brand">PY</span>
                </p>
                <span className="rounded-full bg-brand/10 px-1.5 py-0.2 text-[9px] font-black text-brand">
                  14 días gratis
                </span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5 font-medium">
                Sin tarjeta · Activación en 3 min
              </p>
            </div>

            {/* Botones de acción rápida */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Botón WhatsApp de consulta rápida */}
              <a
                href={getCommercialWhatsAppUrl("Hola AgendatePY, quiero información para activar mi agenda online")}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400 active:scale-95 transition"
                aria-label="Consultar por WhatsApp"
              >
                <MessageCircle className="h-4.5 w-4.5 fill-emerald-500 text-emerald-500" />
              </a>

              {/* Botón Principal: Prueba gratis */}
              <Link
                href="/onboarding"
                className="flex h-9 items-center justify-center gap-1 sm:gap-1.5 rounded-xl bg-gradient-to-r from-brand to-[#FF6B4A] px-2.5 sm:px-3.5 text-xs font-black text-white shadow-md shadow-brand/25 active:scale-95 transition"
              >
                <Sparkles className="h-3 w-3 text-amber-200 shrink-0" />
                <span className="hidden xs:inline">Crear mi agenda</span>
                <span className="xs:hidden">Empezar</span>
                <ArrowRight className="h-3 w-3 shrink-0" />
              </Link>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
