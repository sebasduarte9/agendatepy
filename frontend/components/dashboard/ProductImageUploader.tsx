"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import {
  Upload,
  Image as ImageIcon,
  Scissors,
  Crop,
  Zap,
  RotateCcw,
  Check,
  AlertCircle,
  Download,
  Loader2,
  Sliders,
  ExternalLink,
  Eye,
  Trash2,
} from "lucide-react";

interface ProductImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  categoryHint?: string;
}

// Preset product test photos with studio backgrounds so users can test removal immediately
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
 * Optimizes an image (file or dataURL) into a clean, web-ready max 800px DataURL
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
 * Instant local canvas-based background remover for solid, white, or light backgrounds.
 * Runs in ~50ms without downloading any AI model.
 */
function removeSolidBackgroundWithCanvas(
  dataUrl: string,
  tolerance = 42,
  feather = 1.5
): Promise<string> {
  return new Promise((resolve, reject) => {
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

      // Sample 4 corners to estimate the background color (usually white/gray/backdrop)
      const cornerIndices = [
        0, // top-left
        (W - 1) * 4, // top-right
        ((H - 1) * W) * 4, // bottom-left
        ((H - 1) * W + (W - 1)) * 4, // bottom-right
      ];

      let bgR = 0,
        bgG = 0,
        bgB = 0;
      cornerIndices.forEach((idx) => {
        bgR += data[idx];
        bgG += data[idx + 1];
        bgB += data[idx + 2];
      });
      bgR = Math.round(bgR / 4);
      bgG = Math.round(bgG / 4);
      bgB = Math.round(bgB / 4);

      const tolSq = tolerance * tolerance;
      const featherSq = (tolerance + feather * 18) * (tolerance + feather * 18);

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // Euclidean color distance from background
        const distSq =
          (r - bgR) * (r - bgR) +
          (g - bgG) * (g - bgG) +
          (b - bgB) * (b - bgB);

        if (distSq <= tolSq) {
          // Completely transparent
          data[i + 3] = 0;
        } else if (distSq < featherSq) {
          // Smooth alpha feathering on the edges
          const alphaFactor = (Math.sqrt(distSq) - tolerance) / (feather * 18);
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
  const [activeSourceTab, setActiveSourceTab] = useState<"upload" | "url">("upload");
  const [urlInput, setUrlInput] = useState(value && !value.startsWith("data:") ? value : "");
  const [originalImage, setOriginalImage] = useState<string | null>(value || null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessingAi, setIsProcessingAi] = useState(false);
  const [isProcessingFast, setIsProcessingFast] = useState(false);
  const [aiProgressText, setAiProgressText] = useState("");
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [showingOriginal, setShowingOriginal] = useState(false);
  const [hasTransparentBg, setHasTransparentBg] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync internal state if prop value updates
  useEffect(() => {
    if (value && !originalImage) {
      setOriginalImage(value);
    }
  }, [value, originalImage]);

  // Handle file selection from disk or mobile camera
  const handleFileSelect = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("image/")) {
        setStatusMessage({ type: "error", text: "Por favor seleccioná un archivo de imagen válido (PNG, JPG, WEBP)." });
        return;
      }

      try {
        setStatusMessage(null);
        const optimized = await compressImageToDataUrl(file);
        setOriginalImage(optimized);
        setHasTransparentBg(false);
        onChange(optimized);
        setStatusMessage({ type: "success", text: "¡Foto cargada con éxito! Ahora podés quitar el fondo gratis." });
      } catch (err) {
        setStatusMessage({ type: "error", text: "No se pudo procesar la imagen seleccionada." });
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

  const handleApplyUrl = async () => {
    if (!urlInput.trim()) return;
    try {
      setStatusMessage(null);
      const optimized = await compressImageToDataUrl(urlInput.trim());
      setOriginalImage(optimized);
      setHasTransparentBg(false);
      onChange(optimized);
      setStatusMessage({ type: "success", text: "Imagen importada correctamente." });
    } catch {
      // In case CORS blocks canvas compression, still store the URL
      setOriginalImage(urlInput.trim());
      onChange(urlInput.trim());
      setStatusMessage({ type: "success", text: "URL asignada al producto." });
    }
  };

  // 1. FREE AI BACKGROUND REMOVAL (Client-side WebAssembly ONNX)
  const handleRemoveBackgroundAi = async () => {
    const target = value || originalImage;
    if (!target) {
      setStatusMessage({ type: "error", text: "Primero subí una foto para quitarle el fondo." });
      return;
    }

    setIsProcessingAi(true);
    setAiProgressText("Iniciando IA en tu navegador...");
    setStatusMessage(null);

    try {
      // Dynamic import to prevent SSR bundling & keep payload lightweight
      const { removeBackground } = await import("@imgly/background-removal");

      setAiProgressText("Procesando silueta del producto con IA...");

      const blob = await removeBackground(target, {
        progress: (key: string, current: number, total: number) => {
          if (total > 0) {
            const pct = Math.round((current / total) * 100);
            if (key.includes("fetch")) {
              setAiProgressText(`Descargando modelo IA: ${pct}%...`);
            } else {
              setAiProgressText(`Recortando fondo: ${pct}%...`);
            }
          }
        },
      });

      // Convert blob to DataURL for clean storage in state
      const reader = new FileReader();
      reader.onloadend = () => {
        const resultDataUrl = reader.result as string;
        onChange(resultDataUrl);
        setHasTransparentBg(true);
        setIsProcessingAi(false);
        setAiProgressText("");
        setStatusMessage({
          type: "success",
          text: "¡Fondo eliminado con IA con éxito! Guardá el producto para publicarlo.",
        });
      };
      reader.readAsDataURL(blob);
    } catch (err: any) {
      console.warn("AI background removal error, switching to quick canvas fallback:", err);
      // Fallback seamlessly to the Canvas method
      try {
        setAiProgressText("Aplicando recorte de alta precisión...");
        const result = await removeSolidBackgroundWithCanvas(target, 48, 1.8);
        onChange(result);
        setHasTransparentBg(true);
        setStatusMessage({
          type: "success",
          text: "⚡ Fondo blanco/sólido eliminado correctamente.",
        });
      } catch {
        setStatusMessage({
          type: "error",
          text: "No se pudo procesar automáticamente. Probá con el botón 'Quitar Fondo Rápido'.",
        });
      } finally {
        setIsProcessingAi(false);
        setAiProgressText("");
      }
    }
  };

  // 2. INSTANT FAST CANVAS BACKGROUND REMOVER (< 100ms)
  const handleRemoveBackgroundFast = async () => {
    const target = value || originalImage;
    if (!target) {
      setStatusMessage({ type: "error", text: "Primero subí una foto de tu producto." });
      return;
    }

    setIsProcessingFast(true);
    setStatusMessage(null);
    try {
      const result = await removeSolidBackgroundWithCanvas(target, 45, 1.6);
      onChange(result);
      setHasTransparentBg(true);
      setStatusMessage({
        type: "success",
        text: "¡Fondo liso eliminado en 0.1s! Podés ver la transparencia en el tablero.",
      });
    } catch (err) {
      setStatusMessage({
        type: "error",
        text: "No se pudo remover el fondo en modo rápido.",
      });
    } finally {
      setIsProcessingFast(false);
    }
  };

  // Revert back to original photo
  const handleRevertOriginal = () => {
    if (originalImage) {
      onChange(originalImage);
      setHasTransparentBg(false);
      setStatusMessage({ type: "success", text: "Se restauró la foto original con fondo." });
    }
  };

  // Download transparent PNG
  const handleDownloadPng = () => {
    if (!value) return;
    const link = document.createElement("a");
    link.href = value;
    link.download = `producto-sin-fondo-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const displayedImage = showingOriginal ? originalImage || value : value;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
          Foto del Producto & Recorte Profesional
        </label>
        {value && (
          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
            {hasTransparentBg ? "Fondo transparente activo" : "Foto cargada"}
          </span>
        )}
      </div>

      {/* Selector Tabs: Subir Archivo vs URL */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl text-xs">
        <button
          type="button"
          onClick={() => setActiveSourceTab("upload")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg font-bold transition cursor-pointer ${
            activeSourceTab === "upload"
              ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs"
              : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Upload className="h-3.5 w-3.5" />
          <span>Subir desde celular / PC</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveSourceTab("url")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg font-bold transition cursor-pointer ${
            activeSourceTab === "url"
              ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs"
              : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <ExternalLink className="h-3.5 w-3.5" />
          <span>Pegar Enlace URL</span>
        </button>
      </div>

      {/* SOURCE TAB 1: File Upload & Drag-and-drop */}
      {activeSourceTab === "upload" && (
        <div>
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

          <div
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-4 sm:p-5 text-center transition cursor-pointer flex flex-col items-center justify-center gap-2 group ${
              isDragging
                ? "border-primary bg-primary/10"
                : "border-slate-200 dark:border-white/15 bg-slate-50/60 dark:bg-slate-800/40 hover:border-primary/50 hover:bg-slate-50 dark:hover:bg-slate-800/80"
            }`}
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white dark:bg-slate-700 text-primary shadow-xs group-hover:scale-105 transition-transform">
              <Upload className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-100">
                Hacé clic para elegir una foto o arrastrala aquí
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                PNG, JPG o WEBP (sacale foto a tu producto sobre cualquier mesa o pared)
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SOURCE TAB 2: Direct URL */}
      {activeSourceTab === "url" && (
        <div className="flex gap-2">
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="https://images.unsplash.com/..."
            className="flex-1 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white outline-none focus:border-primary"
          />
          <button
            type="button"
            onClick={handleApplyUrl}
            className="rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-3.5 py-2 text-xs font-bold shadow-xs hover:opacity-90 transition cursor-pointer"
          >
            Cargar
          </button>
        </div>
      )}

      {/* SAMPLE QUICK PRESETS */}
      {!value && (
        <div className="flex items-center gap-2 pt-1 overflow-x-auto pb-1">
          <span className="text-[10px] font-bold text-slate-400 shrink-0">Ejemplos para probar:</span>
          {SAMPLE_TEST_PHOTOS.map((sample) => (
            <button
              key={sample.name}
              type="button"
              onClick={() => {
                setOriginalImage(sample.url);
                onChange(sample.url);
                setHasTransparentBg(false);
                setStatusMessage({
                  type: "success",
                  text: `Cargaste "${sample.name}". Probá tocar "Recortar Fondo con IA (Gratis)".`,
                });
              }}
              className="text-[11px] font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-200/60 dark:border-white/10 hover:border-primary shrink-0 transition cursor-pointer"
            >
              + {sample.name}
            </button>
          ))}
        </div>
      )}

      {/* PREVIEW CANVAS & BACKGROUND REMOVER SUITE */}
      {value && (
        <div className="rounded-2xl border border-slate-200/90 dark:border-white/10 bg-slate-50/50 dark:bg-slate-850/60 p-3.5 space-y-3">
          {/* Main Visualizer with Checkered Transparency Grid */}
          <div className="relative h-48 w-full rounded-xl overflow-hidden border border-slate-200 dark:border-white/10 flex items-center justify-center">
            {/* Checkered Transparency Background */}
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
              src={displayedImage}
              alt="Vista previa producto"
              className="relative z-10 max-h-full max-w-full object-contain drop-shadow-md transition-all duration-300"
            />

            {/* Overlay during AI Processing */}
            {isProcessingAi && (
              <div className="absolute inset-0 z-20 bg-slate-900/80 backdrop-blur-xs flex flex-col items-center justify-center p-4 text-center text-white gap-2">
                <Loader2 className="h-7 w-7 animate-spin text-primary" />
                <p className="text-xs font-bold">{aiProgressText || "Removiendo fondo con IA gratis..."}</p>
                <span className="text-[10px] text-slate-300">
                  Procesando directo en tu navegador (sin costo por crédito)
                </span>
              </div>
            )}

            {/* Quick Preview Toggles (Top Right) */}
            {originalImage && originalImage !== value && (
              <div className="absolute top-2.5 right-2.5 z-20 flex gap-1 bg-black/60 backdrop-blur-md rounded-xl p-1">
                <button
                  type="button"
                  onMouseDown={() => setShowingOriginal(true)}
                  onMouseUp={() => setShowingOriginal(false)}
                  onTouchStart={() => setShowingOriginal(true)}
                  onTouchEnd={() => setShowingOriginal(false)}
                  className="px-2 py-1 rounded-lg text-[10px] font-bold text-white hover:bg-white/20 transition flex items-center gap-1 cursor-pointer"
                  title="Mantené presionado para ver la foto original"
                >
                  <Eye className="h-3 w-3" />
                  <span>{showingOriginal ? "Viendo Original" : "Ver Original"}</span>
                </button>
              </div>
            )}
          </div>

          {/* ACTION BUTTONS: 100% FREE BACKGROUND REMOVAL */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Scissors className="h-3.5 w-3.5 text-primary" />
                Herramientas de Recorte Profesional (100% Gratis):
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {/* BUTTON 1: AI Background Removal (Free ONNX WebAssembly) */}
              <button
                type="button"
                disabled={isProcessingAi || isProcessingFast}
                onClick={handleRemoveBackgroundAi}
                className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-orange-500 text-white py-2.5 px-3 text-xs font-bold shadow-md shadow-primary/25 hover:brightness-110 active:scale-98 transition disabled:opacity-50 cursor-pointer"
              >
                {isProcessingAi ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Scissors className="h-4 w-4" />
                )}
                <span>Recortar Fondo con IA (Gratis)</span>
              </button>

              {/* BUTTON 2: Fast Solid Background Removal (Canvas < 100ms) */}
              <button
                type="button"
                disabled={isProcessingAi || isProcessingFast}
                onClick={handleRemoveBackgroundFast}
                className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 py-2.5 px-3 text-xs font-bold shadow-xs hover:border-primary active:scale-98 transition disabled:opacity-50 cursor-pointer"
              >
                {isProcessingFast ? (
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                ) : (
                  <Crop className="h-4 w-4 text-amber-500" />
                )}
                <span>Quitar Fondo Blanco / Liso</span>
              </button>
            </div>

            {/* Secondary Controls: Revert, Download, or Change */}
            <div className="flex items-center justify-between pt-1 text-xs">
              <div className="flex items-center gap-1.5">
                {originalImage && originalImage !== value && (
                  <button
                    type="button"
                    onClick={handleRevertOriginal}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white px-2 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                  >
                    <RotateCcw className="h-3 w-3" />
                    <span>Revertir al original</span>
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
                  setUrlInput("");
                  setHasTransparentBg(false);
                }}
                className="text-[11px] text-rose-500 hover:text-rose-600 font-semibold flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-rose-500/10 transition cursor-pointer"
              >
                <Trash2 className="h-3 w-3" />
                <span>Quitar foto</span>
              </button>
            </div>
          </div>

          {/* Feedback Toast Banner */}
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
