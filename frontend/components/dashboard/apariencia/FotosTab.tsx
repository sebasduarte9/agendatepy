"use client";

import { useRef, useState, type DragEvent } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Camera,
  ImageIcon,
  ImagePlus,
  Loader2,
  Store,
  Trash2,
  Upload,
} from "lucide-react";
import type { AvatarShape, ThemeSettings } from "@/lib/theme";

export const GALLERY_LIMIT = 12;

const SECTION_CLASS = "rounded-3xl glass-panel p-4 sm:p-5";
const GHOST_BUTTON =
  "inline-flex min-h-10 items-center justify-center gap-1.5 rounded-xl border border-white/10 px-3 text-xs font-semibold text-slate-700 transition hover:bg-white/[0.06] disabled:opacity-50 dark:text-zinc-200";

function SectionHeader({ title, description, aside }: { title: string; description: string; aside?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-white sm:text-base">{title}</h2>
        <p className="mt-0.5 text-xs text-slate-500 dark:text-zinc-400">{description}</p>
      </div>
      {aside}
    </div>
  );
}

export default function FotosTab({
  theme,
  businessName,
  isUploadingBanner,
  isUploadingLogo,
  isUploadingPhoto,
  onChange,
  onPickBanner,
  onPickLogo,
  onUploadGallery,
}: {
  theme: ThemeSettings;
  businessName: string;
  isUploadingBanner: boolean;
  isUploadingLogo: boolean;
  isUploadingPhoto: boolean;
  onChange: (patch: Partial<ThemeSettings>) => void;
  onPickBanner: (file: File) => void;
  onPickLogo: (file: File) => void;
  onUploadGallery: (files: File[]) => void;
}) {
  const bannerInput = useRef<HTMLInputElement>(null);
  const logoInput = useRef<HTMLInputElement>(null);
  const galleryInput = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [brokenUrls, setBrokenUrls] = useState<Record<string, boolean>>({});

  const gallery = theme.galleryUrls || [];
  const remaining = Math.max(0, GALLERY_LIMIT - gallery.length);
  const focus = theme.bannerPosY ?? 50;
  const shapeClass =
    theme.avatarShape === "circle" ? "rounded-full" : theme.avatarShape === "square" ? "rounded-md" : "rounded-2xl";

  function addGalleryFiles(list: FileList | null) {
    if (!list || list.length === 0) return;
    const images = Array.from(list).filter((f) => f.type.startsWith("image/"));
    if (images.length === 0) return;
    onUploadGallery(images.slice(0, remaining));
  }

  function movePhoto(index: number, delta: -1 | 1) {
    const next = [...gallery];
    const target = index + delta;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    onChange({ galleryUrls: next });
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(false);
    if (remaining > 0) addGalleryFiles(e.dataTransfer.files);
  }

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* ═══ COVER & LOGO ═══ */}
      <section data-tour="tour-cover-logo" className={`${SECTION_CLASS} space-y-4`}>
        <SectionHeader
          title="Portada y logo"
          description="Es lo primero que ven tus clientes. Al subir una imagen vas a poder encuadrarla."
        />

        <input
          ref={bannerInput}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={(e) => {
            const picked = e.target.files?.[0];
            if (picked) onPickBanner(picked);
            e.target.value = "";
          }}
        />
        <input
          ref={logoInput}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={(e) => {
            const picked = e.target.files?.[0];
            if (picked) onPickLogo(picked);
            e.target.value = "";
          }}
        />

        {/* Live mock of the page header */}
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-950">
          <div className="relative h-36 w-full sm:h-44">
            {theme.bannerUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={theme.bannerUrl}
                alt="Portada de tu negocio"
                className="h-full w-full object-cover"
                style={{ objectPosition: `center ${focus}%` }}
              />
            ) : (
              <button
                type="button"
                onClick={() => bannerInput.current?.click()}
                className="flex h-full w-full flex-col items-center justify-center gap-1.5 text-white/80 transition hover:text-white"
                style={{ backgroundImage: `linear-gradient(135deg, ${theme.primaryColor}, #0f172a)` }}
              >
                <ImagePlus className="h-6 w-6" />
                <span className="text-xs font-semibold">Agregar foto de portada</span>
              </button>
            )}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
          </div>
          <div className="relative -mt-10 flex items-end gap-3 px-4 pb-4">
            <button
              type="button"
              onClick={() => logoInput.current?.click()}
              aria-label={theme.logoUrl ? "Cambiar logo" : "Subir logo"}
              className={`group relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden border-4 border-slate-950 bg-white shadow-xl ${shapeClass}`}
            >
              {theme.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={theme.logoUrl} alt="Logo" className="h-full w-full object-cover" />
              ) : (
                <Store className="h-8 w-8 text-slate-400" />
              )}
              <span className="absolute inset-0 flex items-center justify-center bg-black/50 text-white opacity-0 transition group-hover:opacity-100">
                {isUploadingLogo ? <Loader2 className="h-5 w-5 animate-spin" /> : <Camera className="h-5 w-5" />}
              </span>
            </button>
            <div className="min-w-0 pb-1">
              <p className="truncate text-sm font-semibold text-white">{businessName}</p>
              <p className="truncate text-[11px] text-slate-300">{theme.slogan || "Tu eslogan aparece acá"}</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="space-y-2 rounded-2xl border border-white/10 bg-white/[0.02] p-3">
            <p className="text-xs font-semibold text-slate-800 dark:text-zinc-200">Portada</p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => bannerInput.current?.click()}
                disabled={isUploadingBanner}
                className={GHOST_BUTTON}
              >
                {isUploadingBanner ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                {theme.bannerUrl ? "Cambiar" : "Subir"}
              </button>
              {theme.bannerUrl && (
                <button
                  type="button"
                  onClick={() => onChange({ bannerUrl: "" })}
                  className={`${GHOST_BUTTON} text-rose-600 hover:bg-rose-500/10 dark:text-rose-300`}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Quitar
                </button>
              )}
            </div>
            {theme.bannerUrl && (
              <div className="pt-1">
                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-zinc-400">
                  <label htmlFor="banner-focus">Encuadre vertical</label>
                  <span className="tabular-nums">{focus}%</span>
                </div>
                <input
                  id="banner-focus"
                  type="range"
                  min={0}
                  max={100}
                  value={focus}
                  onChange={(e) => onChange({ bannerPosY: Number(e.target.value) })}
                  className="mt-1 w-full accent-primary"
                />
                <div className="flex justify-between text-[11px] text-slate-500 dark:text-zinc-500">
                  {[
                    { label: "Arriba", value: 15 },
                    { label: "Centro", value: 50 },
                    { label: "Abajo", value: 85 },
                  ].map((p) => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => onChange({ bannerPosY: p.value })}
                      className={`rounded-md px-1.5 py-0.5 transition hover:text-primary ${focus === p.value ? "font-semibold text-primary" : ""}`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2 rounded-2xl border border-white/10 bg-white/[0.02] p-3">
            <p className="text-xs font-semibold text-slate-800 dark:text-zinc-200">Logo</p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => logoInput.current?.click()}
                disabled={isUploadingLogo}
                className={GHOST_BUTTON}
              >
                {isUploadingLogo ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                {theme.logoUrl ? "Cambiar" : "Subir"}
              </button>
              {theme.logoUrl && (
                <button
                  type="button"
                  onClick={() => onChange({ logoUrl: "" })}
                  className={`${GHOST_BUTTON} text-rose-600 hover:bg-rose-500/10 dark:text-rose-300`}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Quitar
                </button>
              )}
            </div>
            <div className="pt-1">
              <p className="mb-1.5 text-[11px] text-slate-500 dark:text-zinc-400">Forma</p>
              <div className="grid grid-cols-3 gap-1.5" role="group" aria-label="Forma del logo">
                {([
                  { id: "circle", label: "Círculo", cls: "rounded-full" },
                  { id: "rounded", label: "Suave", cls: "rounded-md" },
                  { id: "square", label: "Cuadrado", cls: "rounded-[2px]" },
                ] as const).map((sh) => {
                  const active = (theme.avatarShape || "circle") === sh.id;
                  return (
                    <button
                      key={sh.id}
                      type="button"
                      aria-pressed={active}
                      onClick={() => onChange({ avatarShape: sh.id as AvatarShape })}
                      className={`flex min-h-10 flex-col items-center justify-center gap-1 rounded-xl border text-[11px] font-semibold transition ${
                        active
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-white/10 text-slate-600 hover:bg-white/[0.06] dark:text-zinc-300"
                      }`}
                    >
                      <span className={`h-3.5 w-3.5 border-2 border-current ${sh.cls}`} />
                      {sh.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ GALLERY ═══ */}
      <section data-tour="tour-gallery" className={`${SECTION_CLASS} space-y-4`}>
        <SectionHeader
          title="Galería de trabajos"
          description="Fotos de tus mejores resultados, el local o el equipo. La primera se muestra primero."
          aside={
            <span className="shrink-0 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-[11px] font-semibold tabular-nums text-primary">
              {gallery.length}/{GALLERY_LIMIT}
            </span>
          }
        />

        <input
          ref={galleryInput}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          multiple
          className="hidden"
          onChange={(e) => {
            addGalleryFiles(e.target.files);
            e.target.value = "";
          }}
        />

        {remaining > 0 && (
          <div
            role="button"
            tabIndex={0}
            onClick={() => !isUploadingPhoto && galleryInput.current?.click()}
            onKeyDown={(e) => {
              if ((e.key === "Enter" || e.key === " ") && !isUploadingPhoto) {
                e.preventDefault();
                galleryInput.current?.click();
              }
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`flex min-h-[76px] cursor-pointer items-center gap-3.5 rounded-2xl border-2 border-dashed px-4 py-3.5 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
              isDragging ? "border-primary bg-primary/10" : "border-white/15 bg-white/[0.02] hover:border-primary/50 hover:bg-white/[0.04]"
            }`}
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              {isUploadingPhoto ? <Loader2 className="h-5 w-5 animate-spin" /> : <ImagePlus className="h-5 w-5" />}
            </span>
            <span className="min-w-0">
              <span className="block text-xs font-semibold text-slate-900 dark:text-white">
                {isUploadingPhoto ? "Subiendo y optimizando…" : "Agregar fotos"}
              </span>
              <span className="mt-0.5 block text-[11px] text-slate-500 dark:text-zinc-400">
                <span className="sm:hidden">Tocá para elegir · podés sumar {remaining} más</span>
                <span className="hidden sm:inline">Hacé clic o arrastrá imágenes · podés sumar {remaining} más</span>
              </span>
            </span>
          </div>
        )}

        {gallery.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-2xl border border-white/10 py-8 text-center text-xs text-slate-500 dark:text-zinc-400">
            <ImageIcon className="h-6 w-6" />
            Todavía no hay fotos. Los negocios con galería reciben más reservas.
          </div>
        ) : (
          <ul className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
            {gallery.map((url, index) => (
              <li key={`${url}-${index}`} className="overflow-hidden rounded-2xl border border-white/10 bg-slate-950">
                <div className="relative aspect-square">
                  {brokenUrls[url] ? (
                    <div className="flex h-full w-full flex-col items-center justify-center gap-1.5 bg-rose-500/[0.06] px-3 text-center text-[11px] text-rose-600 dark:text-rose-300">
                      <AlertTriangle className="h-5 w-5" />
                      No se pudo cargar esta foto. Borrala y subila de nuevo.
                    </div>
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={url}
                      alt={`Foto ${index + 1}`}
                      onError={() => setBrokenUrls((prev) => ({ ...prev, [url]: true }))}
                      className="h-full w-full object-cover"
                    />
                  )}
                  {index === 0 && (
                    <span className="absolute left-2 top-2 rounded-full bg-black/60 px-2 py-0.5 text-[11px] font-semibold text-white backdrop-blur">
                      Principal
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between gap-1 p-1.5">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => movePhoto(index, -1)}
                      disabled={index === 0}
                      aria-label={`Mover foto ${index + 1} antes`}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-white/10 hover:text-white disabled:opacity-30"
                    >
                      <ArrowLeft className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => movePhoto(index, 1)}
                      disabled={index === gallery.length - 1}
                      aria-label={`Mover foto ${index + 1} después`}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-white/10 hover:text-white disabled:opacity-30"
                    >
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => onChange({ bannerUrl: url, bannerPosY: 50 })}
                      title="Usar como portada"
                      aria-label={`Usar foto ${index + 1} como portada`}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-white/10 hover:text-white"
                    >
                      <ImageIcon className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onChange({ galleryUrls: gallery.filter((_, i) => i !== index) })}
                      aria-label={`Eliminar foto ${index + 1}`}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-rose-500/15 hover:text-rose-400"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
