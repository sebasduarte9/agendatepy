"use client";

import React, { useId } from "react";
import Link from "next/link";
import { OFFICIAL_LOGO_PATH } from "./BrandLogo";

interface LiquidLogoProps {
  size?: number | string;
  className?: string;
  href?: string;
  primaryColor?: string;
  title?: string;
}

export default function LiquidLogo({
  size = 38,
  className = "",
  href = "/dashboard",
  primaryColor,
  title = "Agendatepy",
}: LiquidLogoProps) {
  const uniqueId = useId().replace(/:/g, "");
  const gradId = `liquid-grad-${uniqueId}`;
  const sheenId = `liquid-sheen-${uniqueId}`;
  const glowId = `liquid-glow-${uniqueId}`;

  const logoSvg = (
    <div
      className={`relative inline-flex items-center justify-center select-none transition-all duration-300 hover:scale-108 active:scale-95 group ${className}`}
      style={{
        width: typeof size === "number" ? `${size}px` : size,
        height: typeof size === "number" ? `${size}px` : size,
      }}
      title={title}
    >
      <svg
        viewBox="160 90 880 810"
        className="w-full h-full overflow-visible transition-transform duration-300 group-hover:rotate-[-2deg]"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label={title}
        style={{
          filter: `drop-shadow(0 4px 12px rgba(var(--primary-rgb, 255, 79, 43), 0.42)) drop-shadow(0 1px 2px rgba(255, 255, 255, 0.4))`,
        }}
      >
        <defs>
          {/* 1. Gradiente Líquido Principal multi-capa con tonos de la marca */}
          <linearGradient id={gradId} x1="15%" y1="10%" x2="85%" y2="95%">
            <stop
              offset="0%"
              stopColor={primaryColor || "var(--primary, #FF4F2B)"}
              stopOpacity="1"
            />
            <stop
              offset="45%"
              stopColor="color-mix(in srgb, var(--primary, #FF4F2B) 85%, #fff)"
              stopOpacity="1"
            />
            <stop
              offset="80%"
              stopColor="var(--primary, #FF4F2B)"
              stopOpacity="1"
            />
            <stop
              offset="100%"
              stopColor="color-mix(in srgb, var(--primary, #FF4F2B) 75%, #000)"
              stopOpacity="1"
            />
          </linearGradient>

          {/* 2. Sheen Especular de Cristal Líquido */}
          <linearGradient id={sheenId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
            <stop offset="35%" stopColor="#ffffff" stopOpacity="0.25" />
            <stop offset="70%" stopColor="#ffffff" stopOpacity="0.0" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.15" />
          </linearGradient>

          {/* 3. Filtro de Refracción Líquida */}
          <filter id={glowId} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="1.5" result="blur" />
            <feSpecularLighting
              in="blur"
              surfaceScale="3"
              specularConstant="1.2"
              specularExponent="20"
              result="specular"
            >
              <fePointLight x="400" y="200" z="300" />
            </feSpecularLighting>
            <feComposite
              in="SourceGraphic"
              in2="specular"
              operator="over"
            />
          </filter>
        </defs>

        {/* Base Líquida Vectorial */}
        <path
          fill={`url(#${gradId})`}
          fillRule="evenodd"
          d={OFFICIAL_LOGO_PATH}
        />

        {/* Capa de Brillo & Reflejo Especular Translúcido */}
        <path
          fill={`url(#${sheenId})`}
          fillRule="evenodd"
          d={OFFICIAL_LOGO_PATH}
          style={{ mixBlendMode: "overlay", opacity: 0.85 }}
        />
      </svg>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex shrink-0 items-center justify-center">
        {logoSvg}
      </Link>
    );
  }

  return logoSvg;
}
