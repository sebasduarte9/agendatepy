---
name: saas-conversion-design
description: Design principles and implementation guidelines for high-converting, pristine light-mode SaaS web applications inspired by Skoon.io, Linear, Stripe, and Vercel. Covers clean typography hierarchy, soft glassmorphism, notched cards, interactive surfaces, and micro-interactions.
---

# SaaS Conversion Design & Pristine Light-Mode Mastery

This skill provides expert design standards for creating world-class, premium light-mode SaaS web applications.

## 1. Light-Mode Visual Architecture

### A. Background & Depth Strategy
- **Base Canvas:** Never use pure blinding `#ffffff` everywhere without contrast. Use a layered canvas:
  - Base: `#ffffff` or `#fbfcfd` with subtle ambient radial gradients (`rgba(99, 102, 241, 0.04)` to `rgba(20, 184, 166, 0.03)`).
  - Cards & Surfaces: Pure `#ffffff` with a delicate border (`#e2e8f0` or `rgba(226, 232, 240, 0.8)`).
  - Elevated Popovers/Modals: `#ffffff` with crisp border and multi-layer diffuse shadow (`0 20px 45px -15px rgba(15, 23, 42, 0.08)`).

### B. Color Tokens (Skoon.io Harmonious Palette)
- **Primary Brand / Action:** Indigo/Violet (`#4f46e5` / `#6366f1`, faded: `rgba(99, 102, 241, 0.08)`).
- **Secondary / Growth:** Teal/Cyan (`#0d9488` / `#14b8a6`, faded: `rgba(20, 184, 166, 0.08)`).
- **Accent / Alert / Focus:** Magenta/Pink (`#db2777` / `#ec4899`, faded: `rgba(236, 72, 153, 0.08)`).
- **Success / Positive Trend:** Emerald/Mint (`#059669` / `#10b981`, faded: `rgba(16, 185, 129, 0.1)`).
- **Warning / Highlight:** Amber (`#d97706` / `#f59e0b`, faded: `rgba(245, 158, 11, 0.08)`).

## 2. Typography Hierarchy

- **Headlines:** Montserrat or Plus Jakarta Sans with bold weight (`700` or `800`) and tight tracking (`tracking-[-0.04em]`).
- **Signature Skoon Lowercase Style:** Modern minimalist lowercase headings (`el sistema universal de turnos y gestión.`, `actividad en vivo y turnos del día.`).
- **Body:** Plus Jakarta Sans (`400` or `500`), color `#475569` (slate-600) with generous line height (`leading-relaxed`).
- **Micro-Copy & Badges:** `text-[10px]` or `text-xs` with uppercase tracking (`tracking-[0.2em]`) for category labels and status indicators.

## 3. Signature UI Components (Skoon.io Patterns)

### A. The Floating Capsule Navigation
```html
<header className="fixed top-3 inset-x-0 z-50 pointer-events-none">
  <nav className="pointer-events-auto mx-auto max-w-fit flex items-center gap-2 rounded-full border border-slate-200/90 bg-white/85 p-1 shadow-sm backdrop-blur-xl">
    <!-- Horizontal pill rail -->
  </nav>
</header>
```

### B. Notched-Corner Pricing Cards
The signature Skoon diagonal notch:
- Top-Left: `rounded-tl-3xl rounded-br-2xl border-r border-b` with pastel tint.
- Bottom-Right: `rounded-br-3xl rounded-tl-2xl border-l border-t` with price.
- Center: Clean checklist with colored checkmarks.

### C. Live Activity & Leaderboard Surface
- Top bar with section badge + pulsating neon-green live indicator `● EN VIVO`.
- Clean data rows with rank (`01`, `02`), user metadata, bold colored score, and right-aligned metrics.

### D. Interactive Progress Analytics
- Toggle pills (`[Facturación]` vs `[Ocupación]` vs `[Retención]`).
- Responsive bar chart with hover tooltips and colored category filter buttons below.

## 4. Quality Checklist
- [ ] No hardcoded dark overrides unless dark mode is specifically toggled.
- [ ] Text contrast meets WCAG AAA standards on all light backgrounds.
- [ ] Borders are soft and delicate (`border-slate-200/80` or `border-slate-100`).
- [ ] All interactive elements have hover and active micro-interactions.
