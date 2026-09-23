"use client";

import { motion } from "framer-motion";

export default function WhatsAppConfirm({ href }: { href: string | null }) {
  if (!href) {
    return (
      <p className="mt-8 rounded-3xl bg-amber-50 px-4 py-4 text-sm text-amber-800">
        El local todavía no cargó su WhatsApp. Tu turno sigue reservado 15 minutos.
      </p>
    );
  }

  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="mt-8 flex min-h-16 items-center justify-center rounded-full bg-whatsapp px-6 text-center text-lg font-bold text-white"
    >
      Confirmar por WhatsApp
    </motion.a>
  );
}
