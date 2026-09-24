"use client";

import { useMemo, useState } from "react";
import {
  Copy,
  Pencil,
  Trash2,
  Scissors,
  Sparkles,
  Plus,
  Search,
  Check,
  UserCheck,
  UserX,
  Clock,
  Coins,
  Percent,
  Tag,
  ShieldCheck,
} from "lucide-react";
import { useDashboardStore } from "@/store/useDashboardStore";
import Card from "@/components/dashboard/ui/Card";
import StatCard from "@/components/dashboard/ui/StatCard";
import Modal from "@/components/dashboard/ui/Modal";
import { formatGs } from "@/lib/dashboard-dates";
import type { ServiceItem, StaffMember } from "@/lib/dashboard-types";

const SERVICE_CATEGORIES = ["Todas", "Peluquería", "Barbería", "Color", "Tratamiento"] as const;

export default function ServiciosPage() {
  const {
    services,
    staff,
    addService,
    updateService,
    removeService,
    addStaff,
    updateStaff,
    deleteStaff,
    toggleStaff,
    pushToast,
    business,
  } = useDashboardStore();

  const [tab, setTab] = useState<"servicios" | "personal">("servicios");
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
  });

  // Staff Modal state
  const [staffModalOpen, setStaffModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [staffForm, setStaffForm] = useState({
    name: "",
    role: "Barbero & Estilista",
    description: "Atención profesional y asesoría personalizada.",
    avatar: "AG",
    color: "#6366f1",
    active: true,
    hours: "09:00 – 19:00",
    commissionPercentage: 50,
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

  // Filtered Staff
  const filteredStaff = useMemo(() => {
    return staff.filter(
      (m) =>
        m.name.toLowerCase().includes(search.toLowerCase()) ||
        m.role.toLowerCase().includes(search.toLowerCase()) ||
        m.description.toLowerCase().includes(search.toLowerCase()),
    );
  }, [staff, search]);

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
    });
    setServiceModalOpen(true);
  }

  function handleOpenEditService(s: ServiceItem) {
    setEditingService(s);
    setServiceForm({
      name: s.name,
      category: s.category || "Peluquería",
      durationMin: s.durationMin,
      price: s.price,
      description: s.description,
      image: s.image,
    });
    setServiceModalOpen(true);
  }

  function handleSaveService(e: React.FormEvent) {
    e.preventDefault();
    if (!serviceForm.name.trim()) {
      pushToast("error", "Por favor ingresá el nombre del servicio.");
      return;
    }

    if (editingService) {
      updateService(editingService.id, {
        name: serviceForm.name.trim(),
        category: serviceForm.category,
        durationMin: Number(serviceForm.durationMin) || 30,
        price: Number(serviceForm.price) || 0,
        description: serviceForm.description.trim(),
        image: serviceForm.image,
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

  // Handlers for Staff
  function handleOpenCreateStaff() {
    setEditingStaff(null);
    setStaffForm({
      name: "",
      role: "Estilista / Barbero",
      description: "Especialista en cortes y diseño de estilo.",
      avatar: "EB",
      color: "#6366f1",
      active: true,
      hours: "09:00 – 19:00",
      commissionPercentage: 50,
    });
    setStaffModalOpen(true);
  }

  function handleOpenEditStaff(member: StaffMember) {
    setEditingStaff(member);
    setStaffForm({
      name: member.name,
      role: member.role,
      description: member.description,
      avatar: member.avatar,
      color: member.color,
      active: member.active,
      hours: member.hours,
      commissionPercentage: member.commissionPercentage,
    });
    setStaffModalOpen(true);
  }

  function handleSaveStaff(e: React.FormEvent) {
    e.preventDefault();
    if (!staffForm.name.trim()) {
      pushToast("error", "El nombre del profesional es obligatorio.");
      return;
    }

    const initials = staffForm.name
      .split(" ")
      .map((w) => w[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase();

    if (editingStaff) {
      updateStaff(editingStaff.id, {
        name: staffForm.name.trim(),
        role: staffForm.role.trim(),
        description: staffForm.description.trim(),
        avatar: initials || staffForm.avatar,
        color: staffForm.color,
        active: staffForm.active,
        hours: staffForm.hours,
        commissionPercentage: Number(staffForm.commissionPercentage) || 50,
      });
      pushToast("success", `Profesional "${staffForm.name}" actualizado`);
    } else {
      addStaff({
        name: staffForm.name.trim(),
        role: staffForm.role.trim(),
        description: staffForm.description.trim(),
        avatar: initials || "ST",
        color: staffForm.color,
        active: staffForm.active,
        hours: staffForm.hours,
        commissionPercentage: Number(staffForm.commissionPercentage) || 50,
      });
      pushToast("success", `Profesional "${staffForm.name}" incorporado`);
    }
    setStaffModalOpen(false);
  }

  function handleDeleteStaff(id: string, name: string) {
    if (confirm(`¿Eliminar al profesional "${name}" del equipo?`)) {
      deleteStaff(id);
      pushToast("success", "Profesional eliminado");
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            Catálogo & Equipo Operativo
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 sm:text-sm">
            Gestioná los servicios ofrecidos, tiempos de atención, precios en Gs. y profesionales del local.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {tab === "servicios" ? (
            <button
              type="button"
              onClick={handleOpenCreateService}
              className="inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-2.5 text-xs font-bold text-white shadow-[0_4px_15px_rgba(99,102,241,0.25)] hover:opacity-95 transition"
            >
              <Plus className="h-4 w-4" />
              <span>Nuevo Servicio</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleOpenCreateStaff}
              className="inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-2.5 text-xs font-bold text-white shadow-[0_4px_15px_rgba(99,102,241,0.25)] hover:opacity-95 transition"
            >
              <Plus className="h-4 w-4" />
              <span>Nuevo Profesional</span>
            </button>
          )}
        </div>
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
          label="Profesionales en Turno"
          value={`${activeStaffCount} de ${staff.length} activos`}
          icon={UserCheck}
        />
      </div>

      {/* Tab Switcher & Search Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex rounded-2xl border border-slate-200/80 dark:border-white/10 p-1 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-xs w-fit">
          <button
            type="button"
            onClick={() => setTab("servicios")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition duration-200 ${
              tab === "servicios"
                ? "bg-primary text-white shadow-[0_2px_10px_rgba(99,102,241,0.3)]"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Scissors className="h-3.5 w-3.5" />
            <span>Servicios & Precios ({services.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setTab("personal")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition duration-200 ${
              tab === "personal"
                ? "bg-primary text-white shadow-[0_2px_10px_rgba(99,102,241,0.3)]"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <UserCheck className="h-3.5 w-3.5" />
            <span>Equipo & Profesionales ({staff.length})</span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={tab === "servicios" ? "Buscar servicio o categoría..." : "Buscar profesional..."}
            className="w-full rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-slate-900/80 pl-9 pr-3.5 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-primary focus:outline-none backdrop-blur-xl"
          />
        </div>
      </div>

      {/* Category Pills (Only in Servicios Tab) */}
      {tab === "servicios" && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {SERVICE_CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategoryFilter(cat)}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition ${
                categoryFilter === cat
                  ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs"
                  : "bg-white/80 dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 border border-slate-200/80 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Services Grid */}
      {tab === "servicios" && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredServices.map((item) => (
            <Card
              key={item.id}
              className="flex flex-col justify-between hover:-translate-y-1 transition-all duration-300"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-primary/20 to-primary/5 text-primary shadow-xs">
                    {item.image === "scissors" ? (
                      <Scissors className="h-6 w-6" />
                    ) : (
                      <Sparkles className="h-6 w-6" />
                    )}
                  </div>
                  {item.category && (
                    <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 text-[10px] font-bold text-slate-600 dark:text-slate-300">
                      {item.category}
                    </span>
                  )}
                </div>

                <div className="mt-3">
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    {item.name}
                  </h3>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                    {item.description || "Servicio profesional en cabina o sillón."}
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/5 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                    <Clock className="h-3.5 w-3.5 text-slate-400" />
                    {item.durationMin} minutos
                  </span>
                  <strong className="text-base font-black text-primary">
                    {formatGs(item.price)}
                  </strong>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={async () => {
                      const url = `${window.location.origin}/${business.slug || "barberia"}/reservar?service=${item.id}`;
                      await navigator.clipboard.writeText(url);
                      pushToast("success", `Enlace directo de "${item.name}" copiado`);
                    }}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200/80 dark:border-white/10 bg-white/60 dark:bg-slate-800/60 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  >
                    <Copy className="h-3.5 w-3.5 text-slate-400" />
                    <span>Compartir</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenEditService(item)}
                    className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200/80 dark:border-white/10 bg-white/60 dark:bg-slate-800/60 text-slate-700 dark:text-slate-200 hover:text-primary transition"
                    title="Editar servicio"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteService(item.id, item.name)}
                    className="flex h-8 w-8 items-center justify-center rounded-xl border border-rose-200/60 dark:border-rose-900/40 bg-rose-50/50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 hover:bg-rose-100 transition"
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

      {/* Staff Grid */}
      {tab === "personal" && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredStaff.map((person) => (
            <Card
              key={person.id}
              className="flex flex-col justify-between hover:-translate-y-1 transition-all duration-300"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span
                      className="flex h-12 w-12 items-center justify-center rounded-2xl text-sm font-black text-white shadow-md"
                      style={{ background: person.color }}
                    >
                      {person.avatar}
                    </span>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white text-base">
                        {person.name}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {person.role}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      toggleStaff(person.id);
                      pushToast(
                        "success",
                        person.active
                          ? `${person.name} puesto en pausa`
                          : `${person.name} activado para reservas`,
                      );
                    }}
                    className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase transition ${
                      person.active
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                        : "bg-slate-200/60 dark:bg-slate-800 text-slate-500 border border-slate-300/40"
                    }`}
                  >
                    {person.active ? "Activo" : "En pausa"}
                  </button>
                </div>

                <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                  {person.description || "Profesional certificado."}
                </p>

                <div className="mt-3 rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 p-3 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                    <span className="flex items-center gap-1 text-slate-400">
                      <Clock className="h-3.5 w-3.5" /> Horario:
                    </span>
                    <strong className="font-semibold text-slate-800 dark:text-slate-200">
                      {person.hours}
                    </strong>
                  </div>
                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                    <span className="flex items-center gap-1 text-slate-400">
                      <Percent className="h-3.5 w-3.5" /> Comisión:
                    </span>
                    <strong className="font-semibold text-primary">
                      {person.commissionPercentage}%
                    </strong>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => handleOpenEditStaff(person)}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200/80 dark:border-white/10 bg-white/60 dark:bg-slate-800/60 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  <Pencil className="h-3.5 w-3.5 text-slate-400" />
                  <span>Editar Perfil</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDeleteStaff(person.id, person.name)}
                  className="flex h-8 w-8 items-center justify-center rounded-xl border border-rose-200/60 dark:border-rose-900/40 bg-rose-50/50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 hover:bg-rose-100 transition"
                  title="Eliminar profesional"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
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

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">
                Precio (Guaraníes Gs.) *
              </label>
              <input
                type="number"
                min="0"
                step="5000"
                required
                value={serviceForm.price}
                onChange={(e) => setServiceForm({ ...serviceForm, price: Number(e.target.value) })}
                className="w-full rounded-xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900 px-3 py-2 text-slate-900 dark:text-white focus:border-primary focus:outline-none font-bold text-primary"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">
                Ícono
              </label>
              <select
                value={serviceForm.image}
                onChange={(e) => setServiceForm({ ...serviceForm, image: e.target.value })}
                className="w-full rounded-xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900 px-3 py-2 text-slate-900 dark:text-white focus:border-primary focus:outline-none"
              >
                <option value="scissors">Tijeras / Corte</option>
                <option value="sparkles">Estrellas / Tratamiento</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">
              Descripción del Servicio
            </label>
            <textarea
              rows={2}
              placeholder="Detalles que verá el cliente al momento de agendarse..."
              value={serviceForm.description}
              onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
              className="w-full rounded-xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900 px-3.5 py-2 text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-primary focus:outline-none"
            />
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

      {/* Modal: Staff Create / Edit */}
      <Modal
        open={staffModalOpen}
        onClose={() => setStaffModalOpen(false)}
        title={editingStaff ? `Editar: ${editingStaff.name}` : "Nuevo Profesional"}
      >
        <form onSubmit={handleSaveStaff} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">
              Nombre Completo *
            </label>
            <input
              type="text"
              required
              placeholder="Ej: Rodrigo Martínez"
              value={staffForm.name}
              onChange={(e) => setStaffForm({ ...staffForm, name: e.target.value })}
              className="w-full rounded-xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900 px-3.5 py-2 text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-primary focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">
                Especialidad / Cargo
              </label>
              <input
                type="text"
                placeholder="Ej: Master Colorist"
                value={staffForm.role}
                onChange={(e) => setStaffForm({ ...staffForm, role: e.target.value })}
                className="w-full rounded-xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900 px-3 py-2 text-slate-900 dark:text-white focus:border-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">
                Horario de Atención
              </label>
              <input
                type="text"
                placeholder="09:00 – 19:00"
                value={staffForm.hours}
                onChange={(e) => setStaffForm({ ...staffForm, hours: e.target.value })}
                className="w-full rounded-xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900 px-3 py-2 text-slate-900 dark:text-white focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">
                % Comisión Acordado
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={staffForm.commissionPercentage}
                onChange={(e) =>
                  setStaffForm({ ...staffForm, commissionPercentage: Number(e.target.value) })
                }
                className="w-full rounded-xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900 px-3 py-2 text-slate-900 dark:text-white focus:border-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">
                Color de Identificación
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={staffForm.color}
                  onChange={(e) => setStaffForm({ ...staffForm, color: e.target.value })}
                  className="h-9 w-12 cursor-pointer rounded-lg border border-slate-200/80 dark:border-white/10 p-0.5"
                />
                <span className="font-mono text-[11px] text-slate-400">{staffForm.color}</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">
              Descripción Breve
            </label>
            <textarea
              rows={2}
              placeholder="Breve reseña sobre su experiencia o servicios destacados..."
              value={staffForm.description}
              onChange={(e) => setStaffForm({ ...staffForm, description: e.target.value })}
              className="w-full rounded-xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900 px-3.5 py-2 text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-primary focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setStaffModalOpen(false)}
              className="rounded-xl border border-slate-200/80 dark:border-white/10 px-4 py-2 font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="rounded-xl bg-primary px-5 py-2 font-bold text-white shadow-md hover:opacity-95 transition"
            >
              {editingStaff ? "Guardar Cambios" : "Guardar Profesional"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
