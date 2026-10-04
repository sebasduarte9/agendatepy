"use client";

import React from "react";
import { motion } from "framer-motion";
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
  layoutId = "iosSegmentedPill",
  className = "",
  size = "md",
}: IosSegmentedControlProps<T>) {
  const sizeClasses = {
    sm: "h-8 text-[11px] px-2.5",
    md: "h-9 sm:h-10 text-xs px-3",
    lg: "h-11 sm:h-12 text-sm px-4",
  };

  return (
    <div
      role="tablist"
      className={`relative inline-flex w-full sm:w-auto items-center p-1 rounded-2xl bg-slate-200/75 dark:bg-slate-800/80 border border-slate-300/40 dark:border-white/5 select-none transition-colors ${className}`}
    >
      {options.map((opt) => {
        const isActive = opt.value === value;
        const Icon = opt.icon;

        return (
          <button
            key={opt.value}
            role="tab"
            aria-selected={isActive}
            type="button"
            onClick={() => {
              if (!isActive) {
                triggerHaptic("selection");
                onChange(opt.value);
              }
            }}
            className={`relative z-10 flex flex-1 sm:flex-initial items-center justify-center gap-1.5 font-bold transition-all duration-150 cursor-pointer rounded-xl ${sizeClasses[size]} ${
              isActive
                ? "text-slate-900 dark:text-white"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            {/* Apple Floating White/Dark Sliding Pill */}
            {isActive && (
              <motion.div
                layoutId={layoutId}
                className="absolute inset-0 rounded-[12px] bg-white dark:bg-slate-900 shadow-sm border border-slate-200/60 dark:border-white/10"
                transition={{ type: "spring", stiffness: 480, damping: 34 }}
              />
            )}

            <span className="relative z-10 flex items-center gap-1.5 truncate">
              {Icon && <Icon className="h-3.5 w-3.5 shrink-0" />}
              <span className="truncate">{opt.label}</span>
              {opt.badge !== undefined && (
                <span
                  className={`ml-0.5 px-1.5 py-0.2 rounded-full text-[9px] font-black tracking-tight ${
                    isActive
                      ? "bg-slate-100 dark:bg-white/15 text-slate-900 dark:text-white"
                      : "bg-slate-300/60 dark:bg-slate-700/60 text-slate-600 dark:text-slate-400"
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
