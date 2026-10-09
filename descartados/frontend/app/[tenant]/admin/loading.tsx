import { AgendaSkeleton } from "@/components/admin/DailyAgenda";

export default function AdminLoading() {
  return (
    <main className="px-4 py-6 sm:px-8 sm:py-8">
      <div className="h-8 w-48 animate-pulse rounded-xl bg-white" />
      <AgendaSkeleton />
    </main>
  );
}
