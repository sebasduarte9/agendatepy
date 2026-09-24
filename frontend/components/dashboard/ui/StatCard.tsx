import type { LucideIcon } from "lucide-react";
import Card from "./Card";

export default function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  delta,
}: {
  label: string;
  value: string;
  hint?: string;
  icon: LucideIcon;
  delta?: number;
}) {
  const positive = (delta ?? 0) >= 0;
  return (
    <Card className="group relative overflow-hidden flex items-start justify-between gap-3 hover:-translate-y-1 hover:border-primary/40 transition-all duration-300">
      <div className="relative z-10">
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{label}</p>
        <p className="mt-1.5 text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
          {value}
        </p>
        {hint && <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">{hint}</p>}
        {delta !== undefined && (
          <div className="mt-2 flex items-center gap-1">
            <span
              className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                positive
                  ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                  : "bg-rose-500/15 text-rose-600 dark:text-rose-400"
              }`}
            >
              {positive ? "+" : ""}
              {delta}%
            </span>
            <span className="text-[11px] text-slate-400">vs periodo anterior</span>
          </div>
        )}
      </div>

      <span className="relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-primary/15 to-primary/5 text-primary dark:text-violet-400 shadow-2xs group-hover:scale-105 transition-transform duration-300">
        <Icon className="h-5 w-5" />
      </span>

      {/* Subtle bottom edge gradient bar */}
      <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-primary/40 via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </Card>
  );
}
