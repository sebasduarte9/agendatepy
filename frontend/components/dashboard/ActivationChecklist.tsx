"use client";

import { useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Circle,
  Sparkles,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  PartyPopper,
  CalendarCheck2,
  Share2,
  ExternalLink,
} from "lucide-react";
import { useDashboardStore } from "@/store/useDashboardStore";
import { getBusinessReadiness } from "@/lib/business-readiness";
import PublicBookingLink from "./PublicBookingLink";
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

  const isFullyActivated = readiness.isReady && validAppointments.length > 0;
  const isFirstBookingCelebration = validAppointments.length === 1;
  const firstApp = validAppointments[0];
  const firstService = firstApp ? services.find((s) => s.id === firstApp.serviceId) : null;

  // Si ya completó todo y tiene reservas, mostramos solo una versión compacta discreta
  if (isFullyActivated && isCollapsed) {
    return (
      <div className="flex items-center justify-between rounded-2xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-2 text-xs">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          <span className="font-semibold text-slate-800 dark:text-slate-200">
            Tu negocio está 100% listo y recibiendo reservas activas
          </span>
        </div>
        <button
          type="button"
          onClick={() => setIsCollapsed(false)}
          className="text-primary hover:underline font-semibold text-[11px]"
        >
          Ver detalles
        </button>
      </div>
    );
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
      cta: "Hacer prueba como cliente",
      isExternal: true,
    },
  ];

  return (
    <div className="space-y-4">
      {/* 1. Celebración de Primera Reserva (Aha Moment) */}
      {isFirstBookingCelebration && (
        <div className="relative overflow-hidden rounded-3xl border-2 border-emerald-500/30 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-emerald-500/10 p-5 shadow-lg backdrop-blur-md">
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
                  PostgreSQL Real
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

      {/* 2. Tarjeta del Checklist de Activación */}
      <Card className="border border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-white sm:text-base">
                Activación de tu Negocio
              </h2>
              <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary">
                {readiness.score}% completado
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {readiness.isReady
                ? "¡Tu negocio está listo para recibir turnos! Compartí tu enlace público con tus clientes."
                : "Completá los pasos requeridos para abrir las reservas públicas online."}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            title={isCollapsed ? "Expandir checklist" : "Minimizar checklist"}
          >
            {isCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
          </button>
        </div>

        {!isCollapsed && (
          <div className="pt-4 space-y-4">
            {/* Barra de progreso */}
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div
                className="h-full bg-gradient-to-r from-primary to-emerald-500 transition-all duration-500 ease-out"
                style={{ width: `${readiness.score}%` }}
              />
            </div>

            {/* Lista de Pasos */}
            <div className="grid gap-2.5 sm:grid-cols-2">
              {steps.map((st) => (
                <div
                  key={st.id}
                  className={`flex items-center justify-between rounded-xl border p-3 transition ${
                    st.done
                      ? "border-emerald-500/20 bg-emerald-50/40 dark:bg-emerald-950/20 text-slate-700 dark:text-slate-300"
                      : "border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 text-slate-900 dark:text-white"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {st.done ? (
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                    ) : (
                      <Circle className="h-4 w-4 shrink-0 text-slate-400" />
                    )}
                    <span className={`text-xs font-semibold ${st.done ? "line-through text-slate-500" : ""}`}>
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

            {/* Enlace Público Integrado */}
            <div className="pt-2">
              <PublicBookingLink
                slug={business.slug || "barberia"}
                businessName={business.name}
                variant="banner"
              />
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
