"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Copy,
  ExternalLink,
  Flower2,
  ImagePlus,
  Loader2,
  MessageCircle,
  Palette,
  PawPrint,
  Phone,
  Scissors,
  Shapes,
  ShieldCheck,
  Stethoscope,
  Store,
  Trash2,
  type LucideIcon,
} from "lucide-react";
import BrandLogo from "@/components/ui/BrandLogo";
import { googleFontHref } from "@/lib/theme";
import { getCommercialWhatsAppUrl } from "@/lib/config/whatsapp";
import {
  checkSlugAvailabilityAction,
  createTenantOnboardingAction,
} from "@/lib/tenant/actions";
import { requestWhatsAppCodeAction, verifyWhatsAppCodeAction } from "@/lib/verification/actions";
import { ROOT_DOMAIN, tenantBookingUrl, tenantHost } from "@/lib/tenant/public-url";
import PortalPreview from "./PortalPreview";
import { buildDesigns, extractBrandColors, type DesignId } from "./designs";

type ServiceSuggestion = { name: string; duration: number; price: number };

type Category = {
  id: string;
  label: string;
  tagline: string;
  icon: LucideIcon;
  services: ServiceSuggestion[];
};

const CATEGORIES: Category[] = [
  {
    id: "barberia",
    label: "Barbería o peluquería",
    tagline: "Barbería",
    icon: Scissors,
    services: [
      { name: "Corte clásico", duration: 30, price: 50000 },
      { name: "Corte y barba", duration: 45, price: 70000 },
      { name: "Perfilado de barba", duration: 20, price: 30000 },
    ],
  },
  {
    id: "estetica",
    label: "Estética o spa",
    tagline: "Estética & spa",
    icon: Flower2,
    services: [
      { name: "Limpieza facial", duration: 60, price: 150000 },
      { name: "Manicura semipermanente", duration: 60, price: 90000 },
      { name: "Masaje relajante", duration: 60, price: 160000 },
    ],
  },
  {
    id: "salud",
    label: "Consultorio o salud",
    tagline: "Consultorio",
    icon: Stethoscope,
    services: [
      { name: "Consulta general", duration: 30, price: 150000 },
      { name: "Control", duration: 15, price: 100000 },
      { name: "Limpieza dental", duration: 45, price: 120000 },
    ],
  },
  {
    id: "padel",
    label: "Canchas y deportes",
    tagline: "Canchas",
    icon: Activity,
    services: [
      { name: "Cancha 60 minutos", duration: 60, price: 150000 },
      { name: "Cancha 90 minutos", duration: 90, price: 210000 },
      { name: "Clase particular", duration: 60, price: 120000 },
    ],
  },
  {
    id: "veterinaria",
    label: "Veterinaria o pet shop",
    tagline: "Veterinaria",
    icon: PawPrint,
    services: [
      { name: "Consulta veterinaria", duration: 30, price: 120000 },
      { name: "Baño y corte", duration: 60, price: 90000 },
      { name: "Vacunación", duration: 15, price: 80000 },
    ],
  },
  {
    id: "otro",
    label: "Otro rubro",
    tagline: "",
    icon: Shapes,
    services: [],
  },
];

const GENERIC_SERVICES: ServiceSuggestion[] = [
  { name: "Primera consulta", duration: 30, price: 100000 },
  { name: "Sesión completa", duration: 60, price: 150000 },
];

const STEPS: { id: string; label: string; icon: LucideIcon }[] = [
  { id: "negocio", label: "Tu negocio", icon: Store },
  { id: "marca", label: "Tu marca", icon: Palette },
  { id: "servicio", label: "Tu servicio", icon: Scissors },
  { id: "contacto", label: "Tu WhatsApp", icon: Phone },
];

const DURATIONS = [15, 30, 45, 60, 90];
const DRAFT_KEY = "agendate_onboarding_draft";
const PREVIEW_FONTS = ["plus-jakarta-sans", "outfit", "fraunces"];

type SlugStatus = "idle" | "checking" | "available" | "taken" | "short";

type Draft = {
  businessName: string;
  category: string;
  categoryOther: string;
  slug: string;
  slugTouched: boolean;
  logoUrl: string;
  brandColors: string[];
  designId: DesignId;
  serviceName: string;
  duration: number;
  price: number;
  whatsapp: string;
  notifyOther: boolean;
  otherPhone: string;
  ownerName: string;
  ownerEmail: string;
};

const EMPTY_DRAFT: Draft = {
  businessName: "",
  category: "",
  categoryOther: "",
  slug: "",
  slugTouched: false,
  logoUrl: "",
  brandColors: [],
  designId: "luminoso",
  serviceName: "",
  duration: 30,
  price: 0,
  whatsapp: "",
  notifyOther: false,
  otherPhone: "",
  ownerName: "",
  ownerEmail: "",
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 28);
}

function normalizePhone(value: string) {
  let digits = value.replace(/\D/g, "");
  if (digits.startsWith("595")) digits = digits.slice(3);
  if (digits.startsWith("0")) digits = digits.slice(1);
  return digits.slice(0, 9);
}

function formatPhone(digits: string) {
  return [digits.slice(0, 3), digits.slice(3, 6), digits.slice(6, 9)].filter(Boolean).join(" ");
}

function isValidPhone(digits: string) {
  return /^9\d{8}$/.test(digits);
}

