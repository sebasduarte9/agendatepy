"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import QRCode from "qrcode";
import {
  Bot,
  MessageSquare,
  QrCode,
  CheckCircle2,
  Clock,
  Send,
  Lock,
  Zap,
  Check,
  RotateCcw,
  Phone,
  Calendar,
  MapPin,
  BadgeCheck,
  Wifi,
  ChevronLeft,
  Video,
  Mic,
  PhoneCall,
  Sparkles,
  CreditCard,
  Tag,
  UserCheck,
  RefreshCw,
  X,
  CheckCheck,
  Plus,
  ArrowRight,
  Smile,
  Briefcase,
  Layers,
  HelpCircle,
  Users,
  Bell,
  Smartphone,
  Sun,
  Moon,
  ShieldAlert,
} from "lucide-react";
import { useDashboardStore } from "@/store/useDashboardStore";
import { tenantPublicUrl } from "@/lib/tenant/public-url";

// Dynamic message tags for reminder templates
const AVAILABLE_TAGS = [
  { tag: "{cliente}", label: "Nombre Cliente" },
  { tag: "{servicio}", label: "Servicio" },
  { tag: "{profesional}", label: "Profesional" },
  { tag: "{fecha}", label: "Fecha" },
  { tag: "{hora}", label: "Hora" },
  { tag: "{negocio}", label: "Nombre Negocio" },
  { tag: "{direccion}", label: "Dirección" },
  { tag: "{link_autogestion}", label: "Link Autogestión" },
  { tag: "{link_negocio}", label: "Link del Negocio" },
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
              <strong key={partIdx} className="font-bold text-slate-900">
                {part.slice(1, -1)}
              </strong>
            );
          }
          if (part.startsWith("_") && part.endsWith("_") && part.length > 2) {
            return (
              <em key={partIdx} className="italic text-slate-800">
                {part.slice(1, -1)}
              </em>
            );
          }
          if (part.startsWith("~") && part.endsWith("~") && part.length > 2) {
            return (
              <del key={partIdx} className="line-through text-slate-400">
                {part.slice(1, -1)}
              </del>
            );
          }
          if (part.startsWith("`") && part.endsWith("`") && part.length > 2) {
            return (
              <code key={partIdx} className="font-mono bg-black/10 px-1 py-0.5 rounded text-[11px]">
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
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      className={`group relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 ${
        disabled
          ? "opacity-40 cursor-not-allowed bg-slate-200 dark:bg-slate-800"
          : checked
          ? "bg-emerald-600 dark:bg-emerald-500"
          : "bg-slate-200 dark:bg-slate-700"
      }`}
    >
      {label && <span className="sr-only">{label}</span>}
      <span
        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
          checked ? "translate-x-6" : "translate-x-1"
        }`}
      />
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
    toggleWhatsAppTemplate,
    updateBusiness,
    pushToast,
  } = useDashboardStore();

  const isConnected = Boolean(evolutionConfig.connected);

  // Solamente 2 pestañas simples: "asistente" (por defecto) o "recordatorios"
  const [activeTab, setActiveTab] = useState<"asistente" | "recordatorios">("asistente");

  // Configuración funcional del Asistente
  const [autoBotEnabled, setAutoBotEnabled] = useState(evolutionConfig.autoBotEnabled !== false);
  const [allowEmojis, setAllowEmojis] = useState(Boolean(evolutionConfig.allowEmojis));
  const [askStaffPreference, setAskStaffPreference] = useState(evolutionConfig.askStaffPreference !== false);
  const [notifyPersonalPhone, setNotifyPersonalPhone] = useState(evolutionConfig.notifyPersonalPhoneOnBooking !== false);
  const [handoffOnUnknownTopic, setHandoffOnUnknownTopic] = useState(evolutionConfig.handoffOnUnknownTopic !== false);
  const [personalPhone, setPersonalPhone] = useState(
    evolutionConfig.personalPhone || evolutionConfig.humanHandoffPhone || business.whatsappNumber || business.phone || ""
  );
  const [phoneType, setPhoneType] = useState<"business" | "personal">(evolutionConfig.phoneType || "business");
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

  useEffect(() => {
    if (evolutionConfig.autoBotEnabled !== undefined) {
      setAutoBotEnabled(evolutionConfig.autoBotEnabled !== false);
    }
    if (evolutionConfig.allowEmojis !== undefined) {
      setAllowEmojis(Boolean(evolutionConfig.allowEmojis));
    }
    if (evolutionConfig.askStaffPreference !== undefined) {
      setAskStaffPreference(evolutionConfig.askStaffPreference !== false);
    }
    if (evolutionConfig.notifyPersonalPhoneOnBooking !== undefined) {
      setNotifyPersonalPhone(evolutionConfig.notifyPersonalPhoneOnBooking !== false);
    }
    if (evolutionConfig.handoffOnUnknownTopic !== undefined) {
      setHandoffOnUnknownTopic(evolutionConfig.handoffOnUnknownTopic !== false);
    }
    if (evolutionConfig.personalPhone !== undefined) {
      setPersonalPhone(evolutionConfig.personalPhone);
    }
    if (evolutionConfig.phoneType !== undefined) {
      setPhoneType(evolutionConfig.phoneType);
    }
    if (evolutionConfig.minNoticeMinutes !== undefined) {
      setMinNoticeMinutes(evolutionConfig.minNoticeMinutes);
    }
    if (evolutionConfig.serviceScheduleMode !== undefined) {
      setServiceScheduleMode(evolutionConfig.serviceScheduleMode);
    }
    if (evolutionConfig.aiTone) {
      setAiTone(evolutionConfig.aiTone);
    }
    if (evolutionConfig.aiInstructions !== undefined) {
      setAiInstructions(evolutionConfig.aiInstructions);
    }
    if (evolutionConfig.humanHandoffPhone !== undefined) {
      setHumanHandoffPhone(evolutionConfig.humanHandoffPhone);
    }
  }, [evolutionConfig]);

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

  function handleSaveAiSettings() {
    setIsSavingAiSettings(true);
    updateEvolutionConfig({
      autoBotEnabled,
      allowEmojis,
      askStaffPreference,
      notifyPersonalPhoneOnBooking: notifyPersonalPhone,
      handoffOnUnknownTopic,
      personalPhone: personalPhone.trim(),
      phoneType,
      minNoticeMinutes,
      serviceScheduleMode,
      aiTone,
      aiInstructions,
      humanHandoffPhone: personalPhone.trim() || humanHandoffPhone.trim(),
    });
    setTimeout(() => {
      setIsSavingAiSettings(false);
      pushToast("success", "Configuración guardada correctamente.");
    }, 350);
  }

  // Modales
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState("");
  const [modalPhoneNumber, setModalPhoneNumber] = useState(
    evolutionConfig.phoneNumber || business.whatsappNumber || business.phone || "+595 981 700 800"
  );

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
      text: `¡Hola! Bienvenido/a a *${business.name}*. ¿En qué podemos ayudarte hoy?\n\nPodés preguntarme por *precios*, *horarios libres* o pedirme para *agendar tu turno*.`,
      time: "10:00",
    },
  ]);
  const [simInput, setSimInput] = useState("");
  const [isBotTypingSim, setIsBotTypingSim] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement | null>(null);

  // Pestaña de Recordatorios Automáticos
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(
    whatsappTemplates[0]?.id || "wt-confirmacion"
  );
  const [testPhone, setTestPhone] = useState(
    business.whatsappNumber || business.phone || "+595 981 000 000"
  );

  const currentTemplate =
    whatsappTemplates.find((t) => t.id === selectedTemplateId) ||
    whatsappTemplates[0];

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [simChatMessages, isBotTypingSim]);

  // Generador de Código QR
  const generateQrCode = useCallback(() => {
    const sessionId = `AGPY_${(business.slug || "central").toUpperCase()}_${Date.now()}`;
    const payload = `2@${Array.from({ length: 24 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join("")},${sessionId},${Date.now()}`;

    QRCode.toDataURL(payload, {
      width: 260,
      margin: 2,
      color: {
        dark: "#111827",
        light: "#ffffff",
      },
    })
      .then((url) => setQrCodeDataUrl(url))
      .catch((err) => console.error("Error generating QR:", err));
  }, [business.slug]);

  useEffect(() => {
    if (isConnectModalOpen) {
      generateQrCode();
    }
  }, [isConnectModalOpen, generateQrCode]);

  function triggerSimMessage(text: string) {
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
        try {
          const aiRes = await fetch("/api/ai/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              message: userMsg,
              tenantSlug: business.slug,
              clientPhone: business.whatsappNumber || business.phone || "+595 981 765 432",
              clientName: "Cliente WhatsApp",
              configOverrides: {
                allowEmojis,
                askStaffPreference,
                handoffOnUnknownTopic,
                aiTone,
                aiInstructions,
                notifyPersonalPhoneOnBooking: notifyPersonalPhone,
                personalPhone: personalPhone.trim(),
              },
            }),
          });
          if (aiRes.ok) {
            const aiData = await aiRes.json();
            if (aiData.replyText) {
              replyText = aiData.replyText;
            }
          }
        } catch (err) {
          console.error("Error consultando asistente:", err);
        }
      }

      if (!replyText) {
        if (!autoBotEnabled) {
          replyText = "El asistente se encuentra pausado en este momento. Podés activarlo en el interruptor de la izquierda.";
        } else {
          replyText = `¡Hola! Gracias por comunicarte con *${business.name}*. Podés consultarme por precios, horarios libres o pedirme agendar tu turno.`;
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
    } catch (e) {
      console.error(e);
    } finally {
      setIsBotTypingSim(false);
    }
  }

  function handleConnectSimulated() {
    const phoneToSet = modalPhoneNumber.trim() || business.phone || "+595 981 700 800";
    updateEvolutionConfig({
      connected: true,
      phoneNumber: phoneToSet,
      lastSync: new Date().toISOString(),
    });
    updateBusiness({ whatsappNumber: phoneToSet });
    setIsConnectModalOpen(false);
    pushToast("success", `WhatsApp vinculado con éxito (${phoneToSet}).`);
  }

  function handleDisconnect() {
    updateEvolutionConfig({ connected: false, phoneNumber: "" });
    pushToast("error", "WhatsApp desconectado.");
  }

  function insertTag(tag: string) {
    if (!currentTemplate) return;
    const updated = (currentTemplate.body || "") + " " + tag;
    updateWhatsAppTemplate(currentTemplate.id, updated);
  }

  function getPreviewText(rawBody: string) {
    return rawBody
      .replace(/{cliente}/g, "Martín Benítez")
      .replace(/{servicio}/g, "Corte Fade Clásico")
      .replace(/{profesional}/g, "Diego Franco")
      .replace(/{fecha}/g, "Jueves 24 de Octubre")
      .replace(/{hora}/g, "15:30 hs")
      .replace(/{negocio}/g, business.name)
      .replace(/{direccion}/g, business.address || "Avda. Santa Teresa 1420")
      .replace(/{link_autogestion}/g, tenantPublicUrl(business.slug, "/turno/AG-9421"))
      .replace(/{link_negocio}/g, tenantPublicUrl(business.slug));
  }

  const activeConnectedPhone = evolutionConfig.phoneNumber || business.whatsappNumber || business.phone || "+595 981 700 800";

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-20">
      {/* ═══ CABECERA PRINCIPAL ═══ */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between py-1">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <span>Asistente de WhatsApp</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Atención automática de tus clientes y recordatorios de turnos por WhatsApp.
          </p>
        </div>

        {/* Botones de acción */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            data-tour="bot-support-action"
            onClick={() => setIsHelpModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <PhoneCall className="h-3.5 w-3.5 text-slate-400" />
            <span>Ayuda / Soporte</span>
          </button>

          {/* Estado de conexión */}
          <div className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-xs">
            <span
              className={`h-2.5 w-2.5 rounded-full ${
                isConnected
                  ? "bg-emerald-500 ring-4 ring-emerald-500/20 animate-pulse"
                  : "bg-amber-500 ring-4 ring-amber-500/20"
              }`}
            />
            <span>{isConnected ? "WhatsApp Conectado" : "WhatsApp Desconectado"}</span>
          </div>

          {isConnected ? (
            <button
              type="button"
              onClick={() => setIsConnectModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white shadow-md transition hover:brightness-110 cursor-pointer bg-slate-800 hover:bg-slate-700"
            >
              <QrCode className="h-3.5 w-3.5" />
              <span>Cambiar QR</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsConnectModalOpen(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-white shadow-lg transition-all duration-300 hover:brightness-110 active:scale-95 cursor-pointer bg-emerald-600 hover:bg-emerald-500"
            >
              <QrCode className="h-3.5 w-3.5" />
              <span>Vincular con QR</span>
            </button>
          )}
        </div>
      </div>

      {/* ═══ RESUMEN RÁPIDO DEL SERVICIO ═══ */}
      <div data-tour="bot-status-card" className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/10 p-4 sm:p-5 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-white/5 flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[11px] text-slate-400 font-semibold block">Respuestas Automáticas</span>
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                {autoBotEnabled ? "Activo las 24 horas" : "Pausado"}
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-white/5 flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[11px] text-slate-400 font-semibold block">Recordatorios a Clientes</span>
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                Avisos 24h y 2h antes
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-white/5 flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-500/10 text-sky-600">
              <Phone className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[11px] text-slate-400 font-semibold block">Línea del Local</span>
              <span className="text-xs font-bold text-slate-900 dark:text-white font-mono truncate block max-w-[170px]">
                {isConnected ? activeConnectedPhone : "Pendiente de vincular"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Alerta si WhatsApp no está vinculado */}
      {!isConnected && (
        <div className="rounded-2xl border border-amber-300/80 dark:border-amber-500/30 bg-amber-50/70 dark:bg-amber-950/20 p-5 text-center space-y-3">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
            <Lock className="h-5 w-5" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
              Vinculá tu WhatsApp para activar las respuestas
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Escaneá el código QR desde tu celular para que tu asistente pueda atender a tus clientes y enviar recordatorios de turnos.
            </p>
          </div>
          <div>
            <button
              type="button"
              onClick={() => setIsConnectModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 text-xs shadow-md transition cursor-pointer"
            >
              <QrCode className="h-4 w-4" />
              <span>Vincular mi WhatsApp Ahora (QR)</span>
            </button>
          </div>
        </div>
      )}

      {/* ═══ PESTAÑAS (SÓLO 2: ASISTENTE VIRTUAL O RECORDATORIOS) ═══ */}
      <div className="p-1 rounded-2xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200/80 dark:border-white/10 flex gap-1">
        <button
          type="button"
          onClick={() => setActiveTab("asistente")}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === "asistente"
              ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs border border-slate-200/60 dark:border-white/10"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
          <span>Asistente Virtual</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("recordatorios")}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === "recordatorios"
              ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs border border-slate-200/60 dark:border-white/10"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Layers className="h-3.5 w-3.5 text-indigo-600" />
          <span>Recordatorios y Mensajes</span>
        </button>
      </div>

      {/* ═══ CONTENIDO DE PESTAÑAS ═══ */}
      {activeTab === "asistente" ? (
        /* PESTAÑA 1: ASISTENTE VIRTUAL + SIMULADOR LADO A LADO */
        <div className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-12 items-start">
            {/* Columna Izquierda: Configuración Simple del Asistente */}
            <div className="lg:col-span-7 space-y-4">
              {/* 1. Interruptor Maestro */}
              <div data-tour="bot-asistente-card" className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900 p-5 shadow-2xs space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600">
                      <Sparkles className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                        Atención Automática por WhatsApp
                      </h2>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Responde consultas, audios, fotos de pagos y agenda turnos las 24 horas.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0">
                    <span
                      className={`text-xs font-bold ${
                        autoBotEnabled ? "text-emerald-600" : "text-slate-400"
                      }`}
                    >
                      {autoBotEnabled ? "Activado" : "Pausado"}
                    </span>
                    <CustomSwitch
                      checked={autoBotEnabled}
                      onChange={(nextVal) => {
                        setAutoBotEnabled(nextVal);
                        updateEvolutionConfig({ autoBotEnabled: nextVal });
                        pushToast(
                          "success",
                          nextVal
                            ? "Asistente activado para responder a tus clientes."
                            : "Asistente pausado temporalmente."
                        );
                      }}
                      label="Activar o pausar asistente"
                    />
                  </div>
                </div>
              </div>

              {/* 2. Lo que hace tu asistente (explicado simple, sin tecnicismos) */}
              <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900 p-5 space-y-3.5 shadow-2xs">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-white/5">
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Zap className="h-4 w-4 text-emerald-600" />
                    <span>¿Qué hace tu Asistente Automático?</span>
                  </h3>
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
                    Todo incluido
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-white/5 space-y-1">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                      <Calendar className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                      <span>Agenda turnos y dice precios</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                      Sabe qué horarios y profesionales tenés libres y confirma la cita en tu agenda.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-white/5 space-y-1">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                      <RotateCcw className="h-3.5 w-3.5 text-sky-600 shrink-0" />
                      <span>Cambia o cancela citas</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                      Si el cliente te avisa que no puede venir o quiere otra hora, el asistente lo cambia solo.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-white/5 space-y-1">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                      <Mic className="h-3.5 w-3.5 text-purple-600 shrink-0" />
                      <span>Escucha audios de WhatsApp</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                      Si el cliente manda un audio en vez de escribir, el asistente lo escucha y le responde.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-white/5 space-y-1">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                      <CreditCard className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                      <span>Revisa fotos de transferencias</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                      Si te mandan una foto de comprobante de transferencia, revisa el banco y el monto pagado.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-white/5 space-y-1">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                      <Tag className="h-3.5 w-3.5 text-rose-600 shrink-0" />
                      <span>Informa sobre puntos y premios</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                      Le dice al cliente cuántos puntos tiene acumulados y qué descuentos puede usar.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-white/5 space-y-1">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                      <UserCheck className="h-3.5 w-3.5 text-indigo-600 shrink-0" />
                      <span>Pausa si contestás vos</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                      Si vos contestás desde tu WhatsApp o el cliente pide una persona, se pausa 30 minutos.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-white/5 space-y-1 sm:col-span-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                      <ShieldAlert className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                      <span>Te avisa a tu celular si no sabe algo o consultan por un producto</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                      Si preguntan por un producto no cargado o una duda particular del local, la IA no inventa nada: le dice con amabilidad que no dispone de esa información y te manda un WhatsApp con la consulta para que lo contactes.
                    </p>
                  </div>
                </div>
              </div>

              {/* 3. Personalización Funcional del Asistente */}
              <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900 p-5 space-y-5 shadow-2xs">
                <div className="pb-3 border-b border-slate-100 dark:border-white/5">
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                    Personalización & Reglas de Atención
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Ajustá cómo querés que hable tu asistente y qué reglas debe seguir con tus clientes.
                  </p>
                </div>

                {/* 3.1 Tono de Conversación */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    ¿Cómo querés que hable tu asistente?:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {[
                      {
                        id: "amigable",
                        icon: Smile,
                        title: "Amigable y Cercano",
                        desc: "De 'vos', amable, cálido y con modismos paraguayos.",
                      },
                      {
                        id: "formal",
                        icon: Briefcase,
                        title: "Formal y Respetuoso",
                        desc: "De 'usted', cortés, corporativo y sobrio.",
                      },
                      {
                        id: "conciso",
                        icon: Zap,
                        title: "Rápido y Breve",
                        desc: "Respuestas cortas, directas y al grano.",
                      },
                    ].map((t) => {
                      const IconComp = t.icon;
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setAiTone(t.id as any)}
                          className={`p-3 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                            aiTone === t.id
                              ? "border-emerald-600 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-100 ring-2 ring-emerald-600/20"
                              : "border-slate-200/80 dark:border-white/10 bg-slate-50/50 dark:bg-slate-800/30 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-bold flex items-center gap-1.5">
                                <IconComp className="h-3.5 w-3.5 text-emerald-600" />
                                {t.title}
                              </span>
                              {aiTone === t.id && (
                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                              )}
                            </div>
                            <p className="text-[10px] opacity-80 leading-snug">{t.desc}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3.2 Interruptor de Emojis */}
                <div className="p-3.5 rounded-xl border border-slate-200/80 dark:border-white/10 bg-slate-50/60 dark:bg-slate-800/30 flex items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        Permitir emojis en los mensajes
                      </span>
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                          allowEmojis
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60"
                            : "bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300"
                        }`}
                      >
                        {allowEmojis ? "Con emojis" : "Sin emojis (Recomendado)"}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      {allowEmojis
                        ? "Tu asistente usará emojis amigables para una atención cercana."
                        : "Desactivado por defecto. Mensajes 100% sobrios, limpios y sin emoticones ni caritas."}
                    </p>
                  </div>
                  <CustomSwitch
                    checked={allowEmojis}
                    onChange={(val) => setAllowEmojis(val)}
                    label="Permitir emojis"
                  />
                </div>

                {/* 3.3 Preferencia de Profesional / Especialista */}
                <div className="p-3.5 rounded-xl border border-slate-200/80 dark:border-white/10 bg-slate-50/60 dark:bg-slate-800/30 flex items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-indigo-600" />
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        Preguntar preferencia de profesional al cliente
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Si tenés más de un profesional o peluquero en tu equipo, la IA le preguntará al cliente con quién desea atenderse o si prefiere al primero libre.
                    </p>
                  </div>
                  <CustomSwitch
                    checked={askStaffPreference}
                    onChange={(val) => setAskStaffPreference(val)}
                    label="Preguntar preferencia de profesional"
                  />
                </div>

                {/* 3.4 Derivación Automática si la IA no sabe algo o consultan por un producto no cargado */}
                <div className="p-3.5 rounded-xl border border-slate-200/80 dark:border-white/10 bg-slate-50/60 dark:bg-slate-800/30 flex items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <ShieldAlert className="h-4 w-4 text-amber-600" />
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        Avisar al encargado si la IA no sabe algo o consultan por un producto no cargado
                      </span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-700 dark:bg-amber-950/60">
                        Honestidad & Cero inventos
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Si el cliente pregunta por un producto que no está en tu lista, una duda técnica del local o un tratamiento especial que la IA desconoce, le dirá con educación que no lo sabe en este momento, le ofrecerá ayuda humana y te enviará un aviso inmediato a tu WhatsApp para que lo asesores.
                    </p>
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
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-slate-400" />
                      <span>¿Con cuánta anticipación mínima pueden agendar?:</span>
                    </label>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
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
                        onClick={() => setMinNoticeMinutes(item.minutes)}
                        className={`p-2 rounded-xl text-center border text-xs font-bold transition cursor-pointer ${
                          minNoticeMinutes === item.minutes
                            ? "border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 ring-2 ring-emerald-600/20"
                            : "border-slate-200/80 dark:border-white/10 bg-slate-50/50 dark:bg-slate-800/30 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                  <p className="text-[10px] text-slate-400">
                    Evita que los clientes reserven para dentro de 10 minutos cuando ya estás ocupado.
                  </p>
                </div>

                {/* 3.5 Horario de Atención del Asistente */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    ¿Cuándo debe responder tu Asistente?:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setServiceScheduleMode("always")}
                      className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                        serviceScheduleMode === "always"
                          ? "border-emerald-600 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-100 ring-2 ring-emerald-600/20"
                          : "border-slate-200/80 dark:border-white/10 bg-slate-50/50 dark:bg-slate-800/30 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-0.5">
                        <Sun className="h-4 w-4 text-amber-500" />
                        <span className="text-xs font-bold">Las 24 horas del día (Recomendado)</span>
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">
                        Responde y agenda a toda hora, incluso de madrugada o días feriados.
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setServiceScheduleMode("business_hours")}
                      className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                        serviceScheduleMode === "business_hours"
                          ? "border-emerald-600 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-100 ring-2 ring-emerald-600/20"
                          : "border-slate-200/80 dark:border-white/10 bg-slate-50/50 dark:bg-slate-800/30 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-0.5">
                        <Moon className="h-4 w-4 text-indigo-500" />
                        <span className="text-xs font-bold">Solo en horario comercial</span>
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">
                        Fuera de hora envía un saludo informando cuándo abre el local.
                      </p>
                    </button>
                  </div>
                </div>

                {/* 3.6 Tipo de Línea de WhatsApp */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    ¿Qué tipo de número es esta línea de WhatsApp?:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setPhoneType("business")}
                      className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                        phoneType === "business"
                          ? "border-emerald-600 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-100 ring-2 ring-emerald-600/20"
                          : "border-slate-200/80 dark:border-white/10 bg-slate-50/50 dark:bg-slate-800/30 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-0.5">
                        <Briefcase className="h-4 w-4 text-emerald-600" />
                        <span className="text-xs font-bold">Línea del Negocio</span>
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">
                        Chip o celular exclusivo para clientes y atención comercial.
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPhoneType("personal")}
                      className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                        phoneType === "personal"
                          ? "border-emerald-600 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-100 ring-2 ring-emerald-600/20"
                          : "border-slate-200/80 dark:border-white/10 bg-slate-50/50 dark:bg-slate-800/30 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-0.5">
                        <Smartphone className="h-4 w-4 text-sky-600" />
                        <span className="text-xs font-bold">Mi Número Personal Compartido</span>
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">
                        Atiendo clientes y recibo avisos desde mi propio WhatsApp.
                      </p>
                    </button>
                  </div>
                </div>

                {/* 3.7 Alerta a tu WhatsApp Personal cuando reserven */}
                <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-slate-50/60 dark:bg-slate-800/30 p-4 space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Bell className="h-4 w-4 text-brand" />
                      <div>
                        <span className="text-xs font-bold text-slate-900 dark:text-white block">
                          Avisarme a mi WhatsApp personal cuando reserven
                        </span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">
                          Recibí un mensaje cada vez que un cliente agende una cita o con qué profesional se reservó.
                        </span>
                      </div>
                    </div>
                    <CustomSwitch
                      checked={notifyPersonalPhone}
                      onChange={(val) => setNotifyPersonalPhone(val)}
                      label="Avisarme al celular personal"
                    />
                  </div>

                  {notifyPersonalPhone && (
                    <div className="pt-2 space-y-2.5 border-t border-slate-200/60 dark:border-white/5">
                      <div>
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                          Tu número de WhatsApp personal para recibir alertas:
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                          <input
                            type="tel"
                            value={personalPhone}
                            onChange={(e) => setPersonalPhone(e.target.value)}
                            placeholder="+595 981 700 800"
                            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition"
                          />
                        </div>
                      </div>

                      {/* Vista previa de la alerta */}
                      <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-white/5 p-3 space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase block tracking-wider">
                          Así te llegará el aviso a tu WhatsApp:
                        </span>
                        <p className="text-[11px] text-slate-700 dark:text-slate-300 font-mono leading-relaxed">
                           *Nuevo turno agendado en {business.name}*<br />
                           Cliente: Juan Pérez (+595 981 111 222)<br />
                           Servicio: Corte Clásico / Fade<br />
                           Horario: Mañana 15:30 hs<br />
                           Profesional: Diego Franco
                        </p>
                      </div>

                      {/* Vista previa 2: Alerta de consulta no resuelta / producto */}
                      <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-3 space-y-1">
                        <span className="text-[10px] font-bold text-amber-800 dark:text-amber-300 uppercase block tracking-wider">
                          Así te llegará el aviso si preguntan por un producto no cargado o duda del local:
                        </span>
                        <p className="text-[11px] text-slate-800 dark:text-slate-200 font-mono leading-relaxed">
                           *Consulta de Cliente para Asesor Humano en {business.name}*<br />
                           Cliente: Carlos Giménez (+595 981 333 444)<br />
                           Consulta: &ldquo;¿Tienen shampoo anticaída o minoxidil?&rdquo;<br />
                           Por favor comunícate con el cliente para responderle a la brevedad.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* 3.8 Instrucciones Particulares del Local */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Datos importantes de tu local (opcional):
                    </label>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {aiInstructions.length} letras
                    </span>
                  </div>
                  <textarea
                    rows={3}
                    value={aiInstructions}
                    onChange={(e) => setAiInstructions(e.target.value)}
                    placeholder="Poné acá cualquier dato útil. Ejemplo: Tenemos estacionamiento propio gratuito. Los sábados de mañana atendemos por orden de llegada. Aceptamos tarjetas y transferencias."
                    className="w-full rounded-xl border border-slate-200/80 dark:border-white/10 bg-slate-50 dark:bg-slate-800/50 p-3 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition resize-none"
                  />
                  <p className="text-[10px] text-slate-400">
                    Tu asistente recordará esta información cada vez que hable con un cliente.
                  </p>
                </div>

                {/* Botón Guardar Cambios */}
                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={handleSaveAiSettings}
                    disabled={isSavingAiSettings}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition active:scale-98 cursor-pointer disabled:opacity-50"
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
              <div className="relative mx-auto flex w-full items-center justify-center p-1 sm:p-2">
                {/* Marco de iPhone */}
                <div className="relative w-full max-w-[320px] sm:max-w-[350px] rounded-[44px] sm:rounded-[50px] p-[7px] sm:p-[9px] bg-gradient-to-b from-[#3a3b40] via-[#1e1f23] to-[#111215] shadow-[0_30px_70px_-15px_rgba(0,0,0,0.6),0_0_0_1px_rgba(255,255,255,0.18)]">
                  {/* Botones laterales */}
                  <div className="absolute -left-[3px] top-[100px] h-7 w-[3.5px] rounded-l-[2px] bg-gradient-to-r from-[#2a2b30] to-[#45474e]" />
                  <div className="absolute -left-[3px] top-[140px] h-12 w-[3.5px] rounded-l-[2px] bg-gradient-to-r from-[#2a2b30] to-[#45474e]" />
                  <div className="absolute -left-[3px] top-[204px] h-12 w-[3.5px] rounded-l-[2px] bg-gradient-to-r from-[#2a2b30] to-[#45474e]" />
                  <div className="absolute -right-[3px] top-[135px] h-16 w-[3.5px] rounded-r-[2px] bg-gradient-to-l from-[#2a2b30] to-[#45474e]" />

                  {/* Pantalla */}
                  <div className="relative overflow-hidden rounded-[38px] sm:rounded-[42px] bg-black p-[2.5px] shadow-inner">
                    <div className="relative flex h-[560px] sm:h-[600px] flex-col overflow-hidden rounded-[36px] sm:rounded-[40px] bg-[#efeae2]">
                      {/* Fondo patrón WhatsApp */}
                      <div
                        className="pointer-events-none absolute inset-0 opacity-[0.06] mix-blend-multiply"
                        style={{
                          backgroundImage: `radial-gradient(#000 1px, transparent 1px), radial-gradient(#000 1px, #efeae2 1px)`,
                          backgroundSize: "20px 20px",
                          backgroundPosition: "0 0, 10px 10px",
                        }}
                      />

                      {/* Barra superior de iPhone */}
                      <div className="relative z-30 flex h-10 items-center justify-between px-7 pt-2 text-[#000000] font-semibold text-[13px] tracking-tight select-none">
                        <span>9:41</span>
                        {/* Dynamic Island */}
                        <div className="absolute left-1/2 top-2.5 -translate-x-1/2 flex h-5 w-20 items-center justify-between rounded-full bg-black px-2 shadow-sm">
                          <div className="h-2 w-2 rounded-full bg-[#1b2342]" />
                          <div className="h-1.5 w-1.5 rounded-full bg-[#050508]" />
                        </div>
                        {/* Señal y batería */}
                        <div className="flex items-center gap-1 text-black">
                          <Wifi className="h-3 w-3 stroke-[2.4]" />
                          <div className="h-2.5 w-4 rounded-[3px] border border-black p-[1px] flex items-center">
                            <div className="h-full w-full rounded-[1px] bg-black" />
                          </div>
                        </div>
                      </div>

                      {/* Cabecera de WhatsApp */}
                      <div className="relative z-20 flex items-center justify-between bg-[#008069] px-3 py-2 text-white shadow-sm">
                        <div className="flex items-center gap-2 min-w-0">
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
                            <BadgeCheck className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 text-white fill-[#10b981]" />
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-xs font-bold text-white leading-tight">
                              {business.name}
                            </p>
                            <p className="text-[10px] text-white/80 leading-none mt-0.5">
                              {isBotTypingSim ? "escribiendo..." : "en línea · Cuenta Comercial"}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-white/90">
                          <button
                            type="button"
                            onClick={() => {
                              setSimChatMessages([]);
                              pushToast("success", "Conversación reiniciada.");
                            }}
                            title="Reiniciar chat"
                            className="p-1 rounded-full hover:bg-white/10 transition cursor-pointer"
                          >
                            <RotateCcw className="h-3.5 w-3.5" />
                          </button>
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
                          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                            <div className="h-10 w-10 rounded-full bg-white shadow-xs flex items-center justify-center text-emerald-600 mb-2">
                              <MessageSquare className="h-5 w-5" />
                            </div>
                            <p className="text-xs font-bold text-[#111b21]">
                              Conversación en blanco
                            </p>
                            <p className="text-[11px] text-[#667781] mt-1 max-w-[200px]">
                              Escribí un mensaje o tocá una pregunta sugerida abajo para probar.
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
                        className="relative z-20 flex items-center gap-2 bg-[#f0f2f5] p-2 border-t border-slate-200"
                      >
                        <input
                          type="text"
                          value={simInput}
                          onChange={(e) => setSimInput(e.target.value)}
                          placeholder="Escribí un mensaje..."
                          className="flex-1 rounded-full bg-white px-3.5 py-1.5 text-xs text-slate-800 outline-none placeholder:text-slate-400"
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

              {/* Preguntas de prueba a 1 toque */}
              <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900 p-4 space-y-3 shadow-2xs">
                <div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                    Probá tu asistente con un toque
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Tocá cualquiera de estas preguntas comunes de clientes para ver la respuesta:
                  </p>
                </div>

                <div className="space-y-1.5">
                  {[
                    "¿Cuáles son los precios de corte y barba?",
                    "¿Tenés turno disponible para hoy a las 16:00 hs?",
                    "Quiero agendar corte para mañana con Diego",
                    "¿Cómo te puedo hacer una transferencia?",
                    "¿Cuántos puntos acumulados tengo?",
                    "Quiero hablar con una persona",
                  ].map((example) => (
                    <button
                      key={example}
                      type="button"
                      onClick={() => triggerSimMessage(example)}
                      className="w-full text-left p-2.5 rounded-xl border border-slate-200/80 dark:border-white/10 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 transition cursor-pointer flex items-center justify-between active:scale-98"
                    >
                      <span className="truncate pr-2">&ldquo;{example}&rdquo;</span>
                      <ArrowRight className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    </button>
                  ))}
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => {
                      setSimChatMessages([]);
                      pushToast("success", "Conversación reiniciada.");
                    }}
                    className="inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
                  >
                    <RotateCcw className="h-3 w-3" />
                    <span>Limpiar chat</span>
                  </button>
                  <span className="text-[10px] text-slate-400">Simulador en vivo</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* PESTAÑA 2: RECORDATORIOS AUTOMÁTICOS */
        <div className="space-y-6">
          <div className="flex flex-wrap gap-2">
            {whatsappTemplates.map((template) => (
              <button
                key={template.id}
                type="button"
                onClick={() => setSelectedTemplateId(template.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                  selectedTemplateId === template.id
                    ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs font-bold"
                    : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200/80 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-slate-800"
                }`}
              >
                <Clock className="h-3 w-3" />
                <span>{template.name}</span>
                <span
                  className={`h-2 w-2 rounded-full ${
                    template.enabled ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-700"
                  }`}
                />
              </button>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-12 items-start">
            <div data-tour="bot-templates-card" className="lg:col-span-7 space-y-4">
              <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900 p-5 space-y-4 shadow-2xs">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/5">
                  <div>
                    <h2 className="text-base font-bold text-slate-900 dark:text-white">
                      {currentTemplate?.name}
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Mensaje enviado automáticamente por WhatsApp a tus clientes.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <span className="text-[11px] text-slate-400">
                      {currentTemplate?.enabled ? "Activado" : "Desactivado"}
                    </span>
                    <CustomSwitch
                      checked={Boolean(currentTemplate?.enabled)}
                      onChange={() => {
                        if (currentTemplate) {
                          toggleWhatsAppTemplate(currentTemplate.id);
                          pushToast(
                            "success",
                            `Plantilla ${currentTemplate.enabled ? "desactivada" : "activada"}.`
                          );
                        }
                      }}
                      label="Activar o desactivar plantilla"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Contenido del Mensaje:
                  </label>
                  <textarea
                    rows={5}
                    value={currentTemplate?.body || ""}
                    onChange={(e) => {
                      if (currentTemplate) {
                        updateWhatsAppTemplate(currentTemplate.id, e.target.value);
                      }
                    }}
                    placeholder="Escribí el texto del mensaje..."
                    className="w-full rounded-xl border border-slate-200/80 dark:border-white/10 bg-slate-50 dark:bg-slate-800/50 p-3 text-xs text-slate-900 dark:text-white font-mono leading-relaxed focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition"
                  />
                </div>

                {/* Etiquetas para insertar */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block">
                    Hacé clic para insertar datos automáticos del cliente:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {AVAILABLE_TAGS.map((t) => (
                      <button
                        key={t.tag}
                        type="button"
                        onClick={() => insertTag(t.tag)}
                        className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-[11px] font-mono text-slate-700 dark:text-slate-300 transition cursor-pointer border border-slate-200/60 dark:border-white/5"
                      >
                        {t.tag}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Vista Previa del Mensaje */}
            <div className="lg:col-span-5 space-y-3">
              <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900 p-5 shadow-2xs space-y-3">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Así le llega el mensaje al cliente
                </h4>
                <div className="p-3.5 rounded-2xl bg-[#d9fdd3] text-slate-900 text-xs shadow-xs leading-relaxed">
                  {renderWhatsAppFormatted(currentTemplate ? getPreviewText(currentTemplate.body) : "")}
                  <div className="flex justify-end gap-1 text-[9px] text-slate-500 mt-2">
                    <span>14:30</span>
                    <CheckCheck className="h-3 w-3 text-blue-500" />
                  </div>
                </div>
              </div>
            </div>
          </div>
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
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
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
                {qrCodeDataUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={qrCodeDataUrl}
                    alt="Código QR de Vinculación de WhatsApp"
                    className="h-48 w-48 object-contain rounded-lg"
                  />
                ) : (
                  <div className="h-48 w-48 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse flex items-center justify-center">
                    <span className="text-xs text-slate-400 font-bold">Generando código...</span>
                  </div>
                )}
              </div>

              <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                <RefreshCw className="h-3 w-3 animate-spin text-emerald-600" />
                <span>Actualiza automáticamente cada 30 segundos</span>
              </div>
            </div>

            <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-xl border border-slate-100 dark:border-white/5">
              <p className="font-bold text-slate-900 dark:text-white">¿Cómo vincular tu WhatsApp?:</p>
              <ol className="list-decimal pl-4 space-y-1 text-[11px]">
                <li>Abrí WhatsApp en el teléfono de tu negocio.</li>
                <li>Tocá en <strong>Ajustes</strong> o los 3 puntos y seleccioná <strong>Dispositivos vinculados</strong>.</li>
                <li>Tocá <strong>Vincular dispositivo</strong> y apuntá la cámara a este código QR.</li>
              </ol>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={handleConnectSimulated}
                className="flex-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 text-xs shadow-md transition cursor-pointer"
              >
                Confirmar Vinculación
              </button>
              {isConnected && (
                <button
                  type="button"
                  onClick={handleDisconnect}
                  className="rounded-xl border border-rose-200 dark:border-rose-900/40 bg-rose-50 dark:bg-rose-950/20 text-rose-600 hover:bg-rose-100 py-2.5 px-3 text-xs font-bold transition cursor-pointer"
                >
                  Desconectar
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
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
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
                <span className="text-sm font-mono font-bold text-emerald-600">+595 981 700 800</span>
              </div>
            </div>

            <div className="pt-2">
              <a
                href="https://wa.me/595981700800?text=Hola,%20necesito%20ayuda%20con%20mi%20asistente%20de%20WhatsApp%20en%20AgendatePY"
                target="_blank"
                rel="noreferrer"
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 text-xs shadow-md transition cursor-pointer"
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
