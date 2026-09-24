"use client";

import { useState } from "react";
import {
  Store,
  MapPin,
  Phone,
  Globe,
  Clock,
  Palette,
  MessageCircle,
  Save,
  CheckCircle2,
  Calendar,
  ShieldCheck,
  Building,
} from "lucide-react";
import { TIMEZONES, useDashboardStore } from "@/store/useDashboardStore";
import Card from "@/components/dashboard/ui/Card";

export default function ConfiguracionPage() {
  const { business, updateBusiness, pushToast } = useDashboardStore();

  const [openingTime, setOpeningTime] = useState("08:00");
  const [closingTime, setClosingTime] = useState("20:00");
  const [weekendClosing, setWeekendClosing] = useState("21:00");
  const [sundayOpen, setSundayOpen] = useState(false);

  function handleSaveAll(e: React.FormEvent) {
    e.preventDefault();
    pushToast("success", "¡Configuración general del local actualizada correctamente!");
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
          Configuración del Negocio & Local
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 sm:text-sm">
          Información legal, dirección física, horarios de apertura y datos del enlace público en Paraguay.
        </p>
      </div>

      <form onSubmit={handleSaveAll} className="space-y-6">
        {/* Brand & Logo Header Card */}
        <Card className="flex flex-col sm:flex-row items-center gap-5">
          <label className="group relative flex h-20 w-20 shrink-0 cursor-pointer items-center justify-center rounded-3xl bg-gradient-to-tr from-primary to-indigo-600 text-2xl font-black text-white shadow-xl shadow-primary/20 hover:scale-105 transition-all">
            {business.name.slice(0, 2).toUpperCase()}
            <input
              type="file"
              className="hidden"
              onChange={() => pushToast("success", "Logo del local actualizado")}
            />
            <span className="absolute inset-0 flex items-center justify-center rounded-3xl bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold">
              Cambiar
            </span>
          </label>

          <div className="space-y-1 text-center sm:text-left flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {business.name}
              </h2>
              <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                Verificado
              </span>
            </div>
            <p className="font-mono text-xs text-primary font-bold">
              agendate.py/{business.slug}
            </p>
            <p className="text-xs text-slate-400">
              Haz clic en el avatar para subir un nuevo logotipo o imagen de portada.
            </p>
          </div>
        </Card>

        {/* Business General Info */}
        <Card className="space-y-4">
          <div className="border-b border-slate-100 dark:border-white/5 pb-3">
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              Identidad & Contacto Comercial
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Datos visibles para tus clientes en la página web de reservas y comprobantes.
            </p>
          </div>

          <div className="space-y-3.5 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1 flex items-center gap-1.5">
                <Store className="h-3.5 w-3.5 text-slate-400" /> Nombre Comercial del Local *
              </label>
              <input
                required
                className="w-full rounded-xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-slate-900 dark:text-white focus:border-primary focus:outline-none"
                value={business.name}
                onChange={(e) => updateBusiness({ name: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1 flex items-center gap-1.5">
                  <Globe className="h-3.5 w-3.5 text-slate-400" /> Slug / Subdominio Web *
                </label>
                <div className="flex rounded-xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900 overflow-hidden focus-within:border-primary">
                  <span className="bg-slate-100 dark:bg-slate-800 px-3 py-2 text-slate-400 text-xs font-mono">
                    agendate.py/
                  </span>
                  <input
                    required
                    className="w-full bg-transparent px-3 py-2 text-slate-900 dark:text-white font-mono text-xs focus:outline-none"
                    value={business.slug}
                    onChange={(e) => updateBusiness({ slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") })}
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1 flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 text-slate-400" /> Teléfono de WhatsApp *
                </label>
                <input
                  required
                  className="w-full rounded-xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-slate-900 dark:text-white focus:border-primary focus:outline-none font-mono"
                  value={business.phone}
                  onChange={(e) => updateBusiness({ phone: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1 flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-slate-400" /> Dirección Física del Local
              </label>
              <input
                className="w-full rounded-xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-slate-900 dark:text-white focus:border-primary focus:outline-none"
                placeholder="Ej: Avda. Mariscal López 1420 c/ San Martín, Asunción"
                value={business.address}
                onChange={(e) => updateBusiness({ address: e.target.value })}
              />
            </div>
          </div>
        </Card>

        {/* Operating Hours & Timezone */}
        <Card className="space-y-4">
          <div className="border-b border-slate-100 dark:border-white/5 pb-3">
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              Horarios de Apertura & Zona Horaria
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Define los límites de agenda visibles para tus clientes en el calendario.
            </p>
          </div>

          <div className="space-y-3.5 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1 flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-slate-400" /> Apertura Lunes a Viernes
                </label>
                <input
                  type="time"
                  value={openingTime}
                  onChange={(e) => setOpeningTime(e.target.value)}
                  className="w-full rounded-xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900 px-3.5 py-2 text-slate-900 dark:text-white focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1 flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-slate-400" /> Cierre Lunes a Viernes
                </label>
                <input
                  type="time"
                  value={closingTime}
                  onChange={(e) => setClosingTime(e.target.value)}
                  className="w-full rounded-xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900 px-3.5 py-2 text-slate-900 dark:text-white focus:border-primary focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1 flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-slate-400" /> Cierre Sábados
                </label>
                <input
                  type="time"
                  value={weekendClosing}
                  onChange={(e) => setWeekendClosing(e.target.value)}
                  className="w-full rounded-xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900 px-3.5 py-2 text-slate-900 dark:text-white focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1 flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-slate-400" /> Zona Horaria (TZ)
                </label>
                <select
                  value={business.timezone}
                  onChange={(e) => updateBusiness({ timezone: e.target.value })}
                  className="w-full rounded-xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900 px-3.5 py-2 text-slate-900 dark:text-white focus:border-primary focus:outline-none"
                >
                  {TIMEZONES.map((tz) => (
                    <option key={tz} value={tz}>
                      {tz}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <label className="flex items-center gap-2.5 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-slate-50/70 dark:bg-slate-800/40 p-3 cursor-pointer">
              <input
                type="checkbox"
                checked={sundayOpen}
                onChange={(e) => setSundayOpen(e.target.checked)}
                className="h-4 w-4 rounded text-primary focus:ring-primary"
              />
              <span className="font-semibold text-slate-700 dark:text-slate-200">
                Abrir atención los días Domingos
              </span>
            </label>
          </div>
        </Card>

        {/* Branding Color Accent */}
        <Card className="flex items-center justify-between">
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white text-sm">
              Color de Marca Principal
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Acento utilizado en botones de reserva, badges y selector de turnos.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="color"
              value={business.primaryColor || "#6366f1"}
              onChange={(e) => updateBusiness({ primaryColor: e.target.value })}
              className="h-10 w-16 cursor-pointer rounded-xl border border-slate-200/80 dark:border-white/10 p-1"
            />
            <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300">
              {business.primaryColor}
            </span>
          </div>
        </Card>

        {/* Action Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-2xl bg-primary px-8 py-3 text-xs font-bold text-white shadow-xl shadow-primary/25 hover:opacity-95 transition"
          >
            <Save className="h-4 w-4" />
            <span>Guardar Todos los Cambios</span>
          </button>
        </div>
      </form>
    </div>
  );
}
