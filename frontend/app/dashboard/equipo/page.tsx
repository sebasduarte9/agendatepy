"use client";

import { useState } from "react";
import {
  Users,
  ShieldCheck,
  Crown,
  Banknote,
  Scissors,
  Sparkles,
  CheckCircle2,
  XCircle,
  Plus,
  Pencil,
  Clock,
  Percent,
  Lock,
  Eye,
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
    title: "👑 Dueño / Administrador",
    badgeColor: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
    icon: Crown,
    desc: "Acceso total a finanzas, configuración, payouts de comisiones y métricas sensibles del negocio.",
  },
  {
    role: "cajero",
    title: "💳 Cajero / Facturación",
    badgeColor: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
    icon: Banknote,
    desc: "Gestión de cobros en mostrador, confirmación de transferencias SIPAP, arqueo de caja y fidelización.",
  },
  {
    role: "barbero",
    title: "✂️ Barbero Profesional",
    badgeColor: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/20",
    icon: Scissors,
    desc: "Visualización de su agenda personal, bloqueo de descansos, fichas de clientes y sus propias comisiones.",
  },
  {
    role: "estilista",
    title: "💅 Estilista / Colorista",
    badgeColor: "bg-pink-500/10 text-pink-700 dark:text-pink-400 border-pink-500/20",
    icon: Sparkles,
    desc: "Gestión de turnos de peluquería, fórmulas técnicas capilares y cálculo automático de comisiones ganadas.",
  },
];

const PERMISSIONS_MATRIX = [
  {
    action: "Ver Facturación Global & Métricas AI",
    admin: true,
    cajero: false,
    barbero: false,
    estilista: false,
  },
  {
    action: "Cobrar Citas & Arqueo de Caja",
    admin: true,
    cajero: true,
    barbero: false,
    estilista: false,
  },
  {
    action: "Validar Comprobantes SIPAP / QR",
    admin: true,
    cajero: true,
    barbero: false,
    estilista: false,
  },
  {
    action: "Ver Agenda Completa del Salón",
    admin: true,
    cajero: true,
    barbero: false,
    estilista: false,
  },
  {
    action: "Ver Únicamente su Propia Agenda",
    admin: true,
    cajero: true,
    barbero: true,
    estilista: true,
  },
  {
    action: "Bloquear Horarios de Almuerzo / Descanso",
    admin: true,
    cajero: false,
    barbero: true,
    estilista: true,
  },
  {
    action: "Ver Fichas Técnicas & Fórmulas de Clientes",
    admin: true,
    cajero: true,
    barbero: true,
    estilista: true,
  },
  {
    action: "Modificar Porcentajes de Comisiones",
    admin: true,
    cajero: false,
    barbero: false,
    estilista: false,
  },
  {
    action: "Configurar Precios de Servicios & Tienda",
    admin: true,
    cajero: false,
    barbero: false,
    estilista: false,
  },
];

