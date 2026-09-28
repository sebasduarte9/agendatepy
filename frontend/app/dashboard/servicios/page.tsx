"use client";

import { useMemo, useState, useEffect } from "react";
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
  Layers,
  Eye,
  EyeOff,
  X,
  CreditCard,
  Building2,
  Hourglass,
  Timer,
  ShieldCheck,
} from "lucide-react";
import { useDashboardStore } from "@/store/useDashboardStore";
import Card from "@/components/dashboard/ui/Card";
import StatCard from "@/components/dashboard/ui/StatCard";
import Modal from "@/components/dashboard/ui/Modal";
import { formatGs } from "@/lib/dashboard-dates";
import type { ServiceItem } from "@/lib/dashboard-types";

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
  const [serviceForm, setServiceForm] = useState({
    name: "",
    category: "Peluquería",
    durationMin: 45,
    price: 80000,
    description: "",
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
    prepaymentMethod: "sipap" as "sipap" | "transferencia" | "qr" | "cualquiera",
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
  const avgPrice =
    services.length > 0
      ? Math.round(services.reduce((sum, s) => sum + s.price, 0) / services.length)
      : 0;
  const avgDuration =
    services.length > 0
      ? Math.round(services.reduce((sum, s) => sum + s.durationMin, 0) / services.length)
      : 0;

  // Handlers for Categories (Saved in PostgreSQL SQL)
  async function handleCreateCategory() {
    const trimmed = newCategoryInput.trim();
    if (!trimmed) return;
    if (allCategories.some((c) => c.toLowerCase() === trimmed.toLowerCase())) {
      pushToast("error", "Esa categoría ya existe.");
      return;
    }

    // Optimistic update
    setCustomCategories((prev) => [...prev, trimmed]);
    setServiceForm((prev) => ({ ...prev, category: trimmed }));
    setNewCategoryInput("");
    setIsAddingCategory(false);
    pushToast("success", `Categoría "${trimmed}" guardada`);

    // Persist to PostgreSQL tenant settings via SQL API
    try {
      const res = await fetch("/api/services/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed }),
      });
      const data = await res.json();
      if (data.ok && Array.isArray(data.categories)) {
        setCustomCategories(data.categories);
      }
    } catch (err) {
      console.error("Error guardando categoría en SQL:", err);
    }
  }

  async function handleConfirmDeleteCategory() {
    if (!categoryToDelete) return;
    const cat = categoryToDelete;
    // Optimistic update
    setCustomCategories((prev) => prev.filter((c) => c.toLowerCase() !== cat.toLowerCase()));
    if (categoryFilter.toLowerCase() === cat.toLowerCase()) {
      setCategoryFilter("Todos");
    }
    setCategoryToDelete(null);
    pushToast("success", `Categoría "${cat}" eliminada del catálogo.`);

    try {
      const res = await fetch(`/api/services/categories?name=${encodeURIComponent(cat)}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.ok && Array.isArray(data.categories)) {
        setCustomCategories(data.categories);
      }
    } catch (err) {
      console.error("Error eliminando categoría en SQL:", err);
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
      active: s.active !== false,
      staffIds: initialStaffIds,
    });
    setServiceModalOpen(true);
  }

  function handleSaveService(e: React.FormEvent) {
    e.preventDefault();
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
      active: serviceForm.active,
      staffIds: serviceForm.staffIds,
    };

    if (editingService) {
      updateService(editingService.id, payload);
      pushToast("success", `Servicio "${serviceForm.name}" actualizado`);
    } else {
      addService(payload);
      pushToast("success", `Servicio "${serviceForm.name}" creado`);
    }
    setServiceModalOpen(false);
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
      prepaymentMethod: service.prepaymentMethod || "sipap",
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

  function handleSavePromo(e: React.FormEvent) {
    e.preventDefault();
    if (!promoModalService) return;

    updateService(promoModalService.id, {
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

    pushToast(
      "success",
      promoForm.hasPromo
        ? `Promoción activada para "${promoModalService.name}"`
        : `Promoción desactivada para "${promoModalService.name}"`
    );
    setPromoModalService(null);
  }

  function handleRemovePromo() {
    if (!promoModalService) return;
    updateService(promoModalService.id, {
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
    pushToast("success", `Promoción quitada de "${promoModalService.name}"`);
    setPromoModalService(null);
  }

  function handleToggleVisibility(service: ServiceItem) {
    const nextActive = service.active === false ? true : false;
    updateService(service.id, { active: nextActive });
    pushToast(
      "success",
      `Servicio "${service.name}" ${nextActive ? "ahora está visible online" : "ahora está oculto"}`
    );
  }

  function handleConfirmDelete() {
    if (!deleteTarget) return;
    removeService(deleteTarget.id);
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
    <div className="space-y-6">
      {/* Top Header */}
      <div
        data-tour="servicios-header"
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white inline-flex items-center gap-2">
            <span>Catálogo de Servicios</span>
            <Scissors className="h-5 w-5 text-primary" />
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 sm:text-sm">
            Categorías, duraciones por turno, profesionales asignados y promociones flash.
          </p>
        </div>

        <button
          type="button"
          data-tour="servicios-new-btn"
          onClick={handleOpenCreateService}
          className="inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-primary/25 hover:opacity-95 transition cursor-pointer w-fit"
        >
          <Plus className="h-4 w-4" />
          <span>Nuevo Servicio</span>
        </button>
      </div>

      {/* Team Link Notification Banner */}
      <div className="flex items-center justify-between rounded-2xl border border-indigo-200/80 dark:border-indigo-800/40 bg-indigo-50/70 dark:bg-indigo-950/30 p-3.5 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white font-bold">
            <Users className="h-4 w-4" />
          </div>
          <div>
            <p className="text-xs font-bold text-indigo-950 dark:text-indigo-200">
              ¿Querés gestionar horarios y comisiones individuales?
            </p>
            <p className="text-[11px] text-indigo-700/80 dark:text-indigo-400">
              Los porcentajes de ganancia de cada especialista se administran en Colaboradores.
            </p>
          </div>
        </div>
        <Link
          href="/dashboard/equipo"
          className="inline-flex items-center gap-1.5 rounded-xl bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800/50 px-3 py-1.5 text-xs font-bold text-indigo-700 dark:text-indigo-300 hover:border-indigo-500 shadow-xs transition shrink-0"
        >
          <span>Ir a Equipo ({activeStaffCount} activos)</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* KPI Stats */}
      <div data-tour="servicios-kpis" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="Servicios Activos Online"
          value={`${visibleServicesCount} de ${services.length}`}
          icon={Layers}
        />
        <StatCard
          label="Duración Promedio"
          value={`${avgDuration} min / turno`}
          icon={Clock}
        />
        <StatCard
          label="Precio Promedio"
          value={formatGs(avgPrice)}
          icon={Coins}
        />
      </div>

      {/* Search Bar & Category Filters + Add Category Action */}
      <div
        data-tour="servicios-filters"
        className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full scrollbar-none">
          {filterCategoryList.map((cat) => {
            const isSelected = categoryFilter === cat;
            const isRemovable = cat !== "Todos";
            return (
              <div
                key={cat}
                className={`group inline-flex items-center gap-1.5 rounded-2xl border px-3 py-1.5 text-xs font-bold transition shrink-0 ${
                  isSelected
                    ? "border-primary bg-primary/10 text-primary shadow-xs"
                    : "border-slate-200/80 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <button
                  type="button"
                  onClick={() => setCategoryFilter(cat)}
                  className="cursor-pointer"
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
                    className="opacity-40 hover:opacity-100 p-0.5 rounded-md hover:bg-rose-500/10 hover:text-rose-500 transition cursor-pointer"
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
                className="w-32 px-2 py-0.5 text-xs text-slate-900 dark:text-white focus:outline-none"
              />
              <button
                type="button"
                onClick={handleCreateCategory}
                className="rounded-xl bg-primary text-white p-1 hover:opacity-90 transition cursor-pointer"
                title="Guardar categoría en base de datos"
              >
                <Check className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setIsAddingCategory(false)}
                className="rounded-xl p-1 text-slate-400 hover:text-slate-600 transition cursor-pointer"
                title="Cancelar"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsAddingCategory(true)}
              className="inline-flex items-center gap-1.5 rounded-2xl border border-dashed border-slate-300 dark:border-white/20 bg-slate-50/50 dark:bg-slate-800/50 px-3.5 py-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:border-primary hover:text-primary transition shrink-0 cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Nueva Categoría</span>
            </button>
          )}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar servicio..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900 py-2 pl-9 pr-3 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-primary focus:outline-none"
          />
        </div>
      </div>

      {/* Services Grid */}
      {filteredServices.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center rounded-3xl border border-dashed border-slate-300 dark:border-white/10 bg-white/50 dark:bg-slate-900/50">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-3">
            <Scissors className="h-6 w-6" />
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white text-base">
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
            className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:opacity-95 transition cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Crear primer servicio</span>
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
              <Card
                key={item.id}
                data-tour={index === 0 ? "servicios-card" : undefined}
                className={`group flex flex-col justify-between rounded-3xl border p-5 shadow-xs transition-all duration-300 ${
                  isVisible
                    ? "border-slate-200/80 dark:border-white/10 bg-white/90 dark:bg-slate-900/90 hover:shadow-md hover:border-primary/40"
                    : "border-slate-200/50 dark:border-white/5 bg-slate-100/50 dark:bg-slate-900/40 opacity-75"
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 border border-slate-200/50 dark:border-white/5">
                        {item.category || "General"}
                      </span>

                      {/* Interactive Visibility Button with Live Status Dot */}
                      <button
                        type="button"
                        onClick={() => handleToggleVisibility(item)}
                        title={isVisible ? "Servicio publicado en tu web. Clic para ocultar." : "Servicio oculto. Clic para hacerlo visible online."}
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold border transition-all cursor-pointer ${
                          isVisible
                            ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-300 dark:border-slate-700 hover:bg-slate-200"
                        }`}
                      >
                        <span
                          className={`h-2 w-2 rounded-full transition-colors ${
                            isVisible ? "bg-emerald-500" : "bg-slate-400"
                          }`}
                        />
                        <span>{isVisible ? "Visible online" : "Pausado"}</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5 text-slate-500 text-xs font-semibold">
                      <Clock className="h-3.5 w-3.5 text-primary" />
                      <span>{item.durationMin} min</span>
                    </div>
                  </div>

                  <h3 className="mt-3 font-bold text-slate-900 dark:text-white text-base group-hover:text-primary transition">
                    {item.name}
                  </h3>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {item.description || "Servicio estándar de atención en el local."}
                  </p>

                  {/* Price Section */}
                  <div className="mt-4 flex items-baseline gap-2">
                    <span className="font-mono font-black text-xl text-slate-900 dark:text-white">
                      {formatGs(currentPrice)}
                    </span>
                    {hasActivePromo && (
                      <span className="text-xs text-slate-400 line-through font-mono">
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
                        <span className="inline-flex items-center gap-1 rounded-lg bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-300">
                          <Clock className="h-2.5 w-2.5 text-amber-500" />
                          <span>Cronómetro {item.promoLimitHours || 24}h</span>
                        </span>
                      )}
                      {(item.promoType === "quantity" || item.promoType === "both") && (
                        <span className="inline-flex items-center gap-1 rounded-lg bg-orange-500/10 border border-orange-500/20 px-2 py-0.5 text-[10px] font-bold text-orange-700 dark:text-orange-300">
                          <Flame className="h-2.5 w-2.5 text-orange-500 fill-orange-500" />
                          <span>{item.promoLimitQuantity || 5} cupos</span>
                        </span>
                      )}
                      {item.requirePrepayment && (
                        <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                          <CreditCard className="h-2.5 w-2.5 text-emerald-500" />
                          <span>
                            {item.prepaymentType === "full"
                              ? "Pago 100% anticipado"
                              : `Seña: ${formatGs(item.prepaymentAmount || Math.round((item.promoPrice || item.price) * 0.5))}`}{" "}
                            ({item.prepaymentMethod === "sipap" ? "SIPAP" : item.prepaymentMethod === "qr" ? "QR" : "Transferencia"})
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
                    className={`w-full flex items-center justify-between rounded-xl py-1.5 px-3 text-xs font-bold transition cursor-pointer ${
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
                    <span className="text-[10px] opacity-75 font-bold">
                      {item.hasPromo ? "Modificar" : "Configurar"}
                    </span>
                  </button>

                  {/* Actions Row */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      data-tour={index === 0 ? "servicios-share-btn" : undefined}
                      onClick={() => handleCopyServiceLink(item.id, item.name)}
                      className={`flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border py-2 px-3 text-xs font-bold transition cursor-pointer ${
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
              </Card>
            );
          })}
        </div>
      )}

      {/* Modal 1: Service Create / Edit (Clean, Zero Promo Clutter) */}
      <Modal
        open={serviceModalOpen}
        onClose={() => setServiceModalOpen(false)}
        title={editingService ? `Editar: ${editingService.name}` : "Nuevo Servicio en Catálogo"}
      >
        <form onSubmit={handleSaveService} className="space-y-4 text-xs">
          {/* Service Name & Visibility Switch */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex-1">
              <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
                Nombre del Servicio *
              </label>
              <input
                type="text"
                required
                placeholder="Ej: Corte Fade Clásico + Barba"
                value={serviceForm.name}
                onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })}
                className="w-full rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-primary focus:outline-none"
              />
            </div>

            {/* Custom Visibility Switch */}
            <div className="flex items-center gap-2 pt-1 sm:pt-4">
              <button
                type="button"
                role="switch"
                aria-checked={serviceForm.active}
                onClick={() => setServiceForm({ ...serviceForm, active: !serviceForm.active })}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  serviceForm.active ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-700"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                    serviceForm.active ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
              <span className="font-bold text-[11px] text-slate-700 dark:text-slate-300">
                {serviceForm.active ? "Visible Online" : "Oculto"}
              </span>
            </div>
          </div>

          {/* Category Custom Selector */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-bold text-slate-700 dark:text-slate-200">
                Categoría del Servicio
              </label>
              <button
                type="button"
                onClick={() => setIsAddingCategory(!isAddingCategory)}
                className="text-[11px] font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
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
                    className={`rounded-xl border px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
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
                  className="rounded-xl bg-primary px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:opacity-95 cursor-pointer"
                >
                  Guardar en SQL
                </button>
              </div>
            )}
          </div>

          {/* Duration & Base Price with Custom Steppers */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Custom Duration Selector */}
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                Duración del Turno ({serviceForm.durationMin} min)
              </label>
              <div className="grid grid-cols-3 gap-1.5 mb-2">
                {PRESET_DURATIONS.map((dur) => (
                  <button
                    key={dur}
                    type="button"
                    onClick={() => setServiceForm({ ...serviceForm, durationMin: dur })}
                    className={`py-1.5 rounded-xl border text-xs font-bold transition cursor-pointer ${
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
                  className="h-8 w-8 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800 font-black text-slate-700 dark:text-slate-200 cursor-pointer"
                >
                  -5
                </button>
                <div className="flex-1 text-center font-mono font-bold text-xs bg-slate-100 dark:bg-slate-800 py-1.5 rounded-xl">
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
                  className="h-8 w-8 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800 font-black text-slate-700 dark:text-slate-200 cursor-pointer"
                >
                  +5
                </button>
              </div>
            </div>

            {/* Base Price Input with helper pills */}
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1.5">
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
                  className="w-full rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900 px-3.5 py-2 text-slate-900 dark:text-white font-mono font-black text-base focus:border-primary focus:outline-none"
                />
              </div>
              <div className="flex items-center gap-1.5">
                {[50000, 80000, 100000, 150000].map((quick) => (
                  <button
                    key={quick}
                    type="button"
                    onClick={() => setServiceForm({ ...serviceForm, price: quick })}
                    className="flex-1 rounded-xl border border-slate-200/60 dark:border-white/10 py-1 text-[10px] font-bold text-slate-500 hover:text-primary hover:border-primary transition cursor-pointer"
                  >
                    {quick / 1000}k
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
              Descripción o Detalle (opcional)
            </label>
            <textarea
              rows={2}
              placeholder="Detallá qué incluye el servicio para tus clientes..."
              value={serviceForm.description}
              onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
              className="w-full rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900 px-3.5 py-2 text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-primary focus:outline-none"
            />
          </div>

          {/* Staff Assignment: Multi-select */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-bold text-slate-700 dark:text-slate-200">
                ¿Quiénes realizan este servicio?
              </label>
              <button
                type="button"
                onClick={handleSelectAllStaff}
                className="text-[11px] font-bold text-primary hover:underline cursor-pointer"
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
                    className={`flex items-center gap-2 p-2 rounded-2xl border text-left transition cursor-pointer ${
                      isAssigned
                        ? "border-primary bg-primary/10 text-primary font-bold shadow-xs"
                        : "border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 opacity-60"
                    }`}
                  >
                    <div
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-black ${
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

          {/* Modal Footer Actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-white/10">
            <button
              type="button"
              onClick={() => setServiceModalOpen(false)}
              className="rounded-2xl border border-slate-200/80 dark:border-white/10 px-4 py-2.5 font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="rounded-2xl bg-primary px-5 py-2.5 font-bold text-white shadow-md hover:opacity-95 transition cursor-pointer"
            >
              {editingService ? "Guardar Cambios" : "Crear Servicio"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal 2: Dedicated Standalone Promo Flash Modal */}
      {promoModalService && (
        <Modal
          open={!!promoModalService}
          onClose={() => setPromoModalService(null)}
          title={`Promoción Flash: ${promoModalService.name}`}
        >
          <form onSubmit={handleSavePromo} className="space-y-4 text-xs">
            {/* Promo Header & Switch */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500 text-white font-bold">
                  <Flame className="h-4 w-4 fill-white" />
                </div>
                <div>
                  <span className="font-extrabold text-xs text-slate-900 dark:text-white block">
                    Activar Precio Promocional
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Precio estándar: <strong className="text-slate-700 dark:text-slate-300 font-mono">{formatGs(promoModalService.price)}</strong>
                  </span>
                </div>
              </div>

              {/* Custom Switch for Promo */}
              <button
                type="button"
                role="switch"
                aria-checked={promoForm.hasPromo}
                onClick={() => setPromoForm({ ...promoForm, hasPromo: !promoForm.hasPromo })}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  promoForm.hasPromo ? "bg-amber-500" : "bg-slate-300 dark:bg-slate-700"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
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
                    <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
                      Porcentaje de Descuento (%)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="1"
                        max="99"
                        value={promoForm.promoPercent}
                        onChange={(e) => handlePromoPercentChange(Number(e.target.value))}
                        className="w-full rounded-2xl border border-amber-500/40 bg-white dark:bg-slate-900 py-2 pl-3 pr-8 text-xs font-mono font-bold text-slate-900 dark:text-white focus:border-amber-500 focus:outline-none"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 font-bold text-amber-600">
                        %
                      </span>
                    </div>
                    <p className="mt-1 text-[10px] text-slate-400">
                      Calcula el monto final automáticamente.
                    </p>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
                      Precio Promocional (Gs.)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="1000"
                      value={promoForm.promoPrice}
                      onChange={(e) => handlePromoPriceChange(Number(e.target.value))}
                      className="w-full rounded-2xl border border-amber-500/40 bg-white dark:bg-slate-900 py-2 px-3 text-xs font-mono font-bold text-slate-900 dark:text-white focus:border-amber-500 focus:outline-none"
                    />
                    <p className="mt-1 text-[10px] text-slate-400">
                      Calcula el % de descuento automáticamente.
                    </p>
                  </div>
                </div>

                {/* Badge Style Selector */}
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                    ¿Cómo mostrar el descuento en tu portal?
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handlePromoDisplayTypeChange("percentage")}
                      className={`p-2.5 rounded-2xl border text-center transition cursor-pointer ${
                        promoForm.promoDisplayType === "percentage"
                          ? "border-amber-500 bg-amber-500/20 text-amber-800 dark:text-amber-200 font-bold"
                          : "border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300"
                      }`}
                    >
                      <span className="block text-xs font-black">Mostrar Porcentaje</span>
                      <span className="text-[10px] opacity-75">
                        Ej: -{promoForm.promoPercent}% OFF
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handlePromoDisplayTypeChange("amount")}
                      className={`p-2.5 rounded-2xl border text-center transition cursor-pointer ${
                        promoForm.promoDisplayType === "amount"
                          ? "border-amber-500 bg-amber-500/20 text-amber-800 dark:text-amber-200 font-bold"
                          : "border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300"
                      }`}
                    >
                      <span className="block text-xs font-black">Mostrar Monto Ahorrado</span>
                      <span className="text-[10px] opacity-75">
                        Ej: Ahorrá {formatGs(Math.max(0, promoModalService.price - promoForm.promoPrice))}
                      </span>
                    </button>
                  </div>
                </div>

                {/* 2. Modalidad de Urgencia & Límite (Cronómetro / Cupos) */}
                <div className="pt-2 border-t border-slate-100 dark:border-white/5 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="block font-bold text-slate-700 dark:text-slate-200">
                      Regla de Urgencia para Agendar
                    </label>
                    <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">
                      Incentiva reserva inmediata
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setPromoForm({ ...promoForm, promoType: "time" })}
                      className={`p-2.5 rounded-2xl border text-center transition cursor-pointer ${
                        promoForm.promoType === "time"
                          ? "border-amber-500 bg-amber-500/20 text-amber-800 dark:text-amber-200 font-bold shadow-xs"
                          : "border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      <Timer className="h-4 w-4 mx-auto mb-1 text-amber-500" />
                      <span className="block text-[11px] font-black leading-tight">Cronómetro</span>
                      <span className="text-[9px] opacity-75">Tiempo límite</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPromoForm({ ...promoForm, promoType: "quantity" })}
                      className={`p-2.5 rounded-2xl border text-center transition cursor-pointer ${
                        promoForm.promoType === "quantity"
                          ? "border-orange-500 bg-orange-500/20 text-orange-800 dark:text-orange-200 font-bold shadow-xs"
                          : "border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      <Flame className="h-4 w-4 mx-auto mb-1 text-orange-500" />
                      <span className="block text-[11px] font-black leading-tight">Por Cupos</span>
                      <span className="text-[9px] opacity-75">Cantidad fija</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPromoForm({ ...promoForm, promoType: "both" })}
                      className={`p-2.5 rounded-2xl border text-center transition cursor-pointer ${
                        promoForm.promoType === "both"
                          ? "border-indigo-500 bg-indigo-500/20 text-indigo-800 dark:text-indigo-200 font-bold shadow-xs"
                          : "border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      <Hourglass className="h-4 w-4 mx-auto mb-1 text-indigo-500" />
                      <span className="block text-[11px] font-black leading-tight">Ambos</span>
                      <span className="text-[9px] opacity-75">Tiempo + Cupos</span>
                    </button>
                  </div>

                  {/* Configuración de Horas si tiene Cronómetro */}
                  {(promoForm.promoType === "time" || promoForm.promoType === "both") && (
                    <div className="p-3 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/30 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 text-amber-600" />
                          <span>Duración del Cronómetro Regresivo:</span>
                        </span>
                        <span className="font-mono font-bold text-amber-700 dark:text-amber-300">
                          {promoForm.promoLimitHours} horas
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {[6, 12, 24, 48, 72].map((hours) => (
                          <button
                            key={hours}
                            type="button"
                            onClick={() => setPromoForm({ ...promoForm, promoLimitHours: hours })}
                            className={`flex-1 py-1 px-2 rounded-xl text-[11px] font-bold transition cursor-pointer ${
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
                        <span className="font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                          <Flame className="h-3.5 w-3.5 text-orange-500 fill-orange-500" />
                          <span>Cupos Disponibles para esta Promo:</span>
                        </span>
                        <span className="font-mono font-bold text-orange-700 dark:text-orange-300">
                          {promoForm.promoLimitQuantity} cupos
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {[3, 5, 10, 15, 20].map((qty) => (
                          <button
                            key={qty}
                            type="button"
                            onClick={() => setPromoForm({ ...promoForm, promoLimitQuantity: qty })}
                            className={`flex-1 py-1 px-2 rounded-xl text-[11px] font-bold transition cursor-pointer ${
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

                {/* 3. Seña y Pago Anticipado (Transferencia / SIPAP) */}
                <div className="pt-2 border-t border-slate-100 dark:border-white/5 space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-600 text-white font-bold">
                        <CreditCard className="h-4 w-4" />
                      </div>
                      <div>
                        <span className="font-extrabold text-xs text-slate-900 dark:text-white block">
                          Exigir Seña o Pago por Transferencia
                        </span>
                        <span className="text-[11px] text-slate-500">
                          Garantizá asistencia y congelá el precio con seña o SIPAP previo.
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      role="switch"
                      aria-checked={promoForm.requirePrepayment}
                      onClick={() =>
                        setPromoForm({
                          ...promoForm,
                          requirePrepayment: !promoForm.requirePrepayment,
                        })
                      }
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        promoForm.requirePrepayment
                          ? "bg-emerald-600"
                          : "bg-slate-300 dark:bg-slate-700"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                          promoForm.requirePrepayment ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>

                  {promoForm.requirePrepayment && (
                    <div className="space-y-3 p-3.5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/30">
                      {/* Modalidad de seña */}
                      <div>
                        <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1.5">
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
                                ? "border-emerald-500 bg-emerald-500/20 text-emerald-800 dark:text-emerald-200 font-bold"
                                : "border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300"
                            }`}
                          >
                            <span className="block text-xs font-black">Seña Parcial</span>
                            <span className="text-[10px] opacity-75">
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
                                ? "border-emerald-500 bg-emerald-500/20 text-emerald-800 dark:text-emerald-200 font-bold"
                                : "border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300"
                            }`}
                          >
                            <span className="block text-xs font-black">Pago 100% Total</span>
                            <span className="text-[10px] opacity-75">
                              {formatGs(promoForm.promoPrice)}
                            </span>
                          </button>
                        </div>
                      </div>

                      {/* Monto de seña si es parcial */}
                      {promoForm.prepaymentType === "deposit" && (
                        <div>
                          <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
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
                              className="w-full rounded-2xl border border-emerald-500/40 bg-white dark:bg-slate-900 py-2 px-3 text-xs font-mono font-bold text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none"
                            />
                            <div className="flex items-center gap-1 shrink-0">
                              {[20000, 30000, 50000].map((preset) => (
                                <button
                                  key={preset}
                                  type="button"
                                  onClick={() =>
                                    setPromoForm({ ...promoForm, prepaymentAmount: preset })
                                  }
                                  className={`py-1.5 px-2 rounded-xl text-[10px] font-bold border transition cursor-pointer ${
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
                        <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                          Medio de Pago Aceptado
                        </label>
                        <div className="grid grid-cols-3 gap-2 text-center">
                          <button
                            type="button"
                            onClick={() =>
                              setPromoForm({ ...promoForm, prepaymentMethod: "sipap" })
                            }
                            className={`p-2 rounded-xl border text-[11px] font-bold transition cursor-pointer ${
                              promoForm.prepaymentMethod === "sipap"
                                ? "border-emerald-600 bg-emerald-600 text-white shadow-xs"
                                : "border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300"
                            }`}
                          >
                            <Building2 className="h-3.5 w-3.5 mx-auto mb-0.5" />
                            <span>SIPAP Bancario</span>
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              setPromoForm({ ...promoForm, prepaymentMethod: "qr" })
                            }
                            className={`p-2 rounded-xl border text-[11px] font-bold transition cursor-pointer ${
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
                            className={`p-2 rounded-xl border text-[11px] font-bold transition cursor-pointer ${
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
                        <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
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
                  <div className="flex items-center justify-between text-[10px] uppercase font-bold text-slate-400">
                    <span>Vista previa en vivo para el cliente:</span>
                    <span className="text-amber-500 font-black">DEMO EN RESERVA</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                        {promoModalService.name}
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {promoModalService.durationMin} minutos · {promoModalService.category || "General"}
                      </p>
                    </div>

                    <div className="text-right">
                      <div className="flex items-center gap-1.5 justify-end">
                        <span className="text-xs text-slate-400 line-through font-mono">
                          {formatGs(promoModalService.price)}
                        </span>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-[10px] font-black text-amber-700 dark:text-amber-300">
                          <Flame className="h-3 w-3 fill-amber-500 text-amber-500" />
                          {promoForm.promoBadge}
                        </span>
                      </div>
                      <div className="font-mono font-black text-lg text-emerald-600 dark:text-emerald-400 mt-0.5">
                        {formatGs(promoForm.promoPrice)}
                      </div>
                    </div>
                  </div>

                  {/* Urgency indicators in preview */}
                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-white/5">
                    {(promoForm.promoType === "time" || promoForm.promoType === "both") && (
                      <div className="flex items-center gap-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300/60 dark:border-amber-700/40 px-2.5 py-1 text-[11px] font-bold text-amber-800 dark:text-amber-200">
                        <Timer className="h-3.5 w-3.5 text-amber-600 animate-pulse" />
                        <span>Termina en: <strong>{promoForm.promoLimitHours}h 00m</strong></span>
                      </div>
                    )}

                    {(promoForm.promoType === "quantity" || promoForm.promoType === "both") && (
                      <div className="flex items-center gap-1.5 rounded-xl bg-orange-50 dark:bg-orange-950/40 border border-orange-300/60 dark:border-orange-700/40 px-2.5 py-1 text-[11px] font-bold text-orange-800 dark:text-orange-200">
                        <Flame className="h-3.5 w-3.5 text-orange-500 fill-orange-500" />
                        <span>¡Solo quedan <strong>{promoForm.promoLimitQuantity} cupos</strong>!</span>
                      </div>
                    )}

                    {promoForm.requirePrepayment && (
                      <div className="flex items-center gap-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300/60 dark:border-emerald-700/40 px-2.5 py-1 text-[11px] font-bold text-emerald-800 dark:text-emerald-200">
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

            {/* Modal Actions */}
            <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-white/10">
              {promoModalService.hasPromo ? (
                <button
                  type="button"
                  onClick={handleRemovePromo}
                  className="rounded-2xl border border-rose-200 dark:border-rose-900/40 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 px-3.5 py-2 font-bold transition cursor-pointer"
                >
                  Quitar Promoción
                </button>
              ) : (
                <div />
              )}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPromoModalService(null)}
                  className="rounded-2xl border border-slate-200/80 dark:border-white/10 px-4 py-2 font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-2xl bg-amber-500 hover:bg-amber-600 px-5 py-2 font-bold text-white shadow-md transition cursor-pointer"
                >
                  Guardar Promoción
                </button>
              </div>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal 3: Custom Web Modal for Delete Service Confirmation */}
      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="¿Eliminar servicio del catálogo?"
      >
        <div className="space-y-4 text-xs">
          <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200/60 dark:border-rose-900/40 text-rose-800 dark:text-rose-200">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-600 text-white font-bold">
              <Trash2 className="h-5 w-5" />
            </div>
            <div>
              <p className="font-bold text-sm text-slate-900 dark:text-white">
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
              className="rounded-xl bg-rose-600 hover:bg-rose-700 px-5 py-2 font-bold text-white shadow-md transition cursor-pointer"
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
      >
        <div className="space-y-4 text-xs">
          <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200/60 dark:border-rose-900/40 text-rose-800 dark:text-rose-200">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-600 text-white font-bold">
              <Trash2 className="h-5 w-5" />
            </div>
            <div>
              <p className="font-bold text-sm text-slate-900 dark:text-white">
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
              className="rounded-xl bg-rose-600 hover:bg-rose-700 px-5 py-2 font-bold text-white shadow-md transition cursor-pointer"
            >
              Eliminar Categoría
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

