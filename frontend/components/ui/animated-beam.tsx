"use client";

import React, { useEffect, useId, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface AnimatedBeamProps {
  className?: string;
  containerRef: React.RefObject<HTMLElement | null>;
  fromRef: React.RefObject<HTMLElement | null>;
  toRef: React.RefObject<HTMLElement | null>;
  curvature?: number;
  reverse?: boolean;
  pathColor?: string;
  pathWidth?: number;
  pathOpacity?: number;
  gradientStartColor?: string;
  gradientStopColor?: string;
  delay?: number;
  duration?: number;
  startXOffset?: number;
  startYOffset?: number;
  endXOffset?: number;
  endYOffset?: number;
  dotted?: boolean;
}

export const AnimatedBeam: React.FC<AnimatedBeamProps> = ({
  className,
  containerRef,
  fromRef,
  toRef,
  curvature = 0,
  reverse = false,
  duration = 4.5,
  delay = 0,
  pathColor = "rgba(226, 232, 240, 0.6)",
  pathWidth = 2,
  pathOpacity = 0.4,
  gradientStartColor = "#FF4F2B",
  gradientStopColor = "#FF7A38",
  startXOffset = 0,
  startYOffset = 0,
  endXOffset = 0,
  endYOffset = 0,
  dotted = false,
}) => {
  const id = useId().replace(/:/g, "_");
  const [pathD, setPathD] = useState("");
  const [svgDimensions, setSvgDimensions] = useState({ width: 0, height: 0 });

  const strokeColor = reverse ? gradientStartColor : gradientStopColor;

  useEffect(() => {
    const updatePath = () => {
      if (!containerRef.current || !fromRef.current || !toRef.current) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      const fromRect = fromRef.current.getBoundingClientRect();
      const toRect = toRef.current.getBoundingClientRect();

      const width = containerRect.width;
      const height = containerRect.height;
      setSvgDimensions({ width, height });

      const startX = fromRect.left - containerRect.left + fromRect.width / 2 + startXOffset;
      const startY = fromRect.top - containerRect.top + fromRect.height / 2 + startYOffset;
      const endX = toRect.left - containerRect.left + toRect.width / 2 + endXOffset;
      const endY = toRect.top - containerRect.top + toRect.height / 2 + endYOffset;

      const midX = (startX + endX) / 2;
      const midY = (startY + endY) / 2 + curvature;

      const d = `M ${startX},${startY} Q ${midX},${midY} ${endX},${endY}`;
      setPathD(d);
    };

    updatePath();

    const resizeObserver = new ResizeObserver(() => updatePath());
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    window.addEventListener("resize", updatePath);
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updatePath);
    };
  }, [
    containerRef,
    fromRef,
    toRef,
    curvature,
    startXOffset,
    startYOffset,
    endXOffset,
    endYOffset,
  ]);

  return (
    <svg
      fill="none"
      width={svgDimensions.width}
      height={svgDimensions.height}
      xmlns="http://www.w3.org/2000/svg"
      className={cn(
        "pointer-events-none absolute left-0 top-0 transform-gpu stroke-2",
        className
      )}
      viewBox={`0 0 ${svgDimensions.width} ${svgDimensions.height}`}
    >
      <path
        d={pathD}
        stroke={pathColor}
        strokeWidth={pathWidth}
        strokeOpacity={pathOpacity}
        strokeLinecap="round"
        strokeDasharray={dotted ? "4 4" : undefined}
      />
      <path
        d={pathD}
        stroke={`url(#${id})`}
        strokeWidth={pathWidth + 0.5}
        strokeOpacity="1"
        strokeLinecap="round"
        strokeDasharray={dotted ? "4 4" : undefined}
      />
      <defs>
        <motion.linearGradient
          className="transform-gpu"
          id={id}
          gradientUnits="userSpaceOnUse"
          initial={{
            x1: reverse ? "100%" : "0%",
            x2: reverse ? "110%" : "-10%",
            y1: "0%",
            y2: "0%",
          }}
          animate={{
            x1: reverse ? ["100%", "-20%"] : ["-20%", "100%"],
            x2: reverse ? ["120%", "0%"] : ["0%", "120%"],
            y1: ["0%", "0%"],
            y2: ["0%", "0%"],
          }}
          transition={{
            delay,
            duration,
            ease: [0.16, 1, 0.3, 1],
            repeat: Infinity,
            repeatDelay: 0.2,
          }}
        >
          <stop stopColor={gradientStartColor} stopOpacity="0" />
          <stop stopColor={gradientStartColor} />
          <stop offset="32.5%" stopColor={gradientStopColor} />
          <stop offset="100%" stopColor={strokeColor} stopOpacity="0" />
        </motion.linearGradient>
      </defs>
    </svg>
  );
};

export const Circle = React.forwardRef<
  HTMLDivElement,
  { className?: string; children?: React.ReactNode }
>(({ className, children }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "z-10 flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-2xl border bg-white/95 dark:bg-slate-900/95 p-2 shadow-md shadow-slate-200/50 dark:shadow-none border-slate-200/90 dark:border-white/10 transition-transform hover:scale-105",
        className
      )}
    >
      {children}
    </div>
  );
});

Circle.displayName = "Circle";
