"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Scissors,
  Plus,
  Search,
  Coins,
  Clock,
  Users,
  ArrowRight,
  Copy,
  Check,
  Pencil,
  Trash2,
  BadgePercent,
  Flame,
  Eye,
  EyeOff,
  X,
  CreditCard,
  Building2,
  Hourglass,
  Timer,
  ShieldCheck,
  ImagePlus,
  Loader2,
  ChevronDown,
} from "lucide-react";
import { useDashboardStore } from "@/store/useDashboardStore";
import GlassTiltCard from "@/components/dashboard/ui/GlassTiltCard";
import Modal from "@/components/dashboard/ui/Modal";
import { triggerHaptic } from "@/lib/haptics";
import { formatGs } from "@/lib/dashboard-dates";
import type { ServiceItem } from "@/lib/dashboard-types";
import { compressClientImage } from "@/lib/media-compression";

const INITIAL_CATEGORIES = [
  "Peluquería",
  "Barbería",
  "Color",
  "Tratamiento",
  "Estética",
  "Manicura & Pedicura",
];

const PRESET_DURATIONS = [15, 30, 45, 60, 90, 120];

export default function ServiciosPage() {
  const {
    services,
    staff,
    addService,
    updateService,
    removeService,
    pushToast,
    business,
  } = useDashboardStore();

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("Todos");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showCatalogCharts, setShowCatalogCharts] = useState(false);

  // Custom Categories State (persisted to PostgreSQL SQL via /api/services/categories)
  const [customCategories, setCustomCategories] = useState<string[]>(INITIAL_CATEGORIES);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryInput, setNewCategoryInput] = useState("");

  // Delete Confirmation Modal State
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);

  // Service Modal state (Create / Edit general info)
  const [serviceModalOpen, setServiceModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);
  const serviceCoverInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingServiceCover, setIsUploadingServiceCover] = useState(false);
  const [isSavingService, setIsSavingService] = useState(false);
  const [serviceForm, setServiceForm] = useState({
    name: "",
    category: "Peluquería",
    durationMin: 45,
    price: 80000,
    description: "",
    imageUrl: "",
    active: true,
    staffIds: [] as string[],
  });

  // Dedicated Promo Flash Modal State
  const [promoModalService, setPromoModalService] = useState<ServiceItem | null>(null);
  const [promoForm, setPromoForm] = useState({
    hasPromo: true,
    promoCalcMode: "percentage" as "percentage" | "amount",
    promoPercent: 20,
    promoPrice: 64000,
    promoDisplayType: "percentage" as "percentage" | "amount",
    promoBadge: "-20% OFF",
    promoType: "time" as "time" | "quantity" | "both",
    promoLimitHours: 24,
    promoLimitQuantity: 5,
    requirePrepayment: false,
    prepaymentType: "deposit" as "deposit" | "full",
    prepaymentAmount: 30000,
    prepaymentMethod: "transferencia" as "transferencia" | "sipap" | "qr" | "cualquiera",
    prepaymentInstructions: "Enviar comprobante por WhatsApp al agendar para congelar tu cupo flash.",
  });

  // Fetch categories from SQL on mount
  useEffect(() => {
    fetch("/api/services/categories")
      .then((r) => r.json())
      .then((data) => {
        if (data.ok && Array.isArray(data.categories) && data.categories.length > 0) {
          setCustomCategories(data.categories);
        }
      })
      .catch((err) => {
        console.warn("No se pudo cargar categorías desde SQL:", err);
      });
  }, []);

  // Dynamic Categories merging defaults + SQL created + existing services
  const allCategories = useMemo(() => {
    const set = new Set<string>();
    customCategories.forEach((c) => set.add(c));
    services.forEach((s) => {
      if (s.category && s.category.trim()) set.add(s.category.trim());
    });
    return Array.from(set);
  }, [customCategories, services]);

  const filterCategoryList = useMemo(() => ["Todos", ...allCategories], [allCategories]);

  // Active staff list
  const activeStaff = useMemo(() => staff.filter((s) => s.active), [staff]);

  // Filtered Services
  const filteredServices = useMemo(() => {
    return services.filter((s) => {
      const matchSearch =
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.description.toLowerCase().includes(search.toLowerCase()) ||
        (s.category && s.category.toLowerCase().includes(search.toLowerCase()));
      const matchCat =
        categoryFilter === "Todos" ||
        (s.category && s.category.toLowerCase() === categoryFilter.toLowerCase());
      return matchSearch && matchCat;
    });
  }, [services, search, categoryFilter]);

  // KPIs
  const activeStaffCount = activeStaff.length;
  const visibleServicesCount = services.filter((s) => s.active !== false).length;
  const pausedServicesCount = services.length - visibleServicesCount;
  const visibleServicesPercent = services.length
    ? Math.round((visibleServicesCount / services.length) * 100)
    : 0;
  const avgPrice =
    services.length > 0
      ? Math.round(services.reduce((sum, s) => sum + s.price, 0) / services.length)
      : 0;
  const avgDuration =
    services.length > 0
      ? Math.round(services.reduce((sum, s) => sum + s.durationMin, 0) / services.length)
      : 0;
  const categoryStats = useMemo(
    () =>
      allCategories
        .map((category) => ({
          category,
          count: services.filter(
            (service) => service.category?.toLowerCase() === category.toLowerCase()
          ).length,
        }))
        .sort((a, b) => b.count - a.count || a.category.localeCompare(b.category))
        .slice(0, 6),
    [allCategories, services]
  );
  const maxCategoryCount = Math.max(1, ...categoryStats.map(({ count }) => count));

  // Handlers for Categories (Saved in PostgreSQL SQL)
  async function handleCreateCategory() {
    const trimmed = newCategoryInput.trim();
    if (!trimmed) return;
    if (allCategories.some((c) => c.toLowerCase() === trimmed.toLowerCase())) {
      pushToast("error", "Esa categoría ya existe.");
      return;
    }

    try {
      const res = await fetch("/api/services/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        pushToast("error", data.message || "No se pudo guardar la categoría.");
        return;
      }

      if (Array.isArray(data.categories)) {
        setCustomCategories(data.categories);
      } else {
        setCustomCategories((prev) => [...prev, trimmed]);
      }
      setServiceForm((prev) => ({ ...prev, category: trimmed }));
      setNewCategoryInput("");
      setIsAddingCategory(false);
      pushToast("success", `Categoría "${trimmed}" guardada`);
    } catch (err) {
      console.error("Error guardando categoría en SQL:", err);
      pushToast("error", "No se pudo guardar la categoría. Revisá tu conexión e intentá de nuevo.");
    }
  }

  async function handleConfirmDeleteCategory() {
    if (!categoryToDelete) return;
    const cat = categoryToDelete;
    try {
      const res = await fetch(`/api/services/categories?name=${encodeURIComponent(cat)}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        pushToast("error", data.message || "No se pudo eliminar la categoría.");
        return;
      }

      if (Array.isArray(data.categories)) {
        setCustomCategories(data.categories);
      } else {
        setCustomCategories((prev) => prev.filter((c) => c.toLowerCase() !== cat.toLowerCase()));
      }
      if (categoryFilter.toLowerCase() === cat.toLowerCase()) {
        setCategoryFilter("Todos");
      }
      setCategoryToDelete(null);
      pushToast("success", `Categoría "${cat}" eliminada del catálogo.`);
    } catch (err) {
      console.error("Error eliminando categoría en SQL:", err);
      pushToast("error", "No se pudo eliminar la categoría. Revisá tu conexión e intentá de nuevo.");
    }
  }

  // Handlers for Services (Create / Edit)
  function handleOpenCreateService() {
    setEditingService(null);
    const defaultStaffIds = activeStaff.map((s) => s.id);
    setServiceForm({
      name: "",
      category: allCategories[0] || "Peluquería",
      durationMin: 40,
      price: 80000,
      description: "",
      imageUrl: "",
      active: true,
      staffIds: defaultStaffIds,
    });
    setServiceModalOpen(true);
  }

  function handleOpenEditService(s: ServiceItem) {
    setEditingService(s);
    const initialStaffIds =
      s.staffIds && s.staffIds.length > 0
        ? s.staffIds
        : activeStaff.map((st) => st.id);

    setServiceForm({
      name: s.name,
      category: s.category || allCategories[0] || "Peluquería",
      durationMin: s.durationMin,
      price: s.price,
      description: s.description,
      imageUrl: s.imageUrl || "",
      active: s.active !== false,
      staffIds: initialStaffIds,
    });
    setServiceModalOpen(true);
  }

  async function handleSaveService(e: React.FormEvent) {
    e.preventDefault();
    if (isSavingService) return;
    if (!serviceForm.name.trim()) {
      pushToast("error", "Ingresá el nombre del servicio.");
      return;
    }

    const payload = {
      name: serviceForm.name.trim(),
      category: serviceForm.category,
      durationMin: Number(serviceForm.durationMin) || 30,
      price: Number(serviceForm.price) || 0,
      description: serviceForm.description.trim(),
      image: editingService?.image || "scissors",
      imageUrl: serviceForm.imageUrl,
      active: serviceForm.active,
      staffIds: serviceForm.staffIds,
    };

    setIsSavingService(true);
    try {
      const saved = editingService
        ? await updateService(editingService.id, payload)
        : await addService(payload);
      if (!saved) return;

      pushToast(
        "success",
        `Servicio "${serviceForm.name}" ${editingService ? "actualizado" : "creado"}`
      );
      setServiceModalOpen(false);
    } catch (error) {
      console.error("Error guardando servicio:", error);
      pushToast("error", "No se pudo guardar el servicio. Revisá la conexión e intentá de nuevo.");
    } finally {
      setIsSavingService(false);
    }
  }

  async function handleUploadServiceCover(file: File | null) {
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      pushToast("error", "Elegí una imagen JPG, PNG o WEBP.");
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      pushToast("error", "La imagen debe pesar menos de 15 MB.");
      return;
    }

    setIsUploadingServiceCover(true);
    try {
      const compressed = await compressClientImage(file, 1400, 900, 0.82);
      const response = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dataUrl: compressed.dataUrl, filename: file.name }),
      });
      const result = await response.json();
      if (!response.ok || !result.ok || typeof result.url !== "string") {
        throw new Error(result.error || "No se pudo subir la portada.");
      }
      setServiceForm((current) => ({ ...current, imageUrl: result.url }));
      pushToast("success", "Portada optimizada y lista para el catálogo.");
    } catch (error) {
      console.error("Error subiendo portada del servicio:", error);
      pushToast("error", error instanceof Error ? error.message : "No se pudo subir la portada.");
    } finally {
      setIsUploadingServiceCover(false);
    }
  }

  // Toggle staff assignment
  function handleToggleStaff(staffId: string) {
    setServiceForm((prev) => {
      const exists = prev.staffIds.includes(staffId);
      const next = exists
        ? prev.staffIds.filter((id) => id !== staffId)
        : [...prev.staffIds, staffId];
      return { ...prev, staffIds: next };
    });
  }

  function handleSelectAllStaff() {
    setServiceForm((prev) => ({
      ...prev,
      staffIds: activeStaff.map((s) => s.id),
    }));
  }

  // Handlers for Dedicated Promo Flash Modal
  function handleOpenPromoModal(service: ServiceItem) {
    setPromoModalService(service);
    const price = service.price || 0;
    const hasPromo = !!service.hasPromo;
    const promoPrice = service.promoPrice || Math.round(price * 0.8);
    const calculatedPercent =
      price > 0 && promoPrice < price ? Math.round(((price - promoPrice) / price) * 100) : 20;

    setPromoForm({
      hasPromo: true, // When opening promo modal, default active toggle on
      promoCalcMode: "percentage",
      promoPercent: calculatedPercent,
      promoPrice,
      promoDisplayType: service.promoDisplayType || "percentage",
      promoBadge: service.promoBadge || `-${calculatedPercent}% OFF`,
      promoType: (service.promoType as any) || "time",
      promoLimitHours: service.promoLimitHours || 24,
      promoLimitQuantity: service.promoLimitQuantity || 5,
      requirePrepayment: Boolean(service.requirePrepayment),
      prepaymentType: service.prepaymentType || "deposit",
      prepaymentAmount: service.prepaymentAmount !== undefined ? service.prepaymentAmount : Math.round(promoPrice * 0.5),
      prepaymentMethod: service.prepaymentMethod || "transferencia",
      prepaymentInstructions: service.prepaymentInstructions || "Enviar comprobante por WhatsApp al agendar para congelar tu cupo flash.",
    });
  }

  function handlePromoPercentChange(newPercent: number) {
    if (!promoModalService) return;
    const clampedPercent = Math.min(99, Math.max(1, newPercent));
    const basePrice = promoModalService.price;
    const calculatedPromoPrice = Math.round(basePrice * (1 - clampedPercent / 100));
    const badge =
      promoForm.promoDisplayType === "percentage"
        ? `-${clampedPercent}% OFF`
        : `Ahorrá ${formatGs(basePrice - calculatedPromoPrice)}`;

    setPromoForm((prev) => ({
      ...prev,
      promoPercent: clampedPercent,
      promoPrice: calculatedPromoPrice,
      promoBadge: badge,
      promoCalcMode: "percentage",
    }));
  }

  function handlePromoPriceChange(newPromoPrice: number) {
    if (!promoModalService) return;
    const basePrice = promoModalService.price;
    const clamped = Math.max(0, newPromoPrice);
    const calculatedPercent =
      basePrice > 0 ? Math.round(((basePrice - clamped) / basePrice) * 100) : 0;
    const badge =
      promoForm.promoDisplayType === "percentage"
        ? `-${Math.max(0, calculatedPercent)}% OFF`
        : `Ahorrá ${formatGs(Math.max(0, basePrice - clamped))}`;

    setPromoForm((prev) => ({
      ...prev,
      promoPrice: clamped,
      promoPercent: Math.max(0, calculatedPercent),
      promoBadge: badge,
      promoCalcMode: "amount",
    }));
  }

  function handlePromoDisplayTypeChange(type: "percentage" | "amount") {
    if (!promoModalService) return;
    let badge = "";
    if (type === "percentage") {
      badge = `-${promoForm.promoPercent}% OFF`;
    } else {
      const saved = Math.max(0, promoModalService.price - promoForm.promoPrice);
      badge = `Ahorrá ${formatGs(saved)}`;
    }
    setPromoForm((prev) => ({
      ...prev,
      promoDisplayType: type,
      promoBadge: badge,
    }));
  }

  async function handleSavePromo(e: React.FormEvent) {
    e.preventDefault();
    if (!promoModalService) return;

    const saved = await updateService(promoModalService.id, {
      hasPromo: promoForm.hasPromo,
      promoPrice: promoForm.hasPromo ? Number(promoForm.promoPrice) || 0 : undefined,
      promoBadge: promoForm.hasPromo ? promoForm.promoBadge : undefined,
      promoDisplayType: promoForm.hasPromo ? promoForm.promoDisplayType : undefined,
      promoType: promoForm.hasPromo ? promoForm.promoType : undefined,
      promoLimitHours: promoForm.hasPromo && (promoForm.promoType === "time" || promoForm.promoType === "both") ? Number(promoForm.promoLimitHours) || 24 : undefined,
      promoLimitQuantity: promoForm.hasPromo && (promoForm.promoType === "quantity" || promoForm.promoType === "both") ? Number(promoForm.promoLimitQuantity) || 5 : undefined,
      requirePrepayment: promoForm.hasPromo ? promoForm.requirePrepayment : false,
      prepaymentType: promoForm.hasPromo && promoForm.requirePrepayment ? promoForm.prepaymentType : undefined,
      prepaymentAmount: promoForm.hasPromo && promoForm.requirePrepayment ? (promoForm.prepaymentType === "full" ? Number(promoForm.promoPrice) || 0 : Number(promoForm.prepaymentAmount) || 0) : undefined,
      prepaymentMethod: promoForm.hasPromo && promoForm.requirePrepayment ? promoForm.prepaymentMethod : undefined,
      prepaymentInstructions: promoForm.hasPromo && promoForm.requirePrepayment ? promoForm.prepaymentInstructions : undefined,
    });
    if (!saved) return;

    pushToast(
      "success",
      promoForm.hasPromo
        ? `Promoción activada para "${promoModalService.name}"`
        : `Promoción desactivada para "${promoModalService.name}"`
    );
    setPromoModalService(null);
  }

  async function handleRemovePromo() {
    if (!promoModalService) return;
    const saved = await updateService(promoModalService.id, {
      hasPromo: false,
      promoPrice: undefined,
      promoBadge: undefined,
      promoDisplayType: undefined,
      promoType: undefined,
      promoLimitHours: undefined,
      promoLimitQuantity: undefined,
      requirePrepayment: false,
      prepaymentType: undefined,
      prepaymentAmount: undefined,
      prepaymentMethod: undefined,
      prepaymentInstructions: undefined,
    });
    if (!saved) return;
    pushToast("success", `Promoción quitada de "${promoModalService.name}"`);
    setPromoModalService(null);
  }

  async function handleToggleVisibility(service: ServiceItem) {
    const nextActive = service.active === false ? true : false;
    const saved = await updateService(service.id, { active: nextActive });
    if (!saved) return;
    pushToast(
      "success",
      `Servicio "${service.name}" ${nextActive ? "ahora está visible online" : "ahora está oculto"}`
    );
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return;
    const deleted = await removeService(deleteTarget.id);
    if (!deleted) return;
    pushToast("success", `Servicio "${deleteTarget.name}" eliminado`);
    setDeleteTarget(null);
  }

  async function handleCopyServiceLink(serviceId: string, serviceName: string) {
    const origin = typeof window !== "undefined" ? window.location.origin : "https://agendate.py";
    const url = `${origin}/${business.slug || "barberia"}/reservar?service=${serviceId}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(serviceId);
      pushToast("success", `Enlace de "${serviceName}" copiado`);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      pushToast("error", "No se pudo copiar el enlace");
    }
  }

  return (
    <div className="servicios-mobile-ui space-y-6 pb-12 sm:pb-8 w-full max-w-full overflow-hidden">
      {/* ========================================================= */}
      {/* 1. DARK CONSOLE HERO BANNER                                */}
      {/* ═══ CLEAN NATIVE PAGE HEADER ═══ */}
      <div
        data-tour="servicios-header"
        className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between py-1"
      >
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">Catálogo</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-3xl">Servicios & Precios</h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-500 dark:text-zinc-400">Precios, duración y quién hace cada servicio.</p>
        </div>

        {/* Quick Action Dock */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            data-tour="servicios-new-btn"
            onClick={handleOpenCreateService}
            className="inline-flex min-h-11 sm:min-h-0 items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold text-white shadow-xs transition-all duration-150 ease-out hover:brightness-110 active:scale-[0.98] cursor-pointer"
            style={{
              backgroundColor: business.primaryColor || "#FF4F2B",
            }}
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Nuevo Servicio</span>
          </button>

          <Link
            href="/dashboard/equipo"
            className="inline-flex min-h-11 min-w-11 sm:min-h-0 sm:min-w-0 items-center justify-center gap-1.5 rounded-xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-xs transition"
            title="Administrar comisiones y colaboradores"
          >
            <Users className="h-3.5 w-3.5 text-slate-400" />
            <span className="hidden sm:inline">Equipo</span>
          </Link>
        </div>
      </div>

      {/* Catálogo: métricas y gráficos con los mismos datos en móvil y escritorio */}
      <section
        data-tour="servicios-kpis"
        aria-labelledby="servicios-summary-title"
        className="kpi-rise rounded-3xl glass-panel p-3.5 sm:p-5 lg:p-6 shadow-xs space-y-3.5 sm:space-y-5"
      >
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h2 id="servicios-summary-title" className="text-base font-semibold text-slate-900 dark:text-white">
              Resumen del catálogo
            </h2>
            <p className="mt-1 hidden text-xs text-slate-500 dark:text-slate-400 sm:block">
              Visibilidad, duración y distribución de tus servicios.
            </p>
          </div>
          <span className="shrink-0 text-right text-[11px] text-slate-500 dark:text-slate-400">
            {services.length} servicios · {activeStaffCount} profesionales
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4">
          {[
            { label: "Servicios", value: services.length.toLocaleString("es-PY"), note: "en el catálogo" },
            { label: "Visibles online", value: `${visibleServicesCount} / ${services.length}`, note: `${visibleServicesPercent}% del catálogo` },
            { label: "Duración promedio", value: `${avgDuration} min`, note: "por turno" },
            { label: "Precio promedio", value: formatGs(avgPrice), note: "por servicio" },
          ].map((metric) => (
            <div key={metric.label} className="min-w-0 rounded-2xl glass-panel-subtle px-3.5 py-3 sm:px-4">
              <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">{metric.label}</div>
              <div className="mt-1 truncate text-lg font-bold tracking-tight text-slate-900 dark:text-white tabular-nums sm:text-xl">
                {metric.value}
              </div>
              <div className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">{metric.note}</div>
            </div>
          ))}
        </div>

        <button
          type="button"
          aria-expanded={showCatalogCharts}
          onClick={() => setShowCatalogCharts((visible) => !visible)}
          className="flex min-h-10 w-full items-center justify-between border-t border-slate-200/70 pt-3 text-left text-xs font-semibold text-slate-700 transition hover:text-primary dark:border-white/10 dark:text-slate-200"
        >
          <span>{showCatalogCharts ? "Ocultar gráficos" : "Ver gráficos y distribución"}</span>
          <ChevronDown className={`h-4 w-4 transition-transform ${showCatalogCharts ? "rotate-180" : ""}`} aria-hidden="true" />
        </button>

        {showCatalogCharts && (
        <div className="grid gap-4 border-t border-slate-200/70 pt-4 dark:border-white/10 lg:grid-cols-2 lg:gap-6">
          <section className="min-w-0" aria-labelledby="servicios-visibility-title">
            <div className="flex items-baseline justify-between gap-3">
              <h3 id="servicios-visibility-title" className="text-sm font-semibold text-slate-900 dark:text-white">
                Visibilidad del catálogo
              </h3>
              <span className="text-xs font-semibold tabular-nums text-slate-600 dark:text-slate-300">
                {visibleServicesPercent}% visible
              </span>
            </div>
            <div
              className="mt-3 flex h-2.5 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10"
              role="img"
              aria-label={`${visibleServicesCount} servicios visibles y ${pausedServicesCount} pausados`}
            >
              <span
                className="h-full rounded-full transition-[width] duration-500"
                style={{
                  width: `${visibleServicesPercent}%`,
                  backgroundColor: business.primaryColor || "#FF4F2B",
                }}
              />
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: business.primaryColor || "#FF4F2B" }} />
                <span>Visibles</span>
                <strong className="ml-auto tabular-nums text-slate-900 dark:text-white">{visibleServicesCount}</strong>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                <span className="h-2 w-2 rounded-full bg-slate-400 dark:bg-slate-500" />
                <span>Pausados</span>
                <strong className="ml-auto tabular-nums text-slate-900 dark:text-white">{pausedServicesCount}</strong>
              </div>
            </div>
          </section>

          <section className="min-w-0" aria-labelledby="servicios-categories-title">
            <div className="flex items-baseline justify-between gap-3">
              <h3 id="servicios-categories-title" className="text-sm font-semibold text-slate-900 dark:text-white">
                Servicios por categoría
              </h3>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                {allCategories.length} categorías
              </span>
            </div>
            {categoryStats.length > 0 ? (
              <div className="mt-3 grid gap-x-5 gap-y-2.5 sm:grid-cols-2">
                {categoryStats.map(({ category, count }) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setCategoryFilter(category)}
                    aria-label={`Filtrar por ${category}: ${count} ${count === 1 ? "servicio" : "servicios"}`}
                    className={`min-w-0 rounded-lg text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 ${
                      categoryFilter === category ? "text-primary" : "text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
                    }`}
                  >
                    <span className="flex items-center gap-2 text-[11px]">
                      <span className="min-w-0 flex-1 truncate">{category}</span>
                      <span className="tabular-nums text-slate-500 dark:text-slate-400">{count}</span>
                    </span>
                    <span className="mt-1.5 block h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
                      <span
                        className="block h-full rounded-full transition-[width] duration-500"
                        style={{
                          width: `${(count / maxCategoryCount) * 100}%`,
                          backgroundColor: business.primaryColor || "#FF4F2B",
                        }}
                      />
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">Las categorías aparecerán al crear servicios.</p>
            )}
            {allCategories.length > categoryStats.length && (
              <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
                Mostrando las 6 categorías con más servicios.
              </p>
            )}
          </section>
        </div>
        )}
      </section>

      {/* Search Bar & Category Filters + Add Category Action */}
      <div
        data-tour="servicios-filters"
        className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between"
      >
        <div className="flex min-w-0 max-w-full items-center gap-1.5 overflow-x-auto overscroll-x-contain touch-pan-x scroll-smooth pb-1 scrollbar-none lg:flex-1">
          {filterCategoryList.map((cat) => {
            const isSelected = categoryFilter === cat;
            const isRemovable = cat !== "Todos";
            return (
              <div
                key={cat}
                className={`group inline-flex min-h-10 sm:min-h-8 items-center gap-1 rounded-2xl border px-2.5 text-xs font-semibold transition shrink-0 ${
                  isSelected
                    ? "border-primary bg-primary/10 text-primary shadow-xs"
                    : "border-slate-200/80 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <button
                  type="button"
                  onClick={() => setCategoryFilter(cat)}
                  className="inline-flex min-h-10 min-w-[44px] sm:min-h-8 sm:min-w-0 items-center justify-center cursor-pointer"
                >
                  {cat}
                </button>
                {isRemovable && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setCategoryToDelete(cat);
                    }}
                    title={`Eliminar categoría "${cat}"`}
                    className="inline-flex h-10 w-10 sm:h-8 sm:w-8 items-center justify-center rounded-lg opacity-60 hover:opacity-100 hover:bg-rose-500/10 hover:text-rose-500 transition cursor-pointer"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            );
          })}

          {/* Quick Add Category inline */}
          {isAddingCategory ? (
            <div className="inline-flex items-center gap-1 rounded-2xl border border-primary/40 bg-white dark:bg-slate-900 p-1 shadow-xs shrink-0">
              <input
                type="text"
                autoFocus
                placeholder="Nombre categoría..."
                value={newCategoryInput}
                onChange={(e) => setNewCategoryInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleCreateCategory();
                  } else if (e.key === "Escape") {
                    setIsAddingCategory(false);
                  }
                }}
                className="h-10 sm:h-8 w-32 px-2 text-sm text-slate-900 dark:text-white focus:outline-none sm:text-xs"
              />
              <button
                type="button"
                onClick={handleCreateCategory}
                className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-white hover:opacity-90 transition cursor-pointer"
                title="Guardar categoría en base de datos"
              >
                <Check className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setIsAddingCategory(false)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 hover:text-slate-600 transition cursor-pointer"
                title="Cancelar"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsAddingCategory(true)}
              className="inline-flex min-h-10 sm:min-h-8 items-center gap-1.5 rounded-2xl border border-dashed border-slate-300 dark:border-white/20 bg-slate-50/50 dark:bg-slate-800/50 px-3.5 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:border-primary hover:text-primary transition shrink-0 cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Nueva Categoría</span>
            </button>
          )}
        </div>

        <div className="relative w-full shrink-0 lg:w-44">
          <Search className="pointer-events-none absolute z-10 left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar servicio..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="min-h-11 sm:min-h-0 w-full rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900 py-2 pl-9 pr-3 text-base text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-primary focus:outline-none sm:text-xs"
          />
        </div>
      </div>

      {/* Services Grid */}
      {filteredServices.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center rounded-3xl border border-dashed border-slate-300 dark:border-white/10 bg-white/50 dark:bg-slate-900/50">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-3">
            <Scissors className="h-6 w-6" />
          </div>
          <h3 className="font-semibold text-slate-900 dark:text-white text-base">
            {services.length === 0 ? "No tenés servicios todavía" : "No hay servicios en esta categoría"}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
            {services.length === 0
              ? "Cargá los servicios que ofrece tu local para que tus clientes puedan reservar turnos online."
              : "Probá cambiando el filtro o limpiá el buscador para ver más opciones."}
          </p>
          <button
            type="button"
            onClick={handleOpenCreateService}
            className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-2.5 text-xs font-semibold text-white shadow-xs hover:opacity-95 transition-all duration-150 ease-out active:scale-[0.98] cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Crear primer servicio</span>
          </button>
        </div>
      ) : (
        <>
          {/* Mobile Apple Inset Grouped Services List */}
          <div className="block sm:hidden space-y-3">
            <div className="rounded-3xl glass-panel divide-y divide-white/10 overflow-hidden shadow-xs">
              {filteredServices.map((item, index) => {
                const isVisible = item.active !== false;
                const hasActivePromo = item.hasPromo && item.promoPrice;
                const currentPrice = hasActivePromo ? item.promoPrice! : item.price;
                return (
                  <div key={item.id} data-tour={index === 0 ? "servicios-card" : undefined} className="p-3.5 space-y-2.5">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Apple Squircle Icon with Brand Accent */}
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary font-semibold">
                          <Scissors className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                              {item.category || "General"}
                            </span>
                            {item.hasPromo && (
                              <span className="text-[11px] font-semibold px-1.5 py-0.2 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20">
                                PROMO
                              </span>
                            )}
                          </div>
                          <h4 className="font-semibold text-slate-900 dark:text-white text-xs truncate">
                            {item.name}
                          </h4>
                          <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3 text-primary" />
                              {item.durationMin} min
                            </span>
                            <span>•</span>
                            <span className="tabular-nums font-semibold text-slate-900 dark:text-white">
                              {formatGs(currentPrice)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Compact visibility control */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          role="switch"
                          aria-checked={isVisible}
                          aria-label={isVisible ? "Ocultar servicio en la web" : "Mostrar servicio en la web"}
                          onClick={() => {
                            triggerHaptic("selection");
                            handleToggleVisibility(item);
                          }}
                          className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-950 ${
                            isVisible
                              ? "border-emerald-500/25 bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/25 dark:text-emerald-400"
                              : "border-slate-200 bg-slate-100 text-slate-500 hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
                          }`}
                          title={isVisible ? "Servicio visible" : "Servicio pausado"}
                        >
                          {isVisible ? (
                            <Eye className="h-4 w-4" aria-hidden="true" />
                          ) : (
                            <EyeOff className="h-4 w-4" aria-hidden="true" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Mobile Action Footer */}
                    <div className="flex items-center justify-between pt-1 border-t border-slate-100/70 dark:border-slate-800/60 text-xs">
                      <button
                        type="button"
                        onClick={() => {
                          triggerHaptic("light");
                          handleOpenPromoModal(item);
                        }}
                        data-tour={index === 0 ? "servicios-promo-btn" : undefined}
                        className={`inline-flex min-h-10 items-center gap-1.5 rounded-xl border px-3 text-[11px] font-semibold transition-all duration-150 ease-out active:scale-[0.98] cursor-pointer ${
                          item.hasPromo
                            ? "border-amber-500/40 bg-amber-500/15 text-amber-700 hover:bg-amber-500/20 dark:text-amber-300"
                            : "border-amber-500/30 bg-amber-500/10 text-amber-700 hover:border-amber-500/50 hover:bg-amber-500/15 dark:text-amber-300"
                        }`}
                      >
                        {item.hasPromo ? <Flame className="h-3.5 w-3.5 fill-current" /> : <BadgePercent className="h-3.5 w-3.5" />}
                        <span>{item.hasPromo ? "Editar Promo" : "+ Promo Flash"}</span>
                      </button>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            triggerHaptic("light");
                            handleCopyServiceLink(item.id, item.name);
                          }}
                          data-tour={index === 0 ? "servicios-share-btn" : undefined}
                          aria-label="Copiar enlace del servicio"
                          className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-primary transition cursor-pointer"
                          title="Copiar link"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            triggerHaptic("selection");
                            handleOpenEditService(item);
                          }}
                          aria-label="Editar servicio"
                          className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-primary transition cursor-pointer"
                          title="Editar servicio"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            triggerHaptic("light");
                            setDeleteTarget({ id: item.id, name: item.name });
                          }}
                          aria-label="Eliminar servicio"
                          className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 dark:bg-rose-950/30 text-rose-600 hover:bg-rose-100 transition cursor-pointer"
                          title="Eliminar servicio"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Desktop Grid View */}
          <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredServices.map((item, index) => {
            const isVisible = item.active !== false;
            const hasActivePromo = item.hasPromo && item.promoPrice;
            const currentPrice = hasActivePromo ? item.promoPrice! : item.price;
            const isCopied = copiedId === item.id;

            // Find staff assigned to this service
            const assignedStaff = activeStaff.filter(
              (st) => !item.staffIds || item.staffIds.length === 0 || item.staffIds.includes(st.id)
            );

            return (
              <GlassTiltCard
                key={item.id}
                data-tour={index === 0 ? "servicios-card" : undefined}
                variant={isVisible ? "glass" : "subtle"}
                maxTilt={3.5}
                className={`group flex flex-col justify-between rounded-3xl p-5 shadow-xs transition-all duration-300 ${
                  isVisible
                    ? "hover:shadow-md hover:border-primary/40"
                    : "opacity-70"
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="rounded-full glass-panel-subtle px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-slate-600 dark:text-zinc-300 border border-white/5">
                        {item.category || "General"}
                      </span>

                      {/* Compact visibility control */}
                      <button
                        type="button"
                        role="switch"
                        aria-checked={isVisible}
                        aria-label="Visibilidad del servicio"
                        onClick={() => handleToggleVisibility(item)}
                        title={isVisible ? "Servicio visible" : "Servicio pausado"}
                        className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-950 ${
                          isVisible
                            ? "border-emerald-500/25 bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/25 dark:text-emerald-400"
                            : "border-slate-200 bg-slate-100 text-slate-500 hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
                        }`}
                      >
                        {isVisible ? (
                          <Eye className="h-4 w-4" aria-hidden="true" />
                        ) : (
                          <EyeOff className="h-4 w-4" aria-hidden="true" />
                        )}
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5 text-slate-500 text-xs font-semibold">
                      <Clock className="h-3.5 w-3.5 text-primary" />
                      <span>{item.durationMin} min</span>
                    </div>
                  </div>

                  <h3 className="mt-3 font-semibold text-slate-900 dark:text-white text-base group-hover:text-primary transition">
                    {item.name}
                  </h3>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {item.description || "Servicio estándar de atención en el local."}
                  </p>

                  {/* Price Section */}
                  <div className="mt-4 flex items-baseline gap-2">
                    <span className="tabular-nums font-bold text-xl text-slate-900 dark:text-white">
                      {formatGs(currentPrice)}
                    </span>
                    {hasActivePromo && (
                      <span className="text-xs text-slate-400 line-through tabular-nums">
                        {formatGs(item.price)}
                      </span>
                    )}
                  </div>

                  {/* Assigned Staff Preview */}
                  <div className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                    <Users className="h-3 w-3 text-slate-400" />
                    <span className="truncate">
                      {assignedStaff.length === activeStaff.length
                        ? "Todo el equipo"
                        : `${assignedStaff.length} especialistas asignados`}
                    </span>
                  </div>

                  {/* Promo Flash Attributes Badges */}
                  {hasActivePromo && (
                    <div className="mt-2.5 flex flex-wrap gap-1.5">
                      {(item.promoType === "time" || item.promoType === "both" || !item.promoType) && (
                        <span className="inline-flex items-center gap-1 rounded-lg bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 text-[11px] font-semibold text-amber-700 dark:text-amber-300">
                          <Clock className="h-2.5 w-2.5 text-amber-500" />
                          <span>Cronómetro {item.promoLimitHours || 24}h</span>
                        </span>
                      )}
                      {(item.promoType === "quantity" || item.promoType === "both") && (
                        <span className="inline-flex items-center gap-1 rounded-lg bg-orange-500/10 border border-orange-500/20 px-2 py-0.5 text-[11px] font-semibold text-orange-700 dark:text-orange-300">
                          <Flame className="h-2.5 w-2.5 text-orange-500 fill-orange-500" />
                          <span>{item.promoLimitQuantity || 5} cupos</span>
                        </span>
                      )}
                      {item.requirePrepayment && (
                        <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
                          <CreditCard className="h-2.5 w-2.5 text-emerald-500" />
                          <span>
                            {item.prepaymentType === "full"
                              ? "Pago 100% anticipado"
                              : `Seña: ${formatGs(item.prepaymentAmount || Math.round((item.promoPrice || item.price) * 0.5))}`}{" "}
                            ({item.prepaymentMethod === "qr" ? "QR" : "Transferencia"})
                          </span>
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="mt-4 space-y-2.5 pt-3.5 border-t border-slate-100 dark:border-white/5">
                  {/* Standalone Promo Flash Button */}
                  <button
                    type="button"
                    data-tour={index === 0 ? "servicios-promo-btn" : undefined}
                    onClick={() => handleOpenPromoModal(item)}
                    className={`w-full flex items-center justify-between rounded-xl py-1.5 px-3 text-xs font-semibold transition cursor-pointer ${
                      item.hasPromo
                        ? "border border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300 hover:bg-amber-500/20"
                        : "border border-slate-200/80 dark:border-white/10 bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:text-amber-600 hover:border-amber-400/40"
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      {item.hasPromo ? (
                        <Flame className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                      ) : (
                        <BadgePercent className="h-3.5 w-3.5 text-slate-400" />
                      )}
                      <span>
                        {item.hasPromo
                          ? `Promo activa: ${item.promoBadge || "-20% OFF"}`
                          : "Activar promo flash"}
                      </span>
                    </span>
                    <span className="text-[11px] opacity-75 font-semibold">
                      {item.hasPromo ? "Modificar" : "Configurar"}
                    </span>
                  </button>

                  {/* Actions Row */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      data-tour={index === 0 ? "servicios-share-btn" : undefined}
                      onClick={() => handleCopyServiceLink(item.id, item.name)}
                      className={`flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border py-2 px-3 text-xs font-semibold transition cursor-pointer ${
                        isCopied
                          ? "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                          : "border-slate-200/80 dark:border-white/10 bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 hover:bg-primary hover:text-white hover:border-primary"
                      }`}
                    >
                      {isCopied ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-emerald-500" />
                          <span>¡Enlace copiado!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" />
                          <span>Copiar Link</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenEditService(item)}
                      className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200/80 dark:border-white/10 bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 hover:text-primary hover:border-primary/50 transition cursor-pointer"
                      title="Editar datos del servicio"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeleteTarget({ id: item.id, name: item.name })}
                      className="flex h-9 w-9 items-center justify-center rounded-xl border border-rose-200/60 dark:border-rose-900/40 bg-rose-50/50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/50 transition cursor-pointer"
                      title="Eliminar servicio"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </GlassTiltCard>
            );
          })}
          </div>
        </>
      )}

      {/* Modal 1: Service Create / Edit (Clean, Zero Promo Clutter) */}
      <Modal
        open={serviceModalOpen}
        onClose={() => setServiceModalOpen(false)}
        title={editingService ? "Editar Servicio" : "Nuevo Servicio en Catálogo"}
        maxWidth="max-w-2xl"
        className="service-mobile-sheet"
        footerClassName="service-modal-footer"
        footer={
          <div className="grid grid-cols-2 gap-2 sm:flex sm:justify-end">
            <button
              type="button"
              onClick={() => setServiceModalOpen(false)}
              className="min-h-11 rounded-2xl border border-slate-200/80 px-4 py-2.5 font-semibold text-slate-600 transition hover:bg-slate-100 dark:border-white/10 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Cancelar
            </button>
            <button
              type="submit"
              form="service-catalog-form"
              disabled={isSavingService || isUploadingServiceCover}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-2.5 font-semibold text-white shadow-md transition hover:opacity-95 disabled:cursor-wait disabled:opacity-60"
            >
              {isSavingService ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {isSavingService ? "Guardando…" : editingService ? "Guardar Cambios" : "Crear Servicio"}
            </button>
          </div>
        }
      >
        <form id="service-catalog-form" onSubmit={handleSaveService} className="service-mobile-form space-y-4 text-xs">
          <input
            ref={serviceCoverInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            aria-label="Elegir imagen de portada"
            onChange={(event) => {
              const file = event.currentTarget.files?.[0] || null;
              void handleUploadServiceCover(file);
              event.currentTarget.value = "";
            }}
          />

          {/* Service Name & Visibility Switch */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex-1">
              <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">
                Nombre del Servicio *
              </label>
              <input
                type="text"
                required
                placeholder="Ej: Corte Fade Clásico + Barba"
                value={serviceForm.name}
                onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })}
                className="min-h-11 sm:min-h-0 w-full rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-base text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-primary focus:outline-none sm:text-xs"
              />
            </div>

            {/* Compact visibility control */}
            <div className="flex items-center gap-2 pt-1 sm:pt-4">
              <button
                type="button"
                role="switch"
                aria-checked={serviceForm.active}
                aria-label="Visibilidad del servicio"
                onClick={() => setServiceForm({ ...serviceForm, active: !serviceForm.active })}
                className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-950 ${
                  serviceForm.active
                    ? "border-emerald-500/25 bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/25 dark:text-emerald-400"
                    : "border-slate-200 bg-slate-100 text-slate-500 hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
                }`}
                title={serviceForm.active ? "Visible online" : "Oculto"}
              >
                {serviceForm.active ? (
                  <Eye className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <EyeOff className="h-4 w-4" aria-hidden="true" />
                )}
              </button>
              <span className="font-semibold text-[11px] text-slate-700 dark:text-slate-300">
                {serviceForm.active ? "Visible Online" : "Oculto"}
              </span>
            </div>
          </div>

          {/* Category Custom Selector */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-semibold text-slate-700 dark:text-slate-200">
                Categoría del Servicio
              </label>
              <button
                type="button"
                onClick={() => setIsAddingCategory(!isAddingCategory)}
                className="text-[11px] font-semibold text-primary hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Plus className="h-3 w-3" />
                <span>Nueva Categoría</span>
              </button>
            </div>

            {/* Category Chips Custom Selector */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {allCategories.map((cat) => {
                const isSelected = serviceForm.category === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setServiceForm({ ...serviceForm, category: cat })}
                    className={`inline-flex min-h-10 sm:min-h-0 items-center rounded-xl border px-3 py-2 text-xs font-semibold transition cursor-pointer ${
                      isSelected
                        ? "border-primary bg-primary text-white shadow-xs"
                        : "border-slate-200/80 dark:border-white/10 bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:border-slate-400"
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>

            {/* Quick add inline in modal */}
            {isAddingCategory && (
              <div className="mt-2 flex items-center gap-2 p-2 rounded-2xl bg-primary/5 border border-primary/20">
                <input
                  type="text"
                  placeholder="Nombre de la nueva categoría..."
                  value={newCategoryInput}
                  onChange={(e) => setNewCategoryInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleCreateCategory();
                    }
                  }}
                  className="flex-1 rounded-xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:border-primary focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleCreateCategory}
                  className="rounded-xl bg-primary px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:opacity-95 cursor-pointer"
                >
                  Agregar categoría
                </button>
              </div>
            )}
          </div>

          {/* Duration & Base Price with Custom Steppers */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Custom Duration Selector */}
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
                Duración del Turno ({serviceForm.durationMin} min)
              </label>
              <div className="grid grid-cols-3 gap-1.5 mb-2">
                {PRESET_DURATIONS.map((dur) => (
                  <button
                    key={dur}
                    type="button"
                    onClick={() => setServiceForm({ ...serviceForm, durationMin: dur })}
                    className={`min-h-10 sm:min-h-0 rounded-xl border px-1 py-1.5 text-xs font-semibold transition cursor-pointer ${
                      serviceForm.durationMin === dur
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:border-slate-300"
                    }`}
                  >
                    {dur} min
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setServiceForm({
                      ...serviceForm,
                      durationMin: Math.max(5, serviceForm.durationMin - 5),
                    })
                  }
                  aria-label="Reducir duración 5 minutos"
                  className="h-10 w-10 sm:h-8 sm:w-8 shrink-0 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800 font-semibold text-slate-700 dark:text-slate-200 transition active:scale-[0.98] cursor-pointer"
                >
                  -5
                </button>
                <div className="flex-1 text-center tabular-nums font-semibold text-xs bg-slate-100 dark:bg-slate-800 py-1.5 rounded-xl">
                  {serviceForm.durationMin} minutos
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setServiceForm({
                      ...serviceForm,
                      durationMin: serviceForm.durationMin + 5,
                    })
                  }
                  aria-label="Aumentar duración 5 minutos"
                  className="h-10 w-10 sm:h-8 sm:w-8 shrink-0 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800 font-semibold text-slate-700 dark:text-slate-200 transition active:scale-[0.98] cursor-pointer"
                >
                  +5
                </button>
              </div>
            </div>

            {/* Base Price Input with helper pills */}
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
                Precio Estándar (Gs.) *
              </label>
              <div className="relative mb-2">
                <input
                  type="number"
                  min="0"
                  step="5000"
                  required
                  value={serviceForm.price}
                  onChange={(e) => setServiceForm({ ...serviceForm, price: Math.max(0, Number(e.target.value)) })}
                  className="w-full rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900 px-3.5 py-2 text-slate-900 dark:text-white tabular-nums font-semibold text-base focus:border-primary focus:outline-none"
                />
              </div>
              <div className="flex items-center gap-1.5">
                {[50000, 80000, 100000, 150000].map((quick) => (
                  <button
                    key={quick}
                    type="button"
                    onClick={() => setServiceForm({ ...serviceForm, price: quick })}
                    className="min-h-10 sm:min-h-0 flex-1 rounded-xl border border-slate-200/60 dark:border-white/10 py-1 text-[11px] font-semibold text-slate-500 hover:text-primary hover:border-primary transition cursor-pointer"
                  >
                    {quick / 1000}k
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Optional public service cover */}
          <div className="rounded-2xl border border-slate-200/80 bg-white/60 p-3 dark:border-white/10 dark:bg-white/[0.03]">
            <div className="mb-2 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-semibold text-slate-800 dark:text-slate-100">Portada del servicio <span className="font-medium text-slate-400">(opcional)</span></p>
                <p className="mt-0.5 text-[11px] leading-relaxed text-slate-500">Se muestra al elegir el servicio en tu página de reservas.</p>
              </div>
              {serviceForm.imageUrl && (
                <button
                  type="button"
                  onClick={() => setServiceForm((current) => ({ ...current, imageUrl: "" }))}
                  className="shrink-0 rounded-lg px-2 py-1 text-[11px] font-semibold text-slate-500 hover:bg-slate-100 hover:text-rose-600 dark:hover:bg-white/10"
                >
                  Quitar
                </button>
              )}
            </div>
            <div className="flex items-center gap-3">
              {serviceForm.imageUrl ? (
                <img
                  src={serviceForm.imageUrl}
                  alt={serviceForm.name ? `Portada de ${serviceForm.name}` : "Portada del servicio"}
                  className="h-20 w-28 shrink-0 rounded-xl object-cover ring-1 ring-slate-200 dark:ring-white/10"
                />
              ) : (
                <div className="flex h-20 w-28 shrink-0 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-100/70 text-slate-400 dark:border-white/15 dark:bg-white/[0.04]">
                  <ImagePlus className="h-6 w-6" aria-hidden="true" />
                </div>
              )}
              <button
                type="button"
                disabled={isUploadingServiceCover}
                onClick={() => serviceCoverInputRef.current?.click()}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 transition hover:border-primary/40 hover:text-primary disabled:cursor-wait disabled:opacity-60 dark:border-white/10 dark:bg-slate-900 dark:text-slate-100"
              >
                {isUploadingServiceCover ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
                {isUploadingServiceCover ? "Optimizando…" : serviceForm.imageUrl ? "Cambiar imagen" : "Subir imagen"}
              </button>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">
              Descripción o Detalle (opcional)
            </label>
            <textarea
              rows={2}
              placeholder="Detallá qué incluye el servicio para tus clientes..."
              value={serviceForm.description}
              onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
              className="min-h-[88px] sm:min-h-0 w-full rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900 px-3.5 py-2 text-base text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-primary focus:outline-none sm:text-xs"
            />
          </div>

          {/* Staff Assignment: Multi-select */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-semibold text-slate-700 dark:text-slate-200">
                ¿Quiénes realizan este servicio?
              </label>
              <button
                type="button"
                onClick={handleSelectAllStaff}
                className="text-[11px] font-semibold text-primary hover:underline cursor-pointer"
              >
                Seleccionar todos
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {activeStaff.map((st) => {
                const isAssigned = serviceForm.staffIds.includes(st.id);
                return (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => handleToggleStaff(st.id)}
                    className={`min-h-11 sm:min-h-0 flex items-center gap-2 p-2 rounded-2xl border text-left transition cursor-pointer ${
                      isAssigned
                        ? "border-primary bg-primary/10 text-primary font-semibold shadow-xs"
                        : "border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 opacity-60"
                    }`}
                  >
                    <div
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold ${
                        isAssigned
                          ? "bg-primary text-white"
                          : "bg-slate-200 dark:bg-slate-800 text-slate-600"
                      }`}
                    >
                      {isAssigned ? <Check className="h-3.5 w-3.5" /> : st.name.slice(0, 1)}
                    </div>
                    <span className="truncate text-xs">{st.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

        </form>
      </Modal>

      {/* Modal 2: Dedicated Standalone Promo Flash Modal */}
      {promoModalService && (
        <Modal
          open={!!promoModalService}
          onClose={() => setPromoModalService(null)}
          title="Promoción Flash"
          maxWidth="max-w-2xl"
          className="service-mobile-sheet"
          footerClassName="service-modal-footer"
          footer={
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              {promoModalService.hasPromo && (
                <button
                  type="button"
                  onClick={handleRemovePromo}
                  className="min-h-10 rounded-xl px-3 text-xs font-semibold text-rose-600 transition hover:bg-rose-500/10 dark:text-rose-300"
                >
                  Quitar Promoción
                </button>
              )}
              <div className="grid w-full grid-cols-2 gap-2 sm:ml-auto sm:w-auto sm:flex sm:items-center">
                <button
                  type="button"
                  onClick={() => setPromoModalService(null)}
                  className="min-h-11 rounded-2xl border border-slate-200/80 px-4 py-2 font-semibold text-slate-600 transition hover:bg-slate-100 dark:border-white/10 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  form="service-promo-form"
                  className="min-h-11 rounded-2xl bg-amber-500 px-3 py-2 font-semibold text-white shadow-md transition hover:bg-amber-600 sm:px-5"
                >
                  Guardar Promoción
                </button>
              </div>
            </div>
          }
        >
          <form id="service-promo-form" onSubmit={handleSavePromo} className="service-mobile-form space-y-4 text-xs">
            {/* Promo Header & Switch */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500 text-white font-semibold">
                  <Flame className="h-4 w-4 fill-white" />
                </div>
                <div>
                  <span className="font-semibold text-xs text-slate-900 dark:text-white block">
                    {promoModalService.name}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Precio estándar: <strong className="text-slate-700 dark:text-slate-300 tabular-nums">{formatGs(promoModalService.price)}</strong>
                  </span>
                </div>
              </div>

              {/* Custom Switch for Promo */}
              <button
                type="button"
                role="switch"
                aria-checked={promoForm.hasPromo}
                aria-label="Activar promoción"
                onClick={() => setPromoForm({ ...promoForm, hasPromo: !promoForm.hasPromo })}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-950 ${
                  promoForm.hasPromo ? "bg-amber-500" : "bg-slate-300 dark:bg-slate-700"
                }`}
              >
                <span
                  className={`pointer-events-none absolute left-1 top-1 h-4 w-4 rounded-full bg-[#ffffff] shadow-[0_1px_3px_rgba(0,0,0,0.28)] transition-transform duration-200 ease-in-out ${
                    promoForm.hasPromo ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {promoForm.hasPromo && (
              <div className="space-y-4 pt-1">
                {/* Dual Inputs: % vs Monto sync */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">
                      Porcentaje de Descuento (%)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="1"
                        max="99"
                        value={promoForm.promoPercent}
                        onChange={(e) => handlePromoPercentChange(Number(e.target.value))}
                        className="w-full rounded-2xl border border-amber-500/40 bg-white dark:bg-slate-900 py-2 pl-3 pr-8 text-xs tabular-nums font-semibold text-slate-900 dark:text-white focus:border-amber-500 focus:outline-none"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 font-semibold text-amber-600">
                        %
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] text-slate-400">
                      Calcula el monto final automáticamente.
                    </p>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">
                      Precio Promocional (Gs.)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="1000"
                      value={promoForm.promoPrice}
                      onChange={(e) => handlePromoPriceChange(Number(e.target.value))}
                      className="w-full rounded-2xl border border-amber-500/40 bg-white dark:bg-slate-900 py-2 px-3 text-xs tabular-nums font-semibold text-slate-900 dark:text-white focus:border-amber-500 focus:outline-none"
                    />
                    <p className="mt-1 text-[11px] text-slate-400">
                      Calcula el % de descuento automáticamente.
                    </p>
                  </div>
                </div>

                {/* Badge Style Selector */}
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
                    ¿Cómo mostrar el descuento en tu portal?
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handlePromoDisplayTypeChange("percentage")}
                      className={`p-2.5 rounded-2xl border text-center transition cursor-pointer ${
                        promoForm.promoDisplayType === "percentage"
                          ? "border-amber-500 bg-amber-500/20 text-amber-800 dark:text-amber-200 font-semibold"
                          : "border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300"
                      }`}
                    >
                      <span className="block text-xs font-semibold">Mostrar Porcentaje</span>
                      <span className="text-[11px] opacity-75">
                        Ej: -{promoForm.promoPercent}% OFF
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handlePromoDisplayTypeChange("amount")}
                      className={`p-2.5 rounded-2xl border text-center transition cursor-pointer ${
                        promoForm.promoDisplayType === "amount"
                          ? "border-amber-500 bg-amber-500/20 text-amber-800 dark:text-amber-200 font-semibold"
                          : "border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300"
                      }`}
                    >
                      <span className="block text-xs font-semibold">Mostrar Monto Ahorrado</span>
                      <span className="text-[11px] opacity-75">
                        Ej: Ahorrá {formatGs(Math.max(0, promoModalService.price - promoForm.promoPrice))}
                      </span>
                    </button>
                  </div>
                </div>

                {/* 2. Modalidad de Urgencia & Límite (Cronómetro / Cupos) */}
                <div className="pt-2 border-t border-slate-100 dark:border-white/5 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="block font-semibold text-slate-700 dark:text-slate-200">
                      Regla de Urgencia para Agendar
                    </label>
                    <span className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold">
                      Incentiva reserva inmediata
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setPromoForm({ ...promoForm, promoType: "time" })}
                      className={`p-2.5 rounded-2xl border text-center transition cursor-pointer ${
                        promoForm.promoType === "time"
                          ? "border-amber-500 bg-amber-500/20 text-amber-800 dark:text-amber-200 font-semibold shadow-xs"
                          : "border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      <Timer className="h-4 w-4 mx-auto mb-1 text-amber-500" />
                      <span className="block text-[11px] font-semibold leading-tight">Cronómetro</span>
                      <span className="text-[11px] opacity-75">Tiempo límite</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPromoForm({ ...promoForm, promoType: "quantity" })}
                      className={`p-2.5 rounded-2xl border text-center transition cursor-pointer ${
                        promoForm.promoType === "quantity"
                          ? "border-orange-500 bg-orange-500/20 text-orange-800 dark:text-orange-200 font-semibold shadow-xs"
                          : "border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      <Flame className="h-4 w-4 mx-auto mb-1 text-orange-500" />
                      <span className="block text-[11px] font-semibold leading-tight">Por Cupos</span>
                      <span className="text-[11px] opacity-75">Cantidad fija</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPromoForm({ ...promoForm, promoType: "both" })}
                      className={`p-2.5 rounded-2xl border text-center transition cursor-pointer ${
                        promoForm.promoType === "both"
                          ? "border-indigo-500 bg-indigo-500/20 text-indigo-800 dark:text-indigo-200 font-semibold shadow-xs"
                          : "border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      <Hourglass className="h-4 w-4 mx-auto mb-1 text-indigo-500" />
                      <span className="block text-[11px] font-semibold leading-tight">Ambos</span>
                      <span className="text-[11px] opacity-75">Tiempo + Cupos</span>
                    </button>
                  </div>

                  {/* Configuración de Horas si tiene Cronómetro */}
                  {(promoForm.promoType === "time" || promoForm.promoType === "both") && (
                    <div className="p-3 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/30 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 text-amber-600" />
                          <span>Duración del Cronómetro Regresivo:</span>
                        </span>
                        <span className="tabular-nums font-semibold text-amber-700 dark:text-amber-300">
                          {promoForm.promoLimitHours} horas
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {[6, 12, 24, 48, 72].map((hours) => (
                          <button
                            key={hours}
                            type="button"
                            onClick={() => setPromoForm({ ...promoForm, promoLimitHours: hours })}
                            className={`flex-1 py-1 px-2 rounded-xl text-[11px] font-semibold transition cursor-pointer ${
                              promoForm.promoLimitHours === hours
                                ? "bg-amber-500 text-white shadow-xs"
                                : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-100"
                            }`}
                          >
                            {hours}h
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Configuración de Cupos si es Por Cupos o Ambos */}
                  {(promoForm.promoType === "quantity" || promoForm.promoType === "both") && (
                    <div className="p-3 rounded-2xl bg-orange-50/60 dark:bg-orange-950/20 border border-orange-200/60 dark:border-orange-900/30 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                          <Flame className="h-3.5 w-3.5 text-orange-500 fill-orange-500" />
                          <span>Cupos Disponibles para esta Promo:</span>
                        </span>
                        <span className="tabular-nums font-semibold text-orange-700 dark:text-orange-300">
                          {promoForm.promoLimitQuantity} cupos
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {[3, 5, 10, 15, 20].map((qty) => (
                          <button
                            key={qty}
                            type="button"
                            onClick={() => setPromoForm({ ...promoForm, promoLimitQuantity: qty })}
                            className={`flex-1 py-1 px-2 rounded-xl text-[11px] font-semibold transition cursor-pointer ${
                              promoForm.promoLimitQuantity === qty
                                ? "bg-orange-500 text-white shadow-xs"
                                : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-100"
                            }`}
                          >
                            {qty}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* 3. Seña y Pago Anticipado (Transferencia) */}
                <div className="pt-2 border-t border-slate-100 dark:border-white/5 space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-600 text-white font-semibold">
                        <CreditCard className="h-4 w-4" />
                      </div>
                      <div>
                        <span className="font-semibold text-xs text-slate-900 dark:text-white block">
                          Exigir Seña o Pago por Transferencia
                        </span>
                        <span className="text-[11px] text-slate-500">
                          Garantizá asistencia y congelá el precio con seña o transferencia previa.
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      role="switch"
                      aria-checked={promoForm.requirePrepayment}
                      aria-label="Requerir seña o pago previo"
                      onClick={() =>
                        setPromoForm({
                          ...promoForm,
                          requirePrepayment: !promoForm.requirePrepayment,
                        })
                      }
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-950 ${
                        promoForm.requirePrepayment
                          ? "bg-emerald-600"
                          : "bg-slate-300 dark:bg-slate-700"
                      }`}
                    >
                      <span
                        className={`pointer-events-none absolute left-1 top-1 h-4 w-4 rounded-full bg-[#ffffff] shadow-[0_1px_3px_rgba(0,0,0,0.28)] transition-transform duration-200 ease-in-out ${
                          promoForm.requirePrepayment ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>

                  {promoForm.requirePrepayment && (
                    <div className="space-y-3 p-3.5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/30">
                      {/* Modalidad de seña */}
                      <div>
                        <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
                          Tipo de Pago Previo Requerido
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              setPromoForm({ ...promoForm, prepaymentType: "deposit" })
                            }
                            className={`p-2.5 rounded-2xl border text-center transition cursor-pointer ${
                              promoForm.prepaymentType === "deposit"
                                ? "border-emerald-500 bg-emerald-500/20 text-emerald-800 dark:text-emerald-200 font-semibold"
                                : "border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300"
                            }`}
                          >
                            <span className="block text-xs font-semibold">Seña Parcial</span>
                            <span className="text-[11px] opacity-75">
                              Monto fijo de reserva
                            </span>
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              setPromoForm({ ...promoForm, prepaymentType: "full" })
                            }
                            className={`p-2.5 rounded-2xl border text-center transition cursor-pointer ${
                              promoForm.prepaymentType === "full"
                                ? "border-emerald-500 bg-emerald-500/20 text-emerald-800 dark:text-emerald-200 font-semibold"
                                : "border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300"
                            }`}
                          >
                            <span className="block text-xs font-semibold">Pago 100% Total</span>
                            <span className="text-[11px] opacity-75">
                              {formatGs(promoForm.promoPrice)}
                            </span>
                          </button>
                        </div>
                      </div>

                      {/* Monto de seña si es parcial */}
                      {promoForm.prepaymentType === "deposit" && (
                        <div>
                          <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">
                            Monto de la Seña Requerida (Gs.)
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min="5000"
                              step="5000"
                              value={promoForm.prepaymentAmount}
                              onChange={(e) =>
                                setPromoForm({
                                  ...promoForm,
                                  prepaymentAmount: Number(e.target.value),
                                })
                              }
                              className="w-full rounded-2xl border border-emerald-500/40 bg-white dark:bg-slate-900 py-2 px-3 text-xs tabular-nums font-semibold text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none"
                            />
                            <div className="flex items-center gap-1 shrink-0">
                              {[20000, 30000, 50000].map((preset) => (
                                <button
                                  key={preset}
                                  type="button"
                                  onClick={() =>
                                    setPromoForm({ ...promoForm, prepaymentAmount: preset })
                                  }
                                  className={`py-1.5 px-2 rounded-xl text-[11px] font-semibold border transition cursor-pointer ${
                                    promoForm.prepaymentAmount === preset
                                      ? "bg-emerald-600 text-white border-emerald-600"
                                      : "bg-white dark:bg-slate-900 border-slate-200 text-slate-600 dark:text-slate-300"
                                  }`}
                                >
                                  {preset / 1000}k
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Canal de pago preferido */}
                      <div>
                        <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
                          Medio de Pago Aceptado
                        </label>
                        <div className="grid grid-cols-3 gap-2 text-center">
                          <button
                            type="button"
                            onClick={() =>
                              setPromoForm({ ...promoForm, prepaymentMethod: "transferencia" })
                            }
                            className={`p-2 rounded-xl border text-[11px] font-semibold transition cursor-pointer ${
                              promoForm.prepaymentMethod === "transferencia" || promoForm.prepaymentMethod === "sipap"
                                ? "border-emerald-600 bg-emerald-600 text-white shadow-xs"
                                : "border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300"
                            }`}
                          >
                            <Building2 className="h-3.5 w-3.5 mx-auto mb-0.5" />
                            <span>Transferencia bancaria</span>
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              setPromoForm({ ...promoForm, prepaymentMethod: "qr" })
                            }
                            className={`p-2 rounded-xl border text-[11px] font-semibold transition cursor-pointer ${
                              promoForm.prepaymentMethod === "qr"
                                ? "border-emerald-600 bg-emerald-600 text-white shadow-xs"
                                : "border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300"
                            }`}
                          >
                            <Coins className="h-3.5 w-3.5 mx-auto mb-0.5" />
                            <span>QR / Billeteras</span>
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              setPromoForm({ ...promoForm, prepaymentMethod: "cualquiera" })
                            }
                            className={`p-2 rounded-xl border text-[11px] font-semibold transition cursor-pointer ${
                              promoForm.prepaymentMethod === "cualquiera"
                                ? "border-emerald-600 bg-emerald-600 text-white shadow-xs"
                                : "border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300"
                            }`}
                          >
                            <CreditCard className="h-3.5 w-3.5 mx-auto mb-0.5" />
                            <span>Cualquiera</span>
                          </button>
                        </div>
                      </div>

                      {/* Instrucción breve */}
                      <div>
                        <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">
                          Instrucción para el Cliente
                        </label>
                        <input
                          type="text"
                          value={promoForm.prepaymentInstructions}
                          onChange={(e) =>
                            setPromoForm({
                              ...promoForm,
                              prepaymentInstructions: e.target.value,
                            })
                          }
                          placeholder="Ej: Enviar comprobante al WhatsApp dentro de 30 min."
                          className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 py-1.5 px-3 text-xs text-slate-800 dark:text-white focus:border-emerald-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* LIVE PREVIEW DEMO CARD */}
                <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-amber-500/30 shadow-xs space-y-2.5">
                  <div className="flex items-center justify-between text-[11px] uppercase font-semibold text-slate-400">
                    <span>Vista previa en vivo para el cliente:</span>
                    <span className="text-amber-500 font-semibold">DEMO EN RESERVA</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-sm text-slate-900 dark:text-white">
                        {promoModalService.name}
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {promoModalService.durationMin} minutos · {promoModalService.category || "General"}
                      </p>
                    </div>

                    <div className="text-right">
                      <div className="flex items-center gap-1.5 justify-end">
                        <span className="text-xs text-slate-400 line-through tabular-nums">
                          {formatGs(promoModalService.price)}
                        </span>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-[11px] font-semibold text-amber-700 dark:text-amber-300">
                          <Flame className="h-3 w-3 fill-amber-500 text-amber-500" />
                          {promoForm.promoBadge}
                        </span>
                      </div>
                      <div className="tabular-nums font-bold text-lg text-emerald-600 dark:text-emerald-400 mt-0.5">
                        {formatGs(promoForm.promoPrice)}
                      </div>
                    </div>
                  </div>

                  {/* Urgency indicators in preview */}
                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-white/5">
                    {(promoForm.promoType === "time" || promoForm.promoType === "both") && (
                      <div className="flex items-center gap-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300/60 dark:border-amber-700/40 px-2.5 py-1 text-[11px] font-semibold text-amber-800 dark:text-amber-200">
                        <Timer className="h-3.5 w-3.5 text-amber-600 animate-pulse" />
                        <span>Termina en: <strong>{promoForm.promoLimitHours}h 00m</strong></span>
                      </div>
                    )}

                    {(promoForm.promoType === "quantity" || promoForm.promoType === "both") && (
                      <div className="flex items-center gap-1.5 rounded-xl bg-orange-50 dark:bg-orange-950/40 border border-orange-300/60 dark:border-orange-700/40 px-2.5 py-1 text-[11px] font-semibold text-orange-800 dark:text-orange-200">
                        <Flame className="h-3.5 w-3.5 text-orange-500 fill-orange-500" />
                        <span>¡Solo quedan <strong>{promoForm.promoLimitQuantity} cupos</strong>!</span>
                      </div>
                    )}

                    {promoForm.requirePrepayment && (
                      <div className="flex items-center gap-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300/60 dark:border-emerald-700/40 px-2.5 py-1 text-[11px] font-semibold text-emerald-800 dark:text-emerald-200">
                        <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                        <span>
                          {promoForm.prepaymentType === "full"
                            ? `Pago 100% previo (${promoForm.prepaymentMethod.toUpperCase()})`
                            : `Seña previa: ${formatGs(promoForm.prepaymentAmount)} (${promoForm.prepaymentMethod.toUpperCase()})`}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

          </form>
        </Modal>
      )}

      {/* Modal 3: Custom Web Modal for Delete Service Confirmation */}
      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="¿Eliminar servicio del catálogo?"
        className="service-mobile-sheet"
      >
        <div className="space-y-4 text-xs">
          <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200/60 dark:border-rose-900/40 text-rose-800 dark:text-rose-200">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-600 text-white font-semibold">
              <Trash2 className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-sm text-slate-900 dark:text-white">
                {deleteTarget?.name}
              </p>
              <p className="text-[11px] text-rose-600 dark:text-rose-300 mt-0.5 leading-relaxed">
                Este servicio se quitará de tu menú. Los turnos agendados previamente no se verán afectados.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-white/10">
            <button
              type="button"
              onClick={() => setDeleteTarget(null)}
              className="rounded-xl border border-slate-200/80 dark:border-white/10 px-4 py-2 font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleConfirmDelete}
              className="rounded-xl bg-rose-600 hover:bg-rose-700 px-5 py-2 font-semibold text-white shadow-md transition cursor-pointer"
            >
              Eliminar definitivamente
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal 4: Custom Web Modal for Delete Category Confirmation */}
      <Modal
        open={!!categoryToDelete}
        onClose={() => setCategoryToDelete(null)}
        title="¿Eliminar categoría de servicios?"
        className="service-mobile-sheet"
      >
        <div className="space-y-4 text-xs">
          <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200/60 dark:border-rose-900/40 text-rose-800 dark:text-rose-200">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-600 text-white font-semibold">
              <Trash2 className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-sm text-slate-900 dark:text-white">
                Categoría: &quot;{categoryToDelete}&quot;
              </p>
              <p className="text-[11px] text-rose-600 dark:text-rose-300 mt-0.5 leading-relaxed">
                Esta categoría se quitará del catálogo y de la base de datos. Los servicios vinculados a ella seguirán existiendo en tu negocio.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-white/10">
            <button
              type="button"
              onClick={() => setCategoryToDelete(null)}
              className="rounded-xl border border-slate-200/80 dark:border-white/10 px-4 py-2 font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleConfirmDeleteCategory}
              className="rounded-xl bg-rose-600 hover:bg-rose-700 px-5 py-2 font-semibold text-white shadow-md transition cursor-pointer"
            >
              Eliminar Categoría
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

