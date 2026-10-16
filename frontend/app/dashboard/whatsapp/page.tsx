"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import QRCode from "qrcode";
import {
  QrCode,
  CheckCircle2,
  Clock,
  Send,
  Check,
  Phone,
  BadgeCheck,
  Wifi,
  ChevronLeft,
  ChevronDown,
  Video,
  PhoneCall,
  RefreshCw,
  X,
  CheckCheck,
  Plus,
  ArrowRight,
  Save,
  Trash2,
  Eye,
} from "lucide-react";
import { useDashboardStore } from "@/store/useDashboardStore";
import { tenantPublicUrl } from "@/lib/tenant/public-url";

// Timing presets for automatic reminder cron jobs
const TIMING_PRESETS = [
  { label: "24h Antes (1 día)", minutes: 1440, desc: "Día anterior" },
  { label: "12h Antes", minutes: 720, desc: "12 horas previas" },
  { label: "6h Antes", minutes: 360, desc: "6 horas previas" },
  { label: "4h Antes", minutes: 240, desc: "4 horas previas" },
  { label: "2h Antes", minutes: 120, desc: "2 horas previas" },
  { label: "1h Antes", minutes: 60, desc: "1 hora previa" },
  { label: "30 Minutos", minutes: 30, desc: "Última media hora" },
];

function formatTimingLabel(minutes?: number): string {
  if (minutes === undefined) return "Sin horario definido";
  if (minutes <= 0) return "Al inicio del turno";
  if (minutes % 1440 === 0) {
    const days = minutes / 1440;
    return `${days} ${days === 1 ? "día" : "días"} antes`;
  }
  if (minutes % 60 === 0) {
    const hours = minutes / 60;
    return `${hours} ${hours === 1 ? "hora" : "horas"} antes`;
  }
  return `${minutes} minutos antes`;
}

function eventTemplateLabel(trigger?: string) {
  if (trigger === "confirmacion") return "Al confirmar turno";
  if (trigger === "cancelacion") return "Al cancelar turno";
  return null;
}

// Dynamic message tags for reminder templates
const AVAILABLE_TAGS = [
  { tag: "{cliente}", label: "Nombre Cliente", sample: "Martín Benítez" },
  { tag: "{servicio}", label: "Servicio", sample: "Corte Fade Clásico" },
  { tag: "{profesional}", label: "Profesional", sample: "Diego Franco" },
  { tag: "{fecha}", label: "Fecha", sample: "Viernes 25 de Octubre" },
  { tag: "{hora}", label: "Hora", sample: "16:00 hs" },
  { tag: "{negocio}", label: "Nombre Negocio", sample: "Tu Negocio" },
  { tag: "{direccion}", label: "Dirección", sample: "Avda. Santa Teresa 1420" },
  { tag: "{link_autogestion}", label: "Link Autogestión", sample: "https://agendatepy.com/turno/AG-9421" },
  { tag: "{link_negocio}", label: "Link del Negocio", sample: "https://agendatepy.com/mi-local" },
];

