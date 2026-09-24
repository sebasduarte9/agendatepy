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
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  id?: string;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          id={id}
          className="fixed inset-0 z-[80] flex items-end justify-center bg-slate-950/60 backdrop-blur-md p-4 sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 20, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 20, opacity: 0, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            onClick={(event) => event.stopPropagation()}
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white/95 dark:bg-slate-900/95 p-6 text-slate-900 dark:text-white shadow-2xl backdrop-blur-2xl transition-colors"
          >
            <div className="mb-4 flex items-center justify-between border-b border-slate-100 dark:border-white/10 pb-3">
              <h3 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">{title}</h3>
              <button
                type="button"
                onClick={onClose}
                aria-label="Cerrar"
                className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
