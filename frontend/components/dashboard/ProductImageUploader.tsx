"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import {
  Upload,
  Scissors,
  RotateCcw,
  Check,
  AlertCircle,
  Download,
  Loader2,
  Trash2,
  Server,
} from "lucide-react";

interface ProductImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  categoryHint?: string;
}

// Preset product test photos with studio backgrounds
const SAMPLE_TEST_PHOTOS = [
  {
    name: "Cera Capilar",
    url: "https://images.unsplash.com/photo-1597354984706-aec992b7d0d1?w=600&auto=format&fit=crop&q=80",
  },
  {
    name: "Aceite de Barba",
    url: "https://images.unsplash.com/photo-1621607512214-68297480165e?w=600&auto=format&fit=crop&q=80",
  },
  {
    name: "Pomada Mate",
    url: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&auto=format&fit=crop&q=80",
  },
];

/**
 * Optimizes an image (file or dataURL) into a clean, max 800px DataURL
 */
async function compressImageToDataUrl(imageSrc: string | File, maxWidth = 800): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      let width = img.naturalWidth || img.width;
      let height = img.naturalHeight || img.height;

      if (width > maxWidth || height > maxWidth) {
        if (width > height) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        } else {
          width = Math.round((width * maxWidth) / height);
          height = maxWidth;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(typeof imageSrc === "string" ? imageSrc : "");
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL("image/png", 0.92));
    };

    img.onerror = () => {
      if (typeof imageSrc === "string") resolve(imageSrc);
      else reject(new Error("No se pudo cargar la imagen para optimizar"));
    };

    if (imageSrc instanceof File) {
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(imageSrc);
    } else {
      img.src = imageSrc;
    }
  });
}

/**
 * Uploads a base64 DataURL or File to our server (/api/upload)
 * Returns the public URL (e.g. /uploads/1727546000000-xyz.png)
 */
async function uploadImageToServer(dataUrl: string): Promise<string> {
  try {
    const res = await fetch("/api/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dataUrl }),
    });

    if (!res.ok) {
      throw new Error("Error en servidor al guardar archivo");
    }

    const json = await res.json();
    if (json.ok && json.url) {
      return json.url;
    }
    return dataUrl;
  } catch (err) {
    console.warn("Fallback guardando DataURL local:", err);
    return dataUrl;
  }
}

/**
 * Instant edge-aware canvas background remover for solid/studio backgrounds.
 * Operates in < 50ms without network calls.
 */
function removeBackgroundFastCanvas(
  dataUrl: string,
  tolerance = 45,
  feather = 1.6
): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth || img.width;
      canvas.height = img.naturalHeight || img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(dataUrl);
        return;
      }

      ctx.drawImage(img, 0, 0);
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;

      const W = canvas.width;
      const H = canvas.height;

      // Sample border pixels around the edges to compute accurate background color
      const samplePoints = [
        0, // top-left
        Math.floor(W / 2) * 4, // top-center
        (W - 1) * 4, // top-right
        ((H - 1) * W) * 4, // bottom-left
        ((H - 1) * W + Math.floor(W / 2)) * 4, // bottom-center
        ((H - 1) * W + (W - 1)) * 4, // bottom-right
        Math.floor(H / 2) * W * 4, // mid-left
        (Math.floor(H / 2) * W + (W - 1)) * 4, // mid-right
      ];

      let bgR = 0,
        bgG = 0,
        bgB = 0;
      samplePoints.forEach((idx) => {
        bgR += data[idx];
        bgG += data[idx + 1];
        bgB += data[idx + 2];
      });
      bgR = Math.round(bgR / samplePoints.length);
      bgG = Math.round(bgG / samplePoints.length);
      bgB = Math.round(bgB / samplePoints.length);

      const tolSq = tolerance * tolerance;
      const featherRange = feather * 20;
      const featherSq = (tolerance + featherRange) * (tolerance + featherRange);

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        const distSq =
          (r - bgR) * (r - bgR) +
          (g - bgG) * (g - bgG) +
          (b - bgB) * (b - bgB);

        if (distSq <= tolSq) {
          data[i + 3] = 0;
        } else if (distSq < featherSq) {
          const alphaFactor = (Math.sqrt(distSq) - tolerance) / featherRange;
          data[i + 3] = Math.round(Math.min(255, Math.max(0, 255 * alphaFactor)));
        }
      }

      ctx.putImageData(imgData, 0, 0);
      resolve(canvas.toDataURL("image/png"));
    };

    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

