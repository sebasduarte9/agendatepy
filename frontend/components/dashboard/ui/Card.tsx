import type { HTMLAttributes, ReactNode } from "react";

export default function Card({
  children,
  className = "",
  ...props
}: HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900 p-5 shadow-xs transition-all duration-200 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
