"use client";

import { use, useMemo, useState } from "react";
import Link from "next/link";
import {
  Star,
  Gift,
  QrCode,
  Sparkles,
  Calendar,
  MessageCircle,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Check,
  Share2,
  Flame,
  Award,
  Smartphone,
  Info,
} from "lucide-react";
import { useDashboardStore } from "@/store/useDashboardStore";
import { formatGs } from "@/lib/dashboard-dates";

export default function TarjetaDigitalClientePage({
  params,
}: {
  params: Promise<{ tenant: string; clientId: string }>;
}) {
  const resolvedParams = use(params);
  const { tenant: slug, clientId } = resolvedParams;

  const { clients, loyalty, business, pushToast } = useDashboardStore();
  const [copiedLink, setCopiedLink] = useState(false);
  const [walletModalOpen, setWalletModalOpen] = useState<"apple" | "google" | null>(null);

  // Find client in store or fallback to realistic default
  const client = useMemo(() => {
    const found = clients.find((c) => c.id === clientId);
    if (found) return found;
    return {
      id: clientId,
      name: "Cliente VIP",
      phone: "+595 981 000 000",
      email: "cliente@agendate.py",
      notes: "Cliente preferencial",
      totalVisits: 6,
      totalSpent: 480000,
      lastVisit: new Date().toISOString(),
      tags: ["VIP", "Frecuente"],
      loyaltyPoints: 4,
      loyaltyRedeemed: 1,
    };
  }, [clients, clientId]);

  const points = client.loyaltyPoints || 0;
  const threshold = loyalty.rewardThreshold || 5;
  const isRewardReady = points >= threshold;
  const stampsRemaining = Math.max(0, threshold - points);

  const cardMemberNumber = `VIP-${client.id.replace(/[^0-9]/g, "").padStart(4, "0") || "1024"}`;
  const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&margin=10&data=${encodeURIComponent(
    `AGENDATE-VIP:${slug}:${client.id}:${client.name}`
  )}`;

  async function handleShare() {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-between p-4 sm:p-6 selection:bg-amber-400 selection:text-black">
      {/* Background glowing spatial orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 h-96 w-96 rounded-full bg-gradient-to-b from-amber-500/20 via-primary/20 to-transparent blur-3xl" />
        <div className="absolute bottom-10 right-10 h-72 w-72 rounded-full bg-primary/15 blur-3xl" />
      </div>

      {/* Top Header */}
      <header className="relative z-10 w-full max-w-sm flex items-center justify-between py-2">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 font-black text-xs shadow-md shadow-amber-500/20">
            {business.name.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <span className="font-bold text-xs text-slate-200 block leading-tight">
              {business.name}
            </span>
            <span className="text-[10px] text-amber-400 font-semibold tracking-wider uppercase">
              Club de Beneficios VIP
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleShare}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-slate-300 hover:text-white hover:bg-white/20 transition"
          title="Compartir tarjeta"
        >
          {copiedLink ? <Check className="h-4 w-4 text-emerald-400" /> : <Share2 className="h-4 w-4" />}
        </button>
      </header>

      {/* Main Luxury Digital Pass Card */}
      <main className="relative z-10 w-full max-w-sm my-auto py-4">
        {/* The Spatial Physical-like Card */}
        <div className="relative overflow-hidden rounded-[32px] border border-white/15 bg-gradient-to-br from-slate-900 via-slate-900/95 to-slate-950 p-6 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] backdrop-blur-2xl">
          {/* Subtle iridescent foil gradient effect */}
          <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-gradient-to-br from-amber-400/20 via-purple-500/10 to-transparent blur-2xl" />
          <div className="pointer-events-none absolute -left-16 -bottom-16 h-48 w-48 rounded-full bg-primary/20 blur-2xl" />

          {/* Card Top: Chip & VIP Status */}
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {/* Gold Microchip icon */}
              <div className="h-7 w-10 rounded-lg bg-gradient-to-tr from-amber-300 via-amber-400 to-yellow-200 p-0.5 shadow-sm">
                <div className="h-full w-full rounded-md border border-amber-600/30 grid grid-cols-2 gap-0.5 opacity-80" />
              </div>
              <span className="font-mono text-[10px] font-bold tracking-widest text-slate-400">
                {cardMemberNumber}
              </span>
            </div>

            <div className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-400/30 px-3 py-1 text-[10px] font-black text-amber-300 uppercase tracking-wider">
              <Sparkles className="h-3 w-3 text-amber-400" />
              <span>Miembro VIP</span>
            </div>
          </div>

          {/* Client Name */}
          <div className="relative z-10 mt-6">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Titular de la Tarjeta
            </span>
            <h1 className="text-xl font-black text-white tracking-tight mt-0.5">
              {client.name}
            </h1>
          </div>

          {/* Digital Stamps Matrix */}
          <div className="relative z-10 mt-6 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-300 flex items-center gap-1">
                <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                <span>Sellos Acumulados</span>
              </span>
              <span className="font-mono text-xs font-black text-amber-400">
                {points} / {threshold}
              </span>
            </div>

            {/* Stamp badges */}
            <div className="grid grid-cols-5 gap-2">
              {Array.from({ length: threshold }).map((_, index) => {
                const isStamped = index < points;
                return (
                  <div
                    key={index}
                    className={`relative flex flex-col items-center justify-center h-14 rounded-2xl border transition-all duration-300 ${
                      isStamped
                        ? "border-amber-400/60 bg-gradient-to-b from-amber-400/20 to-amber-500/10 shadow-[0_0_15px_rgba(251,191,36,0.25)] scale-100"
                        : "border-white/10 bg-white/5 opacity-50"
                    }`}
                  >
                    <Star
                      className={`h-5 w-5 transition-transform ${
                        isStamped
                          ? "text-amber-400 fill-amber-400 scale-110 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]"
                          : "text-slate-500"
                      }`}
                    />
                    <span
                      className={`text-[9px] font-black mt-1 ${
                        isStamped ? "text-amber-300" : "text-slate-500"
                      }`}
                    >
                      #{index + 1}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Reward Status Banner */}
          <div className="relative z-10 mt-5">
            {isRewardReady ? (
              <div className="rounded-2xl border border-emerald-400/40 bg-gradient-to-r from-emerald-500/20 to-emerald-600/10 p-3.5 flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500 text-slate-950 font-black shadow-md">
                  <Gift className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
                    ¡Recompensa Desbloqueada!
                  </span>
                  <p className="text-xs font-bold text-white leading-tight">
                    {loyalty.rewardDescription || "50% OFF en tu próximo corte o servicio"}
                  </p>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-slate-300">
                  <Gift className="h-4 w-4 text-amber-400" />
                  <span>Próximo Premio:</span>
                </div>
                <span className="font-bold text-amber-300">
                  {stampsRemaining === 1 ? "¡Solo falta 1 visita!" : `Faltan ${stampsRemaining} visitas`}
                </span>
              </div>
            )}
          </div>

          {/* QR Code for in-store verification */}
          <div className="relative z-10 mt-6 pt-5 border-t border-white/10 flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                Escanear en Mostrador
              </span>
              <p className="text-xs text-slate-300 font-medium">
                Mostrá este QR al pagar para sumar tu sello.
              </p>
            </div>

            <div className="h-16 w-16 shrink-0 rounded-2xl bg-white p-1.5 shadow-md flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={qrApiUrl}
                alt={`QR de ${client.name}`}
                className="h-full w-full object-contain rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* Official Wallet Pass Actions */}
        <div className="mt-5 space-y-2.5">
          <p className="text-center text-[11px] font-semibold text-slate-400">
            Guardá tu tarjeta digital en tu celular con 1 toque:
          </p>

          <div className="grid grid-cols-2 gap-2.5">
            {/* Apple Wallet Button */}
            <button
              type="button"
              onClick={() => setWalletModalOpen("apple")}
              className="flex items-center justify-center gap-2 rounded-2xl bg-black border border-white/20 py-3 px-3 text-xs font-bold text-white shadow-lg hover:border-white/40 transition active:scale-95"
            >
              {/* Apple Logo SVG */}
              <svg className="h-4 w-4 fill-white" viewBox="0 0 170 170">
                <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.04-7.7-7.92-12-14.64-5.88-9.06-10.42-19.57-13.62-31.54-3.2-11.97-4.8-23.32-4.8-34.05 0-14.92 3.65-27.18 10.95-36.78 7.3-9.6 16.5-14.48 27.6-14.64 4.35 0 9.29 1.14 14.83 3.42 5.54 2.28 9.28 3.53 11.22 3.75 2.39-.43 6.3-1.8 11.73-4.11 5.43-2.31 10.11-3.37 14.04-3.18 10.43.54 18.91 4.19 25.44 10.95 6.53 6.76 10.66 15.11 12.39 25.06-9.67 5.88-14.4 14.13-14.2 24.78.2 8.71 3.53 16.03 10 21.96 6.47 5.93 14.28 9.35 23.42 10.27-.98 4.35-2.28 8.91-3.91 13.68zM119.22 32.64c0-7.28 2.55-14.02 7.66-20.22 5.11-6.2 11.36-10.11 18.75-11.73.43 1.96.65 3.8.65 5.54 0 7.39-2.61 14.24-7.83 20.54-5.22 6.3-11.47 10.05-18.75 11.25-.33-1.63-.48-3.42-.48-5.38z" />
              </svg>
              <span>Apple Wallet</span>
            </button>

            {/* Google Wallet Button */}
            <button
              type="button"
              onClick={() => setWalletModalOpen("google")}
              className="flex items-center justify-center gap-2 rounded-2xl bg-black border border-white/20 py-3 px-3 text-xs font-bold text-white shadow-lg hover:border-white/40 transition active:scale-95"
            >
              {/* Google Wallet Multi-color icon SVG */}
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Google Wallet</span>
            </button>
          </div>
        </div>

        {/* Quick Booking CTA */}
        <div className="mt-4">
          <Link
            href={`/${slug}/reservar`}
            className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary to-indigo-600 py-3.5 px-4 text-xs font-black text-white shadow-xl shadow-primary/25 hover:opacity-95 transition"
          >
            <Calendar className="h-4 w-4" />
            <span>Agendar mi Próximo Turno</span>
            <ExternalLink className="h-3.5 w-3.5 opacity-70" />
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full max-w-sm text-center py-2 space-y-1">
        <p className="text-[11px] text-slate-500">
          Tarjeta emitida por <strong className="text-slate-400">{business.name}</strong> vía AgendatePY.
        </p>
        <div className="flex items-center justify-center gap-3 text-[10px] text-slate-600">
          <span className="flex items-center gap-1">
            <ShieldCheck className="h-3 w-3 text-emerald-500" /> Sincronización en vivo
          </span>
          <span>•</span>
          <a
            href={`https://wa.me/${business.phone.replace(/[^0-9]/g, "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline flex items-center gap-1"
          >
            <MessageCircle className="h-3 w-3" /> Contactar al local
          </a>
        </div>
      </footer>

      {/* Wallet Instructions / Simulated Integration Modal */}
      {walletModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-sm rounded-[32px] border border-white/20 bg-slate-900 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                {walletModalOpen === "apple" ? (
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white text-black">
                    <svg className="h-4 w-4 fill-black" viewBox="0 0 170 170">
                      <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.04-7.7-7.92-12-14.64-5.88-9.06-10.42-19.57-13.62-31.54-3.2-11.97-4.8-23.32-4.8-34.05 0-14.92 3.65-27.18 10.95-36.78 7.3-9.6 16.5-14.48 27.6-14.64 4.35 0 9.29 1.14 14.83 3.42 5.54 2.28 9.28 3.53 11.22 3.75 2.39-.43 6.3-1.8 11.73-4.11 5.43-2.31 10.11-3.37 14.04-3.18 10.43.54 18.91 4.19 25.44 10.95 6.53 6.76 10.66 15.11 12.39 25.06-9.67 5.88-14.4 14.13-14.2 24.78.2 8.71 3.53 16.03 10 21.96 6.47 5.93 14.28 9.35 23.42 10.27-.98 4.35-2.28 8.91-3.91 13.68zM119.22 32.64c0-7.28 2.55-14.02 7.66-20.22 5.11-6.2 11.36-10.11 18.75-11.73.43 1.96.65 3.8.65 5.54 0 7.39-2.61 14.24-7.83 20.54-5.22 6.3-11.47 10.05-18.75 11.25-.33-1.63-.48-3.42-.48-5.38z" />
                    </svg>
                  </div>
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white text-black">
                    <svg className="h-4 w-4" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                  </div>
                )}
                <h3 className="font-bold text-sm text-white">
                  {walletModalOpen === "apple" ? "Pase Apple Wallet (.pkpass)" : "Pase Google Wallet"}
                </h3>
              </div>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="rounded-2xl bg-white/5 border border-white/10 p-3.5 space-y-1.5">
                <span className="font-bold text-amber-400 block">
                  Beneficios del Pase Nativo en Celular:
                </span>
                <p>• Notificación instantánea en pantalla de bloqueo al sumar sellos.</p>
                <p>• Geofencing: Aviso automático cuando estés cerca del local en Asunción.</p>
                <p>• Acceso sin internet al código QR del cliente.</p>
              </div>

              <p className="text-[11px] text-slate-400">
                Al activar el pase, se descarga el archivo oficial firmado con el identificador del local.
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setWalletModalOpen(null)}
                className="flex-1 rounded-xl border border-white/15 py-2.5 text-xs font-semibold text-slate-300 hover:bg-white/10 transition"
              >
                Cerrar
              </button>
              <button
                type="button"
                onClick={() => {
                  pushToast(
                    "success",
                    walletModalOpen === "apple"
                      ? "Pase Apple Wallet descargado exitosamente"
                      : "Pase Google Wallet vinculado exitosamente"
                  );
                  setWalletModalOpen(null);
                }}
                className="flex-1 rounded-xl bg-amber-400 py-2.5 text-xs font-bold text-slate-950 shadow-md hover:bg-amber-300 transition"
              >
                Descargar Pase
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
