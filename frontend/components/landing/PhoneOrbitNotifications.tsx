"use client";

import React from "react";
import {
  CheckCircle2,
  Landmark,
  Bell,
  QrCode,
  Coins,
  Smartphone,
  Calendar,
  Scissors,
} from "lucide-react";

interface NotificationItem {
  id: string;
  icon: React.ElementType;
  iconBg: string;
  title: string;
  subtitle: string;
  badge?: string;
  badgeStyle?: string;
  angle: number; // Ángulo en grados (0 a 360)
  x: number; // Coordenada X (%) en circunferencia
  y: number; // Coordenada Y (%) en circunferencia
}

// =============================================================================
// UN SOLO CÍRCULO CON TODAS LAS NOTIFICACIONES (8 notificaciones a 45° cada una)
// Las tarjetas se orientan tangencialmente a la curva del círculo y giran con él.
// Están distribuidas uniformemente para verse completas a la izquierda y a la derecha
// del teléfono sin cortarse jamás en los bordes.
// =============================================================================
const ORBIT_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "notif-reserva",
    icon: CheckCircle2,
    iconBg: "bg-emerald-500 text-white shadow-xs shadow-emerald-500/40",
    title: "Turno Confirmado",
    subtitle: "WhatsApp Bot",
    badge: "15:30 hs",
    badgeStyle: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
    angle: 0,
    x: 50,
    y: 0, // 0° (Top)
  },
  {
    id: "notif-sena",
    icon: Landmark,
    iconBg: "bg-[#FF4F2B] text-white shadow-xs shadow-[#FF4F2B]/40",
    title: "Seña Recibida",
    subtitle: "SIPAP Verificado",
    badge: "Gs. 80.000",
    badgeStyle: "bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300",
    angle: 45,
    x: 85.36,
    y: 14.64, // 45° (Top Right)
  },
  {
    id: "notif-qr",
    icon: QrCode,
    iconBg: "bg-violet-500 text-white shadow-xs shadow-violet-500/40",
    title: "Cobro QR Listo",
    subtitle: "Bancard / Dinelco",
    badge: "0% Com.",
    badgeStyle: "bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-300",
    angle: 90,
    x: 100,
    y: 50, // 90° (Right)
  },
  {
    id: "notif-recordatorio",
    icon: Bell,
    iconBg: "bg-amber-500 text-white shadow-xs shadow-amber-500/40",
    title: "Recordatorio 2h",
    subtitle: "Anti-ausencias",
    badge: "Sin faltas",
    badgeStyle: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
    angle: 135,
    x: 85.36,
    y: 85.36, // 135° (Bottom Right)
  },
  {
    id: "notif-caja",
    icon: Coins,
    iconBg: "bg-indigo-500 text-white shadow-xs shadow-indigo-500/40",
    title: "Arqueo de Caja",
    subtitle: "Cierre Diario",
    badge: "Cuadrado",
    badgeStyle: "bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300",
    angle: 180,
    x: 50,
    y: 100, // 180° (Bottom)
  },
  {
    id: "notif-gcal",
    icon: Calendar,
    iconBg: "bg-blue-500 text-white shadow-xs shadow-blue-500/40",
    title: "Google Sync",
    subtitle: "Calendar en vivo",
    badge: "Sync OK",
    badgeStyle: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
    angle: 225,
    x: 14.64,
    y: 85.36, // 225° (Bottom Left)
  },
  {
    id: "notif-corte",
    icon: Scissors,
    iconBg: "bg-purple-500 text-white shadow-xs shadow-purple-500/40",
    title: "Corte & Barba",
    subtitle: "Marcos Benítez",
    badge: "Confirmado",
    badgeStyle: "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300",
    angle: 270,
    x: 0,
    y: 50, // 270° (Left)
  },
  {
    id: "notif-wallet",
    icon: Smartphone,
    iconBg: "bg-sky-500 text-white shadow-xs shadow-sky-500/40",
    title: "Tarjeta Fidelidad",
    subtitle: "Club VIP",
    badge: "+50 Pts",
    badgeStyle: "bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300",
    angle: 315,
    x: 14.64,
    y: 14.64, // 315° (Top Left)
  },
];

interface PhoneOrbitNotificationsProps {
  isMobile?: boolean;
  className?: string;
}

