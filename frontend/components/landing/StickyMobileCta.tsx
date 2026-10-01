"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { CalendarPlus, ArrowRight } from "lucide-react";

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
            {/* Texto limpio sin nombres de negocio ficticios ni rubro */}
            <div className="min-w-0 flex-1">
              <p
                className="truncate text-base font-coolvetica text-slate-900 dark:text-white leading-tight"
                style={{ fontFamily: "var(--font-coolvetica), Coolvetica, sans-serif" }}
              >
                Agendate<span className="text-[#FF4F2B]">PY</span>
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5 font-medium">
                Automatizá tus turnos 24/7
              </p>
            </div>

            {/* Botón Principal con línea glow neón rotando alrededor */}
            <div className="flex items-center gap-1.5 xs:gap-2 shrink-0">
              <Link
                href="/onboarding"
                className="relative group p-[1.5px] rounded-xl overflow-hidden active:scale-95 transition-transform"
              >
                {/* Línea glow neón que va dando vueltas de a poco sobre el borde */}
                <span className="absolute inset-[-150%] animate-[spin_3.5s_linear_infinite] bg-[conic-gradient(from_0deg,transparent_0_300deg,#FF4F2B_360deg)] pointer-events-none" />
                <span className="relative flex h-8.5 xs:h-9 items-center justify-center gap-1.5 rounded-[10px] bg-[#FF4F2B] hover:bg-[#F04420] px-3.5 xs:px-4 text-xs font-black text-white shadow-md shadow-[#FF4F2B]/25 transition shrink-0 whitespace-nowrap">
                  <CalendarPlus className="h-3.5 w-3.5 text-white shrink-0" />
                  <span>Empezar gratis</span>
                  <ArrowRight className="h-3.5 w-3.5 shrink-0" />
                </span>
              </Link>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
