"use client";

import { motion } from "framer-motion";
import { Percent, Smartphone, ShieldCheck, Wallet } from "lucide-react";

const ITEMS = [
  {
    icon: Percent,
    title: "0% Comisión por reserva",
    text: "Suscripción fija en Guaraníes. Cada guaraní que factura tu negocio ingresa íntegro a tu cuenta.",
  },
  {
    icon: Smartphone,
    title: "Tus clientes no descargan ninguna app",
    text: "Reservan desde el celular a cualquier hora, desde tu enlace en Instagram o hablando con el asistente de WhatsApp.",
  },
  {
    icon: ShieldCheck,
    title: "Prueba gratuitamente durante 14 días",
    text: "Creás tu agenda en 3 minutos, compartís tu enlace y empezás a recibir turnos de inmediato sin ingresar tarjeta.",
  },
  {
    icon: Wallet,
    title: "Cobrás directo a tu cuenta bancaria",
    text: "Transferencias SIPAP a cualquier banco de plaza, cobro con QR Bancard o efectivo al momento de la cita.",
  },
];

export default function Differentiators() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:py-20 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.6 }}
        className="max-w-2xl"
      >
        <span className="rounded-full bg-brand/10 dark:bg-brand/20 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-brand">
          Ventajas Clave
        </span>
        <h2 className="mt-3 text-2xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
          Por qué salones y consultorios en Paraguay eligen AgendatePY
        </h2>
      </motion.div>
      <div className="mt-8 sm:mt-10 grid gap-4 sm:gap-5 md:grid-cols-2">
        {ITEMS.map(({ icon: Icon, title, text }, index) => {
          const fromLeft = index % 2 === 0;
          return (
            <motion.article
              key={title}
              initial={{ opacity: 0, x: fromLeft ? -50 : 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, delay: (index % 2) * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="rounded-3xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-xs hover:border-brand/40 transition"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand/10 text-brand">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-base sm:text-lg font-bold text-slate-900 dark:text-white">{title}</h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{text}</p>
            </motion.article>
          );
        })}
      </div>
    </section>
  );
}
