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
        {/* Halo superior principal en naranja vivo: claramente visible sobre blanco */}
        <div
          className="animate-aurora-1 absolute -top-[10%] left-1/2 -translate-x-1/2 w-[110vw] max-w-[1300px] h-[60vh] sm:h-[70vh] opacity-75 dark:opacity-40 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 65% 55% at 50% 30%, rgba(255, 69, 26, 0.72) 0%, rgba(255, 94, 44, 0.42) 45%, rgba(255, 69, 26, 0.15) 70%, transparent 100%)",
            filter: "blur(70px)",
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
    </div>
  );
}
