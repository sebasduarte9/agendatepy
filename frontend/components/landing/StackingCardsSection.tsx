"use client";

import React, { useRef } from "react";
import { useScroll, useTransform, motion, MotionValue } from "framer-motion";
import Link from "next/link";
import {
  MessageCircle,
  Landmark,
  Bell,
  Coins,
  Award,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Users,
} from "lucide-react";
import LiquidGlass from "@/components/ui/LiquidGlass";
import OmnichannelBeamCard from "./OmnichannelBeamCard";

interface StackingCardData {
  id: string;
  step: string;
  badge: string;
  title: string;
  description: string;
  stat: string;
  statLabel: string;
  accentColor: string;
  cardBg: string;
  icon: React.ElementType;
  previewType: "omnichannel" | "whatsapp" | "transferencia" | "reminder" | "cash" | "loyalty";
}

const STACKING_CARDS: StackingCardData[] = [
  {
    id: "omnichannel",
    step: "01",
    badge: "TODOS TUS CLIENTES EN UN SOLO LUGAR",
    title: "Todos tus clientes, en un solo lugar",
    description:
      "Conectá tus canales principales: Portal de reservas con tu link web, Instagram, Messenger y WhatsApp. Todas las consultas y turnos se sincronizan automáticamente en un único CRM ordenado, evitando mensajes perdidos y coordinaciones manuales.",
    stat: "4 en 1",
    statLabel: "Canales sincronizados",
    accentColor: "#FF4F2B",
    cardBg: "bg-white/95 dark:bg-slate-900/95 border-orange-500/25 dark:border-white/10",
    icon: Users,
    previewType: "omnichannel",
  },
  {
    id: "whatsapp",
    step: "02",
    badge: "AUTOGESTIÓN 24/7",
    title: "Agendamiento automático por WhatsApp sin descargar apps",
    description:
      "Tus clientes reservan de día o de noche directamente desde su WhatsApp. El asistente inteligente muestra tus horarios disponibles reales, confirma el servicio y sincroniza tu calendario al instante.",
    stat: "100%",
    statLabel: "Autogestión sin fricción",
    accentColor: "#25D366",
    cardBg: "bg-white/95 dark:bg-slate-900/95 border-emerald-500/25 dark:border-white/10",
    icon: MessageCircle,
    previewType: "whatsapp",
  },
  {
    id: "transferencias",
    step: "03",
    badge: "SEÑAS BANCARIAS",
    title: "Cobro de señas por transferencia con validación automática",
    description:
      "Asegurá tus turnos solicitando una seña bancaria por transferencia directa o código QR. El sistema verifica el comprobante, bloquea el horario y elimina los turnos colgados.",
    stat: "Gs. 80.000",
    statLabel: "Seña promedio asegurada",
    accentColor: "#F59E0B",
    cardBg: "bg-white/95 dark:bg-slate-900/95 border-amber-500/25 dark:border-white/10",
    icon: Landmark,
    previewType: "transferencia",
  },
  {
    id: "reminder",
    step: "04",
    badge: "CERO AUSENCIAS",
    title: "Recordatorios inteligentes con botón interactivo",
    description:
      "Notificaciones automáticas 24h y 2h antes del turno con botones para confirmar o reprogramar. Si un cliente cancela a tiempo, el horario se libera al instante a tu lista de espera.",
    stat: "-85%",
    statLabel: "Reducción en ausencias",
    accentColor: "#8B5CF6",
    cardBg: "bg-white/95 dark:bg-slate-900/95 border-purple-500/25 dark:border-white/10",
    icon: Bell,
    previewType: "reminder",
  },
  {
    id: "caja",
    step: "05",
    badge: "GESTIÓN FINANCIERA",
    title: "Arqueo diario de caja y comisiones en tiempo real",
    description:
      "Cada cobro se vincula automáticamente al profesional que brindó la atención. Al finalizar el día, tu caja cuadra al centavo y la liquidación del equipo queda lista en 1 solo clic.",
    stat: "30 seg",
    statLabel: "Cierre de caja diario",
    accentColor: "#06B6D4",
    cardBg: "bg-white/95 dark:bg-slate-900/95 border-cyan-500/25 dark:border-white/10",
    icon: Coins,
    previewType: "cash",
  },
  {
    id: "fidelizacion",
    step: "06",
    badge: "RECOMPENSAS DIGITALES",
    title: "Tarjeta de fidelización digital en el móvil de tu cliente",
    description:
      "Eliminá las tarjetas de cartón que se pierden. Tus clientes acumulan sellos digitales en su teléfono con cada visita y desbloquean beneficios que garantizan su retorno recurrente.",
    stat: "+40%",
    statLabel: "Aumento en recurrencia",
    accentColor: "#10B981",
    cardBg: "bg-white/95 dark:bg-slate-900/95 border-emerald-500/25 dark:border-white/10",
    icon: Award,
    previewType: "loyalty",
  },
];

