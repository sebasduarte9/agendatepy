"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
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
  Share2,
  Copy,
  ExternalLink,
  Check,
  Layers,
  Activity,
  X,
  ChevronRight,
  Phone,
  Sparkles,
  Calendar as CalendarIcon,
} from "lucide-react";
import { formatInTimeZone } from "date-fns-tz";
import { useDashboardStore } from "@/store/useDashboardStore";
import Card from "@/components/dashboard/ui/Card";
import ActivationChecklist from "@/components/dashboard/ActivationChecklist";
import QuickBookingModal from "@/components/dashboard/QuickBookingModal";
import ClientFichaModal from "@/components/dashboard/ClientFichaModal";
import { formatGs, phoneWa } from "@/lib/dashboard-dates";
import type { Appointment, Client } from "@/lib/dashboard-types";

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

  // Filter tabs and view controls
  const [filterTab, setFilterTab] = useState<"hoy" | "pendientes" | "todos">("hoy");
  const [selectedStaffFilter, setSelectedStaffFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"cards" | "timeline">("cards");

  // Inspection Drawer & Modals state
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [quickBookingOpen, setQuickBookingOpen] = useState(false);
  const [selectedClientForFicha, setSelectedClientForFicha] = useState<Client | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Today's civil date in Asunción
  const todayStr = useMemo(() => {
    try {
      return formatInTimeZone(new Date(), business.timezone || "America/Asuncion", "yyyy-MM-dd");
    } catch {
      return "2026-09-25";
    }
  }, [business.timezone]);

  // Formatted civil date string for header banner
  const todayFormattedDisplay = useMemo(() => {
    try {
      const formatted = formatInTimeZone(
        new Date(),
        business.timezone || "America/Asuncion",
        "EEEE d 'de' MMMM"
      );
      return formatted.charAt(0).toUpperCase() + formatted.slice(1);
    } catch {
      return "Hoy";
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

  // Total confirmed & pending
  const confirmedToday = appointmentsToday.filter((a) => a.status === "confirmed" || a.status === "completed");
  const pendingToday = appointmentsToday.filter((a) => a.status === "pending");

  // Next upcoming appointment today
  const nextUpcomingAppointment = useMemo(() => {
    const nowIso = new Date().toISOString();
    const sorted = [...appointmentsToday]
      .filter((a) => a.status !== "completed" && a.status !== "cancelled")
      .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
    
    // Find first appointment starting after or around now, or fallback to first pending/confirmed
    const upcoming = sorted.find((a) => a.start >= nowIso) || sorted[0] || null;
    return upcoming;
  }, [appointmentsToday]);

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

  // Estimated chair occupancy rate today
  const occupancyRate = useMemo(() => {
    const totalMinutesBooked = appointmentsToday.reduce((sum, item) => {
      const s = services.find((sv) => sv.id === item.serviceId);
      return sum + (s?.durationMin ?? 45);
    }, 0);
    const activeStaffCount = staff.filter((s) => s.active).length || 3;
    const availableMinutes = activeStaffCount * 10 * 60; // 10h per day
    return Math.min(100, Math.round((totalMinutesBooked / availableMinutes) * 100));
  }, [appointmentsToday, services, staff]);

  // Filtered list to display in the agenda (with tab filter + staff filter)
  const displayAppointments = useMemo(() => {
    let list: Appointment[] = [];
    if (filterTab === "hoy") {
      list = [...appointmentsToday].sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
    } else if (filterTab === "pendientes") {
      list = appointments.filter((a) => a.status === "pending");
    } else {
      list = appointments.filter((a) => a.status !== "cancelled").slice(0, 10);
    }

    if (selectedStaffFilter !== "all") {
      list = list.filter((a) => a.staffId === selectedStaffFilter);
    }

    return list;
  }, [filterTab, appointmentsToday, appointments, selectedStaffFilter]);

  // Staff members active
  const activeStaffList = useMemo(() => staff.filter((s) => s.active), [staff]);

  // CRM unread count
  const unreadMessagesCount = useMemo(() => {
    return crmConversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0);
  }, [crmConversations]);

  // Complete and charge appointment in Cash
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
      if (selectedAppointment?.id === app.id) {
        setSelectedAppointment((prev) => (prev ? { ...prev, status: "completed" } : null));
      }
    }
  };

  // Copy Public Booking Link
  const handleCopyBookingLink = () => {
    const slug = business.slug || "reservar";
    const url = typeof window !== "undefined" ? `${window.location.origin}/${slug}/reservar` : `https://agendate.py/${slug}/reservar`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    pushToast("success", "¡Enlace de reserva pública copiado al portapapeles!");
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // Quick Open Client Ficha Modal
  const handleOpenClientFicha = (clientName: string, clientPhone?: string) => {
    const matched = clients.find(
      (c) => (clientPhone && c.phone === clientPhone) || c.name.toLowerCase() === clientName.toLowerCase()
    );
    if (matched) {
      setSelectedClientForFicha(matched);
    } else {
      // Create minimal synthetic client object to inspect
      setSelectedClientForFicha({
        id: `client-${Date.now()}`,
        name: clientName,
        phone: clientPhone || "",
        email: "",
        notes: "",
        totalVisits: 1,
        totalSpent: 0,
        lastVisit: todayStr,
        tags: ["Nuevo"],
        loyaltyPoints: 0,
        loyaltyRedeemed: 0,
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="space-y-6 pb-12 sm:pb-8 w-full max-w-full overflow-hidden"
    >
      {/* ========================================================= */}
      {/* 1. TOP COMMAND BAR & LIVE OPERATIONAL HERO                 */}
      {/* ========================================================= */}
      <div
        data-tour="welcome-banner"
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pt-1 pb-1 w-full max-w-full min-w-0"
      >
        <div className="space-y-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
              {business.name || "AgendatePY"}
            </span>
            <span>·</span>
            <span className="truncate">{business.city ? `${business.city}, Paraguay` : (business.address || "Paraguay")}</span>
            <span className="hidden md:inline">·</span>
            <span className="hidden md:inline font-medium text-slate-600 dark:text-slate-400 capitalize">
              {todayFormattedDisplay}
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            Panel de Operaciones
          </h1>
        </div>

        {/* Global Action Dock */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Quick Booking Launcher */}
          <button
            type="button"
            onClick={() => setQuickBookingOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 px-3.5 py-2 text-xs font-semibold shadow-xs transition cursor-pointer"
          >
            <CalendarPlus className="h-4 w-4" />
            <span>+ Nueva Cita</span>
          </button>

          {/* Caja & Arqueo */}
          <Link
            href="/dashboard/caja"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 transition shadow-2xs"
          >
            <Banknote className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span>Caja & Arqueo</span>
          </Link>

          {/* CRM Messages */}
          <Link
            href="/dashboard/crm"
            className="relative inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 transition shadow-2xs"
          >
            <MessagesSquare className="h-4 w-4 text-slate-400" />
            <span>Mensajes</span>
            {unreadMessagesCount > 0 && (
              <span className="rounded-full bg-emerald-600 text-white text-[10px] font-bold px-1.5 py-0.2">
                {unreadMessagesCount}
              </span>
            )}
          </Link>

          {/* Quick Copy Booking Link */}
          <button
            type="button"
            onClick={handleCopyBookingLink}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 px-2.5 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition shadow-2xs cursor-pointer"
            title="Copiar link de reserva de tu negocio"
          >
            {copiedLink ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-600" />
                <span className="text-emerald-600 font-semibold">Copiado</span>
              </>
            ) : (
              <>
                <Share2 className="h-3.5 w-3.5 text-slate-400" />
                <span className="hidden sm:inline">Link Público</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. REAL-TIME OPERATIONAL PULSE BANNER                      */}
      {/* ========================================================= */}
      <div className="rounded-xl border border-slate-200/90 dark:border-slate-800 bg-gradient-to-r from-slate-900 to-slate-800 text-white p-4 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Left: Next Turn Countdown / State */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-10 w-10 rounded-lg bg-white/10 flex items-center justify-center shrink-0 border border-white/10">
              <Clock className="h-5 w-5 text-emerald-400" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400">
                  Pulso del Salón
                </span>
                <span className="h-1 w-1 rounded-full bg-white/40" />
                <span className="text-[11px] text-slate-300">En tiempo real</span>
              </div>
              {nextUpcomingAppointment ? (
                <p className="text-sm font-medium text-white truncate mt-0.5">
                  Próximo turno:{" "}
                  <span className="font-bold underline decoration-emerald-400 underline-offset-2">
                    {nextUpcomingAppointment.clientName}
                  </span>{" "}
                  a las{" "}
                  <span className="font-mono text-emerald-300">
                    {formatInTimeZone(nextUpcomingAppointment.start, business.timezone || "America/Asuncion", "HH:mm 'hs'")}
                  </span>
                  {" · "}
                  <span className="text-slate-300 text-xs">
                    {services.find((s) => s.id === nextUpcomingAppointment.serviceId)?.name || "Servicio"}
                  </span>
                </p>
              ) : (
                <p className="text-sm font-medium text-slate-200 truncate mt-0.5">
                  No hay más turnos en espera para hoy. Agenda disponible para nuevos clientes.
                </p>
              )}
            </div>
          </div>

          {/* Right: Live Chair Occupancy Meter */}
          <div className="flex items-center gap-4 border-t border-white/10 pt-3 md:pt-0 md:border-t-0 shrink-0">
            <div className="space-y-1 text-left md:text-right">
              <div className="text-[11px] text-slate-300 flex items-center md:justify-end gap-1.5">
                <span>Ocupación de sillones:</span>
                <span className="font-bold text-white tabular-nums">{occupancyRate}%</span>
              </div>
              <div className="w-48 sm:w-44 h-2 bg-white/15 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-400 to-teal-300 rounded-full transition-all duration-500"
                  style={{ width: `${occupancyRate}%` }}
                />
              </div>
            </div>

            <Link
              href={`/${business.slug || "barberia"}/reservar`}
              target="_blank"
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold text-white border border-white/15 transition shrink-0"
              title="Ver cómo ve el cliente tu portal de reservas online"
            >
              <span>Ver Web</span>
              <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* Checklist de Activación del Negocio (se oculta automáticamente al 100%) */}
      <ActivationChecklist />

      {/* ========================================================= */}
      {/* 3. ELEVATED LINEAR/STRIPE TELEMETRY KPI CARDS              */}
      {/* ========================================================= */}
      <div data-tour="kpi-cards" className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Revenue Today */}
        <div className="relative group rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 p-4 sm:p-5 transition hover:border-slate-300 dark:hover:border-slate-700 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
            <span>Recaudación de Hoy</span>
            <div className="h-7 w-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Banknote className="h-4 w-4" />
            </div>
          </div>
          {!isInitialSyncDone ? (
            <div className="h-7 w-32 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-lg mt-2" />
          ) : (
            <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-white tabular-nums">
              {formatGs(revenueToday)}
            </p>
          )}
          <div className="mt-2 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800/80">
            <span className="font-medium text-emerald-600 dark:text-emerald-400">
              {confirmedToday.length} turnos cobrados
            </span>
            <span className="text-[11px] text-slate-400 font-mono">Gs · Py</span>
          </div>
        </div>

        {/* Card 2: Appointments Today */}
        <div className="relative group rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 p-4 sm:p-5 transition hover:border-slate-300 dark:hover:border-slate-700 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
            <span>Citas del Día</span>
            <div className="h-7 w-7 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <CalendarDays className="h-4 w-4" />
            </div>
          </div>
          {!isInitialSyncDone ? (
            <div className="h-7 w-24 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-lg mt-2" />
          ) : (
            <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-white tabular-nums">
              {appointmentsToday.length} <span className="text-sm font-normal text-slate-400">turnos</span>
            </p>
          )}
          <div className="mt-2 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800/80">
            <span>{confirmedToday.length} confirmados</span>
            {pendingToday.length > 0 ? (
              <span className="text-amber-600 dark:text-amber-400 font-semibold bg-amber-500/10 px-1.5 py-0.5 rounded text-[11px]">
                {pendingToday.length} pendientes
              </span>
            ) : (
              <span className="text-slate-400 text-[11px]">Al día</span>
            )}
          </div>
        </div>

        {/* Card 3: Chair Occupancy */}
        <div className="relative group rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 p-4 sm:p-5 transition hover:border-slate-300 dark:hover:border-slate-700 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
            <span>Ocupación de Agenda</span>
            <div className="h-7 w-7 rounded-lg bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 flex items-center justify-center">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          {!isInitialSyncDone ? (
            <div className="h-7 w-20 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-lg mt-2" />
          ) : (
            <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-white tabular-nums">
              {occupancyRate}%
            </p>
          )}
          <div className="mt-2 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800/80">
            <span>{activeStaffList.length} colaboradores activos</span>
            <span className="text-emerald-600 dark:text-emerald-400 text-[11px] font-medium">Capacidad</span>
          </div>
        </div>

        {/* Card 4: Total Clients */}
        <div className="relative group rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 p-4 sm:p-5 transition hover:border-slate-300 dark:hover:border-slate-700 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
            <span>Clientes Registrados</span>
            <div className="h-7 w-7 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <User className="h-4 w-4" />
            </div>
          </div>
          {!isInitialSyncDone ? (
            <div className="h-7 w-20 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-lg mt-2" />
          ) : (
            <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-white tabular-nums">
              {clients.length} <span className="text-sm font-normal text-slate-400">fichas</span>
            </p>
          )}
          <div className="mt-2 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800/80">
            <span className="text-amber-600 dark:text-amber-400 font-medium">
              {clients.filter((c) => c.tags?.includes("VIP")).length} VIP
            </span>
            <span className="text-[11px] text-slate-400">Historial activo</span>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 4. MAIN 2-COLUMN OPERATIONAL GRID                         */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full max-w-full min-w-0">
        {/* Left Column (2/3 width): Today's Agenda Feed */}
        <div data-tour="agenda-operativa" className="lg:col-span-2 space-y-4 w-full max-w-full min-w-0">
          <Card className="w-full max-w-full min-w-0 overflow-hidden shadow-2xs">
            {/* Header with Title and Filtering Controls */}
            <div className="flex flex-col gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="font-semibold text-slate-900 dark:text-slate-100 text-base">
                      Agenda Operativa
                    </h2>
                    <span className="rounded-full px-2 py-0.5 text-[10px] font-mono font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shrink-0">
                      {displayAppointments.length} turnos
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                    Turnos del día, confirmaciones por WhatsApp y cobro en tiempo real.
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
                    Hoy ({appointmentsToday.length})
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

              {/* Staff Filter Bar (Industry standard in Fresha / Boulevard) */}
              <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                <span className="text-[11px] font-medium text-slate-400 shrink-0">Filtrar por:</span>
                <button
                  type="button"
                  onClick={() => setSelectedStaffFilter("all")}
                  className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition shrink-0 cursor-pointer ${
                    selectedStaffFilter === "all"
                      ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-2xs"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  Todos los profesionales
                </button>
                {activeStaffList.map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => setSelectedStaffFilter(st.id)}
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium transition shrink-0 cursor-pointer ${
                      selectedStaffFilter === st.id
                        ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-2xs"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    <Scissors className="h-3 w-3 opacity-70" />
                    <span>{st.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Appointment List / Timeline Feed */}
            {displayAppointments.length === 0 ? (
              <div className="py-14 text-center space-y-3">
                <div className="h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                  <CalendarDays className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    No hay turnos registrados para este filtro.
                  </p>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Los turnos agendados por clientes o cargados manualmente aparecerán aquí al instante.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setQuickBookingOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 px-4 py-2 text-xs font-semibold shadow-xs cursor-pointer"
                >
                  <CalendarPlus className="h-3.5 w-3.5" />
                  <span>Agendar Nuevo Turno Ahora</span>
                </button>
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

                  const isSelected = selectedAppointment?.id === item.id;

                  return (
                    <li
                      key={item.id}
                      onClick={() => setSelectedAppointment(item)}
                      className={`py-3.5 px-3 rounded-xl transition cursor-pointer group min-w-0 w-full ${
                        isSelected
                          ? "bg-slate-100/90 dark:bg-slate-800/80 ring-1 ring-slate-300 dark:ring-slate-700"
                          : "hover:bg-slate-50/80 dark:hover:bg-slate-800/40"
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 min-w-0 w-full">
                        {/* Left: Time Badge + Avatar + Client Details */}
                        <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
                          {/* Chronological Time Badge */}
                          <div className="flex flex-col items-center justify-center h-12 w-14 rounded-lg bg-slate-100 dark:bg-slate-800/90 border border-slate-200/60 dark:border-slate-700/50 shrink-0">
                            <span className="font-bold text-xs text-slate-900 dark:text-white tabular-nums">
                              {timeFormatted.replace(" hs", "")}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {dateFormatted}
                            </span>
                          </div>

                          {/* Client details */}
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="font-semibold text-slate-900 dark:text-slate-100 text-sm truncate max-w-[160px] sm:max-w-none group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                                {item.clientName}
                              </span>

                              {isVip && (
                                <span className="rounded px-1.5 py-0.2 text-[9px] font-mono font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 shrink-0">
                                  VIP
                                </span>
                              )}

                              <span
                                className={`rounded-full px-2 py-0.5 text-[10px] font-medium shrink-0 ${
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

                            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-500 dark:text-slate-400 mt-1">
                              <span className="font-medium text-slate-700 dark:text-slate-300 truncate max-w-[170px] sm:max-w-none">
                                {service?.name || "Servicio"}
                              </span>
                              <span>•</span>
                              <span className="font-mono font-semibold text-slate-900 dark:text-slate-100 shrink-0">
                                {formatGs(service?.price ?? 80000)}
                              </span>
                              {assignedStaff && (
                                <>
                                  <span>•</span>
                                  <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 truncate">
                                    <Scissors className="h-3 w-3 text-slate-400 shrink-0" />
                                    {assignedStaff.name}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Right: Quick Action Buttons */}
                        <div
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center justify-between sm:justify-end gap-2 shrink-0 pt-2 sm:pt-0 border-t border-slate-100 dark:border-slate-800 sm:border-t-0 w-full sm:w-auto"
                        >
                          {/* Direct WhatsApp launcher */}
                          <a
                            href={waUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-500/30 text-xs font-medium transition shrink-0"
                            title="Enviar recordatorio por WhatsApp"
                          >
                            <MessageSquare className="h-3.5 w-3.5 shrink-0" />
                            <span>WhatsApp</span>
                          </a>

                          {/* Ficha Técnica button */}
                          <button
                            type="button"
                            onClick={() => handleOpenClientFicha(item.clientName, item.clientPhone)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition shrink-0 cursor-pointer"
                            title="Ver Ficha Técnica del Cliente"
                          >
                            <User className="h-3.5 w-3.5" />
                          </button>

                          {/* Cobrar en caja button */}
                          {item.status !== "completed" ? (
                            <button
                              type="button"
                              onClick={() => handleCompleteAndPay(item)}
                              className="inline-flex items-center gap-1 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90 px-3 py-1.5 text-xs font-semibold transition shadow-xs shrink-0 cursor-pointer"
                              title="Marcar como atendido y registrar ingreso en caja"
                            >
                              <Banknote className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                              <span>Cobrar</span>
                            </button>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 dark:bg-slate-800 px-2.5 py-1.5 text-xs font-medium text-slate-400">
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                              <span>Pagado</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}

            {/* Card Footer Link */}
            <div className="border-t border-slate-100 dark:border-slate-800 pt-3.5 mt-2 flex items-center justify-between text-xs">
              <span className="text-slate-400">
                Sincronización automática de agenda en vivo
              </span>
              <Link
                href="/dashboard/calendario"
                className="font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white flex items-center gap-1 transition"
              >
                <span>Ver calendario completo</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </Card>
        </div>

        {/* Right Column (1/3 width): Live CRM Inbox, Selected Drawer & Quick Tools */}
        <div data-tour="quick-actions-crm" className="space-y-4 w-full max-w-full min-w-0">
          {/* Quick Inspection Drawer (If an appointment is selected) */}
          <AnimatePresence>
            {selectedAppointment && (
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.18 }}
              >
                <Card className="border-emerald-500/40 dark:border-emerald-500/30 bg-emerald-50/20 dark:bg-emerald-950/10 p-4 w-full max-w-full min-w-0 overflow-hidden shadow-xs">
                  <div className="flex items-center justify-between border-b border-emerald-500/20 pb-2.5">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                        Inspección Rápida
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedAppointment(null)}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="mt-3 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Cliente:</span>
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {selectedAppointment.clientName}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Horario:</span>
                      <span className="font-mono font-medium text-slate-900 dark:text-white">
                        {formatInTimeZone(selectedAppointment.start, business.timezone || "America/Asuncion", "HH:mm 'hs' (dd/MM)")}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Servicio:</span>
                      <span className="font-medium text-slate-900 dark:text-white">
                        {services.find((s) => s.id === selectedAppointment.serviceId)?.name || "Servicio"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Monto:</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                        {formatGs(services.find((s) => s.id === selectedAppointment.serviceId)?.price ?? 80000)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-emerald-500/20 flex flex-col gap-1.5">
                    {selectedAppointment.status !== "completed" && (
                      <button
                        type="button"
                        onClick={() => handleCompleteAndPay(selectedAppointment)}
                        className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 text-xs transition cursor-pointer shadow-2xs"
                      >
                        <Banknote className="h-3.5 w-3.5" />
                        <span>Cobrar en Caja Ahora</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleOpenClientFicha(selectedAppointment.clientName, selectedAppointment.clientPhone)}
                      className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 font-medium py-1.5 text-xs transition cursor-pointer"
                    >
                      <User className="h-3.5 w-3.5" />
                      <span>Ver Ficha Técnica y Fórmulas</span>
                    </button>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* CRM Quick Inbox Card */}
          <Card className="w-full max-w-full min-w-0 overflow-hidden shadow-2xs">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2 min-w-0">
                <MessagesSquare className="h-4 w-4 text-slate-500 shrink-0" />
                <h3 className="font-semibold text-slate-900 dark:text-white text-sm truncate">
                  Mensajes Recientes
                </h3>
              </div>
              <Link
                href="/dashboard/crm"
                className="text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white shrink-0 ml-2"
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
                          <p className="font-semibold text-slate-900 dark:text-white text-xs truncate">
                            {conv.clientName}
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                            {lastMsg?.text || "Consulta sobre turnos"}
                          </p>
                        </div>
                      </div>

                      <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase shrink-0 ml-2 px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-semibold">
                        {conv.channel}
                      </span>
                    </Link>
                  );
                })
              )}
            </div>
          </Card>

          {/* Quick Operations Deck (Preserved 100% of all actions & routes) */}
          <Card className="p-4 sm:p-5 w-full max-w-full min-w-0 overflow-hidden shadow-2xs">
            <h3 className="font-semibold text-slate-900 dark:text-white text-sm pb-3 border-b border-slate-100 dark:border-slate-800">
              Accesos Rápidos
            </h3>

            <div className="mt-3 divide-y divide-slate-100 dark:divide-slate-800/80 text-xs">
              <Link
                href="/dashboard/bloquear-horario"
                className="flex items-center justify-between py-2.5 px-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition group"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="h-7 w-7 rounded-md bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                    <Ban className="h-4 w-4 text-slate-500 group-hover:text-slate-900 dark:group-hover:text-white transition" />
                  </div>
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
                  <div className="h-7 w-7 rounded-md bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                    <Receipt className="h-4 w-4 text-slate-500 group-hover:text-slate-900 dark:group-hover:text-white transition" />
                  </div>
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
                  <div className="h-7 w-7 rounded-md bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                    <Coins className="h-4 w-4 text-slate-500 group-hover:text-slate-900 dark:group-hover:text-white transition" />
                  </div>
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
                  <div className="h-7 w-7 rounded-md bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                    <Palette className="h-4 w-4 text-slate-500 group-hover:text-slate-900 dark:group-hover:text-white transition" />
                  </div>
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

      {/* ========================================================= */}
      {/* 5. MODALS: QUICK BOOKING & CLIENT FICHA                   */}
      {/* ========================================================= */}
      <QuickBookingModal
        open={quickBookingOpen}
        onClose={() => setQuickBookingOpen(false)}
        initialDate={todayStr}
      />

      <ClientFichaModal
        client={selectedClientForFicha}
        onClose={() => setSelectedClientForFicha(null)}
        onOpenEdit={() => {}}
        onOpenQuickBooking={() => {
          setSelectedClientForFicha(null);
          setQuickBookingOpen(true);
        }}
      />
    </motion.div>
  );
}
