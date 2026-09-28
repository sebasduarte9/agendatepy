"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Users,
  ShieldCheck,
  Crown,
  Banknote,
  Scissors,
  Sparkles,
  Plus,
  Pencil,
  Clock,
  Percent,
  Mail,
  Send,
  Trash2,
  Check,
  Search,
  X,
  Copy,
  CheckCheck,
  Power,
  AlertTriangle,
  ArrowRight,
  Layers,
  Sparkle,
} from "lucide-react";
import { useDashboardStore } from "@/store/useDashboardStore";
import Card from "@/components/dashboard/ui/Card";
import StatCard from "@/components/dashboard/ui/StatCard";
import Modal from "@/components/dashboard/ui/Modal";
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
    desc: "Gestión de cobros en mostrador, comprobantes SIPAP, apertura/cierre de caja y fidelización.",
  },
  {
    role: "barbero",
    title: "Profesional / Barbero",
    shortTitle: "Barbero Pro",
    badgeColor: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/20",
    icon: Scissors,
    desc: "Visualización de agenda personal, bloqueo de descansos, fichas de clientes y comisiones.",
  },
  {
    role: "estilista",
    title: "Estilista / Especialista",
    shortTitle: "Estilista",
    badgeColor: "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20",
    icon: Sparkles,
    desc: "Gestión de turnos de salón, fórmulas técnicas de clientes y liquidación de comisiones.",
  },
];

