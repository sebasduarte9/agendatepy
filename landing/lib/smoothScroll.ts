/**
 * Motor de navegación y desplazamiento fluido para la Landing Page de AgendatePY.
 *
 * Principios:
 * 1. Mide dinámicamente en tiempo real la altura real del header/navbar flotante o sticky (+ margen top).
 * 2. Localiza el punto de inicio visual real de la sección (bloque de badge, título <h2> y subtítulo).
 * 3. Aplica un margen de respiración visual cómodo (breathing gap) por debajo del navbar.
 * 4. Evita que el navbar tape encabezados, tarjetas o controles interactivos.
 * 5. Adaptable a Mobile, Tablet, Laptop y Desktop sin valores hardcodeados fijos.
 * 6. Protege los límites superior (0) e inferior (maxScroll) del documento.
 */

export function getHeaderOffset(): number {
  if (typeof window === "undefined") return 80;
  const header = document.querySelector("header") || document.querySelector("nav");
  if (!header) return 80;

  const rect = header.getBoundingClientRect();
  const computedStyle = window.getComputedStyle(header);
  const stickyTop = parseFloat(computedStyle.top) || 0;

  // Altura real del navbar renderizado + margen sticky superior
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

  // 2. Medición dinámica de la cabecera en el DOM
  const headerHeight = getHeaderOffset();

  // 3. Margen visual de respiración por debajo del navbar flotante
  // (mantiene el h2 inmediatamente visible bajo el header aprovechando todo el viewport)
  const breathingRoom = isMobile ? 12 : 16;

  // 4. Localizar el punto visual exacto (h2 de la sección para alineación precisa del viewport)
  const h2El = targetEl.querySelector("h2");
  const visualTarget = h2El || targetEl.querySelector("h1") || targetEl;

  const targetRect = visualTarget.getBoundingClientRect();
  const targetTopInDoc = targetRect.top + currentScrollY;

  // 5. Calcular la posición exacta de scroll
  // Se posiciona el título h2 justo debajo del navbar con un margen limpio de respiración
  const desiredScrollTop = targetTopInDoc - headerHeight - breathingRoom;

  // 6. Protección de límites del documento
  const maxScroll = Math.max(0, document.documentElement.scrollHeight - viewportHeight);
  const finalScrollTop = Math.min(Math.max(0, desiredScrollTop), maxScroll);

  // 7. Ejecutar scroll suave
  window.scrollTo({
    top: Math.round(finalScrollTop),
    behavior,
  });
}
