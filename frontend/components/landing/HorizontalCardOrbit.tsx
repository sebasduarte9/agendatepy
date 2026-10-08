"use client";

import React, { useEffect, useRef } from "react";
import {
  CheckCircle2,
  Landmark,
  QrCode,
  Bell,
  Coins,
  Calendar,
  Scissors,
  Smartphone,
} from "lucide-react";

interface NotificationCardItem {
  id: string;
  icon: React.ElementType;
  iconBg: string;
  title: string;
  subtitle: string;
  badge?: string;
  badgeStyle?: string;
}

// 8 Píldoras de notificación que viajan en arco envolvente
const ORBIT_PILLS: NotificationCardItem[] = [
  {
    id: "notif-reserva",
    icon: CheckCircle2,
    iconBg: "bg-emerald-500 text-white shadow-xs shadow-emerald-500/40",
    title: "Turno Confirmado",
    subtitle: "WhatsApp Bot",
    badge: "15:30 hs",
    badgeStyle: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  },
  {
    id: "notif-sena",
    icon: Landmark,
    iconBg: "bg-[#FF4F2B] text-white shadow-xs shadow-[#FF4F2B]/40",
    title: "Seña Recibida",
    subtitle: "Transferencia Verificada",
    badge: "Gs. 80.000",
    badgeStyle: "bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300",
  },
  {
    id: "notif-qr",
    icon: QrCode,
    iconBg: "bg-violet-500 text-white shadow-xs shadow-violet-500/40",
    title: "Cobro QR Listo",
    subtitle: "Bancard / Dinelco",
    badge: "0% Com.",
    badgeStyle: "bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-300",
  },
  {
    id: "notif-recordatorio",
    icon: Bell,
    iconBg: "bg-amber-500 text-white shadow-xs shadow-amber-500/40",
    title: "Recordatorio 2h",
    subtitle: "Anti-ausencias",
    badge: "Sin faltas",
    badgeStyle: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  },
  {
    id: "notif-caja",
    icon: Coins,
    iconBg: "bg-indigo-500 text-white shadow-xs shadow-indigo-500/40",
    title: "Arqueo de Caja",
    subtitle: "Cierre Diario",
    badge: "Cuadrado",
    badgeStyle: "bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300",
  },
  {
    id: "notif-gcal",
    icon: Calendar,
    iconBg: "bg-blue-500 text-white shadow-xs shadow-blue-500/40",
    title: "Google Sync",
    subtitle: "Calendar en vivo",
    badge: "Sync OK",
    badgeStyle: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
  },
  {
    id: "notif-corte",
    icon: Scissors,
    iconBg: "bg-purple-500 text-white shadow-xs shadow-purple-500/40",
    title: "Corte & Barba",
    subtitle: "Marcos Benítez",
    badge: "Confirmado",
    badgeStyle: "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300",
  },
  {
    id: "notif-wallet",
    icon: Smartphone,
    iconBg: "bg-sky-500 text-white shadow-xs shadow-sky-500/40",
    title: "Tarjeta Fidelidad",
    subtitle: "Club VIP",
    badge: "+50 Pts",
    badgeStyle: "bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300",
  },
];

// Anchos base calibrados por forma para cada una de las 8 tarjetas
const BASE_CARD_WIDTHS = [216, 222, 210, 212, 200, 200, 212, 208];

// Separación física libre deseada entre el borde de una tarjeta y la siguiente (constante)
const UNIFORM_EDGE_GAP = 48;

