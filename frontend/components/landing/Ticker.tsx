import { TICKER_ITEMS, type TickerItem } from "@/lib/categories";
import {
  Scissors,
  Smile,
  Sparkles,
  Activity,
  Stethoscope,
  Dumbbell,
  PawPrint,
  Wrench,
  type LucideIcon,
} from "lucide-react";

const ICON_MAP: Record<TickerItem["iconKey"], LucideIcon> = {
  scissors: Scissors,
  smile: Smile,
  sparkles: Sparkles,
  activity: Activity,
  stethoscope: Stethoscope,
  dumbbell: Dumbbell,
  paw: PawPrint,
  wrench: Wrench,
};

export default function Ticker() {
  const loop = [...TICKER_ITEMS, ...TICKER_ITEMS];

  return (
    <section className="hidden sm:block border-y border-slate-200/60 dark:border-white/10 bg-white/40 dark:bg-slate-950/40 backdrop-blur-md py-3 sm:py-4 transition-colors overflow-hidden overflow-x-clip max-w-full">
      <div className="ticker-mask overflow-hidden max-w-full">
        <div className="ticker-track flex w-max gap-6 sm:gap-10 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300">
          {loop.map((item, index) => {
            const IconComponent = ICON_MAP[item.iconKey] || Sparkles;
            return (
              <span key={`${item.label}-${index}`} className="whitespace-nowrap flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-brand/10 text-brand dark:text-[#FF6B4A]">
                  <IconComponent className="h-3.5 w-3.5" />
                </span>
                <span>{item.label}</span>
                <span className="text-slate-300 dark:text-slate-700 ml-4">·</span>
              </span>
            );
          })}
        </div>
      </div>
    </section>
  );
}
