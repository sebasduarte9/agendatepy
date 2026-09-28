import { useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Circle,
  Trophy,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  PartyPopper,
  CalendarCheck2,
  ExternalLink,
  Award,
} from "lucide-react";
import { useDashboardStore } from "@/store/useDashboardStore";
import { getBusinessReadiness } from "@/lib/business-readiness";
import Card from "./ui/Card";

export default function ActivationChecklist() {
  const { business, services, staff, appointments, isInitialSyncDone } = useDashboardStore();
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (!isInitialSyncDone) {
    return null;
  }

  // Cómputo con datos 100% reales de PostgreSQL
  const validAppointments = appointments.filter((a) => a.status !== "cancelled");
  const readiness = getBusinessReadiness({
    name: business.name,
    slug: business.slug,
    status: "ACTIVE",
    services,
    staff,
    appointmentsCount: validAppointments.length,
  });

  const isFullyActivated = readiness.score === 100;
  const isFirstBookingCelebration = validAppointments.length === 1;
  const firstApp = validAppointments[0];
  const firstService = firstApp ? services.find((s) => s.id === firstApp.serviceId) : null;

  const steps = [
    {
      id: "info",
      title: "Información básica y enlace de reservas",
      done: readiness.checks.hasBasicInfo,
      href: "/dashboard/configuracion",
      cta: "Ver configuración",
    },
    {
      id: "services",
      title: "Al menos un servicio activo publicado",
      done: readiness.checks.hasActiveService,
      href: "/dashboard/servicios",
      cta: "+ Crear servicio",
    },
    {
      id: "staff",
      title: "Colaborador habilitado para atender turnos",
      done: readiness.checks.hasActiveStaff,
      href: "/dashboard/equipo",
      cta: "+ Agregar personal",
    },
    {
      id: "schedules",
      title: "Horarios y jornadas de atención configurados",
      done: readiness.checks.hasAvailability,
      href: "/dashboard/equipo",
      cta: "Configurar horarios",
    },
    {
      id: "booking",
      title: "Recibir tu primera reserva real",
      done: validAppointments.length > 0,
      href: `/${business.slug || "barberia"}/reservar`,
      cta: "Probar enlace",
      isExternal: true,
    },
  ];

  return (
    <div className="space-y-4" data-tour="activation-checklist">
      {/* 1. Celebración de Primera Reserva (Aha Moment) */}
      {isFirstBookingCelebration && (
        <div className="relative overflow-hidden rounded-3xl border border-emerald-500/30 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-emerald-500/10 p-5 shadow-lg backdrop-blur-md">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-md shadow-emerald-500/30">
              <PartyPopper className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  ¡Hito alcanzado!
                </span>
                <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                  Operativo
                </span>
              </div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white sm:text-xl">
                🎉 ¡Llegó la primera reserva de tu negocio!
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-300 sm:text-sm">
                <strong>{firstApp.clientName}</strong> agendó para{" "}
                <strong>{firstService?.name || "un servicio"}</strong>. Podés gestionarla y cobrarla desde tu calendario.
              </p>
              <div className="pt-2 flex gap-3">
                <Link
                  href="/dashboard/calendario"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 transition"
                >
                  <CalendarCheck2 className="h-3.5 w-3.5" />
                  <span>Ver en Agenda</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Tarjeta de Activación con Ícono de Logro (Trophy) */}
      <Card className="border border-slate-200/80 dark:border-white/10 bg-white/95 dark:bg-slate-900/95 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${
              isFullyActivated
                ? "bg-amber-500/10 text-amber-500 dark:text-amber-400 border border-amber-500/20 shadow-xs"
                : "bg-primary/10 text-primary border border-primary/20 shadow-xs"
            }`}>
              <Trophy className="h-5 w-5" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-900 dark:text-white sm:text-base">
                  {isFullyActivated ? "¡Negocio 100% Configurado!" : "Activación de tu Negocio"}
                </h2>
                <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-black uppercase ${
                  isFullyActivated
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                    : "bg-primary/10 text-primary border border-primary/20"
                }`}>
                  {readiness.score}% completado
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {isFullyActivated
                  ? "Tenés tus servicios, horarios y colaboradores listos para atender turnos."
                  : "Completá los pasos requeridos para abrir las reservas públicas online."}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            title={isCollapsed ? "Expandir pasos" : "Minimizar"}
          >
            {isCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
          </button>
        </div>

        {!isCollapsed && (
          <div className="pt-4 space-y-3.5 border-t border-slate-100 dark:border-white/5 mt-4">
            {/* Barra de progreso sutil */}
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 transition-all duration-500 ease-out"
                style={{ width: `${readiness.score}%` }}
              />
            </div>

            {/* Lista de Pasos (sin repetir enlaces ni QR innecesarios) */}
            <div className="grid gap-2 sm:grid-cols-2">
              {steps.map((st) => (
                <div
                  key={st.id}
                  className={`flex items-center justify-between rounded-xl border p-2.5 transition ${
                    st.done
                      ? "border-emerald-500/20 bg-emerald-50/30 dark:bg-emerald-950/10 text-slate-700 dark:text-slate-300"
                      : "border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 text-slate-900 dark:text-white"
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {st.done ? (
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                    ) : (
                      <Circle className="h-4 w-4 shrink-0 text-slate-400" />
                    )}
                    <span className={`text-xs font-semibold truncate ${st.done ? "line-through text-slate-400" : ""}`}>
                      {st.title}
                    </span>
                  </div>

                  {!st.done && (
                    <Link
                      href={st.href}
                      target={st.isExternal ? "_blank" : undefined}
                      className="inline-flex items-center gap-1 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary px-2 py-1 text-[11px] font-bold transition shrink-0 ml-2"
                    >
                      <span>{st.cta}</span>
                      {st.isExternal ? <ExternalLink className="h-3 w-3" /> : <ArrowRight className="h-3 w-3" />}
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
