"use client";

import { useEffect, useRef } from "react";
import { useInView, animate } from "framer-motion";

export default function NumberTicker({
  value,
  direction = "up",
  delay = 0,
  className = "",
}: {
  value: number;
  direction?: "up" | "down";
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  useEffect(() => {
    if (!isInView || !ref.current) return;
    
    const startValue = direction === "down" ? value : 0;
    const endValue = direction === "down" ? 0 : value;

    const timeout = setTimeout(() => {
      animate(startValue, endValue, {
        duration: 1.5,
        ease: "easeOut",
        onUpdate: (latest) => {
          if (ref.current) {
            ref.current.textContent = Intl.NumberFormat("es-PY").format(
              Math.floor(latest)
            );
          }
        },
      });
    }, delay * 1000);

    return () => clearTimeout(timeout);
  }, [isInView, value, direction, delay]);

  return (
    <span
      className={`inline-block tabular-nums tracking-tighter ${className}`}
      ref={ref}
    >
      {direction === "down" ? value : 0}
    </span>
  );
}
