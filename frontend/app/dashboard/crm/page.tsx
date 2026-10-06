"use client";

import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  MessageSquare,
  Search,
  Send,
  Calendar,
  User,
  CheckCheck,
  Check,
  Clock,
  Zap,
  ExternalLink,
  ShieldCheck,
  Award,
  Settings,
  RefreshCw,
  Phone,
  CreditCard,
  X,
  CheckCircle2,
  Building2,
  ShoppingBag,
  Tag,
  Truck,
  Store,
  QrCode,
  Smartphone,
  Bot,
  Trash2,
  Copy,
  Shield,
  Timer,
  Hash,
  FileText,
  History,
  ChevronLeft,
} from "lucide-react";
import QRCode from "qrcode";
import { useDashboardStore } from "@/store/useDashboardStore";
import Card from "@/components/dashboard/ui/Card";
import Modal from "@/components/dashboard/ui/Modal";
import CustomSelect, { CustomSelectOption } from "@/components/dashboard/ui/CustomSelect";
import { formatGs } from "@/lib/dashboard-dates";
import type { CrmChannel, ProductOrderStatus } from "@/lib/dashboard-types";

/* ── Channel SVG Icons ── */
function ChannelIcon({ channel, size = "md" }: { channel: CrmChannel; size?: "sm" | "md" | "lg" }) {
  const dim = size === "sm" ? "h-3.5 w-3.5" : size === "lg" ? "h-6 w-6" : "h-4 w-4";
  if (channel === "whatsapp")
    return (
      <svg className={`${dim} text-emerald-500 fill-current`} viewBox="0 0 24 24">
        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
      </svg>
    );
  if (channel === "instagram")
    return (
      <svg className={`${dim} text-pink-500 fill-current`} viewBox="0 0 24 24">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
      </svg>
    );
  return (
    <svg className={`${dim} text-blue-500 fill-current`} viewBox="0 0 24 24">
      <path d="M12 0C5.373 0 0 4.974 0 11.111c0 3.498 1.744 6.614 4.469 8.654V24l4.088-2.242c1.101.305 2.256.464 3.443.464 6.627 0 12-4.975 12-11.111C24 4.974 18.627 0 12 0zm1.191 14.963l-3.055-3.26-5.963 3.26L10.732 7.5l3.131 3.259L19.748 7.5l-6.557 7.463z" />
    </svg>
  );
}

function channelBadgeStyles(channel: CrmChannel) {
  switch (channel) {
    case "whatsapp":
      return "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50";
    case "instagram":
      return "bg-pink-50 dark:bg-pink-950/60 text-pink-700 dark:text-pink-400 border-pink-200 dark:border-pink-800/50";
    case "messenger":
      return "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800/50";
  }
}

