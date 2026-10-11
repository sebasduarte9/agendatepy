import React from "react";

interface MarqueeProps {
  className?: string;
  reverse?: boolean;
  pauseOnHover?: boolean;
  children: React.ReactNode;
  vertical?: boolean;
  repeat?: number;
  gap?: string;
  duration?: string;
  [key: string]: any;
}

export default function Marquee({
  className = "",
  reverse = false,
  pauseOnHover = false,
  children,
  vertical = false,
  repeat = 4,
  gap = "0.5rem",
  duration = "32s",
  ...props
}: MarqueeProps) {
  const animationClass = vertical
    ? reverse
      ? "animate-marquee-vertical-reverse flex-col"
      : "animate-marquee-vertical flex-col"
    : reverse
    ? "animate-marquee-right flex-row"
    : "animate-marquee-left flex-row";

  return (
    <div
      {...props}
      style={
        {
          "--duration": duration,
          "--gap": gap,
          gap: gap,
        } as React.CSSProperties
      }
      className={`group flex overflow-hidden select-none ${
        vertical ? "flex-col" : "flex-row"
      } ${className}`}
    >
      {Array(repeat)
        .fill(0)
        .map((_, i) => (
          <div
            key={i}
            aria-hidden={i > 0 ? "true" : undefined}
            style={{ gap: gap }}
            className={`flex shrink-0 items-center justify-around ${animationClass} ${
              pauseOnHover ? "group-hover:[animation-play-state:paused]" : ""
            }`}
          >
            {children}
          </div>
        ))}
    </div>
  );
}
