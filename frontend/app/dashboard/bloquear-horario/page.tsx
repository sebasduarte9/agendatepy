"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Clock,
  Calendar,
  ShieldAlert,
  Plus,
  Trash2,
  Users,
  Coffee,
  Utensils,
  Sun,
  AlertCircle,
  CheckCircle2,
  CalendarOff,
  Search,
  ArrowRight,
  Filter,
  Sparkles,
  Lock,
  X,
} from "lucide-react";
import { useDashboardStore } from "@/store/useDashboardStore";
import Card from "@/components/dashboard/ui/Card";
import Modal from "@/components/dashboard/ui/Modal";
import CustomSelect from "@/components/dashboard/ui/CustomSelect";
import IosSegmentedControl from "@/components/dashboard/ui/IosSegmentedControl";
import { triggerHaptic } from "@/lib/haptics";
import type { TimeBlock, StaffMember } from "@/lib/dashboard-types";

// Common preset reasons
const PRESET_REASONS = [
  { label: "Almuerzo", icon: Utensils, defaultStart: "12:00", defaultEnd: "13:00" },
  { label: "Pausa / Café", icon: Coffee, defaultStart: "16:00", defaultEnd: "16:30" },
  { label: "Vacaciones", icon: Sun, defaultStart: "08:00", defaultEnd: "20:00" },
  { label: "Capacitación", icon: Sparkles, defaultStart: "08:00", defaultEnd: "10:00" },
  { label: "Asunto Personal", icon: Clock, defaultStart: "14:00", defaultEnd: "15:00" },
  { label: "Cierre / Feriado", icon: Lock, defaultStart: "08:00", defaultEnd: "21:00" },
];

