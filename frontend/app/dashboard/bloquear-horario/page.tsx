"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function BloquearHorarioPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard/nueva-reserva");
  }, [router]);

  return (
    <div className="flex min-h-[50vh] items-center justify-center p-8 text-center text-xs text-slate-400">
      Redirigiendo a Nueva Reserva & Bloqueos...
    </div>
  );
}
