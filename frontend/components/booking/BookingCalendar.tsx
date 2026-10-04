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
    <div className="w-full select-none">
      {/* Month Header and Navigation */}
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          aria-label="Mes anterior"
          disabled={!canGoBack}
          onClick={() => setCursor((current) => shiftMonth(current, -1))}
          className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800/80 text-slate-800 dark:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 disabled:opacity-20 disabled:pointer-events-none transition cursor-pointer"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        <p className="text-base font-bold capitalize text-slate-900 dark:text-white tracking-tight">
          {label}
        </p>

        <button
          type="button"
          aria-label="Mes siguiente"
          disabled={!canGoForward}
          onClick={() => setCursor((current) => shiftMonth(current, 1))}
          className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800/80 text-slate-800 dark:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 disabled:opacity-20 disabled:pointer-events-none transition cursor-pointer"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Weekdays Row */}
      <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider pb-1">
        {WEEKDAYS.map((day, index) => (
          <span key={`${day}-${index}`} className="flex h-7 items-center justify-center">
            {day}
          </span>
        ))}
      </div>

      {/* Day Cells Grid */}
      <div className="mt-1 grid grid-cols-7 gap-1 sm:gap-1.5">
        {cells.map((day, index) => {
          if (!day) return <span key={`empty-${index}`} className="h-11 sm:h-10" />;
          const civil = toCivil(cursor.year, cursor.month, day);
          const disabled = civil < today || civil > lastBookable;
          const isSelected = civil === selected;
          const isToday = civil === today;

          let btnClasses = "h-11 sm:h-10 w-full rounded-xl text-sm font-bold flex items-center justify-center transition-all duration-150";

          if (disabled) {
            btnClasses += " text-slate-400/25 dark:text-slate-700 cursor-not-allowed pointer-events-none bg-transparent";
          } else if (isSelected) {
            btnClasses += " bg-primary text-white font-black shadow-md shadow-primary/30 ring-2 ring-primary ring-offset-2 ring-offset-slate-900 scale-105 cursor-pointer";
          } else if (isToday) {
            btnClasses += " border-2 border-primary/60 text-primary font-black bg-primary/10 hover:bg-primary/20 cursor-pointer active:scale-95";
          } else {
            btnClasses += " text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/90 active:scale-95 cursor-pointer";
          }

          return (
            <button
              key={civil}
              type="button"
              disabled={disabled}
              onClick={() => onSelect(civil)}
              className={btnClasses}
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
