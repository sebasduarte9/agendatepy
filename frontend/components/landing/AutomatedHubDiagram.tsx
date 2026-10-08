"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar } from "lucide-react";

// ============================================================================
// ICONOS OFICIALES DE ALTA FIDELIDAD VECTORIAL (CRISP, SIN ESTRELLAS)
// ============================================================================

function WhatsAppIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.63C8.75 21.41 10.38 21.82 12.04 21.82C17.5 21.82 21.95 17.37 21.95 11.91C21.95 6.45 17.5 2 12.04 2ZM12.04 20.13C10.57 20.13 9.13 19.74 7.87 19L7.56 18.82L4.44 19.64L5.27 16.6L5.07 16.28C4.26 14.99 3.84 13.47 3.84 11.91C3.84 7.4 7.52 3.71 12.04 3.71C16.56 3.71 20.24 7.4 20.24 11.91C20.24 16.42 16.56 20.13 12.04 20.13ZM16.53 14.39C16.28 14.27 15.08 13.68 14.86 13.6C14.64 13.52 14.47 13.48 14.31 13.73C14.14 13.98 13.68 14.52 13.54 14.68C13.4 14.84 13.26 14.86 13.01 14.74C12.76 14.62 11.97 14.36 11.03 13.52C10.3 12.87 9.8 12.07 9.66 11.82C9.52 11.57 9.65 11.44 9.77 11.32C9.88 11.21 10.02 11.03 10.15 10.89C10.27 10.74 10.31 10.64 10.4 10.47C10.48 10.31 10.44 10.16 10.38 10.04C10.32 9.92 9.82 8.71 9.61 8.21C9.41 7.72 9.2 7.78 9.05 7.78C8.91 7.77 8.74 7.77 8.58 7.77C8.41 7.77 8.14 7.83 7.91 8.08C7.68 8.33 7.03 8.94 7.03 10.19C7.03 11.44 7.94 12.65 8.07 12.82C8.2 12.98 9.86 15.54 12.4 16.63C13 16.89 13.48 17.05 13.84 17.16C14.45 17.35 15.01 17.33 15.45 17.26C15.94 17.19 16.96 16.64 17.17 16.06C17.38 15.47 17.38 14.98 17.32 14.88C17.25 14.77 17.08 14.71 16.83 14.59L16.53 14.39Z" />
    </svg>
  );
}

function InstagramIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069ZM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0ZM12 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324ZM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8ZM18.406 4.155a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881Z" />
    </svg>
  );
}

function MessengerIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2C6.36 2 2 6.13 2 11.7c0 2.91 1.19 5.43 3.12 7.14v3.54c0 .35.39.56.68.37l3.29-2.06c.92.26 1.89.4 2.91.4 5.64 0 10-4.13 10-9.69C22 6.13 17.64 2 12 2zm1.18 12.98l-2.73-2.91-5.32 2.91 5.86-6.22 2.79 2.91 5.25-2.91-5.85 6.22z" />
    </svg>
  );
}

function WebLinkIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a14.5 14.5 0 0 0 0 20M12 2a14.5 14.5 0 0 1 0 20M2 12h20" />
    </svg>
  );
}

// ============================================================================
// BANCO DE DATOS DE RESERVAS: HORARIOS TOTALMENTE DISTINTOS Y SECUENCIALES
// (Demostración real de "Cero solapamiento de horarios")
// ============================================================================

type ChannelKey = "whatsapp" | "instagram" | "facebook" | "web";

interface BookingEntry {
  clientName: string;
  serviceName: string;
  slotTime: string;
}

const WHATSAPP_ITEMS: BookingEntry[] = [
  { clientName: "Lucas Romero", serviceName: "Corte Degradé + Barba", slotTime: "14:00 hs" },
  { clientName: "Mateo Benítez", serviceName: "Corte Clásico + Lavado", slotTime: "17:00 hs" },
  { clientName: "Andrés Galeano", serviceName: "Perfilado de Barba", slotTime: "20:00 hs" },
  { clientName: "Franco Vera", serviceName: "Corte Texturizado", slotTime: "Mañana 09:00 hs" },
];

