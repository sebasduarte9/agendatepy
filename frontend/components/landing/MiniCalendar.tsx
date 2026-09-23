"use client";

type MiniCalendarProps = {
  selected: Date | null;
  onSelect?: (date: Date) => void;
  compact?: boolean;
};

const WEEKDAYS = ["D", "L", "M", "M", "J", "V", "S"];

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
    <div className={compact ? "w-full" : "w-full max-w-xs"}>
      <p className="mb-2 text-center text-xs font-semibold capitalize text-slate-600">
        {monthLabel}
      </p>
      <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-medium text-slate-400">
        {WEEKDAYS.map((day, index) => (
          <span key={`${day}-${index}`}>{day}</span>
        ))}
      </div>
      <div className="mt-1 grid grid-cols-7 gap-1">
        {cells.map((day, index) => {
          if (!day) {
            return <span key={`empty-${index}`} />;
          }

          const date = new Date(year, month, day);
          const isPast = date.setHours(0, 0, 0, 0) < new Date().setHours(0, 0, 0, 0);
          const isSelected =
            selected?.getDate() === day &&
            selected.getMonth() === month &&
            selected.getFullYear() === year;
          const isToday = day === today.getDate();

          return (
            <button
              key={day}
              type="button"
              disabled={isPast || !onSelect}
              onClick={() => onSelect?.(new Date(year, month, day))}
              className={`h-7 rounded-md text-[11px] font-medium transition ${
                isSelected
                  ? "bg-brand text-white shadow-sm"
                  : isToday
                    ? "bg-brand/10 text-brand"
                    : "text-slate-700 hover:bg-slate-100"
              } ${isPast ? "cursor-not-allowed opacity-30" : ""}`}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}
