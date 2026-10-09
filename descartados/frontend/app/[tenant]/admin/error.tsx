"use client";

export default function AdminError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="px-4 py-10 sm:px-8">
      <h1 className="text-2xl font-bold text-slate-900">No pudimos abrir la agenda</h1>
      <p className="mt-2 text-sm text-slate-600">Reintentá en unos segundos.</p>
      <button
        type="button"
        onClick={reset}
        className="mt-6 h-11 rounded-full bg-brand px-5 text-sm font-semibold text-white"
      >
        Reintentar
      </button>
    </main>
  );
}
