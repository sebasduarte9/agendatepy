"use client";

import React from "react";

interface BrandLogoProps {
  variant?: "icon" | "horizontal" | "full";
  className?: string;
  iconClassName?: string;
  badge?: string;
  showText?: boolean;
}

const OFFICIAL_LOGO_PATH =
  "M305.11 882.3c-42.76 0-79.63-23.6-97.32-58.99-16.22-30.96-14.75-64.88-1.48-97.32l224.14-529.36c20.64-48.66 66.35-79.63 119.44-79.63h100.27c53.08 0 98.79 30.97 119.44 79.63l224.13 529.36c13.27 32.44 14.74 66.36-1.48 97.32-17.69 35.39-54.55 58.99-97.32 58.99-48.66 0-88.47-29.5-106.17-72.26l-64.88-160.72h-247.72l-64.88 160.72c-17.7 42.76-57.51 72.26-106.17 72.26z M 448.62 466.32 L 523.56 466.32 L 600.02 301.32 L 676.48 466.32 L 749.43 466.32 A 91.5 91.5 0 0 1 749.43 649.32 L 448.62 649.32 A 91.5 91.5 0 0 1 448.62 466.32 Z M 448.62 484.32 L 749.43 484.32 A 73.575 73.575 0 0 1 749.43 631.47 L 448.62 631.47 A 73.575 73.575 0 0 1 448.62 484.32 Z M753.27 616.14c-32.01 0-57.88-25.87-57.88-57.88 0-32 25.87-57.88 57.88-57.88 32.01 0 57.88 25.88 57.88 57.88 0 32.01-25.87 57.88-57.88 57.88z";

/**
 * Logotipo e Isotipo Oficial de AgendatePY
 * Isotipo: Letra A redondeada en #FF4F2B con switch/toggle integrado.
 * Tipografía del nombre a lado del logo: Coolvetica.
 */
export default function BrandLogo({
  variant = "horizontal",
  className = "",
  iconClassName = "h-8 w-8",
  badge,
  showText = true,
}: BrandLogoProps) {
  // Símbolo / Isotipo oficial
  const renderIsotype = () => (
    <svg
      viewBox="160 90 880 810"
      className={iconClassName}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="AgendatePY Icon"
    >
      <path
        fill="#FF4F2B"
        fillRule="evenodd"
        d={OFFICIAL_LOGO_PATH}
      />
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
        <title id="brandTitle">AgendatePY logo</title>
        <desc id="brandDesc">
          A redondeada naranja con switch de automatización y nombre en Coolvetica.
        </desc>

        <g transform="translate(0, -60)">
          <path
            fill="#FF4F2B"
            fillRule="evenodd"
            d={OFFICIAL_LOGO_PATH}
          />
        </g>

        <text
          x="600"
          y="880"
          textAnchor="middle"
          className="font-coolvetica"
          style={{ fontFamily: "var(--font-coolvetica), Coolvetica, sans-serif" }}
          fontSize="115"
          letterSpacing="-1"
          fill="currentColor"
        >
          Agendate<tspan fill="#FF4F2B">PY</tspan>
        </text>
      </svg>
    );
  }

  // Variante: Horizontal Navbar Lockup (Isotipo a la izquierda + Wordmark en Coolvetica a la derecha)
  return (
    <div className={`flex items-center gap-2 xs:gap-2.5 shrink-0 ${className}`}>
      <div className="relative flex items-center justify-center shrink-0">
        {renderIsotype()}
        {badge && (
          <span className="absolute -top-1 -right-1 rounded-full bg-[#FF4F2B] px-1 py-0.2 text-[8px] font-black text-white uppercase">
            {badge}
          </span>
        )}
      </div>

      {showText && (
        <div className="flex items-center">
          <span
            className="font-coolvetica text-xl sm:text-2xl text-slate-900 dark:text-white leading-none tracking-normal select-none"
            style={{ fontFamily: "var(--font-coolvetica), Coolvetica, sans-serif" }}
          >
            Agendate<span className="text-[#FF4F2B]">PY</span>
          </span>
        </div>
      )}
    </div>
  );
}
