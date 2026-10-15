"use client";

import { useRef } from "react";
import { ImageIcon, Loader2, Search, Share2, Trash2, Upload } from "lucide-react";
import type { ThemeSettings } from "@/lib/theme";

const TITLE_MAX = 60;
const DESCRIPTION_MAX = 160;

const INPUT_CLASS =
  "min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-white/10 dark:bg-slate-800 dark:text-white sm:min-h-10 sm:text-sm";

function Counter({ value, max }: { value: number; max: number }) {
  return (
    <span className={`text-[11px] tabular-nums ${value > max ? "text-amber-600 dark:text-amber-400" : "text-slate-400"}`}>
      {value}/{max}
    </span>
  );
}

/** Title, description and image shown when the booking link is shared or found on Google. */
export default function SeoSettings({
  theme,
  businessName,
  host,
  isUploading,
  onChange,
  onPickShareImage,
}: {
  theme: ThemeSettings;
  businessName: string;
  host: string;
  isUploading: boolean;
  onChange: (patch: Partial<ThemeSettings>) => void;
  onPickShareImage: (file: File) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const fallbackTitle = `Reservar turno · ${businessName}`;
  const fallbackDescription =
    theme.bio || theme.slogan || `Agendá tu turno online en ${businessName} en 30 segundos.`;
  const previewTitle = theme.seoTitle.trim() || fallbackTitle;
  const previewDescription = theme.seoDescription.trim() || fallbackDescription;
  const previewImage = theme.shareImageUrl || theme.bannerUrl || theme.logoUrl;

  return (
    <section className="space-y-4 rounded-3xl glass-panel p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Share2 className="h-4 w-4" />
        </span>
        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Al compartir tu enlace</h3>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-zinc-400">
            Cómo se ve tu página en WhatsApp, Instagram y en Google. Si lo dejás vacío usamos tu descripción.
          </p>
        </div>
      </div>

      {/* Link preview (WhatsApp style) */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-[#1f2c33]">
        {previewImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={previewImage} alt="" className="aspect-[1200/630] w-full object-cover" />
        ) : (
          <div className="flex aspect-[1200/630] w-full items-center justify-center text-slate-400">
            <ImageIcon className="h-6 w-6" />
          </div>
        )}
        <div className="space-y-0.5 px-3.5 py-2.5">
          <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{previewTitle}</p>
          <p className="line-clamp-2 text-xs text-slate-600 dark:text-zinc-300">{previewDescription}</p>
          <p className="truncate text-[11px] text-slate-400">{host}</p>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label htmlFor="seo-title" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Título
            </label>
            <Counter value={theme.seoTitle.length} max={TITLE_MAX} />
          </div>
          <input
            id="seo-title"
            type="text"
            maxLength={70}
            value={theme.seoTitle}
            onChange={(e) => onChange({ seoTitle: e.target.value })}
            placeholder={fallbackTitle}
            className={INPUT_CLASS}
          />
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label htmlFor="seo-description" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Descripción
            </label>
            <Counter value={theme.seoDescription.length} max={DESCRIPTION_MAX} />
          </div>
          <textarea
            id="seo-description"
            rows={3}
            maxLength={200}
            value={theme.seoDescription}
            onChange={(e) => onChange({ seoDescription: e.target.value })}
            placeholder={fallbackDescription}
            className={`${INPUT_CLASS} resize-y`}
          />
          <p className="mt-1 flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-zinc-500">
            <Search className="h-3 w-3" />
            Incluí tu barrio o ciudad y tu servicio principal: así te encuentran en Google.
          </p>
        </div>

        <div>
          <span className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">Imagen para compartir</span>
          <input
            ref={fileRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={(e) => {
              const picked = e.target.files?.[0];
              if (picked) onPickShareImage(picked);
              e.target.value = "";
            }}
          />
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={isUploading}
              className="inline-flex min-h-10 items-center gap-1.5 rounded-xl border border-slate-200 px-3.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-60 dark:border-white/10 dark:text-zinc-200 dark:hover:bg-white/[0.06]"
            >
              {isUploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
              {theme.shareImageUrl ? "Cambiar imagen" : "Subir imagen"}
            </button>
            {theme.shareImageUrl && (
              <button
                type="button"
                onClick={() => onChange({ shareImageUrl: "" })}
                className="inline-flex min-h-10 items-center gap-1.5 rounded-xl px-3 text-xs font-semibold text-rose-600 transition hover:bg-rose-500/10 dark:text-rose-300"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Quitar
              </button>
            )}
            <span className="text-[11px] text-slate-500 dark:text-zinc-500">
              {theme.shareImageUrl ? "Formato 1200×630." : "Sin imagen propia usamos tu portada."}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
