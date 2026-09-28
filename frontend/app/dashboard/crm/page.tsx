"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
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
  Plus,
  RefreshCw,
  Phone,
  CreditCard,
  X,
  CheckCircle2,
  ShoppingBag,
  Tag,
  Truck,
  Store,
  AlertCircle,
  QrCode,
  Smartphone,
  Bot,
  Sparkles,
  Trash2,
  HelpCircle,
  Info,
  Copy,
  ChevronRight,
  Shield,
  Radio,
} from "lucide-react";
import { useDashboardStore } from "@/store/useDashboardStore";
import Card from "@/components/dashboard/ui/Card";
import Modal from "@/components/dashboard/ui/Modal";
import CustomSelect, { CustomSelectOption } from "@/components/dashboard/ui/CustomSelect";
import { formatGs } from "@/lib/dashboard-dates";
import type { CrmChannel, CrmConversation, ProductOrderStatus } from "@/lib/dashboard-types";

// Official vector channel icons / badges
function ChannelIcon({ channel, size = "md" }: { channel: CrmChannel; size?: "sm" | "md" | "lg" }) {
  const dim = size === "sm" ? "h-3.5 w-3.5" : size === "lg" ? "h-6 w-6" : "h-4 w-4";

  if (channel === "whatsapp") {
    return (
      <svg className={`${dim} text-emerald-500 fill-current`} viewBox="0 0 24 24">
        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
      </svg>
    );
  }

  if (channel === "instagram") {
    return (
      <svg className={`${dim} text-pink-500 fill-current`} viewBox="0 0 24 24">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
      </svg>
    );
  }

  // Messenger
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
      return "bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/50 dark:to-pink-950/50 text-pink-700 dark:text-pink-300 border-pink-200 dark:border-pink-800/50";
    case "messenger":
      return "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800/50";
  }
}

