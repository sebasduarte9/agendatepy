"use client";

import React from "react";

export default function AuroraBackground() {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none overflow-hidden select-none -z-10 w-full h-full bg-[#FFFFFF] dark:bg-[#09090b]"
    >
      {/* Fondo predominantemente blanco con ondas animadas en el tono naranja oficial (#FF4F2B) */}
      <div className="absolute inset-0 w-full h-full">
        <div
          className="absolute -top-[30vh] left-1/2 -translate-x-1/2 w-[150vw] h-[150vw] max-w-[1100px] max-h-[1100px] rounded-full opacity-45 dark:opacity-25 animate-[spin_22s_linear_infinite] motion-reduce:animate-none pointer-events-none"
          style={{
            background:
              "conic-gradient(from 0deg, rgba(255,79,43,0) 0deg, rgba(255,79,43,0.6) 70deg, rgba(255,176,32,0.5) 150deg, rgba(244,63,94,0.35) 230deg, rgba(255,79,43,0) 320deg)",
            filter: "blur(64px)",
            willChange: "transform",
          }}
        />

        {/* Halo superior principal en naranja vivo: claramente visible sobre blanco */}
        <div
          className="animate-aurora-1 absolute -top-[10%] left-1/2 -translate-x-1/2 w-[110vw] max-w-[1300px] h-[60vh] sm:h-[70vh] opacity-75 dark:opacity-40 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 65% 55% at 50% 30%, rgba(255, 69, 26, 0.72) 0%, rgba(255, 94, 44, 0.42) 45%, rgba(255, 69, 26, 0.15) 70%, transparent 100%)",
            filter: "blur(70px)",
          }}
        />

        <div
          className="animate-aurora-4 absolute top-[4%] -left-[15%] w-[75vw] h-[40vh] opacity-60 dark:opacity-30 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 55% 55% at 50% 50%, rgba(255, 176, 32, 0.55) 0%, rgba(255, 120, 40, 0.22) 55%, transparent 100%)",
            filter: "blur(60px)",
          }}
        />

        {/* Aura secundaria en diagonal que acompaña la lectura con el tono naranja */}
        <div
          className="animate-aurora-2 absolute top-[30%] -right-[10%] w-[70vw] h-[55vh] opacity-55 dark:opacity-30 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 60% 60% at 50% 50%, rgba(255, 69, 26, 0.62) 0%, rgba(255, 110, 40, 0.30) 50%, transparent 100%)",
            filter: "blur(80px)",
          }}
        />

        {/* Resplandor inferior para transiciones suaves hacia las secciones inferiores */}
        <div
          className="animate-aurora-3 absolute bottom-[15%] -left-[10%] w-[60vw] h-[50vh] opacity-50 dark:opacity-25 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 60% 60% at 50% 50%, rgba(255, 69, 26, 0.58) 0%, rgba(255, 69, 26, 0.2) 60%, transparent 100%)",
            filter: "blur(85px)",
          }}
        />
      </div>

      {/* Tinte de brillo blanco suave sin apagar la presencia del tono naranja */}
      <div className="absolute inset-0 bg-white/10 dark:bg-transparent pointer-events-none" />

      <div
        className="absolute inset-0 opacity-[0.07] dark:opacity-[0.05] mix-blend-multiply dark:mix-blend-screen pointer-events-none"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />
    </div>
  );
}
