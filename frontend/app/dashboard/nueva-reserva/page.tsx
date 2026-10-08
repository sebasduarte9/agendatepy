"use client";

import { useMemo, useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Search,
  Scissors,
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  CheckCircle2,
  CalendarPlus,
  Bell,
  MessageCircle,
  ExternalLink,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Landmark,
  CreditCard,
  Banknote,
  Smartphone,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Check,
  AlertCircle,
  Ban,
  CalendarDays,
} from "lucide-react";
import { format, parseISO, addMinutes } from "date-fns";
import { es } from "date-fns/locale";
import { formatInTimeZone } from "date-fns-tz";
import { useDashboardStore } from "@/store/useDashboardStore";
import Card from "@/components/dashboard/ui/Card";
import { formatGs } from "@/lib/dashboard-dates";
import type { PaymentMethod } from "@/lib/dashboard-types";

export interface CountryOption {
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

const APPOINTMENT_TIME_SLOTS = [
  "08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30",
  "16:00", "16:30", "17:00", "17:30", "18:00", "18:30", "19:00", "19:30",
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

function NuevaReservaContent() {
  const searchParams = useSearchParams();
  const services = useDashboardStore((s) => s.services);
  const staff = useDashboardStore((s) => s.staff);
  const clients = useDashboardStore((s) => s.clients);
  const business = useDashboardStore((s) => s.business);
  const addAppointment = useDashboardStore((s) => s.addAppointment);
  const addBlock = useDashboardStore((s) => s.addBlock);
  const pushToast = useDashboardStore((s) => s.pushToast);

  const tz = business.timezone || "America/Asuncion";
  const todayStr = useMemo(() => formatInTimeZone(new Date(), tz, "yyyy-MM-dd"), [tz]);

  // Mode switcher: "appointment" vs "block"
  const [mode, setMode] = useState<"appointment" | "block">("appointment");

  // Client info state
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientNotes, setClientNotes] = useState("");
  const [selectedCountryCode, setSelectedCountryCode] = useState("PY");
  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);
  const [countrySearchQuery, setCountrySearchQuery] = useState("");

  // Appointment configuration state
  const [serviceId, setServiceId] = useState(services[0]?.id || "");
  const [staffId, setStaffId] = useState(staff[0]?.id || "");
  const [date, setDate] = useState(todayStr);
  const [time, setTime] = useState("10:00");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("efectivo");

  // Dropdown states
  const [serviceDropdownOpen, setServiceDropdownOpen] = useState(false);
  const [staffDropdownOpen, setStaffDropdownOpen] = useState(false);
  const [timeDropdownOpen, setTimeDropdownOpen] = useState(false);

