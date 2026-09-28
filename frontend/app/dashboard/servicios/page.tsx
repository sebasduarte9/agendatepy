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
  Sparkles,
} from "lucide-react";
import { useDashboardStore } from "@/store/useDashboardStore";
import Card from "@/components/dashboard/ui/Card";
import StatCard from "@/components/dashboard/ui/StatCard";
import Modal from "@/components/dashboard/ui/Modal";
import { formatGs } from "@/lib/dashboard-dates";
import type { ServiceItem } from "@/lib/dashboard-types";

const DEFAULT_CATEGORIES = [
  "Todos",
  "Peluquería",
  "Barbería",
  "Color",
  "Tratamiento",
  "Estética",
] as const;

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

  // Service Modal state
  const [serviceModalOpen, setServiceModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);
  const [serviceForm, setServiceForm] = useState({
    name: "",
    category: "Peluquería",
    durationMin: 45,
    price: 85000,
    description: "",
    hasPromo: false,
    promoPrice: 65000,
    promoBadge: "-20% OFF",
  });

  // Dynamic categories
  const categories = useMemo(() => {
    const set = new Set<string>(["Todos"]);
    services.forEach((s) => {
      if (s.category && s.category.trim()) set.add(s.category.trim());
    });
    DEFAULT_CATEGORIES.forEach((cat) => set.add(cat));
    return Array.from(set);
  }, [services]);

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
  const activeStaffCount = staff.filter((s) => s.active).length;
  const avgPrice =
    services.length > 0
      ? Math.round(services.reduce((sum, s) => sum + s.price, 0) / services.length)
      : 0;
  const avgDuration =
    services.length > 0
      ? Math.round(services.reduce((sum, s) => sum + s.durationMin, 0) / services.length)
      : 0;

  // Handlers
  function handleOpenCreateService() {
    setEditingService(null);
    setServiceForm({
      name: "",
      category: "Peluquería",
      durationMin: 40,
      price: 80000,
      description: "",
      hasPromo: false,
      promoPrice: 65000,
      promoBadge: "-20% OFF",
    });
    setServiceModalOpen(true);
  }

  function handleOpenEditService(s: ServiceItem, openForPromo = false) {
    setEditingService(s);
    setServiceForm({
      name: s.name,
      category: s.category || "Peluquería",
      durationMin: s.durationMin,
      price: s.price,
      description: s.description,
      hasPromo: openForPromo ? true : !!s.hasPromo,
      promoPrice: s.promoPrice || Math.round(s.price * 0.8),
      promoBadge: s.promoBadge || "-20% OFF",
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
      hasPromo: serviceForm.hasPromo,
      promoPrice: serviceForm.hasPromo ? Number(serviceForm.promoPrice) || 0 : undefined,
      promoBadge: serviceForm.hasPromo ? serviceForm.promoBadge : undefined,
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

  function handleDeleteService(id: string, name: string) {
    if (confirm(`¿Eliminar el servicio "${name}" del menú?`)) {
      removeService(id);
      pushToast("success", "Servicio eliminado");
    }
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
            Definí precios en Guaraníes, tiempos de atención por turno y promociones activas.
          </p>
        </div>

        <button
          type="button"
          data-tour="servicios-new-btn"
          onClick={handleOpenCreateService}
          className="inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-primary/25 hover:opacity-95 transition cursor-pointer w-fit"
        >
          <Plus className="h-4 w-4" />
          <span>+ Nuevo Servicio</span>
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
              ¿Querés asignar profesionales o comisiones a tus servicios?
            </p>
            <p className="text-[11px] text-indigo-700/80 dark:text-indigo-400">
              Gestioná horarios y porcentajes de tu equipo en la sección especializada de Colaboradores.
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
          label="Total Servicios en Menú"
          value={`${services.length} opciones`}
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

      {/* Search Bar & Category Filters */}
      <div
        data-tour="servicios-filters"
        className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full scrollbar-none">
          {categories.map((cat) => (
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
            <span>+ Crear primer servicio</span>
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredServices.map((item, index) => {
            const hasActivePromo = item.hasPromo && item.promoPrice;
            const currentPrice = hasActivePromo ? item.promoPrice! : item.price;
            const isCopied = copiedId === item.id;

            return (
              <Card
                key={item.id}
                data-tour={index === 0 ? "servicios-card" : undefined}
                className="group flex flex-col justify-between rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white/90 dark:bg-slate-900/90 p-5 shadow-xs hover:shadow-md hover:border-primary/40 transition-all duration-300"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 border border-slate-200/50 dark:border-white/5">
                      {item.category || "General"}
                    </span>
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
                    <span className="text-[10px] opacity-75">
                      {item.hasPromo ? "Modificar" : "+"}
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
                      onClick={() => handleDeleteService(item.id, item.name)}
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

      {/* Modal: Service Create / Edit */}
      <Modal
        open={serviceModalOpen}
        onClose={() => setServiceModalOpen(false)}
        title={editingService ? `Editar: ${editingService.name}` : "Nuevo Servicio en Catálogo"}
      >
        <form onSubmit={handleSaveService} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">
              Nombre del Servicio *
            </label>
            <input
              type="text"
              required
              placeholder="Ej: Corte Fade Clásico + Barba"
              value={serviceForm.name}
              onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })}
              className="w-full rounded-xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900 px-3.5 py-2 text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-primary focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">
                Categoría
              </label>
              <select
                value={serviceForm.category}
                onChange={(e) => setServiceForm({ ...serviceForm, category: e.target.value })}
                className="w-full rounded-xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900 px-3 py-2 text-slate-900 dark:text-white focus:border-primary focus:outline-none"
              >
                <option value="Peluquería">Peluquería</option>
                <option value="Barbería">Barbería</option>
                <option value="Color">Color</option>
                <option value="Tratamiento">Tratamiento</option>
                <option value="Estética">Estética</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">
                Duración (minutos)
              </label>
              <input
                type="number"
                min="5"
                step="5"
                value={serviceForm.durationMin}
                onChange={(e) =>
                  setServiceForm({ ...serviceForm, durationMin: Number(e.target.value) })
                }
                className="w-full rounded-xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900 px-3 py-2 text-slate-900 dark:text-white focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">
              Precio Estándar (Gs.) *
            </label>
            <input
              type="number"
              min="0"
              step="5000"
              required
              value={serviceForm.price}
              onChange={(e) => setServiceForm({ ...serviceForm, price: Number(e.target.value) })}
              className="w-full rounded-xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900 px-3.5 py-2 text-slate-900 dark:text-white font-mono font-bold focus:border-primary focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">
              Descripción o Detalle (opcional)
            </label>
            <textarea
              rows={2}
              placeholder="Detallá qué incluye el servicio para tus clientes..."
              value={serviceForm.description}
              onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
              className="w-full rounded-xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900 px-3.5 py-2 text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-primary focus:outline-none"
            />
          </div>

          {/* Promoción o Descuento */}
          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BadgePercent className="h-4 w-4 text-amber-500" />
                <span className="font-bold text-slate-900 dark:text-white text-xs">
                  Promoción o Descuento Flash
                </span>
              </div>
              <input
                type="checkbox"
                id="hasPromoToggle"
                checked={serviceForm.hasPromo}
                onChange={(e) => setServiceForm({ ...serviceForm, hasPromo: e.target.checked })}
                className="h-4 w-4 rounded border-slate-300 text-amber-500 focus:ring-amber-500 cursor-pointer"
              />
            </div>

            {serviceForm.hasPromo && (
              <div className="space-y-3 pt-2 border-t border-amber-500/20 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Precio Promocional (Gs.)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="5000"
                      value={serviceForm.promoPrice}
                      onChange={(e) =>
                        setServiceForm({ ...serviceForm, promoPrice: Number(e.target.value) })
                      }
                      className="w-full rounded-xl border border-amber-500/30 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs text-slate-900 dark:text-white font-mono focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Etiqueta
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: -20% OFF"
                      value={serviceForm.promoBadge}
                      onChange={(e) =>
                        setServiceForm({ ...serviceForm, promoBadge: e.target.value })
                      }
                      className="w-full rounded-xl border border-amber-500/30 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setServiceModalOpen(false)}
              className="rounded-xl border border-slate-200/80 dark:border-white/10 px-4 py-2 font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="rounded-xl bg-primary px-5 py-2 font-bold text-white shadow-md hover:opacity-95 transition cursor-pointer"
            >
              {editingService ? "Guardar Cambios" : "Crear Servicio"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
