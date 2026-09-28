"use client";

import { useEffect, useRef } from "react";

interface TrackerProps {
  tenantSlug: string;
  pagePath?: string;
}

interface QueuedEvent {
  eventType: "CLICK" | "MOUSE_MOVE" | "SCROLL";
  x: number;
  y: number;
  scrollDepth: number;
  elementTag?: string | null;
  elementSelector?: string | null;
  elementText?: string | null;
}

function getOrCreateSessionId(): string {
  if (typeof window === "undefined") return "anon";
  try {
    let sid = window.sessionStorage.getItem("agendate_wa_sid");
    if (!sid) {
      sid = "wa_" + Math.random().toString(36).slice(2, 11) + "_" + Date.now().toString(36);
      window.sessionStorage.setItem("agendate_wa_sid", sid);
    }
    return sid;
  } catch {
    return "wa_fallback_" + Date.now();
  }
}

export default function WebAnalyticsTracker({ tenantSlug, pagePath }: TrackerProps) {
  const queueRef = useRef<QueuedEvent[]>([]);
  const lastMouseMoveTime = useRef<number>(0);
  const maxScrollDepthRef = useRef<number>(0);

  useEffect(() => {
    if (typeof window === "undefined" || !tenantSlug) return;

    const sessionId = getOrCreateSessionId();
    const currentPath = pagePath || window.location.pathname;

    const flushQueue = () => {
      if (queueRef.current.length === 0) return;

      const eventsToSend = [...queueRef.current];
      queueRef.current = [];

      const payload = {
        tenantSlug,
        sessionId,
        pagePath: currentPath,
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
        events: eventsToSend,
      };

      const payloadStr = JSON.stringify(payload);

      // Usar navigator.sendBeacon si está disponible para no bloquear navegación
      if (navigator.sendBeacon) {
        const blob = new Blob([payloadStr], { type: "application/json" });
        const success = navigator.sendBeacon("/api/analytics/collect", blob);
        if (success) return;
      }

      // Fallback a fetch con keepalive
      fetch("/api/analytics/collect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payloadStr,
        keepalive: true,
      }).catch(() => {
        // Ignorar fallos de red silenciosamente para no afectar al usuario
      });
    };

    // 1. Flush periódico cada 4 segundos si hay eventos
    const intervalId = setInterval(() => {
      if (queueRef.current.length > 0) {
        flushQueue();
      }
    }, 4000);

    // 2. Click Tracking
    const handleClick = (e: MouseEvent) => {
      try {
        const target = e.target as HTMLElement | null;
        if (!target) return;

        const docWidth = Math.max(document.documentElement.scrollWidth, window.innerWidth) || 1;
        const pageX = e.pageX ?? (e.clientX + window.scrollX);
        const pageY = e.pageY ?? (e.clientY + window.scrollY);

        // Coordenada x normalizada relativa al ancho del documento (0 a 1)
        const normX = Math.max(0, Math.min(1, Number((pageX / docWidth).toFixed(4))));
        // Coordenada y en píxeles relativos
        const normY = Math.max(0, Math.round(pageY));

        const tag = target.tagName ? target.tagName.toUpperCase() : "DIV";
        const id = target.id ? `#${target.id}` : "";
        const className = typeof target.className === "string" && target.className.trim()
          ? `.${target.className.trim().split(/\s+/).slice(0, 2).join(".")}`
          : "";
        const selector = `${tag.toLowerCase()}${id}${className}`.slice(0, 100);

        // NUNCA capturar texto de inputs de formulario o campos de contraseña/datos
        const isFormField = ["INPUT", "TEXTAREA", "SELECT", "OPTION"].includes(tag);
        let elementText: string | null = null;

        if (!isFormField && target.innerText) {
          elementText = target.innerText.trim().slice(0, 50);
        }

        const scrollDepth = Math.round(
          ((window.scrollY + window.innerHeight) / Math.max(document.documentElement.scrollHeight, 1)) * 100
        );

        queueRef.current.push({
          eventType: "CLICK",
          x: normX,
          y: normY,
          scrollDepth: Math.min(100, Math.max(0, scrollDepth)),
          elementTag: tag,
          elementSelector: selector,
          elementText,
        });

        if (queueRef.current.length >= 15) {
          flushQueue();
        }
      } catch {
        // Fail-safe
      }
    };

    // 3. Mouse Movement Tracking (Throttled a 1 muestra cada 250ms)
    const handleMouseMove = (e: MouseEvent) => {
      const now = Date.now();
      if (now - lastMouseMoveTime.current < 250) return;
      lastMouseMoveTime.current = now;

      try {
        const docWidth = Math.max(document.documentElement.scrollWidth, window.innerWidth) || 1;
        const pageX = e.pageX ?? (e.clientX + window.scrollX);
        const pageY = e.pageY ?? (e.clientY + window.scrollY);

        const normX = Math.max(0, Math.min(1, Number((pageX / docWidth).toFixed(4))));
        const normY = Math.max(0, Math.round(pageY));

        queueRef.current.push({
          eventType: "MOUSE_MOVE",
          x: normX,
          y: normY,
          scrollDepth: maxScrollDepthRef.current,
        });

        if (queueRef.current.length >= 20) {
          flushQueue();
        }
      } catch {
        // Fail-safe
      }
    };

    // 4. Scroll Tracking (Throttled & umbrales de profundidad)
    const handleScroll = () => {
      try {
        const docHeight = Math.max(document.documentElement.scrollHeight, window.innerHeight) || 1;
        const currentScroll = window.scrollY + window.innerHeight;
        const currentDepth = Math.min(100, Math.max(0, Math.round((currentScroll / docHeight) * 100)));

        if (currentDepth > maxScrollDepthRef.current) {
          maxScrollDepthRef.current = currentDepth;

          // Registrar hito de scroll si superó un nuevo intervalo de 20%
          if (currentDepth % 20 <= 5) {
            queueRef.current.push({
              eventType: "SCROLL",
              x: 0.5,
              y: Math.round(window.scrollY),
              scrollDepth: currentDepth,
            });
          }
        }
      } catch {
        // Fail-safe
      }
    };

    // 5. Enviar eventos acumulados al salir o cambiar de pestaña
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        flushQueue();
      }
    };

    window.addEventListener("click", handleClick, { passive: true });
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("scroll", handleScroll, { passive: true });
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("pagehide", flushQueue);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener("click", handleClick);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("pagehide", flushQueue);
      flushQueue();
    };
  }, [tenantSlug, pagePath]);

  return null;
}
