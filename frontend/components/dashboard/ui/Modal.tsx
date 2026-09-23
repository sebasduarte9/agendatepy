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
          className="fixed inset-0 z-[80] flex items-end justify-center bg-slate-900/60 backdrop-blur-xs p-4 sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 24, opacity: 0 }}
            onClick={(event) => event.stopPropagation()}
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-[24px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 text-slate-900 dark:text-slate-100 shadow-2xl transition-colors"
          >
            <div className="mb-4 flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-3">
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">{title}</h3>
              <button
                type="button"
                onClick={onClose}
                aria-label="Cerrar"
                className="rounded-full p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
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
