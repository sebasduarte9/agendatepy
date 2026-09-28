"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Users,
  Search,
  Plus,
  Phone,
  MessageCircle,
  FileSpreadsheet,
  Calendar,
  Sparkles,
  Edit2,
  Trash2,
  UserCheck,
  Star,
  MessagesSquare,
  CalendarPlus,
} from "lucide-react";
import { formatInTimeZone } from "date-fns-tz";
import { useDashboardStore } from "@/store/useDashboardStore";
import Card from "@/components/dashboard/ui/Card";
import Modal from "@/components/dashboard/ui/Modal";
import StatCard from "@/components/dashboard/ui/StatCard";
import ClientFichaModal from "@/components/dashboard/ClientFichaModal";
import QuickBookingModal from "@/components/dashboard/QuickBookingModal";
import { formatGs, normalizeParaguayPhone } from "@/lib/dashboard-dates";
import type { Client } from "@/lib/dashboard-types";

export default function ClientesPage() {
  const { clients, appointments, services, business, addClient, updateClient, deleteClient, pushToast } =
    useDashboardStore();
  const [search, setSearch] = useState("");
  const [selectedTag, setSelectedTag] = useState<string>("todos");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [quickBookingOpen, setQuickBookingOpen] = useState(false);
  const [quickBookingClient, setQuickBookingClient] = useState<Client | null>(null);

  function handleOpenQuickBooking(c: Client) {
    setQuickBookingClient(c);
    setQuickBookingOpen(true);
  }

  const activeFichaClient = useMemo(
    () => clients.find((c) => c.id === selectedClient?.id) || selectedClient,
    [clients, selectedClient]
  );

  // Form state for creating / editing
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    instagram: "",
    messengerId: "",
    notes: "",
    formula: "",
    tags: "Frecuente",
  });

  const filteredClients = useMemo(() => {
    const cleanSearch = search.trim();
    const normSearch = cleanSearch ? normalizeParaguayPhone(cleanSearch) : "";
    const searchDigits = cleanSearch.replace(/\D/g, "");

    return clients.filter((c) => {
      const cNormPhone = normalizeParaguayPhone(c.phone) || c.phone;
      const cDigits = c.phone.replace(/\D/g, "");

      const matchesSearch =
        !cleanSearch ||
        c.name.toLowerCase().includes(cleanSearch.toLowerCase()) ||
        c.phone.includes(cleanSearch) ||
        (normSearch && cNormPhone.includes(normSearch)) ||
        (searchDigits.length >= 4 && cDigits.includes(searchDigits)) ||
        (c.formula && c.formula.toLowerCase().includes(cleanSearch.toLowerCase())) ||
        (c.notes && c.notes.toLowerCase().includes(cleanSearch.toLowerCase()));

      const matchesTag =
        selectedTag === "todos" ||
        c.tags.some((t) => t.toLowerCase() === selectedTag.toLowerCase());

      return matchesSearch && matchesTag;
    });
  }, [clients, search, selectedTag]);

  const totalSpentAll = clients.reduce((acc, c) => acc + c.totalSpent, 0);
  const avgSpent = clients.length > 0 ? Math.round(totalSpentAll / clients.length) : 0;
  const vipCount = clients.filter((c) => c.tags.includes("VIP")).length;

  function openCreateModal() {
    setEditingClient(null);
    setForm({
      name: "",
      phone: "+595",
      email: "",
      instagram: "",
      messengerId: "",
      notes: "",
      formula: "",
      tags: "Nuevo",
    });
    setModalOpen(true);
  }

  function openEditModal(c: Client) {
    setEditingClient(c);
    setForm({
      name: c.name,
      phone: c.phone,
      email: c.email,
      instagram: c.instagram || "",
      messengerId: c.messengerId || "",
      notes: c.notes,
      formula: c.formula || "",
      tags: c.tags[0] || "Frecuente",
    });
    setModalOpen(true);
  }

  function handleSave() {
    if (!form.name.trim() || !form.phone.trim()) {
      pushToast("error", "Completá al menos el nombre y teléfono del cliente.");
      return;
    }

    const normPhone = normalizeParaguayPhone(form.phone.trim());

    if (editingClient) {
      updateClient(editingClient.id, {
        name: form.name.trim(),
        phone: normPhone,
        email: form.email.trim(),
        instagram: form.instagram.trim() || undefined,
        messengerId: form.messengerId.trim() || undefined,
        notes: form.notes.trim(),
        formula: form.formula.trim(),
        tags: [form.tags],
      });
      pushToast("success", "Ficha de cliente actualizada.");
    } else {
      addClient({
        name: form.name.trim(),
        phone: normPhone,
        email: form.email.trim(),
        instagram: form.instagram.trim() || undefined,
        messengerId: form.messengerId.trim() || undefined,
        notes: form.notes.trim(),
        formula: form.formula.trim(),
        totalVisits: 0,
        totalSpent: 0,
        lastVisit: new Date().toISOString(),
        tags: [form.tags],
        loyaltyPoints: 0,
        loyaltyRedeemed: 0,
      });
      pushToast("success", "Cliente agregado con éxito.");
    }
    setModalOpen(false);
  }

  function exportCSV() {
    const headers = ["Nombre", "Teléfono", "Email", "Total Visitas", "Total Gastado (Gs)", "Ficha Técnica", "Notas"];
    const rows = clients.map((c) => [
      `"${c.name}"`,
      `"${c.phone}"`,
      `"${c.email}"`,
      c.totalVisits,
      c.totalSpent,
      `"${(c.formula || "").replace(/"/g, '""')}"`,
      `"${(c.notes || "").replace(/"/g, '""')}"`,
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `clientes_${business.slug}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    pushToast("success", "Base de clientes exportada en CSV.");
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div data-tour="clientes-header" className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            Clientes
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Directorio de clientes, historial de visitas y ficha técnica privada.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={exportCSV}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 shadow-2xs transition hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer"
          >
            <FileSpreadsheet className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            Exportar CSV
          </button>
          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-2 text-xs font-bold text-white shadow-md shadow-primary/25 transition hover:opacity-95 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Nuevo Cliente
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div data-tour="clientes-kpis" className="grid gap-4 md:grid-cols-3">
        <StatCard
          label="Total de Clientes"
          value={String(clients.length)}
          icon={Users}
        />
        <StatCard
          label="Clientes VIP / Frecuentes"
          value={String(vipCount)}
          icon={Sparkles}
        />
        <StatCard
          label="Gasto Promedio por Cliente"
          value={formatGs(avgSpent)}
          icon={UserCheck}
        />
      </div>

      {/* Search and Filters */}
      <div data-tour="clientes-search" className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nombre, teléfono, notas o fórmula técnica..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 py-2.5 pl-10 pr-4 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <div className="flex gap-1.5 overflow-x-auto">
          {["todos", "VIP", "Frecuente", "Nuevo"].map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => setSelectedTag(tag)}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-bold capitalize transition-all duration-200 cursor-pointer ${
                selectedTag === tag
                  ? "bg-primary text-white shadow-xs"
                  : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Clients Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredClients.map((client, index) => {
          const initials = client.name
            .split(" ")
            .map((n) => n[0])
            .slice(0, 2)
            .join("")
            .toUpperCase();
          const cleanPhone = client.phone.replace(/\D/g, "");
          const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
            `¡Hola ${client.name}! Te escribimos desde ${business.name}. ¿Cómo estás?`
          )}`;

          return (
            <Card
              key={client.id}
              data-tour={index === 0 ? "clientes-card" : undefined}
              className="flex flex-col justify-between space-y-4 hover:border-primary/40 transition"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-sm font-bold text-primary">
                      {initials}
                    </span>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white">{client.name}</h3>
                      <div className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-500">
                        <Phone className="h-3 w-3" />
                        <span>{client.phone}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {client.tags.map((t) => (
                      <span
                        key={t}
                        className={`rounded-lg px-2 py-0.5 text-[10px] font-bold ${
                          t === "VIP"
                            ? "bg-amber-100 text-amber-800"
                            : t === "Frecuente"
                            ? "bg-indigo-100 text-indigo-800"
                            : "bg-emerald-100 text-emerald-800"
                        }`}
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Multi-channel handles bar */}
                <div className="mt-3 flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100 dark:border-white/5 text-[11px]">
                  {/* WhatsApp badge */}
                  <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/40 px-2 py-0.5 font-mono text-emerald-700 dark:text-emerald-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    WA: {cleanPhone.slice(-4)}
                  </span>

                  {/* Instagram badge */}
                  {client.instagram && (
                    <a
                      href={`https://instagram.com/${client.instagram.replace("@", "")}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 rounded-lg bg-pink-50 dark:bg-pink-950/60 border border-pink-200 dark:border-pink-800/40 px-2 py-0.5 font-mono text-pink-700 dark:text-pink-300 hover:underline"
                    >
                      IG: {client.instagram}
                    </a>
                  )}

                  {/* Messenger badge */}
                  {client.messengerId && (
                    <span className="inline-flex items-center gap-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/40 px-2 py-0.5 font-mono text-blue-700 dark:text-blue-400">
                      FB: {client.messengerId}
                    </span>
                  )}
                </div>

                {/* Technical formula badge / alert */}
                {client.formula && (
                  <div className="mt-3.5 rounded-xl border border-indigo-100 bg-indigo-50/70 p-2.5 text-xs text-indigo-950">
                    <span className="font-bold text-indigo-700 flex items-center gap-1">
                      <Sparkles className="h-3 w-3" /> Ficha Técnica:
                    </span>
                    <p className="mt-1 line-clamp-2 italic text-slate-700">{client.formula}</p>
                  </div>
                )}

                {/* Upcoming Appointment Indicator if scheduled */}
                {(() => {
                  const clientNormPhone = normalizeParaguayPhone(client.phone) || client.phone;
                  const clientApps = appointments.filter(
                    (a) =>
                      (a.clientId && a.clientId === client.id) ||
                      a.clientPhone === client.phone ||
                      normalizeParaguayPhone(a.clientPhone) === clientNormPhone ||
                      a.clientName.toLowerCase() === client.name.toLowerCase()
                  );
                  const nextApp = clientApps
                    .filter((a) => new Date(a.start).getTime() > Date.now() && a.status !== "cancelled" && a.status !== "no_show" && a.status !== "expired")
                    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())[0];

                  if (nextApp) {
                    return (
                      <div className="mt-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-2 text-[11px] text-emerald-800 dark:text-emerald-300 flex items-center justify-between">
                        <span className="truncate">
                          Próximo turno: <strong>{formatInTimeZone(nextApp.start, business.timezone || "America/Asuncion", "dd/MM HH:mm")} hs</strong>
                        </span>
                        <Link href={`/dashboard/calendario?appointmentId=${nextApp.id}`} className="text-emerald-600 font-bold hover:underline shrink-0 ml-1">
                          Ver →
                        </Link>
                      </div>
                    );
                  }
                  return (
                    <p className="mt-2 text-[11px] text-slate-400 italic">Sin turnos próximos agendados</p>
                  );
                })()}

                {/* Notes */}
                {client.notes && (
                  <p className="mt-2 text-xs text-slate-500 line-clamp-2">
                    <span className="font-medium text-slate-700 dark:text-slate-300">Nota:</span> {client.notes}
                  </p>
                )}
              </div>

              {/* Stats & Actions */}
              <div className="border-t border-border pt-3">
                <div className="mb-3 space-y-1 text-xs text-slate-500">
                  <div className="flex items-center justify-between">
                    <span>
                      Visitas: <strong className="text-slate-900 dark:text-white">{client.totalVisits}</strong>
                    </span>
                    <span>
                      Invertido: <strong className="text-primary">{formatGs(client.totalSpent)}</strong>
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>Última visita:</span>
                    <span className="font-medium text-slate-600 dark:text-slate-300">
                      {client.lastVisit && client.totalVisits > 0
                        ? formatInTimeZone(client.lastVisit, business.timezone || "America/Asuncion", "dd/MM/yyyy")
                        : "Sin visitas"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setSelectedClient(client)}
                    className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-slate-900 dark:bg-white dark:text-slate-900 text-white px-3 py-2 text-xs font-bold shadow-xs hover:opacity-90 transition cursor-pointer"
                  >
                    <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                    <span>Ver Ficha</span>
                  </button>

                  <button
                    type="button"
                    data-tour={index === 0 ? "clientes-agendar-btn" : undefined}
                    onClick={() => handleOpenQuickBooking(client)}
                    className="inline-flex items-center gap-1 rounded-xl bg-primary text-white px-3 py-2 text-xs font-bold shadow-xs hover:opacity-90 transition cursor-pointer"
                    title="Agendar turno directamente"
                  >
                    <Calendar className="h-3.5 w-3.5" />
                    <span>Agendar</span>
                  </button>

                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 p-2 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition"
                    title="Escribir por WhatsApp"
                  >
                    <MessageCircle className="h-3.5 w-3.5" />
                  </a>

                  <Link
                    href={`/${business.slug || "barberia"}/tarjeta/${client.id}`}
                    target="_blank"
                    className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 p-2 text-amber-500 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
                    title="Tarjeta Digital VIP"
                  >
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  </Link>

                  <button
                    type="button"
                    onClick={() => openEditModal(client)}
                    className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition cursor-pointer"
                    title="Editar datos del cliente"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {filteredClients.length === 0 && (
        <Card className="py-12 text-center">
          <Users className="mx-auto h-12 w-12 text-slate-300" />
          <h3 className="mt-3 font-bold text-slate-900 dark:text-white">
            {search ? "No encontramos clientes con ese criterio" : "No tenés clientes registrados todavía"}
          </h3>
          <p className="mt-1 text-sm text-slate-500 max-w-sm mx-auto">
            {search
              ? "Probá con otro término de búsqueda o limpiá los filtros."
              : "Registrá tu primer cliente para llevar su ficha técnica, historial de citas y puntos de fidelización."}
          </p>
          <div className="mt-4">
            <button
              type="button"
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-primary/25 hover:opacity-95 transition cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>+ Crear Cliente</span>
            </button>
          </div>
        </Card>
      )}

      {/* Modal: Client Details, Visit History, Media Gallery & Formulas */}
      <ClientFichaModal
        client={activeFichaClient}
        onClose={() => setSelectedClient(null)}
        onOpenEdit={openEditModal}
        onOpenQuickBooking={handleOpenQuickBooking}
      />

      {/* Quick Booking Modal: Stays right on this page! */}
      <QuickBookingModal
        open={quickBookingOpen}
        onClose={() => setQuickBookingOpen(false)}
        prefillClient={quickBookingClient}
      />

      {/* Modal: Create / Edit Client */}
      <Modal
        open={modalOpen}
        title={editingClient ? "Editar Ficha de Cliente" : "Nuevo Cliente"}
        onClose={() => setModalOpen(false)}
      >
        <div className="space-y-3.5 text-sm">
          <div>
            <label className="block text-xs font-semibold text-slate-700">Nombre Completo *</label>
            <input
              type="text"
              className="mt-1 w-full rounded-xl border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
              placeholder="Ej. Rodrigo Giménez"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700">WhatsApp / Teléfono *</label>
              <input
                type="text"
                className="mt-1 w-full rounded-xl border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
                placeholder="+595981..."
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700">Categoría</label>
              <select
                className="mt-1 w-full rounded-xl border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
                value={form.tags}
                onChange={(e) => setForm({ ...form, tags: e.target.value })}
              >
                <option value="Nuevo">Nuevo</option>
                <option value="Frecuente">Frecuente</option>
                <option value="VIP">VIP</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700">Instagram Handle (opcional)</label>
              <input
                type="text"
                className="mt-1 w-full rounded-xl border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
                placeholder="@usuario_py"
                value={form.instagram}
                onChange={(e) => setForm({ ...form, instagram: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700">Facebook Messenger (opcional)</label>
              <input
                type="text"
                className="mt-1 w-full rounded-xl border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
                placeholder="Usuario o ID Facebook"
                value={form.messengerId}
                onChange={(e) => setForm({ ...form, messengerId: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">Correo Electrónico (opcional)</label>
            <input
              type="email"
              className="mt-1 w-full rounded-xl border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
              placeholder="cliente@ejemplo.py"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">
              Ficha Técnica (Fórmula de tinte, corte, preferencias)
            </label>
            <textarea
              rows={3}
              className="mt-1 w-full rounded-xl border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
              placeholder="Ej: Fade medio a navaja / Tinte 7.1 con 20 volúmenes / Cuidado con piel sensible..."
              value={form.formula}
              onChange={(e) => setForm({ ...form, formula: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">Notas de Atención</label>
            <input
              type="text"
              className="mt-1 w-full rounded-xl border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
              placeholder="Ej: Prefiere turnos por la tarde, toma café negro..."
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </div>

          <div className="flex gap-2 pt-3">
            {editingClient && (
              <button
                type="button"
                onClick={() => {
                  if (confirm("¿Estás seguro de eliminar a este cliente?")) {
                    deleteClient(editingClient.id);
                    setModalOpen(false);
                    pushToast("success", "Cliente eliminado.");
                  }
                }}
                className="rounded-xl border border-rose-200 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
            <button
              type="button"
              onClick={handleSave}
              className="flex-1 rounded-xl bg-primary py-2.5 text-xs font-semibold text-white shadow-sm hover:opacity-95"
            >
              {editingClient ? "Guardar Cambios" : "Crear Cliente"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
