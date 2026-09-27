const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function createOgImage() {
  const width = 1200;
  const height = 630;

  const svgContent = `
  <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <!-- Background Gradients -->
      <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#090D16" />
        <stop offset="50%" stop-color="#0F172A" />
        <stop offset="100%" stop-color="#050811" />
      </linearGradient>

      <!-- Glow Orbs -->
      <radialGradient id="brandGlow" cx="75%" cy="35%" r="55%">
        <stop offset="0%" stop-color="#FF4F2B" stop-opacity="0.32" />
        <stop offset="50%" stop-color="#FF4F2B" stop-opacity="0.10" />
        <stop offset="100%" stop-color="#FF4F2B" stop-opacity="0" />
      </radialGradient>
      
      <radialGradient id="amberGlow" cx="20%" cy="80%" r="45%">
        <stop offset="0%" stop-color="#F59E0B" stop-opacity="0.18" />
        <stop offset="100%" stop-color="#F59E0B" stop-opacity="0" />
      </radialGradient>

      <!-- Card Gradient -->
      <linearGradient id="cardGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#1E293B" stop-opacity="0.85" />
        <stop offset="100%" stop-color="#0F172A" stop-opacity="0.95" />
      </linearGradient>

      <filter id="cardShadow" x="-10%" y="-10%" width="120%" height="130%">
        <feDropShadow dx="0" dy="16" stdDeviation="24" flood-color="#000000" flood-opacity="0.6"/>
      </filter>
    </defs>

    <!-- Base Canvas -->
    <rect width="${width}" height="${height}" fill="url(#bgGrad)" />
    <rect width="${width}" height="${height}" fill="url(#brandGlow)" />
    <rect width="${width}" height="${height}" fill="url(#amberGlow)" />

    <!-- Subtle Grid Overlay -->
    <g opacity="0.05" stroke="#FFFFFF" stroke-width="1">
      ${Array.from({ length: 20 }, (_, i) => `<line x1="${i * 60}" y1="0" x2="${i * 60}" y2="${height}" />`).join('')}
      ${Array.from({ length: 11 }, (_, i) => `<line x1="0" y1="${i * 60}" x2="${width}" y2="${i * 60}" />`).join('')}
    </g>

    <!-- Top Navigation / Brand Header -->
    <g transform="translate(80, 60)">
      <!-- Orange Rounded Icon -->
      <g transform="scale(0.065)">
        <path d="M165 585 C136 585 111 569 99 545 C88 524 89 501 98 479 L250 120 C264 87 295 66 331 66 L399 66 C435 66 466 87 480 120 L632 479 C641 501 642 524 631 545 C619 569 594 585 565 585 C532 585 505 565 493 536 L449 427 L281 427 L237 536 C225 565 198 585 165 585 Z" fill="#FF4F2B"/>
        <path d="M365 191 L327 273 L403 273 Z" fill="#FFFFFF"/>
        <rect x="203" y="270" width="316" height="112" rx="56" fill="none" stroke="#FFFFFF" stroke-width="17"/>
        <circle cx="443" cy="326" r="45" fill="#FFFFFF"/>
      </g>
      
      <!-- Wordmark -->
      <text x="56" y="32" font-family="system-ui, -apple-system, sans-serif" font-size="34" font-weight="900" fill="#FFFFFF" letter-spacing="-1">
        agendate<tspan fill="#FF4F2B">py</tspan>
      </text>

      <!-- Pill Badge: Paraguay -->
      <rect x="250" y="4" width="165" height="34" rx="17" fill="#FF4F2B" fill-opacity="0.15" stroke="#FF4F2B" stroke-opacity="0.4" stroke-width="1.5"/>
      <text x="264" y="26" font-family="system-ui, -apple-system, sans-serif" font-size="13" font-weight="800" fill="#FF775A" letter-spacing="0.5">
        PARAGUAY 🇵🇾
      </text>
    </g>

    <!-- Main Content Left Side -->
    <g transform="translate(80, 165)">
      <!-- Value Proposition Pill -->
      <rect x="0" y="0" width="340" height="34" rx="17" fill="#FFFFFF" fill-opacity="0.07" stroke="#FFFFFF" stroke-opacity="0.12" stroke-width="1"/>
      <text x="18" y="22" font-family="system-ui, -apple-system, sans-serif" font-size="13" font-weight="700" fill="#E2E8F0">
        ✨ Sistema de Turnos Online y WhatsApp
      </text>

      <!-- Main Headline -->
      <text x="0" y="90" font-family="system-ui, -apple-system, sans-serif" font-size="52" font-weight="900" fill="#FFFFFF" letter-spacing="-1.5">
        Tu agenda llena.
      </text>
      <text x="0" y="152" font-family="system-ui, -apple-system, sans-serif" font-size="52" font-weight="900" fill="#FF4F2B" letter-spacing="-1.5">
        Cero turnos vacíos.
      </text>

      <!-- Subtitle Description -->
      <text x="0" y="210" font-family="system-ui, -apple-system, sans-serif" font-size="18" font-weight="400" fill="#94A3B8">
        El asistente digital preferido por barberías, estéticas y clínicas
      </text>
      <text x="0" y="238" font-family="system-ui, -apple-system, sans-serif" font-size="18" font-weight="400" fill="#94A3B8">
        con recordatorios automáticos por WhatsApp y cobro en Guaraníes.
      </text>

      <!-- Feature Highlight Badges -->
      <g transform="translate(0, 280)">
        <!-- Badge 1 -->
        <rect x="0" y="0" width="220" height="38" rx="12" fill="#1E293B" stroke="#334155" stroke-width="1"/>
        <circle cx="20" cy="19" r="6" fill="#10B981"/>
        <text x="36" y="24" font-family="system-ui, -apple-system, sans-serif" font-size="13" font-weight="700" fill="#F1F5F9">
          WhatsApp en 1 toque
        </text>

        <!-- Badge 2 -->
        <rect x="235" y="0" width="230" height="38" rx="12" fill="#1E293B" stroke="#334155" stroke-width="1"/>
        <circle cx="255" cy="19" r="6" fill="#FF4F2B"/>
        <text x="271" y="24" font-family="system-ui, -apple-system, sans-serif" font-size="13" font-weight="700" fill="#F1F5F9">
          Cobros en Gs. (SIPAP)
        </text>

        <!-- Badge 3 -->
        <rect x="480" y="0" width="200" height="38" rx="12" fill="#1E293B" stroke="#334155" stroke-width="1"/>
        <circle cx="500" cy="19" r="6" fill="#F59E0B"/>
        <text x="516" y="24" font-family="system-ui, -apple-system, sans-serif" font-size="13" font-weight="700" fill="#F1F5F9">
          -90% Inasistencias
        </text>
      </g>

      <!-- Bottom Trust Ribbon -->
      <g transform="translate(0, 360)">
        <text x="0" y="20" font-family="system-ui, -apple-system, sans-serif" font-size="15" font-weight="700" fill="#38BDF8">
          🚀 14 Días de Prueba Gratis
        </text>
        <text x="200" y="20" font-family="system-ui, -apple-system, sans-serif" font-size="14" font-weight="400" fill="#64748B">
          · Sin tarjeta de crédito · Activación en 3 minutos · agendatepy.com
        </text>
      </g>
    </g>

    <!-- Right Side Mockup Card Preview -->
    <g transform="translate(790, 110)" filter="url(#cardShadow)">
      <!-- Card Frame -->
      <rect width="330" height="440" rx="28" fill="url(#cardGrad)" stroke="#334155" stroke-width="1.5"/>

      <!-- WhatsApp Header Bar Inside Card -->
      <path d="M 0 28 Q 0 0 28 0 L 302 0 Q 330 0 330 28 L 330 65 L 0 65 Z" fill="#075E54"/>
      <circle cx="36" cy="32" r="16" fill="#128C7E"/>
      <text x="36" y="37" font-family="sans-serif" font-size="14" font-weight="bold" fill="#FFFFFF" text-anchor="middle">A</text>
      <text x="62" y="28" font-family="system-ui, sans-serif" font-size="14" font-weight="bold" fill="#FFFFFF">AgendatePY Bot</text>
      <text x="62" y="44" font-family="system-ui, sans-serif" font-size="11" fill="#A7F3D0">en línea · Asistente 24/7</text>

      <!-- Chat Bubble: Turno Confirmado -->
      <g transform="translate(18, 85)">
        <rect width="294" height="190" rx="16" fill="#1E293B" stroke="#FF4F2B" stroke-opacity="0.4" stroke-width="1.5"/>
        
        <rect x="14" y="14" width="130" height="24" rx="8" fill="#10B981" fill-opacity="0.15"/>
        <text x="24" y="30" font-family="system-ui, sans-serif" font-size="11" font-weight="bold" fill="#34D399">✅ Turno Confirmado</text>
        
        <text x="14" y="66" font-family="system-ui, sans-serif" font-size="15" font-weight="bold" fill="#FFFFFF">Corte &amp; Perfilado</text>
        
        <text x="14" y="92" font-family="system-ui, sans-serif" font-size="12" fill="#94A3B8">📅 Viernes 26 Sept · 16:30 hs</text>
        <text x="14" y="112" font-family="system-ui, sans-serif" font-size="12" fill="#94A3B8">💈 Marcos Benítez · Silla 1</text>
        
        <!-- Price Pill -->
        <rect x="14" y="130" width="145" height="32" rx="10" fill="#FF4F2B" fill-opacity="0.15"/>
        <text x="24" y="151" font-family="system-ui, sans-serif" font-size="13" font-weight="900" fill="#FF6B4A">Gs. 75.000</text>
        
        <!-- Check time -->
        <text x="245" y="174" font-family="system-ui, sans-serif" font-size="10" fill="#64748B">14:22 ✓✓</text>
      </g>

      <!-- Chat Bubble 2: Reminder -->
      <g transform="translate(18, 290)">
        <rect width="294" height="115" rx="16" fill="#0F172A" stroke="#334155" stroke-width="1"/>
        <rect x="14" y="12" width="150" height="22" rx="6" fill="#F59E0B" fill-opacity="0.15"/>
        <text x="22" y="27" font-family="system-ui, sans-serif" font-size="10" font-weight="bold" fill="#FBBF24">🔔 Recordatorio 2h Antes</text>
        
        <text x="14" y="55" font-family="system-ui, sans-serif" font-size="12" fill="#E2E8F0">¡Hola Juan! Te esperamos a</text>
        <text x="14" y="73" font-family="system-ui, sans-serif" font-size="12" fill="#E2E8F0">las 16:30 hs. ¿Confirmás asistencia?</text>
        
        <rect x="14" y="85" width="105" height="20" rx="6" fill="#10B981" fill-opacity="0.2"/>
        <text x="22" y="99" font-family="system-ui, sans-serif" font-size="10" font-weight="bold" fill="#34D399">👍 SÍ, CONFIRMO</text>
      </g>
    </g>
  </svg>
  `;

  const outputPath = path.resolve(__dirname, '../public/og-image.png');
  await sharp(Buffer.from(svgContent))
    .png({ quality: 95, compressionLevel: 8 })
    .toFile(outputPath);

  console.log('OG Image successfully generated at:', outputPath);
}

createOgImage().catch(console.error);
