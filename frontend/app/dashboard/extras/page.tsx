"use client";

import { useState } from "react";
import {
  QrCode,
  Download,
  Printer,
  Copy,
  Check,
  Camera,
  MessageCircle,
  Share2,
  Sparkles,
  ExternalLink,
  Target,
  BarChart3,
  Layers,
  Save,
} from "lucide-react";
import { useDashboardStore } from "@/store/useDashboardStore";
import Card from "@/components/dashboard/ui/Card";

export default function ExtrasPage() {
  const { business, updateBusiness, pushToast } = useDashboardStore();
  const [copiedUrl, setCopiedUrl] = useState(false);

  const slug = business.slug || "barberia";
  const bookingUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/${slug}/reservar`
      : `https://agendate.py/${slug}/reservar`;

  const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&margin=15&data=${encodeURIComponent(
    bookingUrl
  )}`;

  async function handleCopy() {
    await navigator.clipboard.writeText(bookingUrl);
    setCopiedUrl(true);
    pushToast("success", "Enlace de reservas copiado al portapapeles");
    setTimeout(() => setCopiedUrl(false), 2000);
  }

  function handlePrint() {
    window.print();
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
          Kit de Marketing, QR & Pauta Digital
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 sm:text-sm">
          Herramientas para atraer reservas: Cartel con código QR para mostrador, enlace para Instagram Bio y píxeles de conversión.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Countertop QR Card Generator */}
        <Card className="flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
              <QrCode className="h-5 w-5 text-primary" />
              <h2>Código QR para Mostrador / Vidriera</h2>
            </div>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Colocalo en la recepción o en la entrada para que tus clientes agenden su próximo turno antes de retirarse.
            </p>

            {/* Printable Preview Card */}
            <div
              id="printable-card"
              className="mt-4 rounded-3xl border-2 border-slate-900/10 dark:border-white/10 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950 p-6 text-center shadow-lg"
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
              <div className="my-4 mx-auto w-44 h-44 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white p-2.5 shadow-xs flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={qrApiUrl}
                  alt={`QR de reservas para ${business.name}`}
                  className="w-full h-full object-contain rounded-xl"
                />
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

          <div className="flex gap-2 pt-2">
            <a
              href={qrApiUrl}
              download={`qr_${business.slug}.png`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-slate-800/80 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-sm hover:bg-slate-100 dark:hover:bg-slate-700 transition"
            >
              <Download className="h-4 w-4 text-slate-400" />
              <span>Descargar QR</span>
            </a>
            <button
              type="button"
              onClick={handlePrint}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 dark:bg-white py-2.5 text-xs font-bold text-white dark:text-slate-900 shadow-sm hover:opacity-90 transition"
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
              <Share2 className="h-4 w-4 text-primary" />
              <span>Tu Enlace Oficial de Reservas</span>
            </h2>
            <div className="flex items-center gap-2 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-slate-50/70 dark:bg-slate-800/50 p-2 pl-3">
              <span className="flex-1 truncate font-mono text-xs text-slate-700 dark:text-slate-300">
                {bookingUrl}
              </span>
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
                className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:opacity-95 transition"
              >
                {copiedUrl ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copiedUrl ? "Copiado" : "Copiar"}</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1 text-xs">
              <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-slate-50/70 dark:bg-slate-800/40 p-3.5 space-y-1">
                <span className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                  <Camera className="h-3.5 w-3.5 text-pink-500" /> Instagram Bio
                </span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Pegalo en el campo &ldquo;Sitio web&rdquo; de tu perfil para captar reservas directas.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-slate-50/70 dark:bg-slate-800/40 p-3.5 space-y-1">
                <span className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                  <MessageCircle className="h-3.5 w-3.5 text-emerald-500" /> WhatsApp
                </span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Configuralo como mensaje de bienvenida o respuesta rápida /agenda.
                </p>
              </div>
            </div>
          </Card>

          {/* Marketing Pixels & Configuration */}
          <Card className="space-y-4">
            <h2 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-base">
              <Target className="h-4 w-4 text-primary" />
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
                className="w-full rounded-2xl bg-primary py-2.5 text-xs font-bold text-white shadow-md hover:opacity-95 transition"
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