const INSTAGRAM_ITEMS: BookingEntry[] = [
  { clientName: "Valeria Duarte", serviceName: "Manicura Rusa + Esmaltado", slotTime: "14:45 hs" },
  { clientName: "Camila Torres", serviceName: "Diseño de Cejas + Henna", slotTime: "17:45 hs" },
  { clientName: "Sofía Giménez", serviceName: "Tratamiento Capilar", slotTime: "20:45 hs" },
  { clientName: "Belén Ortíz", serviceName: "Uñas Esculpidas Semipermanente", slotTime: "Mañana 09:45 hs" },
];

const FACEBOOK_ITEMS: BookingEntry[] = [
  { clientName: "Carlos Benítez", serviceName: "Perfilado de Barba", slotTime: "15:30 hs" },
  { clientName: "Jorge Ramírez", serviceName: "Corte Clásico & Peinado", slotTime: "18:30 hs" },
  { clientName: "Rodrigo Sosa", serviceName: "Lavado + Masaje Capilar", slotTime: "21:30 hs" },
  { clientName: "Esteban Rolón", serviceName: "Barba & Bigote Tradicional", slotTime: "Mañana 10:30 hs" },
];

const WEB_ITEMS: BookingEntry[] = [
  { clientName: "María Silva", serviceName: "Limpieza Facial Profunda", slotTime: "16:15 hs" },
  { clientName: "Florencia Galeano", serviceName: "Lifting de Pestañas", slotTime: "19:15 hs" },
  { clientName: "Diego Romero", serviceName: "Masaje Descontracturante", slotTime: "22:15 hs" },
  { clientName: "Patricia Vera", serviceName: "Peinado & Brushing Spa", slotTime: "Mañana 11:15 hs" },
];

const POOLS: Record<ChannelKey, BookingEntry[]> = {
  whatsapp: WHATSAPP_ITEMS,
  instagram: INSTAGRAM_ITEMS,
  facebook: FACEBOOK_ITEMS,
  web: WEB_ITEMS,
};

interface QueueItem extends BookingEntry {
  channel: ChannelKey;
  keyId: number;
}

