"use client";

import { useState } from "react";
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
  Lock,
  Mail,
  Send,
  CheckCircle2,
  Trash2,
  Check,
} from "lucide-react";
import { useDashboardStore } from "@/store/useDashboardStore";
import Card from "@/components/dashboard/ui/Card";
import StatCard from "@/components/dashboard/ui/StatCard";
import Modal from "@/components/dashboard/ui/Modal";
import type { StaffMember, UserRole } from "@/lib/dashboard-types";

const ROLE_DEFINITIONS: {
  role: UserRole;
  title: string;
  badgeColor: string;
  icon: any;
  desc: string;
}[] = [
  {
    role: "admin",
    title: "Dueño / Administrador",
    badgeColor: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
    icon: Crown,
    desc: "Acceso total a finanzas, configuración, payouts de comisiones y métricas sensibles del negocio.",
  },
  {
    role: "cajero",
    title: "Cajero / Recepción",
    badgeColor: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
    icon: Banknote,
    desc: "Gestión de cobros en mostrador, confirmación de transferencias SIPAP, arqueo de caja y fidelización.",
  },
  {
    role: "barbero",
    title: "Profesional / Barbero",
    badgeColor: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/20",
    icon: Scissors,
    desc: "Visualización de su agenda personal, bloqueo de descansos, fichas de clientes y sus propias comisiones.",
  },
  {
    role: "estilista",
    title: "Estilista / Especialista",
    badgeColor: "bg-pink-500/10 text-pink-700 dark:text-pink-400 border-pink-500/20",
    icon: Sparkles,
    desc: "Gestión de turnos, fórmulas técnicas de clientes y cálculo automático de comisiones ganadas.",
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
  "#4f46e5",
  "#7c3aed",
  "#059669",
  "#d97706",
  "#e11d48",
  "#0284c7",
  "#0d9488",
  "#ec4899",
];

export default function EquipoRolesPage() {
  const {
    staff,
    updateStaff,
    addStaff,
    deleteStaff,
    pushToast,
    currentUserRole,
    business,
  } = useDashboardStore();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [memberToDelete, setMemberToDelete] = useState<{ id: string; name: string } | null>(null);
  const [invitingId, setInvitingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "Barbero Profesional",
    systemRole: "barbero" as UserRole,
    description: "",
    hours: "09:00 – 19:00",
    commissionPercentage: 45,
    color: "#6366f1",
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
      color: "#6366f1",
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
      description: member.description,
      hours: member.hours,
      commissionPercentage: member.commissionPercentage,
      color: member.color,
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
        active: true,
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

  function handleDelete(id: string, name: string) {
    setMemberToDelete({ id, name });
  }

  function handleConfirmDeleteMember() {
    if (!memberToDelete) return;
    deleteStaff(memberToDelete.id);
    pushToast("success", `Colaborador "${memberToDelete.name}" eliminado del equipo`);
    setMemberToDelete(null);
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div data-tour="equipo-header" className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white inline-flex items-center gap-2">
            <Users className="h-6 w-6 text-brand" />
            <span>Equipo, Roles & Permisos</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Invitá a tus colaboradores por correo para que inicien sesión con su cuenta de Google y configurá sus permisos.
          </p>
        </div>

        <button
          type="button"
          data-tour="equipo-new-btn"
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-2xl bg-brand px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-brand/25 hover:brightness-110 transition cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Invitar Colaborador</span>
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Colaboradores"
          value={`${staff.length} miembros`}
          icon={Users}
        />
        <StatCard
          label="Dueño / Admins"
          value={`${staff.filter((s) => s.systemRole === "admin").length || 1}`}
          icon={Crown}
        />
        <StatCard
          label="Cajeros & Recepción"
          value={`${staff.filter((s) => s.systemRole === "cajero").length}`}
          icon={Banknote}
        />
        <StatCard
          label="Profesionales en Salón"
          value={`${staff.filter((s) => s.systemRole !== "admin" && s.systemRole !== "cajero").length}`}
          icon={Scissors}
        />
      </div>

      {/* Team Members List */}
      <Card data-tour="equipo-list" className="p-5 border border-slate-200/90 dark:border-white/10 bg-white dark:bg-slate-900 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Colaboradores y Cuentas de Acceso
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Cada colaborador puede ingresar a su cuenta con Google para ver únicamente sus turnos y comisiones.
            </p>
          </div>
        </div>

        {staff.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-dashed border-slate-300 dark:border-white/10 bg-slate-50/50 dark:bg-slate-800/40">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand/10 text-brand mb-3">
              <Users className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              No tenés colaboradores en tu equipo
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
              Invitá a tus barberos, estilistas o cajeros para que accedan al sistema con sus permisos personalizados.
            </p>
            <button
              type="button"
              onClick={openCreate}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:brightness-110 transition"
            >
              <Plus className="h-4 w-4" />
              <span>+ Invitar colaborador</span>
            </button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {staff.map((person) => {
            const memberEmail = (person as any).email || `${person.name.toLowerCase().replace(/\s+/g, ".")}@gmail.com`;
            const roleDef = ROLE_DEFINITIONS.find((r) => r.role === person.systemRole) || ROLE_DEFINITIONS[2];

            return (
              <div
                key={person.id}
                className="flex flex-col justify-between rounded-2xl border border-slate-200/80 dark:border-white/10 bg-slate-50/50 dark:bg-slate-800/40 p-4 space-y-3"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-white font-bold text-xs shadow-xs"
                        style={{ backgroundColor: person.color || "#6366f1" }}
                      >
                        {person.avatar || person.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-slate-900 dark:text-white text-sm truncate">{person.name}</h3>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{person.role}</p>
                      </div>
                    </div>

                    <span className={`rounded-lg px-2 py-0.5 text-[10px] font-bold border ${roleDef.badgeColor}`}>
                      {roleDef.title.split("/")[0]}
                    </span>
                  </div>

                  <div className="mt-3 space-y-1 text-xs text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-600 dark:text-slate-300">
                      <Mail className="h-3 w-3 text-slate-400" />
                      <span className="truncate">{memberEmail}</span>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span>Comisión asignada:</span>
                      <strong className="text-slate-900 dark:text-white">{person.commissionPercentage}%</strong>
                    </div>

                    <div className="flex items-center justify-between">
                      <span>Horario de atención:</span>
                      <span className="font-medium text-slate-700 dark:text-slate-300">{person.hours}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200/60 dark:border-white/10 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={async () => {
                      setInvitingId(person.id);
                      await handleSendInvite(memberEmail, person.name, person.role);
                      setInvitingId(null);
                    }}
                    disabled={invitingId === person.id}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-brand hover:underline disabled:opacity-50"
                  >
                    <Send className="h-3 w-3" />
                    <span>{invitingId === person.id ? "Enviando..." : "Enviar Invitación Google"}</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => openEdit(person)}
                      className="rounded-lg border border-slate-200 dark:border-white/10 p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                      title="Editar rol y permisos"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(person.id, person.name)}
                      className="rounded-lg border border-slate-200 dark:border-white/10 p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
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
      <Card data-tour="equipo-roles" className="p-5 border border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900 shadow-xs space-y-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Matriz de Permisos por Rol en el Local
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Control de accesos para proteger los ingresos de la empresa y asegurar orden en mostrador.
          </p>
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
                    {row.id === "cashier" || row.id === "sipap" || row.id === "all_schedule" || row.id === "fichas" ? (
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
        title={editingStaff ? `Editar Colaborador: ${editingStaff.name}` : "Invitar Nuevo Miembro del Equipo"}
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
              className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-slate-900 dark:text-white focus:border-brand focus:outline-none"
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
              className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-slate-900 dark:text-white focus:border-brand focus:outline-none"
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
                        ? "border-brand bg-brand/5 dark:bg-brand/10 ring-1 ring-brand shadow-xs"
                        : "border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 bg-white dark:bg-slate-800"
                    }`}
                  >
                    <div
                      className={`h-7 w-7 rounded-lg flex items-center justify-center shrink-0 ${
                        isSelected ? "bg-brand text-white" : "bg-slate-100 dark:bg-slate-700 text-slate-500"
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-slate-900 dark:text-white truncate">
                          {r.title}
                        </span>
                        {isSelected && <Check className="h-3.5 w-3.5 text-brand shrink-0" />}
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
                      isSelected ? "scale-110 ring-2 ring-offset-2 ring-brand" : "hover:scale-105"
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
                {[30, 40, 45, 50, 60, 70].map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => setFormData({ ...formData, commissionPercentage: pct })}
                    className={`px-2 py-0.5 text-[10px] font-bold rounded-md border transition cursor-pointer ${
                      formData.commissionPercentage === pct
                        ? "bg-brand text-white border-brand shadow-xs"
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
                className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-slate-900 dark:text-white font-bold text-sm focus:border-brand focus:outline-none"
              />
              <span className="absolute right-3.5 top-2.5 text-slate-400 font-bold text-xs">% de comisión</span>
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
              className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-slate-900 dark:text-white focus:border-brand focus:outline-none"
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
                        ? "bg-brand/10 border-brand/30 text-brand font-semibold"
                        : "bg-white dark:bg-slate-800 border-slate-200/60 dark:border-white/5 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    <div
                      className={`h-4 w-4 rounded flex items-center justify-center border shrink-0 ${
                        isChecked ? "bg-brand border-brand text-white" : "border-slate-300 dark:border-slate-600"
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
                className="h-4 w-4 rounded text-brand focus:ring-brand"
              />
              <span>Enviar invitación por correo para que acceda con Google</span>
            </label>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-white/5">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="rounded-xl border border-slate-200 dark:border-white/10 px-4 py-2 font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="rounded-xl bg-brand px-5 py-2 font-bold text-white shadow-md shadow-brand/20 hover:brightness-110 transition"
            >
              {editingStaff ? "Guardar Cambios" : "Guardar & Invitar"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Web Modal for Delete Staff Member Confirmation */}
      <Modal
        open={!!memberToDelete}
        onClose={() => setMemberToDelete(null)}
        title="¿Eliminar colaborador del equipo?"
      >
        <div className="space-y-4 text-xs">
          <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200/60 dark:border-rose-900/40 text-rose-800 dark:text-rose-200">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-600 text-white font-bold">
              <Trash2 className="h-5 w-5" />
            </div>
            <div>
              <p className="font-bold text-sm text-slate-900 dark:text-white">
                {memberToDelete?.name}
              </p>
              <p className="text-[11px] text-rose-600 dark:text-rose-300 mt-0.5 leading-relaxed">
                Este colaborador ya no figurará en la agenda de turnos ni tendrá acceso al panel de control.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-white/10">
            <button
              type="button"
              onClick={() => setMemberToDelete(null)}
              className="rounded-xl border border-slate-200/80 dark:border-white/10 px-4 py-2 font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleConfirmDeleteMember}
              className="rounded-xl bg-rose-600 hover:bg-rose-700 px-5 py-2 font-bold text-white shadow-md transition cursor-pointer"
            >
              Eliminar Colaborador
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
