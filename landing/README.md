# AgendatePY — Copia Independiente de la Landing Page

Esta carpeta contiene una **copia autónoma y 100% funcional** exclusivamente de la **Landing Page** de AgendatePY, completamente desacoplada de la base de datos (PostgreSQL, Prisma), Docker y los módulos de administración/dashboard.

---

## 🚀 Cómo Ejecutar

### Opción 1: Doble clic en Mac (La más rápida)
Haz doble clic sobre el archivo:
```bash
ABRIR_LANDING.command
```
Esto abrirá la terminal, iniciará el servidor local y abrirá la landing automáticamente en tu navegador en `http://localhost:3005`.

---

### Opción 2: Desde la terminal
1. Abre tu terminal en esta carpeta:
```bash
cd landing
```

2. Si aún no instalaste dependencias:
```bash
npm install
```

3. Inicia el servidor de desarrollo:
```bash
npm run dev
```

4. Abre en tu navegador:
```
http://localhost:3005
```
*(Se usa el puerto 3005 por defecto para no interferir con el puerto 3000 de la aplicación principal).*

---

## 📦 Contenido y Estructura de esta Carpeta

```
landing/
├── ABRIR_LANDING.command          # Acceso directo para iniciar en macOS
├── package.json                   # Dependencias limpias (solo UI, sin backend)
├── tsconfig.json                  # Configuración TypeScript
├── next.config.ts                 # Configuración Next.js optimizada
├── postcss.config.mjs             # Tailwind CSS v4
├── .env                           # Variables comerciales de WhatsApp
├── .gitignore                     # Ignora node_modules y .next
├── app/
│   ├── globals.css                # Sistema de diseño Obsidian Glass & tokens
│   ├── layout.tsx                 # Metadatos SEO, OpenGraph, JSON-LD, tipografías
│   ├── page.tsx                   # Página principal que renderiza LandingPage
│   ├── not-found.tsx              # Página 404
│   ├── terminos/                  # Página de Términos y Condiciones
│   ├── privacidad/                # Página de Políticas de Privacidad
│   ├── login/                     # Vista previa demo para el botón de login
│   └── onboarding/                # Vista previa demo para el botón de registro
├── components/
│   ├── landing/                   # Los 19 componentes interactivos de la landing:
│   │   ├── AuroraBackground.tsx
│   │   ├── AutomatedHubDiagram.tsx
│   │   ├── FAQ.tsx
│   │   ├── Features.tsx
│   │   ├── Footer.tsx
│   │   ├── Header.tsx
│   │   ├── Hero.tsx
│   │   ├── HorizontalCardOrbit.tsx
│   │   ├── HorizontalScroll.tsx
│   │   ├── LandingPage.tsx
│   │   ├── LiveBookingSimulator.tsx
│   │   ├── MiniCalendar.tsx
│   │   ├── NotificationStack.tsx
│   │   ├── Pricing.tsx
│   │   ├── StackingCardsSection.tsx
│   │   ├── StickyMobileCta.tsx
│   │   ├── ThreeGradientBackground.tsx
│   │   ├── WhatsAppFloatingButton.tsx
│   │   └── WhatsAppToAgendaLive.tsx
│   └── ui/                        # Componentes UI de base:
│       ├── BrandLogo.tsx          # Logotipo e isotipo oficial en Coolvetica
│       ├── LiquidGlass.tsx        # Cristal líquido con refracción óptica
│       ├── liquid-glass.tsx       # Tarjetas de cristal y desenfoque
│       └── Marquee.tsx            # Cinta interactiva continua
├── context/
│   └── CategoryContext.tsx        # Estado de rubros interactivo (Odontología, Barbería, etc.)
├── lib/
│   ├── categories.ts              # Textos, precios y servicios por rubro
│   ├── smoothScroll.ts            # Desplazamiento suave con compensación de cabecera
│   ├── utils.ts                   # Utilidad cn()
│   └── config/
│       └── whatsapp.ts            # Enlaces dinámicos a WhatsApp
└── public/
    ├── fonts/coolvetica/          # Tipografía oficial Coolvetica
    ├── logo.svg                   # Isotipo oficial SVG
    ├── favicon.ico                # Ícono de pestaña
    └── og-image.png               # Imagen para compartir en redes
```

---

## 🎨 Características Incluidas

1. **Fondo 3D con Three.js & Aurora**: Renderizado WebGL reactivo con animaciones suaves.
2. **Selector de Rubros en Vivo**: Cambia dinámicamente textos, servicios, precios y mensajes en el Hero y simuladores.
3. **Simulador de WhatsApp a Agenda**: Demostración paso a paso de agendamiento conversacional en tiempo real.
4. **Simulador de Reserva en Vivo**: Flujo interactivo con selección de fecha, hora y método de pago (Efectivo, Transferencia, Billeteras).
5. **Diagrama de Hub Automatizado**: Visualización vectorial de canales (Instagram, WhatsApp, Web, etc.).
6. **Módulos Glassy & Estética Obsidian**: Reflejos, gradientes, bordes translúcidos y micro-interacciones.
7. **Desplazamiento Suave (Lenis)**: Scroll inercial con soporte en desktop y móvil.