export default function PhoneOrbitNotifications({
  isMobile = false,
  className = "",
}: PhoneOrbitNotificationsProps) {
  // Desvanecimiento suave perimetral (radial):
  // Permite que las tarjetas se vean COMPLETAS y NÍTIDAS tanto a la izquierda como a la derecha del teléfono,
  // con un contenedor amplio que evita que las tarjetas se corten a la mitad en ningún lado.
  const radialMask: React.CSSProperties = isMobile
    ? {
        WebkitMaskImage:
          "radial-gradient(circle at center, black 65%, rgba(0,0,0,0.85) 80%, rgba(0,0,0,0.2) 93%, transparent 100%)",
        maskImage:
          "radial-gradient(circle at center, black 65%, rgba(0,0,0,0.85) 80%, rgba(0,0,0,0.2) 93%, transparent 100%)",
      }
    : {
        WebkitMaskImage:
          "radial-gradient(circle at center, black 72%, rgba(0,0,0,0.9) 85%, rgba(0,0,0,0.2) 96%, transparent 100%)",
        maskImage:
          "radial-gradient(circle at center, black 72%, rgba(0,0,0,0.9) 85%, rgba(0,0,0,0.2) 96%, transparent 100%)",
      };

  return (
    <div
      aria-hidden="true"
      className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none z-10 flex items-center justify-center ${
        isMobile
          ? "w-[460px] h-[460px] xs:w-[500px] xs:h-[500px] scale-[0.7] xs:scale-[0.8] sm:scale-95"
          : "w-[780px] h-[780px] lg:w-[840px] lg:h-[840px] scale-[0.8] lg:scale-100"
      } ${className}`}
    >
      {/* Resplandor suave centrado detrás del teléfono */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 sm:w-96 sm:h-96 rounded-full bg-gradient-to-tr from-[#FF4F2B]/15 via-amber-500/10 to-indigo-500/15 blur-3xl pointer-events-none -z-10" />

      {/* Contenedor amplio con desvanecimiento radial suave que no corta las tarjetas */}
      <div
        className="w-full h-full relative flex items-center justify-center"
        style={radialMask}
      >
        {/* =================================================================== */}
        {/* ÚNICO CÍRCULO CON TODAS LAS NOTIFICACIONES (.hero-orbit-big-circle)  */}
        {/* Dimensionado para envolver el teléfono y verse a la IZQUIERDA y DERECHA */}
        {/* =================================================================== */}
        <div
          className={`hero-orbit-big-circle relative rounded-full border-none flex items-center justify-center ${
            isMobile
              ? "w-[310px] h-[310px] xs:w-[340px] xs:h-[340px]"
              : "w-[520px] h-[520px] lg:w-[560px] lg:h-[560px]"
          }`}
        >
          {ORBIT_NOTIFICATIONS.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                className="absolute"
                style={{
                  left: `${item.x}%`,
                  top: `${item.y}%`,
                  // La tarjeta sigue la curvatura tangencial de la órbita (rotate(angle))
                  // y gira libremente con el círculo en 360° sin quedar verticalmente recta
                  transform: `translate(-50%, -50%) rotate(${item.angle}deg)`,
                }}
              >
                <div
                  className={`flex items-center rounded-full border border-slate-200/90 dark:border-white/15 bg-white/95 dark:bg-slate-900/95 shadow-md shadow-slate-950/5 dark:shadow-black/40 backdrop-blur-md whitespace-nowrap transition-transform ${
                    isMobile ? "gap-1.5 px-2.5 py-1" : "gap-2 px-3 py-1.5"
                  }`}
                >
                  <div
                    className={`shrink-0 flex items-center justify-center rounded-full ${
                      item.iconBg
                    } ${isMobile ? "h-4.5 w-4.5" : "h-6 w-6"}`}
                  >
                    <Icon className={isMobile ? "h-2.5 w-2.5" : "h-3.5 w-3.5"} />
                  </div>
                  <div className="flex flex-col text-left pr-0.5">
                    <span
                      className={`font-bold text-slate-900 dark:text-white leading-tight ${
                        isMobile ? "text-[9px]" : "text-[11px]"
                      }`}
                    >
                      {item.title}
                    </span>
                    <span
                      className={`font-medium text-slate-500 dark:text-slate-400 leading-none ${
                        isMobile ? "text-[7.5px]" : "text-[9px]"
                      }`}
                    >
                      {item.subtitle}
                    </span>
                  </div>
                  {item.badge && (
                    <span
                      className={`rounded-full font-extrabold ${item.badgeStyle} ${
                        isMobile ? "px-1.5 py-0.2 text-[7px]" : "px-2 py-0.5 text-[8.5px]"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
