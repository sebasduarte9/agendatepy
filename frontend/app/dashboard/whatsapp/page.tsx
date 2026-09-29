"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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
  ExternalLink,
  CreditCard,
  UserCheck,
  ArrowRight,
  RotateCcw,
  Layers,
  Phone,
  ZoomIn,
  ZoomOut,
  Maximize2,
  ChevronRight,
  Play,
  Share2,
  Settings,
  SlidersHorizontal,
} from "lucide-react";
import { useDashboardStore } from "@/store/useDashboardStore";
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
// N8N-STYLE CANVAS TYPES & MODELS
// ═══════════════════════════════════════════════════════════════════

export type NodeType = "trigger" | "welcome" | "menu" | "action" | "keyword";

export interface CanvasNode {
  id: string;
  type: NodeType;
  title: string;
  x: number;
  y: number;
  enabled: boolean;
  config: {
    key?: string; // for menu options: "1", "2", etc.
    actionType?: "none" | "send_link" | "send_sipap" | "human_handoff";
    response?: string;
    keywords?: string[];
    welcomeText?: string;
    fallbackText?: string;
    options?: { id: string; key: string; label: string; targetNodeId: string }[];
  };
}

export interface CanvasConnection {
  id: string;
  fromNodeId: string;
  fromPort?: string;
  toNodeId: string;
}

