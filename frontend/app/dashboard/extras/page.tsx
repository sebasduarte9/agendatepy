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
} from "lucide-react";
import { useDashboardStore } from "@/store/useDashboardStore";
import Card from "@/components/dashboard/ui/Card";

export default function ExtrasPage() {
  const { business, updateBusiness, pushToast } = useDashboardStore();
  const [copiedUrl, setCopiedUrl] = useState(false);

  const bookingUrl = `https://agendate.py/reservar/${business.slug}`;
  // High quality QR code generator URL using standard HTTPS endpoint
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
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Kit de Marketing, QR & Pauta Digital
        </h1>
        <p className="text-sm text-slate-500">
          Herramientas para atraer reservas: Cartel con código QR para mostrador, enlace para Instagram Bio y píxeles de conversión.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Countertop QR Card Generator */}
        <Card className="flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <QrCode className="h-5 w-5 text-primary" />
              <h2>Código QR para Mostrador / Vidriera</h2>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Colocalo en la recepción o en la entrada para que tus clientes agenden su próximo turno antes de retirarse.
            </p>

            {/* Printable Preview Card */}
            <div
              id="printable-card"
              className="mt-4 rounded-3xl border-2 border-slate-900/10 bg-gradient-to-b from-slate-50 to-white p-6 text-center shadow-lg"
            >
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-white font-bold text-lg shadow-md shadow-primary/25">
                {business.name.slice(0, 2).toUpperCase()}
              </div>
              <h3 className="mt-3 font-extrabold text-slate-900 text-base">
                {business.name}
              </h3>
              <p className="text-xs text-primary font-semibold mt-0.5">
                ¡Agendá tu turno online en 30 segundos!
              </p>

              {/* QR Image */}
              <div className="my-4 mx-auto w-44 h-44 rounded-2xl border border-slate-200 bg-white p-2.5 shadow-xs flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={qrApiUrl}
                  alt={`QR de reservas para ${business.name}`}
                  className="w-full h-full object-contain rounded-xl"
                />
              </div>

              <div className="space-y-1 text-[11px] text-slate-500">
                <p className="font-medium text-slate-700">1. Escaneá con tu celular</p>
                <p>2. Elegí servicio, fecha y hora</p>
                <p>3. Recibí confirmación inmediata por WhatsApp</p>
              </div>

              <div className="mt-4 border-t border-slate-100 pt-3">
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
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-2.5 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition"
            >
              <Download className="h-4 w-4" />
              Descargar Imagen QR
            </a>
            <button
              type="button"
              onClick={handlePrint}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-slate-800 transition"
            >
              <Printer className="h-4 w-4" />
              Imprimir Cartel
            </button>
          </div>
        </Card>

        {/* Link Sharing & Channels */}
        <div className="space-y-6">
          <Card className="space-y-4">
            <h2 className="font-bold text-slate-900 flex items-center gap-2">
              <Share2 className="h-4 w-4 text-primary" />
              Tu Enlace Oficial de Reservas
            </h2>
            <div className="flex items-center gap-2 rounded-2xl border border-border bg-slate-50 p-2 pl-3">
              <span className="flex-1 truncate font-mono text-xs text-slate-700">
                {bookingUrl}
              </span>
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:opacity-95 transition"
              >
                {copiedUrl ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {copiedUrl ? "Copiado" : "Copiar"}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="rounded-2xl border border-slate-200 bg-white p-3.5 space-y-1">
                <span className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                  <Camera className="h-3.5 w-3.5 text-pink-600" /> Instagram Bio
                </span>
                <p className="text-[11px] text-slate-500">
                  Pegalo en el campo &ldquo;Sitio web&rdquo; de tu perfil para recibir turnos de tus seguidores.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-3.5 space-y-1">
                <span className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                  <MessageCircle className="h-3.5 w-3.5 text-emerald-600" /> WhatsApp
                </span>
                <p className="text-[11px] text-slate-500">
                  Usalo en respuestas rápidas o en el saludo automático de WhatsApp Business.
                </p>
              </div>
            </div>
          </Card>

          {/* Marketing Pixels & Configuration */}
          <Card className="space-y-3.5">
            <h2 className="font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              Tracking de Pauta & Anuncios (Meta / TikTok)
            </h2>
            <p className="text-xs text-slate-500">
              Registrá las conversiones de tus campañas de Meta Ads (Instagram/Facebook) para saber qué anuncios te traen más clientes.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Meta Pixel ID (Facebook / Instagram Ads)
              </label>
              <input
                className="w-full rounded-xl border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
                placeholder="Ej. 123456789012345"
                value={business.metaPixel}
                onChange={(e) => updateBusiness({ metaPixel: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                TikTok Pixel ID
              </label>
              <input
                className="w-full rounded-xl border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
                placeholder="Ej. C1234567890"
                value={business.tiktokPixel}
                onChange={(e) => updateBusiness({ tiktokPixel: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Anticipación máxima (días)
                </label>
                <input
                  type="number"
                  className="w-full rounded-xl border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
                  value={business.maxAdvanceDays}
                  onChange={(e) =>
                    updateBusiness({ maxAdvanceDays: Number(e.target.value) })
                  }
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Fondo de Apertura de Caja (Gs)
                </label>
                <input
                  type="number"
                  className="w-full rounded-xl border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
                  value={business.openingCash}
                  onChange={(e) =>
                    updateBusiness({ openingCash: Number(e.target.value) })
                  }
                />
              </div>
            </div>

            <button
              type="button"
              className="mt-2 w-full rounded-xl bg-primary py-2.5 text-xs font-semibold text-white shadow-sm hover:opacity-95 transition"
              onClick={() => pushToast("success", "Configuraciones de marketing guardadas")}
            >
              Guardar Configuración
            </button>
          </Card>
        </div>
      </div>
    </div>
  );
}
