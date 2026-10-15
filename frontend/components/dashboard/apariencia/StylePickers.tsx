"use client";

import { memo, useState } from "react";
import { Check } from "lucide-react";
import BackgroundEffect from "@/components/booking/BackgroundEffect";
import {
  fontStack,
  GOOGLE_FONTS,
  THEME_PRESETS,
  type BackgroundEffectType,
  type LayoutStyle,
  type ThemePreset,
} from "@/lib/theme";

const RADIUS_CLASS = { full: "rounded-full", lg: "rounded-xl", md: "rounded-lg", none: "rounded-none" } as const;

// One stylesheet with every preset font so each card previews its real typography
const PRESET_FONTS_HREF = (() => {
  const ids = new Set(Object.values(THEME_PRESETS).map((p) => p.fontFamily));
  const queries = GOOGLE_FONTS.filter((f) => ids.has(f.id) && f.query).map((f) => f.query);
  return queries.length ? `https://fonts.googleapis.com/css2?${queries.join("&")}&display=swap` : "";
})();

/* ─────────────────────────── Presets ─────────────────────────── */

export const PresetPicker = memo(function PresetPicker({
  active,
  onApply,
}: {
  active: ThemePreset;
  onApply: (key: ThemePreset) => void;
}) {
  const [filter, setFilter] = useState<"all" | "light" | "dark">("all");
  const entries = (Object.entries(THEME_PRESETS) as [ThemePreset, (typeof THEME_PRESETS)[ThemePreset]][]).filter(
    ([, p]) => filter === "all" || (filter === "dark" ? p.themeMode === "dark" : p.themeMode !== "dark")
  );

  return (
    <div className="space-y-3">
      {PRESET_FONTS_HREF && <link rel="stylesheet" href={PRESET_FONTS_HREF} />}
      <div className="flex gap-1.5" role="group" aria-label="Filtrar estilos">
        {([
          { id: "all", label: "Todos" },
          { id: "light", label: "Claros" },
          { id: "dark", label: "Oscuros" },
        ] as const).map((f) => (
          <button
            key={f.id}
            type="button"
            aria-pressed={filter === f.id}
            onClick={() => setFilter(f.id)}
            className={`min-h-9 rounded-xl border px-3 text-xs font-semibold transition ${
              filter === f.id
                ? "border-primary/40 bg-primary/10 text-primary"
                : "border-white/10 text-slate-600 hover:bg-white/[0.06] dark:text-zinc-300"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
        {entries.map(([key, p]) => {
          const isActive = active === key;
          const dark = p.themeMode === "dark";
          return (
            <button
              key={key}
              type="button"
              aria-pressed={isActive}
              onClick={() => onApply(key)}
              className={`group overflow-hidden rounded-2xl border text-left transition ${
                isActive ? "border-primary ring-2 ring-primary/30" : "border-white/10 hover:border-white/25"
              }`}
            >
              {/* Mini page mock */}
              <div
                className={`relative isolate flex h-24 flex-col justify-end overflow-hidden p-2.5 ${isActive ? "" : "bgfx-paused"}`}
                style={{ backgroundColor: p.backgroundColor, fontFamily: fontStack(p.fontFamily) }}
              >
                <BackgroundEffect effect={p.backgroundEffect} color={p.primaryColor} isDark={dark} positioning="absolute" intensity={1.8} compact />
                <span
                  className="text-sm font-semibold leading-tight"
                  style={{ color: dark ? "#f8fafc" : "#0f172a" }}
                >
                  Aa
                </span>
                <span
                  className={`mt-1.5 flex h-5 w-20 items-center justify-center text-[9px] font-semibold text-white ${RADIUS_CLASS[p.buttonRadius]}`}
                  style={{
                    backgroundColor: p.primaryColor,
                    boxShadow: p.buttonStyle === "neubrutalism" ? "2px 2px 0 #000" : undefined,
                    border: p.buttonStyle === "neubrutalism" ? "1.5px solid #000" : undefined,
                  }}
                >
                  Reservar
                </span>
                {isActive && (
                  <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white">
                    <Check className="h-3 w-3" strokeWidth={3} />
                  </span>
                )}
                {p.badge && !isActive && (
                  <span className="absolute right-2 top-2 rounded-full bg-black/55 px-1.5 py-0.5 text-[9px] font-semibold text-white">
                    {p.badge}
                  </span>
                )}
              </div>
              <div className="space-y-0.5 border-t border-white/10 bg-white/[0.02] px-2.5 py-2">
                <p className={`truncate text-xs font-semibold ${isActive ? "text-primary" : "text-slate-900 dark:text-white"}`}>{p.name}</p>
                <p className="line-clamp-2 text-[10px] leading-snug text-slate-500 dark:text-zinc-400">{p.description}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
});

/* ─────────────────────────── Backgrounds ─────────────────────────── */

export const BACKGROUND_OPTIONS: { id: BackgroundEffectType; name: string; desc: string }[] = [
  { id: "none", name: "Sin efecto", desc: "Color plano" },
  { id: "ambient-mesh", name: "Luces suaves", desc: "Manchas de color que respiran" },
  { id: "aurora-wave", name: "Aurora", desc: "Degradado que se desplaza" },
  { id: "floating-shapes", name: "Formas flotantes", desc: "Figuras que flotan lento" },
  { id: "particle-stars", name: "Destellos", desc: "Puntos que titilan (ideal oscuro)" },
  { id: "glass-morphism", name: "Vidrio", desc: "Color difuso bajo cristal" },
  { id: "dots", name: "Puntos", desc: "Trama sutil, sin movimiento" },
  { id: "soft-grid", name: "Cuadrícula", desc: "Líneas finas con haz de luz" },
];

export const BackgroundPicker = memo(function BackgroundPicker({
  value,
  color,
  backgroundColor,
  isDark,
  onChange,
}: {
  value: BackgroundEffectType;
  color: string;
  backgroundColor: string;
  isDark: boolean;
  onChange: (effect: BackgroundEffectType) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {BACKGROUND_OPTIONS.map((opt) => {
        const isActive = value === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            aria-pressed={isActive}
            onClick={() => onChange(opt.id)}
            className={`group overflow-hidden rounded-2xl border text-left transition ${
              isActive ? "border-primary ring-2 ring-primary/30" : "border-white/10 hover:border-white/25"
            }`}
          >
            <div className={`relative isolate h-16 overflow-hidden ${isActive ? "" : "bgfx-paused"}`} style={{ backgroundColor }}>
              <BackgroundEffect effect={opt.id} color={color} isDark={isDark} positioning="absolute" intensity={2.4} compact />
              {isActive && (
                <span className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white">
                  <Check className="h-3 w-3" strokeWidth={3} />
                </span>
              )}
            </div>
            <div className="px-2.5 py-2">
              <p className={`text-xs font-semibold ${isActive ? "text-primary" : "text-slate-900 dark:text-white"}`}>{opt.name}</p>
              <p className="truncate text-[10px] text-slate-500 dark:text-zinc-400">{opt.desc}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
});

/* ─────────────────────────── Layouts ─────────────────────────── */

const LAYOUT_OPTIONS: { id: LayoutStyle; name: string; desc: string }[] = [
  { id: "panoramic", name: "Panorámica", desc: "Portada ancha, logo y servicios debajo" },
  { id: "full-immersive", name: "Inmersiva", desc: "Foto grande con tu nombre encima" },
  { id: "bento-grid", name: "Mosaico", desc: "Tarjetas con tu info y collage de fotos" },
  { id: "split-gallery", name: "Galería al costado", desc: "Fotos a un lado, reservas al otro" },
  { id: "floating-card", name: "Tarjeta flotante", desc: "Logo centrado y fotos tipo historias" },
  { id: "minimal-editorial", name: "Editorial", desc: "Tipografía protagonista, muy limpio" },
];

/** Tiny wireframe of each layout so the owner sees the structure before picking. */
function LayoutWireframe({ id, color }: { id: LayoutStyle; color: string }) {
  const block = "rounded-[3px] bg-current opacity-20";
  const accent = { backgroundColor: color };
  switch (id) {
    case "full-immersive":
      return (
        <div className="flex h-full flex-col gap-1">
          <div className="relative flex-[3] rounded-[4px] bg-current opacity-30">
            <span className="absolute bottom-1 left-1 h-1.5 w-8 rounded-full bg-white/80" />
          </div>
          <div className={`h-2 ${block}`} />
          <div className="h-2 w-1/2 rounded-full" style={accent} />
        </div>
      );
    case "bento-grid":
      return (
        <div className="grid h-full grid-cols-5 grid-rows-3 gap-1">
          <div className={`col-span-3 row-span-2 ${block}`} />
          <div className="col-span-2 row-span-2 rounded-[3px] opacity-60" style={accent} />
          <div className={`col-span-5 ${block}`} />
        </div>
      );
    case "split-gallery":
      return (
        <div className="grid h-full grid-cols-2 gap-1">
          <div className="grid grid-cols-2 gap-1">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className={block} />
            ))}
          </div>
          <div className="flex flex-col gap-1">
            <div className={`flex-1 ${block}`} />
            <div className="h-2 rounded-full" style={accent} />
          </div>
        </div>
      );
    case "floating-card":
      return (
        <div className="flex h-full flex-col items-center gap-1">
          <div className="h-4 w-4 rounded-full" style={accent} />
          <div className="flex gap-1">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-2.5 w-2.5 rounded-full bg-current opacity-25" />
            ))}
          </div>
          <div className={`w-full flex-1 ${block}`} />
        </div>
      );
    case "minimal-editorial":
      return (
        <div className="flex h-full flex-col items-center gap-1">
          <div className="h-2.5 w-14 rounded-[2px] bg-current opacity-50" />
          <div className="h-px w-full bg-current opacity-20" />
          <div className={`w-full flex-1 ${block}`} />
          <div className="h-2 w-1/2 rounded-full" style={accent} />
        </div>
      );
    default:
      return (
        <div className="flex h-full flex-col gap-1">
          <div className="relative h-5 rounded-[4px] bg-current opacity-30">
            <span className="absolute -bottom-1.5 left-1 h-3 w-3 rounded-full border border-white/70" style={accent} />
          </div>
          <div className="mt-1 h-1.5 w-1/3 rounded-full bg-current opacity-40" />
          <div className={`flex-1 ${block}`} />
        </div>
      );
  }
}

export const LayoutPicker = memo(function LayoutPicker({
  value,
  color,
  onChange,
}: {
  value: LayoutStyle;
  color: string;
  onChange: (layout: LayoutStyle) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {LAYOUT_OPTIONS.map((opt) => {
        const isActive = value === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            aria-pressed={isActive}
            onClick={() => onChange(opt.id)}
            className={`flex flex-col gap-2 rounded-2xl border p-2.5 text-left transition ${
              isActive ? "border-primary bg-primary/[0.06] ring-2 ring-primary/30" : "border-white/10 hover:border-white/25"
            }`}
          >
            <div className="h-20 rounded-xl border border-white/10 bg-white/[0.03] p-2 text-slate-500 dark:text-zinc-400">
              <LayoutWireframe id={opt.id} color={color} />
            </div>
            <div>
              <p className={`text-xs font-semibold ${isActive ? "text-primary" : "text-slate-900 dark:text-white"}`}>{opt.name}</p>
              <p className="text-[10px] leading-snug text-slate-500 dark:text-zinc-400">{opt.desc}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
});