// ═══════════════════════════════════════════════════════════════════
// CUSTOM UI CONTROLS (Zero Basic HTML, Zero Emojis)
// ═══════════════════════════════════════════════════════════════════

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
  }[] = [
    { id: "none", label: "Solo Texto", icon: MessageSquare },
    { id: "send_link", label: "Link Reservas", icon: ExternalLink },
    { id: "send_sipap", label: "Datos SIPAP", icon: CreditCard },
    { id: "human_handoff", label: "Asesor Humano", icon: UserCheck },
  ];

  return (
    <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-white/5">
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
            <span className="truncate text-[11px]">{act.label}</span>
          </button>
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// INITIAL WORKFLOW NODES & CONNECTIONS (N8N STYLE)
// ═══════════════════════════════════════════════════════════════════

const DEFAULT_CANVAS_NODES: CanvasNode[] = [
  {
    id: "node-trigger-entry",
    type: "trigger",
    title: "Mensaje Entrante",
    x: 40,
    y: 190,
    enabled: true,
    config: {},
  },
  {
    id: "node-welcome-hub",
    type: "welcome",
    title: "Saludo & Menú",
    x: 280,
    y: 160,
    enabled: true,
    config: {
      welcomeText: "¡Hola! Bienvenido/a a nuestro canal oficial. ¿En qué podemos ayudarte hoy?\n\n1. Agendar un turno online\n2. Ver servicios y precios\n3. Ubicación y horarios\n4. Datos de pago SIPAP\n5. Hablar con un asesor\n\n_Escribí el número de la opción o tu consulta._",
      fallbackText: "Disculpá, no entendí esa opción. Por favor elegí una opción escribiendo el número correspondiente (ej: 1 o 2) o escribí *humano* para contactar a nuestro equipo.",
    },
  },
  {
    id: "node-menu-router",
    type: "menu",
    title: "Enrutador de Opciones",
    x: 560,
    y: 130,
    enabled: true,
    config: {
      options: [
        { id: "opt-1", key: "1", label: "1. Agendar Turno Online", targetNodeId: "node-act-link" },
        { id: "opt-2", key: "2", label: "2. Servicios y Precios", targetNodeId: "node-act-prices" },
        { id: "opt-3", key: "3", label: "3. Ubicación y Horarios", targetNodeId: "node-act-location" },
        { id: "opt-4", key: "4", label: "4. Datos Pago SIPAP", targetNodeId: "node-act-sipap" },
        { id: "opt-5", key: "5", label: "5. Asesor Humano", targetNodeId: "node-act-human" },
      ],
    },
  },
  {
    id: "node-act-link",
    type: "action",
    title: "Link de Reservas",
    x: 900,
    y: 30,
    enabled: true,
    config: {
      key: "1",
      actionType: "send_link",
      response: "¡Excelente! Podés elegir tu servicio, ver los profesionales y reservar tu turno con confirmación inmediata acá:",
    },
  },
  {
    id: "node-act-prices",
    type: "action",
    title: "Servicios y Tarifas",
    x: 900,
    y: 150,
    enabled: true,
    config: {
      key: "2",
      actionType: "send_link",
      response: "Nuestros servicios más pedidos:\n• Corte Clásico / Fade: Gs. 60.000\n• Perfilado & Barba VIP: Gs. 45.000\n• Combo Corte + Barba: Gs. 95.000\n\nPodés ver la carta completa y promociones aquí:",
    },
  },
  {
    id: "node-act-location",
    type: "action",
    title: "Ubicación & Horarios",
    x: 900,
    y: 270,
    enabled: true,
    config: {
      key: "3",
      actionType: "none",
      response: "Estamos en Avda. Santa Teresa 1420 c/ Denis Roa, Asunción.\nHorario de atención: Lunes a Sábado de 09:00 a 20:00 hs.\nContamos con estacionamiento exclusivo para clientes.",
    },
  },
  {
    id: "node-act-sipap",
    type: "action",
    title: "Datos SIPAP",
    x: 900,
    y: 390,
    enabled: true,
    config: {
      key: "4",
      actionType: "send_sipap",
      response: "Datos para transferencias bancarias:\nBanco: Banco Itaú Paraguay\nTitular: AgendatePY Studio\nCta Cte: 0123456789\nRUC: 80012345-6\nAlias SIPAP: pagos@agendate.py\n\nPor favor envianos tu comprobante para validarlo.",
    },
  },
  {
    id: "node-act-human",
    type: "action",
    title: "Derivación a Humano",
    x: 900,
    y: 510,
    enabled: true,
    config: {
      key: "5",
      actionType: "human_handoff",
      response: "¡Claro que sí! Un integrante de nuestro equipo tomará la conversación en breve. Por favor dejanos tu consulta detallada.",
    },
  },
  {
    id: "node-keywords-trigger",
    type: "keyword",
    title: "Palabras Clave",
    x: 280,
    y: 430,
    enabled: true,
    config: {
      keywords: ["precio", "costo", "turno", "donde", "ubicacion", "sipap"],
      response: "Gracias por consultarnos. Consultá nuestros horarios y reservá en tiempo real aquí:",
      actionType: "send_link",
    },
  },
];

const DEFAULT_CANVAS_CONNECTIONS: CanvasConnection[] = [
  { id: "conn-1", fromNodeId: "node-trigger-entry", toNodeId: "node-welcome-hub" },
  { id: "conn-2", fromNodeId: "node-welcome-hub", toNodeId: "node-menu-router" },
  { id: "conn-3", fromNodeId: "node-menu-router", fromPort: "opt-1", toNodeId: "node-act-link" },
  { id: "conn-4", fromNodeId: "node-menu-router", fromPort: "opt-2", toNodeId: "node-act-prices" },
  { id: "conn-5", fromNodeId: "node-menu-router", fromPort: "opt-3", toNodeId: "node-act-location" },
  { id: "conn-6", fromNodeId: "node-menu-router", fromPort: "opt-4", toNodeId: "node-act-sipap" },
  { id: "conn-7", fromNodeId: "node-menu-router", fromPort: "opt-5", toNodeId: "node-act-human" },
  { id: "conn-8", fromNodeId: "node-trigger-entry", toNodeId: "node-keywords-trigger" },
  { id: "conn-9", fromNodeId: "node-keywords-trigger", toNodeId: "node-act-link" },
];

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

  // Main Tabs
  const [activeTab, setActiveTab] = useState<"canva" | "simulador" | "plantillas" | "business">("canva");

  // Canvas State (n8n style)
  const [nodes, setNodes] = useState<CanvasNode[]>(DEFAULT_CANVAS_NODES);
  const [connections, setConnections] = useState<CanvasConnection[]>(DEFAULT_CANVAS_CONNECTIONS);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>("node-menu-router");
  const [zoom, setZoom] = useState(1);
  const [isInspectorOpen, setIsInspectorOpen] = useState(true);

  // Dragging state for nodes
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const dragStartRef = useRef<{ startX: number; startY: number; nodeStartX: number; nodeStartY: number } | null>(null);
  const canvasRef = useRef<HTMLDivElement | null>(null);

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

  // Live Simulator state (Zero emojis)
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

  // Guided tour trigger
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

  // ═══════════════════════════════════════════════════════════════════
  // NODE DRAG & DROP LOGIC
  // ═══════════════════════════════════════════════════════════════════

  function handleNodePointerDown(e: React.PointerEvent, nodeId: string) {
    e.stopPropagation();
    setSelectedNodeId(nodeId);
    setIsInspectorOpen(true);

    const targetNode = nodes.find((n) => n.id === nodeId);
    if (!targetNode) return;

    setDraggingNodeId(nodeId);
    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      nodeStartX: targetNode.x,
      nodeStartY: targetNode.y,
    };
  }

  const handleCanvasPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!draggingNodeId || !dragStartRef.current) return;
      const dx = (e.clientX - dragStartRef.current.startX) / zoom;
      const dy = (e.clientY - dragStartRef.current.startY) / zoom;

      const newX = Math.max(10, Math.round((dragStartRef.current.nodeStartX + dx) / 10) * 10);
      const newY = Math.max(10, Math.round((dragStartRef.current.nodeStartY + dy) / 10) * 10);

      setNodes((prev) =>
        prev.map((node) =>
          node.id === draggingNodeId ? { ...node, x: newX, y: newY } : node
        )
      );
    },
    [draggingNodeId, zoom]
  );

  const handleCanvasPointerUp = useCallback(() => {
    setDraggingNodeId(null);
    dragStartRef.current = null;
  }, []);

  // Update specific node config
  function updateNode(nodeId: string, patch: Partial<CanvasNode>) {
    setNodes((prev) =>
      prev.map((node) => (node.id === nodeId ? { ...node, ...patch } : node))
    );
  }

  function updateNodeConfig(nodeId: string, configPatch: Partial<CanvasNode["config"]>) {
    setNodes((prev) =>
      prev.map((node) =>
        node.id === nodeId
          ? { ...node, config: { ...node.config, ...configPatch } }
          : node
      )
    );
  }

  function deleteNode(nodeId: string) {
    setNodes((prev) => prev.filter((n) => n.id !== nodeId));
    setConnections((prev) =>
      prev.filter((c) => c.fromNodeId !== nodeId && c.toNodeId !== nodeId)
    );
    if (selectedNodeId === nodeId) {
      setSelectedNodeId(null);
    }
    pushToast("success", "Nodo eliminado del flujo.");
  }

  function addNewActionNode() {
    const nextKey = String(nodes.filter((n) => n.type === "action").length + 1);
    const newNodeId = `node-act-${Date.now()}`;
    const newNode: CanvasNode = {
      id: newNodeId,
      type: "action",
      title: `Opción ${nextKey}: Nueva Acción`,
      x: 900,
      y: 100 + nodes.length * 40,
      enabled: true,
      config: {
        key: nextKey,
        actionType: "send_link",
        response: "Escribí aquí el texto que enviará este nodo de respuesta...",
      },
    };

    setNodes((prev) => [...prev, newNode]);
    setConnections((prev) => [
      ...prev,
      { id: `conn-${Date.now()}`, fromNodeId: "node-menu-router", toNodeId: newNodeId },
    ]);
    setSelectedNodeId(newNodeId);
    setIsInspectorOpen(true);
    pushToast("success", "Nuevo nodo de respuesta añadido al flujo.");
  }

  function handleSaveCanvasFlow() {
    // Sincronizar nodos con evolutionConfig
    const actionNodes = nodes.filter((n) => n.type === "action");
    const keywordNodes = nodes.filter((n) => n.type === "keyword");
    const welcomeNode = nodes.find((n) => n.type === "welcome");

    const mappedMenuOptions: BotMainMenuOption[] = actionNodes.map((n, i) => ({
      id: n.id,
      key: n.config.key || String(i + 1),
      title: n.title,
      response: n.config.response || "Información solicitada.",
      action: n.config.actionType || "none",
      enabled: n.enabled,
    }));

    const mappedKeywordRules: BotKeywordRule[] = keywordNodes.map((n) => ({
      id: n.id,
      keywords: n.config.keywords || ["consulta"],
      response: n.config.response || "Gracias por comunicarte.",
      action: n.config.actionType || "none",
      enabled: n.enabled,
    }));

    updateEvolutionConfig({
      mainMenuOptions: mappedMenuOptions,
      keywordRules: mappedKeywordRules,
      welcomeMessage: welcomeNode?.config.welcomeText || evolutionConfig.welcomeMessage,
      fallbackMessage: welcomeNode?.config.fallbackText || evolutionConfig.fallbackMessage,
    });

    pushToast("success", "¡Flujo del canva guardado y sincronizado con éxito!");
  }

  // ═══════════════════════════════════════════════════════════════════
  // SIMULATOR BOT RESPONSE (Rules Engine Driven by Canvas Nodes)
  // ═══════════════════════════════════════════════════════════════════

  function computeBotReply(userMsg: string): string {
    const lower = userMsg.toLowerCase().trim();
    const welcomeNode = nodes.find((n) => n.type === "welcome");
    const welcomeText = welcomeNode?.config.welcomeText || "¡Hola! Bienvenido a nuestra agenda oficial.";
    const fallbackText = welcomeNode?.config.fallbackText || "Opción no reconocida. Por favor ingresá un número.";

    const actionNodes = nodes.filter((n) => n.type === "action" && n.enabled);
    const keywordNodes = nodes.filter((n) => n.type === "keyword" && n.enabled);

    // 1. Saludo inicial
    if (
      lower === "hola" ||
      lower === "buenas" ||
      lower === "buen dia" ||
      lower === "menu" ||
      lower === "inicio" ||
      lower === "empezar"
    ) {
      let res = `${welcomeText}\n\n`;
      if (actionNodes.length > 0) {
        res += actionNodes.map((o) => `${o.config.key || "•"}. ${o.title}`).join("\n");
        res += `\n\n_Escribí el número para elegir una opción._`;
      }
      return res;
    }

    // 2. Coincidencia numérica con nodo de acción
    const matchedAction = actionNodes.find(
      (n) => lower === (n.config.key || "").toLowerCase() || lower === n.title.toLowerCase()
    );
    if (matchedAction) {
      let reply = matchedAction.config.response || "Aquí tenés la información:";
      if (matchedAction.config.actionType === "send_link") {
        reply += `\n\n*Reservar online:* ${bookingUrl}`;
      } else if (matchedAction.config.actionType === "send_sipap") {
        reply += `\n\n*Datos SIPAP:*\nBanco: Banco Itaú\nTitular: ${business.name}\nRUC: 80012345-6\nAlias: pagos@agendate.py`;
      } else if (matchedAction.config.actionType === "human_handoff") {
        reply += `\n\n*Atención:* Un integrante de nuestro equipo tomará la conversación en breve.`;
      }
      return reply;
    }

    // 3. Coincidencia con palabras clave
    const matchedKw = keywordNodes.find((n) =>
      (n.config.keywords || []).some((kw) => lower.includes(kw.toLowerCase().trim()))
    );
    if (matchedKw) {
      let reply = matchedKw.config.response || "Información sobre tu consulta:";
      if (matchedKw.config.actionType === "send_link") {
        reply += `\n\n*Reservar online:* ${bookingUrl}`;
      } else if (matchedKw.config.actionType === "send_sipap") {
        reply += `\n\n*Datos SIPAP:*\nBanco: Banco Itaú\nTitular: ${business.name}\nRUC: 80012345-6\nAlias: pagos@agendate.py`;
      } else if (matchedKw.config.actionType === "human_handoff") {
        reply += `\n\n*Atención:* Derivando a un asesor humano...`;
      }
      return reply;
    }

    // 4. Fallback
    let res = `${fallbackText}\n\n`;
    if (actionNodes.length > 0) {
      res += actionNodes.map((o) => `${o.config.key || "•"}. ${o.title}`).join("\n");
    }
    return res;
  }

  function handleSimSendMessage(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!simInput.trim() || isBotTypingSim) return;

    const userMsg = simInput.trim();
    const timeNow = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    setSimChatMessages((prev) => [
      ...prev,
      { sender: "client", text: userMsg, time: timeNow },
    ]);
    setSimInput("");
    setIsBotTypingSim(true);

    // Fixed sensible human pause (no user config needed)
    setTimeout(() => {
      const botResponse = computeBotReply(userMsg);
      const botTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      setSimChatMessages((prev) => [
        ...prev,
        { sender: "bot", text: botResponse, time: botTime },
      ]);
      setIsBotTypingSim(false);
    }, 900);
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

  const activeConnectedPhone =
    evolutionConfig.phoneNumber || business.whatsappNumber || business.phone || "+595 981 700 800";

  const selectedNode = nodes.find((n) => n.id === selectedNodeId) || null;

  return (
    <div className="space-y-6">
      {/* ═══ 1. TOP HEADER ═══ */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 border border-emerald-500/20 shadow-2xs">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                  Bot WhatsApp
                </h1>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 dark:bg-emerald-950/80 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                  <Zap className="h-3 w-3" />
                  Flujo Visual Canva
                </span>
              </div>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Diseñá el flujo de atención interactivo en un canva visual configurable: conectá opciones, disparadores y respuestas automáticas.
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
                Vinculá tu WhatsApp para activar el Canva del Bot
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Para configurar el flujo visual de nodos, las opciones de respuesta y los recordatorios automáticos 24h y 2h antes, es obligatorio vincular la línea oficial de tu negocio.
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
          </div>
        )}
      </div>

      {/* ═══ 3. MAIN TABS (Segmented Pill Group) ═══ */}
      <div className="p-1 rounded-2xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200/80 dark:border-white/10 flex flex-wrap gap-1">
        <button
          type="button"
          onClick={() => isConnected && setActiveTab("canva")}
          disabled={!isConnected}
          className={`flex-1 min-w-[150px] flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
            !isConnected
              ? "opacity-40 cursor-not-allowed text-slate-400"
              : activeTab === "canva"
              ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs border border-slate-200/60 dark:border-white/10"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Share2 className="h-3.5 w-3.5 text-emerald-600" />
          <span>Canva de Flujo (Tipo n8n)</span>
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
              Canva Bloqueado Temporalmente
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 max-w-md">
              Vinculá tu WhatsApp arriba para poder arrastrar, editar y configurar el flujo interactivo de tu bot.
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
            <div className="h-40 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
            <div className="h-60 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          </div>
        </div>
      ) : activeTab === "canva" ? (
        /* ═══ TAB 1: VISUAL CANVAS BUILDER (n8n Style) ═══ */
        <div className="space-y-4" data-tour="bot-rules-card">
          {/* Canvas Top Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/10 shadow-2xs">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
                <Share2 className="h-4 w-4" />
              </span>
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white leading-tight">
                  Canva del Flujo Automático
                </h3>
                <span className="text-[11px] text-slate-400">
                  Arrastrá los nodos y hacé clic para editar respuestas y acciones
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Zoom Controls */}
              <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/70 dark:border-white/5">
                <button
                  type="button"
                  onClick={() => setZoom((z) => Math.max(0.6, Number((z - 0.1).toFixed(1))))}
                  className="p-1 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition cursor-pointer"
                  title="Alejar"
                >
                  <ZoomOut className="h-3.5 w-3.5" />
                </button>
                <span className="text-[11px] font-mono font-bold px-1.5 text-slate-700 dark:text-slate-300">
                  {Math.round(zoom * 100)}%
                </span>
                <button
                  type="button"
                  onClick={() => setZoom((z) => Math.min(1.4, Number((z + 0.1).toFixed(1))))}
                  className="p-1 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition cursor-pointer"
                  title="Acercar"
                >
                  <ZoomIn className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setZoom(1)}
                  className="p-1 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition cursor-pointer"
                  title="Restablecer"
                >
                  <Maximize2 className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Add Node Button */}
              <button
                type="button"
                onClick={addNewActionNode}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-dashed border-emerald-600 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 text-xs font-bold transition active:scale-98 cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Agregar Nodo</span>
              </button>

              {/* Test in Simulator */}
              <button
                type="button"
                onClick={() => setActiveTab("simulador")}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 text-xs font-bold transition active:scale-98 cursor-pointer"
              >
                <Play className="h-3.5 w-3.5 text-emerald-600" />
                <span>Probar Flujo</span>
              </button>

              {/* Save Workflow Button */}
              <button
                type="button"
                onClick={handleSaveCanvasFlow}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs transition active:scale-98 cursor-pointer"
              >
                <Check className="h-3.5 w-3.5" />
                <span>Guardar Flujo</span>
              </button>
            </div>
          </div>

          {/* Canvas Workspace + Inspector Drawer */}
          <div className="relative rounded-3xl border border-slate-200/90 dark:border-white/10 bg-slate-50/70 dark:bg-slate-950 overflow-hidden flex min-h-[640px] shadow-sm">
            {/* Canvas Viewport */}
            <div
              ref={canvasRef}
              onPointerMove={handleCanvasPointerMove}
              onPointerUp={handleCanvasPointerUp}
              className="flex-1 relative overflow-auto select-none [background-image:radial-gradient(#cbd5e1_1.2px,transparent_1.2px)] dark:[background-image:radial-gradient(#334155_1.2px,transparent_1.2px)] [background-size:20px_20px]"
              style={{ minHeight: "640px" }}
            >
              {/* Scalable Container */}
              <div
                className="relative"
                style={{
                  width: "1280px",
                  height: "720px",
                  transform: `scale(${zoom})`,
                  transformOrigin: "top left",
                  transition: draggingNodeId ? "none" : "transform 0.15s ease",
                }}
              >
                {/* SVG Connections Layer (Bezier Curves) */}
                <svg
                  className="absolute inset-0 pointer-events-none w-full h-full"
                  style={{ zIndex: 1 }}
                >
                  <defs>
                    <linearGradient id="flowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#059669" stopOpacity="0.8" />
                    </linearGradient>
                  </defs>

                  {connections.map((conn) => {
                    const fromNode = nodes.find((n) => n.id === conn.fromNodeId);
                    const toNode = nodes.find((n) => n.id === conn.toNodeId);
                    if (!fromNode || !toNode) return null;

                    const nodeWidth = 200;
                    const nodeHeight = 85;

                    const x1 = fromNode.x + nodeWidth;
                    const y1 = fromNode.y + nodeHeight / 2;
                    const x2 = toNode.x;
                    const y2 = toNode.y + nodeHeight / 2;

                    const dx = Math.max(40, (x2 - x1) / 2);
                    const pathD = `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;

                    const isConnectedToSelected =
                      selectedNodeId === fromNode.id || selectedNodeId === toNode.id;

                    return (
                      <g key={conn.id}>
                        <path
                          d={pathD}
                          fill="none"
                          stroke={isConnectedToSelected ? "#10b981" : "#94a3b8"}
                          strokeWidth={isConnectedToSelected ? 3 : 2}
                          strokeDasharray={isConnectedToSelected ? "none" : "5,4"}
                          strokeOpacity={isConnectedToSelected ? 0.9 : 0.4}
                          strokeLinecap="round"
                        />
                        {/* Port dots */}
                        <circle cx={x1} cy={y1} r={4} fill="#10b981" />
                        <circle cx={x2} cy={y2} r={4} fill={isConnectedToSelected ? "#10b981" : "#64748b"} />
                      </g>
                    );
                  })}
                </svg>

                {/* Nodes Layer */}
                <div className="absolute inset-0" style={{ zIndex: 2 }}>
                  {nodes.map((node) => {
                    const isSelected = selectedNodeId === node.id;
                    const isDragging = draggingNodeId === node.id;

                    const typeStyles: Record<NodeType, { badge: string; color: string; icon: typeof Bot }> = {
                      trigger: { badge: "Disparador", color: "border-amber-400 bg-amber-500/10 text-amber-700 dark:text-amber-400", icon: MessageCircle },
                      welcome: { badge: "Bienvenida", color: "border-sky-400 bg-sky-500/10 text-sky-700 dark:text-sky-400", icon: Bot },
                      menu: { badge: "Menú Router", color: "border-indigo-400 bg-indigo-500/10 text-indigo-700 dark:text-indigo-400", icon: ListOrdered },
                      action: { badge: "Respuesta", color: "border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400", icon: ExternalLink },
                      keyword: { badge: "Palabra Clave", color: "border-purple-400 bg-purple-500/10 text-purple-700 dark:text-purple-400", icon: Tag },
                    };

                    const style = typeStyles[node.type] || typeStyles.action;
                    const Icon = style.icon;

                    return (
                      <div
                        key={node.id}
                        onPointerDown={(e) => handleNodePointerDown(e, node.id)}
                        className={`absolute w-[210px] rounded-2xl p-3.5 transition-shadow cursor-grab active:cursor-grabbing border ${
                          isSelected
                            ? "border-emerald-500 bg-white dark:bg-slate-900 shadow-lg shadow-emerald-500/15 ring-2 ring-emerald-500/40 z-20"
                            : "border-slate-200/90 dark:border-white/10 bg-white/95 dark:bg-slate-900/95 shadow-sm hover:border-slate-300 dark:hover:border-white/20 z-10"
                        } ${!node.enabled ? "opacity-60" : ""}`}
                        style={{
                          left: `${node.x}px`,
                          top: `${node.y}px`,
                          transform: isDragging ? "scale(1.02)" : "scale(1)",
                        }}
                      >
                        {/* Node Header */}
                        <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-100 dark:border-white/5">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase ${style.color}`}
                          >
                            <Icon className="h-2.5 w-2.5" />
                            {style.badge}
                          </span>

                          <span
                            className={`h-2 w-2 rounded-full ${
                              node.enabled ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-700"
                            }`}
                          />
                        </div>

                        {/* Node Title & Description */}
                        <div className="pt-2">
                          <p className="text-xs font-black text-slate-900 dark:text-white truncate">
                            {node.title}
                          </p>

                          {node.type === "action" && (
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5 font-mono">
                              Acción: {node.config.actionType === "send_link" ? "Link Reservas" : node.config.actionType === "send_sipap" ? "SIPAP" : node.config.actionType === "human_handoff" ? "Humano" : "Texto"}
                            </p>
                          )}

                          {node.type === "keyword" && (
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5 font-mono">
                              {(node.config.keywords || []).slice(0, 3).join(", ")}
                            </p>
                          )}

                          {node.type === "menu" && (
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5 font-mono">
                              5 Opciones Numéricas
                            </p>
                          )}
                        </div>

                        {/* Input & Output Ports (Visual Connectors) */}
                        <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 h-3 w-3 rounded-full bg-slate-300 dark:bg-slate-700 border-2 border-white dark:border-slate-900" />
                        <div className="absolute -right-1.5 top-1/2 -translate-y-1/2 h-3 w-3 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900" />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Inspector Drawer (Configurable Node Panel) */}
            {isInspectorOpen && selectedNode && (
              <div className="w-[320px] sm:w-[350px] shrink-0 border-l border-slate-200/90 dark:border-white/10 bg-white dark:bg-slate-900 p-5 flex flex-col justify-between overflow-y-auto z-30 shadow-md">
                <div className="space-y-4">
                  {/* Inspector Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/5">
                    <div>
                      <span className="text-[10px] font-mono font-bold uppercase text-emerald-600 dark:text-emerald-400 block">
                        Configurador de Nodo
                      </span>
                      <h4 className="text-sm font-black text-slate-900 dark:text-white truncate">
                        {selectedNode.title}
                      </h4>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsInspectorOpen(false)}
                      className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition cursor-pointer"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Node State (Active / Paused) */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-white/5">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Estado del Nodo:
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-400">
                        {selectedNode.enabled ? "Activo" : "Pausado"}
                      </span>
                      <CustomSwitch
                        checked={selectedNode.enabled}
                        onChange={(checked) => updateNode(selectedNode.id, { enabled: checked })}
                      />
                    </div>
                  </div>

                  {/* Title Edit */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Nombre o Identificador del Nodo:
                    </label>
                    <input
                      type="text"
                      value={selectedNode.title}
                      onChange={(e) => updateNode(selectedNode.id, { title: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 font-sans"
                    />
                  </div>

                  {/* Action Node Config */}
                  {selectedNode.type === "action" && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Acción Automática Asociada:
                        </label>
                        <ActionSelector
                          value={selectedNode.config.actionType || "none"}
                          onChange={(val) => updateNodeConfig(selectedNode.id, { actionType: val })}
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Texto que despacha este nodo:
                        </label>
                        <textarea
                          rows={4}
                          value={selectedNode.config.response || ""}
                          onChange={(e) =>
                            updateNodeConfig(selectedNode.id, { response: e.target.value })
                          }
                          className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 font-sans leading-relaxed"
                          placeholder="Texto de respuesta..."
                        />
                      </div>
                    </div>
                  )}

                  {/* Welcome Node Config */}
                  {selectedNode.type === "welcome" && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Mensaje de Bienvenida:
                        </label>
                        <textarea
                          rows={4}
                          value={selectedNode.config.welcomeText || ""}
                          onChange={(e) =>
                            updateNodeConfig(selectedNode.id, { welcomeText: e.target.value })
                          }
                          className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 font-sans leading-relaxed"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Mensaje Fallback (No reconocido):
                        </label>
                        <textarea
                          rows={3}
                          value={selectedNode.config.fallbackText || ""}
                          onChange={(e) =>
                            updateNodeConfig(selectedNode.id, { fallbackText: e.target.value })
                          }
                          className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 font-sans leading-relaxed"
                        />
                      </div>
                    </div>
                  )}

                  {/* Keyword Node Config */}
                  {selectedNode.type === "keyword" && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Palabras Clave (separadas por coma):
                        </label>
                        <input
                          type="text"
                          value={(selectedNode.config.keywords || []).join(", ")}
                          onChange={(e) =>
                            updateNodeConfig(selectedNode.id, {
                              keywords: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                            })
                          }
                          className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Acción Automática:
                        </label>
                        <ActionSelector
                          value={selectedNode.config.actionType || "send_link"}
                          onChange={(val) => updateNodeConfig(selectedNode.id, { actionType: val })}
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Respuesta para estas palabras:
                        </label>
                        <textarea
                          rows={3}
                          value={selectedNode.config.response || ""}
                          onChange={(e) =>
                            updateNodeConfig(selectedNode.id, { response: e.target.value })
                          }
                          className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 font-sans leading-relaxed"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer Actions */}
                <div className="pt-4 border-t border-slate-100 dark:border-white/5 space-y-2">
                  {selectedNode.type === "action" && (
                    <button
                      type="button"
                      onClick={() => deleteNode(selectedNode.id)}
                      className="w-full inline-flex items-center justify-center gap-1.5 p-2 rounded-xl border border-rose-200 dark:border-rose-900/40 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-xs font-bold transition cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Eliminar Nodo</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleSaveCanvasFlow}
                    className="w-full inline-flex items-center justify-center gap-1.5 p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs transition active:scale-98 cursor-pointer"
                  >
                    <Check className="h-3.5 w-3.5" />
                    <span>Guardar Flujo</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : activeTab === "simulador" ? (
        /* ═══ TAB 2: LIVE SIMULATOR ═══ */
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

            {/* Quick Test Chips */}
            <div className="lg:col-span-5 space-y-4">
              <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900 p-5 space-y-4 shadow-2xs">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">
                    Pruebas Rápidas en 1 Clic
                  </h3>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md">
                    Flujo Conectado
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Tocá cualquiera de estas opciones para simular cómo responde tu canva a tus clientes:
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
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : activeTab === "plantillas" ? (
        /* ═══ TAB 3: PLANTILLAS Y RECORDATORIOS ═══ */
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
      ) : (
        /* ═══ TAB 4: WHATSAPP BUSINESS ═══ */
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
                  <h3 className="font-black text-sm text-slate-900 dark:text-white">
                    Vincular WhatsApp Oficial
                  </h3>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Válido para Canva del Bot y CRM Omnicanal
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

            {/* Step-by-step instructions */}
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
