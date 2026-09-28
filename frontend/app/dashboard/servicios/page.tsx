"use client";

import { useMemo, useState } from "react";
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
  Tag,
  Eye,
  EyeOff,
  Percent,
  X,
  UserCheck,
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

  // Custom Categories State
  const [customCategories, setCustomCategories] = useState<string[]>(INITIAL_CATEGORIES);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryInput, setNewCategoryInput] = useState("");

  // Delete Confirmation Modal State
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  // Service Modal state
  const [serviceModalOpen, setServiceModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);

  // Form State
  const [serviceForm, setServiceForm] = useState({
    name: "",
    category: "Peluquería",
    durationMin: 45,
    price: 80000,
    description: "",
    active: true,
    staffIds: [] as string[],
    hasPromo: false,
    promoCalcMode: "percentage" as "percentage" | "amount",
    promoPercent: 20,
    promoPrice: 64000,
    promoDisplayType: "percentage" as "percentage" | "amount",
    promoBadge: "-20% OFF",
  });

  // Dynamic Categories merging defaults + created + services
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

  // Handlers for Categories
  function handleCreateCategory() {
    const trimmed = newCategoryInput.trim();
    if (!trimmed) return;
    if (allCategories.some((c) => c.toLowerCase() === trimmed.toLowerCase())) {
      pushToast("error", "Esa categoría ya existe.");
      return;
    }
    setCustomCategories((prev) => [...prev, trimmed]);
    setServiceForm((prev) => ({ ...prev, category: trimmed }));
    setNewCategoryInput("");
    setIsAddingCategory(false);
    pushToast("success", `Categoría "${trimmed}" agregada`);
  }

  // Handlers for Services
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
      hasPromo: false,
      promoCalcMode: "percentage",
      promoPercent: 20,
      promoPrice: 64000,
      promoDisplayType: "percentage",
      promoBadge: "-20% OFF",
    });
    setServiceModalOpen(true);
  }

  function handleOpenEditService(s: ServiceItem, openForPromo = false) {
    setEditingService(s);
    const price = s.price || 0;
    const hasPromo = openForPromo ? true : !!s.hasPromo;
    const promoPrice = s.promoPrice || Math.round(price * 0.8);
    const calculatedPercent =
      price > 0 && promoPrice < price ? Math.round(((price - promoPrice) / price) * 100) : 20;

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
      hasPromo,
      promoCalcMode: "percentage",
      promoPercent: calculatedPercent,
      promoPrice,
      promoDisplayType: s.promoDisplayType || "percentage",
      promoBadge: s.promoBadge || `-${calculatedPercent}% OFF`,
    });
    setServiceModalOpen(true);
  }

  // Discount Calculation Helpers
  function handleBasePriceChange(newPrice: number) {
    const safePrice = Math.max(0, newPrice);
    if (serviceForm.hasPromo) {
      if (serviceForm.promoCalcMode === "percentage") {
        const newPromoPrice = Math.round(safePrice * (1 - serviceForm.promoPercent / 100));
        const badge =
          serviceForm.promoDisplayType === "percentage"
            ? `-${serviceForm.promoPercent}% OFF`
            : `Ahorrá ${formatGs(safePrice - newPromoPrice)}`;
        setServiceForm((prev) => ({
          ...prev,
          price: safePrice,
          promoPrice: newPromoPrice,
          promoBadge: badge,
        }));
      } else {
        const percent =
          safePrice > 0 ? Math.round(((safePrice - serviceForm.promoPrice) / safePrice) * 100) : 0;
        const badge =
          serviceForm.promoDisplayType === "percentage"
            ? `-${Math.max(0, percent)}% OFF`
            : `Ahorrá ${formatGs(Math.max(0, safePrice - serviceForm.promoPrice))}`;
        setServiceForm((prev) => ({
          ...prev,
          price: safePrice,
          promoPercent: Math.max(0, percent),
          promoBadge: badge,
        }));
      }
    } else {
      setServiceForm((prev) => ({ ...prev, price: safePrice }));
    }
  }

  function handlePercentChange(newPercent: number) {
    const clampedPercent = Math.min(99, Math.max(1, newPercent));
    const calculatedPromoPrice = Math.round(
      serviceForm.price * (1 - clampedPercent / 100)
    );
    const badge =
      serviceForm.promoDisplayType === "percentage"
        ? `-${clampedPercent}% OFF`
        : `Ahorrá ${formatGs(serviceForm.price - calculatedPromoPrice)}`;

    setServiceForm((prev) => ({
      ...prev,
      promoPercent: clampedPercent,
      promoPrice: calculatedPromoPrice,
      promoBadge: badge,
      promoCalcMode: "percentage",
    }));
  }

  function handlePromoPriceChange(newPromoPrice: number) {
    const clamped = Math.max(0, newPromoPrice);
    const calculatedPercent =
      serviceForm.price > 0
        ? Math.round(((serviceForm.price - clamped) / serviceForm.price) * 100)
        : 0;
    const badge =
      serviceForm.promoDisplayType === "percentage"
        ? `-${Math.max(0, calculatedPercent)}% OFF`
        : `Ahorrá ${formatGs(Math.max(0, serviceForm.price - clamped))}`;

    setServiceForm((prev) => ({
      ...prev,
      promoPrice: clamped,
      promoPercent: Math.max(0, calculatedPercent),
      promoBadge: badge,
      promoCalcMode: "amount",
    }));
  }

  function handleDisplayTypeChange(type: "percentage" | "amount") {
    let badge = "";
    if (type === "percentage") {
      badge = `-${serviceForm.promoPercent}% OFF`;
    } else {
      const saved = Math.max(0, serviceForm.price - serviceForm.promoPrice);
      badge = `Ahorrá ${formatGs(saved)}`;
    }
    setServiceForm((prev) => ({
      ...prev,
      promoDisplayType: type,
      promoBadge: badge,
    }));
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
      hasPromo: serviceForm.hasPromo,
      promoPrice: serviceForm.hasPromo ? Number(serviceForm.promoPrice) || 0 : undefined,
      promoBadge: serviceForm.hasPromo ? serviceForm.promoBadge : undefined,
      promoDisplayType: serviceForm.hasPromo ? serviceForm.promoDisplayType : undefined,
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
            Categorías, duraciones por turno, profesionales asignados y promociones calculadas.
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
          {filterCategoryList.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategoryFilter(cat)}
              className={`rounded-2xl border px-3.5 py-1.5 text-xs font-bold transition shrink-0 cursor-pointer ${
                categoryFilter === cat
                  ? "border-primary bg-primary/10 text-primary shadow-xs"
                  : "border-slate-200/80 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              {cat}
            </button>
          ))}

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
                title="Guardar categoría"
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
                </div>

                <div className="mt-4 space-y-2.5 pt-3.5 border-t border-slate-100 dark:border-white/5">
                  {/* Promo Badge / Fast Toggle Button */}
                  <button
                    type="button"
                    onClick={() => handleOpenEditService(item, !item.hasPromo)}
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
                          : "Activar descuento"}
                      </span>
                    </span>
                    <span className="text-[10px] opacity-75 font-bold">
                      {item.hasPromo ? "Modificar" : "Activar"}
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
                      title="Editar servicio"
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

      {/* Custom Modern Modal: Service Create / Edit */}
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
                <span>Crear Categoría</span>
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
                  Agregar
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
                  onChange={(e) => handleBasePriceChange(Number(e.target.value))}
                  className="w-full rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900 px-3.5 py-2 text-slate-900 dark:text-white font-mono font-black text-base focus:border-primary focus:outline-none"
                />
              </div>
              <div className="flex items-center gap-1.5">
                {[50000, 80000, 100000, 150000].map((quick) => (
                  <button
                    key={quick}
                    type="button"
                    onClick={() => handleBasePriceChange(quick)}
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

          {/* AUTOMATIC DISCOUNT CALCULATOR & LIVE PREVIEW DEMO */}
          <div className="rounded-3xl border border-amber-500/30 bg-gradient-to-br from-amber-500/5 via-amber-500/10 to-transparent p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame className="h-4 w-4 text-amber-500 fill-amber-500" />
                <span className="font-extrabold text-slate-900 dark:text-white text-xs">
                  Descuento o Promoción Flash
                </span>
              </div>

              {/* Custom Switch for Promo */}
              <button
                type="button"
                role="switch"
                aria-checked={serviceForm.hasPromo}
                onClick={() => setServiceForm({ ...serviceForm, hasPromo: !serviceForm.hasPromo })}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  serviceForm.hasPromo ? "bg-amber-500" : "bg-slate-300 dark:bg-slate-700"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                    serviceForm.hasPromo ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {serviceForm.hasPromo && (
              <div className="space-y-3 pt-3 border-t border-amber-500/20 text-xs">
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
                        value={serviceForm.promoPercent}
                        onChange={(e) => handlePercentChange(Number(e.target.value))}
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
                      value={serviceForm.promoPrice}
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
                    ¿Cómo mostrar el descuento al cliente?
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleDisplayTypeChange("percentage")}
                      className={`p-2.5 rounded-2xl border text-center transition cursor-pointer ${
                        serviceForm.promoDisplayType === "percentage"
                          ? "border-amber-500 bg-amber-500/20 text-amber-800 dark:text-amber-200 font-bold"
                          : "border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300"
                      }`}
                    >
                      <span className="block text-xs font-black">Mostrar Porcentaje</span>
                      <span className="text-[10px] opacity-75">
                        Ej: -{serviceForm.promoPercent}% OFF
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDisplayTypeChange("amount")}
                      className={`p-2.5 rounded-2xl border text-center transition cursor-pointer ${
                        serviceForm.promoDisplayType === "amount"
                          ? "border-amber-500 bg-amber-500/20 text-amber-800 dark:text-amber-200 font-bold"
                          : "border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300"
                      }`}
                    >
                      <span className="block text-xs font-black">Mostrar Monto Ahorrado</span>
                      <span className="text-[10px] opacity-75">
                        Ej: Ahorrá {formatGs(Math.max(0, serviceForm.price - serviceForm.promoPrice))}
                      </span>
                    </button>
                  </div>
                </div>

                {/* LIVE PREVIEW DEMO CARD */}
                <div className="mt-3 p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-amber-500/30 shadow-xs">
                  <div className="flex items-center justify-between text-[10px] uppercase font-bold text-slate-400 mb-2">
                    <span>Vista previa en vivo para el cliente:</span>
                    <span className="text-amber-500 font-black">DEMO EN RESERVA</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                        {serviceForm.name || "Nombre del servicio"}
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {serviceForm.durationMin} minutos · {serviceForm.category}
                      </p>
                    </div>

                    <div className="text-right">
                      <div className="flex items-center gap-1.5 justify-end">
                        <span className="text-xs text-slate-400 line-through font-mono">
                          {formatGs(serviceForm.price)}
                        </span>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-[10px] font-black text-amber-700 dark:text-amber-300">
                          <Flame className="h-3 w-3 fill-amber-500 text-amber-500" />
                          {serviceForm.promoBadge}
                        </span>
                      </div>
                      <div className="font-mono font-black text-lg text-emerald-600 dark:text-emerald-400 mt-0.5">
                        {formatGs(serviceForm.promoPrice)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
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

      {/* Custom Web Modal: Delete Service Confirmation */}
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
    </div>
  );
}
