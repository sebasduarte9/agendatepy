"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Star,
  Gift,
  Sparkles,
  Calendar,
  Share2,
  Check,
  Smartphone,
  ExternalLink,
  MessageCircle,
  HelpCircle,
  X,
  Award,
} from "lucide-react";
import { useDashboardStore } from "@/store/useDashboardStore";

export type TarjetaDataProps = {
  tenant: {
    name: string;
    slug: string;
    phone: string;
    logoUrl?: string;
    primaryColor: string;
    backgroundColor: string;
    fontFamily?: string;
  };
  client: {
    id: string;
    name: string;
    phone?: string;
    points: number;
    totalVisits: number;
  };
  loyalty: {
    enabled: boolean;
    mode: "stamps" | "points";
    rewardThreshold: number;
    rewardDescription: string;
    pointsPerVisit: number;
  };
};

export default function TarjetaClienteView({
  tenant,
  client: initialClient,
  loyalty: initialLoyalty,
}: TarjetaDataProps) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [showPwaModal, setShowPwaModal] = useState(false);

  // Hydrate with dashboard store if client is testing on the same browser
  const { clients, loyalty: storeLoyalty } = useDashboardStore();
  const client = useMemo(() => {
    const storeClient = clients.find((c) => c.id === initialClient.id);
    if (storeClient) {
      return {
        id: storeClient.id,
        name: storeClient.name,
        phone: storeClient.phone,
        points: storeClient.loyaltyPoints ?? initialClient.points,
        totalVisits: storeClient.totalVisits ?? initialClient.totalVisits,
      };
    }
    return initialClient;
  }, [clients, initialClient]);

  const loyalty = useMemo(() => {
    if (storeLoyalty && storeLoyalty.enabled !== undefined) {
      return {
        enabled: storeLoyalty.enabled,
        mode: storeLoyalty.mode || initialLoyalty.mode || "stamps",
        rewardThreshold: storeLoyalty.rewardThreshold || initialLoyalty.rewardThreshold || 5,
        rewardDescription: storeLoyalty.rewardDescription || initialLoyalty.rewardDescription,
        pointsPerVisit: storeLoyalty.pointsPerVisit || initialLoyalty.pointsPerVisit || 1,
      };
    }
    return initialLoyalty;
  }, [storeLoyalty, initialLoyalty]);

  const brandColor = tenant.primaryColor || "#e11d48";
  const points = client.points ?? 0;
  const threshold = Math.max(1, loyalty.rewardThreshold || 5);
  const isRewardReady = points >= threshold;
  const remaining = Math.max(0, threshold - points);
  const progressPercent = Math.min(100, Math.round((points / threshold) * 100));

  const memberId = `VIP-${client.id.replace(/[^0-9a-zA-Z]/g, "").slice(-4).toUpperCase() || "1024"}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=320x320&margin=10&data=${encodeURIComponent(
    `AGENDATE-VIP:${tenant.slug}:${client.id}:${client.name}`
  )}`;

  async function handleShare() {
    const shareData = {
      title: `Tarjeta VIP · ${tenant.name}`,
      text: `Mi Tarjeta Digital de Fidelización en ${tenant.name}`,
      url: window.location.href,
    };

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch {
        // Fallback to clipboard
      }
    }

    if (typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  }

  const cleanPhone = tenant.phone ? tenant.phone.replace(/[^0-9]/g, "") : "";

  return (
    <div className="relative min-h-screen bg-slate-950 text-white flex flex-col items-center justify-between p-4 sm:p-6 selection:bg-rose-500 selection:text-white">
      {/* Dynamic ambient brand glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div
          className="absolute -top-32 left-1/2 -translate-x-1/2 h-96 w-96 rounded-full blur-[100px] opacity-25"
          style={{ backgroundColor: brandColor }}
        />
        <div
          className="absolute bottom-10 right-10 h-72 w-72 rounded-full blur-[120px] opacity-20"
          style={{ backgroundColor: brandColor }}
        />
      </div>

      {/* Top Header */}
      <header className="relative z-10 w-full max-w-sm flex items-center justify-between py-2">
        <div className="flex items-center gap-2.5">
          {tenant.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={tenant.logoUrl}
              alt={tenant.name}
              className="h-9 w-9 rounded-2xl object-cover border border-white/10 shadow-sm"
            />
          ) : (
            <div
              className="flex h-9 w-9 items-center justify-center rounded-2xl text-white font-black text-xs shadow-md"
              style={{ backgroundColor: brandColor }}
            >
              {tenant.name.slice(0, 2).toUpperCase()}
            </div>
          )}
          <div>
            <h2 className="font-extrabold text-xs text-white leading-tight">
              {tenant.name}
            </h2>
            <span
              className="text-[10px] font-bold tracking-wider uppercase"
              style={{ color: brandColor }}
            >
              Tarjeta de Fidelidad
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleShare}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-slate-200 hover:text-white hover:bg-white/20 transition cursor-pointer"
          title="Compartir tarjeta"
        >
          {copiedLink ? <Check className="h-4 w-4 text-emerald-400" /> : <Share2 className="h-4 w-4" />}
        </button>
      </header>

      {/* Main Luxury Digital Card */}
      <main className="relative z-10 w-full max-w-sm my-auto py-3">
        <div
          className="relative overflow-hidden rounded-[32px] border border-white/15 bg-gradient-to-br from-slate-900 via-slate-900/95 to-slate-950 p-6 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)] backdrop-blur-2xl"
          style={{
            boxShadow: `0 20px 50px -15px ${brandColor}25`,
          }}
        >
          {/* Subtle brand color sheen inside card */}
          <div
            className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full blur-3xl opacity-30"
            style={{ backgroundColor: brandColor }}
          />

          {/* Card Top: Metallic Chip & Member ID */}
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              {/* Metallic microchip visual */}
              <div className="h-7 w-10 rounded-lg bg-gradient-to-tr from-amber-300 via-yellow-400 to-amber-200 p-0.5 shadow-sm">
                <div className="h-full w-full rounded-md border border-amber-600/30 grid grid-cols-2 gap-0.5 opacity-75" />
              </div>
              <span className="font-mono text-[11px] font-bold tracking-widest text-slate-400">
                {memberId}
              </span>
            </div>

            <div
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider border"
              style={{
                backgroundColor: `${brandColor}15`,
                borderColor: `${brandColor}40`,
                color: brandColor,
              }}
            >
              <Sparkles className="h-3 w-3" />
              <span>Socio VIP</span>
            </div>
          </div>

          {/* Client Name */}
          <div className="relative z-10 mt-5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Titular
            </span>
            <h1 className="text-xl font-black text-white tracking-tight mt-0.5 truncate">
              {client.name}
            </h1>
          </div>

          {/* DYNAMIC PROGRESS: SELLOS vs PUNTOS */}
          {loyalty.mode === "points" ? (
            /* MODO PUNTOS */
            <div className="relative z-10 mt-5 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-300 flex items-center gap-1.5">
                  <Award className="h-4 w-4" style={{ color: brandColor }} />
                  <span>Puntos Acumulados</span>
                </span>
                <span className="font-mono font-black text-sm" style={{ color: brandColor }}>
                  {points} <span className="text-xs text-slate-400 font-semibold">/ {threshold} pts</span>
                </span>
              </div>

              {/* Progress bar */}
              <div className="h-3 w-full rounded-full bg-white/10 p-0.5 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500 shadow-sm"
                  style={{
                    width: `${progressPercent}%`,
                    backgroundColor: brandColor,
                  }}
                />
              </div>

              <div className="flex justify-between text-[11px] text-slate-400 pt-0.5">
                <span>{progressPercent}% completado</span>
                <span>
                  {isRewardReady
                    ? "¡Meta alcanzada!"
                    : `Faltan ${remaining} pts`}
                </span>
              </div>
            </div>
          ) : (
            /* MODO SELLOS */
            <div className="relative z-10 mt-5 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-300 flex items-center gap-1.5">
                  <Star className="h-3.5 w-3.5 fill-current" style={{ color: brandColor }} />
                  <span>Sellos por Asistencias</span>
                </span>
                <span className="font-mono text-xs font-black" style={{ color: brandColor }}>
                  {points} / {threshold}
                </span>
              </div>

              {/* Stamp Grid */}
              <div
                className={`grid gap-2 ${
                  threshold <= 5
                    ? "grid-cols-5"
                    : threshold <= 8
                    ? "grid-cols-4"
                    : "grid-cols-5"
                }`}
              >
                {Array.from({ length: threshold }).map((_, index) => {
                  const isStamped = index < points;
                  return (
                    <div
                      key={index}
                      className={`relative flex flex-col items-center justify-center h-13 rounded-2xl border transition-all duration-300 ${
                        isStamped
                          ? "scale-100 shadow-md"
                          : "border-white/10 bg-white/5 opacity-40"
                      }`}
                      style={{
                        borderColor: isStamped ? brandColor : undefined,
                        backgroundColor: isStamped ? `${brandColor}20` : undefined,
                      }}
                    >
                      <Star
                        className="h-4.5 w-4.5 transition-transform"
                        style={{
                          color: isStamped ? brandColor : "#64748b",
                          fill: isStamped ? brandColor : "none",
                        }}
                      />
                      <span
                        className="text-[9px] font-black mt-1"
                        style={{ color: isStamped ? brandColor : "#64748b" }}
                      >
                        #{index + 1}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Reward Status Pill */}
          <div className="relative z-10 mt-5">
            {isRewardReady ? (
              <div className="rounded-2xl border border-emerald-400/40 bg-emerald-500/15 p-3 flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500 text-slate-950 font-black shadow-md">
                  <Gift className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
                    ¡Premio Desbloqueado!
                  </span>
                  <p className="text-xs font-bold text-white leading-tight truncate">
                    {loyalty.rewardDescription}
                  </p>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-slate-300 truncate mr-2">
                  <Gift className="h-4 w-4 shrink-0" style={{ color: brandColor }} />
                  <span className="truncate">{loyalty.rewardDescription}</span>
                </div>
                <span
                  className="font-bold text-[11px] shrink-0"
                  style={{ color: brandColor }}
                >
                  {loyalty.mode === "points"
                    ? `-${remaining} pts`
                    : `-${remaining} ${remaining === 1 ? "sello" : "sellos"}`}
                </span>
              </div>
            )}
          </div>

          {/* Counter Scan QR */}
          <div className="relative z-10 mt-5 pt-4 border-t border-white/10 flex items-center justify-between gap-3">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                QR de Socio
              </span>
              <p className="text-xs text-slate-300 font-medium leading-snug">
                Mostrá este código al pagar para sumar tus {loyalty.mode === "points" ? "puntos" : "sellos"}.
              </p>
            </div>

            <div className="h-16 w-16 shrink-0 rounded-2xl bg-white p-1.5 shadow-md flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={qrUrl}
                alt={`QR de ${client.name}`}
                className="h-full w-full object-contain rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-4 space-y-2.5">
          <Link
            href={`/${tenant.slug}/reservar`}
            className="w-full inline-flex items-center justify-center gap-2 rounded-2xl py-3.5 px-4 text-xs font-black text-white shadow-lg transition active:scale-98"
            style={{
              backgroundColor: brandColor,
              boxShadow: `0 8px 25px -5px ${brandColor}40`,
            }}
          >
            <Calendar className="h-4 w-4" />
            <span>Agendar mi Próximo Turno</span>
            <ExternalLink className="h-3.5 w-3.5 opacity-80" />
          </Link>

          <button
            type="button"
            onClick={() => setShowPwaModal(true)}
            className="w-full inline-flex items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/5 hover:bg-white/10 py-2.5 px-3 text-xs font-semibold text-slate-300 transition cursor-pointer"
          >
            <Smartphone className="h-4 w-4 text-slate-400" />
            <span>Guardar en Pantalla de Inicio</span>
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full max-w-sm text-center py-2">
        {cleanPhone ? (
          <a
            href={`https://wa.me/${cleanPhone}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition"
          >
            <MessageCircle className="h-3.5 w-3.5 text-emerald-400" />
            <span>Consultar por WhatsApp con {tenant.name}</span>
          </a>
        ) : (
          <p className="text-[11px] text-slate-500">
            {tenant.name} · Club VIP AgendatePY
          </p>
        )}
      </footer>

      {/* Modal: How to add to home screen (iPhone / Android) */}
      {showPwaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-sm rounded-3xl border border-white/20 bg-slate-900 p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Smartphone className="h-4 w-4" style={{ color: brandColor }} />
                <h3 className="font-bold text-sm text-white">Guardar en tu Teléfono</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowPwaModal(false)}
                className="rounded-full p-1 text-slate-400 hover:text-white hover:bg-white/10 transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="rounded-2xl bg-white/5 border border-white/10 p-3 space-y-1">
                <p className="font-bold text-white flex items-center gap-1.5">
                  <span>📱 En iPhone (Safari):</span>
                </p>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  1. Tocá el botón <strong>Compartir</strong> (ícono cuadrado con flecha hacia arriba).<br />
                  2. Seleccioná <strong>&ldquo;Añadir a pantalla de inicio&rdquo;</strong>.<br />
                  ¡Listo! Tu tarjeta quedará guardada como una app con tus sellos actualizados.
                </p>
              </div>

              <div className="rounded-2xl bg-white/5 border border-white/10 p-3 space-y-1">
                <p className="font-bold text-white flex items-center gap-1.5">
                  <span>🤖 En Android (Chrome):</span>
                </p>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  1. Tocá los <strong>tres puntos (⋮)</strong> arriba a la derecha.<br />
                  2. Seleccioná <strong>&ldquo;Agregar a pantalla principal&rdquo;</strong> o <strong>&ldquo;Instalar aplicación&rdquo;</strong>.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowPwaModal(false)}
              className="w-full rounded-xl py-2.5 text-xs font-bold text-slate-900 transition"
              style={{ backgroundColor: brandColor }}
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
