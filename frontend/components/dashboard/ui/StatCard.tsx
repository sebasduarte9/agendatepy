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
    <Card className="flex items-start justify-between gap-3">
      <div>
        <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
        <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100">{value}</p>
        {hint && <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">{hint}</p>}
        {delta !== undefined && (
          <p className={`mt-2 text-xs font-semibold ${positive ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
            {positive ? "+" : ""}
            {delta}% vs periodo anterior
          </p>
        )}
      </div>
      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Icon className="h-5 w-5" />
      </span>
    </Card>
  );
}
