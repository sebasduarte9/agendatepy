"use client";

import React, { useRef, useState, useEffect } from "react";
import type { LucideIcon } from "lucide-react";
import { triggerHaptic } from "@/lib/haptics";

export interface SegmentOption<T extends string = string> {
  value: T;
  label: string;
  icon?: LucideIcon;
  badge?: number | string;
}

interface IosSegmentedControlProps<T extends string = string> {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  layoutId?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export default function IosSegmentedControl<T extends string = string>({
  options,
  value,
  onChange,
  className = "",
  size = "md",
}: IosSegmentedControlProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [indicatorStyle, setIndicatorStyle] = useState<{ left: number; width: number; ready: boolean }>({
    left: 0,
    width: 0,
    ready: false,
  });

  const sizeClasses = {
    sm: "h-8 text-[11px] px-2.5",
    md: "h-9 sm:h-10 text-xs px-3",
    lg: "h-11 sm:h-12 text-sm px-4",
  };

  const updateIndicator = () => {
    if (!containerRef.current) return;
    const activeEl = containerRef.current.querySelector<HTMLButtonElement>(`[data-active="true"]`);
    if (activeEl) {
      setIndicatorStyle({
        left: activeEl.offsetLeft,
        width: activeEl.offsetWidth,
        ready: true,
      });
    }
  };

  useEffect(() => {
    updateIndicator();
    window.addEventListener("resize", updateIndicator);
    return () => window.removeEventListener("resize", updateIndicator);
  }, [value, options]);

  return (
    <div
      ref={containerRef}
      role="tablist"
      className={`relative inline-flex w-full sm:w-auto items-center p-1 rounded-2xl bg-slate-200/75 dark:bg-zinc-800/80 border border-slate-300/40 dark:border-white/5 select-none transition-colors ${className}`}
    >
      {/* Sliding Pill Indicator - pure hardware-accelerated CSS transition */}
      {indicatorStyle.ready && (
        <div
          aria-hidden="true"
          className="absolute top-1 bottom-1 rounded-[12px] bg-white dark:bg-zinc-900 shadow-sm border border-slate-200/60 dark:border-white/10 pointer-events-none transition-all duration-200 ease-out"
          style={{
            left: `${indicatorStyle.left}px`,
            width: `${indicatorStyle.width}px`,
          }}
        />
      )}

      {options.map((opt) => {
        const isActive = opt.value === value;
        const Icon = opt.icon;

        return (
          <button
            key={opt.value}
            role="tab"
            aria-selected={isActive}
            data-active={isActive ? "true" : "false"}
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={(e) => {
              e.preventDefault();
              if (!isActive) {
                triggerHaptic("selection");
                onChange(opt.value);
              }
            }}
            className={`relative z-10 flex flex-1 sm:flex-initial items-center justify-center gap-1.5 font-bold transition-colors duration-150 cursor-pointer rounded-xl select-none outline-none ${sizeClasses[size]} ${
              isActive
                ? "text-slate-900 dark:text-white"
                : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200"
            }`}
          >
            <span className="relative z-10 flex items-center gap-1.5 truncate">
              {Icon && <Icon className="h-3.5 w-3.5 shrink-0" />}
              <span className="truncate">{opt.label}</span>
              {opt.badge !== undefined && (
                <span
                  className={`ml-0.5 px-1.5 py-0.2 rounded-full text-[9px] font-black tracking-tight ${
                    isActive
                      ? "bg-slate-100 dark:bg-white/15 text-slate-900 dark:text-white"
                      : "bg-slate-300/60 dark:bg-zinc-700/60 text-slate-600 dark:text-zinc-400"
                  }`}
                >
                  {opt.badge}
                </span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}
