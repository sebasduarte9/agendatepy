export default function DashboardLoading() {
  return (
    <div className="w-full space-y-6 animate-pulse">
      {/* Sleek top loading progress bar */}
      <div className="fixed top-0 left-0 right-0 z-50 h-0.5 bg-gradient-to-r from-transparent via-[var(--primary,#FF4F2B)] to-transparent" />

      {/* Hero Stats Skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-24 rounded-2xl bg-slate-100/80 dark:bg-white/[0.04] border border-slate-200/60 dark:border-white/[0.06]"
          />
        ))}
      </div>

      {/* Main Content Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 h-96 rounded-2xl bg-slate-100/80 dark:bg-white/[0.04] border border-slate-200/60 dark:border-white/[0.06]" />
        <div className="h-96 rounded-2xl bg-slate-100/80 dark:bg-white/[0.04] border border-slate-200/60 dark:border-white/[0.06]" />
      </div>
    </div>
  );
}
