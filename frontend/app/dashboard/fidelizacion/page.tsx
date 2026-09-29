"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  Award,
  Crown,
  Gift,
  CheckCircle2,
  Globe,
  Link2,
  SlidersHorizontal,
  Coins,
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
  Sparkles,
  QrCode,
  Share2,
  ArrowUpRight,
  Zap,
  Filter,
} from "lucide-react";
import QRCode from "qrcode";
import { useDashboardStore } from "@/store/useDashboardStore";
import Card from "@/components/dashboard/ui/Card";
import StatCard from "@/components/dashboard/ui/StatCard";
import Modal from "@/components/dashboard/ui/Modal";
import { formatGs } from "@/lib/dashboard-dates";
import type { Client } from "@/lib/dashboard-types";

const REWARD_PRESETS = [
  "50% OFF en tu próximo corte o servicio",
  "Corte o Perfilado de Barba de regalo",
  "Tratamiento de Nutrición Capilar Gratis",
  "Cera Capilar Efecto Mate de Regalo",
  "Servicio Completo Gratis (Corte + Barba)",
];

export default function FidelizacionPage() {
  const {
    loyalty,
    clients,
    business,
    userName,
    updateLoyalty,
    addClientLoyaltyPoint,
    redeemClientReward,
    pushToast,
  } = useDashboardStore();

  const [search, setSearch] = useState("");
  const [filterTab, setFilterTab] = useState<"todos" | "con_premio" | "vips">("todos");
  const [editingSettings, setEditingSettings] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [selectedClientForQr, setSelectedClientForQr] = useState<Client | null>(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");

  const [formSettings, setFormSettings] = useState({
    enabled: loyalty.enabled,
    mode: loyalty.mode || "stamps",
    rewardThreshold: loyalty.rewardThreshold,
    rewardDescription: loyalty.rewardDescription,
    pointsPerVisit: loyalty.pointsPerVisit || (loyalty.mode === "points" ? 10 : 1),
  });

  // Keep form in sync if store updates
  useEffect(() => {
    setFormSettings({
      enabled: loyalty.enabled,
      mode: loyalty.mode || "stamps",
      rewardThreshold: loyalty.rewardThreshold,
      rewardDescription: loyalty.rewardDescription,
      pointsPerVisit: loyalty.pointsPerVisit || (loyalty.mode === "points" ? 10 : 1),
    });
  }, [loyalty]);

  // Generate QR when client is selected
  useEffect(() => {
    if (selectedClientForQr) {
      const url = getCardUrl(selectedClientForQr.id);
      QRCode.toDataURL(url, {
        width: 256,
        margin: 1,
        color: {
          dark: "#0f172a",
          light: "#ffffff",
        },
      }).then(setQrCodeDataUrl).catch((err) => console.error("Error generating QR:", err));
    } else {
      setQrCodeDataUrl("");
    }
  }, [selectedClientForQr]);

  const totalPointsAwarded = clients.reduce((sum, c) => sum + (c.loyaltyPoints || 0), 0);
  const totalRewardsRedeemed = clients.reduce((sum, c) => sum + (c.loyaltyRedeemed || 0), 0);
  const eligibleClients = clients.filter(
    (c) => (c.loyaltyPoints || 0) >= loyalty.rewardThreshold
  );

  const filteredClients = useMemo(() => {
    return clients
      .filter((c) => {
        const matchesSearch =
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.phone.includes(search) ||
          (c.instagram && c.instagram.toLowerCase().includes(search.toLowerCase()));

        if (!matchesSearch) return false;

        if (filterTab === "con_premio") {
          return (c.loyaltyPoints || 0) >= loyalty.rewardThreshold;
        }
        if (filterTab === "vips") {
          return c.tags.includes("VIP");
        }

        return true;
      })
      .sort((a, b) => (b.loyaltyPoints || 0) - (a.loyaltyPoints || 0));
  }, [clients, search, filterTab, loyalty.rewardThreshold]);

  async function handleSaveSettings(e: React.FormEvent) {
    e.preventDefault();
    setIsSavingSettings(true);
    try {
      const patch = {
        enabled: formSettings.enabled,
        mode: formSettings.mode as "stamps" | "points",
        rewardThreshold: Number(formSettings.rewardThreshold),
        rewardDescription: formSettings.rewardDescription.trim(),
        pointsPerVisit: Number(formSettings.pointsPerVisit) || 1,
      };

      await updateLoyalty(patch);
      setEditingSettings(false);
      pushToast("success", "Reglas del Club VIP guardadas y sincronizadas con la base de datos.");
    } catch (err) {
      console.error("Error guardando reglas de fidelización:", err);
      pushToast("error", "Hubo un error al guardar las reglas.");
    } finally {
      setIsSavingSettings(false);
    }
  }

  function handleAddPoint(clientId: string, clientName: string) {
    addClientLoyaltyPoint(clientId);
    pushToast("success", `+1 sello otorgado a ${clientName}`);
  }

  function handleRedeem(clientId: string, clientName: string) {
    redeemClientReward(clientId);
    pushToast("success", `¡Premio canjeado con éxito para ${clientName}!`);
  }

  function getCardUrl(clientId: string) {
    const origin = typeof window !== "undefined" ? window.location.origin : "https://agendate.py";
    return `${origin}/${business.slug || "barberia"}/tarjeta/${clientId}`;
  }

  async function handleCopyCardLink(clientId: string) {
    const url = getCardUrl(clientId);
    await navigator.clipboard.writeText(url);
    setCopiedId(clientId);
    pushToast("success", "Enlace de tarjeta digital copiado.");
    setTimeout(() => setCopiedId(null), 2000);
  }

  function getWhatsAppShareUrl(clientName: string, clientPhone: string, clientId: string) {
    const cardUrl = getCardUrl(clientId);
    const cleanPhone = clientPhone.replace(/[^0-9]/g, "");
    const msg = encodeURIComponent(
      `¡Hola ${clientName}! 👋 Acá tenés tu Tarjeta Digital VIP de *${business.name}*:\n\n📲 ${cardUrl}\n\nPodés abrir tu enlace en cualquier momento para consultar tus sellos acumulados y premios. ¡Acumulás sellos en cada visita para canjear tu premio de: *${loyalty.rewardDescription}*!`
    );
    return `https://wa.me/${cleanPhone}?text=${msg}`;
  }

  const displayName = userName || "Sebas Duarte";

  return (
    <div className="space-y-6">
      {/* ═══ 1. HEADER ═══ */}
      <div
        data-tour="fidelizacion-header"
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/10 p-4 sm:p-5 shadow-xs"
      >
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10.5px] font-bold border transition ${
                loyalty.enabled
                  ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20"
                  : "bg-slate-100 text-slate-500 border-slate-200/60 dark:border-white/10"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  loyalty.enabled ? "bg-emerald-500 animate-pulse" : "bg-slate-400"
                }`}
              />
              <Crown className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
              <span>{loyalty.enabled ? "Club VIP Activo" : "Club VIP en Pausa"}</span>
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-white/10 px-2 py-0.5 text-[10px] font-semibold text-slate-600 dark:text-slate-300">
              <Globe className="h-3 w-3 text-primary" />
              <span>Links Personalizados</span>
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <span>Fidelización & Tarjetas Digitales</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Sumá sellos por visita y compartí con cada cliente su enlace web único para consultar sus beneficios.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setEditingSettings(!editingSettings)}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:opacity-90 px-4 py-2 text-xs font-bold shadow-xs transition cursor-pointer"
          >
            <Settings className="h-3.5 w-3.5" />
            <span>{editingSettings ? "Cerrar Configuración" : "Configurar Reglas"}</span>
          </button>
        </div>
      </div>

      {/* ═══ 2. COMPACT SUMMARY & CLIENT WEB CARD PREVIEW ═══ */}
      <div
        data-tour="fidelizacion-wallet-banner"
        className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-slate-900 text-white p-4 sm:p-5 shadow-sm"
      >
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
          {/* Left Column: Compact Rule & Custom Link Info */}
          <div className="md:col-span-7 space-y-2.5">
            <div className="inline-flex items-center gap-1.5 rounded-md bg-white/10 px-2.5 py-0.5 text-[11px] font-semibold text-slate-200">
              <Globe className="h-3 w-3 text-emerald-400" />
              <span>Formato de Enlace Web Exclusivo</span>
            </div>

            <div>
              <div className="font-mono text-xs text-emerald-400 bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 inline-block select-all">
                agendate.py/{business.slug || "salon"}/tarjeta/<span className="text-white/60">[id-cliente]</span>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed max-w-lg">
              Regla activa: cada cliente suma <strong>{loyalty.mode === "points" ? `${loyalty.pointsPerVisit} pts` : "1 sello"}</strong> por turno asistido. Al alcanzar <strong>{loyalty.rewardThreshold} {loyalty.mode === "points" ? "puntos" : "sellos"}</strong>, desbloquea: <span className="text-emerald-300 font-semibold">{loyalty.rewardDescription}</span>.
            </p>
          </div>

          {/* Right Column: Sleek Mini Web Card Preview (Uses logged in user's name) */}
          <div className="md:col-span-5 flex justify-center md:justify-end">
            <div className="w-full max-w-xs rounded-xl bg-slate-950 border border-white/10 p-3.5 space-y-2.5 shadow-md">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <div className="min-w-0">
                  <h4 className="font-bold text-xs truncate text-white">{business.name}</h4>
                  <span className="text-[10px] text-slate-400">Tarjeta Digital VIP</span>
                </div>
                <span className="text-[9px] font-mono bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/30">
                  ACTIVO
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <div>
                  <span className="text-[9.5px] text-slate-400 block">Titular:</span>
                  <span className="font-bold text-white text-xs">{displayName}</span>
                </div>
                <div className="text-right">
                  <span className="text-[9.5px] text-slate-400 block">Progreso:</span>
                  <span className="font-extrabold text-emerald-400 text-xs">
                    {Math.min(4, loyalty.rewardThreshold)} / {loyalty.rewardThreshold} sellos
                  </span>
                </div>
              </div>

              {/* Compact Stamp Dots */}
              <div className="flex items-center gap-1.5 pt-0.5">
                {Array.from({ length: Math.min(loyalty.rewardThreshold, 8) }).map((_, i) => {
                  const filled = i < 4;
                  return (
                    <div
                      key={i}
                      className={`h-5 w-5 rounded-full flex items-center justify-center text-[9px] font-bold transition ${
                        filled
                          ? "bg-emerald-500 text-slate-950 font-black shadow-xs"
                          : "border border-white/20 text-slate-500"
                      }`}
                    >
                      {filled ? "✓" : i + 1}
                    </div>
                  );
                })}
              </div>

              <div className="rounded-lg bg-white/5 border border-white/5 px-2.5 py-1 text-[10px] text-slate-300 truncate">
                🎁 Premio: <strong className="text-white">{loyalty.rewardDescription}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ 3. CONFIGURATION PANEL (COLLAPSIBLE / FORM) ═══ */}
      {editingSettings && (
        <Card data-tour="fidelizacion-config-card" className="border-2 border-primary/30 bg-primary/5 dark:bg-primary/10 p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-primary/15 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-white shadow-sm">
                <SlidersHorizontal className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Reglas del Programa de Fidelización & Beneficios
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Definí cómo ganan sellos tus clientes y qué premio se les acredita automáticamente.
                </p>
              </div>
            </div>

            <label className="flex items-center gap-2.5 text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/10 rounded-2xl px-3.5 py-2 shadow-2xs">
              <input
                type="checkbox"
                checked={formSettings.enabled}
                onChange={(e) => setFormSettings({ ...formSettings, enabled: e.target.checked })}
                className="h-4 w-4 rounded text-primary focus:ring-primary cursor-pointer"
              />
              <span>Programa Activo</span>
            </label>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-5 text-xs">
            {/* Modalidad del programa */}
            <div>
              <label className="block font-bold text-slate-800 dark:text-slate-200 mb-2">
                Modalidad de la Tarjeta Digital
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() =>
                    setFormSettings({
                      ...formSettings,
                      mode: "stamps",
                      rewardThreshold: formSettings.mode === "points" ? 5 : formSettings.rewardThreshold,
                      pointsPerVisit: 1,
                    })
                  }
                  className={`p-4 rounded-2xl border text-left transition cursor-pointer ${
                    formSettings.mode === "stamps"
                      ? "border-primary bg-primary/10 dark:bg-primary/20 text-primary font-bold shadow-xs"
                      : "border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <Award className="h-5 w-5 text-amber-500" />
                    <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                      Tarjeta de Sellos por Visita (Recomendada)
                    </span>
                  </div>
                  <p className="text-[11.5px] text-slate-500 dark:text-slate-400 font-normal leading-relaxed">
                    1 sello automático por cada cita o visita asistida. Es la más fácil de entender para el cliente: &ldquo;Completá 5 visitas y ganás tu premio&rdquo;.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setFormSettings({
                      ...formSettings,
                      mode: "points",
                      rewardThreshold: formSettings.mode === "stamps" ? 100 : formSettings.rewardThreshold,
                      pointsPerVisit: 10,
                    })
                  }
                  className={`p-4 rounded-2xl border text-left transition cursor-pointer ${
                    formSettings.mode === "points"
                      ? "border-primary bg-primary/10 dark:bg-primary/20 text-primary font-bold shadow-xs"
                      : "border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <Coins className="h-5 w-5 text-indigo-500" />
                    <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                      Tarjeta de Puntos Acumulables
                    </span>
                  </div>
                  <p className="text-[11.5px] text-slate-500 dark:text-slate-400 font-normal leading-relaxed">
                    Acumula puntos por visita o por consumo. Ideal para salones y negocios con catálogo variado de premios escalonados.
                  </p>
                </button>
              </div>
            </div>

            {/* Threshold & Points Inputs */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                  {formSettings.mode === "stamps"
                    ? "Meta para Canjear (Cantidad de Visitas / Sellos)"
                    : "Puntos necesarios para canjear"}
                </label>
                <input
                  type="number"
                  min="2"
                  max={formSettings.mode === "stamps" ? "20" : "5000"}
                  value={formSettings.rewardThreshold}
                  onChange={(e) =>
                    setFormSettings({ ...formSettings, rewardThreshold: Number(e.target.value) })
                  }
                  className="w-full rounded-xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900 px-3.5 py-2.5 font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/40 focus:outline-none"
                />
                <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                  {formSettings.mode === "stamps"
                    ? "Estándar de fidelidad: 5 o 10 sellos."
                    : "Ejemplo: 100 puntos acumulados."}
                </p>
              </div>

              {formSettings.mode === "points" ? (
                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                    Puntos otorgados por visita completada
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    value={formSettings.pointsPerVisit}
                    onChange={(e) =>
                      setFormSettings({ ...formSettings, pointsPerVisit: Number(e.target.value) })
                    }
                    className="w-full rounded-xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900 px-3.5 py-2.5 font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/40 focus:outline-none"
                  />
                  <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                    Se sumarán automáticamente a la tarjeta del cliente tras confirmar su asistencia.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col justify-center p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-white/5">
                  <span className="font-bold text-slate-800 dark:text-slate-200 text-xs flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    <span>Acreditación Automática</span>
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    Cada vez que un barbero o estilista completa el servicio en el calendario, se agrega +1 sello de forma inmediata.
                  </span>
                </div>
              )}
            </div>

            {/* Description & Presets */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="font-bold text-slate-800 dark:text-slate-200">
                  Descripción del Premio / Beneficio a Entregar
                </label>
                <span className="text-[11px] text-slate-400">Visible en la tarjeta web del cliente</span>
              </div>
              <input
                type="text"
                value={formSettings.rewardDescription}
                onChange={(e) =>
                  setFormSettings({ ...formSettings, rewardDescription: e.target.value })
                }
                placeholder="Ej. 50% de descuento en tu próximo corte"
                className="w-full rounded-xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900 px-3.5 py-2.5 font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/40 focus:outline-none"
              />

              {/* Quick Presets */}
              <div className="mt-2.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                  Sugerencias Rápidas:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {REWARD_PRESETS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setFormSettings({ ...formSettings, rewardDescription: preset })}
                      className={`px-2.5 py-1 rounded-lg text-[10.5px] font-semibold border transition cursor-pointer ${
                        formSettings.rewardDescription === preset
                          ? "bg-primary text-white border-primary"
                          : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200/60 dark:border-white/5 hover:bg-slate-100"
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Form Footer */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-primary/15">
              <button
                type="button"
                onClick={() => setEditingSettings(false)}
                className="rounded-xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-800 px-4 py-2 font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 cursor-pointer transition"
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={isSavingSettings}
                className="inline-flex items-center gap-2 rounded-xl bg-primary hover:opacity-95 px-5 py-2 font-bold text-white shadow-sm transition cursor-pointer disabled:opacity-50"
              >
                {isSavingSettings ? (
                  <>
                    <span className="h-3.5 w-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    <span>Guardando en BD...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Guardar Reglas en Base de Datos</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </Card>
      )}

      {/* ═══ 4. KPI METRICS CARDS ═══ */}
      <div data-tour="fidelizacion-kpis" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Meta Actual del Club"
          value={`${loyalty.rewardThreshold} visitas`}
          icon={Award}
        />
        <StatCard
          label="Sellos Activos en Circulación"
          value={`${totalPointsAwarded} sellos`}
          icon={ShieldCheck}
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

      {/* ═══ 5. CLIENTS & DIGITAL PASSES DIRECTORY ═══ */}
      <Card data-tour="fidelizacion-clients-table" className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 dark:border-white/5 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Tarjetas Digitales & Sellos de Clientes
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Otorgá sellos por visita, canjeá beneficios al instante y enviá el pase por WhatsApp.
            </p>
          </div>

          {/* Filters & Search */}
          <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
            {/* Filter Tabs */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setFilterTab("todos")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  filterTab === "todos"
                    ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs"
                    : "text-slate-500 hover:text-slate-800 dark:hover:text-white"
                }`}
              >
                Todos ({clients.length})
              </button>

              <button
                type="button"
                onClick={() => setFilterTab("con_premio")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                  filterTab === "con_premio"
                    ? "bg-amber-400 text-slate-950 font-black shadow-2xs"
                    : "text-slate-500 hover:text-slate-800 dark:hover:text-white"
                }`}
              >
                <Gift className="h-3 w-3" />
                <span>Premio Listo ({eligibleClients.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setFilterTab("vips")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                  filterTab === "vips"
                    ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs"
                    : "text-slate-500 hover:text-slate-800 dark:hover:text-white"
                }`}
              >
                <Flame className="h-3 w-3 text-amber-500" />
                <span>VIPs</span>
              </button>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar cliente..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-slate-900/80 pl-8 pr-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
          </div>
        </div>

        {/* Client Rows */}
        <div className="divide-y divide-slate-100 dark:divide-white/5">
          {filteredClients.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <Award className="mx-auto h-10 w-10 text-slate-300 dark:text-slate-600" />
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                No se encontraron clientes con este filtro
              </p>
              <p className="text-[11px] text-slate-400">
                Probá buscando por otro nombre o restablecé los filtros.
              </p>
            </div>
          ) : (
            filteredClients.map((client) => {
              const points = client.loyaltyPoints || 0;
              const threshold = loyalty.rewardThreshold;
              const canRedeem = points >= threshold;
              const isCopied = copiedId === client.id;
              const initials = client.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase();

              return (
                <div
                  key={client.id}
                  className="flex flex-col gap-3 py-4 lg:flex-row lg:items-center lg:justify-between hover:bg-slate-50/50 dark:hover:bg-slate-800/30 px-2 rounded-2xl transition"
                >
                  {/* Client Info */}
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-primary to-indigo-600 font-black text-white text-xs shadow-xs">
                      {initials}
                    </div>

                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900 dark:text-white truncate">
                          {client.name}
                        </span>
                        {client.tags.includes("VIP") && (
                          <span className="rounded-md bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-bold text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center gap-0.5">
                            <Flame className="h-3 w-3" /> VIP
                          </span>
                        )}
                        {canRedeem && (
                          <span className="rounded-full bg-emerald-100 dark:bg-emerald-950/80 px-2 py-0.5 text-[9.5px] font-black text-emerald-800 dark:text-emerald-300 animate-pulse border border-emerald-300 dark:border-emerald-800 flex items-center gap-1">
                            <Gift className="h-3 w-3" /> ¡Premio Listo!
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-mono">
                        <span>{client.phone}</span>
                        <span>•</span>
                        <span className="font-sans">Consumo: <strong className="text-slate-700 dark:text-slate-200">{formatGs(client.totalSpent)}</strong></span>
                        <span>•</span>
                        <span className="font-sans text-emerald-600 dark:text-emerald-400 font-bold">{client.loyaltyRedeemed || 0} canjes históricos</span>
                      </div>
                    </div>
                  </div>

                  {/* Stamps Row & Actions */}
                  <div className="flex flex-wrap items-center gap-3">
                    {/* Digital Stamps Progress */}
                    <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-2xl border border-slate-200/60 dark:border-white/5">
                      {Array.from({ length: threshold }).map((_, i) => {
                        const filled = i < points;
                        return (
                          <span
                            key={i}
                            className={`flex h-7 w-7 items-center justify-center rounded-xl text-xs font-bold transition ${
                              filled
                                ? "bg-amber-400 text-slate-950 shadow-xs scale-105"
                                : "bg-white dark:bg-slate-900 text-slate-300 dark:text-slate-600"
                            }`}
                            title={`Sello ${i + 1} de ${threshold}`}
                          >
                            <Award
                              className={`h-3.5 w-3.5 ${
                                filled ? "text-slate-950" : "text-slate-300 dark:text-slate-600"
                              }`}
                            />
                          </span>
                        );
                      })}
                    </div>

                    {/* Actions Buttons */}
                    <div className="flex items-center gap-1.5">
                      {/* Add Point (+1 Sello) */}
                      <button
                        type="button"
                        onClick={() => handleAddPoint(client.id, client.name)}
                        className="rounded-xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-slate-900/80 hover:bg-slate-50 dark:hover:bg-slate-800 px-3 py-1.5 text-xs font-bold text-slate-800 dark:text-slate-200 shadow-xs transition cursor-pointer"
                        title="Sumar +1 sello tras la visita"
                      >
                        +1 Sello
                      </button>

                      {/* Redeem Button (if eligible) */}
                      {canRedeem ? (
                        <button
                          type="button"
                          onClick={() => handleRedeem(client.id, client.name)}
                          className="inline-flex items-center gap-1 rounded-xl bg-amber-500 hover:bg-amber-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs transition cursor-pointer animate-bounce"
                        >
                          <Gift className="h-3.5 w-3.5" />
                          <span>Canjear Premio</span>
                        </button>
                      ) : (
                        <span className="text-[11px] font-semibold text-slate-400 px-1 font-mono">
                          Faltan {threshold - points}
                        </span>
                      )}

                      {/* WhatsApp Share Card Link */}
                      <a
                        href={getWhatsAppShareUrl(client.name, client.phone, client.id)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-3 py-1.5 text-xs font-bold text-white shadow-xs transition cursor-pointer"
                        title="Enviar tarjeta al WhatsApp del cliente"
                      >
                        <MessageCircle className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Enviar Tarjeta</span>
                      </a>

                      {/* Show QR Modal */}
                      <button
                        type="button"
                        onClick={() => setSelectedClientForQr(client)}
                        className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-slate-900/80 text-slate-600 dark:text-slate-300 hover:text-emerald-600 transition cursor-pointer"
                        title="Mostrar código QR del pase"
                      >
                        <QrCode className="h-4 w-4" />
                      </button>

                      {/* Copy Direct Card Link */}
                      <button
                        type="button"
                        onClick={() => handleCopyCardLink(client.id)}
                        className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-slate-900/80 text-slate-600 dark:text-slate-300 hover:text-primary transition cursor-pointer"
                        title="Copiar enlace de tarjeta digital"
                      >
                        {isCopied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                      </button>

                      {/* Open Card View in New Tab */}
                      <Link
                        href={getCardUrl(client.id)}
                        target="_blank"
                        className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-slate-900/80 text-slate-600 dark:text-slate-300 hover:text-primary transition cursor-pointer"
                        title="Abrir tarjeta web en una nueva pestaña"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </Card>

      {/* ═══ 6. QR SCAN & WEB LINK MODAL ═══ */}
      <Modal
        open={Boolean(selectedClientForQr)}
        onClose={() => setSelectedClientForQr(null)}
        title="Tarjeta Web Digital · Link Exclusivo"
        maxWidth="max-w-md"
      >
        {selectedClientForQr && (
          <div className="space-y-4 text-center text-xs">
            <div className="mx-auto w-12 h-12 flex items-center justify-center rounded-2xl bg-amber-400 text-slate-950 font-black text-sm shadow-md">
              <Crown className="h-6 w-6" />
            </div>

            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                {selectedClientForQr.name}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                {selectedClientForQr.phone}
              </p>
            </div>

            {/* QR Code Container */}
            <div className="mx-auto w-56 h-56 p-3 bg-white rounded-3xl border border-slate-200 shadow-inner flex items-center justify-center">
              {qrCodeDataUrl ? (
                <img
                  src={qrCodeDataUrl}
                  alt={`QR de ${selectedClientForQr.name}`}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="flex flex-col items-center justify-center gap-2 text-slate-400">
                  <span className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                  <span className="text-[10px]">Generando código...</span>
                </div>
              )}
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-white/10 text-left">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Enlace web del cliente:
              </span>
              <span className="font-mono text-[11px] text-slate-800 dark:text-slate-200 break-all select-all block">
                {getCardUrl(selectedClientForQr.id)}
              </span>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 max-w-xs mx-auto leading-relaxed">
              El cliente puede escanear este código QR con la cámara de su celular para abrir directamente su link personalizado y ver sus sellos acumulados en tiempo real.
            </p>

            <div className="pt-2 flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => handleCopyCardLink(selectedClientForQr.id)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200/80 dark:border-white/10 px-4 py-2 font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 transition cursor-pointer"
              >
                {copiedId === selectedClientForQr.id ? (
                  <>
                    <Check className="h-4 w-4 text-emerald-500" />
                    <span>Copiado</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    <span>Copiar Enlace</span>
                  </>
                )}
              </button>

              <a
                href={getWhatsAppShareUrl(selectedClientForQr.name, selectedClientForQr.phone, selectedClientForQr.id)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-4 py-2 font-bold text-white shadow-xs transition cursor-pointer"
              >
                <MessageCircle className="h-4 w-4" />
                <span>Enviar por WhatsApp</span>
              </a>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
