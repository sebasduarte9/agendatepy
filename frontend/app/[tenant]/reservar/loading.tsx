export default function ReservarLoading() {
  return (
    <main className="mx-auto min-h-dvh w-full max-w-md px-4 pt-6">
      <div className="h-3 w-24 animate-pulse rounded-full bg-slate-200" />
      <div className="mt-3 h-8 w-52 animate-pulse rounded-xl bg-slate-200" />
      <div className="mt-6 flex gap-2">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="h-1.5 flex-1 rounded-full bg-slate-200" />
        ))}
      </div>
      <div className="mt-8 space-y-3">
        {Array.from({ length: 3 }, (_, index) => (
          <div key={index} className="h-20 animate-pulse rounded-2xl bg-white" />
        ))}
      </div>
    </main>
  );
}
