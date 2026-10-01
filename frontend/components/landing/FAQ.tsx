"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, HelpCircle } from "lucide-react";
import { LiquidGlassCard } from "@/components/ui/liquid-glass";

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
    a: "No. Tus clientes acceden a tu enlace web personalizado o reservan conversando por WhatsApp. Sin descargar nada ni crear contraseñas.",
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
    a: "Podés recibir transferencias bancarias directas con confirmación por comprobante, cobros con QR Bancard o billeteras (Tigo Money, Personal Pay), o simplemente cobro presencial en efectivo o POS al momento de atenderlos.",
  },
  {
    q: "¿Cómo funcionan los recordatorios automáticos por WhatsApp?",
    a: "El sistema envía confirmación al agendar, recordatorio 24 horas antes y un aviso 2 horas antes de la cita. En el mensaje se incluye un enlace para que el cliente pueda confirmar o cancelar con un solo clic si no puede asistir, liberando el horario de inmediato.",
  },
  {
    q: "¿Puedo probar el sistema gratuitamente?",
    a: "Sí. Podés registrarte y comenzar a recibir turnos de inmediato sin tarjeta de crédito. Configurás tu negocio en menos de 3 minutos y recibís reservas hoy mismo.",
  },
];

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(null);

  const leftColumnFaqs = FAQS.slice(0, 4);
  const rightColumnFaqs = FAQS.slice(4, 8);

  const renderFaqItem = (item: (typeof FAQS)[0], index: number) => {
    const isOpen = open === index;
    return (
      <LiquidGlassCard
        key={item.q}
        borderRadius="20px"
        blurIntensity="lg"
        glowIntensity="xs"
        shadowIntensity="sm"
        className="border border-white/60 dark:border-white/10 shadow-sm transition-all duration-200 hover:border-[#FF4F2B]/40"
      >
        <button
          type="button"
          onClick={() => setOpen(isOpen ? null : index)}
          aria-expanded={isOpen}
          className="flex w-full items-center justify-between px-4 sm:px-5 py-3.5 sm:py-4 text-left text-xs sm:text-sm font-bold text-slate-900 dark:text-white transition cursor-pointer"
        >
          <span className="pr-3 leading-snug">{item.q}</span>
          <ChevronDown
            className={`h-4 w-4 shrink-0 transition-transform duration-200 ${
              isOpen ? "rotate-180 text-[#FF4F2B]" : "text-slate-400"
            }`}
          />
        </button>
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <p className="px-4 sm:px-5 pb-3.5 sm:pb-4 text-xs leading-relaxed text-slate-600 dark:text-slate-300 border-t border-slate-200/50 dark:border-white/5 pt-3">
                {item.a}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </LiquidGlassCard>
    );
  };

  return (
    <section id="faq" className="mx-auto max-w-6xl px-3 sm:px-6 py-14 sm:py-20 scroll-mt-20">
      <div className="text-center mb-8 sm:mb-12">
        <h2 className="text-2xl xs:text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
          Preguntas frecuentes
        </h2>
        <p className="mt-2 text-xs sm:text-sm md:text-base text-slate-600 dark:text-slate-400 max-w-lg mx-auto">
          Todo lo que necesitás saber para poner en marcha tu agenda online en Paraguay.
        </p>
      </div>

      {/* Grid de 2 columnas: 4 a la izquierda y 4 a la derecha */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4 items-start">
        <div className="flex flex-col gap-3 sm:gap-3.5">
          {leftColumnFaqs.map((item, i) => renderFaqItem(item, i))}
        </div>
        <div className="flex flex-col gap-3 sm:gap-3.5">
          {rightColumnFaqs.map((item, i) => renderFaqItem(item, i + 4))}
        </div>
      </div>
    </section>
  );
}
