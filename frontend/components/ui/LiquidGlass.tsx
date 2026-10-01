"use client";

import React, { useRef, useState, useEffect, useId, useCallback } from "react";

// Displacement maps de refracción óptica
const DISPLACEMENT_MAPS: Record<string, string> = {
  standard:
    "data:image/jpeg;base64,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UAkEkziomgGgkoxZGgxZFQFQlYnQHRdPfj/10KCSCKESCNiVkViPSLpD0h6I0Q0I0A2IoBWBIJIBKBIJoJIJ2R2J0JWBUJ0JUB0XTv479dFZDYiglYigkhEgjZFQjRFQjRFQjQigFYigHYigmgEgmglYlYnQlQlYlQHQlQnQ9P/kf1yVkNiNCNkNiVENiNiViNEViNkVCVgKCViViViSCViSCVgdCViVCViVCdgVCVCdD1D+U/XBWQ2I0I2Q2JUQ2I0JWQ0I2JUQ2JUI2J0JWJWJWA2R0BWJ0I2JUJ2BUJUJ0P//EABkQAQEBAQEBAAAAAAAAAAAAAAECABEDEP/aAAgBAQABAgB1atWrVq1atWrVq1atWrVq1atWrVq1atWrVq+OrVq1atWrVq1atWrVq1atWrVq1atWrVq1atXxVppppppdWrVq1atWrVq1NNNNNNNNNNNPVWmmmmms6tWrVq1atWpppppppppppppp6q0000uc51atWrVq1ammmmmmmmmmmmmt1Vpppc5znVq1atWrVqaaaaaaaaaaaaaeqtNLnOc51atWrVq1ammmmmmmmmmmmmnqrS5znOc6tWrVq16222mmmmmmlVppp6tKuc5znOrVq1a9TbbbbTTTTTSq000qtLnOc5zq1atWrW0222200000qqqtKqrnOc5zq1atTbbbbbbbbTTTSqqqqqq5znOc6tTTTbbbbbbbbTTTSqqqqrlVznOctNNNtttttttttNNNNKqqqrqznKqrTTTTbbbbbbbbbTTTSqqqqrqznOc5aaaabbbbbbbbbaaaaVVVVVdWc5znVq1NNttttttttttNNKqqqqudWc5znVq16tbbbbbbbbbbTTSqqqq5XVnOc6tWrVrb1tttttttttNNKqqqqrWrK5VWmmm2230bbbbbbaaaXOc5zlVa1KuVVppptttt9G22222mmlzlVznK6tWVVWmmmm2222222222mlznOc5znLWppVVWmmm22222229bTWrOc5znOcq1qaaVpWmm222222229erVqznOc5znKtatStK0rTbTTbbbberXr1as5znOc5aVpppppWlabaabbbb1ta9WrVnOc5znU0rTTTTTTTTTbTTbbbTWvVq1as5znOdTTStNNNNNNNNNtNNtttN6tWvVq1ZznOrU00rTTTTTTTTTTTTTbTWvVq1atWrOc6tTTTStNNNNNNNNNNtNNtNa9WrVq1Z1Z1NNNNNK1q1NNNNNNNNNNNtNatWrVq1atWrU00000rWrVq1atWrVq1alaaa1atWrVq1NNNammmmla1atWrVq1aterVq16tWrVnVqa1NK1qaaaVX/xAAWEAADAAAAAAAAAAAAAAAAAAAhgJD/2gAIAQEAAz8AaExf/8QAGhEBAQEBAQEBAAAAAAAAAAAAAQISEQADEP/aAAgBAgEBAgDx48ePHjx48ePHjx48ePHjx48ePHjx48ePHj86IiIiIiInjx48ePHjx48IiIiIj0oooooooooRERER73ve60UUUUUUVrWiiiiiihERERER73ve97ooooorRWiiiiihKERERER73ve973RRRRWtFFFFFFCIiIiIiPe973ve60UUVrRRRRRRQiIlCIiI973ve973pRRWiiiiiiiiiiiiiiihEe973ve973RRWtFFFFFFFFFFFFFFFFFFa13ve973WitaKKKKKKKKKKKKKKKKKK1rWtd1rutFa1oooooooooooosssooorWta1rWta1rRRRRRRRRRRZZZZZZZZZWta1rWta1rRRRRRRRRZZZZZZZZZZZZe9a1rWta1rWitaKLLLLLLLLLLLLLLLLL3rWta1rWtFbLLLLLLLLLLLLLLLLLLLL3vWta1rWita1ssssssss+hZZZZZZZZe961rWta0Vre97LLLLLLLLLLLPoWWWWWXrWta1oorWta3ssss+hZZZZ9Cyyyyyyyyiita1orWta1ve9llllllllllllllllFFa0VorWta1ve9llllllllllllllllllFFFaK1rWta1rWiyyyyyyyyyyyyiiiiiiitFFa1rWta1oosoosssssoooosoooorRRRWta1rWta0UUUUUWUUUUUUUUUUUVoooorWta1rWtaKKKKKKmiiiiiiiiiiiiiiitd73ve61oSiiipoqaKKKKKKKKKK0UUUVrve973vREREZoSihEooooorRRRRWtd73ve9EREREREoSiiiiitFllllla73ve9ERERERESiiiiiitH0PoWWWWVrXe96IiIiMoiJRRRRRRWjwlFFllllFFd6IiIiIlCUUUUUUUUUePHjx48ePCIiIiIiIiUUUUUUUUUUUePHjx48ePHjx48ePHjx48IiUUUUUUJRRRX//xAAWEQADAAAAAAAAAAAAAAAAAAABYJD/2gAIAQIBAz8AtEV7/8QAFxEBAQEBAAAAAAAAAAAAAAAAAAECEP/aAAgBAwEBAgCtNNNNNNNNNNNNNNNNNNNNNNNNNNNNNcrTTTTTTTTTTTTTTTTTTTTTTTTTTTTTXKrTTTTTTTU000000000000000000001FVpppppqampqaaaaaaaaaaaaaaaaaaaa5Vaaaaampqampqammmmmmmmmmmlaaaaaaiq0001NTU1NTU1NTTTTTTTTTTSqqtNNNcqtNNSyzU1LNTU1NTTTTTTTTTSqqq001ytNLLLLNTU1NTU1NTbbbTTTTTSqqq001ytNLLLLLNTU1NTU3NttttNNNNNKqq001KrSyyyyyzU1NTU3Nzc02220000qqqqrSqqyyyyyzU1NTU3Nzc3NttttNNNKqqqqqqssssss1NTU3Nzc3NzbbbbTTTSqqqqqqrLLLLLNTU1Nzc3Nzc22220000qqqqqqqqssss1NTU3Nzc3NzbbbbbTTSqqqqqqqqqqzU1NTc3Nzc3Nzbc22000qqqqqqqqqqqtTU3Nzc3Nzc3NtzbTTSqqqqrKqqqqqtNNzc23Nzc3Nzc3NTU1KqqqrKqqqqqtNNNNttzc3Nzc3NzU1NLLLLLKqqqqqqqq0022223Nzc3NzU1NSyyyyyyqqqqqqqrTTbbbbc3Nzc3NTU1LLLLLLKsqqqqqqrTTTTbbbc3Nzc1NTUsssssssqqqqqqrTTTTTbbbTc3NTU1NTUsssssqqqqqqqq0000222023NTU1NTUsssssqqqqqqqq000000003NTU1NTU1LLLLLNKrTSqqqqtNNNNNNtNNTU1NSzUssss00qq0qqqqrTTTTTTTTTU1NTUs1LLLNNNKrTTTSqqq00000000001NTU1LNTU0000qtNNNKqqqtNNNNNNNNTU1NTUs1NNNNNKss1NNNK00qtK0000001NNTU0s000000qq000001NKrStNNNNK1NNNNStNNNNNKqtNNNNNNNK0000000rU0000rTTTTTSq00000rTTTTTTTTTTTTTTTTStNNNNKr/xAAUEQEAAAAAAAAAAAAAAAAAAACg/9oACAEDAQM/AAAf/9k=",
};

