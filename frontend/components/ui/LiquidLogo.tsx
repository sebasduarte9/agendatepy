"use client";

import React from "react";
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
      >
        {/* Logo plano en el color de marca */}
        <path
          fill={primaryColor || "var(--primary, #FF4F2B)"}
          fillRule="evenodd"
          d={OFFICIAL_LOGO_PATH}
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