export default function EquipoRolesPage() {
  const { staff, updateStaff, addStaff, deleteStaff, pushToast, currentUserRole, setCurrentUserRole } =
    useDashboardStore();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    role: "Barbero Profesional",
    systemRole: "barbero" as UserRole,
    description: "",
    hours: "09:00 – 19:00",
    commissionPercentage: 45,
    color: "#6366f1",
  });

  function openCreate() {
    setEditingStaff(null);
    setFormData({
      name: "",
      role: "Profesional",
      systemRole: "barbero",
      description: "",
      hours: "09:00 – 19:00",
      commissionPercentage: 45,
      color: "#6366f1",
    });
    setModalOpen(true);
  }

  function openEdit(member: StaffMember) {
    setEditingStaff(member);
    setFormData({
      name: member.name,
      role: member.role,
      systemRole: member.systemRole || "barbero",
      description: member.description,
      hours: member.hours,
      commissionPercentage: member.commissionPercentage,
      color: member.color,
    });
    setModalOpen(true);
  }

  function handleSave(e: React.FormEvent) {
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
      });
      pushToast("success", "Colaborador y rol actualizados con éxito");
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
      });
      pushToast("success", "Nuevo miembro añadido al equipo");
    }
    setModalOpen(false);
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white inline-flex items-center gap-2">
            <span>Equipo, Roles & Permisos</span>
            <ShieldCheck className="h-6 w-6 text-primary" />
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Administrá los perfiles del salón: Dueño, Cajeros, Barberos y Estilistas con permisos diferenciados.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-primary/25 hover:opacity-95 transition"
        >
          <Plus className="h-4 w-4" />
          <span>Nuevo Miembro</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Colaboradores Activos"
          value={String(staff.filter((s) => s.active).length)}
          hint="Registrados en la plataforma"
          icon={Users}
          delta={12}
        />
        <StatCard
          label="Cajeros & Cobro"
          value={String(staff.filter((s) => s.systemRole === "cajero").length || 1)}
          hint="Permiso para caja y SIPAP"
          icon={Banknote}
        />
        <StatCard
          label="Profesionales"
          value={String(staff.filter((s) => s.systemRole === "barbero" || s.systemRole === "estilista").length)}
          hint="Barberos y Estilistas"
          icon={Scissors}
        />
        <StatCard
          label="Seguridad de Datos"
          value="100%"
          hint="Finanzas ocultas a empleados"
          icon={ShieldCheck}
        />
      </div>

      {/* Role Definitions Carousel / Bento */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {ROLE_DEFINITIONS.map((r) => {
          const Icon = r.icon;
          const count =
            r.role === "admin"
              ? 1
              : staff.filter((s) => s.systemRole === r.role).length;
          return (
            <Card
              key={r.role}
              className="p-4 space-y-2 border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl"
            >
              <div className="flex items-center justify-between">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="h-4 w-4" />
                </span>
                <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-slate-600 dark:text-slate-300">
                  {count} asignado{count !== 1 ? "s" : ""}
                </span>
              </div>
              <h3 className="font-bold text-xs text-slate-900 dark:text-white">{r.title}</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                {r.desc}
              </p>
            </Card>
          );
        })}
      </div>

      {/* Team Roster with Assigned System Role */}
      <Card className="p-0 border border-slate-200/80 dark:border-white/10 bg-white/90 dark:bg-slate-900/90 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-white/10 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Nómina del Local y Roles Operativos
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Cada colaborador tiene acceso limitado a las secciones autorizadas para su rol.
            </p>
          </div>
          <span className="text-xs font-semibold text-primary">
            {staff.length} colaboradores
          </span>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-white/10">
          {staff.map((person) => {
            const roleInfo = ROLE_DEFINITIONS.find((r) => r.role === person.systemRole) || ROLE_DEFINITIONS[2];
            return (
              <div
                key={person.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-3 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition"
              >
                <div className="flex items-center gap-3">
                  <span
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl font-bold text-xs text-white shadow-sm"
                    style={{ background: person.color }}
                  >
                    {person.avatar}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-sm text-slate-900 dark:text-white">{person.name}</p>
                      <span
                        className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${roleInfo.badgeColor}`}
                      >
                        {roleInfo.title}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {person.role} · Horario: {person.hours}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center">
                  <div className="text-right">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200 block">
                      {person.commissionPercentage}% comisión
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {person.active ? "Activo" : "Inactivo"}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => openEdit(person)}
                    className="rounded-xl border border-slate-200 dark:border-white/10 p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                    title="Editar rol y permisos"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Permissions Matrix */}
      <Card className="p-5 border border-slate-200/80 dark:border-white/10 bg-white/90 dark:bg-slate-900/90 shadow-sm space-y-4">
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
                <th className="py-2.5 font-bold text-center">👑 Dueño</th>
                <th className="py-2.5 font-bold text-center">💳 Cajero</th>
                <th className="py-2.5 font-bold text-center">✂️ Barbero</th>
                <th className="py-2.5 font-bold text-center">💅 Estilista</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/10">
              {PERMISSIONS_MATRIX.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                  <td className="py-2.5 font-semibold text-slate-800 dark:text-slate-200">
                    {row.action}
                  </td>
                  <td className="py-2.5 text-center">
                    {row.admin ? (
                      <Check className="h-4 w-4 text-emerald-500 mx-auto" />
                    ) : (
                      <span className="text-slate-300 dark:text-slate-600">—</span>
                    )}
                  </td>
                  <td className="py-2.5 text-center">
                    {row.cajero ? (
                      <Check className="h-4 w-4 text-emerald-500 mx-auto" />
                    ) : (
                      <span className="text-slate-300 dark:text-slate-600">—</span>
                    )}
                  </td>
                  <td className="py-2.5 text-center">
                    {row.barbero ? (
                      <Check className="h-4 w-4 text-emerald-500 mx-auto" />
                    ) : (
                      <span className="text-slate-300 dark:text-slate-600">—</span>
                    )}
                  </td>
                  <td className="py-2.5 text-center">
                    {row.estilista ? (
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
        id="staffRoleModal"
        open={modalOpen}
        title={editingStaff ? `Editar Colaborador: ${editingStaff.name}` : "Nuevo Miembro del Equipo"}
        onClose={() => setModalOpen(false)}
      >
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Nombre completo
            </label>
            <input
              type="text"
              required
              placeholder="Ej. Carlos Bogado"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 px-3 py-2 text-slate-900 dark:text-white focus:border-primary focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Rol en el Sistema
              </label>
              <select
                value={formData.systemRole}
                onChange={(e) => setFormData({ ...formData, systemRole: e.target.value as UserRole })}
                className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 px-3 py-2 text-slate-900 dark:text-white focus:border-primary focus:outline-none"
              >
                <option value="admin">👑 Administrador (Dueño)</option>
                <option value="cajero">💳 Cajero / Facturación</option>
                <option value="barbero">✂️ Barbero</option>
                <option value="estilista">💅 Estilista / Peluquera</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Especialidad / Título
              </label>
              <input
                type="text"
                placeholder="Ej. Fade & Barba"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 px-3 py-2 text-slate-900 dark:text-white focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Comisión (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.commissionPercentage}
                onChange={(e) => setFormData({ ...formData, commissionPercentage: Number(e.target.value) })}
                className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 px-3 py-2 text-slate-900 dark:text-white focus:border-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Horario Habitual
              </label>
              <input
                type="text"
                placeholder="09:00 – 19:00"
                value={formData.hours}
                onChange={(e) => setFormData({ ...formData, hours: e.target.value })}
                className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 px-3 py-2 text-slate-900 dark:text-white focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-white/10">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="rounded-xl border border-slate-200 dark:border-white/10 px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="rounded-xl bg-primary px-5 py-2 text-xs font-bold text-white shadow-md shadow-primary/25 hover:opacity-95"
            >
              Guardar Cambios
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
