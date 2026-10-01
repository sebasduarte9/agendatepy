"use client";

import { motion } from "framer-motion";
import { Percent, Smartphone, ShieldCheck, Wallet } from "lucide-react";
import { LiquidGlassCard } from "@/components/ui/liquid-glass";

const ITEMS = [
  {
    icon: Percent,
    title: "0% Comisión por reserva",
    valuePhrase: "Suscripción fija mensual en Guaraníes.",
    detail: "Cada guaraní que factura tu negocio ingresa íntegro a tu cuenta sin retenciones por turno.",
  },
  {
    icon: Smartphone,
    title: "Tus clientes no descargan apps",
    valuePhrase: "Reservas web directas desde Instagram o WhatsApp.",
    detail: "Tus clientes acceden desde el navegador del celular o hablando con tu asistente sin contraseñas.",
  },
  {
    icon: ShieldCheck,
    title: "Comenzá sin tarjeta de crédito",
    valuePhrase: "Activación en 3 minutos sin contratos a plazo.",
    detail: "Creás tu agenda, compartís tu enlace y empezás a recibir turnos de inmediato sin complicaciones.",
  },
  {
    icon: Wallet,
    title: "Cobrás directo a tu cuenta local",
    valuePhrase: "Transferencias bancarias, QR Bancard o efectivo.",
    detail: "Validación automática con cualquier banco de plaza en Paraguay o cobro presencial en el local.",
  },
];

export default function Differentiators() {
  return (
    <section id="diferenciales" className="relative mx-auto max-w-7xl px-3 sm:px-6 py-12 sm:py-20 scroll-mt-20">
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.6 }}
        className="max-w-2xl"
      >
        <h2 className="text-2xl xs:text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
          Por qué salones y consultorios en Paraguay eligen AgendatePY
        </h2>
      </motion.div>
      <div className="mt-8 sm:mt-10 grid gap-4 sm:gap-5 md:grid-cols-2">
        {ITEMS.map(({ icon: Icon, title, valuePhrase, detail }, index) => {
          return (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, delay: (index % 2) * 0.1, ease: [0.16, 1, 0.3, 1] }}
            >
              <LiquidGlassCard
                borderRadius="24px"
                blurIntensity="lg"
                glowIntensity="xs"
                shadowIntensity="sm"
                className="border border-white/60 dark:border-white/10 p-5 sm:p-6 hover:border-[#FF4F2B]/40 transition-all duration-300"
              >
                <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-2xl bg-brand/10 text-brand">
                  <Icon className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
                </div>
                <h3 className="mt-3.5 sm:mt-4 text-base sm:text-lg font-bold text-slate-900 dark:text-white">{title}</h3>
                <p className="mt-1 text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200">
                  {valuePhrase}
                </p>
                <p className="hidden sm:block mt-1 text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {detail}
                </p>
              </LiquidGlassCard>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
