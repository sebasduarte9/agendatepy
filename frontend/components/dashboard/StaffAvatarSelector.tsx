"use client";

import React from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Users, Check } from "lucide-react";
import { motionTokens } from "@/lib/motion-tokens";
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
  const transition = reduceMotion ? { duration: 0 } : motionTokens.spring.snappy;

  const totalToday = appointmentsToday.length;
  const isAllSelected = selectedStaffFilter === "all";

  const selectedStaffObj = staffList.find((s) => s.id === selectedStaffFilter);

  return (
    <div className={`flex items-center gap-2.5 py-1 ${className}`}>
      <span className="text-[11px] font-bold text-slate-400 shrink-0 select-none">
        Filtrar:
      </span>

      <div className="flex items-center gap-1.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden py-0.5 px-0.5">
        {/* "Todos" Avatar Button */}
        <button
          type="button"
          tabIndex={-1}
          onPointerDown={(e) => e.preventDefault()}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => {
            triggerHaptic("selection");
            onSelectStaff("all");
          }}
          className={`relative group inline-flex items-center gap-1.5 h-8 px-2.5 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer select-none outline-none ${
            isAllSelected
              ? "text-white shadow-xs scale-100 ring-2 ring-offset-1 ring-offset-white dark:ring-offset-slate-900"
              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
          style={{
            backgroundColor: isAllSelected ? primaryColor : undefined,
            // @ts-ignore
            "--tw-ring-color": isAllSelected ? primaryColor : undefined,
          }}
        >
          <Users className="h-3.5 w-3.5 shrink-0" />
          <span>Todos</span>
          <span className="text-[10px] font-mono opacity-80">({totalToday})</span>
        </button>

        {/* Overlapping Staff Avatars */}
        <div className="flex items-center -space-x-1.5 pl-1">
          {staffList.map((st, index) => {
            const count = appointmentsToday.filter((a) => a.staffId === st.id).length;
            const isSelected = selectedStaffFilter === st.id;
            const initial = st.name.slice(0, 1).toUpperCase();

            return (
              <motion.button
                key={st.id}
                type="button"
                tabIndex={-1}
                onPointerDown={(e) => e.preventDefault()}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  triggerHaptic("selection");
                  onSelectStaff(isSelected ? "all" : st.id);
                }}
                className={`relative group inline-flex items-center justify-center h-8 w-8 rounded-full border-2 border-white dark:border-slate-900 transition-all cursor-pointer select-none outline-none shrink-0 ${
                  isSelected
                    ? "z-30 scale-110 ring-2 ring-offset-1 ring-offset-white dark:ring-offset-slate-900 shadow-md"
                    : "z-10 hover:z-20 hover:scale-105 opacity-90 hover:opacity-100"
                }`}
                style={{
                  backgroundColor: st.color || "#6366f1",
                  // @ts-ignore
                  "--tw-ring-color": primaryColor,
                }}
                title={`${st.name} (${count} turnos)`}
              >
                {st.avatar ? (
                  <img
                    src={st.avatar}
                    alt={st.name}
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  <span className="text-[11px] font-black text-white select-none">
                    {initial}
                  </span>
                )}

                {/* Badge with count if > 0 */}
                {count > 0 && (
                  <span className="absolute -top-1 -right-1 h-3.5 min-w-[14px] px-1 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[8px] font-mono font-black flex items-center justify-center shadow-xs border border-white dark:border-slate-900">
                    {count}
                  </span>
                )}

                {/* Tooltip on hover/touch */}
                <span className="absolute bottom-full mb-1.5 left-50% -translate-x-1/2 px-2 py-0.5 rounded-md bg-slate-900/90 dark:bg-white/95 text-white dark:text-slate-900 text-[10px] font-bold whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity shadow-md z-40">
                  {st.name}
                </span>
              </motion.button>
            );
          })}
        </div>

        {/* Selected Staff Name indicator */}
        {selectedStaffObj && (
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate max-w-[120px] pl-1 animate-in fade-in duration-150">
            {selectedStaffObj.name}
          </span>
        )}
      </div>
    </div>
  );
}

export default StaffAvatarSelector;
