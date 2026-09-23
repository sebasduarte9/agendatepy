import { TICKER_ITEMS } from "@/lib/categories";

export default function Ticker() {
  const loop = [...TICKER_ITEMS, ...TICKER_ITEMS];

  return (
    <section className="border-y border-slate-200 bg-white py-4">
      <div className="ticker-mask overflow-hidden">
        <div className="ticker-track flex w-max gap-10 text-sm font-semibold text-slate-600">
          {loop.map((item, index) => (
            <span key={`${item}-${index}`} className="whitespace-nowrap">
              {item} ·
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
