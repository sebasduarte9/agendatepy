"use client";

import { useState, useEffect, useCallback } from "react";
import QRCode from "qrcode";
import {
  Bot,
  MessageCircle,
  MessageSquare,
  QrCode,
  CheckCircle2,
  Clock,
  Send,
  HelpCircle,
  Lock,
  Zap,
  RefreshCw,
  ShieldCheck,
  Check,
  Plus,
  Trash2,
  Tag,
  ListOrdered,
  Smartphone,
  Copy,
  X,
  CheckCheck,
  SlidersHorizontal,
  ExternalLink,
  CreditCard,
  UserCheck,
  ArrowRight,
  RotateCcw,
  Layers,
  Phone,
  Sliders,
  Settings2,
  CheckSquare,
} from "lucide-react";
import { useDashboardStore, defaultBotMenuOptions, defaultBotKeywords } from "@/store/useDashboardStore";
import type { BotMainMenuOption, BotKeywordRule } from "@/lib/dashboard-types";

// Dynamic message tags for templates (100% clean, no emojis)
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

// ═══════════════════════════════════════════════════════════════════
// CUSTOM UI COMPONENTS (Zero Native Web Controls, Zero Emojis)
// ═══════════════════════════════════════════════════════════════════

/** Custom Switch / Toggle */
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

