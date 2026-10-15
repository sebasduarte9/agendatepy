"use client";

import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { bestTextOn, contrastRatio } from "@/lib/color-contrast";

/**
 * Warns when the brand color is hard to read: white button text on it, or the
 * color itself used as text/accents on the page background.
 * Thresholds: 4.5 for normal text, 3 for large text and UI (WCAG AA).
 */
export default function ContrastCheck({
  primaryColor,
  backgroundColor,
  buttonBg,
  buttonText,
  onFixButtonText,
}: {
  primaryColor: string;
  backgroundColor: string;
  buttonBg?: string;
  buttonText?: string;
  onFixButtonText?: (hex: string) => void;
}) {
  const effectiveButtonBg = buttonBg || primaryColor;
  const effectiveButtonText = buttonText || "#ffffff";
  const buttonRatio = contrastRatio(effectiveButtonBg, effectiveButtonText);
  const accentRatio = contrastRatio(primaryColor, backgroundColor);
  const issues: { title: string; detail: string; fix?: () => void; fixLabel?: string }[] = [];

  if (buttonRatio < 3) {
    const better = bestTextOn(effectiveButtonBg);
    issues.push({
      title: "El texto de los botones casi no se lee",
      detail: `Contraste ${buttonRatio.toFixed(1)}:1 (mínimo recomendado 3:1). Cambiá el color o el texto de los botones.`,
      fix: better !== effectiveButtonText && onFixButtonText ? () => onFixButtonText(better) : undefined,
      fixLabel: better === "#ffffff" ? "Usar texto blanco" : "Usar texto oscuro",
    });
  }
  if (accentRatio < 3) {
    issues.push({
      title: "El color de marca se pierde sobre el fondo",
      detail: `Contraste ${accentRatio.toFixed(1)}:1 en precios y enlaces. Elegí un fondo o un color de marca más distintos.`,
    });
  }

  if (issues.length === 0) {
    return (
      <p className="flex items-center gap-2 rounded-xl border border-emerald-500/15 bg-emerald-500/[0.05] px-3 py-2 text-[11px] text-emerald-700 dark:text-emerald-300">
        <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
        Buen contraste: botones y acentos se leen bien ({buttonRatio.toFixed(1)}:1 · {accentRatio.toFixed(1)}:1).
      </p>
    );
  }

  return (
    <div className="space-y-2" role="status">
      {issues.map((issue) => (
        <div
          key={issue.title}
          className="flex items-start justify-between gap-3 rounded-xl border border-amber-500/25 bg-amber-500/[0.07] px-3 py-2.5"
        >
          <span className="flex min-w-0 items-start gap-2">
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" />
            <span className="min-w-0">
              <span className="block text-xs font-semibold text-amber-800 dark:text-amber-200">{issue.title}</span>
              <span className="mt-0.5 block text-[11px] text-slate-600 dark:text-zinc-400">{issue.detail}</span>
            </span>
          </span>
          {issue.fix && (
            <button
              type="button"
              onClick={issue.fix}
              className="inline-flex min-h-8 shrink-0 items-center rounded-lg border border-amber-500/30 px-2.5 text-[11px] font-semibold text-amber-800 transition hover:bg-amber-500/10 dark:text-amber-200"
            >
              {issue.fixLabel}
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
