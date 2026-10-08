"use client";

import React, { useRef } from "react";
import { AnimatedBeam, Circle } from "@/components/ui/animated-beam";
import { Link2, Zap, MessageCircle } from "lucide-react";
import BrandLogo from "@/components/ui/BrandLogo";

// Custom SVG Icons for the 4 communication channels
function InstagramIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

function MessengerIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2C6.477 2 2 6.145 2 11.258c0 2.91 1.455 5.513 3.735 7.202V22l3.39-1.86c.915.254 1.884.39 2.875.39 5.523 0 10-4.145 10-9.258C22 6.145 17.523 2 12 2zm1.066 12.463l-2.56-2.73-4.996 2.73 5.498-5.836 2.624 2.73 4.932-2.73-5.498 5.836z" />
    </svg>
  );
}

function WhatsAppIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.976.58 1.968.928 3.149.929 3.182 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.768-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.694.06-2.129-.533-1.636-.677-2.73-2.316-2.812-2.425-.082-.108-.669-.89-.669-1.697 0-.807.423-1.205.574-1.368.151-.163.329-.204.439-.204.11 0 .219.002.315.006.101.004.237-.038.37.283.138.334.47 1.144.512 1.228.041.085.069.184.013.295-.056.111-.084.18-.167.278-.083.098-.175.219-.25.295-.083.083-.17.172-.073.338.097.165.433.714.929 1.155.638.567 1.176.743 1.342.825.166.083.263.073.361-.039.098-.112.42-.489.532-.656.113-.167.227-.139.38-.083.153.056.97.457 1.137.539.167.082.278.123.319.192.041.07.041.405-.103.81z" />
    </svg>
  );
}

