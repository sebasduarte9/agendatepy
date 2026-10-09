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
  Sparkles,
} from "lucide-react";
import QRCode from "qrcode";
import { useDashboardStore } from "@/store/useDashboardStore";
import Card from "@/components/dashboard/ui/Card";
import { triggerHaptic } from "@/lib/haptics";
import { tenantBookingUrl, tenantHost } from "@/lib/tenant/public-url";

type PosterStyle = "claro" | "oscuro" | "marca";

const POSTER_STYLES: { id: PosterStyle; label: string }[] = [
  { id: "claro", label: "Claro" },
  { id: "oscuro", label: "Oscuro" },
  { id: "marca", label: "Tu color" },
];

export default function ExtrasPage() {
  const { business, updateBusiness, pushToast } = useDashboardStore();
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [posterStyle, setPosterStyle] = useState<PosterStyle>("claro");
  const [canNativeShare, setCanNativeShare] = useState(false);

  const brandColor = business.primaryColor || "#FF4F2B";
  const slug = business.slug || "barberia";
  const bookingUrl = tenantBookingUrl(slug);
  const shareText = `Reservá tu turno en ${business.name} en segundos: ${bookingUrl}`;

  useEffect(() => {
    setCanNativeShare(typeof navigator !== "undefined" && typeof navigator.share === "function");
  }, []);

  useEffect(() => {
    QRCode.toDataURL(
      bookingUrl,
      { width: 600, margin: 1, color: { dark: "#090d16", light: "#ffffff" } },
      (err, url) => {
        if (!err && url) setQrDataUrl(url);
      }
    );
  }, [bookingUrl]);

  async function handleCopy() {
    triggerHaptic("selection");
    await navigator.clipboard.writeText(bookingUrl);
    setCopiedUrl(true);
    pushToast("success", "Enlace de reservas copiado");
    setTimeout(() => setCopiedUrl(false), 2000);
  }

  async function handleNativeShare() {
    triggerHaptic("light");
    try {
      await navigator.share({ title: business.name, text: shareText, url: bookingUrl });
    } catch {
      // el usuario cerró el menú de compartir
    }
  }

  function handlePrint() {
    triggerHaptic("medium");
    window.print();
  }

  const hasMetaPixel = Boolean(business.metaPixel?.trim());
  const hasTiktokPixel = Boolean(business.tiktokPixel?.trim());

  const posterClasses: Record<PosterStyle, string> = {
    claro: "bg-white text-slate-900 border-slate-200",
    oscuro: "bg-slate-950 text-white border-slate-800",
    marca: "text-white border-transparent",
  };

  const channels = [
    {
      name: "WhatsApp",
      hint: "Mandalo a tus clientes o ponelo en tu estado",
      icon: MessageCircle,
      color: "#22c55e",
      href: `https://wa.me/?text=${encodeURIComponent(shareText)}`,
    },
    {
      name: "Instagram",
      hint: "Pegalo en el campo “Sitio web” de tu perfil",
      icon: Camera,
      color: "#ec4899",
      onClick: handleCopy,
    },
    {
      name: "Abrir mi página",
      hint: "Mirá lo que ven tus clientes al reservar",
      icon: ExternalLink,
      color: "#3b82f6",
      href: bookingUrl,
    },
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-5 sm:space-y-6 pb-24 px-1 sm:px-0">
      <style>{`@media print { body * { visibility: hidden !important; } #printable-card, #printable-card * { visibility: visible !important; } #printable-card { position: fixed; inset: 0; margin: auto; width: 100mm; height: fit-content; box-shadow: none !important; } }`}</style>

      {/* Header */}
      <div className="kpi-rise flex flex-col gap-1 py-1">
        <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
          Kit de marketing
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Tu link, tu QR y tus carteles para que te reserven desde cualquier lado.
        </p>
      </div>

      {/* Link hero */}
      <div className="kpi-rise rounded-3xl bg-white dark:bg-[#121215] border border-slate-200/80 dark:border-white/10 p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-primary">
              <Sparkles className="h-3 w-3" /> Tu link de reservas
            </span>
            <p className="mt-3 truncate font-mono text-lg sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              {tenantHost(slug)}
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Abierto 24/7. Tus clientes reservan sin descargar nada.</p>
          </div>
          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-2xl px-4 py-2.5 text-xs font-bold text-white shadow-md transition hover:brightness-110 active:scale-95 cursor-pointer"
              style={{ backgroundColor: brandColor }}
            >
              {copiedUrl ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copiedUrl ? "¡Copiado!" : "Copiar link"}
            </button>
            {canNativeShare && (
              <button
                type="button"
                onClick={handleNativeShare}
                className="inline-flex items-center justify-center gap-1.5 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900 px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 transition hover:bg-slate-50 active:scale-95 cursor-pointer"
              >
                <Share2 className="h-4 w-4" /> Compartir
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Channels */}
      <div className="kpi-stagger grid gap-3 sm:grid-cols-3">
        {channels.map((c) => {
          const Icon = c.icon;
          const content = (
            <>
              <span
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl transition-transform group-hover:scale-110"
                style={{ backgroundColor: `${c.color}1a`, color: c.color }}
              >
                <Icon className="h-5 w-5" />
              </span>
              <span className="min-w-0 text-left">
                <span className="block text-sm font-bold text-slate-900 dark:text-white">{c.name}</span>
                <span className="block text-[11px] text-slate-500 dark:text-slate-400">{c.hint}</span>
              </span>
            </>
          );
          const cls =
            "group flex items-center gap-3 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900 p-4 shadow-xs transition hover:-translate-y-0.5 hover:shadow-md cursor-pointer";
          return c.href ? (
            <a key={c.name} href={c.href} target="_blank" rel="noopener noreferrer" className={cls}>
              {content}
            </a>
          ) : (
            <button key={c.name} type="button" onClick={c.onClick} className={cls}>
              {content}
            </button>
          );
        })}
      </div>

      <div className="grid gap-5 md:grid-cols-5">
        {/* Poster */}
        <Card className="kpi-rise md:col-span-3 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
              <QrCode className="h-5 w-5 text-primary shrink-0" />
              <h2>Cartel para mostrador</h2>
            </div>
            <div className="inline-flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1">
              {POSTER_STYLES.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => {
                    triggerHaptic("selection");
                    setPosterStyle(s.id);
                  }}
                  className={`rounded-lg px-3 py-1 text-[11px] font-bold transition cursor-pointer ${
                    posterStyle === s.id
                      ? "bg-white dark:bg-slate-950 text-slate-900 dark:text-white shadow-xs"
                      : "text-slate-500"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-3xl bg-slate-100/80 dark:bg-slate-950/60 p-4 sm:p-8">
            <div
              id="printable-card"
              className={`mx-auto max-w-[300px] rounded-3xl border p-6 text-center shadow-xl transition-colors duration-300 ${posterClasses[posterStyle]}`}
              style={posterStyle === "marca" ? { backgroundColor: brandColor } : undefined}
            >
              {business.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={business.logoUrl} alt="" className="mx-auto h-14 w-14 rounded-2xl object-cover" />
              ) : (
                <div
                  className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-2xl text-lg font-black text-white"
                  style={{ backgroundColor: posterStyle === "marca" ? "rgba(255,255,255,0.2)" : brandColor }}
                >
                  {business.name.slice(0, 2).toUpperCase()}
                </div>
              )}
              <h3 className="mt-3 text-lg font-black leading-tight">{business.name}</h3>
              <p className="mt-1 text-xs font-bold opacity-80">Escaneá y reservá tu turno</p>

              <div className="my-5 mx-auto aspect-square w-44 rounded-2xl bg-white p-2.5 shadow-md">
                {qrDataUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={qrDataUrl} alt={`QR de reservas para ${business.name}`} className="h-full w-full" />
                ) : (
                  <div className="h-full w-full animate-pulse rounded-xl bg-slate-100" />
                )}
              </div>

              <ol className="space-y-1 text-[11px] opacity-80">
                <li>1. Abrí la cámara de tu celular</li>
                <li>2. Elegí servicio, día y hora</li>
                <li>3. Recibí la confirmación por WhatsApp</li>
              </ol>
              <p className="mt-4 border-t border-current/10 pt-3 font-mono text-[10px] opacity-60">{tenantHost(slug)}</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <a
              href={qrDataUrl || "#"}
              download={`qr_${slug}.png`}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-800 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 transition hover:bg-slate-50 dark:hover:bg-slate-700"
            >
              <Download className="h-4 w-4 text-slate-400" /> Descargar solo el QR
            </a>
            <button
              type="button"
              onClick={handlePrint}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 dark:bg-white py-2.5 text-xs font-bold text-white dark:text-slate-900 transition hover:opacity-90 active:scale-[0.98] cursor-pointer"
            >
              <Printer className="h-4 w-4" /> Imprimir cartel
            </button>
          </div>
        </Card>

        {/* Pixels */}
        <Card className="kpi-rise md:col-span-2 space-y-4 self-start">
          <div>
            <h2 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-base">
              <Target className="h-4 w-4 text-primary shrink-0" /> Medí tus anuncios
            </h2>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Conectá tus píxeles para saber cuántas reservas trae cada campaña de Instagram o TikTok.
            </p>
          </div>

          <div className="space-y-3 text-xs">
            {[
              { label: "Meta Pixel (Facebook / Instagram)", key: "metaPixel" as const, placeholder: "Ej. 182749102948192", active: hasMetaPixel },
              { label: "TikTok Pixel", key: "tiktokPixel" as const, placeholder: "Ej. C192837482", active: hasTiktokPixel },
            ].map((f) => (
              <div key={f.key}>
                <label className="mb-1 flex items-center justify-between font-semibold text-slate-700 dark:text-slate-200">
                  {f.label}
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      f.active ? "bg-emerald-500/10 text-emerald-600" : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                    }`}
                  >
                    {f.active ? "Conectado" : "Sin conectar"}
                  </span>
                </label>
                <input
                  className="w-full rounded-xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900 px-3.5 py-2.5 font-mono text-slate-900 dark:text-white placeholder:text-slate-400 transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder={f.placeholder}
                  value={business[f.key] ?? ""}
                  onChange={(e) => updateBusiness({ [f.key]: e.target.value })}
                />
              </div>
            ))}

            <button
              type="button"
              className="w-full rounded-2xl bg-primary py-2.5 text-xs font-bold text-white shadow-md transition hover:opacity-95 active:scale-[0.98] cursor-pointer"
              onClick={() => {
                triggerHaptic("success");
                pushToast("success", "Píxeles guardados");
              }}
            >
              Guardar píxeles
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}
