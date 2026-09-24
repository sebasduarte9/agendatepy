"use client";

import { useState } from "react";
import {
  Award,
  Star,
  Gift,
  CheckCircle2,
  Sparkles,
  Settings,
  Flame,
  Search,
} from "lucide-react";
import { useDashboardStore } from "@/store/useDashboardStore";
import Card from "@/components/dashboard/ui/Card";
import StatCard from "@/components/dashboard/ui/StatCard";
import { formatGs } from "@/lib/dashboard-dates";

export default function FidelizacionPage() {
  const {
    loyalty,
    clients,
    updateLoyalty,
    addClientLoyaltyPoint,
    redeemClientReward,
    pushToast,
  } = useDashboardStore();

  const [search, setSearch] = useState("");
  const [editingSettings, setEditingSettings] = useState(false);
  const [formSettings, setFormSettings] = useState({
    enabled: loyalty.enabled,
    rewardThreshold: loyalty.rewardThreshold,
    rewardDescription: loyalty.rewardDescription,
  });

  const totalPointsAwarded = clients.reduce((sum, c) => sum + (c.loyaltyPoints || 0), 0);
  const totalRewardsRedeemed = clients.reduce((sum, c) => sum + (c.loyaltyRedeemed || 0), 0);
  const eligibleClients = clients.filter(
    (c) => (c.loyaltyPoints || 0) >= loyalty.rewardThreshold
  );

  const filteredClients = clients
    .filter((c) => c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search))
    .sort((a, b) => (b.loyaltyPoints || 0) - (a.loyaltyPoints || 0));

  function handleSaveSettings(e: React.FormEvent) {
    e.preventDefault();
    updateLoyalty({
      enabled: formSettings.enabled,
      rewardThreshold: Number(formSettings.rewardThreshold),
      rewardDescription: formSettings.rewardDescription.trim(),
    });
    setEditingSettings(false);
    pushToast("success", "Configuración del Club VIP guardada");
  }

  function handleAddPoint(clientId: string, clientName: string) {
    addClientLoyaltyPoint(clientId);
    pushToast("success", `+1 sello otorgado a ${clientName}`);
  }

  function handleRedeem(clientId: string, clientName: string) {
    redeemClientReward(clientId);
    pushToast("success", `¡Recompensa canjeada para ${clientName}!`);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white inline-flex items-center gap-2">
            <span>Fidelización & Club de Puntos VIP</span>
            <Star className="h-5 w-5 text-amber-500 fill-amber-400" />
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Incentivá la recurrencia premiando a tus clientes con sellos por cada visita a tu salón o barbería.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setEditingSettings(!editingSettings)}
          className="inline-flex items-center gap-1.5 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 shadow-2xs hover:bg-slate-50 dark:hover:bg-slate-700 transition"
        >
          <Settings className="h-4 w-4 text-slate-400" />
          {editingSettings ? "Cerrar Ajustes" : "Configurar Recompensas"}
        </button>
      </div>

      {/* Settings Panel (Collapsible) */}
      {editingSettings && (
        <Card className="border-2 border-primary/20 bg-primary/5 dark:bg-primary/10 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Ajustes del Programa de Fidelidad</h2>
            </div>
            <label className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer">
              <input
                type="checkbox"
                checked={formSettings.enabled}
                onChange={(e) => setFormSettings({ ...formSettings, enabled: e.target.checked })}
                className="h-4 w-4 rounded text-primary focus:ring-primary"
              />
              <span>Programa Activo</span>
            </label>
          </div>

          <form onSubmit={handleSaveSettings} className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Meta para Canjear (Cantidad de Visitas / Sellos)
              </label>
              <input
                type="number"
                min="2"
                max="20"
                value={formSettings.rewardThreshold}
                onChange={(e) =>
                  setFormSettings({ ...formSettings, rewardThreshold: Number(e.target.value) })
                }
                className="mt-1 w-full rounded-xl border border-border bg-white px-3.5 py-2 text-xs font-bold text-slate-900 outline-none focus:border-primary"
              />
              <p className="mt-1 text-[11px] text-slate-500">
                Recomendado: 5 o 10 visitas para mantener la motivación alta.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Descripción del Premio / Beneficio
              </label>
              <input
                type="text"
                value={formSettings.rewardDescription}
                onChange={(e) =>
                  setFormSettings({ ...formSettings, rewardDescription: e.target.value })
                }
                placeholder="Ej. 50% de descuento en tu próximo corte"
                className="mt-1 w-full rounded-xl border border-border bg-white px-3.5 py-2 text-xs font-bold text-slate-900 outline-none focus:border-primary"
              />
              <p className="mt-1 text-[11px] text-slate-500">
                Este mensaje lo verá el cliente en su tarjeta digital de turno.
              </p>
            </div>

            <div className="sm:col-span-2 flex justify-end gap-2 pt-2 border-t border-primary/10">
              <button
                type="button"
                onClick={() => setEditingSettings(false)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="rounded-xl bg-primary px-5 py-2 text-xs font-bold text-white shadow-sm hover:opacity-95"
              >
                Guardar Reglas
              </button>
            </div>
          </form>
        </Card>
      )}

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Meta Actual del Club"
          value={`${loyalty.rewardThreshold} visitas`}
          icon={Award}
        />
        <StatCard
          label="Sellos Acumulados Activos"
          value={`${totalPointsAwarded} sellos`}
          icon={Star}
        />
        <StatCard
          label="Clientes con Premio Listo"
          value={`${eligibleClients.length} clientes`}
          icon={Gift}
          delta={eligibleClients.length > 0 ? eligibleClients.length : undefined}
        />
        <StatCard
          label="Premios Canjeados"
          value={`${totalRewardsRedeemed} canjes`}
          icon={CheckCircle2}
        />
      </div>

      {/* Search and Clients List */}
      <Card className="space-y-4 border border-slate-200">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Estado de Clientes en el Club VIP</h2>
            <p className="text-xs text-slate-500">
              Podés sumar sellos manualmente o aplicar el canje de la recompensa cuando el cliente asiste.
            </p>
          </div>

          <div className="relative max-w-xs w-full">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar cliente..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-border pl-8 pr-3 py-1.5 text-xs outline-none focus:border-primary"
            />
          </div>
        </div>

        {/* Table / Cards */}
        <div className="divide-y divide-slate-100">
          {filteredClients.map((client) => {
            const points = client.loyaltyPoints || 0;
            const threshold = loyalty.rewardThreshold;
            const canRedeem = points >= threshold;

            return (
              <div
                key={client.id}
                className="flex flex-col gap-3 py-3.5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900">{client.name}</span>
                    <span className="text-xs text-slate-400 font-mono">{client.phone}</span>
                    {client.tags.includes("VIP") && (
                      <span className="rounded-md bg-amber-50 px-1.5 py-0.5 text-[10px] font-bold text-amber-700 border border-amber-200 flex items-center gap-0.5">
                        <Flame className="h-3 w-3" /> VIP
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span>Total gastado: {formatGs(client.totalSpent)}</span>
                    <span>·</span>
                    <span>{client.totalVisits} visitas históricas</span>
                    <span>·</span>
                    <span className="text-emerald-700 font-semibold">{client.loyaltyRedeemed || 0} canjes previos</span>
                  </div>
                </div>

                {/* Progress Stamps & Actions */}
                <div className="flex items-center gap-4">
                  {/* Digital stamps */}
                  <div className="flex items-center gap-1">
                    {Array.from({ length: threshold }).map((_, i) => {
                      const filled = i < points;
                      return (
                        <span
                          key={i}
                          className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold transition ${
                            filled
                              ? "bg-amber-400 text-slate-900 shadow-xs scale-105"
                              : "bg-slate-100 text-slate-300"
                          }`}
                        >
                          <Star className={`h-3.5 w-3.5 ${filled ? "fill-slate-900 text-slate-900" : "text-slate-300"}`} />
                        </span>
                      );
                    })}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleAddPoint(client.id, client.name)}
                      className="rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs"
                      title="Sumar +1 sello"
                    >
                      +1 Sello
                    </button>

                    {canRedeem ? (
                      <button
                        type="button"
                        onClick={() => handleRedeem(client.id, client.name)}
                        className="inline-flex items-center gap-1 rounded-xl bg-amber-500 px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-amber-600 animate-pulse"
                      >
                        <Gift className="h-3.5 w-3.5" />
                        Canjear Premio
                      </button>
                    ) : (
                      <span className="text-[11px] font-semibold text-slate-400 px-2">
                        Faltan {threshold - points}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
