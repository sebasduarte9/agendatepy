"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import {
  Award,
  BarChart3,
  Check,
  CheckCircle2,
  Copy,
  Crown,
  ExternalLink,
  Gift,
  MessageCircle,
  Plus,
  QrCode,
  Search,
  Settings,
  Trash2,
  UserMinus,
  X,
} from "lucide-react";
import QRCode from "qrcode";
import { useDashboardStore } from "@/store/useDashboardStore";
import Modal from "@/components/dashboard/ui/Modal";
import { triggerHaptic } from "@/lib/haptics";
import { formatGs, normalizeParaguayPhone } from "@/lib/dashboard-dates";
import type { Client, LoyaltyRewardTier } from "@/lib/dashboard-types";
import { tenantHost } from "@/lib/tenant/public-url";

const REWARD_PRESETS = [
  "50% OFF en tu próximo corte o servicio",
  "Corte o perfilado de barba de regalo",
  "Tratamiento de nutrición capilar gratis",
  "Cera capilar de regalo",
  "Servicio completo gratis (corte + barba)",
];

const PAGE_SIZE = 12;
const INACTIVE_DAYS = 30;

const FILTERS = [
  { value: "todos", label: "Todos" },
  { value: "con_premio", label: "Premio listo" },
  { value: "inactivos", label: `Sin venir +${INACTIVE_DAYS} días` },
  { value: "vips", label: "VIP" },
] as const;

type FilterValue = (typeof FILTERS)[number]["value"];

const INPUT_CLASS =
  "min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-white/10 dark:bg-slate-800 dark:text-white sm:min-h-10 sm:text-sm";
const LABEL_CLASS = "mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300";

const chartTooltipStyle = {
  backgroundColor: "rgba(22, 19, 24, 0.92)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  borderRadius: "14px",
  border: "1px solid rgba(255, 255, 255, 0.12)",
  boxShadow: "0 16px 40px rgba(0, 0, 0, 0.55)",
  color: "#f6f3ef",
  fontSize: "12px",
  padding: "10px 14px",
};

function initialsOf(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  return (parts[0][0] + (parts[1]?.[0] ?? "")).toUpperCase();
}

