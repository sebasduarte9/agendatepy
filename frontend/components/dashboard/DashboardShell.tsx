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
    }
  }, [color]);

  return (
    <div
      className="flex min-h-screen bg-[var(--background)] font-sans antialiased text-slate-900 dark:text-slate-100"
      style={{
        ["--primary" as string]: color || "#FF4F2B",
        ["--color-primary" as string]: color || "#FF4F2B",
      }}
    >
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col overflow-x-clip">
        <Header />
        <main className="main-content flex-1 w-full max-w-full min-w-0 overflow-x-clip p-3.5 sm:p-6 pb-[calc(7rem+env(safe-area-inset-bottom,20px))] sm:pb-32 lg:pb-8">
          {children}
        </main>
      </div>
      <MobileTabBar />
      <Suspense fallback={null}>
        <GuidedTour />
      </Suspense>
      <ToastProvider />
    </div>
  );
}