// Helper to format WhatsApp text (*bold*, _italic_, ~strike~)
function renderWhatsAppFormatted(text: string) {
  if (!text) return null;
  const lines = text.split("\n");

  return lines.map((line, lineIdx) => {
    const parts = line.split(/(\*[^*\n]+\*|_[^_\n]+_|~[^~\n]+~|`[^`\n]+`)/g);

    return (
      <span key={lineIdx} className="block leading-relaxed min-h-[1.2em]">
        {parts.map((part, partIdx) => {
          if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
            return (
              <strong key={partIdx} className="font-semibold">
                {part.slice(1, -1)}
              </strong>
            );
          }
          if (part.startsWith("_") && part.endsWith("_") && part.length > 2) {
            return (
              <em key={partIdx} className="italic">
                {part.slice(1, -1)}
              </em>
            );
          }
          if (part.startsWith("~") && part.endsWith("~") && part.length > 2) {
            return (
              <del key={partIdx} className="line-through">
                {part.slice(1, -1)}
              </del>
            );
          }
          if (part.startsWith("`") && part.endsWith("`") && part.length > 2) {
            return (
              <code key={partIdx} className="tabular-nums bg-black/10 px-1 py-0.5 rounded text-[11px]">
                {part.slice(1, -1)}
              </code>
            );
          }
          return <span key={partIdx}>{part}</span>;
        })}
      </span>
    );
  });
}

// Simple switch component
function CustomSwitch({
  checked,
  onChange,
  disabled = false,
  label,
  largeTarget = false,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
  largeTarget?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      className={`group relative inline-flex shrink-0 items-center justify-center rounded-full transition-transform duration-200 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 motion-reduce:transition-none ${
        largeTarget ? "h-10 w-14" : "h-9 w-12"
      } ${
        disabled
          ? "cursor-not-allowed"
          : "cursor-pointer"
      }`}
    >
      {label && <span className="sr-only">{label}</span>}
      <span
        aria-hidden="true"
        className={`pointer-events-none relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none ${
          disabled
            ? "opacity-50"
            : checked
              ? "bg-emerald-600 dark:bg-emerald-500"
              : "bg-slate-200 dark:bg-slate-700"
        }`}
      >
        <span
          className={`pointer-events-none absolute left-1 inline-block h-4 w-4 rounded-full bg-[#ffffff] shadow-[0_1px_3px_rgba(0,0,0,0.28)] transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </span>
    </button>
  );
}

export default function BotWhatsAppPage() {
  const {
    business,
    evolutionConfig,
    updateEvolutionConfig,
    whatsappTemplates,
    updateWhatsAppTemplate,
    createWhatsAppTemplate,
    deleteWhatsAppTemplate,
    toggleWhatsAppTemplate,
    pushToast,
  } = useDashboardStore();

  type ConnectionStatus = "checking" | "connected" | "disconnected" | "error";
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("checking");
  const [connectedPhone, setConnectedPhone] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState("");
  const isConnected = connectionStatus === "connected";

  // Estados para Cron Job y Recordatorios configurables
  const [isSavingTemplates, setIsSavingTemplates] = useState(false);
  const [hasUnsavedTemplateChanges, setHasUnsavedTemplateChanges] = useState(false);
  const [isSendingTestReminder, setIsSendingTestReminder] = useState(false);
  const [customMinutesInput, setCustomMinutesInput] = useState<string>("");

  // Solamente 2 pestañas simples: "asistente" (por defecto) o "recordatorios"
  const [activeTab, setActiveTab] = useState<"asistente" | "recordatorios">("asistente");

  // Configuración funcional del Asistente
  const [autoBotEnabled, setAutoBotEnabled] = useState(evolutionConfig.autoBotEnabled !== false);
  const [allowEmojis, setAllowEmojis] = useState(Boolean(evolutionConfig.allowEmojis));
  const [askStaffPreference, setAskStaffPreference] = useState(evolutionConfig.askStaffPreference !== false);
  const [notifyPersonalPhone, setNotifyPersonalPhone] = useState(evolutionConfig.notifyPersonalPhoneOnBooking === true);
  const [handoffOnUnknownTopic, setHandoffOnUnknownTopic] = useState(evolutionConfig.handoffOnUnknownTopic !== false);
  const [personalPhone, setPersonalPhone] = useState(evolutionConfig.personalPhone || "");
  const [minNoticeMinutes, setMinNoticeMinutes] = useState<number>(evolutionConfig.minNoticeMinutes ?? 60);
  const [serviceScheduleMode, setServiceScheduleMode] = useState<"always" | "business_hours">(
    evolutionConfig.serviceScheduleMode || "always"
  );
  const [aiTone, setAiTone] = useState<"amigable" | "formal" | "conciso">(evolutionConfig.aiTone || "amigable");
  const [aiInstructions, setAiInstructions] = useState(evolutionConfig.aiInstructions || "");
  const [humanHandoffPhone, setHumanHandoffPhone] = useState(
    evolutionConfig.humanHandoffPhone || business.whatsappNumber || business.phone || ""
  );
  const [isSavingAiSettings, setIsSavingAiSettings] = useState(false);
  const [isSavingBotToggle, setIsSavingBotToggle] = useState(false);
  const [isSavingPersonalAlert, setIsSavingPersonalAlert] = useState(false);
  const previousEvolutionConfig = useRef(evolutionConfig);
  const prefersReducedMotion = useReducedMotion();
  const selectionTransition = prefersReducedMotion
    ? { duration: 0.01 }
    : { type: "spring" as const, stiffness: 520, damping: 38, mass: 0.75 };

  useEffect(() => {
    const previous = previousEvolutionConfig.current;
    if (evolutionConfig.autoBotEnabled !== previous.autoBotEnabled && evolutionConfig.autoBotEnabled !== undefined) {
      setAutoBotEnabled(evolutionConfig.autoBotEnabled !== false);
    }
    if (evolutionConfig.allowEmojis !== previous.allowEmojis && evolutionConfig.allowEmojis !== undefined) {
      setAllowEmojis(Boolean(evolutionConfig.allowEmojis));
    }
    if (evolutionConfig.askStaffPreference !== previous.askStaffPreference && evolutionConfig.askStaffPreference !== undefined) {
      setAskStaffPreference(evolutionConfig.askStaffPreference !== false);
    }
    if (evolutionConfig.notifyPersonalPhoneOnBooking !== previous.notifyPersonalPhoneOnBooking && evolutionConfig.notifyPersonalPhoneOnBooking !== undefined) {
      setNotifyPersonalPhone(evolutionConfig.notifyPersonalPhoneOnBooking === true);
    }
    if (evolutionConfig.handoffOnUnknownTopic !== previous.handoffOnUnknownTopic && evolutionConfig.handoffOnUnknownTopic !== undefined) {
      setHandoffOnUnknownTopic(evolutionConfig.handoffOnUnknownTopic !== false);
    }
    if (evolutionConfig.personalPhone !== previous.personalPhone && evolutionConfig.personalPhone !== undefined) {
      setPersonalPhone(evolutionConfig.personalPhone);
    }
    if (evolutionConfig.minNoticeMinutes !== previous.minNoticeMinutes && evolutionConfig.minNoticeMinutes !== undefined) {
      setMinNoticeMinutes(evolutionConfig.minNoticeMinutes);
    }
    if (evolutionConfig.serviceScheduleMode !== previous.serviceScheduleMode && evolutionConfig.serviceScheduleMode !== undefined) {
      setServiceScheduleMode(evolutionConfig.serviceScheduleMode);
    }
    if (evolutionConfig.aiTone !== previous.aiTone && evolutionConfig.aiTone) {
      setAiTone(evolutionConfig.aiTone);
    }
    if (evolutionConfig.aiInstructions !== previous.aiInstructions && evolutionConfig.aiInstructions !== undefined) {
      setAiInstructions(evolutionConfig.aiInstructions);
    }
    if (evolutionConfig.humanHandoffPhone !== previous.humanHandoffPhone && evolutionConfig.humanHandoffPhone !== undefined) {
      setHumanHandoffPhone(evolutionConfig.humanHandoffPhone);
    }
    previousEvolutionConfig.current = evolutionConfig;
  }, [evolutionConfig]);

  const refreshConnectionStatus = useCallback(async () => {
    try {
      const response = await fetch("/api/tenant/whatsapp/instance", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.error || "No se pudo verificar WhatsApp.");
      setConnectionStatus(data.connected ? "connected" : "disconnected");
      setConnectedPhone(data.phoneNumber || "");
      setConnectionError("");
      return data;
    } catch (error) {
      setConnectionStatus("error");
      setConnectionError(error instanceof Error ? error.message : "No se pudo verificar WhatsApp.");
      return null;
    }
  }, []);

  const setQrFromConnection = useCallback(async (data: { qrImage?: string | null; qrPayload?: string | null }) => {
    if (data.qrImage) {
      setQrCodeDataUrl(
        data.qrImage.startsWith("data:image/")
          ? data.qrImage
          : `data:image/png;base64,${data.qrImage}`,
      );
      return;
    }
    if (data.qrPayload) {
      const qr = await QRCode.toDataURL(data.qrPayload, {
        width: 260,
        margin: 2,
        color: { dark: "#111827", light: "#ffffff" },
      });
      setQrCodeDataUrl(qr);
      return;
    }
    setQrCodeDataUrl("");
  }, []);

  // Sincronización de pestaña con el Tour Guiado
  useEffect(() => {
    function handleTabSwitch(e: Event) {
      const customEvent = e as CustomEvent<{ tab?: string }>;
      const targetTab = customEvent.detail?.tab;
      if (targetTab === "recordatorios" || targetTab === "plantillas") {
        setActiveTab("recordatorios");
      } else if (targetTab === "asistente" || targetTab === "canva" || targetTab === "simulador") {
        setActiveTab("asistente");
      }
    }
    window.addEventListener("agendate-switch-whatsapp-tab", handleTabSwitch);
    return () => {
      window.removeEventListener("agendate-switch-whatsapp-tab", handleTabSwitch);
    };
  }, []);

  async function handleSaveAiSettings() {
    const personalPhoneDigits = personalPhone.replace(/\D/g, "").length;
    if (notifyPersonalPhone && (personalPhoneDigits < 8 || personalPhoneDigits > 15)) {
      pushToast("error", "Ingresá un número de 8 a 15 dígitos para recibir avisos de nuevas reservas.");
      return;
    }
    setIsSavingAiSettings(true);
    try {
      const saved = await updateEvolutionConfig({
        autoBotEnabled,
        allowEmojis,
        askStaffPreference,
        notifyPersonalPhoneOnBooking: notifyPersonalPhone,
        handoffOnUnknownTopic,
        personalPhone: personalPhone.trim(),
        minNoticeMinutes,
        serviceScheduleMode,
        aiTone,
        aiInstructions,
        humanHandoffPhone: personalPhone.trim() || humanHandoffPhone.trim(),
      });
      if (!saved) throw new Error("No se pudieron guardar los ajustes en el servidor.");
      pushToast("success", "Configuración guardada correctamente.");
    } catch (error) {
      pushToast("error", error instanceof Error ? error.message : "No se pudieron guardar los ajustes.");
    } finally {
      setIsSavingAiSettings(false);
    }
  }

  async function handleAssistantToggle(nextValue: boolean) {
    if (isSavingBotToggle) return;
    const previousValue = autoBotEnabled;
    setAutoBotEnabled(nextValue);
    setIsSavingBotToggle(true);
    const saved = await updateEvolutionConfig({ autoBotEnabled: nextValue });
    if (!saved) {
      setAutoBotEnabled(previousValue);
      pushToast("error", "No se pudo cambiar el estado del asistente. Revisá tu conexión e intentá otra vez.");
    } else {
      pushToast("success", nextValue ? "Asistente activado para responder a tus clientes." : "Asistente pausado temporalmente.");
    }
    setIsSavingBotToggle(false);
  }

  async function handlePersonalAlertToggle(nextValue: boolean) {
    if (isSavingPersonalAlert || isSavingAiSettings) return;
    if (nextValue) {
      const digitCount = personalPhone.replace(/\D/g, "").length;
      if (digitCount < 8 || digitCount > 15) {
        pushToast("error", "Ingresá un número válido antes de activar los avisos personales.");
        return;
      }
    }

    const previousValue = notifyPersonalPhone;
    setNotifyPersonalPhone(nextValue);

    setIsSavingPersonalAlert(true);
    try {
      const saved = await updateEvolutionConfig({
        notifyPersonalPhoneOnBooking: nextValue,
        ...(nextValue ? { personalPhone: personalPhone.trim() } : {}),
      });
      if (!saved) throw new Error("No se pudo actualizar el aviso al celular personal.");
      pushToast("success", nextValue ? "Avisos de nuevas reservas activados." : "Avisos de nuevas reservas pausados.");
    } catch (error) {
      setNotifyPersonalPhone(previousValue);
      pushToast("error", error instanceof Error ? error.message : "No se pudo actualizar el aviso al celular personal.");
    } finally {
      setIsSavingPersonalAlert(false);
    }
  }

  // Modales
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState("");
  const templateBodyRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    void refreshConnectionStatus();
  }, [refreshConnectionStatus]);

  useEffect(() => {
    if (!isConnectModalOpen || isConnected) return;
    const timer = window.setInterval(() => {
      void refreshConnectionStatus();
    }, 4000);
    return () => window.clearInterval(timer);
  }, [isConnectModalOpen, isConnected, refreshConnectionStatus]);

  // Simulador de WhatsApp en Vivo
  const [simChatMessages, setSimChatMessages] = useState<
    {
      id: string;
      sender: "client" | "bot";
      type: "text" | "card";
      text?: string;
      time: string;
      cardData?: {
        service: string;
        staff: string;
        datetime: string;
        price: string;
        location: string;
      };
    }[]
  >([
    {
      id: "welcome-init",
      sender: "bot",
      type: "text",
      text: `¡Hola! Bienvenido/a a *${business.name}*. ¿Qué servicio estás buscando?`,
      time: "10:00",
    },
  ]);
  const [simInput, setSimInput] = useState("");
  const [isBotTypingSim, setIsBotTypingSim] = useState(false);
  const [simulationPhone, setSimulationPhone] = useState(() => `+595${String(Math.floor(Math.random() * 100_000_000)).padStart(8, "0")}`);
  const chatScrollRef = useRef<HTMLDivElement | null>(null);

  // Pestaña de Recordatorios Automáticos
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(
    whatsappTemplates[0]?.id || "wt-confirmacion"
  );
  const [testPhone, setTestPhone] = useState(business.whatsappNumber || business.phone || "");

  const currentTemplate =
    whatsappTemplates.find((t) => t.id === selectedTemplateId) ||
    whatsappTemplates[0];
  const currentEventLabel = eventTemplateLabel(currentTemplate?.trigger);
  const isImmediateReminder = currentTemplate?.timingMinutesBefore === 0;

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [simChatMessages, isBotTypingSim]);

  async function startWhatsAppConnection() {
    setIsConnecting(true);
    setConnectionError("");
    setQrCodeDataUrl("");
    try {
      const response = await fetch("/api/tenant/whatsapp/instance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "connect" }),
      });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.error || "No se pudo iniciar la conexión.");
      setConnectionStatus(data.connected ? "connected" : "disconnected");
      setConnectedPhone(data.phoneNumber || "");
      await setQrFromConnection(data);
      if (data.connected) {
        pushToast("success", "WhatsApp ya está conectado a este negocio.");
      } else if (!data.qrImage && !data.qrPayload) {
        setConnectionError("La pasarela no devolvió un código QR. Actualizá para intentar otra vez.");
      }
    } catch (error) {
      setQrCodeDataUrl("");
      setConnectionStatus("error");
      setConnectionError(error instanceof Error ? error.message : "No se pudo iniciar la conexión.");
    } finally {
      setIsConnecting(false);
    }
  }

  async function openConnectModal() {
    setIsConnectModalOpen(true);
    setConnectionError("");
    setQrCodeDataUrl("");
    const status = await refreshConnectionStatus();
    if (!status?.connected) await startWhatsAppConnection();
  }

  async function handleDisconnect() {
    setIsConnecting(true);
    setConnectionError("");
    try {
      const response = await fetch("/api/tenant/whatsapp/instance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "disconnect" }),
      });
      const data = await response.json();
      if (!response.ok || !data.ok || data.connected) {
        throw new Error(data.error || "No se pudo desconectar WhatsApp.");
      }
      setConnectionStatus("disconnected");
      setConnectedPhone("");
      setQrCodeDataUrl("");
      pushToast("success", "WhatsApp desconectado.");
    } catch (error) {
      setConnectionError(error instanceof Error ? error.message : "No se pudo desconectar WhatsApp.");
      pushToast("error", error instanceof Error ? error.message : "No se pudo desconectar WhatsApp.");
    } finally {
      setIsConnecting(false);
    }
  }

  function triggerSimMessage(text: string) {
    if (isBotTypingSim) return;
    setSimInput(text);
    setTimeout(() => {
      handleSimSendMessage(undefined, text);
    }, 50);
  }

  async function handleSimSendMessage(e?: React.FormEvent, directText?: string) {
    if (e) e.preventDefault();
    const userMsg = (directText || simInput).trim();
    if (!userMsg || isBotTypingSim) return;

    const timeNow = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    // Mensaje del cliente
    setSimChatMessages((prev) => [
      ...prev,
      {
        id: `msg-${Date.now()}`,
        sender: "client",
        type: "text",
        text: userMsg,
        time: timeNow,
      },
    ]);
    setSimInput("");
    setIsBotTypingSim(true);

    try {
      const botTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      let replyText = "";

      if (autoBotEnabled) {
        const aiRes = await fetch("/api/ai/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: userMsg,
            tenantSlug: business.slug,
            clientPhone: simulationPhone,
            clientName: "Cliente de prueba",
            simulation: true,
            configOverrides: {
              allowEmojis,
              askStaffPreference,
              handoffOnUnknownTopic,
              aiTone,
              aiInstructions,
              notifyPersonalPhoneOnBooking: notifyPersonalPhone,
              personalPhone: personalPhone.trim(),
              minNoticeMinutes,
              serviceScheduleMode,
            },
          }),
        });
        const aiData = await aiRes.json();
        if (!aiRes.ok || !aiData.replyText) {
          throw new Error(aiData.message || "No se pudo consultar al asistente.");
        }
        replyText = aiData.replyText;
      }

      if (!replyText) {
        if (!autoBotEnabled) {
          replyText = "El asistente se encuentra pausado en este momento. Podés activarlo en el interruptor de la izquierda.";
        }
      }

      setSimChatMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now()}`,
          sender: "bot",
          type: "text",
          text: replyText,
          time: botTime,
        },
      ]);
    } catch (error) {
      console.error("Error consultando asistente:", error);
      setSimChatMessages((prev) => [
        ...prev,
        {
          id: `msg-error-${Date.now()}`,
          sender: "bot",
          type: "text",
          text: "No pude consultar al asistente. Revisá la conexión e intentá de nuevo.",
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setIsBotTypingSim(false);
    }
  }

  function insertTag(tag: string) {
    if (!currentTemplate) return;
    const body = currentTemplate.body || "";
    const textarea = templateBodyRef.current;
    const start = textarea?.selectionStart ?? body.length;
    const end = textarea?.selectionEnd ?? body.length;
    const before = body.slice(0, start);
    const after = body.slice(end);
    const inserted = `${before && !/\s$/.test(before) ? " " : ""}${tag}${after && !/^\s/.test(after) ? " " : ""}`;
    const updated = `${before}${inserted}${after}`;
    const cursor = before.length + inserted.length;
    updateWhatsAppTemplate(currentTemplate.id, updated);
    setHasUnsavedTemplateChanges(true);
    window.requestAnimationFrame(() => {
      textarea?.focus();
      textarea?.setSelectionRange(cursor, cursor);
    });
  }

  function getPreviewText(rawBody: string) {
    return rawBody
      .replace(/{cliente}/g, "Martín Benítez")
      .replace(/{servicio}/g, "Corte Fade Clásico")
      .replace(/{profesional}/g, "Diego Franco")
      .replace(/{fecha}/g, "Jueves 24 de Octubre")
      .replace(/{hora}/g, "15:30")
      .replace(/{negocio}/g, business.name)
      .replace(/{direccion}/g, business.address || "Avda. Santa Teresa 1420")
      .replace(/{link_autogestion}/g, tenantPublicUrl(business.slug, "/turno/AG-9421"))
      .replace(/{link_negocio}/g, tenantPublicUrl(business.slug));
  }

  async function handleSaveTemplates() {
    const invalidTemplate = whatsappTemplates.find(
      (template) => template.enabled && (!template.name.trim() || !template.body.trim() || template.body.length > 4000),
    );
    if (!whatsappTemplates.length) {
      pushToast("error", "Agregá al menos un recordatorio antes de guardar.");
      return;
    }
    if (invalidTemplate) {
      setSelectedTemplateId(invalidTemplate.id);
      pushToast("error", "Completá el nombre y el mensaje de cada plantilla activa (máximo 4.000 caracteres).");
      return;
    }
    const invalidScheduledTemplate = whatsappTemplates.find((template) => {
      if (eventTemplateLabel(template.trigger)) return false;
      if (template.timingMinutesBefore === undefined) return template.enabled;
      return !Number.isInteger(template.timingMinutesBefore) || template.timingMinutesBefore < 0 || template.timingMinutesBefore > 10080;
    });
    if (invalidScheduledTemplate) {
      setSelectedTemplateId(invalidScheduledTemplate.id);
      pushToast("error", "Cada recordatorio activo necesita una antelación entre 0 y 10.080 minutos.");
      return;
    }
    setIsSavingTemplates(true);
    try {
      const res = await fetch("/api/tenant/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          whatsappTemplates,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.message || "Error en el servidor");
      setHasUnsavedTemplateChanges(false);
      pushToast("success", "Plantillas y tiempos de recordatorio guardados exitosamente.");
    } catch (e: any) {
      console.error(e);
      pushToast("error", "No se pudo guardar la configuración en la base de datos.");
    } finally {
      setIsSavingTemplates(false);
    }
  }

  async function handleSendTestReminder() {
    if (!currentTemplate) return;
    const cleanNumber = testPhone.trim();
    const phoneDigits = cleanNumber.replace(/\D/g, "");
    if (phoneDigits.length < 8 || phoneDigits.length > 15) {
      pushToast("error", "Ingresá un número válido de 8 a 15 dígitos, con código de país.");
      return;
    }
    setIsSendingTestReminder(true);
    try {
      const res = await fetch("/api/cron/reminders/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: cleanNumber,
          templateBody: currentTemplate.body,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Error al enviar mensaje de prueba.");
      }
      pushToast("success", data.message || `Mensaje de prueba enviado con éxito a ${cleanNumber}`);
    } catch (err: any) {
      console.error(err);
      pushToast("error", err.message || "Error al enviar mensaje de prueba a WhatsApp.");
    } finally {
      setIsSendingTestReminder(false);
    }
  }

  function handleCreateNewReminder() {
    const count = whatsappTemplates.length + 1;
    const newId = `wt-reminder-${Date.now()}`;
    const newTemplate = {
      id: newId,
      name: `Recordatorio Personalizado ${count}`,
      trigger: `recordatorio_custom_${Date.now()}`,
      timingMinutesBefore: 60,
      body: "¡Hola {cliente}! Te recordamos tu turno para *{servicio}* en *{negocio}* hoy a las *{hora} hs*.\n\nDirección: {direccion}\nGestión de turno: {link_autogestion}\n¡Te esperamos!",
      enabled: true,
    };
    createWhatsAppTemplate(newTemplate);
    setSelectedTemplateId(newId);
    setHasUnsavedTemplateChanges(true);
    pushToast("success", "Recordatorio agregado al borrador. Guardá la configuración para activarlo.");
  }

  function handleDeleteCurrentTemplate(id: string) {
    if (whatsappTemplates.length <= 1) {
      pushToast("error", "Debés mantener al menos una plantilla configurada.");
      return;
    }
    deleteWhatsAppTemplate(id);
    setHasUnsavedTemplateChanges(true);
    const remaining = whatsappTemplates.filter((t) => t.id !== id);
    if (remaining.length > 0) {
      setSelectedTemplateId(remaining[0].id);
    }
    pushToast("success", "Plantilla quitada del borrador. Guardá la configuración para aplicar el cambio.");
  }

  const activeConnectedPhone = connectedPhone || evolutionConfig.phoneNumber || "WhatsApp conectado";
  const personalPhoneDigitCount = personalPhone.replace(/\D/g, "").length;
  const personalPhoneIsValid = personalPhoneDigitCount >= 8 && personalPhoneDigitCount <= 15;
  const personalAlertIsSaved =
    (evolutionConfig.notifyPersonalPhoneOnBooking === true) === notifyPersonalPhone &&
    (evolutionConfig.personalPhone || "").trim() === personalPhone.trim();

  return (
    <div className="w-full space-y-4 pb-24 sm:space-y-5 sm:pb-20">
      {/* ═══ CABECERA PRINCIPAL ═══ */}
      <div className="flex flex-col gap-3 py-1 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">Automatización</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-3xl">Asistente de WhatsApp</h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-500 dark:text-zinc-400">
            Respuestas y recordatorios para tus clientes.
          </p>
        </div>

        {/* Botones de acción */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            data-tour="bot-support-action"
            onClick={() => setIsHelpModalOpen(true)}
            className="inline-flex min-h-11 items-center gap-1.5 rounded-xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <PhoneCall className="h-3.5 w-3.5 text-slate-400" />
            <span>Soporte</span>
          </button>

          {isConnected ? (
            <button
              type="button"
              onClick={() => void openConnectModal()}
              className="inline-flex min-h-11 items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-white shadow-md transition hover:brightness-110 cursor-pointer bg-slate-800 hover:bg-slate-700"
            >
              <QrCode className="h-3.5 w-3.5" />
              <span>Administrar conexión</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => void openConnectModal()}
              disabled={connectionStatus === "checking" || isConnecting}
              className="inline-flex min-h-11 items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-white shadow-lg transition-all duration-300 hover:brightness-110 active:scale-95 cursor-pointer bg-emerald-600 hover:bg-emerald-500"
            >
              <QrCode className="h-3.5 w-3.5" />
              <span>{connectionStatus === "checking" ? "Verificando…" : "Vincular con QR"}</span>
            </button>
          )}
        </div>
      </div>

      {/* ═══ ESTADO ═══ */}
      <div data-tour="bot-status-card" className="glass-panel-subtle grid grid-cols-1 gap-px overflow-hidden rounded-2xl min-[430px]:grid-cols-2">
        <div className="flex min-w-0 items-center gap-2 px-2.5 py-3 sm:gap-3 sm:px-4 sm:py-3.5">
          <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl sm:h-9 sm:w-9 ${isConnected ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : connectionStatus === "error" ? "bg-rose-500/10 text-rose-600 dark:text-rose-400" : "bg-slate-100 text-slate-500 dark:bg-white/5 dark:text-slate-400"}`}>
            <Phone aria-hidden="true" className="h-4 w-4" />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-[11px] font-medium text-slate-500 dark:text-slate-400">WhatsApp</span>
            <span className={`block truncate text-sm font-semibold sm:text-sm ${connectionStatus === "error" ? "text-rose-700 dark:text-rose-300" : isConnected ? "text-emerald-700 dark:text-emerald-300" : "text-slate-900 dark:text-white"}`}>
              {isConnected ? activeConnectedPhone : connectionStatus === "checking" ? "Verificando conexión…" : connectionStatus === "error" ? "No se pudo conectar" : "Sin vincular"}
            </span>
          </span>
        </div>

        <div className="flex min-w-0 items-center gap-2 border-t border-slate-200/70 px-2.5 py-3 sm:gap-3 sm:px-4 sm:py-3.5 dark:border-white/10 min-[430px]:border-l min-[430px]:border-t-0">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary sm:h-9 sm:w-9">
            <Clock aria-hidden="true" className="h-4 w-4" />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-[11px] font-medium text-slate-500 dark:text-slate-400">Recordatorios activos</span>
            <span className="block truncate text-sm font-semibold text-slate-900 dark:text-white">
              {whatsappTemplates.filter((template) => template.enabled).length} de {whatsappTemplates.length}
            </span>
          </span>
        </div>
      </div>

      {/* ═══ PESTAÑAS (SÓLO 2: ASISTENTE VIRTUAL O RECORDATORIOS) ═══ */}
      <div role="group" aria-label="Sección de WhatsApp" className="relative flex gap-1 rounded-2xl glass-panel-subtle p-1">
        <button
          type="button"
          aria-pressed={activeTab === "asistente"}
          onClick={() => setActiveTab("asistente")}
          className={`relative flex min-h-11 flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl px-2.5 py-2 text-xs font-semibold transition-colors duration-200 motion-reduce:transition-none sm:px-4 sm:py-2.5 ${
            activeTab === "asistente"
              ? "text-white"
              : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          }`}
        >
          {activeTab === "asistente" && <motion.span layoutId="whatsapp-active-tab" transition={selectionTransition} aria-hidden="true" className="absolute inset-0 rounded-xl border border-primary bg-primary shadow-xs" />}
          <span className="relative z-10">Asistente Virtual</span>
        </button>

        <button
          type="button"
          aria-pressed={activeTab === "recordatorios"}
          onClick={() => setActiveTab("recordatorios")}
          className={`relative flex min-h-11 flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl px-2.5 py-2 text-xs font-semibold transition-colors duration-200 motion-reduce:transition-none sm:px-4 sm:py-2.5 ${
            activeTab === "recordatorios"
              ? "text-white"
              : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          }`}
        >
          {activeTab === "recordatorios" && <motion.span layoutId="whatsapp-active-tab" transition={selectionTransition} aria-hidden="true" className="absolute inset-0 rounded-xl border border-primary bg-primary shadow-xs" />}
          <span className="relative z-10">Recordatorios y Mensajes</span>
        </button>
      </div>

      {/* ═══ CONTENIDO DE PESTAÑAS ═══ */}
      {activeTab === "asistente" ? (
        /* PESTAÑA 1: ASISTENTE VIRTUAL + SIMULADOR LADO A LADO */
        <div className="space-y-4 sm:space-y-5">
          <div className="grid gap-6 lg:grid-cols-12 items-start">
            {/* Columna Izquierda: Configuración Simple del Asistente */}
            <div className="lg:col-span-7 space-y-4">
              {/* 1. Interruptor Maestro */}
              <div data-tour="bot-asistente-card" className="rounded-3xl glass-panel px-4 py-4 sm:px-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white">Respuestas automáticas</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Respondé consultas y turnos.</p>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0">
                    <span
                      className={`text-xs font-semibold ${
                        autoBotEnabled ? "text-emerald-600" : "text-slate-400"
                      }`}
                    >
                      {autoBotEnabled ? "Activado" : "Pausado"}
                    </span>
                    <CustomSwitch
                      checked={autoBotEnabled}
                      onChange={(nextVal) => void handleAssistantToggle(nextVal)}
                      disabled={isSavingBotToggle}
                      label="Activar o pausar asistente"
                    />
                  </div>
                </div>
              </div>

              <details className="group/capabilities rounded-3xl glass-panel">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-2xl p-4 transition hover:bg-slate-50/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-emerald-500/50 dark:hover:bg-white/[0.03] sm:p-5 [&::-webkit-details-marker]:hidden">
                  <span className="text-xs font-semibold text-slate-900 dark:text-white sm:text-sm">Qué puede hacer el asistente</span>
                  <ChevronDown aria-hidden="true" className="h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 group-open/capabilities:rotate-180" />
                </summary>
                <div className="grid grid-cols-1 gap-x-8 px-4 pb-4 sm:grid-cols-2 sm:px-5 sm:pb-5">
                  {[
                    "Agenda turnos y comparte precios",
                    "Cambia o cancela citas",
                    "Responde mensajes de audio",
                    "Revisa comprobantes de pago",
                    "Informa puntos y premios",
                    "Deriva consultas a una persona",
                    "Te avisa si no tiene una respuesta",
                  ].map((capability) => (
                    <p key={capability} className="border-b border-slate-200/70 py-2.5 text-xs text-slate-700 dark:border-white/10 dark:text-slate-300">
                      {capability}
                    </p>
                  ))}
                </div>
              </details>

              {/* 3. Personalización Funcional del Asistente */}
              <div className="rounded-3xl glass-panel p-4 sm:p-5 space-y-5">
                <div className="pb-3 border-b border-slate-100 dark:border-white/5">
                  <h3 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white">
                    Ajustes del asistente
                  </h3>
                </div>

                {/* 3.1 Tono de Conversación */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Tono de respuesta
                  </label>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                    {([
                      {
                        id: "amigable",
                        title: "Cercano",
                        desc: "Usa voseo y un tono cálido.",
                      },
                      {
                        id: "formal",
                        title: "Formal",
                        desc: "Trato respetuoso y sobrio.",
                      },
                      {
                        id: "conciso",
                        title: "Breve",
                        desc: "Respuestas directas.",
                      },
                    ] as const).map((t) => {
                      return (
                        <button
                          key={t.id}
                          type="button"
                          aria-pressed={aiTone === t.id}
                          onClick={() => setAiTone(t.id)}
                          className={`relative flex cursor-pointer flex-col justify-between overflow-hidden rounded-xl border p-3 text-left transition-colors duration-200 motion-reduce:transition-none ${
                            aiTone === t.id
                              ? "border-transparent text-emerald-950 dark:text-emerald-100"
                              : "border-slate-200/80 dark:border-white/10 bg-slate-50/50 dark:bg-slate-800/30 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                          }`}
                        >
                          {aiTone === t.id && <motion.span layoutId="whatsapp-tone-selection" transition={selectionTransition} aria-hidden="true" className="absolute inset-0 rounded-xl border border-emerald-600 bg-emerald-50/70 ring-2 ring-emerald-600/20 dark:bg-emerald-950/40" />}
                          <div className="relative z-10">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-semibold">{t.title}</span>
                            </div>
                            <p className="text-[11px] opacity-80 leading-snug">{t.desc}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <details className="group/settings rounded-xl border border-slate-200/80 dark:border-white/10">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-3.5 py-3 transition hover:bg-slate-50/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-emerald-500/50 dark:hover:bg-white/[0.03] [&::-webkit-details-marker]:hidden">
                    <span>
                      <span className="block text-xs font-semibold text-slate-900 dark:text-white">Más ajustes</span>
                      <span className="block text-[11px] text-slate-500 dark:text-slate-400">
                        {notifyPersonalPhone ? "Avisos personales activos · reservas y horarios" : "Reservas, horarios y avisos"}
                      </span>
                    </span>
                    <ChevronDown aria-hidden="true" className="h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 group-open/settings:rotate-180" />
                  </summary>
                  <div className="space-y-5 border-t border-slate-200/70 px-3.5 py-4 dark:border-white/10">

                {/* 3.2 Interruptor de Emojis */}
                <div className="p-3.5 rounded-xl border border-slate-200/80 dark:border-white/10 bg-slate-50/60 dark:bg-slate-800/30 flex items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-semibold text-slate-900 dark:text-white">
                      Permitir emojis en los mensajes
                    </span>
                  </div>
                  <CustomSwitch
                    checked={allowEmojis}
                    onChange={(val) => setAllowEmojis(val)}
                    label="Permitir emojis"
                  />
                </div>

                {/* Preferencia de profesional */}
                <div className="p-3.5 rounded-xl border border-slate-200/80 dark:border-white/10 bg-slate-50/60 dark:bg-slate-800/30 flex items-center justify-between gap-3">
                  <div>
                    <div>
                      <span className="text-xs font-semibold text-slate-900 dark:text-white">
                        Preguntar con quién quiere atenderse
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">El cliente elige profesional.</p>
                  </div>
                  <CustomSwitch
                    checked={askStaffPreference}
                    onChange={(val) => setAskStaffPreference(val)}
                    label="Preguntar preferencia de profesional"
                  />
                </div>

                {/* Aviso de consultas sin respuesta */}
                <div className="p-3.5 rounded-xl border border-slate-200/80 dark:border-white/10 bg-slate-50/60 dark:bg-slate-800/30 flex items-center justify-between gap-3">
                  <div>
                    <div>
                      <span className="text-xs font-semibold text-slate-900 dark:text-white">
                        Avisarme si no sabe responder
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Derivá al encargado lo que no pueda resolver.</p>
                  </div>
                  <CustomSwitch
                    checked={handoffOnUnknownTopic}
                    onChange={(val) => setHandoffOnUnknownTopic(val)}
                    label="Avisar al encargado si la IA no sabe algo"
                  />
                </div>

                {/* 3.5 Anticipación Mínima para Reservar */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Anticipación mínima
                    </label>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-5">
                    {[
                      { minutes: 0, label: "En cualquier momento" },
                      { minutes: 30, label: "30 min antes" },
                      { minutes: 60, label: "1 hora antes" },
                      { minutes: 120, label: "2 horas antes" },
                      { minutes: 1440, label: "24 horas antes" },
                    ].map((item) => (
                      <button
                        key={item.minutes}
                        type="button"
                        aria-pressed={minNoticeMinutes === item.minutes}
                        onClick={() => setMinNoticeMinutes(item.minutes)}
                        className={`relative overflow-hidden rounded-xl border p-2 text-center text-xs font-semibold transition-colors duration-200 motion-reduce:transition-none ${
                          minNoticeMinutes === item.minutes
                            ? "border-transparent text-emerald-800 dark:text-emerald-200"
                            : "border-slate-200/80 dark:border-white/10 bg-slate-50/50 dark:bg-slate-800/30 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                        }`}
                      >
                        {minNoticeMinutes === item.minutes && <motion.span layoutId="whatsapp-notice-selection" transition={selectionTransition} aria-hidden="true" className="absolute inset-0 rounded-xl border border-emerald-600 bg-emerald-50 ring-2 ring-emerald-600/20 dark:bg-emerald-950/40" />}
                        <span className="relative z-10">{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3.5 Horario de Atención del Asistente */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Horario de respuesta
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button
                      type="button"
                      aria-pressed={serviceScheduleMode === "always"}
                      onClick={() => setServiceScheduleMode("always")}
                      className={`relative overflow-hidden rounded-xl border p-3 text-left transition-colors duration-200 motion-reduce:transition-none ${
                        serviceScheduleMode === "always"
                          ? "border-transparent text-emerald-950 dark:text-emerald-100"
                          : "border-slate-200/80 dark:border-white/10 bg-slate-50/50 dark:bg-slate-800/30 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                      }`}
                    >
                      {serviceScheduleMode === "always" && <motion.span layoutId="whatsapp-schedule-selection" transition={selectionTransition} aria-hidden="true" className="absolute inset-0 rounded-xl border border-emerald-600 bg-emerald-50/70 ring-2 ring-emerald-600/20 dark:bg-emerald-950/40" />}
                      <div className="relative z-10 mb-0.5">
                        <span className="text-xs font-semibold">Todo el día</span>
                      </div>
                      <p className="relative z-10 text-[11px] text-slate-500 dark:text-slate-400">
                        También fuera del horario del local.
                      </p>
                    </button>

                    <button
                      type="button"
                      aria-pressed={serviceScheduleMode === "business_hours"}
                      onClick={() => setServiceScheduleMode("business_hours")}
                      className={`relative overflow-hidden rounded-xl border p-3 text-left transition-colors duration-200 motion-reduce:transition-none ${
                        serviceScheduleMode === "business_hours"
                          ? "border-transparent text-emerald-950 dark:text-emerald-100"
                          : "border-slate-200/80 dark:border-white/10 bg-slate-50/50 dark:bg-slate-800/30 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                      }`}
                    >
                      {serviceScheduleMode === "business_hours" && <motion.span layoutId="whatsapp-schedule-selection" transition={selectionTransition} aria-hidden="true" className="absolute inset-0 rounded-xl border border-emerald-600 bg-emerald-50/70 ring-2 ring-emerald-600/20 dark:bg-emerald-950/40" />}
                      <div className="relative z-10 mb-0.5">
                        <span className="text-xs font-semibold">Horario del local</span>
                      </div>
                      <p className="relative z-10 text-[11px] text-slate-500 dark:text-slate-400">
                        Solo durante el horario del local.
                      </p>
                    </button>
                  </div>
                </div>

                {/* 3.7 Alerta a tu WhatsApp Personal cuando reserven */}
                <div className="rounded-2xl border border-slate-200/80 bg-slate-50/60 p-4 dark:border-white/10 dark:bg-slate-800/30">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <span className="block text-xs font-semibold text-slate-900 dark:text-white">
                        Avisos de nuevas reservas
                      </span>
                      <span className="mt-0.5 block text-[11px] text-slate-500 dark:text-slate-400">
                        Recibí cada reserva en tu WhatsApp personal.
                      </span>
                    </div>
                    <CustomSwitch
                      checked={notifyPersonalPhone}
                      onChange={(val) => void handlePersonalAlertToggle(val)}
                      disabled={isSavingPersonalAlert || isSavingAiSettings}
                      label="Avisarme al celular personal"
                      largeTarget
                    />
                  </div>

                  <div className="mt-3 space-y-2 border-t border-slate-200/60 pt-3 dark:border-white/5">
                    <label htmlFor="personal-alert-phone" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Número de WhatsApp personal
                    </label>
                    <div className="relative">
                      <Phone aria-hidden="true" className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                      <input
                        id="personal-alert-phone"
                        type="tel"
                        value={personalPhone}
                        onChange={(e) => setPersonalPhone(e.target.value)}
                        placeholder="+595 981 700 800"
                        autoComplete="tel"
                        className="w-full rounded-xl border border-slate-200/80 bg-white py-2 pl-9 pr-3 text-xs font-semibold text-slate-900 transition placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 dark:border-white/10 dark:bg-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <p aria-live="polite" className={`mt-2 min-h-4 truncate text-[11px] leading-4 ${notifyPersonalPhone && personalPhoneIsValid && personalAlertIsSaved ? "text-emerald-700 dark:text-emerald-300" : "text-slate-500 dark:text-slate-400"}`}>
                    {isSavingPersonalAlert
                      ? "Guardando preferencia…"
                      : notifyPersonalPhone && personalPhoneIsValid && personalAlertIsSaved
                        ? "Avisos activos."
                        : notifyPersonalPhone && personalPhoneIsValid
                          ? "Guardá para aplicar el cambio."
                        : notifyPersonalPhone
                          ? "Ingresá un número válido."
                          : "Avisos pausados. El número queda listo para configurar."}
                  </p>
                </div>

                {/* 3.8 Instrucciones Particulares del Local */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Datos importantes de tu local (opcional):
                    </label>
                    <span className="text-[11px] text-slate-400 tabular-nums">
                      {aiInstructions.length} letras
                    </span>
                  </div>
                  <textarea
                    rows={3}
                    value={aiInstructions}
                    onChange={(e) => setAiInstructions(e.target.value)}
                    placeholder="Ej.: estacionamiento, medios de pago o indicaciones especiales."
                    className="w-full rounded-xl border border-slate-200/80 dark:border-white/10 bg-slate-50 dark:bg-slate-800/50 p-3 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition resize-none"
                  />
                </div>
                  </div>
                </details>

                {/* Botón Guardar Cambios */}
                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={handleSaveAiSettings}
                    disabled={isSavingAiSettings || isSavingPersonalAlert}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md transition active:scale-98 cursor-pointer disabled:opacity-50"
                  >
                    {isSavingAiSettings ? (
                      <>
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                        <span>Guardando...</span>
                      </>
                    ) : (
                      <>
                        <Check className="h-3.5 w-3.5" />
                        <span>Guardar Cambios</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Columna Derecha: Simulador iPhone en Vivo */}
            <div data-tour="bot-simulator-card" className="lg:col-span-5 space-y-4">
              <div className="mx-auto flex w-full max-w-[360px] items-center justify-between px-2 pt-1">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Vista previa · no modifica turnos</span>
                <button
                  type="button"
                  onClick={() => {
                    setSimInput("");
                    setSimulationPhone(`+595${String(Math.floor(Math.random() * 100_000_000)).padStart(8, "0")}`);
                    setSimChatMessages([{
                      id: `welcome-${Date.now()}`,
                      sender: "bot",
                      type: "text",
                      text: `¡Hola! Bienvenido/a a *${business.name}*. ¿Qué servicio estás buscando?`,
                      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                    }]);
                    pushToast("success", "Conversación reiniciada.");
                  }}
                  disabled={isBotTypingSim}
                  className="rounded-lg px-2 py-1 text-xs font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white"
                >
                  Reiniciar
                </button>
              </div>
              <div className="relative mx-auto flex w-full items-center justify-center p-1 sm:p-2">
                <div className="relative w-full max-w-[360px] rounded-[38px] border border-white/20 bg-[#111215] p-[5px] shadow-[0_24px_56px_-24px_rgba(0,0,0,0.72)]">
                  {/* Pantalla */}
                  <div className="relative overflow-hidden rounded-[33px] bg-black p-[2px]">
                    <div className="relative flex h-[560px] flex-col overflow-hidden rounded-[31px] bg-[#efeae2] sm:h-[600px]">

                      {/* Barra superior de iPhone */}
                      <div className="relative z-30 flex h-10 items-center justify-between px-7 pt-2 text-[#000000] font-semibold text-[13px] tracking-tight select-none">
                        <span>9:41</span>
                        {/* Dynamic Island */}
                        <div aria-hidden="true" className="absolute left-1/2 top-2.5 h-5 w-20 -translate-x-1/2 rounded-full bg-black" />
                        {/* Señal y batería */}
                        <div className="flex items-center gap-1 text-black">
                          <Wifi className="h-3 w-3 stroke-[2.4]" />
                          <div className="h-2.5 w-4 rounded-[3px] border border-black p-[1px] flex items-center">
                            <div className="h-full w-full rounded-[1px] bg-black" />
                          </div>
                        </div>
                      </div>

                      {/* Cabecera de WhatsApp */}
                      <div className="relative z-20 flex items-center gap-2 bg-[#008069] px-3 py-2 text-white shadow-sm">
                        <div className="flex min-w-0 flex-1 items-center gap-2">
                          <ChevronLeft className="h-5 w-5 stroke-[2.5] -ml-1 text-white/90" />
                          <div className="relative shrink-0">
                            {business.logo ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={business.logo}
                                alt={business.name}
                                className="h-8 w-8 rounded-full object-cover border border-white/40"
                              />
                            ) : (
                              <div className="h-8 w-8 rounded-full bg-white/20 border border-white/40 flex items-center justify-center font-bold text-xs text-white">
                                {business.name.slice(0, 2).toUpperCase()}
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-xs font-bold text-white leading-tight">
                              {business.name}
                            </p>
                            <p className="mt-0.5 text-[10px] leading-none text-white/80">
                              {isBotTypingSim ? "escribiendo..." : "en línea"}
                            </p>
                          </div>
                        </div>
                        <div aria-hidden="true" className="flex shrink-0 items-center gap-3 pl-1 text-white/90">
                          <Video className="h-4 w-4" />
                          <PhoneCall className="h-4 w-4" />
                        </div>
                      </div>

                      {/* Lista de mensajes */}
                      <div
                        ref={chatScrollRef}
                        className="relative z-10 flex-1 overflow-y-auto px-3 py-2 space-y-2.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                      >
                        <div className="text-center my-1">
                          <span className="rounded-lg bg-[#ffffff]/80 px-2.5 py-0.5 text-[10px] font-semibold text-[#54656f] shadow-[0_1px_0.5px_rgba(11,20,26,0.13)] uppercase">
                            HOY
                          </span>
                        </div>

                        {simChatMessages.length === 0 && (
                          <div className="flex items-center justify-center px-4 py-16 text-center">
                            <p className="rounded-xl bg-white/85 px-3 py-2 text-[11px] text-[#54656f] shadow-[0_1px_2px_rgba(11,20,26,0.08)]">
                              Escribí un mensaje para probar el asistente.
                            </p>
                          </div>
                        )}

                        {simChatMessages.map((msg) => (
                          <div
                            key={msg.id}
                            className={`flex flex-col ${
                              msg.sender === "client" ? "items-end" : "items-start"
                            }`}
                          >
                            <div
                              className={`relative max-w-[86%] rounded-2xl px-3 py-2 text-xs leading-relaxed shadow-[0_1px_0.5px_rgba(11,20,26,0.15)] ${
                                msg.sender === "client"
                                  ? "rounded-tr-xs bg-[#d9fdd3] text-[#111b21]"
                                  : "rounded-tl-xs bg-white text-[#111b21]"
                              }`}
                            >
                              {renderWhatsAppFormatted(msg.text || "")}
                              <div className="mt-1 flex items-center justify-end gap-1 text-[9px] text-[#667781]">
                                <span>{msg.time}</span>
                                {msg.sender === "client" && (
                                  <CheckCheck className="h-3 w-3 text-[#53bdeb]" />
                                )}
                              </div>
                            </div>
                          </div>
                        ))}

                        {/* Indicador de escribiendo */}
                        {isBotTypingSim && (
                          <div className="flex justify-start">
                            <div className="rounded-2xl rounded-tl-xs bg-white px-3 py-2 text-slate-500 shadow-[0_1px_0.5px_rgba(11,20,26,0.15)] flex items-center gap-1.5">
                              <span className="h-1.5 w-1.5 rounded-full bg-[#008069] animate-pulse" />
                              <span className="h-1.5 w-1.5 rounded-full bg-[#008069] animate-pulse [animation-delay:200ms]" />
                              <span className="h-1.5 w-1.5 rounded-full bg-[#008069] animate-pulse [animation-delay:400ms]" />
                              <span className="text-[10px] ml-1 text-[#54656f]">
                                escribiendo...
                              </span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Barra de entrada de texto */}
                      <form
                        onSubmit={handleSimSendMessage}
                        className="relative z-20 flex items-center gap-2 border-t border-[#e4e7e7] bg-[#f0f2f5] p-2.5"
                      >
                        <input
                          type="text"
                          value={simInput}
                          onChange={(e) => setSimInput(e.target.value)}
                          placeholder="Mensaje"
                          aria-label="Escribí un mensaje para el asistente"
                          className="min-w-0 flex-1 rounded-full bg-white px-4 py-2 text-xs text-slate-800 outline-none placeholder:text-slate-500 focus-visible:ring-2 focus-visible:ring-[#008069]/40"
                        />
                        <button
                          type="submit"
                          disabled={!simInput.trim() || isBotTypingSim}
                          className="flex h-8 w-8 items-center justify-center rounded-full bg-[#008069] text-white disabled:opacity-40 transition cursor-pointer"
                        >
                          <Send className="h-3.5 w-3.5" />
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl glass-panel p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <h3 className="text-xs font-semibold text-slate-900 dark:text-white">Probar conversación</h3>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: "Precios", message: "¿Cuáles son los precios de corte y barba?" },
                    { label: "Turnos hoy", message: "¿Tenés turno disponible para hoy a las 16:00 hs?" },
                    { label: "Agendar", message: "Quiero agendar corte para mañana con Diego" },
                    { label: "Transferencia", message: "¿Cómo te puedo hacer una transferencia?" },
                    { label: "Puntos", message: "¿Cuántos puntos acumulados tengo?" },
                    { label: "Hablar con alguien", message: "Quiero hablar con una persona" },
                  ].map(({ label, message }) => (
                    <button
                      key={label}
                      type="button"
                      aria-label={"Probar consulta: " + message}
                      title={message}
                      onClick={() => triggerSimMessage(message)}
                      disabled={isBotTypingSim}
                      className="min-h-10 rounded-xl border border-slate-200/80 bg-slate-50 px-3 py-2 text-left text-xs font-medium text-slate-700 transition hover:border-primary/40 hover:bg-primary/5 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:bg-slate-800/50 dark:text-slate-200 dark:hover:bg-primary/10"
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* PESTAÑA 2: RECORDATORIOS AUTOMÁTICOS Y CRON JOB CONFIGURABLE */
        <div className="space-y-4 sm:space-y-5">
          {/* Barra superior de plantillas y botón de crear nuevo */}
          <div className="flex flex-col gap-3 rounded-3xl glass-panel p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-white sm:text-lg">
                Mensajes y recordatorios
              </h2>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Elegí qué recibe el cliente y cuándo.
              </p>
            </div>

            <button
              type="button"
              onClick={handleCreateNewReminder}
              className="inline-flex min-h-11 w-full items-center justify-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-xs font-semibold text-white shadow-xs transition hover:brightness-110 active:scale-95 sm:w-auto"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Nuevo recordatorio</span>
            </button>
          </div>

          {/* Selector de mensajes */}
          <div className="grid grid-cols-1 gap-2 min-[380px]:grid-cols-2 lg:grid-cols-4">
            {whatsappTemplates.map((template) => {
              const isSelected = selectedTemplateId === template.id;
              const hasTiming = typeof template.timingMinutesBefore === "number";
              const eventLabel = eventTemplateLabel(template.trigger);
              return (
                <button
                  key={template.id}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => setSelectedTemplateId(template.id)}
                  className={`flex min-h-[76px] min-w-0 flex-col gap-1.5 rounded-2xl border p-3 text-left text-xs transition cursor-pointer sm:gap-2 sm:p-3.5 ${
                    isSelected
                      ? "border-primary bg-primary text-white shadow-sm"
                      : "glass-panel-subtle text-slate-700 dark:text-slate-300 hover:border-primary/50"
                  }`}
                >
                  <span className="flex w-full min-w-0 items-start justify-between gap-2">
                    <span className="min-w-0 font-semibold leading-snug">{template.name}</span>
                    <span className={`mt-0.5 h-2 w-2 shrink-0 rounded-full ${template.enabled ? "bg-emerald-500 ring-2 ring-emerald-500/25" : isSelected ? "bg-white/60" : "bg-slate-400"}`} title={template.enabled ? "Plantilla activada" : "Plantilla pausada"} />
                  </span>
                  <span className={`flex items-center gap-1.5 text-[11px] ${isSelected ? "text-white/80" : "text-slate-500 dark:text-slate-400"}`}>
                    <Clock aria-hidden="true" className="h-3.5 w-3.5" />
                    {eventLabel || (hasTiming ? formatTimingLabel(template.timingMinutesBefore) : "Sin horario")}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Grid principal: Editor a la izquierda, Preview y Test a la derecha */}
          <div className="grid items-start gap-4 sm:gap-6 lg:grid-cols-12">
            <div data-tour="bot-templates-card" className="lg:col-span-7 space-y-4">
              {/* Programación */}
              <div className="rounded-3xl glass-panel p-4 sm:p-5 space-y-4">
                <div className="flex items-center justify-between gap-3 border-b border-slate-200/70 pb-3 dark:border-white/10">
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                      {currentEventLabel ? "Envío por evento" : "Cuándo se envía"}
                    </h3>
                    <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                      {currentEventLabel ? "Se activa al cambiar el estado del turno." : "Elegí la anticipación del mensaje."}
                    </p>
                  </div>
                </div>

                {currentEventLabel ? (
                  <p className="rounded-2xl glass-panel-subtle p-3 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                    Este mensaje se envía automáticamente. No necesita una hora de anticipación.
                  </p>
                ) : (
                  <>
                    <div className="space-y-2">
                      <span className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Anticipación
                      </span>
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                        {TIMING_PRESETS.map((preset) => {
                          const isActive = currentTemplate?.timingMinutesBefore === preset.minutes;
                          return (
                            <button
                              key={preset.minutes}
                              type="button"
                              aria-pressed={isActive}
                              onClick={() => {
                                if (currentTemplate) {
                                  updateWhatsAppTemplate(currentTemplate.id, {
                                    timingMinutesBefore: preset.minutes,
                                  });
                                  setHasUnsavedTemplateChanges(true);
                                }
                              }}
                              className={`min-h-12 cursor-pointer rounded-xl border px-2.5 py-2 text-center text-xs font-semibold transition ${
                                isActive
                                  ? "border-primary bg-primary font-semibold text-white shadow-xs"
                                  : "glass-panel-subtle text-slate-700 hover:border-primary/40 dark:text-slate-300"
                              }`}
                            >
                              {preset.label}
                            </button>
                          );
                        })}

                        <button
                          type="button"
                          aria-pressed={isImmediateReminder}
                          onClick={() => {
                            if (currentTemplate) {
                              updateWhatsAppTemplate(currentTemplate.id, {
                                timingMinutesBefore: 0,
                              });
                              setHasUnsavedTemplateChanges(true);
                            }
                          }}
                          className={`min-h-12 cursor-pointer rounded-xl border px-2.5 py-2 text-center text-xs font-semibold transition ${
                            isImmediateReminder
                              ? "border-primary bg-primary font-semibold text-white shadow-xs"
                              : "glass-panel-subtle text-slate-700 hover:border-primary/40 dark:text-slate-300"
                          }`}
                        >
                          Al inicio del turno
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 border-t border-slate-200/70 pt-3 dark:border-white/10">
                      <label htmlFor="custom-reminder-minutes" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Otro intervalo
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          id="custom-reminder-minutes"
                          type="number"
                          min={5}
                          max={10080}
                          step={5}
                          value={customMinutesInput}
                          onChange={(e) => setCustomMinutesInput(e.target.value)}
                          placeholder={String(currentTemplate?.timingMinutesBefore || 60)}
                          className="w-24 rounded-xl border border-slate-200/80 bg-white/70 px-3 py-2 text-xs tabular-nums text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/40 dark:border-white/10 dark:bg-white/[0.04] dark:text-white"
                        />
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">min</span>
                        <button
                          type="button"
                          onClick={() => {
                            const parsed = parseInt(customMinutesInput, 10);
                            if (Number.isInteger(parsed) && parsed >= 5 && parsed <= 10080 && currentTemplate) {
                              updateWhatsAppTemplate(currentTemplate.id, {
                                timingMinutesBefore: parsed,
                              });
                              setHasUnsavedTemplateChanges(true);
                              pushToast("success", `Tiempo configurado a ${formatTimingLabel(parsed)}.`);
                              setCustomMinutesInput("");
                            } else {
                              pushToast("error", "Ingresá un número entero entre 5 y 10.080 minutos.");
                            }
                          }}
                          className="min-h-9 rounded-xl border border-slate-200/80 px-3 text-xs font-semibold text-slate-700 transition hover:border-primary/40 hover:text-primary dark:border-white/10 dark:text-slate-200"
                        >
                          Aplicar
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Mensaje */}
              <div className="rounded-3xl glass-panel p-4 sm:p-5 space-y-4">
                <div className="flex flex-col gap-3 border-b border-slate-100 pb-3 min-[430px]:flex-row min-[430px]:items-end min-[430px]:justify-between dark:border-white/5">
                  <div className="min-w-0 flex-1">
                    <label htmlFor="template-name" className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                      Nombre del mensaje
                    </label>
                    <input
                      id="template-name"
                      type="text"
                      value={currentTemplate?.name || ""}
                      onChange={(e) => {
                        if (currentTemplate) {
                          updateWhatsAppTemplate(currentTemplate.id, { name: e.target.value });
                          setHasUnsavedTemplateChanges(true);
                        }
                      }}
                      className="w-full rounded-xl border border-slate-200/80 bg-slate-50 px-3.5 py-2.5 text-sm font-semibold text-slate-900 transition placeholder:text-slate-400 focus:border-primary/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:focus:bg-white/[0.07] dark:focus:ring-primary/25"
                      placeholder="Nombre de la plantilla..."
                    />
                  </div>

                  <div className="flex shrink-0 items-center justify-between gap-3 min-[430px]:justify-end">
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                      <span className="text-[11px] text-slate-400">
                        {currentTemplate?.enabled ? "Activado" : "Pausado"}
                      </span>
                      <CustomSwitch
                        checked={Boolean(currentTemplate?.enabled)}
                        onChange={() => {
                          if (currentTemplate) {
                            toggleWhatsAppTemplate(currentTemplate.id);
                            setHasUnsavedTemplateChanges(true);
                            pushToast(
                              "success",
                              `Plantilla ${currentTemplate.enabled ? "pausada" : "activada"} en el borrador. Guardá para aplicar el cambio.`
                            );
                          }
                        }}
                        label="Activar o pausar plantilla"
                      />
                    </div>

                    {currentTemplate && !["wt-confirmacion", "wt-recordatorio-24h", "wt-recordatorio-2h", "wt-cancelacion"].includes(currentTemplate.id) && (
                      <button
                        type="button"
                        onClick={() => handleDeleteCurrentTemplate(currentTemplate.id)}
                        className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
                        title="Eliminar este recordatorio"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Área de texto */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label htmlFor="template-body" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Mensaje para tus clientes
                    </label>
                    <span className="text-[11px] text-slate-400 tabular-nums">
                      {currentTemplate?.body?.length || 0} caracteres
                    </span>
                  </div>
                  <textarea
                    id="template-body"
                    ref={templateBodyRef}
                    rows={6}
                    maxLength={4000}
                    value={currentTemplate?.body || ""}
                    onChange={(e) => {
                      if (currentTemplate) {
                        updateWhatsAppTemplate(currentTemplate.id, e.target.value);
                        setHasUnsavedTemplateChanges(true);
                      }
                    }}
                    placeholder="Escribí el texto que le llegará a tus clientes..."
                    className="w-full rounded-xl border border-slate-200/80 dark:border-white/10 bg-slate-50 dark:bg-slate-800/50 p-3.5 text-xs text-slate-900 dark:text-white tabular-nums leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#FF4F2B]/40 transition resize-y"
                  />
                </div>

                <details className="group/variables rounded-2xl glass-panel-subtle">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-2xl px-3.5 py-3 text-xs font-semibold text-slate-700 transition hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/50 dark:text-slate-200 [&::-webkit-details-marker]:hidden">
                    <span>Personalizar con datos del turno</span>
                    <ChevronDown aria-hidden="true" className="h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 group-open/variables:rotate-180" />
                  </summary>
                  <div className="space-y-3 border-t border-slate-200/70 px-3.5 py-3 dark:border-white/10">
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Elegí un dato para insertarlo en el mensaje.</p>
                    <div className="flex flex-wrap gap-1.5">
                      {AVAILABLE_TAGS.map((t) => (
                        <button
                          key={t.tag}
                          type="button"
                          onClick={() => insertTag(t.tag)}
                          className="group inline-flex min-h-8 items-center gap-1 rounded-lg border border-primary/15 bg-primary/5 px-2.5 py-1 tabular-nums text-[11px] text-slate-700 transition hover:border-primary/40 hover:bg-primary/10 dark:text-slate-200 active:scale-95"
                          title={`Ejemplo: ${t.sample}`}
                        >
                          <span className="font-semibold text-primary">{t.tag}</span>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400">({t.label})</span>
                        </button>
                      ))}
                    </div>
                    <p className="border-t border-slate-200/70 pt-2 text-[11px] text-slate-500 dark:border-white/10 dark:text-slate-400">
                      Formato: <span className="font-semibold">*negrita*</span>, _cursiva_, ~tachado~ o `código`.
                    </p>
                  </div>
                </details>
              </div>

              {/* Guardado */}
              <div className="flex flex-col items-start justify-between gap-3 rounded-2xl glass-panel-subtle p-3.5 sm:flex-row sm:items-center sm:p-4">
                <div className="text-xs text-slate-600 dark:text-slate-300" aria-live="polite">
                  {hasUnsavedTemplateChanges ? "Hay cambios sin guardar." : "Todos los cambios están guardados."}
                </div>
                <button
                  type="button"
                  onClick={handleSaveTemplates}
                  disabled={isSavingTemplates}
                  className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-semibold text-white shadow-xs transition hover:brightness-110 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                >
                  {isSavingTemplates ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Guardando…</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      <span>Guardar cambios</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* COLUMNA DERECHA: VISTA PREVIA VISUAL EN VIVO + PRUEBA EN TIEMPO REAL */}
            <div className="lg:col-span-5 space-y-4">
              {/* Simulador de WhatsApp Estilo Móvil */}
              <div className="overflow-hidden rounded-3xl border border-[#e7ece8] bg-[#ffffff] shadow-xl">
                {/* Cabecera estilo WhatsApp oficial */}
                <div className="bg-[#008069] text-white px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white font-bold text-sm shrink-0 border border-white/30">
                      {business.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs sm:text-sm tracking-tight truncate max-w-[170px]">
                          {business.name}
                        </span>
                        <BadgeCheck className="h-3.5 w-3.5 text-white/90 shrink-0" />
                      </div>
                      <span className="text-[10px] text-white/80 block">
                        Cuenta de empresa oficial • En línea
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-white/80">
                    <Video className="h-4 w-4" />
                    <Phone className="h-4 w-4" />
                  </div>
                </div>

                {/* Fondo de conversación de WhatsApp */}
                <div
                  className="flex min-h-[300px] flex-col justify-end bg-[#efeae2] p-4"
                  style={{
                    backgroundImage: `radial-gradient(circle, rgba(0,0,0,0.04) 1px, transparent 1px)`,
                    backgroundSize: "16px 16px",
                  }}
                >
                  {/* Globo de mensaje saliente de WhatsApp */}
                  <div className="relative max-w-[88%] self-end break-words rounded-2xl rounded-tr-xs border border-[#c9e7c4] bg-[#d9fdd3] p-3.5 text-xs leading-relaxed text-[#18221d] shadow-sm [overflow-wrap:anywhere]">
                    {renderWhatsAppFormatted(currentTemplate ? getPreviewText(currentTemplate.body) : "")}

                    <div className="mt-2 flex items-center justify-end gap-1 text-[9px] font-mono text-[#60736a]">
                      <span>14:30</span>
                      <CheckCheck className="h-3.5 w-3.5 text-[#53bdeb]" />
                    </div>
                  </div>
                </div>

                {/* Barra inferior del simulador */}
                <div className="flex items-center justify-between border-t border-[#e7ece8] bg-[#ffffff] px-3 py-2.5 text-[11px] text-[#65706a]">
                  <span className="flex items-center gap-1.5 font-medium">
                    <Eye className="h-3.5 w-3.5 text-[#FF4F2B]" />
                    <span>Vista previa con datos de ejemplo</span>
                  </span>
                </div>
              </div>

              {/* CARD DE PRUEBA REAL EN VIVO A MI WHATSAPP */}
              <div className="rounded-3xl glass-panel p-4 sm:p-5 space-y-3.5">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
                    <Send className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                      Probar Envío a mi WhatsApp
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Enviate esta plantilla a tu propio celular para verificar el formato antes de activarla.
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="test-phone" className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block">
                    Número de teléfono receptor (con código de país ej: 595981...):
                  </label>
                  <div className="flex flex-col gap-2 min-[430px]:flex-row">
                    <input
                      id="test-phone"
                      type="tel"
                      value={testPhone}
                      onChange={(e) => setTestPhone(e.target.value)}
                      placeholder="+595 981 123 456"
                      className="min-w-0 flex-1 rounded-xl border border-slate-200/80 dark:border-white/10 bg-slate-50 dark:bg-slate-800/50 px-3 py-2 text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition"
                    />
                    <button
                      type="button"
                      onClick={handleSendTestReminder}
                      disabled={isSendingTestReminder || !isConnected}
                      className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow-xs transition hover:brightness-110 active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed min-[430px]:shrink-0"
                    >
                      {isSendingTestReminder ? (
                        <>
                          <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                          <span>Enviando...</span>
                        </>
                      ) : (
                        <>
                          <Send className="h-3.5 w-3.5" />
                          <span>Enviar Prueba</span>
                        </>
                      )}
                    </button>
                  </div>
                  {!isConnected && (
                    <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold block">
                      ⚠️ Tu WhatsApp oficial no está vinculado aún. Conectalo con el código QR para enviar mensajes reales.
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <details className="group/reminder-help rounded-2xl glass-panel-subtle">
            <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 rounded-2xl px-4 py-3 text-xs font-semibold text-slate-700 transition hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/50 dark:text-slate-200 [&::-webkit-details-marker]:hidden">
              <span>¿Cómo se envían estos mensajes?</span>
              <ChevronDown aria-hidden="true" className="h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 group-open/reminder-help:rotate-180" />
            </summary>
            <p className="border-t border-slate-200/70 px-4 py-3 text-xs leading-relaxed text-slate-600 dark:border-white/10 dark:text-slate-300">
              Las confirmaciones y cancelaciones salen cuando cambia el turno. Los recordatorios se envían según la anticipación elegida, desde tu número de WhatsApp conectado.
            </p>
          </details>
        </div>
      )}

      {/* ═══ MODAL PARA VINCULAR CON CÓDIGO QR ═══ */}
      {isConnectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900 p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
                  <QrCode className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-slate-900 dark:text-white">
                    Vincular WhatsApp Oficial
                  </h3>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Escaneá con tu celular para conectar
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsConnectModalOpen(false)}
                className="rounded-full p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="relative flex flex-col items-center justify-center p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-white/10">
              <div className="relative p-4 bg-white rounded-2xl shadow-xs border border-slate-100">
                {isConnected ? (
                  <div className="flex h-48 w-48 flex-col items-center justify-center gap-3 text-center">
                    <CheckCircle2 className="h-12 w-12 text-emerald-500" />
                    <div>
                      <p className="text-sm font-semibold text-slate-900">WhatsApp conectado</p>
                      <p className="mt-1 text-xs text-slate-500">{activeConnectedPhone}</p>
                    </div>
                  </div>
                ) : qrCodeDataUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={qrCodeDataUrl}
                    alt="Código QR de Vinculación de WhatsApp"
                    className="h-48 w-48 object-contain rounded-lg"
                  />
                ) : (
                  <div className="flex h-48 w-48 flex-col items-center justify-center gap-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-center">
                    {isConnecting || connectionStatus === "checking" ? (
                      <RefreshCw className="h-5 w-5 animate-spin text-emerald-600" />
                    ) : (
                      <QrCode className="h-8 w-8 text-slate-400" />
                    )}
                    <span className="px-4 text-xs text-slate-500">
                      {isConnecting || connectionStatus === "checking" ? "Conectando con WhatsApp…" : "No hay un código QR disponible."}
                    </span>
                  </div>
                )}
              </div>

              <p className="mt-3 text-center text-xs text-slate-500 dark:text-slate-400">
                {isConnected ? "La cuenta ya está lista para recibir mensajes." : "El estado se actualiza automáticamente mientras vinculás el dispositivo."}
              </p>
            </div>

            {connectionError && (
              <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-3 text-xs text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-300">
                {connectionError}
              </div>
            )}

            {!isConnected && (
              <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-xl border border-slate-100 dark:border-white/5">
                <p className="font-semibold text-slate-900 dark:text-white">Para vincular</p>
                <ol className="list-decimal pl-4 space-y-1 text-[11px]">
                  <li>Abrí WhatsApp y entrá a <strong>Dispositivos vinculados</strong>.</li>
                  <li>Elegí <strong>Vincular dispositivo</strong> y escaneá el QR.</li>
                </ol>
              </div>
            )}

            <div className="flex gap-2 pt-1">
              {isConnected && (
                <button
                  type="button"
                  onClick={() => void handleDisconnect()}
                  disabled={isConnecting}
                  className="rounded-xl border border-rose-200 dark:border-rose-900/40 bg-rose-50 dark:bg-rose-950/20 text-rose-600 hover:bg-rose-100 py-2.5 px-3 text-xs font-semibold transition cursor-pointer"
                >
                  {isConnecting ? "Desconectando…" : "Desconectar cuenta"}
                </button>
              )}
              {!isConnected && (
                <button
                  type="button"
                  onClick={() => void startWhatsAppConnection()}
                  disabled={isConnecting}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2.5 text-xs shadow-md transition disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isConnecting ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <QrCode className="h-3.5 w-3.5" />}
                  {isConnecting ? "Generando QR…" : "Actualizar código QR"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ═══ MODAL DE AYUDA / SOPORTE ═══ */}
      {isHelpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
                  <PhoneCall className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-slate-900 dark:text-white">
                    Soporte & Asistencia
                  </h3>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Equipo de AgendatePY
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsHelpModalOpen(false)}
                className="rounded-full p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
              <p>
                Si necesitás ayuda para vincular tu WhatsApp o configurar tu negocio, nuestro equipo te asiste en minutos.
              </p>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-white/5 space-y-1">
                <span className="text-[11px] text-slate-400 block font-semibold">WhatsApp de Soporte Directo:</span>
                <span className="text-sm tabular-nums font-semibold text-emerald-600">+595 981 700 800</span>
              </div>
            </div>

            <div className="pt-2">
              <a
                href="https://wa.me/595981700800?text=Hola,%20necesito%20ayuda%20con%20mi%20asistente%20de%20WhatsApp%20en%20AgendatePY"
                target="_blank"
                rel="noreferrer"
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2.5 text-xs shadow-md transition cursor-pointer"
              >
                <span>Chatear con Soporte</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
