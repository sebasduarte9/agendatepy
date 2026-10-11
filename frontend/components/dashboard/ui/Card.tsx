import type { HTMLAttributes, ReactNode } from "react";

export default function Card({
  children,
  className = "",
  variant = "glass",
  ...props
}: HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  className?: string;
  variant?: "glass" | "subtle" | "plain";
}) {
  const variantClass =
    variant === "subtle"
      ? "glass-panel-subtle"
      : "glass-panel";

  return (
    <div
      className={`rounded-2xl p-5 ${variantClass} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
