"use client";

import { useEffect, useRef, useState, type PointerEvent } from "react";
import { Loader2, ZoomIn, ZoomOut } from "lucide-react";
import Modal from "@/components/dashboard/ui/Modal";

type Offset = { x: number; y: number };

/**
 * Lets the owner frame an image before uploading it: drag to position, slider to zoom.
 * Outputs a JPEG/PNG File cropped to `aspect` at `outputWidth` pixels wide.
 */
export default function ImageCropModal({
  file,
  aspect,
  outputWidth,
  title,
  shape = "rect",
  onCancel,
  onConfirm,
}: {
  file: File | null;
  aspect: number;
  outputWidth: number;
  title: string;
  shape?: "rect" | "circle";
  onCancel: () => void;
  onConfirm: (cropped: File) => void;
}) {
  const frameRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const dragRef = useRef<{ startX: number; startY: number; origin: Offset } | null>(null);
  const [src, setSrc] = useState("");
  const [natural, setNatural] = useState({ w: 0, h: 0 });
  const [frameW, setFrameW] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState<Offset>({ x: 0, y: 0 });
  const [isExporting, setIsExporting] = useState(false);

  // Object URL lifecycle for the selected file
  useEffect(() => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    // Reading a new file resets the framing; done in a microtask so the effect only subscribes
    queueMicrotask(() => {
      setSrc(url);
      setZoom(1);
      setOffset({ x: 0, y: 0 });
      setNatural({ w: 0, h: 0 });
    });
    return () => URL.revokeObjectURL(url);
  }, [file]);

  // Track the frame width so the math stays right on any screen size
  useEffect(() => {
    const el = frameRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => setFrameW(entry.contentRect.width));
    observer.observe(el);
    return () => observer.disconnect();
  }, [src]);

  const frameH = frameW / aspect;
  // Scale that makes the image cover the frame at zoom 1
  const baseScale = natural.w && natural.h ? Math.max(frameW / natural.w, frameH / natural.h) : 1;
  const scale = baseScale * zoom;
  const drawnW = natural.w * scale;
  const drawnH = natural.h * scale;

  function clamp(next: Offset): Offset {
    const maxX = Math.max(0, (drawnW - frameW) / 2);
    const maxY = Math.max(0, (drawnH - frameH) / 2);
    return {
      x: Math.min(maxX, Math.max(-maxX, next.x)),
      y: Math.min(maxY, Math.max(-maxY, next.y)),
    };
  }

  function handlePointerDown(e: PointerEvent<HTMLDivElement>) {
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = { startX: e.clientX, startY: e.clientY, origin: offset };
  }

  function handlePointerMove(e: PointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    if (!drag) return;
    setOffset(clamp({ x: drag.origin.x + e.clientX - drag.startX, y: drag.origin.y + e.clientY - drag.startY }));
  }

  function handleZoom(next: number) {
    setZoom(next);
    // Re-clamp with the new size so the image never leaves a gap in the frame
    const nextScale = baseScale * next;
    const maxX = Math.max(0, (natural.w * nextScale - frameW) / 2);
    const maxY = Math.max(0, (natural.h * nextScale - frameH) / 2);
    setOffset((o) => ({ x: Math.min(maxX, Math.max(-maxX, o.x)), y: Math.min(maxY, Math.max(-maxY, o.y)) }));
  }

  async function handleConfirm() {
    const img = imgRef.current;
    if (!img || !file || !frameW) return;
    setIsExporting(true);
    try {
      const outW = outputWidth;
      const outH = Math.round(outputWidth / aspect);
      const canvas = document.createElement("canvas");
      canvas.width = outW;
      canvas.height = outH;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas no disponible");

      // Visible frame expressed in source-image pixels
      const sx = (drawnW / 2 - frameW / 2 - offset.x) / scale;
      const sy = (drawnH / 2 - frameH / 2 - offset.y) / scale;
      const sw = frameW / scale;
      const sh = frameH / scale;

      const isPng = file.type === "image/png";
      if (!isPng) {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, outW, outH);
      }
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, outW, outH);

      const type = isPng ? "image/png" : "image/jpeg";
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, 0.9));
      if (!blob) throw new Error("No se pudo recortar la imagen");
      const name = file.name.replace(/\.[^.]+$/, "") + (isPng ? ".png" : ".jpg");
      onConfirm(new File([blob], name, { type }));
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <Modal
      open={Boolean(file)}
      onClose={onCancel}
      title={title}
      maxWidth="max-w-lg"
      footer={
        <div className="grid grid-cols-2 gap-2 sm:flex sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="min-h-11 rounded-xl border border-slate-200/80 px-4 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5 sm:min-h-10"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!natural.w || isExporting}
            className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl bg-primary px-5 text-xs font-semibold text-white shadow-sm transition hover:brightness-110 disabled:opacity-50 sm:min-h-10"
          >
            {isExporting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Usar imagen
          </button>
        </div>
      }
    >
      <div className="space-y-4 text-xs">
        <div
          ref={frameRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={() => (dragRef.current = null)}
          onPointerCancel={() => (dragRef.current = null)}
          className={`relative w-full cursor-grab touch-none select-none overflow-hidden bg-slate-900 active:cursor-grabbing ${
            shape === "circle" ? "mx-auto max-w-[280px] rounded-full" : "rounded-2xl"
          }`}
          style={{ aspectRatio: String(aspect) }}
        >
          {src && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              ref={imgRef}
              src={src}
              alt="Imagen a recortar"
              draggable={false}
              onLoad={(e) => setNatural({ w: e.currentTarget.naturalWidth, h: e.currentTarget.naturalHeight })}
              className="pointer-events-none absolute left-1/2 top-1/2 max-w-none"
              style={{
                width: drawnW || undefined,
                height: drawnH || undefined,
                transform: `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px))`,
              }}
            />
          )}
          <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/30" />
        </div>

        <div className="flex items-center gap-3">
          <ZoomOut className="h-4 w-4 shrink-0 text-slate-400" />
          <input
            type="range"
            min={1}
            max={3}
            step={0.01}
            value={zoom}
            onChange={(e) => handleZoom(Number(e.target.value))}
            aria-label="Zoom"
            className="w-full accent-primary"
          />
          <ZoomIn className="h-4 w-4 shrink-0 text-slate-400" />
        </div>
        <p className="text-center text-[11px] text-slate-500 dark:text-zinc-400">
          Arrastrá la imagen para encuadrarla y usá el control para acercar.
        </p>
      </div>
    </Modal>
  );
}
