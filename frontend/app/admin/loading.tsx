export default function AdminLoading() {
  return (
    <div className="p-4 md:p-8 space-y-6 animate-pulse" aria-busy="true" aria-label="Cargando">
      <div className="space-y-2">
        <div className="h-6 w-48 rounded-lg bg-slate-200/80" />
        <div className="h-3 w-72 max-w-full rounded bg-slate-200/60" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 rounded-2xl border border-slate-200/80 bg-white shadow-xs" />
        ))}
      </div>
      <div className="h-72 rounded-2xl border border-slate-200/80 bg-white shadow-xs" />
    </div>
  );
}
