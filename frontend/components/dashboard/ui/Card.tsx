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
      className={`rounded-[20px] border border-border dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)] dark:shadow-[0_10px_30px_rgba(0,0,0,0.3)] transition-colors ${className}`}
    >
      {children}
    </div>
  );
}
