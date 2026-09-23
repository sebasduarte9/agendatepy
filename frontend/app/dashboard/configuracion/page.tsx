"use client";

import { TIMEZONES, useDashboardStore } from "@/store/useDashboardStore";
import Card from "@/components/dashboard/ui/Card";
import { Store, MapPin, Phone, Globe, Clock, Palette } from "lucide-react";

export default function ConfiguracionPage() {
  const { business, updateBusiness, pushToast } = useDashboardStore();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Configuración del Negocio
        </h1>
        <p className="text-sm text-slate-500">
          Datos generales de tu local, horarios y enlaces de reserva en Paraguay.
        </p>
      </div>

      <Card className="space-y-4">
        <div className="flex items-center gap-4 border-b border-border pb-4">
          <label className="avatar-upload flex h-16 w-16 cursor-pointer items-center justify-center rounded-2xl bg-primary text-xl font-bold text-white shadow-md shadow-primary/20">
            {business.name.slice(0, 2).toUpperCase()}
            <input
              type="file"
              className="hidden"
              onChange={() => pushToast("success", "Logo del local actualizado (demo)")}
            />
          </label>
          <div>
            <p className="font-bold text-slate-900 text-lg">{business.name}</p>
            <p className="font-mono text-xs text-primary font-medium">agendate.py/{business.slug}</p>
            <p className="text-xs text-slate-400 mt-0.5">Tocá el logo para cambiar imagen</p>
          </div>
        </div>

        <div className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
              <Store className="h-3.5 w-3.5 text-slate-400" /> Nombre del Negocio
            </label>
            <input
              className="w-full rounded-xl border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
              value={business.name}
              onChange={(e) => updateBusiness({ name: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <Globe className="h-3.5 w-3.5 text-slate-400" /> Slug / URL
              </label>
              <input
                className="w-full rounded-xl border border-border px-3 py-2 text-sm font-mono focus:border-primary focus:outline-none"
                value={business.slug}
                onChange={(e) => updateBusiness({ slug: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 text-slate-400" /> Teléfono WhatsApp
              </label>
              <input
                className="w-full rounded-xl border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
                value={business.phone}
                onChange={(e) => updateBusiness({ phone: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-slate-400" /> Dirección Física
            </label>
            <input
              className="w-full rounded-xl border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
              value={business.address}
              onChange={(e) => updateBusiness({ address: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-slate-400" /> Zona Horaria (TZ)
              </label>
              <select
                className="w-full rounded-xl border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
                value={business.timezone}
                onChange={(e) => {
                  updateBusiness({ timezone: e.target.value });
                  pushToast("success", `TZ actualizada a ${e.target.value}`);
                }}
              >
                {TIMEZONES.map((tz) => (
                  <option key={tz} value={tz}>
                    {tz}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <Palette className="h-3.5 w-3.5 text-slate-400" /> Color de Marca
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  className="h-9 w-14 cursor-pointer rounded-lg border border-border p-0.5"
                  value={business.primaryColor}
                  onChange={(e) => updateBusiness({ primaryColor: e.target.value })}
                />
                <span className="font-mono text-xs text-slate-500">{business.primaryColor}</span>
              </div>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => pushToast("success", "Datos del negocio guardados correctamente")}
          className="mt-2 w-full rounded-xl bg-primary py-2.5 text-xs font-semibold text-white shadow-sm hover:opacity-95 transition"
        >
          Guardar Cambios
        </button>
      </Card>
    </div>
  );
}
