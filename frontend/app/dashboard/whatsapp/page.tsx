"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Bot,
  Copy,
  Check,
  Send,
  Bell,
  CheckCheck,
  Smartphone,
  QrCode,
  ShieldCheck,
  RefreshCw,
  MessageCircle,
  Lock,
  Sparkles,
  Zap,
  HelpCircle,
  X,
  CheckCircle2,
  Clock,
  Sliders,
  AlertCircle,
  ArrowRight,
  Plus,
  Trash2,
  ListOrdered,
  Tag,
  Settings2,
} from "lucide-react";
import QRCode from "qrcode";
import { useDashboardStore, defaultBotMenuOptions, defaultBotKeywords } from "@/store/useDashboardStore";
import type { BotMainMenuOption, BotKeywordRule } from "@/lib/dashboard-types";
import Card from "@/components/dashboard/ui/Card";

const AVAILABLE_TAGS = [
  { tag: "{cliente}", label: "Nombre Cliente" },
  { tag: "{servicio}", label: "Nombre Servicio" },
  { tag: "{profesional}", label: "Profesional" },
  { tag: "{fecha}", label: "Fecha Turno" },
  { tag: "{hora}", label: "Hora Turno" },
  { tag: "{negocio}", label: "Nombre Negocio" },
  { tag: "{direccion}", label: "Dirección" },
  { tag: "{link_autogestion}", label: "Link Cancelar/Reprogramar" },
];

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
      "¡Hola! Bienvenido/a a nuestro canal oficial. ¿En qué podemos ayudarte hoy?"
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

  // Interactive Live Chat Simulator state
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
      text: `¡Hola! Bienvenido/a a *${business.name}*. ¿En qué podemos ayudarte hoy?\n\n1️⃣ Agendar un turno online\n2️⃣ Ver servicios y precios\n3️⃣ Ubicación y horarios\n4️⃣ Datos de pago SIPAP\n5️⃣ Hablar con un asesor\n\n_Escribí el número de la opción o tu consulta._`,
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
      width: 256,
      margin: 1,
      color: {
        dark: "#0f172a",
        light: "#ffffff",
      },
    })
      .then((url) => setQrCodeDataUrl(url))
      .catch((err) => console.error("Error generating QR:", err));
  }, [business.slug]);

  useEffect(() => {
    if (isConnectModalOpen) {
      setQrCounter(45);
      generateQrCode();
    }
  }, [isConnectModalOpen, generateQrCode]);

  useEffect(() => {
    if (!isConnectModalOpen) return;
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
  }, [isConnectModalOpen, generateQrCode]);

  // Listen to open-whatsapp-connect-modal event
  useEffect(() => {
    function handleEvent() {
      setIsConnectModalOpen(true);
    }
    window.addEventListener("open-whatsapp-connect-modal", handleEvent);
    return () => window.removeEventListener("open-whatsapp-connect-modal", handleEvent);
  }, []);

  function handleStartTour() {
    if (!isConnected) {
      setIsConnectModalOpen(true);
      pushToast(
        "success",
        "Paso 1: Es obligatorio vincular tu WhatsApp para desbloquear el Bot. Escaneá el código QR."
      );
    } else {
      openTour("whatsapp");
    }
  }

  function insertTag(tag: string) {
    if (!currentTemplate) return;
    const updated = currentTemplate.body + " " + tag;
    updateWhatsAppTemplate(currentTemplate.id, updated);
  }

  function getPreviewText(templateBody: string) {
    return templateBody
      .replace(/{cliente}/g, "Martín Duarte")
      .replace(/{servicio}/g, "Corte VIP + Barba")
      .replace(/{profesional}/g, "Sebas Benítez")
      .replace(/{fecha}/g, "Viernes 25 de Septiembre")
      .replace(/{hora}/g, "16:30")
      .replace(/{negocio}/g, business.name)
      .replace(/{direccion}/g, business.address || "Avda. Santa Teresa 1420")
      .replace(/{link_autogestion}/g, `https://agendate.py/turno/ap-demo-123`)
      .replace(/{link_negocio}/g, bookingUrl);
  }

  async function copyToClipboard(text: string) {
    await navigator.clipboard.writeText(text);
    setCopiedLink(true);
    pushToast("success", "Copiado al portapapeles");
    setTimeout(() => setCopiedLink(false), 2000);
  }

  function handleSendTest() {
    if (!testPhone.trim()) {
      pushToast("error", "Ingresá un número de teléfono");
      return;
    }
    const cleanPhone = testPhone.replace(/\D/g, "");
    const previewMessage = currentTemplate ? getPreviewText(currentTemplate.body) : "";
    const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(previewMessage)}`;
    window.open(waUrl, "_blank");
    pushToast("success", "Abriendo WhatsApp para despachar mensaje de prueba");
  }

  // Save Bot Configuration to DB
  function handleSaveBotConfig() {
    updateEvolutionConfig({
      botMode: "rules",
      mainMenuOptions: menuOptions,
      keywordRules,
      welcomeMessage,
      fallbackMessage,
      outOfHoursEnabled,
      outOfHoursMessage,
      autoBotCadenceSeconds: responseCadence,
    });
    pushToast("success", "Configuración y reglas del Bot guardadas y sincronizadas con la base de datos.");
  }

  // Menu Options operations
  function handleAddMenuOption() {
    const nextKey = String(menuOptions.length + 1);
    const newOption: BotMainMenuOption = {
      id: `opt-${Date.now()}`,
      key: nextKey,
      title: "Nueva Opción",
      response: `Información sobre esta opción en ${business.name}:`,
      action: "none",
      enabled: true,
    };
    setMenuOptions([...menuOptions, newOption]);
  }

  function handleUpdateMenuOption(id: string, patch: Partial<BotMainMenuOption>) {
    setMenuOptions(menuOptions.map((o) => (o.id === id ? { ...o, ...patch } : o)));
  }

  function handleDeleteMenuOption(id: string) {
    if (menuOptions.length <= 1) return;
    setMenuOptions(menuOptions.filter((o) => o.id !== id));
  }

  // Keyword rules operations
  function handleAddKeywordRule() {
    const newRule: BotKeywordRule = {
      id: `kw-${Date.now()}`,
      keywords: ["consulta", "pregunta"],
      response: `Con gusto te ayudamos en ${business.name}. Consultá nuestra agenda online en:`,
      action: "send_link",
      enabled: true,
    };
    setKeywordRules([...keywordRules, newRule]);
  }

  function handleUpdateKeywordRule(id: string, patch: Partial<BotKeywordRule>) {
    setKeywordRules(keywordRules.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }

  function handleDeleteKeywordRule(id: string) {
    if (keywordRules.length <= 1) return;
    setKeywordRules(keywordRules.filter((r) => r.id !== id));
  }

  // Simulator bot response engine (Rules & Keywords)
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
        res += activeOpts.map((o) => `${o.key}️⃣ ${o.title}`).join("\n");
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
        reply += `\n\n📲 *Reservar online:* ${bookingUrl}`;
      } else if (matchedOption.action === "send_sipap") {
        reply += `\n\n💳 *Datos SIPAP:*\nBanco: Banco Itaú\nTitular: ${business.name}\nRUC: 80012345-6\nAlias: pagos@agendate.py`;
      } else if (matchedOption.action === "human_handoff") {
        reply += `\n\n👤 *Aviso:* Un integrante de nuestro equipo tomará la conversación en breve.`;
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
        reply += `\n\n📲 *Reservar online:* ${bookingUrl}`;
      } else if (matchedKeyword.action === "send_sipap") {
        reply += `\n\n💳 *Datos SIPAP:*\nBanco: Banco Itaú\nTitular: ${business.name}\nRUC: 80012345-6\nAlias: pagos@agendate.py`;
      } else if (matchedKeyword.action === "human_handoff") {
        reply += `\n\n👤 *Aviso:* Pausamos el bot automático y te transferimos a un asesor humano.`;
      }
      return reply;
    }

    // 4. Fallback: No coincide
    const activeOpts = menuOptions.filter((o) => o.enabled);
    let res = `${fallbackMessage}\n\n`;
    if (activeOpts.length > 0) {
      res += activeOpts.map((o) => `${o.key}️⃣ ${o.title}`).join("\n");
    }
    return res;
  }

  function handleSimSendMessage(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!simInput.trim() || isBotTypingSim) return;

    const userMsg = simInput.trim();
    const timeNow = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    setSimChatMessages((prev) => [...prev, { sender: "client", text: userMsg, time: timeNow }]);
    setSimInput("");
    setIsBotTypingSim(true);

    const delayMs = Math.min(2500, Math.max(600, responseCadence * 300));

    setTimeout(() => {
      const reply = computeBotReply(userMsg);
      setSimChatMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: reply,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
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
      `¡WhatsApp vinculado con éxito (${phoneToSet})! Sesión compartida con el CRM.`
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
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
              <Bot className="h-5 w-5" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              Bot WhatsApp
            </h1>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 border border-emerald-300/40">
              <Sparkles className="h-3 w-3" />
              Automatizado
            </span>
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
                isConnected ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
              }`}
            />
            <span className="text-slate-700 dark:text-slate-200">
              {isConnected ? "WhatsApp Conectado" : "WhatsApp Desconectado"}
            </span>
          </div>

          {/* Interactive Guide Button */}
          <button
            type="button"
            onClick={handleStartTour}
            className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90 px-3.5 py-2 text-xs font-bold shadow-2xs transition cursor-pointer"
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
          <Card className="border border-emerald-500/30 bg-emerald-50/20 dark:bg-emerald-950/15">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-500 text-slate-950 shadow-md">
                  <MessageCircle className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                      Línea Oficial Conectada
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-black uppercase text-emerald-700 dark:text-emerald-400">
                      ● Activo 24/7
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 font-mono mt-0.5">
                    Número: <strong className="text-emerald-700 dark:text-emerald-400">{activeConnectedPhone}</strong> · Sesión compartida con CRM Omnicanal
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsConnectModalOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 transition cursor-pointer shadow-2xs"
                >
                  <QrCode className="h-3.5 w-3.5" />
                  <span>Reconectar o Cambiar QR</span>
                </button>

                <button
                  type="button"
                  onClick={handleDisconnect}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 dark:border-rose-900/40 bg-rose-50 dark:bg-rose-950/20 hover:bg-rose-100 text-rose-700 dark:text-rose-400 px-3 py-1.5 text-xs font-bold transition cursor-pointer"
                >
                  <span>Desconectar</span>
                </button>
              </div>
            </div>
          </Card>
        ) : (
          /* DISCONNECTED / MANDATORY GATE */
          <div
            data-tour="bot-connect-gate"
            className="rounded-3xl border-2 border-dashed border-amber-400/80 dark:border-amber-500/40 bg-amber-50/40 dark:bg-amber-950/20 p-6 sm:p-8 text-center space-y-4 shadow-sm"
          >
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-amber-500 text-slate-950 shadow-md">
              <Lock className="h-8 w-8" />
            </div>

            <div className="max-w-xl mx-auto space-y-1.5">
              <span className="inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-wider text-amber-700 dark:text-amber-400 bg-amber-200/60 dark:bg-amber-900/60 px-2.5 py-0.5 rounded-full">
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
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold px-6 py-3.5 text-xs sm:text-sm shadow-lg shadow-emerald-600/25 transition active:scale-98 cursor-pointer"
              >
                <QrCode className="h-4.5 w-4.5" />
                <span>Vincular mi WhatsApp Ahora (Escanear QR)</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl mx-auto pt-3 text-left">
              <div className="p-3 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/60 dark:border-white/5 space-y-1 text-xs">
                <span className="font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Zap className="h-3.5 w-3.5 text-amber-500" />
                  <span>Sin salir de aquí</span>
                </span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                  Escaneás el código en un modal aquí mismo sin perder tu sesión ni navegar a otra pantalla.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/60 dark:border-white/5 space-y-1 text-xs">
                <span className="font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <RefreshCw className="h-3.5 w-3.5 text-emerald-500" />
                  <span>Misma sesión con CRM</span>
                </span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                  La sesión vinculada sirve automáticamente para este Bot y para la bandeja de mensajes del CRM.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/60 dark:border-white/5 space-y-1 text-xs">
                <span className="font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
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

      {/* ═══ 3. MAIN TABS ═══ */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200/80 dark:border-white/10 pb-3">
        <button
          type="button"
          onClick={() => isConnected && setActiveTab("reglas")}
          disabled={!isConnected}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            !isConnected
              ? "opacity-40 cursor-not-allowed text-slate-400"
              : activeTab === "reglas"
              ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-2xs"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
          }`}
        >
          <Sliders className="h-3.5 w-3.5" />
          <span>Flujo & Reglas del Bot</span>
          {!isConnected && <Lock className="h-3 w-3 ml-0.5" />}
        </button>

        <button
          type="button"
          onClick={() => isConnected && setActiveTab("plantillas")}
          disabled={!isConnected}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            !isConnected
              ? "opacity-40 cursor-not-allowed text-slate-400"
              : activeTab === "plantillas"
              ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-2xs"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
          }`}
        >
          <Bell className="h-3.5 w-3.5" />
          <span>Plantillas & Recordatorios (24h/2h)</span>
          {!isConnected && <Lock className="h-3 w-3 ml-0.5" />}
        </button>

        <button
          type="button"
          onClick={() => isConnected && setActiveTab("simulador")}
          disabled={!isConnected}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            !isConnected
              ? "opacity-40 cursor-not-allowed text-slate-400"
              : activeTab === "simulador"
              ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-2xs"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
          }`}
        >
          <Smartphone className="h-3.5 w-3.5" />
          <span>Simulador en Celular</span>
          {!isConnected && <Lock className="h-3 w-3 ml-0.5" />}
        </button>

        <button
          type="button"
          onClick={() => isConnected && setActiveTab("business")}
          disabled={!isConnected}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            !isConnected
              ? "opacity-40 cursor-not-allowed text-slate-400"
              : activeTab === "business"
              ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-2xs"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
          }`}
        >
          <MessageCircle className="h-3.5 w-3.5" />
          <span>WhatsApp Business</span>
          {!isConnected && <Lock className="h-3 w-3 ml-0.5" />}
        </button>
      </div>

      {/* ═══ 4. TAB CONTENTS ═══ */}
      {!isConnected ? (
        /* LOCKED OVERLAY */
        <div className="relative rounded-3xl border border-slate-200/80 dark:border-white/10 bg-slate-50/50 dark:bg-slate-900/40 p-8 text-center overflow-hidden">
          <div className="absolute inset-0 bg-white/40 dark:bg-slate-950/60 backdrop-blur-xs flex flex-col items-center justify-center p-6 z-10 space-y-3">
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

          <div className="opacity-30 pointer-events-none select-none filter blur-xs space-y-4">
            <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
            <div className="h-48 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          </div>
        </div>
      ) : activeTab === "reglas" ? (
        /* ═══ TAB 1: FLUJO & REGLAS DEL BOT ═══ */
        <div className="space-y-6" data-tour="bot-rules-card">
          <Card>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-white/10">
              <div>
                <span className="text-[11px] font-black uppercase text-emerald-600 dark:text-emerald-400 tracking-wider block">
                  Configuración de Respuestas
                </span>
                <h2 className="text-base font-extrabold text-slate-900 dark:text-white mt-0.5">
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
                  className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-2 text-xs font-bold shadow-xs hover:opacity-90 transition cursor-pointer"
                >
                  <Check className="h-3.5 w-3.5" />
                  <span>Guardar Cambios</span>
                </button>
              </div>
            </div>

            {/* Sub-Tabs: Menu, Keywords, Messages, Cadence */}
            <div className="flex flex-wrap items-center gap-2 pt-4">
              <button
                type="button"
                onClick={() => setRulesSubTab("menu")}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  rulesSubTab === "menu"
                    ? "bg-emerald-600 text-white shadow-2xs"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
                }`}
              >
                <ListOrdered className="h-3.5 w-3.5" />
                <span>Opciones del Menú ({menuOptions.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setRulesSubTab("palabras")}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  rulesSubTab === "palabras"
                    ? "bg-emerald-600 text-white shadow-2xs"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
                }`}
              >
                <Tag className="h-3.5 w-3.5" />
                <span>Palabras Clave ({keywordRules.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setRulesSubTab("mensajes")}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  rulesSubTab === "mensajes"
                    ? "bg-emerald-600 text-white shadow-2xs"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
                }`}
              >
                <MessageCircle className="h-3.5 w-3.5" />
                <span>Bienvenida & Fallback</span>
              </button>

              <button
                type="button"
                onClick={() => setRulesSubTab("velocidad")}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  rulesSubTab === "velocidad"
                    ? "bg-emerald-600 text-white shadow-2xs"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
                }`}
              >
                <Clock className="h-3.5 w-3.5" />
                <span>Pausa de Respuesta ({responseCadence}s)</span>
              </button>
            </div>
          </Card>

          {/* SUB-TAB 1: MENU BUILDER */}
          {rulesSubTab === "menu" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
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
                    className="p-4 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900 space-y-3 shadow-2xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-mono font-bold text-xs">
                          {opt.key}
                        </span>
                        <input
                          type="text"
                          value={opt.title}
                          onChange={(e) => handleUpdateMenuOption(opt.id, { title: e.target.value })}
                          className="font-bold text-xs text-slate-900 dark:text-white bg-transparent border-b border-transparent hover:border-slate-300 focus:border-emerald-500 focus:outline-none"
                          placeholder="Título de la opción..."
                        />
                      </div>

                      <div className="flex items-center gap-3">
                        <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 cursor-pointer">
                          <span>Activa</span>
                          <input
                            type="checkbox"
                            checked={opt.enabled}
                            onChange={(e) =>
                              handleUpdateMenuOption(opt.id, { enabled: e.target.checked })
                            }
                            className="h-4 w-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                          />
                        </label>

                        {menuOptions.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleDeleteMenuOption(opt.id)}
                            className="text-slate-400 hover:text-rose-600 p-1 transition cursor-pointer"
                            title="Eliminar opción"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                      <div className="sm:col-span-8">
                        <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                          Respuesta que enviará el Bot:
                        </label>
                        <textarea
                          rows={2}
                          value={opt.response}
                          onChange={(e) => handleUpdateMenuOption(opt.id, { response: e.target.value })}
                          className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                        />
                      </div>

                      <div className="sm:col-span-4">
                        <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                          Acción Automática:
                        </label>
                        <select
                          value={opt.action || "none"}
                          onChange={(e) =>
                            handleUpdateMenuOption(opt.id, {
                              action: e.target.value as any,
                            })
                          }
                          className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800 p-2 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                        >
                          <option value="none">Solo enviar texto</option>
                          <option value="send_link">📲 Adjuntar Link de Reservas</option>
                          <option value="send_sipap">💳 Adjuntar Datos SIPAP</option>
                          <option value="human_handoff">👤 Derivar a Asesor Humano</option>
                        </select>
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
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
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
                    className="p-4 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900 space-y-3 shadow-2xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Tag className="h-4 w-4 text-emerald-600" />
                        <span className="font-bold text-xs text-slate-900 dark:text-white">
                          Regla #{idx + 1}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 cursor-pointer">
                          <span>Activa</span>
                          <input
                            type="checkbox"
                            checked={rule.enabled}
                            onChange={(e) =>
                              handleUpdateKeywordRule(rule.id, { enabled: e.target.checked })
                            }
                            className="h-4 w-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                          />
                        </label>

                        {keywordRules.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleDeleteKeywordRule(rule.id)}
                            className="text-slate-400 hover:text-rose-600 p-1 transition cursor-pointer"
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
                        className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                        placeholder="ej: precio, cuanto cuesta, costo, promo"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                      <div className="sm:col-span-8">
                        <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                          Respuesta Automática:
                        </label>
                        <input
                          type="text"
                          value={rule.response}
                          onChange={(e) =>
                            handleUpdateKeywordRule(rule.id, { response: e.target.value })
                          }
                          className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                        />
                      </div>

                      <div className="sm:col-span-4">
                        <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                          Acción:
                        </label>
                        <select
                          value={rule.action || "none"}
                          onChange={(e) =>
                            handleUpdateKeywordRule(rule.id, {
                              action: e.target.value as any,
                            })
                          }
                          className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800 p-2 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                        >
                          <option value="none">Solo enviar texto</option>
                          <option value="send_link">📲 Adjuntar Link de Reservas</option>
                          <option value="send_sipap">💳 Adjuntar Datos SIPAP</option>
                          <option value="human_handoff">👤 Derivar a Asesor Humano</option>
                        </select>
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
              <Card className="space-y-4">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
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
                      className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800 p-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 font-sans"
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
                      className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800 p-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 font-sans"
                    />
                  </div>

                  <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800/50 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-amber-500" />
                        <span className="font-bold text-xs text-slate-900 dark:text-white">
                          Mensaje Especial Fuera de Horario Laboral
                        </span>
                      </div>
                      <input
                        type="checkbox"
                        checked={outOfHoursEnabled}
                        onChange={(e) => setOutOfHoursEnabled(e.target.checked)}
                        className="h-4 w-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                      />
                    </div>
                    {outOfHoursEnabled && (
                      <textarea
                        rows={2}
                        value={outOfHoursMessage}
                        onChange={(e) => setOutOfHoursMessage(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 p-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 font-sans"
                      />
                    )}
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* SUB-TAB 4: RESPONSE CADENCE */}
          {rulesSubTab === "velocidad" && (
            <div className="space-y-4">
              <Card className="space-y-4">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                    Pausa Natural de Respuesta
                  </h3>
                  <p className="text-xs text-slate-500">
                    Ajustá los segundos de espera antes de que el bot envíe su respuesta para que la interacción se sienta cómoda y natural.
                  </p>
                </div>

                <div className="p-4 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-slate-50/70 dark:bg-slate-800/40 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <Clock className="h-4 w-4 text-emerald-600" />
                      <span>Tiempo de espera antes de contestar:</span>
                    </span>
                    <strong className="text-emerald-700 dark:text-emerald-400 font-mono text-sm">
                      {responseCadence} segundos
                    </strong>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={responseCadence}
                    onChange={(e) => setResponseCadence(Number(e.target.value))}
                    className="w-full accent-emerald-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                    <span>1s (Inmediato)</span>
                    <span>5s (Natural)</span>
                    <span>10s (Pausado)</span>
                  </div>
                </div>
              </Card>
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
                <Bell className="h-3 w-3" />
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
              <Card>
                <div className="flex items-center justify-between pb-3 border-b border-border">
                  <div>
                    <h2 className="text-base font-bold text-slate-900 dark:text-white">
                      {currentTemplate?.name}
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Disparo automático despachado sin intervención humana por WhatsApp.
                    </p>
                  </div>
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                    <span>Habilitado</span>
                    <input
                      type="checkbox"
                      checked={currentTemplate?.enabled}
                      onChange={() =>
                        currentTemplate && toggleWhatsAppTemplate(currentTemplate.id)
                      }
                      className="h-4 w-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                    />
                  </label>
                </div>

                <div className="space-y-4 pt-3">
                  <div>
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      Variables dinámicas (tocá para insertar):
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {AVAILABLE_TAGS.map((item) => (
                        <button
                          key={item.tag}
                          type="button"
                          onClick={() => insertTag(item.tag)}
                          className="rounded-lg border border-slate-200/80 dark:border-white/10 bg-slate-50 dark:bg-slate-800 px-2.5 py-1 text-[11px] font-medium text-slate-700 dark:text-slate-300 hover:border-emerald-500 hover:text-emerald-600 transition cursor-pointer"
                        >
                          +{item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Cuerpo del Mensaje:
                    </label>
                    <textarea
                      rows={8}
                      value={currentTemplate?.body || ""}
                      onChange={(e) =>
                        currentTemplate &&
                        updateWhatsAppTemplate(currentTemplate.id, e.target.value)
                      }
                      className="w-full rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-slate-800/50 p-3.5 text-xs text-slate-900 dark:text-white focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none transition leading-relaxed font-sans"
                    />
                    <p className="mt-1 text-[11px] text-slate-400">
                      Consejo: Podés usar formato de WhatsApp con *negrita* o _cursiva_.
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                      <Check className="h-3.5 w-3.5" /> Cambios guardados automáticamente en la base de datos
                    </span>
                    <button
                      type="button"
                      onClick={() => pushToast("success", "Plantilla guardada y lista para despacho.")}
                      className="rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-2 text-xs font-bold shadow-xs hover:opacity-90 cursor-pointer"
                    >
                      Confirmar Plantilla
                    </button>
                  </div>
                </div>
              </Card>

              {/* Test Phone Direct */}
              <Card>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Probar Envío a mi Teléfono
                </h3>
                <p className="mt-1 text-xs text-slate-500">
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
                    className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 disabled:opacity-50 transition cursor-pointer"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>{sendingTest ? "Enviando..." : "Enviar Prueba"}</span>
                  </button>
                </div>
              </Card>
            </div>

            {/* Template Phone Mockup Preview */}
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
                      placeholder="Escribí como cliente (ej: 1, precio, hola)..."
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

            {/* Simulator Suggestions */}
            <div className="lg:col-span-5 space-y-4">
              <Card>
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Pruebas Rápidas en 1 Clic
                  </h3>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md">
                    Pausa: {responseCadence}s
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Tocá cualquiera de estas opciones para simular cómo responde tu bot a tus clientes:
                </p>

                <div className="space-y-2 mt-3">
                  {[
                    "Hola",
                    "1",
                    "2",
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
                      className="w-full text-left p-2.5 rounded-xl border border-slate-200/80 dark:border-white/10 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium text-slate-800 dark:text-slate-200 transition cursor-pointer flex items-center justify-between"
                    >
                      <span>&ldquo;{example}&rdquo;</span>
                      <ArrowRight className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    </button>
                  ))}
                </div>

                <div className="pt-4 border-t border-slate-200/70 dark:border-white/10 mt-4 flex items-center justify-between">
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
                          text: `¡Hola! Bienvenido/a a *${business.name}*. ¿En qué podemos ayudarte hoy?\n\n1️⃣ Agendar un turno online\n2️⃣ Ver servicios y precios\n3️⃣ Ubicación y horarios\n4️⃣ Datos de pago SIPAP\n5️⃣ Hablar con un asesor\n\n_Escribí el número de la opción o tu consulta._`,
                          time: "14:28",
                        },
                      ])
                    }
                    className="text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
                  >
                    Reiniciar conversación
                  </button>

                  <span className="text-[11px] text-slate-400 font-mono">
                    Pausa: {responseCadence}s
                  </span>
                </div>
              </Card>
            </div>
          </div>
        </div>
      ) : (
        /* ═══ TAB 4: RESPUESTA DE BIENVENIDA WHATSAPP BUSINESS ═══ */
        <div className="space-y-6" data-tour="bot-quick-reply">
          <Card className="border border-emerald-200/80 dark:border-emerald-800/40 bg-emerald-50/20 dark:bg-emerald-950/15">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-md">
                <Smartphone className="h-5 w-5" />
              </div>
              <div className="flex-1 space-y-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
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
                    className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-4 py-2 text-xs font-bold text-white shadow-xs transition cursor-pointer"
                  >
                    {copiedLink ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copiedLink ? "¡Copiado con Éxito!" : "Copiar Mensaje de Bienvenida"}</span>
                  </button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* ═══ 5. IN-PAGE CONNECTION MODAL (QR LINKING) ═══ */}
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
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
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

            {/* QR Container */}
            <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-white/10">
              {qrCodeDataUrl ? (
                <div className="relative bg-white p-3 rounded-2xl shadow-sm">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={qrCodeDataUrl}
                    alt="Código QR de Vinculación de WhatsApp"
                    className="h-48 w-48 object-contain rounded-lg"
                  />
                </div>
              ) : (
                <div className="h-48 w-48 rounded-2xl bg-white/20 animate-pulse flex items-center justify-center">
                  <span className="text-xs text-slate-400 font-bold">Generando código...</span>
                </div>
              )}

              <div className="mt-3 flex items-center gap-2 text-xs text-slate-500 font-mono">
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                <span>El código se actualiza en: <strong>{qrCounter}s</strong></span>
              </div>
            </div>

            {/* 3 Steps */}
            <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
              <p className="font-bold text-slate-900 dark:text-white">Cómo vincular desde tu teléfono:</p>
              <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                <li>Abrí <strong>WhatsApp</strong> en tu teléfono celular.</li>
                <li>Tocá los <strong>tres puntos (⋮)</strong> en Android o <strong>Ajustes</strong> en iPhone.</li>
                <li>Seleccioná <strong>&ldquo;Dispositivos vinculados&rdquo;</strong> y apuntá tu cámara a este código QR.</li>
              </ol>
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
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 text-xs shadow-md transition cursor-pointer"
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
