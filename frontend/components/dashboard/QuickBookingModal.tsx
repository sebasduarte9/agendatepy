"use client";

import { useMemo, useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Clock,
  User,
  Search,
  Check,
  Sparkles,
  Banknote,
  Landmark,
  CreditCard,
  Smartphone,
  AlertCircle,
  Ban,
} from "lucide-react";
import { format, parseISO, addMinutes } from "date-fns";
import { es } from "date-fns/locale";
import { formatInTimeZone } from "date-fns-tz";
import { useDashboardStore } from "@/store/useDashboardStore";
import type { Appointment, PaymentMethod } from "@/lib/dashboard-types";
import { formatGs, normalizeParaguayPhone } from "@/lib/dashboard-dates";
import Modal from "./ui/Modal";

export interface CountryOption {
  code: string;
  name: string;
  flag: string;
  dialCode: string;
  maxDigits: number;
  minDigits: number;
  placeholder: string;
}

export const COUNTRY_LIST: CountryOption[] = [
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

export function formatPhoneInput(val: string, country: CountryOption): string {
  let digits = val.replace(/\D/g, "");
  if (!digits) return "";

  if (country.code === "PY") {
    if (digits.startsWith("595")) digits = digits.slice(3);
    if (digits.length > 10) digits = digits.slice(0, 10);
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
  if (digits.length > 6) {
    return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
  } else if (digits.length > 3) {
    return `${digits.slice(0, 3)} ${digits.slice(3)}`;
  }
  return digits;
}

export function validateRealPhone(rawPhone: string, country: CountryOption): boolean {
  if (!rawPhone) return false;
  const digits = rawPhone.replace(/\D/g, "");
  if (!digits) return false;

  if (country.code === "PY") {
    let core = digits;
    if (core.startsWith("595")) core = core.slice(3);
    if (core.startsWith("0")) core = core.slice(1);
    return core.length === 9 && /^9[6-9]\d{7}$/.test(core);
  }

  return digits.length >= country.minDigits && digits.length <= country.maxDigits;
}

const APPOINTMENT_TIME_SLOTS = [
  "08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30",
  "16:00", "16:30", "17:00", "17:30", "18:00", "18:30", "19:00", "19:30",
];

interface QuickBookingModalProps {
  open: boolean;
  onClose: () => void;
  prefillClient?: { id?: string; name: string; phone?: string } | null;
  initialDate?: string;
  initialTime?: string;
  initialStaffId?: string;
  onSuccess?: (app: Appointment) => void;
  allowBlock?: boolean;
}

export default function QuickBookingModal({
  open,
  onClose,
  prefillClient,
  initialDate,
  initialTime = "10:00",
  initialStaffId,
  onSuccess,
  allowBlock = true,
}: QuickBookingModalProps) {
  const { services, staff, clients, business, calendarDate, addAppointment, addBlock, pushToast } =
    useDashboardStore();

  const effectiveDate = initialDate || calendarDate || formatInTimeZone(new Date(), business.timezone || "America/Asuncion", "yyyy-MM-dd");

  const [modalMode, setModalMode] = useState<"appointment" | "block">("appointment");
  const [slotDate, setSlotDate] = useState(effectiveDate);
  const [slotTime, setSlotTime] = useState(initialTime);
  const [slotStaffId, setSlotStaffId] = useState(initialStaffId || staff[0]?.id || "");

  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientId, setClientId] = useState<string | null>(null);

  const [selectedCountryCode, setSelectedCountryCode] = useState("PY");
  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);
  const [countrySearchQuery, setCountrySearchQuery] = useState("");

  const [serviceId, setServiceId] = useState(services[0]?.id || "");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("efectivo");

  const [serviceDropdownOpen, setServiceDropdownOpen] = useState(false);
  const [staffDropdownOpen, setStaffDropdownOpen] = useState(false);
  const [timeDropdownOpen, setTimeDropdownOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Schedule Block state
  const [blockStaffId, setBlockStaffId] = useState<string>("all");
  const [blockDate, setBlockDate] = useState(effectiveDate);
  const [blockStart, setBlockStart] = useState("13:00");
  const [blockEnd, setBlockEnd] = useState("14:00");
  const [blockReason, setBlockReason] = useState("Almuerzo / Descanso");

  // Sync prefill on open
  useEffect(() => {
    if (open) {
      setModalMode("appointment");
      setSlotDate(effectiveDate);
      setSlotTime(initialTime);
      setSlotStaffId(initialStaffId || staff[0]?.id || "");
      setServiceId(services[0]?.id || "");
      setPaymentMethod("efectivo");
      setBlockDate(effectiveDate);

      if (prefillClient) {
        setClientId(prefillClient.id || null);
        setClientName(prefillClient.name || "");
        if (prefillClient.phone) {
          const raw = prefillClient.phone.trim();
          const matched = COUNTRY_LIST.find((cntry) => raw.startsWith(cntry.dialCode));
          if (matched) {
            setSelectedCountryCode(matched.code);
            setClientPhone(formatPhoneInput(raw.slice(matched.dialCode.length).trim(), matched));
          } else {
            setSelectedCountryCode("PY");
            setClientPhone(formatPhoneInput(raw.replace(/^\+?595\s*/, ""), COUNTRY_LIST[0]));
          }
        } else {
          setClientPhone("");
        }
      } else {
        setClientId(null);
        setClientName("");
        setClientPhone("");
        setSelectedCountryCode("PY");
      }
      setServiceDropdownOpen(false);
      setStaffDropdownOpen(false);
      setTimeDropdownOpen(false);
      setCountryDropdownOpen(false);
      setCountrySearchQuery("");
    }
  }, [open, prefillClient, effectiveDate, initialTime, initialStaffId, staff, services]);

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

  // Current service & end time
  const currentService = useMemo(() => {
    return services.find((s) => s.id === serviceId) || services[0];
  }, [services, serviceId]);

  function stepTime(current: string, deltaMinutes: number): string {
    const [h, m] = current.split(":").map(Number);
    const totalMinutes = (isNaN(h) ? 10 : h) * 60 + (isNaN(m) ? 0 : m) + deltaMinutes;
    const clamped = Math.max(0, Math.min(23 * 60 + 45, totalMinutes));
    const nh = String(Math.floor(clamped / 60)).padStart(2, "0");
    const nm = String(clamped % 60).padStart(2, "0");
    return `${nh}:${nm}`;
  }

  const appointmentEndTime = useMemo(() => {
    if (!slotTime || !currentService) return "";
    return stepTime(slotTime, currentService.durationMin || 45);
  }, [slotTime, currentService]);

  // Date formatted
  const formattedSlotDate = useMemo(() => {
    try {
      return format(parseISO(`${slotDate}T12:00:00`), "EEEE d 'de' MMMM", { locale: es });
    } catch {
      return slotDate;
    }
  }, [slotDate]);

  function stepSlotDate(days: number) {
    try {
      const dt = parseISO(`${slotDate}T12:00:00`);
      dt.setDate(dt.getDate() + days);
      setSlotDate(format(dt, "yyyy-MM-dd"));
    } catch {
      // fallback
    }
  }

  // Matching clients for autocomplete
  const matchingClients = useMemo(() => {
    if (!clientName.trim() || clientId) return [];
    const q = clientName.toLowerCase().trim();
    return clients.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.phone && c.phone.includes(q))
    ).slice(0, 4);
  }, [clients, clientName, clientId]);

  async function handleCreateAppointment(e: React.FormEvent) {
    e.preventDefault();
    if (!clientName.trim()) {
      pushToast("error", "Por favor ingresá el nombre del cliente");
      return;
    }

    const service = currentService || services[0];
    const duration = service?.durationMin || 45;
    const startDateTime = parseISO(`${slotDate}T${slotTime}:00`);
    const endDateTime = addMinutes(startDateTime, duration);

    let normPhone = "";
    if (activeCountry.code === "PY") {
      normPhone = normalizeParaguayPhone(clientPhone.trim() || "+595981000000");
    } else {
      const cleanDigits = clientPhone.replace(/\D/g, "");
      normPhone = cleanDigits ? `${activeCountry.dialCode}${cleanDigits}` : `${activeCountry.dialCode}0000000`;
    }

    const newApp: Appointment = {
      id: `app-${Date.now()}`,
      clientId: clientId || undefined,
      clientName: clientName.trim(),
      clientPhone: normPhone,
      clientEmail: `${clientName.toLowerCase().replace(/\s+/g, ".")}@gmail.com`,
      serviceId: service.id,
      staffId: slotStaffId || staff[0]?.id || "",
      start: startDateTime.toISOString(),
      end: endDateTime.toISOString(),
      paymentMethod,
      status: "confirmed",
    };

    setIsSubmitting(true);
    try {
      const res = await addAppointment(newApp);
      if (res) {
        pushToast("success", `Turno agendado con éxito para ${clientName}`);
        if (onSuccess) onSuccess(newApp);
        onClose();
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleCreateBlock(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const ok = await addBlock({
        staffId: blockStaffId === "all" ? "all" : blockStaffId,
        date: blockDate,
        start: blockStart,
        end: blockEnd,
        reason: blockReason,
      });
      if (ok) {
        pushToast("success", "Bloqueo de horario registrado correctamente");
        onClose();
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Modal
      id="quickBookingModal"
      maxWidth="max-w-lg"
      open={open}
      title={modalMode === "appointment" ? "Agendar Turno" : "Bloquear Horario"}
      onClose={onClose}
    >
      <div className="space-y-4 text-xs">
        {/* Mode switcher (Turno vs Bloqueo) */}
        {allowBlock && (
          <div className="flex rounded-2xl bg-slate-100 dark:bg-slate-800 p-1">
            <button
              type="button"
              onClick={() => setModalMode("appointment")}
              className={`flex-1 py-1.5 rounded-xl font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer ${
                modalMode === "appointment"
                  ? "bg-white dark:bg-slate-900 text-primary shadow-xs ring-1 ring-slate-200/50 dark:ring-white/10"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Agendar Turno</span>
            </button>
            <button
              type="button"
              onClick={() => setModalMode("block")}
              className={`flex-1 py-1.5 rounded-xl font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer ${
                modalMode === "block"
                  ? "bg-white dark:bg-slate-900 text-amber-600 shadow-xs ring-1 ring-slate-200/50 dark:ring-white/10"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Ban className="h-3.5 w-3.5 text-amber-500" />
              <span>Bloquear Horario</span>
            </button>
          </div>
        )}

        {modalMode === "appointment" ? (
          <form onSubmit={handleCreateAppointment} className="space-y-3.5">
            {/* ROW 1: CLIENTE (NOMBRE Y WHATSAPP) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="relative">
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Cliente *
                </label>
                <div className="relative">
                  <User className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="Nombre y Apellido"
                    value={clientName}
                    onChange={(e) => {
                      setClientName(e.target.value);
                      setClientId(null);
                    }}
                    className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-primary focus:outline-none"
                  />
                </div>

                {matchingClients.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 z-30 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 shadow-xl p-1 space-y-0.5 max-h-40 overflow-y-auto">
                    <span className="text-[10px] text-slate-400 px-2 py-0.5 block font-medium">Sugerencias:</span>
                    {matchingClients.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => {
                          setClientId(c.id);
                          setClientName(c.name);
                          if (c.phone) {
                            const raw = c.phone.trim();
                            const matched = COUNTRY_LIST.find((cntry) => raw.startsWith(cntry.dialCode));
                            if (matched) {
                              setSelectedCountryCode(matched.code);
                              setClientPhone(formatPhoneInput(raw.slice(matched.dialCode.length).trim(), matched));
                            } else {
                              setSelectedCountryCode("PY");
                              setClientPhone(formatPhoneInput(raw.replace(/^\+?595\s*/, ""), COUNTRY_LIST[0]));
                            }
                          } else {
                            setClientPhone("");
                          }
                        }}
                        className="w-full flex items-center justify-between p-1.5 rounded-lg text-left hover:bg-primary/10 transition cursor-pointer"
                      >
                        <span className="font-bold text-slate-900 dark:text-white text-xs">{c.name}</span>
                        <span className="text-[11px] text-slate-400 font-mono">{c.phone || ""}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  WhatsApp
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
                      className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800 px-2.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 shrink-0 hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer"
                      title="Seleccionar país"
                    >
                      <span className="text-sm leading-none">{activeCountry.flag}</span>
                      <span className="font-mono text-xs">{activeCountry.dialCode}</span>
                      <ChevronDown className={`h-3 w-3 text-slate-400 transition-transform ${countryDropdownOpen ? "rotate-180" : ""}`} />
                    </button>

                    {countryDropdownOpen && (
                      <div className="absolute top-full left-0 mt-1 z-40 w-64 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 shadow-2xl p-2">
                        <div className="relative mb-1.5">
                          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                          <input
                            type="text"
                            autoFocus
                            placeholder="Buscar país o código..."
                            value={countrySearchQuery}
                            onChange={(e) => setCountrySearchQuery(e.target.value)}
                            className="w-full rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800 pl-8 pr-2.5 py-1.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-primary focus:outline-none"
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
                              className={`w-full flex items-center justify-between p-1.5 rounded-lg text-left text-xs transition cursor-pointer ${
                                selectedCountryCode === c.code
                                  ? "bg-primary/10 text-primary font-bold"
                                  : "hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
                              }`}
                            >
                              <div className="flex items-center gap-2 truncate">
                                <span className="text-base leading-none">{c.flag}</span>
                                <span className="truncate">{c.name}</span>
                              </div>
                              <span className="font-mono text-[11px] text-slate-400 shrink-0">{c.dialCode}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Phone Input with intelligent max digits and format */}
                  <div className="relative flex-1">
                    <input
                      type="tel"
                      placeholder={activeCountry.placeholder}
                      value={clientPhone}
                      onChange={(e) => setClientPhone(formatPhoneInput(e.target.value, activeCountry))}
                      className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-900 dark:text-white focus:border-primary focus:outline-none font-mono"
                    />
                  </div>
                </div>

                {/* Subtle Real Phone Validation Hint */}
                {clientPhone.trim().length > 0 && (
                  <div className="flex items-center gap-1 mt-1 text-[10.5px] font-normal">
                    {isPhoneValid ? (
                      <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <Check className="h-3 w-3 shrink-0" />
                        <span>Número válido</span>
                      </span>
                    ) : (
                      <span className="text-slate-400 dark:text-slate-500 flex items-center gap-1 opacity-75">
                        <AlertCircle className="h-3 w-3 shrink-0 text-slate-400 dark:text-slate-500" />
                        <span>Verificá que el número sea real</span>
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* ROW 2: SERVICIO & PROFESIONAL */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Custom Service Selector */}
              <div className="relative">
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Servicio
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setServiceDropdownOpen(!serviceDropdownOpen);
                    setStaffDropdownOpen(false);
                    setTimeDropdownOpen(false);
                    setCountryDropdownOpen(false);
                  }}
                  className="w-full flex items-center justify-between rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-left hover:border-slate-300 dark:hover:border-white/20 transition cursor-pointer"
                >
                  <div className="min-w-0 flex-1 truncate pr-2">
                    <span className="font-bold text-slate-900 dark:text-white">{currentService?.name}</span>
                    <span className="text-slate-400 ml-1.5 font-medium">({currentService?.durationMin}m · {formatGs(currentService?.price || 0)})</span>
                  </div>
                  <ChevronDown className={`h-4 w-4 text-slate-400 shrink-0 transition-transform ${serviceDropdownOpen ? "rotate-180" : ""}`} />
                </button>

                {serviceDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 z-30 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 shadow-xl p-1 max-h-48 overflow-y-auto space-y-0.5">
                    {services.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => {
                          setServiceId(s.id);
                          setServiceDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition cursor-pointer ${
                          serviceId === s.id ? "bg-primary/10 text-primary font-bold" : "hover:bg-slate-50 dark:hover:bg-slate-800"
                        }`}
                      >
                        <span className="truncate pr-2">{s.name}</span>
                        <span className="text-[11px] font-mono shrink-0 text-slate-500 dark:text-slate-400">{formatGs(s.price)} · {s.durationMin}m</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Custom Staff Selector */}
              <div className="relative">
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Profesional
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setStaffDropdownOpen(!staffDropdownOpen);
                    setServiceDropdownOpen(false);
                    setTimeDropdownOpen(false);
                    setCountryDropdownOpen(false);
                  }}
                  className="w-full flex items-center justify-between rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-left hover:border-slate-300 dark:hover:border-white/20 transition cursor-pointer"
                >
                  {(() => {
                    const assigned = staff.find((s) => s.id === slotStaffId) || staff[0];
                    return (
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <span
                          className="flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-bold text-white shadow-xs shrink-0"
                          style={{ background: assigned?.color || "#6366f1" }}
                        >
                          {assigned?.avatar || "P"}
                        </span>
                        <span className="font-bold text-slate-900 dark:text-white truncate">{assigned?.name}</span>
                        <span className="text-slate-400 text-[11px]">({assigned?.role})</span>
                      </div>
                    );
                  })()}
                  <ChevronDown className={`h-4 w-4 text-slate-400 shrink-0 transition-transform ${staffDropdownOpen ? "rotate-180" : ""}`} />
                </button>

                {staffDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 z-30 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 shadow-xl p-1 max-h-48 overflow-y-auto space-y-0.5">
                    {staff.filter((s) => s.active).map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          setSlotStaffId(p.id);
                          setStaffDropdownOpen(false);
                        }}
                        className={`w-full flex items-center gap-2 p-2 rounded-lg text-left transition cursor-pointer ${
                          slotStaffId === p.id ? "bg-primary/10 text-primary font-bold" : "hover:bg-slate-50 dark:hover:bg-slate-800"
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

            {/* ROW 3: FECHA Y HORA (COMPACT BAR) */}
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Fecha y Horario
              </label>
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/70 dark:bg-slate-800/40 p-2.5">
                {/* Date Navigator */}
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => stepSlotDate(-1)}
                    className="p-1 rounded-lg border border-slate-200 dark:border-white/10 hover:bg-white dark:hover:bg-slate-700 transition cursor-pointer"
                    title="Día anterior"
                  >
                    <ChevronLeft className="h-3.5 w-3.5 text-slate-600 dark:text-slate-300" />
                  </button>
                  <span className="font-bold text-slate-900 dark:text-white capitalize text-xs px-1">
                    {formattedSlotDate}
                  </span>
                  <button
                    type="button"
                    onClick={() => stepSlotDate(1)}
                    className="p-1 rounded-lg border border-slate-200 dark:border-white/10 hover:bg-white dark:hover:bg-slate-700 transition cursor-pointer"
                    title="Día siguiente"
                  >
                    <ChevronRight className="h-3.5 w-3.5 text-slate-600 dark:text-slate-300" />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setSlotDate(formatInTimeZone(new Date(), business.timezone || "America/Asuncion", "yyyy-MM-dd"))
                    }
                    className="text-[10.5px] font-bold text-primary hover:underline px-1.5 py-0.5 rounded hover:bg-primary/10 transition cursor-pointer"
                  >
                    Hoy
                  </button>
                </div>

                {/* Time display & Stepper */}
                <div className="flex items-center gap-1.5 relative">
                  <button
                    type="button"
                    onClick={() => setSlotTime((prev) => stepTime(prev, -15))}
                    className="px-2 py-1 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 text-[10.5px] font-bold text-slate-700 dark:text-slate-300 hover:border-primary transition cursor-pointer"
                  >
                    -15m
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setTimeDropdownOpen(!timeDropdownOpen);
                      setServiceDropdownOpen(false);
                      setStaffDropdownOpen(false);
                      setCountryDropdownOpen(false);
                    }}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 font-mono font-black text-xs text-slate-900 dark:text-white hover:border-primary transition cursor-pointer shadow-xs"
                  >
                    <Clock className="h-3 w-3 text-primary" />
                    <span>{slotTime} hs</span>
                    <ChevronDown className="h-3 w-3 text-slate-400 ml-0.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setSlotTime((prev) => stepTime(prev, 15))}
                    className="px-2 py-1 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 text-[10.5px] font-bold text-slate-700 dark:text-slate-300 hover:border-primary transition cursor-pointer"
                  >
                    +15m
                  </button>

                  <span className="text-[11px] text-slate-400 hidden sm:inline">
                    hasta <strong>{appointmentEndTime} hs</strong>
                  </span>

                  {/* Time dropdown popover: opens UPWARD so it stays inside modal */}
                  {timeDropdownOpen && (
                    <div className="absolute right-0 bottom-full mb-1.5 z-40 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 shadow-2xl p-2 w-52 max-h-48 overflow-y-auto grid grid-cols-2 gap-1.5">
                      {APPOINTMENT_TIME_SLOTS.map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => {
                            setSlotTime(t);
                            setTimeDropdownOpen(false);
                          }}
                          className={`py-1.5 px-2 rounded-lg text-center font-mono text-[11px] font-bold transition cursor-pointer ${
                            slotTime === t
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

            {/* ROW 4: MÉTODO DE PAGO */}
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Método de Pago
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { id: "efectivo" as const, label: "Efectivo", icon: Banknote },
                  { id: "sipap" as const, label: "SIPAP", icon: Landmark },
                  { id: "pos_bancard" as const, label: "POS", icon: CreditCard },
                  { id: "billetera_py" as const, label: "Billetera", icon: Smartphone },
                ].map(({ id, label, icon: Icon }) => {
                  const isSelected = paymentMethod === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setPaymentMethod(id)}
                      className={`flex items-center justify-center gap-1.5 rounded-xl border py-2 px-2 text-xs font-bold transition cursor-pointer ${
                        isSelected
                          ? "border-primary bg-primary text-white shadow-xs"
                          : "border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:border-slate-300"
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      <span>{label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* FOOTER ACTIONS & TOTAL */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-white/10">
              <div>
                <span className="text-[10.5px] text-slate-400 block font-medium">Total:</span>
                <span className="text-sm font-black text-primary">
                  {formatGs(currentService?.price || 0)}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl border border-slate-200 dark:border-white/10 px-3.5 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !clientName.trim()}
                  className="rounded-xl bg-primary px-5 py-2 text-xs font-bold text-white shadow-md shadow-primary/25 hover:opacity-95 disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? "Guardando..." : "Confirmar Turno"}
                </button>
              </div>
            </div>
          </form>
        ) : (
          <form onSubmit={handleCreateBlock} className="space-y-3.5">
            <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-2.5 text-[11px] text-amber-800 dark:text-amber-300 flex items-center gap-2">
              <Ban className="h-4 w-4 shrink-0 text-amber-600" />
              <span>Impide que se agenden turnos en este intervalo de tiempo.</span>
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Profesional Afectado
              </label>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => setBlockStaffId("all")}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition cursor-pointer ${
                    blockStaffId === "all"
                      ? "border-amber-500 bg-amber-500 text-white shadow-xs"
                      : "border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300"
                  }`}
                >
                  Todo el salón
                </button>
                {staff.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setBlockStaffId(p.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition cursor-pointer ${
                      blockStaffId === p.id
                        ? "border-amber-500 bg-amber-500 text-white shadow-xs"
                        : "border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    <span
                      className="flex h-4 w-4 items-center justify-center rounded-full text-[8px] font-bold text-white"
                      style={{ background: p.color }}
                    >
                      {p.avatar}
                    </span>
                    <span>{p.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Hora Inicio
                </label>
                <div className="relative">
                  <Clock className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                  <input
                    type="time"
                    value={blockStart}
                    onChange={(e) => setBlockStart(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 pl-9 pr-3 py-2 text-xs font-mono font-bold text-slate-900 dark:text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Hora Fin
                </label>
                <div className="relative">
                  <Clock className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                  <input
                    type="time"
                    value={blockEnd}
                    onChange={(e) => setBlockEnd(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 pl-9 pr-3 py-2 text-xs font-mono font-bold text-slate-900 dark:text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Motivo del Bloqueo
              </label>
              <input
                type="text"
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
                placeholder="Ej. Almuerzo, Trámite bancario, Feriado..."
                className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-900 dark:text-white focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-white/10">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-slate-200 dark:border-white/10 px-3.5 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-xl bg-amber-500 px-5 py-2 text-xs font-bold text-white shadow-md shadow-amber-500/25 hover:bg-amber-600 disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? "Guardando..." : "Confirmar Bloqueo"}
              </button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
}
