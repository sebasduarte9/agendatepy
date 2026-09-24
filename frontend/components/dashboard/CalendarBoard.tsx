"use client";

import { useMemo, useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
  Clock,
  User,
  Scissors,
  MessageCircle,
  Mail,
  CheckCircle2,
  AlertCircle,
  X,
  Phone,
  Trash2,
  CalendarDays,
} from "lucide-react";
import { format, parseISO, addMinutes, setHours, setMinutes } from "date-fns";
import { es } from "date-fns/locale";
import { formatInTimeZone } from "date-fns-tz";
import { useDashboardStore } from "@/store/useDashboardStore";
import type { Appointment, PaymentMethod, AppointmentStatus } from "@/lib/dashboard-types";
import { addDaysIso, phoneWa, formatGs } from "@/lib/dashboard-dates";
import Modal from "./ui/Modal";
import Card from "./ui/Card";

const START_HOUR = 8;
const END_HOUR = 20;
const HOUR_PX = 56;

export default function CalendarBoard() {
  const {
    appointments,
    staff,
    services,
    business,
    calendarDate,
    calendarView,
    selectedStaffId,
    setCalendarDate,
    setCalendarView,
    setSelectedStaffId,
    cancelAppointment,
    updateAppointment,
    addAppointment,
    currentUserRole,
    currentStaffId,
    pushToast,
    timezoneNote,
  } = useDashboardStore();

  // If user is a professional (barbero / estilista), enforce viewing their own agenda
  useEffect(() => {
    if (
      (currentUserRole === "barbero" || currentUserRole === "estilista") &&
      currentStaffId &&
      selectedStaffId !== currentStaffId
    ) {
      setSelectedStaffId(currentStaffId);
    }
  }, [currentUserRole, currentStaffId, selectedStaffId, setSelectedStaffId]);

  // Selected appointment for Editing / Rescheduling modal
  const [selectedApp, setSelectedApp] = useState<Appointment | null>(null);

  // Quick New Appointment modal state
  const [newModalOpen, setNewModalOpen] = useState(false);
  const [newSlotData, setNewSlotData] = useState<{
    date: string;
    time: string;
    staffId: string;
  }>({
    date: calendarDate,
    time: "10:00",
    staffId: staff[0]?.id || "",
  });

  const [newClientName, setNewClientName] = useState("");
  const [newClientPhone, setNewClientPhone] = useState("");
  const [newServiceId, setNewServiceId] = useState(services[0]?.id || "");
  const [newPaymentMethod, setNewPaymentMethod] = useState<PaymentMethod>("efectivo");

  // Filtered appointments
  const filtered = appointments.filter((item) => {
    if (item.status === "cancelled") return false;
    if (selectedStaffId !== "all" && item.staffId !== selectedStaffId) return false;
    return true;
  });

  const label = format(parseISO(`${calendarDate}T12:00:00`), "EEEE d 'de' MMMM, yyyy", {
    locale: es,
  });

  // Open Quick Booking modal pre-filling slot
  function handleEmptySlotClick(dateStr: string, hour: number, staffId: string) {
    const timeStr = `${String(hour).padStart(2, "0")}:00`;
    setNewSlotData({
      date: dateStr,
      time: timeStr,
      staffId: staffId || staff[0]?.id || "",
    });
    setNewClientName("");
    setNewClientPhone("");
    setNewServiceId(services[0]?.id || "");
    setNewModalOpen(true);
  }

  // Handle Quick Create Appointment submit
  function handleCreateAppointment(e: React.FormEvent) {
    e.preventDefault();
    if (!newClientName.trim()) {
      pushToast("error", "Por favor ingresá el nombre del cliente");
      return;
    }

    const service = services.find((s) => s.id === newServiceId) || services[0];
    const duration = service?.durationMin || 45;

    const startDateTime = parseISO(`${newSlotData.date}T${newSlotData.time}:00`);
    const endDateTime = addMinutes(startDateTime, duration);

    const newApp: Appointment = {
      id: `app-${Date.now()}`,
      clientName: newClientName.trim(),
      clientPhone: newClientPhone.trim() || "+595981000000",
      clientEmail: `${newClientName.toLowerCase().replace(/\s+/g, ".")}@gmail.com`,
      serviceId: service.id,
      staffId: newSlotData.staffId || staff[0].id,
      start: startDateTime.toISOString(),
      end: endDateTime.toISOString(),
      paymentMethod: newPaymentMethod,
      status: "confirmed",
    };

    addAppointment(newApp);
    pushToast("success", `Turno agendado con éxito para ${newClientName}`);
    setNewModalOpen(false);
  }

  return (
    <div className="space-y-4">
      <p className="sr-only">{timezoneNote}</p>

      {/* Google Calendar-Style Top Command Toolbar */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between border-b border-slate-200/80 dark:border-white/10 pb-4">
        {/* Left: + Create Button & Date Navigators */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Google-like "+ Crear Cita" Pill Button */}
          <button
            type="button"
            onClick={() => {
              setNewSlotData({
                date: calendarDate,
                time: "10:00",
                staffId: selectedStaffId !== "all" ? selectedStaffId : staff[0]?.id || "",
              });
              setNewModalOpen(true);
            }}
            className="inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-2 text-xs font-bold text-white shadow-md shadow-primary/25 hover:opacity-95 transition"
          >
            <Plus className="h-4 w-4" />
            <span>Crear Cita</span>
          </button>

          {/* Hoy button */}
          <button
            type="button"
            className="rounded-xl border border-slate-200/80 dark:border-white/10 px-3.5 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            onClick={() =>
              setCalendarDate(
                formatInTimeZone(new Date(), business.timezone || "America/Asuncion", "yyyy-MM-dd")
              )
            }
          >
            Hoy
          </button>

          {/* Navigation Arrows */}
          <div className="flex items-center">
            <button
              type="button"
              className="rounded-xl p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              onClick={() => setCalendarDate(addDaysIso(calendarDate, calendarView === "semana" ? -7 : -1))}
              aria-label="Anterior"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              className="rounded-xl p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              onClick={() => setCalendarDate(addDaysIso(calendarDate, calendarView === "semana" ? 7 : 1))}
              aria-label="Siguiente"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Current Date Label */}
          <h1 className="text-base font-black capitalize text-slate-900 dark:text-white sm:text-lg">
            {label}
          </h1>
        </div>

        {/* Right: View Switcher (Día / Semana / Mes) */}
        <div className="flex items-center gap-2">
          <div className="flex rounded-2xl border border-slate-200/80 dark:border-white/10 p-1 bg-white/80 dark:bg-slate-900/80 shadow-xs">
            {(["dia", "semana", "mes"] as const).map((view) => (
              <button
                key={view}
                type="button"
                onClick={() => setCalendarView(view)}
                className={`rounded-xl px-3.5 py-1.5 text-xs font-bold capitalize transition ${
                  calendarView === view
                    ? "bg-primary text-white shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {view === "dia" ? "Día" : view === "semana" ? "Semana" : "Mes"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Staff Filter Bar with Avatars */}
      {currentUserRole === "admin" || currentUserRole === "cajero" ? (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => setSelectedStaffId("all")}
            className={`rounded-2xl border px-3 py-1.5 text-xs font-bold transition shrink-0 ${
              selectedStaffId === "all"
                ? "border-primary bg-primary/10 text-primary"
                : "border-slate-200/80 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
            }`}
          >
            Todo el equipo ({staff.length})
          </button>
          {staff.map((person) => (
            <button
              key={person.id}
              type="button"
              onClick={() => setSelectedStaffId(person.id)}
              className={`flex items-center gap-2 rounded-2xl border px-3 py-1.5 text-xs transition shrink-0 ${
                selectedStaffId === person.id
                  ? "border-primary bg-primary/10 font-bold text-primary"
                  : "border-slate-200/80 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
            >
              <span
                className="flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-bold text-white shadow-xs"
                style={{ background: person.color }}
              >
                {person.avatar}
              </span>
              <span>{person.name.split(" ")[0]}</span>
            </button>
          ))}
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <span className="rounded-xl bg-primary/10 text-primary font-bold px-3 py-1 text-xs">
            Vista individual: {staff.find((s) => s.id === currentStaffId)?.name || "Mi Agenda"}
          </span>
        </div>
      )}

      {/* Main Calendar View Displays */}
      {calendarView === "dia" && (
        <GoogleCalendarDayView
          date={calendarDate}
          timezone={business.timezone}
          appointments={filtered}
          staffList={selectedStaffId === "all" ? staff : staff.filter((s) => s.id === selectedStaffId)}
          onSelectAppointment={setSelectedApp}
          onEmptySlotClick={handleEmptySlotClick}
        />
      )}

      {calendarView === "semana" && (
        <GoogleCalendarWeekView
          date={calendarDate}
          timezone={business.timezone}
          appointments={filtered}
          onSelectAppointment={setSelectedApp}
          onEmptySlotClick={handleEmptySlotClick}
        />
      )}

      {calendarView === "mes" && (
        <GoogleCalendarMonthView
          date={calendarDate}
          timezone={business.timezone}
          appointments={filtered}
          onSelectAppointment={setSelectedApp}
        />
      )}

      {/* Rich Reschedule & Edit Appointment Modal */}
      {selectedApp && (
        <RescheduleEditModal
          appointment={selectedApp}
          staff={staff}
          services={services}
          timezone={business.timezone}
          businessName={business.name}
          onClose={() => setSelectedApp(null)}
          onUpdate={(patch) => {
            updateAppointment(selectedApp.id, patch);
            setSelectedApp(null);
            pushToast("success", "Cita reprogramada y actualizada correctamente");
          }}
          onCancel={() => {
            cancelAppointment(selectedApp.id);
            setSelectedApp(null);
            pushToast("success", "Cita cancelada");
          }}
        />
      )}

      {/* Quick Booking Modal */}
      <Modal
        id="quickBookingModal"
        open={newModalOpen}
        title="Agendar Nueva Cita Rápida"
        onClose={() => setNewModalOpen(false)}
      >
        <form onSubmit={handleCreateAppointment} className="space-y-4 text-xs">
          <div className="rounded-2xl bg-primary/5 border border-primary/20 p-3 space-y-1">
            <span className="font-bold text-primary block">Horario seleccionado en Google Calendar:</span>
            <p className="text-slate-700 dark:text-slate-300">
              📅 Fecha: <strong className="text-slate-900 dark:text-white">{newSlotData.date}</strong> a las{" "}
              <strong className="text-slate-900 dark:text-white">{newSlotData.time} hs</strong>
            </p>
          </div>

          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Nombre del Cliente *
            </label>
            <input
              type="text"
              required
              placeholder="Ej. Rodrigo Giménez"
              value={newClientName}
              onChange={(e) => setNewClientName(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 px-3.5 py-2 text-slate-900 dark:text-white focus:border-primary focus:outline-none"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Teléfono (WhatsApp)
            </label>
            <input
              type="tel"
              placeholder="+595 981 123 456"
              value={newClientPhone}
              onChange={(e) => setNewClientPhone(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 px-3.5 py-2 text-slate-900 dark:text-white focus:border-primary focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Servicio
              </label>
              <select
                value={newServiceId}
                onChange={(e) => setNewServiceId(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 px-3 py-2 text-slate-900 dark:text-white focus:border-primary focus:outline-none"
              >
                {services.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({formatGs(s.price)})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Profesional
              </label>
              <select
                value={newSlotData.staffId}
                onChange={(e) => setNewSlotData({ ...newSlotData, staffId: e.target.value })}
                className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 px-3 py-2 text-slate-900 dark:text-white focus:border-primary focus:outline-none"
              >
                {staff.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Hora de Inicio
              </label>
              <input
                type="time"
                value={newSlotData.time}
                onChange={(e) => setNewSlotData({ ...newSlotData, time: e.target.value })}
                className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 px-3 py-2 text-slate-900 dark:text-white focus:border-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Método de Pago
              </label>
              <select
                value={newPaymentMethod}
                onChange={(e) => setNewPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 px-3 py-2 text-slate-900 dark:text-white focus:border-primary focus:outline-none"
              >
                <option value="efectivo">💵 Efectivo en Local</option>
                <option value="sipap">🏦 Transferencia SIPAP</option>
                <option value="pos_bancard">💳 Tarjeta / POS Bancard</option>
                <option value="billetera_py">📱 Billetera Móvil</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-white/10">
            <button
              type="button"
              onClick={() => setNewModalOpen(false)}
              className="rounded-xl border border-slate-200 dark:border-white/10 px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="rounded-xl bg-primary px-5 py-2 text-xs font-bold text-white shadow-md shadow-primary/25 hover:opacity-95"
            >
              Confirmar Turno
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

// ============================================================================
// Google Calendar Day View (Columns per Staff Member + Red Current Time Bar)
// ============================================================================
function GoogleCalendarDayView({
  date,
  timezone,
  appointments,
  staffList,
  onSelectAppointment,
  onEmptySlotClick,
}: {
  date: string;
  timezone: string;
  appointments: Appointment[];
  staffList: any[];
  onSelectAppointment: (app: Appointment) => void;
  onEmptySlotClick: (dateStr: string, hour: number, staffId: string) => void;
}) {
  const { services } = useDashboardStore();
  const hours = Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => START_HOUR + i);

  // Current time position in minutes
  const now = new Date();
  const currentHours = now.getHours();
  const currentMinutes = now.getMinutes();
  const minutesFromStart = (currentHours - START_HOUR) * 60 + currentMinutes;
  const isToday =
    formatInTimeZone(now, timezone || "America/Asuncion", "yyyy-MM-dd") === date;
  const showRedIndicator = isToday && minutesFromStart >= 0 && minutesFromStart <= (END_HOUR - START_HOUR + 1) * 60;
  const redLineTop = (minutesFromStart / 60) * HOUR_PX;

  return (
    <Card className="p-0 border border-slate-200/80 dark:border-white/10 shadow-sm rounded-3xl bg-white dark:bg-slate-900/90 overflow-hidden">
      {/* Staff Columns Header */}
      <div className="flex border-b border-slate-200/80 dark:border-white/10 bg-slate-50/80 dark:bg-slate-950/60 sticky top-0 z-20">
        <div className="w-16 shrink-0 border-r border-slate-200/80 dark:border-white/10 p-2 text-center text-[10px] font-bold text-slate-400">
          HORA
        </div>
        <div className="flex-1 grid" style={{ gridTemplateColumns: `repeat(${staffList.length}, minmax(180px, 1fr))` }}>
          {staffList.map((person) => (
            <div
              key={person.id}
              className="flex items-center gap-2 p-3 border-r border-slate-200/80 dark:border-white/10 last:border-r-0"
            >
              <span
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white shadow-xs"
                style={{ background: person.color }}
              >
                {person.avatar}
              </span>
              <div className="truncate">
                <p className="font-bold text-xs text-slate-900 dark:text-white truncate">{person.name}</p>
                <p className="text-[10px] text-slate-400 truncate">{person.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Time Grid with Red Live Indicator */}
      <div className="relative overflow-x-auto">
        <div className="relative min-w-[700px]">
          {/* Live Red Time Indicator */}
          {showRedIndicator && (
            <div
              className="absolute left-0 right-0 z-30 flex items-center pointer-events-none transition-all duration-500"
              style={{ top: redLineTop }}
            >
              <div className="w-16 shrink-0 flex items-center justify-end pr-1">
                <span className="rounded-full bg-rose-500 px-1.5 py-0.5 text-[9px] font-bold text-white font-mono shadow-xs">
                  {String(currentHours).padStart(2, "0")}:{String(currentMinutes).padStart(2, "0")}
                </span>
              </div>
              <span className="h-3 w-3 rounded-full bg-rose-500 shadow-sm -ml-1.5 ring-2 ring-white dark:ring-slate-900" />
              <div className="h-0.5 flex-1 bg-rose-500 shadow-xs" />
            </div>
          )}

          {/* Hourly Rows */}
          {hours.map((hour) => (
            <div
              key={hour}
              className="flex border-b border-slate-100 dark:border-white/5 relative"
              style={{ height: HOUR_PX }}
            >
              {/* Hour Label */}
              <div className="w-16 shrink-0 border-r border-slate-100 dark:border-white/10 px-2 pt-1 font-mono text-[11px] font-medium text-slate-400 dark:text-slate-500 text-right">
                {String(hour).padStart(2, "0")}:00
              </div>

              {/* Staff Column Slots for this hour */}
              <div
                className="flex-1 grid"
                style={{ gridTemplateColumns: `repeat(${staffList.length}, minmax(180px, 1fr))` }}
              >
                {staffList.map((person) => (
                  <button
                    key={`${hour}-${person.id}`}
                    type="button"
                    onClick={() => onEmptySlotClick(date, hour, person.id)}
                    className="border-r border-slate-100 dark:border-white/5 last:border-r-0 h-full w-full text-left p-1 group hover:bg-primary/[0.04] transition relative"
                    title={`Click para agendar con ${person.name} a las ${hour}:00`}
                  >
                    <span className="opacity-0 group-hover:opacity-100 text-[10px] text-primary font-bold pl-2">
                      + Agendar
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ))}

          {/* Appointments absolute overlays in respective columns */}
          {staffList.map((person, staffColIndex) => {
            const personApps = appointments.filter(
              (item) =>
                item.staffId === person.id &&
                formatInTimeZone(item.start, timezone, "yyyy-MM-dd") === date
            );

            return personApps.map((item) => {
              const startH = Number(formatInTimeZone(item.start, timezone, "H"));
              const startM = Number(formatInTimeZone(item.start, timezone, "m"));
              const endH = Number(formatInTimeZone(item.end, timezone, "H"));
              const endM = Number(formatInTimeZone(item.end, timezone, "m"));

              const startMinutes = (startH - START_HOUR) * 60 + startM;
              const durationMinutes = Math.max(30, (endH * 60 + endM) - (startH * 60 + startM));

              if (startMinutes < 0 && startMinutes + durationMinutes <= 0) return null;

              const top = Math.max(0, (startMinutes / 60) * HOUR_PX);
              const height = Math.max(36, (durationMinutes / 60) * HOUR_PX - 2);

              const service = services.find((s) => s.id === item.serviceId);
              const colWidthPercent = 100 / staffList.length;
              const leftPercent = staffColIndex * colWidthPercent;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelectAppointment(item)}
                  className="group absolute z-10 overflow-hidden rounded-2xl p-2.5 text-left shadow-sm hover:shadow-md hover:scale-[1.01] transition-all duration-200 border text-slate-900 dark:text-white"
                  style={{
                    top,
                    height,
                    left: `calc(4rem + ${leftPercent}% + 4px)`,
                    width: `calc(${colWidthPercent}% - 8px)`,
                    backgroundColor: `${person.color}15`,
                    borderColor: `${person.color}40`,
                    borderLeftWidth: "4px",
                    borderLeftColor: person.color,
                  }}
                >
                  <div className="flex items-center justify-between gap-1">
                    <strong className="block truncate font-black text-xs text-slate-900 dark:text-white">
                      {item.clientName}
                    </strong>
                    <span className="font-mono text-[10px] font-bold text-slate-500 dark:text-slate-400">
                      {formatInTimeZone(item.start, timezone, "HH:mm")}
                    </span>
                  </div>
                  <p className="truncate text-[11px] font-medium text-slate-600 dark:text-slate-300">
                    {service?.name || "Servicio"} · {formatGs(service?.price || 0)}
                  </p>
                </button>
              );
            });
          })}
        </div>
      </div>
    </Card>
  );
}

// ============================================================================
// Google Calendar Week View (7 Days)
// ============================================================================
function GoogleCalendarWeekView({
  date,
  timezone,
  appointments,
  onSelectAppointment,
  onEmptySlotClick,
}: {
  date: string;
  timezone: string;
  appointments: Appointment[];
  onSelectAppointment: (app: Appointment) => void;
  onEmptySlotClick: (dateStr: string, hour: number, staffId: string) => void;
}) {
  const { staff } = useDashboardStore();
  const start = parseISO(`${date}T12:00:00`);
  const days = Array.from({ length: 7 }, (_, i) => addDaysIso(date, i - start.getDay()));
  const today = formatInTimeZone(new Date(), timezone, "yyyy-MM-dd");

  return (
    <div className="overflow-x-auto pb-2">
      <div className="grid min-w-[850px] grid-cols-7 gap-3">
        {days.map((day) => {
          const isToday = day === today;
          const isSelectedDay = day === date;
          const items = appointments.filter(
            (item) => formatInTimeZone(item.start, timezone, "yyyy-MM-dd") === day
          );

          return (
            <Card
              key={day}
              className={`rounded-3xl border p-3.5 min-h-[480px] flex flex-col transition-all duration-200 ${
                isToday
                  ? "border-primary/60 bg-primary/[0.03] shadow-md ring-1 ring-primary/20"
                  : isSelectedDay
                  ? "border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                  : "border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-slate-900/60"
              }`}
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/10 pb-2.5">
                <p
                  className={`text-xs font-black capitalize ${
                    isToday ? "text-primary" : "text-slate-800 dark:text-slate-200"
                  }`}
                >
                  {format(parseISO(`${day}T12:00:00`), "EEE d", { locale: es })}
                </p>
                <button
                  type="button"
                  onClick={() => onEmptySlotClick(day, 10, staff[0]?.id || "")}
                  className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-600 dark:text-slate-300 hover:bg-primary hover:text-white transition"
                  title="Nueva cita este día"
                >
                  +
                </button>
              </div>

              <div className="mt-3 flex-1 space-y-2 overflow-y-auto">
                {items.length === 0 ? (
                  <p className="pt-8 text-center text-[11px] text-slate-400 italic">
                    Sin citas
                  </p>
                ) : (
                  items.map((item) => {
                    const person = staff.find((s) => s.id === item.staffId);
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => onSelectAppointment(item)}
                        className="w-full rounded-2xl p-2.5 text-left text-xs shadow-2xs hover:shadow-md hover:scale-[1.02] transition-all block border group"
                        style={{
                          backgroundColor: `${person?.color || "#6366f1"}15`,
                          borderColor: `${person?.color || "#6366f1"}35`,
                          borderLeftWidth: "4px",
                          borderLeftColor: person?.color || "#6366f1",
                        }}
                      >
                        <div className="flex items-center justify-between text-[10.5px]">
                          <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                            {formatInTimeZone(item.start, timezone, "HH:mm")}
                          </span>
                          <span className="text-[9px] font-bold uppercase text-slate-500">
                            {item.status}
                          </span>
                        </div>
                        <p className="mt-1 truncate font-black text-slate-900 dark:text-white text-xs">
                          {item.clientName}
                        </p>
                        <p className="truncate text-[10px] text-slate-500">
                          {person?.name.split(" ")[0]}
                        </p>
                      </button>
                    );
                  })
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================================
// Google Calendar Month View
// ============================================================================
function GoogleCalendarMonthView({
  date,
  timezone,
  appointments,
  onSelectAppointment,
}: {
  date: string;
  timezone: string;
  appointments: Appointment[];
  onSelectAppointment: (app: Appointment) => void;
}) {
  const parsed = parseISO(`${date}T12:00:00`);
  const year = parsed.getFullYear();
  const month = parsed.getMonth();
  const first = new Date(year, month, 1).getDay();
  const days = new Date(year, month + 1, 0).getDate();
  const cells = [
    ...Array.from({ length: first }, () => null),
    ...Array.from({ length: days }, (_, i) => i + 1),
  ];

  return (
    <Card className="p-3 border border-slate-200/80 dark:border-white/10 rounded-3xl bg-white dark:bg-slate-900/90 shadow-sm overflow-x-auto">
      <div className="grid min-w-[720px] grid-cols-7 gap-1 text-center text-xs font-bold text-slate-400 pb-2 border-b border-slate-100 dark:border-white/10">
        {["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"].map((d) => (
          <span key={d}>{d}</span>
        ))}
      </div>
      <div className="mt-2 grid min-w-[720px] grid-cols-7 gap-1.5">
        {cells.map((day, index) => {
          if (!day) return <div key={`empty-${index}`} className="min-h-24 rounded-2xl bg-slate-50/30 dark:bg-slate-950/20" />;
          const iso = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const items = appointments.filter(
            (item) => formatInTimeZone(item.start, timezone, "yyyy-MM-dd") === iso
          );
          const extra = items.length > 3 ? items.length - 3 : 0;

          return (
            <div
              key={iso}
              className="min-h-24 rounded-2xl border border-slate-100 dark:border-white/5 p-2 text-left bg-slate-50/50 dark:bg-slate-950/40"
            >
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{day}</span>
              <div className="mt-1 space-y-1">
                {items.slice(0, 3).map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onSelectAppointment(item)}
                    className="w-full truncate rounded-lg bg-primary/10 border border-primary/20 px-1.5 py-0.5 text-[10px] font-semibold text-primary block text-left hover:bg-primary/20 transition"
                  >
                    {formatInTimeZone(item.start, timezone, "HH:mm")} {item.clientName}
                  </button>
                ))}
                {extra > 0 && (
                  <span className="block text-center rounded-md bg-slate-200 dark:bg-slate-800 text-[9px] font-bold text-slate-500 py-0.5">
                    +{extra} más
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

// ============================================================================
// Interactive "Editar / Reprogramar Cita" Modal Component
// ============================================================================
function RescheduleEditModal({
  appointment,
  staff,
  services,
  timezone,
  businessName,
  onClose,
  onUpdate,
  onCancel,
}: {
  appointment: Appointment;
  staff: any[];
  services: any[];
  timezone: string;
  businessName: string;
  onClose: () => void;
  onUpdate: (patch: Partial<Appointment>) => void;
  onCancel: () => void;
}) {
  const currentStart = parseISO(appointment.start);
  const currentEnd = parseISO(appointment.end);

  const [date, setDate] = useState(formatInTimeZone(appointment.start, timezone, "yyyy-MM-dd"));
  const [time, setTime] = useState(formatInTimeZone(appointment.start, timezone, "HH:mm"));
  const [staffId, setStaffId] = useState(appointment.staffId);
  const [serviceId, setServiceId] = useState(appointment.serviceId);
  const [status, setStatus] = useState<AppointmentStatus>(appointment.status);

  // Quick 1-tap reschedule helpers
  function addMinutesToAppointment(mins: number) {
    const newStart = addMinutes(parseISO(`${date}T${time}:00`), mins);
    setDate(format(newStart, "yyyy-MM-dd"));
    setTime(format(newStart, "HH:mm"));
  }

  function moveToTomorrow() {
    const nextDay = addDaysIso(date, 1);
    setDate(nextDay);
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const service = services.find((s) => s.id === serviceId) || services[0];
    const duration = service?.durationMin || 45;

    const startDateTime = parseISO(`${date}T${time}:00`);
    const endDateTime = addMinutes(startDateTime, duration);

    onUpdate({
      start: startDateTime.toISOString(),
      end: endDateTime.toISOString(),
      staffId,
      serviceId,
      status,
    });
  }

  // Pre-filled WhatsApp notification message
  const assignedPerson = staff.find((s) => s.id === staffId);
  const assignedService = services.find((s) => s.id === serviceId);
  const waPhone = appointment.clientPhone.replace(/[^0-9]/g, "");
  const waMsg = encodeURIComponent(
    `¡Hola ${appointment.clientName}! 👋 Te confirmamos que tu cita para *${assignedService?.name || "Servicio"}* en *${businessName}* ha sido reprogramada con éxito para el día *${date}* a las *${time} hs* con ${assignedPerson?.name || "nuestro equipo"}. ¡Te esperamos con gusto!`
  );
  const waLink = `https://wa.me/${waPhone}?text=${waMsg}`;

  return (
    <Modal
      id="rescheduleModal"
      open={true}
      title="Editar o Reprogramar Cita"
      onClose={onClose}
    >
      <form onSubmit={handleSave} className="space-y-4 text-xs">
        {/* Client Header Info */}
        <div className="flex items-center justify-between rounded-2xl bg-slate-50 dark:bg-slate-800/80 p-3.5 border border-slate-200/80 dark:border-white/10">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary font-black text-sm">
              {appointment.clientName.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <p className="font-black text-sm text-slate-900 dark:text-white">
                {appointment.clientName}
              </p>
              <p className="text-[11px] text-slate-500">{appointment.clientPhone}</p>
            </div>
          </div>

          <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 capitalize">
            {status}
          </span>
        </div>

        {/* Quick 1-Tap Reschedule Buttons */}
        <div>
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block mb-1.5">
            Reprogramación rápida con 1 toque:
          </span>
          <div className="grid grid-cols-4 gap-2">
            <button
              type="button"
              onClick={() => addMinutesToAppointment(15)}
              className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 py-1.5 text-center font-bold text-slate-700 dark:text-slate-200 hover:border-primary hover:text-primary transition"
            >
              +15 min
            </button>
            <button
              type="button"
              onClick={() => addMinutesToAppointment(30)}
              className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 py-1.5 text-center font-bold text-slate-700 dark:text-slate-200 hover:border-primary hover:text-primary transition"
            >
              +30 min
            </button>
            <button
              type="button"
              onClick={() => addMinutesToAppointment(60)}
              className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 py-1.5 text-center font-bold text-slate-700 dark:text-slate-200 hover:border-primary hover:text-primary transition"
            >
              +1 hora
            </button>
            <button
              type="button"
              onClick={moveToTomorrow}
              className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 py-1.5 text-center font-bold text-slate-700 dark:text-slate-200 hover:border-primary hover:text-primary transition"
            >
              Mañana
            </button>
          </div>
        </div>

        {/* Exact Date & Time Picker */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Nueva Fecha
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 px-3 py-2 text-slate-900 dark:text-white focus:border-primary focus:outline-none"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Hora de Inicio
            </label>
            <input
              type="time"
              required
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 px-3 py-2 text-slate-900 dark:text-white focus:border-primary focus:outline-none"
            />
          </div>
        </div>

        {/* Staff & Service Re-assignment */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Profesional Asignado
            </label>
            <select
              value={staffId}
              onChange={(e) => setStaffId(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 px-3 py-2 text-slate-900 dark:text-white focus:border-primary focus:outline-none"
            >
              {staff.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Servicio
            </label>
            <select
              value={serviceId}
              onChange={(e) => setServiceId(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 px-3 py-2 text-slate-900 dark:text-white focus:border-primary focus:outline-none"
            >
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({formatGs(s.price)})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Status Switcher */}
        <div>
          <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
            Estado de la Cita
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as AppointmentStatus)}
            className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 px-3 py-2 text-slate-900 dark:text-white focus:border-primary focus:outline-none"
          >
            <option value="confirmed">✅ Confirmada</option>
            <option value="completed">🎉 Completada / Atendida</option>
            <option value="pending">⏳ Pendiente de Aprobación</option>
            <option value="cancelled">❌ Cancelada</option>
          </select>
        </div>

        {/* WhatsApp Notification Trigger */}
        <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-3 flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="font-bold text-emerald-700 dark:text-emerald-400 block">
              Avisar al cliente del cambio:
            </span>
            <p className="text-[11px] text-slate-600 dark:text-slate-300">
              Enviá un WhatsApp con el nuevo día y horario ya redactado.
            </p>
          </div>

          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition shrink-0"
          >
            <MessageCircle className="h-4 w-4" />
            <span>WhatsApp</span>
          </a>
        </div>

        {/* Modal Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100 dark:border-white/10">
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center gap-1 text-rose-600 hover:text-rose-700 font-semibold py-2 px-2"
          >
            <Trash2 className="h-4 w-4" />
            <span>Cancelar Cita</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 dark:border-white/10 px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cerrar
            </button>
            <button
              type="submit"
              className="rounded-xl bg-primary px-5 py-2 text-xs font-bold text-white shadow-md shadow-primary/25 hover:opacity-95"
            >
              Guardar Cambios
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
