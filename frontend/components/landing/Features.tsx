"use client";

import { useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import {
  CalendarClock,
  MessageCircle,
  CreditCard,
  CalendarSync,
  BarChart3,
  ShieldCheck,
  LayoutDashboard,
  Globe,
  Headphones,
  CalendarDays,
} from "lucide-react";
import MiniCalendar from "./MiniCalendar";

const EXTRAS = [
  { icon: CalendarDays, label: "Multi-calendario" },
  { icon: LayoutDashboard, label: "Panel de administración" },
  { icon: BarChart3, label: "Estadísticas" },
  { icon: ShieldCheck, label: "Control anti-spam" },
  { icon: Globe, label: "Página con tu logo" },
  { icon: Headphones, label: "Soporte prioritario" },
];

export default function Features() {
  const [day, setDay] = useState<Date | null>(new Date());

  return (
    <section id="caracteristicas" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <p className="text-xs font-bold tracking-[0.2em] text-brand">CARACTERÍSTICAS</p>
      <h2 className="mt-2 max-w-xl text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
        Todo lo que necesitás para llenar tu agenda
      </h2>

      <div className="mt-10 grid gap-5 md:grid-cols-2">
        <FeatureCard
          title="Agenda online 24/7"
          description="Tus clientes reservan a cualquier hora desde el celular o PC."
          icon={<CalendarClock className="h-5 w-5" />}
        >
          <MiniCalendar selected={day} onSelect={setDay} compact />
        </FeatureCard>

        <FeatureCard
          title="WhatsApp Automático"
          description="Confirmación y recordatorios que sí leen. Reduce inasistencias un 80%."
          icon={<MessageCircle className="h-5 w-5" />}
          premium
        >
          <div className="flex items-center gap-2 text-sm text-whatsapp">
            <span className="rounded-full bg-whatsapp/10 px-3 py-1">Confirmación</span>
            <span className="rounded-full bg-whatsapp/10 px-3 py-1">-24hs</span>
            <span className="rounded-full bg-whatsapp/10 px-3 py-1">-2hs</span>
          </div>
        </FeatureCard>

        <FeatureCard
          title="Pagos Anticipados"
          description="Cobrá seña o total adelantado y asegura el turno."
          icon={<CreditCard className="h-5 w-5" />}
        >
          <div className="flex gap-2">
            <span className="rounded-xl bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700">
              SIPAP 24/7
            </span>
            <span className="rounded-xl bg-blue-50 px-3 py-2 text-xs font-bold text-blue-700">
              Bancard / POS
            </span>
          </div>
        </FeatureCard>

        <FeatureCard
          title="Google Calendar Sync"
          description="Sincronización instantánea para vos y tu cliente en un clic."
          icon={<CalendarSync className="h-5 w-5" />}
        >
          <div className="rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-600">
            Google Calendar · Outlook · Apple Calendar
          </div>
        </FeatureCard>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {EXTRAS.map(({ icon: Icon, label }) => (
          <div
            key={label}
            className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-3 text-xs font-medium text-slate-700 shadow-sm"
          >
            <Icon className="h-4 w-4 text-brand" />
            {label}
          </div>
        ))}
      </div>
    </section>
  );
}

function FeatureCard({
  title,
  description,
  icon,
  children,
  premium = false,
}: {
  title: string;
  description: string;
  icon: ReactNode;
  children: ReactNode;
  premium?: boolean;
}) {
  return (
    <motion.article
      whileHover={{ rotateX: 4, rotateY: -4, y: -6 }}
      transition={{ type: "spring", stiffness: 260, damping: 18 }}
      className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm [transform-style:preserve-3d]"
    >
      <div className="flex items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10 text-brand">
          {icon}
        </div>
        {premium && (
          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-700">
            Premium
          </span>
        )}
      </div>
      <h3 className="mt-4 text-lg font-bold text-slate-900">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">{description}</p>
      <div className="mt-5">{children}</div>
    </motion.article>
  );
}
