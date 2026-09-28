"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SuperadminRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin");
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-300">
      <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-3" />
      <p className="text-sm font-medium">Redirigiendo a Platform Intelligence Center (/admin)...</p>
    </div>
  );
}
