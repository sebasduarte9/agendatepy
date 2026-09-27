"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Sparkles } from "lucide-react";

export default function WhatsAppFloatingButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasDismissedTooltip, setHasDismissedTooltip] = useState(false);

  const whatsappUrl =
    "https://wa.me/595981123456?text=Hola%2C%20quisiera%20asesoramiento%20sobre%20AgendatePY%20para%20mi%20negocio";

  return (
    <aside aria-label="Contacto por WhatsApp" className="fixed bottom-5 right-4 sm:bottom-6 sm:right-6 z-50 flex flex-col items-end">
      {/* Tooltip / Badge de ayuda flotante */}
      <AnimatePresence>
        {!hasDismissedTooltip && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, y: 5 }}
            transition={{ duration: 0.3 }}
            className="mb-2.5 flex items-center gap-2 rounded-2xl border border-slate-200/90 dark:border-white/10 bg-white/95 dark:bg-slate-900/95 p-3 pr-2 shadow-2xl backdrop-blur-xl text-xs max-w-[270px]"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
              <Sparkles className="h-4 w-4" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-slate-900 dark:text-white leading-tight">
                ¿Dudas para tu local?
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                Chateá con un asesor en Asunción ahora mismo.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setHasDismissedTooltip(true)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
              aria-label="Cerrar mensaje"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Botón Principal Flotante con efecto Ping */}
      <motion.a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_8px_30px_rgb(37,211,102,0.4)] transition-all duration-300"
        aria-label="Chatear por WhatsApp con AgendatePY"
      >
        {/* Anillo de pulso sutil */}
        <span className="absolute -inset-1 rounded-full bg-[#25D366]/40 animate-ping opacity-75" />

        {/* Ícono de WhatsApp SVG oficial */}
        <MessageCircle className="relative z-10 h-7 w-7 fill-white stroke-none" />

        {/* Indicador de operador en línea */}
        <span className="absolute top-0.5 right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white dark:border-slate-900 bg-emerald-400" />
      </motion.a>
    </aside>
  );
}
