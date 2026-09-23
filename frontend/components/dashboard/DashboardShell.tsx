"use client";

import type { ReactNode } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import ToastProvider from "./ui/ToastProvider";
import { useDashboardStore } from "@/store/useDashboardStore";

export default function DashboardShell({ children }: { children: ReactNode }) {
  const color = useDashboardStore((s) => s.business.primaryColor);

  return (
    <div
      className="flex min-h-screen bg-[var(--background)]"
      style={{ ["--primary" as string]: color }}
    >
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header />
        <main className="main-content flex-1 p-4 sm:p-6">{children}</main>
      </div>
      <ToastProvider />
    </div>
  );
}
