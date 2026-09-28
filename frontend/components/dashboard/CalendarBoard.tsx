"use client";

import { useMemo, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Plus,
  Calendar as CalendarIcon,
  Clock,
  User,
  Scissors,
  MessageCircle,
  Mail,
  CheckCircle2,
  AlertCircle,
  X,
  Phone,
  Trash2,
  CalendarDays,
  Ban,
  DollarSign,
  Users,
  Search,
  Check,
  Sparkles,
  Banknote,
  Landmark,
  CreditCard,
  Smartphone,
  UserPlus,
} from "lucide-react";
import { format, parseISO, addMinutes, setHours, setMinutes } from "date-fns";
import { es } from "date-fns/locale";
import { formatInTimeZone } from "date-fns-tz";
import { useDashboardStore } from "@/store/useDashboardStore";
import type { Appointment, PaymentMethod, AppointmentStatus } from "@/lib/dashboard-types";
import { addDaysIso, phoneWa, formatGs, normalizeParaguayPhone } from "@/lib/dashboard-dates";
import Modal from "./ui/Modal";
import Card from "./ui/Card";

const START_HOUR = 8;
const END_HOUR = 20;
const HOUR_PX = 56;

const APPOINTMENT_TIME_SLOTS = [
  "08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30",
  "16:00", "16:30", "17:00", "17:30", "18:00", "18:30", "19:00", "19:30",
];

const BLOCK_DURATION_PRESETS = [
  { label: "30 min", minutes: 30 },
  { label: "1 hora", minutes: 60 },
  { label: "1h 30m", minutes: 90 },
  { label: "2 horas", minutes: 120 },
  { label: "Medio día (4h)", minutes: 240 },
];

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