export default function BloquearHorarioPage() {
  const { business, staff, blocks, addBlock, removeBlock, pushToast } = useDashboardStore();
  const brandColor = business.primaryColor || "var(--primary, #FF4F2B)";

  // Filter state
  const [selectedStaffFilter, setSelectedStaffFilter] = useState<string>("ALL");
  const [timeFilter, setTimeFilter] = useState<"today" | "upcoming" | "all">("upcoming");
  const [searchQuery, setSearchQuery] = useState("");

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formStaffId, setFormStaffId] = useState<string>("all");
  const [formDate, setFormDate] = useState<string>(() => new Date().toISOString().split("T")[0]);
  const [formStart, setFormStart] = useState("12:00");
  const [formEnd, setFormEnd] = useState("13:00");
  const [formReason, setFormReason] = useState("Almuerzo");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Staff map lookup
  const staffMap = useMemo(() => {
    const map = new Map<string, StaffMember>();
    staff.forEach((st) => map.set(st.id, st));
    return map;
  }, [staff]);

  const todayStr = useMemo(() => new Date().toISOString().split("T")[0], []);

  // Format date helper for human-readable display
  const formatDisplayDate = (dateStr: string) => {
    if (dateStr === todayStr) return "Hoy";
    try {
      const parts = dateStr.split("-");
      if (parts.length === 3) {
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const day = parseInt(parts[2], 10);
        const d = new Date(year, month, day);
        return d.toLocaleDateString("es-PY", {
          weekday: "short",
          day: "numeric",
          month: "short",
        });
      }
      return dateStr;
    } catch {
      return dateStr;
    }
  };

  // Filtered blocks
  const filteredBlocks = useMemo(() => {
    return (blocks || [])
      .filter((b) => {
        // Staff filter
        if (selectedStaffFilter !== "ALL") {
          if (b.staffId !== selectedStaffFilter && b.staffId !== "all" && b.staffId !== null) {
            return false;
          }
        }

        // Timeframe filter
        if (timeFilter === "today") {
          if (b.date !== todayStr) return false;
        } else if (timeFilter === "upcoming") {
          if (b.date < todayStr) return false;
        }

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchReason = (b.reason || "").toLowerCase().includes(q);
          const st = b.staffId ? staffMap.get(b.staffId) : null;
          const matchStaff = st?.name.toLowerCase().includes(q);
          if (!matchReason && !matchStaff) return false;
        }

        return true;
      })
      .sort((a, b) => {
        const dateA = `${a.date}T${a.start}`;
        const dateB = `${b.date}T${b.start}`;
        return dateA.localeCompare(dateB);
      });
  }, [blocks, selectedStaffFilter, timeFilter, searchQuery, todayStr, staffMap]);

  // Telemetry metrics
  const telemetry = useMemo(() => {
    const all = blocks || [];
    const todayBlocks = all.filter((b) => b.date === todayStr);
    const upcomingBlocks = all.filter((b) => b.date >= todayStr);
    const uniqueStaffIds = new Set(
      all.filter((b) => b.staffId && b.staffId !== "all").map((b) => b.staffId)
    );

    // Approximate blocked ratio (max 100)
    const activeGauge = Math.min(100, (upcomingBlocks.length / (staff.length || 1)) * 25);

    return {
      total: all.length,
      today: todayBlocks.length,
      upcoming: upcomingBlocks.length,
      staffCount: uniqueStaffIds.size,
      gaugePct: Math.round(activeGauge),
    };
  }, [blocks, todayStr, staff.length]);

  // Handle create block
  const handleCreateBlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formDate || !formStart || !formEnd) {
      pushToast("error", "Completá la fecha y los horarios de inicio y fin.");
      return;
    }

    if (formStart >= formEnd) {
      pushToast("error", "La hora de inicio debe ser anterior a la hora de finalización.");
      return;
    }

    setIsSubmitting(true);
    try {
      await addBlock({
        staffId: formStaffId === "all" ? "all" : formStaffId,
        date: formDate,
        start: formStart,
        end: formEnd,
        reason: formReason.trim() || "Bloqueo operativo",
      });

      const staffName = formStaffId === "all" ? "Todo el equipo" : staffMap.get(formStaffId)?.name || "Colaborador";
      pushToast("success", `Bloqueo guardado para ${staffName} (${formStart} a ${formEnd} hs).`);
      setIsModalOpen(false);
    } catch (err) {
      pushToast("error", "No se pudo guardar el bloqueo horario.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Quick 1-click preset adder
  const handleQuickAdd = async (preset: (typeof PRESET_REASONS)[0]) => {
    try {
      await addBlock({
        staffId: selectedStaffFilter === "ALL" ? "all" : selectedStaffFilter,
        date: todayStr,
        start: preset.defaultStart,
        end: preset.defaultEnd,
        reason: preset.label,
      });
      pushToast("success", `Bloqueo rápido "${preset.label}" aplicado para hoy.`);
    } catch (e) {
      pushToast("error", "Error al aplicar el bloqueo rápido.");
    }
  };

  // Staff options for dropdowns
  const staffFilterOptions = useMemo(() => {
    return [
      {
        value: "ALL",
        label: `Todo el equipo (${staff.length})`,
        icon: <Users className="h-3.5 w-3.5" style={{ color: brandColor }} />,
      },
      ...staff.map((s) => ({
        value: s.id,
        label: s.name,
        subtitle: s.role,
        color: s.color,
      })),
    ];
  }, [staff, brandColor]);

  const formStaffOptions = useMemo(() => {
    return [
      {
        value: "all",
        label: "Todo el equipo (Cerrar local / Feriado)",
        subtitle: "Aplica a todos los colaboradores en agenda",
        icon: <ShieldAlert className="h-3.5 w-3.5 text-amber-500" />,
      },
      ...staff.map((s) => ({
        value: s.id,
        label: s.name,
        subtitle: s.role,
        color: s.color,
      })),
    ];
  }, [staff]);

  return (
    <div className="mx-auto max-w-7xl space-y-4 sm:space-y-5 pb-20 px-1 sm:px-0">
      {/* ═══ APPLE APP HEADER ═══ */}
      <div className="flex items-center justify-between py-1">
        <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
          Bloquear Horarios
        </h1>

        {/* Action Dock */}
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/calendario"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#121215] px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 shadow-xs hover:bg-slate-50 dark:hover:bg-white/5 transition"
          >
            <Calendar className="h-3.5 w-3.5 text-slate-400" />
            <span className="hidden sm:inline">Ver Agenda</span>
          </Link>

          <button
            type="button"
            onClick={() => {
              triggerHaptic("selection");
              setFormStaffId(selectedStaffFilter !== "ALL" ? selectedStaffFilter : "all");
              setFormDate(todayStr);
              setFormStart("12:00");
              setFormEnd("13:00");
              setFormReason("Almuerzo");
              setIsModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-white shadow-xs transition hover:brightness-110 active:scale-95 cursor-pointer"
            style={{
              backgroundColor: brandColor,
            }}
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Bloquear</span>
          </button>
        </div>
      </div>

      {/* ═══ MOBILE APPLE GLANCEABLE HERO CARD ═══ */}
      <div className="block md:hidden p-4 rounded-3xl bg-white dark:bg-[#121215] border border-slate-200/80 dark:border-white/10 shadow-xs space-y-3">
        {/* Top bar with status and live badge */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <CalendarOff className="h-4 w-4" />
            </div>
            <span className="text-xs font-black tracking-tight text-slate-900 dark:text-white">
              Horarios Protegidos
            </span>
          </div>

          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 font-mono">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <span>{telemetry.upcoming} en agenda</span>
          </span>
        </div>

        {/* 3-Column Mini KPI Metrics */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/5">
            <span className="text-[10px] text-slate-400 font-medium block">Hoy</span>
            <span className="font-mono font-black text-sm text-slate-900 dark:text-white">
              {telemetry.today}
            </span>
          </div>
          <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/5">
            <span className="text-[10px] text-slate-400 font-medium block">Próximos</span>
            <span className="font-mono font-black text-sm text-indigo-600 dark:text-indigo-400">
              {telemetry.upcoming}
            </span>
          </div>
          <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/5">
            <span className="text-[10px] text-slate-400 font-medium block">Personal</span>
            <span className="font-mono font-black text-sm text-slate-900 dark:text-white">
              {telemetry.staffCount}
            </span>
          </div>
        </div>

        {/* Mobile Fast Presets Horizontal Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none -mx-1 px-1">
          {PRESET_REASONS.map((preset) => {
            const Icon = preset.icon;
            return (
              <button
                key={preset.label}
                type="button"
                onClick={() => {
                  triggerHaptic("medium");
                  handleQuickAdd(preset);
                }}
                className="inline-flex items-center gap-1.5 shrink-0 px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 active:scale-95 transition text-[11px] font-bold text-slate-700 dark:text-slate-200 border border-slate-200/60 dark:border-white/5 cursor-pointer"
              >
                <Icon className="h-3 w-3 text-slate-400" />
                <span>{preset.label}</span>
                <span className="text-[9px] font-mono text-slate-400">
                  {preset.defaultStart}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ═══ DESKTOP APPLE INSET CONTAINER: TELEMETRY & PRESET DOCK ═══ */}
      <div className="hidden md:block rounded-3xl bg-slate-100/90 dark:bg-[#121215] border border-slate-200/80 dark:border-white/10 p-4 sm:p-5 shadow-xs space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Card 1: Telemetry Gauges & Counter Cards */}
          <div className="lg:col-span-7 rounded-2xl bg-white dark:bg-slate-950 p-5 border border-slate-200/70 dark:border-white/10 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/10">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                    <CalendarOff className="h-4 w-4" />
                  </div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                    Horarios Protegidos
                  </span>
                </div>
                <span className="text-[11px] font-mono font-bold text-slate-500 dark:text-slate-400">
                  {telemetry.upcoming} en agenda
                </span>
              </div>

              {/* Gauges & Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                {/* Circular Gauge */}
                <div className="flex items-center gap-4 p-3 rounded-xl bg-slate-50/80 dark:bg-white/[0.03] border border-slate-100 dark:border-white/10">
                  <div className="relative h-14 w-14 shrink-0 flex items-center justify-center">
                    <svg className="h-14 w-14 -rotate-90" viewBox="0 0 44 44">
                      <circle
                        cx="22"
                        cy="22"
                        r="18"
                        className="text-slate-200 dark:text-slate-800"
                        strokeWidth="4"
                        stroke="currentColor"
                        fill="transparent"
                      />
                      <circle
                        cx="22"
                        cy="22"
                        r="18"
                        strokeWidth="4"
                        strokeDasharray={113}
                        strokeDashoffset={113 - (113 * Math.min(100, telemetry.gaugePct)) / 100}
                        strokeLinecap="round"
                        stroke={brandColor}
                        fill="transparent"
                        className="transition-all duration-700 ease-out"
                      />
                    </svg>
                    <span className="absolute font-mono font-bold text-xs text-slate-800 dark:text-white">
                      {telemetry.gaugePct}%
                    </span>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">
                      Carga de Pausas
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                      {telemetry.staffCount} colaboradores
                    </span>
                  </div>
                </div>

                {/* Today Status Card */}
                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50/80 dark:bg-white/[0.03] border border-slate-100 dark:border-white/10">
                  <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shrink-0">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">
                      Bloqueos Hoy
                    </span>
                    <span className="text-base font-extrabold font-mono text-slate-900 dark:text-white">
                      {telemetry.today} intervalos
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick KPI Bar */}
            <div className="grid grid-cols-3 gap-2 pt-4 mt-4 border-t border-slate-100 dark:border-white/10 text-center">
              <div className="p-2 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/10">
                <span className="text-[10px] text-slate-400 font-semibold block">Total</span>
                <span className="font-mono font-extrabold text-xs text-slate-900 dark:text-white">
                  {telemetry.total}
                </span>
              </div>
              <div className="p-2 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/10">
                <span className="text-[10px] text-slate-400 font-semibold block">Próximos</span>
                <span className="font-mono font-extrabold text-xs text-indigo-600 dark:text-indigo-400">
                  {telemetry.upcoming}
                </span>
              </div>
              <div className="p-2 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/10">
                <span className="text-[10px] text-slate-400 font-semibold block">Personal</span>
                <span className="font-mono font-extrabold text-xs text-slate-900 dark:text-white">
                  {telemetry.staffCount}
                </span>
              </div>
            </div>
          </div>

          {/* Card 2: 1-Click Fast Presets */}
          <div className="lg:col-span-5 rounded-2xl bg-white dark:bg-slate-950 p-5 border border-slate-200/70 dark:border-white/10 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/10">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                    Atajos Rápidos
                  </span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/10 text-slate-500 font-semibold">
                  Hoy
                </span>
              </div>

              {/* Fast Presets Grid */}
              <div className="grid grid-cols-2 gap-2 pt-3">
                {PRESET_REASONS.map((preset) => {
                  const Icon = preset.icon;
                  return (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => {
                        triggerHaptic("medium");
                        handleQuickAdd(preset);
                      }}
                      className="flex flex-col text-left p-2.5 rounded-xl border border-slate-200/80 dark:border-white/10 hover:border-primary/50 hover:bg-slate-50 dark:hover:bg-white/[0.03] transition group cursor-pointer"
                    >
                      <div className="flex items-center justify-between">
                        <Icon className="h-4 w-4 text-slate-500 group-hover:text-primary transition" />
                        <span className="text-[10px] font-mono text-slate-400">
                          {preset.defaultStart}
                        </span>
                      </div>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1.5 group-hover:text-primary transition">
                        {preset.label}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {preset.defaultStart} - {preset.defaultEnd}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-3 mt-3 border-t border-slate-100 dark:border-white/10 flex items-center justify-end">
              <button
                type="button"
                onClick={() => {
                  triggerHaptic("selection");
                  setIsModalOpen(true);
                }}
                className="text-xs font-bold hover:underline cursor-pointer flex items-center gap-1"
                style={{ color: brandColor }}
              >
                <span>Personalizar horario</span>
                <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ FILTER DOCK & SEARCH ═══ */}
      <div className="flex flex-col gap-3 bg-white dark:bg-[#121215] p-3.5 sm:p-4 rounded-3xl border border-slate-200/80 dark:border-white/10 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Timeframe Filter with IosSegmentedControl */}
          <div className="w-full sm:w-auto">
            <IosSegmentedControl
              value={timeFilter}
              onChange={(val) => {
                triggerHaptic("selection");
                setTimeFilter(val);
              }}
              layoutId="bloquearHorarioTimeFilter"
              size="sm"
              options={[
                { value: "today", label: "Hoy", badge: telemetry.today > 0 ? telemetry.today : undefined },
                { value: "upcoming", label: "Próximos", badge: telemetry.upcoming > 0 ? telemetry.upcoming : undefined },
                { value: "all", label: "Todos", badge: telemetry.total > 0 ? telemetry.total : undefined },
              ]}
            />
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            {/* Specialist Filter */}
            <div className="min-w-[190px]">
              <CustomSelect
                value={selectedStaffFilter}
                onChange={(val) => {
                  triggerHaptic("selection");
                  setSelectedStaffFilter(val);
                }}
                options={staffFilterOptions}
                buttonClassName="w-full bg-slate-50 dark:bg-white/5 text-xs py-2 rounded-xl border border-slate-200/80 dark:border-white/10"
              />
            </div>

            {/* Search Input */}
            <div className="relative min-w-[200px]">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por motivo o nombre..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-8 py-2 text-xs rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-primary transition"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ═══ MOBILE APPLE INSET GROUPED LIST ═══ */}
      <div className="md:hidden">
        {filteredBlocks.length === 0 ? (
          <div className="p-8 text-center rounded-3xl bg-white dark:bg-[#121215] border border-slate-200/80 dark:border-white/10 shadow-xs space-y-3">
            <div className="mx-auto w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400">
              <CalendarOff className="h-6 w-6" />
            </div>
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
              Sin bloqueos registrados
            </h3>
            <button
              type="button"
              onClick={() => {
                triggerHaptic("selection");
                setIsModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white transition active:scale-95 cursor-pointer"
              style={{ backgroundColor: brandColor }}
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Bloquear Horario</span>
            </button>
          </div>
        ) : (
          <div className="rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#121215] divide-y divide-slate-100 dark:divide-white/5 shadow-xs overflow-hidden">
            {filteredBlocks.map((block) => {
              const isAllStaff = !block.staffId || block.staffId === "all";
              const st = !isAllStaff && block.staffId ? staffMap.get(block.staffId) : null;
              const isToday = block.date === todayStr;

              return (
                <div
                  key={block.id}
                  className="p-3.5 flex items-center justify-between gap-3 active:bg-slate-50 dark:active:bg-white/[0.03] transition"
                >
                  {/* Left: Avatar & Info */}
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Squircle Avatar */}
                    {isAllStaff ? (
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-600 shadow-xs">
                        <ShieldAlert className="h-5 w-5" />
                      </div>
                    ) : (
                      <div
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-white font-black text-xs shadow-xs"
                        style={{ backgroundColor: st?.color || brandColor }}
                      >
                        {st?.avatar || (st?.name ? st.name.slice(0, 2).toUpperCase() : "ST")}
                      </div>
                    )}

                    {/* Meta info */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-extrabold text-xs text-slate-900 dark:text-white truncate">
                          {block.reason || "Pausa operativa"}
                        </span>
                        {isToday ? (
                          <span className="px-1.5 py-0.5 rounded-md text-[9px] font-black bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20 shrink-0">
                            HOY
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 font-mono shrink-0">
                            {formatDisplayDate(block.date)}
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                        {isAllStaff ? "Todo el equipo" : st?.name || "Colaborador"}
                      </p>

                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono mt-1">
                        <Clock className="h-3 w-3 text-slate-400" />
                        <span className="font-bold text-slate-700 dark:text-slate-300">
                          {block.start} - {block.end} hs
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Quick Action to Release Time */}
                  <button
                    type="button"
                    onClick={async () => {
                      triggerHaptic("medium");
                      try {
                        await removeBlock(block.id);
                        pushToast("success", "Bloqueo liberado.");
                      } catch (e) {
                        pushToast("error", "Error al eliminar el bloqueo.");
                      }
                    }}
                    className="p-2.5 rounded-2xl bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 border border-rose-500/20 hover:scale-105 active:scale-95 transition shrink-0 cursor-pointer"
                    title="Liberar horario"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ═══ DESKTOP GRID VIEW ═══ */}
      <div className="hidden md:block space-y-3">
        {filteredBlocks.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-white dark:bg-[#121215] border border-slate-200/80 dark:border-white/10 shadow-xs space-y-3">
            <div className="mx-auto w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400">
              <CalendarOff className="h-6 w-6" />
            </div>
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
              Sin bloqueos registrados
            </h3>
            <button
              type="button"
              onClick={() => {
                triggerHaptic("selection");
                setIsModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white transition hover:brightness-110 cursor-pointer"
              style={{ backgroundColor: brandColor }}
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Crear Bloqueo de Horario</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredBlocks.map((block) => {
              const isAllStaff = !block.staffId || block.staffId === "all";
              const st = !isAllStaff && block.staffId ? staffMap.get(block.staffId) : null;
              const isToday = block.date === todayStr;

              return (
                <div
                  key={block.id}
                  className="p-4 rounded-3xl bg-white dark:bg-[#121215] border border-slate-200/80 dark:border-white/10 hover:border-primary/40 transition shadow-xs flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    {/* Top: Date & Today badge */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-black text-slate-900 dark:text-white">
                          {formatDisplayDate(block.date)}
                        </span>
                        {isToday && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                            HOY
                          </span>
                        )}
                      </div>

                      {/* Time Interval Pill */}
                      <span className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-white/5 text-xs font-mono font-extrabold text-slate-800 dark:text-slate-200 border border-slate-200/60 dark:border-white/10">
                        {block.start} - {block.end} hs
                      </span>
                    </div>

                    {/* Specialist Row */}
                    <div className="flex items-center gap-2.5 pt-1">
                      {isAllStaff ? (
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/15 text-amber-600 shrink-0">
                          <ShieldAlert className="h-4 w-4" />
                        </div>
                      ) : (
                        <div
                          className="flex h-9 w-9 items-center justify-center rounded-xl text-white font-black text-xs shrink-0"
                          style={{ backgroundColor: st?.color || brandColor }}
                        >
                          {st?.avatar || (st?.name ? st.name.slice(0, 2).toUpperCase() : "ST")}
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <span className="font-extrabold text-xs text-slate-900 dark:text-white truncate block">
                          {isAllStaff ? "Todo el equipo" : st?.name || "Colaborador"}
                        </span>
                        <span className="text-[10px] text-slate-400 truncate block">
                          {block.reason || "Pausa operativa"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Footer with Delete Action */}
                  <div className="pt-3 mt-3 border-t border-slate-100 dark:border-white/10 flex items-center justify-end">
                    <button
                      type="button"
                      onClick={async () => {
                        triggerHaptic("medium");
                        try {
                          await removeBlock(block.id);
                          pushToast("success", "Bloqueo horario liberado.");
                        } catch (e) {
                          pushToast("error", "No se pudo eliminar el bloqueo.");
                        }
                      }}
                      className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 px-2.5 py-1 rounded-xl transition cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Liberar</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ═══ MODAL: CREAR BLOQUEO HORARIO ═══ */}
      <Modal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        maxWidth="max-w-lg"
        minHeight="min-h-[520px]"
        title="Crear Bloqueo de Horario"
      >
        <form onSubmit={handleCreateBlock} className="space-y-4 text-xs">
          {/* Specialist */}
          <div>
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
              Colaborador *
            </label>
            <CustomSelect
              value={formStaffId}
              onChange={(val) => {
                triggerHaptic("selection");
                setFormStaffId(val);
              }}
              options={formStaffOptions}
              className="w-full"
              buttonClassName="w-full bg-slate-50 dark:bg-white/5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-xs"
            />
          </div>

          {/* Date Picker */}
          <div>
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
              Fecha *
            </label>
            <input
              type="date"
              value={formDate}
              onChange={(e) => setFormDate(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white outline-none focus:border-primary"
              required
            />
          </div>

          {/* Time Range */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                Inicio *
              </label>
              <input
                type="time"
                value={formStart}
                onChange={(e) => setFormStart(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 px-3 py-2.5 text-xs font-mono font-bold text-slate-900 dark:text-white outline-none focus:border-primary"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                Fin *
              </label>
              <input
                type="time"
                value={formEnd}
                onChange={(e) => setFormEnd(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 px-3 py-2.5 text-xs font-mono font-bold text-slate-900 dark:text-white outline-none focus:border-primary"
                required
              />
            </div>
          </div>

          {/* Preset Reason Chips */}
          <div>
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
              Motivo
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {PRESET_REASONS.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => {
                    triggerHaptic("selection");
                    setFormReason(p.label);
                    setFormStart(p.defaultStart);
                    setFormEnd(p.defaultEnd);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-[11px] font-semibold transition border cursor-pointer ${
                    formReason === p.label
                      ? "bg-primary text-white border-primary shadow-xs"
                      : "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 border-slate-200/80 dark:border-white/10 hover:bg-slate-200"
                  }`}
                  style={formReason === p.label ? { backgroundColor: brandColor, borderColor: brandColor } : {}}
                >
                  {p.label}
                </button>
              ))}
            </div>

            <input
              type="text"
              value={formReason}
              onChange={(e) => setFormReason(e.target.value)}
              placeholder="Motivo del bloqueo..."
              className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white outline-none focus:border-primary"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-white/10">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="rounded-xl border border-slate-200 dark:border-white/10 px-4 py-2.5 font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl px-5 py-2.5 font-black text-white shadow-md transition hover:brightness-110 disabled:opacity-50 cursor-pointer"
              style={{ backgroundColor: brandColor }}
            >
              {isSubmitting ? "Guardando..." : "Guardar Bloqueo"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

