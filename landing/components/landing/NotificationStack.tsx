"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  MessageCircle,
  Landmark,
  BellRing,
  CalendarClock,
  Link2,
  Coins,
} from "lucide-react";

type LiveNotification = {
  icon: React.ElementType;
  iconBg: string;
  source: string;
  title: string;
  body: string;
};

const NOTIFICATIONS: LiveNotification[] = [
  {
    icon: MessageCircle,
    iconBg: "bg-[#25D366]",
    source: "WhatsApp IA",
    title: "Nuevo turno agendado",
    body: "Martín · Corte y barba · Hoy 16:30",
  },
  {
    icon: Landmark,
    iconBg: "bg-[#FF4F2B]",
    source: "Agendatepy",
    title: "Seña recibida",
    body: "Gs. 50.000 · Transferencia verificada",
  },
  {
    icon: BellRing,
    iconBg: "bg-amber-500",
    source: "Recordatorios",
    title: "Ana confirmó su turno",
    body: "Mañana 10:00 · Recordatorio 24 h",
  },
  {
    icon: Link2,
    iconBg: "bg-violet-500",
    source: "Link de reserva",
    title: "Reserva desde Instagram",
    body: "Diego · Limpieza dental · Vie 9:00",
  },
  {
    icon: CalendarClock,
    iconBg: "bg-blue-500",
    source: "Agenda",
    title: "Turno reprogramado",
    body: "Lucía pasó al jueves 18:00",
  },
  {
    icon: Coins,
    iconBg: "bg-indigo-500",
    source: "Caja",
    title: "Cierre del día listo",
    body: "14 turnos · Gs. 1.240.000",
  },
];

const VISIBLE = 3;
const INTERVAL_MS = 2800;

const SLOTS = [
  { y: 0, scale: 1, opacity: 1 },
  { y: 11, scale: 0.94, opacity: 1 },
  { y: 21, scale: 0.88, opacity: 0.9 },
];

const COLLAPSED_HEIGHT = 94;
const EXPANDED_GAP = 72;
const AUTO_COLLAPSE_MS = 6000;

export default function NotificationStack({ className = "" }: { className?: string }) {
  const reduceMotion = useReducedMotion();
  const [head, setHead] = useState(NOTIFICATIONS.length);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (reduceMotion || expanded) return;
    const id = window.setInterval(() => {
      if (!document.hidden) setHead((h) => h + 1);
    }, INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [reduceMotion, expanded]);

  useEffect(() => {
    if (!expanded) return;
    const id = window.setTimeout(() => setExpanded(false), AUTO_COLLAPSE_MS);
    return () => window.clearTimeout(id);
  }, [expanded]);

  const stack = Array.from({ length: VISIBLE }, (_, slot) => {
    const seq = head - slot;
    return { seq, slot, item: NOTIFICATIONS[seq % NOTIFICATIONS.length] };
  });

  return (
    <motion.div
      role="button"
      tabIndex={0}
      onClick={() => setExpanded((v) => !v)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          setExpanded((v) => !v);
        }
      }}
      aria-expanded={expanded}
      aria-label={expanded ? "Agrupar notificaciones" : "Ver notificaciones recientes"}
      initial={false}
      animate={{ height: expanded ? COLLAPSED_HEIGHT + EXPANDED_GAP * (VISIBLE - 1) : COLLAPSED_HEIGHT }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className={`relative block select-none cursor-pointer [-webkit-tap-highlight-color:transparent] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#FF4F2B] rounded-[18px] ${className}`}
    >
      <AnimatePresence initial={false}>
        {stack.map(({ seq, slot, item }) => {
          const Icon = item.icon;
          const target = expanded ? { y: slot * EXPANDED_GAP, scale: 1, opacity: 1 } : SLOTS[slot];
          const showContent = expanded || slot === 0;
          return (
            <motion.div
              key={seq}
              className="absolute inset-x-0 top-0 origin-top"
              style={{ zIndex: VISIBLE - slot }}
              initial={{ y: -28, scale: 1.03, opacity: 0, filter: "blur(8px)" }}
              animate={{ ...target, filter: "blur(0px)" }}
              exit={{ y: 30, scale: 0.82, opacity: 0, filter: "blur(4px)" }}
              transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
            >
              <div
                className={`rounded-[18px] px-3 py-2.5 sm:px-3.5 sm:py-3 transition-colors duration-500 ${
                  showContent
                    ? "bg-white dark:bg-slate-900 shadow-[0_12px_32px_-10px_rgba(15,23,42,0.30)] dark:shadow-[0_12px_32px_-10px_rgba(0,0,0,0.6)]"
                    : "bg-slate-50 dark:bg-slate-800 shadow-[0_6px_16px_-8px_rgba(15,23,42,0.22)]"
                }`}
              >
                <motion.div
                  className="flex items-center gap-3"
                  initial={false}
                  animate={{ opacity: showContent ? 1 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <span
                    className={`flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-[11px] text-white ${item.iconBg}`}
                  >
                    <Icon className="h-[18px] w-[18px] sm:h-5 sm:w-5" strokeWidth={2.25} />
                  </span>
                  <div className="min-w-0 flex-1 text-left">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 truncate">
                        {item.source}
                      </span>
                      <span className="text-[10px] sm:text-[11px] text-slate-400 dark:text-slate-500 shrink-0">
                        ahora
                      </span>
                    </div>
                    <p className="text-[13px] sm:text-sm font-bold text-slate-900 dark:text-white leading-tight truncate">
                      {item.title}
                    </p>
                    <p className="text-xs sm:text-[13px] text-slate-600 dark:text-slate-300 leading-snug truncate tabular-nums">
                      {item.body}
                    </p>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </motion.div>
  );
}
