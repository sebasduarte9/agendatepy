"use client";

import { AlertTriangle, Check, CheckCircle2, ExternalLink, Plus } from "lucide-react";
import type { ThemeSettings } from "@/lib/theme";
import { normalizeParaguayPhone } from "@/lib/dashboard-dates";
import {
  FacebookOfficialIcon,
  GoogleMapsOfficialIcon,
  InstagramOfficialIcon,
  WhatsAppOfficialIcon,
} from "@/components/dashboard/apariencia/BrandIcons";

const SECTION_CLASS = "rounded-3xl glass-panel p-4 sm:p-5";
const INPUT_CLASS =
  "min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-white/10 dark:bg-slate-800 dark:text-white sm:min-h-10 sm:text-sm";

const SLOGAN_MAX = 80;
const BIO_MAX = 220;
const NOTICE_MAX = 300;

const POLICY_TEMPLATES = [
  "10 min de tolerancia de espera.",
  "Cancelaciones con al menos 2h de anticipación.",
  "Seña del 50% para turnos de más de 1h.",
  "Llegá puntual; si te atrasás puede reducirse el servicio.",
  "Aceptamos efectivo, transferencia y tarjeta.",
];

function TikTokIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M19.6 6.7a4.8 4.8 0 0 1-3.8-4.2V2h-3.4v13.4a2.9 2.9 0 1 1-2-2.8V9.1a6.3 6.3 0 1 0 5.4 6.3V8.6a8.2 8.2 0 0 0 3.8 1.2V6.7z"
      />
    </svg>
  );
}

function Counter({ value, max }: { value: number; max: number }) {
  return (
    <span className={`text-[11px] tabular-nums ${value > max * 0.9 ? "text-amber-600 dark:text-amber-400" : "text-slate-400"}`}>
      {value}/{max}
    </span>
  );
}

function Hint({ ok, children }: { ok: boolean; children: React.ReactNode }) {
  return (
    <p
      className={`mt-1 flex items-center gap-1.5 text-[11px] ${
        ok ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"
      }`}
    >
      {ok ? <CheckCircle2 className="h-3 w-3 shrink-0" /> : <AlertTriangle className="h-3 w-3 shrink-0" />}
      <span className="min-w-0 truncate">{children}</span>
    </p>
  );
}

