"use client";

import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface ChannelTile {
  id: string;
  name: string;
  category: string;
  badge: string;
  className: string;
  icon: React.ReactNode;
}

const CHANNELS: ChannelTile[] = [
  {
    id: "whatsapp",
    name: "WhatsApp",
    category: "Mensajería",
    badge: "Bot 24/7",
    className: "tile-1",
    icon: (
      <svg viewBox="0 0 24 24" fill="#FAFAF7" className="w-7 h-7 sm:w-8 sm:h-8">
        <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.976.58 1.968.928 3.149.929 3.182 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.768-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.694.06-2.129-.533-1.636-.677-2.73-2.316-2.812-2.425-.082-.108-.669-.89-.669-1.697 0-.807.423-1.205.574-1.368.151-.163.329-.204.439-.204.11 0 .219.002.315.006.101.004.237-.038.37.283.138.334.47 1.144.512 1.228.041.085.069.184.013.295-.056.111-.084.18-.167.278-.083.098-.175.219-.25.295-.083.083-.17.172-.073.338.097.165.433.714.929 1.155.638.567 1.176.743 1.342.825.166.083.263.073.361-.039.098-.112.42-.489.532-.656.113-.167.227-.139.38-.083.153.056.97.457 1.137.539.167.082.278.123.319.192.041.07.041.405-.103.81z" />
      </svg>
    ),
  },
  {
    id: "instagram",
    name: "Instagram",
    category: "Redes",
    badge: "Direct & Bio",
    className: "tile-2",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="#FAFAF7"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-6 h-6 sm:w-7 sm:h-7"
      >
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
      </svg>
    ),
  },
  {
    id: "messenger",
    name: "Messenger",
    category: "Meta Inbox",
    badge: "Sincronizado",
    className: "tile-3",
    icon: (
      <svg viewBox="0 0 24 24" fill="#FAFAF7" className="w-6 h-6 sm:w-7 sm:h-7">
        <path d="M12 2C6.477 2 2 6.145 2 11.258c0 2.91 1.455 5.513 3.735 7.202V22l3.39-1.86c.915.254 1.884.39 2.875.39 5.523 0 10-4.145 10-9.258C22 6.145 17.523 2 12 2zm1.066 12.463l-2.56-2.73-4.996 2.73 5.498-5.836 2.624 2.73 4.932-2.73-5.498 5.836z" />
      </svg>
    ),
  },
  {
    id: "portal",
    name: "Portal Web",
    category: "Autogestión",
    badge: "Link en Bio",
    className: "tile-4",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="#FAFAF7"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-6 h-6 sm:w-7 sm:h-7"
      >
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
      </svg>
    ),
  },
  {
    id: "calendar",
    name: "Google Calendar",
    category: "Agenda",
    badge: "En Vivo",
    className: "tile-5",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="#FAFAF7"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-6 h-6 sm:w-7 sm:h-7"
      >
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  },
  {
    id: "bancard",
    name: "Cobro QR & Señas",
    category: "Finanzas",
    badge: "SIPAP / Bancard",
    className: "tile-6",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="#FAFAF7"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-6 h-6 sm:w-7 sm:h-7"
      >
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
        <path d="M10 7h4v4h-4z" />
      </svg>
    ),
  },
];

