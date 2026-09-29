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
  Calendar,
  MapPin,
  BadgeCheck,
  Wifi,
  ChevronLeft,
  Video,
  Play,
  Mic,
  Share2,
  ChevronDown,
  HelpCircle,
  AlertCircle,
  PhoneCall,
} from "lucide-react";
import { useDashboardStore } from "@/store/useDashboardStore";
import type { BotMainMenuOption, BotKeywordRule } from "@/lib/dashboard-types";

// Helper to determine next available unique key for action nodes
function getNextAvailableKey(currentNodes: CanvasNode[]): string {
  const usedKeys = new Set(
    currentNodes
      .map((n) => n.config?.key?.trim())
      .filter((k): k is string => Boolean(k && !isNaN(Number(k))))
      .map((k) => Number(k))
  );
  for (let i = 1; i <= 20; i++) {
    if (!usedKeys.has(i)) return String(i);
  }
  return String(currentNodes.length + 1);
}

// Helper to migrate and sanitize nodes loaded from database / local storage
function sanitizeNodes(loadedNodes: any[], initialDefaults: CanvasNode[]): CanvasNode[] {
  if (!Array.isArray(loadedNodes) || loadedNodes.length === 0) {
    return initialDefaults;
  }

  return loadedNodes.map((node) => {
    let type = node.type as NodeType;
    const title = (node.title || "").toLowerCase();
    if (type === ("action" as any)) {
      if (title.includes("link") || title.includes("reserva")) type = "action_link";
      else if (title.includes("precio") || title.includes("servicio")) type = "action_prices";
      else if (title.includes("sipap") || title.includes("banco") || title.includes("pago")) type = "action_sipap";
      else if (title.includes("humano") || title.includes("asesor")) type = "action_human";
      else if (title.includes("ubicacion") || title.includes("horario")) type = "action_location";
      else type = "action_link";
    }

    return {
      id: node.id,
      type,
      title: node.title,
      x: typeof node.x === "number" ? node.x : 100,
      y: typeof node.y === "number" ? node.y : 100,
      enabled: node.enabled !== false,
      config: {
        ...node.config,
        key: node.config?.key || undefined,
        keywords: Array.isArray(node.config?.keywords) ? node.config.keywords : [],
        response: node.config?.response || "",
      },
    };
  });
}

// Dynamic message tags for templates (100% clean, zero emojis)
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
// SPECIALIZED NODE TYPES (Separated Actions, Zero Emojis)
// ═══════════════════════════════════════════════════════════════════

export type NodeType =
  | "trigger"
  | "welcome"
  | "menu"
  | "action_link"
  | "action_prices"
  | "action_sipap"
  | "action_human"
  | "action_location"
  | "keyword"
  | "booking_trigger"
  | "confirmation"
  | "reminder";

export interface CanvasNode {
  id: string;
  type: NodeType;
  title: string;
  x: number;
  y: number;
  enabled: boolean;
  config: {
    key?: string; // "1", "2", "3", etc.
    keywords?: string[];
    response?: string;
    welcomeText?: string;
    fallbackText?: string;
    templateTrigger?: "confirmacion" | "recordatorio_24h" | "recordatorio_2h" | "cancelacion";
  };
}

export interface CanvasConnection {
  id: string;
  fromNodeId: string;
  fromPort?: string;
  toNodeId: string;
}

// ═══════════════════════════════════════════════════════════════════
// WHATSAPP TEXT FORMATTER HELPER (Parses *bold*, _italic_, ~strike~)
// ═══════════════════════════════════════════════════════════════════

