import type { CSSProperties } from "react";
import type { BackgroundEffectType } from "@/lib/theme";

/**
 * Decorative animated backgrounds for the public booking page. One component
 * renders them everywhere (public page, dashboard previews and picker thumbnails)
 * so what the owner picks is exactly what clients see.
 * Animations live in globals.css (`bgfx-*`) and stop under prefers-reduced-motion.
 */

// Legacy ids kept working by mapping them to their closest current effect
const LEGACY_EFFECTS: Partial<Record<BackgroundEffectType, BackgroundEffectType>> = {
  mesh: "ambient-mesh",
  "mesh-soft": "ambient-mesh",
  "radial-glow": "ambient-mesh",
  "floating-orbs": "floating-shapes",
  grid: "soft-grid",
  "frosted-glass": "glass-morphism",
};

export function resolveBackgroundEffect(effect?: BackgroundEffectType): BackgroundEffectType {
  if (!effect) return "none";
  return LEGACY_EFFECTS[effect] ?? effect;
}

// Fixed star positions so server and client render the same markup
const STARS = [
  [8, 12], [22, 30], [35, 8], [48, 22], [62, 14], [76, 28], [90, 10], [14, 52], [28, 66],
  [42, 48], [56, 60], [70, 44], [84, 58], [6, 82], [20, 92], [38, 78], [52, 88], [66, 76],
  [80, 90], [94, 72], [30, 40], [60, 36], [12, 30], [88, 40],
] as const;

