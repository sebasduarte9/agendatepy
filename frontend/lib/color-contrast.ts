/** WCAG 2.1 relative luminance of a #rrggbb color. */
function luminance(hex: string): number {
  const clean = hex.replace("#", "");
  if (!/^[0-9a-fA-F]{6}$/.test(clean)) return 0;
  const channels = [0, 2, 4].map((i) => {
    const c = parseInt(clean.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

/** Contrast ratio between two colors, from 1 (none) to 21 (black on white). */
export function contrastRatio(a: string, b: string): number {
  const la = luminance(a);
  const lb = luminance(b);
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

/** Whichever of white or near-black reads better on top of `bg`. */
export function bestTextOn(bg: string): "#ffffff" | "#0f172a" {
  return contrastRatio(bg, "#ffffff") >= contrastRatio(bg, "#0f172a") ? "#ffffff" : "#0f172a";
}
