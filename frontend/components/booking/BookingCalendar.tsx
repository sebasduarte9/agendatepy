"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { formatInTimeZone } from "date-fns-tz";

const WEEKDAYS = ["L", "M", "M", "J", "V", "S", "D"];

type BookingCalendarProps = {
  timezone: string;
  selected: string | null;
  maxAdvanceDays: number;
  onSelect: (civilDate: string) => void;
};

export default function BookingCalendar({
  timezone,
  selected,
  maxAdvanceDays,
  onSelect,
}: BookingCalendarProps) {
  const today = formatInTimeZone(new Date(), timezone, "yyyy-MM-dd");
  const lastBookable = addCivilDays(today, maxAdvanceDays);
  const [cursor, setCursor] = useState(() => monthOf(today));

  const cells = useMemo(() => buildCells(cursor.year, cursor.month), [cursor]);
  const label = new Date(Date.UTC(cursor.year, cursor.month, 1)).toLocaleDateString("es-PY", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

  const thisMonth = monthOf(today);
  const lastMonth = monthOf(lastBookable);
  const canGoBack = compareMonth(cursor, thisMonth) > 0;
  const canGoForward = compareMonth(cursor, lastMonth) < 0;

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          aria-label="Mes anterior"
          disabled={!canGoBack}
          onClick={() => setCursor((current) => shiftMonth(current, -1))}
          className="flex h-10 w-10 items-center justify-center rounded-full text-slate-600 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/10 disabled:opacity-30"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <p className="text-sm font-semibold capitalize text-slate-800 dark:text-slate-100">{label}</p>
        <button
          type="button"
          aria-label="Mes siguiente"
          disabled={!canGoForward}
          onClick={() => setCursor((current) => shiftMonth(current, 1))}
          className="flex h-10 w-10 items-center justify-center rounded-full text-slate-600 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/10 disabled:opacity-30"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold text-slate-400 dark:text-slate-500">
        {WEEKDAYS.map((day, index) => (
          <span key={`${day}-${index}`}>{day}</span>
        ))}
      </div>
      <div className="mt-1 grid grid-cols-7 gap-1">
        {cells.map((day, index) => {
          if (!day) return <span key={`empty-${index}`} />;
          const civil = toCivil(cursor.year, cursor.month, day);
          const disabled = civil < today || civil > lastBookable;
          const isSelected = civil === selected;
          const isToday = civil === today;
          return (
            <button
              key={civil}
              type="button"
              disabled={disabled}
              onClick={() => onSelect(civil)}
              className={`h-10 rounded-xl text-sm font-semibold transition ${
                isSelected
                  ? "bg-primary text-white shadow-xs"
                  : isToday
                    ? "bg-primary/10 text-primary font-bold"
                    : "text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              } ${disabled ? "cursor-not-allowed text-slate-300 dark:text-slate-700 hover:bg-transparent dark:hover:bg-transparent" : ""}`}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function buildCells(year: number, month: number): Array<number | null> {
  const firstWeekday = new Date(Date.UTC(year, month, 1)).getUTCDay();
  const mondayOffset = (firstWeekday + 6) % 7;
  const days = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  return [
    ...Array<null>(mondayOffset).fill(null),
    ...Array.from({ length: days }, (_, i) => i + 1),
  ];
}

type MonthCursor = { year: number; month: number };

function monthOf(civilDate: string): MonthCursor {
  const [year, month] = civilDate.split("-").map(Number);
  return { year, month: month - 1 };
}

function shiftMonth(cursor: MonthCursor, delta: number): MonthCursor {
  const date = new Date(Date.UTC(cursor.year, cursor.month + delta, 1));
  return { year: date.getUTCFullYear(), month: date.getUTCMonth() };
}

function compareMonth(a: MonthCursor, b: MonthCursor): number {
  if (a.year !== b.year) return a.year - b.year;
  return a.month - b.month;
}

function toCivil(year: number, month: number, day: number): string {
  const mm = String(month + 1).padStart(2, "0");
  const dd = String(day).padStart(2, "0");
  return `${year}-${mm}-${dd}`;
}

function addCivilDays(civilDate: string, days: number): string {
  const [y, m, d] = civilDate.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d + days));
  return toCivil(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}
