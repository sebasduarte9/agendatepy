"use client";

import React from "react";
import {
  Landmark,
  Sparkles,
  CalendarCheck,
  Coins,
  Trophy,
  Smartphone,
  StretchHorizontal,
  PawPrint,
  Calendar,
  Bell,
  Scissors,
  CheckCircle2,
} from "lucide-react";

// =============================================================================
// FILA 1 (Órbita Interior): 3 cards compactas - Radio 68px - Sentido Horario
// =============================================================================
const RING_1_ITEMS = [
  {
    id: "transferencia",
    icon: Landmark,
    iconBg: "bg-orange-100 text-brand dark:bg-orange-950 dark:text-[#FF6B4A]",
    title: "Transferencias",
    badge: "80k",
    badgeColor: "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300",
  },
  {
    id: "qr",
    icon: Sparkles,
    iconBg: "bg-violet-100 text-violet-600 dark:bg-violet-950 dark:text-violet-400",
    title: "Cobro QR",
    badge: "0%",
    badgeColor: "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300",
  },
  {
    id: "reserva",
    icon: CalendarCheck,
    iconBg: "bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400",
    title: "Reserva 24/7",
    badge: "Listo",
    badgeColor: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  },
];

// =============================================================================
// FILA 2 (Órbita Media): 4 cards compactas - Radio 114px - Sentido Antihorario
// =============================================================================
const RING_2_ITEMS = [
  {
    id: "recordatorio",
    icon: Bell,
    iconBg: "bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400",
    title: "Recordatorio",
    badge: "Sin faltas",
    badgeColor: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  },
  {
    id: "barba",
    icon: Scissors,
    iconBg: "bg-purple-100 text-purple-600 dark:bg-purple-950 dark:text-purple-400",
    title: "Corte & Barba",
    badge: "Spa",
    badgeColor: "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300",
  },
  {
    id: "caja",
    icon: Coins,
    iconBg: "bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400",
    title: "Cierre Caja",
    badge: "Cuadrado",
    badgeColor: "bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300",
  },
  {
    id: "padel",
    icon: Trophy,
    iconBg: "bg-sky-100 text-sky-600 dark:bg-sky-950 dark:text-sky-400",
    title: "Pádel Cancha",
    badge: "Reservado",
    badgeColor: "bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300",
  },
];

// =============================================================================
// FILA 3 (Órbita Exterior): 5 cards compactas - Radio 162px - Sentido Horario
// =============================================================================
const RING_3_ITEMS = [
  {
    id: "wallet",
    icon: Smartphone,
    iconBg: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
    title: "Tarjeta Digital",
    badge: "Wallet",
    badgeColor: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200",
  },
  {
    id: "pilates",
    icon: StretchHorizontal,
    iconBg: "bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400",
    title: "Pase Reformer",
    badge: "8 Clases",
    badgeColor: "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300",
  },
  {
    id: "comision",
    icon: CheckCircle2,
    iconBg: "bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400",
    title: "Liquidación Staff",
    badge: "Al día",
    badgeColor: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  },
  {
    id: "gcal",
    icon: Calendar,
    iconBg: "bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400",
    title: "Google Sync",
    badge: "Calendar",
    badgeColor: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  },
  {
    id: "vet",
    icon: PawPrint,
    iconBg: "bg-teal-100 text-teal-600 dark:bg-teal-950 dark:text-teal-400",
    title: "Vacunación Pet",
    badge: "OK",
    badgeColor: "bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300",
  },
];

