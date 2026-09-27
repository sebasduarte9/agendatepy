import Link from "next/link";
import { Store, ArrowLeft } from "lucide-react";

export default function TenantNotFound() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-6 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 mb-4">
        <Store className="h-7 w-7" />
      </div>
      <h1 className="text-xl font-bold text-slate-900 dark:text-white">
        Negocio no encontrado
      </h1>
      <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
        El enlace de reserva al que intentas acceder no existe, está inactivo o el nombre fue escrito de forma incorrecta.
      </p>
      <div className="mt-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-2xl bg-brand px-5 py-3 text-xs font-bold text-white shadow-md hover:bg-brand-dark transition"
        >
          <ArrowLeft className="h-4 w-4" />
          Ir a AgendatePY
        </Link>
      </div>
    </main>
  );
}
