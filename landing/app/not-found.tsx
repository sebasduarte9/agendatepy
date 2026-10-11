import Link from "next/link";
import { AlertCircle, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-6 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-600 mb-4">
        <AlertCircle className="h-7 w-7" />
      </div>
      <h1 className="text-xl font-bold text-slate-900 dark:text-white">
        Página no encontrada (404)
      </h1>
      <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
        La página o el recurso solicitado no existe o fue movido.
      </p>
      <div className="mt-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-2xl bg-brand px-5 py-3 text-xs font-bold text-white shadow-md hover:bg-brand-dark transition"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al Inicio
        </Link>
      </div>
    </main>
  );
}
