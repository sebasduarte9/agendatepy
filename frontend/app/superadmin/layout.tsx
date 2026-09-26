import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function SuperadminLayout({ children }: { children: ReactNode }) {
  const session = await getSession();

  if (process.env.NODE_ENV === "production") {
    if (!session || session.role !== "SUPERADMIN") {
      redirect("/login");
    }
  }

  return <>{children}</>;
}
