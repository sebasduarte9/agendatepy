"use client";

import React, { useEffect, useState } from "react";
import AuroraBackground from "./AuroraBackground";

// La escena WebGL (three.js) nunca llegaba a inicializarse: el canvas se montaba
// después del efecto y el ref era null, así que quedaba transparente. Se quitó
// three.js del bundle y se conserva la capa de blur que sí se veía.

function checkWebGL(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const testCanvas = document.createElement("canvas");
    const gl =
      testCanvas.getContext("webgl") ||
      testCanvas.getContext("experimental-webgl");
    return Boolean(gl);
  } catch {
    return false;
  }
}

export default function ThreeGradientBackground() {
  const [showOverlay, setShowOverlay] = useState(false);

  useEffect(() => {
    // En pantallas móviles (< 768px), usar exclusivamente AuroraBackground (CSS nativo)
    if (window.innerWidth < 768) return;
    setShowOverlay(checkWebGL());
  }, []);

  return (
    <>
      {/* Fallback de gradiente Aurora siempre activo como base estable con tonos naranja vivos */}
      <AuroraBackground />

      {showOverlay && (
        <div
          aria-hidden="true"
          className="fixed inset-0 pointer-events-none overflow-hidden select-none -z-10 w-full h-full mix-blend-normal transition-opacity duration-700 opacity-60 dark:opacity-45"
        >
          <div className="absolute inset-0 backdrop-blur-[3px] pointer-events-none mix-blend-normal opacity-20 dark:opacity-20" />
        </div>
      )}
    </>
  );
}
