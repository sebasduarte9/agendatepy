"use client";

import { useState, useMemo, useEffect, useCallback, useRef, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
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
  BarChart3,
} from "lucide-react";
import QRCode from "qrcode";
import { useDashboardStore } from "@/store/useDashboardStore";
import Card from "@/components/dashboard/ui/Card";
import Modal from "@/components/dashboard/ui/Modal";
import CustomSelect, { CustomSelectOption } from "@/components/dashboard/ui/CustomSelect";
import IosSegmentedControl from "@/components/dashboard/ui/IosSegmentedControl";
import { formatGs } from "@/lib/dashboard-dates";
import type { AppointmentStatus, CrmChannel, CrmConversation, ProductOrderStatus } from "@/lib/dashboard-types";
import { tenantPublicUrl } from "@/lib/tenant/public-url";

// Demo timestamps are created separately on the server and browser. Render them
// after hydration, using the business timezone rather than the device timezone.
const subscribeToHydration = () => () => {};
const phoneSuffix = (value: string | undefined | null) => (value || "").replace(/\D/g, "").slice(-8);

function formatProfileDate(iso: string, timezone: string, withTime = false) {
  return new Date(iso).toLocaleDateString("es-PY", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: timezone,
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  });
}

const APPOINTMENT_STATUS_LABELS: Record<AppointmentStatus, { label: string; className: string }> = {
  completed: { label: "Asistió", className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300" },
  confirmed: { label: "Confirmado", className: "bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300" },
  pending: { label: "Pendiente", className: "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300" },
  no_show: { label: "No asistió", className: "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300" },
  cancelled: { label: "Cancelado", className: "bg-slate-200 text-slate-600 dark:bg-white/10 dark:text-zinc-300" },
  expired: { label: "Expirado", className: "bg-slate-200 text-slate-600 dark:bg-white/10 dark:text-zinc-300" },
};

const ORDER_FILTERS: { id: "all" | ProductOrderStatus; label: string }[] = [
  { id: "all", label: "Todos" },
  { id: "pending", label: "Pendientes" },
  { id: "confirmed", label: "Confirmados" },
  { id: "delivered", label: "Entregados" },
  { id: "cancelled", label: "Cancelados" },
];

const ORDER_STATUS_LABELS: Record<ProductOrderStatus, { label: string; className: string }> = {
  pending: { label: "Pendiente", className: "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300" },
  confirmed: { label: "Confirmado", className: "bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300" },
  delivered: { label: "Entregado", className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300" },
  cancelled: { label: "Cancelado", className: "bg-slate-200 text-slate-600 dark:bg-white/10 dark:text-zinc-300" },
};

const PAYMENT_LABELS: Record<string, string> = {
  efectivo: "Efectivo",
  transferencia: "Transferencia",
  pos: "Tarjeta (POS)",
  sipap: "SIPAP",
};

function ConversationTime({ value, timezone }: { value: string; timezone: string }) {
  const hydrated = useSyncExternalStore(subscribeToHydration, () => true, () => false);
  return <time>{hydrated ? new Date(value).toLocaleTimeString("es-PY", {
    hour: "2-digit", minute: "2-digit", timeZone: timezone,
  }) : "—"}</time>;
}

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

function ContactAvatar({
  name,
  phone,
  channel,
  tenantSlug,
  whatsappConnected,
  color,
  className,
  initialsClassName = "",
}: {
  name: string;
  phone: string;
  channel: CrmChannel;
  tenantSlug: string;
  whatsappConnected: boolean;
  color: string;
  className: string;
  initialsClassName?: string;
}) {
  const initials = name.split(" ").filter(Boolean).map((part) => part[0]).join("").slice(0, 2).toUpperCase();
  const digits = phone.replace(/\D/g, "");
  const avatarUrl = channel === "whatsapp" && whatsappConnected && digits.length >= 8
    ? `/api/crm/whatsapp-avatar?phone=${encodeURIComponent(digits)}&workspace=${encodeURIComponent(tenantSlug)}`
    : null;

  return (
    <div
      aria-hidden="true"
      className={`relative flex shrink-0 items-center justify-center overflow-hidden text-white ${className}`}
      style={{ backgroundColor: color || "#0f172a" }}
    >
      <span className={initialsClassName}>{initials}</span>
      {avatarUrl && (
        <Image
          src={avatarUrl}
          alt=""
          fill
          sizes="64px"
          unoptimized
          loading="lazy"
          decoding="async"
          className="absolute inset-0 h-full w-full rounded-[inherit] object-cover"
          onError={(event) => {
            event.currentTarget.style.display = "none";
          }}
        />
      )}
    </div>
  );
}

export default function CrmOmnichannelPage() {
  const {
    crmConversations, clients, products, business,
    evolutionConfig, updateEvolutionConfig,
    loadDemoConversation, clearCrmConversations, restoreCrmConversations, createOrderFromCrm,
    ensureClientCrmConversation,
    sendCrmMessage, resolveCrmConversation, reopenCrmConversation,
    pushToast, productOrders, updateProductOrderStatus,
    receipts, setReceiptStatus,
    appointments, services, staff, loyalty, sipap,
  } = useDashboardStore();

  const router = useRouter();
  const [mainSection, setMainSection] = useState<"mensajes" | "pedidos" | "metricas">("mensajes");
  const [desktopProfileOpen, setDesktopProfileOpen] = useState(true);
  const [orderStatusFilter, setOrderStatusFilter] = useState<"all" | ProductOrderStatus>("all");
  const [orderSearch, setOrderSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"open" | "resolved" | "all">("open");
  const [search, setSearch] = useState("");
  const [deepLinkPhone, setDeepLinkPhone] = useState("");
  const [selectedId, setSelectedId] = useState<string>("conv-demo-1");
  const [replyText, setReplyText] = useState("");
  const [replyInputFocused, setReplyInputFocused] = useState(false);
  const [mobileActiveView, setMobileActiveView] = useState<"list" | "chat" | "profile">("list");
  const [clearConfirmOpen, setClearConfirmOpen] = useState(false);
  const [clearedConversations, setClearedConversations] = useState<{
    conversations: CrmConversation[];
    selectedId: string;
  } | null>(null);

  // Modals
  const [channelsModalOpen, setChannelsModalOpen] = useState(false);
  const [channelsTab, setChannelsTab] = useState<"whatsapp" | "instagram" | "facebook">("whatsapp");
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [savingOrder, setSavingOrder] = useState(false);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
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
      const phone = p.get("phone") || "";
      if (phone) {
        setDeepLinkPhone(phone);
        setSearch(phone);
        setStatusFilter("all");
      }
    }
  }, []);

  useEffect(() => {
    const onTourView = (e: Event) => {
      const view = (e as CustomEvent<{ view: "list" | "chat" | "profile" }>).detail?.view;
      if (view) setMobileActiveView(view);
    };
    window.addEventListener("agendate-crm-view", onTourView);
    return () => window.removeEventListener("agendate-crm-view", onTourView);
  }, []);

  useEffect(() => {
    const phoneSuffix = deepLinkPhone.replace(/\D/g, "").slice(-8);
    if (phoneSuffix.length < 6) return;

    const matchingConversation = crmConversations.find(
      (conversation) =>
        conversation.channel === "whatsapp" &&
        conversation.channelIdentifier.replace(/\D/g, "").endsWith(phoneSuffix)
    );
    const matchingClient = clients.find(
      (client) => client.phone.replace(/\D/g, "").endsWith(phoneSuffix)
    );
    const conversationId = matchingClient
      ? ensureClientCrmConversation(matchingClient)
      : matchingConversation?.id || null;
    if (!conversationId) return;

    setSelectedId(conversationId);
    setMobileActiveView("chat");
    setDeepLinkPhone("");
  }, [clients, crmConversations, deepLinkPhone, ensureClientCrmConversation]);

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

  // Respuestas rápidas armadas con los datos reales del negocio
  const quickReplies = useMemo(() => {
    const priced = services.filter((s) => s.active !== false && s.price > 0);
    const cheapest = priced.reduce<(typeof priced)[number] | null>((min, s) => (!min || s.price < min.price ? s : min), null);
    const priciest = priced.reduce<(typeof priced)[number] | null>((max, s) => (!max || s.price > max.price ? s : max), null);
    const replies: { title: string; text: string }[] = [
      { title: "Enlace de turnos", text: `¡Hola! Podés reservar tu turno en nuestra web: ${tenantPublicUrl(business.slug || "barberia")}` },
    ];
    if (cheapest && priciest) {
      replies.push({
        title: "Precios",
        text: cheapest.id === priciest.id
          ? `${cheapest.name}: ${formatGs(cheapest.price)}. ¿Te gustaría agendar?`
          : `Nuestros servicios van desde ${formatGs(cheapest.price)} (${cheapest.name}) hasta ${formatGs(priciest.price)} (${priciest.name}). ¿Te gustaría agendar?`,
      });
    }
    if (business.address) {
      replies.push({ title: "Ubicación", text: `Estamos en ${[business.address, business.city].filter(Boolean).join(", ")}.` });
    }
    if (sipap.accountNumber || sipap.aliasSipap) {
      replies.push({
        title: "Datos de transferencia",
        text: [
          "Datos para transferencia:",
          sipap.bankName && `Banco: ${sipap.bankName}`,
          sipap.accountHolder && `Titular: ${sipap.accountHolder}`,
          sipap.rucOrCi && `RUC/CI: ${sipap.rucOrCi}`,
          sipap.accountNumber && `Cuenta: ${sipap.accountNumber}`,
          sipap.aliasSipap && `Alias SIPAP: ${sipap.aliasSipap}`,
          "Cuando transfieras, enviame el comprobante por acá.",
        ].filter(Boolean).join("\n"),
      });
    }
    return replies;
  }, [services, business.slug, business.address, business.city, sipap]);

  // Por ahora la bandeja es solo WhatsApp; Instagram y Messenger quedan como "Próximamente".
  const whatsappConversations = useMemo(
    () => crmConversations.filter((c) => c.channel === "whatsapp"),
    [crmConversations],
  );

  const filteredConversations = useMemo(() => whatsappConversations.filter((c) => {
    const stMatch = statusFilter === "all" || (statusFilter === "open" && (c.status === "open" || c.status === "pending")) || (statusFilter === "resolved" && c.status === "resolved");
    const normalizedSearch = search.trim().toLowerCase();
    const searchDigits = search.replace(/\D/g, "");
    const phoneMatch = searchDigits.length >= 4 && c.channelIdentifier.replace(/\D/g, "").endsWith(searchDigits.slice(-8));
    const seMatch = !normalizedSearch || c.clientName.toLowerCase().includes(normalizedSearch) || c.channelIdentifier.toLowerCase().includes(normalizedSearch) || c.lastMessage.toLowerCase().includes(normalizedSearch) || phoneMatch;
    return stMatch && seMatch;
  }), [whatsappConversations, statusFilter, search]);

  const activeConversation = useMemo(() => {
    if (deepLinkPhone) {
      const phoneSuffix = deepLinkPhone.replace(/\D/g, "").slice(-8);
      return crmConversations.find(
        (conversation) =>
          conversation.channel === "whatsapp" &&
          conversation.channelIdentifier.replace(/\D/g, "").endsWith(phoneSuffix)
      ) || null;
    }
    return filteredConversations.find((c) => c.id === selectedId) || filteredConversations[0] || null;
  }, [crmConversations, deepLinkPhone, selectedId, filteredConversations]);

  useEffect(() => {
    if (deepLinkPhone) return;
    const nextSelectedId = filteredConversations.some((conversation) => conversation.id === selectedId)
      ? selectedId
      : filteredConversations[0]?.id || "";
    if (nextSelectedId !== selectedId) setSelectedId(nextSelectedId);
    if (!activeConversation && mobileActiveView === "chat") setMobileActiveView("list");
  }, [activeConversation, deepLinkPhone, filteredConversations, mobileActiveView, selectedId]);

  const linkedClient = useMemo(() => {
    if (!activeConversation) return null;
    const byId = activeConversation.clientId ? clients.find((cl) => cl.id === activeConversation.clientId) : undefined;
    if (byId) return byId;
    if (activeConversation.channel !== "whatsapp") return null;
    const suffix = phoneSuffix(activeConversation.channelIdentifier);
    return suffix.length === 8 ? clients.find((cl) => phoneSuffix(cl.phone) === suffix) || null : null;
  }, [activeConversation, clients]);
  // Turnos del cliente (por id vinculado o, si no hay, por teléfono)
  const clientAppointments = useMemo(() => {
    if (!activeConversation) return [];
    const suffix = phoneSuffix(linkedClient?.phone || activeConversation.channelIdentifier);
    return appointments
      .filter((a) =>
        (linkedClient && a.clientId === linkedClient.id) ||
        (suffix.length === 8 && phoneSuffix(a.clientPhone) === suffix)
      )
      .sort((a, b) => b.start.localeCompare(a.start));
  }, [activeConversation, linkedClient, appointments]);

  const clientStats = useMemo(() => {
    const now = Date.now();
    const completed = clientAppointments.filter((a) => a.status === "completed");
    const mostFrequent = (ids: string[]) => {
      const counts = new Map<string, number>();
      for (const id of ids) counts.set(id, (counts.get(id) || 0) + 1);
      return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
    };
    const attended = completed.length > 0 ? completed : clientAppointments.filter((a) => a.status !== "cancelled" && a.status !== "expired");
    const favoriteServiceId = mostFrequent(attended.map((a) => a.serviceId));
    const favoriteStaffId = mostFrequent(attended.map((a) => a.staffId));
    const visits = Math.max(linkedClient?.totalVisits ?? 0, completed.length);
    const totalSpent = Math.max(
      linkedClient?.totalSpent ?? 0,
      completed.reduce((sum, a) => sum + (services.find((s) => s.id === a.serviceId)?.price || 0), 0),
    );
    const lastCompleted = completed.find((a) => Date.parse(a.start) <= now)?.start;
    const nextAppointment = [...clientAppointments]
      .reverse()
      .find((a) => Date.parse(a.start) > now && (a.status === "confirmed" || a.status === "pending"));
    return {
      visits,
      totalSpent,
      avgTicket: visits > 0 ? Math.round(totalSpent / visits) : 0,
      lastVisit: [lastCompleted, linkedClient?.lastVisit].filter(Boolean).sort().pop() || null,
      nextAppointment,
      noShows: clientAppointments.filter((a) => a.status === "no_show").length,
      cancellations: clientAppointments.filter((a) => a.status === "cancelled").length,
      favoriteService: services.find((s) => s.id === favoriteServiceId)?.name,
      favoriteStaff: staff.find((p) => p.id === favoriteStaffId)?.name,
    };
  }, [clientAppointments, linkedClient, services, staff]);


  // Order history for active conversation client
  const clientOrderHistory = useMemo(() => {
    if (!activeConversation) return [];
    return productOrders.filter((o) =>
      o.clientName.toLowerCase() === activeConversation.clientName.toLowerCase() ||
      o.clientPhone.replace(/\s/g, "").includes(activeConversation.channelIdentifier.replace(/\s/g, ""))
    );
  }, [activeConversation, productOrders]);

  // Transfer receipts for active conversation client
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

  const unreadTotal = whatsappConversations.reduce((s, c) => s + (c.unreadCount || 0), 0);

  /* ── Auto-scroll & Viewport Management ── */
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const workspaceRef = useRef<HTMLDivElement>(null);
  const conversationListRef = useRef<HTMLDivElement>(null);
  const conversationListScrollTopRef = useRef(0);
  const clearUndoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const viewport = window.visualViewport;
    const mobileShell = workspaceRef.current?.closest<HTMLElement>(".mobile-dashboard-shell");
    const syncVisualViewport = () => {
      const height = viewport?.height ?? window.innerHeight;
      const workspace = workspaceRef.current;
      const main = workspace?.closest("main");
      const shell = workspace?.closest<HTMLElement>(".mobile-dashboard-shell");
      if (shell) shell.style.height = `${height}px`;
      if (workspace && main && window.innerWidth < 1024 && workspace.getClientRects().length) {
        const bottom = Math.min(main.getBoundingClientRect().bottom, height);
        const padding = parseFloat(getComputedStyle(main).paddingBottom);
        const available = bottom - workspace.getBoundingClientRect().top - padding;
        workspace.style.setProperty("--crm-workspace-height", `${Math.max(0, available)}px`);
      }
      window.dispatchEvent(new CustomEvent("agendate-crm-keyboard-state", {
        detail: { open: window.innerWidth < 1024 && replyInputFocused },
      }));
    };

    const main = workspaceRef.current?.closest("main");
    if (window.innerWidth < 1024 && main) main.scrollTop = 0;
    const observer = new ResizeObserver(syncVisualViewport);
    if (main) observer.observe(main);
    syncVisualViewport();
    viewport?.addEventListener("resize", syncVisualViewport);
    viewport?.addEventListener("scroll", syncVisualViewport);
    window.addEventListener("resize", syncVisualViewport);

    return () => {
      observer.disconnect();
      mobileShell?.style.removeProperty("height");
      viewport?.removeEventListener("resize", syncVisualViewport);
      viewport?.removeEventListener("scroll", syncVisualViewport);
      window.removeEventListener("resize", syncVisualViewport);
      window.dispatchEvent(new CustomEvent("agendate-crm-keyboard-state", { detail: { open: false } }));
    };
  }, [replyInputFocused, mobileActiveView, mainSection, crmConversations.length]);

  useEffect(() => {
    window.dispatchEvent(new CustomEvent("agendate-crm-mobile-view-state", {
      detail: { view: mobileActiveView },
    }));
  }, [mobileActiveView]);

  useEffect(() => () => {
    if (clearUndoTimerRef.current) clearTimeout(clearUndoTimerRef.current);
  }, []);

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

  // Keep the mobile app shell at the top when entering chat, without resetting the hidden list's scroll.
  useEffect(() => {
    if (!activeConversation) return;
    const isMobile = window.innerWidth < 1024;
    if (isMobile && mobileActiveView !== "chat") return;
    if (isMobile) window.scrollTo({ top: 0, behavior: "instant" });

    scrollToBottom("instant");
    const timer = setTimeout(() => {
      if (isMobile) window.scrollTo({ top: 0, behavior: "instant" });
      scrollToBottom("instant");
    }, 40);
    return () => clearTimeout(timer);
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
          ? `¡Hola ${clientName.split(" ")[0]}! Recibimos tu mensaje. Si querés agendar un turno ahora podés acceder a nuestra web: ${tenantPublicUrl(business.slug || "barberia")}`
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

  function returnToConversationList() {
    setReplyInputFocused(false);
    setMobileActiveView("list");
    window.scrollTo({ top: 0, behavior: "instant" });
    window.requestAnimationFrame(() => {
      if (conversationListRef.current) {
        conversationListRef.current.scrollTop = conversationListScrollTopRef.current;
      }
    });
  }

  function confirmClearConversations() {
    const snapshot = crmConversations.map((conversation) => ({
      ...conversation,
      messages: [...conversation.messages],
    }));
    setClearedConversations({ conversations: snapshot, selectedId });
    clearCrmConversations();
    setClearConfirmOpen(false);
    setMobileActiveView("list");
    if (clearUndoTimerRef.current) clearTimeout(clearUndoTimerRef.current);
    clearUndoTimerRef.current = setTimeout(() => setClearedConversations(null), 10000);
  }

  function undoClearConversations() {
    if (!clearedConversations) return;
    restoreCrmConversations(clearedConversations.conversations);
    setSelectedId(clearedConversations.selectedId);
    setMobileActiveView("list");
    setClearedConversations(null);
    if (clearUndoTimerRef.current) clearTimeout(clearUndoTimerRef.current);
    clearUndoTimerRef.current = null;
    pushToast("success", "Conversaciones restauradas.");
  }

  async function handleCreateOrderSubmit() {
    if (!activeConversation || !selectedProduct || savingOrder) return;
    setSavingOrder(true);
    const created = await createOrderFromCrm({
      clientName: activeConversation.clientName,
      clientPhone: activeConversation.channelIdentifier,
      items: [{ productId: selectedProduct.id, productName: selectedProduct.name, qty: orderQty, unitPrice, isOnSale: selectedProduct.isOnSale }],
      deliveryType: orderDelivery,
      paymentMethod: orderPayment,
      notes: orderNotes.trim() || `Pedido tomado por chat (${activeConversation.channel})`,
    });
    setSavingOrder(false);
    // Solo avisamos al cliente si el pedido quedó guardado
    if (!created) return;
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
    { value: "transferencia", label: "Transferencia Bancaria", icon: <CreditCard className="h-4 w-4 text-indigo-500" /> },
    { value: "efectivo", label: "Efectivo / Contraentrega", icon: <Tag className="h-4 w-4 text-emerald-500" /> },
    { value: "pos", label: "Tarjeta / POS Bancard", icon: <CheckCircle2 className="h-4 w-4 text-blue-500" /> },
  ];

  const openCount = whatsappConversations.filter((c) => c.status === "open").length;
  const resolvedCount = whatsappConversations.filter((c) => c.status === "resolved").length;
  const resolutionPct = whatsappConversations.length > 0 ? Math.round((resolvedCount / whatsappConversations.length) * 100) : 100;
  const unreadChatsCount = whatsappConversations.filter((c) => (c.unreadCount || 0) > 0).length;

  // Tiempo de respuesta real: desde cada mensaje del cliente hasta la primera respuesta (agente o bot)
  const avgResponseMinutes = (() => {
    const waits: number[] = [];
    for (const conv of whatsappConversations) {
      let pendingSince: number | null = null;
      for (const m of conv.messages) {
        const t = Date.parse(m.timestamp);
        if (Number.isNaN(t)) continue;
        if (m.sender === "client") {
          if (pendingSince === null) pendingSince = t;
        } else if (pendingSince !== null) {
          waits.push(Math.max(0, t - pendingSince));
          pendingSince = null;
        }
      }
    }
    return waits.length > 0 ? waits.reduce((a, b) => a + b, 0) / waits.length / 60_000 : null;
  })();
  const avgResponseLabel = avgResponseMinutes === null
    ? "Sin datos"
    : avgResponseMinutes < 1
    ? "< 1 min"
    : avgResponseMinutes < 60
    ? `${Math.round(avgResponseMinutes)} min`
    : `${(avgResponseMinutes / 60).toFixed(1).replace(".", ",")} h`;

  const activeOrders = productOrders.filter((o) => o.status !== "cancelled");
  const avgOrderTicket = activeOrders.length > 0 ? Math.round(totalOrderRevenue / activeOrders.length) : 0;
  const deliveredOrdersCount = productOrders.filter((o) => o.status === "delivered").length;
  const cadenceSeconds = evolutionConfig.autoBotCadenceSeconds ?? 12;

  async function changeOrderStatus(orderId: string, status: ProductOrderStatus, successMessage: string) {
    if (updatingOrderId) return;
    setUpdatingOrderId(orderId);
    const ok = await updateProductOrderStatus(orderId, status);
    setUpdatingOrderId(null);
    if (ok) pushToast(status === "cancelled" ? "error" : "success", successMessage);
  }

  function openChatForPhone(phone: string) {
    const suffix = phoneSuffix(phone);
    const conv = whatsappConversations.find((c) => phoneSuffix(c.channelIdentifier) === suffix);
    if (!conv || suffix.length < 8) {
      pushToast("error", "Este cliente todavía no tiene un chat de WhatsApp.");
      return;
    }
    setDeepLinkPhone("");
    setSearch("");
    setStatusFilter("all");
    setSelectedId(conv.id);
    setMainSection("mensajes");
    setMobileActiveView("chat");
    window.scrollTo({ top: 0, behavior: "instant" });
  }

  const headerActions = (
    <>
      <button
        type="button"
        onClick={() => {
          setChannelsTab("whatsapp");
          setChannelsModalOpen(true);
        }}
        aria-label="Conectar WhatsApp por QR"
        title="Conectar WhatsApp por QR"
        className="inline-flex min-h-10 items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold text-white shadow-xs transition hover:brightness-110 active:scale-95 cursor-pointer"
        style={{ backgroundColor: business.primaryColor || "var(--primary, #FF4F2B)" }}
      >
        <QrCode aria-hidden="true" className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">{evolutionConfig.connected ? "Canales" : "Conectar WhatsApp"}</span>
      </button>

      {whatsappConversations.length > 0 ? (
        <button
          type="button"
          onClick={() => setClearConfirmOpen(true)}
          aria-label="Limpiar bandeja de mensajes"
          title="Limpiar bandeja de mensajes"
          className="inline-flex min-h-10 min-w-10 items-center justify-center gap-1.5 rounded-xl border border-white/10 glass-panel-subtle px-3 py-2 text-xs font-semibold text-slate-700 shadow-xs transition hover:bg-white/10 hover:text-rose-600 dark:text-zinc-300 dark:hover:text-rose-400 cursor-pointer"
        >
          <Trash2 aria-hidden="true" className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Limpiar</span>
        </button>
      ) : (
        <button
          type="button"
          onClick={loadDemoConversation}
          className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-xl border border-white/10 glass-panel-subtle px-3 py-2 text-xs font-semibold text-slate-700 shadow-xs transition hover:bg-white/10 dark:text-zinc-300 cursor-pointer"
        >
          <MessageSquare aria-hidden="true" className="h-3.5 w-3.5 text-emerald-500" />
          <span>Demo</span>
        </button>
      )}
    </>
  );

  return (
    <div className={mobileActiveView !== "list" ? "space-y-0 lg:space-y-4" : "space-y-4"}>
      {/* ═══ HEADER (mismo patrón que Agenda / Clientes) ═══ */}
      <div
        data-tour="crm-header"
        className={`flex-col gap-3 py-1 lg:flex-row lg:items-center lg:justify-between ${
          mobileActiveView !== "list" ? "hidden lg:flex" : "flex"
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
                Mensajes
              </h1>
              <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${
                  evolutionConfig.connected
                    ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    : "border-slate-300/60 bg-slate-100 text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-zinc-400"
                }`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${evolutionConfig.connected ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`} />
                <span>{evolutionConfig.connected ? "WhatsApp en línea" : "WhatsApp desconectado"}</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
              {whatsappConversations.length} {whatsappConversations.length === 1 ? "conversación" : "conversaciones"}
              {unreadTotal > 0 && <> · <span className="font-semibold text-rose-600 dark:text-rose-400">{unreadTotal} sin leer</span></>}
              {pendingOrdersCount > 0 && <> · {pendingOrdersCount} {pendingOrdersCount === 1 ? "pedido pendiente" : "pedidos pendientes"}</>}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2 lg:hidden">{headerActions}</div>
        </div>

        <div className="flex items-center gap-2">
          <div data-tour="crm-switcher" className="crm-switcher min-w-0 flex-1 lg:flex-none">
            <IosSegmentedControl
              options={[
                { value: "mensajes", label: "Chats", icon: MessageSquare, badge: unreadTotal > 0 ? unreadTotal : undefined },
                { value: "pedidos", label: "Pedidos", icon: ShoppingBag, badge: pendingOrdersCount > 0 ? pendingOrdersCount : undefined },
                { value: "metricas", label: "Métricas", icon: BarChart3 },
              ]}
              value={mainSection}
              onChange={setMainSection}
              size="sm"
              className="w-full lg:w-auto"
            />
          </div>
          <div className="hidden shrink-0 items-center gap-2 lg:flex">{headerActions}</div>
        </div>
      </div>

      {/* ═══ VIEW 1: CHATS WORKSPACE (FORMATO APP NATIVO) ═══ */}
      {mainSection === "mensajes" && (
        whatsappConversations.length === 0 ? (
          /* ═══ EMPTY STATE ═══ */
          <div className="rounded-3xl glass-panel p-8 sm:p-12 text-center shadow-xs">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 border border-emerald-200 dark:border-emerald-800/40 mb-4 shadow-xs">
              <QrCode className="h-8 w-8" />
            </div>
            <span className="inline-block rounded-full bg-primary/10 border border-primary/20 px-3.5 py-1 text-xs font-semibold text-primary mb-2">Bandeja vacía</span>
            <h2 className="text-xl sm:text-2xl font-semibold text-slate-900 dark:text-white tracking-tight max-w-xl mx-auto">Conectá tu WhatsApp y recibí mensajes</h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto mt-2 leading-relaxed">
              Vinculá tu WhatsApp escaneando el código QR, recibí consultas de clientes y gestioná turnos y pedidos desde un solo lugar. Instagram y Messenger llegan pronto.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button type="button" onClick={() => setChannelsModalOpen(true)} className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-3 text-xs font-semibold shadow-md transition cursor-pointer">
                <QrCode className="h-4 w-4" /><span>Conectar WhatsApp QR</span>
              </button>
              <button type="button" onClick={loadDemoConversation} className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-white px-4 py-3 text-xs font-semibold border border-slate-200/80 dark:border-white/10 transition cursor-pointer">
                <MessageSquare className="h-4 w-4 text-emerald-500" /><span>Cargar chat de ejemplo</span>
              </button>
            </div>
          </div>
        ) : (
          /* ═══ 3-PANE NATIVE MESSENGER WORKSPACE ═══ */
          <div
            ref={workspaceRef}
            data-crm-view={mobileActiveView}
            className={`crm-workspace w-full rounded-3xl glass-panel-subtle overflow-hidden flex flex-col lg:flex-row ${
              mobileActiveView !== "list"
              ? "h-[calc(var(--crm-visual-viewport-height,100dvh)-7.75rem-env(safe-area-inset-bottom,0px))] sm:h-[calc(var(--crm-visual-viewport-height,100dvh)-7.75rem-env(safe-area-inset-bottom,0px))] lg:h-[calc(100dvh-13.25rem)] min-h-0 sm:min-h-[560px] lg:min-h-[420px]"
              : "h-[calc(var(--crm-visual-viewport-height,100dvh)-14.5rem-env(safe-area-inset-bottom,0px))] sm:h-[calc(var(--crm-visual-viewport-height,100dvh)-11rem)] lg:h-[calc(100dvh-13.25rem)] min-h-0 sm:min-h-[560px] lg:min-h-[420px]"
            }`}
          >
            {/* ── LEFT PANE: CONVERSATION LIST ── */}
            <div
              data-tour="crm-channels"
              className={`w-full lg:w-[320px] xl:w-[350px] shrink-0 border-r border-slate-200/80 dark:border-white/10 flex-col bg-slate-50/70 dark:bg-black/20 backdrop-blur-md ${
                mobileActiveView !== "list" ? "hidden lg:flex" : "flex h-full"
              }`}
            >
              {/* Left Top Search & Filter Bar */}
              <div className="p-3 border-b border-slate-200/70 dark:border-white/10 space-y-2.5 shrink-0 bg-white/60 dark:bg-white/[0.02] backdrop-blur-md">
                {/* Search Input */}
                <div className="relative">
                  <Search className="pointer-events-none absolute z-10 left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    aria-label="Buscar cliente o conversación"
                    placeholder="Buscar cliente o chat..."
                    value={search}
                    onChange={(e) => {
                      setDeepLinkPhone("");
                      setSearch(e.target.value);
                    }}
                    className="w-full rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/70 dark:border-white/10 pl-8 pr-3 py-1.5 text-xs text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                  {search && (
                    <button
                      type="button"
                      aria-label="Limpiar búsqueda"
                      onClick={() => {
                        setDeepLinkPhone("");
                        setSearch("");
                      }}
                      className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>

                {/* Canales: WhatsApp activo; Instagram y Messenger próximamente */}
                <div className="flex items-center gap-1.5 text-[11px]">
                  <span className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-1.5 font-semibold text-emerald-700 dark:text-emerald-300">
                    <ChannelIcon channel="whatsapp" size="sm" />
                    <span>WhatsApp</span>
                  </span>
                  {(["instagram", "messenger"] as const).map((ch) => (
                    <span
                      key={ch}
                      title={`${ch === "instagram" ? "Instagram" : "Messenger"}: próximamente`}
                      aria-label={`${ch === "instagram" ? "Instagram" : "Messenger"}, próximamente`}
                      className="inline-flex cursor-not-allowed items-center gap-1 rounded-xl border border-slate-200/70 px-2 py-1.5 font-semibold text-slate-400 dark:border-white/10 dark:text-zinc-500"
                    >
                      <span className="opacity-50 grayscale"><ChannelIcon channel={ch} size="sm" /></span>
                      <span>Pronto</span>
                    </span>
                  ))}
                </div>

                {/* Sub-Filter: Abiertos / Resueltos */}
                <div className="flex items-center justify-between text-[11px] px-1">
                  <div className="flex items-center gap-2">
                    {(["open", "resolved", "all"] as const).map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setStatusFilter(st)}
                        className={`inline-flex min-h-9 items-center font-semibold transition cursor-pointer ${
                          statusFilter === st
                            ? "text-primary font-semibold border-b-2 border-primary"
                            : "text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
                        }`}
                      >
                        {st === "open" ? "Abiertos" : st === "resolved" ? "Resueltos" : "Todos"}
                      </button>
                    ))}
                  </div>
                  {unreadTotal > 0 && (
                    <span className="text-[11px] font-semibold text-rose-600 dark:text-rose-400">
                      {unreadTotal} sin leer
                    </span>
                  )}
                </div>
              </div>

              {/* Scrollable Conversation Items */}
              <div
                ref={conversationListRef}
                data-tour="crm-conversations-list"
                className="flex-1 overflow-y-auto overscroll-contain divide-y divide-slate-100 dark:divide-white/5"
                onScroll={(event) => {
                  conversationListScrollTopRef.current = event.currentTarget.scrollTop;
                }}
              >
                {filteredConversations.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-400">
                    No hay conversaciones con estos filtros.
                  </div>
                ) : (
                  filteredConversations.map((c) => {
                    const sel = activeConversation?.id === c.id;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => {
                          conversationListScrollTopRef.current = conversationListRef.current?.scrollTop || 0;
                          setSelectedId(c.id);
                          setMobileActiveView("chat");
                          window.scrollTo({ top: 0, behavior: "instant" });
                        }}
                        className={`w-full text-left p-3.5 flex items-start gap-3 transition cursor-pointer relative ${
                          sel
                            ? "bg-white dark:bg-white/10 shadow-xs ring-1 ring-slate-900/5 dark:ring-white/10"
                            : "hover:bg-slate-100/70 dark:hover:bg-white/5"
                        }`}
                      >
                        {/* Avatar */}
                        <div className="relative shrink-0">
                          <ContactAvatar
                            name={c.clientName}
                            phone={c.channelIdentifier}
                            channel={c.channel}
                            tenantSlug={business.slug || "workspace"}
                            whatsappConnected={evolutionConfig.connected}
                            color={business.primaryColor || "#0f172a"}
                            className="h-11 w-11 rounded-2xl font-semibold text-xs shadow-2xs"
                          />
                          <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-white dark:bg-[#1f1c21] shadow-xs border border-slate-200/60 dark:border-white/10">
                            <ChannelIcon channel={c.channel} size="sm" />
                          </span>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1 mb-0.5">
                            <h4 className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                              {c.clientName}
                            </h4>
                            <span className="text-[11px] text-slate-400 shrink-0 font-medium">
                              <ConversationTime value={c.lastMessageTime} timezone={business.timezone} />
                            </span>
                          </div>

                          <div className="flex items-center justify-between gap-1">
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[170px]">
                              {c.lastMessage}
                            </p>
                            {c.unreadCount > 0 && (
                              <span className="flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-rose-500 text-[11px] font-semibold text-white shrink-0">
                                {c.unreadCount}
                              </span>
                            )}
                          </div>

                          <div className="mt-1 flex items-center gap-1.5 text-[11px] text-slate-400 tabular-nums">
                            <span className="truncate">{c.channelIdentifier}</span>
                            {c.status === "resolved" && (
                              <span className="rounded bg-emerald-100 dark:bg-emerald-950/60 px-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
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
              className={`flex-1 flex flex-col min-w-0 min-h-0 bg-[#f8fafc]/40 dark:bg-black/10 backdrop-blur-md relative ${
                mobileActiveView !== "chat" ? "hidden lg:flex" : "flex h-full"
              }`}
            >
              {activeConversation ? (
                <>
                  {/* Chat Top Header */}
                  <div className="min-h-14 px-2 py-2 sm:px-4 border-b border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-white/[0.03] backdrop-blur-xl flex flex-wrap items-center justify-between gap-x-2 gap-y-1 shrink-0">
                    <div className="flex min-w-0 flex-1 items-center gap-1.5 sm:gap-2.5">
                      <button
                        type="button"
                        onClick={returnToConversationList}
                        className="lg:hidden flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-slate-600 transition hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-800 cursor-pointer"
                        aria-label="Volver a lista"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>

                      <div className="relative shrink-0">
                        <ContactAvatar
                          name={activeConversation.clientName}
                          phone={activeConversation.channelIdentifier}
                          channel={activeConversation.channel}
                          tenantSlug={business.slug || "workspace"}
                          whatsappConnected={evolutionConfig.connected}
                          color={business.primaryColor || "#0f172a"}
                          className="h-8 w-8 rounded-xl font-semibold text-[11px] shadow-xs sm:h-9 sm:w-9 sm:text-xs"
                        />
                        <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-white dark:bg-slate-900 shadow-2xs">
                          <ChannelIcon channel={activeConversation.channel} size="sm" />
                        </span>
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="truncate text-sm font-semibold leading-tight text-slate-900 dark:text-white sm:text-sm">
                          {activeConversation.clientName}
                        </h3>
                        <div className="mt-1 flex min-w-0 items-center gap-1.5 truncate tabular-nums text-[11px] text-slate-500 dark:text-slate-400 sm:text-[11px]">
                          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" aria-hidden="true" />
                          <span className="sr-only">En línea</span>
                          <span className="hidden shrink-0 font-semibold text-emerald-600 dark:text-emerald-400 sm:inline" aria-hidden="true">En línea</span>
                          <span className="hidden sm:inline" aria-hidden="true">·</span>
                          <span className="min-w-0 truncate">{activeConversation.channelIdentifier}</span>
                        </div>
                      </div>
                    </div>

                    {/* Right Action Icons in Chat Header */}
                    <div className="flex shrink-0 items-center gap-1 sm:gap-1.5">

                      {activeConversation.status === "resolved" ? (
                        <button
                          type="button"
                          onClick={() => reopenCrmConversation(activeConversation.id)}
                          aria-label="Reabrir conversación"
                          title="Reabrir conversación"
                          className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-700 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-white cursor-pointer sm:h-auto sm:w-auto sm:px-2.5 sm:py-1.5 sm:text-[11px] sm:font-semibold"
                        >
                          <RefreshCw className="h-4 w-4 sm:hidden" />
                          <span className="hidden sm:inline">Reabrir</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => resolveCrmConversation(activeConversation.id)}
                          aria-label="Marcar conversación como resuelta"
                          title="Marcar conversación como resuelta"
                          className="flex h-8 w-8 items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 transition hover:bg-emerald-100 dark:border-emerald-800/60 dark:bg-emerald-950/60 dark:text-emerald-300 cursor-pointer sm:h-auto sm:w-auto sm:px-2.5 sm:py-1.5 sm:text-[11px] sm:font-semibold"
                        >
                          <CheckCircle2 className="h-4 w-4 sm:hidden" />
                          <span className="hidden sm:inline">Resuelto</span>
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
                        aria-label="Ver ficha y acciones del cliente"
                        className={`flex h-8 w-8 items-center justify-center rounded-xl transition cursor-pointer ${
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
                    className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 sm:p-5 space-y-3 bg-transparent"
                  >
                    {/* Security Notice */}
                    <div className="text-center">
                      <span className="rounded-full bg-slate-200/60 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 px-3 py-1 text-[11px] font-semibold text-slate-500 dark:text-slate-400 inline-flex items-center gap-1">
                        <Shield className="h-3 w-3 text-emerald-500" />
                        <span>Conversación cifrada vía WhatsApp</span>
                      </span>
                    </div>

                    {/* Messages stream */}
                    {activeConversation.messages.length === 0 ? (
                      <section className="mx-auto my-4 w-full max-w-md rounded-2xl border border-slate-200/70 bg-white/60 p-5 text-left dark:border-white/10 dark:bg-white/[0.03]">
                        <div className="flex items-start gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                            <MessageSquare className="h-5 w-5" />
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Aún no hay mensajes</h4>
                            <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                              Esta conversación está lista para {activeConversation.clientName}. Cuando haya mensajes, aparecerán aquí.
                            </p>
                          </div>
                        </div>

                        <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-200/70 pt-4 dark:border-white/10">
                          <div className="min-w-0">
                            <dt className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Cliente</dt>
                            <dd className="mt-0.5 truncate text-xs font-semibold text-slate-800 dark:text-slate-200">{activeConversation.clientName}</dd>
                          </div>
                          <div className="min-w-0">
                            <dt className="text-[11px] font-medium text-slate-500 dark:text-slate-400">WhatsApp</dt>
                            <dd className="mt-0.5 truncate text-xs font-semibold text-slate-800 dark:text-slate-200">{activeConversation.channelIdentifier}</dd>
                          </div>
                          {linkedClient && (
                            <>
                              <div>
                                <dt className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Visitas</dt>
                                <dd className="mt-0.5 text-xs font-semibold text-slate-800 dark:text-slate-200">{linkedClient.totalVisits}</dd>
                              </div>
                              <div>
                                <dt className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Consumo total</dt>
                                <dd className="mt-0.5 text-xs font-semibold text-slate-800 dark:text-slate-200">{formatGs(linkedClient.totalSpent)}</dd>
                              </div>
                            </>
                          )}
                          {linkedClient?.notes && (
                            <div className="col-span-2">
                              <dt className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Notas del cliente</dt>
                              <dd className="mt-0.5 text-xs leading-relaxed text-slate-700 dark:text-slate-300">{linkedClient.notes}</dd>
                            </div>
                          )}
                        </dl>

                        <button
                          type="button"
                          onClick={() => setClientProfileModalOpen(true)}
                          className="mt-4 inline-flex min-h-10 items-center justify-center rounded-xl border border-slate-200/80 px-3.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/[0.06]"
                        >
                          Ver ficha completa
                        </button>
                      </section>
                    ) : activeConversation.messages.map((m) => {
                      const isAgent = m.sender === "agent";
                      return (
                        <div key={m.id} className={`flex flex-col ${isAgent ? "items-end" : "items-start"}`}>
                          <div
                            className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-2.5 text-xs shadow-2xs leading-relaxed ${
                              isAgent
                                ? "text-white rounded-tr-xs"
                                : "bg-white/80 dark:bg-white/[0.08] backdrop-blur-md text-slate-900 dark:text-white border border-slate-200/70 dark:border-white/10 rounded-tl-xs"
                            }`}
                            style={isAgent ? { backgroundColor: business.primaryColor || "#0f172a" } : undefined}
                          >
                            <p className="whitespace-pre-wrap">{m.text}</p>

                            {/* Transfer Receipt Attachment */}
                            {m.receiptAttachment && (
                              <div className="mt-2.5 rounded-2xl border border-emerald-500/30 bg-emerald-50/90 dark:bg-emerald-950/50 p-3 text-slate-800 dark:text-slate-100 space-y-2">
                                <div className="flex items-center justify-between border-b border-emerald-500/20 pb-1.5">
                                  <div className="flex items-center gap-1.5 font-semibold text-xs text-emerald-800 dark:text-emerald-300">
                                    <Building2 className="h-4 w-4 text-emerald-600" />
                                    <span>{m.receiptAttachment.bankOrigin}</span>
                                  </div>
                                  <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
                                    Transferencia
                                  </span>
                                </div>

                                <div className="flex items-baseline justify-between">
                                  <span className="text-[11px] text-slate-500 dark:text-slate-400">Monto Acreditado:</span>
                                  <span className="text-sm font-semibold text-slate-900 dark:text-white">
                                    {formatGs(m.receiptAttachment.amount)}
                                  </span>
                                </div>

                                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 tabular-nums">
                                  <span>Operación:</span>
                                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                                    {m.receiptAttachment.operationNumber}
                                  </span>
                                </div>

                                <div className="grid grid-cols-2 gap-1.5 pt-1 text-[11px]">
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
                                      className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2 text-[11px] transition shadow-xs cursor-pointer"
                                    >
                                      <CheckCircle2 className="h-3.5 w-3.5" />
                                      <span>Aprobar Transferencia</span>
                                    </button>
                                  ) : (
                                    <div className="w-full py-1.5 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 font-semibold text-[11px] flex items-center justify-center gap-1.5">
                                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                                      <span>Comprobante Aprobado & Turno Confirmado</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            <div
                              className={`mt-1 flex items-center justify-end gap-1 text-[11px] ${
                                isAgent ? "text-white/80" : "text-slate-400"
                              }`}
                            >
                              <span>
                                <ConversationTime value={m.timestamp} timezone={business.timezone} />
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
                        <div className="flex items-center gap-2.5 rounded-2xl bg-white/80 dark:bg-white/[0.08] backdrop-blur-md text-slate-800 dark:text-slate-200 border border-slate-200/70 dark:border-white/10 px-4 py-2.5 text-xs shadow-2xs rounded-tl-xs">
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
                  <div className="px-3.5 py-1.5 border-t border-slate-200/70 dark:border-white/10 bg-white/80 dark:bg-white/[0.03] backdrop-blur-md flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 shrink-0 flex items-center gap-1 mr-1">
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
                  <div className="p-2.5 sm:p-3 border-t border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-white/[0.03] backdrop-blur-md flex items-center gap-2 shrink-0">
                    <input
                      ref={inputRef}
                      type="text"
                      placeholder={`Escribe un mensaje a ${activeConversation.clientName}...`}
                      value={replyText}
                      onFocus={() => setReplyInputFocused(true)}
                      onBlur={() => setReplyInputFocused(false)}
                      onChange={(e) => setReplyText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleSend();
                        }
                      }}
                      className="flex-1 rounded-2xl bg-slate-100/80 dark:bg-white/[0.05] border border-slate-200/70 dark:border-white/10 px-4 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/40 backdrop-blur-md"
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
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Seleccioná una conversación para chatear
                  </p>
                </div>
              )}
            </div>

            {/* ── RIGHT PANE: CLIENT INTELLIGENCE & ACTIONS DRAWER ── */}
            <div
              data-tour="crm-client-profile"
              className={`w-full lg:w-[290px] xl:w-[330px] shrink-0 border-l border-slate-200/80 dark:border-white/10 flex-col bg-white/70 dark:bg-black/20 backdrop-blur-md ${
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
                  <div className="h-14 px-4 border-b border-slate-200/80 dark:border-white/10 flex items-center justify-between shrink-0 bg-slate-50/50 dark:bg-white/[0.03] backdrop-blur-md">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setMobileActiveView("chat")}
                        aria-label="Volver al chat"
                        className="lg:hidden p-1.5 rounded-xl text-slate-600 hover:bg-slate-100"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                        Ficha del contacto
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
                      <ContactAvatar
                        name={activeConversation.clientName}
                        phone={activeConversation.channelIdentifier}
                        channel={activeConversation.channel}
                        tenantSlug={business.slug || "workspace"}
                      whatsappConnected={evolutionConfig.connected}
                        color={business.primaryColor || "#0f172a"}
                        className="mx-auto mb-2 h-14 w-14 rounded-3xl font-semibold text-lg shadow-xs"
                      />
                      <h3 className="font-semibold text-sm text-slate-900 dark:text-white">
                        {activeConversation.clientName}
                      </h3>
                      <p className="text-[11px] text-slate-400 tabular-nums mt-0.5">
                        {activeConversation.channelIdentifier}
                      </p>
                      {linkedClient?.tags && (
                        <div className="mt-2 flex flex-wrap items-center justify-center gap-1">
                          {linkedClient.tags.map((t) => (
                            <span key={t} className="rounded-full bg-primary/10 text-primary text-[11px] font-semibold px-2 py-0.5">
                              {t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-slate-500 dark:text-zinc-400">Acciones</p>
                      <button
                        type="button"
                        onClick={() => {
                          router.push(`/dashboard/calendario?newForClient=${linkedClient?.id || ""}`);
                          pushToast("success", `Abriendo calendario para agendar a ${activeConversation.clientName}`);
                        }}
                        style={{ backgroundColor: business.primaryColor || "var(--primary, #FF4F2B)" }}
                        className="w-full flex items-center justify-center gap-2 rounded-2xl text-white py-2.5 text-xs font-semibold shadow-xs transition cursor-pointer hover:brightness-110 active:scale-98"
                      >
                        <Calendar className="h-4 w-4" />
                        <span>Agendar turno</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setOrderModalOpen(true)}
                        className="w-full flex items-center justify-center gap-2 rounded-2xl border border-slate-200/80 bg-white hover:bg-slate-50 dark:border-white/10 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] text-slate-800 dark:text-zinc-100 py-2.5 text-xs font-semibold shadow-xs transition cursor-pointer active:scale-98"
                      >
                        <ShoppingBag className="h-4 w-4" />
                        <span>Crear pedido</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setClientProfileModalOpen(true)}
                        className="w-full flex items-center justify-center gap-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 transition cursor-pointer"
                      >
                        <User className="h-3.5 w-3.5" />
                        <span>Ver ficha completa</span>
                      </button>
                    </div>

                    {/* Active Channel Card */}
                    <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-white/10">
                      <p className="text-xs font-semibold text-slate-500 dark:text-zinc-400">Canal</p>
                      <div className="flex items-center justify-between text-xs p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-white/5">
                        <div className="flex items-center gap-2">
                          <ChannelIcon channel={activeConversation.channel} size="sm" />
                          <span className="font-semibold text-slate-800 dark:text-slate-200">WhatsApp</span>
                        </div>
                        <span className={`text-[11px] font-semibold ${evolutionConfig.connected ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400"}`}>{evolutionConfig.connected ? "Conectado" : "Desconectado"}</span>
                      </div>
                    </div>

                    {/* Loyalty Info */}
                    {linkedClient && (
                      <div className="p-3 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/40 space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-amber-900 dark:text-amber-300 flex items-center gap-1">
                            <Award className="h-3.5 w-3.5 text-amber-500" /> Fidelización
                          </span>
                          <span className="tabular-nums font-semibold text-amber-800 dark:text-amber-200">
                            {linkedClient.loyaltyPoints} / 5 sellos
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400">
                          <span>Consumo total:</span>
                          <span className="font-semibold text-slate-900 dark:text-white">
                            {formatGs(linkedClient.totalSpent)}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Order History */}
                    {clientOrderHistory.length > 0 && (
                      <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-white/10">
                        <p className="text-xs font-semibold text-slate-500 dark:text-zinc-400 flex items-center gap-1">
                          <History className="h-3 w-3" /> Últimos pedidos
                        </p>
                        {clientOrderHistory.slice(0, 3).map((o) => (
                          <div key={o.id} className="flex items-center justify-between text-[11px] p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                            <div>
                              <span className="font-semibold text-slate-800 dark:text-slate-200">{o.orderNumber}</span>
                              <span className="ml-1.5 text-[11px] font-semibold text-slate-400">{ORDER_STATUS_LABELS[o.status].label}</span>
                            </div>
                            <span className="tabular-nums font-semibold text-slate-700 dark:text-slate-300">{formatGs(o.totalAmount)}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Transfers History */}
                    {clientReceipts.length > 0 && (
                      <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-white/10">
                        <p className="text-xs font-semibold text-slate-500 dark:text-zinc-400 flex items-center gap-1">
                          <Building2 className="h-3 w-3 text-emerald-500" /> Transferencias
                        </p>
                        {clientReceipts.map((r) => (
                          <div key={r.id} className="flex items-center justify-between text-[11px] p-2 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-500/20">
                            <div>
                              <span className="font-semibold text-slate-800 dark:text-slate-200 block">{r.bankOrigin || "Banco Itaú"}</span>
                              <span className="text-[11px] text-slate-400 tabular-nums">{r.operationNumber || "Transferencia"}</span>
                            </div>
                            <div className="text-right">
                              <span className="tabular-nums font-semibold text-slate-900 dark:text-white block">{formatGs(r.amount)}</span>
                              <span className={`text-[11px] font-semibold ${r.status === "approved" ? "text-emerald-600" : "text-amber-600"}`}>
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

      {/* ═══ VIEW 2: MÉTRICAS ═══ */}
      {mainSection === "metricas" && (
        <div className="space-y-4 pb-[calc(6rem+env(safe-area-inset-bottom,0px))] sm:space-y-5 lg:pb-0">
          {/* KPIs de la bandeja */}
          <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4">
            {[
              { label: "Conversaciones", value: String(whatsappConversations.length), hint: `${openCount} ${openCount === 1 ? "abierta" : "abiertas"}`, icon: MessageSquare, tone: "text-slate-900 dark:text-white", iconTone: "bg-primary/10 text-primary" },
              { label: "Sin leer", value: String(unreadTotal), hint: `${unreadChatsCount} ${unreadChatsCount === 1 ? "chat por responder" : "chats por responder"}`, icon: Clock, tone: unreadTotal > 0 ? "text-rose-600 dark:text-rose-400" : "text-slate-900 dark:text-white", iconTone: "bg-rose-500/10 text-rose-500" },
              { label: "Resolución", value: `${resolutionPct}%`, hint: `${resolvedCount} de ${whatsappConversations.length} resueltas`, icon: CheckCircle2, tone: "text-slate-900 dark:text-white", iconTone: "bg-emerald-500/10 text-emerald-600" },
              { label: "Tiempo de respuesta", value: avgResponseLabel, hint: "Promedio por consulta", icon: Zap, tone: "text-slate-900 dark:text-white", iconTone: "bg-amber-500/10 text-amber-600" },
            ].map((k) => (
              <Card key={k.label} className="min-w-0 p-3 sm:p-4">
                <div className="flex items-start justify-between gap-2">
                  <p className="truncate text-[11px] font-semibold text-slate-500 dark:text-zinc-400 sm:text-xs">{k.label}</p>
                  <span className={`hidden h-8 w-8 shrink-0 items-center justify-center rounded-xl sm:flex ${k.iconTone}`}>
                    <k.icon className="h-4 w-4" />
                  </span>
                </div>
                <p className={`mt-1 truncate text-xl font-semibold tabular-nums sm:text-2xl ${k.tone}`}>{k.value}</p>
                <p className="mt-0.5 truncate text-[11px] text-slate-400 dark:text-zinc-500">{k.hint}</p>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {/* Pedidos generados desde el chat */}
            <div className="rounded-3xl glass-panel p-4 sm:p-5">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Pedidos de productos</h2>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">Ventas cerradas por chat</p>
                </div>
                <button
                  type="button"
                  onClick={() => setMainSection("pedidos")}
                  className="inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-xl border border-white/10 glass-panel-subtle px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-white/10 dark:text-zinc-300 cursor-pointer"
                >
                  <ShoppingBag className="h-3.5 w-3.5" />
                  <span>Ver pedidos</span>
                </button>
              </div>

              <dl className="mt-4 grid grid-cols-2 gap-2">
                {[
                  { label: "Facturado", value: formatGs(totalOrderRevenue), tone: "text-emerald-600 dark:text-emerald-400" },
                  { label: "Ticket promedio", value: activeOrders.length > 0 ? formatGs(avgOrderTicket) : "—", tone: "text-slate-900 dark:text-white" },
                  { label: "Pendientes", value: String(pendingOrdersCount), tone: pendingOrdersCount > 0 ? "text-amber-600 dark:text-amber-400" : "text-slate-900 dark:text-white" },
                  { label: "Entregados", value: String(deliveredOrdersCount), tone: "text-slate-900 dark:text-white" },
                ].map((r) => (
                  <div key={r.label} className="min-w-0 rounded-2xl border border-slate-200/60 bg-slate-50 p-3 dark:border-white/5 dark:bg-slate-900/50">
                    <dt className="text-[11px] font-medium text-slate-500 dark:text-zinc-400">{r.label}</dt>
                    <dd className={`mt-0.5 truncate text-sm font-semibold tabular-nums ${r.tone}`}>{r.value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            {/* Estado del canal de WhatsApp */}
            <div className="rounded-3xl glass-panel p-4 sm:p-5">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="text-sm font-semibold text-slate-900 dark:text-white">WhatsApp</h2>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">Conexión y asistente automático</p>
                </div>
                <button
                  type="button"
                  onClick={() => router.push("/dashboard/whatsapp")}
                  className="inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-xl border border-white/10 glass-panel-subtle px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-white/10 dark:text-zinc-300 cursor-pointer"
                >
                  <Bot className="h-3.5 w-3.5" />
                  <span>Configurar</span>
                </button>
              </div>

              <ul className="mt-4 divide-y divide-slate-100 rounded-2xl border border-slate-200/60 dark:divide-white/5 dark:border-white/5">
                <li className="flex items-center justify-between gap-3 p-3">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <ChannelIcon channel="whatsapp" size="md" />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-800 dark:text-zinc-200">Línea</p>
                      <p className="truncate text-[11px] tabular-nums text-slate-500 dark:text-zinc-400">{evolutionConfig.phoneNumber || "Sin número vinculado"}</p>
                    </div>
                  </div>
                  <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold ${evolutionConfig.connected ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-slate-100 text-slate-500 dark:bg-white/5 dark:text-zinc-400"}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${evolutionConfig.connected ? "bg-emerald-500" : "bg-slate-400"}`} />
                    {evolutionConfig.connected ? "En línea" : "Desconectado"}
                  </span>
                </li>
                <li className="flex items-center justify-between gap-3 p-3">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <Bot className={`h-4 w-4 shrink-0 ${evolutionConfig.autoBotEnabled ? "text-emerald-500" : "text-slate-400"}`} />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-800 dark:text-zinc-200">Asistente automático</p>
                      <p className="truncate text-[11px] text-slate-500 dark:text-zinc-400">
                        {evolutionConfig.autoBotEnabled ? "Responde consultas y agenda turnos" : "Respondés vos manualmente"}
                      </p>
                    </div>
                  </div>
                  <span className="shrink-0 text-[11px] font-semibold text-slate-600 dark:text-zinc-300">
                    {evolutionConfig.autoBotEnabled ? "Activo" : "Apagado"}
                  </span>
                </li>
                <li className="flex items-center justify-between gap-3 p-3">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <ShieldCheck className={`h-4 w-4 shrink-0 ${evolutionConfig.autoBotEnabled ? "text-emerald-500" : "text-slate-400"}`} />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-800 dark:text-zinc-200">Cadencia anti-bloqueo</p>
                      <p className="truncate text-[11px] text-slate-500 dark:text-zinc-400">Pausa humana antes de cada respuesta automática</p>
                    </div>
                  </div>
                  <span className="shrink-0 text-[11px] font-semibold tabular-nums text-slate-600 dark:text-zinc-300">
                    {evolutionConfig.autoBotEnabled ? `~${cadenceSeconds} s` : "—"}
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* ═══ VIEW 3: PEDIDOS ═══ */}
      {mainSection === "pedidos" && (
        <div className="space-y-4 pb-[calc(6rem+env(safe-area-inset-bottom,0px))] sm:space-y-5 lg:pb-0">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3">
            {[
              { label: "Pedidos", value: String(productOrders.length), icon: ShoppingBag, tone: "text-slate-900 dark:text-white", iconTone: "bg-primary/10 text-primary" },
              { label: "Pendientes", value: String(pendingOrdersCount), icon: Clock, tone: pendingOrdersCount > 0 ? "text-amber-600 dark:text-amber-400" : "text-slate-900 dark:text-white", iconTone: "bg-amber-500/10 text-amber-600" },
              { label: "Facturado", value: formatGs(totalOrderRevenue), icon: CreditCard, tone: "text-emerald-600 dark:text-emerald-400", iconTone: "bg-emerald-500/10 text-emerald-600" },
            ].map((k) => (
              <Card key={k.label} className={`min-w-0 p-3 sm:p-4 ${k.label === "Facturado" ? "col-span-2 sm:col-span-1" : ""}`}>
                <div className="flex items-start justify-between gap-2">
                  <p className="truncate text-[11px] font-semibold text-slate-500 dark:text-zinc-400 sm:text-xs">{k.label}</p>
                  <span className={`hidden h-8 w-8 shrink-0 items-center justify-center rounded-xl sm:flex ${k.iconTone}`}>
                    <k.icon className="h-4 w-4" />
                  </span>
                </div>
                <p className={`mt-1 truncate text-xl font-semibold tabular-nums sm:text-2xl ${k.tone}`}>{k.value}</p>
              </Card>
            ))}
          </div>

          <div className="flex flex-col gap-2.5 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:order-2 lg:w-64 lg:shrink-0">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                aria-label="Buscar pedido"
                placeholder="Buscar por cliente o número..."
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
                className="h-10 w-full rounded-xl border border-slate-200/80 bg-white/70 pl-9 pr-3 text-xs text-slate-800 transition placeholder:text-slate-400 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/25 dark:border-white/10 dark:bg-slate-800/70 dark:text-white"
              />
            </div>
            <div role="group" aria-label="Filtrar por estado" className="-mx-1 flex min-w-0 items-center gap-1.5 overflow-x-auto px-1 pb-1 no-scrollbar lg:order-1 lg:mx-0 lg:px-0 lg:pb-0">
              {ORDER_FILTERS.map((tab) => {
                const count = tab.id === "all" ? productOrders.length : productOrders.filter((o) => o.status === tab.id).length;
                const active = orderStatusFilter === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setOrderStatusFilter(tab.id)}
                    style={active ? { backgroundColor: business.primaryColor || "#0f172a", color: "#ffffff" } : undefined}
                    className={`flex min-h-9 shrink-0 items-center gap-1.5 rounded-xl px-3 text-xs font-semibold transition cursor-pointer ${
                      active
                        ? "shadow-2xs"
                        : "border border-slate-200/80 text-slate-600 hover:bg-slate-100 dark:border-white/10 dark:text-slate-300 dark:hover:bg-slate-800"
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span className={`tabular-nums text-[11px] ${active ? "text-white/80" : "text-slate-400"}`}>{count}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {filteredOrders.length === 0 ? (
            <div className="rounded-3xl glass-panel p-8 text-center sm:p-12">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <ShoppingBag className="h-6 w-6" />
              </div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                {productOrders.length === 0 ? "Todavía no hay pedidos" : "No hay pedidos con estos filtros"}
              </h3>
              <p className="mx-auto mt-1 max-w-sm text-xs text-slate-500 dark:text-zinc-400">
                {productOrders.length === 0
                  ? "Creá un pedido desde la ficha de un chat con “Crear pedido”."
                  : "Probá con otro estado o buscá por otro nombre."}
              </p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3">
              {filteredOrders.map((ord) => {
                const isPending = ord.status === "pending";
                const isConfirmed = ord.status === "confirmed";
                const isDelivered = ord.status === "delivered";
                const isCancelled = ord.status === "cancelled";
                const st = ORDER_STATUS_LABELS[ord.status];
                return (
                  <Card key={ord.id} className={`flex min-w-0 flex-col p-4 ${isCancelled ? "opacity-70" : ""}`}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="tabular-nums text-xs font-semibold text-slate-900 dark:text-white">{ord.orderNumber}</p>
                        <p className="text-[11px] text-slate-400">{formatProfileDate(ord.createdAt, business.timezone, true)}</p>
                      </div>
                      <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${st.className}`}>{st.label}</span>
                    </div>

                    <div className="mt-3 flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{ord.clientName}</p>
                        <p className="truncate text-xs tabular-nums text-slate-500 dark:text-zinc-400">{ord.clientPhone}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => openChatForPhone(ord.clientPhone)}
                        aria-label={`Abrir chat con ${ord.clientName}`}
                        title="Abrir chat"
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200/80 text-slate-600 transition hover:bg-emerald-500/10 hover:text-emerald-600 dark:border-white/10 dark:text-zinc-300 cursor-pointer"
                      >
                        <MessageSquare className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500 dark:text-zinc-400">
                      <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2 py-0.5 dark:bg-white/5">
                        {ord.deliveryType === "retirar_en_local" ? <Store className="h-3 w-3 text-emerald-500" /> : <Truck className="h-3 w-3 text-indigo-500" />}
                        {ord.deliveryType === "retirar_en_local" ? "Retiro en local" : "Delivery"}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2 py-0.5 dark:bg-white/5">
                        <CreditCard className="h-3 w-3" />
                        {PAYMENT_LABELS[ord.paymentMethod] || ord.paymentMethod}
                      </span>
                    </div>

                    <ul className="mt-3 space-y-1 border-t border-slate-100 pt-2.5 text-xs dark:border-white/5">
                      {ord.items.map((item, idx) => (
                        <li key={idx} className="flex items-start justify-between gap-3">
                          <span className="min-w-0 break-words text-slate-700 dark:text-zinc-300">
                            <span className="font-semibold tabular-nums text-slate-900 dark:text-white">{item.qty}×</span> {item.productName}
                          </span>
                          <span className="shrink-0 whitespace-nowrap tabular-nums text-slate-500 dark:text-zinc-400">{formatGs(item.unitPrice * item.qty)}</span>
                        </li>
                      ))}
                    </ul>
                    {ord.notes && (
                      <p className="mt-2 rounded-lg border border-amber-500/15 bg-amber-500/5 p-2 text-[11px] text-slate-600 dark:text-zinc-400">{ord.notes}</p>
                    )}

                    <div className="mt-auto space-y-2.5 pt-3">
                      <div className="flex items-baseline justify-between gap-3 border-t border-slate-100 pt-3 dark:border-white/5">
                        <span className="text-xs text-slate-500 dark:text-zinc-400">Total</span>
                        <span className="whitespace-nowrap text-base font-semibold tabular-nums text-slate-900 dark:text-white">{formatGs(ord.totalAmount)}</span>
                      </div>
                      {isDelivered ? (
                        <p className="flex min-h-10 items-center justify-center gap-1.5 rounded-xl bg-emerald-500/10 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="h-4 w-4" /> Entregado y registrado en caja
                        </p>
                      ) : isCancelled ? null : (
                        <div className="flex items-center gap-1.5">
                          {isPending && (
                            <button
                              type="button"
                              onClick={() => changeOrderStatus(ord.id, "confirmed", `${ord.orderNumber} confirmado`)}
                              disabled={updatingOrderId === ord.id}
                              className="min-h-10 flex-1 rounded-xl border border-slate-200/80 bg-white text-xs font-semibold text-slate-800 transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/[0.04] dark:text-zinc-100 dark:hover:bg-white/[0.08] cursor-pointer"
                            >
                              Confirmar
                            </button>
                          )}
                          {(isPending || isConfirmed) && (
                            <button
                              type="button"
                              onClick={() => changeOrderStatus(ord.id, "delivered", `${ord.orderNumber} entregado: stock descontado e ingreso en caja`)}
                              disabled={updatingOrderId === ord.id}
                              style={{ backgroundColor: business.primaryColor || "var(--primary, #FF4F2B)" }}
                              className="flex min-h-10 flex-1 items-center justify-center gap-1 rounded-xl text-xs font-semibold text-white transition hover:brightness-110 cursor-pointer"
                            >
                              <Check className="h-3.5 w-3.5" /> Entregado
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => changeOrderStatus(ord.id, "cancelled", `${ord.orderNumber} cancelado`)}
                            disabled={updatingOrderId === ord.id}
                            aria-label={`Cancelar ${ord.orderNumber}`}
                            title="Cancelar pedido"
                            className="flex min-h-10 min-w-10 items-center justify-center rounded-xl border border-slate-200/80 text-slate-500 transition hover:bg-rose-500/10 hover:text-rose-600 dark:border-white/10 cursor-pointer"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {clearedConversations && (
        <div
          role="status"
          aria-live="polite"
          className="fixed left-1/2 top-[calc(5.5rem+env(safe-area-inset-top,0px))] z-[100] flex w-[calc(100%-2rem)] max-w-md -translate-x-1/2 items-center justify-between gap-3 rounded-2xl border border-slate-200/70 bg-slate-950/95 px-4 py-3 text-white shadow-xl backdrop-blur-xl lg:left-auto lg:right-6 lg:top-24 lg:translate-x-0"
        >
          <span className="min-w-0 text-xs font-semibold">
            {clearedConversations.conversations.length} {clearedConversations.conversations.length === 1 ? "conversación quitada" : "conversaciones quitadas"}
          </span>
          <button
            type="button"
            onClick={undoClearConversations}
            className="shrink-0 rounded-xl bg-white/10 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
          >
            Deshacer
          </button>
          <button
            type="button"
            onClick={() => {
              setClearedConversations(null);
              if (clearUndoTimerRef.current) clearTimeout(clearUndoTimerRef.current);
              clearUndoTimerRef.current = null;
            }}
            aria-label="Cerrar aviso"
            className="shrink-0 rounded-lg p-1.5 text-white/70 transition hover:bg-white/10 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <Modal
        open={clearConfirmOpen}
        onClose={() => setClearConfirmOpen(false)}
        title="¿Limpiar la bandeja?"
        maxWidth="max-w-md"
        footer={
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => setClearConfirmOpen(false)}
              className="rounded-xl border border-slate-200/80 px-4 py-2.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={confirmClearConversations}
              className="rounded-xl bg-rose-600 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-rose-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
            >
              Limpiar {crmConversations.length} {crmConversations.length === 1 ? "conversación" : "conversaciones"}
            </button>
          </div>
        }
      >
        <div className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
          <p>
            {crmConversations.length === 1
              ? "Se quitará de la bandeja 1 conversación."
              : `Se quitarán de la bandeja las ${crmConversations.length} conversaciones actuales.`}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">Durante 10 segundos podrás deshacer esta acción.</p>
        </div>
      </Modal>

      {/* ═══ CHANNELS CONNECTION MODAL (WhatsApp; Instagram y Messenger próximamente) ═══ */}
      <Modal open={channelsModalOpen} onClose={() => setChannelsModalOpen(false)} title="Canales de mensajería" maxWidth="max-w-3xl">
        <div className="space-y-5 text-xs">
          {/* 3 Channel Tabs */}
          <div className="grid grid-cols-3 gap-2 p-1.5 bg-slate-100 dark:bg-slate-800 rounded-2xl">
            {([
              { key: "whatsapp" as const, label: "WhatsApp", channel: "whatsapp" as const, isConnected: evolutionConfig.connected, comingSoon: false },
              { key: "instagram" as const, label: "Instagram", channel: "instagram" as const, isConnected: false, comingSoon: true },
              { key: "facebook" as const, label: "Messenger", channel: "messenger" as const, isConnected: false, comingSoon: true },
            ]).map((ch) => (
              <button
                key={ch.key}
                type="button"
                disabled={ch.comingSoon}
                onClick={() => setChannelsTab(ch.key)}
                title={ch.comingSoon ? `${ch.label}: próximamente` : undefined}
                className={`py-2.5 text-center rounded-xl font-semibold transition flex items-center justify-center gap-2 ${
                  ch.comingSoon
                    ? "cursor-not-allowed text-slate-400 dark:text-zinc-500"
                    : channelsTab === ch.key
                    ? "cursor-pointer bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs"
                    : "cursor-pointer text-slate-500 hover:text-slate-800 dark:hover:text-white"
                }`}
              >
                <div className={`relative flex items-center justify-center ${ch.comingSoon ? "opacity-50 grayscale" : ""}`}>
                  <ChannelIcon channel={ch.channel} size="sm" />
                  {ch.isConnected && (
                    <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-emerald-500 border border-white dark:border-slate-800" />
                  )}
                </div>
                <span className="text-xs">{ch.label}</span>
                {ch.comingSoon && (
                  <span className="rounded-full border border-slate-300/60 bg-slate-200/60 px-1.5 py-0.5 text-[11px] font-semibold text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-zinc-400">
                    Próximamente
                  </span>
                )}
                {ch.isConnected && (
                  <span className="text-[11px] bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 font-semibold px-1.5 py-0.5 rounded-full hidden sm:inline-block">
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
                          <span className="text-[11px] font-medium">Generando QR...</span>
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
                  <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 tabular-nums">
                    <RefreshCw className="h-3.5 w-3.5 animate-spin text-emerald-500" />
                    <span>Actualiza en {qrCounter}s</span>
                  </div>
                </div>

                {/* Right: Instructions & Action */}
                <div className="md:col-span-7 flex flex-col justify-between space-y-4">
                  <div>
                    <h5 className="font-semibold text-base text-slate-900 dark:text-white flex items-center gap-2">
                      <Smartphone className="h-4 w-4 text-emerald-600" />
                      <span>Vincular WhatsApp de tu Negocio</span>
                    </h5>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Conectá tu línea para recibir y responder las consultas de tus clientes desde tu panel.
                    </p>
                  </div>

                  <ol className="space-y-2.5 text-slate-600 dark:text-slate-300 text-xs">
                    <li className="flex items-start gap-2.5">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-semibold text-[11px]">1</span>
                      <span>Abrí <strong>WhatsApp</strong> en tu teléfono celular.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-semibold text-[11px]">2</span>
                      <span>Andá a <strong>Ajustes → Dispositivos Vinculados</strong>.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-semibold text-[11px]">3</span>
                      <span>Tocá <strong>Vincular un dispositivo</strong> y apuntá al código QR.</span>
                    </li>
                  </ol>

                  {evolutionConfig.connected ? (
                    <div className="flex items-center justify-between p-3.5 rounded-2xl bg-emerald-100/80 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        <span className="font-semibold text-emerald-800 dark:text-emerald-300 text-xs">
                          Línea vinculada: {evolutionConfig.phoneNumber || business.phone || "+595 981 765 432"}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          updateEvolutionConfig({ connected: false, phoneNumber: "" });
                          pushToast("error", "WhatsApp desconectado.");
                        }}
                        className="text-xs font-semibold text-rose-600 hover:underline cursor-pointer"
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
                        className="rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-4 py-2 text-xs transition cursor-pointer shrink-0 shadow-xs"
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
                    <span className="font-semibold text-sm mt-3">Instagram Direct</span>
                    <span className="text-[11px] text-white/80 font-medium">Bandeja Profesional</span>
                  </div>
                  <div className="mt-3 flex items-center gap-1.5 text-[11px] font-medium">
                    <span className={`h-2 w-2 rounded-full ${evolutionConfig.instagramConnected ? "bg-emerald-500 animate-pulse" : "bg-slate-300 dark:bg-slate-600"}`} />
                    <span className={evolutionConfig.instagramConnected ? "text-emerald-600 dark:text-emerald-400 font-semibold" : "text-slate-500 dark:text-slate-400"}>
                      {evolutionConfig.instagramConnected ? `Conectado (${evolutionConfig.instagramHandle || "@barberia_central"})` : "Listo para conectar"}
                    </span>
                  </div>
                </div>

                {/* Right: Instructions & Action */}
                <div className="md:col-span-7 flex flex-col justify-between space-y-4">
                  <div>
                    <h5 className="font-semibold text-base text-slate-900 dark:text-white flex items-center gap-2">
                      <ChannelIcon channel="instagram" size="sm" />
                      <span>Conectar Instagram Direct</span>
                    </h5>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Centralizá los mensajes directos de tus clientes en la misma bandeja unificada.
                    </p>
                  </div>

                  <ol className="space-y-2.5 text-slate-600 dark:text-slate-300 text-xs">
                    <li className="flex items-start gap-2.5">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-pink-100 dark:bg-pink-950 text-pink-700 dark:text-pink-300 font-semibold text-[11px]">1</span>
                      <span>Convertí tu cuenta a <strong>Cuenta Profesional</strong> en Instagram.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-pink-100 dark:bg-pink-950 text-pink-700 dark:text-pink-300 font-semibold text-[11px]">2</span>
                      <span>Vinculá tu cuenta a la <strong>Página de Facebook</strong> del negocio.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-pink-100 dark:bg-pink-950 text-pink-700 dark:text-pink-300 font-semibold text-[11px]">3</span>
                      <span>Autorizá el acceso para recibir mensajes directamente en AgendatePY.</span>
                    </li>
                  </ol>

                  {evolutionConfig.instagramConnected ? (
                    <div className="flex items-center justify-between p-3.5 rounded-2xl bg-emerald-100/80 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        <span className="font-semibold text-emerald-800 dark:text-emerald-300 text-xs">
                          Cuenta vinculada: {evolutionConfig.instagramHandle || "@barberia_central"}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          updateEvolutionConfig({ instagramConnected: false });
                          pushToast("error", "Instagram Direct desconectado.");
                        }}
                        className="text-xs font-semibold text-rose-600 hover:underline cursor-pointer"
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
                        className="w-full rounded-xl bg-[#E1306C] hover:bg-[#d02560] text-white font-semibold py-3 text-xs shadow-xs transition cursor-pointer flex items-center justify-center gap-2"
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
                    <span className="font-semibold text-sm mt-3">Facebook Messenger</span>
                    <span className="text-[11px] text-white/80 font-medium">Página Comercial</span>
                  </div>
                  <div className="mt-3 flex items-center gap-1.5 text-[11px] font-medium">
                    <span className={`h-2 w-2 rounded-full ${evolutionConfig.messengerConnected ? "bg-emerald-500 animate-pulse" : "bg-slate-300 dark:bg-slate-600"}`} />
                    <span className={evolutionConfig.messengerConnected ? "text-emerald-600 dark:text-emerald-400 font-semibold" : "text-slate-500 dark:text-slate-400"}>
                      {evolutionConfig.messengerConnected ? `Conectado (${evolutionConfig.messengerPage || "Barbería & Studio Central"})` : "Listo para conectar"}
                    </span>
                  </div>
                </div>

                {/* Right: Instructions & Action */}
                <div className="md:col-span-7 flex flex-col justify-between space-y-4">
                  <div>
                    <h5 className="font-semibold text-base text-slate-900 dark:text-white flex items-center gap-2">
                      <ChannelIcon channel="messenger" size="sm" />
                      <span>Conectar Facebook Messenger</span>
                    </h5>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Gestioná consultas y citas que tus clientes envían a la página de tu negocio.
                    </p>
                  </div>

                  <ol className="space-y-2.5 text-slate-600 dark:text-slate-300 text-xs">
                    <li className="flex items-start gap-2.5">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-semibold text-[11px]">1</span>
                      <span>Asegurate de ser <strong>administrador</strong> de la Página de Facebook.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-semibold text-[11px]">2</span>
                      <span>Hacé clic en Conectar y seleccioná tu Página de Facebook.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-semibold text-[11px]">3</span>
                      <span>Otorgá permisos de mensajería y la vinculación quedará lista.</span>
                    </li>
                  </ol>

                  {evolutionConfig.messengerConnected ? (
                    <div className="flex items-center justify-between p-3.5 rounded-2xl bg-blue-100/80 dark:bg-blue-950/60 border border-blue-300 dark:border-blue-800">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-blue-600" />
                        <span className="font-semibold text-blue-800 dark:text-blue-300 text-xs">
                          Página vinculada: {evolutionConfig.messengerPage || "Barbería & Studio Central"}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          updateEvolutionConfig({ messengerConnected: false });
                          pushToast("error", "Facebook Messenger desconectado.");
                        }}
                        className="text-xs font-semibold text-rose-600 hover:underline cursor-pointer"
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
                        className="w-full rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 text-xs shadow-sm transition cursor-pointer flex items-center justify-center gap-2"
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
              className="rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-semibold px-5 py-2 hover:opacity-90 transition cursor-pointer text-xs"
            >
              Listo
            </button>
          </div>
        </div>
      </Modal>

      {/* ═══ CLIENT PROFILE MODAL ═══ */}
      <Modal open={clientProfileModalOpen} onClose={() => setClientProfileModalOpen(false)} title={`Ficha de ${activeConversation?.clientName || "Cliente"}`} maxWidth="max-w-xl">
        <div className="space-y-4 text-xs">
          {activeConversation && (
            <>
              <div className="text-center pb-4 border-b border-slate-100 dark:border-white/10">
                <ContactAvatar
                  name={activeConversation.clientName}
                  phone={activeConversation.channelIdentifier}
                  channel={activeConversation.channel}
                  tenantSlug={business.slug || "workspace"}
                  whatsappConnected={evolutionConfig.connected}
                  color={business.primaryColor || "var(--primary, #FF4F2B)"}
                  className="mx-auto mb-3 h-16 w-16 rounded-3xl font-semibold text-xl shadow-md"
                />
                <h3 className="font-semibold text-lg text-slate-900 dark:text-white">{activeConversation.clientName}</h3>
                <p className="text-sm text-slate-500 tabular-nums">{activeConversation.channelIdentifier}</p>
                {linkedClient && (
                  <div className="mt-2 space-y-1">
                    {linkedClient.email && <p className="text-xs text-slate-400">{linkedClient.email}</p>}
                    {linkedClient.tags.length > 0 && <div className="flex flex-wrap items-center justify-center gap-1 mt-2">{linkedClient.tags.map((t) => <span key={t} className="rounded-full bg-primary/10 text-primary text-[11px] font-semibold px-2 py-0.5">{t}</span>)}</div>}
                  </div>
                )}
              </div>

              {/* Resumen de asistencia y consumo */}
              {(linkedClient || clientAppointments.length > 0) && (
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {[
                    { label: "Visitas", value: String(clientStats.visits), tone: "text-slate-900 dark:text-white" },
                    { label: "Consumo total", value: formatGs(clientStats.totalSpent), tone: "text-emerald-600 dark:text-emerald-400" },
                    { label: "Ticket promedio", value: clientStats.visits > 0 ? formatGs(clientStats.avgTicket) : "—", tone: "text-slate-900 dark:text-white" },
                    { label: "Sellos", value: `${linkedClient?.loyaltyPoints ?? 0} / ${loyalty.rewardThreshold}`, tone: "text-amber-600 dark:text-amber-400" },
                  ].map((s) => (
                    <div key={s.label} className="rounded-2xl border border-slate-200/60 bg-slate-50 p-3 text-center dark:border-white/5 dark:bg-slate-800/50">
                      <p className={`truncate text-base font-semibold tabular-nums ${s.tone}`}>{s.value}</p>
                      <p className="mt-0.5 text-[11px] font-medium text-slate-500 dark:text-zinc-400">{s.label}</p>
                    </div>
                  ))}
                </div>
              )}

              {(linkedClient || clientAppointments.length > 0) && (
                <dl className="grid grid-cols-2 gap-x-4 gap-y-3 rounded-2xl border border-slate-200/60 p-3.5 dark:border-white/5">
                  <div className="min-w-0">
                    <dt className="text-[11px] font-medium text-slate-500 dark:text-zinc-400">Última visita</dt>
                    <dd className="mt-0.5 truncate font-semibold text-slate-800 dark:text-zinc-200">
                      {clientStats.lastVisit ? formatProfileDate(clientStats.lastVisit, business.timezone) : "Sin visitas aún"}
                    </dd>
                  </div>
                  <div className="min-w-0">
                    <dt className="text-[11px] font-medium text-slate-500 dark:text-zinc-400">Próximo turno</dt>
                    <dd className="mt-0.5 truncate font-semibold text-slate-800 dark:text-zinc-200">
                      {clientStats.nextAppointment
                        ? formatProfileDate(clientStats.nextAppointment.start, business.timezone, true)
                        : "Sin turnos agendados"}
                    </dd>
                  </div>
                  <div className="min-w-0">
                    <dt className="text-[11px] font-medium text-slate-500 dark:text-zinc-400">Servicio favorito</dt>
                    <dd className="mt-0.5 truncate font-semibold text-slate-800 dark:text-zinc-200">{clientStats.favoriteService || "—"}</dd>
                  </div>
                  <div className="min-w-0">
                    <dt className="text-[11px] font-medium text-slate-500 dark:text-zinc-400">Profesional habitual</dt>
                    <dd className="mt-0.5 truncate font-semibold text-slate-800 dark:text-zinc-200">{clientStats.favoriteStaff || "—"}</dd>
                  </div>
                  <div className="min-w-0">
                    <dt className="text-[11px] font-medium text-slate-500 dark:text-zinc-400">Inasistencias</dt>
                    <dd className={`mt-0.5 font-semibold tabular-nums ${clientStats.noShows > 0 ? "text-rose-600 dark:text-rose-400" : "text-slate-800 dark:text-zinc-200"}`}>
                      {clientStats.noShows}
                    </dd>
                  </div>
                  <div className="min-w-0">
                    <dt className="text-[11px] font-medium text-slate-500 dark:text-zinc-400">Cancelaciones</dt>
                    <dd className="mt-0.5 font-semibold tabular-nums text-slate-800 dark:text-zinc-200">{clientStats.cancellations}</dd>
                  </div>
                </dl>
              )}

              {/* Notes / Formula */}
              {linkedClient?.formula && (
                <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">
                  <p className="text-xs font-semibold text-primary mb-1">Ficha técnica / preferencias</p>
                  <p className="text-xs text-slate-900 dark:text-slate-200">{linkedClient.formula}</p>
                </div>
              )}
              {linkedClient?.notes && (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-white/5">
                  <p className="text-xs font-semibold text-slate-500 dark:text-zinc-400 mb-1">Notas</p>
                  <p className="text-xs text-slate-700 dark:text-slate-300">{linkedClient.notes}</p>
                </div>
              )}

              {/* Historial de turnos */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-slate-900 dark:text-white flex items-center gap-1.5"><Calendar className="h-4 w-4 text-primary" /> Historial de turnos</p>
                {clientAppointments.length === 0 ? (
                  <p className="text-xs text-slate-400 p-3 text-center bg-slate-50 dark:bg-slate-800/40 rounded-xl">Este cliente no tiene turnos registrados aún.</p>
                ) : (
                  <div className="space-y-1.5 max-h-56 overflow-y-auto">
                    {clientAppointments.slice(0, 8).map((a) => {
                      const st = APPOINTMENT_STATUS_LABELS[a.status];
                      return (
                        <div key={a.id} className="flex items-center justify-between gap-3 rounded-xl border border-slate-200/60 bg-slate-50 p-2.5 dark:border-white/5 dark:bg-slate-800/40">
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-slate-900 dark:text-white">{services.find((s) => s.id === a.serviceId)?.name || "Servicio"}</p>
                            <p className="truncate text-[11px] text-slate-500 dark:text-zinc-400">
                              {formatProfileDate(a.start, business.timezone, true)} · {staff.find((p) => p.id === a.staffId)?.name || "Profesional"}
                            </p>
                          </div>
                          <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${st.className}`}>{st.label}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Order History */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-slate-900 dark:text-white flex items-center gap-1.5"><History className="h-4 w-4 text-primary" /> Historial de pedidos</p>
                {clientOrderHistory.length === 0 ? (
                  <p className="text-xs text-slate-400 p-3 text-center bg-slate-50 dark:bg-slate-800/40 rounded-xl">Este cliente no tiene pedidos registrados aún.</p>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {clientOrderHistory.map((o) => (
                      <div key={o.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-white/5 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="tabular-nums font-semibold text-slate-900 dark:text-white">{o.orderNumber}</span>
                            <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize ${o.status === "delivered" ? "bg-emerald-100 text-emerald-700" : o.status === "pending" ? "bg-amber-100 text-amber-700" : o.status === "confirmed" ? "bg-blue-100 text-blue-700" : "bg-rose-100 text-rose-700"}`}>{o.status === "delivered" ? "Entregado" : o.status === "pending" ? "Pendiente" : o.status === "confirmed" ? "Confirmado" : "Cancelado"}</span>
                          </div>
                          <span className="tabular-nums font-semibold text-sm text-slate-900 dark:text-white">{formatGs(o.totalAmount)}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 space-y-0.5">
                          {o.items.map((item, i) => <p key={i}>{item.qty}x {item.productName} · {formatGs(item.unitPrice * item.qty)}</p>)}
                        </div>
                        <p className="text-[11px] text-slate-400">{new Date(o.createdAt).toLocaleDateString("es-PY", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
          <div className="pt-3 border-t border-slate-200 dark:border-white/10 flex justify-end">
            <button type="button" onClick={() => setClientProfileModalOpen(false)} className="rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-semibold px-4 py-2 hover:opacity-90 transition cursor-pointer">Cerrar</button>
          </div>
        </div>
      </Modal>

      {/* ═══ ORDER CREATION MODAL ═══ */}
      <Modal open={orderModalOpen} onClose={() => setOrderModalOpen(false)} title={`Crear Pedido · ${activeConversation?.clientName || "Cliente"}`}>
        <div className="space-y-4 text-xs">
          <div className="rounded-2xl bg-primary/10 border border-primary/20 p-3.5">
            <p className="text-slate-800 dark:text-slate-200 leading-relaxed font-medium">El pedido se vincula a <strong>{activeConversation?.clientName}</strong> y se enviará una confirmación automática por chat.</p>
          </div>
          <div><label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Producto:</label><CustomSelect value={orderProductId} onChange={(val) => setOrderProductId(val)} options={productOptions} /></div>
          <div className="grid grid-cols-2 gap-3 items-center">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Cantidad:</label>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => setOrderQty((q) => Math.max(1, q - 1))} className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 font-semibold hover:bg-slate-200 transition cursor-pointer">-</button>
                <span className="w-10 text-center tabular-nums font-semibold text-sm">{orderQty}</span>
                <button type="button" onClick={() => setOrderQty((q) => q + 1)} className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 font-semibold hover:bg-slate-200 transition cursor-pointer">+</button>
              </div>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-white/5 text-right">
              <span className="text-[11px] text-slate-400 block font-semibold">Total:</span>
              <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">{formatGs(orderTotal)}</span>
            </div>
          </div>
          <div><label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Entrega:</label><CustomSelect value={orderDelivery} onChange={(val) => setOrderDelivery(val as any)} options={deliveryOptions} /></div>
          <div><label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Pago:</label><CustomSelect value={orderPayment} onChange={(val) => setOrderPayment(val as any)} options={paymentOptions} /></div>
          <div><label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Notas (Opcional):</label><textarea rows={2} value={orderNotes} onChange={(e) => setOrderNotes(e.target.value)} placeholder="Ej: Retira el jueves con Marcos..." className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 p-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/40" /></div>
          <div className="pt-3 border-t border-slate-200 dark:border-white/10 flex items-center justify-end gap-2">
            <button type="button" onClick={() => setOrderModalOpen(false)} className="rounded-xl border border-slate-200 dark:border-white/10 px-4 py-2 font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 transition cursor-pointer">Cancelar</button>
            <button type="button" onClick={handleCreateOrderSubmit} disabled={savingOrder} className="rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-4 py-2 shadow-sm transition cursor-pointer flex items-center gap-1.5 disabled:cursor-wait disabled:opacity-60"><Check className="h-4 w-4" /><span>{savingOrder ? "Guardando..." : "Confirmar pedido"}</span></button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
