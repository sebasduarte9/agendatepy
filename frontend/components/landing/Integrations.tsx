import { motion } from "framer-motion";
import { MessageSquare, Share2, MapPin, QrCode, Landmark, CreditCard, Calendar, Smartphone } from "lucide-react";

const CHANNELS = [
  { name: "WhatsApp Oficial", icon: MessageSquare },
  { name: "Link en Instagram", icon: Share2 },
  { name: "Google Maps & Perfil", icon: MapPin },
  { name: "QR en Mostrador", icon: QrCode },
];

const PAYMENTS_AND_CAL = [
  { name: "SIPAP (Todos los Bancos)", icon: Landmark },
  { name: "QR Bancard & POS", icon: CreditCard },
  { name: "Google Calendar", icon: Calendar },
  { name: "Apple Wallet & iOS", icon: Smartphone },
];

export default function Integrations() {
  return (
    <section id="integraciones" className="relative overflow-hidden bg-slate-50/70 dark:bg-slate-950 py-12 sm:py-20 border-y border-slate-200/60 dark:border-white/10 scroll-mt-20">
      <div className="mx-auto max-w-6xl px-3 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mb-6 sm:mb-10"
        >
          <span className="rounded-full bg-brand/10 dark:bg-brand/20 px-3.5 py-1 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-brand">
            Conectividad & Canales
          </span>
          <h2 className="mt-3 text-2xl xs:text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
            Conectado a las herramientas que tus clientes ya usan en Paraguay
          </h2>
        </motion.div>

        <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
          {/* Card 1: Canales de Captura (entra por la izquierda) */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
            className="relative overflow-hidden rounded-3xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-slate-900 p-4 sm:p-6 lg:p-8 shadow-xs min-w-0"
          >
            <h3 className="text-base sm:text-xl font-bold text-slate-900 dark:text-white">
              Canales de Captura de Clientes
            </h3>
            <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              Compartí tu enlace donde tus clientes pasan el día. Reservan sin intermediarios desde tus redes sociales o directamente por chat.
            </p>
            <div className="mt-5 sm:mt-6 grid grid-cols-2 gap-2 sm:gap-2.5">
              {CHANNELS.map(({ name, icon: Icon }) => (
                <div
                  key={name}
                  className="flex items-center gap-1.5 sm:gap-2 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-slate-50 dark:bg-slate-800/60 p-2 sm:p-3 text-[11px] sm:text-xs font-semibold text-slate-800 dark:text-slate-200"
                >
                  <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-brand shrink-0" />
                  <span className="truncate">{name}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Card 2: Pagos y Calendario (entra por la derecha) */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.65, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="relative overflow-hidden rounded-3xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-slate-900 p-4 sm:p-6 lg:p-8 shadow-xs min-w-0"
          >
            <h3 className="text-base sm:text-xl font-bold text-slate-900 dark:text-white">
              Cobros Locales & Calendarios
            </h3>
            <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              Confirmación automática de transferencias bancarias locales y sincronización bidireccional con el teléfono de cada cliente.
            </p>
            <div className="mt-5 sm:mt-6 grid grid-cols-2 gap-2 sm:gap-2.5">
              {PAYMENTS_AND_CAL.map(({ name, icon: Icon }) => (
                <div
                  key={name}
                  className="flex items-center gap-1.5 sm:gap-2 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-slate-50 dark:bg-slate-800/60 p-2 sm:p-3 text-[11px] sm:text-xs font-semibold text-slate-800 dark:text-slate-200"
                >
                  <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span className="truncate">{name}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
