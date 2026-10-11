"use client";

import React from "react";
import { motion } from "framer-motion";
import { Store, Share2, CalendarCheck } from "lucide-react";
import AutomatedHubDiagram from "./AutomatedHubDiagram";

const STEPS = [
  {
    icon: Store,
    title: "Creá tu página",
    text: "Cargá tus servicios, horarios y logo. Queda lista en 3 minutos.",
  },
  {
    icon: Share2,
    title: "Compartí tu link",
    text: "Ponelo en Instagram, en tu WhatsApp o en Google Maps.",
  },
  {
    icon: CalendarCheck,
    title: "Los turnos caen solos",
    text: "Tus clientes reservan 24/7 y vos recibís todo confirmado en tu agenda.",
  },
];

export default function StackingCardsSection() {
  return (
    <section
      id="como-funciona"
      className="relative px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto py-16 sm:py-24 scroll-mt-24"
    >
      {/* Encabezado de Sección: Título y texto explicativo */}
      <div className="text-center max-w-3xl mx-auto mb-6 sm:mb-10 space-y-3.5">
        <h2 className="text-3xl xs:text-4xl sm:text-5xl font-black tracking-tight text-slate-950 dark:text-white leading-[1.12]">
          Todos tus canales conectados a{" "}
          <span className="text-[#FF4F2B]">
            un solo CRM
          </span>
        </h2>
        <p className="text-sm sm:text-base md:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Tus clientes conversan con tu IA por WhatsApp o reservan directo desde tus perfiles y web, y todas las citas caen organizadas en tu agenda al instante.
        </p>
      </div>

      {/* Animación Central: Hub interactivo con anillos concéntricos, cerebro y canales omnicanal */}
      <div className="w-full flex justify-center">
        <AutomatedHubDiagram />
      </div>

      <ol className="mt-10 sm:mt-14 grid gap-3 sm:grid-cols-3 sm:gap-5 max-w-5xl mx-auto">
        {STEPS.map((step, idx) => {
          const Icon = step.icon;
          return (
            <motion.li
              key={step.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1], delay: idx * 0.08 }}
              className="relative flex items-start gap-3.5 sm:flex-col sm:gap-4 rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-slate-900/70 p-4 sm:p-6 shadow-[0_12px_32px_-20px_rgba(15,23,42,0.25)] backdrop-blur-sm"
            >
              <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#FF4F2B]/10 text-[#FF4F2B]">
                <Icon className="h-5 w-5" />
                <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-slate-950 dark:bg-white text-[10px] font-black text-white dark:text-slate-950 tabular-nums">
                  {idx + 1}
                </span>
              </div>
              <div className="min-w-0">
                <h3 className="text-base sm:text-lg font-black tracking-tight text-slate-950 dark:text-white leading-tight">
                  {step.title}
                </h3>
                <p className="mt-1 text-[13px] sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {step.text}
                </p>
              </div>
            </motion.li>
          );
        })}
      </ol>
    </section>
  );
}
