import DashboardShell from "@/components/dashboard/DashboardShell";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function Layout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/account?next=/dashboard");
  return <DashboardShell user={session}>{children}</DashboardShell>;
}
