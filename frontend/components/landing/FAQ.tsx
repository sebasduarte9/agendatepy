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
    q: "¿AgendatePY cobra alguna comisión por mis reservas o ventas?",
    a: "No. En AgendatePY cobramos 0% de comisión sobre tus servicios, turnos o cobros. Pagás una suscripción mensual fija en Guaraníes y el 100% de lo que factura tu negocio va íntegro a tu cuenta bancaria.",
  },
  {
    q: "¿Mis clientes necesitan descargar alguna app para reservar?",
    a: "No. Tus clientes acceden a tu enlace web personalizado (tuneogocio.agendatepy.com) o reservan conversando por WhatsApp. Sin descargar nada ni crear contraseñas.",
  },
  {
    q: "¿Puedo colocar mi enlace de reserva en Instagram, Google Maps o TikTok?",
    a: "Sí. Tu enlace web personalizado está optimizado para colocarse en la biografía de Instagram, ficha de Google Maps o enviarse por WhatsApp. Tus clientes reservan en 30 segundos sin registrarse.",
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
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section id="faq" className="mx-auto max-w-3xl px-3 sm:px-6 py-12 sm:py-20 scroll-mt-20">
      <div className="text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-brand/20 bg-brand/10 px-3.5 py-1 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-brand">
          <HelpCircle className="h-3.5 w-3.5" /> Resolvemos tus Dudas
        </span>
        <h2 className="mt-3 text-2xl xs:text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
          Preguntas frecuentes
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-lg mx-auto">
          Todo lo que necesitás saber para poner en marcha tu agenda online en Paraguay.
        </p>
      </div>

      <div className="mt-6 sm:mt-8 space-y-2.5 sm:space-y-3">
        {FAQS.map((item, index) => {
          const isOpen = open === index;
          return (
            <div
              key={item.q}
              className="overflow-hidden rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 shadow-xs hover:border-brand/40 hover:-translate-y-0.5 hover:shadow-xs transition-all duration-200"
            >
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : index)}
                aria-expanded={isOpen}
                className="flex w-full items-center justify-between px-4 sm:px-5 py-3.5 sm:py-4 text-left text-xs sm:text-sm font-semibold text-slate-900 dark:text-white hover:bg-slate-50/70 dark:hover:bg-slate-800/60 transition cursor-pointer"
              >
                <span className="pr-3 leading-snug">{item.q}</span>
                <ChevronDown
                  className={`h-4 w-4 shrink-0 transition-transform duration-200 ${
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
                    <p className="px-4 sm:px-5 pb-3.5 sm:pb-4 text-xs leading-relaxed text-slate-600 dark:text-slate-300 border-t border-slate-100 dark:border-slate-800/80 pt-3">
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
