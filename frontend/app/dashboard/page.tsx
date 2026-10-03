"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  CalendarPlus,
  CalendarDays,
  TrendingUp,
  Palette,
  ArrowRight,
  ShieldCheck,
  Smartphone,
  CheckCircle2,
  Clock,
  User,
  Scissors,
  Banknote,
  MessageSquare,
  MessagesSquare,
  Ban,
  Receipt,
  Coins,
  AlertCircle,
} from "lucide-react";
import { formatInTimeZone } from "date-fns-tz";
import { useDashboardStore } from "@/store/useDashboardStore";
import Card from "@/components/dashboard/ui/Card";
import ActivationChecklist from "@/components/dashboard/ActivationChecklist";
import { formatGs, phoneWa } from "@/lib/dashboard-dates";
import type { Appointment } from "@/lib/dashboard-types";

export default function DashboardHomePage() {
  const appointments = useDashboardStore((s) => s.appointments);
  const services = useDashboardStore((s) => s.services);
  const staff = useDashboardStore((s) => s.staff);
  const business = useDashboardStore((s) => s.business);
  const clients = useDashboardStore((s) => s.clients);
  const cashMovements = useDashboardStore((s) => s.cashMovements);
  const crmConversations = useDashboardStore((s) => s.crmConversations);
  const updateAppointment = useDashboardStore((s) => s.updateAppointment);
  const addCashMovement = useDashboardStore((s) => s.addCashMovement);
  const pushToast = useDashboardStore((s) => s.pushToast);
  const isInitialSyncDone = useDashboardStore((s) => s.isInitialSyncDone);

  const [filterTab, setFilterTab] = useState<"hoy" | "pendientes" | "todos">("hoy");

  // Today's civil date in Asunción
  const todayStr = useMemo(() => {
    try {
      return formatInTimeZone(new Date(), business.timezone || "America/Asuncion", "yyyy-MM-dd");
    } catch {
      return "2026-09-25";
    }
  }, [business.timezone]);

  // Appointments today
  const appointmentsToday = useMemo(() => {
    return appointments.filter((a) => {
      if (a.status === "cancelled") return false;
      const aDate = a.start.slice(0, 10);
      return aDate === todayStr;
    });
  }, [appointments, todayStr]);

  // Total confirmed
  const confirmedToday = appointmentsToday.filter((a) => a.status === "confirmed" || a.status === "completed");
  const pendingToday = appointmentsToday.filter((a) => a.status === "pending");

  // Revenue today (from confirmed/completed appointments + income cash movements)
  const revenueToday = useMemo(() => {
    const fromAppointments = confirmedToday.reduce((sum, item) => {
      const s = services.find((sv) => sv.id === item.serviceId);
      return sum + (s?.price ?? 0);
    }, 0);

    const fromCash = cashMovements
      .filter((m) => m.type === "ingreso" && m.date.slice(0, 10) === todayStr)
      .reduce((sum, m) => sum + m.amount, 0);

    return fromAppointments + fromCash;
  }, [confirmedToday, services, cashMovements, todayStr]);

  // Estimated chair occupancy rate today (assuming 10 working hours * 3 active staff = 30 available hours)
  const occupancyRate = useMemo(() => {
    const totalMinutesBooked = appointmentsToday.reduce((sum, item) => {
      const s = services.find((sv) => sv.id === item.serviceId);
      return sum + (s?.durationMin ?? 45);
    }, 0);
    const activeStaffCount = staff.filter((s) => s.active).length || 3;
    const availableMinutes = activeStaffCount * 10 * 60; // 10h per day
    return Math.min(100, Math.round((totalMinutesBooked / availableMinutes) * 100));
  }, [appointmentsToday, services, staff]);

  // Filtered list to display in the agenda
  const displayAppointments = useMemo(() => {
    if (filterTab === "hoy") {
      return appointmentsToday.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
    }
    if (filterTab === "pendientes") {
      return appointments.filter((a) => a.status === "pending");
    }
    return appointments.filter((a) => a.status !== "cancelled").slice(0, 8);
  }, [filterTab, appointmentsToday, appointments]);

  // CRM unread count
  const unreadMessagesCount = useMemo(() => {
    return crmConversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0);
  }, [crmConversations]);

  const handleCompleteAndPay = async (app: Appointment) => {
    const isAlreadyCharged = cashMovements.some((m) => m.appointmentId === app.id);
    if (isAlreadyCharged) {
      pushToast("error", "Esta cita ya fue cobrada en caja anteriormente.");
      return;
    }

    const service = services.find((s) => s.id === app.serviceId);
    const price = service?.price ?? 80000;

    const ok = await addCashMovement({
      type: "ingreso",
      amount: price,
      method: app.paymentMethod === "sipap" ? "transferencia" : app.paymentMethod === "pos_bancard" ? "pos" : "efectivo",
      concept: `Cobro turno: ${service?.name || "Servicio"} - ${app.clientName}`,
      date: new Date().toISOString(),
      appointmentId: app.id,
    });

    if (ok) {
      await updateAppointment(app.id, { status: "completed" });
      pushToast("success", `Turno de ${app.clientName} completado y cobrado (${formatGs(price)} en caja).`);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="space-y-6 pb-12 sm:pb-8 w-full max-w-full overflow-hidden"
    >
      {/* Clean Architectural Header & Command Bar */}
      <div
        data-tour="welcome-banner"
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pt-1 pb-2 w-full max-w-full min-w-0"
      >
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
            <span className="font-medium text-slate-700 dark:text-slate-300">{business.name}</span>
            <span>·</span>
            <span>{business.city ? `${business.city}, Paraguay` : (business.address || "Paraguay")}</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            Panel de Operaciones
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/dashboard/nueva-reserva"
            className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 px-3.5 py-2 text-xs font-semibold shadow-xs transition"
          >
            <CalendarPlus className="h-4 w-4" />
            <span>+ Nueva Cita</span>
          </Link>

          <Link
            href="/dashboard/caja"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 transition shadow-2xs"
          >
            <Banknote className="h-4 w-4 text-slate-400" />
            <span>Caja & Arqueo</span>
          </Link>

          <Link
            href="/dashboard/crm"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 transition shadow-2xs"
          >
            <MessagesSquare className="h-4 w-4 text-slate-400" />
            <span>Mensajes</span>
            {unreadMessagesCount > 0 && (
              <span className="rounded-full bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-[10px] font-bold px-1.5 py-0.2">
                {unreadMessagesCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Checklist de Activación del Negocio (se oculta automáticamente al 100%) */}
      <ActivationChecklist />

      {/* 4 Clean Operational KPI Cards */}
      <div data-tour="kpi-cards" className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Revenue Today */}
        <div className="rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900/50 p-4 sm:p-5 transition hover:border-slate-300 dark:hover:border-slate-700">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
            <span>Recaudación de Hoy</span>
            <Banknote className="h-4 w-4 text-slate-400" />
          </div>
          {!isInitialSyncDone ? (
            <div className="h-7 w-32 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-lg mt-2" />
          ) : (
            <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-white tabular-nums">
              {formatGs(revenueToday)}
            </p>
          )}
          <div className="mt-1.5 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <span className="font-medium text-emerald-600 dark:text-emerald-400">{confirmedToday.length} turnos</span>
            <span>cobrados / confirmados</span>
          </div>
        </div>

        {/* Card 2: Appointments Today */}
        <div className="rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900/50 p-4 sm:p-5 transition hover:border-slate-300 dark:hover:border-slate-700">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
            <span>Citas del Día</span>
            <CalendarDays className="h-4 w-4 text-slate-400" />
          </div>
          {!isInitialSyncDone ? (
            <div className="h-7 w-24 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-lg mt-2" />
          ) : (
            <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-white tabular-nums">
              {appointmentsToday.length} <span className="text-sm font-normal text-slate-400">turnos</span>
            </p>
          )}
          <div className="mt-1.5 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <span>{confirmedToday.length} confirmados</span>
            {pendingToday.length > 0 ? (
              <>
                <span>·</span>
                <span className="text-amber-600 dark:text-amber-400 font-medium">{pendingToday.length} pendientes</span>
              </>
            ) : (
              <>
                <span>·</span>
                <span>0 pendientes</span>
              </>
            )}
          </div>
        </div>

        {/* Card 3: Chair Occupancy */}
        <div className="rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900/50 p-4 sm:p-5 transition hover:border-slate-300 dark:hover:border-slate-700">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
            <span>Ocupación de Agenda</span>
            <TrendingUp className="h-4 w-4 text-slate-400" />
          </div>
          {!isInitialSyncDone ? (
            <div className="h-7 w-20 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-lg mt-2" />
          ) : (
            <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-white tabular-nums">
              {occupancyRate}%
            </p>
          )}
          <div className="mt-1.5 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <span>{staff.filter((s) => s.active).length} colaboradores atendiendo</span>
          </div>
        </div>

        {/* Card 4: Total Clients */}
        <div className="rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900/50 p-4 sm:p-5 transition hover:border-slate-300 dark:hover:border-slate-700">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
            <span>Clientes Registrados</span>
            <User className="h-4 w-4 text-slate-400" />
          </div>
          {!isInitialSyncDone ? (
            <div className="h-7 w-20 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-lg mt-2" />
          ) : (
            <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-white tabular-nums">
              {clients.length} <span className="text-sm font-normal text-slate-400">fichas</span>
            </p>
          )}
          <div className="mt-1.5 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <span>{clients.filter((c) => c.tags?.includes("VIP")).length} VIP</span>
            <span>·</span>
            <span>historial activo</span>
          </div>
        </div>
      </div>

      {/* Main 2-Column Operational Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full max-w-full min-w-0">
        {/* Left Column (2/3 width): Today's Agenda Feed */}
        <div data-tour="agenda-operativa" className="lg:col-span-2 space-y-4 w-full max-w-full min-w-0">
          <Card className="w-full max-w-full min-w-0 overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="font-semibold text-slate-900 dark:text-slate-100 text-base">
                    Agenda Operativa
                  </h2>
                  <span className="rounded px-2 py-0.5 text-[10px] font-mono text-slate-500 bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/40 shrink-0">
                    {displayAppointments.length} turnos
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                  Turnos del día y cobros en tiempo real.
                </p>
              </div>

              {/* Filter tabs */}
              <div className="flex items-center gap-1 rounded-lg bg-slate-100 dark:bg-slate-800 p-0.5 text-xs shrink-0 self-start sm:self-auto max-w-full overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden border border-slate-200/80 dark:border-slate-700/60">
                <button
                  type="button"
                  onClick={() => setFilterTab("hoy")}
                  className={`rounded-md px-2.5 py-1 font-medium transition shrink-0 whitespace-nowrap cursor-pointer ${
                    filterTab === "hoy"
                      ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  Hoy
                </button>
                <button
                  type="button"
                  onClick={() => setFilterTab("pendientes")}
                  className={`rounded-md px-2.5 py-1 font-medium transition shrink-0 whitespace-nowrap cursor-pointer ${
                    filterTab === "pendientes"
                      ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  Pendientes ({pendingToday.length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterTab("todos")}
                  className={`rounded-md px-2.5 py-1 font-medium transition shrink-0 whitespace-nowrap cursor-pointer ${
                    filterTab === "todos"
                      ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  Próximos
                </button>
              </div>
            </div>

            {/* List */}
            {displayAppointments.length === 0 ? (
              <div className="py-12 text-center space-y-3">
                <CalendarDays className="h-9 w-9 mx-auto text-slate-300 dark:text-slate-600" />
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  No hay turnos para este filtro hoy.
                </p>
                <Link
                  href="/dashboard/nueva-reserva"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-xs font-medium text-white shadow-xs"
                >
                  <CalendarPlus className="h-3.5 w-3.5" />
                  <span>Agendar Nuevo Turno</span>
                </Link>
              </div>
            ) : (
              <ul className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {displayAppointments.map((item) => {
                  const service = services.find((s) => s.id === item.serviceId);
                  const assignedStaff = staff.find((st) => st.id === item.staffId);
                  const client = clients.find((c) => c.phone === item.clientPhone || c.name === item.clientName);
                  const isVip = client?.tags?.includes("VIP");

                  const timeFormatted = formatInTimeZone(item.start, business.timezone || "America/Asuncion", "HH:mm 'hs'");
                  const dateFormatted = formatInTimeZone(item.start, business.timezone || "America/Asuncion", "dd/MM");

                  const waBase = phoneWa(item.clientPhone);
                  const waReminderMsg = encodeURIComponent(
                    `¡Hola ${item.clientName}! Te recordamos tu turno para *${service?.name || "tu servicio"}* hoy a las *${timeFormatted}* en *${business.name}*.\n\nDirección: ${business.address}\n¿Confirmás tu asistencia?`
                  );
                  const waUrl = `${waBase}?text=${waReminderMsg}`;

                  return (
                    <li
                      key={item.id}
                      className="py-3 px-2 hover:bg-slate-50/70 dark:hover:bg-slate-800/30 rounded-xl transition min-w-0 w-full"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 min-w-0 w-full">
                        {/* Left: Avatar + Details */}
                        <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs mt-0.5 sm:mt-0">
                            {item.clientName.slice(0, 2).toUpperCase()}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="font-semibold text-slate-900 dark:text-slate-100 text-sm truncate max-w-[150px] sm:max-w-none">
                                {item.clientName}
                              </span>
                              {isVip && (
                                <span className="rounded px-1.5 py-0.2 text-[9px] font-mono text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 shrink-0">
                                  VIP
                                </span>
                              )}
                              <span
                                className={`rounded px-2 py-0.5 text-[10px] font-mono shrink-0 ${
                                  item.status === "completed"
                                    ? "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200/60 dark:border-slate-700/40"
                                    : item.status === "confirmed"
                                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                                    : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                                }`}
                              >
                                {item.status === "completed"
                                  ? "Cobrado"
                                  : item.status === "confirmed"
                                  ? "Confirmado"
                                  : "Pendiente"}
                              </span>
                            </div>

                            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                              <span className="font-medium text-slate-700 dark:text-slate-300 truncate max-w-[160px] sm:max-w-none">
                                {service?.name || "Servicio"}
                              </span>
                              <span>•</span>
                              <span className="font-mono text-slate-700 dark:text-slate-300 shrink-0">
                                {formatGs(service?.price ?? 80000)}
                              </span>
                              {assignedStaff && (
                                <>
                                  <span>•</span>
                                  <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 truncate">
                                    <Scissors className="h-3 w-3 text-slate-400 shrink-0" />
                                    {assignedStaff.name}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>

                          {/* Mobile-only time pill */}
                          <div className="sm:hidden text-right shrink-0">
                            <span className="block font-semibold text-xs text-slate-900 dark:text-white tabular-nums">
                              {timeFormatted}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {dateFormatted}
                            </span>
                          </div>
                        </div>

                        {/* Actions Toolbar */}
                        <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 pt-2 sm:pt-0 border-t border-slate-100 dark:border-slate-800 sm:border-t-0 w-full sm:w-auto">
                          {/* Desktop time display */}
                          <div className="hidden sm:block text-right shrink-0 mr-1">
                            <span className="block font-semibold text-xs text-slate-900 dark:text-white tabular-nums">
                              {timeFormatted}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {dateFormatted}
                            </span>
                          </div>

                          {/* WhatsApp Direct */}
                          <a
                            href={waUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-500/30 text-xs font-medium transition shrink-0"
                            title="Enviar recordatorio por WhatsApp"
                          >
                            <MessageSquare className="h-3.5 w-3.5 shrink-0" />
                            <span className="sm:hidden">WhatsApp</span>
                          </a>

                          <div className="flex items-center gap-1.5">
                            {/* Ficha técnica shortcut */}
                            <Link
                              href={`/dashboard/clientes?cliente=${encodeURIComponent(item.clientName)}`}
                              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition shrink-0"
                              title="Ver Ficha Técnica"
                            >
                              <User className="h-3.5 w-3.5" />
                            </Link>

                            {/* Cobrar en caja button */}
                            {item.status !== "completed" && (
                              <button
                                type="button"
                                onClick={() => handleCompleteAndPay(item)}
                                className="inline-flex items-center gap-1 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90 px-3 py-1.5 text-xs font-semibold transition shadow-xs shrink-0 cursor-pointer"
                                title="Marcar como atendido y registrar ingreso en caja"
                              >
                                <Banknote className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                                <span>Cobrar</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}

            <div className="border-t border-slate-100 dark:border-slate-800 pt-3 mt-2 flex items-center justify-between text-xs">
              <Link
                href="/dashboard/calendario"
                className="font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white flex items-center gap-1"
              >
                <span>Ver calendario completo</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </Card>
        </div>

        {/* Right Column (1/3 width): Live CRM Inbox & Quick Operations */}
        <div data-tour="quick-actions-crm" className="space-y-4 w-full max-w-full min-w-0">
          {/* CRM Quick Inbox Card */}
          <Card className="w-full max-w-full min-w-0 overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2 min-w-0">
                <MessagesSquare className="h-4 w-4 text-slate-500 shrink-0" />
                <h3 className="font-semibold text-slate-900 dark:text-white text-sm truncate">
                  Mensajes Recientes
                </h3>
              </div>
              <Link
                href="/dashboard/crm"
                className="text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white shrink-0 ml-2"
              >
                Abrir CRM
              </Link>
            </div>

            <div className="mt-3 space-y-2">
              {crmConversations.length === 0 ? (
                <div className="py-6 text-center space-y-1">
                  <MessagesSquare className="h-7 w-7 mx-auto text-slate-300 dark:text-slate-600" />
                  <p className="text-xs font-medium text-slate-600 dark:text-slate-300">Sin mensajes pendientes</p>
                  <p className="text-[11px] text-slate-400">Los chats entrantes de tus clientes aparecerán aquí.</p>
                </div>
              ) : (
                crmConversations.slice(0, 3).map((conv) => {
                  const lastMsg = conv.messages[conv.messages.length - 1];
                  return (
                    <Link
                      key={conv.id}
                      href="/dashboard/crm"
                      className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/30 hover:bg-slate-100/70 dark:hover:bg-slate-800/70 transition min-w-0 w-full"
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <div className="relative shrink-0">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs">
                            {conv.clientName.slice(0, 2).toUpperCase()}
                          </div>
                          <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-500 border border-white dark:border-slate-900" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-slate-900 dark:text-white text-xs truncate">
                            {conv.clientName}
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                            {lastMsg?.text || "Consulta sobre turnos"}
                          </p>
                        </div>
                      </div>

                      <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase shrink-0 ml-2 px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800">
                        {conv.channel}
                      </span>
                    </Link>
                  );
                })
              )}
            </div>
          </Card>

          {/* Quick Operations Deck */}
          <Card className="p-4 sm:p-5 w-full max-w-full min-w-0 overflow-hidden">
            <h3 className="font-semibold text-slate-900 dark:text-white text-sm pb-3 border-b border-slate-100 dark:border-slate-800">
              Accesos Rápidos
            </h3>

            <div className="mt-3 divide-y divide-slate-100 dark:divide-slate-800/80 text-xs">
              <Link
                href="/dashboard/bloquear-horario"
                className="flex items-center justify-between py-2.5 px-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition group"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Ban className="h-4 w-4 text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition shrink-0" />
                  <div>
                    <p className="font-medium text-slate-800 dark:text-slate-200">Bloquear Horario</p>
                    <p className="text-[11px] text-slate-400">Descansos o ausencias</p>
                  </div>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-slate-300 dark:text-slate-600 group-hover:translate-x-0.5 transition" />
              </Link>

              <Link
                href="/dashboard/transferencias"
                className="flex items-center justify-between py-2.5 px-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition group"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Receipt className="h-4 w-4 text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition shrink-0" />
                  <div>
                    <p className="font-medium text-slate-800 dark:text-slate-200">SIPAP Bancario</p>
                    <p className="text-[11px] text-slate-400">Validar transferencias</p>
                  </div>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-slate-300 dark:text-slate-600 group-hover:translate-x-0.5 transition" />
              </Link>

              <Link
                href="/dashboard/comisiones"
                className="flex items-center justify-between py-2.5 px-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition group"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Coins className="h-4 w-4 text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition shrink-0" />
                  <div>
                    <p className="font-medium text-slate-800 dark:text-slate-200">Comisiones</p>
                    <p className="text-[11px] text-slate-400">Liquidación al personal</p>
                  </div>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-slate-300 dark:text-slate-600 group-hover:translate-x-0.5 transition" />
              </Link>

              <Link
                href="/dashboard/apariencia"
                className="flex items-center justify-between py-2.5 px-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition group"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Palette className="h-4 w-4 text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition shrink-0" />
                  <div>
                    <p className="font-medium text-slate-800 dark:text-slate-200">Diseño Web</p>
                    <p className="text-[11px] text-slate-400">Colores y página pública</p>
                  </div>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-slate-300 dark:text-slate-600 group-hover:translate-x-0.5 transition" />
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}