export interface LiquidGlassProps {
  children: React.ReactNode;
  displacementScale?: number;
  blurAmount?: number;
  saturation?: number;
  aberrationIntensity?: number;
  elasticity?: number;
  cornerRadius?: number;
  className?: string;
  padding?: string;
  style?: React.CSSProperties;
  overLight?: boolean;
  mode?: "standard" | "polar";
  onClick?: () => void;
  interactive?: boolean;
  showGlare?: boolean;
  glareOpacity?: number;
  useDisplacement?: boolean;
}

export default function LiquidGlass({
  children,
  displacementScale = 12,
  blurAmount = 0.06,
  saturation = 110,
  aberrationIntensity = 0.8,
  elasticity = 0.15,
  cornerRadius = 999,
  className = "",
  padding = "8px 20px",
  style = {},
  overLight = true,
  mode = "standard",
  onClick,
  interactive = true,
  showGlare = false,
  glareOpacity = 0.12,
  useDisplacement = false,
}: LiquidGlassProps) {
  const filterId = useId().replace(/:/g, "_");
  const glassRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [elasticOffset, setElasticOffset] = useState({ x: 0, y: 0 });
  const [directionalScale, setDirectionalScale] = useState({ sx: 1, sy: 1 });

  useEffect(() => {
    setMounted(true);
  }, []);

  // Micro-física elástica Apple (muy sutil y refinada)
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!interactive || !glassRef.current) return;
      const rect = glassRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const deltaX = e.clientX - centerX;
      const deltaY = e.clientY - centerY;
      const dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      const maxDist = Math.max(rect.width, rect.height) / 2;
      const factor = Math.min(dist / (maxDist || 1), 1) * elasticity;

      setElasticOffset({
        x: (deltaX / (rect.width || 1)) * 8 * elasticity,
        y: (deltaY / (rect.height || 1)) * 8 * elasticity,
      });

      const normX = dist === 0 ? 0 : deltaX / dist;
      const normY = dist === 0 ? 0 : deltaY / dist;
      setDirectionalScale({
        sx: 1 + Math.abs(normX) * factor * 0.08 - Math.abs(normY) * factor * 0.04,
        sy: 1 + Math.abs(normY) * factor * 0.08 - Math.abs(normX) * factor * 0.04,
      });
    },
    [interactive, elasticity]
  );

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    setIsActive(false);
    setElasticOffset({ x: 0, y: 0 });
    setDirectionalScale({ sx: 1, sy: 1 });
  }, []);

  const currentMap = DISPLACEMENT_MAPS[mode] || DISPLACEMENT_MAPS.standard;
  const isFirefox =
    typeof navigator !== "undefined" &&
    navigator.userAgent.toLowerCase().includes("firefox");

  // Fallback SSR / Primer render sin destellos
  if (!mounted) {
    return (
      <div
        className={`relative inline-flex items-center justify-center rounded-full border border-slate-200/80 dark:border-white/10 bg-white/75 dark:bg-slate-900/75 backdrop-blur-xl shadow-xs ${className}`}
        style={{
          borderRadius: `${cornerRadius}px`,
          padding,
          ...style,
        }}
        onClick={onClick}
      >
        {children}
      </div>
    );
  }

  const transformStyle = interactive
    ? `translate(${elasticOffset.x}px, ${elasticOffset.y}px) scale(${
        isActive && onClick ? 0.98 : 1
      }) scaleX(${directionalScale.sx}) scaleY(${directionalScale.sy})`
    : undefined;

  return (
    <div
      ref={glassRef}
      className={`relative inline-flex items-center justify-center select-none transition-transform duration-200 ease-out ${
        onClick ? "cursor-pointer" : ""
      } ${className}`}
      style={{
        transform: transformStyle,
        borderRadius: `${cornerRadius}px`,
        ...style,
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      onMouseDown={() => setIsActive(true)}
      onMouseUp={() => setIsActive(false)}
      onClick={onClick}
    >
      {/* =================================================================== */}
      {/* SVG DISPLACEMENT FILTER (Fórmula óptica visionOS de liquid-glass)     */}
      {/* =================================================================== */}
      <svg
        className="absolute pointer-events-none -z-50 opacity-0 overflow-hidden w-0 h-0"
        aria-hidden="true"
      >
        <defs>
          <radialGradient id={`${filterId}-edge-mask`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="black" stopOpacity="0" />
            <stop
              offset={`${Math.max(40, 85 - aberrationIntensity * 2)}%`}
              stopColor="black"
              stopOpacity="0"
            />
            <stop offset="100%" stopColor="white" stopOpacity="1" />
          </radialGradient>

          <filter
            id={filterId}
            x="-20%"
            y="-20%"
            width="140%"
            height="140%"
            colorInterpolationFilters="sRGB"
          >
            <feImage
              id="feimage"
              x="0"
              y="0"
              width="100%"
              height="100%"
              result="DISPLACEMENT_MAP"
              href={currentMap}
              preserveAspectRatio="xMidYMid slice"
            />

            <feColorMatrix
              in="DISPLACEMENT_MAP"
              type="matrix"
              values="0.3 0.3 0.3 0 0
                      0.3 0.3 0.3 0 0
                      0.3 0.3 0.3 0 0
                      0 0 0 1 0"
              result="EDGE_INTENSITY"
            />
            <feComponentTransfer in="EDGE_INTENSITY" result="EDGE_MASK">
              <feFuncA
                type="discrete"
                tableValues={`0 ${aberrationIntensity * 0.04} 1`}
              />
            </feComponentTransfer>

            <feOffset
              in="SourceGraphic"
              dx="0"
              dy="0"
              result="CENTER_ORIGINAL"
            />

            {/* Separación de canales RGB sutil (aberración prismática elegante) */}
            <feDisplacementMap
              in="SourceGraphic"
              in2="DISPLACEMENT_MAP"
              scale={displacementScale * -1}
              xChannelSelector="R"
              yChannelSelector="B"
              result="RED_DISPLACED"
            />
            <feColorMatrix
              in="RED_DISPLACED"
              type="matrix"
              values="1 0 0 0 0
                      0 0 0 0 0
                      0 0 0 0 0
                      0 0 0 1 0"
              result="RED_CHANNEL"
            />

            <feDisplacementMap
              in="SourceGraphic"
              in2="DISPLACEMENT_MAP"
              scale={
                displacementScale * (-1 - aberrationIntensity * 0.04)
              }
              xChannelSelector="R"
              yChannelSelector="B"
              result="GREEN_DISPLACED"
            />
            <feColorMatrix
              in="GREEN_DISPLACED"
              type="matrix"
              values="0 0 0 0 0
                      0 1 0 0 0
                      0 0 0 0 0
                      0 0 0 1 0"
              result="GREEN_CHANNEL"
            />

            <feDisplacementMap
              in="SourceGraphic"
              in2="DISPLACEMENT_MAP"
              scale={
                displacementScale * (-1 - aberrationIntensity * 0.08)
              }
              xChannelSelector="R"
              yChannelSelector="B"
              result="BLUE_DISPLACED"
            />
            <feColorMatrix
              in="BLUE_DISPLACED"
              type="matrix"
              values="0 0 0 0 0
                      0 0 0 0 0
                      0 0 1 0 0
                      0 0 0 1 0"
              result="BLUE_CHANNEL"
            />

            <feBlend
              in="GREEN_CHANNEL"
              in2="BLUE_CHANNEL"
              mode="screen"
              result="GB_COMBINED"
            />
            <feBlend
              in="RED_CHANNEL"
              in2="GB_COMBINED"
              mode="screen"
              result="RGB_COMBINED"
            />
            <feGaussianBlur
              in="RGB_COMBINED"
              stdDeviation={Math.max(0.1, 0.4 - aberrationIntensity * 0.1)}
              result="ABERRATED_BLURRED"
            />
            <feComposite
              in="ABERRATED_BLURRED"
              in2="EDGE_MASK"
              operator="in"
              result="EDGE_ABERRATION"
            />
            <feComponentTransfer in="EDGE_MASK" result="INVERTED_MASK">
              <feFuncA type="table" tableValues="1 0" />
            </feComponentTransfer>
            <feComposite
              in="CENTER_ORIGINAL"
              in2="INVERTED_MASK"
              operator="in"
              result="CENTER_CLEAN"
            />
            <feComposite
              in="EDGE_ABERRATION"
              in2="CENTER_CLEAN"
              operator="over"
            />
          </filter>
        </defs>
      </svg>

      {/* =================================================================== */}
      {/* CAPA DE CRISTAL LÍQUIDO MATE APPLE (Backdrop-filter + Refracción)   */}
      {/* =================================================================== */}
      <div
        className="absolute inset-0 pointer-events-none overflow-hidden transition-all duration-200"
        style={{
          borderRadius: `${cornerRadius}px`,
          backdropFilter: `blur(${(overLight ? 12 : 8) + blurAmount * 24}px) saturate(${saturation}%)`,
          WebkitBackdropFilter: `blur(${(overLight ? 12 : 8) + blurAmount * 24}px) saturate(${saturation}%)`,
          filter: useDisplacement && !isFirefox ? `url(#${filterId})` : undefined,
        }}
      />

      {/* Borde biselado de cristal Apple (sutil y tenue, sin destello excesivo) */}
      <div
        className="absolute inset-0 pointer-events-none rounded-[inherit] border transition-opacity duration-200"
        style={{
          borderColor: overLight
            ? "rgba(255, 255, 255, 0.35)"
            : "rgba(255, 255, 255, 0.12)",
          boxShadow: overLight
            ? "inset 0 1px 0.5px 0 rgba(255, 255, 255, 0.35), 0 2px 8px -1px rgba(0, 0, 0, 0.04)"
            : "inset 0 1px 0.5px 0 rgba(255, 255, 255, 0.15), 0 2px 8px -1px rgba(0, 0, 0, 0.15)",
        }}
      />

      {/* Reflejo de luz cenital sutil Apple (solo si showGlare está activo, sin brillos plásticos) */}
      {showGlare && (
        <div
          className="absolute inset-0 pointer-events-none rounded-[inherit] transition-opacity duration-200"
          style={{
            backgroundImage:
              "linear-gradient(180deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.02) 35%, transparent 100%)",
            opacity: isHovered ? glareOpacity * 1.4 : glareOpacity,
          }}
        />
      )}

      {/* Contenido */}
      <div
        className="relative z-10 flex items-center justify-center w-full"
        style={{ padding }}
      >
        {children}
      </div>
    </div>
  );
}