export default function CrmOmnichannelPage() {
  const {
    crmConversations,
    clients,
    products,
    business,
    evolutionConfig,
    updateEvolutionConfig,
    loadDemoConversation,
    clearCrmConversations,
    createOrderFromCrm,
    sendCrmMessage,
    resolveCrmConversation,
    reopenCrmConversation,
    pushToast,
    productOrders,
    updateProductOrderStatus,
    openTour,
  } = useDashboardStore();

  const [mainSection, setMainSection] = useState<"mensajes" | "pedidos">("mensajes");
  const [orderStatusFilter, setOrderStatusFilter] = useState<"all" | ProductOrderStatus>("all");
  const [orderSearch, setOrderSearch] = useState("");

  const [channelFilter, setChannelFilter] = useState<"todos" | CrmChannel>("todos");
  const [statusFilter, setStatusFilter] = useState<"open" | "resolved" | "all">("open");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string>(crmConversations[0]?.id || "");
  const [replyText, setReplyText] = useState("");

  // Modals
  const [evolutionModalOpen, setEvolutionModalOpen] = useState(false);
  const [evolutionModalTab, setEvolutionModalTab] = useState<"qr" | "config">("qr");
  const [orderModalOpen, setOrderModalOpen] = useState(false);

  // Order modal state
  const [orderProductId, setOrderProductId] = useState(products[0]?.id || "pr-1");
  const [orderQty, setOrderQty] = useState(1);
  const [orderDelivery, setOrderDelivery] = useState<"retirar_en_local" | "delivery">("retirar_en_local");
  const [orderPayment, setOrderPayment] = useState<"efectivo" | "pos" | "transferencia">("transferencia");
  const [orderNotes, setOrderNotes] = useState("");

  // Evolution settings draft state
  const [baseUrlDraft, setBaseUrlDraft] = useState(evolutionConfig.baseUrl);
  const [instanceDraft, setInstanceDraft] = useState(evolutionConfig.instanceName);
  const [apiKeyDraft, setApiKeyDraft] = useState(evolutionConfig.apiKey);
  const [qrCounter, setQrCounter] = useState(45);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const p = new URLSearchParams(window.location.search);
      if (p.get("tab") === "pedidos") {
        setMainSection("pedidos");
      }
    }
  }, []);

  // Update selected conversation when crmConversations changes
  useEffect(() => {
    if (crmConversations.length > 0 && (!selectedId || !crmConversations.some((c) => c.id === selectedId))) {
      setSelectedId(crmConversations[0].id);
    }
  }, [crmConversations, selectedId]);

  // QR timer countdown
  useEffect(() => {
    if (!evolutionModalOpen) return;
    const timer = setInterval(() => {
      setQrCounter((prev) => (prev > 1 ? prev - 1 : 45));
    }, 1000);
    return () => clearInterval(timer);
  }, [evolutionModalOpen]);

  const filteredOrders = useMemo(() => {
    return productOrders.filter((ord) => {
      const matchStatus = orderStatusFilter === "all" || ord.status === orderStatusFilter;
      const matchSearch =
        !orderSearch.trim() ||
        ord.clientName.toLowerCase().includes(orderSearch.toLowerCase()) ||
        ord.orderNumber.toLowerCase().includes(orderSearch.toLowerCase()) ||
        ord.clientPhone.includes(orderSearch) ||
        ord.items.some((i) => i.productName.toLowerCase().includes(orderSearch.toLowerCase()));
      return matchStatus && matchSearch;
    });
  }, [productOrders, orderStatusFilter, orderSearch]);

  const pendingOrdersCount = productOrders.filter((o) => o.status === "pending").length;
  const totalOrderRevenue = productOrders
    .filter((o) => o.status !== "cancelled")
    .reduce((sum, o) => sum + o.totalAmount, 0);
  const totalOnSaleItemsSold = productOrders
    .filter((o) => o.status !== "cancelled")
    .reduce((sum, o) => sum + o.items.filter((i) => i.isOnSale).reduce((s, i) => s + i.qty, 0), 0);

  // Quick reply snippet templates
  const quickReplies = [
    {
      title: "Enlace de Turnos",
      text: `¡Hola! Podés reservar tu turno al instante y elegir profesional en nuestra web oficial: https://${business.slug || "barberia"}.agendate.py/reservar`,
    },
    {
      title: "Precios & Promos",
      text: "Nuestros servicios van desde Gs. 50.000 (Perfilado de Barba) hasta Gs. 120.000 (Combo Corte + Barba VIP). ¿Te gustaría agendar?",
    },
    {
      title: "Ubicación & Mapa",
      text: `Estamos ubicados en ${business.address}, ${business.city}. Contamos con estacionamiento exclusivo para clientes.`,
    },
    {
      title: "Datos SIPAP",
      text: "Transferencias SIPAP: Banco Itaú · Titular: AgendatePY · RUC: 80012345-6 · Cuenta: 0123456789. Favor enviar comprobante.",
    },
  ];

  const filteredConversations = useMemo(() => {
    return crmConversations.filter((c) => {
      const matchChannel = channelFilter === "todos" || c.channel === channelFilter;
      const matchStatus =
        statusFilter === "all" ||
        (statusFilter === "open" && (c.status === "open" || c.status === "pending")) ||
        (statusFilter === "resolved" && c.status === "resolved");

      const matchSearch =
        c.clientName.toLowerCase().includes(search.toLowerCase()) ||
        c.channelIdentifier.toLowerCase().includes(search.toLowerCase()) ||
        c.lastMessage.toLowerCase().includes(search.toLowerCase());

      return matchChannel && matchStatus && matchSearch;
    });
  }, [crmConversations, channelFilter, statusFilter, search]);

  const activeConversation = useMemo(() => {
    return (
      crmConversations.find((c) => c.id === selectedId) ||
      filteredConversations[0] ||
      null
    );
  }, [crmConversations, selectedId, filteredConversations]);

  const linkedClient = useMemo(() => {
    if (!activeConversation?.clientId) return null;
    return clients.find((cl) => cl.id === activeConversation.clientId) || null;
  }, [activeConversation, clients]);

  const selectedProduct = useMemo(() => {
    return products.find((p) => p.id === orderProductId) || products[0];
  }, [products, orderProductId]);

  const unitPrice = selectedProduct?.isOnSale && selectedProduct?.salePrice
    ? selectedProduct.salePrice
    : selectedProduct?.price || 0;

  const orderTotal = unitPrice * orderQty;

  function handleSend() {
    if (!replyText.trim() || !activeConversation) return;
    sendCrmMessage(activeConversation.id, replyText);
    setReplyText("");
    pushToast("success", `Mensaje enviado por ${activeConversation.channel.toUpperCase()}`);
  }

  function handleQuickReply(text: string) {
    setReplyText(text);
  }

  function handleCreateOrderSubmit() {
    if (!activeConversation || !selectedProduct) return;

    createOrderFromCrm({
      clientName: activeConversation.clientName,
      clientPhone: activeConversation.channelIdentifier,
      items: [
        {
          productId: selectedProduct.id,
          productName: selectedProduct.name,
          qty: orderQty,
          unitPrice: unitPrice,
          isOnSale: selectedProduct.isOnSale,
        },
      ],
      deliveryType: orderDelivery,
      paymentMethod: orderPayment,
      notes: orderNotes.trim() ? orderNotes.trim() : `Pedido tomado por chat (${activeConversation.channel})`,
    });

    // Send auto confirmation message into chat
    const autoMsg = `¡Pedido registrado con éxito! Hemos guardado tu pedido de ${orderQty}x ${selectedProduct.name} por ${formatGs(orderTotal)}. Modalidad: ${orderDelivery === "retirar_en_local" ? "Retiro en local" : "Delivery"}.`;
    sendCrmMessage(activeConversation.id, autoMsg);

    setOrderModalOpen(false);
    setOrderNotes("");
    setOrderQty(1);
    pushToast("success", "Pedido creado y mensaje de confirmación enviado al cliente.");
  }

  const unreadTotal = crmConversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0);
  const waUnread = crmConversations
    .filter((c) => c.channel === "whatsapp")
    .reduce((sum, c) => sum + (c.unreadCount || 0), 0);
  const igUnread = crmConversations
    .filter((c) => c.channel === "instagram")
    .reduce((sum, c) => sum + (c.unreadCount || 0), 0);
  const msUnread = crmConversations
    .filter((c) => c.channel === "messenger")
    .reduce((sum, c) => sum + (c.unreadCount || 0), 0);

  // CustomSelect Options for Order Modal
  const productOptions: CustomSelectOption[] = products.map((p) => ({
    value: p.id,
    label: p.name,
    subtitle: `${formatGs(p.isOnSale && p.salePrice ? p.salePrice : p.price)} · Stock: ${p.stock} u.`,
    badge: p.isOnSale ? "OFERTA" : undefined,
  }));

  const deliveryOptions: CustomSelectOption[] = [
    {
      value: "retirar_en_local",
      label: "Retirar en el Local (Sin costo)",
      icon: <Store className="h-4 w-4 text-emerald-500" />,
      subtitle: "El cliente pasa a retirar cuando venga a su turno",
    },
    {
      value: "delivery",
      label: "Envío por Delivery (Asunción / Gran Asunción)",
      icon: <Truck className="h-4 w-4 text-indigo-500" />,
      subtitle: "Despacho con moto mensajería rápida",
    },
  ];

  const paymentOptions: CustomSelectOption[] = [
    {
      value: "transferencia",
      label: "Transferencia Bancaria SIPAP",
      icon: <CreditCard className="h-4 w-4 text-indigo-500" />,
      subtitle: "Envío de comprobante por chat",
    },
    {
      value: "efectivo",
      label: "Efectivo en Caja / Contraentrega",
      icon: <Tag className="h-4 w-4 text-emerald-500" />,
      subtitle: "Abona al momento de recibir el producto",
    },
    {
      value: "pos",
      label: "Tarjeta / POS Bancard",
      icon: <CheckCircle2 className="h-4 w-4 text-blue-500" />,
      subtitle: "Cobro con datáfono en el local",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div
        data-tour="crm-header"
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-white/10 p-5 shadow-xs"
      >
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 mb-2">
            <span
              className={`h-2 w-2 rounded-full ${
                evolutionConfig.connected
                  ? "bg-emerald-500 animate-pulse"
                  : "bg-amber-500"
              }`}
            />
            <span>
              {evolutionConfig.connected
                ? `WhatsApp Conectado · Evolution API (${evolutionConfig.phoneNumber || "+595 981 765 432"})`
                : "Evolution API $0 · Vinculá tu WhatsApp gratis sin pagar a Meta"}
            </span>
          </div>

          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            CRM Omnicanal de Clientes
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 sm:text-sm mt-0.5">
            Atendé WhatsApp, procesá pedidos y agendá turnos en 1 clic desde una sola bandeja centralizada.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            data-tour="crm-evolution-btn"
            onClick={() => setEvolutionModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 text-xs font-bold shadow-sm transition cursor-pointer"
          >
            <QrCode className="h-4 w-4" />
            <span>
              {evolutionConfig.connected ? "Ajustes Evolution API" : "Conectar Evolution API ($0)"}
            </span>
          </button>

          {crmConversations.length > 0 ? (
            <button
              type="button"
              onClick={clearCrmConversations}
              className="inline-flex items-center gap-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-400 border border-slate-200/80 dark:border-white/10 px-3.5 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-300 transition cursor-pointer"
              title="Volver al estado de fábrica sin mensajes"
            >
              <Trash2 className="h-4 w-4" />
              <span>Limpiar Bandeja</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={loadDemoConversation}
              className="inline-flex items-center gap-1.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-200/80 dark:border-indigo-800/60 px-3.5 py-2.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 transition cursor-pointer"
            >
              <Sparkles className="h-4 w-4 text-indigo-500" />
              <span>Cargar 1 Chat de Prueba</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => openTour("crm")}
            className="inline-flex items-center gap-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200/80 dark:border-white/10 px-3 py-2.5 text-xs font-semibold text-slate-700 dark:text-white transition cursor-pointer"
            title="Iniciar Visita Guiada del CRM"
          >
            <HelpCircle className="h-4 w-4 text-primary" />
            <span className="hidden sm:inline">Visita Guiada</span>
          </button>
        </div>
      </div>

      {/* View Switcher: Mensajes Omnicanal vs Órdenes de Tienda */}
      <div
        data-tour="crm-switcher"
        className="flex items-center gap-2 p-1.5 bg-slate-100 dark:bg-slate-900 rounded-2xl w-fit border border-slate-200/80 dark:border-white/10"
      >
        <button
          type="button"
          onClick={() => setMainSection("mensajes")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            mainSection === "mensajes"
              ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <MessageSquare className="h-4 w-4 text-emerald-500" />
          <span>Mensajes Omnicanal</span>
          {unreadTotal > 0 && (
            <span className="bg-rose-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-black">
              {unreadTotal}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setMainSection("pedidos")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            mainSection === "pedidos"
              ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <ShoppingBag className="h-4 w-4 text-primary" />
          <span>Órdenes & Pedidos de Tienda</span>
          {pendingOrdersCount > 0 && (
            <span className="bg-amber-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-black">
              {pendingOrdersCount}
            </span>
          )}
        </button>
      </div>

      {mainSection === "mensajes" ? (
        crmConversations.length === 0 ? (
          /* FACTORY CLEAN EMPTY STATE HERO */
          <div className="rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-white/10 p-8 sm:p-12 text-center shadow-sm">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 border border-emerald-200 dark:border-emerald-800/40 mb-5 shadow-xs">
              <QrCode className="h-10 w-10" />
            </div>

            <span className="inline-block rounded-full bg-primary/10 border border-primary/20 px-3.5 py-1 text-xs font-bold text-primary mb-3">
              Bandeja Limpia de Fábrica (0 Mensajes)
            </span>

            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight max-w-xl mx-auto">
              Conectá tu WhatsApp gratis y comenzá a recibir mensajes en vivo
            </h2>

            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl mx-auto mt-2.5 leading-relaxed">
              Utilizamos <strong>Evolution API</strong> (motor Baileys de código abierto). No necesitás pagar planes de terceros ni tarifas por conversación a Meta. Escaneás el código QR como en WhatsApp Web y tu local queda sincronizado al instante.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setEvolutionModalOpen(true)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3.5 text-xs sm:text-sm font-bold shadow-md transition cursor-pointer"
              >
                <QrCode className="h-4 w-4" />
                <span>Escanear Código QR (Evolution API $0)</span>
              </button>

              <button
                type="button"
                onClick={loadDemoConversation}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-white px-5 py-3.5 text-xs sm:text-sm font-semibold border border-slate-200/80 dark:border-white/10 transition cursor-pointer"
              >
                <Sparkles className="h-4 w-4 text-indigo-500" />
                <span>Cargar 1 Conversación de Demostración</span>
              </button>
            </div>

            {/* 3 Pillars of the System */}
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-5 text-left border-t border-slate-100 dark:border-white/10 pt-8">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-white/5 space-y-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
                  <Smartphone className="h-5 w-5" />
                </div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                  WhatsApp $0 sin Costos Meta
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  Conexión directa mediante socket Web. No pagás los cargos por conversación de Meta Cloud API ni intermediarios costosos.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-white/5 space-y-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Calendar className="h-5 w-5" />
                </div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                  Agendar Turnos en 1 Clic
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  Si el cliente pide turno por chat, tocás &quot;Agendar Turno&quot; y su nombre, teléfono y preferencia se trasladan directo al calendario.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-white/5 space-y-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600">
                  <ShoppingBag className="h-5 w-5" />
                </div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                  Procesar Pedidos de Productos
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  Si consultan por ceras, aceites o tratamientos, creás el pedido con retiro o delivery y enviás la confirmación automática por WhatsApp.
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* ACTIVE CRM 3-COLUMN WORKSPACE */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-[720px]">
            {/* LEFT COLUMN: Channel Filter & Conversation List (4 cols) */}
            <div className="lg:col-span-4 flex flex-col rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-white/10 shadow-sm overflow-hidden">
              {/* Channel Selector Pills */}
              <div
                data-tour="crm-channels"
                className="p-3 border-b border-slate-100 dark:border-white/10 bg-slate-50/60 dark:bg-slate-950/40"
              >
                <div className="grid grid-cols-4 gap-1 p-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-white/5">
                  <button
                    type="button"
                    onClick={() => setChannelFilter("todos")}
                    className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl text-[11px] font-bold transition cursor-pointer ${
                      channelFilter === "todos"
                        ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs"
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                  >
                    <span>Todos</span>
                    <span className="text-[9.5px] opacity-80">{crmConversations.length}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setChannelFilter("whatsapp")}
                    className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl text-[11px] font-bold transition relative cursor-pointer ${
                      channelFilter === "whatsapp"
                        ? "bg-emerald-500 text-white shadow-xs"
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                  >
                    <div className="flex items-center gap-1">
                      <ChannelIcon channel="whatsapp" size="sm" />
                      <span>WA</span>
                    </div>
                    {waUnread > 0 && (
                      <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-extrabold text-white">
                        {waUnread}
                      </span>
                    )}
                    <span className="text-[9.5px] opacity-80">
                      {crmConversations.filter((c) => c.channel === "whatsapp").length}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setChannelFilter("instagram")}
                    className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl text-[11px] font-bold transition relative cursor-pointer ${
                      channelFilter === "instagram"
                        ? "bg-gradient-to-tr from-amber-500 via-pink-500 to-purple-600 text-white shadow-xs"
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                  >
                    <div className="flex items-center gap-1">
                      <ChannelIcon channel="instagram" size="sm" />
                      <span>IG</span>
                    </div>
                    {igUnread > 0 && (
                      <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-extrabold text-white">
                        {igUnread}
                      </span>
                    )}
                    <span className="text-[9.5px] opacity-80">
                      {crmConversations.filter((c) => c.channel === "instagram").length}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setChannelFilter("messenger")}
                    className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl text-[11px] font-bold transition relative cursor-pointer ${
                      channelFilter === "messenger"
                        ? "bg-blue-600 text-white shadow-xs"
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                  >
                    <div className="flex items-center gap-1">
                      <ChannelIcon channel="messenger" size="sm" />
                      <span>Msg</span>
                    </div>
                    {msUnread > 0 && (
                      <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-extrabold text-white">
                        {msUnread}
                      </span>
                    )}
                    <span className="text-[9.5px] opacity-80">
                      {crmConversations.filter((c) => c.channel === "messenger").length}
                    </span>
                  </button>
                </div>

                {/* Search Box */}
                <div className="relative mt-2.5">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Buscar cliente o mensaje..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/10 pl-9 pr-3 py-1.5 text-xs text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>

                {/* Status Tabs */}
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200/40 dark:border-white/5 text-[11px]">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setStatusFilter("open")}
                      className={`font-semibold transition cursor-pointer ${
                        statusFilter === "open"
                          ? "text-primary font-bold border-b-2 border-primary pb-0.5"
                          : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                      }`}
                    >
                      Abiertos
                    </button>
                    <button
                      type="button"
                      onClick={() => setStatusFilter("resolved")}
                      className={`font-semibold transition cursor-pointer ${
                        statusFilter === "resolved"
                          ? "text-primary font-bold border-b-2 border-primary pb-0.5"
                          : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                      }`}
                    >
                      Resueltos
                    </button>
                    <button
                      type="button"
                      onClick={() => setStatusFilter("all")}
                      className={`font-semibold transition cursor-pointer ${
                        statusFilter === "all"
                          ? "text-primary font-bold border-b-2 border-primary pb-0.5"
                          : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                      }`}
                    >
                      Todos
                    </button>
                  </div>

                  {unreadTotal > 0 && (
                    <span className="rounded-full bg-red-100 dark:bg-red-950/70 text-red-600 dark:text-red-400 text-[10px] font-bold px-2 py-0.5">
                      {unreadTotal} sin leer
                    </span>
                  )}
                </div>
              </div>

              {/* Conversation List Scroll */}
              <div
                data-tour="crm-conversations-list"
                className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-white/5"
              >
                {filteredConversations.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-400">
                    No hay conversaciones con estos filtros.
                  </div>
                ) : (
                  filteredConversations.map((c) => {
                    const isSelected = activeConversation?.id === c.id;
                    const initials = c.clientName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase();

                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setSelectedId(c.id)}
                        className={`w-full text-left p-3.5 flex items-start gap-3 transition cursor-pointer ${
                          isSelected
                            ? "bg-primary/10 dark:bg-primary/20 border-l-4 border-primary"
                            : "hover:bg-slate-50 dark:hover:bg-slate-800/50"
                        }`}
                      >
                        {/* Avatar with Channel Icon Badge */}
                        <div className="relative shrink-0">
                          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 text-slate-700 dark:text-slate-200 font-black text-xs shadow-2xs">
                            {initials}
                          </div>
                          <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-white dark:bg-slate-900 shadow-sm border border-slate-200/60 dark:border-white/10">
                            <ChannelIcon channel={c.channel} size="sm" />
                          </span>
                        </div>

                        {/* Meta info */}
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
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[190px]">
                              {c.lastMessage}
                            </p>
                            {c.unreadCount > 0 && (
                              <span className="flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-primary text-[9.5px] font-extrabold text-white shrink-0">
                                {c.unreadCount}
                              </span>
                            )}
                          </div>

                          <div className="mt-1 flex items-center gap-1.5 text-[10px] text-slate-400 font-mono">
                            <span className="truncate">{c.channelIdentifier}</span>
                            {c.status === "resolved" && (
                              <span className="rounded bg-emerald-100 dark:bg-emerald-950/60 px-1 py-0.2 text-[9px] font-bold text-emerald-700 dark:text-emerald-300">
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

            {/* CENTER COLUMN: Live Chat Stream & Quick Reply (5 cols) */}
            <div
              data-tour="crm-chat-box"
              className="lg:col-span-5 flex flex-col rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-white/10 shadow-sm overflow-hidden"
            >
              {activeConversation ? (
                <>
                  {/* Chat Header */}
                  <div className="p-3.5 border-b border-slate-100 dark:border-white/10 bg-slate-50/70 dark:bg-slate-950/40 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary font-bold text-xs">
                          {activeConversation.clientName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)}
                        </div>
                        <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-white dark:bg-slate-900 shadow-2xs">
                          <ChannelIcon channel={activeConversation.channel} size="sm" />
                        </span>
                      </div>

                      <div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          <span>{activeConversation.clientName}</span>
                          <span
                            className={`rounded-full border px-2 py-0.5 text-[9.5px] font-extrabold capitalize ${channelBadgeStyles(
                              activeConversation.channel
                            )}`}
                          >
                            {activeConversation.channel}
                          </span>
                        </h3>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                          {activeConversation.channelIdentifier}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {activeConversation.status === "resolved" ? (
                        <button
                          type="button"
                          onClick={() => reopenCrmConversation(activeConversation.id)}
                          className="rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 px-3 py-1.5 text-[11px] font-bold text-slate-700 dark:text-white transition cursor-pointer"
                        >
                          Reabrir
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => resolveCrmConversation(activeConversation.id)}
                          className="rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 hover:bg-emerald-100 px-3 py-1.5 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 transition cursor-pointer"
                        >
                          Marcar Resuelto
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Message Stream */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#fafbfc] dark:bg-[#0a0f1d]">
                    <div className="text-center">
                      <span className="rounded-full bg-slate-200/70 dark:bg-slate-800 px-3 py-1 text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                        Conversación sincronizada vía {activeConversation.channel.toUpperCase()}
                      </span>
                    </div>

                    {activeConversation.messages.map((m) => {
                      const isAgent = m.sender === "agent";
                      return (
                        <div
                          key={m.id}
                          className={`flex flex-col ${isAgent ? "items-end" : "items-start"}`}
                        >
                          <div
                            className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs shadow-xs leading-relaxed ${
                              isAgent
                                ? "bg-primary text-white rounded-br-xs"
                                : "bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200/60 dark:border-white/5 rounded-bl-xs"
                            }`}
                          >
                            <p>{m.text}</p>
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
                              {isAgent && <CheckCheck className="h-3.5 w-3.5 text-emerald-200" />}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Quick Reply Bar */}
                  <div className="px-3 pt-2 pb-1 border-t border-slate-100 dark:border-white/10 bg-white dark:bg-slate-900">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1">
                      <Zap className="h-3 w-3 text-amber-500" /> Respuestas Rápidas con 1 Clic:
                    </p>
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                      {quickReplies.map((qr) => (
                        <button
                          key={qr.title}
                          type="button"
                          onClick={() => handleQuickReply(qr.text)}
                          className="shrink-0 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-primary/10 hover:text-primary dark:hover:bg-primary/20 px-2.5 py-1 text-[10.5px] font-semibold text-slate-600 dark:text-slate-300 transition cursor-pointer"
                        >
                          {qr.title}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Message Input Bar */}
                  <div className="p-3 border-t border-slate-100 dark:border-white/10 bg-white dark:bg-slate-900 flex items-center gap-2">
                    <input
                      type="text"
                      placeholder={`Responder a ${activeConversation.clientName} por ${activeConversation.channel}...`}
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleSend();
                        }
                      }}
                      className="flex-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-white/10 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />

                    <button
                      type="button"
                      onClick={handleSend}
                      disabled={!replyText.trim()}
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-white hover:opacity-95 disabled:opacity-40 transition shadow-sm cursor-pointer"
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
                    Seleccioná una conversación
                  </p>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs">
                    Gestioná WhatsApp, Instagram y Messenger desde un solo lugar.
                  </p>
                </div>
              )}
            </div>

            {/* RIGHT COLUMN: Client 360 Context & Direct Actions (3 cols) */}
            <div
              data-tour="crm-client-profile"
              className="lg:col-span-3 flex flex-col gap-4"
            >
              {activeConversation ? (
                <>
                  {/* Customer Profile Card */}
                  <div className="rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-white/10 p-4 shadow-sm space-y-4">
                    <div className="text-center pb-3 border-b border-slate-100 dark:border-white/10">
                      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-3xl bg-gradient-to-tr from-primary to-indigo-600 text-white font-black text-lg shadow-md mb-2">
                        {activeConversation.clientName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .slice(0, 2)}
                      </div>
                      <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                        {activeConversation.clientName}
                      </h3>
                      <p className="text-[11px] text-slate-400 font-medium font-mono">
                        {activeConversation.channelIdentifier}
                      </p>

                      {linkedClient?.tags && (
                        <div className="mt-2 flex flex-wrap items-center justify-center gap-1">
                          {linkedClient.tags.map((t) => (
                            <span
                              key={t}
                              className="rounded-full bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Direct Turno & Pedido Action Buttons */}
                    <div className="space-y-2">
                      <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                        Procesar en 1 Clic:
                      </p>

                      <Link
                        href={`/dashboard/nueva-reserva?clientName=${encodeURIComponent(activeConversation.clientName)}&clientPhone=${encodeURIComponent(activeConversation.channelIdentifier)}`}
                        className="w-full flex items-center justify-center gap-2 rounded-2xl bg-primary hover:opacity-95 text-white py-2.5 text-xs font-bold shadow-sm transition"
                      >
                        <Calendar className="h-4 w-4" />
                        <span>Agendar Turno p/ Cliente</span>
                      </Link>

                      <button
                        type="button"
                        onClick={() => setOrderModalOpen(true)}
                        className="w-full flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white py-2.5 text-xs font-bold shadow-sm transition cursor-pointer"
                      >
                        <ShoppingBag className="h-4 w-4" />
                        <span>Crear Pedido de Producto</span>
                      </button>

                      <Link
                        href="/dashboard/clientes"
                        className="w-full flex items-center justify-center gap-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 transition"
                      >
                        <User className="h-3.5 w-3.5" />
                        <span>Ver Ficha Técnica Completa</span>
                      </Link>
                    </div>

                    {/* Linked Channels Info */}
                    <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-white/10">
                      <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                        Canal Activo:
                      </p>

                      <div className="flex items-center justify-between text-xs p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-white/5">
                        <div className="flex items-center gap-2">
                          <ChannelIcon channel={activeConversation.channel} size="sm" />
                          <span className="font-semibold text-slate-800 dark:text-slate-200 capitalize">
                            {activeConversation.channel}
                          </span>
                        </div>
                        {activeConversation.channel === "whatsapp" ? (
                          <a
                            href={`https://wa.me/${activeConversation.channelIdentifier.replace(/[^0-9]/g, "")}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono font-bold hover:underline flex items-center gap-1"
                          >
                            <span>Abrir WA</span>
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        ) : (
                          <span className="text-[10px] text-slate-400">Directo</span>
                        )}
                      </div>
                    </div>

                    {/* VIP & Stats if linked client */}
                    {linkedClient && (
                      <div className="p-3 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/40 space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1">
                            <Award className="h-3.5 w-3.5 text-amber-500" /> Club de Fidelización:
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
                  </div>
                </>
              ) : (
                <div className="rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-white/10 p-5 text-center text-xs text-slate-400">
                  Seleccioná un chat para ver su ficha 360°.
                </div>
              )}

              {/* Evolution API Gateway Status Card */}
              <div className="rounded-3xl bg-gradient-to-br from-emerald-50/70 via-white to-indigo-50/50 dark:from-slate-900 dark:via-slate-900 dark:to-emerald-950/40 border border-emerald-200/60 dark:border-white/10 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4 text-emerald-500" />
                    <span>Evolution API</span>
                  </h4>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[9.5px] font-bold ${
                      evolutionConfig.connected
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400"
                        : "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400"
                    }`}
                  >
                    {evolutionConfig.connected ? "En línea" : "Desconectado"}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  Conexión directa $0 vía Baileys. Los mensajes entrantes se procesan automáticamente sin pagar a Meta.
                </p>
                <button
                  type="button"
                  onClick={() => setEvolutionModalOpen(true)}
                  className="w-full text-center text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline pt-1 cursor-pointer"
                >
                  Ver ajustes de conexión →
                </button>
              </div>
            </div>
          </div>
        )
      ) : (
        /* Orders & Store Sales Management View */
        <div className="space-y-6">
          {/* Orders KPIs */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500">Total Pedidos</p>
                <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{productOrders.length}</p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <ShoppingBag className="h-5 w-5" />
              </div>
            </Card>

            <Card className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500">Pendientes de Despacho</p>
                <p className="text-2xl font-black text-amber-600 mt-1">{pendingOrdersCount}</p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600">
                <Clock className="h-5 w-5" />
              </div>
            </Card>

            <Card className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500">Facturación en Tienda</p>
                <p className="text-2xl font-black text-emerald-600 mt-1 font-mono">{formatGs(totalOrderRevenue)}</p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600">
                <CreditCard className="h-5 w-5" />
              </div>
            </Card>

            <Card className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500">Productos en Oferta</p>
                <p className="text-2xl font-black text-indigo-600 mt-1">{totalOnSaleItemsSold} u. vendidas</p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-600">
                <Tag className="h-5 w-5" />
              </div>
            </Card>
          </div>

          {/* Orders Filter & Search Bar */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {[
                { id: "all", label: "Todos", count: productOrders.length },
                { id: "pending", label: "Pendientes", count: pendingOrdersCount },
                { id: "confirmed", label: "Confirmados", count: productOrders.filter((o) => o.status === "confirmed").length },
                { id: "delivered", label: "Entregados", count: productOrders.filter((o) => o.status === "delivered").length },
                { id: "cancelled", label: "Cancelados", count: productOrders.filter((o) => o.status === "cancelled").length },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setOrderStatusFilter(tab.id as any)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
                    orderStatusFilter === tab.id
                      ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs"
                      : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 border border-slate-200/60 dark:border-white/5"
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className="text-[10px] opacity-75">({tab.count})</span>
                </button>
              ))}
            </div>

            <div className="relative sm:w-72">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por cliente o #PED..."
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
                className="w-full rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-white/10 pl-9 pr-3 py-2 text-xs text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
          </div>

          {/* Orders Grid */}
          {filteredOrders.length === 0 ? (
            <Card className="p-12 text-center">
              <ShoppingBag className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-600 mb-3" />
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No hay órdenes con estos filtros</h3>
              <p className="text-xs text-slate-500 mt-1">Los pedidos creados desde el CRM o catálogo aparecerán aquí.</p>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredOrders.map((ord) => {
                const isPending = ord.status === "pending";
                const isConfirmed = ord.status === "confirmed";
                const isDelivered = ord.status === "delivered";
                const isCancelled = ord.status === "cancelled";

                return (
                  <Card key={ord.id} className="p-4 flex flex-col justify-between space-y-4">
                    {/* Header */}
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-black text-slate-900 dark:text-white">
                          {ord.orderNumber}
                        </span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold capitalize ${
                            isPending
                              ? "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400"
                              : isConfirmed
                              ? "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-400"
                              : isDelivered
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400"
                              : "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-400"
                          }`}
                        >
                          {ord.status}
                        </span>
                      </div>

                      <div className="mt-2 space-y-0.5">
                        <p className="text-sm font-bold text-slate-900 dark:text-white">{ord.clientName}</p>
                        <p className="text-xs text-slate-500 font-mono">{ord.clientPhone}</p>
                      </div>

                      <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-500">
                        {ord.deliveryType === "retirar_en_local" ? (
                          <span className="flex items-center gap-1">
                            <Store className="h-3.5 w-3.5 text-emerald-500" /> Retiro en local
                          </span>
                        ) : (
                          <span className="flex items-center gap-1">
                            <Truck className="h-3.5 w-3.5 text-indigo-500" /> Delivery Asunción
                          </span>
                        )}
                        <span>·</span>
                        <span className="capitalize">{ord.paymentMethod}</span>
                      </div>

                      {/* Items */}
                      <div className="mt-3 divide-y divide-slate-100 dark:divide-white/5 border-t border-slate-100 dark:border-white/5 pt-2 text-xs space-y-1.5">
                        {ord.items.map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between pt-1">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-slate-800 dark:text-slate-200">
                                {item.qty}x {item.productName}
                              </span>
                              {item.isOnSale && (
                                <span className="rounded bg-rose-500/10 text-rose-600 dark:text-rose-400 text-[9px] font-black px-1">
                                  OFERTA
                                </span>
                              )}
                            </div>
                            <span className="font-mono text-slate-600 dark:text-slate-400 font-semibold shrink-0">
                              {formatGs(item.unitPrice * item.qty)}
                            </span>
                          </div>
                        ))}
                      </div>

                      {ord.notes && (
                        <p className="mt-2 text-[11px] text-slate-500 italic bg-amber-500/5 border border-amber-500/10 p-2 rounded-lg">
                          Nota: {ord.notes}
                        </p>
                      )}
                    </div>

                    {/* Bottom: Total & Actions */}
                    <div className="pt-3 border-t border-slate-100 dark:border-white/5 space-y-2.5">
                      <div className="flex items-baseline justify-between">
                        <span className="text-xs text-slate-500">Total del pedido:</span>
                        <span className="text-base font-black text-slate-900 dark:text-white font-mono">
                          {formatGs(ord.totalAmount)}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {isPending && (
                          <button
                            type="button"
                            onClick={() => {
                              updateProductOrderStatus(ord.id, "confirmed");
                              pushToast("success", `Pedido ${ord.orderNumber} marcado como Confirmado`);
                            }}
                            className="flex-1 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold py-1.5 text-xs transition cursor-pointer"
                          >
                            Confirmar
                          </button>
                        )}

                        {(isPending || isConfirmed) && (
                          <button
                            type="button"
                            onClick={() => {
                              updateProductOrderStatus(ord.id, "delivered");
                              pushToast("success", `Pedido ${ord.orderNumber} marcado como Entregado & Cobrado`);
                            }}
                            className="flex-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-1.5 text-xs transition cursor-pointer flex items-center justify-center gap-1"
                          >
                            <Check className="h-3.5 w-3.5" />
                            <span>Entregado</span>
                          </button>
                        )}

                        {!isCancelled && !isDelivered && (
                          <button
                            type="button"
                            onClick={() => {
                              updateProductOrderStatus(ord.id, "cancelled");
                              pushToast("error", `Pedido ${ord.orderNumber} cancelado`);
                            }}
                            className="rounded-xl border border-slate-200 dark:border-white/10 px-2.5 py-1.5 text-xs text-slate-500 hover:text-rose-500 transition cursor-pointer"
                            title="Cancelar pedido"
                          >
                            Cancelar
                          </button>
                        )}

                        {isDelivered && (
                          <span className="w-full text-center text-xs font-bold text-emerald-600 dark:text-emerald-400 py-1 bg-emerald-500/10 rounded-xl flex items-center justify-center gap-1">
                            <CheckCircle2 className="h-4 w-4" />
                            <span>Pedido Completado</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* EVOLUTION API CONNECTION WIZARD MODAL */}
      <Modal
        open={evolutionModalOpen}
        onClose={() => setEvolutionModalOpen(false)}
        title="Conectar WhatsApp Gratis · Evolution API"
      >
        <div className="space-y-5 text-xs">
          {/* Top Info Banner */}
          <div className="rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900/60 p-4">
            <h4 className="font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5 mb-1 text-sm">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              <span>Conexión Directa sin Pagar a Meta ($0 Costo)</span>
            </h4>
            <p className="text-emerald-700 dark:text-emerald-300 leading-relaxed">
              <strong>Evolution API</strong> permite vincular cualquier número de WhatsApp (personal o business) mediante código QR. No pagás tarifas por plantilla ni suscripciones mensuales a intermediarios.
            </p>
          </div>

          {/* Modal Tabs */}
          <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
            <button
              type="button"
              onClick={() => setEvolutionModalTab("qr")}
              className={`flex-1 py-2 text-center rounded-lg font-bold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                evolutionModalTab === "qr"
                  ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-white"
              }`}
            >
              <QrCode className="h-4 w-4" />
              <span>Escanear Código QR</span>
            </button>

            <button
              type="button"
              onClick={() => setEvolutionModalTab("config")}
              className={`flex-1 py-2 text-center rounded-lg font-bold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                evolutionModalTab === "config"
                  ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-white"
              }`}
            >
              <Settings className="h-4 w-4" />
              <span>Servidor & Webhook</span>
            </button>
          </div>

          {evolutionModalTab === "qr" ? (
            /* TAB 1: QR CODE SCANNER */
            <div className="space-y-4">
              <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200/80 dark:border-white/10 flex flex-col sm:flex-row items-center gap-6">
                {/* Visual QR Card */}
                <div className="relative flex flex-col items-center justify-center p-4 bg-white rounded-2xl shadow-sm border border-slate-200 shrink-0">
                  <div className="w-44 h-44 bg-white flex flex-col items-center justify-center relative p-2">
                    {/* Stylized QR Code SVG */}
                    <svg className="w-full h-full text-slate-900" viewBox="0 0 100 100" fill="currentColor">
                      {/* Corner 1 */}
                      <rect x="5" y="5" width="25" height="25" rx="3" fill="none" stroke="currentColor" strokeWidth="4" />
                      <rect x="11" y="11" width="13" height="13" rx="1" />
                      {/* Corner 2 */}
                      <rect x="70" y="5" width="25" height="25" rx="3" fill="none" stroke="currentColor" strokeWidth="4" />
                      <rect x="76" y="11" width="13" height="13" rx="1" />
                      {/* Corner 3 */}
                      <rect x="5" y="70" width="25" height="25" rx="3" fill="none" stroke="currentColor" strokeWidth="4" />
                      <rect x="11" y="76" width="13" height="13" rx="1" />
                      {/* Data dots */}
                      <circle cx="45" cy="15" r="4" />
                      <circle cx="55" cy="25" r="3" />
                      <circle cx="40" cy="35" r="4" />
                      <circle cx="50" cy="50" r="5" />
                      <circle cx="65" cy="45" r="4" />
                      <circle cx="35" cy="55" r="3" />
                      <circle cx="20" cy="45" r="4" />
                      <circle cx="50" cy="70" r="4" />
                      <circle cx="70" cy="70" r="4" />
                      <circle cx="85" cy="55" r="4" />
                      <circle cx="75" cy="40" r="3" />
                      <circle cx="60" cy="85" r="4" />
                      <circle cx="85" cy="85" r="4" />
                      <circle cx="40" cy="85" r="3" />
                    </svg>
                  </div>

                  <div className="mt-2 flex items-center justify-between w-full text-[10px] text-slate-500 font-mono">
                    <span className="flex items-center gap-1">
                      <RefreshCw className="h-3 w-3 animate-spin text-emerald-500" />
                      <span>{qrCounter}s</span>
                    </span>
                    <span className="font-bold text-slate-700">Instancia: {evolutionConfig.instanceName}</span>
                  </div>
                </div>

                {/* Instructions */}
                <div className="space-y-3 flex-1">
                  <h5 className="font-extrabold text-sm text-slate-900 dark:text-white">
                    Pasos para vincular:
                  </h5>
                  <ol className="space-y-2 text-slate-600 dark:text-slate-300 text-xs">
                    <li className="flex items-start gap-2">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 font-bold text-[10px]">
                        1
                      </span>
                      <span>Abrí <strong>WhatsApp</strong> en tu celular.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 font-bold text-[10px]">
                        2
                      </span>
                      <span>Tocá los tres puntos o Ajustes &gt; <strong>Dispositivos Vinculados</strong>.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 font-bold text-[10px]">
                        3
                      </span>
                      <span>Tocá <strong>Vincular un dispositivo</strong> y apuntá con tu cámara a este código.</span>
                    </li>
                  </ol>

                  {/* Status Banner */}
                  <div className="pt-2">
                    {evolutionConfig.connected ? (
                      <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                          <span className="font-bold text-emerald-800 dark:text-emerald-300">
                            Conectado: {evolutionConfig.phoneNumber || "+595 981 765 432"}
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
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/40">
                        <span className="text-amber-800 dark:text-amber-300 font-medium">
                          Esperando escaneo de código...
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            updateEvolutionConfig({
                              connected: true,
                              phoneNumber: "+595 981 765 432",
                              lastSync: new Date().toISOString(),
                            });
                            pushToast("success", "WhatsApp vinculado exitosamente con Evolution API.");
                          }}
                          className="rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1.5 text-xs transition cursor-pointer shrink-0"
                        >
                          Simular Vinculación QR Exitosa
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* TAB 2: SERVER & WEBHOOK CONFIG */
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  URL del Servidor Evolution API:
                </label>
                <input
                  type="text"
                  value={baseUrlDraft}
                  onChange={(e) => setBaseUrlDraft(e.target.value)}
                  placeholder="http://localhost:8080 o https://whatsapp.tu-vps.com"
                  className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 px-3 py-2 text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Host donde corre la instancia de Docker con Evolution API.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Nombre de Instancia:
                  </label>
                  <input
                    type="text"
                    value={instanceDraft}
                    onChange={(e) => setInstanceDraft(e.target.value)}
                    placeholder="agendate-py"
                    className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 px-3 py-2 text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    API Key / Token:
                  </label>
                  <input
                    type="text"
                    value={apiKeyDraft}
                    onChange={(e) => setApiKeyDraft(e.target.value)}
                    placeholder="agendate_evo_key_..."
                    className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 px-3 py-2 text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Webhook URL (Recepción de Mensajes en AgendatePY):
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={evolutionConfig.webhookUrl}
                    className="flex-1 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-white/10 px-3 py-2 text-xs text-slate-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (evolutionConfig.webhookUrl) {
                        navigator.clipboard.writeText(evolutionConfig.webhookUrl);
                        pushToast("success", "URL de Webhook copiada.");
                      }
                    }}
                    className="rounded-xl border border-slate-200 dark:border-white/10 px-3 py-2 text-xs font-bold text-slate-700 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer flex items-center gap-1"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copiar</span>
                  </button>
                </div>
              </div>

              {/* Bot Toggle */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-white/5">
                <div className="space-y-0.5">
                  <span className="font-bold text-slate-900 dark:text-white block text-xs flex items-center gap-1.5">
                    <Bot className="h-4 w-4 text-indigo-500" />
                    <span>Bot de Asistencia & Enlace de Turnos Automático</span>
                  </span>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Si te escriben por WhatsApp fuera de horario o piden turnos, el bot envía automáticamente el enlace de tu web oficial.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    updateEvolutionConfig({ autoBotEnabled: !evolutionConfig.autoBotEnabled });
                  }}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${
                    evolutionConfig.autoBotEnabled ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-700"
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out mt-0.5 ml-0.5 ${
                      evolutionConfig.autoBotEnabled ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    updateEvolutionConfig({
                      baseUrl: baseUrlDraft,
                      instanceName: instanceDraft,
                      apiKey: apiKeyDraft,
                    });
                    pushToast("success", "Configuración de Evolution API guardada.");
                  }}
                  className="rounded-xl bg-primary text-white font-bold px-4 py-2 hover:opacity-95 transition cursor-pointer"
                >
                  Guardar Parámetros
                </button>
              </div>
            </div>
          )}

          <div className="pt-3 border-t border-slate-200 dark:border-white/10 flex justify-end">
            <button
              type="button"
              onClick={() => setEvolutionModalOpen(false)}
              className="rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold px-4 py-2 hover:opacity-90 transition cursor-pointer"
            >
              Listo
            </button>
          </div>
        </div>
      </Modal>

      {/* CREATE ORDER FROM CRM MODAL */}
      <Modal
        open={orderModalOpen}
        onClose={() => setOrderModalOpen(false)}
        title={`Crear Pedido de Producto · ${activeConversation?.clientName || "Cliente"}`}
      >
        <div className="space-y-4 text-xs">
          <div className="rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-900/60 p-3.5">
            <p className="text-indigo-900 dark:text-indigo-200 leading-relaxed font-medium">
              El pedido se vinculará a <strong>{activeConversation?.clientName}</strong> ({activeConversation?.channelIdentifier}) y se enviará un mensaje de confirmación automático al chat de WhatsApp.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Producto a despachar:
            </label>
            <CustomSelect
              value={orderProductId}
              onChange={(val) => setOrderProductId(val)}
              options={productOptions}
            />
          </div>

          <div className="grid grid-cols-2 gap-3 items-center">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Cantidad:
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setOrderQty((q) => Math.max(1, q - 1))}
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-white font-bold hover:bg-slate-200 transition cursor-pointer"
                >
                  -
                </button>
                <span className="w-10 text-center font-mono font-bold text-sm">
                  {orderQty}
                </span>
                <button
                  type="button"
                  onClick={() => setOrderQty((q) => q + 1)}
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-white font-bold hover:bg-slate-200 transition cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-white/5 text-right">
              <span className="text-[10px] text-slate-400 block font-bold">Total a Cobrar:</span>
              <span className="text-lg font-black text-emerald-600 dark:text-emerald-400 font-mono">
                {formatGs(orderTotal)}
              </span>
              {selectedProduct?.isOnSale && (
                <span className="text-[9.5px] text-rose-500 font-bold block">
                  Precio con descuento aplicado
                </span>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Modalidad de Entrega:
            </label>
            <CustomSelect
              value={orderDelivery}
              onChange={(val) => setOrderDelivery(val as any)}
              options={deliveryOptions}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Método de Pago:
            </label>
            <CustomSelect
              value={orderPayment}
              onChange={(val) => setOrderPayment(val as any)}
              options={paymentOptions}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Notas Adicionales (Opcional):
            </label>
            <textarea
              rows={2}
              value={orderNotes}
              onChange={(e) => setOrderNotes(e.target.value)}
              placeholder="Ej: Retira el jueves cuando venga a su corte con Marcos..."
              className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 p-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          <div className="pt-3 border-t border-slate-200 dark:border-white/10 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setOrderModalOpen(false)}
              className="rounded-xl border border-slate-200 dark:border-white/10 px-4 py-2 font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleCreateOrderSubmit}
              className="rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 shadow-sm transition cursor-pointer flex items-center gap-1.5"
            >
              <Check className="h-4 w-4" />
              <span>Confirmar Pedido &amp; Notificar</span>
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
