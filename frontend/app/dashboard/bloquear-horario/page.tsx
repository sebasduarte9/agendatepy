"use client";

import { useState } from "react";
import {
  Ban,
  Clock,
  Plus,
  Trash2,
  Calendar,
  Sparkles,
  Coffee,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { useDashboardStore } from "@/store/useDashboardStore";
import Card from "@/components/dashboard/ui/Card";
import StatCard from "@/components/dashboard/ui/StatCard";
import Modal from "@/components/dashboard/ui/Modal";

const PRESETS = [
  { label: "Almuerzo (12:30 - 14:00)", start: "12:30", end: "14:00", reason: "Horario de almuerzo y descanso" },
  { label: "Capacitación (16:00 - 18:00)", start: "16:00", end: "18:00", reason: "Capacitación técnica y producto" },
  { label: "Cierre Temprano (18:00 - 21:00)", start: "18:00", end: "21:00", reason: "Cierre operativo adelantado" },
  { label: "Día Completo (08:00 - 20:00)", start: "08:00", end: "20:00", reason: "Feriado o permiso personal" },
];

export default function BloquearHorarioPage() {
  const { staff, blocks, addBlock, removeBlock, pushToast, splitComment, business } =
    useDashboardStore();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    staffId: staff[0]?.id ?? "",
    date: new Date().toISOString().slice(0, 10),
    start: "13:00",
    end: "14:30",
    reason: "Almuerzo y descanso",
  });

  function handleSaveBlock(e: React.FormEvent) {
    e.preventDefault();
    if (!form.staffId || !form.date || !form.start || !form.end) {
      pushToast("error", "Por favor completá todos los campos.");
      return;
    }

    addBlock(form);
    pushToast("success", "Excepción de horario guardada correctamente.");
    setOpen(false);
  }

  function applyPreset(preset: (typeof PRESETS)[number]) {
    setForm((prev) => ({
      ...prev,
      start: preset.start,
      end: preset.end,
      reason: preset.reason,
    }));
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            Bloqueos de Agenda & Excepciones
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 sm:text-sm">
            Pausá franjas horarias por almuerzos, permisos o feriados sin afectar los turnos ya confirmados.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            if (!form.staffId && staff[0]) {
              setForm((f) => ({ ...f, staffId: staff[0].id }));
            }
            setOpen(true);
          }}
          className="inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-2.5 text-xs font-bold text-white shadow-[0_4px_15px_rgba(99,102,241,0.25)] hover:opacity-95 transition"
        >
          <Plus className="h-4 w-4" />
          <span>Nuevo Bloqueo</span>
        </button>
      </div>

      {/* KPI Overview */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Total Excepciones Activas"
          value={`${blocks.length} franjas`}
          icon={Ban}
        />
        <StatCard
          label="Zona Horaria Comercial"
          value={business.timezone}
          icon={Clock}
        />
        <StatCard
          label="Equipo con Horarios"
          value={`${staff.length} profesionales`}
          icon={CheckCircle2}
        />
      </div>

      {/* Staff Schedules & Active Blocks */}
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {staff.map((person) => {
          const personBlocks = blocks.filter((b) => b.staffId === person.id);

          return (
            <Card
              key={person.id}
              className="flex flex-col justify-between hover:-translate-y-1 transition-all duration-300"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span
                      className="flex h-11 w-11 items-center justify-center rounded-2xl text-xs font-black text-white shadow-sm"
                      style={{ background: person.color }}
                    >
                      {person.avatar}
                    </span>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white text-base">
                        {person.name}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {person.role}
                      </p>
                    </div>
                  </div>

                  <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 text-[10px] font-bold text-slate-600 dark:text-slate-300">
                    {person.hours}
                  </span>
                </div>

                <div className="mt-4 border-t border-slate-100 dark:border-white/5 pt-3">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">
                    <span>Bloqueos programados:</span>
                    <span className="rounded-full bg-primary/10 px-2 py-0.2 text-primary font-bold">
                      {personBlocks.length}
                    </span>
                  </div>

                  {personBlocks.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-200 dark:border-white/10 p-4 text-center text-xs text-slate-400">
                      Sin bloqueos activos. Disponible todo el horario habitual.
                    </div>
                  ) : (
                    <ul className="space-y-2">
                      {personBlocks.map((block) => (
                        <li
                          key={block.id}
                          className="flex items-center justify-between rounded-2xl border border-slate-200/80 dark:border-white/10 bg-slate-50/60 dark:bg-slate-800/40 p-3 text-xs"
                        >
                          <div>
                            <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
                              <Calendar className="h-3.5 w-3.5 text-primary" />
                              <span>{block.date}</span>
                              <span>•</span>
                              <span className="text-primary font-mono">{block.start} - {block.end}</span>
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                              {block.reason || "Horario reservado / bloqueo"}
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              removeBlock(block.id);
                              pushToast("success", "Excepción eliminada.");
                            }}
                            className="flex h-7 w-7 items-center justify-center rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                            title="Eliminar bloqueo"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setForm((f) => ({ ...f, staffId: person.id }));
                  setOpen(true);
                }}
                className="mt-4 inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200/80 dark:border-white/10 bg-white/60 dark:bg-slate-800/60 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <Plus className="h-3.5 w-3.5 text-slate-400" />
                <span>Bloquear franja para {person.name.split(" ")[0]}</span>
              </button>
            </Card>
          );
        })}
      </div>

      {/* Modal: Nuevo Bloqueo */}
      <Modal open={open} title="Crear Bloqueo de Horario" onClose={() => setOpen(false)}>
        <form onSubmit={handleSaveBlock} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">
              Profesional *
            </label>
            <select
              value={form.staffId}
              onChange={(e) => setForm({ ...form, staffId: e.target.value })}
              className="w-full rounded-xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900 px-3 py-2 text-slate-900 dark:text-white focus:border-primary focus:outline-none"
            >
              {staff.map((person) => (
                <option key={person.id} value={person.id}>
                  {person.name} ({person.hours})
                </option>
              ))}
            </select>
          </div>

          {/* Quick Presets */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
              Atajos Rápidos:
            </label>
            <div className="grid grid-cols-2 gap-2">
              {PRESETS.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => applyPreset(p)}
                  className="rounded-xl border border-slate-200/80 dark:border-white/10 bg-slate-50/70 dark:bg-slate-800/50 p-2 text-left hover:border-primary hover:bg-primary/5 transition text-[11px]"
                >
                  <p className="font-bold text-slate-800 dark:text-slate-200">{p.label}</p>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">
              Fecha del Bloqueo *
            </label>
            <input
              type="date"
              required
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="w-full rounded-xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900 px-3 py-2 text-slate-900 dark:text-white focus:border-primary focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">
                Hora de Inicio *
              </label>
              <input
                type="time"
                required
                value={form.start}
                onChange={(e) => setForm({ ...form, start: e.target.value })}
                className="w-full rounded-xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900 px-3 py-2 text-slate-900 dark:text-white focus:border-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">
                Hora de Fin *
              </label>
              <input
                type="time"
                required
                value={form.end}
                onChange={(e) => setForm({ ...form, end: e.target.value })}
                className="w-full rounded-xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900 px-3 py-2 text-slate-900 dark:text-white focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">
              Motivo o Detalle
            </label>
            <input
              type="text"
              placeholder="Ej: Turno médico, descanso, almuerzo..."
              value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
              className="w-full rounded-xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900 px-3 py-2 text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-primary focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-xl border border-slate-200/80 dark:border-white/10 px-4 py-2 font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="rounded-xl bg-primary px-5 py-2 font-bold text-white shadow-md hover:opacity-95 transition"
            >
              Guardar Bloqueo
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
