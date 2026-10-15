"use client";

import { useEffect, useRef, useState, type ChangeEvent, type KeyboardEvent, type PointerEvent } from "react";
import { ChevronsUpDown, Pipette } from "lucide-react";

/* ─── Color math (hex ⇄ rgb ⇄ hsv) ─── */

type Hsv = { h: number; s: number; v: number };

const HEX_RE = /^#[0-9a-f]{6}$/i;

function hexToRgb(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function rgbToHex(r: number, g: number, b: number) {
  return `#${[r, g, b].map((x) => Math.round(x).toString(16).padStart(2, "0")).join("")}`;
}

function hexToHsv(hex: string): Hsv {
  const { r, g, b } = hexToRgb(hex);
  const rn = r / 255, gn = g / 255, bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const d = max - Math.min(rn, gn, bn);
  let h = 0;
  if (d) {
    if (max === rn) h = ((gn - bn) / d) % 6;
    else if (max === gn) h = (bn - rn) / d + 2;
    else h = (rn - gn) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  return { h, s: max ? d / max : 0, v: max };
}

function hsvToHex({ h, s, v }: Hsv) {
  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;
  const [r, g, b] =
    h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x];
  return rgbToHex((r + m) * 255, (g + m) * 255, (b + m) * 255);
}

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

type EyeDropperCtor = new () => { open: () => Promise<{ sRGBHex: string }> };

const FIELD =
  "h-9 w-full min-w-0 rounded-lg border border-white/10 bg-black/20 text-center text-sm font-semibold tabular-nums text-white outline-none transition focus:border-primary/60 focus:ring-2 focus:ring-primary/25";

/**
 * Compact color picker (same layout as the native one) in the dashboard style.
 * Handles follow the pointer instantly; `onChange` is throttled (~12/s) so
 * dragging never re-renders the whole page on every pixel.
 */
export default function ColorPicker({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (hex: string) => void;
}) {
  const safeValue = HEX_RE.test(value) ? value.toLowerCase() : "#5b31e6";
  const [isOpen, setIsOpen] = useState(false);
  const [format, setFormat] = useState<"rgb" | "hex">("rgb");
  const [hsv, setHsv] = useState<Hsv>(() => hexToHsv(safeValue));
  const [syncedValue, setSyncedValue] = useState(safeValue);
  const [hexText, setHexText] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const svRef = useRef<HTMLDivElement>(null);
  const hueRef = useRef<HTMLDivElement>(null);
  const pendingRef = useRef<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const draggingRef = useRef(false);

  // Follow outside changes (presets, history restore). While dragging, the parent only
  // receives values we already sent, so it always matches `syncedValue` and this stays idle.
  if (safeValue !== syncedValue) {
    setSyncedValue(safeValue);
    setHsv(hexToHsv(safeValue));
  }

  const current = hsvToHex(hsv);
  const { r, g, b } = hexToRgb(current);
  const hasEyeDropper = typeof window !== "undefined" && "EyeDropper" in window;

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    []
  );

  // Close on outside click / Escape, like the native popover
  useEffect(() => {
    if (!isOpen) return;
    function onDown(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setIsOpen(false);
    }
    function onKey(e: globalThis.KeyboardEvent) {
      if (e.key === "Escape") setIsOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [isOpen]);

  function flush() {
    timerRef.current = null;
    const next = pendingRef.current;
    pendingRef.current = null;
    if (next) {
      setSyncedValue(next);
      onChange(next);
    }
  }

  function emit(next: Hsv, immediate = false) {
    setHsv(next);
    pendingRef.current = hsvToHex(next);
    if (immediate) {
      if (timerRef.current) clearTimeout(timerRef.current);
      flush();
    } else if (!timerRef.current) {
      timerRef.current = setTimeout(flush, 80);
    }
  }

  function commitNow() {
    if (timerRef.current) clearTimeout(timerRef.current);
    flush();
  }

  function svFromPointer(e: PointerEvent<HTMLDivElement>) {
    const rect = svRef.current!.getBoundingClientRect();
    emit({
      h: hsv.h,
      s: clamp01((e.clientX - rect.left) / rect.width),
      v: 1 - clamp01((e.clientY - rect.top) / rect.height),
    });
  }

  function hueFromPointer(e: PointerEvent<HTMLDivElement>) {
    const rect = hueRef.current!.getBoundingClientRect();
    emit({ ...hsv, h: clamp01((e.clientX - rect.left) / rect.width) * 359.9 });
  }

  function startDrag(e: PointerEvent<HTMLDivElement>, move: (ev: PointerEvent<HTMLDivElement>) => void) {
    draggingRef.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    move(e);
  }

  function endDrag() {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    commitNow();
  }

  function handleSvKey(e: KeyboardEvent<HTMLDivElement>) {
    const step = e.shiftKey ? 0.1 : 0.02;
    const delta: Record<string, [number, number]> = {
      ArrowLeft: [-step, 0],
      ArrowRight: [step, 0],
      ArrowUp: [0, step],
      ArrowDown: [0, -step],
    };
    if (!delta[e.key]) return;
    e.preventDefault();
    const [ds, dv] = delta[e.key];
    emit({ ...hsv, s: clamp01(hsv.s + ds), v: clamp01(hsv.v + dv) });
  }

  function handleHueKey(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();
    const step = e.shiftKey ? 15 : 3;
    emit({ ...hsv, h: (hsv.h + (e.key === "ArrowRight" ? step : -step) + 360) % 360 });
  }

  function handleChannelChange(event: ChangeEvent<HTMLInputElement>) {
    const channel = event.currentTarget.name as "r" | "g" | "b";
    const raw = event.currentTarget.value;
    const n = Math.min(255, Math.max(0, Math.round(Number(raw.replace(/\D/g, "")) || 0)));
    const next = { r, g, b, [channel]: n };
    emit(hexToHsv(rgbToHex(next.r, next.g, next.b)), true);
  }

  async function handleEyeDropper() {
    try {
      const Ctor = (window as unknown as { EyeDropper: EyeDropperCtor }).EyeDropper;
      const result = await new Ctor().open();
      if (HEX_RE.test(result.sRGBHex)) emit(hexToHsv(result.sRGBHex.toLowerCase()), true);
    } catch {
      /* user cancelled */
    }
  }

  return (
    <div ref={rootRef} className="relative space-y-2">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{label}</span>
        {hint && <span className="truncate text-[11px] text-slate-500 dark:text-zinc-400">{hint}</span>}
      </div>

      <button
        type="button"
        onClick={() => setIsOpen((o) => !o)}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        className={`flex min-h-12 w-full items-center gap-3 rounded-2xl border px-3 py-2 text-left transition ${
          isOpen ? "border-primary/50 bg-primary/[0.06]" : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06]"
        }`}
      >
        <span
          className="h-8 w-8 shrink-0 rounded-full border-2 border-white/80 shadow-[0_2px_8px_rgba(0,0,0,0.25)]"
          style={{ backgroundColor: current }}
        />
        <span className="min-w-0 flex-1">
          <span className="block tabular-nums text-sm font-semibold uppercase tracking-wide text-slate-900 dark:text-white">
            {current}
          </span>
          <span className="block text-[11px] text-slate-500 dark:text-zinc-400">Tocá para elegir el color</span>
        </span>
      </button>

      {isOpen && (
        <div
          role="dialog"
          aria-label={`Elegir ${label.toLowerCase()}`}
          className="absolute left-0 top-full z-40 mt-2 w-[260px] max-w-[calc(100vw-2.5rem)] overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/95 shadow-2xl shadow-black/50 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150"
        >
          {/* Saturation / brightness */}
          <div
            ref={svRef}
            role="slider"
            tabIndex={0}
            aria-label="Saturación y brillo"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(hsv.s * 100)}
            aria-valuetext={`Saturación ${Math.round(hsv.s * 100)}%, brillo ${Math.round(hsv.v * 100)}%`}
            onPointerDown={(e) => startDrag(e, svFromPointer)}
            onPointerMove={(e) => draggingRef.current && svFromPointer(e)}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
            onKeyDown={handleSvKey}
            onKeyUp={commitNow}
            className="relative h-40 w-full cursor-crosshair touch-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/60"
            style={{ backgroundColor: hsvToHex({ h: hsv.h, s: 1, v: 1 }) }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
            <span
              className="pointer-events-none absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-white shadow-[0_0_0_1px_rgba(0,0,0,0.3)]"
              style={{ left: `${hsv.s * 100}%`, top: `${(1 - hsv.v) * 100}%` }}
            />
          </div>

          <div className="space-y-3 p-3">
            {/* Eyedropper · preview · hue */}
            <div className="flex items-center gap-3">
              {hasEyeDropper && (
                <button
                  type="button"
                  onClick={handleEyeDropper}
                  aria-label="Tomar un color de la pantalla"
                  title="Cuentagotas"
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-zinc-300 dark:hover:bg-white/10 dark:hover:text-white"
                >
                  <Pipette className="h-4 w-4" />
                </button>
              )}
              <span
                className="h-8 w-8 shrink-0 rounded-full border border-white/20"
                style={{ backgroundColor: current }}
              />
              <div
                ref={hueRef}
                role="slider"
                tabIndex={0}
                aria-label="Tono"
                aria-valuemin={0}
                aria-valuemax={360}
                aria-valuenow={Math.round(hsv.h)}
                onPointerDown={(e) => startDrag(e, hueFromPointer)}
                onPointerMove={(e) => draggingRef.current && hueFromPointer(e)}
                onPointerUp={endDrag}
                onPointerCancel={endDrag}
                onKeyDown={handleHueKey}
                onKeyUp={commitNow}
                className="relative h-3 flex-1 cursor-pointer touch-none rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                style={{
                  background:
                    "linear-gradient(to right,#ff0000 0%,#ffff00 17%,#00ff00 33%,#00ffff 50%,#0000ff 67%,#ff00ff 83%,#ff0000 100%)",
                }}
              >
                <span
                  className="pointer-events-none absolute top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-white shadow-[0_0_0_1px_rgba(0,0,0,0.3)]"
                  style={{ left: `${(hsv.h / 360) * 100}%`, backgroundColor: hsvToHex({ h: hsv.h, s: 1, v: 1 }) }}
                />
              </div>
            </div>

            {/* RGB / HEX fields */}
            <div className="flex items-end gap-2">
              {format === "rgb" ? (
                (["r", "g", "b"] as const).map((ch) => (
                  <label key={ch} className="flex min-w-0 flex-1 flex-col items-center gap-1">
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={3}
                      aria-label={ch.toUpperCase()}
                      value={{ r, g, b }[ch]}
                      name={ch}
                      onChange={handleChannelChange}
                      className={FIELD}
                    />
                    <span className="text-[11px] font-semibold uppercase text-zinc-400">{ch}</span>
                  </label>
                ))
              ) : (
                <label className="flex min-w-0 flex-1 flex-col items-center gap-1">
                  <input
                    type="text"
                    autoCapitalize="none"
                    spellCheck={false}
                    maxLength={7}
                    aria-label={`${label} en hexadecimal`}
                    value={hexText ?? current.toUpperCase()}
                    onChange={(e) => {
                      const text = e.target.value.replace(/[^0-9a-f#]/gi, "");
                      setHexText(text.toUpperCase());
                      const normalized = text.startsWith("#") ? text : `#${text}`;
                      // Only complete codes reach the theme; partial ones like "#5b" would break colors
                      if (HEX_RE.test(normalized)) emit(hexToHsv(normalized.toLowerCase()), true);
                    }}
                    onBlur={() => setHexText(null)}
                    className={`${FIELD} tabular-nums uppercase`}
                  />
                  <span className="text-[11px] font-semibold text-zinc-400">HEX</span>
                </label>
              )}
              <button
                type="button"
                onClick={() => setFormat((f) => (f === "rgb" ? "hex" : "rgb"))}
                aria-label={format === "rgb" ? "Ver en hexadecimal" : "Ver en RGB"}
                title={format === "rgb" ? "Cambiar a HEX" : "Cambiar a RGB"}
                className="mb-5 flex h-9 w-7 shrink-0 items-center justify-center rounded-lg text-zinc-400 transition hover:bg-white/10 hover:text-white"
              >
                <ChevronsUpDown className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
