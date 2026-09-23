"use client";

import { useEffect } from "react";

const DEFAULT_BASE_URL = "http://localhost:3000";

type ChatwootSdk = {
  run: (options: { websiteToken: string; baseUrl: string }) => void;
};

declare global {
  interface Window {
    chatwootSettings?: {
      hideMessageBubble: boolean;
      position: "left" | "right";
      locale: string;
      type: "standard" | "expanded_bubble";
    };
    chatwootSDK?: ChatwootSdk;
  }
}

export default function ChatwootWidget({ token }: { token: string }) {
  useEffect(() => {
    const baseUrl = chatwootBaseUrl();
    let cancelled = false;

    const boot = () => {
      if (cancelled) return;
      window.chatwootSettings = {
        hideMessageBubble: false,
        position: "right",
        locale: "es",
        type: "standard",
      };

      const start = () => {
        if (cancelled) return;
        window.chatwootSDK?.run({ websiteToken: token, baseUrl });
      };

      const existing = document.getElementById("chatwoot-sdk");
      if (existing) {
        if (window.chatwootSDK) start();
        else existing.addEventListener("load", start, { once: true });
        return;
      }

      const script = document.createElement("script");
      script.id = "chatwoot-sdk";
      script.async = true;
      script.src = `${baseUrl}/packs/js/sdk.js`;
      script.addEventListener("load", start, { once: true });
      document.body.appendChild(script);
    };

    const idleId = window.requestIdleCallback?.(boot, { timeout: 2500 });
    const timeoutId = idleId == null ? window.setTimeout(boot, 1500) : undefined;

    return () => {
      cancelled = true;
      if (idleId != null) window.cancelIdleCallback(idleId);
      if (timeoutId != null) window.clearTimeout(timeoutId);
    };
  }, [token]);

  return null;
}

function chatwootBaseUrl(): string {
  const configured = process.env.NEXT_PUBLIC_CHATWOOT_URL?.trim();
  return (configured || DEFAULT_BASE_URL).replace(/\/$/, "");
}
