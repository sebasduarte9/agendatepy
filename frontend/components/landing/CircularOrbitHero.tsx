"use client";

import React from "react";
import {
  CalendarCheck,
  Landmark,
  QrCode,
  Bell,
  Coins,
  Scissors,
  Calendar,
  Receipt,
  Trophy,
} from "lucide-react";

// =============================================================================
// ÓRBITA MÓVIL CENTRADA EN LA "A" DE AGENDATEPY
// - 9 notificaciones distribuidas equitativamente cada 40°.
// - Textos 100% COMPLETOS sin puntos suspensivos ("...").
// - Cadencia más junta y armoniosa (~40-50px de separación), sin superposición.
// - Desvanecimiento vertical que se disuelve con suavidad al llegar al texto
//   "Mejor control para tu negocio", sin tocar los botones CTA inferiores.
// =============================================================================
const MOBILE_ORBIT_ITEMS = [
  {
    id: "mob-turno",
    icon: CalendarCheck,
    iconBg: "bg-emerald-500 text-white shadow-xs",
    title: "Turno Confirmado",
    badge: "15:30",
    badgeColor: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
    angle: 0,
    x: 50,
    y: 0, // 0°
  },
  {
    id: "mob-sena",
    icon: Landmark,
    iconBg: "bg-[#FF4F2B] text-white shadow-xs",
    title: "Seña Recibida",
    badge: "80k",
    badgeColor: "bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300",
    angle: 40,
    x: 82.14,
    y: 11.7, // 40°
  },
  {
    id: "mob-qr",
    icon: QrCode,
    iconBg: "bg-violet-500 text-white shadow-xs",
    title: "Cobro QR",
    badge: "0% com.",
    badgeColor: "bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-300",
    angle: 80,
    x: 99.24,
    y: 41.32, // 80°
  },
  {
    id: "mob-recordatorio",
    icon: Bell,
    iconBg: "bg-amber-500 text-white shadow-xs",
    title: "Recordatorio",
    badge: "WhatsApp",
    badgeColor: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
    angle: 120,
    x: 93.3,
    y: 75, // 120°
  },
  {
    id: "mob-caja",
    icon: Coins,
    iconBg: "bg-indigo-500 text-white shadow-xs",
    title: "Cierre Caja",
    badge: "Cuadrado",
    badgeColor: "bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300",
    angle: 160,
    x: 67.1,
    y: 96.98, // 160°
  },
  {
    id: "mob-barba",
    icon: Scissors,
    iconBg: "bg-purple-500 text-white shadow-xs",
    title: "Corte & Barba",
    badge: "Barber",
    badgeColor: "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300",
    angle: 200,
    x: 32.9,
    y: 96.98, // 200°
  },
  {
    id: "mob-gcal",
    icon: Calendar,
    iconBg: "bg-blue-500 text-white shadow-xs",
    title: "Google Calendar",
    badge: "En vivo",
    badgeColor: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
    angle: 240,
    x: 6.7,
    y: 75, // 240°
  },
  {
    id: "mob-factura",
    icon: Receipt,
    iconBg: "bg-emerald-600 text-white shadow-xs",
    title: "Factura RUC",
    badge: "Resimple",
    badgeColor: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
    angle: 280,
    x: 0.76,
    y: 41.32, // 280°
  },
  {
    id: "mob-padel",
    icon: Trophy,
    iconBg: "bg-sky-500 text-white shadow-xs",
    title: "Cancha Pádel",
    badge: "20:00",
    badgeColor: "bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300",
    angle: 320,
    x: 17.86,
    y: 11.7, // 320°
  },
];

export default function CircularOrbitHero() {
  return (
    <div
      aria-hidden="true"
      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[760px] h-[760px] pointer-events-none select-none z-0"
    >
      {/* Capa 1: Desvanecimiento Vertical (Se mantiene visible recorriendo la derecha y se desvanece al nivel de 'Mejor control') */}
      <div
        className="w-full h-full relative"
        style={{
          WebkitMaskImage:
            "linear-gradient(to bottom, transparent 0%, black 5%, black 56%, transparent 66%)",
          maskImage:
            "linear-gradient(to bottom, transparent 0%, black 5%, black 56%, transparent 66%)",
        }}
      >
        {/* Capa 2: Desvanecimiento Horizontal (Oculta lado izquierdo para texto y muestra arco limpio a la derecha) */}
        <div
          className="w-full h-full relative flex items-center justify-center"
          style={{
            WebkitMaskImage:
              "linear-gradient(to right, transparent 0%, transparent 46%, black 58%, black 100%)",
            maskImage:
              "linear-gradient(to right, transparent 0%, transparent 46%, black 58%, black 100%)",
          }}
        >
          {/* CÍRCULO ORBITAL SIN LÍNEA DE BORDE */}
          <div className="hero-orbit-big-circle relative w-[580px] h-[580px] rounded-full border-none flex items-center justify-center">
            {MOBILE_ORBIT_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.id}
                  className="absolute"
                  style={{
                    left: `${item.x}%`,
                    top: `${item.y}%`,
                    // Rotación tangencial a lo largo de la curvatura
                    transform: `translate(-50%, -50%) rotate(${item.angle}deg)`,
                  }}
                >
                  {/* Tarjeta con texto completo, ampliada un 8-10% para máxima legibilidad */}
                  <div className="flex items-center gap-2 rounded-full border border-slate-200/90 dark:border-white/15 bg-white/95 dark:bg-slate-900/95 px-3 py-1.5 shadow-md shadow-slate-950/6 dark:shadow-black/40 backdrop-blur-md whitespace-nowrap">
                    <div
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${item.iconBg}`}
                    >
                      <Icon className="h-3 w-3" />
                    </div>
                    <span className="text-[11px] font-bold text-slate-900 dark:text-white leading-none whitespace-nowrap">
                      {item.title}
                    </span>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-[8.5px] font-extrabold whitespace-nowrap ${item.badgeColor}`}
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
    </div>
  );
}
