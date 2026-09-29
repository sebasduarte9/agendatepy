"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X } from "lucide-react";

import { getCommercialWhatsAppUrl } from "@/lib/config/whatsapp";

export default function WhatsAppFloatingButton() {
  const [isDismissed, setIsDismissed] = useState(false);
  const [hasScrolledPastHero, setHasScrolledPastHero] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setHasScrolledPastHero(window.scrollY > 380);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const whatsappUrl = getCommercialWhatsAppUrl(
    "Hola, quisiera asesoramiento sobre AgendatePY para mi negocio"
  );

  if (!hasScrolledPastHero) return null;

  return (
    <aside
      aria-label="Contacto por WhatsApp"
      className="fixed z-40 select-none transition-all duration-300 hidden sm:block sm:bottom-6 sm:right-6 max-w-md"
    >
      <AnimatePresence mode="wait">
        {!isDismissed ? (
          /* Estado 1: Widget unificado integrado (Icono WhatsApp + Textos + Botón Cerrar) */
          <motion.div
            key="widget-expanded"
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="group relative flex items-center gap-2 xs:gap-3 rounded-full border border-slate-200/90 dark:border-white/10 bg-white/95 dark:bg-slate-900/95 p-1 sm:py-1.5 sm:pl-1.5 sm:pr-3.5 shadow-[0_12px_36px_-6px_rgba(15,23,42,0.18)] dark:shadow-[0_12px_36px_-6px_rgba(0,0,0,0.5)] backdrop-blur-2xl transition-all duration-300 hover:border-emerald-500/40 hover:shadow-[0_16px_40px_-6px_rgba(37,211,102,0.22)]"
          >
            {/* Enlace envolvente al chat de WhatsApp */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1 text-left"
              aria-label="Chatear con un asesor de AgendatePY en Asunción por WhatsApp"
            >
              {/* Botón circular verde integrado en el componente */}
              <div className="relative flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-full bg-[#25D366] text-white shadow-md shadow-[#25D366]/30 transition-transform duration-200 group-hover:scale-105 active:scale-95">
                <span className="absolute -inset-0.5 rounded-full bg-[#25D366]/40 animate-ping opacity-60" />
                <MessageCircle className="relative z-10 h-5 w-5 sm:h-6 sm:w-6 fill-white stroke-none" />
                <span className="absolute top-0 right-0 h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full border-2 border-white dark:border-slate-900 bg-emerald-300" />
              </div>

              {/* Textos integrados: en pantallas móviles se oculta para no tapar el simulador ni botones */}
              <div className="hidden sm:block min-w-0 pr-1">
                <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-tight group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  ¿Dudas para tu local?
                </p>
                <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 leading-snug mt-0.5 line-clamp-1 sm:line-clamp-2">
                  Chateá con un asesor en Asunción ahora mismo.
                </p>
              </div>
            </a>

            {/* Botón cerrar discreto */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsDismissed(true);
              }}
              className="hidden sm:flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Cerrar mensaje"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </motion.div>
        ) : (
          /* Estado 2: Botón circular verde único cuando el usuario cerró el mensaje */
          <motion.div
            key="widget-collapsed"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
          >
            <motion.a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.94 }}
              className="group relative flex h-13 w-13 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_8px_30px_rgb(37,211,102,0.4)] transition-all duration-300"
              aria-label="Chatear por WhatsApp con AgendatePY"
            >
              <span className="absolute -inset-1 rounded-full bg-[#25D366]/40 animate-ping opacity-75" />
              <MessageCircle className="relative z-10 h-6 w-6 sm:h-7 sm:w-7 fill-white stroke-none" />
              <span className="absolute top-0.5 right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white dark:border-slate-900 bg-emerald-400" />
            </motion.a>
          </motion.div>
        )}
      </AnimatePresence>
    </aside>
  );
}