const PERMISSIONS_LIST = [
  { id: "finances", label: "Ver Facturación Global & Finanzas" },
  { id: "cashier", label: "Cobrar en Caja & Arqueo Diario" },
  { id: "sipap", label: "Validar Comprobantes SIPAP / QR" },
  { id: "all_schedule", label: "Ver Agenda Completa del Salón" },
  { id: "own_schedule", label: "Ver Únicamente su Propia Agenda" },
  { id: "breaks", label: "Bloquear Horarios de Almuerzo / Descanso" },
  { id: "fichas", label: "Ver Fichas Técnicas & Clientes" },
  { id: "services", label: "Modificar Precios & Catálogo" },
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
  const [invitingId, setInvitingId] = useState<string | null>(null);
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "Barbero Profesional",
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
      role: "Barbero Profesional",
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

  function handleToggleActive(member: StaffMember) {
    const nextState = !member.active;
    updateStaff(member.id, { active: nextState });
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
  const adminCount = staff.filter((s) => s.systemRole === "admin").length || 1;
  const cashierCount = staff.filter((s) => s.systemRole === "cajero").length;
  const prosCount = staff.filter((s) => s.systemRole !== "admin" && s.systemRole !== "cajero").length;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div
        data-tour="equipo-header"
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white inline-flex items-center gap-2">
            <span>Equipo, Roles & Especialistas</span>
            <Users className="h-5 w-5 text-primary" />
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 sm:text-sm">
            Invitá a tus colaboradores con Google, configurá comisiones y asigná niveles de acceso seguros.
          </p>
        </div>

        <button
          type="button"
          data-tour="equipo-new-btn"
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-primary/25 hover:opacity-95 transition cursor-pointer w-fit"
        >
          <Plus className="h-4 w-4" />
          <span>+ Invitar Colaborador</span>
        </button>
      </div>

      {/* Services Notification Banner */}
      <div className="flex items-center justify-between rounded-2xl border border-indigo-200/80 dark:border-indigo-800/40 bg-indigo-50/70 dark:bg-indigo-950/30 p-3.5 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white font-bold">
            <Layers className="h-4 w-4" />
          </div>
          <div>
            <p className="text-xs font-bold text-indigo-950 dark:text-indigo-200">
              ¿Querés asignar qué servicios realiza cada especialista?
            </p>
            <p className="text-[11px] text-indigo-700/80 dark:text-indigo-400">
              En el Catálogo podés marcar quiénes atienden cada corte, barba o tratamiento con cálculo de comisiones.
            </p>
          </div>
        </div>
        <Link
          href="/dashboard/servicios"
          className="inline-flex items-center gap-1.5 rounded-xl bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800/50 px-3 py-1.5 text-xs font-bold text-indigo-700 dark:text-indigo-300 hover:border-indigo-500 shadow-xs transition shrink-0"
        >
          <span>Ir a Servicios ({services.length})</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* KPI Stats */}
      <div data-tour="equipo-kpis" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Colaboradores"
          value={`${staff.length} miembros`}
          hint={`${activeStaffCount} activos para turnos`}
          icon={Users}
        />
        <StatCard
          label="Dueño / Admins"
          value={`${adminCount}`}
          hint="Control total de finanzas"
          icon={Crown}
        />
        <StatCard
          label="Cajeros & Recepción"
          value={`${cashierCount}`}
          hint="Cobros y mostrador"
          icon={Banknote}
        />
        <StatCard
          label="Profesionales en Salón"
          value={`${prosCount}`}
          hint="Barberos & estilistas"
          icon={Scissors}
        />
      </div>

      {/* Search and Filter Navigation Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Role Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {[
            { id: "all", label: "Todos", count: staff.length },
            { id: "pro", label: "Profesionales", count: prosCount },
            { id: "cajero", label: "Caja", count: cashierCount },
            { id: "admin", label: "Dueños", count: adminCount },
            { id: "active", label: "Activos", count: activeStaffCount },
            { id: "paused", label: "Pausados", count: staff.length - activeStaffCount },
          ].map((pill) => (
            <button
              key={pill.id}
              type="button"
              onClick={() => setRoleFilter(pill.id)}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                roleFilter === pill.id
                  ? "bg-primary text-white shadow-xs"
                  : "bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-white/20"
              }`}
            >
              <span>{pill.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                  roleFilter === pill.id
                    ? "bg-white/20 text-white font-black"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                }`}
              >
                {pill.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nombre, correo o rol..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900 pl-8.5 pr-8 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-primary focus:outline-none"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Team Members List */}
      <Card
        data-tour="equipo-list"
        className="p-5 border border-slate-200/90 dark:border-white/10 bg-white dark:bg-slate-900 shadow-xs space-y-4"
      >
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>Directorio de Colaboradores</span>
              <span className="rounded-full bg-primary/10 border border-primary/20 px-2.5 py-0.5 text-[11px] font-bold text-primary">
                {filteredStaff.length} visibles
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Cada colaborador puede iniciar sesión con Google para ver su propia agenda y comisiones ganadas.
            </p>
          </div>
        </div>

        {filteredStaff.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-dashed border-slate-300 dark:border-white/10 bg-slate-50/50 dark:bg-slate-800/40">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-3">
              <Users className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              {staff.length === 0 ? "No tenés colaboradores en tu equipo" : "Sin resultados para esta búsqueda"}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
              {staff.length === 0
                ? "Invitá a tus barberos, estilistas o cajeros para que accedan al sistema con sus permisos personalizados."
                : "Intentá cambiar los filtros o el texto de búsqueda para encontrar al colaborador."}
            </p>
            {staff.length === 0 ? (
              <button
                type="button"
                onClick={openCreate}
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:opacity-95 transition cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>+ Invitar Colaborador</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setRoleFilter("all");
                  setSearchQuery("");
                }}
                className="mt-4 inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-white/10 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <span>Limpiar filtros</span>
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredStaff.map((person) => {
              const memberEmail =
                (person as any).email ||
                `${person.name.toLowerCase().replace(/\s+/g, ".")}@gmail.com`;
              const roleDef =
                ROLE_DEFINITIONS.find((r) => r.role === person.systemRole) || ROLE_DEFINITIONS[2];
              const isMemberActive = person.active !== false;
              const assignedServicesCount = services.filter((s) =>
                s.staffIds?.includes(person.id)
              ).length;
              const commission = person.commissionPercentage ?? 50;

              return (
                <div
                  key={person.id}
                  className={`flex flex-col justify-between rounded-2xl border transition-all p-4 space-y-3 relative group ${
                    isMemberActive
                      ? "border-slate-200/80 dark:border-white/10 bg-slate-50/50 dark:bg-slate-800/40 hover:border-slate-300 dark:hover:border-white/20 shadow-xs"
                      : "border-slate-200/50 dark:border-white/5 bg-slate-100/50 dark:bg-slate-900/40 opacity-75"
                  }`}
                >
                  <div>
                    {/* Top Row: Avatar + Name + Status Pill */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="relative">
                          <div
                            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-white font-black text-xs shadow-sm ring-2 ring-white dark:ring-slate-900"
                            style={{ backgroundColor: person.color || "#FF4F2B" }}
                          >
                            {person.avatar || person.name.slice(0, 2).toUpperCase()}
                          </div>
                          <span
                            className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white dark:border-slate-900 ${
                              isMemberActive ? "bg-emerald-500" : "bg-amber-400"
                            }`}
                            title={isMemberActive ? "Activo" : "Pausado"}
                          />
                        </div>

                        <div className="min-w-0 flex-1">
                          <h3 className="font-bold text-slate-900 dark:text-white text-sm truncate flex items-center gap-1.5">
                            <span className="truncate">{person.name}</span>
                          </h3>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                            {person.role || roleDef.title}
                          </p>
                        </div>
                      </div>

                      {/* Role Badge */}
                      <span
                        className={`rounded-lg px-2 py-0.5 text-[10px] font-black uppercase tracking-wider border shrink-0 ${roleDef.badgeColor}`}
                      >
                        {roleDef.shortTitle}
                      </span>
                    </div>

                    {/* Member Details */}
                    <div className="mt-3.5 space-y-2 text-xs text-slate-500 dark:text-slate-400">
                      {/* Email + Copy button */}
                      <div className="flex items-center justify-between gap-2 p-1.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/60 dark:border-white/5 text-[11px]">
                        <div className="flex items-center gap-1.5 font-mono text-slate-700 dark:text-slate-300 truncate">
                          <Mail className="h-3 w-3 text-slate-400 shrink-0" />
                          <span className="truncate">{memberEmail}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopyEmail(memberEmail)}
                          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 shrink-0"
                          title="Copiar correo"
                        >
                          {copiedEmail === memberEmail ? (
                            <CheckCheck className="h-3.5 w-3.5 text-emerald-500" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </div>

                      {/* Schedule & Services count */}
                      <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                        <div className="flex items-center gap-1 text-slate-600 dark:text-slate-300 truncate">
                          <Clock className="h-3 w-3 text-slate-400 shrink-0" />
                          <span className="truncate">{person.hours || "09:00 – 19:00"}</span>
                        </div>
                        <div className="flex items-center justify-end gap-1 text-slate-600 dark:text-slate-300">
                          <Layers className="h-3 w-3 text-slate-400 shrink-0" />
                          <span>{assignedServicesCount} servicios</span>
                        </div>
                      </div>

                      {/* Commission Split Bar */}
                      <div className="pt-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-500">Comisión por servicio:</span>
                          <strong className="text-slate-900 dark:text-white font-bold">
                            {commission}%
                          </strong>
                        </div>
                        <div className="mt-1 h-1.5 w-full rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${Math.min(100, Math.max(0, commission))}%`,
                              backgroundColor: person.color || "#FF4F2B",
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions Row */}
                  <div className="pt-3 border-t border-slate-200/60 dark:border-white/10 flex items-center justify-between gap-2">
                    {/* Send Invite Button */}
                    <button
                      type="button"
                      onClick={async () => {
                        setInvitingId(person.id);
                        await handleSendInvite(memberEmail, person.name, person.role);
                        setInvitingId(null);
                      }}
                      disabled={invitingId === person.id}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-primary hover:underline disabled:opacity-50 cursor-pointer"
                    >
                      <Send className="h-3 w-3" />
                      <span>
                        {invitingId === person.id ? "Enviando..." : "Invitar Google"}
                      </span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      {/* Quick Pause / Activate Toggle */}
                      <button
                        type="button"
                        onClick={() => handleToggleActive(person)}
                        className={`rounded-lg p-1.5 transition cursor-pointer border ${
                          isMemberActive
                            ? "border-emerald-200 dark:border-emerald-800/40 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                            : "border-amber-200 dark:border-amber-800/40 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/30"
                        }`}
                        title={isMemberActive ? "Pausar colaborador" : "Activar colaborador"}
                      >
                        <Power className="h-3.5 w-3.5" />
                      </button>

                      {/* Edit Button */}
                      <button
                        type="button"
                        onClick={() => openEdit(person)}
                        className="rounded-lg border border-slate-200 dark:border-white/10 p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer"
                        title="Editar rol y permisos"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>

                      {/* Delete Button */}
                      <button
                        type="button"
                        onClick={() => setMemberToDelete({ id: person.id, name: person.name })}
                        className="rounded-lg border border-slate-200 dark:border-white/10 p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
                        title="Eliminar colaborador"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Permissions Matrix */}
      <Card
        data-tour="equipo-roles"
        className="p-5 border border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900 shadow-xs space-y-4"
      >
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <span>Matriz de Permisos por Rol en el Local</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Control de accesos para proteger los ingresos de la empresa y asegurar orden en mostrador.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[550px]">
            <thead>
              <tr className="border-b border-slate-200/80 dark:border-white/10 text-slate-400">
                <th className="py-2.5 font-bold">Módulo o Acción</th>
                <th className="py-2.5 font-bold text-center">Dueño</th>
                <th className="py-2.5 font-bold text-center">Cajero</th>
                <th className="py-2.5 font-bold text-center">Barbero</th>
                <th className="py-2.5 font-bold text-center">Estilista</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/10">
              {PERMISSIONS_LIST.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                  <td className="py-2.5 font-semibold text-slate-800 dark:text-slate-200">
                    {row.label}
                  </td>
                  <td className="py-2.5 text-center">
                    <Check className="h-4 w-4 text-emerald-500 mx-auto" />
                  </td>
                  <td className="py-2.5 text-center">
                    {row.id === "cashier" ||
                    row.id === "sipap" ||
                    row.id === "all_schedule" ||
                    row.id === "fichas" ? (
                      <Check className="h-4 w-4 text-emerald-500 mx-auto" />
                    ) : (
                      <span className="text-slate-300 dark:text-slate-600">—</span>
                    )}
                  </td>
                  <td className="py-2.5 text-center">
                    {row.id === "own_schedule" || row.id === "breaks" || row.id === "fichas" ? (
                      <Check className="h-4 w-4 text-emerald-500 mx-auto" />
                    ) : (
                      <span className="text-slate-300 dark:text-slate-600">—</span>
                    )}
                  </td>
                  <td className="py-2.5 text-center">
                    {row.id === "own_schedule" || row.id === "breaks" || row.id === "fichas" ? (
                      <Check className="h-4 w-4 text-emerald-500 mx-auto" />
                    ) : (
                      <span className="text-slate-300 dark:text-slate-600">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

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
                        <span className="font-bold text-xs text-slate-900 dark:text-white truncate">
                          {r.title}
                        </span>
                        {isSelected && <Check className="h-3.5 w-3.5 text-primary shrink-0" />}
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
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
                    className={`px-2 py-0.5 text-[10px] font-bold rounded-md border transition cursor-pointer ${
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
                className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-slate-900 dark:text-white font-bold text-sm focus:border-primary focus:outline-none"
              />
              <span className="absolute right-3.5 top-2.5 text-slate-400 font-bold text-xs">
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
              className="rounded-xl bg-primary px-5 py-2 font-bold text-white shadow-md shadow-primary/20 hover:opacity-95 transition cursor-pointer"
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
              <p className="font-bold">
                ¿Estás seguro de que deseas eliminar a "{memberToDelete?.name}"?
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
              className="rounded-xl bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 text-xs font-bold shadow-md shadow-rose-950/20 transition cursor-pointer"
            >
              Eliminar Colaborador
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
