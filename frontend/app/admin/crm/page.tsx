"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  MessageSquare,
  Search,
  Send,
  Bot,
  User,
  Phone,
  Building2,
  Sparkles,
  QrCode,
  Wifi,
  WifiOff,
  RefreshCw,
  Tag,
  CheckCircle2,
  Clock,
  ChevronRight,
  ExternalLink,
  ShieldAlert,
  AlertCircle,
  Copy,
  Plus,
  X,
  FileText,
  BadgeCheck,
  CheckCheck,
  Trash2,
} from "lucide-react";
import type { CrmContact } from "@/app/api/admin/crm/route";

const QUICK_SNIPPETS = [
  {
    label: "💰 Precios y Planes",
    text: "¡Hola! En AgendatePY tenemos planes pensados para vos:\n• *Plan Gratuito:* Gs. 0 para siempre (hasta 20 turnos/mes).\n• *Plan Básico:* Gs. 100.000/mes (hasta 100 turnos, IA WhatsApp).\n• *Plan Pro:* Gs. 250.000/mes (turnos ilimitados, hasta 10 profesionales, caja y comisiones).\n¿Te gustaría probar una demo?",
  },
  {
    label: "🚀 Link de Registro",
    text: "Podés crear la página web de reservas para tu negocio en menos de 2 minutos y empezar gratis aquí:\n👉 https://agendatepy.com/onboarding\nSin tarjeta de crédito requerida.",
  },
  {
    label: "💳 Cobros con Transferencias y QR",
    text: "Con AgendatePY tus clientes pueden pagarte mediante transferencia bancaria o QR. Nuestro bot multimodal valida los comprobantes en tiempo real para confirmar turnos automáticamente.",
  },
  {
    label: "📅 Agendar Demostración",
    text: "¡Con gusto te mostramos el sistema! ¿Te queda bien una breve llamada de 10 minutos hoy a la tarde para mostrarte cómo tus clientes agendarían en tu local?",
  },
];

