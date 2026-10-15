"use client";

import { useEffect, useState } from "react";
import { History, Loader2, RotateCcw } from "lucide-react";
import Modal from "@/components/dashboard/ui/Modal";
import { GOOGLE_FONTS, THEME_PRESETS, type ThemeSettings } from "@/lib/theme";

type HistoryEntry = { savedAt: string; theme: ThemeSettings };

export default function ThemeHistoryModal({
  open,
  onClose,
  onRestore,
}: {
  open: boolean;
  onClose: () => void;
  onRestore: (theme: ThemeSettings) => void;
}) {
  const [state, setState] = useState<{ status: "loading" | "ready" | "error"; entries: HistoryEntry[] }>({
    status: "loading",
    entries: [],
  });

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    fetch("/api/tenant/theme/history")
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(`HTTP ${res.status}`))))
      .then((data) => {
        if (!cancelled) setState({ status: "ready", entries: Array.isArray(data.history) ? data.history : [] });
      })
      .catch(() => {
        if (!cancelled) setState({ status: "error", entries: [] });
      });
    return () => {
      cancelled = true;
    };
  }, [open]);

  return (
    <Modal open={open} onClose={onClose} title="Versiones anteriores" maxWidth="max-w-md">
      <div className="space-y-3 text-xs">
        <p className="text-slate-500 dark:text-zinc-400">
          Guardamos tus últimos 5 diseños. Al restaurar uno se carga en el editor; revisalo y tocá Guardar para publicarlo.
        </p>

        {state.status === "loading" && (
          <div className="flex items-center justify-center py-8 text-slate-400">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        )}

        {state.status === "error" && (
          <p className="rounded-xl border border-rose-500/20 bg-rose-500/[0.06] px-3 py-2.5 text-rose-700 dark:text-rose-300">
            No pudimos cargar el historial. Probá de nuevo en un momento.
          </p>
        )}

        {state.status === "ready" && state.entries.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-8 text-center text-slate-500 dark:text-zinc-400">
            <History className="h-6 w-6" />
            Todavía no hay versiones anteriores. Se van a ir guardando cada vez que publiques un cambio.
          </div>
        )}

        {state.status === "ready" && state.entries.length > 0 && (
          <ul className="space-y-2">
            {state.entries.map((entry, idx) => {
              const t = entry.theme;
              const presetName = THEME_PRESETS[t.themePreset]?.name ?? "Personalizado";
              const fontName = GOOGLE_FONTS.find((f) => f.id === t.fontFamily)?.name ?? t.fontFamily;
              const date = entry.savedAt
                ? new Date(entry.savedAt).toLocaleString("es-PY", {
                    day: "2-digit",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "Fecha desconocida";
              return (
                <li
                  key={`${entry.savedAt}-${idx}`}
                  className="flex items-center gap-3 rounded-2xl border border-slate-200 p-3 dark:border-white/10"
                >
                  <span
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-black/5 text-xs font-semibold"
                    style={{ backgroundColor: t.backgroundColor, color: t.primaryColor }}
                  >
                    Aa
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold text-slate-900 dark:text-white">{presetName}</span>
                    <span className="mt-0.5 flex items-center gap-1.5 truncate text-[11px] text-slate-500 dark:text-zinc-400">
                      <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: t.primaryColor }} />
                      {fontName} · {date}
                    </span>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      onRestore(t);
                      onClose();
                    }}
                    className="inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-xl border border-slate-200 px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-white/10 dark:text-zinc-200 dark:hover:bg-white/[0.06]"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Restaurar
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </Modal>
  );
}