  // Submitting state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdAppointment, setCreatedAppointment] = useState<{
    clientName: string;
    clientPhone: string;
    serviceName: string;
    staffName: string;
    date: string;
    time: string;
    end: string;
  } | null>(null);

  // Block state
  const [blockStaffId, setBlockStaffId] = useState<string>("all");
  const [blockStart, setBlockStart] = useState("13:00");
  const [blockEnd, setBlockEnd] = useState("14:00");
  const [blockReason, setBlockReason] = useState("Almuerzo / Descanso");

  // Read URL query params (e.g. from CRM)
  useEffect(() => {
    const qName = searchParams.get("clientName");
    const qPhone = searchParams.get("clientPhone");
    if (qName) setClientName(qName);
    if (qPhone) setClientPhone(qPhone);
  }, [searchParams]);

  const activeCountry = useMemo(() => {
    return COUNTRY_LIST.find((c) => c.code === selectedCountryCode) || COUNTRY_LIST[0];
  }, [selectedCountryCode]);

  const filteredCountries = useMemo(() => {
    if (!countrySearchQuery.trim()) return COUNTRY_LIST;
    const q = countrySearchQuery.toLowerCase().trim();
    return COUNTRY_LIST.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.dialCode.includes(q) ||
        c.code.toLowerCase().includes(q)
    );
  }, [countrySearchQuery]);

  const isPhoneValid = useMemo(() => {
    return validateRealPhone(clientPhone, activeCountry);
  }, [clientPhone, activeCountry]);

  // Client autocomplete matches
  const matchingClients = useMemo(() => {
    if (!clientName.trim() || clientName.trim().length < 2) return [];
    const q = clientName.toLowerCase().trim();
    return clients.filter(
      (c) => c.name.toLowerCase().includes(q) || (c.phone && c.phone.includes(q))
    ).slice(0, 5);
  }, [clients, clientName]);

  const currentService = useMemo(() => {
    return services.find((s) => s.id === serviceId) || services[0];
  }, [services, serviceId]);

  const currentStaff = useMemo(() => {
    return staff.find((s) => s.id === staffId) || staff[0];
  }, [staff, staffId]);

  // Calculated End Time based on Service Duration
  const appointmentEndTime = useMemo(() => {
    if (!time || !currentService) return "10:45";
    try {
      const [h, m] = time.split(":").map(Number);
      const startMinutes = h * 60 + m;
      const endMinutes = startMinutes + (currentService.durationMin || 45);
      const endH = String(Math.floor(endMinutes / 60)).padStart(2, "0");
      const endM = String(endMinutes % 60).padStart(2, "0");
      return `${endH}:${endM}`;
    } catch {
      return "10:45";
    }
  }, [time, currentService]);

  // Steppers for Date & Time
  function stepDate(days: number) {
    const d = parseISO(`${date}T12:00:00`);
    const next = addMinutes(d, days * 24 * 60);
    setDate(format(next, "yyyy-MM-dd"));
  }

  function stepTime(currentTime: string, minutes: number): string {
    const [h, m] = currentTime.split(":").map(Number);
    let total = h * 60 + m + minutes;
    if (total < 8 * 60) total = 8 * 60;
    if (total > 20 * 60) total = 20 * 60;
    const nextH = String(Math.floor(total / 60)).padStart(2, "0");
    const nextM = String(total % 60).padStart(2, "0");
    return `${nextH}:${nextM}`;
  }

  const formattedDateTitle = useMemo(() => {
    try {
      const parsed = parseISO(`${date}T12:00:00`);
      return format(parsed, "EEEE d 'de' MMMM", { locale: es });
    } catch {
      return date;
    }
  }, [date]);

  // Handle appointment creation and SQL sync
  async function handleCreateAppointment(e: React.FormEvent) {
    e.preventDefault();
    if (!clientName.trim()) {
      pushToast("error", "Ingresá el nombre del cliente.");
      return;
    }
    if (!serviceId) {
      pushToast("error", "Seleccioná un servicio para el turno.");
      return;
    }

    setIsSubmitting(true);
    try {
      const service = currentService;
      const duration = service?.durationMin || 45;
      const startDateTime = parseISO(`${date}T${time}:00`);
      const endDateTime = addMinutes(startDateTime, duration);

      // Clean standardized phone with dial code
      let formattedFullPhone = clientPhone.trim();
      if (formattedFullPhone) {
        const digits = formattedFullPhone.replace(/\D/g, "");
        if (activeCountry.code === "PY") {
          let core = digits;
          if (core.startsWith("595")) core = core.slice(3);
          if (core.startsWith("0")) core = core.slice(1);
          formattedFullPhone = `+595${core}`;
        } else if (!formattedFullPhone.startsWith("+")) {
          formattedFullPhone = `${activeCountry.dialCode}${digits}`;
        }
      }

      await addAppointment({
        id: `ap-${Date.now()}`,
        clientName: clientName.trim(),
        clientEmail: clientEmail.trim() || `${clientName.toLowerCase().replace(/\s+/g, ".")}@cliente.py`,
        clientPhone: formattedFullPhone || "+595981000000",
        serviceId: service?.id || "",
        staffId: staffId || staff[0]?.id || "",
        start: startDateTime.toISOString(),
        end: endDateTime.toISOString(),
        paymentMethod,
        status: "confirmed",
        notes: clientNotes.trim() || "Reserva manual desde Dashboard",
      });

      setCreatedAppointment({
        clientName: clientName.trim(),
        clientPhone: formattedFullPhone || clientPhone,
        serviceName: service?.name || "Servicio",
        staffName: currentStaff?.name || "Equipo",
        date,
        time,
        end: appointmentEndTime,
      });

      pushToast("success", `¡Turno para ${clientName} guardado en base de datos!`);
    } catch (err) {
      console.error("Error creating appointment:", err);
      pushToast("error", "Error al guardar turno en base de datos.");
    } finally {
      setIsSubmitting(false);
    }
  }

  // Handle schedule block creation
  function handleCreateBlock(e: React.FormEvent) {
    e.preventDefault();
    addBlock({
      staffId: blockStaffId,
      date,
      start: blockStart,
      end: blockEnd,
      reason: blockReason.trim() || "Bloqueo operativo",
    });

    pushToast("success", "Bloqueo horario guardado en la agenda.");
    setMode("appointment");
  }

  // WhatsApp reminder URL for created appointment
  const waReminderUrl = useMemo(() => {
    if (!createdAppointment) return "#";
    const phoneClean = createdAppointment.clientPhone.replace(/[^0-9]/g, "");
    const msg = encodeURIComponent(
      `¡Hola ${createdAppointment.clientName}! Tu turno para *${createdAppointment.serviceName}* con *${createdAppointment.staffName}* en *${business.name}* quedó agendado para el *${createdAppointment.date} a las ${createdAppointment.time} hs*.\n\n📍 Ubicación: ${business.address || "Asunción"}\n¡Te esperamos!`
    );
    return `https://wa.me/${phoneClean}?text=${msg}`;
  }, [createdAppointment, business]);

  // Google Calendar export link for created appointment
  const googleCalUrl = useMemo(() => {
    if (!createdAppointment) return "#";
    const [hh, mm] = createdAppointment.time.split(":");
    const startStr = `${createdAppointment.date.replace(/-/g, "")}T${hh}${mm}00`;
    const [endH, endM] = createdAppointment.end.split(":");
    const endStr = `${createdAppointment.date.replace(/-/g, "")}T${endH}${endM}00`;
    const title = encodeURIComponent(`${createdAppointment.serviceName} - ${business.name}`);
    const details = encodeURIComponent(
      `Turno agendado con ${createdAppointment.staffName}.\nCliente: ${createdAppointment.clientName}\nTeléfono: ${createdAppointment.clientPhone}`
    );
    const location = encodeURIComponent(business.address || "Asunción, Paraguay");
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startStr}/${endStr}&details=${details}&location=${location}`;
  }, [createdAppointment, business]);

  const activeStaffPct = Math.round((staff.filter((s) => s.active).length / Math.max(1, staff.length)) * 100);
  const durationPct = Math.min(100, Math.round(((currentService?.durationMin || 45) / 90) * 100));

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* ═══ NATIVE PAGE HEADER ═══ */}
      <div
        data-tour="nueva-reserva-header"
        className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between py-1"
      >
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Agendar Turno Rápido
        </h1>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/dashboard/calendario"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition"
          >
            <Calendar className="h-3.5 w-3.5 text-slate-400" />
            <span>Ver Agenda</span>
          </Link>

          <Link
            href="/dashboard/clientes"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition"
          >
            <User className="h-3.5 w-3.5 text-slate-400" />
            <span>Clientes</span>
          </Link>

          <button
            type="button"
            onClick={() => setMode(mode === "appointment" ? "block" : "appointment")}
            className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition cursor-pointer ${
              mode === "block"
                ? "bg-amber-600 hover:bg-amber-500 text-white shadow-md"
                : "border border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 shadow-xs hover:bg-slate-50 dark:hover:bg-slate-800"
            }`}
          >
            <Ban className="h-3.5 w-3.5" />
            <span>{mode === "block" ? "Volver a Turno" : "Bloquear Horario"}</span>
          </button>
        </div>
      </div>

      {/* ═══ APPLE INSET TELEMETRY & INTELLIGENCE CONTAINER (DESKTOP) ═══ */}
      <div className="hidden md:block rounded-[28px] bg-slate-100/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 p-4 sm:p-5 shadow-xs space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Card 1: Capacidad Operativa & Especialistas */}
          <div className="rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/70 dark:border-slate-700/60 p-5 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700/60">
              <div className="flex items-center gap-2.5">
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-xl text-white font-bold"
                  style={{ backgroundColor: business.primaryColor || "var(--primary, #FF4F2B)" }}
                >
                  <CalendarPlus className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                    Capacidad & Especialistas
                  </h3>
                </div>
              </div>

              <span className="text-xs font-mono font-bold text-slate-400">
                {date}
              </span>
            </div>

            {/* Circular Gauges */}
            <div className="py-4 grid grid-cols-2 gap-4">
              {/* Gauge 1: Staff Availability */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-800">
                <div className="relative h-12 w-12 shrink-0 flex items-center justify-center">
                  <svg className="h-12 w-12 -rotate-90" viewBox="0 0 44 44">
                    <circle
                      cx="22"
                      cy="22"
                      r="18"
                      className="stroke-slate-200 dark:stroke-slate-700"
                      strokeWidth="4"
                      fill="none"
                    />
                    <circle
                      cx="22"
                      cy="22"
                      r="18"
                      stroke={business.primaryColor || "var(--primary, #FF4F2B)"}
                      strokeWidth="4"
                      fill="none"
                      strokeDasharray={113}
                      strokeDashoffset={113 - (113 * Math.min(100, Math.max(0, activeStaffPct))) / 100}
                      strokeLinecap="round"
                      className="transition-all duration-700"
                    />
                  </svg>
                  <span className="absolute text-[10px] font-black text-slate-800 dark:text-white font-mono">
                    {activeStaffPct}%
                  </span>
                </div>
                <div className="min-w-0">
                  <span className="text-[11px] font-bold text-slate-900 dark:text-white block truncate">
                    Equipo Activo
                  </span>
                  <span className="text-[10px] text-slate-400 block truncate">
                    {staff.filter((s) => s.active).length} de {staff.length} disponibles
                  </span>
                </div>
              </div>

              {/* Gauge 2: Service Duration */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-800">
                <div className="relative h-12 w-12 shrink-0 flex items-center justify-center">
                  <svg className="h-12 w-12 -rotate-90" viewBox="0 0 44 44">
                    <circle
                      cx="22"
                      cy="22"
                      r="18"
                      className="stroke-slate-200 dark:stroke-slate-700"
                      strokeWidth="4"
                      fill="none"
                    />
                    <circle
                      cx="22"
                      cy="22"
                      r="18"
                      stroke="#10b981"
                      strokeWidth="4"
                      fill="none"
                      strokeDasharray={113}
                      strokeDashoffset={113 - (113 * Math.min(100, Math.max(0, durationPct))) / 100}
                      strokeLinecap="round"
                      className="transition-all duration-700"
                    />
                  </svg>
                  <span className="absolute text-[10px] font-black text-emerald-600 dark:text-emerald-400 font-mono">
                    {currentService?.durationMin || 45}m
                  </span>
                </div>
                <div className="min-w-0">
                  <span className="text-[11px] font-bold text-slate-900 dark:text-white block truncate">
                    Duración Estimada
                  </span>
                  <span className="text-[10px] text-slate-400 block truncate">
                    Bloque de agenda
                  </span>
                </div>
              </div>
            </div>

            {/* Operational Telemetry Rows */}
            <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100 dark:border-slate-700/60 text-xs">
              <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800/80">
                <span className="text-[10px] font-medium text-slate-400 block">Horario Turno</span>
                <span className="text-xs font-black text-slate-900 dark:text-white font-mono truncate block">
                  {time} a {appointmentEndTime}
                </span>
              </div>
              <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800/80">
                <span className="text-[10px] font-medium text-slate-400 block">Especialistas</span>
                <span className="text-xs font-black text-slate-900 dark:text-white font-mono">
                  {staff.length} activos
                </span>
              </div>
              <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800/80">
                <span className="text-[10px] font-medium text-slate-400 block">Catálogo</span>
                <span className="text-xs font-black text-slate-900 dark:text-white font-mono">
                  {services.length} servicios
                </span>
              </div>
            </div>
          </div>

          {/* Card 2: Resumen del Turno & Recordatorio */}
          <div className="rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/70 dark:border-slate-700/60 p-5 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700/60">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 font-bold">
                  <Scissors className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                    Resumen del Turno Seleccionado
                  </h3>
                  <p className="text-[11px] text-slate-400">Detalles en vivo de la reserva</p>
                </div>
              </div>

              <span className="text-xs font-black font-mono text-emerald-600 dark:text-emerald-400">
                {currentService?.price ? formatGs(currentService.price) : "Gs. 0"}
              </span>
            </div>

            {/* Live Service Pill */}
            <div className="py-3">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {currentService?.name || "Servicio"}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">
                    {currentService?.durationMin || 45} min
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                  <span>Profesional asignado:</span>
                  <strong className="text-slate-800 dark:text-slate-200 font-medium">
                    {currentStaff?.name || "Equipo General"}
                  </strong>
                </div>
              </div>
            </div>

            {/* WhatsApp Ready Status */}
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2 text-xs">
              <MessageCircle className="h-4 w-4 text-emerald-500 shrink-0" />
              <span className="text-[11px] text-emerald-800 dark:text-emerald-300 font-medium truncate">
                Recordatorio con link de Google Calendar listo para enviar tras agendar.
              </span>
            </div>
          </div>
        </div>
      </div>

      {createdAppointment ? (
        /* Confirmation Screen */
        <Card className="p-6 text-center space-y-5 rounded-3xl border border-slate-200/80 dark:border-white/10 shadow-sm bg-white dark:bg-slate-900">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-8 w-8" />
          </div>

          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white">
              ¡Turno Confirmado con Éxito!
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Guardado en la base de datos SQL y sincronizado en la agenda del local.
            </p>
          </div>

          {/* Details Pill */}
          <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-slate-50/70 dark:bg-slate-800/40 p-4 text-xs text-left space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-500">Cliente:</span>
              <span className="font-bold text-slate-900 dark:text-white">{createdAppointment.clientName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Servicio:</span>
              <span className="font-bold text-primary">{createdAppointment.serviceName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Profesional:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{createdAppointment.staffName}</span>
            </div>
            <div className="flex justify-between border-t border-slate-200/60 dark:border-white/10 pt-2">
              <span className="text-slate-500">Fecha y Hora:</span>
              <span className="font-black text-slate-900 dark:text-white">
                {createdAppointment.date} · {createdAppointment.time} a {createdAppointment.end} hs
              </span>
            </div>
          </div>

          {/* WhatsApp & Google Calendar actions */}
          <div className="flex flex-col sm:flex-row gap-2.5">
            <a
              href={waReminderUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 py-3 px-4 text-xs font-bold text-white shadow-md shadow-emerald-600/25 transition cursor-pointer"
            >
              <MessageCircle className="h-4 w-4" />
              <span>Enviar WhatsApp al Cliente</span>
            </a>
            <a
              href={googleCalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-800/80 py-3 px-4 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer"
            >
              <Calendar className="h-4 w-4 text-primary" />
              <span>Google Calendar</span>
            </a>
          </div>

          {/* Reset / Return actions */}
          <div className="flex items-center justify-center gap-3 pt-3 border-t border-slate-100 dark:border-white/10">
            <button
              type="button"
              onClick={() => {
                setCreatedAppointment(null);
                setClientName("");
                setClientPhone("");
                setClientNotes("");
              }}
              className="text-xs font-bold text-primary hover:underline cursor-pointer"
            >
              + Agendar otro turno
            </button>
            <span className="text-slate-300">·</span>
            <Link
              href="/dashboard/calendario"
              className="text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition"
            >
              Ver en la Agenda
            </Link>
          </div>
        </Card>
      ) : (
        /* Main Card Form */
        <Card className="p-5 sm:p-6 rounded-3xl border border-slate-200/80 dark:border-white/10 shadow-sm bg-white dark:bg-slate-900 space-y-4">
          {/* Segmented Mode Switcher */}
          <div className="flex rounded-2xl bg-slate-100 dark:bg-slate-800 p-1">
            <button
              type="button"
              onClick={() => setMode("appointment")}
              className={`flex-1 py-2 rounded-xl font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer ${
                mode === "appointment"
                  ? "bg-white dark:bg-slate-900 text-primary shadow-xs ring-1 ring-slate-200/50 dark:ring-white/10"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <CalendarPlus className="h-3.5 w-3.5" />
              <span>Agendar Turno</span>
            </button>
            <button
              type="button"
              onClick={() => setMode("block")}
              className={`flex-1 py-2 rounded-xl font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer ${
                mode === "block"
                  ? "bg-white dark:bg-slate-900 text-amber-600 shadow-xs ring-1 ring-slate-200/50 dark:ring-white/10"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Ban className="h-3.5 w-3.5 text-amber-500" />
              <span>Bloquear Horario</span>
            </button>
          </div>

          {mode === "appointment" ? (
            <form onSubmit={handleCreateAppointment} className="space-y-4 text-xs">
              {/* SECTION 1: CLIENTE (NOMBRE Y WHATSAPP CON SELECTOR DE PAÍS) */}
              <div data-tour="nueva-reserva-client" className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Name Input with Autocomplete */}
                  <div className="relative">
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Cliente *
                    </label>
                    <div className="relative">
                      <User className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        required
                        placeholder="Nombre y Apellido"
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        className="w-full rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900 pl-9 pr-3 py-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-primary focus:outline-none"
                      />
                    </div>

                    {/* Autocomplete suggestions */}
                    {matchingClients.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-1 z-30 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900 shadow-xl p-1.5 space-y-0.5 max-h-44 overflow-y-auto">
                        <span className="text-[10px] text-slate-400 px-2 py-0.5 block font-bold">
                          Clientes Registrados:
                        </span>
                        {matchingClients.map((c) => (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => {
                              setClientName(c.name);
                              setClientPhone(c.phone || "");
                              setClientEmail(c.email || "");
                            }}
                            className="w-full flex items-center justify-between p-2 rounded-xl text-left hover:bg-primary/10 transition cursor-pointer"
                          >
                            <span className="font-bold text-slate-900 dark:text-white text-xs">{c.name}</span>
                            <span className="text-[11px] text-slate-400 font-mono">{c.phone || ""}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* International WhatsApp Input */}
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      WhatsApp *
                    </label>
                    <div className="flex items-center gap-1.5">
                      {/* Country Selector Dropdown */}
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => {
                            setCountryDropdownOpen(!countryDropdownOpen);
                            setServiceDropdownOpen(false);
                            setStaffDropdownOpen(false);
                            setTimeDropdownOpen(false);
                          }}
                          className="flex items-center gap-1.5 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-slate-50 dark:bg-slate-800 px-2.5 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 shrink-0 hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer"
                          title="Seleccionar país"
                        >
                          <span className="text-sm leading-none">{activeCountry.flag}</span>
                          <span className="font-mono text-xs">{activeCountry.dialCode}</span>
                          <ChevronDown
                            className={`h-3 w-3 text-slate-400 transition-transform ${
                              countryDropdownOpen ? "rotate-180" : ""
                            }`}
                          />
                        </button>

                        {countryDropdownOpen && (
                          <div className="absolute top-full left-0 mt-1 z-40 w-64 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900 shadow-2xl p-2">
                            <div className="relative mb-1.5">
                              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                              <input
                                type="text"
                                autoFocus
                                placeholder="Buscar país o código..."
                                value={countrySearchQuery}
                                onChange={(e) => setCountrySearchQuery(e.target.value)}
                                className="w-full rounded-xl border border-slate-200/80 dark:border-white/10 bg-slate-50 dark:bg-slate-800 pl-8 pr-2.5 py-1.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-primary focus:outline-none"
                              />
                            </div>
                            <div className="max-h-44 overflow-y-auto space-y-0.5">
                              {filteredCountries.map((c) => (
                                <button
                                  key={c.code}
                                  type="button"
                                  onClick={() => {
                                    setSelectedCountryCode(c.code);
                                    setCountryDropdownOpen(false);
                                    setCountrySearchQuery("");
                                    setClientPhone((prev) => formatPhoneInput(prev, c));
                                  }}
                                  className={`w-full flex items-center justify-between p-2 rounded-xl text-left text-xs transition cursor-pointer ${
                                    selectedCountryCode === c.code
                                      ? "bg-primary/10 text-primary font-bold"
                                      : "hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
                                  }`}
                                >
                                  <div className="flex items-center gap-2 truncate">
                                    <span className="text-base leading-none">{c.flag}</span>
                                    <span className="truncate">{c.name}</span>
                                  </div>
                                  <span className="font-mono text-[11px] text-slate-400 shrink-0">
                                    {c.dialCode}
                                  </span>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Phone Input with real-time formatting */}
                      <div className="relative flex-1">
                        <input
                          type="tel"
                          placeholder={activeCountry.placeholder}
                          value={clientPhone}
                          onChange={(e) =>
                            setClientPhone(formatPhoneInput(e.target.value, activeCountry))
                          }
                          className="w-full rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900 px-3 py-2.5 text-xs text-slate-900 dark:text-white focus:border-primary focus:outline-none font-mono"
                        />
                      </div>
                    </div>

                    {/* Phone Validation indicator */}
                    {clientPhone.trim().length > 0 && (
                      <div className="flex items-center gap-1 mt-1 text-[10.5px] font-normal">
                        {isPhoneValid ? (
                          <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-semibold">
                            <Check className="h-3 w-3 shrink-0" />
                            <span>Número válido para WhatsApp</span>
                          </span>
                        ) : (
                          <span className="text-slate-400 dark:text-slate-500 flex items-center gap-1 opacity-75">
                            <AlertCircle className="h-3 w-3 shrink-0" />
                            <span>Verificá que el número sea real</span>
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* SECTION 2: SERVICIO & ESPECIALISTA */}
              <div data-tour="nueva-reserva-service" className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Custom Service Selector */}
                <div className="relative">
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Servicio *
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setServiceDropdownOpen(!serviceDropdownOpen);
                      setStaffDropdownOpen(false);
                      setTimeDropdownOpen(false);
                    }}
                    className="w-full flex items-center justify-between rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900 px-3 py-2.5 text-xs text-left hover:border-slate-300 dark:hover:border-white/20 transition cursor-pointer"
                  >
                    <div className="min-w-0 flex-1 truncate pr-2">
                      <span className="font-bold text-slate-900 dark:text-white">
                        {currentService?.name}
                      </span>
                      <span className="text-slate-400 ml-1.5 font-medium">
                        ({currentService?.durationMin}m · {formatGs(currentService?.price || 0)})
                      </span>
                    </div>
                    <ChevronDown
                      className={`h-4 w-4 text-slate-400 shrink-0 transition-transform ${
                        serviceDropdownOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {serviceDropdownOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1 z-30 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900 shadow-xl p-1.5 max-h-48 overflow-y-auto space-y-0.5">
                      {services.map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => {
                            setServiceId(s.id);
                            setServiceDropdownOpen(false);
                          }}
                          className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition cursor-pointer ${
                            serviceId === s.id
                              ? "bg-primary/10 text-primary font-bold"
                              : "hover:bg-slate-50 dark:hover:bg-slate-800"
                          }`}
                        >
                          <span className="truncate pr-2">{s.name}</span>
                          <span className="text-[11px] font-mono shrink-0 text-slate-500 dark:text-slate-400">
                            {formatGs(s.price)} · {s.durationMin}m
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Custom Staff Selector */}
                <div className="relative">
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Profesional Asignado *
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setStaffDropdownOpen(!staffDropdownOpen);
                      setServiceDropdownOpen(false);
                      setTimeDropdownOpen(false);
                    }}
                    className="w-full flex items-center justify-between rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900 px-3 py-2.5 text-xs text-left hover:border-slate-300 dark:hover:border-white/20 transition cursor-pointer"
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <span
                        className="flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-bold text-white shadow-xs shrink-0"
                        style={{ background: currentStaff?.color || "#6366f1" }}
                      >
                        {currentStaff?.avatar || "P"}
                      </span>
                      <span className="font-bold text-slate-900 dark:text-white truncate">
                        {currentStaff?.name}
                      </span>
                      <span className="text-slate-400 text-[11px]">({currentStaff?.role})</span>
                    </div>
                    <ChevronDown
                      className={`h-4 w-4 text-slate-400 shrink-0 transition-transform ${
                        staffDropdownOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {staffDropdownOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1 z-30 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900 shadow-xl p-1.5 max-h-48 overflow-y-auto space-y-0.5">
                      {staff.filter((s) => s.active).map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => {
                            setStaffId(p.id);
                            setStaffDropdownOpen(false);
                          }}
                          className={`w-full flex items-center gap-2 p-2 rounded-xl text-left transition cursor-pointer ${
                            staffId === p.id
                              ? "bg-primary/10 text-primary font-bold"
                              : "hover:bg-slate-50 dark:hover:bg-slate-800"
                          }`}
                        >
                          <span
                            className="flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-bold text-white shrink-0"
                            style={{ background: p.color }}
                          >
                            {p.avatar}
                          </span>
                          <span className="flex-1 truncate">{p.name}</span>
                          <span className="text-[11px] text-slate-400">{p.role}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* SECTION 3: FECHA Y HORA (INTERACTIVE BAR) */}
              <div data-tour="nueva-reserva-datetime">
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Fecha y Horario *
                </label>
                <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-slate-50/70 dark:bg-slate-800/40 p-3">
                  {/* Date Stepper */}
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => stepDate(-1)}
                      className="p-1.5 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-white dark:hover:bg-slate-700 transition cursor-pointer"
                      title="Día anterior"
                    >
                      <ChevronLeft className="h-3.5 w-3.5 text-slate-600 dark:text-slate-300" />
                    </button>
                    <span className="font-bold text-slate-900 dark:text-white capitalize text-xs px-1">
                      {formattedDateTitle}
                    </span>
                    <button
                      type="button"
                      onClick={() => stepDate(1)}
                      className="p-1.5 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-white dark:hover:bg-slate-700 transition cursor-pointer"
                      title="Día siguiente"
                    >
                      <ChevronRight className="h-3.5 w-3.5 text-slate-600 dark:text-slate-300" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDate(todayStr)}
                      className="text-[10.5px] font-bold text-primary hover:underline px-2 py-0.5 rounded hover:bg-primary/10 transition cursor-pointer"
                    >
                      Hoy
                    </button>
                  </div>

                  {/* Time Stepper & Popover */}
                  <div className="flex items-center gap-1.5 relative">
                    <button
                      type="button"
                      onClick={() => setTime((t) => stepTime(t, -15))}
                      className="px-2 py-1 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 text-[10.5px] font-bold text-slate-700 dark:text-slate-300 hover:border-primary transition cursor-pointer"
                    >
                      -15m
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setTimeDropdownOpen(!timeDropdownOpen);
                        setServiceDropdownOpen(false);
                        setStaffDropdownOpen(false);
                      }}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 font-mono font-black text-xs text-slate-900 dark:text-white hover:border-primary transition cursor-pointer shadow-xs"
                    >
                      <Clock className="h-3.5 w-3.5 text-primary" />
                      <span>{time} hs</span>
                      <ChevronDown className="h-3 w-3 text-slate-400 ml-0.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setTime((t) => stepTime(t, 15))}
                      className="px-2 py-1 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 text-[10.5px] font-bold text-slate-700 dark:text-slate-300 hover:border-primary transition cursor-pointer"
                    >
                      +15m
                    </button>

                    <span className="text-[11px] text-slate-400 hidden sm:inline">
                      hasta <strong>{appointmentEndTime} hs</strong>
                    </span>

                    {/* Time dropdown popover */}
                    {timeDropdownOpen && (
                      <div className="absolute right-0 bottom-full mb-1.5 z-40 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 shadow-2xl p-2 w-52 max-h-48 overflow-y-auto grid grid-cols-2 gap-1.5">
                        {APPOINTMENT_TIME_SLOTS.map((t) => (
                          <button
                            key={t}
                            type="button"
                            onClick={() => {
                              setTime(t);
                              setTimeDropdownOpen(false);
                            }}
                            className={`py-1.5 px-2 rounded-xl text-center font-mono text-[11px] font-bold transition cursor-pointer ${
                              time === t
                                ? "bg-primary text-white shadow-xs"
                                : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                            }`}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* SECTION 4: MÉTODO DE PAGO */}
              <div data-tour="nueva-reserva-payment">
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Método de Pago
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: "efectivo" as const, label: "Efectivo", icon: Banknote },
                    { id: "sipap" as const, label: "Transferencia", icon: Landmark },
                    { id: "pos_bancard" as const, label: "POS Bancard", icon: CreditCard },
                    { id: "billetera_py" as const, label: "Billetera", icon: Smartphone },
                  ].map(({ id, label, icon: Icon }) => {
                    const isSelected = paymentMethod === id;
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setPaymentMethod(id)}
                        style={isSelected ? { backgroundColor: business.primaryColor || "var(--primary, #FF4F2B)", color: "#ffffff", borderColor: business.primaryColor || "var(--primary, #FF4F2B)" } : undefined}
                        className={`flex items-center justify-center gap-1.5 rounded-2xl border py-2.5 px-2 text-xs font-bold transition cursor-pointer ${
                          isSelected
                            ? "shadow-xs"
                            : "border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:border-slate-300"
                        }`}
                      >
                        <Icon className="h-3.5 w-3.5" />
                        <span>{label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* SECTION 5: NOTAS OPCIONALES */}
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Notas / Observaciones (opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ej. Viene con su hijo / Prefiere atención rápida"
                  value={clientNotes}
                  onChange={(e) => setClientNotes(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900 py-2.5 px-3 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-primary focus:outline-none"
                />
              </div>

              {/* FOOTER ACTIONS & CONFIRM BUTTON */}
              <div
                data-tour="nueva-reserva-confirm"
                className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-white/10"
              >
                <div>
                  <span className="text-[10.5px] text-slate-400 block font-medium">Tarifa del Servicio:</span>
                  <span
                    className="text-base font-black font-mono"
                    style={{ color: business.primaryColor || "var(--primary, #FF4F2B)" }}
                  >
                    {formatGs(currentService?.price || 0)}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href="/dashboard/calendario"
                    className="rounded-2xl border border-slate-200/80 dark:border-white/10 px-4 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  >
                    Ver Agenda
                  </Link>
                  <button
                    type="submit"
                    disabled={isSubmitting || !clientName.trim()}
                    style={{
                      backgroundColor: business.primaryColor || "var(--primary, #FF4F2B)",
                      boxShadow: `0 8px 20px -4px ${business.primaryColor || "rgba(255, 79, 43, 0.4)"}`,
                    }}
                    className="rounded-2xl px-6 py-2.5 text-xs font-bold text-white shadow-md hover:brightness-110 disabled:opacity-50 transition cursor-pointer"
                  >
                    {isSubmitting ? "Guardando en SQL..." : "Confirmar Turno"}
                  </button>
                </div>
              </div>
            </form>
          ) : (
            /* Mode 2: Schedule Block Form */
            <form onSubmit={handleCreateBlock} className="space-y-4 text-xs">
              <div className="rounded-2xl bg-amber-500/10 border border-amber-500/20 p-3 text-xs text-amber-800 dark:text-amber-300 flex items-center gap-2">
                <Ban className="h-4 w-4 shrink-0 text-amber-600" />
                <span>Bloqueá un intervalo de descanso, almuerzo o reunión para evitar reservas.</span>
              </div>

              {/* Professional Affected */}
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Profesional Afectado
                </label>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => setBlockStaffId("all")}
                    className={`px-3 py-1.5 rounded-2xl border text-xs font-bold transition cursor-pointer ${
                      blockStaffId === "all"
                        ? "border-amber-500 bg-amber-500 text-white shadow-xs"
                        : "border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    Todo el salón
                  </button>
                  {staff.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setBlockStaffId(p.id)}
                      className={`px-3 py-1.5 rounded-2xl border text-xs font-bold transition cursor-pointer ${
                        blockStaffId === p.id
                          ? "border-primary bg-primary text-white shadow-xs"
                          : "border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Interval & Reason */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Hora Inicio
                  </label>
                  <input
                    type="time"
                    value={blockStart}
                    onChange={(e) => setBlockStart(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900 py-2.5 px-3 text-xs text-slate-900 dark:text-white focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Hora Fin
                  </label>
                  <input
                    type="time"
                    value={blockEnd}
                    onChange={(e) => setBlockEnd(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900 py-2.5 px-3 text-xs text-slate-900 dark:text-white focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Motivo de Bloqueo
                </label>
                <input
                  type="text"
                  placeholder="Ej. Almuerzo / Descanso / Capacitación interna"
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900 py-2.5 px-3 text-xs text-slate-900 dark:text-white focus:border-primary focus:outline-none"
                />
              </div>

              <div className="flex justify-end pt-3 border-t border-slate-100 dark:border-white/10">
                <button
                  type="submit"
                  className="rounded-2xl bg-amber-600 hover:bg-amber-700 px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-amber-600/25 transition cursor-pointer"
                >
                  Guardar Bloqueo
                </button>
              </div>
            </form>
          )}
        </Card>
      )}
    </div>
  );
}

export default function NuevaReservaPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">Cargando reserva...</div>}>
      <NuevaReservaContent />
    </Suspense>
  );
}
