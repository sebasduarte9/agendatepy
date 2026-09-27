"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, HelpCircle } from "lucide-react";

const FAQS = [
  {
    q: "¿Qué es AgendatePY y para qué tipo de negocios sirve en Paraguay?",
    a: "AgendatePY es la plataforma de agendamiento online y asistente por WhatsApp creada para negocios en Paraguay: peluquerías, barberías, salones de belleza, spas, consultorios médicos, odontología, canchas deportivas y profesionales independientes.",
  },
  {
    q: "¿Mis clientes necesitan descargar alguna app para reservar?",
    a: "No. Tus clientes acceden a tu enlace web personalizado (tuneogocio.agendatepy.com) o reservan conversando por WhatsApp. Sin descargar nada ni crear contraseñas.",
  },
  {
    q: "¿Cómo funcionan las comisiones de empleados y profesionales?",
    a: "Podés asignar un porcentaje de comisión distinto a cada estilista o profesional (ej. 50% en corte, 40% en tintura). El sistema calcula automáticamente el total a liquidar a cada miembro de tu equipo al final del día o de la semana sin planillas manuales.",
  },
  {
    q: "¿Qué medios de pago puedo ofrecer a mis clientes en Paraguay?",
    a: "Podés recibir transferencias bancarias SIPAP con confirmación por comprobante, cobros con QR Bancard o billeteras (Tigo Money, Personal Pay), o simplemente cobro presencial en efectivo o POS al momento de atenderlos.",
  },
  {
    q: "¿Cómo funcionan los recordatorios automáticos por WhatsApp?",
    a: "El sistema envía confirmación al agendar, recordatorio 24 horas antes y un aviso 2 horas antes de la cita. En el mensaje se incluye un enlace para que el cliente pueda confirmar o cancelar con un solo clic si no puede asistir, liberando el horario de inmediato.",
  },
  {
    q: "¿Puedo probar el sistema gratuitamente?",
    a: "Sí. Ofrecemos 14 días de prueba gratuita completa sin necesidad de ingresar tarjeta de crédito. Configurás tu negocio en menos de 3 minutos y empezás a recibir turnos hoy mismo.",
  },
];

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
      <div className="text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-brand/20 bg-brand/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-brand">
          <HelpCircle className="h-3.5 w-3.5" /> Resolvemos tus Dudas
        </span>
        <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-900 dark:text-white sm:text-4xl">
          Preguntas frecuentes
        </h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          Todo lo que necesitás saber para poner en marcha tu agenda online en Paraguay.
        </p>
      </div>

      <div className="mt-8 space-y-3">
        {FAQS.map((item, index) => {
          const isOpen = open === index;
          return (
            <div
              key={item.q}
              className="overflow-hidden rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 shadow-xs transition-colors"
            >
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : index)}
                className="flex w-full items-center justify-between px-5 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white hover:bg-slate-50/70 dark:hover:bg-slate-800/60 transition"
              >
                <span className="pr-3">{item.q}</span>
                <ChevronDown
                  className={`h-4 w-4 shrink-0 transition ${
                    isOpen ? "rotate-180 text-brand" : "text-slate-400"
                  }`}
                />
              </button>
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <p className="px-5 pb-4 text-xs leading-relaxed text-slate-600 dark:text-slate-300 border-t border-slate-100 dark:border-slate-800/80 pt-3">
                      {item.a}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </section>
  );
}