export default function BackgroundEffect({
  effect,
  color,
  isDark,
  positioning = "fixed",
  intensity = 1,
  compact = false,
}: {
  effect?: BackgroundEffectType;
  color: string;
  isDark: boolean;
  positioning?: "fixed" | "absolute";
  /** Thumbnails use a stronger intensity so the effect reads at 40px */
  intensity?: number;
  /** Small previews: lighter blur so the effect is still visible in a few pixels */
  compact?: boolean;
}) {
  const resolved = resolveBackgroundEffect(effect);
  if (resolved === "none") return null;

  const wrapper = `pointer-events-none ${positioning} inset-0 -z-10 overflow-hidden`;
  const ink = isDark ? "255,255,255" : "15,23,42";
  const alpha = (base: number) => Math.min(1, base * intensity);
  const blurLg = compact ? "blur-md" : "blur-3xl";
  const blurMd = compact ? "blur-sm" : "blur-2xl";

  switch (resolved) {
    case "ambient-mesh":
      return (
        <div className={wrapper} aria-hidden="true">
          <div
            className={`bgfx-breathe absolute -left-[15%] -top-[20%] h-[60%] w-[60%] rounded-full ${blurLg}`}
            style={{ backgroundColor: color, opacity: alpha(isDark ? 0.28 : 0.2) }}
          />
          <div
            className={`bgfx-breathe absolute -right-[20%] top-[35%] h-[55%] w-[55%] rounded-full ${blurLg} [animation-delay:-4s]`}
            style={{ backgroundColor: color, opacity: alpha(isDark ? 0.2 : 0.14) }}
          />
          <div
            className={`bgfx-breathe absolute -bottom-[25%] left-[20%] h-[50%] w-[50%] rounded-full ${blurLg} [animation-delay:-8s]`}
            style={{ backgroundColor: isDark ? "#6366f1" : "#f472b6", opacity: alpha(isDark ? 0.14 : 0.1) }}
          />
        </div>
      );

    case "aurora-wave":
      return (
        <div className={wrapper} aria-hidden="true">
          <div
            className={`bgfx-aurora absolute -inset-[30%] ${blurLg}`}
            style={{
              opacity: alpha(isDark ? 0.45 : 0.3),
              backgroundImage: `linear-gradient(120deg, transparent 20%, ${color} 40%, ${isDark ? "#22d3ee" : "#a78bfa"} 55%, transparent 75%)`,
              backgroundSize: "200% 200%",
            }}
          />
        </div>
      );

    case "floating-shapes":
      return (
        <div className={wrapper} aria-hidden="true">
          {[
            { cls: "left-[8%] top-[12%] h-24 w-24 rounded-full", delay: "0s" },
            { cls: "right-[10%] top-[28%] h-16 w-16 rounded-2xl rotate-12", delay: "-3s" },
            { cls: "left-[18%] bottom-[18%] h-20 w-20 rounded-3xl -rotate-6", delay: "-6s" },
            { cls: "right-[22%] bottom-[8%] h-28 w-28 rounded-full", delay: "-9s" },
            { cls: "left-[48%] top-[55%] h-12 w-12 rounded-xl rotate-45", delay: "-5s" },
          ].map((s, i) => (
            <div
              key={i}
              className={`bgfx-float absolute border ${s.cls}`}
              style={{
                animationDelay: s.delay,
                borderColor: `rgba(${ink},${alpha(0.12)})`,
                backgroundColor: i % 2 === 0 ? `${color}${Math.round(alpha(0.12) * 255).toString(16).padStart(2, "0")}` : "transparent",
              }}
            />
          ))}
        </div>
      );

    case "particle-stars":
      return (
        <div className={wrapper} aria-hidden="true">
          {STARS.map(([x, y], i) => (
            <span
              key={i}
              className="bgfx-twinkle absolute rounded-full"
              style={{
                left: `${x}%`,
                top: `${y}%`,
                width: i % 5 === 0 ? 3 : 2,
                height: i % 5 === 0 ? 3 : 2,
                backgroundColor: i % 4 === 0 ? color : `rgba(${ink},${alpha(0.7)})`,
                animationDelay: `${(i * 0.37) % 4}s`,
              }}
            />
          ))}
        </div>
      );

    case "dots":
      return (
        <div
          className={wrapper}
          aria-hidden="true"
          style={{
            backgroundImage: `radial-gradient(rgba(${ink},${alpha(isDark ? 0.14 : 0.12)}) 1.2px, transparent 1.2px)`,
            backgroundSize: "18px 18px",
            maskImage: "radial-gradient(ellipse at top, black 30%, transparent 75%)",
            WebkitMaskImage: "radial-gradient(ellipse at top, black 30%, transparent 75%)",
          }}
        />
      );

    case "soft-grid": {
      const grid: CSSProperties = {
        backgroundImage: `linear-gradient(to right, rgba(${ink},${alpha(0.07)}) 1px, transparent 1px), linear-gradient(to bottom, rgba(${ink},${alpha(0.07)}) 1px, transparent 1px)`,
        backgroundSize: "32px 32px",
        maskImage: "linear-gradient(to bottom, black 0%, transparent 85%)",
        WebkitMaskImage: "linear-gradient(to bottom, black 0%, transparent 85%)",
      };
      return (
        <div className={wrapper} aria-hidden="true">
          <div className="absolute inset-0" style={grid} />
          <div
            className="bgfx-beam absolute inset-x-0 h-1/3"
            style={{ backgroundImage: `linear-gradient(to bottom, transparent, ${color}22, transparent)` }}
          />
        </div>
      );
    }

    case "glass-morphism":
      return (
        <div className={wrapper} aria-hidden="true">
          <div
            className={`bgfx-drift absolute left-[5%] top-[8%] h-[45%] w-[45%] rounded-full ${blurMd}`}
            style={{ backgroundColor: color, opacity: alpha(0.35) }}
          />
          <div
            className={`bgfx-drift absolute bottom-[5%] right-[5%] h-[40%] w-[40%] rounded-full ${blurMd} [animation-delay:-7s]`}
            style={{ backgroundColor: isDark ? "#38bdf8" : "#f9a8d4", opacity: alpha(0.3) }}
          />
          <div
            className={`absolute inset-0 ${compact ? "backdrop-blur-sm" : "backdrop-blur-2xl"}`}
            style={{ backgroundColor: isDark ? `rgba(2,6,23,${alpha(0.35)})` : `rgba(255,255,255,${alpha(0.35)})` }}
          />
        </div>
      );

    default:
      return null;
  }
}
