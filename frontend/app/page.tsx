"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [isCurtainOpen, setIsCurtainOpen] = useState(false);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setIsCurtainOpen(true);
    }, 80);

    return () => window.clearTimeout(timeoutId);
  }, []);

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 px-6">
      <section className="flex max-w-2xl flex-col items-center text-center">
        <h1 className="font-sans text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl md:text-6xl">
          ¡Bienvenido a AgendatePY Test!
        </h1>
        <p className="mt-6 max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg">
          Estamos probando una nueva forma de agendar turnos rápidamente.
        </p>
        <button
          type="button"
          className="mt-10 rounded-full bg-emerald-600 px-8 py-3 text-base font-semibold text-white shadow-sm transition-colors duration-200 ease-in-out hover:bg-emerald-500"
        >
          Comenzar Prueba
        </button>
      </section>

      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-50 flex"
      >
        <div
          className={`h-full w-1/2 bg-slate-900 transition-[translate] duration-[1300ms] ease-in-out ${
            isCurtainOpen ? "-translate-x-full" : "translate-x-0"
          }`}
        />
        <div
          className={`h-full w-1/2 bg-slate-900 transition-[translate] duration-[1300ms] ease-in-out ${
            isCurtainOpen ? "translate-x-full" : "translate-x-0"
          }`}
        />
      </div>
    </main>
  );
}
