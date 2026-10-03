"use client";

import React from "react";
import AutomatedHubDiagram from "./AutomatedHubDiagram";

export default function StackingCardsSection() {
  return (
    <section
      id="como-funciona"
      className="relative px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto py-16 sm:py-24 scroll-mt-24"
    >
      {/* Encabezado de Sección: Título y texto explicativo */}
      <div className="text-center max-w-3xl mx-auto mb-6 sm:mb-10 space-y-4">
        <h2 className="text-3xl xs:text-4xl sm:text-5xl font-black tracking-tight text-slate-950 dark:text-white leading-[1.12]">
          Todo tu negocio funcionando en{" "}
          <span className="bg-gradient-to-r from-[#FF5B37] via-[#FF441F] to-amber-500 bg-clip-text text-transparent">
            piloto automático
          </span>
        </h2>
        <p className="text-sm sm:text-base md:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Diseñado para negocios activos: desde la primera consulta por redes hasta el dinero en tu cuenta bancaria y el cierre de caja.
        </p>
      </div>

      {/* Animación Central: Hub interactivo con anillos concéntricos, cerebro y canales omnicanal */}
      <div className="w-full flex justify-center">
        <AutomatedHubDiagram />
      </div>
    </section>
  );
}