export default function HorizontalCardOrbit() {
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const progressRef = useRef<number>(0);
  const animRef = useRef<number | null>(null);

  const widthsRef = useRef<number[]>([...BASE_CARD_WIDTHS]);

  // Parámetros de geometría del arco con mayor curvatura (círculo más cerrado y envolvente)
  const paramsRef = useRef({
    w: 640, // Ancho más ceñido para pronunciar la curvatura
    hDrop: 210, // Mayor caída para formar un arco circular más definido
    yApex: -12, // Cúspide que corona en la parte alta
    speed: 0.028, // Movimiento ininterrumpido fluido y constante
  });

  // Longitud de arco euclídea precalculada desde el ápice (s = 0)
  const arcLUTRef = useRef<{ dTable: number[]; sTable: number[] }>({
    dTable: [0],
    sTable: [0],
  });

  // Recomputar tabla euclídea exacta desde el centro hacia los extremos
  const computeArcLUT = () => {
    const { w, hDrop } = paramsRef.current;
    const M = 2000;
    const sMax = 1.6;
    const sTable: number[] = [0];
    const dTable: number[] = [0];
    let cumD = 0;

    for (let k = 1; k <= M; k++) {
      const sPrev = ((k - 1) * sMax) / M;
      const sCurr = (k * sMax) / M;
      const x1 = sPrev * w;
      const y1 = sPrev * sPrev * hDrop;
      const x2 = sCurr * w;
      const y2 = sCurr * sCurr * hDrop;
      cumD += Math.hypot(x2 - x1, y2 - y1);
      sTable.push(sCurr);
      dTable.push(cumD);
    }

    arcLUTRef.current = { dTable, sTable };
  };

  useEffect(() => {
    const handleResize = () => {
      const sw = window.innerWidth;
      if (sw < 1024) {
        paramsRef.current = { w: 520, hDrop: 180, yApex: 4, speed: 0.028 };
      } else if (sw < 1280) {
        paramsRef.current = { w: 580, hDrop: 195, yApex: 5, speed: 0.028 };
      } else {
        paramsRef.current = { w: 640, hDrop: 210, yApex: 6, speed: 0.028 };
      }
      computeArcLUT();
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Medir anchos reales de las tarjetas en el DOM tras renderizado de fuentes
  useEffect(() => {
    const measure = () => {
      const measured = cardRefs.current.map((el, i) => {
        if (!el) return BASE_CARD_WIDTHS[i];
        const inner = el.firstElementChild as HTMLElement;
        return inner ? inner.offsetWidth : BASE_CARD_WIDTHS[i];
      });
      if (measured.every((w) => w > 100)) {
        widthsRef.current = measured;
      }
    };
    const timer = setTimeout(measure, 150);
    return () => clearTimeout(timer);
  }, []);

  // Interpolación binaria exacta para convertir distancia euclídea a parámetro s
  const getSFromArcDistance = (dAbs: number) => {
    const { dTable, sTable } = arcLUTRef.current;
    const M = dTable.length - 1;

    let low = 0;
    let high = M;
    while (low < high) {
      const mid = (low + high) >> 1;
      if (dTable[mid] < dAbs) low = mid + 1;
      else high = mid;
    }

    const i1 = Math.max(0, low - 1);
    const i2 = low;
    const span = dTable[i2] - dTable[i1];
    const frac = span > 0 ? (dAbs - dTable[i1]) / span : 0;
    return sTable[i1] + frac * (sTable[i2] - sTable[i1]);
  };

  // Bucle de animación ininterrumpido (nunca se detiene al posar o interactuar)
  useEffect(() => {
    const total = ORBIT_PILLS.length;
    let lastTime = performance.now();

    const loop = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      // Movimiento continuo sin pausa por hover o selección
      progressRef.current = (progressRef.current + dt * paramsRef.current.speed) % 1;

      const p = progressRef.current;
      const { w, hDrop, yApex } = paramsRef.current;
      const currentWidths = widthsRef.current;

      // Cálculo de espaciado borde a borde constante basado en la silueta física real
      const centerDists: number[] = [];
      for (let i = 0; i < total; i++) {
        const next = (i + 1) % total;
        centerDists.push((currentWidths[i] + currentWidths[next]) / 2 + UNIFORM_EDGE_GAP);
      }

      // Longitud del ciclo cerrado
      const loopLen = centerDists.reduce((acc, d) => acc + d, 0);

      // Desplazamientos acumulativos de centro
      const centerOffsets: number[] = [0];
      for (let i = 0; i < total - 1; i++) {
        centerOffsets.push(centerOffsets[i] + centerDists[i]);
      }

      for (let i = 0; i < total; i++) {
        const el = cardRefs.current[i];
        if (!el) continue;

        // Distancia sobre el ciclo continuo
        const rawDist = ((p * loopLen + centerOffsets[i]) % loopLen + loopLen) % loopLen;

        // Centrar respecto al ápice del arco [-loopLen / 2, +loopLen / 2)
        let dFromApex = rawDist;
        if (dFromApex > loopLen / 2) {
          dFromApex -= loopLen;
        }

        const sign = dFromApex >= 0 ? 1 : -1;
        const sMag = getSFromArcDistance(Math.abs(dFromApex));
        const s = sign * sMag;

        const x = s * w;
        const y = yApex + s * s * hDrop;
        const slope = (2 * s * hDrop) / w;
        const angleDeg = Math.atan(slope) * (180 / Math.PI);

        // Desvanecimiento suave en los extremos exteriores
        let opacity = 1;
        if (sMag > 0.88) {
          opacity = Math.max(0, 1 - (sMag - 0.88) / 0.35);
        }

        // GPU direct transform
        el.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) translate(-50%, -50%) rotate(${angleDeg.toFixed(2)}deg)`;
        el.style.opacity = opacity.toFixed(3);
      }

      animRef.current = requestAnimationFrame(loop);
    };

    animRef.current = requestAnimationFrame(loop);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, []);

  return (
    <div className="absolute top-4 sm:top-5 md:top-6 left-1/2 -translate-x-1/2 w-0 h-0 pointer-events-none select-none z-10 overflow-visible">
      {/* 8 Cards con curvatura pronunciada y movimiento continuo sin freno */}
      {ORBIT_PILLS.map((item, idx) => {
        const Icon = item.icon;

        return (
          <div
            key={item.id}
            ref={(el) => {
              cardRefs.current[idx] = el;
            }}
            className="absolute left-0 top-0 pointer-events-auto will-change-transform select-none"
            style={{
              transform: "translate3d(0, -9999px, 0)",
              opacity: 0,
              zIndex: 30,
            }}
          >
            <div className="group flex items-center gap-2 xs:gap-2.5 rounded-full py-1.5 pl-1.5 pr-3 cursor-pointer bg-white/98 dark:bg-slate-900/98 border border-slate-200/90 dark:border-white/10 shadow-md shadow-slate-900/10 dark:shadow-black/50 transition-all duration-150 hover:border-[#FF4F2B] hover:shadow-xl hover:shadow-[#FF4F2B]/20">
              <div
                className={`flex h-7 w-7 xs:h-8 xs:w-8 items-center justify-center rounded-full shrink-0 transition-transform duration-150 ${item.iconBg} group-hover:scale-105`}
              >
                <Icon className="h-3.5 w-3.5 xs:h-4 xs:w-4" />
              </div>
              <div className="flex flex-col text-left whitespace-nowrap">
                <span className="text-[11px] xs:text-xs font-bold text-slate-900 dark:text-white leading-tight">
                  {item.title}
                </span>
                <span className="text-[9px] xs:text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                  {item.subtitle}
                </span>
              </div>
              {item.badge && (
                <span
                  className={`rounded-full px-2 py-0.5 text-[8.5px] xs:text-[9px] font-bold shrink-0 ml-0.5 whitespace-nowrap ${item.badgeStyle}`}
                >
                  {item.badge}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
