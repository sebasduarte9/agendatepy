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
  ChevronRight,
  X,
  LayoutList,
  LayoutGrid,
  CalendarPlus,
  User,
  ChevronDown,
} from "lucide-react";
import { formatInTimeZone } from "date-fns-tz";
import { useDashboardStore } from "@/store/useDashboardStore";
import Modal from "@/components/dashboard/ui/Modal";
import IosSegmentedControl from "@/components/dashboard/ui/IosSegmentedControl";
import { triggerHaptic } from "@/lib/haptics";
import ClientFichaModal from "@/components/dashboard/ClientFichaModal";
import QuickBookingModal from "@/components/dashboard/QuickBookingModal";
import { formatGs, normalizeParaguayPhone } from "@/lib/dashboard-dates";
import { COUNTRY_LIST, findCountryByPhone } from "@/lib/countries";
import type { Client } from "@/lib/dashboard-types";

const INACTIVE_DAYS = 30;

function isInactive(c: Client) {
  if (!c.lastVisit || c.totalVisits === 0) return false;
  return Date.now() - new Date(c.lastVisit).getTime() > INACTIVE_DAYS * 24 * 60 * 60 * 1000;
}

type CustomerChartRow = { label: string; value: number };

function CustomerBarChart({
  title,
  rows,
  color,
  formatValue = (value) => String(value),
}: {
  title: string;
  rows: CustomerChartRow[];
  color: string;
  formatValue?: (value: number) => string;
}) {
  const maxValue = Math.max(1, ...rows.map((row) => row.value));

  return (
    <section aria-label={title} className="min-w-0">
      <h3 className="text-xs font-semibold text-slate-800 dark:text-zinc-200">{title}</h3>
      {rows.length > 0 ? (
        <ul className="mt-3 space-y-2.5">
          {rows.map((row) => (
            <li key={row.label} className="grid grid-cols-[minmax(4.5rem,7rem)_1fr_auto] items-center gap-2.5">
              <span className="truncate text-[11px] text-slate-500 dark:text-zinc-400">{row.label}</span>
              <span className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10" aria-hidden="true">
                <span
                  className="block h-full rounded-full"
                  style={{ width: `${row.value > 0 ? Math.max(7, (row.value / maxValue) * 100) : 0}%`, backgroundColor: color }}
                />
              </span>
              <span className="min-w-8 text-right text-[11px] font-semibold tabular-nums text-slate-700 dark:text-zinc-300">
                {formatValue(row.value)}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-[11px] text-slate-500 dark:text-zinc-400">Agregá clientes para ver esta información.</p>
      )}
    </section>
  );
}

export default function ClientesPage() {
  const { clients, appointments, business, addClient, updateClient, deleteClient, pushToast } =
    useDashboardStore();
  const [search, setSearch] = useState("");
  const [selectedTag, setSelectedTag] = useState<string>("todos");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [quickBookingOpen, setQuickBookingOpen] = useState(false);
  const [quickBookingClient, setQuickBookingClient] = useState<Client | null>(null);

  // Country Prefix Selector state
  const [selectedCountryCode, setSelectedCountryCode] = useState("PY");
  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);
  const [countrySearchQuery, setCountrySearchQuery] = useState("");
  const [phoneDigits, setPhoneDigits] = useState("");

  const activeCountry = useMemo(() => {
    return COUNTRY_LIST.find((c) => c.code === selectedCountryCode) || COUNTRY_LIST[0];
  }, [selectedCountryCode]);

  const filteredCountries = useMemo(() => {
    if (!countrySearchQuery.trim()) return COUNTRY_LIST;
    const q = countrySearchQuery.toLowerCase().trim();
    return COUNTRY_LIST.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.dialCode.includes(q) ||
        c.code.toLowerCase().includes(q)
    );
  }, [countrySearchQuery]);

  const brandColor = business.primaryColor || "#FF4F2B";

  function handleOpenQuickBooking(c: Client) {
    triggerHaptic("selection");
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
        (selectedTag === "inactivos"
          ? isInactive(c)
          : c.tags.some((t) => t.toLowerCase() === selectedTag.toLowerCase()));

      return matchesSearch && matchesTag;
    });
  }, [clients, search, selectedTag]);

  const totalSpentAll = clients.reduce((acc, c) => acc + c.totalSpent, 0);
  const avgSpent = clients.length > 0 ? Math.round(totalSpentAll / clients.length) : 0;
  const vipCount = clients.filter((c) => c.tags.includes("VIP")).length;
  const frecuentesCount = clients.filter((c) => c.tags.includes("Frecuente")).length;
  const nuevosCount = clients.filter((c) => c.tags.includes("Nuevo")).length;
  const inactivosCount = clients.filter(isInactive).length;
  const formulaCount = clients.filter((c) => c.formula && c.formula.trim().length > 0).length;
  const clientSegmentChart = [
    { label: "VIP", value: vipCount },
    { label: "Frecuentes", value: frecuentesCount },
    { label: "Nuevos", value: nuevosCount },
    { label: "Con ficha", value: formulaCount },
  ];

  function openCreateModal() {
    triggerHaptic("selection");
    setEditingClient(null);
    setSelectedCountryCode("PY");
    setPhoneDigits("");
    setCountrySearchQuery("");
    setCountryDropdownOpen(false);
    setForm({
      name: "",
      phone: "",
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
    triggerHaptic("selection");
    setEditingClient(c);
    const parsed = findCountryByPhone(c.phone || "");
    setSelectedCountryCode(parsed.country.code);
    setPhoneDigits(parsed.nationalNumber);
    setCountrySearchQuery("");
    setCountryDropdownOpen(false);
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
    if (!form.name.trim() || !phoneDigits.trim()) {
      pushToast("error", "Completá al menos el nombre y teléfono del cliente.");
      return;
    }

    const cleanDigits = phoneDigits.replace(/\D/g, "");
    let fullPhone = `${activeCountry.dialCode}${cleanDigits}`;
    if (activeCountry.code === "PY") {
      fullPhone = normalizeParaguayPhone(fullPhone) || fullPhone;
    }

    if (editingClient) {
      updateClient(editingClient.id, {
        name: form.name.trim(),
        phone: fullPhone,
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
        phone: fullPhone,
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
    triggerHaptic("selection");
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
    <div className="w-full space-y-4 sm:space-y-6 pb-24 px-1 sm:px-0">
      {/* ═══ APPLE APP HEADER ═══ */}
      <div data-tour="clientes-header" className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between py-1">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            Clientes
          </h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            {clients.length} {clients.length === 1 ? "cliente registrado" : "clientes registrados"}
          </p>
        </div>

        {/* Action Dock */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white shadow-xs transition hover:brightness-110 active:scale-95 cursor-pointer"
            style={{ backgroundColor: brandColor }}
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Nuevo Cliente</span>
          </button>

          <button
            type="button"
            onClick={exportCSV}
            className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 glass-panel-subtle hover:bg-white/10 text-slate-700 dark:text-zinc-300 px-3 py-2 text-xs font-semibold shadow-xs transition cursor-pointer"
          >
            <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-500" />
            <span className="hidden sm:inline">Exportar CSV</span>
          </button>

        </div>
      </div>

      {/* Resumen breve de clientes */}
      <div className="rounded-3xl glass-panel p-4 sm:p-5">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Resumen de clientes</h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            Promedio gastado por cliente <span className="ml-1 font-semibold tabular-nums text-slate-800 dark:text-zinc-200">{formatGs(avgSpent)}</span>
          </p>
        </div>

        <div data-tour="clientes-kpis" className="mt-4 grid grid-cols-2 gap-x-4 gap-y-4 border-t border-white/10 pt-4 sm:grid-cols-4 sm:gap-y-0">
          {[
            { label: "Clientes VIP", value: vipCount },
            { label: "Clientes frecuentes", value: frecuentesCount },
            { label: "Clientes nuevos", value: nuevosCount },
            { label: "Con ficha técnica", value: formulaCount },
          ].map((metric) => (
            <div key={metric.label} className="min-w-0">
              <p className="text-[11px] font-medium text-slate-500 dark:text-zinc-400">{metric.label}</p>
              <p className="mt-1 text-xl font-semibold tabular-nums text-slate-900 dark:text-white">{metric.value}</p>
            </div>
          ))}
        </div>

        <div className="mt-5 hidden grid-cols-1 border-t border-white/10 pt-4 sm:grid">
          <div className="max-w-3xl">
            <CustomerBarChart title="Clientes por segmento" rows={clientSegmentChart} color={brandColor} />
          </div>
        </div>

        <details className="group mt-4 border-t border-white/10 pt-3 sm:hidden">
          <summary className="flex min-h-10 cursor-pointer list-none items-center justify-between gap-3 text-xs font-semibold text-slate-700 marker:hidden dark:text-zinc-200 [&::-webkit-details-marker]:hidden">
            <span>Ver segmentos de clientes</span>
            <ChevronDown aria-hidden="true" className="h-4 w-4 text-slate-500 transition-transform group-open:rotate-180 dark:text-zinc-400" />
          </summary>
          <div className="grid grid-cols-1 gap-5 pt-3">
            <CustomerBarChart title="Clientes por segmento" rows={clientSegmentChart} color={brandColor} />
          </div>
        </details>
      </div>

      {/* ═══ SEARCH & SEGMENTED CONTROLS DOCK ═══ */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* iOS Search Input */}
          <div data-tour="clientes-search" className="relative min-w-0 flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-zinc-500" />
            <input
              type="text"
              placeholder="Buscar cliente..."
              aria-label="Buscar por nombre, teléfono o notas"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-white/[0.04] py-2.5 pl-10 pr-9 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary shadow-xs transition backdrop-blur-md"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* View Mode Toggle Button */}
          <div className="flex shrink-0 items-center gap-1 rounded-2xl border border-slate-300/50 bg-white/60 p-1 dark:border-white/10 dark:bg-white/[0.04]">
            <button
              type="button"
              onClick={() => {
                triggerHaptic("selection");
                setViewMode("list");
              }}
              className={`inline-flex h-8 items-center justify-center gap-1.5 rounded-xl border px-2 sm:px-2.5 text-[11px] font-semibold transition ${
                viewMode === "list"
                  ? "shadow-xs"
                  : "border-transparent text-slate-600 hover:bg-slate-100 dark:text-zinc-400 dark:hover:bg-white/10"
              }`}
              style={viewMode === "list" ? {
                color: brandColor,
                backgroundColor: `color-mix(in srgb, ${brandColor} 16%, transparent)`,
                borderColor: `color-mix(in srgb, ${brandColor} 35%, transparent)`,
              } : undefined}
              title="Vista de lista"
              aria-label="Vista de lista"
              aria-pressed={viewMode === "list"}
            >
              <LayoutList className="h-4 w-4" />
              <span className="hidden min-[420px]:inline">Lista</span>
            </button>
            <button
              type="button"
              onClick={() => {
                triggerHaptic("selection");
                setViewMode("grid");
              }}
              className={`inline-flex h-8 items-center justify-center gap-1.5 rounded-xl border px-2 sm:px-2.5 text-[11px] font-semibold transition ${
                viewMode === "grid"
                  ? "shadow-xs"
                  : "border-transparent text-slate-600 hover:bg-slate-100 dark:text-zinc-400 dark:hover:bg-white/10"
              }`}
              style={viewMode === "grid" ? {
                color: brandColor,
                backgroundColor: `color-mix(in srgb, ${brandColor} 16%, transparent)`,
                borderColor: `color-mix(in srgb, ${brandColor} 35%, transparent)`,
              } : undefined}
              title="Vista de tarjetas"
              aria-label="Vista de tarjetas"
              aria-pressed={viewMode === "grid"}
            >
              <LayoutGrid className="h-4 w-4" />
              <span className="hidden min-[420px]:inline">Tarjetas</span>
            </button>
          </div>
        </div>

        {/* Filter Segmented Control */}
        <div className="w-full overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <IosSegmentedControl
            value={selectedTag}
            onChange={(val) => {
              triggerHaptic("selection");
              setSelectedTag(val);
            }}
            layoutId="clientesTagFilter"
            size="sm"
            fitContent
            accentColor={brandColor}
            options={[
              { value: "todos", label: "Todos", badge: clients.length },
              { value: "VIP", label: "VIP", badge: vipCount },
              { value: "Frecuente", label: "Frecuentes", badge: frecuentesCount },
              { value: "Nuevo", label: "Nuevos", badge: nuevosCount },
              { value: "inactivos", label: "+30 días sin venir", badge: inactivosCount },
            ]}
          />
        </div>
      </div>

      {/* ═══ VIEW MODE: APPLE INSET GROUPED LIST (DEFAULT) ═══ */}
      {viewMode === "list" && (
        <div className="rounded-3xl glass-panel divide-y divide-white/5 overflow-hidden">
          {filteredClients.length === 0 ? (
            <div className="py-14 text-center text-slate-400 dark:text-zinc-500 text-xs space-y-2">
              <Users className="h-8 w-8 mx-auto text-slate-300 dark:text-zinc-600" />
              <p>No se encontraron clientes con esos filtros.</p>
            </div>
          ) : (
            filteredClients.map((client, index) => {
              const initials = client.name
                .split(" ")
                .map((n) => n[0])
                .slice(0, 2)
                .join("")
                .toUpperCase();
              const cleanPhone = client.phone.replace(/\D/g, "");
              const crmUrl = `/dashboard/crm?phone=${encodeURIComponent(client.phone)}`;

              const isVip = client.tags.includes("VIP");

              return (
                <div
                  key={client.id}
                  data-tour={index === 0 ? "clientes-card" : undefined}
                  onClick={() => {
                    triggerHaptic("selection");
                    setSelectedClient(client);
                  }}
                  className="p-3.5 sm:p-4 flex items-center justify-between gap-3 hover:bg-slate-50/70 dark:hover:bg-white/[0.02] active:bg-slate-100 dark:active:bg-white/[0.04] transition cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {/* Avatar Squircle */}
                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-xs font-black shadow-xs ${
                        isVip
                          ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                          : "bg-primary/10 text-primary border border-primary/20"
                      }`}
                    >
                      {initials}
                    </div>

                    {/* Info */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                          {client.name}
                        </h4>
                        {client.tags?.map((t) => (
                          <span
                            key={t}
                            className={`rounded-md px-1.5 py-0.2 text-[9px] font-black uppercase tracking-tight shrink-0 ${
                              t === "VIP"
                                ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                                : t === "Frecuente"
                                ? "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
                                : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            }`}
                          >
                            {t}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-zinc-400 font-mono mt-0.5 truncate">
                        <span>{client.phone}</span>
                        <span>·</span>
                        <span>{client.totalVisits} visitas</span>
                        <span>·</span>
                        <span className="font-bold text-slate-900 dark:text-white">
                          {formatGs(client.totalSpent)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Dock */}
                  <div
                    className="flex items-center gap-1.5 shrink-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {cleanPhone && (
                      <a
                        href={`tel:${cleanPhone}`}
                        onClick={() => triggerHaptic("medium")}
                        className="flex sm:hidden h-8 w-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 items-center justify-center hover:bg-blue-500/20 active:scale-95 transition"
                        title="Llamar al cliente"
                        aria-label={`Llamar a ${client.name}`}
                      >
                        <Phone className="h-3.5 w-3.5" />
                      </a>
                    )}

                    <Link
                      href={crmUrl}
                      onClick={() => triggerHaptic("medium")}
                      className="h-8 w-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center hover:bg-emerald-500/20 active:scale-95 transition"
                      title="Abrir conversación en CRM"
                      aria-label={`Abrir conversación de ${client.name} en el CRM`}
                    >
                      <MessageCircle className="h-4 w-4" />
                    </Link>

                    <button
                      type="button"
                      data-tour={index === 0 ? "clientes-agendar-btn" : undefined}
                      onClick={() => handleOpenQuickBooking(client)}
                      className="inline-flex items-center gap-1 h-8 px-2 sm:px-2.5 sm:py-1.5 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-zinc-300 text-xs font-semibold transition active:scale-95"
                      title="Agendar turno"
                    >
                      <CalendarPlus className="h-3.5 w-3.5 text-primary" />
                      <span className="hidden sm:inline">Agendar</span>
                    </button>

                    <ChevronRight className="h-4 w-4 text-slate-400 dark:text-zinc-500 ml-1" />
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ═══ VIEW MODE: RESPONSIVE APPLE CARDS ═══ */}
      {viewMode === "grid" && (
        <div
          className="grid gap-3.5 sm:gap-4"
          style={{
            gridTemplateColumns: filteredClients.length === 1
              ? "minmax(0, 1fr)"
              : "repeat(auto-fit, minmax(min(100%, 20rem), 1fr))",
          }}
        >
          {filteredClients.length === 0 && (
            <div className="col-span-full rounded-3xl glass-panel py-14 text-center text-xs text-slate-500 dark:text-zinc-400">
              <Users aria-hidden="true" className="mx-auto mb-2 h-8 w-8 text-slate-300 dark:text-zinc-600" />
              <p>No se encontraron clientes con esos filtros.</p>
            </div>
          )}
          {filteredClients.map((client) => {
            const initials = client.name
              .split(" ")
              .map((n) => n[0])
              .slice(0, 2)
              .join("")
              .toUpperCase();
            const crmUrl = `/dashboard/crm?phone=${encodeURIComponent(client.phone)}`;
            const isVip = client.tags.includes("VIP");

            return (
              <div
                key={client.id}
                className={`flex flex-col justify-between gap-4 rounded-3xl p-4 sm:p-5 glass-panel hover:border-primary/40 transition ${
                  filteredClients.length === 1 ? "md:flex-row md:items-center" : ""
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-xs font-black shadow-xs ${
                          isVip
                            ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                            : "bg-primary/10 text-primary border border-primary/20"
                        }`}
                      >
                        {initials}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                          {client.name}
                        </h3>
                        <p className="text-[11px] text-slate-500 dark:text-zinc-400 font-mono mt-0.5 truncate">
                          {client.phone}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-1 shrink-0">
                      {client.tags.map((t) => (
                        <span
                          key={t}
                          className={`rounded-md px-1.5 py-0.2 text-[9px] font-black uppercase tracking-tight ${
                            t === "VIP"
                              ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                              : t === "Frecuente"
                              ? "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
                              : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                          }`}
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Formula snippet if present */}
                  {client.formula && (
                    <div className="mt-3 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/5 p-2.5 text-xs">
                      <span className="font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-1 text-[11px]">
                        <FileText className="h-3 w-3 text-primary" /> Ficha Técnica
                      </span>
                      <p className="mt-0.5 line-clamp-2 text-slate-600 dark:text-zinc-400 text-[11px]">
                        {client.formula}
                      </p>
                    </div>
                  )}

                  {/* Upcoming Appointment */}
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
                      .filter(
                        (a) =>
                          new Date(a.start).getTime() > Date.now() &&
                          a.status !== "cancelled" &&
                          a.status !== "no_show" &&
                          a.status !== "expired"
                      )
                      .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())[0];

                    if (nextApp) {
                      return (
                        <div className="mt-3 max-w-xl rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-2.5 text-[11px] text-emerald-700 dark:text-emerald-400 flex items-center justify-between">
                          <span className="truncate">
                            Próximo: <strong>{formatInTimeZone(nextApp.start, business.timezone || "America/Asuncion", "dd/MM HH:mm")} hs</strong>
                          </span>
                          <Link href={`/dashboard/calendario?appointmentId=${nextApp.id}`} className="font-bold hover:underline shrink-0 ml-1">
                            Ver →
                          </Link>
                        </div>
                      );
                    }
                    return null;
                  })()}
                </div>

                {/* Bottom stats and action bar */}
                <div className={`shrink-0 border-t border-slate-100 pt-3 dark:border-white/10 ${
                  filteredClients.length === 1 ? "md:w-64 md:border-l md:border-t-0 md:pl-4 md:pt-0" : ""
                }`}>
                  <div className="mb-2.5 flex items-center justify-between text-[11px] font-mono">
                    <span className="text-slate-500 dark:text-zinc-400">{client.totalVisits} visitas</span>
                    <span className="font-bold text-slate-900 dark:text-white">{formatGs(client.totalSpent)}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        triggerHaptic("selection");
                        setSelectedClient(client);
                      }}
                      className="flex-1 rounded-xl border border-white/15 py-2 text-xs font-bold text-white transition hover:brightness-110 active:scale-95 cursor-pointer text-center"
                      style={{ backgroundColor: brandColor }}
                    >
                      Ver Ficha
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenQuickBooking(client)}
                      className="px-2.5 py-2 rounded-xl text-white text-xs font-bold transition hover:brightness-110 active:scale-95 cursor-pointer"
                      style={{ backgroundColor: brandColor }}
                      title="Agendar turno"
                    >
                      <Calendar className="h-3.5 w-3.5" />
                    </button>

                    <Link
                      href={crmUrl}
                      className="p-2 rounded-xl border border-slate-200/80 dark:border-white/10 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition active:scale-95"
                      title="Abrir conversación en CRM"
                      aria-label={`Abrir conversación de ${client.name} en el CRM`}
                    >
                      <MessageCircle className="h-3.5 w-3.5" />
                    </Link>

                    <button
                      type="button"
                      onClick={() => openEditModal(client)}
                      className="p-2 rounded-xl border border-slate-200/80 dark:border-white/10 text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-white/5 transition active:scale-95 cursor-pointer"
                      title="Editar cliente"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Client Details & Technical History */}
      <ClientFichaModal
        client={activeFichaClient}
        onClose={() => setSelectedClient(null)}
        onOpenEdit={openEditModal}
        onOpenQuickBooking={handleOpenQuickBooking}
      />

      {/* Quick Booking Modal */}
      <QuickBookingModal
        open={quickBookingOpen}
        onClose={() => setQuickBookingOpen(false)}
        prefillClient={quickBookingClient}
      />

      {/* Modal: Create / Edit Client */}
      <Modal
        open={modalOpen}
        title={editingClient ? `Editar Cliente: ${editingClient.name}` : "Nuevo Cliente"}
        onClose={() => setModalOpen(false)}
        maxWidth="max-w-md"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSave();
          }}
          className="space-y-4 text-sm pt-1 pb-1"
        >
          {/* Nombre y Apellido */}
          <div>
            <label className="block text-sm font-semibold text-slate-800 dark:text-zinc-200 mb-2">
              Nombre y Apellido *
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500">
                <User className="h-4 w-4" />
              </div>
              <input
                type="text"
                required
                placeholder="Ej: Marcos Benítez"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="h-12 w-full rounded-2xl border border-slate-200/80 dark:border-white/10 bg-slate-50 dark:bg-white/[0.04] pl-10 pr-3.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:border-primary focus:bg-white dark:focus:bg-[#121215] focus:outline-none transition font-medium"
              />
            </div>
          </div>

          {/* Teléfono / WhatsApp con Selector de País y Prefijo */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-sm font-semibold text-slate-800 dark:text-zinc-200">
                WhatsApp / Teléfono *
              </label>
              <span className="text-[11px] text-slate-400 dark:text-zinc-500 font-mono">
                Prefijo: {activeCountry.dialCode}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {/* Country Selector Popover */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setCountryDropdownOpen(!countryDropdownOpen)}
                  className="flex h-12 items-center gap-2 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-slate-50 dark:bg-white/[0.04] hover:bg-slate-100 dark:hover:bg-white/[0.08] px-3 text-sm font-semibold text-slate-800 dark:text-zinc-200 shrink-0 transition active:scale-95 cursor-pointer"
                  title="Seleccionar país y prefijo"
                >
                  <span className="text-base leading-none">{activeCountry.flag}</span>
                  <span className="font-mono text-xs">{activeCountry.dialCode}</span>
                  <ChevronDown className={`h-3.5 w-3.5 text-slate-400 dark:text-zinc-400 transition-transform ${countryDropdownOpen ? "rotate-180" : ""}`} />
                </button>

                {countryDropdownOpen && (
                  <div className="absolute top-full left-0 mt-2 z-50 w-72 rounded-2xl glass-modal shadow-2xl p-2 animate-in fade-in zoom-in-95 duration-150">
                    <div className="relative mb-2">
                      <Search className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 dark:text-zinc-500" />
                      <input
                        type="text"
                        autoFocus
                        placeholder="Buscar país o prefijo..."
                        value={countrySearchQuery}
                        onChange={(e) => setCountrySearchQuery(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 pl-8 pr-2.5 py-1.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:border-primary focus:outline-none"
                      />
                    </div>
                    <div className="max-h-52 overflow-y-auto space-y-0.5">
                      {filteredCountries.map((c) => {
                        const isSelected = selectedCountryCode === c.code;
                        return (
                          <button
                            key={c.code}
                            type="button"
                            onClick={() => {
                              triggerHaptic("selection");
                              setSelectedCountryCode(c.code);
                              setCountryDropdownOpen(false);
                              setCountrySearchQuery("");
                            }}
                            className={`w-full flex items-center justify-between p-2 rounded-xl text-left text-xs transition cursor-pointer ${
                              isSelected
                                ? "bg-primary/10 text-primary font-bold dark:bg-primary/20"
                                : "hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-zinc-300"
                            }`}
                          >
                            <div className="flex items-center gap-2 truncate">
                              <span className="text-base leading-none">{c.flag}</span>
                              <span className="truncate">{c.name}</span>
                            </div>
                            <span className="font-mono text-[11px] text-slate-400 dark:text-zinc-500 shrink-0 font-medium">
                              {c.dialCode}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Phone digits input */}
              <div className="relative flex-1">
                <input
                  type="tel"
                  inputMode="numeric"
                  required
                  placeholder={activeCountry.placeholder}
                  value={phoneDigits}
                  onChange={(e) => {
                    const clean = e.target.value.replace(/\D/g, "").slice(0, activeCountry.maxDigits);
                    setPhoneDigits(clean);
                  }}
                  className="h-12 w-full rounded-2xl border border-slate-200/80 dark:border-white/10 bg-slate-50 dark:bg-white/[0.04] px-3.5 text-sm font-mono font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:border-primary focus:bg-white dark:focus:bg-[#121215] focus:outline-none transition tracking-wide"
                />
              </div>
            </div>
          </div>

          {/* Categoría del Cliente */}
          <div>
            <label className="block text-sm font-semibold text-slate-800 dark:text-zinc-200 mb-2">
              Categoría del Cliente
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "Nuevo", label: "Nuevo", icon: "", activeClass: "border-emerald-500 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500/50" },
                { id: "Frecuente", label: "Frecuente", icon: "", activeClass: "border-indigo-500 bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 ring-1 ring-indigo-500/50" },
                { id: "VIP", label: "VIP", icon: "", activeClass: "border-amber-500 bg-amber-500/15 text-amber-600 dark:text-amber-400 ring-1 ring-amber-500/50" },
              ].map((cat) => {
                const isSelected = form.tags === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      triggerHaptic("selection");
                      setForm({ ...form, tags: cat.id });
                    }}
                    className={`h-11 px-2.5 rounded-2xl text-sm font-semibold border transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 ${
                      isSelected
                        ? `${cat.activeClass} shadow-xs font-black`
                        : "border-slate-200/80 dark:border-white/10 bg-slate-50 dark:bg-white/[0.04] text-slate-600 dark:text-zinc-400 hover:border-slate-300 dark:hover:border-white/20"
                    }`}
                  >
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Redes Sociales / Contacto Digital */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="block text-sm font-semibold text-slate-800 dark:text-zinc-200 mb-2">
                Instagram <span className="font-normal text-slate-400 dark:text-zinc-500">(opcional)</span>
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500 font-mono text-xs">
                  @
                </span>
                <input
                  type="text"
                  placeholder="usuario_py"
                  value={form.instagram.replace(/^@/, "")}
                  onChange={(e) => setForm({ ...form, instagram: e.target.value ? `@${e.target.value.replace(/^@/, "")}` : "" })}
                  className="h-12 w-full rounded-2xl border border-slate-200/80 dark:border-white/10 bg-slate-50 dark:bg-white/[0.04] pl-8 pr-3.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:border-primary focus:bg-white dark:focus:bg-[#121215] focus:outline-none transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-800 dark:text-zinc-200 mb-2">
                Email <span className="font-normal text-slate-400 dark:text-zinc-500">(opcional)</span>
              </label>
              <input
                type="email"
                placeholder="cliente@ejemplo.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="h-12 w-full rounded-2xl border border-slate-200/80 dark:border-white/10 bg-slate-50 dark:bg-white/[0.04] px-3.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:border-primary focus:bg-white dark:focus:bg-[#121215] focus:outline-none transition"
              />
            </div>
          </div>

          {/* Ficha Técnica & Preferencias */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-sm font-semibold text-slate-800 dark:text-zinc-200">
                Ficha Técnica & Preferencias <span className="font-normal text-slate-400 dark:text-zinc-500">(opcional)</span>
              </label>
              <span className="text-[10px] text-slate-400 dark:text-zinc-500">
                Visible para el equipo
              </span>
            </div>
            <textarea
              rows={2}
              placeholder="Ej: Degradé navaja al 0 / Tinte 7.1 con 20 vol / Alergia a lociones..."
              value={form.formula}
              onChange={(e) => setForm({ ...form, formula: e.target.value })}
              className="min-h-24 w-full rounded-2xl border border-slate-200/80 dark:border-white/10 bg-slate-50 dark:bg-white/[0.04] p-3.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:border-primary focus:bg-white dark:focus:bg-[#121215] focus:outline-none transition leading-relaxed resize-y"
            />
          </div>

          {/* Notas de Atención */}
          <div>
            <label className="block text-sm font-semibold text-slate-800 dark:text-zinc-200 mb-2">
              Notas de Atención <span className="font-normal text-slate-400 dark:text-zinc-500">(opcional)</span>
            </label>
            <input
              type="text"
              placeholder="Ej: Prefiere turnos por la tarde, café sin azúcar..."
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="h-12 w-full rounded-2xl border border-slate-200/80 dark:border-white/10 bg-slate-50 dark:bg-white/[0.04] px-3.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:border-primary focus:bg-white dark:focus:bg-[#121215] focus:outline-none transition"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 border-t border-slate-200/70 pt-4 dark:border-white/10">
            {editingClient && (
              <button
                type="button"
                onClick={() => {
                  triggerHaptic("medium");
                  setClientToDelete({ id: editingClient.id, name: editingClient.name });
                }}
                className="h-11 w-11 rounded-2xl border border-rose-200 dark:border-rose-900/40 flex items-center justify-center text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition active:scale-95 cursor-pointer shrink-0"
                title="Eliminar cliente"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
            <button
              type="submit"
              className="flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl text-sm font-bold text-white shadow-md transition hover:brightness-110 active:scale-[0.98] cursor-pointer"
              style={{ backgroundColor: brandColor }}
            >
              <span>{editingClient ? "Guardar Cambios" : "Crear Cliente"}</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
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
              className="rounded-xl border border-slate-200/80 dark:border-white/10 px-4 py-2 font-semibold text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-white/5 transition cursor-pointer"
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
              className="rounded-xl bg-rose-600 hover:bg-rose-700 px-5 py-2 font-bold text-white shadow-xs transition active:scale-95 cursor-pointer"
            >
              Eliminar Cliente
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
