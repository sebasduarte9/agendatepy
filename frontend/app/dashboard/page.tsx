"use client";

import { useMemo, useState } from "react";
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
  Scissors,
  Banknote,
  MessageSquare,
  MessagesSquare,
  Copy,
  Check,
  Ban,
  Receipt,
  Coins,
  ChevronRight,
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

  const [copiedLink, setCopiedLink] = useState(false);
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

  const publicBookingUrl = `/${business.slug || "barberia"}/reservar`;

  const copyBookingLink = () => {
    const fullUrl = typeof window !== "undefined"
      ? `${window.location.origin}${publicBookingUrl}`
      : `https://agendate.py${publicBookingUrl}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedLink(true);
    pushToast("success", "¡Enlace copiado al portapapeles!");
    setTimeout(() => setCopiedLink(false), 2500);
  };

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
    <div className="space-y-6">
      {/* Top Welcome & Operational Command Bar */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-violet-600/10 via-indigo-600/5 to-purple-600/10 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950/70 border border-violet-200/80 dark:border-white/10 p-6 text-slate-900 dark:text-white shadow-xl backdrop-blur-xl transition-all duration-300">
        <div className="pointer-events-none absolute -right-10 -top-10 h-64 w-64 rounded-full bg-primary/15 dark:bg-primary/20 blur-3xl" />

        <div className="relative z-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1.5 max-w-xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 dark:bg-white/10 border border-primary/20 dark:border-white/10 px-3 py-1 text-xs font-semibold text-primary dark:text-white backdrop-blur-md">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Abierto hoy · Asunción, Paraguay</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white sm:text-3xl">
              ¡Buen día, {business.name}!
            </h1>
            <p className="text-xs text-slate-600 dark:text-slate-300 sm:text-sm leading-relaxed">
              Panel central de operaciones: agenda sincronizada, cobros en caja y CRM omnicanal activo.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href="/dashboard/nueva-reserva"
              className="inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-primary/25 hover:opacity-95 transition"
            >
              <CalendarPlus className="h-4 w-4" />
              <span>+ Nueva Cita</span>
            </Link>

            <Link
              href="/dashboard/caja"
              className="inline-flex items-center gap-1.5 rounded-2xl bg-white dark:bg-white/10 hover:bg-slate-50 dark:hover:bg-white/20 border border-slate-200/80 dark:border-white/10 px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-white backdrop-blur-md transition shadow-2xs"
            >
              <Banknote className="h-4 w-4 text-emerald-500" />
              <span>Caja & Arqueo</span>
            </Link>

            <Link
              href="/dashboard/crm"
              className="inline-flex items-center gap-1.5 rounded-2xl bg-white dark:bg-white/10 hover:bg-slate-50 dark:hover:bg-white/20 border border-slate-200/80 dark:border-white/10 px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-white backdrop-blur-md transition shadow-2xs"
            >
              <MessagesSquare className="h-4 w-4 text-violet-500" />
              <span>CRM Chats</span>
              {unreadMessagesCount > 0 && (
                <span className="rounded-full bg-red-500 px-1.5 py-0.2 text-[10px] font-black text-white">
                  {unreadMessagesCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Public link copy bar */}
        <div className="relative z-10 mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200/60 dark:border-white/10 pt-4 text-xs">
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
            <span className="font-semibold text-slate-900 dark:text-white">Tu Web de Reservas:</span>
            <code className="rounded-lg bg-primary/10 dark:bg-black/30 border border-primary/20 dark:border-white/10 px-2.5 py-1 font-mono text-[11px] text-primary dark:text-amber-300 font-bold">
              agendate.py/{business.slug || "barberia"}
            </code>
            <button
              type="button"
              onClick={copyBookingLink}
              className="inline-flex items-center gap-1 rounded-lg bg-white/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-white/10 px-2 py-1 font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
              title="Copiar enlace"
            >
              {copiedLink ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3 text-slate-400" />}
              <span>{copiedLink ? "Copiado" : "Copiar"}</span>
            </button>
            <Link
              href={publicBookingUrl}
              target="_blank"
              className="inline-flex items-center gap-1 font-semibold text-primary hover:underline ml-1"
            >
              <span>Ver en vivo</span>
              <ExternalLink className="h-3 w-3" />
            </Link>
          </div>

          <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 font-semibold">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" /> Base de Datos PostgreSQL Conectada
          </span>
        </div>
      </div>

      {/* Checklist de Activación del Negocio & Hitos Operacionales */}
      <ActivationChecklist />

      {/* 4 Clean Operational KPI Cards (Real Data Calculated) */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Revenue Today */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 p-5 shadow-sm backdrop-blur-xl transition hover:-translate-y-0.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Recaudación de Hoy
            </span>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Banknote className="h-4 w-4" />
            </span>
          </div>
          {!isInitialSyncDone ? (
            <div className="h-8 w-32 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-lg mt-2" />
          ) : (
            <p className="mt-2 text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              {formatGs(revenueToday)}
            </p>
          )}
          <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
            <span className="font-bold text-emerald-600 dark:text-emerald-400">{confirmedToday.length} turnos</span>
            <span>cobrados / confirmados</span>
          </div>
          <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-400 opacity-80" />
        </div>

        {/* Card 2: Appointments Today */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 p-5 shadow-sm backdrop-blur-xl transition hover:-translate-y-0.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Citas del Día
            </span>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400">
              <CalendarDays className="h-4 w-4" />
            </span>
          </div>
          {!isInitialSyncDone ? (
            <div className="h-8 w-24 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-lg mt-2" />
          ) : (
            <p className="mt-2 text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              {appointmentsToday.length} <span className="text-sm font-semibold text-slate-400">turnos</span>
            </p>
          )}
          <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
            <span className="font-bold text-emerald-600">{confirmedToday.length} confirmados</span>
            <span>·</span>
            <span className="font-bold text-amber-600">{pendingToday.length} pendientes</span>
          </div>
          <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-violet-500 to-indigo-500 opacity-80" />
        </div>

        {/* Card 3: Chair Occupancy */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 p-5 shadow-sm backdrop-blur-xl transition hover:-translate-y-0.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Ocupación de Agenda
            </span>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <TrendingUp className="h-4 w-4" />
            </span>
          </div>
          {!isInitialSyncDone ? (
            <div className="h-8 w-20 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-lg mt-2" />
          ) : (
            <p className="mt-2 text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              {occupancyRate}%
            </p>
          )}
          <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
            <span>{staff.filter((s) => s.active).length} profesionales atendiendo hoy</span>
          </div>
          <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-blue-500 to-cyan-400 opacity-80" />
        </div>

        {/* Card 4: Total Clients */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 p-5 shadow-sm backdrop-blur-xl transition hover:-translate-y-0.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Clientes Registrados
            </span>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <User className="h-4 w-4" />
            </span>
          </div>
          {!isInitialSyncDone ? (
            <div className="h-8 w-20 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-lg mt-2" />
          ) : (
            <p className="mt-2 text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              {clients.length} <span className="text-sm font-semibold text-slate-400">fichas</span>
            </p>
          )}
          <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
            <span className="font-bold text-amber-600">{clients.filter((c) => c.tags?.includes("VIP")).length} VIP</span>
            <span>con historial técnico</span>
          </div>
          <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-amber-500 to-orange-400 opacity-80" />
        </div>
      </div>

      {/* Main 2-Column Operational Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column (2/3 width): Today's Agenda Feed */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-white/10 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-black text-slate-900 dark:text-slate-100 text-base">
                    Agenda Operativa
                  </h2>
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                    {displayAppointments.length} turnos
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Gestión directa: confirma, cobrá en caja o comunicate con el cliente en 1 clic
                </p>
              </div>

              {/* Filter tabs */}
              <div className="flex items-center gap-1 rounded-xl bg-slate-100 dark:bg-slate-800 p-1 text-xs">
                <button
                  type="button"
                  onClick={() => setFilterTab("hoy")}
                  className={`rounded-lg px-2.5 py-1 font-bold transition ${
                    filterTab === "hoy"
                      ? "bg-white dark:bg-slate-700 text-primary dark:text-white shadow-2xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                  }`}
                >
                  Hoy
                </button>
                <button
                  type="button"
                  onClick={() => setFilterTab("pendientes")}
                  className={`rounded-lg px-2.5 py-1 font-bold transition ${
                    filterTab === "pendientes"
                      ? "bg-white dark:bg-slate-700 text-primary dark:text-white shadow-2xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                  }`}
                >
                  Pendientes ({pendingToday.length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterTab("todos")}
                  className={`rounded-lg px-2.5 py-1 font-bold transition ${
                    filterTab === "todos"
                      ? "bg-white dark:bg-slate-700 text-primary dark:text-white shadow-2xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                  }`}
                >
                  Próximos
                </button>
              </div>
            </div>

            {/* List */}
            {displayAppointments.length === 0 ? (
              <div className="py-12 text-center space-y-3">
                <CalendarDays className="h-10 w-10 mx-auto text-slate-300 dark:text-slate-600" />
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                  No hay turnos para este filtro hoy.
                </p>
                <Link
                  href="/dashboard/nueva-reserva"
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white shadow-sm"
                >
                  <CalendarPlus className="h-3.5 w-3.5" />
                  <span>Agendar Nuevo Turno</span>
                </Link>
              </div>
            ) : (
              <ul className="divide-y divide-slate-100 dark:divide-white/5">
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
                      className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 p-2 rounded-2xl transition"
                    >
                      {/* Left: Avatar + Details */}
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary font-black text-xs shadow-2xs">
                          {item.clientName.slice(0, 2).toUpperCase()}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                              {item.clientName}
                            </span>
                            {isVip && (
                              <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[9px] font-black text-amber-600 dark:text-amber-400 border border-amber-500/20">
                                VIP
                              </span>
                            )}
                            <span
                              className={`rounded-full px-2 py-0.5 text-[9px] font-black uppercase ${
                                item.status === "completed"
                                  ? "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                                  : item.status === "confirmed"
                                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                  : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                              }`}
                            >
                              {item.status === "completed"
                                ? "Cobrado"
                                : item.status === "confirmed"
                                ? "Confirmado"
                                : "Pendiente"}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1">
                            <span className="font-semibold text-slate-700 dark:text-slate-200">
                              {service?.name || "Servicio"}
                            </span>
                            <span>•</span>
                            <span className="font-bold text-primary">
                              {formatGs(service?.price ?? 80000)}
                            </span>
                            {assignedStaff && (
                              <>
                                <span>•</span>
                                <span className="inline-flex items-center gap-1 text-[11px] text-slate-500">
                                  <Scissors className="h-3 w-3 text-slate-400" />
                                  {assignedStaff.name}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right: Time badge + Action buttons */}
                      <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0">
                        <div className="text-right">
                          <span className="block font-black text-xs text-slate-900 dark:text-white">
                            {timeFormatted}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {dateFormatted}
                          </span>
                        </div>

                        {/* WhatsApp reminder button */}
                        <a
                          href={waUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500 hover:text-white transition"
                          title="Enviar recordatorio por WhatsApp"
                        >
                          <MessageSquare className="h-3.5 w-3.5" />
                        </a>

                        {/* Cobrar en caja button */}
                        {item.status !== "completed" && (
                          <button
                            type="button"
                            onClick={() => handleCompleteAndPay(item)}
                            className="inline-flex items-center gap-1 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90 px-3 py-1.5 text-xs font-bold transition shadow-xs"
                            title="Marcar como atendido y registrar ingreso en caja"
                          >
                            <Banknote className="h-3.5 w-3.5 text-emerald-400" />
                            <span>Cobrar</span>
                          </button>
                        )}

                        {/* Ficha técnica shortcut */}
                        <Link
                          href={`/dashboard/clientes?cliente=${encodeURIComponent(item.clientName)}`}
                          className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition"
                          title="Ver Ficha Técnica y Galería"
                        >
                          <User className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}

            <div className="border-t border-slate-100 dark:border-white/10 pt-3 mt-2 flex items-center justify-between text-xs">
              <Link
                href="/dashboard/calendario"
                className="font-bold text-primary hover:underline flex items-center gap-1"
              >
                <span>Ver calendario completo</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <span className="text-slate-400 text-[11px]">
                Actualización bidireccional en tiempo real
              </span>
            </div>
          </Card>
        </div>

        {/* Right Column (1/3 width): Live CRM Inbox & Quick Operations */}
        <div className="space-y-4">
          {/* CRM Quick Inbox Card */}
          <Card>
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <MessagesSquare className="h-4 w-4 text-violet-500" />
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                  Atención CRM Omnicanal
                </h3>
              </div>
              <Link
                href="/dashboard/crm"
                className="text-xs font-bold text-primary hover:underline"
              >
                Abrir CRM
              </Link>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              Mensajes entrantes de WhatsApp, Instagram Direct y Facebook Messenger.
            </p>

            <div className="mt-3 space-y-2">
              {crmConversations.slice(0, 3).map((conv) => {
                const lastMsg = conv.messages[conv.messages.length - 1];
                return (
                  <Link
                    key={conv.id}
                    href="/dashboard/crm"
                    className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-100/70 transition"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="relative">
                        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-500/10 text-violet-600 font-bold text-xs">
                          {conv.clientName.slice(0, 2).toUpperCase()}
                        </div>
                        <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 border border-white dark:border-slate-900" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 dark:text-white text-xs truncate">
                          {conv.clientName}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                          {lastMsg?.text || "Consulta sobre turnos"}
                        </p>
                      </div>
                    </div>

                    <span className="text-[10px] font-bold text-primary uppercase shrink-0">
                      {conv.channel}
                    </span>
                  </Link>
                );
              })}
            </div>
          </Card>

          {/* Quick Operations Deck */}
          <Card className="space-y-3">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm border-b border-slate-100 dark:border-white/10 pb-2">
              Acciones Frecuentes
            </h3>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <Link
                href="/dashboard/bloquear-horario"
                className="flex flex-col items-center justify-center p-3 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-slate-50/50 dark:bg-slate-800/30 hover:bg-slate-100 dark:hover:bg-slate-800 transition text-center gap-1.5"
              >
                <Ban className="h-4 w-4 text-red-500" />
                <span className="font-bold text-slate-800 dark:text-slate-200">Bloquear Horario</span>
                <span className="text-[10px] text-slate-400">Almuerzos o permisos</span>
              </Link>

              <Link
                href="/dashboard/transferencias"
                className="flex flex-col items-center justify-center p-3 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-slate-50/50 dark:bg-slate-800/30 hover:bg-slate-100 dark:hover:bg-slate-800 transition text-center gap-1.5"
              >
                <Receipt className="h-4 w-4 text-emerald-500" />
                <span className="font-bold text-slate-800 dark:text-slate-200">SIPAP Bancario</span>
                <span className="text-[10px] text-slate-400">Validar comprobantes</span>
              </Link>

              <Link
                href="/dashboard/comisiones"
                className="flex flex-col items-center justify-center p-3 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-slate-50/50 dark:bg-slate-800/30 hover:bg-slate-100 dark:hover:bg-slate-800 transition text-center gap-1.5"
              >
                <Coins className="h-4 w-4 text-amber-500" />
                <span className="font-bold text-slate-800 dark:text-slate-200">Comisiones</span>
                <span className="text-[10px] text-slate-400">Liquidación equipo</span>
              </Link>

              <Link
                href="/dashboard/apariencia"
                className="flex flex-col items-center justify-center p-3 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-slate-50/50 dark:bg-slate-800/30 hover:bg-slate-100 dark:hover:bg-slate-800 transition text-center gap-1.5"
              >
                <Palette className="h-4 w-4 text-violet-500" />
                <span className="font-bold text-slate-800 dark:text-slate-200">Diseño Web</span>
                <span className="text-[10px] text-slate-400">Colores y tipografías</span>
              </Link>
            </div>
          </Card>

          {/* Active Cloud Integrations Status */}
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-xs space-y-2">
            <div className="flex items-center gap-2 font-bold text-emerald-700 dark:text-emerald-400">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              <span>Infraestructura & Sincronización</span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-300">
              Conexión activa con PostgreSQL, Google Calendar y notificaciones automáticas por WhatsApp para Paraguay.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
