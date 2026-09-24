"use client";

import { useState } from "react";
import { Copy, Pencil, Trash2, Scissors, Sparkles } from "lucide-react";
import { useDashboardStore } from "@/store/useDashboardStore";
import Card from "@/components/dashboard/ui/Card";
import { formatGs } from "@/lib/dashboard-dates";

export default function ServiciosPage() {
  const { services, staff, removeService, toggleStaff, pushToast, business } =
    useDashboardStore();
  const [tab, setTab] = useState<"servicios" | "personal">("servicios");

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">Catálogo</h1>
      <div className="flex gap-2 rounded-xl border border-border p-1 w-fit">
        {(["servicios", "personal"] as const).map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setTab(item)}
            className={`rounded-lg px-4 py-1.5 text-sm capitalize ${
              tab === item ? "bg-primary text-white" : "text-slate-600"
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      {tab === "servicios" && (
        <div className="grid gap-4 md:grid-cols-2">
          {services.map((item) => (
            <Card key={item.id} className="flex gap-4 items-start">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                {item.image === "scissors" ? (
                  <Scissors className="h-6 w-6" />
                ) : (
                  <Sparkles className="h-6 w-6" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-bold">{item.name}</p>
                <p className="text-sm text-slate-500">{item.description}</p>
                <p className="mt-1 text-sm font-semibold text-primary">
                  {item.durationMin} min · {formatGs(item.price)}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1 text-xs"
                    onClick={async () => {
                      const url = `${window.location.origin}/${business.slug || "barberia"}/reservar?service=${item.id}`;
                      await navigator.clipboard.writeText(url);
                      pushToast("success", "Enlace de reserva copiado al portapapeles");
                    }}
                  >
                    <Copy className="h-3 w-3" /> Compartir
                  </button>
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1 text-xs"
                    onClick={() => pushToast("success", "Edición demo")}
                  >
                    <Pencil className="h-3 w-3" /> Editar
                  </button>
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 rounded-full border border-rose-200 px-3 py-1 text-xs text-rose-600"
                    onClick={() => {
                      removeService(item.id);
                      pushToast("success", "Servicio eliminado");
                    }}
                  >
                    <Trash2 className="h-3 w-3" /> Eliminar
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {tab === "personal" && (
        <div className="grid gap-4 md:grid-cols-2">
          {staff.map((person) => (
            <Card key={person.id} className="flex items-start gap-3">
              <span
                className="flex h-12 w-12 items-center justify-center rounded-full text-sm font-bold text-white"
                style={{ background: person.color }}
              >
                {person.avatar}
              </span>
              <div className="flex-1">
                <p className="font-bold">{person.name}</p>
                <p className="text-sm text-slate-500">{person.description}</p>
                <button
                  type="button"
                  onClick={() => toggleStaff(person.id)}
                  className={`mt-2 rounded-full px-3 py-1 text-xs font-semibold ${
                    person.active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {person.active ? "Activo" : "Inactivo"}
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
