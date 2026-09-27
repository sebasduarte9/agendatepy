/**
 * Motor de navegación y desplazamiento inteligente para las secciones de la Landing Page.
 *
 * Basado en la lógica de referencia comprobada de CALCULADORA:
 * Cada sección se evalúa por su bloque visual integrado (desde el encabezado
 * de la sección hasta el final de su contenido principal o grid interactivo).
 *
 * Reglas de posicionamiento:
 * 1. Mide dinámicamente las dimensiones reales del navbar flotante/sticky (responsive en desktop, laptop, tablet y mobile).
 * 2. Si el bloque visual de la sección cabe completo en el área útil de la pantalla:
 *    Centra verticalmente dicho bloque dentro de la zona visible para un encuadre protagonista.
 * 3. Si el bloque es más grande que el viewport (como Características, o en pantallas de laptop/móviles):
 *    Posiciona el encabezado con un margen de respiración cómodo debajo del navbar flotante,
 *    garantizando que el título, subtítulo y la primera fila de tarjetas sean inmediatamente visibles.
 * 4. Inicio: desplazamiento limpio al comienzo absoluto (0).
 * 5. FAQ: alineación de preguntas respetando estrictamente el límite inferior (maxScroll).
 * 6. Sin números mágicos fijos: todas las cotas se derivan de getBoundingClientRect() y el viewport actual.
 */

export function getHeaderOffset(): number {
  if (typeof window === "undefined") return 76;
  const header = document.querySelector("header");
  if (!header) return 76;

  const rect = header.getBoundingClientRect();
  const computedStyle = window.getComputedStyle(header);
  const stickyTop = parseFloat(computedStyle.top) || 12;

  // Altura real del header + margen sticky superior
  return rect.height + stickyTop;
}

export function scrollToSection(sectionId: string, behavior: ScrollBehavior = "smooth"): void {
  if (typeof window === "undefined") return;

  const cleanId = sectionId.replace(/^#/, "").trim();

  // 1. INICIO: Desplazamiento limpio al tope del documento
  if (!cleanId || cleanId === "inicio") {
    window.scrollTo({ top: 0, behavior });
    return;
  }

  const targetEl = document.getElementById(cleanId);
  if (!targetEl) return;

  const currentScrollY = window.scrollY;
  const viewportHeight = window.innerHeight;
  const isMobile = window.innerWidth < 640;

  // Medición dinámica del navbar y zona de seguridad visual
  const headerClearance = getHeaderOffset();
  const breathingGap = isMobile ? 12 : 18;
  const safeHeaderOffset = headerClearance + breathingGap;
  const availableHeight = viewportHeight - safeHeaderOffset;

  // Localizar el encabezado representativo (bloque de título y subtítulo)
  const h2El = targetEl.querySelector("h2");
  const headingWrapper =
    h2El?.closest(".max-w-2xl, .max-w-3xl, .text-center") ||
    h2El ||
    targetEl.querySelector("h1") ||
    targetEl;

  const headingRect = headingWrapper.getBoundingClientRect();
  const headingTop = headingRect.top + currentScrollY;

  // Localizar el bloque de contenido principal (grid interactivo, tarjetas o acordeón)
  const contentBlock =
    targetEl.querySelector(".grid") ||
    targetEl.querySelector(".space-y-3") ||
    targetEl;

  const contentRect = contentBlock.getBoundingClientRect();
  const contentTop = contentRect.top + currentScrollY;
  const contentBottom = contentTop + contentBlock.clientHeight;

  // Altura del bloque visual integrado
  const totalBlockHeight = Math.max(contentBlock.clientHeight, contentBottom - headingTop);

  let targetScrollY = 0;

  switch (cleanId) {
    case "calculadora": {
      // 5. CALCULADORA (Lógica de referencia idéntica a la ya validada)
      if (totalBlockHeight <= availableHeight) {
        const verticalPadding = (availableHeight - totalBlockHeight) / 2;
        targetScrollY = headingTop - safeHeaderOffset - Math.max(10, verticalPadding);
      } else {
        targetScrollY = headingTop - safeHeaderOffset;
      }
      break;
    }

    case "como-funciona": {
      // 2. CÓMO FUNCIONA (Simulador de reserva + Pasos secuenciales de flujo)
      // Si entra completo en pantalla, se centra en armonía. Si la pantalla es compacta,
      // el título queda visible bajo el navbar y el simulador interactivo aparece de inmediato.
      if (totalBlockHeight <= availableHeight) {
        const verticalPadding = (availableHeight - totalBlockHeight) / 2;
        targetScrollY = headingTop - safeHeaderOffset - Math.max(10, verticalPadding);
      } else {
        targetScrollY = headingTop - safeHeaderOffset;
      }
      break;
    }

    case "whatsapp": {
      // 3. WHATSAPP (Beneficios con checks + Mockup de teléfono de WhatsApp)
      const gridTop = contentRect.top + currentScrollY;
      const gridHeight = contentBlock.clientHeight;
      if (gridHeight <= availableHeight) {
        const verticalPadding = (availableHeight - gridHeight) / 2;
        targetScrollY = gridTop - safeHeaderOffset - Math.max(10, verticalPadding);
      } else {
        targetScrollY = gridTop - safeHeaderOffset;
      }
      break;
    }

    case "caracteristicas": {
      // 4. CARACTERÍSTICAS (Sección grande multi-tarjeta)
      // No centrar la sección entera: ubicar título y subtítulo cómodamente bajo el navbar
      // dejando visible la primera fila de tarjetas (WhatsApp Bot y Comisiones) de inmediato.
      targetScrollY = headingTop - safeHeaderOffset;
      break;
    }

    case "precios": {
      // 6. PRECIOS (Título + selector Mensual/Anual + 3 tarjetas de planes)
      // En pantallas completas, título y planes quedan centrados conjuntamente.
      // En laptops/móviles, el título se alinea bajo el navbar para ver las opciones de precio.
      if (totalBlockHeight <= availableHeight) {
        const verticalPadding = (availableHeight - totalBlockHeight) / 2;
        targetScrollY = headingTop - safeHeaderOffset - Math.max(10, verticalPadding);
      } else {
        targetScrollY = headingTop - safeHeaderOffset;
      }
      break;
    }

    case "faq": {
      // 7. FAQ (Preguntas frecuentes)
      // Título y primeras preguntas desplegadas sin solapamiento con el navbar,
      // respetando el límite inferior del documento.
      targetScrollY = headingTop - safeHeaderOffset;
      break;
    }

    default: {
      if (totalBlockHeight <= availableHeight) {
        const verticalPadding = (availableHeight - totalBlockHeight) / 2;
        targetScrollY = headingTop - safeHeaderOffset - Math.max(10, verticalPadding);
      } else {
        targetScrollY = headingTop - safeHeaderOffset;
      }
      break;
    }
  }

  // Protección de límites del documento (límite inferior estricto para FAQ y final de página)
  const maxScroll = Math.max(0, document.documentElement.scrollHeight - viewportHeight);
  const clampedScroll = Math.min(Math.max(0, targetScrollY), maxScroll);

  window.scrollTo({
    top: Math.round(clampedScroll),
    behavior,
  });
}
