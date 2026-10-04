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
  Trash2,
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
import IosSegmentedControl from "@/components/dashboard/ui/IosSegmentedControl";
import { triggerHaptic } from "@/lib/haptics";
import { formatGs } from "@/lib/dashboard-dates";
import type { Client, LoyaltyRewardTier } from "@/lib/dashboard-types";

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

  // Normalize active reward tiers
  const activeRewards: LoyaltyRewardTier[] = useMemo(() => {
    if (loyalty.rewards && Array.isArray(loyalty.rewards) && loyalty.rewards.length > 0) {
      return [...loyalty.rewards].sort((a, b) => a.threshold - b.threshold);
    }
    return [
      {
        id: "rew-1",
        threshold: loyalty.rewardThreshold || 5,
        description: loyalty.rewardDescription || "50% OFF en tu próximo corte o servicio",
      },
    ];
  }, [loyalty.rewards, loyalty.rewardThreshold, loyalty.rewardDescription]);

  const [formSettings, setFormSettings] = useState({
    enabled: loyalty.enabled,
    mode: loyalty.mode || "stamps",
    pointsPerVisit: loyalty.pointsPerVisit || (loyalty.mode === "points" ? 10 : 1),
    rewards: activeRewards,
  });

  // Keep form in sync if store updates and user is not actively editing
  useEffect(() => {
    if (!editingSettings) {
      setFormSettings({
        enabled: loyalty.enabled,
        mode: loyalty.mode || "stamps",
        pointsPerVisit: loyalty.pointsPerVisit || (loyalty.mode === "points" ? 10 : 1),
        rewards: activeRewards,
      });
    }
  }, [loyalty, activeRewards, editingSettings]);

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

  // A client is eligible if they have reached at least the lowest reward threshold
  const minRewardThreshold = activeRewards[0]?.threshold || loyalty.rewardThreshold || 5;
  const eligibleClients = clients.filter(
    (c) => (c.loyaltyPoints || 0) >= minRewardThreshold
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
          return (c.loyaltyPoints || 0) >= minRewardThreshold;
        }
        if (filterTab === "vips") {
          return c.tags.includes("VIP");
        }

        return true;
      })
      .sort((a, b) => (b.loyaltyPoints || 0) - (a.loyaltyPoints || 0));
  }, [clients, search, filterTab, minRewardThreshold]);

  function handleAddRewardTier() {
    const lastTier = formSettings.rewards[formSettings.rewards.length - 1];
    const nextStep = formSettings.mode === "points" ? 50 : 5;
    const nextThreshold = lastTier ? lastTier.threshold + nextStep : 5;
    const newTier: LoyaltyRewardTier = {
      id: `rew-${Date.now()}`,
      threshold: nextThreshold,
      description: "Servicio o Beneficio Especial de Regalo",
    };
    setFormSettings({
      ...formSettings,
      rewards: [...formSettings.rewards, newTier],
    });
  }

  function handleRemoveRewardTier(id: string) {
    if (formSettings.rewards.length <= 1) return;
    setFormSettings({
      ...formSettings,
      rewards: formSettings.rewards.filter((r) => r.id !== id),
    });
  }

  function handleUpdateTier(id: string, patch: Partial<LoyaltyRewardTier>) {
    setFormSettings({
      ...formSettings,
      rewards: formSettings.rewards.map((r) => (r.id === id ? { ...r, ...patch } : r)),
    });
  }

  async function handleSaveSettings(e: React.FormEvent) {
    e.preventDefault();
    setIsSavingSettings(true);
    try {
      const validTiers = formSettings.rewards
        .map((r, index) => ({
          id: r.id || `rew-${Date.now()}-${index + 1}`,
          threshold: Math.max(1, Number(r.threshold) || 1),
          description: r.description.trim() || `Premio #${index + 1}`,
        }))
        .sort((a, b) => a.threshold - b.threshold);

      const patch = {
        enabled: formSettings.enabled,
        mode: formSettings.mode as "stamps" | "points",
        rewardThreshold: validTiers[0]?.threshold || 5,
        rewardDescription: validTiers[0]?.description || "Premio de fidelidad",
        pointsPerVisit: Number(formSettings.pointsPerVisit) || 1,
        rewards: validTiers,
      };

      const ok = await updateLoyalty(patch);
      setEditingSettings(false);
      if (ok !== false) {
        pushToast("success", "Premios y reglas actualizados y guardados en la base de datos.");
      } else {
        pushToast("error", "Se actualizaron localmente pero hubo un detalle al sincronizar con el servidor.");
      }
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

  function handleRedeem(clientId: string, clientName: string, tierThreshold?: number) {
    const pts = tierThreshold || minRewardThreshold;
    redeemClientReward(clientId, pts);
    pushToast("success", `¡Premio canjeado con éxito para ${clientName}! (-${pts} ${loyalty.mode === "points" ? "pts" : "sellos"})`);
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
      `¡Hola ${clientName}! 👋 Acá tenés tu Tarjeta Digital VIP de *${business.name}*:\n\n📲 ${cardUrl}\n\nPodés abrir tu enlace en cualquier momento para consultar tus sellos acumulados y premios. ¡Acumulás sellos en cada visita para canjear tus premios en *${business.name}*!`
    );
    return `https://wa.me/${cleanPhone}?text=${msg}`;
  }

  const displayName = userName || "Sebas Duarte";

  const eligiblePct = clients.length > 0 ? Math.round((eligibleClients.length / clients.length) * 100) : 0;
  const vipPct = clients.length > 0 ? Math.round((clients.filter((c) => c.tags.includes("VIP")).length / clients.length) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* ═══ CLEAN NATIVE PAGE HEADER ═══ */}
      <div
        data-tour="fidelizacion-header"
        className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between py-1"
      >
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Fidelización & Clientes VIP
        </h1>

        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold border transition ${
              loyalty.enabled
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                : "bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700"
            }`}
          >
            <Crown className="h-3.5 w-3.5 text-emerald-500" />
            <span>{loyalty.enabled ? "Club VIP Activo" : "Club en Pausa"}</span>
          </span>

          <button
            type="button"
            onClick={() => setEditingSettings(!editingSettings)}
            className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold text-white shadow-xs transition active:scale-95 cursor-pointer hover:brightness-110"
            style={{
              backgroundColor: business.primaryColor || "#FF4F2B",
            }}
          >
            <Settings className="h-3.5 w-3.5" />
            <span>{editingSettings ? "Cerrar" : "Configurar"}</span>
          </button>
        </div>
      </div>

      {/* ═══ MOBILE APPLE GLANCEABLE STAT CARD ═══ */}
      <div className="block md:hidden p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/10 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Socios VIP Activos
            </span>
            <span className="text-2xl font-black font-mono text-slate-900 dark:text-white">
              {clients.length} <span className="text-xs font-normal text-slate-400">clientes</span>
            </span>
          </div>
          <span className="px-3 py-1 rounded-xl text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-500/10 border border-amber-500/20">
            {loyalty.enabled ? "⭐ Programa Activo" : "Pausado"}
          </span>
        </div>
        <div className="pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>Sellos Entregados: <strong className="text-slate-800 dark:text-slate-200 font-mono">{totalPointsAwarded}</strong></span>
          <span>Canjes Reclamados: <strong className="text-emerald-600 dark:text-emerald-400 font-mono">{totalRewardsRedeemed}</strong></span>
        </div>
      </div>

      {/* ═══ DESKTOP APPLE INSET TELEMETRY & INTELLIGENCE CONTAINER ═══ */}
      <div className="hidden md:block rounded-[28px] bg-slate-100/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 p-4 sm:p-5 shadow-xs space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Card 1: Adhesión & Retención */}
          <div className="rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/70 dark:border-slate-700/60 p-5 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700/60">
              <div className="flex items-center gap-2.5">
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-xl text-white font-bold"
                  style={{ backgroundColor: business.primaryColor || "var(--primary, #FF4F2B)" }}
                >
                  <Award className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                    Retención & Beneficios Acumulados
                  </h3>
                  <p className="text-[11px] text-slate-400">Progreso de la base de clientes</p>
                </div>
              </div>

              <span className="text-xs font-mono font-bold text-slate-400">
                {clients.length} clientes totales
              </span>
            </div>

            {/* Circular Gauges */}
            <div className="py-4 grid grid-cols-2 gap-4">
              {/* Gauge 1: Clients with ready reward */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-800">
                <div className="relative h-12 w-12 shrink-0 flex items-center justify-center">
                  <svg className="h-12 w-12 -rotate-90" viewBox="0 0 44 44">
                    <circle
                      cx="22"
                      cy="22"
                      r="18"
                      className="stroke-slate-200 dark:stroke-slate-700"
                      strokeWidth="4"
                      fill="none"
                    />
                    <circle
                      cx="22"
                      cy="22"
                      r="18"
                      stroke={business.primaryColor || "var(--primary, #FF4F2B)"}
                      strokeWidth="4"
                      fill="none"
                      strokeDasharray={113}
                      strokeDashoffset={113 - (113 * Math.min(100, Math.max(0, eligiblePct))) / 100}
                      strokeLinecap="round"
                      className="transition-all duration-700"
                    />
                  </svg>
                  <span className="absolute text-[10px] font-black text-slate-800 dark:text-white font-mono">
                    {eligiblePct}%
                  </span>
                </div>
                <div className="min-w-0">
                  <span className="text-[11px] font-bold text-slate-900 dark:text-white block truncate">
                    Premio Listo
                  </span>
                  <span className="text-[10px] text-slate-400 block truncate">
                    {eligibleClients.length} de {clients.length} listos
                  </span>
                </div>
              </div>

              {/* Gauge 2: VIP Segment Share */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-800">
                <div className="relative h-12 w-12 shrink-0 flex items-center justify-center">
                  <svg className="h-12 w-12 -rotate-90" viewBox="0 0 44 44">
                    <circle
                      cx="22"
                      cy="22"
                      r="18"
                      className="stroke-slate-200 dark:stroke-slate-700"
                      strokeWidth="4"
                      fill="none"
                    />
                    <circle
                      cx="22"
                      cy="22"
                      r="18"
                      stroke="#10b981"
                      strokeWidth="4"
                      fill="none"
                      strokeDasharray={113}
                      strokeDashoffset={113 - (113 * Math.min(100, Math.max(0, vipPct))) / 100}
                      strokeLinecap="round"
                      className="transition-all duration-700"
                    />
                  </svg>
                  <span className="absolute text-[10px] font-black text-emerald-600 dark:text-emerald-400 font-mono">
                    {vipPct}%
                  </span>
                </div>
                <div className="min-w-0">
                  <span className="text-[11px] font-bold text-slate-900 dark:text-white block truncate">
                    Segmento VIP
                  </span>
                  <span className="text-[10px] text-slate-400 block truncate">
                    Clientes recurrentes
                  </span>
                </div>
              </div>
            </div>

            {/* Operational Telemetry Rows */}
            <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100 dark:border-slate-700/60 text-xs">
              <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800/80">
                <span className="text-[10px] font-medium text-slate-400 block">Sellos Otorgados</span>
                <span className="text-xs font-black text-slate-900 dark:text-white font-mono">
                  {totalPointsAwarded} {loyalty.mode === "points" ? "pts" : "sellos"}
                </span>
              </div>
              <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800/80">
                <span className="text-[10px] font-medium text-slate-400 block">Premios Canjeados</span>
                <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 font-mono">
                  {totalRewardsRedeemed} premios
                </span>
              </div>
              <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800/80">
                <span className="text-[10px] font-medium text-slate-400 block">Listos p/ Canje</span>
                <span className="text-xs font-black text-amber-600 dark:text-amber-400 font-mono">
                  {eligibleClients.length} clientes
                </span>
              </div>
            </div>
          </div>

          {/* Card 2: Reglas & Escala de Premios */}
          <div className="rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/70 dark:border-slate-700/60 p-5 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700/60">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 font-bold">
                  <Gift className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                    Escala de Premios & Enlace Web
                  </h3>
                  <p className="text-[11px] text-slate-400">Modalidad: {loyalty.mode === "points" ? "Puntos" : "Sellos por visita"}</p>
                </div>
              </div>

              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                +{loyalty.mode === "points" ? `${loyalty.pointsPerVisit} pts` : "1 sello"} / visita
              </span>
            </div>

            {/* URL Box */}
            <div className="py-2.5">
              <span className="text-[10px] text-slate-400 block font-medium mb-1">
                Estructura de Tarjeta Digital Móvil:
              </span>
              <div className="font-mono text-xs text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800 rounded-xl px-3 py-2 select-all">
                agendate.py/{business.slug || "salon"}/tarjeta/<span className="text-emerald-600 dark:text-emerald-400 font-bold">[id-cliente]</span>
              </div>
            </div>

            {/* Tiers List */}
            <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-700/60">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                Premios Configurados ({activeRewards.length})
              </span>
              <div className="flex flex-wrap gap-1.5">
                {activeRewards.map((tier, idx) => (
                  <span
                    key={tier.id || idx}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200/60 dark:border-slate-700"
                  >
                    <span className="font-bold text-amber-600 dark:text-amber-400">
                      {tier.threshold} {loyalty.mode === "points" ? "pts" : "sellos"}:
                    </span>
                    <span className="truncate max-w-[150px]">{tier.description}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ 2. COMPACT SUMMARY & CLIENT WEB CARD PREVIEW (LIGHT & DARK THEMED) ═══ */}
      <div
        data-tour="fidelizacion-wallet-banner"
        className="rounded-2xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-900 dark:text-white p-4 sm:p-5 shadow-xs transition"
      >
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
          {/* Left Column: Compact Rule & Custom Link Info */}
          <div className="md:col-span-7 space-y-2.5">
            <div className="inline-flex items-center gap-1.5 rounded-md bg-slate-100 dark:bg-white/10 px-2.5 py-0.5 text-[11px] font-semibold text-slate-700 dark:text-slate-200">
              <Globe className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
              <span>Formato de Enlace Web Exclusivo</span>
            </div>

            <div>
              <div className="font-mono text-xs text-emerald-700 dark:text-emerald-400 bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-lg px-3 py-1.5 inline-block select-all">
                agendate.py/{business.slug || "salon"}/tarjeta/<span className="text-slate-400 dark:text-white/60">[id-cliente]</span>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-w-lg">
              Regla activa: cada cliente suma <strong>{loyalty.mode === "points" ? `${loyalty.pointsPerVisit} pts` : "1 sello"}</strong> por turno asistido.
              {activeRewards.length > 1 ? (
                <span> Tenés <strong>{activeRewards.length} premios escalonados</strong> configurados para premiar la recurrencia.</span>
              ) : (
                <span> Al alcanzar <strong>{loyalty.rewardThreshold} {loyalty.mode === "points" ? "puntos" : "sellos"}</strong>, desbloquea: <span className="text-emerald-600 dark:text-emerald-300 font-semibold">{loyalty.rewardDescription}</span>.</span>
              )}
            </p>

            {/* Configured Rewards Chips */}
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              {activeRewards.map((tier, idx) => (
                <span
                  key={tier.id || idx}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] bg-slate-100 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 text-slate-700 dark:text-slate-200"
                >
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {tier.threshold} {loyalty.mode === "points" ? "pts" : "sellos"}:
                  </span>
                  <span className="truncate max-w-[170px]">{tier.description}</span>
                </span>
              ))}
            </div>
          </div>

          {/* Right Column: Sleek Mini Web Card Preview (Themed) */}
          <div className="md:col-span-5 flex justify-center md:justify-end">
            <div className="w-full max-w-xs rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-white/10 p-3.5 space-y-2.5 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-white/10 pb-2">
                <div className="min-w-0">
                  <h4 className="font-bold text-xs truncate text-slate-900 dark:text-white">{business.name}</h4>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">Tarjeta Digital VIP</span>
                </div>
                <span className="text-[9px] font-mono bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/20 font-bold">
                  ACTIVO
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <div>
                  <span className="text-[9.5px] text-slate-500 dark:text-slate-400 block">Titular:</span>
                  <span className="font-bold text-slate-900 dark:text-white text-xs">{displayName}</span>
                </div>
                <div className="text-right">
                  <span className="text-[9.5px] text-slate-500 dark:text-slate-400 block">Progreso:</span>
                  <span className="font-extrabold text-emerald-600 dark:text-emerald-400 text-xs">
                    {Math.min(4, activeRewards[0]?.threshold || 5)} / {activeRewards[0]?.threshold || 5} sellos
                  </span>
                </div>
              </div>

              {/* Compact Stamp Dots */}
              <div className="flex items-center gap-1.5 pt-0.5">
                {Array.from({ length: Math.min(activeRewards[0]?.threshold || 5, 8) }).map((_, i) => {
                  const filled = i < 4;
                  return (
                    <div
                      key={i}
                      className={`h-5 w-5 rounded-full flex items-center justify-center text-[9px] font-bold transition ${
                        filled
                          ? "bg-emerald-500 text-white font-black shadow-2xs"
                          : "border border-slate-300 dark:border-white/20 text-slate-400"
                      }`}
                    >
                      {filled ? "✓" : i + 1}
                    </div>
                  );
                })}
              </div>

              <div className="rounded-lg bg-white dark:bg-white/5 border border-slate-200/80 dark:border-white/5 px-2.5 py-1 text-[10px] text-slate-700 dark:text-slate-300 truncate">
                🎁 1° Premio: <strong className="text-slate-900 dark:text-white">{activeRewards[0]?.description || loyalty.rewardDescription}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ 3. CONFIGURATION PANEL & MULTI-REWARDS BUILDER (ALWAYS IN DOM FOR TOUR STEP 4) ═══ */}
      <Card data-tour="fidelizacion-config-card" className="border border-slate-200/80 dark:border-white/10 p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 dark:border-white/5 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <SlidersHorizontal className="h-4.5 w-4.5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Reglas & Premios del Programa</span>
                <span className="text-[10px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                  {formSettings.rewards.length} {formSettings.rewards.length === 1 ? "Premio" : "Premios"}
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Personalizá la acumulación por visita y configurá uno o múltiples premios escalonados.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setEditingSettings(!editingSettings)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/10 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              {editingSettings ? "Ocultar Editor" : "Editar Premios & Reglas"}
            </button>
          </div>
        </div>

        {/* If collapsed: Clean summary view */}
        {!editingSettings ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-1">
            {activeRewards.map((tier, idx) => (
              <div
                key={tier.id || idx}
                className="p-3.5 rounded-xl border border-slate-200/80 dark:border-white/10 bg-slate-50/70 dark:bg-slate-900/60 space-y-1.5"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-extrabold text-primary">Premio #{idx + 1}</span>
                  <span className="font-mono text-[11px] font-bold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200/60 dark:border-white/10">
                    {tier.threshold} {loyalty.mode === "points" ? "puntos" : "visitas"}
                  </span>
                </div>
                <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                  {tier.description}
                </p>
              </div>
            ))}
          </div>
        ) : (
          /* If expanded: Full multi-rewards interactive form */
          <form onSubmit={handleSaveSettings} className="space-y-5 text-xs pt-1">
            {/* Mode selection & Active status */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/70 dark:border-white/10">
              <div>
                <span className="font-bold text-slate-900 dark:text-white block">Modalidad del Programa</span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  {formSettings.mode === "stamps"
                    ? "Tarjeta de Sellos: 1 sello por cada visita o servicio asistido."
                    : "Tarjeta de Puntos: acumulación de puntos por cita o consumo."}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setFormSettings({ ...formSettings, mode: "stamps" })}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs border transition cursor-pointer ${
                    formSettings.mode === "stamps"
                      ? "bg-primary text-white border-primary shadow-xs"
                      : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/10"
                  }`}
                >
                  Sellos por Visita
                </button>
                <button
                  type="button"
                  onClick={() => setFormSettings({ ...formSettings, mode: "points" })}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs border transition cursor-pointer ${
                    formSettings.mode === "points"
                      ? "bg-primary text-white border-primary shadow-xs"
                      : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/10"
                  }`}
                >
                  Puntos
                </button>

                <label className="flex items-center gap-2 ml-2 pl-3 border-l border-slate-200 dark:border-white/10 cursor-pointer font-bold text-slate-700 dark:text-slate-200">
                  <input
                    type="checkbox"
                    checked={formSettings.enabled}
                    onChange={(e) => setFormSettings({ ...formSettings, enabled: e.target.checked })}
                    className="h-4 w-4 rounded text-primary focus:ring-primary cursor-pointer"
                  />
                  <span>Activo</span>
                </label>
              </div>
            </div>

            {/* Multiple Rewards Tier Builder */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-xs">
                    Premios Escalonados Configurables
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Definí los premios que se desbloquean a medida que el cliente acumula visitas o puntos.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleAddRewardTier}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-dashed border-primary text-primary font-bold text-xs hover:bg-primary/5 transition cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Agregar Premio</span>
                </button>
              </div>

              <div className="space-y-2.5">
                {formSettings.rewards.map((tier, idx) => (
                  <div
                    key={tier.id || idx}
                    className="p-3.5 rounded-xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900 space-y-2 shadow-2xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-xs text-primary flex items-center gap-1.5">
                        <Gift className="h-3.5 w-3.5" />
                        <span>Premio #{idx + 1}</span>
                      </span>

                      {formSettings.rewards.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveRewardTier(tier.id)}
                          className="text-slate-400 hover:text-rose-600 transition p-1"
                          title="Eliminar este escalón de premio"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                      <div className="sm:col-span-4">
                        <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                          {formSettings.mode === "points" ? "Puntos requeridos:" : "Visitas / Sellos requeridos:"}
                        </label>
                        <input
                          type="number"
                          min="1"
                          max={formSettings.mode === "points" ? 5000 : 50}
                          value={tier.threshold}
                          onChange={(e) =>
                            handleUpdateTier(tier.id, { threshold: Number(e.target.value) || 1 })
                          }
                          className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800 px-3 py-2 font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/40 focus:outline-none"
                        />
                      </div>

                      <div className="sm:col-span-8">
                        <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                          Descripción del Beneficio:
                        </label>
                        <input
                          type="text"
                          value={tier.description}
                          onChange={(e) =>
                            handleUpdateTier(tier.id, { description: e.target.value })
                          }
                          placeholder="Ej. 50% OFF en próximo servicio, Producto gratis..."
                          className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800 px-3 py-2 font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/40 focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Quick suggestion presets chips */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-[10px] text-slate-400 font-semibold mr-1">Sugerir:</span>
                      {REWARD_PRESETS.map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => handleUpdateTier(tier.id, { description: preset })}
                          className="px-2 py-0.5 rounded-md text-[10px] font-semibold border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 transition cursor-pointer"
                        >
                          {preset}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Form actions */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-white/10">
              <button
                type="button"
                onClick={() => setEditingSettings(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-white/10 font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={isSavingSettings}
                className="inline-flex items-center gap-2 rounded-xl bg-primary hover:opacity-90 px-5 py-2 font-bold text-white shadow-xs transition cursor-pointer disabled:opacity-50"
              >
                {isSavingSettings ? (
                  <>
                    <span className="h-3.5 w-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    <span>Guardando en BD...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Guardar Reglas & Premios en BD</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </Card>

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
            <div className="w-full sm:w-auto">
              <IosSegmentedControl
                options={[
                  { value: "todos", label: `Todos (${clients.length})` },
                  {
                    value: "con_premio",
                    label: "Premio Listo",
                    badge: eligibleClients.length > 0 ? eligibleClients.length : undefined,
                  },
                  { value: "vips", label: "VIPs" },
                ]}
                value={filterTab}
                onChange={(val) => {
                  setFilterTab(val as any);
                  triggerHaptic("selection");
                }}
                layoutId="fidelizacionTabSegment"
                className="w-full sm:w-auto"
              />
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
              const threshold = activeRewards[0]?.threshold || loyalty.rewardThreshold || 5;
              const maxThreshold = activeRewards[activeRewards.length - 1]?.threshold || threshold;
              const unlockedTiers = activeRewards.filter((r) => points >= r.threshold);
              const highestUnlocked = unlockedTiers[unlockedTiers.length - 1];
              const canRedeem = unlockedTiers.length > 0;
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
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-sm text-slate-900 dark:text-white truncate">
                          {client.name}
                        </span>
                        {client.tags.includes("VIP") && (
                          <span className="rounded-md bg-indigo-500/10 px-1.5 py-0.5 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 flex items-center gap-0.5">
                            <Crown className="h-3 w-3" /> VIP
                          </span>
                        )}
                        {canRedeem && (
                          <span className="rounded-full bg-emerald-100 dark:bg-emerald-950/80 px-2 py-0.5 text-[9.5px] font-black text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1">
                            <Gift className="h-3 w-3" />
                            <span>{unlockedTiers.length > 1 ? `${unlockedTiers.length} Premios: ` : "Premio: "}</span>
                            <span className="truncate max-w-[130px]">{highestUnlocked?.description}</span>
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
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full lg:w-auto">
                    {/* Digital Stamps Progress */}
                    <div className="w-full sm:w-auto overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden py-0.5">
                      <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-2xl border border-slate-200/60 dark:border-white/5 w-max">
                        {Array.from({ length: Math.min(maxThreshold, 10) }).map((_, i) => {
                          const filled = i < points;
                          return (
                            <span
                              key={i}
                              className={`flex h-6.5 w-6.5 sm:h-7 sm:w-7 items-center justify-center rounded-xl text-xs font-bold transition shrink-0 ${
                                filled
                                  ? "bg-emerald-500 text-white shadow-2xs scale-105"
                                  : "bg-white dark:bg-slate-900 text-slate-300 dark:text-slate-600"
                              }`}
                              title={`Sello ${i + 1} de ${maxThreshold}`}
                            >
                              <Award
                                className={`h-3.5 w-3.5 ${
                                  filled ? "text-white" : "text-slate-300 dark:text-slate-600"
                                }`}
                              />
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    {/* Actions Buttons */}
                    <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
                      {/* Add Point (+1 Sello) */}
                      <button
                        type="button"
                        onClick={() => {
                          triggerHaptic("medium");
                          handleAddPoint(client.id, client.name);
                        }}
                        className="rounded-xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-slate-900/80 hover:bg-slate-50 dark:hover:bg-slate-800 px-3 py-1.5 text-xs font-bold text-slate-800 dark:text-slate-200 shadow-xs transition active:scale-95 cursor-pointer shrink-0"
                        title="Sumar +1 sello tras la visita"
                      >
                        +1 Sello
                      </button>

                      {/* Redeem Button (if eligible) */}
                      {canRedeem ? (
                        <button
                          type="button"
                          onClick={() => {
                            triggerHaptic("success");
                            handleRedeem(
                              client.id,
                              client.name,
                              highestUnlocked ? highestUnlocked.threshold : threshold
                            );
                          }}
                          className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-3 py-1.5 text-xs font-bold text-white shadow-xs transition active:scale-95 cursor-pointer shrink-0"
                        >
                          <Gift className="h-3.5 w-3.5" />
                          <span>Canjear</span>
                        </button>
                      ) : (
                        <span className="text-[11px] font-semibold text-slate-400 px-1 font-mono shrink-0">
                          Faltan {threshold - points}
                        </span>
                      )}

                      {/* WhatsApp Share Card Link */}
                      <a
                        href={getWhatsAppShareUrl(client.name, client.phone, client.id)}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => triggerHaptic("light")}
                        className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-2.5 sm:px-3 py-1.5 text-xs font-bold text-white shadow-xs transition active:scale-95 cursor-pointer shrink-0"
                        title="Enviar tarjeta al WhatsApp del cliente"
                      >
                        <MessageCircle className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Enviar Tarjeta</span>
                      </a>

                      {/* Show QR Modal */}
                      <button
                        type="button"
                        onClick={() => {
                          triggerHaptic("selection");
                          setSelectedClientForQr(client);
                        }}
                        className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-slate-900/80 text-slate-600 dark:text-slate-300 hover:text-emerald-600 transition active:scale-95 cursor-pointer shrink-0"
                        title="Mostrar código QR del pase"
                      >
                        <QrCode className="h-4 w-4" />
                      </button>

                      {/* Copy Direct Card Link */}
                      <button
                        type="button"
                        onClick={() => handleCopyCardLink(client.id)}
                        className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-slate-900/80 text-slate-600 dark:text-slate-300 hover:text-primary transition cursor-pointer shrink-0"
                        title="Copiar enlace de tarjeta digital"
                      >
                        {isCopied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                      </button>

                      {/* Open Card View in New Tab */}
                      <Link
                        href={getCardUrl(client.id)}
                        target="_blank"
                        className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-slate-900/80 text-slate-600 dark:text-slate-300 hover:text-primary transition cursor-pointer shrink-0"
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