export default function AutomatedHubDiagram() {
  // Punteros para ciclar sobre cada pool de canales
  const channelPointers = useRef({
    whatsapp: 0,
    instagram: 0,
    facebook: 0,
    web: 0,
  });

  // Generador monótono de claves únicas para React
  const keyCounter = useRef(100);

  // Cola inicial en orden estricto y con horarios secuenciales:
  // WhatsApp (14:00) -> Instagram (14:45) -> Facebook (15:30) -> Link de Reserva (16:15)
  const [queue, setQueue] = useState<QueueItem[]>(() => [
    { channel: "whatsapp", ...WHATSAPP_ITEMS[0], keyId: 1 },
    { channel: "instagram", ...INSTAGRAM_ITEMS[0], keyId: 2 },
    { channel: "facebook", ...FACEBOOK_ITEMS[0], keyId: 3 },
    { channel: "web", ...WEB_ITEMS[0], keyId: 4 },
  ]);

  // Rotación continua cada 1.6s:
  // El turno en la posición 1 sube y pasa a la posición 4 con nuevos datos.
  // La posición 2 sube a la 1, la 3 sube a la 2 y la 4 sube a la 3.
  // Secuencia de canales: WhatsApp -> Instagram -> Facebook -> Link de Reserva -> WhatsApp...
  useEffect(() => {
    const timer = setInterval(() => {
      setQueue((prevQueue) => {
        const [first, ...rest] = prevQueue;
        const ch = first.channel;

        // Avanzar el puntero del canal que acaba de rotar
        channelPointers.current[ch] = (channelPointers.current[ch] + 1) % POOLS[ch].length;
        const nextData = POOLS[ch][channelPointers.current[ch]];

        const newKey = keyCounter.current++;
        const newQueueItem: QueueItem = {
          channel: ch,
          ...nextData,
          keyId: newKey,
        };

        // La cola rota físicamente: los 3 restantes suben y el renovado entra en la fila 4
        return [...rest, newQueueItem];
      });
    }, 1600);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full max-w-6xl mx-auto py-2 select-none px-2 sm:px-4">
      {/* ============================================================== */}
      {/* COMPOSICIÓN LIMPIA: CARDS DESCRIPTIVAS + CRM CENTRAL           */}
      {/* ============================================================== */}
      <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 lg:gap-6 items-stretch">
        
        {/* ============================================================ */}
        {/* COLUMNA IZQUIERDA: WHATSAPP & FACEBOOK                      */}
        {/* ============================================================ */}
        <div className="hidden lg:flex lg:col-span-3 flex-col justify-between gap-4 sm:gap-5 order-2 lg:order-1">
          
          {/* TARJETA 1: WHATSAPP */}
          <div className="flex-1 rounded-2xl p-4 sm:p-5 border border-slate-200/90 dark:border-white/10 bg-white dark:bg-slate-900 shadow-sm transition-all duration-200 hover:border-slate-300 dark:hover:border-white/20 flex flex-col justify-center">
            <div className="flex items-center gap-2.5 pb-2.5 mb-2.5 border-b border-slate-100 dark:border-white/5">
              <div className="h-7 w-7 rounded-lg bg-[#25D366] flex items-center justify-center text-white shadow-xs shrink-0">
                <WhatsAppIcon className="w-4 h-4" />
              </div>
              <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 leading-tight">
                WhatsApp
              </span>
            </div>
            <p className="text-xs sm:text-[13px] text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
              Tu IA responde consultas y agenda turnos automáticamente 24/7.
            </p>
          </div>

          {/* TARJETA 2: FACEBOOK */}
          <div className="flex-1 rounded-2xl p-4 sm:p-5 border border-slate-200/90 dark:border-white/10 bg-white dark:bg-slate-900 shadow-sm transition-all duration-200 hover:border-slate-300 dark:hover:border-white/20 flex flex-col justify-center">
            <div className="flex items-center gap-2.5 pb-2.5 mb-2.5 border-b border-slate-100 dark:border-white/5">
              <div className="h-7 w-7 rounded-lg bg-[#0084FF] flex items-center justify-center text-white shadow-xs shrink-0">
                <MessengerIcon className="w-4 h-4" />
              </div>
              <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 leading-tight">
                Facebook
              </span>
            </div>
            <p className="text-xs sm:text-[13px] text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
              Citas directas desde el botón de tu página sin esperas.
            </p>
          </div>

        </div>

        {/* ============================================================ */}
        {/* COLUMNA CENTRAL: EL CRM (ROTACIÓN REAL Y HORARIOS ÚNICOS)    */}
        {/* ============================================================ */}
        <div className="w-full lg:col-span-6 order-1 lg:order-2">
          <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-white/10 shadow-lg p-5 sm:p-7 relative overflow-hidden text-left h-full flex flex-col justify-between">
            {/* Borde sutil superior con degradé oficial de Agendate.py */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand via-[#FF6B4A] to-amber-500" />

            {/* Cabecera del CRM */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-white/5">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-[#FF4F2B]/10 dark:bg-[#FF4F2B]/20 flex items-center justify-center text-[#FF4F2B] font-black text-sm shrink-0">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white leading-tight">
                    Tu CRM & Agenda Central
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                    Sincronización en tiempo real
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full border border-slate-200/80 dark:border-white/10 shrink-0">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <span>4 canales conectados</span>
              </div>
            </div>

            {/* CONTENEDOR DE LA COLA: ROTACIÓN FÍSICA LIMPIA (SIN ETIQUETAS SOBRANTES) */}
            <div className="mt-4 h-[252px] overflow-hidden flex flex-col justify-between relative">
              <AnimatePresence mode="popLayout" initial={false}>
                {queue.map((item) => {
                  return (
                    <motion.div
                      key={item.keyId}
                      layout="position"
                      initial={{ y: 55, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -55, opacity: 0 }}
                      transition={{
                        layout: { duration: 0.48, ease: [0.16, 1, 0.3, 1] },
                        y: { duration: 0.48, ease: [0.16, 1, 0.3, 1] },
                        opacity: { duration: 0.28 },
                      }}
                      className="h-[52px] w-full flex items-center justify-between px-3.5 rounded-2xl border border-slate-200/80 dark:border-white/5 bg-slate-50/70 dark:bg-slate-800/40 text-xs shrink-0"
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        {/* Badge oficial limpio por canal (sin etiquetas secundarias) */}
                        {item.channel === "whatsapp" && (
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-lg bg-[#25D366] text-white shrink-0">
                            <WhatsAppIcon className="w-3.5 h-3.5 text-white" />
                            WhatsApp
                          </span>
                        )}
                        {item.channel === "instagram" && (
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-lg bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#F77737] text-white shrink-0">
                            <InstagramIcon className="w-3.5 h-3.5 text-white" />
                            Instagram
                          </span>
                        )}
                        {item.channel === "facebook" && (
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-lg bg-[#0084FF] text-white shrink-0">
                            <MessengerIcon className="w-3.5 h-3.5 text-white" />
                            Facebook
                          </span>
                        )}
                        {item.channel === "web" && (
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-lg bg-[#FF4F2B] text-white shrink-0">
                            <WebLinkIcon className="w-3.5 h-3.5 text-white" />
                            Link de Reserva
                          </span>
                        )}

                        {/* Nombre del cliente y servicio */}
                        <div className="min-w-0 flex-1 ml-1 sm:ml-2">
                          <strong className="text-slate-900 dark:text-white block truncate leading-tight text-xs sm:text-[13px]">
                            {item.clientName}
                          </strong>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate block mt-0.5">
                            {item.serviceName}
                          </span>
                        </div>
                      </div>

                      {/* Horario estrictamente único y estado */}
                      <div className="text-right shrink-0 ml-3">
                        <span className="font-mono font-bold text-slate-800 dark:text-slate-200 text-xs sm:text-[13px] tabular-nums block">
                          {item.slotTime}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">
                          Confirmado
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {/* Sincronización en tiempo real sin solapamiento */}
            <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
                <span className="font-medium">Agenda centralizada en tiempo real</span>
              </div>
              <span className="font-bold text-[#FF4F2B] text-xs">
                Cero solapamiento de horarios
              </span>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* COLUMNA DERECHA: INSTAGRAM & LINK DE RESERVA                */}
        {/* ============================================================ */}
        <div className="hidden lg:flex lg:col-span-3 flex-col justify-between gap-4 sm:gap-5 order-3">
          
          {/* TARJETA 3: INSTAGRAM */}
          <div className="flex-1 rounded-2xl p-4 sm:p-5 border border-slate-200/90 dark:border-white/10 bg-white dark:bg-slate-900 shadow-sm transition-all duration-200 hover:border-slate-300 dark:hover:border-white/20 flex flex-col justify-center">
            <div className="flex items-center gap-2.5 pb-2.5 mb-2.5 border-b border-slate-100 dark:border-white/5">
              <div className="h-7 w-7 rounded-lg bg-gradient-to-tr from-[#833AB4] via-[#FD1D1D] to-[#F77737] flex items-center justify-center text-white shadow-xs shrink-0">
                <InstagramIcon className="w-4 h-4" />
              </div>
              <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 leading-tight">
                Instagram
              </span>
            </div>
            <p className="text-xs sm:text-[13px] text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
              Reservas al instante desde el link de tu perfil e historias.
            </p>
          </div>

          {/* TARJETA 4: LINK DE RESERVA */}
          <div className="flex-1 rounded-2xl p-4 sm:p-5 border border-slate-200/90 dark:border-white/10 bg-white dark:bg-slate-900 shadow-sm transition-all duration-200 hover:border-slate-300 dark:hover:border-white/20 flex flex-col justify-center">
            <div className="flex items-center gap-2.5 pb-2.5 mb-2.5 border-b border-slate-100 dark:border-white/5">
              <div className="h-7 w-7 rounded-lg bg-[#FF4F2B] flex items-center justify-center text-white shadow-xs shrink-0">
                <WebLinkIcon className="w-4 h-4" />
              </div>
              <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 leading-tight">
                Link de Reserva
              </span>
            </div>
            <p className="text-xs sm:text-[13px] text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
              Tu enlace propio para agendar desde cualquier canal o código QR.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}
