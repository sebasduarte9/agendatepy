"use client";

import React from "react";

export function Skeleton({
  className = "",
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-xl bg-slate-200/80 dark:bg-white/[0.06] animate-pulse ${className}`}
      {...props}
    />
  );
}

/**
 * 📅 Skeleton ultra-realista para la vista de Agenda / Calendario
 */
export function CalendarSkeleton() {
  return (
    <div className="w-full space-y-4 animate-in fade-in-50 duration-150">
      {/* Barra de Controles: Fecha, Vista y Acción */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-[#121215]/80 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-9 rounded-xl" />
          <Skeleton className="h-9 w-40 rounded-xl" />
          <Skeleton className="h-9 w-9 rounded-xl" />
          <Skeleton className="h-8 w-18 rounded-lg hidden sm:block" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-32 rounded-xl hidden sm:block" />
          <Skeleton className="h-9 w-36 rounded-xl bg-primary/20" />
        </div>
      </div>

      {/* Selector de Especialistas (Chips) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-200/70 dark:border-white/10 bg-white dark:bg-slate-900 shrink-0"
          >
            <Skeleton className="h-6 w-6 rounded-full" />
            <Skeleton className="h-3 w-16 rounded-md" />
          </div>
        ))}
      </div>

      {/* Grid del Tablero de Turnos */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/60 dark:bg-[#121215]/60 overflow-hidden p-4 space-y-3 min-h-[500px]">
        {[
          { time: "08:00", card: true, height: "h-20" },
          { time: "09:00", card: false, height: "" },
          { time: "10:00", card: true, height: "h-28" },
          { time: "11:00", card: true, height: "h-16" },
          { time: "12:00", card: false, height: "" },
          { time: "13:30", card: true, height: "h-24" },
        ].map((slot, idx) => (
          <div key={idx} className="flex gap-4 items-start">
            <span className="text-[11px] font-semibold text-slate-400 w-12 shrink-0 pt-1">
              {slot.time}
            </span>
            <div className="flex-1 border-t border-slate-100 dark:border-white/5 pt-2">
              {slot.card ? (
                <div
                  className={`w-full max-w-md ${slot.height} rounded-2xl border border-slate-200/70 dark:border-white/10 bg-slate-100/80 dark:bg-white/[0.04] p-3 flex flex-col justify-between animate-pulse`}
                >
                  <div className="flex justify-between items-start">
                    <Skeleton className="h-3.5 w-32 rounded-md" />
                    <Skeleton className="h-4 w-14 rounded-full" />
                  </div>
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-2.5 w-24 rounded-md" />
                    <Skeleton className="h-2.5 w-16 rounded-md" />
                  </div>
                </div>
              ) : (
                <div className="h-8 border-b border-dashed border-slate-200/40 dark:border-white/5" />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * 💵 Skeleton para la sección de Caja & Cobros
 */
export function CajaSkeleton() {
  return (
    <div className="w-full space-y-5 animate-in fade-in-50 duration-150">
      {/* Hero Balance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="p-4 sm:p-5 rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#121215] space-y-2.5"
          >
            <div className="flex justify-between items-center">
              <Skeleton className="h-3 w-24 rounded-md" />
              <Skeleton className="h-8 w-8 rounded-xl" />
            </div>
            <Skeleton className="h-7 w-36 rounded-lg" />
            <Skeleton className="h-2.5 w-20 rounded-md" />
          </div>
        ))}
      </div>

      {/* Botones de acción y filtros */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Skeleton className="h-10 w-48 rounded-xl" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-28 rounded-xl" />
          <Skeleton className="h-10 w-32 rounded-xl" />
        </div>
      </div>

      {/* Lista de Movimientos */}
      <div className="rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#121215] overflow-hidden divide-y divide-slate-100 dark:divide-white/5">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="p-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-2xl shrink-0" />
              <div className="space-y-1.5">
                <Skeleton className="h-3.5 w-36 rounded-md" />
                <Skeleton className="h-2.5 w-24 rounded-md" />
              </div>
            </div>
            <div className="text-right space-y-1.5">
              <Skeleton className="h-4 w-20 rounded-md ml-auto" />
              <Skeleton className="h-2.5 w-14 rounded-md ml-auto" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * 👥 Skeleton para la sección de Clientes
 */
export function ClientesSkeleton() {
  return (
    <div className="w-full space-y-5 animate-in fade-in-50 duration-150">
      {/* Header y Buscador */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <Skeleton className="h-6 w-32 rounded-lg" />
          <Skeleton className="h-3 w-48 rounded-md" />
        </div>
        <Skeleton className="h-10 w-36 rounded-2xl bg-primary/20" />
      </div>

      {/* Search Input Bar */}
      <Skeleton className="h-11 w-full rounded-2xl" />

      {/* Client List Rows */}
      <div className="rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#121215] overflow-hidden divide-y divide-slate-100 dark:divide-white/5">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="p-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3.5 min-w-0">
              <Skeleton className="h-11 w-11 rounded-2xl shrink-0" />
              <div className="space-y-1.5 min-w-0">
                <Skeleton className="h-3.5 w-36 rounded-md" />
                <Skeleton className="h-2.5 w-28 rounded-md" />
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Skeleton className="h-8 w-16 rounded-xl hidden sm:block" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * ✂️ Skeleton para Servicios & Catálogo
 */
export function ServiciosSkeleton() {
  return (
    <div className="w-full space-y-5 animate-in fade-in-50 duration-150">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <Skeleton className="h-6 w-36 rounded-lg" />
          <Skeleton className="h-3 w-48 rounded-md" />
        </div>
        <Skeleton className="h-10 w-36 rounded-2xl bg-primary/20" />
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-9 w-24 rounded-full shrink-0" />
        ))}
      </div>

      {/* Services Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="p-4 rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#121215] space-y-3"
          >
            <div className="flex justify-between items-start">
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-32 rounded-md" />
                <Skeleton className="h-2.5 w-20 rounded-md" />
              </div>
              <Skeleton className="h-8 w-8 rounded-xl" />
            </div>
            <div className="pt-2 flex justify-between items-center border-t border-slate-100 dark:border-white/5">
              <Skeleton className="h-5 w-20 rounded-md" />
              <Skeleton className="h-7 w-16 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
