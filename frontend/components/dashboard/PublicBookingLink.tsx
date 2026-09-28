"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Copy, Check, ExternalLink, QrCode, X, Globe } from "lucide-react";
import QRCode from "qrcode";

interface PublicBookingLinkProps {
  slug: string;
  businessName?: string;
  variant?: "banner" | "compact" | "card" | "inline";
  showQrButton?: boolean;
  className?: string;
}

export default function PublicBookingLink({
  slug,
  businessName,
  variant = "compact",
  showQrButton = true,
  className = "",
}: PublicBookingLinkProps) {
  const [copied, setCopied] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
    }
  }, []);

  const path = `/${slug || "barberia"}/reservar`;
  const fullUrl = origin ? `${origin}${path}` : `https://agendate.py${path}`;

  const handleCopy = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(fullUrl);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = fullUrl;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      console.error("Error al copiar enlace:", e);
    }
  };

  const handleOpenQrModal = async () => {
    setShowQrModal(true);
    if (!qrDataUrl) {
      try {
        const url = await QRCode.toDataURL(fullUrl, {
          width: 320,
          margin: 2,
          color: {
            dark: "#090d16",
            light: "#ffffff",
          },
        });
        setQrDataUrl(url);
      } catch (e) {
        console.error("Error generando QR local:", e);
      }
    }
  };

  // 1. Variante "inline"
  if (variant === "inline") {
    return (
      <div className={`inline-flex items-center gap-2 text-xs ${className}`}>
        <code className="rounded-lg bg-slate-100 dark:bg-slate-800/80 px-2 py-1 font-mono text-slate-800 dark:text-slate-200 font-semibold border border-slate-200 dark:border-slate-700">
          agendate.py/{slug || "barberia"}
        </code>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1 rounded-md bg-white dark:bg-slate-800 px-2 py-1 text-slate-700 dark:text-slate-200 hover:bg-slate-50 border border-slate-200 dark:border-slate-700 transition"
        >
          {copied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
          <span>{copied ? "Copiado" : "Copiar"}</span>
        </button>
        <Link
          href={path}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-primary hover:underline font-semibold"
        >
          <span>Ver</span>
          <ExternalLink className="h-3 w-3" />
        </Link>
      </div>
    );
  }

  // 2. Variante "banner"
  if (variant === "banner") {
    return (
      <>
        <div className={`rounded-2xl border border-primary/20 bg-primary/5 dark:bg-primary/10 p-4 sm:p-5 backdrop-blur-md ${className}`}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-primary" />
                <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Tu Enlace Público de Reservas
                </span>
                <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                  Activo 24/7
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Compartí este enlace en tu Instagram, WhatsApp Business o cartelería para que tus clientes agenden solos.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-mono text-slate-800 dark:text-slate-200 shadow-2xs">
                <span className="text-slate-400 select-none mr-1">agendate.py/</span>
                <span className="font-bold text-primary">{slug || "barberia"}</span>
              </div>

              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:opacity-95 transition active:scale-95"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-white" /> : <Copy className="h-3.5 w-3.5 text-white" />}
                <span>{copied ? "¡Enlace copiado!" : "Copiar enlace"}</span>
              </button>

              <Link
                href={path}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
              >
                <span>Ver como cliente</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </Link>

              {showQrButton && (
                <button
                  type="button"
                  onClick={handleOpenQrModal}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
                  title="Generar código QR"
                >
                  <QrCode className="h-3.5 w-3.5 text-slate-600 dark:text-slate-300" />
                  <span>Código QR</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Modal de QR Local (0 librerías externas o APIs de terceros) */}
        {showQrModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="relative w-full max-w-sm rounded-3xl bg-white dark:bg-slate-900 p-6 text-center shadow-2xl border border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowQrModal(false)}
                className="absolute right-4 top-4 rounded-full p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-3">
                <QrCode className="h-6 w-6" />
              </div>

              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Código QR para {businessName || "tu negocio"}
              </h3>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Escaneá con la cámara del celular para abrir el portal de reservas.
              </p>

              <div className="my-5 mx-auto flex h-52 w-52 items-center justify-center rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-white p-2 shadow-inner">
                {qrDataUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={qrDataUrl}
                    alt={`QR de reservas para ${slug}`}
                    className="h-full w-full object-contain rounded-xl"
                  />
                ) : (
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                )}
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="flex-1 rounded-xl bg-primary py-2.5 text-xs font-bold text-white hover:opacity-95 transition"
                >
                  {copied ? "¡Enlace copiado!" : "Copiar enlace web"}
                </button>
                {qrDataUrl && (
                  <a
                    href={qrDataUrl}
                    download={`qr_reserva_${slug}.png`}
                    className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 transition inline-flex items-center"
                  >
                    Descargar QR
                  </a>
                )}
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // 3. Variante "compact" (por defecto)
  return (
    <>
      <div className={`flex flex-wrap items-center gap-2 ${className}`}>
        <div className="flex items-center rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/80 px-2.5 py-1.5 text-xs font-mono text-slate-700 dark:text-slate-300">
          <span className="text-slate-400 select-none mr-0.5">/</span>
          <span className="font-semibold text-primary">{slug || "barberia"}</span>
        </div>

        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
          title="Copiar enlace directo"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5 text-slate-400" />}
          <span>{copied ? "Copiado" : "Copiar enlace"}</span>
        </button>

        <Link
          href={path}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 px-3 py-1.5 text-xs font-bold transition"
        >
          <span>Ver como cliente</span>
          <ExternalLink className="h-3.5 w-3.5" />
        </Link>

        {showQrButton && (
          <button
            type="button"
            onClick={handleOpenQrModal}
            className="inline-flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-50 transition"
            title="Ver código QR"
          >
            <QrCode className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm rounded-3xl bg-white dark:bg-slate-900 p-6 text-center shadow-2xl border border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setShowQrModal(false)}
              className="absolute right-4 top-4 rounded-full p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-3">
              <QrCode className="h-6 w-6" />
            </div>

            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Código QR de Reservas
            </h3>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Escaneá para acceder directamente a {businessName || slug}.
            </p>

            <div className="my-5 mx-auto flex h-52 w-52 items-center justify-center rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-white p-2 shadow-inner">
              {qrDataUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={qrDataUrl}
                  alt={`QR de reservas para ${slug}`}
                  className="h-full w-full object-contain rounded-xl"
                />
              ) : (
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              )}
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleCopy}
                className="flex-1 rounded-xl bg-primary py-2.5 text-xs font-bold text-white hover:opacity-95 transition"
              >
                {copied ? "¡Enlace copiado!" : "Copiar enlace web"}
              </button>
              {qrDataUrl && (
                <a
                  href={qrDataUrl}
                  download={`qr_reserva_${slug}.png`}
                  className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 transition inline-flex items-center"
                >
                  Descargar
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
