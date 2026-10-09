"use client";

import { useRef, useState, useTransition, useMemo, useCallback, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { formatInTimeZone } from "date-fns-tz";
import { es } from "date-fns/locale";
import {
  CalendarClock,
  MessageCircle,
  MapPin,
  Info,
  Clock,
  ShoppingBag,
  Calendar,
  Check,
  Plus,
  Minus,
  Copy,
  Camera,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
  Store,
  Banknote,
  CreditCard,
  Landmark,
  Smartphone,
  Car,
  FileText,
  Gift,
  Phone,
  Globe,
  Star,
  Flame,
  Timer,
  BadgePercent,
  PhoneCall,
  Send,
  CheckCircle2,
  UserCheck,
  Search,
  X,
} from "lucide-react";

function InstagramIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function renderCustomLinkIcon(iconName: string, className = "h-4 w-4") {
  switch (iconName) {
    case "whatsapp":
      return <MessageCircle className={className} />;
    case "maps":
      return <MapPin className={className} />;
    case "car":
      return <Car className={className} />;
    case "star":
      return <Star className={className} />;
    case "file-text":
      return <FileText className={className} />;
    case "gift":
      return <Gift className={className} />;
    case "phone":
      return <Phone className={className} />;
    case "instagram":
      return <InstagramIcon className={className} />;
    case "globe":
    default:
      return <Globe className={className} />;
  }
}

import {
  createPendingAppointment,
  getAvailableSlotsAction,
} from "@/lib/scheduling/actions";
import type { AvailableSlot, PublicService, PublicTenant } from "@/lib/scheduling/types";
import {
  fontStack,
  DEFAULT_GALLERY_PHOTOS,
  getButtonClasses,
  getCustomButtonClasses,
  getCustomButtonStyles,
} from "@/lib/theme";
import { initialProducts } from "@/store/useDashboardStore";
import type { ProductItem } from "@/lib/dashboard-types";
import BookingCalendar from "./BookingCalendar";

type BookingWizardProps = {
  tenant: PublicTenant;
  services: PublicService[];
  products?: any[];
};

export default function BookingWizard({ tenant, services, products }: BookingWizardProps) {
  const router = useRouter();
  const requestId = useRef(0);

  // Active top tab: "turnos" | "tienda"
  const [activeTab, setActiveTab] = useState<"turnos" | "tienda">("turnos");

  // Booking state
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [serviceId, setServiceId] = useState<string | null>(null);
  const [date, setDate] = useState<string | null>(null);
  const [slots, setSlots] = useState<AvailableSlot[]>([]);
  const [slotsState, setSlotsState] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [start, setStart] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"efectivo" | "sipap" | "pos_bancard" | "billetera_py">("efectivo");
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  // Store/Shop cart state: { [productId]: quantity }
  const [cart, setCart] = useState<Record<string, number>>({});
  const [storeCustomerName, setStoreCustomerName] = useState("");
  const [copiedSipap, setCopiedSipap] = useState(false);

  // Shop ordering & contact request modal state
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactNotes, setContactNotes] = useState("");
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [isSubmittingContact, setIsSubmittingContact] = useState(false);
  const [selectedProductCategory, setSelectedProductCategory] = useState("Todas");
  const [productSearch, setProductSearch] = useState("");

  // Selected photo for quick zoom/preview
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [showBioBooking, setShowBioBooking] = useState(false);

  const service = services.find((item) => item.id === serviceId) ?? null;
  const canContinue =
    (step === 1 && Boolean(service)) ||
    (step === 2 && Boolean(start)) ||
    (step === 3 && name.trim().length >= 2 && phone.replace(/\D/g, "").length >= 8);

  const isDark =
    tenant.themeMode === "dark" ||
    tenant.themePreset === "barber-dark" ||
    tenant.themePreset === "obsidian-gold" ||
    tenant.themePreset === "cyber-noir";

  const layout = tenant.layoutStyle || "panoramic";
  const gallery = tenant.galleryUrls && tenant.galleryUrls.length > 0 ? tenant.galleryUrls : DEFAULT_GALLERY_PHOTOS;

  // Normalized products list merging tenant DB products or fallback
  const allProducts: ProductItem[] = useMemo(() => {
    if (products && Array.isArray(products) && products.length > 0) {
      return products.map((p) => ({
        id: p.id,
        name: p.name,
        price: Number(p.price) || 0,
        cost: Number(p.cost) || Math.round(Number(p.price) * 0.5),
        stock: p.stock ?? 10,
        imageUrl: p.imageUrl || "",
        category: p.category || "General",
        description: p.description || "",
        active: p.isActive !== false,
        isOnSale: (p as any).isOnSale,
        salePrice: (p as any).salePrice ? Number((p as any).salePrice) : undefined,
        saleType: (p as any).saleType,
        saleExpiresAt: (p as any).saleExpiresAt,
        saleMaxUnits: (p as any).saleMaxUnits,
        saleUnitsSold: (p as any).saleUnitsSold,
      }));
    }
    return initialProducts;
  }, [products]);

  // Check if an offer is currently active
  const isProductOfferActive = useCallback((p: ProductItem) => {
    if (!p.isOnSale || !p.salePrice || p.salePrice >= p.price) return false;
    if (p.saleExpiresAt) {
      const exp = new Date(p.saleExpiresAt).getTime();
      if (!isNaN(exp) && Date.now() > exp) return false;
    }
    if (p.saleMaxUnits && (p.saleUnitsSold || 0) >= p.saleMaxUnits) {
      return false;
    }
    return true;
  }, []);

  const getProductPrice = useCallback((p: ProductItem) => {
    return isProductOfferActive(p) && p.salePrice ? p.salePrice : p.price;
  }, [isProductOfferActive]);

  // Product categories list
  const productCategories = useMemo(() => {
    const set = new Set<string>(["Todas"]);
    allProducts.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set);
  }, [allProducts]);

  // Cart calculations
  const cartItems = useMemo(() => {
    return Object.entries(cart)
      .map(([id, qty]) => {
        const prod = allProducts.find((p) => p.id === id);
        return prod && qty > 0 ? { product: prod, qty } : null;
      })
      .filter((item): item is { product: ProductItem; qty: number } => item !== null);
  }, [cart, allProducts]);

  const totalCartPrice = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + getProductPrice(item.product) * item.qty, 0);
  }, [cartItems, getProductPrice]);

  const totalCartCount = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.qty, 0);
  }, [cartItems]);

  function updateCartQty(productId: string, delta: number) {
    setCart((prev) => {
      const current = prev[productId] || 0;
      const next = Math.max(0, current + delta);
      if (next === 0) {
        const copy = { ...prev };
        delete copy[productId];
        return copy;
      }
      return { ...prev, [productId]: next };
    });
  }

  // Generate prefilled WhatsApp URL for the complete order
  function getWhatsAppOrderUrl(singleProduct?: ProductItem) {
    const rawPhone = (tenant.whatsapp || "595981700800").replace(/\D/g, "");
    if (singleProduct) {
      const price = getProductPrice(singleProduct);
      const isOffer = isProductOfferActive(singleProduct);
      const offerTag = isOffer ? "  (EN OFERTA)" : "";
      const text = encodeURIComponent(
        `¡Hola ${tenant.name}!  Quiero consultar o pedir este producto de su tienda online:\n\n` +
        ` *${singleProduct.name}*${offerTag}\n` +
        ` *Precio:* Gs. ${price.toLocaleString("es-PY")}\n\n` +
        `¿Tienen disponibilidad para retiro o delivery? ¡Muchas gracias!`
      );
      return `https://wa.me/${rawPhone}?text=${text}`;
    }

    const lines = cartItems.map((item) => {
      const pPrice = getProductPrice(item.product);
      const isOffer = isProductOfferActive(item.product) ? " (Oferta)" : "";
      return `• ${item.qty}x ${item.product.name}${isOffer} (Gs. ${(pPrice * item.qty).toLocaleString("es-PY")})`;
    });
    const clientSignature = name.trim() ? `\n *Cliente:* ${name.trim()} (${phone.trim()})` : "";
    const text = encodeURIComponent(
      `¡Hola ${tenant.name}!  Quiero realizar un pedido desde la tienda online:${clientSignature}\n\n` +
      ` *Productos solicitados:*\n${lines.join("\n")}\n\n` +
      ` *Total del pedido:* Gs. ${totalCartPrice.toLocaleString("es-PY")}\n\n` +
      `¿Tienen stock disponible para retiro o delivery? ¡Muchas gracias!`
    );
    return `https://wa.me/${rawPhone}?text=${text}`;
  }

  async function handleConfirmContactRequest(e: React.FormEvent) {
    e.preventDefault();
    if (!contactPhone.trim() || contactPhone.replace(/\D/g, "").length < 8) return;
    setIsSubmittingContact(true);
    try {
      await fetch("/api/leads/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantSlug: tenant.slug,
          customerName: contactName.trim() || name.trim() || "Cliente Tienda",
          customerPhone: contactPhone.trim() || phone.trim(),
          notes: contactNotes.trim(),
          items: cartItems.map((i) => ({
            name: i.product.name,
            qty: i.qty,
            price: i.product.price,
          })),
          total: totalCartPrice,
        }),
      }).catch(() => {});
    } catch {}
    setIsSubmittingContact(false);
    setContactSubmitted(true);
  }

  function handleSelectDate(civilDate: string) {
    setDate(civilDate);
    setStart(null);
    if (!service) return;

    const id = ++requestId.current;
    setSlotsState("loading");
    setFormError(null);
    getAvailableSlotsAction(tenant.slug, service.id, civilDate)
      .then((next) => {
        if (id !== requestId.current) return;
        setSlots(next);
        setSlotsState("ready");
      })
      .catch(() => {
        if (id !== requestId.current) return;
        setSlots([]);
        setSlotsState("error");
      });
  }

  function confirm() {
    if (!service || !start) return;
    setFormError(null);
    startTransition(async () => {
      try {
        const result = await createPendingAppointment({
          tenantSlug: tenant.slug,
          serviceId: service.id,
          start,
          clientName: name,
          clientPhone: phone,
        });
        if (!result.ok) {
          setFormError(result.message);
          return;
        }
        const basePath =
          typeof window !== "undefined" && window.location.pathname.startsWith(`/${tenant.slug}`)
            ? `/${tenant.slug}`
            : "";
        router.push(`${basePath}/reservar/listo?hold=${result.appointmentId}`);
      } catch {
        setFormError("No pudimos guardar el turno. Probá de nuevo.");
      }
    });
  }

  const avatarShapeClass =
    tenant.avatarShape === "circle"
      ? "rounded-full"
      : tenant.avatarShape === "square"
      ? "rounded-sm"
      : "rounded-2xl";

  const avatarBorderClass =
    tenant.avatarBorder === "none"
      ? "border-0 shadow-sm"
      : tenant.avatarBorder === "thick"
      ? "border-4 border-white shadow-xl"
      : tenant.avatarBorder === "glow"
      ? "border-2 border-white ring-4 ring-primary/40 shadow-xl"
      : "border-2 border-white shadow-md";

  const customBtnClasses = getCustomButtonClasses(tenant as any);
  const customBtnStyles = getCustomButtonStyles(tenant as any);

  const titleSizeClass =
    tenant.titleSize === "sm"
      ? "text-lg font-bold"
      : tenant.titleSize === "base"
      ? "text-xl font-extrabold"
      : tenant.titleSize === "xl"
      ? "text-3xl sm:text-4xl font-black tracking-tight"
      : "text-2xl font-black tracking-tight";

  // Card theme classes
  const cardThemeClass = isDark
    ? "bg-slate-900/90 border-slate-800 text-slate-100 shadow-xl shadow-black/40 backdrop-blur-md"
    : "bg-white/95 border-slate-200 text-slate-900 shadow-xs backdrop-blur-md";

  const secondaryTextClass = isDark ? "text-slate-300" : "text-slate-600";
  const itemBgClass = isDark
    ? "bg-slate-800/90 border-slate-700/90 text-slate-100 hover:border-slate-500"
    : "bg-white border-slate-200 text-slate-900 hover:border-slate-300";

  // Renders the Linktree / Bio-links custom action buttons
  const renderLinktreeCustomLinks = () => {
    const activeLinks = (tenant.customLinks || []).filter((l) => l.enabled);
    if (activeLinks.length === 0) return null;

    return (
      <div className="space-y-2.5 my-4">
        {activeLinks.map((link) => {
          const isHighlight = link.style === "highlight";
          const isOutline = link.style === "outline";

          return (
            <a
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`group flex items-center w-full transition-all duration-200 cursor-pointer ${customBtnClasses} ${
                isHighlight ? "ring-2 ring-primary ring-offset-2 ring-offset-slate-900 animate-pulse" : ""
              }`}
              style={getCustomButtonStyles(tenant as any, isOutline, isHighlight)}
            >
              <div className="flex items-center gap-2.5 truncate">
                <span className="shrink-0 text-current opacity-95">
                  {renderCustomLinkIcon(link.icon, "h-4 w-4")}
                </span>
                <span className="truncate">{link.title}</span>
              </div>
              {tenant.buttonAlignment === "spread" && (
                <ExternalLink className="h-3.5 w-3.5 shrink-0 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-transform ml-2" />
              )}
            </a>
          );
        })}
      </div>
    );
  };

  // Renders the main booking card content
  const renderBookingWizardCard = () => (
    <div className={`overflow-hidden rounded-3xl border ${cardThemeClass} p-5 sm:p-6 transition-all duration-300`}>
      {/* Switchable Top Tabs: Turnos vs Tienda */}
      <div className={`grid grid-cols-2 gap-1 rounded-2xl p-1 text-xs font-bold ${isDark ? "bg-slate-800" : "bg-slate-100"}`}>
        <button
          type="button"
          onClick={() => setActiveTab("turnos")}
          className={`flex items-center justify-center gap-1.5 rounded-xl py-2 transition ${
            activeTab === "turnos"
              ? isDark
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-white text-slate-900 shadow-xs"
              : isDark
              ? "text-slate-400 hover:text-white"
              : "text-slate-500 hover:text-slate-900"
          }`}
        >
          <Calendar className="h-3.5 w-3.5 text-primary" />
          Reservar Turno
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("tienda")}
          className={`flex items-center justify-center gap-1.5 rounded-xl py-2 transition ${
            activeTab === "tienda"
              ? isDark
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-white text-slate-900 shadow-xs"
              : isDark
              ? "text-slate-400 hover:text-white"
              : "text-slate-500 hover:text-slate-900"
          }`}
        >
          <ShoppingBag className="h-3.5 w-3.5 text-primary" />
          Tienda
          {totalCartCount > 0 && (
            <span className="rounded-full bg-primary px-1.5 py-0.2 text-[10px] font-black text-white">
              {totalCartCount}
            </span>
          )}
        </button>
      </div>

      {activeTab === "turnos" ? (
        <div className="mt-5 flex-1 flex flex-col">
          <div className="flex items-center justify-between pb-2 px-1">
            <h2 className="text-base font-bold">
              {step === 1 ? "Elegí el servicio" : step === 2 ? "Fecha y horario" : "Tus datos de reserva"}
            </h2>
            <Progress step={step} isDark={isDark} />
          </div>

          <div className="relative mt-2 flex-1">
            <AnimatePresence mode="wait" initial={false}>
              {step === 1 && (
                <StepFrame key="service">
                  {services.length === 0 ? (
                    <EmptyState
                      title="Este local todavía no publicó servicios"
                      text="Volvé a intentar más tarde."
                      isDark={isDark}
                    />
                  ) : (
                    <ul className="space-y-2.5">
                      {services.map((item) => {
                        const selected = item.id === serviceId;
                        const hasPromo = Boolean(item.hasPromo && item.promoPrice && item.promoPrice < item.price);
                        return (
                          <li key={item.id}>
                            <button
                              type="button"
                              onClick={() => {
                                setServiceId(item.id);
                                setDate(null);
                                setStart(null);
                                setSlots([]);
                                setSlotsState("idle");
                              }}
                              className={`flex w-full items-center justify-between rounded-2xl border p-4 sm:p-5 text-left transition-all active:scale-[0.99] cursor-pointer ${
                                selected
                                  ? "border-primary bg-primary/10 ring-2 ring-primary/40 shadow-sm"
                                  : itemBgClass
                              }`}
                            >
                              <div className="space-y-1.5 flex-1 min-w-0 pr-3">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="block font-bold text-sm sm:text-base text-slate-900 dark:text-white">{item.name}</span>
                                  {hasPromo && (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-500 to-rose-500 px-2 py-0.5 text-[10px] font-black text-white shadow-xs">
                                      <Flame className="h-3 w-3" />
                                      {item.promoBadge || "PROMO FLASH"}
                                    </span>
                                  )}
                                </div>
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className={`inline-flex items-center gap-1 text-xs font-medium ${secondaryTextClass}`}>
                                    <Clock className="h-3.5 w-3.5 text-primary" /> {item.durationMinutes} min
                                  </span>
                                  {hasPromo && item.promoLimitHours && (
                                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-600 dark:text-amber-400">
                                      <Timer className="h-3 w-3" /> Vence en {item.promoLimitHours}h
                                    </span>
                                  )}
                                  {hasPromo && item.promoLimitQuantity && (
                                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-rose-600 dark:text-rose-400">
                                      ¡Últimos {item.promoLimitQuantity} cupos!
                                    </span>
                                  )}
                                  {item.requirePrepayment && (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-md">
                                      <ShieldCheck className="h-3 w-3 text-emerald-500" /> Seña requerida
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-3 shrink-0">
                                <div className="text-right shrink-0">
                                  {hasPromo ? (
                                    <div>
                                      <span className="block text-xs line-through text-slate-400 dark:text-slate-500">
                                        Gs. {item.price.toLocaleString("es-PY")}
                                      </span>
                                      <span className="font-black text-sm sm:text-base text-emerald-600 dark:text-emerald-400 tabular-nums">
                                        Gs. {item.promoPrice?.toLocaleString("es-PY")}
                                      </span>
                                    </div>
                                  ) : (
                                    <span className="font-black text-sm sm:text-base text-primary tabular-nums">
                                      Gs. {item.price.toLocaleString("es-PY")}
                                    </span>
                                  )}
                                </div>
                                <div
                                  className={`h-6 w-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                                    selected
                                      ? "border-primary bg-primary text-white scale-105 shadow-xs"
                                      : "border-slate-300 dark:border-slate-600 bg-transparent"
                                  }`}
                                >
                                  {selected && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                                </div>
                              </div>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </StepFrame>
              )}

              {step === 2 && (
                <StepFrame key="slot">
                  <div className="space-y-4">
                    <div className={`rounded-2xl border p-3.5 ${itemBgClass}`}>
                      <BookingCalendar
                        timezone={tenant.timezone}
                        selected={date}
                        maxAdvanceDays={tenant.maxAdvanceDays}
                        onSelect={handleSelectDate}
                      />
                    </div>

                    {date && (
                      <div className="space-y-2">
                        <p className={`text-xs font-bold uppercase tracking-wider ${secondaryTextClass}`}>
                          Horarios para el {formatCivil(date, tenant.timezone)}
                        </p>

                        {slotsState === "loading" && (
                          <div className={`rounded-2xl border p-4 text-center text-xs ${secondaryTextClass} ${itemBgClass}`}>
                            Consultando disponibilidad en vivo...
                          </div>
                        )}

                        {slotsState === "error" && (
                          <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-center text-xs text-rose-500">
                            No pudimos consultar los horarios. Probá con otra fecha.
                          </div>
                        )}

                        {slotsState === "ready" && slots.length === 0 && (
                          <div className={`rounded-2xl border p-4 text-center text-xs ${secondaryTextClass} ${itemBgClass}`}>
                            No hay horarios disponibles para esta fecha.
                          </div>
                        )}

                        {slotsState === "ready" && slots.length > 0 && (
                          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                            {slots.map((slot) => {
                              const selected = slot.start === start;
                              const timeLabel = formatInTimeZone(
                                new Date(slot.start),
                                tenant.timezone,
                                "HH:mm"
                              );
                              return (
                                <button
                                  key={slot.start}
                                  type="button"
                                  onClick={() => setStart(slot.start)}
                                  className={`h-12 w-full rounded-xl border flex items-center justify-center text-sm font-bold active:scale-95 transition-all cursor-pointer ${
                                    selected
                                      ? "border-primary bg-primary text-white font-black shadow-md shadow-primary/30 ring-2 ring-primary ring-offset-2 ring-offset-slate-900 scale-105"
                                      : "border-slate-200 dark:border-slate-700/90 bg-white dark:bg-slate-800/90 text-slate-900 dark:text-slate-100 hover:border-primary/60 hover:bg-slate-50 dark:hover:bg-slate-700/80"
                                  }`}
                                >
                                  {timeLabel}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </StepFrame>
              )}

              {step === 3 && (
                <StepFrame key="data">
                  <div className="space-y-4">
                    {/* Summary Card */}
                    <div className={`rounded-2xl border p-4 text-xs ${itemBgClass}`}>
                      <div className="flex items-center justify-between border-b pb-2.5 border-black/5 dark:border-white/5">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-sm">{service?.name}</span>
                            {service?.hasPromo && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-500 to-rose-500 px-2 py-0.5 text-[10px] font-black text-white">
                                <Flame className="h-3 w-3" />
                                {service.promoBadge || "PROMO FLASH"}
                              </span>
                            )}
                          </div>
                          {service?.hasPromo && service.promoPrice && service.promoPrice < service.price && (
                            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold block mt-0.5">
                              ¡Ahorrás Gs. {(service.price - service.promoPrice).toLocaleString("es-PY")}!
                            </span>
                          )}
                        </div>
                        <div className="text-right">
                          {service?.hasPromo && service.promoPrice && service.promoPrice < service.price ? (
                            <div>
                              <span className="block text-[11px] line-through text-slate-400">
                                Gs. {service.price.toLocaleString("es-PY")}
                              </span>
                              <span className="font-black text-sm text-emerald-600 dark:text-emerald-400">
                                Gs. {service.promoPrice.toLocaleString("es-PY")}
                              </span>
                            </div>
                          ) : (
                            <span className="font-black text-primary text-sm">
                              Gs. {service?.price.toLocaleString("es-PY")}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className={`mt-3 pt-2.5 border-t border-black/5 dark:border-white/5 flex items-center justify-between ${secondaryTextClass}`}>
                        <span className="text-xs font-medium">Fecha y horario:</span>
                        <span className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">
                          {start ? formatInTimeZone(new Date(start), tenant.timezone, "d 'de' MMMM · HH:mm 'hs'", { locale: es }) : ""}
                        </span>
                      </div>

                      {service?.requirePrepayment && (
                        <div className="mt-3 rounded-xl bg-amber-500/10 border border-amber-500/30 p-2.5 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2">
                          <ShieldCheck className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
                          <div>
                            <p className="font-bold text-[11px]">
                              Seña requerida: Gs. {(service.prepaymentAmount || Math.round((service.promoPrice || service.price) * 0.5)).toLocaleString("es-PY")} ({service.prepaymentMethod?.toUpperCase() === "SIPAP" ? "TRANSFERENCIA" : (service.prepaymentMethod?.toUpperCase() || "TRANSFERENCIA")})
                            </p>
                            <p className="text-[10px] text-amber-800 dark:text-amber-300 mt-0.5">
                              {service.prepaymentInstructions || "Enviar comprobante por WhatsApp al agendar para congelar tu lugar."}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-3.5">
                      <div>
                        <label className={`block text-xs font-bold uppercase tracking-wider ${secondaryTextClass}`}>
                          Nombre y Apellido *
                        </label>
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Tu nombre completo"
                          className={`mt-1.5 h-12 w-full rounded-xl border px-4 py-3 text-base sm:text-sm font-medium outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition ${
                            isDark ? "bg-slate-800 border-slate-700 text-white" : "bg-white border-slate-200 text-slate-900"
                          }`}
                        />
                      </div>

                      <div>
                        <label className={`block text-xs font-bold uppercase tracking-wider ${secondaryTextClass}`}>
                          Teléfono de WhatsApp (Paraguay) *
                        </label>
                        <input
                          type="tel"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="0981 123 456"
                          className={`mt-1.5 h-12 w-full rounded-xl border px-4 py-3 text-base sm:text-sm font-medium outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition ${
                            isDark ? "bg-slate-800 border-slate-700 text-white" : "bg-white border-slate-200 text-slate-900"
                          }`}
                        />
                        <div
                          className={`mt-2 rounded-xl p-3 text-[11px] leading-relaxed border transition ${
                            isDark
                              ? "bg-slate-800/80 border-slate-700/80 text-slate-300"
                              : "bg-blue-50/70 border-blue-100 text-slate-700"
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                              <Check className="h-2.5 w-2.5 stroke-[3]" />
                            </span>
                            <p className="text-[11px]">
                              <strong className="font-semibold text-slate-900 dark:text-white">
                                Avisos oficiales:
                              </strong>{" "}
                              Al registrar tu número, autorizás expresamente a{" "}
                              <span className="font-semibold">{tenant.name}</span> y AgendatePY a
                              enviarte confirmación de turno y recordatorios por WhatsApp.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className={`block text-xs font-bold uppercase tracking-wider ${secondaryTextClass}`}>
                          Forma de Pago preferida en el local
                        </label>
                        <div className="mt-2 grid grid-cols-2 gap-2 sm:gap-2.5">
                          {[
                            { id: "efectivo", label: "Efectivo", icon: Banknote },
                            { id: "pos_bancard", label: "Tarjeta (POS)", icon: CreditCard },
                            { id: "sipap", label: "Transferencia", icon: Landmark },
                            { id: "billetera_py", label: "Giros / Billetera", icon: Smartphone },
                          ].map((m) => {
                            const IconComp = m.icon;
                            return (
                              <button
                                key={m.id}
                                type="button"
                                onClick={() => setPaymentMethod(m.id as typeof paymentMethod)}
                                className={`h-12 rounded-xl border px-3 text-xs sm:text-sm font-semibold transition text-left flex items-center gap-2.5 active:scale-98 cursor-pointer ${
                                  paymentMethod === m.id
                                    ? "border-primary bg-primary/10 text-primary ring-2 ring-primary/40 font-bold"
                                    : itemBgClass
                                }`}
                              >
                                <IconComp className="h-4 w-4 shrink-0 text-primary" />
                                <span className="truncate">{m.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {formError && (
                      <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-500">
                        {formError}
                      </div>
                    )}
                  </div>
                </StepFrame>
              )}
            </AnimatePresence>
          </div>

          {/* Wizard Action Footer */}
          <div className="mt-6 flex items-center justify-between gap-3 pt-4 border-t border-black/5 dark:border-white/5">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep((s) => (s - 1) as 1 | 2)}
                className={`rounded-xl border px-4 py-2.5 text-xs font-semibold transition ${itemBgClass}`}
              >
                Volver
              </button>
            ) : <span />}

            {step < 3 ? (
              <button
                type="button"
                disabled={!canContinue}
                onClick={() => setStep((s) => (s + 1) as 2 | 3)}
                className={`inline-flex items-center gap-1.5 transition hover:opacity-95 disabled:opacity-40 ${customBtnClasses}`}
                style={customBtnStyles}
              >
                Siguiente
                <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="button"
                disabled={!canContinue || pending}
                onClick={confirm}
                className={`inline-flex items-center gap-1.5 transition hover:opacity-95 disabled:opacity-40 ${customBtnClasses}`}
                style={customBtnStyles}
              >
                {pending ? "Guardando tu cita..." : "Confirmar Cita Ahora"}
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Tienda de Productos Tab */
        <div className="mt-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm">Tienda Oficial · {tenant.name}</h3>
              <p className={`text-xs ${secondaryTextClass}`}>
                Elegí tus productos para retirar en tu cita o pedir con delivery.
              </p>
            </div>
            {totalCartCount > 0 && (
              <span className="rounded-full bg-primary/10 border border-primary/20 px-2.5 py-0.5 text-[11px] font-black text-primary animate-pulse">
                {totalCartCount} en carrito
              </span>
            )}
          </div>

          {/* Quick Search */}
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
              placeholder="Buscar ceras, aceites, champús o productos..."
              className="w-full rounded-xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 pl-9 pr-3.5 py-2 text-xs outline-none focus:border-primary placeholder:text-slate-400 transition"
            />
          </div>

          {/* Categories Selector */}
          {productCategories.length > 2 && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {productCategories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedProductCategory(cat)}
                  className={`rounded-xl px-2.5 py-1 text-[11px] font-bold transition whitespace-nowrap cursor-pointer ${
                    selectedProductCategory === cat
                      ? "bg-primary text-white shadow-xs"
                      : "bg-black/5 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:opacity-80"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}

          {/* Product Items List */}
          <div className="space-y-3">
            {allProducts
              .filter((p) => {
                const matchCat =
                  selectedProductCategory === "Todas" ||
                  p.category.toLowerCase() === selectedProductCategory.toLowerCase();
                const matchQuery =
                  !productSearch.trim() ||
                  p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
                  p.description.toLowerCase().includes(productSearch.toLowerCase());
                return matchCat && matchQuery;
              })
              .map((p) => {
                const qty = cart[p.id] || 0;
                const isOutOfStock = p.stock !== undefined && p.stock <= 0;
                const isLowStock = p.stock !== undefined && p.stock > 0 && p.stock <= 3;

                return (
                  <div
                    key={p.id}
                    className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 rounded-2xl border p-3.5 transition hover:border-primary/40 ${itemBgClass}`}
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      {/* Image container with studio spotlight backdrop for transparent cutouts */}
                      <div className="relative h-18 w-18 sm:h-20 sm:w-20 rounded-2xl overflow-hidden shrink-0 border border-black/5 dark:border-white/10 bg-gradient-to-b from-slate-100 to-slate-200/90 dark:from-slate-800 dark:to-slate-900/90 flex items-center justify-center p-1.5 shadow-xs">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/70 via-transparent to-transparent dark:from-white/10 pointer-events-none" />
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={p.imageUrl}
                          alt={p.name}
                          className="relative z-10 max-h-full max-w-full object-contain drop-shadow-xs transition-transform duration-200 hover:scale-105"
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <p className="text-xs sm:text-sm font-bold leading-tight truncate">{p.name}</p>
                          <span className="text-[9px] font-bold uppercase px-1.5 py-0.2 rounded bg-black/5 dark:bg-white/10 text-slate-500">
                            {p.category}
                          </span>
                        </div>

                        {p.description && (
                          <p className={`text-[11px] line-clamp-1 mt-0.5 ${secondaryTextClass}`}>
                            {p.description}
                          </p>
                        )}

                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          {isProductOfferActive(p) && p.salePrice ? (
                            <>
                              <span className="text-[10px] font-black uppercase text-white bg-amber-500 px-2 py-0.5 rounded-full shadow-xs">
                                OFERTA
                              </span>
                              <p className="text-sm sm:text-base font-black text-amber-500">
                                Gs. {p.salePrice.toLocaleString("es-PY")}
                              </p>
                              <span className="text-xs text-slate-400 line-through">
                                Gs. {p.price.toLocaleString("es-PY")}
                              </span>
                            </>
                          ) : (
                            <p className="text-sm sm:text-base font-black text-primary">
                              Gs. {p.price.toLocaleString("es-PY")}
                            </p>
                          )}
                          {isOutOfStock ? (
                            <span className="text-[10px] font-bold text-rose-500 bg-rose-500/10 px-1.5 py-0.5 rounded">
                              Agotado
                            </span>
                          ) : isLowStock ? (
                            <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                              ¡Últimas {p.stock} u.!
                            </span>
                          ) : (
                            <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                              En stock
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-black/5 dark:border-white/5">
                      {/* Individual quick order via WhatsApp button */}
                      <a
                        href={getWhatsAppOrderUrl(p)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500 hover:text-white transition inline-flex items-center gap-1 cursor-pointer"
                        title="Pedir o consultar este producto por WhatsApp"
                      >
                        <MessageCircle className="h-3 w-3" />
                        <span>Pedir</span>
                      </a>

                      {/* Quantity Controls */}
                      {isOutOfStock ? (
                        <button
                          type="button"
                          disabled
                          className="rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-400 px-3 py-1.5 text-xs font-semibold cursor-not-allowed"
                        >
                          Agotado
                        </button>
                      ) : qty > 0 ? (
                        <div className="flex items-center gap-1.5 bg-black/5 dark:bg-white/10 p-0.5 rounded-xl">
                          <button
                            type="button"
                            onClick={() => updateCartQty(p.id, -1)}
                            className="flex h-7 w-7 items-center justify-center rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 shadow-xs cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-6 text-center text-xs font-black">{qty}</span>
                          <button
                            type="button"
                            onClick={() => updateCartQty(p.id, 1)}
                            className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-white shadow-xs cursor-pointer hover:opacity-90 transition"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => updateCartQty(p.id, 1)}
                          className="rounded-xl bg-primary text-white px-3 py-1.5 text-xs font-bold shadow-xs hover:opacity-95 transition cursor-pointer"
                        >
                          + Agregar
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}

            {allProducts.filter((p) => {
              const matchCat =
                selectedProductCategory === "Todas" ||
                p.category.toLowerCase() === selectedProductCategory.toLowerCase();
              const matchQuery =
                !productSearch.trim() ||
                p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
                p.description.toLowerCase().includes(productSearch.toLowerCase());
              return matchCat && matchQuery;
            }).length === 0 && (
              <div className="p-8 text-center rounded-2xl border border-black/5 dark:border-white/10">
                <ShoppingBag className="mx-auto h-8 w-8 text-slate-300 dark:text-slate-600" />
                <p className="mt-2 text-xs font-bold text-slate-700 dark:text-slate-200">
                  No se encontraron productos
                </p>
                <p className={`text-[11px] mt-0.5 ${secondaryTextClass}`}>
                  Probá ajustando el término de búsqueda o seleccionando otra categoría.
                </p>
              </div>
            )}
          </div>

          {/* Checkout & Action Buttons Card */}
          {totalCartCount > 0 && (
            <div className={`mt-5 rounded-3xl border p-4.5 shadow-lg space-y-3.5 ${itemBgClass}`}>
              <div className="flex items-center justify-between border-b pb-3 border-black/10 dark:border-white/10">
                <div>
                  <span className="font-bold text-xs uppercase tracking-wider text-slate-500">
                    Tu Pedido ({totalCartCount} items):
                  </span>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300">
                    {cartItems.map((c) => `${c.qty}x ${c.product.name}`).join(", ")}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[10px] text-slate-400 block">Total a pagar:</span>
                  <span className="font-black text-base text-primary">
                    Gs. {totalCartPrice.toLocaleString("es-PY")}
                  </span>
                </div>
              </div>

              {/* Los 2 Botones Solicitados: WhatsApp Directo + Que se contacten conmigo */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                {/* BOTÓN 1: Enviar mensaje por WhatsApp */}
                <a
                  href={getWhatsAppOrderUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white py-3 px-4 text-xs font-bold shadow-md shadow-emerald-900/20 transition cursor-pointer text-center"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>Enviar mensaje por WhatsApp</span>
                </a>

                {/* BOTÓN 2: Quiero que se contacten conmigo */}
                <button
                  type="button"
                  onClick={() => {
                    setContactName(name);
                    setContactPhone(phone);
                    setShowContactModal(true);
                  }}
                  className="flex items-center justify-center gap-2 rounded-2xl bg-primary hover:opacity-95 text-white py-3 px-4 text-xs font-bold shadow-md shadow-primary/25 transition cursor-pointer text-center"
                >
                  <PhoneCall className="h-4 w-4" />
                  <span>Quiero que se contacten conmigo</span>
                </button>
              </div>

              <p className={`text-center text-[11px] ${secondaryTextClass}`}>
                Al tramitar tu pedido, el equipo de {tenant.name} coordinará los detalles contigo al instante.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Modal / Dialog: Quiero que se contacten conmigo */}
      {showContactModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className={`w-full max-w-md rounded-3xl border p-5 shadow-2xl space-y-4 ${itemBgClass}`}>
            <div className="flex items-center justify-between border-b pb-3 border-black/10 dark:border-white/10">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <PhoneCall className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="font-bold text-sm">Tramitar Pedido de Productos</h4>
                  <p className="text-[11px] text-slate-500">Un asesor se comunicará contigo</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowContactModal(false);
                  setContactSubmitted(false);
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {contactSubmitted ? (
              <div className="py-6 text-center space-y-3">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-3xl bg-emerald-500/15 text-emerald-500">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <h4 className="font-bold text-base">¡Solicitud Enviada con Éxito!</h4>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  Registramos tu pedido de Gs. {totalCartPrice.toLocaleString("es-PY")}. Un asesor de {tenant.name} te escribirá por WhatsApp a la brevedad.
                </p>
                <div className="pt-2 flex flex-col gap-2">
                  <a
                    href={getWhatsAppOrderUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 text-white py-2.5 text-xs font-bold hover:bg-emerald-500 transition cursor-pointer"
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span>Abrir chat de WhatsApp directamente</span>
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      setShowContactModal(false);
                      setContactSubmitted(false);
                    }}
                    className="rounded-xl border border-slate-200 dark:border-white/10 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-black/5"
                  >
                    Cerrar ventana
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleConfirmContactRequest} className="space-y-3 text-xs">
                <div className="p-3 rounded-2xl bg-black/5 dark:bg-white/5 space-y-1">
                  <div className="flex justify-between font-bold">
                    <span>Total a abonar:</span>
                    <span className="text-primary font-black">
                      Gs. {totalCartPrice.toLocaleString("es-PY")}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    {cartItems.map((c) => `${c.qty}x ${c.product.name}`).join(", ")}
                  </p>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Tu Nombre Completo *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Marcos Benítez"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    className="w-full rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-xs outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Tu Número de WhatsApp *</label>
                  <input
                    type="tel"
                    required
                    placeholder="Ej: 0981 123 456"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="w-full rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-xs outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Dirección de entrega o nota (opcional)</label>
                  <textarea
                    rows={2}
                    placeholder="Ej: Para retirar el sábado / Delivery a barrio Villa Morra..."
                    value={contactNotes}
                    onChange={(e) => setContactNotes(e.target.value)}
                    className="w-full rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-slate-900 px-3.5 py-2 text-xs outline-none focus:border-primary resize-none"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowContactModal(false)}
                    className="rounded-xl border border-slate-200 dark:border-white/10 px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-black/5"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingContact || !contactPhone.trim()}
                    className="rounded-xl bg-primary text-white px-5 py-2 text-xs font-bold shadow-md shadow-primary/20 hover:opacity-95 disabled:opacity-50 transition cursor-pointer flex items-center gap-1.5"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>{isSubmittingContact ? "Enviando..." : "Confirmar y Solicitar Contacto"}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div
      className={`relative min-h-dvh w-full px-3.5 sm:px-4 pt-3 sm:pt-4 pb-28 sm:pb-12 transition-colors duration-300 overflow-x-hidden`}
      style={{
        fontFamily: fontStack(tenant.fontFamily || "plus-jakarta-sans"),
        ["--primary" as string]: tenant.primaryColor || "#5b31e6",
      }}
    >
      {/* Background Effects (UI/UX Pro Max) */}
      {tenant.backgroundEffect === "mesh" && (
        <div className="pointer-events-none fixed inset-0 overflow-hidden opacity-20">
          <div
            className="absolute -top-32 -left-32 h-80 w-80 rounded-full blur-3xl"
            style={{ backgroundColor: tenant.primaryColor || "#5b31e6" }}
          />
          <div
            className="absolute top-1/2 -right-32 h-80 w-80 rounded-full blur-3xl"
            style={{ backgroundColor: tenant.primaryColor || "#5b31e6" }}
          />
        </div>
      )}
      {tenant.backgroundEffect === "dots" && (
        <div
          className="pointer-events-none fixed inset-0 opacity-[0.06] dark:opacity-[0.08]"
          style={{
            backgroundImage: "radial-gradient(currentColor 1.5px, transparent 1.5px)",
            backgroundSize: "20px 20px",
          }}
        />
      )}
      {tenant.backgroundEffect === "grid" && (
        <div
          className="pointer-events-none fixed inset-0 opacity-[0.05] dark:opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
      )}

      {/* Lightbox / Quick photo preview modal */}
      {selectedPhoto && (
        <div
          onClick={() => setSelectedPhoto(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
        >
          <div className="relative max-w-2xl overflow-hidden rounded-3xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={selectedPhoto} alt="Corte" className="max-h-[80vh] w-full object-contain" />
            <p className="mt-2 text-center text-xs text-white/80">Tocá en cualquier lugar para cerrar</p>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* LAYOUT 1: SPLIT GALLERY (Mosaico de fotos a la izquierda, Reservas a la derecha) */}
      {/* ========================================================================= */}
      {layout === "split-gallery" ? (
        <div className="relative mx-auto max-w-5xl">
          <div className="grid items-start gap-8 lg:grid-cols-12">
            {/* Left Column: Business Bio & Photo Mosaic */}
            <div className="space-y-6 lg:col-span-5">
              <div className={`overflow-hidden rounded-3xl border ${cardThemeClass} p-5 sm:p-6`}>
                <div className="relative h-28 w-full overflow-hidden rounded-2xl bg-slate-800">
                  {tenant.bannerUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={tenant.bannerUrl} alt={tenant.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-r from-primary to-slate-900" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                </div>

                <div className="relative -mt-9 flex items-end justify-between px-2">
                  <div className="h-18 w-18 overflow-hidden rounded-2xl border-2 border-white bg-white shadow-md flex items-center justify-center font-bold text-slate-800 text-xl">
                    {tenant.logoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={tenant.logoUrl} alt={tenant.name} className="h-full w-full object-cover" />
                    ) : (
                      <Store className="h-8 w-8 text-primary" />
                    )}
                  </div>
                  {/* Social Buttons */}
                  <div className="flex items-center gap-2">
                    {tenant.whatsapp && (
                      <a
                        href={`https://wa.me/${tenant.whatsapp.replace(/\D/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-xs hover:bg-emerald-500 active:scale-95 transition"
                        aria-label="WhatsApp"
                      >
                        <MessageCircle className="h-5 w-5" />
                      </a>
                    )}
                    {tenant.instagram && (
                      <a
                        href={`https://instagram.com/${tenant.instagram.replace(/^@/, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex h-11 w-11 items-center justify-center rounded-2xl border shadow-xs active:scale-95 transition ${
                          isDark ? "border-slate-700 bg-slate-800 text-slate-200 hover:text-pink-500" : "border-slate-200 bg-white text-slate-700 hover:text-pink-500"
                        }`}
                        aria-label="Instagram"
                      >
                        <InstagramIcon className="h-5 w-5" />
                      </a>
                    )}
                  </div>
                </div>

                <div className="mt-3">
                  <h1 className={titleSizeClass}>{tenant.name}</h1>
                  {tenant.slogan && <p className="text-xs font-semibold text-primary">{tenant.slogan}</p>}
                  {tenant.bio && <p className={`mt-1 text-xs leading-relaxed ${secondaryTextClass}`}>{tenant.bio}</p>}
                </div>

                {tenant.bookingNotice && (
                  <div className="mt-3 flex items-start gap-2 rounded-2xl bg-amber-500/10 border border-amber-500/20 p-2.5 text-xs text-amber-800 dark:text-amber-300">
                    <Info className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                    <p className="text-[11px] leading-tight">{tenant.bookingNotice}</p>
                  </div>
                )}

                {/* Linktree / Custom Bio Buttons */}
                {renderLinktreeCustomLinks()}
              </div>

              {/* Photo Gallery Mosaic */}
              <div className={`rounded-3xl border ${cardThemeClass} p-5`}>
                <div className="flex items-center justify-between pb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                    <Camera className="h-3.5 w-3.5" /> Galería de Trabajos
                  </span>
                  <span className={`text-[11px] ${secondaryTextClass}`}>{gallery.length} fotos</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {gallery.map((url, i) => (
                    <div
                      key={i}
                      onClick={() => setSelectedPhoto(url)}
                      className="group relative h-28 cursor-pointer overflow-hidden rounded-2xl bg-slate-800"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={url}
                        alt="Trabajo"
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/0 transition group-hover:bg-black/20" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Trust Card */}
              <div className={`rounded-2xl border p-4 flex items-center gap-3 ${cardThemeClass}`}>
                <ShieldCheck className="h-8 w-8 text-emerald-500 shrink-0" />
                <p className="text-xs leading-snug">
                  <strong>Reserva 100% garantizada.</strong> Recibirás recordatorios automáticos por WhatsApp antes de tu turno.
                </p>
              </div>
            </div>

            {/* Right Column: Booking Wizard */}
            <div className="lg:col-span-7">
              {renderBookingWizardCard()}
            </div>
          </div>
        </div>
      ) : layout === "floating-card" ? (
        /* ========================================================================= */
        /* LAYOUT 2: FLOATING CARD CON HALO DE LUZ Y STORIES DE FOTOS */
        /* ========================================================================= */
        <div className="relative mx-auto max-w-lg">
          {/* Ambient Glow */}
          <div
            className="pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 h-72 w-72 rounded-full opacity-30 blur-3xl"
            style={{ backgroundColor: tenant.primaryColor || "#5b31e6" }}
          />

          {/* Brand Header */}
          <div className="relative mb-4 text-center">
            <div className="mx-auto h-20 w-20 overflow-hidden rounded-3xl border-4 border-white/20 shadow-xl bg-white flex items-center justify-center font-bold text-2xl">
              {tenant.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={tenant.logoUrl} alt={tenant.name} className="h-full w-full object-cover" />
              ) : (
                <Store className="h-10 w-10 text-primary" />
              )}
            </div>
            <h1 className={`mt-3 ${titleSizeClass}`}>{tenant.name}</h1>
            {tenant.slogan && <p className="text-xs font-semibold text-primary">{tenant.slogan}</p>}
            {tenant.bio && <p className={`mt-1 text-xs max-w-sm mx-auto ${secondaryTextClass}`}>{tenant.bio}</p>}

            {/* Stories / Photo Pills */}
            <div className="mt-4 flex items-center justify-center gap-3 overflow-x-auto pb-1">
              {gallery.slice(0, 5).map((url, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSelectedPhoto(url)}
                  className="group flex flex-col items-center gap-1 shrink-0"
                >
                  <div className="h-14 w-14 rounded-full p-0.5 ring-2 ring-primary transition group-hover:scale-105">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt="Story" className="h-full w-full rounded-full object-cover" />
                  </div>
                  <span className={`text-[10px] ${secondaryTextClass}`}>Ver trabajo</span>
                </button>
              ))}
            </div>

            {/* Linktree / Custom Bio Buttons */}
            {renderLinktreeCustomLinks()}
          </div>

          {renderBookingWizardCard()}
        </div>
      ) : layout === "minimal-editorial" ? (
        /* ========================================================================= */
        /* LAYOUT 3: MINIMAL EDITORIAL (Estilo Lookbook contemporáneo) */
        /* ========================================================================= */
        <div className="relative mx-auto max-w-md">
          <header className="mb-6 border-b border-black/10 dark:border-white/10 pb-4 text-center">
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-primary">
              Citas Online Oficiales
            </span>
            <h1 className={`mt-1 tracking-tight ${titleSizeClass}`}>{tenant.name}</h1>
            {tenant.slogan && <p className="mt-0.5 text-xs italic opacity-75">{tenant.slogan}</p>}
          </header>

          {/* Linktree / Custom Bio Buttons */}
          {renderLinktreeCustomLinks()}

          {renderBookingWizardCard()}

          {/* Minimalist Lookbook Strip */}
          <div className="mt-6 flex gap-2 overflow-x-auto pb-2">
            {gallery.map((url, i) => (
              <div
                key={i}
                onClick={() => setSelectedPhoto(url)}
                className="h-20 w-20 shrink-0 cursor-pointer overflow-hidden rounded-xl border border-black/5 dark:border-white/5 opacity-80 hover:opacity-100 transition"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="Look" className="h-full w-full object-cover" />
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* ========================================================================= */
        /* LAYOUT 4: PANORAMIC (Clásico con banner ancho y tarjeta centrada) */
        /* ========================================================================= */
        <main className="relative mx-auto flex min-h-dvh w-full max-w-lg flex-col">
          {/* Header Banner & Profile Branding */}
          <header className={`overflow-hidden rounded-3xl border ${cardThemeClass} shadow-xs mb-4`}>
            {/* Panoramic Banner */}
            {tenant.bannerUrl ? (
              <div className="relative h-32 w-full overflow-hidden bg-slate-900 sm:h-40">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={tenant.bannerUrl}
                  alt={tenant.name}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              </div>
            ) : (
              <div className="h-16 w-full bg-gradient-to-r from-primary to-slate-900" />
            )}

            {/* Profile Details */}
            <div className="relative px-5 pb-5 pt-3">
              <div className="flex items-end justify-between -mt-12 mb-3">
                <div className={`relative h-20 w-20 overflow-hidden flex items-center justify-center font-bold text-slate-800 text-2xl transition-all ${avatarShapeClass} ${avatarBorderClass} bg-white`}>
                  {tenant.logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={tenant.logoUrl}
                      alt={tenant.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Store className="h-9 w-9 text-primary" />
                  )}
                </div>

                {/* Social Media Contact Pills */}
                <div className="flex items-center gap-2">
                  {tenant.instagram && (
                    <a
                      href={`https://instagram.com/${tenant.instagram.replace(/^@/, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex h-11 w-11 items-center justify-center rounded-2xl border shadow-xs hover:text-pink-500 active:scale-95 transition ${
                        isDark ? "border-slate-700 bg-slate-800 text-slate-200" : "border-slate-200 bg-white text-slate-700"
                      }`}
                      aria-label="Instagram"
                    >
                      <InstagramIcon className="h-5 w-5" />
                    </a>
                  )}
                  {tenant.whatsapp && (
                    <a
                      href={`https://wa.me/${tenant.whatsapp.replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-xs hover:bg-emerald-500 active:scale-95 transition"
                      aria-label="WhatsApp"
                    >
                      <MessageCircle className="h-5 w-5" />
                    </a>
                  )}
                  {tenant.googleMapsUrl && (
                    <a
                      href={tenant.googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex h-11 w-11 items-center justify-center rounded-2xl border shadow-xs hover:text-primary active:scale-95 transition ${
                        isDark ? "border-slate-700 bg-slate-800 text-slate-200" : "border-slate-200 bg-white text-slate-700"
                      }`}
                      aria-label="Google Maps"
                    >
                      <MapPin className="h-5 w-5" />
                    </a>
                  )}
                </div>
              </div>

              <div>
                <h1 className={`tracking-tight ${titleSizeClass}`}>{tenant.name}</h1>
                {tenant.slogan && (
                  <p className="mt-0.5 text-xs sm:text-sm font-bold text-primary">{tenant.slogan}</p>
                )}
                {tenant.bio && (
                  <p className={`mt-1.5 text-xs sm:text-sm leading-relaxed ${secondaryTextClass}`}>{tenant.bio}</p>
                )}
              </div>

              {/* Booking Notice / Policy Alert */}
              {tenant.bookingNotice && (
                <div className="mt-3.5 flex items-start gap-2.5 rounded-2xl bg-amber-500/15 border border-amber-500/30 p-3 text-xs text-amber-900 dark:text-amber-200">
                  <Info className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-xs leading-relaxed font-medium">{tenant.bookingNotice}</p>
                </div>
              )}

              {/* Linktree / Custom Bio Buttons when links-first */}
              {tenant.sectionOrder === "links-first" && renderLinktreeCustomLinks()}

              {/* Gallery Mini-Strip */}
              {gallery.length > 0 && (
                <div className="mt-4 flex gap-1.5 overflow-x-auto pb-1">
                  {gallery.slice(0, 4).map((url, i) => (
                    <div
                      key={i}
                      onClick={() => setSelectedPhoto(url)}
                      className="h-14 w-14 shrink-0 cursor-pointer overflow-hidden rounded-xl border border-black/5 dark:border-white/5"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt="Local" className="h-full w-full object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </header>

          {/* Body Section: Respects sectionOrder */}
          {tenant.sectionOrder === "links-only" ? (
            <div className="space-y-4">
              {renderLinktreeCustomLinks()}
              <div className={`overflow-hidden rounded-3xl border ${cardThemeClass} p-5`}>
                <button
                  type="button"
                  onClick={() => setShowBioBooking(!showBioBooking)}
                  className={`w-full flex items-center justify-between transition ${customBtnClasses}`}
                  style={customBtnStyles}
                >
                  <span className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {showBioBooking ? "Ocultar Sistema de Turnos" : "Agendar Turno Online"}
                  </span>
                  <ChevronRight className={`h-4 w-4 transition-transform ${showBioBooking ? "rotate-90" : ""}`} />
                </button>
                {showBioBooking && (
                  <div className="mt-4 pt-4 border-t border-black/5 dark:border-white/5">
                    {renderBookingWizardCard()}
                  </div>
                )}
              </div>
            </div>
          ) : tenant.sectionOrder === "links-first" ? (
            renderBookingWizardCard()
          ) : (
            <>
              {renderBookingWizardCard()}
              {renderLinktreeCustomLinks()}
            </>
          )}
        </main>
      )}

      {/* Sticky Mobile Action Dock (Fresha / Boulevard standard) */}
      {activeTab === "turnos" && (
        <aside aria-label="Acciones de reserva móvil" className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 dark:bg-slate-950/95 border-t border-slate-800 backdrop-blur-md px-4 py-3 shadow-2xl safe-area-pb">
          <div className="flex items-center justify-between gap-3 max-w-lg mx-auto">
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep((s) => (s - 1) as 1 | 2)}
                className="h-11 px-3.5 rounded-xl border border-slate-700 bg-slate-800 text-slate-200 text-xs font-semibold shrink-0 active:scale-95 transition cursor-pointer"
              >
                Volver
              </button>
            )}

            <div className="min-w-0 flex-1">
              {step === 1 && service ? (
                <div>
                  <p className="text-xs font-bold text-white truncate">{service.name}</p>
                  <p className="text-[11px] font-black text-primary font-mono">
                    Gs. {(service.promoPrice && service.hasPromo ? service.promoPrice : service.price).toLocaleString("es-PY")}
                  </p>
                </div>
              ) : step === 1 ? (
                <p className="text-xs text-slate-400">Elegí tu servicio</p>
              ) : null}

              {step === 2 && start ? (
                <div>
                  <p className="text-xs font-bold text-white truncate">
                    {(() => {
                      try {
                        return formatInTimeZone(new Date(start), tenant.timezone || "America/Asuncion", "d 'de' MMM · HH:mm 'hs'", { locale: es });
                      } catch {
                        return "Fecha seleccionada";
                      }
                    })()}
                  </p>
                  <p className="text-[11px] text-slate-400 truncate">{service?.name}</p>
                </div>
              ) : step === 2 ? (
                <p className="text-xs text-slate-400">Elegí fecha y horario</p>
              ) : null}

              {step === 3 && (
                <div>
                  <p className="text-xs font-bold text-white truncate">Paso final</p>
                  <p className="text-[11px] text-slate-300">
                    Total: <span className="font-bold text-primary">Gs. {(service?.promoPrice && service?.hasPromo ? service.promoPrice : service?.price || 0).toLocaleString("es-PY")}</span>
                  </p>
                </div>
              )}
            </div>

            {step < 3 ? (
              <button
                type="button"
                disabled={!canContinue}
                onClick={() => setStep((s) => (s + 1) as 2 | 3)}
                className={`h-11 px-5 rounded-xl font-bold text-xs inline-flex items-center justify-center gap-1.5 transition active:scale-95 disabled:opacity-30 cursor-pointer ${customBtnClasses}`}
                style={customBtnStyles}
              >
                <span>Siguiente</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="button"
                disabled={!canContinue || pending}
                onClick={confirm}
                className={`h-11 px-5 rounded-xl font-bold text-xs inline-flex items-center justify-center gap-1.5 transition active:scale-95 disabled:opacity-30 cursor-pointer ${customBtnClasses}`}
                style={customBtnStyles}
              >
                <span>{pending ? "Guardando..." : "Confirmar Cita"}</span>
              </button>
            )}
          </div>
        </aside>
      )}
    </div>
  );
}

function Progress({ step, isDark }: { step: 1 | 2 | 3; isDark: boolean }) {
  return (
    <div className="flex items-center gap-1.5">
      {[1, 2, 3].map((num) => (
        <span
          key={num}
          className={`h-1.5 rounded-full transition-all duration-300 ${
            num === step
              ? "w-6 bg-primary"
              : num < step
              ? "w-2 bg-primary/40"
              : isDark
              ? "w-2 bg-slate-800"
              : "w-2 bg-slate-200"
          }`}
        />
      ))}
    </div>
  );
}

function StepFrame({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  );
}

function EmptyState({ title, text, isDark }: { title: string; text: string; isDark: boolean }) {
  return (
    <div className={`rounded-3xl border border-dashed p-8 text-center ${isDark ? "border-slate-800 bg-slate-900/50" : "border-slate-200 bg-slate-50/50"}`}>
      <CalendarClock className="mx-auto h-8 w-8 text-slate-400" />
      <p className="mt-3 font-bold text-sm">{title}</p>
      <p className="mt-1 text-xs text-slate-500">{text}</p>
    </div>
  );
}

function formatCivil(civilDate: string, timezone: string): string {
  const [y, m, d] = civilDate.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
  return formatInTimeZone(date, timezone, "EEEE d 'de' MMMM", { locale: es });
}
