"use client";

import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  Car,
  ChevronDown,
  Eye,
  EyeOff,
  FileText,
  Gift,
  Globe,
  Link as LinkIcon,
  MapPin,
  MessageCircle,
  MousePointerClick,
  Phone,
  Plus,
  Star,
  Trash2,
} from "lucide-react";
import {
  getCustomButtonClasses,
  getCustomButtonStyles,
  type ButtonAlignment,
  type ButtonBorderWidth,
  type ButtonFontWeight,
  type ButtonHeight,
  type ButtonRadius,
  type ButtonShadowType,
  type ButtonStyleVariant,
  type ButtonTextTransform,
  type CustomLinkIcon,
  type CustomLinkItem,
  type SectionOrder,
  type ThemeSettings,
} from "@/lib/theme";
import { normalizeParaguayPhone } from "@/lib/dashboard-dates";

const SECTION_CLASS = "rounded-3xl glass-panel p-4 sm:p-5";
const INPUT_CLASS =
  "min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-white/10 dark:bg-slate-800 dark:text-white sm:min-h-10 sm:text-sm";

function InstagramGlyph({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

const LINK_ICONS: { id: CustomLinkIcon; label: string; Icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "globe", label: "Web", Icon: Globe },
  { id: "whatsapp", label: "WhatsApp", Icon: MessageCircle },
  { id: "instagram", label: "Instagram", Icon: InstagramGlyph },
  { id: "maps", label: "Ubicación", Icon: MapPin },
  { id: "car", label: "Uber", Icon: Car },
  { id: "star", label: "Reseña", Icon: Star },
  { id: "file-text", label: "Precios", Icon: FileText },
  { id: "gift", label: "Regalo", Icon: Gift },
  { id: "phone", label: "Llamar", Icon: Phone },
];

function LinkGlyph({ icon, className = "h-4 w-4" }: { icon: CustomLinkIcon; className?: string }) {
  const Icon = LINK_ICONS.find((i) => i.id === icon)?.Icon ?? Globe;
  return <Icon className={className} />;
}

/** True for links a browser or phone can actually open. */
function isValidLink(url: string) {
  const value = url.trim();
  if (/^(tel:|mailto:)\S+$/i.test(value)) return true;
  try {
    const parsed = new URL(value);
    return (parsed.protocol === "https:" || parsed.protocol === "http:") && parsed.hostname.includes(".");
  } catch {
    return false;
  }
}

function OptionCard({
  active,
  onClick,
  title,
  description,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  description?: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`flex min-h-12 flex-col items-start justify-center rounded-xl border px-3 py-2 text-left transition ${
        active
          ? "border-primary bg-primary/10"
          : "border-white/10 bg-white/[0.02] hover:bg-white/[0.06]"
      }`}
    >
      <span className={`text-xs font-semibold ${active ? "text-primary" : "text-slate-800 dark:text-zinc-200"}`}>{title}</span>
      {description && <span className="mt-0.5 text-[11px] text-slate-500 dark:text-zinc-400">{description}</span>}
    </button>
  );
}

