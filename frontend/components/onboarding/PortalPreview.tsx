"use client";

import { CalendarDays, Clock, Store } from "lucide-react";
import { fontStack } from "@/lib/theme";
import { readableOn, type PortalDesign } from "./designs";

const RADIUS: Record<string, string> = { full: "9999px", lg: "12px", md: "8px" };

interface PortalPreviewProps {
  design: PortalDesign;
  businessName: string;
  logoUrl?: string;
  services: { name: string; duration: number; price: number }[];
  tagline: string;
  compact?: boolean;
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "TN";
  return (parts[0][0] + (parts[1]?.[0] ?? "")).toUpperCase();
}

export default function PortalPreview({
  design,
  businessName,
  logoUrl,
  services,
  tagline,
  compact = false,
}: PortalPreviewProps) {
  const { theme } = design;
  const name = businessName.trim() || "Tu negocio";
  const radius = RADIUS[theme.buttonRadius];
  const onPrimary = readableOn(theme.primaryColor);
  const layout = theme.layoutStyle;
  const centered = layout === "floating-card";
  const logoRadius = layout === "panoramic" ? "9999px" : layout === "split-gallery" ? "14px" : "10px";
  const shownServices = services.slice(0, compact ? 2 : 3);

  return (
    <div
      className="h-full w-full overflow-hidden"
      style={{
        backgroundColor: theme.backgroundColor,
        color: design.text,
        fontFamily: fontStack(theme.fontFamily),
      }}
    >
      <div className={compact ? "p-2.5" : "p-3.5"}>
        <div
          className="overflow-hidden"
          style={{
            backgroundColor: design.surface,
            border: `1px solid ${design.border}`,
            borderRadius: layout === "floating-card" ? 6 : 18,
          }}
        >
          {layout !== "floating-card" && (
            <div
              className={compact ? "h-11" : "h-16"}
              style={{
                backgroundImage: `linear-gradient(120deg, ${design.bannerFrom}, ${design.bannerTo})`,
              }}
            />
          )}

          <div
            className={`${compact ? "px-3 pb-3" : "px-4 pb-4"} ${centered ? "pt-4 text-center" : ""}`}
          >
            <div
              className={`flex ${centered ? "justify-center" : "items-end justify-between"} ${
                centered ? "" : compact ? "-mt-5" : "-mt-7"
              }`}
            >
              <div
                className={`${compact ? "h-10 w-10 text-xs" : "h-14 w-14 text-base"} flex shrink-0 items-center justify-center overflow-hidden font-bold`}
                style={{
                  borderRadius: logoRadius,
                  backgroundColor: logoUrl ? "#ffffff" : theme.primaryColor,
                  color: onPrimary,
                  border: `2px solid ${design.surface}`,
                  boxShadow: "0 4px 12px -4px rgba(15,23,42,0.25)",
                }}
              >
                {logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={logoUrl} alt="" className="h-full w-full object-contain" />
                ) : (
                  initials(name)
                )}
              </div>
            </div>

            <p
              className={`${compact ? "mt-2 text-[13px]" : "mt-3 text-[17px]"} font-bold leading-tight tracking-[-0.01em] truncate`}
            >
              {name}
            </p>
            <p
              className={`mt-0.5 flex items-center gap-1 ${centered ? "justify-center" : ""} ${
                compact ? "text-[9px]" : "text-[11px]"
              }`}
              style={{ color: design.muted }}
            >
              <Store className={compact ? "h-2.5 w-2.5" : "h-3 w-3"} />
              {tagline}
            </p>

            {centered && (
              <div className="mx-auto mt-3 h-px w-10" style={{ backgroundColor: theme.primaryColor }} />
            )}

            <div className={`${compact ? "mt-2.5 space-y-1.5" : "mt-4 space-y-2"}`}>
              {shownServices.map((s, i) => (
                <div
                  key={`${s.name}-${i}`}
                  className={`flex items-center justify-between gap-2 text-left ${
                    compact ? "px-2 py-1.5" : "px-3 py-2.5"
                  }`}
                  style={{
                    border: `1px solid ${design.border}`,
                    borderRadius: layout === "floating-card" ? 6 : 12,
                  }}
                >
                  <div className="min-w-0">
                    <p className={`${compact ? "text-[10px]" : "text-xs"} font-semibold truncate`}>
                      {s.name}
                    </p>
                    <p
                      className={`flex items-center gap-1 tabular-nums ${compact ? "text-[8.5px]" : "text-[10px]"}`}
                      style={{ color: design.muted }}
                    >
                      <Clock className={compact ? "h-2 w-2" : "h-2.5 w-2.5"} />
                      {s.duration} min
                      {compact && (
                        <span className="font-bold" style={{ color: theme.primaryColor }}>
                          · Gs. {s.price.toLocaleString("es-PY")}
                        </span>
                      )}
                    </p>
                  </div>
                  {!compact && (
                    <span className="text-xs font-bold tabular-nums shrink-0" style={{ color: theme.primaryColor }}>
                      Gs. {s.price.toLocaleString("es-PY")}
                    </span>
                  )}
                </div>
              ))}
            </div>

            <div
              className={`flex items-center justify-center gap-1.5 font-bold ${
                compact ? "mt-2.5 h-7 text-[10px]" : "mt-4 h-10 text-xs"
              }`}
              style={{ backgroundColor: theme.primaryColor, color: onPrimary, borderRadius: radius }}
            >
              <CalendarDays className={compact ? "h-3 w-3" : "h-3.5 w-3.5"} />
              Reservar turno
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