export default function AutomatedHubDiagram() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeChannel, setActiveChannel] = useState<ChannelTile | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      // Estado Inicial
      gsap.set(".hub-ring", { transformOrigin: "400px 250px", scale: 0, opacity: 0 });
      gsap.set(".hub-brain", { scale: 0, opacity: 0 });
      gsap.set(".hub-icon-tile", { scale: 0, opacity: 0 });
      gsap.set(".hub-link", { strokeDashoffset: 600 });
      gsap.set(".hub-pointer", { scale: 0, opacity: 0, rotation: -20 });
      gsap.set(".hub-tagline", { opacity: 0, y: 10 });

      // Intro Timeline disparada con ScrollTrigger
      const intro = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 80%",
        },
        defaults: { ease: "power3.out" },
      });

      intro
        .to(
          ".hub-ring",
          {
            scale: 1,
            opacity: 1,
            duration: 1.4,
            stagger: 0.12,
            ease: "power3.out",
          },
          0.1
        )
        .to(
          ".hub-brain",
          {
            scale: 1,
            opacity: 1,
            duration: 1.1,
            ease: "back.out(1.8)",
          },
          0.3
        )
        .from(
          ".hub-icon-tile",
          {
            y: (i: number) => (i % 2 === 0 ? -60 : 60),
            x: (i: number) => (i < 3 ? -40 : 40),
            duration: 1,
            ease: "back.out(1.6)",
          },
          0.7
        )
        .to(
          ".hub-icon-tile",
          {
            scale: 1,
            opacity: 1,
            duration: 1,
            stagger: 0.07,
            ease: "back.out(1.6)",
          },
          0.7
        )
        .to(
          ".hub-link",
          {
            strokeDashoffset: 0,
            duration: 1.2,
            stagger: 0.08,
            ease: "power2.inOut",
          },
          1.0
        )
        .to(
          ".hub-pointer",
          {
            scale: 1,
            opacity: 1,
            rotation: 0,
            duration: 0.7,
            ease: "back.out(1.6)",
          },
          1.5
        )
        .to(".hub-tagline", { opacity: 1, y: 0, duration: 0.8 }, 1.7);

      // Movimiento continuo: Cerebro flotando
      gsap.to(".hub-brain", {
        y: "+=8",
        rotation: "+=3",
        duration: 3,
        delay: 2,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
      });

      // Sonar pulse continuo en los anillos concéntricos
      [1, 2, 3, 4].forEach((num, i) => {
        gsap.to(`.ring-${num}`, {
          attr: { r: 60 + i * 50 + 8 },
          opacity: 0.38,
          duration: 2.2,
          delay: 2 + i * 0.5,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
        });
      });

      // Pointer wiggle periódico
      const pointerTween = () => {
        gsap
          .timeline()
          .to(".hub-pointer", { rotation: -15, duration: 0.2, ease: "power2.out" })
          .to(".hub-pointer", { rotation: 0, duration: 0.6, ease: "elastic.out(1.2, 0.4)" })
          .to(".hub-pointer", { rotation: -15, duration: 0.2, delay: 0.2, ease: "power2.out" })
          .to(".hub-pointer", { rotation: 0, duration: 0.6, ease: "elastic.out(1.2, 0.4)" });
      };
      const pointerInterval = setInterval(pointerTween, 4500);

      // Mouse Parallax interactivo sobre el diagrama
      const diagram = containerRef.current?.querySelector(".hub-diagram");
      const tiles = containerRef.current?.querySelectorAll(".hub-icon-tile");
      const brain = containerRef.current?.querySelector(".hub-brain");

      let mx = 0,
        my = 0,
        tx = 0,
        ty = 0;
      let animId: number;

      const handleMouseMove = (e: MouseEvent) => {
        if (!diagram) return;
        const r = diagram.getBoundingClientRect();
        mx = ((e.clientX - r.left) / r.width - 0.5) * 2;
        my = ((e.clientY - r.top) / r.height - 0.5) * 2;
      };

      const handleMouseLeave = () => {
        mx = 0;
        my = 0;
      };

      diagram?.addEventListener("mousemove", handleMouseMove as EventListener);
      diagram?.addEventListener("mouseleave", handleMouseLeave as EventListener);

      const renderParallax = () => {
        tx += (mx - tx) * 0.06;
        ty += (my - ty) * 0.06;
        tiles?.forEach((tile, i) => {
          const depth = 6 + (i % 3) * 3;
          (tile as HTMLElement).style.translate = `${tx * depth}px ${ty * depth}px`;
        });
        if (brain) {
          (brain as HTMLElement).style.translate = `${tx * 4}px ${ty * 4}px`;
        }
        animId = requestAnimationFrame(renderParallax);
      };
      renderParallax();

      // Efecto 3D Tilt y feedback táctil en cada tarjeta
      tiles?.forEach((tile) => {
        const onTileMove = (e: MouseEvent) => {
          const r = (tile as HTMLElement).getBoundingClientRect();
          const px = (e.clientX - r.left) / r.width - 0.5;
          const py = (e.clientY - r.top) / r.height - 0.5;
          gsap.to(tile, {
            rotateX: -py * 20,
            rotateY: px * 20,
            scale: 1.15,
            duration: 0.35,
            ease: "power2.out",
            transformPerspective: 600,
            overwrite: "auto",
          });
        };

        const onTileLeave = () => {
          gsap.to(tile, {
            rotateX: 0,
            rotateY: 0,
            scale: 1,
            duration: 0.7,
            ease: "elastic.out(1, 0.6)",
            overwrite: "auto",
          });
        };

        const onTileClick = () => {
          gsap.fromTo(
            tile,
            { scale: 1.15 },
            { scale: 0.92, duration: 0.1, yoyo: true, repeat: 1, ease: "power2.inOut" }
          );
        };

        tile.addEventListener("mousemove", onTileMove as EventListener);
        tile.addEventListener("mouseleave", onTileLeave as EventListener);
        tile.addEventListener("click", onTileClick as EventListener);
      });

      // Clic en el cerebro: emite una onda expansiva de sonar
      if (brain) {
        brain.addEventListener("click", () => {
          gsap.fromTo(
            brain,
            { scale: 1.25 },
            { scale: 1, duration: 0.6, ease: "elastic.out(1, 0.5)" }
          );
          const rings = containerRef.current?.querySelectorAll(".hub-ring");
          rings?.forEach((ring, i) => {
            const baseR = 60 + i * 50;
            gsap
              .timeline()
              .to(ring, {
                attr: { r: baseR + 32 },
                opacity: 0,
                duration: 0.8,
                ease: "power2.out",
              })
              .to(ring, {
                attr: { r: baseR },
                opacity: 0.25,
                duration: 0.4,
                ease: "power2.in",
              });
          });
        });
      }

      return () => {
        clearInterval(pointerInterval);
        cancelAnimationFrame(animId);
        diagram?.removeEventListener("mousemove", handleMouseMove as EventListener);
        diagram?.removeEventListener("mouseleave", handleMouseLeave as EventListener);
      };
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="w-full flex flex-col items-center select-none py-2 relative">
      {/* Indicador interactivo dinámico al hacer hover */}
      <div className="h-8 flex items-center justify-center mb-1">
        {activeChannel ? (
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/90 dark:bg-white/95 text-white dark:text-slate-900 text-xs font-bold shadow-md animate-in fade-in zoom-in-95 duration-200">
            <span className="w-2 h-2 rounded-full bg-[#FF4F2B] animate-pulse" />
            <span>{activeChannel.name}</span>
            <span className="text-slate-400 dark:text-slate-500 font-normal">·</span>
            <span className="text-[11px] font-medium opacity-80">{activeChannel.badge}</span>
          </div>
        ) : (
          <div className="text-[11px] tracking-wider uppercase font-semibold text-slate-400 dark:text-slate-500">
            Conectá todos tus canales a un cerebro central
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* EL DIAGRAMA HUB & SPOKE CON RINGS, BRAIN Y 6 TILES FLOTANTES     */}
      {/* ============================================================== */}
      <div className="hub-diagram relative w-full max-w-[820px] aspect-[1.6/1] max-sm:aspect-[1/1.05] mx-auto my-3">
        {/* SVG de fondo con anillos concéntricos y líneas curvas conectadas */}
        <svg
          className="hub-bg absolute inset-0 w-full h-full overflow-visible pointer-events-none"
          viewBox="0 0 800 500"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Anillos concéntricos de pulso radar */}
          <circle className="hub-ring ring-1" cx="400" cy="250" r="60" />
          <circle className="hub-ring ring-2" cx="400" cy="250" r="110" />
          <circle className="hub-ring ring-3" cx="400" cy="250" r="160" />
          <circle className="hub-ring ring-4" cx="400" cy="250" r="210" />

          {/* Líneas conectoras que fluyen de cada tile hacia el centro */}
          <path className="hub-link link-1" id="link-1" d="M 140 75 Q 250 170, 395 247" />
          <path className="hub-link link-2" id="link-2" d="M 660 75 Q 545 170, 405 247" />
          <path className="hub-link link-3" id="link-3" d="M 80 270 Q 230 258, 388 250" />
          <path className="hub-link link-4" id="link-4" d="M 720 270 Q 570 258, 412 250" />
          <path className="hub-link link-5" id="link-5" d="M 140 425 Q 250 335, 395 253" />
          <path className="hub-link link-6" id="link-6" d="M 660 425 Q 545 335, 405 253" />
        </svg>

        {/* Cerebro Central interactivo */}
        <div
          className="hub-brain absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[70px] sm:text-[84px] leading-none z-10 cursor-pointer select-none will-change-transform"
          title="Hacé clic para enviar un pulso"
          style={{
            filter:
              "drop-shadow(0 14px 22px rgba(255, 79, 43, 0.35)) drop-shadow(0 4px 6px rgba(40, 10, 20, 0.25))",
          }}
        >
          🧠
        </div>

        {/* 6 Icon Tiles alrededor del cerebro */}
        {CHANNELS.map((ch) => (
          <div
            key={ch.id}
            className={`hub-icon-tile ${ch.className}`}
            data-name={ch.name}
            onMouseEnter={() => setActiveChannel(ch)}
            onMouseLeave={() => setActiveChannel(null)}
          >
            {ch.icon}
          </div>
        ))}
      </div>

      {/* Puntero reactivo con animación elástica */}
      <div className="hub-pointer text-3xl sm:text-4xl my-2 cursor-pointer select-none drop-shadow-md">
        👉
      </div>

      {/* Tagline con espaciado amplio estilo editorial */}
      <div className="hub-tagline text-[11px] sm:text-xs tracking-[0.38em] text-slate-500 dark:text-slate-400 font-bold uppercase mt-2">
        A&nbsp;U&nbsp;T&nbsp;O&nbsp;M&nbsp;A&nbsp;T&nbsp;I&nbsp;Z&nbsp;A&nbsp;C&nbsp;I&nbsp;Ó&nbsp;N<span className="inline-block w-4 sm:w-6" />2&nbsp;4&nbsp;/&nbsp;7
      </div>

      {/* Estilos CSS Scoped para mantener la fidelidad visual idéntica al diseño */}
      <style jsx>{`
        .hub-ring {
          fill: rgba(60, 60, 64, 0.035);
          stroke: rgba(60, 60, 64, 0.07);
          stroke-width: 1.2;
        }
        :global(.dark) .hub-ring {
          fill: rgba(255, 255, 255, 0.02);
          stroke: rgba(255, 255, 255, 0.08);
        }

        .hub-link {
          fill: none;
          stroke: rgba(20, 20, 22, 0.45);
          stroke-width: 1.4;
          stroke-linecap: round;
          stroke-dasharray: 600;
          stroke-dashoffset: 600;
        }
        :global(.dark) .hub-link {
          stroke: rgba(255, 255, 255, 0.35);
        }

        .hub-icon-tile {
          position: absolute;
          width: 70px;
          height: 70px;
          border-radius: 18px;
          background: #0e0e11;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fafaf7;
          box-shadow: 0 24px 40px -16px rgba(0, 0, 0, 0.5),
            0 10px 20px -6px rgba(0, 0, 0, 0.32),
            0 3px 6px -1px rgba(0, 0, 0, 0.18),
            inset 0 2px 0 rgba(255, 255, 255, 0.14),
            inset 0 -3px 6px rgba(0, 0, 0, 0.5);
          cursor: pointer;
          z-index: 10;
          transition: box-shadow 0.5s cubic-bezier(0.6, 0, 0.2, 1);
          will-change: transform;
        }

        .hub-icon-tile::after {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(
            155deg,
            rgba(255, 255, 255, 0.14) 0%,
            transparent 35%,
            transparent 70%,
            rgba(0, 0, 0, 0.3) 100%
          );
          pointer-events: none;
          border-radius: inherit;
        }

        .hub-icon-tile:hover {
          box-shadow: 0 32px 50px -16px rgba(0, 0, 0, 0.6),
            0 14px 26px -6px rgba(0, 0, 0, 0.38),
            0 4px 8px -1px rgba(0, 0, 0, 0.2),
            inset 0 2px 0 rgba(255, 255, 255, 0.2),
            inset 0 -3px 6px rgba(0, 0, 0, 0.5);
        }

        /* Posiciones absolutas de los 6 tiles */
        .tile-1 {
          left: 12%;
          top: 8%;
        }
        .tile-2 {
          right: 12%;
          top: 8%;
        }
        .tile-3 {
          left: 4%;
          top: 46%;
        }
        .tile-4 {
          right: 4%;
          top: 46%;
        }
        .tile-5 {
          left: 12%;
          bottom: 8%;
        }
        .tile-6 {
          right: 12%;
          bottom: 8%;
        }

        @media (max-width: 900px) {
          .hub-icon-tile {
            width: 56px;
            height: 56px;
            border-radius: 15px;
          }
        }

        @media (max-width: 600px) {
          .tile-1,
          .tile-2 {
            top: 2%;
          }
          .tile-3,
          .tile-4 {
            top: 44%;
          }
          .tile-5,
          .tile-6 {
            bottom: 2%;
          }
          .hub-icon-tile {
            width: 48px;
            height: 48px;
            border-radius: 13px;
          }
          .hub-brain {
            font-size: 52px !important;
          }
        }
      `}</style>
    </div>
  );
}
