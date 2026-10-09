import type { OnboardingTheme } from "@/lib/tenant/actions";

export type DesignId = "luminoso" | "nocturno" | "editorial";

export type PortalDesign = {
  id: DesignId;
  name: string;
  description: string;
  theme: Required<OnboardingTheme>;
  surface: string;
  text: string;
  muted: string;
  border: string;
  bannerFrom: string;
  bannerTo: string;
};

type Hsl = { h: number; s: number; l: number };

const CATEGORY_COLORS: Record<string, string> = {
  barberia: "#b45309",
  estetica: "#be185d",
  salud: "#0369a1",
  padel: "#15803d",
  veterinaria: "#7c3aed",
};

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function rgbToHex(r: number, g: number, b: number): string {
  return (
    "#" +
    [r, g, b]
      .map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, "0"))
      .join("")
  );
}

function rgbToHsl(r: number, g: number, b: number): Hsl {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l };
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
  else if (max === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;
  return { h: h * 60, s, l };
}

function hslToHex({ h, s, l }: Hsl): string {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let rgb: [number, number, number];
  if (h < 60) rgb = [c, x, 0];
  else if (h < 120) rgb = [x, c, 0];
  else if (h < 180) rgb = [0, c, x];
  else if (h < 240) rgb = [0, x, c];
  else if (h < 300) rgb = [x, 0, c];
  else rgb = [c, 0, x];
  return rgbToHex((rgb[0] + m) * 255, (rgb[1] + m) * 255, (rgb[2] + m) * 255);
}

function hexToHsl(hex: string): Hsl {
  return rgbToHsl(...hexToRgb(hex));
}

function mix(a: string, b: string, amountOfB: number): string {
  const [r1, g1, b1] = hexToRgb(a);
  const [r2, g2, b2] = hexToRgb(b);
  const t = amountOfB;
  return rgbToHex(r1 + (r2 - r1) * t, g1 + (g2 - g1) * t, b1 + (b2 - b1) * t);
}

function luminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex).map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a: string, b: string): number {
  const la = luminance(a);
  const lb = luminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

function withContrast(color: string, against: string, min: number): string {
  const hsl = hexToHsl(color);
  const goDarker = luminance(against) > 0.5;
  let out = color;
  for (let i = 0; i < 40 && contrast(out, against) < min; i++) {
    hsl.l = Math.max(0, Math.min(1, hsl.l + (goDarker ? -0.02 : 0.02)));
    out = hslToHex(hsl);
  }
  return out;
}

function hueDistance(a: number, b: number): number {
  const d = Math.abs(a - b) % 360;
  return d > 180 ? 360 - d : d;
}

/** Devuelve hasta dos colores protagonistas de una imagen, ignorando fondos blancos/negros y grises. */
export function extractBrandColors(dataUrl: string): Promise<string[]> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const size = 56;
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) return resolve([]);
      ctx.drawImage(img, 0, 0, size, size);
      const { data } = ctx.getImageData(0, 0, size, size);

      const buckets = new Map<string, { r: number; g: number; b: number; n: number; s: number; h: number }>();
      for (let i = 0; i < data.length; i += 4) {
        if (data[i + 3] < 140) continue;
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const { h, s, l } = rgbToHsl(r, g, b);
        if (l > 0.93 || l < 0.07 || s < 0.2) continue;
        const key = `${Math.round(h / 18)}-${Math.round(l * 4)}`;
        const bucket = buckets.get(key) ?? { r: 0, g: 0, b: 0, n: 0, s: 0, h };
        bucket.r += r;
        bucket.g += g;
        bucket.b += b;
        bucket.s += s;
        bucket.n += 1;
        buckets.set(key, bucket);
      }

      const ranked = [...buckets.values()]
        .filter((b) => b.n > 6)
        .map((b) => ({
          hex: rgbToHex(b.r / b.n, b.g / b.n, b.b / b.n),
          h: b.h,
          score: b.n * (0.6 + b.s / b.n),
        }))
        .sort((a, b) => b.score - a.score);

      if (ranked.length === 0) return resolve([]);
      const first = ranked[0];
      const second = ranked.find((c) => hueDistance(c.h, first.h) > 35);
      resolve(second ? [first.hex, second.hex] : [first.hex]);
    };
    img.onerror = () => resolve([]);
    img.src = dataUrl;
  });
}

export function buildDesigns(brandColors: string[], category: string): PortalDesign[] {
  const base = brandColors[0] ?? CATEGORY_COLORS[category] ?? "#FF4F2B";
  const baseHsl = hexToHsl(base);
  const accent =
    brandColors[1] ??
    hslToHex({ h: (baseHsl.h + 28) % 360, s: Math.min(0.7, baseHsl.s), l: 0.4 });

  const lightBg = mix(base, "#ffffff", 0.94);
  const lightPrimary = withContrast(base, "#ffffff", 3.2);

  const darkBg = hslToHex({ h: baseHsl.h, s: Math.min(baseHsl.s, 0.32), l: 0.07 });
  const darkSurface = hslToHex({ h: baseHsl.h, s: Math.min(baseHsl.s, 0.24), l: 0.12 });
  const darkPrimary = withContrast(
    hslToHex({ h: baseHsl.h, s: Math.max(baseHsl.s, 0.55), l: Math.max(baseHsl.l, 0.55) }),
    darkBg,
    4.5,
  );

  const paperBg = mix("#f8f5ef", accent, 0.035);
  const editorialPrimary = withContrast(accent, paperBg, 4.5);

  return [
    {
      id: "luminoso",
      name: "Luminoso",
      description: "Claro y fresco, con tu color al frente.",
      theme: {
        primaryColor: lightPrimary,
        backgroundColor: lightBg,
        fontFamily: "plus-jakarta-sans",
        themeMode: "light",
        layoutStyle: "panoramic",
        buttonRadius: "full",
      },
      surface: "#ffffff",
      text: "#0f172a",
      muted: "#64748b",
      border: mix(base, "#ffffff", 0.85),
      bannerFrom: lightPrimary,
      bannerTo: mix(lightPrimary, "#0f172a", 0.55),
    },
    {
      id: "nocturno",
      name: "Nocturno",
      description: "Oscuro y elegante, para que tu marca brille.",
      theme: {
        primaryColor: darkPrimary,
        backgroundColor: darkBg,
        fontFamily: "outfit",
        themeMode: "dark",
        layoutStyle: "split-gallery",
        buttonRadius: "lg",
      },
      surface: darkSurface,
      text: "#f8fafc",
      muted: mix("#f8fafc", darkBg, 0.45),
      border: mix(darkSurface, "#ffffff", 0.08),
      bannerFrom: darkPrimary,
      bannerTo: darkBg,
    },
    {
      id: "editorial",
      name: "Editorial",
      description: "Sereno y sofisticado, con letras con carácter.",
      theme: {
        primaryColor: editorialPrimary,
        backgroundColor: paperBg,
        fontFamily: "fraunces",
        themeMode: "light",
        layoutStyle: "floating-card",
        buttonRadius: "md",
      },
      surface: "#fffdf9",
      text: "#1c1917",
      muted: "#78716c",
      border: mix(paperBg, "#1c1917", 0.1),
      bannerFrom: editorialPrimary,
      bannerTo: mix(editorialPrimary, "#1c1917", 0.6),
    },
  ];
}

export function readableOn(color: string): string {
  return contrast(color, "#ffffff") >= 3 ? "#ffffff" : "#0f172a";
}
