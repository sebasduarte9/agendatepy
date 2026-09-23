"use client";

import { useActionState, useState } from "react";
import { updateThemeSettings } from "@/lib/admin/theme-actions";
import {
  GOOGLE_FONTS,
  googleFontHref,
  fontStack,
  type LayoutStyle,
  type ThemeMode,
  type ThemeSettings,
} from "@/lib/theme";
import { Sun, Moon, Store } from "lucide-react";

export default function AppearanceEditor({ initial }: { initial: ThemeSettings }) {
  const [theme, setTheme] = useState(initial);
  const [state, action, pending] = useActionState(updateThemeSettings, null);

  const isDark =
    theme.themeMode === "dark" ||
    theme.themePreset === "barber-dark" ||
    theme.themePreset === "obsidian-gold" ||
    theme.themePreset === "cyber-noir";

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link rel="stylesheet" href={googleFontHref(theme.fontFamily)} />

      <form action={action} className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Identidad & Personalización de la Página</h2>
        <p className="mt-1 text-sm text-slate-500">
          Personalizá colores, tipografía de Google, distribución de fotos y modo de color para tus clientes.
        </p>

        <div className="mt-6 space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <ColorField
              label="Color Primario"
              name="primaryColor"
              value={theme.primaryColor}
              onChange={(primaryColor) => setTheme((current) => ({ ...current, primaryColor }))}
            />
            <ColorField
              label="Fondo de Pantalla"
              name="backgroundColor"
              value={theme.backgroundColor}
              onChange={(backgroundColor) => setTheme((current) => ({ ...current, backgroundColor }))}
            />
          </div>

          {/* Modo de color */}
          <div>
            <label className="block text-xs font-semibold text-slate-700">Modo de Color</label>
            <div className="mt-1.5 flex gap-2">
              <label className="flex items-center gap-2 rounded-xl border border-slate-200 p-2.5 text-xs font-medium cursor-pointer">
                <input
                  type="radio"
                  name="themeMode"
                  value="light"
                  checked={theme.themeMode === "light"}
                  onChange={() => setTheme((t) => ({ ...t, themeMode: "light", backgroundColor: "#f4f2fb" }))}
                />
                <Sun className="h-4 w-4 text-amber-500" />
                <span>Modo Claro</span>
              </label>
              <label className="flex items-center gap-2 rounded-xl border border-slate-200 p-2.5 text-xs font-medium cursor-pointer">
                <input
                  type="radio"
                  name="themeMode"
                  value="dark"
                  checked={theme.themeMode === "dark"}
                  onChange={() => setTheme((t) => ({ ...t, themeMode: "dark", backgroundColor: "#090d16" }))}
                />
                <Moon className="h-4 w-4 text-violet-400" />
                <span>Modo Oscuro (Luxe)</span>
              </label>
            </div>
          </div>

          {/* Distribución / Layout */}
          <div>
            <label className="block text-xs font-semibold text-slate-700">Distribución de Fotos & Layout</label>
            <select
              name="layoutStyle"
              value={theme.layoutStyle}
              onChange={(e) => setTheme((t) => ({ ...t, layoutStyle: e.target.value as LayoutStyle }))}
              className="mt-1.5 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs outline-none focus:border-slate-400"
            >
              <option value="panoramic">Portada Panorámica (Clásico)</option>
              <option value="split-gallery">Mosaico & Galería Dividida</option>
              <option value="floating-card">Tarjeta Flotante & Stories</option>
              <option value="minimal-editorial">Minimalista Editorial (Lookbook)</option>
            </select>
          </div>

          {/* Google Fonts */}
          <div>
            <label className="block text-xs font-semibold text-slate-700">
              Tipografía Oficial (Google Fonts)
            </label>
            <select
              name="fontFamily"
              value={theme.fontFamily}
              onChange={(event) =>
                setTheme((current) => ({
                  ...current,
                  fontFamily: event.target.value,
                }))
              }
              className="mt-1.5 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs outline-none focus:border-slate-400"
            >
              {GOOGLE_FONTS.map((font) => (
                <option key={font.id} value={font.id}>
                  {font.name} ({font.category}) — {font.description}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700">URL del Logo</label>
              <input
                name="logoUrl"
                value={theme.logoUrl}
                onChange={(event) => setTheme((current) => ({ ...current, logoUrl: event.target.value }))}
                placeholder="https://"
                className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs outline-none focus:border-slate-400"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700">URL Foto Portada</label>
              <input
                name="bannerUrl"
                value={theme.bannerUrl}
                onChange={(event) => setTheme((current) => ({ ...current, bannerUrl: event.target.value }))}
                placeholder="https://"
                className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs outline-none focus:border-slate-400"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700">Slogan</label>
              <input
                name="slogan"
                value={theme.slogan}
                onChange={(event) => setTheme((current) => ({ ...current, slogan: event.target.value }))}
                placeholder="Ej. Tu estilo en las mejores manos"
                className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs outline-none focus:border-slate-400"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700">Aviso / Políticas</label>
              <input
                name="bookingNotice"
                value={theme.bookingNotice}
                onChange={(event) => setTheme((current) => ({ ...current, bookingNotice: event.target.value }))}
                placeholder="Tolerancia 10 min..."
                className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs outline-none focus:border-slate-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">Bio / Descripción del Local</label>
            <textarea
              name="bio"
              rows={2}
              value={theme.bio}
              onChange={(event) => setTheme((current) => ({ ...current, bio: event.target.value }))}
              className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs outline-none focus:border-slate-400 resize-none"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700">Instagram</label>
              <input
                name="instagram"
                value={theme.instagram}
                onChange={(event) => setTheme((current) => ({ ...current, instagram: event.target.value }))}
                placeholder="@tunegocio"
                className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs outline-none focus:border-slate-400"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700">WhatsApp</label>
              <input
                name="whatsapp"
                value={theme.whatsapp}
                onChange={(event) => setTheme((current) => ({ ...current, whatsapp: event.target.value }))}
                placeholder="0981 123 456"
                className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs outline-none focus:border-slate-400"
              />
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center gap-3">
          <button
            type="submit"
            disabled={pending}
            className="h-11 rounded-full bg-slate-900 px-6 text-sm font-semibold text-white disabled:opacity-50 transition hover:bg-slate-800"
          >
            {pending ? "Guardando en PostgreSQL..." : "Guardar en Base de Datos"}
          </button>
          {state?.ok && <p className="text-sm font-medium text-emerald-700">¡Guardado con éxito!</p>}
          {state && !state.ok && <p className="text-sm text-rose-700">{state.message}</p>}
        </div>
      </form>

      <ThemePreview theme={theme} isDark={isDark} />
    </div>
  );
}

function ColorField({
  label,
  name,
  value,
  onChange,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block text-xs font-semibold text-slate-700">
      {label}
      <span className="mt-1.5 flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-10 w-12 cursor-pointer rounded-xl border border-slate-200 bg-white p-1"
          aria-label={label}
        />
        <input
          name={name}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-10 flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-3.5 font-mono text-xs uppercase outline-none focus:border-slate-400"
        />
      </span>
    </label>
  );
}

function ThemePreview({ theme, isDark }: { theme: ThemeSettings; isDark: boolean }) {
  return (
    <div className="lg:sticky lg:top-8">
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
        Vista previa en vivo
      </p>
      <div className="mx-auto w-[300px] rounded-[2.5rem] border-[8px] border-slate-900 bg-slate-900 p-1 shadow-xl">
        <div
          className="overflow-hidden rounded-[2.1rem] px-4 py-5 transition-colors duration-300"
          style={{
            backgroundColor: theme.backgroundColor,
            fontFamily: fontStack(theme.fontFamily),
            ["--primary" as string]: theme.primaryColor,
            color: isDark ? "#f8fafc" : "#0f172a",
          }}
        >
          {theme.bannerUrl && (
            <div className="h-16 w-full -mx-4 -mt-5 mb-3 overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={theme.bannerUrl} alt="" className="h-full w-full object-cover" />
            </div>
          )}

          <div className="mx-auto flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-white text-sm font-bold text-slate-900 shadow-sm border">
            {theme.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={theme.logoUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <Store className="h-6 w-6 text-primary" />
            )}
          </div>
          <p className="mt-2 text-center text-sm font-black">Tu Local</p>
          <p className="text-center text-[10px] opacity-75">{theme.slogan || "Tu estilo en las mejores manos"}</p>

          <div className="mt-4 rounded-xl border border-black/5 dark:border-white/10 p-2.5 text-xs font-semibold flex items-center justify-between">
            <span>Corte Clásico</span>
            <span className="text-primary font-black">Gs. 45.000</span>
          </div>

          <div
            className="mt-3 rounded-full py-2.5 text-center text-xs font-bold text-white shadow-sm"
            style={{ backgroundColor: theme.primaryColor }}
          >
            Continuar reserva
          </div>
        </div>
      </div>
    </div>
  );
}
