"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarDays,
  Coins,
  Users,
  Award,
  CheckCircle2,
  CreditCard,
  Banknote,
  Clock,
  Scissors,
  Receipt,
  Gift,
  Crown,
  Percent,
  Check,
  Building2,
  Smartphone,
} from "lucide-react";

export default function Features() {
  const [activeTab, setActiveTab] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Estados interactivos para las micro-animaciones basadas en el sistema real
  const [stampCount, setStampCount] = useState(4);
  const [ticketIndex, setTicketIndex] = useState(0);
  const [activeStaff, setActiveStaff] = useState<"marcos" | "lucas">("marcos");

  // Auto-rotación entre las 4 pestañas cada 5 segundos
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setActiveTab((prev) => (prev + 1) % 4);
    }, 5000);
    return () => clearInterval(interval);
  }, [isPaused]);

  // Micro-animación para los movimientos de caja real (solo cuando la pestaña activa es Caja)
  useEffect(() => {
    if (activeTab !== 1) return;
    const ticketInterval = setInterval(() => {
      setTicketIndex((prev) => (prev + 1) % 3);
    }, 2800);
    return () => clearInterval(ticketInterval);
  }, [activeTab]);

  // Micro-animación de sellos de fidelización (solo cuando la pestaña activa es Fidelización)
  useEffect(() => {
    if (activeTab !== 3) return;
    const stampInterval = setInterval(() => {
      setStampCount((prev) => (prev >= 5 ? 1 : prev + 1));
    }, 3000);
    return () => clearInterval(stampInterval);
  }, [activeTab]);

  // Movimientos reales de caja del sistema
  const REAL_CASH_MOVEMENTS = [
    {
      concept: "Corte Degradé + Barba",
      amount: "Gs. 70.000",
      method: "Efectivo",
      icon: Banknote,
      color: "text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200/60 dark:border-emerald-800/40",
      client: "Lucas Romero",
      folio: "Ticket #1042",
    },
    {
      concept: "Tratamiento Capilar",
      amount: "Gs. 120.000",
      method: "POS Tarjeta",
      icon: CreditCard,
      color: "text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 border-blue-200/60 dark:border-blue-800/40",
      client: "Valeria Duarte",
      folio: "POS Lote #418",
    },
    {
      concept: "Transferencia Bancaria",
      amount: "Gs. 80.000",
      method: "Transferencia (Ueno)",
      icon: Building2,
      color: "text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 border-purple-200/60 dark:border-purple-800/40",
      client: "Carlos Benítez",
      folio: "Comprobante validado",
    },
  ];

  // Los 4 módulos operativos reales de AgendatePY según la especificación del sistema
  const PILLARS = [
    {
      id: "agenda",
      tabLabel: "Agenda & Calendario",
      shortLabel: "Agenda",
      category: "Gestión de Turnos",
      title: "Calendario visual por colaborador y cero choques",
      description: "Visualizá los turnos por profesional con colores distintivos, bloqueá descansos o feriados y coordiná tu equipo en tiempo real.",
      bullets: [
        "Vistas por colaborador con color propio",
        "Bloqueo de descansos y feriados",
        "Prevención de colisiones horarias",
      ],
      icon: CalendarDays,
      accentColor: "#FF4F2B",
    },
    {
      id: "caja",
      tabLabel: "Caja & Arqueo",
      shortLabel: "Caja",
      category: "Control Financiero",
      title: "Arqueo diario multimétodo en Guaraníes",
      description: "Apertura de caja chica, cobros en Efectivo, POS, QR y validación de transferencias bancarias con balance exacto al cierre.",
      bullets: [
        "Desglose en Efectivo, POS, Transferencias y QR",
        "Validación de comprobantes bancarios",
        "Arqueo de cierre sin descuadres",
      ],
      icon: Coins,
      accentColor: "#10B981",
    },
    {
      id: "comisiones",
      tabLabel: "Comisiones",
      shortLabel: "Comisiones",
      category: "Pago al Equipo",
      title: "Cálculo automático de comisiones y recibos oficiales",
      description: "Liquidación por servicios y productos con descuentos de vales y generación de recibo oficial con firma compartible por WhatsApp.",
      bullets: [
        "Porcentajes por servicio y producto",
        "Descuento automático de vales/adelantos",
        "Recibo oficial de liquidación con folio",
      ],
      icon: Users,
      accentColor: "#3B82F6",
    },
    {
      id: "fidelizacion",
      tabLabel: "Fidelización",
      shortLabel: "Fidelidad",
      category: "Club VIP de Clientes",
      title: "Sellos digitales y beneficios para clientes",
      description: "Premiá la recurrencia de tus clientes con sellos digitales automáticos por visita, directo en su celular sin descargar apps.",
      bullets: [
        "Tarjeta de sellos 100% digital",
        "Acumulación automática por visita",
        "Canje validado al cobrar en caja",
      ],
      icon: Award,
      accentColor: "#F59E0B",
    },
  ];

  const current = PILLARS[activeTab];

  return (
    <section
      id="caracteristicas"
      className="relative px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-14 sm:py-20 scroll-mt-24 select-none"
    >
      {/* Encabezado Conciso y Directo */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="text-center max-w-3xl mx-auto mb-8 sm:mb-10 space-y-2.5"
      >
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.12]">
          De la libreta de papel<br />
          al <span className="text-[#FF4F2B]">Control Total</span>
        </h2>

        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-xl mx-auto leading-relaxed">
          Herramientas operativas reales diseñadas para la gestión diaria de salones y consultorios en Paraguay.
        </p>
      </motion.div>

      {/* Selector de Pestañas con barra de progreso temporal y scroll optimizado en móvil */}
      <div className="flex flex-col items-center mb-6 sm:mb-8 px-1">
        <div className="grid w-full grid-cols-4 sm:inline-flex sm:w-auto p-1 sm:p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-white/10 max-w-full gap-1">
          {PILLARS.map((pillar, idx) => {
            const isActive = activeTab === idx;
            const Icon = pillar.icon;
            return (
              <button
                key={pillar.id}
                type="button"
                onClick={() => {
                  setActiveTab(idx);
                  setIsPaused(true);
                  setTimeout(() => setIsPaused(false), 8000);
                }}
                className={`relative flex min-h-14 sm:min-h-10 flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-1 sm:px-5 py-2 sm:py-2.5 rounded-xl text-[11px] sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap overflow-hidden active:scale-95 ${
                  isActive
                    ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <Icon
                  className="h-4.5 w-4.5 sm:h-4 sm:w-4 shrink-0"
                  style={{ color: isActive ? pillar.accentColor : "currentColor" }}
                />
                <span className="sm:hidden">{pillar.shortLabel}</span>
                <span className="hidden sm:inline">{pillar.tabLabel}</span>

                {/* Barra de progreso de auto-rotación */}
                {isActive && !isPaused && (
                  <motion.div
                    key={`bar-${activeTab}`}
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 5, ease: "linear" }}
                    className="absolute bottom-0 left-0 h-0.5 bg-[#FF4F2B]"
                  />
                )}
              </button>
            );
          })}
        </div>

      </div>

      {/* Contenedor Principal: Valor Conciso (Izquierda) + Widget Hero Real (Derecha) */}
      <div
        className="max-w-4xl mx-auto"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="rounded-2xl sm:rounded-3xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-slate-900 shadow-xl p-4 sm:p-7 text-left"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 lg:gap-8 items-stretch">
              
              {/* Lado Izquierdo: Titular, Resumen y Bullets */}
              <div className="lg:col-span-5 space-y-3.5 text-left flex flex-col justify-between h-full">
                <div>
                  <span className="text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 inline-block mb-2">
                    {current.category}
                  </span>

                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-tight">
                    {current.title}
                  </h3>

                  <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                    {current.description}
                  </p>
                </div>

                {/* 3 Bullets Rápidos con checkmarks */}
                <div className="pt-2 space-y-2 text-xs border-t border-slate-100 dark:border-slate-800/80">
                  {current.bullets.map((bullet) => (
                    <div key={bullet} className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                      <span>{bullet}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Lado Derecho: El Widget Ilustrado y con Datos Reales */}
              <div className="lg:col-span-7 flex flex-col justify-stretch h-full">
                
                {/* WIDGET 1: AGENDA & CALENDARIO (Módulo /dashboard/calendario) */}
                {current.id === "agenda" && (
                  <div className="rounded-2xl border border-slate-200/90 dark:border-white/10 bg-slate-50/70 dark:bg-slate-800/40 p-3.5 sm:p-5 space-y-3 text-left min-h-0 sm:min-h-[350px] flex flex-col justify-between h-full">
                    {/* Cabecera */}
                    <div className="flex items-center justify-between pb-2.5 border-b border-slate-200/70 dark:border-white/5 text-xs">
                      <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-slate-400" />
                        Agenda de Hoy · Vista por Colaborador
                      </span>
                      <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100/80 dark:bg-emerald-950/80 px-2 py-0.5 rounded-full flex items-center gap-1 border border-emerald-200/60 dark:border-emerald-800/40">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        2 colaboradores activos
                      </span>
                    </div>

                    {/* Columnas con Colaboradores y Códigos de Color Reales */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 items-stretch flex-1">
                      {/* Colaborador 1: Marcos Benítez (Barbero) */}
                      <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200/80 dark:border-white/5 space-y-2 flex flex-col justify-between h-full">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="h-6 w-6 rounded-lg bg-[#FF4F2B] text-white flex items-center justify-center text-[10px] font-black">
                              MB
                            </div>
                            <span className="font-bold text-slate-900 dark:text-white text-xs">Marcos B.</span>
                          </div>
                          <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded">
                            3 citas
                          </span>
                        </div>
                        <div className="space-y-1.5 text-[11px] flex-1 flex flex-col justify-center">
                          <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 flex justify-between items-center text-slate-700 dark:text-slate-300">
                            <span className="flex items-center gap-1.5">
                              <Scissors className="h-3 w-3 text-slate-400" />
                              14:00 Corte Degradé
                            </span>
                            <span className="font-bold text-emerald-600 text-[9px] uppercase">Completado</span>
                          </div>
                          <div className="p-1.5 rounded-lg bg-[#FF4F2B]/10 text-[#FF4F2B] flex justify-between items-center font-medium border border-[#FF4F2B]/20">
                            <span className="flex items-center gap-1.5 font-bold">
                              <span className="h-1.5 w-1.5 rounded-full bg-[#FF4F2B]" />
                              15:30 Barba & Spa
                            </span>
                            <span className="font-bold text-[9px] bg-[#FF4F2B] text-white px-1.5 py-0.2 rounded uppercase">En curso</span>
                          </div>
                          <div className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 flex justify-between items-center text-slate-500">
                            <span>17:00 Corte Clásico</span>
                            <span className="text-[9px] text-blue-600 font-bold uppercase">Confirmado</span>
                          </div>
                        </div>
                      </div>

                      {/* Colaborador 2: Lucas Vera (Estilista) */}
                      <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200/80 dark:border-white/5 space-y-2 flex flex-col justify-between h-full">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="h-6 w-6 rounded-lg bg-blue-600 text-white flex items-center justify-center text-[10px] font-black">
                              LV
                            </div>
                            <span className="font-bold text-slate-900 dark:text-white text-xs">Lucas V.</span>
                          </div>
                          <span className="text-[10px] font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-1.5 py-0.5 rounded">
                            2 citas
                          </span>
                        </div>
                        <div className="space-y-1.5 text-[11px] flex-1 flex flex-col justify-center">
                          <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 flex justify-between items-center text-slate-700 dark:text-slate-300">
                            <span>14:30 Lavado + Peinado</span>
                            <span className="font-bold text-emerald-600 text-[9px] uppercase">Completado</span>
                          </div>
                          <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 flex justify-between items-center font-medium border border-blue-200/50">
                            <span>16:00 Nutrición Capilar</span>
                            <span className="font-bold text-[9px] uppercase">Confirmado</span>
                          </div>
                          <div className="p-1.5 rounded-lg border border-dashed border-emerald-300 dark:border-emerald-800/50 bg-emerald-50/40 dark:bg-emerald-950/20 flex justify-between items-center text-emerald-700 dark:text-emerald-300">
                            <span>17:30 Horario libre</span>
                            <span className="text-[10px] font-bold text-emerald-600">+ Disponible</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Resumen inferior */}
                    <div className="flex items-center justify-between pt-1.5 text-xs border-t border-slate-200/60 dark:border-white/5">
                      <span className="text-slate-500 dark:text-slate-400 text-[11px]">Bloqueos activos:</span>
                      <span className="font-mono font-bold text-[#FF4F2B]">Cero superposiciones de turnos</span>
                    </div>
                  </div>
                )}

                {/* WIDGET 2: CONTROL DE CAJA & ARQUEO (Módulo /dashboard/caja) */}
                {current.id === "caja" && (
                  <div className="rounded-2xl border border-slate-200/90 dark:border-white/10 bg-slate-50/70 dark:bg-slate-800/40 p-3.5 sm:p-5 space-y-3 text-left min-h-0 sm:min-h-[350px] flex flex-col justify-between h-full">
                    {/* Cabecera */}
                    <div className="flex items-center justify-between pb-2.5 border-b border-slate-200/70 dark:border-white/5 text-xs">
                      <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                        <Coins className="h-3.5 w-3.5 text-emerald-500" />
                        Arqueo Diario de Caja Chica
                      </span>
                      <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100/80 dark:bg-emerald-950/80 px-2 py-0.5 rounded-full flex items-center gap-1 border border-emerald-200/60 dark:border-emerald-800/40">
                        <CheckCircle2 className="h-3 w-3" /> Balance Cuadrado
                      </span>
                    </div>

                    {/* 3 Métodos de cobro del sistema en Paraguay */}
                    <div className="grid grid-cols-3 gap-2 items-stretch">
                      <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200/80 dark:border-white/5 text-left flex flex-col justify-between h-full">
                        <div className="flex items-center gap-1 text-slate-400 mb-1">
                          <Banknote className="h-3.5 w-3.5 text-emerald-500" />
                          <span className="text-[10px] font-medium">Efectivo</span>
                        </div>
                        <div>
                          <span className="font-mono font-bold text-xs sm:text-sm text-slate-900 dark:text-white block">
                            780.000
                          </span>
                          <span className="text-[9px] text-slate-400">Gs.</span>
                        </div>
                      </div>

                      <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200/80 dark:border-white/5 text-left flex flex-col justify-between h-full">
                        <div className="flex items-center gap-1 text-slate-400 mb-1">
                          <CreditCard className="h-3.5 w-3.5 text-blue-500" />
                          <span className="text-[10px] font-medium">POS Tarjetas</span>
                        </div>
                        <div>
                          <span className="font-mono font-bold text-xs sm:text-sm text-slate-900 dark:text-white block">
                            950.000
                          </span>
                          <span className="text-[9px] text-slate-400">Gs.</span>
                        </div>
                      </div>

                      <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200/80 dark:border-white/5 text-left flex flex-col justify-between h-full">
                        <div className="flex items-center gap-1 text-slate-400 mb-1">
                          <Building2 className="h-3.5 w-3.5 text-purple-500" />
                          <span className="text-[10px] font-medium">Transferencia / QR</span>
                        </div>
                        <div>
                          <span className="font-mono font-bold text-xs sm:text-sm text-slate-900 dark:text-white block">
                            500.000
                          </span>
                          <span className="text-[9px] text-slate-400">Gs.</span>
                        </div>
                      </div>
                    </div>

                    {/* Movimiento de caja dinámico rotando */}
                    <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200/80 dark:border-white/5 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <Receipt className="h-4 w-4 text-slate-400 shrink-0" />
                        <div>
                          <span className="text-[11px] font-bold text-slate-900 dark:text-white block leading-tight">
                            {REAL_CASH_MOVEMENTS[ticketIndex].concept}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            Cliente: {REAL_CASH_MOVEMENTS[ticketIndex].client} · {REAL_CASH_MOVEMENTS[ticketIndex].folio}
                          </span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="font-mono font-extrabold text-slate-900 dark:text-white block text-xs">
                          {REAL_CASH_MOVEMENTS[ticketIndex].amount}
                        </span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded border inline-block ${REAL_CASH_MOVEMENTS[ticketIndex].color}`}>
                          {REAL_CASH_MOVEMENTS[ticketIndex].method}
                        </span>
                      </div>
                    </div>

                    {/* Resumen Total */}
                    <div className="flex items-center justify-between pt-1.5 text-xs border-t border-slate-200/60 dark:border-white/5">
                      <span className="text-slate-600 dark:text-slate-300 font-medium">Total facturado del día:</span>
                      <span className="font-mono font-extrabold text-[#10B981] text-sm">Gs. 2.230.000</span>
                    </div>
                  </div>
                )}

                {/* WIDGET 3: LIQUIDACIÓN DE COMISIONES (Módulo /dashboard/comisiones) */}
                {current.id === "comisiones" && (
                  <div className="rounded-2xl border border-slate-200/90 dark:border-white/10 bg-slate-50/70 dark:bg-slate-800/40 p-3.5 sm:p-5 space-y-3 text-left min-h-0 sm:min-h-[350px] flex flex-col justify-between h-full">
                    {/* Cabecera con selector real de staff */}
                    <div className="flex items-center justify-between pb-2.5 border-b border-slate-200/70 dark:border-white/5 text-xs">
                      <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                        <Percent className="h-3.5 w-3.5 text-blue-500" />
                        Liquidación Oficial de Staff
                      </span>
                      <div className="flex items-center gap-1 bg-white dark:bg-slate-900 p-0.5 rounded-lg border border-slate-200/80 dark:border-white/5">
                        <button
                          type="button"
                          onClick={() => setActiveStaff("marcos")}
                          className={`px-2.5 py-1.5 rounded text-[10px] font-bold transition cursor-pointer ${
                            activeStaff === "marcos" ? "bg-blue-600 text-white" : "text-slate-500"
                          }`}
                        >
                          Marcos (50%)
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveStaff("lucas")}
                          className={`px-2.5 py-1.5 rounded text-[10px] font-bold transition cursor-pointer ${
                            activeStaff === "lucas" ? "bg-blue-600 text-white" : "text-slate-500"
                          }`}
                        >
                          Lucas (45%)
                        </button>
                      </div>
                    </div>

                    {/* Ficha oficial de liquidación con folio */}
                    <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200/80 dark:border-white/5 space-y-2.5 flex-1 flex flex-col justify-between">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="h-7 w-7 rounded-lg bg-blue-600/10 text-blue-600 flex items-center justify-center font-bold text-xs">
                            {activeStaff === "marcos" ? "MB" : "LV"}
                          </div>
                          <div>
                            <strong className="text-slate-900 dark:text-white text-xs block leading-tight">
                              {activeStaff === "marcos" ? "Marcos Benítez" : "Lucas Vera"}
                            </strong>
                            <span className="text-[10px] text-slate-400">
                              {activeStaff === "marcos" ? "8 servicios + 2 productos" : "5 servicios realizados"}
                            </span>
                          </div>
                        </div>
                        <span className="shrink-0 whitespace-nowrap text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-md border border-blue-200/50">
                          {activeStaff === "marcos" ? "Recibo #REC-084" : "Recibo #REC-085"}
                        </span>
                      </div>

                      {/* Desglose de lo facturado por el colaborador */}
                      <div className="divide-y divide-dashed divide-slate-200 dark:divide-white/10 text-xs">
                        {(activeStaff === "marcos"
                          ? [
                              { label: "Servicios (8)", detail: "Comisión 50%", amount: "Gs. 540.000" },
                              { label: "Productos (2)", detail: "Sin comisión", amount: "Gs. 100.000" },
                            ]
                          : [
                              { label: "Servicios (5)", detail: "Comisión 45%", amount: "Gs. 300.000" },
                              { label: "Productos (0)", detail: "Sin comisión", amount: "Gs. 0" },
                            ]
                        ).map((row) => (
                          <div key={row.label} className="flex items-center justify-between py-2">
                            <div>
                              <span className="font-semibold text-slate-700 dark:text-slate-200 block leading-tight">{row.label}</span>
                              <span className="text-[10px] text-slate-400">{row.detail}</span>
                            </div>
                            <span className="font-mono font-bold text-slate-700 dark:text-slate-200">{row.amount}</span>
                          </div>
                        ))}
                      </div>

                      {/* Split de ingresos: Colaborador vs Local */}
                      <div className="grid grid-cols-2 gap-2 text-xs pt-0.5 items-stretch">
                        <div className="p-2 rounded-lg bg-blue-50/70 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/30 flex flex-col justify-between h-full">
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">Comisión a Pagar</span>
                          <span className="font-mono font-extrabold text-blue-600 dark:text-blue-400 text-xs sm:text-sm">
                            {activeStaff === "marcos" ? "Gs. 270.000" : "Gs. 135.000"}
                          </span>
                        </div>
                        <div className="p-2 rounded-lg bg-slate-100/80 dark:bg-slate-800 border border-slate-200/60 dark:border-white/5 flex flex-col justify-between h-full">
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">Margen del Local</span>
                          <span className="font-mono font-extrabold text-slate-700 dark:text-slate-200 text-xs sm:text-sm">
                            {activeStaff === "marcos" ? "Gs. 370.000" : "Gs. 165.000"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Resumen Total */}
                    <div className="flex items-center justify-between pt-1.5 text-xs border-t border-slate-200/60 dark:border-white/5">
                      <span className="text-slate-600 dark:text-slate-300 font-medium">Total facturado por profesional:</span>
                      <span className="font-mono font-extrabold text-[#3B82F6] text-sm">
                        {activeStaff === "marcos" ? "Gs. 640.000" : "Gs. 300.000"}
                      </span>
                    </div>
                  </div>
                )}

                {/* WIDGET 4: FIDELIZACIÓN (Módulo /dashboard/fidelizacion) */}
                {current.id === "fidelizacion" && (
                  <div className="rounded-2xl border border-slate-200/90 dark:border-white/10 bg-slate-50/70 dark:bg-slate-800/40 p-3.5 sm:p-5 space-y-3 text-left min-h-0 sm:min-h-[350px] flex flex-col justify-between h-full">
                    {/* Cabecera */}
                    <div className="flex items-center justify-between pb-2.5 border-b border-slate-200/70 dark:border-white/5 text-xs">
                      <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                        <Crown className="h-3.5 w-3.5 text-amber-500" />
                        Club de Fidelidad Digital
                      </span>
                      <span className="text-[11px] font-bold text-amber-700 dark:text-amber-300 bg-amber-100/80 dark:bg-amber-950/80 px-2 py-0.5 rounded-full border border-amber-200/60 dark:border-amber-800/40">
                        +35% Retorno
                      </span>
                    </div>

                    {/* Ficha del Cliente con Sellos Reales */}
                    <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200/80 dark:border-white/5 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="h-7 w-7 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold text-xs">
                            LR
                          </div>
                          <div>
                            <strong className="text-slate-900 dark:text-white text-xs block leading-tight">
                              Lucas Romero
                            </strong>
                            <span className="text-[10px] text-slate-400">
                              LTV acumulado: Gs. 480.000 (6 turnos)
                            </span>
                          </div>
                        </div>
                        <span className="text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-md border border-amber-200/50">
                          {stampCount} de 5 sellos
                        </span>
                      </div>

                      {/* Sellos de Fidelidad interactivos */}
                      <div className="flex items-center justify-between gap-1.5 pt-0.5">
                        {[1, 2, 3, 4, 5].map((s) => {
                          const isFilled = s <= stampCount;
                          const isReward = s === 5;
                          return (
                            <button
                              key={s}
                              type="button"
                              onClick={() => setStampCount(s)}
                              className={`h-9 flex-1 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center ${
                                isFilled
                                  ? isReward
                                    ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-xs scale-105"
                                    : "bg-amber-500 text-white shadow-xs"
                                  : "border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800 text-slate-400"
                              }`}
                            >
                              {isFilled ? (isReward ? <Gift className="h-4 w-4 text-white" /> : <Check className="h-4 w-4" />) : s}
                            </button>
                          );
                        })}
                      </div>

                      {/* Acceso digital directo sin descargas */}
                      <div className="flex items-center justify-between bg-slate-900 dark:bg-black text-white p-2.5 rounded-xl text-xs font-bold">
                        <div className="flex items-center gap-1.5 text-[11px]">
                          <Smartphone className="h-3.5 w-3.5 text-emerald-400" />
                          <span>Tarjeta Digital en el Celular</span>
                        </div>
                        <span className="text-[9.5px] font-normal text-slate-300 bg-white/10 px-2 py-0.5 rounded">
                          Sin descargas
                        </span>
                      </div>
                    </div>

                    {/* Resumen Total */}
                    <div className="flex items-center justify-between pt-1.5 text-xs border-t border-slate-200/60 dark:border-white/5">
                      <span className="text-slate-500 dark:text-slate-400 text-[11px]">Validación:</span>
                      <span className="font-bold text-amber-600 dark:text-amber-400">Canje en caja en 1 clic</span>
                    </div>
                  </div>
                )}

              </div>

            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
