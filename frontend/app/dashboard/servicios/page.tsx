"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Copy,
  Pencil,
  Trash2,
  Scissors,
  Sparkles,
  Plus,
  Search,
  Coins,
  Clock,
  Users,
  ArrowRight,
} from "lucide-react";
import { useDashboardStore } from "@/store/useDashboardStore";
import Card from "@/components/dashboard/ui/Card";
import StatCard from "@/components/dashboard/ui/StatCard";
import Modal from "@/components/dashboard/ui/Modal";
import { formatGs } from "@/lib/dashboard-dates";
import type { ServiceItem } from "@/lib/dashboard-types";

const SERVICE_CATEGORIES = ["Todas", "Peluquería", "Barbería", "Color", "Tratamiento", "Estética"] as const;

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
  const [categoryFilter, setCategoryFilter] = useState<string>("Todas");

  // Service Modal state
  const [serviceModalOpen, setServiceModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);
  const [serviceForm, setServiceForm] = useState({
    name: "",
    category: "Peluquería",
    durationMin: 45,
    price: 85000,
    description: "",
    image: "scissors",
    hasPromo: false,
    promoPrice: 65000,
    promoBadge: "-20% OFF",
    promoType: "quantity" as "quantity" | "time",
    promoLimitQuantity: 5,
    promoLimitHours: 24,
  });

  // Filtered Services
  const filteredServices = useMemo(() => {
    return services.filter((s) => {
      const matchSearch =
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.description.toLowerCase().includes(search.toLowerCase()) ||
        (s.category && s.category.toLowerCase().includes(search.toLowerCase()));
      const matchCat =
        categoryFilter === "Todas" ||
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

  // Handlers for Services
  function handleOpenCreateService() {
    setEditingService(null);
    setServiceForm({
      name: "",
      category: "Peluquería",
      durationMin: 40,
      price: 80000,
      description: "",
      image: "scissors",
      hasPromo: false,
      promoPrice: 65000,
      promoBadge: "-20% OFF",
      promoType: "quantity",
      promoLimitQuantity: 5,
      promoLimitHours: 24,
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
      image: s.image,
      hasPromo: openForPromo ? true : !!s.hasPromo,
      promoPrice: s.promoPrice || Math.round(s.price * 0.8),
      promoBadge: s.promoBadge || "-20% OFF",
      promoType: s.promoType || "quantity",
      promoLimitQuantity: s.promoLimitQuantity || 5,
      promoLimitHours: s.promoLimitHours || 24,
    });
    setServiceModalOpen(true);
  }

  function handleSaveService(e: React.FormEvent) {
    e.preventDefault();
    if (!serviceForm.name.trim()) {
      pushToast("error", "Por favor ingresá el nombre del servicio.");
      return;
    }

    const promoPayload = {
      hasPromo: serviceForm.hasPromo,
      promoPrice: serviceForm.hasPromo ? Number(serviceForm.promoPrice) || 0 : undefined,
      promoBadge: serviceForm.hasPromo ? serviceForm.promoBadge : undefined,
      promoType: serviceForm.hasPromo ? serviceForm.promoType : undefined,
      promoLimitQuantity: serviceForm.hasPromo ? Number(serviceForm.promoLimitQuantity) || 5 : undefined,
      promoLimitHours: serviceForm.hasPromo ? Number(serviceForm.promoLimitHours) || 24 : undefined,
    };

    if (editingService) {
      updateService(editingService.id, {
        name: serviceForm.name.trim(),
        category: serviceForm.category,
        durationMin: Number(serviceForm.durationMin) || 30,
        price: Number(serviceForm.price) || 0,
        description: serviceForm.description.trim(),
        image: serviceForm.image,
        ...promoPayload,
      });
      pushToast("success", `Servicio "${serviceForm.name}" actualizado`);
    } else {
      addService({
        name: serviceForm.name.trim(),
        category: serviceForm.category,
        durationMin: Number(serviceForm.durationMin) || 30,
        price: Number(serviceForm.price) || 0,
        description: serviceForm.description.trim(),
        image: serviceForm.image,
        ...promoPayload,
      });
      pushToast("success", `Servicio "${serviceForm.name}" creado con éxito`);
    }
    setServiceModalOpen(false);
  }

  function handleDeleteService(id: string, name: string) {
    if (confirm(`¿Estás seguro de eliminar el servicio "${name}"?`)) {
      removeService(id);
      pushToast("success", "Servicio eliminado del catálogo");
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            Servicios & Precios
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 sm:text-sm">
            Configurá tu catálogo de atención, duraciones en minutos, precios en Guaraníes y promociones.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreateService}
          className="inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-primary/25 hover:opacity-95 transition w-fit"
        >
          <Plus className="h-4 w-4" />
          <span>Nuevo Servicio</span>
        </button>
      </div>

      {/* Staff Delegation Banner (Ensures Single Source of Truth for Team) */}
      <div className="flex items-center justify-between rounded-2xl border border-indigo-200/80 dark:border-indigo-800/40 bg-indigo-50/70 dark:bg-indigo-950/30 p-3.5 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white font-bold">
            <Users className="h-4 w-4" />
          </div>
          <div>
            <p className="text-xs font-bold text-indigo-950 dark:text-indigo-200">
              ¿Buscás administrar colaboradores, horarios y comisiones?
            </p>
            <p className="text-[11px] text-indigo-700/80 dark:text-indigo-400">
              El equipo operativo se gestiona de forma centralizada en el módulo de Equipo.
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
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="Total Servicios en Menú"
          value={`${services.length} items`}
          icon={Scissors}
          delta={services.length}
        />
        <StatCard
          label="Precio Promedio por Turno"
          value={formatGs(avgPrice)}
          icon={Coins}
        />
        <StatCard
          label="Colaboradores Asignables"
          value={`${activeStaffCount} en equipo`}
          icon={Users}
        />
      </div>

      {/* Search Bar & Category Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
          {SERVICE_CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategoryFilter(cat)}
              className={`rounded-2xl border px-3.5 py-1.5 text-xs font-bold transition shrink-0 ${
                categoryFilter === cat
                  ? "border-primary bg-primary/10 text-primary"
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
            placeholder="Buscar por nombre o detalle..."
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
            {services.length === 0 ? "No tenés servicios todavía" : "No encontramos servicios en esta categoría"}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
            {services.length === 0
              ? "Agregá tu primer servicio para comenzar a recibir reservas en tu portal y agendar citas."
              : "Probá cambiando la categoría o limpiá la búsqueda para ver otros servicios."}
          </p>
          <button
            type="button"
            onClick={handleOpenCreateService}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:opacity-95 transition"
          >
            <Plus className="h-4 w-4" />
            <span>+ Crear servicio</span>
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredServices.map((item) => (
            <Card
              key={item.id}
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
                    {formatGs(item.hasPromo && item.promoPrice ? item.promoPrice : item.price)}
                  </span>
                  {item.hasPromo && item.promoPrice && (
                    <span className="text-xs text-slate-400 line-through font-mono">
                      {formatGs(item.price)}
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-5 space-y-3 pt-3.5 border-t border-slate-100 dark:border-white/5">
                {/* Promo Badge */}
                {item.hasPromo && (
                  <div className="flex items-center justify-between rounded-xl bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 text-xs text-amber-800 dark:text-amber-300 font-bold">
                    <span className="flex items-center gap-1">
                      <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                      Promo: {item.promoBadge || "-20% OFF"}
                    </span>
                    <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400">
                      Activa
                    </span>
                  </div>
                )}

                {/* Promo Switch button */}
                <button
                  type="button"
                  onClick={() => handleOpenEditService(item, !item.hasPromo)}
                  className={`w-full flex items-center justify-center gap-1.5 rounded-xl py-1.5 px-3 text-xs font-bold transition cursor-pointer ${
                    item.hasPromo
                      ? "border border-amber-500/40 bg-amber-500/15 text-amber-800 dark:text-amber-200 hover:bg-amber-500/25"
                      : "border border-slate-200/80 dark:border-white/10 bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 hover:border-amber-500/40 hover:text-amber-600 dark:hover:text-amber-300"
                  }`}
                >
                  <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                  <span>
                    {item.hasPromo
                      ? `Promo Configurada: ${item.promoBadge || "-20% OFF"}`
                      : "+ Activar Promoción / Descuento"}
                  </span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={async () => {
                      const url = `${window.location.origin}/${business.slug || "barberia"}/reservar?service=${item.id}`;
                      await navigator.clipboard.writeText(url);
                      pushToast("success", `Enlace directo de "${item.name}" copiado`);
                    }}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200/80 dark:border-white/10 bg-slate-50 dark:bg-slate-800/80 py-2 px-3 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-primary hover:text-white hover:border-primary transition duration-200"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    <span>Compartir Link</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenEditService(item)}
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200/80 dark:border-white/10 bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 hover:text-primary hover:border-primary/50 transition"
                    title="Editar servicio"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteService(item.id, item.name)}
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-rose-200/60 dark:border-rose-900/40 bg-rose-50/50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/50 transition"
                    title="Eliminar servicio"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
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
              placeholder="Ej: Corte Fade Premium + Barba"
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
              Descripción del Servicio
            </label>
            <textarea
              rows={2}
              placeholder="Detallá qué incluye el servicio para que el cliente lo vea en su reserva..."
              value={serviceForm.description}
              onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
              className="w-full rounded-xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900 px-3.5 py-2 text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-primary focus:outline-none"
            />
          </div>

          {/* Promociones / Flash Offers */}
          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-500" />
                <span className="font-bold text-slate-900 dark:text-white text-xs">
                  Promoción o Descuento Flash
                </span>
              </div>
              <input
                type="checkbox"
                id="hasPromoToggle"
                checked={serviceForm.hasPromo}
                onChange={(e) => setServiceForm({ ...serviceForm, hasPromo: e.target.checked })}
                className="h-4 w-4 rounded border-slate-300 text-amber-500 focus:ring-amber-500"
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
                      Texto del Distintivo
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
              className="rounded-xl border border-slate-200/80 dark:border-white/10 px-4 py-2 font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="rounded-xl bg-primary px-5 py-2 font-bold text-white shadow-md hover:opacity-95 transition"
            >
              {editingService ? "Guardar Cambios" : "Crear Servicio"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