function formatPhoneInput(val: string, country: CountryOption): string {
  let digits = val.replace(/\D/g, "");
  if (!digits) return "";

  if (country.code === "PY") {
    // If pasted with 595, strip it
    if (digits.startsWith("595")) {
      digits = digits.slice(3);
    }
    // Limit to 10 digits max
    if (digits.length > 10) {
      digits = digits.slice(0, 10);
    }
    // Format nicely
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

  // Other countries: clamp to maxDigits
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

function validateRealPhone(rawPhone: string, country: CountryOption): boolean {
  if (!rawPhone) return false;
  const digits = rawPhone.replace(/\D/g, "");
  if (!digits) return false;

  if (country.code === "PY") {
    let core = digits;
    if (core.startsWith("595")) core = core.slice(3);
    if (core.startsWith("0")) core = core.slice(1);
    // Paraguay mobile operators use 96, 97, 98, 99 and have 9 digits total
    return core.length === 9 && /^9[6-9]\d{7}$/.test(core);
  }

  return digits.length >= country.minDigits && digits.length <= country.maxDigits;
}

export default function CalendarBoard() {
  const appointments = useDashboardStore((s) => s.appointments);
  const staff = useDashboardStore((s) => s.staff);
  const services = useDashboardStore((s) => s.services);
  const clients = useDashboardStore((s) => s.clients);
  const blocks = useDashboardStore((s) => s.blocks);
  const business = useDashboardStore((s) => s.business);
  const calendarDate = useDashboardStore((s) => s.calendarDate);
  const calendarView = useDashboardStore((s) => s.calendarView);
  const selectedStaffId = useDashboardStore((s) => s.selectedStaffId);
  const setCalendarDate = useDashboardStore((s) => s.setCalendarDate);
  const setCalendarView = useDashboardStore((s) => s.setCalendarView);
  const setSelectedStaffId = useDashboardStore((s) => s.setSelectedStaffId);
  const cancelAppointment = useDashboardStore((s) => s.cancelAppointment);
  const updateAppointment = useDashboardStore((s) => s.updateAppointment);
  const addAppointment = useDashboardStore((s) => s.addAppointment);
  const addBlock = useDashboardStore((s) => s.addBlock);
  const addCashMovement = useDashboardStore((s) => s.addCashMovement);
  const cashMovements = useDashboardStore((s) => s.cashMovements);
  const currentUserRole = useDashboardStore((s) => s.currentUserRole);
  const currentStaffId = useDashboardStore((s) => s.currentStaffId);
  const pushToast = useDashboardStore((s) => s.pushToast);
  const timezoneNote = useDashboardStore((s) => s.timezoneNote);

  // If user is a professional (barbero / estilista), enforce viewing their own agenda
  useEffect(() => {
    if (
      (currentUserRole === "barbero" || currentUserRole === "estilista") &&
      currentStaffId &&
      selectedStaffId !== currentStaffId
    ) {
      setSelectedStaffId(currentStaffId);
    }
  }, [currentUserRole, currentStaffId, selectedStaffId, setSelectedStaffId]);

  // Selected appointment for Editing / Rescheduling modal
  const [selectedApp, setSelectedApp] = useState<Appointment | null>(null);

  // Quick New Appointment & Block modal state
  const [newModalOpen, setNewModalOpen] = useState(false);
  const [newModalMode, setNewModalMode] = useState<"appointment" | "block">("appointment");
  const [isSubmittingQuick, setIsSubmittingQuick] = useState(false);
  const [newSlotData, setNewSlotData] = useState<{
    date: string;
    time: string;
    staffId: string;
  }>({
    date: calendarDate,
    time: "10:00",
    staffId: staff[0]?.id || "",
  });

  const [newClientName, setNewClientName] = useState("");
  const [newClientPhone, setNewClientPhone] = useState("");
  const [newClientId, setNewClientId] = useState<string | null>(null);
  const [selectedCountryCode, setSelectedCountryCode] = useState("PY");
  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);
  const [countrySearchQuery, setCountrySearchQuery] = useState("");

  const [serviceDropdownOpen, setServiceDropdownOpen] = useState(false);
  const [staffDropdownOpen, setStaffDropdownOpen] = useState(false);
  const [timeDropdownOpen, setTimeDropdownOpen] = useState(false);

  const [newServiceId, setNewServiceId] = useState(services[0]?.id || "");
  const [newPaymentMethod, setNewPaymentMethod] = useState<PaymentMethod>("efectivo");

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
    return validateRealPhone(newClientPhone, activeCountry);
  }, [newClientPhone, activeCountry]);

  // Close dropdowns on modal close
  useEffect(() => {
    if (!newModalOpen) {
      setServiceDropdownOpen(false);
      setStaffDropdownOpen(false);
      setTimeDropdownOpen(false);
      setCountryDropdownOpen(false);
      setCountrySearchQuery("");
    }
  }, [newModalOpen]);

  // Schedule Block Modal State
  const [blockModalOpen, setBlockModalOpen] = useState(false);
  const [blockStaffId, setBlockStaffId] = useState<string>("all");
  const [blockDate, setBlockDate] = useState(calendarDate);
  const [blockStart, setBlockStart] = useState("13:00");
  const [blockEnd, setBlockEnd] = useState("14:00");
  const [blockReason, setBlockReason] = useState("Almuerzo / Descanso");

  // Sync blockModalOpen if called externally
  useEffect(() => {
    if (blockModalOpen) {
      setNewModalMode("block");
      setNewModalOpen(true);
      setBlockModalOpen(false);
    }
  }, [blockModalOpen]);

  // Time manipulation helper
  function stepTime(current: string, deltaMinutes: number): string {
    const [h, m] = current.split(":").map(Number);
    const totalMinutes = (isNaN(h) ? 10 : h) * 60 + (isNaN(m) ? 0 : m) + deltaMinutes;
    const clamped = Math.max(0, Math.min(23 * 60 + 45, totalMinutes));
    const nh = String(Math.floor(clamped / 60)).padStart(2, "0");
    const nm = String(clamped % 60).padStart(2, "0");
    return `${nh}:${nm}`;
  }

  // Current selected service & calculated appointment end time
  const currentService = useMemo(() => {
    return services.find((s) => s.id === newServiceId) || services[0];
  }, [services, newServiceId]);

  const appointmentEndTime = useMemo(() => {
    if (!newSlotData.time || !currentService) return "";
    return stepTime(newSlotData.time, currentService.durationMin || 45);
  }, [newSlotData.time, currentService]);

  // Matching clients for autocomplete
  const matchingClients = useMemo(() => {
    if (!newClientName.trim() || newClientId) return [];
    const q = newClientName.toLowerCase().trim();
    return clients.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.phone && c.phone.includes(q))
    ).slice(0, 4);
  }, [clients, newClientName, newClientId]);

  // Date steppers
  function stepSlotDate(days: number) {
    setNewSlotData((prev) => ({
      ...prev,
      date: addDaysIso(prev.date, days),
    }));
  }

  function stepBlockDate(days: number) {
    setBlockDate((prev) => addDaysIso(prev, days));
  }

  const formattedSlotDate = useMemo(() => {
    try {
      return format(parseISO(`${newSlotData.date}T12:00:00`), "EEEE d 'de' MMMM", { locale: es });
    } catch {
      return newSlotData.date;
    }
  }, [newSlotData.date]);

  const formattedBlockDate = useMemo(() => {
    try {
      return format(parseISO(`${blockDate}T12:00:00`), "EEEE d 'de' MMMM", { locale: es });
    } catch {
      return blockDate;
    }
  }, [blockDate]);

  function handleSelectClient(c: { id: string; name: string; phone?: string }) {
    setNewClientId(c.id);
    setNewClientName(c.name);
    if (c.phone) {
      const raw = c.phone.trim();
      const matched = COUNTRY_LIST.find((cntry) => raw.startsWith(cntry.dialCode));
      if (matched) {
        setSelectedCountryCode(matched.code);
        setNewClientPhone(formatPhoneInput(raw.slice(matched.dialCode.length).trim(), matched));
      } else {
        setSelectedCountryCode("PY");
        setNewClientPhone(formatPhoneInput(raw.replace(/^\+?595\s*/, ""), COUNTRY_LIST[0]));
      }
    } else {
      setNewClientPhone("");
    }
  }

  function handleCreateNewClientFromQuery(name: string) {
    const cleanName = name.trim();
    setNewClientId(null);
    setNewClientName(cleanName);
  }

  function handleClearClient() {
    setNewClientId(null);
    setNewClientName("");
    setNewClientPhone("");
    setSelectedCountryCode("PY");
  }

  // Query parameter handling for "Ver en agenda" and "Nueva cita desde cliente"
  const searchParams = useSearchParams();
  const queryAppointmentId = searchParams?.get("appointmentId");
  const queryNewForClient = searchParams?.get("newForClient");

  useEffect(() => {
    if (queryAppointmentId && appointments.length > 0) {
      const match = appointments.find((a) => a.id === queryAppointmentId);
      if (match) {
        const tz = business.timezone || "America/Asuncion";
        const aptDate = formatInTimeZone(match.start, tz, "yyyy-MM-dd");
        setCalendarDate(aptDate);
        setSelectedApp(match);
      }
    }
  }, [queryAppointmentId, appointments, business.timezone, setCalendarDate]);

  useEffect(() => {
    if (queryNewForClient) {
      // 1. Intentar resolver el cliente desde el store local de Zustand
      const match = clients.find((c) => c.id === queryNewForClient);
      if (match) {
        setNewClientId(match.id);
        setNewClientName(match.name);
        if (match.phone) {
          const raw = match.phone.trim();
          const matched = COUNTRY_LIST.find((cntry) => raw.startsWith(cntry.dialCode));
          if (matched) {
            setSelectedCountryCode(matched.code);
            setNewClientPhone(formatPhoneInput(raw.slice(matched.dialCode.length).trim(), matched));
          } else {
            setSelectedCountryCode("PY");
            setNewClientPhone(formatPhoneInput(raw.replace(/^\+?595\s*/, ""), COUNTRY_LIST[0]));
          }
        } else {
          setNewClientPhone("");
        }
        setNewModalMode("appointment");
        setNewModalOpen(true);
      } else if (queryNewForClient.length > 10) {
        // 2. Si aún no está en store (ej: navegación directa), consultar API autenticada sin PII en URL
        fetch(`/api/clients/${queryNewForClient}`)
          .then((r) => r.json())
          .then((d) => {
            if (d.ok && d.client) {
              setNewClientId(d.client.id);
              setNewClientName(d.client.name);
              if (d.client.phone) {
                const raw = d.client.phone.trim();
                const matched = COUNTRY_LIST.find((cntry) => raw.startsWith(cntry.dialCode));
                if (matched) {
                  setSelectedCountryCode(matched.code);
                  setNewClientPhone(formatPhoneInput(raw.slice(matched.dialCode.length).trim(), matched));
                } else {
                  setSelectedCountryCode("PY");
                  setNewClientPhone(formatPhoneInput(raw.replace(/^\+?595\s*/, ""), COUNTRY_LIST[0]));
                }
              } else {
                setNewClientPhone("");
              }
              setNewModalMode("appointment");
              setNewModalOpen(true);
            }
          })
          .catch(() => {});
      }
    }
  }, [queryNewForClient, clients]);

  // Filtered appointments
  const filtered = appointments.filter((item) => {
    if (item.status === "cancelled") return false;
    if (selectedStaffId !== "all" && item.staffId !== selectedStaffId) return false;
    return true;
  });

  const label = format(parseISO(`${calendarDate}T12:00:00`), "EEEE d 'de' MMMM, yyyy", {
    locale: es,
  });

  // Open Quick Booking/Block modal pre-filling slot
  function handleEmptySlotClick(dateStr: string, hour: number, staffId: string) {
    const timeStr = `${String(hour).padStart(2, "0")}:00`;
    const endH = hour + 1 <= 23 ? hour + 1 : 23;
    const endTimeStr = `${String(endH).padStart(2, "0")}:00`;

    setNewSlotData({
      date: dateStr,
      time: timeStr,
      staffId: staffId || staff[0]?.id || "",
    });
    setNewClientId(null);
    setNewClientName("");
    setNewClientPhone("");
    setSelectedCountryCode("PY");
    setCountryDropdownOpen(false);
    setCountrySearchQuery("");
    setNewServiceId(services[0]?.id || "");
    setBlockDate(dateStr);
    setBlockStart(timeStr);
    setBlockEnd(endTimeStr);
    setBlockStaffId(staffId || "all");
    setBlockReason("Almuerzo / Descanso");
    setNewModalMode("appointment");
    setNewModalOpen(true);
  }

  async function handleCreateBlock(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmittingQuick(true);
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
        setBlockModalOpen(false);
        setNewModalOpen(false);
      }
    } finally {
      setIsSubmittingQuick(false);
    }
  }

  // Handle Quick Create Appointment submit
  async function handleCreateAppointment(e: React.FormEvent) {
    e.preventDefault();
    if (!newClientName.trim()) {
      pushToast("error", "Por favor ingresá el nombre del cliente");
      return;
    }

    const service = services.find((s) => s.id === newServiceId) || services[0];
    const duration = service?.durationMin || 45;

    const startDateTime = parseISO(`${newSlotData.date}T${newSlotData.time}:00`);
    const endDateTime = addMinutes(startDateTime, duration);

    let normPhone = "";
    if (activeCountry.code === "PY") {
      normPhone = normalizeParaguayPhone(newClientPhone.trim() || "+595981000000");
    } else {
      const cleanDigits = newClientPhone.replace(/\D/g, "");
      normPhone = cleanDigits ? `${activeCountry.dialCode}${cleanDigits}` : `${activeCountry.dialCode}0000000`;
    }

    const newApp: Appointment = {
      id: `app-${Date.now()}`,
      clientId: newClientId || undefined,
      clientName: newClientName.trim(),
      clientPhone: normPhone,
      clientEmail: `${newClientName.toLowerCase().replace(/\s+/g, ".")}@gmail.com`,
      serviceId: service.id,
      staffId: newSlotData.staffId || staff[0]?.id || "",
      start: startDateTime.toISOString(),
      end: endDateTime.toISOString(),
      paymentMethod: newPaymentMethod,
      status: "confirmed",
    };

    setIsSubmittingQuick(true);
    try {
      const res = await addAppointment(newApp);
      if (res) {
        pushToast("success", `Turno agendado con éxito para ${newClientName}`);
        setNewModalOpen(false);
      }
    } finally {
      setIsSubmittingQuick(false);
    }
  }

  return (
    <div className="space-y-4">
      <p className="sr-only">{timezoneNote}</p>

      {/* Google Calendar-Style Top Command Toolbar */}
      <div
        data-tour="calendar-header"
        className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between border-b border-slate-200/80 dark:border-white/10 pb-4"
      >
        {/* Left: + Create Button & Date Navigators */}
        <div className="flex flex-wrap items-center gap-2">
          {/* "+ Crear Cita" Pill Button */}
          <button
            type="button"
            data-tour="calendar-create-btn"
            onClick={() => {
              setNewSlotData({
                date: calendarDate,
                time: "10:00",
                staffId: selectedStaffId !== "all" ? selectedStaffId : staff[0]?.id || "",
              });
              setNewClientId(null);
              setNewClientName("");
              setNewClientPhone("");
              setSelectedCountryCode("PY");
              setCountryDropdownOpen(false);
              setCountrySearchQuery("");
              setNewServiceId(services[0]?.id || "");
              setNewModalMode("appointment");
              setNewModalOpen(true);
            }}
            className="inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-2 text-xs font-bold text-white shadow-md shadow-primary/25 hover:opacity-95 transition cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Crear Cita</span>
          </button>

          {/* "+ Bloquear Horario" Button */}
          <button
            type="button"
            data-tour="calendar-block-btn"
            onClick={() => {
              setBlockStaffId(selectedStaffId !== "all" ? selectedStaffId : "all");
              setBlockDate(calendarDate);
              setBlockStart("13:00");
              setBlockEnd("14:00");
              setBlockReason("Almuerzo / Descanso");
              setNewModalMode("block");
              setNewModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:border-amber-500 hover:text-amber-600 transition cursor-pointer"
          >
            <Ban className="h-4 w-4 text-amber-500" />
            <span>Bloquear Horario</span>
          </button>

          {/* Hoy button */}
          <button
            type="button"
            className="rounded-xl border border-slate-200/80 dark:border-white/10 px-3.5 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            onClick={() =>
              setCalendarDate(
                formatInTimeZone(new Date(), business.timezone || "America/Asuncion", "yyyy-MM-dd")
              )
            }
          >
            Hoy
          </button>

          {/* Navigation Arrows */}
          <div className="flex items-center">
            <button
              type="button"
              className="rounded-xl p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              onClick={() => setCalendarDate(addDaysIso(calendarDate, calendarView === "semana" ? -7 : -1))}
              aria-label="Anterior"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              className="rounded-xl p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              onClick={() => setCalendarDate(addDaysIso(calendarDate, calendarView === "semana" ? 7 : 1))}
              aria-label="Siguiente"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Current Date Label */}
          <h1 className="text-base font-black capitalize text-slate-900 dark:text-white sm:text-lg">
            {label}
          </h1>
        </div>

        {/* Right: View Switcher (Día / Semana / Mes) */}
        <div className="flex items-center gap-2">
          <div className="flex rounded-2xl border border-slate-200/80 dark:border-white/10 p-1 bg-white/80 dark:bg-slate-900/80 shadow-xs">
            {(["dia", "semana", "mes"] as const).map((view) => (
              <button
                key={view}
                type="button"
                onClick={() => setCalendarView(view)}
                className={`rounded-xl px-3.5 py-1.5 text-xs font-bold capitalize transition cursor-pointer ${
                  calendarView === view
                    ? "bg-primary text-white shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {view === "dia" ? "Día" : view === "semana" ? "Semana" : "Mes"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Staff Filter Bar with Avatars */}
      {currentUserRole === "admin" || currentUserRole === "cajero" ? (
        <div
          data-tour="calendar-staff-filter"
          className="flex items-center gap-2 overflow-x-auto pb-1"
        >
          <button
            type="button"
            onClick={() => setSelectedStaffId("all")}
            className={`rounded-2xl border px-3 py-1.5 text-xs font-bold transition shrink-0 cursor-pointer ${
              selectedStaffId === "all"
                ? "border-primary bg-primary/10 text-primary shadow-xs"
                : "border-slate-200/80 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
            }`}
          >
            Todo el equipo ({staff.length})
          </button>
          {staff.map((person) => (
            <button
              key={person.id}
              type="button"
              onClick={() => setSelectedStaffId(person.id)}
              className={`flex items-center gap-2 rounded-2xl border px-3 py-1.5 text-xs transition shrink-0 cursor-pointer ${
                selectedStaffId === person.id
                  ? "border-primary bg-primary/10 font-bold text-primary shadow-xs"
                  : "border-slate-200/80 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
            >
              <span
                className="flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-bold text-white shadow-xs"
                style={{ background: person.color }}
              >
                {person.avatar}
              </span>
              <span>{person.name.split(" ")[0]}</span>
            </button>
          ))}
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <span className="rounded-xl bg-primary/10 text-primary font-bold px-3 py-1 text-xs">
            Vista individual: {staff.find((s) => s.id === currentStaffId)?.name || "Mi Agenda"}
          </span>
        </div>
      )}

      {/* Main Calendar View Displays */}
      <div
        data-tour="calendar-grid"
        className="rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm overflow-hidden p-1 shadow-xs"
      >
        {calendarView === "dia" && (
          <GoogleCalendarDayView
            date={calendarDate}
            timezone={business.timezone}
            appointments={filtered}
            staffList={selectedStaffId === "all" ? staff : staff.filter((s) => s.id === selectedStaffId)}
            onSelectAppointment={setSelectedApp}
            onEmptySlotClick={handleEmptySlotClick}
          />
        )}

        {calendarView === "semana" && (
          <GoogleCalendarWeekView
            date={calendarDate}
            timezone={business.timezone}
            appointments={filtered}
            onSelectAppointment={setSelectedApp}
            onEmptySlotClick={handleEmptySlotClick}
          />
        )}

        {calendarView === "mes" && (
          <GoogleCalendarMonthView
            date={calendarDate}
            timezone={business.timezone}
            appointments={filtered}
            onSelectAppointment={setSelectedApp}
            onEmptySlotClick={handleEmptySlotClick}
          />
        )}
      </div>

      {/* Rich Reschedule & Edit Appointment Modal */}
      {selectedApp && (
        <RescheduleEditModal
          appointment={selectedApp}
          staff={staff}
          services={services}
          timezone={business.timezone}
          businessName={business.name}
          cashMovements={cashMovements}
          onClose={() => setSelectedApp(null)}
          onUpdate={async (patch) => {
            const ok = await updateAppointment(selectedApp.id, patch);
            if (ok) {
              setSelectedApp(null);
              pushToast("success", "Cita reprogramada y actualizada correctamente");
            }
          }}
          onCancel={async () => {
            const ok = await cancelAppointment(selectedApp.id);
            if (ok) {
              setSelectedApp(null);
              pushToast("success", "Cita cancelada con éxito");
            }
          }}
          onCharge={async (amount, method) => {
            const assignedService = services.find((s) => s.id === selectedApp.serviceId);
            const ok = await addCashMovement({
              type: "ingreso",
              amount,
              method: method as any,
              concept: `Cobro turno: ${assignedService?.name || "Servicio"} - ${selectedApp.clientName}`,
              category: "Servicios",
              date: new Date().toISOString(),
              appointmentId: selectedApp.id,
            });
            if (ok) {
              await updateAppointment(selectedApp.id, { status: "completed" });
              setSelectedApp(null);
              pushToast("success", `Cobro de ${formatGs(amount)} registrado en caja y turno completado.`);
              return true;
            }
            return false;
          }}
        />
      )}

      {/* Quick Booking & Schedule Block Custom Modal */}
      <Modal
        id="quickBookingModal"
        maxWidth="max-w-lg"
        open={newModalOpen}
        title={newModalMode === "appointment" ? "Agendar Turno" : "Bloquear Horario"}
        onClose={() => setNewModalOpen(false)}
      >
        <div className="space-y-4 text-xs">
          {/* Segmented Switch: Agendar Cita vs Bloquear Horario */}
          <div className="flex rounded-2xl bg-slate-100 dark:bg-slate-800 p-1">
            <button
              type="button"
              onClick={() => setNewModalMode("appointment")}
              className={`flex-1 py-1.5 rounded-xl font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer ${
                newModalMode === "appointment"
                  ? "bg-white dark:bg-slate-900 text-primary shadow-xs ring-1 ring-slate-200/50 dark:ring-white/10"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Agendar Turno</span>
            </button>
            <button
              type="button"
              onClick={() => setNewModalMode("block")}
              className={`flex-1 py-1.5 rounded-xl font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer ${
                newModalMode === "block"
                  ? "bg-white dark:bg-slate-900 text-amber-600 shadow-xs ring-1 ring-slate-200/50 dark:ring-white/10"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Ban className="h-3.5 w-3.5 text-amber-500" />
              <span>Bloquear Horario</span>
            </button>
          </div>

          {newModalMode === "appointment" ? (
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
                      value={newClientName}
                      onChange={(e) => {
                        setNewClientName(e.target.value);
                        setNewClientId(null);
                      }}
                      className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-primary focus:outline-none"
                    />
                  </div>

                  {/* Autocomplete suggestions popover ONLY if matches found and typing */}
                  {matchingClients.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 z-30 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 shadow-xl p-1 space-y-0.5 max-h-40 overflow-y-auto">
                      <span className="text-[10px] text-slate-400 px-2 py-0.5 block font-medium">Sugerencias:</span>
                      {matchingClients.map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => {
                            setNewClientId(c.id);
                            setNewClientName(c.name);
                            setNewClientPhone(c.phone || "");
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
                                  setNewClientPhone((prev) => formatPhoneInput(prev, c));
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

                    {/* Phone Input with max digits and real-time formatting */}
                    <div className="relative flex-1">
                      <input
                        type="tel"
                        placeholder={activeCountry.placeholder}
                        value={newClientPhone}
                        onChange={(e) => setNewClientPhone(formatPhoneInput(e.target.value, activeCountry))}
                        className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-900 dark:text-white focus:border-primary focus:outline-none font-mono"
                      />
                    </div>
                  </div>

                  {/* Subtle Real Phone Validation Hint */}
                  {newClientPhone.trim().length > 0 && (
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
                            setNewServiceId(s.id);
                            setServiceDropdownOpen(false);
                          }}
                          className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition cursor-pointer ${
                            newServiceId === s.id ? "bg-primary/10 text-primary font-bold" : "hover:bg-slate-50 dark:hover:bg-slate-800"
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
                    }}
                    className="w-full flex items-center justify-between rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-left hover:border-slate-300 dark:hover:border-white/20 transition cursor-pointer"
                  >
                    {(() => {
                      const assigned = staff.find((s) => s.id === newSlotData.staffId) || staff[0];
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
                            setNewSlotData((prev) => ({ ...prev, staffId: p.id }));
                            setStaffDropdownOpen(false);
                          }}
                          className={`w-full flex items-center gap-2 p-2 rounded-lg text-left transition cursor-pointer ${
                            newSlotData.staffId === p.id ? "bg-primary/10 text-primary font-bold" : "hover:bg-slate-50 dark:hover:bg-slate-800"
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
                        setNewSlotData((prev) => ({
                          ...prev,
                          date: formatInTimeZone(new Date(), business.timezone || "America/Asuncion", "yyyy-MM-dd"),
                        }))
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
                      onClick={() => setNewSlotData((prev) => ({ ...prev, time: stepTime(prev.time, -15) }))}
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
                      }}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 font-mono font-black text-xs text-slate-900 dark:text-white hover:border-primary transition cursor-pointer shadow-xs"
                    >
                      <Clock className="h-3 w-3 text-primary" />
                      <span>{newSlotData.time} hs</span>
                      <ChevronDown className="h-3 w-3 text-slate-400 ml-0.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setNewSlotData((prev) => ({ ...prev, time: stepTime(prev.time, 15) }))}
                      className="px-2 py-1 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 text-[10.5px] font-bold text-slate-700 dark:text-slate-300 hover:border-primary transition cursor-pointer"
                    >
                      +15m
                    </button>

                    <span className="text-[11px] text-slate-400 hidden sm:inline">
                      hasta <strong>{appointmentEndTime} hs</strong>
                    </span>

                    {/* Time dropdown popover: opens upward within the modal */}
                    {timeDropdownOpen && (
                      <div className="absolute right-0 bottom-full mb-1.5 z-40 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 shadow-2xl p-2 w-52 max-h-48 overflow-y-auto grid grid-cols-2 gap-1.5">
                        {APPOINTMENT_TIME_SLOTS.map((t) => (
                          <button
                            key={t}
                            type="button"
                            onClick={() => {
                              setNewSlotData((prev) => ({ ...prev, time: t }));
                              setTimeDropdownOpen(false);
                            }}
                            className={`py-1.5 px-2 rounded-lg text-center font-mono text-[11px] font-bold transition cursor-pointer ${
                              newSlotData.time === t
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
                    const isSelected = newPaymentMethod === id;
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setNewPaymentMethod(id)}
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
                    onClick={() => setNewModalOpen(false)}
                    className="rounded-xl border border-slate-200 dark:border-white/10 px-3.5 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingQuick || !newClientName.trim()}
                    className="rounded-xl bg-primary px-5 py-2 text-xs font-bold text-white shadow-md shadow-primary/25 hover:opacity-95 disabled:opacity-50 cursor-pointer"
                  >
                    {isSubmittingQuick ? "Guardando..." : "Confirmar Turno"}
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

              {/* Profesional Afectado */}
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
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs transition cursor-pointer ${
                        blockStaffId === p.id
                          ? "border-amber-500 bg-amber-500 text-white font-bold shadow-xs"
                          : "border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      <span
                        className="flex h-4 w-4 items-center justify-center rounded-full text-[8px] font-bold text-white shrink-0"
                        style={{ background: p.color }}
                      >
                        {p.avatar}
                      </span>
                      <span>{p.name.split(" ")[0]}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Fecha y Rango Horario */}
              <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/70 dark:bg-slate-800/40 p-2.5 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => stepBlockDate(-1)}
                      className="p-1 rounded-lg border border-slate-200 dark:border-white/10 hover:bg-white dark:hover:bg-slate-700 transition cursor-pointer"
                    >
                      <ChevronLeft className="h-3.5 w-3.5 text-slate-600 dark:text-slate-300" />
                    </button>
                    <span className="font-bold text-slate-900 dark:text-white capitalize text-xs px-1">
                      {formattedBlockDate}
                    </span>
                    <button
                      type="button"
                      onClick={() => stepBlockDate(1)}
                      className="p-1 rounded-lg border border-slate-200 dark:border-white/10 hover:bg-white dark:hover:bg-slate-700 transition cursor-pointer"
                    >
                      <ChevronRight className="h-3.5 w-3.5 text-slate-600 dark:text-slate-300" />
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setBlockDate(formatInTimeZone(new Date(), business.timezone || "America/Asuncion", "yyyy-MM-dd"))
                    }
                    className="text-[10.5px] font-bold text-amber-600 hover:underline px-1.5 py-0.5 rounded hover:bg-amber-500/10 transition cursor-pointer"
                  >
                    Hoy
                  </button>
                </div>

                <div className="flex items-center justify-between border-t border-slate-200/60 dark:border-white/5 pt-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-500 text-[11px]">Desde:</span>
                    <button
                      type="button"
                      onClick={() => setBlockStart((prev) => stepTime(prev, -15))}
                      className="px-1.5 py-0.5 rounded border border-slate-200 dark:border-white/10 text-[10px] font-bold cursor-pointer"
                    >
                      -
                    </button>
                    <span className="font-mono font-black text-xs px-2 py-0.5 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-white/10">
                      {blockStart}
                    </span>
                    <button
                      type="button"
                      onClick={() => setBlockStart((prev) => stepTime(prev, 15))}
                      className="px-1.5 py-0.5 rounded border border-slate-200 dark:border-white/10 text-[10px] font-bold cursor-pointer"
                    >
                      +
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-500 text-[11px]">Hasta:</span>
                    <button
                      type="button"
                      onClick={() => setBlockEnd((prev) => stepTime(prev, -15))}
                      className="px-1.5 py-0.5 rounded border border-slate-200 dark:border-white/10 text-[10px] font-bold cursor-pointer"
                    >
                      -
                    </button>
                    <span className="font-mono font-black text-xs px-2 py-0.5 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-white/10">
                      {blockEnd}
                    </span>
                    <button
                      type="button"
                      onClick={() => setBlockEnd((prev) => stepTime(prev, 15))}
                      className="px-1.5 py-0.5 rounded border border-slate-200 dark:border-white/10 text-[10px] font-bold cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Motivo */}
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Motivo
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {["Almuerzo", "Reunión", "Trámite", "Cierre"].map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => setBlockReason(chip)}
                      className={`text-[11px] rounded-lg px-2.5 py-1 border transition cursor-pointer ${
                        blockReason === chip
                          ? "bg-amber-500 text-white border-amber-600 font-bold"
                          : "border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300"
                      }`}
                    >
                      {chip}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  required
                  placeholder="Ej: Almuerzo o capacitación"
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-900 dark:text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              {/* Footer */}
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setNewModalOpen(false)}
                  className="rounded-xl border border-slate-200 dark:border-white/10 px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingQuick}
                  className="rounded-xl bg-amber-600 hover:bg-amber-500 px-5 py-2 text-xs font-bold text-white shadow-md hover:opacity-95 disabled:opacity-50 cursor-pointer"
                >
                  {isSubmittingQuick ? "Guardando..." : "Guardar Bloqueo"}
                </button>
              </div>
            </form>
          )}
        </div>
      </Modal>
    </div>
  );
}

// ============================================================================
// Google Calendar Day View (Columns per Staff Member + Red Current Time Bar)
// ============================================================================
function GoogleCalendarDayView({
  date,
  timezone,
  appointments,
  staffList,
  onSelectAppointment,
  onEmptySlotClick,
}: {
  date: string;
  timezone: string;
  appointments: Appointment[];
  staffList: any[];
  onSelectAppointment: (app: Appointment) => void;
  onEmptySlotClick: (dateStr: string, hour: number, staffId: string) => void;
}) {
  const services = useDashboardStore((s) => s.services);
  const blocks = useDashboardStore((s) => s.blocks);
  const hours = Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => START_HOUR + i);

  // Current time position in minutes
  const now = new Date();
  const currentHours = now.getHours();
  const currentMinutes = now.getMinutes();
  const minutesFromStart = (currentHours - START_HOUR) * 60 + currentMinutes;
  const isToday =
    formatInTimeZone(now, timezone || "America/Asuncion", "yyyy-MM-dd") === date;
  const showRedIndicator = isToday && minutesFromStart >= 0 && minutesFromStart <= (END_HOUR - START_HOUR + 1) * 60;
  if (staffList.length === 0) {
    return (
      <Card className="p-12 text-center border border-slate-200/80 dark:border-white/10 rounded-3xl bg-white dark:bg-slate-900 shadow-sm">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-3">
          <Users className="h-6 w-6" />
        </div>
        <h3 className="font-bold text-slate-900 dark:text-white text-base">
          No hay profesionales en este filtro
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
          Seleccioná &quot;Todo el salón&quot; en el selector superior o administrá tus colaboradores desde la sección Equipo.
        </p>
      </Card>
    );
  }

  const redLineTop = (minutesFromStart / 60) * HOUR_PX;

  return (
    <Card className="p-0 border border-slate-200/80 dark:border-white/10 shadow-sm rounded-3xl bg-white dark:bg-slate-900/90 overflow-hidden">
      {/* Staff Columns Header */}
      <div className="flex border-b border-slate-200/80 dark:border-white/10 bg-slate-50/80 dark:bg-slate-950/60 sticky top-0 z-20">
        <div className="w-16 shrink-0 border-r border-slate-200/80 dark:border-white/10 p-2 text-center text-[10px] font-bold text-slate-400 sticky left-0 bg-slate-50 dark:bg-slate-950 z-30">
          HORA
        </div>
        <div className="flex-1 grid" style={{ gridTemplateColumns: `repeat(${staffList.length}, minmax(180px, 1fr))` }}>
          {staffList.map((person) => (
            <div
              key={person.id}
              className="flex items-center gap-2 p-3 border-r border-slate-200/80 dark:border-white/10 last:border-r-0"
            >
              <span
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white shadow-xs"
                style={{ background: person.color }}
              >
                {person.avatar}
              </span>
              <div className="truncate">
                <p className="font-bold text-xs text-slate-900 dark:text-white truncate">{person.name}</p>
                <p className="text-[10px] text-slate-400 truncate">{person.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Time Grid with Red Live Indicator */}
      <div className="relative overflow-x-auto">
        <div className="relative min-w-[700px]">
          {/* Live Red Time Indicator */}
          {showRedIndicator && (
            <div
              className="absolute left-0 right-0 z-30 flex items-center pointer-events-none transition-all duration-500"
              style={{ top: redLineTop }}
            >
              <div className="w-16 shrink-0 flex items-center justify-end pr-1 sticky left-0 z-20">
                <span className="rounded-full bg-rose-500 px-1.5 py-0.5 text-[9px] font-bold text-white font-mono shadow-xs">
                  {String(currentHours).padStart(2, "0")}:{String(currentMinutes).padStart(2, "0")}
                </span>
              </div>
              <span className="h-3 w-3 rounded-full bg-rose-500 shadow-sm -ml-1.5 ring-2 ring-white dark:ring-slate-900" />
              <div className="h-0.5 flex-1 bg-rose-500 shadow-xs" />
            </div>
          )}

          {/* Hourly Rows */}
          {hours.map((hour) => (
            <div
              key={hour}
              className="flex border-b border-slate-100 dark:border-white/5 relative"
              style={{ height: HOUR_PX }}
            >
              {/* Sticky Hour Label */}
              <div className="w-16 shrink-0 border-r border-slate-100 dark:border-white/10 px-2 pt-1 font-mono text-[11px] font-medium text-slate-400 dark:text-slate-500 text-right sticky left-0 bg-white/95 dark:bg-slate-900/95 z-10">
                {String(hour).padStart(2, "0")}:00
              </div>

              {/* Staff Column Slots for this hour */}
              <div
                className="flex-1 grid"
                style={{ gridTemplateColumns: `repeat(${staffList.length}, minmax(180px, 1fr))` }}
              >
                {staffList.map((person) => (
                  <button
                    key={`${hour}-${person.id}`}
                    type="button"
                    onClick={() => onEmptySlotClick(date, hour, person.id)}
                    className="border-r border-slate-100 dark:border-white/5 last:border-r-0 h-full w-full text-left p-1 group hover:bg-primary/[0.04] transition relative"
                    title={`Click para agendar o bloquear con ${person.name} a las ${hour}:00`}
                  >
                    <span className="opacity-0 group-hover:opacity-100 text-[10px] text-primary font-bold pl-2">
                      + Agendar
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ))}

          {/* Schedule Blocks absolute overlays */}
          {blocks
            .filter((b) => b.date === date)
            .map((b) => {
              const [startH, startM] = b.start.split(":").map(Number);
              const [endH, endM] = b.end.split(":").map(Number);
              const startMinutes = (startH - START_HOUR) * 60 + (startM || 0);
              const durationMinutes = Math.max(30, (endH * 60 + (endM || 0)) - startMinutes);
              if (startMinutes < 0 && startMinutes + durationMinutes <= 0) return null;

              const top = Math.max(0, (startMinutes / 60) * HOUR_PX);
              const height = Math.max(36, (durationMinutes / 60) * HOUR_PX - 2);

              const isAllStaff = !b.staffId || b.staffId === "all";
              const targetStaffIndex = staffList.findIndex((s) => s.id === b.staffId);
              if (!isAllStaff && targetStaffIndex === -1) return null;

              const colWidthPercent = 100 / staffList.length;
              const leftPercent = isAllStaff ? 0 : targetStaffIndex * colWidthPercent;
              const width = isAllStaff ? "calc(100% - 4.5rem)" : `calc(${colWidthPercent}% - 8px)`;
              const left = isAllStaff ? "4.25rem" : `calc(4rem + ${leftPercent}% + 4px)`;

              return (
                <div
                  key={b.id}
                  className="absolute z-15 overflow-hidden rounded-2xl p-2 text-left border border-amber-400/60 dark:border-amber-500/40 bg-amber-50/95 dark:bg-amber-950/80 shadow-xs flex flex-col justify-between"
                  style={{
                    top,
                    height,
                    left,
                    width,
                    borderLeftWidth: "4px",
                    borderLeftColor: "#f59e0b",
                    backgroundImage:
                      "repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(245, 158, 11, 0.08) 10px, rgba(245, 158, 11, 0.08) 20px)",
                  }}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="inline-flex items-center gap-1 font-black text-xs text-amber-900 dark:text-amber-200 truncate">
                      <Ban className="h-3 w-3 shrink-0 text-amber-600" />
                      {b.reason || "Bloqueo operativo"}
                    </span>
                    <span className="font-mono text-[10px] font-bold text-amber-700 dark:text-amber-400 shrink-0">
                      {b.start} - {b.end}
                    </span>
                  </div>
                  <span className="text-[10px] text-amber-800/80 dark:text-amber-300/80 font-medium truncate">
                    {isAllStaff ? "Todo el equipo" : staffList[targetStaffIndex]?.name}
                  </span>
                </div>
              );
            })}

          {/* Appointments absolute overlays in respective columns */}
          {staffList.map((person, staffColIndex) => {
            const personApps = appointments.filter(
              (item) =>
                item.staffId === person.id &&
                formatInTimeZone(item.start, timezone, "yyyy-MM-dd") === date
            );

            return personApps.map((item) => {
              const startH = Number(formatInTimeZone(item.start, timezone, "H"));
              const startM = Number(formatInTimeZone(item.start, timezone, "m"));
              const endH = Number(formatInTimeZone(item.end, timezone, "H"));
              const endM = Number(formatInTimeZone(item.end, timezone, "m"));

              const startMinutes = (startH - START_HOUR) * 60 + startM;
              const durationMinutes = Math.max(30, (endH * 60 + endM) - (startH * 60 + startM));

              if (startMinutes < 0 && startMinutes + durationMinutes <= 0) return null;

              const top = Math.max(0, (startMinutes / 60) * HOUR_PX);
              const height = Math.max(36, (durationMinutes / 60) * HOUR_PX - 2);

              const service = services.find((s) => s.id === item.serviceId);
              const colWidthPercent = 100 / staffList.length;
              const leftPercent = staffColIndex * colWidthPercent;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelectAppointment(item)}
                  className="group absolute z-10 overflow-hidden rounded-2xl p-2.5 text-left shadow-sm hover:shadow-md hover:scale-[1.01] transition-all duration-200 border text-slate-900 dark:text-white"
                  style={{
                    top,
                    height,
                    left: `calc(4rem + ${leftPercent}% + 4px)`,
                    width: `calc(${colWidthPercent}% - 8px)`,
                    backgroundColor: `${person.color}15`,
                    borderColor: `${person.color}40`,
                    borderLeftWidth: "4px",
                    borderLeftColor: person.color,
                  }}
                >
                  <div className="flex items-center justify-between gap-1">
                    <strong className="block truncate font-black text-xs text-slate-900 dark:text-white">
                      {item.clientName}
                    </strong>
                    <span className="font-mono text-[10px] font-bold text-slate-500 dark:text-slate-400">
                      {formatInTimeZone(item.start, timezone, "HH:mm")}
                    </span>
                  </div>
                  <p className="truncate text-[11px] font-medium text-slate-600 dark:text-slate-300">
                    {service?.name || "Servicio"} · {formatGs(service?.price || 0)}
                  </p>
                </button>
              );
            });
          })}
        </div>
      </div>
    </Card>
  );
}

// ============================================================================
// Google Calendar Week View (7 Days)
// ============================================================================
function GoogleCalendarWeekView({
  date,
  timezone,
  appointments,
  onSelectAppointment,
  onEmptySlotClick,
}: {
  date: string;
  timezone: string;
  appointments: Appointment[];
  onSelectAppointment: (app: Appointment) => void;
  onEmptySlotClick: (dateStr: string, hour: number, staffId: string) => void;
}) {
  const staff = useDashboardStore((s) => s.staff);
  const blocks = useDashboardStore((s) => s.blocks);
  const start = parseISO(`${date}T12:00:00`);
  const days = Array.from({ length: 7 }, (_, i) => addDaysIso(date, i - start.getDay()));
  const today = formatInTimeZone(new Date(), timezone, "yyyy-MM-dd");

  return (
    <div className="overflow-x-auto pb-2">
      <div className="grid min-w-[850px] grid-cols-7 gap-3">
        {days.map((day) => {
          const isToday = day === today;
          const isSelectedDay = day === date;
          const items = appointments.filter(
            (item) => formatInTimeZone(item.start, timezone, "yyyy-MM-dd") === day
          );
          const dayBlocks = blocks.filter((b) => b.date === day);

          return (
            <Card
              key={day}
              className={`rounded-3xl border p-3.5 min-h-[480px] flex flex-col transition-all duration-200 ${
                isToday
                  ? "border-primary/60 bg-primary/[0.03] shadow-md ring-1 ring-primary/20"
                  : isSelectedDay
                  ? "border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                  : "border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-slate-900/60"
              }`}
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/10 pb-2.5">
                <p
                  className={`text-xs font-black capitalize ${
                    isToday ? "text-primary" : "text-slate-800 dark:text-slate-200"
                  }`}
                >
                  {format(parseISO(`${day}T12:00:00`), "EEE d", { locale: es })}
                </p>
                <button
                  type="button"
                  onClick={() => onEmptySlotClick(day, 10, staff[0]?.id || "")}
                  className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-600 dark:text-slate-300 hover:bg-primary hover:text-white transition"
                  title="Nueva cita este día"
                >
                  +
                </button>
              </div>

              <div className="mt-3 flex-1 space-y-2 overflow-y-auto">
                {/* Visual Schedule Blocks in Day Card */}
                {dayBlocks.length > 0 && (
                  <div className="space-y-1 mb-2">
                    {dayBlocks.map((b) => (
                      <div
                        key={b.id}
                        className="rounded-xl border border-amber-300 dark:border-amber-700/60 bg-amber-50/90 dark:bg-amber-950/70 p-1.5 text-slate-800 dark:text-slate-200 shadow-2xs flex items-center justify-between gap-1"
                      >
                        <span className="flex items-center gap-1 font-bold text-[10px] text-amber-900 dark:text-amber-200 truncate">
                          <Ban className="h-3 w-3 shrink-0 text-amber-600" />
                          {b.reason || "Bloqueo"}
                        </span>
                        <span className="font-mono text-[9px] font-bold text-amber-700 dark:text-amber-400 shrink-0">
                          {b.start}-{b.end}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {items.length === 0 && dayBlocks.length === 0 ? (
                  <p className="pt-8 text-center text-[11px] text-slate-400 italic">
                    Sin citas
                  </p>
                ) : (
                  items.map((item) => {
                    const person = staff.find((s) => s.id === item.staffId);
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => onSelectAppointment(item)}
                        className="w-full rounded-2xl p-2.5 text-left text-xs shadow-2xs hover:shadow-md hover:scale-[1.02] transition-all block border group"
                        style={{
                          backgroundColor: `${person?.color || "#6366f1"}15`,
                          borderColor: `${person?.color || "#6366f1"}35`,
                          borderLeftWidth: "4px",
                          borderLeftColor: person?.color || "#6366f1",
                        }}
                      >
                        <div className="flex items-center justify-between text-[10.5px]">
                          <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                            {formatInTimeZone(item.start, timezone, "HH:mm")}
                          </span>
                          <span className="text-[9px] font-bold uppercase text-slate-500">
                            {item.status}
                          </span>
                        </div>
                        <p className="mt-1 truncate font-black text-slate-900 dark:text-white text-xs">
                          {item.clientName}
                        </p>
                        <p className="truncate text-[10px] text-slate-500">
                          {person?.name.split(" ")[0]}
                        </p>
                      </button>
                    );
                  })
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================================
// Google Calendar Month View
// ============================================================================
function GoogleCalendarMonthView({
  date,
  timezone,
  appointments,
  onSelectAppointment,
  onEmptySlotClick,
}: {
  date: string;
  timezone: string;
  appointments: Appointment[];
  onSelectAppointment: (app: Appointment) => void;
  onEmptySlotClick?: (dateStr: string, hour: number, staffId: string) => void;
}) {
  const parsed = parseISO(`${date}T12:00:00`);
  const year = parsed.getFullYear();
  const month = parsed.getMonth();
  const first = new Date(year, month, 1).getDay();
  const days = new Date(year, month + 1, 0).getDate();
  const cells = [
    ...Array.from({ length: first }, () => null),
    ...Array.from({ length: days }, (_, i) => i + 1),
  ];

  return (
    <Card className="p-3 border border-slate-200/80 dark:border-white/10 rounded-3xl bg-white dark:bg-slate-900/90 shadow-sm overflow-x-auto">
      <div className="grid min-w-[720px] grid-cols-7 gap-1 text-center text-xs font-bold text-slate-400 pb-2 border-b border-slate-100 dark:border-white/10">
        {["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"].map((d) => (
          <span key={d}>{d}</span>
        ))}
      </div>
      <div className="mt-2 grid min-w-[720px] grid-cols-7 gap-1.5">
        {cells.map((day, index) => {
          if (!day) return <div key={`empty-${index}`} className="min-h-24 rounded-2xl bg-slate-50/30 dark:bg-slate-950/20" />;
          const iso = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const items = appointments.filter(
            (item) => formatInTimeZone(item.start, timezone, "yyyy-MM-dd") === iso
          );
          const extra = items.length > 3 ? items.length - 3 : 0;

          return (
            <div
              key={iso}
              className="min-h-24 rounded-2xl border border-slate-100 dark:border-white/5 p-2 text-left bg-slate-50/50 dark:bg-slate-950/40 group hover:border-primary/30 transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{day}</span>
                  {onEmptySlotClick && (
                    <button
                      type="button"
                      onClick={() => onEmptySlotClick(iso, 10, "")}
                      className="opacity-0 group-hover:opacity-100 h-5 w-5 rounded-full bg-primary/10 hover:bg-primary text-primary hover:text-white flex items-center justify-center text-[10px] font-bold transition"
                      title="Agendar turno en este día"
                    >
                      +
                    </button>
                  )}
                </div>
                <div className="mt-1 space-y-1">
                {items.slice(0, 3).map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onSelectAppointment(item)}
                    className="w-full truncate rounded-lg bg-primary/10 border border-primary/20 px-1.5 py-0.5 text-[10px] font-semibold text-primary block text-left hover:bg-primary/20 transition"
                  >
                    {formatInTimeZone(item.start, timezone, "HH:mm")} {item.clientName}
                  </button>
                ))}
                {extra > 0 && (
                  <span className="block text-center rounded-md bg-slate-200 dark:bg-slate-800 text-[9px] font-bold text-slate-500 py-0.5">
                    +{extra} más
                  </span>
                )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

// ============================================================================
// Interactive "Editar / Reprogramar Cita" Modal Component
// ============================================================================
function RescheduleEditModal({
  appointment,
  staff,
  services,
  timezone,
  businessName,
  cashMovements,
  onClose,
  onUpdate,
  onCancel,
  onCharge,
}: {
  appointment: Appointment;
  staff: any[];
  services: any[];
  timezone: string;
  businessName: string;
  cashMovements?: any[];
  onClose: () => void;
  onUpdate: (patch: Partial<Appointment>) => void;
  onCancel: () => void;
  onCharge?: (amount: number, method: string) => Promise<boolean>;
}) {
  const currentStart = parseISO(appointment.start);
  const currentEnd = parseISO(appointment.end);

  const [date, setDate] = useState(formatInTimeZone(appointment.start, timezone, "yyyy-MM-dd"));
  const [time, setTime] = useState(formatInTimeZone(appointment.start, timezone, "HH:mm"));
  const [staffId, setStaffId] = useState(appointment.staffId);
  const [serviceId, setServiceId] = useState(appointment.serviceId);
  const [status, setStatus] = useState<AppointmentStatus>(appointment.status);

  // Status transitions state machine
  const allowedNextStatuses: { value: AppointmentStatus; label: string }[] = useMemo(() => {
    const current = appointment.status;
    if (current === "pending") {
      return [
        { value: "pending", label: "Pendiente de Aprobación" },
        { value: "confirmed", label: "Confirmada" },
        { value: "cancelled", label: "Cancelada" },
      ];
    }
    if (current === "confirmed") {
      return [
        { value: "confirmed", label: "Confirmada" },
        { value: "completed", label: "Completada / Atendida" },
        { value: "no_show", label: "No asistió / Ausente" },
        { value: "cancelled", label: "Cancelada" },
      ];
    }
    if (current === "completed") {
      return [{ value: "completed", label: "Completada / Atendida" }];
    }
    if (current === "cancelled") {
      return [
        { value: "cancelled", label: "Cancelada" },
        { value: "confirmed", label: "Reactivar Turno (Confirmada)" },
      ];
    }
    if (current === "no_show") {
      return [
        { value: "no_show", label: "No asistió / Ausente" },
        { value: "confirmed", label: "Reactivar Turno (Confirmada)" },
        { value: "cancelled", label: "Cancelada" },
      ];
    }
    return [{ value: current, label: String(current) }];
  }, [appointment.status]);

  // Direct checkout state
  const assignedPerson = staff.find((s) => s.id === staffId);
  const assignedService = services.find((s) => s.id === serviceId);
  const isAlreadyCharged = cashMovements?.some((m) => m.appointmentId === appointment.id);
  const [chargeAmount, setChargeAmount] = useState<number>(assignedService?.price || 0);
  const [chargeMethod, setChargeMethod] = useState<string>("efectivo");
  const [isCharging, setIsCharging] = useState(false);

  async function handleChargeNow() {
    if (isCharging || !onCharge) return;
    setIsCharging(true);
    try {
      await onCharge(chargeAmount, chargeMethod);
    } finally {
      setIsCharging(false);
    }
  }

  // Quick 1-tap reschedule helpers
  function addMinutesToAppointment(mins: number) {
    const newStart = addMinutes(parseISO(`${date}T${time}:00`), mins);
    setDate(format(newStart, "yyyy-MM-dd"));
    setTime(format(newStart, "HH:mm"));
  }

  function moveToTomorrow() {
    const nextDay = addDaysIso(date, 1);
    setDate(nextDay);
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const service = services.find((s) => s.id === serviceId) || services[0];
    const duration = service?.durationMin || 45;

    const startDateTime = parseISO(`${date}T${time}:00`);
    const endDateTime = addMinutes(startDateTime, duration);

    onUpdate({
      start: startDateTime.toISOString(),
      end: endDateTime.toISOString(),
      staffId,
      serviceId,
      status,
    });
  }

  // Pre-filled WhatsApp notification message
  const waPhone = appointment.clientPhone.replace(/[^0-9]/g, "");
  const waMsg = encodeURIComponent(
    `¡Hola ${appointment.clientName}! Te confirmamos que tu cita para *${assignedService?.name || "Servicio"}* en *${businessName}* ha sido reprogramada con éxito para el día *${date}* a las *${time} hs* con ${assignedPerson?.name || "nuestro equipo"}. ¡Te esperamos con gusto!`
  );
  const waLink = `https://wa.me/${waPhone}?text=${waMsg}`;

  return (
    <Modal
      id="rescheduleModal"
      open={true}
      title="Editar o Reprogramar Cita"
      onClose={onClose}
    >
      <form onSubmit={handleSave} className="space-y-4 text-xs">
        {/* Client Header Info */}
        <div className="flex items-center justify-between rounded-2xl bg-slate-50 dark:bg-slate-800/80 p-3.5 border border-slate-200/80 dark:border-white/10">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary font-black text-sm">
              {appointment.clientName.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <p className="font-black text-sm text-slate-900 dark:text-white">
                {appointment.clientName}
              </p>
              <p className="text-[11px] text-slate-500">{appointment.clientPhone}</p>
            </div>
          </div>

          <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 capitalize">
            {status}
          </span>
        </div>

        {/* Quick 1-Tap Reschedule Buttons */}
        <div>
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block mb-1.5">
            Reprogramación rápida con 1 toque:
          </span>
          <div className="grid grid-cols-4 gap-2">
            <button
              type="button"
              onClick={() => addMinutesToAppointment(15)}
              className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 py-1.5 text-center font-bold text-slate-700 dark:text-slate-200 hover:border-primary hover:text-primary transition"
            >
              +15 min
            </button>
            <button
              type="button"
              onClick={() => addMinutesToAppointment(30)}
              className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 py-1.5 text-center font-bold text-slate-700 dark:text-slate-200 hover:border-primary hover:text-primary transition"
            >
              +30 min
            </button>
            <button
              type="button"
              onClick={() => addMinutesToAppointment(60)}
              className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 py-1.5 text-center font-bold text-slate-700 dark:text-slate-200 hover:border-primary hover:text-primary transition"
            >
              +1 hora
            </button>
            <button
              type="button"
              onClick={moveToTomorrow}
              className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 py-1.5 text-center font-bold text-slate-700 dark:text-slate-200 hover:border-primary hover:text-primary transition"
            >
              Mañana
            </button>
          </div>
        </div>

        {/* Exact Date & Time Picker */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Nueva Fecha
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 px-3 py-2 text-slate-900 dark:text-white focus:border-primary focus:outline-none"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Hora de Inicio
            </label>
            <input
              type="time"
              required
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 px-3 py-2 text-slate-900 dark:text-white focus:border-primary focus:outline-none"
            />
          </div>
        </div>

        {/* Staff & Service Re-assignment */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Profesional Asignado
            </label>
            <select
              value={staffId}
              onChange={(e) => setStaffId(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 px-3 py-2 text-slate-900 dark:text-white focus:border-primary focus:outline-none"
            >
              {staff.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Servicio
            </label>
            <select
              value={serviceId}
              onChange={(e) => {
                setServiceId(e.target.value);
                const s = services.find((srv) => srv.id === e.target.value);
                if (s?.price) setChargeAmount(s.price);
              }}
              className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 px-3 py-2 text-slate-900 dark:text-white focus:border-primary focus:outline-none"
            >
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({formatGs(s.price)})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Status Switcher with state machine restrictions */}
        <div>
          <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
            Estado de la Cita
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as AppointmentStatus)}
            className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 px-3 py-2 text-slate-900 dark:text-white focus:border-primary focus:outline-none"
          >
            {allowedNextStatuses.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Quick No-Show Button if confirmed */}
        {appointment.status === "confirmed" && (
          <div className="flex items-center justify-between rounded-2xl bg-amber-500/10 border border-amber-500/20 p-2.5">
            <span className="text-amber-800 dark:text-amber-300 font-semibold">¿El cliente no se presentó?</span>
            <button
              type="button"
              onClick={() => {
                onUpdate({
                  start: appointment.start,
                  end: appointment.end,
                  staffId: appointment.staffId,
                  serviceId: appointment.serviceId,
                  status: "no_show",
                });
              }}
              className="inline-flex items-center gap-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold px-3 py-1.5 transition"
            >
              <AlertCircle className="h-3.5 w-3.5" />
              <span>Marcar Ausente</span>
            </button>
          </div>
        )}

        {/* Cobrar en Caja Section */}
        <div className="rounded-2xl border border-slate-200 dark:border-white/10 p-3 bg-slate-50/70 dark:bg-slate-800/50 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <DollarSign className="h-4 w-4 text-emerald-500" />
              Cobrar Turno en Caja
            </span>
            {isAlreadyCharged ? (
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" /> Cobrado en Caja
              </span>
            ) : (
              <span className="text-[10px] text-slate-500">
                Sugerido: {formatGs(assignedService?.price || 0)}
              </span>
            )}
          </div>

          {appointment.status === "cancelled" || appointment.status === "no_show" ? (
            <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-2 text-[11px] text-amber-800 dark:text-amber-300 font-medium">
              No se puede cobrar un turno cancelado o marcado como ausente. Si el cliente asistió, reactivá el estado de la cita a &quot;Confirmada&quot;.
            </div>
          ) : !isAlreadyCharged ? (
            <div className="space-y-2 pt-1 border-t border-slate-200/60 dark:border-white/5">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10.5px] font-semibold text-slate-600 dark:text-slate-400 block mb-0.5">
                    Importe (Gs.)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={chargeAmount}
                    onChange={(e) => setChargeAmount(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 px-3 py-1.5 font-bold text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-[10.5px] font-semibold text-slate-600 dark:text-slate-400 block mb-0.5">
                    Método de Pago
                  </label>
                  <select
                    value={chargeMethod}
                    onChange={(e) => setChargeMethod(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 px-3 py-1.5 text-slate-900 dark:text-white"
                  >
                    <option value="efectivo">Efectivo</option>
                    <option value="pos">POS / Tarjeta</option>
                    <option value="transferencia">SIPAP / Transferencia</option>
                    <option value="billetera">Billetera Móvil</option>
                  </select>
                </div>
              </div>

              <button
                type="button"
                disabled={isCharging || chargeAmount <= 0}
                onClick={handleChargeNow}
                className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold py-2 shadow-sm transition flex items-center justify-center gap-1.5"
              >
                <DollarSign className="h-4 w-4" />
                <span>{isCharging ? "Procesando cobro..." : `Cobrar ${formatGs(chargeAmount)} e Ingresar a Caja`}</span>
              </button>
            </div>
          ) : (
            <p className="text-[11px] text-slate-500">Este turno ya cuenta con movimiento registrado en caja.</p>
          )}
        </div>

        {/* WhatsApp Notification Trigger */}
        <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-3 flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="font-bold text-emerald-700 dark:text-emerald-400 block">
              Avisar al cliente del cambio:
            </span>
            <p className="text-[11px] text-slate-600 dark:text-slate-300">
              Enviá un WhatsApp con el nuevo día y horario ya redactado.
            </p>
          </div>

          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition shrink-0"
          >
            <MessageCircle className="h-4 w-4" />
            <span>WhatsApp</span>
          </a>
        </div>

        {/* Modal Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100 dark:border-white/10">
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center gap-1 text-rose-600 hover:text-rose-700 font-semibold py-2 px-2"
          >
            <Trash2 className="h-4 w-4" />
            <span>Cancelar Cita</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 dark:border-white/10 px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cerrar
            </button>
            <button
              type="submit"
              className="rounded-xl bg-primary px-5 py-2 text-xs font-bold text-white shadow-md shadow-primary/25 hover:opacity-95"
            >
              Guardar Cambios
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
