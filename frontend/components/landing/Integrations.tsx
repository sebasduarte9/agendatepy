import { motion } from "framer-motion";
import { MessageSquare, Share2, MapPin, QrCode, Landmark, CreditCard, Calendar, Smartphone } from "lucide-react";



export default function Integrations() {
  return (
    <section id="integraciones" className="relative py-12 sm:py-20 scroll-mt-20">
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
          {/* Card 1: Canales de Captura */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
            className="relative overflow-hidden rounded-3xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-slate-900 p-4.5 sm:p-6 lg:p-8 shadow-xs flex flex-col justify-between min-w-0 hover:-translate-y-1 hover:shadow-md transition-all duration-300"
          >
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-brand/10 dark:bg-brand/20 px-3 py-0.5 text-[10px] sm:text-xs font-bold text-brand uppercase tracking-wider">
                Captura Directa
              </span>
              <h3 className="mt-2.5 text-base sm:text-xl font-bold text-slate-900 dark:text-white">
                Canales de Captura de Clientes
              </h3>
              <p className="mt-1.5 text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                <strong className="font-bold text-slate-900 dark:text-white block sm:inline">Reservas sin intermediarios. </strong>
                <span className="hidden sm:inline">Tus clientes agendan donde pasan el día, desde redes sociales o directamente por chat.</span>
              </p>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200/80 dark:border-white/10 bg-slate-50 dark:bg-slate-800/60 px-3 py-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200 shadow-2xs hover:border-brand/40 hover:-translate-y-0.5 hover:shadow-xs transition-all duration-200 select-none">
                <MessageSquare className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                WhatsApp Oficial
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200/80 dark:border-white/10 bg-slate-50 dark:bg-slate-800/60 px-3 py-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200 shadow-2xs hover:border-brand/40 hover:-translate-y-0.5 hover:shadow-xs transition-all duration-200 select-none">
                <Share2 className="h-3.5 w-3.5 text-pink-600 shrink-0" />
                Link en Instagram
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200/80 dark:border-white/10 bg-slate-50 dark:bg-slate-800/60 px-3 py-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200 shadow-2xs hover:border-brand/40 hover:-translate-y-0.5 hover:shadow-xs transition-all duration-200 select-none">
                <MapPin className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                Google Maps & Ficha
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200/80 dark:border-white/10 bg-slate-50 dark:bg-slate-800/60 px-3 py-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200 shadow-2xs hover:border-brand/40 hover:-translate-y-0.5 hover:shadow-xs transition-all duration-200 select-none">
                <QrCode className="h-3.5 w-3.5 text-brand shrink-0" />
                QR en Mostrador
              </span>
            </div>
          </motion.div>

          {/* Card 2: Pagos y Calendario */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.65, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="relative overflow-hidden rounded-3xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-slate-900 p-4.5 sm:p-6 lg:p-8 shadow-xs flex flex-col justify-between min-w-0 hover:-translate-y-1 hover:shadow-md transition-all duration-300"
          >
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 dark:bg-emerald-950/40 px-3 py-0.5 text-[10px] sm:text-xs font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider">
                Cobros & Agenda
              </span>
              <h3 className="mt-2.5 text-base sm:text-xl font-bold text-slate-900 dark:text-white">
                Cobros Locales & Calendarios
              </h3>
              <p className="mt-1.5 text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                <strong className="font-bold text-slate-900 dark:text-white block sm:inline">0% comisión bancaria. </strong>
                <span className="hidden sm:inline">Confirmación automática de transferencias y sincronización con alarmas en Android y iPhone.</span>
              </p>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200/80 dark:border-white/10 bg-slate-50 dark:bg-slate-800/60 px-3 py-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200 shadow-2xs hover:border-brand/40 hover:-translate-y-0.5 hover:shadow-xs transition-all duration-200 select-none">
                <Landmark className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                SIPAP (Todos los Bancos)
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200/80 dark:border-white/10 bg-slate-50 dark:bg-slate-800/60 px-3 py-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200 shadow-2xs hover:border-brand/40 hover:-translate-y-0.5 hover:shadow-xs transition-all duration-200 select-none">
                <CreditCard className="h-3.5 w-3.5 text-brand shrink-0" />
                QR Bancard & POS
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200/80 dark:border-white/10 bg-slate-50 dark:bg-slate-800/60 px-3 py-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200 shadow-2xs hover:border-brand/40 hover:-translate-y-0.5 hover:shadow-xs transition-all duration-200 select-none">
                <Calendar className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                Google Calendar
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200/80 dark:border-white/10 bg-slate-50 dark:bg-slate-800/60 px-3 py-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200 shadow-2xs hover:border-brand/40 hover:-translate-y-0.5 hover:shadow-xs transition-all duration-200 select-none">
                <Smartphone className="h-3.5 w-3.5 text-slate-800 dark:text-white shrink-0" />
                Apple Wallet & iOS
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
