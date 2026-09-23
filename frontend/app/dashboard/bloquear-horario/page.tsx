"use client";

import { useState } from "react";
import { useDashboardStore } from "@/store/useDashboardStore";
import Card from "@/components/dashboard/ui/Card";
import Modal from "@/components/dashboard/ui/Modal";

export default function BloquearHorarioPage() {
  const { staff, blocks, addBlock, removeBlock, pushToast, splitComment, business } =
    useDashboardStore();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    staffId: staff[0]?.id ?? "",
    date: "2026-09-22",
    start: "22:00",
    end: "02:00",
    reason: "Bloqueo nocturno",
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Bloquear horario</h1>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white"
        >
          Nuevo bloqueo
        </button>
      </div>
      <p className="text-xs text-slate-400">
        TZ del local: {business.timezone}. {splitComment}
      </p>
      <div className="grid gap-4 md:grid-cols-2">
        {staff.map((person) => (
          <Card key={person.id} className="staff-card">
            <div className="flex items-center gap-3">
              <span
                className="flex h-11 w-11 items-center justify-center rounded-full text-xs font-bold text-white"
                style={{ background: person.color }}
              >
                {person.avatar}
              </span>
              <div>
                <p className="font-bold">{person.name}</p>
                <p className="text-sm text-slate-500">Regular: {person.hours}</p>
              </div>
            </div>
            <ul className="mt-4 space-y-2">
              {blocks
                .filter((b) => b.staffId === person.id)
                .map((block) => (
                  <li
                    key={block.id}
                    className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-sm"
                  >
                    <span>
                      {block.date} · {block.start}-{block.end} · {block.reason}
                    </span>
                    <button
                      type="button"
                      className="text-rose-600"
                      onClick={() => {
                        removeBlock(block.id);
                        pushToast("success", "Excepción eliminada");
                      }}
                    >
                      Eliminar
                    </button>
                  </li>
                ))}
              {blocks.filter((b) => b.staffId === person.id).length === 0 && (
                <li className="text-sm text-slate-400">Sin excepciones</li>
              )}
            </ul>
          </Card>
        ))}
      </div>

      <Modal open={open} title="Crear bloqueo" onClose={() => setOpen(false)}>
        <div className="space-y-3 text-sm">
          <select
            className="w-full rounded-xl border border-border px-3 py-2"
            value={form.staffId}
            onChange={(e) => setForm({ ...form, staffId: e.target.value })}
          >
            {staff.map((person) => (
              <option key={person.id} value={person.id}>
                {person.name}
              </option>
            ))}
          </select>
          <input
            type="date"
            className="w-full rounded-xl border border-border px-3 py-2"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              type="time"
              className="rounded-xl border border-border px-3 py-2"
              value={form.start}
              onChange={(e) => setForm({ ...form, start: e.target.value })}
            />
            <input
              type="time"
              className="rounded-xl border border-border px-3 py-2"
              value={form.end}
              onChange={(e) => setForm({ ...form, end: e.target.value })}
            />
          </div>
          <input
            className="w-full rounded-xl border border-border px-3 py-2"
            placeholder="Motivo"
            value={form.reason}
            onChange={(e) => setForm({ ...form, reason: e.target.value })}
          />
          <button
            type="button"
            className="w-full rounded-full bg-primary py-2.5 font-semibold text-white"
            onClick={() => {
              addBlock(form);
              pushToast("success", "Bloqueo guardado (partición TZ si cruza medianoche)");
              setOpen(false);
            }}
          >
            Guardar
          </button>
        </div>
      </Modal>
    </div>
  );
}
