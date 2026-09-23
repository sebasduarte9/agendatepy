"use client";

export default function ReservarError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-4">
      <h1 className="text-2xl font-bold text-slate-900">No pudimos abrir la agenda</h1>
      <p className="mt-2 text-sm text-slate-600">
        Hubo un problema al cargar los servicios de este local.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-6 h-12 rounded-full bg-primary text-sm font-semibold text-white"
      >
        Reintentar
      </button>
    </main>
  );
}
