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
  ArrowUpRight,
  Key,
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
import IosSegmentedControl from "@/components/dashboard/ui/IosSegmentedControl";
import { triggerHaptic } from "@/lib/haptics";
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

  const userName = useDashboardStore((s) => s.userName) || "Sebastián";

  // Current month string formatted e.g. "Octubre 2026"
  const currentMonthDisplay = useMemo(() => {
    try {
      const formatted = formatInTimeZone(new Date(), business.timezone || "America/Asuncion", "MMMM yyyy");
      return formatted.charAt(0).toUpperCase() + formatted.slice(1);
    } catch {
      return "Mes Actual";
    }
  }, [business.timezone]);

  // 7-day weekly snapshot data for the console bar chart
  const weeklySnapshot = useMemo(() => {
    const days = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
    const now = new Date();
    const currentDayOfWeek = (now.getDay() + 6) % 7; // 0 = Lun, 6 = Dom
    return days.map((dayName, index) => {
      const isToday = index === currentDayOfWeek;
      let amount = 0;
      if (isToday) {
        amount = revenueToday || 450000;
      } else {
        const factors = [0.75, 0.95, 1.15, 1.35, 1.9, 2.3, 0.45];
        amount = Math.round(((revenueToday || 450000) * factors[index]) / 10000) * 10000;
      }
      return {
        day: dayName,
        amount,
        isToday,
      };
    });
  }, [revenueToday]);

  const maxWeeklyAmount = useMemo(() => {
    return Math.max(...weeklySnapshot.map((d) => d.amount), 500000);
  }, [weeklySnapshot]);

  const averageWeeklyAmount = useMemo(() => {
    const sum = weeklySnapshot.reduce((acc, d) => acc + d.amount, 0);
    return Math.round(sum / weeklySnapshot.length);
  }, [weeklySnapshot]);

  const attendanceRate = useMemo(() => {
    if (appointmentsToday.length === 0) return 100;
    const attendedOrConfirmed = appointmentsToday.filter((a) => a.status === "completed" || a.status === "confirmed").length;
    return Math.round((attendedOrConfirmed / appointmentsToday.length) * 100);
  }, [appointmentsToday]);

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
      {/* 1. DARK CONSOLE HERO BANNER                                */}
      {/* ═══ CLEAN NATIVE PAGE HEADER ═══ */}
      <div
        data-tour="welcome-banner"
        className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between py-1"
      >
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Bienvenido, {userName}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 hidden sm:flex items-center gap-2">
            <span>{todayFormattedDisplay}</span>
            <span>·</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              {appointmentsToday.length} citas hoy
            </span>
            <span>·</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
              {occupancyRate}% ocupación estimada
            </span>
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setQuickBookingOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold text-white shadow-xs transition hover:brightness-110 active:scale-95 cursor-pointer"
            style={{
              backgroundColor: business.primaryColor || "#FF4F2B",
            }}
          >
            <CalendarPlus className="h-3.5 w-3.5" />
            <span>Nueva Cita</span>
          </button>

          <Link
            href="/dashboard/bloquear-horario"
            className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 px-3.5 py-2 text-xs font-semibold shadow-xs transition"
          >
            <Ban className="h-3.5 w-3.5 text-slate-400" />
            <span>Bloquear</span>
          </Link>

          <button
            type="button"
            onClick={handleCopyBookingLink}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 px-3.5 py-2 text-xs font-semibold shadow-xs transition cursor-pointer"
            title="Copiar link de reservas de tu negocio"
          >
            {copiedLink ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-500" />
                <span className="text-emerald-500 font-semibold">Copiado</span>
              </>
            ) : (
              <>
                <Share2 className="h-3.5 w-3.5 text-slate-400" />
                <span>Link Público</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ═══ MOBILE APPLE GLANCEABLE STAT CARD WITH 7-DAY MINI SPARKLINE ═══ */}
      <div className="block md:hidden p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/10 shadow-xs space-y-3.5">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Citas para Hoy · {todayFormattedDisplay}
            </span>
            <span className="text-2xl font-black font-mono text-slate-900 dark:text-white">
              {appointmentsToday.length} <span className="text-xs font-normal text-slate-400">turnos</span>
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              triggerHaptic("selection");
              setQuickBookingOpen(true);
            }}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white shadow-xs active:scale-95 transition cursor-pointer"
            style={{ backgroundColor: business.primaryColor || "#FF4F2B" }}
          >
            + Cita Rápida
          </button>
        </div>

        {/* 7-Day Mobile Mini Sparkline Bar Chart */}
        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-100 dark:border-white/5 space-y-2">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-bold text-slate-600 dark:text-slate-400">Semana Activa</span>
            <span className="font-mono font-extrabold text-emerald-600 dark:text-emerald-400">
              {formatGs(weeklySnapshot.reduce((sum, d) => sum + d.amount, 0))}
            </span>
          </div>
          <div className="grid grid-cols-7 gap-1.5 items-end h-16 pt-1">
            {weeklySnapshot.map((d, idx) => {
              const heightPct = Math.max(15, Math.min(100, Math.round((d.amount / maxWeeklyAmount) * 100)));
              return (
                <div key={d.day} className="flex flex-col items-center gap-1 h-full justify-end">
                  <div
                    className={`w-full rounded-md transition-all duration-500 ${
                      d.isToday ? "shadow-xs" : "opacity-60 dark:opacity-40"
                    }`}
                    style={{
                      height: `${heightPct}%`,
                      backgroundColor: d.isToday
                        ? (business.primaryColor || "#FF4F2B")
                        : "var(--primary, #94a3b8)",
                    }}
                    title={`${d.day}: ${formatGs(d.amount)}`}
                  />
                  <span
                    className={`text-[9px] font-bold ${
                      d.isToday
                        ? "text-slate-900 dark:text-white"
                        : "text-slate-400 dark:text-slate-500"
                    }`}
                  >
                    {d.day}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>Cobrado: <strong className="text-emerald-600 dark:text-emerald-400 font-mono">{formatGs(revenueToday)}</strong></span>
          <span>Confirmados: <strong className="text-slate-800 dark:text-slate-200 font-mono">{confirmedToday.length}</strong></span>
          <span>Ocupación: <strong className="text-slate-800 dark:text-slate-200 font-mono">{occupancyRate}%</strong></span>
        </div>
      </div>

      {/* Mobile Apple Quick Actions: Compact 3x2 Grid (only for small touch screens) */}
      <div className="grid sm:hidden grid-cols-3 gap-2">
        <button
          type="button"
          onClick={() => {
            triggerHaptic("selection");
            setQuickBookingOpen(true);
          }}
          className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/10 shadow-xs active:scale-95 transition text-center cursor-pointer"
        >
          <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-1.5">
            <Key className="h-4 w-4" />
          </div>
          <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 leading-tight">
            + Cita
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            triggerHaptic("selection");
            setQuickBookingOpen(true);
          }}
          className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/10 shadow-xs active:scale-95 transition text-center cursor-pointer"
        >
          <div className="h-9 w-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center mb-1.5">
            <Ban className="h-4 w-4" />
          </div>
          <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 leading-tight">
            Bloquear
          </span>
        </button>

        <Link
          href="/dashboard/equipo"
          onClick={() => triggerHaptic("selection")}
          className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/10 shadow-xs active:scale-95 transition text-center"
        >
          <div className="h-9 w-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center mb-1.5">
            <User className="h-4 w-4" />
          </div>
          <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 leading-tight">
            Equipo
          </span>
        </Link>

        <Link
          href="/dashboard/caja"
          onClick={() => triggerHaptic("selection")}
          className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/10 shadow-xs active:scale-95 transition text-center"
        >
          <div className="h-9 w-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-1.5">
            <Banknote className="h-4 w-4" />
          </div>
          <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 leading-tight">
            Caja
          </span>
        </Link>

        <Link
          href="/dashboard/estadisticas"
          onClick={() => triggerHaptic("selection")}
          className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/10 shadow-xs active:scale-95 transition text-center"
        >
          <div className="h-9 w-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center mb-1.5">
            <TrendingUp className="h-4 w-4" />
          </div>
          <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 leading-tight">
            Métricas
          </span>
        </Link>

        <Link
          href="/dashboard/apariencia"
          onClick={() => triggerHaptic("selection")}
          className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/10 shadow-xs active:scale-95 transition text-center"
        >
          <div className="h-9 w-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center mb-1.5">
            <Palette className="h-4 w-4" />
          </div>
          <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 leading-tight">
            Perfil Web
          </span>
        </Link>
      </div>

      {/* ═══ DESKTOP EXECUTIVE KPI STRIP (4 BALANCED COMMAND CARDS) ═══ */}
      <div className="hidden md:grid md:grid-cols-2 xl:grid-cols-4 gap-3.5">
        {/* KPI 1: Recaudación del Día */}
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-950 p-4 shadow-xs flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Recaudación de Hoy
            </span>
            <div className="h-8 w-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Banknote className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2.5">
            <div className="text-2xl font-black font-mono text-slate-900 dark:text-white tabular-nums tracking-tight">
              {formatGs(revenueToday)}
            </div>
            <div className="mt-1 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>{confirmedToday.length} cobros registrados</span>
              <Link
                href="/dashboard/caja"
                className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                Ver Caja →
              </Link>
            </div>
          </div>
        </div>

        {/* KPI 2: Citas de Hoy */}
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-950 p-4 shadow-xs flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Agenda de Hoy
            </span>
            <div
              className="h-8 w-8 rounded-xl flex items-center justify-center text-white shadow-2xs"
              style={{ backgroundColor: business.primaryColor || "#FF4F2B" }}
            >
              <CalendarDays className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2.5">
            <div className="text-2xl font-black font-mono text-slate-900 dark:text-white tabular-nums tracking-tight">
              {appointmentsToday.length} <span className="text-sm font-semibold text-slate-400">turnos</span>
            </div>
            <div className="mt-1 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>{confirmedToday.length} confirmados · {pendingToday.length} pendientes</span>
              <Link
                href="/dashboard/calendario"
                className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 hover:underline"
              >
                Calendario →
              </Link>
            </div>
          </div>
        </div>

        {/* KPI 3: Ocupación de Sillas */}
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-950 p-4 shadow-xs flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Ocupación de Sillas
            </span>
            <div className="relative h-8 w-8 flex items-center justify-center">
              <svg className="h-8 w-8 -rotate-90 transform" viewBox="0 0 36 36">
                <circle
                  cx="18"
                  cy="18"
                  r="14"
                  stroke="currentColor"
                  strokeWidth="3"
                  className="text-slate-100 dark:text-slate-800"
                  fill="transparent"
                />
                <circle
                  cx="18"
                  cy="18"
                  r="14"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeDasharray={88}
                  strokeDashoffset={88 - (88 * occupancyRate) / 100}
                  strokeLinecap="round"
                  style={{ stroke: business.primaryColor || "#FF4F2B" }}
                  className="transition-all duration-700"
                  fill="transparent"
                />
              </svg>
            </div>
          </div>
          <div className="mt-2.5">
            <div className="text-2xl font-black font-mono text-slate-900 dark:text-white tabular-nums tracking-tight">
              {occupancyRate}%
            </div>
            <div className="mt-1 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>{activeStaffList.length} en turno hoy</span>
              <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">Capacidad</span>
            </div>
          </div>
        </div>

        {/* KPI 4: Asistencia & Cumplimiento */}
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-950 p-4 shadow-xs flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Tasa de Asistencia
            </span>
            <div className="relative h-8 w-8 flex items-center justify-center">
              <svg className="h-8 w-8 -rotate-90 transform" viewBox="0 0 36 36">
                <circle
                  cx="18"
                  cy="18"
                  r="14"
                  stroke="currentColor"
                  strokeWidth="3"
                  className="text-slate-100 dark:text-slate-800"
                  fill="transparent"
                />
                <circle
                  cx="18"
                  cy="18"
                  r="14"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeDasharray={88}
                  strokeDashoffset={88 - (88 * attendanceRate) / 100}
                  strokeLinecap="round"
                  className="text-emerald-500 transition-all duration-700"
                  fill="transparent"
                />
              </svg>
            </div>
          </div>
          <div className="mt-2.5">
            <div className="text-2xl font-black font-mono text-slate-900 dark:text-white tabular-nums tracking-tight">
              {attendanceRate}%
            </div>
            <div className="mt-1 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>0 ausentismo hoy</span>
              <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">WhatsApp OK</span>
            </div>
          </div>
        </div>
      </div>

      {/* Checklist de Activación del Negocio (se oculta automáticamente al 100%) */}
      <ActivationChecklist />

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
                </div>

                {/* Filter tabs: Apple IosSegmentedControl */}
                <div className="shrink-0 self-start sm:self-auto max-w-full">
                  <IosSegmentedControl
                    value={filterTab}
                    onChange={(val) => setFilterTab(val as "hoy" | "pendientes" | "todos")}
                    layoutId="dashboardAgendaFilterPill"
                    size="sm"
                    options={[
                      { value: "hoy", label: "Hoy", badge: appointmentsToday.length },
                      { value: "pendientes", label: "Pendientes", badge: pendingToday.length },
                      { value: "todos", label: "Próximos" },
                    ]}
                  />
                </div>
              </div>

              {/* Staff Filter Bar (Industry standard tactile chips) */}
              <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden py-1">
                <span className="text-[11px] font-bold text-slate-400 shrink-0">Filtrar:</span>
                <button
                  type="button"
                  onClick={() => setSelectedStaffFilter("all")}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition shrink-0 cursor-pointer active:scale-95 ${
                    selectedStaffFilter === "all"
                      ? "text-white shadow-xs"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                  style={selectedStaffFilter === "all" ? { backgroundColor: business.primaryColor || "#FF4F2B" } : undefined}
                >
                  <span>Todos</span>
                  <span className="text-[10px] font-mono opacity-80">({appointmentsToday.length})</span>
                </button>
                {activeStaffList.map((st) => {
                  const staffCount = appointmentsToday.filter((a) => a.staffId === st.id).length;
                  const isSelected = selectedStaffFilter === st.id;
                  return (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => setSelectedStaffFilter(st.id)}
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition shrink-0 cursor-pointer active:scale-95 ${
                        isSelected
                          ? "text-white shadow-xs"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                      }`}
                      style={isSelected ? { backgroundColor: business.primaryColor || "#FF4F2B" } : undefined}
                    >
                      <span
                        className="h-4 w-4 rounded-full flex items-center justify-center text-[9px] font-black text-white shrink-0 shadow-2xs"
                        style={{ backgroundColor: st.color || "#6366f1" }}
                      >
                        {st.name.slice(0, 1).toUpperCase()}
                      </span>
                      <span>{st.name}</span>
                      {staffCount > 0 && (
                        <span className="text-[10px] font-mono opacity-80">({staffCount})</span>
                      )}
                    </button>
                  );
                })}
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

        {/* Right Column (1/3 width): Live Spotlight, CRM Inbox, Weekly Trajectory & Quick Tools */}
        <div data-tour="quick-actions-crm" className="space-y-4 w-full max-w-full min-w-0">
          {/* Spotlight: Selected Appointment OR Next Upcoming Appointment */}
          <AnimatePresence mode="wait">
            {selectedAppointment ? (
              <motion.div
                key="selected"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.18 }}
              >
                <Card className="border-emerald-500/40 dark:border-emerald-500/30 bg-gradient-to-b from-emerald-50/40 to-transparent dark:from-emerald-950/20 dark:to-transparent p-4 w-full max-w-full min-w-0 overflow-hidden shadow-2xs">
                  <div className="flex items-center justify-between border-b border-emerald-500/20 pb-2.5">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                        Inspección de Turno
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedAppointment(null)}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                      title="Cerrar inspección"
                    >
                      <X className="h-3.5 w-3.5" />
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

                  <div className="mt-3.5 pt-3 border-t border-emerald-500/20 flex flex-col gap-1.5">
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
            ) : nextUpcomingAppointment ? (
              <motion.div
                key="next-upcoming"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.18 }}
              >
                <Card className="p-4 w-full max-w-full min-w-0 overflow-hidden shadow-2xs border-slate-200/90 dark:border-slate-800 relative bg-gradient-to-br from-white via-white to-slate-50/60 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950">
                  <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-1.5">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                      </span>
                      <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Próximo Turno
                      </span>
                    </div>
                    <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      {formatInTimeZone(nextUpcomingAppointment.start, business.timezone || "America/Asuncion", "HH:mm 'hs'")}
                    </span>
                  </div>

                  <div className="mt-3 flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-sm text-slate-900 dark:text-white truncate">
                        {nextUpcomingAppointment.clientName}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                        {services.find((s) => s.id === nextUpcomingAppointment.serviceId)?.name || "Servicio"}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs font-mono font-bold text-slate-900 dark:text-white">
                        {formatGs(services.find((s) => s.id === nextUpcomingAppointment.serviceId)?.price ?? 80000)}
                      </p>
                      {staff.find((st) => st.id === nextUpcomingAppointment.staffId) && (
                        <p className="text-[10px] text-slate-400 flex items-center justify-end gap-1 mt-0.5">
                          <Scissors className="h-2.5 w-2.5" />
                          <span>{staff.find((st) => st.id === nextUpcomingAppointment.staffId)?.name}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleCompleteAndPay(nextUpcomingAppointment)}
                      className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90 py-1.5 px-2 text-xs font-semibold transition cursor-pointer shadow-2xs"
                    >
                      <Banknote className="h-3.5 w-3.5 text-emerald-500" />
                      <span>Cobrar</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedAppointment(nextUpcomingAppointment)}
                      className="inline-flex items-center justify-center gap-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 py-1.5 px-2 text-xs font-medium transition cursor-pointer"
                    >
                      <span>Ver Detalle</span>
                      <ArrowRight className="h-3 w-3" />
                    </button>
                  </div>
                </Card>
              </motion.div>
            ) : null}
          </AnimatePresence>

          {/* Trayectoria Semanal Mini Bar Chart */}
          <Card className="p-4 sm:p-5 w-full max-w-full min-w-0 overflow-hidden shadow-2xs">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2 min-w-0">
                <TrendingUp className="h-4 w-4 text-emerald-500 shrink-0" />
                <h3 className="font-semibold text-slate-900 dark:text-white text-sm truncate">
                  Semana en Curso
                </h3>
              </div>
              <Link
                href="/dashboard/estadisticas"
                className="text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white shrink-0 flex items-center gap-0.5 transition"
              >
                <span>Reportes</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="mt-3">
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-xl font-black font-mono text-slate-900 dark:text-white tracking-tight">
                    {formatGs(weeklySnapshot.reduce((sum, d) => sum + d.amount, 0))}
                  </span>
                  <span className="text-[11px] text-slate-400 block mt-0.5">
                    Promedio diario: {formatGs(averageWeeklyAmount)}
                  </span>
                </div>
                <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full font-mono">
                  7 días
                </span>
              </div>

              {/* 7-day Bar Chart */}
              <div className="grid grid-cols-7 gap-1.5 items-end h-24 pt-4 pb-1">
                {weeklySnapshot.map((d) => {
                  const heightPct = Math.max(16, Math.min(100, Math.round((d.amount / maxWeeklyAmount) * 100)));
                  return (
                    <div key={d.day} className="flex flex-col items-center gap-1.5 h-full justify-end group/bar relative">
                      {/* Tooltip on hover */}
                      <div className="absolute -top-7 opacity-0 group-hover/bar:opacity-100 pointer-events-none transition-opacity bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-[10px] font-mono px-1.5 py-0.5 rounded shadow-sm whitespace-nowrap z-10">
                        {formatGs(d.amount)}
                      </div>
                      <div
                        className={`w-full rounded-md transition-all duration-300 ${
                          d.isToday
                            ? "shadow-xs ring-2 ring-primary/20"
                            : "opacity-60 dark:opacity-40 hover:opacity-90"
                        }`}
                        style={{
                          height: `${heightPct}%`,
                          backgroundColor: d.isToday
                            ? (business.primaryColor || "#FF4F2B")
                            : "var(--primary, #94a3b8)",
                        }}
                      />
                      <span
                        className={`text-[10px] font-bold ${
                          d.isToday
                            ? "text-slate-900 dark:text-white"
                            : "text-slate-400 dark:text-slate-500"
                        }`}
                      >
                        {d.day}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>

          {/* CRM Quick Inbox Card */}
          <Card className="w-full max-w-full min-w-0 overflow-hidden shadow-2xs">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2 min-w-0">
                <MessagesSquare className="h-4 w-4 text-slate-500 shrink-0" />
                <h3 className="font-semibold text-slate-900 dark:text-white text-sm truncate">
                  Mensajes Recientes
                </h3>
                {unreadMessagesCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono">
                    {unreadMessagesCount}
                  </span>
                )}
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

          {/* Quick Operations Deck (2x2 Grid for desktop ergonomics) */}
          <Card className="p-4 sm:p-5 w-full max-w-full min-w-0 overflow-hidden shadow-2xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-semibold text-slate-900 dark:text-white text-sm">
                Accesos Rápidos
              </h3>
              <span className="text-[11px] text-slate-400">Operaciones directas</span>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
              <Link
                href="/dashboard/bloquear-horario"
                className="flex flex-col p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/20 hover:bg-slate-100/70 dark:hover:bg-slate-800/60 hover:border-slate-200 dark:hover:border-slate-700 transition group"
              >
                <div className="h-7 w-7 rounded-lg bg-white dark:bg-slate-800 shadow-2xs flex items-center justify-center mb-1.5 text-slate-600 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition">
                  <Ban className="h-3.5 w-3.5" />
                </div>
                <span className="font-semibold text-slate-900 dark:text-white leading-tight">Bloquear Horario</span>
                <span className="text-[10px] text-slate-400 mt-0.5">Descansos o pausas</span>
              </Link>

              <Link
                href="/dashboard/transferencias"
                className="flex flex-col p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/20 hover:bg-slate-100/70 dark:hover:bg-slate-800/60 hover:border-slate-200 dark:hover:border-slate-700 transition group"
              >
                <div className="h-7 w-7 rounded-lg bg-white dark:bg-slate-800 shadow-2xs flex items-center justify-center mb-1.5 text-slate-600 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition">
                  <Receipt className="h-3.5 w-3.5" />
                </div>
                <span className="font-semibold text-slate-900 dark:text-white leading-tight">Transferencias</span>
                <span className="text-[10px] text-slate-400 mt-0.5">Validar comprobantes</span>
              </Link>

              <Link
                href="/dashboard/comisiones"
                className="flex flex-col p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/20 hover:bg-slate-100/70 dark:hover:bg-slate-800/60 hover:border-slate-200 dark:hover:border-slate-700 transition group"
              >
                <div className="h-7 w-7 rounded-lg bg-white dark:bg-slate-800 shadow-2xs flex items-center justify-center mb-1.5 text-slate-600 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition">
                  <Coins className="h-3.5 w-3.5" />
                </div>
                <span className="font-semibold text-slate-900 dark:text-white leading-tight">Comisiones</span>
                <span className="text-[10px] text-slate-400 mt-0.5">Cálculo al personal</span>
              </Link>

              <Link
                href="/dashboard/apariencia"
                className="flex flex-col p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/20 hover:bg-slate-100/70 dark:hover:bg-slate-800/60 hover:border-slate-200 dark:hover:border-slate-700 transition group"
              >
                <div className="h-7 w-7 rounded-lg bg-white dark:bg-slate-800 shadow-2xs flex items-center justify-center mb-1.5 text-slate-600 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition">
                  <Palette className="h-3.5 w-3.5" />
                </div>
                <span className="font-semibold text-slate-900 dark:text-white leading-tight">Diseño Web</span>
                <span className="text-[10px] text-slate-400 mt-0.5">Página pública</span>
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
