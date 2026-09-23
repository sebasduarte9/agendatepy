"use client";

import type { ReactNode } from "react";
import { CheckCircle2, Clock, Bell } from "lucide-react";
import { useCategory } from "@/context/CategoryContext";
import PhoneMockup from "./PhoneMockup";

export default function WhatsAppShowcase() {
  const { category } = useCategory();

  return (
    <section className="bg-white py-20">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2">
        <div>
          <p className="text-xs font-bold tracking-[0.2em] text-whatsapp">WHATSAPP</p>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Recordatorios automáticos que tus clientes SÍ leen
          </h2>
          <p className="mt-4 text-slate-600">
            Confirmaciones al instante y recordatorios según tu rubro actual:{" "}
            <strong>{category.label}</strong> en {category.businessName}.
          </p>
          <ul className="mt-8 space-y-4">
            <Bullet icon={<CheckCircle2 className="h-5 w-5 text-whatsapp" />}>
              Confirmación inmediata del {category.heroExample.toLowerCase()}.
            </Bullet>
            <Bullet icon={<Clock className="h-5 w-5 text-brand" />}>
              Recordatorio 24hs antes para reprogramar sin drama.
            </Bullet>
            <Bullet icon={<Bell className="h-5 w-5 text-indigo-500" />}>
              Aviso 2hs antes. Hasta 80% menos inasistencias.
            </Bullet>
          </ul>
        </div>
        <PhoneMockup />
      </div>
    </section>
  );
}

function Bullet({
  icon,
  children,
}: {
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <li className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-[#FAFAFB] p-4 text-sm text-slate-700">
      {icon}
      <span>{children}</span>
    </li>
  );
}
