import { Suspense } from "react";
import DailyAgenda, { AgendaSkeleton } from "@/components/admin/DailyAgenda";

export default async function AdminAgendaPage({
  params,
}: {
  params: Promise<{ tenant: string }>;
}) {
  const { tenant } = await params;

  return (
    <main className="px-4 py-6 sm:px-8 sm:py-8">
      <h1 className="text-2xl font-bold tracking-tight text-slate-900">Agenda de hoy</h1>
      <Suspense fallback={<AgendaSkeleton />}>
        <DailyAgenda slug={tenant} />
      </Suspense>
    </main>
  );
}
