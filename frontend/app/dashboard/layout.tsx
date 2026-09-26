import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import DashboardShell from "@/components/dashboard/DashboardShell";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const session = await getSession();

  if (process.env.NODE_ENV === "production" && !session) {
    redirect("/login");
  }

  return <DashboardShell>{children}</DashboardShell>;
}
