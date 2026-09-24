"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  X,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Calendar,
  Wallet,
  MessageSquare,
  Palette,
  ExternalLink,
} from "lucide-react";

interface TourStep {
  title: string;
  badge: string;
  icon: typeof Calendar;
  description: string;
  actionText?: string;
  actionHref?: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    title: "¡Bienvenido a AgendatePY!",
    badge: "Inicio",
    icon: Sparkles,
    description:
      "Tu plataforma ya está lista para recibir reservas. Te mostramos en 1 minuto las funciones clave para automatizar tu negocio.",
  },
  {
    title: "Tu Enlace de Reservas Públicas",
    badge: "Paso 1 de 5",
    icon: ExternalLink,
    description:
      "Tus clientes pueden agendar turnos las 24hs desde el celular. Compártelo en tu perfil de Instagram, TikTok y Google Maps.",
    actionText: "Ver página pública",
    actionHref: "/barberia/reservar",
  },
  {
    title: "Calendario y Gestión de Citas",
    badge: "Paso 2 de 5",
    icon: Calendar,
    description:
      "Visualiza tu semana, bloquea horarios por almuerzo o imprevistos y añade citas manuales con un solo clic.",
    actionText: "Ir a la Agenda",
    actionHref: "/dashboard/calendario",
  },
  {
    title: "Control de Caja & Comisiones",
    badge: "Paso 3 de 5",
    icon: Wallet,
    description:
      "Lleva el balance diario de ingresos, egresos, propinas y el cálculo automático de comisiones para cada colaborador.",
    actionText: "Ver Caja Diaria",
    actionHref: "/dashboard/caja",
  },
  {
    title: "WhatsApp & Bot Sendwo",
    badge: "Paso 4 de 5",
    icon: MessageSquare,
    description:
      "Tus clientes recibirán la confirmación y recordatorio automático en WhatsApp con tu número o tu bot de Sendwo.",
    actionText: "Configurar WhatsApp",
    actionHref: "/dashboard/whatsapp",
  },
  {
    title: "Personalizador de Marca",
    badge: "Paso 5 de 5",
    icon: Palette,
    description:
      "Elige tus colores corporativos, tipografía, modo oscuro y fotos para que tu link tenga la identidad visual de tu local.",
    actionText: "Personalizar Marca",
    actionHref: "/dashboard/apariencia",
  },
];

export default function GuidedTour() {
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    // Si viene de onboarding o solicita tour explícito
    if (searchParams.get("tour") === "start") {
      setIsOpen(true);
    }
  }, [searchParams]);

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => {
          setCurrentStep(0);
          setIsOpen(true);
        }}
        className="fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full border border-indigo-200/80 bg-white/95 px-4 py-2.5 text-xs font-bold text-brand shadow-[0_8px_30px_rgb(0,0,0,0.12)] backdrop-blur-md transition hover:scale-105 active:scale-95"
      >
        <Sparkles className="h-4 w-4 text-brand animate-pulse" />
        <span>Visita Guiada</span>
      </button>
    );
  }

  const step = TOUR_STEPS[currentStep];
  const Icon = step.icon;

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      setIsOpen(false);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-7 shadow-2xl"
      >
        {/* Botón cerrar */}
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="absolute right-5 top-5 rounded-full p-1.5 text-slate-600 hover:bg-slate-100 hover:text-slate-800 transition"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Indicador de paso */}
        <div className="flex items-center gap-2 mb-3">
          <span className="inline-flex items-center gap-1 rounded-full bg-brand/10 px-2.5 py-0.5 text-[11px] font-bold text-brand">
            {step.badge}
          </span>
          <div className="flex gap-1 ml-auto mr-8">
            {TOUR_STEPS.map((_, idx) => (
              <div
                key={idx}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === currentStep ? "w-5 bg-brand" : "w-1.5 bg-slate-200"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Icono + Título */}
        <div className="flex items-start gap-4 mt-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-brand to-indigo-500 text-white shadow-md shadow-brand/20">
            <Icon className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold tracking-tight text-slate-900">{step.title}</h3>
            <p className="mt-1.5 text-xs leading-relaxed text-slate-700">{step.description}</p>
          </div>
        </div>

        {/* Enlace o acción contextual si aplica */}
        {step.actionText && step.actionHref && (
          <div className="mt-4 pt-3 border-t border-slate-100">
            <a
              href={step.actionHref}
              target={step.actionHref.startsWith("http") ? "_blank" : undefined}
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-brand hover:underline"
            >
              <span>{step.actionText}</span>
              <ArrowRight className="h-3 w-3" />
            </a>
          </div>
        )}

        {/* Botones de navegación */}
        <div className="mt-6 flex items-center justify-between pt-2">
          {currentStep > 0 ? (
            <button
              type="button"
              onClick={handlePrev}
              className="inline-flex items-center gap-1 rounded-2xl px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Anterior
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-xs font-medium text-slate-600 hover:text-slate-800"
            >
              Saltar tour
            </button>
          )}

          <button
            type="button"
            onClick={handleNext}
            className="inline-flex items-center gap-1.5 rounded-2xl bg-brand px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-brand/20 hover:bg-brand-dark transition"
          >
            <span>{currentStep === TOUR_STEPS.length - 1 ? "¡Comenzar ahora!" : "Siguiente"}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </motion.div>
    </div>
  );
}
