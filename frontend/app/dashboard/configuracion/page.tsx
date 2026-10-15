"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  Banknote,
  Check,
  CheckCircle2,
  Copy,
  CreditCard,
  ExternalLink,
  Image as ImageIcon,
  KeyRound,
  Landmark,
  Loader2,
  LogOut,
  Moon,
  QrCode,
  Save,
  ShieldCheck,
  Store,
  Sun,
  Trash2,
  Users,
  Wallet,
} from "lucide-react";
import { TIMEZONES, useDashboardStore } from "@/store/useDashboardStore";
import CustomSelect from "@/components/dashboard/ui/CustomSelect";
import Modal from "@/components/dashboard/ui/Modal";
import ColorPicker from "@/components/dashboard/ui/ColorPicker";
import { normalizeParaguayPhone } from "@/lib/dashboard-dates";
import { tenantBookingUrl, tenantHost } from "@/lib/tenant/public-url";

const SECTIONS = [
  { id: "perfil", label: "Perfil" },
  { id: "horarios", label: "Horario" },
  { id: "pagos", label: "Medios de pago" },
  { id: "panel", label: "Panel" },
  { id: "cuenta", label: "Cuenta" },
] as const;

const PAYMENT_METHODS = [
  { id: "efectivo", title: "Efectivo", description: "Cobro en caja al atender", icon: Banknote },
  { id: "pos", title: "Tarjeta (POS)", description: "Débito y crédito con terminal Bancard", icon: CreditCard },
  { id: "transferencia", title: "Transferencia", description: "Entre cuentas de bancos locales", icon: Landmark },
  { id: "billetera", title: "Billeteras", description: "Tigo Money, Personal, Zimple, Wally", icon: Wallet },
  { id: "qr", title: "QR", description: "Pago con QR desde apps bancarias", icon: QrCode },
];

const INPUT_CLASS =
  "min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-white/10 dark:bg-slate-800 dark:text-white sm:min-h-10 sm:text-sm";
const LABEL_CLASS = "mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300";
const SECTION_CLASS = "scroll-mt-32 rounded-3xl glass-panel p-4 sm:p-5";

type ConfigForm = {
  name: string;
  phone: string;
  address: string;
  timezone: string;
  openingTime: string;
  closingTime: string;
  weekendClosing: string;
  sundayOpen: boolean;
  acceptedPaymentMethods: string[];
  primaryColor: string;
};

const toMinutes = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
};

