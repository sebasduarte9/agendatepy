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
  Scissors,
  Settings,
  Plus,
  ArrowRight,
  RefreshCw,
  Phone,
  FileText,
  CreditCard,
  MapPin,
  X,
  Radio,
  Sliders,
  CheckCircle2,
  ShoppingBag,
  Package,
  Tag,
  Truck,
  Store,
  AlertCircle,
} from "lucide-react";
import { useDashboardStore } from "@/store/useDashboardStore";
import Card from "@/components/dashboard/ui/Card";
import Modal from "@/components/dashboard/ui/Modal";
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
    business,
    sendCrmMessage,
    resolveCrmConversation,
    reopenCrmConversation,
    pushToast,
    productOrders,
    updateProductOrderStatus,
  } = useDashboardStore();

  const [mainSection, setMainSection] = useState<"mensajes" | "pedidos">("mensajes");
  const [orderStatusFilter, setOrderStatusFilter] = useState<"all" | ProductOrderStatus>("all");
  const [orderSearch, setOrderSearch] = useState("");

  const [channelFilter, setChannelFilter] = useState<"todos" | CrmChannel>("todos");
  const [statusFilter, setStatusFilter] = useState<"open" | "resolved" | "all">("open");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string>(crmConversations[0]?.id || "");
  const [replyText, setReplyText] = useState("");
  const [configModalOpen, setConfigModalOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const p = new URLSearchParams(window.location.search);
      if (p.get("tab") === "pedidos") {
        setMainSection("pedidos");
      }
    }
  }, []);

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
      text: `¡Hola! Podés agendar tu turno al instante y elegir profesional en nuestra web oficial: https://${business.slug || "barberia"}.agendate.py/reservar`,
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

  function handleSend() {
    if (!replyText.trim() || !activeConversation) return;
    sendCrmMessage(activeConversation.id, replyText);
    setReplyText("");
    pushToast("success", `Mensaje enviado por ${activeConversation.channel.toUpperCase()}`);
  }

  function handleQuickReply(text: string) {
    setReplyText(text);
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

  return (
    <div className="space-y-5">
      {/* Top Banner & Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-3 py-1 text-xs font-bold text-primary mb-1">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Bandeja Unificada 3 en 1 · WhatsApp, Instagram & Facebook</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            CRM Omnicanal de Clientes
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 sm:text-sm">
            Atendé y respondé mensajes de WhatsApp, Instagram Direct y Facebook Messenger en una sola bandeja.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setConfigModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-2xl bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/80 border border-slate-200/80 dark:border-white/10 px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-white shadow-2xs transition"
          >
            <Settings className="h-4 w-4 text-slate-500" />
            <span>Configurar Canales & Meta</span>
          </button>

          <Link
            href="/dashboard/nueva-reserva"
            className="inline-flex items-center gap-2 rounded-2xl bg-primary hover:opacity-95 px-4 py-2.5 text-xs font-bold text-white shadow-md transition"
          >
            <Plus className="h-4 w-4" />
            <span>Nueva Cita</span>
          </Link>
        </div>
      </div>

      {/* View Switcher: Mensajes Omnicanal vs Órdenes de Tienda */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-100 dark:bg-slate-900 rounded-2xl w-fit border border-slate-200/80 dark:border-white/10">
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
        /* Main CRM Grid Container */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-[680px]">
        {/* LEFT COLUMN: Conversation List & Filter Bar (4 cols) */}
        <div className="lg:col-span-4 flex flex-col rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-white/10 shadow-sm overflow-hidden">
          {/* Channel Selector Pills */}
          <div className="p-3 border-b border-slate-100 dark:border-white/10 bg-slate-50/60 dark:bg-slate-950/40">
            <div className="grid grid-cols-4 gap-1 p-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-white/5">
              <button
                type="button"
                onClick={() => setChannelFilter("todos")}
                className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl text-[11px] font-bold transition ${
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
                className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl text-[11px] font-bold transition relative ${
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
                className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl text-[11px] font-bold transition relative ${
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
                className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl text-[11px] font-bold transition relative ${
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
                placeholder="Buscar cliente, @ig o texto..."
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
                  className={`font-semibold transition ${
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
                  className={`font-semibold transition ${
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
                  className={`font-semibold transition ${
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
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-white/5">
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
                    className={`w-full text-left p-3.5 flex items-start gap-3 transition ${
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
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[200px]">
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
        <div className="lg:col-span-5 flex flex-col rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-white/10 shadow-sm overflow-hidden">
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
                      className="rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 px-3 py-1.5 text-[11px] font-bold text-slate-700 dark:text-white transition"
                    >
                      Reabrir
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => resolveCrmConversation(activeConversation.id)}
                      className="rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 hover:bg-emerald-100 px-3 py-1.5 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 transition"
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
                      className="shrink-0 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-primary/10 hover:text-primary dark:hover:bg-primary/20 px-2.5 py-1 text-[10.5px] font-semibold text-slate-600 dark:text-slate-300 transition"
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
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-white hover:opacity-95 disabled:opacity-40 transition shadow-sm"
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
                Gestioná WhatsApp, Instagram Direct y Messenger desde un solo lugar.
              </p>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Client 360 Context & Booking Action (3 cols) */}
        <div className="lg:col-span-3 flex flex-col gap-4">
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
                  <p className="text-[11px] text-slate-400 font-medium">
                    {linkedClient ? linkedClient.email : "Contacto Omnicanal"}
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

                {/* Linked Channels Info */}
                <div className="space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                    Canales Vinculados:
                  </p>

                  {/* WhatsApp row */}
                  <div className="flex items-center justify-between text-xs p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-white/5">
                    <div className="flex items-center gap-2">
                      <ChannelIcon channel="whatsapp" size="sm" />
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        WhatsApp
                      </span>
                    </div>
                    {linkedClient?.phone || activeConversation.channel === "whatsapp" ? (
                      <a
                        href={`https://wa.me/${(linkedClient?.phone || activeConversation.channelIdentifier).replace(/[^0-9]/g, "")}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono font-bold hover:underline flex items-center gap-1"
                      >
                        <span>{linkedClient?.phone || activeConversation.channelIdentifier}</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : (
                      <span className="text-[10px] text-slate-400">No vinculado</span>
                    )}
                  </div>

                  {/* Instagram row */}
                  <div className="flex items-center justify-between text-xs p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-white/5">
                    <div className="flex items-center gap-2">
                      <ChannelIcon channel="instagram" size="sm" />
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        Instagram
                      </span>
                    </div>
                    {linkedClient?.instagram || activeConversation.channel === "instagram" ? (
                      <a
                        href={`https://instagram.com/${(linkedClient?.instagram || activeConversation.channelIdentifier).replace("@", "")}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-pink-600 dark:text-pink-400 font-mono font-bold hover:underline flex items-center gap-1"
                      >
                        <span>{linkedClient?.instagram || activeConversation.channelIdentifier}</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : (
                      <span className="text-[10px] text-slate-400">No vinculado</span>
                    )}
                  </div>

                  {/* Messenger row */}
                  <div className="flex items-center justify-between text-xs p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-white/5">
                    <div className="flex items-center gap-2">
                      <ChannelIcon channel="messenger" size="sm" />
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        Messenger
                      </span>
                    </div>
                    {linkedClient?.messengerId || activeConversation.channel === "messenger" ? (
                      <a
                        href="https://m.me"
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-blue-600 dark:text-blue-400 font-mono font-bold hover:underline flex items-center gap-1"
                      >
                        <span>{linkedClient?.messengerId || activeConversation.channelIdentifier}</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : (
                      <span className="text-[10px] text-slate-400">No vinculado</span>
                    )}
                  </div>
                </div>

                {/* VIP & Stats */}
                {linkedClient && (
                  <div className="p-3 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/40 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1">
                        <Award className="h-3.5 w-3.5 text-amber-500" /> Club VIP:
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
                    <div className="flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400">
                      <span>Total de visitas:</span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {linkedClient.totalVisits} visitas
                      </span>
                    </div>
                  </div>
                )}

                {/* Direct Action Buttons */}
                <div className="space-y-2 pt-2">
                  <Link
                    href={`/dashboard/nueva-reserva?clientName=${encodeURIComponent(activeConversation.clientName)}&clientPhone=${encodeURIComponent(linkedClient?.phone || "")}`}
                    className="w-full flex items-center justify-center gap-2 rounded-2xl bg-primary hover:opacity-95 text-white py-2.5 text-xs font-bold shadow-md transition"
                  >
                    <Calendar className="h-4 w-4" />
                    <span>Agendar Turno p/ Cliente</span>
                  </Link>

                  <Link
                    href="/dashboard/clientes"
                    className="w-full flex items-center justify-center gap-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 transition"
                  >
                    <User className="h-4 w-4" />
                    <span>Ver Ficha Técnica Completa</span>
                  </Link>
                </div>
              </div>
            </>
          ) : (
            <div className="rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-white/10 p-5 text-center text-xs text-slate-400">
              Seleccioná un chat para ver su ficha 360°.
            </div>
          )}

          {/* Quick Stats Pill */}
          <div className="rounded-3xl bg-gradient-to-br from-indigo-50/80 via-white to-purple-50/60 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/40 border border-indigo-200/60 dark:border-white/10 p-4 space-y-2">
            <h4 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              <span>Sincronización Multicanal Activa</span>
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Tus clientes pueden escribirte por WhatsApp, Instagram o Messenger. Toda cita agendada se sincroniza con el calendario central en PostgreSQL.
            </p>
          </div>
        </div>
      </div>
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
                  className={`rounded-xl px-3.5 py-1.5 text-xs font-bold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
                    orderStatusFilter === tab.id
                      ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs"
                      : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200/80 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className="text-[10px] opacity-70">({tab.count})</span>
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por cliente, pedido o teléfono..."
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
                className="w-full rounded-xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900 pl-10 pr-3.5 py-2 text-xs text-slate-900 dark:text-white outline-none focus:border-primary shadow-2xs"
              />
            </div>
          </div>

          {/* Orders Cards Grid */}
          {filteredOrders.length === 0 ? (
            <Card className="p-12 text-center">
              <ShoppingBag className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-600" />
              <h3 className="mt-3 text-sm font-bold text-slate-800 dark:text-slate-200">
                No se encontraron pedidos
              </h3>
              <p className="mt-1 text-xs text-slate-400">
                Los pedidos y reservas de productos realizados desde tu tienda web aparecerán aquí en vivo.
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredOrders.map((ord) => {
                const isPending = ord.status === "pending";
                const isConfirmed = ord.status === "confirmed";
                const isDelivered = ord.status === "delivered";
                const isCancelled = ord.status === "cancelled";

                const rawPhone = ord.clientPhone.replace(/\D/g, "");
                const waMessage = encodeURIComponent(
                  `¡Hola ${ord.clientName}! 👋 Te escribo de ${business.name || "la barbería"} respecto a tu pedido *${ord.orderNumber}* por Gs. ${ord.totalAmount.toLocaleString("es-PY")}. ¿Podemos coordinar la entrega o retiro?`
                );

                return (
                  <Card key={ord.id} className="p-4 flex flex-col justify-between space-y-4 hover:border-primary/40 transition">
                    <div>
                      {/* Top Header */}
                      <div className="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-white/5 pb-3">
                        <div>
                          <span className="font-mono text-sm font-black text-slate-900 dark:text-white">
                            {ord.orderNumber}
                          </span>
                          <span className="block text-[10px] text-slate-400 mt-0.5">
                            {new Date(ord.createdAt).toLocaleDateString("es-PY", {
                              day: "2-digit",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>

                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                            isPending
                              ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                              : isConfirmed
                              ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20"
                              : isDelivered
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                              : "bg-slate-100 text-slate-500 dark:bg-slate-800"
                          }`}
                        >
                          {isPending
                            ? "Pendiente"
                            : isConfirmed
                            ? "Confirmado"
                            : isDelivered
                            ? "Entregado"
                            : "Cancelado"}
                        </span>
                      </div>

                      {/* Client info & WhatsApp button */}
                      <div className="flex items-center justify-between gap-2 pt-3">
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {ord.clientName}
                          </p>
                          <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                            {ord.clientPhone}
                          </p>
                        </div>

                        <a
                          href={`https://wa.me/${rawPhone}?text=${waMessage}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500 text-emerald-600 hover:text-white border border-emerald-500/20 px-2.5 py-1.5 text-xs font-bold transition cursor-pointer shrink-0"
                          title="Contactar al cliente por WhatsApp"
                        >
                          <ChannelIcon channel="whatsapp" size="sm" />
                          <span>WhatsApp</span>
                        </a>
                      </div>

                      {/* Delivery and payment badges */}
                      <div className="flex items-center gap-2 pt-2 text-[10px] font-semibold text-slate-600 dark:text-slate-300">
                        <span className="flex items-center gap-1 rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-0.5">
                          {ord.deliveryType === "delivery" ? (
                            <Truck className="h-3 w-3 text-indigo-500" />
                          ) : (
                            <Store className="h-3 w-3 text-primary" />
                          )}
                          <span>{ord.deliveryType === "delivery" ? "Delivery" : "Retiro en local"}</span>
                        </span>

                        <span className="flex items-center gap-1 rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-0.5">
                          <CreditCard className="h-3 w-3 text-emerald-500" />
                          <span className="capitalize">{ord.paymentMethod}</span>
                        </span>
                      </div>

                      {/* Item list */}
                      <div className="mt-3 space-y-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 p-2.5 text-xs border border-slate-100 dark:border-white/5">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Items del Pedido ({ord.items.reduce((s, i) => s + i.qty, 0)})
                        </p>
                        {ord.items.map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between text-xs py-0.5">
                            <div className="flex items-center gap-1.5 truncate">
                              <span className="font-bold text-slate-700 dark:text-slate-300 font-mono">
                                {item.qty}x
                              </span>
                              <span className="truncate text-slate-800 dark:text-slate-200">
                                {item.productName}
                              </span>
                              {item.isOnSale && (
                                <span className="bg-amber-500 text-white text-[9px] font-black px-1.5 py-0.2 rounded-full uppercase">
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

      {/* CHANNEL CONFIGURATION MODAL */}
      <Modal
        open={configModalOpen}
        onClose={() => setConfigModalOpen(false)}
        title="Canales de Mensajería Conectados"
      >
        <div className="space-y-5 text-xs">
          <div className="rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-900/60 p-4">
            <h4 className="font-bold text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5 mb-1 text-sm">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span>Sincronización Automática Activa</span>
            </h4>
            <p className="text-indigo-700 dark:text-indigo-300 leading-relaxed">
              Tus canales están vinculados a la bandeja central de tu negocio. Todos los mensajes entrantes de clientes se reciben al instante sin configuraciones complejas.
            </p>
          </div>

          <div className="space-y-2.5">
            <h5 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>Estado de tus Canales:</span>
            </h5>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-white/5">
              <div className="flex items-center gap-2.5">
                <ChannelIcon channel="whatsapp" size="sm" />
                <div>
                  <span className="font-bold text-slate-800 dark:text-slate-200 block text-xs">
                    WhatsApp Business
                  </span>
                  <span className="text-[11px] text-slate-500">Confirmaciones y chat directo</span>
                </div>
              </div>
              <span className="rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-bold px-2.5 py-0.5 text-[10px]">
                Conectado y Activo
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-white/5">
              <div className="flex items-center gap-2.5">
                <ChannelIcon channel="instagram" size="sm" />
                <div>
                  <span className="font-bold text-slate-800 dark:text-slate-200 block text-xs">
                    Instagram Direct
                  </span>
                  <span className="text-[11px] text-slate-500">Mensajes privados y consultas</span>
                </div>
              </div>
              <span className="rounded-full bg-pink-100 dark:bg-pink-950/60 text-pink-700 dark:text-pink-400 font-bold px-2.5 py-0.5 text-[10px]">
                Conectado
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-white/5">
              <div className="flex items-center gap-2.5">
                <ChannelIcon channel="messenger" size="sm" />
                <div>
                  <span className="font-bold text-slate-800 dark:text-slate-200 block text-xs">
                    Facebook Messenger
                  </span>
                  <span className="text-[11px] text-slate-500">Página oficial del negocio</span>
                </div>
              </div>
              <span className="rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 font-bold px-2.5 py-0.5 text-[10px]">
                Conectado
              </span>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 dark:border-white/10 flex justify-end">
            <button
              type="button"
              onClick={() => {
                setConfigModalOpen(false);
                pushToast("success", "Canales verificados y en línea correctamente.");
              }}
              className="rounded-xl bg-primary text-white font-bold px-4 py-2 hover:opacity-95 transition"
            >
              Cerrar y Continuar
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
