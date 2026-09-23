"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useDashboardStore } from "@/store/useDashboardStore";

export default function ToastProvider() {
  const toasts = useDashboardStore((s) => s.toasts);
  const dismissToast = useDashboardStore((s) => s.dismissToast);

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[90] flex w-[min(100%-2rem,22rem)] flex-col gap-2">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.button
            key={toast.id}
            type="button"
            onClick={() => dismissToast(toast.id)}
            initial={{ y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 16, opacity: 0 }}
            className={`custom-notification pointer-events-auto rounded-2xl px-4 py-3 text-left text-sm font-medium text-white shadow-lg ${
              toast.type === "success" ? "bg-emerald-600" : "bg-rose-600"
            }`}
          >
            {toast.message}
          </motion.button>
        ))}
      </AnimatePresence>
    </div>
  );
}