/** Custom Action Selector (Replaces native <select>) */
function ActionSelector({
  value,
  onChange,
}: {
  value: "none" | "send_link" | "send_sipap" | "human_handoff";
  onChange: (val: "none" | "send_link" | "send_sipap" | "human_handoff") => void;
}) {
  const actions: {
    id: "none" | "send_link" | "send_sipap" | "human_handoff";
    label: string;
    icon: typeof MessageSquare;
    description: string;
  }[] = [
    {
      id: "none",
      label: "Solo Texto",
      icon: MessageSquare,
      description: "Envía la respuesta redactada",
    },
    {
      id: "send_link",
      label: "Link Reservas",
      icon: ExternalLink,
      description: "Adjunta enlace de turnos",
    },
    {
      id: "send_sipap",
      label: "Datos SIPAP",
      icon: CreditCard,
      description: "Adjunta datos de pago",
    },
    {
      id: "human_handoff",
      label: "Asesor Humano",
      icon: UserCheck,
      description: "Transfiere a un asesor",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-white/5">
      {actions.map((act) => {
        const isSelected = value === act.id;
        const Icon = act.icon;
        return (
          <button
            key={act.id}
            type="button"
            onClick={() => onChange(act.id)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              isSelected
                ? "bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-xs border border-slate-200/90 dark:border-white/10"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Icon className={`h-3.5 w-3.5 shrink-0 ${isSelected ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400"}`} />
            <span className="truncate">{act.label}</span>
          </button>
        );
      })}
    </div>
  );
}

/** Custom Cadence Selector (Replaces native <input type="range">) */
function CustomCadenceSelector({
  value,
  onChange,
}: {
  value: number;
  onChange: (val: number) => void;
}) {
  const presets = [
    { sec: 1, label: "1s · Inmediato", icon: Zap },
    { sec: 2, label: "2s · Dinámico", icon: Clock },
    { sec: 3, label: "3s · Equilibrado", icon: CheckCircle2 },
    { sec: 5, label: "5s · Natural", icon: MessageSquare },
    { sec: 8, label: "8s · Pausado", icon: SlidersHorizontal },
  ];

  return (
    <div className="space-y-4">
      {/* Preset pills */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {presets.map((p) => {
          const isSelected = value === p.sec;
          const Icon = p.icon;
          return (
            <button
              key={p.sec}
              type="button"
              onClick={() => onChange(p.sec)}
              className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                isSelected
                  ? "border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 shadow-xs ring-1 ring-emerald-500/30"
                  : "border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-white/20"
              }`}
            >
              <Icon className={`h-4 w-4 mb-1 ${isSelected ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400"}`} />
              <span className="text-xs font-bold leading-tight">{p.label}</span>
            </button>
          );
        })}
      </div>

      {/* Stepped Interactive Timeline */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/10 space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-600 dark:text-slate-400">
            Cadencia Seleccionada:
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-mono font-bold text-xs">
            <Clock className="h-3.5 w-3.5" />
            {value} {value === 1 ? "segundo" : "segundos"}
          </span>
        </div>

        {/* Stepped bar selector */}
        <div className="grid grid-cols-10 gap-1 pt-1">
          {Array.from({ length: 10 }, (_, i) => i + 1).map((sec) => {
            const isFilled = sec <= value;
            const isExact = sec === value;
            return (
              <button
                key={sec}
                type="button"
                onClick={() => onChange(sec)}
                className={`group relative h-9 rounded-lg transition-all cursor-pointer flex flex-col items-center justify-center ${
                  isExact
                    ? "bg-emerald-600 text-white font-mono font-bold shadow-xs scale-105 z-10"
                    : isFilled
                    ? "bg-emerald-500/30 text-emerald-800 dark:text-emerald-300 font-mono font-semibold"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-400 font-mono hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                <span className="text-[11px]">{sec}s</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// MAIN PAGE COMPONENT
// ═══════════════════════════════════════════════════════════════════

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
    openTour,
  } = useDashboardStore();

  const isConnected = Boolean(evolutionConfig.connected);

  // Main tabs
  const [activeTab, setActiveTab] = useState<"reglas" | "plantillas" | "simulador" | "business">("reglas");

  // Sub-tabs inside "Flujo & Reglas del Bot"
  const [rulesSubTab, setRulesSubTab] = useState<"menu" | "palabras" | "mensajes" | "velocidad">("menu");

  // Menu Options & Keywords state
  const [menuOptions, setMenuOptions] = useState<BotMainMenuOption[]>(
    evolutionConfig.mainMenuOptions && evolutionConfig.mainMenuOptions.length > 0
      ? evolutionConfig.mainMenuOptions
      : defaultBotMenuOptions
  );

  const [keywordRules, setKeywordRules] = useState<BotKeywordRule[]>(
    evolutionConfig.keywordRules && evolutionConfig.keywordRules.length > 0
      ? evolutionConfig.keywordRules
      : defaultBotKeywords
  );

  const [welcomeMessage, setWelcomeMessage] = useState(
    evolutionConfig.welcomeMessage ||
      "¡Hola! Bienvenido/a a nuestro canal oficial. ¿En qué podemos ayudarte hoy?\n\n1. Agendar un turno online\n2. Ver servicios y precios\n3. Ubicación y horarios\n4. Datos de pago SIPAP\n5. Hablar con un asesor\n\n_Escribí el número de la opción o tu consulta._"
  );
  const [fallbackMessage, setFallbackMessage] = useState(
    evolutionConfig.fallbackMessage ||
      "Disculpá, no entendí esa opción. Por favor elegí una opción escribiendo el número correspondiente (ej: 1 o 2) o escribí *humano* para contactar a nuestro equipo."
  );
  const [outOfHoursEnabled, setOutOfHoursEnabled] = useState(
    evolutionConfig.outOfHoursEnabled ?? true
  );
  const [outOfHoursMessage, setOutOfHoursMessage] = useState(
    evolutionConfig.outOfHoursMessage ||
      "¡Hola! En este momento nuestro local se encuentra cerrado. Podés reservar tu turno para el próximo día disponible directamente en nuestra agenda online:"
  );

  // Natural response delay in seconds (1 to 10s)
  const [responseCadence, setResponseCadence] = useState<number>(
    Math.min(10, Math.max(1, evolutionConfig.autoBotCadenceSeconds || 3))
  );

  // Templates tab state
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(
    whatsappTemplates[0]?.id || "wt-confirmacion"
  );
  const [copiedLink, setCopiedLink] = useState(false);
  const [testPhone, setTestPhone] = useState(
    business.whatsappNumber || business.phone || "+595 981 700 800"
  );
  const [sendingTest, setSendingTest] = useState(false);

  // In-Page Connection Modal state
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");
  const [qrCounter, setQrCounter] = useState(45);
  const [modalPhoneNumber, setModalPhoneNumber] = useState(
    evolutionConfig.phoneNumber || business.whatsappNumber || business.phone || "+595 981 700 800"
  );

  // Interactive Live Chat Simulator state (Clean formatting, zero emojis)
  const [simChatMessages, setSimChatMessages] = useState<
    { sender: "client" | "bot"; text: string; time: string }[]
  >([
    {
      sender: "client",
      text: "Hola",
      time: "14:28",
    },
    {
      sender: "bot",
      text: `¡Hola! Bienvenido/a a *${business.name}*. ¿En qué podemos ayudarte hoy?\n\n1. Agendar un turno online\n2. Ver servicios y precios\n3. Ubicación y horarios\n4. Datos de pago SIPAP\n5. Hablar con un asesor\n\n_Escribí el número de la opción o tu consulta._`,
      time: "14:28",
    },
  ]);
  const [simInput, setSimInput] = useState("");
  const [isBotTypingSim, setIsBotTypingSim] = useState(false);

  const currentTemplate =
    whatsappTemplates.find((t) => t.id === selectedTemplateId) ||
    whatsappTemplates[0];

  const slug = business.slug || "barberia";
  const [origin, setOrigin] = useState("https://agendatepy.com");
  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
    }
  }, []);

  const bookingUrl = `${origin}/${slug}/reservar`;
  const whatsappAutoReply = `¡Hola! Gracias por comunicarte con *${business.name}*. Para ver nuestros servicios disponibles y agendar tu turno al instante sin esperar respuesta, ingresá a nuestra agenda oficial:\n${bookingUrl}`;

  // QR Code generator
  const generateQrCode = useCallback(() => {
    const sessionId = `AGPY_${(business.slug || "central").toUpperCase()}_${Date.now()}`;
    const payload = `2@${Array.from({ length: 24 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join("")},${sessionId},${Date.now()}`;
    QRCode.toDataURL(payload, {
      width: 250,
      margin: 2,
      color: {
        dark: "#0f172a",
        light: "#ffffff",
      },
    })
      .then((url) => {
        setQrCodeDataUrl(url);
        setQrCounter(45);
      })
      .catch((err) => {
        console.error("Error generating QR:", err);
      });
  }, [business.slug]);

  useEffect(() => {
    if (isConnectModalOpen) {
      generateQrCode();
      const interval = setInterval(() => {
        setQrCounter((prev) => {
          if (prev <= 1) {
            generateQrCode();
            return 45;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isConnectModalOpen, generateQrCode]);

  // Conditional tour logic
  function handleStartTour() {
    if (!isConnected) {
      setIsConnectModalOpen(true);
      pushToast(
        "error",
        "Para realizar la guía completa es necesario vincular tu WhatsApp primero. Se abrió el código QR."
      );
    } else {
      openTour("whatsapp");
    }
  }

  // Template editor helpers
  function insertTag(tag: string) {
    if (!currentTemplate) return;
    const updated = (currentTemplate.body || "") + " " + tag;
    updateWhatsAppTemplate(currentTemplate.id, updated);
  }

  function getPreviewText(rawBody: string) {
    return rawBody
      .replace(/{cliente}/g, "Martín Benítez")
      .replace(/{servicio}/g, "Corte Fade + Perfilado")
      .replace(/{profesional}/g, "Diego Franco")
      .replace(/{fecha}/g, "Jueves 24 de Octubre")
      .replace(/{hora}/g, "15:30")
      .replace(/{negocio}/g, business.name)
      .replace(/{direccion}/g, business.address || "Avda. Santa Teresa 1420")
      .replace(/{link_autogestion}/g, `${bookingUrl}?token=demo123`)
      .replace(/{link_negocio}/g, bookingUrl);
  }

  async function copyToClipboard(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedLink(true);
      pushToast("success", "Copiado al portapapeles");
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      pushToast("error", "No se pudo copiar");
    }
  }

  async function handleSendTest() {
    if (!testPhone.trim()) {
      pushToast("error", "Ingresá un número de teléfono válido.");
      return;
    }
    setSendingTest(true);
    try {
      await new Promise((r) => setTimeout(r, 900));
      pushToast(
        "success",
        `Mensaje de prueba enviado exitosamente a ${testPhone}`
      );
    } catch {
      pushToast("error", "Error al enviar mensaje de prueba.");
    } finally {
      setSendingTest(false);
    }
  }

  // Bot Rules Handlers
  function handleSaveBotConfig() {
    updateEvolutionConfig({
      mainMenuOptions: menuOptions,
      keywordRules: keywordRules,
      welcomeMessage: welcomeMessage,
      fallbackMessage: fallbackMessage,
      outOfHoursEnabled: outOfHoursEnabled,
      outOfHoursMessage: outOfHoursMessage,
      autoBotCadenceSeconds: responseCadence,
    });
    pushToast("success", "Reglas del bot guardadas y sincronizadas con la base de datos.");
  }

  function handleAddMenuOption() {
    const nextKey = String(menuOptions.length + 1);
    const newOpt: BotMainMenuOption = {
      id: `opt-${Date.now()}`,
      key: nextKey,
      title: "Nueva Opción",
      response: "Detalle de la respuesta...",
      action: "none",
      enabled: true,
    };
    setMenuOptions([...menuOptions, newOpt]);
  }

  function handleUpdateMenuOption(id: string, patch: Partial<BotMainMenuOption>) {
    setMenuOptions(menuOptions.map((o) => (o.id === id ? { ...o, ...patch } : o)));
  }

  function handleDeleteMenuOption(id: string) {
    setMenuOptions(menuOptions.filter((o) => o.id !== id));
  }

  function handleAddKeywordRule() {
    const newRule: BotKeywordRule = {
      id: `kw-${Date.now()}`,
      keywords: ["consulta"],
      response: "Gracias por tu consulta. Podés reservar tu lugar directamente aquí:",
      action: "send_link",
      enabled: true,
    };
    setKeywordRules([...keywordRules, newRule]);
  }

  function handleUpdateKeywordRule(id: string, patch: Partial<BotKeywordRule>) {
    setKeywordRules(keywordRules.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }

  function handleDeleteKeywordRule(id: string) {
    setKeywordRules(keywordRules.filter((r) => r.id !== id));
  }

  // Simulator bot response engine (Rules & Keywords - 100% clean of emojis)
  function computeBotReply(userMsg: string): string {
    const lower = userMsg.toLowerCase().trim();

    // 1. Saludo inicial o petición de menú
    if (
      lower === "hola" ||
      lower === "buenas" ||
      lower === "buen dia" ||
      lower === "menu" ||
      lower === "inicio" ||
      lower === "empezar"
    ) {
      const activeOpts = menuOptions.filter((o) => o.enabled);
      let res = `${welcomeMessage}\n\n`;
      if (activeOpts.length > 0) {
        res += activeOpts.map((o) => `${o.key}. ${o.title}`).join("\n");
        res += `\n\n_Escribí el número para elegir una opción._`;
      }
      return res;
    }

    // 2. Coincidencia con opción numérica del menú
    const matchedOption = menuOptions.find(
      (o) => o.enabled && (lower === o.key.toLowerCase() || lower === o.title.toLowerCase())
    );
    if (matchedOption) {
      let reply = matchedOption.response;
      if (matchedOption.action === "send_link") {
        reply += `\n\n*Reservar online:* ${bookingUrl}`;
      } else if (matchedOption.action === "send_sipap") {
        reply += `\n\n*Datos SIPAP:*\nBanco: Banco Itaú\nTitular: ${business.name}\nRUC: 80012345-6\nAlias: pagos@agendate.py`;
      } else if (matchedOption.action === "human_handoff") {
        reply += `\n\n*Atención:* Un integrante de nuestro equipo tomará la conversación en breve.`;
      }
      return reply;
    }

    // 3. Coincidencia con palabras clave
    const matchedKeyword = keywordRules.find(
      (r) => r.enabled && r.keywords.some((k) => lower.includes(k.toLowerCase().trim()))
    );
    if (matchedKeyword) {
      let reply = matchedKeyword.response;
      if (matchedKeyword.action === "send_link") {
        reply += `\n\n*Reservar online:* ${bookingUrl}`;
      } else if (matchedKeyword.action === "send_sipap") {
        reply += `\n\n*Datos SIPAP:*\nBanco: Banco Itaú\nTitular: ${business.name}\nRUC: 80012345-6\nAlias: pagos@agendate.py`;
      } else if (matchedKeyword.action === "human_handoff") {
        reply += `\n\n*Atención:* Pausamos el bot automático y te transferimos a un asesor humano.`;
      }
      return reply;
    }

    // 4. Fallback: No coincide
    const activeOpts = menuOptions.filter((o) => o.enabled);
    let res = `${fallbackMessage}\n\n`;
    if (activeOpts.length > 0) {
      res += activeOpts.map((o) => `${o.key}. ${o.title}`).join("\n");
    }
    return res;
  }

  function handleSimSendMessage(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!simInput.trim() || isBotTypingSim) return;

    const userMsg = simInput.trim();
    const timeNow = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    // Append client message
    setSimChatMessages((prev) => [
      ...prev,
      { sender: "client", text: userMsg, time: timeNow },
    ]);
    setSimInput("");
    setIsBotTypingSim(true);

    const delayMs = Math.max(500, Math.min(3000, responseCadence * 300));
    setTimeout(() => {
      const botResponse = computeBotReply(userMsg);
      const botTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      setSimChatMessages((prev) => [
        ...prev,
        { sender: "bot", text: botResponse, time: botTime },
      ]);
      setIsBotTypingSim(false);
    }, delayMs);
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
    pushToast(
      "success",
      `WhatsApp vinculado con éxito (${phoneToSet}). Sesión compartida con el CRM.`
    );
  }

  function handleDisconnect() {
    updateEvolutionConfig({ connected: false, phoneNumber: "" });
    pushToast("error", "WhatsApp desconectado. Todas las opciones han sido pausadas.");
  }

  const activeConnectedPhone =
    evolutionConfig.phoneNumber || business.whatsappNumber || business.phone || "+595 981 700 800";

  return (
    <div className="space-y-6">
      {/* ═══ 1. TOP HEADER ═══ */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 border border-emerald-500/20">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                  Bot WhatsApp
                </h1>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 dark:bg-emerald-950/80 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                  <Zap className="h-3 w-3" />
                  Automatizado
                </span>
              </div>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Asistente automático para WhatsApp: menú interactivo por opciones, respuestas por palabras clave y recordatorios 24h y 2h antes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Connection status badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900 text-xs font-bold shadow-2xs">
            <span
              className={`h-2.5 w-2.5 rounded-full ${
                isConnected ? "bg-emerald-500 ring-4 ring-emerald-500/20 animate-pulse" : "bg-amber-500 ring-4 ring-amber-500/20"
              }`}
            />
            <span className="text-slate-700 dark:text-slate-200 font-medium">
              {isConnected ? "Línea Conectada" : "Desconectado"}
            </span>
          </div>

          {/* Interactive Guide Button */}
          <button
            type="button"
            onClick={handleStartTour}
            className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90 px-3.5 py-2 text-xs font-bold shadow-2xs transition active:scale-98 cursor-pointer"
          >
            <HelpCircle className="h-4 w-4" />
            <span>Guía Interactiva</span>
          </button>
        </div>
      </div>

      {/* ═══ 2. MANDATORY CONNECTION GATE / STATUS BANNER ═══ */}
      <div data-tour="bot-status-card">
        {isConnected ? (
          /* CONNECTED STATE BANNER */
          <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent p-4 sm:p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-sm">
                  <MessageCircle className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black text-slate-900 dark:text-white">
                      Línea Oficial Conectada
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold uppercase text-emerald-700 dark:text-emerald-400">
                      Activo 24/7
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 font-mono mt-0.5">
                    Número: <strong className="text-emerald-700 dark:text-emerald-400">{activeConnectedPhone}</strong> · Sincronizado con CRM Omnicanal
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsConnectModalOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 transition active:scale-98 cursor-pointer shadow-2xs"
                >
                  <QrCode className="h-3.5 w-3.5" />
                  <span>Reconectar QR</span>
                </button>

                <button
                  type="button"
                  onClick={handleDisconnect}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 dark:border-rose-900/40 bg-rose-50 dark:bg-rose-950/20 hover:bg-rose-100 text-rose-700 dark:text-rose-400 px-3 py-1.5 text-xs font-bold transition active:scale-98 cursor-pointer"
                >
                  <span>Desconectar</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* DISCONNECTED / MANDATORY GATE */
          <div
            data-tour="bot-connect-gate"
            className="rounded-3xl border border-amber-300/80 dark:border-amber-500/30 bg-gradient-to-b from-amber-50/60 to-white dark:from-amber-950/20 dark:to-slate-900 p-6 sm:p-8 text-center space-y-4 shadow-sm"
          >
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 shadow-sm">
              <Lock className="h-7 w-7" />
            </div>

            <div className="max-w-xl mx-auto space-y-1.5">
              <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 bg-amber-200/60 dark:bg-amber-900/60 px-2.5 py-0.5 rounded-full">
                Requisito Obligatorio
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                Vinculá tu WhatsApp para activar el Bot y las Opciones
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Para configurar el menú automático, las respuestas por palabras clave y los recordatorios 24h y 2h antes, es obligatorio vincular la línea de WhatsApp de tu negocio.
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setIsConnectModalOpen(true)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black px-6 py-3.5 text-xs sm:text-sm shadow-md shadow-emerald-600/20 transition active:scale-98 cursor-pointer"
              >
                <QrCode className="h-4.5 w-4.5" />
                <span>Vincular mi WhatsApp Ahora (Escanear QR)</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl mx-auto pt-3 text-left">
              <div className="p-3.5 rounded-2xl bg-white/90 dark:bg-slate-900/90 border border-slate-200/70 dark:border-white/5 space-y-1 text-xs">
                <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Zap className="h-3.5 w-3.5 text-amber-500" />
                  <span>Sin salir de aquí</span>
                </span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                  Escaneás el código en un modal aquí mismo sin perder tu sesión ni navegar a otra pantalla.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/90 dark:bg-slate-900/90 border border-slate-200/70 dark:border-white/5 space-y-1 text-xs">
                <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <RefreshCw className="h-3.5 w-3.5 text-emerald-500" />
                  <span>Misma sesión con CRM</span>
                </span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                  La sesión vinculada sirve automáticamente para este Bot y para la bandeja de mensajes del CRM.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/90 dark:bg-slate-900/90 border border-slate-200/70 dark:border-white/5 space-y-1 text-xs">
                <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-indigo-500" />
                  <span>Cero ausencias</span>
                </span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                  Tus clientes reciben confirmaciones y recordatorios automáticos 24h y 2h antes.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ═══ 3. MAIN TABS (Custom Segmented Control) ═══ */}
      <div className="p-1 rounded-2xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200/80 dark:border-white/10 flex flex-wrap gap-1">
        <button
          type="button"
          onClick={() => isConnected && setActiveTab("reglas")}
          disabled={!isConnected}
          className={`flex-1 min-w-[150px] flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
            !isConnected
              ? "opacity-40 cursor-not-allowed text-slate-400"
              : activeTab === "reglas"
              ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs border border-slate-200/60 dark:border-white/10"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          <span>Flujo & Reglas del Bot</span>
          {!isConnected && <Lock className="h-3 w-3 ml-0.5 text-slate-400" />}
        </button>

        <button
          type="button"
          onClick={() => isConnected && setActiveTab("plantillas")}
          disabled={!isConnected}
          className={`flex-1 min-w-[150px] flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
            !isConnected
              ? "opacity-40 cursor-not-allowed text-slate-400"
              : activeTab === "plantillas"
              ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs border border-slate-200/60 dark:border-white/10"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Layers className="h-3.5 w-3.5" />
          <span>Plantillas & Recordatorios</span>
          {!isConnected && <Lock className="h-3 w-3 ml-0.5 text-slate-400" />}
        </button>

        <button
          type="button"
          onClick={() => isConnected && setActiveTab("simulador")}
          disabled={!isConnected}
          className={`flex-1 min-w-[150px] flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
            !isConnected
              ? "opacity-40 cursor-not-allowed text-slate-400"
              : activeTab === "simulador"
              ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs border border-slate-200/60 dark:border-white/10"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Smartphone className="h-3.5 w-3.5" />
          <span>Simulador en Celular</span>
          {!isConnected && <Lock className="h-3 w-3 ml-0.5 text-slate-400" />}
        </button>

        <button
          type="button"
          onClick={() => isConnected && setActiveTab("business")}
          disabled={!isConnected}
          className={`flex-1 min-w-[150px] flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
            !isConnected
              ? "opacity-40 cursor-not-allowed text-slate-400"
              : activeTab === "business"
              ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs border border-slate-200/60 dark:border-white/10"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Phone className="h-3.5 w-3.5" />
          <span>WhatsApp Business</span>
          {!isConnected && <Lock className="h-3 w-3 ml-0.5 text-slate-400" />}
        </button>
      </div>

      {/* ═══ 4. TAB CONTENTS ═══ */}
      {!isConnected ? (
        /* LOCKED OVERLAY */
        <div className="relative rounded-3xl border border-slate-200/80 dark:border-white/10 bg-slate-50/50 dark:bg-slate-900/40 p-8 text-center overflow-hidden">
          <div className="absolute inset-0 bg-white/60 dark:bg-slate-950/80 backdrop-blur-xs flex flex-col items-center justify-center p-6 z-10 space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 shadow-md">
              <Lock className="h-6 w-6" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              Opciones Bloqueadas Temporalmente
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 max-w-md">
              Vinculá tu línea oficial de WhatsApp arriba para configurar el menú, las palabras clave y el simulador en vivo.
            </p>
            <button
              type="button"
              onClick={() => setIsConnectModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2.5 text-xs shadow-md transition cursor-pointer"
            >
              <QrCode className="h-4 w-4" />
              <span>Abrir Código QR</span>
            </button>
          </div>

          <div className="opacity-20 pointer-events-none select-none filter blur-xs space-y-4">
            <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
            <div className="h-48 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          </div>
        </div>
      ) : activeTab === "reglas" ? (
        /* ═══ TAB 1: FLUJO & REGLAS DEL BOT ═══ */
        <div className="space-y-6" data-tour="bot-rules-card">
          <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900 p-5 space-y-4 shadow-2xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-white/5">
              <div>
                <span className="text-[11px] font-bold uppercase text-emerald-600 dark:text-emerald-400 tracking-wider block">
                  Configuración de Respuestas
                </span>
                <h2 className="text-base font-black text-slate-900 dark:text-white mt-0.5">
                  Menú Automático & Respuestas por Palabras Clave
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Personalizá las opciones que se envían al cliente, las respuestas directas y las acciones automáticas.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleSaveBotConfig}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 text-xs font-bold shadow-xs transition active:scale-98 cursor-pointer"
                >
                  <Check className="h-3.5 w-3.5" />
                  <span>Guardar Cambios</span>
                </button>
              </div>
            </div>

            {/* Sub-Tabs: Menu, Keywords, Messages, Cadence (Custom Pills) */}
            <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200/70 dark:border-white/5">
              <button
                type="button"
                onClick={() => setRulesSubTab("menu")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  rulesSubTab === "menu"
                    ? "bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-xs border border-slate-200/80 dark:border-white/10"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <ListOrdered className="h-3.5 w-3.5" />
                <span>Opciones del Menú ({menuOptions.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setRulesSubTab("palabras")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  rulesSubTab === "palabras"
                    ? "bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-xs border border-slate-200/80 dark:border-white/10"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <Tag className="h-3.5 w-3.5" />
                <span>Palabras Clave ({keywordRules.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setRulesSubTab("mensajes")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  rulesSubTab === "mensajes"
                    ? "bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-xs border border-slate-200/80 dark:border-white/10"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <MessageSquare className="h-3.5 w-3.5" />
                <span>Bienvenida & Fallback</span>
              </button>

              <button
                type="button"
                onClick={() => setRulesSubTab("velocidad")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  rulesSubTab === "velocidad"
                    ? "bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-xs border border-slate-200/80 dark:border-white/10"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <Clock className="h-3.5 w-3.5" />
                <span>Pausa de Respuesta ({responseCadence}s)</span>
              </button>
            </div>
          </div>

          {/* SUB-TAB 1: MENU BUILDER */}
          {rulesSubTab === "menu" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">
                    Constructor del Menú Interactivo
                  </h3>
                  <p className="text-xs text-slate-500">
                    Opciones numéricas (1, 2, 3...) que se le envían al cliente para que elija con un solo número.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddMenuOption}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-dashed border-emerald-600 text-emerald-600 dark:text-emerald-400 font-bold text-xs px-3 py-1.5 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 transition cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Agregar Opción</span>
                </button>
              </div>

              <div className="space-y-3">
                {menuOptions.map((opt, idx) => (
                  <div
                    key={opt.id || idx}
                    className="p-4 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900 space-y-3 shadow-2xs hover:border-slate-300 dark:hover:border-white/20 transition"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5 flex-1">
                        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-mono font-bold text-xs shadow-2xs">
                          {opt.key}
                        </span>
                        <input
                          type="text"
                          value={opt.title}
                          onChange={(e) => handleUpdateMenuOption(opt.id, { title: e.target.value })}
                          className="font-bold text-xs text-slate-900 dark:text-white bg-transparent border-b border-transparent hover:border-slate-300 dark:hover:border-white/20 focus:border-emerald-500 focus:outline-none flex-1 max-w-sm py-0.5"
                          placeholder="Título de la opción..."
                        />
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
                          <span className="text-[11px] text-slate-400">
                            {opt.enabled ? "Activa" : "Pausada"}
                          </span>
                          <CustomSwitch
                            checked={opt.enabled}
                            onChange={(checked) => handleUpdateMenuOption(opt.id, { enabled: checked })}
                          />
                        </div>

                        {menuOptions.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleDeleteMenuOption(opt.id)}
                            className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/20 transition cursor-pointer"
                            title="Eliminar opción"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2 pt-1">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                          Respuesta que enviará el Bot:
                        </label>
                        <textarea
                          rows={2}
                          value={opt.response}
                          onChange={(e) => handleUpdateMenuOption(opt.id, { response: e.target.value })}
                          className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800/60 p-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 font-sans"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                          Acción Automática:
                        </label>
                        <ActionSelector
                          value={opt.action || "none"}
                          onChange={(val) => handleUpdateMenuOption(opt.id, { action: val })}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SUB-TAB 2: KEYWORD TRIGGERS */}
          {rulesSubTab === "palabras" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">
                    Disparadores por Palabras Clave
                  </h3>
                  <p className="text-xs text-slate-500">
                    Si el mensaje del cliente contiene alguna de estas palabras, el bot responde de forma inmediata.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddKeywordRule}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-dashed border-emerald-600 text-emerald-600 dark:text-emerald-400 font-bold text-xs px-3 py-1.5 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 transition cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Agregar Palabra Clave</span>
                </button>
              </div>

              <div className="space-y-3">
                {keywordRules.map((rule, idx) => (
                  <div
                    key={rule.id || idx}
                    className="p-4 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900 space-y-3 shadow-2xs hover:border-slate-300 dark:hover:border-white/20 transition"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Tag className="h-4 w-4 text-emerald-600" />
                        <span className="font-bold text-xs text-slate-900 dark:text-white">
                          Regla #{idx + 1}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
                          <span className="text-[11px] text-slate-400">
                            {rule.enabled ? "Activa" : "Pausada"}
                          </span>
                          <CustomSwitch
                            checked={rule.enabled}
                            onChange={(checked) => handleUpdateKeywordRule(rule.id, { enabled: checked })}
                          />
                        </div>

                        {keywordRules.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleDeleteKeywordRule(rule.id)}
                            className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/20 transition cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                        Palabras que activan esta respuesta (separadas por coma):
                      </label>
                      <input
                        type="text"
                        value={rule.keywords.join(", ")}
                        onChange={(e) =>
                          handleUpdateKeywordRule(rule.id, {
                            keywords: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                          })
                        }
                        className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800/60 p-2.5 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                        placeholder="ej: precio, cuanto cuesta, costo, promo"
                      />
                    </div>

                    <div className="space-y-2 pt-1">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                          Respuesta Automática:
                        </label>
                        <input
                          type="text"
                          value={rule.response}
                          onChange={(e) =>
                            handleUpdateKeywordRule(rule.id, { response: e.target.value })
                          }
                          className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800/60 p-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 font-sans"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                          Acción Automática:
                        </label>
                        <ActionSelector
                          value={rule.action || "none"}
                          onChange={(val) => handleUpdateKeywordRule(rule.id, { action: val })}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SUB-TAB 3: SYSTEM MESSAGES */}
          {rulesSubTab === "mensajes" && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900 p-5 space-y-4 shadow-2xs">
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">
                    Mensajes del Sistema
                  </h3>
                  <p className="text-xs text-slate-500">
                    Textos de bienvenida, fallback para mensajes no reconocidos y fuera de horario de atención.
                  </p>
                </div>

                <div className="space-y-3 pt-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                      Mensaje de Bienvenida (Saludo Inicial):
                    </label>
                    <textarea
                      rows={3}
                      value={welcomeMessage}
                      onChange={(e) => setWelcomeMessage(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800/60 p-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 font-sans leading-relaxed"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                      Mensaje de Fallback (Cuando el cliente escribe algo no reconocido):
                    </label>
                    <textarea
                      rows={3}
                      value={fallbackMessage}
                      onChange={(e) => setFallbackMessage(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800/60 p-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 font-sans leading-relaxed"
                    />
                  </div>

                  <div className="p-4 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800/40 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-amber-500" />
                        <span className="font-bold text-xs text-slate-900 dark:text-white">
                          Mensaje Especial Fuera de Horario Laboral
                        </span>
                      </div>
                      <CustomSwitch
                        checked={outOfHoursEnabled}
                        onChange={(checked) => setOutOfHoursEnabled(checked)}
                      />
                    </div>
                    {outOfHoursEnabled && (
                      <textarea
                        rows={2}
                        value={outOfHoursMessage}
                        onChange={(e) => setOutOfHoursMessage(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 p-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 font-sans leading-relaxed"
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SUB-TAB 4: RESPONSE CADENCE */}
          {rulesSubTab === "velocidad" && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900 p-5 space-y-4 shadow-2xs">
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">
                    Pausa Natural de Respuesta
                  </h3>
                  <p className="text-xs text-slate-500">
                    Ajustá los segundos de espera antes de que el bot envíe su respuesta para que la interacción se sienta cómoda y natural.
                  </p>
                </div>

                <CustomCadenceSelector
                  value={responseCadence}
                  onChange={(val) => setResponseCadence(val)}
                />
              </div>
            </div>
          )}
        </div>
      ) : activeTab === "plantillas" ? (
        /* ═══ TAB 2: PLANTILLAS Y RECORDATORIOS ═══ */
        <div className="space-y-6" data-tour="bot-templates-card">
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
            <div className="lg:col-span-7 space-y-4">
              <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900 p-5 space-y-4 shadow-2xs">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/5">
                  <div>
                    <h2 className="text-base font-black text-slate-900 dark:text-white">
                      {currentTemplate?.name}
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Disparo automático despachado sin intervención humana por WhatsApp.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <span className="text-[11px] text-slate-400">
                      {currentTemplate?.enabled ? "Activo" : "Pausado"}
                    </span>
                    <CustomSwitch
                      checked={Boolean(currentTemplate?.enabled)}
                      onChange={() => currentTemplate && toggleWhatsAppTemplate(currentTemplate.id)}
                    />
                  </div>
                </div>

                <div className="space-y-4 pt-2">
                  <div>
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                      Variables dinámicas (tocá para insertar):
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {AVAILABLE_TAGS.map((item) => (
                        <button
                          key={item.tag}
                          type="button"
                          onClick={() => insertTag(item.tag)}
                          className="rounded-lg border border-slate-200/80 dark:border-white/10 bg-slate-50 dark:bg-slate-800 px-2.5 py-1 text-[11px] font-semibold text-slate-700 dark:text-slate-300 hover:border-emerald-500 hover:text-emerald-600 transition cursor-pointer"
                        >
                          +{item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Cuerpo del Mensaje:
                    </label>
                    <textarea
                      rows={8}
                      value={currentTemplate?.body || ""}
                      onChange={(e) =>
                        currentTemplate &&
                        updateWhatsAppTemplate(currentTemplate.id, e.target.value)
                      }
                      className="w-full rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50/70 dark:bg-slate-800/50 p-3.5 text-xs text-slate-900 dark:text-white focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none transition leading-relaxed font-sans"
                    />
                    <p className="mt-1 text-[11px] text-slate-400">
                      Consejo: Podés usar formato de WhatsApp con *negrita* o _cursiva_.
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                      <Check className="h-3.5 w-3.5" /> Sincronización instantánea en base de datos
                    </span>
                    <button
                      type="button"
                      onClick={() => pushToast("success", "Plantilla guardada y lista para despacho.")}
                      className="rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-2 text-xs font-bold shadow-xs hover:opacity-90 active:scale-98 transition cursor-pointer"
                    >
                      Confirmar Plantilla
                    </button>
                  </div>
                </div>
              </div>

              {/* Test Phone Direct */}
              <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900 p-5 space-y-2 shadow-2xs">
                <h3 className="text-sm font-black text-slate-900 dark:text-white">
                  Probar Envío a mi Teléfono
                </h3>
                <p className="text-xs text-slate-500">
                  Enviá este mensaje de prueba a tu propio número para verificar cómo lo recibirán tus clientes.
                </p>

                <div className="mt-3 flex gap-2">
                  <input
                    type="text"
                    value={testPhone}
                    onChange={(e) => setTestPhone(e.target.value)}
                    placeholder="+595 981 123 456"
                    className="flex-1 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={handleSendTest}
                    disabled={sendingTest}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-500 disabled:opacity-50 transition active:scale-98 cursor-pointer"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>{sendingTest ? "Enviando..." : "Enviar Prueba"}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Template Phone Mockup Preview (Clean WhatsApp UI) */}
            <div className="lg:col-span-5 flex flex-col items-center">
              <div className="w-[310px] sm:w-[330px] rounded-[42px] border-[6px] border-slate-900 dark:border-slate-800 bg-slate-900 p-2.5 shadow-2xl">
                <div className="mx-auto h-4 w-28 rounded-full bg-slate-900 mb-1" />
                <div className="overflow-hidden rounded-[30px] bg-[#efeae2] flex flex-col h-[520px]">
                  <div className="flex items-center gap-2.5 bg-[#008069] px-3.5 py-3 text-white">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-xs font-bold">
                      {business.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold truncate leading-tight">{business.name}</p>
                      <p className="text-[10px] opacity-80">en línea · Bot Oficial</p>
                    </div>
                  </div>

                  <div className="flex-1 p-3 space-y-2.5 overflow-y-auto text-xs">
                    <div className="text-center">
                      <span className="rounded-md bg-white/80 px-2 py-0.5 text-[9px] font-semibold text-slate-500 uppercase shadow-2xs">
                        HOY
                      </span>
                    </div>

                    <div className="flex justify-start">
                      <div className="max-w-[85%] rounded-2xl rounded-tl-xs bg-white p-3 text-slate-900 shadow-xs space-y-1">
                        <p className="whitespace-pre-wrap leading-relaxed">
                          {currentTemplate ? getPreviewText(currentTemplate.body) : ""}
                        </p>
                        <div className="flex justify-end gap-1 text-[9px] text-slate-400">
                          <span>14:30</span>
                          <CheckCheck className="h-3 w-3 text-blue-500" />
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <div className="max-w-[80%] rounded-2xl rounded-tr-xs bg-[#d9fdd3] p-2.5 text-slate-900 shadow-xs">
                        <p className="leading-snug text-xs">¡Excelente! Ya lo tengo confirmado en mi calendario.</p>
                        <div className="flex justify-end gap-1 text-[9px] text-slate-500 mt-0.5">
                          <span>14:32</span>
                          <CheckCheck className="h-3 w-3 text-blue-500" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 bg-[#f0f2f5] p-2 border-t border-slate-200">
                    <input
                      type="text"
                      disabled
                      placeholder="Escribir un mensaje..."
                      className="flex-1 rounded-full bg-white px-3.5 py-1.5 text-xs text-slate-500 outline-none"
                    />
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#008069] text-white">
                      <Send className="h-3.5 w-3.5" />
                    </div>
                  </div>
                </div>
              </div>

              <p className="mt-3 text-xs text-slate-400 text-center">
                Vista previa en tiempo real de cómo recibe el mensaje tu cliente en su teléfono celular.
              </p>
            </div>
          </div>
        </div>
      ) : activeTab === "simulador" ? (
        /* ═══ TAB 3: SIMULADOR DE CHAT EN VIVO ═══ */
        <div className="space-y-6" data-tour="bot-simulator-card">
          <div className="grid gap-6 lg:grid-cols-12 items-start">
            <div className="lg:col-span-7 flex flex-col items-center">
              <div className="w-[320px] sm:w-[350px] rounded-[44px] border-[7px] border-slate-900 dark:border-slate-800 bg-slate-900 p-2.5 shadow-2xl">
                <div className="mx-auto h-4 w-28 rounded-full bg-slate-900 mb-1" />
                <div className="overflow-hidden rounded-[32px] bg-[#efeae2] flex flex-col h-[560px]">
                  {/* WhatsApp Top Bar */}
                  <div className="flex items-center gap-2.5 bg-[#008069] px-3.5 py-3 text-white">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-xs font-bold">
                      {business.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold truncate leading-tight">{business.name}</p>
                      <p className="text-[10px] opacity-80">
                        {isBotTypingSim ? "escribiendo..." : "en línea · Bot Oficial"}
                      </p>
                    </div>
                  </div>

                  {/* Messages Area */}
                  <div className="flex-1 p-3 space-y-2.5 overflow-y-auto text-xs">
                    <div className="text-center">
                      <span className="rounded-md bg-white/80 px-2 py-0.5 text-[9px] font-semibold text-slate-500 uppercase shadow-2xs">
                        SIMULACIÓN EN VIVO
                      </span>
                    </div>

                    {simChatMessages.map((msg, index) => {
                      const isClient = msg.sender === "client";
                      return (
                        <div
                          key={index}
                          className={`flex ${isClient ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[85%] rounded-2xl p-2.5 shadow-xs ${
                              isClient
                                ? "bg-[#d9fdd3] text-slate-900 rounded-tr-xs"
                                : "bg-white text-slate-900 rounded-tl-xs"
                            }`}
                          >
                            <p className="whitespace-pre-wrap leading-relaxed text-xs">{msg.text}</p>
                            <div className="flex justify-end gap-1 text-[9px] text-slate-400 mt-0.5">
                              <span>{msg.time}</span>
                              {isClient && <CheckCheck className="h-3 w-3 text-blue-500" />}
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {isBotTypingSim && (
                      <div className="flex justify-start">
                        <div className="rounded-2xl rounded-tl-xs bg-white px-3 py-2 text-slate-500 shadow-xs flex items-center gap-1.5 text-xs">
                          <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce" />
                          <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0.2s]" />
                          <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0.4s]" />
                          <span className="text-[10px] ml-1">Escribiendo...</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Interactive Typing Form */}
                  <form
                    onSubmit={handleSimSendMessage}
                    className="flex items-center gap-2 bg-[#f0f2f5] p-2 border-t border-slate-200"
                  >
                    <input
                      type="text"
                      value={simInput}
                      onChange={(e) => setSimInput(e.target.value)}
                      placeholder="Escribí (ej: 1, precio, hola)..."
                      className="flex-1 rounded-full bg-white px-3.5 py-1.5 text-xs text-slate-800 outline-none"
                    />
                    <button
                      type="submit"
                      disabled={!simInput.trim() || isBotTypingSim}
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-[#008069] text-white disabled:opacity-40 transition cursor-pointer"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </form>
                </div>
              </div>
            </div>

            {/* Simulator Suggestions (Zero Emojis) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900 p-5 space-y-4 shadow-2xs">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">
                    Pruebas Rápidas en 1 Clic
                  </h3>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md">
                    Pausa: {responseCadence}s
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Tocá cualquiera de estas opciones para simular cómo responde tu bot a tus clientes:
                </p>

                <div className="space-y-2">
                  {[
                    "Hola",
                    "1",
                    "2",
                    "3",
                    "precio de corte",
                    "donde queda el local",
                    "quiero hablar con una persona",
                  ].map((example) => (
                    <button
                      key={example}
                      type="button"
                      onClick={() => {
                        setSimInput(example);
                      }}
                      className="w-full text-left p-2.5 rounded-xl border border-slate-200/80 dark:border-white/10 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 transition cursor-pointer flex items-center justify-between"
                    >
                      <span>&ldquo;{example}&rdquo;</span>
                      <ArrowRight className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    </button>
                  ))}
                </div>

                <div className="pt-3 border-t border-slate-200/70 dark:border-white/10 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() =>
                      setSimChatMessages([
                        {
                          sender: "client",
                          text: "Hola",
                          time: "14:28",
                        },
                        {
                          sender: "bot",
                          text: `¡Hola! Bienvenido/a a *${business.name}*. ¿En qué podemos ayudarte hoy?\n\n1. Agendar un turno online\n2. Ver servicios y precios\n3. Ubicación y horarios\n4. Datos de pago SIPAP\n5. Hablar con un asesor\n\n_Escribí el número de la opción o tu consulta._`,
                          time: "14:28",
                        },
                      ])
                    }
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span>Reiniciar conversación</span>
                  </button>

                  <span className="text-[11px] text-slate-400 font-mono">
                    Pausa: {responseCadence}s
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ═══ TAB 4: RESPUESTA DE BIENVENIDA WHATSAPP BUSINESS ═══ */
        <div className="space-y-6" data-tour="bot-quick-reply">
          <div className="rounded-2xl border border-emerald-200/80 dark:border-emerald-800/40 bg-gradient-to-r from-emerald-50/40 to-white dark:from-emerald-950/20 dark:to-slate-900 p-5 space-y-4 shadow-2xs">
            <div className="flex items-start gap-3.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-sm">
                <Smartphone className="h-5 w-5" />
              </div>
              <div className="flex-1 space-y-2">
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Mensaje de Bienvenida Oficial para WhatsApp Business
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Copiá este mensaje en el menú <em>Ajustes de Empresa &gt; Mensaje de Bienvenida</em> de tu WhatsApp Business oficial para que todo cliente que te escriba por primera vez reciba tu enlace de reservas instantáneas:
                </p>

                <div className="relative rounded-2xl border border-emerald-200 dark:border-emerald-800/60 bg-white dark:bg-slate-900 p-4 text-xs text-slate-800 dark:text-slate-200 font-mono shadow-xs">
                  <p className="whitespace-pre-wrap leading-relaxed">{whatsappAutoReply}</p>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(whatsappAutoReply)}
                    className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-4 py-2 text-xs font-bold text-white shadow-xs transition active:scale-98 cursor-pointer"
                  >
                    {copiedLink ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copiedLink ? "¡Copiado con Éxito!" : "Copiar Mensaje de Bienvenida"}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══ 5. IN-PAGE CONNECTION MODAL (QR LINKING - HIGH FIDELITY VIEWFINDER) ═══ */}
      {isConnectModalOpen && (
        <div
          data-tour="bot-connect-modal"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
        >
          <div className="relative w-full max-w-md rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900 p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
                  <QrCode className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-slate-900 dark:text-white">
                    Vincular WhatsApp Oficial
                  </h3>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Válido para Bot y CRM Omnicanal
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

            {/* Viewfinder QR Container */}
            <div className="relative flex flex-col items-center justify-center p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-white/10">
              <div className="relative p-3 bg-white rounded-2xl shadow-sm">
                {/* Viewfinder brackets */}
                <div className="absolute top-1 left-1 w-4 h-4 border-t-2 border-l-2 border-emerald-600 rounded-tl-sm pointer-events-none" />
                <div className="absolute top-1 right-1 w-4 h-4 border-t-2 border-r-2 border-emerald-600 rounded-tr-sm pointer-events-none" />
                <div className="absolute bottom-1 left-1 w-4 h-4 border-b-2 border-l-2 border-emerald-600 rounded-bl-sm pointer-events-none" />
                <div className="absolute bottom-1 right-1 w-4 h-4 border-b-2 border-r-2 border-emerald-600 rounded-br-sm pointer-events-none" />

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

              <div className="mt-3 flex items-center gap-2 text-xs text-slate-500 font-mono">
                <RefreshCw className="h-3.5 w-3.5 animate-spin text-emerald-600" />
                <span>Actualización en: <strong>{qrCounter}s</strong></span>
              </div>
            </div>

            {/* Custom 3 Steps (Clean cards, no native numbers or emojis) */}
            <div className="space-y-2">
              <p className="text-xs font-bold text-slate-900 dark:text-white">Pasos para conectar:</p>
              <div className="grid grid-cols-1 gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-white/5">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-mono font-bold">
                    01
                  </span>
                  <span className="text-[11px] leading-tight">Abrí <strong>WhatsApp</strong> en tu teléfono celular.</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-white/5">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-mono font-bold">
                    02
                  </span>
                  <span className="text-[11px] leading-tight">Tocá los tres puntos o Ajustes &gt; <strong>Dispositivos vinculados</strong>.</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-white/5">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-mono font-bold">
                    03
                  </span>
                  <span className="text-[11px] leading-tight">Escaneá este código QR con la cámara de tu teléfono.</span>
                </div>
              </div>
            </div>

            {/* Phone input */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                Número de WhatsApp de tu Negocio:
              </label>
              <input
                type="text"
                value={modalPhoneNumber}
                onChange={(e) => setModalPhoneNumber(e.target.value)}
                placeholder="+595 981 700 800"
                className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
              />
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2 pt-2 border-t border-slate-100 dark:border-white/10">
              <button
                type="button"
                onClick={handleConnectSimulated}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 text-xs shadow-md transition active:scale-98 cursor-pointer"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>Simular Vinculación / Conectar</span>
              </button>

              <button
                type="button"
                onClick={() => setIsConnectModalOpen(false)}
                className="w-full text-center py-1.5 text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
