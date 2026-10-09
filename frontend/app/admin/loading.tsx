export default function AdminLoading() {
  return (
    <div className="p-4 md:p-8 space-y-6 animate-pulse" aria-busy="true" aria-label="Cargando">
      <div className="space-y-2">
        <div className="h-6 w-48 rounded-lg bg-slate-800/70" />
        <div className="h-3 w-72 max-w-full rounded bg-slate-800/50" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 rounded-xl border border-slate-800/80 bg-slate-900/60" />
        ))}
      </div>
      <div className="h-72 rounded-xl border border-slate-800/80 bg-slate-900/60" />
    </div>
  );
}