export default function OmnichannelBeamCard() {
  const containerRef = useRef<HTMLDivElement>(null);
  const portalRef = useRef<HTMLDivElement>(null);
  const instagramRef = useRef<HTMLDivElement>(null);
  const messengerRef = useRef<HTMLDivElement>(null);
  const whatsappRef = useRef<HTMLDivElement>(null);
  const centerCrmRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={containerRef}
      className="relative flex w-full max-w-[480px] mx-auto items-center justify-center overflow-hidden rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/95 dark:bg-slate-950/90 p-4 sm:p-6 shadow-md backdrop-blur-md"
    >
      <div className="flex h-full w-full flex-col items-stretch justify-between gap-6 sm:gap-8">
        {/* Fila Superior: Portal Web (Izq) e Instagram (Der) */}
        <div className="flex flex-row items-center justify-between">
          <div className="flex flex-col items-center gap-1.5">
            <Circle ref={portalRef} className="border-[#FF4F2B]/30 bg-[#FF4F2B]/5 hover:bg-[#FF4F2B]/10">
              <Link2 className="h-5 w-5 text-[#FF4F2B]" />
            </Circle>
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-700 dark:text-slate-300">
              Portal de link
            </span>
          </div>

          <div className="flex flex-col items-center gap-1.5">
            <Circle ref={instagramRef} className="border-pink-500/30 bg-pink-500/5 hover:bg-pink-500/10">
              <InstagramIcon className="h-5 w-5 text-pink-600 dark:text-pink-400" />
            </Circle>
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-700 dark:text-slate-300">
              Instagram
            </span>
          </div>
        </div>

        {/* Fila Central: Panel / Skeleton del CRM en el Centro */}
        <div className="flex flex-row items-center justify-center">
          <div
            ref={centerCrmRef}
            className="z-10 w-full max-w-[270px] sm:max-w-[290px] rounded-xl border border-slate-200/90 dark:border-white/15 bg-slate-50/95 dark:bg-slate-900/95 p-3 sm:p-3.5 shadow-lg shadow-slate-200/50 dark:shadow-none space-y-2.5 transition-transform hover:scale-[1.02]"
          >
            {/* Header del CRM Skeleton */}
            <div className="flex items-center justify-between border-b border-slate-200/70 dark:border-white/10 pb-2">
              <div className="flex items-center gap-1.5">
                <BrandLogo variant="icon" iconClassName="h-4.5 w-4.5" />
                <span className="text-[11px] font-black text-slate-900 dark:text-white">
                  CRM AgendatePY
                </span>
              </div>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[9px] font-extrabold">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                En vivo
              </span>
            </div>

            {/* Skeleton / Mini Filas de Clientes Centralizados */}
            <div className="space-y-1.5 text-[10.5px]">
              <div className="flex items-center justify-between rounded-lg bg-white dark:bg-slate-800/80 px-2 py-1.5 border border-slate-200/60 dark:border-white/5 shadow-2xs">
                <div className="flex items-center gap-1.5 min-w-0">
                  <div className="h-5 w-5 rounded-md bg-[#25D366]/15 flex items-center justify-center shrink-0">
                    <WhatsAppIcon className="h-3 w-3 text-[#25D366]" />
                  </div>
                  <span className="truncate font-bold text-slate-800 dark:text-slate-200">
                    Camila · WhatsApp
                  </span>
                </div>
                <span className="text-[9.5px] font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                  15:30 hs
                </span>
              </div>

              <div className="flex items-center justify-between rounded-lg bg-white dark:bg-slate-800/80 px-2 py-1.5 border border-slate-200/60 dark:border-white/5 shadow-2xs">
                <div className="flex items-center gap-1.5 min-w-0">
                  <div className="h-5 w-5 rounded-md bg-pink-500/15 flex items-center justify-center shrink-0">
                    <InstagramIcon className="h-3 w-3 text-pink-600 dark:text-pink-400" />
                  </div>
                  <span className="truncate font-bold text-slate-800 dark:text-slate-200">
                    Lucas · Instagram
                  </span>
                </div>
                <span className="text-[9.5px] font-bold text-[#FF4F2B] font-mono">
                  17:00 hs
                </span>
              </div>

              <div className="flex items-center justify-between rounded-lg bg-white dark:bg-slate-800/80 px-2 py-1.5 border border-slate-200/60 dark:border-white/5 shadow-2xs">
                <div className="flex items-center gap-1.5 min-w-0">
                  <div className="h-5 w-5 rounded-md bg-[#FF4F2B]/15 flex items-center justify-center shrink-0">
                    <Link2 className="h-3 w-3 text-[#FF4F2B]" />
                  </div>
                  <span className="truncate font-bold text-slate-800 dark:text-slate-200">
                    Sofía · Portal Web
                  </span>
                </div>
                <span className="text-[9.5px] font-bold text-slate-600 dark:text-slate-400 font-mono">
                  18:30 hs
                </span>
              </div>
            </div>

            {/* Footer del CRM */}
            <div className="pt-1 flex items-center justify-between text-[9px] text-slate-400">
              <span>Bandeja unificada</span>
              <span className="font-bold text-slate-700 dark:text-slate-300">4 canales conectados</span>
            </div>
          </div>
        </div>

        {/* Fila Inferior: WhatsApp (Izq) y Messenger (Der) */}
        <div className="flex flex-row items-center justify-between">
          <div className="flex flex-col items-center gap-1.5">
            <Circle ref={whatsappRef} className="border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/10">
              <WhatsAppIcon className="h-5 w-5 text-[#25D366]" />
            </Circle>
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-700 dark:text-slate-300">
              WhatsApp
            </span>
          </div>

          <div className="flex flex-col items-center gap-1.5">
            <Circle ref={messengerRef} className="border-blue-500/30 bg-blue-500/5 hover:bg-blue-500/10">
              <MessengerIcon className="h-5 w-5 text-[#0084FF]" />
            </Circle>
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-700 dark:text-slate-300">
              Messenger
            </span>
          </div>
        </div>
      </div>

      {/* Haz animado 1: Portal de Link -> Panel CRM */}
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={portalRef}
        toRef={centerCrmRef}
        curvature={-35}
        endYOffset={-8}
        dotted
        gradientStartColor="#FF4F2B"
        gradientStopColor="#FF7A38"
        duration={3.5}
      />

      {/* Haz animado 2: Instagram -> Panel CRM */}
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={instagramRef}
        toRef={centerCrmRef}
        curvature={-35}
        endYOffset={-8}
        reverse
        dotted
        gradientStartColor="#E1306C"
        gradientStopColor="#FF4F2B"
        duration={3.8}
        delay={0.4}
      />

      {/* Haz animado 3: WhatsApp -> Panel CRM */}
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={whatsappRef}
        toRef={centerCrmRef}
        curvature={35}
        endYOffset={8}
        dotted
        gradientStartColor="#25D366"
        gradientStopColor="#FF4F2B"
        duration={3.2}
        delay={0.2}
      />

      {/* Haz animado 4: Messenger -> Panel CRM */}
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={messengerRef}
        toRef={centerCrmRef}
        curvature={35}
        endYOffset={8}
        reverse
        dotted
        gradientStartColor="#0084FF"
        gradientStopColor="#FF4F2B"
        duration={4}
        delay={0.6}
      />
    </div>
  );
}
