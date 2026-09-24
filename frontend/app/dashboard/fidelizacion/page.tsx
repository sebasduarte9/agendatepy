"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Award,
  Star,
  Gift,
  CheckCircle2,
  Sparkles,
  Settings,
  Flame,
  Search,
  MessageCircle,
  ExternalLink,
  Copy,
  Check,
  Smartphone,
  ShieldCheck,
  Plus,
  Info,
} from "lucide-react";
import { useDashboardStore } from "@/store/useDashboardStore";
import Card from "@/components/dashboard/ui/Card";
import StatCard from "@/components/dashboard/ui/StatCard";
import { formatGs } from "@/lib/dashboard-dates";

export default function FidelizacionPage() {
  const {
    loyalty,
    clients,
    business,
    updateLoyalty,
    addClientLoyaltyPoint,
    redeemClientReward,
    pushToast,
  } = useDashboardStore();

  const [search, setSearch] = useState("");
  const [editingSettings, setEditingSettings] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
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

  function getCardUrl(clientId: string) {
    const origin = typeof window !== "undefined" ? window.location.origin : "https://agendate.py";
    return `${origin}/${business.slug || "barberia"}/tarjeta/${clientId}`;
  }

  async function handleCopyCardLink(clientId: string) {
    const url = getCardUrl(clientId);
    await navigator.clipboard.writeText(url);
    setCopiedId(clientId);
    pushToast("success", "Enlace de tarjeta digital copiado al portapapeles");
    setTimeout(() => setCopiedId(null), 2000);
  }

  function getWhatsAppShareUrl(clientName: string, clientPhone: string, clientId: string) {
    const cardUrl = getCardUrl(clientId);
    const cleanPhone = clientPhone.replace(/[^0-9]/g, "");
    const msg = encodeURIComponent(
      `¡Hola ${clientName}! 🎉 Acá tenés tu Tarjeta Digital VIP de *${business.name}*:\n${cardUrl}\n\nPodés guardarla directamente en tu *Apple Wallet* (iPhone) o *Google Wallet* (Android). ¡Acumulás sellos en cada visita para canjear tu premio de ${loyalty.rewardDescription}! ⭐`
    );
    return `https://wa.me/${cleanPhone}?text=${msg}`;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white inline-flex items-center gap-2">
            <span>Fidelización & Tarjeta Digital VIP</span>
            <Star className="h-5 w-5 text-amber-500 fill-amber-400" />
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Enviá a tus clientes su tarjeta digital con sellos para agregar a su Apple Wallet o Google Wallet.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setEditingSettings(!editingSettings)}
          className="inline-flex items-center gap-1.5 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-slate-900/80 px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 shadow-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition backdrop-blur-xl"
        >
          <Settings className="h-4 w-4 text-slate-400" />
          <span>{editingSettings ? "Cerrar Ajustes" : "Configurar Recompensas"}</span>
        </button>
      </div>

      {/* Apple & Google Wallet Integration Showcase Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-amber-300/60 dark:border-amber-500/20 bg-gradient-to-r from-amber-50 via-white to-indigo-50/70 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 p-5 text-slate-900 dark:text-white shadow-sm transition-all duration-300">
        <div className="pointer-events-none absolute -right-10 -top-10 h-56 w-56 rounded-full bg-amber-400/20 dark:bg-amber-500/15 blur-3xl" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1.5 max-w-xl">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 dark:bg-amber-400/20 border border-amber-500/20 dark:border-amber-400/30 px-3 py-1 text-[11px] font-bold text-amber-800 dark:text-amber-300">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              <span>Soporte Oficial Apple Wallet (.pkpass) & Google Wallet</span>
            </div>
            <h2 className="text-lg font-black tracking-tight text-slate-900 dark:text-white sm:text-xl">
              Tus clientes llevan tu salón en la pantalla de su celular
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Cada cliente cuenta con un enlace único con su tarjeta digital, sellos en tiempo real y código QR. Al tocar &ldquo;Agregar a Wallet&rdquo;, se instala en su iPhone o Android con notificaciones push al ganar sellos.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={getCardUrl(clients[0]?.id || "cl-1")}
              target="_blank"
              className="inline-flex items-center gap-2 rounded-2xl bg-amber-400 hover:bg-amber-300 px-4 py-2.5 text-xs font-black text-slate-950 shadow-md transition"
            >
              <Smartphone className="h-4 w-4" />
              <span>Ver Tarjeta Demo (Cliente)</span>
              <ExternalLink className="h-3.5 w-3.5 opacity-70" />
            </Link>
          </div>
        </div>
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

          <form onSubmit={handleSaveSettings} className="grid gap-4 sm:grid-cols-2 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">
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
                className="w-full rounded-xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900 px-3.5 py-2 font-bold text-slate-900 dark:text-white focus:border-primary focus:outline-none"
              />
              <p className="mt-1 text-[11px] text-slate-400">
                Recomendado: 5 o 10 visitas para mantener la recurrencia alta.
              </p>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">
                Descripción del Premio / Beneficio
              </label>
              <input
                type="text"
                value={formSettings.rewardDescription}
                onChange={(e) =>
                  setFormSettings({ ...formSettings, rewardDescription: e.target.value })
                }
                placeholder="Ej. 50% de descuento en tu próximo corte"
                className="w-full rounded-xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900 px-3.5 py-2 font-bold text-slate-900 dark:text-white focus:border-primary focus:outline-none"
              />
              <p className="mt-1 text-[11px] text-slate-400">
                Este mensaje lo verá el cliente en su Apple / Google Wallet.
              </p>
            </div>

            <div className="sm:col-span-2 flex justify-end gap-2 pt-2 border-t border-primary/10">
              <button
                type="button"
                onClick={() => setEditingSettings(false)}
                className="rounded-xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-800 px-4 py-2 font-semibold text-slate-600 dark:text-slate-300"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="rounded-xl bg-primary px-5 py-2 font-bold text-white shadow-sm hover:opacity-95"
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
      <Card className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 dark:border-white/5 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Tarjetas Digitales & Sellos de Clientes
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Otorgá sellos por visita, canjeá recompensas y enviá su enlace de tarjeta por WhatsApp.
            </p>
          </div>

          <div className="relative max-w-xs w-full">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar cliente por nombre o teléfono..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-slate-900/80 pl-8 pr-3 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-primary backdrop-blur-xl"
            />
          </div>
        </div>

        {/* Table / Client Cards */}
        <div className="divide-y divide-slate-100 dark:divide-white/5">
          {filteredClients.map((client) => {
            const points = client.loyaltyPoints || 0;
            const threshold = loyalty.rewardThreshold;
            const canRedeem = points >= threshold;
            const isCopied = copiedId === client.id;

            return (
              <div
                key={client.id}
                className="flex flex-col gap-3 py-4 lg:flex-row lg:items-center lg:justify-between"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">
                      {client.name}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">{client.phone}</span>
                    {client.tags.includes("VIP") && (
                      <span className="rounded-md bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-bold text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center gap-0.5">
                        <Flame className="h-3 w-3" /> VIP
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-2.5 text-xs text-slate-500 dark:text-slate-400">
                    <span>Total gastado: <strong className="text-slate-700 dark:text-slate-200">{formatGs(client.totalSpent)}</strong></span>
                    <span>•</span>
                    <span>{client.totalVisits} visitas</span>
                    <span>•</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">{client.loyaltyRedeemed || 0} canjes</span>
                  </div>
                </div>

                {/* Progress Stamps & Quick Actions */}
                <div className="flex flex-wrap items-center gap-3">
                  {/* Digital stamps row */}
                  <div className="flex items-center gap-1">
                    {Array.from({ length: threshold }).map((_, i) => {
                      const filled = i < points;
                      return (
                        <span
                          key={i}
                          className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold transition ${
                            filled
                              ? "bg-amber-400 text-slate-950 shadow-xs scale-105"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-300 dark:text-slate-600"
                          }`}
                        >
                          <Star
                            className={`h-3.5 w-3.5 ${
                              filled ? "fill-slate-950 text-slate-950" : "text-slate-300 dark:text-slate-600"
                            }`}
                          />
                        </span>
                      );
                    })}
                  </div>

                  {/* Actions Buttons */}
                  <div className="flex items-center gap-1.5">
                    {/* Add point */}
                    <button
                      type="button"
                      onClick={() => handleAddPoint(client.id, client.name)}
                      className="rounded-xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-slate-900/80 px-2.5 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-xs transition"
                      title="Sumar +1 sello"
                    >
                      +1 Sello
                    </button>

                    {/* Redeem reward if eligible */}
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
                      <span className="text-[11px] font-semibold text-slate-400 px-1">
                        Faltan {threshold - points}
                      </span>
                    )}

                    {/* WhatsApp Send Card */}
                    <a
                      href={getWhatsAppShareUrl(client.name, client.phone, client.id)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-500 transition"
                      title="Mandar tarjeta por WhatsApp al cliente"
                    >
                      <MessageCircle className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">Mandar Tarjeta</span>
                    </a>

                    {/* Copy Link */}
                    <button
                      type="button"
                      onClick={() => handleCopyCardLink(client.id)}
                      className="flex h-7 w-7 items-center justify-center rounded-xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-slate-900/80 text-slate-600 dark:text-slate-300 hover:text-primary transition"
                      title="Copiar enlace de tarjeta digital"
                    >
                      {isCopied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>

                    {/* View Card */}
                    <Link
                      href={getCardUrl(client.id)}
                      target="_blank"
                      className="flex h-7 w-7 items-center justify-center rounded-xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-slate-900/80 text-slate-600 dark:text-slate-300 hover:text-primary transition"
                      title="Ver tarjeta digital como la ve el cliente"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Link>
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
