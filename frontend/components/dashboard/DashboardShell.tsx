"use client";

import { Suspense, useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import Sidebar from "./Sidebar";
import Header from "./Header";
import MobileTabBar from "./MobileTabBar";
import ToastProvider from "./ui/ToastProvider";
import GuidedTour from "./GuidedTour";
import { useDashboardStore } from "@/store/useDashboardStore";

interface DashboardShellProps {
  children: ReactNode;
  initialTenantSlug?: string;
  initialTenantId?: string;
  userName?: string;
}

function hexToRgb(hex: string): string {
  const clean = hex.replace("#", "");
  if (clean.length === 3) {
    const r = parseInt(clean[0] + clean[0], 16);
    const g = parseInt(clean[1] + clean[1], 16);
    const b = parseInt(clean[2] + clean[2], 16);
    return `${r}, ${g}, ${b}`;
  }
  if (clean.length === 6) {
    const r = parseInt(clean.slice(0, 2), 16);
    const g = parseInt(clean.slice(2, 4), 16);
    const b = parseInt(clean.slice(4, 6), 16);
    return `${r}, ${g}, ${b}`;
  }
  return "255, 79, 43";
}

export default function DashboardShell({
  children,
  initialTenantSlug,
  initialTenantId,
  userName,
}: DashboardShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const color = useDashboardStore((s) => s.business.primaryColor);
  const syncFromDatabase = useDashboardStore((s) => s.syncFromDatabase);
  const updateBusiness = useDashboardStore((s) => s.updateBusiness);
  const setUserName = useDashboardStore((s) => s.setUserName);

  // Background warm-up and compilation of all core routes into browser router cache
  useEffect(() => {
    const routesToWarm = [
      "/dashboard",
      "/dashboard/calendario",
      "/dashboard/caja",
      "/dashboard/clientes",
      "/dashboard/servicios",
      "/dashboard/productos",
      "/dashboard/bloquear-horario",
      "/dashboard/comisiones",
      "/dashboard/equipo",
      "/dashboard/configuracion",
    ];
    routesToWarm.forEach((r) => router.prefetch(r));
  }, [router]);

  useEffect(() => {
    if (userName) {
      setUserName(userName);
    }
    if (initialTenantSlug) {
      updateBusiness({ slug: initialTenantSlug });
      syncFromDatabase(initialTenantSlug);
    } else {
      syncFromDatabase();
    }
  }, [initialTenantSlug, syncFromDatabase, updateBusiness, userName, setUserName]);

  useEffect(() => {
    if (typeof document !== "undefined" && color) {
      document.documentElement.style.setProperty("--primary", color);
      document.documentElement.style.setProperty("--color-primary", color);
      document.documentElement.style.setProperty("--primary-rgb", hexToRgb(color));
    }
  }, [color]);

  return (
    <div
      className="relative min-h-dvh font-sans antialiased text-slate-900 dark:text-slate-100 selection:bg-[var(--primary)]/20 overflow-x-hidden"
      style={{
        ["--primary" as string]: color || "#FF4F2B",
        ["--color-primary" as string]: color || "#FF4F2B",
        ["--primary-rgb" as string]: hexToRgb(color || "#FF4F2B"),
      }}
    >
      {/* 1. Fondo Atmosférico de Color con Animación Continua de Movimiento (Cero Fotos) */}
      <div className="glass-room" aria-hidden="true" />

      {/* 2. Luces Ambientales Orgánicas Flotantes en Movimiento Continuo (GPU Accelerated) */}
      <div className="ambient-scene" aria-hidden="true">
        <div className="ambient-orb ambient-orb-1" />
        <div className="ambient-orb ambient-orb-2" />
        <div className="ambient-orb ambient-orb-3" />
      </div>

      {/* 3. Viewport Desktop: Workspace Flotante con Rail Glass Estático + Burbuja Header Estática + App Shell Envolvente */}
      <div className="relative z-10 hidden lg:flex glass-workspace w-full pl-[98px] pr-4.5 sm:pr-5 py-[18px] flex-col gap-3.5">
        <Sidebar variant="rail" />
        <div className="glass-header-bubble w-full shrink-0 sticky top-[18px] z-[60]">
          <Header />
        </div>
        <div className="glass-app-shell flex-1 min-w-0 w-full">
          <main className="main-content flex-1 w-full max-w-full min-w-0 p-5 lg:p-7 overflow-x-clip">
            {children}
          </main>
        </div>
      </div>

      {/* 4. Viewport Móvil (< lg): Shell Glassmorphic Adaptativo con Burbuja Header */}
      <div className="relative z-10 flex lg:hidden h-dvh min-h-0 min-w-0 flex-col gap-2.5 overflow-hidden pl-[calc(env(safe-area-inset-left,0px)+0.625rem)] pr-[calc(env(safe-area-inset-right,0px)+0.625rem)] pt-[calc(5rem+env(safe-area-inset-top,0px))] pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))]">
        <div className="glass-header-bubble w-full shrink-0 z-[60]">
          <Header />
        </div>
        <div className="glass-app-shell min-h-0 flex-1 min-w-0 rounded-[22px]">
          <main
            className={`main-content min-h-0 flex-1 w-full max-w-full min-w-0 overflow-x-clip overflow-y-auto overscroll-contain p-3.5 sm:p-5 ${
              pathname?.startsWith("/dashboard/caja")
                ? "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                : ""
            }`}
          >
            {children}
          </main>
        </div>
        <MobileTabBar />
        <Sidebar variant="drawer" />
      </div>

      <Suspense fallback={null}>
        <GuidedTour />
      </Suspense>
      <ToastProvider />
    </div>
  );
}
