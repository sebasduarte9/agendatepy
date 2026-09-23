"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

const FAQS = [
  {
    q: "¿Qué es AgendatePY y para qué tipo de negocios sirve en Paraguay?",
    a: "AgendatePY es la plataforma de agendamiento online y asistente por WhatsApp creada para negocios en Paraguay: peluquerías, barberías, salones de belleza, spas, consultorios médicos, odontología, canchas deportivas y profesionales independientes.",
  },
  {
    q: "¿Mis clientes necesitan descargar alguna app para reservar?",
    a: "No. Tus clientes acceden a tu enlace web personalizado (agendate.py/tu-negocio) o reservan conversando por WhatsApp. Sin descargar nada ni crear contraseñas.",
  },
  {
    q: "¿Cómo funcionan las comisiones de empleados?",
    a: "Podés asignar un porcentaje de comisión distinto a cada estilista o profesional (ej. 50% en corte, 40% en tintura). El sistema calcula automáticamente el total a liquidar a cada miembro de tu equipo al final del día o de la semana.",
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
    q: "¿Puedo probar el sistema gratis?",
    a: "Sí. Ofrecemos 30 días de prueba gratuita completa sin necesidad de ingresar tarjeta de crédito. Configurás tu negocio en menos de 5 minutos y empezás a recibir turnos hoy mismo.",
  },
];

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
      <div className="text-center">
        <span className="rounded-full bg-brand/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-brand">
          Resolvemos tus Dudas
        </span>
        <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          Preguntas frecuentes
        </h2>
      </div>
      <div className="mt-8 space-y-3">
        {FAQS.map((item, index) => {
          const isOpen = open === index;
          return (
            <div
              key={item.q}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs"
            >
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : index)}
                className="flex w-full items-center justify-between px-5 py-4 text-left text-sm font-semibold text-slate-900 hover:bg-slate-50/70 transition"
              >
                <span>{item.q}</span>
                <ChevronDown
                  className={`h-4 w-4 shrink-0 transition ${isOpen ? "rotate-180 text-brand" : "text-slate-400"}`}
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
                    <p className="px-5 pb-4 text-xs leading-relaxed text-slate-600 border-t border-slate-100 pt-3">
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
