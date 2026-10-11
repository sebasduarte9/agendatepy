# Agendatepy — Catálogo Maestro de Elementos, Componentes y Sistema de Diseño (Design System)

> **Documento de Especificación Visual, Tokens y Elementos de UI para Generación de Diseños con IA**  
> *Plataforma SaaS Multi-Tenant para Barberías, Salones de Belleza, Spas, Clínicas de Estética y Bienestar con Automatización de WhatsApp IA.*

---

## 1. Visión General del Producto y Lenguaje de Diseño

### 1.1 Identidad y Estética
* **Estilo Visual:** **Glassmorphism 2.0 (Dual-Mode: Dark Obsidian Glass & Light Frosty Glass)**.
* **Inspiración y Referencias:** *Linear*, *Apple VisionOS / iOS 18*, *Stripe Corporate*, *interfas glassy*.
* **Características Clave:**
  * Superficies translúcidas con desenfoque de fondo profundo (`backdrop-filter: blur(28px)`).
  * Bordes sutiles con reflexión especular (`1px solid rgba(255, 255, 255, 0.12)` con sombra interior `inset 1px 1px 1px rgba(255, 255, 255, 0.16)`).
  * Fondo atmosférico animado en código con gradientes radiales continuos y orbes flotantes (cero fotos estáticas).
  * Menú lateral flotante estático con expansión fluida en hover (de `66px` cápsula de iconos a `242px` con etiquetas) respetando estrictamente su altura cerrada.
  * Micro-interacciones hápticas, tarjetas con perspectiva 3D Tilt y orbes morphing giratorios de IA.

---

## 2. Tokens de Diseño y Variables CSS

### 2.1 Paleta de Color y Tokens Semánticos
| Token | Variable CSS | Modo Oscuro (Dark Obsidian) | Modo Claro (Frosty White) | Propósito / Uso |
| :--- | :--- | :--- | :--- | :--- |
| **Primary** | `var(--primary)` | `#FF4F2B` (Naranja Neón) | `#FF4F2B` | Botones principales, acentos activos, focos |
| **Primary RGB**| `var(--primary-rgb)`| `255, 79, 43` | `255, 79, 43` | Resplandores y glows con canal alfa |
| **Background** | `var(--background)` | `#131114` a `#0d0c0f` | `#f8fafc` a `#edf2f7` | Lienzo base del viewport |
| **Glass Surface**| `.glass-panel` | `linear-gradient(135deg, rgba(28,27,31,0.68), rgba(14,13,17,0.72))` | `linear-gradient(135deg, rgba(255,255,255,0.85), rgba(255,255,255,0.62))` | Tarjetas, paneles de métricas, modales |
| **Glass Rail** | `.glass-rail-fixed` | `rgba(27, 26, 24, 0.65)` | `rgba(255, 255, 255, 0.84)` | Menú lateral flotante |
| **Border Line**| `var(--line)` | `rgba(255, 255, 255, 0.11)` | `rgba(0, 0, 0, 0.08)` | Bordes de paneles, divisores, inputs |
| **Text Primary**| `var(--text)` | `#f6f3ef` / `#ffffff` | `#0f172a` | Títulos, valores clave, textos principales |
| **Text Muted** | `var(--muted)` | `#aaa39e` / `#a1a1aa` | `#64748b` | Subtítulos, timestamps, leyendas secundarias |
| **Emerald** | `var(--green)` | `#10b981` (`rgba(16, 185, 129, 0.18)`) | `#059669` | Estado Confirmado, ingresos, caja abierta |
| **Purple** | `var(--purple)` | `#a855f7` (`rgba(168, 85, 247, 0.18)`) | `#7c3aed` | Asistente de IA WhatsApp, fidelización, VIP |
| **Amber** | `var(--amber)` | `#f59e0b` (`rgba(245, 158, 11, 0.18)`) | `#d97706` | Pendiente de pago, citas por confirmar |
| **Red** | `var(--red)` | `#ef4444` (`rgba(239, 68, 68, 0.18)`) | `#dc2626` | Cita cancelada, egresos de caja, no-show |

### 2.2 Tipografía y Jerarquía Visual
* **Headings (Títulos H1 - H3):** `Manrope`, `Plus Jakarta Sans` o `Coolvetica` (700-800 weight, `letter-spacing: -0.03em`).
* **Cuerpo & Párrafos:** `DM Sans` / `Plus Jakarta Sans` (400-500 weight, 12px a 14px).
* **Eyebrows & Micro-etiquetas:** `font-mono` uppercase (8px a 9px, `letter-spacing: 0.22em`, color `#c0b4a8` o `#94a3b8`).
* **Valores Financieros / Guaraníes (PYG):** `font-semibold` o `font-medium` (ej: `Gs. 120.000` con `letter-spacing: -0.02em`).

### 2.3 Radios de Borde (Border Radius Scale)
* **App Shell & Menú Rail:** `30px` (cápsula redondeada extrema).
* **Paneles & Tarjetas Métricas:** `20px` a `22px`.
* **Botones & Pastillas de Navegación:** `14px` a `15px`.
* **Badges & Pastillas de Estado:** `20px` (pill completo).
* **Inputs & Selects:** `12px`.
* **Insignia / Brand Mark de Logo:** `12px` (cuadrado redondeado).

---

## 3. Master Prompts para Generar Nuevos Diseños con IA

### Prompt Base para Diseñar una Pantalla del Sistema:
```text
Act as a Principal Product Designer specializing in ultra-premium Glassmorphic web apps (VisionOS / Linear / Apple Design Award aesthetics).
Design a high-fidelity desktop and mobile UI screen for "Agendatepy", a modern multi-tenant SaaS for beauty salons, barbershops, and spas.

Visual Identity Guidelines:
- Aesthetic: Dual-Mode Glassmorphism 2.0 (Obsidian Dark Glass background #131114 with vibrant orange neon accent #FF4F2B and soft purple/emerald micro-accents).
- Glass Panels: Translucent panels with background blur 28px, subtle 1px border with specular top glare (inset white highlight), soft shadows (0 20px 50px rgba(0,0,0,0.5)).
- Atmospheric Background: Flowing organic code-driven color mesh with drifting ambient orbs (no stock photos).
- Sidebar: Fixed floating capsule rail (66px collapsed with 42px icon buttons, expands to 242px on hover while preserving exact closed height).
- Typography: Manrope / Plus Jakarta Sans for headings, DM Sans for body, monospace micro-labels with uppercase letter-spacing 0.22em.
- Currency: Formatted in Paraguayan Guaraníes (e.g. Gs. 120.000).

Screen to design: [INSERTAR PANTALLA AQUÍ, EJ: "Dashboard Principal con KPIs, Timeline de Citas y Widget de WhatsApp IA"].
Include every interactive state, button variant, badge pill, and data visualization following this specification.
```

---

*Documento generado para Agendatepy. Todos los derechos reservados.*
