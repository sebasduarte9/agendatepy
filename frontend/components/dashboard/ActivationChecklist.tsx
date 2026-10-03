import { useState, useEffect } from "react";
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

  useEffect(() => {
    if (isFullyActivated) {
      setIsCollapsed(true);
    }
  }, [isFullyActivated]);

  if (!isInitialSyncDone) {
    return null;
  }

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
      {/* 1. Celebración de Primera Reserva */}
      {isFirstBookingCelebration && (
        <div className="relative overflow-hidden rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 sm:p-5">
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500 text-white shadow-xs">
              <PartyPopper className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Hito alcanzado
                </span>
              </div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                Primera reserva recibida
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                <strong>{firstApp.clientName}</strong> agendó para{" "}
                <strong>{firstService?.name || "un servicio"}</strong>. Podés gestionarla desde tu calendario.
              </p>
              <div className="pt-2 flex gap-3">
                <Link
                  href="/dashboard/calendario"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 text-xs font-medium text-white transition"
                >
                  <CalendarCheck2 className="h-3.5 w-3.5" />
                  <span>Ver en Agenda</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Tarjeta de Activación */}
      <Card className="border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-4 sm:p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
              isFullyActivated
                ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                : "bg-primary/10 text-primary border border-primary/20"
            }`}>
              <CheckCircle2 className="h-4 w-4" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                  {isFullyActivated ? "Negocio 100% Configurado" : "Puesta a Punto del Negocio"}
                </h2>
                <span className={`rounded px-2 py-0.5 text-[10px] font-mono ${
                  isFullyActivated
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                }`}>
                  {readiness.score}% completado
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {isFullyActivated
                  ? "Servicios, horarios y colaboradores habilitados para turnos."
                  : "Completá los pasos requeridos para recibir reservas públicas online."}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="rounded-lg p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            title={isCollapsed ? "Mostrar detalles" : "Minimizar"}
          >
            {isCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
          </button>
        </div>

        {!isCollapsed && (
          <div className="pt-3.5 space-y-3 border-t border-slate-100 dark:border-slate-800 mt-3.5">
            {/* Barra de progreso limpia */}
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div
                className="h-full bg-emerald-500 transition-all duration-300"
                style={{ width: `${readiness.score}%` }}
              />
            </div>

            {/* Lista de Pasos */}
            <div className="grid gap-2 sm:grid-cols-2">
              {steps.map((st) => (
                <div
                  key={st.id}
                  className={`flex items-center justify-between rounded-lg border p-2.5 transition text-xs ${
                    st.done
                      ? "border-slate-200/60 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40 text-slate-600 dark:text-slate-400"
                      : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 text-slate-900 dark:text-slate-200"
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {st.done ? (
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                    ) : (
                      <Circle className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                    )}
                    <span className="truncate">
                      {st.title}
                    </span>
                  </div>

                  {!st.done && (
                    <Link
                      href={st.href}
                      target={st.isExternal ? "_blank" : undefined}
                      className="inline-flex items-center gap-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-2 py-0.5 text-[11px] font-medium transition shrink-0 ml-2"
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
