import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import AdminShell from "@/components/superadmin/AdminShell";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login?callbackUrl=/admin");
  if (session.role !== "SUPERADMIN") redirect("/dashboard");

  return <AdminShell user={{ email: session.email }}>{children}</AdminShell>;
}