export default function StackingCardsSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  return (
    <section
      id="como-funciona"
      ref={containerRef}
      className="relative px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto py-16 sm:py-24 scroll-mt-24"
    >
      {/* Encabezado de Sección */}
      <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16 space-y-4">
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

      {/* Stacking Cards Container con Sticky Scroll */}
      <div className="relative w-full space-y-10 sm:space-y-12 pb-24 sm:pb-36">
        {STACKING_CARDS.map((card, i) => {
          const targetScale = 1 - (STACKING_CARDS.length - i) * 0.03;
          const range: [number, number] = [i * (0.8 / STACKING_CARDS.length), 1];

          return (
            <StackingCardItem
              key={card.id}
              card={card}
              i={i}
              total={STACKING_CARDS.length}
              progress={scrollYProgress}
              range={range}
              targetScale={targetScale}
            />
          );
        })}
      </div>
    </section>
  );
}

interface StackingCardItemProps {
  card: StackingCardData;
  i: number;
  total: number;
  progress: MotionValue<number>;
  range: [number, number];
  targetScale: number;
}

function StackingCardItem({
  card,
  i,
  total,
  progress,
  range,
  targetScale,
}: StackingCardItemProps) {
  const itemRef = useRef<HTMLDivElement>(null);

  // Scale down transformation as future cards stack on top
  const scale = useTransform(progress, range, [1, targetScale]);

  return (
    <div
      ref={itemRef}
      className="sticky top-20 sm:top-24 md:top-28 flex items-center justify-center min-h-[460px] sm:min-h-[500px] py-4"
      style={{
        zIndex: i + 1,
      }}
    >
      <motion.div
        style={{
          scale,
        }}
        className={`w-full max-w-5xl rounded-3xl sm:rounded-[32px] p-6 sm:p-8 lg:p-10 border shadow-[0_20px_60px_rgba(0,0,0,0.06)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.4)] backdrop-blur-2xl transition-shadow ${card.cardBg}`}
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center">
          {/* Columna Izquierda: Información de la funcionalidad */}
          <div className="lg:col-span-6 space-y-4 text-left">
            <div className="flex items-center gap-3">
              <span
                className="flex h-9 w-9 items-center justify-center rounded-2xl text-xs font-black text-white shadow-sm"
                style={{ backgroundColor: card.accentColor }}
              >
                {card.step}
              </span>
              <div className="rounded-full border border-slate-200/80 dark:border-white/10 bg-slate-100/70 dark:bg-white/5 px-3 py-1">
                <span
                  className="text-[10px] font-extrabold uppercase tracking-wider"
                  style={{ color: card.accentColor }}
                >
                  {card.badge}
                </span>
              </div>
            </div>

            <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 dark:text-white leading-tight">
              {card.title}
            </h3>

            <p className="text-xs sm:text-sm lg:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
              {card.description}
            </p>

            {/* Métrica / Impacto Destacado */}
            <div className="pt-2 flex items-center gap-3">
              <div className="px-4 py-2 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 backdrop-blur-md">
                <span
                  className="block text-lg sm:text-xl font-black tracking-tight"
                  style={{ color: card.accentColor }}
                >
                  {card.stat}
                </span>
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                  {card.statLabel}
                </span>
              </div>
              <Link
                href="/onboarding"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white hover:text-[#FF4F2B] transition-colors group"
              >
                <span>Activar para mi negocio</span>
                <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Columna Derecha: Widget interactivo simulado */}
          <div className="lg:col-span-6 flex justify-center w-full">
            <CardVisualPreview type={card.previewType} accentColor={card.accentColor} />
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function CardVisualPreview({
  type,
  accentColor,
}: {
  type: StackingCardData["previewType"];
  accentColor: string;
}) {
  if (type === "omnichannel") {
    return <OmnichannelBeamCard />;
  }

  if (type === "whatsapp") {
    return (
      <div className="w-full max-w-sm rounded-2xl border border-slate-200/80 dark:border-white/15 bg-white/95 dark:bg-slate-950/80 p-4 shadow-md backdrop-blur-md space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/10 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs">
              WA
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">Bot Asistente AgendatePY</p>
              <p className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                En línea 24/7
              </p>
            </div>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">14:22</span>
        </div>

        <div className="space-y-2 text-[11.5px]">
          <div className="bg-slate-100 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 p-2.5 rounded-2xl rounded-tl-sm max-w-[85%] text-left">
            ¡Hola Camila! Tengo estos turnos libres para mañana en Peluquería:
          </div>
          <div className="flex flex-wrap gap-1.5 pt-1">
            <span className="px-2.5 py-1 rounded-full bg-[#FF4F2B]/10 border border-[#FF4F2B]/30 text-[#FF4F2B] font-bold text-[10.5px]">
              09:30 AM
            </span>
            <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-white/10 border border-slate-200/80 dark:border-white/15 text-slate-700 dark:text-slate-300 text-[10.5px]">
              14:00 PM
            </span>
            <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-white/10 border border-slate-200/80 dark:border-white/15 text-slate-700 dark:text-slate-300 text-[10.5px]">
              17:30 PM
            </span>
          </div>
          <div className="bg-emerald-50 dark:bg-emerald-600/20 border border-emerald-500/20 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-300 p-2 rounded-xl text-left flex items-center gap-2 mt-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
            <span>Turno confirmado automáticamente en tu agenda</span>
          </div>
        </div>
      </div>
    );
  }

  if (type === "transferencia") {
    return (
      <div className="w-full max-w-sm rounded-2xl border border-slate-200/80 dark:border-white/15 bg-white/95 dark:bg-slate-950/80 p-4 shadow-md backdrop-blur-md space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/10 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-xs">
              <Landmark className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">Transferencia Bancaria</p>
              <p className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">Validación Inmediata</p>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[9.5px] font-bold">
            Verificado
          </span>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 text-left space-y-1.5">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500 dark:text-slate-400">Concepto seña:</span>
            <span className="font-bold text-slate-900 dark:text-white">Corte & Barba Spa</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500 dark:text-slate-400">Monto acreditado:</span>
            <span className="font-black text-emerald-600 dark:text-emerald-400 text-sm">Gs. 80.000</span>
          </div>
          <div className="flex justify-between items-center text-[10.5px] text-slate-400 pt-1 border-t border-slate-200/60 dark:border-white/10">
            <span>Bancos aliados:</span>
            <span className="font-bold text-slate-700 dark:text-slate-200">Itaú · Ueno · Continental</span>
          </div>
        </div>
      </div>
    );
  }

  if (type === "reminder") {
    return (
      <div className="w-full max-w-sm rounded-2xl border border-slate-200/80 dark:border-white/15 bg-white/95 dark:bg-slate-950/80 p-4 shadow-md backdrop-blur-md space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/10 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-xs">
              <Bell className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">Recordatorio de Cita</p>
              <p className="text-[10px] text-purple-600 dark:text-purple-400 font-medium">Enviado 2h antes</p>
            </div>
          </div>
          <span className="text-[10px] text-slate-400">Auto</span>
        </div>

        <div className="space-y-2 text-left">
          <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-500/20 text-[11.5px] text-purple-900 dark:text-purple-200">
            Hola Diego, te recordamos tu turno hoy a las <strong>16:30 hs</strong> con el Dr. Martínez.
          </div>
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button className="px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold text-center">
              ✓ Confirmar
            </button>
            <button className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-white/10 border border-slate-200/80 dark:border-white/15 text-slate-700 dark:text-slate-300 text-xs font-medium text-center">
              Reprogramar
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (type === "cash") {
    return (
      <div className="w-full max-w-sm rounded-2xl border border-slate-200/80 dark:border-white/15 bg-white/95 dark:bg-slate-950/80 p-4 shadow-md backdrop-blur-md space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/10 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 flex items-center justify-center font-bold text-xs">
              <Coins className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">Cierre de Caja del Día</p>
              <p className="text-[10px] text-cyan-600 dark:text-cyan-400 font-medium">Cuadre exacto</p>
            </div>
          </div>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">100% Cuadrado</span>
        </div>

        <div className="space-y-1.5 text-xs text-left">
          <div className="flex justify-between p-2 rounded-xl bg-slate-50 dark:bg-white/5">
            <span className="text-slate-600 dark:text-slate-300">Total recaudado:</span>
            <span className="font-bold text-slate-900 dark:text-white">Gs. 2.450.000</span>
          </div>
          <div className="flex justify-between p-2 rounded-xl bg-slate-50 dark:bg-white/5">
            <span className="text-slate-600 dark:text-slate-300">Comisiones staff (40%):</span>
            <span className="font-bold text-cyan-600 dark:text-cyan-400">Gs. 980.000</span>
          </div>
          <div className="flex justify-between p-2 rounded-xl bg-slate-50 dark:bg-white/5">
            <span className="text-slate-600 dark:text-slate-300">Ganancia neta local:</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">Gs. 1.470.000</span>
          </div>
        </div>
      </div>
    );
  }

  // loyalty
  return (
    <div className="w-full max-w-sm rounded-2xl border border-slate-200/80 dark:border-white/15 bg-white/95 dark:bg-slate-950/80 p-4 shadow-md backdrop-blur-md space-y-3">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/10 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs">
            <Award className="h-4 w-4" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900 dark:text-white">Tarjeta Digital de Sellos</p>
            <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">Billetera digital en el celular</p>
          </div>
        </div>
        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">Nivel Oro</span>
      </div>

      <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 text-left space-y-2">
        <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
          Progreso de visitas: <strong>4 de 5 sellos</strong>
        </p>
        <div className="flex gap-2">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className="h-8 w-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center text-xs font-bold shadow-xs"
            >
              ✓
            </div>
          ))}
          <div className="h-8 w-8 rounded-xl border-2 border-dashed border-slate-300 dark:border-white/20 flex items-center justify-center text-[10px] font-bold text-slate-400">
            5º
          </div>
        </div>
        <p className="text-[10.5px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-200/60 dark:border-white/10">
          Próxima visita: <strong>Corte de cortesía 100% OFF</strong>
        </p>
      </div>
    </div>
  );
}