export default function CrmOmnichannelPage() {
  const {
    crmConversations, clients, products, business,
    evolutionConfig, updateEvolutionConfig,
    loadDemoConversation, clearCrmConversations, createOrderFromCrm,
    sendCrmMessage, resolveCrmConversation, reopenCrmConversation,
    pushToast, productOrders, updateProductOrderStatus,
    receipts, setReceiptStatus,
  } = useDashboardStore();

  const router = useRouter();
  const [mainSection, setMainSection] = useState<"mensajes" | "pedidos" | "metricas">("mensajes");
  const [desktopProfileOpen, setDesktopProfileOpen] = useState(true);
  const [orderStatusFilter, setOrderStatusFilter] = useState<"all" | ProductOrderStatus>("all");
  const [orderSearch, setOrderSearch] = useState("");
  const [channelFilter, setChannelFilter] = useState<"todos" | CrmChannel>("todos");
  const [statusFilter, setStatusFilter] = useState<"open" | "resolved" | "all">("open");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string>("conv-demo-1");
  const [replyText, setReplyText] = useState("");
  const [mobileActiveView, setMobileActiveView] = useState<"list" | "chat" | "profile">("list");

  // Modals
  const [channelsModalOpen, setChannelsModalOpen] = useState(false);
  const [channelsTab, setChannelsTab] = useState<"whatsapp" | "instagram" | "facebook">("whatsapp");
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [clientProfileModalOpen, setClientProfileModalOpen] = useState(false);

  // Order modal
  const [orderProductId, setOrderProductId] = useState(products[0]?.id || "pr-1");
  const [orderQty, setOrderQty] = useState(1);
  const [orderDelivery, setOrderDelivery] = useState<"retirar_en_local" | "delivery">("retirar_en_local");
  const [orderPayment, setOrderPayment] = useState<"efectivo" | "pos" | "transferencia">("transferencia");
  const [orderNotes, setOrderNotes] = useState("");

  // Real QR Code state
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");
  const [qrCounter, setQrCounter] = useState(45);

  // Typing & human delay simulation (10-20s anti-ban cadence)
  const [isTyping, setIsTyping] = useState(false);
  const [typingSender, setTypingSender] = useState<string>("");
  const [typingStep, setTypingStep] = useState<"reading" | "typing" | "idle">("idle");
  const [typingCountdown, setTypingCountdown] = useState<number>(0);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const p = new URLSearchParams(window.location.search);
      if (p.get("tab") === "pedidos") setMainSection("pedidos");
      if (p.get("tab") === "metricas") setMainSection("metricas");
    }
  }, []);

  useEffect(() => {
    if (crmConversations.length > 0 && (!selectedId || !crmConversations.some((c) => c.id === selectedId)))
      setSelectedId(crmConversations[0].id);
  }, [crmConversations, selectedId]);

  // Generate QR code once when modal opens, and only regenerate when the 45s cycle completes
  const generateQrCode = useCallback(() => {
    const sessionId = `AGPY_${(business.slug || "central").toUpperCase()}_${Date.now()}`;
    const payload = `2@${Array.from({ length: 24 }, () => Math.floor(Math.random() * 16).toString(16)).join("")},${sessionId},${Date.now()}`;
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

  // Trigger initial QR when modal opens
  useEffect(() => {
    if (channelsModalOpen) {
      setQrCounter(45);
      generateQrCode();
    }
  }, [channelsModalOpen, generateQrCode]);

  // Countdown timer: only regenerates when counter reaches 0
  useEffect(() => {
    if (!channelsModalOpen) return;
    const t = setInterval(() => {
      setQrCounter((p) => {
        if (p <= 1) {
          generateQrCode();
          return 45;
        }
        return p - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [channelsModalOpen, generateQrCode]);

  /* ── Derived data ── */
  const filteredOrders = useMemo(() => productOrders.filter((o) => {
    const matchSt = orderStatusFilter === "all" || o.status === orderStatusFilter;
    const matchSe = !orderSearch.trim() || o.clientName.toLowerCase().includes(orderSearch.toLowerCase()) || o.orderNumber.toLowerCase().includes(orderSearch.toLowerCase());
    return matchSt && matchSe;
  }), [productOrders, orderStatusFilter, orderSearch]);

  const pendingOrdersCount = productOrders.filter((o) => o.status === "pending").length;
  const totalOrderRevenue = productOrders.filter((o) => o.status !== "cancelled").reduce((s, o) => s + o.totalAmount, 0);

  const quickReplies = [
    { title: "Enlace de Turnos", text: `¡Hola! Podés reservar tu turno en nuestra web: https://${business.slug || "barberia"}.agendate.py/reservar` },
    { title: "Precios", text: "Nuestros servicios van desde Gs. 50.000 hasta Gs. 120.000 (Combo Corte + Barba VIP). ¿Te gustaría agendar?" },
    { title: "Ubicación", text: `Estamos en ${business.address}, ${business.city}. Contamos con estacionamiento exclusivo.` },
    { title: "Datos SIPAP", text: "Transferencias SIPAP: Banco Itaú · Titular: AgendatePY · RUC: 80012345-6 · Cta: 0123456789. Enviar comprobante." },
  ];

  const filteredConversations = useMemo(() => crmConversations.filter((c) => {
    const chMatch = channelFilter === "todos" || c.channel === channelFilter;
    const stMatch = statusFilter === "all" || (statusFilter === "open" && (c.status === "open" || c.status === "pending")) || (statusFilter === "resolved" && c.status === "resolved");
    const seMatch = c.clientName.toLowerCase().includes(search.toLowerCase()) || c.channelIdentifier.toLowerCase().includes(search.toLowerCase()) || c.lastMessage.toLowerCase().includes(search.toLowerCase());
    return chMatch && stMatch && seMatch;
  }), [crmConversations, channelFilter, statusFilter, search]);

  const activeConversation = useMemo(() => crmConversations.find((c) => c.id === selectedId) || filteredConversations[0] || null, [crmConversations, selectedId, filteredConversations]);

  const linkedClient = useMemo(() => {
    if (!activeConversation?.clientId) return null;
    return clients.find((cl) => cl.id === activeConversation.clientId) || null;
  }, [activeConversation, clients]);

  // Order history for active conversation client
  const clientOrderHistory = useMemo(() => {
    if (!activeConversation) return [];
    return productOrders.filter((o) =>
      o.clientName.toLowerCase() === activeConversation.clientName.toLowerCase() ||
      o.clientPhone.replace(/\s/g, "").includes(activeConversation.channelIdentifier.replace(/\s/g, ""))
    );
  }, [activeConversation, productOrders]);

  // SIPAP Bank receipts for active conversation client
  const clientReceipts = useMemo(() => {
    if (!activeConversation) return [];
    return receipts.filter((r) =>
      r.clientName.toLowerCase() === activeConversation.clientName.toLowerCase() ||
      (r.clientPhone && r.clientPhone.replace(/\s/g, "").includes(activeConversation.channelIdentifier.replace(/\s/g, "")))
    );
  }, [activeConversation, receipts]);

  const selectedProduct = useMemo(() => products.find((p) => p.id === orderProductId) || products[0], [products, orderProductId]);
  const unitPrice = selectedProduct?.isOnSale && selectedProduct?.salePrice ? selectedProduct.salePrice : selectedProduct?.price || 0;
  const orderTotal = unitPrice * orderQty;

  const unreadTotal = crmConversations.reduce((s, c) => s + (c.unreadCount || 0), 0);
  const waUnread = crmConversations.filter((c) => c.channel === "whatsapp").reduce((s, c) => s + (c.unreadCount || 0), 0);
  const igUnread = crmConversations.filter((c) => c.channel === "instagram").reduce((s, c) => s + (c.unreadCount || 0), 0);
  const msUnread = crmConversations.filter((c) => c.channel === "messenger").reduce((s, c) => s + (c.unreadCount || 0), 0);

  /* ── Auto-scroll & Viewport Management ── */
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = "instant") => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior,
      });
    }
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior, block: "end" });
    }
  }, []);

  // When a chat is opened or conversation changes, automatically position viewport and scroll to bottom
  useEffect(() => {
    if (activeConversation) {
      if (typeof window !== "undefined") {
        window.scrollTo({ top: 0, behavior: "instant" });
      }
      scrollToBottom("instant");
      const timer = setTimeout(() => {
        if (typeof window !== "undefined") {
          window.scrollTo({ top: 0, behavior: "instant" });
        }
        scrollToBottom("instant");
      }, 40);
      return () => clearTimeout(timer);
    }
  }, [activeConversation?.id, mobileActiveView, scrollToBottom]);

  // When new messages arrive or are sent, scroll down smoothly
  useEffect(() => {
    if (activeConversation?.messages.length) {
      scrollToBottom("smooth");
    }
  }, [activeConversation?.messages.length, scrollToBottom]);

  // When typing indicator appears, scroll down smoothly
  useEffect(() => {
    if (isTyping) {
      scrollToBottom("smooth");
    }
  }, [isTyping, scrollToBottom]);

  /* ── Handlers ── */
  function handleSend() {
    if (!replyText.trim() || !activeConversation) return;
    const sentText = replyText.trim();
    sendCrmMessage(activeConversation.id, sentText);
    setReplyText("");
    pushToast("success", `Mensaje enviado por ${activeConversation.channel}`);

    // Realistic human cadence simulation (10 to 20 seconds) with Typing indicator
    const convId = activeConversation.id;
    const clientName = activeConversation.clientName;
    const isBot = evolutionConfig.autoBotEnabled;

    const readingTime = Math.floor(Math.random() * 3) + 6;
    const typingTime = Math.floor(Math.random() * 4) + 6;
    const totalTime = readingTime + typingTime;

    setIsTyping(true);
    setTypingSender(isBot ? "Bot AgendatePY" : clientName);
    setTypingStep("reading");
    setTypingCountdown(totalTime);

    let remaining = totalTime;
    const interval = setInterval(() => {
      remaining -= 1;
      setTypingCountdown(remaining);
      if (remaining <= typingTime && remaining > 0) {
        setTypingStep("typing");
      }
      if (remaining <= 0) {
        clearInterval(interval);
        setIsTyping(false);
        setTypingStep("idle");

        const botReply = isBot
          ? `¡Hola ${clientName.split(" ")[0]}! Recibimos tu mensaje. Si querés agendar un turno ahora podés acceder a nuestra web: https://${business.slug || "barberia"}.agendate.py/reservar`
          : "¡Perfecto, muchas gracias! Ya lo anoto y quedamos así.";

        const newMsg: import("@/lib/dashboard-types").CrmMessage = {
          id: `msg-${Date.now()}`,
          sender: isBot ? "agent" : "client",
          text: botReply,
          timestamp: new Date().toISOString(),
          status: "delivered",
        };

        useDashboardStore.setState((state) => ({
          crmConversations: state.crmConversations.map((c) =>
            c.id === convId
              ? {
                  ...c,
                  lastMessage: botReply,
                  lastMessageTime: new Date().toISOString(),
                  messages: [...c.messages, newMsg],
                }
              : c
          ),
        }));
      }
    }, 1000);
  }

  function handleCreateOrderSubmit() {
    if (!activeConversation || !selectedProduct) return;
    createOrderFromCrm({
      clientName: activeConversation.clientName,
      clientPhone: activeConversation.channelIdentifier,
      items: [{ productId: selectedProduct.id, productName: selectedProduct.name, qty: orderQty, unitPrice, isOnSale: selectedProduct.isOnSale }],
      deliveryType: orderDelivery,
      paymentMethod: orderPayment,
      notes: orderNotes.trim() || `Pedido tomado por chat (${activeConversation.channel})`,
    });
    const autoMsg = `¡Pedido registrado! ${orderQty}x ${selectedProduct.name} por ${formatGs(orderTotal)}. ${orderDelivery === "retirar_en_local" ? "Retiro en local" : "Delivery"}.`;
    sendCrmMessage(activeConversation.id, autoMsg);
    setOrderModalOpen(false);
    setOrderNotes("");
    setOrderQty(1);
  }

  /* ── Select Options ── */
  const productOptions: CustomSelectOption[] = products.map((p) => ({
    value: p.id, label: p.name,
    subtitle: `${formatGs(p.isOnSale && p.salePrice ? p.salePrice : p.price)} · Stock: ${p.stock} u.`,
    badge: p.isOnSale ? "OFERTA" : undefined,
  }));
  const deliveryOptions: CustomSelectOption[] = [
    { value: "retirar_en_local", label: "Retirar en el Local (Sin costo)", icon: <Store className="h-4 w-4 text-emerald-500" /> },
    { value: "delivery", label: "Delivery (Asunción y alrededores)", icon: <Truck className="h-4 w-4 text-indigo-500" /> },
  ];
  const paymentOptions: CustomSelectOption[] = [
    { value: "transferencia", label: "Transferencia SIPAP", icon: <CreditCard className="h-4 w-4 text-indigo-500" /> },
    { value: "efectivo", label: "Efectivo / Contraentrega", icon: <Tag className="h-4 w-4 text-emerald-500" /> },
    { value: "pos", label: "Tarjeta / POS Bancard", icon: <CheckCircle2 className="h-4 w-4 text-blue-500" /> },
  ];

  const openCount = crmConversations.filter((c) => c.status === "open").length;
  const resolvedCount = crmConversations.filter((c) => c.status === "resolved").length;
  const resolutionPct = crmConversations.length > 0 ? Math.round((resolvedCount / crmConversations.length) * 100) : 100;
  const waCount = crmConversations.filter((c) => c.channel === "whatsapp").length;
  const waSharePct = crmConversations.length > 0 ? Math.round((waCount / crmConversations.length) * 100) : 0;

  return (
    <div className={mobileActiveView !== "list" ? "space-y-0 lg:space-y-4" : "space-y-4"}>
      {/* ═══ APP FORMAT TOP NAVIGATION BAR ═══ */}
      <div
        data-tour="crm-header"
        className={`flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/80 dark:border-white/10 shrink-0 ${
          mobileActiveView !== "list" ? "hidden lg:flex" : "flex"
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-white font-black text-sm shadow-xs"
            style={{ backgroundColor: business.primaryColor || "var(--primary, #FF4F2B)" }}
          >
            <MessageSquare className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-black tracking-tight text-slate-900 dark:text-white">
                CRM & Mensajería
              </h1>
              <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>{evolutionConfig.connected ? "En línea" : "Desconectado"}</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              WhatsApp, Instagram y Messenger en una sola bandeja
            </p>
          </div>
        </div>

        {/* Center / Right: App Navigation Pills + Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200/60 dark:border-white/5">
            <button
              type="button"
              onClick={() => setMainSection("mensajes")}
              style={
                mainSection === "mensajes"
                  ? { backgroundColor: business.primaryColor || "#0f172a", color: "#ffffff" }
                  : undefined
              }
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                mainSection === "mensajes"
                  ? "shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <MessageSquare className="h-3.5 w-3.5" />
              <span>Chats</span>
              {unreadTotal > 0 && (
                <span className="bg-rose-500 text-white text-[9.5px] px-1.5 rounded-full font-black">
                  {unreadTotal}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setMainSection("pedidos")}
              style={
                mainSection === "pedidos"
                  ? { backgroundColor: business.primaryColor || "#0f172a", color: "#ffffff" }
                  : undefined
              }
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                mainSection === "pedidos"
                  ? "shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <ShoppingBag className="h-3.5 w-3.5" />
              <span>Pedidos</span>
              {pendingOrdersCount > 0 && (
                <span className="bg-amber-500 text-white text-[9.5px] px-1.5 rounded-full font-black">
                  {pendingOrdersCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setMainSection("metricas")}
              style={
                mainSection === "metricas"
                  ? { backgroundColor: business.primaryColor || "#0f172a", color: "#ffffff" }
                  : undefined
              }
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                mainSection === "metricas"
                  ? "shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Métricas</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => setChannelsModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 text-xs font-bold shadow-xs transition cursor-pointer"
          >
            <QrCode className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Conectar QR</span>
          </button>

          {crmConversations.length > 0 ? (
            <button
              type="button"
              onClick={clearCrmConversations}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-rose-600 dark:hover:text-rose-400 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-xs transition cursor-pointer"
              title="Limpiar bandeja de mensajes"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Limpiar</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={loadDemoConversation}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-xs transition cursor-pointer"
            >
              <MessageSquare className="h-3.5 w-3.5 text-emerald-500" />
              <span>Demo</span>
            </button>
          )}
        </div>
      </div>

      {/* ═══ VIEW 1: CHATS WORKSPACE (FORMATO APP NATIVO) ═══ */}
      {mainSection === "mensajes" && (
        crmConversations.length === 0 ? (
          /* ═══ EMPTY STATE ═══ */
          <div className="rounded-3xl bg-white dark:bg-[#121215] border border-slate-200/80 dark:border-white/10 p-8 sm:p-12 text-center shadow-xs">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 border border-emerald-200 dark:border-emerald-800/40 mb-4 shadow-xs">
              <QrCode className="h-8 w-8" />
            </div>
            <span className="inline-block rounded-full bg-primary/10 border border-primary/20 px-3.5 py-1 text-xs font-bold text-primary mb-2">Bandeja Vacía</span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight max-w-xl mx-auto">Conectá tus redes y recibí mensajes</h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto mt-2 leading-relaxed">
              Vinculá tu WhatsApp escaneando el código QR, recibí consultas de clientes y gestioná turnos y pedidos de forma centralizada.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button type="button" onClick={() => setChannelsModalOpen(true)} className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-3 text-xs font-bold shadow-md transition cursor-pointer">
                <QrCode className="h-4 w-4" /><span>Conectar WhatsApp QR</span>
              </button>
              <button type="button" onClick={loadDemoConversation} className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-white px-4 py-3 text-xs font-semibold border border-slate-200/80 dark:border-white/10 transition cursor-pointer">
                <MessageSquare className="h-4 w-4 text-emerald-500" /><span>Cargar Chat de Ejemplo</span>
              </button>
            </div>
          </div>
        ) : (
          /* ═══ 3-PANE NATIVE MESSENGER WORKSPACE ═══ */
          <div
            className={`w-full rounded-3xl bg-white dark:bg-[#121215] border border-slate-200/80 dark:border-white/10 shadow-xs overflow-hidden flex flex-col lg:flex-row ${
              mobileActiveView !== "list"
                ? "h-[calc(100dvh-11.8rem-env(safe-area-inset-bottom,0px))] sm:h-[calc(100dvh-11rem)] lg:h-[calc(100dvh-7.8rem)] min-h-0 sm:min-h-[560px]"
                : "h-[calc(100dvh-14.5rem-env(safe-area-inset-bottom,0px))] sm:h-[calc(100dvh-11rem)] lg:h-[calc(100dvh-7.8rem)] min-h-0 sm:min-h-[560px]"
            }`}
          >
            {/* ── LEFT PANE: CONVERSATION LIST ── */}
            <div
              data-tour="crm-channels"
              className={`w-full lg:w-[320px] xl:w-[350px] shrink-0 border-r border-slate-200/80 dark:border-white/10 flex-col bg-slate-50/70 dark:bg-[#141418] ${
                mobileActiveView !== "list" ? "hidden lg:flex" : "flex h-full"
              }`}
            >
              {/* Left Top Search & Filter Bar */}
              <div className="p-3 border-b border-slate-200/70 dark:border-white/10 space-y-2.5 shrink-0 bg-white/60 dark:bg-[#141418]">
                {/* Search Input */}
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Buscar cliente o chat..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/70 dark:border-white/10 pl-8 pr-3 py-1.5 text-xs text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                  {search && (
                    <button
                      type="button"
                      onClick={() => setSearch("")}
                      className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>

                {/* Channel Filter Tabs */}
                <div className="grid grid-cols-4 gap-1 p-1 bg-slate-200/60 dark:bg-slate-800/80 rounded-xl text-[10.5px]">
                  {(["todos", "whatsapp", "instagram", "messenger"] as const).map((ch) => {
                    const counts: Record<string, number> = {
                      todos: crmConversations.length,
                      whatsapp: crmConversations.filter((c) => c.channel === "whatsapp").length,
                      instagram: crmConversations.filter((c) => c.channel === "instagram").length,
                      messenger: crmConversations.filter((c) => c.channel === "messenger").length,
                    };
                    const unreads: Record<string, number> = { todos: unreadTotal, whatsapp: waUnread, instagram: igUnread, messenger: msUnread };
                    const labels: Record<string, string> = { todos: "Todos", whatsapp: "WA", instagram: "IG", messenger: "Msg" };
                    const active = channelFilter === ch;

                    return (
                      <button
                        key={ch}
                        type="button"
                        onClick={() => setChannelFilter(ch)}
                        className={`flex items-center justify-center gap-1 py-1.5 px-1 rounded-lg font-bold transition relative cursor-pointer ${
                          active
                            ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs"
                            : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
                        }`}
                      >
                        {ch !== "todos" && <ChannelIcon channel={ch} size="sm" />}
                        <span>{labels[ch]}</span>
                        {unreads[ch] > 0 && (
                          <span className="h-1.5 w-1.5 rounded-full bg-rose-500 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Sub-Filter: Abiertos / Resueltos */}
                <div className="flex items-center justify-between text-[11px] px-1">
                  <div className="flex items-center gap-2">
                    {(["open", "resolved", "all"] as const).map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setStatusFilter(st)}
                        className={`font-semibold transition cursor-pointer ${
                          statusFilter === st
                            ? "text-primary font-bold border-b-2 border-primary pb-0.5"
                            : "text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
                        }`}
                      >
                        {st === "open" ? "Abiertos" : st === "resolved" ? "Resueltos" : "Todos"}
                      </button>
                    ))}
                  </div>
                  {unreadTotal > 0 && (
                    <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400">
                      {unreadTotal} sin leer
                    </span>
                  )}
                </div>
              </div>

              {/* Scrollable Conversation Items */}
              <div
                data-tour="crm-conversations-list"
                className="flex-1 overflow-y-auto overscroll-contain divide-y divide-slate-100 dark:divide-white/5"
              >
                {filteredConversations.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-400">
                    No hay conversaciones con estos filtros.
                  </div>
                ) : (
                  filteredConversations.map((c) => {
                    const sel = activeConversation?.id === c.id;
                    const ini = c.clientName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => {
                          setSelectedId(c.id);
                          setMobileActiveView("chat");
                          if (typeof window !== "undefined") {
                            window.scrollTo({ top: 0, behavior: "instant" });
                          }
                        }}
                        className={`w-full text-left p-3.5 flex items-start gap-3 transition cursor-pointer relative ${
                          sel
                            ? "bg-white dark:bg-white/10 shadow-xs ring-1 ring-slate-900/5 dark:ring-white/10"
                            : "hover:bg-slate-100/70 dark:hover:bg-white/5"
                        }`}
                      >
                        {/* Avatar */}
                        <div className="relative shrink-0">
                          <div
                            className="flex h-11 w-11 items-center justify-center rounded-2xl text-white font-black text-xs shadow-2xs"
                            style={{ backgroundColor: business.primaryColor || "#0f172a" }}
                          >
                            {ini}
                          </div>
                          <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-white dark:bg-[#121215] shadow-xs border border-slate-200/60 dark:border-white/10">
                            <ChannelIcon channel={c.channel} size="sm" />
                          </span>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1 mb-0.5">
                            <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                              {c.clientName}
                            </h4>
                            <span className="text-[10px] text-slate-400 shrink-0 font-medium">
                              {new Date(c.lastMessageTime).toLocaleTimeString("es-PY", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>

                          <div className="flex items-center justify-between gap-1">
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[170px]">
                              {c.lastMessage}
                            </p>
                            {c.unreadCount > 0 && (
                              <span className="flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-rose-500 text-[9.5px] font-extrabold text-white shrink-0">
                                {c.unreadCount}
                              </span>
                            )}
                          </div>

                          <div className="mt-1 flex items-center gap-1.5 text-[10px] text-slate-400 font-mono">
                            <span className="truncate">{c.channelIdentifier}</span>
                            {c.status === "resolved" && (
                              <span className="rounded bg-emerald-100 dark:bg-emerald-950/60 px-1 text-[9px] font-bold text-emerald-700 dark:text-emerald-300">
                                Resuelto
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

            {/* ── CENTER PANE: ACTIVE CHAT SCREEN ── */}
            <div
              data-tour="crm-chat-box"
              className={`flex-1 flex flex-col min-w-0 bg-[#f8fafc] dark:bg-[#0c0c0e] relative ${
                mobileActiveView !== "chat" ? "hidden lg:flex" : "flex h-full"
              }`}
            >
              {activeConversation ? (
                <>
                  {/* Chat Top Header */}
                  <div className="h-14 px-4 border-b border-slate-200/80 dark:border-white/10 bg-white/95 dark:bg-[#121215]/95 backdrop-blur-md flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <button
                        type="button"
                        onClick={() => {
                          setMobileActiveView("list");
                          if (typeof window !== "undefined") {
                            window.scrollTo({ top: 0, behavior: "instant" });
                          }
                        }}
                        className="lg:hidden -ml-1.5 p-1.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition shrink-0 cursor-pointer"
                        aria-label="Volver a lista"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>

                      <div className="relative shrink-0">
                        <div
                          className="flex h-9 w-9 items-center justify-center rounded-xl text-white font-bold text-xs shadow-xs"
                          style={{ backgroundColor: business.primaryColor || "#0f172a" }}
                        >
                          {activeConversation.clientName.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                        </div>
                        <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-white dark:bg-slate-900 shadow-2xs">
                          <ChannelIcon channel={activeConversation.channel} size="sm" />
                        </span>
                      </div>

                      <div className="min-w-0">
                        <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5 truncate">
                          <span className="truncate">{activeConversation.clientName}</span>
                          <span
                            className={`rounded-full border px-1.5 py-0.2 text-[8.5px] font-extrabold capitalize shrink-0 ${channelBadgeStyles(
                              activeConversation.channel
                            )}`}
                          >
                            {activeConversation.channel}
                          </span>
                        </h3>
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400 font-mono truncate">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold">En línea</span>
                          <span>·</span>
                          <span className="truncate">{activeConversation.channelIdentifier}</span>
                        </div>
                      </div>
                    </div>

                    {/* Right Action Icons in Chat Header */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <a
                        href={
                          activeConversation.channel === "whatsapp"
                            ? `https://wa.me/${activeConversation.channelIdentifier.replace(/[^0-9]/g, "")}`
                            : `tel:${activeConversation.channelIdentifier.replace(/[^0-9+]/g, "")}`
                        }
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:text-emerald-700 hover:bg-emerald-500/10 dark:hover:text-emerald-400 transition cursor-pointer"
                        title="Contactar directamente por WhatsApp"
                      >
                        <Phone className="h-4 w-4" />
                      </a>

                      {activeConversation.status === "resolved" ? (
                        <button
                          type="button"
                          onClick={() => reopenCrmConversation(activeConversation.id)}
                          className="rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 px-2.5 py-1.5 text-[11px] font-bold text-slate-700 dark:text-white transition cursor-pointer"
                        >
                          Reabrir
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => resolveCrmConversation(activeConversation.id)}
                          className="rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 hover:bg-emerald-100 px-2.5 py-1.5 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 transition cursor-pointer"
                        >
                          Resuelto
                        </button>
                      )}

                      {/* Desktop Toggle Profile Drawer / Mobile Open Profile View */}
                      <button
                        type="button"
                        onClick={() => {
                          if (window.innerWidth < 1024) {
                            setMobileActiveView("profile");
                          } else {
                            setDesktopProfileOpen(!desktopProfileOpen);
                          }
                        }}
                        className={`p-2 rounded-xl transition cursor-pointer ${
                          desktopProfileOpen
                            ? "bg-primary/10 text-primary"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
                        }`}
                        title="Ver ficha y acciones del cliente"
                      >
                        <User className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Messages Canvas */}
                  <div
                    ref={messagesContainerRef}
                    className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-5 space-y-3 bg-[#f8fafc] dark:bg-[#09090b]"
                  >
                    {/* Security Notice */}
                    <div className="text-center">
                      <span className="rounded-full bg-slate-200/60 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 px-3 py-1 text-[10px] font-semibold text-slate-500 dark:text-slate-400 inline-flex items-center gap-1">
                        <Shield className="h-3 w-3 text-emerald-500" />
                        <span>Conversación cifrada vía {activeConversation.channel}</span>
                      </span>
                    </div>

                    {/* Messages stream */}
                    {activeConversation.messages.map((m) => {
                      const isAgent = m.sender === "agent";
                      return (
                        <div key={m.id} className={`flex flex-col ${isAgent ? "items-end" : "items-start"}`}>
                          <div
                            className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-2.5 text-xs shadow-2xs leading-relaxed ${
                              isAgent
                                ? "text-white rounded-tr-xs"
                                : "bg-white dark:bg-[#1a1a22] text-slate-900 dark:text-white border border-slate-200/70 dark:border-white/5 rounded-tl-xs"
                            }`}
                            style={isAgent ? { backgroundColor: business.primaryColor || "#0f172a" } : undefined}
                          >
                            <p className="whitespace-pre-wrap">{m.text}</p>

                            {/* SIPAP Receipt Attachment */}
                            {m.receiptAttachment && (
                              <div className="mt-2.5 rounded-2xl border border-emerald-500/30 bg-emerald-50/90 dark:bg-emerald-950/50 p-3 text-slate-800 dark:text-slate-100 space-y-2">
                                <div className="flex items-center justify-between border-b border-emerald-500/20 pb-1.5">
                                  <div className="flex items-center gap-1.5 font-bold text-xs text-emerald-800 dark:text-emerald-300">
                                    <Building2 className="h-4 w-4 text-emerald-600" />
                                    <span>{m.receiptAttachment.bankOrigin}</span>
                                  </div>
                                  <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-[9.5px] font-extrabold text-emerald-700 dark:text-emerald-300">
                                    SIPAP
                                  </span>
                                </div>

                                <div className="flex items-baseline justify-between">
                                  <span className="text-[11px] text-slate-500 dark:text-slate-400">Monto Acreditado:</span>
                                  <span className="text-sm font-black text-slate-900 dark:text-white">
                                    {formatGs(m.receiptAttachment.amount)}
                                  </span>
                                </div>

                                <div className="flex items-center justify-between text-[10.5px] text-slate-500 dark:text-slate-400 font-mono">
                                  <span>Operación:</span>
                                  <span className="font-bold text-slate-800 dark:text-slate-200">
                                    {m.receiptAttachment.operationNumber}
                                  </span>
                                </div>

                                <div className="grid grid-cols-2 gap-1.5 pt-1 text-[10px]">
                                  <div className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-semibold bg-white/80 dark:bg-slate-900/60 rounded-lg p-1 border border-emerald-500/20">
                                    <QrCode className="h-3.5 w-3.5 text-emerald-600" />
                                    <span>QR Validado</span>
                                  </div>
                                  <div className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-semibold bg-white/80 dark:bg-slate-900/60 rounded-lg p-1 border border-emerald-500/20">
                                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                                    <span>OCR {m.receiptAttachment.ocrConfidence}%</span>
                                  </div>
                                </div>

                                <div className="pt-1">
                                  {m.receiptAttachment.status === "pending" ? (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setReceiptStatus(m.receiptAttachment!.receiptId, "approved");
                                        pushToast(
                                          "success",
                                          `Comprobante ${m.receiptAttachment!.operationNumber} de ${activeConversation.clientName} APROBADO.`
                                        );
                                      }}
                                      className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 text-[11px] transition shadow-xs cursor-pointer"
                                    >
                                      <CheckCircle2 className="h-3.5 w-3.5" />
                                      <span>Aprobar Transferencia SIPAP</span>
                                    </button>
                                  ) : (
                                    <div className="w-full py-1.5 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 font-bold text-[11px] flex items-center justify-center gap-1.5">
                                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                                      <span>Comprobante Aprobado & Turno Confirmado</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            <div
                              className={`mt-1 flex items-center justify-end gap-1 text-[9.5px] ${
                                isAgent ? "text-white/80" : "text-slate-400"
                              }`}
                            >
                              <span>
                                {new Date(m.timestamp).toLocaleTimeString("es-PY", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                              {isAgent && <CheckCheck className="h-3.5 w-3.5 text-sky-200" />}
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {/* Typing Bouncing Dots */}
                    {isTyping && (
                      <div className="flex flex-col items-start gap-1">
                        <div className="flex items-center gap-2.5 rounded-2xl bg-white dark:bg-[#1a1a22] text-slate-800 dark:text-slate-200 border border-slate-200/70 dark:border-white/5 px-4 py-2.5 text-xs shadow-2xs rounded-tl-xs">
                          <div className="flex items-center gap-1">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse [animation-delay:200ms]" />
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse [animation-delay:400ms]" />
                          </div>
                          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                            {typingSender} está escribiendo...
                          </span>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} className="h-1 shrink-0" />
                  </div>

                  {/* Quick Replies Carousel */}
                  <div className="px-3.5 py-1.5 border-t border-slate-200/70 dark:border-white/10 bg-white dark:bg-[#121215] flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 shrink-0 flex items-center gap-1 mr-1">
                      <Zap className="h-3 w-3 text-amber-500" />
                      <span>Rápidas:</span>
                    </span>
                    {quickReplies.map((qr) => (
                      <button
                        key={qr.title}
                        type="button"
                        onClick={() => {
                          setReplyText(qr.text);
                          inputRef.current?.focus();
                        }}
                        className="shrink-0 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-primary/10 hover:text-primary px-3 py-1 text-[11px] font-semibold text-slate-600 dark:text-slate-300 transition cursor-pointer"
                      >
                        {qr.title}
                      </button>
                    ))}
                  </div>

                  {/* Message Input Dock */}
                  <div className="p-2.5 sm:p-3 border-t border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#121215] flex items-center gap-2 shrink-0">
                    <input
                      ref={inputRef}
                      type="text"
                      placeholder={`Escribe un mensaje a ${activeConversation.clientName}...`}
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleSend();
                        }
                      }}
                      className="flex-1 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/70 dark:border-white/10 px-4 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                    <button
                      type="button"
                      onClick={handleSend}
                      disabled={!replyText.trim()}
                      style={replyText.trim() ? { backgroundColor: business.primaryColor || "#0f172a" } : undefined}
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-white transition shadow-xs cursor-pointer ${
                        replyText.trim() ? "hover:brightness-110 active:scale-95" : "bg-slate-300 dark:bg-slate-700 opacity-50 cursor-not-allowed"
                      }`}
                      aria-label="Enviar mensaje"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                  <MessageSquare className="h-12 w-12 text-slate-300 dark:text-slate-700 mb-3" />
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                    Seleccioná una conversación para chatear
                  </p>
                </div>
              )}
            </div>

            {/* ── RIGHT PANE: CLIENT INTELLIGENCE & ACTIONS DRAWER ── */}
            <div
              data-tour="crm-client-profile"
              className={`w-full lg:w-[290px] xl:w-[330px] shrink-0 border-l border-slate-200/80 dark:border-white/10 flex-col bg-white dark:bg-[#15151a] ${
                mobileActiveView === "profile"
                  ? "flex h-full"
                  : desktopProfileOpen
                  ? "hidden lg:flex"
                  : "hidden"
              }`}
            >
              {activeConversation ? (
                <>
                  {/* Right Header */}
                  <div className="h-14 px-4 border-b border-slate-200/80 dark:border-white/10 flex items-center justify-between shrink-0 bg-slate-50/50 dark:bg-[#15151a]">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setMobileActiveView("chat")}
                        className="lg:hidden p-1.5 rounded-xl text-slate-600 hover:bg-slate-100"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-white">
                        Ficha del Contacto
                      </h4>
                    </div>
                    <button
                      type="button"
                      onClick={() => setDesktopProfileOpen(false)}
                      className="hidden lg:flex p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                      title="Ocultar ficha"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Scrollable Profile Body */}
                  <div className="flex-1 overflow-y-auto overscroll-contain p-4 space-y-4">
                    {/* Contact Card */}
                    <div className="text-center pb-3 border-b border-slate-100 dark:border-white/10">
                      <div
                        className="mx-auto flex h-14 w-14 items-center justify-center rounded-3xl text-white font-black text-lg shadow-xs mb-2"
                        style={{ backgroundColor: business.primaryColor || "#0f172a" }}
                      >
                        {activeConversation.clientName.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                      </div>
                      <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                        {activeConversation.clientName}
                      </h3>
                      <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                        {activeConversation.channelIdentifier}
                      </p>
                      {linkedClient?.tags && (
                        <div className="mt-2 flex flex-wrap items-center justify-center gap-1">
                          {linkedClient.tags.map((t) => (
                            <span key={t} className="rounded-full bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5">
                              {t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-2">
                      <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                        Acciones Operativas:
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          router.push(`/dashboard/calendario?newForClient=${linkedClient?.id || ""}`);
                          pushToast("success", `Abriendo calendario para agendar a ${activeConversation.clientName}`);
                        }}
                        style={{ backgroundColor: business.primaryColor || "var(--primary, #FF4F2B)" }}
                        className="w-full flex items-center justify-center gap-2 rounded-2xl text-white py-2.5 text-xs font-bold shadow-xs transition cursor-pointer hover:brightness-110 active:scale-98"
                      >
                        <Calendar className="h-4 w-4" />
                        <span>Agendar Turno</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setOrderModalOpen(true)}
                        className="w-full flex items-center justify-center gap-2 rounded-2xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 text-white py-2.5 text-xs font-bold shadow-xs transition cursor-pointer active:scale-98"
                      >
                        <ShoppingBag className="h-4 w-4" />
                        <span>Crear Pedido de Producto</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setClientProfileModalOpen(true)}
                        className="w-full flex items-center justify-center gap-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 transition cursor-pointer"
                      >
                        <User className="h-3.5 w-3.5" />
                        <span>Ver Ficha Completa</span>
                      </button>
                    </div>

                    {/* Active Channel Card */}
                    <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-white/10">
                      <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Canal Activo:</p>
                      <div className="flex items-center justify-between text-xs p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-white/5">
                        <div className="flex items-center gap-2">
                          <ChannelIcon channel={activeConversation.channel} size="sm" />
                          <span className="font-semibold text-slate-800 dark:text-slate-200 capitalize">
                            {activeConversation.channel}
                          </span>
                        </div>
                        <span className="text-[10px] text-emerald-600 font-bold">Conectado</span>
                      </div>
                    </div>

                    {/* Loyalty Info */}
                    {linkedClient && (
                      <div className="p-3 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/40 space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1">
                            <Award className="h-3.5 w-3.5 text-amber-500" /> Fidelización:
                          </span>
                          <span className="font-mono font-black text-amber-800 dark:text-amber-200">
                            {linkedClient.loyaltyPoints} / 5 sellos
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400">
                          <span>Consumo total:</span>
                          <span className="font-bold text-slate-900 dark:text-white">
                            {formatGs(linkedClient.totalSpent)}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Order History */}
                    {clientOrderHistory.length > 0 && (
                      <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-white/10">
                        <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1">
                          <History className="h-3 w-3" /> Últimos Pedidos:
                        </p>
                        {clientOrderHistory.slice(0, 3).map((o) => (
                          <div key={o.id} className="flex items-center justify-between text-[11px] p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                            <div>
                              <span className="font-bold text-slate-800 dark:text-slate-200">{o.orderNumber}</span>
                              <span className="ml-1.5 text-[9.5px] font-semibold text-slate-400 capitalize">{o.status}</span>
                            </div>
                            <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{formatGs(o.totalAmount)}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* SIPAP Transfers History */}
                    {clientReceipts.length > 0 && (
                      <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-white/10">
                        <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1">
                          <Building2 className="h-3 w-3 text-emerald-500" /> Transferencias SIPAP:
                        </p>
                        {clientReceipts.map((r) => (
                          <div key={r.id} className="flex items-center justify-between text-[11px] p-2 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-500/20">
                            <div>
                              <span className="font-bold text-slate-800 dark:text-slate-200 block">{r.bankOrigin || "Banco Itaú"}</span>
                              <span className="text-[10px] text-slate-400 font-mono">{r.operationNumber || "SIPAP"}</span>
                            </div>
                            <div className="text-right">
                              <span className="font-mono font-bold text-slate-900 dark:text-white block">{formatGs(r.amount)}</span>
                              <span className={`text-[9.5px] font-bold ${r.status === "approved" ? "text-emerald-600" : "text-amber-600"}`}>
                                {r.status === "approved" ? "Aprobado" : "Pendiente"}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="p-6 text-center text-xs text-slate-400">
                  Seleccioná un chat para ver su ficha.
                </div>
              )}
            </div>
          </div>
        )
      )}

      {/* ═══ VIEW 2: TELEMETRY & METRICS TAB ═══ */}
      {mainSection === "metricas" && (
        <div className="space-y-4 animate-in fade-in-50 duration-150">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Card 1: Eficiencia de Respuesta & Canales */}
            <div className="rounded-3xl bg-white dark:bg-[#121215] border border-slate-200/80 dark:border-white/10 p-5 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/10">
                <div className="flex items-center gap-2.5">
                  <div
                    className="flex h-9 w-9 items-center justify-center rounded-xl text-white font-bold"
                    style={{ backgroundColor: business.primaryColor || "var(--primary, #FF4F2B)" }}
                  >
                    <MessageSquare className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                      Telemetría de Mensajería & Eficiencia
                    </h3>
                    <p className="text-[11px] text-slate-400">Bandeja centralizada y tiempos de respuesta</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[11px] font-bold text-slate-400 block">Total Chats</span>
                  <span className="text-sm font-black text-slate-900 dark:text-white font-mono">
                    {crmConversations.length} conversaciones
                  </span>
                </div>
              </div>

              {/* Circular Gauges */}
              <div className="py-4 grid grid-cols-2 gap-4">
                {/* Gauge 1: Resolution Rate */}
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/50 dark:border-white/5">
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
                        strokeDashoffset={113 - (113 * Math.min(100, Math.max(0, resolutionPct))) / 100}
                        strokeLinecap="round"
                        className="transition-all duration-700"
                      />
                    </svg>
                    <span className="absolute text-[10px] font-black text-slate-800 dark:text-white font-mono">
                      {resolutionPct}%
                    </span>
                  </div>
                  <div className="min-w-0">
                    <span className="text-[11px] font-bold text-slate-900 dark:text-white block truncate">
                      Tasa Resolución
                    </span>
                    <span className="text-[10px] text-slate-400 block truncate">
                      {resolvedCount} de {crmConversations.length} cerrados
                    </span>
                  </div>
                </div>

                {/* Gauge 2: WhatsApp Share */}
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/50 dark:border-white/5">
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
                        strokeDashoffset={113 - (113 * Math.min(100, Math.max(0, waSharePct))) / 100}
                        strokeLinecap="round"
                        className="transition-all duration-700"
                      />
                    </svg>
                    <span className="absolute text-[10px] font-black text-slate-800 dark:text-white font-mono">
                      {waSharePct}%
                    </span>
                  </div>
                  <div className="min-w-0">
                    <span className="text-[11px] font-bold text-slate-900 dark:text-white block truncate">
                      Vía WhatsApp
                    </span>
                    <span className="text-[10px] text-slate-400 block truncate">
                      {waCount} mensajes vía WA
                    </span>
                  </div>
                </div>
              </div>

              {/* Telemetry Rows */}
              <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100 dark:border-white/10 text-xs">
                <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-white/5">
                  <span className="text-[10px] font-medium text-slate-400 block">En Espera</span>
                  <span className="text-xs font-black text-slate-900 dark:text-white font-mono">
                    {openCount} abiertos
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-white/5">
                  <span className="text-[10px] font-medium text-slate-400 block">Sin Leer</span>
                  <span className={`text-xs font-black font-mono ${unreadTotal > 0 ? "text-rose-500" : "text-slate-900 dark:text-white"}`}>
                    {unreadTotal} mensajes
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-white/5">
                  <span className="text-[10px] font-medium text-slate-400 block">Tiempo Medio</span>
                  <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 font-mono truncate block">
                    ~3 minutos
                  </span>
                </div>
              </div>
            </div>

            {/* Card 2: Seguridad, Conexión & Pedidos */}
            <div className="rounded-3xl bg-white dark:bg-[#121215] border border-slate-200/80 dark:border-white/10 p-5 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/10">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 font-bold">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                      Protección Anti-Baneo & Seguridad
                    </h3>
                    <p className="text-[11px] text-slate-400">Cadencia humana y protección de cuenta</p>
                  </div>
                </div>

                {pendingOrdersCount > 0 && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                    <ShoppingBag className="h-3 w-3" />
                    <span>{pendingOrdersCount} pedidos</span>
                  </span>
                )}
              </div>

              {/* Anti-Ban Banner */}
              <div className="py-3">
                <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2.5">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 block truncate">
                      Cadencia Humana Anti-Baneo Activa (10s - 20s)
                    </span>
                    <span className="text-[10px] text-emerald-600/90 dark:text-emerald-400/90 block">
                      Simulación de lectura y escritura automática para proteger tu línea de suspensiones.
                    </span>
                  </div>
                </div>
              </div>

              {/* Operational Status Rows */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-white/10 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-white/5 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-medium text-slate-400 block">Bot Asistente</span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {evolutionConfig.autoBotEnabled ? "Activo (Respuesta IA)" : "Modo Manual"}
                    </span>
                  </div>
                  <Bot className={`h-4 w-4 ${evolutionConfig.autoBotEnabled ? "text-emerald-500" : "text-slate-400"}`} />
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-white/5 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-medium text-slate-400 block">Estado de Red</span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {evolutionConfig.connected ? "En línea" : "Desconectado"}
                    </span>
                  </div>
                  <ShieldCheck className={`h-4 w-4 ${evolutionConfig.connected ? "text-emerald-500" : "text-slate-400"}`} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══ VIEW 3: ORDERS TAB ═══ */}
      {mainSection === "pedidos" && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Card className="p-4 flex items-center justify-between">
              <div><p className="text-xs font-semibold text-slate-500">Total Pedidos</p><p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{productOrders.length}</p></div>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary"><ShoppingBag className="h-5 w-5" /></div>
            </Card>
            <Card className="p-4 flex items-center justify-between">
              <div><p className="text-xs font-semibold text-slate-500">Pendientes</p><p className="text-2xl font-black text-amber-600 mt-1">{pendingOrdersCount}</p></div>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600"><Clock className="h-5 w-5" /></div>
            </Card>
            <Card className="p-4 flex items-center justify-between">
              <div><p className="text-xs font-semibold text-slate-500">Facturado</p><p className="text-2xl font-black text-emerald-600 mt-1 font-mono">{formatGs(totalOrderRevenue)}</p></div>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600"><CreditCard className="h-5 w-5" /></div>
            </Card>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {([ { id: "all", label: "Todos", count: productOrders.length }, { id: "pending", label: "Pendientes", count: pendingOrdersCount }, { id: "confirmed", label: "Confirmados", count: productOrders.filter((o) => o.status === "confirmed").length }, { id: "delivered", label: "Entregados", count: productOrders.filter((o) => o.status === "delivered").length }, { id: "cancelled", label: "Cancelados", count: productOrders.filter((o) => o.status === "cancelled").length } ] as const).map((tab) => (
                <button key={tab.id} type="button" onClick={() => setOrderStatusFilter(tab.id as any)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${orderStatusFilter === tab.id ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs" : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 border border-slate-200/60 dark:border-white/5"}`}>
                  <span>{tab.label}</span><span className="text-[10px] opacity-75">({tab.count})</span>
                </button>
              ))}
            </div>
            <div className="relative sm:w-72">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input type="text" placeholder="Buscar pedido..." value={orderSearch} onChange={(e) => setOrderSearch(e.target.value)} className="w-full rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-white/10 pl-9 pr-3 py-2 text-xs text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/40" />
            </div>
          </div>
          {filteredOrders.length === 0 ? (
            <Card className="p-12 text-center"><ShoppingBag className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-600 mb-3" /><h3 className="text-base font-bold text-slate-800 dark:text-slate-200">Sin pedidos</h3></Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredOrders.map((ord) => {
                const isPending = ord.status === "pending"; const isConfirmed = ord.status === "confirmed"; const isDelivered = ord.status === "delivered"; const isCancelled = ord.status === "cancelled";
                return (
                  <Card key={ord.id} className="p-4 flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-black text-slate-900 dark:text-white">{ord.orderNumber}</span>
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold capitalize ${isPending ? "bg-amber-100 text-amber-800" : isConfirmed ? "bg-blue-100 text-blue-800" : isDelivered ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"}`}>{ord.status === "delivered" ? "Entregado" : ord.status === "pending" ? "Pendiente" : ord.status === "confirmed" ? "Confirmado" : "Cancelado"}</span>
                      </div>
                      <div className="mt-2"><p className="text-sm font-bold text-slate-900 dark:text-white">{ord.clientName}</p><p className="text-xs text-slate-500 font-mono">{ord.clientPhone}</p></div>
                      <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-500">
                        {ord.deliveryType === "retirar_en_local" ? <span className="flex items-center gap-1"><Store className="h-3.5 w-3.5 text-emerald-500" /> Retiro</span> : <span className="flex items-center gap-1"><Truck className="h-3.5 w-3.5 text-indigo-500" /> Delivery</span>}
                        <span>·</span><span className="capitalize">{ord.paymentMethod}</span>
                      </div>
                      <div className="mt-3 divide-y divide-slate-100 dark:divide-white/5 border-t border-slate-100 dark:border-white/5 pt-2 text-xs space-y-1.5">
                        {ord.items.map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between pt-1">
                            <span className="font-bold text-slate-800 dark:text-slate-200">{item.qty}x {item.productName}</span>
                            <span className="font-mono text-slate-600 dark:text-slate-400 font-semibold">{formatGs(item.unitPrice * item.qty)}</span>
                          </div>
                        ))}
                      </div>
                      {ord.notes && <p className="mt-2 text-[11px] text-slate-500 italic bg-amber-500/5 border border-amber-500/10 p-2 rounded-lg">{ord.notes}</p>}
                    </div>
                    <div className="pt-3 border-t border-slate-100 dark:border-white/5 space-y-2.5">
                      <div className="flex items-baseline justify-between"><span className="text-xs text-slate-500">Total:</span><span className="text-base font-black text-slate-900 dark:text-white font-mono">{formatGs(ord.totalAmount)}</span></div>
                      <div className="flex items-center gap-1.5">
                        {isPending && <button type="button" onClick={() => { updateProductOrderStatus(ord.id, "confirmed"); pushToast("success", `${ord.orderNumber} confirmado`); }} className="flex-1 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold py-1.5 text-xs transition cursor-pointer">Confirmar</button>}
                        {(isPending || isConfirmed) && <button type="button" onClick={() => { updateProductOrderStatus(ord.id, "delivered"); pushToast("success", `${ord.orderNumber} entregado y registrado en caja`); }} className="flex-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-1.5 text-xs transition cursor-pointer flex items-center justify-center gap-1"><Check className="h-3.5 w-3.5" /><span>Entregado</span></button>}
                        {!isCancelled && !isDelivered && <button type="button" onClick={() => { updateProductOrderStatus(ord.id, "cancelled"); pushToast("error", `${ord.orderNumber} cancelado`); }} className="rounded-xl border border-slate-200 dark:border-white/10 px-2.5 py-1.5 text-xs text-slate-500 hover:text-rose-500 transition cursor-pointer">Cancelar</button>}
                        {isDelivered && <span className="w-full text-center text-xs font-bold text-emerald-600 dark:text-emerald-400 py-1 bg-emerald-500/10 rounded-xl flex items-center justify-center gap-1"><CheckCircle2 className="h-4 w-4" /><span>Completado y en Caja</span></span>}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ═══ CHANNELS CONNECTION MODAL (WhatsApp + Instagram + Facebook) ═══ */}
      <Modal open={channelsModalOpen} onClose={() => setChannelsModalOpen(false)} title="Conectar Canales de Mensajería" maxWidth="max-w-3xl">
        <div className="space-y-5 text-xs">
          {/* 3 Channel Tabs */}
          <div className="grid grid-cols-3 gap-2 p-1.5 bg-slate-100 dark:bg-slate-800 rounded-2xl">
            {([
              { key: "whatsapp" as const, label: "WhatsApp", channel: "whatsapp" as const, isConnected: evolutionConfig.connected },
              { key: "instagram" as const, label: "Instagram", channel: "instagram" as const, isConnected: Boolean(evolutionConfig.instagramConnected) },
              { key: "facebook" as const, label: "Facebook", channel: "messenger" as const, isConnected: Boolean(evolutionConfig.messengerConnected) },
            ]).map((ch) => (
              <button
                key={ch.key}
                type="button"
                onClick={() => setChannelsTab(ch.key)}
                className={`py-2.5 text-center rounded-xl font-bold transition cursor-pointer flex items-center justify-center gap-2 ${
                  channelsTab === ch.key
                    ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs"
                    : "text-slate-500 hover:text-slate-800 dark:hover:text-white"
                }`}
              >
                <div className="relative flex items-center justify-center">
                  <ChannelIcon channel={ch.channel} size="sm" />
                  {ch.isConnected && (
                    <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-emerald-500 border border-white dark:border-slate-800" />
                  )}
                </div>
                <span className="text-xs">{ch.label}</span>
                {ch.isConnected && (
                  <span className="text-[9px] bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 font-extrabold px-1.5 py-0.5 rounded-full hidden sm:inline-block">
                    Conectado
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Unified Consistent Height Container — Dimensions do NOT vary between channels */}
          <div className="min-h-[360px] flex flex-col justify-between">
            {channelsTab === "whatsapp" && (
              <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200/80 dark:border-white/10 grid grid-cols-1 md:grid-cols-12 gap-6 items-center min-h-[350px]">
                {/* Left: QR Section */}
                <div className="md:col-span-5 flex flex-col items-center justify-center">
                  <div className="relative w-48 h-48 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-white/10 flex items-center justify-center p-3">
                    <div className="relative w-full h-full bg-white rounded-xl flex items-center justify-center p-1 overflow-hidden border border-slate-100">
                      {qrCodeDataUrl ? (
                        <img
                          src={qrCodeDataUrl}
                          alt="Código QR WhatsApp"
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center gap-2 text-slate-400">
                          <RefreshCw className="h-6 w-6 animate-spin text-emerald-500" />
                          <span className="text-[10px] font-medium">Generando QR...</span>
                        </div>
                      )}
                      {/* WhatsApp center badge */}
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="p-1 rounded-full bg-white shadow-md border border-slate-100">
                          <ChannelIcon channel="whatsapp" size="md" />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                    <RefreshCw className="h-3.5 w-3.5 animate-spin text-emerald-500" />
                    <span>Actualiza en {qrCounter}s</span>
                  </div>
                </div>

                {/* Right: Instructions & Action */}
                <div className="md:col-span-7 flex flex-col justify-between space-y-4">
                  <div>
                    <h5 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                      <Smartphone className="h-4 w-4 text-emerald-600" />
                      <span>Vincular WhatsApp de tu Negocio</span>
                    </h5>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Conectá tu línea para recibir y responder las consultas de tus clientes desde tu panel.
                    </p>
                  </div>

                  <ol className="space-y-2.5 text-slate-600 dark:text-slate-300 text-xs">
                    <li className="flex items-start gap-2.5">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-[10px]">1</span>
                      <span>Abrí <strong>WhatsApp</strong> en tu teléfono celular.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-[10px]">2</span>
                      <span>Andá a <strong>Ajustes → Dispositivos Vinculados</strong>.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-[10px]">3</span>
                      <span>Tocá <strong>Vincular un dispositivo</strong> y apuntá al código QR.</span>
                    </li>
                  </ol>

                  {evolutionConfig.connected ? (
                    <div className="flex items-center justify-between p-3.5 rounded-2xl bg-emerald-100/80 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        <span className="font-bold text-emerald-800 dark:text-emerald-300 text-xs">
                          Línea vinculada: {evolutionConfig.phoneNumber || business.phone || "+595 981 765 432"}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          updateEvolutionConfig({ connected: false, phoneNumber: "" });
                          pushToast("error", "WhatsApp desconectado.");
                        }}
                        className="text-xs font-bold text-rose-600 hover:underline cursor-pointer"
                      >
                        Desconectar
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/40">
                      <span className="text-amber-800 dark:text-amber-300 font-medium text-xs">
                        Esperando escaneo desde la app...
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          updateEvolutionConfig({
                            connected: true,
                            phoneNumber: business.phone || "+595 981 765 432",
                            lastSync: new Date().toISOString(),
                          });
                          pushToast("success", "WhatsApp vinculado correctamente.");
                        }}
                        className="rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 text-xs transition cursor-pointer shrink-0 shadow-xs"
                      >
                        Simular Vinculación
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {channelsTab === "instagram" && (
              <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200/80 dark:border-white/10 grid grid-cols-1 md:grid-cols-12 gap-6 items-center min-h-[350px]">
                {/* Left: Branded Visual Card matching WhatsApp QR size */}
                <div className="md:col-span-5 flex flex-col items-center justify-center">
                  <div className="w-48 h-48 rounded-2xl bg-gradient-to-tr from-amber-400 via-pink-500 to-purple-600 p-5 flex flex-col items-center justify-center text-white text-center shadow-sm">
                    <ChannelIcon channel="instagram" size="lg" />
                    <span className="font-extrabold text-sm mt-3">Instagram Direct</span>
                    <span className="text-[10px] text-white/80 font-medium">Bandeja Profesional</span>
                  </div>
                  <div className="mt-3 flex items-center gap-1.5 text-[11px] font-medium">
                    <span className={`h-2 w-2 rounded-full ${evolutionConfig.instagramConnected ? "bg-emerald-500 animate-pulse" : "bg-slate-300 dark:bg-slate-600"}`} />
                    <span className={evolutionConfig.instagramConnected ? "text-emerald-600 dark:text-emerald-400 font-bold" : "text-slate-500 dark:text-slate-400"}>
                      {evolutionConfig.instagramConnected ? `Conectado (${evolutionConfig.instagramHandle || "@barberia_central"})` : "Listo para conectar"}
                    </span>
                  </div>
                </div>

                {/* Right: Instructions & Action */}
                <div className="md:col-span-7 flex flex-col justify-between space-y-4">
                  <div>
                    <h5 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                      <ChannelIcon channel="instagram" size="sm" />
                      <span>Conectar Instagram Direct</span>
                    </h5>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Centralizá los mensajes directos de tus clientes en la misma bandeja unificada.
                    </p>
                  </div>

                  <ol className="space-y-2.5 text-slate-600 dark:text-slate-300 text-xs">
                    <li className="flex items-start gap-2.5">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-pink-100 dark:bg-pink-950 text-pink-700 dark:text-pink-300 font-bold text-[10px]">1</span>
                      <span>Convertí tu cuenta a <strong>Cuenta Profesional</strong> en Instagram.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-pink-100 dark:bg-pink-950 text-pink-700 dark:text-pink-300 font-bold text-[10px]">2</span>
                      <span>Vinculá tu cuenta a la <strong>Página de Facebook</strong> del negocio.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-pink-100 dark:bg-pink-950 text-pink-700 dark:text-pink-300 font-bold text-[10px]">3</span>
                      <span>Autorizá el acceso para recibir mensajes directamente en AgendatePY.</span>
                    </li>
                  </ol>

                  {evolutionConfig.instagramConnected ? (
                    <div className="flex items-center justify-between p-3.5 rounded-2xl bg-emerald-100/80 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        <span className="font-bold text-emerald-800 dark:text-emerald-300 text-xs">
                          Cuenta vinculada: {evolutionConfig.instagramHandle || "@barberia_central"}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          updateEvolutionConfig({ instagramConnected: false });
                          pushToast("error", "Instagram Direct desconectado.");
                        }}
                        className="text-xs font-bold text-rose-600 hover:underline cursor-pointer"
                      >
                        Desconectar
                      </button>
                    </div>
                  ) : (
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          updateEvolutionConfig({
                            instagramConnected: true,
                            instagramHandle: "@barberia_central",
                          });
                          pushToast("success", "Instagram Direct vinculado exitosamente.");
                        }}
                        className="w-full rounded-xl bg-[#E1306C] hover:bg-[#d02560] text-white font-bold py-3 text-xs shadow-xs transition cursor-pointer flex items-center justify-center gap-2"
                      >
                        <ChannelIcon channel="instagram" size="sm" />
                        <span>Autorizar Instagram Direct (@barberia_central)</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {channelsTab === "facebook" && (
              <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200/80 dark:border-white/10 grid grid-cols-1 md:grid-cols-12 gap-6 items-center min-h-[350px]">
                {/* Left: Branded Visual Card matching WhatsApp QR size */}
                <div className="md:col-span-5 flex flex-col items-center justify-center">
                  <div className="w-48 h-48 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 p-5 flex flex-col items-center justify-center text-white text-center shadow-sm">
                    <ChannelIcon channel="messenger" size="lg" />
                    <span className="font-extrabold text-sm mt-3">Facebook Messenger</span>
                    <span className="text-[10px] text-white/80 font-medium">Página Comercial</span>
                  </div>
                  <div className="mt-3 flex items-center gap-1.5 text-[11px] font-medium">
                    <span className={`h-2 w-2 rounded-full ${evolutionConfig.messengerConnected ? "bg-emerald-500 animate-pulse" : "bg-slate-300 dark:bg-slate-600"}`} />
                    <span className={evolutionConfig.messengerConnected ? "text-emerald-600 dark:text-emerald-400 font-bold" : "text-slate-500 dark:text-slate-400"}>
                      {evolutionConfig.messengerConnected ? `Conectado (${evolutionConfig.messengerPage || "Barbería & Studio Central"})` : "Listo para conectar"}
                    </span>
                  </div>
                </div>

                {/* Right: Instructions & Action */}
                <div className="md:col-span-7 flex flex-col justify-between space-y-4">
                  <div>
                    <h5 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                      <ChannelIcon channel="messenger" size="sm" />
                      <span>Conectar Facebook Messenger</span>
                    </h5>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Gestioná consultas y citas que tus clientes envían a la página de tu negocio.
                    </p>
                  </div>

                  <ol className="space-y-2.5 text-slate-600 dark:text-slate-300 text-xs">
                    <li className="flex items-start gap-2.5">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold text-[10px]">1</span>
                      <span>Asegurate de ser <strong>administrador</strong> de la Página de Facebook.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold text-[10px]">2</span>
                      <span>Hacé clic en Conectar y seleccioná tu Página de Facebook.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold text-[10px]">3</span>
                      <span>Otorgá permisos de mensajería y la vinculación quedará lista.</span>
                    </li>
                  </ol>

                  {evolutionConfig.messengerConnected ? (
                    <div className="flex items-center justify-between p-3.5 rounded-2xl bg-blue-100/80 dark:bg-blue-950/60 border border-blue-300 dark:border-blue-800">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-blue-600" />
                        <span className="font-bold text-blue-800 dark:text-blue-300 text-xs">
                          Página vinculada: {evolutionConfig.messengerPage || "Barbería & Studio Central"}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          updateEvolutionConfig({ messengerConnected: false });
                          pushToast("error", "Facebook Messenger desconectado.");
                        }}
                        className="text-xs font-bold text-rose-600 hover:underline cursor-pointer"
                      >
                        Desconectar
                      </button>
                    </div>
                  ) : (
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          updateEvolutionConfig({
                            messengerConnected: true,
                            messengerPage: "Barbería & Studio Central",
                          });
                          pushToast("success", "Facebook Messenger vinculado exitosamente.");
                        }}
                        className="w-full rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 text-xs shadow-sm transition cursor-pointer flex items-center justify-center gap-2"
                      >
                        <ChannelIcon channel="messenger" size="sm" />
                        <span>Conectar Facebook Messenger</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-200 dark:border-white/10 flex justify-end">
            <button
              type="button"
              onClick={() => setChannelsModalOpen(false)}
              className="rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold px-5 py-2 hover:opacity-90 transition cursor-pointer text-xs"
            >
              Listo
            </button>
          </div>
        </div>
      </Modal>

      {/* ═══ CLIENT PROFILE MODAL ═══ */}
      <Modal open={clientProfileModalOpen} onClose={() => setClientProfileModalOpen(false)} title={`Ficha de ${activeConversation?.clientName || "Cliente"}`}>
        <div className="space-y-4 text-xs">
          {activeConversation && (
            <>
              <div className="text-center pb-4 border-b border-slate-100 dark:border-white/10">
                <div
                  className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl text-white font-black text-xl shadow-md mb-3"
                  style={{ backgroundColor: business.primaryColor || "var(--primary, #FF4F2B)" }}
                >
                  {activeConversation.clientName.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                </div>
                <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">{activeConversation.clientName}</h3>
                <p className="text-sm text-slate-500 font-mono">{activeConversation.channelIdentifier}</p>
                {linkedClient && (
                  <div className="mt-2 space-y-1">
                    {linkedClient.email && <p className="text-xs text-slate-400">{linkedClient.email}</p>}
                    {linkedClient.tags.length > 0 && <div className="flex flex-wrap items-center justify-center gap-1 mt-2">{linkedClient.tags.map((t) => <span key={t} className="rounded-full bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5">{t}</span>)}</div>}
                  </div>
                )}
              </div>

              {/* Stats */}
              {linkedClient && (
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-center"><p className="text-lg font-black text-slate-900 dark:text-white">{linkedClient.totalVisits}</p><p className="text-[10px] text-slate-500 font-bold">Visitas</p></div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-center"><p className="text-lg font-black text-emerald-600 font-mono">{formatGs(linkedClient.totalSpent)}</p><p className="text-[10px] text-slate-500 font-bold">Consumo Total</p></div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-center"><p className="text-lg font-black text-amber-600">{linkedClient.loyaltyPoints}</p><p className="text-[10px] text-slate-500 font-bold">Sellos</p></div>
                </div>
              )}

              {/* Notes / Formula */}
              {linkedClient?.formula && (
                <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">
                  <p className="text-[10px] font-black uppercase tracking-wider text-primary mb-1">Ficha Técnica / Preferencias:</p>
                  <p className="text-xs text-slate-900 dark:text-slate-200">{linkedClient.formula}</p>
                </div>
              )}
              {linkedClient?.notes && (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-white/5">
                  <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">Notas:</p>
                  <p className="text-xs text-slate-700 dark:text-slate-300">{linkedClient.notes}</p>
                </div>
              )}

              {/* Order History */}
              <div className="space-y-2">
                <p className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5"><History className="h-4 w-4 text-primary" /> Historial de Pedidos</p>
                {clientOrderHistory.length === 0 ? (
                  <p className="text-xs text-slate-400 p-3 text-center bg-slate-50 dark:bg-slate-800/40 rounded-xl">Este cliente no tiene pedidos registrados aún.</p>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {clientOrderHistory.map((o) => (
                      <div key={o.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-white/5 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-slate-900 dark:text-white">{o.orderNumber}</span>
                            <span className={`rounded-full px-2 py-0.5 text-[9px] font-extrabold capitalize ${o.status === "delivered" ? "bg-emerald-100 text-emerald-700" : o.status === "pending" ? "bg-amber-100 text-amber-700" : o.status === "confirmed" ? "bg-blue-100 text-blue-700" : "bg-rose-100 text-rose-700"}`}>{o.status === "delivered" ? "Entregado" : o.status === "pending" ? "Pendiente" : o.status === "confirmed" ? "Confirmado" : "Cancelado"}</span>
                          </div>
                          <span className="font-mono font-black text-sm text-slate-900 dark:text-white">{formatGs(o.totalAmount)}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 space-y-0.5">
                          {o.items.map((item, i) => <p key={i}>{item.qty}x {item.productName} · {formatGs(item.unitPrice * item.qty)}</p>)}
                        </div>
                        <p className="text-[10px] text-slate-400">{new Date(o.createdAt).toLocaleDateString("es-PY", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
          <div className="pt-3 border-t border-slate-200 dark:border-white/10 flex justify-end">
            <button type="button" onClick={() => setClientProfileModalOpen(false)} className="rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold px-4 py-2 hover:opacity-90 transition cursor-pointer">Cerrar</button>
          </div>
        </div>
      </Modal>

      {/* ═══ ORDER CREATION MODAL ═══ */}
      <Modal open={orderModalOpen} onClose={() => setOrderModalOpen(false)} title={`Crear Pedido · ${activeConversation?.clientName || "Cliente"}`}>
        <div className="space-y-4 text-xs">
          <div className="rounded-2xl bg-primary/10 border border-primary/20 p-3.5">
            <p className="text-slate-800 dark:text-slate-200 leading-relaxed font-medium">El pedido se vincula a <strong>{activeConversation?.clientName}</strong> y se enviará una confirmación automática por chat.</p>
          </div>
          <div><label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Producto:</label><CustomSelect value={orderProductId} onChange={(val) => setOrderProductId(val)} options={productOptions} /></div>
          <div className="grid grid-cols-2 gap-3 items-center">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Cantidad:</label>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => setOrderQty((q) => Math.max(1, q - 1))} className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 font-bold hover:bg-slate-200 transition cursor-pointer">-</button>
                <span className="w-10 text-center font-mono font-bold text-sm">{orderQty}</span>
                <button type="button" onClick={() => setOrderQty((q) => q + 1)} className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 font-bold hover:bg-slate-200 transition cursor-pointer">+</button>
              </div>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-white/5 text-right">
              <span className="text-[10px] text-slate-400 block font-bold">Total:</span>
              <span className="text-lg font-black text-emerald-600 dark:text-emerald-400 font-mono">{formatGs(orderTotal)}</span>
            </div>
          </div>
          <div><label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Entrega:</label><CustomSelect value={orderDelivery} onChange={(val) => setOrderDelivery(val as any)} options={deliveryOptions} /></div>
          <div><label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Pago:</label><CustomSelect value={orderPayment} onChange={(val) => setOrderPayment(val as any)} options={paymentOptions} /></div>
          <div><label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Notas (Opcional):</label><textarea rows={2} value={orderNotes} onChange={(e) => setOrderNotes(e.target.value)} placeholder="Ej: Retira el jueves con Marcos..." className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 p-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/40" /></div>
          <div className="pt-3 border-t border-slate-200 dark:border-white/10 flex items-center justify-end gap-2">
            <button type="button" onClick={() => setOrderModalOpen(false)} className="rounded-xl border border-slate-200 dark:border-white/10 px-4 py-2 font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 transition cursor-pointer">Cancelar</button>
            <button type="button" onClick={handleCreateOrderSubmit} className="rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 shadow-sm transition cursor-pointer flex items-center gap-1.5"><Check className="h-4 w-4" /><span>Confirmar Pedido</span></button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
