"use client";

import type { ReactNode } from "react";

interface MorphingOrbProps {
  label?: string;
  value?: string | number | ReactNode;
  sublabel?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function MorphingOrb({
  label,
  value,
  sublabel,
  size = "md",
  className = "",
}: MorphingOrbProps) {
  const sizeMap = {
    sm: {
      outer: "h-20 w-20",
      center: "h-16 w-16",
      valueText: "text-xs font-bold",
      labelText: "text-[8px]",
    },
    md: {
      outer: "h-26 w-26",
      center: "h-20 w-20",
      valueText: "text-sm font-extrabold tracking-tight",
      labelText: "text-[9px]",
    },
    lg: {
      outer: "h-32 w-32",
      center: "h-26 w-26",
      valueText: "text-lg font-black tracking-tight",
      labelText: "text-[10px]",
    },
  };

  const currentSize = sizeMap[size];

  return (
    <div className={`relative flex items-center justify-center select-none ${className}`}>
      {/* Orbe orgánico giratorio con capas contrarotativas */}
      <div className={`glass-morph-orb ${currentSize.outer}`}>
        {/* Núcleo central de cristal */}
        <div className={`glass-morph-center ${currentSize.center} p-1 text-center`}>
          {label && (
            <span className={`block uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400 ${currentSize.labelText}`}>
              {label}
            </span>
          )}
          {value && (
            <div className={`text-slate-900 dark:text-white leading-tight ${currentSize.valueText}`}>
              {value}
            </div>
          )}
          {sublabel && (
            <span className="block text-[8px] text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">
              {sublabel}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
