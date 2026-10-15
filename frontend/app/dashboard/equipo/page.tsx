"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Users,
  ShieldCheck,
  Crown,
  Banknote,
  Scissors,
  Brush,
  Plus,
  Pencil,
  Clock,
  Percent,
  Mail,
  Trash2,
  Check,
  Search,
  X,
  Copy,
  CheckCheck,
  AlertTriangle,
  ArrowRight,
  Layers,
} from "lucide-react";
import { useDashboardStore } from "@/store/useDashboardStore";
import Modal from "@/components/dashboard/ui/Modal";
import IosSegmentedControl from "@/components/dashboard/ui/IosSegmentedControl";
import { triggerHaptic } from "@/lib/haptics";
import type { StaffMember, UserRole } from "@/lib/dashboard-types";

const ROLE_DEFINITIONS: {
  role: UserRole;
  title: string;
  shortTitle: string;
  badgeColor: string;
  icon: any;
  desc: string;
}[] = [
  {
    role: "admin",
    title: "Dueño / Administrador",
    shortTitle: "Dueño / Admin",
    badgeColor: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
    icon: Crown,
    desc: "Acceso total a finanzas, configuración, comisiones y configuración sensible del negocio.",
  },
  {
    role: "cajero",
    title: "Cajero / Recepción",
    shortTitle: "Caja / Mostrador",
    badgeColor: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
    icon: Banknote,
    desc: "Gestión de cobros en mostrador, comprobantes de transferencia, apertura/cierre de caja y fidelización.",
  },
  {
    role: "barbero",
    title: "Barbero / Especialista",
    shortTitle: "Barbero",
    badgeColor: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/20",
    icon: Scissors,
    desc: "Visualización de agenda personal, bloqueo de descansos, fichas de clientes y comisiones.",
  },
  {
    role: "estilista",
    title: "Estilista / Especialista",
    shortTitle: "Estilista",
    badgeColor: "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20",
    icon: Brush,
    desc: "Gestión de turnos de salón, fórmulas técnicas de clientes y liquidación de comisiones.",
  },
];

const PERMISSIONS_LIST = [
  { id: "finances", label: "Ver Facturación Global & Finanzas" },
  { id: "cashier", label: "Cobrar en Caja & Arqueo Diario" },
  { id: "transfer_receipts", label: "Validar Comprobantes de Transferencia / QR" },
  { id: "all_schedule", label: "Ver Agenda Completa del Salón" },
  { id: "own_schedule", label: "Ver Únicamente su Propia Agenda" },
  { id: "breaks", label: "Bloquear Horarios de Almuerzo / Descanso" },
  { id: "fichas", label: "Ver Fichas Técnicas & Clientes" },
  { id: "services", label: "Modificar Precios & Catálogo" },
];

const ROLE_ACCESS: Record<UserRole, string[]> = {
  admin: PERMISSIONS_LIST.map((permission) => permission.id),
  cajero: ["cashier", "transfer_receipts", "all_schedule", "fichas"],
  barbero: ["own_schedule", "breaks", "fichas"],
  estilista: ["own_schedule", "breaks", "fichas"],
};

const ACCESS_ROLE_COLUMNS: { role: UserRole; label: string; shortLabel: string }[] = [
  { role: "admin", label: "Dueño", shortLabel: "Dueño" },
  { role: "cajero", label: "Cajero", shortLabel: "Caja" },
  { role: "barbero", label: "Barbero", shortLabel: "Barbero" },
  { role: "estilista", label: "Estilista", shortLabel: "Estilista" },
];

const STAFF_COLORS = [
  "#FF4F2B", // Brand sunset primary
  "#4f46e5", // Indigo
  "#7c3aed", // Violet
  "#059669", // Emerald
  "#d97706", // Amber
  "#e11d48", // Rose
  "#0284c7", // Sky
  "#0d9488", // Teal
];

const COMMISSION_PRESETS = [30, 40, 45, 50, 60, 70];