function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
}) {
  return (
    <div>
      <p className="mb-1.5 text-[11px] font-medium text-slate-500 dark:text-zinc-400">{label}</p>
      <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}>
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            aria-pressed={value === opt.value}
            onClick={() => onChange(opt.value)}
            className={`min-h-9 truncate rounded-lg border px-1.5 text-[11px] font-semibold transition ${
              value === opt.value
                ? "border-primary bg-primary/10 text-primary"
                : "border-white/10 text-slate-600 hover:bg-white/[0.06] dark:text-zinc-300"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function BotonesTab({
  theme,
  subTab,
  onSubTabChange,
  onChange,
}: {
  theme: ThemeSettings;
  subTab: "links" | "styles";
  onSubTabChange: (tab: "links" | "styles") => void;
  onChange: (patch: Partial<ThemeSettings>) => void;
}) {
  const links = theme.customLinks || [];
  const whatsappDigits = normalizeParaguayPhone(theme.whatsapp || "").replace(/\D/g, "");

  const quickLinks: { title: string; icon: CustomLinkIcon; url: string }[] = [
    { title: "Escribinos por WhatsApp", icon: "whatsapp", url: whatsappDigits ? `https://wa.me/${whatsappDigits}` : "https://wa.me/" },
    { title: "Cómo llegar", icon: "maps", url: theme.googleMapsUrl || "https://maps.google.com/" },
    { title: "Dejanos tu reseña", icon: "star", url: "https://g.page/r/" },
    { title: "Pedir un Uber", icon: "car", url: "https://m.uber.com/" },
    { title: "Lista de precios", icon: "file-text", url: "https://" },
    { title: "Regalá una gift card", icon: "gift", url: "https://" },
  ];

  function updateLinks(next: CustomLinkItem[]) {
    onChange({ customLinks: next });
  }

  function addLink(preset?: { title: string; icon: CustomLinkIcon; url: string }) {
    updateLinks([
      ...links,
      {
        id: `link-${Date.now()}`,
        title: preset?.title || "Nuevo botón",
        url: preset?.url || "https://",
        icon: preset?.icon || "globe",
        style: "default",
        enabled: true,
      },
    ]);
  }

  function patchLink(id: string, patch: Partial<CustomLinkItem>) {
    updateLinks(links.map((l) => (l.id === id ? { ...l, ...patch } : l)));
  }

  function moveLink(index: number, delta: -1 | 1) {
    const target = index + delta;
    if (target < 0 || target >= links.length) return;
    const next = [...links];
    [next[index], next[target]] = [next[target], next[index]];
    updateLinks(next);
  }

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      <div className="flex gap-2" role="tablist" aria-label="Secciones de botones">
        {([
          { id: "links", label: `Links (${links.length})`, Icon: LinkIcon },
          { id: "styles", label: "Estilo de botones", Icon: MousePointerClick },
        ] as const).map((t) => {
          const active = subTab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onSubTabChange(t.id)}
              className={`inline-flex min-h-10 items-center gap-2 rounded-xl border px-3.5 text-xs font-semibold transition ${
                active
                  ? "border-primary/40 bg-primary/10 text-primary"
                  : "border-white/10 bg-white/[0.025] text-slate-600 hover:bg-white/[0.06] dark:text-zinc-300"
              }`}
            >
              <t.Icon className="h-4 w-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      {subTab === "links" ? (
        <section data-tour="tour-buttons" className={`${SECTION_CLASS} space-y-4`}>
          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white sm:text-base">Links de tu página</h2>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-zinc-400">
              Botones para que te escriban, lleguen al local o te dejen una reseña.
            </p>
          </div>

          <div>
            <p className="mb-1.5 text-[11px] font-medium text-slate-500 dark:text-zinc-400">Agregar rápido</p>
            <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1 [scrollbar-width:none] sm:flex-wrap [&::-webkit-scrollbar]:hidden">
              {quickLinks.map((preset) => (
                <button
                  key={preset.title}
                  type="button"
                  onClick={() => addLink(preset)}
                  className="inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.02] px-3 text-[11px] font-medium text-slate-700 transition hover:border-primary/40 hover:text-primary dark:text-zinc-300"
                >
                  <span className="text-primary">
                    <LinkGlyph icon={preset.icon} className="h-3.5 w-3.5" />
                  </span>
                  {preset.title}
                  <Plus className="h-3 w-3 opacity-60" />
                </button>
              ))}
            </div>
          </div>

          {links.length === 0 ? (
            <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-white/15 px-4 py-8 text-center text-xs text-slate-500 dark:text-zinc-400">
              <LinkIcon className="h-6 w-6" />
              Todavía no agregaste links. Usá un atajo de arriba o creá uno propio.
            </div>
          ) : (
            <ul className="space-y-2.5">
              {links.map((link, index) => {
                const valid = isValidLink(link.url);
                return (
                  <li
                    key={link.id}
                    className={`space-y-2.5 rounded-2xl border p-3 transition ${
                      link.enabled ? "border-white/10 bg-white/[0.02]" : "border-white/5 bg-transparent opacity-60"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <label className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <LinkGlyph icon={link.icon} />
                        <select
                          aria-label="Ícono del botón"
                          value={link.icon}
                          onChange={(e) => patchLink(link.id, { icon: e.target.value as CustomLinkIcon })}
                          className="absolute inset-0 cursor-pointer opacity-0"
                        >
                          {LINK_ICONS.map((i) => (
                            <option key={i.id} value={i.id}>
                              {i.label}
                            </option>
                          ))}
                        </select>
                      </label>
                      <input
                        type="text"
                        value={link.title}
                        onChange={(e) => patchLink(link.id, { title: e.target.value })}
                        aria-label="Texto del botón"
                        placeholder="Texto del botón"
                        className={`${INPUT_CLASS} font-semibold`}
                      />
                    </div>

                    <div>
                      <input
                        type="url"
                        inputMode="url"
                        value={link.url}
                        onChange={(e) => patchLink(link.id, { url: e.target.value })}
                        aria-label="Destino del botón"
                        aria-invalid={!valid}
                        placeholder="https://…"
                        className={`${INPUT_CLASS} ${!valid ? "border-amber-500/60" : ""}`}
                      />
                      {!valid && (
                        <p className="mt-1 flex items-center gap-1.5 text-[11px] text-amber-600 dark:text-amber-400">
                          <AlertTriangle className="h-3 w-3" />
                          Completá un enlace válido (empieza con https://) o el botón no va a funcionar.
                        </p>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex gap-1" role="group" aria-label="Estilo del botón">
                        {([
                          { id: "default", label: "Normal" },
                          { id: "highlight", label: "Destacado" },
                          { id: "outline", label: "Borde" },
                        ] as const).map((s) => (
                          <button
                            key={s.id}
                            type="button"
                            aria-pressed={(link.style || "default") === s.id}
                            onClick={() => patchLink(link.id, { style: s.id })}
                            className={`min-h-8 rounded-lg px-2.5 text-[11px] font-semibold transition ${
                              (link.style || "default") === s.id
                                ? "bg-primary/10 text-primary"
                                : "text-slate-500 hover:bg-white/[0.06] dark:text-zinc-400"
                            }`}
                          >
                            {s.label}
                          </button>
                        ))}
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => moveLink(index, -1)}
                          disabled={index === 0}
                          aria-label="Subir"
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-white/10 hover:text-white disabled:opacity-30"
                        >
                          <ArrowUp className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveLink(index, 1)}
                          disabled={index === links.length - 1}
                          aria-label="Bajar"
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-white/10 hover:text-white disabled:opacity-30"
                        >
                          <ArrowDown className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => patchLink(link.id, { enabled: !link.enabled })}
                          aria-label={link.enabled ? "Ocultar botón" : "Mostrar botón"}
                          title={link.enabled ? "Visible" : "Oculto"}
                          className={`flex h-8 w-8 items-center justify-center rounded-lg transition hover:bg-white/10 ${
                            link.enabled ? "text-emerald-500" : "text-slate-400"
                          }`}
                        >
                          {link.enabled ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => updateLinks(links.filter((l) => l.id !== link.id))}
                          aria-label="Eliminar botón"
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-rose-500/15 hover:text-rose-400"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          <button
            type="button"
            onClick={() => addLink()}
            className="inline-flex min-h-10 w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-primary/40 text-xs font-semibold text-primary transition hover:bg-primary/5"
          >
            <Plus className="h-3.5 w-3.5" />
            Agregar link personalizado
          </button>
        </section>
      ) : (
        <section className={`${SECTION_CLASS} space-y-5`}>
          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white sm:text-base">Estilo de botones</h2>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-zinc-400">
              Así se ven los botones de reservar y tus links.
            </p>
          </div>

          <div>
            <p className="mb-1.5 text-[11px] font-medium text-slate-500 dark:text-zinc-400">Qué se muestra primero</p>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {([
                { id: "booking-first", title: "Turnos primero", description: "Servicios arriba, links al final" },
                { id: "links-first", title: "Links primero", description: "Tus links arriba, turnos abajo" },
                { id: "links-only", title: "Solo links", description: "Estilo bio de Instagram" },
                { id: "services-only", title: "Solo servicios", description: "Sin links, directo a reservar" },
              ] as const).map((item) => (
                <OptionCard
                  key={item.id}
                  active={(theme.sectionOrder || "booking-first") === item.id}
                  onClick={() => onChange({ sectionOrder: item.id as SectionOrder })}
                  title={item.title}
                  description={item.description}
                />
              ))}
            </div>
          </div>

          <div>
            <p className="mb-1.5 text-[11px] font-medium text-slate-500 dark:text-zinc-400">Acabado</p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {([
                { id: "solid", name: "Sólido" },
                { id: "outline", name: "Borde" },
                { id: "glass", name: "Vidrio" },
                { id: "glow", name: "Brillo" },
                { id: "gradient", name: "Degradado" },
                { id: "soft-elevated", name: "Elevado" },
                { id: "neubrutalism", name: "Brutalista" },
                { id: "double-border", name: "Doble borde" },
              ] as const).map((st) => {
                const sample = { ...theme, buttonStyle: st.id as ButtonStyleVariant, buttonHeight: "compact" as ButtonHeight };
                const active = theme.buttonStyle === st.id;
                return (
                  <button
                    key={st.id}
                    type="button"
                    aria-pressed={active}
                    onClick={() => onChange({ buttonStyle: st.id as ButtonStyleVariant })}
                    className={`flex flex-col items-center gap-2 rounded-xl border p-2.5 transition ${
                      active ? "border-primary bg-primary/10" : "border-white/10 bg-white/[0.02] hover:bg-white/[0.06]"
                    }`}
                  >
                    <span
                      className={`pointer-events-none flex w-full items-center !justify-center text-[11px] ${getCustomButtonClasses(sample)}`}
                      style={getCustomButtonStyles(sample)}
                    >
                      Reservar
                    </span>
                    <span className={`text-[11px] font-semibold ${active ? "text-primary" : "text-slate-600 dark:text-zinc-300"}`}>
                      {st.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <Segmented<ButtonRadius>
            label="Esquinas"
            value={theme.buttonRadius}
            onChange={(v) => onChange({ buttonRadius: v })}
            options={[
              { value: "full", label: "Píldora" },
              { value: "lg", label: "Redondeadas" },
              { value: "md", label: "Suaves" },
              { value: "none", label: "Rectas" },
            ]}
          />

          <details className="group rounded-2xl border border-white/10">
            <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-2 px-3.5 text-xs font-semibold text-slate-700 dark:text-zinc-200 [&::-webkit-details-marker]:hidden">
              <span>
                Ajustes avanzados
                <span className="ml-1.5 font-normal text-slate-500 dark:text-zinc-400">Tamaño, texto, sombra y borde</span>
              </span>
              <ChevronDown className="h-4 w-4 text-slate-400 transition group-open:rotate-180" />
            </summary>
            <div className="grid gap-4 border-t border-white/10 p-3.5 sm:grid-cols-2">
              <Segmented<ButtonHeight>
                label="Altura"
                value={theme.buttonHeight}
                onChange={(v) => onChange({ buttonHeight: v })}
                options={[
                  { value: "compact", label: "Compacta" },
                  { value: "medium", label: "Media" },
                  { value: "tall", label: "Alta" },
                ]}
              />
              <Segmented<ButtonAlignment>
                label="Alineación"
                value={theme.buttonAlignment}
                onChange={(v) => onChange({ buttonAlignment: v })}
                options={[
                  { value: "center", label: "Centro" },
                  { value: "left", label: "Izquierda" },
                  { value: "spread", label: "Extremos" },
                ]}
              />
              <Segmented<ButtonTextTransform>
                label="Texto"
                value={theme.buttonTextTransform}
                onChange={(v) => onChange({ buttonTextTransform: v })}
                options={[
                  { value: "none", label: "Normal" },
                  { value: "capitalize", label: "Título" },
                  { value: "uppercase", label: "MAYÚS" },
                ]}
              />
              <Segmented<ButtonFontWeight>
                label="Grosor"
                value={theme.buttonFontWeight}
                onChange={(v) => onChange({ buttonFontWeight: v })}
                options={[
                  { value: "medium", label: "Medio" },
                  { value: "semibold", label: "Semi" },
                  { value: "bold", label: "Negrita" },
                  { value: "black", label: "Extra" },
                ]}
              />
              <Segmented<ButtonShadowType>
                label="Sombra"
                value={theme.buttonShadow}
                onChange={(v) => onChange({ buttonShadow: v })}
                options={[
                  { value: "none", label: "No" },
                  { value: "soft", label: "Suave" },
                  { value: "medium", label: "Media" },
                  { value: "hard", label: "Retro" },
                  { value: "glow", label: "Aura" },
                ]}
              />
              <Segmented<ButtonBorderWidth>
                label="Borde"
                value={theme.buttonBorderWidth}
                onChange={(v) => onChange({ buttonBorderWidth: v })}
                options={[
                  { value: "0px", label: "No" },
                  { value: "1px", label: "Fino" },
                  { value: "2px", label: "Medio" },
                  { value: "3px", label: "Grueso" },
                ]}
              />
            </div>
          </details>
        </section>
      )}
    </div>
  );
}
