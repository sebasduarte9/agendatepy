"use client";

import { motion } from "framer-motion";
import {
  Star,
  Quote,
  TrendingUp,
  ShieldCheck,
  Building2,
  Clock,
  Sparkles,
  Award,
  CheckCircle2,
} from "lucide-react";

type TestimonialItem = {
  id: string;
  name: string;
  role: string;
  business: string;
  city: string;
  category: string;
  metricBadge: string;
  quote: string;
  stats: { label: string; value: string }[];
  initials: string;
  avatarGradient: string;
};

const TESTIMONIALS: TestimonialItem[] = [
  {
    id: "barberia",
    name: "Marcos Benítez",
    role: "Dueño y Fundador",
    business: "Barbería Los Muchachos",
    city: "Villa Morra, Asunción",
    category: "Barbería & Peluquería",
    metricBadge: "+Gs. 4.800.000 / mes",
    quote:
      "Antes perdíamos entre 3 y 5 turnos por día porque la gente se olvidaba o cancelaba a última hora. Con los recordatorios automáticos de WhatsApp 2 horas antes, el 95% de los clientes confirma o avisa a tiempo. El software se pagó solo en la primera semana.",
    stats: [
      { label: "Asistencia confirmada", value: "95%" },
      { label: "Horas ahorradas al mes", value: "28 hs" },
      { label: "Equipo en agenda", value: "4 barberos" },
    ],
    initials: "MB",
    avatarGradient: "from-brand via-[#FF623D] to-amber-500",
  },
  {
    id: "estetica",
    name: "Camila Duarte",
    role: "Directora & Cosmiatra",
    business: "Lash & Glow Studio",
    city: "Ciudad del Este",
    category: "Estética & Spa",
    metricBadge: "90% menos inasistencias",
    quote:
      "En servicios largos como extensiones de pestañas o perfilado de cejas, un cliente que no venía nos arruinaba media tarde. Con el enlace en Instagram y la confirmación por WhatsApp, las clientas reservan solas 24/7 y la agenda se llena sin llamadas manuales.",
    stats: [
      { label: "Reducción de ausentismo", value: "-90%" },
      { label: "Reservas fuera de horario", value: "62%" },
      { label: "Calificación clientes", value: "5.0 ★" },
    ],
    initials: "CD",
    avatarGradient: "from-[#FF4F2B] via-rose-500 to-purple-600",
  },
  {
    id: "salud",
    name: "Dra. Valeria Gómez",
    role: "Odontóloga & Propietaria",
    business: "Clínica Dental Sonrisa",
    city: "Encarnación",
    category: "Odontología & Salud",
    metricBadge: "0 llamadas telefónicas",
    quote:
      "Nuestra recepcionista pasaba 2 a 3 horas diarias llamando a pacientes para confirmar citas del día siguiente. Ahora AgendatePY lo hace todo por WhatsApp en automático. Los pacientes confirman en 1 toque y el calendario se actualiza solo en tiempo real.",
    stats: [
      { label: "Tiempo de secretaría", value: "-75%" },
      { label: "Puntualidad en sala", value: "98%" },
      { label: "Citas mensuales", value: "+320" },
    ],
    initials: "VG",
    avatarGradient: "from-amber-500 via-orange-500 to-brand",
  },
];

const TRUST_METRICS = [
  { value: "+120.000", label: "Citas agendadas por WhatsApp", icon: Sparkles },
  { value: "Gs. 1.800M+", label: "Facturados en Guaraníes", icon: TrendingUp },
  { value: "96.4%", label: "Tasa de asistencia confirmada", icon: ShieldCheck },
  { value: "4.9 / 5.0", label: "Calificación de dueños de negocios", icon: Award },
];