export default function CircularOrbitHero() {
  // Radios de las 3 órbitas concéntricas (en px)
  const R1 = 68; // Fila 1 (Interior)
  const R2 = 114; // Fila 2 (Media)
  const R3 = 162; // Fila 3 (Exterior)

  const T1 = 24; // Duración órbita 1 (s)
  const T2 = 32; // Duración órbita 2 (s)
  const T3 = 42; // Duración órbita 3 (s)

  return (
    <div
      aria-hidden="true"
      className="absolute right-[-45px] xs:right-[-30px] sm:right-[-15px] top-[43%] -translate-y-1/2 w-[370px] h-[370px] pointer-events-none select-none overflow-visible"
    >
      {/* Capa de desvanecimiento vertical (evita tocar el subtítulo inferior y el navbar superior) */}
      <div
        className="w-full h-full relative"
        style={{
          WebkitMaskImage:
            "linear-gradient(to bottom, transparent 0%, black 14%, black 74%, transparent 92%)",
          maskImage:
            "linear-gradient(to bottom, transparent 0%, black 14%, black 74%, transparent 92%)",
        }}
      >
        {/* Capa de desvanecimiento horizontal: Las cards se desvanecen completamente (opacity: 0) al pasar detrás del nombre en el lado izquierdo y reaparecen al girar al lado derecho */}
        <div
          className="w-full h-full relative"
          style={{
            WebkitMaskImage:
              "linear-gradient(to right, transparent 0%, transparent 50%, black 68%, black 90%, transparent 100%)",
            maskImage:
              "linear-gradient(to right, transparent 0%, transparent 50%, black 68%, black 90%, transparent 100%)",
          }}
        >
          {/* =============================================================== */}
          {/* FILA 1: 3 CARDS ORBITANDO (Horario, R=68px, T=24s)              */}
          {/* =============================================================== */}
          {RING_1_ITEMS.map((item, idx) => {
            const Icon = item.icon;
            const delay = -((idx / RING_1_ITEMS.length) * T1);
            return (
              <div
                key={`ring1-${item.id}`}
                className="absolute left-1/2 top-1/2 animate-orbit-card-cw will-change-transform"
                style={{
                  ["--orbit-radius" as any]: `${R1}px`,
                  ["--orbit-duration" as any]: `${T1}s`,
                  animationDelay: `${delay}s`,
                }}
              >
                <div className="flex items-center gap-1.5 rounded-full border border-slate-200/90 dark:border-white/15 bg-white/95 dark:bg-slate-900/95 px-2.5 py-0.5 shadow-xs backdrop-blur-md whitespace-nowrap">
                  <div
                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${item.iconBg}`}
                  >
                    <Icon className="h-2.5 w-2.5" />
                  </div>
                  <span className="text-[9.5px] font-bold text-slate-900 dark:text-white leading-tight">
                    {item.title}
                  </span>
                  <span
                    className={`rounded-full px-1.5 py-0.2 text-[7.5px] font-extrabold ${item.badgeColor}`}
                  >
                    {item.badge}
                  </span>
                </div>
              </div>
            );
          })}

          {/* =============================================================== */}
          {/* FILA 2: 4 CARDS ORBITANDO (Antihorario, R=114px, T=32s)         */}
          {/* =============================================================== */}
          {RING_2_ITEMS.map((item, idx) => {
            const Icon = item.icon;
            const delay = -((idx / RING_2_ITEMS.length) * T2);
            return (
              <div
                key={`ring2-${item.id}`}
                className="absolute left-1/2 top-1/2 animate-orbit-card-ccw will-change-transform"
                style={{
                  ["--orbit-radius" as any]: `${R2}px`,
                  ["--orbit-duration" as any]: `${T2}s`,
                  animationDelay: `${delay}s`,
                }}
              >
                <div className="flex items-center gap-1.5 rounded-full border border-slate-200/90 dark:border-white/15 bg-white/95 dark:bg-slate-900/95 px-2.5 py-0.5 shadow-xs backdrop-blur-md whitespace-nowrap">
                  <div
                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${item.iconBg}`}
                  >
                    <Icon className="h-2.5 w-2.5" />
                  </div>
                  <span className="text-[9.5px] font-bold text-slate-900 dark:text-white leading-tight">
                    {item.title}
                  </span>
                  <span
                    className={`rounded-full px-1.5 py-0.2 text-[7.5px] font-extrabold ${item.badgeColor}`}
                  >
                    {item.badge}
                  </span>
                </div>
              </div>
            );
          })}

          {/* =============================================================== */}
          {/* FILA 3: 5 CARDS ORBITANDO (Horario, R=162px, T=42s)             */}
          {/* =============================================================== */}
          {RING_3_ITEMS.map((item, idx) => {
            const Icon = item.icon;
            const delay = -((idx / RING_3_ITEMS.length) * T3);
            return (
              <div
                key={`ring3-${item.id}`}
                className="absolute left-1/2 top-1/2 animate-orbit-card-cw will-change-transform"
                style={{
                  ["--orbit-radius" as any]: `${R3}px`,
                  ["--orbit-duration" as any]: `${T3}s`,
                  animationDelay: `${delay}s`,
                }}
              >
                <div className="flex items-center gap-1.5 rounded-full border border-slate-200/90 dark:border-white/15 bg-white/95 dark:bg-slate-900/95 px-2.5 py-0.5 shadow-xs backdrop-blur-md whitespace-nowrap">
                  <div
                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${item.iconBg}`}
                  >
                    <Icon className="h-2.5 w-2.5" />
                  </div>
                  <span className="text-[9.5px] font-bold text-slate-900 dark:text-white leading-tight">
                    {item.title}
                  </span>
                  <span
                    className={`rounded-full px-1.5 py-0.2 text-[7.5px] font-extrabold ${item.badgeColor}`}
                  >
                    {item.badge}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