function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("read"));
    reader.onload = (event) => {
      const img = new Image();
      img.onerror = () => reject(new Error("decode"));
      img.onload = () => {
        const maxDim = 400;
        const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("canvas"));
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/webp", 0.86));
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

interface OnboardingWizardProps {
  account: { email: string; name: string } | null;
  verificationRequired: boolean;
}

export default function OnboardingWizard({ account, verificationRequired }: OnboardingWizardProps) {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
  const [hydrated, setHydrated] = useState(false);
  const [step, setStep] = useState(0);
  const [maxStep, setMaxStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [slugCheck, setSlugCheck] = useState<{ slug: string; available: boolean } | null>(null);
  const [logoBusy, setLogoBusy] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [createdSlug, setCreatedSlug] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [codeSentTo, setCodeSentTo] = useState<string | null>(null);
  const [verifiedPhone, setVerifiedPhone] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [devCode, setDevCode] = useState<string | null>(null);
  const [resendIn, setResendIn] = useState(0);
  const [busy, setBusy] = useState<"sending" | "verifying" | "creating" | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const topRef = useRef<HTMLDivElement>(null);

  const update = (patch: Partial<Draft>) => {
    setDraft((d) => ({ ...d, ...patch }));
    setErrors((er) => {
      const keys = Object.keys(patch).filter((k) => k in er);
      if (keys.length === 0) return er;
      const rest = { ...er };
      keys.forEach((k) => delete rest[k]);
      return rest;
    });
  };

  useEffect(() => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as { draft?: Partial<Draft>; step?: number };
        if (parsed.draft) setDraft({ ...EMPTY_DRAFT, ...parsed.draft });
        if (typeof parsed.step === "number" && parsed.step >= 0 && parsed.step < STEPS.length) {
          setStep(parsed.step);
          setMaxStep(parsed.step);
        }
      }
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated || createdSlug) return;
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ draft, step }));
    } catch {}
  }, [draft, step, hydrated, createdSlug]);

  useEffect(() => {
    const slug = draft.slug;
    if (slug.length < 3) return;
    let cancelled = false;
    const t = setTimeout(async () => {
      const res = await checkSlugAvailabilityAction(slug);
      if (!cancelled) setSlugCheck({ slug, available: res.available });
    }, 450);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [draft.slug]);

  useEffect(() => {
    if (resendIn <= 0) return;
    const t = setTimeout(() => setResendIn((n) => Math.max(0, n - 1)), 1000);
    return () => clearTimeout(t);
  }, [resendIn]);

  const slugStatus: SlugStatus = !draft.slug
    ? "idle"
    : draft.slug.length < 3
    ? "short"
    : slugCheck?.slug === draft.slug
    ? slugCheck.available
      ? "available"
      : "taken"
    : "checking";

  const clearError = (key: string) =>
    setErrors((er) => {
      if (!(key in er)) return er;
      const rest = { ...er };
      delete rest[key];
      return rest;
    });

  const category = CATEGORIES.find((c) => c.id === draft.category);
  const designs = useMemo(
    () => buildDesigns(draft.brandColors, draft.category),
    [draft.brandColors, draft.category],
  );
  const design = designs.find((d) => d.id === draft.designId) ?? designs[0];
  const hasSuggestions = Boolean(category?.services.length);
  const tagline =
    category?.id === "otro" ? draft.categoryOther.trim() || "Reservas online" : category?.tagline ?? "Reservas online";

  const previewServices = useMemo(() => {
    const pool = category?.services.length ? category.services : GENERIC_SERVICES;
    const main = {
      name: draft.serviceName.trim() || pool[0].name,
      duration: draft.duration,
      price: draft.price || pool[0].price,
    };
    const others = pool.filter((s) => s.name !== main.name);
    return [main, ...others];
  }, [draft.serviceName, draft.duration, draft.price, category]);

  const goTo = (target: number) => {
    setDirection(target > step ? 1 : -1);
    setStep(target);
    setMaxStep((m) => Math.max(m, target));
    setErrors({});
    requestAnimationFrame(() => topRef.current?.scrollIntoView({ block: "start" }));
  };

  const validate = (index: number) => {
    const next: Record<string, string> = {};
    if (index === 0) {
      if (draft.businessName.trim().length < 2) next.businessName = "Escribí el nombre de tu negocio.";
      if (!draft.category) next.category = "Elegí a qué te dedicás.";
      if (draft.category === "otro" && draft.categoryOther.trim().length < 2)
        next.categoryOther = "Contanos en pocas palabras a qué te dedicás.";
      if (/^-|-$/.test(draft.slug)) next.slug = "El link no puede empezar ni terminar con guion.";
      if (slugStatus === "taken") next.slug = "Ese link ya está en uso. Probá con otro.";
      if (slugStatus === "short" || !draft.slug) next.slug = "Tu link necesita al menos 3 letras.";
    }
    if (index === 2) {
      if (!draft.serviceName.trim()) next.serviceName = "Ponele un nombre a tu servicio.";
      if (!draft.price) next.price = "Poné un precio aproximado. Lo podés cambiar cuando quieras.";
    }
    if (index === 3) {
      if (!isValidPhone(draft.whatsapp)) next.whatsapp = "Revisá el número. Debe tener 9 dígitos, por ejemplo 981 123 456.";
      if (draft.notifyOther && !isValidPhone(draft.otherPhone))
        next.otherPhone = "Revisá este número, también debe tener 9 dígitos.";
      if (!account) {
        if (draft.ownerName.trim().length < 2) next.ownerName = "Escribí tu nombre.";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.ownerEmail.trim()))
          next.ownerEmail = "Escribí un correo válido, por ejemplo nombre@gmail.com.";
      }
    }
    setErrors(next);
    const firstKey = Object.keys(next)[0];
    if (firstKey) {
      requestAnimationFrame(() => document.getElementById(`field-${firstKey}`)?.focus());
    }
    return !firstKey;
  };

  const phoneVerified = !verificationRequired || verifiedPhone === draft.whatsapp;
  const codeSent = codeSentTo === draft.whatsapp;

  const focusField = (id: string) =>
    requestAnimationFrame(() => document.getElementById(`field-${id}`)?.focus());

  const sendCode = async () => {
    setBusy("sending");
    setSubmitting(true);
    setSubmitError(null);
    const res = await requestWhatsAppCodeAction(`595${draft.whatsapp}`);
    setSubmitting(false);
    setBusy(null);
    if (res.ok) {
      setCodeSentTo(draft.whatsapp);
      setResendIn(res.resendInSeconds);
      setDevCode(res.devCode ?? null);
      setCode(res.devCode ?? "");
      focusField("code");
    } else if (codeSent && res.retryInSeconds) {
      setResendIn(res.retryInSeconds);
    } else {
      setErrors((er) => ({ ...er, whatsapp: res.error }));
      focusField("whatsapp");
    }
  };

  const handleSubmit = async (e?: FormEvent, codeOverride?: string) => {
    e?.preventDefault();
    if (submitting) return;
    if (!validate(step)) return;
    if (step < STEPS.length - 1) {
      goTo(step + 1);
      return;
    }

    if (!phoneVerified) {
      if (!codeSent) {
        await sendCode();
        return;
      }
      const typed = (codeOverride ?? code).replace(/\D/g, "");
      if (typed.length !== 6) {
        setErrors((er) => ({ ...er, code: "Escribí los 6 números del código." }));
        focusField("code");
        return;
      }
      setBusy("verifying");
      setSubmitting(true);
      const check = await verifyWhatsAppCodeAction(`595${draft.whatsapp}`, typed);
      if (!check.ok) {
        setSubmitting(false);
        setBusy(null);
        setErrors((er) => ({ ...er, code: check.error }));
        focusField("code");
        return;
      }
      setVerifiedPhone(draft.whatsapp);
    }

    setBusy("creating");
    setSubmitting(true);
    setSubmitError(null);
    const res = await createTenantOnboardingAction({
      businessName: draft.businessName.trim(),
      category: draft.category,
      categoryLabel: draft.category === "otro" ? draft.categoryOther.trim() : undefined,
      slug: draft.slug.replace(/^-+|-+$/g, ""),
      serviceName: draft.serviceName.trim(),
      duration: draft.duration,
      price: draft.price,
      whatsapp: `595${draft.whatsapp}`,
      phoneType: draft.notifyOther ? "business" : "personal",
      personalPhone: draft.notifyOther ? `595${draft.otherPhone}` : "",
      logoUrl: draft.logoUrl,
      ownerName: account?.name || draft.ownerName.trim(),
      ownerEmail: account?.email || draft.ownerEmail.trim().toLowerCase(),
      theme: design.theme,
    });

    if (res.ok && res.slug) {
      try {
        localStorage.removeItem(DRAFT_KEY);
      } catch {}
      setCreatedSlug(res.slug);
      setSubmitting(false);
      setBusy(null);
      requestAnimationFrame(() => topRef.current?.scrollIntoView({ block: "start" }));
    } else {
      setSubmitting(false);
      setBusy(null);
      setSubmitError(res.error || "No pudimos crear tu página. Probá de nuevo en unos segundos.");
    }
  };

  const handleLogo = async (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setErrors((er) => ({ ...er, logo: "Ese archivo no es una imagen. Probá con un PNG o JPG." }));
      return;
    }
    setLogoBusy(true);
    try {
      const dataUrl = await compressImage(file);
      const colors = await extractBrandColors(dataUrl);
      update({ logoUrl: dataUrl, brandColors: colors });
      clearError("logo");
    } catch {
      setErrors((er) => ({ ...er, logo: "No pudimos leer esa imagen. Probá con otra." }));
    } finally {
      setLogoBusy(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const publicUrl = createdSlug ? tenantBookingUrl(createdSlug) : "";

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {}
  };

  const goToDashboard = () => {
    router.push("/dashboard?onboarding=completed&tour=start");
  };

  const isLast = step === STEPS.length - 1;
  const primaryLabel = !isLast
    ? "Continuar"
    : phoneVerified
    ? "Crear mi página"
    : codeSent
    ? "Verificar y crear mi página"
    : "Enviarme el código";
  const busyLabel =
    busy === "sending" ? "Enviando código…" : busy === "verifying" ? "Verificando código…" : "Creando tu página…";
  const helpUrl = getCommercialWhatsAppUrl("Hola, necesito ayuda para crear mi página en AgendatePY.");
  const slideOffset = reduceMotion ? 0 : 18;

  return (
    <div className="flex min-h-screen bg-[#fbfbfd] font-sans text-slate-900 antialiased selection:bg-brand selection:text-white">
      {PREVIEW_FONTS.map((f) => (
        <link key={f} rel="stylesheet" href={googleFontHref(f)} />
      ))}

      {/* Sidebar (desktop), mismo lenguaje que el panel */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[250px] flex-col border-r border-slate-200/80 bg-white lg:flex">
        <div className="flex h-16 items-center border-b border-slate-100 px-4">
          <Link href="/" aria-label="Volver al inicio">
            <BrandLogo variant="horizontal" iconClassName="h-6.5 w-6.5" />
          </Link>
        </div>

        <div className="border-b border-slate-100 p-3">
          <div className="flex items-center gap-2.5 rounded-xl border border-slate-200/80 bg-slate-50/60 p-2">
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg text-xs font-black shadow-xs transition-colors duration-500"
              style={{
                backgroundColor: draft.logoUrl ? "#ffffff" : design.theme.primaryColor,
                color: "#ffffff",
              }}
            >
              {draft.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={draft.logoUrl} alt="" className="h-full w-full object-contain" />
              ) : (
                (draft.businessName.trim()[0] || "A").toUpperCase()
              )}
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-bold text-slate-900">
                {draft.businessName.trim() || "Tu negocio"}
              </p>
              <p className="truncate text-[11px] text-slate-500">
                {tenantHost(draft.slug || "tu-negocio")}
              </p>
            </div>
          </div>
        </div>

        <nav aria-label="Pasos" className="flex-1 space-y-0.5 px-2.5 py-3.5">
          <p className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Configuración inicial
          </p>
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const active = !createdSlug && i === step;
            const completed = Boolean(createdSlug) || i < step || (i < maxStep && i !== step);
            const reachable = !createdSlug && i <= maxStep;
            return (
              <button
                key={s.id}
                type="button"
                disabled={!reachable}
                onClick={() => reachable && goTo(i)}
                aria-current={active ? "step" : undefined}
                className={`group flex h-10 w-full items-center gap-2 rounded-xl px-2.5 text-left transition-colors duration-150 disabled:cursor-default ${
                  active
                    ? "bg-slate-100 font-bold text-slate-950 shadow-2xs"
                    : reachable
                    ? "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    : "text-slate-400"
                }`}
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center">
                  {completed && !active ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  ) : (
                    <Icon className="h-4 w-4" style={active ? { color: "#FF4F2B" } : undefined} />
                  )}
                </span>
                <span className="text-xs">{s.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="border-t border-slate-100 p-2.5">
          <a
            href={helpUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2.5 rounded-xl border border-slate-200/80 bg-slate-50/60 p-2.5 text-xs transition hover:bg-slate-100/70"
          >
            <MessageCircle className="h-4 w-4 shrink-0 text-emerald-600" />
            <span className="min-w-0">
              <span className="block font-semibold text-slate-800">¿Te ayudamos?</span>
              <span className="block text-[11px] text-slate-500">Escribinos por WhatsApp</span>
            </span>
          </a>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col lg:pl-[250px]">
        {/* Header, igual que el del panel */}
        <header className="sticky top-0 z-20 flex h-[calc(3.5rem+env(safe-area-inset-top,0px))] items-center justify-between border-b border-slate-200/80 bg-white/90 px-3.5 pt-[env(safe-area-inset-top,0px)] backdrop-blur-xl sm:h-16 sm:px-6">
          <Link href="/" className="lg:hidden" aria-label="Volver al inicio">
            <BrandLogo variant="horizontal" iconClassName="h-6 w-6" />
          </Link>
          <p className="hidden text-sm font-semibold text-slate-900 lg:block">
            {createdSlug ? "Todo listo" : "Creá tu página de reservas"}
          </p>
          <div className="flex items-center gap-3">
            {!createdSlug && (
              <span className="text-xs font-semibold tabular-nums text-slate-500">
                Paso {step + 1} de {STEPS.length}
              </span>
            )}
            <a
              href={helpUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Pedir ayuda por WhatsApp"
              className="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 lg:hidden"
            >
              <MessageCircle className="h-4.5 w-4.5" />
            </a>
          </div>
        </header>

        {!createdSlug && (
          <div className="sticky top-[calc(3.5rem+env(safe-area-inset-top,0px))] z-20 grid grid-cols-4 gap-1 bg-[#fbfbfd] px-3.5 pt-2 sm:top-16 sm:px-6 lg:hidden">
            {STEPS.map((s, i) => (
              <span key={s.id} className="h-1 overflow-hidden rounded-full bg-slate-200/80">
                <span
                  className="block h-full rounded-full bg-brand transition-[width] duration-500 ease-out"
                  style={{ width: i <= step ? "100%" : "0%" }}
                />
              </span>
            ))}
          </div>
        )}

        <main className="w-full flex-1 p-3.5 pb-[calc(7rem+env(safe-area-inset-bottom,20px))] sm:p-6 sm:pb-32 lg:p-10 lg:pb-12">
          <div ref={topRef} className="scroll-mt-24" />
          <div className="mx-auto grid max-w-[1060px] items-start gap-10 xl:grid-cols-[minmax(0,1fr)_320px]">
            <div className="min-w-0 max-w-[600px]">
              {createdSlug ? (
                <SuccessView
                  businessName={draft.businessName.trim()}
                  slug={createdSlug}
                  publicUrl={publicUrl}
                  copied={copied}
                  onCopy={copyLink}
                  onContinue={goToDashboard}
                  reduceMotion={Boolean(reduceMotion)}
                />
              ) : (
                <form id="onboarding-form" noValidate onSubmit={handleSubmit}>
                  <AnimatePresence mode="wait" initial={false} custom={direction}>
                    <motion.div
                      key={step}
                      initial={{ opacity: 0, x: direction * slideOffset }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -direction * slideOffset }}
                      transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                    >
                      {step === 0 && (
                        <StepShell
                          title="¿Cómo se llama tu negocio?"
                          subtitle="Con esto armamos tu página y tu link para compartir."
                        >
                          <Group>
                            <Field id="businessName" label="Nombre del negocio" error={errors.businessName}>
                              <input
                                id="field-businessName"
                                type="text"
                                autoComplete="organization"
                                autoCapitalize="words"
                                value={draft.businessName}
                                onChange={(e) => {
                                  const businessName = e.target.value;
                                  update(
                                    draft.slugTouched
                                      ? { businessName }
                                      : { businessName, slug: slugify(businessName) },
                                  );
                                }}
                                placeholder="Ej: Barbería Don Pedro"
                                aria-invalid={Boolean(errors.businessName)}
                                aria-describedby={errors.businessName ? "error-businessName" : undefined}
                                className={inputClass(Boolean(errors.businessName))}
                              />
                            </Field>

                            <Field id="slug" label="Tu link de reservas" error={errors.slug}>
                              <div
                                className={`flex h-12 items-center rounded-xl border bg-white px-3.5 transition focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/15 ${
                                  errors.slug ? "border-rose-400" : "border-slate-200"
                                }`}
                              >
                                <input
                                  id="field-slug"
                                  type="text"
                                  autoCapitalize="none"
                                  autoCorrect="off"
                                  spellCheck={false}
                                  value={draft.slug}
                                  onChange={(e) =>
                                    update({
                                      slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 28),
                                      slugTouched: true,
                                    })
                                  }
                                  placeholder="tu-negocio"
                                  aria-invalid={Boolean(errors.slug)}
                                  aria-describedby="slug-status"
                                  className="min-w-0 flex-1 bg-transparent text-right text-base font-semibold text-slate-900 placeholder:font-normal placeholder:text-slate-400 focus:outline-none sm:text-sm"
                                />
                                <span className="shrink-0 text-base text-slate-400 sm:text-sm">.{ROOT_DOMAIN}</span>
                              </div>
                              {!errors.slug && <SlugStatusLine status={slugStatus} />}
                            </Field>
                          </Group>

                          <Group title="¿A qué te dedicás?" error={errors.category} errorId="error-category">
                            <div
                              role="radiogroup"
                              aria-label="Rubro"
                              id="field-category"
                              tabIndex={-1}
                              className="grid grid-cols-2 gap-2 focus:outline-none sm:grid-cols-3"
                            >
                              {CATEGORIES.map((cat) => {
                                const Icon = cat.icon;
                                const active = draft.category === cat.id;
                                return (
                                  <button
                                    key={cat.id}
                                    type="button"
                                    role="radio"
                                    aria-checked={active}
                                    onClick={() => {
                                      update({ category: cat.id });
                                      clearError("category");
                                    }}
                                    className={`flex min-h-[68px] flex-col items-start justify-between gap-2 rounded-xl border p-3 text-left transition active:scale-[0.98] ${
                                      active
                                        ? "border-brand bg-brand/[0.04] ring-1 ring-brand/30"
                                        : "border-slate-200 bg-white hover:border-slate-300"
                                    }`}
                                  >
                                    <Icon
                                      className={`h-5 w-5 ${active ? "text-brand" : "text-slate-500"}`}
                                      strokeWidth={1.9}
                                    />
                                    <span className="text-[13px] font-semibold leading-tight text-slate-800">
                                      {cat.label}
                                    </span>
                                  </button>
                                );
                              })}
                            </div>
                            {draft.category === "otro" && (
                              <Field id="categoryOther" label="Contanos a qué te dedicás" error={errors.categoryOther}>
                                <input
                                  id="field-categoryOther"
                                  type="text"
                                  autoCapitalize="sentences"
                                  maxLength={60}
                                  value={draft.categoryOther}
                                  onChange={(e) => update({ categoryOther: e.target.value })}
                                  placeholder="Ej: Estudio de tatuajes, clases de inglés"
                                  aria-invalid={Boolean(errors.categoryOther)}
                                  aria-describedby={errors.categoryOther ? "error-categoryOther" : undefined}
                                  className={inputClass(Boolean(errors.categoryOther))}
                                />
                              </Field>
                            )}
                          </Group>
                        </StepShell>
                      )}

                      {step === 1 && (
                        <StepShell
                          title="Dale tu estilo"
                          subtitle="Subí tu logo y elegí cómo se ve tu página. Lo podés cambiar cuando quieras."
                        >
                          <Group>
                            <input
                              ref={fileInputRef}
                              type="file"
                              accept="image/png,image/jpeg,image/webp"
                              className="hidden"
                              onChange={(e) => handleLogo(e.target.files?.[0])}
                            />
                            {draft.logoUrl ? (
                              <div className="flex items-center gap-3.5">
                                <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-white">
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img src={draft.logoUrl} alt="Tu logo" className="h-full w-full object-contain" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="text-sm font-semibold text-slate-900">Tu logo</p>
                                  <div className="mt-1 flex items-center gap-3">
                                    <button
                                      type="button"
                                      onClick={() => fileInputRef.current?.click()}
                                      className="text-xs font-semibold text-brand hover:underline underline-offset-2"
                                    >
                                      Cambiar
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => update({ logoUrl: "", brandColors: [] })}
                                      className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-rose-600"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                      Quitar
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                onDragOver={(e) => {
                                  e.preventDefault();
                                  setIsDragging(true);
                                }}
                                onDragLeave={() => setIsDragging(false)}
                                onDrop={(e) => {
                                  e.preventDefault();
                                  setIsDragging(false);
                                  handleLogo(e.dataTransfer.files?.[0]);
                                }}
                                className={`flex w-full items-center gap-3.5 rounded-xl border-2 border-dashed p-4 text-left transition ${
                                  isDragging
                                    ? "border-brand bg-brand/[0.04]"
                                    : "border-slate-200 hover:border-slate-300 hover:bg-slate-50/60"
                                }`}
                              >
                                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                                  {logoBusy ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                  ) : (
                                    <ImagePlus className="h-5 w-5" strokeWidth={1.9} />
                                  )}
                                </span>
                                <span className="min-w-0">
                                  <span className="block text-sm font-semibold text-slate-900">Subí tu logo</span>
                                  <span className="mt-0.5 block text-xs text-slate-500">
                                    Desde tu galería o sacale una foto. Es opcional.
                                  </span>
                                </span>
                              </button>
                            )}
                            {errors.logo && <p className="mt-2 text-xs text-rose-600">{errors.logo}</p>}
                          </Group>

                          <section className="mt-6">
                            <h2 className="text-sm font-bold text-slate-900">Elegí el diseño de tu página</h2>
                            <p className="mt-0.5 text-xs text-slate-500">
                              Tocá uno para verlo con tu nombre y tus servicios.
                            </p>
                            <div
                              role="radiogroup"
                              aria-label="Diseño de la página"
                              className="-mx-3.5 mt-3 flex snap-x snap-mandatory gap-3 overflow-x-auto px-3.5 pb-2 [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0 [&::-webkit-scrollbar]:hidden"
                            >
                              {designs.map((d) => {
                                const active = d.id === design.id;
                                return (
                                  <button
                                    key={d.id}
                                    type="button"
                                    role="radio"
                                    aria-checked={active}
                                    onClick={() => update({ designId: d.id })}
                                    className={`w-[68%] shrink-0 snap-center rounded-2xl border bg-white p-1.5 text-left transition sm:w-auto ${
                                      active
                                        ? "border-brand ring-2 ring-brand/20"
                                        : "border-slate-200 hover:border-slate-300"
                                    }`}
                                  >
                                    <div className="pointer-events-none h-[262px] overflow-hidden rounded-xl">
                                      <PortalPreview
                                        compact
                                        design={d}
                                        businessName={draft.businessName}
                                        logoUrl={draft.logoUrl}
                                        services={previewServices}
                                        tagline={tagline}
                                      />
                                    </div>
                                    <div className="px-1.5 pb-1 pt-2.5">
                                      <p className="flex items-center gap-1.5 text-sm font-bold text-slate-900">
                                        {d.name}
                                        {active && <Check className="h-4 w-4 text-brand" strokeWidth={2.6} />}
                                      </p>
                                      <p className="mt-0.5 text-xs leading-snug text-slate-500">{d.description}</p>
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                          </section>
                        </StepShell>
                      )}

                      {step === 2 && (
                        <StepShell
                          title="¿Cuál es tu servicio principal?"
                          subtitle="Empezá con uno. Los demás los sumás después desde tu panel."
                        >
                          {category && hasSuggestions && (
                            <Group title="Elegí uno para empezar rápido">
                              <div className="-my-1 divide-y divide-slate-100">
                                {category.services.map((s) => {
                                  const active =
                                    draft.serviceName === s.name &&
                                    draft.duration === s.duration &&
                                    draft.price === s.price;
                                  return (
                                    <button
                                      key={s.name}
                                      type="button"
                                      onClick={() =>
                                        update({ serviceName: s.name, duration: s.duration, price: s.price })
                                      }
                                      className="flex w-full items-center justify-between gap-3 py-3 text-left"
                                    >
                                      <span className="min-w-0">
                                        <span
                                          className={`block truncate text-sm ${
                                            active ? "font-bold text-slate-950" : "font-semibold text-slate-800"
                                          }`}
                                        >
                                          {s.name}
                                        </span>
                                        <span className="block text-xs tabular-nums text-slate-500">
                                          {s.duration} min · Gs. {s.price.toLocaleString("es-PY")}
                                        </span>
                                      </span>
                                      <span
                                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition ${
                                          active ? "border-brand bg-brand text-white" : "border-slate-300"
                                        }`}
                                      >
                                        {active && <Check className="h-3 w-3" strokeWidth={3} />}
                                      </span>
                                    </button>
                                  );
                                })}
                              </div>
                            </Group>
                          )}

                          <Group title={hasSuggestions ? "O escribilo a tu manera" : undefined}>
                            <Field id="serviceName" label="Nombre del servicio" error={errors.serviceName}>
                              <input
                                id="field-serviceName"
                                type="text"
                                autoCapitalize="sentences"
                                value={draft.serviceName}
                                onChange={(e) => update({ serviceName: e.target.value })}
                                placeholder={category?.services[0]?.name ?? "Ej: Primera consulta"}
                                aria-invalid={Boolean(errors.serviceName)}
                                aria-describedby={errors.serviceName ? "error-serviceName" : undefined}
                                className={inputClass(Boolean(errors.serviceName))}
                              />
                            </Field>

                            <fieldset>
                              <legend className="text-xs font-semibold text-slate-700">Duración</legend>
                              <div className="mt-1.5 grid grid-cols-5 gap-1 rounded-xl bg-slate-100 p-1">
                                {DURATIONS.map((m) => {
                                  const active = draft.duration === m;
                                  return (
                                    <button
                                      key={m}
                                      type="button"
                                      aria-pressed={active}
                                      onClick={() => update({ duration: m })}
                                      className={`h-10 rounded-lg text-sm tabular-nums transition ${
                                        active
                                          ? "bg-white font-bold text-slate-950 shadow-xs"
                                          : "font-medium text-slate-600 hover:text-slate-900"
                                      }`}
                                    >
                                      {m}
                                      <span className="text-[11px] font-medium text-slate-400"> min</span>
                                    </button>
                                  );
                                })}
                              </div>
                            </fieldset>

                            <Field id="price" label="Precio" error={errors.price}>
                              <div
                                className={`flex h-12 items-center rounded-xl border bg-white px-3.5 transition focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/15 ${
                                  errors.price ? "border-rose-400" : "border-slate-200"
                                }`}
                              >
                                <span className="shrink-0 text-base text-slate-400 sm:text-sm">Gs.</span>
                                <input
                                  id="field-price"
                                  type="text"
                                  inputMode="numeric"
                                  value={draft.price ? draft.price.toLocaleString("es-PY") : ""}
                                  onChange={(e) =>
                                    update({ price: Number(e.target.value.replace(/\D/g, "").slice(0, 9)) || 0 })
                                  }
                                  placeholder="50.000"
                                  aria-invalid={Boolean(errors.price)}
                                  aria-describedby={errors.price ? "error-price" : undefined}
                                  className="ml-1.5 min-w-0 flex-1 bg-transparent text-base font-semibold tabular-nums text-slate-900 placeholder:font-normal placeholder:text-slate-400 focus:outline-none sm:text-sm"
                                />
                              </div>                            </Field>
                          </Group>
                        </StepShell>
                      )}

                      {step === 3 && (
                        <StepShell
                          title="¿A qué WhatsApp te escriben?"
                          subtitle={
                            verificationRequired
                              ? "Lo mostramos en tu página y te avisamos ahí de cada reserva. Te mandamos un código para confirmar que es tuyo."
                              : "Lo mostramos en tu página y te avisamos ahí cada vez que alguien reserve."
                          }
                        >
                          <Group>
                            <Field id="whatsapp" label="Número de WhatsApp" error={errors.whatsapp}>
                              <PhoneInput
                                id="field-whatsapp"
                                value={draft.whatsapp}
                                invalid={Boolean(errors.whatsapp)}
                                describedBy={errors.whatsapp ? "error-whatsapp" : undefined}
                                onChange={(whatsapp) => {
                                  update({ whatsapp });
                                  if (whatsapp !== draft.whatsapp) {
                                    setCode("");
                                    setDevCode(null);
                                    clearError("code");
                                  }
                                }}
                              />
                              {verificationRequired && phoneVerified && (
                                <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-emerald-700">
                                  <Check className="h-3.5 w-3.5" strokeWidth={2.6} />
                                  Número verificado
                                </p>
                              )}
                            </Field>

                            {codeSent && !phoneVerified && (
                              <div className="rounded-xl bg-slate-50 p-3.5">
                                <label htmlFor="field-code" className="block text-sm font-semibold text-slate-800">
                                  Escribí el código que te mandamos
                                </label>
                                <p className="mt-0.5 text-xs text-slate-500">
                                  Lo enviamos por WhatsApp al +595 {formatPhone(draft.whatsapp)}.
                                </p>
                                <input
                                  id="field-code"
                                  type="text"
                                  inputMode="numeric"
                                  autoComplete="one-time-code"
                                  maxLength={6}
                                  value={code}
                                  onChange={(e) => {
                                    const v = e.target.value.replace(/\D/g, "").slice(0, 6);
                                    setCode(v);
                                    clearError("code");
                                    if (v.length === 6) handleSubmit(undefined, v);
                                  }}
                                  placeholder="000000"
                                  aria-invalid={Boolean(errors.code)}
                                  aria-describedby={errors.code ? "error-code" : undefined}
                                  className={`mt-3 h-12 w-full rounded-xl border bg-white px-3.5 text-center text-xl font-bold tabular-nums tracking-[0.5em] text-slate-900 placeholder:text-slate-300 transition focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/15 ${
                                    errors.code ? "border-rose-400" : "border-slate-200"
                                  }`}
                                />
                                {errors.code && (
                                  <p id="error-code" className="mt-1.5 text-xs text-rose-600">
                                    {errors.code}
                                  </p>
                                )}
                                {devCode && (
                                  <p className="mt-1.5 text-xs text-slate-500">
                                    Código de prueba (solo en desarrollo): <span className="font-semibold tabular-nums">{devCode}</span>
                                  </p>
                                )}
                                <button
                                  type="button"
                                  disabled={resendIn > 0 || submitting}
                                  onClick={sendCode}
                                  className="mt-3 text-xs font-semibold text-brand underline-offset-2 hover:underline disabled:cursor-default disabled:text-slate-400 disabled:no-underline"
                                >
                                  {resendIn > 0 ? `Reenviar código en ${resendIn} s` : "Reenviar código"}
                                </button>
                              </div>
                            )}

                            <div className="flex items-center justify-between gap-3">
                              <label htmlFor="notify-other" className="min-w-0 cursor-pointer">
                                <span className="block text-sm font-semibold text-slate-800">
                                  Avisarme a otro número
                                </span>
                                <span className="block text-xs text-slate-500">
                                  Si este es el del local y querés las alertas en tu celular.
                                </span>
                              </label>
                              <button
                                id="notify-other"
                                type="button"
                                role="switch"
                                aria-checked={draft.notifyOther}
                                onClick={() => update({ notifyOther: !draft.notifyOther })}
                                className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${
                                  draft.notifyOther ? "bg-brand" : "bg-slate-200"
                                }`}
                              >
                                <span
                                  className={`absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                                    draft.notifyOther ? "translate-x-5" : ""
                                  }`}
                                />
                              </button>
                            </div>

                            {draft.notifyOther && (
                              <Field id="otherPhone" label="Tu celular para las alertas" error={errors.otherPhone}>
                                <PhoneInput
                                  id="field-otherPhone"
                                  value={draft.otherPhone}
                                  invalid={Boolean(errors.otherPhone)}
                                  describedBy={errors.otherPhone ? "error-otherPhone" : undefined}
                                  onChange={(otherPhone) => update({ otherPhone })}
                                />
                              </Field>
                            )}
                          </Group>

                          <Group title="Tu cuenta">
                            {account ? (
                              <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white">
                                  {(account.name || account.email).trim()[0]?.toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                  <p className="truncate text-sm font-semibold text-slate-900">
                                    {account.name || "Tu cuenta"}
                                  </p>
                                  <p className="truncate text-xs text-slate-500">{account.email}</p>
                                </div>
                              </div>
                            ) : (
                              <>
                                <Field id="ownerName" label="Tu nombre" error={errors.ownerName}>
                                  <input
                                    id="field-ownerName"
                                    type="text"
                                    autoComplete="name"
                                    autoCapitalize="words"
                                    value={draft.ownerName}
                                    onChange={(e) => update({ ownerName: e.target.value })}
                                    placeholder="Ej: Marcos Benítez"
                                    aria-invalid={Boolean(errors.ownerName)}
                                    aria-describedby={errors.ownerName ? "error-ownerName" : undefined}
                                    className={inputClass(Boolean(errors.ownerName))}
                                  />
                                </Field>
                                <Field id="ownerEmail" label="Tu correo para entrar al panel" error={errors.ownerEmail}>
                                  <input
                                    id="field-ownerEmail"
                                    type="email"
                                    inputMode="email"
                                    autoComplete="email"
                                    autoCapitalize="none"
                                    autoCorrect="off"
                                    spellCheck={false}
                                    value={draft.ownerEmail}
                                    onChange={(e) => update({ ownerEmail: e.target.value })}
                                    placeholder="nombre@gmail.com"
                                    aria-invalid={Boolean(errors.ownerEmail)}
                                    aria-describedby={errors.ownerEmail ? "error-ownerEmail" : undefined}
                                    className={inputClass(Boolean(errors.ownerEmail))}
                                  />
                                </Field>
                              </>
                            )}
                          </Group>

                          <p className="mt-5 flex items-start gap-2 text-xs leading-relaxed text-slate-500">
                            <ShieldCheck className="mt-px h-4 w-4 shrink-0 text-emerald-600" />
                            Empezás gratis con hasta 20 turnos por mes. Sin tarjeta y sin contrato.
                          </p>

                          {submitError && (
                            <p role="alert" className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
                              {submitError}
                            </p>
                          )}
                        </StepShell>
                      )}
                    </motion.div>
                  </AnimatePresence>

                  <div className="mt-8 hidden items-center justify-between lg:flex">
                    {step > 0 ? (
                      <button
                        type="button"
                        onClick={() => goTo(step - 1)}
                        className="inline-flex h-11 items-center gap-1.5 rounded-xl px-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
                      >
                        <ArrowLeft className="h-4 w-4" />
                        Atrás
                      </button>
                    ) : (
                      <span />
                    )}
                    <PrimaryButton loading={submitting} label={primaryLabel} busyLabel={busyLabel} />
                  </div>
                </form>
              )}
            </div>

            {/* Vista previa en vivo (desktop) */}
            <aside className="sticky top-24 hidden xl:block" aria-label="Vista previa de tu página">
              <p className="mb-3 text-xs font-semibold text-slate-500">Así se ve tu página</p>
              <div className="rounded-[34px] border border-slate-200 bg-white p-2 shadow-[0_24px_60px_-28px_rgba(15,23,42,0.35)]">
                <div className="h-[470px] overflow-hidden rounded-[26px]">
                  <motion.div
                    key={design.id}
                    initial={reduceMotion ? false : { opacity: 0.4, filter: "blur(6px)" }}
                    animate={{ opacity: 1, filter: "blur(0px)" }}
                    transition={{ duration: 0.4 }}
                    className="h-full"
                  >
                    <PortalPreview
                      design={design}
                      businessName={draft.businessName}
                      logoUrl={draft.logoUrl}
                      services={previewServices}
                      tagline={tagline}
                    />
                  </motion.div>
                </div>
              </div>
              <p className="mt-3 text-center text-xs text-slate-400">
                {tenantHost(createdSlug || draft.slug || "tu-negocio")}
              </p>
            </aside>
          </div>
        </main>
      </div>

      {/* Barra inferior flotante (mobile), igual que la del panel */}
      <div className="fixed inset-x-3.5 bottom-[calc(0.75rem+env(safe-area-inset-bottom,0px))] z-40 mx-auto flex max-w-[430px] gap-1.5 rounded-[22px] border border-slate-200/80 bg-white/85 p-1.5 shadow-[0_10px_35px_rgba(0,0,0,0.08)] backdrop-blur-2xl lg:hidden">
        {createdSlug ? (
          <button
            type="button"
            onClick={goToDashboard}
            className="flex h-12 flex-1 items-center justify-center gap-2 rounded-[16px] bg-brand text-sm font-bold text-white shadow-md shadow-brand/25 active:scale-[0.98]"
          >
            Ir a mi panel
            <ArrowRight className="h-4 w-4" />
          </button>
        ) : (
          <>
            {step > 0 && (
              <button
                type="button"
                onClick={() => goTo(step - 1)}
                aria-label="Volver al paso anterior"
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[16px] bg-slate-100 text-slate-700 active:scale-95"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
            )}
            <button
              type="submit"
              form="onboarding-form"
              disabled={submitting}
              className="flex h-12 flex-1 items-center justify-center gap-2 rounded-[16px] bg-brand text-sm font-bold text-white shadow-md shadow-brand/25 transition active:scale-[0.98] disabled:opacity-70"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {busyLabel}
                </>
              ) : (
                <>
                  {primaryLabel}
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function inputClass(invalid: boolean) {
  return `h-12 w-full rounded-xl border bg-white px-3.5 text-base font-semibold text-slate-900 placeholder:font-normal placeholder:text-slate-400 transition focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/15 sm:text-sm ${
    invalid ? "border-rose-400" : "border-slate-200"
  }`;
}

function StepShell({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <div>
      <h1 className="text-[22px] font-extrabold leading-tight tracking-[-0.02em] text-balance text-slate-950 sm:text-[26px]">
        {title}
      </h1>
      <p className="mt-1.5 text-sm leading-relaxed text-slate-500 text-pretty">{subtitle}</p>
      <div className="mt-6">{children}</div>
    </div>
  );
}

function Group({
  title,
  error,
  errorId,
  children,
}: {
  title?: string;
  error?: string;
  errorId?: string;
  children: ReactNode;
}) {
  return (
    <section className="mt-4 first:mt-0">
      {title && <h2 className="mb-2 px-1 text-sm font-bold text-slate-900">{title}</h2>}
      <div className="space-y-4 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs sm:p-5">{children}</div>
      {error && (
        <p id={errorId} className="mt-2 px-1 text-xs text-rose-600">
          {error}
        </p>
      )}
    </section>
  );
}

function Field({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={`field-${id}`} className="mb-1.5 block text-xs font-semibold text-slate-700">
        {label}
      </label>
      {children}
      {error && (
        <p id={`error-${id}`} className="mt-1.5 text-xs text-rose-600">
          {error}
        </p>
      )}
    </div>
  );
}

function PhoneInput({
  id,
  value,
  invalid,
  describedBy,
  onChange,
}: {
  id: string;
  value: string;
  invalid: boolean;
  describedBy?: string;
  onChange: (digits: string) => void;
}) {
  return (
    <div
      className={`flex h-12 items-center rounded-xl border bg-white transition focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/15 ${
        invalid ? "border-rose-400" : "border-slate-200"
      }`}
    >
      <span className="flex h-full items-center border-r border-slate-200 px-3.5 text-base font-semibold text-slate-500 sm:text-sm">
        +595
      </span>
      <input
        id={id}
        type="tel"
        inputMode="tel"
        autoComplete="tel-national"
        value={formatPhone(value)}
        onChange={(e) => onChange(normalizePhone(e.target.value))}
        placeholder="981 123 456"
        aria-invalid={invalid}
        aria-describedby={describedBy}
        className="min-w-0 flex-1 bg-transparent px-3.5 text-base font-semibold tabular-nums text-slate-900 placeholder:font-normal placeholder:text-slate-400 focus:outline-none sm:text-sm"
      />
    </div>
  );
}

function SlugStatusLine({ status }: { status: SlugStatus }) {
  if (status === "idle") {
    return (
      <p id="slug-status" className="mt-1.5 text-xs text-slate-500">
        Se arma solo con el nombre. Podés editarlo.
      </p>
    );
  }
  const map: Record<Exclude<SlugStatus, "idle">, { text: string; className: string; icon: ReactNode }> = {
    checking: {
      text: "Revisando si está libre…",
      className: "text-slate-500",
      icon: <Loader2 className="h-3.5 w-3.5 animate-spin" />,
    },
    available: {
      text: "Disponible",
      className: "text-emerald-700",
      icon: <Check className="h-3.5 w-3.5" strokeWidth={2.6} />,
    },
    taken: {
      text: "Ya está en uso. Probá con otro.",
      className: "text-rose-600",
      icon: null,
    },
    short: {
      text: "Usá al menos 3 letras.",
      className: "text-slate-500",
      icon: null,
    },
  };
  const item = map[status];
  return (
    <p id="slug-status" aria-live="polite" className={`mt-1.5 flex items-center gap-1 text-xs font-medium ${item.className}`}>
      {item.icon}
      {item.text}
    </p>
  );
}

function PrimaryButton({ loading, label, busyLabel }: { loading: boolean; label: string; busyLabel: string }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="inline-flex h-11 items-center gap-2 rounded-xl bg-brand px-5 text-sm font-bold text-white shadow-md shadow-brand/20 transition hover:bg-brand-dark active:scale-[0.98] disabled:opacity-70"
    >
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          {busyLabel}
        </>
      ) : (
        <>
          {label}
          <ArrowRight className="h-4 w-4" />
        </>
      )}
    </button>
  );
}

function SuccessView({
  businessName,
  slug,
  publicUrl,
  copied,
  onCopy,
  onContinue,
  reduceMotion,
}: {
  businessName: string;
  slug: string;
  publicUrl: string;
  copied: boolean;
  onCopy: () => void;
  onContinue: () => void;
  reduceMotion: boolean;
}) {
  const shareText = encodeURIComponent(`¡Ya podés reservar tu turno en ${businessName}! ${publicUrl}`);
  return (
    <div>
      <motion.div
        initial={reduceMotion ? false : { scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 380, damping: 20 }}
        className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-[0_12px_28px_-10px_rgba(5,150,105,0.6)]"
      >
        <Check className="h-7 w-7" strokeWidth={3} />
      </motion.div>
      <h1 className="mt-5 text-[24px] font-extrabold leading-tight tracking-[-0.02em] text-balance text-slate-950 sm:text-[28px]">
        ¡{businessName || "Tu negocio"} ya está online!
      </h1>
      <p className="mt-1.5 text-sm leading-relaxed text-slate-500">
        Compartí tu link y empezá a recibir reservas hoy mismo.
      </p>

      <div className="mt-6 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs sm:p-5">
        <p className="text-xs font-semibold text-slate-700">Tu link de reservas</p>
        <div className="mt-1.5 flex items-center gap-2">
          <p className="min-w-0 flex-1 truncate rounded-xl bg-slate-50 px-3.5 py-3 text-sm font-semibold text-slate-900">
            {tenantHost(slug)}
          </p>
          <button
            type="button"
            onClick={onCopy}
            className="inline-flex h-11 shrink-0 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
            {copied ? "Copiado" : "Copiar"}
          </button>
        </div>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <a
            href={`https://wa.me/?text=${shareText}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#25D366] text-sm font-bold text-white transition hover:brightness-95"
          >
            <MessageCircle className="h-4 w-4" />
            Compartir por WhatsApp
          </a>
          <a
            href={publicUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <ExternalLink className="h-4 w-4" />
            Ver mi página
          </a>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs sm:p-5">
        <p className="text-sm font-bold text-slate-900">Lo que sigue en tu panel</p>
        <ul className="mt-3 space-y-2.5 text-sm text-slate-600">
          <li className="flex gap-2.5">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-slate-300" />
            Revisá tus horarios de atención
          </li>
          <li className="flex gap-2.5">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-slate-300" />
            Sumá el resto de tus servicios
          </li>
          <li className="flex gap-2.5">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-slate-300" />
            Poné tu link en tu Instagram
          </li>
        </ul>
      </div>

      <button
        type="button"
        onClick={onContinue}
        className="mt-8 hidden h-11 items-center gap-2 rounded-xl bg-brand px-5 text-sm font-bold text-white shadow-md shadow-brand/20 transition hover:bg-brand-dark active:scale-[0.98] lg:inline-flex"
      >
        Ir a mi panel
        <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  );
}