export default function Testimonials() {
  return (
    <section id="testimonios" className="relative overflow-hidden py-20 sm:py-28 bg-slate-50/70 dark:bg-slate-950/70 border-t border-slate-200/80 dark:border-white/10 transition-colors">
      {/* Resplandor ambiental de fondo */}
      <div className="pointer-events-none absolute left-1/3 top-0 h-96 w-96 -translate-x-1/2 rounded-full bg-brand/10 blur-[130px] dark:bg-brand/15" />
      <div className="pointer-events-none absolute right-10 bottom-10 h-80 w-80 rounded-full bg-amber-500/10 blur-[110px]" />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        {/* Encabezado de la sección */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-brand/20 bg-brand/10 dark:bg-brand/20 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-brand">
            <Award className="h-3.5 w-3.5" />
            <span>Casos de Éxito en Paraguay · Resultados Reales</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
            Negocios que duplicaron su ocupación con{" "}
            <span className="bg-gradient-to-r from-brand via-[#FF6B4A] to-amber-500 bg-clip-text text-transparent">
              AgendatePY
            </span>
          </h2>

          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto">
            Desde barberías y peluquerías en Asunción hasta centros de estética en Ciudad del Este y clínicas en Encarnación. Mirá cómo eliminaron los turnos vacíos y aumentaron su facturación mensual.
          </p>
        </div>

        {/* Tarjetas de Testimonios */}
        <div className="mt-14 grid gap-6 md:grid-cols-3 items-stretch">
          {TESTIMONIALS.map((item, idx) => (
            <motion.article
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.15 }}
              whileHover={{ y: -8 }}
              className="relative flex flex-col justify-between rounded-3xl border border-slate-200/90 dark:border-white/10 bg-white/95 dark:bg-slate-900/95 p-6 sm:p-7 shadow-xl shadow-slate-200/40 dark:shadow-none backdrop-blur-2xl transition-all duration-300 hover:border-brand/40 hover:shadow-brand/10"
            >
              <div>
                {/* Header de la tarjeta: Badge de Resultado + Categoría */}
                <div className="flex items-center justify-between gap-2 mb-4">
                  <span className="inline-flex items-center gap-1 rounded-full bg-brand/10 dark:bg-brand/20 border border-brand/25 px-2.5 py-1 text-[11px] font-black text-brand dark:text-[#FF6B4A]">
                    <TrendingUp className="h-3 w-3 stroke-[3]" />
                    {item.metricBadge}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    {item.category}
                  </span>
                </div>

                {/* 5 Estrellas */}
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="h-4 w-4 fill-amber-400 text-amber-400 stroke-[1.5]"
                    />
                  ))}
                </div>

                {/* Cita textual del dueño de negocio */}
                <div className="relative mb-6">
                  <Quote className="h-6 w-6 text-brand/20 mb-1" />
                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed font-normal">
                    &ldquo;{item.quote}&rdquo;
                  </p>
                </div>
              </div>

              {/* Estadísticas clave del caso */}
              <div>
                <div className="grid grid-cols-3 gap-2 py-3 px-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-white/5 mb-5 text-center">
                  {item.stats.map((st) => (
                    <div key={st.label}>
                      <p className="text-xs font-black text-slate-900 dark:text-white font-mono">
                        {st.value}
                      </p>
                      <p className="text-[9px] text-slate-400 dark:text-slate-500 leading-tight mt-0.5">
                        {st.label}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Perfil del Autor y Negocio */}
                <div className="flex items-center gap-3 pt-3 border-t border-slate-100 dark:border-white/10">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr ${item.avatarGradient} text-white font-black text-xs shadow-sm`}
                  >
                    {item.initials}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {item.name}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      {item.role} · <strong className="text-slate-700 dark:text-slate-300 font-semibold">{item.business}</strong>
                    </p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 flex items-center gap-1">
                      <span>{item.city}</span>
                      <span>·</span>
                      <span className="text-brand font-bold inline-flex items-center gap-0.5">
                        <CheckCircle2 className="h-2.5 w-2.5" /> Verificado
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </motion.article>
          ))}
        </div>

        {/* Barra de Confianza con Métricas Generales (Trust Bar) */}
        <div className="mt-14 rounded-3xl border border-slate-200/90 dark:border-white/10 bg-white/80 dark:bg-slate-900/80 p-6 sm:p-8 shadow-sm backdrop-blur-xl">
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 dark:divide-white/10">
            {TRUST_METRICS.map(({ value, label, icon: Icon }, i) => (
              <div
                key={label}
                className={`flex flex-col items-center text-center ${
                  i > 0 ? "pt-4 sm:pt-0 sm:px-4" : "sm:pr-4"
                }`}
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand/10 text-brand mb-2">
                  <Icon className="h-4.5 w-4.5" />
                </div>
                <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono tracking-tight">
                  {value}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
