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
  FileText,
  Edit2,
  Trash2,
  UserCheck,
  Crown,
  MessagesSquare,
  CalendarPlus,
  ChevronRight,
} from "lucide-react";
import { formatInTimeZone } from "date-fns-tz";
import { useDashboardStore } from "@/store/useDashboardStore";
import Card from "@/components/dashboard/ui/Card";
import Modal from "@/components/dashboard/ui/Modal";
import StatCard from "@/components/dashboard/ui/StatCard";
import CustomSelect from "@/components/dashboard/ui/CustomSelect";
import IosSegmentedControl from "@/components/dashboard/ui/IosSegmentedControl";
import { triggerHaptic } from "@/lib/haptics";
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
  const [clientToDelete, setClientToDelete] = useState<{ id: string; name: string } | null>(null);
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

  const vipRate = useMemo(() => {
    if (clients.length === 0) return 0;
    return Math.round((vipCount / clients.length) * 100);
  }, [vipCount, clients.length]);

  return (
    <div className="space-y-6 pb-12 sm:pb-8 w-full max-w-full overflow-hidden">
      {/* ========================================================= */}
      {/* 1. DARK CONSOLE HERO BANNER                                */}
      {/* ========================================================= */}
      <div
        data-tour="clientes-header"
        className="relative overflow-hidden rounded-2xl bg-[#0c1017] dark:bg-[#0c1017] text-white p-6 sm:p-8 border border-slate-800 shadow-xl"
      >
        {/* Dynamic Brand Ambient Radial Glow */}
        <div
          className="absolute -right-12 -top-12 h-64 w-64 rounded-full blur-3xl opacity-25 pointer-events-none transition-all duration-700"
          style={{ backgroundColor: business.primaryColor || "var(--primary, #0ea5e9)" }}
        />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="uppercase tracking-wider font-semibold text-slate-300">
                Workspace
              </span>
              <span>/</span>
              <span className="text-slate-400">{business.slug || "agendatepy"}</span>
              <span className="hidden sm:inline">·</span>
              <span className="hidden sm:inline text-slate-400">{clients.length} fichas</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white">
              Directorio de Clientes
            </h1>
            <p className="text-sm text-slate-400">
              Historial de visitas, ficha técnica privada, fórmulas y fidelización.
            </p>
          </div>

          {/* Quick Action Dock */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={openCreateModal}
              className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2.5 text-xs font-semibold text-white shadow-xs transition hover:opacity-90 active:scale-95 cursor-pointer"
              style={{ backgroundColor: "var(--primary, #0ea5e9)" }}
            >
              <Plus className="h-4 w-4" />
              <span>Nuevo Cliente</span>
            </button>

            <button
              type="button"
              onClick={exportCSV}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900/80 hover:bg-slate-800 px-3.5 py-2.5 text-xs font-medium text-slate-300 transition cursor-pointer"
            >
              <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-400" />
              <span>Exportar CSV</span>
            </button>

            <Link
              href="/dashboard/crm"
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900/80 hover:bg-slate-800 px-3.5 py-2.5 text-xs font-medium text-slate-300 transition"
              title="Ir a Mensajes CRM"
            >
              <MessagesSquare className="h-3.5 w-3.5 text-slate-400" />
              <span className="hidden sm:inline">Mensajes</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. OPERATIONAL INSET CONTAINER (GAUGES & TELEMETRY)        */}
      {/* ========================================================= */}
      <div className="rounded-[28px] bg-slate-100/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 p-4 sm:p-5 shadow-xs space-y-4">
        {/* Inset Subheader */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
          <div className="font-semibold text-sm text-slate-900 dark:text-white">
            Métricas de Fidelización & Clientes
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400">
            {vipCount} clientes VIP · Gasto medio {formatGs(avgSpent)}
          </div>
        </div>

        {/* Dual-Card Inset Telemetry */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Left Card: Operational Gauges & Summary */}
          <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-950 p-5 shadow-xs flex flex-col justify-between">
            {/* Top section: Mini status box + 2 circular gauges */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center pb-4">
              {/* Mini status box */}
              <div className="rounded-xl bg-slate-50 dark:bg-slate-900 p-3.5 border border-slate-100 dark:border-slate-800 flex flex-col justify-between h-full min-h-[120px]">
                <div>
                  <div className="text-xs font-semibold text-slate-900 dark:text-white">
                    Clientes VIP
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                    {vipCount} clientes de alto valor identificados.
                  </p>
                </div>
                <div className="mt-3">
                  <span className="inline-block rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-3 py-1 text-[11px] font-semibold">
                    {vipCount} VIP
                  </span>
                </div>
              </div>

              {/* Circular Gauge 1: VIP % */}
              <div className="flex flex-col items-center justify-center text-center">
                <div className="relative h-14 w-14 flex items-center justify-center">
                  <svg className="h-14 w-14 -rotate-90 transform" viewBox="0 0 48 48">
                    <circle
                      cx="24"
                      cy="24"
                      r="18"
                      stroke="currentColor"
                      strokeWidth="3.5"
                      className="text-slate-100 dark:text-slate-800"
                      fill="transparent"
                    />
                    <circle
                      cx="24"
                      cy="24"
                      r="18"
                      stroke="currentColor"
                      strokeWidth="3.5"
                      strokeDasharray={113}
                      strokeDashoffset={113 - (113 * vipRate) / 100}
                      strokeLinecap="round"
                      style={{ stroke: "var(--primary, #0ea5e9)" }}
                      className="transition-all duration-700"
                      fill="transparent"
                    />
                  </svg>
                  <span className="absolute text-xs font-bold text-slate-900 dark:text-white">
                    {vipRate}%
                  </span>
                </div>
                <div className="mt-1 text-xs font-semibold text-slate-900 dark:text-white">
                  VIP
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  {vipCount} frecuentes
                </div>
              </div>

              {/* Circular Gauge 2: Fórmulas Técnicas Guardadas */}
              <div className="flex flex-col items-center justify-center text-center">
                <div className="relative h-14 w-14 flex items-center justify-center">
                  <svg className="h-14 w-14 -rotate-90 transform" viewBox="0 0 48 48">
                    <circle
                      cx="24"
                      cy="24"
                      r="18"
                      stroke="currentColor"
                      strokeWidth="3.5"
                      strokeDasharray="4 2"
                      className="text-slate-100 dark:text-slate-800"
                      fill="transparent"
                    />
                    <circle
                      cx="24"
                      cy="24"
                      r="18"
                      stroke="currentColor"
                      strokeWidth="3.5"
                      strokeDasharray={113}
                      strokeDashoffset={113 - (113 * Math.min(100, Math.round((clients.filter((c) => c.formula).length / (clients.length || 1)) * 100))) / 100}
                      strokeLinecap="round"
                      className="text-emerald-500 transition-all duration-700"
                      fill="transparent"
                    />
                  </svg>
                  <span className="absolute text-xs font-bold text-slate-900 dark:text-white">
                    {clients.filter((c) => c.formula).length}
                  </span>
                </div>
                <div className="mt-1 text-xs font-semibold text-slate-900 dark:text-white">
                  Fórmulas
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  fichas con datos
                </div>
              </div>
            </div>

            {/* Bottom Data Rows */}
            <div className="border-t border-slate-100 dark:border-slate-800/80 pt-3 space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                <span>Total de clientes registrados</span>
                <span className="font-semibold text-slate-900 dark:text-white tabular-nums">
                  {clients.length} fichas
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                <span>Gasto acumulado total</span>
                <span className="font-semibold text-slate-900 dark:text-white tabular-nums">
                  {formatGs(totalSpentAll)}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-900 dark:text-white font-medium pt-1 border-t border-slate-100 dark:border-slate-800/60">
                <span>Gasto promedio por cliente</span>
                <span className="font-bold tabular-nums text-slate-900 dark:text-white">
                  {formatGs(avgSpent)}
                </span>
              </div>
            </div>
          </div>

          {/* Right Card: Etiquetas & Segmentación */}
          <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-950 p-5 shadow-xs flex flex-col justify-between space-y-3">
            <div>
              <div className="text-xs font-semibold text-slate-900 dark:text-white mb-2">
                Segmentos de Clientes
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <div className="h-7 w-7 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                      <Crown className="h-3.5 w-3.5" />
                    </div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white">Clientes VIP</span>
                  </div>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{vipCount}</span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <div className="h-7 w-7 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                      <UserCheck className="h-3.5 w-3.5" />
                    </div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white">Frecuentes</span>
                  </div>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {clients.filter((c) => c.tags?.includes("Frecuente")).length}
                  </span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <div className="h-7 w-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                      <Users className="h-3.5 w-3.5" />
                    </div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white">Nuevos Ingresos</span>
                  </div>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {clients.filter((c) => c.tags?.includes("Nuevo")).length}
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom notification */}
            <div className="border-t border-slate-100 dark:border-slate-800/80 pt-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Fichas técnicas con notas privadas y fórmulas químicas:
              </span>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                100% Confidencial
              </span>
            </div>
          </div>
        </div>
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
        <div className="w-full sm:w-auto">
          <IosSegmentedControl
            value={selectedTag}
            onChange={(val) => setSelectedTag(val)}
            layoutId="clientesTagFilter"
            size="sm"
            options={[
              { value: "todos", label: "Todos", badge: clients.length },
              { value: "VIP", label: "VIP", badge: clients.filter((c) => c.tags?.includes("VIP")).length },
              { value: "Frecuente", label: "Frecuentes" },
              { value: "Nuevo", label: "Nuevos" },
            ]}
          />
        </div>
      </div>

      {/* Mobile View: Apple Contacts Inset Grouped Directory */}
      <div className="md:hidden rounded-2xl border border-slate-200/80 dark:border-white/5 bg-white dark:bg-slate-900/60 divide-y divide-slate-100 dark:divide-white/5 shadow-xs overflow-hidden">
        {filteredClients.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            No se encontraron clientes con el filtro aplicado.
          </div>
        ) : (
          filteredClients.map((client) => {
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
              <div
                key={client.id}
                className="p-3.5 flex items-center justify-between gap-3 active:bg-slate-50 dark:active:bg-slate-800/40 transition cursor-pointer"
                onClick={() => {
                  triggerHaptic("selection");
                  setSelectedClient(client);
                }}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-xs font-black text-primary shadow-xs">
                    {initials}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {client.name}
                      </h4>
                      {client.tags?.map((t) => (
                        <span
                          key={t}
                          className={`rounded px-1.5 py-0.2 text-[9px] font-black uppercase tracking-tight shrink-0 ${
                            t === "VIP"
                              ? "bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-400"
                              : t === "Frecuente"
                              ? "bg-indigo-100 dark:bg-indigo-950/40 text-indigo-800 dark:text-indigo-400"
                              : "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-400"
                          }`}
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      {client.phone}
                    </p>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono mt-0.5">
                      <span>{client.totalVisits} visitas</span>
                      <span>·</span>
                      <span className="text-primary font-bold">{formatGs(client.totalSpent)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => triggerHaptic("medium")}
                    className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 hover:scale-105 active:scale-95 transition"
                    title="Enviar WhatsApp"
                  >
                    <MessageCircle className="h-4 w-4" />
                  </a>

                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic("selection");
                      setSelectedClient(client);
                    }}
                    className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Desktop View: Clients Grid */}
      <div className="hidden md:grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
                    <span className="font-bold text-indigo-700 dark:text-indigo-400 flex items-center gap-1">
                      <FileText className="h-3 w-3" /> Ficha Técnica:
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
                    <FileText className="h-3.5 w-3.5" />
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
                    <Crown className="h-3.5 w-3.5" />
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
              <CustomSelect
                className="mt-1 w-full"
                buttonClassName="py-2.5 text-sm bg-white dark:bg-slate-900 border-border"
                value={form.tags}
                onChange={(val) => setForm({ ...form, tags: val })}
                options={[
                  { value: "Nuevo", label: "Nuevo" },
                  { value: "Frecuente", label: "Frecuente" },
                  { value: "VIP", label: "VIP" },
                ]}
              />
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
                  setClientToDelete({ id: editingClient.id, name: editingClient.name });
                }}
                className="rounded-xl border border-rose-200 dark:border-rose-900/40 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
                title="Eliminar cliente"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
            <button
              type="button"
              onClick={handleSave}
              className="flex-1 rounded-xl bg-primary py-2.5 text-xs font-semibold text-white shadow-sm hover:opacity-95 cursor-pointer"
            >
              {editingClient ? "Guardar Cambios" : "Crear Cliente"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Web Modal for Delete Client Confirmation */}
      <Modal
        open={!!clientToDelete}
        onClose={() => setClientToDelete(null)}
        title="¿Eliminar cliente del sistema?"
      >
        <div className="space-y-4 text-xs">
          <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200/60 dark:border-rose-900/40 text-rose-800 dark:text-rose-200">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-600 text-white font-bold">
              <Trash2 className="h-5 w-5" />
            </div>
            <div>
              <p className="font-bold text-sm text-slate-900 dark:text-white">
                {clientToDelete?.name}
              </p>
              <p className="text-[11px] text-rose-600 dark:text-rose-300 mt-0.5 leading-relaxed">
                Se eliminará el perfil del cliente, su historial de visitas y sus notas técnicas. Esta acción no se puede deshacer.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-white/10">
            <button
              type="button"
              onClick={() => setClientToDelete(null)}
              className="rounded-xl border border-slate-200/80 dark:border-white/10 px-4 py-2 font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={() => {
                if (clientToDelete) {
                  deleteClient(clientToDelete.id);
                  setClientToDelete(null);
                  setModalOpen(false);
                  pushToast("success", "Cliente eliminado correctamente.");
                }
              }}
              className="rounded-xl bg-rose-600 hover:bg-rose-700 px-5 py-2 font-bold text-white shadow-md transition cursor-pointer"
            >
              Eliminar Cliente
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