/** "@barberia", "instagram.com/barberia/" or a full URL → "barberia". */
function instagramHandle(value: string) {
  return value
    .trim()
    .replace(/^https?:\/\/(www\.)?instagram\.com\//i, "")
    .replace(/^@/, "")
    .replace(/[/?#].*$/, "");
}

function isHttpUrl(value: string) {
  try {
    const url = new URL(value.trim());
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

export default function TextosTab({
  theme,
  onChange,
}: {
  theme: ThemeSettings;
  onChange: (patch: Partial<ThemeSettings>) => void;
}) {
  const igHandle = instagramHandle(theme.instagram || "");
  const igValid = /^[a-zA-Z0-9._]{1,30}$/.test(igHandle);
  const waNormalized = normalizeParaguayPhone(theme.whatsapp || "");
  const waValid = /^\+595\d{9}$/.test(waNormalized);
  const tiktokHandle = (theme.tiktok || "").trim().replace(/^https?:\/\/(www\.)?tiktok\.com\/@?/i, "").replace(/^@/, "");
  const notice = theme.bookingNotice || "";

  function togglePolicy(tpl: string) {
    if (notice.includes(tpl)) {
      onChange({ bookingNotice: notice.replace(tpl, "").replace(/\s{2,}/g, " ").trim() });
    } else {
      onChange({ bookingNotice: notice ? `${notice.trim()} ${tpl}` : tpl });
    }
  }

  return (
    <div className="space-y-5 animate-in fade-in duration-200" data-tour="tour-texts">
      {/* ═══ IDENTITY ═══ */}
      <section className={`${SECTION_CLASS} space-y-4`}>
        <div>
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white sm:text-base">Presentación</h2>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-zinc-400">
            Lo que leen tus clientes debajo de tu nombre.
          </p>
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label htmlFor="theme-slogan" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Eslogan
            </label>
            <Counter value={(theme.slogan || "").length} max={SLOGAN_MAX} />
          </div>
          <input
            id="theme-slogan"
            type="text"
            maxLength={SLOGAN_MAX}
            value={theme.slogan}
            onChange={(e) => onChange({ slogan: e.target.value })}
            placeholder="Ej: Cortes clásicos y fades en Villa Morra"
            className={INPUT_CLASS}
          />
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label htmlFor="theme-bio" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Descripción
            </label>
            <Counter value={(theme.bio || "").length} max={BIO_MAX} />
          </div>
          <textarea
            id="theme-bio"
            rows={3}
            maxLength={BIO_MAX}
            value={theme.bio}
            onChange={(e) => onChange({ bio: e.target.value })}
            placeholder="Contá tus especialidades, años de experiencia o qué te hace distinto."
            className={`${INPUT_CLASS} resize-y`}
          />
        </div>
      </section>

      {/* ═══ CONTACT & SOCIAL ═══ */}
      <section className={`${SECTION_CLASS} space-y-4`}>
        <div>
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white sm:text-base">Contacto y redes</h2>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-zinc-400">
            Aparecen como íconos en tu página. Dejá vacío lo que no uses.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="theme-whatsapp" className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
              <WhatsAppOfficialIcon className="h-4 w-4" />
              WhatsApp
            </label>
            <input
              id="theme-whatsapp"
              type="tel"
              inputMode="tel"
              value={theme.whatsapp}
              onChange={(e) => onChange({ whatsapp: e.target.value })}
              placeholder="0981 123 456"
              className={INPUT_CLASS}
            />
            {theme.whatsapp && (
              <Hint ok={waValid}>{waValid ? `Se abre ${waNormalized}` : "Revisá el número (ej: 0981 123 456)"}</Hint>
            )}
          </div>

          <div>
            <label htmlFor="theme-instagram" className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
              <InstagramOfficialIcon className="h-4 w-4" />
              Instagram
            </label>
            <input
              id="theme-instagram"
              type="text"
              autoCapitalize="none"
              value={theme.instagram}
              onChange={(e) => onChange({ instagram: e.target.value })}
              placeholder="@tunegocio"
              className={INPUT_CLASS}
            />
            {theme.instagram && (
              <Hint ok={igValid}>{igValid ? `instagram.com/${igHandle}` : "Usá solo tu usuario, por ejemplo @tunegocio"}</Hint>
            )}
          </div>

          <div>
            <label htmlFor="theme-tiktok" className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
              <TikTokIcon className="h-4 w-4 text-slate-900 dark:text-white" />
              TikTok
            </label>
            <input
              id="theme-tiktok"
              type="text"
              autoCapitalize="none"
              value={theme.tiktok || ""}
              onChange={(e) => onChange({ tiktok: e.target.value })}
              placeholder="@tunegocio"
              className={INPUT_CLASS}
            />
            {tiktokHandle && <Hint ok>tiktok.com/@{tiktokHandle}</Hint>}
          </div>

          <div>
            <label htmlFor="theme-facebook" className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
              <FacebookOfficialIcon className="h-4 w-4" />
              Facebook
            </label>
            <input
              id="theme-facebook"
              type="text"
              autoCapitalize="none"
              value={theme.facebook || ""}
              onChange={(e) => onChange({ facebook: e.target.value })}
              placeholder="facebook.com/tunegocio"
              className={INPUT_CLASS}
            />
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="theme-maps" className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
              <GoogleMapsOfficialIcon className="h-4 w-4" />
              Ubicación en Google Maps
            </label>
            <div className="flex gap-2">
              <input
                id="theme-maps"
                type="url"
                inputMode="url"
                value={theme.googleMapsUrl || ""}
                onChange={(e) => onChange({ googleMapsUrl: e.target.value })}
                placeholder="https://maps.app.goo.gl/…"
                className={INPUT_CLASS}
              />
              {isHttpUrl(theme.googleMapsUrl || "") && (
                <a
                  href={theme.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Probar enlace de Google Maps"
                  title="Probar enlace"
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 text-slate-500 transition hover:bg-white/[0.06] hover:text-slate-800 dark:text-zinc-400 dark:hover:text-white sm:h-10 sm:w-10"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
            </div>
            {theme.googleMapsUrl && !isHttpUrl(theme.googleMapsUrl) && (
              <Hint ok={false}>Pegá el enlace completo que te da Google Maps al tocar Compartir.</Hint>
            )}
          </div>
        </div>
      </section>

      {/* ═══ BOOKING POLICIES ═══ */}
      <section className={`${SECTION_CLASS} space-y-4`}>
        <div>
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white sm:text-base">Políticas de reserva</h2>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-zinc-400">
            El cliente las ve antes de confirmar su turno.
          </p>
        </div>

        <div>
          <p className="mb-1.5 text-[11px] font-medium text-slate-500 dark:text-zinc-400">Sugerencias</p>
          <div className="flex flex-wrap gap-1.5">
            {POLICY_TEMPLATES.map((tpl) => {
              const included = notice.includes(tpl);
              return (
                <button
                  key={tpl}
                  type="button"
                  aria-pressed={included}
                  onClick={() => togglePolicy(tpl)}
                  className={`inline-flex min-h-9 items-center gap-1.5 rounded-xl border px-3 text-left text-[11px] font-medium transition ${
                    included
                      ? "border-primary/40 bg-primary/10 text-primary"
                      : "border-white/10 bg-white/[0.02] text-slate-700 hover:border-primary/40 hover:text-primary dark:text-zinc-300"
                  }`}
                >
                  {included ? <Check className="h-3 w-3 shrink-0" /> : <Plus className="h-3 w-3 shrink-0" />}
                  {tpl}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label htmlFor="theme-notice" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Texto del aviso
            </label>
            <Counter value={notice.length} max={NOTICE_MAX} />
          </div>
          <textarea
            id="theme-notice"
            rows={3}
            maxLength={NOTICE_MAX}
            value={notice}
            onChange={(e) => onChange({ bookingNotice: e.target.value })}
            placeholder="Ej: Tenés 10 minutos de tolerancia antes de liberar el turno."
            className={`${INPUT_CLASS} resize-y`}
          />
        </div>
      </section>
    </div>
  );
}