function renderWhatsAppFormatted(text: string) {
  if (!text) return null;
  const lines = text.split("\n");

  return lines.map((line, lineIdx) => {
    // Regex splits *bold*, _italic_, ~strike~, `code`
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

// ═══════════════════════════════════════════════════════════════════
// CUSTOM SWITCH COMPONENT
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

// ═══════════════════════════════════════════════════════════════════
// MAIN PAGE COMPONENT
// ═══════════════════════════════════════════════════════════════════

export default function BotWhatsAppPage() {
  const {
    business,
    services,
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

  // Tabs: "Canva de flujo", "SIMULADOR", "Plantillas"
  const [activeTab, setActiveTab] = useState<"canva" | "simulador" | "plantillas">("canva");

  const slug = business.slug || "barberia";
  const [origin, setOrigin] = useState("https://agendatepy.com");
  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
    }
  }, []);
  const bookingUrl = `${origin}/${slug}/reservar`;

  // Dynamic default texts based on real salon profile & services
  const defaultPricesText =
    services && services.length > 0
      ? `*Servicios y Precios en ${business.name}:*\n` +
        services
          .slice(0, 4)
          .map((s) => `• *${s.name}*: Gs. ${s.price.toLocaleString("es-PY")}`)
          .join("\n") +
        `\n\nPodés ver la carta completa y reservar tu turno aquí:\n${bookingUrl}`
      : `Podés consultar nuestra carta completa de servicios y reservar tu turno al instante aquí:\n${bookingUrl}`;

  const defaultLocationText = `*Ubicación & Horarios:*\nEstamos en ${business.address || "Avda. Santa Teresa 1420 c/ Denis Roa, Asunción"}.\nHorario de atención: Lunes a Sábados de 09:00 a 20:00 hs.`;

  const defaultSipapText = `*Datos para Transferencia SIPAP:*\nBanco: Banco Itaú Paraguay\nTitular: ${business.name}\nRUC: 80012345-6\nAlias SIPAP: pagos@agendate.py\n\nPor favor envianos tu comprobante para validarlo.`;

  const defaultWelcomeText = `¡Hola! Bienvenido/a a *${business.name}*. ¿En qué podemos ayudarte hoy?\n\n*1.* Agendar turno online\n*2.* Servicios y precios\n*3.* Datos de pago SIPAP\n*4.* Hablar con un asesor\n*5.* Ubicación y horarios\n\n_Escribí el número de la opción o tu consulta._`;

  // Default Canvas Graph with separated action nodes
  const buildInitialNodes = useCallback((): CanvasNode[] => {
    return [
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
        x: 270,
        y: 160,
        enabled: true,
        config: {
          welcomeText: defaultWelcomeText,
          fallbackText: "Disculpá, no entendí esa opción. Por favor elegí una opción escribiendo el número correspondiente (ej: 1 o 2) o escribí *humano* para contactar a nuestro equipo.",
        },
      },
      {
        id: "node-menu-router",
        type: "menu",
        title: "Enrutador de Opciones",
        x: 530,
        y: 130,
        enabled: true,
        config: {},
      },
      // 4 SEPARATED ACTION NODES + LOCATION
      {
        id: "node-act-link",
        type: "action_link",
        title: "Link de Reservas",
        x: 820,
        y: 20,
        enabled: true,
        config: {
          key: "1",
          keywords: ["1", "turno", "agendar", "cita", "reserva", "reservar", "hora"],
          response: `¡Excelente! Podés elegir tu servicio, ver los profesionales y reservar tu turno con confirmación inmediata acá:\n${bookingUrl}`,
        },
      },
      {
        id: "node-act-prices",
        type: "action_prices",
        title: "Servicios & Precios",
        x: 820,
        y: 130,
        enabled: true,
        config: {
          key: "2",
          keywords: ["2", "precio", "costo", "tarifa", "cuanto", "vale", "servicios"],
          response: defaultPricesText,
        },
      },
      {
        id: "node-act-sipap",
        type: "action_sipap",
        title: "Datos SIPAP",
        x: 820,
        y: 240,
        enabled: true,
        config: {
          key: "3",
          keywords: ["3", "sipap", "transferencia", "banco", "pagos", "cuenta"],
          response: defaultSipapText,
        },
      },
      {
        id: "node-act-human",
        type: "action_human",
        title: "Asesor Humano",
        x: 820,
        y: 350,
        enabled: true,
        config: {
          key: "4",
          keywords: ["4", "humano", "persona", "asesor", "hablar", "ayuda"],
          response: "¡Claro que sí! Un integrante de nuestro equipo tomará la conversación en breve. Por favor dejanos tu consulta detallada.",
        },
      },
      {
        id: "node-act-location",
        type: "action_location",
        title: "Ubicación & Horarios",
        x: 820,
        y: 460,
        enabled: true,
        config: {
          key: "5",
          keywords: ["5", "donde", "ubicacion", "direccion", "llegar", "horario"],
          response: defaultLocationText,
        },
      },
      {
        id: "node-keywords-trigger",
        type: "keyword",
        title: "Palabras Clave",
        x: 270,
        y: 400,
        enabled: true,
        config: {
          keywords: ["consulta", "info", "promo", "duda"],
          response: `Gracias por contactarnos. Podés ver nuestros horarios y reservar tu lugar en tiempo real aquí:\n${bookingUrl}`,
        },
      },
      // APPOINTMENT AUTOMATIONS BRANCH
      {
        id: "node-trigger-booking",
        type: "booking_trigger",
        title: "Turno Confirmado en Web",
        x: 40,
        y: 600,
        enabled: true,
        config: {},
      },
      {
        id: "node-confirm-card",
        type: "confirmation",
        title: "Confirmación Inmediata",
        x: 320,
        y: 580,
        enabled: true,
        config: {
          templateTrigger: "confirmacion",
          response: "¡Hola {cliente}! Tu turno para *{servicio}* con *{profesional}* quedó confirmado para el *{fecha} a las {hora} hs* en {negocio}.\n\nUbicación: {direccion}\nVer o gestionar tu turno: {link_autogestion}\n\n¡Te esperamos!",
        },
      },
      {
        id: "node-remind-24h",
        type: "reminder",
        title: "Recordatorio 24h Antes",
        x: 620,
        y: 580,
        enabled: true,
        config: {
          templateTrigger: "recordatorio_24h",
          response: "¡Hola {cliente}! Te recordamos tu turno de mañana *{fecha} a las {hora} hs* para *{servicio}* en *{negocio}*.\n\n¿Nos confirmás tu asistencia? Podés autogestionar aquí:\n{link_autogestion}",
        },
      },
      {
        id: "node-remind-2h",
        type: "reminder",
        title: "Recordatorio 2h Antes",
        x: 900,
        y: 580,
        enabled: true,
        config: {
          templateTrigger: "recordatorio_2h",
          response: "¡Hola {cliente}! Te recordamos que tu turno es en 2 horas ({hora} hs). Te estamos esperando en {negocio} ({direccion}). ¡Nos vemos pronto!",
        },
      },
    ];
  }, [bookingUrl, business.address, business.name, defaultLocationText, defaultPricesText, defaultSipapText, defaultWelcomeText]);

  const defaultConnections: CanvasConnection[] = [
    { id: "conn-1", fromNodeId: "node-trigger-entry", toNodeId: "node-welcome-hub" },
    { id: "conn-2", fromNodeId: "node-welcome-hub", toNodeId: "node-menu-router" },
    { id: "conn-3", fromNodeId: "node-menu-router", toNodeId: "node-act-link" },
    { id: "conn-4", fromNodeId: "node-menu-router", toNodeId: "node-act-prices" },
    { id: "conn-5", fromNodeId: "node-menu-router", toNodeId: "node-act-sipap" },
    { id: "conn-6", fromNodeId: "node-menu-router", toNodeId: "node-act-human" },
    { id: "conn-7", fromNodeId: "node-menu-router", toNodeId: "node-act-location" },
    { id: "conn-8", fromNodeId: "node-trigger-entry", toNodeId: "node-keywords-trigger" },
    { id: "conn-9", fromNodeId: "node-keywords-trigger", toNodeId: "node-act-link" },
    { id: "conn-10", fromNodeId: "node-trigger-booking", toNodeId: "node-confirm-card" },
    { id: "conn-11", fromNodeId: "node-confirm-card", toNodeId: "node-remind-24h" },
    { id: "conn-12", fromNodeId: "node-remind-24h", toNodeId: "node-remind-2h" },
  ];

  // Canvas State: Loaded from DB/Local if present, otherwise initial nodes
  const [nodes, setNodes] = useState<CanvasNode[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const savedLocal = localStorage.getItem("agendate_canvas_nodes");
        if (savedLocal) {
          const parsed = JSON.parse(savedLocal);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return sanitizeNodes(parsed, buildInitialNodes());
          }
        }
      } catch (e) {}
    }
    if (
      evolutionConfig.canvasNodes &&
      Array.isArray(evolutionConfig.canvasNodes) &&
      evolutionConfig.canvasNodes.length > 0
    ) {
      return sanitizeNodes(evolutionConfig.canvasNodes, buildInitialNodes());
    }
    return buildInitialNodes();
  });

  const [connections, setConnections] = useState<CanvasConnection[]>(() => {
    if (
      evolutionConfig.canvasConnections &&
      Array.isArray(evolutionConfig.canvasConnections) &&
      evolutionConfig.canvasConnections.length > 0
    ) {
      return evolutionConfig.canvasConnections;
    }
    return defaultConnections;
  });

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>("node-act-link");
  const [zoom, setZoom] = useState(1);
  const [isInspectorOpen, setIsInspectorOpen] = useState(true);
  const [addMenuOpen, setAddMenuOpen] = useState(false);

  // Canvas Pan & Dragging state (fluid position persistence)
  const [pan, setPan] = useState<{ x: number; y: number }>(() => {
    if (typeof window !== "undefined") {
      try {
        const savedPan = localStorage.getItem("agendate_canvas_pan");
        if (savedPan) return JSON.parse(savedPan);
      } catch (e) {}
    }
    return { x: 0, y: 0 };
  });
  const isPanningRef = useRef(false);
  const panStartRef = useRef<{ startX: number; startY: number; initialPanX: number; initialPanY: number } | null>(null);

  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const dragStartRef = useRef<{ startX: number; startY: number; nodeStartX: number; nodeStartY: number } | null>(null);
  const canvasRef = useRef<HTMLDivElement | null>(null);

  // Modal State: Support & Assistance
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);

  // Templates tab state
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(
    whatsappTemplates[0]?.id || "wt-confirmacion"
  );
  const [testPhone, setTestPhone] = useState(
    business.whatsappNumber || business.phone || "+595 981 700 800"
  );
  const [sendingTest, setSendingTest] = useState(false);

  // Modal QR
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");
  const [qrCounter, setQrCounter] = useState(45);
  const [modalPhoneNumber, setModalPhoneNumber] = useState(
    evolutionConfig.phoneNumber || business.whatsappNumber || business.phone || "+595 981 700 800"
  );

  // Simulator State: STARTS COMPLETELY EMPTY (Zero dummy messages)
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
  >([]);
  const [simInput, setSimInput] = useState("");
  const [isBotTypingSim, setIsBotTypingSim] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement | null>(null);

  const currentTemplate =
    whatsappTemplates.find((t) => t.id === selectedTemplateId) ||
    whatsappTemplates[0];

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [simChatMessages, isBotTypingSim]);

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

  // ═══════════════════════════════════════════════════════════════════
  // TWO-WAY SYNCHRONIZATION: CANVAS NODES <-> WHATSAPP TEMPLATES
  // ═══════════════════════════════════════════════════════════════════

  function updateNode(nodeId: string, patch: Partial<CanvasNode>) {
    setNodes((prev) =>
      prev.map((node) => (node.id === nodeId ? { ...node, ...patch } : node))
    );

    // Two-way synchronization: If a reminder/confirmation node is toggled, update templates store!
    if (patch.enabled !== undefined) {
      if (nodeId === "node-remind-24h") {
        const tmpl = whatsappTemplates.find((t) => t.id === "wt-recordatorio-24h");
        if (tmpl && tmpl.enabled !== patch.enabled) {
          toggleWhatsAppTemplate("wt-recordatorio-24h");
        }
      } else if (nodeId === "node-remind-2h") {
        const tmpl = whatsappTemplates.find((t) => t.id === "wt-recordatorio-2h");
        if (tmpl && tmpl.enabled !== patch.enabled) {
          toggleWhatsAppTemplate("wt-recordatorio-2h");
        }
      } else if (nodeId === "node-confirm-card") {
        const tmpl = whatsappTemplates.find((t) => t.id === "wt-confirmacion");
        if (tmpl && tmpl.enabled !== patch.enabled) {
          toggleWhatsAppTemplate("wt-confirmacion");
        }
      }
    }
  }

  function handleToggleTemplate(templateId: string) {
    toggleWhatsAppTemplate(templateId);

    // Reflected in canvas nodes immediately
    const targetNodeId =
      templateId === "wt-confirmacion"
        ? "node-confirm-card"
        : templateId === "wt-recordatorio-24h"
        ? "node-remind-24h"
        : templateId === "wt-recordatorio-2h"
        ? "node-remind-2h"
        : null;

    if (targetNodeId) {
      setNodes((prev) =>
        prev.map((n) => (n.id === targetNodeId ? { ...n, enabled: !n.enabled } : n))
      );
    }
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

  // Create specialized action nodes directly with auto-incremented non-duplicate key
  function createSpecializedNode(type: NodeType, title: string, defaultText: string, suggestedKey?: string) {
    const nextKey = suggestedKey || getNextAvailableKey(nodes);
    const newNodeId = `node-${type}-${Date.now()}`;
    const newNode: CanvasNode = {
      id: newNodeId,
      type: type,
      title: title,
      x: 820,
      y: 100 + nodes.length * 35,
      enabled: true,
      config: {
        key: nextKey,
        response: defaultText,
        keywords: [nextKey],
      },
    };

    setNodes((prev) => {
      const next = [...prev, newNode];
      try {
        if (typeof window !== "undefined") {
          localStorage.setItem("agendate_canvas_nodes", JSON.stringify(next));
        }
      } catch (e) {}
      return next;
    });
    setConnections((prev) => [
      ...prev,
      { id: `conn-${Date.now()}`, fromNodeId: "node-menu-router", toNodeId: newNodeId },
    ]);
    setSelectedNodeId(newNodeId);
    setIsInspectorOpen(true);
    setAddMenuOpen(false);
    pushToast("success", `Nodo '${title}' creado con opción ${nextKey}.`);
  }

  // Save flow, validate duplicate keys, and sync to DB
  function handleSaveCanvasFlow() {
    // Validate uniqueness of option keys among enabled action nodes
    const keyMap = new Map<string, string[]>();
    for (const n of nodes) {
      if (n.enabled && n.config?.key) {
        const k = n.config.key.trim().toLowerCase();
        if (!keyMap.has(k)) keyMap.set(k, []);
        keyMap.get(k)!.push(n.title);
      }
    }
    const duplicateEntries = Array.from(keyMap.entries()).filter(([_, titles]) => titles.length > 1);
    if (duplicateEntries.length > 0) {
      const [dupKey, dupTitles] = duplicateEntries[0];
      pushToast(
        "error",
        `Conflicto de opciones: La opción '${dupKey}' está repetida en "${dupTitles.join('" y "')}". Cada opción del menú debe tener un número único.`
      );
      return;
    }

    const actionNodes = nodes.filter((n) =>
      [
        "action_link",
        "action_prices",
        "action_sipap",
        "action_human",
        "action_location",
      ].includes(n.type)
    );
    const keywordNodes = nodes.filter((n) => n.type === "keyword");
    const welcomeNode = nodes.find((n) => n.type === "welcome");
    const confirmNode = nodes.find((n) => n.type === "confirmation");
    const remind24hNode = nodes.find((n) => n.id === "node-remind-24h");
    const remind2hNode = nodes.find((n) => n.id === "node-remind-2h");

    const mappedMenuOptions: BotMainMenuOption[] = actionNodes.map((n, i) => {
      let actType: "none" | "send_link" | "send_sipap" | "human_handoff" = "none";
      if (n.type === "action_link") actType = "send_link";
      else if (n.type === "action_sipap") actType = "send_sipap";
      else if (n.type === "action_human") actType = "human_handoff";

      return {
        id: n.id,
        key: n.config.key || String(i + 1),
        title: n.title,
        response: n.config.response || "Información solicitada.",
        action: actType,
        enabled: n.enabled,
      };
    });

    const mappedKeywordRules: BotKeywordRule[] = keywordNodes.map((n) => ({
      id: n.id,
      keywords: n.config.keywords || ["consulta"],
      response: n.config.response || "Gracias por comunicarte.",
      action: "none",
      enabled: n.enabled,
    }));

    if (confirmNode?.config.response) {
      updateWhatsAppTemplate("wt-confirmacion", confirmNode.config.response);
    }
    if (remind24hNode?.config.response) {
      updateWhatsAppTemplate("wt-recordatorio-24h", remind24hNode.config.response);
    }
    if (remind2hNode?.config.response) {
      updateWhatsAppTemplate("wt-recordatorio-2h", remind2hNode.config.response);
    }

    updateEvolutionConfig({
      canvasNodes: nodes,
      canvasConnections: connections,
      mainMenuOptions: mappedMenuOptions,
      keywordRules: mappedKeywordRules,
      welcomeMessage: welcomeNode?.config.welcomeText || evolutionConfig.welcomeMessage,
      fallbackMessage: welcomeNode?.config.fallbackText || evolutionConfig.fallbackMessage,
    });

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("agendate_canvas_nodes", JSON.stringify(nodes));
        localStorage.setItem("agendate_canvas_connections", JSON.stringify(connections));
        localStorage.setItem("agendate_canvas_pan", JSON.stringify(pan));
      } catch (e) {}
    }

    pushToast("success", "Flujo y posiciones guardadas con éxito en la base de datos.");
  }

  // Node Drag & Canvas Pan Handlers
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

  function handleCanvasPointerDown(e: React.PointerEvent) {
    // Only pan if clicking canvas background (not a node or interactive button)
    if ((e.target as HTMLElement).closest("[data-canvas-node]")) return;
    isPanningRef.current = true;
    panStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialPanX: pan.x,
      initialPanY: pan.y,
    };
  }

  const handleCanvasPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (draggingNodeId && dragStartRef.current) {
        const dx = (e.clientX - dragStartRef.current.startX) / zoom;
        const dy = (e.clientY - dragStartRef.current.startY) / zoom;

        const newX = Math.max(10, Math.round((dragStartRef.current.nodeStartX + dx) / 10) * 10);
        const newY = Math.max(10, Math.round((dragStartRef.current.nodeStartY + dy) / 10) * 10);

        setNodes((prev) =>
          prev.map((node) =>
            node.id === draggingNodeId ? { ...node, x: newX, y: newY } : node
          )
        );
      } else if (isPanningRef.current && panStartRef.current) {
        const dx = e.clientX - panStartRef.current.startX;
        const dy = e.clientY - panStartRef.current.startY;
        setPan({
          x: Math.round(panStartRef.current.initialPanX + dx),
          y: Math.round(panStartRef.current.initialPanY + dy),
        });
      }
    },
    [draggingNodeId, zoom]
  );

  const handleCanvasPointerUp = useCallback(() => {
    if (draggingNodeId) {
      setNodes((currentNodes) => {
        try {
          if (typeof window !== "undefined") {
            localStorage.setItem("agendate_canvas_nodes", JSON.stringify(currentNodes));
          }
        } catch (e) {}
        return currentNodes;
      });
    }
    if (isPanningRef.current) {
      try {
        if (typeof window !== "undefined") {
          localStorage.setItem("agendate_canvas_pan", JSON.stringify(pan));
        }
      } catch (e) {}
    }
    setDraggingNodeId(null);
    dragStartRef.current = null;
    isPanningRef.current = false;
    panStartRef.current = null;
  }, [draggingNodeId, pan]);

  // ═══════════════════════════════════════════════════════════════════
  // SIMULATOR ENGINE (Zero API Buttons, 100% Pure WhatsApp Text)
  // ═══════════════════════════════════════════════════════════════════

  function triggerSimMessage(text: string) {
    setSimInput(text);
    setTimeout(() => {
      handleSimSendMessage(undefined, text);
    }, 50);
  }

  function handleSimSendMessage(e?: React.FormEvent, directText?: string) {
    if (e) e.preventDefault();
    const userMsg = (directText || simInput).trim();
    if (!userMsg || isBotTypingSim) return;

    const timeNow = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    // Client bubble
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

    setTimeout(() => {
      const lower = userMsg.toLowerCase().trim();
      const botTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

      // Special case: Simulation of interactive appointment confirmation card
      if (
        lower === "confirmar" ||
        lower === "confirmar turno" ||
        lower === "mi turno" ||
        lower.includes("confirmar")
      ) {
        setSimChatMessages((prev) => [
          ...prev,
          {
            id: `msg-${Date.now()}`,
            sender: "bot",
            type: "card",
            time: botTime,
            cardData: {
              service: services[0]?.name || "Corte Fade Clásico + Perfilado",
              staff: "Diego Franco",
              datetime: "Jueves 24 de Octubre · 15:30 hs",
              price: services[0]?.price ? `Gs. ${services[0].price.toLocaleString("es-PY")}` : "Gs. 75.000",
              location: business.address || "Avda. Santa Teresa 1420",
            },
          },
        ]);
        setIsBotTypingSim(false);
        return;
      }

      // Check Canvas Nodes
      const welcomeNode = nodes.find((n) => n.type === "welcome");
      const welcomeText = welcomeNode?.config.welcomeText || defaultWelcomeText;
      const fallbackText =
        welcomeNode?.config.fallbackText ||
        "Disculpá, no entendí esa opción. Por favor elegí una opción escribiendo el número correspondiente (ej: 1 o 2) o escribí *humano* para contactar a nuestro equipo.";

      const activeNodes = nodes.filter(
        (n) =>
          n.enabled !== false &&
          (
            n.type.startsWith("action") ||
            (n.type as string) === "action" ||
            n.type === "keyword" ||
            Boolean(n.config.response)
          )
      );

      const isGreeting =
        lower === "hola" ||
        lower === "buenas" ||
        lower === "buen dia" ||
        lower === "buen día" ||
        lower === "buenas tardes" ||
        lower === "buenas noches" ||
        lower === "menu" ||
        lower === "menú" ||
        lower === "inicio" ||
        lower === "empezar" ||
        lower === "hola buenas";

      let replyText = "";

      if (isGreeting) {
        replyText = welcomeText;
      } else {
        const cleanMsg = lower.replace(/[^a-z0-9áéíóúüñ\s]/gi, "").trim();

        // 1. Direct option number match ("1", "2", "3"...)
        let matchedNode = activeNodes.find((n) => {
          const nodeKey = (n.config.key || "").toLowerCase().trim();
          if (!nodeKey) return false;
          if (cleanMsg === nodeKey || lower === nodeKey) return true;
          if (
            cleanMsg.startsWith(`${nodeKey} `) ||
            cleanMsg.endsWith(` ${nodeKey}`) ||
            cleanMsg === `opcion ${nodeKey}` ||
            cleanMsg === `opción ${nodeKey}` ||
            cleanMsg === `la ${nodeKey}`
          ) {
            return true;
          }
          return false;
        });

        // 2. Keyword match
        if (!matchedNode) {
          matchedNode = activeNodes.find((n) => {
            const keywords = (n.config.keywords || []).map((k) => k.toLowerCase().trim()).filter(Boolean);
            return keywords.some((kw) => cleanMsg === kw || cleanMsg.includes(kw) || kw.includes(cleanMsg));
          });
        }

        // 3. Node title match
        if (!matchedNode) {
          matchedNode = activeNodes.find((n) => {
            const title = (n.title || "").toLowerCase().trim();
            return title.length > 3 && (cleanMsg.includes(title) || title.includes(cleanMsg));
          });
        }

        // 4. Semantic fallback matches for common inquiries
        if (!matchedNode) {
          if (
            cleanMsg.includes("precio") ||
            cleanMsg.includes("costo") ||
            cleanMsg.includes("tarifa") ||
            cleanMsg.includes("cuanto") ||
            cleanMsg.includes("servicio") ||
            cleanMsg.includes("corte")
          ) {
            matchedNode = activeNodes.find(
              (n) =>
                n.type === "action_prices" ||
                n.config.key === "2" ||
                n.title.toLowerCase().includes("precio")
            );
          } else if (
            cleanMsg.includes("persona") ||
            cleanMsg.includes("humano") ||
            cleanMsg.includes("asesor") ||
            cleanMsg.includes("hablar") ||
            cleanMsg.includes("alguien") ||
            cleanMsg.includes("atencion")
          ) {
            matchedNode = activeNodes.find(
              (n) =>
                n.type === "action_human" ||
                n.config.key === "4" ||
                n.title.toLowerCase().includes("humano") ||
                n.title.toLowerCase().includes("asesor")
            );
          } else if (
            cleanMsg.includes("donde") ||
            cleanMsg.includes("ubicacion") ||
            cleanMsg.includes("ubicación") ||
            cleanMsg.includes("direccion") ||
            cleanMsg.includes("dirección") ||
            cleanMsg.includes("horario") ||
            cleanMsg.includes("llegar")
          ) {
            matchedNode = activeNodes.find(
              (n) =>
                n.type === "action_location" ||
                n.config.key === "5" ||
                n.title.toLowerCase().includes("ubicacion") ||
                n.title.toLowerCase().includes("horario")
            );
          } else if (
            cleanMsg.includes("reserva") ||
            cleanMsg.includes("turno") ||
            cleanMsg.includes("agendar") ||
            cleanMsg.includes("cita") ||
            cleanMsg.includes("link")
          ) {
            matchedNode = activeNodes.find(
              (n) =>
                n.type === "action_link" ||
                n.config.key === "1" ||
                n.title.toLowerCase().includes("reserva")
            );
          } else if (
            cleanMsg.includes("sipap") ||
            cleanMsg.includes("transfer") ||
            cleanMsg.includes("banco") ||
            cleanMsg.includes("pago") ||
            cleanMsg.includes("cuenta")
          ) {
            matchedNode = activeNodes.find(
              (n) =>
                n.type === "action_sipap" ||
                n.config.key === "3" ||
                n.title.toLowerCase().includes("sipap")
            );
          }
        }

        if (matchedNode && matchedNode.config.response) {
          replyText = matchedNode.config.response;
        } else {
          replyText = fallbackText;
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
      setIsBotTypingSim(false);
    }, 800);
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
      .replace(/{servicio}/g, services[0]?.name || "Corte Fade + Perfilado")
      .replace(/{profesional}/g, "Diego Franco")
      .replace(/{fecha}/g, "Jueves 24 de Octubre")
      .replace(/{hora}/g, "15:30")
      .replace(/{negocio}/g, business.name)
      .replace(/{direccion}/g, business.address || "Avda. Santa Teresa 1420")
      .replace(/{link_autogestion}/g, `${bookingUrl}?token=demo123`)
      .replace(/{link_negocio}/g, bookingUrl);
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
      {/* ═══ 1. TOP HEADER (Without Guided Tour Button) ═══ */}
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
                  Canva 100% Configurable
                </span>
              </div>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Diseñá el flujo visual de atención para tu local: menú interactivo, confirmaciones de turno y recordatorios automáticos.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Help & Support Button */}
          <button
            type="button"
            data-tour="bot-support-action"
            onClick={() => setIsHelpModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-emerald-300 dark:border-emerald-800/50 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-bold hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition active:scale-98 cursor-pointer shadow-2xs"
          >
            <PhoneCall className="h-3.5 w-3.5" />
            <span>¿Necesitás ayuda? Contactanos</span>
          </button>

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
        </div>
      </div>

      {/* ═══ 2. MANDATORY CONNECTION GATE / STATUS BANNER ═══ */}
      <div data-tour="bot-status-card">
        {isConnected ? (
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

      {/* ═══ 3. MAIN TABS (TITLES: Canva de flujo, SIMULADOR, Plantillas) ═══ */}
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
          <span>Canva de flujo</span>
          {!isConnected && <Lock className="h-3 w-3 ml-0.5 text-slate-400" />}
        </button>

        <button
          type="button"
          onClick={() => isConnected && setActiveTab("simulador")}
          disabled={!isConnected}
          className={`flex-1 min-w-[150px] flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer ${
            !isConnected
              ? "opacity-40 cursor-not-allowed text-slate-400"
              : activeTab === "simulador"
              ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs border border-slate-200/60 dark:border-white/10"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Smartphone className="h-3.5 w-3.5 text-sky-600" />
          <span>SIMULADOR</span>
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
          <Layers className="h-3.5 w-3.5 text-indigo-600" />
          <span>Plantillas</span>
          {!isConnected && <Lock className="h-3 w-3 ml-0.5 text-slate-400" />}
        </button>
      </div>

      {/* ═══ 4. TAB CONTENTS ═══ */}
      {!isConnected ? (
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
        /* ═══ TAB 1: CANVA DE FLUJO CON NODOS DE ACCIÓN SEPARADOS ═══ */
        <div className="space-y-4" data-tour="bot-rules-card">
          {/* Canvas Top Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/10 shadow-2xs">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
                <Share2 className="h-4 w-4" />
              </span>
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white leading-tight">
                  Canva de flujo
                </h3>
                <span className="text-[11px] text-slate-400">
                  Arrastrá nodos individuales para cada acción y hacé clic para editar
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
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
                  onClick={() => {
                    setZoom(1);
                    setPan({ x: 0, y: 0 });
                    try {
                      if (typeof window !== "undefined") {
                        localStorage.setItem("agendate_canvas_pan", JSON.stringify({ x: 0, y: 0 }));
                      }
                    } catch (e) {}
                  }}
                  className="p-1 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition cursor-pointer"
                  title="Restablecer Vista y Centrar"
                >
                  <Maximize2 className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Add Node Dropdown (Separated specialized actions) */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setAddMenuOpen(!addMenuOpen)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-dashed border-emerald-600 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 text-xs font-bold transition active:scale-98 cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Agregar Nodo</span>
                  <ChevronDown className="h-3 w-3 ml-0.5" />
                </button>

                {addMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-52 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-xl p-1.5 z-40 space-y-1">
                    <button
                      type="button"
                      onClick={() =>
                        createSpecializedNode(
                          "action_link",
                          "Link de Reservas",
                          `¡Excelente! Podés reservar tu turno acá:\n${bookingUrl}`
                        )
                      }
                      className="w-full flex items-center gap-2 p-2 rounded-xl text-left text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-600 transition cursor-pointer"
                    >
                      <ExternalLink className="h-3.5 w-3.5 text-emerald-600" />
                      <span>+ Link de Reservas</span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        createSpecializedNode(
                          "action_prices",
                          "Servicios y Precios",
                          defaultPricesText
                        )
                      }
                      className="w-full flex items-center gap-2 p-2 rounded-xl text-left text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-sky-50 dark:hover:bg-sky-950/40 hover:text-sky-600 transition cursor-pointer"
                    >
                      <ListOrdered className="h-3.5 w-3.5 text-sky-600" />
                      <span>+ Servicios y Precios</span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        createSpecializedNode(
                          "action_sipap",
                          "Datos SIPAP",
                          defaultSipapText
                        )
                      }
                      className="w-full flex items-center gap-2 p-2 rounded-xl text-left text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-purple-50 dark:hover:bg-purple-950/40 hover:text-purple-600 transition cursor-pointer"
                    >
                      <CreditCard className="h-3.5 w-3.5 text-purple-600" />
                      <span>+ Datos SIPAP</span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        createSpecializedNode(
                          "action_human",
                          "Asesor Humano",
                          "Un asesor humano te responderá a la brevedad."
                        )
                      }
                      className="w-full flex items-center gap-2 p-2 rounded-xl text-left text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-amber-50 dark:hover:bg-amber-950/40 hover:text-amber-600 transition cursor-pointer"
                    >
                      <UserCheck className="h-3.5 w-3.5 text-amber-600" />
                      <span>+ Asesor Humano</span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        createSpecializedNode(
                          "action_location",
                          "Ubicación & Horarios",
                          defaultLocationText
                        )
                      }
                      className="w-full flex items-center gap-2 p-2 rounded-xl text-left text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600 transition cursor-pointer"
                    >
                      <MapPin className="h-3.5 w-3.5 text-rose-600" />
                      <span>+ Ubicación & Horarios</span>
                    </button>
                  </div>
                )}
              </div>

              {/* "Probar Flujo" Button NEXT TO "Guardar Flujo" */}
              <button
                type="button"
                onClick={() => setActiveTab("simulador")}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold transition active:scale-98 cursor-pointer shadow-2xs"
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
          <div className="relative rounded-3xl border border-slate-200/90 dark:border-white/10 bg-slate-50/70 dark:bg-slate-950 overflow-hidden flex min-h-[660px] shadow-sm">
            {/* Viewport with Pan and Zoom */}
            <div
              ref={canvasRef}
              onPointerDown={handleCanvasPointerDown}
              onPointerMove={handleCanvasPointerMove}
              onPointerUp={handleCanvasPointerUp}
              className={`flex-1 relative overflow-auto select-none [background-image:radial-gradient(#cbd5e1_1.2px,transparent_1.2px)] dark:[background-image:radial-gradient(#334155_1.2px,transparent_1.2px)] [background-size:20px_20px] ${
                isPanningRef.current ? "cursor-grabbing" : "cursor-grab"
              }`}
              style={{ minHeight: "660px" }}
            >
              <div
                className="relative"
                style={{
                  width: "2200px",
                  height: "1400px",
                  transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                  transformOrigin: "top left",
                  transition: draggingNodeId || isPanningRef.current ? "none" : "transform 0.15s ease",
                }}
              >
                {/* SVG Connections Layer (Bezier Curves) */}
                <svg
                  className="absolute inset-0 pointer-events-none w-full h-full"
                  style={{ zIndex: 1 }}
                >
                  {connections.map((conn) => {
                    const fromNode = nodes.find((n) => n.id === conn.fromNodeId);
                    const toNode = nodes.find((n) => n.id === conn.toNodeId);
                    if (!fromNode || !toNode) return null;

                    const nodeWidth = 210;
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

                    const typeStyles: Record<
                      NodeType,
                      { badge: string; color: string; icon: typeof Bot }
                    > = {
                      trigger: { badge: "Disparador", color: "border-amber-400 bg-amber-500/10 text-amber-700 dark:text-amber-400", icon: MessageCircle },
                      welcome: { badge: "Bienvenida", color: "border-sky-400 bg-sky-500/10 text-sky-700 dark:text-sky-400", icon: Bot },
                      menu: { badge: "Enrutador Menú", color: "border-indigo-400 bg-indigo-500/10 text-indigo-700 dark:text-indigo-400", icon: ListOrdered },
                      action_link: { badge: "Link Reservas", color: "border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400", icon: ExternalLink },
                      action_prices: { badge: "Servicios & Precios", color: "border-sky-500 bg-sky-500/10 text-sky-700 dark:text-sky-400", icon: ListOrdered },
                      action_sipap: { badge: "Datos SIPAP", color: "border-purple-500 bg-purple-500/10 text-purple-700 dark:text-purple-400", icon: CreditCard },
                      action_human: { badge: "Asesor Humano", color: "border-amber-500 bg-amber-500/10 text-amber-700 dark:text-amber-400", icon: UserCheck },
                      action_location: { badge: "Ubicación", color: "border-rose-500 bg-rose-500/10 text-rose-700 dark:text-rose-400", icon: MapPin },
                      keyword: { badge: "Palabra Clave", color: "border-purple-400 bg-purple-500/10 text-purple-700 dark:text-purple-400", icon: Tag },
                      booking_trigger: { badge: "Evento Turno", color: "border-teal-400 bg-teal-500/10 text-teal-700 dark:text-teal-400", icon: Calendar },
                      confirmation: { badge: "Confirmación", color: "border-emerald-600 bg-emerald-600/15 text-emerald-800 dark:text-emerald-300 font-bold", icon: CheckCircle2 },
                      reminder: { badge: "Recordatorio", color: "border-blue-400 bg-blue-500/10 text-blue-700 dark:text-blue-400", icon: Clock },
                    };

                    const style = typeStyles[node.type] || typeStyles.action_link;
                    const Icon = style.icon;

                    return (
                      <div
                        key={node.id}
                        data-canvas-node="true"
                        onPointerDown={(e) => handleNodePointerDown(e, node.id)}
                        className={`absolute w-[210px] rounded-2xl p-3.5 transition-shadow cursor-grab active:cursor-grabbing border ${
                          isSelected
                            ? "border-emerald-500 bg-white dark:bg-slate-900 shadow-lg shadow-emerald-500/15 ring-2 ring-emerald-500/40 z-20"
                            : "border-slate-200/90 dark:border-white/10 bg-white/95 dark:bg-slate-900/95 shadow-sm hover:border-slate-300 dark:hover:border-white/20 z-10"
                        } ${!node.enabled ? "opacity-50" : ""}`}
                        style={{
                          left: `${node.x}px`,
                          top: `${node.y}px`,
                          transform: isDragging ? "scale(1.02)" : "scale(1)",
                        }}
                      >
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

                        <div className="pt-2">
                          <p className="text-xs font-black text-slate-900 dark:text-white truncate">
                            {node.title}
                          </p>
                          {node.config.key && (
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                              Opción: *{node.config.key}*
                            </p>
                          )}
                        </div>

                        <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 h-3 w-3 rounded-full bg-slate-300 dark:bg-slate-700 border-2 border-white dark:border-slate-900" />
                        <div className="absolute -right-1.5 top-1/2 -translate-y-1/2 h-3 w-3 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900" />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Inspector Drawer (Node Settings Panel) */}
            {isInspectorOpen && selectedNode && (
              <div className="w-[320px] sm:w-[370px] shrink-0 border-l border-slate-200/90 dark:border-white/10 bg-white dark:bg-slate-900 p-5 flex flex-col justify-between overflow-y-auto z-30 shadow-md">
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/5">
                    <div>
                      <span className="text-[10px] font-mono font-bold uppercase text-emerald-600 dark:text-emerald-400 block">
                        Configuración del Nodo
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

                  {/* Title Input */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Título en el Canva:
                    </label>
                    <input
                      type="text"
                      value={selectedNode.title}
                      onChange={(e) => updateNode(selectedNode.id, { title: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 font-sans"
                    />
                  </div>

                  {/* Option Key Number with Duplicate Detection & Quick Selector */}
                  {selectedNode.config.key !== undefined && (() => {
                    const currentKey = selectedNode.config.key?.trim() || "";
                    const duplicateNode = currentKey
                      ? nodes.find(
                          (n) =>
                            n.id !== selectedNode.id &&
                            n.enabled &&
                            n.config.key &&
                            n.config.key.trim().toLowerCase() === currentKey.toLowerCase()
                        )
                      : null;

                    const otherUsedKeys = new Set(
                      nodes
                        .filter((n) => n.id !== selectedNode.id && n.enabled && n.config.key)
                        .map((n) => n.config.key!.trim())
                    );

                    return (
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">
                            Número de Opción en el Menú:
                          </label>
                          {duplicateNode && (
                            <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded-full border border-rose-200 dark:border-rose-900/50">
                              Duplicado con &ldquo;{duplicateNode.title}&rdquo;
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={selectedNode.config.key}
                            onChange={(e) => updateNodeConfig(selectedNode.id, { key: e.target.value })}
                            className={`w-16 rounded-xl border p-2 text-xs font-mono font-bold text-slate-900 dark:text-white focus:outline-none text-center ${
                              duplicateNode
                                ? "border-rose-500 bg-rose-50/50 dark:bg-rose-950/20 focus:border-rose-600 ring-2 ring-rose-500/20"
                                : "border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800 focus:border-emerald-500"
                            }`}
                          />

                          {/* Quick unique numbers picker */}
                          <div className="flex-1 flex flex-wrap gap-1">
                            {["1", "2", "3", "4", "5", "6", "7", "8"].map((num) => {
                              const isTaken = otherUsedKeys.has(num);
                              const isSelected = selectedNode.config.key === num;
                              return (
                                <button
                                  key={num}
                                  type="button"
                                  disabled={isTaken}
                                  onClick={() => updateNodeConfig(selectedNode.id, { key: num })}
                                  className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold transition cursor-pointer ${
                                    isSelected
                                      ? "bg-emerald-600 text-white shadow-xs"
                                      : isTaken
                                      ? "bg-slate-100 dark:bg-slate-800/40 text-slate-300 dark:text-slate-600 cursor-not-allowed line-through"
                                      : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-emerald-500/10 hover:text-emerald-600 border border-slate-200/50 dark:border-white/5"
                                  }`}
                                  title={isTaken ? `Opción ${num} ya asignada a otro nodo` : `Asignar opción ${num}`}
                                >
                                  {num}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {duplicateNode ? (
                          <p className="text-[11px] text-rose-600 dark:text-rose-400 font-medium">
                            Atención: La opción &ldquo;{selectedNode.config.key}&rdquo; ya está configurada en &ldquo;{duplicateNode.title}&rdquo;. Cada opción debe tener un número único para que el bot responda correctamente.
                          </p>
                        ) : (
                          <p className="text-[10px] text-slate-400">
                            Número que el cliente escribe para seleccionar esta acción en el menú.
                          </p>
                        )}
                      </div>
                    );
                  })()}

                  {/* Keywords for automatic matching */}
                  {selectedNode.config.keywords !== undefined && (
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Palabras que activan esta opción (separadas por coma):
                      </label>
                      <input
                        type="text"
                        value={(selectedNode.config.keywords || []).join(", ")}
                        onChange={(e) =>
                          updateNodeConfig(selectedNode.id, {
                            keywords: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                          })
                        }
                        className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800 p-2 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                        placeholder="ej: 1, turno, agendar"
                      />
                      <p className="text-[10px] text-slate-400 mt-1">
                        Si el cliente escribe cualquiera de estas palabras, se dispara esta respuesta.
                      </p>
                    </div>
                  )}

                  {/* Response Textarea with WhatsApp formatting rules helper */}
                  {selectedNode.config.response !== undefined && (
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Respuesta de Texto enviada por WhatsApp:
                      </label>
                      <textarea
                        rows={6}
                        value={selectedNode.config.response || ""}
                        onChange={(e) =>
                          updateNodeConfig(selectedNode.id, { response: e.target.value })
                        }
                        className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 font-sans leading-relaxed"
                        placeholder="Texto de respuesta..."
                      />
                      {/* Gray helper text for WhatsApp formatting rules */}
                      <p className="text-[11px] text-slate-400 dark:text-slate-500 font-mono mt-1">
                        Formato WhatsApp: *negrita*, _cursiva_, ~tachado~, ```monospacio```
                      </p>
                    </div>
                  )}

                  {/* Welcome Node Textarea */}
                  {selectedNode.type === "welcome" && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Mensaje de Bienvenida:
                        </label>
                        <textarea
                          rows={6}
                          value={selectedNode.config.welcomeText || ""}
                          onChange={(e) =>
                            updateNodeConfig(selectedNode.id, { welcomeText: e.target.value })
                          }
                          className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 font-sans leading-relaxed"
                        />
                        <p className="text-[11px] text-slate-400 dark:text-slate-500 font-mono mt-1">
                          Formato WhatsApp: *negrita*, _cursiva_, ~tachado~, ```monospacio```
                        </p>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Mensaje de Fallback (No reconocido):
                        </label>
                        <textarea
                          rows={3}
                          value={selectedNode.config.fallbackText || ""}
                          onChange={(e) =>
                            updateNodeConfig(selectedNode.id, { fallbackText: e.target.value })
                          }
                          className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 font-sans leading-relaxed"
                        />
                        <p className="text-[11px] text-slate-400 dark:text-slate-500 font-mono mt-1">
                          Formato WhatsApp: *negrita*, _cursiva_, ~tachado~, ```monospacio```
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer Actions */}
                <div className="pt-4 border-t border-slate-100 dark:border-white/5 space-y-2">
                  {[
                    "action_link",
                    "action_prices",
                    "action_sipap",
                    "action_human",
                    "action_location",
                    "keyword",
                  ].includes(selectedNode.type) && (
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
        /* ═══ TAB 2: AUTHENTIC iPHONE 16 PRO SIMULATOR (EXACT LANDING UI) ═══ */
        <div className="space-y-6" data-tour="bot-simulator-card">
          <div className="grid gap-6 lg:grid-cols-12 items-start">
            {/* The iPhone 16 Pro Mockup */}
            <div className="lg:col-span-7 flex flex-col items-center">
              <div className="relative mx-auto flex w-full items-center justify-center p-2 sm:p-4">
                {/* 3D Titanium Bezel Container */}
                <div className="relative w-full max-w-[320px] sm:max-w-[350px] rounded-[44px] sm:rounded-[50px] p-[7px] sm:p-[9px] bg-gradient-to-b from-[#3a3b40] via-[#1e1f23] to-[#111215] shadow-[0_30px_70px_-15px_rgba(0,0,0,0.6),0_0_0_1px_rgba(255,255,255,0.18)]">
                  {/* Left Side Buttons */}
                  <div className="absolute -left-[3px] top-[100px] h-7 w-[3.5px] rounded-l-[2px] bg-gradient-to-r from-[#2a2b30] to-[#45474e]" />
                  <div className="absolute -left-[3px] top-[140px] h-12 w-[3.5px] rounded-l-[2px] bg-gradient-to-r from-[#2a2b30] to-[#45474e]" />
                  <div className="absolute -left-[3px] top-[204px] h-12 w-[3.5px] rounded-l-[2px] bg-gradient-to-r from-[#2a2b30] to-[#45474e]" />
                  {/* Right Side Buttons */}
                  <div className="absolute -right-[3px] top-[135px] h-16 w-[3.5px] rounded-r-[2px] bg-gradient-to-l from-[#2a2b30] to-[#45474e]" />
                  <div className="absolute -right-[2.5px] top-[280px] h-14 w-[3px] rounded-r-[2px] bg-gradient-to-l from-[#222327] to-[#3a3b40]" />

                  {/* Outer Glass Bezel */}
                  <div className="relative overflow-hidden rounded-[38px] sm:rounded-[42px] bg-black p-[2.5px] shadow-inner">
                    {/* Inner Display Canvas */}
                    <div className="relative flex h-[580px] sm:h-[620px] flex-col overflow-hidden rounded-[36px] sm:rounded-[40px] bg-[#efeae2]">
                      {/* WhatsApp Doodle Pattern Overlay */}
                      <div
                        className="pointer-events-none absolute inset-0 opacity-[0.06] mix-blend-multiply"
                        style={{
                          backgroundImage: `radial-gradient(#000 1px, transparent 1px), radial-gradient(#000 1px, #efeae2 1px)`,
                          backgroundSize: "20px 20px",
                          backgroundPosition: "0 0, 10px 10px",
                        }}
                      />

                      {/* 1. iOS STATUS BAR */}
                      <div className="relative z-30 flex h-11 items-center justify-between px-7 pt-2 text-[#000000] font-semibold text-[13px] tracking-tight select-none">
                        <span>9:41</span>

                        {/* Dynamic Island */}
                        <div className="absolute left-1/2 top-2.5 -translate-x-1/2 flex h-6 w-24 items-center justify-between rounded-full bg-black px-2 shadow-sm">
                          <div className="h-2.5 w-2.5 rounded-full bg-[#0a0d17] border border-blue-950/40 relative">
                            <div className="absolute inset-0.5 rounded-full bg-[#1b2342] opacity-80" />
                          </div>
                          <div className="h-2 w-2 rounded-full bg-[#050508]" />
                        </div>

                        {/* Wi-Fi, Signal, Battery */}
                        <div className="flex items-center gap-1.5 text-black">
                          <div className="flex items-end gap-[1.5px] h-3">
                            <span className="w-[2.5px] h-1.5 bg-black rounded-xs" />
                            <span className="w-[2.5px] h-2 bg-black rounded-xs" />
                            <span className="w-[2.5px] h-2.5 bg-black rounded-xs" />
                            <span className="w-[2.5px] h-3 bg-black rounded-xs" />
                          </div>
                          <Wifi className="h-3.5 w-3.5 stroke-[2.4]" />
                          <div className="flex items-center">
                            <div className="h-3 w-5 rounded-[4px] border border-black p-[1px] flex items-center">
                              <div className="h-full w-full rounded-[2px] bg-black" />
                            </div>
                            <div className="h-1.5 w-[1.5px] rounded-r-xs bg-black ml-[0.5px]" />
                          </div>
                        </div>
                      </div>

                      {/* 2. WHATSAPP HEADER WITH LOCAL NAME & PROFILE */}
                      <div className="relative z-20 flex items-center justify-between bg-[#008069] px-3 py-2 text-white shadow-sm">
                        <div className="flex items-center gap-2 min-w-0">
                          <button
                            type="button"
                            onClick={() =>
                              setSimChatMessages([
                                {
                                  id: `reset-1`,
                                  sender: "client",
                                  type: "text",
                                  text: "Hola",
                                  time: "14:28",
                                },
                                {
                                  id: `reset-2`,
                                  sender: "bot",
                                  type: "text",
                                  text: defaultWelcomeText,
                                  time: "14:28",
                                },
                              ])
                            }
                            className="flex items-center -ml-1 text-white/90 hover:text-white"
                          >
                            <ChevronLeft className="h-5 w-5 stroke-[2.5]" />
                          </button>

                          {/* Profile Avatar (Local's Actual Photo or Initials) */}
                          <div className="relative shrink-0">
                            {business.logo || business.banner ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={business.logo || business.banner}
                                alt={business.name}
                                className="h-9 w-9 rounded-full object-cover border border-white/40 shadow-xs"
                              />
                            ) : (
                              <div className="h-9 w-9 rounded-full bg-white/20 border border-white/40 flex items-center justify-center font-bold text-xs shadow-xs text-white">
                                {business.name.slice(0, 2).toUpperCase()}
                              </div>
                            )}
                            <BadgeCheck className="absolute -bottom-0.5 -right-0.5 h-4 w-4 text-white fill-[#10b981]" />
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-xs font-black text-white leading-tight">
                              {business.name}
                            </p>
                            <p className="text-[10px] text-white/80 leading-none mt-0.5 font-medium">
                              {isBotTypingSim ? (
                                <span className="text-white font-bold italic animate-pulse">
                                  escribiendo...
                                </span>
                              ) : (
                                "en línea · Cuenta Comercial"
                              )}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2.5 text-white/90 pr-1">
                          <Video className="h-4 w-4" />
                          <Phone className="h-3.5 w-3.5" />
                          <button
                            type="button"
                            onClick={() => {
                              setSimChatMessages([]);
                              pushToast("success", "Simulador reiniciado. Chat en blanco.");
                            }}
                            title="Reiniciar chat"
                            className="rounded-full p-1 hover:bg-white/10 transition cursor-pointer"
                          >
                            <RotateCcw className="h-3.5 w-3.5 text-white/90" />
                          </button>
                        </div>
                      </div>

                      {/* 3. MESSAGE STREAM (WITH WHATSAPP MARKDOWN PARSING) */}
                      <div
                        ref={chatScrollRef}
                        className="relative z-10 flex-1 overflow-y-auto px-3 py-2 space-y-2.5 scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                      >
                        <div className="text-center my-1">
                          <span className="rounded-lg bg-[#ffffff]/80 px-2.5 py-0.5 text-[10px] font-semibold text-[#54656f] shadow-[0_1px_0.5px_rgba(11,20,26,0.13)] uppercase tracking-wider">
                            HOY
                          </span>
                        </div>

                        <div className="mx-auto max-w-[260px] rounded-lg bg-[#ffeecd] px-2 py-1 text-center text-[9px] text-[#54656f] shadow-[0_1px_0.5px_rgba(11,20,26,0.13)] flex items-center justify-center gap-1">
                          <Lock className="h-2.5 w-2.5 shrink-0 text-[#54656f]" />
                          <span>Mensajes y llamadas cifrados de extremo a extremo.</span>
                        </div>

                        {/* Empty chat state */}
                        {simChatMessages.length === 0 && (
                          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                            <div className="h-11 w-11 rounded-full bg-white shadow-xs flex items-center justify-center text-[#54656f] mb-2.5">
                              <MessageSquare className="h-5 w-5 text-emerald-600" />
                            </div>
                            <p className="text-xs font-bold text-[#111b21]">
                              Simulador en blanco
                            </p>
                            <p className="text-[11px] text-[#667781] mt-1 max-w-[210px] leading-relaxed">
                              Escribí un mensaje abajo o tocá una de las opciones sugeridas a la derecha para ver cómo responde tu bot.
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
                            {/* Standard Text Bubble with Bold/Italic Parsing */}
                            {msg.type === "text" && msg.text && (
                              <div
                                className={`relative max-w-[86%] rounded-2xl px-3 py-2 text-xs leading-relaxed shadow-[0_1px_0.5px_rgba(11,20,26,0.15)] ${
                                  msg.sender === "client"
                                    ? "rounded-tr-xs bg-[#d9fdd3] text-[#111b21]"
                                    : "rounded-tl-xs bg-white text-[#111b21]"
                                }`}
                              >
                                {renderWhatsAppFormatted(msg.text)}
                                <div className="mt-1 flex items-center justify-end gap-1 text-[9px] text-[#667781]">
                                  <span>{msg.time}</span>
                                  {msg.sender === "client" && (
                                    <CheckCheck className="h-3 w-3 text-[#53bdeb]" />
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Rich Confirmation Card (Official WhatsApp Interactive) */}
                            {msg.type === "card" && msg.cardData && (
                              <div className="relative max-w-[90%] overflow-hidden rounded-2xl bg-white text-[#111b21] shadow-[0_1px_0.5px_rgba(11,20,26,0.15)] rounded-tl-xs">
                                <div className="bg-[#008069] px-3.5 py-2 text-white flex items-center justify-between">
                                  <span className="text-[11px] font-black flex items-center gap-1">
                                    <CheckCircle2 className="h-3.5 w-3.5" /> TURNO CONFIRMADO
                                  </span>
                                  <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded font-mono">
                                    AG-9421
                                  </span>
                                </div>

                                <div className="p-3 text-xs space-y-1.5">
                                  <div className="flex items-center justify-between">
                                    <p className="font-black text-sm text-[#111b21]">
                                      {msg.cardData.service}
                                    </p>
                                    <span className="font-mono font-bold text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                                      {msg.cardData.price}
                                    </span>
                                  </div>

                                  <div className="text-[11px] text-[#54656f] space-y-1 pt-1">
                                    <p className="flex items-center gap-1.5 font-bold text-slate-800">
                                      <Calendar className="h-3 w-3 text-[#008069]" />
                                      {msg.cardData.datetime}
                                    </p>
                                    <p className="flex items-center gap-1.5 text-slate-600">
                                      <MapPin className="h-3 w-3 text-[#008069]" />
                                      {msg.cardData.location}
                                    </p>
                                  </div>

                                  <div className="border-t border-slate-100 pt-1.5 flex items-center justify-between text-[11px]">
                                    <span className="text-[#54656f]">Especialista:</span>
                                    <span className="font-bold">{msg.cardData.staff}</span>
                                  </div>
                                </div>

                                <div className="bg-slate-50 px-3 py-1 flex items-center justify-between border-t border-slate-100 text-[9px] text-[#667781]">
                                  <span className="text-[#008069] font-bold">
                                    agendate.py/{business.slug || "local"}
                                  </span>
                                  <span>{msg.time}</span>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}

                        {/* Realistic Typing Bubble */}
                        {isBotTypingSim && (
                          <div className="flex justify-start">
                            <div className="rounded-2xl rounded-tl-xs bg-white px-3 py-2 text-slate-500 shadow-[0_1px_0.5px_rgba(11,20,26,0.15)] flex items-center gap-1.5">
                              <span className="h-1.5 w-1.5 rounded-full bg-[#008069] animate-bounce" />
                              <span className="h-1.5 w-1.5 rounded-full bg-[#008069] animate-bounce [animation-delay:0.2s]" />
                              <span className="h-1.5 w-1.5 rounded-full bg-[#008069] animate-bounce [animation-delay:0.4s]" />
                              <span className="text-[10px] ml-1 text-[#54656f] font-medium">
                                escribiendo...
                              </span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* 4. WHATSAPP BOTTOM INPUT BAR */}
                      <form
                        onSubmit={handleSimSendMessage}
                        className="relative z-20 flex items-center gap-2 bg-[#f0f2f5] p-2 border-t border-slate-200"
                      >
                        <div className="flex h-7 w-7 items-center justify-center text-[#54656f] hover:text-[#008069] cursor-pointer">
                          <Plus className="h-5 w-5" />
                        </div>
                        <input
                          type="text"
                          value={simInput}
                          onChange={(e) => setSimInput(e.target.value)}
                          placeholder="Escribir mensaje..."
                          className="flex-1 rounded-full bg-white px-3.5 py-1.5 text-xs text-slate-800 outline-none shadow-2xs placeholder:text-slate-400 font-sans"
                        />
                        <button
                          type="submit"
                          disabled={!simInput.trim() || isBotTypingSim}
                          className="flex h-8 w-8 items-center justify-center rounded-full bg-[#008069] text-white disabled:opacity-40 transition active:scale-95 cursor-pointer shadow-xs"
                        >
                          {simInput.trim() ? (
                            <Send className="h-4 w-4" />
                          ) : (
                            <Mic className="h-4 w-4" />
                          )}
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Test Chips & Simulator Controls */}
            <div className="lg:col-span-5 space-y-4">
              <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900 p-5 space-y-4 shadow-2xs">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">
                    Simulación Interactiva
                  </h3>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md">
                    En Vivo
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Tocá cualquiera de estas opciones para probar en tiempo real las respuestas de tu bot en el iPhone:
                </p>

                <div className="space-y-2">
                  {[
                    "Confirmar Turno",
                    "Hola",
                    "1",
                    "2",
                    "3",
                    "4",
                    "5",
                    "precio de corte",
                    "donde queda el local",
                    "hablar con una persona",
                  ].map((example) => (
                    <button
                      key={example}
                      type="button"
                      onClick={() => triggerSimMessage(example)}
                      className="w-full text-left p-2.5 rounded-xl border border-slate-200/80 dark:border-white/10 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 transition cursor-pointer flex items-center justify-between active:scale-98"
                    >
                      <span>&ldquo;{example}&rdquo;</span>
                      <ArrowRight className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    </button>
                  ))}
                </div>

                <div className="pt-3 border-t border-slate-200/70 dark:border-white/10 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => {
                      setSimChatMessages([]);
                      pushToast("success", "Simulador reiniciado. Chat en blanco.");
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span>Reiniciar chat</span>
                  </button>

                  <span className="text-[11px] text-slate-400 font-mono">
                    iPhone 16 Pro · iOS 18
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ═══ TAB 3: PLANTILLAS Y DISPARADORES AUTOMÁTICOS ═══ */
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
                      onChange={() => currentTemplate && handleToggleTemplate(currentTemplate.id)}
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
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 font-mono mt-1">
                      Formato WhatsApp: *negrita*, _cursiva_, ~tachado~, ```monospacio```
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

            {/* Template Preview Card with WhatsApp formatting parsing */}
            <div className="lg:col-span-5 space-y-3">
              <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900 p-5 shadow-2xs space-y-3">
                <h4 className="text-xs font-black uppercase text-slate-500 tracking-wider">
                  Vista Previa del Mensaje
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

      {/* ═══ 6. MODAL: ¿NECESITÁS AYUDA? CONTACTANOS ═══ */}
      {isHelpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="relative w-full max-w-lg rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900 p-6 space-y-5 shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600">
                  <PhoneCall className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-slate-900 dark:text-white">
                    Centro de Asistencia & Soporte Oficial
                  </h3>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Estamos listos para ayudarte con la configuración de {business.name}
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

            {/* Direct Contact Button */}
            <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 space-y-3">
              <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-xs">
                <MessageCircle className="h-4 w-4 text-emerald-600" />
                <span>Atención Directa por WhatsApp</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                ¿Tenés dudas sobre cómo estructurar tu flujo, cómo no desconectar la línea o cómo configurar los datos de pago SIPAP? Hablá directamente con nuestro equipo de soporte técnico.
              </p>
              <a
                href={`https://wa.me/595981700800?text=${encodeURIComponent(
                  `Hola equipo de Agendate.py, necesito asistencia con la configuración del Bot de WhatsApp para mi negocio "${business.name}".`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 text-xs shadow-md transition active:scale-98"
              >
                <MessageSquare className="h-4 w-4" />
                <span>Chatear con Soporte (+595 981 700 800)</span>
              </a>
            </div>

            {/* Quick Actions */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                Recursos Rápidos:
              </h4>
              <button
                type="button"
                onClick={() => {
                  setIsHelpModalOpen(false);
                  openTour("whatsapp");
                }}
                className="w-full flex items-center justify-between p-3 rounded-2xl border border-slate-200/70 dark:border-white/10 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 transition cursor-pointer text-left"
              >
                <div className="flex items-center gap-2.5">
                  <Layers className="h-4 w-4 text-sky-600" />
                  <div>
                    <p className="font-bold">Iniciar Visita Guiada Interactiva</p>
                    <p className="text-[11px] text-slate-400 font-normal">Paso a paso en vivo por cada elemento del módulo.</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-400 shrink-0" />
              </button>

              {!isConnected && (
                <button
                  type="button"
                  onClick={() => {
                    setIsHelpModalOpen(false);
                    setIsConnectModalOpen(true);
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-2xl border border-amber-200 dark:border-amber-800/40 bg-amber-50/60 dark:bg-amber-950/20 hover:bg-amber-100 text-xs font-bold text-amber-900 dark:text-amber-300 transition cursor-pointer text-left"
                >
                  <div className="flex items-center gap-2.5">
                    <QrCode className="h-4 w-4 text-amber-600" />
                    <div>
                      <p className="font-bold">Escanear Código QR Ahora</p>
                      <p className="text-[11px] text-amber-700 dark:text-amber-400 font-normal">Vinculá tu línea oficial en 20 segundos.</p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-amber-500 shrink-0" />
                </button>
              )}
            </div>

            {/* FAQ Accordion Summary */}
            <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-white/10 text-[11px] text-slate-500">
              <p className="font-bold text-slate-700 dark:text-slate-300">Preguntas Clave:</p>
              <p>• <strong>¿Mi celular debe estar prendido?</strong> Una vez escaneado el QR, la sesión multi-dispositivo corre en nuestra nube.</p>
              <p>• <strong>¿Los recordatorios funcionan 24/7?</strong> Sí, se envían automáticamente 24 horas y 2 horas antes de cada cita.</p>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setIsHelpModalOpen(false)}
                className="w-full py-2 rounded-xl text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
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
