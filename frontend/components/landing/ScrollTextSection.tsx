'use client';

import React from 'react';
import TextAnimation from '@/components/ui/scroll-text';
import { LiquidGlassCard } from '@/components/ui/liquid-glass';
import { Sparkles, CalendarCheck2 } from 'lucide-react';

export default function ScrollTextAnimation() {
  return (
    <section className="relative py-12 sm:py-20 px-4 sm:px-6 max-w-6xl mx-auto overflow-hidden">
      <div className="flex flex-col justify-center items-center text-center py-8 sm:py-12">
        <span className="text-xs uppercase tracking-widest font-black text-[#FF4F2B] mb-3 select-none">
          Automatización Inteligente
        </span>
        <TextAnimation
          text="Tu negocio funcionando en piloto automático."
          variants={{
            hidden: { filter: 'blur(10px)', opacity: 0, y: 20 },
            visible: {
              filter: 'blur(0px)',
              opacity: 1,
              y: 0,
              transition: { ease: 'linear' },
            },
          }}
          classname="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-slate-900 dark:text-white max-w-3xl mx-auto"
        />
      </div>

      <div className="flex items-center text-left py-8 sm:py-12">
        <TextAnimation
          as="p"
          letterAnime={true}
          text="Multiplicá tus citas y ganá tiempo libre ✨"
          classname="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white max-w-2xl"
          variants={{
            hidden: { filter: 'blur(4px)', opacity: 0, y: 20 },
            visible: {
              filter: 'blur(0px)',
              opacity: 1,
              y: 0,
              transition: {
                duration: 0.2,
              },
            },
          }}
        />
      </div>

      <div className="flex justify-end items-center text-right py-8 sm:py-12">
        <TextAnimation
          text="Cero ausencias y cobros asegurados"
          direction="right"
          classname="text-2xl sm:text-4xl md:text-5xl font-bold tracking-tight text-slate-900 dark:text-white max-w-2xl ml-auto"
        />
      </div>

      <div className="flex justify-center items-center text-center py-8 sm:py-12">
        <TextAnimation
          text="Agendamiento y cobros sincronizados al instante"
          direction="down"
          lineAnime={true}
          classname="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white max-w-3xl mx-auto"
        />
      </div>

      <div className="flex items-center justify-center mt-8">
        <div className="h-px w-28 bg-gradient-to-r from-transparent via-[#FF4F2B]/40 to-transparent" />
      </div>
    </section>
  );
}
