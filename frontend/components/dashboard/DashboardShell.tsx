"use client";

import { Suspense, useEffect, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import Sidebar from "./Sidebar";
import Header from "./Header";
import MobileTabBar from "./MobileTabBar";
import ToastProvider from "./ui/ToastProvider";
import GuidedTour from "./GuidedTour";
import { useDashboardStore } from "@/store/useDashboardStore";
import DashboardLoading from "@/app/dashboard/loading";

interface DashboardShellProps {
  children: ReactNode;
  initialTenantSlug?: string;
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
  userName,
}: DashboardShellProps) {
  const pathname = usePathname();
  const isCrmRoute = pathname?.startsWith("/dashboard/crm");
  const router = useRouter();
  const color = useDashboardStore((s) => s.business.primaryColor);
  const syncFromDatabase = useDashboardStore((s) => s.syncFromDatabase);
  // Pages read the store, which starts with demo data: wait for the first sync so nobody sees
  // invented numbers (e.g. negative balances) flash before the real ones. Fallback after 8s.
  const isInitialSyncDone = useDashboardStore((s) => s.isInitialSyncDone);
  const [syncTimedOut, setSyncTimedOut] = useState(false);
  useEffect(() => {
    if (isInitialSyncDone) return;
    const timer = setTimeout(() => setSyncTimedOut(true), 8000);
    return () => clearTimeout(timer);
  }, [isInitialSyncDone]);
  const showContent = isInitialSyncDone || syncTimedOut;
  const setBusinessLocal = useDashboardStore((s) => s.setBusinessLocal);
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
      setBusinessLocal({ slug: initialTenantSlug });
      syncFromDatabase(initialTenantSlug);
    } else {
      syncFromDatabase();
    }
  }, [initialTenantSlug, syncFromDatabase, setBusinessLocal, userName, setUserName]);

  useEffect(() => {
    if (typeof document !== "undefined" && color) {
      document.documentElement.style.setProperty("--primary", color);
      document.documentElement.style.setProperty("--color-primary", color);
      document.documentElement.style.setProperty("--primary-rgb", hexToRgb(color));
    }
  }, [color]);

  return (
    <div
      className="relative min-h-dvh font-sans antialiased text-slate-900 dark:text-slate-100 selection:bg-[var(--primary)]/20 overflow-x-clip"
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

      {/* One responsive shell keeps the active page mounted exactly once across breakpoints. */}
      <div className="mobile-dashboard-shell relative z-10 flex h-dvh min-h-0 min-w-0 w-full flex-col gap-2.5 overflow-hidden pl-[calc(env(safe-area-inset-left,0px)+0.625rem)] pr-[calc(env(safe-area-inset-right,0px)+0.625rem)] pt-[calc(5rem+env(safe-area-inset-top,0px))] pb-[calc(4.625rem+env(safe-area-inset-bottom,0px))] lg:h-auto lg:min-h-[calc(100vh-36px)] lg:overflow-visible lg:gap-3.5 lg:pl-[98px] lg:pr-5 lg:py-[18px]">
        <Sidebar variant="rail" />
        <div className="glass-header-bubble w-full shrink-0 z-[60] lg:sticky lg:top-[18px]">
          <Header />
        </div>
        <div className={`glass-app-shell ${isCrmRoute ? "crm-contained-shell" : ""} min-h-0 flex-1 min-w-0 w-full rounded-[22px] lg:rounded-[30px] lg:min-h-[calc(100vh-36px)]`}>
          <main
            className={`main-content min-h-0 flex-1 w-full max-w-full min-w-0 overflow-x-clip overflow-y-auto overscroll-contain p-3.5 sm:p-5 lg:overflow-y-visible lg:p-7 ${
              pathname?.startsWith("/dashboard/caja")
                ? "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                : ""
            }`}
          >
            {showContent ? children : <DashboardLoading />}
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
