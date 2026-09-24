"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Mail, MessageCircle } from "lucide-react";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { formatInTimeZone } from "date-fns-tz";
import { useDashboardStore } from "@/store/useDashboardStore";
import type { Appointment } from "@/lib/dashboard-types";
import { addDaysIso, phoneWa } from "@/lib/dashboard-dates";
import Modal from "./ui/Modal";
import Card from "./ui/Card";

const HOUR_PX = 52;

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
    pushToast,
    timezoneNote,
  } = useDashboardStore();
  const [selected, setSelected] = useState<Appointment | null>(null);

  const filtered = appointments.filter((item) => {
    if (item.status === "cancelled") return false;
    if (selectedStaffId !== "all" && item.staffId !== selectedStaffId) return false;
    return true;
  });

  const label = format(parseISO(`${calendarDate}T12:00:00`), "d 'de' MMMM, yyyy", {
    locale: es,
  });

  return (
    <div className="space-y-4">
      <p className="sr-only">{timezoneNote}</p>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="rounded-xl border border-border dark:border-slate-800 p-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            onClick={() => setCalendarDate(addDaysIso(calendarDate, -1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            className="rounded-xl border border-border dark:border-slate-800 px-3 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            onClick={() => setCalendarDate(formatInTimeZone(new Date(), business.timezone || "America/Asuncion", "yyyy-MM-dd"))}
          >
            Hoy
          </button>
          <button
            type="button"
            className="rounded-xl border border-border dark:border-slate-800 p-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            onClick={() => setCalendarDate(addDaysIso(calendarDate, 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <h1 className="ml-2 text-lg font-bold capitalize text-slate-900 dark:text-slate-100">{label}</h1>
        </div>
        <div className="flex rounded-xl border border-border dark:border-slate-800 p-1 text-sm bg-white dark:bg-slate-900">
          {(["dia", "semana", "mes"] as const).map((view) => (
            <button
              key={view}
              type="button"
              onClick={() => setCalendarView(view)}
              className={`rounded-lg px-3 py-1.5 capitalize transition ${
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

      <div className="staff-filter flex gap-2 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => setSelectedStaffId("all")}
          className={`rounded-2xl border px-3 py-2 text-sm transition ${
            selectedStaffId === "all"
              ? "border-primary bg-primary/10 text-primary font-bold"
              : "border-border dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
          }`}
        >
          Todo el equipo
        </button>
        {staff.map((person) => (
          <button
            key={person.id}
            type="button"
            onClick={() => setSelectedStaffId(person.id)}
            className={`flex items-center gap-2 rounded-2xl border px-3 py-2 text-sm transition ${
              selectedStaffId === person.id
                ? "border-primary bg-primary/10 font-bold text-primary"
                : "border-border dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
            }`}
          >
            <span
              className="flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold text-white shadow-xs"
              style={{ background: person.color }}
            >
              {person.avatar}
            </span>
            <span>{person.name.replace(/^(Dra\.|Dr\.)\s+/i, "").split(" ")[0]}</span>
          </button>
        ))}
      </div>

      {calendarView === "dia" && (
        <DayView
          date={calendarDate}
          timezone={business.timezone}
          appointments={filtered}
          onSelect={setSelected}
        />
      )}
      {calendarView === "semana" && (
        <WeekView
          date={calendarDate}
          timezone={business.timezone}
          appointments={filtered}
          onSelect={setSelected}
        />
      )}
      {calendarView === "mes" && (
        <MonthView
          date={calendarDate}
          timezone={business.timezone}
          appointments={filtered}
          onSelect={setSelected}
        />
      )}

      <Modal
        id="eventModal"
        open={Boolean(selected)}
        title="Detalle del turno"
        onClose={() => setSelected(null)}
      >
        {selected && (
          <div className="space-y-3 text-sm">
            <p>
              <strong className="text-slate-500 dark:text-slate-400">Cliente:</strong>{" "}
              <span className="font-semibold">{selected.clientName}</span>
            </p>
            <p>
              <strong className="text-slate-500 dark:text-slate-400">Horario:</strong>{" "}
              {formatInTimeZone(selected.start, business.timezone, "HH:mm")} –{" "}
              {formatInTimeZone(selected.end, business.timezone, "HH:mm")}
            </p>
            <p>
              <strong className="text-slate-500 dark:text-slate-400">Servicio:</strong>{" "}
              {services.find((s) => s.id === selected.serviceId)?.name}
            </p>
            <p>
              <strong className="text-slate-500 dark:text-slate-400">Profesional:</strong>{" "}
              {staff.find((s) => s.id === selected.staffId)?.name}
            </p>
            <p>
              <strong className="text-slate-500 dark:text-slate-400">Pago:</strong>{" "}
              <span className="capitalize">{selected.paymentMethod}</span>
            </p>
            <p>
              <strong className="text-slate-500 dark:text-slate-400">Estado:</strong>{" "}
              <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 capitalize">
                {selected.status}
              </span>
            </p>
            <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <a
                href={phoneWa(selected.clientPhone)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 transition"
              >
                <MessageCircle className="h-4 w-4" /> WhatsApp
              </a>
              <a
                href={`mailto:${selected.clientEmail}`}
                className="inline-flex items-center gap-1.5 rounded-full border border-border dark:border-slate-700 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <Mail className="h-4 w-4" /> Email
              </a>
              <button
                type="button"
                className="rounded-full bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-700 transition shadow-xs"
                onClick={() => {
                  cancelAppointment(selected.id);
                  pushToast("success", "Turno cancelado");
                  setSelected(null);
                }}
              >
                Cancelar Turno
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function DayView({
  date,
  timezone,
  appointments,
  onSelect,
}: {
  date: string;
  timezone: string;
  appointments: Appointment[];
  onSelect: (item: Appointment) => void;
}) {
  const dayItems = appointments.filter(
    (item) => formatInTimeZone(item.start, timezone, "yyyy-MM-dd") === date,
  );
  const layout = useMemo(() => layoutOverlaps(dayItems, timezone), [dayItems, timezone]);
  const { staff, services } = useDashboardStore();

  return (
    <Card className="day-view overflow-x-auto p-0">
      <div className="relative min-w-[640px]">
        {Array.from({ length: 24 }, (_, hour) => (
          <div
            key={hour}
            className="flex border-b border-slate-100 dark:border-slate-800"
            style={{ height: HOUR_PX }}
          >
            <span className="w-16 shrink-0 px-2 py-1 text-xs text-slate-400 dark:text-slate-500">
              {String(hour).padStart(2, "0")}:00
            </span>
            <div className="flex-1" />
          </div>
        ))}
        {layout.map((item) => {
          const startH = Number(formatInTimeZone(item.start, timezone, "H"));
          const startM = Number(formatInTimeZone(item.start, timezone, "m"));
          const endH = Number(formatInTimeZone(item.end, timezone, "H"));
          const endM = Number(formatInTimeZone(item.end, timezone, "m"));
          const top = ((startH * 60 + startM) / 60) * HOUR_PX;
          const height = Math.max(
            28,
            (((endH * 60 + endM) - (startH * 60 + startM)) / 60) * HOUR_PX,
          );
          const person = staff.find((s) => s.id === item.staffId);
          const service = services.find((s) => s.id === item.serviceId);
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelect(item)}
              className="absolute overflow-hidden rounded-lg px-2.5 py-1 text-left text-xs text-white shadow-md hover:brightness-110 transition"
              style={{
                top,
                height,
                left: `calc(4.5rem + ${item.col * 30}%)`,
                width: `${Math.max(20, 30)}%`,
                background: person?.color ?? "#6366f1",
              }}
            >
              <strong className="block truncate">{item.clientName}</strong>
              <p className="truncate opacity-90">
                {formatInTimeZone(item.start, timezone, "HH:mm")} · {service?.name}
              </p>
            </button>
          );
        })}
      </div>
    </Card>
  );
}

function WeekView({
  date,
  timezone,
  appointments,
  onSelect,
}: {
  date: string;
  timezone: string;
  appointments: Appointment[];
  onSelect: (item: Appointment) => void;
}) {
  const start = parseISO(`${date}T12:00:00`);
  const days = Array.from({ length: 7 }, (_, i) => addDaysIso(date, i - start.getDay()));

  return (
    <div className="grid grid-cols-1 gap-3 overflow-x-auto md:grid-cols-7">
      {days.map((day) => {
        const items = appointments.filter(
          (item) => formatInTimeZone(item.start, timezone, "yyyy-MM-dd") === day,
        );
        return (
          <Card key={day} className="min-w-[140px] p-3">
            <p className="text-xs font-semibold capitalize text-slate-500 dark:text-slate-400">
              {format(parseISO(`${day}T12:00:00`), "EEE d", { locale: es })}
            </p>
            <div className="mt-2 space-y-1.5">
              {items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelect(item)}
                  className="w-full rounded-lg bg-primary/10 border border-primary/20 p-1.5 text-left text-[11px] text-primary hover:bg-primary/20 transition truncate block"
                >
                  <span className="font-bold">{formatInTimeZone(item.start, timezone, "HH:mm")}</span>{" "}
                  {item.clientName}
                </button>
              ))}
            </div>
          </Card>
        );
      })}
    </div>
  );
}

function MonthView({
  date,
  timezone,
  appointments,
  onSelect,
}: {
  date: string;
  timezone: string;
  appointments: Appointment[];
  onSelect: (item: Appointment) => void;
}) {
  const parsed = parseISO(`${date}T12:00:00`);
  const year = parsed.getFullYear();
  const month = parsed.getMonth();
  const first = new Date(year, month, 1).getDay();
  const days = new Date(year, month + 1, 0).getDate();
  const cells = [...Array.from({ length: first }, () => null), ...Array.from({ length: days }, (_, i) => i + 1)];

  return (
    <Card className="month-view overflow-x-auto p-3">
      <div className="grid min-w-[720px] grid-cols-7 gap-1 text-center text-xs font-semibold text-slate-400 dark:text-slate-500 pb-2">
        {["D", "L", "M", "M", "J", "V", "S"].map((d, i) => (
          <span key={`${d}-${i}`}>{d}</span>
        ))}
      </div>
      <div className="mt-1 grid min-w-[720px] grid-cols-7 gap-1">
        {cells.map((day, index) => {
          if (!day) return <div key={`e-${index}`} className="min-h-24" />;
          const iso = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const items = appointments.filter(
            (item) => formatInTimeZone(item.start, timezone, "yyyy-MM-dd") === iso,
          );
          const extra = items.length > 3 ? items.length - 3 : 0;
          return (
            <div key={iso} className="min-h-24 rounded-xl border border-slate-100 dark:border-slate-800 p-1.5 text-left bg-slate-50/50 dark:bg-slate-900/50">
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">{day}</p>
              {items.slice(0, 3).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelect(item)}
                  className="mt-1 w-full truncate rounded bg-primary/10 border border-primary/20 px-1 py-0.5 text-[10px] text-primary block text-left"
                >
                  {item.clientName}
                </button>
              ))}
              {extra > 0 && (
                <span className="mt-1 inline-block rounded-full bg-slate-200 dark:bg-slate-800 px-1.5 text-[10px] text-slate-600 dark:text-slate-400">
                  +{extra} más
                </span>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function layoutOverlaps(items: Appointment[], timezone: string) {
  const mapped = items.map((item) => {
    const start =
      Number(formatInTimeZone(item.start, timezone, "H")) * 60 +
      Number(formatInTimeZone(item.start, timezone, "m"));
    const end =
      Number(formatInTimeZone(item.end, timezone, "H")) * 60 +
      Number(formatInTimeZone(item.end, timezone, "m"));
    return { ...item, startMin: start, endMin: end, col: 0, columns: 1 };
  });
  mapped.sort((a, b) => a.startMin - b.startMin);
  mapped.forEach((item, index) => {
    const overlapping = mapped.filter(
      (other, otherIndex) =>
        otherIndex !== index && other.startMin < item.endMin && other.endMin > item.startMin,
    );
    item.columns = overlapping.length + 1;
    const used = overlapping.map((other) => other.col);
    let col = 0;
    while (used.includes(col)) col += 1;
    item.col = col;
  });
  return mapped;
}
