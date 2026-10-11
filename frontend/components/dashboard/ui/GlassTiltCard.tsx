"use client";

import { useState, useRef, type MouseEvent, type ReactNode, type HTMLAttributes } from "react";

interface GlassTiltCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
  glowColor?: string;
  maxTilt?: number;
}

export default function GlassTiltCard({
  children,
  className = "",
  glowColor,
  maxTilt = 7,
  onClick,
  style,
  ...props
}: GlassTiltCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState("perspective(850px) rotateX(0deg) rotateY(0deg)");
  const [glarePosition, setGlarePosition] = useState({ x: 50, y: 50, opacity: 0 });

  function handleMouseMove(e: MouseEvent<HTMLDivElement>) {
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const percentX = (x / rect.width) * 100;
    const percentY = (y / rect.height) * 100;

    const tiltX = ((y / rect.height) - 0.5) * -maxTilt;
    const tiltY = ((x / rect.width) - 0.5) * maxTilt;

    setTransform(`perspective(850px) rotateX(${tiltX.toFixed(2)}deg) rotateY(${tiltY.toFixed(2)}deg) translateY(-2px)`);
    setGlarePosition({ x: percentX, y: percentY, opacity: 1 });
  }

  function handleMouseLeave() {
    setTransform("perspective(850px) rotateX(0deg) rotateY(0deg) translateY(0px)");
    setGlarePosition((prev) => ({ ...prev, opacity: 0 }));
  }

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{
        ...style,
        transform,
        transition: "transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.25s ease, border-color 0.2s ease",
      }}
      className={`glass-panel glass-tilt-card relative overflow-hidden rounded-2xl p-5 ${
        onClick ? "cursor-pointer" : ""
      } ${className}`}
      {...props}
    >
      {/* Reflejo interactivo especular de luz que sigue al cursor */}
      <div
        className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-300"
        style={{
          opacity: glarePosition.opacity,
          background: `radial-gradient(circle 220px at ${glarePosition.x}% ${glarePosition.y}%, rgba(255, 255, 255, 0.15), transparent 70%)`,
        }}
        aria-hidden="true"
      />

      {/* Resplandor del color primario */}
      <div
        className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-500"
        style={{
          opacity: glarePosition.opacity * 0.4,
          background: `radial-gradient(circle 280px at ${glarePosition.x}% ${glarePosition.y}%, ${
            glowColor || "rgba(var(--primary-rgb, 255, 79, 43), 0.25)"
          }, transparent 80%)`,
        }}
        aria-hidden="true"
      />

      <div className="relative z-10">{children}</div>
    </div>
  );
}
