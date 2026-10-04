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
  minHeight = "",
  className = "",
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  id?: string;
  maxWidth?: string;
  minHeight?: string;
  className?: string;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          id={id}
          className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center bg-black/60 dark:bg-black/75 backdrop-blur-md p-0 sm:p-4 overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.14 }}
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 32, opacity: 0, scale: 0.985 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 24, opacity: 0, scale: 0.985 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            onClick={(event) => event.stopPropagation()}
            className={`max-h-[92vh] sm:max-h-[88vh] w-full ${maxWidth} ${minHeight} ${className} overflow-y-auto rounded-t-[32px] sm:rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#121215] p-5 sm:p-6 text-slate-900 dark:text-white shadow-2xl pb-[calc(1.5rem+env(safe-area-inset-bottom,16px))] sm:pb-6`}
          >
            {/* iOS Native Drag Handle Pill for Mobile */}
            <div className="sm:hidden -mt-1.5 mb-3.5 flex justify-center cursor-grab active:cursor-grabbing">
              <span className="h-1.2 w-10 rounded-full bg-slate-300 dark:bg-zinc-700/80" />
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
                className="h-7 w-7 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-white transition active:scale-90 cursor-pointer"
              >
                <X className="h-4 w-4" />
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