export default function EquipoRolesPage() {
  const {
    staff,
    services,
    updateStaff,
    addStaff,
    deleteStaff,
    pushToast,
    business,
  } = useDashboardStore();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [memberToDelete, setMemberToDelete] = useState<{ id: string; name: string } | null>(null);
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "Barbero",
    systemRole: "barbero" as UserRole,
    description: "",
    hours: "09:00 – 19:00",
    commissionPercentage: 45,
    color: "#FF4F2B",
    active: true,
    sendInvite: true,
    permissions: ["own_schedule", "breaks", "fichas"] as string[],
  });

  function togglePermission(id: string) {
    setFormData((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(id)
        ? prev.permissions.filter((p) => p !== id)
        : [...prev.permissions, id],
    }));
  }

  function openCreate() {
    setEditingStaff(null);
    setFormData({
      name: "",
      email: "",
      role: "Barbero",
      systemRole: "barbero",
      description: "",
      hours: "09:00 – 19:00",
      commissionPercentage: 45,
      color: "#FF4F2B",
      active: true,
      sendInvite: true,
      permissions: ["own_schedule", "breaks", "fichas"],
    });
    setModalOpen(true);
  }

  function openEdit(member: StaffMember) {
    setEditingStaff(member);
    setFormData({
      name: member.name,
      email: (member as any).email || "",
      role: member.role,
      systemRole: member.systemRole || "barbero",
      description: member.description || "",
      hours: member.hours || "09:00 – 19:00",
      commissionPercentage: member.commissionPercentage ?? 50,
      color: member.color || "#FF4F2B",
      active: member.active !== false,
      sendInvite: false,
      permissions: (member as any).permissions || ["own_schedule", "breaks", "fichas"],
    });
    setModalOpen(true);
  }

  async function handleSendInvite(email: string, name: string, role: string) {
    if (!email || !email.includes("@")) {
      pushToast("error", "Ingresá un correo válido para enviar la invitación");
      return;
    }

    try {
      const res = await fetch("/api/team/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          name,
          role,
          businessName: business.name,
          slug: business.slug,
        }),
      });

      const data = await res.json();
      if (data.ok) {
        pushToast("success", `Invitación enviada a ${email}. Podrá iniciar con Google.`);
      } else {
        pushToast("error", data.error || "No se pudo enviar la invitación");
      }
    } catch {
      pushToast("error", "Error de conexión al enviar invitación");
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.name.trim()) {
      pushToast("error", "Ingresá el nombre del colaborador");
      return;
    }

    if (editingStaff) {
      updateStaff(editingStaff.id, {
        name: formData.name.trim(),
        role: formData.role.trim(),
        systemRole: formData.systemRole,
        description: formData.description.trim(),
        hours: formData.hours.trim(),
        commissionPercentage: Number(formData.commissionPercentage),
        color: formData.color,
        active: formData.active,
        ...({
          email: formData.email.trim(),
          permissions: formData.permissions,
        } as any),
      });

      if (formData.email.trim() && formData.sendInvite) {
        await handleSendInvite(formData.email.trim(), formData.name.trim(), formData.role.trim());
      }

      pushToast("success", "Colaborador y permisos actualizados con éxito");
    } else {
      const initials = formData.name
        .split(" ")
        .slice(0, 2)
        .map((p) => p[0]?.toUpperCase() || "")
        .join("");

      addStaff({
        name: formData.name.trim(),
        role: formData.role.trim(),
        systemRole: formData.systemRole,
        description: formData.description.trim(),
        avatar: initials || "ST",
        color: formData.color,
        active: formData.active,
        hours: formData.hours.trim(),
        commissionPercentage: Number(formData.commissionPercentage),
        ...({
          email: formData.email.trim(),
          permissions: formData.permissions,
        } as any),
      });

      if (formData.email.trim() && formData.sendInvite) {
        await handleSendInvite(formData.email.trim(), formData.name.trim(), formData.role.trim());
      }

      pushToast("success", "Nuevo miembro añadido al equipo");
    }
    setModalOpen(false);
  }

  async function handleToggleActive(member: StaffMember) {
    const nextState = member.active === false;
    const saved = await updateStaff(member.id, { active: nextState });
    if (saved === false) return;

    pushToast(
      "success",
      nextState
        ? `"${member.name}" está activo y visible para reservas`
        : `"${member.name}" pausado temporalmente para nuevos turnos`
    );
  }

  function handleConfirmDeleteMember() {
    if (!memberToDelete) return;
    deleteStaff(memberToDelete.id);
    pushToast("success", `Colaborador "${memberToDelete.name}" eliminado del equipo`);
    setMemberToDelete(null);
  }

  function handleCopyEmail(email: string) {
    navigator.clipboard.writeText(email);
    setCopiedEmail(email);
    pushToast("success", "Correo copiado al portapapeles");
    setTimeout(() => setCopiedEmail(null), 2000);
  }

  // Filtered staff list
  const filteredStaff = useMemo(() => {
    return staff.filter((person) => {
      // Role filter
      if (roleFilter === "admin" && person.systemRole !== "admin") return false;
      if (roleFilter === "cajero" && person.systemRole !== "cajero") return false;
      if (roleFilter === "pro" && person.systemRole !== "barbero" && person.systemRole !== "estilista")
        return false;
      if (roleFilter === "active" && person.active === false) return false;
      if (roleFilter === "paused" && person.active !== false) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const email = (person as any).email || "";
        const matchesName = person.name.toLowerCase().includes(q);
        const matchesRole = person.role.toLowerCase().includes(q);
        const matchesEmail = email.toLowerCase().includes(q);
        if (!matchesName && !matchesRole && !matchesEmail) return false;
      }

      return true;
    });
  }, [staff, roleFilter, searchQuery]);

  const activeStaffCount = staff.filter((s) => s.active !== false).length;
  const adminCount = staff.filter((s) => s.systemRole === "admin").length;
  const cashierCount = staff.filter((s) => s.systemRole === "cajero").length;
  const prosCount = staff.filter((s) => s.systemRole !== "admin" && s.systemRole !== "cajero").length;

  const activeRate = useMemo(() => {
    if (staff.length === 0) return 100;
    return Math.round((activeStaffCount / staff.length) * 100);
  }, [activeStaffCount, staff.length]);

  const avgCommission = useMemo(() => {
    if (staff.length === 0) return 40;
    const sum = staff.reduce((acc, s) => acc + (s.commissionPercentage || 40), 0);
    return Math.round(sum / staff.length);
  }, [staff]);

  return (
    <div className="w-full max-w-full space-y-5 overflow-hidden pb-24 sm:space-y-6 sm:pb-10">
      <header
        data-tour="equipo-header"
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">Personas y accesos</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            Equipo &amp; Especialistas
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-500 dark:text-zinc-400">
            Administrá colaboradores, servicios y permisos desde un solo lugar.
          </p>
        </div>
        <div className="grid w-full grid-cols-1 gap-2 sm:w-auto sm:grid-cols-2">
          <button
            type="button"
            data-tour="equipo-new-btn"
            onClick={openCreate}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:brightness-110 active:scale-[0.98]"
            style={{ backgroundColor: business.primaryColor || "#FF4F2B" }}
          >
            <Plus className="h-4 w-4" />
            Invitar colaborador
          </button>
          <Link
            href="/dashboard/servicios"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-white/10 glass-panel-subtle px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-white/10 dark:text-zinc-200"
            title="Ir al catálogo de servicios"
          >
            <Layers className="h-4 w-4 text-primary" />
            Servicios <span className="tabular-nums">({services.length})</span>
          </Link>
        </div>
      </header>

      <section data-tour="equipo-kpis" className="rounded-3xl glass-panel p-4 sm:p-5">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">Resumen del equipo</h2>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-zinc-400">Estado general y distribución de roles.</p>
          </div>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            Disponibilidad <span className="ml-1 font-semibold tabular-nums text-slate-800 dark:text-zinc-200">{staff.length ? activeRate + "%" : "—"}</span>
          </p>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-4 border-t border-white/10 pt-4 sm:grid-cols-4 sm:gap-y-0">
          {[
            { label: "Colaboradores", value: staff.length, detail: "registrados" },
            { label: "Activos", value: activeStaffCount, detail: "disponibles para reservas" },
            { label: "Especialistas", value: prosCount, detail: "barberos y estilistas" },
            { label: "Comisión promedio", value: staff.length ? avgCommission + "%" : "—", detail: "por servicio" },
          ].map((metric) => (
            <div key={metric.label} className="min-w-0">
              <p className="text-[11px] font-medium text-slate-500 dark:text-zinc-400">{metric.label}</p>
              <p className="mt-1 text-xl font-semibold tabular-nums text-slate-900 dark:text-white">{metric.value}</p>
              <p className="mt-0.5 text-[11px] text-slate-500 dark:text-zinc-500">{metric.detail}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 border-t border-white/10 pt-4 sm:grid-cols-4">
          {ROLE_DEFINITIONS.map((roleDefinition) => {
            const Icon = roleDefinition.icon;
            const count = staff.filter((person) => person.systemRole === roleDefinition.role).length;
            return (
              <div key={roleDefinition.role} className="flex min-w-0 items-center gap-3 rounded-2xl border border-white/5 bg-white/[0.025] px-3 py-2.5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/5 text-primary">
                  <Icon className="h-4 w-4" />
                </span>
                <span className="min-w-0 flex-1 truncate text-xs font-medium text-slate-700 dark:text-zinc-300">{roleDefinition.shortTitle}</span>
                <span className="shrink-0 text-sm font-semibold tabular-nums text-slate-900 dark:text-white">{count}</span>
              </div>
            );
          })}
        </div>
      </section>

      <section data-tour="equipo-list" className="rounded-3xl glass-panel p-4 sm:p-5">
        <div className="flex flex-col gap-4 border-b border-white/10 pb-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">Directorio de colaboradores</h2>
              <span className="rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary">
                {filteredStaff.length} visibles
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400">
              Cada colaborador puede iniciar sesión con Google para consultar su agenda y comisiones.
            </p>
          </div>
          <div className="relative w-full sm:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              aria-label="Buscar colaboradores"
              placeholder="Buscar por nombre, correo o rol"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="min-h-11 w-full rounded-2xl border border-white/10 bg-black/10 pl-10 pr-10 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-primary/50 focus:ring-2 focus:ring-primary/15 dark:text-white"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                aria-label="Borrar búsqueda"
                className="absolute right-1 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-xl text-slate-400 transition hover:bg-white/10 hover:text-slate-700 dark:hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        <div className="-mx-1 mt-4 overflow-x-auto px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <IosSegmentedControl
            options={[
              { value: "all", label: "Todos", badge: staff.length },
              { value: "pro", label: "Especialistas", badge: prosCount },
              { value: "cajero", label: "Caja", badge: cashierCount },
              { value: "admin", label: "Dueños", badge: adminCount },
              { value: "active", label: "Activos", badge: activeStaffCount },
              { value: "paused", label: "Pausados" },
            ]}
            value={roleFilter}
            onChange={setRoleFilter}
            layoutId="equipoRoleSegment"
            fitContent
            size="sm"
            className="min-w-max"
          />
        </div>

        {filteredStaff.length === 0 ? (
          <div className="mt-4 flex flex-col items-center justify-center rounded-3xl border border-dashed border-white/10 bg-white/[0.02] px-5 py-12 text-center">
            <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Users className="h-6 w-6" />
            </span>
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              {staff.length === 0 ? "Todavía no hay colaboradores" : "No encontramos resultados"}
            </h3>
            <p className="mt-1 max-w-sm text-sm text-slate-500 dark:text-zinc-400">
              {staff.length === 0
                ? "Invitá a tu equipo para que pueda consultar su agenda y trabajar con sus propios permisos."
                : "Probá con otro nombre o correo, o limpiá los filtros aplicados."}
            </p>
            {staff.length === 0 ? (
              <button
                type="button"
                onClick={openCreate}
                className="mt-4 inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl px-4 text-sm font-semibold text-white transition hover:brightness-110"
                style={{ backgroundColor: business.primaryColor || "#FF4F2B" }}
              >
                <Plus className="h-4 w-4" /> Invitar colaborador
              </button>
            ) : (
              <button
                type="button"
                onClick={() => { setRoleFilter("all"); setSearchQuery(""); }}
                className="mt-4 inline-flex min-h-11 items-center justify-center rounded-2xl border border-white/10 px-4 text-sm font-medium text-slate-700 transition hover:bg-white/10 dark:text-zinc-200"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        ) : (
          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {filteredStaff.map((person) => {
              const memberEmail = (person as any).email || (person.name.toLowerCase().replace(/\s+/g, ".") + "@gmail.com");
              const roleDefinition = ROLE_DEFINITIONS.find((item) => item.role === person.systemRole) || ROLE_DEFINITIONS[2];
              const isMemberActive = person.active !== false;
              const assignedServicesCount = services.filter((service) => service.staffIds?.includes(person.id)).length;
              const commission = person.commissionPercentage ?? 50;
              return (
                <article
                  key={person.id}
                  className={"flex min-w-0 flex-col rounded-3xl border p-4 transition-colors sm:p-5 " + (isMemberActive ? "glass-panel hover:border-primary/30" : "border-white/5 bg-white/[0.015] opacity-80")}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="relative shrink-0">
                        <span
                          className="flex h-12 w-12 items-center justify-center rounded-2xl text-sm font-semibold text-white shadow-sm ring-1 ring-white/10"
                          style={{ backgroundColor: person.color || "#FF4F2B" }}
                        >
                          {person.avatar || person.name.slice(0, 2).toUpperCase()}
                        </span>
                        <span className={"absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full border-2 border-slate-950 " + (isMemberActive ? "bg-emerald-400" : "bg-amber-400")} />
                      </div>
                      <div className="min-w-0">
                        <h3 className="truncate text-sm font-semibold text-slate-900 dark:text-white">{person.name}</h3>
                        <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-zinc-400">{person.role || roleDefinition.title}</p>
                      </div>
                    </div>
                    <span className={"shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-semibold " + roleDefinition.badgeColor}>{roleDefinition.shortTitle}</span>
                  </div>

                  <button
                    type="button"
                    role="switch"
                    aria-checked={isMemberActive}
                    aria-label={(isMemberActive ? "Pausar a " : "Activar a ") + person.name}
                    onClick={() => { triggerHaptic("selection"); void handleToggleActive(person); }}
                    className="mt-4 flex min-h-11 w-full items-center justify-between rounded-2xl border border-white/5 bg-white/[0.025] px-3 text-xs font-medium text-slate-600 transition hover:bg-white/[0.05] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 dark:text-zinc-300"
                  >
                    <span className="flex items-center gap-2">
                      <span className={"h-2 w-2 rounded-full " + (isMemberActive ? "bg-emerald-400" : "bg-amber-400")} />
                      {isMemberActive ? "Activo para reservas" : "Pausado"}
                    </span>
                    <span className="relative h-6 w-14 shrink-0 rounded-full">
                      <span className={"absolute inset-x-1 top-1/2 h-6 -translate-y-1/2 rounded-full transition-colors " + (isMemberActive ? "bg-emerald-500/80" : "bg-white/15")} />
                      <span className={"absolute left-[10px] top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-white shadow-sm ring-1 ring-black/10 transition-transform " + (isMemberActive ? "translate-x-5" : "translate-x-0")} />
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => { triggerHaptic("light"); handleCopyEmail(memberEmail); }}
                    className="mt-3 flex min-h-11 min-w-0 items-center gap-2 rounded-2xl border border-white/5 bg-black/10 px-3 text-left text-xs text-slate-600 transition hover:bg-white/[0.05] dark:text-zinc-300"
                    title="Copiar correo"
                  >
                    <Mail className="h-4 w-4 shrink-0 text-slate-400" />
                    <span className="min-w-0 flex-1 truncate">{memberEmail}</span>
                    {copiedEmail === memberEmail ? <CheckCheck className="h-4 w-4 shrink-0 text-emerald-400" /> : <Copy className="h-4 w-4 shrink-0 text-slate-400" />}
                  </button>

                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <div className="min-w-0 rounded-2xl border border-white/5 bg-white/[0.025] px-3 py-2.5">
                      <p className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-zinc-400"><Clock className="h-3.5 w-3.5 shrink-0" />Horario</p>
                      <p className="mt-1 truncate text-xs font-medium tabular-nums text-slate-800 dark:text-zinc-200">{person.hours || "09:00 – 19:00"}</p>
                    </div>
                    <div className="min-w-0 rounded-2xl border border-white/5 bg-white/[0.025] px-3 py-2.5">
                      <p className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-zinc-400"><Layers className="h-3.5 w-3.5 shrink-0" />Servicios</p>
                      <p className="mt-1 truncate text-xs font-medium text-slate-800 dark:text-zinc-200">{assignedServicesCount} asignados</p>
                    </div>
                  </div>

                  <div className="mt-3 rounded-2xl border border-white/5 bg-white/[0.025] px-3 py-2.5">
                    <div className="flex items-center justify-between gap-3 text-xs">
                      <span className="flex items-center gap-1.5 text-slate-500 dark:text-zinc-400"><Percent className="h-3.5 w-3.5" />Comisión por servicio</span>
                      <strong className="tabular-nums text-slate-900 dark:text-white">{commission}%</strong>
                    </div>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                      <div className="h-full rounded-full transition-all" style={{ width: Math.min(100, Math.max(0, commission)) + "%", backgroundColor: person.color || "#FF4F2B" }} />
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-end gap-2 border-t border-white/10 pt-3">
                    <div className="flex shrink-0 items-center gap-1">
                      <button type="button" onClick={() => { triggerHaptic("selection"); openEdit(person); }} className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 text-slate-500 transition hover:bg-white/10 hover:text-slate-900 dark:text-zinc-300 dark:hover:text-white" aria-label={"Editar " + person.name} title="Editar colaborador">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button type="button" onClick={() => { triggerHaptic("light"); setMemberToDelete({ id: person.id, name: person.name }); }} className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 text-rose-400 transition hover:bg-rose-500/10" aria-label={"Eliminar " + person.name} title="Eliminar colaborador">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section data-tour="equipo-roles" className="rounded-3xl glass-panel p-4 sm:p-5">
        <div className="flex items-start gap-3 border-b border-white/10 pb-4">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <ShieldCheck className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">Permisos por rol</h2>
            <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400">Una guía rápida de las secciones disponibles para cada perfil.</p>
          </div>
        </div>

        <div className="mt-4 hidden overflow-x-auto lg:block">
          <table className="w-full min-w-[700px] text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 text-slate-500 dark:text-zinc-400">
                <th scope="col" className="py-3 pr-4 font-semibold">Módulo o acción</th>
                {ACCESS_ROLE_COLUMNS.map((column) => <th key={column.role} scope="col" className="px-3 py-3 text-center font-semibold">{column.label}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {PERMISSIONS_LIST.map((permission) => (
                <tr key={permission.id} className="transition hover:bg-white/[0.025]">
                  <th scope="row" className="py-3 pr-4 font-medium text-slate-700 dark:text-zinc-300">{permission.label}</th>
                  {ACCESS_ROLE_COLUMNS.map((column) => {
                    const allowed = ROLE_ACCESS[column.role].includes(permission.id);
                    return <td key={column.role} className="px-3 py-3 text-center">{allowed ? <Check className="mx-auto h-4 w-4 text-emerald-400" /> : <span className="text-slate-400/50" aria-label="Sin acceso">—</span>}</td>;
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:hidden">
          {ROLE_DEFINITIONS.map((roleDefinition) => {
            const Icon = roleDefinition.icon;
            const allowedPermissions = ROLE_ACCESS[roleDefinition.role];
            return (
              <details key={roleDefinition.role} className="group overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025]">
                <summary className="flex min-h-14 cursor-pointer list-none items-center gap-3 px-3.5 py-3 [&::-webkit-details-marker]:hidden">
                  <span className={"flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border " + roleDefinition.badgeColor}><Icon className="h-4 w-4" /></span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-xs font-semibold text-slate-900 dark:text-white">{roleDefinition.shortTitle}</span>
                    <span className="mt-0.5 block text-[11px] text-slate-500 dark:text-zinc-400">{allowedPermissions.length} permisos disponibles</span>
                  </span>
                  <ArrowRight className="h-4 w-4 shrink-0 rotate-90 text-slate-400 transition-transform group-open:rotate-[270deg]" />
                </summary>
                <div className="border-t border-white/10 px-3.5 py-3">
                  <p className="mb-3 text-xs leading-relaxed text-slate-500 dark:text-zinc-400">{roleDefinition.desc}</p>
                  <ul className="space-y-2">
                    {PERMISSIONS_LIST.map((permission) => {
                      const allowed = allowedPermissions.includes(permission.id);
                      return (
                        <li key={permission.id} className="flex items-start gap-2 text-xs">
                          {allowed ? <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" /> : <span className="mt-0.5 flex h-3.5 w-3.5 shrink-0 items-center justify-center text-slate-400/50">—</span>}
                          <span className={allowed ? "text-slate-700 dark:text-zinc-300" : "text-slate-400 dark:text-zinc-500"}>{permission.label}</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </details>
            );
          })}
        </div>
      </section>

      {/* Edit / Create Staff Modal */}
      <Modal
        open={modalOpen}
        title={
          editingStaff
            ? `Editar Colaborador: ${editingStaff.name}`
            : "Invitar Nuevo Miembro del Equipo"
        }
        onClose={() => setModalOpen(false)}
      >
        <form onSubmit={handleSave} className="space-y-4 text-xs pt-2">
          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Nombre completo *
            </label>
            <input
              type="text"
              required
              placeholder="Ej. Carlos Bogado"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-slate-900 dark:text-white focus:border-primary focus:outline-none"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Correo Electrónico (para inicio con Google) *
            </label>
            <input
              type="email"
              required
              placeholder="carlos.bogado@gmail.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-slate-900 dark:text-white focus:border-primary focus:outline-none"
            />
          </div>

          {/* Selector de Rol Sin Elementos Web Básicos */}
          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
              Rol del Sistema y Perfil de Acceso *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {ROLE_DEFINITIONS.map((r) => {
                const isSelected = formData.systemRole === r.role;
                const Icon = r.icon;
                return (
                  <button
                    key={r.role}
                    type="button"
                    onClick={() => {
                      setFormData({
                        ...formData,
                        systemRole: r.role,
                        role: r.title,
                      });
                    }}
                    className={`flex items-start gap-2.5 p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? "border-primary bg-primary/5 dark:bg-primary/10 ring-1 ring-primary shadow-xs"
                        : "border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 bg-white dark:bg-slate-800"
                    }`}
                  >
                    <div
                      className={`h-7 w-7 rounded-lg flex items-center justify-center shrink-0 ${
                        isSelected
                          ? "bg-primary text-white"
                          : "bg-slate-100 dark:bg-slate-700 text-slate-500"
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-xs text-slate-900 dark:text-white truncate">
                          {r.title}
                        </span>
                        {isSelected && <Check className="h-3.5 w-3.5 text-primary shrink-0" />}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                        {r.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Color del Perfil en Calendario */}
          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
              Color Identificador en Agenda y Calendario
            </label>
            <div className="flex items-center gap-2 flex-wrap">
              {STAFF_COLORS.map((c) => {
                const isSelected = formData.color.toLowerCase() === c.toLowerCase();
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setFormData({ ...formData, color: c })}
                    className={`h-7 w-7 rounded-full transition-transform flex items-center justify-center cursor-pointer ${
                      isSelected ? "scale-110 ring-2 ring-offset-2 ring-primary" : "hover:scale-105"
                    }`}
                    style={{ backgroundColor: c }}
                  >
                    {isSelected && <Check className="h-3.5 w-3.5 text-white stroke-[3]" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Comisión con Presets */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-semibold text-slate-700 dark:text-slate-300 block">
                Comisión por Servicios (%)
              </label>
              <div className="flex items-center gap-1">
                {COMMISSION_PRESETS.map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => setFormData({ ...formData, commissionPercentage: pct })}
                    className={`px-2 py-0.5 text-[11px] font-semibold rounded-md border transition cursor-pointer ${
                      formData.commissionPercentage === pct
                        ? "bg-primary text-white border-primary shadow-xs"
                        : "border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                  >
                    {pct}%
                  </button>
                ))}
              </div>
            </div>
            <div className="relative">
              <input
                type="number"
                min={0}
                max={100}
                value={formData.commissionPercentage}
                onChange={(e) =>
                  setFormData({ ...formData, commissionPercentage: Number(e.target.value) })
                }
                className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-slate-900 dark:text-white font-semibold text-sm focus:border-primary focus:outline-none"
              />
              <span className="absolute right-3.5 top-2.5 text-slate-400 font-semibold text-xs">
                % de comisión
              </span>
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Horario de atención habitual
            </label>
            <input
              type="text"
              placeholder="09:00 – 19:00 (Martes a Sábado)"
              value={formData.hours}
              onChange={(e) => setFormData({ ...formData, hours: e.target.value })}
              className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-slate-900 dark:text-white focus:border-primary focus:outline-none"
            />
          </div>

          {/* Permisos Personalizados Checkboxes */}
          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-2">
              Permisos personalizables para este colaborador:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 rounded-xl border border-slate-200/80 dark:border-white/10 bg-slate-50 dark:bg-slate-800/40 p-3">
              {PERMISSIONS_LIST.map((perm) => {
                const isChecked = formData.permissions.includes(perm.id);
                return (
                  <button
                    key={perm.id}
                    type="button"
                    onClick={() => togglePermission(perm.id)}
                    className={`flex items-center gap-2 p-2 rounded-lg text-left text-xs transition cursor-pointer border ${
                      isChecked
                        ? "bg-primary/10 border-primary/30 text-primary font-semibold"
                        : "bg-white dark:bg-slate-800 border-slate-200/60 dark:border-white/5 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    <div
                      className={`h-4 w-4 rounded flex items-center justify-center border shrink-0 ${
                        isChecked
                          ? "bg-primary border-primary text-white"
                          : "border-slate-300 dark:border-slate-600"
                      }`}
                    >
                      {isChecked && <Check className="h-3 w-3 stroke-[3]" />}
                    </div>
                    <span className="truncate">{perm.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Checkbox para enviar invitación Google */}
          <div className="pt-2 border-t border-slate-100 dark:border-white/5">
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.sendInvite}
                onChange={(e) => setFormData({ ...formData, sendInvite: e.target.checked })}
                className="h-4 w-4 rounded text-primary focus:ring-primary"
              />
              <span>Enviar invitación por correo para que acceda con Google</span>
            </label>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-white/5">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="rounded-xl border border-slate-200 dark:border-white/10 px-4 py-2 font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="rounded-xl bg-primary px-5 py-2 font-semibold text-white shadow-md shadow-primary/20 hover:opacity-95 transition cursor-pointer"
            >
              {editingStaff ? "Guardar Cambios" : "Guardar & Invitar"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Web Modal for Delete Staff Member Confirmation */}
      <Modal
        open={!!memberToDelete}
        title="Eliminar Colaborador"
        onClose={() => setMemberToDelete(null)}
      >
        <div className="space-y-4 pt-1">
          <div className="flex items-start gap-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 p-3.5 text-rose-700 dark:text-rose-400">
            <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <p className="font-semibold">
                ¿Estás seguro de que deseas eliminar a &ldquo;{memberToDelete?.name}&rdquo;?
              </p>
              <p className="text-rose-600/90 dark:text-rose-400/90">
                Se desvinculará de los servicios asignados y su acceso con Google quedará revocado.
                Los turnos históricos previos se conservarán en los reportes contables.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-white/5">
            <button
              type="button"
              onClick={() => setMemberToDelete(null)}
              className="rounded-xl border border-slate-200 dark:border-white/10 px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleConfirmDeleteMember}
              className="rounded-xl bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 text-xs font-semibold shadow-md shadow-rose-950/20 transition cursor-pointer"
            >
              Eliminar Colaborador
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
