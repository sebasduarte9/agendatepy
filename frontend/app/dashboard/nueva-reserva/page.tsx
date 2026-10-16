"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Ban,
  Banknote,
  Calendar,
  CalendarPlus,
  Check,
  CheckCircle2,
  Clock,
  CreditCard,
  Landmark,
  Loader2,
  MessageCircle,
  Search,
  Smartphone,
  UserCheck,
} from "lucide-react";
import { addDays, format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { formatInTimeZone, fromZonedTime } from "date-fns-tz";
import { useDashboardStore } from "@/store/useDashboardStore";
import CustomSelect from "@/components/dashboard/ui/CustomSelect";
import { formatGs } from "@/lib/dashboard-dates";
import { triggerHaptic } from "@/lib/haptics";
import type { PaymentMethod } from "@/lib/dashboard-types";

type CountryOption = {
  code: string;
  name: string;
  flag: string;
  dialCode: string;
  maxDigits: number;
  minDigits: number;
  placeholder: string;
}

const COUNTRY_LIST: CountryOption[] = [
  { code: "PY", name: "Paraguay", flag: "🇵🇾", dialCode: "+595", maxDigits: 10, minDigits: 9, placeholder: "0981 123 456" },
  { code: "AR", name: "Argentina", flag: "🇦🇷", dialCode: "+54", maxDigits: 11, minDigits: 10, placeholder: "9 11 2345 6789" },
  { code: "BR", name: "Brasil", flag: "🇧🇷", dialCode: "+55", maxDigits: 11, minDigits: 10, placeholder: "11 91234 5678" },
  { code: "UY", name: "Uruguay", flag: "🇺🇾", dialCode: "+598", maxDigits: 9, minDigits: 8, placeholder: "099 123 456" },
  { code: "CL", name: "Chile", flag: "🇨🇱", dialCode: "+56", maxDigits: 9, minDigits: 9, placeholder: "9 1234 5678" },
  { code: "BO", name: "Bolivia", flag: "🇧🇴", dialCode: "+591", maxDigits: 8, minDigits: 8, placeholder: "7123 4567" },
  { code: "PE", name: "Perú", flag: "🇵🇪", dialCode: "+51", maxDigits: 9, minDigits: 9, placeholder: "912 345 678" },
  { code: "CO", name: "Colombia", flag: "🇨🇴", dialCode: "+57", maxDigits: 10, minDigits: 10, placeholder: "300 123 4567" },
  { code: "ES", name: "España", flag: "🇪🇸", dialCode: "+34", maxDigits: 9, minDigits: 9, placeholder: "612 345 678" },
  { code: "US", name: "Estados Unidos", flag: "🇺🇸", dialCode: "+1", maxDigits: 10, minDigits: 10, placeholder: "202 555 0123" },
  { code: "MX", name: "México", flag: "🇲🇽", dialCode: "+52", maxDigits: 10, minDigits: 10, placeholder: "55 1234 5678" },
  { code: "EC", name: "Ecuador", flag: "🇪🇨", dialCode: "+593", maxDigits: 9, minDigits: 9, placeholder: "99 123 4567" },
  { code: "VE", name: "Venezuela", flag: "🇻🇪", dialCode: "+58", maxDigits: 10, minDigits: 10, placeholder: "412 123 4567" },
  { code: "PA", name: "Panamá", flag: "🇵🇦", dialCode: "+507", maxDigits: 8, minDigits: 8, placeholder: "6123 4567" },
  { code: "CR", name: "Costa Rica", flag: "🇨🇷", dialCode: "+506", maxDigits: 8, minDigits: 8, placeholder: "8123 4567" },
  { code: "DO", name: "Rep. Dominicana", flag: "🇩🇴", dialCode: "+1", maxDigits: 10, minDigits: 10, placeholder: "809 123 4567" },
  { code: "GT", name: "Guatemala", flag: "🇬🇹", dialCode: "+502", maxDigits: 8, minDigits: 8, placeholder: "5123 4567" },
  { code: "HN", name: "Honduras", flag: "🇭🇳", dialCode: "+504", maxDigits: 8, minDigits: 8, placeholder: "9123 4567" },
  { code: "SV", name: "El Salvador", flag: "🇸🇻", dialCode: "+503", maxDigits: 8, minDigits: 8, placeholder: "7123 4567" },
  { code: "NI", name: "Nicaragua", flag: "🇳🇮", dialCode: "+505", maxDigits: 8, minDigits: 8, placeholder: "8123 4567" },
  { code: "CA", name: "Canadá", flag: "🇨🇦", dialCode: "+1", maxDigits: 10, minDigits: 10, placeholder: "416 123 4567" },
  { code: "IT", name: "Italia", flag: "🇮🇹", dialCode: "+39", maxDigits: 10, minDigits: 9, placeholder: "312 345 6789" },
  { code: "FR", name: "Francia", flag: "🇫🇷", dialCode: "+33", maxDigits: 9, minDigits: 9, placeholder: "6 12 34 56 78" },
  { code: "DE", name: "Alemania", flag: "🇩🇪", dialCode: "+49", maxDigits: 11, minDigits: 10, placeholder: "151 1234 5678" },
  { code: "GB", name: "Reino Unido", flag: "🇬🇧", dialCode: "+44", maxDigits: 10, minDigits: 10, placeholder: "7123 456789" },
  { code: "PT", name: "Portugal", flag: "🇵🇹", dialCode: "+351", maxDigits: 9, minDigits: 9, placeholder: "912 345 678" },
];
function formatPhoneInput(val: string, country: CountryOption): string {
  let digits = val.replace(/\D/g, "");
  if (!digits) return "";

  if (country.code === "PY") {
    if (digits.startsWith("595")) {
      digits = digits.slice(3);
    }
    if (digits.length > 10) {
      digits = digits.slice(0, 10);
    }
    if (digits.startsWith("0")) {
      if (digits.length <= 4) return digits;
      if (digits.length <= 7) return `${digits.slice(0, 4)} ${digits.slice(4)}`;
      return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
    } else {
      if (digits.length <= 3) return digits;
      if (digits.length <= 6) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
      return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
    }
  }

  if (digits.length > country.maxDigits) {
    digits = digits.slice(0, country.maxDigits);
  }
  return digits;
}

function validateRealPhone(val: string, country: CountryOption): boolean {
  const digits = val.replace(/\D/g, "");
  if (country.code === "PY") {
    let clean = digits;
    if (clean.startsWith("595")) clean = clean.slice(3);
    if (clean.startsWith("0")) clean = clean.slice(1);
    return clean.startsWith("9") && clean.length === 9;
  }
  return digits.length >= country.minDigits && digits.length <= country.maxDigits;
}


const MOBILE_STEPS = ["Cliente", "Servicio", "Día y hora", "Confirmar"];

// Settings ids (Configuración → Medios de pago) → appointment payment method
const PAYMENT_OPTIONS: { setting: string; method: PaymentMethod; label: string; Icon: typeof Banknote }[] = [
  { setting: "efectivo", method: "efectivo", label: "Efectivo", Icon: Banknote },
  { setting: "transferencia", method: "sipap", label: "Transferencia", Icon: Landmark },
  { setting: "pos", method: "pos_bancard", label: "Tarjeta (POS)", Icon: CreditCard },
  { setting: "billetera", method: "billetera_py", label: "Billetera", Icon: Smartphone },
];

const INPUT_CLASS =
  "min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-white/10 dark:bg-slate-800 dark:text-white sm:min-h-10 sm:text-sm";
const LABEL_CLASS = "mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300";
const CHIP_BASE = "inline-flex min-h-10 shrink-0 items-center justify-center gap-1.5 rounded-xl border px-3 text-xs font-semibold transition";
const CHIP_ON = "border-primary/50 bg-primary/10 text-primary";
const CHIP_OFF = "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-white/10 dark:bg-white/[0.03] dark:text-zinc-300 dark:hover:bg-white/[0.06]";

const toMinutes = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
};
const fromMinutes = (total: number) =>
  `${String(Math.floor(total / 60) % 24).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;

function SectionTitle({ n, title, description }: { n: number; title: string; description?: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-xs font-semibold text-primary">{n}</span>
      <div className="min-w-0">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-white sm:text-base">{title}</h2>
        {description && <p className="mt-0.5 text-xs text-slate-500 dark:text-zinc-400">{description}</p>}
      </div>
    </div>
  );
}

type Created = {
  clientName: string;
  clientPhone: string;
  serviceName: string;
  staffName: string;
  date: string;
  time: string;
  end: string;
};

function NuevaReservaContent() {
  const searchParams = useSearchParams();
  const services = useDashboardStore((s) => s.services);
  const staff = useDashboardStore((s) => s.staff);
  const clients = useDashboardStore((s) => s.clients);
  const business = useDashboardStore((s) => s.business);
  const isInitialSyncDone = useDashboardStore((s) => s.isInitialSyncDone);
  const addAppointment = useDashboardStore((s) => s.addAppointment);
  const pushToast = useDashboardStore((s) => s.pushToast);
  const isTourOpen = useDashboardStore((s) => s.isTourOpen);

  const tz = business.timezone || "America/Asuncion";
  const todayStr = formatInTimeZone(new Date(), tz, "yyyy-MM-dd");

  // Client
  const [clientName, setClientName] = useState(searchParams.get("clientName") ?? "");
  const [clientPhone, setClientPhone] = useState(searchParams.get("clientPhone") ?? "");
  const [clientId, setClientId] = useState<string | null>(null);
  const [countryCode, setCountryCode] = useState("PY");
  const [suggestOpen, setSuggestOpen] = useState(false);
  const [notes, setNotes] = useState("");

  // Service & schedule
  const activeServices = useMemo(() => services.filter((s) => s.active !== false), [services]);
  const [serviceId, setServiceId] = useState(activeServices[0]?.id ?? "");
  const currentService = activeServices.find((s) => s.id === serviceId) ?? activeServices[0];

  const eligibleStaff = useMemo(() => {
    const active = staff.filter((m) => m.active);
    const ids = currentService?.staffIds;
    return ids && ids.length > 0 ? active.filter((m) => ids.includes(m.id)) : active;
  }, [staff, currentService]);
  const [staffId, setStaffId] = useState(eligibleStaff[0]?.id ?? "");
  // Keep the professional valid when the service changes
  if (eligibleStaff.length > 0 && !eligibleStaff.some((m) => m.id === staffId)) {
    setStaffId(eligibleStaff[0].id);
  }
  const currentStaff = eligibleStaff.find((m) => m.id === staffId);

  const [date, setDate] = useState(todayStr);
  const [time, setTime] = useState("");
  const [customTime, setCustomTime] = useState(false);

  const acceptedPayments = useMemo(() => {
    const accepted = business.acceptedPaymentMethods;
    const list = PAYMENT_OPTIONS.filter((p) => !accepted || accepted.length === 0 || accepted.includes(p.setting));
    return list.length > 0 ? list : PAYMENT_OPTIONS.slice(0, 1);
  }, [business.acceptedPaymentMethods]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(acceptedPayments[0].method);

  // Clock for "this time already passed", refreshed every minute
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(id);
  }, []);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [created, setCreated] = useState<Created | null>(null);
  const [mobileStep, setMobileStep] = useState(0);

  // ── Real availability for the chosen service, day and professional ──
  const [slots, setSlots] = useState<{ start: string; staffIds: string[] }[]>([]);
  const [slotsState, setSlotsState] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [slotsVersion, setSlotsVersion] = useState(0);
  const shownServiceId = currentService?.id ?? "";
  const hasPersistedServiceId = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(shownServiceId);
  useEffect(() => {
    if (!isInitialSyncDone || !hasPersistedServiceId) return;
    let cancelled = false;
    queueMicrotask(() => !cancelled && setSlotsState("loading"));
    fetch(`/api/dashboard/availability?serviceId=${encodeURIComponent(shownServiceId)}&date=${date}`)
      .then((res) => res.json())
      .then((data: { ok: boolean; slots?: { start: string; staffIds: string[] }[] }) => {
        if (!data.ok || !data.slots) throw new Error("availability");
        const list = data.slots;
        if (cancelled) return;
        setSlots(list.map((s) => ({ start: s.start, staffIds: s.staffIds })));
        setSlotsState("ready");
      })
      .catch(() => {
        if (!cancelled) setSlotsState("error");
      });
    return () => {
      cancelled = true;
    };
  }, [shownServiceId, date, slotsVersion, isInitialSyncDone, hasPersistedServiceId]);

  const staffSlots = useMemo(
    () =>
      !isInitialSyncDone || !hasPersistedServiceId
        ? []
        : slots
        .filter((s) => !staffId || s.staffIds.includes(staffId))
        .map((s) => formatInTimeZone(new Date(s.start), tz, "HH:mm")),
    [slots, staffId, tz, isInitialSyncDone, hasPersistedServiceId]
  );

  // Drop a picked slot that no longer exists for this professional/day
  if (!customTime && time && slotsState === "ready" && !staffSlots.includes(time)) {
    setTime("");
  }

  const activeCountry = COUNTRY_LIST.find((c) => c.code === countryCode) ?? COUNTRY_LIST[0];
  const phoneValid = validateRealPhone(clientPhone, activeCountry);
  const nameValid = clientName.trim().length >= 2;
  const duration = currentService?.durationMin || 45;
  const endTime = time ? fromMinutes(toMinutes(time) + duration) : "";

  const startInstant = useMemo(() => (time ? fromZonedTime(`${date}T${time}:00`, tz) : null), [date, time, tz]);
  const isPast = startInstant ? startInstant.getTime() < now - 5 * 60_000 : false;

  const stepValid = [nameValid && phoneValid, Boolean(currentService && currentStaff), Boolean(time) && !isPast, true];
  const canSubmit = stepValid.every(Boolean);

  const matchingClients = useMemo(() => {
    const q = clientName.toLowerCase().trim();
    if (q.length < 2 || clientId) return [];
    return clients
      .filter((c) => c.name.toLowerCase().includes(q) || (c.phone && c.phone.replace(/\D/g, "").includes(q.replace(/\D/g, "") || "~")))
      .slice(0, 5);
  }, [clients, clientName, clientId]);

  const dayChips = useMemo(() => {
    const base = parseISO(`${todayStr}T12:00:00`);
    return Array.from({ length: 7 }, (_, i) => {
      const d = addDays(base, i);
      const iso = format(d, "yyyy-MM-dd");
      const label = i === 0 ? "Hoy" : i === 1 ? "Mañana" : format(d, "EEE d", { locale: es });
      return { iso, label };
    });
  }, [todayStr]);

  const dateTitle = format(parseISO(`${date}T12:00:00`), "EEEE d 'de' MMMM", { locale: es });

  function fullPhone() {
    const digits = clientPhone.replace(/\D/g, "");
    if (activeCountry.code === "PY") {
      let core = digits.startsWith("595") ? digits.slice(3) : digits;
      if (core.startsWith("0")) core = core.slice(1);
      return `+595${core}`;
    }
    return `${activeCountry.dialCode}${digits}`;
  }

  function pickClient(c: (typeof clients)[number]) {
    setClientName(c.name);
    setClientId(c.id);
    setSuggestOpen(false);
    const digits = (c.phone || "").replace(/\D/g, "");
    if (digits.startsWith("595")) {
      setCountryCode("PY");
      setClientPhone(formatPhoneInput(`0${digits.slice(3)}`, COUNTRY_LIST[0]));
    } else {
      setClientPhone(c.phone || "");
    }
  }

  function goNext() {
    if (!stepValid[mobileStep]) {
      pushToast("error", mobileStep === 0 ? "Completá nombre y un WhatsApp válido." : mobileStep === 2 ? "Elegí un horario disponible." : "Completá este paso.");
      return;
    }
    triggerHaptic("selection");
    setMobileStep((s) => Math.min(MOBILE_STEPS.length - 1, s + 1));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isTourOpen && typeof window !== "undefined" && window.innerWidth < 1024 && mobileStep < MOBILE_STEPS.length - 1) {
      goNext();
      return;
    }
    if (!nameValid) return pushToast("error", "Ingresá el nombre del cliente.");
    if (!phoneValid) return pushToast("error", "Revisá el número de WhatsApp.");
    if (!currentService || !currentStaff) return pushToast("error", "Elegí un servicio y un profesional.");
    if (!time || !startInstant) return pushToast("error", "Elegí un horario.");
    if (isPast) return pushToast("error", "Ese horario ya pasó. Elegí otro.");

    setIsSubmitting(true);
    const phone = fullPhone();
    const end = new Date(startInstant.getTime() + duration * 60_000);
    const id = await addAppointment({
      id: `ap-${crypto.randomUUID()}`,
      clientId: clientId ?? undefined,
      clientName: clientName.trim(),
      clientEmail: "",
      clientPhone: phone,
      serviceId: currentService.id,
      staffId: currentStaff.id,
      start: startInstant.toISOString(),
      end: end.toISOString(),
      paymentMethod,
      status: "confirmed",
      notes: notes.trim() || undefined,
    });
    setIsSubmitting(false);

    // The store already shows the server's reason (slot taken, blocked, offline…)
    if (!id) return;

    setSlotsVersion((v) => v + 1);
    triggerHaptic("success");
    setCreated({
      clientName: clientName.trim(),
      clientPhone: phone,
      serviceName: currentService.name,
      staffName: currentStaff.name,
      date,
      time,
      end: endTime,
    });
    pushToast("success", `Turno de ${clientName.trim()} agendado.`);
  }

  function resetForm() {
    setCreated(null);
    setClientName("");
    setClientPhone("");
    setClientId(null);
    setNotes("");
    setTime("");
    setCustomTime(false);
    setMobileStep(0);
  }

  const waUrl = useMemo(() => {
    if (!created) return "#";
    const when = format(parseISO(`${created.date}T12:00:00`), "EEEE d 'de' MMMM", { locale: es });
    const msg = `¡Hola ${created.clientName}! Tu turno para *${created.serviceName}* con *${created.staffName}* en *${business.name}* quedó agendado para el *${when} a las ${created.time} hs*.${business.address ? `\n\n📍 ${business.address}` : ""}\n¡Te esperamos!`;
    return `https://wa.me/${created.clientPhone.replace(/\D/g, "")}?text=${encodeURIComponent(msg)}`;
  }, [created, business.name, business.address]);

  const calendarUrl = useMemo(() => {
    if (!created) return "#";
    const d = created.date.replace(/-/g, "");
    const start = `${d}T${created.time.replace(":", "")}00`;
    const end = `${d}T${created.end.replace(":", "")}00`;
    const params = new URLSearchParams({
      action: "TEMPLATE",
      text: `${created.serviceName} - ${business.name}`,
      dates: `${start}/${end}`,
      ctz: tz,
      details: `Turno con ${created.staffName}.`,
      location: business.address || "",
    });
    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  }, [created, business.name, business.address, tz]);

  const stepHidden = (i: number) => (!isTourOpen && mobileStep !== i ? "max-lg:hidden" : "");
  const price = currentService ? (currentService.hasPromo && currentService.promoPrice ? currentService.promoPrice : currentService.price) : 0;

  return (
    <div className="mx-auto w-full max-w-6xl space-y-5 pb-28 sm:space-y-6 lg:pb-12">
      {/* ═══ HEADER ═══ */}
      <header data-tour="nueva-reserva-header" className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">Agenda</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-3xl">Nuevo turno</h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-500 dark:text-zinc-400">
            Agendá un turno para un cliente que te escribió o llamó. Solo se muestran horarios libres.
          </p>
        </div>
        <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto">
          <Link
            href="/dashboard/calendario"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-white/10 glass-panel-subtle px-3.5 text-xs font-semibold text-slate-700 transition hover:bg-white/10 dark:text-zinc-200"
          >
            <Calendar className="h-4 w-4 text-slate-400" />
            Ver agenda
          </Link>
          <Link
            href="/dashboard/bloquear-horario"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-white/10 glass-panel-subtle px-3.5 text-xs font-semibold text-slate-700 transition hover:bg-white/10 dark:text-zinc-200"
          >
            <Ban className="h-4 w-4 text-amber-500" />
            Bloquear horario
          </Link>
        </div>
      </header>

      {created ? (
        /* ═══ CONFIRMATION ═══ */
        <section className="mx-auto max-w-xl rounded-3xl glass-panel p-5 text-center sm:p-6">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-7 w-7" />
          </span>
          <h2 className="mt-3 text-xl font-semibold text-slate-900 dark:text-white">Turno agendado</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">Ya aparece en la agenda. Avisale al cliente por WhatsApp.</p>

          <dl className="mt-5 divide-y divide-slate-200/70 rounded-2xl border border-slate-200/70 text-left text-sm dark:divide-white/[0.06] dark:border-white/10">
            {[
              ["Cliente", created.clientName],
              ["Servicio", created.serviceName],
              ["Profesional", created.staffName],
              ["Cuándo", `${format(parseISO(`${created.date}T12:00:00`), "EEE d 'de' MMM", { locale: es })} · ${created.time} a ${created.end} hs`],
            ].map(([k, v]) => (
              <div key={k} className="flex items-center justify-between gap-3 px-3.5 py-2.5">
                <dt className="text-xs text-slate-500 dark:text-zinc-400">{k}</dt>
                <dd className="truncate text-right font-semibold text-slate-900 dark:text-white">{v}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-5 grid gap-2 sm:grid-cols-2">
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 text-sm font-semibold text-white transition hover:bg-emerald-500"
            >
              <MessageCircle className="h-4 w-4" />
              Avisar por WhatsApp
            </a>
            <a
              href={calendarUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-slate-200 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-white/10 dark:text-zinc-200 dark:hover:bg-white/[0.06]"
            >
              <Calendar className="h-4 w-4 text-primary" />
              Google Calendar
            </a>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2 border-t border-slate-200/70 pt-4 dark:border-white/10">
            <button
              type="button"
              onClick={resetForm}
              className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-2xl bg-primary px-4 text-sm font-semibold text-white transition hover:brightness-110"
            >
              <CalendarPlus className="h-4 w-4" />
              Agendar otro
            </button>
            <Link
              href="/dashboard/calendario"
              className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-slate-200 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-white/10 dark:text-zinc-200 dark:hover:bg-white/[0.06]"
            >
              Ver en la agenda
            </Link>
          </div>
        </section>
      ) : activeServices.length === 0 || staff.filter((m) => m.active).length === 0 ? (
        <section className="rounded-3xl glass-panel px-5 py-12 text-center">
          <AlertCircle className="mx-auto h-8 w-8 text-amber-500" />
          <h2 className="mt-3 text-base font-semibold text-slate-900 dark:text-white">
            {activeServices.length === 0 ? "Todavía no tenés servicios activos" : "No hay profesionales activos"}
          </h2>
          <p className="mx-auto mt-1 max-w-sm text-sm text-slate-500 dark:text-zinc-400">
            Para agendar un turno necesitás al menos un servicio y un profesional.
          </p>
          <Link
            href={activeServices.length === 0 ? "/dashboard/servicios" : "/dashboard/equipo"}
            className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-2xl bg-primary px-4 text-sm font-semibold text-white"
          >
            {activeServices.length === 0 ? "Crear un servicio" : "Ir a Equipo"}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </section>
      ) : (
        <form onSubmit={handleSubmit} className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="min-w-0 space-y-4">
            {/* Mobile progress */}
            {!isTourOpen && (
              <div className="space-y-2 lg:hidden">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-900 dark:text-white">{MOBILE_STEPS[mobileStep]}</span>
                  <span className="text-slate-400">Paso {mobileStep + 1} de {MOBILE_STEPS.length}</span>
                </div>
                <div className="flex gap-1.5">
                  {MOBILE_STEPS.map((label, i) => (
                    <button
                      key={label}
                      type="button"
                      aria-label={`Ir a ${label}`}
                      onClick={() => i < mobileStep && setMobileStep(i)}
                      className={`h-1.5 flex-1 rounded-full transition-colors ${i <= mobileStep ? "bg-primary" : "bg-slate-200 dark:bg-white/10"}`}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* ═══ 1. CLIENT ═══ */}
            <section data-tour="nueva-reserva-client" className={`${stepHidden(0)} space-y-4 rounded-3xl glass-panel p-4 sm:p-5`}>
              <SectionTitle n={1} title="Cliente" description="Buscá un cliente existente o cargá uno nuevo." />
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="relative">
                  <label htmlFor="nr-name" className={LABEL_CLASS}>Nombre y apellido</label>
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      id="nr-name"
                      type="text"
                      autoComplete="off"
                      value={clientName}
                      onChange={(e) => {
                        setClientName(e.target.value);
                        setClientId(null);
                        setSuggestOpen(true);
                      }}
                      onFocus={() => setSuggestOpen(true)}
                      onBlur={() => setTimeout(() => setSuggestOpen(false), 150)}
                      placeholder="Ej: Juan Pérez"
                      className={`${INPUT_CLASS} pl-10`}
                    />
                  </div>
                  {clientId && (
                    <p className="mt-1 flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400">
                      <UserCheck className="h-3 w-3" />
                      Cliente existente
                    </p>
                  )}
                  {suggestOpen && matchingClients.length > 0 && (
                    <ul className="absolute inset-x-0 top-full z-30 mt-1 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-white/10 dark:bg-slate-900">
                      {matchingClients.map((c) => (
                        <li key={c.id}>
                          <button
                            type="button"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => pickClient(c)}
                            className="flex min-h-11 w-full items-center justify-between gap-3 px-3.5 py-2 text-left transition hover:bg-slate-50 dark:hover:bg-white/[0.05]"
                          >
                            <span className="min-w-0">
                              <span className="block truncate text-sm font-semibold text-slate-900 dark:text-white">{c.name}</span>
                              <span className="block truncate text-[11px] text-slate-500 dark:text-zinc-400">{c.phone || "Sin teléfono"}</span>
                            </span>
                            <span className="shrink-0 text-[11px] tabular-nums text-slate-400">{c.totalVisits} visitas</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div>
                  <label htmlFor="nr-phone" className={LABEL_CLASS}>WhatsApp</label>
                  <div className="flex gap-2">
                    <CustomSelect
                      value={countryCode}
                      onChange={(v) => {
                        setCountryCode(v);
                        setClientPhone("");
                      }}
                      options={COUNTRY_LIST.map((c) => ({ value: c.code, label: `${c.flag} ${c.dialCode}`, subtitle: c.name }))}
                      className="w-[7.5rem] shrink-0"
                      buttonClassName="min-h-11 w-full sm:min-h-10"
                    />
                    <input
                      id="nr-phone"
                      type="tel"
                      inputMode="tel"
                      value={clientPhone}
                      onChange={(e) => {
                        setClientPhone(formatPhoneInput(e.target.value, activeCountry));
                        setClientId(null);
                      }}
                      placeholder={activeCountry.placeholder}
                      className={`${INPUT_CLASS} min-w-0 flex-1`}
                    />
                  </div>
                  {clientPhone && !phoneValid && (
                    <p className="mt-1 flex items-center gap-1.5 text-[11px] text-amber-600 dark:text-amber-400">
                      <AlertCircle className="h-3 w-3" />
                      Revisá el número (ej: {activeCountry.placeholder})
                    </p>
                  )}
                </div>
              </div>
            </section>

            {/* ═══ 2. SERVICE & PROFESSIONAL ═══ */}
            <section data-tour="nueva-reserva-service" className={`${stepHidden(1)} space-y-4 rounded-3xl glass-panel p-4 sm:p-5`}>
              <SectionTitle n={2} title="Servicio y profesional" />
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <span className={LABEL_CLASS}>Servicio</span>
                  <CustomSelect
                    value={currentService?.id}
                    onChange={(v) => {
                      setServiceId(v);
                      triggerHaptic("selection");
                    }}
                    options={activeServices.map((s) => ({
                      value: s.id,
                      label: s.name,
                      subtitle: `${s.durationMin} min · ${formatGs(s.hasPromo && s.promoPrice ? s.promoPrice : s.price)}`,
                    }))}
                    className="w-full"
                    buttonClassName="min-h-11 w-full sm:min-h-10"
                  />
                </div>
                <div>
                  <span className={LABEL_CLASS}>Profesional</span>
                  <CustomSelect
                    value={currentStaff?.id}
                    onChange={(v) => {
                      setStaffId(v);
                      triggerHaptic("selection");
                    }}
                    options={eligibleStaff.map((m) => ({ value: m.id, label: m.name, subtitle: m.role }))}
                    className="w-full"
                    buttonClassName="min-h-11 w-full sm:min-h-10"
                  />
                  {eligibleStaff.length === 0 && (
                    <p className="mt-1 text-[11px] text-amber-600 dark:text-amber-400">Nadie del equipo tiene asignado este servicio.</p>
                  )}
                </div>
              </div>
            </section>

            {/* ═══ 3. DAY & TIME ═══ */}
            <section data-tour="nueva-reserva-datetime" className={`${stepHidden(2)} space-y-4 rounded-3xl glass-panel p-4 sm:p-5`}>
              <SectionTitle n={3} title="Día y horario" description={`${dateTitle.charAt(0).toUpperCase()}${dateTitle.slice(1)}`} />

              <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {dayChips.map((d) => (
                  <button
                    key={d.iso}
                    type="button"
                    aria-pressed={date === d.iso}
                    onClick={() => setDate(d.iso)}
                    className={`${CHIP_BASE} capitalize ${date === d.iso ? CHIP_ON : CHIP_OFF}`}
                  >
                    {d.label}
                  </button>
                ))}
                <label className={`${CHIP_BASE} relative ${!dayChips.some((d) => d.iso === date) ? CHIP_ON : CHIP_OFF}`}>
                  <Calendar className="h-3.5 w-3.5" />
                  Otra fecha
                  <input
                    type="date"
                    min={todayStr}
                    value={date}
                    onChange={(e) => e.target.value && setDate(e.target.value)}
                    className="absolute inset-0 cursor-pointer opacity-0"
                    aria-label="Elegir otra fecha"
                  />
                </label>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Horarios libres{currentStaff ? ` de ${currentStaff.name.split(" ")[0]}` : ""}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setCustomTime((v) => !v);
                      setTime("");
                    }}
                    className="text-xs font-semibold text-primary hover:underline"
                  >
                    {customTime ? "Ver horarios libres" : "Otro horario"}
                  </button>
                </div>

                {customTime ? (
                  <div className="max-w-[12rem]">
                    <input
                      type="time"
                      step={300}
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className={`${INPUT_CLASS} tabular-nums`}
                      aria-label="Hora del turno"
                    />
                    <p className="mt-1 text-[11px] text-slate-500 dark:text-zinc-400">Si el profesional ya tiene un turno a esa hora, te avisamos al guardar.</p>
                  </div>
                ) : !isInitialSyncDone || (hasPersistedServiceId && (slotsState === "loading" || slotsState === "idle")) ? (
                  <p className="flex items-center gap-2 py-3 text-xs text-slate-500 dark:text-zinc-400">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Buscando horarios libres…
                  </p>
                ) : slotsState === "error" ? (
                  <p className="rounded-xl border border-amber-500/25 bg-amber-500/[0.07] px-3 py-2.5 text-xs text-amber-700 dark:text-amber-300">
                    No pudimos cargar los horarios. Usá “Otro horario” para cargarlo a mano.
                  </p>
                ) : staffSlots.length === 0 ? (
                  <p className="rounded-xl border border-slate-200/70 px-3 py-3 text-xs text-slate-500 dark:border-white/10 dark:text-zinc-400">
                    No quedan horarios libres este día. Probá otro día, otro profesional u “Otro horario”.
                  </p>
                ) : (
                  <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
                    {staffSlots.map((t) => (
                      <button
                        key={t}
                        type="button"
                        aria-pressed={time === t}
                        onClick={() => {
                          setTime(t);
                          triggerHaptic("selection");
                        }}
                        className={`${CHIP_BASE} tabular-nums ${time === t ? "border-primary bg-primary text-white" : CHIP_OFF}`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                )}
                {isPast && (
                  <p className="mt-2 flex items-center gap-1.5 text-[11px] text-rose-600 dark:text-rose-400">
                    <AlertCircle className="h-3 w-3" />
                    Ese horario ya pasó.
                  </p>
                )}
              </div>
            </section>

            {/* ═══ 4. PAYMENT & NOTES ═══ */}
            <section data-tour="nueva-reserva-payment" className={`${stepHidden(3)} space-y-4 rounded-3xl glass-panel p-4 sm:p-5`}>
              <SectionTitle n={4} title="Pago y notas" description="Cómo piensa pagar el cliente. Se cobra en Caja al terminar." />
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {acceptedPayments.map(({ method, label, Icon }) => (
                  <button
                    key={method}
                    type="button"
                    aria-pressed={paymentMethod === method}
                    onClick={() => setPaymentMethod(method)}
                    className={`${CHIP_BASE} min-h-11 ${paymentMethod === method ? CHIP_ON : CHIP_OFF}`}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </button>
                ))}
              </div>
              <div>
                <label htmlFor="nr-notes" className={LABEL_CLASS}>Notas (opcional)</label>
                <textarea
                  id="nr-notes"
                  rows={2}
                  maxLength={300}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ej: prefiere tijera, viene con su hijo…"
                  className={`${INPUT_CLASS} resize-none`}
                />
              </div>
            </section>
          </div>

          {/* ═══ SUMMARY (sticky on desktop, last step on mobile) ═══ */}
          <aside
            data-tour="nueva-reserva-confirm"
            className={`${stepHidden(3)} min-w-0 space-y-4 rounded-3xl glass-panel p-4 sm:p-5 lg:sticky lg:top-[100px]`}
          >
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white sm:text-base">Resumen</h2>
              <span className="text-base font-semibold tabular-nums text-slate-900 dark:text-white">{formatGs(price)}</span>
            </div>
            <dl className="space-y-2.5 text-sm">
              {[
                { k: "Cliente", v: clientName.trim() || "—", ok: nameValid && phoneValid },
                { k: "Servicio", v: currentService ? `${currentService.name} · ${duration} min` : "—", ok: Boolean(currentService) },
                { k: "Profesional", v: currentStaff?.name || "—", ok: Boolean(currentStaff) },
                {
                  k: "Cuándo",
                  v: time ? `${format(parseISO(`${date}T12:00:00`), "EEE d MMM", { locale: es })} · ${time} a ${endTime}` : "Elegí un horario",
                  ok: Boolean(time) && !isPast,
                },
              ].map((row) => (
                <div key={row.k} className="flex items-start gap-2.5">
                  <span
                    className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${
                      row.ok ? "bg-emerald-500 text-white" : "border border-slate-300 dark:border-white/20"
                    }`}
                  >
                    {row.ok && <Check className="h-2.5 w-2.5" strokeWidth={3} />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <dt className="text-[11px] text-slate-500 dark:text-zinc-400">{row.k}</dt>
                    <dd className={`truncate font-medium ${row.ok ? "text-slate-900 dark:text-white" : "text-slate-400"}`}>{row.v}</dd>
                  </span>
                </div>
              ))}
            </dl>
            <button
              type="submit"
              disabled={!canSubmit || isSubmitting}
              className="hidden min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 text-sm font-semibold text-white shadow-sm transition hover:brightness-110 disabled:opacity-50 lg:inline-flex"
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              Agendar turno
            </button>
            <p className="flex items-start gap-2 text-[11px] text-slate-500 dark:text-zinc-400">
              <Clock className="mt-px h-3.5 w-3.5 shrink-0" />
              Después de agendar podés avisarle al cliente por WhatsApp con un mensaje listo.
            </p>
          </aside>

            {/* Mobile navigation */}
            {!isTourOpen && (
              <div className="flex gap-2 lg:hidden">
                {mobileStep > 0 && (
                  <button
                    type="button"
                    onClick={() => setMobileStep((s) => s - 1)}
                    className="inline-flex min-h-12 items-center justify-center gap-1.5 rounded-2xl border border-slate-200 px-4 text-sm font-semibold text-slate-700 dark:border-white/10 dark:text-zinc-200"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Atrás
                  </button>
                )}
                <button
                  type="submit"
                  disabled={isSubmitting || (mobileStep === MOBILE_STEPS.length - 1 && !canSubmit)}
                  className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-2xl bg-primary px-4 text-sm font-semibold text-white shadow-sm transition disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : mobileStep === MOBILE_STEPS.length - 1 ? (
                    <Check className="h-4 w-4" />
                  ) : null}
                  {mobileStep === MOBILE_STEPS.length - 1 ? "Agendar turno" : "Continuar"}
                  {mobileStep < MOBILE_STEPS.length - 1 && <ArrowRight className="h-4 w-4" />}
                </button>
              </div>
            )}
        </form>
      )}
    </div>
  );
}

export default function NuevaReservaPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center gap-2 py-24 text-sm text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          Cargando…
        </div>
      }
    >
      <NuevaReservaContent />
    </Suspense>
  );
}