function isInactive(client: Client, now: number) {
  if (!client.lastVisit) return false;
  return now - new Date(client.lastVisit).getTime() > INACTIVE_DAYS * 24 * 60 * 60 * 1000;
}

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
  const brandColor = business.primaryColor || "#FF4F2B";

  const [search, setSearch] = useState("");
  const [filterTab, setFilterTab] = useState<FilterValue>("todos");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [qrClient, setQrClient] = useState<Client | null>(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState("");
  const [redeemClient, setRedeemClient] = useState<Client | null>(null);
  const [redeemTierId, setRedeemTierId] = useState<string | null>(null);
  const [now] = useState(() => Date.now());

  const isPoints = loyalty.mode === "points";
  const perVisit = isPoints ? Math.max(1, loyalty.pointsPerVisit || 1) : 1;
  const unitShort = isPoints ? "pts" : "sellos";
  const unitLabel = (n: number) => (isPoints ? `${n} ${n === 1 ? "punto" : "puntos"}` : `${n} ${n === 1 ? "sello" : "sellos"}`);

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

  const minThreshold = activeRewards[0]?.threshold || 5;
  const maxThreshold = activeRewards[activeRewards.length - 1]?.threshold || minThreshold;

  const [formSettings, setFormSettings] = useState({
    enabled: loyalty.enabled,
    mode: (loyalty.mode || "stamps") as "stamps" | "points",
    pointsPerVisit: loyalty.pointsPerVisit || 10,
    rewards: activeRewards,
  });

  // KPIs
  const totalInCirculation = clients.reduce((sum, c) => sum + (c.loyaltyPoints || 0), 0);
  const totalRewardsRedeemed = clients.reduce((sum, c) => sum + (c.loyaltyRedeemed || 0), 0);
  const eligibleClients = clients.filter((c) => (c.loyaltyPoints || 0) >= minThreshold);
  const activeMembers = clients.filter((c) => (c.loyaltyPoints || 0) > 0);
  const inactiveWithProgress = clients.filter((c) => (c.loyaltyPoints || 0) > 0 && isInactive(c, now));

  const stages = [
    {
      key: "none",
      label: `Sin ${unitShort}`,
      count: clients.length - activeMembers.length,
      color: "#71717a",
    },
    {
      key: "progress",
      label: "En camino",
      count: activeMembers.length - eligibleClients.length,
      color: brandColor,
    },
    { key: "ready", label: "Premio listo", count: eligibleClients.length, color: "#10b981" },
  ];

  // Distribution of clients by accumulated stamps/points
  const distribution = useMemo(() => {
    const buckets: Array<{ label: string; min: number; max: number }> = [];
    if (!isPoints && maxThreshold <= 15) {
      for (let i = 0; i < maxThreshold; i++) buckets.push({ label: String(i), min: i, max: i });
      buckets.push({ label: `${maxThreshold}+`, min: maxThreshold, max: Infinity });
    } else {
      const size = Math.max(1, Math.ceil(maxThreshold / 5));
      for (let i = 0; i < 5; i++) {
        buckets.push({ label: `${i * size}–${(i + 1) * size - 1}`, min: i * size, max: (i + 1) * size - 1 });
      }
      buckets.push({ label: `${5 * size}+`, min: 5 * size, max: Infinity });
    }
    return buckets.map((b) => ({
      label: b.label,
      count: clients.filter((c) => {
        const p = c.loyaltyPoints || 0;
        return p >= b.min && p <= b.max;
      }).length,
      ready: b.min >= minThreshold,
    }));
  }, [clients, isPoints, maxThreshold, minThreshold]);

  const filteredClients = useMemo(() => {
    const q = search.trim().toLowerCase();
    return clients
      .filter((c) => {
        if (q) {
          const matches =
            c.name.toLowerCase().includes(q) ||
            c.phone.includes(q) ||
            (c.instagram && c.instagram.toLowerCase().includes(q));
          if (!matches) return false;
        }
        if (filterTab === "con_premio") return (c.loyaltyPoints || 0) >= minThreshold;
        if (filterTab === "vips") return c.tags.includes("VIP");
        if (filterTab === "inactivos") return (c.loyaltyPoints || 0) > 0 && isInactive(c, now);
        return true;
      })
      .sort((a, b) => (b.loyaltyPoints || 0) - (a.loyaltyPoints || 0));
  }, [clients, search, filterTab, minThreshold, now]);

  // Pagination resets on its own whenever the filter combination changes
  const filterKey = `${filterTab}|${search.trim()}`;
  const [paging, setPaging] = useState({ key: filterKey, count: PAGE_SIZE });
  const visibleCount = paging.key === filterKey ? paging.count : PAGE_SIZE;
  const visibleClients = filteredClients.slice(0, visibleCount);

  const filterCounts: Record<FilterValue, number> = {
    todos: clients.length,
    con_premio: eligibleClients.length,
    inactivos: inactiveWithProgress.length,
    vips: clients.filter((c) => c.tags.includes("VIP")).length,
  };

  // Real client for the card preview: the one closest to (or past) a reward
  const previewClient = useMemo(
    () => [...clients].sort((a, b) => (b.loyaltyPoints || 0) - (a.loyaltyPoints || 0))[0] ?? null,
    [clients]
  );
  const previewPoints = previewClient?.loyaltyPoints ?? Math.max(0, minThreshold - 1);

  function getCardUrl(clientId: string) {
    const origin = typeof window !== "undefined" ? window.location.origin : "https://agendate.py";
    return `${origin}/${business.slug || "barberia"}/tarjeta/${clientId}`;
  }

  function getWhatsAppShareUrl(client: Client) {
    const msg = encodeURIComponent(
      `¡Hola ${client.name}! Acá tenés tu tarjeta de fidelidad de *${business.name}*:\n\n${getCardUrl(client.id)}\n\nAbrila cuando quieras para ver tus ${unitShort} y tus premios disponibles.`
    );
    return `https://wa.me/${normalizeParaguayPhone(client.phone).replace(/\D/g, "")}?text=${msg}`;
  }

  async function handleCopyCardLink(clientId: string) {
    try {
      await navigator.clipboard.writeText(getCardUrl(clientId));
      setCopiedId(clientId);
      pushToast("success", "Enlace de la tarjeta copiado.");
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      pushToast("error", "No se pudo copiar el enlace.");
    }
  }

  async function openQr(client: Client) {
    triggerHaptic("selection");
    setQrClient(client);
    setQrCodeDataUrl("");
    try {
      const url = await QRCode.toDataURL(getCardUrl(client.id), {
        width: 256,
        margin: 1,
        color: { dark: "#0f172a", light: "#ffffff" },
      });
      setQrCodeDataUrl(url);
    } catch (err) {
      console.error("Error generando QR:", err);
    }
  }

  function handleAddPoint(client: Client) {
    triggerHaptic("medium");
    addClientLoyaltyPoint(client.id, perVisit);
    pushToast("success", `+${unitLabel(perVisit)} para ${client.name}`);
  }

  function openRedeem(client: Client) {
    const unlocked = activeRewards.filter((r) => (client.loyaltyPoints || 0) >= r.threshold);
    setRedeemClient(client);
    setRedeemTierId(unlocked[unlocked.length - 1]?.id ?? null);
  }

  async function handleConfirmRedeem() {
    if (!redeemClient) return;
    const tier = activeRewards.find((r) => r.id === redeemTierId);
    if (!tier) return;
    const client = redeemClient;
    triggerHaptic("success");
    setRedeemClient(null);
    const ok = await redeemClientReward(client.id, tier.threshold, tier.description);
    if (ok) {
      pushToast("success", `Premio canjeado para ${client.name}: ${tier.description}`);
    } else {
      pushToast("error", `No se pudo registrar el canje de ${client.name}. Probá de nuevo.`);
    }
  }

  function openSettings() {
    setFormSettings({
      enabled: loyalty.enabled,
      mode: (loyalty.mode || "stamps") as "stamps" | "points",
      pointsPerVisit: loyalty.pointsPerVisit && loyalty.mode === "points" ? loyalty.pointsPerVisit : 10,
      rewards: activeRewards,
    });
    setIsSettingsOpen(true);
  }

  function handleAddRewardTier() {
    const lastTier = formSettings.rewards[formSettings.rewards.length - 1];
    const nextStep = formSettings.mode === "points" ? 50 : 5;
    setFormSettings({
      ...formSettings,
      rewards: [
        ...formSettings.rewards,
        {
          id: `rew-${Date.now()}`,
          threshold: lastTier ? lastTier.threshold + nextStep : 5,
          description: "",
        },
      ],
    });
  }

  function handleUpdateTier(id: string, patch: Partial<LoyaltyRewardTier>) {
    setFormSettings({
      ...formSettings,
      rewards: formSettings.rewards.map((r) => (r.id === id ? { ...r, ...patch } : r)),
    });
  }

  function handleRemoveRewardTier(id: string) {
    if (formSettings.rewards.length <= 1) return;
    setFormSettings({ ...formSettings, rewards: formSettings.rewards.filter((r) => r.id !== id) });
  }

  async function handleSaveSettings(e: React.FormEvent) {
    e.preventDefault();
    setIsSavingSettings(true);
    try {
      const validTiers = formSettings.rewards
        .map((r, index) => ({
          id: r.id || `rew-${Date.now()}-${index + 1}`,
          threshold: Math.max(1, Math.round(Number(r.threshold) || 1)),
          description: r.description.trim() || `Premio #${index + 1}`,
        }))
        .sort((a, b) => a.threshold - b.threshold);

      const ok = await updateLoyalty({
        enabled: formSettings.enabled,
        mode: formSettings.mode,
        rewardThreshold: validTiers[0]?.threshold || 5,
        rewardDescription: validTiers[0]?.description || "Premio de fidelidad",
        pointsPerVisit: formSettings.mode === "points" ? Math.max(1, Number(formSettings.pointsPerVisit) || 1) : 1,
        rewards: validTiers,
      });
      setIsSettingsOpen(false);
      if (ok !== false) {
        pushToast("success", "Programa de fidelidad actualizado.");
      } else {
        pushToast("error", "Se guardó en este dispositivo, pero no se pudo sincronizar con el servidor.");
      }
    } catch (err) {
      console.error("Error guardando reglas de fidelización:", err);
      pushToast("error", "Hubo un error al guardar las reglas.");
    } finally {
      setIsSavingSettings(false);
    }
  }

  const redeemUnlocked = redeemClient
    ? activeRewards.filter((r) => (redeemClient.loyaltyPoints || 0) >= r.threshold)
    : [];

  return (
    <div className="w-full max-w-full space-y-5 pb-24 sm:space-y-6 sm:pb-10">
      {/* ═══ PAGE HEADER ═══ */}
      <header
        data-tour="fidelizacion-header"
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">Programa de fidelidad</p>
          <h1 className="mt-1 flex flex-wrap items-center gap-2.5 text-2xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            Fidelización
            <span
              className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold tracking-normal ${
                loyalty.enabled
                  ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                  : "border-slate-300/60 bg-slate-500/10 text-slate-600 dark:border-white/10 dark:text-zinc-400"
              }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${loyalty.enabled ? "bg-emerald-500" : "bg-slate-400"}`} />
              {loyalty.enabled ? "Activo" : "En pausa"}
            </span>
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-500 dark:text-zinc-400">
            Premiá a tus clientes frecuentes con {isPoints ? "puntos" : "sellos"} por visita y premios escalonados.
          </p>
        </div>
        <button
          type="button"
          onClick={openSettings}
          className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl px-4 text-sm font-semibold text-white shadow-sm transition hover:brightness-110 active:scale-[0.98] sm:w-auto"
          style={{ backgroundColor: brandColor }}
        >
          <Settings className="h-4 w-4" />
          Configurar programa
        </button>
      </header>

      {/* ═══ SUMMARY + CHARTS ═══ */}
      <section data-tour="fidelizacion-kpis" className="rounded-3xl glass-panel p-3 sm:p-5">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white sm:text-base">Resumen del programa</h2>
            <p className="mt-0.5 hidden text-xs text-slate-500 dark:text-zinc-400 sm:block">
              Cada turno completado suma {unitLabel(perVisit)} automáticamente.
            </p>
          </div>
          <span className="hidden text-xs text-slate-500 dark:text-zinc-400 sm:inline">
            {clients.length} {clients.length === 1 ? "cliente" : "clientes"} en tu base
          </span>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-white/10 pt-3 sm:mt-4 sm:grid-cols-4 sm:gap-y-0 sm:pt-4">
          {[
            {
              label: "Clientes participando",
              value: activeMembers.length.toLocaleString("es-PY"),
              detail: `con al menos 1 ${isPoints ? "punto" : "sello"}`,
            },
            {
              label: "Premio listo",
              value: eligibleClients.length.toLocaleString("es-PY"),
              detail: "pueden canjear hoy",
              tone: eligibleClients.length > 0 ? "text-emerald-600 dark:text-emerald-400" : undefined,
            },
            {
              label: `${isPoints ? "Puntos" : "Sellos"} acumulados`,
              value: totalInCirculation.toLocaleString("es-PY"),
              detail: "sin canjear todavía",
            },
            {
              label: "Premios canjeados",
              value: totalRewardsRedeemed.toLocaleString("es-PY"),
              detail: `meta inicial: ${unitLabel(minThreshold)}`,
            },
          ].map((metric) => (
            <div key={metric.label} className="min-w-0">
              <p className="truncate text-[11px] font-medium text-slate-500 dark:text-zinc-400">{metric.label}</p>
              <p
                className={`mt-1 truncate text-base font-semibold tabular-nums sm:text-xl ${
                  metric.tone ?? "text-slate-900 dark:text-white"
                }`}
              >
                {metric.value}
              </p>
              <p className="mt-0.5 truncate text-[11px] text-slate-500 dark:text-zinc-500">{metric.detail}</p>
            </div>
          ))}
        </div>

        {clients.length > 0 && (
          <div className="mt-3 grid grid-cols-1 gap-3 sm:mt-4 lg:grid-cols-5">
            {/* Chart 1: distribution */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-3 sm:p-4 lg:col-span-3">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h3 className="text-xs font-semibold text-slate-800 dark:text-zinc-200">Avance de tus clientes</h3>
                  <p className="mt-0.5 text-[11px] text-slate-500 dark:text-zinc-400">
                    Clientes según los {unitShort} que tienen acumulados
                  </p>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-zinc-400">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-sm" style={{ backgroundColor: brandColor }} />
                    En camino
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-sm bg-emerald-500" />
                    Premio listo
                  </span>
                </div>
              </div>
              <div className="mt-3 h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={distribution} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                    <XAxis dataKey="label" stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis allowDecimals={false} stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={chartTooltipStyle}
                      cursor={{ fill: "rgba(255,255,255,0.05)" }}
                      labelFormatter={(label) => `${label} ${unitShort}`}
                      formatter={(val) => [`${val} ${Number(val) === 1 ? "cliente" : "clientes"}`, "Clientes"]}
                    />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={36} animationDuration={700}>
                      {distribution.map((d) => (
                        <Cell key={d.label} fill={d.ready ? "#10b981" : brandColor} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: stages */}
            <div className="flex flex-col rounded-2xl border border-white/10 bg-white/[0.02] p-3 sm:p-4 lg:col-span-2">
              <h3 className="text-xs font-semibold text-slate-800 dark:text-zinc-200">Etapas del programa</h3>
              <p className="mt-0.5 text-[11px] text-slate-500 dark:text-zinc-400">Dónde está cada cliente hoy</p>
              <div className="mt-4 flex h-3 w-full gap-0.5 overflow-hidden rounded-full">
                {stages
                  .filter((s) => s.count > 0)
                  .map((s) => (
                    <div
                      key={s.key}
                      className="h-full first:rounded-l-full last:rounded-r-full"
                      style={{ width: `${(s.count / clients.length) * 100}%`, backgroundColor: s.color }}
                      title={`${s.label}: ${s.count}`}
                    />
                  ))}
              </div>
              <ul className="mt-4 space-y-2.5">
                {stages.map((s) => (
                  <li key={s.key} className="flex items-center justify-between gap-3 text-xs">
                    <span className="flex items-center gap-2 text-slate-600 dark:text-zinc-300">
                      <span className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ backgroundColor: s.color }} />
                      {s.label}
                    </span>
                    <span className="tabular-nums text-slate-500 dark:text-zinc-400">
                      <span className="font-semibold text-slate-900 dark:text-white">{s.count}</span>
                      <span className="ml-1.5 inline-block w-9 text-right">
                        {Math.round((s.count / clients.length) * 100)}%
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
              {inactiveWithProgress.length > 0 && (
                <button
                  type="button"
                  onClick={() => setFilterTab("inactivos")}
                  className="mt-auto flex items-center gap-2 rounded-xl border border-amber-500/20 bg-amber-500/[0.06] px-3 py-2 text-left text-[11px] text-amber-700 transition hover:bg-amber-500/10 dark:text-amber-300"
                >
                  <UserMinus className="h-3.5 w-3.5 shrink-0" />
                  <span>
                    <strong className="font-semibold">{inactiveWithProgress.length}</strong> con {unitShort} no vienen hace
                    más de {INACTIVE_DAYS} días
                  </span>
                </button>
              )}
            </div>
          </div>
        )}

        {!loyalty.enabled ? (
          <div className="mt-3 flex items-center justify-between gap-2 rounded-2xl border border-slate-300/40 bg-slate-500/[0.06] px-2.5 py-2.5 dark:border-white/10 sm:mt-4 sm:px-3.5 sm:py-3">
            <span className="min-w-0 text-xs">
              <span className="block font-semibold text-slate-800 dark:text-zinc-200">El programa está en pausa</span>
              <span className="mt-0.5 block text-[11px] text-slate-500 dark:text-zinc-400">
                Tus clientes no ven la tarjeta como activa hasta que lo reactives.
              </span>
            </span>
            <button
              type="button"
              onClick={openSettings}
              className="inline-flex min-h-9 shrink-0 items-center rounded-xl border border-white/10 px-3 text-xs font-semibold text-slate-700 transition hover:bg-white/10 dark:text-zinc-200"
            >
              Reactivar
            </button>
          </div>
        ) : (
          eligibleClients.length > 0 && (
            <div className="mt-3 flex items-center justify-between gap-2 rounded-2xl border border-emerald-500/15 bg-emerald-500/[0.04] px-2.5 py-2.5 sm:mt-4 sm:px-3.5 sm:py-3">
              <div className="flex min-w-0 items-start gap-2.5">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <Gift className="h-4 w-4" />
                </span>
                <span className="min-w-0">
                  <span className="block text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                    {eligibleClients.length} {eligibleClients.length === 1 ? "cliente tiene" : "clientes tienen"} su premio listo
                  </span>
                  <span className="mt-0.5 block text-[11px] text-slate-500 dark:text-zinc-400">
                    Avisales por WhatsApp para que reserven en tus días más tranquilos.
                  </span>
                </span>
              </div>
              {filterTab !== "con_premio" && (
                <button
                  type="button"
                  onClick={() => setFilterTab("con_premio")}
                  className="inline-flex min-h-9 shrink-0 items-center justify-center rounded-xl border border-emerald-500/20 px-2.5 text-[11px] font-semibold text-emerald-700 transition hover:bg-emerald-500/10 dark:text-emerald-300 sm:min-h-10 sm:px-3 sm:text-xs"
                >
                  Ver clientes
                </button>
              )}
            </div>
          )
        )}
      </section>

      {/* ═══ REWARDS + DIGITAL CARD ═══ */}
      <div className="grid grid-cols-1 gap-5 sm:gap-6 lg:grid-cols-5">
        <section data-tour="fidelizacion-config-card" className="rounded-3xl glass-panel p-3.5 sm:p-5 lg:col-span-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold text-slate-900 dark:text-white">Premios y reglas</h2>
                <span className="rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary">
                  {activeRewards.length}
                </span>
              </div>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-zinc-400">
                {isPoints ? "Tarjeta de puntos" : "Tarjeta de sellos"} · +{unitLabel(perVisit)} por turno completado
              </p>
            </div>
            <button
              type="button"
              onClick={openSettings}
              className="inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-xl border border-white/10 px-3 text-xs font-semibold text-slate-600 transition hover:bg-white/[0.06] dark:text-zinc-300"
            >
              <Settings className="h-3.5 w-3.5" />
              Editar
            </button>
          </div>

          <ol className="relative mt-4 space-y-2.5">
            {activeRewards.map((tier, idx) => {
              const reached = clients.filter((c) => (c.loyaltyPoints || 0) >= tier.threshold).length;
              return (
                <li
                  key={tier.id || idx}
                  className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.02] p-3"
                >
                  <span className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <span className="text-sm font-semibold leading-none tabular-nums">{tier.threshold}</span>
                    <span className="mt-0.5 text-[11px] font-medium leading-none">{unitShort}</span>
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-slate-900 dark:text-white">
                      {tier.description}
                    </span>
                    <span className="mt-0.5 block text-[11px] text-slate-500 dark:text-zinc-400">
                      Premio {idx + 1} · {reached} {reached === 1 ? "cliente lo alcanzó" : "clientes lo alcanzaron"}
                    </span>
                  </span>
                </li>
              );
            })}
          </ol>
        </section>

        <section data-tour="fidelizacion-wallet-banner" className="rounded-3xl glass-panel p-3.5 sm:p-5 lg:col-span-2">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">Tarjeta digital</h2>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-zinc-400">
            Cada cliente tiene un enlace propio para ver su avance, sin instalar nada.
          </p>

          <div className="mt-4 rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.01] p-4">
            <div className="flex items-center justify-between gap-2">
              <span className="min-w-0">
                <span className="block truncate text-xs font-semibold text-slate-900 dark:text-white">{business.name}</span>
                <span className="text-[11px] text-slate-500 dark:text-zinc-400">
                  {previewClient ? "Vista previa con un cliente real" : "Vista previa de ejemplo"}
                </span>
              </span>
              <Crown className="h-4 w-4 shrink-0 text-amber-400" />
            </div>
            <div className="mt-3 flex items-end justify-between gap-2">
              <span className="min-w-0">
                <span className="block text-[11px] text-slate-500 dark:text-zinc-400">Titular</span>
                <span className="block truncate text-sm font-semibold text-slate-900 dark:text-white">
                  {previewClient?.name ?? "Cliente de ejemplo"}
                </span>
              </span>
              <span className="shrink-0 text-right text-xs font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
                {Math.min(previewPoints, minThreshold)} / {minThreshold} {unitShort}
              </span>
            </div>
            {!isPoints && minThreshold <= 12 ? (
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {Array.from({ length: minThreshold }).map((_, i) => (
                  <span
                    key={i}
                    className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-semibold ${
                      i < previewPoints
                        ? "bg-emerald-500 text-white"
                        : "border border-slate-300 text-slate-400 dark:border-white/20"
                    }`}
                  >
                    {i < previewPoints ? <Check className="h-3 w-3" strokeWidth={3} /> : i + 1}
                  </span>
                ))}
              </div>
            ) : (
              <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-white/[0.08]">
                <div
                  className="h-full rounded-full bg-emerald-500"
                  style={{ width: `${Math.min(100, (previewPoints / minThreshold) * 100)}%` }}
                />
              </div>
            )}
            <p className="mt-3 truncate rounded-lg bg-black/5 px-2.5 py-1.5 text-[11px] text-slate-600 dark:bg-white/[0.04] dark:text-zinc-300">
              Premio: <strong className="font-semibold">{activeRewards[0]?.description}</strong>
            </p>
          </div>

          <div className="mt-3 flex items-center justify-between gap-2">
            <code className="min-w-0 truncate text-[11px] text-slate-500 dark:text-zinc-400">
              {tenantHost(business.slug || "salon")}/tarjeta/…
            </code>
            {previewClient && (
              <Link
                href={getCardUrl(previewClient.id)}
                target="_blank"
                className="inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-xl border border-white/10 px-3 text-xs font-semibold text-slate-600 transition hover:bg-white/[0.06] dark:text-zinc-300"
              >
                Ver tarjeta
                <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            )}
          </div>
        </section>
      </div>

      {/* ═══ CLIENTS ═══ */}
      <section data-tour="fidelizacion-clients-table" className="overflow-hidden rounded-3xl glass-panel">
        <div className="space-y-3 border-b border-white/10 p-3.5 sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold text-slate-900 dark:text-white">Clientes</h2>
                <span className="rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary">
                  {filteredClients.length} de {clients.length}
                </span>
              </div>
              <p className="mt-0.5 hidden text-xs text-slate-500 dark:text-zinc-400 sm:block">
                Sumá {unitShort}, canjeá premios y enviá la tarjeta por WhatsApp.
              </p>
            </div>
            <div className="relative w-full sm:max-w-xs">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                aria-label="Buscar clientes"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Nombre, teléfono o Instagram"
                className="min-h-11 w-full rounded-2xl border border-white/10 bg-black/10 pl-10 pr-10 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-primary/50 focus:ring-2 focus:ring-primary/15 dark:text-white sm:text-sm"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  aria-label="Borrar búsqueda"
                  className="absolute right-1 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-xl text-slate-400 transition hover:bg-white/10 hover:text-slate-700 dark:hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          <div className="-mx-1 flex items-center gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {FILTERS.map((option) => {
              const isActive = filterTab === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => {
                    triggerHaptic("selection");
                    setFilterTab(option.value);
                  }}
                  style={isActive ? { backgroundColor: brandColor } : undefined}
                  className={`inline-flex min-h-10 shrink-0 items-center gap-2 rounded-xl px-3.5 text-xs font-semibold transition ${
                    isActive
                      ? "text-white shadow-sm"
                      : "border border-white/10 bg-white/[0.025] text-slate-600 hover:bg-white/[0.06] dark:text-zinc-300"
                  }`}
                >
                  {option.label}
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[11px] tabular-nums ${
                      isActive ? "bg-black/10" : "bg-white/[0.06] text-slate-400"
                    }`}
                  >
                    {filterCounts[option.value]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {filteredClients.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-5 py-12 text-center sm:py-16">
            <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Award className="h-6 w-6" />
            </span>
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              {clients.length === 0 ? "Todavía no hay clientes" : "No encontramos clientes"}
            </h3>
            <p className="mt-1 max-w-sm text-sm text-slate-500 dark:text-zinc-400">
              {clients.length === 0
                ? "Cuando tus clientes reserven y completen turnos, van a sumar sellos acá."
                : "Probá con otra búsqueda o cambiá el filtro."}
            </p>
          </div>
        ) : (
          <>
            <ul className="divide-y divide-slate-100 dark:divide-white/[0.06]">
              {visibleClients.map((client) => {
                const points = client.loyaltyPoints || 0;
                const unlocked = activeRewards.filter((r) => points >= r.threshold);
                const nextTier = activeRewards.find((r) => r.threshold > points);
                const canRedeem = unlocked.length > 0;
                const target = nextTier?.threshold ?? maxThreshold;
                const progressPct = Math.min(100, (points / target) * 100);
                const inactive = points > 0 && isInactive(client, now);

                return (
                  <li
                    key={client.id}
                    className="flex flex-col gap-3 px-3.5 py-3.5 sm:px-5 lg:flex-row lg:items-center lg:gap-5"
                  >
                    {/* Identity */}
                    <div className="flex min-w-0 items-center gap-3 lg:w-64 lg:shrink-0">
                      <span
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-[11px] font-semibold text-white"
                        style={{ backgroundColor: brandColor }}
                      >
                        {initialsOf(client.name)}
                      </span>
                      <span className="min-w-0">
                        <span className="flex items-center gap-1.5">
                          <span className="truncate text-sm font-semibold text-slate-900 dark:text-white">{client.name}</span>
                          {client.tags.includes("VIP") && (
                            <span className="inline-flex shrink-0 items-center gap-0.5 rounded-md bg-amber-500/10 px-1.5 py-0.5 text-[11px] font-semibold text-amber-700 dark:text-amber-300">
                              <Crown className="h-3 w-3" />
                              VIP
                            </span>
                          )}
                        </span>
                        <span className="mt-0.5 block truncate text-[11px] tabular-nums text-slate-500 dark:text-zinc-400">
                          {client.phone}
                          {client.totalSpent > 0 && ` · ${formatGs(client.totalSpent)}`}
                        </span>
                      </span>
                    </div>

                    {/* Progress */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-2 text-[11px]">
                        <span className="min-w-0 truncate text-slate-500 dark:text-zinc-400">
                          {canRedeem ? (
                            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                              Premio listo: {unlocked[unlocked.length - 1].description}
                            </span>
                          ) : nextTier ? (
                            <>
                              Faltan {unitLabel(nextTier.threshold - points)} para{" "}
                              <span className="text-slate-700 dark:text-zinc-200">{nextTier.description}</span>
                            </>
                          ) : null}
                        </span>
                        <span className="shrink-0 font-semibold tabular-nums text-slate-900 dark:text-white">
                          {points}
                          <span className="font-normal text-slate-400"> / {target}</span>
                        </span>
                      </div>
                      <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-white/[0.06]">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${progressPct}%`,
                            backgroundColor: canRedeem ? "#10b981" : brandColor,
                          }}
                        />
                      </div>
                      {(inactive || (client.loyaltyRedeemed || 0) > 0) && (
                        <p className="mt-1 flex flex-wrap gap-x-3 text-[11px] text-slate-500 dark:text-zinc-500">
                          {inactive && (
                            <span className="text-amber-600 dark:text-amber-400">
                              Sin venir hace +{INACTIVE_DAYS} días
                            </span>
                          )}
                          {(client.loyaltyRedeemed || 0) > 0 && (
                            <span>
                              {client.loyaltyRedeemed} {client.loyaltyRedeemed === 1 ? "canje" : "canjes"}
                            </span>
                          )}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5 lg:shrink-0">
                      <button
                        type="button"
                        onClick={() => handleAddPoint(client)}
                        className="inline-flex min-h-10 flex-1 items-center justify-center gap-1 rounded-xl border border-white/10 px-3 text-xs font-semibold text-slate-700 transition hover:bg-white/[0.06] active:scale-[0.98] dark:text-zinc-200 lg:flex-none"
                        title={`Sumar ${unitLabel(perVisit)} manualmente`}
                      >
                        <Plus className="h-3.5 w-3.5" />
                        {perVisit} {isPoints ? "pts" : perVisit === 1 ? "sello" : "sellos"}
                      </button>
                      {canRedeem && (
                        <button
                          type="button"
                          onClick={() => openRedeem(client)}
                          className="inline-flex min-h-10 flex-1 items-center justify-center gap-1 rounded-xl bg-emerald-600 px-3 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-500 active:scale-[0.98] lg:flex-none"
                        >
                          <Gift className="h-3.5 w-3.5" />
                          Canjear
                        </button>
                      )}
                      <a
                        href={getWhatsAppShareUrl(client)}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => triggerHaptic("light")}
                        aria-label={`Enviar tarjeta a ${client.name} por WhatsApp`}
                        title="Enviar tarjeta por WhatsApp"
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-500/20 text-emerald-600 transition hover:bg-emerald-500/10 dark:text-emerald-400"
                      >
                        <MessageCircle className="h-4 w-4" />
                      </a>
                      <button
                        type="button"
                        onClick={() => openQr(client)}
                        aria-label={`Ver QR de la tarjeta de ${client.name}`}
                        title="Ver QR de la tarjeta"
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 text-slate-500 transition hover:bg-white/[0.06] hover:text-slate-800 dark:text-zinc-400 dark:hover:text-white"
                      >
                        <QrCode className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCopyCardLink(client.id)}
                        aria-label={`Copiar enlace de la tarjeta de ${client.name}`}
                        title="Copiar enlace de la tarjeta"
                        className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 text-slate-500 transition hover:bg-white/[0.06] hover:text-slate-800 dark:text-zinc-400 dark:hover:text-white sm:flex"
                      >
                        {copiedId === client.id ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>

            {filteredClients.length > visibleCount && (
              <div className="border-t border-white/10 p-3 text-center">
                <button
                  type="button"
                  onClick={() => setPaging({ key: filterKey, count: visibleCount + PAGE_SIZE })}
                  className="inline-flex min-h-10 items-center gap-1.5 rounded-xl border border-white/10 px-4 text-xs font-semibold text-slate-600 transition hover:bg-white/[0.06] dark:text-zinc-300"
                >
                  Ver más ({filteredClients.length - visibleCount} restantes)
                </button>
              </div>
            )}
          </>
        )}
      </section>

      {/* ═══ SETTINGS MODAL ═══ */}
      <Modal
        open={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        title="Configurar programa"
        maxWidth="max-w-xl"
        footer={
          <div className="grid grid-cols-2 gap-2 sm:flex sm:justify-end">
            <button
              type="button"
              onClick={() => setIsSettingsOpen(false)}
              className="min-h-11 rounded-xl border border-slate-200/80 px-4 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5 sm:min-h-10"
            >
              Cancelar
            </button>
            <button
              type="submit"
              form="loyalty-settings-form"
              disabled={isSavingSettings}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-5 text-xs font-semibold text-white shadow-sm transition hover:brightness-110 disabled:opacity-60 sm:min-h-10"
              style={{ backgroundColor: brandColor }}
            >
              {isSavingSettings && (
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              )}
              {isSavingSettings ? "Guardando…" : "Guardar cambios"}
            </button>
          </div>
        }
      >
        <form id="loyalty-settings-form" onSubmit={handleSaveSettings} className="space-y-5 text-xs">
          <label className="flex min-h-14 cursor-pointer items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 dark:border-white/10 dark:bg-white/[0.03]">
            <span className="min-w-0">
              <span className="block text-xs font-semibold text-slate-900 dark:text-white">Programa activo</span>
              <span className="block text-[11px] text-slate-500 dark:text-zinc-400">
                Si lo pausás, la tarjeta del cliente se muestra como inactiva.
              </span>
            </span>
            <input
              type="checkbox"
              role="switch"
              checked={formSettings.enabled}
              onChange={(e) => setFormSettings({ ...formSettings, enabled: e.target.checked })}
              className="peer sr-only"
            />
            <span
              aria-hidden="true"
              className="relative h-6 w-10 shrink-0 rounded-full bg-slate-300 transition after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow-sm after:transition peer-checked:bg-primary peer-checked:after:translate-x-4 peer-focus-visible:ring-2 peer-focus-visible:ring-primary/40 dark:bg-white/15"
            />
          </label>

          <fieldset>
            <legend className={LABEL_CLASS}>Tipo de tarjeta</legend>
            <div className="grid grid-cols-2 gap-2">
              {([
                { value: "stamps", title: "Sellos", desc: "1 sello por turno" },
                { value: "points", title: "Puntos", desc: "Puntos por turno" },
              ] as const).map((opt) => {
                const isSelected = formSettings.mode === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => setFormSettings({ ...formSettings, mode: opt.value })}
                    className={`flex min-h-14 flex-col items-start justify-center rounded-2xl border px-3.5 text-left transition ${
                      isSelected
                        ? "border-primary bg-primary/10"
                        : "border-slate-200 bg-slate-50 hover:bg-slate-100 dark:border-white/10 dark:bg-white/[0.03] dark:hover:bg-white/[0.06]"
                    }`}
                  >
                    <span className={`text-xs font-semibold ${isSelected ? "text-primary" : "text-slate-900 dark:text-white"}`}>
                      {opt.title}
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-zinc-400">{opt.desc}</span>
                  </button>
                );
              })}
            </div>
          </fieldset>

          {formSettings.mode === "points" && (
            <div>
              <label htmlFor="points-per-visit" className={LABEL_CLASS}>
                Puntos por turno completado
              </label>
              <input
                id="points-per-visit"
                type="number"
                inputMode="numeric"
                min={1}
                max={1000}
                value={formSettings.pointsPerVisit}
                onChange={(e) => setFormSettings({ ...formSettings, pointsPerVisit: Number(e.target.value) })}
                className={`${INPUT_CLASS} tabular-nums`}
              />
            </div>
          )}

          <div className="space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Premios</span>
              <button
                type="button"
                onClick={handleAddRewardTier}
                className="-my-1 inline-flex min-h-8 items-center gap-1 rounded-lg px-2 text-[11px] font-semibold text-primary transition hover:bg-primary/10"
              >
                <Plus className="h-3.5 w-3.5" />
                Agregar premio
              </button>
            </div>

            {formSettings.rewards.map((tier, idx) => (
              <div
                key={tier.id || idx}
                className="space-y-2.5 rounded-2xl border border-slate-200 bg-slate-50/60 p-3 dark:border-white/10 dark:bg-white/[0.02]"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-primary">Premio {idx + 1}</span>
                  {formSettings.rewards.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveRewardTier(tier.id)}
                      aria-label={`Eliminar premio ${idx + 1}`}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-rose-500/10 hover:text-rose-500"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-[96px_1fr] gap-2">
                  <div>
                    <label htmlFor={`tier-threshold-${tier.id}`} className="mb-1 block text-[11px] text-slate-500 dark:text-zinc-400">
                      {formSettings.mode === "points" ? "Puntos" : "Sellos"}
                    </label>
                    <input
                      id={`tier-threshold-${tier.id}`}
                      type="number"
                      inputMode="numeric"
                      min={1}
                      max={formSettings.mode === "points" ? 5000 : 50}
                      value={tier.threshold}
                      onChange={(e) => handleUpdateTier(tier.id, { threshold: Number(e.target.value) || 1 })}
                      className={`${INPUT_CLASS} font-semibold tabular-nums`}
                    />
                  </div>
                  <div className="min-w-0">
                    <label htmlFor={`tier-desc-${tier.id}`} className="mb-1 block text-[11px] text-slate-500 dark:text-zinc-400">
                      Premio
                    </label>
                    <input
                      id={`tier-desc-${tier.id}`}
                      type="text"
                      value={tier.description}
                      onChange={(e) => handleUpdateTier(tier.id, { description: e.target.value })}
                      placeholder="Ej. 50% OFF en el próximo servicio"
                      className={INPUT_CLASS}
                    />
                  </div>
                </div>
                <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  {REWARD_PRESETS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => handleUpdateTier(tier.id, { description: preset })}
                      className="shrink-0 rounded-lg border border-slate-200 px-2 py-1 text-[11px] font-medium text-slate-600 transition hover:bg-slate-100 dark:border-white/10 dark:text-zinc-300 dark:hover:bg-white/[0.06]"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </form>
      </Modal>

      {/* ═══ REDEEM MODAL ═══ */}
      <Modal
        open={!!redeemClient}
        onClose={() => setRedeemClient(null)}
        title="Canjear premio"
        maxWidth="max-w-md"
        footer={
          <div className="grid grid-cols-2 gap-2 sm:flex sm:justify-end">
            <button
              type="button"
              onClick={() => setRedeemClient(null)}
              className="min-h-11 rounded-xl border border-slate-200/80 px-4 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5 sm:min-h-10"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleConfirmRedeem}
              disabled={!redeemTierId}
              className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-5 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-500 disabled:opacity-50 sm:min-h-10"
            >
              <Gift className="h-4 w-4" />
              Confirmar canje
            </button>
          </div>
        }
      >
        {redeemClient && (
          <div className="space-y-3 text-xs">
            <p className="text-slate-600 dark:text-zinc-300">
              <strong className="text-slate-900 dark:text-white">{redeemClient.name}</strong> tiene{" "}
              <strong className="tabular-nums text-slate-900 dark:text-white">{unitLabel(redeemClient.loyaltyPoints || 0)}</strong>.
              Elegí qué premio canjea; se le descuentan los {unitShort} de ese premio.
            </p>
            <div className="space-y-2">
              {redeemUnlocked.map((tier) => {
                const isSelected = redeemTierId === tier.id;
                return (
                  <button
                    key={tier.id}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => setRedeemTierId(tier.id)}
                    className={`flex w-full items-center gap-3 rounded-2xl border px-3.5 py-3 text-left transition ${
                      isSelected
                        ? "border-emerald-500/60 bg-emerald-500/10"
                        : "border-slate-200 hover:bg-slate-50 dark:border-white/10 dark:hover:bg-white/[0.04]"
                    }`}
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-semibold text-slate-900 dark:text-white">{tier.description}</span>
                      <span className="text-[11px] tabular-nums text-slate-500 dark:text-zinc-400">
                        Usa {unitLabel(tier.threshold)} · le quedan {unitLabel((redeemClient.loyaltyPoints || 0) - tier.threshold)}
                      </span>
                    </span>
                    {isSelected && <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </Modal>

      {/* ═══ QR MODAL ═══ */}
      <Modal
        open={Boolean(qrClient)}
        onClose={() => setQrClient(null)}
        title="Tarjeta del cliente"
        maxWidth="max-w-sm"
        footer={
          qrClient ? (
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleCopyCardLink(qrClient.id)}
                className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl border border-slate-200/80 px-4 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5 sm:min-h-10"
              >
                {copiedId === qrClient.id ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                {copiedId === qrClient.id ? "Copiado" : "Copiar enlace"}
              </button>
              <a
                href={getWhatsAppShareUrl(qrClient)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-4 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-500 sm:min-h-10"
              >
                <MessageCircle className="h-4 w-4" />
                WhatsApp
              </a>
            </div>
          ) : undefined
        }
      >
        {qrClient && (
          <div className="space-y-4 text-center text-xs">
            <div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">{qrClient.name}</h3>
              <p className="mt-0.5 tabular-nums text-slate-500 dark:text-zinc-400">
                {unitLabel(qrClient.loyaltyPoints || 0)} acumulados
              </p>
            </div>
            <div className="mx-auto flex h-56 w-56 items-center justify-center rounded-3xl border border-slate-200 bg-white p-3">
              {qrCodeDataUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={qrCodeDataUrl} alt={`QR de la tarjeta de ${qrClient.name}`} className="h-full w-full object-contain" />
              ) : (
                <span className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              )}
            </div>
            <p className="mx-auto max-w-xs text-slate-500 dark:text-zinc-400">
              El cliente escanea el código con la cámara del celular y abre su tarjeta.
            </p>
            <Link
              href={getCardUrl(qrClient.id)}
              target="_blank"
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline"
            >
              Abrir tarjeta
              <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
        )}
      </Modal>

      {clients.length === 0 && (
        <p className="flex items-center justify-center gap-2 text-center text-[11px] text-slate-500 dark:text-zinc-400">
          <BarChart3 className="h-3.5 w-3.5" />
          Los gráficos aparecen cuando tengas clientes registrados.
        </p>
      )}
    </div>
  );
}
