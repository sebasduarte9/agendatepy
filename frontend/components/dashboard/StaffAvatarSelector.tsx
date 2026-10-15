"use client";

import React, { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { Users } from "lucide-react";
import { triggerHaptic } from "@/lib/haptics";
import type { StaffMember, Appointment } from "@/lib/dashboard-types";

interface StaffAvatarSelectorProps {
  staffList: StaffMember[];
  appointmentsToday: Appointment[];
  selectedStaffFilter: string;
  onSelectStaff: (staffId: string) => void;
  primaryColor?: string;
  className?: string;
}

export function StaffAvatarSelector({
  staffList,
  appointmentsToday,
  selectedStaffFilter,
  onSelectStaff,
  primaryColor = "#FF4F2B",
  className = "",
}: StaffAvatarSelectorProps) {
  const reduceMotion = !!useReducedMotion();
  const transition = reduceMotion
    ? { duration: 0 }
    : { type: "spring" as const, stiffness: 400, damping: 28, mass: 0.6 };
  const [brokenAvatars, setBrokenAvatars] = useState<Record<string, boolean>>({});

  const totalToday = appointmentsToday.length;
  const isAllSelected = selectedStaffFilter === "all";

  // System glass token styles for selected pill
  const selectedGlassStyle = {
    backgroundColor: "rgba(var(--primary-rgb, 255, 79, 43), 0.14)",
    borderColor: "rgba(var(--primary-rgb, 255, 79, 43), 0.38)",
    color: "var(--primary, #FF4F2B)",
  };

  return (
    <div className={`flex items-center gap-2.5 py-1 ${className}`}>
      <span className="text-[11px] font-semibold text-slate-400 shrink-0 select-none">
        Filtrar:
      </span>

      {/* Single flat flex row for fluid, jump-free morphing */}
      <div className="flex items-center gap-1.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden py-1 px-0.5">
        {/* "Todos" Button */}
        <motion.button
          layout="position"
          type="button"
          tabIndex={-1}
          transition={transition}
          onPointerDown={(e) => e.preventDefault()}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => {
            triggerHaptic("selection");
            onSelectStaff("all");
          }}
          className={`relative inline-flex items-center justify-center h-8 rounded-full text-xs font-semibold cursor-pointer select-none outline-none transition-colors shrink-0 ${
            isAllSelected
              ? "px-3 gap-1.5 border backdrop-blur-md shadow-2xs"
              : "w-8 px-0 border border-slate-300 dark:border-white/20 bg-white dark:bg-white/[0.06] text-slate-600 dark:text-slate-300 hover:border-slate-400 dark:hover:border-white/30 shadow-2xs"
          }`}
          style={isAllSelected ? selectedGlassStyle : undefined}
          title={`Todos los turnos (${totalToday})`}
        >
          <Users className="h-3.5 w-3.5 shrink-0" />
          <AnimatePresence initial={false}>
            {isAllSelected && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                transition={transition}
                className="overflow-hidden inline-flex items-center gap-1 leading-none whitespace-nowrap pl-0.5"
              >
                <span>Todos</span>
                <span className="text-[11px] tabular-nums opacity-80">({totalToday})</span>
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>

        {/* Staff Buttons (Direct flex siblings with position layout to prevent distortion) */}
        {staffList.map((st) => {
          const count = appointmentsToday.filter((a) => a.staffId === st.id).length;
          const isSelected = selectedStaffFilter === st.id;
          const initial = (st.name || "S").trim().slice(0, 1).toUpperCase();
          const hasAvatar = Boolean(st.avatar && !brokenAvatars[st.id]);

          return (
            <motion.button
              key={st.id}
              layout="position"
              type="button"
              tabIndex={-1}
              transition={transition}
              onPointerDown={(e) => e.preventDefault()}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                triggerHaptic("selection");
                onSelectStaff(isSelected ? "all" : st.id);
              }}
              className={`relative inline-flex items-center justify-center h-8 rounded-full text-xs font-semibold cursor-pointer select-none outline-none transition-colors shrink-0 ${
                isSelected
                  ? "pl-1 pr-3 gap-1.5 border backdrop-blur-md shadow-2xs"
                  : "w-8 px-0 border border-slate-300 dark:border-white/20 bg-white dark:bg-white/[0.06] text-slate-700 dark:text-slate-200 hover:border-slate-400 dark:hover:border-white/30 shadow-2xs"
              }`}
              style={isSelected ? selectedGlassStyle : undefined}
              title={`${st.name} (${count} turnos)`}
            >
              {/* Stable, fixed avatar circle: strictly constant dimension (h-6 w-6) in all states */}
              <div
                className={`h-6 w-6 rounded-full overflow-hidden flex items-center justify-center shrink-0 select-none ${
                  isSelected
                    ? "bg-[var(--primary)]/20 text-[var(--primary)] font-semibold text-[11px]"
                    : "bg-slate-100 dark:bg-white/10 text-slate-800 dark:text-slate-100 font-semibold text-xs border border-slate-200/90 dark:border-white/15"
                }`}
              >
                {hasAvatar ? (
                  <img
                    src={st.avatar}
                    alt={st.name}
                    onError={() =>
                      setBrokenAvatars((prev) => ({ ...prev, [st.id]: true }))
                    }
                    className="h-full w-full object-cover rounded-full select-none"
                  />
                ) : (
                  <span className="select-none leading-none">{initial}</span>
                )}
              </div>

              {/* Name & Count smoothly unrolled with zero scale distortion */}
              <AnimatePresence initial={false}>
                {isSelected && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={transition}
                    className="overflow-hidden inline-flex items-center gap-1 leading-none whitespace-nowrap pl-0.5"
                  >
                    <span>{st.name}</span>
                    <span className="text-[11px] tabular-nums opacity-80">({count})</span>
                  </motion.span>
                )}
              </AnimatePresence>

              {/* Count badge when collapsed if > 0 */}
              {!isSelected && count > 0 && (
                <span className="absolute -top-1 -right-1 h-3.5 min-w-[14px] px-1 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[11px] tabular-nums font-semibold flex items-center justify-center shadow-xs border border-white dark:border-slate-900 pointer-events-none">
                  {count}
                </span>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

export default StaffAvatarSelector;