export default function AdminCrmPage() {
  const [contacts, setContacts] = useState<CrmContact[]>([]);
  const [summary, setSummary] = useState<any>({ total: 0, owners: 0, leads: 0, clients: 0, pausedHumans: 0 });
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<"ALL" | "OWNER" | "LEAD" | "CLIENT" | "PAUSED">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  // Mensajería manual
  const [inputMessage, setInputMessage] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Estado del Gateway de WhatsApp
  const [gatewayStatus, setGatewayStatus] = useState<{
    connected: boolean;
    state: string;
    qrcode: string | null;
    ownerJid?: string | null;
    profileName?: string | null;
  }>({
    connected: false,
    state: "loading",
    qrcode: null,
  });
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [loadingQr, setLoadingQr] = useState(false);

  const selectedContactIdRef = useRef<string | null>(null);
  const initialPhoneCheckedRef = useRef(false);

  useEffect(() => {
    selectedContactIdRef.current = selectedContactId;
  }, [selectedContactId]);

  // Cargar contactos del CRM
  const fetchCrmData = async () => {
    try {
      const res = await fetch("/api/admin/crm");
      if (res.ok) {
        const json = await res.json();
        setContacts(json.contacts || []);
        setSummary(json.summary || {});

        setSelectedContactId((current) => {
          if (current) return current;

          // Si viene con parámetro ?phone= o ?id= en la URL (al hacer clic desde el grupo de WhatsApp)
          if (typeof window !== "undefined" && !initialPhoneCheckedRef.current) {
            initialPhoneCheckedRef.current = true;
            const params = new URLSearchParams(window.location.search);
            const targetPhone = (params.get("phone") || "").replace(/\D/g, "");
            const targetId = params.get("id");

            if (targetPhone) {
              const matched = json.contacts?.find((c: any) =>
                c.phone.replace(/\D/g, "").includes(targetPhone.slice(-8))
              );
              if (matched) return matched.id;
            }
            if (targetId) {
              const matched = json.contacts?.find((c: any) => c.id === targetId);
              if (matched) return matched.id;
            }
          }

          return json.contacts?.[0]?.id || null;
        });
      }
    } catch (e) {
      console.error("Error cargando CRM:", e);
    } finally {
      setLoading(false);
    }
  };

  // Cargar estado de la pasarela WhatsApp
  const fetchGatewayStatus = async () => {
    try {
      const res = await fetch("/api/admin/whatsapp/instance");
      if (res.ok) {
        const json = await res.json();
        setGatewayStatus({
          connected: json.connected === true,
          state: json.state || (json.connected ? "open" : "disconnected"),
          qrcode: json.qrcode || null,
          ownerJid: json.ownerJid || null,
          profileName: json.profileName || null,
        });
      }
    } catch (e) {
      console.error("Error cargando gateway:", e);
    }
  };

  useEffect(() => {
    fetchCrmData();
    fetchGatewayStatus();
    // Polling ágil de 1.5s para actualización instantánea de mensajes en el CRM
    const crmInterval = setInterval(() => {
      fetchCrmData();
    }, 1500);
    const gwInterval = setInterval(() => {
      fetchGatewayStatus();
    }, 6000);
    return () => {
      clearInterval(crmInterval);
      clearInterval(gwInterval);
    };
  }, []);

  // Auto-scroll del chat
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [selectedContactId, contacts]);

  // Obtener contacto activo
  const activeContact = contacts.find((c) => c.id === selectedContactId) || contacts[0] || null;

  // Filtrado de contactos
  const filteredContacts = contacts.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery) ||
      (c.businessName && c.businessName.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (activeFilter === "OWNER") return c.role === "OWNER";
    if (activeFilter === "LEAD") return c.role === "LEAD";
    if (activeFilter === "CLIENT") return c.role === "CLIENT";
    if (activeFilter === "PAUSED") return c.aiPaused;
    return true;
  });

  // Enviar mensaje manual
  const handleSendMessage = async (e?: React.FormEvent, directText?: string) => {
    if (e) e.preventDefault();
    const textToSend = (directText || inputMessage).trim();
    if (!textToSend || !activeContact || sendingMessage) return;

    try {
      setSendingMessage(true);
      const res = await fetch("/api/admin/crm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "send_message",
          phone: activeContact.phone,
          message: textToSend,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        // Actualizar chat en vivo
        setContacts((prev) =>
          prev.map((c) => {
            if (c.id === activeContact.id) {
              return {
                ...c,
                aiPaused: true,
                lastMessage: textToSend,
                lastMessageTime: json.time,
                messages: [
                  ...c.messages,
                  {
                    id: `msg-${Date.now()}`,
                    sender: "agent",
                    text: textToSend,
                    time: json.time,
                    timestamp: json.timestamp,
                    isAi: false,
                  },
                ],
              };
            }
            return c;
          })
        );
        setInputMessage("");
      }
    } catch (err) {
      console.error("Error al enviar mensaje:", err);
    } finally {
      setSendingMessage(false);
    }
  };

  // Alternar pausa del bot de IA
  const handleToggleAiPause = async () => {
    if (!activeContact) return;
    const newPausedState = !activeContact.aiPaused;

    try {
      const res = await fetch("/api/admin/crm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "toggle_ai",
          phone: activeContact.phone,
          paused: newPausedState,
          pauseAiMinutes: 60,
        }),
      });

      if (res.ok) {
        setContacts((prev) =>
          prev.map((c) => {
            if (c.id === activeContact.id) {
              return {
                ...c,
                aiPaused: newPausedState,
                minutesPausedRemaining: newPausedState ? 60 : 0,
              };
            }
            return c;
          })
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Solicitar QR de vinculación
  const handleRequestQr = async () => {
    try {
      setLoadingQr(true);
      const res = await fetch("/api/admin/whatsapp/instance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "connect" }),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.qrcode) {
          setGatewayStatus((prev) => ({ ...prev, qrcode: json.qrcode }));
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingQr(false);
    }
  };

  // Vaciar todo el historial de chats y memoria
  const [clearing, setClearing] = useState(false);
  const handleClearAllHistory = async () => {
    if (!confirm("¿Estás seguro de que querés borrar todo el historial de chats y la memoria del bot para empezar de 0?")) {
      return;
    }
    try {
      setClearing(true);
      const res = await fetch("/api/admin/crm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "clear_all" }),
      });
      if (res.ok) {
        setContacts([]);
        setSelectedContactId(null);
        setSummary({ total: 0, owners: 0, leads: 0, clients: 0, pausedHumans: 0 });
      }
    } catch (e) {
      console.error("Error vaciando historial:", e);
    } finally {
      setClearing(false);
    }
  };

  // Borrar conversación activa
  const handleDeleteCurrentChat = async () => {
    if (!activeContact) return;
    if (!confirm(`¿Borrar el chat de ${activeContact.name} (${activeContact.phone})?`)) return;
    try {
      const res = await fetch("/api/admin/crm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete_conversation", phone: activeContact.phone }),
      });
      if (res.ok) {
        setContacts((prev) => prev.filter((c) => c.id !== activeContact.id));
        setSelectedContactId(null);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] -m-4 sm:-m-6 p-3.5 sm:p-6 bg-[#F8F9FA] text-slate-900 overflow-hidden font-sans">
      {/* ═══ BARRA SUPERIOR DEL CRM ═══ */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200/80">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-orange-50 border border-orange-200/80 flex items-center justify-center text-[#FF4F2B] shadow-2xs">
            <MessageSquare className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-slate-900">CRM WhatsApp AgendatePY</h1>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-orange-50 border border-orange-200/80 text-[#FF4F2B]">
                ⚡ Gemini 3.1 Flash Lite
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Bandeja de entrada centralizada, detección de leads y supervisión de soporte en vivo.
            </p>
          </div>
        </div>

        {/* Métricas y Estado de Conexión de WhatsApp */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Indicador de Gateway */}
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold shadow-2xs ${
              gatewayStatus.connected
                ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                : "bg-amber-50 border-amber-200 text-amber-700"
            }`}
          >
            {gatewayStatus.connected ? (
              <>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span>WhatsApp Oficial Conectado</span>
              </>
            ) : (
              <>
                <WifiOff className="h-3.5 w-3.5" />
                <span>Desconectado</span>
              </>
            )}
          </div>

          <button
            type="button"
            disabled={clearing}
            onClick={handleClearAllHistory}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100/80 border border-rose-200/80 text-rose-600 text-xs font-semibold transition cursor-pointer disabled:opacity-50 shadow-2xs"
            title="Borrar todas las conversaciones y memoria del bot para empezar desde 0"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>{clearing ? "Vaciando..." : "Vaciar Chats"}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setQrModalOpen(true);
              handleRequestQr();
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#FF4F2B] hover:bg-[#E03F1E] text-white text-xs font-bold transition shadow-xs cursor-pointer active:scale-98"
          >
            <QrCode className="h-4 w-4" />
            <span>{gatewayStatus.connected ? "Ver Estado / QR" : "Vincular WhatsApp"}</span>
          </button>
        </div>
      </div>

      {/* ═══ CONTENEDOR PRINCIPAL: 3 COLUMNAS ═══ */}
      <div className="grid grid-cols-1 md:grid-cols-12 flex-1 min-h-0 pt-4 gap-4">
        {/* ── COLUMNA 1: LISTA DE CHATS (4 cols) ── */}
        <div className="md:col-span-4 flex flex-col bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          {/* Buscador */}
          <div className="p-3 border-b border-slate-100 space-y-2.5 bg-white">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por nombre, celular o negocio..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#FF4F2B] focus:ring-1 focus:ring-[#FF4F2B]/20 transition"
              />
            </div>

            {/* Filtros de Pestañas */}
            <div className="flex gap-1 overflow-x-auto pb-1 text-[11px] font-bold scrollbar-none">
              <button
                type="button"
                onClick={() => setActiveFilter("ALL")}
                className={`px-2.5 py-1 rounded-lg transition whitespace-nowrap cursor-pointer ${
                  activeFilter === "ALL"
                    ? "bg-slate-900 text-white shadow-2xs"
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                Todos ({summary.total})
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter("LEAD")}
                className={`px-2.5 py-1 rounded-lg transition whitespace-nowrap cursor-pointer ${
                  activeFilter === "LEAD"
                    ? "bg-orange-50 text-[#FF4F2B] border border-orange-200/80 shadow-2xs"
                    : "text-slate-500 hover:text-[#FF4F2B] hover:bg-orange-50/50"
                }`}
              >
                🚀 Leads ({summary.leads})
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter("OWNER")}
                className={`px-2.5 py-1 rounded-lg transition whitespace-nowrap cursor-pointer ${
                  activeFilter === "OWNER"
                    ? "bg-purple-50 text-purple-700 border border-purple-200/80 shadow-2xs"
                    : "text-slate-500 hover:text-purple-700 hover:bg-purple-50/50"
                }`}
              >
                👑 Dueños ({summary.owners})
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter("PAUSED")}
                className={`px-2.5 py-1 rounded-lg transition whitespace-nowrap cursor-pointer ${
                  activeFilter === "PAUSED"
                    ? "bg-amber-50 text-amber-700 border border-amber-200/80 shadow-2xs"
                    : "text-slate-500 hover:text-amber-700 hover:bg-amber-50/50"
                }`}
              >
                ⚠️ Pausados ({summary.pausedHumans})
              </button>
            </div>
          </div>

          {/* Lista de Conversaciones */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {loading ? (
              <div className="p-8 text-center text-xs text-slate-400 animate-pulse">
                Cargando conversaciones de WhatsApp...
              </div>
            ) : filteredContacts.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                No se encontraron conversaciones con este criterio.
              </div>
            ) : (
              filteredContacts.map((contact) => {
                const isSelected = contact.id === activeContact?.id;
                return (
                  <button
                    key={contact.id}
                    type="button"
                    onClick={() => {
                      setSelectedContactId(contact.id);
                      selectedContactIdRef.current = contact.id;
                    }}
                    className={`w-full p-3 text-left transition flex items-start gap-3 cursor-pointer ${
                      isSelected
                        ? "bg-orange-50/60 border-l-4 border-[#FF4F2B]"
                        : "hover:bg-slate-50/70 border-l-4 border-transparent"
                    }`}
                  >
                    {/* Avatar */}
                    <div className="relative shrink-0">
                      <div
                        className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-sm ${
                          isSelected
                            ? "bg-orange-100 border border-orange-200 text-[#FF4F2B]"
                            : "bg-slate-100 border border-slate-200 text-slate-600"
                        }`}
                      >
                        {contact.name.slice(0, 2).toUpperCase()}
                      </div>
                      {contact.role === "OWNER" && (
                        <span className="absolute -bottom-1 -right-1 text-[10px]" title="Dueño de Negocio">
                          👑
                        </span>
                      )}
                      {contact.role === "LEAD" && (
                        <span className="absolute -bottom-1 -right-1 text-[10px]" title="Lead Comercial">
                          🚀
                        </span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span className="font-bold text-xs text-slate-900 truncate">{contact.name}</span>
                        <span className="text-[10px] text-slate-400 shrink-0">{contact.lastMessageTime}</span>
                      </div>

                      <div className="flex items-center gap-1 text-[11px] mb-1">
                        {contact.businessName ? (
                          <span className="truncate text-[#FF4F2B] font-semibold">{contact.businessName}</span>
                        ) : (
                          <span className="text-slate-400 font-mono text-[10px]">{contact.phone}</span>
                        )}
                      </div>

                      <p className="text-[11px] text-slate-500 truncate leading-snug">
                        {contact.lastMessage}
                      </p>

                      {/* Badges */}
                      <div className="flex items-center gap-1.5 mt-1.5">
                        {contact.aiPaused ? (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-50 text-amber-700 border border-amber-200/80">
                            👤 Humano ({contact.minutesPausedRemaining}m)
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                            🤖 IA Activa
                          </span>
                        )}
                        {contact.businessPlan && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-orange-50 text-[#FF4F2B] border border-orange-200/60">
                            {contact.businessPlan}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* ── COLUMNA 2: CONVERSACIÓN EN TIEMPO REAL (5 cols) ── */}
        <div className="md:col-span-5 flex flex-col bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          {activeContact ? (
            <>
              {/* Header de la conversación */}
              <div className="p-3.5 border-b border-slate-100 flex items-center justify-between bg-white">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="h-9 w-9 rounded-full bg-orange-50 border border-orange-200/80 flex items-center justify-center font-bold text-xs text-[#FF4F2B]">
                    {activeContact.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h2 className="font-bold text-xs text-slate-900 truncate">{activeContact.name}</h2>
                      <span className="text-[10px] text-slate-400 font-mono">{activeContact.phone}</span>
                    </div>
                    <div className="text-[11px] text-[#FF4F2B] font-medium truncate">
                      {activeContact.businessName || "Lead Comercial de AgendatePY"}
                    </div>
                  </div>
                </div>

                {/* Control de IA / Pausa Humana */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleToggleAiPause}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold transition cursor-pointer border shadow-2xs ${
                      activeContact.aiPaused
                        ? "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100/70"
                        : "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100/70"
                    }`}
                    title={
                      activeContact.aiPaused
                        ? "El bot está pausado. Clic para reactivar IA."
                        : "La IA está respondiendo automáticamente. Clic para pausar."
                    }
                  >
                    {activeContact.aiPaused ? (
                      <>
                        <User className="h-3 w-3" />
                        <span>IA Silenciada</span>
                      </>
                    ) : (
                      <>
                        <Bot className="h-3 w-3" />
                        <span>IA Respondiendo</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleDeleteCurrentChat}
                    className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition cursor-pointer"
                    title="Borrar esta conversación"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Mensajes del Chat */}
              <div
                ref={chatScrollRef}
                className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#FBFBFC] bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px]"
              >
                {activeContact.messages.map((m: any) => {
                  const isMe = m.sender === "agent" || m.sender === "bot";
                  return (
                    <div
                      key={m.id}
                      className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed shadow-xs ${
                          isMe
                            ? "bg-gradient-to-r from-[#FF4F2B] to-[#FF6240] text-white rounded-tr-xs"
                            : "bg-white text-slate-800 rounded-tl-xs border border-slate-200/80"
                        }`}
                      >
                        {/* Etiqueta de emisor */}
                        <div className="flex items-center gap-1 mb-1 text-[10px] font-bold opacity-90">
                          {m.sender === "bot" ? (
                            <span className="flex items-center gap-1 text-white">
                              <Sparkles className="h-2.5 w-2.5" /> Bot Oficial (Gemini 3.1 Flash Lite)
                            </span>
                          ) : m.sender === "agent" ? (
                            <span className="text-white">👤 Asesor de Soporte</span>
                          ) : (
                            <span className="text-slate-500">{activeContact.name}</span>
                          )}
                        </div>

                        {/* Reproductor de Audio si es nota de voz */}
                        {m.mediaType === "audio" && m.mediaUrl && (
                          <div
                            className={`my-2 p-2.5 rounded-xl border shadow-inner ${
                              isMe
                                ? "bg-white/20 border-white/30 text-white"
                                : "bg-slate-50 border-slate-200 text-slate-800"
                            }`}
                          >
                            <div className="flex items-center gap-1.5 mb-1.5 text-[11px] font-bold">
                              <span>🎤 Nota de voz</span>
                            </div>
                            <audio controls src={m.mediaUrl} className="w-full h-8" preload="metadata" />
                          </div>
                        )}

                        {/* Vista previa de Imagen */}
                        {m.mediaType === "image" && m.mediaUrl && (
                          <div className="my-2">
                            <img
                              src={m.mediaUrl}
                              alt="Foto enviada"
                              className="max-h-60 max-w-xs rounded-xl border border-slate-200 object-cover cursor-pointer hover:opacity-95 transition shadow-sm"
                              onClick={() => window.open(m.mediaUrl, "_blank")}
                            />
                          </div>
                        )}

                        <p className="whitespace-pre-wrap">{m.text}</p>

                        <div className="mt-1 flex items-center justify-end gap-1 text-[9px] opacity-75">
                          <span>{m.time}</span>
                          {isMe && <CheckCheck className="h-3 w-3" />}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Respuestas Rápidas (Snippets) */}
              <div className="px-3 pt-2 bg-slate-50/70 border-t border-slate-100">
                <span className="text-[10px] text-slate-400 font-bold block mb-1">
                  Respuestas rápidas sugeridas:
                </span>
                <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-none">
                  {QUICK_SNIPPETS.map((snip, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSendMessage(undefined, snip.text)}
                      className="px-2.5 py-1 rounded-lg bg-white hover:bg-orange-50 hover:text-[#FF4F2B] hover:border-orange-200/80 text-slate-600 text-[11px] font-semibold transition whitespace-nowrap cursor-pointer border border-slate-200/80 shadow-2xs"
                    >
                      {snip.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Compositor de Mensaje Manual */}
              <form
                onSubmit={handleSendMessage}
                className="p-3 bg-white border-t border-slate-100 flex items-center gap-2"
              >
                <input
                  type="text"
                  placeholder="Escribí un mensaje directo para enviar por WhatsApp..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  className="flex-1 px-3.5 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#FF4F2B] focus:ring-1 focus:ring-[#FF4F2B]/20 transition"
                />
                <button
                  type="submit"
                  disabled={!inputMessage.trim() || sendingMessage}
                  className="px-4 py-2 rounded-xl bg-[#FF4F2B] hover:bg-[#E03F1E] disabled:opacity-40 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs active:scale-98"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>Enviar</span>
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-3">
              <div className="h-14 w-14 rounded-2xl bg-orange-50 border border-orange-200/80 flex items-center justify-center text-[#FF4F2B] shadow-2xs">
                <MessageSquare className="h-7 w-7" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Bandeja de Entrada en Espera</h3>
              <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
                Sin conversaciones activas aún. Todos los mensajes enviados o recibidos en el WhatsApp oficial aparecerán aquí en vivo en tiempo real.
              </p>
              <button
                type="button"
                onClick={() => {
                  setQrModalOpen(true);
                  handleRequestQr();
                }}
                className="mt-2 flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#FF4F2B] hover:bg-[#E03F1E] text-white text-xs font-bold transition shadow-xs cursor-pointer active:scale-98"
              >
                <QrCode className="h-4 w-4" />
                <span>Vincular WhatsApp Oficial</span>
              </button>
            </div>
          )}
        </div>

        {/* ── COLUMNA 3: FICHA DEL CONTACTO / NEGOCIO (3 cols) ── */}
        <div className="md:col-span-3 flex flex-col bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 space-y-4 overflow-y-auto">
          {activeContact ? (
            <>
              {/* Tarjeta de Perfil */}
              <div className="text-center pb-3 border-b border-slate-100">
                <div className="h-16 w-16 mx-auto rounded-full bg-orange-50 border-2 border-orange-200 flex items-center justify-center font-bold text-xl text-[#FF4F2B] mb-2 shadow-xs">
                  {activeContact.name.slice(0, 2).toUpperCase()}
                </div>
                <h3 className="font-bold text-sm text-slate-900">{activeContact.name}</h3>
                <p className="text-xs text-[#FF4F2B] font-semibold">{activeContact.phone}</p>
                <div className="mt-2 flex justify-center">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      activeContact.role === "OWNER"
                        ? "bg-purple-50 text-purple-700 border border-purple-200"
                        : activeContact.role === "LEAD"
                        ? "bg-orange-50 text-[#FF4F2B] border border-orange-200"
                        : "bg-blue-50 text-blue-700 border border-blue-200"
                    }`}
                  >
                    {activeContact.role === "OWNER"
                      ? "👑 Titular de Negocio"
                      : activeContact.role === "LEAD"
                      ? "🚀 Prospecto / Lead"
                      : "👤 Cliente"}
                  </span>
                </div>
              </div>

              {/* Datos de Negocio */}
              {activeContact.businessName && (
                <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-200/80 space-y-1.5 text-xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Negocio en Plataforma
                  </span>
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Building2 className="h-3.5 w-3.5 text-[#FF4F2B]" />
                    <span>{activeContact.businessName}</span>
                  </div>
                  {activeContact.businessPlan && (
                    <div className="text-[11px] text-slate-500">
                      Plan: <span className="text-slate-900 font-semibold">{activeContact.businessPlan}</span>
                    </div>
                  )}
                  {activeContact.businessSlug && (
                    <a
                      href={`https://agendatepy.com/${activeContact.businessSlug}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] text-[#FF4F2B] hover:underline pt-1 font-medium"
                    >
                      <span>Ver página pública</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              )}

              {/* Etiquetas */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Etiquetas CRM
                </span>
                <div className="flex flex-wrap gap-1">
                  {activeContact.tags.map((t: string, idx: number) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-semibold border border-slate-200/80"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Notas Internas */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Notas de Soporte & Ventas
                </span>
                <p className="text-xs text-slate-600 bg-slate-50/80 p-2.5 rounded-xl border border-slate-200/80 leading-relaxed">
                  {activeContact.notes || "Sin notas registradas para este contacto."}
                </p>
              </div>

              {/* Acciones Rápidas */}
              <div className="pt-2 space-y-2">
                <a
                  href={`https://wa.me/${activeContact.phone.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200/70 text-slate-700 text-xs font-bold flex items-center justify-center gap-2 transition border border-slate-200/80"
                >
                  <Phone className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Abrir WhatsApp Web</span>
                </a>

                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText("https://agendatepy.com/onboarding");
                    alert("Enlace de Onboarding copiado al portapapeles");
                  }}
                  className="w-full py-2 px-3 rounded-xl border border-orange-200 bg-orange-50/60 hover:bg-orange-100/70 text-[#FF4F2B] text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <Copy className="h-3.5 w-3.5 text-[#FF4F2B]" />
                  <span>Copiar Link de Onboarding</span>
                </button>
              </div>
            </>
          ) : (
            <div className="text-center text-xs text-slate-400 p-8">
              Sin contacto seleccionado
            </div>
          )}
        </div>
      </div>

      {/* ═══ MODAL VINCULAR WHATSAPP OFICIAL CON QR ═══ */}
      {qrModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="relative w-full max-w-md rounded-3xl border border-slate-200/80 bg-white p-6 space-y-5 shadow-2xl animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50 text-[#FF4F2B] border border-orange-200/80 shadow-2xs">
                  <QrCode className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Vincular WhatsApp Oficial</h3>
                  <span className="text-[11px] text-slate-400">
                    Puerto 8081 (Pasarela AgendatePY)
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setQrModalOpen(false)}
                className="rounded-full p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Código QR o Estado Conectado */}
            <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-slate-50 border border-slate-200/80">
              {gatewayStatus.connected ? (
                <div className="text-center space-y-2 py-4">
                  <div className="h-14 w-14 mx-auto rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-2xs">
                    <CheckCircle2 className="h-8 w-8" />
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">¡WhatsApp Vinculado con Éxito!</h4>
                  <p className="text-xs text-slate-500">
                    La pasarela oficial de AgendatePY está en línea y despachando mensajes por IA.
                  </p>
                  {gatewayStatus.ownerJid && (
                    <span className="inline-block mt-2 px-3 py-1 bg-white rounded-lg text-xs font-mono text-emerald-700 border border-emerald-200 shadow-2xs">
                      +{gatewayStatus.ownerJid.split("@")[0]}
                    </span>
                  )}
                </div>
              ) : gatewayStatus.qrcode ? (
                <div className="text-center space-y-3">
                  <div className="p-3 bg-white rounded-2xl shadow-md border border-slate-200/80 inline-block">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={
                        gatewayStatus.qrcode.startsWith("data:")
                          ? gatewayStatus.qrcode
                          : `data:image/png;base64,${gatewayStatus.qrcode}`
                      }
                      alt="Código QR de WhatsApp"
                      className="h-52 w-52 object-contain"
                    />
                  </div>
                  <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500">
                    <RefreshCw className="h-3.5 w-3.5 animate-spin text-[#FF4F2B]" />
                    <span>Actualiza automáticamente cada 30s</span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 space-y-3">
                  <RefreshCw className="h-8 w-8 animate-spin text-[#FF4F2B] mx-auto" />
                  <p className="text-xs text-slate-500">
                    {loadingQr ? "Generando código QR desde la pasarela..." : "Cargando pasarela..."}
                  </p>
                </div>
              )}
            </div>

            {/* Instrucciones */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 text-[11px] text-slate-600 space-y-1">
              <span className="font-bold text-slate-900 block">Paso a paso para escanear:</span>
              <ol className="list-decimal pl-4 space-y-0.5">
                <li>Abrí WhatsApp en el celular que atenderá AgendatePY.</li>
                <li>Tocá en <strong>Ajustes</strong> &gt; <strong>Dispositivos vinculados</strong>.</li>
                <li>Tocá <strong>Vincular un dispositivo</strong> y apuntá al QR.</li>
              </ol>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleRequestQr}
                className="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer border border-slate-200/80"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Regenerar QR</span>
              </button>
              <button
                type="button"
                onClick={() => setQrModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-[#FF4F2B] hover:bg-[#E03F1E] text-white text-xs font-bold transition cursor-pointer shadow-xs active:scale-98"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
