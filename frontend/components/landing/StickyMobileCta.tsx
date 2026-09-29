"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { CalendarPlus, MessageCircle, ArrowRight } from "lucide-react";
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
          className="sm:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200/90 dark:border-white/10 bg-white/95 dark:bg-slate-950/95 px-2.5 xs:px-4 py-2 xs:py-2.5 shadow-[0_-10px_25px_-5px_rgba(0,0,0,0.15)] backdrop-blur-2xl"
          style={{ paddingBottom: "max(0.65rem, env(safe-area-inset-bottom))" }}
        >
          <div className="flex items-center justify-between gap-1.5 xs:gap-2.5">
            {/* Mensaje de valor y garantía */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="flex h-2 w-2 rounded-full bg-brand animate-ping shrink-0" />
                <p className="truncate text-xs font-black text-slate-900 dark:text-white leading-tight">
                  Agendate<span className="text-brand">PY</span>
                </p>
                <span className="rounded-full bg-brand/10 px-1.5 py-0.2 text-[9px] font-black text-brand shrink-0">
                  <span className="hidden xs:inline">14 días gratis</span>
                  <span className="xs:hidden">14d gratis</span>
                </span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5 font-medium">
                Sin tarjeta · 3 min
              </p>
            </div>

            {/* Botón Principal: Prueba gratis */}
            <div className="flex items-center gap-1.5 xs:gap-2 shrink-0">
              <Link
                href="/onboarding"
                className="flex h-8.5 xs:h-9 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-brand to-[#FF6B4A] px-3.5 xs:px-4 text-xs font-black text-white shadow-md shadow-brand/25 active:scale-95 transition shrink-0 whitespace-nowrap"
              >
                <CalendarPlus className="h-3.5 w-3.5 text-white shrink-0" />
                <span>Empezar gratis</span>
                <ArrowRight className="h-3.5 w-3.5 shrink-0" />
              </Link>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