function SectionTitle({ title, description, aside }: { title: string; description: string; aside?: React.ReactNode }) {
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

function Hint({ ok, children }: { ok: boolean; children: React.ReactNode }) {
  return (
    <p className={`mt-1 flex items-center gap-1.5 text-[11px] ${ok ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}`}>
      {ok ? <CheckCircle2 className="h-3 w-3 shrink-0" /> : <AlertCircle className="h-3 w-3 shrink-0" />}
      {children}
    </p>
  );
}

export default function ConfiguracionPage() {
  const { business, pushToast } = useDashboardStore();
  const systemColor = business.primaryColor || "#FF4F2B";

  const [form, setForm] = useState<ConfigForm | null>(null);
  const [savedSnapshot, setSavedSnapshot] = useState("");
  const [loadState, setLoadState] = useState<"loading" | "ready" | "error">("loading");
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [logoUrl, setLogoUrl] = useState("");
  const [slug, setSlug] = useState(business.slug || "");
  const [copiedLink, setCopiedLink] = useState(false);
  const [themeMode, setThemeMode] = useState<"light" | "dark">("dark");
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteText, setDeleteText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Load the real settings from the server (the store only holds a partial copy)
  useEffect(() => {
    let cancelled = false;
    fetch("/api/tenant/settings")
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(`HTTP ${res.status}`))))
      .then((data) => {
        if (cancelled || !data.ok) {
          if (!cancelled) setLoadState("error");
          return;
        }
        const b = data.business;
        const loaded: ConfigForm = {
          name: b.name || "",
          phone: b.phone || "",
          address: b.address || "",
          timezone: b.timezone || "America/Asuncion",
          openingTime: b.openingTime || "08:00",
          closingTime: b.closingTime || "20:00",
          weekendClosing: b.weekendClosing || "21:00",
          sundayOpen: Boolean(b.sundayOpen),
          acceptedPaymentMethods: Array.isArray(b.acceptedPaymentMethods) ? b.acceptedPaymentMethods : [],
          primaryColor: b.primaryColor || "#ff4f2b",
        };
        setForm(loaded);
        setSavedSnapshot(JSON.stringify(loaded));
        setLogoUrl(b.logoUrl || "");
        setSlug(b.slug || "");
        setLoadState("ready");
      })
      .catch(() => {
        if (!cancelled) setLoadState("error");
      });
    return () => {
      cancelled = true;
    };
  }, [loadAttempt]);

  // Dashboard light/dark mode is a per-device preference
  useEffect(() => {
    queueMicrotask(() => setThemeMode(document.documentElement.classList.contains("dark") ? "dark" : "light"));
  }, []);

  // Live preview of the panel color; reverts to the saved one if the page closes unsaved
  const draftColor = form?.primaryColor;
  const savedColorRef = useRef<string | null>(null);
  useEffect(() => {
    savedColorRef.current = savedSnapshot ? (JSON.parse(savedSnapshot) as ConfigForm).primaryColor : null;
  }, [savedSnapshot]);
  useEffect(() => {
    if (!draftColor) return;
    useDashboardStore.setState((s) =>
      s.business.primaryColor === draftColor ? s : { business: { ...s.business, primaryColor: draftColor } }
    );
  }, [draftColor]);
  useEffect(
    () => () => {
      const saved = savedColorRef.current;
      if (saved) useDashboardStore.setState((s) => ({ business: { ...s.business, primaryColor: saved } }));
    },
    []
  );

  const isDirty = loadState === "ready" && form !== null && JSON.stringify(form) !== savedSnapshot;

  // Validation
  const waNormalized = form ? normalizeParaguayPhone(form.phone) : "";
  const waValid = /^\+595\d{9}$/.test(waNormalized);
  const weekdayHoursValid = form ? toMinutes(form.closingTime) > toMinutes(form.openingTime) : true;
  const saturdayHoursValid = form ? toMinutes(form.weekendClosing) > toMinutes(form.openingTime) : true;
  const nameValid = (form?.name.trim().length ?? 0) >= 2;
  const canSave = isDirty && nameValid && weekdayHoursValid && saturdayHoursValid && (form?.acceptedPaymentMethods.length ?? 0) > 0;

  function patch(p: Partial<ConfigForm>) {
    setForm((prev) => (prev ? { ...prev, ...p } : prev));
  }

  async function handleSave(): Promise<boolean> {
    if (!form || !canSave || isSaving) return false;
    setIsSaving(true);
    const sent = JSON.stringify(form);
    try {
      const res = await fetch("/api/tenant/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          phone: form.phone.trim(),
          whatsappNumber: waValid ? waNormalized.replace(/\D/g, "") : form.phone.replace(/\D/g, ""),
          address: form.address.trim(),
          timezone: form.timezone,
          openingTime: form.openingTime,
          closingTime: form.closingTime,
          weekendClosing: form.weekendClosing,
          sundayOpen: form.sundayOpen,
          acceptedPaymentMethods: form.acceptedPaymentMethods,
          primaryColor: form.primaryColor,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) throw new Error(data.message || "No se pudo guardar la configuración.");

      setSavedSnapshot(sent);
      // Reflect the saved values in the rest of the dashboard without another request
      useDashboardStore.setState((s) => ({
        business: {
          ...s.business,
          name: form.name.trim(),
          phone: form.phone.trim(),
          whatsappNumber: waNormalized.replace(/\D/g, ""),
          address: form.address.trim(),
          timezone: form.timezone,
          acceptedPaymentMethods: form.acceptedPaymentMethods,
          primaryColor: form.primaryColor,
        },
      }));
      pushToast("success", "Configuración guardada.");
      return true;
    } catch (err) {
      pushToast("error", err instanceof Error ? err.message : "Error de red al guardar.");
      return false;
    } finally {
      setIsSaving(false);
    }
  }

  function handleDiscard() {
    if (savedSnapshot) setForm(JSON.parse(savedSnapshot) as ConfigForm);
  }

  // Ctrl/Cmd + S and leave-page protection
  const saveRef = useRef(handleSave);
  useEffect(() => {
    saveRef.current = handleSave;
  });
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        saveRef.current();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  useEffect(() => {
    if (!isDirty) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [isDirty]);

  function togglePayment(id: string) {
    if (!form) return;
    const active = form.acceptedPaymentMethods.includes(id);
    if (active && form.acceptedPaymentMethods.length <= 1) {
      pushToast("error", "Dejá al menos un medio de pago habilitado.");
      return;
    }
    patch({
      acceptedPaymentMethods: active
        ? form.acceptedPaymentMethods.filter((m) => m !== id)
        : [...form.acceptedPaymentMethods, id],
    });
  }

  function handleThemeChange(mode: "light" | "dark") {
    setThemeMode(mode);
    const root = document.documentElement;
    root.classList.toggle("dark", mode === "dark");
    root.classList.toggle("light", mode === "light");
    root.setAttribute("data-theme", mode);
    try {
      localStorage.setItem("agendate_theme_mode", mode);
    } catch {
      /* private mode */
    }
  }

  const publicUrl = tenantBookingUrl(slug || business.slug || "barberia");

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      pushToast("error", "No se pudo copiar el enlace.");
    }
  }

  async function handleLogout() {
    setIsLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      window.location.href = "/login";
    }
  }

  async function handleDeleteAccount() {
    if (deleteText.trim().toUpperCase() !== "ELIMINAR") return;
    setIsDeleting(true);
    try {
      const res = await fetch("/api/tenant/settings", { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "No se pudo eliminar el negocio.");
      window.location.href = "/login";
    } catch (err) {
      pushToast("error", err instanceof Error ? err.message : "Error de red.");
      setIsDeleting(false);
    }
  }

  const setupItems = form
    ? [
        { label: "Nombre del negocio", done: nameValid, href: "#perfil" },
        { label: "WhatsApp", done: waValid, href: "#perfil" },
        { label: "Dirección", done: form.address.trim().length > 5, href: "#perfil" },
        { label: "Logo", done: Boolean(logoUrl), href: "/dashboard/apariencia" },
        { label: "Horario de atención", done: weekdayHoursValid, href: "#horarios" },
        { label: "Medios de pago", done: form.acceptedPaymentMethods.length > 0, href: "#pagos" },
      ]
    : [];
  const doneCount = setupItems.filter((i) => i.done).length;

  return (
    <div className="mx-auto w-full max-w-5xl space-y-5 pb-28 sm:space-y-6 sm:pb-12">
      {/* ═══ HEADER ═══ */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">Tu negocio</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-3xl">Configuración</h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-500 dark:text-zinc-400">
            Datos del local, horario de atención, medios de pago y tu cuenta.
          </p>
        </div>
        <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto">
          <button
            type="button"
            onClick={copyLink}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-white/10 glass-panel-subtle px-3.5 text-xs font-semibold text-slate-700 transition hover:bg-white/10 dark:text-zinc-200"
          >
            {copiedLink ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4 text-slate-400" />}
            {copiedLink ? "Copiado" : "Copiar enlace"}
          </button>
          <Link
            href={publicUrl}
            target="_blank"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-white/10 glass-panel-subtle px-3.5 text-xs font-semibold text-slate-700 transition hover:bg-white/10 dark:text-zinc-200"
          >
            <ExternalLink className="h-4 w-4 text-slate-400" />
            Ver página
          </Link>
        </div>
      </header>

      {loadState === "loading" && (
        <div className="flex items-center justify-center gap-2 rounded-3xl glass-panel py-16 text-sm text-slate-500 dark:text-zinc-400">
          <Loader2 className="h-4 w-4 animate-spin" />
          Cargando configuración…
        </div>
      )}

      {loadState === "error" && (
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-rose-500/20 bg-rose-500/[0.06] px-3.5 py-3">
          <span className="flex items-start gap-2.5 text-xs">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" />
            <span>
              <span className="block font-semibold text-rose-700 dark:text-rose-300">No pudimos cargar tu configuración</span>
              <span className="mt-0.5 block text-[11px] text-slate-500 dark:text-zinc-400">Revisá tu conexión y volvé a intentar.</span>
            </span>
          </span>
          <button
            type="button"
            onClick={() => {
              setLoadState("loading");
              setLoadAttempt((n) => n + 1);
            }}
            className="inline-flex min-h-10 shrink-0 items-center rounded-xl border border-rose-500/20 px-3 text-xs font-semibold text-rose-700 transition hover:bg-rose-500/10 dark:text-rose-300"
          >
            Reintentar
          </button>
        </div>
      )}

      {form && (
        <>
          {/* ═══ SETUP CHECKLIST ═══ */}
          <section className="rounded-3xl glass-panel p-4 sm:p-5">
            <div className="flex items-end justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold text-slate-900 dark:text-white sm:text-base">
                  {doneCount === setupItems.length ? "Tu negocio está listo" : "Completá tu negocio"}
                </h2>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-zinc-400">
                  {doneCount === setupItems.length
                    ? "Tus clientes ven toda la información de tu local."
                    : "Estos datos aparecen en tu página y en los mensajes de WhatsApp."}
                </p>
              </div>
              <span className="shrink-0 text-xs font-semibold tabular-nums text-slate-700 dark:text-zinc-200">
                {doneCount} de {setupItems.length}
              </span>
            </div>
            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-white/[0.06]">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${(doneCount / setupItems.length) * 100}%`, backgroundColor: systemColor }}
              />
            </div>
            <ul className="mt-3 grid grid-cols-1 gap-1.5 sm:grid-cols-2 lg:grid-cols-3">
              {setupItems.map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    className="flex min-h-11 items-center gap-2.5 rounded-xl px-2.5 transition hover:bg-white/[0.04]"
                  >
                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                        item.done ? "bg-emerald-500 text-white" : "border border-slate-300 dark:border-white/20"
                      }`}
                    >
                      {item.done && <Check className="h-3 w-3" strokeWidth={3} />}
                    </span>
                    <span className={`min-w-0 flex-1 truncate text-xs font-medium ${item.done ? "text-slate-500 dark:text-zinc-400" : "text-slate-900 dark:text-white"}`}>
                      {item.label}
                    </span>
                    {!item.done && <ArrowRight className="h-3.5 w-3.5 shrink-0 text-slate-400" />}
                  </a>
                </li>
              ))}
            </ul>
          </section>

          {/* ═══ SECTION NAV ═══ */}
          <nav
            aria-label="Secciones de configuración"
            className="sticky top-0 z-20 -mx-1 flex gap-2 overflow-x-auto px-1 py-1 [scrollbar-width:none] lg:top-[100px] [&::-webkit-scrollbar]:hidden"
          >
            {SECTIONS.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="inline-flex min-h-10 shrink-0 items-center rounded-xl border border-white/10 bg-white/[0.025] px-3.5 text-xs font-semibold text-slate-600 backdrop-blur-md transition hover:bg-white/[0.06] dark:text-zinc-300"
              >
                {s.label}
              </a>
            ))}
          </nav>

          {/* ═══ PROFILE ═══ */}
          <section id="perfil" className={`${SECTION_CLASS} space-y-4`}>
            <SectionTitle title="Perfil del negocio" description="Se muestra en tu página de reservas, recibos y mensajes." />

            <div className="flex items-center gap-3.5 rounded-2xl border border-white/10 bg-white/[0.02] p-3">
              <Link
                href="/dashboard/apariencia"
                className="group relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white/10"
                aria-label="Cambiar logo en Apariencia"
              >
                {logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={logoUrl} alt="Logo" className="h-full w-full object-cover" />
                ) : (
                  <Store className="h-6 w-6 text-slate-400" />
                )}
              </Link>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{form.name || "Tu negocio"}</p>
                <p className="truncate tabular-nums text-[11px] text-slate-500 dark:text-zinc-400">{tenantHost(slug || "barberia")}</p>
              </div>
              <Link
                href="/dashboard/apariencia"
                className="inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-xl border border-white/10 px-3 text-xs font-semibold text-slate-600 transition hover:bg-white/[0.06] dark:text-zinc-300"
              >
                <ImageIcon className="h-3.5 w-3.5" />
                {logoUrl ? "Cambiar logo" : "Subir logo"}
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="cfg-name" className={LABEL_CLASS}>Nombre del negocio</label>
                <input
                  id="cfg-name"
                  type="text"
                  value={form.name}
                  maxLength={80}
                  onChange={(e) => patch({ name: e.target.value })}
                  placeholder="Ej: Barbería Los Muchachos"
                  className={INPUT_CLASS}
                />
                {!nameValid && <Hint ok={false}>El nombre debe tener al menos 2 caracteres.</Hint>}
              </div>

              <div>
                <span className={LABEL_CLASS}>Enlace de reservas</span>
                <div className="flex min-h-11 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3.5 sm:min-h-10">
                  <span className="min-w-0 flex-1 truncate tabular-nums text-sm text-slate-700 dark:text-zinc-200">{tenantHost(slug || "barberia")}</span>
                  <button
                    type="button"
                    onClick={copyLink}
                    aria-label="Copiar enlace"
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-white/10 hover:text-white"
                  >
                    {copiedLink ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
                <p className="mt-1 text-[11px] text-slate-500 dark:text-zinc-500">
                  Para cambiar el enlace escribinos a soporte: tus clientes ya lo tienen guardado.
                </p>
              </div>

              <div>
                <label htmlFor="cfg-phone" className={LABEL_CLASS}>WhatsApp del negocio</label>
                <input
                  id="cfg-phone"
                  type="tel"
                  inputMode="tel"
                  value={form.phone}
                  onChange={(e) => patch({ phone: e.target.value })}
                  placeholder="0981 123 456"
                  className={INPUT_CLASS}
                />
                {form.phone && (
                  <Hint ok={waValid}>{waValid ? `Tus clientes escriben a ${waNormalized}` : "Revisá el número (ej: 0981 123 456)"}</Hint>
                )}
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="cfg-address" className={LABEL_CLASS}>Dirección del local</label>
                <input
                  id="cfg-address"
                  type="text"
                  value={form.address}
                  maxLength={160}
                  onChange={(e) => patch({ address: e.target.value })}
                  placeholder="Ej: Av. Mariscal López 1420 c/ San Martín, Asunción"
                  className={INPUT_CLASS}
                />
              </div>
            </div>
          </section>

          {/* ═══ HOURS ═══ */}
          <section id="horarios" className={`${SECTION_CLASS} space-y-4`}>
            <SectionTitle
              title="Horario de atención"
              description="El asistente de WhatsApp lo usa para responder cuando el local está cerrado."
            />

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <div>
                <label htmlFor="cfg-open" className={LABEL_CLASS}>Abre</label>
                <input
                  id="cfg-open"
                  type="time"
                  value={form.openingTime}
                  onChange={(e) => patch({ openingTime: e.target.value })}
                  className={`${INPUT_CLASS} tabular-nums`}
                />
              </div>
              <div>
                <label htmlFor="cfg-close" className={LABEL_CLASS}>Cierra (lun a vie)</label>
                <input
                  id="cfg-close"
                  type="time"
                  value={form.closingTime}
                  onChange={(e) => patch({ closingTime: e.target.value })}
                  className={`${INPUT_CLASS} tabular-nums`}
                />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label htmlFor="cfg-sat" className={LABEL_CLASS}>Cierra (sábado)</label>
                <input
                  id="cfg-sat"
                  type="time"
                  value={form.weekendClosing}
                  onChange={(e) => patch({ weekendClosing: e.target.value })}
                  className={`${INPUT_CLASS} tabular-nums`}
                />
              </div>
            </div>
            {(!weekdayHoursValid || !saturdayHoursValid) && (
              <Hint ok={false}>La hora de cierre tiene que ser posterior a la de apertura.</Hint>
            )}

            <label className="flex min-h-14 cursor-pointer items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.02] px-3.5 py-2.5">
              <span className="min-w-0">
                <span className="block text-xs font-semibold text-slate-900 dark:text-white">Abrir los domingos</span>
                <span className="block text-[11px] text-slate-500 dark:text-zinc-400">
                  {form.sundayOpen ? "Mismo horario que entre semana" : "El domingo figura como cerrado"}
                </span>
              </span>
              <input
                type="checkbox"
                role="switch"
                checked={form.sundayOpen}
                onChange={(e) => patch({ sundayOpen: e.target.checked })}
                className="peer sr-only"
              />
              <span
                aria-hidden="true"
                className="relative h-6 w-10 shrink-0 rounded-full bg-slate-300 transition after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow-sm after:transition peer-checked:bg-primary peer-checked:after:translate-x-4 peer-focus-visible:ring-2 peer-focus-visible:ring-primary/40 dark:bg-white/15"
              />
            </label>

            <div>
              <span className={LABEL_CLASS}>Zona horaria</span>
              <CustomSelect
                value={form.timezone}
                onChange={(val) => patch({ timezone: val })}
                options={TIMEZONES.map((tz) => ({ value: tz, label: tz.replace(/_/g, " ") }))}
                className="w-full"
                buttonClassName="min-h-11 w-full sm:min-h-10"
              />
            </div>

            <p className="flex items-start gap-2 rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2.5 text-[11px] text-slate-500 dark:text-zinc-400">
              <Users className="mt-px h-3.5 w-3.5 shrink-0" />
              <span>
                Los turnos que ven tus clientes salen del horario de cada profesional.{" "}
                <Link href="/dashboard/equipo" className="font-semibold text-primary hover:underline">
                  Configurarlo en Equipo
                </Link>
              </span>
            </p>
          </section>

          {/* ═══ PAYMENT METHODS ═══ */}
          <section id="pagos" className={`${SECTION_CLASS} space-y-4`}>
            <SectionTitle
              title="Medios de pago"
              description="Las formas de cobro que acepta tu local."
              aside={
                <span className="shrink-0 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-[11px] font-semibold tabular-nums text-primary">
                  {form.acceptedPaymentMethods.length} de {PAYMENT_METHODS.length}
                </span>
              }
            />
            <ul className="divide-y divide-white/[0.06] overflow-hidden rounded-2xl border border-white/10">
              {PAYMENT_METHODS.map((pm) => {
                const enabled = form.acceptedPaymentMethods.includes(pm.id);
                const Icon = pm.icon;
                return (
                  <li key={pm.id}>
                    <label className="flex min-h-14 cursor-pointer items-center gap-3 px-3.5 py-2.5 transition hover:bg-white/[0.03]">
                      <span
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                          enabled ? "bg-primary/10 text-primary" : "bg-white/[0.04] text-slate-400"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-semibold text-slate-900 dark:text-white">{pm.title}</span>
                        <span className="block truncate text-[11px] text-slate-500 dark:text-zinc-400">{pm.description}</span>
                      </span>
                      <input
                        type="checkbox"
                        role="switch"
                        checked={enabled}
                        onChange={() => togglePayment(pm.id)}
                        className="peer sr-only"
                        aria-label={pm.title}
                      />
                      <span
                        aria-hidden="true"
                        className="relative h-6 w-10 shrink-0 rounded-full bg-slate-300 transition after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow-sm after:transition peer-checked:bg-primary peer-checked:after:translate-x-4 peer-focus-visible:ring-2 peer-focus-visible:ring-primary/40 dark:bg-white/15"
                      />
                    </label>
                  </li>
                );
              })}
            </ul>
          </section>

          {/* ═══ DASHBOARD PREFERENCES ═══ */}
          <section id="panel" className={`${SECTION_CLASS} space-y-4`}>
            <SectionTitle
              title="Panel de administración"
              description="Cómo se ve este panel. Tu página pública se configura en Apariencia."
            />
            <ColorPicker
              label="Color del panel"
              hint="Botones y acentos del dashboard"
              value={form.primaryColor}
              onChange={(hex) => setForm((prev) => (prev ? { ...prev, primaryColor: hex } : prev))}
            />
            <div>
              <span className={LABEL_CLASS}>Modo</span>
              <div className="grid grid-cols-2 gap-2">
                {([
                  { id: "light", label: "Claro", Icon: Sun },
                  { id: "dark", label: "Oscuro", Icon: Moon },
                ] as const).map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    aria-pressed={themeMode === m.id}
                    onClick={() => handleThemeChange(m.id)}
                    className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border text-xs font-semibold transition ${
                      themeMode === m.id
                        ? "border-primary/50 bg-primary/10 text-primary"
                        : "border-white/10 text-slate-600 hover:bg-white/[0.06] dark:text-zinc-300"
                    }`}
                  >
                    <m.Icon className="h-4 w-4" />
                    {m.label}
                  </button>
                ))}
              </div>
              <p className="mt-1 text-[11px] text-slate-500 dark:text-zinc-500">Se guarda solo en este dispositivo y se aplica al instante.</p>
            </div>
          </section>

          {/* ═══ ACCOUNT ═══ */}
          <section id="cuenta" className={`${SECTION_CLASS} space-y-3`}>
            <SectionTitle title="Cuenta y seguridad" description="Acceso a tu panel." />

            <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.02] px-3.5 py-3">
              <span className="flex min-w-0 items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/[0.04] text-slate-400">
                  <KeyRound className="h-4 w-4" />
                </span>
                <span className="min-w-0">
                  <span className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
                    Verificación en dos pasos
                    <span className="rounded-full bg-white/[0.06] px-2 py-0.5 text-[11px] font-semibold text-slate-500 dark:text-zinc-400">Próximamente</span>
                  </span>
                  <span className="block text-[11px] text-slate-500 dark:text-zinc-400">
                    Un código de tu celular al iniciar sesión. Lo vamos a habilitar pronto.
                  </span>
                </span>
              </span>
              <ShieldCheck className="h-4 w-4 shrink-0 text-slate-400" />
            </div>

            <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.02] px-3.5 py-3">
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-slate-900 dark:text-white">Cerrar sesión</span>
                <span className="block text-[11px] text-slate-500 dark:text-zinc-400">Salir del panel en este dispositivo.</span>
              </span>
              <button
                type="button"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-xl border border-white/10 px-3.5 text-xs font-semibold text-slate-700 transition hover:bg-white/[0.06] disabled:opacity-60 dark:text-zinc-200"
              >
                {isLoggingOut ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <LogOut className="h-3.5 w-3.5" />}
                Cerrar sesión
              </button>
            </div>

            <div className="flex flex-col gap-3 rounded-2xl border border-rose-500/20 bg-rose-500/[0.04] px-3.5 py-3 sm:flex-row sm:items-center sm:justify-between">
              <span className="flex min-w-0 items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose-500/10 text-rose-500">
                  <AlertTriangle className="h-4 w-4" />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-rose-700 dark:text-rose-300">Eliminar negocio</span>
                  <span className="block text-[11px] text-slate-500 dark:text-zinc-400">
                    Borra para siempre turnos, clientes, servicios y caja, y libera {tenantHost(slug || "barberia")}.
                  </span>
                </span>
              </span>
              <button
                type="button"
                onClick={() => {
                  setDeleteText("");
                  setIsDeleteOpen(true);
                }}
                className="inline-flex min-h-10 shrink-0 items-center justify-center gap-1.5 rounded-xl border border-rose-500/30 px-3.5 text-xs font-semibold text-rose-600 transition hover:bg-rose-500/10 dark:text-rose-300"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Eliminar negocio
              </button>
            </div>
          </section>
        </>
      )}

      {/* ═══ UNSAVED CHANGES BAR ═══ */}
      {isDirty && (
        <div
          role="status"
          className="fixed inset-x-3 bottom-[calc(env(safe-area-inset-bottom)+5.75rem)] z-40 flex items-center gap-3 rounded-2xl border border-amber-500/30 bg-slate-950/95 px-3.5 py-2.5 text-white shadow-2xl backdrop-blur-md animate-in slide-in-from-bottom duration-300 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 lg:bottom-6"
        >
          <span className="h-2 w-2 shrink-0 animate-pulse rounded-full bg-amber-400" />
          <span className="min-w-0 flex-1 truncate text-xs font-semibold text-slate-200 sm:flex-none">
            {canSave ? "Cambios sin guardar" : "Revisá los campos marcados"}
          </span>
          <button
            type="button"
            onClick={handleDiscard}
            className="min-h-9 shrink-0 rounded-xl px-2.5 text-xs font-semibold text-slate-400 transition hover:text-white"
          >
            Descartar
          </button>
          <button
            type="button"
            onClick={() => handleSave()}
            disabled={!canSave || isSaving}
            title="Guardar (Ctrl/⌘ + S)"
            className="inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-xl px-3.5 text-xs font-semibold text-white shadow-sm transition hover:brightness-110 disabled:opacity-50"
            style={{ backgroundColor: systemColor }}
          >
            {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            Guardar
          </button>
        </div>
      )}

      {/* ═══ DELETE CONFIRMATION ═══ */}
      <Modal
        open={isDeleteOpen}
        onClose={() => !isDeleting && setIsDeleteOpen(false)}
        title="Eliminar negocio"
        maxWidth="max-w-md"
        footer={
          <div className="grid grid-cols-2 gap-2 sm:flex sm:justify-end">
            <button
              type="button"
              onClick={() => setIsDeleteOpen(false)}
              disabled={isDeleting}
              className="min-h-11 rounded-xl border border-slate-200/80 px-4 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5 sm:min-h-10"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleDeleteAccount}
              disabled={isDeleting || deleteText.trim().toUpperCase() !== "ELIMINAR"}
              className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl bg-rose-600 px-4 text-xs font-semibold text-white shadow-sm transition hover:bg-rose-500 disabled:opacity-40 sm:min-h-10"
            >
              {isDeleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
              Eliminar para siempre
            </button>
          </div>
        }
      >
        <div className="space-y-3 text-sm text-slate-600 dark:text-zinc-300">
          <p>
            Se van a borrar <strong className="text-slate-900 dark:text-white">{form?.name || business.name}</strong>, todos los turnos,
            clientes, servicios, registros de caja y accesos del equipo. No se puede deshacer.
          </p>
          <div>
            <label htmlFor="cfg-delete" className={LABEL_CLASS}>
              Escribí <span className="tabular-nums text-rose-600 dark:text-rose-400">ELIMINAR</span> para confirmar
            </label>
            <input
              id="cfg-delete"
              type="text"
              autoComplete="off"
              value={deleteText}
              onChange={(e) => setDeleteText(e.target.value)}
              className={`${INPUT_CLASS} text-center tabular-nums font-semibold uppercase`}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
