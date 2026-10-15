"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import BookingWizard from "@/components/booking/BookingWizard";
import { googleFontHref, themeStyle, type ThemeSettings } from "@/lib/theme";
import { themeToPublicTenant } from "@/lib/theme-public";
import type { PublicService } from "@/lib/scheduling/types";
import type { ProductItem, ServiceItem } from "@/lib/dashboard-types";

const DESKTOP_WIDTH = 1280;
// Height of the preview frame inside the dashboard, in dashboard pixels
const FRAME_HEIGHT = 460;

/**
 * Renders the real public booking page with the unsaved theme, at desktop width.
 * It lives in an iframe so the dashboard's own dark mode and styles never leak in,
 * and it is read-only so nobody books a real appointment from the preview.
 */
export default function DesktopPreview({
  theme,
  business,
  services,
  products,
}: {
  theme: ThemeSettings;
  business: { slug: string; name: string; timezone: string };
  services: ServiceItem[];
  products: ProductItem[];
}) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [mountNode, setMountNode] = useState<HTMLElement | null>(null);
  const [width, setWidth] = useState(0);

  // Copy the app's stylesheets into the iframe once it is ready
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    function setup() {
      const doc = iframe!.contentDocument;
      if (!doc) return;
      doc.head.querySelectorAll("[data-preview-style]").forEach((n) => n.remove());
      document.head.querySelectorAll('link[rel="stylesheet"], style').forEach((node) => {
        const clone = node.cloneNode(true) as HTMLElement;
        clone.setAttribute("data-preview-style", "");
        doc.head.appendChild(clone);
      });
      doc.body.style.margin = "0";
      setMountNode(doc.body);
    }
    if (iframe.contentDocument?.readyState === "complete") setup();
    iframe.addEventListener("load", setup);
    return () => iframe.removeEventListener("load", setup);
  }, []);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Same rule as the public layout (app/[tenant]/reservar/layout.tsx)
  const isDark =
    theme.themeMode === "dark" ||
    theme.themePreset === "barber-dark" ||
    theme.themePreset === "obsidian-gold" ||
    theme.themePreset === "cyber-noir";

  // Mirror the public layout's dark class on the iframe's <html>
  useEffect(() => {
    const html = mountNode?.ownerDocument.documentElement;
    if (!html) return;
    html.classList.toggle("dark", isDark);
  }, [mountNode, isDark]);

  const publicServices: PublicService[] = useMemo(
    () =>
      services
        .filter((s) => s.active !== false)
        .map((s) => ({
          id: s.id,
          name: s.name,
          durationMinutes: s.durationMin,
          price: s.price,
          category: s.category,
          description: s.description,
          imageUrl: s.imageUrl,
          hasPromo: s.hasPromo,
          promoPrice: s.promoPrice,
          promoBadge: s.promoBadge,
        })),
    [services]
  );

  const tenant = themeToPublicTenant(theme, {
    slug: business.slug,
    name: business.name,
    timezone: business.timezone,
    maxAdvanceDays: 30,
  });

  const scale = width > 0 ? width / DESKTOP_WIDTH : 0.5;

  return (
    <div ref={wrapperRef} className="w-full">
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900 shadow-2xl">
        {/* Browser chrome */}
        <div className="flex items-center gap-2 border-b border-white/10 bg-slate-800/80 px-3 py-2">
          <span className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-400/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
          </span>
          <span className="mx-auto max-w-[70%] truncate rounded-md bg-black/30 px-3 py-0.5 text-[10px] text-slate-400">
            {business.slug}.agendatepy.com/reservar
          </span>
        </div>
        <div style={{ height: FRAME_HEIGHT }} className="relative overflow-hidden">
          <iframe
            ref={iframeRef}
            title="Vista previa de escritorio"
            srcDoc="<!doctype html><html><head><meta charset='utf-8'></head><body></body></html>"
            className="absolute left-0 top-0 origin-top-left border-0"
            style={{
              width: DESKTOP_WIDTH,
              height: FRAME_HEIGHT / scale,
              transform: `scale(${scale})`,
            }}
          />
        </div>
      </div>
      {mountNode &&
        createPortal(
          <div
            className={`min-h-dvh ${isDark ? "dark bg-slate-950 text-slate-100" : "bg-[#f8fafc] text-slate-900"}`}
            style={themeStyle(theme)}
          >
            <link rel="stylesheet" href={googleFontHref(theme.fontFamily)} />
            {/* Read-only: the wheel still scrolls the iframe, clicks never reach the booking flow */}
            <div className="pointer-events-none select-none" aria-hidden="true">
              <BookingWizard tenant={tenant} services={publicServices} products={products} />
            </div>
          </div>,
          mountNode
        )}
    </div>
  );
}
