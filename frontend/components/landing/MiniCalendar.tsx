"use client";

import React from "react";
import { Calendar as CalendarIcon } from "lucide-react";

type MiniCalendarProps = {
  selected: Date | null;
  onSelect?: (date: Date) => void;
  compact?: boolean;
};

const WEEKDAYS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

export default function MiniCalendar({
  selected,
  onSelect,
  compact = false,
}: MiniCalendarProps) {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthLabel = today.toLocaleDateString("es-PY", {
    month: "long",
    year: "numeric",
  });

  const cells = [
    ...Array.from({ length: firstDay }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <div className={compact ? "w-full" : "w-full max-w-sm"}>
      {/* Cabecera del Mes */}
      <div className="mb-3 flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-4 w-4 text-[#FF4F2B]" />
          <p className="text-xs sm:text-sm font-bold capitalize text-slate-800 dark:text-slate-100">
            {monthLabel}
          </p>
        </div>
        <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
          Días disponibles
        </span>
      </div>

      {/* Días de la semana */}
      <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-slate-400 dark:text-slate-500 pb-1">
        {WEEKDAYS.map((day, index) => (
          <span key={`${day}-${index}`}>{day}</span>
        ))}
      </div>

      {/* Rejilla de días */}
      <div className="mt-1 grid grid-cols-7 gap-1">
        {cells.map((day, index) => {
          if (!day) {
            return <span key={`empty-${index}`} className="h-8" />;
          }

          const cellDate = new Date(year, month, day);
          const isPast =
            cellDate.setHours(0, 0, 0, 0) < new Date().setHours(0, 0, 0, 0);
          const isSelected =
            selected !== null &&
            selected.getDate() === day &&
            selected.getMonth() === month &&
            selected.getFullYear() === year;
          const isToday = day === today.getDate();

          return (
            <button
              key={day}
              type="button"
              disabled={isPast || !onSelect}
              onClick={() => onSelect?.(new Date(year, month, day))}
              className={`h-8 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center justify-center ${
                isSelected
                  ? "bg-[#FF4F2B] text-white shadow-md shadow-[#FF4F2B]/30 font-bold scale-105"
                  : isToday
                    ? "bg-[#FF4F2B]/10 dark:bg-[#FF4F2B]/20 text-[#FF4F2B] font-bold border border-[#FF4F2B]/30"
                    : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              } ${isPast ? "cursor-not-allowed opacity-25 dark:opacity-20 line-through" : ""}`}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}
