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
  ShieldCheck,
} from "lucide-react";

interface ProductImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  categoryHint?: string;
}

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
 * Uploads a base64 DataURL to our server (/api/upload)
 * Returns the public URL (e.g. /uploads/1727546000000-xyz.png)
 */
async function uploadImageToServer(dataUrl: string): Promise<string> {
  try {
    const res = await fetch("/api/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dataUrl }),
    });
    const data = await res.json();
    if (!res.ok || !data.url) {
      throw new Error(data.error || "Error al subir la imagen al servidor");
    }
    return data.url;
  } catch (err) {
    console.error("Error al subir a nuestro servidor:", err);
    return dataUrl;
  }
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

  // High-Quality AI Background Removal executed on OUR SERVER (zero client downloads)
  const handleRemoveBackground = async () => {
    const target = value || originalImage;
    if (!target) return;

    setIsLoading(true);
    setStatusMessage(null);

    try {
      const res = await fetch("/api/upload/remove-bg", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrl: target.startsWith("/") ? target : undefined,
          dataUrl: target.startsWith("data:") ? target : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.url) {
        throw new Error(data.error || "No se pudo recortar en servidor.");
      }

      onChange(data.url);
      setHasTransparentBg(true);
      setStatusMessage({ type: "success", text: "Fondo recortado y guardado en servidor." });
    } catch (err: unknown) {
      console.error(err);
      setStatusMessage({
        type: "error",
        text: "Error al recortar fondo en el servidor. Intentá de nuevo.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Revert back to original photo
  const handleRevertOriginal = async () => {
    if (originalImage) {
      setIsLoading(true);
      try {
        const serverUrl = originalImage.startsWith("data:")
          ? await uploadImageToServer(originalImage)
          : originalImage;
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

  // Delete photo with instant client removal and 90-day server retention
  const handleDeletePhoto = async () => {
    const currentUrl = value;
    onChange("");
    setOriginalImage(null);
    setHasTransparentBg(false);
    setStatusMessage(null);

    if (currentUrl && currentUrl.startsWith("/uploads/")) {
      try {
        await fetch("/api/upload", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: currentUrl }),
        });
      } catch (err) {
        console.error("Error al registrar borrado:", err);
      }
    }
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
          className={`border-2 border-dashed rounded-2xl p-6 text-center transition cursor-pointer flex flex-col items-center justify-center gap-2.5 group relative overflow-hidden ${
            isDragging
              ? "border-primary bg-primary/10 scale-[1.01]"
              : "border-slate-200 dark:border-white/15 bg-slate-50/60 dark:bg-slate-800/40 hover:border-primary/50 hover:bg-slate-50 dark:hover:bg-slate-800/80"
          }`}
        >
          {isLoading ? (
            <div className="flex flex-col items-center gap-2 py-4 text-slate-600 dark:text-slate-300">
              <Loader2 className="h-7 w-7 animate-spin text-primary" />
              <p className="text-xs font-semibold">Cargando...</p>
            </div>
          ) : (
            <>
              <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-white dark:bg-slate-700 text-primary shadow-xs group-hover:scale-110 transition-transform">
                <span className="absolute -inset-1 rounded-2xl bg-primary/20 animate-ping opacity-30" />
                <Upload className="h-5 w-5 relative z-10" />
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

      {/* PREVIEW CANVAS & ACTIONS */}
      {value && (
        <div className="rounded-2xl border border-slate-200/90 dark:border-white/10 bg-slate-50/50 dark:bg-slate-850/60 p-3.5 space-y-3">
          {/* Main Visualizer with Checkered Transparency Grid & Scanner Animation */}
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

            {/* Animated Laser Scanner effect during AI processing */}
            {isLoading && (
              <div className="absolute inset-0 z-20 bg-slate-950/75 backdrop-blur-xs flex flex-col items-center justify-center p-4 text-center text-white gap-2">
                <div className="relative">
                  <Loader2 className="h-7 w-7 animate-spin text-white" />
                  <span className="absolute -inset-2 rounded-full border border-white/30 animate-ping" />
                </div>
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
                onClick={handleDeletePhoto}
                className="text-[11px] text-rose-500 hover:text-rose-600 font-semibold flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-rose-500/10 transition cursor-pointer"
              >
                <Trash2 className="h-3 w-3" />
                <span>Eliminar foto</span>
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

      {/* Small Privacy & Retention policy note */}
      <div className="pt-1 flex items-start gap-1.5 text-[10px] text-slate-400 dark:text-slate-500 leading-tight">
        <ShieldCheck className="h-3.5 w-3.5 shrink-0 mt-0.5 text-slate-400" />
        <p>
          <strong>Política de Privacidad & Retención:</strong> Al borrar una foto se retira al instante de tu catálogo y tienda pública. Se conserva de forma segura en nuestro servidor durante 90 días como respaldo y auditoría antes de su purga definitiva.
        </p>
      </div>
    </div>
  );
}