export default function ProductImageUploader({
  value,
  onChange,
}: ProductImageUploaderProps) {
  const [originalImage, setOriginalImage] = useState<string | null>(value || null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasTransparentBg, setHasTransparentBg] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (value && !originalImage) {
      setOriginalImage(value);
    }
  }, [value, originalImage]);

  // Handle file selection from disk or mobile camera
  const handleFileSelect = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("image/")) {
        setStatusMessage({ type: "error", text: "Formato no válido. Usá PNG, JPG o WEBP." });
        return;
      }

      try {
        setIsLoading(true);
        setStatusMessage(null);

        // 1. Compress image to clean web size
        const compressed = await compressImageToDataUrl(file);
        setOriginalImage(compressed);
        setHasTransparentBg(false);

        // 2. Save directly to our server (/api/upload -> /public/uploads/...)
        const serverUrl = await uploadImageToServer(compressed);
        onChange(serverUrl);

        setStatusMessage({ type: "success", text: "Imagen guardada en el servidor." });
      } catch {
        setStatusMessage({ type: "error", text: "No se pudo procesar la imagen." });
      } finally {
        setIsLoading(false);
      }
    },
    [onChange]
  );

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  // Instant Background Removal (< 100ms) and upload result to server
  const handleRemoveBackground = async () => {
    const target = value || originalImage;
    if (!target) return;

    setIsLoading(true);
    setStatusMessage(null);

    try {
      // 1. Instant Cutout in browser
      const transparentDataUrl = await removeBackgroundFastCanvas(target, 48, 1.8);
      setHasTransparentBg(true);

      // 2. Save cutout directly to our server
      const serverUrl = await uploadImageToServer(transparentDataUrl);
      onChange(serverUrl);

      setStatusMessage({ type: "success", text: "Fondo recortado y guardado en el servidor." });
    } catch {
      setStatusMessage({ type: "error", text: "No se pudo recortar el fondo." });
    } finally {
      setIsLoading(false);
    }
  };

  // Revert back to original photo
  const handleRevertOriginal = async () => {
    if (originalImage) {
      setIsLoading(true);
      try {
        const serverUrl = await uploadImageToServer(originalImage);
        onChange(serverUrl);
        setHasTransparentBg(false);
        setStatusMessage({ type: "success", text: "Se restauró la foto original." });
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Download transparent PNG
  const handleDownloadPng = () => {
    if (!value) return;
    const link = document.createElement("a");
    link.href = value;
    link.download = `producto-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const isServerSaved = value && value.startsWith("/uploads/");

  return (
    <div className="space-y-3" data-tour="product-image-uploader">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
          Foto del Producto
        </label>
        {value && (
          <div className="flex items-center gap-1.5">
            {isServerSaved && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                <Server className="h-3 w-3" />
                En Servidor
              </span>
            )}
            {hasTransparentBg && (
              <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/20">
                Sin fondo
              </span>
            )}
          </div>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/jpg"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            handleFileSelect(e.target.files[0]);
          }
        }}
      />

      {/* Upload Drag/Drop Box */}
      {!value && (
        <div
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-5 text-center transition cursor-pointer flex flex-col items-center justify-center gap-2 group relative overflow-hidden ${
            isDragging
              ? "border-primary bg-primary/10"
              : "border-slate-200 dark:border-white/15 bg-slate-50/60 dark:bg-slate-800/40 hover:border-primary/50 hover:bg-slate-50 dark:hover:bg-slate-800/80"
          }`}
        >
          {isLoading ? (
            <div className="flex flex-col items-center gap-2 py-3 text-slate-600 dark:text-slate-300">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <p className="text-xs font-semibold">Cargando...</p>
            </div>
          ) : (
            <>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white dark:bg-slate-700 text-primary shadow-xs group-hover:scale-105 transition-transform">
                <Upload className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-100">
                  Subir foto del producto
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Hacé clic o arrastrá desde tu celular o computadora
                </p>
              </div>
            </>
          )}
        </div>
      )}

      {/* SAMPLE QUICK PRESETS */}
      {!value && (
        <div className="flex items-center gap-2 pt-0.5 overflow-x-auto pb-1">
          <span className="text-[10px] font-bold text-slate-400 shrink-0">Ejemplos rápidos:</span>
          {SAMPLE_TEST_PHOTOS.map((sample) => (
            <button
              key={sample.name}
              type="button"
              onClick={async () => {
                setIsLoading(true);
                try {
                  const compressed = await compressImageToDataUrl(sample.url);
                  setOriginalImage(compressed);
                  setHasTransparentBg(false);
                  const serverUrl = await uploadImageToServer(compressed);
                  onChange(serverUrl);
                } finally {
                  setIsLoading(false);
                }
              }}
              className="text-[11px] font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-200/60 dark:border-white/10 hover:border-primary shrink-0 transition cursor-pointer"
            >
              + {sample.name}
            </button>
          ))}
        </div>
      )}

      {/* PREVIEW CANVAS & ACTIONS */}
      {value && (
        <div className="rounded-2xl border border-slate-200/90 dark:border-white/10 bg-slate-50/50 dark:bg-slate-850/60 p-3.5 space-y-3">
          {/* Main Visualizer with Checkered Transparency Grid */}
          <div className="relative h-48 w-full rounded-xl overflow-hidden border border-slate-200 dark:border-white/10 flex items-center justify-center bg-white dark:bg-slate-900">
            {/* Checkered Grid */}
            <div
              className="absolute inset-0 z-0 opacity-40 dark:opacity-20"
              style={{
                backgroundImage: `
                  linear-gradient(45deg, #cbd5e1 25%, transparent 25%),
                  linear-gradient(-45deg, #cbd5e1 25%, transparent 25%),
                  linear-gradient(45deg, transparent 75%, #cbd5e1 75%),
                  linear-gradient(-45deg, transparent 75%, #cbd5e1 75%)
                `,
                backgroundSize: "16px 16px",
                backgroundPosition: "0 0, 0 8px, 8px -8px, -8px 0px",
              }}
            />

            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={value}
              alt="Vista previa producto"
              className="relative z-10 max-h-full max-w-full object-contain drop-shadow-md transition-all duration-200"
            />

            {/* Clean loading overlay: ONLY "Cargando..." without lengthy text */}
            {isLoading && (
              <div className="absolute inset-0 z-20 bg-slate-950/75 backdrop-blur-xs flex flex-col items-center justify-center p-4 text-center text-white gap-2">
                <Loader2 className="h-6 w-6 animate-spin text-white" />
                <p className="text-xs font-bold tracking-wide">Cargando...</p>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                disabled={isLoading}
                onClick={handleRemoveBackground}
                className="flex items-center justify-center gap-1.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-2.5 px-3 text-xs font-bold shadow-sm hover:opacity-90 active:scale-98 transition disabled:opacity-50 cursor-pointer"
              >
                <Scissors className="h-4 w-4" />
                <span>Quitar fondo</span>
              </button>

              <button
                type="button"
                disabled={isLoading}
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 py-2.5 px-3 text-xs font-bold shadow-xs hover:border-primary active:scale-98 transition disabled:opacity-50 cursor-pointer"
              >
                <Upload className="h-4 w-4" />
                <span>Cambiar foto</span>
              </button>
            </div>

            {/* Secondary actions */}
            <div className="flex items-center justify-between pt-1 text-xs">
              <div className="flex items-center gap-2">
                {originalImage && originalImage !== value && (
                  <button
                    type="button"
                    onClick={handleRevertOriginal}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white px-2 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                  >
                    <RotateCcw className="h-3 w-3" />
                    <span>Original</span>
                  </button>
                )}

                {hasTransparentBg && (
                  <button
                    type="button"
                    onClick={handleDownloadPng}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline px-2 py-1 rounded-lg hover:bg-primary/5 transition cursor-pointer"
                  >
                    <Download className="h-3 w-3" />
                    <span>Descargar PNG</span>
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => {
                  onChange("");
                  setOriginalImage(null);
                  setHasTransparentBg(false);
                }}
                className="text-[11px] text-rose-500 hover:text-rose-600 font-semibold flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-rose-500/10 transition cursor-pointer"
              >
                <Trash2 className="h-3 w-3" />
                <span>Eliminar</span>
              </button>
            </div>
          </div>

          {/* Feedback banner */}
          {statusMessage && (
            <div
              className={`p-2.5 rounded-xl text-xs flex items-center gap-2 ${
                statusMessage.type === "success"
                  ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300"
                  : "bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300"
              }`}
            >
              {statusMessage.type === "success" ? (
                <Check className="h-4 w-4 shrink-0 text-emerald-500" />
              ) : (
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-500" />
              )}
              <span className="leading-tight">{statusMessage.text}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
