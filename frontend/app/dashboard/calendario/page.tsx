"use client";

import { Suspense } from "react";
import CalendarBoard from "@/components/dashboard/CalendarBoard";

export default function CalendarioPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">Cargando agenda...</div>}>
      <CalendarBoard />
    </Suspense>
  );
}
