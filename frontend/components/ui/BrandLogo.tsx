"use client";

import React from "react";

interface BrandLogoProps {
  variant?: "icon" | "horizontal" | "full";
  className?: string;
  iconClassName?: string;
  badge?: string;
}

/**
 * Logotipo e Isotipo Oficial de Agendatepy
 * Isotipo: Letra A redondeada en #FF4F2B con switch/toggle de automatización blanco.
 * Wordmark: "agendatepy" en minúsculas con tracking ajustado.
 */
export default function BrandLogo({
  variant = "horizontal",
  className = "",
  iconClassName = "h-9 w-9",
  badge,
}: BrandLogoProps) {
  // Símbolo / Isotipo solo (A con toggle)
  const renderIsotype = () => (
    <svg
      viewBox="70 50 585 550"
      className={iconClassName}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Agendatepy Icon"
    >
      {/* Rounded A */}
      <path
        d="M165 585
           C136 585 111 569 99 545
           C88 524 89 501 98 479
           L250 120
           C264 87 295 66 331 66
           L399 66
           C435 66 466 87 480 120
           L632 479
           C641 501 642 524 631 545
           C619 569 594 585 565 585
           C532 585 505 565 493 536
           L449 427
           L281 427
           L237 536
           C225 565 198 585 165 585 Z"
        fill="#FF4F2B"
      />

      {/* Inner triangular cutout */}
      <path d="M365 191 L327 273 L403 273 Z" fill="#FFFFFF" />

      {/* Toggle outline */}
      <rect
        x="203"
        y="270"
        width="316"
        height="112"
        rx="56"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="17"
      />

      {/* Toggle knob */}
      <circle cx="443" cy="326" r="45" fill="#FFFFFF" />
    </svg>
  );

  // Variante: Solo ícono
  if (variant === "icon") {
    return (
      <div className={`relative shrink-0 flex items-center justify-center ${className}`}>
        {renderIsotype()}
        {badge && (
          <span className="absolute -top-1 -right-1 rounded-full bg-[#FF4F2B] px-1 py-0.2 text-[8px] font-black text-white uppercase">
            {badge}
          </span>
        )}
      </div>
    );
  }

  // Variante: Stack Completo Original (1200x1000)
  if (variant === "full") {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1200 1000"
        className={className}
        role="img"
        aria-labelledby="brandTitle brandDesc"
      >
        <title id="brandTitle">Agendatepy logo</title>
        <desc id="brandDesc">
          Orange rounded A with a white automation toggle and dark agendatepy wordmark.
        </desc>

        {/* Isotipo */}
        <g transform="translate(270 85)">
          <path
            d="M165 585
               C136 585 111 569 99 545
               C88 524 89 501 98 479
               L250 120
               C264 87 295 66 331 66
               L399 66
               C435 66 466 87 480 120
               L632 479
               C641 501 642 524 631 545
               C619 569 594 585 565 585
               C532 585 505 565 493 536
               L449 427
               L281 427
               L237 536
               C225 565 198 585 165 585 Z"
            fill="#FF4F2B"
          />
          <path d="M365 191 L327 273 L403 273 Z" fill="#FFFFFF" />
          <rect
            x="203"
            y="270"
            width="316"
            height="112"
            rx="56"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="17"
          />
          <circle cx="443" cy="326" r="45" fill="#FFFFFF" />
        </g>

        {/* Wordmark */}
        <text
          x="600"
          y="820"
          textAnchor="middle"
          fontFamily="Inter, Poppins, Montserrat, Arial, Helvetica, sans-serif"
          fontSize="108"
          fontWeight="750"
          letterSpacing="-4"
          fill="currentColor"
        >
          agendatepy
        </text>
      </svg>
    );
  }

  // Variante: Horizontal Navbar Lockup (Isotipo a la izquierda + Wordmark a la derecha)
  return (
    <div className={`flex items-center gap-2.5 shrink-0 ${className}`}>
      <div className="relative flex items-center justify-center shrink-0">
        {renderIsotype()}
      </div>

      <div className="flex items-center gap-1.5 font-bold tracking-tight">
        <span className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-none">
          agendate<span className="text-[#FF4F2B]">py</span>
        </span>
        {badge && (
          <span className="rounded-full bg-orange-100 dark:bg-orange-950/80 border border-orange-500/20 px-1.5 py-0.5 text-[9px] font-black text-[#FF4F2B] uppercase">
            {badge}
          </span>
        )}
      </div>
    </div>
  );
}
