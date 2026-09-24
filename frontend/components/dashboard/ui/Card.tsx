import type { ReactNode } from "react";

export default function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white/90 dark:bg-slate-900/90 p-5 sm:p-6 shadow-[0_15px_35px_-10px_rgba(15,23,42,0.05)] dark:shadow-[0_20px_45px_-15px_rgba(0,0,0,0.5)] backdrop-blur-xl transition-all duration-300 ${className}`}
    >
      {children}
    </div>
  );
}
