"use client";

import Link from "next/link";
import {
  CalendarPlus,
  CalendarDays,
  TrendingUp,
  ExternalLink,
  Sparkles,
  Palette,
  ArrowRight,
  ShieldCheck,
  Smartphone,
  CheckCircle2,
  Clock,
  User,
} from "lucide-react";
import { formatInTimeZone } from "date-fns-tz";
import { useDashboardStore } from "@/store/useDashboardStore";
import Card from "@/components/dashboard/ui/Card";
import { formatGs } from "@/lib/dashboard-dates";
import AIFinanceCopilot from "@/components/dashboard/ai/AIFinanceCopilot";
import AIFinanceMetricsDeck from "@/components/dashboard/finance/AIFinanceMetricsDeck";

export default function DashboardHomePage() {
  const { appointments, services, business } = useDashboardStore();
  const confirmed = appointments.filter((a) => a.status === "confirmed");
  const revenue = confirmed.reduce((sum, item) => {
    const service = services.find((s) => s.id === item.serviceId);
    return sum + (service?.price ?? 0);
  }, 0);

  const publicBookingUrl = `/${business.slug || "barberia"}/reservar`;

  return (
    <div className="space-y-6">
      {/* Top Welcome & Quick Access Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-50/90 via-white to-purple-50/70 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950/80 border border-indigo-200/80 dark:border-white/10 p-6 text-slate-900 dark:text-white shadow-xl transition-all duration-300">
        {/* Glow orb */}
        <div className="pointer-events-none absolute -right-10 -top-10 h-64 w-64 rounded-full bg-primary/20 dark:bg-primary/30 blur-3xl" />

        <div className="relative z-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1.5 max-w-xl">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 dark:bg-white/10 border border-primary/20 dark:border-white/10 px-3 py-1 text-xs font-semibold text-primary dark:text-white backdrop-blur-md">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Sistema Operativo Online · Asunción, Paraguay</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white sm:text-3xl">
              ¡Bienvenido a {business.name}!
            </h1>
            <p className="text-xs text-slate-600 dark:text-slate-300 sm:text-sm leading-relaxed">
              Tus clientes pueden agendar turnos las 24hs desde tu enlace personalizado o por WhatsApp con sincronización de calendario.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href={publicBookingUrl}
              target="_blank"
              className="inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-2.5 text-xs font-bold text-white shadow-md hover:opacity-95 transition"
            >
              <Smartphone className="h-4 w-4" />
              <span>Ver mi Web de Reservas</span>
              <ExternalLink className="h-3.5 w-3.5 opacity-80" />
            </Link>

            <Link
              href="/dashboard/apariencia"
              className="inline-flex items-center gap-1.5 rounded-2xl bg-white dark:bg-white/10 hover:bg-slate-50 dark:hover:bg-white/20 border border-slate-200/80 dark:border-white/10 px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-white backdrop-blur-md transition shadow-2xs"
            >
              <Palette className="h-4 w-4 text-amber-500" />
              <span>Personalizar Diseño</span>
            </Link>

            <Link
              href="/dashboard/nueva-reserva"
              className="inline-flex items-center gap-1.5 rounded-2xl bg-white dark:bg-white/10 hover:bg-slate-50 dark:hover:bg-white/20 border border-slate-200/80 dark:border-white/10 px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-white backdrop-blur-md transition shadow-2xs"
            >
              <CalendarPlus className="h-4 w-4 text-emerald-500" />
              <span>Nueva Cita</span>
            </Link>
          </div>
        </div>

        {/* Public link copy bar */}
        <div className="relative z-10 mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-slate-200/60 dark:border-white/10 pt-4 text-xs">
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
            <span className="font-semibold text-slate-900 dark:text-white">Tu Link Oficial:</span>
            <code className="rounded-lg bg-primary/10 dark:bg-black/30 border border-primary/20 dark:border-white/10 px-2.5 py-1 font-mono text-[11px] text-primary dark:text-amber-300 font-bold">
              agendate.py/{business.slug || "barberia"}
            </code>
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 font-semibold">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" /> PostgreSQL & Google Sync Activo
          </span>
        </div>
      </div>

      {/* AI Copilot & Finance Intelligence Widget (Behance AI Finance SaaS UX) */}
      <AIFinanceCopilot
        businessName={business.name}
        monthlyRevenue={revenue}
        confirmedAppointments={confirmed.length}
      />

      {/* High-Precision Financial Metrics Deck & Cashflow Forecasting Chart */}
      <AIFinanceMetricsDeck
        monthlyRevenue={revenue}
        confirmedAppointments={confirmed.length}
        totalClients={new Set(appointments.map((a) => a.clientEmail)).size}
      />

      {/* Upcoming Appointments Velocity Feed */}
      <Card>
        <div className="mb-4 flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-black text-slate-900 dark:text-slate-100 text-base">
                Próximos turnos en agenda
              </h2>
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                {confirmed.length} confirmados
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Citas programadas con recordatorios automáticos por WhatsApp y calendario
            </p>
          </div>
          <Link
            href="/dashboard/calendario"
            className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
          >
            <span>Ver calendario completo</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <ul className="space-y-2.5">
          {appointments
            .filter((a) => a.status !== "cancelled")
            .slice(0, 5)
            .map((item) => {
              const service = services.find((s) => s.id === item.serviceId);
              return (
                <li
                  key={item.id}
                  className="flex items-center justify-between rounded-2xl border border-slate-200/80 dark:border-slate-800 p-3.5 text-sm bg-slate-50/60 dark:bg-slate-800/40 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 transition-all duration-300 hover:-translate-y-0.5"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-primary/20 to-primary/10 text-primary font-black text-xs shadow-xs">
                      {item.clientName.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-slate-100">
                          {item.clientName}
                        </span>
                        <span className="rounded-full bg-slate-200/70 dark:bg-slate-700/60 px-2 py-0.5 text-[9px] font-bold text-slate-600 dark:text-slate-300">
                          VIP
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        <span>{service?.name || "Servicio"}</span>
                        <span>•</span>
                        <span className="font-semibold text-primary">
                          {formatGs(service?.price ?? 65000)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="block font-bold text-xs text-slate-800 dark:text-slate-200">
                      {formatInTimeZone(item.start, business.timezone, "dd/MM · HH:mm 'hs'")}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase mt-0.5">
                      <CheckCircle2 className="h-2.5 w-2.5" />
                      {item.status}
                    </span>
                  </div>
                </li>
              );
            })}
        </ul>
      </Card>
    </div>
  );
}
