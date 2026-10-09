"use client";

import React, { useEffect, useRef } from "react";
import {
  MessageCircle,
  Landmark,
  QrCode,
  BellRing,
  Coins,
  Link2,
  CalendarClock,
  Smartphone,
} from "lucide-react";

interface NotificationCardItem {
  id: string;
  icon: React.ElementType;
  iconBg: string;
  source: string;
  title: string;
  body: string;
}

// 8 notificaciones con el mismo diseño que el stack de móvil, viajando en arco
const ORBIT_PILLS: NotificationCardItem[] = [
  {
    id: "notif-whatsapp",
    icon: MessageCircle,
    iconBg: "bg-[#25D366]",
    source: "WhatsApp IA",
    title: "Nuevo turno agendado",
    body: "Martín · Corte y barba · Hoy 16:30",
  },
  {
    id: "notif-sena",
    icon: Landmark,
    iconBg: "bg-[#FF4F2B]",
    source: "Agendatepy",
    title: "Seña recibida",
    body: "Gs. 50.000 por transferencia",
  },
  {
    id: "notif-recordatorio",
    icon: BellRing,
    iconBg: "bg-amber-500",
    source: "Recordatorios",
    title: "Ana confirmó su turno",
    body: "Mañana 10:00 · Recordatorio 24 h",
  },
  {
    id: "notif-link",
    icon: Link2,
    iconBg: "bg-violet-500",
    source: "Link de reserva",
    title: "Reserva desde Instagram",
    body: "Diego · Limpieza dental · Vie 9:00",
  },
  {
    id: "notif-caja",
    icon: Coins,
    iconBg: "bg-indigo-500",
    source: "Caja",
    title: "Cierre del día listo",
    body: "14 turnos · Gs. 1.240.000",
  },
  {
    id: "notif-agenda",
    icon: CalendarClock,
    iconBg: "bg-blue-500",
    source: "Agenda",
    title: "Turno reprogramado",
    body: "Lucía pasó al jueves 18:00",
  },
  {
    id: "notif-qr",
    icon: QrCode,
    iconBg: "bg-fuchsia-500",
    source: "Cobros",
    title: "Cobro QR recibido",
    body: "Bancard · 0% de comisión",
  },
  {
    id: "notif-fidelidad",
    icon: Smartphone,
    iconBg: "bg-sky-500",
    source: "Fidelidad",
    title: "+50 puntos sumados",
    body: "Club VIP · Tarjeta digital",
  },
];

// Ancho fijo de cada notificación en el arco
const BASE_CARD_WIDTHS = Array(ORBIT_PILLS.length).fill(270);
const MOBILE_CARD_WIDTHS = [104, 110, 100, 102, 95, 95, 102, 98];

// Separación física libre deseada entre el borde de una tarjeta y la siguiente (constante)
const UNIFORM_EDGE_GAP = 48;

export default function HorizontalCardOrbit() {
  const rootRef = useRef<HTMLDivElement>(null);
  const isOnScreenRef = useRef(true);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const progressRef = useRef<number>(0);
  const animRef = useRef<number | null>(null);

  const isMobInit = typeof window !== "undefined" && window.innerWidth < 640;
  const widthsRef = useRef<number[]>([
    ...(isMobInit ? MOBILE_CARD_WIDTHS : BASE_CARD_WIDTHS),
  ]);

  // Parámetros de geometría del arco con mayor curvatura (círculo más cerrado y envolvente)
  const paramsRef = useRef({
    w: isMobInit ? 260 : 640,
    hDrop: isMobInit ? -48 : 210,
    yApex: isMobInit ? 6 : -12,
    speed: isMobInit ? 0.024 : 0.028,
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
      if (sw < 640) {
        // En móviles (< 640px): curva cóncava invertida desde arriba (U-shape), más pegadas entre sí
        paramsRef.current = {
          w: Math.min(sw * 0.72, 260),
          hDrop: -48,
          yApex: 6,
          speed: 0.024,
        };
      } else if (sw < 1024) {
        paramsRef.current = { w: 500, hDrop: 160, yApex: 4, speed: 0.028 };
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
      const isMobile = typeof window !== "undefined" && window.innerWidth < 640;
      const fallback = isMobile ? MOBILE_CARD_WIDTHS : BASE_CARD_WIDTHS;
      const measured = cardRefs.current.map((el, i) => {
        if (!el) return fallback[i];
        const inner = el.firstElementChild as HTMLElement;
        return inner ? inner.offsetWidth : fallback[i];
      });
      if (measured.every((w) => w > 40)) {
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

  useEffect(() => {
    const target = rootRef.current?.parentElement;
    if (!target) return;
    const observer = new IntersectionObserver(([entry]) => {
      isOnScreenRef.current = entry.isIntersecting;
    });
    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  // Bucle de animación ininterrumpido (nunca se detiene al posar o interactuar)
  useEffect(() => {
    const total = ORBIT_PILLS.length;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let lastTime = performance.now();
    let hasRendered = false;

    const loop = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      if (hasRendered && (!isOnScreenRef.current || document.hidden)) {
        animRef.current = requestAnimationFrame(loop);
        return;
      }
      hasRendered = true;

      // Movimiento continuo sin pausa por hover o selección
      const speed = reduceMotion ? 0 : paramsRef.current.speed;
      progressRef.current = (progressRef.current + dt * speed) % 1;

      const p = progressRef.current;
      const { w, hDrop, yApex } = paramsRef.current;
      const currentWidths = widthsRef.current;

      const isMobile = typeof window !== "undefined" && window.innerWidth < 640;
      const currentGap = isMobile ? 3 : UNIFORM_EDGE_GAP;

      // Cálculo de espaciado borde a borde constante basado en la silueta física real
      const centerDists: number[] = [];
      for (let i = 0; i < total; i++) {
        const next = (i + 1) % total;
        centerDists.push((currentWidths[i] + currentWidths[next]) / 2 + currentGap);
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
        const fadeLimit = isMobile ? 0.88 : 0.88;
        let opacity = 1;
        if (sMag > fadeLimit) {
          opacity = Math.max(0, 1 - (sMag - fadeLimit) / (isMobile ? 0.15 : 0.35));
        }

        // Profundidad: las tarjetas se achican al alejarse del ápice
        const depthScale = 1 - 0.12 * Math.min(sMag, 1);

        // GPU direct transform
        el.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) translate(-50%, -50%) rotate(${angleDeg.toFixed(2)}deg) scale(${depthScale.toFixed(3)})`;
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
    <div
      ref={rootRef}
      aria-hidden="true"
      className="absolute top-2 xs:top-3 sm:top-7 md:top-9 left-1/2 -translate-x-1/2 w-0 h-0 pointer-events-none select-none z-10 overflow-visible"
    >
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
            <div className="flex w-[270px] items-center gap-3 rounded-[18px] px-3 py-2.5 bg-white dark:bg-slate-900 shadow-[0_12px_32px_-10px_rgba(15,23,42,0.30)] dark:shadow-[0_12px_32px_-10px_rgba(0,0,0,0.6)]">
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[11px] text-white ${item.iconBg}`}
              >
                <Icon className="h-[18px] w-[18px]" strokeWidth={2.25} />
              </span>
              <div className="min-w-0 flex-1 text-left">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 truncate">
                    {item.source}
                  </span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 shrink-0">ahora</span>
                </div>
                <p className="text-[13px] font-bold text-slate-900 dark:text-white leading-tight truncate">
                  {item.title}
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-snug truncate tabular-nums">
                  {item.body}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
