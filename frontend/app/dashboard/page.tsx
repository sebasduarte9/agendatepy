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
} from "lucide-react";
import { formatInTimeZone } from "date-fns-tz";
import { useDashboardStore } from "@/store/useDashboardStore";
import StatCard from "@/components/dashboard/ui/StatCard";
import Card from "@/components/dashboard/ui/Card";
import { formatGs } from "@/lib/dashboard-dates";

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
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 text-white shadow-xl">
        {/* Glow orb */}
        <div className="pointer-events-none absolute -right-10 -top-10 h-64 w-64 rounded-full bg-primary/30 blur-3xl" />

        <div className="relative z-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1.5 max-w-xl">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold backdrop-blur-md">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Sistema Operativo Online · Asunción, Paraguay</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
              ¡Bienvenido a {business.name}!
            </h1>
            <p className="text-xs text-slate-300 sm:text-sm leading-relaxed">
              Tus clientes pueden agendar turnos las 24hs desde tu enlace personalizado o por WhatsApp.
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
              className="inline-flex items-center gap-1.5 rounded-2xl bg-white/10 hover:bg-white/20 px-4 py-2.5 text-xs font-semibold text-white backdrop-blur-md transition"
            >
              <Palette className="h-4 w-4 text-amber-300" />
              <span>Personalizar Diseño</span>
            </Link>

            <Link
              href="/showcase"
              className="inline-flex items-center gap-1.5 rounded-2xl bg-white/10 hover:bg-white/20 px-4 py-2.5 text-xs font-semibold text-white backdrop-blur-md transition"
            >
              <Sparkles className="h-4 w-4 text-emerald-300" />
              <span>Galería de Estilos</span>
            </Link>
          </div>
        </div>

        {/* Public link copy bar */}
        <div className="relative z-10 mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-4 text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <span className="font-semibold text-white">Tu Link Oficial:</span>
            <code className="rounded-lg bg-black/30 px-2.5 py-1 font-mono text-[11px] text-amber-300">
              agendate.py/{business.slug || "barberia"}
            </code>
          </div>
          <span className="text-[11px] text-slate-400 flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" /> PostgreSQL sincronizado
          </span>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          label="Turnos confirmados"
          value={String(confirmed.length)}
          icon={CalendarDays}
          delta={14}
        />
        <StatCard label="Ingresos del mes" value={formatGs(revenue)} icon={TrendingUp} delta={22} />
        <StatCard
          label="Uso de reservas en el plan"
          value={`${business.usedBookings} / ${business.freeBookingLimit}`}
          hint="Plan Pro activo con WhatsApp ilimitado"
          icon={CalendarPlus}
        />
      </div>

      {/* Upcoming Appointments List */}
      <Card>
        <div className="mb-4 flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-3">
          <div>
            <h2 className="font-bold text-slate-900 dark:text-slate-100">Próximos turnos en agenda</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Citas programadas para los próximos días</p>
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
            .map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between rounded-2xl border border-border dark:border-slate-800 p-3 text-sm bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-100/70 dark:hover:bg-slate-800/80 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold text-xs">
                    {item.clientName.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <span className="block font-bold text-slate-900 dark:text-slate-100">
                      {item.clientName}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {services.find((s) => s.id === item.serviceId)?.name || "Servicio"}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="block font-semibold text-xs text-slate-800 dark:text-slate-200">
                    {formatInTimeZone(item.start, business.timezone, "dd/MM · HH:mm 'hs'")}
                  </span>
                  <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">
                    {item.status}
                  </span>
                </div>
              </li>
            ))}
        </ul>
      </Card>
    </div>
  );
}
