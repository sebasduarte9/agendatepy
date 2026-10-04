"use client";

import type { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

export default function Modal({
  open,
  title,
  onClose,
  children,
  id,
  maxWidth = "max-w-lg",
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  id?: string;
  maxWidth?: string;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          id={id}
          className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center bg-slate-950/65 backdrop-blur-md p-0 sm:p-4 overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 60, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 60, opacity: 0, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 350, damping: 30 }}
            onClick={(event) => event.stopPropagation()}
            className={`max-h-[92vh] sm:max-h-[88vh] w-full ${maxWidth} overflow-y-auto rounded-t-[32px] sm:rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white/95 dark:bg-[#0c1017]/95 p-5 sm:p-6 text-slate-900 dark:text-white shadow-2xl backdrop-blur-2xl transition-colors pb-[calc(1.5rem+env(safe-area-inset-bottom,16px))] sm:pb-6`}
          >
            {/* iOS Native Drag Handle Pill for Mobile */}
            <div className="sm:hidden -mt-1 mb-3 flex justify-center cursor-grab active:cursor-grabbing">
              <span className="h-1.5 w-12 rounded-full bg-slate-300 dark:bg-slate-700" />
            </div>

            {/* Modal Header */}
            <div className="mb-4 flex items-center justify-between border-b border-slate-100 dark:border-white/10 pb-3">
              <h3 className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-white">
                {title}
              </h3>
              <button
                type="button"
                onClick={onClose}
                aria-label="Cerrar"
                className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
