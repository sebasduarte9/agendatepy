import { TICKER_ITEMS } from "@/lib/categories";

export default function Ticker() {
  const loop = [...TICKER_ITEMS, ...TICKER_ITEMS];

  return (
    <section className="border-y border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-950 py-3 sm:py-4 transition-colors overflow-hidden">
      <div className="ticker-mask overflow-hidden">
        <div className="ticker-track flex w-max gap-6 sm:gap-10 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300">
          {loop.map((item, index) => (
            <span key={`${item}-${index}`} className="whitespace-nowrap flex items-center gap-4">
              <span>{item}</span>
              <span className="text-slate-300 dark:text-slate-700">·</span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
