"use client";

import { useState, useEffect } from "react";
import {
  QrCode,
  Download,
  Printer,
  Copy,
  Check,
  Camera,
  MessageCircle,
  Share2,
  ExternalLink,
  Target,
  BarChart3,
  Layers,
  Save,
} from "lucide-react";
import QRCode from "qrcode";
import { useDashboardStore } from "@/store/useDashboardStore";
import Card from "@/components/dashboard/ui/Card";
import { triggerHaptic } from "@/lib/haptics";

export default function ExtrasPage() {
  const { business, updateBusiness, pushToast } = useDashboardStore();
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");

  const slug = business.slug || "barberia";
  const bookingUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/${slug}/reservar`
      : `https://agendate.py/${slug}/reservar`;

  useEffect(() => {
    QRCode.toDataURL(
      bookingUrl,
      {
        width: 400,
        margin: 2,
        color: {
          dark: "#090d16",
          light: "#ffffff",
        },
      },
      (err, url) => {
        if (!err && url) {
          setQrDataUrl(url);
        }
      }
    );
  }, [bookingUrl]);

  async function handleCopy() {
    triggerHaptic("selection");
    await navigator.clipboard.writeText(bookingUrl);
    setCopiedUrl(true);
    pushToast("success", "Enlace de reservas copiado al portapapeles");
    setTimeout(() => setCopiedUrl(false), 2000);
  }

  function handlePrint() {
    triggerHaptic("medium");
    window.print();
  }

  const hasPixel = Boolean(business.metaPixel && business.metaPixel.trim());

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-20">
      {/* ═══ NATIVE PAGE HEADER ═══ */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between py-1">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Kit de Marketing & Carteles QR
        </h1>

        <div className="flex flex-wrap items-center gap-2">
          <a
            href={qrDataUrl || "#"}
            download={`qr_${business.slug || "reserva"}.png`}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition"
          >
            <Download className="h-3.5 w-3.5 text-slate-400" />
            <span>Descargar QR</span>
          </a>

          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <Printer className="h-3.5 w-3.5 text-slate-400" />
            <span>Imprimir</span>
          </button>

          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold text-white shadow-md transition active:scale-95 cursor-pointer hover:brightness-110"
            style={{
              backgroundColor: business.primaryColor || "#FF4F2B",
              boxShadow: `0 4px 14px -2px ${business.primaryColor || "#FF4F2B"}50`,
            }}
          >
            {copiedUrl ? <Check className="h-3.5 w-3.5 text-emerald-300" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copiedUrl ? "¡Copiado!" : "Copiar Enlace"}</span>
          </button>
        </div>
      </div>

      {/* ═══ APPLE INSET TELEMETRY & INTELLIGENCE CONTAINER ═══ */}
      <div className="rounded-[28px] bg-slate-100/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 p-4 sm:p-5 shadow-xs space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Card 1: Estado del Kit */}
          <div className="rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/70 dark:border-slate-700/60 p-5 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700/60">
              <div className="flex items-center gap-2.5">
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-xl text-white font-bold"
                  style={{ backgroundColor: business.primaryColor || "var(--primary, #FF4F2B)" }}
                >
                  <QrCode className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                    Resolución & Estado de Escaneo
                  </h3>
                  <p className="text-[11px] text-slate-400">Cartelería física y fidelización rápida</p>
                </div>
              </div>

              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <Check className="h-3.5 w-3.5" />
                <span>400x400 HD</span>
              </span>
            </div>

            {/* Circular Gauges */}
            <div className="py-4 grid grid-cols-2 gap-4">
              {/* Gauge 1: QR Ready */}
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
                      strokeDashoffset={0}
                      strokeLinecap="round"
                      className="transition-all duration-700"
                    />
                  </svg>
                  <span className="absolute text-[10px] font-black text-slate-800 dark:text-white font-mono">
                    100%
                  </span>
                </div>
                <div className="min-w-0">
                  <span className="text-[11px] font-bold text-slate-900 dark:text-white block truncate">
                    Código QR
                  </span>
                  <span className="text-[10px] text-slate-400 block truncate">
                    Listo para imprimir
                  </span>
                </div>
              </div>

              {/* Gauge 2: Meta Pixel */}
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
                      stroke={hasPixel ? "#10b981" : "#f59e0b"}
                      strokeWidth="4"
                      fill="none"
                      strokeDasharray={113}
                      strokeDashoffset={hasPixel ? 0 : 56}
                      strokeLinecap="round"
                      className="transition-all duration-700"
                    />
                  </svg>
                  <span className={`absolute text-[10px] font-black font-mono ${hasPixel ? "text-emerald-500" : "text-amber-500"}`}>
                    {hasPixel ? "100%" : "0%"}
                  </span>
                </div>
                <div className="min-w-0">
                  <span className="text-[11px] font-bold text-slate-900 dark:text-white block truncate">
                    Meta Pixel
                  </span>
                  <span className="text-[10px] text-slate-400 block truncate">
                    {hasPixel ? "Activo" : "Pendiente"}
                  </span>
                </div>
              </div>
            </div>

            {/* Operational Telemetry Rows */}
            <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100 dark:border-slate-700/60 text-xs">
              <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800/80">
                <span className="text-[10px] font-medium text-slate-400 block">Formato</span>
                <span className="text-xs font-black text-slate-900 dark:text-white font-mono">
                  PNG / PDF
                </span>
              </div>
              <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800/80">
                <span className="text-[10px] font-medium text-slate-400 block">Escaneo</span>
                <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 font-mono">
                  Cámara Nativa
                </span>
              </div>
              <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800/80">
                <span className="text-[10px] font-medium text-slate-400 block">Velocidad</span>
                <span className="text-xs font-black text-slate-900 dark:text-white font-mono">
                  &lt; 30 seg
                </span>
              </div>
            </div>
          </div>

          {/* Card 2: Enlace Web & Canales */}
          <div className="rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/70 dark:border-slate-700/60 p-5 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700/60">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 font-bold">
                  <Share2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                    Enlace Oficial para Redes Sociales
                  </h3>
                  <p className="text-[11px] text-slate-400">Instagram Bio, WhatsApp Business y Facebook</p>
                </div>
              </div>

              <span className="text-xs font-mono font-bold text-slate-400">
                {slug}
              </span>
            </div>

            {/* URL Box */}
            <div className="py-2.5">
              <span className="text-[10px] text-slate-400 block font-medium mb-1">
                URL Pública de Agendamiento:
              </span>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800">
                <span className="font-mono text-xs text-slate-800 dark:text-slate-200 truncate pr-2">
                  {bookingUrl}
                </span>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 shrink-0"
                  style={{
                    backgroundColor: business.primaryColor || "var(--primary, #FF4F2B)",
                    color: "#ffffff",
                  }}
                >
                  <Copy className="h-3.5 w-3.5" />
                  <span>{copiedUrl ? "Copiado" : "Copiar"}</span>
                </button>
              </div>
            </div>

            {/* Tip */}
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
              <span>Pegá este enlace en el botón de tu perfil de Instagram para captar reservas automáticas 24/7.</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Countertop QR Card Generator */}
        <Card className="flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
              <QrCode className="h-5 w-5 text-primary shrink-0" />
              <h2>Código QR para Mostrador / Vidriera</h2>
            </div>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Colocalo en la recepción o en la entrada para que tus clientes agenden su próximo turno antes de retirarse.
            </p>

            {/* Printable Preview Card */}
            <div
              id="printable-card"
              className="mt-4 rounded-3xl border-2 border-slate-900/10 dark:border-white/10 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950 p-4 sm:p-6 text-center shadow-lg"
            >
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-white font-black text-lg shadow-md shadow-primary/25">
                {business.name.slice(0, 2).toUpperCase()}
              </div>
              <h3 className="mt-3 font-black text-slate-900 dark:text-white text-base">
                {business.name}
              </h3>
              <p className="text-xs text-primary font-bold mt-0.5">
                ¡Agendá tu turno online en 30 segundos!
              </p>

              {/* QR Image */}
              <div className="my-4 mx-auto w-36 h-36 sm:w-44 sm:h-44 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white p-2.5 shadow-xs flex items-center justify-center">
                {qrDataUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={qrDataUrl}
                    alt={`QR de reservas para ${business.name}`}
                    className="w-full h-full object-contain rounded-xl"
                  />
                ) : (
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                )}
              </div>

              <div className="space-y-1 text-[11px] text-slate-500 dark:text-slate-400">
                <p className="font-semibold text-slate-800 dark:text-slate-200">1. Escaneá con la cámara de tu celular</p>
                <p>2. Elegí servicio, estilista, fecha y hora</p>
                <p>3. Recibí confirmación inmediata por WhatsApp</p>
              </div>

              <div className="mt-4 border-t border-slate-100 dark:border-white/5 pt-3">
                <p className="font-mono text-[10px] text-slate-400">
                  agendate.py/{business.slug}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <a
              href={qrDataUrl || "#"}
              download={`qr_${business.slug || "reserva"}.png`}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-slate-800/80 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-sm hover:bg-slate-100 dark:hover:bg-slate-700 transition"
            >
              <Download className="h-4 w-4 text-slate-400" />
              <span>Descargar QR</span>
            </a>
            <button
              type="button"
              onClick={handlePrint}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 dark:bg-white py-2.5 text-xs font-bold text-white dark:text-slate-900 shadow-sm hover:opacity-90 transition cursor-pointer"
            >
              <Printer className="h-4 w-4" />
              <span>Imprimir Cartel</span>
            </button>
          </div>
        </Card>

        {/* Link Sharing & Channels */}
        <div className="space-y-6">
          <Card className="space-y-4">
            <h2 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-base">
              <Share2 className="h-4 w-4 text-primary shrink-0" />
              <span>Tu Enlace Oficial de Reservas</span>
            </h2>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-slate-50/70 dark:bg-slate-800/50 p-2 sm:pl-3">
              <span className="flex-1 truncate font-mono text-xs text-slate-700 dark:text-slate-300 px-1 py-1 sm:p-0">
                {bookingUrl}
              </span>
              <div className="flex items-center gap-2 justify-end sm:justify-start shrink-0">
                <a
                  href={bookingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 rounded-xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-800 px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                  title="Abrir web de reservas"
                >
                  <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
                  <span className="hidden sm:inline">Abrir</span>
                </a>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:opacity-95 transition cursor-pointer"
                >
                  {copiedUrl ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copiedUrl ? "Copiado" : "Copiar"}</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 pt-1 text-xs">
              <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-slate-50/70 dark:bg-slate-800/40 p-3.5 space-y-1">
                <span className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                  <Camera className="h-3.5 w-3.5 text-pink-500 shrink-0" /> Instagram Bio
                </span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  Pegalo en el campo &ldquo;Sitio web&rdquo; de tu perfil para captar reservas directas.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-slate-50/70 dark:bg-slate-800/40 p-3.5 space-y-1">
                <span className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                  <MessageCircle className="h-3.5 w-3.5 text-emerald-500 shrink-0" /> WhatsApp
                </span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  Configuralo como mensaje de bienvenida o respuesta rápida /agenda.
                </p>
              </div>
            </div>
          </Card>

          {/* Marketing Pixels & Configuration */}
          <Card className="space-y-4">
            <h2 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-base">
              <Target className="h-4 w-4 text-primary shrink-0" />
              <span>Tracking de Pauta & Anuncios (Meta / TikTok)</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Medí el retorno de inversión de tus campañas en Instagram Ads y TikTok en Asunción.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">
                  Meta Pixel ID (Facebook / Instagram Ads)
                </label>
                <input
                  className="w-full rounded-xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900 px-3.5 py-2 text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-primary focus:outline-none font-mono"
                  placeholder="Ej. 182749102948192"
                  value={business.metaPixel}
                  onChange={(e) => updateBusiness({ metaPixel: e.target.value })}
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">
                  TikTok Pixel ID
                </label>
                <input
                  className="w-full rounded-xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900 px-3.5 py-2 text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-primary focus:outline-none font-mono"
                  placeholder="Ej. C192837482"
                  value={business.tiktokPixel}
                  onChange={(e) => updateBusiness({ tiktokPixel: e.target.value })}
                />
              </div>

              <button
                type="button"
                className="w-full rounded-2xl bg-primary py-2.5 text-xs font-bold text-white shadow-md hover:opacity-95 transition cursor-pointer"
                onClick={() => pushToast("success", "Píxeles y configuraciones de pauta guardadas")}
              >
                Guardar Píxeles de Conversión
              </button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
